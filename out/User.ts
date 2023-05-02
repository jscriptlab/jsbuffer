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
export function decodeUserTrait(d: IDeserializer) {
  const __id = d.readInt32();
  d.rewindInt32();
  let value: user | userDeleted;
  switch(__id) {
    case -1320038052: {
      const tmp = decodeUser(d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case -1188236190: {
      const tmp = decodeUserDeleted(d);
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
export function decodeTestTrait(d: IDeserializer) {
  const __id = d.readInt32();
  d.rewindInt32();
  let value: test;
  switch(__id) {
    case -457344743: {
      const tmp = decodeTest(d);
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
  s.writeString(value['firstName']);
  {
    const ia0 = value['aliases'].length;
    s.writeUint32(ia0);
    for(let a0 = 0; a0 < ia0; a0++) {
      const va0 = value['aliases'][a0];
      s.writeString(va0);
    }
  }
}
export function decodeUser(d: IDeserializer): user | null {
  const __id = d.readInt32();
  if(__id !== -1320038052) return null;
  let firstName: string;
  let aliases: Array<string>;
  firstName = d.readString();
  {
    const ia0 = d.readUint32();
    aliases = new Array(ia0);
    for(let a0 = 0; a0 < ia0; a0++) {
      aliases[a0] = d.readString();
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
  s.writeInt32(value['deletedAt']);
}
export function decodeUserDeleted(d: IDeserializer): userDeleted | null {
  const __id = d.readInt32();
  if(__id !== -1188236190) return null;
  let deletedAt: number;
  deletedAt = d.readInt32();
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
  encodeUser(s,value['user']);
  {
    const ia0 = value['b'].length;
    s.writeUint32(ia0);
    for(let a0 = 0; a0 < ia0; a0++) {
      const va0 = value['b'][a0];
      {
        const ia1 = va0.length;
        s.writeUint32(ia1);
        for(let a1 = 0; a1 < ia1; a1++) {
          const va1 = va0[a1];
          if(va1 === null) {
            s.writeUint8(0);
          } else {
            s.writeUint8(1);
            s.writeString(va1);
          }
        }
      }
    }
  }
}
export function decodeTest(d: IDeserializer): test | null {
  const __id = d.readInt32();
  if(__id !== -457344743) return null;
  let user: user;
  let b: Array<Array<string | null>>;
  const tmp = decodeUser(d);
  if(tmp === null) return null;
  user = tmp;
  {
    const ia0 = d.readUint32();
    b = new Array(ia0);
    for(let a0 = 0; a0 < ia0; a0++) {
      {
        const ia1 = d.readUint32();
        b[a0] = new Array(ia1);
        for(let a1 = 0; a1 < ia1; a1++) {
          if(d.readUint8() === 1) {
            b[a0][a1] = d.readString();
          } else {
            b[a0][a1] = null;
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
