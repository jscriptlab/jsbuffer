import { Suite } from 'sarg';
import FileGenerator, {
  IFileGeneratorOptions,
} from '../code-generator/FileGenerator';
import path from 'path';
import * as glob from 'glob';
import fs from 'fs';
import { TextEncoder, TextDecoder } from 'util';
import assert from 'assert';

const suite = new Suite();

async function spawn(
  cmd: string,
  args: string[] = [],
  options: import('child_process').SpawnOptionsWithoutStdio = {}
) {
  console.log('$ %s %s', cmd, args.join(' '));
  const child_process = await import('child_process');
  await new Promise<void>((resolve, reject) => {
    child_process
      .spawn(cmd, args, {
        stdio: 'inherit',
        ...options,
      })
      .on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`process exited with: ${code}`));
        }
      });
  });
}

async function generateWithVirtualFs({
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
  additionalFileGeneratorOptions?: Partial<IFileGeneratorOptions>;
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
      rootDir: rootDir,
      outDir: outDir,
      indentationSize: 2,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      ...additionalFileGeneratorOptions,
    }
  );
  const compileTypeScriptProject = async () => {
    await spawn('npx', ['tsc'], {
      cwd: outDir,
    });
    return {
      tgzFiles: glob.sync(path.resolve(rootDir, '*.tgz')),
    };
  };
  const generateAndCreateFiles = async () => {
    for (const f of await fileGenerator.generate()) {
      const resolvedFilePath = path.resolve(outDir, f.file);
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
  });
  if (packageInfo) {
    /**
     * create package.json
     */
    await fs.promises.writeFile(
      path.resolve(rootDir, 'package.json'),
      JSON.stringify(packageInfo, null, 4)
    );
  }
  const pack = async () => {
    await spawn('npm', ['pack'], {
      cwd: rootDir,
    });
  };
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

suite.test(
  'it should allow namespaced node_modules external schemas',
  async () => {
    const externalModule = await generateWithVirtualFs({
      packageInfo: {
        name: '@a/v',
        version: '0.0.1',
      },
      paths: {
        'users/User': 'export type User { int id; }',
        a: 'export type A { int id1; }',
        b: 'export type B { int id2; }',
        main: ['import "./a";', 'import "./b";', 'import"./users/User";'].join(
          '\n'
        ),
      },
      mainFile: 'main',
    });

    await externalModule.generateAndCreateFiles();
    await externalModule.pack();
    const { tgzFiles: externalModuleTgzFiles } =
      await externalModule.compileTypeScriptProject();

    const virtualProject = await generateWithVirtualFs({
      paths: {
        index: [
          'import { A } from "@a/v/a";',
          'import { B } from "@a/v/b";',
          'import { User } from "@a/v/users/User";',
          ['type C {', 'User user;', 'A a;', 'B b;', '}'].join('\n'),
        ].join('\n'),
      },
      additionalFileGeneratorOptions: {
        outFolders: new Map([['@a/v', '__compiled__']]),
      },
      mainFile: 'index',
    });

    assert.strict.ok(externalModuleTgzFiles.length > 0);

    await spawn('npm', ['install', '--save', ...externalModuleTgzFiles], {
      cwd: virtualProject.rootDir,
    });

    await virtualProject.generateAndCreateFiles();
    await virtualProject.compileTypeScriptProject();
  }
);

suite.test('it should allow importing external schemas', async () => {
  const externalModule = await generateWithVirtualFs({
    packageInfo: {
      name: 'v',
      version: '0.0.1',
    },
    paths: {
      a: 'export type A { int id1; }',
      b: 'export type B { int id2; }',
      main: ['import "./a";', 'import "./b";'].join('\n'),
    },
    mainFile: 'main',
  });

  await externalModule.generateAndCreateFiles();
  await externalModule.pack();
  const { tgzFiles: externalModuleTgzFiles } =
    await externalModule.compileTypeScriptProject();

  const virtualProject = await generateWithVirtualFs({
    paths: {
      index: [
        'import { A } from "v/a";',
        'import { B } from "v/b";',
        ['type C {', 'A a;', 'B b;', '}'].join('\n'),
      ].join('\n'),
    },
    additionalFileGeneratorOptions: {
      outFolders: new Map([['v', '__compiled__']]),
    },
    mainFile: 'index',
  });

  assert.strict.ok(externalModuleTgzFiles.length > 0);

  await spawn('npm', ['install', '--save', ...externalModuleTgzFiles], {
    cwd: virtualProject.rootDir,
  });

  await virtualProject.generateAndCreateFiles();
  await virtualProject.compileTypeScriptProject();
});

suite.test('it should not allow importing of unexported traits', async () => {
  await assert.strict.rejects(async () => {
    await (
      await generateWithVirtualFs({
        paths: {
          index: [
            'import {result} from "./trait";',
            'type A { result a; }',
          ].join('\n'),
          trait: ['trait result {}', 'type B : result { int a; }'].join('\n'),
        },
        mainFile: 'index',
      })
    ).fileGenerator.generate();
  });
});

suite.test('it should support comments before types', async () => {
  (
    await generateWithVirtualFs({
      paths: {
        index: [
          '// comment 1 before type',
          'type A{}',
          '// comment 2 before type',
          'type B{}',
        ].join('\n'),
      },
      mainFile: 'index',
    })
  ).test();
});

suite.test('it should not allow importing of unexported types', async () => {
  await assert.strict.rejects(async () => {
    await (
      await generateWithVirtualFs({
        paths: {
          index: [
            'import {result} from "./trait";',
            'type A { result a; }',
          ].join('\n'),
          trait: ['type result { int x; }'].join('\n'),
        },
        mainFile: 'index',
      })
    ).fileGenerator.generate();
  });
});

suite.test('it should throw for unsupported templates', async () => {
  await assert.strict.rejects(async () => {
    await (
      await generateWithVirtualFs({
        mainFile: 'index',
        paths: {
          index: 'type unsupportedTemplate { unsupported_template<int> a; }',
        },
      })
    ).fileGenerator.generate();
  });
});

export default suite;
