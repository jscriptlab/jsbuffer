import Parser from '../../src/parser/Parser';
import fs from 'fs';
import path from 'path';
import test from 'ava';

test('Parser test', async (t) => {
  const mainFilePath = path.resolve(__dirname, 'index.jsb');
  const configuration = {
    rootDir: __dirname,
    outDir: path.resolve(__dirname, 'out'),
    mainFile: 'Event.jsb'
  };
  const parser = new Parser(
    {
      path: mainFilePath,
      contents: await fs.promises.readFile(mainFilePath)
    },
    {
      configuration,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      root: null,
      indentationSize: 2,
      sortProperties: false
    }
  );

  console.log(await parser.parse());
  t.pass();
});
