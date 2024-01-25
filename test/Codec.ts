import test from 'ava';
import { Codec } from '@jsbuffer/codec';
import {
  GetPostById,
  decodeGetPostById,
  encodeGetPostById
} from '../out/schema';

test('Codec#encode: it should support encoding several times in a row', (t) => {
  const codec = new Codec({
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });
  const result = codec.encode(
    encodeGetPostById,
    GetPostById({
      postId: 100000
    })
  );
  t.deepEqual(codec.decode(decodeGetPostById, result),
    GetPostById({
      postId: 100000
    })
  );
  const result2 = codec.encode(
    encodeGetPostById,
    GetPostById({
      postId: 5
    })
  );
  t.deepEqual(codec.decode(decodeGetPostById, result2),
    GetPostById({
      postId: 5
    })
  )
});

test('Codec#decode: it should support decode', (t) => {
  const codec = new Codec({
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });
  t.deepEqual(
    codec.decode(
      decodeGetPostById,
      codec.encode(
        encodeGetPostById,
        GetPostById({
          postId: 100000
        })
      )
    ),
    GetPostById({
      postId: 100000
    })
  );
});
