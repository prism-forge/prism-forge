#!/usr/bin/env python
# Prism v2 attribution checker (Stop hook)
#
# Reads stdin JSON {transcript_path, session_id, hook_event_name, ...}.
# Opens transcript JSONL, finds last assistant message, and:
#   1. Length-classifies: substantive if >200 chars OR contains recommendations/options/numbered lists/code
#   2. Regex-scans for attribution pattern: **[A-Z][a-zA-Z. ]+ ([A-Za-z ]+):**
#   3. Appends event to ~/.claude/hooks/prism_routing_events.jsonl
#
# Drift = substantive AND NOT attributed.
# Always exit 0. All exceptions caught (fail-safe).

import json
import re
import sys
import os
from datetime import datetime
from pathlib import Path

def main():
    try:
        # Read stdin
        input_str = sys.stdin.read()
        if not input_str.strip():
            input_data = {}
        else:
            input_data = json.loads(input_str)
    except Exception:
        input_data = {}

    try:
        transcript_path = input_data.get("transcript_path", "")
        session_id = input_data.get("session_id", "unknown")
        hook_event_name = input_data.get("hook_event_name", "Stop")

        if not transcript_path or not os.path.exists(transcript_path):
            # No transcript; log and exit
            _log_event(session_id, 0, False, None, 0, False, False, "no_transcript")
            return

        # Read transcript JSONL and find last assistant message
        last_message_text = ""
        turn_count = 0
        try:
            with open(transcript_path, 'r', encoding='utf-8') as f:
                for line in f:
                    if not line.strip():
                        continue
                    try:
                        msg = json.loads(line)
                    except Exception:
                        continue
                    if msg.get("type") != "assistant":
                        continue
                    content = msg.get("message", {}).get("content", "")
                    if isinstance(content, list):
                        text = " ".join(
                            c.get("text", "") for c in content
                            if isinstance(c, dict) and c.get("type") == "text"
                        )
                    elif isinstance(content, str):
                        text = content
                    else:
                        text = ""
                    if not text.strip():
                        continue
                    last_message_text = text
                    turn_count += 1
        except Exception:
            _log_event(session_id, 0, False, None, 0, False, False, "transcript_read_error")
            return

        if not last_message_text:
            _log_event(session_id, turn_count, False, None, 0, False, False, "no_assistant_message")
            return

        # Length-classify: substantive?
        msg_len = len(last_message_text)
        is_substantive = (
            msg_len > 200 or
            re.search(r"\b(recommend|should|would|option|path)\b", last_message_text, re.IGNORECASE) or
            re.search(r"^\d+\.", last_message_text, re.MULTILINE) or
            "```" in last_message_text
        )

        # Regex scan for attribution: **[Name] (Role):**
        attribution_pattern = r"\*\*[A-Z][a-zA-Z. ]+ \([A-Za-z ]+\):\*\*"
        is_attributed = bool(re.search(attribution_pattern, last_message_text))

        # Extract persona name if attributed
        persona_detected = None
        if is_attributed:
            match = re.search(attribution_pattern, last_message_text)
            if match:
                # Extract name from **Name (Role):**
                attr_text = match.group(0)
                # Remove ** and extract before (
                persona_detected = re.sub(r'\*\*|\s*\([^)]*\):\*\*', '', attr_text).strip()

        # Compute drift
        is_drift = is_substantive and not is_attributed

        # Determine reason
        if is_drift:
            reason = "substantive_unattributed"
        elif is_substantive and is_attributed:
            reason = "substantive_attributed"
        elif not is_substantive:
            reason = "trivial"
        else:
            reason = "unknown"

        # Log the event
        _log_event(
            session_id,
            turn_count,
            is_attributed,
            persona_detected,
            msg_len,
            is_substantive,
            is_drift,
            reason
        )

    except Exception:
        # Comprehensive fail-safe: catch everything, log with minimal info, exit clean
        try:
            _log_event("unknown", 0, False, None, 0, False, False, "exception")
        except Exception:
            pass

    sys.exit(0)


def _log_event(session_id, turn_idx, attributed, persona_detected, response_length, substantive, drift, reason):
    """Append JSONL event to prism_routing_events.jsonl"""
    try:
        events_file = os.path.expanduser("~/.claude/hooks/prism_routing_events.jsonl")
        os.makedirs(os.path.dirname(events_file), exist_ok=True)

        event = {
            "ts": datetime.utcnow().isoformat() + "Z",
            "session_id": session_id,
            "turn_idx": turn_idx,
            "attributed": attributed,
            "persona_detected": persona_detected,
            "response_length": response_length,
            "substantive": substantive,
            "drift": drift,
            "reason": reason
        }

        with open(events_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(event) + '\n')
    except Exception:
        # Fail silently
        pass


if __name__ == "__main__":
    main()
