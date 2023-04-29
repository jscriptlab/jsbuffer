import { Suite } from 'sarg';
import Tokenizer from '../src/Tokenizer';
import fs from 'fs';
import path from 'path';
import { TextEncoder } from 'util';

const suite = new Suite();

suite.test('Tokenizer: it should tokenize files', async () => {
  for (const f of [
    path.resolve(__dirname, 'schema'),
    path.resolve(__dirname, 'User'),
  ]) {
    new Tokenizer({
      contents: await fs.promises.readFile(f),
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
    }).tokenize();
  }
});

export default suite;
