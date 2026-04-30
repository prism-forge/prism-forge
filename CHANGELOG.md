# Changelog

All notable changes to PRISM Forge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-04-30 (BREAKING)

### Added
- Runtime enforcement via hooks (UserPromptSubmit, Stop, SessionStart). Routing is no longer advisory markdown.
- `bin/prism-drift.js` - drift telemetry CLI to measure persona attribution rate from session JSONLs
- `prism-forge drift` subcommand and `verify --drift` flag
- `lib/hooks-install.js` - hook script installer
- `lib/settings-patch.js` - idempotent settings.json merge with reversibility
- `lib/routing-events.js` - JSONL drift event log helpers
- `lib/migrate-v1.js` - automatic v1.1.0 to v2.0.0 migration with backup
- `src/hooks/` - three hook scripts (prism_session_start.sh, prism_inject_routing.sh, prism_check_attribution.py)
- `src/routing/signals.json` - 301 parsed routing signals consumed by hooks
- 5 specialist personas added (Atlas, Morgan, Sagan, Phoenix, Koa) bringing total to 28

### Changed
- Manifest schema bumped to v2.0 with `hooks: []` and `settingsPatches: []` fields
- `routing-engine.md` reframed from advisory guidance to runtime-enforced contract
- `install` now patches `~/.claude/settings.json` and copies hooks to `~/.claude/hooks/`
- `uninstall` branches on manifest.version - v2 cleanup removes hooks and settings entries

### Removed
- "Personas are advisory" line from routing-engine.md
- "Apply simplification - lean out work output" directive
- "Using persona's principles is NOT activation" loophole
- "When in doubt, announce" softener
- "This is guidance for her reasoning, not a rigid procedure" framing

### Migration
v1.1.0 to v2.0.0 is automatic on next `npx prism-forge install`. The v1 manifest and routing-engine.md (with any user customizations) are backed up to `.prism-backup/v1-YYYY-MM-DD/`. See MIGRATION.md.

### Drift target
Baseline pre-v2: 99.7% drift on substantive turns (4,583 turns / 401 sessions sampled).
Target: less than 20% drift within 1 week of v2 install.
Run `npx prism-forge drift --since=7` to measure.

## [1.1.0] - 2026-04-01

### Changed
- Core personas (Mary, Amelia, Bob, Quinn) now lazy-load on first signal instead of eager-loading at session start
- Routing engine updated to handle on-demand loading for all 23 personas

### Added
- Atlas (Growth Strategist) persona with skill-routing integration for 9 marketing skills

## [1.0.0] - 2026-03-25

### Added
- 23 expert personas (4 core, 1 dynamic orchestrator, 18 specialists)
- Signal-based routing engine with Susie as dynamic orchestrator
- CLI installer: `npx prism-forge install`, `verify`, `uninstall`
- CLAUDE.md injection with delimited PRISM Forge section
- Create-persona skill for community contributions
- Structural audit checklist (76 checks)
- Documentation: architecture guide, signal reference, customization guide
