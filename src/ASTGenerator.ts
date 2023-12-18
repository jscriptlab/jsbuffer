import Exception from '../exception/Exception';
import ErrorFormatter from './ErrorFormatter';
import { ITextDecoder, IToken, TokenType } from './Tokenizer';
import tokenTypeToString from './tokenTypeToString';

export class ASTGenerationException extends Exception {}

export enum NodeType {
  Identifier,
  ExportStatement,
  TemplateExpression,
  ParamDefinition,
  TraitDefinition,
  LiteralString,
  LiteralNumber,
  TypeDefinition,
  CallDefinition,
  ImportStatement
}

export interface INodeTemplateExpression extends INode {
  type: NodeType.TemplateExpression;
  name: INodeIdentifier;
  templateArguments: ReadonlyArray<NodeTypeExpression>;
}

export interface INodeLiteralString extends INode {
  type: NodeType.LiteralString;
  value: string;
}

export interface INodeLiteralNumber extends INode {
  type: NodeType.LiteralNumber;
  value: string;
}

export interface INodeIdentifier extends INode {
  type: NodeType.Identifier;
  value: string;
}

export interface INode {
  position: {
    start: IToken;
    end: IToken;
  };
}

export interface INodeTypeDefinition extends INode {
  type: NodeType.TypeDefinition;
  name: INodeIdentifier;
  parameters: ReadonlyArray<INodeParamDefinition>;
  traits: INodeIdentifier[];
}

export interface INodeImportStatement extends INode {
  type: NodeType.ImportStatement;
  requirements: INodeIdentifier[] | null;
  from: INodeLiteralString;
}

export interface INodeParamDefinition extends INode {
  type: NodeType.ParamDefinition;
  name: INodeIdentifier;
  typeExpression: NodeTypeExpression;
}

export interface INodeCallDefinition extends INode {
  type: NodeType.CallDefinition;
  name: INodeIdentifier;
  returnType: INodeIdentifier;
  traits: INodeIdentifier[];
  parameters: ReadonlyArray<INodeParamDefinition>;
}

export interface INodeTraitDefinition extends INode {
  type: NodeType.TraitDefinition;
  name: INodeIdentifier;
  traits: INodeIdentifier[];
}

export interface INodeExportStatement extends INode {
  type: NodeType.ExportStatement;
  value: INodeTypeDefinition | INodeTraitDefinition | INodeCallDefinition;
}

export type Node =
  | INodeLiteralString
  | INodeImportStatement
  | INodeTypeDefinition
  | INodeExportStatement;

export type NodeTypeExpression =
  | INodeLiteralString
  | INodeLiteralNumber
  | INodeIdentifier
  | INodeTemplateExpression;

export type ASTGeneratorOutputNode =
  | INodeExportStatement
  | INodeCallDefinition
  | INodeImportStatement
  | INodeTypeDefinition
  | INodeTraitDefinition;

export default class ASTGenerator {
  readonly #tokens;
  readonly #errorFormatter;
  #offset = 0;
  public constructor({
    contents,
    textDecoder,
    tokens,
    file
  }: {
    file: string;
    tokens: ReadonlyArray<IToken>;
    contents: Uint8Array;
    textDecoder: ITextDecoder;
  }) {
    this.#tokens = tokens;
    this.#errorFormatter = new ErrorFormatter({
      file,
      textDecoder,
      contents,
      offset: () => this.#errorFormatterByteOffset()
    });
  }
  public generate() {
    const nodes = new Array<ASTGeneratorOutputNode>();
    while (!this.#eof()) {
      if (this.#peek(TokenType.Keyword, 'import')) {
        nodes.push(this.#readImportStatement());
      } else if (this.#peek(TokenType.Keyword, 'export')) {
        nodes.push(this.#readExportStatement());
      } else if (this.#peek(TokenType.Keyword, 'type')) {
        nodes.push(this.#readTypeStatement());
      } else if (this.#peek(TokenType.Keyword, 'call')) {
        nodes.push(this.#readCallStatement());
      } else if (this.#peek(TokenType.Keyword, 'trait')) {
        nodes.push(this.#readTraitStatement());
      } else {
        throw new ASTGenerationException(
          this.#errorFormatter.format('Unexpected token')
        );
      }
    }
    return nodes;
  }
  #readTraitStatement(): INodeTraitDefinition {
    const startToken = this.#expectKeyword('trait');
    const name = this.#expectIdentifier();
    this.#expectPunctuator('{');
    const endToken = this.#expectPunctuator('}');
    return {
      type: NodeType.TraitDefinition,
      name,
      position: {
        start: startToken,
        end: endToken
      },
      traits: []
    };
  }
  #readCallStatement(): INodeCallDefinition {
    const startToken = this.#expectKeyword('call');
    const name = this.#expectIdentifier();
    const traits = this.#readTraits();
    this.#expectPunctuator('=>');
    const returnType = this.#expectIdentifier();
    this.#expectPunctuator('{');
    const parameters = this.#readParamDefinitions();
    const endToken = this.#expectPunctuator('}');
    return {
      type: NodeType.CallDefinition,
      parameters,
      name,
      returnType,
      traits,
      position: {
        start: startToken,
        end: endToken
      }
    };
  }
  #readImportStatement(): INodeImportStatement {
    const startToken = this.#expectKeyword('import');
    let requirements: Array<INodeIdentifier> | null;
    if (this.#matchPunctuator('{')) {
      requirements = new Array<INodeIdentifier>();
      do {
        requirements.push(this.#expectIdentifier());
      } while (this.#matchPunctuator(','));
      this.#expectPunctuator('}');
      this.#expectKeyword('from');
    } else {
      requirements = null;
    }
    const fileNameToken = this.#expectByType(TokenType.LiteralString);
    const fileName: INodeLiteralString = {
      type: NodeType.LiteralString,
      position: {
        start: fileNameToken,
        end: fileNameToken
      },
      value: fileNameToken.value
    };
    const endToken = this.#expectPunctuator(';');
    return {
      type: NodeType.ImportStatement,
      requirements,
      position: {
        start: startToken,
        end: endToken
      },
      from: fileName
    };
  }
  #peek(expectedTokenType: TokenType, value?: string) {
    const token = this.#tokens[this.#offset];
    if (
      typeof token === 'undefined' ||
      token.type !== expectedTokenType ||
      (typeof value === 'undefined' ? false : token.value !== value)
    ) {
      return null;
    }
    return token;
  }
  #peekKeyword(value: string) {
    return this.#peek(TokenType.Keyword, value);
  }
  #readExportStatement(): INodeExportStatement {
    const startToken = this.#expectKeyword('export');

    let value: INodeTypeDefinition | INodeTraitDefinition | INodeCallDefinition;
    if (this.#peekKeyword('type')) {
      value = this.#readTypeStatement();
    } else if (this.#peekKeyword('trait')) {
      value = this.#readTraitStatement();
    } else if (this.#peekKeyword('call')) {
      value = this.#readCallStatement();
    } else {
      throw new ASTGenerationException(
        this.#errorFormatter.format('Unexpected export')
      );
    }
    return {
      type: NodeType.ExportStatement,
      value,
      position: {
        start: startToken,
        end: value.position.end
      }
    };
  }
  #readTraits() {
    const traits = new Array<INodeIdentifier>();
    if (this.#matchPunctuator(':')) {
      do {
        traits.push(this.#expectIdentifier());
      } while (this.#matchPunctuator(','));
    }
    return traits;
  }
  #readParamDefinitions() {
    const parameters = new Array<INodeParamDefinition>();
    while (!this.#eof() && this.#peek(TokenType.Punctuator, '}') === null) {
      const typeExpression = this.#readTypeExpression();
      const paramName = this.#expectIdentifier();
      const endParamPunctuator = this.#expectPunctuator(';');
      parameters.push({
        type: NodeType.ParamDefinition,
        position: {
          start: typeExpression.position.start,
          end: endParamPunctuator
        },
        name: paramName,
        typeExpression
      });
    }
    return parameters;
  }
  #readLiteralString(): INodeLiteralString {
    const id = this.#expectByType(TokenType.LiteralString);
    return {
      value: id.value,
      type: NodeType.LiteralString,
      position: {
        start: id,
        end: id
      }
    };
  }
  #readLiteralNumber(): INodeLiteralNumber {
    const id = this.#expectByType(TokenType.LiteralNumber);
    return {
      value: id.value,
      type: NodeType.LiteralNumber,
      position: {
        start: id,
        end: id
      }
    };
  }
  #readTypeExpression(): NodeTypeExpression {
    const token =
      this.#peek(TokenType.Identifier) ??
      this.#peek(TokenType.LiteralNumber) ??
      this.#peek(TokenType.LiteralString);
    if (token === null) {
      throw new ASTGenerationException('Invalid type expression');
    }
    let id: NodeTypeExpression;
    switch (token.type) {
      case TokenType.Identifier:
        id = this.#expectIdentifier();
        break;
      case TokenType.LiteralString:
        id = this.#readLiteralString();
        break;
      case TokenType.LiteralNumber:
        id = this.#readLiteralNumber();
        break;
      default:
        throw new ASTGenerationException(`Invalid token type: ${token.type}`);
    }
    switch (id.type) {
      case NodeType.Identifier: {
        const templateArguments = new Array<NodeTypeExpression>();
        if (!this.#matchPunctuator('<')) {
          return id;
        }
        do {
          templateArguments.push(this.#readTypeExpression());
        } while (this.#matchPunctuator(','));
        const endToken = this.#expectPunctuator('>');
        return {
          type: NodeType.TemplateExpression,
          name: id,
          position: {
            start: id.position.start,
            end: endToken
          },
          templateArguments
        };
      }
      case NodeType.LiteralString:
      case NodeType.LiteralNumber:
        return id;
    }
  }
  #readTypeStatement(): INodeTypeDefinition {
    const startToken = this.#expectKeyword('type');
    const name = this.#expectIdentifier();
    const traits = this.#readTraits();
    this.#expectPunctuator('{');
    const parameters = this.#readParamDefinitions();
    const endPunctuator = this.#expectPunctuator('}');
    return {
      type: NodeType.TypeDefinition,
      name,
      traits,
      position: {
        start: startToken,
        end: endPunctuator
      },
      parameters
    };
  }
  /**
   * Assert token.value === value or throw an exception
   * @param token Token to assert
   * @param value Value we expect to be equal to token.value
   * @returns Token if token.value === value
   */
  #assertValue(token: IToken, value: string) {
    if (token.value !== value) {
      throw new ASTGenerationException(
        this.#errorFormatter.format(
          `Expected "${value}", got "${token.value}" instead`
        )
      );
    }
    return token;
  }
  #expectPunctuator(value: string) {
    const punctuator = this.#expectByType(TokenType.Punctuator);
    return this.#assertValue(punctuator, value);
  }
  #matchByType(expectedType: TokenType, value?: string) {
    const token = this.#peek(expectedType, value);
    if (token === null) {
      return null;
    }
    this.#advance();
    return token;
  }
  #matchPunctuator(value: string) {
    return this.#matchByType(TokenType.Punctuator, value);
  }
  #expectIdentifier(): INodeIdentifier {
    const id = this.#expectByType(TokenType.Identifier);
    return {
      position: {
        start: id,
        end: id
      },
      type: NodeType.Identifier,
      value: id.value
    };
  }
  #expectKeyword(value: string) {
    const token = this.#expectByType(TokenType.Keyword);
    return this.#assertValue(token, value);
  }
  /**
   * Advance to the next token
   */
  #advance() {
    if (this.#eof()) {
      throw new ASTGenerationException(
        this.#errorFormatter.format('Tried to advance, but reached EOF')
      );
    }
    this.#offset++;
  }

  #current() {
    const token = this.#tokens[this.#offset];
    if (typeof token === 'undefined') {
      throw new ASTGenerationException(
        this.#errorFormatter.format(
          'Tried to get current token, but found EOF instead'
        )
      );
    }
    return token;
  }
  #expectByType(expectedType: TokenType) {
    const token = this.#current();
    if (token.type !== expectedType) {
      throw new ASTGenerationException(
        this.#errorFormatter.format(
          `Unexpected token type. Expected ${tokenTypeToString(
            expectedType
          )}, ` + `but got ${tokenTypeToString(token.type)} instead`
        )
      );
    }
    /**
     * advance offset
     */
    this.#advance();
    /**
     * return first token
     */
    return token;
  }
  #eof() {
    return this.#tokens.length === this.#offset;
  }
  #errorFormatterByteOffset() {
    const token = this.#tokens[this.#offset];
    if (typeof token === 'undefined') {
      const lastToken = this.#tokens[this.#tokens.length - 1];
      if (typeof lastToken === 'undefined') {
        throw new ASTGenerationException(
          'Unusual behavior: Tried to get last token but EOF was found instead'
        );
      }
      return lastToken.position.end;
    }
    return token.position.start;
  }
}
