import { ISerializer } from './__types__';
import { IDeserializer } from './__types__';
import { IRequest } from './__types__';
export const MessageMetadata = {
  name: 'Message',
  id: -1731107621,
  kind: 'type',
  params: [
    {
      name: 'id',
      type: {
        type: 'generic',
        value: 'int',
      },
    },
  ],
};
export interface MessageInputParams {
  id: number;
}
export function Message(params: MessageInputParams): Message {
  return {
    _name: 'message.Message',
    id: params['id'],
  };
}
export function encodeMessage(__s: ISerializer, value: Message) {
  __s.writeInt32(-1731107621);
  /**
   * encoding param: id
   */
  const __pv0 = value['id'];
  __s.writeInt32(__pv0);
}
export function decodeMessage(__d: IDeserializer): Message | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -1731107621) return null;
  let id: number;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  return {
    _name: 'message.Message',
    id,
  };
}
export interface Message {
  _name: 'message.Message';
  id: number;
}
export function defaultMessage(
  params: Partial<MessageInputParams> = {}
): Message {
  return Message({
    id: 0,
    ...params,
  });
}
export function compareMessage(__a: Message, __b: Message): boolean {
  return (
    /**
     * compare parameter id
     */
    __a['id'] === __b['id']
  );
}
export function updateMessage(
  value: Message,
  changes: Partial<MessageInputParams>
) {
  if (typeof changes['id'] !== 'undefined') {
    if (!(changes['id'] === value['id'])) {
      value = Message({
        ...value,
        id: changes['id'],
      });
    }
  }
  return value;
}
export const MessagesMetadata = {
  name: 'Messages',
  id: 1419827675,
  kind: 'type',
  params: [
    {
      name: 'messages',
      type: {
        type: 'template',
        name: 'vector',
        value: {
          id: -1731107621,
          type: 'internalType',
          kind: 'type',
          name: 'Message',
        },
      },
    },
  ],
};
export interface MessagesInputParams {
  messages: ReadonlyArray<Readonly<Message>>;
}
export function Messages(params: MessagesInputParams): Messages {
  return {
    _name: 'message.Messages',
    messages: params['messages'],
  };
}
export function encodeMessages(__s: ISerializer, value: Messages) {
  __s.writeInt32(1419827675);
  /**
   * encoding param: messages
   */
  const __pv0 = value['messages'];
  const __l1 = __pv0.length;
  __s.writeUint32(__l1);
  for (let __i1 = 0; __i1 < __l1; __i1++) {
    const __v__i1 = __pv0[__i1];
    encodeMessage(__s, __v__i1);
  }
}
export function decodeMessages(__d: IDeserializer): Messages | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 1419827675) return null;
  let messages: Array<Message>;
  /**
   * decoding param: messages
   */
  const __l1 = __d.readUint32();
  const __o1 = new Array<Message>(__l1);
  messages = __o1;
  for (let __i1 = 0; __i1 < __l1; __i1++) {
    const __tmp2 = decodeMessage(__d);
    if (__tmp2 === null) return null;
    __o1[__i1] = __tmp2;
  }
  return {
    _name: 'message.Messages',
    messages,
  };
}
export interface Messages {
  _name: 'message.Messages';
  messages: ReadonlyArray<Readonly<Message>>;
}
export function defaultMessages(
  params: Partial<MessagesInputParams> = {}
): Messages {
  return Messages({
    messages: [],
    ...params,
  });
}
export function compareMessages(__a: Messages, __b: Messages): boolean {
  return (
    /**
     * compare parameter messages
     */
    __a['messages'].length === __b['messages'].length &&
    __a['messages'].every((__i, index) =>
      compareMessage(__i, __b['messages'][index])
    )
  );
}
export function updateMessages(
  value: Messages,
  changes: Partial<MessagesInputParams>
) {
  if (typeof changes['messages'] !== 'undefined') {
    if (
      !(
        changes['messages'].length === value['messages'].length &&
        changes['messages'].every((__i, index) =>
          compareMessage(__i, value['messages'][index])
        )
      )
    ) {
      value = Messages({
        ...value,
        messages: changes['messages'],
      });
    }
  }
  return value;
}
export const GetMessagesMetadata = {
  name: 'GetMessages',
  id: 1394938243,
  kind: 'call',
  params: [
    {
      name: 'offset',
      type: {
        type: 'generic',
        value: 'int',
      },
    },
    {
      name: 'limit',
      type: {
        type: 'generic',
        value: 'int',
      },
    },
  ],
};
export interface GetMessagesInputParams {
  offset: number;
  limit: number;
}
export function GetMessages(params: GetMessagesInputParams): GetMessages {
  return {
    _name: 'message.GetMessages',
    offset: params['offset'],
    limit: params['limit'],
  };
}
export function encodeGetMessages(__s: ISerializer, value: GetMessages) {
  __s.writeInt32(1394938243);
  /**
   * encoding param: offset
   */
  const __pv0 = value['offset'];
  __s.writeInt32(__pv0);
  /**
   * encoding param: limit
   */
  const __pv1 = value['limit'];
  __s.writeInt32(__pv1);
}
export function decodeGetMessages(__d: IDeserializer): GetMessages | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 1394938243) return null;
  let offset: number;
  let limit: number;
  /**
   * decoding param: offset
   */
  offset = __d.readInt32();
  /**
   * decoding param: limit
   */
  limit = __d.readInt32();
  return {
    _name: 'message.GetMessages',
    offset,
    limit,
  };
}
export interface GetMessages extends IRequest<Readonly<Messages>> {
  _name: 'message.GetMessages';
  offset: number;
  limit: number;
}
export function defaultGetMessages(
  params: Partial<GetMessagesInputParams> = {}
): GetMessages {
  return GetMessages({
    offset: 0,
    limit: 0,
    ...params,
  });
}
export function compareGetMessages(
  __a: GetMessages,
  __b: GetMessages
): boolean {
  return (
    /**
     * compare parameter offset
     */
    __a['offset'] === __b['offset'] &&
    /**
     * compare parameter limit
     */
    __a['limit'] === __b['limit']
  );
}
export function updateGetMessages(
  value: GetMessages,
  changes: Partial<GetMessagesInputParams>
) {
  if (typeof changes['offset'] !== 'undefined') {
    if (!(changes['offset'] === value['offset'])) {
      value = GetMessages({
        ...value,
        offset: changes['offset'],
      });
    }
  }
  if (typeof changes['limit'] !== 'undefined') {
    if (!(changes['limit'] === value['limit'])) {
      value = GetMessages({
        ...value,
        limit: changes['limit'],
      });
    }
  }
  return value;
}
