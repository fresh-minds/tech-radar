#!/usr/bin/env node

/**
 * Exports radar-data.json to CSV for editing in a spreadsheet.
 *
 * Usage:
 *   node scripts/export-csv.js                    # prints to stdout
 *   node scripts/export-csv.js > radar-entries.csv # writes to file
 */

const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "..", "radar-data.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

function escapeCsv(value) {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const header = "label,quadrant,ring,moved,description,link";
console.log(header);

data.entries.forEach((entry) => {
  const row = [
    entry.label,
    entry.quadrant,
    entry.ring,
    entry.moved,
    entry.description || "",
    entry.link || "",
  ]
    .map(escapeCsv)
    .join(",");
  console.log(row);
});
