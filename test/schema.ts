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
  testMap,
  encodeTestMap,
  decodeTestMap,
  compareTestMap,
  compareTestMap2,
  testMap2,
  encodeTestMap2,
  decodeTestMap2,
  updateTestMap2,
  encodeTestMap3,
  testMap3,
  defaultTestMap3,
  defaultTestMap2,
  decodeTestMap3,
  testSet,
  compareTestSet,
  encodeTestSet,
  decodeTestSet
} from '../out/schema';
import {
  defaultSuperTupleTupleTest,
  tupleTupleTest,
  updateSuperTupleTupleTest,
  updateTupleTupleTest
} from '../out/tupleTest2';
import {
  A,
  defaultTest,
  test as initTest,
  updateTest
} from '../out/testUpdateFunction';
import { Serializer, Deserializer, Codec } from '@jsbuffer/codec';
import { TextDecoder, TextEncoder } from 'util';
import assert from 'assert';
import crypto from 'crypto';
import { decodeRequestTrait, encodeRequestTrait } from '../out/Request';
import { C } from '../out/testUpdateFunction';
import test from 'ava';

test('it should encode Request trait', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  encodeRequestTrait(s, GetConversations({}));
  const d = new Deserializer({
    textDecoder: new TextDecoder(),
    buffer: s.view()
  });
  t.deepEqual(decodeRequestTrait(d), GetConversations({}));
});

test('it should encode map', (t) => {
  const codec = new Codec({
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });
  t.deepEqual(
    codec.decode(
      decodeTestMap,
      codec.encode(
        encodeTestMap,
        testMap({
          a: new Map([
            ['a', '1'],
            ['b', '2'],
            ['c', '3']
          ])
        })
      )
    ),
    testMap({
      a: new Map([
        ['a', '1'],
        ['b', '2'],
        ['c', '3']
      ])
    })
  );
});

test('it should compare types with map template as parameters', (t) => {
  t.assert(
    compareTestMap(
      testMap({
        a: new Map([
          ['a', '1'],
          ['b', '2'],
          ['c', '3']
        ])
      }),
      testMap({
        a: new Map([
          ['a', '1'],
          ['b', '2'],
          ['c', '3']
        ])
      })
    )
  );
});

test('it should compare types with set<t> has a param type', (t) => {
  t.assert(
    compareTestSet(
      testSet({
        a: new Set(['a', 'b', 'c']),
        b: new Set([1, 2, 3, 4])
      }),
      testSet({
        a: new Set(['a', 'b', 'c']),
        b: new Set([1, 2, 3, 4])
      })
    )
  );
  t.deepEqual(
    compareTestSet(
      testSet({
        a: new Set(['a', 'b', 'c']),
        b: new Set([1, 2, 3, 4])
      }),
      testSet({
        a: new Set(['a', 'b', 'd']),
        b: new Set([1, 2, 3, 4])
      })
    ),
    false
  );
});

test('it should encode/decode types with set<t> has a param type', (t) => {
  const codec = new Codec({
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });
  t.deepEqual(
    codec.decode(
      decodeTestSet,
      codec.encode(
        encodeTestSet,
        testSet({
          a: new Set(['a', 'b', 'c']),
          b: new Set([1, 2, 3, 4])
        })
      )
    ),
    testSet({
      a: new Set(['a', 'b', 'c']),
      b: new Set([1, 2, 3, 4])
    })
  );
});

test("it should allow maps using object types even if they're not reliable", (t) => {
  const codec = new Codec({
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });
  t.deepEqual(
    codec.decode(
      decodeTestMap3,
      codec.encode(
        encodeTestMap3,
        testMap3({
          a: new Map([
            [defaultTestMap2(), 'a'],

            [
              testMap2({
                a: new Map([
                  ['a', '1'],
                  ['b', '2'],
                  ['c', '3']
                ]),
                b: new Map([['a', ['', new Map([[1, 2]])]]])
              }),
              'b'
            ]
          ])
        })
      )
    ),
    testMap3({
      a: new Map([
        [defaultTestMap2(), 'a'],

        [
          testMap2({
            a: new Map([
              ['a', '1'],
              ['b', '2'],
              ['c', '3']
            ]),
            b: new Map([['a', ['', new Map([[1, 2]])]]])
          }),
          'b'
        ]
      ])
    })
  );
});

test('it should compare types with complex map template as parameters', (t) => {
  t.assert(
    compareTestMap2(
      testMap2({
        a: new Map([
          ['a', '1'],
          ['b', '2'],
          ['c', '3']
        ]),
        b: new Map([['a', ['', new Map([[1, 2]])]]])
      }),
      testMap2({
        a: new Map([
          ['a', '1'],
          ['b', '2'],
          ['c', '3']
        ]),
        b: new Map([['a', ['', new Map([[1, 2]])]]])
      })
    )
  );
});

test('it should should keep reference if no changes are requested even if the type is using complex type', (t) => {
  const a1 = testMap2({
    a: new Map([
      ['a', '1'],
      ['b', '2'],
      ['c', '3']
    ]),
    b: new Map([['a', ['', new Map([[1, 2]])]]])
  });
  t.deepEqual(updateTestMap2(a1, {}), a1);
  t.assert(
    updateTestMap2(a1, {
      b: new Map([['a', ['', new Map([[1, 2]])]]])
    }) === a1
  );
});

test('it should should change the reference if no changes are requested even if the type is using complex type', (t) => {
  const a1 = testMap2({
    a: new Map([
      ['a', '1'],
      ['b', '2'],
      ['c', '3']
    ]),
    b: new Map([['a', ['', new Map([[1, 2]])]]])
  });
  assert.strict.notEqual(
    updateTestMap2(a1, {
      b: new Map([['a', ['', new Map([[1, 3]])]]])
    }),
    a1
  );
  t.deepEqual(
    updateTestMap2(a1, {
      b: new Map([['a', ['', new Map([[1, 3]])]]])
    }),
    testMap2({
      a: new Map([
        ['a', '1'],
        ['b', '2'],
        ['c', '3']
      ]),
      b: new Map([['a', ['', new Map([[1, 3]])]]])
    })
  );
});

test('it should encode/decode types with complex map template as parameters', (t) => {
  const codec = new Codec({
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });
  t.deepEqual(
    codec.decode(
      decodeTestMap2,
      codec.encode(
        encodeTestMap2,
        testMap2({
          a: new Map([
            ['a', '1'],
            ['b', '2'],
            ['c', '3']
          ]),
          b: new Map([['a', ['', new Map([[1, 2]])]]])
        })
      )
    ),
    testMap2({
      a: new Map([
        ['a', '1'],
        ['b', '2'],
        ['c', '3']
      ]),
      b: new Map([['a', ['', new Map([[1, 2]])]]])
    })
  );
});

test('it should encode get post by id call', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  encodeRequestTrait(
    s,
    GetPostById({
      postId: 100000
    })
  );
  const d = new Deserializer({
    textDecoder: new TextDecoder(),
    buffer: s.view()
  });
  t.deepEqual(
    decodeRequestTrait(d),
    GetPostById({
      postId: 100000
    })
  );
});

test('it should encode types with buffers in it', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  const data = new Uint8Array([...crypto.randomBytes(1000)]);
  encodeMsg(
    s,
    msg({
      data
    })
  );
  const d = new Deserializer({
    textDecoder: new TextDecoder(),
    buffer: s.view()
  });
  t.deepEqual(
    decodeMsg(d),
    msg({
      data
    })
  );
});

test('definitions with no params might be initialized with no params', (t) => {
  emptyNode();
  t.pass();
});

test('it should encode tuple', (t) => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  encodeSimpleTupleTest(
    s,
    simpleTupleTest({
      a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
      b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
    })
  );
  const d = new Deserializer({
    textDecoder: new TextDecoder(),
    buffer: s.view()
  });
  t.deepEqual(
    decodeSimpleTupleTest(d),
    simpleTupleTest({
      a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
      b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
    })
  );
});

test('it should support tuple inside tuple types', (t) => {
  const a1 = tupleTupleTest({
    a: [[0, '', []], 0, '', 0.0]
  });
  assert.strict.equal(updateTupleTupleTest(a1, {}), a1);
  t.deepEqual(
    updateTupleTupleTest(a1, {
      a: [[0, 'aaa', [['', 1]]], 0, '', 0.0]
    }),
    tupleTupleTest({
      a: [[0, 'aaa', [['', 1]]], 0, '', 0.0]
    })
  );
  const a2 = defaultSuperTupleTupleTest();
  assert.strict.equal(updateSuperTupleTupleTest(a2, {}), a2);
});

test('it should change type with tuple reference only when changes are made', (t) => {
  const a1 = simpleTupleTest({
    a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
    b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
  });
  assert.strict.equal(
    updateSimpleTupleTest(a1, {
      a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
      b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
    }),
    a1
  );
  assert.strict.equal(updateSimpleTupleTest(a1, {}), a1);
  assert.strict.notEqual(
    updateSimpleTupleTest(a1, {
      a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], '']
    }),
    a1
  );
  t.deepEqual(
    updateSimpleTupleTest(a1, {
      a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], '']
    }),
    simpleTupleTest({
      a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], ''],
      b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
    })
  );
});

test('it should compare tuples', (t) => {
  assert.strict.ok(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
      })
    )
  );
  assert.strict.ok(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa'],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa'],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
      })
    )
  );
  assert.strict.equal(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa'],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'bbb'],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
      })
    ),
    false
  );
  assert.strict.equal(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'bbb'],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
      })
    ),
    false
  );
  assert.strict.equal(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa']]
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
      })
    ),
    false
  );
  assert.strict.ok(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa']]
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa']]
      })
    )
  );
  assert.strict.ok(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.12345678, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa']]
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.12345678, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa']]
      })
    )
  );
  assert.strict.equal(
    compareSimpleTupleTest(
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.12345678, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa']]
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], 'aaa']]
      })
    ),
    false
  );
  t.pass();
});

test('it should update types with parameters that are using trait types', (t) => {
  const a1 = defaultTest();
  assert.strict.equal(
    updateTest(a1, {
      traitParam: A({
        a: 0
      })
    }),
    a1
  );
  const a2 = initTest({
    traitParam: A({
      a: 1
    })
  });
  t.deepEqual(
    updateTest(a2, {
      traitParam: C({
        a: 2.5
      })
    }),
    initTest({
      traitParam: C({
        a: 2.5
      })
    })
  );
});

test('it should encode types with parameters using long generic type', async (t) => {
  const { A, B, C, encodeA, encodeB, encodeC, decodeA, decodeB, decodeC } =
    await import('../out/testLong');
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  encodeA(
    s,
    A({
      a: '-100000000'
    })
  );
  encodeB(
    s,
    B({
      a: '10000'
    })
  );
  encodeC(
    s,
    C({
      a: '-100000000',
      b: '10000',
      c: -200000
    })
  );
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder()
  });
  t.deepEqual(
    decodeA(d),
    A({
      a: '-100000000'
    })
  );
  t.deepEqual(
    decodeB(d),
    B({
      a: '10000'
    })
  );
  t.deepEqual(
    decodeC(d),
    C({
      a: '-100000000',
      b: '10000',
      c: -200000
    })
  );
});
