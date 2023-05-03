import {ISerializer} from "./../__types__";
import {IDeserializer} from "./../__types__";
export function User(params: Omit<User,'_name'>): User {
  return {
    _name: 'conversation.secondUser.User',
    ...params
  };
}
export function encodeUser(s: ISerializer, value: User) {
  s.writeInt32(-420842594);
  /**
   * encoding param: firstName
   */
  const pv0 = value['firstName'];
  s.writeString(pv0);
}
export function decodeUser(__d: IDeserializer): User | null {
  const __id = __d.readInt32();
  if(__id !== -420842594) return null;
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
