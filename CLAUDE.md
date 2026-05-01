# C:/dev/prism CLAUDE.md

**Scope:** Project-specific rules for prism-forge, the persona routing system for Claude Code.

**Inheritance:** Global `~/.claude/CLAUDE.md` and `C:/dev/CLAUDE.md` are authoritative. This file layers on top.

---

## 1. Project Identity

**prism-forge** (v1.1.0) is a deterministic persona routing system that installs 23 expert personas into Claude Code sessions. It reads signals from natural language, classifies intent, and activates the right persona or persona team automatically.

**Repository:** https://github.com/prism-forge/prism-forge

---

## 2. Stack

- **Runtime:** Node.js >=18.0.0 (ESM)
- **Primary entry:** `bin/prism-forge.js` (CLI tool)
- **Core logic:** `lib/` (installer, manifest, routing, token handling)
- **Configuration:** `src/personas/` (23 markdown files defining personas + routing engine)
- **Documentation:** `docs/` (architecture guide, signal reference, customization)
- **Package:** Published to npm as `prism-forge`

---

## 3. Architecture

**src/ vs lib/ split:**

- **src/personas/** - Markdown configuration: 23 persona files (personality, domain, signals) + routing engine manifest + skill routing integrations. These are content, not code.
- **lib/** - JavaScript installation and verification logic: Claude.md injection, file hashing, manifest tracking, uninstall cleanup.
- **bin/prism-forge.js** - CLI entry point. Routes: `install`, `verify`, `uninstall`.

**Installation flow:** `npx prism-forge install` → reads `src/personas/` → injects delimited block into `~/.claude/CLAUDE.md` → writes manifest to track installed files → future upgrade can restore user customizations from `.prism-backup/`.

---

## 4. Build Commands

```bash
# Test all installation/verification flows
npm test

# Verify routing engine and persona manifest structure
npx prism-forge verify

# Install into current ~/.claude environment (development)
npx prism-forge install

# Uninstall and clean up ~/.claude/
npx prism-forge uninstall
```

**No build step** (distribution is src/ + lib/ as-is). Files published to npm as defined in package.json `"files"` array.

---

## 5. Conventions

- **Versioning:** Semantic Versioning per CHANGELOG.md
- **Personas as markdown:** All 23 personas are markdown configuration files in `src/personas/`. Personas are never code, never executed - they are configuration that Claude reads to understand role, domain, and activation signals.
- **Signal phrases:** Defined in routing-engine manifest. Signals are case-insensitive, position-independent substrings or exact phrases that trigger persona activation.
- **Delimited injection:** CLAUDE.md installation uses `<!-- PRISM:START -->` / `<!-- PRISM:END -->` markers for clean uninstall and in-place upgrades.
- **Manifest tracking:** `prism-manifest.json` records every installed file and hash for integrity checks + safe uninstall.

---

## 6. Test Gate

**Before every commit:**

```bash
npm test
```

Tests cover:
- Persona file structure validation
- Routing engine signal table completeness
- Claude.md injection logic (inject, verify, uninstall)
- Manifest integrity (hash validation)

Failure = do not commit. Fix test failures before pushing to feature branch.

---

## 7. Key Files

- `bin/prism-forge.js` - CLI entry point
- `lib/install.js` - Core installation logic
- `lib/verify.js` - Structural audit and integrity checks
- `lib/uninstall.js` - Clean removal
- `lib/manifest.js` - Manifest read/write
- `lib/claude-md.js` - Claude.md injection/extraction
- `src/personas/routing-engine.md` - Susie's orchestration manual (1000+ lines)
- `src/personas/persona-chief-of-staff-susie.md` - Dynamic orchestrator definition
- `test/*.test.js` - Node test harness

---

## 8. References

For richer project context and session-specific learning:
- `~/.claude/projects/C--dev-prism/memory/` - Session memory and feedback files
- `docs/architecture.md` - Technical deep-dive on routing engine
- `CONTRIBUTING.md` - Persona creation guide for community contributions

---

## 9. Quality Standards

- All markdown in `src/personas/` must have valid YAML frontmatter
- Routing engine signal tables must be exhaustive and non-overlapping (except shared signals)
- Persona names are immutable after release (persona refactoring requires deprecation cycle)
- Test coverage: every install/verify/uninstall path must be exercised before release
