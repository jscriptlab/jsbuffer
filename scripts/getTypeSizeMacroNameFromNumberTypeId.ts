import { NumberTypeId } from './NumberInfo';

export default function getTypeSizeMacroNameFromNumberTypeId(
  typeId: NumberTypeId
): string {
  let typeSizeMacroName: string;
  switch (typeId) {
    case NumberTypeId.Int8:
      typeSizeMacroName = 'JSB_INT8_TYPE_SIZE';
      break;
    case NumberTypeId.Int16:
      typeSizeMacroName = 'JSB_INT16_TYPE_SIZE';
      break;
    case NumberTypeId.Int32:
      typeSizeMacroName = 'JSB_INT32_TYPE_SIZE';
      break;
    case NumberTypeId.Int64:
      typeSizeMacroName = 'JSB_INT64_TYPE_SIZE';
      break;
    case NumberTypeId.UInt64:
      typeSizeMacroName = 'JSB_UINT64_TYPE_SIZE';
      break;
    case NumberTypeId.UInt32:
      typeSizeMacroName = 'JSB_UINT32_TYPE_SIZE';
      break;
    case NumberTypeId.UInt16:
      typeSizeMacroName = 'JSB_UINT16_TYPE_SIZE';
      break;
    case NumberTypeId.UInt8:
      typeSizeMacroName = 'JSB_UINT8_TYPE_SIZE';
      break;
    case NumberTypeId.Float:
      typeSizeMacroName = 'JSB_FLOAT_TYPE_SIZE';
      break;
    case NumberTypeId.Double:
      typeSizeMacroName = 'JSB_DOUBLE_TYPE_SIZE';
      break;
  }

  return typeSizeMacroName;
}
