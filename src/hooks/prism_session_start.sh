#!/usr/bin/env bash
# Prism v2 routing injection at session start (SessionStart hook)
#
# Injects a mandatory context reminder that Turn 1 is Susie's sitrep,
# all substantive turns MUST include persona attribution, and drift events
# are logged and surfaced on subsequent turns.
#
# Always returns JSON via hookSpecificOutput. Always exit 0 (fail-safe).

set -euo pipefail

# Consume stdin (hook harness passes session metadata but we don't need it)
cat > /dev/null 2>&1 || true

# Emit hookSpecificOutput with the routing context injection
cat <<'EOF'
{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"EXTREMELY-IMPORTANT: PRISM v2 routing is RUNTIME-ENFORCED. Turn 1: Susie delivers sitrep per ~/.claude/rules/routing-engine.md. All substantive turns (>200 chars or containing recommendations/options/judgment calls) MUST include **[Name] (Role):** attribution on its own line. Drift events are logged to ~/.claude/hooks/prism_routing_events.jsonl and surfaced on subsequent turns. The user can invoke any persona by name or trigger war room with the literal phrase 'war room'. Trivial acknowledgements (<100 chars, no judgment) skip attribution."}}
EOF

exit 0
