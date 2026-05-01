import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOOK = path.resolve(__dirname, '..', 'src', 'hooks', 'prism_check_attribution.py');
const EVENTS_LOG = path.join(os.homedir(), '.claude', 'hooks', 'prism_routing_events.jsonl');

// Create a temporary transcript file with given messages
function createTranscript(messages) {
  const tmpFile = path.join(os.tmpdir(), `prism-test-${Date.now()}.jsonl`);
  const lines = messages.map(m => JSON.stringify(m)).join('\n');
  fs.writeFileSync(tmpFile, lines + '\n');
  return tmpFile;
}

function invoke(transcript_path) {
  const input = JSON.stringify({ transcript_path, session_id: 'test-session', hook_event_name: 'Stop' });
  const r = spawnSync('python', [HOOK], { input, encoding: 'utf-8' });
  if (r.status !== 0) {
    throw new Error(`hook exited ${r.status}: ${r.stderr}`);
  }
  return r.stdout;
}

// Read events from prism_routing_events.jsonl
function readLatestEvent() {
  const eventsFile = path.join(os.homedir(), '.claude', 'hooks', 'prism_routing_events.jsonl');
  try {
    const content = fs.readFileSync(eventsFile, 'utf-8');
    const lines = content.trim().split('\n');
    return JSON.parse(lines[lines.length - 1]);
  } catch {
    return null;
  }
}

// Read the announced_unspoken event if it exists, else return latest
function readAnnouncedUnspokenEvent() {
  const eventsFile = path.join(os.homedir(), '.claude', 'hooks', 'prism_routing_events.jsonl');
  try {
    const content = fs.readFileSync(eventsFile, 'utf-8');
    const lines = content.trim().split('\n');
    // Search backwards for announced_unspoken reason
    for (let i = lines.length - 1; i >= 0; i--) {
      const event = JSON.parse(lines[i]);
      if (event.reason === 'announced_unspoken') {
        return event;
      }
    }
    return null;
  } catch {
    return null;
  }
}

describe('announced-unspoken team assembly drift', () => {
  // Truncate events log before each test to isolate drift detection
  beforeEach(() => {
    try {
      if (fs.existsSync(EVENTS_LOG)) {
        fs.unlinkSync(EVENTS_LOG);
      }
    } catch {
      // Ignore cleanup errors
    }
  });
  describe('no drift: all announced personas speak', () => {
    it('roster of 3, all 3 attribute - no announced_unspoken event', () => {
      const transcript = createTranscript([
        {
          type: 'user',
          message: { content: 'set up a test' }
        },
        {
          type: 'assistant',
          message: {
            content: '**Mary (Analyst)**, **Jobs (Combinatorial Genius)**, and **Amelia (Developer Agent)** are in the room.\n\n**Mary (Analyst):**\nLet me analyze the structure comprehensively with detailed reasoning about all the aspects we need to consider here.\n\n**Jobs (Combinatorial Genius):**\nWe should simplify the approach by eliminating redundancy and focusing on the core insight that matters most.\n\n**Amelia (Developer Agent):**\nI will implement the solution using the best practices and patterns available to us for this kind of work.'
          }
        }
      ]);

      invoke(transcript);
      const event = readLatestEvent();

      // Should not have announced_unspoken reason
      assert.notEqual(event.reason, 'announced_unspoken');

      fs.unlinkSync(transcript);
    });
  });

  describe('drift: announced personas do not speak', () => {
    it('roster of 3, only 2 attribute - announced_unspoken event logged', () => {
      const transcript = createTranscript([
        {
          type: 'user',
          message: { content: 'set up a test' }
        },
        {
          type: 'assistant',
          message: {
            content: '**Mary (Analyst)**, **Jobs (Combinatorial Genius)**, and **Amelia (Developer Agent)** are in the room.\n\n**Mary (Analyst):**\nLet me analyze the structure comprehensively. I see several patterns here that need careful examination and detailed explanation. This is a substantive analysis with multiple dimensions worth considering.\n\n**Jobs (Combinatorial Genius):**\nWe should simplify the approach by eliminating redundancy and focusing on the core insight.\n\nAmelia is here but I will not draw her out to contribute.'
          }
        }
      ]);

      invoke(transcript);
      const event = readAnnouncedUnspokenEvent();

      // Should have announced_unspoken reason
      assert.ok(event, 'announced_unspoken event should be logged');
      assert.equal(event.reason, 'announced_unspoken');
      assert.ok(event.unspoken, 'event should have unspoken list');
      assert.ok(event.unspoken.includes('Amelia'), 'Amelia should be listed as unspoken');

      fs.unlinkSync(transcript);
    });
  });

  describe('Mary announces and attributes', () => {
    it('Mary in the room and speaks - no drift', () => {
      const transcript = createTranscript([
        {
          type: 'user',
          message: { content: 'analyze this' }
        },
        {
          type: 'assistant',
          message: {
            content: '**Mary (Analyst)** is in the room.\n\n**Mary (Analyst):**\nI have analyzed the problem thoroughly and found three key insights worth noting.'
          }
        }
      ]);

      invoke(transcript);
      const event = readLatestEvent();

      assert.notEqual(event.reason, 'announced_unspoken');

      fs.unlinkSync(transcript);
    });
  });

  describe('Leonardo announces without speaking', () => {
    it('Leonardo in the room but no attribution - announced_unspoken drift', () => {
      const transcript = createTranscript([
        {
          type: 'user',
          message: { content: 'map the system' }
        },
        {
          type: 'assistant',
          message: {
            content: '**Leonardo (Renaissance Polymath)** is in the room.\n\nThis is a comprehensive analysis that is well over 200 characters long and covers multiple important dimensions of the system architecture and how different components interact across the full ecosystem. But I will not draw Leonardo out to contribute his unique perspective on cross-system connections and how these systems relate to each other.'
          }
        }
      ]);

      invoke(transcript);
      const event = readAnnouncedUnspokenEvent();

      assert.ok(event, 'announced_unspoken event should be logged');
      assert.equal(event.reason, 'announced_unspoken');
      assert.ok(event.unspoken.includes('Leonardo'), 'Leonardo should be listed as unspoken');

      fs.unlinkSync(transcript);
    });
  });

  describe('no roster announced, attribution blocks only', () => {
    it('attribution present, no roster announcement - no announced_unspoken event', () => {
      const transcript = createTranscript([
        {
          type: 'user',
          message: { content: 'build the feature' }
        },
        {
          type: 'assistant',
          message: {
            content: '**Amelia (Developer Agent):**\nI will implement this feature by creating the necessary files and tests.'
          }
        }
      ]);

      invoke(transcript);
      const event = readLatestEvent();

      // No announced_unspoken because there was no roster announcement
      assert.notEqual(event.reason, 'announced_unspoken');

      fs.unlinkSync(transcript);
    });
  });
});
