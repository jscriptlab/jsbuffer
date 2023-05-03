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
    case -1320038052: {
      const tmp = decodeUser(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case -1188236190: {
      const tmp = decodeUserDeleted(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    default: return null;
  }
  return value;
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
    case -457344743: {
      const tmp = decodeTest(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    default: return null;
  }
  return value;
}
export function user(params: Omit<user,'_name'>): user {
  return {
    _name: 'user.user',
    ...params
  };
}
export function encodeUser(s: ISerializer, value: user) {
  s.writeInt32(-1320038052);
  /**
   * encoding param: firstName
   */
  const pv0 = value['firstName'];
  s.writeString(pv0);
  /**
   * encoding param: aliases
   */
  const pv1 = value['aliases'];
  const l1 = pv1.length;
  s.writeUint32(l1);
  for(let i1 = 0; i1 < l1; i1++) {
    const vi1 = pv1[i1];
    s.writeString(vi1);
  }
}
export function decodeUser(__d: IDeserializer): user | null {
  const __id = __d.readInt32();
  if(__id !== -1320038052) return null;
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
export function userDeleted(params: Omit<userDeleted,'_name'>): userDeleted {
  return {
    _name: 'user.userDeleted',
    ...params
  };
}
export function encodeUserDeleted(s: ISerializer, value: userDeleted) {
  s.writeInt32(-1188236190);
  /**
   * encoding param: deletedAt
   */
  const pv0 = value['deletedAt'];
  s.writeInt32(pv0);
}
export function decodeUserDeleted(__d: IDeserializer): userDeleted | null {
  const __id = __d.readInt32();
  if(__id !== -1188236190) return null;
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
export function test(params: Omit<test,'_name'>): test {
  return {
    _name: 'user.test',
    ...params
  };
}
export function encodeTest(s: ISerializer, value: test) {
  s.writeInt32(-457344743);
  /**
   * encoding param: user
   */
  const pv0 = value['user'];
  encodeUser(s,pv0);
  /**
   * encoding param: b
   */
  const pv1 = value['b'];
  const l1 = pv1.length;
  s.writeUint32(l1);
  for(let i1 = 0; i1 < l1; i1++) {
    const vi1 = pv1[i1];
    const l2 = vi1.length;
    s.writeUint32(l2);
    for(let i2 = 0; i2 < l2; i2++) {
      const vi2 = vi1[i2];
      if(vi2 === null) {
        s.writeUint8(0);
      } else {
        s.writeUint8(1);
        s.writeString(vi2);
      }
    }
  }
}
export function decodeTest(__d: IDeserializer): test | null {
  const __id = __d.readInt32();
  if(__id !== -457344743) return null;
  let user: user;
  let b: Array<Array<string | null>>;
  /**
   * decoding param: user
   */
  const tmp0 = decodeUser(__d);
  if(tmp0 === null) return null;
  user = tmp0;
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
