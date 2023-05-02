import {User} from "./User";
import {Conversations} from "./conversation/index";
import {Request} from "./Request";
import {ISerializer} from "./__types__";
import {IDeserializer} from "./__types__";
import {encodeUserTrait} from "./User";
import {decodeUserTrait} from "./User";
import {IRequest} from "./__types__";
export function Void(params: Omit<Void,'_name'>): Void {
  return {
    _name: 'schema.Void',
    ...params
  };
}
export function encodeVoid(s: ISerializer, _: Void) {
  s.writeInt32(1293057661);
}
export function decodeVoid(d: IDeserializer): Void | null {
  const __id = d.readInt32();
  if(__id !== 1293057661) return null;
  return {
    _name: 'schema.Void',
  };
}
export interface Void  {
  _name: 'schema.Void';
}
export function msg(params: Omit<msg,'_name'>): msg {
  return {
    _name: 'schema.msg',
    ...params
  };
}
export function encodeMsg(s: ISerializer, value: msg) {
  s.writeInt32(-2038157559);
  s.writeUint32(value['data'].byteLength);
  s.writeBuffer(value['data']);
}
export function decodeMsg(d: IDeserializer): msg | null {
  const __id = d.readInt32();
  if(__id !== -2038157559) return null;
  let data: Uint8Array;
  data = d.readBuffer(d.readUint32());
  return {
    _name: 'schema.msg',
    data
  };
}
export interface msg  {
  _name: 'schema.msg';
  data: Uint8Array;
}
export type Result = Users | Posts;
export function encodeResultTrait(s: ISerializer,value: Result) {
  switch(value._name) {
    case 'schema.Users':
      encodeUsers(s,value);
      break;
    case 'schema.Posts':
      encodePosts(s,value);
      break;
  }
}
export function decodeResultTrait(d: IDeserializer) {
  const __id = d.readInt32();
  d.rewindInt32();
  let value: Users | Posts;
  switch(__id) {
    case 2098859696: {
      const tmp = decodeUsers(d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case -507244125: {
      const tmp = decodePosts(d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    default: return null;
  }
  return value;
}
export function Users(params: Omit<Users,'_name'>): Users {
  return {
    _name: 'schema.Users',
    ...params
  };
}
export function encodeUsers(s: ISerializer, value: Users) {
  s.writeInt32(2098859696);
  {
    const ia0 = value['users'].length;
    s.writeUint32(ia0);
    for(let a0 = 0; a0 < ia0; a0++) {
      const va0 = value['users'][a0];
      encodeUserTrait(s,va0);
    }
  }
}
export function decodeUsers(d: IDeserializer): Users | null {
  const __id = d.readInt32();
  if(__id !== 2098859696) return null;
  let users: Array<User>;
  {
    const ia0 = d.readUint32();
    users = new Array(ia0);
    for(let a0 = 0; a0 < ia0; a0++) {
      const tmp2 = decodeUserTrait(d);
      if(tmp2 === null) return null;
      users[a0] = tmp2;
    }
  }
  return {
    _name: 'schema.Users',
    users
  };
}
export interface Users  {
  _name: 'schema.Users';
  users: ReadonlyArray<User>;
}
export function GetUserById(params: Omit<GetUserById,'_name'>): GetUserById {
  return {
    _name: 'schema.GetUserById',
    ...params
  };
}
export function encodeGetUserById(s: ISerializer, value: GetUserById) {
  s.writeInt32(971329205);
  s.writeUint32(value['userId']);
}
export function decodeGetUserById(d: IDeserializer): GetUserById | null {
  const __id = d.readInt32();
  if(__id !== 971329205) return null;
  let userId: number;
  userId = d.readUint32();
  return {
    _name: 'schema.GetUserById',
    userId
  };
}
export interface GetUserById extends IRequest<Users> {
  _name: 'schema.GetUserById';
  userId: number;
}
export function Post(params: Omit<Post,'_name'>): Post {
  return {
    _name: 'schema.Post',
    ...params
  };
}
export function encodePost(s: ISerializer, value: Post) {
  s.writeInt32(-974927074);
  s.writeInt32(value['id']);
}
export function decodePost(d: IDeserializer): Post | null {
  const __id = d.readInt32();
  if(__id !== -974927074) return null;
  let id: number;
  id = d.readInt32();
  return {
    _name: 'schema.Post',
    id
  };
}
export interface Post  {
  _name: 'schema.Post';
  id: number;
}
export function Posts(params: Omit<Posts,'_name'>): Posts {
  return {
    _name: 'schema.Posts',
    ...params
  };
}
export function encodePosts(s: ISerializer, value: Posts) {
  s.writeInt32(-507244125);
  {
    const ia0 = value['posts'].length;
    s.writeUint32(ia0);
    for(let a0 = 0; a0 < ia0; a0++) {
      const va0 = value['posts'][a0];
      encodePost(s,va0);
    }
  }
}
export function decodePosts(d: IDeserializer): Posts | null {
  const __id = d.readInt32();
  if(__id !== -507244125) return null;
  let posts: Array<Post>;
  {
    const ia0 = d.readUint32();
    posts = new Array(ia0);
    for(let a0 = 0; a0 < ia0; a0++) {
      const tmp = decodePost(d);
      if(tmp === null) return null;
      posts[a0] = tmp;
    }
  }
  return {
    _name: 'schema.Posts',
    posts
  };
}
export interface Posts  {
  _name: 'schema.Posts';
  posts: ReadonlyArray<Post>;
}
export function GetPostById(params: Omit<GetPostById,'_name'>): GetPostById {
  return {
    _name: 'schema.GetPostById',
    ...params
  };
}
export function encodeGetPostById(s: ISerializer, value: GetPostById) {
  s.writeInt32(-1951096243);
  s.writeUint32(value['postId']);
}
export function decodeGetPostById(d: IDeserializer): GetPostById | null {
  const __id = d.readInt32();
  if(__id !== -1951096243) return null;
  let postId: number;
  postId = d.readUint32();
  return {
    _name: 'schema.GetPostById',
    postId
  };
}
export interface GetPostById extends IRequest<Posts> {
  _name: 'schema.GetPostById';
  postId: number;
}
export function GetConversations(params: Omit<GetConversations,'_name'>): GetConversations {
  return {
    _name: 'schema.GetConversations',
    ...params
  };
}
export function encodeGetConversations(s: ISerializer, _: GetConversations) {
  s.writeInt32(804827749);
}
export function decodeGetConversations(d: IDeserializer): GetConversations | null {
  const __id = d.readInt32();
  if(__id !== 804827749) return null;
  return {
    _name: 'schema.GetConversations',
  };
}
export interface GetConversations extends IRequest<Conversations> {
  _name: 'schema.GetConversations';
}
export function Coordinates(params: Omit<Coordinates,'_name'>): Coordinates {
  return {
    _name: 'schema.Coordinates',
    ...params
  };
}
export function encodeCoordinates(s: ISerializer, value: Coordinates) {
  s.writeInt32(858685263);
  s.writeDouble(value['latitude']);
  s.writeDouble(value['longitude']);
}
export function decodeCoordinates(d: IDeserializer): Coordinates | null {
  const __id = d.readInt32();
  if(__id !== 858685263) return null;
  let latitude: number;
  let longitude: number;
  latitude = d.readDouble();
  longitude = d.readDouble();
  return {
    _name: 'schema.Coordinates',
    latitude,
    longitude
  };
}
export interface Coordinates  {
  _name: 'schema.Coordinates';
  latitude: number;
  longitude: number;
}
