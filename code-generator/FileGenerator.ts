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
  public constructor(public readonly node: ResolvedType) {
    super();
  }
}

export class UnsupportedGenericExpression extends Exception {
  public constructor(public readonly node: ResolvedType) {
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
  path: string;
  contents: string | Uint8Array;
}

export interface IOutputFileImport {
  path: string;
  identifiers: Set<IdentifierImport>;
}

export type IdentifierImport =
  | string
  | {
      alias: string;
      identifier: string;
    };

export interface ITypeScriptConfiguration {
  include: string[];
  compilerOptions: Record<string, unknown>;
  extends: string;
}

export interface IFileGeneratorOptions {
  indentationSize: number;
  textDecoder: ITextDecoder;
  typeScriptConfiguration?: Partial<ITypeScriptConfiguration> | null;
  textEncoder: ITextEncoder;
  root: FileGenerator | null;
  uniqueNamePropertyName?: string | null;
  externalModule?: {} | null;
  compilerOptions: ICompilerOptions | null;
}

export interface ICompilerOptions {
  rootDir: string;
  outDir: string;
}

export type ResolvedType =
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
    };

export type InputRequirement =
  | {
      fileGenerator: FileGenerator;
      identifier: string;
    }
  | {
      identifier: string;
      path: string;
      target: 'outDir';
    };

export type Requirement =
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
      fileGenerator: FileGenerator;
    };

export interface ITrait {
  name: string;
  nodes: ResolvedType[];
}

export class ExceptionInternalError extends Exception {}

export interface IConfiguration {
  mainFile: string;
  outDir: string;
}

export interface IExternalModule {
  configFile: string;
  configuration: IConfiguration;
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
  readonly #originalImports = new Map<
    FileGenerator,
    {
      identifiers: Set<string>;
      fileGenerator: FileGenerator;
    }
  >();
  readonly #fileGenerators = new Map<string, FileGenerator>();
  readonly #parent;
  readonly #traits = new Map<string, ITrait>();
  readonly #uniqueNamePropertyName;
  readonly #externalModule;
  #offset = 0;
  #nodes: Array<ASTGeneratorOutputNode> = [];
  public constructor(
    file: IFile,
    {
      externalModule,
      textDecoder,
      textEncoder,
      compilerOptions,
      uniqueNamePropertyName = null,
      indentationSize,
      root: parent = null,
      typeScriptConfiguration,
    }: IFileGeneratorOptions
  ) {
    super(undefined, {
      indentationSize,
    });
    this.#compilerOptions = compilerOptions;
    this.#externalModule = externalModule ?? null;
    this.#file = file;
    this.#parent = parent;
    this.#uniqueNamePropertyName = uniqueNamePropertyName ?? '_name';
    this.#indentationSize = indentationSize;
    this.#textEncoder = textEncoder;
    this.#typeScriptConfiguration = typeScriptConfiguration;
    this.#textDecoder = textDecoder;
  }
  public async generate() {
    await this.#preprocess();
    this.#fillTraits();
    const files = await this.#generateFiles();
    for (const f of files) {
      const resolvedFilePath = path.resolve(
        this.#compilerOptionsOrFail().outDir,
        f.path
      );
      await fs.promises.mkdir(path.dirname(resolvedFilePath), {
        recursive: true,
      });
      await fs.promises.writeFile(resolvedFilePath, f.contents);
    }
  }
  async #preprocess() {
    const tokenizer = new Tokenizer({
      textDecoder: this.#textDecoder,
      textEncoder: this.#textEncoder,
      contents: await fs.promises.readFile(this.#file.path),
    });
    this.#nodes = new ASTGenerator(tokenizer.tokenize().tokens()).generate();
    for (const node of this.#nodes) {
      await this.#updateOriginalImportsAndSetDefinitions(node);
    }
    for (const node of this.#nodes) {
      this.#updateImportsBasedOnUsage(node);
    }
    for (const node of this.#nodes) {
      await this.#preprocessNode(node);
    }
  }
  #updateImportsBasedOnUsage(node: ASTGeneratorOutputNode) {
    switch (node.type) {
      case NodeType.ExportStatement:
        this.#updateImportsBasedOnUsage(node.value);
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

    const compilerOptions = this.#compilerOptionsOrFail();

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
        configFile,
        configuration: parsedConfig,
      };
      // inputFile = path.resolve(
      //   path.resolve(path.dirname(configFile), externalModule.outDir),
      //   originalSourceFile.replace(
      //     new RegExp(`^${path.dirname(configFile)}/?`),
      //     ''
      //   )
      // );
    } else {
      externalModule = null;
      inputFile = path.resolve(path.dirname(this.#file.path), modulePath);
    }

    // let fileExists = false;

    // /**
    //  * make sure input file is accessible and readable
    //  */
    // try {
    //   await fs.promises.access(inputFile, fs.constants.R_OK);
    //   fileExists = true;
    // } catch (reason) {
    //   fileExists = false;
    // }

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
      externalModule,
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
        let fileGenerator = root.#fileGenerators.get(inputFile);
        if (!fileGenerator) {
          fileGenerator = new FileGenerator(
            {
              path: inputFile,
            },
            {
              root,
              externalModule,
              uniqueNamePropertyName: root.#uniqueNamePropertyName,
              indentationSize: this.#indentationSize,
              textDecoder: this.#textDecoder,
              textEncoder: this.#textEncoder,
              compilerOptions: null,
            }
          );
          root.#fileGenerators.set(inputFile, fileGenerator);
        }
        let originalImport = this.#originalImports.get(fileGenerator);
        if (!originalImport) {
          originalImport = {
            identifiers: new Set(),
            fileGenerator,
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
  async #generateFiles() {
    const files = new Array<IOutputFile>();
    for (const f of [...this.#fileGenerators.values(), this]) {
      if (f.#externalModule !== null) {
        continue;
      }
      f.#generateFinalCode();
      let contents = f.value();
      await f.#generateRequirementsCode();
      contents = `${f.value()}${contents}`;
      files.push({
        path: `${f.#removeRootDirOrFail(f.#file.path)}.ts`,
        contents,
      });
    }
    files.push(this.#generateTypesFile());

    if (this.#typeScriptConfiguration) {
      let config: Partial<ITypeScriptConfiguration> = {
        compilerOptions: {
          noUncheckedIndexedAccess: false,
        },
        include: files.map((f) => f.path).filter((t) => t.endsWith('.ts')),
      };
      const compilerOptions = this.#typeScriptConfiguration.compilerOptions;
      if (compilerOptions) {
        config = {
          ...config,
          compilerOptions: {
            ...compilerOptions,
            ...config.compilerOptions,
          },
        };
      }
      files.push(this.#generateTypeScriptConfigurationFile(config));
    }
    // files.push(this.#generateBuildConfigFile());
    return files;
  }
  // #generateBuildConfigFile() {
  //   this.#serializer.rewind();
  //   const compilerOptions = this.#compilerOptionsOrFail();
  //   const jsbufferConfigFileName = 'jsbufferconfig.json';
  //   let mainFile = path.basename(this.#file.path);
  //   if (mainFile.startsWith('.')) {
  //     mainFile = `./${mainFile}`;
  //   }
  //   const config = schemaConfigVersion1({
  //     outDir: path.relative(
  //       path.resolve(compilerOptions.rootDir, jsbufferConfigFileName),
  //       compilerOptions.outDir
  //     ),
  //     mainFile,
  //   });
  //   encodeSchemaConfigTrait(this.#serializer, config);
  //   return {
  //     path: jsbufferConfigFileName,
  //     contents: this.#serializer.view(),
  //   };
  // }
  #removeRootDirOrFail(value: string) {
    const compilerOptions = this.#compilerOptionsOrFail();
    const rootDirRegExp = this.#rootDirRegularExpression();
    if (!rootDirRegExp.test(value)) {
      throw new Exception(
        `Path does not include root dir at the beginning: ${compilerOptions.rootDir}`
      );
    }
    return value.replace(rootDirRegExp, '');
  }
  // #maybeRemoveRootDir(value: string) {
  //   const rootDirRegExp = this.#rootDirRegularExpression();
  //   return value.replace(rootDirRegExp, '');
  // }
  #rootDirRegularExpression() {
    const compilerOptions = this.#compilerOptionsOrFail();
    return new RegExp(`^${compilerOptions.rootDir}/?`);
  }
  #import(req: InputRequirement): string {
    const id = req.identifier;
    let fullPath: string;
    let fileGenerator: FileGenerator | null;
    if ('fileGenerator' in req) {
      /**
       * if we're trying to import something from the current @type {FileGenerator}
       * we simply return the desired identifier
       */
      if (this === req.fileGenerator) {
        return id;
      }
      fileGenerator = req.fileGenerator;
      fullPath = req.fileGenerator.#file.path;
    } else {
      fileGenerator = null;
      fullPath = req.path;
    }
    const existingImport = Array.from(this.#imports).find(
      (i) => i.path === fullPath && i.identifier === id
    );
    if (existingImport) {
      return id;
    }
    let resolvedRequirement: Requirement;
    if (fileGenerator) {
      resolvedRequirement = {
        path: fullPath,
        identifier: id,
        fileGenerator,
      };
    } else {
      resolvedRequirement = {
        target: 'outDir',
        path: fullPath,
        identifier: id,
      };
    }
    this.#imports.add(resolvedRequirement);
    this.#identifiers.set(id, null);
    return id;
  }
  async #generateRequirementsCode() {
    for (const i of this.#imports) {
      let finalPath: string;
      if ('target' in i) {
        finalPath = path.relative(
          path.dirname(this.#removeRootDirOrFail(this.#file.path)),
          i.path
        );
      } else {
        const { externalModule, inputFile } =
          await this.#resolveModulePathToAbsolutePath(i.path);
        // let finalInputFile = inputFile;
        if (externalModule) {
          const externalSchemaRootFolder = path.dirname(
            externalModule.configFile
          );
          const externalSchemaOutDir = path.resolve(
            externalSchemaRootFolder,
            externalModule.configuration.outDir
          );
          const finalInputFile = path.resolve(
            externalSchemaOutDir,
            inputFile.replace(new RegExp(`^${externalSchemaRootFolder}/?`), '')
          );
          finalPath = path.relative(
            path.dirname(this.#outFileAbsolutePath()),
            finalInputFile
          );
        } else {
          finalPath = path.relative(path.dirname(this.#file.path), inputFile);
        }
      }
      if (!finalPath.startsWith('.')) {
        finalPath = `./${finalPath}`;
      }
      this.write(`import { ${i.identifier}`);
      if (i.alias) {
        this.append(` as ${i.alias}`);
      }
      this.append(' } from "');
      this.append(finalPath);
      this.append('";\n');
    }
  }
  #outFileAbsolutePath() {
    return path.resolve(
      this.#compilerOptionsOrFail().outDir,
      this.#removeRootDirOrFail(this.#file.path)
    );
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
    const stringify = new JavaScriptObjectStringify();
    const config = {
      ...additionalTypeScriptConfiguration,
      ...(this.#typeScriptConfiguration ? this.#typeScriptConfiguration : {}),
    };
    stringify.stringify(config);
    return {
      path: 'tsconfig.json',
      contents: stringify.value(),
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
      path: '__types__.ts',
      contents: this.value(),
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
  async #preprocessNode(node: ASTGeneratorOutputNode) {
    switch (node.type) {
      case NodeType.CallDefinition:
      case NodeType.TypeDefinition:
      case NodeType.TraitDefinition:
        break;
      case NodeType.ExportStatement:
        this.#export(node);
        await this.#preprocessNode(node.value);
        break;
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
        /**
         * preprocess file generator
         */
        await fileGenerator.#preprocess();
        break;
      }
      default:
        throw new ASTNodePreprocessingFailure(node);
    }
  }
  #compilerOptionsOrFail() {
    let compilerOptions = this.#compilerOptions;

    if (!compilerOptions) {
      compilerOptions = this.#root().#compilerOptions;
    }

    if (!compilerOptions) {
      throw new Exception('Failed to find compiler options');
    }

    return compilerOptions;
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
            this.append('l1.every(');
            (() => {
              this.append('([k1,v1],i) => (');
              (() => {
                depth = this.#generateComparisonExpression(
                  resolved.key.expression,
                  'k1',
                  'l2[i][0]',
                  depth + 1
                );
                this.append(' && ');
                depth = this.#generateComparisonExpression(
                  resolved.value.expression,
                  'v1',
                  'l2[i][1]',
                  depth + 1
                );
              })();
              this.append(')');
            })();
            this.append(')');
          })();
          this.append(`))(Array.from(${v1}),Array.from(${v2}))`);
          break;
        }
        case 'vector':
          this.append(
            [
              `${v1}.length === ${v2}.length`,
              `${v1}.every((__i,index) => (`,
            ].join(' && ')
          );
          depth = this.#generateComparisonExpression(
            resolved.expression,
            '__i',
            `${v2}[index]`,
            depth + 1
          );
          this.append('))');
          break;
        case 'set': {
          const aVarName = `__a${depth}`;
          const bVarName = `__b${depth}`;
          const itemVarName = `__it${depth}`;
          const itemIndexVarName = `__i${depth}`;
          this.append('(');
          (() => {
            this.append(`(${aVarName},${bVarName}) => (`);
            (() => {
              this.append(
                `${aVarName}.every((${itemVarName},${itemIndexVarName}) => (`
              );
              (() => {
                depth = this.#generateComparisonExpression(
                  resolved.expression,
                  itemVarName,
                  `${bVarName}[${itemIndexVarName}]`,
                  depth + 1
                );
              })();
              this.append('))');
            })();
            this.append(')');
          })();
          this.append(`)(Array.from(${v1}),Array.from(${v2}))`);
          break;
        }
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
        case 'map':
          return `new Map<${this.#resolveTypeExpressionToString({
            typeExpression: resolved.key.expression,
            readOnly: false,
          })}, ${this.#resolveTypeExpressionToString({
            typeExpression: resolved.value.expression,
            readOnly: false,
          })}>()`;
        case 'set':
          return `new Set<${this.#resolveTypeExpressionToString({
            typeExpression: resolved.expression,
            readOnly: false,
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
            this.#import(node);
          }
        }
        this.write(
          `export type ${node.name.value} = ${trait.nodes
            .map((n) =>
              this.#resolvedTypeToString({
                resolvedType: n,
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
    return this.#resolvedTypeToString({
      resolvedType: this.#resolveTypeExpression(typeExpression),
      readOnly,
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
            typeExpression: resolved.expression,
          })} | null`;
        case 'map': {
          const k = this.#resolveTypeExpressionToString({
            ...options,
            typeExpression: resolved.key.expression,
          });
          const v = this.#resolveTypeExpressionToString({
            ...options,
            typeExpression: resolved.value.expression,
          });
          return `${readOnly ? 'ReadonlyMap' : 'Map'}<${k}, ${v}>`;
        }
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
        case 'set':
          return `${
            readOnly ? 'ReadonlySet' : 'Set'
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
          case 'map': {
            const [key, value] = typeExpression.templateArguments;
            if (typeof key === 'undefined' || typeof value === 'undefined') {
              throw new InvalidTemplateArgumentCount(typeExpression);
            }
            return {
              template: 'map',
              key: {
                resolved: this.#resolveTypeExpression(key),
                expression: key,
              },
              value: {
                resolved: this.#resolveTypeExpression(value),
                expression: value,
              },
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
              type: this.#resolveTypeExpression(setOrVectorType),
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
        identifier: 'IRequest',
      });
      interfaceExtends = `extends IRequest<${this.#resolvedTypeToString({
        resolvedType: resolvedReturnType,
        readOnly: true,
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
      this.#removeRootDirOrFail(this.#file.path)
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
    exps: ResolvedType[]
  ) {
    this.#import({
      target: 'outDir',
      path: '__types__',
      identifier: 'ISerializer',
    });
    this.write(
      `export function ${getEncodeFunctionName(
        trait
      )}(__s: ISerializer,value: ${getTypeName(trait)}) {\n`,
      () => {
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
              if (isExternalRequirement)
                this.#import({
                  ...exp,
                  identifier: encodeFunctionName,
                });
              this.write(
                `case '${fileGenerator.#getTypeDefinitionOrCallDefinitionNamePropertyValue(
                  def
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
    exps: ResolvedType[]
  ) {
    const args = [`__a: ${getTypeName(trait)}`, `__b: ${getTypeName(trait)}`];
    this.write(
      `export function ${getCompareFunctionName(trait)}(${args.join(
        ', '
      )}) {\n`,
      () => {
        this.write(
          `switch(__a.${this.#uniqueNamePropertyName}) {\n`,
          () => {
            for (const exp of exps) {
              const isExternalRequirement = 'fileGenerator' in exp;
              const fileGenerator = isExternalRequirement
                ? exp.fileGenerator
                : this;
              const def = this.#resolvedTypeExpressionToDefinition(exp);
              let compareFunctionName = getCompareFunctionName(def);
              if (isExternalRequirement) {
                compareFunctionName = this.#import({
                  ...exp,
                  identifier: compareFunctionName,
                });
              }
              const typeStringifiedName =
                fileGenerator.#getTypeDefinitionOrCallDefinitionNamePropertyValue(
                  def
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
                this.#import({
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
          identifier: getEncodeFunctionName(node),
        });
        this.write(`${encodeFunctionName}(${serializerVarName},${value});\n`);
      } else {
        const encodeFunctionName = this.#import({
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
        case 'set': {
          const i = `__i${depth}`;
          const lengthVarName = `__l${depth}`;
          const outVarName = `__o${depth}`;
          const tmpVarName = `__tmp${depth}`;
          this.write(
            `let ${tmpVarName}: ${this.#resolveTypeExpressionToString({
              typeExpression: resolved.expression,
              readOnly: false,
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
            readOnly: false,
          });
          const valueTypeName = this.#resolveTypeExpressionToString({
            typeExpression: resolved.value.expression,
            readOnly: false,
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
    const values = [`${this.#file.path}/${node.name.value}`];
    if (node.type === NodeType.CallDefinition) {
      const resolvedTypeExpression = this.#resolveTypeExpression(
        node.returnType
      );
      values.unshift(
        // TODO: get full path of the expression and add it to the final unique header
        `${this.#resolvedTypeToString({
          resolvedType: resolvedTypeExpression,
          readOnly: true,
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
                typeExpression: p.typeExpression,
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
    this.#import({
      path: '__types__',
      target: 'outDir',
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
          readOnly: true,
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
      fileGenerator: this,
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
