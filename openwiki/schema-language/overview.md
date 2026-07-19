---
type: Reference
title: Schema Language Overview
description: The jsbuffer schema language - type definitions, calls, traits, templates, and imports for defining data structures and RPC interfaces
tags: [schema-language, dsl, types, rpc]
resource: /test/schema
---

# Schema Language Overview

The jsbuffer schema language is a **domain-specific language** for defining data structures (types), RPC calls, and traits. It compiles to TypeScript interfaces with encode/decode/compare/default/update/validate functions.

## File Structure

- **Extension**: `.jsbuffer` (convention, not enforced)
- **Encoding**: UTF-8
- **Entry point**: Single main file (passed to CLI), imports resolve relative to it

## Core Concepts

| Concept | Keyword | Purpose |
|---------|---------|---------|
| **Type** | `type` | Data structure definition (like struct/class) |
| **Call** | `call` | RPC endpoint definition (input → output) |
| **Trait** | `trait` | Marker interface for polymorphism |
| **Import** | `import` | Cross-file dependencies |
| **Export** | `export` | Make definitions available to importers |

## Basic Syntax

```jsbuffer
// Import from another schema file
import { User, Post } from "./models";
import "./common";  // Import all exports

// Trait - marker for polymorphism
trait Request {}

// Type - data structure
type User {
  int id;
  string name;
  optional<string> email;      // Nullable
  vector<string> tags;         // Array/list
  set<int> scores;             // Unique collection
  map<string, int> metadata;   // Key-value map
  tuple<int, string, bool> profile;  // Fixed heterogeneous
  bigint<256> largeId;         // Arbitrary precision
}

// Call - RPC definition
export call GetUser : Request => User {
  uint32 userId;
}

// Export makes it available to importers
export type User;
```

## Type System

### Primitive Types

| Primitive | TypeScript | Encoding |
|-----------|------------|----------|
| `int` | `number` | 32-bit signed (int32) |
| `uint32` | `number` | 32-bit unsigned |
| `long` | `number` | 64-bit signed (int64) |
| `ulong` | `number` | 64-bit unsigned |
| `float` | `number` | 32-bit IEEE 754 |
| `double` | `number` | 64-bit IEEE 754 |
| `bool` | `boolean` | Single byte (0/1) |
| `string` | `string` | UTF-8, length-prefixed |
| `bytes` | `Uint8Array` | Length-prefixed binary |
| `null_terminated_string` | `string` | C-style null-terminated |

### Template Types (Generics)

| Template | Syntax | TypeScript | Description |
|----------|--------|------------|-------------|
| `vector<T>` | `vector<string>` | `T[]` | Ordered list, duplicates allowed |
| `set<T>` | `set<int>` | `Set<T>` | Unique elements |
| `map<K,V>` | `map<string, int>` | `Map<K,V>` | Key-value map |
| `optional<T>` | `optional<string>` | `T \| null` | Nullable |
| `tuple<T...>` | `tuple<int, string>` | `[T1, T2, ...]` | Fixed-size heterogeneous |
| `bigint<N>` | `bigint<256>` | `bigint` | Arbitrary precision (N bits) |

### User-Defined Types

Reference other types by name:
```jsbuffer
type Address {
  string street;
  string city;
}

type User {
  int id;
  Address address;        // Nested object
  vector<Address> addresses;  // Array of objects
  map<string, Address> addressBook;  // Map of objects
}
```

## Traits (Polymorphism)

Traits define **marker interfaces** for polymorphic dispatch:

```jsbuffer
trait Request {}

trait Response {}

type GetUserRequest : Request {
  uint32 userId;
}

type GetUserResponse : Response {
  User user;
}

export call GetUser : Request => Response {
  GetUserRequest request;  // Single parameter of trait type
}
```

**Key points**:
- Traits have **no parameters** (empty `{}`)
- Types implement traits via `: Trait1, Trait2`
- Calls use traits for input/output polymorphism
- Generated code includes trait encode/decode functions

## Calls (RPC)

```jsbuffer
// Basic call
call GetUser => User {
  uint32 id;
}

// Call with traits
export call GetUser : Request => Response {
  uint32 id;
}

// Call with multiple parameters
call UpdateUser => User {
  uint32 id;
  string name;
  optional<string> email;
}
```

**Call structure**:
- `call Name : InputTrait => OutputTrait { params }`
- Input/output traits are optional
- Parameters are like type fields
- Exported calls are part of the public API

## Imports

```jsbuffer
// Named imports
import { User, Post } from "./models";

// Namespace import (all exports)
import * as Models from "./models";

// Side-effect import (import all, no namespace)
import "./common";
```

**Resolution**:
- Relative to importing file's directory
- `.jsbuffer` extension optional
- Circular imports detected and rejected

## Exports

```jsbuffer
// Export specific definitions
export type User;
export call GetUser;
export trait Request;

// Or export inline
export type User { int id; string name; }
export call GetUser => User { uint32 id; }
export trait Request {}
```

Only exported definitions are available to importers.

## Complete Example

```jsbuffer
// file: schema/api.jsbuffer

import { User, Post } from "./models";
import "./common";

trait Request {}
trait Response {}

// Polymorphic requests
type GetUsersRequest : Request {
  uint32 offset;
  uint32 limit;
}

type GetUsersResponse : Response {
  vector<User> users;
  uint64 totalCount;
}

// Exported RPC calls
export call GetUsers : Request => Response {
  GetUsersRequest request;
}

export call GetUserById : Request => Response {
  uint32 userId;
}

export call CreateUser : Request => Response {
  User user;
}

// Re-export types
export type User;
export type Post;
```

## Generated TypeScript (Conceptual)

```typescript
// Interfaces
interface User { id: number; name: string; ... }
type Request = { _name: 'schema.Request' };
type Response = { _name: 'schema.Response' };

// Encode/Decode (with CRC32 headers)
function encodeUser(s: ISerializer, value: User) { ... }
function decodeUser(d: IDeserializer): User | null { ... }

// Utilities
function compareUser(a: User, b: User): boolean { ... }
function defaultUser(params?: Partial<UserInputParams>): User { ... }
function updateUser(value: User, changes: Partial<UserInputParams>): User { ... }
function isUser(value: unknown): value is User { ... }
```

## Advanced Features

### BigInt Templates
```jsbuffer
type LargeNumbers {
  bigint<64>   small;   // 64-bit
  bigint<256>  medium;  // 256-bit
  bigint<2048> large;   // 2048-bit (crypto keys)
}
```

### Nested Templates
```jsbuffer
type Complex {
  vector<map<string, vector<int>>> matrix;
  optional<tuple<string, set<long>>> wrapper;
  map<optional<int>, vector<optional<string>>> crazy;
}
```

### Trait Inheritance
```jsbuffer
trait BaseRequest {}
trait AuthenticatedRequest : BaseRequest {}

type LoginRequest : AuthenticatedRequest {
  string username;
  string password;
}
```

## Constraints & Limitations

| Feature | Status |
|---------|--------|
| Recursive types | Not supported (would cause infinite encoding) |
| Union types | Not directly supported (use traits) |
| Custom primitives | No (fixed primitive set) |
| Annotations/attributes | Not in language (use comments) |
| Default values in schema | No (defaults generated as zero values) |
| Field | No (see below) |

### Field Naming
- Fields use the declared name directly
- No automatic camelCase/snake_case conversion
- `--sort-properties` flag sorts fields alphabetically (affects CRC)

## Cross-References

- [Architecture Overview](/openwiki/architecture/overview.md) - How schema flows through pipeline
- [Parser & Tokenizer](/openwiki/architecture/parser.md) - Grammar implementation
- [Code Generator](/openwiki/architecture/code-generator.md) - Code generation details
- [Generated Output](/openwiki/generated-output/overview.md) - What gets produced
- [Test Schema](/test/schema) - Real example with all features
- [CLI Usage](/openwiki/workflows/cli-usage.md) - Compiling schemas