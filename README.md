# FreshMinds Tech Radar

Technology recommendations from FreshMinds, per unit and as a whole. Built on the [Zalando Tech Radar](https://github.com/zalando/tech-radar).

Live at: https://earnest-cocada-04456b.netlify.app

## Radars

| Unit | Entries | Path |
|------|---------|------|
| Global | 16 | `/` |
| Software Engineering | 49 | `/software/` |
| AI | 17 | `/ai/` |
| Cloud | 26 | `/cloud/` |
| Data | 21 | `/data/` |
| Security | scaffold | `/security/` |

The global radar cuts across all units. The unit radars go deeper into specific technology choices.

## Rings

- **Adopt** — proven in production, our default choice
- **Trial** — actively pursuing, suitable for non-critical projects
- **Assess** — worth exploring to understand potential
- **Hold** — proceed with caution, not recommended for new projects

## Making changes

1. Create a branch and edit the relevant `{unit}/radar-data.json`
2. Open a PR. Validation runs automatically, Netlify creates a deploy preview
3. Get one approval from a reviewer
4. Merge to main. The radar auto-deploys to production

## Project structure

```
units.json                   # Unit definitions (id, label, path, pitch)
software/radar-data.json     # Software Engineering radar
ai/radar-data.json           # AI radar
cloud/radar-data.json        # Cloud radar
data/radar-data.json         # Data radar
security/radar-data.json     # Security radar (scaffold)
global/radar-data.json       # Global radar
index.html                   # Visualization with client-side routing
scripts/validate.js          # Validates all radar-data.json files
scripts/dev-server.js        # Local dev server with SPA fallback
docs/                        # Design decisions and reference data
```

## Local development

```bash
npm install
npm run dev              # Starts at http://localhost:8080
npm run validate         # Validates all unit radars
npm run validate software  # Validates only the software radar
```

## Entry format

Each entry in a `radar-data.json` file:

| Field | Required | Description |
|-------|----------|-------------|
| label | yes | Technology name |
| quadrant | yes | Languages & Frameworks, Platforms, Tools, or Techniques |
| ring | yes | Adopt, Trial, Assess, or Hold |
| moved | yes | -1 (moved down), 0 (no change), 1 (moved up), 2 (new) |
| description | yes | Short rationale for the ring placement |
| tags | no | Array of strings for discipline filtering (e.g. `jvm`, `frontend`) |
| link | no | URL to more information |

## Adding a new unit

1. Create a directory with a `radar-data.json` file
2. Add the unit to `units.json`
