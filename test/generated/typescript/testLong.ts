import JSBI from "jsbi";
import { ISerializer } from "./__types__";
import { IDeserializer } from "./__types__";
export interface A  {
  _name: 'test-long.A';
  a: string;
}
export function isA(value: unknown): value is A {
  if(!(typeof value === 'object' && value !== null && '_name' in value && typeof value['_name'] === 'string' && value['_name'] === "test-long.A")) return false;
  if(!(
    "a" in value && ((__v0) => (typeof __v0 === 'string' && JSBI.equal(JSBI.BigInt(__v0),JSBI.BigInt(__v0)) && JSBI.greaterThanOrEqual(JSBI.BigInt(__v0),JSBI.BigInt("-9223372036854775808")) && JSBI.lessThanOrEqual(JSBI.BigInt(__v0),JSBI.BigInt("9223372036854775807"))))(value['a'])
  )) return false;
  return true;
}
export interface AInputParams {
  a: string;
}
export function A(params: AInputParams): A {
  return {
    _name: 'test-long.A',
    a: params['a']
  };
}
export function encodeA(__s: ISerializer, value: A) {
  __s.writeInt32(-1688212411);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  __s.writeSignedLong(__pv0);
}
export function decodeA(__d: IDeserializer): A | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1688212411) return null;
  let a: string;
  /**
   * decoding param: a
   */
  a = __d.readSignedLong();
  return {
    _name: 'test-long.A',
    a
  };
}
export function defaultA(params: Partial<AInputParams> = {}): A {
  return A({
    a: "0",
    ...params
  });
}
export function compareA(__a: A, __b: A): boolean {
  return (
    /**
     * compare parameter a
     */
    __a['a'] === __b['a']
  );
}
export function updateA(value: A, changes: Partial<AInputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(changes['a'] === value['a'])) {
      value = A({
        ...value,
        a: changes['a'],
      });
    }
  }
  return value;
}
export interface B  {
  _name: 'test-long.B';
  a: string;
}
export function isB(value: unknown): value is B {
  if(!(typeof value === 'object' && value !== null && '_name' in value && typeof value['_name'] === 'string' && value['_name'] === "test-long.B")) return false;
  if(!(
    "a" in value && ((__v0) => (typeof __v0 === 'string' && JSBI.equal(JSBI.BigInt(__v0),JSBI.BigInt(__v0)) && JSBI.greaterThanOrEqual(JSBI.BigInt(__v0),JSBI.BigInt("0")) && JSBI.lessThanOrEqual(JSBI.BigInt(__v0),JSBI.BigInt("18446744073709551615"))))(value['a'])
  )) return false;
  return true;
}
export interface BInputParams {
  a: string;
}
export function B(params: BInputParams): B {
  return {
    _name: 'test-long.B',
    a: params['a']
  };
}
export function encodeB(__s: ISerializer, value: B) {
  __s.writeInt32(1885886278);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  __s.writeUnsignedLong(__pv0);
}
export function decodeB(__d: IDeserializer): B | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 1885886278) return null;
  let a: string;
  /**
   * decoding param: a
   */
  a = __d.readUnsignedLong();
  return {
    _name: 'test-long.B',
    a
  };
}
export function defaultB(params: Partial<BInputParams> = {}): B {
  return B({
    a: "0",
    ...params
  });
}
export function compareB(__a: B, __b: B): boolean {
  return (
    /**
     * compare parameter a
     */
    __a['a'] === __b['a']
  );
}
export function updateB(value: B, changes: Partial<BInputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(changes['a'] === value['a'])) {
      value = B({
        ...value,
        a: changes['a'],
      });
    }
  }
  return value;
}
export interface C  {
  _name: 'test-long.C';
  a: string;
  b: string;
  c: number;
}
export function isC(value: unknown): value is C {
  if(!(typeof value === 'object' && value !== null && '_name' in value && typeof value['_name'] === 'string' && value['_name'] === "test-long.C")) return false;
  if(!(
    "a" in value && ((__v0) => (typeof __v0 === 'string' && JSBI.equal(JSBI.BigInt(__v0),JSBI.BigInt(__v0)) && JSBI.greaterThanOrEqual(JSBI.BigInt(__v0),JSBI.BigInt("-9223372036854775808")) && JSBI.lessThanOrEqual(JSBI.BigInt(__v0),JSBI.BigInt("9223372036854775807"))))(value['a'])
  )) return false;
  if(!(
    "b" in value && ((__v1) => (typeof __v1 === 'string' && JSBI.equal(JSBI.BigInt(__v1),JSBI.BigInt(__v1)) && JSBI.greaterThanOrEqual(JSBI.BigInt(__v1),JSBI.BigInt("0")) && JSBI.lessThanOrEqual(JSBI.BigInt(__v1),JSBI.BigInt("18446744073709551615"))))(value['b'])
  )) return false;
  if(!(
    "c" in value && ((__v2) => (typeof __v2 === 'number' && JSBI.equal(JSBI.BigInt(__v2),JSBI.BigInt(__v2)) && JSBI.greaterThanOrEqual(JSBI.BigInt(__v2),JSBI.BigInt("-2147483648")) && JSBI.lessThanOrEqual(JSBI.BigInt(__v2),JSBI.BigInt("2147483647"))))(value['c'])
  )) return false;
  return true;
}
export interface CInputParams {
  a: string;
  b: string;
  c: number;
}
export function C(params: CInputParams): C {
  return {
    _name: 'test-long.C',
    a: params['a'],
    b: params['b'],
    c: params['c']
  };
}
export function encodeC(__s: ISerializer, value: C) {
  __s.writeInt32(-523698750);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  __s.writeSignedLong(__pv0);
  /**
   * encoding param: b
   */
  const __pv1 = value['b'];
  __s.writeUnsignedLong(__pv1);
  /**
   * encoding param: c
   */
  const __pv2 = value['c'];
  __s.writeInt32(__pv2);
}
export function decodeC(__d: IDeserializer): C | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -523698750) return null;
  let a: string;
  let b: string;
  let c: number;
  /**
   * decoding param: a
   */
  a = __d.readSignedLong();
  /**
   * decoding param: b
   */
  b = __d.readUnsignedLong();
  /**
   * decoding param: c
   */
  c = __d.readInt32();
  return {
    _name: 'test-long.C',
    a,
    b,
    c
  };
}
export function defaultC(params: Partial<CInputParams> = {}): C {
  return C({
    a: "0",
    b: "0",
    c: 0,
    ...params
  });
}
export function compareC(__a: C, __b: C): boolean {
  return (
    /**
     * compare parameter a
     */
    __a['a'] === __b['a'] &&
    /**
     * compare parameter b
     */
    __a['b'] === __b['b'] &&
    /**
     * compare parameter c
     */
    __a['c'] === __b['c']
  );
}
export function updateC(value: C, changes: Partial<CInputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(changes['a'] === value['a'])) {
      value = C({
        ...value,
        a: changes['a'],
      });
    }
  }
  if(typeof changes['b'] !== 'undefined') {
    if(!(changes['b'] === value['b'])) {
      value = C({
        ...value,
        b: changes['b'],
      });
    }
  }
  if(typeof changes['c'] !== 'undefined') {
    if(!(changes['c'] === value['c'])) {
      value = C({
        ...value,
        c: changes['c'],
      });
    }
  }
  return value;
}
