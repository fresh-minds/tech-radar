'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const scan = require('./monthly-scan');

const MONTH = '2026-09';
const NOW = new Date('2026-10-22T12:00:00Z');
const URL = 'https://project.example.org/releases/2026-09';
const CITATION_URL = 'https://standards.example.org/2026/update';
const QUADRANTS = ['Languages & Frameworks', 'Platforms', 'Tools', 'Techniques'];
const FOUNDRY_ENDPOINT = 'https://devfreshmindsaifoundry.services.ai.azure.com/openai/v1';

function response(text = 'Official September releases reviewed for all six units.') {
  return { status: 'completed', output: [
    { type: 'web_search_call', status: 'completed', action: { type: 'search', sources: [{ type: 'url', url: URL }] } },
    { type: 'message', status: 'completed', content: [{ type: 'output_text', text, annotations: [{ type: 'url_citation', url: CITATION_URL }] }] }
  ] };
}

function radars() {
  return Object.fromEntries(scan.UNIT_IDS.map(id => [id, {
    title: `${id} radar`, date: '2026.03', quadrants: [...QUADRANTS], editionNote: 'preserve root metadata',
    entries: [{ label: 'Existing tool', quadrant: 'Tools', ring: 'Trial', moved: 2,
      description: 'Een bestaande korte beschrijving.', tags: ['jvm'], link: 'https://old.example.org/docs', custom: 'keep entry metadata' }]
  }]));
}

function proposal(changes = []) {
  return { month: MONTH, summary: 'Nieuwe ontwikkelingen onderzocht; de unit owners beoordelen voorstellen.',
    unitReviews: scan.UNIT_IDS.map(unitId => ({ unitId, summary: 'Officiële bronnen onderzocht.' })), changes, ownerQuestions: [] };
}

function addition(overrides = {}) {
  return { unitId: 'software', operation: 'add', label: 'New tool', quadrant: 'Tools', ring: 'Assess',
    description: 'Een nieuwe tool die nader onderzoek verdient.', tags: null, link: null,
    rationale: 'De officiële release introduceert een relevante mogelijkheid.',
    evidence: [{ url: URL, title: 'Official project release', date: '2026-09-15', primary: true }], ...overrides };
}

function update(overrides = {}) {
  return addition({ operation: 'update', label: 'Existing tool', ring: 'Trial', ...overrides });
}

function validate(value, data = radars()) {
  return scan.validateProposal(value, scan.collectResearch(response()), data, MONTH, scan.monthCoverage(MONTH, NOW));
}

function tempRepo(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'radar-scan-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const data = radars();
  for (const id of scan.UNIT_IDS) {
    fs.mkdirSync(path.join(root, id));
    fs.writeFileSync(path.join(root, id, 'radar-data.json'), `${JSON.stringify(data[id], null, 2)}\n`);
  }
  fs.mkdirSync(path.join(root, 'docs'));
  fs.writeFileSync(path.join(root, 'units.json'), JSON.stringify(scan.UNIT_IDS.map(id => ({ id, path: id === 'global' ? '/' : `/${id}/` }))));
  for (const file of ['README.md', 'CONTRIBUTING.md', 'docs/tech-radar-design-decisions.md']) fs.writeFileSync(path.join(root, file), 'Owner review required.');
  fs.writeFileSync(path.join(root, 'research.fixture.json'), JSON.stringify(response()));
  return { root, data };
}

async function runFixture(root, value, options = {}) {
  const file = path.join(root, 'proposal.fixture.json');
  fs.writeFileSync(file, JSON.stringify(value));
  return scan.run({ month: MONTH, proposal: file, research: path.join(root, 'research.fixture.json'), ...options }, { root, now: NOW });
}

test('Amsterdam month boundaries, previous completed month, and leap year coverage', () => {
  assert.equal(scan.calendarMonth(new Date('2026-04-30T22:30:00Z')), '2026-05');
  assert.equal(scan.previousMonth(new Date('2026-04-30T22:30:00Z')), '2026-04');
  assert.equal(scan.previousMonth(new Date('2026-12-31T23:30:00Z')), '2026-12');
  assert.deepEqual(scan.monthCoverage('2024-02', NOW), { start: '2024-02-01', end: '2024-02-29', timeZone: 'Europe/Amsterdam' });
  assert.equal(scan.monthCoverage('2025-02', NOW).end, '2025-02-28');
  for (const month of ['2026-10', '2026-11', '2026-00', '2026-13', '26-09', '../data']) assert.throws(() => scan.monthCoverage(month, NOW));
});

test('research allowlist uses actual tool source URLs and citations, requiring completed hosted search', () => {
  const found = scan.collectResearch(response());
  assert.deepEqual(found.sourceUrls, [URL, CITATION_URL].sort());
  assert.equal(found.completedSearches, 1);
  const withoutSearch = response(`A fabricated source URL in plain text: https://unseen.example.org/`);
  withoutSearch.output.shift();
  assert.throws(() => scan.collectResearch(withoutSearch), /completed hosted web search/);
  assert.throws(() => validate(proposal([addition({ evidence: [{ url: 'https://unseen.example.org/', title: 'Fabricated', date: '2026-09-15', primary: true }] })])), /not returned by research/);
});

test('evidence must include a primary source with a real date within the scan month', () => {
  for (const evidence of [
    [{ url: URL, title: 'News summary', date: '2026-09-15', primary: false }],
    [{ url: URL, title: 'Old release', date: '2026-08-31', primary: true }],
    [{ url: URL, title: 'Future release', date: '2026-10-01', primary: true }],
    [{ url: URL, title: 'Invalid date', date: '2026-09-31', primary: true }]
  ]) assert.throws(() => validate(proposal([addition({ evidence })])));
  assert.throws(() => validate(proposal([addition({ link: 'https://unseen.example.org/' })])), /not returned by research/);
});

test('new entries are Assess; promotions, renames, removals and quadrant changes are rejected', () => {
  assert.throws(() => validate(proposal([addition({ ring: 'Adopt' })])), /New entries must be Assess/);
  assert.throws(() => validate(proposal([update({ ring: 'Adopt' })])), /promotions/);
  assert.throws(() => validate(proposal([update({ label: 'existing tool' })])), /Renaming/);
  assert.throws(() => validate(proposal([update({ operation: 'remove' })])), /Only add and update/);
  assert.throws(() => validate(proposal([update({ quadrant: 'Platforms' })])), /quadrant/);
  const assess = radars();
  assess.software.entries[0].ring = 'Assess';
  assert.throws(() => validate(proposal([update({ ring: 'Trial' })]), assess), /promotions/);
});

test('only six known unit paths are allowlisted and symlinks are rejected', t => {
  const { root } = tempRepo(t);
  assert.throws(() => scan.radarPath(root, '../software'), /not allowlisted/);
  assert.throws(() => validate(proposal([addition({ unitId: '../software' })])), /not allowlisted/);
  const original = path.join(root, 'software', 'radar-data.json');
  const target = path.join(root, 'copied.json');
  fs.renameSync(original, target);
  fs.symlinkSync(target, original);
  assert.throws(() => scan.radarPath(root, 'software'), /symbolic links/);
});

test('all six unique units are mandatory even for no changes; duplicate labels are rejected', () => {
  const noChange = validate(proposal());
  assert.deepEqual(noChange.modifiedFiles, []);
  assert.deepEqual(noChange.applied, []);
  const missing = proposal();
  missing.unitReviews.pop();
  assert.throws(() => validate(missing), /All six/);
  const duplicate = proposal();
  duplicate.unitReviews[5].unitId = 'global';
  assert.throws(() => validate(duplicate), /six unique/);
  assert.throws(() => validate(proposal([addition(), addition({ label: 'new tool' })])), /Duplicate add\/update/);
  assert.throws(() => validate(proposal([addition({ label: 'Existing tool' })])), /already exists/);
  assert.throws(() => validate(proposal([update({ label: 'Unknown tool' })])), /unknown label/);
});

test('valid deterministic plan preserves dates, unrelated entries and metadata; moved is calculated', () => {
  const data = radars();
  const original = structuredClone(data);
  const plan = validate(proposal([addition(), update(), update({ unitId: 'ai', ring: 'Hold' })]), data);
  assert.deepEqual(data, original, 'validation must not mutate input');
  assert.deepEqual(plan.modifiedFiles, ['software/radar-data.json', 'ai/radar-data.json']);
  assert.equal(plan.radars.software.date, '2026.03');
  assert.equal(plan.radars.software.editionNote, original.software.editionNote);
  assert.deepEqual(plan.radars.global, original.global);
  const existing = plan.radars.software.entries[0];
  assert.equal(existing.moved, 2, 'same-ring updates must preserve existing moved flag');
  assert.deepEqual(existing.tags, ['jvm']);
  assert.equal(existing.link, 'https://old.example.org/docs');
  assert.equal(existing.custom, 'keep entry metadata');
  assert.equal(plan.radars.software.entries[1].moved, 2);
  assert.equal(plan.radars.ai.entries[0].moved, -1);
  assert.equal(plan.radars.ai.entries[0].ring, 'Hold');
});

test('offline no-change end-to-end creates marked artifacts without writing any radar data', async t => {
  const { root } = tempRepo(t);
  const before = scan.UNIT_IDS.map(id => fs.readFileSync(path.join(root, id, 'radar-data.json'), 'utf8'));
  const result = await runFixture(root, proposal());
  assert.equal(result.changes, false);
  assert.equal(result.fixture, true);
  assert.deepEqual(result.reviewedUnitIds, scan.UNIT_IDS);
  assert.equal(result.branch, 'codex/tech-radar-scan-2026-09');
  assert.deepEqual(result.coverage, { start: '2026-09-01', end: '2026-09-30', timeZone: 'Europe/Amsterdam' });
  scan.UNIT_IDS.forEach((id, index) => assert.equal(fs.readFileSync(path.join(root, id, 'radar-data.json'), 'utf8'), before[index]));
  for (const artifact of ['result.json', 'report.md', 'pr-body.md', 'research.json', 'proposal.json']) assert.ok(fs.existsSync(path.join(root, '.scan-output', artifact)));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, '.scan-output', 'research.json'))), scan.collectResearch(response()));
  const report = fs.readFileSync(path.join(root, '.scan-output', 'report.md'), 'utf8');
  assert.match(report, /OFFLINE TEST FIXTURE/);
  assert.match(report, /No radar changes/);
});

test('offline change end-to-end writes only approved radar file and renders dated evidence', async t => {
  const { root } = tempRepo(t);
  const result = await runFixture(root, proposal([addition()]));
  assert.equal(result.changeCount, 1);
  assert.deepEqual(result.modifiedFiles, ['software/radar-data.json']);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'software', 'radar-data.json'))).entries[1].label, 'New tool');
  const body = fs.readFileSync(path.join(root, '.scan-output', 'pr-body.md'), 'utf8');
  assert.match(body, /New → Assess/);
  assert.match(body, /2026-09-15; primary source/);
  assert.ok(body.includes(URL));
});

test('complete plan is verified before any radar data is written; dry-run never mutates', async t => {
  const { root, data } = tempRepo(t);
  await assert.rejects(runFixture(root, proposal([addition(), update({ unitId: 'ai', ring: 'Adopt' })])), /promotions/);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'software', 'radar-data.json'))), data.software);
  assert.ok(fs.existsSync(path.join(root, '.scan-output', 'research.json')));
  assert.ok(fs.existsSync(path.join(root, '.scan-output', 'proposal.json')));
  assert.equal(fs.existsSync(path.join(root, '.scan-output', 'result.json')), false);
  const dryResult = await runFixture(root, proposal([addition()]), { dryRun: true });
  assert.equal(dryResult.dryRun, true);
  assert.equal(dryResult.changes, true);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'software', 'radar-data.json'))), data.software);
});

test('failed extraction retains research audit and removes stale success artifacts', async t => {
  const { root } = tempRepo(t);
  await runFixture(root, proposal());
  let calls = 0;
  await assert.rejects(scan.run({ month: MONTH }, { root, now: NOW, env: { FOUNDRY_AZURE_AI_KEY: 'test-secret' }, fetchImpl: async () => {
    calls++;
    return new Response(JSON.stringify(calls === 1 ? response() : { status: 'incomplete', output: [] }));
  } }), /did not complete/);
  assert.equal(calls, 2);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, '.scan-output', 'research.json'))), scan.collectResearch(response()));
  assert.equal(fs.existsSync(path.join(root, '.scan-output', 'result.json')), false);
  assert.equal(fs.existsSync(path.join(root, '.scan-output', 'proposal.json')), false);
});

test('unsafe output locations and artifact symlinks fail before any API request', async t => {
  const { root } = tempRepo(t);
  let calls = 0;
  const dependencies = { root, now: NOW, env: { FOUNDRY_AZURE_AI_KEY: 'test-secret' }, fetchImpl: async () => { calls++; throw new Error('must not fetch'); } };
  await assert.rejects(scan.run({ month: MONTH, output: 'software' }, dependencies), /overlap radar directories/);
  fs.mkdirSync(path.join(root, '.scan-output'));
  fs.symlinkSync(path.join(root, 'ai', 'radar-data.json'), path.join(root, '.scan-output', 'research.json'));
  await assert.rejects(scan.run({ month: MONTH }, dependencies), /without symbolic links/);
  assert.equal(calls, 0);
});

test('incomplete, missing, or refusal API output fails closed', async () => {
  assert.throws(() => scan.responseText({ status: 'incomplete', output: [] }), /did not complete/);
  assert.throws(() => scan.responseText({ status: 'completed', output: [] }), /nonempty string/);
  assert.throws(() => scan.responseText({ status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'No' }] }] }), /refused/);
  await assert.rejects(scan.callResponses({}, { apiKey: 'test-secret', fetchImpl: async () => new Response(JSON.stringify({ status: 'incomplete', output: [] })) }), /did not complete/);
});

test('research requires Foundry hosted web_search, extraction has no tools and uses strict schema', () => {
  const bodies = scan.requestBodies({}, MONTH, scan.monthCoverage(MONTH, NOW), 'test-model');
  assert.equal(bodies.research.tool_choice, 'required');
  assert.deepEqual(bodies.research.tools, [{ type: 'web_search', external_web_access: false }]);
  assert.deepEqual(bodies.research.include, ['web_search_call.action.sources']);
  assert.equal(bodies.research.max_tool_calls, 18);
  assert.equal(bodies.research.store, false);
  const extraction = bodies.extraction(scan.collectResearch(response()));
  assert.equal(extraction.tools, undefined);
  assert.equal(extraction.text.format.type, 'json_schema');
  assert.equal(extraction.text.format.strict, true);
  assert.equal(extraction.text.format.schema, scan.PROPOSAL_SCHEMA);
});

test('Foundry endpoint normalization accepts only HTTPS Azure v1 resource routes', () => {
  assert.equal(scan.responsesEndpoint(), `${FOUNDRY_ENDPOINT}/responses`);
  for (const base of [FOUNDRY_ENDPOINT, `${FOUNDRY_ENDPOINT}/`, 'https://another.openai.azure.com/openai/v1', 'https://another.openai.azure.com/openai/v1/']) {
    assert.equal(scan.responsesEndpoint(base), `${base.replace(/\/$/, '')}/responses`);
  }
  for (const endpoint of [
    'http://devfreshmindsaifoundry.services.ai.azure.com/openai/v1',
    'https://user:password@devfreshmindsaifoundry.services.ai.azure.com/openai/v1',
    `${FOUNDRY_ENDPOINT}?api-version=preview`,
    `${FOUNDRY_ENDPOINT}#fragment`,
    'https://api.openai.com/openai/v1',
    'https://resource.services.ai.azure.com.evil.example/openai/v1',
    'https://services.ai.azure.com/openai/v1',
    'https://resource.openai.azure.com/',
    `${FOUNDRY_ENDPOINT}/responses`,
    'https://resource.openai.azure.com/other/openai/v1',
    'not a URL'
  ]) assert.throws(() => scan.responsesEndpoint(endpoint), /endpoint|HTTPS|Azure|Foundry/i);
});

test('Foundry transport sends the resource key only in api-key and disallows redirects', async () => {
  const body = { model: 'gpt-6-luna', input: 'Research the scan month.' };
  for (const endpoint of [undefined, 'https://another.openai.azure.com/openai/v1/']) {
    let calls = 0;
    const found = await scan.callResponses(body, { apiKey: 'test-foundry-key', endpoint, fetchImpl: async (url, options) => {
      calls++;
      assert.equal(url, scan.responsesEndpoint(endpoint));
      assert.equal(options.method, 'POST');
      assert.equal(options.redirect, 'error');
      const headers = new Headers(options.headers);
      assert.equal(headers.get('api-key'), 'test-foundry-key');
      assert.equal(headers.has('authorization'), false);
      assert.equal(headers.get('content-type'), 'application/json');
      assert.deepEqual(JSON.parse(options.body), body);
      return new Response(JSON.stringify(response()));
    } });
    assert.equal(calls, 1);
    assert.equal(found.status, 'completed');
  }
});

test('live scan uses the default Foundry deployment and honors endpoint and deployment overrides', async t => {
  for (const settings of [
    { env: {}, model: 'gpt-6-luna', endpoint: FOUNDRY_ENDPOINT },
    { env: { RADAR_SCAN_MODEL: 'custom-foundry-deployment', FOUNDRY_AZURE_AI_ENDPOINT: 'https://another.openai.azure.com/openai/v1/' },
      model: 'custom-foundry-deployment', endpoint: 'https://another.openai.azure.com/openai/v1/' }
  ]) {
    const { root } = tempRepo(t);
    const bodies = [];
    await assert.rejects(scan.run({ month: MONTH }, { root, now: NOW,
      env: { FOUNDRY_AZURE_AI_KEY: 'test-foundry-key', ...settings.env }, fetchImpl: async (url, options) => {
        assert.equal(url, scan.responsesEndpoint(settings.endpoint));
        assert.equal(new Headers(options.headers).get('api-key'), 'test-foundry-key');
        bodies.push(JSON.parse(options.body));
        return new Response(JSON.stringify(bodies.length === 1 ? response() : { status: 'incomplete', output: [] }));
      }
    }), /did not complete/);
    assert.equal(bodies.length, 2);
    assert.deepEqual(bodies.map(body => body.model), [settings.model, settings.model]);
  }
});

test('missing Foundry key and unsafe configured endpoint fail before any API request', async t => {
  let calls = 0;
  const fetchImpl = async () => { calls++; throw new Error('must not fetch'); };
  for (const apiKey of [undefined, null, '']) {
    await assert.rejects(scan.callResponses({}, { apiKey, fetchImpl }), /FOUNDRY_AZURE_AI_KEY/);
  }
  for (const endpoint of ['https://evil.example/openai/v1', `${FOUNDRY_ENDPOINT}?redirect=evil`, 'http://resource.openai.azure.com/openai/v1']) {
    await assert.rejects(scan.callResponses({}, { apiKey: 'test-foundry-key', endpoint, fetchImpl }), /endpoint|HTTPS|Azure|Foundry/i);
  }
  const { root } = tempRepo(t);
  await assert.rejects(scan.run({ month: MONTH }, { root, now: NOW,
    env: { OPENAI_API_KEY: 'old-key-must-not-be-used' }, fetchImpl }), /FOUNDRY_AZURE_AI_KEY/);
  await assert.rejects(scan.run({ month: MONTH }, { root, now: NOW,
    env: { FOUNDRY_AZURE_AI_KEY: 'test-foundry-key', FOUNDRY_AZURE_AI_ENDPOINT: 'https://evil.example/openai/v1' }, fetchImpl }), /endpoint|HTTPS|Azure|Foundry/i);
  assert.equal(calls, 0);
});

test('API failures retry within bounds and never expose provider response bodies or secrets', async () => {
  let calls = 0;
  await assert.rejects(scan.callResponses({}, { apiKey: 'secret-never-output', sleep: async () => {}, fetchImpl: async () => {
    calls++;
    return new Response('secret-never-output provider details', { status: 500 });
  } }), error => error.message.includes('HTTP 500') && !error.message.includes('secret-never-output'));
  assert.equal(calls, 2);
  calls = 0;
  await assert.rejects(scan.callResponses({}, { apiKey: 'secret-never-output', fetchImpl: async () => { calls++; return new Response('private details', { status: 401 }); } }), /HTTP 401/);
  assert.equal(calls, 1);
});

test('strict local schema rejects unknown fields, too many proposals, unsafe URLs, and incomplete fixtures', () => {
  assert.throws(() => validate({ ...proposal(), arbitrary: true }), /unexpected fields/);
  assert.throws(() => validate(proposal(Array.from({ length: 13 }, (_, index) => addition({ label: `Tool ${index}` })))), /At most 12/);
  for (const url of ['http://example.org/', 'https://127.0.0.1/', 'https://localhost/', 'https://user:pass@example.org/']) assert.throws(() => scan.sourceUrl(url));
  assert.throws(() => scan.parseArgs(['--proposal', 'test.json']), /both/);
  assert.throws(() => scan.parseArgs(['--month', MONTH, '--month', MONTH]), /duplicate/);
});
