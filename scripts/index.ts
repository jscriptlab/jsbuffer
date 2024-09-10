import CodeStream from 'textstreamjs';
import fs from 'fs';
import path from 'node:path';
import crypto from 'crypto';
import { spawn } from 'child-process-utilities';
import { glob } from 'glob';
import { getArgument } from 'cli-argument-helper';

/**
 * Get the integer name without the jsb_ prefix and _t suffix
 * @param value Integer name with jsb_ prefix and _t suffix
 * @returns Integer name without jsb_ prefix and _t suffix (e.g. jsb_int32_t -> int32)
 */
function getIntegerName(value: string) {
  return value.replace(/^jsb_/, '').replace(/_t$/, '');
}

async function generateC99Codec() {
  const source = new CodeStream();

  const integers = [
    {
      name: 'jsb_int8_t',
      signed: true,
      bits: 8
    },
    {
      name: 'jsb_int16_t',
      signed: true,
      bits: 16
    },
    {
      name: 'jsb_int32_t',
      signed: true,
      bits: 32
    },
    {
      name: 'jsb_int64_t',
      signed: true,
      bits: 64,
      suffix: 'L'
    },
    {
      name: 'jsb_uint64_t',
      signed: false,
      bits: 64,
      suffix: 'UL'
    },
    {
      name: 'jsb_uint32_t',
      signed: false,
      bits: 32
    },
    {
      name: 'jsb_uint16_t',
      signed: false,
      bits: 16
    },
    {
      name: 'jsb_uint8_t',
      signed: false,
      bits: 8
    },
    {
      name: 'jsb_float_t',
      ieee754: true,
      bits: 32
    },
    {
      name: 'jsb_double_t',
      ieee754: true,
      bits: 64
    }
  ];

  // const floats = [
  //   {
  //     name: 'jsb_float_t',
  //     bits: 32
  //   },
  //   {
  //     name: 'jsb_double_t',
  //     bits: 64
  //   }
  // ];

  const header = new CodeStream();

  // Write the C++ opening bracket
  header.write('#ifdef __cplusplus\n');
  header.write('extern "C" {\n');
  header.write('#endif\n\n');

  header.write('#ifndef JSB_CODEC_H\n');
  header.write('#define JSB_CODEC_H\n\n');

  source.write('#include "codec.h"\n\n');

  header.write('#include <jsb/jsb.h>\n\n');

  // const printBits = (varName: string, bits: number) => {
  //   for (let i = 0; i < bits; i++) {
  //     source.write(`printf("%d", (${varName} >> ${i}) & 1);\n`);
  //   }
  //   source.write('printf("\\n");\n');
  // };

  const testFile = new CodeStream();

  testFile.write('#include "test.h"\n');
  testFile.write('#include "../codec.h"\n\n');

  testFile.write('#include <jsb/ieee754.h>\n');
  testFile.write('#include <float.h>\n');
  testFile.write('#include <assert.h>\n\n');

  testFile.write('int main() {\n');

  for (const integer of integers) {
    const integerName = getIntegerName(integer.name);

    testFile.indentBlock(() => {
      testFile.write(
        '{\n',
        () => {
          const maxMacroName = `${integerName.toUpperCase()}_MAX`;
          const minMacroName = integer.signed
            ? `${integerName.toUpperCase()}_MIN`
            : 0;

          testFile.write('// Encode signed integer\n');
          testFile.write(`jsb_uint8_t buffer[${integer.bits / 8}];\n`);
          testFile.write(`${integer.name} output;\n`);

          const isIEEE754 = integer.ieee754;

          const values = isIEEE754
            ? integer.bits === 32
              ? ['FLT_MAX', 'FLT_MIN']
              : ['DBL_MAX', 'DBL_MIN']
            : [maxMacroName, minMacroName];

          if (isIEEE754) {
            const buffer = new ArrayBuffer(integer.bits / 8);
            for (let i = 0; i < 100; i++) {
              crypto.randomFillSync(new Uint8Array(buffer));
              let n: number, value: string;
              if (integer.bits === 32) {
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
            for (let i = 0; i < integer.bits; i++) {
              let bitCount = BigInt(i);
              if (!integer.signed) {
                bitCount++;
              }
              values.push(`${2n ** bitCount - 1n}`);
            }
          }

          for (const unsignedValue of values) {
            const integerSuffix = /^[0-9]/.test(unsignedValue.toString())
              ? integer.suffix ?? ''
              : '';
            testFile.write(
              `ASSERT_JSB_OK(jsb_encode_${integerName}(buffer, ${unsignedValue}${integerSuffix}));\n`
            );

            testFile.write(
              `ASSERT_JSB_OK(jsb_decode_${integerName}(buffer, &output));\n`
            );

            testFile.write(
              `ASSERT_JSB(output == ${unsignedValue}${integerSuffix});\n`
            );
          }
        },
        '}\n'
      );
    });

    if (!integer.ieee754) {
      const declaration = `enum jsb_result_t jsb_encode_${integerName}(jsb_uint8_t* buffer, const ${integer.name} value)`;
      header.write(`${declaration};\n`);
      source.write(
        `${declaration} {\n`,
        () => {
          const byteLength = integer.bits / 8;
          for (let i = 0; i < byteLength; i++) {
            const reverseIndex = byteLength - 1 - i;
            const bitShift = reverseIndex * 8;
            source.write(
              `buffer[${reverseIndex}] = (value >> ${bitShift}) & 0xFF;\n`
            );
          }
          source.write('return JSB_OK;\n');
        },
        '}\n'
      );

      source.write('\n');

      const decodeDeclaration = `enum jsb_result_t jsb_decode_${integerName}(const jsb_uint8_t* buffer, ${integer.name}* result)`;
      header.write(`${decodeDeclaration};\n`);
      source.write(
        `${decodeDeclaration} {\n`,
        () => {
          source.write('*result = 0;\n');
          const byteLength = integer.bits / 8;
          for (let i = 0; i < byteLength; i++) {
            const reverseByteIndex = byteLength - 1 - i;
            const shift = reverseByteIndex * 8;
            const byteValueVarName = `buffer[${reverseByteIndex}]`;
            source.write(
              `*result |= (${integer.name})(${byteValueVarName}) << ${shift};\n`
            );
          }
          source.write('return JSB_OK;\n');
        },
        '}\n'
      );
    }
  }

  header.write('\n#endif\n');

  // Write the C++ closing bracket
  header.write('#ifdef __cplusplus\n');
  header.write('}\n');
  header.write('#endif\n');

  testFile.write('}\n');

  await fs.promises.writeFile(
    path.resolve(__dirname, '../src/generators/c/library/codec.c'),
    source.value()
  );
  await fs.promises.writeFile(
    path.resolve(__dirname, '../src/generators/c/library/codec.h'),
    header.value()
  );
  await fs.promises.writeFile(
    path.resolve(__dirname, '../src/generators/c/library/test/codec.c'),
    testFile.value()
  );
}

(async () => {
  const args = process.argv.slice(2);
  const generateC99CodecArg = getArgument(args, '--generate-c99-codec');
  if (generateC99CodecArg !== null) {
    await generateC99Codec();
  }

  if (getArgument(args, '--clang-format') !== null) {
    await spawn(
      'clang-format',
      ['-i', ...(await glob(path.resolve(__dirname, '../**/*.{c,cpp,h,hpp}')))],
      {
        cwd: path.resolve(__dirname, '..')
      }
    ).wait();
  }
})().catch((reason) => {
  console.error(reason);
});
