import path, { format } from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import configuration from '../../src/configuration';
import { spawn } from 'child-process-utilities';
import getNamedArgument from 'cli-argument-helper/getNamedArgument';
import { getString } from 'cli-argument-helper/string';
import assert from 'node:assert';
import isErrorLike from './isErrorLike';
import Time from './Time';
import { glob } from 'glob';
import env from '../../src/utilities/env';
import escapeAndWrap from '../../src/utilities/escapeAndWrap';

export interface ISchema {
  mainFile: string;
  name: string;
  logLevel?: CMakeLogLevel;
  outDir: string;
  secondary: 'i386'[] | null;
  type: 'x86_64' | 'avr' | 'wasm32';
}

export enum CMakeLogLevel {
  Error = 'ERROR',
  Warning = 'WARNING',
  Notice = 'NOTICE',
  // This is the default one
  Status = 'STATUS',
  Verbose = 'VERBOSE',
  Debug = 'DEBUG',
  Trace = 'TRACE'
}

const avrToolchainDir = `/usr`;

const cmakeBuildTypes = ['Release', 'MinSizeRel', 'RelWithDebInfo', 'Debug'];

function makeWhich(additionalEnv: Record<string, string> | null = null) {
  return async (...args: string[]) => {
    return (
      await spawn
        .pipe('which', args, {
          env:
            additionalEnv === null
              ? process.env
              : {
                  ...process.env,
                  ...additionalEnv
                }
        })
        .output()
        .stdout()
        .decode()
    ).replace(/\n$/, '');
  };
}

export function nonNullable<T = unknown>(prev: T[], acc: T | T[] | null): T[] {
  if (acc === null) {
    return prev;
  }

  if (Array.isArray(acc)) {
    prev = [...prev, ...acc];
  } else {
    prev = [...prev, acc];
  }

  return prev;
}

export default async function runNativeSchemaTests(schema: ISchema) {
  const cmakeOptions: string[][] = [];
  const EMSCRIPTEN_PATH =
    schema.type === 'avr' || schema.type === 'wasm32'
      ? env('EMSCRIPTEN_PATH')
      : null;
  const transformedPath = [
    env.optional('PATH')?.split(':') ?? null,
    EMSCRIPTEN_PATH
  ]
    .reduce(nonNullable, new Array<string>())
    .join(':');

  const which = makeWhich({
    PATH: transformedPath
  });

  const executables = {
    emcmake: await which('emcmake'),
    clang: {
      c: await which('clang'),
      cxx: await which('clang++')
    },
    gcc: {
      c: await which('gcc'),
      cxx: await which('g++')
    },
    cmake: await which('cmake')
  };

  const jsBufferBasicCmakeConfigurations = [
    [
      '-DJSB_TOLERATE_TYPE_OVERFLOW=ON',
      '-DJSB_SERIALIZER_BUFFER_SIZE=1024',
      '-DJSB_MAX_STRING_SIZE=100'
    ],
    [
      '-DJSB_TOLERATE_TYPE_OVERFLOW=ON',
      '-DJSB_SERIALIZER_BUFFER_SIZE=1024',
      '-DJSB_MAX_STRING_SIZE=100'
    ],
    [
      '-DJSB_SERIALIZER_BUFFER_SIZE=1024',
      '-DJSB_MAX_STRING_SIZE=100',
      '-DJSB_TOLERATE_TYPE_OVERFLOW=OFF'
    ],
    [
      '-DJSB_SERIALIZER_USE_MALLOC=ON',
      '-DJSB_MAX_STRING_SIZE=100',
      '-DJSB_TOLERATE_TYPE_OVERFLOW=OFF'
    ],
    [
      '-DJSB_TOLERATE_TYPE_OVERFLOW=ON',
      '-DJSB_SERIALIZER_BUFFER_SIZE=1024',
      '-DJSB_MAX_STRING_SIZE=100'
    ],
    [
      '-DJSB_SERIALIZER_USE_MALLOC=ON',
      '-DJSB_MAX_STRING_SIZE=100',
      '-DJSB_TOLERATE_TYPE_OVERFLOW=OFF'
    ],
    [
      '-DJSB_SERIALIZER_USE_MALLOC=ON',
      '-DJSB_MAX_STRING_SIZE=100',
      '-DJSB_TOLERATE_TYPE_OVERFLOW=OFF'
    ]
    // ! Add support for JSB_SCHEMA_MALLOC
    // ['-DJSB_SCHEMA_MALLOC'],
    // ['-DJSB_SCHEMA_MALLOC', '-DJSB_DISABLE_ERROR_ASSERTION'],
    // ['-DJSB_SCHEMA_MALLOC', '-DJSB_SERIALIZER_USE_MALLOC'],
    // [
    //   '-DJSB_SCHEMA_MALLOC',
    //   '-DJSB_SERIALIZER_USE_MALLOC',
    //   '-DJSB_DISABLE_ERROR_ASSERTION'
    // ],
  ];

  switch (schema.type) {
    case 'x86_64': {
      const cmakePredefinedArguments = [...jsBufferBasicCmakeConfigurations];
      for (const cmakeArgs of Array.from(cmakePredefinedArguments)) {
        if (schema.secondary === null) {
          break;
        }
        for (const secondary of schema.secondary) {
          switch (secondary) {
            case 'i386': {
              const CMAKE_C_FLAGS = getNamedArgument(
                cmakeArgs,
                '-DCMAKE_C_FLAGS',
                getString
              );
              assert.strict.ok(
                CMAKE_C_FLAGS === null,
                'CMAKE_C_FLAGS is already set. This is not supported yet'
              );

              cmakePredefinedArguments.push([
                ...cmakeArgs,
                '-DCMAKE_C_FLAGS=-m32',
                '-DCMAKE_CXX_FLAGS=-m32'
              ]);
              break;
            }
          }
        }
      }
      for (const cmakeArgs of cmakePredefinedArguments) {
        for (const cmakeBuildType of cmakeBuildTypes) {
          // Add test for testing it with C++ disabled
          cmakeOptions.push([
            `-DCMAKE_BUILD_TYPE=${cmakeBuildType}`,
            '-DJSB_CPP:BOOL=OFF',
            '-DJSB_SCHEMA_CPP:BOOL=OFF',
            ...cmakeArgs
          ]);
        }
      }

      /**
       * Use Clang for each item in `cmakeOptions` array
       */
      for (const cmakeArgs of Array.from(cmakeOptions)) {
        cmakeOptions.unshift([
          ...cmakeArgs,
          `-DCMAKE_C_COMPILER:STRING=${executables.clang.c}`,
          `-DCMAKE_CXX_COMPILER:STRING=${executables.clang.cxx}`
        ]);
      }
      break;
    }
    case 'avr':
      for (const avrOptions of [
        ['-DMCU=atmega2560', '-DF_CPU=16000000UL'],
        ['-DMCU=atmega1281', '-DF_CPU=16000000UL'],
        ['-DMCU=atmega1280', '-DF_CPU=16000000UL'],
        ['-DMCU=atmega328p', '-DF_CPU=16000000UL']
      ]) {
        const cmakeProjectOptions = [
          ...avrOptions,
          '-DJSB_TOLERATE_TYPE_OVERFLOW:BOOL=OFF',
          '-DJSB_SERIALIZER_BUFFER_SIZE=200',
          '-DJSB_MAX_STRING_SIZE=30',
          '-DJSB_CPP:BOOL=OFF',
          '-DJSB_TRACE:BOOL=OFF',
          '-DJSB_SCHEMA_CPP:BOOL=OFF',
          '-DJSB_SCHEMA_NO_ASSIGNMENT_ENUMS:BOOL=ON',
          `-DAVR_TOOLCHAIN_PATH:STRING=${avrToolchainDir}`,
          `-DCMAKE_TOOLCHAIN_FILE:STRING=${path.resolve(
            __dirname,
            '../toolchains/AVR.cmake'
          )}`,
          '-G',
          'Unix Makefiles'
        ];

        for (const optionName of [
          'JSB_SCHEMA_TESTS',
          'JSB_CODEC_TESTS',
          'JSB_SCHEMA_C99_LARGE_SCHEMA',
          'JSB_SCHEMA_C99_SMALL'
        ]) {
          for (const value of ['ON', 'OFF']) {
            const currentArgs = [
              ...cmakeProjectOptions,
              `-D${optionName}:BOOL=${value}`
            ];

            // Make a build type for each on and off for the tests
            for (const cmakeBuildType of ['Release']) {
              cmakeOptions.push([
                ...currentArgs,
                `-DCMAKE_BUILD_TYPE:STRING=${cmakeBuildType}`,
                // Enable CMake verbose output
                '-DCMAKE_VERBOSE_MAKEFILE:BOOL=ON',
                '-DCMAKE_EXPORT_COMPILE_COMMANDS:BOOL=ON'
              ]);
            }
          }
        }
      }
      break;
    case 'wasm32':
      for (const currentArgs of jsBufferBasicCmakeConfigurations) {
        for (const cmakeBuildType of [
          'Debug',
          'Release',
          'MinSizeRel',
          'RelWithDebugInfo'
        ]) {
          cmakeOptions.push([
            ...currentArgs,
            `-DCMAKE_BUILD_TYPE:STRING=${cmakeBuildType}`
          ]);
        }
      }
      break;
  }

  const tmpFolders = new Array<string>();

  try {
    for (let options of cmakeOptions) {
      options = Array.from(options);

      const buildDir = await fs.promises.mkdtemp(
        path.resolve(await configuration.cache(), 'cmake-build-test-jsb-')
      );

      tmpFolders.push(buildDir);

      const postCommandArgs = new Array<string>();

      let cmakeExecutable: string;
      //  = schema.type === 'wasm32' ? executables.emcmake : executables.cmake;
      switch (schema.type) {
        case 'x86_64':
        case 'avr':
          cmakeExecutable = executables.cmake;
          break;
        case 'wasm32': {
          const exportedFunctions = ['_main'];
          const emscriptenOptions: Record<string, unknown> = {
            // ENVIRONMENT: 'literal:node',
            // STRICT: true,
            // ASSERTIONS: true,
            // PRECISE_F32: true,
            // INCLUDE_FULL_LIBRARY: true,
            // // RETAIN_COMPILER_SETTINGS: true,
            // VERBOSE: true,
            // STACK_OVERFLOW_CHECK: true,
            NO_DISABLE_EXCEPTION_CATCHING: true,
            // INVOKE_RUN: true,
            // EXIT_RUNTIME: true,
            // DEFAULT_LIBRARY_FUNCS_TO_INCLUDE:
            //   'memcpy,memmove,memset,memcmp,strcpy,printf'.split(',')
            // // MAIN_MODULE: 1,
            EXPORTED_FUNCTIONS: ['_main']
          };
          const emscriptenFormattedOptions = [];
          for (const [key, value] of Object.entries(emscriptenOptions)) {
            let formattedValue: string | null;
            if (Array.isArray(value)) {
              // formattedValue = escapeAndWrap(
              //   `[${value
              //     .map((v) =>
              //       typeof v === 'string' ? escapeAndWrap(v, '"') : v
              //     )
              //     .join(',')}]`,
              //   "'"
              // );
              formattedValue = escapeAndWrap(
                `${value
                  .map((v) =>
                    typeof v === 'string' ? escapeAndWrap(v, '"') : v
                  )
                  .join(',')}`,
                '[]'
              );
              console.log(formattedValue);
            } else if (typeof value === 'string') {
              if (!value.startsWith('literal:')) {
                formattedValue = escapeAndWrap(value, "'");
              } else {
                formattedValue = value.replace(/^literal:/, '');
              }
            } else if (typeof value === 'number') {
              formattedValue = value.toString();
            } else if (typeof value === 'boolean') {
              // f
              formattedValue = value ? '1' : '0';
              // if (value) {
              //   formattedValue = null;
              // } else {
              //   formattedValue = '0';
              // }
            } else {
              throw new Error(`Unexpected value for ${key}: ${value}`);
            }
            emscriptenFormattedOptions.push(
              // `-s ${key}=${formattedValue}`
              formattedValue !== null
                ? `-s${key}=${formattedValue}`
                : // ? `-s${key}=${escapeAndWrap(formattedValue, "'")}`
                  `-s${key}`
            );
          }
          console.log('Formatted options:', emscriptenFormattedOptions);
          options.push(
            // `-DEMSCRIPTEN_OPTIONS=${escapeAndWrap(
            //   emscriptenFormattedOptions.join(' '),
            //   '"'
            // )}`
            // `-D${escapeAndWrap(
            //   `CMAKE_EXE_LINKER_FLAGS=${emscriptenFormattedOptions.join(' ')}`,
            //   '"'
            // )}`
            '-D',
            `CMAKE_EXE_LINKER_FLAGS:STRING=${emscriptenFormattedOptions.join(
              ' '
            )}`
          );
          postCommandArgs.unshift('cmake');
          cmakeExecutable = executables.emcmake;
          break;
        }
      }

      const configureArgs = [
        ...options,
        `--log-level=${schema.logLevel ?? CMakeLogLevel.Notice}`,
        '-B',
        buildDir,
        '-S',
        path.resolve(__dirname, '../..')
      ];

      console.log(
        `Running CMake with args:\n${configureArgs
          .map((arg) => `\t* ${arg}`)
          .join('\n')}`
      );

      const buildArgs = [
        '--build',
        buildDir,
        '-v',
        '--',
        '-j',
        `${os.cpus().length}`
      ];

      await spawn(
        cmakeExecutable,
        Array.from([...postCommandArgs, ...configureArgs])
      ).wait();
      await spawn(executables.cmake, buildArgs).wait();

      const MCU = getNamedArgument(Array.from(options), '-DMCU', getString);
      const F_CPU = getNamedArgument(Array.from(options), '-DF_CPU', getString);

      let testFilesPattern: string;

      switch (schema.type) {
        case 'x86_64':
          testFilesPattern = '**/*_test';
          break;
        case 'avr':
          testFilesPattern = '**/*_test.elf';
          break;
        case 'wasm32':
          testFilesPattern = '**/*_test.js';
          break;
      }

      const testFiles = await glob(path.resolve(buildDir, testFilesPattern));

      assert.strict.ok(
        testFiles.length > 0,
        'No test files found for the project'
      );

      for (const testFile of testFiles) {
        if (testFile.split('/').some((folder) => folder.includes('.dir'))) {
          console.warn(
            'Skipping file due to it being in a .dir folder: %s',
            testFile
          );
          continue;
        }
        switch (schema.type) {
          case 'wasm32':
            console.log('Found test file: %s', testFile);
            await spawn('node', [testFile]).wait();
            break;
          case 'x86_64':
            try {
              await fs.promises.access(testFile, fs.constants.X_OK);
            } catch (reason) {
              console.error('Skipping %s due to error: %s', testFile, reason);
              break;
            }
            await spawn(testFile).wait();
            break;
          case 'avr': {
            assert.strict.ok(F_CPU !== null);

            const cpuFrequency = parseInt(F_CPU, 10);

            assert.strict.ok(MCU !== null);

            const firmwareFile = testFile.replace(/\.elf$/, '.hex');

            await spawn(path.resolve(avrToolchainDir, 'bin', 'avr-size'), [
              '--mcu',
              MCU,
              '--format',
              'avr',
              testFile
            ]).wait();

            // Convert the ELF file to a HEX file
            await spawn(path.resolve(avrToolchainDir, 'bin', 'avr-objcopy'), [
              '-O',
              'ihex',
              '-R',
              '.eeprom',
              testFile,
              firmwareFile
            ]).wait();

            // Run firmware using `simavr`
            for (const flashFile of [firmwareFile, testFile]) {
              await spawn(
                'simavr',
                ['-f', `${cpuFrequency}`, '-m', MCU, flashFile],
                { stdio: 'inherit', timeout: Time.milliseconds.Minute * 5 }
              ).wait();
            }
            break;
          }
        }
      }
    }
  } catch (err) {
    if (isErrorLike(err)) {
      throw new Error(err.message);
    } else {
      throw err;
    }
  }

  for (const tmpFolder of tmpFolders) {
    console.log(`Removing ${tmpFolder}`);
    await fs.promises.rmdir(tmpFolder, { recursive: true });
  }
}
