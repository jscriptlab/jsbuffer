import path from 'path';
import fs from 'fs';
import * as glob from 'glob';
import { FileGenerator } from '../code-generator';
import { spawn } from 'child-process-utilities';

export async function generateWithVirtualFs({
  mainFile,
  paths,
  packageInfo,
  additionalFileGeneratorOptions = {},
}: {
  mainFile: string;
  packageInfo?: {
    name: string;
    version: string;
  };
  additionalFileGeneratorOptions?: Partial<{
    externalModules: Partial<{
      outFolders: Map<string, string>;
      nodeModulesFolder: string;
    }>;
  }>;
  paths: Record<string, string>;
}) {
  const rootDir = await fs.promises.mkdtemp('/tmp/');
  const outDir = path.resolve(rootDir, '__compiled__');

  await fs.promises.mkdir(outDir);

  for (const [k, v] of Object.entries(paths)) {
    const resolvedFilePath = path.resolve(rootDir, k);
    await fs.promises.mkdir(path.dirname(resolvedFilePath), {
      recursive: true,
    });
    await fs.promises.writeFile(resolvedFilePath, v);
  }
  const fileGenerator = new FileGenerator(
    {
      path: path.resolve(rootDir, mainFile),
    },
    {
      compilerOptions: { rootDir },
      root: null,
      // outDir: outDir,
      ...additionalFileGeneratorOptions,
      indentationSize: 2,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      externalModules: {
        outFolders: new Map(),
        nodeModulesFolder: path.resolve(rootDir, 'node_modules'),
        ...(additionalFileGeneratorOptions.externalModules ?? {}),
      },
    }
  );
  const compileTypeScriptProject = async () => {
    await spawn('npx', ['tsc'], {
      cwd: outDir,
    }).wait();
    return {
      tgzFiles: glob.sync(path.resolve(rootDir, '*.tgz')),
    };
  };
  const generateAndCreateFiles = async () => {
    for (const f of await fileGenerator.generate()) {
      const resolvedFilePath = path.resolve(outDir, f.path);
      await fs.promises.mkdir(path.dirname(resolvedFilePath), {
        recursive: true,
      });
      await fs.promises.writeFile(resolvedFilePath, f.contents);
    }
  };
  const test = async () => {
    await generateAndCreateFiles();
    await compileTypeScriptProject();
  };
  /**
   * install typescript
   */
  await spawn('npm', ['install', '--save-dev', 'typescript@5.x'], {
    cwd: rootDir,
  }).wait();
  if (packageInfo) {
    /**
     * create package.json
     */
    await fs.promises.writeFile(
      path.resolve(rootDir, 'package.json'),
      JSON.stringify(packageInfo, null, 4)
    );
  }
  const pack = () =>
    spawn('npm', ['pack'], {
      cwd: rootDir,
    }).wait();
  return {
    test,
    pack,
    /**
     * generate files using FileGenerator class
     */
    generateAndCreateFiles,
    compileTypeScriptProject,
    fileGenerator,
    rootDir: rootDir,
    outDir: outDir,
  };
}
