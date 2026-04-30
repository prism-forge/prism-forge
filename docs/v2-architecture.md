# PRISM Forge v2 Architecture

## Why v2 Exists

PRISM Forge v1 shipped routing as markdown configuration injected into `~/.claude/CLAUDE.md`. The routing engine was advisory - a detailed guide for how the model should reason and activate personas. Testing showed the model followed the guidance ~0.3% of the time on substantive turns.

Baseline: 4,583 turns across 401 sessions. 99.7% drift rate (persona activated by signal but response didn't reflect the persona's voice). Root cause: advisory text in a large document is low-signal; the model treated routing as context, not as enforced structure.

v2 adds runtime enforcement via hooks. Routing moves from the model's reasoning layer to the Claude Code harness itself. Hooks run before the model responds, ensuring signal detection and persona activation happen in hard code, not in the model's interpretation of guidance.

## Three Architectural Changes

### 1. Hooks instead of advisory text

v1: Routing logic lived in `routing-engine.md` as markdown guidance. The model read it and decided whether to follow it.

v2: Routing logic executes in three hooks:
- `prism_session_start.sh` (SessionStart event) - Insert Turn 1 contract
- `prism_inject_routing.sh` (UserPromptSubmit event) - Detect signals and activate persona
- `prism_check_attribution.py` (Stop event) - Measure drift (did response reflect the activated persona?)

Hooks run in the Claude Code harness, not in the model's token stream. No ambiguity.

### 2. signals.json - parsed routing rules

v1: Routing signals lived as markdown tables inside `routing-engine.md`. A human could read them; the model had to parse them.

v2: Signals are extracted to `src/routing/signals.json` with machine-readable structure. 301 signals parsed and categorized:

- War room (hard override: `"war_room"` triggers all 28 personas)
- Explicit names (hard override: `"Quinn"` triggers Quinn)
- Shared signals (activate multiple personas: `"refactor"` -> Amelia + Jobs + Musk)
- Specialist signals (single persona: `"root cause"` -> Dr. Quinn)
- Intent classification (domain + supporting roles: `"I'm stuck"` -> Mary + Dr. Quinn)

Hooks read `signals.json` directly. The model never parses signals - the harness does.

### 3. Routing engine reframing

v1: "This is guidance for her reasoning, not a rigid procedure." "Personas are advisory." Soft language inviting the model to interpret.

v2: "Runtime-enforced contract." "Mandatory." "Will execute." Hard language reflecting reality - hooks enforce routing, the model implements it.

The model still reads the routing engine for context and understanding. But the reading is different: it's reading the enforced contract, not optional guidance.

## Hook Flow Diagram

```
User sends message (every turn)
        |
        v
[UserPromptSubmit hook]
  read signals.json
  parse user message for:
    - war_room keyword
    - explicit persona names
    - shared signals (refactor, audit, etc.)
    - specialist signals (root cause, etc.)
    - intent classification
  activate persona(s)
  write to prism_routing_context.json
        |
        v
    [Claude model]
    read prism_routing_context.json
    write response in activated persona's voice
        |
        v
   [Stop hook]
   read prism_routing_context.json
   read response text
   compare voice match (drift detection)
   append event to prism_routing_events.jsonl
        |
        v
Response delivered to user
```

## Signal Detection and Routing

### War room (hard override)

```json
{
  "type": "hard_override",
  "name": "war_room",
  "trigger": "case-insensitive standalone phrase 'war room'",
  "effect": "load ALL 28 personas; Susie moderates"
}
```

Standalone means the phrase appears as its own token, not as a substring ("warehouse" does not match).

### Explicit names (hard override)

```json
{
  "type": "hard_override",
  "name": "explicit_persona",
  "trigger": "user says persona name (Quinn, Jobs, Mary, etc.)",
  "effect": "activate named persona; announce roster change"
}
```

Names are case-insensitive. "Quinn, validate this" activates Quinn.

### Shared signals (co-activate multiple personas)

```json
{
  "type": "shared_signal",
  "phrase": "refactor",
  "personas": ["Amelia", "Jobs", "Musk"],
  "context": "implementation + simplification + first-principles reduction"
}
```

Used when a work type naturally involves multiple perspectives. Example: "refactor" means implement (Amelia), simplify (Jobs), and cut (Musk).

### Specialist signals (single persona)

```json
{
  "type": "specialist_signal",
  "phrase": "root cause",
  "persona": "Dr. Quinn",
  "context": "Creative Problem Solver activates for diagnosis"
}
```

Used for domain-specific signals that clearly map to one expert.

### Intent classification (domain + supporting)

When no hard override or signal fires, the model classifies intent and activates primary + supporting personas:

```
Intent: "I'm stuck on this auth bug"
Classification: stuck + technical = Dr. Quinn (primary) + Mary (supporting investigation)
```

The intent classifier runs in the model (not in the hook) using the routing engine as guidance. Hooks enforce the classification via the activated persona's voice.

## settings.json Patch Model

v2 install patches `~/.claude/settings.json` to register hooks. The patch is idempotent and reversible.

### Patch structure

```json
{
  "_prism_v2_marker": "2026-04-30T00:00:00Z",
  "hooks": {
    "sessionStart": [
      { "name": "prism_session_start.sh", "path": "~/.claude/hooks/prism_session_start.sh" }
    ],
    "userPromptSubmit": [
      { "name": "prism_inject_routing.sh", "path": "~/.claude/hooks/prism_inject_routing.sh" }
    ],
    "stop": [
      { "name": "prism_check_attribution.py", "path": "~/.claude/hooks/prism_check_attribution.py" }
    ]
  }
}
```

### Idempotency

The marker `_prism_v2_marker` prevents duplicate registration on repeated installs. If the marker exists and timestamps match, the patch is skipped.

### Reversibility

`npx prism-forge uninstall` removes hook entries and the marker. settings.json is restored to pre-install state.

If settings.json is corrupted during patch, a backup `.bak` is created automatically.

## Manifest v2.0 Schema

```json
{
  "version": "2.0.0",
  "installed": "2026-04-30T00:00:00Z",
  "backup_dir": ".prism-backup/v1-2026-04-30/",
  "files": [
    {
      "path": "~/.claude/rules/prism/routing-engine.md",
      "hash": "sha256-abc123...",
      "version": "2.0.0"
    },
    ...
  ],
  "hooks": [
    {
      "name": "prism_session_start.sh",
      "path": "~/.claude/hooks/prism_session_start.sh",
      "event": "SessionStart",
      "hash": "sha256-def456..."
    },
    ...
  ],
  "settingsPatches": [
    {
      "file": "~/.claude/settings.json",
      "marker": "_prism_v2_marker",
      "applied": true,
      "reversible": true
    }
  ]
}
```

## Migration Mechanics

`lib/migrate-v1.js` handles v1 to v2 upgrade:

1. Detect v1.1.0 manifest
2. Read `prism-manifest.json` and `routing-engine.md`
3. Create backup directory: `.prism-backup/v1-{YYYY-MM-DD}/`
4. Copy all v1 files to backup (including user customizations in routing-engine.md)
5. Copy backup of `~/.claude/CLAUDE.md` to backup dir
6. Install v2 files (personas, routing engine, hooks)
7. Write manifest.json v2.0 schema
8. Patch settings.json
9. Log migration summary

If migration fails at any step, rollback: delete v2 files, restore from backup, exit with error.

## Drift Telemetry

### Event schema

Each Stop hook writes a drift event to `~/.claude/hooks/prism_routing_events.jsonl`:

```json
{
  "timestamp": "2026-04-30T14:23:45.123Z",
  "session_id": "session-abc123",
  "turn": 12,
  "message_length": 342,
  "is_substantive": true,
  "activated_personas": ["Dr. Quinn"],
  "response_length": 1024,
  "drift": false,
  "drift_reason": null,
  "model": "claude-opus-4.5"
}
```

`drift: true` means the activated persona's expected voice characteristics were not found in the response (analyzed via template matching or model classification).

`is_substantive` means the turn is longer than 200 chars or contains recommendation/judgment keywords. Only substantive turns count toward drift KPI.

### Reader API

`lib/routing-events.js` provides query helpers:

```javascript
import { readDriftEvents, filterSubstantive, calculateDriftRate } from './routing-events.js';

const events = readDriftEvents('~/.claude/hooks/prism_routing_events.jsonl');
const substantive = filterSubstantive(events);
const driftRate = calculateDriftRate(substantive);
console.log(`Drift: ${(driftRate * 100).toFixed(1)}%`);
```

### Canary CLI

`bin/prism-drift.js` is the user-facing CLI:

```bash
npx prism-forge drift --since=7                 # Last 7 days
npx prism-forge drift --since=7 --json          # JSON output for scripts
npx prism-forge drift --session=session-abc123  # Single session
npx prism-forge drift --drift-only              # Only drifting events
```

Output shows drift rate, top drifting personas, and summary stats.

## What's NOT in v2

### Template injection (parked for v2.1)

v2 activates personas via hooks but still relies on the model to implement the persona's voice. If drift remains above 20% after 1 week, v2.1 will add template injection - hooks will prepend persona-specific system prompt fragments to steer the model harder.

Template injection is not in v2 because:
- v2 hooks may be sufficient (empirical data pending)
- Template injection adds complexity (prompt fragmentation, token overhead)
- Better to measure drift first, then add injection if needed

See GITHUB-ISSUES for v2.1 planning.

### Per-turn persona override (parked)

Users cannot yet override hook decisions mid-session. "Actually, let's get Jobs on this" would require hook modification or manual message editing. v2 does not support this - it's reserved for v2.2.

### Custom signal registration (parked)

Users cannot add custom signals to signals.json yet. All signals are managed by the installed release. Custom signals are reserved for v2.2 after the core routing hook stabilizes.
