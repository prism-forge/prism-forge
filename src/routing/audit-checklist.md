# PRISM — System Audit Checklist

> Boris (Type System Auditor) lead, Quinn (QA Engineer) support.
> Run when: new personas added, routing engine modified, system installed on new machine, or drift suspected.

## 1. Persona File Integrity (22 files)

- [ ] All 22 persona files exist at `{PRISM_PERSONAS}/`
- [ ] Each file has sections: Identity, Communication Style, Principles, Domain Application, Signals
- [ ] No file exceeds 800 lines
- [ ] No Cursor-specific content (`.mdc`, `alwaysApply`, `globs`, workspace paths)
- [ ] No domain-specific content (Tableau, Snowflake, Jira) in global personas

### Always-On (4)
- [ ] `persona-analyst-mary.md` — mode default: Ask
- [ ] `persona-dev-amelia.md` — mode default: Agent
- [ ] `persona-scrum-master-bob.md` — mode default: Plan
- [ ] `persona-qa-quinn.md` — mode default: Any (validation signals)

### Session Manager (1)
- [ ] `persona-chief-of-staff-susie.md` — Turn 1 unconditional + no-signal fallback

### Specialists (17)
- [ ] All 17 specialist files present and non-empty

## 2. Routing Engine Integrity

- [ ] `{PRISM_ROUTING}/routing-engine.md` exists
- [ ] Mode Defaults section maps: Plan→Bob+John, Agent→Amelia, Ask→Mary, Unknown→Susie
- [ ] Domain Registry table has 23 rows (one per work type)
- [ ] Shared Signals Reference table has 24 entries
- [ ] Specialist Load Protocol has 17 Read directives
- [ ] Every Read directive path matches an actual file in `{PRISM_PERSONAS}/`
- [ ] Processing Order has 8 items (war room → explicit name → mode switch → domain → shared signals → context-disambiguated → exclusive → fallback)
- [ ] No orphaned persona references (name in routing engine but no file)
- [ ] No orphaned persona files (file exists but not referenced in routing engine)

## 3. Manifest Consistency

- [ ] `persona-manifest.md` lists all 22 personas
- [ ] Always-On table has 4 entries matching actual always-on files
- [ ] Session Manager table has 1 entry (Susie)
- [ ] Specialist table has 17 entries matching actual specialist files
- [ ] Signal Coverage Map domains match routing engine Domain Registry
- [ ] Shared Signals table matches routing engine Shared Signals Reference
- [ ] Routing Quick Reference matches Processing Order behavior

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

**Total checks:** 48
**Pass threshold:** 48/48 (no partial credit — every check is structural)

*Last updated: 2026-03-18*
*PRISM v1.0 — Persona Engine*
