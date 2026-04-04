import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { replaceTokens } from '../lib/tokens.js';

const testTargetDir = join(homedir(), '.claude', 'rules', 'prism');

describe('replaceTokens', () => {
  it('replaces all PRISM tokens with tilde paths', () => {
    const input = 'Read {PRISM_PERSONAS}/persona-analyst-mary.md';
    const result = replaceTokens(input, testTargetDir);
    assert.ok(result.includes('~/.claude/rules/prism/personas/persona-analyst-mary.md'));
    assert.ok(!result.includes('{PRISM_PERSONAS}'));
  });

  it('replaces routing token', () => {
    const input = '{PRISM_ROUTING}/routing-engine.md';
    const result = replaceTokens(input, testTargetDir);
    assert.ok(result.includes('routing/routing-engine.md'));
    assert.ok(!result.includes('{PRISM_ROUTING}'));
  });

  it('replaces skills token', () => {
    const input = '{PRISM_SKILLS}/create-persona/';
    const result = replaceTokens(input, testTargetDir);
    assert.ok(result.includes('skills/create-persona/'));
    assert.ok(!result.includes('{PRISM_SKILLS}'));
  });

  it('replaces claude-md token with base dir', () => {
    const input = '{PRISM_CLAUDE_MD}';
    const result = replaceTokens(input, testTargetDir);
    assert.ok(result.includes('~/.claude/rules/prism'));
    assert.ok(!result.includes('{PRISM_CLAUDE_MD}'));
  });

  it('replaces multiple tokens in same string', () => {
    const input = '{PRISM_PERSONAS}/mary.md and {PRISM_ROUTING}/engine.md';
    const result = replaceTokens(input, testTargetDir);
    assert.ok(!result.includes('{PRISM_PERSONAS}'));
    assert.ok(!result.includes('{PRISM_ROUTING}'));
  });

  it('returns unchanged string when no tokens present', () => {
    const input = 'No tokens here.';
    const result = replaceTokens(input, testTargetDir);
    assert.equal(result, 'No tokens here.');
  });
});
