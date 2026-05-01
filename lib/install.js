import { join, dirname } from 'node:path';
import { mkdir, readFile, writeFile, rename, readdir, access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { getTargetDir, getSourceDir, tildePath, tildePathCustom } from './paths.js';
import { replaceTokens } from './tokens.js';
import { hashFile } from './hash.js';
import { buildManifest, readManifest, writeManifest } from './manifest.js';
import { injectBlock } from './claude-md.js';
import { runVerify } from './verify.js';
import { installHooks } from './hooks-install.js';
import { patchSettings } from './settings-patch.js';
import { migrateV1ToV2 } from './migrate-v1.js';

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function detectExistingPersonas(targetDir) {
  const defaultPersonasDir = join(homedir(), '.claude', 'rules', 'personas');
  // Only warn if existing personas are outside our namespace
  if (targetDir.startsWith(defaultPersonasDir)) return false;
  try {
    const entries = await readdir(defaultPersonasDir);
    return entries.some(e => e.startsWith('persona-') && e.endsWith('.md'));
  } catch {
    return false;
  }
}

export async function runInstall(options = {}) {
  try {
    const targetDir = getTargetDir(options.path);
    const sourceDir = getSourceDir();
    const isCustomPath = !!options.path;

    console.log('Installing PRISM...\n');

    // Migrate v1 to v2 if needed
    const migration = await migrateV1ToV2({ targetDir, settingsPath: '~/.claude/settings.json' });
    if (migration.migrated) {
      console.log(`  Migrated v1 → v2: backup at ${migration.backupPath}\n`);
    }

    // Check for existing install
    const oldManifest = await readManifest(targetDir);
    const isUpgrade = oldManifest !== null;

    if (isUpgrade) {
      console.log('  Existing installation detected — upgrading.\n');
    }

    // Build source manifest
    const sourceManifest = await buildManifest(sourceDir);

    // Create target directories
    const subdirs = ['personas', 'routing', join('skills', 'create-persona')];
    for (const sub of subdirs) {
      await mkdir(join(targetDir, sub), { recursive: true });
    }

    // Copy files with token replacement
    const installed = [];
    const backedUp = [];

    for (const [relPath, { hash: sourceHash }] of Object.entries(sourceManifest.files)) {
      const srcPath = join(sourceDir, relPath);
      const destPath = join(targetDir, relPath);

      // Ensure destination directory exists
      await mkdir(dirname(destPath), { recursive: true });

      // Read source and apply token replacement
      const content = await readFile(srcPath, 'utf-8');
      const replaced = replaceTokens(content, targetDir);

      if (isUpgrade) {
        try {
          const diskHash = await hashFile(destPath);
          const oldEntry = oldManifest.files[relPath];
          if (oldEntry && diskHash !== oldEntry.hash) {
            // User modified this file — back it up
            const backupDir = join(targetDir, '.prism-backup', new Date().toISOString().slice(0, 10));
            const backupPath = join(backupDir, relPath);
            await mkdir(dirname(backupPath), { recursive: true });
            await rename(destPath, backupPath);
            backedUp.push(relPath);
          }
        } catch {
          // File doesn't exist on disk yet — just install
        }
      }

      await writeFile(destPath, replaced, 'utf-8');
      installed.push(relPath);
    }

    // Inject CLAUDE.md block first
    const claudeResult = await injectBlock(targetDir);

    // Install hooks (best-effort)
    let manifestHooks = [];
    try {
      const srcHooksDir = join(sourceDir, '..', 'src', 'hooks');
      manifestHooks = installHooks({ sourceDir: srcHooksDir, targetDir: join(homedir(), '.claude', 'hooks') });
      console.log(`  Installed: ${manifestHooks.length} hook script(s)`);
    } catch (err) {
      console.log(`  Warning: hook installation failed: ${err.message}`);
    }

    // Patch settings.json (best-effort)
    let settingsPatchResult = { added: [], skipped_duplicates: [] };
    try {
      if (manifestHooks.length > 0) {
        settingsPatchResult = patchSettings({
          action: 'install',
          hooks: manifestHooks,
          settingsPath: join(homedir(), '.claude', 'settings.json'),
        });
        console.log(`  Settings patched: ${settingsPatchResult.added.length} added, ${settingsPatchResult.skipped_duplicates.length} skipped`);
      }
    } catch (err) {
      console.log(`  Warning: settings patch failed: ${err.message}`);
    }

    // Write manifest with v2.0 schema including hooks and settingsPatches
    const nowISO = new Date().toISOString();
    const installedManifest = {
      version: '2.0',
      created: nowISO,
      files: {},
    };
    for (const relPath of installed) {
      const destPath = join(targetDir, relPath);
      installedManifest.files[relPath] = { hash: await hashFile(destPath) };
    }
    // Include hooks if any were installed
    if (manifestHooks.length > 0) {
      installedManifest.hooks = manifestHooks;
      installedManifest.settingsPatches = [{
        path: join(homedir(), '.claude', 'settings.json'),
        keys_modified: ['hooks.SessionStart', 'hooks.UserPromptSubmit', 'hooks.Stop'],
        marker: '_prism_v2',
        installed_at: nowISO,
      }];
    }
    await writeManifest(targetDir, installedManifest);

    // Count installed items
    const personaCount = installed.filter(f => f.startsWith('personas/persona-') && f !== 'personas/persona-manifest.md').length;
    const displayTarget = isCustomPath
      ? tildePathCustom(targetDir)
      : tildePath();

    // Print summary
    console.log('PRISM installed successfully!\n');
    console.log(`  Installed: ${personaCount} personas, 1 routing engine, 1 audit checklist, 1 skill`);
    console.log(`  Target:    ${displayTarget}/`);
    console.log(`  CLAUDE.md: ${claudeResult}`);

    if (backedUp.length > 0) {
      console.log(`\n  Backed up: ${backedUp.length} user-modified file(s) to .prism-backup/`);
      for (const f of backedUp) {
        console.log(`    - ${f}`);
      }
    }

    // Detect existing non-PRISM personas
    const hasExisting = await detectExistingPersonas(targetDir);
    if (hasExisting) {
      console.log('\n  Note: Found existing persona files in ~/.claude/rules/personas/.');
      console.log(`        PRISM installed to ${displayTarget}/ (separate namespace).`);
      console.log('        Both sets will load into Claude Code sessions.');
    }

    // Run post-install verify
    console.log('');
    const verifyResult = await runVerify(options.path, { quiet: true });
    if (verifyResult.failed > 0) {
      console.log(`\n  Warning: ${verifyResult.failed} verification check(s) failed.`);
      console.log('  Run `npx prism-forge verify` for details.');
    }
  } catch (err) {
    console.error(`\nError: ${err.message}`);
    if (err.code === 'EACCES' || err.code === 'EPERM') {
      console.error('Check file permissions for the target directory.');
    }
    process.exit(1);
  }
}
