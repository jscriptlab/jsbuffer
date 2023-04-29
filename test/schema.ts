import { Suite } from 'sarg';
import {
  GetConversations,
  GetPostById,
  decodeMsg,
  decodeRequestTrait,
  encodeMsg,
  encodeRequestTrait,
  msg,
} from '../out/schema';
import { Serializer, Deserializer } from '../codec';
import { TextDecoder, TextEncoder } from 'util';
import assert from 'assert';
import crypto from 'crypto';

const suite = new Suite();

suite.test('it should encode Request trait', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  encodeRequestTrait(s, GetConversations({}));
  const d = new Deserializer({
    textDecoder: new TextDecoder(),
    buffer: s.view(),
  });
  assert.strict.deepEqual(decodeRequestTrait(d), GetConversations({}));
});

suite.test('it should encode get post by id call', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  encodeRequestTrait(
    s,
    GetPostById({
      postId: 100000,
    })
  );
  const d = new Deserializer({
    textDecoder: new TextDecoder(),
    buffer: s.view(),
  });
  assert.strict.deepEqual(
    decodeRequestTrait(d),
    GetPostById({
      postId: 100000,
    })
  );
});

suite.test('it should encode types with buffers in it', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  const data = crypto.webcrypto.getRandomValues(new Uint8Array(1000));
  encodeMsg(
    s,
    msg({
      data,
    })
  );
  const d = new Deserializer({
    textDecoder: new TextDecoder(),
    buffer: s.view(),
  });
  assert.strict.deepEqual(
    decodeMsg(d),
    msg({
      data,
    })
  );
});

export default suite;
