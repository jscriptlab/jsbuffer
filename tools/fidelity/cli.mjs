import fs from 'node:fs/promises';
import path from 'node:path';
import {
  compareSuite,
  describe,
  prepareOracle,
  scenarios,
  root
} from './core.mjs';

try {
  const args = process.argv.slice(2);
  const command = args.shift();
  const option = (name) => {
    const index = args.indexOf(name);
    if (index === -1) return undefined;
    if (!args[index + 1]) throw new Error('Missing value for ' + name);
    const value = args[index + 1];
    args.splice(index, 2);
    return value;
  };
  const mode = option('--mode') ?? 'legacy';
  const report = option('--report');
  const ids = option('--scenarios')?.split(',');
  const cache = option('--cache');
  const tarball = option('--tarball');
  const adapterOption = option('--adapter');
  const adapter =
    adapterOption === 'native'
      ? [process.execPath, path.join(root, 'tools/fidelity/native-adapter.mjs')]
      : adapterOption
      ? JSON.parse(adapterOption)
      : undefined;
  if (args.length) throw new Error('Unknown arguments: ' + args.join(' '));
  if (command === 'list')
    console.log((await scenarios()).map((item) => item.id).join('\n'));
  else if (command === 'setup' || command === 'compare') {
    if (!['legacy', 'oracle', 'metadata'].includes(mode))
      throw new Error('Unknown comparison mode: ' + mode);
    if (
      adapter &&
      (!Array.isArray(adapter) ||
        !adapter.length ||
        adapter.some((arg) => typeof arg !== 'string'))
    )
      throw new Error('--adapter must be a nonempty JSON argv array');
    if (adapter && mode !== 'metadata')
      throw new Error('--adapter requires metadata mode');
    const oracle = await prepareOracle({ cache, tarball });
    if (command === 'setup')
      console.log(
        'Verified isolated original jsbuffer@1.0.28 at ' + oracle.directory
      );
    else {
      const result = await compareSuite({
        oracle,
        mode,
        ids,
        adapter,
        onResult: (entry) => console.log(describe(entry))
      });
      if (report) {
        await fs.mkdir(path.dirname(path.resolve(report)), { recursive: true });
        await fs.writeFile(report, JSON.stringify(result, null, 2) + '\n');
      }
      process.exitCode = result.passed ? 0 : 1;
    }
  } else
    throw new Error(
      'Usage: node tools/fidelity/cli.mjs list|setup|compare [--mode oracle|legacy|metadata] [--scenarios ids] [--report file] [--adapter native|JSON-argv]'
    );
} catch (error) {
  console.error(error.stack);
  process.exitCode = 1;
}
