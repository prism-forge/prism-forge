# PRISM

## What This Is

PRISM is an open-source deterministic persona routing engine for AI coding assistants. It auto-routes user messages to the right expert persona on every turn using signal-based matching — no menus, no slash commands, no manual invocation. Derived from the BMAD Method, significantly redesigned with unique auto-routing capabilities that no other tool in the ecosystem has.

## Core Value

Deterministic signal-based persona routing that activates the right expert perspective on every turn without user intervention.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 22 persona files ported from Claude OS with all references cleaned
- [ ] Every persona deep-audited for language balance, tone, and Domain Application accuracy
- [ ] Jobs persona rebalanced from 80/20 reducer/visionary to 50/50
- [ ] Routing engine with 8-step processing order, 24-entry shared signal table, 23-row domain registry
- [ ] Specialist Load Protocol with on-demand file loading via Read directives
- [ ] 48-check structural audit system for integrity validation
- [ ] Create-persona skill for community extensibility
- [ ] Manifest file with complete persona index
- [ ] MIT license with dual copyright (BMad Code LLC 2025 + Anthony Hipp 2026)
- [ ] NOTICE.md with proper BMAD attribution
- [ ] Install mechanism (npm + bash) researched and implemented
- [ ] CLI entry point for installation with path rewriting
- [ ] README with full product documentation
- [ ] Architecture, signals, and customization documentation
- [ ] CONTRIBUTING.md and CHANGELOG.md
- [ ] GitHub org `prism-engine` under DrakkoTarkin account
- [ ] Clean public push with no Claude OS, Nike, or ambiguous references

### Out of Scope

- IDE-specific integrations (Cursor, VS Code plugins) — PRISM is platform-agnostic config files
- Web UI or dashboard — CLI/file-based tool
- Paid features or SaaS wrapper — fully open source, MIT licensed
- Automated testing framework for personas — structural audit is sufficient for v1
- Multi-language support — English only for v1

## Context

PRISM originated from Anthony's 3-month experience using BMAD at Nike with Cursor, then porting and redesigning the persona system for Claude Code. The redesign introduced deterministic auto-routing — a capability verified as unique across the entire ecosystem (BMAD, SuperClaude, all forks, mushfoo/claude-personas, wshobson/agents).

Content split from BMAD: ~35% adapted (persona names, signal tables, domain registry), ~30% significantly rewritten (routing engine mechanics, domain application sections), ~35% entirely new (Specialist Load Protocol, audit checklist, Session Start, Signals section, platform adaptation).

Source materials:
- `C:\dev\claude-os\` — complete Claude OS build (source of all persona files, routing engine, skills, audit checklist)
- `C:\Users\antho\Downloads\review-copy\` — original Cursor BMAD source for reference
- BMAD LICENSE: MIT, copyright BMad Code, LLC (2025)
- BMAD TRADEMARK.md: protects "BMad" name, permits forks under different names

Competitive landscape:
- No existing project has deterministic signal-based persona routing
- SuperClaude has an open feature request (#114) for what PRISM ships
- BMAD-AT-CLAUDE uses manual `*analyst`, `*pm` commands
- All other tools require explicit invocation

Target audience: Claude Code users who want expert perspectives without menu-diving. Secondary: AI coding assistant community broadly.

6-month goals: 100+ GitHub stars, recognized tool in the Claude Code ecosystem, personal brand for Anthony as AI engineering leader.

## Constraints

- **Legal**: Zero BMAD trademarks in product name, branding, or marketing. Attribution required in NOTICE.md. Dual copyright in LICENSE.
- **Budget**: Zero-cost organic growth only. No paid tools or services for the project itself.
- **Availability**: Anthony has 3-4 hours/day, 7 days/week.
- **Privacy**: No face on camera, no live demos/streams, DrakkoTarkin handle for public-facing content.
- **Sequencing**: Everything built and verified locally before any public push. GitHub org created last.
- **Quality**: High quality, prescriptive — everything polished before going public. Install experience must match ecosystem standards (npm + bash).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Name: PRISM | Word is the metaphor (light in, spectrum out). No forced acronym. Follows Rust/Go/Vue philosophy. | — Pending |
| Tagline: Many minds. No menu. | 4 words, M alliteration, contrast pattern, directly differentiates from BMAD manual model. | — Pending |
| Separate repo, not GitHub fork | Avoids "forked from" badge implying BMAD association. Clean identity. | — Pending |
| Dual copyright in LICENSE | Legally required — derived work from MIT-licensed BMAD. | — Pending |
| Cleansing and content audit as separate phases | Prescriptive approach — don't mix reference cleanup with content rebalancing. | — Pending |
| Install: npm + bash | Ecosystem parity with BMAD, SuperClaude. Exudes quality. Research needed on mechanics. | — Pending |
| 7 phases for v1.0 | Added content audit phase and install phase; reordered docs after install. More phases = more prescriptive. | — Pending |
| Jobs persona rebalanced 50/50 | Current 80/20 reducer/visionary doesn't match the real Jobs. Flagged during war room. | — Pending |
| All 22 personas get deep audit | Not light pass, not full rewrite. Rebalance, tone check, Domain Application accuracy, BMAD differentiation. | — Pending |
| GitHub org: prism-engine | Under DrakkoTarkin account, created in Phase 7 (last). | — Pending |

---
*Last updated: 2026-03-18 after initialization*
