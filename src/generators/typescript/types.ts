import type { IGeneratedFile } from '../../core/File';
import type { IMetadataTypeScriptOptions } from '../../parser/metadataContract';
export type { IGeneratedFile } from '../../core/File';
export type IFileGeneratorOptions = IMetadataTypeScriptOptions;
export interface IFileGeneratorTypeScript {
  generate(): Promise<IGeneratedFile[]>;
}
