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
export function decodeRequestTrait(d: IDeserializer) {
  const __id = d.readInt32();
  d.rewindInt32();
  let value: GetUserById | GetPostById | GetConversations;
  switch(__id) {
    case 971329205: {
      const tmp = decodeGetUserById(d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case -1951096243: {
      const tmp = decodeGetPostById(d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case 804827749: {
      const tmp = decodeGetConversations(d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    default: return null;
  }
  return value;
}
