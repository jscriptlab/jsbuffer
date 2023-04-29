import { INodeCallDefinition, INodeTypeDefinition } from '../src/ASTGenerator';

function upperFirst(value: string) {
  return `${value[0]?.toUpperCase()}${value.substring(1)}`;
}

export function getTypeDefinitionOrCallEncoderFunctionName(
  node: INodeTypeDefinition | INodeCallDefinition
) {
  return `encode${upperFirst(node.name.value)}`;
}

export function getEncodeTraitFunctionName(name: string) {
  return `encode${upperFirst(name)}Trait`;
}

export function getDecodeTraitFunctionName(name: string) {
  return `decode${upperFirst(name)}Trait`;
}

export function getTypeDefinitionOrCallDecoderFunctionName(
  node: INodeTypeDefinition | INodeCallDefinition
) {
  return `decode${upperFirst(node.name.value)}`;
}

export function getTypeDefinitionOrCallDefinitionNamePropertyValue(
  node: INodeTypeDefinition | INodeCallDefinition,
  file: string
) {
  return `${file.toLocaleLowerCase().split('/').join('.')}.${node.name.value}`;
}

export function getTypeDefinitionOrCallDefinitionObjectCreator(
  value: INodeTypeDefinition | INodeCallDefinition
) {
  return `create${upperFirst(value.name.value)}`;
}

export function getTypeDefinitionOrCallDefinitionInterfaceName(
  value: INodeTypeDefinition | INodeCallDefinition
) {
  return value.name.value;
}
