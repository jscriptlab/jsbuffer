import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  correctedProfile,
  correctedFile,
  declarationCorrections,
  correctInt16Interfaces
} from './reference-profile.mjs';

export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
export const baseline = path.join(root, 'docs/release-baseline/2026-10-26');
export const fixtureRoot = path.join(root, 'test/fidelity');
export const sha256 = (bytes) =>
  createHash('sha256').update(bytes).digest('hex');
const json = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));

export async function run(
  command,
  { cwd = root, timeoutMs = 120000, env = {} } = {}
) {
  return new Promise((resolve) => {
    const child = spawn(command[0], command.slice(1), {
      cwd,
      shell: false,
      detached: process.platform !== 'win32',
      env: {
        ...process.env,
        PATH:
          path.dirname(process.execPath) + path.delimiter + process.env.PATH,
        ...env
      }
    });
    let stdout = '',
      stderr = '',
      timedOut = false,
      killTimer;
    child.stdout.on('data', (data) => {
      stdout = (stdout + data).slice(-65536);
    });
    child.stderr.on('data', (data) => {
      stderr = (stderr + data).slice(-65536);
    });
    const terminate = (signal) => {
      try {
        process.platform === 'win32'
          ? child.kill(signal)
          : process.kill(-child.pid, signal);
      } catch {}
    };
    const timer = setTimeout(() => {
      timedOut = true;
      terminate('SIGTERM');
      killTimer = setTimeout(() => terminate('SIGKILL'), 1000);
    }, timeoutMs);
    child.on('error', (error) => {
      stderr += error.message;
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      clearTimeout(killTimer);
      resolve({
        command,
        code,
        signal,
        timedOut,
        ok: code === 0 && !timedOut,
        stdout,
        stderr
      });
    });
  });
}

export async function readTree(directory) {
  const tree = new Map();
  async function walk(current, relative = '') {
    const entries = await fs.readdir(current, { withFileTypes: true });
    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const entry of entries) {
      const name = relative ? relative + '/' + entry.name : entry.name;
      if (entry.isDirectory()) await walk(path.join(current, entry.name), name);
      else if (entry.isFile())
        tree.set(name, await fs.readFile(path.join(current, entry.name)));
      else
        throw new Error(
          'Output must contain regular files, not links/special files: ' + name
        );
    }
  }
  await walk(directory);
  return tree;
}

const identity = (bytes) => ({ bytes: bytes.length, sha256: sha256(bytes) });
export const inventory = (tree) =>
  Object.fromEntries([...tree].map(([name, data]) => [name, identity(data)]));

export function compareTrees(expected, actual) {
  if (expected.size === 0)
    throw new Error('An empty reference cannot establish fidelity');
  const missing = [...expected.keys()]
    .filter((name) => !actual.has(name))
    .sort();
  const extra = [...actual.keys()].filter((name) => !expected.has(name)).sort();
  const changed = [];
  for (const name of [...expected.keys()].sort()) {
    const left = expected.get(name),
      right = actual.get(name);
    if (!right || left.equals(right)) continue;
    let offset = 0;
    while (
      offset < Math.min(left.length, right.length) &&
      left[offset] === right[offset]
    )
      offset++;
    const start = Math.max(0, offset - 16);
    changed.push({
      path: name,
      expected: identity(left),
      actual: identity(right),
      firstDifferentByte: offset,
      expectedHex: left.subarray(start, offset + 32).toString('hex'),
      actualHex: right.subarray(start, offset + 32).toString('hex')
    });
  }
  return {
    equal: missing.length + extra.length + changed.length === 0,
    missing,
    extra,
    changed
  };
}

export async function oracleIdentity() {
  const data = await json(path.join(baseline, 'package-provenance.json'));
  return data.packages.find((entry) => entry.version === '1.0.28');
}

export async function prepareOracle({
  cache = path.join(root, '.cache/fidelity-oracle'),
  tarball,
  profile = 'int16-interfaces'
} = {}) {
  if (!['published', 'int16-interfaces'].includes(profile))
    throw new Error('Unknown reference profile: ' + profile);
  cache = path.resolve(cache);
  for (const entry of await json(
    path.join(baseline, 'input-provenance.json')
  )) {
    if (
      sha256(await fs.readFile(path.join(baseline, entry.path))) !==
      entry.sha256
    )
      throw new Error('Pinned original schema input changed: ' + entry.path);
  }
  const pin = await oracleIdentity();
  await fs.mkdir(cache, { recursive: true });
  const archive = path.join(cache, 'jsbuffer-1.0.28.tgz');
  let bytes;
  if (tarball) bytes = await fs.readFile(tarball);
  else {
    try {
      bytes = await fs.readFile(archive);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const response = await fetch(pin.dist.tarball, {
        signal: AbortSignal.timeout(60000)
      });
      if (!response.ok)
        throw new Error('Oracle download failed: HTTP ' + response.status);
      bytes = Buffer.from(await response.arrayBuffer());
    }
  }
  const integrity =
    'sha512-' + createHash('sha512').update(bytes).digest('base64');
  if (sha256(bytes) !== pin.sha256 || integrity !== pin.dist.integrity)
    throw new Error('Oracle tarball integrity mismatch');
  await fs.writeFile(archive, bytes);
  const directory = path.join(cache, '1.0.28');
  await fs.mkdir(directory, { recursive: true });
  for (const name of ['package.json', 'package-lock.json']) {
    await fs.copyFile(
      path.join(baseline, 'oracle-1.0.28.' + name),
      path.join(directory, name)
    );
  }
  const install = await run(
    ['npm', 'ci', '--ignore-scripts', '--no-audit', '--no-fund'],
    { cwd: directory }
  );
  if (!install.ok)
    throw new Error(
      'Isolated oracle npm ci failed:\n' + install.stderr + install.stdout
    );
  const packageDirectory = path.join(directory, 'node_modules/jsbuffer');
  const published = (
    await json(path.join(baseline, 'package-files.json'))
  ).find((item) => item.version === '1.0.28');
  // npm may place locked runtime dependencies beneath this package. Those
  // belong to the install lock, not to the original tarball's own file set.
  const installed = new Map(
    [...(await readTree(packageDirectory))].filter(
      ([name]) => !name.startsWith('node_modules/')
    )
  );
  const names = Object.keys(published.files).sort();
  if (
    names.length !== installed.size ||
    names.some(
      (name) =>
        !installed.has(name) ||
        sha256(installed.get(name)) !== published.files[name].sha256
    )
  ) {
    throw new Error(
      'Installed original package files differ from the acquired published artifact'
    );
  }
  if (profile === 'published')
    return {
      directory: packageDirectory,
      publishedDirectory: packageDirectory,
      pin: { ...pin, outputProfile: 'published' },
      install
    };
  const correctedDirectory = path.join(
    directory,
    'node_modules/jsbuffer-int16-reference'
  );
  await fs.rm(correctedDirectory, { recursive: true, force: true });
  await fs.cp(packageDirectory, correctedDirectory, { recursive: true });
  const originalSource = installed.get(correctedFile);
  const correctedSource = Buffer.from(
    correctInt16Interfaces(originalSource.toString('utf8'))
  );
  await fs.writeFile(
    path.join(correctedDirectory, correctedFile),
    correctedSource
  );
  const correctedFiles = new Map(
    [...(await readTree(correctedDirectory))].filter(
      ([name]) => !name.startsWith('node_modules/')
    )
  );
  if (
    correctedFiles.size !== names.length ||
    names.some(
      (name) =>
        !correctedFiles.has(name) ||
        sha256(correctedFiles.get(name)) !==
          (name === correctedFile
            ? sha256(correctedSource)
            : published.files[name].sha256)
    )
  )
    throw new Error(
      'Corrected reference changed files outside the approved declaration patch'
    );
  return {
    directory: correctedDirectory,
    publishedDirectory: packageDirectory,
    pin: {
      ...pin,
      outputProfile: correctedProfile,
      correction: {
        file: correctedFile,
        patch: 'tools/fidelity/reference-profile.mjs',
        patchSha256: sha256(
          await fs.readFile(new URL('./reference-profile.mjs', import.meta.url))
        ),
        originalSourceSha256: sha256(originalSource),
        correctedSourceSha256: sha256(correctedSource),
        declarations: declarationCorrections.map(([, added]) => added)
      }
    },
    install
  };
}

export async function scenarios() {
  return json(path.join(fixtureRoot, 'scenarios.json'));
}

export async function seed(directory, scenario) {
  const source = path.join(directory, 'source');
  await fs.mkdir(directory, { recursive: true });
  await fs.cp(path.join(baseline, 'inputs/original-1x'), source, {
    recursive: true
  });
  await fs.copyFile(
    path.join(baseline, 'inputs/WireNames.jsb'),
    path.join(source, 'WireNames.jsb')
  );
  await fs.cp(path.join(fixtureRoot, 'fixtures'), source, { recursive: true });
  for (const [name, contents] of Object.entries(scenario.files ?? {})) {
    const target = path.resolve(directory, name);
    const relative = path.relative(directory, target);
    if (relative.startsWith('..') || path.isAbsolute(relative))
      throw new Error('Fixture path escapes its temporary directory: ' + name);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, contents);
  }
  const output = path.join(
    directory,
    scenario.id === 'default' ? 'schema' : 'output'
  );
  return { source, output, directory };
}

async function generatedTree(context, scenario) {
  const tree = await readTree(context.output);
  // A same-directory extends input is not generated output. If overwritten,
  // fail rather than excluding a generator's changed bytes from comparison.
  for (const [name, contents] of Object.entries(scenario.files ?? {})) {
    const relative = path.relative(
      context.output,
      path.join(context.directory, name)
    );
    if (relative.startsWith('..') || path.isAbsolute(relative)) continue;
    const data = tree.get(relative.split(path.sep).join('/'));
    if (!data?.equals(Buffer.from(contents)))
      throw new Error('Generator modified an input config: ' + name);
    tree.delete(relative.split(path.sep).join('/'));
  }
  return tree;
}

async function generate(context, scenario, command, module) {
  if (scenario.api) {
    const request = path.join(context.directory, 'request.json');
    await fs.writeFile(
      request,
      JSON.stringify({
        module,
        main: path.join(context.source, scenario.entry),
        output: context.output,
        options: scenario.api
      })
    );
    return run(
      [
        process.execPath,
        path.join(root, 'tools/fidelity/programmatic.mjs'),
        request
      ],
      { cwd: context.directory }
    );
  }
  const args = ['source/' + scenario.entry];
  if (scenario.id !== 'default') args.push('-o', path.basename(context.output));
  return run([...command, ...args, ...(scenario.flags ?? [])], {
    cwd: context.directory
  });
}

async function metadataCandidate(context, scenario, adapter) {
  const metadataDirectory = path.join(context.directory, 'metadata');
  const flags = scenario.flags ?? [];
  const metadata = await run(
    [
      process.execPath,
      path.join(root, 'cli/jsb.js'),
      'source/' + scenario.entry,
      '--metadata-only',
      '-o',
      metadataDirectory,
      ...(flags.includes('--sort-properties') ||
      flags.includes('-s') ||
      scenario.api?.sortProperties
        ? ['--sort-properties']
        : [])
    ],
    { cwd: context.directory }
  );
  if (!metadata.ok) return { ...metadata, stage: 'metadata-export' };
  await fs.rm(context.source, { recursive: true });
  // Remove external fixture schemas too. The real candidate's dependencies
  // live in the repository, outside this temporary input tree.
  await fs.rm(path.join(context.directory, 'node_modules'), {
    recursive: true,
    force: true
  });
  const request = path.join(context.directory, 'metadata-request.json');
  await fs.writeFile(
    request,
    JSON.stringify({
      metadataDirectory,
      outputDirectory: context.output,
      configuration: {
        flags,
        api: scenario.api ?? null,
        logicalEntry: scenario.entry
      },
      sourceFilesUnavailable: true
    })
  );
  const result = await run([...adapter, request], { cwd: context.directory });
  return {
    ...result,
    stage: 'metadata-generation',
    sourceFilesUnavailable: true
  };
}

export async function compareScenario(
  scenario,
  oracle,
  {
    mode = 'legacy',
    adapter,
    candidateCommand = [process.execPath, path.join(root, 'cli/index.js')]
  } = {}
) {
  // macOS aliases /var to /private/var. Use one spelling for both the input
  // paths and the child process cwd; preserve the generator's path behavior.
  const temporary = await fs.realpath(
    await fs.mkdtemp(path.join(os.tmpdir(), 'jsb-fidelity-'))
  );
  try {
    const reference = await seed(path.join(temporary, 'reference'), scenario);
    const expectedRun = await generate(
      reference,
      scenario,
      [process.execPath, path.join(oracle.directory, 'cli/index.js')],
      path.join(oracle.directory, 'code-generator/index.js')
    );
    if (!expectedRun.ok)
      return {
        id: scenario.id,
        status: 'reference-generation-failed',
        referenceRun: expectedRun
      };
    const expected = await generatedTree(reference, scenario);
    const candidate = await seed(path.join(temporary, 'candidate'), scenario);
    const actualRun =
      mode === 'metadata'
        ? await metadataCandidate(
            candidate,
            scenario,
            adapter ?? [
              process.execPath,
              path.join(root, 'tools/fidelity/metadata-adapter.mjs')
            ]
          )
        : await generate(
            candidate,
            scenario,
            mode === 'oracle'
              ? [process.execPath, path.join(oracle.directory, 'cli/index.js')]
              : candidateCommand,
            mode === 'oracle'
              ? path.join(oracle.directory, 'code-generator/index.js')
              : path.join(root, 'code-generator/index.js')
          );
    if (!actualRun.ok)
      return {
        id: scenario.id,
        status: 'candidate-generation-failed',
        expected: inventory(expected),
        candidateRun: actualRun
      };
    const actual = await generatedTree(candidate, scenario);
    const comparison = compareTrees(expected, actual);
    return {
      id: scenario.id,
      status: comparison.equal ? 'matched' : 'mismatch',
      referenceRun: expectedRun,
      candidateRun: actualRun,
      expected: inventory(expected),
      actual: inventory(actual),
      comparison,
      sourceFilesUnavailable: actualRun.sourceFilesUnavailable ?? false
    };
  } catch (error) {
    return { id: scenario.id, status: 'harness-error', error: error.stack };
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
}

export async function compareSuite({
  oracle,
  mode = 'legacy',
  ids,
  adapter,
  candidateCommand,
  onResult
} = {}) {
  const selected = (await scenarios()).filter(
    (scenario) => !ids || ids.includes(scenario.id)
  );
  if (
    !selected.length ||
    ids?.some((id) => !selected.some((scenario) => scenario.id === id))
  )
    throw new Error('Unknown or empty scenario selection');
  const results = [];
  for (const scenario of selected) {
    const result = await compareScenario(scenario, oracle, {
      mode,
      adapter,
      candidateCommand
    });
    results.push(result);
    onResult?.(result);
  }
  return {
    schemaVersion: 1,
    mode,
    node: process.version,
    candidateGitHead: (await run(['git', 'rev-parse', 'HEAD'])).stdout.trim(),
    reference: oracle.pin,
    scenarioDefinitionsSha256: sha256(
      await fs.readFile(path.join(fixtureRoot, 'scenarios.json'))
    ),
    additionalFixtureFiles: inventory(
      await readTree(path.join(fixtureRoot, 'fixtures'))
    ),
    passed: results.every((result) => result.status === 'matched'),
    scope:
      'Raw output comparison only. Runtime/wire and architecture acceptance remain separate release gates.',
    results
  };
}

export function describe(result) {
  if (result.status === 'mismatch') {
    const { missing, extra, changed } = result.comparison;
    return (
      result.id +
      ': mismatch (' +
      missing.length +
      ' missing, ' +
      extra.length +
      ' extra, ' +
      changed.length +
      ' changed)\n' +
      [
        ...missing.map((name) => '  missing ' + name),
        ...extra.map((name) => '  extra ' + name),
        ...changed.map(
          (entry) =>
            '  changed ' + entry.path + ' at byte ' + entry.firstDifferentByte
        )
      ].join('\n')
    );
  }
  const failure = result.candidateRun ?? result.referenceRun;
  const reason = failure?.stderr
    .split('\n')
    .find((line) => /Error:|what:/.test(line));
  return (
    result.id +
    ': ' +
    result.status +
    (result.candidateRun?.stage ? ' (' + result.candidateRun.stage + ')' : '') +
    (result.error
      ? '\n' + result.error
      : reason
      ? '\n  ' + reason.trim().slice(0, 300)
      : '')
  );
}
