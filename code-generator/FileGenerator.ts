import ASTGenerator, {
  ASTGeneratorOutputNode,
  EOF,
  INodeCallDefinition,
  INodeExportStatement,
  INodeTraitDefinition,
  INodeTypeDefinition,
  NodeType,
  NodeTypeExpression,
} from '../src/ASTGenerator';
import CodeStream from 'textstreamjs';
import fs from 'fs';
import path from 'path';
import Tokenizer, { ITextDecoder, ITextEncoder } from '../src/Tokenizer';
import Exception from '../exception/Exception';
import {
  getDecodeFunctionName,
  getTypeName,
  getTypeDefinitionOrCallDefinitionNamePropertyValue,
  getTypeDefinitionOrCallDefinitionObjectCreator as getCreateObjectFunctionName,
  getEncodeFunctionName,
  getTypeInputParamsInterfaceName,
  getDefaultFunctionName,
  getCompareFunctionName,
  getUpdateFunctionName,
} from './fileGeneratorUtilities';
import crc from 'crc';
import GenericName from './GenericName';
import JavaScriptObjectStringify from './JavaScriptObjectStringify';

export interface IFile {
  path: string;
}

export class ASTNodePreprocessingFailure extends Exception {
  public constructor(public readonly node: ASTGeneratorOutputNode) {
    super();
  }
}

export class DuplicateScopeIdentifier extends Exception {
  public constructor(
    public readonly node: FileGenerator | ASTGeneratorOutputNode
  ) {
    super();
  }
}

export class TypeScriptConfigurationParsingError extends Exception {
  public constructor(
    public readonly configuration: unknown | Record<string, unknown>
  ) {
    super();
  }
}

export class UnexpectedTraitOutputNodeCount extends Exception {
  public constructor(public readonly trait: INodeTraitDefinition) {
    super();
  }
}

export class UnsupportedTypeExpression extends Exception {
  public constructor(public readonly node: NodeTypeExpression) {
    super();
  }
}

export class UnsupportedTrait extends Exception {
  public constructor(public readonly name: string) {
    super();
  }
}

export class UnsupportedTemplate extends Exception {
  public constructor(public readonly node: NodeTypeExpression) {
    super();
  }
}

export class InvalidTemplateArgumentCount extends Exception {
  public constructor(public readonly node: NodeTypeExpression) {
    super();
  }
}

export class TypeNotFound extends Exception {}

export class TypeExpressionNotExported extends Exception {
  public constructor(public readonly node: ResolvedTypeExpression) {
    super();
  }
}

export class UnsupportedGenericExpression extends Exception {
  public constructor(public readonly node: ResolvedTypeExpression) {
    super();
  }
}

export class DuplicateExport extends Exception {
  public constructor(public readonly node: INodeExportStatement) {
    super();
  }
}

export class UnhandledNode extends Exception {
  public constructor(public readonly node: ASTGeneratorOutputNode) {
    super();
  }
}

export interface IOutputFile {
  file: string;
  contents: string;
}

export interface IFileGeneratorOptions {
  rootDir: string;
  indentationSize: number;
  outDir: string;
  textDecoder: ITextDecoder;
  typeScriptConfiguration?: Record<string, unknown>;
  textEncoder: ITextEncoder;
  root?: FileGenerator | null;
}

export type ResolvedTypeExpression =
  | {
      fileGenerator: FileGenerator;
      identifier: string;
    }
  | INodeTypeDefinition
  | INodeCallDefinition
  | INodeTraitDefinition
  | {
      generic: GenericName;
    }
  | {
      template: 'vector';
      expression: NodeTypeExpression;
      type: ResolvedTypeExpression;
    }
  | {
      template: 'optional';
      expression: NodeTypeExpression;
      type: ResolvedTypeExpression;
    }
  | {
      template: 'tuple';
      expressions: ReadonlyArray<NodeTypeExpression>;
      types: ResolvedTypeExpression[];
    };

export interface IIdentifierRequirement {
  fileGenerator: FileGenerator;
  alias?: string;
  identifier: string;
}

export type Requirement =
  | IIdentifierRequirement
  | {
      path: string;
      identifier: string;
    };

export interface ITrait {
  name: string;
  nodes: ResolvedTypeExpression[];
}
export default class FileGenerator extends CodeStream {
  readonly #file;
  readonly #exports = new Map<
    string,
    INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
  >();
  readonly #identifiers = new Map<string, null>();
  readonly #definitions = new Map<
    string,
    INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
  >();
  readonly #textEncoder;
  readonly #rootDir;
  readonly #textDecoder;
  readonly #outDir;
  readonly #typeScriptConfiguration;
  readonly #requirements = new Set<Requirement>();
  readonly #indentationSize;
  readonly #fileGenerators = new Map<string, FileGenerator>();
  readonly #parent;
  readonly #traits = new Map<string, ITrait>();
  #offset = 0;
  #nodes: Array<ASTGeneratorOutputNode> = [];
  #aliasUniqueId = 1;
  public constructor(
    file: IFile,
    {
      textDecoder,
      textEncoder,
      indentationSize,
      rootDir,
      outDir,
      root: parent = null,
      typeScriptConfiguration,
    }: IFileGeneratorOptions
  ) {
    super(undefined, {
      indentationSize,
    });
    this.#file = file;
    this.#parent = parent;
    this.#outDir = outDir;
    this.#rootDir = rootDir;
    this.#indentationSize = indentationSize;
    this.#textEncoder = textEncoder;
    this.#typeScriptConfiguration = typeScriptConfiguration;
    this.#textDecoder = textDecoder;
  }
  public async generate() {
    await this.#preprocess();
    this.#fillTraits();
    return this.#generateFiles();
  }
  async #preprocess() {
    const tokenizer = new Tokenizer({
      textDecoder: this.#textDecoder,
      textEncoder: this.#textEncoder,
      contents: await fs.promises.readFile(this.#file.path),
    });
    this.#nodes = new ASTGenerator(tokenizer.tokenize().tokens()).generate();
    for (const node of this.#nodes) {
      await this.#preprocessNode(node);
    }
  }
  #fillTraits() {
    for (const n of this.#definitions.values()) {
      switch (n.type) {
        case NodeType.CallDefinition:
        case NodeType.TypeDefinition: {
          for (const t of n.traits) {
            const resolved = this.#resolveTypeExpression(t);
            const fileGenerator =
              'fileGenerator' in resolved ? resolved.fileGenerator : this;
            let trait = fileGenerator.#traits.get(t.value);
            if (!trait) {
              trait = {
                name: t.value,
                nodes: [],
              };
              fileGenerator.#traits.set(t.value, trait);
            }

            trait.nodes.push({
              fileGenerator: this,
              identifier: n.name.value,
            });
          }
          break;
        }
      }
    }
    for (const fileGenerator of this.#fileGenerators.values()) {
      fileGenerator.#fillTraits();
    }
  }
  #generateFiles() {
    const files = new Array<IOutputFile>();
    for (const f of [...this.#fileGenerators.values(), this]) {
      f.#generateFinalCode();
      let contents = f.value();
      f.#generateRequirementsCode();
      contents = `${f.value()}${contents}`;
      files.push({
        file: `${f.#removeRootDir(f.#file.path)}.ts`,
        contents,
      });
    }
    files.push(this.#generateTypesFile());
    files.push(
      this.#generateTypeScriptConfigurationFile({
        compilerOptions: {
          noUncheckedIndexedAccess: false,
          noUnusedLocals: false,
        },
        include: files
          .map((f) => `./${f.file}`)
          .filter((t) => t.endsWith('.ts')),
      })
    );
    return files;
  }
  #request(req: Requirement) {
    const id = this.#identifiers.get(req.identifier);
    let out: string;
    if ('fileGenerator' in req) {
      if (req.fileGenerator === this) {
        return req.identifier;
      }
      if (typeof id !== 'undefined') {
        out = `${req.identifier}${this.#aliasUniqueId}`;
        req = {
          ...req,
          alias: out,
        };
        this.#aliasUniqueId++;
      } else {
        out = req.identifier;
      }
    } else {
      for (const req2 of this.#requirements) {
        if (!('fileGenerator' in req2)) {
          if (req2.identifier === req.identifier && req2.path === req.path) {
            return req.identifier;
          }
        }
      }
      out = req.identifier;
    }
    this.#identifiers.set(out, null);
    this.#requirements.add(req);
    return out;
  }
  #generateRequirementsCode() {
    for (const r of this.#requirements) {
      const file = this.#resolveFromRootFolder(
        'fileGenerator' in r
          ? this.#removeRootDir(r.fileGenerator.#file.path)
          : r.path
      );

      if ('fileGenerator' in r) {
        const id =
          typeof r.alias !== 'undefined'
            ? `${r.identifier} as ${r.alias}`
            : r.identifier;
        this.write(`import {${id}} from "${file}";\n`);
      } else {
        this.write(`import {${r.identifier}} from "${file}";\n`);
      }
    }
  }
  #generateFinalCode() {
    /**
     * generate code for all nodes
     */
    while (!this.#eof()) {
      const node = this.#node();
      this.#offset++;
      this.#generateNodeCode(node);
    }
  }
  #generateTypeScriptConfigurationFile(
    additionalTypeScriptConfiguration: Record<string, unknown>
  ) {
    const stringify = new JavaScriptObjectStringify();
    const config = {
      ...additionalTypeScriptConfiguration,
      ...(this.#typeScriptConfiguration ? this.#typeScriptConfiguration : {}),
    };
    stringify.stringify(config);
    return {
      file: 'tsconfig.json',
      contents: stringify.value(),
    };
  }
  #resolveFromRootFolder(file: string) {
    return `./${path.relative(
      path.dirname(
        path.join(this.#outDir, this.#removeRootDir(this.#file.path))
      ),
      path.join(this.#outDir, file)
    )}`;
  }
  #removeRootDir(value: string) {
    return value.replace(new RegExp(`^${this.#rootDir}/`), '');
  }
  #generateTypesFile() {
    this.write(
      'export type RequestResult<T> = T extends IRequest<infer R> ? R : never;\n'
    );
    this.write(
      'export interface ISerializer {\n',
      () => {
        this.write('writeUint8(value: number): void;\n');
        this.write('writeBuffer(value: Uint8Array): void;\n');
        this.write('writeUint32(value: number): void;\n');
        this.write('writeString(value: string): void;\n');
        this.write('writeNullTerminatedString(value: string): void;\n');
        this.write('writeSignedLong(value: string): void;\n');
        this.write('writeUnsignedLong(value: string): void;\n');
        this.write('writeInt32(value: number): void;\n');
        this.write('writeDouble(value: number): void;\n');
        this.write('writeFloat(value: number): void;\n');
      },
      '}\n'
    );
    this.write(
      'export interface IDeserializer {\n',
      () => {
        this.write('readUint8(): number;\n');
        this.write('readBuffer(length: number): Uint8Array;\n');
        this.write('readUint32(): number;\n');
        this.write('readString(): string;\n');
        this.write('readNullTerminatedString(): string;\n');
        this.write('readSignedLong(): string;\n');
        this.write('readUnsignedLong(): string;\n');
        this.write('readInt32(): number;\n');
        this.write('readDouble(): number;\n');
        this.write('readFloat(): number;\n');
        this.write('rewindInt32(): void;\n');
      },
      '}\n'
    );
    this.write(
      'export interface IRequest<T> {\n',
      () => {
        this.write('_returnType?: T;\n');
      },
      '}\n'
    );
    return {
      file: '__types__.ts',
      contents: this.value(),
    };
  }
  async #preprocessNode(node: ASTGeneratorOutputNode) {
    switch (node.type) {
      case NodeType.TraitDefinition:
      case NodeType.CallDefinition:
      case NodeType.TypeDefinition:
        this.#definitions.set(node.name.value, node);
        this.#identifiers.set(getCompareFunctionName(node), null);
        break;
      case NodeType.ExportStatement:
        this.#export(node);
        await this.#preprocessNode(node.value);
        break;
      case NodeType.ImportStatement: {
        const inputFile = path.resolve(
          path.dirname(this.#file.path),
          node.from.value
        );
        const root = this.#root();
        let fileGenerator = root.#fileGenerators.get(inputFile);
        if (!fileGenerator) {
          fileGenerator = new FileGenerator(
            {
              path: inputFile,
            },
            {
              root: root,
              indentationSize: this.#indentationSize,
              rootDir: this.#rootDir,
              outDir: this.#outDir,
              textDecoder: this.#textDecoder,
              textEncoder: this.#textEncoder,
            }
          );
          root.#fileGenerators.set(inputFile, fileGenerator);
          /**
           * preprocess import
           */
          await fileGenerator.#preprocess();
        }
        // FIXME: find a way to remove this and import interface names as needed
        if (node.requirements) {
          for (const r of node.requirements) {
            this.#request({
              fileGenerator,
              identifier: r.value,
            });
          }
        }
        break;
      }
      default:
        throw new ASTNodePreprocessingFailure(node);
    }
  }
  #root() {
    return this.#parent ?? this;
  }
  #generateDefinitionCompareFunction(
    node: INodeTypeDefinition | INodeCallDefinition
  ) {
    const args = [`__a: ${getTypeName(node)}`, `__b: ${getTypeName(node)}`];
    this.write(
      `export function ${getCompareFunctionName(node)}(${args.join(
        ', '
      )}): boolean {\n`,
      () => {
        if (!node.parameters.length) {
          this.write('return true;\n');
          return;
        }
        let depth = 0;
        this.write(
          'return (\n',
          () => {
            for (const p of node.parameters) {
              this.#writeMultilineComment(`compare parameter ${p.name.value}`);
              this.write('');
              this.#generateComparisonExpression(
                p.typeExpression,
                `__a['${p.name.value}']`,
                `__b['${p.name.value}']`,
                depth
              );
              if (p !== node.parameters[node.parameters.length - 1]) {
                this.append(' &&');
              }
              this.append('\n');
              depth++;
            }
          },
          ');\n'
        );
      },
      '}\n'
    );
  }
  #generateComparisonExpression(
    expression: NodeTypeExpression,
    v1: string,
    v2: string,
    depth: number
  ) {
    const resolved = this.#resolveTypeExpression(expression);
    if ('generic' in resolved) {
      switch (resolved.generic) {
        case 'bytes': {
          const expressions = [
            `${v1}.byteLength === ${v2}.byteLength`,
            `${v1}.every((__byte,index) => ${v2}[index] === __byte)`,
          ];
          this.append(expressions.join(' && '));
          break;
        }
        case GenericName.Integer:
        case GenericName.Uint32:
        case GenericName.Int32:
        case GenericName.Uint8:
        case GenericName.Int8:
        case GenericName.Uint16:
        case GenericName.Int16:
        case GenericName.Float:
        case GenericName.Double:
        case GenericName.String:
        case GenericName.Long:
        case GenericName.UnsignedLong:
        case GenericName.NullTerminatedString:
          this.append(`${v1} === ${v2}`);
          break;
        default:
          throw new UnsupportedGenericExpression(resolved);
      }
    } else if ('fileGenerator' in resolved) {
      const type = this.#resolvedTypeExpressionToDefinition(resolved);
      const compareFunctionName = this.#request({
        fileGenerator: resolved.fileGenerator,
        identifier: getCompareFunctionName(type),
      });
      this.append(`${compareFunctionName}(${v1},${v2})`);
    } else if ('template' in resolved) {
      switch (resolved.template) {
        case 'optional': {
          const optionalVarName1 = `__dp${depth}1`;
          const optionalVarName2 = `__dp${depth}2`;
          this.append(`((${optionalVarName1}, ${optionalVarName2}) => `);
          this.append(
            `${optionalVarName1} !== null && ${optionalVarName2} !== null ? `
          );
          this.#generateComparisonExpression(
            resolved.expression,
            optionalVarName1,
            optionalVarName2,
            depth + 1
          );
          this.append(` : ${optionalVarName1} === ${optionalVarName2}`);
          this.append(`)(${v1},${v2})`);
          break;
        }
        case 'vector':
          this.append(
            [
              `${v1}.length === ${v2}.length`,
              `${v1}.every((__i,index) => (`,
            ].join(' && ')
          );
          this.#generateComparisonExpression(
            resolved.expression,
            '__i',
            `${v2}[index]`,
            depth + 1
          );
          this.append('))');
          break;
        case 'tuple': {
          const exps = resolved.expressions.map((exp, index) => ({
            exp,
            varName1: `__a${depth}${index}`,
            varName2: `__b${depth}${index}`,
            index,
          }));
          for (const { exp, index, varName1, varName2 } of exps) {
            this.append(
              `/* compare tuple item ${index} of type ${this.#resolveTypeExpressionToString(
                {
                  typeExpression: exp,
                  readOnly: true,
                }
              )} */ ((${varName1}, ${varName2}) => `
            );
            this.#generateComparisonExpression(
              exp,
              varName1,
              varName2,
              depth + index + 1
            );
            this.append(`)(${v1}[${index}],${v2}[${index}])`);
            if (exp !== resolved.expressions[resolved.expressions.length - 1]) {
              this.append(' && ');
            }
          }
          break;
        }
        default:
          throw new UnsupportedTemplate(expression);
      }
    } else {
      this.append(`${getCompareFunctionName(resolved)}(${v1},${v2})`);
    }
  }
  #generateDefinitionDefaultObjectCreator(
    node: INodeTypeDefinition | INodeCallDefinition
  ) {
    this.write(
      `export function ${getDefaultFunctionName(
        node
      )}(params: Partial<${getTypeInputParamsInterfaceName(
        node
      )}> = {}): ${getTypeName(node)} {\n`,
      () => {
        this.write(
          `return ${getCreateObjectFunctionName(node)}({\n`,
          () => {
            for (const p of node.parameters) {
              this.write(
                `${
                  p.name.value
                }: ${this.#resolvedTypeExpressionToDefaultExpression(
                  this.#resolveTypeExpression(p.typeExpression)
                )}`
              );
              this.append(',\n');
            }
            this.write('...params\n');
          },
          '});\n'
        );
      },
      '}\n'
    );
  }
  #resolvedTypeExpressionToDefaultExpression(
    resolved: ResolvedTypeExpression
  ): string {
    if ('generic' in resolved) {
      switch (resolved.generic) {
        case GenericName.Bytes:
          return 'new Uint8Array(0)';
        case GenericName.Long:
        case GenericName.UnsignedLong:
          return '"0"';
        case GenericName.Float:
        case GenericName.Double:
          return '0.0';
        case GenericName.Integer:
        case GenericName.Uint32:
        case GenericName.Int32:
        case GenericName.Int16:
        case GenericName.Uint16:
        case GenericName.Uint8:
        case GenericName.Int8:
          return '0';
        case GenericName.String:
        case GenericName.NullTerminatedString:
          return '""';
      }
    } else if ('template' in resolved) {
      switch (resolved.template) {
        case 'optional':
          return 'null';
        case 'tuple':
          return `[${resolved.types
            .map((e) => this.#resolvedTypeExpressionToDefaultExpression(e))
            .join(',')}]`;
        case 'vector':
          return '[]';
      }
    }
    const type = this.#resolvedTypeExpressionToDefinition(resolved);
    if ('fileGenerator' in resolved) {
      this.#request({
        identifier: getDefaultFunctionName(type),
        fileGenerator: resolved.fileGenerator,
      });
    }
    return `${getDefaultFunctionName(type)}()`;
  }
  #generateDefinitionUpdateFunction(
    node: INodeCallDefinition | INodeTypeDefinition
  ) {
    const changesVarName = node.parameters.length ? 'changes' : '_';
    this.write(
      `export function ${getUpdateFunctionName(node)}(value: ${getTypeName(
        node
      )}, ${changesVarName}: Partial<${getTypeInputParamsInterfaceName(
        node
      )}>) {\n`,
      () => {
        let depth = 0;
        for (const p of node.parameters) {
          this.write(
            `if(typeof changes['${p.name.value}'] !== 'undefined') {\n`,
            () => {
              this.write('if(!(');
              this.#generateComparisonExpression(
                p.typeExpression,
                `changes['${p.name.value}']`,
                `value['${p.name.value}']`,
                depth
              );
              this.append(')) {\n');
              this.indentBlock(() => {
                this.write(
                  `value = ${getCreateObjectFunctionName(node)}({\n`,
                  () => {
                    this.write('...value,\n');
                    this.write(
                      `${p.name.value}: changes['${p.name.value}'],\n`
                    );
                  },
                  '});\n'
                );
              });
              this.write('}\n');
              depth++;
            },
            '}\n'
          );
        }
        this.write('return value;\n');
      },
      '}\n'
    );
  }
  #generateNodeCode(node: ASTGeneratorOutputNode) {
    switch (node.type) {
      case NodeType.ExportStatement:
        this.#generateNodeCode(node.value);
        break;
      case NodeType.CallDefinition:
      case NodeType.TypeDefinition:
        this.#generateDefinitionObjectCreatorFunction(node);
        this.#generateDefinitionEncodeFunction(node);
        this.#generateDefinitionDecodeFunction(node);
        this.#generateDefinitionInterface(node);
        this.#generateDefinitionDefaultObjectCreator(node);
        this.#generateDefinitionCompareFunction(node);
        this.#generateDefinitionUpdateFunction(node);
        break;
      case NodeType.TraitDefinition: {
        const trait = this.#traits.get(node.name.value);
        if (!trait) {
          break;
        }
        for (const node of trait.nodes) {
          if ('fileGenerator' in node) {
            this.#request(node);
          }
        }
        this.write(
          `export type ${node.name.value} = ${trait.nodes
            .map((n) =>
              this.#resolvedTypeExpressionToString({
                resolvedTypeExpression: n,
                readOnly: true,
              })
            )
            .join(' | ')};\n`
        );

        this.#generateEncodeTraitFunction(node, trait.nodes);
        this.#generateDecodeTraitFunction(node, trait.nodes);
        this.#generateTraitDefaultFunction(node, trait.nodes);
        this.#generateTraitCompareFunction(node, trait.nodes);
        break;
      }
      case NodeType.ImportStatement:
        break;
      default:
        throw new UnhandledNode(node);
    }
  }
  #export(node: INodeExportStatement) {
    const exportName = node.value.name.value;
    if (this.#exports.has(exportName)) {
      throw new DuplicateExport(node);
    }
    this.#exports.set(exportName, node.value);
  }
  #resolveTypeExpressionToString(options: {
    typeExpression: NodeTypeExpression;
    readOnly: boolean;
  }): string {
    const { readOnly, typeExpression } = options;
    return this.#resolvedTypeExpressionToString({
      resolvedTypeExpression: this.#resolveTypeExpression(typeExpression),
      readOnly,
    });
  }
  #resolvedTypeExpressionToString(options: {
    resolvedTypeExpression: ResolvedTypeExpression;
    readOnly: boolean;
  }) {
    const { resolvedTypeExpression: resolved, readOnly } = options;
    if ('generic' in resolved) {
      switch (resolved.generic) {
        case GenericName.Integer:
        case GenericName.Uint32:
        case GenericName.Int32:
        case GenericName.Uint8:
        case GenericName.Int8:
        case GenericName.Float:
        case GenericName.Double:
        case GenericName.Uint16:
        case GenericName.Int16:
          return 'number';
        case GenericName.String:
        case GenericName.NullTerminatedString:
        case GenericName.Long:
        case GenericName.UnsignedLong:
          return 'string';
        case GenericName.Bytes:
          return 'Uint8Array';
      }
    } else if ('template' in resolved) {
      switch (resolved.template) {
        case 'optional':
          return `${this.#resolveTypeExpressionToString({
            ...options,
            typeExpression: resolved.expression,
          })} | null`;
        case 'tuple':
          return `[${resolved.expressions.map((t) =>
            this.#resolveTypeExpressionToString({
              ...options,
              typeExpression: t,
            })
          )}]`;
        case 'vector':
          return `${
            readOnly ? 'ReadonlyArray' : 'Array'
          }<${this.#resolveTypeExpressionToString({
            ...options,
            typeExpression: resolved.expression,
          })}>`;
      }
    }
    const name =
      'fileGenerator' in resolved ? resolved.identifier : resolved.name.value;
    if (readOnly) {
      return `Readonly<${name}>`;
    }
    return name;
  }
  #resolveTypeExpression(
    typeExpression: NodeTypeExpression
  ): ResolvedTypeExpression {
    switch (typeExpression.type) {
      case NodeType.TemplateExpression:
        switch (typeExpression.name.value) {
          case 'tuple':
            return {
              template: 'tuple',
              expressions: typeExpression.templateArguments,
              types: typeExpression.templateArguments.map((t) =>
                this.#resolveTypeExpression(t)
              ),
            };
          case 'optional': {
            const optionalType = typeExpression.templateArguments[0];
            if (typeof optionalType === 'undefined') {
              throw new InvalidTemplateArgumentCount(typeExpression);
            }
            return {
              template: 'optional',
              expression: optionalType,
              type: this.#resolveTypeExpression(optionalType),
            };
          }
          case 'vector': {
            const vectorType = typeExpression.templateArguments[0];
            if (typeof vectorType === 'undefined') {
              throw new InvalidTemplateArgumentCount(typeExpression);
            }
            return {
              template: 'vector',
              expression: vectorType,
              type: this.#resolveTypeExpression(vectorType),
            };
          }
          default:
            throw new UnsupportedTemplate(typeExpression);
        }
      case NodeType.Identifier: {
        switch (typeExpression.value) {
          case GenericName.Integer:
          case GenericName.Uint32:
          case GenericName.Int32:
          case GenericName.Uint8:
          case GenericName.Int8:
          case GenericName.Float:
          case GenericName.Double:
          case GenericName.Uint16:
          case GenericName.Int16:
          case GenericName.String:
          case GenericName.NullTerminatedString:
          case GenericName.Bytes:
          case GenericName.Long:
          case GenericName.UnsignedLong:
            return {
              generic: typeExpression.value,
            };
        }
        break;
      }
    }

    /**
     * just confirm that the type exists
     */
    const id =
      this.#definitions.get(typeExpression.value) ??
      this.#fileGeneratorFromRequirements(typeExpression.value);

    if (!id) {
      throw new UnsupportedTypeExpression(typeExpression);
    }

    if (id instanceof FileGenerator) {
      return {
        identifier: typeExpression.value,
        fileGenerator: id,
      };
    }

    return id;
  }
  #fileGeneratorFromRequirements(id: string) {
    for (const r of this.#requirements) {
      if (
        'fileGenerator' in r &&
        r.identifier === id &&
        r.fileGenerator.#definitions.has(id)
      ) {
        return r.fileGenerator;
      }
    }
    return null;
  }
  #generateDefinitionInterface(
    node: INodeCallDefinition | INodeTypeDefinition
  ) {
    let interfaceExtends = '';
    if (node.type === NodeType.CallDefinition) {
      this.#request({
        path: '__types__',
        identifier: 'IRequest',
      });
      interfaceExtends = `extends IRequest<${this.#resolveTypeExpressionToString(
        { typeExpression: node.returnType, readOnly: true }
      )}>`;
    }
    this.write(
      `export interface ${node.name.value} ${interfaceExtends} {\n`,
      () => {
        this.write(
          `_name: '${getTypeDefinitionOrCallDefinitionNamePropertyValue(
            node,
            this.#removeRootDir(this.#file.path)
          )}';\n`
        );
        this.#generateTypeDefinitionOrCallParameters(node);
      },
      '}\n'
    );
  }
  #resolvedTypeExpressionToDefinition(exp: ResolvedTypeExpression) {
    if ('fileGenerator' in exp) {
      const result =
        exp.fileGenerator === this
          ? this.#definitions.get(exp.identifier) ??
            this.#exports.get(exp.identifier)
          : exp.fileGenerator.#exports.get(exp.identifier);
      if (!result) {
        throw new TypeExpressionNotExported(exp);
      }
      return result;
    }
    if ('generic' in exp || 'template' in exp) {
      throw new UnsupportedGenericExpression(exp);
    }
    return exp;
  }
  #generateTraitDefaultFunction(
    trait: INodeTraitDefinition,
    exps: ResolvedTypeExpression[]
  ) {
    const [firstNode] = exps;
    if (typeof firstNode === 'undefined') {
      throw new UnexpectedTraitOutputNodeCount(trait);
    }
    this.write(
      `export function ${getDefaultFunctionName(trait)}() {\n`,
      () => {
        // FIXME: when traits exporting traits is implemented, this needs to be revisited to keep searching the list until a valid definition is found
        const node = this.#resolvedTypeExpressionToDefinition(firstNode);
        if ('fileGenerator' in firstNode) {
          this.#request({
            fileGenerator: firstNode.fileGenerator,
            identifier: getDefaultFunctionName(node),
          });
        }
        this.write(`return ${getDefaultFunctionName(node)}();\n`);
      },
      '}\n'
    );
  }
  #generateEncodeTraitFunction(
    trait: INodeTraitDefinition,
    exps: ResolvedTypeExpression[]
  ) {
    this.#request({
      path: '__types__',
      identifier: 'ISerializer',
    });
    this.write(
      `export function ${getEncodeFunctionName(
        trait
      )}(__s: ISerializer,value: ${getTypeName(trait)}) {\n`,
      () => {
        this.write(
          'switch(value._name) {\n',
          () => {
            for (const exp of exps) {
              const isExternalRequirement = 'fileGenerator' in exp;
              const fileGenerator = isExternalRequirement
                ? exp.fileGenerator
                : this;
              const def = this.#resolvedTypeExpressionToDefinition(exp);
              const encodeFunctionName = getEncodeFunctionName(def);
              if (isExternalRequirement)
                this.#request({
                  ...exp,
                  identifier: encodeFunctionName,
                });
              this.write(
                `case '${getTypeDefinitionOrCallDefinitionNamePropertyValue(
                  def,
                  this.#removeRootDir(fileGenerator.#file.path)
                )}':\n`
              );
              this.indentBlock(() => {
                this.write(`${encodeFunctionName}(__s,value);\n`);
                this.write('break;\n');
              });
            }
          },
          '}\n'
        );
      },
      '}\n'
    );
  }
  #generateTraitCompareFunction(
    trait: INodeTraitDefinition,
    exps: ResolvedTypeExpression[]
  ) {
    const args = [`__a: ${getTypeName(trait)}`, `__b: ${getTypeName(trait)}`];
    this.write(
      `export function ${getCompareFunctionName(trait)}(${args.join(
        ', '
      )}) {\n`,
      () => {
        this.write(
          'switch(__a._name) {\n',
          () => {
            for (const exp of exps) {
              const isExternalRequirement = 'fileGenerator' in exp;
              const fileGenerator = isExternalRequirement
                ? exp.fileGenerator
                : this;
              const def = this.#resolvedTypeExpressionToDefinition(exp);
              let compareFunctionName = getCompareFunctionName(def);
              if (isExternalRequirement) {
                compareFunctionName = this.#request({
                  ...exp,
                  identifier: compareFunctionName,
                });
              }
              const typeStringifiedName =
                getTypeDefinitionOrCallDefinitionNamePropertyValue(
                  def,
                  this.#removeRootDir(fileGenerator.#file.path)
                );
              this.write(`case '${typeStringifiedName}':\n`);
              this.indentBlock(() => {
                this.write(
                  `if(__b._name !== "${typeStringifiedName}") return false;\n`
                );
                this.write(`return ${compareFunctionName}(__a,__b);\n`);
              });
            }
          },
          '}\n'
        );
      },
      '}\n'
    );
  }
  #generateDecodeTraitFunction(
    trait: INodeTraitDefinition,
    exps: ResolvedTypeExpression[]
  ) {
    const nodes = exps.map((exp) =>
      this.#resolvedTypeExpressionToDefinition(exp)
    );
    this.#request({
      path: '__types__',
      identifier: 'IDeserializer',
    });
    this.write(
      `export function ${getDecodeFunctionName(trait)}(__d: IDeserializer) {\n`,
      () => {
        this.write('const __id = __d.readInt32();\n');
        this.write('__d.rewindInt32();\n');
        this.write(
          `let value: ${nodes.map((n) => getTypeName(n)).join(' | ')};\n`
        );

        this.write(
          'switch(__id) {\n',
          () => {
            for (const exp of exps) {
              const def = this.#resolvedTypeExpressionToDefinition(exp);
              const isExternalRequirement = 'fileGenerator' in exp;
              const decodeFunctionName = getDecodeFunctionName(def);
              const fileGenerator = isExternalRequirement
                ? exp.fileGenerator
                : this;
              if (isExternalRequirement)
                this.#request({
                  ...exp,
                  identifier: decodeFunctionName,
                });
              this.write(`case ${fileGenerator.#getUniqueHeader(def)}: {\n`);
              this.indentBlock(() => {
                this.write(`const tmp = ${decodeFunctionName}(__d);\n`);
                this.write('if(tmp === null) return null;\n');
                this.write('value = tmp;\n');
                this.write('break;\n');
              });
              this.write('}\n');
            }
            this.write('default: return null;\n');
          },
          '}\n'
        );
        this.write('return value;\n');
      },
      '}\n'
    );
  }
  #generateEncodeTypeExpression(
    exp: NodeTypeExpression,
    value: string,
    depth: number
  ) {
    const resolved = this.#resolveTypeExpression(exp);
    const serializerVarName = '__s';
    if ('generic' in resolved) {
      switch (resolved.generic) {
        case GenericName.Integer:
        case GenericName.Int32:
          this.write(`${serializerVarName}.writeInt32(${value});\n`);
          break;
        case GenericName.Uint32:
          this.write(`${serializerVarName}.writeUint32(${value});\n`);
          break;
        case GenericName.Uint16:
          this.write(`${serializerVarName}.writeUint16(${value});\n`);
          break;
        case GenericName.Int16:
          this.write(`${serializerVarName}.writeInt16(${value});\n`);
          break;
        case GenericName.Long:
          this.write(`${serializerVarName}.writeSignedLong(${value});\n`);
          break;
        case GenericName.UnsignedLong:
          this.write(`${serializerVarName}.writeUnsignedLong(${value});\n`);
          break;
        case GenericName.String:
          this.write(`${serializerVarName}.writeString(${value});\n`);
          break;
        case GenericName.NullTerminatedString:
          this.write(
            `${serializerVarName}.writeNullTerminatedString(${value});\n`
          );
          break;
        case GenericName.Float:
          this.write(`${serializerVarName}.writeFloat(${value});\n`);
          break;
        case GenericName.Double:
          this.write(`${serializerVarName}.writeDouble(${value});\n`);
          break;
        case GenericName.Bytes:
          this.write(
            `${serializerVarName}.writeUint32(${value}.byteLength);\n`
          );
          this.write(`${serializerVarName}.writeBuffer(${value});\n`);
          break;
      }
    } else if ('template' in resolved) {
      switch (resolved.template) {
        case 'optional':
          this.write(
            `if(${value} === null) {\n`,
            () => {
              this.write(`${serializerVarName}.writeUint8(0);\n`);
            },
            '} else {\n'
          );
          this.indentBlock(() => {
            this.write(`${serializerVarName}.writeUint8(1);\n`);
            depth = this.#generateEncodeTypeExpression(
              resolved.expression,
              value,
              depth + 1
            );
          });
          this.write('}\n');
          break;
        case 'vector': {
          const i = `__i${depth}`;
          const lengthVarName = `__l${depth}`;
          this.write(`const ${lengthVarName} = ${value}.length;\n`);
          this.write(`${serializerVarName}.writeUint32(${lengthVarName});\n`);
          this.write(
            `for(let ${i} = 0; ${i} < ${lengthVarName}; ${i}++) {\n`,
            () => {
              const valueVarName = `__v${i}`;
              this.write(`const ${valueVarName} = ${value}[${i}];\n`);
              depth = this.#generateEncodeTypeExpression(
                resolved.expression,
                valueVarName,
                depth + 1
              );
            },
            '}\n'
          );
          break;
        }
        case 'tuple': {
          let i = 0;
          for (const exp of resolved.expressions) {
            const valueVarName = `__t${depth}${depth}`;
            this.write(`const ${valueVarName} = ${value}[${i}];\n`);
            depth = this.#generateEncodeTypeExpression(
              exp,
              valueVarName,
              depth + i + 1
            );
            i++;
          }
          break;
        }
        default:
          throw new UnsupportedTemplate(resolved);
      }
    } else if ('fileGenerator' in resolved) {
      const type = resolved.fileGenerator.#exports.get(resolved.identifier);
      if (!type) {
        throw new TypeNotFound();
      }
      if (Array.isArray(type)) {
        const node = this.#resolvedTypeExpressionToDefinition(type);
        const encodeFunctionName = this.#request({
          ...resolved,
          identifier: getEncodeFunctionName(node),
        });
        this.write(`${encodeFunctionName}(${serializerVarName},${value});\n`);
      } else {
        const encodeFunctionName = this.#request({
          identifier: getEncodeFunctionName(type),
          fileGenerator: resolved.fileGenerator,
        });
        this.write(`${encodeFunctionName}(${serializerVarName},${value});\n`);
      }
    } else {
      this.write(
        `${getEncodeFunctionName(resolved)}(${serializerVarName},${value});\n`
      );
    }
    return depth;
  }
  #generateDecodeTypeExpression(
    exp: NodeTypeExpression,
    value: string,
    depth: number
  ): number {
    const resolved = this.#resolveTypeExpression(exp);
    if ('generic' in resolved) {
      switch (resolved.generic) {
        case GenericName.Int32:
        case GenericName.Integer:
          this.write(`${value} = __d.readInt32();\n`);
          break;
        case GenericName.Uint32:
          this.write(`${value} = __d.readUint32();\n`);
          break;
        case GenericName.Uint16:
          this.write(`${value} = __d.readUint16();\n`);
          break;
        case GenericName.Int16:
          this.write(`${value} = __d.readInt16();\n`);
          break;
        case GenericName.String:
          this.write(`${value} = __d.readString();\n`);
          break;
        case GenericName.NullTerminatedString:
          this.write(`${value} = __d.readNullTerminatedString();\n`);
          break;
        case GenericName.Long:
          this.write(`${value} = __d.readSignedLong();\n`);
          break;
        case GenericName.UnsignedLong:
          this.write(`${value} = __d.readUnsignedLong();\n`);
          break;
        case GenericName.Float:
          this.write(`${value} = __d.readFloat();\n`);
          break;
        case GenericName.Double:
          this.write(`${value} = __d.readDouble();\n`);
          break;
        case GenericName.Bytes:
          this.write(`${value} = __d.readBuffer(__d.readUint32());\n`);
          break;
      }
    } else if ('template' in resolved) {
      switch (resolved.template) {
        case 'optional':
          this.write(
            'if(__d.readUint8() === 1) {\n',
            () => {
              depth = this.#generateDecodeTypeExpression(
                resolved.expression,
                value,
                depth + 1
              );
            },
            '} else {\n'
          );
          this.indentBlock(() => {
            this.write(`${value} = null;\n`);
          });
          this.write('}\n');
          break;
        case 'tuple': {
          const varNames = new Array<string>();
          for (const typeExpression of resolved.expressions) {
            const varName = `__e${depth}`;
            this.write(
              `let ${varName}: ${this.#resolveTypeExpressionToString({
                readOnly: false,
                typeExpression,
              })};\n`
            );
            depth = this.#generateDecodeTypeExpression(
              typeExpression,
              varName,
              depth + 1
            );
            varNames.push(varName);
          }
          this.write(`${value} = [${varNames.join(',')}];\n`);
          break;
        }
        case 'vector': {
          const i = `index${depth}`;
          const lengthVarName = `i${i}`;
          const outVarName = `o${i}`;
          this.write(`const ${lengthVarName} = __d.readUint32();\n`);
          this.write(
            `const ${outVarName} = new Array<${this.#resolveTypeExpressionToString(
              { typeExpression: resolved.expression, readOnly: false }
            )}>(${lengthVarName});\n`
          );
          this.write(`${value} = ${outVarName};\n`);
          this.write(
            `for(let ${i} = 0; ${i} < ${lengthVarName}; ${i}++) {\n`,
            () => {
              depth = this.#generateDecodeTypeExpression(
                resolved.expression,
                `${outVarName}[${i}]`,
                depth + 1
              );
            },
            '}\n'
          );
          break;
        }
        default:
          throw new UnsupportedTemplate(exp);
      }
    } else if ('fileGenerator' in resolved) {
      const type = this.#resolvedTypeExpressionToDefinition(resolved);

      depth = this.#generateDecodeTypeCode(
        type,
        value,
        depth + 1,
        resolved.fileGenerator
      );
    } else {
      const tmpVarName = `__tmp${depth}`;
      this.write(
        `const ${tmpVarName} = ${getDecodeFunctionName(resolved)}(__d);\n`
      );
      this.write(`if(${tmpVarName} === null) return null;\n`);
      this.write(`${value} = ${tmpVarName};\n`);
    }
    return depth;
  }
  #generateDecodeTypeCode(
    node: INodeCallDefinition | INodeTypeDefinition | INodeTraitDefinition,
    value: string,
    depth: number,
    fileGenerator: FileGenerator
  ) {
    const decodeFunctionName = this.#request({
      identifier: getDecodeFunctionName(node),
      fileGenerator,
    });
    const intermediaryValueVarName = `tmp${depth}`;
    this.write(
      `const ${intermediaryValueVarName} = ${decodeFunctionName}(__d);\n`
    );
    this.write(`if(${intermediaryValueVarName} === null) return null;\n`);
    this.write(`${value} = ${intermediaryValueVarName};\n`);
    return depth;
  }
  #getUniqueHeaderString(
    node: INodeTraitDefinition | INodeCallDefinition | INodeTypeDefinition
  ) {
    const values = [
      node.type.toString(),
      `${this.#removeRootDir(this.#file.path)}.${node.name.value}`,
    ];
    switch (node.type) {
      case NodeType.CallDefinition:
      case NodeType.TypeDefinition:
        values.push(
          node.parameters
            .map((p) =>
              this.#resolveTypeExpressionToString({
                readOnly: true,
                typeExpression: p.typeExpression,
              })
            )
            .join(', ')
        );
    }
    return values.join(' : ');
  }
  #getUniqueHeader(
    node: INodeTraitDefinition | INodeCallDefinition | INodeTypeDefinition
  ) {
    const n = crc.crc32(this.#getUniqueHeaderString(node));
    const view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, n, true);
    return view.getInt32(0, true);
  }
  #generateDefinitionEncodeFunction(
    node: INodeCallDefinition | INodeTypeDefinition
  ) {
    const interfaceName = getTypeName(node);
    this.#request({
      path: '__types__',
      identifier: 'ISerializer',
    });
    const args = [
      '__s: ISerializer',
      `${node.parameters.length ? 'value' : '_'}: ${interfaceName}`,
    ];
    this.write(
      `export function ${getEncodeFunctionName(node)}(${args.join(', ')}) {\n`,
      () => {
        this.write(`__s.writeInt32(${this.#getUniqueHeader(node)});\n`);
        let depth = 0;
        for (const p of node.parameters) {
          this.#writeMultilineComment(`encoding param: ${p.name.value}`);
          const valueVarName = `__pv${depth}`;
          this.write(`const ${valueVarName} = value['${p.name.value}'];\n`);
          depth = this.#generateEncodeTypeExpression(
            p.typeExpression,
            `${valueVarName}`,
            depth + 1
          );
        }
      },
      '}\n'
    );
  }
  #writeMultilineComment(value: string) {
    this.write('/**\n');
    for (const line of value.split('\n')) {
      this.write(` * ${line}\n`);
    }
    this.write(' */\n');
  }
  #generateDefinitionDecodeFunction(
    node: INodeCallDefinition | INodeTypeDefinition
  ) {
    const interfaceName = getTypeName(node);
    this.#request({
      path: '__types__',
      identifier: 'IDeserializer',
    });
    this.write(
      `export function ${getDecodeFunctionName(
        node
      )}(__d: IDeserializer): ${interfaceName} | null {\n`,
      () => {
        this.write('const __id = __d.readInt32();\n');
        this.#writeMultilineComment('decode header');
        this.write(
          `if(__id !== ${this.#getUniqueHeader(node)}) return null;\n`
        );
        for (const p of node.parameters) {
          this.write(
            `let ${p.name.value}: ${this.#resolveTypeExpressionToString({
              typeExpression: p.typeExpression,
              readOnly: false,
            })};\n`
          );
        }
        let i = 0;
        for (const p of node.parameters) {
          this.#writeMultilineComment(`decoding param: ${p.name.value}`);
          i = this.#generateDecodeTypeExpression(
            p.typeExpression,
            p.name.value,
            i + 1
          );
        }
        this.write(
          'return {\n',
          () => {
            this.write(
              `_name: '${getTypeDefinitionOrCallDefinitionNamePropertyValue(
                node,
                this.#removeRootDir(this.#file.path)
              )}',\n`
            );
            for (const p of node.parameters) {
              this.write(`${p.name.value}`);
              if (p !== node.parameters[node.parameters.length - 1]) {
                this.append(',');
              }
              this.append('\n');
            }
          },
          '};\n'
        );
      },
      '}\n'
    );
  }
  #generateDefinitionObjectCreatorFunction(
    node: INodeCallDefinition | INodeTypeDefinition
  ) {
    const interfaceName = getTypeName(node);
    const paramsType = getTypeInputParamsInterfaceName(node);
    this.write(
      `export interface ${paramsType} {\n`,
      () => {
        this.#generateTypeDefinitionOrCallParameters(node);
      },
      '}\n'
    );
    const defaultAssignment = node.parameters.length ? '' : ' = {}';
    const paramsVarName = node.parameters.length ? 'params' : '_';
    this.write(
      `export function ${getCreateObjectFunctionName(
        node
      )}(${paramsVarName}: ${paramsType}${defaultAssignment}): ${interfaceName} {\n`,
      () => {
        this.write(
          'return {\n',
          () => {
            this.write(
              `_name: '${getTypeDefinitionOrCallDefinitionNamePropertyValue(
                node,
                this.#removeRootDir(this.#file.path)
              )}'`
            );
            if (node.parameters.length) {
              this.append(',');
            }
            this.append('\n');
            for (const p of node.parameters) {
              this.write(`${p.name.value}: params['${p.name.value}']`);
              if (p !== node.parameters[node.parameters.length - 1]) {
                this.append(',');
              }
              this.append('\n');
            }
          },
          '};\n'
        );
      },
      '}\n'
    );
  }
  #generateTypeDefinitionOrCallParameters(
    node: INodeTypeDefinition | INodeCallDefinition
  ) {
    for (const p of node.parameters) {
      this.write(
        `${p.name.value}: ${this.#resolveTypeExpressionToString({
          typeExpression: p.typeExpression,
          readOnly: true,
        })};\n`
      );
    }
  }
  #node() {
    const node = this.#nodes[this.#offset];
    if (typeof node === 'undefined') {
      throw new EOF();
    }
    return node;
  }
  #eof() {
    return this.#offset === this.#nodes.length;
  }
}
