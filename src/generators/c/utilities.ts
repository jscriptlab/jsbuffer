import Exception from '../../../exception/Exception';
import {
  IMetadataParam,
  Metadata,
  MetadataParamType
} from '../../parser/types/metadata';
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

export class RegularExpressions {
  public static readonly literalTraceArgument = /^literal:/;
}

function isLiteralTraceArgument(arg: string) {
  return RegularExpressions.literalTraceArgument.test(arg);
}

export function JSB_TRACE(name: string, ...args: string[]) {
  if (typeof args[0] === 'string') {
    // Add a period to the end of the trace message if it doesn't have one
    if (!args[0].endsWith('.')) {
      args[0] = `${args[0]}.`;
    }
  }
  return `JSB_TRACE("${name}", ${args
    .map((arg) =>
      isLiteralTraceArgument(arg)
        ? arg.replace(RegularExpressions.literalTraceArgument, '')
        : `"${arg}"`
    )
    .join(', ')});\n`;
}

export function getTraitUnionName(metadata: Metadata) {
  return `${getMetadataPrefix(metadata)}_value_t`;
}

export function getTraitUnionCompleteTypeReference(metadata: Metadata) {
  return `union ${getTraitUnionName(metadata)}`;
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

export function getMetadataName(metadata: Metadata) {
  switch (metadata.kind) {
    case 'type':
    case 'call':
    case 'trait':
      return snakeCase(metadata.name);
  }
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

export function getInitOptionalParameterFunctionName(
  metadata: Metadata,
  param: IMetadataParam
) {
  return `${getMetadataPrefix(metadata)}_${param.name}_init`;
}

/**
 * If `key` is prefixed with a asterisk, it will be removed. Otherwise, it will be prefixed with an ampersand.
 *
 * **Example:**
 *
 * ```typescript
 * pointer('key') // Returns "&key"
 * pointer('*key') // Returns "key"
 * ```
 * @param key Key to be transformed into a pointer
 * @returns Returns a pointer to the `key`
 */
export function pointer(key: string) {
  if (key.startsWith('*')) {
    return key.substring(1);
  }
  return `&${key}`;
}

/**
 * If `key` is prefixed with an ampersand, it will be removed. Otherwise, it will be prefixed with an asterisk.
 * @param key Key to be dereferenced
 * @returns Returns a dereferenced key
 * @example dereference('key') // Returns "*key"
 * @example dereference('&key') // Returns "key"
 * @example dereference('*key') // Returns "*key"
 */
export function dereference(key: string) {
  if (key.startsWith('&')) {
    return key.substring(1);
  }
  /**
   * If it is already a pointer, then we don't need to do anything.
   * The prefix to be used with this function (prefixing `key` with an asterisk to determine a pointer, or an ampersand to determine a made pointer)
   * already does what we want, which is to get the actual value of `key`. So we just return *key if it starts with an asterisk.
   */
  if (key.startsWith('*')) {
    return key;
  }
  // If it has no * or &, then it means it is not a pointer, which is exactly what we want
  return `*${key}`;
}
