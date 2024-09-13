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
  return slices.join('::');
}

export interface IFileGeneratorCPPOptions {
  /**
   * Absolute path of the root directory of the schema
   * source files.
   */
  root: FileGeneratorCPP | null;
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

export default class FileGeneratorCPP extends CodeStream {
  readonly #fileMetadataList;
  readonly #generators;
  readonly #current;
  readonly #rootDir;
  readonly #root;
  readonly #files: IGeneratedFile[] = [];
  readonly #cmake;
  public constructor(
    fileMetadataList: ReadonlyArray<IFileMetadata>,
    { current = null, root = null, cmake, rootDir }: IFileGeneratorCPPOptions
  ) {
    super();
    this.#root = root;
    this.#cmake = cmake ?? {
      project: 'schema'
    };
    this.#generators = new Map<string, FileGeneratorCPP>();
    this.#current = current;
    this.#rootDir = rootDir;
    this.#fileMetadataList = new Map<string, IFileMetadata>(
      fileMetadataList.map(
        (fileMetadata) => [fileMetadata.path, fileMetadata] as const
      )
    );
  }

  public async generate() {
    const fileMetadata = this.#current;
    if (fileMetadata === null) {
      for (const [path, fileMetadata] of this.#fileMetadataList) {
        if (this.#generators.has(path)) {
          throw new Exception('Generator already exists');
        }
        this.#generators.set(
          path,
          new FileGeneratorCPP(Array.from(this.#fileMetadataList.values()), {
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
    this.write('set(CMAKE_CXX_STANDARD 17)\n');
    this.write('set(CMAKE_CXX_STANDARD_REQUIRED ON)\n');
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
        this.write('jsb\n');
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
            this.write('const auto len = d.read<std::uint32_t>();\n');
            this.write(`${key} = d.read_bytes(len);\n`);
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
          `${key} = d.read<${this.#genericNameToString(paramType.value)}>();\n`
        );
        break;
      case GenericName.Boolean:
      case GenericName.Float:
      case GenericName.Double:
      case GenericName.NullTerminatedString:
        throw new Exception('Not implemented');
      case GenericName.String:
        this.write(`${key} = d.read_string();\n`);
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
            this.write('const auto len = d.read<std::uint32_t>();\n');
            this.write(`${key}.resize(len);\n`);
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
    let generator: FileGeneratorCPP;
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
          `${key} = ${metadataGlobalNameToNamespace(metadata)}::decode(d);\n`
        );
        break;
      }
      case 'externalModuleType':
        break;
    }
  }

  #generateSourceFile(metadata: IMetadataTypeDefinition) {
    this.write(`#include "${metadataToRelativePath(metadata)}.hpp"\n`);
    this.write('\n');
    this.write('#include <stdexcept>\n');
    this.write('\n');
    const completeTypeReference = metadataGlobalNameToNamespace(metadata);
    this.write(
      `${completeTypeReference} ${completeTypeReference}::decode(jsb::deserializer& d) {\n`,
      () => {
        this.write(
          '{\n',
          () => {
            this.write('const auto header = d.read<std::int32_t>();\n');
            this.write(
              `if(header != ${metadata.id.toString()}) {\n`,
              () => {
                this.write(
                  `throw std::runtime_error("Invalid CRC header: Expected ${metadata.id.toString()}, but got " + std::to_string(header) + " instead");\n`
                );
              },
              '}\n'
            );
          },
          '}\n'
        );
        this.write(`${completeTypeReference} result;\n`);
        for (const param of metadata.params) {
          this.#deserializeParamType(param.type, `result.${param.name}`);
        }
        this.write('return result;\n');
      },
      '}\n'
    );
    this.write('\n');
    this.write(
      `void ${completeTypeReference}::encode(jsb::serializer& s) const {\n`
    );
    this.indentBlock(() => {
      this.write(`s.write<std::int32_t>(${metadata.id.toString()});\n`);
      for (const param of metadata.params) {
        this.#serializeParamType(param.type, `${param.name}`);
      }
    });
    this.write('}\n');

    this.#files.push({
      path: `${metadataToRelativePath(metadata)}.cpp`,
      contents: this.value()
    });
  }

  #serializeParamTypeTemplate(
    paramType: MetadataParamTypeTemplate,
    key: string
  ) {
    switch (paramType.template) {
      case 'vector':
      case 'set':
        this.write(`s.write<std::uint32_t>(${key}.size());\n`);
        this.write(
          `for (const auto& item : ${key}) {\n`,
          () => {
            this.#serializeParamType(paramType.value, 'item');
          },
          '}\n'
        );
        break;
      case 'optional':
        this.write(`s.write<std::uint8_t>(${key}.has_value() ? 1 : 0);\n`);
        this.write(
          `if (${key}.has_value()) {\n`,
          () => {
            this.#serializeParamType(paramType.value, `${key}.value()`);
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

  #serializeParamType(paramType: MetadataParamType, key: string) {
    switch (paramType.type) {
      case 'generic':
        this.#serializeParamTypeGeneric(paramType, key);
        break;
      case 'template':
        this.#serializeParamTypeTemplate(paramType, key);
        break;
      case 'internalType':
      case 'externalType':
        this.write(`${key}.encode(s);\n`);
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
        this.write(`s.write_bytes(${key});\n`);
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
        this.write(`s.write(${key});\n`);
        break;
      case GenericName.Boolean:
      case GenericName.Float:
      case GenericName.Double:
      case GenericName.NullTerminatedString:
        throw new Exception('Not implemented');
      case GenericName.String:
        this.write(`s.write_string(${key});\n`);
        break;
    }
  }

  #generateHeaderFile(metadata: IMetadataTypeDefinition) {
    const headerGuard = getHeaderGuard(
      `jsb-${metadataToRelativePath(metadata)}-hpp`
    );
    this.write(`#ifndef ${headerGuard}\n`);
    this.write(`#define ${headerGuard}\n\n`);
    this.#includeMetadataDependenciesOnHeaderFile(metadata);
    this.write('\n');
    this.write('#include "jsb/serializer.hpp"\n');
    this.write('#include "jsb/deserializer.hpp"\n');
    this.write('\n');
    const namespace = metadataGlobalNameToNamespace(metadata, -1);
    if (namespace) {
      this.write(
        `namespace ${metadataGlobalNameToNamespace(metadata, -1)} {\n\n`
      );
    }
    this.write(`class ${metadata.name} {\n`);
    this.write('public:\n');
    this.indentBlock(() => {
      for (const param of metadata.params) {
        this.write(
          `${this.#metadataParamTypeToString(param.type)} ${param.name};\n`
        );
      }
      this.write(`static ${metadata.name} decode(jsb::deserializer&);\n`);
      this.write('void encode(jsb::serializer&) const;\n');
    });
    this.write('};\n');
    if (namespace) {
      this.append('\n');
      this.write(`} // ${metadataGlobalNameToNamespace(metadata, -1)}\n`);
    }
    this.write(`#endif // ${headerGuard}\n`);

    this.#files.push({
      path: `${metadataToRelativePath(metadata)}.hpp`,
      contents: this.value()
    });
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
        this.write('#include <tuple>\n');
        for (const arg of paramType.args) {
          this.#includeMetadataDependenciesFromType(arg, metadata);
        }
        break;
      case 'map':
        this.write('#include <unordered_map>\n');
        this.#includeMetadataDependenciesFromType(paramType.key, metadata);
        this.#includeMetadataDependenciesFromType(paramType.value, metadata);
        break;
      case 'bigint':
        throw new Exception('`bigint` is not implemented');
      case 'vector':
      case 'optional':
      case 'set':
        this.#includeMetadataDependenciesFromType(paramType.value, metadata);
        break;
    }
    switch (paramType.template) {
      case 'vector':
        this.write('#include <list>\n');
        break;
      case 'optional':
        this.write('#include <optional>\n');
        break;
      case 'set':
        this.write('#include <unordered_set>\n');
        break;
    }
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

  #includeMetadataDependenciesFromType(
    paramType: MetadataParamType,
    metadata: Metadata
  ) {
    switch (paramType.type) {
      case 'generic':
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
        this.write(
          `#include "${metadataToRelativePath(typeDefinition)}.hpp"\n`
        );
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
          `#include "${metadataToRelativePath(targetFileMetadata)}.hpp"\n`
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
        return 'std::vector<std::uint8_t>';
      case GenericName.Long:
        return 'std::int64_t';
      case GenericName.UnsignedLong:
        return 'std::uint64_t';
      case GenericName.Float:
        return 'std::float';
      case GenericName.Boolean:
        return 'bool';
      case GenericName.Double:
        return 'std::double_t';
      case GenericName.Integer:
      case GenericName.Int32:
        return 'std::int32_t';
      case GenericName.Uint32:
        return 'std::uint32_t';
      case GenericName.Uint16:
        return 'std::uint16_t';
      case GenericName.Int16:
        return 'std::int16_t';
      case GenericName.Uint8:
        return 'std::uint8_t';
      case GenericName.Int8:
        return 'std::int8_t';
      case GenericName.NullTerminatedString:
        return 'const char*';
      case GenericName.String:
        return 'std::string';
    }
  }

  #templateParamTypeToString(paramType: MetadataParamTypeTemplate): string {
    switch (paramType.template) {
      case 'vector':
        return `std::vector<${this.#metadataParamTypeToString(
          paramType.value
        )}>`;
      case 'set':
        return `std::set<${this.#metadataParamTypeToString(paramType.value)}>`;
      case 'optional':
        return `std::optional<${this.#metadataParamTypeToString(
          paramType.value
        )}>`;
      case 'tuple':
        return `std::tuple<${paramType.args
          .map((arg) => this.#metadataParamTypeToString(arg))
          .join(', ')}>`;
      case 'map':
        return `std::map<${this.#metadataParamTypeToString(
          paramType.key
        )}, ${this.#metadataParamTypeToString(paramType.value)}>`;
      case 'bigint':
        return `std::int${paramType.bits}_t`;
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
        return metadataGlobalNameToNamespace(
          this.#resolveMetadataFromDefinitionReference(paramType)
        );
      case 'externalModuleType':
        throw new Exception('External modules are not implemented');
    }
  }
}
