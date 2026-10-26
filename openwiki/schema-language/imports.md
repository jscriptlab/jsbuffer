---
type: Reference
title: Imports & Exports
description: Cross-file dependency management in jsbuffer schema language - import statements, export declarations, and module resolution
tags: [schema-language, imports, exports, modules, dependencies]
resource: /test/schema
---

# Imports & Exports

Reference for managing cross-file dependencies in jsbuffer schemas.

## Import Statements

### Syntax

```jsbuffer
// Named imports
import { TypeName, CallName, TraitName } from "./path/to/file";

// Import all exports as namespace
import * as Namespace from "./path/to/file";

// Side-effect import (execute, bring all exports into scope)
import "./path/to/file";
```

### Path Resolution

- **Relative paths**: Relative to the importing file's directory
- **Extension**: `.jsbuffer` optional (`./models` ≡ `./models.jsbuffer`)
- **No node_modules resolution**: Only relative file paths supported
- **Circular imports**: Detected and rejected at parse time

### Examples

```jsbuffer
// schema/api.jsbuffer
import { User, Post } from "./models";
import { Request, Response } from "./traits";
import "./common";  // Constants, shared types

// schema/models.jsbuffer
import { Request } from "./traits";

type User : Request {
  uint32 id;
  string name;
}
```

## Export Statements

### Syntax

```jsbuffer
// Export specific definitions
export type User;
export call GetUser;
export trait Request;

// Export inline (definition + export in one)
export type User { uint32 id; string name; }
export call GetUser => User { uint32 id; }
export trait Request {}

// Re-export from another file
export { User, Post } from "./models";
```

### What Can Be Exported

| Kind | Keyword | Example |
|------|---------|---------|
| Type | `type` | `export type User;` |
| Call | `call` | `export call GetUser;` |
| Trait | `trait` | `export trait Request;` |

### Export Rules

1. **Only top-level definitions** can be exported (no nested exports)
2. **Names must be unique** within a file (DuplicateExport exception)
3. **Exported names** are what importers reference
4. **Non-exported definitions** are private to the file

## Module System Semantics

### File as Module
Each `.jsbuffer` file is a **module** with its own scope:
- Definitions are private by default
- `export` makes them public
- `import` brings other modules' exports into scope

### Dependency Graph
```
main.jsbuffer
├── import { A } from "./a"
│   └── import { B } from "./b"
└── import { C } from "./c"
    └── import { B } from "./b"   // Shared dependency, loaded once
```

The FileGenerator builds this graph during preprocessing and creates child generators for each unique imported file.

### Name Resolution Order

When resolving `TypeName` in a type expression:

1. **Local definitions** in current file (exported or not)
2. **Named imports** from `import { TypeName } from "..."`
4. **Namespace imports** from `import * as Ns` → `Ns.TypeName`
3. **Side-effect imports** - all exports from `import "./file"` brought into scope
5. **Error**: `TypeNotFound` if not found

## Import Patterns

### Pattern 1: Feature-Based Organization
```
schema/
├── api.jsbuffer          # Main entry, exports public API
├── types/
│   ├── user.jsbuffer     # export type User, UserProfile, etc.
│   └── post.jsbuffer     # export type Post, Comment, etc.
├── rpc/
│   ├── calls.jsbuffer    # export call GetUser, CreatePost, etc.
│   └── traits.jsbuffer   # export trait Request, Response, etc.
└── common.jsbuffer       # Shared primitives, enums
```

```jsbuffer
// schema/api.jsbuffer
import { User, UserProfile } from "./types/user";
import { Post, Comment } from "./types/post";
import { GetUser, CreatePost } from "./rpc/calls";
import { Request, Response } from "./rpc/traits";

export type User;
export type UserProfile;
export type Post;
export type Comment;

export call GetUser;
export call CreatePost;

export trait Request;
export trait Response;
```

### Pattern 2: Versioned API
```
schema/
├── v1/
│   ├── api.jsbuffer
│   ├── types.jsbuffer
│   └── calls.jsbuffer
├── v2/
│   ├── api.jsbuffer
│   ├── types.jsbuffer
│   └── calls.jsbuffer
└── shared/
    └── primitives.jsbuffer
```

```jsbuffer
// schema/v2/api.jsbuffer
import { User as V1User } from "../v1/types";
import { Request, Response } from "./traits";

// Extend v1 types
type User : V1User {
  string avatarUrl;  // New field in v2
}

export call GetUser : Request => Response { ... }
```

### Pattern 3: Monorepo Shared Schemas
```
packages/
├── shared-schema/
│   ├── package.json
│   └── schema/
│       ├── user.jsbuffer
│       └── common.jsbuffer
├── service-a/
│   └── schema/
│       └── api.jsbuffer  # import { User } from "shared-schema/schema/user"
└── service-b/
    └── schema/
        └── api.jsbuffer  # import { User } from "shared-schema/schema/user"
```

**Note**: For npm packages, use the `--extends` CLI option to extend a shared `tsconfig.json`, and publish generated TypeScript as part of the package.

## Re-exports

```jsbuffer
// Public API facade
export { User, Post, Comment } from "./models";
export { GetUser, GetPost, CreatePost } from "./calls";
export { Request, Response } from "./traits";

// Or selectively
export type User from "./models";
export call GetUser from "./calls";
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `TypeNotFound` | Imported name not exported | Check export spelling, ensure `export` keyword |
| `DuplicateExport` | Same name exported twice | Remove duplicate, use different names |
| `ImportStatement` parse error | Invalid import syntax | Check braces, path quotes, semicolon |
| Circular import | A imports B imports A | Restructure dependencies, extract common to shared file |
| File not found | Path incorrect | Verify relative path from importing file |

## Best Practices

1. **Single entry point** - One main file that exports public API
2. **Explicit exports** - Prefer `export type X` over `export *`
3. **Group related types** - One file per domain entity
4. **Separate traits** - Keep trait definitions in dedicated files
5. **Avoid deep nesting** - Flat import structure is easier to maintain
6. **Version schemas** - Use directory versioning (v1/, v2/) for breaking changes

## CLI Integration

```bash
# Compile main schema
npx jsbuffer schema/api.jsbuffer -o dist/schema

# With shared tsconfig
npx jsbuffer schema/api.jsbuffer -o dist/schema --extends tsconfig.base.json

# Skip tsconfig generation
npx jsbuffer schema/api.jsbuffer -o dist/schema --no-ts-config
```

The CLI resolves imports relative to the **main file's directory**, not the CWD.

## Cross-References

- [Schema Language Overview](/openwiki/schema-language/overview.md) - Full language guide
- [CLI Usage](/openwiki/workflows/cli-usage.md) - Compilation commands
- [Architecture: CLI](/openwiki/architecture/cli.md) - Path resolution logic
- [Code Generator](/openwiki/architecture/code-generator.md) - Import preprocessing
- [Test Schema](/test/schema) - Real import/export examples