#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs';
import Parser, { IConfiguration } from '../src/parser/Parser';
import FileGeneratorCPP from '../src/generators/cpp/FileGeneratorCPP';
import FileGeneratorC from '../src/generators/c/FileGeneratorC';
import { getString } from 'cli-argument-helper/string';
import { getInteger } from 'cli-argument-helper/number';
import getArgumentAssignment from 'cli-argument-helper/getArgumentAssignment';
import { IGeneratedFile } from '../src/core/File';
import Exception from '../exception/Exception';
import { ASTGenerationException } from '../src/core/ASTGenerator';
import { getArgument } from 'cli-argument-helper';
import getBoolean from 'cli-argument-helper/boolean/getBoolean';
import inspector from 'inspector';

function printHelp() {
  fs.createReadStream(path.resolve(__dirname, 'jsb.HELP.txt')).pipe(
    process.stdout
  );
}

(async () => {
  const args = process.argv.slice(2);

  if (
    getArgument(args, '-h') ??
    getArgument(args, '--help') ??
    args.length === 0
  ) {
    printHelp();
    return;
  }

  if (process.env['NODE_ENV'] !== 'production') {
    const inspect = getArgument(args, '--inspect') !== null;
    const port =
      getArgumentAssignment(args, '--inspect.port', getInteger) ?? 9229;
    const host =
      getArgumentAssignment(args, '--inspect.host', getString) ?? '0.0.0.0';
    const wait =
      getArgumentAssignment(args, '--inspect.wait', getBoolean) ?? true;
    if (inspect) {
      inspector.open(port, host, wait);
    }
  }

  const indentationSize =
    getArgumentAssignment(args, '--indentation-size', getInteger) ?? 2;

  const name = getArgumentAssignment(args, '--name', getString) ?? 'schema';

  let outputDirectory =
    getArgumentAssignment(args, '-o', getString) ??
    getArgumentAssignment(args, '--output', getString) ??
    null;

  /**
   * If the metadata-only flag is set, we will dump the metadata to the output directory
   */
  const metadataOnly = getArgument(args, '--metadata-only');

  if (outputDirectory === null) {
    throw new Error('Output directory should be defined');
  }

  let mainFilePath = args.shift() ?? null;

  if (mainFilePath === null) {
    throw new Error('At least one main file should be defined');
  }

  mainFilePath = path.resolve(process.cwd(), mainFilePath);
  outputDirectory = path.resolve(process.cwd(), outputDirectory);

  /**
   * Make sure main file is readable
   */
  try {
    await fs.promises.access(mainFilePath, fs.constants.R_OK);
  } catch (reason) {
    throw new Error(`Main file ${mainFilePath} is not readable`);
  }

  /**
   * Make sure output directory is writable and it exists
   */
  try {
    await fs.promises.access(outputDirectory, fs.constants.W_OK);
    const stat = await fs.promises.stat(outputDirectory);
    if (!stat.isDirectory()) {
      throw new Error(`Output directory ${outputDirectory} is not a directory`);
    }
  } catch (reason) {
    await fs.promises.mkdir(outputDirectory, { recursive: true });
  }

  /**
   * Build the configuration object according to the command-line arguments
   */
  const configuration: IConfiguration = {
    rootDir: path.dirname(mainFilePath),
    outDir: outputDirectory,
    mainFile: path.basename(mainFilePath)
  };

  const parser = new Parser(
    {
      path: mainFilePath,
      contents: await fs.promises.readFile(mainFilePath)
    },
    {
      configuration,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      root: null,
      indentationSize,
      sortProperties: false
    }
  );

  enum Generator {
    CPP_17 = 'cpp17',
    C = 'c99'
  }

  const desiredGenerator =
    getArgumentAssignment(args, '--generator', getString) ?? Generator.CPP_17;

  let generator: {
    generate: () => Promise<IGeneratedFile[] | null>;
  };

  const fileMetadataList = await parser.parse();

  if (metadataOnly !== null) {
    for (const metadata of fileMetadataList) {
      const relativePath = metadata.path
        .replace(new RegExp(`^${configuration.rootDir}/`), '')
        .replace(/(\.jsb)?$/, '.metadata.json');
      const metadataFilePath = path.resolve(configuration.outDir, relativePath);

      // Make sure the directory exists
      await fs.promises.mkdir(path.dirname(metadataFilePath), {
        recursive: true
      });

      // Write the metadata to the file
      await fs.promises.writeFile(
        metadataFilePath,
        JSON.stringify(metadata, null, indentationSize)
      );
    }
    return;
  }

  switch (desiredGenerator) {
    case Generator.CPP_17:
      generator = new FileGeneratorCPP(fileMetadataList, {
        current: null,
        rootDir: configuration.rootDir,
        root: null,
        cmake: {
          project: name
        }
      });
      break;
    case Generator.C:
      generator = new FileGeneratorC(fileMetadataList, {
        current: null,
        rootDir: configuration.rootDir,
        root: null,
        cmake: {
          project: name
        }
      });
      break;
    default:
      throw new Error(`Unknown generator "${desiredGenerator}"`);
  }

  const result = await generator.generate();

  if (result === null) {
    throw new Error('Uncommon: Failed to generate the files');
  }

  let byteCount = 0;
  let fileCount = 0;

  for (const generatedFile of result) {
    const filePath = path.resolve(configuration.outDir, generatedFile.path);
    const buffer = new TextEncoder().encode(generatedFile.contents);
    try {
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, buffer);
    } catch (reason) {
      console.error(`Failed to write to ${filePath}: ${reason}`);
      break;
    }
    byteCount += buffer.byteLength;
    fileCount++;
  }

  console.log(
    `Total of ${byteCount} bytes and ${fileCount} files written to "${configuration.outDir}".`
  );
})().catch((reason) => {
  if (reason instanceof Exception || reason instanceof ASTGenerationException) {
    process.stderr.write(`${reason.what}\n`);
  } else {
    console.error(reason);
  }

  printHelp();

  process.exitCode = 1;
});
