/** Whitespace is part of the original output contract. */
export class CodeWriter {
  private depth = 0;
  private readonly lines: string[] = [];
  constructor(private readonly indentationSize: number) {}
  line(value: string) {
    this.lines.push(
      ' '.repeat(this.depth * this.indentationSize) + value + '\n'
    );
  }
  block(open: string, body: () => void, close = '}') {
    this.line(open);
    this.indent(body);
    this.line(close);
  }
  indent(body: () => void) {
    this.depth++;
    try {
      body();
    } finally {
      this.depth--;
    }
  }
  comment(value: string) {
    this.line('/**');
    for (const line of value.split('\n')) this.line(` * ${line}`);
    this.line(' */');
  }
  value() {
    return this.lines.join('');
  }
}

/** Original object-literal formatting intentionally differs from JSON.stringify. */
export function renderConfiguration(value: unknown): string {
  if (value instanceof Set)
    return `new Set(${renderConfiguration([...value])})`;
  if (value instanceof Map)
    return `new Map(${renderConfiguration([...value])})`;
  if (value instanceof Uint8Array)
    return `new Uint8Array(${renderConfiguration([...value])})`;
  if (Array.isArray(value))
    return `[${value.map(renderConfiguration).join(', ')}]`;
  if (value !== null && typeof value === 'object')
    return `{ ${Object.entries(value)
      .map(([key, item]) => `"${key}": ${renderConfiguration(item)}`)
      .join(', ')} }`;
  if (typeof value === 'string') return `"${value}"`;
  if (
    value === null ||
    value === undefined ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
    return String(value);
  throw new Error(
    `Cannot render TypeScript configuration value of type ${typeof value}`
  );
}

export function renderSupportTypes(indentationSize: number): string {
  const w = new CodeWriter(indentationSize);
  w.line(
    'export type RequestResult<T> = T extends IRequest<infer R> ? R : never;'
  );
  w.block('export interface ISerializer {', () => {
    for (const line of [
      'writeUint8(value: number): void;',
      'writeBuffer(value: Uint8Array): void;',
      'writeUint32(value: number): void;',
      'writeUint16(value: number): void;',
      'writeString(value: string): void;',
      'writeSignedBigInt(value: string, bits: number): void;',
      'writeUnsignedBigInt(value: string, bits: number): void;',
      'writeNullTerminatedString(value: string): void;',
      'writeSignedLong(value: string): void;',
      'writeUnsignedLong(value: string): void;',
      'writeInt32(value: number): void;',
      'writeInt16(value: number): void;',
      'writeDouble(value: number): void;',
      'writeFloat(value: number): void;'
    ])
      w.line(line);
  });
  w.block('export interface IDeserializer {', () => {
    for (const line of [
      'readUint8(): number;',
      'readBuffer(length: number): Uint8Array;',
      'readSignedBigInt(bits: number): string;',
      'readUnsignedBigInt(bits: number): string;',
      'readUint32(): number;',
      'readUint16(): number;',
      'readString(): string;',
      'readNullTerminatedString(): string;',
      'readSignedLong(): string;',
      'readUnsignedLong(): string;',
      'readInt32(): number;',
      'readInt16(): number;',
      'readDouble(): number;',
      'readFloat(): number;',
      'rewind(bytes: number): void;'
    ])
      w.line(line);
  });
  w.block('export interface IRequest<T> {', () => w.line('_returnType?: T;'));
  return w.value();
}
