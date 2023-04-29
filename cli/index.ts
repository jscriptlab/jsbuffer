#!/usr/bin/env node

import assert from 'assert';
import path from 'path';
import { FileGenerator } from '../code-generator';
import fs from 'fs';
import { TextDecoder, TextEncoder } from 'util';

(async () => {
  const args = Array.from(process.argv).slice(2);
  let outDir = 'schema';
  let mainFile: string | null = null;
  for (let i = 0; i < args.length; i++) {
    const arg = args[0];
    switch (arg) {
      case '-o': {
        args.shift();
        const maybeOutDir = args.shift();
        assert.strict.ok(typeof maybeOutDir === 'string');
        outDir = maybeOutDir;
        break;
      }
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
  console.log(outDir, mainFile);
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
  console.log(mainFile);
  await fs.promises.access(mainFile, fs.constants.R_OK);
  assert.strict.ok((await fs.promises.stat(mainFile)).isFile());
  const generator = new FileGenerator(
    {
      path: mainFile,
    },
    {
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      rootDir: path.dirname(mainFile),
      outDir,
      indentationSize: 4,
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
