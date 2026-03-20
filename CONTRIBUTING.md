# Contributing to PRISM Forge

PRISM Forge welcomes contributions, especially new personas that fill domain gaps. The most impactful contribution is a well-crafted persona that adds a new expert perspective to the routing engine. Every persona must earn its place by covering a work domain that no existing persona handles.

## Adding a New Persona

### Step 1: Identify a Domain Gap

Before creating a persona, demonstrate that a real gap exists. Your PR must include 3-5 example user messages that currently fall through to mode defaults, with signal analysis showing why no existing persona handles them.

Example format:

```
Message: "Is this API contract GDPR compliant?"
Current routing: Falls to Mary (mode default) -- no legal/compliance domain owner
Signal analysis: "compliant" not in any signal table, "GDPR" not recognized
Gap: No persona covers legal/regulatory/compliance reasoning
```

```
Message: "What are the tax implications of this pricing model?"
Current routing: Falls to Mary (mode default) -- no financial/tax domain owner
Signal analysis: "tax implications" not in any signal table
Gap: No persona covers financial analysis or tax reasoning
```

```
Message: "Is this data pipeline HIPAA compliant?"
Current routing: Falls to Mary (mode default) -- regulatory compliance unowned
Signal analysis: "HIPAA" and "compliant" not in any signal table
Gap: Same gap -- legal/regulatory/compliance remains uncovered
```

Check [docs/signals.md](docs/signals.md) to see all existing signals and ensure your proposed persona covers genuinely unserved territory.

### Step 2: Research a Real Person

The default naming methodology is to name personas after recognizable people whose professional methodology embodies the domain. Deep-research their actual operating principles, not surface-level associations.

Examples of this methodology in practice:

- **Susie** (Susan Wojcicki) -- Session orchestration. Wojcicki's leadership at YouTube involved managing diverse creator ecosystems simultaneously, parallel to Susie's role assembling persona teams per context.
- **Boris** (Boris Cherny) -- Type system auditing. Cherny's work on TypeScript type theory and structural type systems maps directly to Boris's role validating structural conformance.
- **Musk** (Elon Musk) -- Radical reduction. Musk's engineering methodology (question requirements, delete before optimizing, simplify, accelerate, then automate) maps to first-principles reduction of over-engineered systems.

Fictional names are acceptable only if no iconic figure embodies the domain -- include written justification for why.

### Step 3: Use the Create-Persona Skill

All personas must be generated using the create-persona skill. Hand-built personas will be rejected. The skill ensures consistent 5-section output format (Identity, Communication Style, Principles, Domain Application, Signals) and proper routing engine integration.

The skill is installed with PRISM Forge and walks through an interview process covering role, name, activation type, domain, signals, communication style, principles, and coordination with existing personas.

### Step 4: Complete PR Checklist

A complete persona PR includes exactly 4 artifacts:

- [ ] Persona file at `src/personas/persona-{name-slug}.md` (5 sections from create-persona skill)
- [ ] Updated routing engine (`src/routing/routing-engine.md`) with signals added to Signal Guide and domain row if new
- [ ] Updated manifest (`src/personas/persona-manifest.md`) with new row in specialist table
- [ ] `npx prism-forge verify` passes with zero errors

## Persona Quality Bar

- **Must add value to a work domain** -- not personality cosplay. "George Washington -- Leadership Persona" rejected because existing personas already cover leadership. "Ruth Bader Ginsburg -- Legal Analyst" accepted because no persona covers legal/compliance reasoning.
- **Must have distinct, non-overlapping signals** that do not conflict with existing personas.
- **Must support Susie's intent-driven orchestration model** -- persona activates when domain signals match, not by explicit user invocation.

## Professional Framing Disclaimer

PRISM Forge personas provide analytical and research support through specialized lenses. They do not provide professional advice (legal, medical, financial, or otherwise). Personas are thinking tools, not licensed practitioners.

## Code Contributions

Standard fork/branch/PR process. Run `npx prism-forge verify` before submitting. Follow conventional commits (`feat:`, `fix:`, `docs:`, etc.).

## Reporting Issues

Use [GitHub Issues](https://github.com/prism-forge/prism/issues). Include reproduction steps. Label as `bug`, `enhancement`, or `persona-request`.
