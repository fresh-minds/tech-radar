const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { execFileSync } = require("node:child_process");
const { buildUpdateStatus, writeUpdateStatus } = require("./build-update-status");

const git = (root, args, env = {}) => execFileSync("git", args, {
  cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, ...env },
}).trim();
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "radar-updates-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const units = [{ id: "global", label: "Overzicht", path: "/" }, { id: "ai", label: "AI", path: "/ai/" }];
  fs.writeFileSync(path.join(root, "units.json"), JSON.stringify(units));
  for (const unit of units) {
    fs.mkdirSync(path.join(root, unit.id));
    radar(root, unit.id, unit.id === "ai" ? [] : [{ label: "Example" }]);
  }
  return root;
}
function radar(root, id, entries) {
  fs.writeFileSync(path.join(root, id, "radar-data.json"), JSON.stringify({ title: id, date: "2025.01", entries }));
}
function initialize(root) {
  git(root, ["init", "-b", "main"]);
  git(root, ["config", "user.email", "test@example.com"]);
  git(root, ["config", "user.name", "Test"]);
}
function commit(root, date) {
  git(root, ["add", "."]);
  git(root, ["commit", "-m", "Update"], { GIT_AUTHOR_DATE: "2024-01-01T10:00:00Z", GIT_COMMITTER_DATE: date });
  return git(root, ["rev-parse", "HEAD"]);
}

test("dates follow published content commits, independently of edition, author and code dates", (t) => {
  const root = fixture(t);
  initialize(root);
  const original = commit(root, "2026-09-01T09:00:00+02:00");
  radar(root, "ai", [{ label: "New technology" }]);
  const content = commit(root, "2026-09-25T15:00:00+02:00");
  fs.writeFileSync(path.join(root, "index.html"), "New navigation");
  const head = commit(root, "2026-10-22T16:00:00+02:00");
  const result = writeUpdateStatus(root);
  assert.equal(result.revision, head);
  assert.equal(result.latestUpdate.sha, content);
  assert.equal(result.latestUpdate.date, "2026-09-25T15:00:00+02:00");
  assert.equal(result.units[0].lastUpdate.sha, original);
  assert.equal(result.units[0].path, "/");
  assert.equal(result.units[1].entryCount, 1);
  assert.equal(result.units[1].edition, "2025.01");
  assert.equal(result.latestUpdate.url, `https://github.com/fresh-minds/tech-radar/commit/${content}`);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, "update-status.json"))), result);
});

test("scaffolds and files without committed history never receive a guessed date", (t) => {
  const root = fixture(t);
  const unknown = buildUpdateStatus(root);
  assert.equal(unknown.revision, null);
  assert.equal(unknown.latestUpdate, null);
  assert.ok(unknown.units.every((unit) => unit.lastUpdate === null));
  initialize(root);
  assert.equal(buildUpdateStatus(root).latestUpdate, null);
  const sha = commit(root, "2026-09-25T15:00:00Z");
  assert.equal(buildUpdateStatus(root).latestUpdate.sha, sha);
  assert.equal(buildUpdateStatus(root).units[1].lastUpdate, null);
  const units = JSON.parse(fs.readFileSync(path.join(root, "units.json")));
  units.push({ id: "new-unit", label: "New unit", path: "/new-unit/" });
  fs.writeFileSync(path.join(root, "units.json"), JSON.stringify(units));
  fs.mkdirSync(path.join(root, "new-unit"));
  radar(root, "new-unit", [{ label: "Uncommitted" }]);
  assert.equal(buildUpdateStatus(root).units[2].lastUpdate, null);
});

test("reviewed content is dated when merged onto the deployed branch", (t) => {
  const root = fixture(t);
  initialize(root);
  const original = commit(root, "2026-09-01T09:00:00+02:00");
  git(root, ["switch", "-c", "proposal"]);
  radar(root, "ai", [{ label: "Proposed technology" }]);
  commit(root, "2026-09-23T15:00:00+02:00");
  git(root, ["switch", "main"]);
  git(root, ["merge", "--no-ff", "proposal", "-m", "Reviewed radar update"], {
    GIT_AUTHOR_DATE: "2026-09-25T10:00:00+02:00", GIT_COMMITTER_DATE: "2026-09-25T10:00:00+02:00",
  });
  const merged = git(root, ["rev-parse", "HEAD"]);
  fs.writeFileSync(path.join(root, "index.html"), "Code-only change after merge");
  commit(root, "2026-10-22T16:00:00+02:00");
  const result = buildUpdateStatus(root);
  assert.equal(result.units[0].lastUpdate.sha, original);
  assert.equal(result.units[1].lastUpdate.sha, merged);
  assert.equal(result.latestUpdate.sha, merged);
  assert.equal(result.latestUpdate.date, "2026-09-25T10:00:00+02:00");
});

test("shallow history fails until the build fetches complete history", (t) => {
  const root = fixture(t);
  initialize(root);
  const content = commit(root, "2026-09-25T15:00:00Z");
  fs.writeFileSync(path.join(root, "index.html"), "Code-only change");
  commit(root, "2026-10-22T16:00:00Z");
  const clone = path.join(root, "checkout");
  git(root, ["clone", "--depth=1", pathToFileURL(root).href, clone]);
  assert.throws(() => buildUpdateStatus(clone), /Complete Git history/);
  assert.equal(writeUpdateStatus(clone, { fetchHistory: true }).latestUpdate.sha, content);
});
