import { Suite } from 'sarg';
import { spawn } from 'child-process-utilities';
import path from 'path';
import { glob } from 'glob';

const suite = new Suite();

suite.test(
  'FileGeneratorKotlin: it should generate valid Kotlin code',
  async () => {
    const libDir = path.resolve(__dirname, '../kotlin/lib');
    const cliDir = path.resolve(__dirname, '../cli');
    await spawn('npx', [
      'ts-node',
      '--project',
      path.resolve(cliDir, 'tsconfig.json'),
      cliDir,
      path.resolve(__dirname, '../kotlin/src/main'),
      '-o',
      path.resolve(__dirname, '../kotlin/typescript')
    ]).wait();
    await spawn('npx', [
      'ts-node',
      '--project',
      path.resolve(cliDir, 'tsconfig.json'),
      path.resolve(cliDir, 'kotlin.ts'),
      path.resolve(__dirname, '../kotlin/src/jsbufferconfig.json'),
      '--name',
      'com.test.app.schema',
      '-o',
      libDir
    ]).wait();
    await spawn('kotlinc', [
      ...(await glob(path.resolve(libDir, 'com/**/*.kt'))),
      ...(await glob(path.resolve(libDir, 'test/**/*.kt'))),
      path.resolve(libDir, 'main.kt'),
      '-include-runtime',
      '-d',
      path.resolve(libDir, 'main.jar')
    ]).wait();
    await spawn('java', ['-jar', path.resolve(libDir, 'main.jar')]).wait();
  }
);

export default suite;
