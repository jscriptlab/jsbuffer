---
type: Reference
title: Parser & Tokenizer
description: Lexical analysis (Tokenizer) and syntactic analysis (ASTGenerator) for the jsbuffer schema language
tags: [architecture, parser, tokenizer, ast]
resource: /src/Tokenizer.ts
---

# Parser & Tokenizer

The jsbuffer parser uses a **two-stage approach**: a Tokenizer for lexical analysis, then an ASTGenerator for syntactic analysis (recursive descent parser).

## Tokenizer (`/src/Tokenizer.ts`)

### Purpose
Converts raw schema source text (as `Uint8Array`) into a stream of typed tokens with position information.

### Token Types (`TokenType` enum)
| Type | Description | Examples |
|------|-------------|----------|
| `Keyword` | Reserved words | `type`, `call`, `trait`, `import`, `export`, `from` |
| `Identifier` | User-defined names | `User`, `getUser`, `id` |
| `LiteralString` | Double-quoted strings | `"hello"`, `"path/to/file"` |
| `LiteralNumber` | Numeric literals | `123`, `456` |
| `Punctuator` | Symbols | `{`, `}`, `(`, `)`, `:`, `;`, `,`, `=>`, `<`, `>` |
| `SingleLineComment` | `//` comments | `// comment` |
| `MultiLineComment` | `/* */` comments | `/* comment */` |

### Keyword List (line 50)
```typescript
readonly #keywords = ['call', 'from', 'trait', 'import', 'type', 'export'];
```

### Token Structure (`IToken`)
```typescript
interface IToken {
  type: TokenType;
  value: string;
  position: {
    lineNumber: { start: number; end: number };
    offset: { start: number; end: number };
  };
}
```

### Character Classification (`/src/Character.ts`)
Used by Tokenizer for character-by-character decisions:
- `isIdentifierStart(ch)` - `a-z`, `A-Z`, `_`
- `isIdentifierPart(ch)` - identifier start + `0-9`
- `isIntegerPart(ch)` - `0-9`
- `isStringLiteralStart(ch)` - `"`
- `isWhiteSpace(ch)` - space (32)
- `isLineBreak(ch)` - `\r` (13) or `\n` (10)

### Tokenization Algorithm
Single-pass, character-by-character:
1. Skip whitespace
2. Handle line breaks (track line numbers)
3. Detect `//` → single-line comment
4. Detect identifier start → read identifier → check if keyword
5. Detect `"` → read string literal (no escape handling visible)
6. Detect digit → read number literal
7. Try punctuators in order: `=>`, `{`, `}`, `,`, `;`, `:`, `<`, `>`
8. Throw on unrecognized character

### Limitations
- No multi-line comment support visible (only single-line `//`)
- String literals don't appear to handle escape sequences
- No regex/pattern-based tokenization - manual character scanning

## AST Generator (`/src/ASTGenerator.ts`)

### Purpose
Consumes token array from Tokenizer, produces Abstract Syntax Tree nodes representing schema definitions.

### Output Node Types (`ASTGeneratorOutputNode`)
```typescript
type ASTGeneratorOutputNode =
  | INodeExportStatement      // export type/call/trait
  | INodeCallDefinition       // call definitions
  | INodeImportStatement      // import statements
  | INodeTypeDefinition       // type definitions
  | INodeTraitDefinition;     // trait definitions
```

### Grammar Rules (from parser methods)

#### Import Statement (`#readImportStatement`)
```
import { Identifier, ... } from "string" ;
import "string" ;  // no requirements
```

#### Export Statement (`#readExportStatement`)
```
export type TypeName { ... }
export trait TraitName { ... }
export call CallName : ReturnType { ... }
```

#### Type Definition (`#readTypeStatement`)
```
type TypeName : Trait1, Trait2 { 
  TypeExpression paramName; 
  ...
}
```

#### Call Definition (`#readCallStatement`)
```
call CallName : Trait1, Trait2 => ReturnType {
  TypeExpression paramName;
  ...
}
```

#### Trait Definition (`#readTraitStatement`)
```
trait TraitName : BaseTrait1, BaseTrait2 { }
```
Note: Traits currently have no body parameters (empty `{}`)

#### Type Expression (`#readTypeExpression`)
```
Identifier                          // UserType
Identifier < TypeExpression, ... >  // Template: vector<int>, map<string,int>
LiteralString                       // "external.type"
LiteralNumber                       // 123 (for bigint<N>)
```

### Template Expression Parsing
When an identifier is followed by `<`, it parses as `INodeTemplateExpression`:
```typescript
{
  type: NodeType.TemplateExpression,
  name: INodeIdentifier,
  templateArguments: NodeTypeExpression[],
  position: { start, end }
}
```

Supported templates (validated later in code generator):
- `vector<T>` - array/list
- `set<T>` - unique collection
- `map<K,V>` - key-value map
- `optional<T>` - nullable
- `tuple<T...>` - fixed-size heterogeneous
- `bigint<N>` - arbitrary precision integer

### Parameter Definition (`#readParamDefinitions`)
```
TypeExpression paramName;
TypeExpression paramName;
...
```
Repeated until `}` encountered.

### Trait Inheritance (`#readTraits`)
```
: Trait1, Trait2, Trait3
```
Used in type, call, and trait definitions.

### Error Handling
Custom exception hierarchy in `/src/ASTGenerator.ts`:
- `ASTGenerationException` (base)
- `UnexpectedTokenType` - wrong token type
- `UnexpectedKeywordName` - wrong keyword
- `UnexpectedPunctuatorName` - wrong punctuator
- `UnexpectedExport` - export not followed by type/call/trait
- `UnexpectedToken` - completely unexpected
- `EOF` - unexpected end of input

All exceptions include position information via tokens.

## Integration with Code Generator

The AST nodes are consumed by `FileGenerator` (`/code-generator/FileGenerator.ts`):
1. `#preprocess()` iterates `ASTGeneratorOutputNode[]` 
2. Handles `ImportStatement` → creates child FileGenerators
3. Handles `ExportStatement` → processes type/call/trait definitions
4. Builds `Metadata` objects for code emission

## Cross-References

- [Architecture Overview](/openwiki/architecture/overview.md) - Pipeline context
- [Code Generator](/openwiki/architecture/code-generator.md) - AST consumption
- [Schema Language](/openwiki/schema-language/overview.md) - Language specification
- [Source Map](/openwiki/source-map.md#src-tokenizerts) - Tokenizer source reference
- [Source Map](/openwiki/source-map.md#src-astgeneratorts) - ASTGenerator source reference