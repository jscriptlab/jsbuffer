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
import loadFileMetadataList, {
  METADATA_MANIFEST_FILE_NAME
} from './loadFileMetadataList';
import { IFileMetadata } from '../src/parser/Parser';
import { FileGenerator } from '../code-generator';

enum Generator {
  CPP_17 = 'cpp17',
  C = 'c99',
  TYPESCRIPT = 'typescript'
}

/**
 * Build the requested generator from an already-resolved metadata list. This is
 * the single place that maps a `--generator` value to a concrete generator, so
 * both the parse-from-source and the generate-from-metadata code paths share
 * exactly the same behavior.
 */
function createGenerator(
  desiredGenerator: string,
  fileMetadataList: ReadonlyArray<IFileMetadata>,
  options: { rootDir: string; name: string }
): { generate: () => Promise<IGeneratedFile[] | null> } {
  switch (desiredGenerator) {
    case Generator.CPP_17:
      return new FileGeneratorCPP(fileMetadataList, {
        current: null,
        rootDir: options.rootDir,
        root: null,
        cmake: {
          project: options.name
        }
      });
    case Generator.C:
      return new FileGeneratorC(fileMetadataList, {
        current: null,
        rootDir: options.rootDir,
        root: null,
        cmake: {
          project: options.name
        }
      });
    case Generator.TYPESCRIPT:
      /**
       * The TypeScript generator is driven straight from a `.jsb` schema by the
       * legacy, battle-tested {@link FileGenerator} (see `generateTypeScript`),
       * so it is never reached through this metadata-list factory.
       */
      throw new Error(
        'The "typescript" generator is not supported in --from-metadata mode yet'
      );
    default:
      throw new Error(`Unknown generator "${desiredGenerator}"`);
  }
}

/**
 * Generate TypeScript source code from a `.jsb` schema.
 *
 * This reuses the proven legacy {@link FileGenerator}, so the unified `jsb` CLI
 * produces byte-identical TypeScript to the original `jsbuffer` CLI, keeping
 * TypeScript code generation at 100% fidelity.
 */
async function generateTypeScript(
  mainFilePath: string,
  outputDirectory: string,
  options: {
    indentationSize: number;
    typeScriptConfiguration: Record<string, unknown> | null;
    uniqueNamePropertyName: string | null;
    sortProperties: boolean;
  }
): Promise<void> {
  const generator = new FileGenerator(
    {
      path: mainFilePath
    },
    {
      root: null,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      sortProperties: options.sortProperties,
      uniqueNamePropertyName: options.uniqueNamePropertyName,
      compilerOptions: {
        outDir: outputDirectory,
        rootDir: path.dirname(mainFilePath)
      },
      typeScriptConfiguration: options.typeScriptConfiguration,
      indentationSize: options.indentationSize
    }
  );
  await generator.generate();
  console.log(`TypeScript files written to "${outputDirectory}".`);
}

/**
 * Write the files produced by a generator to `outputDirectory`, creating any
 * missing parent directories, and print a short summary.
 */
async function writeGeneratedFiles(
  result: IGeneratedFile[] | null,
  outputDirectory: string
): Promise<void> {
  if (result === null) {
    throw new Error('Uncommon: Failed to generate the files');
  }

  let byteCount = 0;
  let fileCount = 0;

  for (const generatedFile of result) {
    const filePath = path.resolve(outputDirectory, generatedFile.path);
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
    `Total of ${byteCount} bytes and ${fileCount} files written to "${outputDirectory}".`
  );
}

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

  /**
   * If the from-metadata flag is set, the CLI will generate code directly from
   * the metadata JSON files (as previously dumped by `--metadata-only`) instead
   * of parsing a `.jsb` schema. This decouples parsing from code generation.
   */
  let fromMetadata =
    getArgumentAssignment(args, '--from-metadata', getString) ?? null;

  const desiredGenerator =
    getArgumentAssignment(args, '--generator', getString) ?? Generator.CPP_17;

  /**
   * TypeScript-specific options (mirroring the original `jsbuffer` CLI). They
   * are ignored by the other generators.
   */
  const noTypeScriptConfig = getArgument(args, '--no-ts-config') !== null;
  const tsExtends = getArgumentAssignment(args, '--extends', getString);
  const uniqueNamePropertyName =
    getArgumentAssignment(args, '--unique-name-property-name', getString) ??
    null;
  const sortProperties =
    (getArgument(args, '--sort-properties') ?? getArgument(args, '-s')) !==
    null;

  if (outputDirectory === null) {
    throw new Error('Output directory should be defined');
  }

  outputDirectory = path.resolve(process.cwd(), outputDirectory);

  /**
   * Generate straight from metadata JSON files. No `.jsb` schema is parsed in
   * this mode, which makes code generation reproducible from a committed set of
   * metadata files.
   */
  if (fromMetadata !== null) {
    if (metadataOnly !== null) {
      throw new Error(
        'The `--metadata-only` and `--from-metadata` flags are mutually exclusive'
      );
    }

    fromMetadata = path.resolve(process.cwd(), fromMetadata);

    const fileMetadataList = await loadFileMetadataList(fromMetadata);

    const generator = createGenerator(desiredGenerator, fileMetadataList, {
      rootDir: fromMetadata,
      name
    });

    await writeGeneratedFiles(await generator.generate(), outputDirectory);
    return;
  }

  let mainFilePath = args.shift() ?? null;

  if (mainFilePath === null) {
    throw new Error('At least one main file should be defined');
  }

  mainFilePath = path.resolve(process.cwd(), mainFilePath);

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
   * The TypeScript generator is driven straight from the `.jsb` schema by the
   * legacy generator, keeping 100% fidelity with the original `jsbuffer` CLI.
   */
  if (desiredGenerator === Generator.TYPESCRIPT) {
    if (metadataOnly !== null) {
      /**
       * `--metadata-only` is language-agnostic, so fall through to the parser
       * path below instead of running the TypeScript generator.
       */
    } else {
      let typeScriptConfiguration: Record<string, unknown> | null = {};
      if (noTypeScriptConfig) {
        typeScriptConfiguration = null;
      } else if (tsExtends !== null) {
        typeScriptConfiguration = {
          extends: path.relative(
            outputDirectory,
            path.resolve(process.cwd(), tsExtends)
          )
        };
      }
      await generateTypeScript(mainFilePath, outputDirectory, {
        indentationSize,
        typeScriptConfiguration,
        uniqueNamePropertyName,
        sortProperties
      });
      return;
    }
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

  const fileMetadataList = await parser.parse();

  if (metadataOnly !== null) {
    /**
     * Keep track of every metadata file we write, in parser order, so we can
     * emit an ordered manifest. `--from-metadata` uses this manifest to restore
     * the exact same file order, which makes generation from metadata
     * byte-identical to generation straight from the source schema.
     */
    const manifestFiles = new Array<string>();
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

      manifestFiles.push(relativePath);
    }

    // Write the ordered manifest that records the parser file order.
    await fs.promises.writeFile(
      path.resolve(configuration.outDir, METADATA_MANIFEST_FILE_NAME),
      JSON.stringify({ files: manifestFiles }, null, indentationSize)
    );
    return;
  }

  const generator = createGenerator(desiredGenerator, fileMetadataList, {
    rootDir: configuration.rootDir,
    name
  });

  await writeGeneratedFiles(await generator.generate(), configuration.outDir);
})().catch((reason) => {
  if (reason instanceof Exception || reason instanceof ASTGenerationException) {
    process.stderr.write(`${reason.what}\n`);
  } else {
    console.error(reason);
  }

  printHelp();

  process.exitCode = 1;
});
