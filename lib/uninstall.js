import { join, dirname } from 'node:path';
import { unlink, rmdir, rm, readdir } from 'node:fs/promises';
import { getTargetDir, tildePathCustom, tildePath } from './paths.js';
import { readManifest } from './manifest.js';
import { removeBlock } from './claude-md.js';

export async function runUninstall(options = {}) {
  try {
    const targetDir = getTargetDir(options.path);
    const isCustomPath = !!options.path;
    const displayTarget = isCustomPath ? tildePathCustom(targetDir) : tildePath();

    // Force mode: nuke the directory
    if (options.force) {
      console.log('Uninstalling PRISM (force)...\n');
      try {
        await rm(targetDir, { recursive: true, force: true });
        console.log(`  Removed: ${displayTarget}/ (force)`);
      } catch (err) {
        console.error(`  Error removing ${displayTarget}/: ${err.message}`);
      }
      const removed = await removeBlock();
      console.log(`  CLAUDE.md: ${removed ? 'PRISM block removed' : 'no PRISM block found'}`);
      console.log('\nPRISM uninstalled.');
      return;
    }

    // Default mode: manifest-driven
    console.log('Uninstalling PRISM...\n');

    const manifest = await readManifest(targetDir);
    if (!manifest) {
      console.log(`No PRISM installation found at ${displayTarget}/`);
      console.log('Use --force to delete the directory anyway.');
      process.exit(1);
    }

    // Delete each file listed in manifest
    let deleted = 0;
    for (const relPath of Object.keys(manifest.files)) {
      const fullPath = join(targetDir, relPath);
      try {
        await unlink(fullPath);
        deleted++;
      } catch {
        // File already gone
      }
    }

    // Delete manifest file
    try {
      await unlink(join(targetDir, 'prism-manifest.json'));
    } catch {}

    // Clean up empty directories (bottom-up)
    const dirs = new Set();
    for (const relPath of Object.keys(manifest.files)) {
      let dir = dirname(relPath);
      while (dir && dir !== '.') {
        dirs.add(join(targetDir, dir));
        dir = dirname(dir);
      }
    }
    const sortedDirs = [...dirs].sort((a, b) => b.split(/[\\/]/).length - a.split(/[\\/]/).length);
    for (const dir of sortedDirs) {
      try {
        const entries = await readdir(dir);
        if (entries.length === 0) await rmdir(dir);
      } catch {}
    }
    // Try removing target dir itself if empty
    try {
      const entries = await readdir(targetDir);
      if (entries.length === 0) await rmdir(targetDir);
    } catch {}

    // Remove CLAUDE.md block
    const removed = await removeBlock();

    // Summary
    console.log('PRISM uninstalled successfully!\n');
    console.log(`  Removed: ${deleted} files from ${displayTarget}/`);
    console.log(`  CLAUDE.md: ${removed ? 'PRISM block removed' : 'no PRISM block found'}`);
  } catch (err) {
    console.error(`\nError: ${err.message}`);
    process.exit(1);
  }
}
