import {
  INodeCallDefinition,
  INodeLiteralNumber,
  INodeTraitDefinition,
  INodeTypeDefinition,
  NodeTypeExpression
} from '../src/ASTGenerator';
import { ITextDecoder, ITextEncoder } from '../src/Tokenizer';
import FileGenerator from './FileGenerator';
import GenericName from './GenericName';

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
  externalModule?: boolean | null;
  compilerOptions: ICompilerOptions;
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
    }
  | {
      template: 'bigint';
      bits: INodeLiteralNumber;
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
    }
  | {
      identifier: string;
      path: string;
      wildcard: boolean;
      isDefaultImport: boolean;
      target: 'nodeModule';
    };

export interface INodeModuleRequirement {
  target: 'nodeModule';
  path: string;
  alias?: string;
  wildcard: boolean;
  isDefaultImport: boolean;
  identifier: string;
}

export interface IOutDirRequirement {
  target: 'outDir';
  path: string;
  alias?: string;
  identifier: string;
}

export interface IExternalTypeRequirement {
  path: string;
  alias?: string;
  identifier: string;
  fileGenerator: FileGenerator;
}

export type Requirement =
  | INodeModuleRequirement
  | IOutDirRequirement
  | IExternalTypeRequirement;

export interface ITrait {
  name: string;
  nodes: ResolvedType[];
}

export interface IConfiguration {
  mainFile: string;
  outDir: string;
}

export interface IExternalModule {
  configFile: string;
  nodeModulesFolderPath: string;
  configuration: IConfiguration;
}

export interface IMetadataType {
  kind: 'type';
  id: number;
  name: string;
  params: IParamMetadata[];
  traits: TypeExpressionMetadata[];
  globalName: string;
}

export interface IMetadataCall {
  kind: 'call';
  returnType: TypeExpressionMetadata;
  id: number;
  name: string;
  params: IParamMetadata[];
  traits: TypeExpressionMetadata[];
  globalName: string;
}

export interface ITraitMetadata {
  kind: 'trait';
  name: string;
  globalName: string;
  nodes: TypeExpressionMetadata[];
}

export type Metadata = IMetadataCall | IMetadataType | ITraitMetadata;

export interface IMetadataFileContents {
  __imports: MetadataImport[];
  __all: Metadata[];
}

export type MetadataImport = {
  relativePath: string;
};

export interface IParamMetadata {
  name: string;
  type: TypeExpressionMetadata;
}

export interface IParamTypeMetadataExternalType {
  type: 'externalType';
  name: string;
  relativePath: string;
}

export interface IParamTypeMetadataGeneric {
  type: 'generic';
  value: GenericName;
}

export type TypeExpressionMetadata =
  | IParamTypeMetadataGeneric
  | {
      type: 'template';
      template: 'vector' | 'set' | 'optional';
      value: TypeExpressionMetadata;
    }
  | {
      type: 'template';
      template: 'tuple';
      args: TypeExpressionMetadata[];
    }
  | {
      type: 'template';
      template: 'map';
      key: TypeExpressionMetadata;
      value: TypeExpressionMetadata;
    }
  | {
      type: 'template';
      template: 'bigint';
      bits: string;
    }
  | IParamTypeMetadataInternalType
  | IParamTypeMetadataExternalType
  | {
      type: 'externalModuleType';
      name: string;
      importPath: string;
    };

export interface IParamTypeMetadataInternalType {
  type: 'internalType';
  interfaceName: string;
}
