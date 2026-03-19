# PRISM -- System Audit Checklist

> Boris (Type System Auditor) lead, Quinn (QA Engineer) support.
> Run when: new personas added, routing engine modified, system installed on new machine, or drift suspected.

## 1. Persona File Integrity (23 files)

- [ ] All 23 persona files exist at `{PRISM_PERSONAS}/`
- [ ] Each file has sections: Identity, Communication Style, Principles, Domain Application, Signals
- [ ] No file exceeds 800 lines
- [ ] No Cursor-specific content (`.mdc`, `alwaysApply`, `globs`, workspace paths)
- [ ] No domain-specific content (Tableau, Snowflake, Jira) in global personas

### Always-On (4)
- [ ] `persona-analyst-mary.md` -- mode default: Ask
- [ ] `persona-dev-amelia.md` -- mode default: Agent
- [ ] `persona-scrum-master-bob.md` -- mode default: Plan
- [ ] `persona-qa-quinn.md` -- mode default: Any (validation signals)

### Dynamic Orchestrator (1)
- [ ] `persona-chief-of-staff-susie.md` -- Turn 1 unconditional + no-signal fallback

### Specialists (17)
- [ ] All 18 specialist files present and non-empty

## 2. Routing Engine Integrity

### Routing engine file and framing (2)
- [ ] `{PRISM_ROUTING}/routing-engine.md` exists
- [ ] Title is "Persona Routing Engine -- Susie's Orchestration Manual"

### Susie's Role section (2)
- [ ] Turn 1 behavior defined (6 steps: read todo, read memory, read handoffs, check git, deliver sitrep, hand off)
- [ ] Sitrep format has 4 items (Active, Blocked, Stale, Recommended)

### Hard Overrides section (4)
- [ ] Has exactly 3 overrides (war room, explicit name, mode switch)
- [ ] War room specifies case-insensitive standalone phrase and ALL-persona activation
- [ ] Explicit name specifies ALWAYS a roster change requiring announcement
- [ ] Mode switch specifies system context detection

### Mode Defaults section (1)
- [ ] Maps 4 modes: Plan->Bob+John, Agent->Amelia, Ask->Mary, Unknown->Susie

### Intent Classification section (3)
- [ ] Table has exactly 9 intent categories
- [ ] Each category has: Intent, Description, Typical Primary, Typical Supporting
- [ ] Multi-intent spanning described (holistic evaluation, not sequential)

### Team Assembly Protocol section (5)
- [ ] Primary persona defined (one per turn except party mode)
- [ ] Supporting personas defined (attributed prefix)
- [ ] Team size guidance present (unlimited but earned)
- [ ] Re-evaluation frequency stated (every turn)
- [ ] Cross-workflow hooks table has 10 rows

### Conversation Management section (2)
- [ ] Has exactly 5 patterns (sequential, concession, disagreement, build-on, convergence)
- [ ] Each pattern has example format

### Domain Registry in Reference Tables (2)
- [ ] Has exactly 23 rows
- [ ] Every domain row has: Work Type, Primary Owner, Supporting, Notes

### Signal Guide in Reference Tables (3)
- [ ] Shared signals sub-table has exactly 24 entries
- [ ] Specialist signals sub-table has exactly 18 entries
- [ ] Each specialist signal row maps to exactly one persona

### Specialist Load Protocol (4)
- [ ] Has exactly 18 specialist entries
- [ ] Every entry has: name, signals, Read directive path, announce line
- [ ] Every Read path follows `{PRISM_PERSONAS}/persona-{slug}.md` pattern
- [ ] Every Read path matches an actual file in `{PRISM_PERSONAS}/`

### No orphaned references (2)
- [ ] Every persona named in routing engine has a corresponding file
- [ ] Every persona file is referenced in routing engine

### Remaining sections present (5)
- [ ] Announcements section exists with join/switch/party patterns
- [ ] Skill-Context Interaction section exists
- [ ] Handoff Protocol section exists
- [ ] Shared Persona Protocols section exists (simplification, multi-persona, formatting)
- [ ] Correction Memory section exists

## 3. Manifest Consistency

- [ ] `persona-manifest.md` lists all 23 personas
- [ ] Always-On table has 4 entries matching actual always-on files
- [ ] Dynamic Orchestrator table has 1 entry (Susie)
- [ ] Specialist table has 18 entries matching actual specialist files
- [ ] Signal Coverage Map domains match routing engine Domain Registry
- [ ] Shared Signals table matches routing engine Signal Guide shared signals
- [ ] Routing Quick Reference includes multi-intent example
- [ ] How to Use section describes Susie as dynamic orchestrator (not pipeline processor)

## 4. Global CLAUDE.md Integration

- [ ] `{PRISM_CLAUDE_MD}` contains "Persona Routing System" section
- [ ] Section has Read directive for `{PRISM_ROUTING}/routing-engine.md`
- [ ] Section has Read directives for all 4 always-on persona files
- [ ] Skills reference points to `{PRISM_SKILLS}/create-persona/`
- [ ] Audit reference points to `{PRISM_ROUTING}/audit-checklist.md`
- [ ] No stale references to removed primers or outdated paths

## 5. Workflow Gates

- [ ] User's `development-workflow.md` contains "Post-Task Lessons Gate" (section 5)
- [ ] Contains "Auto-Skill Detection" (section 6)
- [ ] Contains "Auto-Persona Gap Detection" (section 7) referencing create-persona skill
- [ ] Contains "Context Checkpoint" (section 8) referencing `docs/handoffs/`
- [ ] Memory path uses `~/.claude/projects/.../memory/` (not `tasks/lessons.md`)
- [ ] Handoff path uses `docs/handoffs/` (not `docs/context-handoff-`)

## 6. Skills Installation

- [ ] `{PRISM_SKILLS}/create-persona/SKILL.md` exists
- [ ] Output path in skill is `{PRISM_PERSONAS}/persona-{name-slug}.md`
- [ ] Output format is `.md` (not `.mdc`)
- [ ] Output structure has 5 sections (Identity, Communication Style, Principles, Domain Application, Signals)
- [ ] Post-creation checklist references `routing-engine.md` and `persona-manifest.md`
- [ ] No references to removed primer skills

## 7. Cross-Project Inheritance

- [ ] Global config at `~/.claude/` applies to all projects (not workspace-scoped)
- [ ] Per-project `CLAUDE.md` files do not override or conflict with persona routing
- [ ] Per-project rules in `.claude/rules/` do not shadow global persona files
- [ ] Memory system at `~/.claude/projects/{project}/memory/` is project-scoped (correct)

---

**Total checks:** 76
**Pass threshold:** 76/76 (no partial credit -- every check is structural)

*Last updated: 2026-03-19*
*PRISM v1.0 -- Persona Engine*
