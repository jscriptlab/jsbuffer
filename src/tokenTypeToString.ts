import { TokenType } from './Tokenizer';

export default function tokenTypeToString(type: TokenType) {
  switch (type) {
    case TokenType.Identifier:
      return 'Identifier';
    case TokenType.Keyword:
      return 'Keyword';
    case TokenType.LiteralString:
      return 'LiteralString';
    case TokenType.LiteralNumber:
      return 'LiteralNumber';
    case TokenType.Punctuator:
      return 'Punctuator';
    default:
      return 'Unknown';
  }
}
