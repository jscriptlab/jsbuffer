# jsbuffer

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

## Description

jsbuffer is the implementation of a type language. We offer tools for you to generate TypeScript interfaces and functions to encode and decode your data, and more.

## Demo

You can try jsbuffer online in the [online playground](https://jsbufferviewerdemo-app.onrender.com/), still in very early progress, but it works.

## jsb: Support for other languages

The new `jsb` command-line tool supports generating code for additional languages, currently, the CLI offer experimental support for the following languages:

- C99
- C++17

### Usage

```bash
npm i -g jsbuffer@^2
jsb -h
```

## Examples

### Example with command-line tool

Create a `schema/main` file:

```
type User {
  int id;
  string name;
}
```

Run your terminal:

```bash
npx jsbuffer schema/main -o src/schema
```

### Help

```bash
npx jsbuffer -h
```

Or

```bash
npx jsbuffer --help
```

### TypeScript interfaces

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
    name
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
export function defaultUser(params: Partial<userInputParams> = {}): user {
  return user({
    id: 0,
    name: '',
    ...params
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
export function compareUser(__a: user, __b: user) {
  return (
    /**
     * compare parameter id
     */
    __a['id'] === __b['id'] &&
    /**
     * compare parameter name
     */
    __a['name'] === __b['name']
  );
}
```

### Update functions

Generated update functions uses the deep comparison expressions to make sure the reference of the input object is never changed, if there is no change in the `changes` argument even if you're using complex objects. To give you an example, let's say you have the following type definition:

```
type testMap2 {
  map<optional<string>,string> a;
  map<optional<string>,tuple<string,map<int,int>>> b;
}
```

The code generator will create an update function with the following signature:

```ts
function updateTestMap2(
  value: testMap2,
  changes: Partial<testMap2InputParams>
): testMap2;
```

<!--
The code generator will create an update function like the following:

```ts
export function updateTestMap2(
  value: testMap2,
  changes: Partial<testMap2InputParams>
) {
  if (typeof changes['a'] !== 'undefined') {
    if (
      !((l1, l2) =>
        l1.every(
          ([k1, v1], i) =>
            ((__dp11, __dp12) =>
              __dp11 !== null && __dp12 !== null
                ? __dp11 === __dp12
                : __dp11 === __dp12)(k1, l2[i][0]) && v1 === l2[i][1]
        ))(Array.from(changes['a']), Array.from(value['a']))
    ) {
      value = testMap2({
        ...value,
        a: changes['a'],
      });
    }
  }
  if (typeof changes['b'] !== 'undefined') {
    if (
      !((l1, l2) =>
        l1.every(
          ([k1, v1], i) =>
            ((__dp21, __dp22) =>
              __dp21 !== null && __dp22 !== null
                ? __dp21 === __dp22
                : __dp21 === __dp22)(k1, l2[i][0]) &&
            /* compare tuple item 0 of type string */ ((__a40, __b40) =>
              __a40 === __b40)(v1[0], l2[i][1][0]) &&
            /* compare tuple item 1 of type ReadonlyMap<number, number> */ ((
              __a41,
              __b41
            ) =>
              ((l1, l2) =>
                l1.every(([k1, v1], i) => k1 === l2[i][0] && v1 === l2[i][1]))(
                Array.from(__a41),
                Array.from(__b41)
              ))(v1[1], l2[i][1][1])
        ))(Array.from(changes['b']), Array.from(value['b']))
    ) {
      value = testMap2({
        ...value,
        b: changes['b'],
      });
    }
  }
  return value;
}
``` -->

So the following test case would pass without errors:

```ts
import assert from 'assert';
import { testMap2, updateTestMap2 } from '../out/schema';

const a1 = testMap2({
  a: new Map([
    ['a', '1'],
    ['b', '2'],
    ['c', '3']
  ]),
  b: new Map([['a', ['', new Map([[1, 2]])]]])
});

assert.strict.equal(updateTestMap2(a1, {}), a1);
assert.strict.equal(
  updateTestMap2(a1, {
    b: new Map([['a', ['', new Map([[1, 2]])]]])
  }),
  a1
);
assert.strict.notEqual(
  updateTestMap2(a1, {
    b: new Map([['a', ['', new Map([[1, 3]])]]])
  }),
  a1
);
assert.strict.deepEqual(
  updateTestMap2(a1, {
    b: new Map([['a', ['', new Map([[1, 3]])]]])
  }),
  testMap2({
    a: new Map([
      ['a', '1'],
      ['b', '2'],
      ['c', '3']
    ]),
    b: new Map([['a', ['', new Map([[1, 3]])]]])
  })
);
```

### Traits

```
trait User {}
type user : User {
  ulong id;
}
type userDeleted : User {
  ulong deletedAt;
}
```

Becomes this:

```ts
export type User = userDeleted | user;
```

### Complex type structures

To me, the most cool part of jsbuffer, is that you can create all sort of complex type structures that involve many parts and we will resolve and generate the code and files accordingly:

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

## Data types

- `set<t>`
- `map<k,v>`
- `vector<t>`
- `tuple<a,b,c,d,e,f,...>`
- `null_terminated_string`
- `string`
- `int`
- `int32`
- `uint32`
- `ulong`
- `long`
- `int16`
- `uint16`
- `int8`
- `uint8`
