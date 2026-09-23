# Contributing to the FreshMinds Tech Radar

## How to add or update an entry

Radar data lives in per-unit files: `software/radar-data.json`, `ai/radar-data.json`, `cloud/radar-data.json`, `data/radar-data.json`, `security/radar-data.json`, and `global/radar-data.json`.

Edit the file for the unit you want to change.

### Entry format

```json
{
  "label": "Technology Name",
  "quadrant": "Languages & Frameworks",
  "ring": "Trial",
  "moved": 1,
  "description": "Why this is in this ring. 1-2 sentences.",
  "tags": ["jvm"],
  "link": "https://optional-link.com"
}
```

### Fields

| Field       | Required | Values                                                                 |
|-------------|----------|------------------------------------------------------------------------|
| label       | Yes      | Name of the technology                                                 |
| quadrant    | Yes      | `Languages & Frameworks`, `Platforms`, `Tools`, `Techniques`           |
| ring        | Yes      | `Adopt`, `Trial`, `Assess`, `Hold`                                     |
| moved       | Yes      | `0` = no change, `1` = moved in/up, `-1` = moved out/down, `2` = new  |
| description | Yes      | Brief rationale for the ring placement                                 |
| tags        | No       | Array of strings for discipline filtering (e.g. `jvm`, `frontend`)     |
| link        | No       | URL to more information                                                |

### Ring definitions

| Ring    | Meaning                                                                         |
|---------|---------------------------------------------------------------------------------|
| Adopt   | Proven in production at scale. Recommended as the default choice.               |
| Trial   | Worth pursuing actively. Use in non-critical projects to build experience.       |
| Assess  | Worth exploring to understand potential benefits. Not yet ready for project use. |
| Hold    | Proceed with caution. Not recommended for new projects.                         |

### Quadrant definitions

| Quadrant                | Examples                                                      |
|-------------------------|---------------------------------------------------------------|
| Languages & Frameworks  | Kotlin, React, Spring Boot, Next.js                           |
| Platforms               | AWS, Kubernetes, PostgreSQL, Kafka                            |
| Tools                   | Docker, Terraform, Grafana, SonarQube                         |
| Techniques              | Trunk-based development, API-first design, event sourcing     |

## Workflow

1. Edit the relevant `{unit}/radar-data.json` file
2. Run `npm run build` to validate your changes
3. Run `npm run dev` to preview locally at http://localhost:8080
4. Submit a pull request with your changes
5. The Tech Radar guild reviews and approves

## Publishing a new edition

When publishing a new edition of a unit's radar:

1. Update the `date` field in that unit's `radar-data.json` (format: `YYYY.MM`)
2. Review all entries — reset `moved` to `0` for entries that haven't changed
3. Set `moved` to `1` or `-1` for entries that changed rings
4. Set `moved` to `2` for brand new entries
5. Remove entries that are no longer relevant

## Adding a new unit

1. Create a directory with a `radar-data.json` file (see existing units for format)
2. Add the unit to `units.json` (id, label, path, pitch)
