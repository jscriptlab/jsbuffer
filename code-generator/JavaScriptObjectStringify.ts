import CodeStream from 'textstreamjs';
import Exception from '../exception/Exception';

export class ValueStringifyFailure extends Exception {
  public constructor(public readonly value: unknown) {
    super();
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is ReadonlyArray<unknown> {
  return Array.isArray(value);
}

export default class JavaScriptObjectStringify extends CodeStream {
  public stringify(value?: unknown) {
    if (isObject(value)) {
      const map = new Map(Object.entries(value));
      this.append('{\n');
      this.indentBlock(() => {
        const items = Array.from(map);
        for (const item of items) {
          const [k, v] = item;
          this.write(`"${k}": `);
          this.stringify(v);
          if (item !== items[items.length - 1]) {
            this.append(',');
          }
          this.append('\n');
        }
      });
      this.write('}');
    } else if (typeof value === 'boolean') {
      this.append(`${value}`);
    } else if (typeof value === 'string') {
      this.append(`"${value}"`);
    } else if (isArray(value)) {
      this.append('[\n');
      this.indentBlock(() => {
        for (let i = 0; i < value.length; i++) {
          this.write('');
          this.stringify(value[i]);
          if (i !== value.length - 1) {
            this.append(',');
          }
          this.append('\n');
        }
      });
      this.write(']');
    } else if (typeof value === 'undefined') {
      this.append('undefined');
    } else if (value === null) {
      this.append('null');
    } else {
      throw new ValueStringifyFailure(value);
    }
  }
}
