# CLAUDE.md

## Project overview

FreshMinds Tech Radar — a multi-unit static site that visualizes technology choices across the company. Based on the Zalando Tech Radar. Hosted on Netlify with auto-deploy from GitHub.

The site has a global landing page and per-unit radars: software, ai, cloud, data, security.

## Key files

- `units.json` — unit definitions (id, label, path, pitch). Adding a unit here is all you need.
- `{unit}/radar-data.json` — per-unit radar data (e.g. `software/radar-data.json`, `global/radar-data.json`)
- `index.html` — visualization with client-side routing using the Zalando tech-radar library (loaded via CDN)
- `scripts/validate.js` — validates all `*/radar-data.json` files
- `scripts/dev-server.js` — local dev server with SPA fallback
- `CONTRIBUTING.md` — contribution guide with entry format, ring/quadrant definitions, and workflow
- `.github/workflows/validate.yml` — runs validation on pull requests
- `.github/workflows/deploy-preview.yml` — surfaces Netlify deploy preview in PR
- `netlify.toml` — Netlify build config with SPA redirects for clean URLs

## Commands

- `npm run dev` — start local dev server at http://localhost:8080 (with SPA fallback)
- `npm run build` — validate all radar-data.json files (also used in CI)
- `npm run validate` — alias for build
- `npm run validate -- software` — validate a single unit

## Workflow

All changes go through PRs. PRs require 1 approval and passing `validate` check. Merging to main auto-deploys to Netlify. Netlify also generates deploy previews on PRs.

## Validation rules

- Valid quadrants: Languages & Frameworks, Platforms, Tools, Techniques
- Valid rings: Adopt, Trial, Assess, Hold
- Valid moved values: -1 (moved out/down), 0 (no change), 1 (moved in/up), 2 (new)
- No duplicate labels within a unit
- All entries need: label, quadrant, ring, moved, description
- Optional field: tags (array of strings, for discipline filtering)
- Scaffold files (empty entries array) are allowed for units not yet populated

## Directory structure

```
software/radar-data.json     # Software Engineering unit (49 entries)
ai/radar-data.json           # AI unit
cloud/radar-data.json        # Cloud unit
data/radar-data.json         # Data unit
security/radar-data.json     # Security unit (scaffold)
global/radar-data.json       # Global cross-cutting radar
```

## Adding a new unit

1. Create a directory with a `radar-data.json` file
2. Add the unit to `units.json`

No changes to `index.html` or `netlify.toml` needed.

## Important

- Each unit's `radar-data.json` is the source of truth for that unit's radar
- The `date` field in radar-data.json uses format `YYYY.MM`
- Do not add `radar-data.js` — the site uses `fetch()` to load JSON directly
- The repo is public. Branch protection requires PRs with approval for main.
- UI copy is in Dutch, tech terminology in English
