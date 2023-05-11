import {User} from "./User";
import {Conversations} from "./conversation/index";
import {Request} from "./Request";
import {ISerializer} from "./__types__";
import {IDeserializer} from "./__types__";
import {encodeUserTrait} from "./User";
import {decodeUserTrait} from "./User";
import {compareUserTrait} from "./User";
import {compareUserTrait as compareUserTrait1} from "./User";
import {IRequest} from "./__types__";
export interface testMapInputParams {
  a: ReadonlyMap<string, string>;
}
export function testMap(params: testMapInputParams): testMap {
  return {
    _name: 'schema.testMap',
    a: params['a']
  };
}
export function encodeTestMap(__s: ISerializer, value: testMap) {
  __s.writeInt32(538583618);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  __s.writeUint32(__pv0.size);
  for(const [__k1,__v1] of __pv0) {
    __s.writeString(__k1);
    __s.writeString(__v1);
  }
}
export function decodeTestMap(__d: IDeserializer): testMap | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 538583618) return null;
  let a: Map<string, string>;
  /**
   * decoding param: a
   */
  const __l1 = __d.readUint32();
  const __o1 = new Map<string, string>();
  a = __o1;
  let __k1: string;
  let __v1: string;
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    __k1 = __d.readString();
    __v1 = __d.readString();
    __o1.set(__k1, __v1);
  }
  return {
    _name: 'schema.testMap',
    a
  };
}
export interface testMap  {
  _name: 'schema.testMap';
  a: ReadonlyMap<string, string>;
}
export function defaultTestMap(params: Partial<testMapInputParams> = {}): testMap {
  return testMap({
    a: new Map<string, string>(),
    ...params
  });
}
export function compareTestMap(__a: testMap, __b: testMap): boolean {
  return (
    /**
     * compare parameter a
     */
    ((l1,l2) => (l1.every(([k1,v1],i) => (k1 === l2[i][0] && v1 === l2[i][1]))))(Array.from(__a['a']),Array.from(__b['a']))
  );
}
export function updateTestMap(value: testMap, changes: Partial<testMapInputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(((l1,l2) => (l1.every(([k1,v1],i) => (k1 === l2[i][0] && v1 === l2[i][1]))))(Array.from(changes['a']),Array.from(value['a'])))) {
      value = testMap({
        ...value,
        a: changes['a'],
      });
    }
  }
  return value;
}
export interface testMap2InputParams {
  a: ReadonlyMap<string | null, string>;
  b: ReadonlyMap<string | null, [string,ReadonlyMap<number, number>]>;
}
export function testMap2(params: testMap2InputParams): testMap2 {
  return {
    _name: 'schema.testMap2',
    a: params['a'],
    b: params['b']
  };
}
export function encodeTestMap2(__s: ISerializer, value: testMap2) {
  __s.writeInt32(929931693);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  __s.writeUint32(__pv0.size);
  for(const [__k1,__v1] of __pv0) {
    if(__k1 === null) {
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
  for(const [__k5,__v5] of __pv4) {
    if(__k5 === null) {
      __s.writeUint8(0);
    } else {
      __s.writeUint8(1);
      __s.writeString(__k5);
    }
    const __t8 = __v5[0];
    __s.writeString(__t8);
    const __t9 = __v5[1];
    __s.writeUint32(__t9.size);
    for(const [__k11,__v11] of __t9) {
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
  if(__id !== 929931693) return null;
  let a: Map<string | null, string>;
  let b: Map<string | null, [string,Map<number, number>]>;
  /**
   * decoding param: a
   */
  const __l1 = __d.readUint32();
  const __o1 = new Map<string | null, string>();
  a = __o1;
  let __k1: string | null;
  let __v1: string;
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    if(__d.readUint8() === 1) {
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
  const __o5 = new Map<string | null, [string,Map<number, number>]>();
  b = __o5;
  let __k5: string | null;
  let __v5: [string,Map<number, number>];
  for(let __i5 = 0; __i5 < __l5; __i5++) {
    if(__d.readUint8() === 1) {
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
    for(let __i10 = 0; __i10 < __l10; __i10++) {
      __k10 = __d.readInt32();
      __v10 = __d.readInt32();
      __o10.set(__k10, __v10);
    }
    __v5 = [__e8,__e9];
    __o5.set(__k5, __v5);
  }
  return {
    _name: 'schema.testMap2',
    a,
    b
  };
}
export interface testMap2  {
  _name: 'schema.testMap2';
  a: ReadonlyMap<string | null, string>;
  b: ReadonlyMap<string | null, [string,ReadonlyMap<number, number>]>;
}
export function defaultTestMap2(params: Partial<testMap2InputParams> = {}): testMap2 {
  return testMap2({
    a: new Map<string | null, string>(),
    b: new Map<string | null, [string,Map<number, number>]>(),
    ...params
  });
}
export function compareTestMap2(__a: testMap2, __b: testMap2): boolean {
  return (
    /**
     * compare parameter a
     */
    ((l1,l2) => (l1.every(([k1,v1],i) => (((__dp11, __dp12) => __dp11 !== null && __dp12 !== null ? __dp11 === __dp12 : __dp11 === __dp12)(k1,l2[i][0]) && v1 === l2[i][1]))))(Array.from(__a['a']),Array.from(__b['a'])) &&
    /**
     * compare parameter b
     */
    ((l1,l2) => (l1.every(([k1,v1],i) => (((__dp21, __dp22) => __dp21 !== null && __dp22 !== null ? __dp21 === __dp22 : __dp21 === __dp22)(k1,l2[i][0]) && /* compare tuple item 0 of type string */ ((__a40, __b40) => __a40 === __b40)(v1[0],l2[i][1][0]) && /* compare tuple item 1 of type ReadonlyMap<number, number> */ ((__a41, __b41) => ((l1,l2) => (l1.every(([k1,v1],i) => (k1 === l2[i][0] && v1 === l2[i][1]))))(Array.from(__a41),Array.from(__b41)))(v1[1],l2[i][1][1])))))(Array.from(__a['b']),Array.from(__b['b']))
  );
}
export function updateTestMap2(value: testMap2, changes: Partial<testMap2InputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(((l1,l2) => (l1.every(([k1,v1],i) => (((__dp21, __dp22) => __dp21 !== null && __dp22 !== null ? __dp21 === __dp22 : __dp21 === __dp22)(k1,l2[i][0]) && v1 === l2[i][1]))))(Array.from(changes['a']),Array.from(value['a'])))) {
      value = testMap2({
        ...value,
        a: changes['a'],
      });
    }
  }
  if(typeof changes['b'] !== 'undefined') {
    if(!(((l1,l2) => (l1.every(([k1,v1],i) => (((__dp61, __dp62) => __dp61 !== null && __dp62 !== null ? __dp61 === __dp62 : __dp61 === __dp62)(k1,l2[i][0]) && /* compare tuple item 0 of type string */ ((__a80, __b80) => __a80 === __b80)(v1[0],l2[i][1][0]) && /* compare tuple item 1 of type ReadonlyMap<number, number> */ ((__a81, __b81) => ((l1,l2) => (l1.every(([k1,v1],i) => (k1 === l2[i][0] && v1 === l2[i][1]))))(Array.from(__a81),Array.from(__b81)))(v1[1],l2[i][1][1])))))(Array.from(changes['b']),Array.from(value['b'])))) {
      value = testMap2({
        ...value,
        b: changes['b'],
      });
    }
  }
  return value;
}
export interface testMap3InputParams {
  a: ReadonlyMap<Readonly<testMap2>, string>;
}
export function testMap3(params: testMap3InputParams): testMap3 {
  return {
    _name: 'schema.testMap3',
    a: params['a']
  };
}
export function encodeTestMap3(__s: ISerializer, value: testMap3) {
  __s.writeInt32(-874850907);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  __s.writeUint32(__pv0.size);
  for(const [__k1,__v1] of __pv0) {
    encodeTestMap2(__s,__k1);
    __s.writeString(__v1);
  }
}
export function decodeTestMap3(__d: IDeserializer): testMap3 | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -874850907) return null;
  let a: Map<testMap2, string>;
  /**
   * decoding param: a
   */
  const __l1 = __d.readUint32();
  const __o1 = new Map<testMap2, string>();
  a = __o1;
  let __k1: testMap2;
  let __v1: string;
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    const __tmp2 = decodeTestMap2(__d);
    if(__tmp2 === null) return null;
    __k1 = __tmp2;
    __v1 = __d.readString();
    __o1.set(__k1, __v1);
  }
  return {
    _name: 'schema.testMap3',
    a
  };
}
export interface testMap3  {
  _name: 'schema.testMap3';
  a: ReadonlyMap<Readonly<testMap2>, string>;
}
export function defaultTestMap3(params: Partial<testMap3InputParams> = {}): testMap3 {
  return testMap3({
    a: new Map<testMap2, string>(),
    ...params
  });
}
export function compareTestMap3(__a: testMap3, __b: testMap3): boolean {
  return (
    /**
     * compare parameter a
     */
    ((l1,l2) => (l1.every(([k1,v1],i) => (compareTestMap2(k1,l2[i][0]) && v1 === l2[i][1]))))(Array.from(__a['a']),Array.from(__b['a']))
  );
}
export function updateTestMap3(value: testMap3, changes: Partial<testMap3InputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(((l1,l2) => (l1.every(([k1,v1],i) => (compareTestMap2(k1,l2[i][0]) && v1 === l2[i][1]))))(Array.from(changes['a']),Array.from(value['a'])))) {
      value = testMap3({
        ...value,
        a: changes['a'],
      });
    }
  }
  return value;
}
export interface testSetInputParams {
  a: ReadonlySet<string>;
  b: ReadonlySet<number>;
}
export function testSet(params: testSetInputParams): testSet {
  return {
    _name: 'schema.testSet',
    a: params['a'],
    b: params['b']
  };
}
export function encodeTestSet(__s: ISerializer, value: testSet) {
  __s.writeInt32(866975412);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  const __l1 = __pv0.size;
  __s.writeUint32(__l1);
  for(const __v1 of __pv0) {
    __s.writeString(__v1);
  }
  /**
   * encoding param: b
   */
  const __pv2 = value['b'];
  const __l3 = __pv2.size;
  __s.writeUint32(__l3);
  for(const __v3 of __pv2) {
    __s.writeInt32(__v3);
  }
}
export function decodeTestSet(__d: IDeserializer): testSet | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 866975412) return null;
  let a: Set<string>;
  let b: Set<number>;
  /**
   * decoding param: a
   */
  let __tmp1: string;
  const __l1 = __d.readUint32();
  const __o1 = new Set<string>();
  a = __o1;
  for(let __i1 = 0; __i1 < __l1; __i1++) {
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
  for(let __i3 = 0; __i3 < __l3; __i3++) {
    __tmp3 = __d.readInt32();
    __o3.add(__tmp3);
  }
  return {
    _name: 'schema.testSet',
    a,
    b
  };
}
export interface testSet  {
  _name: 'schema.testSet';
  a: ReadonlySet<string>;
  b: ReadonlySet<number>;
}
export function defaultTestSet(params: Partial<testSetInputParams> = {}): testSet {
  return testSet({
    a: new Set<string>(),
    b: new Set<number>(),
    ...params
  });
}
export function compareTestSet(__a: testSet, __b: testSet): boolean {
  return (
    /**
     * compare parameter a
     */
    ((__a0,__b0) => (__a0.every((__it0,__i0) => (__it0 === __b0[__i0]))))(Array.from(__a['a']),Array.from(__b['a'])) &&
    /**
     * compare parameter b
     */
    ((__a1,__b1) => (__a1.every((__it1,__i1) => (__it1 === __b1[__i1]))))(Array.from(__a['b']),Array.from(__b['b']))
  );
}
export function updateTestSet(value: testSet, changes: Partial<testSetInputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(((__a1,__b1) => (__a1.every((__it1,__i1) => (__it1 === __b1[__i1]))))(Array.from(changes['a']),Array.from(value['a'])))) {
      value = testSet({
        ...value,
        a: changes['a'],
      });
    }
  }
  if(typeof changes['b'] !== 'undefined') {
    if(!(((__a3,__b3) => (__a3.every((__it3,__i3) => (__it3 === __b3[__i3]))))(Array.from(changes['b']),Array.from(value['b'])))) {
      value = testSet({
        ...value,
        b: changes['b'],
      });
    }
  }
  return value;
}
export interface testSet2InputParams {
  a: ReadonlySet<string>;
  b: ReadonlySet<ReadonlyMap<string, string>>;
  c: ReadonlySet<[number,number]>;
}
export function testSet2(params: testSet2InputParams): testSet2 {
  return {
    _name: 'schema.testSet2',
    a: params['a'],
    b: params['b'],
    c: params['c']
  };
}
export function encodeTestSet2(__s: ISerializer, value: testSet2) {
  __s.writeInt32(-1158385585);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  const __l1 = __pv0.size;
  __s.writeUint32(__l1);
  for(const __v1 of __pv0) {
    __s.writeString(__v1);
  }
  /**
   * encoding param: b
   */
  const __pv2 = value['b'];
  const __l3 = __pv2.size;
  __s.writeUint32(__l3);
  for(const __v3 of __pv2) {
    __s.writeUint32(__v3.size);
    for(const [__k4,__v4] of __v3) {
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
  for(const __v7 of __pv6) {
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
  if(__id !== -1158385585) return null;
  let a: Set<string>;
  let b: Set<Map<string, string>>;
  let c: Set<[number,number]>;
  /**
   * decoding param: a
   */
  let __tmp1: string;
  const __l1 = __d.readUint32();
  const __o1 = new Set<string>();
  a = __o1;
  for(let __i1 = 0; __i1 < __l1; __i1++) {
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
  for(let __i3 = 0; __i3 < __l3; __i3++) {
    const __l4 = __d.readUint32();
    const __o4 = new Map<string, string>();
    __tmp3 = __o4;
    let __k4: string;
    let __v4: string;
    for(let __i4 = 0; __i4 < __l4; __i4++) {
      __k4 = __d.readString();
      __v4 = __d.readString();
      __o4.set(__k4, __v4);
    }
    __o3.add(__tmp3);
  }
  /**
   * decoding param: c
   */
  let __tmp7: [number,number];
  const __l7 = __d.readUint32();
  const __o7 = new Set<[number,number]>();
  c = __o7;
  for(let __i7 = 0; __i7 < __l7; __i7++) {
    let __e8: number;
    __e8 = __d.readInt32();
    let __e9: number;
    __e9 = __d.readInt32();
    __tmp7 = [__e8,__e9];
    __o7.add(__tmp7);
  }
  return {
    _name: 'schema.testSet2',
    a,
    b,
    c
  };
}
export interface testSet2  {
  _name: 'schema.testSet2';
  a: ReadonlySet<string>;
  b: ReadonlySet<ReadonlyMap<string, string>>;
  c: ReadonlySet<[number,number]>;
}
export function defaultTestSet2(params: Partial<testSet2InputParams> = {}): testSet2 {
  return testSet2({
    a: new Set<string>(),
    b: new Set<Map<string, string>>(),
    c: new Set<[number,number]>(),
    ...params
  });
}
export function compareTestSet2(__a: testSet2, __b: testSet2): boolean {
  return (
    /**
     * compare parameter a
     */
    ((__a0,__b0) => (__a0.every((__it0,__i0) => (__it0 === __b0[__i0]))))(Array.from(__a['a']),Array.from(__b['a'])) &&
    /**
     * compare parameter b
     */
    ((__a1,__b1) => (__a1.every((__it1,__i1) => (((l1,l2) => (l1.every(([k1,v1],i) => (k1 === l2[i][0] && v1 === l2[i][1]))))(Array.from(__it1),Array.from(__b1[__i1]))))))(Array.from(__a['b']),Array.from(__b['b'])) &&
    /**
     * compare parameter c
     */
    ((__a2,__b2) => (__a2.every((__it2,__i2) => (/* compare tuple item 0 of type number */ ((__a30, __b30) => __a30 === __b30)(__it2[0],__b2[__i2][0]) && /* compare tuple item 1 of type number */ ((__a31, __b31) => __a31 === __b31)(__it2[1],__b2[__i2][1])))))(Array.from(__a['c']),Array.from(__b['c']))
  );
}
export function updateTestSet2(value: testSet2, changes: Partial<testSet2InputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(((__a1,__b1) => (__a1.every((__it1,__i1) => (__it1 === __b1[__i1]))))(Array.from(changes['a']),Array.from(value['a'])))) {
      value = testSet2({
        ...value,
        a: changes['a'],
      });
    }
  }
  if(typeof changes['b'] !== 'undefined') {
    if(!(((__a3,__b3) => (__a3.every((__it3,__i3) => (((l1,l2) => (l1.every(([k1,v1],i) => (k1 === l2[i][0] && v1 === l2[i][1]))))(Array.from(__it3),Array.from(__b3[__i3]))))))(Array.from(changes['b']),Array.from(value['b'])))) {
      value = testSet2({
        ...value,
        b: changes['b'],
      });
    }
  }
  if(typeof changes['c'] !== 'undefined') {
    if(!(((__a7,__b7) => (__a7.every((__it7,__i7) => (/* compare tuple item 0 of type number */ ((__a80, __b80) => __a80 === __b80)(__it7[0],__b7[__i7][0]) && /* compare tuple item 1 of type number */ ((__a81, __b81) => __a81 === __b81)(__it7[1],__b7[__i7][1])))))(Array.from(changes['c']),Array.from(value['c'])))) {
      value = testSet2({
        ...value,
        c: changes['c'],
      });
    }
  }
  return value;
}
export interface VoidInputParams {
}
export function Void(_: VoidInputParams = {}): Void {
  return {
    _name: 'schema.Void'
  };
}
export function encodeVoid(__s: ISerializer, _: Void) {
  __s.writeInt32(-1357667663);
}
export function decodeVoid(__d: IDeserializer): Void | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1357667663) return null;
  return {
    _name: 'schema.Void',
  };
}
export interface Void  {
  _name: 'schema.Void';
}
export function defaultVoid(params: Partial<VoidInputParams> = {}): Void {
  return Void({
    ...params
  });
}
export function compareVoid(__a: Void, __b: Void): boolean {
  return true;
}
export function updateVoid(value: Void, _: Partial<VoidInputParams>) {
  return value;
}
export interface msgInputParams {
  data: Uint8Array;
}
export function msg(params: msgInputParams): msg {
  return {
    _name: 'schema.msg',
    data: params['data']
  };
}
export function encodeMsg(__s: ISerializer, value: msg) {
  __s.writeInt32(716170895);
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
  if(__id !== 716170895) return null;
  let data: Uint8Array;
  /**
   * decoding param: data
   */
  data = __d.readBuffer(__d.readUint32());
  return {
    _name: 'schema.msg',
    data
  };
}
export interface msg  {
  _name: 'schema.msg';
  data: Uint8Array;
}
export function defaultMsg(params: Partial<msgInputParams> = {}): msg {
  return msg({
    data: new Uint8Array(0),
    ...params
  });
}
export function compareMsg(__a: msg, __b: msg): boolean {
  return (
    /**
     * compare parameter data
     */
    __a['data'].byteLength === __b['data'].byteLength && __a['data'].every((__byte,index) => __b['data'][index] === __byte)
  );
}
export function updateMsg(value: msg, changes: Partial<msgInputParams>) {
  if(typeof changes['data'] !== 'undefined') {
    if(!(changes['data'].byteLength === value['data'].byteLength && changes['data'].every((__byte,index) => value['data'][index] === __byte))) {
      value = msg({
        ...value,
        data: changes['data'],
      });
    }
  }
  return value;
}
export type Result = Readonly<Users> | Readonly<Posts>;
export function encodeResultTrait(__s: ISerializer,value: Result) {
  switch(value._name) {
    case 'schema.Users':
      encodeUsers(__s,value);
      break;
    case 'schema.Posts':
      encodePosts(__s,value);
      break;
  }
}
export function decodeResultTrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewindInt32();
  let value: Users | Posts;
  switch(__id) {
    case 594466339: {
      const tmp = decodeUsers(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case -1199678677: {
      const tmp = decodePosts(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    default: return null;
  }
  return value;
}
export function defaultResultTrait() {
  return defaultUsers();
}
export function compareResultTrait(__a: Result, __b: Result) {
  switch(__a._name) {
    case 'schema.Users':
      if(__b._name !== "schema.Users") return false;
      return compareUsers(__a,__b);
    case 'schema.Posts':
      if(__b._name !== "schema.Posts") return false;
      return comparePosts(__a,__b);
  }
}
export interface UsersInputParams {
  users: ReadonlyArray<Readonly<User>>;
}
export function Users(params: UsersInputParams): Users {
  return {
    _name: 'schema.Users',
    users: params['users']
  };
}
export function encodeUsers(__s: ISerializer, value: Users) {
  __s.writeInt32(594466339);
  /**
   * encoding param: users
   */
  const __pv0 = value['users'];
  const __l1 = __pv0.length;
  __s.writeUint32(__l1);
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    const __v__i1 = __pv0[__i1];
    encodeUserTrait(__s,__v__i1);
  }
}
export function decodeUsers(__d: IDeserializer): Users | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 594466339) return null;
  let users: Array<User>;
  /**
   * decoding param: users
   */
  const __l1 = __d.readUint32();
  const __o1 = new Array<User>(__l1);
  users = __o1;
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    const tmp3 = decodeUserTrait(__d);
    if(tmp3 === null) return null;
    __o1[__i1] = tmp3;
  }
  return {
    _name: 'schema.Users',
    users
  };
}
export interface Users  {
  _name: 'schema.Users';
  users: ReadonlyArray<Readonly<User>>;
}
export function defaultUsers(params: Partial<UsersInputParams> = {}): Users {
  return Users({
    users: [],
    ...params
  });
}
export function compareUsers(__a: Users, __b: Users): boolean {
  return (
    /**
     * compare parameter users
     */
    __a['users'].length === __b['users'].length && __a['users'].every((__i,index) => (compareUserTrait(__i,__b['users'][index])))
  );
}
export function updateUsers(value: Users, changes: Partial<UsersInputParams>) {
  if(typeof changes['users'] !== 'undefined') {
    if(!(changes['users'].length === value['users'].length && changes['users'].every((__i,index) => (compareUserTrait1(__i,value['users'][index]))))) {
      value = Users({
        ...value,
        users: changes['users'],
      });
    }
  }
  return value;
}
export interface GetUserByIdInputParams {
  userId: number;
}
export function GetUserById(params: GetUserByIdInputParams): GetUserById {
  return {
    _name: 'schema.GetUserById',
    userId: params['userId']
  };
}
export function encodeGetUserById(__s: ISerializer, value: GetUserById) {
  __s.writeInt32(-1984357298);
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
  if(__id !== -1984357298) return null;
  let userId: number;
  /**
   * decoding param: userId
   */
  userId = __d.readUint32();
  return {
    _name: 'schema.GetUserById',
    userId
  };
}
export interface GetUserById extends IRequest<Readonly<Users>> {
  _name: 'schema.GetUserById';
  userId: number;
}
export function defaultGetUserById(params: Partial<GetUserByIdInputParams> = {}): GetUserById {
  return GetUserById({
    userId: 0,
    ...params
  });
}
export function compareGetUserById(__a: GetUserById, __b: GetUserById): boolean {
  return (
    /**
     * compare parameter userId
     */
    __a['userId'] === __b['userId']
  );
}
export function updateGetUserById(value: GetUserById, changes: Partial<GetUserByIdInputParams>) {
  if(typeof changes['userId'] !== 'undefined') {
    if(!(changes['userId'] === value['userId'])) {
      value = GetUserById({
        ...value,
        userId: changes['userId'],
      });
    }
  }
  return value;
}
export interface PostInputParams {
  id: number;
}
export function Post(params: PostInputParams): Post {
  return {
    _name: 'schema.Post',
    id: params['id']
  };
}
export function encodePost(__s: ISerializer, value: Post) {
  __s.writeInt32(377172772);
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
  if(__id !== 377172772) return null;
  let id: number;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  return {
    _name: 'schema.Post',
    id
  };
}
export interface Post  {
  _name: 'schema.Post';
  id: number;
}
export function defaultPost(params: Partial<PostInputParams> = {}): Post {
  return Post({
    id: 0,
    ...params
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
  if(typeof changes['id'] !== 'undefined') {
    if(!(changes['id'] === value['id'])) {
      value = Post({
        ...value,
        id: changes['id'],
      });
    }
  }
  return value;
}
export interface PostsInputParams {
  posts: ReadonlyArray<Readonly<Post>>;
}
export function Posts(params: PostsInputParams): Posts {
  return {
    _name: 'schema.Posts',
    posts: params['posts']
  };
}
export function encodePosts(__s: ISerializer, value: Posts) {
  __s.writeInt32(-1199678677);
  /**
   * encoding param: posts
   */
  const __pv0 = value['posts'];
  const __l1 = __pv0.length;
  __s.writeUint32(__l1);
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    const __v__i1 = __pv0[__i1];
    encodePost(__s,__v__i1);
  }
}
export function decodePosts(__d: IDeserializer): Posts | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1199678677) return null;
  let posts: Array<Post>;
  /**
   * decoding param: posts
   */
  const __l1 = __d.readUint32();
  const __o1 = new Array<Post>(__l1);
  posts = __o1;
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    const __tmp2 = decodePost(__d);
    if(__tmp2 === null) return null;
    __o1[__i1] = __tmp2;
  }
  return {
    _name: 'schema.Posts',
    posts
  };
}
export interface Posts  {
  _name: 'schema.Posts';
  posts: ReadonlyArray<Readonly<Post>>;
}
export function defaultPosts(params: Partial<PostsInputParams> = {}): Posts {
  return Posts({
    posts: [],
    ...params
  });
}
export function comparePosts(__a: Posts, __b: Posts): boolean {
  return (
    /**
     * compare parameter posts
     */
    __a['posts'].length === __b['posts'].length && __a['posts'].every((__i,index) => (comparePost(__i,__b['posts'][index])))
  );
}
export function updatePosts(value: Posts, changes: Partial<PostsInputParams>) {
  if(typeof changes['posts'] !== 'undefined') {
    if(!(changes['posts'].length === value['posts'].length && changes['posts'].every((__i,index) => (comparePost(__i,value['posts'][index]))))) {
      value = Posts({
        ...value,
        posts: changes['posts'],
      });
    }
  }
  return value;
}
export interface GetPostByIdInputParams {
  postId: number;
}
export function GetPostById(params: GetPostByIdInputParams): GetPostById {
  return {
    _name: 'schema.GetPostById',
    postId: params['postId']
  };
}
export function encodeGetPostById(__s: ISerializer, value: GetPostById) {
  __s.writeInt32(-1572332129);
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
  if(__id !== -1572332129) return null;
  let postId: number;
  /**
   * decoding param: postId
   */
  postId = __d.readUint32();
  return {
    _name: 'schema.GetPostById',
    postId
  };
}
export interface GetPostById extends IRequest<Readonly<Posts>> {
  _name: 'schema.GetPostById';
  postId: number;
}
export function defaultGetPostById(params: Partial<GetPostByIdInputParams> = {}): GetPostById {
  return GetPostById({
    postId: 0,
    ...params
  });
}
export function compareGetPostById(__a: GetPostById, __b: GetPostById): boolean {
  return (
    /**
     * compare parameter postId
     */
    __a['postId'] === __b['postId']
  );
}
export function updateGetPostById(value: GetPostById, changes: Partial<GetPostByIdInputParams>) {
  if(typeof changes['postId'] !== 'undefined') {
    if(!(changes['postId'] === value['postId'])) {
      value = GetPostById({
        ...value,
        postId: changes['postId'],
      });
    }
  }
  return value;
}
export interface GetConversationsInputParams {
}
export function GetConversations(_: GetConversationsInputParams = {}): GetConversations {
  return {
    _name: 'schema.GetConversations'
  };
}
export function encodeGetConversations(__s: ISerializer, _: GetConversations) {
  __s.writeInt32(814848329);
}
export function decodeGetConversations(__d: IDeserializer): GetConversations | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 814848329) return null;
  return {
    _name: 'schema.GetConversations',
  };
}
export interface GetConversations extends IRequest<Readonly<Conversations>> {
  _name: 'schema.GetConversations';
}
export function defaultGetConversations(params: Partial<GetConversationsInputParams> = {}): GetConversations {
  return GetConversations({
    ...params
  });
}
export function compareGetConversations(__a: GetConversations, __b: GetConversations): boolean {
  return true;
}
export function updateGetConversations(value: GetConversations, _: Partial<GetConversationsInputParams>) {
  return value;
}
export interface CoordinatesInputParams {
  latitude: number;
  longitude: number;
}
export function Coordinates(params: CoordinatesInputParams): Coordinates {
  return {
    _name: 'schema.Coordinates',
    latitude: params['latitude'],
    longitude: params['longitude']
  };
}
export function encodeCoordinates(__s: ISerializer, value: Coordinates) {
  __s.writeInt32(1260153754);
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
  if(__id !== 1260153754) return null;
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
    longitude
  };
}
export interface Coordinates  {
  _name: 'schema.Coordinates';
  latitude: number;
  longitude: number;
}
export function defaultCoordinates(params: Partial<CoordinatesInputParams> = {}): Coordinates {
  return Coordinates({
    latitude: 0.0,
    longitude: 0.0,
    ...params
  });
}
export function compareCoordinates(__a: Coordinates, __b: Coordinates): boolean {
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
export function updateCoordinates(value: Coordinates, changes: Partial<CoordinatesInputParams>) {
  if(typeof changes['latitude'] !== 'undefined') {
    if(!(changes['latitude'] === value['latitude'])) {
      value = Coordinates({
        ...value,
        latitude: changes['latitude'],
      });
    }
  }
  if(typeof changes['longitude'] !== 'undefined') {
    if(!(changes['longitude'] === value['longitude'])) {
      value = Coordinates({
        ...value,
        longitude: changes['longitude'],
      });
    }
  }
  return value;
}
export interface ShouldSupportSeveralSequentialVectorParamsInputParams {
  a: ReadonlyArray<number>;
  b: ReadonlyArray<number>;
  c: ReadonlyArray<string>;
  d: ReadonlyArray<number>;
  e: ReadonlyArray<number>;
  f: ReadonlyArray<ReadonlyArray<number> | null>;
  g: [number,number,number,ReadonlyArray<number>,string | null];
}
export function ShouldSupportSeveralSequentialVectorParams(params: ShouldSupportSeveralSequentialVectorParamsInputParams): ShouldSupportSeveralSequentialVectorParams {
  return {
    _name: 'schema.ShouldSupportSeveralSequentialVectorParams',
    a: params['a'],
    b: params['b'],
    c: params['c'],
    d: params['d'],
    e: params['e'],
    f: params['f'],
    g: params['g']
  };
}
export function encodeShouldSupportSeveralSequentialVectorParams(__s: ISerializer, value: ShouldSupportSeveralSequentialVectorParams) {
  __s.writeInt32(-992083773);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  const __l1 = __pv0.length;
  __s.writeUint32(__l1);
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    const __v__i1 = __pv0[__i1];
    __s.writeInt32(__v__i1);
  }
  /**
   * encoding param: b
   */
  const __pv2 = value['b'];
  const __l3 = __pv2.length;
  __s.writeUint32(__l3);
  for(let __i3 = 0; __i3 < __l3; __i3++) {
    const __v__i3 = __pv2[__i3];
    __s.writeDouble(__v__i3);
  }
  /**
   * encoding param: c
   */
  const __pv4 = value['c'];
  const __l5 = __pv4.length;
  __s.writeUint32(__l5);
  for(let __i5 = 0; __i5 < __l5; __i5++) {
    const __v__i5 = __pv4[__i5];
    __s.writeString(__v__i5);
  }
  /**
   * encoding param: d
   */
  const __pv6 = value['d'];
  const __l7 = __pv6.length;
  __s.writeUint32(__l7);
  for(let __i7 = 0; __i7 < __l7; __i7++) {
    const __v__i7 = __pv6[__i7];
    __s.writeFloat(__v__i7);
  }
  /**
   * encoding param: e
   */
  const __pv8 = value['e'];
  const __l9 = __pv8.length;
  __s.writeUint32(__l9);
  for(let __i9 = 0; __i9 < __l9; __i9++) {
    const __v__i9 = __pv8[__i9];
    __s.writeUint32(__v__i9);
  }
  /**
   * encoding param: f
   */
  const __pv10 = value['f'];
  const __l11 = __pv10.length;
  __s.writeUint32(__l11);
  for(let __i11 = 0; __i11 < __l11; __i11++) {
    const __v__i11 = __pv10[__i11];
    if(__v__i11 === null) {
      __s.writeUint8(0);
    } else {
      __s.writeUint8(1);
      const __l13 = __v__i11.length;
      __s.writeUint32(__l13);
      for(let __i13 = 0; __i13 < __l13; __i13++) {
        const __v__i13 = __v__i11[__i13];
        __s.writeUint32(__v__i13);
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
  for(let __i25 = 0; __i25 < __l25; __i25++) {
    const __v__i25 = __t21[__i25];
    __s.writeUint32(__v__i25);
  }
  const __t26 = __pv14[4];
  if(__t26 === null) {
    __s.writeUint8(0);
  } else {
    __s.writeUint8(1);
    __s.writeString(__t26);
  }
}
export function decodeShouldSupportSeveralSequentialVectorParams(__d: IDeserializer): ShouldSupportSeveralSequentialVectorParams | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -992083773) return null;
  let a: Array<number>;
  let b: Array<number>;
  let c: Array<string>;
  let d: Array<number>;
  let e: Array<number>;
  let f: Array<Array<number> | null>;
  let g: [number,number,number,Array<number>,string | null];
  /**
   * decoding param: a
   */
  const __l1 = __d.readUint32();
  const __o1 = new Array<number>(__l1);
  a = __o1;
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    __o1[__i1] = __d.readInt32();
  }
  /**
   * decoding param: b
   */
  const __l3 = __d.readUint32();
  const __o3 = new Array<number>(__l3);
  b = __o3;
  for(let __i3 = 0; __i3 < __l3; __i3++) {
    __o3[__i3] = __d.readDouble();
  }
  /**
   * decoding param: c
   */
  const __l5 = __d.readUint32();
  const __o5 = new Array<string>(__l5);
  c = __o5;
  for(let __i5 = 0; __i5 < __l5; __i5++) {
    __o5[__i5] = __d.readString();
  }
  /**
   * decoding param: d
   */
  const __l7 = __d.readUint32();
  const __o7 = new Array<number>(__l7);
  d = __o7;
  for(let __i7 = 0; __i7 < __l7; __i7++) {
    __o7[__i7] = __d.readFloat();
  }
  /**
   * decoding param: e
   */
  const __l9 = __d.readUint32();
  const __o9 = new Array<number>(__l9);
  e = __o9;
  for(let __i9 = 0; __i9 < __l9; __i9++) {
    __o9[__i9] = __d.readUint32();
  }
  /**
   * decoding param: f
   */
  const __l11 = __d.readUint32();
  const __o11 = new Array<Array<number> | null>(__l11);
  f = __o11;
  for(let __i11 = 0; __i11 < __l11; __i11++) {
    if(__d.readUint8() === 1) {
      const __l13 = __d.readUint32();
      const __o13 = new Array<number>(__l13);
      __o11[__i11] = __o13;
      for(let __i13 = 0; __i13 < __l13; __i13++) {
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
  for(let __i19 = 0; __i19 < __l19; __i19++) {
    __o19[__i19] = __d.readUint32();
  }
  let __e20: string | null;
  if(__d.readUint8() === 1) {
    __e20 = __d.readString();
  } else {
    __e20 = null;
  }
  g = [__e15,__e16,__e17,__e18,__e20];
  return {
    _name: 'schema.ShouldSupportSeveralSequentialVectorParams',
    a,
    b,
    c,
    d,
    e,
    f,
    g
  };
}
export interface ShouldSupportSeveralSequentialVectorParams  {
  _name: 'schema.ShouldSupportSeveralSequentialVectorParams';
  a: ReadonlyArray<number>;
  b: ReadonlyArray<number>;
  c: ReadonlyArray<string>;
  d: ReadonlyArray<number>;
  e: ReadonlyArray<number>;
  f: ReadonlyArray<ReadonlyArray<number> | null>;
  g: [number,number,number,ReadonlyArray<number>,string | null];
}
export function defaultShouldSupportSeveralSequentialVectorParams(params: Partial<ShouldSupportSeveralSequentialVectorParamsInputParams> = {}): ShouldSupportSeveralSequentialVectorParams {
  return ShouldSupportSeveralSequentialVectorParams({
    a: [],
    b: [],
    c: [],
    d: [],
    e: [],
    f: [],
    g: [0,0.0,0.0,[],null],
    ...params
  });
}
export function compareShouldSupportSeveralSequentialVectorParams(__a: ShouldSupportSeveralSequentialVectorParams, __b: ShouldSupportSeveralSequentialVectorParams): boolean {
  return (
    /**
     * compare parameter a
     */
    __a['a'].length === __b['a'].length && __a['a'].every((__i,index) => (__i === __b['a'][index])) &&
    /**
     * compare parameter b
     */
    __a['b'].length === __b['b'].length && __a['b'].every((__i,index) => (__i === __b['b'][index])) &&
    /**
     * compare parameter c
     */
    __a['c'].length === __b['c'].length && __a['c'].every((__i,index) => (__i === __b['c'][index])) &&
    /**
     * compare parameter d
     */
    __a['d'].length === __b['d'].length && __a['d'].every((__i,index) => (__i === __b['d'][index])) &&
    /**
     * compare parameter e
     */
    __a['e'].length === __b['e'].length && __a['e'].every((__i,index) => (__i === __b['e'][index])) &&
    /**
     * compare parameter f
     */
    __a['f'].length === __b['f'].length && __a['f'].every((__i,index) => (((__dp61, __dp62) => __dp61 !== null && __dp62 !== null ? __dp61.length === __dp62.length && __dp61.every((__i,index) => (__i === __dp62[index])) : __dp61 === __dp62)(__i,__b['f'][index]))) &&
    /**
     * compare parameter g
     */
    /* compare tuple item 0 of type number */ ((__a60, __b60) => __a60 === __b60)(__a['g'][0],__b['g'][0]) && /* compare tuple item 1 of type number */ ((__a61, __b61) => __a61 === __b61)(__a['g'][1],__b['g'][1]) && /* compare tuple item 2 of type number */ ((__a62, __b62) => __a62 === __b62)(__a['g'][2],__b['g'][2]) && /* compare tuple item 3 of type ReadonlyArray<number> */ ((__a63, __b63) => __a63.length === __b63.length && __a63.every((__i,index) => (__i === __b63[index])))(__a['g'][3],__b['g'][3]) && /* compare tuple item 4 of type string | null */ ((__a64, __b64) => ((__dp221, __dp222) => __dp221 !== null && __dp222 !== null ? __dp221 === __dp222 : __dp221 === __dp222)(__a64,__b64))(__a['g'][4],__b['g'][4])
  );
}
export function updateShouldSupportSeveralSequentialVectorParams(value: ShouldSupportSeveralSequentialVectorParams, changes: Partial<ShouldSupportSeveralSequentialVectorParamsInputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(changes['a'].length === value['a'].length && changes['a'].every((__i,index) => (__i === value['a'][index])))) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        a: changes['a'],
      });
    }
  }
  if(typeof changes['b'] !== 'undefined') {
    if(!(changes['b'].length === value['b'].length && changes['b'].every((__i,index) => (__i === value['b'][index])))) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        b: changes['b'],
      });
    }
  }
  if(typeof changes['c'] !== 'undefined') {
    if(!(changes['c'].length === value['c'].length && changes['c'].every((__i,index) => (__i === value['c'][index])))) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        c: changes['c'],
      });
    }
  }
  if(typeof changes['d'] !== 'undefined') {
    if(!(changes['d'].length === value['d'].length && changes['d'].every((__i,index) => (__i === value['d'][index])))) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        d: changes['d'],
      });
    }
  }
  if(typeof changes['e'] !== 'undefined') {
    if(!(changes['e'].length === value['e'].length && changes['e'].every((__i,index) => (__i === value['e'][index])))) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        e: changes['e'],
      });
    }
  }
  if(typeof changes['f'] !== 'undefined') {
    if(!(changes['f'].length === value['f'].length && changes['f'].every((__i,index) => (((__dp121, __dp122) => __dp121 !== null && __dp122 !== null ? __dp121.length === __dp122.length && __dp121.every((__i,index) => (__i === __dp122[index])) : __dp121 === __dp122)(__i,value['f'][index]))))) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        f: changes['f'],
      });
    }
  }
  if(typeof changes['g'] !== 'undefined') {
    if(!(/* compare tuple item 0 of type number */ ((__a150, __b150) => __a150 === __b150)(changes['g'][0],value['g'][0]) && /* compare tuple item 1 of type number */ ((__a151, __b151) => __a151 === __b151)(changes['g'][1],value['g'][1]) && /* compare tuple item 2 of type number */ ((__a152, __b152) => __a152 === __b152)(changes['g'][2],value['g'][2]) && /* compare tuple item 3 of type ReadonlyArray<number> */ ((__a153, __b153) => __a153.length === __b153.length && __a153.every((__i,index) => (__i === __b153[index])))(changes['g'][3],value['g'][3]) && /* compare tuple item 4 of type string | null */ ((__a154, __b154) => ((__dp311, __dp312) => __dp311 !== null && __dp312 !== null ? __dp311 === __dp312 : __dp311 === __dp312)(__a154,__b154))(changes['g'][4],value['g'][4]))) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        g: changes['g'],
      });
    }
  }
  return value;
}
export interface simpleTupleTestInputParams {
  a: [number,number,number,ReadonlyArray<number>,string | null];
  b: ReadonlyArray<[number,number,number,ReadonlyArray<number>,string | null]>;
}
export function simpleTupleTest(params: simpleTupleTestInputParams): simpleTupleTest {
  return {
    _name: 'schema.simpleTupleTest',
    a: params['a'],
    b: params['b']
  };
}
export function encodeSimpleTupleTest(__s: ISerializer, value: simpleTupleTest) {
  __s.writeInt32(1950454485);
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
  for(let __i11 = 0; __i11 < __l11; __i11++) {
    const __v__i11 = __t7[__i11];
    __s.writeUint32(__v__i11);
  }
  const __t12 = __pv0[4];
  if(__t12 === null) {
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
  for(let __i19 = 0; __i19 < __l19; __i19++) {
    const __v__i19 = __pv18[__i19];
    const __t20 = __v__i19[0];
    __s.writeInt32(__t20);
    const __t21 = __v__i19[1];
    __s.writeFloat(__t21);
    const __t23 = __v__i19[2];
    __s.writeDouble(__t23);
    const __t26 = __v__i19[3];
    const __l30 = __t26.length;
    __s.writeUint32(__l30);
    for(let __i30 = 0; __i30 < __l30; __i30++) {
      const __v__i30 = __t26[__i30];
      __s.writeUint32(__v__i30);
    }
    const __t31 = __v__i19[4];
    if(__t31 === null) {
      __s.writeUint8(0);
    } else {
      __s.writeUint8(1);
      __s.writeString(__t31);
    }
  }
}
export function decodeSimpleTupleTest(__d: IDeserializer): simpleTupleTest | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 1950454485) return null;
  let a: [number,number,number,Array<number>,string | null];
  let b: Array<[number,number,number,Array<number>,string | null]>;
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
  for(let __i5 = 0; __i5 < __l5; __i5++) {
    __o5[__i5] = __d.readUint32();
  }
  let __e6: string | null;
  if(__d.readUint8() === 1) {
    __e6 = __d.readString();
  } else {
    __e6 = null;
  }
  a = [__e1,__e2,__e3,__e4,__e6];
  /**
   * decoding param: b
   */
  const __l9 = __d.readUint32();
  const __o9 = new Array<[number,number,number,Array<number>,string | null]>(__l9);
  b = __o9;
  for(let __i9 = 0; __i9 < __l9; __i9++) {
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
    for(let __i14 = 0; __i14 < __l14; __i14++) {
      __o14[__i14] = __d.readUint32();
    }
    let __e15: string | null;
    if(__d.readUint8() === 1) {
      __e15 = __d.readString();
    } else {
      __e15 = null;
    }
    __o9[__i9] = [__e10,__e11,__e12,__e13,__e15];
  }
  return {
    _name: 'schema.simpleTupleTest',
    a,
    b
  };
}
export interface simpleTupleTest  {
  _name: 'schema.simpleTupleTest';
  a: [number,number,number,ReadonlyArray<number>,string | null];
  b: ReadonlyArray<[number,number,number,ReadonlyArray<number>,string | null]>;
}
export function defaultSimpleTupleTest(params: Partial<simpleTupleTestInputParams> = {}): simpleTupleTest {
  return simpleTupleTest({
    a: [0,0.0,0.0,[],null],
    b: [],
    ...params
  });
}
export function compareSimpleTupleTest(__a: simpleTupleTest, __b: simpleTupleTest): boolean {
  return (
    /**
     * compare parameter a
     */
    /* compare tuple item 0 of type number */ ((__a00, __b00) => __a00 === __b00)(__a['a'][0],__b['a'][0]) && /* compare tuple item 1 of type number */ ((__a01, __b01) => __a01 === __b01)(__a['a'][1],__b['a'][1]) && /* compare tuple item 2 of type number */ ((__a02, __b02) => __a02 === __b02)(__a['a'][2],__b['a'][2]) && /* compare tuple item 3 of type ReadonlyArray<number> */ ((__a03, __b03) => __a03.length === __b03.length && __a03.every((__i,index) => (__i === __b03[index])))(__a['a'][3],__b['a'][3]) && /* compare tuple item 4 of type string | null */ ((__a04, __b04) => ((__dp161, __dp162) => __dp161 !== null && __dp162 !== null ? __dp161 === __dp162 : __dp161 === __dp162)(__a04,__b04))(__a['a'][4],__b['a'][4]) &&
    /**
     * compare parameter b
     */
    __a['b'].length === __b['b'].length && __a['b'].every((__i,index) => (/* compare tuple item 0 of type number */ ((__a20, __b20) => __a20 === __b20)(__i[0],__b['b'][index][0]) && /* compare tuple item 1 of type number */ ((__a21, __b21) => __a21 === __b21)(__i[1],__b['b'][index][1]) && /* compare tuple item 2 of type number */ ((__a22, __b22) => __a22 === __b22)(__i[2],__b['b'][index][2]) && /* compare tuple item 3 of type ReadonlyArray<number> */ ((__a23, __b23) => __a23.length === __b23.length && __a23.every((__i,index) => (__i === __b23[index])))(__i[3],__b['b'][index][3]) && /* compare tuple item 4 of type string | null */ ((__a24, __b24) => ((__dp181, __dp182) => __dp181 !== null && __dp182 !== null ? __dp181 === __dp182 : __dp181 === __dp182)(__a24,__b24))(__i[4],__b['b'][index][4])))
  );
}
export function updateSimpleTupleTest(value: simpleTupleTest, changes: Partial<simpleTupleTestInputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(/* compare tuple item 0 of type number */ ((__a10, __b10) => __a10 === __b10)(changes['a'][0],value['a'][0]) && /* compare tuple item 1 of type number */ ((__a11, __b11) => __a11 === __b11)(changes['a'][1],value['a'][1]) && /* compare tuple item 2 of type number */ ((__a12, __b12) => __a12 === __b12)(changes['a'][2],value['a'][2]) && /* compare tuple item 3 of type ReadonlyArray<number> */ ((__a13, __b13) => __a13.length === __b13.length && __a13.every((__i,index) => (__i === __b13[index])))(changes['a'][3],value['a'][3]) && /* compare tuple item 4 of type string | null */ ((__a14, __b14) => ((__dp171, __dp172) => __dp171 !== null && __dp172 !== null ? __dp171 === __dp172 : __dp171 === __dp172)(__a14,__b14))(changes['a'][4],value['a'][4]))) {
      value = simpleTupleTest({
        ...value,
        a: changes['a'],
      });
    }
  }
  if(typeof changes['b'] !== 'undefined') {
    if(!(changes['b'].length === value['b'].length && changes['b'].every((__i,index) => (/* compare tuple item 0 of type number */ ((__a200, __b200) => __a200 === __b200)(__i[0],value['b'][index][0]) && /* compare tuple item 1 of type number */ ((__a201, __b201) => __a201 === __b201)(__i[1],value['b'][index][1]) && /* compare tuple item 2 of type number */ ((__a202, __b202) => __a202 === __b202)(__i[2],value['b'][index][2]) && /* compare tuple item 3 of type ReadonlyArray<number> */ ((__a203, __b203) => __a203.length === __b203.length && __a203.every((__i,index) => (__i === __b203[index])))(__i[3],value['b'][index][3]) && /* compare tuple item 4 of type string | null */ ((__a204, __b204) => ((__dp361, __dp362) => __dp361 !== null && __dp362 !== null ? __dp361 === __dp362 : __dp361 === __dp362)(__a204,__b204))(__i[4],value['b'][index][4]))))) {
      value = simpleTupleTest({
        ...value,
        b: changes['b'],
      });
    }
  }
  return value;
}
export interface emptyNodeInputParams {
}
export function emptyNode(_: emptyNodeInputParams = {}): emptyNode {
  return {
    _name: 'schema.emptyNode'
  };
}
export function encodeEmptyNode(__s: ISerializer, _: emptyNode) {
  __s.writeInt32(-1657223713);
}
export function decodeEmptyNode(__d: IDeserializer): emptyNode | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1657223713) return null;
  return {
    _name: 'schema.emptyNode',
  };
}
export interface emptyNode  {
  _name: 'schema.emptyNode';
}
export function defaultEmptyNode(params: Partial<emptyNodeInputParams> = {}): emptyNode {
  return emptyNode({
    ...params
  });
}
export function compareEmptyNode(__a: emptyNode, __b: emptyNode): boolean {
  return true;
}
export function updateEmptyNode(value: emptyNode, _: Partial<emptyNodeInputParams>) {
  return value;
}
export interface userInputParams {
  id: number;
  name: string;
}
export function user(params: userInputParams): user {
  return {
    _name: 'schema.user',
    id: params['id'],
    name: params['name']
  };
}
export function encodeUser(__s: ISerializer, value: user) {
  __s.writeInt32(-399411702);
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
  if(__id !== -399411702) return null;
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
    name
  };
}
export interface user  {
  _name: 'schema.user';
  id: number;
  name: string;
}
export function defaultUser(params: Partial<userInputParams> = {}): user {
  return user({
    id: 0,
    name: "",
    ...params
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
  if(typeof changes['id'] !== 'undefined') {
    if(!(changes['id'] === value['id'])) {
      value = user({
        ...value,
        id: changes['id'],
      });
    }
  }
  if(typeof changes['name'] !== 'undefined') {
    if(!(changes['name'] === value['name'])) {
      value = user({
        ...value,
        name: changes['name'],
      });
    }
  }
  return value;
}
export interface supportNullTerminatedStringInputParams {
  value: string;
}
export function supportNullTerminatedString(params: supportNullTerminatedStringInputParams): supportNullTerminatedString {
  return {
    _name: 'schema.supportNullTerminatedString',
    value: params['value']
  };
}
export function encodeSupportNullTerminatedString(__s: ISerializer, value: supportNullTerminatedString) {
  __s.writeInt32(-1975570504);
  /**
   * encoding param: value
   */
  const __pv0 = value['value'];
  __s.writeNullTerminatedString(__pv0);
}
export function decodeSupportNullTerminatedString(__d: IDeserializer): supportNullTerminatedString | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1975570504) return null;
  let value: string;
  /**
   * decoding param: value
   */
  value = __d.readNullTerminatedString();
  return {
    _name: 'schema.supportNullTerminatedString',
    value
  };
}
export interface supportNullTerminatedString  {
  _name: 'schema.supportNullTerminatedString';
  value: string;
}
export function defaultSupportNullTerminatedString(params: Partial<supportNullTerminatedStringInputParams> = {}): supportNullTerminatedString {
  return supportNullTerminatedString({
    value: "",
    ...params
  });
}
export function compareSupportNullTerminatedString(__a: supportNullTerminatedString, __b: supportNullTerminatedString): boolean {
  return (
    /**
     * compare parameter value
     */
    __a['value'] === __b['value']
  );
}
export function updateSupportNullTerminatedString(value: supportNullTerminatedString, changes: Partial<supportNullTerminatedStringInputParams>) {
  if(typeof changes['value'] !== 'undefined') {
    if(!(changes['value'] === value['value'])) {
      value = supportNullTerminatedString({
        ...value,
        value: changes['value'],
      });
    }
  }
  return value;
}
export interface nullTerminatedStringListInputParams {
  value: ReadonlyArray<string>;
}
export function nullTerminatedStringList(params: nullTerminatedStringListInputParams): nullTerminatedStringList {
  return {
    _name: 'schema.nullTerminatedStringList',
    value: params['value']
  };
}
export function encodeNullTerminatedStringList(__s: ISerializer, value: nullTerminatedStringList) {
  __s.writeInt32(2084234152);
  /**
   * encoding param: value
   */
  const __pv0 = value['value'];
  const __l1 = __pv0.length;
  __s.writeUint32(__l1);
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    const __v__i1 = __pv0[__i1];
    __s.writeNullTerminatedString(__v__i1);
  }
}
export function decodeNullTerminatedStringList(__d: IDeserializer): nullTerminatedStringList | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 2084234152) return null;
  let value: Array<string>;
  /**
   * decoding param: value
   */
  const __l1 = __d.readUint32();
  const __o1 = new Array<string>(__l1);
  value = __o1;
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    __o1[__i1] = __d.readNullTerminatedString();
  }
  return {
    _name: 'schema.nullTerminatedStringList',
    value
  };
}
export interface nullTerminatedStringList  {
  _name: 'schema.nullTerminatedStringList';
  value: ReadonlyArray<string>;
}
export function defaultNullTerminatedStringList(params: Partial<nullTerminatedStringListInputParams> = {}): nullTerminatedStringList {
  return nullTerminatedStringList({
    value: [],
    ...params
  });
}
export function compareNullTerminatedStringList(__a: nullTerminatedStringList, __b: nullTerminatedStringList): boolean {
  return (
    /**
     * compare parameter value
     */
    __a['value'].length === __b['value'].length && __a['value'].every((__i,index) => (__i === __b['value'][index]))
  );
}
export function updateNullTerminatedStringList(value: nullTerminatedStringList, changes: Partial<nullTerminatedStringListInputParams>) {
  if(typeof changes['value'] !== 'undefined') {
    if(!(changes['value'].length === value['value'].length && changes['value'].every((__i,index) => (__i === value['value'][index])))) {
      value = nullTerminatedStringList({
        ...value,
        value: changes['value'],
      });
    }
  }
  return value;
}
export interface normalStringListInputParams {
  value: ReadonlyArray<string>;
}
export function normalStringList(params: normalStringListInputParams): normalStringList {
  return {
    _name: 'schema.normalStringList',
    value: params['value']
  };
}
export function encodeNormalStringList(__s: ISerializer, value: normalStringList) {
  __s.writeInt32(75642925);
  /**
   * encoding param: value
   */
  const __pv0 = value['value'];
  const __l1 = __pv0.length;
  __s.writeUint32(__l1);
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    const __v__i1 = __pv0[__i1];
    __s.writeString(__v__i1);
  }
}
export function decodeNormalStringList(__d: IDeserializer): normalStringList | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 75642925) return null;
  let value: Array<string>;
  /**
   * decoding param: value
   */
  const __l1 = __d.readUint32();
  const __o1 = new Array<string>(__l1);
  value = __o1;
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    __o1[__i1] = __d.readString();
  }
  return {
    _name: 'schema.normalStringList',
    value
  };
}
export interface normalStringList  {
  _name: 'schema.normalStringList';
  value: ReadonlyArray<string>;
}
export function defaultNormalStringList(params: Partial<normalStringListInputParams> = {}): normalStringList {
  return normalStringList({
    value: [],
    ...params
  });
}
export function compareNormalStringList(__a: normalStringList, __b: normalStringList): boolean {
  return (
    /**
     * compare parameter value
     */
    __a['value'].length === __b['value'].length && __a['value'].every((__i,index) => (__i === __b['value'][index]))
  );
}
export function updateNormalStringList(value: normalStringList, changes: Partial<normalStringListInputParams>) {
  if(typeof changes['value'] !== 'undefined') {
    if(!(changes['value'].length === value['value'].length && changes['value'].every((__i,index) => (__i === value['value'][index])))) {
      value = normalStringList({
        ...value,
        value: changes['value'],
      });
    }
  }
  return value;
}
