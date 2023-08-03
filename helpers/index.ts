import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import * as glob from 'glob';
import { FileGenerator } from '../code-generator';
import { spawn } from 'child-process-utilities';
import assert from 'assert';
import SchemaTestCodeGenerator from './SchemaTestCodeGenerator';

export async function generateWithVirtualFs({
  mainFile,
  paths,
  runScript,
  packageInfo = {},
}: {
  mainFile: string;
  packageInfo?: Record<string, unknown>;
  runScript?: string;
  paths: Record<string, string>;
}) {
  const outDirBaseName = '__compiled__';
  const tmpFolder = path.resolve(__dirname, '../node_modules/.cache/jsbuffer');
  try {
    await fs.promises.access(tmpFolder, fs.constants.W_OK | fs.constants.R_OK);
    assert.strict.ok((await fs.promises.stat(tmpFolder)).isDirectory());
  } catch (reason) {
    await fs.promises.mkdir(tmpFolder, {
      recursive: true,
    });
  }
  const rootDir = await fs.promises.mkdtemp(
    path.resolve(tmpFolder, 'jsbuffer-')
  );
  const outDir = path.resolve(rootDir, outDirBaseName);

  paths = {
    'jsbufferconfig.json': JSON.stringify(
      {
        outDir: path.relative(rootDir, outDir),
        mainFile: path.relative(rootDir, path.resolve(rootDir, mainFile)),
      },
      null,
      2
    ),
    '.nycrc': JSON.stringify(
      {
        all: true,
      },
      null,
      2
    ),
    ...paths,
  };

  const internalTestFile = path.resolve(
    rootDir,
    `test-${crypto.randomBytes(8).toString('hex')}.js`
  );
  const schemaTestGenerator = new SchemaTestCodeGenerator({
    outFile: internalTestFile,
    indentationSize: 2,
  });

  const runCommand = (command: string, args: string[]) =>
    spawn(command, args, {
      cwd: rootDir,
    }).wait();
  const pack = () => runCommand('npm', ['pack']);
  const test = async () => {
    /**
     * generate and create files using the code generator
     */
    await fileGenerator.generate();

    /**
     * compile typescript project
     */
    await runCommand('npx', [
      'tsc',
      '--project',
      path.join(outDirBaseName, 'tsconfig.json'),
    ]);

    // TODO: maybe remove this option
    if (typeof runScript !== 'undefined') {
      await runCommand('node', [runScript]);
    }

    /**
     * we can generate tests right away
     */
    await schemaTestGenerator.generate(
      path.resolve(rootDir, 'jsbufferconfig.json')
    );

    await runCommand('node', [internalTestFile]);
    await runCommand('npx', ['nyc', 'node', internalTestFile]);
    await runCommand('npx', ['nyc', 'check-coverage']);
    /**
     * pack the package into .tgz file
     */
    await pack();
    /**
     * return .tgz files
     */
    return {
      tgzFiles: glob.sync(path.resolve(rootDir, '*.tgz')),
    };
  };

  const installPackages = (packageNames: string[]) =>
    runCommand('npm', ['install', '--save', ...packageNames]);

  /**
   * create all files described in `paths` object
   */
  {
    await fs.promises.mkdir(outDir);

    for (const [k, v] of Object.entries(paths)) {
      const resolvedFilePath = path.resolve(rootDir, k);
      await fs.promises.mkdir(path.dirname(resolvedFilePath), {
        recursive: true,
      });
      await fs.promises.writeFile(resolvedFilePath, v);
    }
  }

  const fileGenerator = new FileGenerator(
    {
      path: path.resolve(rootDir, mainFile),
    },
    {
      compilerOptions: {
        rootDir,
        outDir,
      },
      root: null,
      indentationSize: 2,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      typeScriptConfiguration: {
        compilerOptions: {
          esModuleInterop: true,
          strict: true,
          declaration: true,
          target: 'ESNext',
          module: 'CommonJS',
        },
      },
    }
  );
  /**
   * create package.json
   */
  packageInfo = {
    name: path.basename(rootDir),
    version: '0.0.1',
    files: [...Object.keys(paths), '__compiled__/**/*.{js,d.ts,json}'],
    ...packageInfo,
  };
  await fs.promises.writeFile(
    path.resolve(rootDir, 'package.json'),
    JSON.stringify(packageInfo, null, 4)
  );

  /**
   * install typescript package
   */
  await runCommand('npm', [
    'install',
    '--save-dev',
    'jsbuffer@0.x',
    'typescript@5.x',
    'nyc@15.x',
  ]);
  return {
    test,
    installPackages,
    pack,
    fileGenerator,
    rootDir: rootDir,
    outDir: outDir,
  };
}
