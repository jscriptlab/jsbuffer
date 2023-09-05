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
  const schemaName = getNamedArgument(args, '--name', getString);
  let kotlinLibOutDir = getNamedArgument(args, '-o', getString);
  let configFile = args.shift() ?? null;

  assert.strict.ok(
    schemaName !== null,
    '--name must be defined to specify package name'
  );
  assert.strict.ok(kotlinLibOutDir !== null, '-o argument must be defined');
  assert.strict.ok(
    configFile !== null,
    'you must add one argument that points to a jsbufferconfig.json file'
  );

  kotlinLibOutDir = getAbsolutePath(kotlinLibOutDir);
  configFile = getAbsolutePath(configFile);

  /**
   * make sure we have the right permissions for the config file
   */
  await fs.promises.access(configFile, fs.constants.R_OK);
  const stat = await fs.promises.stat(configFile);
  assert.strict.ok(stat.isFile(), `${configFile} must be a file`);

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
    schemaName,
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
