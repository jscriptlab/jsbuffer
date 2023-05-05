import {
  INodeCallDefinition,
  INodeTraitDefinition,
  INodeTypeDefinition,
  NodeType,
} from '../src/ASTGenerator';
import { lowerFirst, upperFirst } from './stringUtilities';

export function getEncodeFunctionName(
  node: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  switch (node.type) {
    case NodeType.TraitDefinition:
      return `encode${upperFirst(node.name.value)}Trait`;
    case NodeType.TypeDefinition:
    case NodeType.CallDefinition:
      return `encode${upperFirst(node.name.value)}`;
  }
}

export function getDecodeFunctionName(
  node: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  switch (node.type) {
    case NodeType.TraitDefinition:
      return `decode${upperFirst(node.name.value)}Trait`;
    case NodeType.TypeDefinition:
    case NodeType.CallDefinition:
      return `decode${upperFirst(node.name.value)}`;
  }
}

export function getTypeDefinitionOrCallDefinitionNamePropertyValue(
  node: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition,
  file: string
) {
  return `${file.split('/').map(lowerFirst).join('.')}.${node.name.value}`;
}

export function getCompareFunctionName(
  node: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  return `${node.name.value}Compare`;
}

export function getTypeDefinitionOrCallDefinitionObjectCreator(
  value: INodeTypeDefinition | INodeCallDefinition
) {
  switch (value.type) {
    case NodeType.CallDefinition:
      return upperFirst(value.name.value);
    case NodeType.TypeDefinition:
      return value.name.value;
  }
}

export function getTypeName(
  value: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  return value.name.value;
}

export function getDefaultFunctionName(
  value: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  return `${value.name.value}Default`;
}

export function getTypeInputParamsInterfaceName(
  value: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  return `${value.name.value}InputParams`;
}
