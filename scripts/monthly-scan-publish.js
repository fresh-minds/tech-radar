#!/usr/bin/env node
// GitHub access stays here; the research model has no GitHub or shell tools.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const UNITS = ['global', 'software', 'ai', 'cloud', 'data', 'security', 'sap'];
const OUTPUT = '.scan-output';
const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

function monthNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit' }).formatToParts(now);
  const year = Number(parts.find((p) => p.type === 'year').value);
  const month = Number(parts.find((p) => p.type === 'month').value);
  return new Date(Date.UTC(year, month - 2, 1)).toISOString().slice(0, 7);
}

function validateMonth(month, now = new Date()) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month > monthNow(now)) {
    throw new Error('Scan month must be a completed calendar month in YYYY-MM format.');
  }
  return month;
}

function repoName() {
  const repo = process.env.GH_REPO || process.env.GITHUB_REPOSITORY;
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo || '')) throw new Error('Set GH_REPO to owner/repository.');
  return repo;
}

function scanPaths(result) {
  validateMonth(result.month);
  if (result.branch !== `codex/tech-radar-scan-${result.month}`) throw new Error('Unexpected proposal branch.');
  if (result.fixture || result.dryRun || result.version !== 1 || !/^[a-f0-9]{40}$/.test(result.baseSha || '')) {
    throw new Error('Only a validated live scan can be published.');
  }
  const allowed = new Set(UNITS.map((unit) => `${unit}/radar-data.json`));
  if (!Array.isArray(result.modifiedFiles) || result.modifiedFiles.some((file) => !allowed.has(file))) {
    throw new Error('Scan attempts to publish a file outside the radar data allowlist.');
  }
  if (new Set(result.modifiedFiles).size !== result.modifiedFiles.length) throw new Error('Duplicate changed paths.');
  if (!result.changes || result.modifiedFiles.length === 0) throw new Error('No material changes to publish.');
  return [...result.modifiedFiles, `docs/research/${result.month}.md`];
}

function writeOutput(key, value) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

function summary(text) {
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);
  console.log(text);
}

function pullRequests(repo) {
  return JSON.parse(run('gh', ['pr', 'list', '--repo', repo, '--state', 'all', '--limit', '100',
    '--json', 'number,title,body,headRefName,state,url,updatedAt,files']));
}

function existingProposal(repo, branch) {
  const head = encodeURIComponent(`${repo.split('/')[0]}:${branch}`);
  const prs = JSON.parse(run('gh', ['api', `repos/${repo}/pulls?state=all&head=${head}&per_page=100`]));
  // Scope to this repository: a fork can use the same monthly branch name.
  return prs.find((pr) => pr.head?.repo?.full_name === repo);
}

function prepare() {
  const repo = repoName();
  const month = validateMonth(process.env.SCAN_MONTH || monthNow());
  const branch = `codex/tech-radar-scan-${month}`;
  const prs = pullRequests(repo);
  const existing = existingProposal(repo, branch);
  fs.mkdirSync(OUTPUT, { recursive: true });
  fs.writeFileSync(`${OUTPUT}/context.json`, JSON.stringify({ month, branch, pullRequests: prs }, null, 2));
  writeOutput('month', month);
  writeOutput('skip', existing ? 'true' : 'false');
  if (existing) summary(`Scan ${month} already has a ${existing.state.toLowerCase()} proposal: ${existing.html_url}. Preserving its review history.`);
  else summary(`Research window: ${month}, across all ${UNITS.length} radars.`);
}

function packageScan() {
  const result = readJSON(`${OUTPUT}/result.json`);
  writeOutput('changes', result.changes ? 'true' : 'false');
  if (!result.changes) {
    summary(`Completed ${result.month}: no material supported radar updates. Research is available in the run artifacts.`);
    return;
  }
  const files = scanPaths(result);
  for (const file of files) {
    const source = file.startsWith('docs/research/') ? `${OUTPUT}/report.md` : file;
    if (!fs.lstatSync(source).isFile()) throw new Error('Proposal must contain ordinary files.');
    const target = path.join(OUTPUT, 'patch', file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
  summary(`Validated ${result.changeCount} proposed updates for ${result.month}.`);
}

function publish() {
  const repo = repoName();
  const result = readJSON(`${OUTPUT}/result.json`);
  const files = scanPaths(result);
  const base = run('gh', ['api', `repos/${repo}`, '--jq', '.default_branch']);
  const head = run('gh', ['api', `repos/${repo}/git/ref/heads/${base}`, '--jq', '.object.sha']);
  if (head !== result.baseSha || run('git', ['rev-parse', 'HEAD']) !== result.baseSha) {
    throw new Error('Default branch changed during research. Re-run the scan against the latest data.');
  }
  const existing = existingProposal(repo, result.branch);
  if (existing) {
    summary(`Proposal already exists: ${existing.html_url}. No reviewer changes were overwritten.`);
    return;
  }
  if (run('git', ['status', '--porcelain', '--untracked-files=no'])) throw new Error('Publishing requires a clean checkout.');
  for (const file of files) {
    const source = path.join(OUTPUT, 'patch', file);
    if (!fs.lstatSync(source).isFile()) throw new Error('Proposal artifact must contain ordinary files.');
    if (file.endsWith('.json')) JSON.parse(fs.readFileSync(source, 'utf8'));
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.copyFileSync(source, file);
  }
  // Validate again in the write-permission job before committing the fixed allowlist.
  console.log(run('npm', ['run', 'validate']));
  run('git', ['switch', '-c', result.branch]);
  run('git', ['add', '--', ...files]);
  if (!run('git', ['diff', '--cached', '--name-only']).split('\n').some((file) => result.modifiedFiles.includes(file))) {
    throw new Error('Refusing a report-only proposal.');
  }
  run('git', ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com',
    'commit', '-m', `Propose monthly tech radar updates for ${result.month}`]);
  // gh reads the short-lived job token from its environment. No persisted git credentials.
  run('git', ['-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential',
    'push', 'origin', `HEAD:refs/heads/${result.branch}`]);
  const bodyFile = `${OUTPUT}/pr-body.md`;
  let body = fs.readFileSync(bodyFile, 'utf8');
  if (body.length > 58_000) {
    body = `Full research and owner questions: [dated report](https://github.com/${repo}/blob/${result.branch}/docs/research/${result.month}.md).\n\n${body.slice(0, 56_000)}\n\nFurther details are in the dated report.\n`;
  }
  fs.writeFileSync(bodyFile, `${body}\n\nValidation: \`npm run validate\` passed in both research and publishing jobs.\n\nThis is a proposal for owner review. No automatic merge or publication.\n`);
  const url = run('gh', ['pr', 'create', '--repo', repo, '--base', base, '--head', result.branch,
    '--title', `Monthly tech radar scan: ${result.month}`, '--body-file', bodyFile]);
  summary(`Review proposed radar updates: ${url}`);
}

if (require.main === module) {
  try {
    const action = { prepare, package: packageScan, publish }[process.argv[2]];
    if (!action) throw new Error('Usage: node scripts/monthly-scan-publish.js prepare|package|publish');
    action();
  } catch (error) {
    // Do not echo command stderr, which could contain authentication details.
    console.error(error.status ? 'GitHub/git command failed. Check repository permissions and branch state.' : error.message);
    process.exitCode = 1;
  }
}

module.exports = { monthNow, validateMonth, scanPaths };
