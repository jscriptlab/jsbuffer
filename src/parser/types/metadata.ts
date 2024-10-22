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

export interface IMetadataParamTypeTupleTemplate {
  type: 'template';
  template: 'tuple';
  args: MetadataParamType[];
  position: INodePosition;
}

export interface IMetadataParamTypeTemplateOptional {
  type: 'template';
  template: 'optional';
  value: MetadataParamType;
  position: INodePosition;
}

export type MetadataParamTypeTemplate =
  | IMetadataParamTypeTemplateOptional
  | {
      type: 'template';
      template: 'vector' | 'set';
      value: MetadataParamType;
      position: INodePosition;
    }
  | IMetadataParamTypeTupleTemplate
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
  // TODO: Rename this to `internalReference`
  type: 'internalType';
  interfaceName: string;
  position: INodePosition;
}

export interface IMetadataExternalTypeParamTypeDefinition {
  // TODO: Rename this to `externalReference`
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
