#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { readJSONFile } from '../code-generator/fileGeneratorUtilities';
import { IMetadataFileContents } from '../code-generator/types';
import FileGeneratorKotlin from '../code-generator/FileGeneratorKotlin';
import { getNamedArgument, getString } from 'cli-argument-helper';
import assert from 'assert';

interface IProjectConfig {
  outDir: string;
  mainFile: string;
}

function getAbsolutePath(value: string) {
  if (!path.isAbsolute(value)) {
    value = path.resolve(process.cwd(), value);
  }
  return value;
}

(async () => {
  const args = Array.from(process.argv.slice(2));
  let kotlinLibOutDir = getNamedArgument(args, '-o', getString);
  let configFile = args.shift() ?? null;

  assert.strict.ok(kotlinLibOutDir !== null, '-o argument must be defined');
  assert.strict.ok(
    configFile !== null,
    'you must add one argument that points to a jsbufferconfig.json file'
  );

  kotlinLibOutDir = getAbsolutePath(kotlinLibOutDir);
  configFile = getAbsolutePath(configFile);

  /**
   * make sure we have the right permissions for the selected files
   */
  for (const testInfo of [
    {
      mode: fs.constants.W_OK,
      path: kotlinLibOutDir,
      mustBeDirectory: true
    },
    {
      path: configFile,
      mustBeFile: true,
      mode: fs.constants.R_OK
    }
  ]) {
    await fs.promises.access(testInfo.path, testInfo.mode);
    const stat = await fs.promises.stat(testInfo.path);
    /**
     * human readable expected type
     */
    let expectedType: string;
    let value: boolean;
    if (testInfo.mustBeDirectory) {
      expectedType = 'directory';
      value = stat.isDirectory();
    } else {
      expectedType = 'file';
      value = stat.isFile();
    }
    assert.strict.ok(value, `${testInfo.path} must be a ${expectedType}`);
  }

  const projectConfig = await readJSONFile<IProjectConfig>(configFile);
  const projectResolvedOutDir = path.resolve(
    path.dirname(configFile),
    projectConfig.outDir
  );
  const mainMetadataFile = path.resolve(
    projectResolvedOutDir,
    `${projectConfig.mainFile}.metadata.json`
  );
  const metadata = await readJSONFile<IMetadataFileContents>(mainMetadataFile);
  const files = await new FileGeneratorKotlin({
    schemaName: 'schema',
    metadata,
    filePath: mainMetadataFile
  }).generate();
  for (const file of files) {
    const finalPath = path.resolve(kotlinLibOutDir, file.path);
    await fs.promises.mkdir(path.dirname(finalPath), {
      recursive: true
    });
    await fs.promises.writeFile(finalPath, file.contents);
  }
})().catch((reason) => {
  process.exitCode = 1;
  console.error(reason);
});
