import test from 'ava';
import Tokenizer, { IToken, TokenType } from '../src/core/Tokenizer';
import fs from 'fs';
import path from 'path';
import { TextEncoder } from 'util';
import expectedTokens1 from './expected-tokens-1.json';
import assert from 'assert';
import Exception from '../exception/Exception';

test('Tokenizer: it should tokenize files', async (t) => {
  for (const f of [
    path.resolve(__dirname, 'schema'),
    path.resolve(__dirname, 'User')
  ]) {
    new Tokenizer({
      file: 'test',
      contents: await fs.promises.readFile(f),
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    }).tokenize();
  }
  t.pass();
});

test('Tokenizer: it should tokenize literal number', (t) => {
  const expectedTokens: IToken[] = [
    {
      type: TokenType.Keyword,
      value: 'type',
      position: { start: 0, end: 4 }
    },
    {
      type: TokenType.Identifier,
      value: 'Message',
      position: { start: 5, end: 12 }
    },
    {
      type: TokenType.Punctuator,
      value: '{',
      position: { start: 13, end: 14 }
    },
    {
      type: TokenType.Identifier,
      value: 'bigint',
      position: { start: 15, end: 21 }
    },
    {
      type: TokenType.Punctuator,
      value: '<',
      position: { start: 21, end: 22 }
    },
    {
      type: TokenType.LiteralNumber,
      value: '1000',
      position: { start: 22, end: 26 }
    },
    {
      type: TokenType.Punctuator,
      value: '>',
      position: { start: 26, end: 27 }
    },
    {
      type: TokenType.Identifier,
      value: 'id',
      position: { start: 28, end: 30 }
    },
    {
      type: TokenType.Punctuator,
      value: ';',
      position: { start: 30, end: 31 }
    },
    {
      type: TokenType.Punctuator,
      value: '}',
      position: { start: 32, end: 33 }
    }
  ];
  t.deepEqual(
    new Tokenizer({
      file: 'test',
      contents: new TextEncoder().encode('type Message { bigint<1000> id; }'),
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    })
      .tokenize()
      .tokens(),
    expectedTokens
  );
});

test('Tokenizer#comments: it should only return the comment tokens in the calls to `comments` method', (t) => {
  const expectedTokens: IToken[] = [
    { type: TokenType.Keyword, value: 'type', position: { start: 5, end: 9 } },
    {
      type: TokenType.Identifier,
      value: 'A',
      position: { start: 10, end: 11 }
    },
    {
      type: TokenType.Punctuator,
      value: '{',
      position: { start: 12, end: 13 }
    },
    { type: TokenType.Punctuator, value: '}', position: { start: 13, end: 14 } }
  ];
  t.deepEqual(
    new Tokenizer({
      file: 'test',
      contents: new TextEncoder().encode(['// a', 'type A {}'].join('\n')),
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    })
      .tokenize()
      .tokens(),
    expectedTokens
  );
});

test('Tokenizer#tokens: it deal with leading multi-line comments', (t) => {
  const contents = new TextEncoder().encode(['/* a */', 'type A {}'].join(' '));
  const tokenizer = new Tokenizer({
    file: 'test',
    contents,
    textEncoder: new TextEncoder(),
    textDecoder: new TextDecoder()
  });
  tokenizer.tokenize();
  t.deepEqual(tokenizer.comments(), [
    {
      type: TokenType.MultiLineComment,
      value: ' a ',
      position: { start: 2, end: 5 }
    }
  ]);
  t.deepEqual(tokenizer.tokenize().tokens(), [
    {
      type: TokenType.Keyword,
      value: 'type',
      position: { start: 8, end: 12 }
    },
    {
      type: TokenType.Identifier,
      value: 'A',
      position: { start: 13, end: 14 }
    },
    {
      type: TokenType.Punctuator,
      value: '{',
      position: { start: 15, end: 16 }
    },
    {
      type: TokenType.Punctuator,
      value: '}',
      position: { start: 16, end: 17 }
    }
  ]);
});

test('Tokenizer#tokens: it deal with trailing multi-line comments', (t) => {
  const contents = new TextEncoder().encode(['type A {}', '/* a */'].join(' '));
  const tokenizer = new Tokenizer({
    file: 'test',
    contents,
    textEncoder: new TextEncoder(),
    textDecoder: new TextDecoder()
  });
  tokenizer.tokenize();
  t.deepEqual(tokenizer.comments(), [
    {
      type: TokenType.MultiLineComment,
      value: ' a ',
      position: { start: 12, end: 15 }
    }
  ]);
});

test('Tokenizer#tokenize: it should throw a formatted error in case in case an unknown character is found during tokenization', async (t) => {
  try {
    new Tokenizer({
      file: 'fileWithUnknownCharacter',
      contents: await fs.promises.readFile(
        path.resolve(__dirname, 'fileWithUnknownCharacter')
      ),
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    }).tokenize();
    t.fail();
  } catch (reason: unknown) {
    if (!(reason instanceof Exception)) {
      t.fail('Expected tokenize to throw an Exception instance');
      return;
    }
    t.deepEqual(
      reason.what,
      'Error at fileWithUnknownCharacter:2:3:\n' +
        '\n' +
        '\tUnexpected character\n' +
        '\n' +
        'Detailed:\n' +
        '\n' +
        'type A {\n' +
        '  (\n' +
        '  ^ Unexpected character\n' +
        '}\n' +
        '\n' +
        '\n'
    );
  }
});

test('Tokenizer#comments: it should return comments from the call', (t) => {
  const expectedTokens: IToken[] = [
    {
      type: TokenType.SingleLineComment,
      value: ' a',
      position: { start: 2, end: 4 }
    }
  ];
  t.deepEqual(
    new Tokenizer({
      contents: new TextEncoder().encode(['// a', 'type A {}'].join('\n')),
      textEncoder: new TextEncoder(),
      file: 'test',
      textDecoder: new TextDecoder()
    })
      .tokenize()
      .comments(),
    expectedTokens
  );
});
