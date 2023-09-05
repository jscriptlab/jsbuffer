import path from 'path';
import CodeStream from 'textstreamjs';
import {
  IMetadataCall,
  IMetadataFileContents,
  IMetadataType,
  IParamTypeMetadataExternalType,
  IParamTypeMetadataInternalType,
  ITraitMetadata,
  Metadata,
  MetadataImport,
  TypeExpressionMetadata
} from './types';
import GenericName from './GenericName';
import Exception from '../exception/Exception';
import assert from 'assert';
import { lowerFirst, upperFirst } from './stringUtilities';
import { readJSONFile } from './fileGeneratorUtilities';

export interface IOutputFile {
  path: string;
  contents: string;
}

type KotlinTypeImport =
  | string
  | {
      id: string;
      filePath: string;
    }
  | Metadata;

function getVarName(prefix: string, value: string, depth: number) {
  return `${prefix}${upperFirst(value)}${depth}`;
}

function getClassName(
  metadata:
    | Metadata
    | IParamTypeMetadataExternalType
    | IParamTypeMetadataInternalType
) {
  if ('type' in metadata) {
    switch (metadata.type) {
      case 'externalType':
        return upperFirst(metadata.name);
      case 'internalType':
        return upperFirst(metadata.interfaceName);
    }
  }
  switch (metadata.kind) {
    case 'call':
    case 'type':
    case 'trait':
      return upperFirst(metadata.name);
  }
}

function getTraitClassTypeDiscriminatorPropertyName(metadata: ITraitMetadata) {
  switch (metadata.kind) {
    case 'trait':
      return `${lowerFirst(metadata.name)}Type`;
  }
}

export default class FileGeneratorKotlin extends CodeStream {
  readonly #metadata;
  readonly #kind;
  /**
   * kt file identifier
   */
  readonly #filePath;
  readonly #schemaName;
  readonly #files = new Array<IOutputFile>();
  readonly #fileGenerators = new Map<string | Metadata, FileGeneratorKotlin>();
  readonly #imports = new Set<KotlinTypeImport>();
  readonly #importMetadataList = new Array<MetadataImport>();
  public constructor({
    filePath,
    metadata,
    schemaName,
    kind = null,
    indentationSize = 2
  }: {
    filePath: string;
    schemaName: string;
    metadata: IMetadataFileContents;
    /**
     * null is root
     */
    kind?:
      | {
          root: FileGeneratorKotlin;
          metadata: Metadata;
        }
      /**
       * a file that is a subtree, which means it's not root, but also, not targeting
       * a specific metadata type
       */
      | {
          root: FileGeneratorKotlin;
        }
      | null;
    indentationSize?: number;
  }) {
    super(undefined, {
      indentationSize
    });
    this.#metadata = metadata.__all;
    this.#importMetadataList = metadata.__imports;
    this.#schemaName = schemaName;
    this.#filePath = filePath;
    this.#kind = kind;
  }
  public async generate(): Promise<IOutputFile[]> {
    /**
     * set root file generator in case it's imported
     */
    this.#fileGenerators.set(this.#filePath, this);

    await this.#createFileGenerators();

    for (const gen of this.#fileGenerators.values()) {
      await gen.#preprocess();
    }

    for (const gen of this.#fileGenerators.values()) {
      await gen.#preprocess();
    }

    /**
     * call iterator again, because now the #fileGenerators of the root file was generated
     */
    for (const [key, gen] of this.#fileGenerators) {
      if (!gen.#kind || !('metadata' in gen.#kind)) {
        continue;
      }
      const file = await gen.#generateMetadataFile();
      if (!file) {
        throw new Error(
          `Failed to generate metadata file: ${key} at ${this.#filePath}`
        );
      }
      this.#files.push(file);
    }
    return this.#files;
  }
  #root(): FileGeneratorKotlin {
    return this.#kind === null ? this : this.#kind.root;
  }
  async #createFileGeneratorsFromParamTypeMetadata(
    paramTypeMetadata: TypeExpressionMetadata
  ) {
    const root = this.#root();
    switch (paramTypeMetadata.type) {
      case 'internalType':
      case 'externalType': {
        const filePath =
          this.#metadataFilePathFromParamTypeMetadata(paramTypeMetadata);
        const existingGenerator = root.#fileGenerators.get(filePath) ?? null;
        if (existingGenerator) {
          break;
        }
        const metadata = await readJSONFile<IMetadataFileContents>(filePath);
        const generator = new FileGeneratorKotlin({
          filePath,
          kind: {
            root
          },
          schemaName: this.#schemaName,
          metadata
        });
        root.#fileGenerators.set(filePath, generator);
        await generator.#createFileGenerators();
        break;
      }
      case 'template':
        switch (paramTypeMetadata.template) {
          case 'optional':
          case 'vector':
          case 'set':
            await this.#createFileGeneratorsFromParamTypeMetadata(
              paramTypeMetadata.value
            );
            break;
          case 'map':
            await this.#createFileGeneratorsFromParamTypeMetadata(
              paramTypeMetadata.key
            );
            await this.#createFileGeneratorsFromParamTypeMetadata(
              paramTypeMetadata.value
            );
            break;
          case 'bigint':
          case 'tuple':
            break;
        }
        break;
      case 'generic':
      case 'externalModuleType':
        break;
    }
  }
  async #createFileGenerators() {
    const kind = this.#kind;
    if (kind !== null && 'metadata' in kind) {
      return;
    }
    const root = this.#root();
    for (const i of this.#importMetadataList) {
      const key = path.resolve(
        path.dirname(this.#filePath),
        `${i.relativePath}.metadata.json`
      );
      let gen = root.#fileGenerators.get(key);
      if (!gen) {
        const fileContents = await readJSONFile<IMetadataFileContents>(key);
        gen = new FileGeneratorKotlin({
          filePath: key,
          metadata: fileContents,
          kind: {
            root
          },
          schemaName: this.#schemaName
        });
        root.#fileGenerators.set(key, gen);
        await gen.#createFileGenerators();
      }
    }
    for (const metadata of this.#metadata) {
      switch (metadata.kind) {
        case 'trait':
        case 'type':
        case 'call': {
          const fg = root.#fileGenerators.get(metadata);
          if (fg) {
            break;
          }
          const generator = new FileGeneratorKotlin({
            filePath: this.#filePath,
            kind: {
              metadata,
              root
            },
            metadata: {
              __all: this.#metadata,
              __imports: this.#importMetadataList
            },
            schemaName: this.#schemaName
          });
          root.#fileGenerators.set(metadata, generator);
          const expMetadataList = new Array<TypeExpressionMetadata>();
          switch (metadata.kind) {
            case 'call':
              expMetadataList.push(metadata.returnType);
              break;
            case 'type':
            case 'trait':
          }
          switch (metadata.kind) {
            case 'trait':
              expMetadataList.push(...metadata.nodes);
              break;
            case 'call':
            case 'type':
              expMetadataList.push(...metadata.traits);
              expMetadataList.push(...metadata.params.map((p) => p.type));
          }
          for (const metadata of expMetadataList) {
            await this.#createFileGeneratorsFromParamTypeMetadata(metadata);
          }
          break;
        }
      }
    }
  }
  /**
   * fill in #imports of this file, should only be run on metadata file generators
   */
  async #preprocess() {
    for (const metadata of this.#metadata) {
      const gen = this.#root().#fileGenerators.get(metadata);
      assert.strict.ok(gen);
      await gen.#preprocessMetadata(metadata);
    }
  }
  async #preprocessMetadata(metadata: Metadata) {
    switch (metadata.kind) {
      case 'call':
      case 'type':
        for (const t of metadata.traits) {
          await this.#preprocessMetadataParam(t);
        }
        for (const p of metadata.params) {
          await this.#preprocessMetadataParam(p.type);
        }
        break;
      case 'trait':
        for (const node of metadata.nodes) {
          await this.#preprocessMetadataParam(node);
        }
    }
  }
  #metadataFilePathFromParamTypeMetadata(
    metadataType:
      | IParamTypeMetadataInternalType
      | IParamTypeMetadataExternalType
  ) {
    switch (metadataType.type) {
      case 'internalType':
        return this.#filePath;
      case 'externalType': {
        const currentDir = path.dirname(this.#filePath);
        return path.resolve(
          currentDir,
          `${metadataType.relativePath}.metadata.json`
        );
      }
    }
  }
  async #preprocessMetadataParam(metadataType: TypeExpressionMetadata) {
    this.#imports.add('java.io.DataOutput');
    this.#imports.add('java.io.DataInputStream');
    switch (metadataType.type) {
      case 'template':
        switch (metadataType.template) {
          case 'vector':
          case 'optional':
          case 'set':
            await this.#preprocessMetadataParam(metadataType.value);
            break;
          case 'map':
            await this.#preprocessMetadataParam(metadataType.key);
            await this.#preprocessMetadataParam(metadataType.value);
            break;
          case 'bigint':
          case 'tuple':
            break;
        }
        break;
      case 'generic':
        break;
      case 'internalType': {
        const metadata = this.#metadata.find(
          (m) => m.name === metadataType.interfaceName
        );
        assert.strict.ok(metadata);
        break;
      }
      case 'externalType': {
        const filePath =
          this.#metadataFilePathFromParamTypeMetadata(metadataType);
        const imports = this.#imports;
        const i = Array.from(imports).find((j) =>
          typeof j === 'string'
            ? false
            : 'filePath' in j
            ? j.filePath === filePath && j.id === metadataType.name
            : false
        );
        if (!i) {
          imports.add({
            filePath,
            id: metadataType.name
          });
        }
        break;
      }
      case 'externalModuleType':
        throw new Exception(
          'External module types are not supported for Kotlin generator'
        );
    }
  }
  #currentMetadata() {
    const kind = this.#kind;
    assert.strict.ok(kind !== null && 'metadata' in kind);
    const { metadata } = kind;
    return metadata;
  }
  #packageName() {
    const metadata = this.#currentMetadata();
    assert.strict.ok(this.#metadata.includes(metadata));
    switch (metadata.kind) {
      case 'trait':
      case 'type':
      case 'call': {
        const globalNameSlices = metadata.globalName.split('.');
        return [
          this.#schemaName,
          ...globalNameSlices.slice(0, globalNameSlices.length - 1)
        ];
      }
    }
  }
  #outRelativeFilePath() {
    const metadata = this.#currentMetadata();
    switch (metadata.kind) {
      case 'call':
      case 'type':
      case 'trait': {
        return [
          ...this.#schemaName.split('.'),
          ...metadata.globalName
            .split('.')
            .map((a, _, list) =>
              a === list[list.length - 1] ? upperFirst(a) : a
            )
        ];
      }
    }
  }
  async #generateMetadataFile() {
    const metadata = this.#currentMetadata();
    switch (metadata.kind) {
      case 'trait':
      case 'type':
      case 'call': {
        const packageName = this.#packageName();
        this.write(`package ${packageName.join('.')}\n`);
        const filePath = `${path.join(...this.#outRelativeFilePath())}.kt`;
        const root = this.#root();
        for (const i of this.#imports) {
          let id: string;
          let rootFileGen: FileGeneratorKotlin | null;
          if (typeof i === 'string') {
            this.write(`import ${i}\n`);
            continue;
          }
          if ('name' in i) {
            id = i.name;
            rootFileGen = root.#fileGenerators.get(i) ?? null;
          } else {
            id = i.id;
            rootFileGen = root.#fileGenerators.get(i.filePath) ?? null;
          }
          assert.strict.ok(rootFileGen);
          const importedMetadata = rootFileGen.#metadata.find(
            (m) => m.name === id
          );
          assert.strict.ok(importedMetadata);
          const gen = root.#fileGenerators.get(importedMetadata);
          assert.strict.ok(gen);
          switch (gen.#currentMetadata().kind) {
            case 'call':
            case 'type':
            case 'trait':
              this.write(
                `import ${gen.#packageName().join('.')}.${getClassName(
                  importedMetadata
                )}\n`
              );
              break;
          }
        }
        await this.#generateCode(metadata);
        return {
          path: filePath,
          contents: this.value()
        };
      }
    }
    return null;
  }
  async #generateCode(metadata: Metadata) {
    switch (metadata.kind) {
      case 'call':
      case 'type': {
        this.write(
          `class ${getClassName(metadata)}(\n`,
          () => {
            for (const param of metadata.params) {
              this.write(
                `val ${param.name}: ${this.#resolveMetadataParamType(
                  param.type
                )}`
              );
              if (param !== metadata.params[metadata.params.length - 1]) {
                this.append(',');
              }
              this.append('\n');
            }
          },
          ') {\n'
        );
        this.indentBlock(() => {
          this.write(
            'companion object {\n',
            () => {
              this.write(
                `fun decode(d: DataInputStream): ${getClassName(
                  metadata
                )}? {\n`,
                () => {
                  this.write(`if(d.readInt() != ${metadata.id}) return null\n`);
                  let depth = 0;
                  for (const p of metadata.params) {
                    depth = this.#writeDecodeCall(p.type, p.name, depth + 1);
                  }
                  this.write(
                    `return ${getClassName(metadata)}(\n`,
                    () => {
                      for (const p of metadata.params) {
                        this.write(`${p.name}`);
                        if (p !== metadata.params[metadata.params.length - 1]) {
                          this.append(',');
                        }
                        this.append('\n');
                      }
                    },
                    ')\n'
                  );
                },
                '}\n'
              );
            },
            '}\n'
          );
          this.write(
            'fun encode(s: DataOutput) {\n',
            () => {
              this.write(`s.writeInt(${metadata.id})\n`);
              let depth = 0;
              for (const p of metadata.params) {
                depth = this.#writeEncodeCall(p.type, p.name, depth + 1);
              }
            },
            '}\n'
          );
        });
        this.write('}\n');
        break;
      }
      case 'trait': {
        interface IParam {
          classParamName: string;
          typeName: string;
          private: boolean;
          nonOptionalTypeName: string;
          node: TypeExpressionMetadata | null;
        }
        const params: IParam[] = metadata.nodes.map((node) => {
          const gen = this.#fileGeneratorFromParamTypeMetadata(node);
          return {
            private: false,
            node,
            nonOptionalTypeName: getClassName(gen.#currentMetadata()),
            classParamName: lowerFirst(gen.#currentMetadata().name),
            typeName: `${getClassName(gen.#currentMetadata())}?`
          };
        });
        const traitTypePropName =
          getTraitClassTypeDiscriminatorPropertyName(metadata);
        params.unshift({
          node: null,
          typeName: 'Int',
          nonOptionalTypeName: 'Int',
          private: true,
          classParamName: traitTypePropName
        });
        const traitClassName = getClassName(metadata);
        const nodes = new Array<{
          node: IMetadataCall | IMetadataType;
          param: IParam;
        }>();
        for (const param of params) {
          if (param.node === null) continue;
          const fg = this.#fileGeneratorFromParamTypeMetadata(param.node);
          const currentMetadata = fg.#currentMetadata();
          assert.strict.ok(!('nodes' in currentMetadata));
          nodes.push({ node: currentMetadata, param });
        }
        const switchInterfaceName = `${traitClassName}Switch`;
        this.write(
          `interface ${switchInterfaceName}<T> {\n`,
          () => {
            for (const { param } of nodes) {
              this.write(
                `fun ${param.classParamName}(${
                  param.classParamName
                }: ${param.typeName.replace(/\?$/, '')}): T\n`
              );
            }
          },
          '}\n'
        );
        this.write(
          `class ${traitClassName}(\n`,
          () => {
            for (const p of params) {
              this.write(
                `${p.private ? 'private ' : ''}val ${p.classParamName}: ${
                  p.typeName
                }`
              );
              if (p !== params[params.length - 1]) {
                this.append(',');
              }
              this.append('\n');
            }
          },
          ') {\n'
        );
        this.indentBlock(() => {
          this.write(
            'companion object {\n',
            () => {
              this.write(
                `fun decode(d: DataInputStream): ${traitClassName}? {\n`,
                () => {
                  this.write('d.mark(4)\n');
                  this.write('val id = d.readInt()\n');
                  this.write('d.reset()\n');
                  this.write(
                    'when(id) {\n',
                    () => {
                      for (const { node: nodeMetadata } of nodes) {
                        this.write(
                          `${nodeMetadata.id} -> {\n`,
                          () => {
                            this.write(
                              `val result = ${getClassName(
                                nodeMetadata
                              )}.decode(d)\n`
                            );
                            this.write(
                              `if(result != null) return ${traitClassName}(result)\n`
                            );
                          },
                          '}\n'
                        );
                      }
                    },
                    '}\n'
                  );
                  this.write('return null\n');
                },
                '}\n'
              );
            },
            '}\n'
          );
          for (let i = 0; i < metadata.nodes.length; i++) {
            const node = metadata.nodes[i];
            assert.strict.ok(node);
            this.write(
              `constructor(value: ${this.#resolveMetadataParamType(
                node
              )}): this(\n`,
              () => {
                const nodeParam = params.find((p) => p.node === node);
                assert.strict.ok(nodeParam);
                const { node: currentNode } = nodeParam;
                assert.strict.ok(currentNode);
                const fg =
                  this.#fileGeneratorFromParamTypeMetadata(currentNode);
                const currentMetadata = fg.#currentMetadata();
                assert.strict.ok(
                  !('nodes' in currentMetadata),
                  'Not implemented'
                );
                this.write(`${currentMetadata.id},\n`);
                const lastNode = metadata.nodes[metadata.nodes.length - 1];
                for (const node2 of metadata.nodes) {
                  const isLastNode = node2 === lastNode;
                  if (node2 === node) {
                    this.write('value');
                  } else {
                    this.write('null');
                  }
                  if (!isLastNode) {
                    this.append(',');
                  }
                  this.append('\n');
                }
              },
              ')\n'
            );
          }
          this.write(
            `fun <T> test(testObject: ${switchInterfaceName}<T>): T {\n`,
            () => {
              this.write(
                `when(${traitTypePropName}) {\n`,
                () => {
                  for (const {
                    node: nodeMetadata,
                    param: { classParamName }
                  } of nodes) {
                    this.write(
                      `${nodeMetadata.id} -> {\n`,
                      () => {
                        this.write(
                          `if(${classParamName} == null) {\n`,
                          () => {
                            this.write(
                              `throw Exception("${traitTypePropName} was set to ${nodeMetadata.id}, ` +
                                `but ${classParamName} was null")\n`
                            );
                          },
                          '}\n'
                        );
                        this.write(
                          `return testObject.${classParamName}(${classParamName})\n`
                        );
                      },
                      '}\n'
                    );
                  }
                },
                '}\n'
              );
              this.write(
                `throw Exception("Invalid trait data. ${traitTypePropName} was set to ` +
                  `$${traitTypePropName}, which does not match any of the type declarations that ` +
                  'was pushed this trait. We actually expect one of the following ids:\\n\\n' +
                  `${nodes.map((n) => `\\t- ${n.node.id}`).join('\\n')}")\n`
              );
            },
            '}\n'
          );
          this.write(
            'fun encode(s: DataOutput) {\n',
            () => {
              this.write(
                `test(object : ${switchInterfaceName}<Unit> {\n`,
                () => {
                  for (const { param: n } of nodes) {
                    this.write(
                      `override fun ${n.classParamName}(${n.classParamName}: ${n.nonOptionalTypeName}) {\n`,
                      () => {
                        this.write(`${n.classParamName}.encode(s)\n`);
                      },
                      '}\n'
                    );
                  }
                },
                '})\n'
              );
            },
            '}\n'
          );
        });
        this.write('}\n');
        break;
      }
    }
  }
  #fileGeneratorFromParamTypeMetadata(metadata: TypeExpressionMetadata) {
    let key: Metadata;
    switch (metadata.type) {
      case 'generic':
      case 'template':
      case 'externalModuleType':
        throw new Exception('Not implemented');
      case 'internalType': {
        const item = this.#metadata.find(
          (m) => m.name === metadata.interfaceName
        );
        assert.strict.ok(item);
        key = item;
        break;
      }
      case 'externalType': {
        const gen = this.#root().#fileGenerators.get(
          this.#metadataFilePathFromParamTypeMetadata(metadata)
        );
        assert.strict.ok(gen);
        const target = gen.#metadata.find((m) => m.name === metadata.name);
        assert.strict.ok(target);
        key = target;
        break;
      }
    }
    const gen = this.#root().#fileGenerators.get(key);
    assert.strict.ok(gen);
    return gen;
  }
  #writeEncodeCall(
    paramType: TypeExpressionMetadata,
    value: string,
    depth = 0
  ) {
    switch (paramType.type) {
      case 'generic':
        switch (paramType.value) {
          case GenericName.Uint16:
          case GenericName.UnsignedLong:
          case GenericName.Uint32:
          case GenericName.Uint8:
            throw new Exception('Unsigned integers are not supported');
          case GenericName.Long:
            this.write(`s.writeLong(${value})\n`);
            break;
          case GenericName.Bytes:
            this.write(`s.writeInt(${value}.size)\n`);
            this.write(`s.write(${value})\n`);
            break;
          case GenericName.Boolean:
            this.write(`s.writeByte(if(${value}) 1 else 0)\n`);
            break;
          case GenericName.Float:
            this.write(`s.writeFloat(${value})\n`);
            break;
          case GenericName.Double:
            this.write(`s.writeDouble(${value})\n`);
            break;
          case GenericName.Integer:
          case GenericName.Int32:
            this.write(`s.writeInt(${value})\n`);
            break;
          case GenericName.Int16:
            this.write(`s.writeShort(${value})\n`);
            break;
          case GenericName.Int8:
            this.write(`s.writeByte(${value})\n`);
            break;
          case GenericName.String: {
            const byteArrayVarName = `ba${value}${depth}`;
            this.write(
              `val ${byteArrayVarName} = ${value}.toByteArray(Charsets.UTF_8)\n`
            );
            this.write(`s.writeInt(${byteArrayVarName}.size)\n`);
            this.write(`s.write(${byteArrayVarName})\n`);
            break;
          }
          case GenericName.NullTerminatedString:
            this.write(`s.write(${value}.toByteArray(Charsets.UTF_8))\n`);
            this.write('s.writeByte(0)\n');
        }
        break;
      case 'template':
        depth++;
        switch (paramType.template) {
          case 'vector':
          case 'set': {
            this.write(`s.writeInt(${value}.size)\n`);
            const itemVarName = `item${upperFirst(value)}${depth}`;
            this.write(
              `for(${itemVarName} in ${value}) {\n`,
              () => {
                depth = this.#writeEncodeCall(
                  paramType.value,
                  itemVarName,
                  depth
                );
              },
              '}\n'
            );
            break;
          }
          case 'optional':
            this.write(
              `if(${value} != null) {\n`,
              () => {
                depth = this.#writeEncodeCall(paramType.value, value, depth);
              },
              '}\n'
            );
            break;
          case 'bigint':
          case 'tuple':
          case 'map':
            throw new Exception('Not implemented');
        }
        break;
      case 'internalType':
      case 'externalType':
        this.write(`${value}.encode(s)\n`);
        break;
      case 'externalModuleType':
    }
    return depth;
  }
  #writeDecodeCall(
    paramType: TypeExpressionMetadata,
    value: string,
    depth = 0
  ) {
    switch (paramType.type) {
      case 'generic':
        switch (paramType.value) {
          case GenericName.Uint16:
          case GenericName.UnsignedLong:
          case GenericName.Uint32:
          case GenericName.Uint8:
            throw new Exception('Unsigned integers are not supported');
          case GenericName.Long:
            this.write(`val ${value} = d.readLong()\n`);
            break;
          case GenericName.Boolean:
            this.write(`val ${value} = d.readByte().toInt() == 1\n`);
            break;
          case GenericName.Float:
            this.write(`val ${value} = d.readFloat()\n`);
            break;
          case GenericName.Double:
            this.write(`val ${value} = d.readDouble()\n`);
            break;
          case GenericName.Integer:
          case GenericName.Int32:
            this.write(`val ${value} = d.readInt()\n`);
            break;
          case GenericName.Int16:
            this.write(`val ${value} = d.readShort()\n`);
            break;
          case GenericName.Int8:
            this.write(`val ${value} = d.readByte()\n`);
            break;
          case GenericName.String:
          case GenericName.Bytes: {
            const varName =
              paramType.value === GenericName.Bytes
                ? value
                : `${value}AsByteArray${depth}`;
            this.write(`val ${varName} = ByteArray(d.readInt())\n`);
            this.write(`d.readFully(${varName})\n`);
            if (paramType.value === GenericName.String) {
              this.write(`val ${value} = String(${varName}, Charsets.UTF_8)\n`);
            }
            break;
          }
          case GenericName.NullTerminatedString:
            throw new Exception('Not implemented');
        }
        break;
      case 'template':
        depth++;
        switch (paramType.template) {
          case 'vector':
          case 'set': {
            const lengthVarName = getVarName('length', value, depth);
            const indexVarName = getVarName('index', value, depth);
            const itemVarName = getVarName('item', value, depth);
            this.write(`val ${lengthVarName} = d.readInt()\n`);
            this.write(
              `val ${value} = mutableListOf<${this.#resolveMetadataParamType(
                paramType.value
              )}>()\n`
            );
            this.write(
              `for(${indexVarName} in 0..${lengthVarName}) {\n`,
              () => {
                depth = this.#writeDecodeCall(
                  paramType.value,
                  itemVarName,
                  depth
                );
                this.write(`${value}.add(${itemVarName})\n`);
              },
              '}\n'
            );
            break;
          }
          case 'optional': {
            // const optionalVarName = getVarName('optionalValue', value, depth);
            const actualValueVarName = getVarName('actualValue', value, depth);
            const optionalByteVarName = getVarName(
              'optionalByte',
              value,
              depth
            );
            this.write(`val ${optionalByteVarName} = d.readByte().toInt()\n`);
            this.write(
              `var ${value}: ${this.#resolveMetadataParamType(paramType)}\n`
            );
            this.write(
              `if(${optionalByteVarName} == 1) {\n`,
              () => {
                depth = this.#writeDecodeCall(
                  paramType.value,
                  actualValueVarName,
                  depth
                );
                this.write(`${value} = ${actualValueVarName}\n`);
              },
              `} else if(${optionalByteVarName} == 0) {\n`
            );
            this.indentBlock(() => {
              this.write(`${value} = null\n`);
            });
            this.write('} else {\n');
            this.indentBlock(() => {
              this.write('return null\n');
            });
            this.write('}\n');
            break;
          }
          case 'bigint':
          case 'tuple':
          case 'map':
            throw new Exception('Not implemented');
        }
        break;
      case 'internalType':
      case 'externalType':
        this.write(
          `val ${value} = ${getClassName(paramType)}.decode(d) ?: return null\n`
        );
        break;
      case 'externalModuleType':
        throw new Exception('Not implemented');
    }
    return depth;
  }
  #resolveMetadataParamType(paramType: TypeExpressionMetadata): string {
    switch (paramType.type) {
      case 'generic':
        switch (paramType.value) {
          case GenericName.Bytes:
            return 'ByteArray';
          case GenericName.Long:
            return 'Long';
          case GenericName.UnsignedLong:
          case GenericName.Uint16:
          case GenericName.Uint32:
          case GenericName.Uint8:
            throw new Exception(
              'Unsigned integers are not supported on FileGeneratorKotlin'
            );
          case GenericName.Float:
            return 'Float';
          case GenericName.Double:
            return 'Double';
          case GenericName.Boolean:
            return 'Boolean';
          case GenericName.Integer:
          case GenericName.Int32:
            return 'Int';
          case GenericName.Int16:
            return 'Short';
          case GenericName.Int8:
            return 'Byte';
          case GenericName.NullTerminatedString:
          case GenericName.String:
            return 'String';
        }
        break;
      case 'externalType':
      case 'internalType':
        return getClassName(paramType);
      case 'template':
        switch (paramType.template) {
          case 'vector':
            return `List<${this.#resolveMetadataParamType(paramType.value)}>`;
          case 'map':
            return `Map<${this.#resolveMetadataParamType(
              paramType.key
            )}, ${this.#resolveMetadataParamType(paramType.value)}>`;
          case 'set':
            return `Set<${this.#resolveMetadataParamType(paramType.value)}>`;
          case 'optional':
            return `${this.#resolveMetadataParamType(paramType.value)}?`;
          case 'bigint':
          case 'tuple':
            throw new Exception(
              `${paramType.template} is not supported by Kotlin code generator`
            );
        }
        break;
      case 'externalModuleType':
        throw new Exception(
          'External module types are not supported by FileGeneratorKotlin'
        );
    }
    return 'Any';
  }
}
