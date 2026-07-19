---
type: Reference
title: Generated Output Overview
description: What jsbuffer generates - TypeScript interfaces, encode/decode functions, CRC32 wire format, and runtime codec integration
tags: [generated-output, typescript, codec, encoding, decoding]
resource: /out
---

# Generated Output Overview

jsbuffer generates TypeScript code that provides **type-safe serialization/deserialization** with CRC32-verified wire format compatibility.

## Output Structure

```
<outDir>/
├── tsconfig.json              # If not --no-ts-config
├── <schema-file>.ts           # Main generated file
├── <imported-file>.ts         # One per imported schema file
└── metadata.json              # If --from-metadata mode
```

Each generated `.ts` file contains:
1. **Imports** - `@jsbuffer/codec`, `textstreamjs`, local files
2. **TypeScript interfaces** - One per `type` definition
3. **Type aliases** - For `trait` definitions (with `_name` discriminant)
4. **Functions** - encode, decode, compare, default, update, validate

## Type Definitions → TypeScript Interfaces

### Schema
```jsbuffer
type User {
  int id;
  string name;
  optional<string> email;
  vector<string> tags;
  map<string, int> scores;
}
```

### Generated
```typescript
interface User {
  _name: 'schema.User';           // Unique name property
  id: number;                     // int → number
  name: string;                   // string → string
  email: string | null;           // optional<string> → T | null
  tags: string[];                 // vector<string> → T[]
  scores: Map<string, number>;    // map<K,V> → Map<K,V>
}
```

### Type Mapping Table

| Schema Type | TypeScript Type | Notes |
|-------------|-----------------|-------|
| `int` | `number` | 32-bit signed |
| `uint32` | `number` | 32-bit unsigned |
| `long` | `number` | 64-bit (JS number, may lose precision) |
| `ulong` | `number` | 64-bit unsigned |
| `float` | `number` | IEEE 754 float32 |
| `double` | `number` | IEEE 754 float64 |
| `bool` | `boolean` | |
| `string` | `string` | UTF-8 |
| `bytes` | `Uint8Array` | Binary data |
| `null_terminated_string` | `string` | C-style strings |
| `optional<T>` | `T \| null` | Nullable |
| `vector<T>` | `T[]` | Array |
| `set<T>` | `Set<T>` | Unique values |
| `map<K,V>` | `Map<K,V>` | Key-value |
| `tuple<T...>` | `[T1, T2, ...]` | Fixed-length tuple |
| `bigint<N>` | `JSBI` | Arbitrary precision (uses `jsbi`) |

## Generated Functions Per Definition

### For `type User { ... }`:

| Function | Signature | Purpose |
|----------|-----------|---------|
| `encodeUser` | `(s: ISerializer, value: User) => void` | Write to serializer with CRC header |
| `decodeUser` | `(d: IDeserializer) => User \| null` | Read from deserializer, validate CRC |
| `compareUser` | `(a: User, b: User) => boolean` | Deep equality |
| `defaultUser` | `(params?: Partial<UserInputParams>) => User` | Create with defaults |
| `updateUser` | `(value: User, changes: Partial<UserInputParams>) => User` | Immutable update |
| `isUser` | `(value: unknown) => value is User` | Type guard |

### Input Params Interface

For complex types, an input params interface is generated:

```typescript
interface UserInputParams {
  id: number;
  name: string;
  email?: string | null;      // optional
  tags?: string[];            // vector
  scores?: Map<string, number>; // map
}
```

Used by `defaultUser` and `updateUser` for partial specification.

## CRC32 Wire Format

Every encoded message begins with a **CRC32 hash** of the canonical schema definition:

```
┌─────────────────────────────────────────────────────────────┐
│  Encoded Message                                            │
├──────────────┬──────────────────────────────────────────────┤
│  4 bytes     │  Payload                                     │
│  (CRC32)     │  (field data)                                │
└──────────────┴──────────────────────────────────────────────┘
```

### CRC Calculation
Canonical string includes:
- Type name
- All parameter names and types (sorted if `--sort-properties`)
- Trait implementations
- Recursive parameter definitions

### Decode Validation
```typescript
export function decodeUser(__d: IDeserializer): User | null {
  const __id = __d.readInt32();           // Read CRC
  if (__id !== -399411702) return null;   // Validate CRC
  // ... decode fields
}
```

**Mismatched CRC → returns `null`** (not an exception). Caller must check.

## Trait Definitions → Type Aliases

### Schema
```jsbuffer
trait Request {}
type GetUser : Request {
  uint32 userId;
}
```

### Generated
```typescript
// Trait = type alias with discriminant
type Request = { _name: 'schema.Request' };

// Implementing type includes trait discriminant
interface GetUser {
  _name: 'schema.GetUser';
  userId: number;
}

// Trait encode/decode for polymorphism
export function encodeRequestTrait(s: ISerializer, value: Request): void;
export function decodeRequestTrait(d: IDeserializer): Request | null;
```

## Call Definitions

### Schema
```jsbuffer
export call GetUser : Request => User {
  uint32 userId;
}
```

### Generated
```typescript
// Input params
interface GetUserInputParams {
  userId: number;
}

// Encode call input (with trait dispatch)
export function encodeGetUser(s: ISerializer, value: GetUserInputParams): void;

// Decode call input
export function decodeGetUser(d: IDeserializer): GetUserInputParams | null;

// Output is/Output encode/decode for call return type
export function encodeUser(s: ISerializer, value: User): void;
export function decodeUser(d: IDeserializer): User | null;
```

## Default Values

| Schema Type | Default Value |
|-------------|---------------|
| `int`, `uint32`, `long`, `ulong` | `0` |
| `float`, `double` | `0` |
| `bool` | `false` |
| `string` | `''` |
| `bytes` | `new Uint8Array(0)` |
| `optional<T>` | `null` |
| `vector<T>` | `[]` |
| `set<T>` | `new Set()` |
| `map<K,V>` | `new Map()` |
| `tuple<...>` | `[default1, default2, ...]` |
| `bigint<N>` | `JSBI.BigInt(0)` |

## Update Function (Immutable Updates)

```typescript
// Schema: type User { int id; string name; optional<string> email; }

const user = defaultUser({ id: 1, name: 'Alice' });
// { _name: 'schema.User', id: 1, name: 'Alice', email: null }

const updated = updateUser(user, { name: 'Bob' });
// { _name: 'schema.User', id: 1, name: 'Bob', email: null }
// Original `user` unchanged
```

**Structural sharing**: Unchanged nested objects/arrays are reused by reference.

## Validation / Type Guards

```typescript
function process(value: unknown) {
  if (isUser(value)) {
    // TypeScript knows `value` is User here
    console.log(value.name);
  }
}
```

## Runtime Integration (@jsbuffer/codec)

Generated code uses interfaces from `@jsbuffer/codec`:

```typescript
import { Serializer, Deserializer, Codec, ISerializer, IDeserializer } from '@jsbuffer/codec';

// Serialize
const serializer = new Serializer({ textEncoder: new TextEncoder() });
encodeUser(serializer, user);
const bytes = serializer.view();  // Uint8Array

// Deserialize
const deserializer = new Deserializer({ 
  textDecoder: new TextDecoder(), 
  buffer: bytes 
});
const decoded = decodeUser(deserializer);

// Or use Codec (combined)
const codec = new Codec({ textEncoder: new TextEncoder(), textDecoder: new TextDecoder() });
const bytes = codec.encode(encodeUser, user);
const decoded = codec.decode(decodeUser, bytes);
```

## Sort Properties Flag Impact

```bash
# With --sort-properties
npx jsbuffer schema/main -o out --sort-properties
```

- Properties sorted alphabetically in generated interfaces
- **CRC changes** - must match on both encode/decode sides
- All parties must use same flag setting

## Generated tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./out",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["*.ts"]
}
```

Modified by `--extends` (adds `extends` field) and `--no-ts-config` (skips generation).

## Cross-References

- [Codec Integration](/openwiki/generated-output/codec-integration.md) - Runtime usage details
- [Schema Language](/openwiki/schema-language/overview.md) - Input types reference
- [Architecture: Code Generator](/openwiki/architecture/code-generator.md) - Generation internals
- [CLI Options](/openwiki/architecture/cli.md) - Output configuration
- [Test Output](/out) - Actual generated examples