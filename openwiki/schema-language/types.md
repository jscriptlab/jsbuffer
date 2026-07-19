---
type: Reference
title: Types & Templates
description: Detailed reference for jsbuffer primitive types, template types (vector, set, map, optional, tuple, bigint), and type expressions
tags: [schema-language, types, templates, primitives]
resource: /test/schema
---

# Types & Templates

Complete reference for the jsbuffer type system.

## Primitive Types

| Schema Type | TypeScript | Description | Encoding |
|-------------|------------|-------------|----------|
| `int` | `number` | 32-bit signed integer | `writeInt32`/`readInt32` |
| `int8` | `number` | 8-bit signed integer | `writeInt8`/`readInt8` |
| `int16` | `number` | 16-bit signed integer | `writeInt16`/`readInt16` |
| `int32` | `number` | 32-bit signed integer | `writeInt32`/`readInt32` |
| `int64` | `number` | 64-bit signed integer | `writeInt64`/`readInt64` |
| `uint` | `number` | 32-bit unsigned integer | `writeUInt32`/`readUInt32` |
| `uint8` | `number` | 8-bit unsigned integer | `writeUInt8`/`readUInt8` |
| `uint16` | `number` | 16-bit unsigned integer | `writeUInt16`/`readUInt16` |
| `uint32` | `number` | 32-bit unsigned integer | `writeUInt32`/`readUInt32` |
| `uint64` | `number` | 64-bit unsigned integer | `writeUInt64`/`readUInt64` |
| `float` | `number` | 32-bit IEEE 754 | `writeFloat`/`readFloat` |
| `double` | `number` | 64-bit IEEE 754 | `writeDouble`/`readDouble` |
| `bool` | `boolean` | Boolean | `writeBool`/`readBool` (1 byte) |
| `string` | `string` | UTF-8 string | `writeString`/`readString` (len + bytes) |
| `bytes` | `Uint8Array` | Binary data | `writeBytes`/`readBytes` (len + bytes) |
| `null_terminated_string` | `string` | C-style string | `writeNullTerminatedString`/`readNullTerminatedString` |

## Template Types

Templates are **generic type constructors** written as `TemplateName<TypeArgs>`.

### `vector<T>` - Ordered List
```jsbuffer
vector<string> tags;           // string[]
vector<User> users;            // User[]
vector<vector<int>> matrix;    // int[][]
```
- **TypeScript**: `T[]`
- **Encoding**: Length (uint32) + each element
- **Duplicates**: Allowed
- **Order**: Preserved

### `set<T>` - Unique Collection
```jsbuffer
set<int> scores;               // Set<number>
set<string> tags;              // Set<string>
```
- **TypeScript**: `Set<T>`
- **Encoding**: Length (uint32) + each element
- **Duplicates**: Removed (set semantics)
- **Order**: Not guaranteed

### `map<K, V>` - Key-Value Map
```jsbuffer
map<string, int> counts;       // Map<string, number>
map<int, User> userById;       // Map<number, User>
map<optional<string>, vector<int>> complex;  // Complex keys/values
```
- **TypeScript**: `Map<K, V>`
- **Encoding**: Length (uint32) + each key-value pair
- **Key types**: Any encodable type (including optional, templates)
- **Value types**: Any encodable type

### `optional<T>` - Nullable
```jsbuffer
optional<string> email;        // string | null
optional<User> profile;        // User | null
optional<vector<int>> data;    // number[] | null
```
- **TypeScript**: `T | null`
- **Encoding**: Presence byte (0=null, 1=present) + element if present
- **Use case**: Optional fields, nullable references

### `tuple<T...>` - Fixed Heterogeneous Sequence
```jsbuffer
tuple<int, string> pair;              // [number, string]
tuple<string, int, bool> triple;      // [string, number, boolean]
tuple<vector<int>, map<string, User>> complex;  // Nested
```
- **TypeScript**: Tuple type `[T1, T2, ...]`
- **Encoding**: Concatenated elements in order
- **Length**: Fixed at compile time
- **Elements**: Can be different types

### `bigint<N>` - Arbitrary Precision Integer
```jsbuffer
bigint<64>   small;    // 64-bit
bigint<256>  medium;   // 256-bit (crypto)
bigint<2048> large;    // 2048-bit (RSA keys)
```
- **TypeScript**: `bigint` (ES2020+)
- **Parameter N**: Bit width (must be multiple of 8? Check implementation)
- **Encoding**: Variable-length (LEB128-like or custom)
- **Use case**: Cryptographic values, large IDs, precise decimals

## Type Expressions

A **type expression** appears in:
- Field declarations: `TypeExpression fieldName;`
- Template arguments: `vector<TypeExpression>`
- Import references: `import { TypeExpression } from "..."`

### Grammar
```
TypeExpression :=
  | Identifier                    // User-defined type
  | Identifier '<' TypeExpression (',' TypeExpression)* '>'  // Template
  | LiteralString                 // External type reference
  | LiteralNumber                 // For bigint<N>
```

### Examples
```jsbuffer
// Simple reference
User

// Template with simple arg
vector<User>

// Template with complex arg
map<string, vector<optional<User>>>

// External reference (string literal)
"external.package.Type"

// bigint with literal bits
bigint<1024>
```

## Type Resolution Rules

1. **Local definitions** take priority
2. **Imports** resolve by name from exported definitions
3. **Templates** are resolved recursively (inner types resolved first)
4. **Circular references** between types are **not supported** (would cause infinite encoding)
5. **Trait types** can be used as field types (polymorphic fields)

## Constraints

| Constraint | Details |
|------------|---------|
| No recursive types | Direct or indirect self-reference rejected |
| No union types | Use traits for polymorphism |
| No default values | Generated defaults are zero-values |
| No field attributes | No `@deprecated`, `@optional`, etc. |
| Template arg count | Fixed per template (vector=1, map=2, tuple=N, etc.) |
| bigint bits | Must be positive integer literal |

## Cross-References

- [Schema Language Overview](/openwiki/schema-language/overview.md) - Full language guide
- [Calls & Traits](/openwiki/schema-language/calls-traits.md) - RPC and polymorphism
- [Generated Output](/openwiki/generated-output/overview.md) - TypeScript output for each type
- [Codec Integration](/openwiki/generated-output/codec-integration.md) - Runtime encoding
- [Test Schema](/test/schema) - Real examples