#!/usr/bin/env bash
# Prism v2 routing injection on UserPromptSubmit (user message)
#
# Reads stdin JSON {prompt, cwd, ...}. Checks for signal hits or drift state.
# Fires injection if signal found or prior drift event detected.
#
# Output (firing): JSON with additionalContext routing directive.
# Output (not firing): empty JSON {}.
# Always exit 0 (fail-safe).

set -euo pipefail

# Read stdin with fail-safe
INPUT="$(cat 2>/dev/null || echo '{}')"

# Extract prompt from JSON
PROMPT="$(printf '%s' "$INPUT" | python -c 'import sys,json; print(json.load(sys.stdin).get("prompt",""))' 2>/dev/null || echo "")"

# Convert to lowercase for case-insensitive matching
PROMPT_LOWER="$(printf '%s' "$PROMPT" | tr '[:upper:]' '[:lower:]')"

# Hard override 1: war room
if printf '%s' "$PROMPT_LOWER" | grep -q "war room"; then
  CONTEXT="ROUTING DIRECTIVE: User message contains hard override: 'war room'. Load ALL 27 personas. Announce with roster change protocol."
  printf '{"additionalContext":"%s"}' "$(printf '%s' "$CONTEXT" | sed 's/"/\\"/g')"
  exit 0
fi

# Hard override 2: explicit persona name
PERSONA_LIST="mary|amelia|bob|quinn|susie|winston|john|paige|carson|dr quinn|maya|victor|spike|sophia|sally|leonardo|dali|de bono|campbell|jobs|barry|boris|musk|atlas|morgan|sagan|phoenix|koa"
if printf '%s' "$PROMPT_LOWER" | grep -qE "($PERSONA_LIST)"; then
  CONTEXT="ROUTING DIRECTIVE: User message contains explicit persona name. Activate named persona as primary. Announce roster change."
  printf '{"additionalContext":"%s"}' "$(printf '%s' "$CONTEXT" | sed 's/"/\\"/g')"
  exit 0
fi

# Check for common signal keywords (simplified set for test)
if printf '%s' "$PROMPT_LOWER" | grep -qE "(architecture|investigate|war room|analyze|build|validate|design|strategy)"; then
  CONTEXT="ROUTING DIRECTIVE: User message contains routing signal. Activate appropriate persona(s). Announce roster change if new."
  printf '{"additionalContext":"%s"}' "$(printf '%s' "$CONTEXT" | sed 's/"/\\"/g')"
  exit 0
fi

# Check for drift in prior events
EVENTS_LOG="$HOME/.claude/hooks/prism_routing_events.jsonl"
if [ -f "$EVENTS_LOG" ]; then
  LAST_EVENT="$(tail -n 1 "$EVENTS_LOG" 2>/dev/null || echo "")"
  if [ -n "$LAST_EVENT" ]; then
    IS_DRIFT="$(printf '%s' "$LAST_EVENT" | python -c 'import sys,json; print(json.load(sys.stdin).get("drift",False))' 2>/dev/null || echo "False")"
    if [ "$IS_DRIFT" = "True" ]; then
      CONTEXT="ROUTING DIRECTIVE: Prior turn drift detected (substantive response without attribution). Susie re-routes personas."
      printf '{"additionalContext":"%s"}' "$(printf '%s' "$CONTEXT" | sed 's/"/\\"/g')"
      exit 0
    fi
  fi
fi

# No signal hit, no drift: silent
printf '{}'
exit 0
