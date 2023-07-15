import { Suite } from 'sarg';
import assert from 'assert';
import { generateWithVirtualFs } from '../helpers';
import { Exception, spawn } from 'child-process-utilities';

const suite = new Suite();

function checkException(fn: () => Promise<void>) {
  return async () => {
    try {
      await fn();
    } catch (reason) {
      console.log(reason);
      if (reason instanceof Exception) {
        console.log(reason, reason.constructor);
      }
      throw reason;
    }
  };
}

suite.test(
  'it should allow importing external schemas in a cascading format',
  checkException(async () => {
    const module1 = await (
      await generateWithVirtualFs({
        packageInfo: {
          name: 'a',
          version: '0.0.1',
        },
        paths: {
          'schema/main': ['export type A { int id; }'].join('\n'),
        },
        mainFile: 'schema/main',
      })
    ).test();

    const module2 = await generateWithVirtualFs({
      packageInfo: {
        name: 'b',
        version: '0.0.1',
      },
      paths: {
        'schema/main': [
          'import { A } from "a/schema/main";',
          'export type B {A id;}',
        ].join('\n'),
      },
      mainFile: 'schema/main',
    });

    await spawn('npm', ['install', ...module1.tgzFiles], {
      cwd: module2.rootDir,
    }).wait();

    const { tgzFiles } = await module2.test();

    const module3 = await generateWithVirtualFs({
      packageInfo: {
        name: 'c',
        version: '0.0.1',
      },
      paths: {
        'schema/main': [
          'import { B } from "b/schema/main";',
          'export type C { int id; B b; }',
        ].join('\n'),
      },
      mainFile: 'schema/main',
    });

    await spawn('npm', ['install', ...tgzFiles], {
      cwd: module3.rootDir,
    }).wait();

    await module3.test();
  })
);

suite.test(
  'it should allow importing external schemas when file is being imported from inside a folder',
  checkException(async () => {
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

    const { tgzFiles: externalModuleTgzFiles } = await externalModule.test();

    const virtualProject = await generateWithVirtualFs({
      paths: {
        'src/index': [
          'import { A } from "v/schema/a";',
          'import { B } from "v/schema/b";',
          ['type C {', 'A a;', 'B b;', '}'].join('\n'),
        ].join('\n'),
      },
      mainFile: 'src/index',
    });

    assert.strict.ok(externalModuleTgzFiles.length > 0);

    await spawn('npm', ['install', '--save', ...externalModuleTgzFiles], {
      cwd: virtualProject.rootDir,
    }).wait();

    await virtualProject.test();
  })
);

suite.test(
  'it should allow namespaced node_modules external schemas even if schema source files come from inside a folder',
  async () => {
    const externalModule = await generateWithVirtualFs({
      packageInfo: {
        name: '@a/v',
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

    const { tgzFiles: externalModuleTgzFiles } = await externalModule.test();

    const virtualProject = await generateWithVirtualFs({
      paths: {
        'schema/src/index': [
          'import { A } from "@a/v/schema/a";',
          'import { B } from "@a/v/schema/b";',
          'import { User } from "@a/v/schema/users/User";',
          ['type C {', 'User user;', 'A a;', 'B b;', '}'].join('\n'),
        ].join('\n'),
      },
      mainFile: 'schema/src/index',
    });

    assert.strict.ok(externalModuleTgzFiles.length > 0);

    await spawn('npm', ['install', '--save', ...externalModuleTgzFiles], {
      cwd: virtualProject.rootDir,
    }).wait();

    await virtualProject.test();
  }
);

suite.test(
  'it should allow namespaced node_modules external schemas',
  async () => {
    const externalModule = await generateWithVirtualFs({
      packageInfo: {
        name: '@a/v',
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

    const { tgzFiles: externalModuleTgzFiles } = await externalModule.test();

    const virtualProject = await generateWithVirtualFs({
      paths: {
        index: [
          'import { A } from "@a/v/a";',
          'import { B } from "@a/v/b";',
          'import { User } from "@a/v/users/User";',
          ['type C {', 'User user;', 'A a;', 'B b;', '}'].join('\n'),
        ].join('\n'),
      },
      mainFile: 'index',
    });

    assert.strict.ok(externalModuleTgzFiles.length > 0);

    await spawn('npm', ['install', '--save', ...externalModuleTgzFiles], {
      cwd: virtualProject.rootDir,
    }).wait();

    await virtualProject.test();
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

  const { tgzFiles: externalModuleTgzFiles } = await externalModule.test();

  const virtualProject = await generateWithVirtualFs({
    paths: {
      index: [
        'import { A } from "v/a";',
        'import { B } from "v/b";',
        ['type C {', 'A a;', 'B b;', '}'].join('\n'),
      ].join('\n'),
    },
    mainFile: 'index',
  });

  assert.strict.ok(externalModuleTgzFiles.length > 0);

  await spawn('npm', ['install', '--save', ...externalModuleTgzFiles], {
    cwd: virtualProject.rootDir,
  }).wait();

  await virtualProject.test();
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
