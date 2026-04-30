#!/usr/bin/env python
"""Prism v2 routing injection on UserPromptSubmit.

Reads stdin JSON {prompt, cwd, transcript_path, ...}. Loads signals.json from
the installed location and runs a deterministic cascade:

  1. Hard override 1: 'war room' -> all 27 personas
  2. Hard override 2: explicit persona name -> activate as primary
  3. Signal scan: shared_signals + specialist_signals -> named team
  4. Intent classification: intent_keywords -> primary + supporting per intent
  5. Turn-1 detection: if no prior assistant turn in transcript -> Susie sitrep
  6. Drift fallback: prior turn was drift -> re-assert attribution
  7. Default fallback: no signal -> Susie holds floor (no-signal fallback)

Always emits a routing directive (no silent {} unless prompt is empty/unreadable).
Always exits 0 (fail-safe).
"""

import json
import os
import re
import sys
from pathlib import Path


SIGNALS_PATHS = [
    Path.home() / ".claude" / "rules" / "prism" / "routing" / "signals.json",
    Path(__file__).parent.parent / "routing" / "signals.json",
]
EVENTS_LOG = Path.home() / ".claude" / "hooks" / "prism_routing_events.jsonl"

ATTRIBUTION_REMINDER = (
    "All substantive turns require **Name (Role):** attribution on its own line."
)


def emit(directive):
    sys.stdout.write(json.dumps({"additionalContext": directive}))
    sys.exit(0)


def emit_silent():
    sys.stdout.write("{}")
    sys.exit(0)


def load_signals():
    for p in SIGNALS_PATHS:
        try:
            if p.exists():
                with open(p, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception:
            continue
    return None


def read_input():
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            return {}
        return json.loads(raw)
    except Exception:
        return {}


def check_drift():
    try:
        if not EVENTS_LOG.exists():
            return False
        with open(EVENTS_LOG, "r", encoding="utf-8") as f:
            lines = f.readlines()
        if not lines:
            return False
        last = json.loads(lines[-1])
        return bool(last.get("drift", False))
    except Exception:
        return False


def is_turn_one(transcript_path):
    """Return True if transcript exists and contains no prior assistant turn.
    Returns False if transcript_path is empty/missing - we cannot determine
    turn number, so do not force a Turn-1 directive."""
    try:
        if not transcript_path or not os.path.exists(transcript_path):
            return False
        with open(transcript_path, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    msg = json.loads(line)
                except Exception:
                    continue
                if msg.get("type") == "assistant":
                    return False
        return True
    except Exception:
        return False


def hard_override_war_room(prompt_lower):
    if re.search(r"\bwar room\b", prompt_lower):
        return (
            "ROUTING DIRECTIVE: 'war room' detected. Load ALL 27 personas. "
            "Susie moderates - draw out disagreement, every voice attributed. "
            + ATTRIBUTION_REMINDER
        )
    return None


def hard_override_persona_name(prompt_lower, signals):
    names = signals.get("hard_overrides", {}).get("explicit_names", {}).get("names", [])
    for name in names:
        pat = r"\b" + re.escape(name.lower()) + r"\b"
        if re.search(pat, prompt_lower):
            return (
                f"ROUTING DIRECTIVE: User named '{name.title()}' explicitly. "
                f"Activate as primary persona, announce roster change. "
                + ATTRIBUTION_REMINDER
            )
    return None


def signal_scan(prompt_lower, signals):
    activated = []
    seen = set()

    def add(personas, phrase):
        for p in personas:
            key = p.lower()
            if key not in seen:
                seen.add(key)
                activated.append((p, phrase))

    for entry in signals.get("shared_signals", []):
        phrase = entry.get("phrase", "").lower()
        if not phrase:
            continue
        pat = r"\b" + re.escape(phrase) + r"\b"
        if re.search(pat, prompt_lower):
            add(entry.get("activates", []), phrase)

    for entry in signals.get("specialist_signals", []):
        phrase = entry.get("phrase", "").lower()
        if not phrase:
            continue
        pat = r"\b" + re.escape(phrase) + r"\b"
        if re.search(pat, prompt_lower):
            primary = entry.get("primary")
            if primary:
                add([primary], phrase)

    if not activated:
        return None

    team = ", ".join(p for p, _ in activated[:6])
    phrases = ", ".join(sorted({ph for _, ph in activated[:6]}))
    return (
        f"ROUTING DIRECTIVE: Signals matched ({phrases}). "
        f"Susie assembles team: {team}. Primary leads, supporting personas "
        f"contribute attributed sections. " + ATTRIBUTION_REMINDER
    )


def intent_scan(prompt_lower, signals):
    """Match prompt against intent_keywords -> emit intent's persona team."""
    keywords = signals.get("intent_keywords", {})
    intent_classification = signals.get("intent_classification", [])
    if not keywords or not intent_classification:
        return None

    intent_map = {entry.get("intent"): entry for entry in intent_classification}
    # Add a refactor pseudo-intent that maps to challenge personas
    intent_map.setdefault(
        "refactor",
        {"intent": "refactor", "primary": ["Jobs", "Musk"], "supporting": ["Amelia"]},
    )

    matched_intent = None
    matched_phrase = None
    for intent, phrases in keywords.items():
        for phrase in phrases:
            phrase_lower = phrase.lower()
            pat = r"\b" + re.escape(phrase_lower) + r"\b"
            if re.search(pat, prompt_lower):
                matched_intent = intent
                matched_phrase = phrase
                break
        if matched_intent:
            break

    if not matched_intent:
        return None

    entry = intent_map.get(matched_intent)
    if not entry:
        return None

    primary = entry.get("primary")
    if isinstance(primary, list):
        primary_names = ", ".join(primary)
    else:
        primary_names = str(primary)

    supporting = entry.get("supporting", [])
    supp_str = ", ".join(supporting) if supporting else ""

    team = primary_names + (f" (supporting: {supp_str})" if supp_str else "")
    return (
        f"ROUTING DIRECTIVE: Intent classified as '{matched_intent}' "
        f"(matched phrase: '{matched_phrase}'). Activate {team}. "
        f"Primary leads. " + ATTRIBUTION_REMINDER
    )


def turn_one_directive():
    return (
        "ROUTING DIRECTIVE: Turn 1 of session. **Susie (Chief of Staff)** "
        "delivers unconditional sitrep before any task: read todo, memory, "
        "handoffs, git state. Format: Active / Blocked / Stale / Recommended. "
        "Then hand off to appropriate persona. " + ATTRIBUTION_REMINDER
    )


def drift_directive():
    return (
        "ROUTING DIRECTIVE: Prior turn drift (substantive without attribution). "
        "Susie re-asserts: " + ATTRIBUTION_REMINDER
    )


def fallback_directive():
    return (
        "ROUTING DIRECTIVE: No specific signal. **Susie (Chief of Staff)** "
        "holds floor as no-signal fallback per routing engine. "
        + ATTRIBUTION_REMINDER
    )


def main():
    data = read_input()
    prompt = str(data.get("prompt", ""))
    transcript_path = data.get("transcript_path", "")

    if not prompt:
        emit_silent()

    prompt_lower = prompt.lower()
    signals = load_signals()

    if not signals:
        # Minimal fallback if signals.json is missing
        if "war room" in prompt_lower:
            emit("ROUTING DIRECTIVE: 'war room'. Load ALL 27 personas. " + ATTRIBUTION_REMINDER)
        emit(fallback_directive())

    # Cascade
    for fn in (
        lambda: hard_override_war_room(prompt_lower),
        lambda: hard_override_persona_name(prompt_lower, signals),
        lambda: signal_scan(prompt_lower, signals),
        lambda: intent_scan(prompt_lower, signals),
    ):
        result = fn()
        if result:
            emit(result)

    # Turn 1 wins over drift fallback
    if is_turn_one(transcript_path):
        emit(turn_one_directive())

    if check_drift():
        emit(drift_directive())

    emit(fallback_directive())


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception:
        sys.stdout.write("{}")
        sys.exit(0)
