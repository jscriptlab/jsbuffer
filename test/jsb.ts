import test from 'ava';
import { spawn } from 'child-process-utilities';
import path from 'node:path';
import { generateTemporaryFiles } from '../helpers';
import Time from './helpers/Time';
import runNativeSchemaTests, {
  // CMakeLogLevel,
  ISchema
} from './helpers/runNativeSchemaTests';
import generateSchema from './helpers/generateSchema';

const schemas: ReadonlyArray<ISchema> = [
  // {
  //   mainFile: 'src/generators/c/test/app.jsb',
  //   name: 'wasm32_app',
  //   logLevel: CMakeLogLevel.Debug,
  //   secondary: null,
  //   type: 'wasm32',
  //   outDir: path.resolve(__dirname, 'generated/c/schemas/app')
  // },
  // {
  //   type: 'avr',
  //   secondary: null,
  //   mainFile: 'src/generators/c/test/simple_schema.jsb',
  //   name: 'avr_simple_schema',
  //   outDir: path.resolve(__dirname, 'generated/c/schemas/avr')
  // },
  {
    mainFile: 'src/generators/c/test/app.jsb',
    name: 'app',
    // 64-bit and 32-bit
    type: 'x86_64',
    secondary: ['i386'],
    outDir: path.resolve(__dirname, 'generated/c/schemas/app')
  }
];

test("FileGeneratorC: it should throw a detailed error in case there's an invalid token", async (t) => {
  const temp = await generateTemporaryFiles({
    files: {
      'main.jsb': [
        `import { Response } from "./another_file.jsb";\n`,
        `export type User {\n\tint id;\n}`
      ].join('\n'),
      'another_file.jsb': [
        '\n\nexport type Response {\n\tstring message\n}'
      ].join('\n')
    }
  });

  const { stderr } = spawn(
    'node',
    [
      path.resolve(__dirname, '../cli/jsb'),
      path.resolve(temp.rootDir, 'main.jsb'),
      '--name',
      'app',
      '--generator',
      'c99',
      '-o',
      path.resolve(temp.rootDir, 'schema')
    ],
    { stdio: 'pipe' }
  ).output();

  const output = await stderr().decode();
  const tests = [
    /\^ Expected ";", got "}" instead\n/,
    /\tExpected ";", got "}" instead\n/,
    /another_file\.jsb/,
    /export type Response {\n/,
    /string message\n/,
    /Detailed:/
  ];

  for (const r of tests) {
    t.assert(r.test(output), `Expected ${r.toString()} in ${output}`);
  }

  await temp.destroy();
});

test('it should successfully generate a CMake C and C++ project', async (t) => {
  t.timeout(Time.milliseconds.Day);

  await spawn('node', [
    path.resolve(__dirname, '../cli/jsb'),
    'test/parser/test_schema.jsb',
    '-o',
    path.resolve(__dirname, 'generated/cpp')
  ]).wait();

  for (const schema of Array.from(schemas)) {
    await generateSchema(schema);
  }

  for (const schema of Array.from(schemas)) {
    await runNativeSchemaTests(schema);
  }

  t.pass();
});
