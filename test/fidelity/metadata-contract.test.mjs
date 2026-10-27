import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import {
  root,
  run,
  seed,
  scenarios,
  prepareOracle,
  readTree,
  compareTrees
} from '../../tools/fidelity/core.mjs';

const require = createRequire(import.meta.url);
const { default: Parser } = require('../../src/parser/Parser.js');
const {
  default: load,
  parseFileMetadata,
  METADATA_MANIFEST_FILE_NAME
} = require('../../cli/loadFileMetadataList.js');
const {
  validateMetadataGraph,
  originalTypeScriptDeclaration,
  serializeFileMetadata
} = require('../../src/parser/metadataContract.js');
let oracle, definitions;
before(async () => {
  oracle = await prepareOracle();
  definitions = await scenarios();
});

async function temporary(t) {
  const dir = await fs.realpath(
    await fs.mkdtemp(path.join(os.tmpdir(), 'jsb-contract-'))
  );
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return dir;
}
async function checked(command, cwd) {
  const result = await run(command, { cwd });
  assert.equal(result.ok, true, result.stderr + result.stdout);
}
async function parse(context, scenario) {
  const main = path.join(context.source, scenario.entry);
  return new Parser(
    { path: main, contents: await fs.readFile(main) },
    {
      root: null,
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
      indentationSize: 4,
      sortProperties: Boolean(
        scenario.api?.sortProperties ||
          scenario.flags?.some(
            (flag) => flag === '-s' || flag === '--sort-properties'
          )
      ),
      configuration: {
        mainFile: scenario.entry,
        rootDir: scenario.api?.compilerOptions?.rootDir
          ? path.resolve(
              context.directory,
              scenario.api.compilerOptions.rootDir
            )
          : context.source,
        outDir: context.output
      }
    }
  ).parse();
}
async function persist(files, dir) {
  await fs.mkdir(dir, { recursive: true });
  const names = [];
  for (const [i, file] of files.entries()) {
    const name = `${i}.metadata.json`;
    names.push(name);
    await fs.writeFile(path.join(dir, name), serializeFileMetadata(file));
  }
  await fs.writeFile(
    path.join(dir, METADATA_MANIFEST_FILE_NAME),
    JSON.stringify({ files: names })
  );
}
async function original(context, scenario) {
  if (scenario.api) {
    const request = path.join(context.directory, 'original-request.json');
    await fs.writeFile(
      request,
      JSON.stringify({
        module: path.join(oracle.directory, 'code-generator/index.js'),
        main: path.join(context.source, scenario.entry),
        output: context.output,
        options: scenario.api
      })
    );
    await checked(
      [
        process.execPath,
        path.join(root, 'tools/fidelity/programmatic.mjs'),
        request
      ],
      context.directory
    );
  } else
    await checked(
      [
        process.execPath,
        path.join(oracle.directory, 'cli/index.js'),
        'source/' + scenario.entry,
        '-o',
        context.output,
        ...(scenario.flags ?? [])
      ],
      context.directory
    );
}

test('all 20 cases persist and reload after source removal with original identities, CRCs, and member order', async (t) => {
  const dir = await temporary(t);
  for (const scenario of definitions) {
    await t.test(scenario.id, async () => {
      const context = await seed(path.join(dir, scenario.id), scenario);
      await original(context, scenario);
      const files = await parse(context, scenario);
      validateMetadataGraph(files, { requireContract: true });
      const metadataDir = path.join(context.directory, 'metadata');
      // Exercise the public metadata export path too, except where the API
      // supplies a custom rootDir, which is not currently a CLI input.
      if (!scenario.api?.compilerOptions?.rootDir) {
        const sorted = files[0].contract.sortProperties;
        await checked(
          [
            process.execPath,
            path.join(root, 'cli/jsb.js'),
            'source/' + scenario.entry,
            '--metadata-only',
            '-o',
            metadataDir,
            ...(sorted ? ['--sort-properties'] : [])
          ],
          context.directory
        );
      } else await persist(files, metadataDir);
      await fs.rm(context.source, { recursive: true });
      await assert.rejects(fs.access(context.source));
      const loaded = await load(metadataDir, { requireContract: true });
      assert.deepEqual(loaded, files);
      const output = await readTree(context.output);
      for (const file of loaded) {
        const c = file.contract;
        if (c.module) {
          assert.equal(c.outputPath, null);
          assert.ok(c.module.importPath.includes('/generated/'));
          continue;
        }
        const name = c.outputPath.replace(/\.ts$/, '.metadata.json');
        const sidecar = JSON.parse(output.get(name).toString('utf8')).__all;
        assert.deepEqual(
          sidecar.map((m) => m.name),
          c.declarations.map((m) => m.name)
        );
        for (const [i, item] of sidecar.entries()) {
          if (item.kind !== 'trait') {
            assert.equal(c.declarations[i].globalName, item.globalName, name);
            assert.equal(c.declarations[i].id, item.id, `${name}:${item.name}`);
            assert.deepEqual(
              file.metadata[i].params.map((p) => p.name),
              item.params.map((p) => p.name)
            );
          }
        }
      }
      if (scenario.id === 'programmatic-root')
        assert.equal(loaded[0].contract.logicalPath, 'source/schema');
      if (scenario.id === 'wire-names')
        assert.ok(
          loaded[0].contract.declarations.every((d) =>
            d.globalName.startsWith('wireNames.jsb.')
          )
        );
    });
  }
});

test('reject incomplete contracts, semantic mismatches, and missing graph dependencies', async (t) => {
  const dir = await temporary(t);
  const context = await seed(
    dir,
    definitions.find((s) => s.id === 'default')
  );
  const files = await parse(context, definitions[0]);
  const mutate = (edit, expression) => {
    const copy = structuredClone(files);
    edit(copy);
    assert.throws(
      () => validateMetadataGraph(copy, { requireContract: true }),
      expression
    );
  };
  mutate((f) => {
    delete f[0].contract;
  }, /contract is required/);
  mutate((f) => {
    f[0].contract.version = 2;
  }, /unsupported contract/);
  mutate((f) => {
    f[0].contract.logicalPath = '../escape';
  }, /inside the schema root/);
  mutate((f) => {
    f[0].contract.declarations[0].globalName = 'wrong';
  }, /identity/);
  mutate((f) => {
    f[0].contract.declarations[0].crcInput = 'wrong';
  }, /CRC/);
  mutate((f) => {
    f[0].metadata[0].globalName = 'wrong';
  }, /Metadata.globalName/);
  mutate((f) => {
    const call = f
      .flatMap((file) => file.metadata)
      .find((item) => item.kind === 'call');
    delete call.returnType;
  }, /returnType/);
  mutate((f) => {
    f[0].metadata.find((m) => m.kind !== 'trait').params[0].type = {
      type: 'generic',
      value: 'mystery',
      position: f[0].metadata[0].position
    };
  }, /unknown generic/);
  mutate((f) => {
    f.pop();
  }, /missing imported file|missing referenced file/);
  mutate((f) => {
    f[0].contract.fileOrder = 7;
  }, /file order/);
  mutate((f) => {
    f[0].contract.references[0].name = 'wrong';
  }, /resolved reference/);
  mutate((f) => {
    f[0].contract.references.push(f[0].contract.references[0]);
  }, /duplicate reference/);
  mutate((f) => {
    f[0].contract.imports[0].importPath = './wrong';
  }, /compiled import path/);
  const withParams = files
    .flatMap((f) => f.metadata)
    .find((m) => m.kind !== 'trait' && m.params.length > 1);
  assert.ok(withParams);
  mutate((f) => {
    const file = f.find((f) =>
      f.metadata.some((m) => m.name === withParams.name)
    );
    const i = file.metadata.findIndex((m) => m.name === withParams.name);
    file.contract.declarations[i].sourceParamOrder.reverse();
  }, /parameter order/);
  // Old dumps stay available to old consumers, but cannot satisfy native 1.x
  // generation's strict completeness requirement.
  const old = files.map(({ path, metadata }) => ({ path, metadata }));
  assert.doesNotThrow(() => validateMetadataGraph(old));
  assert.throws(
    () => validateMetadataGraph(old, { requireContract: true }),
    /contract is required/
  );
  assert.deepEqual(
    parseFileMetadata(JSON.stringify(old[0]), 'old.json'),
    old[0]
  );
});

test('default and sorted identities can be selected from either persisted member order', async (t) => {
  const dir = await temporary(t);
  const scenario = definitions.find((item) => item.id === 'default');
  const unsorted = await seed(path.join(dir, 'unsorted'), scenario);
  const sortedScenario = { ...scenario, flags: ['--sort-properties'] };
  const sorted = await seed(path.join(dir, 'sorted'), sortedScenario);
  await original(unsorted, scenario);
  await original(sorted, sortedScenario);
  const exports = [
    await parse(unsorted, scenario),
    await parse(sorted, sortedScenario)
  ];
  await fs.rm(unsorted.source, { recursive: true });
  await fs.rm(sorted.source, { recursive: true });
  for (const files of exports) {
    for (const [sortProperties, context] of [
      [false, unsorted],
      [true, sorted]
    ]) {
      for (const file of files) {
        const originalFile = JSON.parse(
          await fs.readFile(
            path.join(
              context.output,
              file.contract.outputPath.replace(/\.ts$/, '.metadata.json')
            ),
            'utf8'
          )
        ).__all;
        for (let i = 0; i < file.metadata.length; i++) {
          const declaration = originalTypeScriptDeclaration(file, i, {
            sortProperties
          });
          if (declaration.kind === 'trait') continue;
          assert.equal(declaration.id, originalFile[i].id);
          assert.equal(declaration.globalName, originalFile[i].globalName);
          assert.deepEqual(
            declaration.params.map((p) => p.name),
            originalFile[i].params.map((p) => p.name)
          );
        }
      }
    }
  }
});

test('package metadata rejects inconsistent compiled output identity', async (t) => {
  const dir = await temporary(t);
  const scenario = definitions.find((item) => item.id === 'external');
  const files = await parse(await seed(dir, scenario), scenario);
  files.find((file) => file.contract.module).contract.module.outDir =
    'different';
  assert.throws(() => validateMetadataGraph(files), /module output identity/);
});

test('manifest order is enforced and invalid or duplicate paths fail', async (t) => {
  const dir = await temporary(t);
  const context = await seed(path.join(dir, 'source-case'), definitions[0]);
  const files = await parse(context, definitions[0]);
  const metadataDir = path.join(dir, 'metadata');
  await persist(files, metadataDir);
  const manifest = path.join(metadataDir, METADATA_MANIFEST_FILE_NAME);
  for (const names of [
    ['0.metadata.json', '0.metadata.json'],
    ['../escape.metadata.json'],
    files.map((_, i) => `${i}.metadata.json`).reverse()
  ]) {
    await fs.writeFile(manifest, JSON.stringify({ files: names }));
    await assert.rejects(
      load(metadataDir),
      /Duplicate|Invalid metadata manifest path|file order|entry point/
    );
  }
});

test('line comments do not change pinned original generated bytes', async (t) => {
  const dir = await temporary(t);
  const scenario = definitions.find((s) => s.id === 'comments');
  const before = await seed(path.join(dir, 'before'), scenario);
  const after = await seed(path.join(dir, 'after'), scenario);
  const main = path.join(after.source, scenario.entry);
  await fs.writeFile(
    main,
    (await fs.readFile(main, 'utf8')).replace(/\/\/[^\n]*/g, '')
  );
  await original(before, scenario);
  await original(after, scenario);
  assert.equal(
    compareTrees(await readTree(before.output), await readTree(after.output))
      .equal,
    true
  );
});
