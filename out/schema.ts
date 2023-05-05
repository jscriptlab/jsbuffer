import {User} from "./User";
import {Conversations} from "./conversation/index";
import {Request} from "./Request";
import {ISerializer} from "./__types__";
import {IDeserializer} from "./__types__";
import {encodeUserTrait} from "./User";
import {decodeUserTrait} from "./User";
import {compareUserTrait} from "./User";
import {compareUserTrait as compareUserTrait1} from "./User";
import {IRequest} from "./__types__";
export interface VoidInputParams {
}
export function Void(_: VoidInputParams = {}): Void {
  return {
    _name: 'schema.Void'
  };
}
export function encodeVoid(s: ISerializer, _: Void) {
  s.writeInt32(-1357667663);
}
export function decodeVoid(__d: IDeserializer): Void | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1357667663) return null;
  return {
    _name: 'schema.Void',
  };
}
export interface Void  {
  _name: 'schema.Void';
}
export function defaultVoid(params: Partial<VoidInputParams> = {}): Void {
  return Void({
    ...params
  });
}
export function compareVoid(__a: Void, __b: Void) {
  return true;
}
export function updateVoid(value: Void, _: Partial<VoidInputParams>) {
  return value;
}
export interface msgInputParams {
  data: Uint8Array;
}
export function msg(params: msgInputParams): msg {
  return {
    _name: 'schema.msg',
    data: params['data']
  };
}
export function encodeMsg(s: ISerializer, value: msg) {
  s.writeInt32(716170895);
  /**
   * encoding param: data
   */
  const __pv0 = value['data'];
  s.writeUint32(__pv0.byteLength);
  s.writeBuffer(__pv0);
}
export function decodeMsg(__d: IDeserializer): msg | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 716170895) return null;
  let data: Uint8Array;
  /**
   * decoding param: data
   */
  data = __d.readBuffer(__d.readUint32());
  return {
    _name: 'schema.msg',
    data
  };
}
export interface msg  {
  _name: 'schema.msg';
  data: Uint8Array;
}
export function defaultMsg(params: Partial<msgInputParams> = {}): msg {
  return msg({
    data: new Uint8Array(0),
    ...params
  });
}
export function compareMsg(__a: msg, __b: msg) {
  return (
    /**
     * compare parameter data
     */
    __a['data'].byteLength === __b['data'].byteLength && __a['data'].every((__byte,index) => __b['data'][index] === __byte)
  );
}
export function updateMsg(value: msg, changes: Partial<msgInputParams>) {
  if(typeof changes['data'] !== 'undefined') {
    if(!(changes['data'].byteLength === value['data'].byteLength && changes['data'].every((__byte,index) => value['data'][index] === __byte))) {
      value = msg({
        ...value,
        data: changes['data'],
      });
    }
  }
  return value;
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
export function decodeResultTrait(__d: IDeserializer) {
  const __id = __d.readInt32();
  __d.rewindInt32();
  let value: Users | Posts;
  switch(__id) {
    case 2102518628: {
      const tmp = decodeUsers(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case -1201900047: {
      const tmp = decodePosts(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    default: return null;
  }
  return value;
}
export function defaultResultTrait() {
  return defaultUsers();
}
export function compareResultTrait(__a: Result, __b: Result) {
  switch(__a._name) {
    case 'schema.Users':
      if(__b._name !== "schema.Users") return false;
      return compareUsers(__a,__b);
    case 'schema.Posts':
      if(__b._name !== "schema.Posts") return false;
      return comparePosts(__a,__b);
  }
}
export interface UsersInputParams {
  users: ReadonlyArray<User>;
}
export function Users(params: UsersInputParams): Users {
  return {
    _name: 'schema.Users',
    users: params['users']
  };
}
export function encodeUsers(s: ISerializer, value: Users) {
  s.writeInt32(2102518628);
  /**
   * encoding param: users
   */
  const __pv0 = value['users'];
  const __l0 = __pv0.length;
  s.writeUint32(__l0);
  for(let __i0 = 0; __i0 < __l0; __i0++) {
    const __v__i0 = __pv0[__i0];
    encodeUserTrait(s,__v__i0);
  }
}
export function decodeUsers(__d: IDeserializer): Users | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 2102518628) return null;
  let users: Array<User>;
  /**
   * decoding param: users
   */
  const iindex1 = __d.readUint32();
  const oindex1 = new Array<User>(iindex1);
  users = oindex1;
  for(let index1 = 0; index1 < iindex1; index1++) {
    const tmp3 = decodeUserTrait(__d);
    if(tmp3 === null) return null;
    oindex1[index1] = tmp3;
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
export function defaultUsers(params: Partial<UsersInputParams> = {}): Users {
  return Users({
    users: [],
    ...params
  });
}
export function compareUsers(__a: Users, __b: Users) {
  return (
    /**
     * compare parameter users
     */
    __a['users'].length === __b['users'].length && __a['users'].every((__i,index) => (compareUserTrait(__i,__b['users'][index])))
  );
}
export function updateUsers(value: Users, changes: Partial<UsersInputParams>) {
  if(typeof changes['users'] !== 'undefined') {
    if(!(changes['users'].length === value['users'].length && changes['users'].every((__i,index) => (compareUserTrait1(__i,value['users'][index]))))) {
      value = Users({
        ...value,
        users: changes['users'],
      });
    }
  }
  return value;
}
export interface GetUserByIdInputParams {
  userId: number;
}
export function GetUserById(params: GetUserByIdInputParams): GetUserById {
  return {
    _name: 'schema.GetUserById',
    userId: params['userId']
  };
}
export function encodeGetUserById(s: ISerializer, value: GetUserById) {
  s.writeInt32(-1984357298);
  /**
   * encoding param: userId
   */
  const __pv0 = value['userId'];
  s.writeUint32(__pv0);
}
export function decodeGetUserById(__d: IDeserializer): GetUserById | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1984357298) return null;
  let userId: number;
  /**
   * decoding param: userId
   */
  userId = __d.readUint32();
  return {
    _name: 'schema.GetUserById',
    userId
  };
}
export interface GetUserById extends IRequest<Users> {
  _name: 'schema.GetUserById';
  userId: number;
}
export function defaultGetUserById(params: Partial<GetUserByIdInputParams> = {}): GetUserById {
  return GetUserById({
    userId: 0,
    ...params
  });
}
export function compareGetUserById(__a: GetUserById, __b: GetUserById) {
  return (
    /**
     * compare parameter userId
     */
    __a['userId'] === __b['userId']
  );
}
export function updateGetUserById(value: GetUserById, changes: Partial<GetUserByIdInputParams>) {
  if(typeof changes['userId'] !== 'undefined') {
    if(!(changes['userId'] === value['userId'])) {
      value = GetUserById({
        ...value,
        userId: changes['userId'],
      });
    }
  }
  return value;
}
export interface PostInputParams {
  id: number;
}
export function Post(params: PostInputParams): Post {
  return {
    _name: 'schema.Post',
    id: params['id']
  };
}
export function encodePost(s: ISerializer, value: Post) {
  s.writeInt32(377172772);
  /**
   * encoding param: id
   */
  const __pv0 = value['id'];
  s.writeInt32(__pv0);
}
export function decodePost(__d: IDeserializer): Post | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 377172772) return null;
  let id: number;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  return {
    _name: 'schema.Post',
    id
  };
}
export interface Post  {
  _name: 'schema.Post';
  id: number;
}
export function defaultPost(params: Partial<PostInputParams> = {}): Post {
  return Post({
    id: 0,
    ...params
  });
}
export function comparePost(__a: Post, __b: Post) {
  return (
    /**
     * compare parameter id
     */
    __a['id'] === __b['id']
  );
}
export function updatePost(value: Post, changes: Partial<PostInputParams>) {
  if(typeof changes['id'] !== 'undefined') {
    if(!(changes['id'] === value['id'])) {
      value = Post({
        ...value,
        id: changes['id'],
      });
    }
  }
  return value;
}
export interface PostsInputParams {
  posts: ReadonlyArray<Post>;
}
export function Posts(params: PostsInputParams): Posts {
  return {
    _name: 'schema.Posts',
    posts: params['posts']
  };
}
export function encodePosts(s: ISerializer, value: Posts) {
  s.writeInt32(-1201900047);
  /**
   * encoding param: posts
   */
  const __pv0 = value['posts'];
  const __l0 = __pv0.length;
  s.writeUint32(__l0);
  for(let __i0 = 0; __i0 < __l0; __i0++) {
    const __v__i0 = __pv0[__i0];
    encodePost(s,__v__i0);
  }
}
export function decodePosts(__d: IDeserializer): Posts | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1201900047) return null;
  let posts: Array<Post>;
  /**
   * decoding param: posts
   */
  const iindex1 = __d.readUint32();
  const oindex1 = new Array<Post>(iindex1);
  posts = oindex1;
  for(let index1 = 0; index1 < iindex1; index1++) {
    const __tmp2 = decodePost(__d);
    if(__tmp2 === null) return null;
    oindex1[index1] = __tmp2;
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
export function defaultPosts(params: Partial<PostsInputParams> = {}): Posts {
  return Posts({
    posts: [],
    ...params
  });
}
export function comparePosts(__a: Posts, __b: Posts) {
  return (
    /**
     * compare parameter posts
     */
    __a['posts'].length === __b['posts'].length && __a['posts'].every((__i,index) => (comparePost(__i,__b['posts'][index])))
  );
}
export function updatePosts(value: Posts, changes: Partial<PostsInputParams>) {
  if(typeof changes['posts'] !== 'undefined') {
    if(!(changes['posts'].length === value['posts'].length && changes['posts'].every((__i,index) => (comparePost(__i,value['posts'][index]))))) {
      value = Posts({
        ...value,
        posts: changes['posts'],
      });
    }
  }
  return value;
}
export interface GetPostByIdInputParams {
  postId: number;
}
export function GetPostById(params: GetPostByIdInputParams): GetPostById {
  return {
    _name: 'schema.GetPostById',
    postId: params['postId']
  };
}
export function encodeGetPostById(s: ISerializer, value: GetPostById) {
  s.writeInt32(-1572332129);
  /**
   * encoding param: postId
   */
  const __pv0 = value['postId'];
  s.writeUint32(__pv0);
}
export function decodeGetPostById(__d: IDeserializer): GetPostById | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1572332129) return null;
  let postId: number;
  /**
   * decoding param: postId
   */
  postId = __d.readUint32();
  return {
    _name: 'schema.GetPostById',
    postId
  };
}
export interface GetPostById extends IRequest<Posts> {
  _name: 'schema.GetPostById';
  postId: number;
}
export function defaultGetPostById(params: Partial<GetPostByIdInputParams> = {}): GetPostById {
  return GetPostById({
    postId: 0,
    ...params
  });
}
export function compareGetPostById(__a: GetPostById, __b: GetPostById) {
  return (
    /**
     * compare parameter postId
     */
    __a['postId'] === __b['postId']
  );
}
export function updateGetPostById(value: GetPostById, changes: Partial<GetPostByIdInputParams>) {
  if(typeof changes['postId'] !== 'undefined') {
    if(!(changes['postId'] === value['postId'])) {
      value = GetPostById({
        ...value,
        postId: changes['postId'],
      });
    }
  }
  return value;
}
export interface GetConversationsInputParams {
}
export function GetConversations(_: GetConversationsInputParams = {}): GetConversations {
  return {
    _name: 'schema.GetConversations'
  };
}
export function encodeGetConversations(s: ISerializer, _: GetConversations) {
  s.writeInt32(814848329);
}
export function decodeGetConversations(__d: IDeserializer): GetConversations | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 814848329) return null;
  return {
    _name: 'schema.GetConversations',
  };
}
export interface GetConversations extends IRequest<Conversations> {
  _name: 'schema.GetConversations';
}
export function defaultGetConversations(params: Partial<GetConversationsInputParams> = {}): GetConversations {
  return GetConversations({
    ...params
  });
}
export function compareGetConversations(__a: GetConversations, __b: GetConversations) {
  return true;
}
export function updateGetConversations(value: GetConversations, _: Partial<GetConversationsInputParams>) {
  return value;
}
export interface CoordinatesInputParams {
  latitude: number;
  longitude: number;
}
export function Coordinates(params: CoordinatesInputParams): Coordinates {
  return {
    _name: 'schema.Coordinates',
    latitude: params['latitude'],
    longitude: params['longitude']
  };
}
export function encodeCoordinates(s: ISerializer, value: Coordinates) {
  s.writeInt32(1260153754);
  /**
   * encoding param: latitude
   */
  const __pv0 = value['latitude'];
  s.writeDouble(__pv0);
  /**
   * encoding param: longitude
   */
  const __pv1 = value['longitude'];
  s.writeDouble(__pv1);
}
export function decodeCoordinates(__d: IDeserializer): Coordinates | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 1260153754) return null;
  let latitude: number;
  let longitude: number;
  /**
   * decoding param: latitude
   */
  latitude = __d.readDouble();
  /**
   * decoding param: longitude
   */
  longitude = __d.readDouble();
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
export function defaultCoordinates(params: Partial<CoordinatesInputParams> = {}): Coordinates {
  return Coordinates({
    latitude: 0.0,
    longitude: 0.0,
    ...params
  });
}
export function compareCoordinates(__a: Coordinates, __b: Coordinates) {
  return (
    /**
     * compare parameter latitude
     */
    __a['latitude'] === __b['latitude'] &&
    /**
     * compare parameter longitude
     */
    __a['longitude'] === __b['longitude']
  );
}
export function updateCoordinates(value: Coordinates, changes: Partial<CoordinatesInputParams>) {
  if(typeof changes['latitude'] !== 'undefined') {
    if(!(changes['latitude'] === value['latitude'])) {
      value = Coordinates({
        ...value,
        latitude: changes['latitude'],
      });
    }
  }
  if(typeof changes['longitude'] !== 'undefined') {
    if(!(changes['longitude'] === value['longitude'])) {
      value = Coordinates({
        ...value,
        longitude: changes['longitude'],
      });
    }
  }
  return value;
}
export interface ShouldSupportSeveralSequentialVectorParamsInputParams {
  a: ReadonlyArray<number>;
  b: ReadonlyArray<number>;
  c: ReadonlyArray<string>;
  d: ReadonlyArray<number>;
  e: ReadonlyArray<number>;
  f: ReadonlyArray<ReadonlyArray<number> | null>;
  g: [number,number,number,ReadonlyArray<number>,string | null];
}
export function ShouldSupportSeveralSequentialVectorParams(params: ShouldSupportSeveralSequentialVectorParamsInputParams): ShouldSupportSeveralSequentialVectorParams {
  return {
    _name: 'schema.ShouldSupportSeveralSequentialVectorParams',
    a: params['a'],
    b: params['b'],
    c: params['c'],
    d: params['d'],
    e: params['e'],
    f: params['f'],
    g: params['g']
  };
}
export function encodeShouldSupportSeveralSequentialVectorParams(s: ISerializer, value: ShouldSupportSeveralSequentialVectorParams) {
  s.writeInt32(-992083773);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  const __l0 = __pv0.length;
  s.writeUint32(__l0);
  for(let __i0 = 0; __i0 < __l0; __i0++) {
    const __v__i0 = __pv0[__i0];
    s.writeInt32(__v__i0);
  }
  /**
   * encoding param: b
   */
  const __pv1 = value['b'];
  const __l1 = __pv1.length;
  s.writeUint32(__l1);
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    const __v__i1 = __pv1[__i1];
    s.writeDouble(__v__i1);
  }
  /**
   * encoding param: c
   */
  const __pv2 = value['c'];
  const __l2 = __pv2.length;
  s.writeUint32(__l2);
  for(let __i2 = 0; __i2 < __l2; __i2++) {
    const __v__i2 = __pv2[__i2];
    s.writeString(__v__i2);
  }
  /**
   * encoding param: d
   */
  const __pv3 = value['d'];
  const __l3 = __pv3.length;
  s.writeUint32(__l3);
  for(let __i3 = 0; __i3 < __l3; __i3++) {
    const __v__i3 = __pv3[__i3];
    s.writeFloat(__v__i3);
  }
  /**
   * encoding param: e
   */
  const __pv4 = value['e'];
  const __l4 = __pv4.length;
  s.writeUint32(__l4);
  for(let __i4 = 0; __i4 < __l4; __i4++) {
    const __v__i4 = __pv4[__i4];
    s.writeUint32(__v__i4);
  }
  /**
   * encoding param: f
   */
  const __pv5 = value['f'];
  const __l5 = __pv5.length;
  s.writeUint32(__l5);
  for(let __i5 = 0; __i5 < __l5; __i5++) {
    const __v__i5 = __pv5[__i5];
    if(__v__i5 === null) {
      s.writeUint8(0);
    } else {
      s.writeUint8(1);
      const __l7 = __v__i5.length;
      s.writeUint32(__l7);
      for(let __i7 = 0; __i7 < __l7; __i7++) {
        const __v__i7 = __v__i5[__i7];
        s.writeUint32(__v__i7);
      }
    }
  }
  /**
   * encoding param: g
   */
  const __pv6 = value['g'];
  {
    const __t60 = __pv6[0];
    {
      s.writeInt32(__t60);
    }
    const __t61 = __pv6[1];
    {
      s.writeFloat(__t61);
    }
    const __t62 = __pv6[2];
    {
      s.writeDouble(__t62);
    }
    const __t63 = __pv6[3];
    {
      const __l7 = __t63.length;
      s.writeUint32(__l7);
      for(let __i7 = 0; __i7 < __l7; __i7++) {
        const __v__i7 = __t63[__i7];
        s.writeUint32(__v__i7);
      }
    }
    const __t64 = __pv6[4];
    {
      if(__t64 === null) {
        s.writeUint8(0);
      } else {
        s.writeUint8(1);
        s.writeString(__t64);
      }
    }
  }
}
export function decodeShouldSupportSeveralSequentialVectorParams(__d: IDeserializer): ShouldSupportSeveralSequentialVectorParams | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -992083773) return null;
  let a: Array<number>;
  let b: Array<number>;
  let c: Array<string>;
  let d: Array<number>;
  let e: Array<number>;
  let f: Array<Array<number> | null>;
  let g: [number,number,number,Array<number>,string | null];
  /**
   * decoding param: a
   */
  const iindex1 = __d.readUint32();
  const oindex1 = new Array<number>(iindex1);
  a = oindex1;
  for(let index1 = 0; index1 < iindex1; index1++) {
    oindex1[index1] = __d.readInt32();
  }
  /**
   * decoding param: b
   */
  const iindex3 = __d.readUint32();
  const oindex3 = new Array<number>(iindex3);
  b = oindex3;
  for(let index3 = 0; index3 < iindex3; index3++) {
    oindex3[index3] = __d.readDouble();
  }
  /**
   * decoding param: c
   */
  const iindex5 = __d.readUint32();
  const oindex5 = new Array<string>(iindex5);
  c = oindex5;
  for(let index5 = 0; index5 < iindex5; index5++) {
    oindex5[index5] = __d.readString();
  }
  /**
   * decoding param: d
   */
  const iindex7 = __d.readUint32();
  const oindex7 = new Array<number>(iindex7);
  d = oindex7;
  for(let index7 = 0; index7 < iindex7; index7++) {
    oindex7[index7] = __d.readFloat();
  }
  /**
   * decoding param: e
   */
  const iindex9 = __d.readUint32();
  const oindex9 = new Array<number>(iindex9);
  e = oindex9;
  for(let index9 = 0; index9 < iindex9; index9++) {
    oindex9[index9] = __d.readUint32();
  }
  /**
   * decoding param: f
   */
  const iindex11 = __d.readUint32();
  const oindex11 = new Array<Array<number> | null>(iindex11);
  f = oindex11;
  for(let index11 = 0; index11 < iindex11; index11++) {
    if(__d.readUint8() === 1) {
      const iindex13 = __d.readUint32();
      const oindex13 = new Array<number>(iindex13);
      oindex11[index11] = oindex13;
      for(let index13 = 0; index13 < iindex13; index13++) {
        oindex13[index13] = __d.readUint32();
      }
    } else {
      oindex11[index11] = null;
    }
  }
  /**
   * decoding param: g
   */
  let __e15: number;
  __e15 = __d.readInt32();
  let __e16: number;
  __e16 = __d.readFloat();
  let __e17: number;
  __e17 = __d.readDouble();
  let __e18: Array<number>;
  const iindex19 = __d.readUint32();
  const oindex19 = new Array<number>(iindex19);
  __e18 = oindex19;
  for(let index19 = 0; index19 < iindex19; index19++) {
    oindex19[index19] = __d.readUint32();
  }
  let __e20: string | null;
  if(__d.readUint8() === 1) {
    __e20 = __d.readString();
  } else {
    __e20 = null;
  }
  g = [__e15,__e16,__e17,__e18,__e20];
  return {
    _name: 'schema.ShouldSupportSeveralSequentialVectorParams',
    a,
    b,
    c,
    d,
    e,
    f,
    g
  };
}
export interface ShouldSupportSeveralSequentialVectorParams  {
  _name: 'schema.ShouldSupportSeveralSequentialVectorParams';
  a: ReadonlyArray<number>;
  b: ReadonlyArray<number>;
  c: ReadonlyArray<string>;
  d: ReadonlyArray<number>;
  e: ReadonlyArray<number>;
  f: ReadonlyArray<ReadonlyArray<number> | null>;
  g: [number,number,number,ReadonlyArray<number>,string | null];
}
export function defaultShouldSupportSeveralSequentialVectorParams(params: Partial<ShouldSupportSeveralSequentialVectorParamsInputParams> = {}): ShouldSupportSeveralSequentialVectorParams {
  return ShouldSupportSeveralSequentialVectorParams({
    a: [],
    b: [],
    c: [],
    d: [],
    e: [],
    f: [],
    g: [0,0.0,0.0,[],null],
    ...params
  });
}
export function compareShouldSupportSeveralSequentialVectorParams(__a: ShouldSupportSeveralSequentialVectorParams, __b: ShouldSupportSeveralSequentialVectorParams) {
  return (
    /**
     * compare parameter a
     */
    __a['a'].length === __b['a'].length && __a['a'].every((__i,index) => (__i === __b['a'][index])) &&
    /**
     * compare parameter b
     */
    __a['b'].length === __b['b'].length && __a['b'].every((__i,index) => (__i === __b['b'][index])) &&
    /**
     * compare parameter c
     */
    __a['c'].length === __b['c'].length && __a['c'].every((__i,index) => (__i === __b['c'][index])) &&
    /**
     * compare parameter d
     */
    __a['d'].length === __b['d'].length && __a['d'].every((__i,index) => (__i === __b['d'][index])) &&
    /**
     * compare parameter e
     */
    __a['e'].length === __b['e'].length && __a['e'].every((__i,index) => (__i === __b['e'][index])) &&
    /**
     * compare parameter f
     */
    __a['f'].length === __b['f'].length && __a['f'].every((__i,index) => (((__dp61, __dp62) => __dp61 !== null && __dp62 !== null ? __dp61.length === __dp62.length && __dp61.every((__i,index) => (__i === __dp62[index])) : __dp61 === __dp62)(__i,__b['f'][index]))) &&
    /**
     * compare parameter g
     */
    /* compare tuple item 0 of type number */ ((__a60, __b60) => __a60 === __b60)(__a['g'][0],__b['g'][0]) && /* compare tuple item 1 of type number */ ((__a61, __b61) => __a61 === __b61)(__a['g'][1],__b['g'][1]) && /* compare tuple item 2 of type number */ ((__a62, __b62) => __a62 === __b62)(__a['g'][2],__b['g'][2]) && /* compare tuple item 3 of type ReadonlyArray<number> */ ((__a63, __b63) => __a63.length === __b63.length && __a63.every((__i,index) => (__i === __b63[index])))(__a['g'][3],__b['g'][3]) && /* compare tuple item 4 of type string | null */ ((__a64, __b64) => ((__dp111, __dp112) => __dp111 !== null && __dp112 !== null ? __dp111 === __dp112 : __dp111 === __dp112)(__a64,__b64))(__a['g'][4],__b['g'][4])
  );
}
export function updateShouldSupportSeveralSequentialVectorParams(value: ShouldSupportSeveralSequentialVectorParams, changes: Partial<ShouldSupportSeveralSequentialVectorParamsInputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(changes['a'].length === value['a'].length && changes['a'].every((__i,index) => (__i === value['a'][index])))) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        a: changes['a'],
      });
    }
  }
  if(typeof changes['b'] !== 'undefined') {
    if(!(changes['b'].length === value['b'].length && changes['b'].every((__i,index) => (__i === value['b'][index])))) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        b: changes['b'],
      });
    }
  }
  if(typeof changes['c'] !== 'undefined') {
    if(!(changes['c'].length === value['c'].length && changes['c'].every((__i,index) => (__i === value['c'][index])))) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        c: changes['c'],
      });
    }
  }
  if(typeof changes['d'] !== 'undefined') {
    if(!(changes['d'].length === value['d'].length && changes['d'].every((__i,index) => (__i === value['d'][index])))) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        d: changes['d'],
      });
    }
  }
  if(typeof changes['e'] !== 'undefined') {
    if(!(changes['e'].length === value['e'].length && changes['e'].every((__i,index) => (__i === value['e'][index])))) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        e: changes['e'],
      });
    }
  }
  if(typeof changes['f'] !== 'undefined') {
    if(!(changes['f'].length === value['f'].length && changes['f'].every((__i,index) => (((__dp61, __dp62) => __dp61 !== null && __dp62 !== null ? __dp61.length === __dp62.length && __dp61.every((__i,index) => (__i === __dp62[index])) : __dp61 === __dp62)(__i,value['f'][index]))))) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        f: changes['f'],
      });
    }
  }
  if(typeof changes['g'] !== 'undefined') {
    if(!(/* compare tuple item 0 of type number */ ((__a60, __b60) => __a60 === __b60)(changes['g'][0],value['g'][0]) && /* compare tuple item 1 of type number */ ((__a61, __b61) => __a61 === __b61)(changes['g'][1],value['g'][1]) && /* compare tuple item 2 of type number */ ((__a62, __b62) => __a62 === __b62)(changes['g'][2],value['g'][2]) && /* compare tuple item 3 of type ReadonlyArray<number> */ ((__a63, __b63) => __a63.length === __b63.length && __a63.every((__i,index) => (__i === __b63[index])))(changes['g'][3],value['g'][3]) && /* compare tuple item 4 of type string | null */ ((__a64, __b64) => ((__dp111, __dp112) => __dp111 !== null && __dp112 !== null ? __dp111 === __dp112 : __dp111 === __dp112)(__a64,__b64))(changes['g'][4],value['g'][4]))) {
      value = ShouldSupportSeveralSequentialVectorParams({
        ...value,
        g: changes['g'],
      });
    }
  }
  return value;
}
export interface simpleTupleTestInputParams {
  a: [number,number,number,ReadonlyArray<number>,string | null];
  b: ReadonlyArray<[number,number,number,ReadonlyArray<number>,string | null]>;
}
export function simpleTupleTest(params: simpleTupleTestInputParams): simpleTupleTest {
  return {
    _name: 'schema.simpleTupleTest',
    a: params['a'],
    b: params['b']
  };
}
export function encodeSimpleTupleTest(s: ISerializer, value: simpleTupleTest) {
  s.writeInt32(1950454485);
  /**
   * encoding param: a
   */
  const __pv0 = value['a'];
  {
    const __t00 = __pv0[0];
    {
      s.writeInt32(__t00);
    }
    const __t01 = __pv0[1];
    {
      s.writeFloat(__t01);
    }
    const __t02 = __pv0[2];
    {
      s.writeDouble(__t02);
    }
    const __t03 = __pv0[3];
    {
      const __l1 = __t03.length;
      s.writeUint32(__l1);
      for(let __i1 = 0; __i1 < __l1; __i1++) {
        const __v__i1 = __t03[__i1];
        s.writeUint32(__v__i1);
      }
    }
    const __t04 = __pv0[4];
    {
      if(__t04 === null) {
        s.writeUint8(0);
      } else {
        s.writeUint8(1);
        s.writeString(__t04);
      }
    }
  }
  /**
   * encoding param: b
   */
  const __pv1 = value['b'];
  const __l1 = __pv1.length;
  s.writeUint32(__l1);
  for(let __i1 = 0; __i1 < __l1; __i1++) {
    const __v__i1 = __pv1[__i1];
    {
      const __t20 = __v__i1[0];
      {
        s.writeInt32(__t20);
      }
      const __t21 = __v__i1[1];
      {
        s.writeFloat(__t21);
      }
      const __t22 = __v__i1[2];
      {
        s.writeDouble(__t22);
      }
      const __t23 = __v__i1[3];
      {
        const __l3 = __t23.length;
        s.writeUint32(__l3);
        for(let __i3 = 0; __i3 < __l3; __i3++) {
          const __v__i3 = __t23[__i3];
          s.writeUint32(__v__i3);
        }
      }
      const __t24 = __v__i1[4];
      {
        if(__t24 === null) {
          s.writeUint8(0);
        } else {
          s.writeUint8(1);
          s.writeString(__t24);
        }
      }
    }
  }
}
export function decodeSimpleTupleTest(__d: IDeserializer): simpleTupleTest | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 1950454485) return null;
  let a: [number,number,number,Array<number>,string | null];
  let b: Array<[number,number,number,Array<number>,string | null]>;
  /**
   * decoding param: a
   */
  let __e1: number;
  __e1 = __d.readInt32();
  let __e2: number;
  __e2 = __d.readFloat();
  let __e3: number;
  __e3 = __d.readDouble();
  let __e4: Array<number>;
  const iindex5 = __d.readUint32();
  const oindex5 = new Array<number>(iindex5);
  __e4 = oindex5;
  for(let index5 = 0; index5 < iindex5; index5++) {
    oindex5[index5] = __d.readUint32();
  }
  let __e6: string | null;
  if(__d.readUint8() === 1) {
    __e6 = __d.readString();
  } else {
    __e6 = null;
  }
  a = [__e1,__e2,__e3,__e4,__e6];
  /**
   * decoding param: b
   */
  const iindex9 = __d.readUint32();
  const oindex9 = new Array<[number,number,number,Array<number>,string | null]>(iindex9);
  b = oindex9;
  for(let index9 = 0; index9 < iindex9; index9++) {
    let __e10: number;
    __e10 = __d.readInt32();
    let __e11: number;
    __e11 = __d.readFloat();
    let __e12: number;
    __e12 = __d.readDouble();
    let __e13: Array<number>;
    const iindex14 = __d.readUint32();
    const oindex14 = new Array<number>(iindex14);
    __e13 = oindex14;
    for(let index14 = 0; index14 < iindex14; index14++) {
      oindex14[index14] = __d.readUint32();
    }
    let __e15: string | null;
    if(__d.readUint8() === 1) {
      __e15 = __d.readString();
    } else {
      __e15 = null;
    }
    oindex9[index9] = [__e10,__e11,__e12,__e13,__e15];
  }
  return {
    _name: 'schema.simpleTupleTest',
    a,
    b
  };
}
export interface simpleTupleTest  {
  _name: 'schema.simpleTupleTest';
  a: [number,number,number,ReadonlyArray<number>,string | null];
  b: ReadonlyArray<[number,number,number,ReadonlyArray<number>,string | null]>;
}
export function defaultSimpleTupleTest(params: Partial<simpleTupleTestInputParams> = {}): simpleTupleTest {
  return simpleTupleTest({
    a: [0,0.0,0.0,[],null],
    b: [],
    ...params
  });
}
export function compareSimpleTupleTest(__a: simpleTupleTest, __b: simpleTupleTest) {
  return (
    /**
     * compare parameter a
     */
    /* compare tuple item 0 of type number */ ((__a00, __b00) => __a00 === __b00)(__a['a'][0],__b['a'][0]) && /* compare tuple item 1 of type number */ ((__a01, __b01) => __a01 === __b01)(__a['a'][1],__b['a'][1]) && /* compare tuple item 2 of type number */ ((__a02, __b02) => __a02 === __b02)(__a['a'][2],__b['a'][2]) && /* compare tuple item 3 of type ReadonlyArray<number> */ ((__a03, __b03) => __a03.length === __b03.length && __a03.every((__i,index) => (__i === __b03[index])))(__a['a'][3],__b['a'][3]) && /* compare tuple item 4 of type string | null */ ((__a04, __b04) => ((__dp51, __dp52) => __dp51 !== null && __dp52 !== null ? __dp51 === __dp52 : __dp51 === __dp52)(__a04,__b04))(__a['a'][4],__b['a'][4]) &&
    /**
     * compare parameter b
     */
    __a['b'].length === __b['b'].length && __a['b'].every((__i,index) => (/* compare tuple item 0 of type number */ ((__a20, __b20) => __a20 === __b20)(__i[0],__b['b'][index][0]) && /* compare tuple item 1 of type number */ ((__a21, __b21) => __a21 === __b21)(__i[1],__b['b'][index][1]) && /* compare tuple item 2 of type number */ ((__a22, __b22) => __a22 === __b22)(__i[2],__b['b'][index][2]) && /* compare tuple item 3 of type ReadonlyArray<number> */ ((__a23, __b23) => __a23.length === __b23.length && __a23.every((__i,index) => (__i === __b23[index])))(__i[3],__b['b'][index][3]) && /* compare tuple item 4 of type string | null */ ((__a24, __b24) => ((__dp71, __dp72) => __dp71 !== null && __dp72 !== null ? __dp71 === __dp72 : __dp71 === __dp72)(__a24,__b24))(__i[4],__b['b'][index][4])))
  );
}
export function updateSimpleTupleTest(value: simpleTupleTest, changes: Partial<simpleTupleTestInputParams>) {
  if(typeof changes['a'] !== 'undefined') {
    if(!(/* compare tuple item 0 of type number */ ((__a00, __b00) => __a00 === __b00)(changes['a'][0],value['a'][0]) && /* compare tuple item 1 of type number */ ((__a01, __b01) => __a01 === __b01)(changes['a'][1],value['a'][1]) && /* compare tuple item 2 of type number */ ((__a02, __b02) => __a02 === __b02)(changes['a'][2],value['a'][2]) && /* compare tuple item 3 of type ReadonlyArray<number> */ ((__a03, __b03) => __a03.length === __b03.length && __a03.every((__i,index) => (__i === __b03[index])))(changes['a'][3],value['a'][3]) && /* compare tuple item 4 of type string | null */ ((__a04, __b04) => ((__dp51, __dp52) => __dp51 !== null && __dp52 !== null ? __dp51 === __dp52 : __dp51 === __dp52)(__a04,__b04))(changes['a'][4],value['a'][4]))) {
      value = simpleTupleTest({
        ...value,
        a: changes['a'],
      });
    }
  }
  if(typeof changes['b'] !== 'undefined') {
    if(!(changes['b'].length === value['b'].length && changes['b'].every((__i,index) => (/* compare tuple item 0 of type number */ ((__a20, __b20) => __a20 === __b20)(__i[0],value['b'][index][0]) && /* compare tuple item 1 of type number */ ((__a21, __b21) => __a21 === __b21)(__i[1],value['b'][index][1]) && /* compare tuple item 2 of type number */ ((__a22, __b22) => __a22 === __b22)(__i[2],value['b'][index][2]) && /* compare tuple item 3 of type ReadonlyArray<number> */ ((__a23, __b23) => __a23.length === __b23.length && __a23.every((__i,index) => (__i === __b23[index])))(__i[3],value['b'][index][3]) && /* compare tuple item 4 of type string | null */ ((__a24, __b24) => ((__dp71, __dp72) => __dp71 !== null && __dp72 !== null ? __dp71 === __dp72 : __dp71 === __dp72)(__a24,__b24))(__i[4],value['b'][index][4]))))) {
      value = simpleTupleTest({
        ...value,
        b: changes['b'],
      });
    }
  }
  return value;
}
export interface emptyNodeInputParams {
}
export function emptyNode(_: emptyNodeInputParams = {}): emptyNode {
  return {
    _name: 'schema.emptyNode'
  };
}
export function encodeEmptyNode(s: ISerializer, _: emptyNode) {
  s.writeInt32(-1657223713);
}
export function decodeEmptyNode(__d: IDeserializer): emptyNode | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1657223713) return null;
  return {
    _name: 'schema.emptyNode',
  };
}
export interface emptyNode  {
  _name: 'schema.emptyNode';
}
export function defaultEmptyNode(params: Partial<emptyNodeInputParams> = {}): emptyNode {
  return emptyNode({
    ...params
  });
}
export function compareEmptyNode(__a: emptyNode, __b: emptyNode) {
  return true;
}
export function updateEmptyNode(value: emptyNode, _: Partial<emptyNodeInputParams>) {
  return value;
}
export interface userInputParams {
  id: number;
  name: string;
}
export function user(params: userInputParams): user {
  return {
    _name: 'schema.user',
    id: params['id'],
    name: params['name']
  };
}
export function encodeUser(s: ISerializer, value: user) {
  s.writeInt32(-399411702);
  /**
   * encoding param: id
   */
  const __pv0 = value['id'];
  s.writeInt32(__pv0);
  /**
   * encoding param: name
   */
  const __pv1 = value['name'];
  s.writeString(__pv1);
}
export function decodeUser(__d: IDeserializer): user | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -399411702) return null;
  let id: number;
  let name: string;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  /**
   * decoding param: name
   */
  name = __d.readString();
  return {
    _name: 'schema.user',
    id,
    name
  };
}
export interface user  {
  _name: 'schema.user';
  id: number;
  name: string;
}
export function defaultUser(params: Partial<userInputParams> = {}): user {
  return user({
    id: 0,
    name: "",
    ...params
  });
}
export function compareUser(__a: user, __b: user) {
  return (
    /**
     * compare parameter id
     */
    __a['id'] === __b['id'] &&
    /**
     * compare parameter name
     */
    __a['name'] === __b['name']
  );
}
export function updateUser(value: user, changes: Partial<userInputParams>) {
  if(typeof changes['id'] !== 'undefined') {
    if(!(changes['id'] === value['id'])) {
      value = user({
        ...value,
        id: changes['id'],
      });
    }
  }
  if(typeof changes['name'] !== 'undefined') {
    if(!(changes['name'] === value['name'])) {
      value = user({
        ...value,
        name: changes['name'],
      });
    }
  }
  return value;
}
