import { User } from './User';
import { Conversations } from './conversation/index';
import { ISerializer } from './__types__';
import { IDeserializer } from './__types__';
import JSBI from 'jsbi';
import { isUserTrait } from './User';
import { encodeUserTrait } from './User';
import { decodeUserTrait } from './User';
import { compareUserTrait } from './User';
import { IRequest } from './__types__';
export interface testMap {
  _name: 'schema.testMap';
  a: ReadonlyMap<string, string>;
}
export function isTestMap(value: unknown): value is testMap {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.testMap'
    )
  )
    return false;
  if (
    !(
      'a' in value &&
      ((__v0) =>
        __v0 instanceof Map &&
        Array.from(__v0).every(
          ([k, v]) => typeof k === 'string' && typeof v === 'string'
        ))(value['a'])
    )
  )
    return false;
  return true;
}
export interface testMapInputParams {
  a: ReadonlyMap<string, string>;
}
export function testMap(params: testMapInputParams): testMap {
  return {
    _name: 'schema.testMap',
    a: params['a'],
  };
}
export function encodeTestMap(__s: ISerializer, value: testMap) {
  __s.writeInt32(1326441943);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  __s.writeUint32(__pv0.size);
  for (const [__k1, __v1] of __pv0) {
    __s.writeString(__k1);
    __s.writeString(__v1);
  }
}
export function decodeTestMap(__d: IDeserializer): testMap | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 1326441943) return null;
  let a: Map<string, string>;
  /**
   * decoding param: a
   */
  const __l1 = __d.readUint32();
  const __o1 = new Map<string, string>();
  a = __o1;
  let __k1: string;
  let __v1: string;
  for (let __i1 = 0; __i1 < __l1; __i1++) {
    __k1 = __d.readString();
    __v1 = __d.readString();
    __o1.set(__k1, __v1);
  }
  return {
    _name: 'schema.testMap',
    a,
  };
}
export function defaultTestMap(
  params: Partial<testMapInputParams> = {}
): testMap {
  return testMap({
    a: new Map<string, string>(),
    ...params,
  });
}
export function compareTestMap(__a: testMap, __b: testMap): boolean {
  return (
    /**
     * compare parameter a
     */
    ((l1, l2) =>
      l1.every(([k1, v1], i) =>
        ((__v20) =>
          typeof __v20 === 'undefined'
            ? false
            : k1 === __v20[0] && v1 === __v20[1])(l2[i])
      ))(Array.from(__a['a']), Array.from(__b['a']))
  );
}
export function updateTestMap(
  value: testMap,
  changes: Partial<testMapInputParams>
) {
  if (typeof changes['a'] !== 'undefined') {
    if (
      !((l1, l2) =>
        l1.every(([k1, v1], i) =>
          ((__v21) =>
            typeof __v21 === 'undefined'
              ? false
              : k1 === __v21[0] && v1 === __v21[1])(l2[i])
        ))(Array.from(changes['a']), Array.from(value['a']))
    ) {
      value = testMap({
        ...value,
        a: changes['a'],
      });
    }
  }
  return value;
}
export interface testBigInt {
  _name: 'schema.testBigInt';
  beforeA: string;
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
  f: string;
}
export function isTestBigInt(value: unknown): value is testBigInt {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.testBigInt'
    )
  )
    return false;
  if (
    !(
      'beforeA' in value &&
      ((__v0) =>
        typeof __v0 === 'string' &&
        ((__bigintValue0) =>
          JSBI.greaterThanOrEqual(
            __bigintValue0,
            JSBI.BigInt(
              '-57406534763712726211641660058884099201115885104434760023882136841288313069618515692832974315825313495922298231949373138672355948043152766571296567808332659269564994572656140000344389574120022435714463495031743122390807731823194181973658513020233176985452498279081199404472314802811655824768082110985166340672084454492229252801189742403957029450467388250214501358353312915261004066118140645880633941658603299497698209063510889929202021079926591625770444716951045960277478891794836019580040978608315291377690212791863007764174393209716027254457637891941312587717764400411421385408982726881092425574514688'
            )
          ) &&
          JSBI.lessThanOrEqual(
            __bigintValue0,
            JSBI.BigInt(
              '57406534763712726211641660058884099201115885104434760023882136841288313069618515692832974315825313495922298231949373138672355948043152766571296567808332659269564994572656140000344389574120022435714463495031743122390807731823194181973658513020233176985452498279081199404472314802811655824768082110985166340672084454492229252801189742403957029450467388250214501358353312915261004066118140645880633941658603299497698209063510889929202021079926591625770444716951045960277478891794836019580040978608315291377690212791863007764174393209716027254457637891941312587717764400411421385408982726881092425574514687'
            )
          ))(JSBI.BigInt(__v0)))(value['beforeA'])
    )
  )
    return false;
  if (
    !(
      'a' in value &&
      ((__v2) =>
        typeof __v2 === 'string' &&
        ((__bigintValue2) =>
          JSBI.greaterThanOrEqual(
            __bigintValue2,
            JSBI.BigInt(
              '-89884656743115795386465259539451236680898848947115328636715040578866337902750481566354238661203768010560056939935696678829394884407208311246423715319737062188883946712432742638151109800623047059726541476042502884419075341171231440736956555270413618581675255342293149119973622969239858152417678164812112068608'
            )
          ) &&
          JSBI.lessThanOrEqual(
            __bigintValue2,
            JSBI.BigInt(
              '89884656743115795386465259539451236680898848947115328636715040578866337902750481566354238661203768010560056939935696678829394884407208311246423715319737062188883946712432742638151109800623047059726541476042502884419075341171231440736956555270413618581675255342293149119973622969239858152417678164812112068607'
            )
          ))(JSBI.BigInt(__v2)))(value['a'])
    )
  )
    return false;
  if (
    !(
      'b' in value &&
      ((__v4) =>
        typeof __v4 === 'string' &&
        ((__bigintValue4) =>
          JSBI.greaterThanOrEqual(
            __bigintValue4,
            JSBI.BigInt(
              '-6703903964971298549787012499102923063739682910296196688861780721860882015036773488400937149083451713845015929093243025426876941405973284973216824503042048'
            )
          ) &&
          JSBI.lessThanOrEqual(
            __bigintValue4,
            JSBI.BigInt(
              '6703903964971298549787012499102923063739682910296196688861780721860882015036773488400937149083451713845015929093243025426876941405973284973216824503042047'
            )
          ))(JSBI.BigInt(__v4)))(value['b'])
    )
  )
    return false;
  if (
    !(
      'c' in value &&
      ((__v6) =>
        typeof __v6 === 'string' &&
        ((__bigintValue6) =>
          JSBI.greaterThanOrEqual(
            __bigintValue6,
            JSBI.BigInt(
              '-57896044618658097711785492504343953926634992332820282019728792003956564819968'
            )
          ) &&
          JSBI.lessThanOrEqual(
            __bigintValue6,
            JSBI.BigInt(
              '57896044618658097711785492504343953926634992332820282019728792003956564819967'
            )
          ))(JSBI.BigInt(__v6)))(value['c'])
    )
  )
    return false;
  if (
    !(
      'd' in value &&
      ((__v8) =>
        typeof __v8 === 'string' &&
        ((__bigintValue8) =>
          JSBI.greaterThanOrEqual(
            __bigintValue8,
            JSBI.BigInt('-170141183460469231731687303715884105728')
          ) &&
          JSBI.lessThanOrEqual(
            __bigintValue8,
            JSBI.BigInt('170141183460469231731687303715884105727')
          ))(JSBI.BigInt(__v8)))(value['d'])
    )
  )
    return false;
  if (
    !(
      'e' in value &&
      ((__v10) =>
        typeof __v10 === 'string' &&
        ((__bigintValue10) =>
          JSBI.greaterThanOrEqual(
            __bigintValue10,
            JSBI.BigInt('-9223372036854775808')
          ) &&
          JSBI.lessThanOrEqual(
            __bigintValue10,
            JSBI.BigInt('9223372036854775807')
          ))(JSBI.BigInt(__v10)))(value['e'])
    )
  )
    return false;
  if (
    !(
      'f' in value &&
      ((__v12) =>
        typeof __v12 === 'string' &&
        ((__bigintValue12) =>
          JSBI.greaterThanOrEqual(
            __bigintValue12,
            JSBI.BigInt('-2147483648')
          ) &&
          JSBI.lessThanOrEqual(__bigintValue12, JSBI.BigInt('2147483647')))(
          JSBI.BigInt(__v12)
        ))(value['f'])
    )
  )
    return false;
  return true;
}
export interface testBigIntInputParams {
  beforeA: string;
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
  f: string;
}
export function testBigInt(params: testBigIntInputParams): testBigInt {
  return {
    _name: 'schema.testBigInt',
    beforeA: params['beforeA'],
    a: params['a'],
    b: params['b'],
    c: params['c'],
    d: params['d'],
    e: params['e'],
    f: params['f'],
  };
}
export function encodeTestBigInt(__s: ISerializer, value: testBigInt) {
  __s.writeInt32(328647898);
  /**
   * encoding param: beforeA
   */
  const __pv0 = value['beforeA'];
  __s.writeSignedBigInt(__pv0, 2000);
  /**
   * encoding param: a
   */
  const __pv2 = value['a'];
  __s.writeSignedBigInt(__pv2, 1024);
  /**
   * encoding param: b
   */
  const __pv4 = value['b'];
  __s.writeSignedBigInt(__pv4, 512);
  /**
   * encoding param: c
   */
  const __pv6 = value['c'];
  __s.writeSignedBigInt(__pv6, 256);
  /**
   * encoding param: d
   */
  const __pv8 = value['d'];
  __s.writeSignedBigInt(__pv8, 128);
  /**
   * encoding param: e
   */
  const __pv10 = value['e'];
  __s.writeSignedBigInt(__pv10, 64);
  /**
   * encoding param: f
   */
  const __pv12 = value['f'];
  __s.writeSignedBigInt(__pv12, 32);
}
export function decodeTestBigInt(__d: IDeserializer): testBigInt | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 328647898) return null;
  let beforeA: string;
  let a: string;
  let b: string;
  let c: string;
  let d: string;
  let e: string;
  let f: string;
  /**
   * decoding param: beforeA
   */
  beforeA = __d.readSignedBigInt(2000);
  /**
   * decoding param: a
   */
  a = __d.readSignedBigInt(1024);
  /**
   * decoding param: b
   */
  b = __d.readSignedBigInt(512);
  /**
   * decoding param: c
   */
  c = __d.readSignedBigInt(256);
  /**
   * decoding param: d
   */
  d = __d.readSignedBigInt(128);
  /**
   * decoding param: e
   */
  e = __d.readSignedBigInt(64);
  /**
   * decoding param: f
   */
  f = __d.readSignedBigInt(32);
  return {
    _name: 'schema.testBigInt',
    beforeA,
    a,
    b,
    c,
    d,
    e,
    f,
  };
}
export function defaultTestBigInt(
  params: Partial<testBigIntInputParams> = {}
): testBigInt {
  return testBigInt({
    beforeA: '0',
    a: '0',
    b: '0',
    c: '0',
    d: '0',
    e: '0',
    f: '0',
    ...params,
  });
}
export function compareTestBigInt(__a: testBigInt, __b: testBigInt): boolean {
  return (
    /**
     * compare parameter beforeA
     */
    ((a, b) => JSBI.equal(a, b))(
      JSBI.BigInt(__a['beforeA']),
      JSBI.BigInt(__b['beforeA'])
    ) &&
    /**
     * compare parameter a
     */
    ((a, b) => JSBI.equal(a, b))(
      JSBI.BigInt(__a['a']),
      JSBI.BigInt(__b['a'])
    ) &&
    /**
     * compare parameter b
     */
    ((a, b) => JSBI.equal(a, b))(
      JSBI.BigInt(__a['b']),
      JSBI.BigInt(__b['b'])
    ) &&
    /**
     * compare parameter c
     */
    ((a, b) => JSBI.equal(a, b))(
      JSBI.BigInt(__a['c']),
      JSBI.BigInt(__b['c'])
    ) &&
    /**
     * compare parameter d
     */
    ((a, b) => JSBI.equal(a, b))(
      JSBI.BigInt(__a['d']),
      JSBI.BigInt(__b['d'])
    ) &&
    /**
     * compare parameter e
     */
    ((a, b) => JSBI.equal(a, b))(
      JSBI.BigInt(__a['e']),
      JSBI.BigInt(__b['e'])
    ) &&
    /**
     * compare parameter f
     */
    ((a, b) => JSBI.equal(a, b))(JSBI.BigInt(__a['f']), JSBI.BigInt(__b['f']))
  );
}
export function updateTestBigInt(
  value: testBigInt,
  changes: Partial<testBigIntInputParams>
) {
  if (typeof changes['beforeA'] !== 'undefined') {
    if (
      !((a, b) => JSBI.equal(a, b))(
        JSBI.BigInt(changes['beforeA']),
        JSBI.BigInt(value['beforeA'])
      )
    ) {
      value = testBigInt({
        ...value,
        beforeA: changes['beforeA'],
      });
    }
  }
  if (typeof changes['a'] !== 'undefined') {
    if (
      !((a, b) => JSBI.equal(a, b))(
        JSBI.BigInt(changes['a']),
        JSBI.BigInt(value['a'])
      )
    ) {
      value = testBigInt({
        ...value,
        a: changes['a'],
      });
    }
  }
  if (typeof changes['b'] !== 'undefined') {
    if (
      !((a, b) => JSBI.equal(a, b))(
        JSBI.BigInt(changes['b']),
        JSBI.BigInt(value['b'])
      )
    ) {
      value = testBigInt({
        ...value,
        b: changes['b'],
      });
    }
  }
  if (typeof changes['c'] !== 'undefined') {
    if (
      !((a, b) => JSBI.equal(a, b))(
        JSBI.BigInt(changes['c']),
        JSBI.BigInt(value['c'])
      )
    ) {
      value = testBigInt({
        ...value,
        c: changes['c'],
      });
    }
  }
  if (typeof changes['d'] !== 'undefined') {
    if (
      !((a, b) => JSBI.equal(a, b))(
        JSBI.BigInt(changes['d']),
        JSBI.BigInt(value['d'])
      )
    ) {
      value = testBigInt({
        ...value,
        d: changes['d'],
      });
    }
  }
  if (typeof changes['e'] !== 'undefined') {
    if (
      !((a, b) => JSBI.equal(a, b))(
        JSBI.BigInt(changes['e']),
        JSBI.BigInt(value['e'])
      )
    ) {
      value = testBigInt({
        ...value,
        e: changes['e'],
      });
    }
  }
  if (typeof changes['f'] !== 'undefined') {
    if (
      !((a, b) => JSBI.equal(a, b))(
        JSBI.BigInt(changes['f']),
        JSBI.BigInt(value['f'])
      )
    ) {
      value = testBigInt({
        ...value,
        f: changes['f'],
      });
    }
  }
  return value;
}
export interface testMap2 {
  _name: 'schema.testMap2';
  a: ReadonlyMap<string | null, string>;
  b: ReadonlyMap<string | null, [string, ReadonlyMap<number, number>]>;
}
export function isTestMap2(value: unknown): value is testMap2 {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.testMap2'
    )
  )
    return false;
  if (
    !(
      'a' in value &&
      ((__v0) =>
        __v0 instanceof Map &&
        Array.from(__v0).every(([k, v]) =>
          k === null
            ? true
            : ((x) => typeof x === 'string')(k) && typeof v === 'string'
        ))(value['a'])
    )
  )
    return false;
  if (
    !(
      'b' in value &&
      ((__v4) =>
        __v4 instanceof Map &&
        Array.from(__v4).every(([k, v]) =>
          k === null
            ? true
            : ((x) => typeof x === 'string')(k) &&
              Array.isArray(v) &&
              v.length === 2 &&
              ((a) => typeof a === 'string')(v[0]) &&
              ((a) =>
                a instanceof Map &&
                Array.from(a).every(
                  ([k, v]) =>
                    typeof k === 'number' &&
                    JSBI.equal(JSBI.BigInt(k), JSBI.BigInt(k)) &&
                    JSBI.greaterThanOrEqual(
                      JSBI.BigInt(k),
                      JSBI.BigInt('-2147483648')
                    ) &&
                    JSBI.lessThanOrEqual(
                      JSBI.BigInt(k),
                      JSBI.BigInt('2147483647')
                    ) &&
                    typeof v === 'number' &&
                    JSBI.equal(JSBI.BigInt(v), JSBI.BigInt(v)) &&
                    JSBI.greaterThanOrEqual(
                      JSBI.BigInt(v),
                      JSBI.BigInt('-2147483648')
                    ) &&
                    JSBI.lessThanOrEqual(
                      JSBI.BigInt(v),
                      JSBI.BigInt('2147483647')
                    )
                ))(v[1])
        ))(value['b'])
    )
  )
    return false;
  return true;
}
export interface testMap2InputParams {
  a: ReadonlyMap<string | null, string>;
  b: ReadonlyMap<string | null, [string, ReadonlyMap<number, number>]>;
}
export function testMap2(params: testMap2InputParams): testMap2 {
  return {
    _name: 'schema.testMap2',
    a: params['a'],
    b: params['b'],
  };
}
export function encodeTestMap2(__s: ISerializer, value: testMap2) {
  __s.writeInt32(-42313774);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  __s.writeUint32(__pv0.size);
  for (const [__k1, __v1] of __pv0) {
    if (__k1 === null) {
      __s.writeUint8(0);
    } else {
      __s.writeUint8(1);
      __s.writeString(__k1);
    }
    __s.writeString(__v1);
  }
  /**
   * encoding param: b
   */
  const __pv4 = value['b'];
  __s.writeUint32(__pv4.size);
  for (const [__k5, __v5] of __pv4) {
    if (__k5 === null) {
      __s.writeUint8(0);
    } else {
      __s.writeUint8(1);
      __s.writeString(__k5);
    }
    const __t8 = __v5[0];
    __s.writeString(__t8);
    const __t9 = __v5[1];
    __s.writeUint32(__t9.size);
    for (const [__k11, __v11] of __t9) {
      __s.writeInt32(__k11);
      __s.writeInt32(__v11);
    }
  }
}
export function decodeTestMap2(__d: IDeserializer): testMap2 | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -42313774) return null;
  let a: Map<string | null, string>;
  let b: Map<string | null, [string, Map<number, number>]>;
  /**
   * decoding param: a
   */
  const __l1 = __d.readUint32();
  const __o1 = new Map<string | null, string>();
  a = __o1;
  let __k1: string | null;
  let __v1: string;
  for (let __i1 = 0; __i1 < __l1; __i1++) {
    if (__d.readUint8() === 1) {
      __k1 = __d.readString();
    } else {
      __k1 = null;
    }
    __v1 = __d.readString();
    __o1.set(__k1, __v1);
  }
  /**
   * decoding param: b
   */
  const __l5 = __d.readUint32();
  const __o5 = new Map<string | null, [string, Map<number, number>]>();
  b = __o5;
  let __k5: string | null;
  let __v5: [string, Map<number, number>];
  for (let __i5 = 0; __i5 < __l5; __i5++) {
    if (__d.readUint8() === 1) {
      __k5 = __d.readString();
    } else {
      __k5 = null;
    }
    let __e8: string;
    __e8 = __d.readString();
    let __e9: Map<number, number>;
    const __l10 = __d.readUint32();
    const __o10 = new Map<number, number>();
    __e9 = __o10;
    let __k10: number;
    let __v10: number;
    for (let __i10 = 0; __i10 < __l10; __i10++) {
      __k10 = __d.readInt32();
      __v10 = __d.readInt32();
      __o10.set(__k10, __v10);
    }
    __v5 = [__e8, __e9];
    __o5.set(__k5, __v5);
  }
  return {
    _name: 'schema.testMap2',
    a,
    b,
  };
}
export function defaultTestMap2(
  params: Partial<testMap2InputParams> = {}
): testMap2 {
  return testMap2({
    a: new Map<string | null, string>(),
    b: new Map<string | null, [string, Map<number, number>]>(),
    ...params,
  });
}
export function compareTestMap2(__a: testMap2, __b: testMap2): boolean {
  return (
    /**
     * compare parameter a
     */
    ((l1, l2) =>
      l1.every(([k1, v1], i) =>
        ((__v20) =>
          typeof __v20 === 'undefined'
            ? false
            : ((__dp11, __dp12) =>
                __dp11 !== null && __dp12 !== null
                  ? __dp11 === __dp12
                  : __dp11 === __dp12)(k1, __v20[0]) && v1 === __v20[1])(l2[i])
      ))(Array.from(__a['a']), Array.from(__b['a'])) &&
    /**
     * compare parameter b
     */
    ((l1, l2) =>
      l1.every(([k1, v1], i) =>
        ((__v21) =>
          typeof __v21 === 'undefined'
            ? false
            : ((__dp21, __dp22) =>
                __dp21 !== null && __dp22 !== null
                  ? __dp21 === __dp22
                  : __dp21 === __dp22)(k1, __v21[0]) &&
              /* compare tuple item 0 of type string */ ((__a40, __b40) =>
                __a40 === __b40)(v1[0], __v21[1][0]) &&
              /* compare tuple item 1 of type ReadonlyMap<number, number> */ ((
                __a41,
                __b41
              ) =>
                ((l1, l2) =>
                  l1.every(([k1, v1], i) =>
                    ((__v27) =>
                      typeof __v27 === 'undefined'
                        ? false
                        : k1 === __v27[0] && v1 === __v27[1])(l2[i])
                  ))(Array.from(__a41), Array.from(__b41)))(
                v1[1],
                __v21[1][1]
              ))(l2[i])
      ))(Array.from(__a['b']), Array.from(__b['b']))
  );
}
export function updateTestMap2(
  value: testMap2,
  changes: Partial<testMap2InputParams>
) {
  if (typeof changes['a'] !== 'undefined') {
    if (
      !((l1, l2) =>
        l1.every(([k1, v1], i) =>
          ((__v21) =>
            typeof __v21 === 'undefined'
              ? false
              : ((__dp21, __dp22) =>
                  __dp21 !== null && __dp22 !== null
                    ? __dp21 === __dp22
                    : __dp21 === __dp22)(k1, __v21[0]) && v1 === __v21[1])(
            l2[i]
          )
        ))(Array.from(changes['a']), Array.from(value['a']))
    ) {
      value = testMap2({
        ...value,
        a: changes['a'],
      });
    }
  }
  if (typeof changes['b'] !== 'undefined') {
    if (
      !((l1, l2) =>
        l1.every(([k1, v1], i) =>
          ((__v25) =>
            typeof __v25 === 'undefined'
              ? false
              : ((__dp61, __dp62) =>
                  __dp61 !== null && __dp62 !== null
                    ? __dp61 === __dp62
                    : __dp61 === __dp62)(k1, __v25[0]) &&
                /* compare tuple item 0 of type string */ ((__a80, __b80) =>
                  __a80 === __b80)(v1[0], __v25[1][0]) &&
                /* compare tuple item 1 of type ReadonlyMap<number, number> */ ((
                  __a81,
                  __b81
                ) =>
                  ((l1, l2) =>
                    l1.every(([k1, v1], i) =>
                      ((__v211) =>
                        typeof __v211 === 'undefined'
                          ? false
                          : k1 === __v211[0] && v1 === __v211[1])(l2[i])
                    ))(Array.from(__a81), Array.from(__b81)))(
                  v1[1],
                  __v25[1][1]
                ))(l2[i])
        ))(Array.from(changes['b']), Array.from(value['b']))
    ) {
      value = testMap2({
        ...value,
        b: changes['b'],
      });
    }
  }
  return value;
}
export interface testMap3 {
  _name: 'schema.testMap3';
  a: ReadonlyMap<Readonly<testMap2>, string>;
}
export function isTestMap3(value: unknown): value is testMap3 {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.testMap3'
    )
  )
    return false;
  if (
    !(
      'a' in value &&
      ((__v0) =>
        __v0 instanceof Map &&
        Array.from(__v0).every(
          ([k, v]) => isTestMap2(k) && typeof v === 'string'
        ))(value['a'])
    )
  )
    return false;
  return true;
}
export interface testMap3InputParams {
  a: ReadonlyMap<Readonly<testMap2>, string>;
}
export function testMap3(params: testMap3InputParams): testMap3 {
  return {
    _name: 'schema.testMap3',
    a: params['a'],
  };
}
export function encodeTestMap3(__s: ISerializer, value: testMap3) {
  __s.writeInt32(263728261);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  __s.writeUint32(__pv0.size);
  for (const [__k1, __v1] of __pv0) {
    encodeTestMap2(__s, __k1);
    __s.writeString(__v1);
  }
}
export function decodeTestMap3(__d: IDeserializer): testMap3 | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 263728261) return null;
  let a: Map<testMap2, string>;
  /**
   * decoding param: a
   */
  const __l1 = __d.readUint32();
  const __o1 = new Map<testMap2, string>();
  a = __o1;
  let __k1: testMap2;
  let __v1: string;
  for (let __i1 = 0; __i1 < __l1; __i1++) {
    const __tmp2 = decodeTestMap2(__d);
    if (__tmp2 === null) return null;
    __k1 = __tmp2;
    __v1 = __d.readString();
    __o1.set(__k1, __v1);
  }
  return {
    _name: 'schema.testMap3',
    a,
  };
}
export function defaultTestMap3(
  params: Partial<testMap3InputParams> = {}
): testMap3 {
  return testMap3({
    a: new Map<testMap2, string>(),
    ...params,
  });
}
export function compareTestMap3(__a: testMap3, __b: testMap3): boolean {
  return (
    /**
     * compare parameter a
     */
    ((l1, l2) =>
      l1.every(([k1, v1], i) =>
        ((__v20) =>
          typeof __v20 === 'undefined'
            ? false
            : compareTestMap2(k1, __v20[0]) && v1 === __v20[1])(l2[i])
      ))(Array.from(__a['a']), Array.from(__b['a']))
  );
}
export function updateTestMap3(
  value: testMap3,
  changes: Partial<testMap3InputParams>
) {
  if (typeof changes['a'] !== 'undefined') {
    if (
      !((l1, l2) =>
        l1.every(([k1, v1], i) =>
          ((__v21) =>
            typeof __v21 === 'undefined'
              ? false
              : compareTestMap2(k1, __v21[0]) && v1 === __v21[1])(l2[i])
        ))(Array.from(changes['a']), Array.from(value['a']))
    ) {
      value = testMap3({
        ...value,
        a: changes['a'],
      });
    }
  }
  return value;
}
export interface testSet {
  _name: 'schema.testSet';
  a: ReadonlySet<string>;
  b: ReadonlySet<number>;
}
export function isTestSet(value: unknown): value is testSet {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.testSet'
    )
  )
    return false;
  if (
    !(
      'a' in value &&
      ((__v0) =>
        (Array.isArray(__v0) || __v0 instanceof Set) &&
        Array.from(__v0).every((p) => typeof p === 'string'))(value['a'])
    )
  )
    return false;
  if (
    !(
      'b' in value &&
      ((__v1) =>
        (Array.isArray(__v1) || __v1 instanceof Set) &&
        Array.from(__v1).every(
          (p) =>
            typeof p === 'number' &&
            JSBI.equal(JSBI.BigInt(p), JSBI.BigInt(p)) &&
            JSBI.greaterThanOrEqual(
              JSBI.BigInt(p),
              JSBI.BigInt('-2147483648')
            ) &&
            JSBI.lessThanOrEqual(JSBI.BigInt(p), JSBI.BigInt('2147483647'))
        ))(value['b'])
    )
  )
    return false;
  return true;
}
export interface testSetInputParams {
  a: ReadonlySet<string>;
  b: ReadonlySet<number>;
}
export function testSet(params: testSetInputParams): testSet {
  return {
    _name: 'schema.testSet',
    a: params['a'],
    b: params['b'],
  };
}
export function encodeTestSet(__s: ISerializer, value: testSet) {
  __s.writeInt32(1426622717);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  const __l1 = __pv0.size;
  __s.writeUint32(__l1);
  for (const __v1 of __pv0) {
    __s.writeString(__v1);
  }
  /**
   * encoding param: b
   */
  const __pv2 = value['b'];
  const __l3 = __pv2.size;
  __s.writeUint32(__l3);
  for (const __v3 of __pv2) {
    __s.writeInt32(__v3);
  }
}
export function decodeTestSet(__d: IDeserializer): testSet | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 1426622717) return null;
  let a: Set<string>;
  let b: Set<number>;
  /**
   * decoding param: a
   */
  let __tmp1: string;
  const __l1 = __d.readUint32();
  const __o1 = new Set<string>();
  a = __o1;
  for (let __i1 = 0; __i1 < __l1; __i1++) {
    __tmp1 = __d.readString();
    __o1.add(__tmp1);
  }
  /**
   * decoding param: b
   */
  let __tmp3: number;
  const __l3 = __d.readUint32();
  const __o3 = new Set<number>();
  b = __o3;
  for (let __i3 = 0; __i3 < __l3; __i3++) {
    __tmp3 = __d.readInt32();
    __o3.add(__tmp3);
  }
  return {
    _name: 'schema.testSet',
    a,
    b,
  };
}
export function defaultTestSet(
  params: Partial<testSetInputParams> = {}
): testSet {
  return testSet({
    a: new Set<string>(),
    b: new Set<number>(),
    ...params,
  });
}
export function compareTestSet(__a: testSet, __b: testSet): boolean {
  return (
    /**
     * compare parameter a
     */
    __a['a'].size === __b['a'].size &&
    Array.from(__a['a']).every((__originalItem0, __index0) =>
      typeof __originalItem0 === 'undefined'
        ? false
        : ((__item0) =>
            typeof __item0 === 'undefined'
              ? false
              : __originalItem0 === __item0)(Array.from(__b['a'])[__index0])
    ) &&
    /**
     * compare parameter b
     */
    __a['b'].size === __b['b'].size &&
    Array.from(__a['b']).every((__originalItem1, __index1) =>
      typeof __originalItem1 === 'undefined'
        ? false
        : ((__item1) =>
            typeof __item1 === 'undefined'
              ? false
              : __originalItem1 === __item1)(Array.from(__b['b'])[__index1])
    )
  );
}
export function updateTestSet(
  value: testSet,
  changes: Partial<testSetInputParams>
) {
  if (typeof changes['a'] !== 'undefined') {
    if (
      !(
        changes['a'].size === value['a'].size &&
        Array.from(changes['a']).every((__originalItem1, __index1) =>
          typeof __originalItem1 === 'undefined'
            ? false
            : ((__item1) =>
                typeof __item1 === 'undefined'
                  ? false
                  : __originalItem1 === __item1)(
                Array.from(value['a'])[__index1]
              )
        )
      )
    ) {
      value = testSet({
        ...value,
        a: changes['a'],
      });
    }
  }
  if (typeof changes['b'] !== 'undefined') {
    if (
      !(
        changes['b'].size === value['b'].size &&
        Array.from(changes['b']).every((__originalItem3, __index3) =>
          typeof __originalItem3 === 'undefined'
            ? false
            : ((__item3) =>
                typeof __item3 === 'undefined'
                  ? false
                  : __originalItem3 === __item3)(
                Array.from(value['b'])[__index3]
              )
        )
      )
    ) {
      value = testSet({
        ...value,
        b: changes['b'],
      });
    }
  }
  return value;
}
export interface testSet2 {
  _name: 'schema.testSet2';
  a: ReadonlySet<string>;
  b: ReadonlySet<ReadonlyMap<string, string>>;
  c: ReadonlySet<[number, number]>;
}
export function isTestSet2(value: unknown): value is testSet2 {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.testSet2'
    )
  )
    return false;
  if (
    !(
      'a' in value &&
      ((__v0) =>
        (Array.isArray(__v0) || __v0 instanceof Set) &&
        Array.from(__v0).every((p) => typeof p === 'string'))(value['a'])
    )
  )
    return false;
  if (
    !(
      'b' in value &&
      ((__v1) =>
        (Array.isArray(__v1) || __v1 instanceof Set) &&
        Array.from(__v1).every(
          (p) =>
            p instanceof Map &&
            Array.from(p).every(
              ([k, v]) => typeof k === 'string' && typeof v === 'string'
            )
        ))(value['b'])
    )
  )
    return false;
  if (
    !(
      'c' in value &&
      ((__v2) =>
        (Array.isArray(__v2) || __v2 instanceof Set) &&
        Array.from(__v2).every(
          (p) =>
            Array.isArray(p) &&
            p.length === 2 &&
            ((a) =>
              typeof a === 'number' &&
              JSBI.equal(JSBI.BigInt(a), JSBI.BigInt(a)) &&
              JSBI.greaterThanOrEqual(
                JSBI.BigInt(a),
                JSBI.BigInt('-2147483648')
              ) &&
              JSBI.lessThanOrEqual(JSBI.BigInt(a), JSBI.BigInt('2147483647')))(
              p[0]
            ) &&
            ((a) =>
              typeof a === 'number' &&
              JSBI.equal(JSBI.BigInt(a), JSBI.BigInt(a)) &&
              JSBI.greaterThanOrEqual(
                JSBI.BigInt(a),
                JSBI.BigInt('-2147483648')
              ) &&
              JSBI.lessThanOrEqual(JSBI.BigInt(a), JSBI.BigInt('2147483647')))(
              p[1]
            )
        ))(value['c'])
    )
  )
    return false;
  return true;
}
export interface testSet2InputParams {
  a: ReadonlySet<string>;
  b: ReadonlySet<ReadonlyMap<string, string>>;
  c: ReadonlySet<[number, number]>;
}
export function testSet2(params: testSet2InputParams): testSet2 {
  return {
    _name: 'schema.testSet2',
    a: params['a'],
    b: params['b'],
    c: params['c'],
  };
}
export function encodeTestSet2(__s: ISerializer, value: testSet2) {
  __s.writeInt32(1091514709);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  const __l1 = __pv0.size;
  __s.writeUint32(__l1);
  for (const __v1 of __pv0) {
    __s.writeString(__v1);
  }
  /**
   * encoding param: b
   */
  const __pv2 = value['b'];
  const __l3 = __pv2.size;
  __s.writeUint32(__l3);
  for (const __v3 of __pv2) {
    __s.writeUint32(__v3.size);
    for (const [__k4, __v4] of __v3) {
      __s.writeString(__k4);
      __s.writeString(__v4);
    }
  }
  /**
   * encoding param: c
   */
  const __pv6 = value['c'];
  const __l7 = __pv6.size;
  __s.writeUint32(__l7);
  for (const __v7 of __pv6) {
    const __t8 = __v7[0];
    __s.writeInt32(__t8);
    const __t9 = __v7[1];
    __s.writeInt32(__t9);
  }
}
export function decodeTestSet2(__d: IDeserializer): testSet2 | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 1091514709) return null;
  let a: Set<string>;
  let b: Set<Map<string, string>>;
  let c: Set<[number, number]>;
  /**
   * decoding param: a
   */
  let __tmp1: string;
  const __l1 = __d.readUint32();
  const __o1 = new Set<string>();
  a = __o1;
  for (let __i1 = 0; __i1 < __l1; __i1++) {
    __tmp1 = __d.readString();
    __o1.add(__tmp1);
  }
  /**
   * decoding param: b
   */
  let __tmp3: Map<string, string>;
  const __l3 = __d.readUint32();
  const __o3 = new Set<Map<string, string>>();
  b = __o3;
  for (let __i3 = 0; __i3 < __l3; __i3++) {
    const __l4 = __d.readUint32();
    const __o4 = new Map<string, string>();
    __tmp3 = __o4;
    let __k4: string;
    let __v4: string;
    for (let __i4 = 0; __i4 < __l4; __i4++) {
      __k4 = __d.readString();
      __v4 = __d.readString();
      __o4.set(__k4, __v4);
    }
    __o3.add(__tmp3);
  }
  /**
   * decoding param: c
   */
  let __tmp7: [number, number];
  const __l7 = __d.readUint32();
  const __o7 = new Set<[number, number]>();
  c = __o7;
  for (let __i7 = 0; __i7 < __l7; __i7++) {
    let __e8: number;
    __e8 = __d.readInt32();
    let __e9: number;
    __e9 = __d.readInt32();
    __tmp7 = [__e8, __e9];
    __o7.add(__tmp7);
  }
  return {
    _name: 'schema.testSet2',
    a,
    b,
    c,
  };
}
export function defaultTestSet2(
  params: Partial<testSet2InputParams> = {}
): testSet2 {
  return testSet2({
    a: new Set<string>(),
    b: new Set<Map<string, string>>(),
    c: new Set<[number, number]>(),
    ...params,
  });
}
export function compareTestSet2(__a: testSet2, __b: testSet2): boolean {
  return (
    /**
     * compare parameter a
     */
    __a['a'].size === __b['a'].size &&
    Array.from(__a['a']).every((__originalItem0, __index0) =>
      typeof __originalItem0 === 'undefined'
        ? false
        : ((__item0) =>
            typeof __item0 === 'undefined'
              ? false
              : __originalItem0 === __item0)(Array.from(__b['a'])[__index0])
    ) &&
    /**
     * compare parameter b
     */
    __a['b'].size === __b['b'].size &&
    Array.from(__a['b']).every((__originalItem1, __index1) =>
      typeof __originalItem1 === 'undefined'
        ? false
        : ((__item1) =>
            typeof __item1 === 'undefined'
              ? false
              : ((l1, l2) =>
                  l1.every(([k1, v1], i) =>
                    ((__v22) =>
                      typeof __v22 === 'undefined'
                        ? false
                        : k1 === __v22[0] && v1 === __v22[1])(l2[i])
                  ))(Array.from(__originalItem1), Array.from(__item1)))(
            Array.from(__b['b'])[__index1]
          )
    ) &&
    /**
     * compare parameter c
     */
    __a['c'].size === __b['c'].size &&
    Array.from(__a['c']).every((__originalItem2, __index2) =>
      typeof __originalItem2 === 'undefined'
        ? false
        : ((__item2) =>
            typeof __item2 === 'undefined'
              ? false
              : /* compare tuple item 0 of type number */ ((__a30, __b30) =>
                  __a30 === __b30)(__originalItem2[0], __item2[0]) &&
                /* compare tuple item 1 of type number */ ((__a31, __b31) =>
                  __a31 === __b31)(__originalItem2[1], __item2[1]))(
            Array.from(__b['c'])[__index2]
          )
    )
  );
}
export function updateTestSet2(
  value: testSet2,
  changes: Partial<testSet2InputParams>
) {
  if (typeof changes['a'] !== 'undefined') {
    if (
      !(
        changes['a'].size === value['a'].size &&
        Array.from(changes['a']).every((__originalItem1, __index1) =>
          typeof __originalItem1 === 'undefined'
            ? false
            : ((__item1) =>
                typeof __item1 === 'undefined'
                  ? false
                  : __originalItem1 === __item1)(
                Array.from(value['a'])[__index1]
              )
        )
      )
    ) {
      value = testSet2({
        ...value,
        a: changes['a'],
      });
    }
  }
  if (typeof changes['b'] !== 'undefined') {
    if (
      !(
        changes['b'].size === value['b'].size &&
        Array.from(changes['b']).every((__originalItem3, __index3) =>
          typeof __originalItem3 === 'undefined'
            ? false
            : ((__item3) =>
                typeof __item3 === 'undefined'
                  ? false
                  : ((l1, l2) =>
                      l1.every(([k1, v1], i) =>
                        ((__v24) =>
                          typeof __v24 === 'undefined'
                            ? false
                            : k1 === __v24[0] && v1 === __v24[1])(l2[i])
                      ))(Array.from(__originalItem3), Array.from(__item3)))(
                Array.from(value['b'])[__index3]
              )
        )
      )
    ) {
      value = testSet2({
        ...value,
        b: changes['b'],
      });
    }
  }
  if (typeof changes['c'] !== 'undefined') {
    if (
      !(
        changes['c'].size === value['c'].size &&
        Array.from(changes['c']).every((__originalItem7, __index7) =>
          typeof __originalItem7 === 'undefined'
            ? false
            : ((__item7) =>
                typeof __item7 === 'undefined'
                  ? false
                  : /* compare tuple item 0 of type number */ ((__a80, __b80) =>
                      __a80 === __b80)(__originalItem7[0], __item7[0]) &&
                    /* compare tuple item 1 of type number */ ((__a81, __b81) =>
                      __a81 === __b81)(__originalItem7[1], __item7[1]))(
                Array.from(value['c'])[__index7]
              )
        )
      )
    ) {
      value = testSet2({
        ...value,
        c: changes['c'],
      });
    }
  }
  return value;
}
export interface Void {
  _name: 'schema.Void';
}
export function isVoid(value: unknown): value is Void {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.Void'
    )
  )
    return false;
  return true;
}
export interface VoidInputParams {}
export function Void(_: VoidInputParams = {}): Void {
  return {
    _name: 'schema.Void',
  };
}
export function encodeVoid(__s: ISerializer, _: Void) {
  __s.writeInt32(189644707);
}
export function decodeVoid(__d: IDeserializer): Void | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 189644707) return null;
  return {
    _name: 'schema.Void',
  };
}
export function defaultVoid(params: Partial<VoidInputParams> = {}): Void {
  return Void({
    ...params,
  });
}
export function compareVoid(__a: Void, __b: Void): boolean {
  return true;
}
export function updateVoid(value: Void, _: Partial<VoidInputParams>) {
  return value;
}
export interface msg {
  _name: 'schema.msg';
  data: Uint8Array;
}
export function isMsg(value: unknown): value is msg {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.msg'
    )
  )
    return false;
  if (
    !('data' in value && ((__v0) => __v0 instanceof Uint8Array)(value['data']))
  )
    return false;
  return true;
}
export interface msgInputParams {
  data: Uint8Array;
}
export function msg(params: msgInputParams): msg {
  return {
    _name: 'schema.msg',
    data: params['data'],
  };
}
export function encodeMsg(__s: ISerializer, value: msg) {
  __s.writeInt32(-1103074928);
  /**
   * encoding param: data
   */
  const __pv0 = value['data'];
  __s.writeUint32(__pv0.byteLength);
  __s.writeBuffer(__pv0);
}
export function decodeMsg(__d: IDeserializer): msg | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -1103074928) return null;
  let data: Uint8Array;
  /**
   * decoding param: data
   */
  data = __d.readBuffer(__d.readUint32());
  return {
    _name: 'schema.msg',
    data,
  };
}
export function defaultMsg(params: Partial<msgInputParams> = {}): msg {
  return msg({
    data: new Uint8Array(0),
    ...params,
  });
}
export function compareMsg(__a: msg, __b: msg): boolean {
  return (
    /**
     * compare parameter data
     */
    __a['data'].byteLength === __b['data'].byteLength &&
    __a['data'].every((__byte, index) => __b['data'][index] === __byte)
  );
}
export function updateMsg(value: msg, changes: Partial<msgInputParams>) {
  if (typeof changes['data'] !== 'undefined') {
    if (
      !(
        changes['data'].byteLength === value['data'].byteLength &&
        changes['data'].every(
          (__byte, index) => value['data'][index] === __byte
        )
      )
    ) {
      value = msg({
        ...value,
        data: changes['data'],
      });
    }
  }
  return value;
}
export type Result = Readonly<Users> | Readonly<Posts>;
export function isResultTrait(value: unknown): value is Result {
  if (isUsers(value)) return true;
  if (isPosts(value)) return true;
  return false;
}
export function encodeResultTrait(__s: ISerializer, value: Result) {
  switch (value._name) {
    case 'schema.Users':
      return encodeUsers(__s, value);
    case 'schema.Posts':
      return encodePosts(__s, value);
  }
  throw new Error(
    `Failed to encode: Received invalid value on "_name" property. We got "${value['_name']}" value, but this function was expecting to receive one of the following:\n\t- schema.Users\n\t- schema.Posts\n\n\nPossible cause is that maybe this type simply does not extend this trait, and somehow the type-checking prevented you from calling this function wrongly.`
  );
}
export function decodeResultTrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewind(4);
  let value: Users | Posts;
  switch (__id) {
    case 1801329960: {
      const tmp = decodeUsers(__d);
      if (tmp === null) return null;
      value = tmp;
      break;
    }
    case 413461762: {
      const tmp = decodePosts(__d);
      if (tmp === null) return null;
      value = tmp;
      break;
    }
    default:
      return null;
  }
  return value;
}
export function defaultResultTrait() {
  return defaultUsers();
}
export function compareResultTrait(__a: Result, __b: Result) {
  switch (__a._name) {
    case 'schema.Users':
      if (__b._name !== 'schema.Users') return false;
      return compareUsers(__a, __b);
    case 'schema.Posts':
      if (__b._name !== 'schema.Posts') return false;
      return comparePosts(__a, __b);
  }
}
export interface Users {
  _name: 'schema.Users';
  users: ReadonlyArray<Readonly<User>>;
}
export function isUsers(value: unknown): value is Users {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.Users'
    )
  )
    return false;
  if (
    !(
      'users' in value &&
      ((__v0) =>
        (Array.isArray(__v0) || __v0 instanceof Set) &&
        Array.from(__v0).every((p) => isUserTrait(p)))(value['users'])
    )
  )
    return false;
  return true;
}
export interface UsersInputParams {
  users: ReadonlyArray<Readonly<User>>;
}
export function Users(params: UsersInputParams): Users {
  return {
    _name: 'schema.Users',
    users: params['users'],
  };
}
export function encodeUsers(__s: ISerializer, value: Users) {
  __s.writeInt32(1801329960);
  /**
   * encoding param: users
   */
  const __pv0 = value['users'];
  const __l1 = __pv0.length;
  __s.writeUint32(__l1);
  for (const __item1 of __pv0) {
    encodeUserTrait(__s, __item1);
  }
}
export function decodeUsers(__d: IDeserializer): Users | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 1801329960) return null;
  let users: Array<User>;
  /**
   * decoding param: users
   */
  const __l1 = __d.readUint32();
  const __o1 = new Array<User>(__l1);
  users = __o1;
  for (let __i1 = 0; __i1 < __l1; __i1++) {
    const tmp3 = decodeUserTrait(__d);
    if (tmp3 === null) return null;
    __o1[__i1] = tmp3;
  }
  return {
    _name: 'schema.Users',
    users,
  };
}
export function defaultUsers(params: Partial<UsersInputParams> = {}): Users {
  return Users({
    users: [],
    ...params,
  });
}
export function compareUsers(__a: Users, __b: Users): boolean {
  return (
    /**
     * compare parameter users
     */
    __a['users'].length === __b['users'].length &&
    Array.from(__a['users']).every((__originalItem0, __index0) =>
      typeof __originalItem0 === 'undefined'
        ? false
        : ((__item0) =>
            typeof __item0 === 'undefined'
              ? false
              : compareUserTrait(__originalItem0, __item0))(
            Array.from(__b['users'])[__index0]
          )
    )
  );
}
export function updateUsers(value: Users, changes: Partial<UsersInputParams>) {
  if (typeof changes['users'] !== 'undefined') {
    if (
      !(
        changes['users'].length === value['users'].length &&
        Array.from(changes['users']).every((__originalItem1, __index1) =>
          typeof __originalItem1 === 'undefined'
            ? false
            : ((__item1) =>
                typeof __item1 === 'undefined'
                  ? false
                  : compareUserTrait(__originalItem1, __item1))(
                Array.from(value['users'])[__index1]
              )
        )
      )
    ) {
      value = Users({
        ...value,
        users: changes['users'],
      });
    }
  }
  return value;
}
export interface GetUserById extends IRequest<Readonly<Users>> {
  _name: 'schema.GetUserById';
  userId: number;
}
export function isGetUserById(value: unknown): value is GetUserById {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.GetUserById'
    )
  )
    return false;
  if (
    !(
      'userId' in value &&
      ((__v0) =>
        typeof __v0 === 'number' &&
        JSBI.equal(JSBI.BigInt(__v0), JSBI.BigInt(__v0)) &&
        JSBI.greaterThanOrEqual(JSBI.BigInt(__v0), JSBI.BigInt('0')) &&
        JSBI.lessThanOrEqual(JSBI.BigInt(__v0), JSBI.BigInt('4294967295')))(
        value['userId']
      )
    )
  )
    return false;
  return true;
}
export interface GetUserByIdInputParams {
  userId: number;
}
export function GetUserById(params: GetUserByIdInputParams): GetUserById {
  return {
    _name: 'schema.GetUserById',
    userId: params['userId'],
  };
}
export function encodeGetUserById(__s: ISerializer, value: GetUserById) {
  __s.writeInt32(-2021730434);
  /**
   * encoding param: userId
   */
  const __pv0 = value['userId'];
  __s.writeUint32(__pv0);
}
export function decodeGetUserById(__d: IDeserializer): GetUserById | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -2021730434) return null;
  let userId: number;
  /**
   * decoding param: userId
   */
  userId = __d.readUint32();
  return {
    _name: 'schema.GetUserById',
    userId,
  };
}
export function defaultGetUserById(
  params: Partial<GetUserByIdInputParams> = {}
): GetUserById {
  return GetUserById({
    userId: 0,
    ...params,
  });
}
export function compareGetUserById(
  __a: GetUserById,
  __b: GetUserById
): boolean {
  return (
    /**
     * compare parameter userId
     */
    __a['userId'] === __b['userId']
  );
}
export function updateGetUserById(
  value: GetUserById,
  changes: Partial<GetUserByIdInputParams>
) {
  if (typeof changes['userId'] !== 'undefined') {
    if (!(changes['userId'] === value['userId'])) {
      value = GetUserById({
        ...value,
        userId: changes['userId'],
      });
    }
  }
  return value;
}
export interface Post {
  _name: 'schema.Post';
  id: number;
}
export function isPost(value: unknown): value is Post {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.Post'
    )
  )
    return false;
  if (
    !(
      'id' in value &&
      ((__v0) =>
        typeof __v0 === 'number' &&
        JSBI.equal(JSBI.BigInt(__v0), JSBI.BigInt(__v0)) &&
        JSBI.greaterThanOrEqual(
          JSBI.BigInt(__v0),
          JSBI.BigInt('-2147483648')
        ) &&
        JSBI.lessThanOrEqual(JSBI.BigInt(__v0), JSBI.BigInt('2147483647')))(
        value['id']
      )
    )
  )
    return false;
  return true;
}
export interface PostInputParams {
  id: number;
}
export function Post(params: PostInputParams): Post {
  return {
    _name: 'schema.Post',
    id: params['id'],
  };
}
export function encodePost(__s: ISerializer, value: Post) {
  __s.writeInt32(901140138);
  /**
   * encoding param: id
   */
  const __pv0 = value['id'];
  __s.writeInt32(__pv0);
}
export function decodePost(__d: IDeserializer): Post | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 901140138) return null;
  let id: number;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  return {
    _name: 'schema.Post',
    id,
  };
}
export function defaultPost(params: Partial<PostInputParams> = {}): Post {
  return Post({
    id: 0,
    ...params,
  });
}
export function comparePost(__a: Post, __b: Post): boolean {
  return (
    /**
     * compare parameter id
     */
    __a['id'] === __b['id']
  );
}
export function updatePost(value: Post, changes: Partial<PostInputParams>) {
  if (typeof changes['id'] !== 'undefined') {
    if (!(changes['id'] === value['id'])) {
      value = Post({
        ...value,
        id: changes['id'],
      });
    }
  }
  return value;
}
export interface Posts {
  _name: 'schema.Posts';
  posts: ReadonlyArray<Readonly<Post>>;
}
export function isPosts(value: unknown): value is Posts {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.Posts'
    )
  )
    return false;
  if (
    !(
      'posts' in value &&
      ((__v0) =>
        (Array.isArray(__v0) || __v0 instanceof Set) &&
        Array.from(__v0).every((p) => isPost(p)))(value['posts'])
    )
  )
    return false;
  return true;
}
export interface PostsInputParams {
  posts: ReadonlyArray<Readonly<Post>>;
}
export function Posts(params: PostsInputParams): Posts {
  return {
    _name: 'schema.Posts',
    posts: params['posts'],
  };
}
export function encodePosts(__s: ISerializer, value: Posts) {
  __s.writeInt32(413461762);
  /**
   * encoding param: posts
   */
  const __pv0 = value['posts'];
  const __l1 = __pv0.length;
  __s.writeUint32(__l1);
  for (const __item1 of __pv0) {
    encodePost(__s, __item1);
  }
}
export function decodePosts(__d: IDeserializer): Posts | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 413461762) return null;
  let posts: Array<Post>;
  /**
   * decoding param: posts
   */
  const __l1 = __d.readUint32();
  const __o1 = new Array<Post>(__l1);
  posts = __o1;
  for (let __i1 = 0; __i1 < __l1; __i1++) {
    const __tmp2 = decodePost(__d);
    if (__tmp2 === null) return null;
    __o1[__i1] = __tmp2;
  }
  return {
    _name: 'schema.Posts',
    posts,
  };
}
export function defaultPosts(params: Partial<PostsInputParams> = {}): Posts {
  return Posts({
    posts: [],
    ...params,
  });
}
export function comparePosts(__a: Posts, __b: Posts): boolean {
  return (
    /**
     * compare parameter posts
     */
    __a['posts'].length === __b['posts'].length &&
    Array.from(__a['posts']).every((__originalItem0, __index0) =>
      typeof __originalItem0 === 'undefined'
        ? false
        : ((__item0) =>
            typeof __item0 === 'undefined'
              ? false
              : comparePost(__originalItem0, __item0))(
            Array.from(__b['posts'])[__index0]
          )
    )
  );
}
export function updatePosts(value: Posts, changes: Partial<PostsInputParams>) {
  if (typeof changes['posts'] !== 'undefined') {
    if (
      !(
        changes['posts'].length === value['posts'].length &&
        Array.from(changes['posts']).every((__originalItem1, __index1) =>
          typeof __originalItem1 === 'undefined'
            ? false
            : ((__item1) =>
                typeof __item1 === 'undefined'
                  ? false
                  : comparePost(__originalItem1, __item1))(
                Array.from(value['posts'])[__index1]
              )
        )
      )
    ) {
      value = Posts({
        ...value,
        posts: changes['posts'],
      });
    }
  }
  return value;
}
export interface GetPostById extends IRequest<Readonly<Posts>> {
  _name: 'schema.GetPostById';
  postId: number;
}
export function isGetPostById(value: unknown): value is GetPostById {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.GetPostById'
    )
  )
    return false;
  if (
    !(
      'postId' in value &&
      ((__v0) =>
        typeof __v0 === 'number' &&
        JSBI.equal(JSBI.BigInt(__v0), JSBI.BigInt(__v0)) &&
        JSBI.greaterThanOrEqual(JSBI.BigInt(__v0), JSBI.BigInt('0')) &&
        JSBI.lessThanOrEqual(JSBI.BigInt(__v0), JSBI.BigInt('4294967295')))(
        value['postId']
      )
    )
  )
    return false;
  return true;
}
export interface GetPostByIdInputParams {
  postId: number;
}
export function GetPostById(params: GetPostByIdInputParams): GetPostById {
  return {
    _name: 'schema.GetPostById',
    postId: params['postId'],
  };
}
export function encodeGetPostById(__s: ISerializer, value: GetPostById) {
  __s.writeInt32(-1279409050);
  /**
   * encoding param: postId
   */
  const __pv0 = value['postId'];
  __s.writeUint32(__pv0);
}
export function decodeGetPostById(__d: IDeserializer): GetPostById | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -1279409050) return null;
  let postId: number;
  /**
   * decoding param: postId
   */
  postId = __d.readUint32();
  return {
    _name: 'schema.GetPostById',
    postId,
  };
}
export function defaultGetPostById(
  params: Partial<GetPostByIdInputParams> = {}
): GetPostById {
  return GetPostById({
    postId: 0,
    ...params,
  });
}
export function compareGetPostById(
  __a: GetPostById,
  __b: GetPostById
): boolean {
  return (
    /**
     * compare parameter postId
     */
    __a['postId'] === __b['postId']
  );
}
export function updateGetPostById(
  value: GetPostById,
  changes: Partial<GetPostByIdInputParams>
) {
  if (typeof changes['postId'] !== 'undefined') {
    if (!(changes['postId'] === value['postId'])) {
      value = GetPostById({
        ...value,
        postId: changes['postId'],
      });
    }
  }
  return value;
}
export interface GetConversations extends IRequest<Readonly<Conversations>> {
  _name: 'schema.GetConversations';
}
export function isGetConversations(value: unknown): value is GetConversations {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.GetConversations'
    )
  )
    return false;
  return true;
}
export interface GetConversationsInputParams {}
export function GetConversations(
  _: GetConversationsInputParams = {}
): GetConversations {
  return {
    _name: 'schema.GetConversations',
  };
}
export function encodeGetConversations(__s: ISerializer, _: GetConversations) {
  __s.writeInt32(-416881);
}
export function decodeGetConversations(
  __d: IDeserializer
): GetConversations | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -416881) return null;
  return {
    _name: 'schema.GetConversations',
  };
}
export function defaultGetConversations(
  params: Partial<GetConversationsInputParams> = {}
): GetConversations {
  return GetConversations({
    ...params,
  });
}
export function compareGetConversations(
  __a: GetConversations,
  __b: GetConversations
): boolean {
  return true;
}
export function updateGetConversations(
  value: GetConversations,
  _: Partial<GetConversationsInputParams>
) {
  return value;
}
export interface Coordinates {
  _name: 'schema.Coordinates';
  latitude: number;
  longitude: number;
}
export function isCoordinates(value: unknown): value is Coordinates {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.Coordinates'
    )
  )
    return false;
  if (
    !(
      'latitude' in value &&
      ((__v0) => typeof __v0 === 'number')(value['latitude'])
    )
  )
    return false;
  if (
    !(
      'longitude' in value &&
      ((__v1) => typeof __v1 === 'number')(value['longitude'])
    )
  )
    return false;
  return true;
}
export interface CoordinatesInputParams {
  latitude: number;
  longitude: number;
}
export function Coordinates(params: CoordinatesInputParams): Coordinates {
  return {
    _name: 'schema.Coordinates',
    latitude: params['latitude'],
    longitude: params['longitude'],
  };
}
export function encodeCoordinates(__s: ISerializer, value: Coordinates) {
  __s.writeInt32(-2145804928);
  /**
   * encoding param: latitude
   */
  const __pv0 = value['latitude'];
  __s.writeDouble(__pv0);
  /**
   * encoding param: longitude
   */
  const __pv1 = value['longitude'];
  __s.writeDouble(__pv1);
}
export function decodeCoordinates(__d: IDeserializer): Coordinates | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -2145804928) return null;
  let latitude: number;
  let longitude: number;
  /**
   * decoding param: latitude
   */
  latitude = __d.readDouble();
  /**
   * decoding param: longitude
   */
  longitude = __d.readDouble();
  return {
    _name: 'schema.Coordinates',
    latitude,
    longitude,
  };
}
export function defaultCoordinates(
  params: Partial<CoordinatesInputParams> = {}
): Coordinates {
  return Coordinates({
    latitude: 0.0,
    longitude: 0.0,
    ...params,
  });
}
export function compareCoordinates(
  __a: Coordinates,
  __b: Coordinates
): boolean {
  return (
    /**
     * compare parameter latitude
     */
    __a['latitude'] === __b['latitude'] &&
    /**
     * compare parameter longitude
     */
    __a['longitude'] === __b['longitude']
  );
}
export function updateCoordinates(
  value: Coordinates,
  changes: Partial<CoordinatesInputParams>
) {
  if (typeof changes['latitude'] !== 'undefined') {
    if (!(changes['latitude'] === value['latitude'])) {
      value = Coordinates({
        ...value,
        latitude: changes['latitude'],
      });
    }
  }
  if (typeof changes['longitude'] !== 'undefined') {
    if (!(changes['longitude'] === value['longitude'])) {
      value = Coordinates({
        ...value,
        longitude: changes['longitude'],
      });
    }
  }
  return value;
}
export interface ShouldSupportSeveralSequentialVectorParams {
  _name: 'schema.ShouldSupportSeveralSequentialVectorParams';
  a: ReadonlyArray<number>;
  b: ReadonlyArray<number>;
  c: ReadonlyArray<string>;
  d: ReadonlyArray<number>;
  e: ReadonlyArray<number>;
  f: ReadonlyArray<ReadonlyArray<number> | null>;
  g: [number, number, number, ReadonlyArray<number>, string | null];
}
export function isShouldSupportSeveralSequentialVectorParams(
  value: unknown
): value is ShouldSupportSeveralSequentialVectorParams {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.ShouldSupportSeveralSequentialVectorParams'
    )
  )
    return false;
  if (
    !(
      'a' in value &&
      ((__v0) =>
        (Array.isArray(__v0) || __v0 instanceof Set) &&
        Array.from(__v0).every(
          (p) =>
            typeof p === 'number' &&
            JSBI.equal(JSBI.BigInt(p), JSBI.BigInt(p)) &&
            JSBI.greaterThanOrEqual(
              JSBI.BigInt(p),
              JSBI.BigInt('-2147483648')
            ) &&
            JSBI.lessThanOrEqual(JSBI.BigInt(p), JSBI.BigInt('2147483647'))
        ))(value['a'])
    )
  )
    return false;
  if (
    !(
      'b' in value &&
      ((__v1) =>
        (Array.isArray(__v1) || __v1 instanceof Set) &&
        Array.from(__v1).every((p) => typeof p === 'number'))(value['b'])
    )
  )
    return false;
  if (
    !(
      'c' in value &&
      ((__v2) =>
        (Array.isArray(__v2) || __v2 instanceof Set) &&
        Array.from(__v2).every((p) => typeof p === 'string'))(value['c'])
    )
  )
    return false;
  if (
    !(
      'd' in value &&
      ((__v3) =>
        (Array.isArray(__v3) || __v3 instanceof Set) &&
        Array.from(__v3).every((p) => typeof p === 'number'))(value['d'])
    )
  )
    return false;
  if (
    !(
      'e' in value &&
      ((__v4) =>
        (Array.isArray(__v4) || __v4 instanceof Set) &&
        Array.from(__v4).every(
          (p) =>
            typeof p === 'number' &&
            JSBI.equal(JSBI.BigInt(p), JSBI.BigInt(p)) &&
            JSBI.greaterThanOrEqual(JSBI.BigInt(p), JSBI.BigInt('0')) &&
            JSBI.lessThanOrEqual(JSBI.BigInt(p), JSBI.BigInt('4294967295'))
        ))(value['e'])
    )
  )
    return false;
  if (
    !(
      'f' in value &&
      ((__v5) =>
        (Array.isArray(__v5) || __v5 instanceof Set) &&
        Array.from(__v5).every((p) =>
          p === null
            ? true
            : ((x) =>
                (Array.isArray(x) || x instanceof Set) &&
                Array.from(x).every(
                  (p) =>
                    typeof p === 'number' &&
                    JSBI.equal(JSBI.BigInt(p), JSBI.BigInt(p)) &&
                    JSBI.greaterThanOrEqual(JSBI.BigInt(p), JSBI.BigInt('0')) &&
                    JSBI.lessThanOrEqual(
                      JSBI.BigInt(p),
                      JSBI.BigInt('4294967295')
                    )
                ))(p)
        ))(value['f'])
    )
  )
    return false;
  if (
    !(
      'g' in value &&
      ((__v6) =>
        Array.isArray(__v6) &&
        __v6.length === 5 &&
        ((a) =>
          typeof a === 'number' &&
          JSBI.equal(JSBI.BigInt(a), JSBI.BigInt(a)) &&
          JSBI.greaterThanOrEqual(JSBI.BigInt(a), JSBI.BigInt('-2147483648')) &&
          JSBI.lessThanOrEqual(JSBI.BigInt(a), JSBI.BigInt('2147483647')))(
          __v6[0]
        ) &&
        ((a) => typeof a === 'number')(__v6[1]) &&
        ((a) => typeof a === 'number')(__v6[2]) &&
        ((a) =>
          (Array.isArray(a) || a instanceof Set) &&
          Array.from(a).every(
            (p) =>
              typeof p === 'number' &&
              JSBI.equal(JSBI.BigInt(p), JSBI.BigInt(p)) &&
              JSBI.greaterThanOrEqual(JSBI.BigInt(p), JSBI.BigInt('0')) &&
              JSBI.lessThanOrEqual(JSBI.BigInt(p), JSBI.BigInt('4294967295'))
          ))(__v6[3]) &&
        ((a) => (a === null ? true : ((x) => typeof x === 'string')(a)))(
          __v6[4]
        ))(value['g'])
    )
  )
    return false;
  return true;
}
export interface ShouldSupportSeveralSequentialVectorParamsInputParams {
  a: ReadonlyArray<number>;
  b: ReadonlyArray<number>;
  c: ReadonlyArray<string>;
  d: ReadonlyArray<number>;
  e: ReadonlyArray<number>;
  f: ReadonlyArray<ReadonlyArray<number> | null>;
  g: [number, number, number, ReadonlyArray<number>, string | null];
}
export function ShouldSupportSeveralSequentialVectorParams(
  params: ShouldSupportSeveralSequentialVectorParamsInputParams
): ShouldSupportSeveralSequentialVectorParams {
  return {
    _name: 'schema.ShouldSupportSeveralSequentialVectorParams',
    a: params['a'],
    b: params['b'],
    c: params['c'],
    d: params['d'],
    e: params['e'],
    f: params['f'],
    g: params['g'],
  };
}
export function encodeShouldSupportSeveralSequentialVectorParams(
  __s: ISerializer,
  value: ShouldSupportSeveralSequentialVectorParams
) {
  __s.writeInt32(-2007546384);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  const __l1 = __pv0.length;
  __s.writeUint32(__l1);
  for (const __item1 of __pv0) {
    __s.writeInt32(__item1);
  }
  /**
   * encoding param: b
   */
  const __pv2 = value['b'];
  const __l3 = __pv2.length;
  __s.writeUint32(__l3);
  for (const __item3 of __pv2) {
    __s.writeDouble(__item3);
  }
  /**
   * encoding param: c
   */
  const __pv4 = value['c'];
  const __l5 = __pv4.length;
  __s.writeUint32(__l5);
  for (const __item5 of __pv4) {
    __s.writeString(__item5);
  }
  /**
   * encoding param: d
   */
  const __pv6 = value['d'];
  const __l7 = __pv6.length;
  __s.writeUint32(__l7);
  for (const __item7 of __pv6) {
    __s.writeFloat(__item7);
  }
  /**
   * encoding param: e
   */
  const __pv8 = value['e'];
  const __l9 = __pv8.length;
  __s.writeUint32(__l9);
  for (const __item9 of __pv8) {
    __s.writeUint32(__item9);
  }
  /**
   * encoding param: f
   */
  const __pv10 = value['f'];
  const __l11 = __pv10.length;
  __s.writeUint32(__l11);
  for (const __item11 of __pv10) {
    if (__item11 === null) {
      __s.writeUint8(0);
    } else {
      __s.writeUint8(1);
      const __l13 = __item11.length;
      __s.writeUint32(__l13);
      for (const __item13 of __item11) {
        __s.writeUint32(__item13);
      }
    }
  }
  /**
   * encoding param: g
   */
  const __pv14 = value['g'];
  const __t15 = __pv14[0];
  __s.writeInt32(__t15);
  const __t16 = __pv14[1];
  __s.writeFloat(__t16);
  const __t18 = __pv14[2];
  __s.writeDouble(__t18);
  const __t21 = __pv14[3];
  const __l25 = __t21.length;
  __s.writeUint32(__l25);
  for (const __item25 of __t21) {
    __s.writeUint32(__item25);
  }
  const __t26 = __pv14[4];
  if (__t26 === null) {
    __s.writeUint8(0);
  } else {
    __s.writeUint8(1);
    __s.writeString(__t26);
  }
}
export function decodeShouldSupportSeveralSequentialVectorParams(
  __d: IDeserializer
): ShouldSupportSeveralSequentialVectorParams | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -2007546384) return null;
  let a: Array<number>;
  let b: Array<number>;
  let c: Array<string>;
  let d: Array<number>;
  let e: Array<number>;
  let f: Array<Array<number> | null>;
  let g: [number, number, number, Array<number>, string | null];
  /**
   * decoding param: a
   */
  const __l1 = __d.readUint32();
  const __o1 = new Array<number>(__l1);
  a = __o1;
  for (let __i1 = 0; __i1 < __l1; __i1++) {
    __o1[__i1] = __d.readInt32();
  }
  /**
   * decoding param: b
   */
  const __l3 = __d.readUint32();
  const __o3 = new Array<number>(__l3);
  b = __o3;
  for (let __i3 = 0; __i3 < __l3; __i3++) {
    __o3[__i3] = __d.readDouble();
  }
  /**
   * decoding param: c
   */
  const __l5 = __d.readUint32();
  const __o5 = new Array<string>(__l5);
  c = __o5;
  for (let __i5 = 0; __i5 < __l5; __i5++) {
    __o5[__i5] = __d.readString();
  }
  /**
   * decoding param: d
   */
  const __l7 = __d.readUint32();
  const __o7 = new Array<number>(__l7);
  d = __o7;
  for (let __i7 = 0; __i7 < __l7; __i7++) {
    __o7[__i7] = __d.readFloat();
  }
  /**
   * decoding param: e
   */
  const __l9 = __d.readUint32();
  const __o9 = new Array<number>(__l9);
  e = __o9;
  for (let __i9 = 0; __i9 < __l9; __i9++) {
    __o9[__i9] = __d.readUint32();
  }
  /**
   * decoding param: f
   */
  const __l11 = __d.readUint32();
  const __o11 = new Array<Array<number> | null>(__l11);
  f = __o11;
  for (let __i11 = 0; __i11 < __l11; __i11++) {
    if (__d.readUint8() === 1) {
      const __l13 = __d.readUint32();
      const __o13 = new Array<number>(__l13);
      __o11[__i11] = __o13;
      for (let __i13 = 0; __i13 < __l13; __i13++) {
        __o13[__i13] = __d.readUint32();
      }
    } else {
      __o11[__i11] = null;
    }
  }
  /**
   * decoding param: g
   */
  let __e15: number;
  __e15 = __d.readInt32();
  let __e16: number;
  __e16 = __d.readFloat();
  let __e17: number;
  __e17 = __d.readDouble();
  let __e18: Array<number>;
  const __l19 = __d.readUint32();
  const __o19 = new Array<number>(__l19);
  __e18 = __o19;
  for (let __i19 = 0; __i19 < __l19; __i19++) {
    __o19[__i19] = __d.readUint32();
  }
  let __e20: string | null;
  if (__d.readUint8() === 1) {
    __e20 = __d.readString();
  } else {
    __e20 = null;
  }
  g = [__e15, __e16, __e17, __e18, __e20];
  return {
    _name: 'schema.ShouldSupportSeveralSequentialVectorParams',
    a,
    b,
    c,
    d,
    e,
    f,
    g,
  };
}
export function defaultShouldSupportSeveralSequentialVectorParams(
  params: Partial<ShouldSupportSeveralSequentialVectorParamsInputParams> = {}
): ShouldSupportSeveralSequentialVectorParams {
  return ShouldSupportSeveralSequentialVectorParams({
    a: [],
    b: [],
    c: [],
    d: [],
    e: [],
    f: [],
    g: [0, 0.0, 0.0, [], null],
    ...params,
  });
}
export function compareShouldSupportSeveralSequentialVectorParams(
  __a: ShouldSupportSeveralSequentialVectorParams,
  __b: ShouldSupportSeveralSequentialVectorParams
): boolean {
  return (
    /**
     * compare parameter a
     */
    __a['a'].length === __b['a'].length &&
    Array.from(__a['a']).every((__originalItem0, __index0) =>
      typeof __originalItem0 === 'undefined'
        ? false
        : ((__item0) =>
            typeof __item0 === 'undefined'
              ? false
              : __originalItem0 === __item0)(Array.from(__b['a'])[__index0])
    ) &&
    /**
     * compare parameter b
     */
    __a['b'].length === __b['b'].length &&
    Array.from(__a['b']).every((__originalItem1, __index1) =>
      typeof __originalItem1 === 'undefined'
        ? false
        : ((__item1) =>
            typeof __item1 === 'undefined'
              ? false
              : __originalItem1 === __item1)(Array.from(__b['b'])[__index1])
    ) &&
    /**
     * compare parameter c
     */
    __a['c'].length === __b['c'].length &&
    Array.from(__a['c']).every((__originalItem2, __index2) =>
      typeof __originalItem2 === 'undefined'
        ? false
        : ((__item2) =>
            typeof __item2 === 'undefined'
              ? false
              : __originalItem2 === __item2)(Array.from(__b['c'])[__index2])
    ) &&
    /**
     * compare parameter d
     */
    __a['d'].length === __b['d'].length &&
    Array.from(__a['d']).every((__originalItem3, __index3) =>
      typeof __originalItem3 === 'undefined'
        ? false
        : ((__item3) =>
            typeof __item3 === 'undefined'
              ? false
              : __originalItem3 === __item3)(Array.from(__b['d'])[__index3])
    ) &&
    /**
     * compare parameter e
     */
    __a['e'].length === __b['e'].length &&
    Array.from(__a['e']).every((__originalItem4, __index4) =>
      typeof __originalItem4 === 'undefined'
        ? false
        : ((__item4) =>
            typeof __item4 === 'undefined'
              ? false
              : __originalItem4 === __item4)(Array.from(__b['e'])[__index4])
    ) &&
    /**
     * compare parameter f
     */
    __a['f'].length === __b['f'].length &&
    Array.from(__a['f']).every((__originalItem5, __index5) =>
      typeof __originalItem5 === 'undefined'
        ? false
        : ((__item5) =>
            typeof __item5 === 'undefined'
              ? false
              : ((__dp61, __dp62) =>
                  __dp61 !== null && __dp62 !== null
                    ? __dp61.length === __dp62.length &&
                      Array.from(__dp61).every((__originalItem7, __index7) =>
                        typeof __originalItem7 === 'undefined'
                          ? false
                          : ((__item7) =>
                              typeof __item7 === 'undefined'
                                ? false
                                : __originalItem7 === __item7)(
                              Array.from(__dp62)[__index7]
                            )
                      )
                    : __dp61 === __dp62)(__originalItem5, __item5))(
            Array.from(__b['f'])[__index5]
          )
    ) &&
    /**
     * compare parameter g
     */
    /* compare tuple item 0 of type number */ ((__a60, __b60) =>
      __a60 === __b60)(__a['g'][0], __b['g'][0]) &&
    /* compare tuple item 1 of type number */ ((__a61, __b61) =>
      __a61 === __b61)(__a['g'][1], __b['g'][1]) &&
    /* compare tuple item 2 of type number */ ((__a62, __b62) =>
      __a62 === __b62)(__a['g'][2], __b['g'][2]) &&
    /* compare tuple item 3 of type ReadonlyArray<number> */ ((__a63, __b63) =>
      __a63.length === __b63.length &&
      Array.from(__a63).every((__originalItem16, __index16) =>
        typeof __originalItem16 === 'undefined'
          ? false
          : ((__item16) =>
              typeof __item16 === 'undefined'
                ? false
                : __originalItem16 === __item16)(Array.from(__b63)[__index16])
      ))(__a['g'][3], __b['g'][3]) &&
    /* compare tuple item 4 of type string | null */ ((__a64, __b64) =>
      ((__dp221, __dp222) =>
        __dp221 !== null && __dp222 !== null
          ? __dp221 === __dp222
          : __dp221 === __dp222)(__a64, __b64))(__a['g'][4], __b['g'][4])
  );
}
export function updateShouldSupportSeveralSequentialVectorParams(
  value: ShouldSupportSeveralSequentialVectorParams,
  changes: Partial<ShouldSupportSeveralSequentialVectorParamsInputParams>
) {
  if (typeof changes['a'] !== 'undefined') {
    if (
      !(
        changes['a'].length === value['a'].length &&
        Array.from(changes['a']).every((__originalItem1, __index1) =>
          typeof __originalItem1 === 'undefined'
            ? false
            : ((__item1) =>
                typeof __item1 === 'undefined'
                  ? false
                  : __originalItem1 === __item1)(
                Array.from(value['a'])[__index1]
              )
        )
      )
    ) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        a: changes['a'],
      });
    }
  }
  if (typeof changes['b'] !== 'undefined') {
    if (
      !(
        changes['b'].length === value['b'].length &&
        Array.from(changes['b']).every((__originalItem3, __index3) =>
          typeof __originalItem3 === 'undefined'
            ? false
            : ((__item3) =>
                typeof __item3 === 'undefined'
                  ? false
                  : __originalItem3 === __item3)(
                Array.from(value['b'])[__index3]
              )
        )
      )
    ) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        b: changes['b'],
      });
    }
  }
  if (typeof changes['c'] !== 'undefined') {
    if (
      !(
        changes['c'].length === value['c'].length &&
        Array.from(changes['c']).every((__originalItem5, __index5) =>
          typeof __originalItem5 === 'undefined'
            ? false
            : ((__item5) =>
                typeof __item5 === 'undefined'
                  ? false
                  : __originalItem5 === __item5)(
                Array.from(value['c'])[__index5]
              )
        )
      )
    ) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        c: changes['c'],
      });
    }
  }
  if (typeof changes['d'] !== 'undefined') {
    if (
      !(
        changes['d'].length === value['d'].length &&
        Array.from(changes['d']).every((__originalItem7, __index7) =>
          typeof __originalItem7 === 'undefined'
            ? false
            : ((__item7) =>
                typeof __item7 === 'undefined'
                  ? false
                  : __originalItem7 === __item7)(
                Array.from(value['d'])[__index7]
              )
        )
      )
    ) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        d: changes['d'],
      });
    }
  }
  if (typeof changes['e'] !== 'undefined') {
    if (
      !(
        changes['e'].length === value['e'].length &&
        Array.from(changes['e']).every((__originalItem9, __index9) =>
          typeof __originalItem9 === 'undefined'
            ? false
            : ((__item9) =>
                typeof __item9 === 'undefined'
                  ? false
                  : __originalItem9 === __item9)(
                Array.from(value['e'])[__index9]
              )
        )
      )
    ) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        e: changes['e'],
      });
    }
  }
  if (typeof changes['f'] !== 'undefined') {
    if (
      !(
        changes['f'].length === value['f'].length &&
        Array.from(changes['f']).every((__originalItem11, __index11) =>
          typeof __originalItem11 === 'undefined'
            ? false
            : ((__item11) =>
                typeof __item11 === 'undefined'
                  ? false
                  : ((__dp121, __dp122) =>
                      __dp121 !== null && __dp122 !== null
                        ? __dp121.length === __dp122.length &&
                          Array.from(__dp121).every(
                            (__originalItem13, __index13) =>
                              typeof __originalItem13 === 'undefined'
                                ? false
                                : ((__item13) =>
                                    typeof __item13 === 'undefined'
                                      ? false
                                      : __originalItem13 === __item13)(
                                    Array.from(__dp122)[__index13]
                                  )
                          )
                        : __dp121 === __dp122)(__originalItem11, __item11))(
                Array.from(value['f'])[__index11]
              )
        )
      )
    ) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        f: changes['f'],
      });
    }
  }
  if (typeof changes['g'] !== 'undefined') {
    if (
      !(
        /* compare tuple item 0 of type number */ (
          ((__a150, __b150) => __a150 === __b150)(
            changes['g'][0],
            value['g'][0]
          ) &&
          /* compare tuple item 1 of type number */ ((__a151, __b151) =>
            __a151 === __b151)(changes['g'][1], value['g'][1]) &&
          /* compare tuple item 2 of type number */ ((__a152, __b152) =>
            __a152 === __b152)(changes['g'][2], value['g'][2]) &&
          /* compare tuple item 3 of type ReadonlyArray<number> */ ((
            __a153,
            __b153
          ) =>
            __a153.length === __b153.length &&
            Array.from(__a153).every((__originalItem25, __index25) =>
              typeof __originalItem25 === 'undefined'
                ? false
                : ((__item25) =>
                    typeof __item25 === 'undefined'
                      ? false
                      : __originalItem25 === __item25)(
                    Array.from(__b153)[__index25]
                  )
            ))(changes['g'][3], value['g'][3]) &&
          /* compare tuple item 4 of type string | null */ ((__a154, __b154) =>
            ((__dp311, __dp312) =>
              __dp311 !== null && __dp312 !== null
                ? __dp311 === __dp312
                : __dp311 === __dp312)(__a154, __b154))(
            changes['g'][4],
            value['g'][4]
          )
        )
      )
    ) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        g: changes['g'],
      });
    }
  }
  return value;
}
export interface simpleTupleTest {
  _name: 'schema.simpleTupleTest';
  a: [number, number, number, ReadonlyArray<number>, string | null];
  b: ReadonlyArray<
    [number, number, number, ReadonlyArray<number>, string | null]
  >;
}
export function isSimpleTupleTest(value: unknown): value is simpleTupleTest {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.simpleTupleTest'
    )
  )
    return false;
  if (
    !(
      'a' in value &&
      ((__v0) =>
        Array.isArray(__v0) &&
        __v0.length === 5 &&
        ((a) =>
          typeof a === 'number' &&
          JSBI.equal(JSBI.BigInt(a), JSBI.BigInt(a)) &&
          JSBI.greaterThanOrEqual(JSBI.BigInt(a), JSBI.BigInt('-2147483648')) &&
          JSBI.lessThanOrEqual(JSBI.BigInt(a), JSBI.BigInt('2147483647')))(
          __v0[0]
        ) &&
        ((a) => typeof a === 'number')(__v0[1]) &&
        ((a) => typeof a === 'number')(__v0[2]) &&
        ((a) =>
          (Array.isArray(a) || a instanceof Set) &&
          Array.from(a).every(
            (p) =>
              typeof p === 'number' &&
              JSBI.equal(JSBI.BigInt(p), JSBI.BigInt(p)) &&
              JSBI.greaterThanOrEqual(JSBI.BigInt(p), JSBI.BigInt('0')) &&
              JSBI.lessThanOrEqual(JSBI.BigInt(p), JSBI.BigInt('4294967295'))
          ))(__v0[3]) &&
        ((a) => (a === null ? true : ((x) => typeof x === 'string')(a)))(
          __v0[4]
        ))(value['a'])
    )
  )
    return false;
  if (
    !(
      'b' in value &&
      ((__v7) =>
        (Array.isArray(__v7) || __v7 instanceof Set) &&
        Array.from(__v7).every(
          (p) =>
            Array.isArray(p) &&
            p.length === 5 &&
            ((a) =>
              typeof a === 'number' &&
              JSBI.equal(JSBI.BigInt(a), JSBI.BigInt(a)) &&
              JSBI.greaterThanOrEqual(
                JSBI.BigInt(a),
                JSBI.BigInt('-2147483648')
              ) &&
              JSBI.lessThanOrEqual(JSBI.BigInt(a), JSBI.BigInt('2147483647')))(
              p[0]
            ) &&
            ((a) => typeof a === 'number')(p[1]) &&
            ((a) => typeof a === 'number')(p[2]) &&
            ((a) =>
              (Array.isArray(a) || a instanceof Set) &&
              Array.from(a).every(
                (p) =>
                  typeof p === 'number' &&
                  JSBI.equal(JSBI.BigInt(p), JSBI.BigInt(p)) &&
                  JSBI.greaterThanOrEqual(JSBI.BigInt(p), JSBI.BigInt('0')) &&
                  JSBI.lessThanOrEqual(
                    JSBI.BigInt(p),
                    JSBI.BigInt('4294967295')
                  )
              ))(p[3]) &&
            ((a) => (a === null ? true : ((x) => typeof x === 'string')(a)))(
              p[4]
            )
        ))(value['b'])
    )
  )
    return false;
  return true;
}
export interface simpleTupleTestInputParams {
  a: [number, number, number, ReadonlyArray<number>, string | null];
  b: ReadonlyArray<
    [number, number, number, ReadonlyArray<number>, string | null]
  >;
}
export function simpleTupleTest(
  params: simpleTupleTestInputParams
): simpleTupleTest {
  return {
    _name: 'schema.simpleTupleTest',
    a: params['a'],
    b: params['b'],
  };
}
export function encodeSimpleTupleTest(
  __s: ISerializer,
  value: simpleTupleTest
) {
  __s.writeInt32(546242333);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  const __t1 = __pv0[0];
  __s.writeInt32(__t1);
  const __t2 = __pv0[1];
  __s.writeFloat(__t2);
  const __t4 = __pv0[2];
  __s.writeDouble(__t4);
  const __t7 = __pv0[3];
  const __l11 = __t7.length;
  __s.writeUint32(__l11);
  for (const __item11 of __t7) {
    __s.writeUint32(__item11);
  }
  const __t12 = __pv0[4];
  if (__t12 === null) {
    __s.writeUint8(0);
  } else {
    __s.writeUint8(1);
    __s.writeString(__t12);
  }
  /**
   * encoding param: b
   */
  const __pv18 = value['b'];
  const __l19 = __pv18.length;
  __s.writeUint32(__l19);
  for (const __item19 of __pv18) {
    const __t20 = __item19[0];
    __s.writeInt32(__t20);
    const __t21 = __item19[1];
    __s.writeFloat(__t21);
    const __t23 = __item19[2];
    __s.writeDouble(__t23);
    const __t26 = __item19[3];
    const __l30 = __t26.length;
    __s.writeUint32(__l30);
    for (const __item30 of __t26) {
      __s.writeUint32(__item30);
    }
    const __t31 = __item19[4];
    if (__t31 === null) {
      __s.writeUint8(0);
    } else {
      __s.writeUint8(1);
      __s.writeString(__t31);
    }
  }
}
export function decodeSimpleTupleTest(
  __d: IDeserializer
): simpleTupleTest | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 546242333) return null;
  let a: [number, number, number, Array<number>, string | null];
  let b: Array<[number, number, number, Array<number>, string | null]>;
  /**
   * decoding param: a
   */
  let __e1: number;
  __e1 = __d.readInt32();
  let __e2: number;
  __e2 = __d.readFloat();
  let __e3: number;
  __e3 = __d.readDouble();
  let __e4: Array<number>;
  const __l5 = __d.readUint32();
  const __o5 = new Array<number>(__l5);
  __e4 = __o5;
  for (let __i5 = 0; __i5 < __l5; __i5++) {
    __o5[__i5] = __d.readUint32();
  }
  let __e6: string | null;
  if (__d.readUint8() === 1) {
    __e6 = __d.readString();
  } else {
    __e6 = null;
  }
  a = [__e1, __e2, __e3, __e4, __e6];
  /**
   * decoding param: b
   */
  const __l9 = __d.readUint32();
  const __o9 = new Array<
    [number, number, number, Array<number>, string | null]
  >(__l9);
  b = __o9;
  for (let __i9 = 0; __i9 < __l9; __i9++) {
    let __e10: number;
    __e10 = __d.readInt32();
    let __e11: number;
    __e11 = __d.readFloat();
    let __e12: number;
    __e12 = __d.readDouble();
    let __e13: Array<number>;
    const __l14 = __d.readUint32();
    const __o14 = new Array<number>(__l14);
    __e13 = __o14;
    for (let __i14 = 0; __i14 < __l14; __i14++) {
      __o14[__i14] = __d.readUint32();
    }
    let __e15: string | null;
    if (__d.readUint8() === 1) {
      __e15 = __d.readString();
    } else {
      __e15 = null;
    }
    __o9[__i9] = [__e10, __e11, __e12, __e13, __e15];
  }
  return {
    _name: 'schema.simpleTupleTest',
    a,
    b,
  };
}
export function defaultSimpleTupleTest(
  params: Partial<simpleTupleTestInputParams> = {}
): simpleTupleTest {
  return simpleTupleTest({
    a: [0, 0.0, 0.0, [], null],
    b: [],
    ...params,
  });
}
export function compareSimpleTupleTest(
  __a: simpleTupleTest,
  __b: simpleTupleTest
): boolean {
  return (
    /**
     * compare parameter a
     */
    /* compare tuple item 0 of type number */ ((__a00, __b00) =>
      __a00 === __b00)(__a['a'][0], __b['a'][0]) &&
    /* compare tuple item 1 of type number */ ((__a01, __b01) =>
      __a01 === __b01)(__a['a'][1], __b['a'][1]) &&
    /* compare tuple item 2 of type number */ ((__a02, __b02) =>
      __a02 === __b02)(__a['a'][2], __b['a'][2]) &&
    /* compare tuple item 3 of type ReadonlyArray<number> */ ((__a03, __b03) =>
      __a03.length === __b03.length &&
      Array.from(__a03).every((__originalItem10, __index10) =>
        typeof __originalItem10 === 'undefined'
          ? false
          : ((__item10) =>
              typeof __item10 === 'undefined'
                ? false
                : __originalItem10 === __item10)(Array.from(__b03)[__index10])
      ))(__a['a'][3], __b['a'][3]) &&
    /* compare tuple item 4 of type string | null */ ((__a04, __b04) =>
      ((__dp161, __dp162) =>
        __dp161 !== null && __dp162 !== null
          ? __dp161 === __dp162
          : __dp161 === __dp162)(__a04, __b04))(__a['a'][4], __b['a'][4]) &&
    /**
     * compare parameter b
     */
    __a['b'].length === __b['b'].length &&
    Array.from(__a['b']).every((__originalItem1, __index1) =>
      typeof __originalItem1 === 'undefined'
        ? false
        : ((__item1) =>
            typeof __item1 === 'undefined'
              ? false
              : /* compare tuple item 0 of type number */ ((__a20, __b20) =>
                  __a20 === __b20)(__originalItem1[0], __item1[0]) &&
                /* compare tuple item 1 of type number */ ((__a21, __b21) =>
                  __a21 === __b21)(__originalItem1[1], __item1[1]) &&
                /* compare tuple item 2 of type number */ ((__a22, __b22) =>
                  __a22 === __b22)(__originalItem1[2], __item1[2]) &&
                /* compare tuple item 3 of type ReadonlyArray<number> */ ((
                  __a23,
                  __b23
                ) =>
                  __a23.length === __b23.length &&
                  Array.from(__a23).every((__originalItem12, __index12) =>
                    typeof __originalItem12 === 'undefined'
                      ? false
                      : ((__item12) =>
                          typeof __item12 === 'undefined'
                            ? false
                            : __originalItem12 === __item12)(
                          Array.from(__b23)[__index12]
                        )
                  ))(__originalItem1[3], __item1[3]) &&
                /* compare tuple item 4 of type string | null */ ((
                  __a24,
                  __b24
                ) =>
                  ((__dp181, __dp182) =>
                    __dp181 !== null && __dp182 !== null
                      ? __dp181 === __dp182
                      : __dp181 === __dp182)(__a24, __b24))(
                  __originalItem1[4],
                  __item1[4]
                ))(Array.from(__b['b'])[__index1])
    )
  );
}
export function updateSimpleTupleTest(
  value: simpleTupleTest,
  changes: Partial<simpleTupleTestInputParams>
) {
  if (typeof changes['a'] !== 'undefined') {
    if (
      !(
        /* compare tuple item 0 of type number */ (
          ((__a10, __b10) => __a10 === __b10)(changes['a'][0], value['a'][0]) &&
          /* compare tuple item 1 of type number */ ((__a11, __b11) =>
            __a11 === __b11)(changes['a'][1], value['a'][1]) &&
          /* compare tuple item 2 of type number */ ((__a12, __b12) =>
            __a12 === __b12)(changes['a'][2], value['a'][2]) &&
          /* compare tuple item 3 of type ReadonlyArray<number> */ ((
            __a13,
            __b13
          ) =>
            __a13.length === __b13.length &&
            Array.from(__a13).every((__originalItem11, __index11) =>
              typeof __originalItem11 === 'undefined'
                ? false
                : ((__item11) =>
                    typeof __item11 === 'undefined'
                      ? false
                      : __originalItem11 === __item11)(
                    Array.from(__b13)[__index11]
                  )
            ))(changes['a'][3], value['a'][3]) &&
          /* compare tuple item 4 of type string | null */ ((__a14, __b14) =>
            ((__dp171, __dp172) =>
              __dp171 !== null && __dp172 !== null
                ? __dp171 === __dp172
                : __dp171 === __dp172)(__a14, __b14))(
            changes['a'][4],
            value['a'][4]
          )
        )
      )
    ) {
      value = simpleTupleTest({
        ...value,
        a: changes['a'],
      });
    }
  }
  if (typeof changes['b'] !== 'undefined') {
    if (
      !(
        changes['b'].length === value['b'].length &&
        Array.from(changes['b']).every((__originalItem19, __index19) =>
          typeof __originalItem19 === 'undefined'
            ? false
            : ((__item19) =>
                typeof __item19 === 'undefined'
                  ? false
                  : /* compare tuple item 0 of type number */ ((
                      __a200,
                      __b200
                    ) => __a200 === __b200)(__originalItem19[0], __item19[0]) &&
                    /* compare tuple item 1 of type number */ ((
                      __a201,
                      __b201
                    ) => __a201 === __b201)(__originalItem19[1], __item19[1]) &&
                    /* compare tuple item 2 of type number */ ((
                      __a202,
                      __b202
                    ) => __a202 === __b202)(__originalItem19[2], __item19[2]) &&
                    /* compare tuple item 3 of type ReadonlyArray<number> */ ((
                      __a203,
                      __b203
                    ) =>
                      __a203.length === __b203.length &&
                      Array.from(__a203).every((__originalItem30, __index30) =>
                        typeof __originalItem30 === 'undefined'
                          ? false
                          : ((__item30) =>
                              typeof __item30 === 'undefined'
                                ? false
                                : __originalItem30 === __item30)(
                              Array.from(__b203)[__index30]
                            )
                      ))(__originalItem19[3], __item19[3]) &&
                    /* compare tuple item 4 of type string | null */ ((
                      __a204,
                      __b204
                    ) =>
                      ((__dp361, __dp362) =>
                        __dp361 !== null && __dp362 !== null
                          ? __dp361 === __dp362
                          : __dp361 === __dp362)(__a204, __b204))(
                      __originalItem19[4],
                      __item19[4]
                    ))(Array.from(value['b'])[__index19])
        )
      )
    ) {
      value = simpleTupleTest({
        ...value,
        b: changes['b'],
      });
    }
  }
  return value;
}
export interface emptyNode {
  _name: 'schema.emptyNode';
}
export function isEmptyNode(value: unknown): value is emptyNode {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.emptyNode'
    )
  )
    return false;
  return true;
}
export interface emptyNodeInputParams {}
export function emptyNode(_: emptyNodeInputParams = {}): emptyNode {
  return {
    _name: 'schema.emptyNode',
  };
}
export function encodeEmptyNode(__s: ISerializer, _: emptyNode) {
  __s.writeInt32(-1994197976);
}
export function decodeEmptyNode(__d: IDeserializer): emptyNode | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -1994197976) return null;
  return {
    _name: 'schema.emptyNode',
  };
}
export function defaultEmptyNode(
  params: Partial<emptyNodeInputParams> = {}
): emptyNode {
  return emptyNode({
    ...params,
  });
}
export function compareEmptyNode(__a: emptyNode, __b: emptyNode): boolean {
  return true;
}
export function updateEmptyNode(
  value: emptyNode,
  _: Partial<emptyNodeInputParams>
) {
  return value;
}
export interface user {
  _name: 'schema.user';
  id: number;
  name: string;
}
export function isUser(value: unknown): value is user {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.user'
    )
  )
    return false;
  if (
    !(
      'id' in value &&
      ((__v0) =>
        typeof __v0 === 'number' &&
        JSBI.equal(JSBI.BigInt(__v0), JSBI.BigInt(__v0)) &&
        JSBI.greaterThanOrEqual(
          JSBI.BigInt(__v0),
          JSBI.BigInt('-2147483648')
        ) &&
        JSBI.lessThanOrEqual(JSBI.BigInt(__v0), JSBI.BigInt('2147483647')))(
        value['id']
      )
    )
  )
    return false;
  if (!('name' in value && ((__v1) => typeof __v1 === 'string')(value['name'])))
    return false;
  return true;
}
export interface userInputParams {
  id: number;
  name: string;
}
export function user(params: userInputParams): user {
  return {
    _name: 'schema.user',
    id: params['id'],
    name: params['name'],
  };
}
export function encodeUser(__s: ISerializer, value: user) {
  __s.writeInt32(136841399);
  /**
   * encoding param: id
   */
  const __pv0 = value['id'];
  __s.writeInt32(__pv0);
  /**
   * encoding param: name
   */
  const __pv1 = value['name'];
  __s.writeString(__pv1);
}
export function decodeUser(__d: IDeserializer): user | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 136841399) return null;
  let id: number;
  let name: string;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  /**
   * decoding param: name
   */
  name = __d.readString();
  return {
    _name: 'schema.user',
    id,
    name,
  };
}
export function defaultUser(params: Partial<userInputParams> = {}): user {
  return user({
    id: 0,
    name: '',
    ...params,
  });
}
export function compareUser(__a: user, __b: user): boolean {
  return (
    /**
     * compare parameter id
     */
    __a['id'] === __b['id'] &&
    /**
     * compare parameter name
     */
    __a['name'] === __b['name']
  );
}
export function updateUser(value: user, changes: Partial<userInputParams>) {
  if (typeof changes['id'] !== 'undefined') {
    if (!(changes['id'] === value['id'])) {
      value = user({
        ...value,
        id: changes['id'],
      });
    }
  }
  if (typeof changes['name'] !== 'undefined') {
    if (!(changes['name'] === value['name'])) {
      value = user({
        ...value,
        name: changes['name'],
      });
    }
  }
  return value;
}
export interface supportNullTerminatedString {
  _name: 'schema.supportNullTerminatedString';
  value: string;
}
export function isSupportNullTerminatedString(
  value: unknown
): value is supportNullTerminatedString {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.supportNullTerminatedString'
    )
  )
    return false;
  if (
    !('value' in value && ((__v0) => typeof __v0 === 'string')(value['value']))
  )
    return false;
  return true;
}
export interface supportNullTerminatedStringInputParams {
  value: string;
}
export function supportNullTerminatedString(
  params: supportNullTerminatedStringInputParams
): supportNullTerminatedString {
  return {
    _name: 'schema.supportNullTerminatedString',
    value: params['value'],
  };
}
export function encodeSupportNullTerminatedString(
  __s: ISerializer,
  value: supportNullTerminatedString
) {
  __s.writeInt32(-1360902719);
  /**
   * encoding param: value
   */
  const __pv0 = value['value'];
  __s.writeNullTerminatedString(__pv0);
}
export function decodeSupportNullTerminatedString(
  __d: IDeserializer
): supportNullTerminatedString | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -1360902719) return null;
  let value: string;
  /**
   * decoding param: value
   */
  value = __d.readNullTerminatedString();
  return {
    _name: 'schema.supportNullTerminatedString',
    value,
  };
}
export function defaultSupportNullTerminatedString(
  params: Partial<supportNullTerminatedStringInputParams> = {}
): supportNullTerminatedString {
  return supportNullTerminatedString({
    value: '',
    ...params,
  });
}
export function compareSupportNullTerminatedString(
  __a: supportNullTerminatedString,
  __b: supportNullTerminatedString
): boolean {
  return (
    /**
     * compare parameter value
     */
    __a['value'] === __b['value']
  );
}
export function updateSupportNullTerminatedString(
  value: supportNullTerminatedString,
  changes: Partial<supportNullTerminatedStringInputParams>
) {
  if (typeof changes['value'] !== 'undefined') {
    if (!(changes['value'] === value['value'])) {
      value = supportNullTerminatedString({
        ...value,
        value: changes['value'],
      });
    }
  }
  return value;
}
export interface nullTerminatedStringList {
  _name: 'schema.nullTerminatedStringList';
  value: ReadonlyArray<string>;
}
export function isNullTerminatedStringList(
  value: unknown
): value is nullTerminatedStringList {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.nullTerminatedStringList'
    )
  )
    return false;
  if (
    !(
      'value' in value &&
      ((__v0) =>
        (Array.isArray(__v0) || __v0 instanceof Set) &&
        Array.from(__v0).every((p) => typeof p === 'string'))(value['value'])
    )
  )
    return false;
  return true;
}
export interface nullTerminatedStringListInputParams {
  value: ReadonlyArray<string>;
}
export function nullTerminatedStringList(
  params: nullTerminatedStringListInputParams
): nullTerminatedStringList {
  return {
    _name: 'schema.nullTerminatedStringList',
    value: params['value'],
  };
}
export function encodeNullTerminatedStringList(
  __s: ISerializer,
  value: nullTerminatedStringList
) {
  __s.writeInt32(-1953588325);
  /**
   * encoding param: value
   */
  const __pv0 = value['value'];
  const __l1 = __pv0.length;
  __s.writeUint32(__l1);
  for (const __item1 of __pv0) {
    __s.writeNullTerminatedString(__item1);
  }
}
export function decodeNullTerminatedStringList(
  __d: IDeserializer
): nullTerminatedStringList | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -1953588325) return null;
  let value: Array<string>;
  /**
   * decoding param: value
   */
  const __l1 = __d.readUint32();
  const __o1 = new Array<string>(__l1);
  value = __o1;
  for (let __i1 = 0; __i1 < __l1; __i1++) {
    __o1[__i1] = __d.readNullTerminatedString();
  }
  return {
    _name: 'schema.nullTerminatedStringList',
    value,
  };
}
export function defaultNullTerminatedStringList(
  params: Partial<nullTerminatedStringListInputParams> = {}
): nullTerminatedStringList {
  return nullTerminatedStringList({
    value: [],
    ...params,
  });
}
export function compareNullTerminatedStringList(
  __a: nullTerminatedStringList,
  __b: nullTerminatedStringList
): boolean {
  return (
    /**
     * compare parameter value
     */
    __a['value'].length === __b['value'].length &&
    Array.from(__a['value']).every((__originalItem0, __index0) =>
      typeof __originalItem0 === 'undefined'
        ? false
        : ((__item0) =>
            typeof __item0 === 'undefined'
              ? false
              : __originalItem0 === __item0)(Array.from(__b['value'])[__index0])
    )
  );
}
export function updateNullTerminatedStringList(
  value: nullTerminatedStringList,
  changes: Partial<nullTerminatedStringListInputParams>
) {
  if (typeof changes['value'] !== 'undefined') {
    if (
      !(
        changes['value'].length === value['value'].length &&
        Array.from(changes['value']).every((__originalItem1, __index1) =>
          typeof __originalItem1 === 'undefined'
            ? false
            : ((__item1) =>
                typeof __item1 === 'undefined'
                  ? false
                  : __originalItem1 === __item1)(
                Array.from(value['value'])[__index1]
              )
        )
      )
    ) {
      value = nullTerminatedStringList({
        ...value,
        value: changes['value'],
      });
    }
  }
  return value;
}
export interface normalStringList {
  _name: 'schema.normalStringList';
  value: ReadonlyArray<string>;
}
export function isNormalStringList(value: unknown): value is normalStringList {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.normalStringList'
    )
  )
    return false;
  if (
    !(
      'value' in value &&
      ((__v0) =>
        (Array.isArray(__v0) || __v0 instanceof Set) &&
        Array.from(__v0).every((p) => typeof p === 'string'))(value['value'])
    )
  )
    return false;
  return true;
}
export interface normalStringListInputParams {
  value: ReadonlyArray<string>;
}
export function normalStringList(
  params: normalStringListInputParams
): normalStringList {
  return {
    _name: 'schema.normalStringList',
    value: params['value'],
  };
}
export function encodeNormalStringList(
  __s: ISerializer,
  value: normalStringList
) {
  __s.writeInt32(-1964890795);
  /**
   * encoding param: value
   */
  const __pv0 = value['value'];
  const __l1 = __pv0.length;
  __s.writeUint32(__l1);
  for (const __item1 of __pv0) {
    __s.writeString(__item1);
  }
}
export function decodeNormalStringList(
  __d: IDeserializer
): normalStringList | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -1964890795) return null;
  let value: Array<string>;
  /**
   * decoding param: value
   */
  const __l1 = __d.readUint32();
  const __o1 = new Array<string>(__l1);
  value = __o1;
  for (let __i1 = 0; __i1 < __l1; __i1++) {
    __o1[__i1] = __d.readString();
  }
  return {
    _name: 'schema.normalStringList',
    value,
  };
}
export function defaultNormalStringList(
  params: Partial<normalStringListInputParams> = {}
): normalStringList {
  return normalStringList({
    value: [],
    ...params,
  });
}
export function compareNormalStringList(
  __a: normalStringList,
  __b: normalStringList
): boolean {
  return (
    /**
     * compare parameter value
     */
    __a['value'].length === __b['value'].length &&
    Array.from(__a['value']).every((__originalItem0, __index0) =>
      typeof __originalItem0 === 'undefined'
        ? false
        : ((__item0) =>
            typeof __item0 === 'undefined'
              ? false
              : __originalItem0 === __item0)(Array.from(__b['value'])[__index0])
    )
  );
}
export function updateNormalStringList(
  value: normalStringList,
  changes: Partial<normalStringListInputParams>
) {
  if (typeof changes['value'] !== 'undefined') {
    if (
      !(
        changes['value'].length === value['value'].length &&
        Array.from(changes['value']).every((__originalItem1, __index1) =>
          typeof __originalItem1 === 'undefined'
            ? false
            : ((__item1) =>
                typeof __item1 === 'undefined'
                  ? false
                  : __originalItem1 === __item1)(
                Array.from(value['value'])[__index1]
              )
        )
      )
    ) {
      value = normalStringList({
        ...value,
        value: changes['value'],
      });
    }
  }
  return value;
}
export interface boolAndTuple {
  _name: 'schema.boolAndTuple';
  sorryIJustLoveTuples: [boolean, boolean, [boolean, boolean]];
}
export function isBoolAndTuple(value: unknown): value is boolAndTuple {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'schema.boolAndTuple'
    )
  )
    return false;
  if (
    !(
      'sorryIJustLoveTuples' in value &&
      ((__v0) =>
        Array.isArray(__v0) &&
        __v0.length === 3 &&
        ((a) => typeof a === 'boolean')(__v0[0]) &&
        ((a) => typeof a === 'boolean')(__v0[1]) &&
        ((a) =>
          Array.isArray(a) &&
          a.length === 2 &&
          ((a) => typeof a === 'boolean')(a[0]) &&
          ((a) => typeof a === 'boolean')(a[1]))(__v0[2]))(
        value['sorryIJustLoveTuples']
      )
    )
  )
    return false;
  return true;
}
export interface boolAndTupleInputParams {
  sorryIJustLoveTuples: [boolean, boolean, [boolean, boolean]];
}
export function boolAndTuple(params: boolAndTupleInputParams): boolAndTuple {
  return {
    _name: 'schema.boolAndTuple',
    sorryIJustLoveTuples: params['sorryIJustLoveTuples'],
  };
}
export function encodeBoolAndTuple(__s: ISerializer, value: boolAndTuple) {
  __s.writeInt32(-789978949);
  /**
   * encoding param: sorryIJustLoveTuples
   */
  const __pv0 = value['sorryIJustLoveTuples'];
  const __t1 = __pv0[0];
  __s.writeUint8(__t1 === true ? 1 : 0);
  const __t2 = __pv0[1];
  __s.writeUint8(__t2 === true ? 1 : 0);
  const __t4 = __pv0[2];
  const __t7 = __t4[0];
  __s.writeUint8(__t7 === true ? 1 : 0);
  const __t8 = __t4[1];
  __s.writeUint8(__t8 === true ? 1 : 0);
}
export function decodeBoolAndTuple(__d: IDeserializer): boolAndTuple | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -789978949) return null;
  let sorryIJustLoveTuples: [boolean, boolean, [boolean, boolean]];
  /**
   * decoding param: sorryIJustLoveTuples
   */
  let __e1: boolean;
  __e1 = __d.readUint8() === 1;
  let __e2: boolean;
  __e2 = __d.readUint8() === 1;
  let __e3: [boolean, boolean];
  let __e4: boolean;
  __e4 = __d.readUint8() === 1;
  let __e5: boolean;
  __e5 = __d.readUint8() === 1;
  __e3 = [__e4, __e5];
  sorryIJustLoveTuples = [__e1, __e2, __e3];
  return {
    _name: 'schema.boolAndTuple',
    sorryIJustLoveTuples,
  };
}
export function defaultBoolAndTuple(
  params: Partial<boolAndTupleInputParams> = {}
): boolAndTuple {
  return boolAndTuple({
    sorryIJustLoveTuples: [false, false, [false, false]],
    ...params,
  });
}
export function compareBoolAndTuple(
  __a: boolAndTuple,
  __b: boolAndTuple
): boolean {
  return (
    /**
     * compare parameter sorryIJustLoveTuples
     */
    /* compare tuple item 0 of type boolean */ ((__a00, __b00) =>
      __a00 === __b00)(
      __a['sorryIJustLoveTuples'][0],
      __b['sorryIJustLoveTuples'][0]
    ) &&
    /* compare tuple item 1 of type boolean */ ((__a01, __b01) =>
      __a01 === __b01)(
      __a['sorryIJustLoveTuples'][1],
      __b['sorryIJustLoveTuples'][1]
    ) &&
    /* compare tuple item 2 of type [boolean,boolean] */ ((__a02, __b02) =>
      /* compare tuple item 0 of type boolean */ ((__a60, __b60) =>
        __a60 === __b60)(__a02[0], __b02[0]) &&
      /* compare tuple item 1 of type boolean */ ((__a61, __b61) =>
        __a61 === __b61)(__a02[1], __b02[1]))(
      __a['sorryIJustLoveTuples'][2],
      __b['sorryIJustLoveTuples'][2]
    )
  );
}
export function updateBoolAndTuple(
  value: boolAndTuple,
  changes: Partial<boolAndTupleInputParams>
) {
  if (typeof changes['sorryIJustLoveTuples'] !== 'undefined') {
    if (
      !(
        /* compare tuple item 0 of type boolean */ (
          ((__a10, __b10) => __a10 === __b10)(
            changes['sorryIJustLoveTuples'][0],
            value['sorryIJustLoveTuples'][0]
          ) &&
          /* compare tuple item 1 of type boolean */ ((__a11, __b11) =>
            __a11 === __b11)(
            changes['sorryIJustLoveTuples'][1],
            value['sorryIJustLoveTuples'][1]
          ) &&
          /* compare tuple item 2 of type [boolean,boolean] */ ((
            __a12,
            __b12
          ) =>
            /* compare tuple item 0 of type boolean */ ((__a70, __b70) =>
              __a70 === __b70)(__a12[0], __b12[0]) &&
            /* compare tuple item 1 of type boolean */ ((__a71, __b71) =>
              __a71 === __b71)(__a12[1], __b12[1]))(
            changes['sorryIJustLoveTuples'][2],
            value['sorryIJustLoveTuples'][2]
          )
        )
      )
    ) {
      value = boolAndTuple({
        ...value,
        sorryIJustLoveTuples: changes['sorryIJustLoveTuples'],
      });
    }
  }
  return value;
}
