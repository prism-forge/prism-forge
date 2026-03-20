import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getDefaultTargetDir() {
  return join(homedir(), '.claude', 'rules', 'prism');
}

export function getTargetDir(customPath) {
  if (customPath) return customPath;
  return getDefaultTargetDir();
}

export function getClaudeMdPath() {
  return join(homedir(), '.claude', 'CLAUDE.md');
}

export function getSourceDir() {
  return join(__dirname, '..', 'src');
}

export function tildePath(subpath) {
  return '~/.claude/rules/prism' + (subpath ? '/' + subpath : '');
}

export function tildePathCustom(targetDir, subpath) {
  const home = homedir();
  const full = join(targetDir, subpath || '');
  if (full.startsWith(home)) {
    return '~' + full.slice(home.length).replace(/\\/g, '/');
  }
  return full.replace(/\\/g, '/');
}
