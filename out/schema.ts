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
export function decodeVoid(__d: IDeserializer): Void | null {
  const __id = __d.readInt32();
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
  /**
   * encoding param: data
   */
  const pv0 = value['data'];
  s.writeUint32(pv0.byteLength);
  s.writeBuffer(pv0);
}
export function decodeMsg(__d: IDeserializer): msg | null {
  const __id = __d.readInt32();
  if(__id !== -2038157559) return null;
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
    case 2098859696: {
      const tmp = decodeUsers(__d);
      if(tmp === null) return null;
      value = tmp;
      break;
    }
    case -507244125: {
      const tmp = decodePosts(__d);
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
  /**
   * encoding param: users
   */
  const pv0 = value['users'];
  const l0 = pv0.length;
  s.writeUint32(l0);
  for(let i0 = 0; i0 < l0; i0++) {
    const vi0 = pv0[i0];
    encodeUserTrait(s,vi0);
  }
}
export function decodeUsers(__d: IDeserializer): Users | null {
  const __id = __d.readInt32();
  if(__id !== 2098859696) return null;
  let users: Array<User>;
  /**
   * decoding param: users
   */
  {
    const iindex0 = __d.readUint32();
    const oindex0 = new Array(iindex0);
    users = oindex0;
    for(let index0 = 0; index0 < iindex0; index0++) {
      const tmp2 = decodeUserTrait(__d);
      if(tmp2 === null) return null;
      oindex0[index0] = tmp2;
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
  /**
   * encoding param: userId
   */
  const pv0 = value['userId'];
  s.writeUint32(pv0);
}
export function decodeGetUserById(__d: IDeserializer): GetUserById | null {
  const __id = __d.readInt32();
  if(__id !== 971329205) return null;
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
export function Post(params: Omit<Post,'_name'>): Post {
  return {
    _name: 'schema.Post',
    ...params
  };
}
export function encodePost(s: ISerializer, value: Post) {
  s.writeInt32(-974927074);
  /**
   * encoding param: id
   */
  const pv0 = value['id'];
  s.writeInt32(pv0);
}
export function decodePost(__d: IDeserializer): Post | null {
  const __id = __d.readInt32();
  if(__id !== -974927074) return null;
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
export function Posts(params: Omit<Posts,'_name'>): Posts {
  return {
    _name: 'schema.Posts',
    ...params
  };
}
export function encodePosts(s: ISerializer, value: Posts) {
  s.writeInt32(-507244125);
  /**
   * encoding param: posts
   */
  const pv0 = value['posts'];
  const l0 = pv0.length;
  s.writeUint32(l0);
  for(let i0 = 0; i0 < l0; i0++) {
    const vi0 = pv0[i0];
    encodePost(s,vi0);
  }
}
export function decodePosts(__d: IDeserializer): Posts | null {
  const __id = __d.readInt32();
  if(__id !== -507244125) return null;
  let posts: Array<Post>;
  /**
   * decoding param: posts
   */
  {
    const iindex0 = __d.readUint32();
    const oindex0 = new Array(iindex0);
    posts = oindex0;
    for(let index0 = 0; index0 < iindex0; index0++) {
      const tmp1 = decodePost(__d);
      if(tmp1 === null) return null;
      oindex0[index0] = tmp1;
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
  /**
   * encoding param: postId
   */
  const pv0 = value['postId'];
  s.writeUint32(pv0);
}
export function decodeGetPostById(__d: IDeserializer): GetPostById | null {
  const __id = __d.readInt32();
  if(__id !== -1951096243) return null;
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
export function GetConversations(params: Omit<GetConversations,'_name'>): GetConversations {
  return {
    _name: 'schema.GetConversations',
    ...params
  };
}
export function encodeGetConversations(s: ISerializer, _: GetConversations) {
  s.writeInt32(804827749);
}
export function decodeGetConversations(__d: IDeserializer): GetConversations | null {
  const __id = __d.readInt32();
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
  /**
   * encoding param: latitude
   */
  const pv0 = value['latitude'];
  s.writeDouble(pv0);
  /**
   * encoding param: longitude
   */
  const pv1 = value['longitude'];
  s.writeDouble(pv1);
}
export function decodeCoordinates(__d: IDeserializer): Coordinates | null {
  const __id = __d.readInt32();
  if(__id !== 858685263) return null;
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
export function ShouldSupportSeveralSequentialVectorParams(params: Omit<ShouldSupportSeveralSequentialVectorParams,'_name'>): ShouldSupportSeveralSequentialVectorParams {
  return {
    _name: 'schema.ShouldSupportSeveralSequentialVectorParams',
    ...params
  };
}
export function encodeShouldSupportSeveralSequentialVectorParams(s: ISerializer, value: ShouldSupportSeveralSequentialVectorParams) {
  s.writeInt32(-247992242);
  /**
   * encoding param: a
   */
  const pv0 = value['a'];
  const l0 = pv0.length;
  s.writeUint32(l0);
  for(let i0 = 0; i0 < l0; i0++) {
    const vi0 = pv0[i0];
    s.writeInt32(vi0);
  }
  /**
   * encoding param: b
   */
  const pv1 = value['b'];
  const l1 = pv1.length;
  s.writeUint32(l1);
  for(let i1 = 0; i1 < l1; i1++) {
    const vi1 = pv1[i1];
    s.writeDouble(vi1);
  }
  /**
   * encoding param: c
   */
  const pv2 = value['c'];
  const l2 = pv2.length;
  s.writeUint32(l2);
  for(let i2 = 0; i2 < l2; i2++) {
    const vi2 = pv2[i2];
    s.writeString(vi2);
  }
  /**
   * encoding param: d
   */
  const pv3 = value['d'];
  const l3 = pv3.length;
  s.writeUint32(l3);
  for(let i3 = 0; i3 < l3; i3++) {
    const vi3 = pv3[i3];
    s.writeFloat(vi3);
  }
  /**
   * encoding param: e
   */
  const pv4 = value['e'];
  const l4 = pv4.length;
  s.writeUint32(l4);
  for(let i4 = 0; i4 < l4; i4++) {
    const vi4 = pv4[i4];
    s.writeUint32(vi4);
  }
  /**
   * encoding param: f
   */
  const pv5 = value['f'];
  const l5 = pv5.length;
  s.writeUint32(l5);
  for(let i5 = 0; i5 < l5; i5++) {
    const vi5 = pv5[i5];
    if(vi5 === null) {
      s.writeUint8(0);
    } else {
      s.writeUint8(1);
      const l7 = vi5.length;
      s.writeUint32(l7);
      for(let i7 = 0; i7 < l7; i7++) {
        const vi7 = vi5[i7];
        s.writeUint32(vi7);
      }
    }
  }
  /**
   * encoding param: g
   */
  const pv6 = value['g'];
  {
    const t60 = pv6[0];
    s.writeInt32(t60);
    const t61 = pv6[1];
    s.writeFloat(t61);
    const t62 = pv6[2];
    s.writeDouble(t62);
    const t63 = pv6[3];
    const l7 = t63.length;
    s.writeUint32(l7);
    for(let i7 = 0; i7 < l7; i7++) {
      const vi7 = t63[i7];
      s.writeUint32(vi7);
    }
    const t64 = pv6[4];
    if(t64 === null) {
      s.writeUint8(0);
    } else {
      s.writeUint8(1);
      s.writeString(t64);
    }
  }
}
export function decodeShouldSupportSeveralSequentialVectorParams(__d: IDeserializer): ShouldSupportSeveralSequentialVectorParams | null {
  const __id = __d.readInt32();
  if(__id !== -247992242) return null;
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
  {
    const iindex0 = __d.readUint32();
    const oindex0 = new Array(iindex0);
    a = oindex0;
    for(let index0 = 0; index0 < iindex0; index0++) {
      oindex0[index0] = __d.readInt32();
    }
  }
  /**
   * decoding param: b
   */
  {
    const iindex1 = __d.readUint32();
    const oindex1 = new Array(iindex1);
    b = oindex1;
    for(let index1 = 0; index1 < iindex1; index1++) {
      oindex1[index1] = __d.readDouble();
    }
  }
  /**
   * decoding param: c
   */
  {
    const iindex2 = __d.readUint32();
    const oindex2 = new Array(iindex2);
    c = oindex2;
    for(let index2 = 0; index2 < iindex2; index2++) {
      oindex2[index2] = __d.readString();
    }
  }
  /**
   * decoding param: d
   */
  {
    const iindex3 = __d.readUint32();
    const oindex3 = new Array(iindex3);
    d = oindex3;
    for(let index3 = 0; index3 < iindex3; index3++) {
      oindex3[index3] = __d.readFloat();
    }
  }
  /**
   * decoding param: e
   */
  {
    const iindex4 = __d.readUint32();
    const oindex4 = new Array(iindex4);
    e = oindex4;
    for(let index4 = 0; index4 < iindex4; index4++) {
      oindex4[index4] = __d.readUint32();
    }
  }
  /**
   * decoding param: f
   */
  {
    const iindex5 = __d.readUint32();
    const oindex5 = new Array(iindex5);
    f = oindex5;
    for(let index5 = 0; index5 < iindex5; index5++) {
      if(__d.readUint8() === 1) {
        {
          const iindex7 = __d.readUint32();
          const oindex7 = new Array(iindex7);
          oindex5[index5] = oindex7;
          for(let index7 = 0; index7 < iindex7; index7++) {
            oindex7[index7] = __d.readUint32();
          }
        }
      } else {
        oindex5[index5] = null;
      }
    }
  }
  /**
   * decoding param: g
   */
  {
    let e0: number;
    let e1: number;
    let e2: number;
    let e3: Array<number>;
    let e4: string | null;
    e0 = __d.readInt32();
    e1 = __d.readFloat();
    e2 = __d.readDouble();
    {
      const iindex9 = __d.readUint32();
      const oindex9 = new Array(iindex9);
      e3 = oindex9;
      for(let index9 = 0; index9 < iindex9; index9++) {
        oindex9[index9] = __d.readUint32();
      }
    }
    if(__d.readUint8() === 1) {
      e4 = __d.readString();
    } else {
      e4 = null;
    }
    g = [e0,e1,e2,e3,e4];
  }
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
export function simpleTupleTest(params: Omit<simpleTupleTest,'_name'>): simpleTupleTest {
  return {
    _name: 'schema.simpleTupleTest',
    ...params
  };
}
export function encodeSimpleTupleTest(s: ISerializer, value: simpleTupleTest) {
  s.writeInt32(934509586);
  /**
   * encoding param: a
   */
  const pv0 = value['a'];
  {
    const t00 = pv0[0];
    s.writeInt32(t00);
    const t01 = pv0[1];
    s.writeFloat(t01);
    const t02 = pv0[2];
    s.writeDouble(t02);
    const t03 = pv0[3];
    const l1 = t03.length;
    s.writeUint32(l1);
    for(let i1 = 0; i1 < l1; i1++) {
      const vi1 = t03[i1];
      s.writeUint32(vi1);
    }
    const t04 = pv0[4];
    if(t04 === null) {
      s.writeUint8(0);
    } else {
      s.writeUint8(1);
      s.writeString(t04);
    }
  }
  /**
   * encoding param: b
   */
  const pv1 = value['b'];
  const l1 = pv1.length;
  s.writeUint32(l1);
  for(let i1 = 0; i1 < l1; i1++) {
    const vi1 = pv1[i1];
    {
      const t20 = vi1[0];
      s.writeInt32(t20);
      const t21 = vi1[1];
      s.writeFloat(t21);
      const t22 = vi1[2];
      s.writeDouble(t22);
      const t23 = vi1[3];
      const l3 = t23.length;
      s.writeUint32(l3);
      for(let i3 = 0; i3 < l3; i3++) {
        const vi3 = t23[i3];
        s.writeUint32(vi3);
      }
      const t24 = vi1[4];
      if(t24 === null) {
        s.writeUint8(0);
      } else {
        s.writeUint8(1);
        s.writeString(t24);
      }
    }
  }
}
export function decodeSimpleTupleTest(__d: IDeserializer): simpleTupleTest | null {
  const __id = __d.readInt32();
  if(__id !== 934509586) return null;
  let a: [number,number,number,Array<number>,string | null];
  let b: Array<[number,number,number,Array<number>,string | null]>;
  /**
   * decoding param: a
   */
  {
    let e0: number;
    let e1: number;
    let e2: number;
    let e3: Array<number>;
    let e4: string | null;
    e0 = __d.readInt32();
    e1 = __d.readFloat();
    e2 = __d.readDouble();
    {
      const iindex3 = __d.readUint32();
      const oindex3 = new Array(iindex3);
      e3 = oindex3;
      for(let index3 = 0; index3 < iindex3; index3++) {
        oindex3[index3] = __d.readUint32();
      }
    }
    if(__d.readUint8() === 1) {
      e4 = __d.readString();
    } else {
      e4 = null;
    }
    a = [e0,e1,e2,e3,e4];
  }
  /**
   * decoding param: b
   */
  {
    const iindex1 = __d.readUint32();
    const oindex1 = new Array(iindex1);
    b = oindex1;
    for(let index1 = 0; index1 < iindex1; index1++) {
      {
        let e0: number;
        let e1: number;
        let e2: number;
        let e3: Array<number>;
        let e4: string | null;
        e0 = __d.readInt32();
        e1 = __d.readFloat();
        e2 = __d.readDouble();
        {
          const iindex5 = __d.readUint32();
          const oindex5 = new Array(iindex5);
          e3 = oindex5;
          for(let index5 = 0; index5 < iindex5; index5++) {
            oindex5[index5] = __d.readUint32();
          }
        }
        if(__d.readUint8() === 1) {
          e4 = __d.readString();
        } else {
          e4 = null;
        }
        oindex1[index1] = [e0,e1,e2,e3,e4];
      }
    }
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
