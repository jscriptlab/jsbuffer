import ASTGenerator, {
  ASTGeneratorOutputNode,
  EOF,
  INodeCallDefinition,
  INodeExportStatement,
  INodeParamDefinition,
  INodeTraitDefinition,
  INodeTypeDefinition,
  NodeType,
  NodeTypeExpression
} from '../src/ASTGenerator';
import CodeStream from 'textstreamjs';
import fs from 'fs';
import path from 'path';
import Tokenizer from '../src/Tokenizer';
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
  getValidateDefinitionFunctionName,
  integerRangeFromBits
} from './fileGeneratorUtilities';
import crc from 'crc';
import GenericName from './GenericName';
import JavaScriptObjectStringify from './JavaScriptObjectStringify';
import { enforceLocalImport, getMetadataFileName } from './stringUtilities';
import {
  IConfiguration,
  IExternalModule,
  IFileGeneratorOptions,
  IMetadataParam,
  IOutputFile,
  ITrait,
  ITypeScriptConfiguration,
  InputRequirement,
  Metadata,
  MetadataParamType,
  Requirement,
  ResolvedType
} from './types';
import {
  ASTNodePreprocessingFailure,
  DuplicateExport,
  ExceptionInternalError,
  InvalidTemplateArgumentCount,
  TypeExpressionNotExported,
  TypeNotFound,
  UnexpectedTraitOutputNodeCount,
  UnhandledNode,
  UnhandledResolvedType,
  UnsupportedGenericExpression,
  UnsupportedTemplate,
  UnsupportedTypeExpression
} from './exceptions';
import JSBI from 'jsbi';

export interface IFile {
  path: string;
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
  readonly #compilerOptions;
  readonly #textDecoder;
  readonly #typeScriptConfiguration;
  readonly #imports = new Set<Requirement>();
  readonly #indentationSize;
  readonly #metadataObjects = new Set<Metadata>();
  readonly #originalImports = new Map<
    FileGenerator,
    {
      identifiers: Set<string>;
      externalModule: boolean;
      fileGenerator: FileGenerator;
    }
  >();
  readonly #fileGenerators = new Map<string, FileGenerator>();
  readonly #parent;
  readonly #traits = new Map<string, ITrait>();
  readonly #uniqueNamePropertyName: string;
  readonly #externalModule;
  readonly #sortProperties;
  #offset = 0;
  #nodes: Array<ASTGeneratorOutputNode> = [];
  public constructor(
    file: IFile,
    {
      externalModule = false,
      textDecoder,
      sortProperties = false,
      textEncoder,
      compilerOptions,
      uniqueNamePropertyName,
      indentationSize,
      root: parent = null,
      typeScriptConfiguration
    }: IFileGeneratorOptions
  ) {
    super(undefined, {
      indentationSize
    });
    if (!path.isAbsolute(compilerOptions.outDir)) {
      throw new Exception(
        'The `outDir` compiler options must be an absolute path'
      );
    }
    this.#sortProperties = sortProperties;
    this.#compilerOptions = compilerOptions;
    this.#externalModule = externalModule;
    this.#file = file;
    this.#parent = parent;
    this.#uniqueNamePropertyName = uniqueNamePropertyName ?? '_name';
    this.#indentationSize = indentationSize;
    this.#textEncoder = textEncoder;
    this.#typeScriptConfiguration = typeScriptConfiguration;
    this.#textDecoder = textDecoder;
  }
  public async generate() {
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
    /**
     * actually generate code
     */
    const files = await this.#generateFiles();
    let exists: boolean;
    for (const f of files) {
      const resolvedFilePath = path.resolve(
        this.#compilerOptions.outDir,
        f.path
      );
      const resolvedFilePathDirName = path.dirname(resolvedFilePath);
      exists = false;
      try {
        await fs.promises.access(resolvedFilePathDirName, fs.constants.W_OK);
        exists = true;
      } catch (reason) {
        await fs.promises.mkdir(resolvedFilePathDirName, {
          recursive: true
        });
      }
      if (
        exists &&
        !(await fs.promises.stat(resolvedFilePathDirName)).isDirectory()
      ) {
        throw new Exception('The specified `outDir` is not a directory');
      }
      exists = false;
      try {
        await fs.promises.access(resolvedFilePath, fs.constants.W_OK);
        exists = true;
      } catch (reason) {
        /* empty */
      }
      if (exists && !(await fs.promises.stat(resolvedFilePath)).isFile()) {
        throw new Exception(
          `FileGenerator outputted file "${resolvedFilePath}", but it is not a file, so we cannot move on`
        );
      }
      await fs.promises.writeFile(resolvedFilePath, f.contents);
    }
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
  async #iterateFileGenerators(fn: (f: FileGenerator) => Promise<void> | void) {
    for (const f of [...this.#fileGenerators.values(), this]) {
      await Promise.resolve(fn(f));
    }
  }
  async #processExternalSchemaImports(node: ASTGeneratorOutputNode) {
    const root = this.#root();
    const defaultOptions = {
      root,
      textDecoder: this.#textDecoder,
      sortProperties: this.#sortProperties,
      indentationSize: this.#indentationSize,
      textEncoder: this.#textEncoder
    };
    const fileGenerators = root.#fileGenerators;
    switch (node.type) {
      case NodeType.ImportStatement: {
        const { externalModule } = await this.#resolveModulePathToAbsolutePath(
          node.from.value
        );
        if (externalModule) {
          const rootDir = path.dirname(externalModule.configFile);
          const mainFile = path.resolve(
            rootDir,
            externalModule.configuration.mainFile
          );
          const compilerOptions = {
            outDir: path.resolve(rootDir, externalModule.configuration.outDir),
            rootDir
          };
          let mainFileGenerator = fileGenerators.get(mainFile);
          if (!mainFileGenerator) {
            mainFileGenerator = new FileGenerator(
              {
                path: mainFile
              },
              {
                // TODO: maybe set root to null, and leave each external module to resolve it's own dependencies accordingly, then we'd have to look into the main schema file generator for the desired file generator
                ...defaultOptions,
                externalModule: true,
                // TODO: maybe get it from `jsbufferconfig.json` file
                uniqueNamePropertyName: root.#uniqueNamePropertyName,
                compilerOptions
              }
            );
            fileGenerators.set(mainFile, mainFileGenerator);
          }
        }
        break;
      }
    }
  }
  async #preprocess() {
    const tokenizer = new Tokenizer({
      textDecoder: this.#textDecoder,
      textEncoder: this.#textEncoder,
      contents: await fs.promises.readFile(this.#file.path)
    });
    this.#nodes = new ASTGenerator(tokenizer.tokenize().tokens()).generate();
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
    for (const node of this.#nodes) {
      await this.#processExternalSchemaImports(node);
    }
    /**
     * preprocess all external schemas
     */
    for (const fileGenerator of this.#fileGenerators.values()) {
      if (fileGenerator.#externalModule) {
        await fileGenerator.#preprocess();
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

    const compilerOptions = this.#compilerOptions;

    if (!modulePath.startsWith('.')) {
      const nodeModulesFolderPath = await this.#findClosestNodeModules(
        this.#file.path
      );
      if (nodeModulesFolderPath === null) {
        throw new Exception('Failed to find closest node_modules folder');
      }
      inputFile = path.resolve(nodeModulesFolderPath, modulePath);
      const configFile = await this.#fileClosestFileOrFolder(
        inputFile,
        'jsbufferconfig.json'
      );
      if (configFile === null) {
        throw new Exception(`No jsbufferconfig found for: ${modulePath}`);
      }
      let parsedConfig: IConfiguration;
      try {
        parsedConfig = JSON.parse(
          await fs.promises.readFile(configFile, 'utf8')
        );
      } catch (reason) {
        throw new Exception(`Failed to parse ${configFile}: ${reason}`);
      }
      if (!parsedConfig) {
        throw new Exception('No valid data on jsbufferconfig.json');
      }
      externalModule = {
        nodeModulesFolderPath,
        configFile,
        configuration: parsedConfig
      };
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
          if (externalModule) {
            throw new Exception(
              `Could not find "${inputFile}" file generator for external schema with config file at: ${externalModule.configFile}`
            );
          }
          fileGenerator = new FileGenerator(
            {
              path: inputFile
            },
            {
              ...defaultOptions,
              compilerOptions: this.#compilerOptions,
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
        this.#identifiers.set(getCompareFunctionName(node), null);
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
  async #generateFiles() {
    const files = new Array<IOutputFile>();
    for (const f of [...this.#fileGenerators.values(), this]) {
      if (f.#externalModule) {
        continue;
      }
      f.#generateFinalCode();
      let contents = f.value();
      f.#generateRequirementsCode();
      contents = `${f.value()}${contents}`;
      const relativePath = `${f.#removeRootDir(f.#file.path)}.ts`;
      files.push({
        path: relativePath,
        contents
      });
      files.push({
        path: getMetadataFileName(relativePath),
        contents: JSON.stringify({
          ...Array.from(f.#metadataObjects).reduce<Record<string, unknown>>(
            (out, a) => {
              out[a.name] = a;
              return out;
            },
            {}
          ),
          __all: Array.from(f.#metadataObjects)
        })
      });
    }

    files.push(this.#generateTypesFile());

    if (this.#typeScriptConfiguration) {
      let config: Partial<ITypeScriptConfiguration> = {
        compilerOptions: {},
        include: files.map((f) => f.path).filter((t) => t.endsWith('.ts'))
      };
      const compilerOptions = this.#typeScriptConfiguration.compilerOptions;
      if (compilerOptions) {
        config = {
          ...config,
          compilerOptions: {
            ...compilerOptions,
            ...config.compilerOptions
          }
        };
      }
      files.push(this.#generateTypeScriptConfigurationFile(config));
    }
    return files;
  }
  #removeRootDir(value: string) {
    const rootDirRegExp = this.#rootDirRegularExpression();
    if (!rootDirRegExp.test(value)) {
      throw new Exception(
        `Path does not include root dir (${
          this.#root().#compilerOptions.rootDir
        }) at the beginning: ${value}`
      );
    }
    return value.replace(rootDirRegExp, '');
  }
  #rootDirRegularExpression() {
    return new RegExp(`^${this.#root().#compilerOptions.rootDir}/?`);
  }
  #import(req: InputRequirement): string {
    const id = req.identifier;
    let fullPath: string;
    if ('fileGenerator' in req) {
      /**
       * if we're trying to import something from the current @type {FileGenerator}
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
    originalFileGenerator: FileGenerator,
    absolutePath: string
  ) {
    let finalPath: string;

    if (this.#externalModule) {
      const compilerOptions = this.#compilerOptions;
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
      finalPath = enforceLocalImport(
        path.relative(
          path.dirname(originalFileGenerator.#file.path),
          absolutePath
        )
      );
    }
    return finalPath;
  }
  #generateRequirementsCode() {
    for (const i of this.#imports) {
      let finalPath: string;
      if ('target' in i) {
        if (i.target === 'nodeModule') {
          finalPath = i.path;
        } else {
          finalPath = this.#sourceImportToOutDirImport(
            this,
            path.resolve(this.#compilerOptions.rootDir, i.path)
          );
        }
      } else {
        finalPath = i.fileGenerator.#sourceImportToOutDirImport(this, i.path);
      }
      const isNodeModule = 'target' in i && i.target === 'nodeModule';
      const maybeDefaultImport = isNodeModule
        ? i.isDefaultImport
          ? i.identifier
          : null
        : null;
      this.write('import ');
      if (isNodeModule && maybeDefaultImport) {
        if (i.wildcard) {
          this.append('* as ');
        }
        this.append(maybeDefaultImport);
      } else {
        this.append(`{ ${i.identifier}`);
        if (i.alias) {
          this.append(` as ${i.alias}`);
        }
        this.append(' }');
      }
      this.append(` from "${finalPath}";\n`);
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
  ): IOutputFile {
    const stringify = new JavaScriptObjectStringify(undefined, {
      indentationSize: this.#indentationSize
    });
    const config = {
      ...additionalTypeScriptConfiguration,
      ...(this.#typeScriptConfiguration ? this.#typeScriptConfiguration : {})
    };
    stringify.stringify(config);
    return {
      path: 'tsconfig.json',
      contents: stringify.value()
    };
  }
  #generateTypesFile(): IOutputFile {
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
        this.write('writeSignedBigInt(value: string, bits: number): void;\n');
        this.write('writeUnsignedBigInt(value: string, bits: number): void;\n');
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
        this.write('readSignedBigInt(bits: number): string;\n');
        this.write('readUnsignedBigInt(bits: number): string;\n');
        this.write('readUint32(): number;\n');
        this.write('readString(): string;\n');
        this.write('readNullTerminatedString(): string;\n');
        this.write('readSignedLong(): string;\n');
        this.write('readUnsignedLong(): string;\n');
        this.write('readInt32(): number;\n');
        this.write('readDouble(): number;\n');
        this.write('readFloat(): number;\n');
        this.write('rewind(bytes: number): void;\n');
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
      path: '__types__.ts',
      contents: this.value()
    };
  }
  async #fileClosestFileOrFolder(
    startingDir: string,
    expectedName: string
  ): Promise<string | null> {
    let folders: string[];
    try {
      folders = await fs.promises.readdir(startingDir);
    } catch (reason) {
      return this.#fileClosestFileOrFolder(
        path.dirname(startingDir),
        expectedName
      );
    }
    if (folders.includes(expectedName)) {
      return path.resolve(startingDir, expectedName);
    }
    if (path.dirname(startingDir) === startingDir) {
      return null;
    }
    return this.#fileClosestFileOrFolder(
      path.dirname(startingDir),
      expectedName
    );
  }
  async #findClosestNodeModules(startingDir: string): Promise<string | null> {
    return this.#fileClosestFileOrFolder(startingDir, 'node_modules');
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
          throw new ExceptionInternalError(
            `File generator not previously created for file: ${inputFile}`
          );
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
        case GenericName.Bytes: {
          const expressions = [
            `${v1}.byteLength === ${v2}.byteLength`,
            `${v1}.every((__byte,index) => ${v2}[index] === __byte)`
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
        case GenericName.Boolean:
        case GenericName.NullTerminatedString:
          this.append(`${v1} === ${v2}`);
          break;
        default:
          throw new UnsupportedGenericExpression(resolved);
      }
    } else if ('fileGenerator' in resolved) {
      const type = this.#resolvedTypeExpressionToDefinition(resolved);
      const compareFunctionName = this.#import({
        fileGenerator: resolved.fileGenerator,
        identifier: getCompareFunctionName(type)
      });
      this.append(`${compareFunctionName}(${v1},${v2})`);
    } else if ('template' in resolved) {
      switch (resolved.template) {
        case 'bigint': {
          this.append('((a, b) => ');
          this.indentBlock(() => {
            this.append('JSBI.equal(a, b)');
          });
          this.append(`)(JSBI.BigInt(${v1}),JSBI.BigInt(${v2}))`);
          break;
        }
        case 'optional': {
          const optionalVarName1 = `__dp${depth}1`;
          const optionalVarName2 = `__dp${depth}2`;
          this.append(`((${optionalVarName1}, ${optionalVarName2}) => `);
          this.append(
            `${optionalVarName1} !== null && ${optionalVarName2} !== null ? `
          );
          depth = this.#generateComparisonExpression(
            resolved.expression,
            optionalVarName1,
            optionalVarName2,
            depth + 1
          );
          this.append(` : ${optionalVarName1} === ${optionalVarName2}`);
          this.append(`)(${v1},${v2})`);
          break;
        }
        case 'map': {
          this.append('((l1,l2) => (');
          (() => {
            const secondValueVarName = `__v2${depth}`;
            this.append('l1.every(');
            (() => {
              this.append('([k1,v1],i) => (');
              this.indentBlock(() => {
                this.append(
                  `(${secondValueVarName} => typeof ${secondValueVarName} === 'undefined' ? false : `
                );
                this.indentBlock(() => {
                  depth = this.#generateComparisonExpression(
                    resolved.key.expression,
                    'k1',
                    `${secondValueVarName}[0]`,
                    depth + 1
                  );
                  this.append(' && ');
                  depth = this.#generateComparisonExpression(
                    resolved.value.expression,
                    'v1',
                    `${secondValueVarName}[1]`,
                    depth + 1
                  );
                });
                this.append(')(l2[i])');
              });
              this.append(')');
            })();
            this.append(')');
          })();
          this.append(`))(Array.from(${v1}),Array.from(${v2}))`);
          break;
        }
        case 'set':
        case 'vector': {
          const itemVarName = `__originalItem${depth}`;
          const indexVarName = `__index${depth}`;
          const lengthPropName =
            resolved.template === 'set' ? 'size' : 'length';
          this.append(
            [
              `${v1}.${lengthPropName} === ${v2}.${lengthPropName}`,
              `Array.from(${v1}).every((${itemVarName},${indexVarName}) => (`
            ].join(' && ')
          );
          this.indentBlock(() => {
            const validateUndefinedFnVarName = `__item${depth}`;
            this.append(
              `typeof ${itemVarName} === 'undefined' ? false : (${validateUndefinedFnVarName} => typeof ${validateUndefinedFnVarName} === 'undefined' ? false : (`
            );
            this.indentBlock(() => {
              depth = this.#generateComparisonExpression(
                resolved.expression,
                itemVarName,
                validateUndefinedFnVarName,
                depth + 1
              );
            });
            this.append(`))(Array.from(${v2})[${indexVarName}])`);
          });
          this.append('))');
          break;
        }
        case 'tuple': {
          const exps = resolved.expressions.map((exp, index) => ({
            exp,
            varName1: `__a${depth}${index}`,
            varName2: `__b${depth}${index}`,
            index
          }));
          for (const { exp, index, varName1, varName2 } of exps) {
            this.append(
              `/* compare tuple item ${index} of type ${this.#resolveTypeExpressionToString(
                {
                  typeExpression: exp,
                  readOnly: true
                }
              )} */ ((${varName1}, ${varName2}) => `
            );
            depth = this.#generateComparisonExpression(
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
    return depth;
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
  #resolvedTypeExpressionToDefaultExpression(resolved: ResolvedType): string {
    if ('generic' in resolved) {
      switch (resolved.generic) {
        case GenericName.Bytes:
          return 'new Uint8Array(0)';
        case GenericName.Boolean:
          return 'false';
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
        case 'bigint':
          return '"0"';
        case 'map':
          return `new Map<${this.#resolveTypeExpressionToString({
            typeExpression: resolved.key.expression,
            readOnly: false
          })}, ${this.#resolveTypeExpressionToString({
            typeExpression: resolved.value.expression,
            readOnly: false
          })}>()`;
        case 'set':
          return `new Set<${this.#resolveTypeExpressionToString({
            typeExpression: resolved.expression,
            readOnly: false
          })}>()`;
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
      this.#import({
        identifier: getDefaultFunctionName(type),
        fileGenerator: resolved.fileGenerator
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
              depth = this.#generateComparisonExpression(
                p.typeExpression,
                `changes['${p.name.value}']`,
                `value['${p.name.value}']`,
                depth + 1
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
            },
            '}\n'
          );
        }
        this.write('return value;\n');
      },
      '}\n'
    );
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
          throw new UnhandledResolvedType(resolvedType);
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
  #generateNodeCode(node: ASTGeneratorOutputNode) {
    switch (node.type) {
      case NodeType.ExportStatement:
        this.#generateNodeCode(node.value);
        break;
      case NodeType.CallDefinition:
      case NodeType.TypeDefinition:
        this.#generateDefinitionInterface(node);
        this.#generateDefinitionAssertionFunction(node);
        this.#generateDefinitionObjectCreatorFunction(node);
        this.#generateDefinitionEncodeFunction(node);
        this.#generateDefinitionDecodeFunction(node);
        this.#generateDefinitionDefaultObjectCreator(node);
        this.#generateDefinitionCompareFunction(node);
        this.#generateDefinitionUpdateFunction(node);
        break;
      case NodeType.TraitDefinition: {
        const trait = this.#traits.get(node.name.value);
        if (!trait) {
          break;
        }
        this.write(
          `export type ${node.name.value} = ${trait.nodes
            .map((n) =>
              this.#resolvedTypeToString({
                resolvedType: n,
                readOnly: true
              })
            )
            .join(' | ')};\n`
        );
        this.#generateTraitDefinitionAssertionFunction(node, trait.nodes);
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
  #generateDefinitionAssertionFunction(
    node: INodeCallDefinition | INodeTypeDefinition
  ) {
    const valueVarName = 'value';
    const namePropVarName = `${valueVarName}['_name']`;
    const exps = [
      `typeof ${valueVarName} === 'object'`,
      `${valueVarName} !== null`,
      `'_name' in ${valueVarName}`,
      `typeof ${namePropVarName} === 'string'`,
      `${namePropVarName} === "${this.#getTypeDefinitionOrCallDefinitionNamePropertyValue(
        node
      )}"`
    ];
    this.write(
      `export function ${getValidateDefinitionFunctionName(
        node
      )}(${valueVarName}: unknown): ${valueVarName} is ${node.name.value} {\n`,
      () => {
        this.write(`if(!(${exps.join(' && ')})) return false;\n`);
        let depth = 0;
        for (const param of node.parameters) {
          const resolvedType = this.#resolveTypeExpression(
            param.typeExpression
          );
          this.write(
            'if(!(\n',
            () => {
              const paramValueVarName = `__v${depth}`;
              this.write([`"${param.name.value}" in value`].join(' && '));
              this.append(` && ((${paramValueVarName}) => (`);
              depth = this.#generateResolvedTypeValidationExpression(
                resolvedType,
                paramValueVarName,
                depth
              );
              this.append(`))(${valueVarName}['${param.name.value}'])\n`);
            },
            ')) return false;\n'
          );
          depth++;
        }
        this.write('return true;\n');
      },
      '}\n'
    );
  }
  #generateTraitDefinitionAssertionFunction(
    node: INodeTraitDefinition,
    types: ResolvedType[]
  ) {
    const args: [string, string] = [types.length ? 'value' : '_', 'unknown'];
    this.write(
      `export function ${getValidateDefinitionFunctionName(node)}(${args[0]}: ${
        args[1]
      }): ${args[0]} is ${node.name.value} {\n`,
      () => {
        let depth = 0;
        for (const t of types) {
          this.write('if(');
          depth = this.#generateResolvedTypeValidationExpression(
            t,
            args[0],
            depth
          );
          this.append(') return true;\n');
        }
        this.write('return false;\n');
      },
      '}\n'
    );
  }
  #generateResolvedTypeValidationExpression(
    param: ResolvedType,
    value: string,
    depth: number
  ) {
    if ('generic' in param) {
      switch (param.generic) {
        case GenericName.Boolean:
          this.append(`typeof ${value} === 'boolean'`);
          break;
        case GenericName.Double:
        case GenericName.UnsignedLong:
        case GenericName.Long:
        case GenericName.Float:
        case GenericName.Int32:
        case GenericName.Int8:
        case GenericName.Int16:
        case GenericName.Integer:
        case GenericName.Uint16:
        case GenericName.Uint32:
        case GenericName.Uint8: {
          const exps = new Array<string>();
          if (
            param.generic === GenericName.Long ||
            param.generic === GenericName.UnsignedLong
          ) {
            exps.push(`typeof ${value} === 'string'`);
          } else {
            exps.push(`typeof ${value} === 'number'`);
          }
          for (const i of [
            { type: GenericName.Uint16, bits: 16, unsigned: true },
            { type: GenericName.Uint32, bits: 32, unsigned: true },
            { type: GenericName.Uint8, bits: 8, unsigned: true },
            { type: GenericName.UnsignedLong, bits: 64, unsigned: true },
            { type: GenericName.Int8, bits: 8, unsigned: false },
            { type: GenericName.Int16, bits: 16, unsigned: false },
            { type: GenericName.Int32, bits: 32, unsigned: false },
            { type: GenericName.Integer, bits: 32, unsigned: false },
            { type: GenericName.Long, bits: 64, unsigned: false }
          ]) {
            if (param.generic !== i.type) {
              continue;
            }
            const [min, max] = integerRangeFromBits({
              bits: i.bits,
              signed: !i.unsigned
            });
            const jsbi = this.#import({
              path: 'jsbi',
              wildcard: false,
              identifier: 'JSBI',
              target: 'nodeModule',
              isDefaultImport: true
            });
            exps.push(
              `${jsbi}.equal(${jsbi}.BigInt(${value}),${jsbi}.BigInt(${value}))`
            );
            exps.push(
              `${jsbi}.greaterThanOrEqual(${jsbi}.BigInt(${value}),${jsbi}.BigInt("${min}"))`
            );
            exps.push(
              `${jsbi}.lessThanOrEqual(${jsbi}.BigInt(${value}),${jsbi}.BigInt("${max}"))`
            );
          }
          for (const exp of exps) {
            this.append(exp);
            if (exp !== exps[exps.length - 1]) {
              this.append(' && ');
            }
          }
          break;
        }
        case GenericName.String:
        case GenericName.NullTerminatedString:
          this.append(`typeof ${value} === 'string'`);
          break;
        case GenericName.Bytes:
          this.append(`${value} instanceof Uint8Array`);
          break;
        default:
          throw new Error(`Unhandled generic param type: ${param.generic}`);
      }
    } else if ('fileGenerator' in param) {
      const def = this.#resolvedTypeExpressionToDefinition(param);
      const fn = this.#import({
        fileGenerator: param.fileGenerator,
        identifier: getValidateDefinitionFunctionName(def)
      });
      this.append(`${fn}(${value})`);
    } else if ('template' in param) {
      switch (param.template) {
        case 'optional':
          this.append(`${value} === null ? true : ((x) => (`);
          depth = this.#generateResolvedTypeValidationExpression(
            param.type,
            'x',
            depth + 1
          );
          this.append(`))(${value})`);
          break;
        case 'map':
          this.append(`${value} instanceof Map && `);
          this.append(`Array.from(${value}).every(([k,v]) => (`);
          depth = this.#generateResolvedTypeValidationExpression(
            param.key.resolved,
            'k',
            depth + 1
          );
          this.append(' && ');
          depth = this.#generateResolvedTypeValidationExpression(
            param.value.resolved,
            'v',
            depth + 1
          );
          this.append('))');
          break;
        case 'tuple': {
          const isArrayString = [
            `Array.isArray(${value})`,
            `(${value}.length === ${param.expressions.length})`
          ].join(' && ');
          this.append(`${isArrayString} && `);
          let i = 0;
          for (const exp of param.types) {
            this.append('((a) => (');
            depth = this.#generateResolvedTypeValidationExpression(
              exp,
              'a',
              depth + 1
            );
            this.append(`))(${value}[${i}])`);
            if (exp !== param.types[param.types.length - 1]) {
              this.append(' && ');
            }
            ++i;
          }
          break;
        }
        case 'vector':
        case 'set':
          this.append(
            `(Array.isArray(${value}) || ${value} instanceof Set) && Array.from(${value}).every(`
          );
          this.append('p => (');
          this.#generateResolvedTypeValidationExpression(
            param.type,
            'p',
            depth + 1
          );
          this.append('))');
          break;
        case 'bigint': {
          const jsbi = this.#import({
            path: 'jsbi',
            wildcard: false,
            identifier: 'JSBI',
            target: 'nodeModule',
            isDefaultImport: true
          });
          const [min, max] = integerRangeFromBits({
            bits: JSBI.BigInt(param.bits.value),
            signed: true
          });
          const argName = `__bigintValue${depth}`;
          this.append(`typeof ${value} === 'string' && (${argName} => `);
          this.indentBlock(() => {
            this.append(
              [
                `${jsbi}.greaterThanOrEqual(${argName}, ${jsbi}.BigInt("${min}"))`,
                `${jsbi}.lessThanOrEqual(${argName}, ${jsbi}.BigInt("${max}"))`
              ].join(' && ')
            );
          });
          this.append(`)(${jsbi}.BigInt(${value}))`);
          depth++;
          break;
        }
        default:
          throw new Exception(`Unhandled template type: ${param}`);
      }
    } else {
      const fn = getValidateDefinitionFunctionName(param);
      this.append(`${fn}(${value})`);
    }
    return depth;
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
          throw new UnhandledResolvedType(resolved);
      }
    }
    const name =
      'fileGenerator' in resolved ? resolved.identifier : resolved.name.value;
    if (readOnly) {
      return `Readonly<${name}>`;
    }
    return name;
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
              throw new InvalidTemplateArgumentCount(typeExpression);
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
              throw new InvalidTemplateArgumentCount(typeExpression);
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
              throw new InvalidTemplateArgumentCount(typeExpression);
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
      throw new UnsupportedTypeExpression(typeExpression);
    }

    if (id instanceof FileGenerator) {
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
  #generateDefinitionInterface(
    node: INodeCallDefinition | INodeTypeDefinition
  ) {
    let interfaceExtends = '';
    if (node.type === NodeType.CallDefinition) {
      const resolvedReturnType = this.#resolveTypeExpression(node.returnType);
      this.#import({
        target: 'outDir',
        path: '__types__',
        identifier: 'IRequest'
      });
      interfaceExtends = `extends IRequest<${this.#resolvedTypeToString({
        resolvedType: resolvedReturnType,
        readOnly: true
      })}>`;
    }
    this.write(
      `export interface ${node.name.value} ${interfaceExtends} {\n`,
      () => {
        this.write(
          `${
            this.#uniqueNamePropertyName
          }: '${this.#getTypeDefinitionOrCallDefinitionNamePropertyValue(
            node
          )}';\n`
        );
        this.#generateTypeDefinitionOrCallParameters(node);
      },
      '}\n'
    );
  }
  #getTypeDefinitionOrCallDefinitionNamePropertyValue(
    node: INodeCallDefinition | INodeTypeDefinition | INodeTraitDefinition
  ) {
    return getTypeDefinitionOrCallDefinitionNamePropertyValue(
      node,
      this.#removeRootDir(this.#file.path)
    );
  }
  #resolvedTypeExpressionToDefinition(exp: ResolvedType) {
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
    exps: ResolvedType[]
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
          this.#import({
            fileGenerator: firstNode.fileGenerator,
            identifier: getDefaultFunctionName(node)
          });
        }
        this.write(`return ${getDefaultFunctionName(node)}();\n`);
      },
      '}\n'
    );
  }
  #generateEncodeTraitFunction(
    trait: INodeTraitDefinition,
    exps: ResolvedType[]
  ) {
    this.#import({
      target: 'outDir',
      path: '__types__',
      identifier: 'ISerializer'
    });
    this.write(
      `export function ${getEncodeFunctionName(
        trait
      )}(__s: ISerializer,value: ${getTypeName(trait)}) {\n`,
      () => {
        const uniqueNames = new Set<string>();
        this.write(
          `switch(value.${this.#uniqueNamePropertyName}) {\n`,
          () => {
            for (const exp of exps) {
              const isExternalRequirement = 'fileGenerator' in exp;
              const fileGenerator = isExternalRequirement
                ? exp.fileGenerator
                : this;
              const def = this.#resolvedTypeExpressionToDefinition(exp);
              const encodeFunctionName = getEncodeFunctionName(def);
              if (isExternalRequirement) {
                this.#import({
                  ...exp,
                  identifier: encodeFunctionName
                });
              }
              const uniqueName =
                fileGenerator.#getTypeDefinitionOrCallDefinitionNamePropertyValue(
                  def
                );
              this.write(`case '${uniqueName}':\n`);
              this.indentBlock(() => {
                this.write(`return ${encodeFunctionName}(__s,value);\n`);
              });
              uniqueNames.add(uniqueName);
            }
          },
          '}\n'
        );
        const propValue = `\${value['${this.#uniqueNamePropertyName}']}`;
        const formattedUniqueNames = new Array<string>();
        for (const uniqueName of uniqueNames) {
          formattedUniqueNames.push(`\\t- ${uniqueName}\\n`);
        }
        const msg =
          `Failed to encode: Received invalid value on "${
            this.#uniqueNamePropertyName
          }" property. ` +
          `We got "${propValue}" value, but this function was expecting to receive one of the following:\\n` +
          `${formattedUniqueNames.join('')}\\n\\n` +
          'Possible cause is that maybe this type simply does not extend this trait, and somehow ' +
          'the type-checking prevented you from calling this function wrongly.';
        this.write(`throw new Error(\`${msg}\`);\n`);
      },
      '}\n'
    );
  }
  #compareFunctionNameAndDefinitionFromResolvedType(exp: ResolvedType) {
    const isExternalRequirement = 'fileGenerator' in exp;
    const definition = this.#resolvedTypeExpressionToDefinition(exp);
    const fileGenerator = isExternalRequirement ? exp.fileGenerator : this;
    let compareFunctionName = getCompareFunctionName(definition);
    if (isExternalRequirement) {
      compareFunctionName = this.#import({
        ...exp,
        identifier: compareFunctionName
      });
    }
    return {
      fileGenerator,
      definition,
      compareFunctionName
    };
  }
  #generateTraitCompareFunction(
    trait: INodeTraitDefinition,
    exps: ResolvedType[]
  ) {
    const args = [`__a: ${getTypeName(trait)}`, `__b: ${getTypeName(trait)}`];
    this.write(
      `export function ${getCompareFunctionName(trait)}(${args.join(
        ', '
      )}) {\n`,
      () => {
        const [firstExp] = exps;
        if (exps.length === 1) {
          if (typeof firstExp === 'undefined') {
            throw new Exception(
              'firstExp was undefined, but `exps` length was 1'
            );
          }
          this.write(
            `return ${
              this.#compareFunctionNameAndDefinitionFromResolvedType(firstExp)
                .compareFunctionName
            }(__a, __b);\n`
          );
          return;
        }
        this.write(
          `switch(__a.${this.#uniqueNamePropertyName}) {\n`,
          () => {
            for (const exp of exps) {
              const { fileGenerator, compareFunctionName, definition } =
                this.#compareFunctionNameAndDefinitionFromResolvedType(exp);
              const typeStringifiedName =
                fileGenerator.#getTypeDefinitionOrCallDefinitionNamePropertyValue(
                  definition
                );
              this.write(`case '${typeStringifiedName}':\n`);
              this.indentBlock(() => {
                this.write(
                  `if(__b.${
                    this.#uniqueNamePropertyName
                  } !== "${typeStringifiedName}") return false;\n`
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
    exps: ResolvedType[]
  ) {
    const nodes = exps.map((exp) =>
      this.#resolvedTypeExpressionToDefinition(exp)
    );
    this.#import({
      target: 'outDir',
      path: '__types__',
      identifier: 'IDeserializer'
    });
    this.write(
      `export function ${getDecodeFunctionName(trait)}(__d: IDeserializer) {\n`,
      () => {
        this.write('const __id = __d.readInt32();\n');
        this.write('__d.rewind(4);\n');
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
                this.#import({
                  ...exp,
                  identifier: decodeFunctionName
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
        case GenericName.Boolean:
          this.write(
            `${serializerVarName}.writeUint8(${value} === true ? 1 : 0);\n`
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
          const itemVarName = `__item${depth}`;
          const lengthVarName = `__l${depth}`;
          this.write(`const ${lengthVarName} = ${value}.length;\n`);
          this.write(`${serializerVarName}.writeUint32(${lengthVarName});\n`);
          this.write(
            `for(const ${itemVarName} of ${value}) {\n`,
            () => {
              depth = this.#generateEncodeTypeExpression(
                resolved.expression,
                itemVarName,
                depth + 1
              );
            },
            '}\n'
          );
          break;
        }
        case 'set': {
          const valueVarName = `__v${depth}`;
          const lengthVarName = `__l${depth}`;
          this.write(`const ${lengthVarName} = ${value}.size;\n`);
          this.write(`${serializerVarName}.writeUint32(${lengthVarName});\n`);
          this.write(
            `for(const ${valueVarName} of ${value}) {\n`,
            () => {
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
        case 'map': {
          const k = `__k${depth}`;
          const v = `__v${depth}`;
          this.write(`__s.writeUint32(${value}.size);\n`);
          this.write(
            `for(const [${k},${v}] of ${value}) {\n`,
            () => {
              depth = this.#generateEncodeTypeExpression(
                resolved.key.expression,
                k,
                depth + 1
              );
              depth = this.#generateEncodeTypeExpression(
                resolved.value.expression,
                v,
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
            const valueVarName = `__t${depth}`;
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
        case 'bigint':
          this.write(
            `${serializerVarName}.writeSignedBigInt(${value}, ${JSBI.toNumber(
              JSBI.BigInt(resolved.bits.value)
            )});\n`
          );
          depth++;
          break;
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
        const encodeFunctionName = this.#import({
          ...resolved,
          identifier: getEncodeFunctionName(node)
        });
        this.write(`${encodeFunctionName}(${serializerVarName},${value});\n`);
      } else {
        const encodeFunctionName = this.#import({
          identifier: getEncodeFunctionName(type),
          fileGenerator: resolved.fileGenerator
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
        case GenericName.Boolean:
          this.write(`${value} = __d.readUint8() === 1;\n`);
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
        case 'bigint':
          this.write(
            `${value} = __d.readSignedBigInt(${resolved.bits.value});\n`
          );
          break;
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
                typeExpression
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
        case 'set': {
          const i = `__i${depth}`;
          const lengthVarName = `__l${depth}`;
          const outVarName = `__o${depth}`;
          const tmpVarName = `__tmp${depth}`;
          this.write(
            `let ${tmpVarName}: ${this.#resolveTypeExpressionToString({
              typeExpression: resolved.expression,
              readOnly: false
            })};\n`
          );
          this.write(`const ${lengthVarName} = __d.readUint32();\n`);
          this.write(
            `const ${outVarName} = new Set<${this.#resolveTypeExpressionToString(
              { typeExpression: resolved.expression, readOnly: false }
            )}>();\n`
          );
          this.write(`${value} = ${outVarName};\n`);
          this.write(
            `for(let ${i} = 0; ${i} < ${lengthVarName}; ${i}++) {\n`,
            () => {
              depth = this.#generateDecodeTypeExpression(
                resolved.expression,
                tmpVarName,
                depth + 1
              );
              this.write(`${outVarName}.add(${tmpVarName});\n`);
            },
            '}\n'
          );
          break;
        }
        case 'vector': {
          const i = `__i${depth}`;
          const lengthVarName = `__l${depth}`;
          const outVarName = `__o${depth}`;
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
        case 'map': {
          const i = `__i${depth}`;
          const lengthVarName = `__l${depth}`;
          const outVarName = `__o${depth}`;
          this.write(`const ${lengthVarName} = __d.readUint32();\n`);
          const keyTypeName = this.#resolveTypeExpressionToString({
            typeExpression: resolved.key.expression,
            readOnly: false
          });
          const valueTypeName = this.#resolveTypeExpressionToString({
            typeExpression: resolved.value.expression,
            readOnly: false
          });
          this.write(
            `const ${outVarName} = new Map<${keyTypeName}, ${valueTypeName}>();\n`
          );
          this.write(`${value} = ${outVarName};\n`);
          const keyVarName = `__k${depth}`;
          const valueVarName = `__v${depth}`;
          this.write(`let ${keyVarName}: ${keyTypeName};\n`);
          this.write(`let ${valueVarName}: ${valueTypeName};\n`);
          this.write(
            `for(let ${i} = 0; ${i} < ${lengthVarName}; ${i}++) {\n`,
            () => {
              depth = this.#generateDecodeTypeExpression(
                resolved.key.expression,
                keyVarName,
                depth + 1
              );
              depth = this.#generateDecodeTypeExpression(
                resolved.value.expression,
                valueVarName,
                depth + 1
              );
              this.write(
                `${outVarName}.set(${keyVarName}, ${valueVarName});\n`
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
    const decodeFunctionName = this.#import({
      identifier: getDecodeFunctionName(node),
      fileGenerator
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
  #generateDefinitionEncodeFunction(
    node: INodeCallDefinition | INodeTypeDefinition
  ) {
    const interfaceName = getTypeName(node);
    this.#import({
      target: 'outDir',
      path: '__types__',
      identifier: 'ISerializer'
    });
    const args = [
      '__s: ISerializer',
      `${node.parameters.length ? 'value' : '_'}: ${interfaceName}`
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
    this.#import({
      path: '__types__',
      target: 'outDir',
      identifier: 'IDeserializer'
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
              readOnly: false
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
              `${
                this.#uniqueNamePropertyName
              }: '${this.#getTypeDefinitionOrCallDefinitionNamePropertyValue(
                node
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
              `${
                this.#uniqueNamePropertyName
              }: '${this.#getTypeDefinitionOrCallDefinitionNamePropertyValue(
                node
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
      const resolvedType = this.#resolveTypeExpression(p.typeExpression);
      this.write(
        `${p.name.value}: ${this.#resolvedTypeToString({
          resolvedType,
          readOnly: true
        })};\n`
      );
    }
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
