import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { getDefaultTargetDir, getTargetDir, getClaudeMdPath, tildePathCustom } from '../lib/paths.js';

describe('getDefaultTargetDir', () => {
  it('returns path under ~/.claude/rules/prism', () => {
    const result = getDefaultTargetDir();
    assert.ok(result.includes('.claude'));
    assert.ok(result.includes('prism'));
  });
});

describe('getTargetDir', () => {
  it('returns custom path when provided', () => {
    assert.equal(getTargetDir('/custom/path'), '/custom/path');
  });

  it('returns default when no custom path', () => {
    const result = getTargetDir(undefined);
    assert.equal(result, getDefaultTargetDir());
  });
});

describe('getClaudeMdPath', () => {
  it('returns path to ~/.claude/CLAUDE.md', () => {
    const result = getClaudeMdPath();
    assert.ok(result.endsWith('CLAUDE.md'));
    assert.ok(result.includes('.claude'));
  });
});

describe('tildePathCustom', () => {
  it('converts home directory path to tilde notation', () => {
    const home = homedir();
    const targetDir = join(home, '.claude', 'rules', 'prism');
    const result = tildePathCustom(targetDir, 'personas');
    assert.ok(result.startsWith('~'));
    assert.ok(result.includes('personas'));
    assert.ok(!result.includes(home));
  });

  it('uses forward slashes', () => {
    const home = homedir();
    const targetDir = join(home, '.claude', 'rules', 'prism');
    const result = tildePathCustom(targetDir, 'routing');
    assert.ok(!result.includes('\\'));
  });

  it('handles no subpath', () => {
    const home = homedir();
    const targetDir = join(home, '.claude', 'rules', 'prism');
    const result = tildePathCustom(targetDir);
    assert.ok(result.endsWith('prism'));
  });
});
