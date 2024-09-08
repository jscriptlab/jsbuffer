import Exception from '../../../exception/Exception';
import { Metadata, MetadataParamType } from '../../parser/types/metadata';
import snakeCase from '../../utilities/string/snakeCase';

export function getTuplePropertyName(tupleItemIndex: number) {
  return `item_${tupleItemIndex}`;
}

export function getTupleStructName(parent: Metadata) {
  return `${metadataGlobalNameToNamespace(parent)}_tuple_t`;
}

export function getMetadataParamTypeName(param: MetadataParamType): string {
  switch (param.type) {
    case 'template':
      switch (param.template) {
        case 'optional':
          return `${getMetadataParamTypeName(param.value)}_optional`;
        default:
          throw new Exception(`Unknown template type ${param.template}`);
      }
    case 'generic':
      return param.value;
    case 'internalType':
      return param.interfaceName;
    case 'externalType':
      return param.name;
    case 'externalModuleType':
      throw new Exception('External module type is not supported');
  }
}

export function getOptionalStructName(
  parent: Metadata,
  metadataParamType: MetadataParamType
) {
  return `${getMetadataPrefix(parent)}_${getMetadataParamTypeName(
    metadataParamType
  ).toLowerCase()}_optional_t`;
}

export function getOptionalStructTypeReference(
  parent: Metadata,
  metadataParamType: MetadataParamType
) {
  return `struct ${getOptionalStructName(parent, metadataParamType)}`;
}

export function getTupleStructTypeReference(parent: Metadata) {
  return `struct ${getTupleStructName(parent)}`;
}

export function getTraitUnionNodePropertyName(traitNode: Metadata) {
  return snakeCase(traitNode.globalName);
}

// Converts jsb_xx_t to xx
export function jsbTypeToCodecSuffix(value: string) {
  return value.replace(/^jsb_/, '').replace(/_t$/, '');
}

export function metadataToRelativePath(metadata: Metadata) {
  const transformedPath = metadata.globalName
    .split('.')
    .map((slice) => snakeCase(slice))
    .join('/');
  switch (metadata.kind) {
    case 'call':
    case 'type':
      return transformedPath;
    case 'trait':
      return `${transformedPath}_trait`;
  }
}

export function getHeaderGuard(value: string) {
  if (/^[0-9]/.test(value)) {
    throw new Exception('Header guard cannot start with a number');
  }
  return value
    .toUpperCase()
    .replace(/\//g, '_')
    .replace(/\./g, '_')
    .replace(/[^_A-Z0-9]/g, '_');
}

export function metadataGlobalNameToNamespace(
  metadata: Metadata,
  limit: number | null = null
) {
  let slices = metadata.globalName.split('.');
  if (limit !== null) {
    slices = slices.slice(0, limit);
  }

  return snakeCase(slices.join('_'));
}

export function getMetadataCompleteTypeReference(metadata: Metadata) {
  return `struct ${getMetadataPrefix(metadata)}_t`;
}

export function getMetadataPrefix(metadata: Metadata) {
  switch (metadata.kind) {
    case 'type':
    case 'call':
      return `${metadataGlobalNameToNamespace(metadata)}`;
    case 'trait':
      return `${metadataGlobalNameToNamespace(metadata)}_trait`;
  }
}

export function pointer(key: string) {
  if (key.startsWith('*')) {
    return key.substring(1);
  } else {
    return `&${key}`;
  }
}
