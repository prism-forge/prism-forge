import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readSettings, writeSettingsAtomic, patchSettings } from '../lib/settings-patch.js';

describe('settings-patch', () => {
  let tmpDir;

  before(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'prism-test-'));
  });

  after(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('Install from empty', () => {
    it('creates settings.json with prism hook entries when file missing', () => {
      const settingsPath = join(tmpDir, 'settings-empty.json');
      assert.equal(existsSync(settingsPath), false, 'Test setup: file should not exist');

      const hooks = [
        {
          name: 'prism_session_start.sh',
          type: 'SessionStart',
          extType: 'sh',
          hash: 'abc123def456',
          hash_prefix: 'abc123de',
          installed_path: '/home/test/.claude/hooks/prism_session_start.sh',
        },
      ];

      const result = patchSettings({
        action: 'install',
        hooks,
        settingsPath,
      });

      assert.equal(result.patched, true);
      assert.equal(result.added.length, 1);
      assert.equal(result.added[0], 'prism_session_start.sh');
      assert.equal(existsSync(settingsPath), true, 'settings.json should be created');

      const settings = readSettings(settingsPath);
      assert.ok(settings.hooks, 'hooks object should exist');
      assert.ok(settings.hooks.SessionStart, 'SessionStart hook array should exist');
      assert.equal(settings.hooks.SessionStart.length, 1);
      assert.ok(settings.hooks.SessionStart[0].hooks, 'Entry should have nested hooks array');
      assert.equal(settings.hooks.SessionStart[0].hooks[0]._prism_v2_marker, 'abc123de');
    });
  });

  describe('Install idempotent', () => {
    it('skips duplicate installs based on hash_prefix', () => {
      const settingsPath = join(tmpDir, 'settings-idempotent.json');

      const hooks = [
        {
          name: 'prism_session_start.sh',
          type: 'SessionStart',
          extType: 'sh',
          hash: 'abc123def456',
          hash_prefix: 'abc123de',
          installed_path: '/home/test/.claude/hooks/prism_session_start.sh',
        },
      ];

      // First install
      let result = patchSettings({
        action: 'install',
        hooks,
        settingsPath,
      });
      assert.equal(result.patched, true);
      assert.equal(result.added.length, 1);

      // Second install (idempotent)
      result = patchSettings({
        action: 'install',
        hooks,
        settingsPath,
      });
      assert.equal(result.patched, false);
      assert.equal(result.skipped_duplicates.length, 1);
      assert.equal(result.skipped_duplicates[0], 'prism_session_start.sh');
      assert.equal(result.added.length, 0);

      // Verify file is identical
      const settings = readSettings(settingsPath);
      assert.equal(settings.hooks.SessionStart.length, 1);
    });
  });

  describe('Install upgrade case', () => {
    it('allows multiple prism hooks coexist; full upgrade handled via uninstall+reinstall', () => {
      const settingsPath = join(tmpDir, 'settings-upgrade.json');

      const oldHook = {
        name: 'prism_session_start.sh',
        type: 'SessionStart',
        extType: 'sh',
        hash: 'oldoldold1234',
        hash_prefix: 'oldoldol',
        installed_path: '/home/test/.claude/hooks/prism_session_start.sh',
      };

      const newHook = {
        name: 'prism_session_start.sh',
        type: 'SessionStart',
        extType: 'sh',
        hash: 'newhash1234567',
        hash_prefix: 'newhash1',
        installed_path: '/home/test/.claude/hooks/prism_session_start.sh',
      };

      // Install old version
      let result = patchSettings({
        action: 'install',
        hooks: [oldHook],
        settingsPath,
      });
      assert.equal(result.added.length, 1);

      // Install new version (no stale removal - both coexist)
      result = patchSettings({
        action: 'install',
        hooks: [newHook],
        settingsPath,
      });
      // New version added, old not removed during install
      assert.equal(result.added.length, 1);
      assert.equal(result.removed.length, 0, 'Old entry not auto-removed during install');

      let settings = readSettings(settingsPath);
      assert.equal(settings.hooks.SessionStart.length, 2, 'Both old and new should coexist');

      // Full uninstall removes all prism entries (including both old and new)
      result = patchSettings({
        action: 'uninstall',
        hooks: [oldHook, newHook],  // Uninstall both to completely remove prism hooks
        settingsPath,
      });
      // Each hook in the uninstall list removes all entries with markers (batch remove)
      assert.equal(result.removed.length >= 2, true, 'Both old and new entries removed');

      settings = readSettings(settingsPath);
      assert.equal(settings.hooks.SessionStart.length, 0, 'Should have no entries after full uninstall');
    });
  });

  describe('Install preserves other hooks', () => {
    it('keeps user hooks intact when installing prism hooks', () => {
      const settingsPath = join(tmpDir, 'settings-preserve.json');

      // Create settings with user's own hooks (proper nested structure)
      const userSettings = {
        hooks: {
          SessionStart: [
            {
              hooks: [
                {
                  type: 'command',
                  command: 'bash "/usr/local/bin/my-custom-hook.sh"',
                  timeout: 10,
                }
              ],
            },
          ],
        },
      };
      writeFileSync(settingsPath, JSON.stringify(userSettings, null, 2) + '\n', 'utf-8');

      const prismHook = {
        name: 'prism_session_start.sh',
        type: 'SessionStart',
        extType: 'sh',
        hash: 'abc123def456',
        hash_prefix: 'abc123de',
        installed_path: '/home/test/.claude/hooks/prism_session_start.sh',
      };

      const result = patchSettings({
        action: 'install',
        hooks: [prismHook],
        settingsPath,
      });

      assert.equal(result.patched, true);

      const settings = readSettings(settingsPath);
      assert.equal(settings.hooks.SessionStart.length, 2, 'Should have 2 entries (user + prism)');
      assert.equal(settings.hooks.SessionStart[0].hooks[0].command.includes('my-custom-hook'), true);
      assert.ok(settings.hooks.SessionStart[1].hooks, 'Prism entry should have nested hooks array');
      assert.equal(settings.hooks.SessionStart[1].hooks[0]._prism_v2_marker, 'abc123de');
    });
  });

  describe('Uninstall removes only prism entries', () => {
    it('uninstalls all prism entries while preserving user hooks', () => {
      const settingsPath = join(tmpDir, 'settings-uninstall.json');

      // Setup: install prism hooks alongside user hooks (proper nested structure)
      const userSettings = {
        hooks: {
          SessionStart: [
            {
              hooks: [
                {
                  type: 'command',
                  command: 'bash "/usr/local/bin/user-hook.sh"',
                  timeout: 10,
                }
              ],
            },
          ],
        },
      };
      writeFileSync(settingsPath, JSON.stringify(userSettings, null, 2) + '\n', 'utf-8');

      const prismHooks = [
        {
          name: 'prism_session_start.sh',
          type: 'SessionStart',
          extType: 'sh',
          hash: 'abc123def456',
          hash_prefix: 'abc123de',
          installed_path: '/home/test/.claude/hooks/prism_session_start.sh',
        },
      ];

      // Install prism
      patchSettings({
        action: 'install',
        hooks: prismHooks,
        settingsPath,
      });

      // Verify prism is there
      let settings = readSettings(settingsPath);
      assert.equal(settings.hooks.SessionStart.length, 2);

      // Uninstall
      const result = patchSettings({
        action: 'uninstall',
        hooks: prismHooks,
        settingsPath,
      });

      assert.equal(result.patched, true);
      assert.equal(result.removed.length, 1);

      // Verify user hook remains, prism hook gone
      settings = readSettings(settingsPath);
      assert.equal(settings.hooks.SessionStart.length, 1);
      assert.equal(settings.hooks.SessionStart[0].hooks[0].command.includes('user-hook'), true);
    });
  });

  describe('Uninstall leaves empty arrays', () => {
    it('leaves hook type array as empty [] when all entries removed', () => {
      const settingsPath = join(tmpDir, 'settings-empty-array.json');

      const prismHooks = [
        {
          name: 'prism_session_start.sh',
          type: 'SessionStart',
          extType: 'sh',
          hash: 'abc123def456',
          hash_prefix: 'abc123de',
          installed_path: '/home/test/.claude/hooks/prism_session_start.sh',
        },
      ];

      // Install
      patchSettings({
        action: 'install',
        hooks: prismHooks,
        settingsPath,
      });

      // Uninstall
      patchSettings({
        action: 'uninstall',
        hooks: prismHooks,
        settingsPath,
      });

      const settings = readSettings(settingsPath);
      // After uninstall, SessionStart should be an empty array
      assert.ok(Array.isArray(settings.hooks.SessionStart));
      assert.equal(settings.hooks.SessionStart.length, 0);
    });
  });

  describe('Atomic write', () => {
    it('uses tmp + rename pattern for atomic writes', () => {
      const settingsPath = join(tmpDir, 'settings-atomic.json');
      const testData = { hooks: { Test: [] }, other: 'data' };

      writeSettingsAtomic(settingsPath, testData);

      // Verify main file exists
      assert.equal(existsSync(settingsPath), true);

      // Verify tmp file does NOT remain
      const tmpPath = settingsPath + '.tmp';
      assert.equal(existsSync(tmpPath), false, 'Tmp file should not exist after atomic write');

      // Verify content is correct
      const content = readFileSync(settingsPath, 'utf-8');
      const parsed = JSON.parse(content);
      assert.deepEqual(parsed, testData);
    });
  });
});
