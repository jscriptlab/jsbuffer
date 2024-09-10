import { ITextDecoder } from '@jsbuffer/codec/Deserializer';
import { ITextEncoder } from '@jsbuffer/codec/Serializer';
import { IFileMetadata } from '../../parser/Parser';

export interface IFileGeneratorTypeScript {
  // constructor(
  //   fileMetadataList: ReadonlyArray<IFileMetadata>,
  //   options: IFileGeneratorOptions<IFileGeneratorTypeScript>
  // ): IFileGeneratorTypeScript;
}

export interface ICompilerOptions {
  rootDir: string;
  outDir: string;
}

export interface IGeneratedFile {
  path: string;
  contents: string;
}

export interface IFileGeneratorOptions<T extends IFileGeneratorTypeScript> {
  current?: IFileMetadata | null;
  indentationSize: number;
  textDecoder: ITextDecoder;
  typeScriptConfiguration?: Partial<ITypeScriptConfiguration> | null;
  textEncoder: ITextEncoder;
  root: T | null;
  uniqueNamePropertyName?: string | null;
  externalModule?: boolean | null;
  compilerOptions: ICompilerOptions;
  /**
   * sort properties based on their names
   */
  sortProperties?: boolean;
}

export interface ITypeScriptConfiguration {
  include: string[];
  compilerOptions: Record<string, unknown>;
  extends: string;
}
