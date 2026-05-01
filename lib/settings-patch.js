import { readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { expandTilde } from './routing-events.js';

/**
 * Read and parse settings.json file.
 * @param {string} [settingsPath] - Path to settings.json (defaults to ~/.claude/settings.json)
 * @returns {object} Parsed settings or empty object if file missing
 */
export function readSettings(settingsPath) {
  const absPath = expandTilde(settingsPath || '~/.claude/settings.json');
  if (!existsSync(absPath)) {
    return {};
  }
  try {
    const content = readFileSync(absPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

/**
 * Write settings.json atomically (tmp file + rename).
 * @param {string} settingsPath - Path to settings.json
 * @param {object} settings - Settings object to write
 * @throws {Error} If atomic write fails
 */
export function writeSettingsAtomic(settingsPath, settings) {
  const absPath = expandTilde(settingsPath);
  const tmpPath = absPath + '.tmp';

  // Write to tmp file first
  writeFileSync(tmpPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');

  // Atomic rename
  renameSync(tmpPath, absPath);
}

/**
 * Extract normalized script basename from command string (without extension).
 * E.g., `/path/to/prism_inject_routing.py` → `prism_inject_routing`
 * E.g., `/path/to/prism_inject_routing.sh` → `prism_inject_routing`
 * This normalizes .sh and .py versions to the same basename.
 * @param {string} command - Command string
 * @returns {string|null} Normalized script basename or null if not a prism script
 */
function extractScriptBasename(command) {
  const match = command.match(/prism_\w+/);
  return match ? match[0] : null;
}

/**
 * Patch settings.json with hook entries (install or uninstall).
 * @param {object} options - Patch options
 * @param {string} options.action - 'install' or 'uninstall'
 * @param {array} options.hooks - Array of hook manifest entries (from installHooks)
 * @param {string} [options.settingsPath] - Path to settings.json (defaults to ~/.claude/settings.json)
 * @returns {object} Result: { patched: bool, added: [], removed: [], skipped_duplicates: [] }
 * @throws {Error} If action invalid or write fails
 */
export function patchSettings(options = {}) {
  const { action, hooks = [], settingsPath } = options;

  if (!['install', 'uninstall'].includes(action)) {
    throw new Error(`Invalid action: ${action}. Must be 'install' or 'uninstall'.`);
  }

  const settings = readSettings(settingsPath);

  // Ensure hooks object and per-type arrays exist
  if (!settings.hooks) {
    settings.hooks = {};
  }

  const result = {
    patched: false,
    added: [],
    removed: [],
    skipped_duplicates: [],
  };

  if (action === 'install') {
    for (const hook of hooks) {
      const type = hook.type;
      if (!settings.hooks[type]) {
        settings.hooks[type] = [];
      }

      // Build command string (python NOT python3)
      const cmd = hook.extType === 'py'
        ? `python "${hook.installed_path}"`
        : `bash "${hook.installed_path}"`;

      const newBasename = extractScriptBasename(cmd);

      // Check for duplicate by script basename
      // Dedup by basename handles: version bumps (different markers, same script)
      // and .sh→.py migrations (both should be recognized as the same logical hook)
      let foundExisting = false;
      let existingIdx = -1;

      if (newBasename) {
        existingIdx = settings.hooks[type].findIndex(e => {
          const existingCmd = e.hooks?.[0]?.command;
          if (!existingCmd) return false;
          const existingBasename = extractScriptBasename(existingCmd);
          return existingBasename === newBasename;
        });

        if (existingIdx >= 0) {
          const existing = settings.hooks[type][existingIdx];
          const existingCmd = existing.hooks[0].command;
          const newBasenameNoExt = newBasename.replace(/\.(?:py|sh)$/, '');

          // If exact same command and marker: no-op (true duplicate)
          if (existingCmd === cmd && existing.hooks[0]._prism_v2_marker === hook.hash_prefix) {
            result.skipped_duplicates.push(hook.name);
            foundExisting = true;
          } else {
            // Different marker or command: replace the entry (version bump or migration)
            settings.hooks[type][existingIdx] = {
              hooks: [
                {
                  type: 'command',
                  command: cmd,
                  timeout: 5,
                  _prism_v2_marker: hook.hash_prefix,
                }
              ]
            };
            result.added.push(hook.name);
            result.patched = true;
            foundExisting = true;
          }
        }
      }

      if (foundExisting) {
        continue;
      }

      // Check for malformed flat entries (legacy bad installs with top-level _prism_v2_marker)
      // Remove any flat entry with a prism marker on first install of ANY hook in this type
      const malformedIdx = settings.hooks[type].findIndex(e => e._prism_v2_marker);
      if (malformedIdx >= 0) {
        settings.hooks[type].splice(malformedIdx, 1);
        result.removed.push(`malformed flat entry (stale)`);
      }

      // Add new entry with properly nested structure
      settings.hooks[type].push({
        hooks: [
          {
            type: 'command',
            command: cmd,
            timeout: 5,
            _prism_v2_marker: hook.hash_prefix,
          }
        ]
      });
      result.added.push(hook.name);
      result.patched = true;
    }
  } else if (action === 'uninstall') {
    for (const hook of hooks) {
      const type = hook.type;
      if (!settings.hooks[type]) continue;

      // Remove entries where ANY inner hook has a prism marker
      // Also remove malformed flat entries (top-level _prism_v2_marker) to clean up
      settings.hooks[type] = settings.hooks[type].filter(e => {
        const hasInnerPrismMarker = e.hooks?.some(h => h._prism_v2_marker);
        const hasTopLevelPrismMarker = e._prism_v2_marker;
        const shouldRemove = hasInnerPrismMarker || hasTopLevelPrismMarker;
        if (shouldRemove) {
          result.removed.push(hook.name);
          result.patched = true;
        }
        return !shouldRemove;
      });
    }
  }

  // Write back if patched
  if (result.patched) {
    writeSettingsAtomic(settingsPath || '~/.claude/settings.json', settings);
  }

  return result;
}
