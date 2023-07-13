import { Suite } from 'sarg';
import path from 'path';
import assert from 'assert';
import { generateWithVirtualFs } from '../helpers';

const suite = new Suite();

suite.test(
  'it should allow importing external schemas when file is being imported from inside a folder',
  async () => {
    const externalModule = await generateWithVirtualFs({
      packageInfo: {
        name: 'v',
        version: '0.0.1',
      },
      paths: {
        'schema/a': 'export type A { int id1; }',
        'schema/b': 'export type B { int id2; }',
        'schema/main': ['import "./a";', 'import "./b";'].join('\n'),
      },
      mainFile: 'schema/main',
    });

    await externalModule.generateAndCreateFiles();
    await externalModule.pack();
    const { tgzFiles: externalModuleTgzFiles } =
      await externalModule.compileTypeScriptProject();

    const virtualProject = await generateWithVirtualFs({
      paths: {
        'src/index': [
          'import { A } from "v/schema/a";',
          'import { B } from "v/schema/b";',
          ['type C {', 'A a;', 'B b;', '}'].join('\n'),
        ].join('\n'),
      },
      additionalFileGeneratorOptions: {
        externalModules: {
          outFolders: new Map([['v', '__compiled__']]),
        },
      },
      mainFile: 'src/index',
    });

    assert.strict.ok(externalModuleTgzFiles.length > 0);

    await spawn('npm', ['install', '--save', ...externalModuleTgzFiles], {
      cwd: virtualProject.rootDir,
    });

    await virtualProject.generateAndCreateFiles();
    await virtualProject.compileTypeScriptProject();
  }
);

suite.test(
  'it should allow namespaced node_modules external schemas even if schema source files come from inside a folder',
  async () => {
    const externalModule = await generateWithVirtualFs({
      packageInfo: {
        name: '@a/v',
        version: '0.0.1',
      },
      paths: {
        'schema/users/User': 'export type User { int id; }',
        'schema/a': 'export type A { int id1; }',
        'schema/b': 'export type B { int id2; }',
        'schema/main': [
          'import "./a";',
          'import "./b";',
          'import"./users/User";',
        ].join('\n'),
      },
      mainFile: 'schema/main',
    });

    await externalModule.generateAndCreateFiles();
    await externalModule.pack();
    const { tgzFiles: externalModuleTgzFiles } =
      await externalModule.compileTypeScriptProject();

    const virtualProject = await generateWithVirtualFs({
      paths: {
        'schema/src/index': [
          'import { A } from "@a/v/schema/a";',
          'import { B } from "@a/v/schema/b";',
          'import { User } from "@a/v/schema/users/User";',
          ['type C {', 'User user;', 'A a;', 'B b;', '}'].join('\n'),
        ].join('\n'),
      },
      additionalFileGeneratorOptions: {
        externalModules: {
          outFolders: new Map([['@a/v', '__compiled__']]),
        },
      },
      mainFile: 'schema/src/index',
    });

    assert.strict.ok(externalModuleTgzFiles.length > 0);

    await spawn('npm', ['install', '--save', ...externalModuleTgzFiles], {
      cwd: virtualProject.rootDir,
    });

    await virtualProject.generateAndCreateFiles();
    await virtualProject.compileTypeScriptProject();

    await spawn(
      'npx',
      [
        'ts-node',
        path.resolve(__dirname, '../cli'),
        path.resolve(virtualProject.rootDir, 'schema/src/index'),
        '-o',
        virtualProject.outDir,
        '--external',
        '@a/v:__compiled__',
        '--node-modules-folder',
        path.resolve(virtualProject.rootDir, 'node_modules'),
      ],
      {
        env: {
          ...process.env,
          TS_NODE_PROJECT: path.resolve(__dirname, '../cli/tsconfig.json'),
        },
      }
    );
  }
);

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
        externalModules: {
          outFolders: new Map([['@a/v', '__compiled__']]),
        },
      },
      mainFile: 'index',
    });

    assert.strict.ok(externalModuleTgzFiles.length > 0);

    await spawn('npm', ['install', '--save', ...externalModuleTgzFiles], {
      cwd: virtualProject.rootDir,
    });

    await virtualProject.generateAndCreateFiles();
    await virtualProject.compileTypeScriptProject();

    await spawn(
      'npx',
      [
        'ts-node',
        path.resolve(__dirname, '../cli'),
        path.resolve(virtualProject.rootDir, 'index'),
        '-o',
        virtualProject.outDir,
        '--external',
        '@a/v:__compiled__',
        '--node-modules-folder',
        path.resolve(virtualProject.rootDir, 'node_modules'),
      ],
      {
        env: {
          ...process.env,
          TS_NODE_PROJECT: path.resolve(__dirname, '../cli/tsconfig.json'),
        },
      }
    );
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
      externalModules: {
        outFolders: new Map([['v', '__compiled__']]),
      },
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
