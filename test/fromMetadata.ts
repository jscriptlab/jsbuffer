import test from 'ava';
import { spawn } from 'child-process-utilities';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import Time from './helpers/Time';

const cliPath = path.resolve(__dirname, '../cli/jsb');

/**
 * Recursively read every file under `directory` into a { relativePath -> contents }
 * map so two output directories can be compared for byte-for-byte equality.
 */
async function readDirectoryTree(
  directory: string
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  async function walk(current: string) {
    const entries = await fs.promises.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.resolve(current, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
      } else if (entry.isFile()) {
        result.set(
          path.relative(directory, absolutePath),
          await fs.promises.readFile(absolutePath, 'utf8')
        );
      }
    }
  }
  await walk(directory);
  return result;
}

async function run(args: string[]) {
  await spawn('node', [cliPath, ...args], { stdio: 'inherit' }).wait();
}

/**
 * For a given generator + schema, assert that generating straight from the
 * source schema produces byte-identical output to generating from the metadata
 * JSON files previously dumped by `--metadata-only`.
 */
async function assertRoundTripIsByteIdentical(
  t: import('ava').ExecutionContext,
  {
    mainFile,
    generator,
    name
  }: { mainFile: string; generator: string; name: string }
) {
  const rootDir = await fs.promises.mkdtemp(
    path.resolve(os.tmpdir(), 'jsb-from-metadata-')
  );
  try {
    const metadataDir = path.resolve(rootDir, 'metadata');
    const directDir = path.resolve(rootDir, 'direct');
    const fromMetadataDir = path.resolve(rootDir, 'from-metadata');

    // 1. Dump metadata JSON files (plus the ordered manifest).
    await run([mainFile, '--metadata-only', '-o', metadataDir, '--name', name]);

    // 2. Generate straight from the source schema.
    await run([
      mainFile,
      '-o',
      directDir,
      '--generator',
      generator,
      '--name',
      name
    ]);

    // 3. Generate again, this time from the dumped metadata JSON files only.
    await run([
      '--from-metadata',
      metadataDir,
      '-o',
      fromMetadataDir,
      '--generator',
      generator,
      '--name',
      name
    ]);

    const direct = await readDirectoryTree(directDir);
    const fromMetadata = await readDirectoryTree(fromMetadataDir);

    t.deepEqual(
      Array.from(fromMetadata.keys()).sort(),
      Array.from(direct.keys()).sort(),
      `${generator}: the same set of files must be generated from metadata`
    );

    t.true(direct.size > 0, `${generator}: expected at least one file`);

    for (const [relativePath, contents] of direct) {
      t.is(
        fromMetadata.get(relativePath),
        contents,
        `${generator}: "${relativePath}" must be byte-identical when generated from metadata`
      );
    }
  } finally {
    await fs.promises.rm(rootDir, { recursive: true, force: true });
  }
}

test('--from-metadata: C++17 output is byte-identical to generating from source', async (t) => {
  t.timeout(Time.milliseconds.Minute * 5);
  await assertRoundTripIsByteIdentical(t, {
    mainFile: 'test/parser/test_schema.jsb',
    generator: 'cpp17',
    name: 'app'
  });
});

test('--from-metadata: C99 output is byte-identical to generating from source', async (t) => {
  t.timeout(Time.milliseconds.Minute * 5);
  await assertRoundTripIsByteIdentical(t, {
    mainFile: 'src/generators/c/test/app.jsb',
    generator: 'c99',
    name: 'app'
  });
});

test('--from-metadata generates C99 even when the original .jsb sources are absent', async (t) => {
  t.timeout(Time.milliseconds.Minute * 5);

  const rootDir = await fs.promises.mkdtemp(
    path.resolve(os.tmpdir(), 'jsb-from-metadata-no-src-')
  );
  try {
    const metadataDir = path.resolve(rootDir, 'metadata');
    const outDir = path.resolve(rootDir, 'c');

    await run([
      'src/generators/c/test/app.jsb',
      '--metadata-only',
      '-o',
      metadataDir,
      '--name',
      'app'
    ]);

    /**
     * Rewrite every metadata file's `path` to point at a non-existent location,
     * simulating consuming the metadata on another machine (or after the `.jsb`
     * files were removed). Generation must still succeed.
     */
    async function rewritePaths(directory: string) {
      const entries = await fs.promises.readdir(directory, {
        withFileTypes: true
      });
      for (const entry of entries) {
        const absolutePath = path.resolve(directory, entry.name);
        if (entry.isDirectory()) {
          await rewritePaths(absolutePath);
        } else if (entry.name.endsWith('.metadata.json')) {
          const parsed = JSON.parse(
            await fs.promises.readFile(absolutePath, 'utf8')
          );
          parsed.path = path.resolve(
            '/nonexistent-schema-root',
            path.basename(parsed.path)
          );
          await fs.promises.writeFile(
            absolutePath,
            JSON.stringify(parsed, null, 2)
          );
        }
      }
    }
    await rewritePaths(metadataDir);

    await run([
      '--from-metadata',
      metadataDir,
      '-o',
      outDir,
      '--generator',
      'c99',
      '--name',
      'app'
    ]);

    const generated = await readDirectoryTree(outDir);
    t.true(
      generated.size > 0,
      'C99 files must be generated from metadata alone, without the .jsb sources'
    );
    t.true(
      Array.from(generated.keys()).some((file) => file.endsWith('.c')),
      'expected at least one generated .c file'
    );
  } finally {
    await fs.promises.rm(rootDir, { recursive: true, force: true });
  }
});

test('--from-metadata and --metadata-only are mutually exclusive', async (t) => {
  const { stderr } = spawn(
    'node',
    [
      cliPath,
      '--from-metadata',
      'test',
      '--metadata-only',
      '-o',
      'out',
      '--generator',
      'c99'
    ],
    { stdio: 'pipe' }
  ).output();
  const text = await stderr().decode('utf8');
  t.regex(text, /mutually exclusive/);
});
