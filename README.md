# FreshMinds Tech Radar

Technology recommendations from FreshMinds, per unit and as a whole. Built on the [Zalando Tech Radar](https://github.com/zalando/tech-radar).

Live at: https://earnest-cocada-04456b.netlify.app

## Radars

| Unit | Entries | Path |
|------|---------|------|
| Global | 22 | `/` |
| Software Engineering | 54 | `/software/` |
| AI | 25 | `/ai/` |
| Cloud | 32 | `/cloud/` |
| Data | 26 | `/data/` |
| Security | 24 | `/security/` |
| SAP | scaffold | `/sap/` |

The global radar cuts across all units. The unit radars go deeper into specific technology choices.

## Rings

Ring placement reflects what FreshMinds recommends for **new** projects and technical decisions, not simply how often a technology appears in existing client landscapes:

- **Adopt** (*Standaardkeuze*) — proven in production at scale; our default recommendation for new projects in this domain
- **Trial** (*Gericht inzetten*) — production-ready for specific contexts or use cases, or technology where we are actively broadening unit-wide experience
- **Assess** (*Actief verkennen*) — promising technology or client trend we are actively exploring and validating before recommending broadly
- **Hold** (*Niet voor nieuw werk*) — not recommended as a starting point for new (greenfield) work; existing client landscapes (e.g. Java, Angular) remain actively supported

## Making changes

1. Create a branch and edit the relevant `{unit}/radar-data.json`
2. Open a PR. Validation runs automatically, Netlify creates a deploy preview
3. Get one approval from a reviewer
4. Merge to main. The radar auto-deploys to production

## Update history

The [Updates page](https://earnest-cocada-04456b.netlify.app/updates/) shows the latest radar-data change overall and per
unit, the current editions, and links to each change. Dates are generated from
Git history during `npm run build`; website-only changes do not advance them.
## Monthly research

The [monthly scan workflow](.github/workflows/monthly-scan.yml) researches relevant
technology developments on GitHub-hosted runners and opens evidence-backed
proposal PRs for owner review. It runs on the 1st at 09:00 Amsterdam time, and can
also be triggered manually. See [setup, review, and troubleshooting](docs/monthly-scans.md)
for the required API secret and repository settings. Monthly proposals do not
change the semi-annual publication policy.

## Project structure

```
units.json                   # Unit definitions (id, label, path, pitch)
software/radar-data.json     # Software Engineering radar
ai/radar-data.json           # AI radar
cloud/radar-data.json        # Cloud radar
data/radar-data.json         # Data radar
security/radar-data.json     # Security radar (scaffold)
sap/radar-data.json          # SAP radar (scaffold)
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
| description | yes | Short explanation in Dutch of what the technology is |
| standpoint | yes | FreshMinds' standpoint in Dutch (why it is in this ring and how we apply it) |
| units | yes | Non-empty array of applicable business unit IDs (`software`, `ai`, `cloud`, `data`, `security`, `sap`) |
| tags | no | Array of strings for discipline filtering (e.g. `jvm`, `frontend`) |
| link | no | URL to more information |

## Adding a new unit

1. Create a directory with a `radar-data.json` file
2. Add the unit to `units.json`
3. Add the unit ID to the allowlists in `scripts/monthly-scan.js` and `scripts/monthly-scan-publish.js`
