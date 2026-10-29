import type { IFileMetadata } from '../../parser/Parser';
import type { IGeneratedFile } from '../../core/File';
import type {
  IMetadataTypeDefinition,
  MetadataParamType
} from '../../parser/types/metadata';
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

type TypeDefinition = IMetadataTypeDefinition & { kind: 'type' };
type CompactType =
  | { type: 'generic'; value: GenericName }
  | { type: 'template'; template: 'vector' | 'optional'; value: CompactType };

function supportedType(type: MetadataParamType, nested = false): boolean {
  return (
    // Do not expand the known original 8-bit codec omission into new templates.
    // Its wire-compatibility decision remains VQ-1178.
    (type.type === 'generic' &&
      (!nested ||
        codecMethods.has(type.value) ||
        type.value === GenericName.Boolean ||
        type.value === GenericName.Bytes)) ||
    (type.type === 'template' &&
      (type.template === 'vector' || type.template === 'optional') &&
      supportedType(type.value, true))
  );
}

function compactType(type: MetadataParamType): CompactType {
  if (type.type === 'generic') return { type: 'generic', value: type.value };
  if (
    type.type === 'template' &&
    (type.template === 'vector' || type.template === 'optional')
  ) {
    return {
      type: 'template',
      template: type.template,
      value: compactType(type.value)
    };
  }
  throw new Error('Unsupported native TypeScript metadata type');
}
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
 * supports primitive types and recursive vector/optional templates.
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
          declaration.params.some((param) => !supportedType(param.type))
        ) {
          throw new Error(
            'Native TypeScript supports primitives and vector/optional templates over verified primitive codecs; calls, traits, other templates, references and 8-bit template codecs are not implemented yet'
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
          originalTypeScriptDeclaration(file, i, this.options) as TypeDefinition
      );
      const renderer = new TypeFileRenderer(
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
          type: compactType(param.type)
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

class TypeFileRenderer {
  private readonly writer: CodeWriter;
  private readonly imports = new Set<string>();
  constructor(
    private readonly logicalPath: string,
    private readonly declarations: TypeDefinition[],
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
  private parameters(d: TypeDefinition) {
    for (const p of d.params)
      this.writer.line(`${p.name}: ${originalTypeString(p.type, true)};`);
  }
  private interface(d: TypeDefinition) {
    this.writer.block(`export interface ${d.name}  {`, () => {
      this.writer.line(`${this.uniqueName}: '${d.globalName}';`);
      this.parameters(d);
    });
  }
  private primitiveValidation(type: GenericName, value: string): string {
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
  private validation(
    type: MetadataParamType,
    value: string,
    depth: number
  ): [string, number] {
    if (type.type === 'generic')
      return [this.primitiveValidation(type.value, value), depth];
    if (type.type === 'template' && type.template === 'optional') {
      const [inner, next] = this.validation(type.value, 'x', depth + 1);
      return [`${value} === null ? true : ((x) => (${inner}))(${value})`, next];
    }
    if (type.type === 'template' && type.template === 'vector') {
      const [inner] = this.validation(type.value, 'p', depth + 1);
      // The original does not propagate validation depth out of vectors.
      return [
        `(Array.isArray(${value}) || ${value} instanceof Set) && Array.from(${value}).every(p => (${inner}))`,
        depth
      ];
    }
    throw new Error('Unsupported native TypeScript validation type');
  }
  private assertion(d: TypeDefinition) {
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
        let depth = 0;
        d.params.forEach((p) => {
          const v = `__v${depth}`;
          const [expression, next] = this.validation(p.type, v, depth);
          depth = next + 1;
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
  private creator(d: TypeDefinition) {
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
  private encodeType(
    type: MetadataParamType,
    value: string,
    depth: number
  ): number {
    const w = this.writer;
    if (type.type === 'generic') {
      const method = codecMethods.get(type.value);
      if (method) w.line(`__s.write${method}(${value});`);
      else if (type.value === GenericName.Boolean)
        w.line(`__s.writeUint8(${value} === true ? 1 : 0);`);
      else if (type.value === GenericName.Bytes) {
        w.line(`__s.writeUint32(${value}.byteLength);`);
        w.line(`__s.writeBuffer(${value});`);
      }
      // The original's omitted 8-bit branches remain a separate acceptance decision.
    } else if (type.type === 'template' && type.template === 'optional') {
      w.block(
        `if(${value} === null) {`,
        () => w.line('__s.writeUint8(0);'),
        '} else {'
      );
      w.indent(() => {
        w.line('__s.writeUint8(1);');
        depth = this.encodeType(type.value, value, depth + 1);
      });
      w.line('}');
    } else if (type.type === 'template' && type.template === 'vector') {
      const item = `__item${depth}`,
        length = `__l${depth}`;
      w.line(`const ${length} = ${value}.length;`);
      w.line(`__s.writeUint32(${length});`);
      w.block(`for(const ${item} of ${value}) {`, () => {
        depth = this.encodeType(type.value, item, depth + 1);
      });
    } else throw new Error('Unsupported native TypeScript encoding type');
    return depth;
  }
  private encoder(d: TypeDefinition) {
    const w = this.writer;
    this.supportImport('ISerializer');
    w.block(
      `export function ${getEncodeFunctionName(d)}(__s: ISerializer, ${
        d.params.length ? 'value' : '_'
      }: ${d.name}) {`,
      () => {
        w.line(`__s.writeInt32(${d.id});`);
        let depth = 0;
        d.params.forEach((p) => {
          w.comment(`encoding param: ${p.name}`);
          const value = `__pv${depth}`;
          w.line(`const ${value} = value['${p.name}'];`);
          depth = this.encodeType(p.type, value, depth + 1);
        });
      }
    );
  }
  private decodeType(
    type: MetadataParamType,
    value: string,
    depth: number
  ): number {
    const w = this.writer;
    if (type.type === 'generic') {
      const method = codecMethods.get(type.value);
      if (method) w.line(`${value} = __d.read${method}();`);
      else if (type.value === GenericName.Boolean)
        w.line(`${value} = __d.readUint8() === 1;`);
      else if (type.value === GenericName.Bytes)
        w.line(`${value} = __d.readBuffer(__d.readUint32());`);
    } else if (type.type === 'template' && type.template === 'optional') {
      w.block(
        'if(__d.readUint8() === 1) {',
        () => {
          depth = this.decodeType(type.value, value, depth + 1);
        },
        '} else {'
      );
      w.indent(() => w.line(`${value} = null;`));
      w.line('}');
    } else if (type.type === 'template' && type.template === 'vector') {
      const index = `__i${depth}`,
        length = `__l${depth}`,
        out = `__o${depth}`;
      w.line(`const ${length} = __d.readUint32();`);
      w.line(
        `const ${out} = new Array<${originalTypeString(
          type.value
        )}>(${length});`
      );
      w.line(`${value} = ${out};`);
      w.block(
        `for(let ${index} = 0; ${index} < ${length}; ${index}++) {`,
        () => {
          depth = this.decodeType(type.value, `${out}[${index}]`, depth + 1);
        }
      );
    } else throw new Error('Unsupported native TypeScript decoding type');
    return depth;
  }
  private decoder(d: TypeDefinition) {
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
        let depth = 0;
        for (const p of d.params) {
          w.comment(`decoding param: ${p.name}`);
          depth = this.decodeType(p.type, p.name, depth + 1);
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
  private defaultValue(type: MetadataParamType): string {
    if (type.type === 'template') {
      if (type.template === 'vector') return '[]';
      if (type.template === 'optional') return 'null';
      throw new Error('Unsupported native TypeScript default type');
    }
    if (type.type !== 'generic')
      throw new Error('Expected a primitive metadata type');
    const t = type.value;
    return t === GenericName.Bytes
      ? 'new Uint8Array(0)'
      : t === GenericName.Boolean
      ? 'false'
      : t === GenericName.Float || t === GenericName.Double
      ? '0.0'
      : t === GenericName.Long || t === GenericName.UnsignedLong
      ? '"0"'
      : t === GenericName.String || t === GenericName.NullTerminatedString
      ? '""'
      : '0';
  }
  private defaultCreator(d: TypeDefinition) {
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
              w.line(`${p.name}: ${this.defaultValue(p.type)},`);
            }
            w.line('...params');
          },
          '});'
        );
      }
    );
  }
  private comparison(
    type: MetadataParamType,
    left: string,
    right: string,
    depth: number
  ): [string, number] {
    if (type.type === 'generic') {
      return [
        type.value === GenericName.Bytes
          ? `${left}.byteLength === ${right}.byteLength && ${left}.every((__byte,index) => ${right}[index] === __byte)`
          : `${left} === ${right}`,
        depth
      ];
    }
    if (type.type === 'template' && type.template === 'optional') {
      const a = `__dp${depth}1`,
        b = `__dp${depth}2`;
      const [inner, next] = this.comparison(type.value, a, b, depth + 1);
      return [
        `((${a}, ${b}) => ${a} !== null && ${b} !== null ? ${inner} : ${a} === ${b})(${left},${right})`,
        next
      ];
    }
    if (type.type === 'template' && type.template === 'vector') {
      const item = `__originalItem${depth}`,
        index = `__index${depth}`,
        other = `__item${depth}`;
      const [inner, next] = this.comparison(type.value, item, other, depth + 1);
      return [
        `${left}.length === ${right}.length && Array.from(${left}).every((${item},${index}) => (typeof ${item} === 'undefined' ? false : (${other} => typeof ${other} === 'undefined' ? false : (${inner}))(Array.from(${right})[${index}])))`,
        next
      ];
    }
    throw new Error('Unsupported native TypeScript comparison type');
  }
  private compare(d: TypeDefinition) {
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
                  p.type,
                  `__a['${p.name}']`,
                  `__b['${p.name}']`,
                  i
                )[0] + (i < d.params.length - 1 ? ' &&' : '')
              );
            }),
          ');'
        );
      }
    );
  }
  private update(d: TypeDefinition) {
    const w = this.writer,
      argument = d.params.length ? 'changes' : '_';
    w.block(
      `export function ${getUpdateFunctionName(d)}(value: ${
        d.name
      }, ${argument}: Partial<${getTypeInputParamsInterfaceName(d)}>) {`,
      () => {
        let depth = 0;
        for (const p of d.params)
          w.block(`if(typeof changes['${p.name}'] !== 'undefined') {`, () => {
            const [expression, next] = this.comparison(
              p.type,
              `changes['${p.name}']`,
              `value['${p.name}']`,
              depth + 1
            );
            depth = next;
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
