import { Deserializer, Serializer } from '@jsbuffer/codec';
import { TextEncoder } from 'util';
import test from 'ava';
import fruitList from './fruit-list.json';

test('it should write signed 32-bit integer', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeInt32(-19999);
  s.writeUint32(1706227759);
  s.writeUint32(1);
  s.writeUint32(2);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readInt32(), -19999);
  t.deepEqual(d.readUint32(), 1706227759);
  t.deepEqual(d.readUint32(), 1);
  t.deepEqual(d.readUint32(), 2);
});

test('it should write signed 8-bit integer', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeInt8(-20);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readInt8(), -20);
});

test('it should write unsigned 8-bit integer', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeUint8(140);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readUint8(), 140);
});

test('it should write double', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeFloat(3.569991209869047e-24);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readFloat(), 3.569991209869047e-24);
});

test('it should write float', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeDouble(7.493994439385616e-56);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readDouble(), 7.493994439385616e-56);
});

test('it should rewind the serializer', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeDouble(7.493994439385616e-56);
  let d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readDouble(), 7.493994439385616e-56);
  s.rewind();
  s.writeDouble(1.123456789);
  d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readDouble(), 1.123456789);
});

test('it should reallocate internal array buffer', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
    tailByteLength: 1
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
  t.pass();
});

test('it should write unsigned 16-bit integer', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeUint16(16000);
  s.writeUint16(1);
  s.writeUint16(2);
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readUint16(), 16000);
  t.deepEqual(d.readUint16(), 1);
  t.deepEqual(d.readUint16(), 2);
});

test('it should write signed 16-bit integer', (t) => {
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
  t.deepEqual(d.readInt16(), -1349);
  t.deepEqual(d.readInt16(), -20);
  t.deepEqual(d.readInt16(), -250);
});

test('it should write string', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeString('x');
  s.writeString('😀😃😄😁😆😅😂🤣🥲🥹😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝');
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readString(), 'x');
  t.deepEqual(
    d.readString(),
    '😀😃😄😁😆😅😂🤣🥲🥹😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝'
  );
});

test('it should write string 2', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  for (const list of fruitList.data) {
    for (const value of list) {
      s.writeString(value);
      s.writeNullTerminatedString(value);
    }
  }
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  for (const list of fruitList.data) {
    for (const value of list) {
      t.deepEqual(d.readString(), value);
      t.deepEqual(d.readNullTerminatedString(), value);
    }
  }
});

test('it should write null-terminated string', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeNullTerminatedString('aaaaaaaa');
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readNullTerminatedString(), 'aaaaaaaa');
});
test('it should write sequence of null-terminated strings', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  s.writeNullTerminatedString('');
  s.writeInt32(-10);
  s.writeNullTerminatedString('a');
  s.writeInt32(-25);
  s.writeNullTerminatedString('b');
  s.writeNullTerminatedString('aaaaaaaa');
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(d.readNullTerminatedString(), '');
  t.deepEqual(d.readInt32(), -10);
  t.deepEqual(d.readNullTerminatedString(), 'a');
  t.deepEqual(d.readInt32(), -25);
  t.deepEqual(d.readNullTerminatedString(), 'b');
  t.deepEqual(d.readNullTerminatedString(), 'aaaaaaaa');
});
