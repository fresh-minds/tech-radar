#!/usr/bin/env node

/**
 * Converts a CSV file into radar-data.json.
 *
 * Usage:
 *   node scripts/import-csv.js radar-entries.csv
 *
 * CSV format (first row is the header):
 *   label,quadrant,ring,moved,description,link
 *
 * Example:
 *   label,quadrant,ring,moved,description,link
 *   Kotlin,Languages & Frameworks,Adopt,0,Our primary backend language.,
 *   Next.js,Languages & Frameworks,Trial,1,Evaluating for web apps.,https://nextjs.org
 */

const fs = require("fs");
const path = require("path");

const VALID_QUADRANTS = [
  "Languages & Frameworks",
  "Platforms",
  "Tools",
  "Techniques",
];
const VALID_RINGS = ["Adopt", "Trial", "Assess", "Hold"];
const VALID_MOVED = [-1, 0, 1, 2];

// ── Read CSV path from args ──
const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/import-csv.js <path-to-csv>");
  console.error("Example: node scripts/import-csv.js radar-entries.csv");
  process.exit(1);
}

const absoluteCsvPath = path.resolve(csvPath);
if (!fs.existsSync(absoluteCsvPath)) {
  console.error(`File not found: ${absoluteCsvPath}`);
  process.exit(1);
}

// ── Parse CSV ──
function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

const raw = fs.readFileSync(absoluteCsvPath, "utf-8");
const lines = raw
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

if (lines.length < 2) {
  console.error("CSV must have a header row and at least one entry.");
  process.exit(1);
}

const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
const requiredColumns = ["label", "quadrant", "ring"];
for (const col of requiredColumns) {
  if (!header.includes(col)) {
    console.error(`Missing required column: "${col}"`);
    console.error(`Found columns: ${header.join(", ")}`);
    process.exit(1);
  }
}

const entries = [];
const errors = [];

for (let i = 1; i < lines.length; i++) {
  const fields = parseCsvLine(lines[i]);
  const row = {};
  header.forEach((col, idx) => {
    row[col] = fields[idx] || "";
  });

  const lineNum = i + 1;
  const label = row.label;

  if (!label) {
    errors.push(`Line ${lineNum}: empty label, skipping`);
    continue;
  }

  if (!VALID_QUADRANTS.includes(row.quadrant)) {
    errors.push(
      `Line ${lineNum} ("${label}"): invalid quadrant "${row.quadrant}". Must be one of: ${VALID_QUADRANTS.join(", ")}`
    );
    continue;
  }

  if (!VALID_RINGS.includes(row.ring)) {
    errors.push(
      `Line ${lineNum} ("${label}"): invalid ring "${row.ring}". Must be one of: ${VALID_RINGS.join(", ")}`
    );
    continue;
  }

  const moved = row.moved !== undefined && row.moved !== "" ? parseInt(row.moved, 10) : 0;
  if (!VALID_MOVED.includes(moved)) {
    errors.push(
      `Line ${lineNum} ("${label}"): invalid moved "${row.moved}". Must be one of: ${VALID_MOVED.join(", ")}`
    );
    continue;
  }

  const entry = {
    label,
    quadrant: row.quadrant,
    ring: row.ring,
    moved,
    description: row.description || "",
  };

  if (row.link) {
    entry.link = row.link;
  }

  entries.push(entry);
}

if (errors.length > 0) {
  console.error(`\nWarnings/errors:\n`);
  errors.forEach((e) => console.error(`  - ${e}`));
  console.error("");
}

if (entries.length === 0) {
  console.error("No valid entries found. Aborting.");
  process.exit(1);
}

// ── Load existing radar-data.json for metadata, or create fresh ──
const outputPath = path.join(__dirname, "..", "radar-data.json");
let metadata = {
  title: "FreshMinds Tech Radar",
  date: new Date().toISOString().slice(0, 7).replace("-", "."),
  quadrants: VALID_QUADRANTS,
};

if (fs.existsSync(outputPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
    metadata.title = existing.title || metadata.title;
    metadata.date = existing.date || metadata.date;
    metadata.quadrants = existing.quadrants || metadata.quadrants;
  } catch (e) {
    // ignore, use defaults
  }
}

const output = {
  title: metadata.title,
  date: metadata.date,
  quadrants: metadata.quadrants,
  entries,
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Imported ${entries.length} entries from ${path.basename(csvPath)}`);
console.log(`Written to ${outputPath}`);
console.log(`Written to ${jsOutputPath}`);
if (errors.length > 0) {
  console.log(`${errors.length} row(s) skipped due to errors (see above)`);
}
