import JSBI from 'jsbi';
import {
  INodeCallDefinition,
  INodeTraitDefinition,
  INodeTypeDefinition,
  NodeType
} from '../src/core/ASTGenerator';
import { camelCase, dashCase, upperFirst } from './stringUtilities';

export function getEncodeFunctionName(
  node: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  switch (node.type) {
    case NodeType.TraitDefinition:
      return `encode${transformNodeNameValue(node.name.value)}Trait`;
    case NodeType.TypeDefinition:
    case NodeType.CallDefinition:
      return `encode${transformNodeNameValue(node.name.value)}`;
  }
}

export function getDecodeFunctionName(
  node: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  switch (node.type) {
    case NodeType.TraitDefinition:
      return `decode${transformNodeNameValue(node.name.value)}Trait`;
    case NodeType.TypeDefinition:
    case NodeType.CallDefinition:
      return `decode${transformNodeNameValue(node.name.value)}`;
  }
}

export function getTypeDefinitionOrCallDefinitionNamePropertyValue(
  node: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition,
  file: string
) {
  return `${file
    // Remove the .jsb extension only if it is at the end of the string
    .replace(/\.jsb$/, '')
    .split('/')
    .map(dashCase)
    .join('.')}.${node.name.value}`;
}

export function getCompareFunctionName(
  node: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  switch (node.type) {
    case NodeType.CallDefinition:
    case NodeType.TypeDefinition:
      return `compare${transformNodeNameValue(node.name.value)}`;
    case NodeType.TraitDefinition:
      return `compare${transformNodeNameValue(node.name.value)}Trait`;
  }
}

export function getUpdateFunctionName(
  node: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  return `update${transformNodeNameValue(node.name.value)}`;
}

export function integerRangeFromBits({
  bits,
  signed
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
      JSBI.subtract(maxRange, one)
    ];
  }
  return [zero, JSBI.subtract(JSBI.multiply(maxRange, two), one)];
}

export function getTypeDefinitionOrCallDefinitionObjectCreator(
  value: INodeTypeDefinition | INodeCallDefinition
) {
  switch (value.type) {
    case NodeType.CallDefinition:
      return transformNodeNameValue(value.name.value);
    case NodeType.TypeDefinition:
      return value.name.value;
  }
}

export function getValidateDefinitionFunctionName(
  value: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  let out = `is${transformNodeNameValue(value.name.value)}`;
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
      return `default${transformNodeNameValue(node.name.value)}`;
    case NodeType.TraitDefinition:
      return `default${transformNodeNameValue(node.name.value)}Trait`;
  }
}

export function getTypeInputParamsInterfaceName(
  value: INodeTypeDefinition | INodeCallDefinition | INodeTraitDefinition
) {
  return `${value.name.value}InputParams`;
}

function transformNodeNameValue(value: string) {
  return upperFirst(camelCase(value));
}
