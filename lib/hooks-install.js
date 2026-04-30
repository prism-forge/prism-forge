import { createHash } from 'node:crypto';
import { readFileSync, copyFileSync, chmodSync, readdirSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { expandTilde } from './routing-events.js';

/**
 * Compute SHA256 hash of a file.
 * @param {string} filePath - Absolute path to file
 * @returns {string} Hex-encoded SHA256 hash
 */
export function hashFile(filePath) {
  const content = readFileSync(filePath);
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Map hook filename to hook type.
 * @param {string} filename - Filename like prism_session_start.sh
 * @returns {string} Hook type: SessionStart, UserPromptSubmit, Stop, or throws
 */
function mapFilenameToType(filename) {
  if (filename.match(/^prism_session_start\./)) return 'SessionStart';
  if (filename.match(/^prism_inject_routing\./)) return 'UserPromptSubmit';
  if (filename.match(/^prism_check_attribution\./)) return 'Stop';
  throw new Error(`Unknown hook filename pattern: ${filename}`);
}

/**
 * Get file extension type for command formatting.
 * @param {string} filename - Filename
 * @returns {string} Type: 'sh' or 'py'
 */
function getExtType(filename) {
  if (filename.endsWith('.sh')) return 'sh';
  if (filename.endsWith('.py')) return 'py';
  throw new Error(`Unsupported file extension: ${filename}`);
}

/**
 * Install hook files from source to target directory.
 * @param {object} options - Installation options
 * @param {string} [options.sourceDir] - Source directory (defaults to <prism-repo>/src/hooks/)
 * @param {string} [options.targetDir] - Target directory (defaults to ~/.claude/hooks/)
 * @returns {array} Array of manifest entries: { name, type, hash, installed_path }
 * @throws {Error} On invalid hook filenames or I/O failures
 */
export function installHooks(options = {}) {
  const sourceDir = options.sourceDir || join(process.cwd(), 'src', 'hooks');
  const targetDir = expandTilde(options.targetDir || '~/.claude/hooks');

  // Ensure target dir exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  const manifest = [];

  // Read all files matching prism_*.{sh,py}
  let files;
  try {
    files = readdirSync(sourceDir);
  } catch {
    throw new Error(`Cannot read source directory: ${sourceDir}`);
  }

  const hookFiles = files.filter(f => f.match(/^prism_\w+\.(sh|py)$/));

  for (const filename of hookFiles) {
    const sourcePath = join(sourceDir, filename);
    const targetPath = join(targetDir, filename);
    const type = mapFilenameToType(filename);
    const extType = getExtType(filename);
    const fileHash = hashFile(sourcePath);
    const hashPrefix = fileHash.slice(0, 8);

    // Copy file
    copyFileSync(sourcePath, targetPath);

    // Set executable
    chmodSync(targetPath, 0o755);

    manifest.push({
      name: filename,
      type,
      extType,
      hash: fileHash,
      hash_prefix: hashPrefix,
      installed_path: targetPath,
    });
  }

  return manifest;
}

/**
 * Uninstall hooks by removing files listed in manifest.
 * @param {array} manifestHooks - Array of hook manifest entries with installed_path
 * @returns {number} Count of files deleted
 */
export function uninstallHooks(manifestHooks) {
  let count = 0;

  for (const hook of manifestHooks) {
    try {
      if (existsSync(hook.installed_path)) {
        unlinkSync(hook.installed_path);
        count++;
      }
    } catch {
      // Skip if file missing or unlink fails
    }
  }

  return count;
}
