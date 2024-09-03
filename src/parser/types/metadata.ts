import { INodePosition } from '../../core/ASTGenerator';
import GenericName from './GenericName';

export interface IMetadataTypeDefinition {
  kind: 'type' | 'call';
  id: number;
  name: string;
  params: IMetadataParam[];
  globalName: string;
  exported: boolean;
  position: INodePosition;
}

export interface IMetadataTraitDefinition {
  kind: 'trait';
  name: string;
  globalName: string;
  exported: boolean;
  nodes: MetadataParamType[];
  position: INodePosition;
}

export type Metadata = IMetadataTypeDefinition | IMetadataTraitDefinition;

export interface IMetadataParam {
  name: string;
  type: MetadataParamType;
  position: INodePosition;
}

export type MetadataParamTypeTemplate =
  | {
      type: 'template';
      template: 'vector' | 'set' | 'optional';
      value: MetadataParamType;
      position: INodePosition;
    }
  | {
      type: 'template';
      template: 'tuple';
      args: MetadataParamType[];
      position: INodePosition;
    }
  | {
      type: 'template';
      template: 'map';
      key: MetadataParamType;
      value: MetadataParamType;
      position: INodePosition;
    }
  | {
      type: 'template';
      template: 'bigint';
      bits: string;
      position: INodePosition;
    };

export interface IMetadataParamTypeGeneric {
  type: 'generic';
  value: GenericName;
  position: INodePosition;
}

export interface IMetadataInternalTypeParamTypeDefinition {
  type: 'internalType';
  interfaceName: string;
  position: INodePosition;
}

export interface IMetadataExternalTypeParamTypeDefinition {
  type: 'externalType';
  name: string;
  relativePath: string;
  position: INodePosition;
}

export type MetadataParamTypeDefinition =
  | IMetadataInternalTypeParamTypeDefinition
  | IMetadataExternalTypeParamTypeDefinition;

export type MetadataParamType =
  | IMetadataParamTypeGeneric
  | MetadataParamTypeTemplate
  | MetadataParamTypeDefinition
  | {
      type: 'externalModuleType';
      name: string;
      importPath: string;
      position: INodePosition;
    };
