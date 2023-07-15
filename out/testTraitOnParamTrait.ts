import { ISerializer } from "./__types__";
import { IDeserializer } from "./__types__";
export type A = Readonly<B> | Readonly<C> | Readonly<D>;
export function encodeATrait(__s: ISerializer,value: A) {
  switch(value._name) {
    case 'testTraitOnParamTrait.B':
      encodeB(__s,value);
      break;
    case 'testTraitOnParamTrait.C':
      encodeC(__s,value);
      break;
    case 'testTraitOnParamTrait.D':
      encodeD(__s,value);
      break;
  }
}
export function decodeATrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewindInt32();
  let value: B | C | D;
  switch(__id) {
    case 625921672: {
      const tmp = decodeB(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case -896752202: {
      const tmp = decodeC(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case 676380367: {
      const tmp = decodeD(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    default: return null;
  }
  return value;
}
export function defaultATrait() {
  return defaultB();
}
export function compareATrait(__a: A, __b: A) {
  switch(__a._name) {
    case 'testTraitOnParamTrait.B':
      if(__b._name !== "testTraitOnParamTrait.B") return false;
      return compareB(__a,__b);
    case 'testTraitOnParamTrait.C':
      if(__b._name !== "testTraitOnParamTrait.C") return false;
      return compareC(__a,__b);
    case 'testTraitOnParamTrait.D':
      if(__b._name !== "testTraitOnParamTrait.D") return false;
      return compareD(__a,__b);
  }
}
export interface BInputParams {
  a: number;
}
export function B(params: BInputParams): B {
  return {
    _name: 'testTraitOnParamTrait.B',
    a: params['a']
  };
}
export function encodeB(__s: ISerializer, value: B) {
  __s.writeInt32(625921672);
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
  if(__id !== 625921672) return null;
  let a: number;
  /**
   * decoding param: a
   */
  a = __d.readInt32();
  return {
    _name: 'testTraitOnParamTrait.B',
    a
  };
}
export interface B  {
  _name: 'testTraitOnParamTrait.B';
  a: number;
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
export interface CInputParams {
  a: number;
}
export function C(params: CInputParams): C {
  return {
    _name: 'testTraitOnParamTrait.C',
    a: params['a']
  };
}
export function encodeC(__s: ISerializer, value: C) {
  __s.writeInt32(-896752202);
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
  if(__id !== -896752202) return null;
  let a: number;
  /**
   * decoding param: a
   */
  a = __d.readInt32();
  return {
    _name: 'testTraitOnParamTrait.C',
    a
  };
}
export interface C  {
  _name: 'testTraitOnParamTrait.C';
  a: number;
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
  if(typeof changes['a'] !== 'undefined') {
    if(!(changes['a'] === value['a'])) {
      value = C({
        ...value,
        a: changes['a'],
      });
    }
  }
  return value;
}
export interface DInputParams {
  a: number;
}
export function D(params: DInputParams): D {
  return {
    _name: 'testTraitOnParamTrait.D',
    a: params['a']
  };
}
export function encodeD(__s: ISerializer, value: D) {
  __s.writeInt32(676380367);
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
  if(__id !== 676380367) return null;
  let a: number;
  /**
   * decoding param: a
   */
  a = __d.readInt32();
  return {
    _name: 'testTraitOnParamTrait.D',
    a
  };
}
export interface D  {
  _name: 'testTraitOnParamTrait.D';
  a: number;
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
  if(typeof changes['a'] !== 'undefined') {
    if(!(changes['a'] === value['a'])) {
      value = D({
        ...value,
        a: changes['a'],
      });
    }
  }
  return value;
}
