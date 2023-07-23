import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import * as glob from 'glob';
import { FileGenerator } from '../code-generator';
import { spawn } from 'child-process-utilities';
import CodeStream from 'textstreamjs';
import assert from 'assert';

type FunctionPrefix = 'default' | 'update' | 'compare' | 'encode' | 'decode';

function getPrefixRegularExpression(prefix: FunctionPrefix) {
  return `/${prefix}([A-Z0-9a-z_]+)/`;
}

function generateTestSchemaFilesCode({
  rootDir,
  files,
}: {
  rootDir: string;
  files: string[];
}) {
  const cs = new CodeStream();
  cs.write(
    'function randomValuesFromGenericParamMetadataType(paramType) {\n',
    () => {
      cs.write('let testValue;\n');
      cs.write(
        'switch(paramType.value) {\n',
        () => {
          cs.write('default:\n');
          cs.indentBlock(() => {
            cs.write(
              'throw new Error(`Unhandled generic value: ${paramType.value}`);\n'
            );
          });
          for (const x of [
            {
              type: ['int', 'int32'],
              value: () => 'crypto.randomFillSync(new Int32Array(1))[0]',
            },
            {
              type: ['uint32'],
              value: () => 'crypto.randomFillSync(new Uint32Array(1))[0]',
            },
            {
              type: ['string', 'null_terminated_string'],
              value: () => '`"${crypto.randomBytes(64).toString(\'base64\')}"`',
            },
            {
              type: 'double',
              value: () => 'crypto.randomFillSync(new Float64Array(1))[0]',
            },
            {
              type: 'float',
              value: () => 'crypto.randomFillSync(new Float32Array(1))[0]',
            },
            {
              type: 'long',
              value: () =>
                '`${crypto.randomFillSync(new BigInt64Array(1))[0]}`',
            },
            {
              type: 'ulong',
              value: () =>
                '`${crypto.randomFillSync(new BigUint64Array(1))[0]}`',
            },
          ]) {
            let { type: types } = x;
            if (!Array.isArray(types)) {
              types = [types];
            }
            for (const t of types) {
              cs.write(`case "${t}":\n`);
              cs.indentBlock(() => {
                cs.write(`testValue = ${x.value()};\n`);
                cs.write('break;\n');
              });
            }
          }
        },
        '}\n'
      );
      cs.write('return testValue;\n');
    },
    '}\n'
  );
  cs.write(
    'function resolveRelativeImport(importPath, paramType) {\n',
    () => {
      cs.write('if(paramType.externalModule) return paramType.relativePath;\n');
      cs.write('const baseImportDir = path.dirname(importPath);\n');
      cs.write(
        'const absoluteImportPath = path.resolve(baseImportDir, paramType.relativePath);\n'
      );
      cs.write(
        `let finalRelativePath = path.relative("${rootDir}", absoluteImportPath);`
      );
      cs.write(
        'if(!finalRelativePath.startsWith(".") && !finalRelativePath.startsWith("/")) {\n',
        () => {
          cs.write('finalRelativePath = `./${finalRelativePath}`;');
        },
        '}\n'
      );
      cs.write('return finalRelativePath;\n');
    },
    '}\n'
  );
  cs.write(
    'function randomValuesFromParamMetadataType(importPath, paramType, typeModuleResult) {\n',
    () => {
      cs.write('let testValue;\n');
      cs.write(
        'switch(paramType.type) {\n',
        () => {
          cs.write('case "template":\n');
          cs.indentBlock(() => {
            cs.write(
              'switch(paramType.name) {\n',
              () => {
                for (const n of ['vector', 'set', 'optional'] as const) {
                  cs.write(`case "${n}":\n`);
                  cs.indentBlock(() => {
                    cs.write(
                      'testValue = randomValuesFromParamMetadataType(importPath, paramType.value, typeModuleResult);\n'
                    );
                    switch (n) {
                      case 'optional':
                        cs.write(
                          'if(crypto.randomInt(0,1) === 1) testValue = null;\n'
                        );
                        break;
                      case 'set':
                        cs.write('testValue = new Set([testValue]);\n');
                        break;
                      case 'vector':
                        cs.write('testValue = [testValue];\n');
                        break;
                    }
                    cs.write('break;\n');
                  });
                }
                cs.write('case "tuple":\n');
                cs.indentBlock(() => {
                  cs.write(
                    'testValue = paramType.args.map(arg => randomValuesFromParamMetadataType(importPath, arg, typeModuleResult));\n'
                  );
                  cs.write('break;\n');
                });
                cs.write('default:\n');
                cs.indentBlock(() => {
                  cs.write(
                    'throw new Error(`Unsupported template: ${paramType.name}`);'
                  );
                });
              },
              '}\n'
            );
            cs.write('break;\n');
          });
          cs.write('case "internalType":\n');
          cs.write('case "externalType":\n');
          cs.indentBlock(() => {
            cs.write(
              'if(paramType.type === "externalType") {\n',
              () => {
                cs.write(
                  'typeModuleResult = require(resolveRelativeImport(importPath, paramType));\n'
                );
              },
              '} else {\n'
            );
            cs.indentBlock(() => {
              cs.write('assert.strict.ok(typeModuleResult !== null);\n');
            });
            cs.write('}\n');
            cs.write(
              'const outMetadata = typeModuleResult[`${paramType.name}Metadata`];\n'
            );
            cs.write(
              'const defaultFn = typeModuleResult[`default${paramType.name}`];\n'
            );
            cs.write(
              "assert.strict.ok(typeof outMetadata !== 'undefined' && typeof defaultFn === 'function');\n"
            );
            cs.write(
              'testValue = defaultFn(Object.fromEntries(randomValuesFromMetadata(importPath, outMetadata, typeModuleResult)));\n'
            );
            cs.write('break;\n');
          });
          cs.write('case "generic":\n');
          cs.indentBlock(() => {
            cs.write(
              'testValue = randomValuesFromGenericParamMetadataType(paramType);\n'
            );
            cs.write('break;\n');
          });
          cs.write('default:\n');
          cs.indentBlock(() => {
            cs.write(
              'throw new Error(`Unhandled param type: ${paramType.type}`);\n'
            );
          });
        },
        '}\n'
      );
      cs.write('return testValue;\n');
    },
    '}\n'
  );
  cs.write(
    'function encodeParamGeneric(param) {\n',
    () => {
      cs.write(
        'switch(param.name) {\n',
        () => {
          for (const { types, write } of [
            {
              types: ['int', 'int32'],
              write: () =>
                cs.write(
                  's.writeInt32(crypto.randomFillSync(new Int32Array(1))[0]);\n'
                ),
            },
            {
              types: ['long'],
              write: () =>
                cs.write(
                  's.writeSignedLong(crypto.randomFillSync(new BigInt64Array(1))[0].toString());\n'
                ),
            },
            {
              types: ['ulong'],
              write: () =>
                cs.write(
                  's.writeUnsignedLong(crypto.randomFillSync(new BigUint64Array(1))[0].toString());\n'
                ),
            },
            {
              types: ['double'],
              write: () =>
                cs.write(
                  's.writeDouble(crypto.randomFillSync(new Float64Array(1))[0]);\n'
                ),
            },
            {
              types: ['float'],
              write: () =>
                cs.write(
                  's.writeDouble(crypto.randomFillSync(new Float32Array(1))[0]);\n'
                ),
            },
            {
              types: ['uint', 'uint32'],
              write: () =>
                cs.write(
                  's.writeUint32(crypto.randomFillSync(new Uint32Array(1))[0]);\n'
                ),
            },
            {
              types: ['uint8'],
              write: () =>
                cs.write(
                  's.writeUint8(crypto.randomFillSync(new Uint8Array(1))[0]);\n'
                ),
            },
            {
              types: ['string'],
              write: () =>
                cs.write(
                  "s.writeString(crypto.randomBytes(1000).toString('hex'));\n"
                ),
            },
          ]) {
            for (const t of types) {
              cs.write(`case "${t}":\n`);
              cs.indentBlock(() => {
                write();
                cs.write('return true;\n');
              });
            }
          }
        },
        '}\n'
      );
      cs.write("console.error('Unhandled generic: %s',param.name);\n");
      cs.write('return false;\n');
    },
    '}\n'
  );
  cs.write(
    'function encodeParamTemplate(param) {\n',
    () => {
      cs.write(
        'switch(param.name) {\n',
        () => {
          cs.write('case "generic":\n');
          cs.indentBlock(() => {
            cs.write('return encodeParamGeneric(param);\n');
          });
          cs.write('case "map":\n');
          cs.indentBlock(() => {
            cs.write('s.writeUint32(1);\n');
            cs.write('assert.strict.ok(encodeParamTemplate(param.key));\n');
            cs.write('assert.strict.ok(encodeParamTemplate(param.value));\n');
            cs.write('return true;\n');
          });
        },
        '}\n'
      );
      cs.write('console.error("Failed to encode template: %s", param.name);\n');
      cs.write('return false;\n');
    },
    '}\n'
  );
  cs.write(
    'function encodeParam(ctx) {\n',
    () => {
      cs.write('const { exports, importPath, paramType } = ctx;');
      cs.write(
        'switch(paramType.type){\n',
        () => {
          for (const { name, fn } of [
            {
              name: 'template',
              fn: 'encodeParamTemplate',
            },
            {
              name: 'generic',
              fn: 'encodeParamGeneric',
            },
          ]) {
            cs.write(`case "${name}":\n`);
            cs.indentBlock(() => {
              cs.write(`return ${fn}(paramType);\n`);
            });
          }
          cs.write('case "externalType":\n');
          cs.write(
            'case "internalType": {\n',
            () => {
              cs.write('let importedModule = exports;\n');
              cs.write(
                'if(paramType.type == "externalType") {\n',
                () => {
                  cs.write(
                    'importedModule = require(resolveRelativeImport(importPath, paramType));\n'
                  );
                },
                '}\n'
              );
              cs.write(
                'const encodeFn = importedModule[`encode${paramType.name}`];\n'
              );
              cs.write(
                'const defaultFn = importedModule[`default${paramType.name}`];\n'
              );
              cs.write('encodeFn(s, defaultFn());\n');
              cs.write('return true;\n');
            },
            '}\n'
          );
          cs.write('default:\n');
          cs.indentBlock(() => {
            cs.write(
              "console.error('Failed to param type: %s', paramType.type);\n"
            );
            cs.write('break;\n');
          });
        },
        '}\n'
      );
      cs.write('return false;\n');
    },
    '}\n'
  );
  cs.write(
    'function encodeUntil({importPath, metadata, exports, paramIndex}) {\n',
    () => {
      cs.write('s.writeInt32(metadata.id);\n');
      cs.write(
        'for(const paramMetadata of metadata.params.slice(0,paramIndex)){\n',
        () => {
          cs.write('const paramType = paramMetadata.type;\n');
          cs.write(
            'if(!encodeParam({importPath, exports, paramType})) {\n',
            () => {
              cs.write(
                'throw new Error(`Failed to encode param: ${paramMetadata.name}`);\n'
              );
            },
            '}\n'
          );
        },
        '}\n'
      );
    },
    '}\n'
  );
  cs.write(
    'function testCodec({importPath, metadata, exports}) {\n',
    () => {
      cs.write('const encodeFn = exports[`encode${metadata.name}`];\n');
      cs.write('const decodeFn = exports[`decode${metadata.name}`];\n');
      cs.write('const { params } = metadata;\n');
      cs.write('if(!params) return;\n');
      cs.write(
        'for(let i = 0; i < params.length; i++) {\n',
        () => {
          cs.write('const paramMetadata = params[i];\n');
          cs.write('const paramType = paramMetadata.type;\n');
          cs.write(
            'if(paramType.type === "internalType" || paramType.type === "externalType") {\n',
            () => {
              cs.write('if(paramType.externalModule) continue;');
              cs.write('s.rewind();\n');
              cs.write(
                'encodeUntil({ importPath, metadata, exports, paramIndex: i});\n'
              );
              cs.write('s.writeInt32(paramType.id * 1000);\n');
              cs.write(
                'const d = new Deserializer({\n',
                () => {
                  cs.write('textDecoder: new TextDecoder(),\n');
                  cs.write('buffer: s.view()\n');
                },
                '});\n'
              );
              cs.write(
                "console.log('\ttesting failure while decoding param: %s', paramMetadata.name);\n"
              );
              cs.write('assert.strict.equal(decodeFn(d),null);\n');
              cs.write('continue;\n');
            },
            '}\n'
          );
        },
        '}\n'
      );
    },
    '}\n'
  );
  cs.write(
    'function randomValuesFromMetadata(importPath, metadata, typeModuleResult = null) {',
    () => {
      cs.write('const result = new Map();\n');
      cs.write(
        'for(const paramMetadata of metadata.params) {\n',
        () => {
          cs.write('const paramType = paramMetadata.type;\n');
          cs.write(
            'const testValue = randomValuesFromParamMetadataType(importPath, paramType, typeModuleResult);\n'
          );
          cs.write('result.set(paramMetadata.name,testValue);\n');
        },
        '}\n'
      );
      cs.write('return result;\n');
    },
    '}\n'
  );
  const createDeserializer = (
    outDeserializerVarName: string,
    serializerVarName: string
  ) =>
    cs.write(
      `const ${outDeserializerVarName} = new Deserializer({\n`,
      () => {
        cs.write(`buffer: ${serializerVarName}.view(),\n`);
        cs.write('textDecoder: new TextDecoder()\n');
      },
      '});\n'
    );
  const getFn = (value: string, prefix: FunctionPrefix) => {
    cs.write(
      `const ${value}Key = names.find(n => ${getPrefixRegularExpression(
        prefix
      )}.test(n));\n`
    );
    cs.write(`const ${value} = value[${value}Key];\n`);
  };
  cs.write("const assert = require('assert');\n");
  cs.write("const path = require('path');\n");
  cs.write("const crypto = require('crypto');\n");
  cs.write("const {Serializer,Deserializer} = require('jsbuffer/codec');\n");
  cs.write(
    'const s = new Serializer({\n',
    () => {
      cs.write('textEncoder: new TextEncoder()\n');
    },
    '});\n'
  );
  for (const f of files) {
    const importPath = path.relative(rootDir, f);
    cs.write(
      '{\n',
      () => {
        cs.write(`console.log('-- %s',"${importPath}");\n`);
        cs.write(`const value = require('./${importPath}');\n`);
        cs.write('const functionNames = new Map();\n');
        cs.write(
          'for(const [k,v] of Object.entries(value)) {\n',
          () => {
            const prefixes: FunctionPrefix[] = [
              'default',
              'decode',
              'update',
              'compare',
              'encode',
            ];
            for (const prefix of prefixes) {
              cs.write(
                '{\n',
                () => {
                  cs.write(
                    `const name = k.match(${getPrefixRegularExpression(
                      prefix
                    )});\n`
                  );
                  cs.write('if(name && name[1]) {\n');
                  cs.indentBlock(() => {
                    cs.write('let suffix = name[1];\n');
                    cs.write(
                      'if(/Trait$/.test(suffix)) {\n',
                      () => {
                        cs.write("suffix = suffix.replace(/Trait$/,'');\n");
                      },
                      '}\n'
                    );
                    cs.write('let names = functionNames.get(suffix);\n');
                    cs.write('if(!names) {\n');
                    cs.indentBlock(() => {
                      cs.write('names = [];\n');
                      cs.write('functionNames.set(suffix,names);\n');
                    });
                    cs.write('}\n');
                    cs.write('names.push(k);\n');
                  });
                  cs.write('}\n');
                },
                '}\n'
              );
            }
          },
          '}\n'
        );
        cs.write(
          'for(const [suffix,names] of functionNames) {\n',
          () => {
            getFn('defaultFn', 'default');
            getFn('compareFn', 'compare');
            getFn('decodeFn', 'decode');
            getFn('updateFn', 'update');
            cs.write("console.log('\t-- %s',suffix);\n");
            cs.write(
              'if(updateFn){\n',
              () => {
                cs.write('const v1 = defaultFn();\n');
                for (const exp of ['defaultFn()', '{}']) {
                  cs.write(
                    'assert.strict.equal(\n',
                    () => {
                      cs.write(`updateFn(v1, ${exp}),\n`);
                      cs.write('v1,\n');
                    },
                    ');\n'
                  );
                }
              },
              '}\n'
            );
            cs.write('const metadata = value[`${suffix}Metadata`];\n');
            cs.write(
              'if(metadata) {\n',
              () => {
                cs.write(`const importPath = "${path.resolve(rootDir, f)}";\n`);
                cs.write(
                  'testCodec({importPath, exports: value, metadata, value});\n'
                );
                // test encode functions
                {
                  getFn('encodeFn', 'encode');
                  cs.write(
                    "assert.strict.ok(typeof encodeFn === 'function');\n"
                  );
                  cs.write(
                    "if(metadata.kind === 'trait') {\n",
                    () => {
                      cs.write('s.rewind();\n');
                      cs.write('encodeFn(s, defaultFn());\n');
                      createDeserializer('d', 's');
                      cs.write(
                        'assert.strict.deepEqual(decodeFn(d),defaultFn());\n'
                      );
                    },
                    '} else {'
                  );
                  cs.indentBlock(() => {
                    for (const { expression } of [
                      {
                        expression: 'defaultFn()',
                      },
                      {
                        expression:
                          'defaultFn(Object.fromEntries(randomValuesFromMetadata(importPath, metadata, value)))',
                      },
                    ]) {
                      cs.write(
                        '{\n',
                        () => {
                          cs.write(`const exp = ${expression};\n`);
                          cs.write('s.rewind();\n');
                          cs.write('encodeFn(s, exp);\n');
                          createDeserializer('d', 's');
                          cs.write(
                            'assert.strict.deepEqual(decodeFn(d),exp);\n'
                          );
                        },
                        '}\n'
                      );
                    }
                  });
                  cs.write('}\n');
                  /**
                   * it should be able to decode type with invalid header
                   */
                  cs.write(
                    '{\n',
                    () => {
                      cs.write('s.rewind();\n');
                      cs.write('encodeFn(s, defaultFn());\n');
                      createDeserializer('d', 's');
                      cs.write('s.rewind();\n');
                      cs.write('s.writeInt32(d.readInt32() + 1);\n');
                      createDeserializer('d2', 's');
                      cs.write('assert.strict.equal(decodeFn(d2),null);\n');
                    },
                    '}\n'
                  );
                  // TODO: the Deserializer can throw errors, so it's even better if we can remove that and allow the deserializer to simply return null if we get anything unexpected whatsoever
                  // TODO: check for exceptions when decoding parameters stuff or anything that can throw inside a predicate
                }
                cs.write(
                  "for(const [k,v] of (metadata.kind === 'trait' ? [] : randomValuesFromMetadata(importPath, metadata, value))) {\n",
                  () => {
                    {
                      cs.write(
                        "console.log('\ttesting compare of param: %s', k);\n"
                      );
                      cs.write(
                        'assert.strict.equal(compareFn(\n',
                        () => {
                          cs.write('updateFn(defaultFn(),{[k]: v}),\n');
                          cs.write('defaultFn()\n');
                        },
                        '),false);\n'
                      );
                      cs.write(
                        'assert.strict.equal(compareFn(\n',
                        () => {
                          cs.write('updateFn(defaultFn(),{[k]: v}),\n');
                          cs.write('updateFn(defaultFn(),{[k]: v})\n');
                        },
                        '),true);\n'
                      );
                      cs.write(
                        'assert.strict.ok(compareFn(',
                        () => {
                          cs.write('defaultFn(),\n');
                          cs.write('defaultFn()\n');
                        },
                        '));\n'
                      );
                    }
                    cs.write(
                      "console.log('\ttesting update of param: %s', k);\n"
                    );
                    cs.write(
                      'assert.strict.deepEqual(\n',
                      () => {
                        cs.write('updateFn(defaultFn(),{[k]: v}),\n');
                        cs.write('defaultFn({[k]: v})\n');
                      },
                      ');\n'
                    );
                  },
                  '}\n'
                );
              },
              '}\n'
            );
            cs.write(
              'if(!metadata) {\n',
              () => {
                cs.write('console.log(`no metadata found for: ${suffix}`);');
              },
              '}\n'
            );
            cs.write("assert.strict.ok(typeof defaultFn === 'function');\n");
            cs.write('const v1 = defaultFn();\n');
            // TODO: this would assume, types cannot end with `Trait`. This is at risking of not testing the updateFn function
            /**
             * test defaultFn
             */
            cs.write('assert.strict.deepEqual(v1,defaultFn());\n');
            cs.write("console.log('\t%s: ok',defaultFn.name);\n");
            /**
             * test compareFn
             */
            cs.write("console.log('\t%s: ok',compareFn.name);\n");
            cs.write('assert.strict.ok(compareFn(v1,defaultFn()));\n');
          },
          '}\n'
        );
      },
      '}\n'
    );
    cs.write('console.log();\n');
  }
  return cs.value();
}

export async function generateWithVirtualFs({
  mainFile,
  paths,
  runScript,
  packageInfo = {},
}: {
  mainFile: string;
  packageInfo?: Record<string, unknown>;
  runScript?: string;
  paths: Record<string, string>;
}) {
  const outDirBaseName = '__compiled__';
  const tmpFolder = path.resolve(__dirname, '../node_modules/.cache/jsbuffer');
  try {
    await fs.promises.access(tmpFolder, fs.constants.W_OK | fs.constants.R_OK);
    assert.strict.ok((await fs.promises.stat(tmpFolder)).isDirectory());
  } catch (reason) {
    await fs.promises.mkdir(tmpFolder, {
      recursive: true,
    });
  }
  const rootDir = await fs.promises.mkdtemp(
    path.resolve(tmpFolder, 'jsbuffer-')
  );
  const outDir = path.resolve(rootDir, outDirBaseName);

  const runCommand = (command: string, args: string[]) =>
    spawn(command, args, {
      cwd: rootDir,
    }).wait();
  const pack = () => runCommand('npm', ['pack']);
  const test = async () => {
    /**
     * generate and create files using the code generator
     */
    await fileGenerator.generate();
    /**
     * compile typescript project
     */
    await runCommand('npx', [
      'tsc',
      '--project',
      path.resolve(outDir, 'tsconfig.json'),
    ]);
    if (typeof runScript !== 'undefined') {
      await runCommand('node', [runScript]);
    }
    const internalTestFile = path.resolve(
      rootDir,
      `test-${crypto.randomBytes(8).toString('hex')}.js`
    );
    await fs.promises.writeFile(
      internalTestFile,
      generateTestSchemaFilesCode({
        files: glob.sync(path.resolve(outDir, '**/*.js')),
        rootDir,
      })
    );
    await runCommand('node', [internalTestFile]);
    await runCommand('npx', ['nyc', 'node', internalTestFile]);
    await runCommand('npx', ['nyc', 'check-coverage']);
    /**
     * pack the package into .tgz file
     */
    await pack();
    /**
     * return .tgz files
     */
    return {
      tgzFiles: glob.sync(path.resolve(rootDir, '*.tgz')),
    };
  };

  const installPackages = (packageNames: string[]) =>
    runCommand('npm', ['install', '--save', ...packageNames]);

  paths = {
    'jsbufferconfig.json': JSON.stringify(
      {
        outDir: path.relative(rootDir, outDir),
        mainFile: path.relative(rootDir, path.resolve(rootDir, mainFile)),
      },
      null,
      2
    ),
    '.nycrc': JSON.stringify(
      {
        all: true,
      },
      null,
      2
    ),
    ...paths,
  };

  /**
   * create all files described in `paths` object
   */
  {
    await fs.promises.mkdir(outDir);

    for (const [k, v] of Object.entries(paths)) {
      const resolvedFilePath = path.resolve(rootDir, k);
      await fs.promises.mkdir(path.dirname(resolvedFilePath), {
        recursive: true,
      });
      await fs.promises.writeFile(resolvedFilePath, v);
    }
  }

  const fileGenerator = new FileGenerator(
    {
      path: path.resolve(rootDir, mainFile),
    },
    {
      compilerOptions: {
        rootDir,
        outDir,
      },
      root: null,
      indentationSize: 2,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      typeScriptConfiguration: {
        compilerOptions: {
          strict: true,
          declaration: true,
          target: 'ESNext',
          module: 'CommonJS',
        },
      },
    }
  );
  /**
   * create package.json
   */
  packageInfo = {
    name: path.basename(rootDir),
    version: '0.0.1',
    files: [...Object.keys(paths), '__compiled__/**/*.{js,d.ts}'],
    ...packageInfo,
  };
  await fs.promises.writeFile(
    path.resolve(rootDir, 'package.json'),
    JSON.stringify(packageInfo, null, 4)
  );

  /**
   * install typescript package
   */
  await runCommand('npm', [
    'install',
    '--save-dev',
    'jsbuffer@0.x',
    'typescript@5.x',
    'nyc@15.x',
  ]);
  return {
    test,
    installPackages,
    pack,
    fileGenerator,
    rootDir: rootDir,
    outDir: outDir,
  };
}
