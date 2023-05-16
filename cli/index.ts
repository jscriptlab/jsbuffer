#!/usr/bin/env node

import assert from 'assert';
import path from 'path';
import { FileGenerator } from '../code-generator';
import fs from 'fs';
import { TextDecoder, TextEncoder } from 'util';
import { getInteger, getNamedArgument, getString } from 'cli-argument-helper';

(async () => {
  const args = Array.from(process.argv).slice(2);
  let mainFile: string | null = null;
  const uniqueNamePropertyName = getNamedArgument(
    args,
    '--unique-name-property-name',
    getString
  );
  const nodeModulesFolder =
    getNamedArgument(args, '--node-modules-folder', getString) ??
    path.resolve(process.cwd(), 'node_modules');
  const tsExtends = getNamedArgument(args, '--extends', getString);
  const indentationSize =
    getNamedArgument(args, '--indentation-size', getInteger) ?? 4;
  let outDir =
    getNamedArgument(args, '-o', getString) ??
    getNamedArgument(args, '--output', getString) ??
    'schema';

  let outFolder: string | null = null;
  const outFolders = new Map<string, string>();

  do {
    outFolder = getNamedArgument(args, '--external', getString);
    if (outFolder) {
      const [k, v] = outFolder.split(':');
      if (typeof k === 'undefined' || typeof v === 'undefined') {
        throw new Error(
          'usage of --external argument is: --external module_name:out_folder'
        );
      }
      outFolders.set(k, v);
    }
  } while (outFolder !== null);

  for (let i = 0; i < args.length; i++) {
    const arg = args[0];
    switch (arg) {
      default: {
        if (arg.startsWith('-')) {
          throw new Error(`invalid argument: ${arg}`);
        }
        args.shift();
        mainFile = arg;
      }
    }
  }
  if (mainFile === null) {
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
  let typeScriptConfiguration: Record<string, unknown> = {};
  if (tsExtends !== null) {
    typeScriptConfiguration = {
      ...typeScriptConfiguration,
      extends: path.relative(outDir, path.resolve(process.cwd(), tsExtends)),
    };
  }
  const generator = new FileGenerator(
    {
      path: mainFile,
    },
    {
      externalModules: {
        outFolders,
        nodeModulesFolder,
      },

      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      uniqueNamePropertyName,
      rootDir: path.dirname(mainFile),
      typeScriptConfiguration,
      outDir,
      indentationSize,
    }
  );
  for (const file of await generator.generate()) {
    const outFile = path.resolve(outDir, file.file);
    try {
      await fs.promises.access(path.dirname(outFile), fs.constants.W_OK);
    } catch (reason) {
      await fs.promises.mkdir(path.dirname(outFile));
    }
    await fs.promises.writeFile(outFile, file.contents);
  }
})().catch((reason) => {
  console.error(reason);
  process.exitCode = 1;
});
