import {ISerializer} from "./../__types__";
import {IDeserializer} from "./../__types__";
export interface UserInputParams {
  firstName: string;
}
export function User(params: UserInputParams): User {
  return {
    _name: 'conversation.secondUser.User',
    ...params
  };
}
export function encodeUser(s: ISerializer, value: User) {
  s.writeInt32(1030058769);
  /**
   * encoding param: firstName
   */
  const __pv0 = value['firstName'];
  s.writeString(__pv0);
}
export function decodeUser(__d: IDeserializer): User | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 1030058769) return null;
  let firstName: string;
  /**
   * decoding param: firstName
   */
  firstName = __d.readString();
  return {
    _name: 'conversation.secondUser.User',
    firstName
  };
}
export interface User  {
  _name: 'conversation.secondUser.User';
  firstName: string;
}
export function UserDefault(params: Partial<UserInputParams> = {}): User {
  return User({
    firstName: "",
    ...params
  });
}
export function UserCompare(__a: User, __b: User) {
  return (
    /**
     * compare parameter firstName
     */
    __a['firstName'] === __b['firstName']
  );
}
