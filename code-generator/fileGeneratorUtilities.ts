import JSBI from 'jsbi';
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
  switch (node.type) {
    case NodeType.CallDefinition:
    case NodeType.TypeDefinition:
      return `compare${upperFirst(node.name.value)}`;
    case NodeType.TraitDefinition:
      return `compare${upperFirst(node.name.value)}Trait`;
  }
}

export function getUpdateFunctionName(
  node: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  return `update${upperFirst(node.name.value)}`;
}

export function integerRangeFromBits({
  bits,
  signed,
}: {
  bits: number | JSBI;
  signed: boolean;
}): [JSBI, JSBI] {
  const lastBitIndex = JSBI.BigInt(
    JSBI.subtract(
      typeof bits === 'number' ? JSBI.BigInt(bits) : bits,
      JSBI.BigInt(1)
    )
  );
  const two = JSBI.BigInt(2);
  const zero = JSBI.BigInt(0);
  const negativeTwo = JSBI.BigInt(-2);
  const one = JSBI.BigInt(1);
  const maxRange = JSBI.exponentiate(two, lastBitIndex);
  if (signed) {
    return [
      JSBI.exponentiate(negativeTwo, lastBitIndex),
      JSBI.subtract(maxRange, one),
    ];
  }
  return [zero, JSBI.subtract(JSBI.multiply(maxRange, two), one)];
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

export function getValidateDefinitionFunctionName(
  value: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  let out = `is${upperFirst(value.name.value)}`;
  switch (value.type) {
    case NodeType.TraitDefinition:
      out = `${out}Trait`;
      break;
  }
  return out;
}

export function getTypeName(
  value: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  return value.name.value;
}

export function getDefaultFunctionName(
  node: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  switch (node.type) {
    case NodeType.CallDefinition:
    case NodeType.TypeDefinition:
      return `default${upperFirst(node.name.value)}`;
    case NodeType.TraitDefinition:
      return `default${upperFirst(node.name.value)}Trait`;
  }
}

export function getTypeInputParamsInterfaceName(
  value: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  return `${value.name.value}InputParams`;
}
