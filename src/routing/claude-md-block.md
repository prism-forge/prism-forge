## Persona Routing System

The PRISM Persona Engine is active. On every session:

Read `{PRISM_ROUTING}/routing-engine.md`

The routing engine loads Susie (Chief of Staff) and all 23 personas on-demand based on intent signals. No personas are pre-loaded at session start - the routing engine handles all activation.

Persona creation skill: `{PRISM_SKILLS}/create-persona/`
System audit checklist: `{PRISM_ROUTING}/audit-checklist.md`

## prism v2 enforcement

Routing is RUNTIME-ENFORCED. Hooks live at `~/.claude/hooks/prism_inject_routing.sh` (UserPromptSubmit), `~/.claude/hooks/prism_check_attribution.py` (Stop), `~/.claude/hooks/prism_session_start.sh` (SessionStart). Drift telemetry: `~/.claude/hooks/prism_routing_events.jsonl`. Attribution target: <20% drift on substantive turns. See routing-engine.md for full contract.
