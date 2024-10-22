import Exception from '../../../exception/Exception';
import ErrorFormatter from '../../core/ErrorFormatter';
import { IGeneratedFile } from '../../core/File';
import { IToken } from '../../core/Tokenizer';
import GenericName from '../../parser/types/GenericName';
import {
  IMetadataParam,
  IMetadataParamTypeGeneric,
  IMetadataParamTypeTemplateOptional,
  IMetadataParamTypeTupleTemplate,
  IMetadataTraitDefinition,
  IMetadataTypeDefinition,
  Metadata,
  MetadataParamType,
  MetadataParamTypeTemplate
} from '../../parser/types/metadata';
import Resolver, { IResolverOptions } from '../../resolver/Resolver';
import {
  dereference,
  getHeaderGuard,
  getInitOptionalParameterFunctionName,
  getMetadataCompleteTypeReference,
  getMetadataName,
  getMetadataPrefix,
  getOptionalStructName,
  getOptionalStructTypeReference,
  getTraitUnionCompleteTypeReference,
  getTraitUnionNodePropertyName,
  getTuplePropertyName,
  getTupleStructTypeReference,
  JSB_TRACE,
  jsbTypeToCodecSuffix,
  metadataGlobalNameToNamespace,
  metadataToRelativePath,
  pointer
} from './utilities';

interface IParamBasedFunctionGenerationContext {
  metadata: Metadata;
  param: IMetadataParam;
  paramKey: string;
  /**
   * Whether the function implementation should be generated
   */
  implementation: boolean;
  metadataParamTypePath: MetadataParamType[];
}

export interface IMetadataFileCCodeGeneratorOptions extends IResolverOptions {
  sourceFileExtension: string;
  contents: Uint8Array;
}

export default class MetadataFileCCodeGenerator extends Resolver {
  readonly #files = new Array<IGeneratedFile>();
  readonly #options;
  readonly #Exception = (() => {
    const self = this;
    return class extends Exception {
      constructor(token: IToken, message: string) {
        super(self.#createErrorFormatter(token).format(message));
      }
    };
  })();

  public constructor(options: IMetadataFileCCodeGeneratorOptions) {
    super(options);
    this.#options = options;
  }

  public files() {
    return this.#files;
  }

  public generate() {
    for (const metadata of this.fileMetadata().metadata) {
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
  }

  public generateTraitEnumInformation(metadata: IMetadataTraitDefinition) {
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
        throw new this.#Exception(
          param.position.start,
          'Only internal and external types are allowed in traits'
        );
      }
      const node = this.resolveMetadataFromParamTypeDefinition(param);
      if (node.kind === 'trait') {
        throw new this.#Exception(
          node.position.start,
          'Currently it is not possible for a trait to import another'
        );
      }
      const enumItemName = `${getTraitUnionNodePropertyName(
        this.resolveMetadataFromParamTypeDefinition(param)
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

  public metadataParamTypeToString(
    paramType: MetadataParamType,
    parent: Metadata
  ) {
    switch (paramType.type) {
      case 'generic':
        return this.#genericNameToString(paramType.value);
      case 'template':
        return this.#templateParamTypeToString(paramType, parent);
      case 'internalType':
      case 'externalType': {
        const metadata = this.resolveMetadataFromParamTypeDefinition(paramType);
        switch (metadata.kind) {
          case 'type':
          case 'call':
          case 'trait':
            return getMetadataCompleteTypeReference(metadata);
        }
        break;
      }
      case 'externalModuleType':
        throw new this.#Exception(
          paramType.position.start,
          'External modules are not implemented'
        );
    }
  }

  #createErrorFormatter(token: IToken) {
    return new ErrorFormatter({
      contents: this.#options.contents,
      offset: () => token.position.start,
      textDecoder: new TextDecoder(),
      file: this.fileMetadata().path
    });
  }

  #deserializeParamTypeGeneric(
    paramType: IMetadataParamTypeGeneric,
    key: string
  ) {
    switch (paramType.value) {
      case GenericName.Bytes:
      case GenericName.String:
      case GenericName.NullTerminatedString:
        this.write(
          '{\n',
          () => {
            this.write('jsb_uint32_t len;\n');
            this.write(
              'JSB_CHECK_ERROR(jsb_deserializer_read_uint32(d, &len));\n'
            );
            this.append('#ifdef JSB_TOLERATE_TYPE_OVERFLOW\n');
            this.write(
              'if(len > JSB_MAX_STRING_SIZE) len = JSB_MAX_STRING_SIZE;\n'
            );
            this.append('#else\n');
            this.write(
              'if(len > JSB_MAX_STRING_SIZE) return JSB_BUFFER_OVERFLOW;\n'
            );
            this.append('#endif\n');
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
          '{\n',
          () => {
            this.write(
              `JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &${key}.has_value));\n`
            );
            this.write(
              `if(${key}.has_value != 1 && ${key}.has_value != 0) {\n`,
              () => {
                this.write(
                  `JSB_TRACE("decode", "Failed to decode ${key}. The returned value for optional was not zero or one: %d\\n", ${key}.has_value);\n`
                );
                this.write('return JSB_INVALID_DECODED_VALUE;\n');
              },
              '}\n'
            );
            this.write(
              `if(${key}.has_value) {\n`,
              () => {
                this.#deserializeParamType(paramType.value, `${key}.value`);
              },
              '}\n'
            );
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
        throw new this.#Exception(paramType.position.start, 'Not implemented');
    }
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
        const metadata = this.resolveMetadataFromParamTypeDefinition(paramType);
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
    this.append('\n');

    const completeTypeReference = getMetadataCompleteTypeReference(metadata);
    const memberNames = {
      initialize: `${getMetadataPrefix(metadata)}_init`,
      decode: `${metadataGlobalNameToNamespace(metadata)}_decode`,
      encode: `${getMetadataPrefix(metadata)}_encode`
    };
    this.write(
      `enum jsb_result_t ${memberNames.decode}(struct jsb_deserializer_t* d, ${completeTypeReference}* result) {\n`,
      () => {
        this.write(
          '{\n',
          () => {
            this.write(
              JSB_TRACE(
                memberNames.decode,
                `Decoding ${metadata.globalName}...`
              )
            );
            this.write('jsb_int32_t header;\n');
            this.write(
              'JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));\n'
            );
            this.write(
              `if(header != ${metadata.id.toString()}) {\n`,
              () => {
                this.write(
                  JSB_TRACE(
                    memberNames.decode,
                    `Invalid CRC header for ${metadata.globalName}. ` +
                      `Expected ${metadata.id}, but got %d instead`,
                    'literal:header'
                  )
                );
                this.write('return JSB_INVALID_CRC_HEADER;\n');
              },
              '}\n'
            );
          },
          '}\n'
        );
        for (const param of metadata.params) {
          this.write(
            JSB_TRACE(memberNames.decode, `Decoding ${param.name}...`)
          );
          this.#deserializeParamType(param.type, `result->${param.name}`);
        }
        this.write('return JSB_OK;\n');
      },
      '}\n'
    );
    this.append('\n');
    this.write(
      `enum jsb_result_t ${memberNames.encode}(const ${completeTypeReference}* input, struct jsb_serializer_t* s) {\n`
    );
    this.indentBlock(() => {
      this.write(
        JSB_TRACE(memberNames.encode, `Encoding ${metadata.globalName}...`)
      );
      this.write(
        `JSB_CHECK_ERROR(jsb_serializer_write_int32(s, ${metadata.id.toString()}));\n`
      );
      for (const param of metadata.params) {
        this.#serializeParamType(param.type, `input->${param.name}`);
      }
      this.write('return JSB_OK;\n');
    });
    this.write('}\n');

    this.append('\n');

    this.write(
      `enum jsb_result_t ${memberNames.initialize}(${completeTypeReference}* value) {\n`
    );
    this.indentBlock(() => {
      this.write(
        'if(value == NULL) {\n',
        () => {
          this.write(
            JSB_TRACE(
              memberNames.initialize,
              `Failed to initialize ${metadata.globalName}, received value = NULL`
            )
          );
          this.write('return JSB_BAD_ARGUMENT;\n');
        },
        '}\n'
      );
      // this.append('\n');
      // this.append('#ifdef JSB_SCHEMA_MALLOC\n');
      // this.writeMultiLineComment([
      //   'When JSB_SCHEMA_MALLOC is defined, we need to check for pointers before calling memset.',
      //   'Otherwise, the allocated memory will be corrupted.'
      // ]);
      // this.append('#error "JSB_SCHEMA_MALLOC is not yet implemented"\n');
      // this.append('#else\n');
      // this.write(`jsb_memset(value, 0, sizeof(${completeTypeReference}));\n`);
      // this.append('#endif\n');
      // this.append('\n');
    });

    // this.write('#ifdef JSB_SCHEMA_MALLOC\n');
    // this.indentBlock(() => {
    //   this.write(`memset(value, 0, sizeof(${completeTypeReference}));\n`);
    // });
    // this.write('#else\n');
    // this.indentBlock(() => {
    //   for (const param of metadata.params) {
    //     this.#initializeMetadataParam(param.type, `value->${param.name}`);
    //   }
    // });
    // this.write('#endif // JSB_SCHEMA_MALLOC\n');

    this.indentBlock(() => {
      for (const param of metadata.params) {
        this.write(
          JSB_TRACE(
            memberNames.initialize,
            `Initializing param of type "${this.metadataParamTypeToString(
              param.type,
              metadata
            )}": ${param.name}`
          )
        );
        this.#initializeMetadataParam(
          param.type,
          `value->${param.name}`,
          metadata
        );
        this.write(
          JSB_TRACE(memberNames.initialize, `Initialized param: ${param.name}`)
        );
        this.append('\n');
      }
      this.write('return JSB_OK;\n');
    });
    this.write('}\n');
    this.append('\n');
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
    this.append('\n');

    this.#generateParamBasedFunction(metadata, true);

    this.#files.push({
      path: `${metadataToRelativePath(metadata)}.${
        this.#options.sourceFileExtension
      }`,
      contents: this.value()
    });
  }

  #initializeMetadataParamGeneric(
    paramType: IMetadataParamTypeGeneric,
    key: string,
    metadata: Metadata
  ) {
    this.writeMultiLineComment([
      this.metadataParamTypeToString(paramType, metadata)
    ]);
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
        this.append('#ifdef JSB_SCHEMA_MALLOC\n');
        // this.write(`jsb_memset(${key}, 0, jsb_strlen(${key}));\n`);
        this.writeMultiLineComment([
          'Here we should have something similar the following options:',
          '',
          `1. Have additional ${key}_len and ${key}_capacity members`,
          'in order to control the maximum capacity of the memory block and be able to fully set it to zero.',
          '',
          '2. We could simply stick to the null-terminated string in order to keep it simple.',
          '',
          '3. Whenever JSB_SCHEMA_MALLOC is defined, we could implement both of the behaviors above, if feasible.'
        ]);
        this.append('#error "JSB_SCHEMA_MALLOC is not implemented yet"\n');
        this.append('#else\n');
        this.write(`jsb_memset(${pointer(key)}, 0, sizeof(jsb_string_t));\n`);
        // this.write(`${key}[JSB_MAX_STRING_SIZE] = 0;\n`);
        this.append('#endif // JSB_SCHEMA_MALLOC\n');
        break;
    }
  }

  #initializeMetadataParamTemplate(
    paramType: MetadataParamTypeTemplate,
    key: string,
    metadata: Metadata
  ) {
    this.writeMultiLineComment([
      this.metadataParamTypeToString(paramType, metadata)
    ]);
    switch (paramType.template) {
      case 'optional':
        // this.write(
        //   `jsb_memset(${pointer(
        //     key
        //   )}, 0, sizeof(${this.metadataParamTypeToString(
        //     paramType,
        //     metadata
        //   )}));\n`
        // );
        // this.append('\n');
        this.write(`${key}.has_value = false;\n`);
        this.#initializeMetadataParam(
          paramType.value,
          `${key}.value`,
          metadata
        );
        break;
      case 'tuple': {
        let tupleItemIndex = 0;
        for (const arg of paramType.args) {
          this.#initializeMetadataParam(
            arg,
            `${key}.${getTuplePropertyName(tupleItemIndex)}`,
            metadata
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
        throw new this.#Exception(paramType.position.start, 'Not implemented');
    }
  }

  #initializeMetadataParam(
    paramType: MetadataParamType,
    key: string,
    metadata: Metadata
  ) {
    switch (paramType.type) {
      case 'generic':
        this.#initializeMetadataParamGeneric(paramType, key, metadata);
        break;
      case 'template':
        this.#initializeMetadataParamTemplate(paramType, key, metadata);
        break;
      case 'internalType':
      case 'externalType': {
        const metadata = this.resolveMetadataFromParamTypeDefinition(paramType);

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
            const traitEnum = this.generateTraitEnumInformation(metadata);
            const node = Array.from(traitEnum.items)[0];

            if (!node) {
              throw new this.#Exception(
                paramType.position.start,
                `Trait ${metadata.globalName} has no nodes`
              );
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
        throw new this.#Exception(
          paramType.position.start,
          'External modules are not supported by the C generator'
        );
    }
  }

  #generateTraitFileSourceFile(metadata: IMetadataTraitDefinition) {
    this.write(`#include "${metadataToRelativePath(metadata)}.h"\n`);
    this.append('\n');

    const completeTypeReference = getMetadataCompleteTypeReference(metadata);
    const memberNames = {
      initialize: `${getMetadataPrefix(metadata)}_init`,
      decode: `${getMetadataPrefix(metadata)}_decode`,
      encode: `${getMetadataPrefix(metadata)}_encode`,
      freeTrait: `${getMetadataPrefix(metadata)}_free`
    };
    const traitEnum = this.generateTraitEnumInformation(metadata);

    this.write(
      `enum jsb_result_t ${memberNames.encode}(const ${completeTypeReference}* input, struct jsb_serializer_t* s) {\n`,
      () => {
        this.write(
          'switch(input->type) {\n',
          () => {
            const enumTrait = this.generateTraitEnumInformation(metadata);
            for (const [, item] of enumTrait.items) {
              const encodeKey = `input->value.${getTraitUnionNodePropertyName(
                item.metadata
              )}`;
              this.write(`case ${item.name}:\n`);
              this.indentBlock(() => {
                this.write(
                  JSB_TRACE(
                    `${memberNames.encode}/${metadata.globalName}`,
                    `Encoding ${item.metadata.globalName}...`
                  )
                );
                this.write(
                  `JSB_CHECK_ERROR(${getMetadataPrefix(
                    item.metadata
                  )}_encode(${pointer(encodeKey)},s));\n`
                );
                this.write('break;\n');
              });
            }
            this.write('default:\n');
            this.indentBlock(() => {
              this.write(
                `JSB_TRACE("${memberNames.encode}/${metadata.globalName}", "Invalid type: %d. ` +
                  `Maybe you've forgot to initialize \`${getMetadataCompleteTypeReference(
                    metadata
                  )}\`?\\n", input->type);\n`
              );
              this.write('return JSB_INVALID_CRC_HEADER;\n');
            });
          },
          '}\n'
        );
        this.write('return JSB_OK;\n');
      },
      '}\n'
    );
    this.append('\n');

    this.write(
      `enum jsb_result_t ${memberNames.decode}(struct jsb_deserializer_t* d, ${completeTypeReference}* output) {\n`,
      () => {
        this.write(
          'if(d == NULL) {\n',
          () => {
            this.write(
              JSB_TRACE(
                memberNames.decode,
                `Failed to decode ${metadata.globalName}, received NULL pointer for the deserializer parameter`
              )
            );
            this.write('return JSB_BAD_ARGUMENT;\n');
          },
          '}\n'
        );
        this.write(
          'if(output == NULL) {\n',
          () => {
            this.write(
              JSB_TRACE(
                memberNames.decode,
                `Failed to decode ${metadata.globalName}, received NULL pointer for the output parameter`
              )
            );
            this.write('return JSB_BAD_ARGUMENT;\n');
          },
          '}\n'
        );
        this.write('jsb_int32_t header;\n');
        this.write(
          'JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));\n'
        );
        // Go back 4 bytes in order to allow the next type/call decoder to read the header
        this.write('JSB_CHECK_ERROR(jsb_deserializer_rewind(d, 4));\n');
        this.write(
          'switch(header) {\n',
          () => {
            const enumTrait = this.generateTraitEnumInformation(metadata);
            for (const [, item] of enumTrait.items) {
              const outputKey = `&output->value.${getTraitUnionNodePropertyName(
                item.metadata
              )}`;
              this.write(`case ${item.value}:\n`);
              this.indentBlock(() => {
                this.write(
                  JSB_TRACE(
                    `${memberNames.decode}/${metadata.globalName}`,
                    `Decoding ${item.metadata.globalName}...`
                  )
                );
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
              this.write(
                `JSB_TRACE("${metadata.globalName}/decode", "Invalid decoded header: %d. ` +
                  'Maybe you are decoding an incompatible or corrupted buffer?\\n", header);\n'
              );
              this.write('return JSB_INVALID_CRC_HEADER;\n');
            });
          },
          '}\n'
        );
        this.write('return JSB_OK;\n');
      },
      '}\n'
    );
    this.append('\n');

    this.write(
      `enum jsb_result_t ${memberNames.initialize}(${completeTypeReference}* input, enum ${traitEnum.name} type) {\n`,
      () => {
        this.write(
          'if(input == NULL) {\n',
          () => {
            this.write(
              JSB_TRACE(
                memberNames.initialize,
                `Failed to initialize ${metadata.globalName}, received NULL pointer for the input parameter`
              )
            );
            this.write('return JSB_BAD_ARGUMENT;\n');
          },
          '}\n'
        );
        this.write(
          'switch(type) {\n',
          () => {
            for (const [, item] of traitEnum.items) {
              this.write(`case ${item.name}:\n`);
              this.indentBlock(() => {
                this.write(
                  JSB_TRACE(
                    memberNames.initialize,
                    `Initializing with the given header (%d): ${item.metadata.globalName}...`,
                    'literal:type'
                  )
                );
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
              this.write(
                JSB_TRACE(
                  `${metadata.globalName}/initialize`,
                  'Invalid type: %d. ' +
                    'Maybe you are initializing with an invalid header?',
                  'literal:type'
                )
              );
              this.write('return JSB_INVALID_CRC_HEADER;\n');
            });
          },
          '}\n'
        );
        this.write('return JSB_OK;\n');
      },
      '}\n'
    );
    this.append('\n');

    this.write(
      `void ${memberNames.freeTrait}(${completeTypeReference}* trait) {\n`,
      () => {
        this.write(
          'if(trait == NULL) {\n',
          () => {
            this.write(
              JSB_TRACE(
                memberNames.freeTrait,
                `Failed to free '${metadata.globalName}', received NULL pointer`
              )
            );
            this.write('return;\n');
          },
          '}\n'
        );
        this.write(
          JSB_TRACE(
            memberNames.freeTrait,
            `Freeing trait: ${metadata.globalName}`
          )
        );
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
                  JSB_TRACE(
                    memberNames.freeTrait,
                    `Identified ${metadata.globalName} trait to have its value as: ${item.metadata.globalName}`
                  )
                );
                this.write(
                  `${getMetadataPrefix(item.metadata)}_free(${key});\n`
                );
                this.write('break;\n');
              });
            }
            this.write('default:\n');
            this.indentBlock(() => {
              this.write(
                `JSB_TRACE("${metadata.globalName}/free", "Invalid type: %d. ` +
                  'Maybe you are freeing an uninitialized or corrupted buffer?\\n", trait->type);\n'
              );
              this.write('break;\n');
            });
          },
          '}\n'
        );
      },
      '}\n'
    );
    this.append('\n');

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

    this.append('\n');

    this.write('#ifdef __cplusplus\n');
    this.write('extern "C" {\n');
    this.write('#endif // __cplusplus\n');

    this.append('\n');

    this.#includeMetadataDependenciesOnHeaderFile(metadata);
    this.append('\n');

    this.write('#include <jsb/serializer.h>\n');
    this.write('#include <jsb/deserializer.h>\n');
    this.append('\n');

    const traitEnum = this.generateTraitEnumInformation(metadata);

    this.write(
      `enum ${traitEnum.name} {\n`,
      () => {
        this.append('#ifdef JSB_SCHEMA_NO_ASSIGNMENT_ENUMS\n');
        for (const [, item] of traitEnum.items) {
          this.write(`${item.name},\n`);
        }
        this.append('#else\n');
        for (const [, item] of traitEnum.items) {
          this.write(`${item.name} = ${item.value},\n`);
        }
        this.append('#endif\n');
      },
      '};\n'
    );

    this.append('\n');

    this.write(
      `${getTraitUnionCompleteTypeReference(metadata)} {\n`,
      () => {
        for (const param of metadata.nodes) {
          if (param.type !== 'internalType' && param.type !== 'externalType') {
            throw new this.#Exception(
              param.position.start,
              'Only internal and external types are allowed in traits'
            );
          }
          this.write(
            `${this.metadataParamTypeToString(
              param,
              metadata
            )} ${getTraitUnionNodePropertyName(
              this.resolveMetadataFromParamTypeDefinition(param)
            )};\n`
          );
        }
      },
      '};\n'
    );

    this.append('\n');

    this.write(
      `${getMetadataCompleteTypeReference(metadata)} {\n`,
      () => {
        this.write(
          `enum ${metadataGlobalNameToNamespace(metadata)}_type_t type;\n`
        );
        this.write(`${getTraitUnionCompleteTypeReference(metadata)} value;\n`);
      },
      '};\n'
    );

    this.append('\n');

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

    this.append('\n');

    this.#files.push({
      path: `${metadataToRelativePath(metadata)}.h`,
      contents: this.value()
    });
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
          `if(${key}.has_value) {\n`,
          () => {
            this.write(JSB_TRACE('', `Optional value of ${key} is set.`));
            this.write('JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 1));\n');
            this.#serializeParamType(paramType.value, `${key}.value`);
          },
          '} else {\n'
        );
        this.indentBlock(() => {
          this.write(JSB_TRACE('', `Optional value of ${key} is empty.`));
          this.write('JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, 0));\n');
        });
        this.write('}\n');
        // this.resolveMetadataFromParamTypeDefinition(paramType.value);
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
        throw new this.#Exception(paramType.position.start, 'Not implemented');
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
        const metadata = this.resolveMetadataFromParamTypeDefinition(paramType);
        this.write(JSB_TRACE('', `Encoding ${metadata.globalName}...`));
        this.write(
          `JSB_CHECK_ERROR(${getMetadataPrefix(
            this.resolveMetadataFromParamTypeDefinition(paramType)
          )}_encode(${pointer(key)}, s));\n`
        );
        break;
      }
      case 'externalModuleType':
        throw new this.#Exception(paramType.position.start, 'Not implemented');
    }
  }

  #generateStructFromMetadata(metadata: Metadata) {
    switch (metadata.kind) {
      case 'type':
      case 'call':
        for (const param of metadata.params) {
          this.#generateStructFromMetadataParamType(
            param.type,
            metadata,
            param.name
          );
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
          throw new this.#Exception(
            metadataParamType.position.start,
            'Tuple argument is null'
          );
        }
        this.write(
          `${this.metadataParamTypeToString(arg, parent)} item_${i};\n`
        );
      }
    });
    this.write('};\n');
  }

  #identifiers = new Set<string>();

  #generateStructFromMetadataParamTypeTemplateOptional(
    optionalTemplate: IMetadataParamTypeTemplateOptional,
    parent: Metadata,
    name: string
  ) {
    const optionalType = optionalTemplate.value;
    if (this.#identifiers.has(getOptionalStructName(parent, optionalType))) {
      return;
    }
    switch (optionalType.type) {
      case 'template':
        this.#generateStructFromMetadataParamTypeTemplate(
          optionalType,
          parent,
          name
        );
        break;
      case 'generic':
      case 'internalType':
      case 'externalType':
        break;
      case 'externalModuleType':
        throw new this.#Exception(
          optionalType.position.start,
          'External module types are not supported by the C generator'
        );
    }
    this.#identifiers.add(getOptionalStructName(parent, optionalType));
    this.write(
      `${getOptionalStructTypeReference(parent, optionalType)} {\n`,
      () => {
        this.write('jsb_uint8_t has_value;\n');
        this.write(
          `${this.metadataParamTypeToString(optionalType, parent)} value;\n`
        );
      },
      '};\n'
    );
    this.append('\n');
  }

  #generateStructFromMetadataParamTypeTemplate(
    metadataParamType: MetadataParamTypeTemplate,
    parent: Metadata,
    name: string
  ) {
    switch (metadataParamType.template) {
      case 'tuple':
        this.#generateStructFromTupleTemplate(metadataParamType, parent);
        break;
      case 'map':
        this.#generateStructFromMetadataParamType(
          metadataParamType.key,
          parent,
          name
        );
        this.#generateStructFromMetadataParamType(
          metadataParamType.value,
          parent,
          name
        );
        break;
      case 'bigint':
        throw new this.#Exception(
          metadataParamType.position.start,
          '`bigint` is not implemented'
        );
      case 'optional':
        this.#generateStructFromMetadataParamTypeTemplateOptional(
          metadataParamType,
          parent,
          name
        );
        break;
      case 'vector':
      case 'set':
        this.#generateStructFromMetadataParamType(
          metadataParamType.value,
          parent,
          name
        );
        break;
    }
  }

  #generateStructFromMetadataParamType(
    metadataParamType: MetadataParamType,
    parent: Metadata,
    name: string
  ) {
    switch (metadataParamType.type) {
      case 'generic':
        break;
      case 'template':
        this.#generateStructFromMetadataParamTypeTemplate(
          metadataParamType,
          parent,
          name
        );
        break;
      case 'internalType':
      case 'externalType':
        break;
      case 'externalModuleType':
        break;
    }
  }

  #generateTypeDefinitionStruct(metadata: IMetadataTypeDefinition) {
    this.write(`${getMetadataCompleteTypeReference(metadata)} {\n`);
    this.indentBlock(() => {
      for (const param of metadata.params) {
        this.write(
          `${this.metadataParamTypeToString(param.type, metadata)} ${
            param.name
          };\n`
        );
      }
    });
    this.write('};\n');
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
            this.write('#include <jsb/jsb.h>\n');
            break;
          case GenericName.Boolean:
            this.write('#include <stdbool.h>\n');
            break;
          case GenericName.Long:
          case GenericName.UnsignedLong:
          case GenericName.Float:
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
          this.resolveMetadataFromParamTypeDefinition(paramType);
        this.write(`#include "${metadataToRelativePath(typeDefinition)}.h"\n`);
        break;
      }
      case 'externalType': {
        const targetFileMetadata =
          this.resolveMetadataFromParamTypeDefinition(paramType);
        // const targetFileMetadata =
        //   generator
        //     .fileMetadata()
        //     .metadata.find((metadata) => metadata.name === paramType.name) ??
        //   null;
        // if (targetFileMetadata === null) {
        //   throw new Exception('External type not found');
        // }
        this.write(
          `#include "${metadataToRelativePath(targetFileMetadata)}.h"\n`
        );
        break;
      }
      case 'externalModuleType':
        throw new this.#Exception(
          paramType.position.start,
          'External modules are not implemented'
        );
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
      case 'optional':
        return getOptionalStructTypeReference(parent, paramType.value);
      default:
        throw new this.#Exception(paramType.position.start, 'Not implemented');
    }
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
      case 'optional':
        this.#includeMetadataDependenciesFromType(paramType.value, metadata);
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
        throw new this.#Exception(paramType.position.start, 'Not implemented');
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

  #serializeParamTypeGeneric(
    paramType: IMetadataParamTypeGeneric,
    key: string
  ) {
    switch (paramType.value) {
      case GenericName.Bytes:
      case GenericName.String:
      case GenericName.NullTerminatedString:
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
    }
  }

  #generateHeaderFile(metadata: IMetadataTypeDefinition) {
    const headerGuard = getHeaderGuard(
      `jsb-${metadataToRelativePath(metadata)}-h`
    );

    this.write(`#ifndef ${headerGuard}\n`);
    this.write(`#define ${headerGuard}\n\n`);
    this.append('\n');

    this.write('#ifdef __cplusplus\n');
    this.write('extern "C" {\n');
    this.write('#endif // __cplusplus\n');
    this.append('\n');

    this.#includeMetadataDependenciesOnHeaderFile(metadata);
    this.append('\n');

    this.write('#include <stdbool.h>\n');
    this.write('#include <jsb/serializer.h>\n');
    this.write('#include <jsb/deserializer.h>\n');
    this.append('\n');

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

    this.#generateParamBasedFunction(metadata, false);

    this.write('#ifdef __cplusplus\n');
    this.write('}\n');
    this.write('#endif // __cplusplus\n');

    this.append('\n');

    this.write(`#endif // ${headerGuard}\n`);

    this.#files.push({
      path: `${metadataToRelativePath(metadata)}.h`,
      contents: this.value()
    });
  }

  // We're generating the source file for the given metadata
  #generateParamBasedFunctionBasedOnMetadataParamTypeTemplateOptional(
    metadataParamType: IMetadataParamTypeTemplateOptional,
    generationContext: IParamBasedFunctionGenerationContext
  ) {
    const optionalType = metadataParamType.value;
    const { metadata, param } = generationContext;
    switch (optionalType.type) {
      case 'template':
        this.#generateParamBasedFunctionBasedOnMetadataParamTypeTemplate(
          optionalType,
          {
            ...generationContext,
            metadataParamTypePath: [
              ...generationContext.metadataParamTypePath,
              metadataParamType
            ]
          }
        );
        break;
      case 'generic':
      case 'internalType':
      case 'externalType': {
        if (!generationContext.implementation) {
          this.writeMultiLineComment([
            () =>
              this.append(
                `@brief Initialize the optional value on ${
                  param.name
                } parameter of ${getMetadataCompleteTypeReference(metadata)}`
              ),
            () =>
              this.append(
                `@param[in] ${getMetadataName(
                  metadata
                )} The struct to set the property on`
              ),
            () =>
              this.append(
                `@param[in] ${param.name} The optional value to initialize. Pass NULL to unset the optional value`
              ),
            () =>
              this.append(
                '@return JSB_OK on success, otherwise an `enum jsb_result_t` code'
              )
          ]);
        }
        const paramNames: [string, string] = [
          getMetadataName(metadata),
          param.name
        ];
        this.write(
          `enum jsb_result_t ${getInitOptionalParameterFunctionName(
            metadata,
            param
          )}(${getMetadataCompleteTypeReference(metadata)}* ${
            paramNames[0]
          }, const ${this.metadataParamTypeToString(optionalType, metadata)}* ${
            paramNames[1]
          })`
        );
        if (!generationContext.implementation) {
          this.append(';\n');
          this.append('\n');
          break;
        }

        this.append('{\n');
        this.indentBlock(() => {
          const metadataParamTypeFullPath =
            generationContext.metadataParamTypePath;
          const firstMetadataParamType = metadataParamTypeFullPath[0] ?? null;
          if (firstMetadataParamType === null) {
            throw new this.#Exception(
              metadataParamType.position.start,
              'First metadata param type is null'
            );
          }

          this.#generateInitOptionalExpression(
            firstMetadataParamType,
            `${getMetadataName(metadata)}->${param.name}`,
            generationContext
          );
          this.write('return JSB_OK;\n');
        });
        this.write('}\n');
        this.append('\n');
        break;
      }
      case 'externalModuleType':
        throw new this.#Exception(
          metadataParamType.position.start,
          'Not implemented'
        );
    }
  }

  #generateInitOptionalExpressionGeneric(
    genericName: GenericName,
    key: string,
    generationContext: IParamBasedFunctionGenerationContext
  ) {
    switch (genericName) {
      case GenericName.Bytes:
      case GenericName.String:
      case GenericName.NullTerminatedString:
        // this.append('#ifdef JSB_SCHEMA_MALLOC\n');
        // this.append('#error "JSB_SCHEMA_MALLOC is not supported yet"\n');
        // this.append('#else\n');
        // this.write(
        //   `jsb_memcpy(${pointer(key)}, ${pointer(
        //     generationContext.param.name
        //   )}, jsb_strlen(${dereference(generationContext.param.name)}));\n`
        // );
        // this.append('#endif // JSB_SCHEMA_MALLOC\n');
        this.write(
          `jsb_memcpy(${pointer(key)}, ${pointer(
            generationContext.param.name
          )}, jsb_strlen(${dereference(generationContext.param.name)}));\n`
        );
        break;
      case GenericName.Boolean:
        this.write(`${key} = ${dereference(generationContext.param.name)};\n`);
        break;
      case GenericName.Long:
      case GenericName.UnsignedLong:
      case GenericName.Float:
      case GenericName.Double:
      case GenericName.Integer:
      case GenericName.Uint32:
      case GenericName.Int32:
      case GenericName.Uint16:
      case GenericName.Int16:
      case GenericName.Uint8:
      case GenericName.Int8:
        this.write(`${key} = ${dereference(generationContext.param.name)};\n`);
        break;
    }
  }

  #generateInitOptionalExpression(
    metadataParamType: MetadataParamType,
    key: string,
    generationContext: IParamBasedFunctionGenerationContext
  ) {
    switch (metadataParamType.type) {
      case 'internalType':
      case 'externalType':
        this.write(
          `if(${pointer(generationContext.paramKey)} != NULL) {\n`,
          () => {
            this.write(
              `${key} = ${dereference(generationContext.paramKey)};\n`
            );
          },
          '}\n'
        );
        break;
      case 'generic':
        this.#generateInitOptionalExpressionGeneric(
          metadataParamType.value,
          key,
          generationContext
        );
        break;
      case 'template':
        switch (metadataParamType.template) {
          case 'optional':
            /**
             * In this case here, if `paramKey` is prefixed with &, it would be undefined behavior. So,
             * it's better to throw an exception
             */
            if (generationContext.paramKey.startsWith('&')) {
              throw new this.#Exception(
                metadataParamType.position.start,
                `Invalid optional value: ${generationContext.paramKey}`
              );
            }
            this.write(
              // We still use `pointer(...)` here, just in case something changes in the future
              `${key}.has_value = ${pointer(
                generationContext.paramKey
              )} != NULL;\n`
            );
            this.write(
              `if(${key}.has_value) {\n`,
              () => {
                this.#generateInitOptionalExpression(
                  metadataParamType.value,
                  `${key}.value`,
                  generationContext
                );
              },
              '}\n'
            );
            break;
          case 'bigint':
          case 'vector':
          case 'set':
          case 'tuple':
          case 'map':
            throw new this.#Exception(
              metadataParamType.position.start,
              `Not implemented: ${metadataParamType.template}`
            );
        }
        break;
    }
  }

  #generateParamBasedFunctionBasedOnMetadataParamTypeTemplate(
    metadataParamType: MetadataParamTypeTemplate,
    generationContext: IParamBasedFunctionGenerationContext
  ) {
    switch (metadataParamType.template) {
      case 'tuple':
        break;
      case 'optional':
        this.#generateParamBasedFunctionBasedOnMetadataParamTypeTemplateOptional(
          metadataParamType,
          {
            ...generationContext,
            metadataParamTypePath: [
              ...generationContext.metadataParamTypePath,
              metadataParamType
            ]
          }
        );
        // this.writeMultiLineComment([
        //   () =>
        //     this.append(
        //       `@brief Initialize the optional value on ${
        //         param.name
        //       } parameter of ${getMetadataCompleteTypeReference(metadata)}`
        //     ),
        //   () =>
        //     this.append(
        //       `@param[in] ${getMetadataName(
        //         metadata
        //       )} The struct to set the property on`
        //     ),
        //   () =>
        //     this.append(
        //       `@param[in] ${param.name} The optional value to initialize. Pass NULL to unset the optional value`
        //     ),
        //   () =>
        //     this.append(
        //       '@return JSB_OK on success, otherwise an `enum jsb_result_t` code'
        //     )
        // ]);
        // this.write(
        //   `enum jsb_result_t ${getMetadataPrefix(metadata)}_${
        //     param.name
        //   }_init(${getMetadataCompleteTypeReference(
        //     metadata
        //   )}* ${getMetadataName(
        //     metadata
        //   )}, const ${this.#metadataParamTypeToString(
        //     metadataParamType.value,
        //     metadata
        //   )}* ${param.name});\n`
        // );
        // this.append('\n');
        break;
    }
  }

  #generateParamBasedFunctionBasedOnMetadataParamType(
    metadataParamType: MetadataParamType,
    generationContext: IParamBasedFunctionGenerationContext
  ) {
    switch (metadataParamType.type) {
      case 'generic':
        break;
      case 'template':
        this.#generateParamBasedFunctionBasedOnMetadataParamTypeTemplate(
          metadataParamType,
          generationContext
        );
        break;
    }
  }

  #generateParamBasedFunction(
    metadata: IMetadataTypeDefinition,
    implementation: boolean
  ) {
    for (const param of metadata.params) {
      this.#generateParamBasedFunctionBasedOnMetadataParamType(param.type, {
        metadata,
        paramKey: `*${param.name}`,
        param,
        implementation,
        metadataParamTypePath: []
      });
    }
  }
}
