import {ISerializer} from "./__types__";
import {IDeserializer} from "./__types__";
export function user(params: Omit<user,'_name'>): user {
  return {
    _name: 'tupleTest2.user',
    ...params
  };
}
export function encodeUser(s: ISerializer, value: user) {
  s.writeInt32(-2072528781);
  /**
   * encoding param: id
   */
  const pv0 = value['id'];
  s.writeInt32(pv0);
  /**
   * encoding param: firstName
   */
  const pv1 = value['firstName'];
  s.writeString(pv1);
  /**
   * encoding param: lastName
   */
  const pv2 = value['lastName'];
  s.writeString(pv2);
}
export function decodeUser(__d: IDeserializer): user | null {
  const __id = __d.readInt32();
  if(__id !== -2072528781) return null;
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
export function post(params: Omit<post,'_name'>): post {
  return {
    _name: 'tupleTest2.post',
    ...params
  };
}
export function encodePost(s: ISerializer, value: post) {
  s.writeInt32(1399718583);
  /**
   * encoding param: id
   */
  const pv0 = value['id'];
  s.writeInt32(pv0);
  /**
   * encoding param: title
   */
  const pv1 = value['title'];
  s.writeString(pv1);
  /**
   * encoding param: comments
   */
  const pv2 = value['comments'];
  const __l2 = pv2.length;
  s.writeUint32(__l2);
  for(let __i2 = 0; __i2 < __l2; __i2++) {
    const v__i2 = pv2[__i2];
    encodeComment(s,v__i2);
  }
}
export function decodePost(__d: IDeserializer): post | null {
  const __id = __d.readInt32();
  if(__id !== 1399718583) return null;
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
      const tmp3 = decodeComment(__d);
      if(tmp3 === null) return null;
      oindex2[index2] = tmp3;
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
export function comment(params: Omit<comment,'_name'>): comment {
  return {
    _name: 'tupleTest2.comment',
    ...params
  };
}
export function encodeComment(s: ISerializer, value: comment) {
  s.writeInt32(-510569877);
  /**
   * encoding param: id
   */
  const pv0 = value['id'];
  s.writeInt32(pv0);
  /**
   * encoding param: title
   */
  const pv1 = value['title'];
  s.writeString(pv1);
  /**
   * encoding param: contents
   */
  const pv2 = value['contents'];
  s.writeString(pv2);
}
export function decodeComment(__d: IDeserializer): comment | null {
  const __id = __d.readInt32();
  if(__id !== -510569877) return null;
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
export function tupleTest(params: Omit<tupleTest,'_name'>): tupleTest {
  return {
    _name: 'tupleTest2.tupleTest',
    ...params
  };
}
export function encodeTupleTest(s: ISerializer, value: tupleTest) {
  s.writeInt32(2066879416);
  /**
   * encoding param: data
   */
  const pv0 = value['data'];
  {
    const __t00 = pv0[0];
    {
      encodeUser(s,__t00);
    }
    const __t01 = pv0[1];
    {
      encodePost(s,__t01);
    }
    const __t02 = pv0[2];
    {
      encodeComment(s,__t02);
    }
    const __t03 = pv0[3];
    {
      const __l1 = __t03.length;
      s.writeUint32(__l1);
      for(let __i1 = 0; __i1 < __l1; __i1++) {
        const v__i1 = __t03[__i1];
        encodeComment(s,v__i1);
      }
    }
    const __t04 = pv0[4];
    {
      const __l1 = __t04.length;
      s.writeUint32(__l1);
      for(let __i1 = 0; __i1 < __l1; __i1++) {
        const v__i1 = __t04[__i1];
        if(v__i1 === null) {
          s.writeUint8(0);
        } else {
          s.writeUint8(1);
          encodeComment(s,v__i1);
        }
      }
    }
  }
}
export function decodeTupleTest(__d: IDeserializer): tupleTest | null {
  const __id = __d.readInt32();
  if(__id !== 2066879416) return null;
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
      const tmp0 = decodeUser(__d);
      if(tmp0 === null) return null;
      e0 = tmp0;
    }
    {
      const tmp1 = decodePost(__d);
      if(tmp1 === null) return null;
      e1 = tmp1;
    }
    {
      const tmp2 = decodeComment(__d);
      if(tmp2 === null) return null;
      e2 = tmp2;
    }
    {
      {
        const iindex3 = __d.readUint32();
        const oindex3 = new Array(iindex3);
        e3 = oindex3;
        for(let index3 = 0; index3 < iindex3; index3++) {
          const tmp4 = decodeComment(__d);
          if(tmp4 === null) return null;
          oindex3[index3] = tmp4;
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
            const tmp6 = decodeComment(__d);
            if(tmp6 === null) return null;
            oindex4[index4] = tmp6;
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
