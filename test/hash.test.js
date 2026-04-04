import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hashString } from '../lib/hash.js';

describe('hashString', () => {
  it('returns consistent SHA-256 hex digest', () => {
    const hash = hashString('hello world');
    assert.equal(hash, 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
  });

  it('returns different hash for different input', () => {
    const a = hashString('hello');
    const b = hashString('world');
    assert.notEqual(a, b);
  });

  it('returns 64-character hex string', () => {
    const hash = hashString('test');
    assert.equal(hash.length, 64);
    assert.match(hash, /^[a-f0-9]+$/);
  });
});
