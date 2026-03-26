/**
 * Simple JSON file database for review engine MVP.
 * No native dependencies. Data stored in a single JSON file.
 * Good enough for hundreds of records. Replace with real DB when scaling.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const DEFAULT_PATH = './data/review-engine.json';

const EMPTY_DB = {
  businesses: [],
  customers: [],
  review_requests: [],
  campaigns: [],
  review_responses: [],
  _nextId: { businesses: 1, customers: 1, review_requests: 1, campaigns: 1, review_responses: 1 },
};

let data = null;
let dbPath = null;

export function getDb(path) {
  if (data) return createApi();

  dbPath = path || DEFAULT_PATH;
  const dir = dirname(dbPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  if (existsSync(dbPath)) {
    data = JSON.parse(readFileSync(dbPath, 'utf-8'));
  } else {
    data = structuredClone(EMPTY_DB);
    save();
  }

  return createApi();
}

function save() {
  writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function nextId(table) {
  const id = data._nextId[table];
  data._nextId[table] = id + 1;
  return id;
}

function createApi() {
  return {
    insert(table, record) {
      const id = nextId(table);
      const row = { id, ...record, created_at: new Date().toISOString() };
      data[table].push(row);
      save();
      return row;
    },

    findAll(table, filter) {
      let rows = data[table];
      if (filter) {
        rows = rows.filter(r => Object.entries(filter).every(([k, v]) => r[k] === v));
      }
      return rows;
    },

    findOne(table, filter) {
      return data[table].find(r => Object.entries(filter).every(([k, v]) => r[k] === v)) || null;
    },

    findById(table, id) {
      return data[table].find(r => r.id === id) || null;
    },

    update(table, id, updates) {
      const idx = data[table].findIndex(r => r.id === id);
      if (idx === -1) return null;
      data[table][idx] = { ...data[table][idx], ...updates };
      save();
      return data[table][idx];
    },

    count(table, filter) {
      if (!filter) return data[table].length;
      return data[table].filter(r => Object.entries(filter).every(([k, v]) => r[k] === v)).length;
    },

    query(table, fn) {
      return data[table].filter(fn);
    },

    raw() {
      return data;
    },
  };
}

export function closeDb() {
  if (data) save();
  data = null;
  dbPath = null;
}
