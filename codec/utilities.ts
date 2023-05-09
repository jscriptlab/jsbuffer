import Serializer, { ISerializerOptions, ITextEncoder } from './Serializer';

export function createEncoder({
  Serializer,
  TextEncoder,
}: {
  TextEncoder: new () => ITextEncoder;
  Serializer: new (options: ISerializerOptions) => Serializer;
}) {
  function encode<T>(
    encodeFunction: (s: Serializer, value: T) => void,
    value: T
  ): Uint8Array {
    const s = new Serializer({
      tailByteLength: 1024,
      textEncoder: new TextEncoder(),
    });
    encodeFunction(s, value);
    return s.view();
  }
  return encode;
}
