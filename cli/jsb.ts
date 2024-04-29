import * as path from 'path';
import * as fs from 'fs';
import Parser, { IConfiguration } from '../src/parser/Parser';
import FileGeneratorCPP from '../src/generators/FileGeneratorCPP';
import { getInteger, getNamedArgument, getString } from 'cli-argument-helper';

(async () => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: jsb <main-file> -o <output-directory>');
    console.error('Usage: jsb -o <output-directory> <main-file>');
    return;
  }

  const indentationSize =
    getNamedArgument(args, '--indentation-size', getInteger) ?? 4;

  const name = getNamedArgument(args, '--name', getString) ?? 'schema';

  let outputDirectory = getNamedArgument(args, '-o', getString);

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

  const generator = new FileGeneratorCPP(await parser.parse(), {
    current: null,
    rootDir: configuration.rootDir,
    root: null,
    cmake: {
      project: name
    }
  });

  const result = generator.generate();

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
  console.error(reason);
  process.exit(1);
});
