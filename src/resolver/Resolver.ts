import path from 'path';
import Exception from '../../exception/Exception';
import { IFileMetadata } from '../parser/Parser';
import {
  Metadata,
  MetadataParamTypeDefinition
} from '../parser/types/metadata';
import CodeStream from 'textstreamjs';

export interface IResolverOptions {
  generators: Map<string, Resolver>;
  current: IFileMetadata;
  // TODO: Do not extend `CodeStream`
  parent: CodeStream | null;
  indentationSize: number;
}

/**
 * Represents the entity of an individual schema file
 * TODO: Do not extend `CodeStream`
 */
export default class Resolver extends CodeStream {
  readonly #generators: Map<string, Resolver>;
  readonly #current: IFileMetadata;

  public constructor({
    generators,
    current,
    parent,
    indentationSize
  }: IResolverOptions) {
    super(parent ?? undefined, {
      indentationSize
    });
    this.#generators = generators;
    this.#current = current;
  }

  // TODO: Move this to a separate class
  public writeMultiLineComment(lines: (string | (() => void))[]) {
    this.write('/**\n');
    for (const writeLine of lines) {
      this.write(' *');
      if (typeof writeLine === 'string') {
        if (writeLine.length > 0) {
          this.append(' ');
          this.append(writeLine);
        }
      } else {
        writeLine();
      }
      this.append('\n');
    }
    this.write(' */\n');
  }

  public fileMetadata() {
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
  public resolveRelativeImportPath(value: string) {
    const key = path.resolve(path.dirname(this.#current.path), value);
    const generator = this.#generators.get(key) ?? null;
    if (generator === null) {
      throw new Exception(`No generator found for: ${key}`);
    }
    return generator;
  }

  public resolveMetadataParamTypeDefinition(
    paramType: MetadataParamTypeDefinition
  ): Resolver {
    let generator: Resolver;
    switch (paramType.type) {
      case 'internalType':
        generator = this;
        break;
      case 'externalType':
        generator = this.resolveRelativeImportPath(paramType.relativePath);
        break;
    }
    return generator;
  }

  public resolveMetadataFromParamTypeDefinition(
    paramType: MetadataParamTypeDefinition
  ): Metadata {
    const generator = this.resolveMetadataParamTypeDefinition(paramType);
    let identifier: string;
    switch (paramType.type) {
      case 'internalType':
        identifier = paramType.interfaceName;
        break;
      case 'externalType':
        identifier = paramType.name;
        break;
    }
    const metadata =
      generator.#current.metadata.find(
        (metadata) => metadata.name === identifier
      ) ?? null;
    if (metadata === null) {
      throw new Exception(`Failed to find type: ${identifier}`);
    }
    return metadata;
  }
}
