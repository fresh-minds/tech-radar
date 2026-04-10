# FreshMinds Tech Radar

A technology radar for tracking and communicating technology choices across FreshMinds.

Live at: https://earnest-cocada-04456b.netlify.app

## How it works

The radar visualizes technologies across four quadrants (Languages & Frameworks, Platforms, Tools, Techniques) and four rings:

- **Adopt** — our default choice for production
- **Trial** — worth pursuing in non-critical projects
- **Assess** — worth exploring, investigate and prototype
- **Hold** — proceed with caution, no new work

## Making changes

1. Create a branch and edit `radar-data.json`
2. Open a PR — validation runs automatically, Netlify generates a deploy preview
3. Get one approval from a reviewer
4. Merge — the radar auto-deploys to production

## Project structure

```
radar-data.json          # Radar entries (the source of truth)
index.html               # Radar visualization
scripts/validate.js      # Validates radar-data.json
.github/workflows/       # CI: validation on PRs, deploy on merge
```

## Local development

```bash
npm install
npm run dev              # Serves at http://localhost:8080
npm run validate         # Validates radar-data.json
```

## Entry format

Each entry in `radar-data.json` has the following fields:

| Field       | Required | Description                                          |
|-------------|----------|------------------------------------------------------|
| label       | yes      | Technology name                                      |
| quadrant    | yes      | One of: Languages & Frameworks, Platforms, Tools, Techniques |
| ring        | yes      | One of: Adopt, Trial, Assess, Hold                   |
| moved       | yes      | -1 (moved out/down), 0 (no change), 1 (moved in/up), 2 (new) |
| description | yes      | Short explanation of why it's in this ring            |
| link        | no       | URL to more information                              |

## Based on

[Zalando Tech Radar](https://github.com/zalando/tech-radar)
