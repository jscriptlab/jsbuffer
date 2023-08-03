import CodeStream from 'textstreamjs';
import Exception from '../exception/Exception';

export class ValueStringifyFailure extends Exception {
  public constructor(public readonly value: unknown) {
    super(`Failed to stringify value: ${value} (type is ${typeof value})`);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is ReadonlyArray<unknown> {
  return Array.isArray(value);
}

export default class JavaScriptObjectStringify extends CodeStream {
  readonly #quoteObjectParameterNames: boolean;
  public constructor(
    parent: CodeStream | undefined,
    {
      indentationSize,
      quoteObjectParameterNames = true,
    }: {
      indentationSize: number;
      quoteObjectParameterNames?: boolean;
    }
  ) {
    super(parent, {
      indentationSize,
    });
    this.#quoteObjectParameterNames = quoteObjectParameterNames;
  }
  public stringify(value?: unknown) {
    if (value instanceof Set) {
      this.append('new Set(');
      this.stringify(Array.from(value));
      this.append(')');
    } else if (value instanceof Map) {
      this.append('new Map(');
      this.stringify(Array.from(value));
      this.append(')');
    } else if (value instanceof Uint8Array) {
      this.append('new Uint8Array(');
      this.stringify(Array.from(value));
      this.append(')');
    } else if (isArray(value)) {
      this.append('[');
      this.indentBlock(() => {
        for (let i = 0; i < value.length; i++) {
          this.stringify(value[i]);
          if (i !== value.length - 1) {
            this.append(', ');
          }
        }
      });
      this.append(']');
    } else if (isObject(value)) {
      const map = new Map(Object.entries(value));
      this.append('{ ');
      this.indentBlock(() => {
        const items = Array.from(map);
        for (const item of items) {
          const [k, v] = item;
          this.append(`${this.#paramName(k)}: `);
          this.stringify(v);
          if (item !== items[items.length - 1]) {
            this.append(', ');
          }
        }
      });
      this.append(' }');
    } else if (typeof value === 'boolean') {
      this.append(`${value}`);
    } else if (typeof value === 'string') {
      this.append(`"${value}"`);
    } else if (typeof value === 'undefined') {
      this.append('undefined');
    } else if (value === null) {
      this.append('null');
    } else if (typeof value === 'number') {
      this.append(`${value}`);
    } else {
      throw new ValueStringifyFailure(value);
    }
  }
  #paramName(value: string) {
    if (this.#quoteObjectParameterNames) {
      value = `"${value}"`;
    }
    return value;
  }
}
