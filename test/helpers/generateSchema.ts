import { spawn } from 'child-process-utilities';
import { ISchema } from './runNativeSchemaTests';
import path from 'node:path';
import Time from './Time';

export default async function generateSchema(schema: ISchema) {
  await spawn(
    'node',
    [
      path.resolve(__dirname, '../../cli/jsb'),
      schema.mainFile,
      '--name',
      schema.name,
      '--generator',
      'c99',
      '-o',
      schema.outDir
    ],
    { timeout: Time.milliseconds.Minute * 2 }
  ).wait();
}
