import Exception from '../exception/Exception';
import Character from './Character';
import ErrorFormatter from './ErrorFormatter';

export interface ITokenRange {
  start: number;
  end: number;
}

export interface IToken {
  type: TokenType;
  value: string;
  position: ITokenRange;
}

export enum TokenType {
  Keyword,
  Identifier,
  SingleLineComment,
  MultiLineComment,
  LiteralString,
  LiteralNumber,
  Punctuator
}

export interface ITokenizerOptions {
  /**
   * File name
   */
  file: string;
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
  readonly #errorFormatter;
  #offset;
  #lineNumber;
  public constructor({
    contents,
    file,
    textDecoder,
    textEncoder
  }: ITokenizerOptions) {
    this.#lineNumber = 0;
    this.#offset = 0;
    this.#contents = contents;
    this.#textEncoder = textEncoder;
    this.#textDecoder = textDecoder;
    this.#errorFormatter = new ErrorFormatter({
      contents,
      textDecoder: this.#textDecoder,
      file,
      offset: () => this.#offset
    });
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
      } else if (this.#peek('/*')) {
        comments.push(this.#readMultiLineComment());
      } else if (Character.isIdentifierStart(ch)) {
        const id = this.#readIdentifier();
        const isKeyword = this.#keywords.includes(id.value);
        if (isKeyword) {
          tokens.push({
            ...id,
            type: TokenType.Keyword
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
      } else if (Character.isIntegerPart(ch)) {
        tokens.push(this.#readLiteralNumber());
      } else {
        const punctuator = this.#readPunctuator();
        if (punctuator) {
          tokens.push(punctuator);
        } else {
          throw new Exception(
            this.#errorFormatter.format('Unexpected character')
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
      !Character.isStringLiteralStart(this.#currentCharacter()) &&
      !Character.isLineBreak(this.#currentCharacter())
    ) {
      this.#offset++;
    }
    // skip string end and get offset before end string token
    const endOffset = this.#offset++;
    return {
      type: TokenType.LiteralString,
      position: {
        start: startOffset,
        end: this.#offset
      },
      value: this.#textDecoder.decode(
        this.#contents.subarray(startOffset + 1, endOffset)
      )
    };
  }
  #readLiteralNumber(): IToken {
    const startOffset = this.#offset;
    while (!this.#eof() && Character.isIntegerPart(this.#currentCharacter())) {
      this.#offset++;
    }
    const endOffset = this.#offset;
    return {
      type: TokenType.LiteralNumber,
      position: {
        start: startOffset,
        end: this.#offset
      },
      value: this.#textDecoder.decode(
        this.#contents.subarray(startOffset, endOffset)
      )
    };
  }
  #readPunctuator(): IToken | null {
    const punctuators = ['=>', '{', '}', ',', ';', ':', '<', '>'];
    for (const value of punctuators) {
      if (!this.#peek(value)) {
        continue;
      }
      const startOffset = this.#offset;
      this.#offset += this.#textEncoder.encode(value).byteLength;
      return {
        type: TokenType.Punctuator,
        value,
        position: {
          start: startOffset,
          end: this.#offset
        }
      };
    }
    return null;
  }
  #currentCharacter() {
    const ch = this.#contents[this.#offset];
    if (typeof ch === 'undefined') {
      throw new Exception(
        this.#errorFormatter.format(
          'Tried to get current character, but reached the end of file'
        )
      );
    }
    return ch;
  }
  #readMultiLineComment(): IToken {
    this.#expect('/*');
    const startOffset = this.#offset;
    while (!this.#eof() && !this.#peek('*/')) {
      this.#offset++;
    }
    const endOffset = this.#offset;
    this.#expect('*/');
    return {
      type: TokenType.MultiLineComment,
      value: this.#textDecoder.decode(
        this.#contents.subarray(startOffset, endOffset)
      ),
      position: {
        start: startOffset,
        end: endOffset
      }
    };
  }
  #readSingleLineComment(): IToken {
    this.#expect('//');
    const startOffset = this.#offset;
    while (!this.#eof() && !Character.isLineBreak(this.#currentCharacter())) {
      this.#offset++;
    }
    return {
      type: TokenType.SingleLineComment,
      value: this.#textDecoder.decode(
        this.#contents.subarray(startOffset, this.#offset)
      ),
      position: {
        start: startOffset,
        end: this.#offset
      }
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
        start: startOffset,
        end: this.#offset
      }
    };
  }
  #expect(value: string) {
    const encoded = this.#peek(value);
    if (encoded === null) {
      throw new Exception(this.#errorFormatter.format(`Expected "${value}"`));
    }
    this.#offset += encoded.byteLength;
    return encoded;
  }
  #peek(value: string) {
    /**
     * Ignore if the input string is empty
     */
    if (!value.length) {
      return null;
    }
    const encoded = this.#textEncoder.encode(value);
    const contents = this.#remaining();
    /**
     * If the remaining bytes is less than the encoded value, then
     * return null
     */
    if (contents.byteLength < encoded.byteLength) {
      return null;
    }
    for (let i = 0; i < encoded.byteLength; i++) {
      if (encoded[i] !== contents[i]) return null;
    }
    return encoded;
  }
  #eof() {
    return this.#offset === this.#contents.byteLength;
  }
  #remaining() {
    return this.#contents.subarray(this.#offset);
  }
}
