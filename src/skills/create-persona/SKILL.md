---
name: create-persona
description: Guides users through creating effective persona files for Claude Code. Interviews for identity, communication style, principles, domain application, and signals. Creates .md files in the 5-section format at {PRISM_PERSONAS}/. Use when the user wants to create a persona, add a new role, build a persona rule, or when auto-persona gap detection flags a missing domain.
---

# Create Persona

Guides users through creating new persona rule files for the routing engine. Interviews for role, activation, style, and domain scope, then generates a `.md` file following existing conventions. Use when the user wants to create a persona, add a new role, build a persona rule, or when auto-persona gap detection flags a missing domain.

## Before You Begin

- Read `{PRISM_ROUTING}/routing-engine.md` for the routing engine structure
- Read `{PRISM_PERSONAS}/persona-manifest.md` for the full persona catalog and signal tables
- Read one existing persona file as a template (e.g., `{PRISM_PERSONAS}/persona-dev-amelia.md` for always-on, `{PRISM_PERSONAS}/persona-combinatorial-genius-jobs.md` for signal-based)

## Interview Questions

Ask these in order. Skip questions the user has already answered in their request.

1. **Role**: What role does this persona fill? (e.g., "Data Engineer", "Security Reviewer", "Accessibility Auditor")
2. **Name**: What name and short title? (e.g., "Kai (Data Engineer)")
3. **Activation**: Always-on (every conversation) or signal-based (activated by keywords/domain)?
4. **Domain**: What work types should route to this persona? (maps to Domain Registry in routing engine)
5. **Signals**: What keywords or phrases should activate this persona? (maps to Signal Guide)
6. **Style**: Communication approach? (e.g., "terse and technical", "collaborative and questioning", "assertive and opinionated")
7. **Principles**: 3-5 core principles this persona applies to work
8. **Coordination**: Which existing personas does this one support or get supported by?
9. **Signals**: What is this persona's mode default, domain registry row, and any shared signals? (maps to Signals section)

## Output File Structure

Generate a `.md` file at `{PRISM_PERSONAS}/persona-{name-slug}.md`:

```
---
name: persona-{name-slug}
description: "[trigger phrases and role description]"
---

# [Name] -- [Role]

## Identity
[Background, expertise, what makes them unique]

## Communication Style
[Tone, energy, speaking patterns]

## Principles
[3-4 core beliefs, frameworks, methodologies]

## Domain Application
[How they apply their lens to the user's specific work]

## Signals
- **Mode default:** [mode and conditions]
- **Domain registry:** [work type this persona owns (primary owner)]
- **Shared signals:** [signal phrases from routing engine shared signals table, if any]
- **Supporting:** [personas this one supports or is supported by]
```

Do NOT include Activation Protocol, Multi-Persona Behavior, "Defer to user rules", Simplification Principle, or shared signal disambiguation prose in the persona file. Routing logic is centralized in the routing engine. The Signals section is metadata only — not routing logic.

## Post-Creation Checklist

After generating the persona file:

1. [ ] File follows naming convention: `persona-{name-slug}.md`
2. [ ] `description` in frontmatter includes trigger phrases and role description
3. [ ] Persona file contains exactly 5 sections: Identity, Communication Style, Principles, Domain Application, Signals
4. [ ] Signals section includes mode default, domain registry row, shared signals (if any), and specialist signals (if specialist persona)
5. [ ] Add persona to `{PRISM_ROUTING}/routing-engine.md` Domain Registry table (work type + primary owner)
6. [ ] Add persona's shared signals to the Signal Guide shared signals table in the routing engine (if any)
7. [ ] Add persona's Specialist Load Protocol entry to routing engine (signal list + Read path + announce line)
8. [ ] Add persona to `{PRISM_PERSONAS}/persona-manifest.md` specialist table
9. [ ] Copy new persona file to `{PRISM_PERSONAS}/persona-{name-slug}.md`

## Anti-Patterns

- Do not create always-on personas for niche domains (signal-based is better)
- Do not duplicate an existing persona's domain -- check the registry first
- Do not use "secondary" or "silently available" language -- personas are active (announced) or inactive
- Do not skip the routing engine updates -- an unregistered persona will never activate via domain routing
- Do NOT add Activation Protocol, Multi-Persona Behavior, or shared signal lines to persona files. These are centralized in the routing engine.
