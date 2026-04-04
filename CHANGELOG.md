# Changelog

All notable changes to PRISM Forge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
