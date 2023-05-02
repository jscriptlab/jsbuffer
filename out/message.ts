import {ISerializer} from "./__types__";
import {IDeserializer} from "./__types__";
import {IRequest} from "./__types__";
export function Message(params: Omit<Message,'_name'>): Message {
  return {
    _name: 'message.Message',
    ...params
  };
}
export function encodeMessage(s: ISerializer, value: Message) {
  s.writeInt32(-1988975903);
  s.writeInt32(value['id']);
}
export function decodeMessage(d: IDeserializer): Message | null {
  const __id = d.readInt32();
  if(__id !== -1988975903) return null;
  let id: number;
  id = d.readInt32();
  return {
    _name: 'message.Message',
    id
  };
}
export interface Message  {
  _name: 'message.Message';
  id: number;
}
export function Messages(params: Omit<Messages,'_name'>): Messages {
  return {
    _name: 'message.Messages',
    ...params
  };
}
export function encodeMessages(s: ISerializer, value: Messages) {
  s.writeInt32(-863342777);
  {
    const ia0 = value['messages'].length;
    s.writeUint32(ia0);
    for(let a0 = 0; a0 < ia0; a0++) {
      const va0 = value['messages'][a0];
      encodeMessage(s,va0);
    }
  }
}
export function decodeMessages(d: IDeserializer): Messages | null {
  const __id = d.readInt32();
  if(__id !== -863342777) return null;
  let messages: Array<Message>;
  {
    const ia0 = d.readUint32();
    messages = new Array(ia0);
    for(let a0 = 0; a0 < ia0; a0++) {
      const tmp = decodeMessage(d);
      if(tmp === null) return null;
      messages[a0] = tmp;
    }
  }
  return {
    _name: 'message.Messages',
    messages
  };
}
export interface Messages  {
  _name: 'message.Messages';
  messages: ReadonlyArray<Message>;
}
export function GetMessages(params: Omit<GetMessages,'_name'>): GetMessages {
  return {
    _name: 'message.GetMessages',
    ...params
  };
}
export function encodeGetMessages(s: ISerializer, value: GetMessages) {
  s.writeInt32(-1766600538);
  s.writeInt32(value['offset']);
  s.writeInt32(value['limit']);
}
export function decodeGetMessages(d: IDeserializer): GetMessages | null {
  const __id = d.readInt32();
  if(__id !== -1766600538) return null;
  let offset: number;
  let limit: number;
  offset = d.readInt32();
  limit = d.readInt32();
  return {
    _name: 'message.GetMessages',
    offset,
    limit
  };
}
export interface GetMessages extends IRequest<Messages> {
  _name: 'message.GetMessages';
  offset: number;
  limit: number;
}
