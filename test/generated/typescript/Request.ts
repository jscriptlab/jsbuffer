import { GetUserById } from './schema';
import { GetPostById } from './schema';
import { GetConversations } from './schema';
import { isGetUserById } from './schema';
import { isGetPostById } from './schema';
import { isGetConversations } from './schema';
import { ISerializer } from './__types__';
import { encodeGetUserById } from './schema';
import { encodeGetPostById } from './schema';
import { encodeGetConversations } from './schema';
import { IDeserializer } from './__types__';
import { decodeGetUserById } from './schema';
import { decodeGetPostById } from './schema';
import { decodeGetConversations } from './schema';
import { defaultGetUserById } from './schema';
import { compareGetUserById } from './schema';
import { compareGetPostById } from './schema';
import { compareGetConversations } from './schema';
export type Request =
  | Readonly<GetUserById>
  | Readonly<GetPostById>
  | Readonly<GetConversations>;
export function isRequestTrait(value: unknown): value is Request {
  if (isGetUserById(value)) return true;
  if (isGetPostById(value)) return true;
  if (isGetConversations(value)) return true;
  return false;
}
export function encodeRequestTrait(__s: ISerializer, value: Request) {
  switch (value._name) {
    case 'schema.GetUserById':
      return encodeGetUserById(__s, value);
    case 'schema.GetPostById':
      return encodeGetPostById(__s, value);
    case 'schema.GetConversations':
      return encodeGetConversations(__s, value);
  }
  throw new Error(
    `Failed to encode: Received invalid value on "_name" property. We got "${value['_name']}" value, but this function was expecting to receive one of the following:\n\t- schema.GetUserById\n\t- schema.GetPostById\n\t- schema.GetConversations\n\n\nPossible cause is that maybe this type simply does not extend this trait, and somehow the type-checking prevented you from calling this function wrongly.`
  );
}
export function decodeRequestTrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewind(4);
  let value: GetUserById | GetPostById | GetConversations;
  switch (__id) {
    case -2021730434: {
      const tmp = decodeGetUserById(__d);
      if (tmp === null) return null;
      value = tmp;
      break;
    }
    case -1279409050: {
      const tmp = decodeGetPostById(__d);
      if (tmp === null) return null;
      value = tmp;
      break;
    }
    case -416881: {
      const tmp = decodeGetConversations(__d);
      if (tmp === null) return null;
      value = tmp;
      break;
    }
    default:
      return null;
  }
  return value;
}
export function defaultRequestTrait() {
  return defaultGetUserById();
}
export function compareRequestTrait(__a: Request, __b: Request) {
  switch (__a._name) {
    case 'schema.GetUserById':
      if (__b._name !== 'schema.GetUserById') return false;
      return compareGetUserById(__a, __b);
    case 'schema.GetPostById':
      if (__b._name !== 'schema.GetPostById') return false;
      return compareGetPostById(__a, __b);
    case 'schema.GetConversations':
      if (__b._name !== 'schema.GetConversations') return false;
      return compareGetConversations(__a, __b);
  }
}
