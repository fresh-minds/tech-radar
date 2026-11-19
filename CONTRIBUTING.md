# Contributing to the FreshMinds Tech Radar

## How to add or update an entry

Radar data lives in per-unit files: `software/radar-data.json`, `ai/radar-data.json`, `cloud/radar-data.json`, `data/radar-data.json`, `security/radar-data.json`, `sap/radar-data.json`, and `global/radar-data.json`.

Edit the file for the unit you want to change.

### Entry format

```json
{
  "label": "Technology Name",
  "quadrant": "Languages & Frameworks",
  "ring": "Trial",
  "moved": 1,
  "description": "Korte uitleg wat deze technologie, tool of techniek is (1-2 zinnen in het Nederlands).",
  "standpoint": "Het FreshMinds-standpunt: waarom dit in deze ring staat en hoe we dit bij klanten toepassen (1-2 zinnen in het Nederlands).",
  "units": ["software", "cloud"],
  "tags": ["jvm"],
  "link": "https://optional-link.com"
}
```

### Fields

| Field       | Required | Values                                                                                              |
|-------------|----------|-----------------------------------------------------------------------------------------------------|
| label       | Yes      | Name of the technology                                                                              |
| quadrant    | Yes      | `Languages & Frameworks`, `Platforms`, `Tools`, `Techniques`                                        |
| ring        | Yes      | `Adopt`, `Trial`, `Assess`, `Hold`                                                                  |
| moved       | Yes      | `0` = no change, `1` = moved in/up, `-1` = moved out/down, `2` = new                               |
| description | Yes      | Brief explanation in Dutch of *what* the technology is                                              |
| standpoint  | Yes      | FreshMinds' standpoint in Dutch: rationale for the ring placement and recommendation                |
| units       | Yes      | Non-empty array of applicable business unit IDs (`software`, `ai`, `cloud`, `data`, `security`, `sap`) |
| tags        | No       | Array of strings for discipline filtering (e.g. `jvm`, `frontend`)                                  |
| link        | No       | URL to more information                                                                             |

### Ring definitions

Ring placement reflects what FreshMinds recommends for **new** choices and projects—not simply how many existing client codebases use a technology.

| Ring    | Role                   | Meaning                                                                                                                                                              |
|---------|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Adopt   | Default choice         | Proven in production at scale at clients and backed by strong unit expertise. Recommended as our default starting point for new projects in this domain.             |
| Trial   | Apply selectively      | Production-ready, but a deliberate choice per context (or a technology where we are actively broadening hands-on experience across the unit) rather than a default.  |
| Assess  | Explore actively       | Promising technology or emerging client trend worth exploring via R&D, spikes, and proofs-of-concept before making a broad consulting recommendation.                |
| Hold    | Not for new work       | Do not choose as the starting point for new (greenfield) work; prefer a modern alternative on the radar. Existing client systems (e.g. Java, Angular) remain supported. |

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
3. Add the unit ID to the allowlists in `scripts/monthly-scan.js` and `scripts/monthly-scan-publish.js`
