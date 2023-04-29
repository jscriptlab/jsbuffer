import Exception from '../exception/Exception';
import { IToken, TokenType } from './Tokenizer';

export class ASTGenerationException extends Exception {}

export class UnexpectedTokenType extends ASTGenerationException {
  public constructor(
    public readonly expectedTokenType: TokenType,
    public readonly giveToken: IToken | null
  ) {
    super();
  }
}
export class UnexpectedKeywordName extends ASTGenerationException {
  public constructor(
    public readonly expectedKeywordName: string,
    public readonly giveToken: IToken | null
  ) {
    super();
  }
}

export class UnexpectedPunctuatorName extends ASTGenerationException {
  public constructor(
    public readonly expectedPunctuatorName: string,
    public readonly giveToken: IToken | null
  ) {
    super();
  }
}

export class UnexpectedToken extends ASTGenerationException {
  public constructor(public readonly token: IToken) {
    super();
  }
}

export class EOF extends ASTGenerationException {}

export enum NodeType {
  Identifier,
  ExportStatement,
  TemplateExpression,
  ParamDefinition,
  LiteralString,
  TypeDefinition,
  CallDefinition,
  ImportDefinition,
}

export interface INodeTemplateExpression extends INode {
  type: NodeType.TemplateExpression;
  name: INodeIdentifier;
  templateArguments: ReadonlyArray<INodeIdentifier | INodeTemplateExpression>;
}

export interface INodeLiteralString extends INode {
  type: NodeType.LiteralString;
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
  type: NodeType.ImportDefinition;
  requirements: INodeIdentifier[];
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

export interface INodeExportStatement extends INode {
  type: NodeType.ExportStatement;
  value: INodeTypeDefinition;
}

export type Node =
  | INodeLiteralString
  | INodeImportStatement
  | INodeTypeDefinition
  | INodeExportStatement;

export type NodeTypeExpression = INodeIdentifier | INodeTemplateExpression;

export type ASTGeneratorOutputNode =
  | INodeExportStatement
  | INodeCallDefinition
  | INodeImportStatement
  | INodeTypeDefinition;

export default class ASTGenerator {
  readonly #tokens;
  public constructor(tokens: ReadonlyArray<IToken>) {
    this.#tokens = Array.from(tokens);
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
      } else {
        throw new UnexpectedToken(this.#match());
      }
    }
    return nodes;
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
        end: endToken,
      },
    };
  }
  #readImportStatement(): INodeImportStatement {
    const startToken = this.#expectKeyword('import');
    this.#expectPunctuator('{');
    const requirements = new Array<INodeIdentifier>();
    do {
      requirements.push(this.#expectIdentifier());
    } while (this.#matchPunctuator(','));
    this.#expectPunctuator('}');
    this.#expectKeyword('from');
    const fileNameToken = this.#expectByType(TokenType.LiteralString);
    const fileName: INodeLiteralString = {
      type: NodeType.LiteralString,
      position: {
        start: fileNameToken,
        end: fileNameToken,
      },
      value: fileNameToken.value,
    };
    const endToken = this.#expectPunctuator(';');
    return {
      type: NodeType.ImportDefinition,
      requirements,
      position: {
        start: startToken,
        end: endToken,
      },
      from: fileName,
    };
  }
  #peek(expectedTokenType: TokenType, value: string) {
    const token = this.#tokens[0];
    if (
      typeof token === 'undefined' ||
      token.type !== expectedTokenType ||
      token.value !== value
    ) {
      return null;
    }
    return token;
  }
  #match(): IToken {
    const token = this.#tokens[0];
    if (typeof token === 'undefined') {
      throw new EOF();
    }
    return token;
  }
  #readExportStatement(): INodeExportStatement {
    const startToken = this.#expectKeyword('export');
    const type = this.#readTypeStatement();
    return {
      type: NodeType.ExportStatement,
      value: type,
      position: {
        start: startToken,
        end: type.position.end,
      },
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
          end: endParamPunctuator,
        },
        name: paramName,
        typeExpression,
      });
    }
    return parameters;
  }
  #readTypeExpression(): NodeTypeExpression {
    const id = this.#expectIdentifier();
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
        end: endToken,
      },
      templateArguments,
    };
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
        end: endPunctuator,
      },
      parameters,
    };
  }
  #expectPunctuator(value: string) {
    const punctuator = this.#expectByType(TokenType.Punctuator);
    if (punctuator.value !== value) {
      throw new UnexpectedPunctuatorName(value, punctuator);
    }
    return punctuator;
  }
  #matchPunctuator(value: string) {
    const punctuator = this.#peek(TokenType.Punctuator, value);
    if (punctuator === null) {
      return null;
    }
    this.#tokens.shift();
    return punctuator;
  }
  #expectIdentifier(): INodeIdentifier {
    const id = this.#expectByType(TokenType.Identifier);
    return {
      position: {
        start: id,
        end: id,
      },
      type: NodeType.Identifier,
      value: id.value,
    };
  }
  #expectKeyword(value: string) {
    const token = this.#expectByType(TokenType.Keyword);
    if (token.value !== value) {
      throw new UnexpectedKeywordName(value, token);
    }
    return token;
  }
  // #matchKeyword(value: string) {
  //   const token = this.#matchByType(TokenType.Keyword);
  //   if (token?.value !== value) {
  //     return null;
  //   }
  //   return token;
  // }
  #expectByType(expectedType: TokenType) {
    const token = this.#tokens[0];
    if (typeof token === 'undefined' || token.type !== expectedType) {
      throw new UnexpectedTokenType(expectedType, token ?? null);
    }
    /**
     * remove first token
     */
    this.#tokens.shift();
    /**
     * return first token
     */
    return token;
  }
  // #matchByType(expectedType: TokenType) {
  //   const token = this.#tokens[0];
  //   if (typeof token === 'undefined' || token.type !== expectedType) {
  //     return null;
  //   }
  //   /**
  //    * remove first token
  //    */
  //   this.#tokens.shift();
  //   /**
  //    * return first token
  //    */
  //   return token;
  // }
  #eof() {
    return this.#tokens.length === 0;
  }
}
