import { getArgument } from 'cli-argument-helper';
import { FileGenerator } from '../code-generator';
import path from 'path';
import fs from 'fs';
import inspector from 'inspector';

async function generateSchema() {
  const compilerOptions = {
    rootDir: path.resolve(__dirname, '../test'),
  };
  const fg = new FileGenerator(
    {
      path: path.resolve(__dirname, '../test/schema'),
    },
    {
      root: null,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      isExternalModule: false,
      indentationSize: 2,
      compilerOptions,
      typeScriptConfiguration: {
        extends: '../tsconfig.base.json',
      },
    }
  );
  const outDir = path.resolve(__dirname, '../out');
  await fs.promises.rm(outDir, {
    force: true,
    recursive: true,
  });
  for (const f of await fg.generate()) {
    const finalFilePath = path.resolve(outDir, f.path);
    try {
      await fs.promises.access(path.dirname(finalFilePath), fs.constants.W_OK);
    } catch (reason) {
      await fs.promises.mkdir(path.dirname(finalFilePath));
    }
    await fs.promises.writeFile(finalFilePath, f.contents);
  }

  console.log('ok');
}

(async () => {
  const args = Array.from(process.argv);
  const inspect = getArgument(args, '--inspect');
  const shouldGenerateSchema = getArgument(args, '--generate-schema');
  if (inspect) {
    inspector.open(undefined, undefined, true);
  }
  if (shouldGenerateSchema) {
    await generateSchema();
  }
})().catch((reason) => {
  console.error(reason);
  process.exitCode = 1;
});
