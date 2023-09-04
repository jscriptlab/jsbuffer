import { Suite } from 'sarg';
import Tokenizer from '../src/Tokenizer';
import fs from 'fs';
import path from 'path';
import { TextEncoder } from 'util';
import expectedTokens1 from './expected-tokens-1.json';
import assert from 'assert';

const suite = new Suite();

suite.test('Tokenizer: it should tokenize files', async () => {
  for (const f of [
    path.resolve(__dirname, 'schema'),
    path.resolve(__dirname, 'User')
  ]) {
    new Tokenizer({
      contents: await fs.promises.readFile(f),
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    }).tokenize();
  }
});

suite.test('Tokenizer: it should tokenize literal number', () => {
  assert.strict.deepEqual(
    new Tokenizer({
      contents: new TextEncoder().encode('type Message { bigint<1000> id; }'),
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    })
      .tokenize()
      .tokens(),
    expectedTokens1
  );
});

suite.test('Tokenizer: it should comments', () => {
  new Tokenizer({
    contents: new TextEncoder().encode(['// a', 'type A {}'].join('\n')),
    textEncoder: new TextEncoder(),
    textDecoder: new TextDecoder()
  }).tokenize();
});

export default suite;
