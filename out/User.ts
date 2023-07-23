import { ISerializer } from './__types__';
import { IDeserializer } from './__types__';
export type User = Readonly<user> | Readonly<userDeleted>;
export const UserFiles = [''];
export function encodeUserTrait(__s: ISerializer, value: User) {
  switch (value._name) {
    case 'user.user':
      encodeUser(__s, value);
      break;
    case 'user.userDeleted':
      encodeUserDeleted(__s, value);
      break;
  }
}
export function decodeUserTrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewindInt32();
  let value: user | userDeleted;
  switch (__id) {
    case -2086976610: {
      const tmp = decodeUser(__d);
      if (tmp === null) return null;
      value = tmp;
      break;
    }
    case 1001160586: {
      const tmp = decodeUserDeleted(__d);
      if (tmp === null) return null;
      value = tmp;
      break;
    }
    default:
      return null;
  }
  return value;
}
export function defaultUserTrait() {
  return defaultUser();
}
export function compareUserTrait(__a: User, __b: User) {
  switch (__a._name) {
    case 'user.user':
      if (__b._name !== 'user.user') return false;
      return compareUser(__a, __b);
    case 'user.userDeleted':
      if (__b._name !== 'user.userDeleted') return false;
      return compareUserDeleted(__a, __b);
  }
}
export type Test = Readonly<test>;
export const TestFiles = [''];
export function encodeTestTrait(__s: ISerializer, value: Test) {
  switch (value._name) {
    case 'user.test':
      encodeTest(__s, value);
      break;
  }
}
export function decodeTestTrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewindInt32();
  let value: test;
  switch (__id) {
    case -834825061: {
      const tmp = decodeTest(__d);
      if (tmp === null) return null;
      value = tmp;
      break;
    }
    default:
      return null;
  }
  return value;
}
export function defaultTestTrait() {
  return defaultTest();
}
export function compareTestTrait(__a: Test, __b: Test) {
  return compareTest(__a, __b);
}
export const userMetadata = {
  name: 'user',
  params: [
    {
      name: 'firstName',
      type: {
        type: 'generic',
        value: 'string',
      },
    },
    {
      name: 'aliases',
      type: {
        type: 'template',
        name: 'vector',
        value: {
          type: 'generic',
          value: 'string',
        },
      },
    },
  ],
};
export interface userInputParams {
  firstName: string;
  aliases: ReadonlyArray<string>;
}
export function user(params: userInputParams): user {
  return {
    _name: 'user.user',
    firstName: params['firstName'],
    aliases: params['aliases'],
  };
}
export function encodeUser(__s: ISerializer, value: user) {
  __s.writeInt32(-2086976610);
  /**
   * encoding param: firstName
   */
  const __pv0 = value['firstName'];
  __s.writeString(__pv0);
  /**
   * encoding param: aliases
   */
  const __pv1 = value['aliases'];
  const __l2 = __pv1.length;
  __s.writeUint32(__l2);
  for (let __i2 = 0; __i2 < __l2; __i2++) {
    const __v__i2 = __pv1[__i2];
    __s.writeString(__v__i2);
  }
}
export function decodeUser(__d: IDeserializer): user | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -2086976610) return null;
  let firstName: string;
  let aliases: Array<string>;
  /**
   * decoding param: firstName
   */
  firstName = __d.readString();
  /**
   * decoding param: aliases
   */
  const __l2 = __d.readUint32();
  const __o2 = new Array<string>(__l2);
  aliases = __o2;
  for (let __i2 = 0; __i2 < __l2; __i2++) {
    __o2[__i2] = __d.readString();
  }
  return {
    _name: 'user.user',
    firstName,
    aliases,
  };
}
export interface user {
  _name: 'user.user';
  firstName: string;
  aliases: ReadonlyArray<string>;
}
export function defaultUser(params: Partial<userInputParams> = {}): user {
  return user({
    firstName: '',
    aliases: [],
    ...params,
  });
}
export function compareUser(__a: user, __b: user): boolean {
  return (
    /**
     * compare parameter firstName
     */
    __a['firstName'] === __b['firstName'] &&
    /**
     * compare parameter aliases
     */
    __a['aliases'].length === __b['aliases'].length &&
    __a['aliases'].every((__i, index) => __i === __b['aliases'][index])
  );
}
export function updateUser(value: user, changes: Partial<userInputParams>) {
  if (typeof changes['firstName'] !== 'undefined') {
    if (!(changes['firstName'] === value['firstName'])) {
      value = user({
        ...value,
        firstName: changes['firstName'],
      });
    }
  }
  if (typeof changes['aliases'] !== 'undefined') {
    if (
      !(
        changes['aliases'].length === value['aliases'].length &&
        changes['aliases'].every(
          (__i, index) => __i === value['aliases'][index]
        )
      )
    ) {
      value = user({
        ...value,
        aliases: changes['aliases'],
      });
    }
  }
  return value;
}
export const userDeletedMetadata = {
  name: 'userDeleted',
  params: [
    {
      name: 'deletedAt',
      type: {
        type: 'generic',
        value: 'int',
      },
    },
  ],
};
export interface userDeletedInputParams {
  deletedAt: number;
}
export function userDeleted(params: userDeletedInputParams): userDeleted {
  return {
    _name: 'user.userDeleted',
    deletedAt: params['deletedAt'],
  };
}
export function encodeUserDeleted(__s: ISerializer, value: userDeleted) {
  __s.writeInt32(1001160586);
  /**
   * encoding param: deletedAt
   */
  const __pv0 = value['deletedAt'];
  __s.writeInt32(__pv0);
}
export function decodeUserDeleted(__d: IDeserializer): userDeleted | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 1001160586) return null;
  let deletedAt: number;
  /**
   * decoding param: deletedAt
   */
  deletedAt = __d.readInt32();
  return {
    _name: 'user.userDeleted',
    deletedAt,
  };
}
export interface userDeleted {
  _name: 'user.userDeleted';
  deletedAt: number;
}
export function defaultUserDeleted(
  params: Partial<userDeletedInputParams> = {}
): userDeleted {
  return userDeleted({
    deletedAt: 0,
    ...params,
  });
}
export function compareUserDeleted(
  __a: userDeleted,
  __b: userDeleted
): boolean {
  return (
    /**
     * compare parameter deletedAt
     */
    __a['deletedAt'] === __b['deletedAt']
  );
}
export function updateUserDeleted(
  value: userDeleted,
  changes: Partial<userDeletedInputParams>
) {
  if (typeof changes['deletedAt'] !== 'undefined') {
    if (!(changes['deletedAt'] === value['deletedAt'])) {
      value = userDeleted({
        ...value,
        deletedAt: changes['deletedAt'],
      });
    }
  }
  return value;
}
export const testMetadata = {
  name: 'test',
  params: [
    {
      name: 'user',
      type: {
        type: 'internalType',
        kind: 'type',
        name: 'user',
      },
    },
    {
      name: 'b',
      type: {
        type: 'template',
        name: 'vector',
        value: {
          type: 'template',
          name: 'vector',
          value: {
            type: 'template',
            name: 'optional',
            value: {
              type: 'generic',
              value: 'string',
            },
          },
        },
      },
    },
  ],
};
export interface testInputParams {
  user: Readonly<user>;
  b: ReadonlyArray<ReadonlyArray<string | null>>;
}
export function test(params: testInputParams): test {
  return {
    _name: 'user.test',
    user: params['user'],
    b: params['b'],
  };
}
export function encodeTest(__s: ISerializer, value: test) {
  __s.writeInt32(-834825061);
  /**
   * encoding param: user
   */
  const __pv0 = value['user'];
  encodeUser(__s, __pv0);
  /**
   * encoding param: b
   */
  const __pv1 = value['b'];
  const __l2 = __pv1.length;
  __s.writeUint32(__l2);
  for (let __i2 = 0; __i2 < __l2; __i2++) {
    const __v__i2 = __pv1[__i2];
    const __l3 = __v__i2.length;
    __s.writeUint32(__l3);
    for (let __i3 = 0; __i3 < __l3; __i3++) {
      const __v__i3 = __v__i2[__i3];
      if (__v__i3 === null) {
        __s.writeUint8(0);
      } else {
        __s.writeUint8(1);
        __s.writeString(__v__i3);
      }
    }
  }
}
export function decodeTest(__d: IDeserializer): test | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -834825061) return null;
  let user: user;
  let b: Array<Array<string | null>>;
  /**
   * decoding param: user
   */
  const __tmp1 = decodeUser(__d);
  if (__tmp1 === null) return null;
  user = __tmp1;
  /**
   * decoding param: b
   */
  const __l2 = __d.readUint32();
  const __o2 = new Array<Array<string | null>>(__l2);
  b = __o2;
  for (let __i2 = 0; __i2 < __l2; __i2++) {
    const __l3 = __d.readUint32();
    const __o3 = new Array<string | null>(__l3);
    __o2[__i2] = __o3;
    for (let __i3 = 0; __i3 < __l3; __i3++) {
      if (__d.readUint8() === 1) {
        __o3[__i3] = __d.readString();
      } else {
        __o3[__i3] = null;
      }
    }
  }
  return {
    _name: 'user.test',
    user,
    b,
  };
}
export interface test {
  _name: 'user.test';
  user: Readonly<user>;
  b: ReadonlyArray<ReadonlyArray<string | null>>;
}
export function defaultTest(params: Partial<testInputParams> = {}): test {
  return test({
    user: defaultUser(),
    b: [],
    ...params,
  });
}
export function compareTest(__a: test, __b: test): boolean {
  return (
    /**
     * compare parameter user
     */
    compareUser(__a['user'], __b['user']) &&
    /**
     * compare parameter b
     */
    __a['b'].length === __b['b'].length &&
    __a['b'].every(
      (__i, index) =>
        __i.length === __b['b'][index].length &&
        __i.every((__i, index) =>
          ((__dp31, __dp32) =>
            __dp31 !== null && __dp32 !== null
              ? __dp31 === __dp32
              : __dp31 === __dp32)(__i, __b['b'][index][index])
        )
    )
  );
}
export function updateTest(value: test, changes: Partial<testInputParams>) {
  if (typeof changes['user'] !== 'undefined') {
    if (!compareUser(changes['user'], value['user'])) {
      value = test({
        ...value,
        user: changes['user'],
      });
    }
  }
  if (typeof changes['b'] !== 'undefined') {
    if (
      !(
        changes['b'].length === value['b'].length &&
        changes['b'].every(
          (__i, index) =>
            __i.length === value['b'][index].length &&
            __i.every((__i, index) =>
              ((__dp41, __dp42) =>
                __dp41 !== null && __dp42 !== null
                  ? __dp41 === __dp42
                  : __dp41 === __dp42)(__i, value['b'][index][index])
            )
        )
      )
    ) {
      value = test({
        ...value,
        b: changes['b'],
      });
    }
  }
  return value;
}
