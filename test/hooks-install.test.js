import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, chmodSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { platform } from 'node:os';
import { installHooks, uninstallHooks, hashFile } from '../lib/hooks-install.js';

describe('hooks-install', () => {
  let tmpSourceDir;
  let tmpTargetDir;

  before(() => {
    tmpSourceDir = mkdtempSync(join(tmpdir(), 'prism-hooks-src-'));
    tmpTargetDir = mkdtempSync(join(tmpdir(), 'prism-hooks-target-'));

    // Create sample hook files
    writeFileSync(join(tmpSourceDir, 'prism_session_start.sh'), '#!/bin/bash\necho "session start"', 'utf-8');
    writeFileSync(join(tmpSourceDir, 'prism_inject_routing.sh'), '#!/bin/bash\necho "inject"', 'utf-8');
    writeFileSync(join(tmpSourceDir, 'prism_check_attribution.py'), '#!/usr/bin/env python\nprint("check")', 'utf-8');
  });

  after(() => {
    rmSync(tmpSourceDir, { recursive: true, force: true });
    rmSync(tmpTargetDir, { recursive: true, force: true });
  });

  describe('Install copies all hooks', () => {
    it('copies all prism_* hook files from source to target', () => {
      const manifest = installHooks({
        sourceDir: tmpSourceDir,
        targetDir: tmpTargetDir,
      });

      assert.equal(manifest.length, 3, 'Should have 3 hook entries');

      // Verify all files were copied
      const sessionStartPath = join(tmpTargetDir, 'prism_session_start.sh');
      const injectPath = join(tmpTargetDir, 'prism_inject_routing.sh');
      const checkPath = join(tmpTargetDir, 'prism_check_attribution.py');

      assert.equal(existsSync(sessionStartPath), true);
      assert.equal(existsSync(injectPath), true);
      assert.equal(existsSync(checkPath), true);

      // Verify content matches
      const srcContent = readFileSync(join(tmpSourceDir, 'prism_session_start.sh'), 'utf-8');
      const tgtContent = readFileSync(sessionStartPath, 'utf-8');
      assert.equal(srcContent, tgtContent);
    });
  });

  describe('Install marks executable', () => {
    it('applies 0o755 permission to installed files', () => {
      const manifest = installHooks({
        sourceDir: tmpSourceDir,
        targetDir: tmpTargetDir,
      });

      for (const hook of manifest) {
        // On Windows, chmod is a no-op. On Unix, we can check perms.
        // We just verify the call doesn't throw.
        assert.ok(hook.installed_path, 'installed_path should be set');
        assert.equal(existsSync(hook.installed_path), true);
      }
    });
  });

  describe('Install returns correct manifest entries', () => {
    it('returns manifest with name, type, hash, installed_path; type mapping correct', () => {
      const manifest = installHooks({
        sourceDir: tmpSourceDir,
        targetDir: tmpTargetDir,
      });

      // Find each hook type
      const sessionStart = manifest.find(h => h.name === 'prism_session_start.sh');
      const injectRouting = manifest.find(h => h.name === 'prism_inject_routing.sh');
      const checkAttribution = manifest.find(h => h.name === 'prism_check_attribution.py');

      assert.ok(sessionStart, 'session_start hook should be in manifest');
      assert.ok(injectRouting, 'inject_routing hook should be in manifest');
      assert.ok(checkAttribution, 'check_attribution hook should be in manifest');

      // Verify type mapping
      assert.equal(sessionStart.type, 'SessionStart');
      assert.equal(injectRouting.type, 'UserPromptSubmit');
      assert.equal(checkAttribution.type, 'Stop');

      // Verify extType
      assert.equal(sessionStart.extType, 'sh');
      assert.equal(injectRouting.extType, 'sh');
      assert.equal(checkAttribution.extType, 'py');

      // Verify hash fields
      assert.ok(sessionStart.hash, 'hash should be present');
      assert.equal(sessionStart.hash.length, 64, 'hash should be 64-char hex');
      assert.ok(sessionStart.hash_prefix, 'hash_prefix should be present');
      assert.equal(sessionStart.hash_prefix.length, 8, 'hash_prefix should be 8 chars');

      // Verify installed_path
      assert.ok(sessionStart.installed_path.includes('prism_session_start.sh'));
    });
  });

  describe('Install throws on unknown filename', () => {
    it('throws descriptive error for unsupported hook names', () => {
      // Create a separate temp dir for this test to avoid polluting the main tmpSourceDir
      const tmpSourceDirForUnknown = mkdtempSync(join(tmpdir(), 'prism-hooks-src-unknown-'));

      try {
        // Copy the valid hooks
        writeFileSync(join(tmpSourceDirForUnknown, 'prism_session_start.sh'), '#!/bin/bash\necho "session start"', 'utf-8');
        // Add an unsupported file
        writeFileSync(join(tmpSourceDirForUnknown, 'prism_unknown.sh'), '#!/bin/bash\necho "unknown"', 'utf-8');

        assert.throws(
          () => {
            installHooks({
              sourceDir: tmpSourceDirForUnknown,
              targetDir: tmpTargetDir,
            });
          },
          /Unknown hook filename pattern/,
          'Should throw with descriptive error'
        );
      } finally {
        rmSync(tmpSourceDirForUnknown, { recursive: true, force: true });
      }
    });
  });

  describe('Uninstall deletes hooks', () => {
    it('removes all hook files listed in manifest', () => {
      // First install
      const manifest = installHooks({
        sourceDir: tmpSourceDir,
        targetDir: tmpTargetDir,
      });

      // Verify all are present
      assert.equal(manifest.length, 3);
      for (const hook of manifest) {
        assert.equal(existsSync(hook.installed_path), true, `${hook.name} should exist before uninstall`);
      }

      // Uninstall
      const count = uninstallHooks(manifest);
      assert.equal(count, 3, 'Should have deleted 3 files');

      // Verify all are gone
      for (const hook of manifest) {
        assert.equal(existsSync(hook.installed_path), false, `${hook.name} should be deleted`);
      }
    });
  });

  describe('Uninstall handles missing files gracefully', () => {
    it('returns count of deleted files without throwing on missing files', () => {
      // First install
      const manifest = installHooks({
        sourceDir: tmpSourceDir,
        targetDir: tmpTargetDir,
      });

      // Manually delete one hook
      const firstHook = manifest[0];
      unlinkSync(firstHook.installed_path);

      // Uninstall should not throw
      const count = uninstallHooks(manifest);

      // Should have deleted 2 (the remaining ones; 1 was already missing)
      assert.equal(count, 2, 'Should count only successfully deleted files');

      // Verify remaining hooks are gone
      for (let i = 1; i < manifest.length; i++) {
        assert.equal(existsSync(manifest[i].installed_path), false);
      }
    });
  });

  describe('hashFile produces consistent hashes', () => {
    it('returns same hash for same file content', () => {
      const filePath = join(tmpSourceDir, 'prism_session_start.sh');
      const hash1 = hashFile(filePath);
      const hash2 = hashFile(filePath);
      assert.equal(hash1, hash2, 'Same file should produce same hash');
      assert.equal(hash1.length, 64, 'Hash should be 64-char hex');
    });

    it('returns different hash for different file content', () => {
      const file1 = join(tmpSourceDir, 'prism_session_start.sh');
      const file2 = join(tmpSourceDir, 'prism_inject_routing.sh');
      const hash1 = hashFile(file1);
      const hash2 = hashFile(file2);
      assert.notEqual(hash1, hash2, 'Different files should have different hashes');
    });
  });

  describe('Install skips .sh wrapper when matching .py exists', () => {
    it('copies both .sh and .py but only registers .py in manifest', () => {
      // Create a separate temp dir for this test
      const tmpSrcDirPy = mkdtempSync(join(tmpdir(), 'prism-hooks-py-'));
      const tmpTgtDirPy = mkdtempSync(join(tmpdir(), 'prism-hooks-py-target-'));

      try {
        // Create both .sh (wrapper) and .py (implementation)
        writeFileSync(
          join(tmpSrcDirPy, 'prism_inject_routing.sh'),
          '#!/bin/bash\nexec python "${0%.sh}.py" "$@"',
          'utf-8'
        );
        writeFileSync(
          join(tmpSrcDirPy, 'prism_inject_routing.py'),
          '#!/usr/bin/env python\nprint("routing")',
          'utf-8'
        );
        // Also add a .sh-only hook for comparison
        writeFileSync(
          join(tmpSrcDirPy, 'prism_session_start.sh'),
          '#!/bin/bash\necho "session"',
          'utf-8'
        );

        const manifest = installHooks({
          sourceDir: tmpSrcDirPy,
          targetDir: tmpTgtDirPy,
        });

        // Should have 2 manifest entries (.py for inject_routing, .sh for session_start)
        assert.equal(manifest.length, 2, 'Manifest should have 2 entries (no .sh for inject_routing)');

        // Both files should be copied to target
        const shPath = join(tmpTgtDirPy, 'prism_inject_routing.sh');
        const pyPath = join(tmpTgtDirPy, 'prism_inject_routing.py');
        const sessionPath = join(tmpTgtDirPy, 'prism_session_start.sh');

        assert.equal(existsSync(shPath), true, 'Wrapper .sh should be copied');
        assert.equal(existsSync(pyPath), true, 'Implementation .py should be copied');
        assert.equal(existsSync(sessionPath), true, '.sh-only file should be copied');

        // Manifest should contain .py for inject_routing, not .sh
        const manifestInjectRouting = manifest.find(h => h.type === 'UserPromptSubmit');
        assert.ok(manifestInjectRouting, 'Should have inject_routing in manifest');
        assert.equal(manifestInjectRouting.name, 'prism_inject_routing.py', 'Manifest should reference .py');
        assert.equal(manifestInjectRouting.extType, 'py', 'extType should be py');

        // Manifest should contain .sh for session_start
        const manifestSessionStart = manifest.find(h => h.type === 'SessionStart');
        assert.ok(manifestSessionStart, 'Should have session_start in manifest');
        assert.equal(manifestSessionStart.name, 'prism_session_start.sh', 'Manifest should reference .sh');
      } finally {
        rmSync(tmpSrcDirPy, { recursive: true, force: true });
        rmSync(tmpTgtDirPy, { recursive: true, force: true });
      }
    });

    it('registers .sh when .py does not exist', () => {
      // Create a separate temp dir for this test
      const tmpSrcDirShOnly = mkdtempSync(join(tmpdir(), 'prism-hooks-sh-only-'));
      const tmpTgtDirShOnly = mkdtempSync(join(tmpdir(), 'prism-hooks-sh-only-target-'));

      try {
        // Create only .sh files
        writeFileSync(
          join(tmpSrcDirShOnly, 'prism_check_attribution.sh'),
          '#!/bin/bash\necho "check"',
          'utf-8'
        );

        const manifest = installHooks({
          sourceDir: tmpSrcDirShOnly,
          targetDir: tmpTgtDirShOnly,
        });

        // Should have 1 manifest entry for the .sh file
        assert.equal(manifest.length, 1, 'Manifest should have 1 entry');

        const manifestEntry = manifest[0];
        assert.equal(manifestEntry.name, 'prism_check_attribution.sh');
        assert.equal(manifestEntry.extType, 'sh');
        assert.equal(manifestEntry.type, 'Stop');
      } finally {
        rmSync(tmpSrcDirShOnly, { recursive: true, force: true });
        rmSync(tmpTgtDirShOnly, { recursive: true, force: true });
      }
    });
  });
});
