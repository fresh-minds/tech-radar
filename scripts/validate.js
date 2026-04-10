#!/usr/bin/env node

/**
 * Validates radar-data.json for correctness.
 * Run with: npm run build
 */

const fs = require("fs");
const path = require("path");

const VALID_RINGS = ["Adopt", "Trial", "Assess", "Hold"];
const VALID_MOVED = [-1, 0, 1, 2];

const dataPath = path.join(__dirname, "..", "radar-data.json");
const raw = fs.readFileSync(dataPath, "utf-8");

let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error("ERROR: radar-data.json is not valid JSON");
  console.error(e.message);
  process.exit(1);
}

const errors = [];

if (!data.title) errors.push("Missing 'title'");
if (!data.date) errors.push("Missing 'date'");
if (!Array.isArray(data.quadrants) || data.quadrants.length !== 4) {
  errors.push("'quadrants' must be an array of exactly 4 items");
}
if (!Array.isArray(data.entries) || data.entries.length === 0) {
  errors.push("'entries' must be a non-empty array");
}

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
});

if (errors.length > 0) {
  console.error(`\nValidation failed with ${errors.length} error(s):\n`);
  errors.forEach((err) => console.error(`  - ${err}`));
  console.error("");
  process.exit(1);
}

console.log(`Validated ${data.entries.length} entries across ${data.quadrants.length} quadrants.`);
console.log("All checks passed.");
