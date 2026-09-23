#!/usr/bin/env node

// Validates radar-data.json files across all unit directories.
// Run with: npm run validate
//
// Usage:
//   node scripts/validate.js              — validates all unit radar files
//   node scripts/validate.js software     — validates software/radar-data.json only

const fs = require("fs");
const path = require("path");

const VALID_RINGS = ["Adopt", "Trial", "Assess", "Hold"];
const VALID_MOVED = [-1, 0, 1, 2];

const rootDir = path.join(__dirname, "..");

function validateFile(filePath) {
  const relative = path.relative(rootDir, filePath);
  const raw = fs.readFileSync(filePath, "utf-8");

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`ERROR: ${relative} is not valid JSON`);
    console.error(e.message);
    return false;
  }

  const errors = [];

  if (!data.title) errors.push("Missing 'title'");
  if (!data.date) errors.push("Missing 'date'");
  if (!Array.isArray(data.quadrants) || data.quadrants.length !== 4) {
    errors.push("'quadrants' must be an array of exactly 4 items");
  }
  if (!Array.isArray(data.entries)) {
    errors.push("'entries' must be an array");
  }

  // Allow empty entries for scaffold files
  if (data.entries && data.entries.length > 0) {
    const labels = new Set();

    data.entries.forEach((entry, i) => {
      const prefix = `Entry #${i + 1} ("${entry.label || "unnamed"}")`;

      if (!entry.label) {
        errors.push(`${prefix}: missing 'label'`);
      } else if (labels.has(entry.label)) {
        errors.push(`${prefix}: duplicate label "${entry.label}"`);
      } else {
        labels.add(entry.label);
      }

      if (!data.quadrants.includes(entry.quadrant)) {
        errors.push(
          `${prefix}: invalid quadrant "${entry.quadrant}". Must be one of: ${data.quadrants.join(", ")}`
        );
      }

      if (!VALID_RINGS.includes(entry.ring)) {
        errors.push(
          `${prefix}: invalid ring "${entry.ring}". Must be one of: ${VALID_RINGS.join(", ")}`
        );
      }

      if (!VALID_MOVED.includes(entry.moved)) {
        errors.push(
          `${prefix}: invalid moved value ${entry.moved}. Must be one of: ${VALID_MOVED.join(", ")} (-1=out, 0=same, 1=in, 2=new)`
        );
      }

      if (!entry.description) {
        errors.push(`${prefix}: missing 'description'`);
      }

      // Validate optional tags field
      if (entry.tags !== undefined) {
        if (!Array.isArray(entry.tags)) {
          errors.push(`${prefix}: 'tags' must be an array if present`);
        } else if (entry.tags.some((t) => typeof t !== "string")) {
          errors.push(`${prefix}: all tags must be strings`);
        }
      }
    });
  }

  if (errors.length > 0) {
    console.error(`\n${relative}: ${errors.length} error(s):\n`);
    errors.forEach((err) => console.error(`  - ${err}`));
    return false;
  }

  const entryCount = data.entries ? data.entries.length : 0;
  console.log(
    `  ${relative}: ${entryCount} entries${entryCount === 0 ? " (scaffold)" : ""}`
  );
  return true;
}

// Discover all radar-data.json files in subdirectories
function discoverRadarFiles(filterDir) {
  const dirs = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => !d.name.startsWith(".") && !d.name.startsWith("node_modules") && d.name !== "scripts" && d.name !== "docs")
    .map((d) => d.name);

  const files = [];
  for (const dir of dirs) {
    if (filterDir && dir !== filterDir) continue;
    const filePath = path.join(rootDir, dir, "radar-data.json");
    if (fs.existsSync(filePath)) {
      files.push(filePath);
    }
  }

  // Also check for root-level radar-data.json (backwards compatibility)
  const rootFile = path.join(rootDir, "radar-data.json");
  if (!filterDir && fs.existsSync(rootFile)) {
    files.unshift(rootFile);
  }

  return files;
}

const filterDir = process.argv[2] || null;
const files = discoverRadarFiles(filterDir);

if (files.length === 0) {
  console.error("No radar-data.json files found.");
  process.exit(1);
}

console.log(`Validating ${files.length} radar file(s):\n`);

let allPassed = true;
for (const file of files) {
  if (!validateFile(file)) {
    allPassed = false;
  }
}

console.log("");

if (!allPassed) {
  console.error("Validation failed.");
  process.exit(1);
}

console.log("All checks passed.");
