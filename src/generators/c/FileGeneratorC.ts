/**
 * This file contains the implementation of the FileGeneratorC class,
 * which is responsible for generating C99 files based on file metadata.
 *
 * It also includes helper functions for manipulating metadata, and
 * generating header guards.
 */
import CodeStream from 'textstreamjs';
import { IFileMetadata } from '../../parser/Parser';
import {
  MetadataParamTypeTemplate,
  MetadataParamType,
  Metadata,
  IMetadataParam,
  IMetadataTypeDefinition,
  IMetadataParamTypeGeneric,
  MetadataParamTypeDefinition,
  IMetadataTraitDefinition,
  IMetadataParamTypeTupleTemplate,
  IMetadataExternalTypeParamTypeDefinition,
  IMetadataInternalTypeParamTypeDefinition
} from '../../parser/types/metadata';
import GenericName from '../../parser/types/GenericName';
import Exception from '../../../exception/Exception';
import path from 'path';
import { IGeneratedFile } from '../../core/File';
import snakeCase from '../../utilities/string/snakeCase';

function getTuplePropertyName(tupleItemIndex: number) {
  return `item_${tupleItemIndex}`;
}

function getTupleStructName(parent: Metadata) {
  return `${metadataGlobalNameToNamespace(parent)}_tuple_t`;
}

function getTupleStructTypeReference(parent: Metadata) {
  return `struct ${getTupleStructName(parent)}`;
}

function getTraitUnionNodePropertyName(traitNode: Metadata) {
  return snakeCase(traitNode.globalName);
}

// Converts jsb_xx_t to xx
function jsbTypeToCodecSuffix(value: string) {
  return value.replace(/^jsb_/, '').replace(/_t$/, '');
}

function metadataToRelativePath(metadata: Metadata) {
  const transformedPath = metadata.globalName
    .split('.')
    .map((slice) => snakeCase(slice))
    .join('/');
  switch (metadata.kind) {
    case 'call':
    case 'type':
      return transformedPath;
    case 'trait':
      return `${transformedPath}_trait`;
  }
}

function getHeaderGuard(value: string) {
  if (/^[0-9]/.test(value)) {
    throw new Exception('Header guard cannot start with a number');
  }
  return value
    .toUpperCase()
    .replace(/\//g, '_')
    .replace(/\./g, '_')
    .replace(/[^_A-Z0-9]/g, '_');
}

function metadataGlobalNameToNamespace(
  metadata: Metadata,
  limit: number | null = null
) {
  let slices = metadata.globalName.split('.');
  if (limit !== null) {
    slices = slices.slice(0, limit);
  }

  return snakeCase(slices.join('_'));
}

export interface IFileGeneratorCOptions {
  /**
   * Absolute path of the root directory of the schema
   * source files.
   */
  root: FileGeneratorC | null;
  current: IFileMetadata | null;
  /**
   * Absolute path of the root directory of the schema
   * source files.
   */
  rootDir: string;
  /**
   * CMake configuration
   */
  cmake: {
    project: string;
  };
}

export default class FileGeneratorC extends CodeStream {
  readonly #fileMetadataList;
  readonly #generators;
  readonly #current;
  readonly #rootDir;
  readonly #root;
  readonly #files: IGeneratedFile[] = [];
  readonly #cmake;
  readonly #options: {
    sourceFileExtension: string;
  } = {
    sourceFileExtension: 'c'
  };
  public constructor(
    fileMetadataList: ReadonlyArray<IFileMetadata>,
    { current = null, root = null, cmake, rootDir }: IFileGeneratorCOptions
  ) {
    super(root ? root : undefined);
    this.#root = root;
    this.#cmake = cmake ?? {
      project: 'schema'
    };
    this.#generators = new Map<string, FileGeneratorC>();
    this.#current = current;
    this.#rootDir = rootDir;
    this.#fileMetadataList = new Map<string, IFileMetadata>(
      fileMetadataList.map(
        (fileMetadata) => [fileMetadata.path, fileMetadata] as const
      )
    );
  }

  public generate() {
    const fileMetadata = this.#current;
    if (fileMetadata === null) {
      for (const [path, fileMetadata] of this.#fileMetadataList) {
        if (this.#generators.has(path)) {
          throw new Exception('Generator already exists');
        }
        this.#generators.set(
          path,
          new FileGeneratorC(Array.from(this.#fileMetadataList.values()), {
            current: fileMetadata,
            root: this,
            rootDir: this.#rootDir,
            cmake: this.#cmake
          })
        );
      }
      for (const generator of this.#generators.values()) {
        generator.generate();
        this.#files.push(...generator.#files);
      }
      this.#generateCMakeListsFile();
      this.#generateTestFile();
      return this.#files;
    }
    for (const metadata of fileMetadata.metadata) {
      switch (metadata.kind) {
        case 'call':
        case 'type':
          this.#generateHeaderFile(metadata);
          this.#generateSourceFile(metadata);
          break;
        case 'trait':
          this.#generateTraitFileHeaderFile(metadata);
          this.#generateTraitFileSourceFile(metadata);
      }
    }
    return null;
  }

  // Generate a test.c file based on the metadata, calling `_encode` and `_decode` functions. Create the serializer and deserializer once
  #generateTestFile() {
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
      for (const fileMetadata of this.#fileMetadataList.values()) {
        for (const metadata of fileMetadata.metadata) {
          if (metadata.kind === 'trait') {
            continue;
          }
          this.write(
            '{\n',
            () => {
              this.write(
                `${getMetadataCompleteTypeReference(metadata)} value;\n`
              );
              this.write('JSB_ASSERT(jsb_serializer_rewind(&s) == JSB_OK);\n');
              switch (metadata.kind) {
                case 'type':
                case 'call':
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
                        const generator =
                          this.#generators.get(fileMetadata.path) ?? null;
                        if (generator === null) {
                          throw new Exception(
                            `Failed to find a generator: ${fileMetadata.path}`
                          );
                        }
                        generator.#generateTestForParam(
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
                // case 'trait': {
                //   for(const node of metadata.nodes) {
                //     switch(node.type){
                //       case 'internalType':
                //       case 'externalType': {
                //         const metadata = this.#resolveMetadataFromDefinitionReference(node);
                //         this.write(
                //           `JSB_ASSERT(${getMetadataPrefix(metadata)}_init(&value, ${
                //             metadata
                //           }) == JSB_OK);\n`
                //         );
                //         writeCodecRoutine();
                //         break;
                //       }
                //     }
                //   }
                //   const enumTrait = this.#getTraitEnumInformation(metadata);
                //   for (const enumItem of enumTrait.items) {
                //     this.write(
                //       `JSB_ASSERT(${getMetadataPrefix(metadata)}_init(&value, ${
                //         enumItem[1].name
                //       }) == JSB_OK);\n`
                //     );
                //     writeCodecRoutine();
                //   }
                // }
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

  #generateTestForTypeDefinition(
    metadataParamType:
      | IMetadataExternalTypeParamTypeDefinition
      | IMetadataInternalTypeParamTypeDefinition,
    _: Metadata,
    key: string
  ) {
    const metadata =
      this.#resolveMetadataFromDefinitionReference(metadataParamType);
    if (!('params' in metadata)) {
      throw new Exception('Metadata is not a type or call');
    }
    for (const param of metadata.params) {
      this.#generateTestForParam(param.type, metadata, `${key}.${param.name}`);
    }
  }

  #generateTestForParam(
    metadataParamType: MetadataParamType,
    metadata: Metadata,
    key: string
  ) {
    switch (metadataParamType.type) {
      case 'generic':
        this.#generateTestForGenericParam(metadataParamType, metadata, key);
        break;
      case 'template':
        this.#generateTestForTemplateParam(metadataParamType, metadata, key);
        break;
      case 'internalType':
      case 'externalType': {
        const resolvedMetadata =
          this.#resolveMetadataFromDefinitionReference(metadataParamType);
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

  #getTraitEnumInformation(metadata: IMetadataTraitDefinition) {
    const name = `${metadataGlobalNameToNamespace(metadata)}_type_t`;

    const enumItems = new Map<
      MetadataParamType,
      {
        name: string;
        // 32-bit CRC of the definition
        value: number;
        metadata: IMetadataTypeDefinition;
      }
    >();

    for (const param of metadata.nodes) {
      if (param.type !== 'internalType' && param.type !== 'externalType') {
        throw new Exception(
          'Only internal and external types are allowed in traits'
        );
      }
      const node = this.#resolveMetadataFromDefinitionReference(param);
      if (node.kind === 'trait') {
        throw new Exception(
          'Currently it is not possible for a trait to import another'
        );
      }
      const enumItemName = `${getTraitUnionNodePropertyName(
        this.#resolveMetadataFromDefinitionReference(param)
      )}_type`.toUpperCase();
      enumItems.set(param, {
        value: node.id,
        name: enumItemName,
        metadata: node
      });
    }

    return {
      /**
       * Trait enum name
       */
      name,
      /**
       * Trait enum item names per param type
       */
      items: enumItems
    };
  }

  #generateTraitFileSourceFile(metadata: IMetadataTraitDefinition) {
    this.write(`#include "${metadataToRelativePath(metadata)}.h"\n`);

    this.write('\n');

    const completeTypeReference = getMetadataCompleteTypeReference(metadata);

    this.write(
      `enum jsb_result_t ${getMetadataPrefix(
        metadata
      )}_encode(const ${completeTypeReference}* input, struct jsb_serializer_t* s) {\n`,
      () => {
        this.write(
          'switch(input->type) {\n',
          () => {
            const enumTrait = this.#getTraitEnumInformation(metadata);
            for (const [, item] of enumTrait.items) {
              const encodeKey = `&input->value.${getTraitUnionNodePropertyName(
                item.metadata
              )}`;
              this.write(`case ${item.name}:\n`);
              this.indentBlock(() => {
                this.write(
                  `JSB_CHECK_ERROR(${metadataGlobalNameToNamespace(
                    item.metadata
                  )}_encode(${encodeKey},s));\n`
                );
                this.write('break;\n');
              });
            }
            this.write('default:\n');
            this.indentBlock(() => {
              this.write('return JSB_INVALID_CRC_HEADER;\n');
            });
          },
          '}\n'
        );
        this.write('return JSB_OK;\n');
      },
      '}\n'
    );
    this.write('\n');
    this.write(
      `enum jsb_result_t ${getMetadataPrefix(
        metadata
      )}_decode(struct jsb_deserializer_t* d, ${completeTypeReference}* output) {\n`,
      () => {
        this.write('jsb_int32_t header;\n');
        this.write(
          'JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));\n'
        );
        // Go back 4 bytes in order to allow the next type/call decoder to read the header
        this.write('JSB_CHECK_ERROR(jsb_deserializer_rewind(d, 4));\n');
        this.write(
          'switch(header) {\n',
          () => {
            const enumTrait = this.#getTraitEnumInformation(metadata);
            for (const [, item] of enumTrait.items) {
              const outputKey = `&output->value.${getTraitUnionNodePropertyName(
                item.metadata
              )}`;
              this.write(`case ${item.value}:\n`);
              this.indentBlock(() => {
                this.write(
                  `JSB_CHECK_ERROR(${getMetadataPrefix(
                    item.metadata
                  )}_decode(d, ${outputKey}));\n`
                );
                this.write('break;\n');
              });
            }
            this.write('default:\n');
            this.indentBlock(() => {
              this.write('return JSB_INVALID_CRC_HEADER;\n');
            });
          },
          '}\n'
        );
        this.write('return JSB_OK;\n');
      },
      '}\n'
    );
    this.write('\n');
    const traitEnum = this.#getTraitEnumInformation(metadata);
    this.write(
      `enum jsb_result_t ${getMetadataPrefix(
        metadata
      )}_init(${completeTypeReference}* input, enum ${
        traitEnum.name
      } type) {\n`,
      () => {
        this.write(
          'switch(type) {\n',
          () => {
            for (const [, item] of traitEnum.items) {
              this.write(`case ${item.name}:\n`);
              this.indentBlock(() => {
                this.write(`input->type = ${item.name};\n`);
                this.write(
                  `return ${getMetadataPrefix(
                    item.metadata
                  )}_init(&input->value.${getTraitUnionNodePropertyName(
                    item.metadata
                  )});\n`
                );
              });
            }
            this.write('default:\n');
            this.indentBlock(() => {
              this.write('return JSB_INVALID_CRC_HEADER;\n');
            });
          },
          '}\n'
        );
        this.write('return JSB_OK;\n');
      },
      '}\n'
    );
    this.write('\n');
    this.write(
      `void ${getMetadataPrefix(
        metadata
      )}_free(${completeTypeReference}* trait) {\n`,
      () => {
        this.write('if(trait == NULL) return;\n');
        this.write(
          'switch(trait->type) {\n',
          () => {
            for (const [, item] of traitEnum.items) {
              const key = `&trait->value.${getTraitUnionNodePropertyName(
                item.metadata
              )}`;
              this.write(`case ${item.name}:\n`);
              this.indentBlock(() => {
                this.write(
                  `${getMetadataPrefix(item.metadata)}_free(${key});\n`
                );
                this.write('break;\n');
              });
            }
            this.write('// Unrecognized `trait->type` value\n');
            this.write('default:\n');
            this.indentBlock(() => {
              this.write('break;\n');
            });
          },
          '}\n'
        );
      },
      '}\n'
    );
    this.write('\n');

    this.#files.push({
      path: `${metadataToRelativePath(metadata)}.${
        this.#options.sourceFileExtension
      }`,
      contents: this.value()
    });
  }

  #generateTraitFileHeaderFile(metadata: IMetadataTraitDefinition) {
    const headerGuard = getHeaderGuard(
      `jsb-${metadataToRelativePath(metadata)}-h`
    );

    this.write(`#ifndef ${headerGuard}\n`);
    this.write(`#define ${headerGuard}\n\n`);

    this.write('\n');

    this.write('#ifdef __cplusplus\n');
    this.write('extern "C" {\n');
    this.write('#endif // __cplusplus\n');

    this.write('\n');

    this.#includeMetadataDependenciesOnHeaderFile(metadata);
    this.write('\n');

    this.write('#include <stdbool.h>\n');
    this.write('#include <jsb/serializer.h>\n');
    this.write('#include <jsb/deserializer.h>\n');
    this.write('\n');

    const traitEnum = this.#getTraitEnumInformation(metadata);

    this.write(
      `enum ${traitEnum.name} {\n`,
      () => {
        for (const [, item] of traitEnum.items) {
          this.write(`${item.name} = ${item.value},\n`);
        }
      },
      '};\n'
    );

    this.write('\n');

    this.write(
      `union ${getMetadataPrefix(metadata)}_value_t {\n`,
      () => {
        for (const param of metadata.nodes) {
          if (param.type !== 'internalType' && param.type !== 'externalType') {
            throw new Exception(
              'Only internal and external types are allowed in traits'
            );
          }
          this.write(
            `${this.#metadataParamTypeToString(
              param,
              metadata
            )} ${getTraitUnionNodePropertyName(
              this.#resolveMetadataFromDefinitionReference(param)
            )};\n`
          );
        }
      },
      '};\n'
    );

    this.write('\n');

    this.write(
      `${getMetadataCompleteTypeReference(metadata)} {\n`,
      () => {
        this.write(
          `enum ${metadataGlobalNameToNamespace(metadata)}_type_t type;\n`
        );
        this.write(`union ${getMetadataPrefix(metadata)}_value_t value;\n`);
      },
      '};\n'
    );

    this.write('\n');

    const completeTypeReference = getMetadataCompleteTypeReference(metadata);

    this.write(
      `enum jsb_result_t ${getMetadataPrefix(
        metadata
      )}_encode(const ${completeTypeReference}* input, struct jsb_serializer_t* s);\n`
    );
    this.write(
      `void ${getMetadataPrefix(
        metadata
      )}_free(${completeTypeReference}* input);\n`
    );
    this.write(
      `enum jsb_result_t ${getMetadataPrefix(
        metadata
      )}_init(${completeTypeReference}* input,enum ${traitEnum.name});\n`
    );
    this.write(
      `enum jsb_result_t ${getMetadataPrefix(
        metadata
      )}_decode(struct jsb_deserializer_t* d, ${completeTypeReference}* result);\n`
    );

    this.write('#ifdef __cplusplus\n');
    this.write('}\n');
    this.write('#endif // __cplusplus\n');

    this.write(`#endif // ${headerGuard}\n`);

    this.write('\n');

    this.#files.push({
      path: `${metadataToRelativePath(metadata)}.h`,
      contents: this.value()
    });
  }

  #generateCMakeListsFile() {
    if (!this.#files.length) {
      throw new Exception('No files to generate CMakeLists.txt from');
    }

    this.write('cmake_minimum_required(VERSION 3.5)\n');
    this.write(`project(${this.#cmake.project} C ASM)\n`);
    this.write('set(CMAKE_C_STANDARD 99)\n');
    this.write('set(CMAKE_C_STANDARD_REQUIRED ON)\n');
    this.write(
      'add_library(\n',
      () => {
        this.write(`${this.#cmake.project} STATIC\n`);
        let lineWidth = 0;
        this.write('');
        const lastFile = this.#files[this.#files.length - 1];
        for (const file of this.#files) {
          const line = `${file.path}`;
          const isLastFile = file === lastFile;
          this.append(line);
          if (lineWidth + line.length > 80 || isLastFile) {
            this.append('\n');
            lineWidth = 0;
            if (!isLastFile) {
              this.write('');
            }
          } else {
            this.append(' ');
            lineWidth += line.length;
          }
        }
      },
      ')\n'
    );
    this.write(
      'target_link_libraries(\n',
      () => {
        this.write(`${this.#cmake.project}\n`);
        this.write('PUBLIC\n');
        this.write('jsb_c_static\n');
      },
      ')\n'
    );
    this.write(
      'target_compile_options(\n',
      () => {
        this.write(`${this.#cmake.project}\n`);
        this.write('PRIVATE\n');
        this.write('-Wall\n');
        this.write('-Wextra\n');
        this.write('-Werror\n');
        this.write('-pedantic\n');
      },
      ')\n'
    );
    this.write(
      'target_include_directories(\n',
      () => {
        this.write(`${this.#cmake.project}\n`);
        this.write('PUBLIC\n');
        this.write('${CMAKE_CURRENT_SOURCE_DIR}\n');
      },
      ')\n'
    );
    this.write('\n');
    this.write(`add_executable(${this.#cmake.project}_test test.c)\n`);
    this.write(
      'target_compile_options(\n',
      () => {
        this.write(`${this.#cmake.project}_test\n`);
        this.write('PRIVATE\n');
        this.write('-Wall\n');
        this.write('-Wextra\n');
        this.write('-Werror\n');
        this.write('-pedantic\n');
      },
      ')\n'
    );
    this.write(
      `target_link_libraries(${this.#cmake.project}_test PRIVATE ${
        this.#cmake.project
      })\n`
    );
    this.#files.push({
      path: 'CMakeLists.txt',
      contents: this.value()
    });
  }

  #deserializeParamTypeGeneric(
    paramType: IMetadataParamTypeGeneric,
    key: string
  ) {
    switch (paramType.value) {
      case GenericName.Bytes:
      case GenericName.String:
        this.write(
          '{\n',
          () => {
            this.write('jsb_uint32_t len;\n');
            this.write(
              'JSB_CHECK_ERROR(jsb_deserializer_read_uint32(d, &len));\n'
            );
            this.write(
              'if(len > JSB_MAX_STRING_SIZE) return JSB_BUFFER_OVERFLOW;\n'
            );
            this.write(
              `JSB_CHECK_ERROR(jsb_deserializer_read_buffer(d, len, ${key}));\n`
            );
            if (paramType.value === GenericName.String) {
              this.write(`${key}[len] = '\\0';\n`);
            }
          },
          '}\n'
        );
        break;
      case GenericName.Long:
      case GenericName.UnsignedLong:
      case GenericName.Integer:
      case GenericName.Int32:
      case GenericName.Uint32:
      case GenericName.Uint16:
      case GenericName.Int16:
      case GenericName.Uint8:
      case GenericName.Int8:
        this.write(
          `JSB_CHECK_ERROR(jsb_deserializer_read_${jsbTypeToCodecSuffix(
            this.#genericNameToString(paramType.value)
          )}(d, &${key}));\n`
        );
        break;
      case GenericName.Boolean:
        this.write(
          '{\n',
          () => {
            this.write('jsb_uint8_t value;\n');
            this.write(
              'JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &value));\n'
            );
            this.write(
              'if(value != 1 && value != 0) return JSB_INVALID_DECODED_VALUE;\n'
            );
            this.write(`${key} = value == 1 ? true : false;\n`);
          },
          '}\n'
        );
        break;
      case GenericName.Float:
        this.write(
          `JSB_CHECK_ERROR(jsb_deserializer_read_float(d, &${key}));\n`
        );
        break;
      case GenericName.Double:
        this.write(
          `JSB_CHECK_ERROR(jsb_deserializer_read_double(d, &${key}));\n`
        );
        break;
      case GenericName.NullTerminatedString:
        throw new Exception('Not implemented');
        break;
    }
  }

  #deserializeParamTypeTemplate(
    paramType: MetadataParamTypeTemplate,
    key: string
  ) {
    switch (paramType.template) {
      // case 'optional':
      //   this.write(
      //     'if(d.read<std::uint8_t>() != 0) {\n',
      //     () => {
      //       this.write(
      //         `${key} = std::make_optional<${this.#metadataParamTypeToString(
      //           paramType.value
      //         )}>();\n`
      //       );
      //       this.#deserializeParamType(paramType.value, key);
      //     },
      //     '}\n'
      //   );
      //   break;
      case 'optional':
        this.write(
          `if(${key} != NULL) {\n`,
          () => {
            this.#deserializeParamType(paramType.value, `*${key}`);
          },
          '}\n'
        );
        break;
      case 'tuple': {
        let tupleItemIndex = 0;
        for (const arg of paramType.args) {
          this.#deserializeParamType(
            arg,
            `${key}.${getTuplePropertyName(tupleItemIndex)}`
          );
          tupleItemIndex++;
        }
        break;
      }
      default:
        // case 'vector':
        // case 'set':
        //   this.write(
        //     '{\n',
        //     () => {
        //       this.write(
        //         'const auto len = jsb_deserializer_read_uint32(d, &len);\n'
        //       );
        //       this.write(`${key}.reserve(len);\n`);
        //       this.write(
        //         'for (std::uint32_t i = 0; i < len; i++) {\n',
        //         () => {
        //           this.#deserializeParamType(paramType.value, `${key}[i]`);
        //         },
        //         '}\n'
        //       );
        //     },
        //     '}\n'
        //   );
        //   break;
        // case 'map':
        // case 'bigint':
        throw new Exception('Not implemented');
    }
  }

  // #getParamTypeGenerator(paramType: MetadataParamTypeDefinition) {
  //   switch(paramType.type) {
  //     case 'externalType':
  //       return this.#resolveRelativeImportPath(paramType.relativePath);
  //     case 'internalType':
  //       return this;
  //   }
  // }

  #resolveMetadataFromDefinitionReference(
    paramType: MetadataParamTypeDefinition
  ): Metadata {
    let generator: FileGeneratorC;
    let identifier: string;
    switch (paramType.type) {
      case 'internalType':
        identifier = paramType.interfaceName;
        generator = this;
        break;
      case 'externalType':
        identifier = paramType.name;
        generator = this.#resolveRelativeImportPath(paramType.relativePath);
        break;
    }
    if (generator.#current === null) {
      throw new Exception('External type not found');
    }
    const metadata =
      generator.#current.metadata.find(
        (metadata) => metadata.name === identifier
      ) ?? null;
    if (metadata === null) {
      throw new Exception('External type not found');
    }
    // if (metadata.kind === 'trait') {
    //   throw new Exception('Trait is not supported yet');
    // }
    return metadata;
  }

  #deserializeParamType(paramType: MetadataParamType, key: string) {
    switch (paramType.type) {
      case 'generic':
        this.#deserializeParamTypeGeneric(paramType, key);
        break;
      case 'template':
        this.#deserializeParamTypeTemplate(paramType, key);
        break;
      case 'externalType':
      case 'internalType': {
        const metadata =
          this.#resolveMetadataFromDefinitionReference(paramType);
        this.write(
          `JSB_CHECK_ERROR(${getMetadataPrefix(metadata)}_decode(d, ${pointer(
            key
          )}));\n`
        );
        break;
      }
      case 'externalModuleType':
        break;
    }
  }

  #generateSourceFile(metadata: IMetadataTypeDefinition) {
    this.write(`#include "${metadataToRelativePath(metadata)}.h"\n`);
    this.write('\n');
    const completeTypeReference = getMetadataCompleteTypeReference(metadata);
    this.write(
      `enum jsb_result_t ${metadataGlobalNameToNamespace(
        metadata
      )}_decode(struct jsb_deserializer_t* d, ${completeTypeReference}* result) {\n`,
      () => {
        this.write(
          '{\n',
          () => {
            this.write('jsb_int32_t header;\n');
            this.write(
              'JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));\n'
            );
            this.write(
              `if(header != ${metadata.id.toString()}) {\n`,
              () => {
                this.write('return JSB_INVALID_CRC_HEADER;\n');
              },
              '}\n'
            );
          },
          '}\n'
        );
        for (const param of metadata.params) {
          this.#deserializeParamType(param.type, `result->${param.name}`);
        }
        this.write('return JSB_OK;\n');
      },
      '}\n'
    );
    this.write('\n');
    this.write(
      `enum jsb_result_t ${getMetadataPrefix(
        metadata
      )}_encode(const ${completeTypeReference}* input, struct jsb_serializer_t* s) {\n`
    );
    this.indentBlock(() => {
      this.write(
        `JSB_CHECK_ERROR(jsb_serializer_write_int32(s, ${metadata.id.toString()}));\n`
      );
      for (const param of metadata.params) {
        this.#serializeParamType(param.type, `input->${param.name}`);
      }
      this.write('return JSB_OK;\n');
    });
    this.write('}\n');

    this.write('\n');

    this.write(
      `enum jsb_result_t ${getMetadataPrefix(
        metadata
      )}_init(${completeTypeReference}* value) {\n`
    );
    this.indentBlock(() => {
      this.write('if(value == NULL) return JSB_BAD_ARGUMENT;\n');
    });
    // this.write('#ifdef JSB_SCHEMA_USE_MALLOC\n');
    // this.indentBlock(() => {
    //   this.write(`memset(value, 0, sizeof(${completeTypeReference}));\n`);
    // });
    // this.write('#else\n');
    // this.indentBlock(() => {
    //   for (const param of metadata.params) {
    //     this.#initializeMetadataParam(param.type, `value->${param.name}`);
    //   }
    // });
    // this.write('#endif // JSB_SCHEMA_USE_MALLOC\n');

    this.indentBlock(() => {
      for (const param of metadata.params) {
        this.#initializeMetadataParam(param.type, `value->${param.name}`);
      }
      this.write('return JSB_OK;\n');
    });
    this.write('}\n');
    this.write('\n');
    this.write(
      `void ${getMetadataPrefix(
        metadata
      )}_free(${completeTypeReference}* s) {\n`,
      () => {
        this.write('if(s == NULL) return;\n');
        // Ignore unused variable warning
        this.write('(void)s;\n');
      },
      '}\n'
    );
    this.write('\n');

    this.#files.push({
      path: `${metadataToRelativePath(metadata)}.${
        this.#options.sourceFileExtension
      }`,
      contents: this.value()
    });
  }

  #initializeMetadataParamGeneric(
    paramType: IMetadataParamTypeGeneric,
    key: string
  ) {
    switch (paramType.value) {
      case GenericName.Long:
      case GenericName.UnsignedLong:
      case GenericName.Integer:
      case GenericName.Int32:
      case GenericName.Uint32:
      case GenericName.Uint16:
      case GenericName.Int16:
      case GenericName.Uint8:
      case GenericName.Int8:
        this.write(`${key} = 0;\n`);
        break;
      case GenericName.Boolean:
        this.write(`${key} = false;\n`);
        break;
      case GenericName.Float:
        this.write(`${key} = 0.0f;\n`);
        break;
      case GenericName.Double:
        this.write(`${key} = 0.0;\n`);
        break;
      case GenericName.NullTerminatedString:
      case GenericName.Bytes:
      case GenericName.String:
        this.write('// Initialize string\n');
        this.write(`${key}[0] = '\\0';\n`);
        break;
    }
  }

  #initializeMetadataParamTemplate(
    paramType: MetadataParamTypeTemplate,
    key: string
  ) {
    switch (paramType.template) {
      case 'tuple': {
        let tupleItemIndex = 0;
        for (const arg of paramType.args) {
          this.#initializeMetadataParam(
            arg,
            `${key}.${getTuplePropertyName(tupleItemIndex)}`
          );
          tupleItemIndex++;
        }
        break;
      }
      // case 'optional':
      //   this.write(`${key} = NULL;\n`);
      //   break;
      // case 'vector':
      // case 'set':
      //   this.write(`${key}.clear();\n`);
      //   break;
      // case 'map':
      // case 'bigint':
      default:
        throw new Exception('Not implemented');
    }
  }

  #initializeMetadataParam(paramType: MetadataParamType, key: string) {
    switch (paramType.type) {
      case 'generic':
        this.#initializeMetadataParamGeneric(paramType, key);
        break;
      case 'template':
        this.#initializeMetadataParamTemplate(paramType, key);
        break;
      case 'internalType':
      case 'externalType': {
        const metadata =
          this.#resolveMetadataFromDefinitionReference(paramType);

        switch (metadata.kind) {
          case 'type':
          case 'call':
            this.write(
              `JSB_CHECK_ERROR(${getMetadataPrefix(metadata)}_init(${pointer(
                key
              )}));\n`
            );
            break;
          case 'trait': {
            const traitEnum = this.#getTraitEnumInformation(metadata);
            const node = Array.from(traitEnum.items)[0];
            if (!node) {
              throw new Exception(`Trait ${metadata.globalName} has no nodes`);
            }
            this.write(
              `JSB_CHECK_ERROR(${getMetadataPrefix(metadata)}_init(${pointer(
                key
              )}, ${node[1].name}));\n`
            );
          }
        }
        break;
      }
      case 'externalModuleType':
        throw new Exception(
          'External modules are not supported by the C generator'
        );
    }
  }

  #serializeParamTypeTemplate(
    paramType: MetadataParamTypeTemplate,
    key: string
  ) {
    switch (paramType.template) {
      // case 'vector':
      // case 'set':
      //   this.write(`s.write<std::uint32_t>(${key}.size());\n`);
      //   this.write(
      //     `for (const auto& item : ${key}) {\n`,
      //     () => {
      //       this.#serializeParamType(paramType.value, 'item');
      //     },
      //     '}\n'
      //   );
      //   break;
      case 'tuple': {
        let tupleItemIndex = 0;
        for (const arg of paramType.args) {
          this.#serializeParamType(arg, `${key}.item_${tupleItemIndex}`);
          tupleItemIndex++;
        }
        break;
      }
      case 'optional':
        this.write(
          `if(${key} != NULL) {\n`,
          () => {
            this.#serializeParamType(paramType.value, `*${key}`);
          },
          '}\n'
        );
        // this.#resolveMetadataFromDefinitionReference(paramType.value);
        // this.write(`s.write<std::uint8_t>(${key}.has_value() ? 1 : 0);\n`);
        // this.write(
        //   `if (${key}.has_value()) {\n`,
        //   () => {
        //     this.#serializeParamType(paramType.value, `${key}.value()`);
        //   },
        //   '}\n'
        // );
        break;
      // case 'map':
      // case 'bigint':
      default:
        throw new Exception('Not implemented');
    }
  }

  #serializeParamType(paramType: MetadataParamType, key: string) {
    switch (paramType.type) {
      case 'generic':
        this.#serializeParamTypeGeneric(paramType, key);
        break;
      case 'template':
        this.#serializeParamTypeTemplate(paramType, key);
        break;
      case 'internalType':
      case 'externalType': {
        // this.write(`${key}.encode(s);\n`);
        this.write(
          `JSB_CHECK_ERROR(${getMetadataPrefix(
            this.#resolveMetadataFromDefinitionReference(paramType)
          )}_encode(${pointer(key)}, s));\n`
        );
        break;
      }
      case 'externalModuleType':
        throw new Exception('Not implemented');
    }
  }

  #serializeParamTypeGeneric(
    paramType: IMetadataParamTypeGeneric,
    key: string
  ) {
    switch (paramType.value) {
      case GenericName.Bytes:
      case GenericName.String:
        this.write(
          '{\n',
          () => {
            this.write('// Length of the buffer\n');
            this.write(`const jsb_uint32_t len = jsb_strlen(${key});\n`);
            this.write(
              'JSB_CHECK_ERROR(jsb_serializer_write_uint32(s, len));\n'
            );
            this.write(
              `JSB_CHECK_ERROR(jsb_serializer_write_buffer(s, ${key}, len));\n`
            );
          },
          '}\n'
        );
        break;
      case GenericName.Long:
        this.write(`JSB_CHECK_ERROR(jsb_serializer_write_int64(s, ${key}));\n`);
        break;
      case GenericName.UnsignedLong:
        this.write(
          `JSB_CHECK_ERROR(jsb_serializer_write_uint64(s, ${key}));\n`
        );
        break;
      case GenericName.Integer:
      case GenericName.Int32:
        this.write(`JSB_CHECK_ERROR(jsb_serializer_write_int32(s, ${key}));\n`);
        break;
      case GenericName.Uint32:
        this.write(
          `JSB_CHECK_ERROR(jsb_serializer_write_uint32(s, ${key}));\n`
        );
        break;
      case GenericName.Uint16:
        this.write(
          `JSB_CHECK_ERROR(jsb_serializer_write_uint16(s, ${key}));\n`
        );
        break;
      case GenericName.Int16:
        this.write(`JSB_CHECK_ERROR(jsb_serializer_write_int16(s, ${key}));\n`);
        break;
      case GenericName.Uint8:
        this.write(`JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, ${key}));\n`);
        break;
      case GenericName.Int8:
        this.write(`JSB_CHECK_ERROR(jsb_serializer_write_int8(s, ${key}));\n`);
        break;
      case GenericName.Boolean:
        this.write(
          `JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, ${key} ? 1 : 0));\n`
        );
        break;
      case GenericName.Float:
        this.write(`JSB_CHECK_ERROR(jsb_serializer_write_float(s, ${key}));\n`);
        break;
      case GenericName.Double:
        this.write(
          `JSB_CHECK_ERROR(jsb_serializer_write_double(s, ${key}));\n`
        );
        break;
      case GenericName.NullTerminatedString:
        throw new Exception(`Not implemented: ${paramType.value}`);
    }
  }

  #generateHeaderFile(metadata: IMetadataTypeDefinition) {
    const headerGuard = getHeaderGuard(
      `jsb-${metadataToRelativePath(metadata)}-h`
    );

    this.write(`#ifndef ${headerGuard}\n`);
    this.write(`#define ${headerGuard}\n\n`);
    this.write('\n');

    this.write('#ifdef __cplusplus\n');
    this.write('extern "C" {\n');
    this.write('#endif // __cplusplus\n');
    this.write('\n');

    this.#includeMetadataDependenciesOnHeaderFile(metadata);
    this.write('\n');

    this.write('#include <stdbool.h>\n');
    this.write('#include <jsb/serializer.h>\n');
    this.write('#include <jsb/deserializer.h>\n');
    this.write('\n');

    this.#generateStructFromMetadata(metadata);

    this.#generateTypeDefinitionStruct(metadata);

    const completeTypeReference = getMetadataCompleteTypeReference(metadata);
    this.write(
      `enum jsb_result_t ${getMetadataPrefix(
        metadata
      )}_decode(struct jsb_deserializer_t*, ${completeTypeReference}*);\n`
    );
    this.write(
      `enum jsb_result_t ${getMetadataPrefix(
        metadata
      )}_encode(const ${completeTypeReference}*, struct jsb_serializer_t*);\n`
    );

    this.write(
      `enum jsb_result_t ${getMetadataPrefix(
        metadata
      )}_init(${completeTypeReference}*);\n`
    );
    this.write(
      `void ${getMetadataPrefix(metadata)}_free(${completeTypeReference}*);\n`
    );

    this.write('#ifdef __cplusplus\n');
    this.write('}\n');
    this.write('#endif // __cplusplus\n');

    this.write('\n');

    // if (namespace) {
    //   this.append('\n');
    //   this.write(`} // ${metadataGlobalNameToNamespace(metadata, -1)}\n`);
    // }
    this.write(`#endif // ${headerGuard}\n`);

    this.#files.push({
      path: `${metadataToRelativePath(metadata)}.h`,
      contents: this.value()
    });
  }

  #generateStructFromMetadata(metadata: Metadata) {
    switch (metadata.kind) {
      case 'type':
      case 'call':
        for (const param of metadata.params) {
          this.#generateStructFromMetadataParamType(param.type, metadata);
        }
        break;
      case 'trait':
        break;
    }
  }

  #generateStructFromTupleTemplate(
    metadataParamType: IMetadataParamTypeTupleTemplate,
    parent: Metadata
  ) {
    this.write(`${getTupleStructTypeReference(parent)} {\n`);
    this.indentBlock(() => {
      for (let i = 0; i < metadataParamType.args.length; i++) {
        const arg = metadataParamType.args[i] ?? null;
        if (arg === null) {
          throw new Exception('Tuple argument is null');
        }
        this.write(
          `${this.#metadataParamTypeToString(arg, parent)} item_${i};\n`
        );
      }
    });
    this.write('};\n');
  }

  #generateStructFromMetadataParamTypeTemplate(
    metadataParamType: MetadataParamTypeTemplate,
    parent: Metadata
  ) {
    switch (metadataParamType.template) {
      case 'tuple':
        this.#generateStructFromTupleTemplate(metadataParamType, parent);
        break;
      case 'map':
        this.#generateStructFromMetadataParamType(
          metadataParamType.key,
          parent
        );
        this.#generateStructFromMetadataParamType(
          metadataParamType.value,
          parent
        );
        break;
      case 'bigint':
        throw new Exception('`bigint` is not implemented');
      case 'vector':
      case 'optional':
      case 'set':
        this.#generateStructFromMetadataParamType(
          metadataParamType.value,
          parent
        );
        break;
    }
  }

  #generateStructFromMetadataParamType(
    metadataParamType: MetadataParamType,
    parent: Metadata
  ) {
    switch (metadataParamType.type) {
      case 'generic':
        break;
      case 'template':
        this.#generateStructFromMetadataParamTypeTemplate(
          metadataParamType,
          parent
        );
        break;
      case 'internalType':
      case 'externalType': {
        this.#resolveMetadataFromDefinitionReference(metadataParamType);
        break;
      }
      case 'externalModuleType':
        break;
    }
  }

  #generateTypeDefinitionStruct(metadata: IMetadataTypeDefinition) {
    this.write(`${getMetadataCompleteTypeReference(metadata)} {\n`);
    this.indentBlock(() => {
      for (const param of metadata.params) {
        this.write(
          `${this.#metadataParamTypeToString(param.type, metadata)} ${
            param.name
          };\n`
        );
      }
    });
    this.write('};\n');
  }

  #includeMetadataDependenciesOnTypeFromParam(
    param: IMetadataParam,
    metadata: Metadata
  ) {
    this.#includeMetadataDependenciesFromType(param.type, metadata);
  }

  #includeMetadataDependenciesFromTemplateParamType(
    paramType: MetadataParamTypeTemplate,
    metadata: Metadata
  ) {
    switch (paramType.template) {
      case 'tuple':
        // this.write('#include <tuple>\n');
        for (const arg of paramType.args) {
          this.#includeMetadataDependenciesFromType(arg, metadata);
        }
        break;
      // case 'map':
      //   this.write('#include <unordered_map>\n');
      //   this.#includeMetadataDependenciesFromType(paramType.key, metadata);
      //   this.#includeMetadataDependenciesFromType(paramType.value, metadata);
      //   break;
      // case 'bigint':
      //   throw new Exception('`bigint` is not implemented');
      // case 'vector':
      // case 'optional':
      // case 'set':
      //   this.#includeMetadataDependenciesFromType(paramType.value, metadata);
      //   break;
      default:
        throw new Exception('Not implemented');
    }
    // switch (paramType.template) {
    //   case 'vector':
    //     this.write('#include <list>\n');
    //     break;
    //   case 'optional':
    //     this.write('#include <optional>\n');
    //     break;
    //   case 'set':
    //     this.write('#include <unordered_set>\n');
    //     break;
    // }
  }

  #fileMetadata() {
    if (this.#current === null) {
      throw new Exception('Main generator should not call this method');
    }
    return this.#current;
  }

  /**
   * Resolve a relative import path to a generator that holds the file metadata. We pass to this
   * method, the original import path that that was written by the user. This method will resolve
   * the relative path to an absolute path and then find the generator that holds the file metadata.
   * If the generator is not found, it will throw an exception.
   * @param value Relative import path to a schema file
   * @returns The generator that holds the file metadata
   */
  #resolveRelativeImportPath(value: string) {
    const key = path.resolve(path.dirname(this.#fileMetadata().path), value);
    if (this.#root === null) {
      throw new Exception('Root generator is not set');
    }
    const generator = this.#root.#generators.get(key) ?? null;
    if (generator === null) {
      throw new Exception('Generator not found');
    }
    return generator;
  }

  /**
   * Include dependencies from a metadata param type. This method will include the necessary
   * dependencies for a given param type.
   * @param paramType Metadata param type
   * @param metadata Parent metadata to which the param belongs
   */
  #includeMetadataDependenciesFromType(
    paramType: MetadataParamType,
    metadata: Metadata
  ) {
    switch (paramType.type) {
      case 'generic':
        switch (paramType.value) {
          case GenericName.Bytes:
          case GenericName.String:
            this.write('#include <string.h>\n');
            this.write('// We are going to need JSB_MAX_STRING_SIZE\n');
            this.write('#include <jsb/jsb.h>\n');
            break;
          case GenericName.Long:
          case GenericName.UnsignedLong:
          case GenericName.Float:
          case GenericName.Boolean:
          case GenericName.Double:
          case GenericName.Integer:
          case GenericName.Uint32:
          case GenericName.Int32:
          case GenericName.Uint16:
          case GenericName.Int16:
          case GenericName.Uint8:
          case GenericName.Int8:
          case GenericName.NullTerminatedString:
        }
        break;
      case 'template':
        this.#includeMetadataDependenciesFromTemplateParamType(
          paramType,
          metadata
        );
        break;
      case 'internalType': {
        const typeDefinition =
          this.#resolveMetadataFromDefinitionReference(paramType);
        this.write(`#include "${metadataToRelativePath(typeDefinition)}.h"\n`);
        break;
      }
      case 'externalType': {
        const generator = this.#resolveRelativeImportPath(
          paramType.relativePath
        );
        const targetFileMetadata =
          generator
            .#fileMetadata()
            .metadata.find((metadata) => metadata.name === paramType.name) ??
          null;
        if (targetFileMetadata === null) {
          throw new Exception('External type not found');
        }
        this.write(
          `#include "${metadataToRelativePath(targetFileMetadata)}.h"\n`
        );
        break;
      }
      case 'externalModuleType':
        throw new Exception('External modules are not implemented');
    }
  }

  // #currentOrFail() {
  //   if (this.#current === null) {
  //     throw new Exception('Current file is not set');
  //   }
  //   return this.#current;
  // }

  #includeMetadataDependenciesOnHeaderFile(metadata: Metadata) {
    switch (metadata.kind) {
      case 'type':
      case 'call':
        for (const param of metadata.params) {
          this.#includeMetadataDependenciesOnTypeFromParam(param, metadata);
        }
        break;
      case 'trait':
        for (const param of metadata.nodes) {
          this.#includeMetadataDependenciesFromType(param, metadata);
        }
        break;
    }
  }

  #genericNameToString(genericName: GenericName) {
    switch (genericName) {
      case GenericName.Bytes:
        return 'jsb_bytes_t';
      case GenericName.Long:
        return 'jsb_int64_t';
      case GenericName.UnsignedLong:
        return 'jsb_uint64_t';
      case GenericName.Float:
        return 'jsb_float_t';
      case GenericName.Boolean:
        return 'bool';
      case GenericName.Double:
        return 'jsb_double_t';
      case GenericName.Integer:
      case GenericName.Int32:
        return 'jsb_int32_t';
      case GenericName.Uint32:
        return 'jsb_uint32_t';
      case GenericName.Uint16:
        return 'jsb_uint16_t';
      case GenericName.Int16:
        return 'jsb_int16_t';
      case GenericName.Uint8:
        return 'jsb_uint8_t';
      case GenericName.Int8:
        return 'jsb_int8_t';
      case GenericName.NullTerminatedString:
      case GenericName.String:
        return 'jsb_string_t';
    }
  }

  #templateParamTypeToString(
    paramType: MetadataParamTypeTemplate,
    parent: Metadata
  ): string {
    switch (paramType.template) {
      case 'tuple':
        return getTupleStructTypeReference(parent);
      case 'vector':
      case 'optional':
      case 'map':
      case 'set':
      case 'bigint':
        throw new Exception(`Not implemented: ${paramType.template}`);
    }
  }

  #metadataParamTypeToString(paramType: MetadataParamType, parent: Metadata) {
    switch (paramType.type) {
      case 'generic':
        return this.#genericNameToString(paramType.value);
      case 'template':
        return this.#templateParamTypeToString(paramType, parent);
      case 'internalType':
      case 'externalType': {
        const metadata =
          this.#resolveMetadataFromDefinitionReference(paramType);
        switch (metadata.kind) {
          case 'type':
          case 'call':
          case 'trait':
            return getMetadataCompleteTypeReference(metadata);
        }
        break;
      }
      case 'externalModuleType':
        throw new Exception('External modules are not implemented');
    }
  }
}

function getMetadataCompleteTypeReference(metadata: Metadata) {
  return `struct ${getMetadataPrefix(metadata)}_t`;
}

function getMetadataPrefix(metadata: Metadata) {
  switch (metadata.kind) {
    case 'type':
    case 'call':
      return `${metadataGlobalNameToNamespace(metadata)}`;
    case 'trait':
      return `${metadataGlobalNameToNamespace(metadata)}_trait`;
  }
}

function pointer(key: string) {
  if (key.startsWith('*')) {
    return key.substring(1);
  } else {
    return `&${key}`;
  }
}
