import test from 'ava';
import { spawn } from 'child-process-utilities';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { generateTemporaryFiles } from '../helpers';
import configuration from '../src/configuration';

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

  const childProcess = spawn(
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
  );

  let stderr = '';

  childProcess.childProcess.stderr?.on('data', (chunk) => {
    if (!Buffer.isBuffer(chunk)) {
      return;
    }
    stderr += chunk.toString('utf8');
  });

  try {
    await childProcess.wait();
  } catch (reason) {}

  t.assert(/\^ Expected ";", got "}" instead\n/.test(stderr));
  t.assert(/\tExpected ";", got "}" instead\n/.test(stderr));
  t.assert(/another_file\.jsb/.test(stderr));
  t.assert(/export type Response {\n/.test(stderr));
  t.assert(/string message\n/.test(stderr));
  t.assert(/Detailed:/.test(stderr));

  await temp.destroy();
});

test('it should successfully generate a CMake C and C++ project', async (t) => {
  await spawn('node', [
    path.resolve(__dirname, '../cli/jsb'),
    'test/parser/test_schema.jsb',
    '-o',
    path.resolve(__dirname, 'generated/cpp')
  ]).wait();

  await spawn('node', [
    path.resolve(__dirname, '../cli/jsb'),
    'src/generators/c/test/app.jsb',
    '--name',
    'app',
    '--generator',
    'c99',
    '-o',
    path.resolve(__dirname, 'generated/c')
  ]).wait();

  const cmakeOptions: ReadonlyArray<ReadonlyArray<string>> = [
    [
      '-DJSB_TOLERATE_TYPE_OVERFLOW=ON',
      '-DJSB_SERIALIZER_BUFFER_SIZE=1024',
      '-DJSB_MAX_STRING_SIZE=100',
      '-DJSB_ENABLE_TRACE=ON'
    ],
    [
      '-DJSB_TOLERATE_TYPE_OVERFLOW=ON',
      '-DJSB_SERIALIZER_BUFFER_SIZE=1024',
      '-DJSB_MAX_STRING_SIZE=100'
    ],
    ['-DJSB_SERIALIZER_BUFFER_SIZE=1024', '-DJSB_MAX_STRING_SIZE=100'],
    [
      '-DJSB_SERIALIZER_USE_MALLOC=ON',
      '-DJSB_MAX_STRING_SIZE=100',
      '-DJSB_ENABLE_TRACE=ON'
    ],
    [
      '-DJSB_TOLERATE_TYPE_OVERFLOW=ON',
      '-DJSB_SERIALIZER_BUFFER_SIZE=1024',
      '-DJSB_MAX_STRING_SIZE=100',
      '-DJSB_ENABLE_TRACE=ON'
    ],
    [
      '-DJSB_SERIALIZER_USE_MALLOC=ON',
      '-DJSB_MAX_STRING_SIZE=100',
      '-DJSB_ENABLE_TRACE=ON'
    ],
    [
      '-DJSB_SERIALIZER_USE_MALLOC=ON',
      '-DJSB_MAX_STRING_SIZE=100',
      '-DJSB_ENABLE_TRACE=ON'
    ]
    // ['-DJSB_SCHEMA_USE_MALLOC'],
    // ['-DJSB_SCHEMA_USE_MALLOC', '-DJSB_DISABLE_ERROR_ASSERTION'],
    // ['-DJSB_SCHEMA_USE_MALLOC', '-DJSB_SERIALIZER_USE_MALLOC'],
    // [
    //   '-DJSB_SCHEMA_USE_MALLOC',
    //   '-DJSB_SERIALIZER_USE_MALLOC',
    //   '-DJSB_DISABLE_ERROR_ASSERTION'
    // ],
  ];

  const tmpFolders = new Array<string>();

  try {
    for (const options of cmakeOptions) {
      const buildDir = await fs.promises.mkdtemp(
        path.resolve(await configuration.cache(), 'cmake-build-test-jsb-')
      );

      tmpFolders.push(buildDir);

      await spawn('cmake', [
        '-B',
        buildDir,
        ...options,
        '-S',
        path.resolve(__dirname, '..'),
        '--fresh'
      ]).wait();
      await spawn('cmake', [
        '--build',
        buildDir,
        '-j',
        `${os.cpus().length}`
      ]).wait();

      const testExecutables = ['app_test', 'jsb_codec_test'];

      const testFiles = await glob(path.resolve(buildDir, '**/*_test'));

      for (const testFile of testFiles) {
        if (!testExecutables.includes(path.basename(testFile))) {
          continue;
        }
        await spawn(testFile).wait();
      }
    }
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'message' in err &&
      typeof err.message === 'string'
    ) {
      t.fail(err.message);
    } else {
      console.error(err);
      t.fail(`${err}`);
    }
  }

  for (const tmpFolder of tmpFolders) {
    console.log(`Removing ${tmpFolder}`);
    await fs.promises.rmdir(tmpFolder, { recursive: true });
  }

  t.pass();
});
