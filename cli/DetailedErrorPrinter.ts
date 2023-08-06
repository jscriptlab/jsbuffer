import assert from 'assert';
import Exception from '../exception/Exception';
import ASTGenerator, {
  ASTGenerationException,
  NodeType,
} from '../src/ASTGenerator';
import { IToken, TokenType } from '../src/Tokenizer';

function addSpacing({
  line,
  lastToken,
  token,
}: {
  token: IToken;
  line: string[];
  lastToken: IToken;
}) {
  const spaceCount =
    token.position.offset.start -
    lastToken.position.offset.end -
    (token.position.lineNumber.start - lastToken.position.lineNumber.end);
  const slice = new Array<string>();
  for (let i = 0; i < spaceCount; i++) {
    slice.push(' ');
  }
  line.push(slice.join(''));
}

export default class DetailedErrorPrinter {
  readonly #astGenerator;
  readonly #tokens;
  readonly #reversedTokens;
  public constructor(
    astGenerator: ASTGenerator,
    tokens: ReadonlyArray<IToken>
  ) {
    this.#astGenerator = astGenerator;
    this.#tokens = Array.from(tokens);
    this.#reversedTokens = Array.from(tokens).reverse();
    this.#reversedTokens;
    this.#astGenerator;
  }
  public print(exception: ASTGenerationException) {
    const value = exception.value;
    if (!value) {
      throw exception;
    }
    let lines: string[];
    switch (value.type) {
      case TokenType.Keyword:
      case TokenType.Identifier:
      case TokenType.SingleLineComment:
      case TokenType.MultiLineComment:
      case TokenType.LiteralString:
      case TokenType.LiteralNumber:
      case TokenType.Punctuator: {
        lines = this.#printDetailedError(
          value,
          exception.what ?? 'Unknown error'
        );
        break;
      }
      default:
        throw exception;
    }
    return lines;
  }
  #printDetailedError(untilToken: IToken, message: string) {
    const tokenIndex = this.#tokens.indexOf(untilToken);
    if (tokenIndex === -1 || tokenIndex === 0) {
      throw new Exception(
        'Token not found, or is it first token, ' +
          'which is not currently supported'
      );
    }
    const lines = new Array<string>();
    const tokenByLineNumber = new Map<number, IToken[]>();
    // ! we should go backwards a little bit instead of going from 0 until the token that is the problem
    for (let i = 0; i < tokenIndex; i++) {
      const token = this.#tokens[i];
      assert.strict.ok(typeof token !== 'undefined');
      let tokens = tokenByLineNumber.get(token.position.lineNumber.start);
      if (!tokens) {
        tokens = [];
        tokenByLineNumber.set(token.position.lineNumber.start, tokens);
      }
      tokens.push(token);
    }
    let lastToken: IToken | null = null;
    const line = new Array<string>();
    for (const [lineNumber, tokens] of tokenByLineNumber) {
      const [firstToken] = tokens;
      if (firstToken) {
        line.push(`${lineNumber + 1} | `);
      }
      for (const token of tokens) {
        if (lastToken) {
          addSpacing({
            line,
            lastToken,
            token,
          });
        }
        line.push(token.value);
        lastToken = token;
      }
      lines.push(line.splice(0, line.length).join(''));
    }
    const lastLine = lines[lines.length - 1];
    if (lastLine) {
      let spacing = '';
      for (let i = 0; i < lastLine.length; i++) {
        spacing += ' ';
      }
      lines.push(`${spacing}^`);
      lines.push(`${spacing}${message}`);
    }
    return lines;
  }
}
