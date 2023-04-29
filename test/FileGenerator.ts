import { Suite } from 'sarg';
import FileGenerator, { IOutputFile } from '../code-generator/FileGenerator';
import path from 'path';
import fs from 'fs';
import { TextEncoder, TextDecoder } from 'util';

const suite = new Suite();

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
        compilerOptions: {
          noUncheckedIndexedAccess: false,
        },
        extends: '../tsconfig.base.json',
      },
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    }
  );
  await fs.promises.rm(outDir, { force: true, recursive: true });
  await fs.promises.mkdir(outDir);
  let files: IOutputFile[];
  files = await f.generate();
  for (const file of files) {
    const outFile = path.resolve(outDir, file.file);
    try {
      await fs.promises.access(path.dirname(outFile), fs.constants.W_OK);
    } catch (reason) {
      await fs.promises.mkdir(path.dirname(outFile));
    }
    await fs.promises.writeFile(outFile, file.contents);
  }
});

export default suite;
