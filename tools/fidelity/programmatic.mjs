import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const request = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
const { FileGenerator } = createRequire(import.meta.url)(request.module);
await fs.mkdir(request.output, { recursive: true });
await new FileGenerator(
  { path: request.main },
  {
    root: null,
    textEncoder: new TextEncoder(),
    textDecoder: new TextDecoder(),
    indentationSize: 4,
    typeScriptConfiguration: {},
    ...request.options,
    compilerOptions: {
      rootDir: request.options.compilerOptions?.rootDir
        ? path.resolve(process.cwd(), request.options.compilerOptions.rootDir)
        : path.dirname(request.main),
      outDir: request.output
    }
  }
).generate();
