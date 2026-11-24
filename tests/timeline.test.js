import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NAV, NAV_PROGRESS, PAGE_SECTIONS, STEP_AT, chapterOf, stepOf, toProgress, toScroll } from '../src/config/timeline.js';
import { INSTALL_STEPS } from '../src/data/product.js';

test('toScroll is the inverse of toProgress', () => {
  for (let x = 0; x <= 1; x += 0.01) assert.ok(Math.abs(toScroll(toProgress(x)) - x) < 1e-10);
});

test('each 3D menu entry lands in its own chapter', () => {
  for (const [key, p] of Object.entries(NAV_PROGRESS)) assert.equal(chapterOf(p), key);
});

test('every menu entry has a destination', () => {
  for (const { key } of NAV) assert.ok(key === 'home' || key in NAV_PROGRESS || key in PAGE_SECTIONS);
});

test('one timeline step per install step, all inside the install chapter', () => {
  assert.equal(STEP_AT.length, INSTALL_STEPS.length);
  STEP_AT.forEach((p, i) => {
    assert.equal(stepOf(p), i);
    assert.equal(chapterOf(p), 'install');
  });
});
