// Direct native backend entry point for differential testing. Production CLI
// integration remains VQ-1177; this adapter never delegates to that CLI.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { default: load } = require('../../cli/loadFileMetadataList.js');
const {
  default: FileGeneratorTypeScript
} = require('../../src/generators/typescript/FileGeneratorTypeScript.js');

const request = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
const metadata = await load(request.metadataDirectory, {
  requireContract: true
});
const options = { ...(request.configuration.api ?? {}) };
// The current harness exports through the CLI, whose rootDir is the entry's
// parent. Reject a mismatched API root rather than silently ignoring it.
if (options.compilerOptions?.rootDir) {
  const expected = path
    .relative(
      path.resolve(options.compilerOptions.rootDir),
      path.resolve('source', request.configuration.logicalEntry)
    )
    .split(path.sep)
    .join('/');
  if (metadata[0].contract.logicalPath !== expected)
    throw new Error(
      'Metadata export did not preserve the requested programmatic rootDir'
    );
}
for (let i = 0; i < request.configuration.flags.length; i++) {
  const flag = request.configuration.flags[i];
  const value = () => {
    const next = request.configuration.flags[++i];
    if (next === undefined) throw new Error('Missing option value for ' + flag);
    return next;
  };
  switch (flag) {
    case '--indentation-size':
      options.indentationSize = Number(value());
      break;
    case '--unique-name-property-name':
      options.uniqueNamePropertyName = value();
      break;
    case '--sort-properties':
    case '-s':
      options.sortProperties = true;
      break;
    case '--no-ts-config':
      options.typeScriptConfiguration = null;
      break;
    case '--extends':
      options.typeScriptConfiguration = {
        extends: path.relative(request.outputDirectory, path.resolve(value()))
      };
      break;
    default:
      throw new Error('Unknown native adapter option: ' + flag);
  }
}
const generated = await new FileGeneratorTypeScript(
  metadata,
  options
).generate();
// The backend returns all records before this boundary writes any output.
for (const file of generated) {
  const destination = path.resolve(request.outputDirectory, file.path);
  const relative = path.relative(request.outputDirectory, destination);
  if (
    relative === '..' ||
    relative.startsWith('..' + path.sep) ||
    path.isAbsolute(relative)
  )
    throw new Error('Generated path escapes output directory');
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, file.contents);
}
