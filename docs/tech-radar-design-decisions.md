# Tech Radar: design decisions

## Scope

The FreshMinds Tech Radar has two tiers: unit radars and a global radar. Each business unit (Software Engineering, AI, Cloud, Data, Security) has its own radar with concrete technology recommendations. The global radar is a curated selection of cross-cutting entries, aimed at clients and recruitment.

## Ownership

Each unit radar has an owner who makes final ring-placement decisions. The global radar is jointly managed by the principals of all units. Harm has veto power if the outcome conflicts with the tech vision.

## Decision-making

Lazy consensus: publish a draft, allow two weeks for reactions. Silence means agreement. Objections get discussed, but the owner decides.

## Update cadence

Semi-annual. Pull requests are welcome anytime, but changes are batched and released on the semi-annual schedule.

## Rings

- **Adopt**: proven in production, our default choice for this domain
- **Trial**: actively pursuing, suitable for non-critical projects
- **Assess**: worth exploring and understanding
- **Hold**: proceed with caution, not recommended for new projects

## Content principles

- Entries are specific: "Grafana", not "Observability". "Spring Boot", not "Frameworks".
- Rings reflect what FreshMinds recommends, not how many consultants happen to use something. One consultant's strong experience can justify a Trial placement.
- Descriptions are honest about how broad or narrow the experience is.
- Aspirational entries (technologies nobody at FreshMinds uses yet) can appear on the radar, typically in Assess.

## Discipline filtering

The software unit has multiple disciplines (Java, .NET, Python). Instead of separate radars per discipline, entries carry optional tags (`jvm`, `dotnet`, `python`, `frontend`, `cross-cutting`) for filtering.

## Global radar

- Selected based on alignment with the tech vision, with a sanity check on client relevance
- Mixed abstraction: named technologies where the name carries weight (Kubernetes, Python), categories where the specific tool varies by unit (Observability, CI/CD)
- Roughly 15-20 entries

## Cross-unit entries

The same technology can appear on multiple unit radars with different rings. That is fine: different units have different contexts. The global radar is where the unified position gets expressed.

## Input sources

Four sources feed the radar: skill matrices from all disciplines, tech radars from clients, 1-on-1 conversations with consultants, and workshops with the broader group.

## Workshop format

Two rounds. Round 1: everyone reviews the radar individually and marks disagreements or gaps. Round 2: group discussion on the items with the most disagreement.

## Publication

Semi-annual. The Netlify URL is technically accessible but only promoted externally after a full feedback cycle.

## Look and feel

- Polished styling with FreshMinds logo, consistent typography, styled unit cards
- UI copy in Dutch, tech terminology in English
- Ring legend on every page
- Landing page: global radar at top, unit cards below with auto-generated highlights
- Each unit page: pitch paragraph, ring legend, radar visualization
