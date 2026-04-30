import { patchSettings, readSettings, writeSettingsAtomic } from '../lib/settings-patch.js';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function assert(condition, message) {
  if (!condition) {
    testResults.failed++;
    testResults.tests.push(`FAIL: ${message}`);
    console.error(`✗ ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    testResults.passed++;
    testResults.tests.push(`PASS: ${message}`);
    console.log(`✓ ${message}`);
  }
}

function testInstallProperlyNested() {
  console.log('\n--- Test 1: Install with proper nested structure ---');
  const tmpDir = mkdtempSync(join(tmpdir(), 'prism-test-'));
  const settingsPath = join(tmpDir, 'settings.json');

  try {
    // Create initial settings with user hook (proper nested structure)
    const initialSettings = {
      hooks: {
        SessionStart: [
          {
            hooks: [
              {
                type: 'command',
                command: 'bash "/path/to/user-hook.sh"',
                timeout: 10
              }
            ]
          }
        ]
      }
    };
    writeSettingsAtomic(settingsPath, initialSettings);

    // Install 3 prism hooks
    const result = patchSettings({
      action: 'install',
      hooks: [
        { type: 'SessionStart', name: 'hook1', extType: 'sh', installed_path: '/path/to/hook1.sh', hash_prefix: 'abc12345' },
        { type: 'PreToolUse', name: 'hook2', extType: 'sh', installed_path: '/path/to/hook2.sh', hash_prefix: 'def67890' },
        { type: 'SessionStart', name: 'hook3', extType: 'py', installed_path: '/path/to/hook3.py', hash_prefix: 'ghi11111' }
      ],
      settingsPath
    });

    assert(result.patched, 'Should report patched=true');
    assert(result.added.length === 3, `Should add 3 hooks, got ${result.added.length}`);
    assert(result.skipped_duplicates.length === 0, 'Should have no duplicates');

    // Verify structure
    const settings = readSettings(settingsPath);
    assert(settings.hooks.SessionStart.length === 3, `SessionStart should have 3 entries, got ${settings.hooks.SessionStart.length}`);
    assert(settings.hooks.PreToolUse.length === 1, `PreToolUse should have 1 entry, got ${settings.hooks.PreToolUse.length}`);

    // Check first entry (user hook - preserved)
    const userEntry = settings.hooks.SessionStart[0];
    assert(userEntry.hooks, 'User entry should have hooks array');
    assert(userEntry.hooks[0].command.includes('user-hook.sh'), 'User hook should be preserved');
    assert(!userEntry.hooks[0]._prism_v2_marker, 'User hook should NOT have marker');

    // Check prism entries have nested structure
    const prismEntry1 = settings.hooks.SessionStart[1];
    assert(prismEntry1.hooks, 'Prism entry should have hooks array');
    assert(prismEntry1.hooks[0].type === 'command', 'Inner hook should have type=command');
    assert(prismEntry1.hooks[0]._prism_v2_marker === 'abc12345', 'Marker should be on inner hook');
    assert(prismEntry1.hooks[0].command === 'bash "/path/to/hook1.sh"', 'Command should be properly formed');
    assert(prismEntry1.hooks[0].timeout === 5, 'Timeout should be 5');

    // Check python hook
    const prismEntry3 = settings.hooks.SessionStart[2];
    assert(prismEntry3.hooks[0].command === 'python "/path/to/hook3.py"', 'Python hook should use python not python3');

    // Check PreToolUse
    const preToolUseEntry = settings.hooks.PreToolUse[0];
    assert(preToolUseEntry.hooks[0]._prism_v2_marker === 'def67890', 'PreToolUse entry should have marker');

  } finally {
    rmSync(tmpDir, { recursive: true });
  }
}

function testIdempotency() {
  console.log('\n--- Test 2: Idempotency - second install should not duplicate ---');
  const tmpDir = mkdtempSync(join(tmpdir(), 'prism-test-'));
  const settingsPath = join(tmpDir, 'settings.json');

  try {
    const hooks = [
      { type: 'SessionStart', name: 'hook1', extType: 'sh', installed_path: '/path/to/hook1.sh', hash_prefix: 'abc12345' }
    ];

    // First install
    patchSettings({ action: 'install', hooks, settingsPath });

    // Second install (same hooks)
    const result2 = patchSettings({ action: 'install', hooks, settingsPath });

    assert(result2.skipped_duplicates.length === 1, `Second install should skip duplicate, got ${result2.skipped_duplicates.length}`);
    assert(result2.added.length === 0, 'Second install should not add anything');
    assert(!result2.patched, 'Second install should not report patched=true');

    // Verify still only 1 entry
    const settings = readSettings(settingsPath);
    assert(settings.hooks.SessionStart.length === 1, `Should still have 1 entry, got ${settings.hooks.SessionStart.length}`);

  } finally {
    rmSync(tmpDir, { recursive: true });
  }
}

function testStaleUpgrade() {
  console.log('\n--- Test 3: Multiple different hooks coexist ---');
  const tmpDir = mkdtempSync(join(tmpdir(), 'prism-test-'));
  const settingsPath = join(tmpDir, 'settings.json');

  try {
    // First install hook1
    patchSettings({
      action: 'install',
      hooks: [
        { type: 'SessionStart', name: 'hook1', extType: 'sh', installed_path: '/path/to/hook1.sh', hash_prefix: 'abc12345' }
      ],
      settingsPath
    });

    // Second install hook2 (different hook)
    const result2 = patchSettings({
      action: 'install',
      hooks: [
        { type: 'SessionStart', name: 'hook2', extType: 'sh', installed_path: '/path/to/hook2.sh', hash_prefix: 'new98765' }
      ],
      settingsPath
    });

    assert(result2.added.length === 1, `Should add 1 new hook, got ${result2.added.length}`);
    assert(result2.removed.length === 0, `Should not remove anything, got ${result2.removed.length}`);

    const settings = readSettings(settingsPath);
    assert(settings.hooks.SessionStart.length === 2, `Should have 2 entries, got ${settings.hooks.SessionStart.length}`);

  } finally {
    rmSync(tmpDir, { recursive: true });
  }
}

function testMalformedFlatEntryCleanup() {
  console.log('\n--- Test 4: Cleanup of malformed flat entries from old install ---');
  const tmpDir = mkdtempSync(join(tmpdir(), 'prism-test-'));
  const settingsPath = join(tmpDir, 'settings.json');

  try {
    // Simulate old bad install with flat entries
    const badSettings = {
      hooks: {
        SessionStart: [
          {
            type: 'command',
            command: 'bash "/path/to/old-bad.sh"',
            timeout: 5,
            _prism_v2_marker: 'badmarker123'  // Top-level marker - WRONG
          }
        ]
      }
    };
    writeSettingsAtomic(settingsPath, badSettings);

    // Now install a new hook - should remove the malformed entry
    const result = patchSettings({
      action: 'install',
      hooks: [
        { type: 'SessionStart', name: 'hook1', extType: 'sh', installed_path: '/path/to/hook1.sh', hash_prefix: 'newmarker456' }
      ],
      settingsPath
    });

    assert(result.removed.length === 1, `Should remove 1 malformed entry, got ${result.removed.length}`);
    assert(result.added.length === 1, `Should add 1 new entry, got ${result.added.length}`);

    const settings = readSettings(settingsPath);
    assert(settings.hooks.SessionStart.length === 1, `Should have 1 entry after cleanup, got ${settings.hooks.SessionStart.length}`);
    assert(settings.hooks.SessionStart[0].hooks, 'New entry should have nested hooks array');
    assert(settings.hooks.SessionStart[0].hooks[0]._prism_v2_marker === 'newmarker456', 'New entry should have proper marker');

  } finally {
    rmSync(tmpDir, { recursive: true });
  }
}

function testUninstall() {
  console.log('\n--- Test 5: Uninstall removes all prism entries, preserves user entries ---');
  const tmpDir = mkdtempSync(join(tmpdir(), 'prism-test-'));
  const settingsPath = join(tmpDir, 'settings.json');

  try {
    // Install prism hooks and user hooks
    patchSettings({
      action: 'install',
      hooks: [
        { type: 'SessionStart', name: 'hook1', extType: 'sh', installed_path: '/path/to/hook1.sh', hash_prefix: 'abc12345' },
        { type: 'SessionStart', name: 'hook2', extType: 'sh', installed_path: '/path/to/hook2.sh', hash_prefix: 'def67890' }
      ],
      settingsPath
    });

    // Add a user hook manually
    let settings = readSettings(settingsPath);
    settings.hooks.SessionStart.push({
      hooks: [
        {
          type: 'command',
          command: 'bash "/path/to/user-hook.sh"',
          timeout: 10
        }
      ]
    });
    writeSettingsAtomic(settingsPath, settings);

    // Verify we have 3 entries (2 prism + 1 user)
    settings = readSettings(settingsPath);
    assert(settings.hooks.SessionStart.length === 3, `Should have 3 entries before uninstall, got ${settings.hooks.SessionStart.length}`);

    // Uninstall prism hooks
    const result = patchSettings({
      action: 'uninstall',
      hooks: [
        { type: 'SessionStart', name: 'hook1', hash_prefix: 'abc12345' },
        { type: 'SessionStart', name: 'hook2', hash_prefix: 'def67890' }
      ],
      settingsPath
    });

    assert(result.patched, 'Uninstall should report patched=true');
    assert(result.removed.length === 2, `Should remove 2 prism entries, got ${result.removed.length}`);

    // Verify user hook still there
    settings = readSettings(settingsPath);
    assert(settings.hooks.SessionStart.length === 1, `Should have 1 entry after uninstall (user), got ${settings.hooks.SessionStart.length}`);
    assert(settings.hooks.SessionStart[0].hooks[0].command.includes('user-hook'), 'User hook should be preserved');

  } finally {
    rmSync(tmpDir, { recursive: true });
  }
}

function testUninstallMalformedFlatEntries() {
  console.log('\n--- Test 6: Uninstall also removes malformed flat entries ---');
  const tmpDir = mkdtempSync(join(tmpdir(), 'prism-test-'));
  const settingsPath = join(tmpDir, 'settings.json');

  try {
    // Simulate mix of old flat entries and new nested entries
    const mixedSettings = {
      hooks: {
        SessionStart: [
          {
            type: 'command',
            command: 'bash "/path/to/bad-flat.sh"',
            timeout: 5,
            _prism_v2_marker: 'badmarker'  // Flat entry
          },
          {
            hooks: [
              {
                type: 'command',
                command: 'bash "/path/to/good-nested.sh"',
                timeout: 5,
                _prism_v2_marker: 'goodmarker'
              }
            ]
          },
          {
            hooks: [
              {
                type: 'command',
                command: 'bash "/path/to/user.sh"',
                timeout: 10
              }
            ]
          }
        ]
      }
    };
    writeSettingsAtomic(settingsPath, mixedSettings);

    // Uninstall
    const result = patchSettings({
      action: 'uninstall',
      hooks: [
        { type: 'SessionStart', name: 'prism-hook', hash_prefix: 'any' }
      ],
      settingsPath
    });

    const settings = readSettings(settingsPath);
    assert(settings.hooks.SessionStart.length === 1, `Should have 1 entry (user only), got ${settings.hooks.SessionStart.length}`);
    assert(settings.hooks.SessionStart[0].hooks[0].command.includes('user.sh'), 'User hook should remain');

  } finally {
    rmSync(tmpDir, { recursive: true });
  }
}

// Run all tests
try {
  testInstallProperlyNested();
  testIdempotency();
  testStaleUpgrade();
  testMalformedFlatEntryCleanup();
  testUninstall();
  testUninstallMalformedFlatEntries();
} catch (e) {
  console.error('\nTest execution error:', e.message);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log(`TEST RESULTS: ${testResults.passed} passed, ${testResults.failed} failed`);
console.log('='.repeat(60));
testResults.tests.forEach(t => console.log(`  ${t}`));
process.exit(testResults.failed > 0 ? 1 : 0);
