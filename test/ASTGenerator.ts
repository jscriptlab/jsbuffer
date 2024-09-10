import Tokenizer from '../src/core/Tokenizer';
import path from 'path';
import fs from 'fs';
import ASTGenerator, { ASTGenerationException } from '../src/core/ASTGenerator';
import test from 'ava';
import assert from 'assert';

test('ASTGenerator: it should tokenize files', async (t) => {
  const file1 = path.resolve(__dirname, 'schema');
  const contents1 = await fs.promises.readFile(file1);
  new ASTGenerator({
    contents: contents1,
    textDecoder: new TextDecoder(),
    file: file1,
    tokens: new Tokenizer({
      file: file1,
      contents: contents1,
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    })
      .tokenize()
      .tokens()
  }).generate();
  const file2 = path.resolve(__dirname, 'User');
  const contents2 = await fs.promises.readFile(file2);
  new ASTGenerator({
    file: file2,
    contents: contents2,
    textDecoder: new TextDecoder(),
    tokens: new Tokenizer({
      file: file2,
      contents: contents2,
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    })
      .tokenize()
      .tokens()
  }).generate();
  t.pass();
});

test('ASTGenerator: it should throw UnexpectedToken in case an unexpected token is find in the main iteration', (t) => {
  try {
    new ASTGenerator({
      contents: new TextEncoder().encode('a'),
      textDecoder: new TextDecoder(),
      file: 'a',
      tokens: new Tokenizer({
        file: 'a',
        contents: new TextEncoder().encode('a'),
        textEncoder: new TextEncoder(),
        textDecoder: new TextDecoder()
      })
        .tokenize()
        .tokens()
    }).generate();
  } catch (reason) {
    assert(reason instanceof ASTGenerationException);
    t.assert(reason.what.includes('Unexpected token'));
  }
});

test('ASTGenerator: it should read call statement', (t) => {
  new ASTGenerator({
    contents: new TextEncoder().encode('type y {} call X => y { int b; }'),
    textDecoder: new TextDecoder(),
    file: 'a',
    tokens: new Tokenizer({
      file: 'a',
      contents: new TextEncoder().encode('type y {} call X => y { int b; }'),
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    })
      .tokenize()
      .tokens()
  }).generate();
  t.pass();
});

test('ASTGenerator: it should handle errors in case of weird token types after import statement', (t) => {
  try {
    new ASTGenerator({
      contents: new TextEncoder().encode('import ;'),
      textDecoder: new TextDecoder(),
      file: 'a',
      tokens: new Tokenizer({
        file: 'a',
        contents: new TextEncoder().encode('import ;'),
        textEncoder: new TextEncoder(),
        textDecoder: new TextDecoder()
      })
        .tokenize()
        .tokens()
    }).generate();
  } catch (reason) {
    assert(reason instanceof ASTGenerationException);
    t.assert(
      reason.what.includes(
        'Unexpected token type. Expected LiteralString, but got Punctuator instead'
      )
    );
  }
});
test('ASTGenerator: it should handle errors in case of weird token types export statement', (t) => {
  try {
    new ASTGenerator({
      contents: new TextEncoder().encode('export ;'),
      textDecoder: new TextDecoder(),
      file: 'a',
      tokens: new Tokenizer({
        file: 'a',
        contents: new TextEncoder().encode('export ;'),
        textEncoder: new TextEncoder(),
        textDecoder: new TextDecoder()
      })
        .tokenize()
        .tokens()
    }).generate();
  } catch (reason) {
    assert(reason instanceof ASTGenerationException);
    t.assert(reason.what.includes('Unexpected export'));
  }
});

test('ASTGenerator: it should expect { after trait name', (t) => {
  try {
    new ASTGenerator({
      contents: new TextEncoder().encode('trait x ;'),
      textDecoder: new TextDecoder(),
      file: 'a',
      tokens: new Tokenizer({
        file: 'a',
        contents: new TextEncoder().encode('trait x ;'),
        textEncoder: new TextEncoder(),
        textDecoder: new TextDecoder()
      })
        .tokenize()
        .tokens()
    }).generate();
  } catch (reason) {
    assert(reason instanceof ASTGenerationException);
    t.assert(reason.what.includes('Expected "{", got ";" instead'));
  }
});

test('ASTGenerator: it should throw UnexpectedKeywordName', (t) => {
  try {
    new ASTGenerator({
      contents: new TextEncoder().encode('export {'),
      textDecoder: new TextDecoder(),
      file: 'a',
      tokens: new Tokenizer({
        file: 'a',
        contents: new TextEncoder().encode('export {'),
        textEncoder: new TextEncoder(),
        textDecoder: new TextDecoder()
      })
        .tokenize()
        .tokens()
    }).generate();
  } catch (reason) {
    assert(reason instanceof ASTGenerationException);
    t.assert(reason.what.includes('Unexpected export'));
  }
});

test('ASTGenerator##expectKeyword: it should call #expectKeyword after export', (t) => {
  try {
    new ASTGenerator({
      contents: new TextEncoder().encode('export 2;'),
      textDecoder: new TextDecoder(),
      file: 'a',
      tokens: new Tokenizer({
        file: 'a',
        contents: new TextEncoder().encode('export 2;'),
        textEncoder: new TextEncoder(),
        textDecoder: new TextDecoder()
      })
        .tokenize()
        .tokens()
    }).generate();
  } catch (e) {
    if (!(e instanceof ASTGenerationException)) {
      throw new Error('Expected ASTGenerationException');
    }
    t.assert(e.what.includes('Unexpected export'));
  }
});
