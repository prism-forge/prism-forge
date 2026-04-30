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

      // Check for duplicate by hash_prefix
      const existing = settings.hooks[type].find(e => e._prism_v2_marker === hook.hash_prefix);
      if (existing) {
        // Already installed, skip
        result.skipped_duplicates.push(hook.name);
        continue;
      }

      // Check for stale entry (different hash_prefix) - remove it
      const staleIdx = settings.hooks[type].findIndex(e => e._prism_v2_marker && e._prism_v2_marker !== hook.hash_prefix);
      if (staleIdx >= 0) {
        settings.hooks[type].splice(staleIdx, 1);
        result.removed.push(`${hook.name} (stale)`);
      }

      // Add new entry
      settings.hooks[type].push({
        type: 'command',
        command: cmd,
        timeout: 5,
        _prism_v2_marker: hook.hash_prefix,
      });
      result.added.push(hook.name);
      result.patched = true;
    }
  } else if (action === 'uninstall') {
    for (const hook of hooks) {
      const type = hook.type;
      if (!settings.hooks[type]) continue;

      const idx = settings.hooks[type].findIndex(e => e._prism_v2_marker);
      if (idx >= 0) {
        settings.hooks[type].splice(idx, 1);
        result.removed.push(hook.name);
        result.patched = true;
      }
    }
  }

  // Write back if patched
  if (result.patched) {
    writeSettingsAtomic(settingsPath || '~/.claude/settings.json', settings);
  }

  return result;
}
