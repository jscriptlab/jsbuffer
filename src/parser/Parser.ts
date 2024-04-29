import ASTGenerator, {
  ASTGeneratorOutputNode,
  INodeCallDefinition,
  INodeExportStatement,
  INodeLiteralNumber,
  INodeParamDefinition,
  INodeTraitDefinition,
  INodeTypeDefinition,
  Node,
  NodeType,
  NodeTypeExpression
} from '../core/ASTGenerator';
import CodeStream from 'textstreamjs';
import fs from 'fs';
import path from 'path';
import Tokenizer, {
  ITextDecoder,
  ITextEncoder,
  IToken
} from '../core/Tokenizer';
import Exception from '../../exception/Exception';
import crc from 'crc';
import GenericName from './types/GenericName';
import { IMetadataParam, Metadata, MetadataParamType } from './types/metadata';
import lowerFirst from '../utilities/string/lowerFirst';
import ErrorFormatter from '../core/ErrorFormatter';

export type InputRequirement =
  | {
      fileGenerator: Parser;
      identifier: string;
    }
  | {
      identifier: string;
      path: string;
      target: 'outDir';
    }
  | {
      identifier: string;
      path: string;
      wildcard: boolean;
      isDefaultImport: boolean;
      target: 'nodeModule';
    };

export interface IConfiguration {
  mainFile: string;
  outDir: string;
  rootDir: string;
}

export interface IExternalModule {
  configFile: string;
  nodeModulesFolderPath: string;
  configuration: IConfiguration;
}

export interface ITrait {
  name: string;
  nodes: ResolvedType[];
}

export type ResolvedType =
  | {
      fileGenerator: Parser;
      identifier: string;
    }
  | INodeTypeDefinition
  | INodeCallDefinition
  | INodeTraitDefinition
  | {
      generic: GenericName;
    }
  | {
      template: 'vector' | 'set';
      expression: NodeTypeExpression;
      type: ResolvedType;
    }
  | {
      template: 'optional';
      expression: NodeTypeExpression;
      type: ResolvedType;
    }
  | {
      template: 'tuple';
      expressions: ReadonlyArray<NodeTypeExpression>;
      types: ResolvedType[];
    }
  | {
      template: 'map';
      key: {
        expression: NodeTypeExpression;
        resolved: ResolvedType;
      };
      value: {
        expression: NodeTypeExpression;
        resolved: ResolvedType;
      };
    }
  | {
      template: 'bigint';
      bits: INodeLiteralNumber;
    };

export type Requirement =
  | {
      target: 'nodeModule';
      path: string;
      alias?: string;
      wildcard: boolean;
      isDefaultImport: boolean;
      identifier: string;
    }
  | {
      target: 'outDir';
      path: string;
      alias?: string;
      identifier: string;
    }
  | {
      path: string;
      alias?: string;
      identifier: string;
      fileGenerator: Parser;
    };

export interface IParserOptions {
  externalModule?: boolean;
  textDecoder: ITextDecoder;
  textEncoder: ITextEncoder;
  sortProperties: boolean;
  indentationSize: number;
  root: Parser | null;
  configuration: IConfiguration;
}

export interface IFileMetadata {
  path: string;
  metadata: Metadata[];
}

export interface IFile {
  path: string;
  contents: Uint8Array;
}

export function getTypeDefinitionOrCallDefinitionNamePropertyValue(
  node: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition,
  file: string
) {
  return `${file
    /**
     * Specifically remove `.jsb` extension at the end of the file path
     **/
    .replace(/\.jsb$/, '')
    .split('/')
    .map(lowerFirst)
    .join('.')}.${node.name.value}`;
}

export default class Parser extends CodeStream {
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
  readonly #textDecoder;
  readonly #imports = new Set<Requirement>();
  readonly #indentationSize;
  readonly #metadataObjects = new Set<Metadata>();
  readonly #originalImports = new Map<
    Parser,
    {
      identifiers: Set<string>;
      externalModule: boolean;
      fileGenerator: Parser;
    }
  >();
  readonly #fileGenerators = new Map<string, Parser>();
  readonly #parent;
  readonly #traits = new Map<string, ITrait>();
  readonly #externalModule;
  readonly #sortProperties;
  readonly #configuration;
  #nodes: Array<ASTGeneratorOutputNode> = [];
  public constructor(
    file: IFile,
    {
      externalModule = false,
      textDecoder,
      configuration,
      sortProperties = false,
      textEncoder,
      indentationSize,
      root: parent = null
    }: IParserOptions
  ) {
    super(undefined, {
      indentationSize
    });
    this.#configuration = configuration;
    this.#sortProperties = sortProperties;
    this.#externalModule = externalModule;
    this.#file = file;
    this.#parent = parent;
    this.#indentationSize = indentationSize;
    this.#textEncoder = textEncoder;
    this.#textDecoder = textDecoder;
  }
  public async parse(): Promise<ReadonlyArray<IFileMetadata>> {
    /**
     * preprocess all file generators, dependencies etc.
     */
    await this.#preprocess();
    /**
     * import trait dependencies after preprocessing
     */
    await this.#iterateFileGenerators((f) => f.#importTraitDependencies());
    /**
     * update metadata objects
     */
    await this.#iterateFileGenerators((f) => f.#updateMetadataObjects());

    return [
      {
        path: this.#file.path,
        metadata: Array.from(this.#metadataObjects)
      },
      ...Array.from(this.#fileGenerators.values()).map((f) => ({
        path: f.#file.path,
        metadata: Array.from(f.#metadataObjects)
      }))
    ];
  }
  async #updateMetadataObjects() {
    this.#iterate((node) => {
      switch (node.type) {
        case NodeType.CallDefinition:
        case NodeType.TraitDefinition:
        case NodeType.TypeDefinition:
          this.#metadataObjects.add(
            this.#getMetadataFromCallOrTypeDefinition(node)
          );
          break;
      }
    });
  }
  async #importTraitDependencies() {
    this.#iterate((node) => {
      switch (node.type) {
        case NodeType.TraitDefinition: {
          const trait = this.#traits.get(node.name.value);
          if (!trait) {
            break;
          }
          for (const node of trait.nodes) {
            if ('fileGenerator' in node) {
              this.#import(node);
            }
          }
          break;
        }
      }
    });
  }
  async #iterateFileGenerators(fn: (f: Parser) => Promise<void> | void) {
    for (const f of [...this.#fileGenerators.values(), this]) {
      await Promise.resolve(fn(f));
    }
  }
  async #preprocess() {
    const contents = this.#file.contents;
    const tokenizer = new Tokenizer({
      file: this.#file.path,
      textDecoder: this.#textDecoder,
      textEncoder: this.#textEncoder,
      contents
    });
    this.#nodes = new ASTGenerator({
      contents,
      file: this.#file.path,
      textDecoder: this.#textDecoder,
      tokens: tokenizer.tokenize().tokens()
    }).generate();
    if (this.#sortProperties) {
      this.#iterate((node) => {
        switch (node.type) {
          case NodeType.ExportStatement:
            break;
          case NodeType.TraitDefinition:
            break;
          case NodeType.TypeDefinition:
          case NodeType.CallDefinition:
            node.parameters = Array.from(node.parameters).sort((p1, p2) =>
              p1.name.value.localeCompare(p2.name.value)
            );
            break;
          case NodeType.ImportStatement:
        }
      });
    }
    /**
     * preprocess all external schemas
     */
    for (const fileGenerator of this.#fileGenerators.values()) {
      if (fileGenerator.#externalModule) {
        fileGenerator.#preprocess();
      }
    }
    for (const node of this.#nodes) {
      await this.#updateOriginalImportsAndSetDefinitions(node);
    }
    for (const node of this.#nodes) {
      this.#updateImportsBasedOnUsage(node);
    }
    /**
     * preprocess all available file generators available
     */
    for (const fileGenerator of this.#fileGenerators.values()) {
      if (!fileGenerator.#externalModule) {
        await fileGenerator.#preprocess();
      }
    }
    for (const node of this.#nodes) {
      await this.#setExportsAndValidateImports(node);
    }
    /**
     * fill the traits for this file generator
     */
    this.#fillTraits();
  }
  #iterate(fn: (node: ASTGeneratorOutputNode) => void) {
    for (const node of this.#nodes) {
      fn(node);
      switch (node.type) {
        case NodeType.ExportStatement:
          fn(node.value);
          break;
        case NodeType.TraitDefinition:
        case NodeType.TypeDefinition:
        case NodeType.CallDefinition:
        case NodeType.ImportStatement:
          break;
        default:
          // @ts-expect-error all nodes should be handled
          throw new Exception(`Unhandled node type: ${node.type}`);
      }
    }
  }
  #updateImportsBasedOnUsage(node: ASTGeneratorOutputNode) {
    switch (node.type) {
      case NodeType.ExportStatement:
        this.#updateImportsBasedOnUsage(node.value);
        break;
      case NodeType.TraitDefinition:
        break;
      case NodeType.CallDefinition:
      case NodeType.TypeDefinition: {
        if ('returnType' in node) {
          this.#importResolvedType(
            this.#resolveTypeExpression(node.returnType)
          );
        }
        for (const p of node.parameters) {
          const resolvedType = this.#resolveTypeExpression(p.typeExpression);
          this.#importResolvedType(resolvedType);
        }
        break;
      }
    }
  }
  async #resolveModulePathToAbsolutePath(modulePath: string) {
    let externalModule: IExternalModule | null;
    let inputFile: string;

    const compilerOptions = this.#configuration;

    if (!modulePath.startsWith('.')) {
      throw new Exception('Currently only relative imports are supported');
    } else {
      externalModule = null;
      inputFile = path.resolve(path.dirname(this.#file.path), modulePath);
    }

    if (
      externalModule === null &&
      !inputFile.startsWith(compilerOptions.rootDir)
    ) {
      throw new Exception(
        `Tried to import ${path.resolve(
          inputFile
        )}/${inputFile} that is outside of ${compilerOptions.rootDir}`
      );
    }

    return {
      inputFile,
      externalModule
    };
  }
  async #updateOriginalImportsAndSetDefinitions(node: ASTGeneratorOutputNode) {
    switch (node.type) {
      case NodeType.ExportStatement:
        await this.#updateOriginalImportsAndSetDefinitions(node.value);
        break;
      case NodeType.ImportStatement: {
        const { inputFile, externalModule } =
          await this.#resolveModulePathToAbsolutePath(node.from.value);
        const root = this.#root();
        const defaultOptions = {
          indentationSize: this.#indentationSize,
          textDecoder: this.#textDecoder,
          textEncoder: this.#textEncoder,
          sortProperties: this.#sortProperties,
          root
        };
        let fileGenerator = root.#fileGenerators.get(inputFile);
        if (!fileGenerator) {
          fileGenerator = new Parser(
            {
              path: inputFile,
              contents: await fs.promises.readFile(inputFile)
            },
            {
              ...defaultOptions,
              configuration: this.#configuration,
              // TODO: check if this makes sense
              externalModule: this.#externalModule
            }
          );
          root.#fileGenerators.set(inputFile, fileGenerator);
        }
        let originalImport = this.#originalImports.get(fileGenerator);
        if (!originalImport) {
          originalImport = {
            identifiers: new Set(),
            externalModule: externalModule !== null,
            fileGenerator
          };
          this.#originalImports.set(fileGenerator, originalImport);
        }
        if (node.requirements) {
          for (const req of node.requirements) {
            originalImport.identifiers.add(req.value);
          }
        }
        break;
      }
      case NodeType.TraitDefinition:
      case NodeType.CallDefinition:
      case NodeType.TypeDefinition:
        this.#definitions.set(node.name.value, node);
        break;
    }
  }
  /**
   * assign types/calls to traits
   */
  #fillTraits() {
    for (const n of this.#definitions.values()) {
      switch (n.type) {
        // TODO: this is gonna be used when dealing with traits extending other traits
        case NodeType.TraitDefinition:
          break;
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
                nodes: []
              };
              fileGenerator.#traits.set(t.value, trait);
            }
            trait.nodes.push({
              fileGenerator: this,
              identifier: n.name.value
            });
          }
          break;
        }
      }
    }
  }
  #removeRootDir(value: string) {
    const rootDirRegExp = this.#rootDirRegularExpression();
    if (!rootDirRegExp.test(value)) {
      throw new Exception(
        `Path does not include root dir (${
          this.#root().#configuration.rootDir
        }) at the beginning: ${value}`
      );
    }
    return value.replace(rootDirRegExp, '');
  }
  #rootDirRegularExpression() {
    return new RegExp(`^${this.#root().#configuration.rootDir}/?`);
  }
  #import(req: InputRequirement): string {
    const id = req.identifier;
    let fullPath: string;
    if ('fileGenerator' in req) {
      /**
       * if we're trying to import something from the current @type {Parser}
       * we simply return the desired identifier
       */
      if (this === req.fileGenerator) {
        return id;
      }
      fullPath = req.fileGenerator.#file.path;
    } else {
      fullPath = req.path;
    }
    const existingImport = Array.from(this.#imports).find(
      (i) => i.path === fullPath && i.identifier === id
    );
    if (existingImport) {
      return id;
    }
    let resolvedRequirement: Requirement;
    if ('fileGenerator' in req) {
      resolvedRequirement = {
        path: fullPath,
        identifier: id,
        fileGenerator: req.fileGenerator
      };
    } else {
      const defaultOptions = {
        path: fullPath,
        identifier: id
      };
      if (req.target === 'nodeModule') {
        resolvedRequirement = {
          target: 'nodeModule',
          wildcard: req.wildcard,
          ...defaultOptions,
          isDefaultImport: req.isDefaultImport
        };
      } else {
        resolvedRequirement = {
          target: 'outDir',
          ...defaultOptions
        };
      }
    }
    this.#imports.add(resolvedRequirement);
    this.#identifiers.set(id, null);
    return id;
  }
  /**
   * resolves "/a/b/c/node_modules/@a/b" to "@a/b" and local imports
   *  (imports within the root dir, but outside of the node_modules folder) to relative paths
   * @param originalFileGenerator file generator that is importing this absolute path
   * @param absolutePath absolute path of the source file
   * @returns resolved import path
   */
  #sourceImportToOutDirImport(
    originalFileGenerator: Parser,
    absolutePath: string
  ) {
    let finalPath: string;

    if (this.#externalModule) {
      const compilerOptions = this.#configuration;
      const externalSchemaRootFolder = compilerOptions.rootDir;
      const nodeModulesFolderPath = compilerOptions.rootDir.substring(
        0,
        compilerOptions.rootDir.lastIndexOf('node_modules') +
          'node_modules'.length
      );
      const externalSchemaOutDir = path.resolve(
        externalSchemaRootFolder,
        compilerOptions.outDir
      );
      const finalInputFile = path.resolve(
        externalSchemaOutDir,
        this.#file.path.replace(
          new RegExp(`^${externalSchemaRootFolder}/?`),
          ''
        )
      );
      finalPath = finalInputFile.replace(
        new RegExp(`^${nodeModulesFolderPath}/?`),
        ''
      );
    } else {
      finalPath = path.relative(
        path.dirname(originalFileGenerator.#file.path),
        absolutePath
      );
      /**
       * Enforce local import
       */
      if (!finalPath.startsWith('.')) {
        finalPath = `./${finalPath}`;
      }
    }
    return finalPath;
  }
  async #setExportsAndValidateImports(node: ASTGeneratorOutputNode) {
    switch (node.type) {
      case NodeType.CallDefinition:
      case NodeType.TraitDefinition:
      case NodeType.TypeDefinition:
        break;
      case NodeType.ExportStatement:
        this.#export(node);
        await this.#setExportsAndValidateImports(node.value);
        break;
      // TODO: maybe remove this switch case, since it's just checking if the imported file has a file generator for it
      case NodeType.ImportStatement: {
        const { inputFile } = await this.#resolveModulePathToAbsolutePath(
          node.from.value
        );
        const root = this.#root();
        const fileGenerator = root.#fileGenerators.get(inputFile);
        if (!fileGenerator) {
          throw new Exception(
            `Internal Error: File generator not previously created for file: ${inputFile}`
          );
        }
        break;
      }
      default:
        throw new Exception(`Unhandled node type: ${node}`);
    }
  }
  #root() {
    return this.#parent ?? this;
  }
  #getMetadataFromResolvedType(resolvedType: ResolvedType): MetadataParamType {
    if ('generic' in resolvedType) {
      return {
        type: 'generic',
        value: resolvedType.generic
      };
    } else if ('template' in resolvedType) {
      switch (resolvedType.template) {
        case 'set':
        case 'vector':
        case 'optional':
          return {
            type: 'template',
            template: resolvedType.template,
            value: this.#getMetadataFromResolvedType(resolvedType.type)
          };
        case 'map':
          return {
            type: 'template',
            template: 'map',
            key: this.#getMetadataFromResolvedType(resolvedType.key.resolved),
            value: this.#getMetadataFromResolvedType(
              resolvedType.value.resolved
            )
          };
        case 'tuple':
          return {
            type: 'template',
            template: 'tuple',
            args: resolvedType.types.map((t) =>
              this.#getMetadataFromResolvedType(t)
            )
          };
        case 'bigint':
          return {
            type: 'template',
            template: 'bigint',
            bits: resolvedType.bits.value
          };
        default:
          throw new Exception(`Unhandled template type: ${resolvedType}`);
      }
    } else if ('fileGenerator' in resolvedType) {
      const importPath = resolvedType.fileGenerator.#sourceImportToOutDirImport(
        this,
        resolvedType.fileGenerator.#file.path
      );
      if (resolvedType.fileGenerator.#externalModule) {
        return {
          type: 'externalModuleType',
          importPath,
          name: resolvedType.identifier
        };
      }
      return {
        type: 'externalType',
        name: resolvedType.identifier,
        relativePath: importPath
      };
    }
    return {
      type: 'internalType',
      interfaceName: resolvedType.name.value
    };
  }
  #getMetadataFromParam(param: INodeParamDefinition): IMetadataParam {
    return {
      name: param.name.value,
      type: this.#getMetadataFromResolvedType(
        this.#resolveTypeExpression(param.typeExpression)
      )
    };
  }
  #getMetadataFromCallOrTypeDefinition(
    node: INodeCallDefinition | INodeTypeDefinition | INodeTraitDefinition
  ): Metadata {
    let kind: Metadata['kind'];
    switch (node.type) {
      case NodeType.CallDefinition:
        kind = 'call';
        break;
      case NodeType.TypeDefinition:
        kind = 'type';
        break;
      case NodeType.TraitDefinition: {
        const trait = this.#traits.get(node.name.value);
        if (!trait) {
          throw new Exception(`No nodes found for trait: ${node.name.value}`);
        }
        return {
          kind: 'trait',
          name: node.name.value,
          // ! should be filled with correct metadata objects
          nodes: trait.nodes.map((resolvedType) =>
            this.#getMetadataFromResolvedType(resolvedType)
          )
        };
      }
    }
    return {
      kind,
      id: this.#getUniqueHeader(node),
      globalName:
        this.#getTypeDefinitionOrCallDefinitionNamePropertyValue(node),
      name: node.name.value,
      params: node.parameters.map((p) => this.#getMetadataFromParam(p))
    };
  }
  #export(node: INodeExportStatement) {
    const exportName = node.value.name.value;
    if (this.#exports.has(exportName)) {
      throw new Exception(this.#createNodeError(node, 'Duplicated exports'));
    }
    this.#exports.set(exportName, node.value);
  }
  #resolveTypeExpressionToString(options: {
    typeExpression: NodeTypeExpression;
    readOnly: boolean;
  }): string {
    const { readOnly, typeExpression } = options;
    return this.#resolvedTypeToString({
      resolvedType: this.#resolveTypeExpression(typeExpression),
      readOnly
    });
  }
  #resolvedTypeToString(options: {
    resolvedType: ResolvedType;
    readOnly: boolean;
  }) {
    const { resolvedType: resolved, readOnly } = options;
    if ('generic' in resolved) {
      switch (resolved.generic) {
        case GenericName.Boolean:
          return 'boolean';
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
            typeExpression: resolved.expression
          })} | null`;
        case 'map': {
          const k = this.#resolveTypeExpressionToString({
            ...options,
            typeExpression: resolved.key.expression
          });
          const v = this.#resolveTypeExpressionToString({
            ...options,
            typeExpression: resolved.value.expression
          });
          return `${readOnly ? 'ReadonlyMap' : 'Map'}<${k}, ${v}>`;
        }
        case 'tuple':
          return `[${resolved.expressions.map((t) =>
            this.#resolveTypeExpressionToString({
              ...options,
              typeExpression: t
            })
          )}]`;
        case 'vector':
          return `${
            readOnly ? 'ReadonlyArray' : 'Array'
          }<${this.#resolveTypeExpressionToString({
            ...options,
            typeExpression: resolved.expression
          })}>`;
        case 'set':
          return `${
            readOnly ? 'ReadonlySet' : 'Set'
          }<${this.#resolveTypeExpressionToString({
            ...options,
            typeExpression: resolved.expression
          })}>`;
        case 'bigint':
          return 'string';
        default:
          throw new Exception('Unresolved template type');
      }
    }
    const name =
      'fileGenerator' in resolved ? resolved.identifier : resolved.name.value;
    if (readOnly) {
      return `Readonly<${name}>`;
    }
    return name;
  }
  #createNodeError(node: Node | NodeTypeExpression | IToken, message: string) {
    const pos = node.position;
    let offset: number;
    if (typeof pos.start !== 'number') {
      offset = pos.start.position.start;
    } else {
      offset = pos.start;
    }
    return new ErrorFormatter({
      contents: this.#file.contents,
      textDecoder: this.#textDecoder,
      file: this.#file.path,
      offset: () => offset
    }).format(message);
  }
  #resolveTypeExpression(typeExpression: NodeTypeExpression): ResolvedType {
    switch (typeExpression.type) {
      case NodeType.TemplateExpression:
        switch (typeExpression.name.value) {
          case 'tuple':
            return {
              template: 'tuple',
              expressions: typeExpression.templateArguments,
              types: typeExpression.templateArguments.map((t) =>
                this.#resolveTypeExpression(t)
              )
            };
          case 'optional': {
            const optionalType = typeExpression.templateArguments[0];
            if (typeof optionalType === 'undefined') {
              throw new Exception(
                this.#createNodeError(
                  typeExpression,
                  '`optional` template expect one argument'
                )
              );
            }
            return {
              template: 'optional',
              expression: optionalType,
              type: this.#resolveTypeExpression(optionalType)
            };
          }
          case 'map': {
            const [key, value] = typeExpression.templateArguments;
            if (typeof key === 'undefined' || typeof value === 'undefined') {
              throw new Exception(
                this.#createNodeError(
                  typeExpression,
                  '`map` template expect two arguments'
                )
              );
            }
            return {
              template: 'map',
              key: {
                resolved: this.#resolveTypeExpression(key),
                expression: key
              },
              value: {
                resolved: this.#resolveTypeExpression(value),
                expression: value
              }
            };
          }
          case 'set':
          case 'vector': {
            const setOrVectorType = typeExpression.templateArguments[0];
            if (typeof setOrVectorType === 'undefined') {
              throw new Exception(
                this.#createNodeError(
                  typeExpression,
                  '`set` or `vector` template expressions expect one argument'
                )
              );
            }
            return {
              template: typeExpression.name.value,
              expression: setOrVectorType,
              type: this.#resolveTypeExpression(setOrVectorType)
            };
          }
          case 'bigint': {
            const [bits] = typeExpression.templateArguments;
            if (!bits || bits.type !== NodeType.LiteralNumber) {
              throw new Exception(
                'First argument of `bigint` template should be a literal number'
              );
            }
            return {
              template: 'bigint',
              bits
            };
          }
          default:
            throw new Exception(
              this.#createNodeError(
                typeExpression,
                'Unknown template expression'
              )
            );
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
          case GenericName.Boolean:
          case GenericName.String:
          case GenericName.NullTerminatedString:
          case GenericName.Bytes:
          case GenericName.Long:
          case GenericName.UnsignedLong:
            return {
              generic: typeExpression.value
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
      throw new Exception(
        this.#createNodeError(typeExpression, 'Unsupported type')
      );
    }

    if (id instanceof Parser) {
      return {
        identifier: typeExpression.value,
        fileGenerator: id
      };
    }

    return id;
  }
  #fileGeneratorFromRequirements(id: string) {
    for (const r of this.#imports) {
      if ('fileGenerator' in r && r.identifier === id) {
        return r.fileGenerator;
      }
    }
    for (const originalImport of this.#originalImports.values()) {
      if (originalImport.identifiers.has(id)) {
        return originalImport.fileGenerator;
      }
    }
    return null;
  }
  #getTypeDefinitionOrCallDefinitionNamePropertyValue(
    node: INodeCallDefinition | INodeTypeDefinition | INodeTraitDefinition
  ) {
    return getTypeDefinitionOrCallDefinitionNamePropertyValue(
      node,
      this.#removeRootDir(this.#file.path)
    );
  }
  #getUniqueHeaderString(
    node: INodeTraitDefinition | INodeCallDefinition | INodeTypeDefinition
  ) {
    const values = [
      `${this.#removeRootDir(this.#file.path)}/${node.name.value}`
    ];
    if (node.type === NodeType.CallDefinition) {
      const resolvedTypeExpression = this.#resolveTypeExpression(
        node.returnType
      );
      values.unshift(
        // TODO: get full path of the expression and add it to the final unique header
        `${this.#resolvedTypeToString({
          resolvedType: resolvedTypeExpression,
          readOnly: true
        })} =>`
      );
    }
    switch (node.type) {
      case NodeType.CallDefinition:
      case NodeType.TypeDefinition:
        values.push(
          ':',
          node.parameters
            .map((p) =>
              // TODO: get full path of the expression and add it to the final unique header
              this.#resolveTypeExpressionToString({
                readOnly: false,
                typeExpression: p.typeExpression
              })
            )
            .join(', ')
        );
    }

    // TODO: here we add `: $traits` to the list

    /**
     * $returnType => $fullName: Array<int> a, Array<int> b, int c : T1, T2
     */
    return values.join(' ');
  }
  #getUniqueHeader(
    node: INodeTraitDefinition | INodeCallDefinition | INodeTypeDefinition
  ) {
    const n = crc.crc32(this.#getUniqueHeaderString(node));
    const view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, n, true);
    return view.getInt32(0, true);
  }
  #importResolvedType(resolvedType: ResolvedType) {
    if ('generic' in resolvedType) {
      return;
    }
    if ('template' in resolvedType) {
      switch (resolvedType.template) {
        case 'map':
          this.#importResolvedType(resolvedType.key.resolved);
          this.#importResolvedType(resolvedType.value.resolved);
          break;
        case 'optional':
        case 'set':
        case 'vector':
          this.#importResolvedType(resolvedType.type);
          break;
        case 'tuple':
          for (const t of resolvedType.types) {
            this.#importResolvedType(t);
          }
          break;
        default:
          resolvedType;
      }
      return;
    }
    if ('fileGenerator' in resolvedType) {
      this.#import(resolvedType);
      return;
    }
    this.#import({
      identifier: resolvedType.name.value,
      fileGenerator: this
    });
  }
}
