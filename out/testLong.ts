import { ISerializer } from './__types__';
import { IDeserializer } from './__types__';
export const AMetadata = {
  name: 'A',
  params: [
    {
      name: 'a',
      type: {
        type: 'generic',
        value: 'long',
      },
    },
  ],
};
export interface AInputParams {
  a: string;
}
export function A(params: AInputParams): A {
  return {
    _name: 'testLong.A',
    a: params['a'],
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
  if (__id !== -1688212411) return null;
  let a: string;
  /**
   * decoding param: a
   */
  a = __d.readSignedLong();
  return {
    _name: 'testLong.A',
    a,
  };
}
export interface A {
  _name: 'testLong.A';
  a: string;
}
export function defaultA(params: Partial<AInputParams> = {}): A {
  return A({
    a: '0',
    ...params,
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
  if (typeof changes['a'] !== 'undefined') {
    if (!(changes['a'] === value['a'])) {
      value = A({
        ...value,
        a: changes['a'],
      });
    }
  }
  return value;
}
export const BMetadata = {
  name: 'B',
  params: [
    {
      name: 'a',
      type: {
        type: 'generic',
        value: 'ulong',
      },
    },
  ],
};
export interface BInputParams {
  a: string;
}
export function B(params: BInputParams): B {
  return {
    _name: 'testLong.B',
    a: params['a'],
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
  if (__id !== 1885886278) return null;
  let a: string;
  /**
   * decoding param: a
   */
  a = __d.readUnsignedLong();
  return {
    _name: 'testLong.B',
    a,
  };
}
export interface B {
  _name: 'testLong.B';
  a: string;
}
export function defaultB(params: Partial<BInputParams> = {}): B {
  return B({
    a: '0',
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
  params: [
    {
      name: 'a',
      type: {
        type: 'generic',
        value: 'long',
      },
    },
    {
      name: 'b',
      type: {
        type: 'generic',
        value: 'ulong',
      },
    },
    {
      name: 'c',
      type: {
        type: 'generic',
        value: 'int',
      },
    },
  ],
};
export interface CInputParams {
  a: string;
  b: string;
  c: number;
}
export function C(params: CInputParams): C {
  return {
    _name: 'testLong.C',
    a: params['a'],
    b: params['b'],
    c: params['c'],
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
  if (__id !== -523698750) return null;
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
    _name: 'testLong.C',
    a,
    b,
    c,
  };
}
export interface C {
  _name: 'testLong.C';
  a: string;
  b: string;
  c: number;
}
export function defaultC(params: Partial<CInputParams> = {}): C {
  return C({
    a: '0',
    b: '0',
    c: 0,
    ...params,
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
  if (typeof changes['a'] !== 'undefined') {
    if (!(changes['a'] === value['a'])) {
      value = C({
        ...value,
        a: changes['a'],
      });
    }
  }
  if (typeof changes['b'] !== 'undefined') {
    if (!(changes['b'] === value['b'])) {
      value = C({
        ...value,
        b: changes['b'],
      });
    }
  }
  if (typeof changes['c'] !== 'undefined') {
    if (!(changes['c'] === value['c'])) {
      value = C({
        ...value,
        c: changes['c'],
      });
    }
  }
  return value;
}
