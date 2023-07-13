import { ISerializer } from "./__types__";
import { IDeserializer } from "./__types__";
export interface userInputParams {
  id: number;
  firstName: string;
  lastName: string;
}
export function user(params: userInputParams): user {
  return {
    _name: 'tupleTest2.user',
    id: params['id'],
    firstName: params['firstName'],
    lastName: params['lastName']
  };
}
export function encodeUser(__s: ISerializer, value: user) {
  __s.writeInt32(-1856063849);
  /**
   * encoding param: id
   */
  const __pv0 = value['id'];
  __s.writeInt32(__pv0);
  /**
   * encoding param: firstName
   */
  const __pv1 = value['firstName'];
  __s.writeString(__pv1);
  /**
   * encoding param: lastName
   */
  const __pv2 = value['lastName'];
  __s.writeString(__pv2);
}
export function decodeUser(__d: IDeserializer): user | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1856063849) return null;
  let id: number;
  let firstName: string;
  let lastName: string;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  /**
   * decoding param: firstName
   */
  firstName = __d.readString();
  /**
   * decoding param: lastName
   */
  lastName = __d.readString();
  return {
    _name: 'tupleTest2.user',
    id,
    firstName,
    lastName
  };
}
export interface user  {
  _name: 'tupleTest2.user';
  id: number;
  firstName: string;
  lastName: string;
}
export function defaultUser(params: Partial<userInputParams> = {}): user {
  return user({
    id: 0,
    firstName: "",
    lastName: "",
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
     * compare parameter firstName
     */
    __a['firstName'] === __b['firstName'] &&
    /**
     * compare parameter lastName
     */
    __a['lastName'] === __b['lastName']
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
  if(typeof changes['firstName'] !== 'undefined') {
    if(!(changes['firstName'] === value['firstName'])) {
      value = user({
        ...value,
        firstName: changes['firstName'],
      });
    }
  }
  if(typeof changes['lastName'] !== 'undefined') {
    if(!(changes['lastName'] === value['lastName'])) {
      value = user({
        ...value,
        lastName: changes['lastName'],
      });
    }
  }
  return value;
}
export interface postInputParams {
  id: number;
  title: string;
  comments: ReadonlyArray<Readonly<comment>>;
}
export function post(params: postInputParams): post {
  return {
    _name: 'tupleTest2.post',
    id: params['id'],
    title: params['title'],
    comments: params['comments']
  };
}
export function encodePost(__s: ISerializer, value: post) {
  __s.writeInt32(-1859591648);
  /**
   * encoding param: id
   */
  const __pv0 = value['id'];
  __s.writeInt32(__pv0);
  /**
   * encoding param: title
   */
  const __pv1 = value['title'];
  __s.writeString(__pv1);
  /**
   * encoding param: comments
   */
  const __pv2 = value['comments'];
  const __l3 = __pv2.length;
  __s.writeUint32(__l3);
  for(let __i3 = 0; __i3 < __l3; __i3++) {
    const __v__i3 = __pv2[__i3];
    encodeComment(__s,__v__i3);
  }
}
export function decodePost(__d: IDeserializer): post | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1859591648) return null;
  let id: number;
  let title: string;
  let comments: Array<comment>;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  /**
   * decoding param: title
   */
  title = __d.readString();
  /**
   * decoding param: comments
   */
  const __l3 = __d.readUint32();
  const __o3 = new Array<comment>(__l3);
  comments = __o3;
  for(let __i3 = 0; __i3 < __l3; __i3++) {
    const __tmp4 = decodeComment(__d);
    if(__tmp4 === null) return null;
    __o3[__i3] = __tmp4;
  }
  return {
    _name: 'tupleTest2.post',
    id,
    title,
    comments
  };
}
export interface post  {
  _name: 'tupleTest2.post';
  id: number;
  title: string;
  comments: ReadonlyArray<Readonly<comment>>;
}
export function defaultPost(params: Partial<postInputParams> = {}): post {
  return post({
    id: 0,
    title: "",
    comments: [],
    ...params
  });
}
export function comparePost(__a: post, __b: post): boolean {
  return (
    /**
     * compare parameter id
     */
    __a['id'] === __b['id'] &&
    /**
     * compare parameter title
     */
    __a['title'] === __b['title'] &&
    /**
     * compare parameter comments
     */
    __a['comments'].length === __b['comments'].length && __a['comments'].every((__i,index) => (compareComment(__i,__b['comments'][index])))
  );
}
export function updatePost(value: post, changes: Partial<postInputParams>) {
  if(typeof changes['id'] !== 'undefined') {
    if(!(changes['id'] === value['id'])) {
      value = post({
        ...value,
        id: changes['id'],
      });
    }
  }
  if(typeof changes['title'] !== 'undefined') {
    if(!(changes['title'] === value['title'])) {
      value = post({
        ...value,
        title: changes['title'],
      });
    }
  }
  if(typeof changes['comments'] !== 'undefined') {
    if(!(changes['comments'].length === value['comments'].length && changes['comments'].every((__i,index) => (compareComment(__i,value['comments'][index]))))) {
      value = post({
        ...value,
        comments: changes['comments'],
      });
    }
  }
  return value;
}
export interface commentInputParams {
  id: number;
  title: string;
  contents: string;
}
export function comment(params: commentInputParams): comment {
  return {
    _name: 'tupleTest2.comment',
    id: params['id'],
    title: params['title'],
    contents: params['contents']
  };
}
export function encodeComment(__s: ISerializer, value: comment) {
  __s.writeInt32(1545039771);
  /**
   * encoding param: id
   */
  const __pv0 = value['id'];
  __s.writeInt32(__pv0);
  /**
   * encoding param: title
   */
  const __pv1 = value['title'];
  __s.writeString(__pv1);
  /**
   * encoding param: contents
   */
  const __pv2 = value['contents'];
  __s.writeString(__pv2);
}
export function decodeComment(__d: IDeserializer): comment | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 1545039771) return null;
  let id: number;
  let title: string;
  let contents: string;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  /**
   * decoding param: title
   */
  title = __d.readString();
  /**
   * decoding param: contents
   */
  contents = __d.readString();
  return {
    _name: 'tupleTest2.comment',
    id,
    title,
    contents
  };
}
export interface comment  {
  _name: 'tupleTest2.comment';
  id: number;
  title: string;
  contents: string;
}
export function defaultComment(params: Partial<commentInputParams> = {}): comment {
  return comment({
    id: 0,
    title: "",
    contents: "",
    ...params
  });
}
export function compareComment(__a: comment, __b: comment): boolean {
  return (
    /**
     * compare parameter id
     */
    __a['id'] === __b['id'] &&
    /**
     * compare parameter title
     */
    __a['title'] === __b['title'] &&
    /**
     * compare parameter contents
     */
    __a['contents'] === __b['contents']
  );
}
export function updateComment(value: comment, changes: Partial<commentInputParams>) {
  if(typeof changes['id'] !== 'undefined') {
    if(!(changes['id'] === value['id'])) {
      value = comment({
        ...value,
        id: changes['id'],
      });
    }
  }
  if(typeof changes['title'] !== 'undefined') {
    if(!(changes['title'] === value['title'])) {
      value = comment({
        ...value,
        title: changes['title'],
      });
    }
  }
  if(typeof changes['contents'] !== 'undefined') {
    if(!(changes['contents'] === value['contents'])) {
      value = comment({
        ...value,
        contents: changes['contents'],
      });
    }
  }
  return value;
}
export interface tupleTestInputParams {
  data: [Readonly<user>,Readonly<post>,Readonly<comment>,ReadonlyArray<Readonly<comment>>,ReadonlyArray<Readonly<comment> | null>];
}
export function tupleTest(params: tupleTestInputParams): tupleTest {
  return {
    _name: 'tupleTest2.tupleTest',
    data: params['data']
  };
}
export function encodeTupleTest(__s: ISerializer, value: tupleTest) {
  __s.writeInt32(-245918342);
  /**
   * encoding param: data
   */
  const __pv0 = value['data'];
  const __t1 = __pv0[0];
  encodeUser(__s,__t1);
  const __t2 = __pv0[1];
  encodePost(__s,__t2);
  const __t4 = __pv0[2];
  encodeComment(__s,__t4);
  const __t7 = __pv0[3];
  const __l11 = __t7.length;
  __s.writeUint32(__l11);
  for(let __i11 = 0; __i11 < __l11; __i11++) {
    const __v__i11 = __t7[__i11];
    encodeComment(__s,__v__i11);
  }
  const __t12 = __pv0[4];
  const __l17 = __t12.length;
  __s.writeUint32(__l17);
  for(let __i17 = 0; __i17 < __l17; __i17++) {
    const __v__i17 = __t12[__i17];
    if(__v__i17 === null) {
      __s.writeUint8(0);
    } else {
      __s.writeUint8(1);
      encodeComment(__s,__v__i17);
    }
  }
}
export function decodeTupleTest(__d: IDeserializer): tupleTest | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -245918342) return null;
  let data: [user,post,comment,Array<comment>,Array<comment | null>];
  /**
   * decoding param: data
   */
  let __e1: user;
  const __tmp2 = decodeUser(__d);
  if(__tmp2 === null) return null;
  __e1 = __tmp2;
  let __e2: post;
  const __tmp3 = decodePost(__d);
  if(__tmp3 === null) return null;
  __e2 = __tmp3;
  let __e3: comment;
  const __tmp4 = decodeComment(__d);
  if(__tmp4 === null) return null;
  __e3 = __tmp4;
  let __e4: Array<comment>;
  const __l5 = __d.readUint32();
  const __o5 = new Array<comment>(__l5);
  __e4 = __o5;
  for(let __i5 = 0; __i5 < __l5; __i5++) {
    const __tmp6 = decodeComment(__d);
    if(__tmp6 === null) return null;
    __o5[__i5] = __tmp6;
  }
  let __e6: Array<comment | null>;
  const __l7 = __d.readUint32();
  const __o7 = new Array<comment | null>(__l7);
  __e6 = __o7;
  for(let __i7 = 0; __i7 < __l7; __i7++) {
    if(__d.readUint8() === 1) {
      const __tmp9 = decodeComment(__d);
      if(__tmp9 === null) return null;
      __o7[__i7] = __tmp9;
    } else {
      __o7[__i7] = null;
    }
  }
  data = [__e1,__e2,__e3,__e4,__e6];
  return {
    _name: 'tupleTest2.tupleTest',
    data
  };
}
export interface tupleTest  {
  _name: 'tupleTest2.tupleTest';
  data: [Readonly<user>,Readonly<post>,Readonly<comment>,ReadonlyArray<Readonly<comment>>,ReadonlyArray<Readonly<comment> | null>];
}
export function defaultTupleTest(params: Partial<tupleTestInputParams> = {}): tupleTest {
  return tupleTest({
    data: [defaultUser(),defaultPost(),defaultComment(),[],[]],
    ...params
  });
}
export function compareTupleTest(__a: tupleTest, __b: tupleTest): boolean {
  return (
    /**
     * compare parameter data
     */
    /* compare tuple item 0 of type Readonly<user> */ ((__a00, __b00) => compareUser(__a00,__b00))(__a['data'][0],__b['data'][0]) && /* compare tuple item 1 of type Readonly<post> */ ((__a01, __b01) => comparePost(__a01,__b01))(__a['data'][1],__b['data'][1]) && /* compare tuple item 2 of type Readonly<comment> */ ((__a02, __b02) => compareComment(__a02,__b02))(__a['data'][2],__b['data'][2]) && /* compare tuple item 3 of type ReadonlyArray<Readonly<comment>> */ ((__a03, __b03) => __a03.length === __b03.length && __a03.every((__i,index) => (compareComment(__i,__b03[index]))))(__a['data'][3],__b['data'][3]) && /* compare tuple item 4 of type ReadonlyArray<Readonly<comment> | null> */ ((__a04, __b04) => __a04.length === __b04.length && __a04.every((__i,index) => (((__dp171, __dp172) => __dp171 !== null && __dp172 !== null ? compareComment(__dp171,__dp172) : __dp171 === __dp172)(__i,__b04[index]))))(__a['data'][4],__b['data'][4])
  );
}
export function updateTupleTest(value: tupleTest, changes: Partial<tupleTestInputParams>) {
  if(typeof changes['data'] !== 'undefined') {
    if(!(/* compare tuple item 0 of type Readonly<user> */ ((__a10, __b10) => compareUser(__a10,__b10))(changes['data'][0],value['data'][0]) && /* compare tuple item 1 of type Readonly<post> */ ((__a11, __b11) => comparePost(__a11,__b11))(changes['data'][1],value['data'][1]) && /* compare tuple item 2 of type Readonly<comment> */ ((__a12, __b12) => compareComment(__a12,__b12))(changes['data'][2],value['data'][2]) && /* compare tuple item 3 of type ReadonlyArray<Readonly<comment>> */ ((__a13, __b13) => __a13.length === __b13.length && __a13.every((__i,index) => (compareComment(__i,__b13[index]))))(changes['data'][3],value['data'][3]) && /* compare tuple item 4 of type ReadonlyArray<Readonly<comment> | null> */ ((__a14, __b14) => __a14.length === __b14.length && __a14.every((__i,index) => (((__dp181, __dp182) => __dp181 !== null && __dp182 !== null ? compareComment(__dp181,__dp182) : __dp181 === __dp182)(__i,__b14[index]))))(changes['data'][4],value['data'][4]))) {
      value = tupleTest({
        ...value,
        data: changes['data'],
      });
    }
  }
  return value;
}
export interface tupleTupleTestInputParams {
  a: [[number,string,ReadonlyArray<[string,number]>],number,string,number];
}
export function tupleTupleTest(params: tupleTupleTestInputParams): tupleTupleTest {
  return {
    _name: 'tupleTest2.tupleTupleTest',
    a: params['a']
  };
}
export function encodeTupleTupleTest(__s: ISerializer, value: tupleTupleTest) {
  __s.writeInt32(-1761980562);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  const __t1 = __pv0[0];
  const __t2 = __t1[0];
  __s.writeInt32(__t2);
  const __t3 = __t1[1];
  __s.writeString(__t3);
  const __t5 = __t1[2];
  const __l8 = __t5.length;
  __s.writeUint32(__l8);
  for(let __i8 = 0; __i8 < __l8; __i8++) {
    const __v__i8 = __t5[__i8];
    const __t9 = __v__i8[0];
    __s.writeString(__t9);
    const __t10 = __v__i8[1];
    __s.writeInt32(__t10);
  }
  const __t12 = __pv0[1];
  __s.writeInt32(__t12);
  const __t14 = __pv0[2];
  __s.writeString(__t14);
  const __t17 = __pv0[3];
  __s.writeDouble(__t17);
}
export function decodeTupleTupleTest(__d: IDeserializer): tupleTupleTest | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1761980562) return null;
  let a: [[number,string,Array<[string,number]>],number,string,number];
  /**
   * decoding param: a
   */
  let __e1: [number,string,Array<[string,number]>];
  let __e2: number;
  __e2 = __d.readInt32();
  let __e3: string;
  __e3 = __d.readString();
  let __e4: Array<[string,number]>;
  const __l5 = __d.readUint32();
  const __o5 = new Array<[string,number]>(__l5);
  __e4 = __o5;
  for(let __i5 = 0; __i5 < __l5; __i5++) {
    let __e6: string;
    __e6 = __d.readString();
    let __e7: number;
    __e7 = __d.readInt32();
    __o5[__i5] = [__e6,__e7];
  }
  __e1 = [__e2,__e3,__e4];
  let __e8: number;
  __e8 = __d.readInt32();
  let __e9: string;
  __e9 = __d.readString();
  let __e10: number;
  __e10 = __d.readDouble();
  a = [__e1,__e8,__e9,__e10];
  return {
    _name: 'tupleTest2.tupleTupleTest',
    a
  };
}
export interface tupleTupleTest  {
  _name: 'tupleTest2.tupleTupleTest';
  a: [[number,string,ReadonlyArray<[string,number]>],number,string,number];
}
export function defaultTupleTupleTest(params: Partial<tupleTupleTestInputParams> = {}): tupleTupleTest {
  return tupleTupleTest({
    a: [[0,"",[]],0,"",0.0],
    ...params
  });
}
export function compareTupleTupleTest(__a: tupleTupleTest, __b: tupleTupleTest): boolean {
  return (
    /**
     * compare parameter a
     */
    /* compare tuple item 0 of type [number,string,ReadonlyArray<[string,number]>] */ ((__a00, __b00) => /* compare tuple item 0 of type number */ ((__a10, __b10) => __a10 === __b10)(__a00[0],__b00[0]) && /* compare tuple item 1 of type string */ ((__a11, __b11) => __a11 === __b11)(__a00[1],__b00[1]) && /* compare tuple item 2 of type ReadonlyArray<[string,number]> */ ((__a12, __b12) => __a12.length === __b12.length && __a12.every((__i,index) => (/* compare tuple item 0 of type string */ ((__a80, __b80) => __a80 === __b80)(__i[0],__b12[index][0]) && /* compare tuple item 1 of type number */ ((__a81, __b81) => __a81 === __b81)(__i[1],__b12[index][1]))))(__a00[2],__b00[2]))(__a['a'][0],__b['a'][0]) && /* compare tuple item 1 of type number */ ((__a01, __b01) => __a01 === __b01)(__a['a'][1],__b['a'][1]) && /* compare tuple item 2 of type string */ ((__a02, __b02) => __a02 === __b02)(__a['a'][2],__b['a'][2]) && /* compare tuple item 3 of type number */ ((__a03, __b03) => __a03 === __b03)(__a['a'][3],__b['a'][3])
  );
}
export function updateTupleTupleTest(value: tupleTupleTest, changes: Partial<tupleTupleTestInputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(/* compare tuple item 0 of type [number,string,ReadonlyArray<[string,number]>] */ ((__a10, __b10) => /* compare tuple item 0 of type number */ ((__a20, __b20) => __a20 === __b20)(__a10[0],__b10[0]) && /* compare tuple item 1 of type string */ ((__a21, __b21) => __a21 === __b21)(__a10[1],__b10[1]) && /* compare tuple item 2 of type ReadonlyArray<[string,number]> */ ((__a22, __b22) => __a22.length === __b22.length && __a22.every((__i,index) => (/* compare tuple item 0 of type string */ ((__a90, __b90) => __a90 === __b90)(__i[0],__b22[index][0]) && /* compare tuple item 1 of type number */ ((__a91, __b91) => __a91 === __b91)(__i[1],__b22[index][1]))))(__a10[2],__b10[2]))(changes['a'][0],value['a'][0]) && /* compare tuple item 1 of type number */ ((__a11, __b11) => __a11 === __b11)(changes['a'][1],value['a'][1]) && /* compare tuple item 2 of type string */ ((__a12, __b12) => __a12 === __b12)(changes['a'][2],value['a'][2]) && /* compare tuple item 3 of type number */ ((__a13, __b13) => __a13 === __b13)(changes['a'][3],value['a'][3]))) {
      value = tupleTupleTest({
        ...value,
        a: changes['a'],
      });
    }
  }
  return value;
}
export interface superTupleTupleTestInputParams {
  a: [[[number],number],number];
}
export function superTupleTupleTest(params: superTupleTupleTestInputParams): superTupleTupleTest {
  return {
    _name: 'tupleTest2.superTupleTupleTest',
    a: params['a']
  };
}
export function encodeSuperTupleTupleTest(__s: ISerializer, value: superTupleTupleTest) {
  __s.writeInt32(645409346);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  const __t1 = __pv0[0];
  const __t2 = __t1[0];
  const __t3 = __t2[0];
  __s.writeInt32(__t3);
  const __t4 = __t1[1];
  __s.writeInt32(__t4);
  const __t6 = __pv0[1];
  __s.writeDouble(__t6);
}
export function decodeSuperTupleTupleTest(__d: IDeserializer): superTupleTupleTest | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 645409346) return null;
  let a: [[[number],number],number];
  /**
   * decoding param: a
   */
  let __e1: [[number],number];
  let __e2: [number];
  let __e3: number;
  __e3 = __d.readInt32();
  __e2 = [__e3];
  let __e4: number;
  __e4 = __d.readInt32();
  __e1 = [__e2,__e4];
  let __e5: number;
  __e5 = __d.readDouble();
  a = [__e1,__e5];
  return {
    _name: 'tupleTest2.superTupleTupleTest',
    a
  };
}
export interface superTupleTupleTest  {
  _name: 'tupleTest2.superTupleTupleTest';
  a: [[[number],number],number];
}
export function defaultSuperTupleTupleTest(params: Partial<superTupleTupleTestInputParams> = {}): superTupleTupleTest {
  return superTupleTupleTest({
    a: [[[0],0],0.0],
    ...params
  });
}
export function compareSuperTupleTupleTest(__a: superTupleTupleTest, __b: superTupleTupleTest): boolean {
  return (
    /**
     * compare parameter a
     */
    /* compare tuple item 0 of type [[number],number] */ ((__a00, __b00) => /* compare tuple item 0 of type [number] */ ((__a10, __b10) => /* compare tuple item 0 of type number */ ((__a20, __b20) => __a20 === __b20)(__a10[0],__b10[0]))(__a00[0],__b00[0]) && /* compare tuple item 1 of type number */ ((__a11, __b11) => __a11 === __b11)(__a00[1],__b00[1]))(__a['a'][0],__b['a'][0]) && /* compare tuple item 1 of type number */ ((__a01, __b01) => __a01 === __b01)(__a['a'][1],__b['a'][1])
  );
}
export function updateSuperTupleTupleTest(value: superTupleTupleTest, changes: Partial<superTupleTupleTestInputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(/* compare tuple item 0 of type [[number],number] */ ((__a10, __b10) => /* compare tuple item 0 of type [number] */ ((__a20, __b20) => /* compare tuple item 0 of type number */ ((__a30, __b30) => __a30 === __b30)(__a20[0],__b20[0]))(__a10[0],__b10[0]) && /* compare tuple item 1 of type number */ ((__a21, __b21) => __a21 === __b21)(__a10[1],__b10[1]))(changes['a'][0],value['a'][0]) && /* compare tuple item 1 of type number */ ((__a11, __b11) => __a11 === __b11)(changes['a'][1],value['a'][1]))) {
      value = superTupleTupleTest({
        ...value,
        a: changes['a'],
      });
    }
  }
  return value;
}
