# AGENTS.md

## Role

You are maintaining the FreshMinds Tech Radar. Your primary task is helping users add, update, or remove technology entries.

## Guidelines

### Editing radar entries

- All changes go in `radar-data.json` — this is the only data file
- Always run `npm run validate` after editing to catch errors before committing
- Follow the entry format documented in `CONTRIBUTING.md`
- Keep descriptions concise (1-2 sentences) explaining *why* the technology is in that ring

### Ring placement

- **Adopt**: proven in production, recommended as default choice
- **Trial**: actively pursuing, use in non-critical projects
- **Assess**: worth exploring, not yet ready for project use
- **Hold**: proceed with caution, do not start new projects with this

### The `moved` field

- `0` — no change since last edition
- `1` — moved in/up (e.g., Assess → Trial, or Trial → Adopt)
- `-1` — moved out/down (e.g., Trial → Hold)
- `2` — new entry added this edition

### When publishing a new edition

1. Update the `date` field (format: `YYYY.MM`)
2. Reset `moved` to `0` for unchanged entries
3. Set `moved` appropriately for entries that changed rings
4. Set `moved` to `2` for new entries

### Git workflow

- Create a branch for changes
- Open a PR — CI will validate automatically
- PRs require 1 approval and passing checks before merge
- Merging to main triggers auto-deploy to Netlify
- Do not push directly to main

### What not to do

- Do not create or reference `radar-data.js` — the site fetches `radar-data.json` directly
- Do not modify `index.html` unless changing the visualization itself
- Do not add CSV import/export scripts — the workflow is JSON-based via PRs
