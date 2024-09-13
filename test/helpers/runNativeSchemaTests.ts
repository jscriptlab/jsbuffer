import path from 'node:path';
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

export interface ISchema {
  mainFile: string;
  name: string;
  outDir: string;
  secondary: 'i386'[] | null;
  type: 'x86_64' | 'avr';
}

const avrToolchainDir = `/usr`;

const cmakeBuildTypes = ['Release', 'MinSizeRel', 'RelWithDebInfo', 'Debug'];

export default async function runNativeSchemaTests(schema: ISchema) {
  const cmakeOptions: string[][] = [];

  switch (schema.type) {
    case 'x86_64': {
      const cmakePredefinedArguments = [
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
        // ['-DJSB_SCHEMA_USE_MALLOC'],
        // ['-DJSB_SCHEMA_USE_MALLOC', '-DJSB_DISABLE_ERROR_ASSERTION'],
        // ['-DJSB_SCHEMA_USE_MALLOC', '-DJSB_SERIALIZER_USE_MALLOC'],
        // [
        //   '-DJSB_SCHEMA_USE_MALLOC',
        //   '-DJSB_SERIALIZER_USE_MALLOC',
        //   '-DJSB_DISABLE_ERROR_ASSERTION'
        // ],
      ];
      for (const cmakeArgs of cmakePredefinedArguments) {
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

              cmakeArgs.push('-DCMAKE_C_FLAGS=-m32');
              break;
            }
          }
        }
      }
      for (const cmakeArgs of cmakePredefinedArguments) {
        for (const cmakeBuildType of cmakeBuildTypes) {
          // Add test for testing it with C++ disabled
          cmakeOptions.unshift([
            `-DCMAKE_BUILD_TYPE=${cmakeBuildType}`,
            ...cmakeArgs
          ]);
        }
      }
      break;
    }
    case 'avr':
      // for (const cmakeBuildType of cmakeBuildTypes) {
      //   // Test with all sorts of build types
      //   cmakeOptions.unshift([
      //     cmakeBuildType,
      //     '-G',
      //     'Unix Makefiles',
      //     `-DCMAKE_BUILD_TYPE=${cmakeBuildType}`
      //   ]);

      //   // Add test for testing it with C++ disabled
      //   cmakeOptions.unshift([
      //     cmakeBuildType,
      //     '-G',
      //     'Unix Makefiles',
      //     `-DCMAKE_BUILD_TYPE=${cmakeBuildType}`,
      //     '-DJSB_SCHEMA_CPP=OFF',
      //   ]);
      // }
      for (const avrOptions of [
        ['-DMCU=atmega2560', '-DF_CPU=16000000UL'],
        ['-DMCU=atmega1281', '-DF_CPU=16000000UL'],
        ['-DMCU=atmega1280', '-DF_CPU=16000000UL'],
        ['-DMCU=atmega328p', '-DF_CPU=16000000UL']
      ]) {
        const cmakeProjectOptions = [
          ...avrOptions,
          '-DJSB_TOLERATE_TYPE_OVERFLOW=OFF',
          '-DJSB_SERIALIZER_BUFFER_SIZE=200',
          '-DJSB_MAX_STRING_SIZE=30',
          '-DJSB_CPP=OFF',
          '-DJSB_TRACE=OFF',
          '-DJSB_SCHEMA_CPP=OFF',
          '-DJSB_SCHEMA_NO_ASSIGNMENT_ENUMS=ON',
          `-DAVR_TOOLCHAIN_PATH=${avrToolchainDir}`,
          `-DCMAKE_TOOLCHAIN_FILE=${path.resolve(
            __dirname,
            '../toolchains/AVR.cmake'
          )}`,
          '-G',
          'Unix Makefiles'
        ];

        for (const optionNames of [
          'JSB_SCHEMA_TESTS',
          'JSB_CODEC_TESTS',
          'JSB_SCHEMA_C99_LARGE_SCHEMA',
          'JSB_SCHEMA_C99_SMALL'
        ]) {
          for (const value of ['ON', 'OFF']) {
            const currentArgs = [
              ...cmakeProjectOptions,
              `-D${optionNames}=${value}`
            ];

            // Make a build type for each on and off for the tests
            for (const cmakeBuildType of ['Release' /*, 'MinSizeRel'*/]) {
              cmakeOptions.unshift([
                ...currentArgs,
                `-DCMAKE_BUILD_TYPE=${cmakeBuildType}`
              ]);
            }
          }
        }
      }
      break;
  }

  const tmpFolders = new Array<string>();

  try {
    for (const options of cmakeOptions) {
      const buildDir = await fs.promises.mkdtemp(
        path.resolve(await configuration.cache(), 'cmake-build-test-jsb-')
      );

      tmpFolders.push(buildDir);

      const args = [
        ...options,
        '-B',
        buildDir,
        '-S',
        path.resolve(__dirname, '../..')
      ];

      console.log(
        `Running cmake with args:\n${args
          .map((arg) => `\t* ${arg}`)
          .join('\n')}`
      );

      await spawn('cmake', Array.from(args)).wait();
      await spawn('cmake', [
        '--build',
        buildDir,
        '-j',
        `${os.cpus().length}`
      ]).wait();

      const mcu = getNamedArgument(Array.from(options), '-DMCU', getString);
      const F_CPU = getNamedArgument(Array.from(options), '-DF_CPU', getString);

      const testFiles = await glob(
        path.resolve(
          buildDir,
          schema.type === 'avr' ? '**/*_test.elf' : '**/*_test'
        )
      );

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
          case 'x86_64':
            try {
              await fs.promises.access(testFile, fs.constants.X_OK);
              await spawn(testFile).wait();
            } catch (reason) {
              console.error('Skipping %s due to error: %s', testFile, reason);
            }
            break;
          case 'avr': {
            assert.strict.ok(F_CPU !== null);

            const cpuFrequency = parseInt(F_CPU, 10);

            assert.strict.ok(mcu !== null);

            const firmwareFile = testFile.replace(/\.elf$/, '.hex');

            await spawn(path.resolve(avrToolchainDir, 'bin', 'avr-size'), [
              '--mcu',
              mcu,
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
            const simavr = spawn(
              'simavr',
              [
                '-f',
                `${cpuFrequency}`,
                '-m',
                mcu,
                // '-ff',
                firmwareFile
                // testFile
              ],
              { stdio: 'inherit', timeout: Time.milliseconds.Minute * 5 }
            );

            await simavr.wait();

            assert.strict.ok(
              simavr.childProcess.exitCode === 0,
              'simavr failed to run'
            );
            break;
          }
        }
      }
    }
  } catch (err) {
    if (isErrorLike(err)) {
      throw new Error(err.message);
    } else {
      throw new Error(`${err}`);
    }
  }

  for (const tmpFolder of tmpFolders) {
    console.log(`Removing ${tmpFolder}`);
    await fs.promises.rmdir(tmpFolder, { recursive: true });
  }
}