import CodeStream from 'textstreamjs';
import { IGeneratedFile } from '../../core/File';
import { IFileMetadata } from '../../parser/Parser';
import {
  getMetadataCompleteTypeReference,
  getMetadataPrefix,
  getTuplePropertyName
} from './utilities';
import GenericName from '../../parser/types/GenericName';
import {
  IMetadataExternalTypeParamTypeDefinition,
  IMetadataInternalTypeParamTypeDefinition,
  IMetadataParamTypeGeneric,
  IMetadataTraitDefinition,
  Metadata,
  MetadataParamType,
  MetadataParamTypeTemplate
} from '../../parser/types/metadata';
import Exception from '../../../exception/Exception';
import MetadataFileCCodeGenerator from './MetadataFileCCodeGenerator';

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
    this.write('#include <stdio.h>\n');
    this.write('#include <assert.h>\n');
    this.write('#include <stdlib.h>\n');
    this.write('#include <string.h>\n');
    this.write('#include <jsb/serializer.h>\n');
    this.write('#include <jsb/deserializer.h>\n');
    this.write('\n');
    for (const file of this.#files) {
      if (file.path.endsWith('.h')) {
        this.write(`#include "${file.path}"\n`);
      }
    }
    this.write('\n');
    this.write('#define JSB_ASSERT(expr) \\\n');
    this.indentBlock(() => {
      this.write(
        'if((expr)) {} else { \\\n',
        () => {
          this.write(
            'fprintf(stderr, "%s:%d: Assertion failed: %s\\n", __FILE__, __LINE__, #expr); \\\n'
          );
          this.write('return 1; \\\n');
        },
        '}\n'
      );
    });
    this.write('\n');
    this.write('int main() {\n');
    this.indentBlock(() => {
      this.write('struct jsb_serializer_t s;\n');
      this.write('struct jsb_deserializer_t d;\n');
      this.write(
        'JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);\n'
      );
      // It should return JSB_BAD_ARGUMENT if s is NULL
      this.write(
        'JSB_ASSERT(jsb_serializer_init(NULL, JSB_SERIALIZER_BUFFER_SIZE) == JSB_BAD_ARGUMENT);\n'
      );
      this.write('\n');
      this.write('\n');
      this.write(
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
          const typeNames = [
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
          for (const typeName of typeNames) {
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
      this.write(
        '#endif // defined(JSB_SERIALIZER_BUFFER_SIZE) && !defined(JSB_SERIALIZER_USE_MALLOC)\n'
      );
      this.write('\n');
      this.write('\n');
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

                      this.write(
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
                        },
                        '} while(status != JSB_BUFFER_OVERFLOW);\n'
                      );
                      this.write(
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

                  this.write('\n');

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
                          `memset(&new_value, 0, sizeof(${getMetadataCompleteTypeReference(
                            metadata
                          )}));\n`
                        );
                        this.write(
                          `memset(&value, 0, sizeof(${getMetadataCompleteTypeReference(
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
                          `printf("Test passed for ${param.name} ✔\\n");\n`
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
      this.write('\n');
      this.write('jsb_serializer_free(&s);\n');
      this.write('return 0;\n');
    });
    this.write('}\n');
    this.#files.push({
      path: 'test.c',
      contents: this.value()
    });
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
                this.write(
                  'JSB_ASSERT(jsb_serializer_init(&s, JSB_SERIALIZER_BUFFER_SIZE) == JSB_OK);\n'
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
            this.write(`strcpy((char*)${key}, (const char *) bytes);\n`);
          },
          '}\n'
        );
        break;
      case GenericName.NullTerminatedString:
      case GenericName.String:
        this.write(`strcpy((char*)${key}, "Test string");\n`);
        break;
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
    key: string
  ) {
    switch (metadataParamType.template) {
      case 'tuple': {
        let tupleItemIndex = 0;
        for (const arg of metadataParamType.args) {
          this.#generateTestForParam(
            arg,
            metadata,
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
      this.#generateTestForParam(param.type, metadata, `${key}.${param.name}`);
    }
  }

  #generateTestForParam(
    metadataParamType: MetadataParamType,
    root: Metadata,
    key: string
  ) {
    switch (metadataParamType.type) {
      case 'generic':
        this.#generateTestForGenericParam(metadataParamType, root, key);
        break;
      case 'template':
        this.#generateTestForTemplateParam(metadataParamType, root, key);
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
