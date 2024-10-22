/**
 * This file contains the implementation of the FileGeneratorC class,
 * which is responsible for generating C99 files based on file metadata.
 *
 * It also includes helper functions for manipulating metadata, and
 * generating header guards.
 */
import CodeStream from 'textstreamjs';
import { IFileMetadata } from '../../parser/Parser';
import Exception from '../../../exception/Exception';
import { IGeneratedFile } from '../../core/File';
import TestGeneratorC from './TestGeneratorC';
import MetadataFileCCodeGenerator from './MetadataFileCCodeGenerator';
import { Metadata } from '../../parser/types/metadata';
import * as fs from 'fs';

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
  indentationSize: number;
}

export default class FileGeneratorC extends CodeStream {
  readonly #fileMetadataList;
  readonly #generators;
  readonly #current;
  readonly #indentationSize;
  readonly #resolverByMetadataObject = new Map<
    Metadata,
    MetadataFileCCodeGenerator
  >();

  readonly #files: IGeneratedFile[] = [];
  readonly #cmake;
  readonly #options: {
    sourceFileExtension: string;
  } = {
    sourceFileExtension: 'c'
  };
  public constructor(
    fileMetadataList: ReadonlyArray<IFileMetadata>,
    {
      current = null,
      root = null,
      cmake,
      indentationSize
    }: IFileGeneratorCOptions
  ) {
    super(root ? root : undefined, {
      indentationSize
    });
    this.#cmake = cmake ?? {
      project: 'schema'
    };
    this.#indentationSize = indentationSize;
    this.#generators = new Map<string, MetadataFileCCodeGenerator>();
    this.#current = current;
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
        const codeGenerator = new MetadataFileCCodeGenerator({
          indentationSize: this.#indentationSize,
          current: fileMetadata,
          sourceFileExtension: this.#options.sourceFileExtension,
          generators: this.#generators,
          contents: await fs.promises.readFile(fileMetadata.path),
          parent: this
        });
        for (const metadata of fileMetadata.metadata) {
          this.#resolverByMetadataObject.set(metadata, codeGenerator);
        }
        this.#generators.set(path, codeGenerator);
      }
      for (const generator of this.#generators.values()) {
        generator.generate();
        this.#files.push(...generator.files());
      }
      this.#generateCMakeListsFile();

      // Generate the test files
      const testGenerator = new TestGeneratorC({
        cmake: {
          projectName: `${this.#cmake.project}_test`
        },
        files: this.#files,
        resolverByMetadataObject: this.#resolverByMetadataObject,
        fileMetadataList: this.#fileMetadataList,
        parent: this,
        indentationSize: this.#indentationSize
      });
      testGenerator.generate();

      this.#files.push(...testGenerator.files());

      return this.#files;
    }
    return null;
  }

  /**
   * Generate the schema CMake library
   * @param suffix Library name suffix (.e.g. _static)
   */
  #generateCMakeTarget(suffix: string, libraryType: 'STATIC' | 'SHARED') {
    const targetName = `${this.#cmake.project}${suffix}`;
    this.write(
      'add_library(\n',
      () => {
        this.write(`${targetName} ${libraryType}\n`);
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
        this.write(`${targetName}\n`);
        this.write('PUBLIC\n');
        this.write('jsb_c_static\n');
      },
      ')\n'
    );
    this.write(
      'target_compile_options(\n',
      () => {
        this.write(`${targetName}\n`);
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
        this.write(`${targetName}\n`);
        this.write('PUBLIC\n');
        this.write('${CMAKE_CURRENT_SOURCE_DIR}\n');
      },
      ')\n'
    );

    return targetName;
  }

  #generateCMakeListsFile() {
    if (!this.#files.length) {
      throw new Exception('No files to generate CMakeLists.txt from');
    }

    this.write('cmake_minimum_required(VERSION 3.5)\n');
    this.write(`project(${this.#cmake.project} C)\n`);
    this.append('\n');
    this.write('set(CMAKE_C_STANDARD 99)\n');
    this.write('set(CMAKE_C_STANDARD_REQUIRED ON)\n');
    this.write('set(CMAKE_C_EXTENSIONS ON)\n');
    this.append('\n');

    const staticTargetName = this.#generateCMakeTarget('_static', 'STATIC');
    this.#generateCMakeTarget('', 'SHARED');

    this.append('\n');
    this.append('\n');

    this.write('if(JSB_SCHEMA_TESTS MATCHES ON)\n');
    this.indentBlock(() => {
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
        `target_link_libraries(${
          this.#cmake.project
        }_test PRIVATE ${staticTargetName})\n`
      );
    });
    this.write('endif()\n');
    this.append('\n');

    this.#files.push({
      path: 'CMakeLists.txt',
      contents: this.value()
    });
  }
}
