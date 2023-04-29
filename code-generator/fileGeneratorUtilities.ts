import {
  INodeCallDefinition,
  INodeTypeDefinition,
  NodeType,
} from '../src/ASTGenerator';
import { lowerFirst, upperFirst } from './stringUtilities';

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
  return `${file.split('/').map(lowerFirst).join('.')}.${node.name.value}`;
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

export function getTypeDefinitionOrCallDefinitionInterfaceName(
  value: INodeTypeDefinition | INodeCallDefinition
) {
  return value.name.value;
}
