import { ISerializer } from './__types__';
import { IDeserializer } from './__types__';
import JSBI from 'jsbi';
export type A = Readonly<B> | Readonly<C> | Readonly<D>;
export function isATrait(value: unknown): value is A {
  if (isB(value)) return true;
  if (isC(value)) return true;
  if (isD(value)) return true;
  return false;
}
export function encodeATrait(__s: ISerializer, value: A) {
  switch (value._name) {
    case 'test-trait-on-param-trait.B':
      return encodeB(__s, value);
    case 'test-trait-on-param-trait.C':
      return encodeC(__s, value);
    case 'test-trait-on-param-trait.D':
      return encodeD(__s, value);
  }
  throw new Error(
    `Failed to encode: Received invalid value on "_name" property. We got "${value['_name']}" value, but this function was expecting to receive one of the following:\n\t- test-trait-on-param-trait.B\n\t- test-trait-on-param-trait.C\n\t- test-trait-on-param-trait.D\n\n\nPossible cause is that maybe this type simply does not extend this trait, and somehow the type-checking prevented you from calling this function wrongly.`
  );
}
export function decodeATrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewind(4);
  let value: B | C | D;
  switch (__id) {
    case 543394260: {
      const tmp = decodeB(__d);
      if (tmp === null) return null;
      value = tmp;
      break;
    }
    case -811474198: {
      const tmp = decodeC(__d);
      if (tmp === null) return null;
      value = tmp;
      break;
    }
    case 763230611: {
      const tmp = decodeD(__d);
      if (tmp === null) return null;
      value = tmp;
      break;
    }
    default:
      return null;
  }
  return value;
}
export function defaultATrait() {
  return defaultB();
}
export function compareATrait(__a: A, __b: A) {
  switch (__a._name) {
    case 'test-trait-on-param-trait.B':
      if (__b._name !== 'test-trait-on-param-trait.B') return false;
      return compareB(__a, __b);
    case 'test-trait-on-param-trait.C':
      if (__b._name !== 'test-trait-on-param-trait.C') return false;
      return compareC(__a, __b);
    case 'test-trait-on-param-trait.D':
      if (__b._name !== 'test-trait-on-param-trait.D') return false;
      return compareD(__a, __b);
  }
}
export interface B {
  _name: 'test-trait-on-param-trait.B';
  a: number;
}
export function isB(value: unknown): value is B {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'test-trait-on-param-trait.B'
    )
  )
    return false;
  if (
    !(
      'a' in value &&
      ((__v0) =>
        typeof __v0 === 'number' &&
        JSBI.equal(JSBI.BigInt(__v0), JSBI.BigInt(__v0)) &&
        JSBI.greaterThanOrEqual(
          JSBI.BigInt(__v0),
          JSBI.BigInt('-2147483648')
        ) &&
        JSBI.lessThanOrEqual(JSBI.BigInt(__v0), JSBI.BigInt('2147483647')))(
        value['a']
      )
    )
  )
    return false;
  return true;
}
export interface BInputParams {
  a: number;
}
export function B(params: BInputParams): B {
  return {
    _name: 'test-trait-on-param-trait.B',
    a: params['a']
  };
}
export function encodeB(__s: ISerializer, value: B) {
  __s.writeInt32(543394260);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  __s.writeInt32(__pv0);
}
export function decodeB(__d: IDeserializer): B | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 543394260) return null;
  let a: number;
  /**
   * decoding param: a
   */
  a = __d.readInt32();
  return {
    _name: 'test-trait-on-param-trait.B',
    a
  };
}
export function defaultB(params: Partial<BInputParams> = {}): B {
  return B({
    a: 0,
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
  if (typeof changes['a'] !== 'undefined') {
    if (!(changes['a'] === value['a'])) {
      value = B({
        ...value,
        a: changes['a']
      });
    }
  }
  return value;
}
export interface C {
  _name: 'test-trait-on-param-trait.C';
  a: number;
}
export function isC(value: unknown): value is C {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'test-trait-on-param-trait.C'
    )
  )
    return false;
  if (
    !(
      'a' in value &&
      ((__v0) =>
        typeof __v0 === 'number' &&
        JSBI.equal(JSBI.BigInt(__v0), JSBI.BigInt(__v0)) &&
        JSBI.greaterThanOrEqual(
          JSBI.BigInt(__v0),
          JSBI.BigInt('-2147483648')
        ) &&
        JSBI.lessThanOrEqual(JSBI.BigInt(__v0), JSBI.BigInt('2147483647')))(
        value['a']
      )
    )
  )
    return false;
  return true;
}
export interface CInputParams {
  a: number;
}
export function C(params: CInputParams): C {
  return {
    _name: 'test-trait-on-param-trait.C',
    a: params['a']
  };
}
export function encodeC(__s: ISerializer, value: C) {
  __s.writeInt32(-811474198);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  __s.writeInt32(__pv0);
}
export function decodeC(__d: IDeserializer): C | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -811474198) return null;
  let a: number;
  /**
   * decoding param: a
   */
  a = __d.readInt32();
  return {
    _name: 'test-trait-on-param-trait.C',
    a
  };
}
export function defaultC(params: Partial<CInputParams> = {}): C {
  return C({
    a: 0,
    ...params
  });
}
export function compareC(__a: C, __b: C): boolean {
  return (
    /**
     * compare parameter a
     */
    __a['a'] === __b['a']
  );
}
export function updateC(value: C, changes: Partial<CInputParams>) {
  if (typeof changes['a'] !== 'undefined') {
    if (!(changes['a'] === value['a'])) {
      value = C({
        ...value,
        a: changes['a']
      });
    }
  }
  return value;
}
export interface D {
  _name: 'test-trait-on-param-trait.D';
  a: number;
}
export function isD(value: unknown): value is D {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'test-trait-on-param-trait.D'
    )
  )
    return false;
  if (
    !(
      'a' in value &&
      ((__v0) =>
        typeof __v0 === 'number' &&
        JSBI.equal(JSBI.BigInt(__v0), JSBI.BigInt(__v0)) &&
        JSBI.greaterThanOrEqual(
          JSBI.BigInt(__v0),
          JSBI.BigInt('-2147483648')
        ) &&
        JSBI.lessThanOrEqual(JSBI.BigInt(__v0), JSBI.BigInt('2147483647')))(
        value['a']
      )
    )
  )
    return false;
  return true;
}
export interface DInputParams {
  a: number;
}
export function D(params: DInputParams): D {
  return {
    _name: 'test-trait-on-param-trait.D',
    a: params['a']
  };
}
export function encodeD(__s: ISerializer, value: D) {
  __s.writeInt32(763230611);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  __s.writeInt32(__pv0);
}
export function decodeD(__d: IDeserializer): D | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 763230611) return null;
  let a: number;
  /**
   * decoding param: a
   */
  a = __d.readInt32();
  return {
    _name: 'test-trait-on-param-trait.D',
    a
  };
}
export function defaultD(params: Partial<DInputParams> = {}): D {
  return D({
    a: 0,
    ...params
  });
}
export function compareD(__a: D, __b: D): boolean {
  return (
    /**
     * compare parameter a
     */
    __a['a'] === __b['a']
  );
}
export function updateD(value: D, changes: Partial<DInputParams>) {
  if (typeof changes['a'] !== 'undefined') {
    if (!(changes['a'] === value['a'])) {
      value = D({
        ...value,
        a: changes['a']
      });
    }
  }
  return value;
}
