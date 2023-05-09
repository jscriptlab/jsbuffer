import Deserializer, { ITextDecoder } from './Deserializer';
import Serializer, { ITextEncoder } from './Serializer';

export default class Codec {
  readonly #serializer;
  readonly #textDecoder;
  readonly #littleEndian;
  public constructor({
    textEncoder,
    textDecoder,
    littleEndian = true,
  }: {
    textEncoder: ITextEncoder;
    textDecoder: ITextDecoder;
    littleEndian?: boolean;
  }) {
    this.#littleEndian = littleEndian;
    this.#serializer = new Serializer({
      textEncoder,
      littleEndian,
    });
    this.#textDecoder = textDecoder;
  }
  /**
   * the ArrayBuffer used by the Uint8Array instance returned by this call will be reused by other calls to this encode function,
   * to avoid data corruption, make sure to copy if you will not send the message immediately after a call to this method.
   */
  public encode<T>(
    encode: (s: Serializer, value: T) => void,
    value: T
  ): Uint8Array {
    this.#serializer.rewind();
    encode(this.#serializer, value);
    return this.#serializer.view();
  }
  public decode<T>(
    decode: (d: Deserializer) => T | null,
    buffer: Uint8Array
  ): T | null {
    const d = new Deserializer({
      littleEndian: this.#littleEndian,
      buffer,
      textDecoder: this.#textDecoder,
    });
    return decode(d);
  }
}
