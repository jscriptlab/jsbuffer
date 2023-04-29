export default class Serializer {
  readonly #tailByteLength = 1024 * 1024 * 2;
  readonly #textEncoder;
  #arrayBuffer;
  #writeOffset;
  public constructor({
    textEncoder,
  }: {
    textEncoder: {
      encode(value: string): Uint8Array;
    };
  }) {
    this.#writeOffset = 0;
    this.#textEncoder = textEncoder;
    this.#arrayBuffer = new ArrayBuffer(this.#tailByteLength);
  }
  public view() {
    return new Uint8Array(this.#arrayBuffer, 0, this.#writeOffset);
  }
  public writeUint8(value: number): void {
    this.#allocate(1);
    this.#dataView().setUint8(this.#writeOffset, value);
    this.#writeOffset++;
  }
  public writeBuffer(value: Uint8Array): void {
    this.#allocate(value.byteLength);
    this.#view().set(value, this.#writeOffset);
    this.#writeOffset += value.byteLength;
  }
  public writeUint32(value: number): void {
    this.#allocate(4);
    this.#dataView().setUint32(this.#writeOffset, value, true);
    this.#writeOffset += 4;
  }
  public writeUint16(value: number): void {
    this.#allocate(2);
    this.#dataView().setUint16(this.#writeOffset, value, true);
    this.#writeOffset += 2;
  }
  public writeString(value: string): void {
    const buffer = this.#textEncoder.encode(value);
    /**
     * write string length
     */
    this.writeUint32(buffer.byteLength);
    /**
     * write string
     */
    this.writeBuffer(buffer);
  }
  public writeInt32(value: number): void {
    this.#allocate(4);
    this.#dataView().setInt32(this.#writeOffset, value, true);
    this.#writeOffset += 4;
  }
  public writeInt16(value: number): void {
    this.#allocate(2);
    this.#dataView().setInt16(this.#writeOffset, value, true);
    this.#writeOffset += 2;
  }
  public writeDouble(value: number): void {
    this.#allocate(8);
    this.#dataView().setFloat64(this.#writeOffset, value, true);
    this.#writeOffset += 8;
  }
  public writeFloat(value: number): void {
    this.#allocate(4);
    this.#dataView().setFloat32(this.#writeOffset, value, true);
    this.#writeOffset += 4;
  }
  #dataView() {
    return new DataView(this.#arrayBuffer);
  }
  #view() {
    return new Uint8Array(this.#arrayBuffer);
  }
  #allocate(requestedByteLength: number) {
    const remainingByteLength =
      this.#arrayBuffer.byteLength - this.#writeOffset;
    if (remainingByteLength > requestedByteLength) {
      return;
    }
    const newArrayBuffer = new ArrayBuffer(
      this.#arrayBuffer.byteLength + requestedByteLength + this.#tailByteLength
    );
    new Uint8Array(newArrayBuffer).set(this.#view());
    this.#arrayBuffer = newArrayBuffer;
  }
}
