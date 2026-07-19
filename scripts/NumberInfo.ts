export type IntegerTypeId =
  | NumberTypeId.Int8
  | NumberTypeId.Int16
  | NumberTypeId.Int32
  | NumberTypeId.Int64
  | NumberTypeId.UInt64
  | NumberTypeId.UInt32
  | NumberTypeId.UInt16
  | NumberTypeId.UInt8;

export enum NumberTypeId {
  Int8 = 'int8',
  Int16 = 'int16',
  Int32 = 'int32',
  Int64 = 'int64',
  UInt64 = 'uint64',
  UInt32 = 'uint32',
  UInt16 = 'uint16',
  UInt8 = 'uint8',
  Float = 'float',
  Double = 'double'
}

export type NumberInfo =
  | {
      type: IntegerTypeId;
      name: string;
      signed: boolean;
      bits: number;
      suffix?: string;
    }
  | {
      type: NumberTypeId.Double | NumberTypeId.Float;
      name: string;
      bits: number;
      ieee754: true;
    };
