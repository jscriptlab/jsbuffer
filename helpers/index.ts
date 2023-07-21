import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import * as glob from 'glob';
import { FileGenerator } from '../code-generator';
import { spawn } from 'child-process-utilities';
import CodeStream from 'textstreamjs';

type FunctionPrefix = 'default' | 'update' | 'compare' | 'encode' | 'decode';

function getPrefixRegularExpression(prefix: FunctionPrefix) {
  return `/${prefix}([A-Z0-9]+)/`;
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
    'function randomValuesFromMetadata(metadata) {',
    () => {
      cs.write('const result = new Map();\n');
      cs.write(
        'for(const paramMetadata of metadata.params) {\n',
        () => {
          cs.write('let testValue;\n');
          cs.write('const paramType = paramMetadata.type;\n');
          cs.write(
            'switch(paramType.type) {\n',
            () => {
              cs.write('case "externalType":\n');
              cs.indentBlock(() => {
                cs.write(
                  'const externalType = require(paramType.relativePath);\n'
                );
                cs.write(
                  'const externalTypeMetadata = externalType[`${paramType.name}Metadata`];\n'
                );
                cs.write(
                  'const defaultFn = externalType[`default${paramType.name}`];\n'
                );
                cs.write(
                  "assert.strict.ok(typeof externalTypeMetadata !== 'undefined' && typeof defaultFn === 'function');\n"
                );
                cs.write(
                  'testValue = defaultFn(Object.fromEntries(randomValuesFromMetadata(externalTypeMetadata)));\n'
                );
                cs.write('break;\n');
              });
              cs.write('case "generic":\n');
              cs.indentBlock(() => {
                cs.write(
                  'switch(paramType.value) {\n',
                  () => {
                    cs.write('default:\n');
                    cs.indentBlock(() => {
                      cs.write(
                        'throw new Error(`Unhandled generic type for param "${paramMetadata.name}": ${paramType.value}`);\n'
                      );
                    });
                    for (const x of [
                      {
                        type: ['int', 'int32'],
                        value: () =>
                          crypto.randomFillSync(new Int32Array(1))[0],
                      },
                      {
                        type: ['uint', 'uint32'],
                        value: () =>
                          crypto.randomFillSync(new Uint32Array(1))[0],
                      },
                      {
                        type: ['string', 'null_terminated_string'],
                        value: () =>
                          `"${crypto.randomBytes(64).toString('base64')}"`,
                      },
                      {
                        type: 'double',
                        value: () =>
                          crypto.randomFillSync(new Float64Array(1))[0],
                      },
                      {
                        type: 'float',
                        value: () =>
                          crypto.randomFillSync(new Float32Array(1))[0],
                      },
                      {
                        type: 'long',
                        value: () =>
                          `"${crypto.randomFillSync(new BigInt64Array(1))[0]}"`,
                      },
                      {
                        type: 'ulong',
                        value: () =>
                          `"${
                            crypto.randomFillSync(new BigUint64Array(1))[0]
                          }"`,
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
                cs.write('break;\n');
              });
              cs.write('default:\n');
              cs.indentBlock(() => {
                cs.write(
                  'throw new Error(`Unsupported type on param "${paramMetadata.name}": ${paramMetadata.type.type}`);\n'
                );
              });
            },
            '}\n'
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
                    cs.write('let names = functionNames.get(name[1]);\n');
                    cs.write('if(!names) {\n');
                    cs.indentBlock(() => {
                      cs.write('names = [];\n');
                      cs.write('functionNames.set(name[1],names);\n');
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
            getFn('encodeFn', 'encode');
            getFn('decodeFn', 'decode');
            getFn('updateFn', 'update');
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
                cs.write(
                  'for(const [k,v] of randomValuesFromMetadata(metadata)) {\n',
                  () => {
                    cs.write(
                      "console.log('\ttesting update of param: %s', k);"
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
            cs.write("assert.strict.ok(typeof defaultFn === 'function');\n");
            cs.write('const v1 = defaultFn();\n');
            // test encode functions
            {
              cs.write("assert.strict.ok(typeof encodeFn === 'function');\n");
              cs.write('s.rewind();\n');
              cs.write('encodeFn(s, defaultFn());\n');
              createDeserializer('d', 's');
              cs.write('assert.strict.deepEqual(decodeFn(d),defaultFn());\n');
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
            // TODO: this would assume, types cannot end with `Trait`. This is at risking of not testing the updateFn function
            // cs.write(
            //   "const props = Object.keys(v1).filter(k => k !== '_name').map(key => ({\n",
            //   () => {
            //     cs.write('key,\n');
            //     cs.write("isString: typeof v1[key] === 'string',\n");
            //     cs.write("isNumber: typeof v1[key] === 'number',\n");
            //   },
            //   '})).filter(v => v.isString || v.isNumber);\n'
            // );
            // cs.write(
            //   'if(updateFnKey && !/Trait$/.test(updateFnKey)) {\n',
            //   () => {
            //     cs.write("assert.strict.ok(typeof updateFn === 'function');\n");
            //     cs.write(
            //       'for(const prop of props) {\n',
            //       () => {
            //         for (const v of [
            //           {
            //             check: 'prop.isString',
            //             type: 'string',
            //           },
            //           {
            //             check: 'prop.isNumber',
            //             type: 'number',
            //           },
            //         ]) {
            //           cs.write(
            //             `if(${v.check}) {\n`,
            //             () => {
            //               const randomString =
            //                 v.type === 'string'
            //                   ? `"${crypto.randomBytes(32).toString('base64')}"`
            //                   : crypto.randomInt(1000, 2000);
            //               cs.write(
            //                 `assert.strict.notEqual(updateFn(v1,{[prop.key]:${randomString}}),v1);\n`
            //               );
            //               cs.write(
            //                 `assert.strict.deepEqual(updateFn(v1,{[prop.key]:${randomString}}),defaultFn({[prop.key]:${randomString}}));\n`
            //               );
            //             },
            //             '}\n'
            //           );
            //         }
            //         cs.write(
            //           'assert.strict.equal(updateFn(v1,{[prop.key]:v1[prop.key]}),v1);\n'
            //         );
            //       },
            //       '}\n'
            //     );

            //     /**
            //      * test updateFn
            //      */
            //     cs.write('assert.strict.equal(updateFn(v1,defaultFn()),v1);\n');
            //     cs.write("console.log('\t%s: ok',updateFn.name);\n");
            //   },
            //   '}\n'
            // );
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
  const rootDir = await fs.promises.mkdtemp('/tmp/jsbuffer-');
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
