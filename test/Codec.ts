import test from 'ava';
import { Codec } from '@jsbuffer/codec';
import {
  GetPostById,
  decodeGetPostById,
  encodeGetPostById
} from '../out/schema';
import { expect } from 'chai';

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
  expect(codec.decode(decodeGetPostById, result)).to.be.deep.equal(
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
  expect(codec.decode(decodeGetPostById, result2)).to.be.deep.equal(
    GetPostById({
      postId: 5
    })
  );
  t.pass();
});

test('Codec#decode: it should support decode', (t) => {
  const codec = new Codec({
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });
  expect(
    codec.decode(
      decodeGetPostById,
      codec.encode(
        encodeGetPostById,
        GetPostById({
          postId: 100000
        })
      )
    )
  ).to.be.deep.equal(
    GetPostById({
      postId: 100000
    })
  );
  t.pass();
});
