import test from 'ava';
import { spawn } from 'child-process-utilities';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import Time from './helpers/Time';

const repoRoot = path.resolve(__dirname, '..');
const unifiedCli = path.resolve(repoRoot, 'cli/jsb');
const legacyCli = path.resolve(repoRoot, 'cli/index');
const mainSchema = path.resolve(repoRoot, 'test/schema');

/**
 * Read every generated TypeScript source and metadata file under `directory`
 * into a { relativePath -> contents } map. Build artifacts (`.js`, `.d.ts`,
 * `.map`) are ignored so the comparison only covers what the generator emits.
 */
async function readGeneratedTypeScript(
  directory: string
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  async function walk(current: string) {
    const entries = await fs.promises.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.resolve(current, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      if (/\.(js|d\.ts|map)$/.test(entry.name)) {
        continue;
      }
      result.set(
        path.relative(directory, absolutePath),
        await fs.promises.readFile(absolutePath, 'utf8')
      );
    }
  }
  await walk(directory);
  return result;
}

/**
 * The unified `jsb` CLI generates TypeScript by delegating to the legacy,
 * battle-tested generator, so its output must stay byte-identical to the
 * original `jsbuffer` CLI. This guards that 100% fidelity.
 */
test('jsb --generator typescript is byte-identical to the legacy jsbuffer CLI', async (t) => {
  t.timeout(Time.milliseconds.Minute * 5);

  const workDir = await fs.promises.mkdtemp(
    path.resolve(os.tmpdir(), 'jsb-ts-fidelity-')
  );

  /**
   * The legacy CLI writes a `jsbufferconfig.json` next to the main schema file
   * (a tracked file), so snapshot it and restore it afterwards to keep the test
   * side-effect free.
   */
  const jsbufferConfigPath = path.resolve(
    path.dirname(mainSchema),
    'jsbufferconfig.json'
  );
  let previousConfig: string | null = null;
  try {
    previousConfig = await fs.promises.readFile(jsbufferConfigPath, 'utf8');
  } catch {
    previousConfig = null;
  }

  try {
    const unifiedDir = path.resolve(workDir, 'unified');
    const legacyDir = path.resolve(workDir, 'legacy');

    await spawn('node', [
      unifiedCli,
      mainSchema,
      '-o',
      unifiedDir,
      '--generator',
      'typescript',
      '--no-ts-config',
      '--indentation-size',
      '2'
    ]).wait();

    await spawn('node', [
      legacyCli,
      mainSchema,
      '-o',
      legacyDir,
      '--no-ts-config',
      '--indentation-size',
      '2'
    ]).wait();

    const unified = await readGeneratedTypeScript(unifiedDir);
    const legacy = await readGeneratedTypeScript(legacyDir);

    t.deepEqual(
      Array.from(unified.keys()).sort(),
      Array.from(legacy.keys()).sort(),
      'the unified CLI must generate the same set of TypeScript files'
    );
    t.true(unified.size > 0, 'expected at least one generated TypeScript file');

    for (const [relativePath, contents] of legacy) {
      t.is(
        unified.get(relativePath),
        contents,
        `"${relativePath}" must be byte-identical between the unified and legacy CLIs`
      );
    }
  } finally {
    if (previousConfig !== null) {
      await fs.promises.writeFile(jsbufferConfigPath, previousConfig);
    }
    await fs.promises.rm(workDir, { recursive: true, force: true });
  }
});
