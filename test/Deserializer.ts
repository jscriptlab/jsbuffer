import { Deserializer, Serializer } from '@jsbuffer/codec';
import test from 'ava';
import assert from 'assert';

test('Deserializer: it should deserialize max signed long', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeSignedLong('-1');
  s.writeSignedLong('9223372036854775807');
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readSignedLong(), '-1');
  t.deepEqual(d.readSignedLong(), '9223372036854775807');
});

test('Deserializer: it should deserialize min signed long', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeSignedLong('-9223372036854775808');
  s.writeUint32(1000000);
  s.writeInt32(-1000000);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readSignedLong(), '-9223372036854775808');
  t.deepEqual(d.readUint32(), 1000000);
  t.deepEqual(d.readInt32(), -1000000);
});

test('Deserializer: it should deserialize unsigned long', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeUnsignedLong('18446744073709551615');
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readUnsignedLong(), '18446744073709551615');
});

test('Deserializer: it should throw in case we try to read more than what we have', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeInt16(-1349);
  s.writeInt16(-20);
  s.writeInt16(-250);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  d.readInt16();
  d.readInt16();
  d.readInt16();
  try {
    d.readInt16();
  } catch (e) {
    assert.strict.ok(e instanceof Error);
    t.deepEqual(e.message, `expected 2 more bytes, but got only 0 bytes left`);
  }
});

test('Deserializer: it should rewind 4 bytes', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeInt32(-250);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readInt32(), -250);
  d.rewind(4);
  t.deepEqual(d.readInt32(), -250);
});

test('Deserializer: it should throw if we try to rewind more than what we have', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeInt32(-250);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.throws(() => {
    d.rewind(4);
  });
});
