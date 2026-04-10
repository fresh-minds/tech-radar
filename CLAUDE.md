# CLAUDE.md

## Project overview

FreshMinds Tech Radar — a static site that visualizes technology choices across the company. Based on the Zalando Tech Radar. Hosted on Netlify with auto-deploy from GitHub.

## Key files

- `radar-data.json` — the single source of truth for all radar entries
- `index.html` — visualization using the Zalando tech-radar library (loaded via CDN)
- `scripts/validate.js` — validates radar-data.json structure and values
- `CONTRIBUTING.md` — contribution guide with entry format, ring/quadrant definitions, and workflow
- `.github/workflows/deploy.yml` — auto-deploys to Netlify on push to main
- `.github/workflows/validate.yml` — runs validation on pull requests
- `netlify.toml` — Netlify build config (no build step, static files only)

## Commands

- `npm run dev` — start local server at http://localhost:8080
- `npm run build` — validate radar-data.json (also used in CI)
- `npm run validate` — alias for build

## Workflow

All changes go through PRs. PRs require 1 approval and passing `validate` check. Merging to main auto-deploys to Netlify. Netlify also generates deploy previews on PRs.

## Validation rules

- Valid quadrants: Languages & Frameworks, Platforms, Tools, Techniques
- Valid rings: Adopt, Trial, Assess, Hold
- Valid moved values: -1 (moved out/down), 0 (no change), 1 (moved in/up), 2 (new)
- No duplicate labels
- All entries need: label, quadrant, ring, moved, description

## Important

- `radar-data.json` is the only file that needs editing for radar updates
- The `date` field in radar-data.json uses format `YYYY.MM`
- Do not add `radar-data.js` — the site uses `fetch()` to load `radar-data.json` directly
- The repo is public. Branch protection requires PRs with approval for main.
