import { ISerializer, IDeserializer } from './../__types__';

export function User(params: Omit<User,'_name'>): User {
  return {
    _name: 'conversation.secondUser.User',
    ...params
  };
}
export function encodeUser(s: ISerializer, value: User) {
  s.writeInt32(-420842594);
  s.writeString(value['firstName']);
}
export function decodeUser(d: IDeserializer): User | null {
  const __id = d.readInt32();
  if(__id !== -420842594) return null;
  let firstName: string;
  firstName = d.readString();
  return {
    _name: 'conversation.secondUser.User',
    firstName
  };
}
export interface User  {
  _name: 'conversation.secondUser.User';
  firstName: string;
}
