import { Suite } from 'sarg';
import FileGenerator, {
  UnsupportedTemplate,
} from '../code-generator/FileGenerator';
import path from 'path';
import fs from 'fs';
import { TextEncoder, TextDecoder } from 'util';
import assert from 'assert';
import { NodeType } from '../src/ASTGenerator';

const suite = new Suite();

// async function generateWithVirtualFs({
//   mainFile,
//   paths,
// }: {
//   mainFile: string;
//   paths: Record<string, string>;
// }) {
//   const tmpDir = await fs.promises.mkdtemp('/tmp/');
//   const outTmpDir = await fs.promises.mkdtemp('/tmp/');
//   for (const [k, v] of Object.entries(paths)) {
//     await fs.promises.writeFile(path.resolve(tmpDir, k), v);
//   }
//   const f = new FileGenerator(
//     {
//       path: path.resolve(tmpDir, mainFile),
//     },
//     {
//       rootDir: tmpDir,
//       outDir: outTmpDir,
//       indentationSize: 2,
//       typeScriptConfiguration: {
//         extends: '../tsconfig.base.json',
//       },
//       textDecoder: new TextDecoder(),
//       textEncoder: new TextEncoder(),
//     }
//   );
//   return f.generate();
// }

// suite.test('it should deal with conflicting compare functions', async () => {
//   await generateWithVirtualFs({
//     paths: {
//       'index':''
//     },
//     mainFile: 'index'
//   })
// })

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

suite.test('FileGenerator: it should generate files', async () => {
  const outDir = path.resolve(__dirname, '../out');
  const mainFile = path.resolve(__dirname, 'schema');
  const f = new FileGenerator(
    {
      path: mainFile,
    },
    {
      rootDir: __dirname,
      outDir,
      indentationSize: 2,
      typeScriptConfiguration: {
        extends: '../tsconfig.base.json',
      },
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    }
  );
  await fs.promises.rm(outDir, { force: true, recursive: true });
  await fs.promises.mkdir(outDir);
  try {
    const files = await f.generate();
    for (const file of files) {
      const outFile = path.resolve(outDir, file.file);
      try {
        await fs.promises.access(path.dirname(outFile), fs.constants.W_OK);
      } catch (reason) {
        await fs.promises.mkdir(path.dirname(outFile));
      }
      await fs.promises.writeFile(outFile, file.contents);
    }
  } catch (reason) {
    console.log(reason);
  }
});

export default suite;
