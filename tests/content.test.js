import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import EN from '../src/data/en.js';
import { NAV } from '../src/config/timeline.js';
import * as product from '../src/data/product.js';
import * as team from '../src/data/team.js';

const strings = (x) => (typeof x === 'string' ? [x] : x && typeof x === 'object' ? Object.values(x).flatMap(strings) : []);
const isThai = (s) => /[ก-๙]/.test(s);
const data = strings([{ ...product }, { ...team }, NAV]);

// ข้อความใน t('…') ทุกจุดของเว็บหลัก
const BACKSLASH_N = String.fromCharCode(92) + 'n';
const sources = readdirSync('src', { recursive: true })
  .filter((f) => /\.jsx?$/.test(f) && !/flat|demo\.js|en\.js|i18n\.js/.test(f))
  .map((f) => readFileSync(join('src', f), 'utf8'))
  .join('\n');
const literals = [...sources.matchAll(/\bt\('([^']+)'\)/g)].map((m) => m[1].replaceAll(BACKSLASH_N, '\n'));

test('every Thai string shown on the site has an English translation', () => {
  assert.ok(literals.length > 40);
  assert.deepEqual([...data, ...literals].filter((s) => isThai(s) && !(s in EN)), []);
});

test('every image referenced by content exists', () => {
  assert.deepEqual(data.filter((s) => s.startsWith('images/') && !existsSync(join('public', s))), []);
});

const SEQUENCES = [
  ['walkin-hd', 365],
  ['walkin', 228],
  ['install', 207],
  ['pole3', 192],
];
SEQUENCES.forEach(([dir, n]) => test(`${dir} has all ${n} frames`, () => {
  const files = Array.from({ length: n }, (_, i) => `public/${dir}/f${String(i).padStart(4, '0')}.webp`);
  assert.deepEqual(files.filter((f) => !existsSync(f)), []);
}));
