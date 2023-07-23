import Exception from '../exception/Exception';
import Character from './Character';

export interface ITokenPosition {
  lineNumber: ITokenRange;
  offset: ITokenRange;
}

export interface ITokenRange {
  start: number;
  end: number;
}

export interface IToken {
  type: TokenType;
  value: string;
  position: ITokenPosition;
}

export enum TokenType {
  Keyword,
  Identifier,
  SingleLineComment,
  MultiLineComment,
  LiteralString,
  LiteralNumber,
  Punctuator,
}

export interface ITokenizerOptions {
  contents: Uint8Array;
  textEncoder: ITextEncoder;
  textDecoder: ITextDecoder;
}

export interface ITextEncoder {
  encode(value: string): Uint8Array;
}

export interface ITextDecoder {
  decode(value: Uint8Array): string;
}

export default class Tokenizer {
  readonly #contents;
  readonly #textEncoder;
  readonly #textDecoder;
  readonly #tokens = new Array<IToken>();
  readonly #comments = new Array<IToken>();
  readonly #keywords = ['call', 'from', 'trait', 'import', 'type', 'export'];
  #offset;
  #lineNumber;
  public constructor({
    contents,
    textDecoder,
    textEncoder,
  }: ITokenizerOptions) {
    this.#lineNumber = 0;
    this.#offset = 0;
    this.#contents = contents;
    this.#textEncoder = textEncoder;
    this.#textDecoder = textDecoder;
  }
  public tokens(): ReadonlyArray<IToken> {
    return this.#tokens;
  }
  public comments(): ReadonlyArray<IToken> {
    return this.#comments;
  }
  public tokenize() {
    const tokens = this.#tokens;
    const comments = this.#comments;
    while (!this.#eof()) {
      const ch = this.#currentCharacter();
      if (this.#peek('//')) {
        comments.push(this.#readSingleLineComment());
      } else if (Character.isIdentifierStart(ch)) {
        const id = this.#readIdentifier();
        const isKeyword = this.#keywords.includes(id.value);
        if (isKeyword) {
          tokens.push({
            ...id,
            type: TokenType.Keyword,
          });
        } else {
          tokens.push(id);
        }
      } else if (Character.isWhiteSpace(ch)) {
        this.#offset++;
      } else if (Character.isLineBreak(ch)) {
        this.#offset++;
        this.#lineNumber++;
      } else if (Character.isStringLiteralStart(ch)) {
        tokens.push(this.#readLiteralString());
      } else {
        const punctuator = this.#readPunctuator();
        if (punctuator) {
          tokens.push(punctuator);
        } else {
          throw new Exception(
            `unexpected ${String.fromCharCode(ch)} at line number ${
              this.#lineNumber + 1
            }`
          );
        }
      }
    }
    return this;
  }
  #readLiteralString(): IToken {
    // skip string start and get offset after string token
    const startOffset = this.#offset++;
    while (
      !this.#eof() &&
      !Character.isStringLiteralStart(this.#currentCharacter())
    ) {
      if (Character.isLineBreak(this.#currentCharacter())) {
        throw new Exception('line break before end of string');
      } else {
        this.#offset++;
      }
    }
    // skip string end and get offset before end string token
    const endOffset = this.#offset++;
    return {
      type: TokenType.LiteralString,
      position: {
        offset: {
          start: startOffset,
          end: this.#offset,
        },
        lineNumber: {
          start: this.#lineNumber,
          end: this.#lineNumber,
        },
      },
      value: this.#textDecoder.decode(
        this.#contents.subarray(startOffset + 1, endOffset)
      ),
    };
  }
  #readPunctuator(): IToken | null {
    const punctuators = ['=>', '{', '}', ',', ';', ':', '<', '>'];
    for (const value of punctuators) {
      if (!this.#peek(value)) {
        continue;
      }
      this.#offset += this.#textEncoder.encode(value).byteLength;
      return {
        type: TokenType.Punctuator,
        value,
        position: {
          offset: {
            start: this.#offset,
            end: this.#offset,
          },
          lineNumber: {
            start: this.#lineNumber,
            end: this.#lineNumber,
          },
        },
      };
    }
    return null;
  }
  #currentCharacter() {
    const ch = this.#contents[this.#offset];
    if (typeof ch === 'undefined') {
      throw new Exception('EOF');
    }
    return ch;
  }
  #readSingleLineComment(): IToken {
    // skip //
    this.#offset += 2;
    const startOffset = this.#offset;
    while (!this.#eof() && !Character.isLineBreak(this.#currentCharacter())) {
      this.#offset++;
    }
    return {
      type: TokenType.MultiLineComment,
      value: this.#textDecoder.decode(
        this.#contents.subarray(startOffset, this.#offset)
      ),
      position: {
        lineNumber: {
          start: this.#lineNumber,
          end: this.#lineNumber,
        },
        offset: {
          start: startOffset,
          end: this.#offset,
        },
      },
    };
  }
  #readIdentifier(): IToken {
    const startOffset = this.#offset;
    while (
      !this.#eof() &&
      Character.isIdentifierPart(this.#currentCharacter())
    ) {
      this.#offset++;
    }
    return {
      type: TokenType.Identifier,
      value: this.#textDecoder.decode(
        this.#contents.subarray(startOffset, this.#offset)
      ),
      position: {
        lineNumber: {
          start: this.#lineNumber,
          end: this.#lineNumber,
        },
        offset: {
          start: startOffset,
          end: this.#offset,
        },
      },
    };
  }
  #peek(value: string) {
    if (!value.length) {
      return false;
    }
    const encoded = this.#textEncoder.encode(value);
    const contents = this.#remaining();
    if (contents.byteLength < encoded.byteLength) {
      return false;
    }
    for (let i = 0; i < encoded.byteLength; i++) {
      if (encoded[i] !== contents[i]) return false;
    }
    return true;
  }
  #eof() {
    return this.#offset === this.#contents.byteLength;
  }
  #remaining() {
    return this.#contents.subarray(this.#offset);
  }
}
