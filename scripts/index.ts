import { getArgument } from 'cli-argument-helper';
import { Deserializer, Serializer } from '../codec';
import crypto from 'crypto';
import perf_hooks from 'perf_hooks';

async function measureNullTerminatedString() {
  const obs = new perf_hooks.PerformanceObserver((items) => {
    for (const item of items.getEntries()) {
      console.log('%s: %d ms', item.name, item.duration);
    }
    performance.clearMarks();
  });
  obs.observe({ type: 'measure' });

  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });
  const inputs = [
    crypto.randomBytes(100000),
    crypto.randomBytes(256),
    crypto.randomBytes(64),
    crypto.randomBytes(32),
    crypto.randomBytes(8),
  ].map((buffer, index) => ({
    index,
    buffer,
    hex: buffer.toString('hex'),
  }));

  for (const { hex } of inputs) {
    s.writeNullTerminatedString(hex);
    s.writeString(hex);
  }

  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });

  for (const { index, buffer } of inputs) {
    //readNullTerminatedString
    const nullTerminatedName = `${index}: readNullTerminatedString - ${buffer.byteLength} bytes`;
    perf_hooks.performance.mark(nullTerminatedName);
    d.readNullTerminatedString();
    perf_hooks.performance.measure(
      `${nullTerminatedName} to now`,
      nullTerminatedName
    );

    //readNullTerminatedString
    const normalStringName = `${index}: readString - ${buffer.byteLength} bytes`;
    perf_hooks.performance.mark(normalStringName);
    d.readString();
    perf_hooks.performance.measure(
      `${normalStringName} to now`,
      normalStringName
    );
  }
}

(async () => {
  const args = Array.from(process.argv);
  if (getArgument(args, '--measure-c-string') !== null) {
    await measureNullTerminatedString();
  }
})().catch((reason) => {
  console.error(reason);
  process.exitCode = 1;
});
