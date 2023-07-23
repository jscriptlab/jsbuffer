import { User } from './SecondUser';
import { ISerializer } from '../__types__';
import { encodeUser } from './SecondUser';
import { IDeserializer } from '../__types__';
import { decodeUser } from './SecondUser';
import { defaultUser } from './SecondUser';
import { compareUser } from './SecondUser';
export const ConversationMetadata = {
  name: 'Conversation',
  id: 1288012364,
  kind: 'type',
  params: [
    {
      name: 'id',
      type: {
        type: 'generic',
        value: 'int',
      },
    },
    {
      name: 'user',
      type: {
        name: 'User',
        id: '1249778753',
        type: 'externalType',
        externalModule: false,
        relativePath: './SecondUser',
      },
    },
  ],
};
export interface ConversationInputParams {
  id: number;
  user: Readonly<User>;
}
export function Conversation(params: ConversationInputParams): Conversation {
  return {
    _name: 'conversation.index.Conversation',
    id: params['id'],
    user: params['user'],
  };
}
export function encodeConversation(__s: ISerializer, value: Conversation) {
  __s.writeInt32(1288012364);
  /**
   * encoding param: id
   */
  const __pv0 = value['id'];
  __s.writeInt32(__pv0);
  /**
   * encoding param: user
   */
  const __pv1 = value['user'];
  encodeUser(__s, __pv1);
}
export function decodeConversation(__d: IDeserializer): Conversation | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== 1288012364) return null;
  let id: number;
  let user: User;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  /**
   * decoding param: user
   */
  const tmp3 = decodeUser(__d);
  if (tmp3 === null) return null;
  user = tmp3;
  return {
    _name: 'conversation.index.Conversation',
    id,
    user,
  };
}
export interface Conversation {
  _name: 'conversation.index.Conversation';
  id: number;
  user: Readonly<User>;
}
export function defaultConversation(
  params: Partial<ConversationInputParams> = {}
): Conversation {
  return Conversation({
    id: 0,
    user: defaultUser(),
    ...params,
  });
}
export function compareConversation(
  __a: Conversation,
  __b: Conversation
): boolean {
  return (
    /**
     * compare parameter id
     */
    __a['id'] === __b['id'] &&
    /**
     * compare parameter user
     */
    compareUser(__a['user'], __b['user'])
  );
}
export function updateConversation(
  value: Conversation,
  changes: Partial<ConversationInputParams>
) {
  if (typeof changes['id'] !== 'undefined') {
    if (!(changes['id'] === value['id'])) {
      value = Conversation({
        ...value,
        id: changes['id'],
      });
    }
  }
  if (typeof changes['user'] !== 'undefined') {
    if (!compareUser(changes['user'], value['user'])) {
      value = Conversation({
        ...value,
        user: changes['user'],
      });
    }
  }
  return value;
}
export const ConversationsMetadata = {
  name: 'Conversations',
  id: -1572302470,
  kind: 'type',
  params: [
    {
      name: 'conversations',
      type: {
        type: 'template',
        name: 'vector',
        value: {
          id: 1288012364,
          type: 'internalType',
          kind: 'type',
          name: 'Conversation',
        },
      },
    },
  ],
};
export interface ConversationsInputParams {
  conversations: ReadonlyArray<Readonly<Conversation>>;
}
export function Conversations(params: ConversationsInputParams): Conversations {
  return {
    _name: 'conversation.index.Conversations',
    conversations: params['conversations'],
  };
}
export function encodeConversations(__s: ISerializer, value: Conversations) {
  __s.writeInt32(-1572302470);
  /**
   * encoding param: conversations
   */
  const __pv0 = value['conversations'];
  const __l1 = __pv0.length;
  __s.writeUint32(__l1);
  for (let __i1 = 0; __i1 < __l1; __i1++) {
    const __v__i1 = __pv0[__i1];
    encodeConversation(__s, __v__i1);
  }
}
export function decodeConversations(__d: IDeserializer): Conversations | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -1572302470) return null;
  let conversations: Array<Conversation>;
  /**
   * decoding param: conversations
   */
  const __l1 = __d.readUint32();
  const __o1 = new Array<Conversation>(__l1);
  conversations = __o1;
  for (let __i1 = 0; __i1 < __l1; __i1++) {
    const __tmp2 = decodeConversation(__d);
    if (__tmp2 === null) return null;
    __o1[__i1] = __tmp2;
  }
  return {
    _name: 'conversation.index.Conversations',
    conversations,
  };
}
export interface Conversations {
  _name: 'conversation.index.Conversations';
  conversations: ReadonlyArray<Readonly<Conversation>>;
}
export function defaultConversations(
  params: Partial<ConversationsInputParams> = {}
): Conversations {
  return Conversations({
    conversations: [],
    ...params,
  });
}
export function compareConversations(
  __a: Conversations,
  __b: Conversations
): boolean {
  return (
    /**
     * compare parameter conversations
     */
    __a['conversations'].length === __b['conversations'].length &&
    __a['conversations'].every((__i, index) =>
      compareConversation(__i, __b['conversations'][index])
    )
  );
}
export function updateConversations(
  value: Conversations,
  changes: Partial<ConversationsInputParams>
) {
  if (typeof changes['conversations'] !== 'undefined') {
    if (
      !(
        changes['conversations'].length === value['conversations'].length &&
        changes['conversations'].every((__i, index) =>
          compareConversation(__i, value['conversations'][index])
        )
      )
    ) {
      value = Conversations({
        ...value,
        conversations: changes['conversations'],
      });
    }
  }
  return value;
}
