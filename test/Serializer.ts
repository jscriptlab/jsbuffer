import { Suite } from 'sarg';
import { Deserializer, Serializer } from '../codec';
import { TextEncoder } from 'util';
import assert from 'assert';

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

export default suite;
