import Character from './Character';
import { ITextDecoder } from './Tokenizer';

function countLineBreaks(
  contents: Uint8Array,
  maxByteOffset: number = contents.byteLength
) {
  let lineNumber = 0;
  let lineNumberOffset = 0;
  for (const item of contents.subarray(0, maxByteOffset)) {
    if (Character.isLineBreak(item)) {
      lineNumber++;
      lineNumberOffset = 0;
    } else {
      lineNumberOffset++;
    }
  }
  return { lineNumber, lineNumberOffset };
}

function firstLineBreakOffset(
  contents: Uint8Array,
  desiredStartByteOffset: number
) {
  let i = 0;
  const startByteOffset = Math.min(contents.byteLength, desiredStartByteOffset);
  for (const byte of contents.subarray(startByteOffset)) {
    if (Character.isLineBreak(byte)) {
      break;
    }
    i++;
  }
  return startByteOffset + i;
}

function assert(
  condition: boolean,
  message: string = 'Assertion failed'
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function lastLineBreakOffset(contents: Uint8Array, from: number) {
  // Make sure `from` is actually a number
  assert(typeof from === 'number', 'Expected `from` to be a number');
  assert(
    Number.isFinite(from) && Number.isInteger(from) && !Number.isNaN(from),
    `Expected \`from\` to be a finite integer, but got ${from}`
  );
  assert(from <= contents.byteLength - 1);
  let i: number;
  let ch: number | null;
  for (i = 0; i < from; i++) {
    ch = contents[from - i] ?? null;
    assert(ch !== null, 'Unexpected EOF');
    if (Character.isLineBreak(ch)) {
      break;
    }
  }
  return from - i;
}

export default class ErrorFormatter {
  readonly #contents;
  readonly #file;
  readonly #offset;
  readonly #textDecoder;
  public constructor({
    contents,
    offset,
    textDecoder,
    file
  }: {
    contents: Uint8Array;
    file: string;
    offset(): number;
    textDecoder: ITextDecoder;
  }) {
    this.#contents = contents;
    this.#file = file;
    this.#offset = offset;
    this.#textDecoder = textDecoder;
  }
  public preview(desiredRewindByteCount = 20) {
    const rewind = lastLineBreakOffset(
      this.#contents,
      Math.max(0, this.#offset() - desiredRewindByteCount)
    );
    const slice = this.#contents.subarray(
      rewind,
      firstLineBreakOffset(this.#contents, this.#offset() + 10)
    );
    const position = countLineBreaks(
      this.#contents.subarray(rewind, this.#offset())
    );
    return {
      position,
      slice
    };
  }
  public format(message: string) {
    const { lineNumber, lineNumberOffset } = countLineBreaks(
      this.#contents,
      this.#offset()
    );
    const previewInfo = this.preview(30);
    const previewText = this.#textDecoder.decode(previewInfo.slice);
    const finalPreview = previewText.split('\n');
    const position = previewInfo.position;
    finalPreview.splice(
      position.lineNumber + 1,
      0,
      `${' '.repeat(position.lineNumberOffset)}^ ${message}`
    );
    return `Error at ${this.#file}:${lineNumber + 1}:${
      lineNumberOffset + 1
    }:\n\n\t${message}\n\nDetailed:\n\n${finalPreview.join('\n')}\n\n`;
  }
}
