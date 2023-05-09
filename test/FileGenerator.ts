import { Suite } from 'sarg';
import FileGenerator, {
  TypeNotFound,
  UnsupportedTemplate,
} from '../code-generator/FileGenerator';
import path from 'path';
import fs from 'fs';
import { TextEncoder, TextDecoder } from 'util';
import assert from 'assert';
import { NodeType } from '../src/ASTGenerator';

const suite = new Suite();

async function generateWithVirtualFs({
  mainFile,
  paths,
}: {
  mainFile: string;
  paths: Record<string, string>;
}) {
  const tmpDir = await fs.promises.mkdtemp('/tmp/');
  const outTmpDir = await fs.promises.mkdtemp('/tmp/');
  for (const [k, v] of Object.entries(paths)) {
    await fs.promises.writeFile(path.resolve(tmpDir, k), v);
  }
  const f = new FileGenerator(
    {
      path: path.resolve(tmpDir, mainFile),
    },
    {
      rootDir: tmpDir,
      outDir: outTmpDir,
      indentationSize: 2,
      typeScriptConfiguration: {
        extends: '../tsconfig.base.json',
      },
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    }
  );
  return f.generate();
}

suite.test('it should not allow importing of unexported traits', async () => {
  try {
    await generateWithVirtualFs({
      paths: {
        index: ['import {result} from "./trait";', 'type A { result a; }'].join(
          '\n'
        ),
        trait: ['trait result {}', 'type B : result { int a; }'].join('\n'),
      },
      mainFile: 'index',
    });
    assert.strict.ok(false);
  } catch (reason) {
    assert.strict.ok(reason instanceof TypeNotFound);
  }
});

suite.test('it should support comments before types', async () => {
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
  });
});

suite.test('it should not allow importing of unexported types', async () => {
  try {
    await generateWithVirtualFs({
      paths: {
        index: ['import {result} from "./trait";', 'type A { result a; }'].join(
          '\n'
        ),
        trait: ['type result { int x; }'].join('\n'),
      },
      mainFile: 'index',
    });
    assert.strict.ok(false);
  } catch (reason) {
    assert.strict.ok(reason instanceof TypeNotFound);
  }
});

suite.test('it should throw for unsupported templates', async () => {
  const tmpDir = await fs.promises.mkdtemp('/tmp/');
  const outTmpDir = await fs.promises.mkdtemp('/tmp/');
  const tmpFile = path.resolve(tmpDir, 'file');
  await fs.promises.writeFile(
    tmpFile,
    'type unsupportedTemplate { unsupported_template<int> a; }'
  );
  const f = new FileGenerator(
    {
      path: tmpFile,
    },
    {
      rootDir: tmpDir,
      outDir: outTmpDir,
      indentationSize: 2,
      typeScriptConfiguration: {
        extends: '../tsconfig.base.json',
      },
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    }
  );
  try {
    await f.generate();
  } catch (reason) {
    assert.strict.ok(reason instanceof UnsupportedTemplate);
    assert.strict.ok(reason.node.type === NodeType.TemplateExpression);
    assert.strict.ok(reason.node.name.value === 'unsupported_template');
  }
});

export default suite;
