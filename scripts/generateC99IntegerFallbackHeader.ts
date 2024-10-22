import assert from 'node:assert';
import CodeStream from 'textstreamjs';

export interface IIntegerInformation {
  macroName: string;
  builtinType: string;
  signed: boolean;
  bitCount: number;
  typeDef: string;
  isMacroBased: boolean;
  isBuiltinType: boolean;
  macros: {
    name: string;
    headerFound: string;
    header: string;
    found: string;
    size: string;
  };
}

export default async function generateC99IntegerFallbackHeader() {
  const integerList: { bitCount: number; list: IIntegerInformation[] }[] = [];
  const integerSizes = [
    { bitCount: 8, builtinType: 'char' },
    { bitCount: 16, builtinType: 'short' },
    { bitCount: 32, builtinType: 'int' },
    { bitCount: 64, builtinType: ['long', 'long long'] },
    { bitCount: Infinity, builtinType: '[size_t]' }
  ];

  for (const i of integerSizes) {
    const { bitCount } = i;
    let { builtinType } = i;
    const integerInfoList = new Array<IIntegerInformation>();
    if (!Array.isArray(builtinType)) {
      builtinType = [builtinType];
    }

    const macroBased =
      typeof i.builtinType === 'string' &&
      i.builtinType.startsWith('[') &&
      i.builtinType.endsWith(']');

    for (const isSigned of [true, false]) {
      for (const builtinTypeName of builtinType) {
        const integerName = macroBased
          ? builtinTypeName
          : `${isSigned ? '' : 'u'}int${bitCount}`;
        for (const typeId of (macroBased
          ? [builtinTypeName.replace(/^\[/, '').replace(/\]$/, '')]
          : [integerName, builtinTypeName]
        ).flat()) {
          const isBuiltinType = typeId === builtinTypeName;
          let targetTypeName: string;
          let current: string;
          if (macroBased) {
            current = `jsb_${typeId}`;
          } else {
            current = `jsb_${integerName}_t`;
          }
          if (macroBased) {
            targetTypeName = typeId;
          } else if (isBuiltinType) {
            targetTypeName = isSigned
              ? `signed ${builtinType}`
              : `unsigned ${builtinType}`;
          } else {
            targetTypeName = `${integerName}`;
          }
          // typeName = `${
          //   isBuiltinType
          //     ? builtinTypeName
          //     : `${isSigned ? '' : 'u'}${integerName}`
          // }`;
          // const typeName =
          // Macro name prefix does not include the _t at the end. Look below!
          const macroName = `${targetTypeName
            .replaceAll(' ', '_')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '_')}_TYPE`;
          // This can be a suffix or not
          const macros = {
            headerFound: `${macroName}_HEADER_FOUND`,
            header: `${macroName}_HEADER`,
            found: `HAVE_${macroName}`,
            size: `${macroName}_SIZE`,
            // ---> Here we add the suffix
            name: isBuiltinType
              ? targetTypeName
              : macroBased
                ? targetTypeName
                : `${targetTypeName}_t`
          };
          integerInfoList.push({
            macros,
            isMacroBased: macroBased,
            macroName,
            isBuiltinType,
            typeDef: current,
            builtinType: builtinTypeName,
            signed: isSigned || macroBased,
            bitCount
          });
        }

        // Macro-based (size_t) is signed, no matter what
        if (macroBased) {
          break;
        }
      }
      integerList.push({
        bitCount,
        list: integerInfoList.splice(0, integerInfoList.length)
      });
      if (macroBased) {
        break;
      }
    }
  }

  const cs = new CodeStream();
  const headerGuard = 'JSB_INTEGER_FALLBACK_H_';

  cs.write(`#ifndef ${headerGuard}\n`);
  cs.write(`#define ${headerGuard}\n`);
  cs.append('\n');

  cs.write('#ifndef JSBUFFER_C_JSB_H\n');
  cs.write('#error "<jsb/jsb.h> must be included before <jsb/internal.h>"\n');
  cs.write('#endif\n\n');

  for (const i of integerList) {
    const isSigned = i.list.every((n) => n.signed);
    const typedef = i.list.find((i) => !i.isBuiltinType)?.typeDef ?? null;
    assert.strict.ok(typedef !== null, 'We should have a typedef');
    const belowBitIntegerList = integerList
      .filter(
        (i2) =>
          i2.bitCount < i.bitCount &&
          i2.list.every((l) => l.signed === isSigned)
      )
      .sort((a, b) => b.bitCount - a.bitCount);
    const integerInfoList = [
      ...i.list,
      ...belowBitIntegerList.map((i) => i.list).flat()
    ];
    let previousCondition: string | null = null;
    for (const integerInfo of integerInfoList) {
      const { macros, builtinType, isMacroBased } = integerInfo;
      const isIfMacro = integerInfo === integerInfoList[0];

      if (isIfMacro) {
        cs.write('#if ');
      } else {
        cs.write('#elif ');
      }
      const condition = `defined(${macros.found}) && defined(${macros.headerFound})`;
      cs.append(`${condition} `);

      if (!isIfMacro) {
        assert.strict.ok(
          previousCondition !== null,
          `If we're writing an #elif, then we must have a previous condition. ${macros.name}`
        );
        cs.append(`// ${previousCondition}`);
      }

      // Finish the #if or #elif condition
      cs.append('\n');

      cs.append('\n');
      cs.append(`#include ${macros.header}\n`);
      cs.append('\n');

      cs.write(`typedef ${macros.name} ${typedef};\n`);
      cs.append('\n');

      // If we have a macro based type, then we define the typedef as is
      cs.append(
        `#define JSB_${isMacroBased ? typedef.toUpperCase() : typedef.replace(/^jsb_/, '').replace(/_t$/, '').toUpperCase()}_FOUND\n`
      );

      if (integerInfo === integerInfoList[integerInfoList.length - 1]) {
        cs.append('#else\n');
        const trialNameList = [
          macros.name,
          builtinType,
          ...belowBitIntegerList
            .map((i) => i.list.map((i) => i.macros.name))
            .flat()
        ];
        const errorMessage =
          `${builtinType} not found. ` +
          `Tried for ${trialNameList.join(', ')}`;
        cs.append(`#error "${errorMessage}"\n`);
        cs.append('#endif\n');
        cs.append('\n');
      }

      previousCondition = condition;
    }
  }

  cs.append('\n');
  cs.write(`#endif // ${headerGuard}\n`);

  return cs.value();
}
