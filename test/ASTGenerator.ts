import { Suite } from 'sarg';
import Tokenizer from '../src/Tokenizer';
import path from 'path';
import fs from 'fs';
import ASTGenerator from '../src/ASTGenerator';

const suite = new Suite();
suite.test('ASTGenerator: it should tokenize files', async () => {
  new ASTGenerator(
    new Tokenizer({
      contents: await fs.promises.readFile(path.resolve(__dirname, 'schema')),
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
    }).tokenize()
  ).generate();
  new ASTGenerator(
    new Tokenizer({
      contents: await fs.promises.readFile(path.resolve(__dirname, 'User')),
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
    }).tokenize()
  ).generate();
});

export default suite;
