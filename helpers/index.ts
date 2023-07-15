import path from 'path';
import fs from 'fs';
import * as glob from 'glob';
import { FileGenerator } from '../code-generator';
import { spawn } from 'child-process-utilities';

export async function generateWithVirtualFs({
  mainFile,
  paths,
  packageInfo = {},
  additionalFileGeneratorOptions = {},
}: {
  mainFile: string;
  packageInfo?: Record<string, unknown>;
  additionalFileGeneratorOptions?: Partial<{
    externalModules: Partial<{
      outFolders: Map<string, string>;
      nodeModulesFolder: string;
    }>;
  }>;
  paths: Record<string, string>;
}) {
  const rootDir = await fs.promises.mkdtemp('/tmp/jsbuffer-');
  const outDir = path.resolve(rootDir, '__compiled__');

  console.log('creating virtual project at: %s', rootDir);

  paths = {
    'jsbufferconfig.json': JSON.stringify(
      {
        outDir: path.relative(rootDir, outDir),
        mainFile: path.relative(rootDir, path.resolve(rootDir, mainFile)),
      },
      null,
      2
    ),
    ...paths,
  };

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
      ...additionalFileGeneratorOptions,
      typeScriptConfiguration: {
        compilerOptions: {
          strict: true,
          declaration: true,
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
    files: [...Object.keys(paths), '__compiled__/**/*.{js,d.ts}'],
    ...packageInfo,
  };
  await fs.promises.writeFile(
    path.resolve(rootDir, 'package.json'),
    JSON.stringify(packageInfo, null, 4)
  );
  /**
   * install typescript package
   */
  await spawn('npm', ['install', '--save-dev', 'typescript@5.x'], {
    cwd: rootDir,
  }).wait();
  const pack = () =>
    spawn('npm', ['pack'], {
      cwd: rootDir,
    }).wait();
  const test = async () => {
    /**
     * generate and create files using the code generator
     */
    await fileGenerator.generate();
    /**
     * compile typescript project
     */
    await spawn('npx', ['tsc'], {
      cwd: outDir,
    }).wait();
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
  return {
    test,
    pack,
    fileGenerator,
    rootDir: rootDir,
    outDir: outDir,
  };
}
