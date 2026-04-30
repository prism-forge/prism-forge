# Migrating from v1.1.0 to v2.0.0

PRISM Forge v2.0 introduces runtime enforcement of persona routing via hooks. Installation and routing behavior both change with this release.

## What Changed

v1.1.0 shipped personas and routing engine as markdown configuration files injected into `~/.claude/CLAUDE.md`. The routing engine was advisory - a guide for how the model should behave, with no active enforcement.

v2.0.0 adds three hook scripts that enforce routing at runtime:

- **SessionStart hook** - Injects Turn 1 routing contract into every session
- **UserPromptSubmit hook** - Activates persona based on detected signals (war room, names, shared signals, specialist signals, intent classification)
- **Stop hook** - Logs attribution drift events to measure persona accuracy

This means routing now runs in the Claude Code harness, not in the model's reasoning. The routing engine evolves from advisory text to a runtime-enforced contract.

## Automatic Migration Steps

Running `npx prism-forge install` on a v1.1.0 system automatically:

1. Detects manifest version and triggers migration flow
2. Backs up v1 files to `.prism-backup/v1-{YYYY-MM-DD}/`
3. Installs v2 personas and routing engine to `~/.claude/rules/prism/`
4. Writes manifest.json v2.0 schema with hooks and settings entries
5. Patches `~/.claude/settings.json` with hook registration
6. Copies three hook scripts to `~/.claude/hooks/`
7. Logs migration summary to console

No user action required.

## What Gets Backed Up

The `.prism-backup/v1-{YYYY-MM-DD}/` directory contains:

```
v1-{date}/
  manifest.json              (v1.1.0 manifest)
  routing-engine.md          (your version, including any customizations)
  persona-*.md               (all 23 or 28 persona files from v1)
  CLAUDE.md-backup           (copy of ~/.claude/CLAUDE.md before upgrade)
```

This allows rollback or manual inspection if needed.

## Manual Rollback to v1.1.0

If v2 causes issues, you can revert:

```bash
# Uninstall v2
npx prism-forge uninstall

# Restore v1 files from backup
cp -r .prism-backup/v1-{YYYY-MM-DD}/* ~/.claude/rules/prism/

# Reinstall npm package
npm uninstall -g prism-forge
npm install -g prism-forge@1.1.0
```

Then start a new Claude Code session. Your session environment will revert to v1 behavior.

## Verification Commands

After migration, verify the installation:

```bash
# Structural audit (same as v1)
npx prism-forge verify

# NEW: Check drift baseline
npx prism-forge verify --drift

# NEW: Measure drift over the last N days
npx prism-forge drift --since=7
```

For scripting or dashboards, use JSON output:

```bash
npx prism-forge drift --since=7 --json
```

## Drift Baseline and Target

**Pre-v2 baseline (4,583 turns / 401 sessions):**
- 99.7% of substantive turns showed drift (persona activated by signal but response did not reflect persona's voice)
- Root cause: no runtime enforcement; routing lived in CLAUDE.md as advisory text

**v2 target:**
- Less than 20% drift on substantive turns within 1 week of v2 install
- Metric: `substantive_turns` with drift=true divided by total substantive turns
- Measured via `prism_routing_events.jsonl` event log created by Stop hook

## Troubleshooting

### settings.json malformed after patch

If `~/.claude/settings.json` becomes invalid JSON, installation halts with an error. Rollback:

```bash
# Restore from backup
cp ~/.claude/settings.json.bak ~/.claude/settings.json

# Retry install
npx prism-forge install
```

### Hooks not firing

Verify hook registration in settings.json:

```bash
cat ~/.claude/settings.json | grep -A 5 prism
```

You should see entries for `prism_session_start.sh`, `prism_inject_routing.sh`, and `prism_check_attribution.py` in the hooks section.

If hooks are missing, re-run install:

```bash
npx prism-forge install
```

### Drift staying above 20% after v2 install

If drift remains high 1 week after v2 install:

1. Run diagnostic: `npx prism-forge drift --since=7 --json | head -20`
2. Check which turns are drifting (signal fired but persona response didn't reflect it)
3. This may indicate hook signal parsing edge cases or model steering issues
4. Escalate to v2.1 (template injection support) - file an issue on GitHub

See docs/v2-architecture.md for deeper technical details on drift measurement and event schema.
