# Contributing to the FreshMinds Tech Radar

## How to add or update an entry

All radar data lives in a single file: **`radar-data.json`**

### Entry format

```json
{
  "label": "Technology Name",
  "quadrant": "Languages & Frameworks",
  "ring": "Trial",
  "moved": 1,
  "description": "Why this is in this ring. 1-2 sentences.",
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
| Platforms               | AWS, Kubernetes, PostgreSQL, Supabase                         |
| Tools                   | Docker, Terraform, Sentry, Datadog                            |
| Techniques              | Trunk-based development, API-first design, event sourcing     |

## Workflow

1. Edit `radar-data.json` — add, update, or remove entries
2. Run `npm run build` to validate your changes
3. Run `npm run dev` to preview locally
4. Submit a pull request with your changes
5. The Tech Radar guild reviews and approves

## Publishing a new edition

When publishing a new edition of the radar:

1. Update the `date` field in `radar-data.json` (format: `YYYY.MM`)
2. Review all entries — reset `moved` to `0` for entries that haven't changed
3. Set `moved` to `1` or `-1` for entries that changed rings
4. Set `moved` to `2` for brand new entries
5. Remove entries that are no longer relevant
