import { ISerializer } from './__types__';
import { IDeserializer } from './__types__';
export type A = Readonly<B> | Readonly<C> | Readonly<D>;
export const AMetadata = {
  name: 'A',
  id: -945659736,
  kind: 'trait',
};
export function encodeATrait(__s: ISerializer, value: A) {
  switch (value._name) {
    case 'testTraitOnParamTrait.B':
      encodeB(__s, value);
      break;
    case 'testTraitOnParamTrait.C':
      encodeC(__s, value);
      break;
    case 'testTraitOnParamTrait.D':
      encodeD(__s, value);
      break;
  }
}
export function decodeATrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewindInt32();
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
    case 'testTraitOnParamTrait.B':
      if (__b._name !== 'testTraitOnParamTrait.B') return false;
      return compareB(__a, __b);
    case 'testTraitOnParamTrait.C':
      if (__b._name !== 'testTraitOnParamTrait.C') return false;
      return compareC(__a, __b);
    case 'testTraitOnParamTrait.D':
      if (__b._name !== 'testTraitOnParamTrait.D') return false;
      return compareD(__a, __b);
  }
}
export const BMetadata = {
  name: 'B',
  id: 543394260,
  kind: 'type',
  params: [
    {
      name: 'a',
      type: {
        type: 'generic',
        value: 'int',
      },
    },
  ],
};
export interface BInputParams {
  a: number;
}
export function B(params: BInputParams): B {
  return {
    _name: 'testTraitOnParamTrait.B',
    a: params['a'],
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
    _name: 'testTraitOnParamTrait.B',
    a,
  };
}
export interface B {
  _name: 'testTraitOnParamTrait.B';
  a: number;
}
export function defaultB(params: Partial<BInputParams> = {}): B {
  return B({
    a: 0,
    ...params,
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
        a: changes['a'],
      });
    }
  }
  return value;
}
export const CMetadata = {
  name: 'C',
  id: -811474198,
  kind: 'type',
  params: [
    {
      name: 'a',
      type: {
        type: 'generic',
        value: 'int',
      },
    },
  ],
};
export interface CInputParams {
  a: number;
}
export function C(params: CInputParams): C {
  return {
    _name: 'testTraitOnParamTrait.C',
    a: params['a'],
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
    _name: 'testTraitOnParamTrait.C',
    a,
  };
}
export interface C {
  _name: 'testTraitOnParamTrait.C';
  a: number;
}
export function defaultC(params: Partial<CInputParams> = {}): C {
  return C({
    a: 0,
    ...params,
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
        a: changes['a'],
      });
    }
  }
  return value;
}
export const DMetadata = {
  name: 'D',
  id: 763230611,
  kind: 'type',
  params: [
    {
      name: 'a',
      type: {
        type: 'generic',
        value: 'int',
      },
    },
  ],
};
export interface DInputParams {
  a: number;
}
export function D(params: DInputParams): D {
  return {
    _name: 'testTraitOnParamTrait.D',
    a: params['a'],
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
    _name: 'testTraitOnParamTrait.D',
    a,
  };
}
export interface D {
  _name: 'testTraitOnParamTrait.D';
  a: number;
}
export function defaultD(params: Partial<DInputParams> = {}): D {
  return D({
    a: 0,
    ...params,
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
        a: changes['a'],
      });
    }
  }
  return value;
}
