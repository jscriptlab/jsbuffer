import Exception from '../exception/Exception';
import { IToken, TokenType } from './Tokenizer';

export class ASTGenerationException extends Exception {}

export class UnexpectedTokenType extends ASTGenerationException {
  public constructor(
    public readonly expectedTokenType: TokenType,
    public readonly giveToken: IToken | null,
    public readonly lastToken: IToken | null
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

export class UnexpectedExport extends ASTGenerationException {}

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
  TraitDefinition,
  LiteralString,
  TypeDefinition,
  CallDefinition,
  ImportStatement,
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

export type NodeTypeExpression = INodeIdentifier | INodeTemplateExpression;

export type ASTGeneratorOutputNode =
  | INodeExportStatement
  | INodeCallDefinition
  | INodeImportStatement
  | INodeTypeDefinition
  | INodeTraitDefinition;

export default class ASTGenerator {
  readonly #tokens;
  #lastToken: IToken | null = null;
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
      } else if (this.#peek(TokenType.Keyword, 'trait')) {
        nodes.push(this.#readTraitStatement());
      } else {
        throw new UnexpectedToken(this.#match());
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
        end: endToken,
      },
      traits: [],
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
        end: endToken,
      },
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
        end: fileNameToken,
      },
      value: fileNameToken.value,
    };
    const endToken = this.#expectPunctuator(';');
    return {
      type: NodeType.ImportStatement,
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
  #peekKeyword(value: string) {
    return this.#peek(TokenType.Keyword, value);
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

    let value: INodeTypeDefinition | INodeTraitDefinition | INodeCallDefinition;
    if (this.#peekKeyword('type')) {
      value = this.#readTypeStatement();
    } else if (this.#peekKeyword('trait')) {
      value = this.#readTraitStatement();
    } else if (this.#peekKeyword('call')) {
      value = this.#readCallStatement();
    } else {
      throw new UnexpectedExport();
    }
    return {
      type: NodeType.ExportStatement,
      value,
      position: {
        start: startToken,
        end: value.position.end,
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
  #matchByType(expectedType: TokenType, value: string) {
    const token = this.#peek(expectedType, value);
    if (token === null) {
      return null;
    }
    this.#lastToken = this.#tokens.shift() ?? null;
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
  #expectByType(expectedType: TokenType) {
    const token = this.#tokens[0];
    if (typeof token === 'undefined' || token.type !== expectedType) {
      throw new UnexpectedTokenType(
        expectedType,
        token ?? null,
        this.#lastToken
      );
    }
    /**
     * remove first token
     */
    this.#lastToken = this.#tokens.shift() ?? null;
    /**
     * return first token
     */
    return token;
  }
  #eof() {
    return this.#tokens.length === 0;
  }
}
