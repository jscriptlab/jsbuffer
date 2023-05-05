import {ISerializer} from "./__types__";
import {IDeserializer} from "./__types__";
export type User = user | userDeleted;
export function encodeUserTrait(s: ISerializer,value: User) {
  switch(value._name) {
    case 'user.user':
      encodeUser(s,value);
      break;
    case 'user.userDeleted':
      encodeUserDeleted(s,value);
      break;
  }
}
export function decodeUserTrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewindInt32();
  let value: user | userDeleted;
  switch(__id) {
    case 830789580: {
      const tmp = decodeUser(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case -1010206580: {
      const tmp = decodeUserDeleted(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    default: return null;
  }
  return value;
}
export function UserDefault() {
  return userDefault();
}
export function UserCompare(__a: User, __b: User) {
  switch(__a._name) {
    case 'user.user':
      if(__b._name !== "user.user") return false;
      return userCompare(__a,__b);
    case 'user.userDeleted':
      if(__b._name !== "user.userDeleted") return false;
      return userDeletedCompare(__a,__b);
  }
}
export type Test = test;
export function encodeTestTrait(s: ISerializer,value: Test) {
  switch(value._name) {
    case 'user.test':
      encodeTest(s,value);
      break;
  }
}
export function decodeTestTrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewindInt32();
  let value: test;
  switch(__id) {
    case -1945733013: {
      const tmp = decodeTest(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    default: return null;
  }
  return value;
}
export function TestDefault() {
  return testDefault();
}
export function TestCompare(__a: Test, __b: Test) {
  switch(__a._name) {
    case 'user.test':
      if(__b._name !== "user.test") return false;
      return testCompare(__a,__b);
  }
}
export interface userInputParams {
  firstName: string;
  aliases: ReadonlyArray<string>;
}
export function user(params: userInputParams): user {
  return {
    _name: 'user.user',
    ...params
  };
}
export function encodeUser(s: ISerializer, value: user) {
  s.writeInt32(830789580);
  /**
   * encoding param: firstName
   */
  const __pv0 = value['firstName'];
  s.writeString(__pv0);
  /**
   * encoding param: aliases
   */
  const __pv1 = value['aliases'];
  const __l1 = __pv1.length;
  s.writeUint32(__l1);
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    const __v__i1 = __pv1[__i1];
    s.writeString(__v__i1);
  }
}
export function decodeUser(__d: IDeserializer): user | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 830789580) return null;
  let firstName: string;
  let aliases: Array<string>;
  /**
   * decoding param: firstName
   */
  firstName = __d.readString();
  /**
   * decoding param: aliases
   */
  {
    const iindex1 = __d.readUint32();
    const oindex1 = new Array(iindex1);
    aliases = oindex1;
    for(let index1 = 0; index1 < iindex1; index1++) {
      oindex1[index1] = __d.readString();
    }
  }
  return {
    _name: 'user.user',
    firstName,
    aliases
  };
}
export interface user  {
  _name: 'user.user';
  firstName: string;
  aliases: ReadonlyArray<string>;
}
export function userDefault(params: Partial<userInputParams> = {}): user {
  return user({
    firstName: "",
    aliases: [],
    ...params
  });
}
export function userCompare(__a: user, __b: user) {
  /**
   * compare parameter firstName
   */
  if(!(__a['firstName'] === __b['firstName'])) return false;
  /**
   * compare parameter aliases
   */
  if(!(__a['aliases'].length === __b['aliases'].length && __a['aliases'].every((__i,index) => (__i === __b['aliases'][index])))) return false;
  return true;
}
export interface userDeletedInputParams {
  deletedAt: number;
}
export function userDeleted(params: userDeletedInputParams): userDeleted {
  return {
    _name: 'user.userDeleted',
    ...params
  };
}
export function encodeUserDeleted(s: ISerializer, value: userDeleted) {
  s.writeInt32(-1010206580);
  /**
   * encoding param: deletedAt
   */
  const __pv0 = value['deletedAt'];
  s.writeInt32(__pv0);
}
export function decodeUserDeleted(__d: IDeserializer): userDeleted | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1010206580) return null;
  let deletedAt: number;
  /**
   * decoding param: deletedAt
   */
  deletedAt = __d.readInt32();
  return {
    _name: 'user.userDeleted',
    deletedAt
  };
}
export interface userDeleted  {
  _name: 'user.userDeleted';
  deletedAt: number;
}
export function userDeletedDefault(params: Partial<userDeletedInputParams> = {}): userDeleted {
  return userDeleted({
    deletedAt: 0,
    ...params
  });
}
export function userDeletedCompare(__a: userDeleted, __b: userDeleted) {
  /**
   * compare parameter deletedAt
   */
  if(!(__a['deletedAt'] === __b['deletedAt'])) return false;
  return true;
}
export interface testInputParams {
  user: user;
  b: ReadonlyArray<ReadonlyArray<string | null>>;
}
export function test(params: testInputParams): test {
  return {
    _name: 'user.test',
    ...params
  };
}
export function encodeTest(s: ISerializer, value: test) {
  s.writeInt32(-1945733013);
  /**
   * encoding param: user
   */
  const __pv0 = value['user'];
  encodeUser(s,__pv0);
  /**
   * encoding param: b
   */
  const __pv1 = value['b'];
  const __l1 = __pv1.length;
  s.writeUint32(__l1);
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    const __v__i1 = __pv1[__i1];
    const __l2 = __v__i1.length;
    s.writeUint32(__l2);
    for(let __i2 = 0; __i2 < __l2; __i2++) {
      const __v__i2 = __v__i1[__i2];
      if(__v__i2 === null) {
        s.writeUint8(0);
      } else {
        s.writeUint8(1);
        s.writeString(__v__i2);
      }
    }
  }
}
export function decodeTest(__d: IDeserializer): test | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1945733013) return null;
  let user: user;
  let b: Array<Array<string | null>>;
  /**
   * decoding param: user
   */
  const __tmp0 = decodeUser(__d);
  if(__tmp0 === null) return null;
  user = __tmp0;
  /**
   * decoding param: b
   */
  {
    const iindex1 = __d.readUint32();
    const oindex1 = new Array(iindex1);
    b = oindex1;
    for(let index1 = 0; index1 < iindex1; index1++) {
      {
        const iindex2 = __d.readUint32();
        const oindex2 = new Array(iindex2);
        oindex1[index1] = oindex2;
        for(let index2 = 0; index2 < iindex2; index2++) {
          if(__d.readUint8() === 1) {
            oindex2[index2] = __d.readString();
          } else {
            oindex2[index2] = null;
          }
        }
      }
    }
  }
  return {
    _name: 'user.test',
    user,
    b
  };
}
export interface test  {
  _name: 'user.test';
  user: user;
  b: ReadonlyArray<ReadonlyArray<string | null>>;
}
export function testDefault(params: Partial<testInputParams> = {}): test {
  return test({
    user: userDefault(),
    b: [],
    ...params
  });
}
export function testCompare(__a: test, __b: test) {
  /**
   * compare parameter user
   */
  if(!(userCompare(__a['user'],__b['user']))) return false;
  /**
   * compare parameter b
   */
  if(!(__a['b'].length === __b['b'].length && __a['b'].every((__i,index) => (__i.length === __b['b'][index].length && __i.every((__i,index) => (((__dp31, __dp32) => __dp31 !== null && __dp32 !== null ? __dp31 === __dp32 : __dp31 === __dp32)(__i,__b['b'][index][index]))))))) return false;
  return true;
}
