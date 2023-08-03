import { User } from './SecondUser';
import JSBI from 'jsbi';
import { isUser } from './SecondUser';
import { ISerializer } from '../__types__';
import { encodeUser } from './SecondUser';
import { IDeserializer } from '../__types__';
import { decodeUser } from './SecondUser';
import { defaultUser } from './SecondUser';
import { compareUser } from './SecondUser';
export interface Conversation {
  _name: 'conversation.index.Conversation';
  id: number;
  user: Readonly<User>;
}
export function isConversation(value: unknown): value is Conversation {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'conversation.index.Conversation'
    )
  )
    return false;
  if (
    !(
      'id' in value &&
      ((__v0) =>
        typeof __v0 === 'number' &&
        JSBI.equal(JSBI.BigInt(__v0), JSBI.BigInt(__v0)) &&
        JSBI.greaterThanOrEqual(
          JSBI.BigInt(__v0),
          JSBI.BigInt('-2147483648')
        ) &&
        JSBI.lessThanOrEqual(JSBI.BigInt(__v0), JSBI.BigInt('2147483647')))(
        value['id']
      )
    )
  )
    return false;
  if (!('user' in value && ((__v1) => isUser(__v1))(value['user'])))
    return false;
  return true;
}
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
export interface Conversations {
  _name: 'conversation.index.Conversations';
  conversations: ReadonlyArray<Readonly<Conversation>>;
}
export function isConversations(value: unknown): value is Conversations {
  if (
    !(
      typeof value === 'object' &&
      value !== null &&
      '_name' in value &&
      typeof value['_name'] === 'string' &&
      value['_name'] === 'conversation.index.Conversations'
    )
  )
    return false;
  if (
    !(
      'conversations' in value &&
      ((__v0) =>
        (Array.isArray(__v0) || __v0 instanceof Set) &&
        Array.from(__v0).every((p) => isConversation(p)))(
        value['conversations']
      )
    )
  )
    return false;
  return true;
}
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
  for (const __item1 of __pv0) {
    encodeConversation(__s, __item1);
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
    Array.from(__a['conversations']).every((__originalItem0, __index0) =>
      typeof __originalItem0 === 'undefined'
        ? false
        : ((__item0) =>
            typeof __item0 === 'undefined'
              ? false
              : compareConversation(__originalItem0, __item0))(
            Array.from(__b['conversations'])[__index0]
          )
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
        Array.from(changes['conversations']).every(
          (__originalItem1, __index1) =>
            typeof __originalItem1 === 'undefined'
              ? false
              : ((__item1) =>
                  typeof __item1 === 'undefined'
                    ? false
                    : compareConversation(__originalItem1, __item1))(
                  Array.from(value['conversations'])[__index1]
                )
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
