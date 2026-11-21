// Checks the JavaScript port against every golden vector in src/data/models/*.json
// and checks that the computed CRC-16 of each 201-byte image matches the file.
import fs from 'node:fs';
import { selfTest, modelImage, crc16 } from '../src/scripts/netsilcon.js';
let ok = true;
for (const f of fs.readdirSync(new URL('../src/data/models/', import.meta.url)).filter((n) => n.endsWith('.json'))) {
  const m = JSON.parse(fs.readFileSync(new URL(`../src/data/models/${f}`, import.meta.url)));
  const r = selfTest(m);
  const crc = crc16(modelImage(m)).toString(16).toUpperCase().padStart(4, '0');
  const good = r.pass === r.total && crc === m.crc16.toUpperCase();
  ok &&= good;
  console.log(`${good ? 'PASS' : 'FAIL'}  ${f.padEnd(18)} ${r.pass}/${r.total} bit-exact  CRC ${crc} (file ${m.crc16})`);
}
process.exit(ok ? 0 : 1);
