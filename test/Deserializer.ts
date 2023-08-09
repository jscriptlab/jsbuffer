import { Suite } from 'sarg';
import { Deserializer, Serializer } from '@jsbuffer/codec';
import assert from 'assert';

const suite = new Suite();

suite.test('Deserializer: it should deserialize max signed long', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  s.writeSignedLong('-1');
  s.writeSignedLong('9223372036854775807');
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  assert.strict.equal(d.readSignedLong(), '-1');
  assert.strict.equal(d.readSignedLong(), '9223372036854775807');
});

suite.test('Deserializer: it should deserialize min signed long', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  s.writeSignedLong('-9223372036854775808');
  s.writeUint32(1000000);
  s.writeInt32(-1000000);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  assert.strict.equal(d.readSignedLong(), '-9223372036854775808');
  assert.strict.equal(d.readUint32(), 1000000);
  assert.strict.equal(d.readInt32(), -1000000);
});

suite.test('Deserializer: it should deserialize unsigned long', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  s.writeUnsignedLong('18446744073709551615');
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  assert.strict.equal(d.readUnsignedLong(), '18446744073709551615');
});

suite.test(
  'Deserializer: it should throw in case we try to read more than what we have',
  () => {
    const s = new Serializer({
      textEncoder: new TextEncoder(),
    });
    s.writeInt16(-1349);
    s.writeInt16(-20);
    s.writeInt16(-250);
    const d = new Deserializer({
      buffer: s.view(),
      textDecoder: new TextDecoder(),
    });
    d.readInt16();
    d.readInt16();
    d.readInt16();
    assert.strict.throws(() => {
      d.readInt16();
    }, /2 more bytes/);
  }
);

suite.test(
  'Deserializer: it should throw in case we try to read more than what we have',
  () => {
    const s = new Serializer({
      textEncoder: new TextEncoder(),
    });
    s.writeInt16(-1349);
    s.writeInt16(-20);
    s.writeInt16(-250);
    const d = new Deserializer({
      buffer: s.view(),
      textDecoder: new TextDecoder(),
    });
    d.readInt16();
    d.readInt16();
    d.readInt16();
    assert.strict.throws(() => {
      d.readInt16();
    }, /2 more bytes/);
  }
);

suite.test('Deserializer: it should rewind 4 bytes', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  s.writeInt32(-250);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  assert.strict.equal(d.readInt32(), -250);
  d.rewind(4);
  assert.strict.equal(d.readInt32(), -250);
});

suite.test(
  'Deserializer: it should throw if we try to rewind more than what we have',
  () => {
    const s = new Serializer({
      textEncoder: new TextEncoder(),
    });
    s.writeInt32(-250);
    const d = new Deserializer({
      buffer: s.view(),
      textDecoder: new TextDecoder(),
    });
    assert.strict.throws(() => {
      d.rewind(4);
    });
  }
);

export default suite;
