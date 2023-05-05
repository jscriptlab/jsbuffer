import {GetUserById} from "./schema";
import {GetPostById} from "./schema";
import {GetConversations} from "./schema";
import {ISerializer} from "./__types__";
import {encodeGetUserById} from "./schema";
import {encodeGetPostById} from "./schema";
import {encodeGetConversations} from "./schema";
import {IDeserializer} from "./__types__";
import {decodeGetUserById} from "./schema";
import {decodeGetPostById} from "./schema";
import {decodeGetConversations} from "./schema";
import {GetUserByIdDefault} from "./schema";
import {GetUserByIdCompare} from "./schema";
import {GetPostByIdCompare} from "./schema";
import {GetConversationsCompare} from "./schema";
export type Request = GetUserById | GetPostById | GetConversations;
export function encodeRequestTrait(s: ISerializer,value: Request) {
  switch(value._name) {
    case 'schema.GetUserById':
      encodeGetUserById(s,value);
      break;
    case 'schema.GetPostById':
      encodeGetPostById(s,value);
      break;
    case 'schema.GetConversations':
      encodeGetConversations(s,value);
      break;
  }
}
export function decodeRequestTrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewindInt32();
  let value: GetUserById | GetPostById | GetConversations;
  switch(__id) {
    case -1984357298: {
      const tmp = decodeGetUserById(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case -1572332129: {
      const tmp = decodeGetPostById(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case 814848329: {
      const tmp = decodeGetConversations(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    default: return null;
  }
  return value;
}
export function RequestDefault() {
  return GetUserByIdDefault();
}
export function RequestCompare(__a: Request, __b: Request) {
  switch(__a._name) {
    case 'schema.GetUserById':
      if(__b._name !== "schema.GetUserById") return false;
      return GetUserByIdCompare(__a,__b);
    case 'schema.GetPostById':
      if(__b._name !== "schema.GetPostById") return false;
      return GetPostByIdCompare(__a,__b);
    case 'schema.GetConversations':
      if(__b._name !== "schema.GetConversations") return false;
      return GetConversationsCompare(__a,__b);
  }
}
