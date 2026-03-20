# Customizing PRISM Forge

## Overview

PRISM Forge is designed to be extended. Add your own expert personas to fill domain gaps in your workflow. If you find yourself doing work that consistently falls through to a mode default persona, that's a signal that a new specialist is needed.

## Creating a Persona

Use the create-persona skill -- it is installed with PRISM Forge.

The skill walks through an interview process:

1. **Role** -- What role does this persona fill?
2. **Name** -- What name and short title?
3. **Activation** -- Always-on or signal-based (on-demand)?
4. **Domain** -- What work types should route to this persona?
5. **Signals** -- What keywords or phrases should activate this persona?
6. **Style** -- Communication approach (e.g., "terse and technical", "collaborative and questioning")
7. **Principles** -- 3-5 core principles this persona applies to work
8. **Coordination** -- Which existing personas does this one support or get supported by?

The output is a properly formatted `.md` file with 5 sections:

1. **Identity** -- Background, expertise, what makes them unique
2. **Communication Style** -- Tone, energy, speaking patterns
3. **Principles** -- Core beliefs and methodologies
4. **Domain Application** -- How they apply their lens to user work
5. **Signals** -- Mode default, domain registry row, shared signals, supporting relationships

The skill automatically places the file at the correct path.

## Updating the Routing Engine

After creating a persona, update the routing engine to recognize it:

1. **Add signals to the Signal Guide** -- Add the persona's specialist signals to the specialist signals table. If the persona participates in any shared signals, add those entries too.

2. **Add a domain row** -- If the persona covers a new work type not already in the Domain Registry, add a row with the work type, primary owner, and supporting personas.

3. **Add a Read directive** -- Add a Specialist Load Protocol entry with the persona's signal list, Read directive path (`personas/persona-{name-slug}.md`), and announce line.

4. **Update the manifest** -- Add a new row in the Specialist table of `persona-manifest.md` with the persona's name, role, file, and trigger signals.

## Verifying Your Changes

Run the audit to check structural integrity:

```bash
npx prism-forge verify
```

The verify command runs the audit checklist (76 checks) against your installation, validating:

- All persona files exist and have the correct 5-section structure
- Routing engine references match actual persona files
- Signal tables are consistent between routing engine and manifest
- CLAUDE.md activation block has correct Read directives

Fix any reported issues before using the new persona.

## Naming Conventions

- Persona files: `persona-{name-slug}.md` (lowercase, hyphenated)
- Example: `persona-legal-analyst-ruth.md`

The default methodology names personas after real people whose professional methodology embodies the domain. Deep-research their actual operating principles, not surface-level associations.

See [CONTRIBUTING.md](../CONTRIBUTING.md) for full guidelines on the naming methodology, including examples of how existing personas were named.

## Tips

- Start with 3-5 clear, non-overlapping signals that do not conflict with existing persona signals
- Check [docs/signals.md](signals.md) to ensure your signals are unique
- Test by typing messages that should activate your persona and verifying the right one responds
- Keep Domain Application focused on what the persona DOES, not generic descriptions
- Avoid always-on activation for niche domains -- signal-based (on-demand) is almost always the right choice
- Run `npx prism-forge verify` after every change to catch structural issues early
