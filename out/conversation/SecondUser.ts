import { ISerializer } from '../__types__';
import { IDeserializer } from '../__types__';
export function isUser(value: unknown): value is User {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'conversation.secondUser.User'
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
  return true;
}
export const UserMetadata = {
  name: 'User',
  id: 1249778753,
  kind: 'type',
  params: [
    {
      name: 'firstName',
      type: {
        type: 'generic',
        value: 'string',
      },
    },
  ],
};
export const UserMetadataV2 = {
  kind: 'type',
  id: 1249778753,
  globalName: 'conversation.secondUser.User',
  name: 'User',
  params: [
    {
      name: 'firstName',
      type: {
        type: 'generic',
        value: 'string',
      },
    },
  ],
};
export interface UserInputParams {
  firstName: string;
}
export function User(params: UserInputParams): User {
  return {
    _name: 'conversation.secondUser.User',
    firstName: params['firstName'],
  };
}
export function encodeUser(__s: ISerializer, value: User) {
  __s.writeInt32(1249778753);
  /**
   * encoding param: firstName
   */
  const __pv0 = value['firstName'];
  __s.writeString(__pv0);
}
export function decodeUser(__d: IDeserializer): User | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 1249778753) return null;
  let firstName: string;
  /**
   * decoding param: firstName
   */
  firstName = __d.readString();
  return {
    _name: 'conversation.secondUser.User',
    firstName,
  };
}
export interface User {
  _name: 'conversation.secondUser.User';
  firstName: string;
}
export function defaultUser(params: Partial<UserInputParams> = {}): User {
  return User({
    firstName: '',
    ...params,
  });
}
export function compareUser(__a: User, __b: User): boolean {
  return (
    /**
     * compare parameter firstName
     */
    __a['firstName'] === __b['firstName']
  );
}
export function updateUser(value: User, changes: Partial<UserInputParams>) {
  if (typeof changes['firstName'] !== 'undefined') {
    if (!(changes['firstName'] === value['firstName'])) {
      value = User({
        ...value,
        firstName: changes['firstName'],
      });
    }
  }
  return value;
}
export const __metadataObjects__ = [UserMetadataV2];
