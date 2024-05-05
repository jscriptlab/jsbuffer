import Parser, { IFileMetadata } from '../../src/parser/Parser';
import fs from 'fs';
import path from 'path';
import test from 'ava';

test('it should generate file metadata list', async (t) => {
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

  let expectedFileMetadataList: IFileMetadata[] = JSON.parse(
    await fs.promises.readFile(
      path.resolve(__dirname, 'expected-metadata1.json'),
      'utf8'
    )
  );
  expectedFileMetadataList = expectedFileMetadataList.map((fileMetadata) => ({
    ...fileMetadata,
    path: path.resolve(path.dirname(__dirname), fileMetadata.path)
  }));

  t.deepEqual(await parser.parse(), expectedFileMetadataList);
});
