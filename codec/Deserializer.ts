import Long from 'long';

export interface ITextDecoder {
  decode(value: Uint8Array): string;
}

export default class Deserializer {
  readonly #textDecoder;
  readonly #dataView;
  readonly #view;
  readonly #littleEndian;
  #readOffset;
  public constructor({
    buffer,
    textDecoder,
    littleEndian = true,
  }: {
    buffer: Uint8Array;
    textDecoder: ITextDecoder;
    littleEndian?: boolean;
  }) {
    this.#readOffset = 0;
    this.#textDecoder = textDecoder;
    this.#littleEndian = littleEndian;
    this.#dataView = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength
    );
    this.#view = new Uint8Array(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength
    );
  }
  public rewindInt32() {
    this.#rewind(4);
  }
  public readUnsignedLong() {
    return this.#readLong(true);
  }
  public readSignedLong() {
    return this.#readLong(false);
  }
  public readUint8() {
    this.#ensureAvailableByteLength(1);
    const result = this.#dataView.getUint8(this.#readOffset);
    this.#readOffset++;
    return result;
  }
  public readInt8() {
    this.#ensureAvailableByteLength(1);
    const result = this.#dataView.getInt8(this.#readOffset);
    this.#readOffset++;
    return result;
  }
  public readBuffer(length: number) {
    this.#ensureAvailableByteLength(length);
    const view = this.#view.subarray(
      this.#readOffset,
      this.#readOffset + length
    );
    this.#readOffset += length;
    return view;
  }
  public readUint32() {
    this.#ensureAvailableByteLength(4);
    const result = this.#dataView.getUint32(
      this.#readOffset,
      this.#littleEndian
    );
    this.#readOffset += 4;
    return result;
  }
  public readUint16() {
    this.#ensureAvailableByteLength(2);
    const result = this.#dataView.getUint16(
      this.#readOffset,
      this.#littleEndian
    );
    this.#readOffset += 2;
    return result;
  }
  public readString() {
    const length = this.readUint32();
    const buffer = this.readBuffer(length);
    return this.#textDecoder.decode(buffer);
  }
  public readNullTerminatedString() {
    const buffer = this.#remaining();
    let length = 0;
    while (length < buffer.byteLength && buffer[length] !== 0) {
      length++;
    }
    const encoded = this.readBuffer(length + 1);
    return this.#textDecoder.decode(encoded.subarray(0, encoded.length - 1));
  }
  public readInt32() {
    this.#ensureAvailableByteLength(4);
    const result = this.#dataView.getInt32(
      this.#readOffset,
      this.#littleEndian
    );
    this.#readOffset += 4;
    return result;
  }
  public readInt16() {
    this.#ensureAvailableByteLength(2);
    const result = this.#dataView.getInt16(
      this.#readOffset,
      this.#littleEndian
    );
    this.#readOffset += 2;
    return result;
  }
  public readDouble() {
    this.#ensureAvailableByteLength(8);
    const result = this.#dataView.getFloat64(
      this.#readOffset,
      this.#littleEndian
    );
    this.#readOffset += 8;
    return result;
  }
  public readFloat() {
    this.#ensureAvailableByteLength(4);
    const result = this.#dataView.getFloat32(
      this.#readOffset,
      this.#littleEndian
    );
    this.#readOffset += 4;
    return result;
  }
  #ensureAvailableByteLength(requiredByteLength: number) {
    const remaining = this.#view.byteLength - this.#readOffset;
    if (remaining < requiredByteLength) {
      throw new Error(
        `expected ${requiredByteLength} more bytes, but got only ${remaining} bytes left`
      );
    }
  }
  #readLong(unsigned: boolean) {
    return Long.fromBytesLE(
      Array.from(this.readBuffer(8)),
      unsigned
    ).toString();
  }
  #remaining() {
    return this.#view.subarray(this.#readOffset);
  }
  #rewind(byteLength: number) {
    if (this.#readOffset - byteLength < 0) {
      throw new Error(
        `tried to rewind ${byteLength} bytes, but total buffer size is ${
          this.#view.byteLength
        } bytes`
      );
    } else {
      this.#readOffset -= byteLength;
    }
  }
}
