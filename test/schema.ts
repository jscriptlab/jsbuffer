import { Suite } from 'sarg';
import {
  GetConversations,
  GetPostById,
  decodeMsg,
  decodeSimpleTupleTest,
  emptyNode,
  encodeMsg,
  encodeSimpleTupleTest,
  msg,
  simpleTupleTest,
  compareSimpleTupleTest,
  updateSimpleTupleTest,
} from '../out/schema';
import { tupleTupleTest, updateTupleTupleTest } from '../out/tupleTest2';
import { Serializer, Deserializer } from '../codec';
import { TextDecoder, TextEncoder } from 'util';
import assert from 'assert';
import crypto from 'crypto';
import { decodeRequestTrait, encodeRequestTrait } from '../out/Request';

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

suite.test(
  'definitions with no params might be initialized with no params',
  () => {
    emptyNode();
  }
);

suite.test('it should encode tuple', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  encodeSimpleTupleTest(
    s,
    simpleTupleTest({
      a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
      b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]],
    })
  );
  const d = new Deserializer({
    textDecoder: new TextDecoder(),
    buffer: s.view(),
  });
  assert.strict.deepEqual(
    decodeSimpleTupleTest(d),
    simpleTupleTest({
      a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
      b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]],
    })
  );
});

suite.test('it should support tuple inside tuple types', () => {
  const a1 = tupleTupleTest({
    a: [[0, '', []], 0, '', 0.0],
  });
  assert.strict.equal(updateTupleTupleTest(a1, {}), a1);
  assert.strict.deepEqual(
    updateTupleTupleTest(a1, {
      a: [[0, 'aaa', [['', 1]]], 0, '', 0.0],
    }),
    tupleTupleTest({
      a: [[0, 'aaa', [['', 1]]], 0, '', 0.0],
    })
  );
});

suite.test(
  'it should change type with tuple reference only when changes are made',
  () => {
    const a1 = simpleTupleTest({
      a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
      b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]],
    });
    assert.strict.equal(
      updateSimpleTupleTest(a1, {
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]],
      }),
      a1
    );
    assert.strict.equal(updateSimpleTupleTest(a1, {}), a1);
    assert.strict.notEqual(
      updateSimpleTupleTest(a1, {
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], ''],
      }),
      a1
    );
    assert.strict.deepEqual(
      updateSimpleTupleTest(a1, {
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], ''],
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], ''],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]],
      })
    );
  }
);

suite.test('it should compare tuples', () => {
  assert.strict.ok(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]],
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]],
      })
    )
  );
  assert.strict.ok(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa'],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]],
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa'],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]],
      })
    )
  );
  assert.strict.equal(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa'],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]],
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'bbb'],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]],
      })
    ),
    false
  );
  assert.strict.equal(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]],
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'bbb'],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]],
      })
    ),
    false
  );
  assert.strict.equal(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa']],
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]],
      })
    ),
    false
  );
  assert.strict.ok(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa']],
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa']],
      })
    )
  );
  assert.strict.ok(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.12345678, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa']],
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.12345678, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa']],
      })
    )
  );
  assert.strict.equal(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.12345678, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa']],
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa']],
      })
    ),
    false
  );
});

export default suite;
