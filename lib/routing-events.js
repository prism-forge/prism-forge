import { appendFileSync, readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * Expand tilde in paths to the user's home directory.
 * @param {string} p - Path potentially starting with ~
 * @returns {string} Absolute path
 */
export function expandTilde(p) {
  if (p.startsWith('~')) {
    return join(homedir(), p.slice(1));
  }
  return p;
}

/**
 * Append a routing event to a JSONL file atomically.
 * @param {string} eventPath - Path to the JSONL file (absolute or tilde-prefixed)
 * @param {object} event - Event object to append
 * @throws {Error} If write fails
 */
export function appendEvent(eventPath, event) {
  const absPath = expandTilde(eventPath);
  const line = JSON.stringify(event) + '\n';
  appendFileSync(absPath, line, 'utf-8');
}

/**
 * Read routing events from a JSONL file with optional filtering.
 * @param {string} eventPath - Path to the JSONL file (absolute or tilde-prefixed)
 * @param {object} options - Filter options
 * @param {string} [options.sessionId] - Filter by session_id
 * @param {string} [options.since] - ISO8601 string; keep events where ts >= since
 * @param {number} [options.limit] - Return last N events
 * @returns {array} Array of parsed event objects
 */
export function readEvents(eventPath, options = {}) {
  const absPath = expandTilde(eventPath);

  if (!existsSync(absPath)) {
    return [];
  }

  let lines;
  try {
    const content = readFileSync(absPath, 'utf-8');
    lines = content.split('\n').filter(line => line.trim());
  } catch {
    return [];
  }

  let events = [];
  for (const line of lines) {
    try {
      events.push(JSON.parse(line));
    } catch {
      // Skip malformed JSON lines silently
    }
  }

  // Apply filters
  const { sessionId, since, limit } = options;

  if (sessionId) {
    events = events.filter(e => e.session_id === sessionId);
  }

  if (since) {
    events = events.filter(e => e.ts && e.ts >= since);
  }

  if (limit && limit > 0) {
    events = events.slice(-limit);
  }

  return events;
}

/**
 * Calculate drift rate and attribution metrics for events.
 * @param {string} eventPath - Path to the JSONL file
 * @param {object} options - Filter options
 * @param {string} [options.sessionId] - Filter by session_id
 * @param {string} [options.since] - ISO8601 string; include events where ts >= since
 * @returns {object} Metrics: { total, attributed, substantive, substantive_attributed, drift_pct_substantive }
 */
export function getDriftRate(eventPath, options = {}) {
  const events = readEvents(eventPath, options);

  if (events.length === 0) {
    return {
      total: 0,
      attributed: 0,
      substantive: 0,
      substantive_attributed: 0,
      drift_pct_substantive: 0,
    };
  }

  let attributed = 0;
  let substantive = 0;
  let substantive_attributed = 0;

  for (const event of events) {
    if (event.attributed) {
      attributed++;
    }
    if (event.substantive) {
      substantive++;
      if (event.attributed) {
        substantive_attributed++;
      }
    }
  }

  const drift_pct_substantive = substantive > 0
    ? ((substantive - substantive_attributed) / substantive) * 100
    : 0;

  return {
    total: events.length,
    attributed,
    substantive,
    substantive_attributed,
    drift_pct_substantive: Math.round(drift_pct_substantive * 100) / 100,
  };
}
