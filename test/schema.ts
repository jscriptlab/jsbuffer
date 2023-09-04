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
import { A, defaultTest, test, updateTest } from '../out/testUpdateFunction';
import { Serializer, Deserializer, Codec } from '@jsbuffer/codec';
import { TextDecoder, TextEncoder } from 'util';
import assert from 'assert';
import crypto from 'crypto';
import { decodeRequestTrait, encodeRequestTrait } from '../out/Request';
import { C } from '../out/testUpdateFunction';

const suite = new Suite();

suite.test('it should encode Request trait', () => {
  const s = new Serializer({
    textEncoder: new TextEncoder()
  });
  encodeRequestTrait(s, GetConversations({}));
  const d = new Deserializer({
    textDecoder: new TextDecoder(),
    buffer: s.view()
  });
  assert.strict.deepEqual(decodeRequestTrait(d), GetConversations({}));
});

suite.test('it should encode map', () => {
  const codec = new Codec({
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });
  assert.strict.deepEqual(
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

suite.test('it should compare types with map template as parameters', () => {
  assert.strict.ok(
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

suite.test('it should compare types with set<t> has a param type', () => {
  assert.strict.ok(
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
  assert.strict.equal(
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

suite.test('it should encode/decode types with set<t> has a param type', () => {
  const codec = new Codec({
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });
  assert.strict.deepEqual(
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

suite.test(
  "it should allow maps using object types even if they're not reliable",
  () => {
    const codec = new Codec({
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder()
    });
    assert.strict.deepEqual(
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
  }
);

suite.test(
  'it should compare types with complex map template as parameters',
  () => {
    assert.strict.ok(
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
  }
);

suite.test(
  'it should should keep reference if no changes are requested even if the type is using complex type',
  () => {
    const a1 = testMap2({
      a: new Map([
        ['a', '1'],
        ['b', '2'],
        ['c', '3']
      ]),
      b: new Map([['a', ['', new Map([[1, 2]])]]])
    });
    assert.strict.equal(updateTestMap2(a1, {}), a1);
    assert.strict.equal(
      updateTestMap2(a1, {
        b: new Map([['a', ['', new Map([[1, 2]])]]])
      }),
      a1
    );
  }
);

suite.test(
  'it should should change the reference if no changes are requested even if the type is using complex type',
  () => {
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
    assert.strict.deepEqual(
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
  }
);

suite.test(
  'it should encode/decode types with complex map template as parameters',
  () => {
    const codec = new Codec({
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder()
    });
    assert.strict.deepEqual(
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
  }
);

suite.test('it should encode get post by id call', () => {
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
  assert.strict.deepEqual(
    decodeRequestTrait(d),
    GetPostById({
      postId: 100000
    })
  );
});

suite.test('it should encode types with buffers in it', () => {
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
  assert.strict.deepEqual(
    decodeMsg(d),
    msg({
      data
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
  assert.strict.deepEqual(
    decodeSimpleTupleTest(d),
    simpleTupleTest({
      a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null],
      b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
    })
  );
});

suite.test('it should support tuple inside tuple types', () => {
  const a1 = tupleTupleTest({
    a: [[0, '', []], 0, '', 0.0]
  });
  assert.strict.equal(updateTupleTupleTest(a1, {}), a1);
  assert.strict.deepEqual(
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

suite.test(
  'it should change type with tuple reference only when changes are made',
  () => {
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
    assert.strict.deepEqual(
      updateSimpleTupleTest(a1, {
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], '']
      }),
      simpleTupleTest({
        a: [1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], ''],
        b: [[1, 1.1234567165374756, 0.123456789, [1, 2, 3, 4], null]]
      })
    );
  }
);

suite.test('it should compare tuples', () => {
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
});

suite.test(
  'it should update types with parameters that are using trait types',
  () => {
    const a1 = defaultTest();
    assert.strict.equal(
      updateTest(a1, {
        traitParam: A({
          a: 0
        })
      }),
      a1
    );
    const a2 = test({
      traitParam: A({
        a: 1
      })
    });
    assert.strict.deepEqual(
      updateTest(a2, {
        traitParam: C({
          a: 2.5
        })
      }),
      test({
        traitParam: C({
          a: 2.5
        })
      })
    );
  }
);

suite.test(
  'it should encode types with parameters using long generic type',
  async () => {
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
    assert.strict.deepEqual(
      decodeA(d),
      A({
        a: '-100000000'
      })
    );
    assert.strict.deepEqual(
      decodeB(d),
      B({
        a: '10000'
      })
    );
    assert.strict.deepEqual(
      decodeC(d),
      C({
        a: '-100000000',
        b: '10000',
        c: -200000
      })
    );
  }
);

export default suite;
