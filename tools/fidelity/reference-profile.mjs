// User-approved upstream declaration correction. Apply to a verified copy of
// the published generator source, before generation; never normalize output.
export const correctedProfile = 'jsbuffer@1.0.28+int16-interfaces.1';
export const correctedFile = 'code-generator/FileGenerator.js';
export const declarationCorrections = [
  ['writeUint32(value: number): void;', 'writeUint16(value: number): void;'],
  ['writeInt32(value: number): void;', 'writeInt16(value: number): void;'],
  ['readUint32(): number;', 'readUint16(): number;'],
  ['readInt32(): number;', 'readInt16(): number;']
];

export function correctInt16Interfaces(source) {
  for (const [existing, added] of declarationCorrections) {
    const anchor = `this.write('${existing}\\n');`;
    if (source.split(anchor).length !== 2 || source.includes(added)) {
      throw new Error(
        'Unexpected original generator source for correction: ' + added
      );
    }
    const index = source.indexOf(anchor);
    const indentation = source.slice(
      source.lastIndexOf('\n', index) + 1,
      index
    );
    source = source.replace(
      anchor,
      anchor + '\n' + indentation + `this.write('${added}\\n');`
    );
  }
  return source;
}
