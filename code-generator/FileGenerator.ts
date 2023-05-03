import ASTGenerator, {
  ASTGeneratorOutputNode,
  EOF,
  INodeCallDefinition,
  INodeExportStatement,
  INodeIdentifier,
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
  getTypeDefinitionOrCallDefinitionObjectCreator,
  getEncodeFunctionName,
  getTypeInputParamsInterfaceName,
  getDefaultFunctionName,
} from './fileGeneratorUtilities';
import crc from 'cyclic-rc';
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
      generic:
        | 'int'
        | 'uint32'
        | 'int32'
        | 'uint8'
        | 'int8'
        | 'uint16'
        | 'int16'
        | 'float'
        | 'double'
        | 'string'
        | 'bytes';
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
  readonly #identifiers = new Map<
    string,
    FileGenerator | INodeTypeDefinition | INodeCallDefinition
  >();
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
    this.#nodes = new ASTGenerator(tokenizer.tokenize()).generate();
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
    this.#requirements.add(req);
  }
  #generateRequirementsCode() {
    const fileRequirements = new Map<string, Set<string>>();
    for (const r of this.#requirements) {
      const file = this.#resolveFromRootFolder(
        'fileGenerator' in r
          ? this.#removeRootDir(r.fileGenerator.#file.path)
          : r.path
      );
      let ids = fileRequirements.get(file);
      if (ids?.has(r.identifier)) {
        continue;
      }
      if (!ids) {
        ids = new Set();
        fileRequirements.set(file, ids);
      }
      ids.add(r.identifier);
      if ('fileGenerator' in r) {
        if (r.fileGenerator === this) {
          continue;
        }
        this.write(`import {${r.identifier}} from "${file}";\n`);
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
        // for (const t of node.traits) {
        //   const fileGenerator = this.#identifiers.get(t.value);
        //   if (!(fileGenerator instanceof FileGenerator)) {
        //     continue;
        //   }
        //   let traits = fileGenerator.#traits.get(t.value);
        //   if (!traits) {
        //     traits = [];
        //     fileGenerator.#traits.set(t.value, traits);
        //   }
        //   traits.push(node);
        // }
        // this.#ownIdentifier(node.name.value, node);
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
        if (node.requirements) {
          for (const r of node.requirements) {
            this.#ownIdentifier(r, fileGenerator);
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
  #generateTypeDefinitionOrCallDefaultObjectCreator(
    node: INodeTypeDefinition | INodeCallDefinition
  ) {
    this.write(
      `export function ${getDefaultFunctionName(node)}(): ${getTypeName(
        node
      )} {\n`,
      () => {
        this.write(
          `return ${getTypeDefinitionOrCallDefinitionObjectCreator(node)}({\n`,
          () => {
            for (const p of node.parameters) {
              this.write(
                `${
                  p.name.value
                }: ${this.#resolvedTypeExpressionToDefaultExpression(
                  this.#resolveTypeExpression(p.typeExpression)
                )}`
              );
              if (p !== node.parameters[node.parameters.length - 1]) {
                this.append(',');
              }
              this.append('\n');
            }
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
        case 'bytes':
          return 'new Uint8Array(0)';
        case 'float':
        case 'double':
          return '0.0';
        case 'int':
        case 'uint32':
        case 'int32':
        case 'uint16':
        case 'int16':
        case 'uint8':
        case 'int8':
          return '0';
        case 'string':
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
      this.#requirements.add({
        identifier: getDefaultFunctionName(type),
        fileGenerator: resolved.fileGenerator,
      });
    }
    return `${getDefaultFunctionName(type)}()`;
  }
  #generateNodeCode(node: ASTGeneratorOutputNode) {
    switch (node.type) {
      case NodeType.ExportStatement:
        this.#generateNodeCode(node.value);
        break;
      case NodeType.CallDefinition:
      case NodeType.TypeDefinition:
        this.#generateTypeDefinitionOrCallObjectCreator(node);
        this.#generateTypeDefinitionOrCallEncoderFunction(node);
        this.#generateTypeDefinitionOrCallDecoderFunction(node);
        this.#generateTypeDefinitionOrCallInterface(node);
        this.#generateTypeDefinitionOrCallDefaultObjectCreator(node);
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
  #ownIdentifier(
    id: string | INodeIdentifier,
    value: FileGenerator | INodeTypeDefinition | INodeCallDefinition
  ) {
    if (typeof id !== 'string') {
      id = id.value;
    }
    if ('type' in value) {
      this.#definitions.set(id, value);
    }
    if (this.#identifiers.has(id)) {
      throw new DuplicateScopeIdentifier(value);
    }
    this.#identifiers.set(id, value);
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
        case 'int':
        case 'uint32':
        case 'int32':
        case 'uint8':
        case 'int8':
        case 'float':
        case 'double':
        case 'uint16':
        case 'int16':
          return 'number';
        case 'string':
          return 'string';
        case 'bytes':
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
    } else if ('fileGenerator' in resolved) {
      return resolved.identifier;
    }
    return resolved.name.value;
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
          case 'int':
          case 'uint32':
          case 'int32':
          case 'uint8':
          case 'int8':
          case 'float':
          case 'double':
          case 'uint16':
          case 'int16':
          case 'string':
          case 'bytes':
            return {
              generic: typeExpression.value,
            };
        }
        break;
      }
    }
    const id =
      this.#definitions.get(typeExpression.value) ??
      this.#identifiers.get(typeExpression.value);

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
  #generateTypeDefinitionOrCallInterface(
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
      )}(s: ISerializer,value: ${getTypeName(trait)}) {\n`,
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
                this.write(`${encodeFunctionName}(s,value);\n`);
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
    if ('generic' in resolved) {
      switch (resolved.generic) {
        case 'int':
        case 'int32':
          this.write(`s.writeInt32(${value});\n`);
          break;
        case 'uint32':
          this.write(`s.writeUint32(${value});\n`);
          break;
        case 'uint16':
          this.write(`s.writeUint16(${value});\n`);
          break;
        case 'int16':
          this.write(`s.writeInt16(${value});\n`);
          break;
        case 'string':
          this.write(`s.writeString(${value});\n`);
          break;
        case 'float':
          this.write(`s.writeFloat(${value});\n`);
          break;
        case 'double':
          this.write(`s.writeDouble(${value});\n`);
          break;
        case 'bytes':
          this.write(`s.writeUint32(${value}.byteLength);\n`);
          this.write(`s.writeBuffer(${value});\n`);
          break;
      }
    } else if ('template' in resolved) {
      switch (resolved.template) {
        case 'optional':
          this.write(
            `if(${value} === null) {\n`,
            () => {
              this.write('s.writeUint8(0);\n');
            },
            '} else {\n'
          );
          this.indentBlock(() => {
            this.write('s.writeUint8(1);\n');
            this.#generateEncodeTypeExpression(
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
          this.write(`s.writeUint32(${lengthVarName});\n`);
          this.write(
            `for(let ${i} = 0; ${i} < ${lengthVarName}; ${i}++) {\n`,
            () => {
              this.write(`const v${i} = ${value}[${i}];\n`);
              this.#generateEncodeTypeExpression(
                resolved.expression,
                `v${i}`,
                depth + 1
              );
            },
            '}\n'
          );
          break;
        }
        case 'tuple': {
          let i = 0;
          this.write(
            '{\n',
            () => {
              for (const exp of resolved.expressions) {
                const valueVarName = `__t${depth}${i}`;
                this.write(`const ${valueVarName} = ${value}[${i}];\n`);
                this.write(
                  '{\n',
                  () => {
                    this.#generateEncodeTypeExpression(
                      exp,
                      `${valueVarName}`,
                      depth + 1
                    );
                  },
                  '}\n'
                );
                i++;
              }
            },
            '}\n'
          );
          break;
        }
        default:
          throw new UnsupportedTemplate(resolved);
      }
    } else if ('fileGenerator' in resolved) {
      const type =
        resolved.fileGenerator.#exports.get(resolved.identifier) ??
        resolved.fileGenerator.#identifiers.get(resolved.identifier);
      if (!type || type instanceof FileGenerator) {
        throw new TypeNotFound();
      }
      type;
      if (Array.isArray(type)) {
        const node = this.#resolvedTypeExpressionToDefinition(type);
        this.#request(resolved);
        this.write(`${getEncodeFunctionName(node)}(s,${value});\n`);
      } else {
        const encodeFunctionName = getEncodeFunctionName(type);
        this.#requirements.add({
          identifier: encodeFunctionName,
          fileGenerator: resolved.fileGenerator,
        });
        this.write(`${getEncodeFunctionName(type)}(s,${value});\n`);
      }
    } else {
      this.write(`${getEncodeFunctionName(resolved)}(s,${value});\n`);
    }
  }
  #generateDecodeTypeExpression(
    exp: NodeTypeExpression,
    value: string,
    depth: number
  ) {
    const resolved = this.#resolveTypeExpression(exp);
    if ('generic' in resolved) {
      switch (resolved.generic) {
        case 'int':
        case 'int32':
          this.write(`${value} = __d.readInt32();\n`);
          break;
        case 'uint32':
          this.write(`${value} = __d.readUint32();\n`);
          break;
        case 'uint16':
          this.write(`${value} = __d.readUint16();\n`);
          break;
        case 'int16':
          this.write(`${value} = __d.readInt16();\n`);
          break;
        case 'string':
          this.write(`${value} = __d.readString();\n`);
          break;
        case 'float':
          this.write(`${value} = __d.readFloat();\n`);
          break;
        case 'double':
          this.write(`${value} = __d.readDouble();\n`);
          break;
        case 'bytes':
          this.write(`${value} = __d.readBuffer(__d.readUint32());\n`);
          break;
      }
    } else if ('template' in resolved) {
      switch (resolved.template) {
        case 'optional':
          this.write(
            'if(__d.readUint8() === 1) {\n',
            () => {
              this.#generateDecodeTypeExpression(
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
        case 'tuple':
          this.write(
            '{\n',
            () => {
              let i = 0;
              interface ITupleExpressionItem {
                varName: string;
                index: number;
                typeExpression: NodeTypeExpression;
              }
              const exps = new Array<ITupleExpressionItem>();
              for (const typeExpression of resolved.expressions) {
                const varName = `e${i}`;
                this.write(
                  `let ${varName}: ${this.#resolveTypeExpressionToString({
                    readOnly: false,
                    typeExpression,
                  })};\n`
                );
                exps.push({
                  index: i,
                  varName,
                  typeExpression,
                });
                i++;
              }
              for (const { index, varName, typeExpression } of exps) {
                this.write(
                  '{\n',
                  () => {
                    this.#generateDecodeTypeExpression(
                      typeExpression,
                      `${varName}`,
                      depth + index
                    );
                  },
                  '}\n'
                );
              }
              this.write(
                `${value} = [${exps.map((exp) => exp.varName).join(',')}];\n`
              );
            },
            '}\n'
          );
          break;
        case 'vector': {
          const i = `index${depth}`;
          const lengthVarName = `i${i}`;
          const outVarName = `o${i}`;
          this.write(
            '{\n',
            () => {
              this.write(`const ${lengthVarName} = __d.readUint32();\n`);
              this.write(
                `const ${outVarName} = new Array(${lengthVarName});\n`
              );
              this.write(`${value} = ${outVarName};\n`);
              this.write(
                `for(let ${i} = 0; ${i} < ${lengthVarName}; ${i}++) {\n`,
                () => {
                  this.#generateDecodeTypeExpression(
                    resolved.expression,
                    `${outVarName}[${i}]`,
                    depth + 1
                  );
                },
                '}\n'
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

      this.#generateDecodeTypeCode(
        type,
        value,
        depth + 1,
        resolved.fileGenerator
      );
    } else {
      const tmpVarName = `tmp${depth}`;
      this.write(
        `const ${tmpVarName} = ${getDecodeFunctionName(resolved)}(__d);\n`
      );
      this.write(`if(${tmpVarName} === null) return null;\n`);
      this.write(`${value} = ${tmpVarName};\n`);
    }
  }
  #generateDecodeTypeCode(
    node: INodeCallDefinition | INodeTypeDefinition | INodeTraitDefinition,
    value: string,
    depth: number,
    fileGenerator: FileGenerator
  ) {
    const decodeFunctionName = getDecodeFunctionName(node);
    this.#requirements.add({
      identifier: decodeFunctionName,
      fileGenerator,
    });
    const intermediaryValueVarName = `tmp${depth}`;
    this.write(
      `const ${intermediaryValueVarName} = ${decodeFunctionName}(__d);\n`
    );
    this.write(`if(${intermediaryValueVarName} === null) return null;\n`);
    this.write(`${value} = ${intermediaryValueVarName};\n`);
  }
  #getUniqueHeader(
    node: INodeTraitDefinition | INodeCallDefinition | INodeTypeDefinition
  ) {
    const view = new DataView(new ArrayBuffer(4));
    const n = crc.crc_32(
      `${this.#removeRootDir(this.#file.path)}.${node.name.value}`
    );
    view.setUint32(0, n, true);
    return view.getInt32(0, true);
  }
  #generateTypeDefinitionOrCallEncoderFunction(
    node: INodeCallDefinition | INodeTypeDefinition
  ) {
    const interfaceName = getTypeName(node);
    this.#request({
      path: '__types__',
      identifier: 'ISerializer',
    });
    const args = [
      's: ISerializer',
      `${node.parameters.length ? 'value' : '_'}: ${interfaceName}`,
    ];
    this.write(
      `export function ${getEncodeFunctionName(node)}(${args.join(', ')}) {\n`,
      () => {
        this.write(`s.writeInt32(${this.#getUniqueHeader(node)});\n`);
        let i = 0;
        for (const p of node.parameters) {
          this.#writeMultilineComment(`encoding param: ${p.name.value}`);
          const valueVarName = `pv${i}`;
          this.write(`const ${valueVarName} = value['${p.name.value}'];\n`);
          this.#generateEncodeTypeExpression(
            p.typeExpression,
            `${valueVarName}`,
            i
          );
          i++;
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
  #generateTypeDefinitionOrCallDecoderFunction(
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
          this.#generateDecodeTypeExpression(p.typeExpression, p.name.value, i);
          i++;
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
  #generateTypeDefinitionOrCallObjectCreator(
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
    this.write(
      `export function ${getTypeDefinitionOrCallDefinitionObjectCreator(
        node
      )}(params: ${paramsType}): ${interfaceName} {\n`,
      () => {
        this.write(
          'return {\n',
          () => {
            this.write(
              `_name: '${getTypeDefinitionOrCallDefinitionNamePropertyValue(
                node,
                this.#removeRootDir(this.#file.path)
              )}',\n`
            );
            this.write('...params\n');
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
