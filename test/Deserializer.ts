import { Suite } from 'sarg';
import { Deserializer, Serializer } from '../codec';
import assert from 'assert';

const suite = new Suite();

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
  d.rewindInt32();
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
      d.rewindInt32();
    });
  }
);

export default suite;
