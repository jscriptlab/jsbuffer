import test from 'ava';
import Tokenizer, { IToken, TokenType } from '../src/Tokenizer';
import fs from 'fs';
import path from 'path';
import { TextEncoder } from 'util';
import expectedTokens1 from './expected-tokens-1.json';
import assert from 'assert';

test('Tokenizer: it should tokenize files', async (t) => {
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
      contents: new TextEncoder().encode('type Message { bigint<1000> id; }'),
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    })
      .tokenize()
      .tokens(),
    expectedTokens
  );
});

test('Tokenizer#tokens: it should not return comments in the call', (t) => {
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
      contents: new TextEncoder().encode(['// a', 'type A {}'].join('\n')),
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    })
      .tokenize()
      .tokens(),
    expectedTokens
  );
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
      textDecoder: new TextDecoder()
    })
      .tokenize()
      .comments(),
    expectedTokens
  );
});
