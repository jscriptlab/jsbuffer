import {User} from "./SecondUser";
import {ISerializer} from "./../__types__";
import {encodeUser} from "./SecondUser";
import {IDeserializer} from "./../__types__";
import {decodeUser} from "./SecondUser";
import {UserDefault} from "./SecondUser";
export interface ConversationInputParams {
  id: number;
  user: User;
}
export function Conversation(params: ConversationInputParams): Conversation {
  return {
    _name: 'conversation.index.Conversation',
    ...params
  };
}
export function encodeConversation(s: ISerializer, value: Conversation) {
  s.writeInt32(1477771794);
  /**
   * encoding param: id
   */
  const pv0 = value['id'];
  s.writeInt32(pv0);
  /**
   * encoding param: user
   */
  const pv1 = value['user'];
  encodeUser(s,pv1);
}
export function decodeConversation(__d: IDeserializer): Conversation | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== 1477771794) return null;
  let id: number;
  let user: User;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  /**
   * decoding param: user
   */
  const tmp2 = decodeUser(__d);
  if(tmp2 === null) return null;
  user = tmp2;
  return {
    _name: 'conversation.index.Conversation',
    id,
    user
  };
}
export interface Conversation  {
  _name: 'conversation.index.Conversation';
  id: number;
  user: User;
}
export function ConversationDefault(): Conversation {
  return Conversation({
    id: 0,
    user: UserDefault()
  });
}
export interface ConversationsInputParams {
  conversations: ReadonlyArray<Conversation>;
}
export function Conversations(params: ConversationsInputParams): Conversations {
  return {
    _name: 'conversation.index.Conversations',
    ...params
  };
}
export function encodeConversations(s: ISerializer, value: Conversations) {
  s.writeInt32(-386946239);
  /**
   * encoding param: conversations
   */
  const pv0 = value['conversations'];
  const __l0 = pv0.length;
  s.writeUint32(__l0);
  for(let __i0 = 0; __i0 < __l0; __i0++) {
    const v__i0 = pv0[__i0];
    encodeConversation(s,v__i0);
  }
}
export function decodeConversations(__d: IDeserializer): Conversations | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -386946239) return null;
  let conversations: Array<Conversation>;
  /**
   * decoding param: conversations
   */
  {
    const iindex0 = __d.readUint32();
    const oindex0 = new Array(iindex0);
    conversations = oindex0;
    for(let index0 = 0; index0 < iindex0; index0++) {
      const tmp1 = decodeConversation(__d);
      if(tmp1 === null) return null;
      oindex0[index0] = tmp1;
    }
  }
  return {
    _name: 'conversation.index.Conversations',
    conversations
  };
}
export interface Conversations  {
  _name: 'conversation.index.Conversations';
  conversations: ReadonlyArray<Conversation>;
}
export function ConversationsDefault(): Conversations {
  return Conversations({
    conversations: []
  });
}
