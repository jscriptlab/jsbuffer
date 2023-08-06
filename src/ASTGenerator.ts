import Exception from '../exception/Exception';
import { IToken, TokenType } from './Tokenizer';

export type ASTGenerationExceptionInput =
  | IToken
  | ASTGeneratorOutputNode
  | null;

export class ASTGenerationException extends Exception {
  public constructor(
    public readonly value: ASTGenerationExceptionInput,
    what = ''
  ) {
    super(what);
  }
}

export class UnexpectedTokenType extends ASTGenerationException {
  public constructor(token: IToken, expectedTokenType: TokenType) {
    super(
      token,
      `Expecting token of type "${expectedTokenType}", but got "${token.type}"`
    );
  }
}

export class UnexpectedNodeType extends ASTGenerationException {
  public constructor(node: ASTGeneratorOutputNode) {
    super(node, `Unexpected output node type: ${node.type}`);
  }
}

export class UnexpectedTokenValue extends ASTGenerationException {
  public constructor(token: IToken, expectedValue: string) {
    super(
      token,
      `Expecting "${expectedValue}", but got "${token.value}" instead`
    );
  }
}

export class UnexpectedPunctuatorName extends ASTGenerationException {
  public constructor(
    token: IToken,
    public readonly expectedPunctuatorName: string
  ) {
    super(
      token,
      `Expected ${expectedPunctuatorName} punctuator, but got ${token.value} instead`
    );
  }
}

export class UnexpectedExport extends ASTGenerationException {}

export class UnexpectedToken extends ASTGenerationException {
  public constructor(value: ASTGenerationExceptionInput) {
    super(value);
  }
}

export class EOF extends ASTGenerationException {
  public constructor() {
    super(null, 'Unexpected EOF');
  }
}

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
  readonly #previousSiblingMap = new Map<
    ASTGeneratorOutputNode,
    ASTGeneratorOutputNode | null
  >();
  readonly #nextSiblingMap = new Map<
    ASTGeneratorOutputNode,
    ASTGeneratorOutputNode | null
  >();
  readonly #nodeByStartToken = new Map<IToken, ASTGeneratorOutputNode>();
  #lastNode: ASTGeneratorOutputNode | null = null;
  public constructor(tokens: ReadonlyArray<IToken>) {
    this.#tokens = Array.from(tokens);
  }
  public nextSibling(node: ASTGeneratorOutputNode) {
    return this.#nextSiblingMap.get(node) ?? null;
  }
  public previousSibling(node: ASTGeneratorOutputNode) {
    return this.#previousSiblingMap.get(node) ?? null;
  }
  public nodeByStartToken(token: IToken) {
    return this.#nodeByStartToken.get(token) ?? null;
  }
  public generate() {
    const nodes = new Array<ASTGeneratorOutputNode>();
    while (!this.#eof()) {
      nodes.push(this.#readNode());
    }
    return nodes;
  }
  #readNode(): ASTGeneratorOutputNode {
    let node: ASTGeneratorOutputNode;
    const match = this.#match();
    switch (match.value) {
      case 'import':
        node = this.#readImportStatement();
        break;
      case 'export':
        node = this.#readExportStatement();
        break;
      case 'type':
        node = this.#readTypeStatement();
        break;
      case 'call':
        node = this.#readCallStatement();
        break;
      case 'trait':
        node = this.#readTraitStatement();
        break;
      default:
        throw new UnexpectedToken(match);
    }
    this.#nodeByStartToken.set(match, node);
    this.#previousSiblingMap.set(node, this.#lastNode);
    if (this.#lastNode) {
      this.#nextSiblingMap.set(this.#lastNode, node);
    }
    this.#lastNode = node;
    return node;
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
  #match(): IToken {
    const token = this.#tokens[0];
    if (typeof token === 'undefined') {
      throw new EOF();
    }
    return token;
  }
  #readExportStatement(): INodeExportStatement {
    const startToken = this.#expectKeyword('export');
    const value = this.#readNode();

    switch (value.type) {
      case NodeType.ExportStatement:
      case NodeType.ImportStatement:
        throw new UnexpectedNodeType(value);
      case NodeType.TraitDefinition:
      case NodeType.TypeDefinition:
      case NodeType.CallDefinition:
        break;
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
      throw new UnexpectedPunctuatorName(punctuator, value);
    }
    return punctuator;
  }
  /**
   * consumes the token if it's a match, returns null if it's not
   * @param expectedType expected token type
   * @param value value that the token should contain
   * @returns the consumed IToken if everything matches
   */
  #matchByType(expectedType: TokenType, value: string) {
    const token = this.#peek(expectedType, value);
    if (token === null) {
      return null;
    }
    return this.#consume();
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
      throw new UnexpectedTokenValue(token, token.value);
    }
    return token;
  }
  #expectByType(expectedType: TokenType) {
    const token = this.#consume();
    if (token.type !== expectedType) {
      throw new UnexpectedTokenType(token, expectedType);
    }
    return token;
  }
  #consume(): IToken {
    const token = this.#tokens.shift();
    if (!token) {
      throw new EOF();
    }
    return token;
  }
  #eof() {
    return this.#tokens.length === 0;
  }
}
