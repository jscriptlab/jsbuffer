#!/usr/bin/env node

import assert from 'assert';
import path from 'path';
import { FileGenerator } from '../code-generator';
import fs from 'fs';
import { TextDecoder, TextEncoder } from 'util';
import { getArgument } from 'cli-argument-helper';
import { getString } from 'cli-argument-helper/string';
import { getInteger } from 'cli-argument-helper/number';
import getNamedArgument from 'cli-argument-helper/getNamedArgument';
import Exception from '../exception/Exception';
import CodeStream from 'textstreamjs';
import chalk from 'chalk';

function getHelpText() {
  const cs = new CodeStream();

  cs.write(chalk.bold('Usage: jsbuffer <main-source-file> [-o <output>]\n\n'));
  cs.write('Compile <main-source-file> to <output> directory.\n\n');
  cs.write(
    [
      'Be aware that directories and files are going to be resolved from the directory the command-line tool is being called.',
      'For instance, if you pass src/tsconfig.json to --extends arguments, it will resolved to $PWD/src/tsconfig.json, given that $PWD is the directory the command-line tool is being called from.'
    ].join(' ')
  );
  cs.append(`\n\n`);
  cs.write(`${chalk.green('Options:')}\n`);
  cs.indentBlock(() => {
    const args = [
      {
        name: '--unique-name-property-name',
        args: ['string'],
        description:
          'Specify the unique property name for the generated classes or interfaces. Default is undefined.'
      },
      {
        name: '--extends',
        args: ['string'],
        description: [
          'Specify a base class or interface that generated classes or interfaces will extend.',
          'This will add an "extends" keyword to the generated tsconfig.json file that is going inside the output directory.',
          'The path will be resolved as absolute, but will be written as relative to the generated TypeScript configuration for semantic reasons.',
          'Default is undefined.'
        ].join(' ')
      },
      {
        name: '--indentation-size',
        args: ['integer'],
        description:
          'Set the size of indentation in the generated code. Default is 4.'
      },
      {
        name: ['-o', '--output'],
        args: ['string'],
        description: [
          'Specify the output directory for generated files.',
          "Default is 'schema'."
        ].join(' ')
      },
      {
        name: '--no-ts-config',
        description:
          'If present, no TypeScript configuration file will be generated.'
      },
      {
        name: ['--sort-properties', '-s'],
        description: [
          'If present, the properties within generated classes or interfaces will be sorted alphabetically.',
          'This argument changes the CRC header of each type/call.',
          'If you are generating the same schema on another project, to keep the CRC headers between projects, you need to apply this argument on all',
          'sides during schema compilation to make sure you are able to decode/encode it correctly.'
        ].join(' ')
      }
    ];
    for (const arg of args) {
      let name = arg.name;
      if (!Array.isArray(arg.name)) {
        name = [arg.name];
      }
      assert.strict.ok(name.length > 0);
      for (const n of name) {
        cs.write(`${chalk.cyan(n)}`);
        if (arg.args) {
          cs.append(
            ` ${arg.args.map((a) => `<${chalk.italic(a)}>`).join(' ')}`
          );
        }
        cs.append('\n');
      }
      cs.indentBlock(() => {
        cs.write(`${arg.description}\n\n`);
      });
    }
  });
  cs.write(`${chalk.green('Examples:')}\n`);
  cs.indentBlock(() => {
    cs.write('npx jsbuffer schema/src/main -o schema/out\n');
    cs.write('npx jsbuffer schema/src/main -o src --no-ts-config\n');
    cs.write('npx jsbuffer schema/src/main\n');
  });

  return cs.value();
}

(async () => {
  const args = Array.from(process.argv).slice(2);
  const uniqueNamePropertyName = getNamedArgument(
    args,
    '--unique-name-property-name',
    getString
  );
  const tsExtends = getNamedArgument(args, '--extends', getString);
  const indentationSize =
    getNamedArgument(args, '--indentation-size', getInteger) ?? 4;
  let outDir =
    getNamedArgument(args, '-o', getString) ??
    getNamedArgument(args, '--output', getString) ??
    'schema';
  const noTypeScriptConfig = getArgument(args, '--no-ts-config') !== null;
  const sortProperties =
    (getArgument(args, '--sort-properties') ?? getArgument(args, '-s')) !==
    null;
  const showHelp =
    (getArgument(args, '--help') ?? getArgument(args, '-h')) !== null;

  if (showHelp) {
    console.log(getHelpText());
    return;
  }

  /**
   * get main file from whatever is left from arguments
   */
  let mainFile = args.shift();

  if (!mainFile) {
    throw new Error('at least one main file should be defined');
  }

  mainFile = path.resolve(process.cwd(), mainFile);
  outDir = path.resolve(process.cwd(), outDir);
  /**
   * make sure out dir is writable and it exists
   */
  try {
    await fs.promises.access(outDir, fs.constants.W_OK);
    assert.strict.ok((await fs.promises.stat(outDir)).isDirectory());
  } catch (reason) {
    await fs.promises.mkdir(outDir);
  }
  /**
   * make sure main file is a file and it is readable
   */
  await fs.promises.access(mainFile, fs.constants.R_OK);
  assert.strict.ok((await fs.promises.stat(mainFile)).isFile());

  /**
   * set up typescript configuration according to what's in the command-line
   */
  let typeScriptConfiguration: Record<string, unknown> | null = {};
  if (noTypeScriptConfig) {
    typeScriptConfiguration = null;
  } else {
    if (tsExtends !== null) {
      typeScriptConfiguration = {
        ...typeScriptConfiguration,
        extends: path.relative(outDir, path.resolve(process.cwd(), tsExtends))
      };
    }
  }

  const rootDir = path.dirname(mainFile);

  const compilerOptions = {
    outDir,
    rootDir
  };

  const generator = new FileGenerator(
    {
      path: mainFile
    },
    {
      root: null,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      sortProperties,
      uniqueNamePropertyName,
      compilerOptions,
      typeScriptConfiguration,
      indentationSize
    }
  );

  await fs.promises.writeFile(
    path.resolve(path.dirname(mainFile), 'jsbufferconfig.json'),
    JSON.stringify(
      {
        outDir: path.relative(rootDir, outDir),
        mainFile: path.relative(rootDir, mainFile)
      },
      null,
      indentationSize
    )
  );

  try {
    await generator.generate();
  } catch (reason) {
    if (reason instanceof Exception) {
      throw new Error(`Failed to generate files with error: ${reason}`);
    } else {
      console.error('Received unexpected error instance: %o', reason);
    }
    throw reason;
  }
})().catch((reason) => {
  console.error(reason);
  process.exitCode = 1;
});
