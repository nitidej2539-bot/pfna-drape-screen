import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CODE, lineOf } from '../tools/demoCode.js';

test('every demo anchor points at real code', () => {
  const broken = Object.entries(CODE).filter(([, [file, text]]) => lineOf(file, text) === 0);
  assert.deepEqual(broken, []);
});
