import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { injectBlock, removeBlock, START_DELIMITER, END_DELIMITER } from '../lib/claude-md.js';

const testDir = join(tmpdir(), 'prism-test-' + Date.now());
const testClaudeMd = join(testDir, 'CLAUDE.md');
const testTargetDir = join(testDir, 'rules', 'prism');

describe('claude-md block injection', () => {
  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('creates CLAUDE.md if it does not exist', async () => {
    const result = await injectBlock(testTargetDir, testClaudeMd);
    assert.equal(result, 'created');
    const content = await readFile(testClaudeMd, 'utf-8');
    assert.ok(content.includes(START_DELIMITER));
    assert.ok(content.includes(END_DELIMITER));
  });

  it('appends block to existing CLAUDE.md without PRISM block', async () => {
    await writeFile(testClaudeMd, '# My Config\n\nSome content.\n', 'utf-8');
    const result = await injectBlock(testTargetDir, testClaudeMd);
    assert.equal(result, 'appended');
    const content = await readFile(testClaudeMd, 'utf-8');
    assert.ok(content.includes('# My Config'));
    assert.ok(content.includes(START_DELIMITER));
  });

  it('replaces existing PRISM block', async () => {
    const existing = `# Config\n\n${START_DELIMITER}\nold content\n${END_DELIMITER}\n\n# Footer\n`;
    await writeFile(testClaudeMd, existing, 'utf-8');
    const result = await injectBlock(testTargetDir, testClaudeMd);
    assert.equal(result, 'replaced');
    const content = await readFile(testClaudeMd, 'utf-8');
    assert.ok(!content.includes('old content'));
    assert.ok(content.includes('# Config'));
    assert.ok(content.includes('# Footer'));
    assert.ok(content.includes(START_DELIMITER));
  });
});

describe('claude-md block removal', () => {
  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('removes PRISM block and preserves surrounding content', async () => {
    const content = `# Config\n\n${START_DELIMITER}\nPRISM content\n${END_DELIMITER}\n\n# Footer\n`;
    await writeFile(testClaudeMd, content, 'utf-8');
    const result = await removeBlock(testClaudeMd);
    assert.equal(result, true);
    const after = await readFile(testClaudeMd, 'utf-8');
    assert.ok(!after.includes(START_DELIMITER));
    assert.ok(!after.includes('PRISM content'));
    assert.ok(after.includes('# Config'));
    assert.ok(after.includes('# Footer'));
  });

  it('returns false when no PRISM block exists', async () => {
    await writeFile(testClaudeMd, '# Config\n', 'utf-8');
    const result = await removeBlock(testClaudeMd);
    assert.equal(result, false);
  });

  it('returns false when file does not exist', async () => {
    const result = await removeBlock(join(testDir, 'nonexistent.md'));
    assert.equal(result, false);
  });

  it('handles file that becomes empty after removal', async () => {
    const content = `${START_DELIMITER}\nonly PRISM content\n${END_DELIMITER}`;
    await writeFile(testClaudeMd, content, 'utf-8');
    const result = await removeBlock(testClaudeMd);
    assert.equal(result, true);
    const after = await readFile(testClaudeMd, 'utf-8');
    assert.equal(after, '');
  });
});
