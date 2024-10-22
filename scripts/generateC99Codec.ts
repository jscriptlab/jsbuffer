import path from 'node:path';
import fs from 'node:fs';
import { NumberInfo, NumberTypeId } from './NumberInfo';
import getTypeSizeMacroNameFromNumberTypeId from './getTypeSizeMacroNameFromNumberTypeId';
import CodeStream from 'textstreamjs';

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
export default async function generateC99Codec() {
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

  const header = new CodeStream();

  // Write the C++ opening bracket
  header.write('#ifdef __cplusplus\n');
  header.write('extern "C" {\n');
  header.write('#endif\n\n');

  header.write('#ifndef JSB_CODEC_H\n');
  header.write('#define JSB_CODEC_H\n\n');

  source.write('#include "codec.h"\n\n');

  header.write('#include <jsb/jsb.h>\n\n');

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
              testFile.write(
                `jsb_uint8_t buffer[${getTypeSizeMacroNameFromNumberTypeId(
                  integer.type
                )}];\n`
              );
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
                  testFile.write(
                    `rand_fill_float(&output, sizeof(${integer.name}));\n`
                  );
                  break;
                case NumberTypeId.Double:
                  testFile.write(
                    `rand_fill_double(&output, sizeof(${integer.name}));\n`
                  );
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
