import {
  INodeCallDefinition,
  INodeLiteralNumber,
  INodeTraitDefinition,
  INodeTypeDefinition,
  NodeTypeExpression,
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
  /**
   * sort properties based on their names
   */
  sortProperties?: boolean;
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
      fileGenerator: FileGenerator;
    };

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

export type Metadata =
  | {
      kind: 'type' | 'call';
      id: number;
      name: string;
      params: IMetadataParam[];
      globalName: string;
    }
  | {
      kind: 'trait';
      name: string;
      nodes: MetadataParamType[];
    };

export interface IMetadataParam {
  name: string;
  type: MetadataParamType;
}

export type MetadataParamType =
  | {
      type: 'generic';
      value: GenericName;
    }
  | {
      type: 'template';
      template: 'vector' | 'set' | 'optional';
      value: MetadataParamType;
    }
  | {
      type: 'template';
      template: 'tuple';
      args: MetadataParamType[];
    }
  | {
      type: 'template';
      template: 'map';
      key: MetadataParamType;
      value: MetadataParamType;
    }
  | {
      type: 'template';
      template: 'bigint';
      bits: string;
    }
  | {
      type: 'internalType';
      interfaceName: string;
    }
  | {
      type: 'externalType';
      name: string;
      relativePath: string;
    }
  | {
      type: 'externalModuleType';
      name: string;
      importPath: string;
    };
