import GenericName from './GenericName';

/**
 * Old-architecture metadata interfaces used by the Kotlin generator.
 *
 * These are intentionally kept structurally identical to the metadata shapes
 * the original Kotlin generator was written against. They are a subset of the
 * new unified {@link import('../../parser/types/metadata').Metadata} types
 * (which additionally carry `position`/`exported` fields that the Kotlin
 * generator ignores), so the new metadata can be consumed here after a cast.
 */

export interface IOutputFile {
  path: string;
  contents: string;
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

export interface IParamTypeMetadataInternalType {
  type: 'internalType';
  interfaceName: string;
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
