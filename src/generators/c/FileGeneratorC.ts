/**
 * This file contains the implementation of the FileGeneratorCPP class,
 * which is responsible for generating CPP files based on file metadata.
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
  MetadataParamTypeDefinition
} from '../../parser/types/metadata';
import GenericName from '../../parser/types/GenericName';
import Exception from '../../../exception/Exception';
import path from 'path';
import { IGeneratedFile } from '../../core/File';

// Converts jsb_xx_t to xx
function jsbTypeToCodecSuffix(value: string) {
  return value.replace(/^jsb_/, '').replace(/_t$/, '');
}

function metadataToRelativePath(metadata: Metadata) {
  switch (metadata.kind) {
    case 'call':
    case 'type':
      return metadata.globalName.split('.').join('/');
    case 'trait':
      throw new Exception('Not implemented');
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
  metadata: IMetadataTypeDefinition,
  limit: number | null = null
) {
  let slices = metadata.globalName.split('.');
  if (limit !== null) {
    slices = slices.slice(0, limit);
  }
  return `${slices.join('_')}`;
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
    super();
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
          throw new Exception('Not implemented');
      }
    }
    return null;
  }

  #generateCMakeListsFile() {
    if (!this.#files.length) {
      throw new Exception('No files to generate CMakeLists.txt from');
    }

    this.write('cmake_minimum_required(VERSION 3.5)\n');
    this.write(`project(${this.#cmake.project})\n`);
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
      'target_include_directories(\n',
      () => {
        this.write(`${this.#cmake.project}\n`);
        this.write('PUBLIC\n');
        this.write('${CMAKE_CURRENT_SOURCE_DIR}\n');
      },
      ')\n'
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
        this.write(
          '{\n',
          () => {
            this.write('jsb_uint32_t len;\n');
            this.write(
              'JSB_CHECK_ERROR(jsb_deserializer_read_uint32(d, &len));\n'
            );
            this.write(
              `JSB_CHECK_ERROR(jsb_deserializer_read_buffer(d, len, ${key}));\n`
            );
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
      case GenericName.Double:
      case GenericName.NullTerminatedString:
      case GenericName.String:
        throw new Exception('Not implemented');
        break;
    }
  }

  #deserializeParamTypeTemplate(
    paramType: MetadataParamTypeTemplate,
    key: string
  ) {
    switch (paramType.template) {
      case 'vector':
      case 'set':
        this.write(
          '{\n',
          () => {
            this.write(
              'const auto len = jsb_deserializer_read_uint32(d, &len);\n'
            );
            this.write(`${key}.reserve(len);\n`);
            this.write(
              'for (std::uint32_t i = 0; i < len; i++) {\n',
              () => {
                this.#deserializeParamType(paramType.value, `${key}[i]`);
              },
              '}\n'
            );
          },
          '}\n'
        );
        break;
      case 'optional':
        this.write(
          'if(d.read<std::uint8_t>() != 0) {\n',
          () => {
            this.write(
              `${key} = std::make_optional<${this.#metadataParamTypeToString(
                paramType.value
              )}>();\n`
            );
            this.#deserializeParamType(paramType.value, key);
          },
          '}\n'
        );
        break;
      case 'tuple':
      case 'map':
      case 'bigint':
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
  ) {
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
    if (metadata.kind === 'trait') {
      throw new Exception('Trait is not supported yet');
    }
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
          `JSB_CHECK_ERROR(${metadataGlobalNameToNamespace(
            metadata
          )}_decode(d, &${key}));\n`
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
    const completeTypeReference = `struct ${metadataGlobalNameToNamespace(
      metadata
    )}`;
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
        // this.write(`struct ${completeTypeReference} result;\n`);
        for (const param of metadata.params) {
          this.#deserializeParamType(param.type, `result->${param.name}`);
        }
        this.write('return JSB_OK;\n');
      },
      '}\n'
    );
    this.write('\n');
    this.write(
      `enum jsb_result_t ${metadataGlobalNameToNamespace(
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

    this.#files.push({
      path: `${metadataToRelativePath(metadata)}.${
        this.#options.sourceFileExtension
      }`,
      contents: this.value()
    });
  }

  // #serializeParamTypeTemplate(
  //   paramType: MetadataParamTypeTemplate,
  //   key: string
  // ) {
  //   switch (paramType.template) {
  //     case 'vector':
  //     case 'set':
  //       this.write(`s.write<std::uint32_t>(${key}.size());\n`);
  //       this.write(
  //         `for (const auto& item : ${key}) {\n`,
  //         () => {
  //           this.#serializeParamType(paramType.value, 'item');
  //         },
  //         '}\n'
  //       );
  //       break;
  //     case 'optional':
  //       this.write(`s.write<std::uint8_t>(${key}.has_value() ? 1 : 0);\n`);
  //       this.write(
  //         `if (${key}.has_value()) {\n`,
  //         () => {
  //           this.#serializeParamType(paramType.value, `${key}.value()`);
  //         },
  //         '}\n'
  //       );
  //       break;
  //     case 'tuple':
  //     case 'map':
  //     case 'bigint':
  //       throw new Exception('Not implemented');
  //   }
  // }

  #serializeParamType(paramType: MetadataParamType, key: string) {
    switch (paramType.type) {
      case 'generic':
        this.#serializeParamTypeGeneric(paramType, key);
        break;
      case 'template':
        // this.#serializeParamTypeTemplate(paramType, key);
        // break;
        throw new Exception(
          'Templates are not implemented for the C generator'
        );
      case 'internalType':
      case 'externalType':
        // this.write(`${key}.encode(s);\n`);
        this.write(
          `JSB_CHECK_ERROR(${metadataGlobalNameToNamespace(
            this.#resolveMetadataFromDefinitionReference(paramType)
          )}_encode(&${key}, s));\n`
        );
        break;
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
        this.write(`JSB_CHECK_ERROR(jsb_serializer_write_bytes(s, ${key}));\n`);
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
      case GenericName.Double:
      case GenericName.NullTerminatedString:
      case GenericName.String:
        throw new Exception(`Not implemented: ${paramType.value}`);
    }
  }

  #generateHeaderFile(metadata: IMetadataTypeDefinition) {
    const headerGuard = getHeaderGuard(
      `jsb-${metadataToRelativePath(metadata)}-h`
    );

    this.write('#ifdef __cplusplus\n');
    this.write('extern "C" {\n');
    this.write('#endif // __cplusplus\n');

    this.write('\n');

    this.write(`#ifndef ${headerGuard}\n`);
    this.write(`#define ${headerGuard}\n\n`);
    this.#includeMetadataDependenciesOnHeaderFile(metadata);

    this.write('#include <stdbool.h>\n');
    this.write('#include <jsb/serializer.h>\n');
    this.write('#include <jsb/deserializer.h>\n');
    this.write('\n');
    // const namespace = metadataGlobalNameToNamespace(metadata, -1);
    // if (namespace) {
    //   this.write(
    //     `namespace ${metadataGlobalNameToNamespace(metadata, -1)} {\n\n`
    //   );
    // }
    this.write(`struct ${metadataGlobalNameToNamespace(metadata)} {\n`);
    // this.write('public:\n');
    this.indentBlock(() => {
      for (const param of metadata.params) {
        this.write(
          `${this.#metadataParamTypeToString(param.type)} ${param.name};\n`
        );
      }
    });
    this.write('};\n');
    const completeTypeReference = `struct ${metadataGlobalNameToNamespace(
      metadata
    )}`;
    this.write(
      `enum jsb_result_t ${metadataGlobalNameToNamespace(
        metadata
      )}_decode(struct jsb_deserializer_t*, ${completeTypeReference}*);\n`
    );
    this.write(
      `enum jsb_result_t ${metadataGlobalNameToNamespace(
        metadata
      )}_encode(const ${completeTypeReference}*, struct jsb_serializer_t*);\n`
    );
    // if (namespace) {
    //   this.append('\n');
    //   this.write(`} // ${metadataGlobalNameToNamespace(metadata, -1)}\n`);
    // }
    this.write(`#endif // ${headerGuard}\n`);

    this.write('\n');

    this.write('#ifdef __cplusplus\n');
    this.write('}\n');
    this.write('#endif // __cplusplus\n');

    this.#files.push({
      path: `${metadataToRelativePath(metadata)}.h`,
      contents: this.value()
    });
  }

  #includeMetadataDependenciesOnTypeFromParam(
    param: IMetadataParam,
    metadata: Metadata
  ) {
    this.#includeMetadataDependenciesFromType(param.type, metadata);
  }

  // #includeMetadataDependenciesFromTemplateParamType(
  //   paramType: MetadataParamTypeTemplate,
  //   metadata: Metadata
  // ) {
  //   switch (paramType.template) {
  //     case 'tuple':
  //       this.write('#include <tuple>\n');
  //       for (const arg of paramType.args) {
  //         this.#includeMetadataDependenciesFromType(arg, metadata);
  //       }
  //       break;
  //     case 'map':
  //       this.write('#include <unordered_map>\n');
  //       this.#includeMetadataDependenciesFromType(paramType.key, metadata);
  //       this.#includeMetadataDependenciesFromType(paramType.value, metadata);
  //       break;
  //     case 'bigint':
  //       throw new Exception('`bigint` is not implemented');
  //     case 'vector':
  //     case 'optional':
  //     case 'set':
  //       this.#includeMetadataDependenciesFromType(paramType.value, metadata);
  //       break;
  //   }
  //   switch (paramType.template) {
  //     case 'vector':
  //       this.write('#include <list>\n');
  //       break;
  //     case 'optional':
  //       this.write('#include <optional>\n');
  //       break;
  //     case 'set':
  //       this.write('#include <unordered_set>\n');
  //       break;
  //   }
  // }

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

  #includeMetadataDependenciesFromType(
    paramType: MetadataParamType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: Metadata
  ) {
    switch (paramType.type) {
      case 'generic':
        break;
      case 'template':
        throw new Error('Template types are not implemented yet');
      // this.#includeMetadataDependenciesFromTemplateParamType(
      //   paramType,
      //   metadata
      // );
      // break;
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
        // return 'float';
        throw new Error('Float is not implemented yet for the C generator');
      case GenericName.Boolean:
        return 'bool';
      case GenericName.Double:
        // return 'double_t';
        throw new Error('Double is not implemented yet for the C generator');
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
        return 'const char*';
    }
  }

  #templateParamTypeToString(paramType: MetadataParamTypeTemplate): string {
    switch (paramType.template) {
      case 'vector':
        return `${this.#metadataParamTypeToString(paramType.value)}*`;
      case 'map':
      case 'set':
      case 'optional':
      case 'tuple':
      case 'bigint':
        throw new Exception('Not implemented');
    }
  }

  #metadataParamTypeToString(paramType: MetadataParamType) {
    switch (paramType.type) {
      case 'generic':
        return this.#genericNameToString(paramType.value);
      case 'template':
        return this.#templateParamTypeToString(paramType);
      case 'internalType':
      case 'externalType':
        return `struct ${metadataGlobalNameToNamespace(
          this.#resolveMetadataFromDefinitionReference(paramType)
        )}`;
      case 'externalModuleType':
        throw new Exception('External modules are not implemented');
    }
  }
}
