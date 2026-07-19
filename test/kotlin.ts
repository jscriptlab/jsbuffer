import test from 'ava';
import { spawn } from 'child-process-utilities';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import Time from './helpers/Time';

const cliPath = path.resolve(__dirname, '../cli/jsb');

/**
 * Recursively collect every file path (relative to `directory`) so the shape of
 * a generated Kotlin source tree can be asserted.
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

test('kotlin: generates a Kotlin source tree from a .jsb schema', async (t) => {
  t.timeout(Time.milliseconds.Minute * 5);

  const rootDir = await fs.promises.mkdtemp(
    path.resolve(os.tmpdir(), 'jsb-kotlin-')
  );
  try {
    const outDir = path.resolve(rootDir, 'kotlin');
    const schemaName = 'com.test.app.schema';

    await run([
      'test/kotlin/src/main',
      '-o',
      outDir,
      '--generator',
      'kotlin',
      '--name',
      schemaName
    ]);

    const generated = await readDirectoryTree(outDir);
    const files = Array.from(generated.keys());
    const kotlinFiles = files.filter((file) => file.endsWith('.kt'));

    // 1. A non-empty set of `.kt` files is produced.
    t.true(kotlinFiles.length > 0, 'expected at least one generated .kt file');

    // 2. The `--name` package maps to the expected directory structure, and the
    //    shared internal runtime interfaces are emitted under `internal/`.
    const packageDir = schemaName.split('.').join('/');
    for (const relativePath of kotlinFiles) {
      t.true(
        relativePath
          .split(path.sep)
          .join('/')
          .startsWith(packageDir + '/'),
        `"${relativePath}" must live under the package directory "${packageDir}"`
      );
    }
    for (const internalInterface of [
      'internal/Deserializer.kt',
      'internal/Serializer.kt',
      'internal/Encodable.kt'
    ]) {
      const expected = `${packageDir}/${internalInterface}`
        .split('/')
        .join(path.sep);
      t.true(
        generated.has(expected),
        `expected internal runtime file "${expected}" to be generated`
      );
    }

    // 3. Traits are modelled as Kotlin `sealed class` declarations.
    const sealedClassFiles = kotlinFiles.filter((relativePath) =>
      /\bsealed class\b/.test(generated.get(relativePath) ?? '')
    );
    t.true(
      sealedClassFiles.length > 0,
      'expected at least one trait to be emitted as a `sealed class`'
    );

    // Every generated type/call/trait class must extend the Encodable base.
    t.true(
      kotlinFiles.some((relativePath) =>
        /: Encodable\(\)/.test(generated.get(relativePath) ?? '')
      ),
      'expected generated classes to extend Encodable()'
    );
  } finally {
    await fs.promises.rm(rootDir, { recursive: true, force: true });
  }
});

test('kotlin: --from-metadata output is byte-identical to generating from source', async (t) => {
  t.timeout(Time.milliseconds.Minute * 5);

  const rootDir = await fs.promises.mkdtemp(
    path.resolve(os.tmpdir(), 'jsb-kotlin-from-metadata-')
  );
  try {
    const schemaName = 'com.test.app.schema';
    const metadataDir = path.resolve(rootDir, 'metadata');
    const directDir = path.resolve(rootDir, 'direct');
    const fromMetadataDir = path.resolve(rootDir, 'from-metadata');

    await run([
      'test/kotlin/src/main',
      '--metadata-only',
      '-o',
      metadataDir,
      '--name',
      schemaName
    ]);
    await run([
      'test/kotlin/src/main',
      '-o',
      directDir,
      '--generator',
      'kotlin',
      '--name',
      schemaName
    ]);
    await run([
      '--from-metadata',
      metadataDir,
      '-o',
      fromMetadataDir,
      '--generator',
      'kotlin',
      '--name',
      schemaName
    ]);

    const direct = await readDirectoryTree(directDir);
    const fromMetadata = await readDirectoryTree(fromMetadataDir);

    t.deepEqual(
      Array.from(fromMetadata.keys()).sort(),
      Array.from(direct.keys()).sort(),
      'the same set of Kotlin files must be generated from metadata'
    );
    t.true(direct.size > 0, 'expected at least one generated Kotlin file');
    for (const [relativePath, contents] of direct) {
      t.is(
        fromMetadata.get(relativePath),
        contents,
        `"${relativePath}" must be byte-identical when generated from metadata`
      );
    }
  } finally {
    await fs.promises.rm(rootDir, { recursive: true, force: true });
  }
});
