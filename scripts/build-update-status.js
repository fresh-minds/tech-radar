#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const REPOSITORY = "fresh-minds/tech-radar";
const git = (root, ...args) => execFileSync("git", args, {
  cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
}).trim();

function hasGit(root) {
  try {
    return fs.realpathSync(git(root, "rev-parse", "--show-toplevel")) === fs.realpathSync(root);
  } catch {
    return false;
  }
}

function buildUpdateStatus(root) {
  const versioned = hasGit(root);
  if (versioned && git(root, "rev-parse", "--is-shallow-repository") === "true") {
    throw new Error("Complete Git history is required for accurate radar dates. Run with --fetch-history or fetch --unshallow first.");
  }
  let revision = null;
  if (versioned) {
    try { revision = git(root, "rev-parse", "--verify", "HEAD"); } catch { /* No commits yet. */ }
  }
  const units = JSON.parse(fs.readFileSync(path.join(root, "units.json"), "utf8")).map((unit) => {
    if (!/^[a-z0-9-]+$/.test(unit.id)) throw new Error(`Invalid unit id: ${unit.id}`);
    const file = `${unit.id}/radar-data.json`;
    const data = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
    const entryCount = data.entries.length;
    let lastUpdate = null;
    // Empty scaffold radars have not published content yet.
    if (revision && entryCount > 0) {
      // Follow the deployed branch so a reviewed merge is dated when it landed.
      const commit = git(root, "log", "--first-parent", "-1", "--format=%H%n%cI", "HEAD", "--", file);
      if (commit) {
        const [sha, date] = commit.split("\n");
        lastUpdate = { date, sha, url: `https://github.com/${REPOSITORY}/commit/${sha}` };
      }
    }
    return { id: unit.id, label: unit.label, path: unit.path, edition: data.date, entryCount, lastUpdate };
  });
  const latestUpdate = units.map((unit) => unit.lastUpdate).filter(Boolean)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0] || null;
  return { repository: REPOSITORY, revision, latestUpdate, units };
}

function writeUpdateStatus(root, { fetchHistory = false } = {}) {
  if (fetchHistory && hasGit(root) && git(root, "rev-parse", "--is-shallow-repository") === "true") {
    try { git(root, "fetch", "--unshallow", "origin"); } catch {
      throw new Error("Could not fetch complete Git history. Radar dates were not generated; enable full history in the build checkout.");
    }
  }
  const status = buildUpdateStatus(root);
  fs.writeFileSync(path.join(root, "update-status.json"), `${JSON.stringify(status, null, 2)}\n`);
  return status;
}

if (require.main === module) {
  try {
    writeUpdateStatus(path.join(__dirname, ".."), { fetchHistory: process.argv.includes("--fetch-history") });
    console.log("Generated update-status.json from radar Git history.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { buildUpdateStatus, writeUpdateStatus };
