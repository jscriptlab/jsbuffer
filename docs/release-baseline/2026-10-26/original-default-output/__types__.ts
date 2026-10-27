export type RequestResult<T> = T extends IRequest<infer R> ? R : never;
export interface ISerializer {
    writeUint8(value: number): void;
    writeBuffer(value: Uint8Array): void;
    writeUint32(value: number): void;
    writeString(value: string): void;
    writeSignedBigInt(value: string, bits: number): void;
    writeUnsignedBigInt(value: string, bits: number): void;
    writeNullTerminatedString(value: string): void;
    writeSignedLong(value: string): void;
    writeUnsignedLong(value: string): void;
    writeInt32(value: number): void;
    writeDouble(value: number): void;
    writeFloat(value: number): void;
}
export interface IDeserializer {
    readUint8(): number;
    readBuffer(length: number): Uint8Array;
    readSignedBigInt(bits: number): string;
    readUnsignedBigInt(bits: number): string;
    readUint32(): number;
    readString(): string;
    readNullTerminatedString(): string;
    readSignedLong(): string;
    readUnsignedLong(): string;
    readInt32(): number;
    readDouble(): number;
    readFloat(): number;
    rewind(bytes: number): void;
}
export interface IRequest<T> {
    _returnType?: T;
}
