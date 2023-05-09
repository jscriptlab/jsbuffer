import { Suite } from 'sarg';
import { Deserializer, Serializer } from '../codec';
import { TextEncoder } from 'util';
import assert from 'assert';
import fruitList from './fruit-list.json';

const suite = new Suite();

suite.test('it should write signed 32-bit integer', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  s.writeInt32(-19999);
  s.writeUint32(1706227759);
  s.writeUint32(1);
  s.writeUint32(2);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  assert.strict.equal(d.readInt32(), -19999);
  assert.strict.equal(d.readUint32(), 1706227759);
  assert.strict.equal(d.readUint32(), 1);
  assert.strict.equal(d.readUint32(), 2);
});

suite.test('it should write signed 8-bit integer', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  s.writeInt8(-20);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  assert.strict.equal(d.readInt8(), -20);
});

suite.test('it should write unsigned 8-bit integer', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  s.writeUint8(140);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  assert.strict.equal(d.readUint8(), 140);
});

suite.test('it should write double', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  s.writeFloat(3.569991209869047e-24);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  assert.strict.equal(d.readFloat(), 3.569991209869047e-24);
});

suite.test('it should write float', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  s.writeDouble(7.493994439385616e-56);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  assert.strict.equal(d.readDouble(), 7.493994439385616e-56);
});

suite.test('it should rewind the serializer', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  s.writeDouble(7.493994439385616e-56);
  let d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  assert.strict.equal(d.readDouble(), 7.493994439385616e-56);
  s.rewind();
  s.writeDouble(1.123456789);
  d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  assert.strict.equal(d.readDouble(), 1.123456789);
});

suite.test('it should reallocate internal array buffer', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
    tailByteLength: 1,
  });
  s.writeInt16(100);
  s.writeUint32(1000);
  s.writeUint32(1000);
  s.writeInt32(1000);
  s.writeInt16(100);
  s.writeInt8(100);
  s.writeInt8(-25);
  s.writeUint8(100);
  s.writeString('😀😃😄😁😆😅😂🤣🥲🥹😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝');
  s.writeInt16(100);
});

suite.test('it should write unsigned 16-bit integer', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  s.writeUint16(16000);
  s.writeUint16(1);
  s.writeUint16(2);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  assert.strict.equal(d.readUint16(), 16000);
  assert.strict.equal(d.readUint16(), 1);
  assert.strict.equal(d.readUint16(), 2);
});

suite.test('it should write signed 16-bit integer', () => {
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
  assert.strict.equal(d.readInt16(), -1349);
  assert.strict.equal(d.readInt16(), -20);
  assert.strict.equal(d.readInt16(), -250);
});

suite.test('it should write string', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  s.writeString('x');
  s.writeString('😀😃😄😁😆😅😂🤣🥲🥹😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝');
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  assert.strict.equal(d.readString(), 'x');
  assert.strict.equal(
    d.readString(),
    '😀😃😄😁😆😅😂🤣🥲🥹😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝'
  );
});

suite.test('it should write string 2', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  for (const list of fruitList.data) {
    for (const value of list) {
      s.writeString(value);
      s.writeNullTerminatedString(value);
    }
  }
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  for (const list of fruitList.data) {
    for (const value of list) {
      assert.strict.equal(d.readString(), value);
      assert.strict.equal(d.readNullTerminatedString(), value);
    }
  }
});

suite.test('it should write null-terminated string', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  s.writeNullTerminatedString('aaaaaaaa');
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });
  assert.strict.equal(d.readNullTerminatedString(), 'aaaaaaaa');
});

export default suite;
