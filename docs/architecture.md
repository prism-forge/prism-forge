# PRISM Forge Architecture

## Overview

PRISM Forge is a persona routing system for Claude Code. It installs 23 expert personas and a routing engine that activates the right persona on every turn based on signal detection. No configuration, no slash commands -- just natural conversation.

The system is built on a simple premise: your words reveal your intent. When you say "I'm stuck," that signals a need for creative problem-solving. When you say "let's plan," that signals a need for task structuring. PRISM Forge detects these signals and activates the right expert automatically.

## System Components

### Persona Files (23 .md files)

Each persona has 5 sections:

1. **Identity** -- Background, expertise, what makes them unique
2. **Communication Style** -- Tone, energy, speaking patterns
3. **Principles** -- Core beliefs and methodologies
4. **Domain Application** -- How they apply their lens to user work
5. **Signals** -- Mode default, domain registry row, shared signals, supporting relationships

Personas are categorized into three groups:

- **Always-on (4):** Loaded every session via CLAUDE.md Read directives
- **Dynamic orchestrator (1):** Susie, referenced in the routing engine
- **Specialists (18):** Loaded on-demand when Susie determines they are needed

### Routing Engine (routing-engine.md)

Susie's orchestration manual. Contains:

- **Domain Registry** -- 23 rows mapping work types to persona owners (primary + supporting)
- **Signal Guide** -- 24 shared signals and 18 specialist signals that inform team assembly
- **Intent Classification** -- 9 intent categories (Build, Investigate, Plan, Validate, Create, Challenge, Orient, Document, Narrate) with typical persona teams
- **Team Assembly Protocol** -- How Susie builds a team: primary leads, supporting personas earn their seat
- **Specialist Load Protocol** -- Deterministic Read directives for loading specialist persona files
- **Conversation Management** -- Patterns for multi-persona responses: disagreement, concession, build-on, sequential contribution, convergence summary

### CLAUDE.md Activation Block

A delimited section injected into the user's `~/.claude/CLAUDE.md` that loads the routing engine and 4 always-on personas via Read directives. Contains references to the create-persona skill and audit checklist.

### Create-Persona Skill

An interactive skill that guides persona creation through an interview process. Asks about role, name, activation type, domain, signals, communication style, principles, and coordination with existing personas. Outputs a properly formatted persona file with the 5-section structure.

### Audit Checklist

76 structural checks validating:

- Persona file integrity (23 files, 5 sections each)
- Routing engine integrity (domain registry, signal guide, specialist load protocol)
- Manifest consistency (persona counts, signal coverage)
- CLAUDE.md integration (Read directives, skill/audit references)
- Cross-project inheritance (global vs. project-scoped paths)

## How Routing Works

### Turn 1

Susie activates unconditionally on Turn 1 of every session, regardless of mode. Before responding to any task, she:

1. Reads `todo.md` (active work items)
2. Reads `memory/` (lessons, patterns, decisions)
3. Reads `docs/handoffs/` (session continuity documents)
4. Checks git state (recent commits, current branch, staged changes)
5. Delivers a sitrep:
   - **Active:** current work items
   - **Blocked:** any pending blockers
   - **Stale:** items with no recent activity
   - **Recommended:** persona/focus for this session
6. Hands off to the appropriate persona for the actual task

If any source is missing (e.g., no `todo.md`), Susie notes it gracefully and proceeds.

### Every Subsequent Turn

Susie evaluates the user's message holistically on every turn:

1. **Check hard overrides** -- Three categorical overrides bypass intent evaluation:
   - **War room** ("war room" phrase) -- Load ALL personas, Susie moderates
   - **Explicit name** (user names a persona directly) -- Roster change, announce
   - **Mode switch** (system context change) -- Activate mode's default persona

2. **Classify user intent** -- Match the message against the Intent Classification table (9 categories: Build, Investigate, Plan, Validate, Create, Challenge, Orient, Document, Narrate). A single message can span multiple intents.

3. **Detect signal phrases** -- Consult the Signal Guide for shared signals (activate multiple personas) and specialist signals (activate one specialist). All matching signals inform the team assembly decision.

4. **Assemble persona team** -- Select primary owner from Domain Registry, add supporting personas based on context. Every supporting persona must earn their seat by adding a genuinely different perspective.

5. **Manage multi-persona response** -- Each persona's contribution is attributed with `**Name (Role):**` on its own line, with content starting on the next line. Voices stay distinct. Susie surfaces disagreements and manages convergence.

### Signal Processing

- **Shared signals** activate multiple relevant personas. For example, "refactor" activates Amelia + Jobs + Musk. "audit" activates Mary + Quinn + Boris.
- **Specialist signals** are exclusive to one persona. For example, "first principles" activates only Musk.
- **Context-disambiguated signals** resolve based on modifier phrases. "design" alone activates Spike + Sally; "design" + "architecture" activates Winston.

Susie evaluates signals holistically -- not first-match-wins. All matching signals are inputs to one team assembly decision.

### Mode Defaults

When no signal or domain match fires, Susie falls back to mode defaults:

- **Ask mode** -- Mary (Business Analyst)
- **Agent mode** -- Amelia (Developer Agent)
- **Plan mode** -- Bob (Scrum Master) + John (Product Manager)
- **Unknown / no mode** -- Susie (Chief of Staff) holds the floor

## File Layout

```
~/.claude/
  rules/
    personas/          # 23 persona .md files
    routing-engine.md  # Susie's orchestration manual
    audit-checklist.md # Structural integrity checks
  skills/
    create-persona/    # Persona creation skill
  CLAUDE.md            # Contains PRISM Forge activation block
```

Note: Actual paths use platform-appropriate separators. The installer handles path resolution.

## Persona Categories

### Always-On (4)

Loaded on every session via CLAUDE.md Read directives:

| Name | Role | Mode Default |
|------|------|--------------|
| Mary | Business Analyst | Ask mode |
| Amelia | Developer Agent | Agent mode |
| Bob | Scrum Master | Plan mode (with John) |
| Quinn | QA Engineer | Any mode (validation signals) |

### Dynamic Orchestrator (1)

| Name | Role |
|------|------|
| Susie | Chief of Staff / Dynamic Orchestrator |

Referenced in the routing engine. Activates unconditionally on Turn 1, then orchestrates all subsequent turns. Serves as the no-signal fallback when no domain or signal match fires.

### Specialists (18)

Loaded on-demand when Susie determines they are needed. Each has a Read directive in the routing engine's Specialist Load Protocol:

| Name | Role |
|------|------|
| Winston | Architect |
| John | Product Manager |
| Paige | Technical Writer |
| Carson | Brainstorming Coach |
| Dr. Quinn | Creative Problem Solver |
| Maya | Design Thinking Coach |
| Victor | Innovation Strategist |
| Spike | Presentation Master |
| Sophia | Storyteller |
| Sally | UX Designer |
| Leonardo | Renaissance Polymath |
| Dali | Surrealist Provocateur |
| de Bono | Lateral Thinker |
| Campbell | Mythic Storyteller |
| Jobs | Combinatorial Genius |
| Barry | Quick Flow Solo Dev |
| Boris | Type System Auditor |
| Musk | Radical Reductionist |

## Design Principles

- **Deterministic routing:** Same message always activates same personas. No randomness, no LLM-decides-whether-to-load ambiguity. Susie's decision process is transparent and repeatable.
- **Signal-based activation:** Personas activate because of WHAT the user says, not because the user asked for a specific persona.
- **Composable teams:** Multiple personas can activate simultaneously. Susie assembles the right team per context -- primary plus supporting perspectives.
- **Zero configuration:** Install once, works immediately. No per-project setup needed.
- **Disagreement by default:** When multiple personas are active, Susie surfaces genuine tension between perspectives. A multi-persona response where everyone agrees is a sign that disagreement was suppressed.
