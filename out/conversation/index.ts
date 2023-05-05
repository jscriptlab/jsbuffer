import {User} from "./SecondUser";
import {ISerializer} from "./../__types__";
import {encodeUser} from "./SecondUser";
import {IDeserializer} from "./../__types__";
import {decodeUser} from "./SecondUser";
import {UserDefault} from "./SecondUser";
import {UserCompare} from "./SecondUser";
export interface ConversationInputParams {
  id: number;
  user: User;
}
export function Conversation(params: ConversationInputParams): Conversation {
  return {
    _name: 'conversation.index.Conversation',
    id: params['id'],
    user: params['user']
  };
}
export function encodeConversation(s: ISerializer, value: Conversation) {
  s.writeInt32(-563833943);
  /**
   * encoding param: id
   */
  const __pv0 = value['id'];
  s.writeInt32(__pv0);
  /**
   * encoding param: user
   */
  const __pv1 = value['user'];
  encodeUser(s,__pv1);
}
export function decodeConversation(__d: IDeserializer): Conversation | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -563833943) return null;
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
export function ConversationDefault(params: Partial<ConversationInputParams> = {}): Conversation {
  return Conversation({
    id: 0,
    user: UserDefault(),
    ...params
  });
}
export function ConversationCompare(__a: Conversation, __b: Conversation) {
  return (
    /**
     * compare parameter id
     */
    __a['id'] === __b['id'] &&
    /**
     * compare parameter user
     */
    UserCompare(__a['user'],__b['user'])
  );
}
export interface ConversationsInputParams {
  conversations: ReadonlyArray<Conversation>;
}
export function Conversations(params: ConversationsInputParams): Conversations {
  return {
    _name: 'conversation.index.Conversations',
    conversations: params['conversations']
  };
}
export function encodeConversations(s: ISerializer, value: Conversations) {
  s.writeInt32(-1956221194);
  /**
   * encoding param: conversations
   */
  const __pv0 = value['conversations'];
  const __l0 = __pv0.length;
  s.writeUint32(__l0);
  for(let __i0 = 0; __i0 < __l0; __i0++) {
    const __v__i0 = __pv0[__i0];
    encodeConversation(s,__v__i0);
  }
}
export function decodeConversations(__d: IDeserializer): Conversations | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if(__id !== -1956221194) return null;
  let conversations: Array<Conversation>;
  /**
   * decoding param: conversations
   */
  {
    const iindex0 = __d.readUint32();
    const oindex0 = new Array(iindex0);
    conversations = oindex0;
    for(let index0 = 0; index0 < iindex0; index0++) {
      const __tmp1 = decodeConversation(__d);
      if(__tmp1 === null) return null;
      oindex0[index0] = __tmp1;
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
export function ConversationsDefault(params: Partial<ConversationsInputParams> = {}): Conversations {
  return Conversations({
    conversations: [],
    ...params
  });
}
export function ConversationsCompare(__a: Conversations, __b: Conversations) {
  return (
    /**
     * compare parameter conversations
     */
    __a['conversations'].length === __b['conversations'].length && __a['conversations'].every((__i,index) => (ConversationCompare(__i,__b['conversations'][index])))
  );
}
