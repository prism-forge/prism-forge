#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';

// Parse CLI arguments
const args = process.argv.slice(2);
let since = 7;
let source = path.join(os.homedir(), '.claude', 'projects');
let limit = 0;
let jsonMode = false;

for (const arg of args) {
  if (arg.startsWith('--since=')) {
    since = parseInt(arg.slice(8), 10);
  } else if (arg.startsWith('--source=')) {
    source = arg.slice(9);
  } else if (arg.startsWith('--limit=')) {
    limit = parseInt(arg.slice(8), 10);
  } else if (arg === '--json') {
    jsonMode = true;
  }
}

// Compile regex patterns
const attributionRegex = /\*\*[A-Z][a-zA-Z. ]+ \([A-Z][a-zA-Z ]+\):\*\*/;
const substantiveRegex = /\b(recommend|should|would|option|path)\b/i;
const numberedListRegex = /^\d+\./m;
const codeBlockRegex = /```/;

// Helper: check if file was modified within last N days
function isRecentFile(filePath, days) {
  try {
    const stat = fs.statSync(filePath);
    const ageMs = Date.now() - stat.mtime.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    return ageDays <= days;
  } catch {
    return false;
  }
}

// Recursively find all .jsonl files in subdirs of source (one level deep)
function findJsonlFiles(rootDir) {
  const files = [];
  try {
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDir = path.join(rootDir, entry.name);
        try {
          const subEntries = fs.readdirSync(subDir);
          for (const file of subEntries) {
            if (file.endsWith('.jsonl')) {
              files.push(path.join(subDir, file));
            }
          }
        } catch {
          // Skip unreadable subdirs
        }
      }
    }
  } catch {
    // Source dir doesn't exist or can't be read
  }
  return files;
}

// Extract text content from message content (handle string or array format)
function extractContent(content) {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .filter(c => typeof c === 'object' && c.type === 'text')
      .map(c => c.text || '')
      .join(' ');
  }
  return '';
}

// Check if content is substantive
function isSubstantive(content) {
  if (content.length > 200) return true;
  if (substantiveRegex.test(content)) return true;
  if (numberedListRegex.test(content)) return true;
  if (codeBlockRegex.test(content)) return true;
  return false;
}

// Check if content has attribution
function hasAttribution(content) {
  return attributionRegex.test(content);
}

// Main analysis
const allFiles = findJsonlFiles(source);
const recentFiles = allFiles.filter(f => isRecentFile(f, since));
const sortedFiles = recentFiles.sort((a, b) => {
  const aTime = fs.statSync(a).mtime.getTime();
  const bTime = fs.statSync(b).mtime.getTime();
  return bTime - aTime;
});

const filesToProcess = limit > 0 ? sortedFiles.slice(0, limit) : sortedFiles;

let total = 0;
let attributed = 0;
let substantive = 0;
let subAttributed = 0;

for (const filePath of filesToProcess) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        if (obj.type !== 'assistant') continue;

        const msgContent = extractContent(obj.message?.content || '');
        if (!msgContent.trim()) continue;

        total += 1;

        if (hasAttribution(msgContent)) {
          attributed += 1;
        }

        if (isSubstantive(msgContent)) {
          substantive += 1;
          if (hasAttribution(msgContent)) {
            subAttributed += 1;
          }
        }
      } catch {
        // Skip malformed JSON lines
      }
    }
  } catch {
    // Skip unreadable files
  }
}

// Calculate percentages
const attributedPctAll = total > 0 ? ((attributed / total) * 100).toFixed(1) : 0;
const attributedPctSubstantive =
  substantive > 0 ? ((subAttributed / substantive) * 100).toFixed(1) : 0;
const driftPct = 100 - parseFloat(attributedPctSubstantive);
const targetDriftPct = 20.0;
const deltaFromTarget = driftPct - targetDriftPct;
const status = driftPct <= targetDriftPct ? 'PASS' : 'FAIL';

if (jsonMode) {
  const output = {
    source,
    since_days: since,
    sessions_analyzed: filesToProcess.length,
    total_turns: total,
    attributed_all: attributed,
    attributed_pct_all: parseFloat(attributedPctAll),
    substantive_turns: substantive,
    attributed_substantive: subAttributed,
    attributed_pct_substantive: parseFloat(attributedPctSubstantive),
    drift_pct_substantive: parseFloat(driftPct.toFixed(1)),
    target_drift_pct: targetDriftPct,
    status,
    delta_from_target_pct: parseFloat(deltaFromTarget.toFixed(1))
  };
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log('PRISM Drift Report');
  console.log('------------------');
  console.log(`Source: ${source}`);
  console.log(
    `Sessions analyzed: ${filesToProcess.length} (within last ${since} days)`
  );
  console.log(`Total assistant turns: ${total}`);
  console.log(`  All turns: ${attributed} attributed (${attributedPctAll}%)`);
  console.log(
    `  Substantive turns: ${substantive} total, ${subAttributed} attributed (${attributedPctSubstantive}%)`
  );
  console.log();
  console.log(`Drift rate (substantive): ${driftPct.toFixed(1)}%`);
  console.log(`Target: <${targetDriftPct}%`);
  console.log(
    `Status: ${status} (baseline ${deltaFromTarget >= 0 ? '+' : ''}${deltaFromTarget.toFixed(1)}%)`
  );
}

process.exit(0);
