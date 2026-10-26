// Replace this adapter with the native backend integration in VQ-1177.
// Never fall back to source generation when metadata generation is unavailable.
import fs from 'node:fs/promises';
import path from 'node:path';
import { root, run } from './core.mjs';
const request = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
if (request.configuration.api)
  throw new Error(
    'The current metadata CLI cannot represent programmatic configuration; supply a native candidate adapter.'
  );
const result = await run(
  [
    process.execPath,
    path.join(root, 'cli/jsb.js'),
    '--from-metadata',
    request.metadataDirectory,
    '--generator',
    'typescript',
    '-o',
    request.outputDirectory,
    ...request.configuration.flags
  ],
  { cwd: process.cwd() }
);
process.stdout.write(result.stdout);
process.stderr.write(result.stderr);
process.exitCode = result.ok ? 0 : 1;
