import {User} from "./SecondUser";
import {ISerializer} from "./../__types__";
import {encodeUser} from "./SecondUser";
import {IDeserializer} from "./../__types__";
import {decodeUser} from "./SecondUser";
export function Conversation(params: Omit<Conversation,'_name'>): Conversation {
  return {
    _name: 'conversation.index.Conversation',
    ...params
  };
}
export function encodeConversation(s: ISerializer, value: Conversation) {
  s.writeInt32(1477771794);
  s.writeInt32(value['id']);
  encodeUser(s,value['user']);
}
export function decodeConversation(d: IDeserializer): Conversation | null {
  const __id = d.readInt32();
  if(__id !== 1477771794) return null;
  let id: number;
  let user: User;
  id = d.readInt32();
  const tmp1 = decodeUser(d);
  if(tmp1 === null) return null;
  user = tmp1;
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
export function Conversations(params: Omit<Conversations,'_name'>): Conversations {
  return {
    _name: 'conversation.index.Conversations',
    ...params
  };
}
export function encodeConversations(s: ISerializer, value: Conversations) {
  s.writeInt32(-386946239);
  {
    const ia0 = value['conversations'].length;
    s.writeUint32(ia0);
    for(let a0 = 0; a0 < ia0; a0++) {
      const va0 = value['conversations'][a0];
      encodeConversation(s,va0);
    }
  }
}
export function decodeConversations(d: IDeserializer): Conversations | null {
  const __id = d.readInt32();
  if(__id !== -386946239) return null;
  let conversations: Array<Conversation>;
  {
    const ia0 = d.readUint32();
    conversations = new Array(ia0);
    for(let a0 = 0; a0 < ia0; a0++) {
      const tmp = decodeConversation(d);
      if(tmp === null) return null;
      conversations[a0] = tmp;
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
