---
type: Reference
title: Calls & Traits
description: RPC-style call definitions and trait-based polymorphism in jsbuffer schema language
tags: [schema-language, calls, traits, rpc, polymorphism]
resource: /test/schema
---

# Calls & Traits

Reference for **call definitions** (RPC endpoints) and **traits** (polymorphic markers) in the jsbuffer schema language.

## Calls (RPC Definitions)

Calls define **request/response contracts** for RPC-style communication.

### Syntax

```jsbuffer
call CallName : InputTrait => OutputTrait {
  Type paramName;
  Type anotherParam;
}
```

### Components

| Part | Required | Description |
|------|----------|-------------|
| `call` | Yes | Keyword |
| `CallName` | Yes | Identifier (PascalCase convention) |
| `: InputTrait` | No | Input polymorphism marker |
| `=> OutputTrait` | Yes | Output polymorphism marker |
| `{ params }` | Yes | Parameter list (like type fields) |

### Examples

```jsbuffer
// Simple call (no input trait)
call Ping => Pong {}

// Call with parameters
call GetUser => UserResponse {
  uint32 userId;
  optional<string> fields;
}

// Polymorphic call (traits on both sides)
export call GetUser : Request => Response {
  uint32 userId;
}

// Call with complex parameters
call SearchUsers => UserList {
  string query;
  uint32 offset;
  uint32 limit;
  vector<string> includeFields;
  map<string, string> filters;
}
```

### Generated Code for Calls

For `call GetUser => UserResponse { uint32 userId; }`:

```typescript
// Input params interface
interface GetUserInputParams {
  userId: number;
}

// Encode/decode
function encodeGetUser(s: ISerializer, value: GetUserInputParams): void;
function decodeGetUser(d: IDeserializer): GetUserInputParams | null;

// Compare/default/update/validate
function compareGetUser(a: GetUserInputParams, b: GetUserInputParams): boolean;
function defaultGetUser(params?: Partial<GetUserInputParams>): GetUserInputParams;
function updateGetUser(value: GetUserInputParams, changes: Partial<GetUserInputParams>): GetUserInputParams;
function isGetUser(value: unknown): value is GetUserInputParams;

// CRC32 header included in encode/decode
```

## Traits (Polymorphism)

Traits are **marker types** for polymorphic dispatch - similar to interfaces with no methods.

### Syntax

```jsbuffer
trait TraitName {}

// Trait inheritance
trait ChildTrait : ParentTrait {}

// Type implementing traits
type ConcreteType : Trait1, Trait2 {
  // fields...
}
```

### Characteristics

| Property | Behavior |
|----------|----------|
| **No fields** | Empty body `{}` required |
| **Multiple inheritance** | `trait A : B, C {}` |
| **Type implements** | `type X : A, B {}` |
| **No direct instances** | Used only as parameter/return types |
| **Generated output** | Type alias with `_name` property |

### Example: Request/Response Pattern

```jsbuffer
// Base traits
trait Request {}
trait Response {}

// Request variants
type GetUserRequest : Request {
  uint32 userId;
}

type GetPostsRequest : Request {
  uint32 userId;
  uint32 limit;
}

// Response variants
type GetUserResponse : Response {
  User user;
}

type GetPostsResponse : Response {
  vector<Post> posts;
  uint64 totalCount;
}

// Polymorphic calls
export call GetUser : Request => Response {
  GetUserRequest request;
}

export call GetPosts : Request => Response {
  GetPostsRequest request;
}
```

### Generated Code for Traits

For `trait Request {}`:

```typescript
// Type alias with discriminant
type Request = { _name: 'schema.Request' };

// Encode/decode for trait dispatch
function encodeRequestTrait(s: ISerializer, value: Request): void;
function decodeRequestTrait(d: IDeserializer): Request | null;

// Discriminant is the _name property
// Actual concrete type encoded after trait header
```

## Trait Dispatch in Encoding

When a call uses traits, the **wire format** includes trait discrimination:

```
[Call CRC32] [Input Trait CRC32] [Concrete Input Type CRC32] [Input Fields...]
```

Decoding flow:
1. Read call CRC → identify call
2. Read input trait CRC → verify trait
3. Read concrete type CRC → identify actual type
4. Decode concrete type fields

This enables **schema evolution** - new request types can be added without breaking existing consumers.

## Import/Export with Calls & Traits

```jsbuffer
// Export for public API
export call GetUser : Request => Response { ... }
export trait Request {}
export trait Response {}

// Import in another file
import { GetUser, Request, Response } from "./api";
import * as API from "./api";

// Re-export
export call GetUser : Request => Response { ... }
```

## Constraints

| Constraint | Details |
|------------|---------|
| Single parameter | Calls effectively have one parameter object (like a type) |
| No optional parameters | All fields required (use `optional<T>` in params) |
| No method syntax | Calls are data, not methods |
| Trait parameters empty | Cannot add fields to traits |
| No generics on calls | Calls are concrete |

## Real-World Pattern: Versioned API

```jsbuffer
// v1/api.jsbuffer
trait V1Request {}
trait V1Response {}

type GetUserV1 : V1Request {
  uint32 id;
}

export call GetUser : V1Request => V1Response {
  GetUserV1 request;
}

// v2/api.jsbuffer
import { GetUser as GetUserV1 } from "./v1/api";

trait V2Request : V1Request {}
trait V2Response : V1Response {}

type GetUserV2 : V2Request {
  uint32 id;
  vector<string> fields;  // New field
}

export call GetUser : V2Request => V2Response {
  GetUserV2 request;
}
```

Consumers can handle both versions via trait polymorphism.

## Cross-References

- [Schema Language Overview](/openwiki/schema-language/overview.md) - Full language guide
- [Types & Templates](/openwiki/schema-language/types.md) - Type system details
- [Generated Output](/openwiki/generated-output/overview.md) - What code gets generated
- [Codec Integration](/openwiki/generated-output/codec-integration.md) - Runtime trait dispatch
- [Test Schema](/test/schema) - Real examples with traits and calls