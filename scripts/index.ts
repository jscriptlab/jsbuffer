import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'child-process-utilities';
import { glob } from 'glob';
import { getArgument } from 'cli-argument-helper';
import generateC99Codec from './generateC99Codec';
import generateC99IntegerFallbackHeader from './generateC99IntegerFallbackHeader';

(async () => {
  const args = process.argv.slice(2);
  const all = getArgument(args, '--all') !== null;
  const shouldGenerateC99Codec =
    getArgument(args, '--generate-c99-codec') ?? all;
  const shouldGenerateC99IntegerFallbackHeader =
    getArgument(args, '--generate-integer-fallback-header') ?? all;

  if (shouldGenerateC99IntegerFallbackHeader) {
    const fallbackHeader = await generateC99IntegerFallbackHeader();
    await fs.promises.writeFile(
      path.resolve(
        __dirname,
        '../src/generators/c/library/include/jsb/jsb_internal.h'
      ),
      fallbackHeader
    );
  }

  if (shouldGenerateC99Codec !== null) {
    await generateC99Codec();
  }

  if (getArgument(args, '--clang-format') !== null) {
    const projectDir = path.dirname(__dirname);
    await spawn(
      'clang-format',
      [
        '-i',
        ...(await glob(path.resolve(projectDir, '**/*.{c,cpp,h,hpp}'), {
          ignore: [
            path.resolve(projectDir, 'cmake-build-*/**'),
            path.resolve(projectDir, 'node_modules/**')
          ]
        }))
      ],
      {
        cwd: projectDir
      }
    ).wait();
  }
})().catch((reason) => {
  console.error(reason);
});
