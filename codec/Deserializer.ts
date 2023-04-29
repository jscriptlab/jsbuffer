export default class Deserializer {
  readonly #textDecoder;
  readonly #dataView;
  readonly #view;
  #readOffset;
  public constructor({
    buffer,
    textDecoder,
  }: {
    buffer: Uint8Array;
    textDecoder: {
      decode(value: Uint8Array): string;
    };
  }) {
    this.#readOffset = 0;
    this.#textDecoder = textDecoder;
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
    this.#rewind(Uint32Array.BYTES_PER_ELEMENT);
  }
  public readUint8() {
    this.#ensureOffset(1);
    const result = this.#dataView.getUint8(this.#readOffset);
    this.#readOffset++;
    return result;
  }
  public readBuffer(length: number) {
    this.#ensureOffset(length);
    const view = this.#view.subarray(
      this.#readOffset,
      this.#readOffset + length
    );
    this.#readOffset += length;
    return view;
  }
  public readUint32() {
    this.#ensureOffset(4);
    const result = this.#dataView.getUint32(this.#readOffset, true);
    this.#readOffset += 4;
    return result;
  }
  public readUint16() {
    this.#ensureOffset(2);
    const result = this.#dataView.getUint16(this.#readOffset, true);
    this.#readOffset += 2;
    return result;
  }
  public readString() {
    const length = this.readUint32();
    const buffer = this.readBuffer(length);
    return this.#textDecoder.decode(buffer);
  }
  public readInt32() {
    this.#ensureOffset(4);
    const result = this.#dataView.getInt32(this.#readOffset, true);
    this.#readOffset += 4;
    return result;
  }
  public readInt16() {
    this.#ensureOffset(2);
    const result = this.#dataView.getInt16(this.#readOffset, true);
    this.#readOffset += 2;
    return result;
  }
  public readDouble() {
    this.#ensureOffset(8);
    const result = this.#dataView.getFloat64(this.#readOffset, true);
    this.#readOffset += 8;
    return result;
  }
  public readFloat() {
    this.#ensureOffset(4);
    const result = this.#dataView.getFloat32(this.#readOffset, true);
    this.#readOffset += 4;
    return result;
  }
  #ensureOffset(requiredByteLength: number) {
    const remaining = this.#view.byteLength - this.#readOffset;
    if (remaining < requiredByteLength) {
      throw new Error(
        `expected ${requiredByteLength} more bytes, but got only ${remaining} bytes left`
      );
    }
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
