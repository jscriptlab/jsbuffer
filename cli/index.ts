#!/usr/bin/env node

import assert from 'assert';
import path from 'path';
import { FileGenerator } from '../code-generator';
import fs from 'fs';
import { TextDecoder, TextEncoder } from 'util';
import {
  getArgument,
  getInteger,
  getNamedArgument,
  getString
} from 'cli-argument-helper';
import Exception from '../exception/Exception';

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
