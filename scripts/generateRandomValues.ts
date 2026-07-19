import crypto from 'node:crypto';

export default function generateRandomValues({
  signed,
  bits,
  isIEEE754,
  trim = bits
}: {
  isIEEE754: boolean;
  signed: boolean;
  bits: number;
  /**
   * Limit the number of bits that we will keep from the randomly generated number
   */
  trim?: number;
}) {
  const values = new Array<string>();
  const minByteCount = bits / 8;
  const trimByteCount = trim / 8;
  if (isIEEE754) {
    const buffer = new ArrayBuffer(minByteCount);
    for (let i = 0; i < 100; i++) {
      crypto.randomFillSync(new Uint8Array(buffer));

      console.log(
        'Before:\n\t%s',
        Array.from(new Uint8Array(buffer))
          .map((n) => `${n.toString(16).toUpperCase()}`)
          .join(' ')
      );

      // Zeroes out the bits that are not part of the bit limit
      new Uint8Array(buffer).set(new Uint8Array(trimByteCount).fill(0), 0);

      console.log(
        'After:\n\t%s',
        Array.from(new Uint8Array(buffer))
          .map((n) => `${n.toString(16).padStart(2, '0').toUpperCase()}`)
          .join(' ')
      );

      let n: number, value: string;
      if (bits === 32) {
        n = new Float32Array(buffer)[0] ?? 0;
        value = `${n}`;
        if (!value.includes('.')) {
          value += '.0';
        }
        value = `${value}f`;
      } else {
        n = new Float64Array(buffer)[0] ?? 0;
        value = `${n}`;
        if (!value.includes('.')) {
          value += '.0';
        }
      }
      if (Number.isNaN(n)) {
        continue;
      }
      values.push(value);
    }
  } else {
    for (let i = 0; i < trim; i++) {
      let bitCount = BigInt(i);
      if (!signed) {
        bitCount++;
      }
      values.push(`${2n ** bitCount - 1n}`);
    }
  }
  return values;
}
