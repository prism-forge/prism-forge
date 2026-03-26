import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { getDb, closeDb } from './database.js';
import { unlinkSync, existsSync } from 'fs';

const TEST_DB = './data/test-db.json';

after(() => {
  closeDb();
  if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
});

describe('database', () => {
  it('creates a new database file', () => {
    const db = getDb(TEST_DB);
    assert.ok(db);
    assert.ok(existsSync(TEST_DB));
  });

  it('inserts and retrieves records', () => {
    const db = getDb(TEST_DB);
    const biz = db.insert('businesses', { name: 'Test Business', phone: '555-1234' });

    assert.ok(biz.id);
    assert.equal(biz.name, 'Test Business');
    assert.ok(biz.created_at);

    const found = db.findById('businesses', biz.id);
    assert.equal(found.name, 'Test Business');
  });

  it('finds all with filter', () => {
    const db = getDb(TEST_DB);
    db.insert('customers', { business_id: 1, name: 'Alice' });
    db.insert('customers', { business_id: 1, name: 'Bob' });
    db.insert('customers', { business_id: 2, name: 'Charlie' });

    const biz1Customers = db.findAll('customers', { business_id: 1 });
    assert.equal(biz1Customers.length, 2);

    const biz2Customers = db.findAll('customers', { business_id: 2 });
    assert.equal(biz2Customers.length, 1);
  });

  it('updates records', () => {
    const db = getDb(TEST_DB);
    const biz = db.insert('businesses', { name: 'Old Name' });

    const updated = db.update('businesses', biz.id, { name: 'New Name' });
    assert.equal(updated.name, 'New Name');

    const fetched = db.findById('businesses', biz.id);
    assert.equal(fetched.name, 'New Name');
  });

  it('counts records', () => {
    const db = getDb(TEST_DB);
    const total = db.count('customers');
    assert.ok(total >= 3); // From previous test

    const filtered = db.count('customers', { business_id: 1 });
    assert.equal(filtered, 2);
  });

  it('queries with custom function', () => {
    const db = getDb(TEST_DB);
    const results = db.query('customers', c => c.name.startsWith('A'));
    assert.ok(results.length >= 1);
    assert.ok(results.every(r => r.name.startsWith('A')));
  });

  it('returns null for missing records', () => {
    const db = getDb(TEST_DB);
    assert.equal(db.findById('businesses', 99999), null);
    assert.equal(db.findOne('businesses', { name: 'NonExistent' }), null);
  });
});
