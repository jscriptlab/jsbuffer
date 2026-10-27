import crc from 'crc';
import path from 'path';
import type { IFileMetadata } from './Parser';
import { Metadata, MetadataParamType } from './types/metadata';
import GenericName from './types/GenericName';
import lowerFirst from '../utilities/string/lowerFirst';

export const METADATA_CONTRACT_VERSION = 1;
export const TYPESCRIPT_COMPATIBILITY_PROFILE = 'jsbuffer@1.0.28';

export interface IMetadataReference {
  /** JSON pointer into this file's metadata array. */
  at: string;
  file: string;
  name: string;
}

export interface IMetadataFileContract {
  version: 1;
  profile: 'jsbuffer@1.0.28';
  /** Paths use '/' and are relative to the original schema root. */
  logicalPath: string;
  entryPoint: string;
  fileOrder: number;
  /** External files participate in resolution but are not emitted. */
  outputPath: string | null;
  module: { root: string; outDir: string; importPath: string } | null;
  sortProperties: boolean;
  imports: Array<{
    specifier: string;
    file: string;
    importPath: string;
    identifiers: string[] | null;
  }>;
  exports: string[];
  declarations: Array<{
    name: string;
    /** Original 1.x wire name, independent of modern Metadata.globalName. */
    globalName: string;
    sourceParamOrder: string[];
    crcInput: string;
    id: number;
  }>;
  references: IMetadataReference[];
}

/** Explicit backend inputs; defaults belong to the compatibility profile. */
export interface IMetadataTypeScriptOptions {
  indentationSize?: number;
  uniqueNamePropertyName?: string;
  sortProperties?: boolean;
  typeScriptConfiguration?: Record<string, unknown> | null;
}

export function originalGlobalName(logicalPath: string, name: string): string {
  return `${logicalPath.split('/').map(lowerFirst).join('.')}.${name}`;
}

/** Preserve original spellings, including tuple commas and readonly returns. */
export function originalTypeString(
  type: MetadataParamType,
  readOnly = false
): string {
  switch (type.type) {
    case 'generic':
      switch (type.value) {
        case GenericName.Boolean:
          return 'boolean';
        case GenericName.Bytes:
          return 'Uint8Array';
        case GenericName.String:
        case GenericName.NullTerminatedString:
        case GenericName.Long:
        case GenericName.UnsignedLong:
          return 'string';
        default:
          return 'number';
      }
    case 'internalType':
      return readOnly ? `Readonly<${type.interfaceName}>` : type.interfaceName;
    case 'externalType':
    case 'externalModuleType':
      return readOnly ? `Readonly<${type.name}>` : type.name;
    case 'template':
      switch (type.template) {
        case 'optional':
          return `${originalTypeString(type.value, readOnly)} | null`;
        case 'bigint':
          return 'string';
        case 'tuple':
          return `[${type.args
            .map((t) => originalTypeString(t, readOnly))
            .join(',')}]`;
        case 'map':
          return `${readOnly ? 'ReadonlyMap' : 'Map'}<${originalTypeString(
            type.key,
            readOnly
          )}, ${originalTypeString(type.value, readOnly)}>`;
        case 'vector':
          return `${readOnly ? 'ReadonlyArray' : 'Array'}<${originalTypeString(
            type.value,
            readOnly
          )}>`;
        case 'set':
          return `${readOnly ? 'ReadonlySet' : 'Set'}<${originalTypeString(
            type.value,
            readOnly
          )}>`;
      }
  }
}

export function originalCRCInput(
  logicalPath: string,
  metadata: Metadata
): string {
  const identity = `${logicalPath}/${metadata.name}`;
  if (metadata.kind === 'trait') return identity;
  const prefix =
    metadata.kind === 'call'
      ? `${originalTypeString(metadata.returnType!, true)} => `
      : '';
  return `${prefix}${identity} : ${metadata.params
    .map((p) => originalTypeString(p.type))
    .join(', ')}`;
}

export function signedCRC32(input: string): number {
  return crc.crc32(input) | 0;
}

/** Select original wire identity/order without mutating other consumers' data.
 * A sorted export can still reproduce the original unsorted default, and vice
 * versa. This operates only on persisted semantics, never on schema files.
 */
export function originalTypeScriptDeclaration(
  file: IFileMetadata,
  index: number,
  options: Pick<IMetadataTypeScriptOptions, 'sortProperties'> = {}
): Metadata {
  validateFileMetadata(file, 'file', true);
  const metadata = file.metadata[index];
  const declaration = file.contract!.declarations[index];
  requireValue(metadata && declaration, 'declaration', 'index is out of range');
  if (metadata.kind === 'trait')
    return { ...metadata, globalName: declaration.globalName };
  const names = [...declaration.sourceParamOrder];
  if (options.sortProperties) names.sort((a, b) => a.localeCompare(b));
  const params = new Map(metadata.params.map((param) => [param.name, param]));
  const result = {
    ...metadata,
    globalName: declaration.globalName,
    params: names.map((name) => params.get(name)!)
  };
  result.id = signedCRC32(originalCRCInput(file.contract!.logicalPath, result));
  return result;
}

export function visitMetadataReferences(
  metadata: readonly Metadata[],
  visit: (
    type: Extract<
      MetadataParamType,
      { type: 'internalType' | 'externalType' | 'externalModuleType' }
    >,
    at: string
  ) => void
): void {
  function walk(type: MetadataParamType, at: string) {
    switch (type.type) {
      case 'generic':
        break;
      case 'internalType':
      case 'externalType':
      case 'externalModuleType':
        visit(type, at);
        break;
      case 'template':
        switch (type.template) {
          case 'bigint':
            break;
          case 'tuple':
            type.args.forEach((arg, i) => walk(arg, `${at}/args/${i}`));
            break;
          case 'map':
            walk(type.key, `${at}/key`);
            walk(type.value, `${at}/value`);
            break;
          default:
            walk(type.value, `${at}/value`);
        }
    }
  }
  metadata.forEach((item, i) => {
    const at = `/metadata/${i}`;
    if (item.kind === 'trait')
      item.nodes.forEach((type, j) => walk(type, `${at}/nodes/${j}`));
    else {
      item.params.forEach((param, j) =>
        walk(param.type, `${at}/params/${j}/type`)
      );
      item.traits?.forEach((type, j) => walk(type, `${at}/traits/${j}`));
      if (item.returnType) walk(item.returnType, `${at}/returnType`);
    }
  });
}

function requireValue(
  condition: unknown,
  at: string,
  message: string
): asserts condition {
  if (!condition) throw new Error(`Invalid metadata at ${at}: ${message}`);
}
function object(
  value: unknown,
  at: string
): asserts value is Record<string, unknown> {
  requireValue(
    typeof value === 'object' && value !== null && !Array.isArray(value),
    at,
    'expected an object'
  );
}
function string(value: unknown, at: string): asserts value is string {
  requireValue(
    typeof value === 'string' && value.length > 0,
    at,
    'expected a nonempty string'
  );
}
function array(value: unknown, at: string): asserts value is unknown[] {
  requireValue(Array.isArray(value), at, 'expected an array');
}
function strings(value: unknown, at: string): asserts value is string[] {
  array(value, at);
  value.forEach((v, i) => string(v, `${at}/${i}`));
  requireValue(new Set(value).size === value.length, at, 'duplicate entries');
}
function logicalPath(
  value: unknown,
  at: string,
  allowRoot = false
): asserts value is string {
  string(value, at);
  requireValue(
    !value.includes('\\') &&
      !value.includes('\0') &&
      !value.startsWith('/') &&
      !/^[A-Za-z]:/.test(value) &&
      path.posix.normalize(value) === value &&
      value !== '..' &&
      !value.startsWith('../') &&
      (allowRoot || value !== '.'),
    at,
    'expected a normalized path inside the schema root'
  );
}
function position(value: unknown, at: string) {
  object(value, at);
  for (const key of ['start', 'end']) {
    const token = value[key];
    object(token, `${at}/${key}`);
    requireValue(
      Number.isInteger(token['type']) && typeof token['value'] === 'string',
      `${at}/${key}`,
      'invalid token'
    );
    object(token['position'], `${at}/${key}/position`);
    const { start, end } = token['position'];
    requireValue(
      Number.isInteger(start) &&
        Number.isInteger(end) &&
        (start as number) >= 0 &&
        (end as number) >= (start as number),
      at,
      'invalid token offsets'
    );
  }
}

function validateType(value: unknown, at: string) {
  object(value, at);
  position(value['position'], `${at}/position`);
  switch (value['type']) {
    case 'generic':
      requireValue(
        Object.values(GenericName).includes(value['value'] as GenericName),
        at,
        'unknown generic'
      );
      break;
    case 'internalType':
      string(value['interfaceName'], `${at}/interfaceName`);
      break;
    case 'externalType':
      string(value['name'], `${at}/name`);
      string(value['relativePath'], `${at}/relativePath`);
      break;
    case 'externalModuleType':
      string(value['name'], `${at}/name`);
      string(value['importPath'], `${at}/importPath`);
      break;
    case 'template':
      switch (value['template']) {
        case 'optional':
        case 'vector':
        case 'set':
          validateType(value['value'], `${at}/value`);
          break;
        case 'map':
          validateType(value['key'], `${at}/key`);
          validateType(value['value'], `${at}/value`);
          break;
        case 'tuple':
          array(value['args'], `${at}/args`);
          value['args'].forEach((t, i) => validateType(t, `${at}/args/${i}`));
          break;
        case 'bigint':
          requireValue(
            typeof value['bits'] === 'string' &&
              /^[0-9]+$/.test(value['bits']) &&
              BigInt(value['bits']) > 0n,
            at,
            'invalid bigint width'
          );
          break;
        default:
          throw new Error(`Invalid metadata at ${at}: unknown template`);
      }
      break;
    default:
      throw new Error(`Invalid metadata at ${at}: unknown type`);
  }
}

export function validateFileMetadata(
  value: unknown,
  at = 'file',
  requireContract = false
): asserts value is IFileMetadata {
  object(value, at);
  string(value['path'], `${at}/path`);
  array(value['metadata'], `${at}/metadata`);
  const rich = value['contract'] !== undefined;
  requireValue(
    !requireContract || rich,
    at,
    'a versioned contract is required; export metadata again'
  );
  // Old dumps retain their established permissive load behavior. New contracts
  // are never silently interpreted as old metadata when incomplete.
  if (!rich) {
    value['metadata'].forEach((m, i) => {
      object(m, `${at}/metadata/${i}`);
      string(m['kind'], `${at}/metadata/${i}/kind`);
    });
    return;
  }
  const c = value['contract'];
  object(c, `${at}/contract`);
  requireValue(
    c['version'] === METADATA_CONTRACT_VERSION &&
      c['profile'] === TYPESCRIPT_COMPATIBILITY_PROFILE,
    at,
    'unsupported contract version or profile'
  );
  logicalPath(c['logicalPath'], `${at}/contract/logicalPath`);
  logicalPath(c['entryPoint'], `${at}/contract/entryPoint`);
  requireValue(
    Number.isInteger(c['fileOrder']) && (c['fileOrder'] as number) >= 0,
    at,
    'invalid file order'
  );
  requireValue(
    typeof c['sortProperties'] === 'boolean',
    at,
    'missing sortProperties'
  );
  requireValue(
    c['outputPath'] === `${c['logicalPath']}.ts` || c['outputPath'] === null,
    at,
    'invalid output path'
  );
  if (c['module'] !== null) {
    object(c['module'], `${at}/contract/module`);
    logicalPath(c['module']['root'], `${at}/contract/module/root`, true);
    string(c['module']['outDir'], `${at}/contract/module/outDir`);
    string(c['module']['importPath'], `${at}/contract/module/importPath`);
    const moduleRoot = c['module']['root'];
    const localPath = path.posix.relative(moduleRoot, c['logicalPath']);
    const segments = moduleRoot.split('/');
    const nodeModules = segments.lastIndexOf('node_modules');
    requireValue(
      nodeModules >= 0 && localPath !== '..' && !localPath.startsWith('../'),
      at,
      'external file is outside its module root'
    );
    const moduleName = segments.slice(nodeModules + 1).join('/');
    const compiled = path.posix.join(
      moduleName,
      c['module']['outDir'],
      localPath
    );
    requireValue(
      c['module']['importPath'] === compiled,
      at,
      'module output identity is inconsistent'
    );
    requireValue(
      c['outputPath'] === null,
      at,
      'external modules must not be emitted'
    );
  } else
    requireValue(
      c['outputPath'] !== null,
      at,
      'local files need an output path'
    );
  strings(c['exports'], `${at}/contract/exports`);
  array(c['imports'], `${at}/contract/imports`);
  c['imports'].forEach((imp, i) => {
    const p = `${at}/contract/imports/${i}`;
    object(imp, p);
    string(imp['specifier'], `${p}/specifier`);
    logicalPath(imp['file'], `${p}/file`);
    string(imp['importPath'], `${p}/importPath`);
    if (imp['identifiers'] !== null)
      strings(imp['identifiers'], `${p}/identifiers`);
  });
  const declarations = c['declarations'];
  array(declarations, `${at}/contract/declarations`);
  requireValue(
    declarations.length === value['metadata'].length,
    at,
    'declaration order is incomplete'
  );
  const names = new Set<string>();
  value['metadata'].forEach((item, i) => {
    const p = `${at}/metadata/${i}`;
    object(item, p);
    string(item['name'], `${p}/name`);
    string(item['globalName'], `${p}/globalName`);
    requireValue(!names.has(item['name']), p, 'duplicate declaration');
    names.add(item['name']);
    requireValue(typeof item['exported'] === 'boolean', p, 'missing exported');
    position(item['position'], `${p}/position`);
    let params: string[] = [];
    if (item['kind'] === 'trait') {
      array(item['nodes'], `${p}/nodes`);
      item['nodes'].forEach((type, j) => validateType(type, `${p}/nodes/${j}`));
    } else {
      requireValue(
        item['kind'] === 'type' || item['kind'] === 'call',
        p,
        'unknown declaration kind'
      );
      requireValue(
        Number.isInteger(item['id']) &&
          (item['id'] as number) >= -2147483648 &&
          (item['id'] as number) <= 2147483647,
        p,
        'invalid signed CRC32'
      );
      array(item['params'], `${p}/params`);
      item['params'].forEach((param, j) => {
        const q = `${p}/params/${j}`;
        object(param, q);
        string(param['name'], `${q}/name`);
        params.push(param['name']);
        position(param['position'], `${q}/position`);
        validateType(param['type'], `${q}/type`);
      });
      requireValue(
        new Set(params).size === params.length,
        p,
        'duplicate parameter'
      );
      array(item['traits'], `${p}/traits`);
      item['traits'].forEach((type, j) =>
        validateType(type, `${p}/traits/${j}`)
      );
      if (item['kind'] === 'call')
        validateType(item['returnType'], `${p}/returnType`);
      else
        requireValue(
          item['returnType'] === undefined,
          p,
          'a type cannot have a returnType'
        );
    }
    const d = declarations[i];
    object(d, `${p}/contract`);
    strings(d['sourceParamOrder'], `${p}/sourceParamOrder`);
    requireValue(
      d['sourceParamOrder'].length === params.length &&
        d['sourceParamOrder'].every((name) => params.includes(name)),
      p,
      'source parameter order is inconsistent'
    );
    const emitted = c['sortProperties']
      ? [...d['sourceParamOrder']].sort((a, b) => a.localeCompare(b))
      : d['sourceParamOrder'];
    requireValue(
      JSON.stringify(emitted) === JSON.stringify(params),
      p,
      'emitted parameter order is inconsistent'
    );
    const m = item as unknown as Metadata;
    requireValue(
      m.globalName ===
        originalGlobalName(
          (c['logicalPath'] as string).replace(/\.jsb$/, ''),
          m.name
        ),
      p,
      'Metadata.globalName is inconsistent'
    );
    requireValue(
      d['name'] === item['name'] &&
        d['globalName'] ===
          originalGlobalName(c['logicalPath'] as string, item['name']),
      p,
      'original identity is inconsistent'
    );
    const input = originalCRCInput(c['logicalPath'] as string, m);
    requireValue(
      d['crcInput'] === input && d['id'] === signedCRC32(input),
      p,
      'CRC input or id is inconsistent'
    );
    if (m.kind !== 'trait')
      requireValue(
        m.id === d['id'],
        p,
        'Metadata.id disagrees with the original CRC'
      );
  });
  const exported = (value['metadata'] as unknown as Metadata[])
    .filter((m) => m.exported)
    .map((m) => m.name);
  requireValue(
    JSON.stringify(c['exports']) === JSON.stringify(exported),
    at,
    'export order is inconsistent'
  );
  array(c['references'], `${at}/contract/references`);
  c['references'].forEach((ref, i) => {
    const p = `${at}/contract/references/${i}`;
    object(ref, p);
    string(ref['at'], `${p}/at`);
    logicalPath(ref['file'], `${p}/file`);
    string(ref['name'], `${p}/name`);
  });
}

export function validateMetadataGraph(
  files: readonly IFileMetadata[],
  options: { requireContract?: boolean } = {}
): void {
  requireValue(files.length > 0, 'graph', 'empty file list');
  const rich =
    options.requireContract ||
    files.some((file) => file.contract !== undefined);
  files.forEach((file, i) => validateFileMetadata(file, `files/${i}`, rich));
  if (!rich) return;
  const byPath = new Map<string, IFileMetadata>();
  const entry = files[0]!.contract!.entryPoint;
  files.forEach((file, i) => {
    const c = file.contract!;
    requireValue(
      !byPath.has(c.logicalPath),
      c.logicalPath,
      'duplicate logical file'
    );
    requireValue(
      c.fileOrder === i && c.entryPoint === entry,
      c.logicalPath,
      'file order or entry point is inconsistent'
    );
    byPath.set(c.logicalPath, file);
  });
  requireValue(
    files[0]!.contract!.logicalPath === entry,
    'graph',
    'entry point must be the first file'
  );
  for (const file of files) {
    const c = file.contract!;
    for (const imp of c.imports) {
      const target = byPath.get(imp.file);
      requireValue(target, c.logicalPath, `missing imported file ${imp.file}`);
      const expected =
        target.contract!.module?.importPath ??
        localImport(c.logicalPath, imp.file);
      requireValue(
        imp.importPath === expected,
        c.logicalPath,
        'compiled import path is inconsistent'
      );
      for (const name of imp.identifiers ?? [])
        requireValue(
          target.metadata.some((m) => m.name === name && m.exported),
          c.logicalPath,
          `missing exported import ${imp.file}:${name}`
        );
    }
    const refs = new Map(c.references.map((ref) => [ref.at, ref]));
    requireValue(
      refs.size === c.references.length,
      c.logicalPath,
      'duplicate reference locations'
    );
    visitMetadataReferences(file.metadata, (type, at) => {
      const ref = refs.get(at);
      const name =
        type.type === 'internalType' ? type.interfaceName : type.name;
      requireValue(
        ref && ref.name === name,
        `${c.logicalPath}${at}`,
        'missing or inconsistent resolved reference'
      );
      const target = byPath.get(ref.file);
      requireValue(target, at, `missing referenced file ${ref.file}`);
      requireValue(
        target.metadata.some(
          (m) => m.name === name && (target === file || m.exported)
        ),
        at,
        `unresolved declaration ${ref.file}:${name}`
      );
      if (type.type === 'internalType')
        requireValue(
          target === file,
          at,
          'internal reference points to another file'
        );
      else {
        const expected =
          target.contract!.module?.importPath ??
          localImport(c.logicalPath, ref.file);
        const actual =
          type.type === 'externalType' ? type.relativePath : type.importPath;
        requireValue(
          actual === expected &&
            (type.type === 'externalModuleType') ===
              (target.contract!.module !== null),
          at,
          'resolved reference import is inconsistent'
        );
      }
      refs.delete(at);
    });
    requireValue(
      refs.size === 0,
      c.logicalPath,
      'unexpected resolved reference locations'
    );
  }
}

export function localImport(from: string, to: string): string {
  const relative = path.posix.relative(path.posix.dirname(from), to);
  return relative.startsWith('.') ? relative : `./${relative}`;
}

export function serializeFileMetadata(
  file: IFileMetadata,
  indentationSize = 2
): string {
  validateFileMetadata(file);
  return JSON.stringify(file, null, indentationSize);
}
