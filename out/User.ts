import { ISerializer } from './__types__';
import { IDeserializer } from './__types__';
import JSBI from 'jsbi';
export type User = Readonly<user> | Readonly<userDeleted>;
export function isUserTrait(value: unknown): value is User {
  if (isUser(value)) return true;
  if (isUserDeleted(value)) return true;
  return false;
}
export function encodeUserTrait(__s: ISerializer, value: User) {
  switch (value._name) {
    case 'user.user':
      return encodeUser(__s, value);
    case 'user.userDeleted':
      return encodeUserDeleted(__s, value);
  }
  throw new Error(
    `Failed to encode: Received invalid value on "_name" property. We got "${value['_name']}" value, but this function was expecting to receive one of the following:\n\t- user.user\n\t- user.userDeleted\n\n\nPossible cause is that maybe this type simply does not extend this trait, and somehow the type-checking prevented you from calling this function wrongly.`
  );
}
export function decodeUserTrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewind(4);
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
export function isTestTrait(value: unknown): value is Test {
  if (isTest(value)) return true;
  return false;
}
export function encodeTestTrait(__s: ISerializer, value: Test) {
  switch (value._name) {
    case 'user.test':
      return encodeTest(__s, value);
  }
  throw new Error(
    `Failed to encode: Received invalid value on "_name" property. We got "${value['_name']}" value, but this function was expecting to receive one of the following:\n\t- user.test\n\n\nPossible cause is that maybe this type simply does not extend this trait, and somehow the type-checking prevented you from calling this function wrongly.`
  );
}
export function decodeTestTrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewind(4);
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
export interface user {
  _name: 'user.user';
  firstName: string;
  aliases: ReadonlyArray<string>;
}
export function isUser(value: unknown): value is user {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'user.user'
    )
  )
    return false;
  if (
    !(
      'firstName' in value &&
      ((__v0) => typeof __v0 === 'string')(value['firstName'])
    )
  )
    return false;
  if (
    !(
      'aliases' in value &&
      ((__v1) =>
        (Array.isArray(__v1) || __v1 instanceof Set) &&
        Array.from(__v1).every((p) => typeof p === 'string'))(value['aliases'])
    )
  )
    return false;
  return true;
}
export interface userInputParams {
  firstName: string;
  aliases: ReadonlyArray<string>;
}
export function user(params: userInputParams): user {
  return {
    _name: 'user.user',
    firstName: params['firstName'],
    aliases: params['aliases']
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
  for (const __item2 of __pv1) {
    __s.writeString(__item2);
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
    aliases
  };
}
export function defaultUser(params: Partial<userInputParams> = {}): user {
  return user({
    firstName: '',
    aliases: [],
    ...params
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
    Array.from(__a['aliases']).every((__originalItem1, __index1) =>
      typeof __originalItem1 === 'undefined'
        ? false
        : ((__item1) =>
            typeof __item1 === 'undefined'
              ? false
              : __originalItem1 === __item1)(
            Array.from(__b['aliases'])[__index1]
          )
    )
  );
}
export function updateUser(value: user, changes: Partial<userInputParams>) {
  if (typeof changes['firstName'] !== 'undefined') {
    if (!(changes['firstName'] === value['firstName'])) {
      value = user({
        ...value,
        firstName: changes['firstName']
      });
    }
  }
  if (typeof changes['aliases'] !== 'undefined') {
    if (
      !(
        changes['aliases'].length === value['aliases'].length &&
        Array.from(changes['aliases']).every((__originalItem2, __index2) =>
          typeof __originalItem2 === 'undefined'
            ? false
            : ((__item2) =>
                typeof __item2 === 'undefined'
                  ? false
                  : __originalItem2 === __item2)(
                Array.from(value['aliases'])[__index2]
              )
        )
      )
    ) {
      value = user({
        ...value,
        aliases: changes['aliases']
      });
    }
  }
  return value;
}
export interface userDeleted {
  _name: 'user.userDeleted';
  deletedAt: number;
}
export function isUserDeleted(value: unknown): value is userDeleted {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'user.userDeleted'
    )
  )
    return false;
  if (
    !(
      'deletedAt' in value &&
      ((__v0) =>
        typeof __v0 === 'number' &&
        JSBI.equal(JSBI.BigInt(__v0), JSBI.BigInt(__v0)) &&
        JSBI.greaterThanOrEqual(
          JSBI.BigInt(__v0),
          JSBI.BigInt('-2147483648')
        ) &&
        JSBI.lessThanOrEqual(JSBI.BigInt(__v0), JSBI.BigInt('2147483647')))(
        value['deletedAt']
      )
    )
  )
    return false;
  return true;
}
export interface userDeletedInputParams {
  deletedAt: number;
}
export function userDeleted(params: userDeletedInputParams): userDeleted {
  return {
    _name: 'user.userDeleted',
    deletedAt: params['deletedAt']
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
    deletedAt
  };
}
export function defaultUserDeleted(
  params: Partial<userDeletedInputParams> = {}
): userDeleted {
  return userDeleted({
    deletedAt: 0,
    ...params
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
        deletedAt: changes['deletedAt']
      });
    }
  }
  return value;
}
export interface test {
  _name: 'user.test';
  user: Readonly<user>;
  b: ReadonlyArray<ReadonlyArray<string | null>>;
}
export function isTest(value: unknown): value is test {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'user.test'
    )
  )
    return false;
  if (!('user' in value && ((__v0) => isUser(__v0))(value['user'])))
    return false;
  if (
    !(
      'b' in value &&
      ((__v1) =>
        (Array.isArray(__v1) || __v1 instanceof Set) &&
        Array.from(__v1).every(
          (p) =>
            (Array.isArray(p) || p instanceof Set) &&
            Array.from(p).every((p) =>
              p === null ? true : ((x) => typeof x === 'string')(p)
            )
        ))(value['b'])
    )
  )
    return false;
  return true;
}
export interface testInputParams {
  user: Readonly<user>;
  b: ReadonlyArray<ReadonlyArray<string | null>>;
}
export function test(params: testInputParams): test {
  return {
    _name: 'user.test',
    user: params['user'],
    b: params['b']
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
  for (const __item2 of __pv1) {
    const __l3 = __item2.length;
    __s.writeUint32(__l3);
    for (const __item3 of __item2) {
      if (__item3 === null) {
        __s.writeUint8(0);
      } else {
        __s.writeUint8(1);
        __s.writeString(__item3);
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
    b
  };
}
export function defaultTest(params: Partial<testInputParams> = {}): test {
  return test({
    user: defaultUser(),
    b: [],
    ...params
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
    Array.from(__a['b']).every((__originalItem1, __index1) =>
      typeof __originalItem1 === 'undefined'
        ? false
        : ((__item1) =>
            typeof __item1 === 'undefined'
              ? false
              : __originalItem1.length === __item1.length &&
                Array.from(__originalItem1).every((__originalItem2, __index2) =>
                  typeof __originalItem2 === 'undefined'
                    ? false
                    : ((__item2) =>
                        typeof __item2 === 'undefined'
                          ? false
                          : ((__dp31, __dp32) =>
                              __dp31 !== null && __dp32 !== null
                                ? __dp31 === __dp32
                                : __dp31 === __dp32)(__originalItem2, __item2))(
                        Array.from(__item1)[__index2]
                      )
                ))(Array.from(__b['b'])[__index1])
    )
  );
}
export function updateTest(value: test, changes: Partial<testInputParams>) {
  if (typeof changes['user'] !== 'undefined') {
    if (!compareUser(changes['user'], value['user'])) {
      value = test({
        ...value,
        user: changes['user']
      });
    }
  }
  if (typeof changes['b'] !== 'undefined') {
    if (
      !(
        changes['b'].length === value['b'].length &&
        Array.from(changes['b']).every((__originalItem2, __index2) =>
          typeof __originalItem2 === 'undefined'
            ? false
            : ((__item2) =>
                typeof __item2 === 'undefined'
                  ? false
                  : __originalItem2.length === __item2.length &&
                    Array.from(__originalItem2).every(
                      (__originalItem3, __index3) =>
                        typeof __originalItem3 === 'undefined'
                          ? false
                          : ((__item3) =>
                              typeof __item3 === 'undefined'
                                ? false
                                : ((__dp41, __dp42) =>
                                    __dp41 !== null && __dp42 !== null
                                      ? __dp41 === __dp42
                                      : __dp41 === __dp42)(
                                    __originalItem3,
                                    __item3
                                  ))(Array.from(__item2)[__index3])
                    ))(Array.from(value['b'])[__index2])
        )
      )
    ) {
      value = test({
        ...value,
        b: changes['b']
      });
    }
  }
  return value;
}
