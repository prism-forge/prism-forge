import { join } from 'node:path';
import { readFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { readManifest } from './manifest.js';

/**
 * Migrate from PRISM v1.0 to v2.0.
 * Detects prior v1.0 installation and creates backup for preservation of user customizations.
 *
 * @param {object} options - Migration options
 * @param {string} options.targetDir - Target directory (e.g., ~/.claude/rules/prism)
 * @param {string} [options.settingsPath] - Settings path (for informational purposes)
 * @returns {object} Migration result: { migrated: bool, reason: string, backupPath?: string }
 */
export async function migrateV1ToV2(options = {}) {
  const { targetDir, settingsPath } = options;

  if (!targetDir) {
    return { migrated: false, reason: 'no_target_dir' };
  }

  // Read existing manifest
  const manifest = await readManifest(targetDir);

  // If no manifest or already v2, no migration needed
  if (!manifest) {
    return { migrated: false, reason: 'no_v1_or_already_v2' };
  }

  if (manifest.version === '2.0') {
    return { migrated: false, reason: 'no_v1_or_already_v2' };
  }

  if (manifest.version !== '1.0') {
    return { migrated: false, reason: 'unknown_version' };
  }

  // v1.0 detected — create backup
  const now = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const backupDir = join(targetDir, '.prism-backup', `v1-${now}`);

  try {
    mkdirSync(backupDir, { recursive: true });

    // Backup old manifest
    const manifestPath = join(targetDir, 'prism-manifest.json');
    if (existsSync(manifestPath)) {
      copyFileSync(manifestPath, join(backupDir, 'prism-manifest.json'));
    }

    // Backup routing-engine.md (user customizations preservation)
    const routingEnginePath = join(targetDir, 'routing', 'routing-engine.md');
    if (existsSync(routingEnginePath)) {
      mkdirSync(join(backupDir, 'routing'), { recursive: true });
      copyFileSync(routingEnginePath, join(backupDir, 'routing', 'routing-engine.md'));
    }

    return {
      migrated: true,
      reason: 'v1_backed_up',
      backupPath: backupDir,
    };
  } catch (err) {
    return {
      migrated: false,
      reason: 'backup_failed',
      error: err.message,
    };
  }
}
