import ASTGenerator, {
  ASTGeneratorOutputNode,
  EOF,
  INodeCallDefinition,
  INodeExportStatement,
  INodeIdentifier,
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
  getDecodeTraitFunctionName,
  getEncodeTraitFunctionName,
  getTypeDefinitionOrCallDecoderFunctionName,
  getTypeDefinitionOrCallDefinitionInterfaceName,
  getTypeDefinitionOrCallDefinitionNamePropertyValue,
  getTypeDefinitionOrCallDefinitionObjectCreator,
  getTypeDefinitionOrCallEncoderFunctionName,
} from './fileGeneratorUtilities';
import crc from 'cyclic-rc';
import JavaScriptObjectStringify from './JavaScriptObjectStringify';

export interface IFile {
  path: string;
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

export class DuplicateExport extends Exception {
  public constructor(public readonly node: INodeExportStatement) {
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
}

export type ResolvedTypeExpression =
  | {
      fileGenerator: FileGenerator;
      identifier: string;
    }
  | INodeTypeDefinition
  | INodeCallDefinition
  | {
      generic:
        | 'int'
        | 'uint32'
        | 'int32'
        | 'uint8'
        | 'int8'
        | 'float'
        | 'double'
        | 'uint16'
        | 'int16'
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
    };

export interface IRequirement {
  fileGenerator: FileGenerator;
  identifier: string;
}

export default class FileGenerator extends CodeStream {
  readonly #file;
  readonly #exports = new Map<
    string,
    INodeTypeDefinition | INodeCallDefinition
  >();
  readonly #identifiers = new Map<
    string,
    FileGenerator | INodeTypeDefinition | INodeCallDefinition
  >();
  readonly #traits = new Map<
    string,
    Array<INodeTypeDefinition | INodeCallDefinition>
  >();
  readonly #definitions = new Map<
    string,
    INodeTypeDefinition | INodeCallDefinition
  >();
  readonly #textEncoder;
  readonly #rootDir;
  readonly #textDecoder;
  readonly #outDir;
  readonly #files = new Array<IOutputFile>();
  readonly #typeScriptConfiguration;
  readonly #requirements = new Set<IRequirement>();
  readonly #indentationSize;
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
      typeScriptConfiguration,
    }: IFileGeneratorOptions
  ) {
    super(undefined, {
      indentationSize,
    });
    this.#file = file;
    this.#outDir = outDir;
    this.#rootDir = rootDir;
    this.#indentationSize = indentationSize;
    this.#textEncoder = textEncoder;
    this.#typeScriptConfiguration = typeScriptConfiguration;
    this.#textDecoder = textDecoder;
  }
  public async generate() {
    this.#nodes = new ASTGenerator(
      new Tokenizer({
        textDecoder: this.#textDecoder,
        textEncoder: this.#textEncoder,
        contents: await fs.promises.readFile(this.#file.path),
      }).tokenize()
    ).generate();
    while (!this.#eof()) {
      const node = this.#node();
      this.#offset++;
      await this.#processNode(node);
    }
    for (const [traitName, t] of this.#traits) {
      this.write(
        `export type ${traitName} = ${t
          .map((t) => t.name.value)
          .join(' | ')};\n`
      );
      this.#generateEncodeTraitFunction(traitName, t);
      this.#generateDecodeTraitFunction(traitName, t);
    }
    const outFile: IOutputFile = {
      file: `${this.#file.path.replace(
        new RegExp(`^${this.#rootDir}/`),
        ''
      )}.ts`,
      contents: this.value(),
    };
    this.#files.push(outFile);
    for (const node of this.#nodes) {
      switch (node.type) {
        case NodeType.ImportStatement:
          if (node.requirements === null) {
            break;
          }
          this.write(
            `import {${node.requirements
              .map((r) => r.value)
              .join(', ')}} from '${node.from.value}';\n`
          );
          break;
      }
    }
    const typesFilePath = path.relative(
      path.dirname(
        path.join(this.#outDir, this.#removeRootDir(this.#file.path))
      ),
      path.join(this.#outDir, '__types__')
    );
    this.write(
      `import { ISerializer, IDeserializer } from './${typesFilePath}';\n`
    );
    callDefinitionLoop: for (const node of this.#nodes) {
      switch (node.type) {
        case NodeType.CallDefinition:
          this.write(`import {IRequest} from './${typesFilePath}';\n`);
          break callDefinitionLoop;
      }
    }
    for (const req of this.#requirements) {
      this.write(
        `import {${req.identifier}} from './${path.relative(
          path.dirname(this.#file.path),
          req.fileGenerator.#file.path
        )}';\n`
      );
    }
    outFile.contents = `${this.value()}\n${outFile.contents}`;
    this.#createTypesFile();
    if (this.#typeScriptConfiguration) {
      const stringify = new JavaScriptObjectStringify();
      stringify.stringify(this.#typeScriptConfiguration);
      this.#files.push({
        file: 'tsconfig.json',
        contents: stringify.value(),
      });
    }
    return this.#files;
  }
  #removeRootDir(value: string) {
    return value.replace(new RegExp(`^${this.#rootDir}/`), '');
  }
  #createTypesFile() {
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
    this.#files.push({
      file: '__types__.ts',
      contents: this.value(),
    });
  }
  async #processNode(node: ASTGeneratorOutputNode) {
    const files = this.#files;
    switch (node.type) {
      case NodeType.ImportStatement: {
        const fileGenerator = new FileGenerator(
          {
            path: path.resolve(path.dirname(this.#file.path), node.from.value),
          },
          {
            indentationSize: this.#indentationSize,
            rootDir: this.#rootDir,
            outDir: this.#outDir,
            textDecoder: this.#textDecoder,
            textEncoder: this.#textEncoder,
          }
        );
        files.push(...(await fileGenerator.generate()));
        if (node.requirements) {
          for (const r of node.requirements) {
            this.#ownIdentifier(r, fileGenerator);
          }
        }
        break;
      }
      case NodeType.ExportStatement:
        this.#export(node);
        await this.#processNode(node.value);
        break;
      case NodeType.CallDefinition:
      case NodeType.TypeDefinition:
        for (const t of node.traits) {
          let traits = this.#traits.get(t.value);
          if (!traits) {
            traits = [];
            this.#traits.set(t.value, traits);
          }
          traits.push(node);
        }
        this.#ownIdentifier(node.name.value, node);
        this.#generateTypeDefinitionOrCallObjectCreator(node);
        this.#generateTypeDefinitionOrCallEncoderFunction(node);
        this.#generateTypeDefinitionOrCallDecoderFunction(node);
        this.#generateTypeDefinitionOrCallInterface(node);
        break;
    }
  }
  #export(node: INodeExportStatement) {
    if (this.#exports.has(node.value.name.value)) {
      throw new DuplicateExport(node);
    }
    this.#exports.set(node.value.name.value, node.value);
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
    const resolved = this.#resolveTypeExpression(typeExpression);
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
        break;
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
  #data() {
    return {
      identifiers: this.#identifiers,
      traits: this.#traits,
      exports: this.#exports,
    };
  }
  #generateTypeDefinitionOrCallInterface(
    node: INodeCallDefinition | INodeTypeDefinition
  ) {
    let interfaceExtends = '';
    if (node.type === NodeType.CallDefinition) {
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
  #generateEncodeTraitFunction(
    name: string,
    nodes: ReadonlyArray<INodeTypeDefinition | INodeCallDefinition>
  ) {
    this.write(
      `export function ${getEncodeTraitFunctionName(
        name
      )}(s: ISerializer,value: ${name}) {\n`,
      () => {
        this.write(
          'switch(value._name) {\n',
          () => {
            for (const trait of nodes) {
              const encodeFunctionName =
                getTypeDefinitionOrCallEncoderFunctionName(trait);
              this.write(
                `case '${getTypeDefinitionOrCallDefinitionNamePropertyValue(
                  trait,
                  this.#removeRootDir(this.#file.path)
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
    name: string,
    nodes: ReadonlyArray<INodeTypeDefinition | INodeCallDefinition>
  ) {
    this.write(
      `export function ${getDecodeTraitFunctionName(
        name
      )}(d: IDeserializer) {\n`,
      () => {
        this.write('const __id = d.readInt32();\n');
        this.write('d.rewindInt32();\n');
        this.write(
          `let value: ${nodes
            .map((n) => getTypeDefinitionOrCallDefinitionInterfaceName(n))
            .join(' | ')};\n`
        );

        this.write(
          'switch(__id) {\n',
          () => {
            for (const node of nodes) {
              this.write(`case ${this.#getUniqueHeader(node)}: {\n`);
              this.indentBlock(() => {
                this.write(
                  `const tmp = ${getTypeDefinitionOrCallDecoderFunctionName(
                    node
                  )}(d);\n`
                );
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
    depth = 0
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
            this.#generateEncodeTypeExpression(resolved.expression, value);
          });
          this.write('}\n');
          break;
        case 'vector':
          this.write(
            '{\n',
            () => {
              this.write(`s.writeUint32(${value}.length);\n`);
              const i = `a${depth}`;
              const lengthVarName = `i${i}`;
              this.write(`const ${lengthVarName} = ${value}.length;\n`);
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
            },
            '}\n'
          );
          break;
      }
    } else if ('fileGenerator' in resolved) {
      const data = resolved.fileGenerator.#data();
      const type =
        data.identifiers.get(resolved.identifier) ??
        data.traits.get(resolved.identifier);
      if (!type || type instanceof FileGenerator) {
        // console.log(resolved, type);
        throw new Error('WTF');
      }
      if (Array.isArray(type)) {
        this.#requirements.add({
          fileGenerator: resolved.fileGenerator,
          identifier: getEncodeTraitFunctionName(resolved.identifier),
        });
        this.write(
          `${getEncodeTraitFunctionName(resolved.identifier)}(s,${value});\n`
        );
      } else {
        const encodeFunctionName =
          getTypeDefinitionOrCallEncoderFunctionName(type);
        this.#requirements.add({
          identifier: encodeFunctionName,
          fileGenerator: resolved.fileGenerator,
        });
        this.write(
          `${getTypeDefinitionOrCallEncoderFunctionName(type)}(s,${value});\n`
        );
      }
    } else {
      this.write(
        `${getTypeDefinitionOrCallEncoderFunctionName(resolved)}(s,${value});\n`
      );
    }
  }
  #generateDecodeTypeExpression(
    exp: NodeTypeExpression,
    value: string,
    depth = 0
  ) {
    const resolved = this.#resolveTypeExpression(exp);
    if ('generic' in resolved) {
      switch (resolved.generic) {
        case 'int':
        case 'int32':
          this.write(`${value} = d.readInt32();\n`);
          break;
        case 'uint32':
          this.write(`${value} = d.readUint32();\n`);
          break;
        case 'uint16':
          this.write(`${value} = d.readUint16();\n`);
          break;
        case 'int16':
          this.write(`${value} = d.readInt16();\n`);
          break;
        case 'string':
          this.write(`${value} = d.readString();\n`);
          break;
        case 'float':
          this.write(`${value} = d.readFloat();\n`);
          break;
        case 'double':
          this.write(`${value} = d.readDouble();\n`);
          break;
        case 'bytes':
          this.write(`${value} = d.readBuffer(d.readUint32());\n`);
          break;
      }
    } else if ('template' in resolved) {
      switch (resolved.template) {
        case 'optional':
          this.write(
            'if(d.readUint8() === 1) {\n',
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
        case 'vector':
          this.write(
            '{\n',
            () => {
              const i = `a${depth}`;
              const lengthVarName = `i${i}`;
              this.write(`const ${lengthVarName} = d.readUint32();\n`);
              this.write(`${value} = new Array(${lengthVarName});\n`);
              this.write(
                `for(let ${i} = 0; ${i} < ${lengthVarName}; ${i}++) {\n`,
                () => {
                  this.#generateDecodeTypeExpression(
                    resolved.expression,
                    `${value}[${i}]`,
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
    } else if ('fileGenerator' in resolved) {
      const data = resolved.fileGenerator.#data();
      const type =
        data.identifiers.get(resolved.identifier) ??
        data.traits.get(resolved.identifier);
      if (!type || type instanceof FileGenerator) {
        throw new Error('WTF');
      }
      if (Array.isArray(type)) {
        if (resolved.fileGenerator !== this)
          this.#requirements.add({
            fileGenerator: resolved.fileGenerator,
            identifier: getDecodeTraitFunctionName(resolved.identifier),
          });
        this.write(
          `const tmp = ${getDecodeTraitFunctionName(resolved.identifier)}(d);\n`
        );
        this.write('if(tmp === null) return null;\n');
        this.write(`${value} = tmp;\n`);
      } else {
        this.#generateDecodeTypeCode(
          type,
          value,
          depth + 1,
          resolved.fileGenerator
        );
      }
    } else {
      this.write(
        `const tmp = ${getTypeDefinitionOrCallDecoderFunctionName(
          resolved
        )}(d);\n`
      );
      this.write('if(tmp === null) return null;\n');
      this.write(`${value} = tmp;\n`);
    }
  }
  #generateDecodeTypeCode(
    node: INodeCallDefinition | INodeTypeDefinition,
    value: string,
    depth: number,
    fileGenerator: FileGenerator
  ) {
    const decodeFunctionName = getTypeDefinitionOrCallDecoderFunctionName(node);
    this.#requirements.add({
      identifier: decodeFunctionName,
      fileGenerator,
    });
    const intermediaryValueVarName = `tmp${depth}`;
    this.write(
      `const ${intermediaryValueVarName} = ${decodeFunctionName}(d);\n`
    );
    this.write(`if(${intermediaryValueVarName} === null) return null;\n`);
    this.write(`${value} = ${intermediaryValueVarName};\n`);
  }
  #getUniqueHeader(node: INodeCallDefinition | INodeTypeDefinition) {
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
    const interfaceName = getTypeDefinitionOrCallDefinitionInterfaceName(node);
    const args = [
      's: ISerializer',
      `${node.parameters.length ? 'value' : '_'}: ${interfaceName}`,
    ];
    this.write(
      `export function ${getTypeDefinitionOrCallEncoderFunctionName(
        node
      )}(${args.join(', ')}) {\n`,
      () => {
        this.write(`s.writeInt32(${this.#getUniqueHeader(node)});\n`);
        for (const p of node.parameters) {
          this.#generateEncodeTypeExpression(
            p.typeExpression,
            `value['${p.name.value}']`
          );
        }
      },
      '}\n'
    );
  }
  #generateTypeDefinitionOrCallDecoderFunction(
    node: INodeCallDefinition | INodeTypeDefinition
  ) {
    const interfaceName = getTypeDefinitionOrCallDefinitionInterfaceName(node);
    this.write(
      `export function ${getTypeDefinitionOrCallDecoderFunctionName(
        node
      )}(d: IDeserializer): ${interfaceName} | null {\n`,
      () => {
        this.write('const __id = d.readInt32();\n');
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
        for (const p of node.parameters) {
          this.#generateDecodeTypeExpression(p.typeExpression, p.name.value);
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
    const interfaceName = getTypeDefinitionOrCallDefinitionInterfaceName(node);
    const paramsType = `Omit<${interfaceName},'_name'>`;
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
