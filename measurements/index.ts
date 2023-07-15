import {
  decodeNormalStringList,
  decodeNullTerminatedStringList,
  encodeNormalStringList,
  encodeNullTerminatedStringList,
  normalStringList,
  nullTerminatedStringList,
} from '../out/schema';
import { Deserializer, Serializer } from '../codec';
import perf_hooks from 'perf_hooks';
import crypto from 'crypto';

function measureEncodingListOfStrings() {
  const s = new Serializer({
    textEncoder: new TextEncoder(),
  });

  const hugeStringList = new Array<string>(10000);

  for (let i = 0; i < hugeStringList.length; i++) {
    hugeStringList[i] = crypto.randomBytes(1000).toString('hex');
  }

  encodeNormalStringList(
    s,
    normalStringList({
      value: hugeStringList,
    })
  );
  encodeNullTerminatedStringList(
    s,
    nullTerminatedStringList({
      value: hugeStringList,
    })
  );
  const d = new Deserializer({
    buffer: s.view(),
    textDecoder: new TextDecoder(),
  });

  perf_hooks.performance.mark('normalStringList');
  decodeNormalStringList(d);
  perf_hooks.performance.measure('normalStringList to now', 'normalStringList');

  perf_hooks.performance.mark('nullTerminatedStringList');
  decodeNullTerminatedStringList(d);
  perf_hooks.performance.measure(
    'nullTerminatedStringList to now',
    'nullTerminatedStringList'
  );
}

function measureNullTerminatedString() {
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

const obs = new perf_hooks.PerformanceObserver((items) => {
  for (const item of items.getEntries()) {
    console.log('%s: %d ms', item.name, item.duration);
  }
  performance.clearMarks();
});
obs.observe({ type: 'measure' });

measureEncodingListOfStrings();
measureNullTerminatedString();
