#!/usr/bin/env node
'use strict';

// Verify the actual deployment and both API features without editing any data.
const assert = require('node:assert/strict');
const scan = require('./monthly-scan');

async function main() {
  const month = scan.previousMonth();
  const coverage = scan.monthCoverage(month);
  const client = {
    apiKey: process.env.FOUNDRY_AZURE_AI_KEY,
    endpoint: process.env.FOUNDRY_AZURE_AI_ENDPOINT,
  };
  const bodies = scan.requestBodies({}, month, coverage, process.env.RADAR_SCAN_MODEL || 'gpt-6-luna');
  const research = scan.collectResearch(await scan.callResponses({
    ...bodies.research,
    max_output_tokens: 4000,
    max_tool_calls: 2,
    instructions: 'Perform a web search and cite an official source. This is a connection check. Reply with one sentence.',
    input: 'Find the official Node.js release schedule on nodejs.org.',
  }, client));
  const proposal = JSON.parse(scan.responseText(await scan.callResponses({
    ...bodies.extraction(research),
    max_output_tokens: 4000,
    instructions: `This is a connection check, not a technology scan. Return the strict proposal schema. Use the supplied month, summary "Foundry connection verified", all ${scan.UNIT_IDS.length} units with summary "Connection check only", and empty changes and ownerQuestions arrays.`,
    input: JSON.stringify({ month, units: scan.UNIT_IDS }),
  }, client)));
  const plan = scan.validateProposal(proposal, research, scan.loadContext(process.cwd()).radars, month, coverage);
  assert.equal(plan.applied.length, 0, 'Connection check must not propose data changes');
  console.log(`Foundry connection verified: ${research.completedSearches} completed searches, ${research.sourceUrls.length} source URLs, and strict monthly proposal schema accepted. No radar data was edited.`);
}

main().catch(error => { console.error(`Foundry connection check failed: ${error.message}`); process.exitCode = 1; });
