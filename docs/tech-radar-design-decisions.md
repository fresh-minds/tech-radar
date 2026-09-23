# Software engineering tech radar: design decisions

This document records the decisions behind the FreshMinds software engineering tech radar: what it is, how it gets built, who owns it, and how it evolves. These decisions came out of a structured design session on 2026-09-17 following the tech vision and tech radar meeting with Harm Vestjens, Roy de Bokx, and Jeroen Rosenberg.

## What we're building

A tech radar for the FreshMinds software engineering unit. It lives in a git repo, renders as a static site on Netlify, and expresses opinionated technology recommendations at the tool and framework level.

This is one unit's radar, scoped and titled accordingly: "FreshMinds Software Engineering Tech Radar." Other units (AI, Cloud, Data, Security, SAP) build their own when they're ready. A global, client-facing radar gets manually curated by principals once at least two or three unit radars exist.

## Audience

The software engineering radar serves three audiences: internal consultants who need direction, potential hires who want to know what FreshMinds invests in, and clients who want to assess technical alignment. The global radar, when it arrives, focuses primarily on clients.

## Content principles

### Granularity

Entries are specific. "DataDog," not "Observability." "Spring Boot," not "Frameworks." The target is roughly 40 to 50 entries. Each one takes a position.

### Aspirational entries

Technologies nobody at FreshMinds uses yet can appear on the radar, typically in Assess, with descriptions that say so honestly. Including technologies nobody uses yet keeps the radar forward-looking rather than just an inventory of the status quo.

### Ring placement

Rings reflect what FreshMinds recommends, not how many consultants happen to use something. One consultant's strong production experience can justify Trial. The description should be transparent about how broad or narrow the actual experience is. Example: "Used in production by one team at a major client. Assessing broader applicability."

### AI entries

The AI unit owns a separate AI radar. Software-relevant AI entries (coding agents, MCP, and similar) can also appear on the software engineering radar. The rule of thumb: if a software engineer uses it as a tool in their workflow, it belongs here. If the AI unit builds or deploys it, it belongs on the AI radar. Entries can live on both.

### No action items in v1

The radar says what we recommend. Investment plans (certifications, bootcamps, partnerships, event attendance) follow once entries are validated by the broader group.

## Governance

### Ownership

Jeroen Rosenberg owns the software engineering radar and makes final ring-placement decisions.

### Lazy consensus

Publish a draft, set a deadline. Silence means agreement. Objections get discussed, but the owner makes the final call.

### Update cadence

Semi-annual. Pull requests are welcome anytime from anyone, but changes are batched and released on the semi-annual schedule.

### No survey

Workshops and 1-on-1 conversations generate better input than forms. The Microsoft Forms survey (built in both EN and NL) has been shelved. If input quality drops in future cycles, this decision can be revisited.

## Building v1

### Inputs

Four sources feed into v1:

1. Skill matrices from all disciplines in the software unit (Java, .NET, Python, and others). The Java matrix alone has 35 respondents with detailed proficiency data across 15+ categories.
2. Client tech radars from Ahold, bol.com, and others. Used for validation, gap analysis, and market signal. FreshMinds' own opinion takes precedence over client choices.
3. 1-on-1 conversations with 5 to 10 consultants, selected for diversity of context (enterprise, scale-up, greenfield, legacy) and coverage of major clients. At least one frontend-savvy consultant to validate calls like Angular on Hold.
4. A workshop with the broader group, scheduled after the 1-on-1s have shaped a stronger draft.

### Process

Step 1. Collect client radars and analyze all skill matrices. Revise the 26-entry draft based on what the data shows.

Step 2. Run 1-on-1s with selected consultants. Revise again.

Step 3. Hold a workshop (see format below). The workshop opens a 2-week objection window.

Step 4. After 2 weeks, the owner processes all feedback, makes final decisions, and publishes v1.

### Timeline

5 to 6 weeks from start to published v1.

### Risks

Client radars are the critical path. Everything downstream waits on them. If they don't arrive in week 1, the whole timeline slips. Put a hard date on delivery.

The Angular/Hold call needs validation before publishing. Hold is a strong signal ("stop using this for new projects"), and the current owner is not a frontend specialist. Finding and talking to a frontend-savvy consultant is the first 1-on-1, not the last.

Expanding from 26 to 40-50 entries. Every new entry is an opinion to defend. Add entries where there is a genuine view, not just because the skill matrix shows people use something.

## Workshop format

Two rounds.

Round 1 (individual, ~10 minutes). Everyone reviews the full radar silently. Mark entries you disagree with, entries that are missing, and entries that surprise you. Sticky notes, a shared form, or whatever fits the room.

Round 2 (group). Collect the individual input. Identify the entries with the most disagreement. Discuss those as a group. Skip entries everyone agrees on.

## Publication

Semi-public for v1. The Netlify URL is technically accessible, but it won't be linked from the FreshMinds website or promoted to clients until after one full feedback cycle. Promote externally once the radar has been validated internally.

## Starting positions for v1

These reflect the owner's current view. They may change based on input from skill matrices, client radars, 1-on-1s, and the workshop.

Kotlin on Adopt. This is a directional choice. The skill matrix shows roughly 30% of Java-discipline consultants are proficient in Kotlin today, but the recommendation is that new projects should default to it.

Angular on Hold. Pending validation with a frontend consultant. The skill matrix shows Angular is the most widely used frontend framework among Java-discipline consultants, but the recommendation is to move toward React for new projects. This is the single most likely entry to generate pushback, which is partly the point.

Aspirational entries (Flutter, Rust, Next.js, Supabase, and similar) stay on the radar with honest descriptions about current adoption levels. Descriptions should state clearly when nobody at FreshMinds uses something yet.

## Relationship to the tech vision

Harm Vestjens is developing a tech vision document covering five domains: software engineering, cloud, security, AI, and platform engineering. The tech vision is a 3+ year forward-looking document. The tech radar is concrete and actionable, covering the next 6 to 12 months.

Over time the two should align. If the vision predicts something is coming and the radar doesn't reflect it, that's a question worth investigating. If the radar shows strong adoption of something the vision doesn't mention, that's also worth discussing.

The tech radar is not a consequence of the tech vision. It is built from the ground up (skill matrices, client context, consultant experience) and validated against the vision, not derived from it.

## Future: the global radar

The global radar is not being built yet. It will be a manually curated, higher-level subset of what appears across unit radars. Principals from all units meet, pick roughly 20 entries that tell a coherent client-facing story, and publish it on the main FreshMinds website.

Prerequisites: at least 2 to 3 unit radars need to exist first. Building a global radar from one unit's perspective would misrepresent the company.
