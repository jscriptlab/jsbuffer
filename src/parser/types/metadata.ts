import GenericName from './GenericName';

export interface IMetadataTypeDefinition {
  kind: 'type' | 'call';
  id: number;
  name: string;
  params: IMetadataParam[];
  globalName: string;
}

export type Metadata =
  | IMetadataTypeDefinition
  | {
      kind: 'trait';
      name: string;
      nodes: MetadataParamType[];
    };

export interface IMetadataParam {
  name: string;
  type: MetadataParamType;
}

export type MetadataParamTypeTemplate =
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
    };

export interface IMetadataParamTypeGeneric {
  type: 'generic';
  value: GenericName;
}

export type MetadataParamTypeDefinition =
  | {
      type: 'internalType';
      interfaceName: string;
    }
  | {
      type: 'externalType';
      name: string;
      relativePath: string;
    };

export type MetadataParamType =
  | IMetadataParamTypeGeneric
  | MetadataParamTypeTemplate
  | MetadataParamTypeDefinition
  | {
      type: 'externalModuleType';
      name: string;
      importPath: string;
    };
