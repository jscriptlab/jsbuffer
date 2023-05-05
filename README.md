# jsbuffer

## Description

jsbuffer is the implementation of a type language. We offer tools for you to:

### Automatically generated interfaces

So this:

```
type user {
  int id;
  string name;
}
```

Generate a TypeScript interface:

```ts
interface user {
  id: number;
  name: string;
}
```

### Codec functions

This:

```
type user {
  int id;
  string name;
}
```

Generate an _encode_ function:

```ts
export function encodeUser(s: ISerializer, value: user) {
  s.writeInt32(-399411702);
  /**
   * encoding param: id
   */
  const __pv0 = value['id'];
  s.writeInt32(__pv0);
  /**
   * encoding param: name
   */
  const __pv1 = value['name'];
  s.writeString(__pv1);
}
```

And a _decode_ function:

```ts
export function decodeUser(__d: IDeserializer): user | null {
  const __id = __d.readInt32();
  /**
   * decode header
   */
  if (__id !== -399411702) return null;
  let id: number;
  let name: string;
  /**
   * decoding param: id
   */
  id = __d.readInt32();
  /**
   * decoding param: name
   */
  name = __d.readString();
  return {
    _name: 'schema.user',
    id,
    name,
  };
}
```

### Default functions

Functions that are supposed to initialize these interfaces with default data in it:

This:

```
type user {
  int id;
  string name;
}
```

Generate this function:

```ts
export function userDefault(params: Partial<userInputParams> = {}): user {
  return user({
    id: 0,
    name: '',
    ...params,
  });
}
```

### Deep comparison functions

This:

```
type user {
  int id;
  string name;
}
```

Generate a _comparison_ function:

```ts
export function userCompare(__a: user, __b: user) {
  /**
   * compare parameter firstName
   */
  if (!(__a['firstName'] === __b['firstName'])) return false;
  /**
   * compare parameter aliases
   */
  if (
    !(
      __a['aliases'].length === __b['aliases'].length &&
      __a['aliases'].every((__i, index) => __i === __b['aliases'][index])
    )
  )
    return false;
  return true;
}
```

### More

To me, the most cool part of jsbuffer, is that you can create all sort of complex type structures and we will resolve and generate the code and files accordingly:

```
import {refUser} from "./Ref";
type comment {
  int id;
  refUser author;
  string comment;
}
type post {
  int id;
  refUser author;
  string title;
  string contents;
  vector<comment> comments;
}
type user {
  int id;
  string firstName;
  vector<post> posts;
}
```

## Installation

```
yarn add jsbuffer
npm i jsbuffer
```

## Usage

```
npm install -g jsbuffer
jsbuffer schema/src -o schema
jsbuffer schema/src -o schema --extends tsconfig.base.json
```
