import CodeStream from 'textstreamjs';
import { IGeneratedFile } from '../../core/File';
import { IFileMetadata } from '../../parser/Parser';
import {
  getInitOptionalParameterFunctionName,
  getMetadataCompleteTypeReference,
  getMetadataPrefix,
  getTuplePropertyName
} from './utilities';
import GenericName from '../../parser/types/GenericName';
import {
  IMetadataExternalTypeParamTypeDefinition,
  IMetadataInternalTypeParamTypeDefinition,
  IMetadataParam,
  IMetadataParamTypeGeneric,
  IMetadataTraitDefinition,
  Metadata,
  MetadataParamType,
  MetadataParamTypeTemplate
} from '../../parser/types/metadata';
import Exception from '../../../exception/Exception';
import MetadataFileCCodeGenerator from './MetadataFileCCodeGenerator';
import assert from 'assert';

export const genericTypeNames = [
  'uint8',
  'uint16',
  'uint32',
  'uint64',
  'int8',
  'int16',
  'int32',
  'int64',
  'float',
  'double'
] as const;

export default class TestGeneratorC extends CodeStream {
  readonly #files;
  readonly #fileMetadataList;
  readonly #resolverByMetadataObject;
  public constructor(options: {
    cmake: { projectName: string };
    parent: CodeStream;
    files: IGeneratedFile[];
    fileMetadataList: Map<string, IFileMetadata>;
    resolverByMetadataObject: Map<Metadata, MetadataFileCCodeGenerator>;
  }) {
    super(options.parent);
    this.#files = options.files;
    this.#fileMetadataList = options.fileMetadataList;
    this.#resolverByMetadataObject = options.resolverByMetadataObject;
  }

  /**
   * Get the list of files that were generated. `generate` must be called
   * before this function is called. Otherwise, you'll receive an empty list.
   * @returns The list of files that were generated
   */
  public files() {
    return this.#files;
  }

  // Generate a test.c file based on the metadata, calling `_encode` and `_decode` functions. Create the serializer and deserializer once
  public generate() {
    this.append('#ifdef __AVR__\n');
    this.write('#include <avr/sleep.h>\n');
    this.append('#endif\n');
    this.append('\n');

    this.write('#include <jsb/jsb.h>\n');
    this.write('#include <jsb/serializer.h>\n');
    this.write('#include <jsb/deserializer.h>\n');
    this.append('\n');
    for (const file of this.#files) {
      if (file.path.endsWith('.h')) {
        this.write(`#include "${file.path}"\n`);
      }
    }
    this.append('\n');
    const assertFunctionImplementations: (
      | {
          type: 'custom';
          includes: () => void;
          condition: () => void;
          error: () => void;
        }
      | {
          type: 'original';
        }
    )[] = [
      {
        type: 'custom',
        includes: () => {
          this.append('#include <stdio.h>\n');
        },
        condition: () => {
          this.append('!defined(__AVR__) && defined(HAVE_FPRINTF)');
        },
        error: () => {
          this.write(
            'fprintf(stderr, "%s:%d: Assertion failed: %s", __FILE__, __LINE__, #expr); \\\n'
          );
        }
      },
      { type: 'original' }
    ];
    const lastAssertFunctionImplementation =
      assertFunctionImplementations[assertFunctionImplementations.length - 1] ??
      null;
    const firstAssertFunctionImplementation =
      assertFunctionImplementations[0] ?? null;
    assert.strict.ok(lastAssertFunctionImplementation !== null);
    assert.strict.ok(firstAssertFunctionImplementation !== null);
    for (const fns of assertFunctionImplementations) {
      // assert.strict.ok(
      //   fns !== firstAssertFunctionImplementation && fns.type === 'original',
      //   'The original implementation must be at the end. ' +
      //     "It's the only one that fits inside an #else " +
      //     "(that doesn't need a condition)"
      // );
      switch (fns.type) {
        case 'original':
          this.append('#else');
          break;
        case 'custom':
          if (fns === firstAssertFunctionImplementation) {
            this.append('#if');
          } else if (fns !== lastAssertFunctionImplementation) {
            this.append('#elif');
          }
          this.append(' ');
          fns.condition();
      }
      this.append('\n');
      switch (fns.type) {
        case 'custom':
          fns.includes();
          this.append('\n');
          break;
        case 'original':
      }
      this.write('#define JSB_ASSERT(expr) \\\n');
      this.indentBlock(() => {
        this.write(
          'if((expr)) {} else { \\\n',
          () => {
            if (fns.type === 'custom') {
              fns.error();
            }
            this.write(
              'JSB_TRACE("test", "Assertion failed: %s", #expr); \\\n'
            );
            this.write('return 1; \\\n');
          },
          '}\n'
        );
      });
      if (fns === lastAssertFunctionImplementation) {
        const previousAssertFunctionImplementation =
          assertFunctionImplementations[
            assertFunctionImplementations.indexOf(fns) - 1
          ] ?? null;
        assert.strict.ok(previousAssertFunctionImplementation !== null);
        this.append('#endif ');
        this.append('// ');
        if (previousAssertFunctionImplementation.type === 'custom') {
          previousAssertFunctionImplementation.condition();
        }
        this.append('\n');
      }
    }
    this.append('\n');

    this.write('int main(void) {\n');
    this.indentBlock(() => {
      this.write('struct jsb_serializer_t s;\n');
      this.write('struct jsb_deserializer_t d;\n');
      this.append('\n');

      this.write('// It should return JSB_BAD_ARGUMENT if s is NULL\n');
      this.write(
        'JSB_ASSERT(jsb_serializer_init(NULL, 1) == JSB_BAD_ARGUMENT);\n'
      );
      this.append('\n');

      this.write(
        '// It should return JSB_BAD_ARGUMENT if buffer size is zero\n'
      );
      this.write(
        'JSB_ASSERT(jsb_serializer_init(&s, 0) == JSB_BAD_ARGUMENT);\n'
      );
      this.append('\n');

      this.write(
        '// Initialize the serializer again in order to pass a valid buffer to the deserializer\n'
      );
      this.write('JSB_ASSERT(jsb_serializer_init(&s, 200) == JSB_OK);\n');
      this.append('\n');

      this.write(
        '// It should not return JSB_BAD_ARGUMENT if buffer size is zero\n'
      );
      this.write(
        'JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);\n'
      );
      this.append('\n');

      this.write(
        '// It should return JSB_BAD_ARGUMENT if deserializer is NULL\n'
      );
      this.write(
        'JSB_ASSERT(jsb_deserializer_init(NULL, s.buffer, s.buffer_size) == JSB_BAD_ARGUMENT);\n'
      );
      this.append('\n');

      this.write('// It should return JSB_BAD_ARGUMENT if buffer is NULL\n');
      this.write(
        'JSB_ASSERT(jsb_deserializer_init(&d, NULL, s.buffer_size) == JSB_BAD_ARGUMENT);\n'
      );
      this.append('\n');

      this.append('\n');
      this.append(
        '#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)\n'
      );
      this.write(
        '{\n',
        () => {
          this.write(
            '// It should blow up if the serializer goes beyond the maximum size\n'
          );
          this.write(
            'JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE + 1) == JSB_BUFFER_OVERFLOW);\n'
          );
          this.write(
            'JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);\n'
          );
          this.write('enum jsb_result_t status;\n');
          for (const typeName of genericTypeNames) {
            const value = this.#getValueFromGenericName(typeName);
            this.write(
              '{\n',
              () => {
                this.write(
                  'JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);\n'
                );
                this.write(
                  'do {\n',
                  () => {
                    this.write(
                      `status = jsb_serializer_write_${typeName}(&s, ${value});\n`
                    );
                    this.#writeStatusCheck('status', [
                      'JSB_OK',
                      'JSB_BUFFER_OVERFLOW'
                    ]);
                  },
                  '} while(status != JSB_BUFFER_OVERFLOW);\n'
                );
              },
              '}\n'
            );
          }
        },
        '}\n'
      );
      this.append(
        '#elif !defined(JSB_SERIALIZER_BUFFER_SIZE) && defined(JSB_SERIALIZER_USE_MALLOC)\n'
      );
      this.write(
        '// It should reallocate the buffer when it goes beyond the maximum size\n'
      );
      for (const typeName of genericTypeNames) {
        this.write(
          '{\n',
          () => {
            const value = this.#getValueFromGenericName(typeName);
            this.write('JSB_ASSERT(jsb_serializer_init(&s, 1) == JSB_OK);\n');
            this.write(
              `JSB_ASSERT(jsb_serializer_write_${typeName}(&s, ${value}) == JSB_OK);\n`
            );
            this.write('s.buffer_capacity = 1;\n');
          },
          '}\n'
        );
      }
      this.append('#else\n');
      this.append(
        '#error "Either JSB_SERIALIZER_BUFFER_SIZE or JSB_SERIALIZER_USE_MALLOC should be defined"\n'
      );
      this.append(
        '#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)\n'
      );
      this.append('\n');
      this.append('\n');
      for (const fileMetadata of this.#fileMetadataList.values()) {
        for (const metadata of fileMetadata.metadata) {
          this.write(
            '{\n',
            () => {
              switch (metadata.kind) {
                case 'type':
                case 'call':
                  this.write(
                    `${getMetadataCompleteTypeReference(metadata)} value;\n`
                  );
                  this.write(
                    'JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);\n'
                  );
                  this.write(
                    '{\n',
                    () => {
                      this.write(
                        `JSB_ASSERT(${getMetadataPrefix(
                          metadata
                        )}_init(&value) == JSB_OK);\n`
                      );

                      this.append(
                        '#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)\n'
                      );
                      this.write(
                        '// It should blow up when encoding a type is beyond the maximum size of the buffer\n'
                      );
                      this.write('enum jsb_result_t status;\n');
                      this.write(
                        'do {\n',
                        () => {
                          this.write(
                            `status = ${getMetadataPrefix(
                              metadata
                            )}_encode(&value, &s);\n`
                          );
                          this.write(
                            `status = ${getMetadataPrefix(
                              metadata
                            )}_encode(&value, &s);\n`
                          );
                          this.#writeStatusCheck('status', [
                            'JSB_OK',
                            'JSB_BUFFER_OVERFLOW'
                          ]);
                        },
                        '} while(status != JSB_BUFFER_OVERFLOW);\n'
                      );
                      this.append(
                        '#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)\n'
                      );
                    },
                    '}\n'
                  );
                  this.write(
                    'JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);\n'
                  );
                  this.write(
                    `JSB_ASSERT(${getMetadataPrefix(
                      metadata
                    )}_init(&value) == JSB_OK);\n`
                  );
                  this.write(
                    `JSB_ASSERT(${getMetadataPrefix(
                      metadata
                    )}_encode(&value, &s) == JSB_OK);\n`
                  );
                  this.write(
                    'JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);\n'
                  );
                  this.write(
                    'JSB_ASSERT(jsb_deserializer_init(NULL, NULL, 0) == JSB_BAD_ARGUMENT);\n'
                  );
                  this.write(
                    'JSB_ASSERT(jsb_deserializer_init(&d, NULL, 0) == JSB_BAD_ARGUMENT);\n'
                  );
                  this.write(
                    'JSB_ASSERT(jsb_deserializer_init(NULL, s.buffer, 0) == JSB_BAD_ARGUMENT);\n'
                  );
                  this.write(
                    `JSB_ASSERT(${getMetadataPrefix(
                      metadata
                    )}_decode(&d, &value) == JSB_OK);\n`
                  );
                  this.write(`${getMetadataPrefix(metadata)}_free(&value);\n`);

                  this.append('\n');

                  // Test the type with all sorts of values in its parameters
                  for (const param of metadata.params) {
                    this.write(
                      '{\n',
                      () => {
                        this.write(
                          `${getMetadataCompleteTypeReference(
                            metadata
                          )} new_value;\n`
                        );
                        this.write(
                          `jsb_memset(&new_value, 0, sizeof(${getMetadataCompleteTypeReference(
                            metadata
                          )}));\n`
                        );
                        this.write(
                          `jsb_memset(&value, 0, sizeof(${getMetadataCompleteTypeReference(
                            metadata
                          )}));\n`
                        );
                        this.write(
                          `JSB_ASSERT(${getMetadataPrefix(
                            metadata
                          )}_init(&value) == JSB_OK);\n`
                        );
                        this.write(
                          `JSB_ASSERT(${getMetadataPrefix(
                            metadata
                          )}_init(&new_value) == JSB_OK);\n`
                        );
                        this.write(
                          'JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);\n'
                        );
                        this.#generateTestForParam(
                          param.type,
                          metadata,
                          param,
                          `value.${param.name}`
                        );
                        this.write(
                          `JSB_ASSERT(${getMetadataPrefix(
                            metadata
                          )}_encode(&value, &s) == JSB_OK);\n`
                        );
                        this.write(
                          'JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);\n'
                        );
                        this.write(
                          `JSB_ASSERT(${getMetadataPrefix(
                            metadata
                          )}_decode(&d, &new_value) == JSB_OK);\n`
                        );
                        // Compare the parameter value using memcmp
                        this.write(
                          `JSB_ASSERT(memcmp(&new_value.${param.name}, &value.${param.name}, sizeof(value.${param.name})) == 0);\n`
                        );
                        this.write(
                          `JSB_TRACE("test", "Test passed ✔ for param: %s", "${param.name}");\n`
                        );
                      },
                      '}\n'
                    );
                  }
                  break;
                case 'trait':
                  this.#generateTraitTest(metadata);
                  break;
              }
            },
            '}\n'
          );
        }
      }
      this.append('\n');

      this.write('jsb_serializer_free(&s);\n');
      this.append('\n');

      this.write('JSB_TRACE("test", "All tests passed ✔");\n');
      this.append('\n');

      this.append('#ifdef __AVR__\n');
      this.write('// Put AVR MCUs to sleep\n');
      this.write('// Note: `asm("sleep")` would also work\n');
      this.write('set_sleep_mode(SLEEP_MODE_PWR_DOWN);\n');
      this.write('sleep_mode();\n');
      this.append('#endif\n');
      this.append('\n');

      this.write('return 0;\n');
    });
    this.write('}\n');
    this.#files.push({
      path: 'test.c',
      contents: this.value()
    });
  }

  #writeStatusCheck(status: string, expected: string[]) {
    assert.strict.ok(expected.length > 0, '`expected` array cannot be empty');

    this.write(
      '// If it does not return JSB_BUFFER_OVERFLOW, it MUST be JSB_OK.\n'
    );
    this.write(
      '// Otherwise, some other issue has happened during execution.\n'
    );
    this.write(
      `JSB_ASSERT(${expected
        .map((arg) => `${status} == ${arg}`)
        .join(' || ')});\n`
    );
  }

  #getValueFromGenericName(
    typeName: typeof genericTypeNames extends ReadonlyArray<infer T> ? T : never
  ) {
    let value: string;
    switch (typeName) {
      case 'uint8':
        value = '1';
        break;
      case 'uint16':
        value = '0xFF';
        break;
      case 'uint32':
        value = '0xFFFF';
        break;
      case 'uint64':
        value = '0xFFFFFFFF';
        break;
      case 'int8':
        value = '-1';
        break;
      case 'int16':
        value = '-10';
        break;
      case 'int32':
        value = '-100';
        break;
      case 'int64':
        value = '-1000';
        break;
      case 'float':
        value = '0.12345678f';
        break;
      case 'double':
        value = '0.1234567890';
        break;
    }
    return value;
  }

  #generateTraitTest(metadata: IMetadataTraitDefinition) {
    const resolver = this.#resolverByMetadataObject.get(metadata) ?? null;
    if (resolver === null) {
      throw new Exception(`Failed to find a resolver for: ${metadata.name}`);
    }
    const traitEnum = resolver.generateTraitEnumInformation(metadata);
    for (const node of metadata.nodes) {
      switch (node.type) {
        case 'internalType':
        case 'externalType': {
          for (const item of traitEnum.items) {
            this.write(
              '{\n',
              () => {
                // const itemMetadata =
                //   resolver.resolveMetadataFromParamTypeDefinition(node);
                this.write(
                  `${getMetadataCompleteTypeReference(
                    metadata
                  )} value, new_value;\n`
                );
                this.write('// Initialize the type struct again\n');
                for (const prop of ['value', 'new_value']) {
                  this.write(
                    `JSB_ASSERT(${getMetadataPrefix(metadata)}_init(&${prop}, ${
                      item[1].name
                    }) == JSB_OK);\n`
                  );
                }
                this.write(
                  'JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);\n'
                );
                this.append(
                  '#if defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)\n'
                );
                this.write(
                  'JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);\n'
                );
                this.append('#else\n');
                this.write(
                  'JSB_ASSERT(jsb_serializer_init(&s, 200) == JSB_OK);\n'
                );
                this.append('#endif\n');
                this.write(
                  `JSB_ASSERT(${getMetadataPrefix(
                    metadata
                  )}_encode(&value, &s) == JSB_OK);\n`
                );
                this.write(
                  'JSB_ASSERT(jsb_deserializer_init(&d, s.buffer, s.buffer_size) == JSB_OK);\n'
                );
                this.write(
                  `JSB_ASSERT(${getMetadataPrefix(
                    metadata
                  )}_decode(&d, &new_value) == JSB_OK);\n`
                );
                this.write(
                  `JSB_ASSERT(memcmp(&value, &new_value, sizeof(${getMetadataCompleteTypeReference(
                    metadata
                  )})) == JSB_OK);\n`
                );
              },
              '}\n'
            );
            break;
          }
        }
      }
    }
  }

  #generateTestForGenericParam(
    metadataParamType: IMetadataParamTypeGeneric,
    _: Metadata,
    key: string
  ) {
    switch (metadataParamType.value) {
      case GenericName.Bytes:
        this.write(
          '{\n',
          () => {
            const byteLength = 0;
            const values = new Array<string>();
            for (let i = 0; i < byteLength; i++) {
              values.push(crypto.getRandomValues(new Uint8Array(1)).join());
            }
            values.push('0');
            this.write(
              `const jsb_uint8_t bytes[${byteLength + 1}] = {${values.join(
                ', '
              )}};\n`
            );
            this.write(`jsb_strncpy(${key}, bytes, ${byteLength});\n`);
            // Test the string values with strcmp
            this.write(
              `JSB_ASSERT(strcmp((const char*)${key}, (const char*)bytes) == 0);\n`
            );
          },
          '}\n'
        );
        break;
      case GenericName.NullTerminatedString:
      case GenericName.String: {
        this.write(
          '{\n',
          () => {
            const value = 'This is a test string';
            this.write(
              `jsb_uint8_t test_value[${value.length}] = "${value}";\n`
            );
            this.write(`jsb_strncpy(${key}, test_value, ${value.length});\n`);
          },
          '}\n'
        );
        break;
      }
      case GenericName.Long:
        this.write(`${key} = 1234567890L;\n`);
        break;
      case GenericName.UnsignedLong:
        this.write(`${key} = 1234567890UL;\n`);
        break;
      case GenericName.Integer:
      case GenericName.Int32:
        this.write(`${key} = ${2 ** (32 - 1) - 1};\n`);
        break;
      case GenericName.Uint32:
        this.write(`${key} = ${2 ** 32 - 1};\n`);
        break;
      case GenericName.Uint16:
        this.write(`${key} = ${2 ** 16 - 1};\n`);
        break;
      case GenericName.Int16:
        this.write(`${key} = ${2 ** (16 - 1) - 1};\n`);
        break;
      case GenericName.Uint8:
        this.write(`${key} = ${2 ** 8 - 1};\n`);
        break;
      case GenericName.Int8:
        this.write(`${key} = ${2 ** (8 - 1) - 1};\n`);
        break;
      case GenericName.Boolean:
        this.write(`${key} = true;\n`);
        break;
      case GenericName.Float:
        this.write(`${key} = 0.12345678f;\n`);
        break;
      case GenericName.Double:
        this.write(`${key} = 0.1234567890;\n`);
        break;
    }
  }

  #generateTestForTemplateParam(
    metadataParamType: MetadataParamTypeTemplate,
    metadata: Metadata,
    param: IMetadataParam,
    key: string
  ) {
    switch (metadataParamType.template) {
      case 'optional':
        // this.#generateTestForParam(
        //   metadataParamType.value,
        //   metadata,
        //   param,
        //   `${key}.value`
        // );
        // this.write(
        //   `JSB_ASSERT(${getInitOptionalParameterFunctionName(
        //     metadata,
        //     param
        //   )}(&value, ${pointer(`${key}.value`)}) == JSB_OK);\n`
        // );
        // this.#generateTestForParam(
        //   metadataParamType.value,
        //   metadata,
        //   param,
        //   `${key}.value`
        // );
        this.write(
          `JSB_ASSERT(${getInitOptionalParameterFunctionName(
            metadata,
            param
          )}(&value, NULL) == JSB_OK);\n`
        );
        break;
      case 'tuple': {
        let tupleItemIndex = 0;
        for (const arg of metadataParamType.args) {
          this.#generateTestForParam(
            arg,
            metadata,
            param,
            `${key}.${getTuplePropertyName(tupleItemIndex)}`
          );
          tupleItemIndex++;
        }
        break;
      }
      default:
        throw new Exception('Not implemented');
    }
  }

  #resolverFromMetadata(root: Metadata) {
    const generator = this.#resolverByMetadataObject.get(root) ?? null;
    if (generator === null) {
      throw new Exception(`Failed to find a generator: ${root.name}`);
    }
    return generator;
  }

  #generateTestForTypeDefinition(
    metadataParamType:
      | IMetadataExternalTypeParamTypeDefinition
      | IMetadataInternalTypeParamTypeDefinition,
    root: Metadata,
    key: string
  ) {
    const generator = this.#resolverFromMetadata(root);
    const metadata =
      generator.resolveMetadataFromParamTypeDefinition(metadataParamType);
    if (!('params' in metadata)) {
      throw new Exception('Metadata is not a type or call');
    }
    for (const param of metadata.params) {
      this.#generateTestForParam(
        param.type,
        metadata,
        param,
        `${key}.${param.name}`
      );
    }
  }

  #generateTestForParam(
    metadataParamType: MetadataParamType,
    root: Metadata,
    param: IMetadataParam,
    key: string
  ) {
    switch (metadataParamType.type) {
      case 'generic':
        this.#generateTestForGenericParam(metadataParamType, root, key);
        break;
      case 'template':
        this.#generateTestForTemplateParam(metadataParamType, root, param, key);
        break;
      case 'internalType':
      case 'externalType': {
        const generator = this.#resolverFromMetadata(root);
        const resolvedMetadata =
          generator.resolveMetadataFromParamTypeDefinition(metadataParamType);
        if (resolvedMetadata.kind === 'trait') {
          console.error(
            'Ignoring test-cases for trait: %s',
            resolvedMetadata.name
          );
          break;
        }
        this.#generateTestForTypeDefinition(
          metadataParamType,
          resolvedMetadata,
          key
        );
        break;
      }
      case 'externalModuleType':
        throw new Exception('Not implemented');
    }
  }
}
