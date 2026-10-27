import type { IFileMetadata } from '../../parser/Parser';
import type { IGeneratedFile } from '../../core/File';
import type { IMetadataTypeDefinition } from '../../parser/types/metadata';
import {
  localImport,
  originalTypeScriptDeclaration,
  originalTypeString,
  validateMetadataGraph
} from '../../parser/metadataContract';
import GenericName from '../../parser/types/GenericName';
import type { IFileGeneratorOptions, IFileGeneratorTypeScript } from './types';
import {
  getCompareFunctionName,
  getDecodeFunctionName,
  getDefaultFunctionName,
  getEncodeFunctionName,
  getTypeInputParamsInterfaceName,
  getUpdateFunctionName,
  getValidateDefinitionFunctionName,
  integerRangeFromBits
} from './fileGeneratorUtilities';
import {
  CodeWriter,
  renderConfiguration,
  renderSupportTypes
} from './rendering';

type ScalarDefinition = IMetadataTypeDefinition & { kind: 'type' };
const integerTypes = new Map<GenericName, { bits: number; signed: boolean }>([
  [GenericName.Integer, { bits: 32, signed: true }],
  [GenericName.Int32, { bits: 32, signed: true }],
  [GenericName.Uint32, { bits: 32, signed: false }],
  [GenericName.Int16, { bits: 16, signed: true }],
  [GenericName.Uint16, { bits: 16, signed: false }],
  [GenericName.Int8, { bits: 8, signed: true }],
  [GenericName.Uint8, { bits: 8, signed: false }],
  [GenericName.Long, { bits: 64, signed: true }],
  [GenericName.UnsignedLong, { bits: 64, signed: false }]
]);
const codecMethods = new Map<GenericName, string>([
  [GenericName.Integer, 'Int32'],
  [GenericName.Int32, 'Int32'],
  [GenericName.Uint32, 'Uint32'],
  [GenericName.Int16, 'Int16'],
  [GenericName.Uint16, 'Uint16'],
  [GenericName.Long, 'SignedLong'],
  [GenericName.UnsignedLong, 'UnsignedLong'],
  [GenericName.Float, 'Float'],
  [GenericName.Double, 'Double'],
  [GenericName.String, 'String'],
  [GenericName.NullTerminatedString, 'NullTerminatedString']
]);

/** Metadata/configuration in, shared generated-file records out. No I/O or
 * schema/legacy-generator dependency belongs in this backend. This increment
 * supports type definitions whose parameters are all primitives.
 */
export default class FileGeneratorTypeScript
  implements IFileGeneratorTypeScript
{
  constructor(
    private readonly files: readonly IFileMetadata[],
    private readonly options: IFileGeneratorOptions = {}
  ) {}
  public async generate(): Promise<IGeneratedFile[]> {
    validateMetadataGraph(this.files, { requireContract: true });
    const indentationSize = this.options.indentationSize ?? 4;
    if (!Number.isInteger(indentationSize) || indentationSize < 0)
      throw new Error(
        'TypeScript indentationSize must be a nonnegative integer'
      );
    // Reject unsupported features before returning any incomplete output.
    for (const file of this.files) {
      if (file.contract!.module || file.contract!.imports.length)
        throw new Error(
          'Native TypeScript imports/modules are not implemented yet'
        );
      for (const declaration of file.metadata) {
        if (
          declaration.kind !== 'type' ||
          declaration.traits.length ||
          declaration.params.some((param) => param.type.type !== 'generic')
        ) {
          throw new Error(
            'Native TypeScript currently supports primitive-only type definitions; calls, traits, templates and references are not implemented yet'
          );
        }
        if (declaration.name === '__proto__' || declaration.name === '__all')
          throw new Error(
            `Native TypeScript metadata key collision: ${declaration.name}`
          );
      }
    }
    const generated: IGeneratedFile[] = [];
    for (const file of [...this.files.slice(1), this.files[0]!]) {
      const declarations = file.metadata.map(
        (_, i) =>
          originalTypeScriptDeclaration(
            file,
            i,
            this.options
          ) as ScalarDefinition
      );
      const renderer = new ScalarFileRenderer(
        file.contract!.logicalPath,
        declarations,
        indentationSize,
        this.options.uniqueNamePropertyName ?? '_name'
      );
      const outputPath = file.contract!.outputPath!;
      generated.push({ path: outputPath, contents: renderer.render() });
      const all = declarations.map((declaration) => ({
        kind: declaration.kind,
        id: declaration.id,
        globalName: declaration.globalName,
        name: declaration.name,
        params: declaration.params.map((param) => ({
          name: param.name,
          type: { type: 'generic', value: scalarType(param.type) }
        }))
      }));
      generated.push({
        path: outputPath.replace(/\.ts$/, '.metadata.json'),
        contents: JSON.stringify({
          ...Object.fromEntries(all.map((item) => [item.name, item])),
          __all: all
        })
      });
    }
    generated.push({
      path: '__types__.ts',
      contents: renderSupportTypes(indentationSize)
    });
    if (this.options.typeScriptConfiguration !== null)
      generated.push({
        path: 'tsconfig.json',
        contents: renderConfiguration({
          compilerOptions: {},
          include: generated
            .filter((file) => file.path.endsWith('.ts'))
            .map((file) => file.path),
          ...this.options.typeScriptConfiguration
        })
      });
    if (new Set(generated.map((file) => file.path)).size !== generated.length)
      throw new Error('Native TypeScript generated-file path collision');
    return generated;
  }
}

function scalarType(
  type: IMetadataTypeDefinition['params'][number]['type']
): GenericName {
  if (type.type !== 'generic')
    throw new Error('Expected a primitive metadata type');
  return type.value;
}

class ScalarFileRenderer {
  private readonly writer: CodeWriter;
  private readonly imports = new Set<string>();
  constructor(
    private readonly logicalPath: string,
    private readonly declarations: ScalarDefinition[],
    indentationSize: number,
    private readonly uniqueName: string
  ) {
    this.writer = new CodeWriter(indentationSize);
  }
  render(): string {
    for (const definition of this.declarations) {
      this.interface(definition);
      this.assertion(definition);
      this.creator(definition);
      this.encoder(definition);
      this.decoder(definition);
      this.defaultCreator(definition);
      this.compare(definition);
      this.update(definition);
    }
    return [...this.imports].join('') + this.writer.value();
  }
  private supportImport(name: string) {
    this.imports.add(
      `import { ${name} } from "${localImport(
        this.logicalPath,
        '__types__'
      )}";\n`
    );
  }
  private parameters(d: ScalarDefinition) {
    for (const p of d.params)
      this.writer.line(`${p.name}: ${originalTypeString(p.type, true)};`);
  }
  private interface(d: ScalarDefinition) {
    this.writer.block(`export interface ${d.name}  {`, () => {
      this.writer.line(`${this.uniqueName}: '${d.globalName}';`);
      this.parameters(d);
    });
  }
  private validation(type: GenericName, value: string): string {
    const range = integerTypes.get(type);
    if (range) {
      this.imports.add('import JSBI from "jsbi";\n');
      const [min, max] = integerRangeFromBits(range);
      const primitive =
        type === GenericName.Long || type === GenericName.UnsignedLong
          ? 'string'
          : 'number';
      return `typeof ${value} === '${primitive}' && JSBI.equal(JSBI.BigInt(${value}),JSBI.BigInt(${value})) && JSBI.greaterThanOrEqual(JSBI.BigInt(${value}),JSBI.BigInt("${min}")) && JSBI.lessThanOrEqual(JSBI.BigInt(${value}),JSBI.BigInt("${max}"))`;
    }
    if (type === GenericName.Bytes) return `${value} instanceof Uint8Array`;
    const primitive =
      type === GenericName.Boolean
        ? 'boolean'
        : type === GenericName.Float || type === GenericName.Double
        ? 'number'
        : 'string';
    return `typeof ${value} === '${primitive}'`;
  }
  private assertion(d: ScalarDefinition) {
    const w = this.writer;
    w.block(
      `export function ${getValidateDefinitionFunctionName(
        d
      )}(value: unknown): value is ${d.name} {`,
      () => {
        // Original validation hard-codes _name, even for a custom discriminator.
        w.line(
          `if(!(typeof value === 'object' && value !== null && '_name' in value && typeof value['_name'] === 'string' && value['_name'] === "${d.globalName}")) return false;`
        );
        d.params.forEach((p, i) => {
          const v = `__v${i}`,
            expression = this.validation(scalarType(p.type), v);
          w.block(
            'if(!(',
            () =>
              w.line(
                `"${p.name}" in value && ((${v}) => (${expression}))(value['${p.name}'])`
              ),
            ')) return false;'
          );
        });
        w.line('return true;');
      }
    );
  }
  private creator(d: ScalarDefinition) {
    const w = this.writer,
      params = getTypeInputParamsInterfaceName(d);
    w.block(`export interface ${params} {`, () => this.parameters(d));
    const argument = d.params.length ? 'params' : '_',
      defaultValue = d.params.length ? '' : ' = {}';
    w.block(
      `export function ${d.name}(${argument}: ${params}${defaultValue}): ${d.name} {`,
      () => {
        w.block(
          'return {',
          () => {
            w.line(
              `${this.uniqueName}: '${d.globalName}'${
                d.params.length ? ',' : ''
              }`
            );
            d.params.forEach((p, i) =>
              w.line(
                `${p.name}: params['${p.name}']${
                  i < d.params.length - 1 ? ',' : ''
                }`
              )
            );
          },
          '};'
        );
      }
    );
  }
  private encoder(d: ScalarDefinition) {
    const w = this.writer;
    this.supportImport('ISerializer');
    w.block(
      `export function ${getEncodeFunctionName(d)}(__s: ISerializer, ${
        d.params.length ? 'value' : '_'
      }: ${d.name}) {`,
      () => {
        w.line(`__s.writeInt32(${d.id});`);
        d.params.forEach((p, i) => {
          w.comment(`encoding param: ${p.name}`);
          const value = `__pv${i}`,
            type = scalarType(p.type),
            method = codecMethods.get(type);
          w.line(`const ${value} = value['${p.name}'];`);
          if (method) w.line(`__s.write${method}(${value});`);
          else if (type === GenericName.Boolean)
            w.line(`__s.writeUint8(${value} === true ? 1 : 0);`);
          else if (type === GenericName.Bytes) {
            w.line(`__s.writeUint32(${value}.byteLength);`);
            w.line(`__s.writeBuffer(${value});`);
          }
          // Original 1.0.28 omits int8/uint8 codec branches. Preserve bytes and
          // record the legacy conflict for independent runtime acceptance.
        });
      }
    );
  }
  private decoder(d: ScalarDefinition) {
    const w = this.writer;
    this.supportImport('IDeserializer');
    w.block(
      `export function ${getDecodeFunctionName(d)}(__d: IDeserializer): ${
        d.name
      } | null {`,
      () => {
        w.line('const __id = __d.readInt32();');
        w.comment('decode header');
        w.line(`if(__id !== ${d.id}) return null;`);
        for (const p of d.params)
          w.line(`let ${p.name}: ${originalTypeString(p.type)};`);
        for (const p of d.params) {
          w.comment(`decoding param: ${p.name}`);
          const type = scalarType(p.type),
            method = codecMethods.get(type);
          if (method) w.line(`${p.name} = __d.read${method}();`);
          else if (type === GenericName.Boolean)
            w.line(`${p.name} = __d.readUint8() === 1;`);
          else if (type === GenericName.Bytes)
            w.line(`${p.name} = __d.readBuffer(__d.readUint32());`);
        }
        w.block(
          'return {',
          () => {
            w.line(`${this.uniqueName}: '${d.globalName}',`);
            d.params.forEach((p, i) =>
              w.line(`${p.name}${i < d.params.length - 1 ? ',' : ''}`)
            );
          },
          '};'
        );
      }
    );
  }
  private defaultCreator(d: ScalarDefinition) {
    const w = this.writer;
    w.block(
      `export function ${getDefaultFunctionName(
        d
      )}(params: Partial<${getTypeInputParamsInterfaceName(d)}> = {}): ${
        d.name
      } {`,
      () => {
        w.block(
          `return ${d.name}({`,
          () => {
            for (const p of d.params) {
              const t = scalarType(p.type);
              const value =
                t === GenericName.Bytes
                  ? 'new Uint8Array(0)'
                  : t === GenericName.Boolean
                  ? 'false'
                  : t === GenericName.Float || t === GenericName.Double
                  ? '0.0'
                  : t === GenericName.Long || t === GenericName.UnsignedLong
                  ? '"0"'
                  : t === GenericName.String ||
                    t === GenericName.NullTerminatedString
                  ? '""'
                  : '0';
              w.line(`${p.name}: ${value},`);
            }
            w.line('...params');
          },
          '});'
        );
      }
    );
  }
  private comparison(type: GenericName, left: string, right: string): string {
    return type === GenericName.Bytes
      ? `${left}.byteLength === ${right}.byteLength && ${left}.every((__byte,index) => ${right}[index] === __byte)`
      : `${left} === ${right}`;
  }
  private compare(d: ScalarDefinition) {
    const w = this.writer;
    w.block(
      `export function ${getCompareFunctionName(d)}(__a: ${d.name}, __b: ${
        d.name
      }): boolean {`,
      () => {
        if (!d.params.length) {
          w.line('return true;');
          return;
        }
        w.block(
          'return (',
          () =>
            d.params.forEach((p, i) => {
              w.comment(`compare parameter ${p.name}`);
              w.line(
                this.comparison(
                  scalarType(p.type),
                  `__a['${p.name}']`,
                  `__b['${p.name}']`
                ) + (i < d.params.length - 1 ? ' &&' : '')
              );
            }),
          ');'
        );
      }
    );
  }
  private update(d: ScalarDefinition) {
    const w = this.writer,
      argument = d.params.length ? 'changes' : '_';
    w.block(
      `export function ${getUpdateFunctionName(d)}(value: ${
        d.name
      }, ${argument}: Partial<${getTypeInputParamsInterfaceName(d)}>) {`,
      () => {
        for (const p of d.params)
          w.block(`if(typeof changes['${p.name}'] !== 'undefined') {`, () => {
            const expression = this.comparison(
              scalarType(p.type),
              `changes['${p.name}']`,
              `value['${p.name}']`
            );
            w.block(`if(!(${expression})) {`, () =>
              w.block(
                `value = ${d.name}({`,
                () => {
                  w.line('...value,');
                  w.line(`${p.name}: changes['${p.name}'],`);
                },
                '});'
              )
            );
          });
        w.line('return value;');
      }
    );
  }
}
