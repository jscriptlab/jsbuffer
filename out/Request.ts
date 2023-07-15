import { GetUserById } from "./schema";
import { GetPostById } from "./schema";
import { GetConversations } from "./schema";
import { ISerializer } from "./__types__";
import { encodeGetUserById } from "./schema";
import { encodeGetPostById } from "./schema";
import { encodeGetConversations } from "./schema";
import { IDeserializer } from "./__types__";
import { decodeGetUserById } from "./schema";
import { decodeGetPostById } from "./schema";
import { decodeGetConversations } from "./schema";
import { defaultGetUserById } from "./schema";
import { compareGetUserById } from "./schema";
import { compareGetPostById } from "./schema";
import { compareGetConversations } from "./schema";
export type Request = Readonly<GetUserById> | Readonly<GetPostById> | Readonly<GetConversations>;
export function encodeRequestTrait(__s: ISerializer,value: Request) {
  switch(value._name) {
    case 'schema.GetUserById':
      encodeGetUserById(__s,value);
      break;
    case 'schema.GetPostById':
      encodeGetPostById(__s,value);
      break;
    case 'schema.GetConversations':
      encodeGetConversations(__s,value);
      break;
  }
}
export function decodeRequestTrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewindInt32();
  let value: GetUserById | GetPostById | GetConversations;
  switch(__id) {
    case -509540977: {
      const tmp = decodeGetUserById(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case 1475680092: {
      const tmp = decodeGetPostById(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case 1250914260: {
      const tmp = decodeGetConversations(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    default: return null;
  }
  return value;
}
export function defaultRequestTrait() {
  return defaultGetUserById();
}
export function compareRequestTrait(__a: Request, __b: Request) {
  switch(__a._name) {
    case 'schema.GetUserById':
      if(__b._name !== "schema.GetUserById") return false;
      return compareGetUserById(__a,__b);
    case 'schema.GetPostById':
      if(__b._name !== "schema.GetPostById") return false;
      return compareGetPostById(__a,__b);
    case 'schema.GetConversations':
      if(__b._name !== "schema.GetConversations") return false;
      return compareGetConversations(__a,__b);
  }
}
