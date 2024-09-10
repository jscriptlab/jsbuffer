import JSBI from 'jsbi';
import { IMetadataTypeDefinition, Metadata } from '../../parser/types/metadata';
import {
  camelCase,
  dashCase,
  upperFirst
} from '../../../code-generator/stringUtilities';

export function getEncodeFunctionName(node: Metadata) {
  switch (node.kind) {
    case 'trait':
      return `encode${transformNodeNameValue(node.name)}Trait`;
    case 'type':
    case 'call':
      return `encode${transformNodeNameValue(node.name)}`;
  }
}

export function getDecodeFunctionName(node: Metadata) {
  switch (node.kind) {
    case 'trait':
      return `decode${transformNodeNameValue(node.name)}Trait`;
    case 'type':
    case 'call':
      return `decode${transformNodeNameValue(node.name)}`;
  }
}

export function getTypeDefinitionOrCallDefinitionNamePropertyValue(
  node: Metadata,
  file: string
) {
  return `${file
    // Remove the .jsb extension only if it is at the end of the string
    .replace(/\.jsb$/, '')
    .split('/')
    .map(dashCase)
    .join('.')}.${node.name}`;
}

export function getCompareFunctionName(node: Metadata) {
  switch (node.kind) {
    case 'call':
    case 'type':
      return `compare${transformNodeNameValue(node.name)}`;
    case 'trait':
      return `compare${transformNodeNameValue(node.name)}Trait`;
  }
}

export function getUpdateFunctionName(node: Metadata) {
  return `update${transformNodeNameValue(node.name)}`;
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
  value: IMetadataTypeDefinition
) {
  switch (value.kind) {
    case 'call':
      return transformNodeNameValue(value.name);
    case 'type':
      return value.name;
  }
}

export function getValidateDefinitionFunctionName(value: Metadata) {
  let out = `is${transformNodeNameValue(value.name)}`;
  switch (value.kind) {
    case 'trait':
      out = `${out}Trait`;
      break;
  }
  return out;
}

export function getTypeName(value: Metadata) {
  return value.name;
}

export function getDefaultFunctionName(node: Metadata) {
  switch (node.kind) {
    case 'call':
    case 'type':
      return `default${transformNodeNameValue(node.name)}`;
    case 'trait':
      return `default${transformNodeNameValue(node.name)}Trait`;
  }
}

export function getTypeInputParamsInterfaceName(value: Metadata) {
  return `${value.name}InputParams`;
}

function transformNodeNameValue(value: string) {
  return upperFirst(camelCase(value));
}
