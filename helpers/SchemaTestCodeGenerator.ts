import CodeStream from 'textstreamjs';
import fs from 'fs';
import crypto from 'crypto';
import Exception from '../exception/Exception';
import { glob } from 'glob';
import path from 'path';
import { Metadata, MetadataParamType } from '../code-generator/types';
import {
  getMetadataFileName,
  upperFirst,
} from '../code-generator/stringUtilities';
import GenericName from '../code-generator/GenericName';
import assert from 'assert';
import JavaScriptObjectStringify from '../code-generator/JavaScriptObjectStringify';
import { crc32 } from 'crc';
import { findClosestFileOrFolder } from '../code-generator/helpers';

function getFunctionName(prefix: string, metadata: Metadata) {
  let out = `${prefix}${upperFirst(metadata.name)}`;
  switch (metadata.kind) {
    case 'trait':
      out = `${out}Trait`;
      break;
  }
  return out;
}

export class InvalidSchemaConfigurationFailure extends Exception {
  public constructor(public readonly value: unknown) {
    super('Invalid schema configuration');
  }
}

export class JSONParseFailure extends Exception {
  public constructor(
    public readonly value: string,
    public readonly reason: unknown
  ) {
    super(`Failed to parse JSON: ${value}`);
  }
}

export class ReadFileFailure extends Exception {
  public constructor(
    public readonly path: string,
    public readonly reason: unknown
  ) {
    super(`Failed to read file: ${path}`);
  }
}

export class MetadataCodeGenerator extends CodeStream {
  readonly #metadata;
  readonly #metadataObjects;
  readonly #outFile;
  readonly #absoluteImportPath;
  readonly #stringifier;
  public constructor({
    parent,
    absoluteImportPath,
    metadata,
    metadataObjects,
    outFile,
    indentationSize,
  }: {
    outFile: string;
    parent: CodeStream;
    absoluteImportPath: string;
    metadata: Metadata;
    metadataObjects: Metadata[];
    indentationSize: number;
  }) {
    super(parent, {
      indentationSize,
    });
    this.#stringifier = new JavaScriptObjectStringify(this, {
      quoteObjectParameterNames: false,
      indentationSize,
    });
    this.#metadata = metadata;
    this.#absoluteImportPath = absoluteImportPath;
    this.#metadataObjects = metadataObjects;
    this.#outFile = outFile;
  }
  public async generate() {
    await this.#generateTestFromMetadata();
  }
  async #generateTestFromMetadata() {
    const relativePath = path.relative(
      path.dirname(this.#outFile),
      this.#absoluteImportPath
    );
    const metadata = this.#metadata;
    const imports = [
      [getFunctionName('default', metadata), 'defaultFn'],
      [getFunctionName('encode', metadata), 'encodeFn'],
      [getFunctionName('update', metadata), 'updateFn'],
      [getFunctionName('compare', metadata), 'compareFn'],
      [getFunctionName('decode', metadata), 'decodeFn'],
      [getFunctionName('is', metadata), 'isFn'],
    ];
    this.write(`console.log("-- %s","${relativePath}");\n`);
    this.write("const assert = require('assert');\n");
    this.write("const {Codec, Serializer} = require('jsbuffer/codec');\n");
    this.write(`const value = require("./${relativePath}");\n`);
    this.write(
      'const {\n',
      () => {
        for (const [id, alias] of imports) {
          this.write(`${id}: ${alias},\n`);
        }
      },
      '} = value;\n'
    );
    await this.#generateIsFunctionTests();
    await this.#generateCodecFunctionTests();
    this.#generateCompareFunctionTests();
    if (metadata.kind !== 'trait') {
      await this.#generateUpdateFunctionTests();
    }
  }
  async #generateCodecFunctionTests() {
    const traitNodeRandomValues =
      this.#metadata.kind === 'trait'
        ? await Promise.all(
            this.#metadata.nodes.map(async (paramTypeMetadata) => {
              const wrongValueSet = new Set<unknown>();
              const maxDepth =
                await this.#generateWrongRandomValueFromParamMetadata(
                  paramTypeMetadata,
                  {},
                  'result',
                  -1
                );
              const randomValues =
                await this.#generateRandomValueFromParamMetadata(
                  paramTypeMetadata
                );
              for (let i = 0; i < maxDepth; i++) {
                const wrongValues: Record<string, unknown> = {};
                await this.#generateWrongRandomValueFromParamMetadata(
                  paramTypeMetadata,
                  wrongValues,
                  'result',
                  i
                );
                wrongValueSet.add(wrongValues['result']);
              }
              const externalTypeMetadata =
                paramTypeMetadata.type === 'externalType'
                  ? {
                      name: paramTypeMetadata.name,
                      metadataObjects: await getMetadataFromRelativePath(
                        this.#absoluteImportPath,
                        paramTypeMetadata.relativePath
                      ),
                    }
                  : null;

              return {
                externalTypeMetadata:
                  externalTypeMetadata?.metadataObjects.find(
                    (m) => m.name === externalTypeMetadata.name
                  ),
                paramTypeMetadata,
                wrongValueSet,
                randomValues,
              };
            })
          )
        : null;
    this.write(
      '{\n',
      () => {
        this.write(
          'const codec = new Codec({\n',
          () => {
            this.write('textEncoder: new TextEncoder(),\n');
            this.write('textDecoder: new TextDecoder()\n');
          },
          '});\n'
        );
        this.write('let buffer = codec.encode(encodeFn, defaultFn());\n');
        this.write(
          'assert.strict.deepEqual(codec.decode(decodeFn, buffer),defaultFn());\n'
        );
        if (traitNodeRandomValues) {
          for (const {
            randomValues,
            externalTypeMetadata,
            wrongValueSet,
          } of traitNodeRandomValues) {
            if (externalTypeMetadata) {
              assert.strict.ok(externalTypeMetadata.kind !== 'trait');
              this.write(
                '{\n',
                () => {
                  if (externalTypeMetadata.params.length > 0) {
                    return;
                  }
                  this.write(
                    'const s = new Serializer({textDecoder: new TextDecoder(), textEncoder: new TextEncoder()});\n'
                  );
                  this.write(
                    `s.writeInt32(${crc32(`${externalTypeMetadata.id}`)});\n`
                  );
                  this.write(
                    'assert.strict.equal(codec.decode(decodeFn,s.view()),null);\n'
                  );
                },
                '}\n'
              );
            }
            for (const wrongValues of wrongValueSet) {
              this.write(
                '{\n',
                () => {
                  this.write('const v = ');
                  this.#stringifier.stringify(wrongValues);
                  this.append(';\n');
                  this.write(
                    'assert.strict.throws(() => {\n',
                    () => {
                      this.write('buffer = codec.encode(encodeFn, v);\n');
                    },
                    '});\n'
                  );
                  this.write(
                    'assert.strict.equal(codec.decode(decodeFn),null);\n'
                  );
                },
                '}\n'
              );
            }
            this.write(
              '{\n',
              () => {
                this.write('const v = ');
                this.#stringifier.stringify(randomValues);
                this.append(';\n');

                this.write('buffer = codec.encode(encodeFn, v);\n');
                this.write(
                  'assert.strict.deepEqual(codec.decode(decodeFn, buffer),v);\n'
                );
              },
              '}\n'
            );
          }
        }
      },
      '}\n'
    );
  }
  async #generateUpdateFunctionTests() {
    const randomValues = await this.#generateRandomValuesFromMetadata(
      this.#metadata
    );
    this.write(
      '{\n',
      () => {
        this.write('const v = defaultFn();\n');
        this.write('assert.strict.equal(updateFn(v,{}),v);\n');
        this.write(
          'assert.strict.deepEqual(\n',
          () => {
            this.write('updateFn(v, ');
            this.#stringifier.stringify(randomValues);
            this.append('),\n');
            this.write('');
            this.#stringifier.stringify(randomValues);
            this.append('\n');
          },
          ');\n'
        );
      },
      '}\n'
    );
  }
  #generateCompareFunctionTests() {
    const metadata = this.#metadata;
    this.write('assert.strict.ok(compareFn(defaultFn(),defaultFn()));\n');
    this.write('assert.strict.ok(compareFn(defaultFn(),defaultFn(');
    this.#stringifier.stringify(
      this.#generateRandomValuesFromMetadata(metadata)
    );
    this.append(')));\n');
  }
  async #generateIsFunctionTests() {
    const metadata = this.#metadata;
    const randomValues = await this.#generateRandomValuesFromMetadata(metadata);
    this.write('assert.strict.ok(!isFn(null));\n');
    this.write('assert.strict.ok(!isFn(undefined));\n');
    this.write('assert.strict.ok(isFn(defaultFn()));\n');
    this.write('assert.strict.ok(isFn(');
    this.indentBlock(() => {
      this.#stringifier.stringify(randomValues);
    });
    this.append('));\n');
    switch (metadata.kind) {
      case 'call':
      case 'type': {
        const out = {};
        const maxDepth = await this.#generateWrongRandomValuesFromMetadata(
          metadata,
          out,
          0
        );
        this.write(`// max depth: ${maxDepth}\n`);
        this.write('assert.strict.ok(!isFn(');
        this.indentBlock(() => {
          this.#stringifier.stringify(out);
        });
        this.append('));\n');
        let x: Record<string, unknown>;
        for (let i = 0; i < maxDepth; i++) {
          x = {};
          await this.#generateWrongRandomValuesFromMetadata(metadata, x, 0, i);
          this.write(
            '{\n',
            () => {
              this.#log(`testing wrong random values until depth: ${i}`);
              this.write('assert.strict.ok(!isFn(');
              this.indentBlock(() => {
                this.#stringifier.stringify(x);
              });
              this.append('));\n');
            },
            '}\n'
          );
        }
        break;
      }
      case 'trait': {
        this.#log(`${metadata.kind}: [`);
        for (const node of metadata.nodes) {
          const randomValues = await this.#generateRandomValueFromParamMetadata(
            node
          );
          this.write('assert.strict.ok(isFn(');
          this.indentBlock(() => {
            this.write('');
            this.#stringifier.stringify(randomValues);
          });
          this.write('));\n');
          this.#log(`\\t${this.#metadataParamTypeToString(node)} ok ✔`);
        }
        this.#log(']');
        break;
      }
    }
  }
  #metadataParamTypeToString(node: MetadataParamType) {
    switch (node.type) {
      case 'externalModuleType':
        return `externalModuleType(${node.name})`;
      case 'externalType':
        return `externalType(${node.name})`;
      case 'generic':
        return `generic(${node.value})`;
      case 'internalType':
        return `internalType(${node.interfaceName})`;
      case 'template': {
        let name: string;
        switch (node.template) {
          case 'set':
          case 'vector':
          case 'optional':
            name = this.#metadataParamTypeToString(node.value);
            break;
          case 'tuple':
            name = node.args
              .map((arg) => this.#metadataParamTypeToString(arg))
              .join(', ');
            break;
          case 'map':
            name = `${this.#metadataParamTypeToString(
              node.key
            )}, ${this.#metadataParamTypeToString(node.value)}`;
            break;
        }
        return `${node.template}<${name}>`;
      }
    }
  }
  async #generateRandomValuesFromMetadata(metadata: Metadata) {
    const out: Record<string, unknown> = {};
    if (metadata.kind === 'trait') {
      const selectedMetadata =
        metadata.nodes.length === 1
          ? metadata.nodes[0]
          : metadata.nodes[crypto.randomInt(0, metadata.nodes.length - 1)];
      assert.strict.ok(selectedMetadata);
      return this.#generateRandomValueFromParamMetadata(selectedMetadata);
    }
    out['_name'] = metadata.globalName;
    for (const p of metadata.params) {
      out[p.name] = await this.#generateRandomValueFromParamMetadata(p.type);
    }
    return out;
  }
  async #generateWrongRandomValuesFromMetadata(
    metadata: Metadata,
    out: Record<string, unknown>,
    depth: number,
    generateInvalidAfterDepth = -1
  ) {
    if (metadata.kind === 'trait') {
      const selectedMetadata =
        metadata.nodes.length === 1
          ? metadata.nodes[0]
          : metadata.nodes[crypto.randomInt(0, metadata.nodes.length - 1)];
      assert.strict.ok(selectedMetadata);
      const value = {
        result: null,
      };
      return this.#generateWrongRandomValueFromParamMetadata(
        selectedMetadata,
        value,
        'result',
        depth,
        generateInvalidAfterDepth
      );
    }
    out['_name'] =
      generateInvalidAfterDepth !== -1 && depth >= generateInvalidAfterDepth
        ? metadata.globalName
        : crypto.randomBytes(8).toString('base64');
    for (const p of metadata.params) {
      depth = await this.#generateWrongRandomValueFromParamMetadata(
        p.type,
        out,
        p.name,
        depth + 1,
        generateInvalidAfterDepth
      );
    }
    return depth;
  }
  async #generateWrongRandomValueFromParamMetadata(
    param: MetadataParamType,
    out: Record<string, unknown> | Array<unknown>,
    key: string | number,
    depth: number,
    generateInvalidAfterDepth = -1
  ): Promise<number> {
    if (
      generateInvalidAfterDepth !== -1 &&
      depth <= generateInvalidAfterDepth
    ) {
      this.#setOutValue(
        out,
        key,
        this.#generateRandomValueFromParamMetadata(param)
      );
      return depth;
    }
    let value: unknown;
    switch (param.type) {
      default:
        throw new Exception(
          // @ts-expect-error should be no unhandled param types
          `Failed to generate random value for param type: ${param.type}`
        );
      case 'externalModuleType': {
        const metadataObjects =
          await getMetadataFromExternalModuleTypeImportPath(
            this.#absoluteImportPath,
            param.importPath
          );
        const metadata = metadataObjects.find((m) => m.name === param.name);
        assert.strict.ok(metadata);
        const externalTypeOut = {};
        depth = await this.#generateWrongRandomValuesFromMetadata(
          metadata,
          externalTypeOut,
          depth,
          generateInvalidAfterDepth
        );
        value = externalTypeOut;
        break;
      }
      case 'internalType':
      case 'externalType': {
        const tempValue = {};
        const metadataObjects: Metadata[] =
          param.type === 'externalType'
            ? await getMetadataFromRelativePath(
                this.#absoluteImportPath,
                param.relativePath
              )
            : this.#metadataObjects;
        const foundMetadata = metadataObjects.find(
          (metadata: Metadata) =>
            metadata.name ===
            (param.type === 'externalType' ? param.name : param.interfaceName)
        );
        assert.strict.ok(foundMetadata);
        depth = await this.#generateWrongRandomValuesFromMetadata(
          foundMetadata,
          tempValue,
          depth + 1,
          generateInvalidAfterDepth
        );
        value = tempValue;
        break;
      }
      case 'template':
        /**
         * increase depth, since we want template to also receive invalid data sometimes
         */
        depth++;
        switch (param.template) {
          case 'vector':
          case 'set': {
            const length = crypto.randomInt(1, 2);
            const list = new Array<unknown>(length);
            for (let i = 0; i < length; i++) {
              // ! ignore depth since it is not a parameter item
              await this.#generateWrongRandomValueFromParamMetadata(
                param.value,
                list,
                i,
                depth,
                generateInvalidAfterDepth
              );
            }
            if (param.template === 'set') {
              value = new Set(list);
              break;
            }
            value = list;
            break;
          }
          case 'optional':
            depth = await this.#generateWrongRandomValueFromParamMetadata(
              param.value,
              out,
              key,
              depth,
              generateInvalidAfterDepth
            );
            break;
          case 'tuple': {
            const tuple = new Array<unknown>(param.args.length);
            for (let i = 0; i < tuple.length; i++) {
              const arg = param.args[i];
              assert.strict.ok(arg);
              depth = await this.#generateWrongRandomValueFromParamMetadata(
                arg,
                tuple,
                i,
                depth + 1,
                generateInvalidAfterDepth
              );
            }
            value = tuple;
            break;
          }
          case 'map': {
            const length = crypto.randomInt(2, 4);
            const list = new Array<[unknown, unknown]>();
            for (let i = 0; i < length; i++) {
              const pair: [unknown, unknown] = [Symbol('a'), Symbol('b')];
              // ! ignore because we only need depth += 2 at the end
              await this.#generateWrongRandomValueFromParamMetadata(
                param.key,
                pair,
                0,
                depth + 1,
                generateInvalidAfterDepth
              );
              await this.#generateWrongRandomValueFromParamMetadata(
                param.value,
                pair,
                1,
                depth + 2,
                generateInvalidAfterDepth
              );
              list.push(pair);
            }
            depth += 2;
            value = new Map(list);
          }
        }
        break;
      case 'generic':
        switch (param.value) {
          case GenericName.Long:
          case GenericName.UnsignedLong:
            value = {};
            break;
          case GenericName.Bytes:
          case GenericName.Uint32:
          case GenericName.Uint16:
          case GenericName.Int16:
          case GenericName.Uint8:
          case GenericName.Int8:
          case GenericName.Float:
          case GenericName.Boolean:
          case GenericName.Double:
          case GenericName.Integer:
          case GenericName.Int32:
            value = '';
            break;
          case GenericName.NullTerminatedString:
          case GenericName.String:
            value = 1;
            break;
        }
    }
    this.#setOutValue(out, key, value);
    return depth;
  }
  #setOutValue(
    out: Array<unknown> | Record<string, unknown>,
    key: number | string,
    value: unknown
  ) {
    if (Array.isArray(out)) {
      if (typeof key !== 'number') {
        throw new Exception('If `out` is an array, `key` must be a number');
      }
      out[key] = value;
    } else {
      if (typeof key !== 'string') {
        throw new Exception('If `out` is an object, `key` must be a string');
      }
      out[key] = value;
    }
  }
  async #generateRandomValueFromParamMetadata(
    param: MetadataParamType
  ): Promise<unknown> {
    switch (param.type) {
      default:
        throw new Exception(
          // @ts-expect-error should be no unhandled param types
          `Failed to generate random value for param type: ${param.type}`
        );
      case 'externalModuleType':
      case 'externalType': {
        const metadata = (
          param.type === 'externalModuleType'
            ? await getMetadataFromExternalModuleTypeImportPath(
                this.#absoluteImportPath,
                param.importPath
              )
            : await getMetadataFromRelativePath(
                this.#absoluteImportPath,
                param.relativePath
              )
        ).find((metadata: Metadata) => metadata.name === param.name);
        assert.strict.ok(metadata);
        return this.#generateRandomValuesFromMetadata(metadata);
      }
      case 'internalType': {
        const metadata = this.#metadataObjects.find(
          (metadata) => metadata.name === param.interfaceName
        );
        assert.strict.ok(metadata);
        return this.#generateRandomValuesFromMetadata(metadata);
      }
      case 'template':
        switch (param.template) {
          case 'vector':
          case 'set': {
            const length = crypto.randomInt(10, 100);
            const list = new Array<unknown>(length);
            for (let i = 0; i < length; i++) {
              const value = await this.#generateRandomValueFromParamMetadata(
                param.value
              );
              list[i] = value;
            }
            if (param.template === 'set') {
              return new Set(list);
            }
            return list;
          }
          case 'optional':
            return crypto.randomInt(0, 1) === 1
              ? this.#generateRandomValueFromParamMetadata(param.value)
              : null;
          case 'tuple': {
            const value = new Array<unknown>();
            for (const arg of param.args) {
              value.push(await this.#generateRandomValueFromParamMetadata(arg));
            }
            assert.strict.ok(param.args.length === value.length);
            return value;
          }
          case 'map': {
            const length = crypto.randomInt(2, 20);
            const list = new Array<[unknown, unknown]>();
            for (let i = 0; i < length; i++) {
              list[i] = await Promise.all([
                this.#generateRandomValueFromParamMetadata(param.key),
                this.#generateRandomValueFromParamMetadata(param.value),
              ]);
            }
            return new Map(list);
          }
        }
        break;
      case 'generic':
        switch (param.value) {
          case GenericName.Bytes:
            return crypto.randomFillSync(
              new Uint8Array(crypto.randomInt(8, 16))
            );
          case GenericName.Long:
            return crypto.randomFillSync(new BigInt64Array(1))[0]?.toString();
          case GenericName.UnsignedLong:
            return crypto.randomFillSync(new BigUint64Array(1))[0]?.toString();
          case GenericName.Float:
            return crypto.randomFillSync(new Float32Array(1))[0];
          case GenericName.Boolean:
            return crypto.randomInt(0, 1) === 1;
          case GenericName.Double:
            return crypto.randomFillSync(new Float64Array(1))[0];
          case GenericName.Integer:
          case GenericName.Int32:
            return crypto.randomFillSync(new Int32Array(1))[0];
          case GenericName.Uint32:
            return crypto.randomFillSync(new Uint32Array(1))[0];
          case GenericName.Uint16:
            return crypto.randomFillSync(new Uint16Array(1))[0];
          case GenericName.Int16:
            return crypto.randomFillSync(new Int16Array(1))[0];
          case GenericName.Uint8:
            return crypto.randomFillSync(new Uint8Array(1))[0];
          case GenericName.Int8:
            return crypto.randomFillSync(new Int8Array(1))[0];
          case GenericName.NullTerminatedString:
          case GenericName.String:
            return crypto.randomBytes(8).toString('base64');
        }
    }
  }
  #log(value: string) {
    this.write(`console.log('\\t${value}');\n`);
    return value;
  }
}

/**
 * Resolve external module type import path and returns the actual metadata
 * @param absoluteImportPath File that is importing importPath
 * @param importPath Standard node module import path
 */
async function getMetadataFromExternalModuleTypeImportPath(
  absoluteImportPath: string,
  importPath: string
) {
  const nodeModulesPath = await findClosestFileOrFolder(
    absoluteImportPath,
    'node_modules'
  );
  if (nodeModulesPath === null) {
    throw new Exception(
      `Failed to find node_modules folder to get source file metadata: ${importPath}`
    );
  }
  return getMetadataFromFile(path.resolve(nodeModulesPath, `${importPath}.js`));
}

async function getMetadataFromFile(file: string): Promise<Metadata[]> {
  const contents = await fs.promises.readFile(
    getMetadataFileName(file),
    'utf8'
  );
  return JSON.parse(contents).__all;
}

function findClosestSchemaConfigFile(initialPath: string) {
  return findClosestFileOrFolder(initialPath, 'jsbufferconfig.json');
}

interface IConfiguration {
  outDir: string;
  mainFile: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getConfigProperty(
  configuration: unknown,
  propertyName: string
) {
  if (!isObject(configuration)) {
    throw new InvalidSchemaConfigurationFailure(configuration);
  }
  const value = configuration[propertyName];
  if (typeof value !== 'string') {
    throw new InvalidSchemaConfigurationFailure(configuration);
  }
  return value;
}

export async function parseConfigFile(
  configFile: string
): Promise<IConfiguration> {
  let maybeConfig: unknown;
  let configContents: string;
  try {
    await fs.promises.access(configFile, fs.constants.R_OK);
    configContents = await fs.promises.readFile(configFile, 'utf8');
  } catch (reason) {
    throw new ReadFileFailure(configFile, reason);
  }
  try {
    maybeConfig = JSON.parse(configContents);
  } catch (reason) {
    throw new JSONParseFailure(configContents, reason);
  }
  return {
    outDir: getConfigProperty(maybeConfig, 'outDir'),
    mainFile: getConfigProperty(maybeConfig, 'mainFile'),
  };
}

export default class SchemaTestCodeGenerator extends CodeStream {
  readonly #outFile;
  readonly #indentationSize;
  #files = new Array<string>();
  public constructor({
    indentationSize,
    outFile,
  }: {
    indentationSize: number;
    outFile: string;
  }) {
    super(undefined, {
      indentationSize,
    });
    this.#indentationSize = indentationSize;
    this.#outFile = outFile;
  }
  public async generate(configFile: string) {
    const configuration = await parseConfigFile(configFile);
    const rootDir = path.dirname(configFile);
    const outDir = path.resolve(rootDir, configuration.outDir);
    this.#files = await glob(path.join(outDir, '**/*.js'));
    this.#files = await this.#files.reduce(async (files, f) => {
      if (/__types__\.js$/.test(f)) {
        return files;
      }
      const foundConfigFile = await findClosestSchemaConfigFile(f);
      if (foundConfigFile !== configFile) {
        return files;
      }
      return [...(await files), f];
    }, Promise.resolve(new Array<string>()));
    for (const f of this.#files) {
      const metadataObjects = await getMetadataFromFile(f);
      const generators = metadataObjects.map(
        (metadata) =>
          new MetadataCodeGenerator({
            metadata,
            metadataObjects,
            parent: this,
            indentationSize: this.#indentationSize,
            absoluteImportPath: f,
            outFile: this.#outFile,
          })
      );
      for (const g of generators) {
        this.write('{\n\n');
        await g.generate();
        this.write('}\n\n');
      }
    }
    await fs.promises.writeFile(this.#outFile, this.value());
  }
}

function getMetadataFromRelativePath(
  absolutePath: string,
  relativePath: string
) {
  return getMetadataFromFile(
    path.resolve(path.dirname(absolutePath), `${relativePath}.js`)
  );
}
