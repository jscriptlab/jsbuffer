import * as fs from 'fs';
import * as path from 'path';
import { IFileMetadata } from '../src/parser/Parser';
import { Metadata } from '../src/parser/types/metadata';

/**
 * Name of the ordered manifest written next to the metadata files by
 * `jsb --metadata-only`. When present, it records the exact parser file order
 * so that `--from-metadata` can reproduce byte-identical output.
 */
export const METADATA_MANIFEST_FILE_NAME = 'metadata.index.json';

interface IMetadataManifest {
  files: string[];
}

function isMetadataManifest(value: unknown): value is IMetadataManifest {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { files?: unknown }).files) &&
    (value as { files: unknown[] }).files.every(
      (file) => typeof file === 'string'
    )
  );
}

/**
 * Recursively collect all `*.metadata.json` files under `directory`.
 */
async function collectMetadataFiles(directory: string): Promise<string[]> {
  const result = new Array<string>();
  const entries = await fs.promises.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.resolve(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await collectMetadataFiles(absolutePath)));
    } else if (entry.isFile() && entry.name.endsWith('.metadata.json')) {
      result.push(absolutePath);
    }
  }
  return result;
}

/**
 * Read and validate the ordered manifest from `directory`, returning `null`
 * when the directory does not contain one.
 */
async function readManifest(
  directory: string
): Promise<IMetadataManifest | null> {
  const manifestPath = path.resolve(directory, METADATA_MANIFEST_FILE_NAME);
  let contents: string;
  try {
    contents = await fs.promises.readFile(manifestPath, 'utf8');
  } catch {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch (reason) {
    throw new Error(
      `Failed to parse metadata manifest "${manifestPath}" as JSON: ${reason}`
    );
  }
  if (!isMetadataManifest(parsed)) {
    throw new Error(
      `Metadata manifest "${manifestPath}" does not contain a valid { files: string[] } object`
    );
  }
  return parsed;
}

function isMetadataArray(value: unknown): value is Metadata[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { kind?: unknown }).kind === 'string'
    )
  );
}

/**
 * Parse a single `*.metadata.json` file into an {@link IFileMetadata} object.
 *
 * The metadata files dumped by the `--metadata-only` flag hold the full
 * `IFileMetadata` structure (`{ path, metadata }`), so we validate the minimal
 * shape and hand it back untouched.
 */
export function parseFileMetadata(
  contents: string,
  sourceFilePath: string
): IFileMetadata {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch (reason) {
    throw new Error(
      `Failed to parse metadata file "${sourceFilePath}" as JSON: ${reason}`
    );
  }
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as { path?: unknown }).path !== 'string' ||
    !isMetadataArray((parsed as { metadata?: unknown }).metadata)
  ) {
    throw new Error(
      `Metadata file "${sourceFilePath}" does not contain a valid { path, metadata } object`
    );
  }
  return parsed as IFileMetadata;
}

/**
 * Load an entire {@link IFileMetadata} list from a directory (or a single file)
 * previously produced by `jsb --metadata-only`.
 *
 * This is what allows the unified CLI to generate source code straight from the
 * metadata JSON files, without re-parsing the original `.jsb` schema.
 */
export default async function loadFileMetadataList(
  metadataPath: string
): Promise<IFileMetadata[]> {
  const stat = await fs.promises.stat(metadataPath);

  let files: string[];
  if (stat.isDirectory()) {
    /**
     * Prefer the ordered manifest when it exists so we reproduce the exact
     * parser file order (and therefore byte-identical generated output).
     */
    const manifest = await readManifest(metadataPath);
    if (manifest !== null) {
      files = manifest.files.map((file) => path.resolve(metadataPath, file));
    } else {
      files = await collectMetadataFiles(metadataPath);
      /**
       * Without a manifest, sort the files so the resulting list is at least
       * deterministic regardless of the order the file system happens to
       * return directory entries in.
       */
      files.sort();
    }
  } else {
    files = [metadataPath];
  }

  if (files.length === 0) {
    throw new Error(
      `No "*.metadata.json" files were found under "${metadataPath}"`
    );
  }

  const fileMetadataList = new Array<IFileMetadata>();
  for (const file of files) {
    const contents = await fs.promises.readFile(file, 'utf8');
    fileMetadataList.push(parseFileMetadata(contents, file));
  }
  return fileMetadataList;
}
