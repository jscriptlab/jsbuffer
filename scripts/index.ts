import CodeStream from 'textstreamjs';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'child-process-utilities';
import { glob } from 'glob';
import { getArgument } from 'cli-argument-helper';
import { NumberInfo, NumberTypeId } from './NumberInfo';
// import getTypeSizeMacroNameFromNumberTypeId from './getTypeSizeMacroNameFromNumberTypeId';
// import generateRandomValues from './generateRandomValues';

/**
 * Get the integer name without the jsb_ prefix and _t suffix
 * @param value Integer name with jsb_ prefix and _t suffix
 * @returns Integer name without jsb_ prefix and _t suffix (e.g. jsb_int32_t -> int32)
 */
function getIntegerName(value: string) {
  return value.replace(/^jsb_/, '').replace(/_t$/, '');
}

/**
 * Generates the codec and the test project for it
 */
async function generateC99Codec() {
  const source = new CodeStream();

  const numberTypes: NumberInfo[] = [
    {
      type: NumberTypeId.Int8,
      name: 'jsb_int8_t',
      signed: true,
      bits: 8
    },
    {
      type: NumberTypeId.Int16,
      name: 'jsb_int16_t',
      signed: true,
      bits: 16
    },
    {
      type: NumberTypeId.Int32,
      name: 'jsb_int32_t',
      signed: true,
      bits: 32
    },
    {
      type: NumberTypeId.Int64,
      name: 'jsb_int64_t',
      signed: true,
      bits: 64,
      suffix: 'L'
    },
    {
      type: NumberTypeId.UInt64,
      name: 'jsb_uint64_t',
      signed: false,
      bits: 64,
      suffix: 'UL'
    },
    {
      type: NumberTypeId.UInt32,
      name: 'jsb_uint32_t',
      signed: false,
      bits: 32
    },
    {
      type: NumberTypeId.UInt16,
      name: 'jsb_uint16_t',
      signed: false,
      bits: 16
    },
    {
      type: NumberTypeId.UInt8,
      name: 'jsb_uint8_t',
      signed: false,
      bits: 8
    },
    {
      type: NumberTypeId.Float,
      name: 'jsb_float_t',
      ieee754: true,
      bits: 32
    },
    {
      type: NumberTypeId.Double,
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
  testFile.write('#include "rand.h"\n');
  testFile.write('#include "../codec.h"\n\n');

  testFile.write('#include <jsb/ieee754.h>\n');
  testFile.append('\n');

  testFile.append('#ifdef __AVR__\n');
  testFile.append('#include <avr/sleep.h>\n');
  testFile.append('#define JSB_CODEC_TEST_ITERATION_COUNT 10\n');
  testFile.append('#else\n');
  testFile.append('#define JSB_CODEC_TEST_ITERATION_COUNT 1000\n');
  testFile.append('#endif\n\n');

  testFile.write('int main(void) {\n');

  testFile.indentBlock(() => {
    testFile.write('jsb_uint32_t i;\n');
    testFile.write('\n');

    testFile.write('rand_init();\n');
    testFile.write('\n');

    for (const integer of numberTypes) {
      const integerName = getIntegerName(integer.name);
      // const maxMacroName = `${integerName.toUpperCase()}_MAX`;

      testFile.write(
        '{\n',
        () => {
          testFile.write(`${integer.name} output, decoded_value;\n`);
          testFile.write(
            'for(i = 0; i < JSB_CODEC_TEST_ITERATION_COUNT; i++) {\n',
            () => {
              testFile.write(`jsb_uint8_t buffer[${integer.bits / 8}];\n`);
              switch (integer.type) {
                case NumberTypeId.Int8:
                case NumberTypeId.Int16:
                case NumberTypeId.Int32:
                case NumberTypeId.Int64:
                case NumberTypeId.UInt64:
                case NumberTypeId.UInt32:
                case NumberTypeId.UInt16:
                case NumberTypeId.UInt8:
                  testFile.write(
                    `rand_fill(&output, sizeof(${integer.name}));\n`
                  );
                  break;
                case NumberTypeId.Float:
                  testFile.write('rand_fill_float(&output, 1);\n');
                  break;
                case NumberTypeId.Double:
                  testFile.write('rand_fill_double(&output, 1);\n');
                  break;
              }

              testFile.write(
                `ASSERT_JSB_OK(jsb_encode_${integerName}(buffer, output));\n`
              );

              testFile.write(
                `ASSERT_JSB_OK(jsb_decode_${integerName}(buffer, &decoded_value));\n`
              );

              testFile.write('ASSERT_JSB(decoded_value == output);\n');
            },
            '}\n'
          );
        },
        '}\n'
      );
      // const integerSuffix =
      //   'suffix' in integer && /^[0-9]/.test(`${value}`)
      //     ? integer.suffix ?? ''
      //     : '';
      // testFile.write(
      //   `ASSERT_JSB_OK(jsb_encode_${integerName}(buffer, ${value}${integerSuffix}));\n`
      // );

      // testFile.write(
      //   `ASSERT_JSB_OK(jsb_decode_${integerName}(buffer, &output));\n`
      // );

      // testFile.write(`ASSERT_JSB(output == ${value}${integerSuffix});\n`);
      // testFile.indentBlock(() => {
      //   const bitCount = integer.bits;
      //   const isIEEE754 = integer.type === 'double' || integer.type === 'float';
      //   const maxMacroName = `${integerName.toUpperCase()}_MAX`;
      //   const minMacroName =
      //     'signed' in integer && integer.signed
      //       ? `${integerName.toUpperCase()}_MIN`
      //       : 0;

      //   const values = isIEEE754
      //     ? bitCount === 32
      //       ? ['FLT_MAX', 'FLT_MIN']
      //       : ['DBL_MAX', 'DBL_MIN']
      //     : [maxMacroName, minMacroName];

      //   let currentBit = 0;
      //   while (currentBit < bitCount) {
      //     const typeSizeMacroName = getTypeSizeMacroNameFromNumberTypeId(
      //       integer.type
      //     );

      //     let testBitCount: number;

      //     // This is needed to define #if or #elif
      //     const initialBitIndex = currentBit;

      //     do {
      //       testBitCount = integer.bits - currentBit;
      //       currentBit++;
      //     } while (
      //       // Ensure that the bit count is a multiple of 8
      //       currentBit < bitCount &&
      //       /**
      //        * If this is a floating-point number (IEEE 754), it will not repeat if the result of `testBitCount % 8` is non-zero.
      //        * This is because the bit count for IEEE 754 numbers needs to be divisible by 8.
      //        */
      //       isIEEE754 &&
      //       testBitCount % 8
      //     );

      //     // Convert potentially adjusted bit count to byte count
      //     const testByteCount = testBitCount / 8;

      //     /**
      //      * Validate the type of `testByteCount` to ensure that it is an integer and not NaN or Infinity.
      //      */
      //     if (
      //       !Number.isInteger(testByteCount) ||
      //       Number.isNaN(testByteCount) ||
      //       !Number.isFinite(testByteCount)
      //     ) {
      //       continue;
      //     }

      //     // Once we're past the first iteration, use `elif` instead of `if`
      //     testFile.write(
      //       `${
      //         initialBitIndex === 0 ? '' : '} else '
      //       }if(${typeSizeMacroName} == ${testByteCount}) {\n`
      //     );

      //     const randomValues = [
      //       ...values,
      //       ...generateRandomValues({
      //         signed: 'signed' in integer ? integer.signed : false,
      //         bits: bitCount,
      //         trim: testBitCount,
      //         isIEEE754
      //       })
      //     ];

      //     testFile.indentBlock(() => {
      //       testFile.write(`// Encode ${testBitCount} bits\n`);
      //       testFile.write(`jsb_uint8_t buffer[${testByteCount}];\n`);
      //       testFile.write(`${integer.name} output;\n`);
      //       testFile.write('\n');

      //       for (const value of randomValues) {
      //         const integerSuffix =
      //           'suffix' in integer && /^[0-9]/.test(`${value}`)
      //             ? integer.suffix ?? ''
      //             : '';
      //         testFile.write(
      //           `ASSERT_JSB_OK(jsb_encode_${integerName}(buffer, ${value}${integerSuffix}));\n`
      //         );

      //         testFile.write(
      //           `ASSERT_JSB_OK(jsb_decode_${integerName}(buffer, &output));\n`
      //         );

      //         testFile.write(`ASSERT_JSB(output == ${value}${integerSuffix});\n`);
      //       }
      //     });
      //   }
      //   testFile.write(
      //     '} else {\n',
      //     () => {
      //       testFile.write(
      //         `JSB_TRACE("Failed to find appropriate bit count to test ${integer.type}");\n`
      //       );
      //       testFile.write('return 1;\n');
      //     },
      //     '}\n'
      //   );
      // });
    }

    testFile.append('#ifdef __AVR__\n');
    testFile.write('set_sleep_mode(SLEEP_MODE_PWR_DOWN);\n');
    testFile.write('sleep_mode();\n');
    testFile.append('#endif\n');

    testFile.write('return 0;\n');
  });
  testFile.write('}\n');

  for (const integer of numberTypes) {
    const integerName = getIntegerName(integer.name);
    // const maxMacroName = `${integerName.toUpperCase()}_MAX`;

    if (!('ieee754' in integer)) {
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
