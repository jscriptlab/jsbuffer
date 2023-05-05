import {ISerializer} from "./__types__";
import {IDeserializer} from "./__types__";
export interface userInputParams {
  id: number;
  firstName: string;
  lastName: string;
}
export function user(params: userInputParams): user {
  return {
    _name: 'tupleTest2.user',
    ...params
  };
}
export function encodeUser(s: ISerializer, value: user) {
  s.writeInt32(-556582279);
  /**
   * encoding param: id
   */
  const __pv0 = value['id'];
  s.writeInt32(__pv0);
  /**
   * encoding param: firstName
   */
  const __pv1 = value['firstName'];
  s.writeString(__pv1);
  /**
   * encoding param: lastName
   */
  const __pv2 = value['lastName'];
  s.writeString(__pv2);
}
export function decodeUser(__d: IDeserializer): user | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -556582279) return null;
  let id: number;
  let firstName: string;
  let lastName: string;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  /**
   * decoding param: firstName
   */
  firstName = __d.readString();
  /**
   * decoding param: lastName
   */
  lastName = __d.readString();
  return {
    _name: 'tupleTest2.user',
    id,
    firstName,
    lastName
  };
}
export interface user  {
  _name: 'tupleTest2.user';
  id: number;
  firstName: string;
  lastName: string;
}
export function userDefault(params: Partial<userInputParams> = {}): user {
  return user({
    id: 0,
    firstName: "",
    lastName: "",
    ...params
  });
}
export function userCompare(__a: user, __b: user) {
  /**
   * compare parameter id
   */
  if(!(__a['id'] === __b['id'])) return false;
  /**
   * compare parameter firstName
   */
  if(!(__a['firstName'] === __b['firstName'])) return false;
  /**
   * compare parameter lastName
   */
  if(!(__a['lastName'] === __b['lastName'])) return false;
  return true;
}
export interface postInputParams {
  id: number;
  title: string;
  comments: ReadonlyArray<comment>;
}
export function post(params: postInputParams): post {
  return {
    _name: 'tupleTest2.post',
    ...params
  };
}
export function encodePost(s: ISerializer, value: post) {
  s.writeInt32(207786521);
  /**
   * encoding param: id
   */
  const __pv0 = value['id'];
  s.writeInt32(__pv0);
  /**
   * encoding param: title
   */
  const __pv1 = value['title'];
  s.writeString(__pv1);
  /**
   * encoding param: comments
   */
  const __pv2 = value['comments'];
  const __l2 = __pv2.length;
  s.writeUint32(__l2);
  for(let __i2 = 0; __i2 < __l2; __i2++) {
    const __v__i2 = __pv2[__i2];
    encodeComment(s,__v__i2);
  }
}
export function decodePost(__d: IDeserializer): post | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 207786521) return null;
  let id: number;
  let title: string;
  let comments: Array<comment>;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  /**
   * decoding param: title
   */
  title = __d.readString();
  /**
   * decoding param: comments
   */
  {
    const iindex2 = __d.readUint32();
    const oindex2 = new Array(iindex2);
    comments = oindex2;
    for(let index2 = 0; index2 < iindex2; index2++) {
      const __tmp3 = decodeComment(__d);
      if(__tmp3 === null) return null;
      oindex2[index2] = __tmp3;
    }
  }
  return {
    _name: 'tupleTest2.post',
    id,
    title,
    comments
  };
}
export interface post  {
  _name: 'tupleTest2.post';
  id: number;
  title: string;
  comments: ReadonlyArray<comment>;
}
export function postDefault(params: Partial<postInputParams> = {}): post {
  return post({
    id: 0,
    title: "",
    comments: [],
    ...params
  });
}
export function postCompare(__a: post, __b: post) {
  /**
   * compare parameter id
   */
  if(!(__a['id'] === __b['id'])) return false;
  /**
   * compare parameter title
   */
  if(!(__a['title'] === __b['title'])) return false;
  /**
   * compare parameter comments
   */
  if(!(__a['comments'].length === __b['comments'].length && __a['comments'].every((__i,index) => (commentCompare(__i,__b['comments'][index]))))) return false;
  return true;
}
export interface commentInputParams {
  id: number;
  title: string;
  contents: string;
}
export function comment(params: commentInputParams): comment {
  return {
    _name: 'tupleTest2.comment',
    ...params
  };
}
export function encodeComment(s: ISerializer, value: comment) {
  s.writeInt32(-78333276);
  /**
   * encoding param: id
   */
  const __pv0 = value['id'];
  s.writeInt32(__pv0);
  /**
   * encoding param: title
   */
  const __pv1 = value['title'];
  s.writeString(__pv1);
  /**
   * encoding param: contents
   */
  const __pv2 = value['contents'];
  s.writeString(__pv2);
}
export function decodeComment(__d: IDeserializer): comment | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -78333276) return null;
  let id: number;
  let title: string;
  let contents: string;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  /**
   * decoding param: title
   */
  title = __d.readString();
  /**
   * decoding param: contents
   */
  contents = __d.readString();
  return {
    _name: 'tupleTest2.comment',
    id,
    title,
    contents
  };
}
export interface comment  {
  _name: 'tupleTest2.comment';
  id: number;
  title: string;
  contents: string;
}
export function commentDefault(params: Partial<commentInputParams> = {}): comment {
  return comment({
    id: 0,
    title: "",
    contents: "",
    ...params
  });
}
export function commentCompare(__a: comment, __b: comment) {
  /**
   * compare parameter id
   */
  if(!(__a['id'] === __b['id'])) return false;
  /**
   * compare parameter title
   */
  if(!(__a['title'] === __b['title'])) return false;
  /**
   * compare parameter contents
   */
  if(!(__a['contents'] === __b['contents'])) return false;
  return true;
}
export interface tupleTestInputParams {
  data: [user,post,comment,ReadonlyArray<comment>,ReadonlyArray<comment | null>];
}
export function tupleTest(params: tupleTestInputParams): tupleTest {
  return {
    _name: 'tupleTest2.tupleTest',
    ...params
  };
}
export function encodeTupleTest(s: ISerializer, value: tupleTest) {
  s.writeInt32(-47093845);
  /**
   * encoding param: data
   */
  const __pv0 = value['data'];
  {
    const __t00 = __pv0[0];
    {
      encodeUser(s,__t00);
    }
    const __t01 = __pv0[1];
    {
      encodePost(s,__t01);
    }
    const __t02 = __pv0[2];
    {
      encodeComment(s,__t02);
    }
    const __t03 = __pv0[3];
    {
      const __l1 = __t03.length;
      s.writeUint32(__l1);
      for(let __i1 = 0; __i1 < __l1; __i1++) {
        const __v__i1 = __t03[__i1];
        encodeComment(s,__v__i1);
      }
    }
    const __t04 = __pv0[4];
    {
      const __l1 = __t04.length;
      s.writeUint32(__l1);
      for(let __i1 = 0; __i1 < __l1; __i1++) {
        const __v__i1 = __t04[__i1];
        if(__v__i1 === null) {
          s.writeUint8(0);
        } else {
          s.writeUint8(1);
          encodeComment(s,__v__i1);
        }
      }
    }
  }
}
export function decodeTupleTest(__d: IDeserializer): tupleTest | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -47093845) return null;
  let data: [user,post,comment,Array<comment>,Array<comment | null>];
  /**
   * decoding param: data
   */
  {
    let e0: user;
    let e1: post;
    let e2: comment;
    let e3: Array<comment>;
    let e4: Array<comment | null>;
    {
      const __tmp0 = decodeUser(__d);
      if(__tmp0 === null) return null;
      e0 = __tmp0;
    }
    {
      const __tmp1 = decodePost(__d);
      if(__tmp1 === null) return null;
      e1 = __tmp1;
    }
    {
      const __tmp2 = decodeComment(__d);
      if(__tmp2 === null) return null;
      e2 = __tmp2;
    }
    {
      {
        const iindex3 = __d.readUint32();
        const oindex3 = new Array(iindex3);
        e3 = oindex3;
        for(let index3 = 0; index3 < iindex3; index3++) {
          const __tmp4 = decodeComment(__d);
          if(__tmp4 === null) return null;
          oindex3[index3] = __tmp4;
        }
      }
    }
    {
      {
        const iindex4 = __d.readUint32();
        const oindex4 = new Array(iindex4);
        e4 = oindex4;
        for(let index4 = 0; index4 < iindex4; index4++) {
          if(__d.readUint8() === 1) {
            const __tmp6 = decodeComment(__d);
            if(__tmp6 === null) return null;
            oindex4[index4] = __tmp6;
          } else {
            oindex4[index4] = null;
          }
        }
      }
    }
    data = [e0,e1,e2,e3,e4];
  }
  return {
    _name: 'tupleTest2.tupleTest',
    data
  };
}
export interface tupleTest  {
  _name: 'tupleTest2.tupleTest';
  data: [user,post,comment,ReadonlyArray<comment>,ReadonlyArray<comment | null>];
}
export function tupleTestDefault(params: Partial<tupleTestInputParams> = {}): tupleTest {
  return tupleTest({
    data: [userDefault(),postDefault(),commentDefault(),[],[]],
    ...params
  });
}
export function tupleTestCompare(__a: tupleTest, __b: tupleTest) {
  /**
   * compare parameter data
   */
  if(!(/* compare tuple item 0 of type user */ ((__a00, __b00) => userCompare(__a00,__b00))(__a['data'][0],__b['data'][0]) && /* compare tuple item 1 of type post */ ((__a01, __b01) => postCompare(__a01,__b01))(__a['data'][1],__b['data'][1]) && /* compare tuple item 2 of type comment */ ((__a02, __b02) => commentCompare(__a02,__b02))(__a['data'][2],__b['data'][2]) && /* compare tuple item 3 of type ReadonlyArray<comment> */ ((__a03, __b03) => __a03.length === __b03.length && __a03.every((__i,index) => (commentCompare(__i,__b03[index]))))(__a['data'][3],__b['data'][3]) && /* compare tuple item 4 of type ReadonlyArray<comment | null> */ ((__a04, __b04) => __a04.length === __b04.length && __a04.every((__i,index) => (((__dp61, __dp62) => __dp61 !== null && __dp62 !== null ? commentCompare(__dp61,__dp62) : __dp61 === __dp62)(__i,__b04[index]))))(__a['data'][4],__b['data'][4]))) return false;
  return true;
}
