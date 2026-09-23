# Multi-unit tech radar: design decisions

This document extends the original software engineering tech radar design decisions with the multi-unit architecture. These decisions came out of a structured design session on 2026-09-23.

## Hierarchy

Two tiers: unit radars and one global radar. No discipline sub-radars.

Units at launch: Software (populated), AI, Cloud, Data (seeded from client/industry data). Security and SAP scaffolded with empty data files.

Disciplines within a unit (e.g., Java, .NET, Python within Software) are handled through optional tags on entries, not separate radars.

## Filtering within a unit

Optional `tags` array per entry for discipline filtering. The software unit uses ecosystem tags: `jvm`, `dotnet`, `python`, `frontend`, `cross-cutting`. Other units add tags when needed. The field is not required in the schema.

## Quadrants

Same four everywhere: Languages & Frameworks, Platforms, Tools, Techniques. Consistency across units simplifies global curation and makes the visualization reusable.

## Global radar

Curated from entries that align with the tech vision, sanity-checked by client relevance. Mixed abstraction: named technologies where the name carries weight (Kubernetes, Python), categories where the specific tool varies by unit (Observability, CI/CD). Drafted alongside the other unit radars once AI/Cloud/Data strawmen exist. Target size: roughly 15 to 20 entries.

### Global radar governance

Committee of principals owns the global radar collectively. Lazy consensus: publish a draft, 2-week window, silence means agreement. Harm has veto if the outcome contradicts the tech vision.

## Monorepo structure

```
/
├── software/
│   └── radar-data.json
├── ai/
│   └── radar-data.json
├── cloud/
│   └── radar-data.json
├── data/
│   └── radar-data.json
├── security/
│   └── radar-data.json       (empty scaffold)
├── sap/
│   └── radar-data.json       (empty scaffold)
├── global/
│   └── radar-data.json
├── scripts/
│   └── validate.js
├── index.html
├── netlify.toml
└── .github/workflows/
```

Each unit owns their directory. Shared visualization, shared validation pipeline, shared CI.

## URL structure

Path-based clean URLs with single visualization codebase and client-side routing.

- `/` shows the global radar (landing page)
- `/software/` shows the software unit radar
- `/ai/` shows the AI unit radar
- `/cloud/` shows the cloud unit radar
- `/data/` shows the data unit radar
- `/security/` and `/sap/` become available when those units populate their data

## Landing page

Global radar visualization at the top. Below it, a row of cards for each unit showing: name, entry count, and 3-4 auto-generated highlights (Adopt entries with `moved: 2` or `moved: 1`). All units shown from launch. Units that don't validate in time can be taken down later.

## Cross-unit entries

The same technology can appear on multiple unit radars with different rings. Different units have different contexts and maturity levels. An automated check flags entries that appear on multiple radars at different rings for principal discussion, but alignment is not forced. The global radar is where the unified position gets expressed.

## Seeding other units

All strawman drafts are seeded from Ahold, bol.com, Thoughtworks, and Devoteam data. Clearly labelled as drafts needing unit owner validation. Unit owners have until the software v1 publish date to react. One launch, one announcement.

## Validation

One validator script, runs per directory. Validates each unit's radar-data.json independently. Supports the optional tags array. No cross-unit consistency checks for now.

## Look, feel, and copy

### Visual identity

Polished styling with FreshMinds logo in the header, consistent typography, and styled unit cards. Should look like a deliberate FreshMinds product page, not a developer side project.

### Language

Dutch for all copy (intro text, ring explanations, unit descriptions, entry descriptions). Common tech terminology stays in English (Kubernetes, Spring Boot, Trunk-Based Development).

### Ring legend (on every page)

- Adopt: bewezen in productie, onze standaardkeuze voor dit domein
- Trial: actief mee aan de slag, geschikt voor niet-kritieke projecten
- Assess: de moeite waard om te verkennen en te begrijpen
- Hold: wees voorzichtig, niet aanbevolen voor nieuwe projecten

### Landing page copy

Dual-purpose intro paragraph targeting both clients and recruits. Subtle contextual links for each audience (technology partner inquiry / careers page). All copy run through humanizer before publishing.

### Unit page template

Standard template per unit page:

1. Unit-specific pitch: one sentence on what the unit does and what makes their tech perspective distinctive
2. How to read the radar: one sentence
3. Living document note: updated semi-annually
4. The radar visualization
5. Ring legend
