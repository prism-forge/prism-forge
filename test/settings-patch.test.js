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
    it('version bump replaces old entry with new entry (dedup by basename)', () => {
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

      let settings = readSettings(settingsPath);
      assert.equal(settings.hooks.SessionStart.length, 1);
      assert.equal(settings.hooks.SessionStart[0].hooks[0]._prism_v2_marker, 'oldoldol');

      // Install new version (replaces old by basename dedup)
      result = patchSettings({
        action: 'install',
        hooks: [newHook],
        settingsPath,
      });
      assert.equal(result.added.length, 1, 'New version should be added');
      assert.equal(result.patched, true, 'Should be patched (replacing old)');

      settings = readSettings(settingsPath);
      assert.equal(settings.hooks.SessionStart.length, 1, 'Should still have exactly 1 entry (replaced, not duplicated)');
      assert.equal(settings.hooks.SessionStart[0].hooks[0]._prism_v2_marker, 'newhash1', 'Marker should be updated to new version');
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

  describe('Install idempotent by script basename (dedup)', () => {
    it('two consecutive installs with same hook produce only one entry', () => {
      const settingsPath = join(tmpDir, 'settings-consecutive.json');

      const hook = {
        name: 'prism_session_start.sh',
        type: 'SessionStart',
        extType: 'sh',
        hash: 'abc123def456789abc123def456789abc123def456789abc123def456789abc1',
        hash_prefix: 'abc123de',
        installed_path: '/home/test/.claude/hooks/prism_session_start.sh',
      };

      // First install
      patchSettings({
        action: 'install',
        hooks: [hook],
        settingsPath,
      });

      // Second install (should be no-op)
      const result = patchSettings({
        action: 'install',
        hooks: [hook],
        settingsPath,
      });

      assert.equal(result.patched, false, 'Should not patch on duplicate');
      assert.equal(result.added.length, 0);
      assert.equal(result.skipped_duplicates.length, 1);

      // Verify exactly one entry exists in settings
      const settings = readSettings(settingsPath);
      assert.equal(settings.hooks.SessionStart.length, 1, 'After two identical installs, should have exactly 1 entry (idempotent)');
    });

    it('prism-forge install can be run multiple times without duplicating hook entries', () => {
      const settingsPath = join(tmpDir, 'settings-multi-install.json');

      const hooks = [
        {
          name: 'prism_session_start.sh',
          type: 'SessionStart',
          extType: 'sh',
          hash: 'abc123def456789abc123def456789abc123def456789abc123def456789abc1',
          hash_prefix: 'abc123de',
          installed_path: '/home/test/.claude/hooks/prism_session_start.sh',
        },
        {
          name: 'prism_inject_routing.py',
          type: 'UserPromptSubmit',
          extType: 'py',
          hash: 'def456abc789def456abc789def456abc789def456abc789def456abc789def4',
          hash_prefix: 'def456ab',
          installed_path: '/home/test/.claude/hooks/prism_inject_routing.py',
        },
      ];

      // First install
      let result = patchSettings({
        action: 'install',
        hooks,
        settingsPath,
      });
      assert.equal(result.added.length, 2, 'First install should add 2 entries');

      // Second install (same hooks)
      result = patchSettings({
        action: 'install',
        hooks,
        settingsPath,
      });
      assert.equal(result.patched, false, 'Second install should not patch');
      assert.equal(result.added.length, 0);
      assert.equal(result.skipped_duplicates.length, 2, 'Both hooks should be skipped');

      // Third install (same hooks again)
      result = patchSettings({
        action: 'install',
        hooks,
        settingsPath,
      });
      assert.equal(result.patched, false, 'Third install should not patch');
      assert.equal(result.added.length, 0);
      assert.equal(result.skipped_duplicates.length, 2);

      // Verify no duplicates accumulated
      const settings = readSettings(settingsPath);
      assert.equal(settings.hooks.SessionStart.length, 1, 'Should have 1 SessionStart entry (not 3)');
      assert.equal(settings.hooks.UserPromptSubmit.length, 1, 'Should have 1 UserPromptSubmit entry (not 3)');
    });
  });

  describe('Dedup by script basename (version bumps)', () => {
    it('old entry with OLD_HASH marker is replaced by new entry with NEW_HASH marker', () => {
      const settingsPath = join(tmpDir, 'settings-version-bump.json');

      const oldHook = {
        name: 'prism_inject_routing.py',
        type: 'UserPromptSubmit',
        extType: 'py',
        hash: 'oldhash1234567890oldhash1234567890oldhash1234567890oldhash123456',
        hash_prefix: 'oldhasho',
        installed_path: '/home/test/.claude/hooks/prism_inject_routing.py',
      };

      const newHook = {
        name: 'prism_inject_routing.py',
        type: 'UserPromptSubmit',
        extType: 'py',
        hash: 'newhash1234567890newhash1234567890newhash1234567890newhash123456',
        hash_prefix: 'newhashh',
        installed_path: '/home/test/.claude/hooks/prism_inject_routing.py',
      };

      // Install old version
      let result = patchSettings({
        action: 'install',
        hooks: [oldHook],
        settingsPath,
      });
      assert.equal(result.added.length, 1);

      let settings = readSettings(settingsPath);
      assert.equal(settings.hooks.UserPromptSubmit.length, 1);
      assert.equal(settings.hooks.UserPromptSubmit[0].hooks[0]._prism_v2_marker, 'oldhasho');

      // Install new version (should replace, not duplicate)
      result = patchSettings({
        action: 'install',
        hooks: [newHook],
        settingsPath,
      });
      assert.equal(result.added.length, 1, 'New version should be added');
      assert.equal(result.patched, true, 'Should be patched');

      settings = readSettings(settingsPath);
      assert.equal(settings.hooks.UserPromptSubmit.length, 1, 'Should still have exactly 1 entry (replaced, not duplicated)');
      assert.equal(settings.hooks.UserPromptSubmit[0].hooks[0]._prism_v2_marker, 'newhashh', 'Marker should be updated to new hash');
    });
  });

  describe('Dedup .sh and .py versions', () => {
    it('.py registration replaces .sh entry when both exist with same basename', () => {
      const settingsPath = join(tmpDir, 'settings-sh-to-py.json');

      const shHook = {
        name: 'prism_inject_routing.sh',
        type: 'UserPromptSubmit',
        extType: 'sh',
        hash: 'bashbashbashbashbashbashbashbashbashbashbashbashbashbashbash1',
        hash_prefix: 'bashbash',
        installed_path: '/home/test/.claude/hooks/prism_inject_routing.sh',
      };

      const pyHook = {
        name: 'prism_inject_routing.py',
        type: 'UserPromptSubmit',
        extType: 'py',
        hash: 'pythonpythonpythonpythonpythonpythonpythonpythonpythonpythonpyt',
        hash_prefix: 'pythonpy',
        installed_path: '/home/test/.claude/hooks/prism_inject_routing.py',
      };

      // Install .sh version first
      let result = patchSettings({
        action: 'install',
        hooks: [shHook],
        settingsPath,
      });
      assert.equal(result.added.length, 1);

      let settings = readSettings(settingsPath);
      assert.equal(settings.hooks.UserPromptSubmit.length, 1);
      assert.ok(settings.hooks.UserPromptSubmit[0].hooks[0].command.includes('.sh'));

      // Install .py version (should replace .sh)
      result = patchSettings({
        action: 'install',
        hooks: [pyHook],
        settingsPath,
      });
      assert.equal(result.added.length, 1, 'New .py version should be added');
      assert.equal(result.patched, true, 'Should be patched');

      settings = readSettings(settingsPath);
      assert.equal(settings.hooks.UserPromptSubmit.length, 1, 'Should still have exactly 1 entry');
      assert.ok(settings.hooks.UserPromptSubmit[0].hooks[0].command.includes('.py'), '.sh should be replaced with .py');
      assert.equal(settings.hooks.UserPromptSubmit[0].hooks[0]._prism_v2_marker, 'pythonpy');
    });
  });

  describe('Dedup with five consecutive installs', () => {
    it('running install 5 times leaves exactly 1 entry per script', () => {
      const settingsPath = join(tmpDir, 'settings-five-installs.json');

      const hook = {
        name: 'prism_check_attribution.py',
        type: 'Stop',
        extType: 'py',
        hash: 'abc123def456789abc123def456789abc123def456789abc123def456789abc1',
        hash_prefix: 'abc123de',
        installed_path: '/home/test/.claude/hooks/prism_check_attribution.py',
      };

      for (let i = 1; i <= 5; i++) {
        const result = patchSettings({
          action: 'install',
          hooks: [hook],
          settingsPath,
        });

        if (i === 1) {
          assert.equal(result.added.length, 1, `Install ${i}: should add entry`);
        } else {
          assert.equal(result.patched, false, `Install ${i}: should be no-op`);
          assert.equal(result.added.length, 0, `Install ${i}: should add 0 entries`);
          assert.equal(result.skipped_duplicates.length, 1, `Install ${i}: should skip 1 duplicate`);
        }
      }

      // Verify exactly one entry after 5 installs
      const settings = readSettings(settingsPath);
      assert.equal(settings.hooks.Stop.length, 1, 'After 5 installs, should have exactly 1 entry');
      assert.equal(settings.hooks.Stop[0].hooks[0]._prism_v2_marker, 'abc123de');
    });
  });
});
