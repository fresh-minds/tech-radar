const { test } = require('node:test');
const assert = require('node:assert/strict');
const { monthNow, validateMonth, scanPaths } = require('./monthly-scan-publish');

const validResult = () => ({
  version: 1, month: '2026-09', branch: 'codex/tech-radar-scan-2026-09',
  baseSha: 'a'.repeat(40), fixture: false, dryRun: false, changes: true,
  modifiedFiles: ['software/radar-data.json'],
});

test('month calculation uses Amsterdam calendar boundaries and year rollover', () => {
  assert.equal(monthNow(new Date('2026-10-31T23:30:00Z')), '2026-10');
  assert.equal(monthNow(new Date('2026-12-31T23:30:00Z')), '2026-12');
  assert.equal(monthNow(new Date('2026-07-31T21:30:00Z')), '2026-06');
  assert.throws(() => validateMonth('2026-10', new Date('2026-10-22T10:00:00Z')), /completed/);
  assert.throws(() => validateMonth('2026-13'), /completed/);
});

test('publisher permits only actual radar data plus its dated research report', () => {
  assert.deepEqual(scanPaths(validResult()), ['software/radar-data.json', 'docs/research/2026-09.md']);
  for (const file of ['.github/workflows/validate.yml', '../radar-data.json', 'software/../../package.json']) {
    assert.throws(() => scanPaths({ ...validResult(), modifiedFiles: [file] }), /allowlist/);
  }
  assert.throws(() => scanPaths({ ...validResult(), modifiedFiles: [] }), /No material/);
  assert.throws(() => scanPaths({ ...validResult(), changes: false }), /No material/);
  assert.throws(() => scanPaths({ ...validResult(), modifiedFiles: ['software/radar-data.json', 'software/radar-data.json'] }), /Duplicate/);
});

test('offline, dry-run, or unversioned artifacts can never create real PRs', () => {
  for (const patch of [{ fixture: true }, { dryRun: true }, { version: 0 }, { baseSha: null }]) {
    assert.throws(() => scanPaths({ ...validResult(), ...patch }), /live scan/);
  }
  assert.throws(() => scanPaths({ ...validResult(), branch: 'main' }), /branch/);
});
