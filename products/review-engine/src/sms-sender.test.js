import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatPhoneNumber, isValidPhone } from './sms-sender.js';

describe('formatPhoneNumber', () => {
  it('formats 10-digit US numbers', () => {
    assert.equal(formatPhoneNumber('7705551234'), '+17705551234');
  });

  it('formats 11-digit US numbers', () => {
    assert.equal(formatPhoneNumber('17705551234'), '+17705551234');
  });

  it('formats formatted numbers', () => {
    assert.equal(formatPhoneNumber('(770) 555-1234'), '+17705551234');
  });

  it('preserves E.164 format', () => {
    assert.equal(formatPhoneNumber('+17705551234'), '+17705551234');
  });

  it('handles dashes and dots', () => {
    assert.equal(formatPhoneNumber('770-555-1234'), '+17705551234');
    assert.equal(formatPhoneNumber('770.555.1234'), '+17705551234');
  });
});

describe('isValidPhone', () => {
  it('validates valid US numbers', () => {
    assert.ok(isValidPhone('7705551234'));
    assert.ok(isValidPhone('+17705551234'));
    assert.ok(isValidPhone('(770) 555-1234'));
  });

  it('rejects invalid numbers', () => {
    assert.ok(!isValidPhone('123'));
    assert.ok(!isValidPhone(''));
    assert.ok(!isValidPhone('abc'));
  });
});
