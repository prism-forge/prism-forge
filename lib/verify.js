import { join } from 'node:path';
import { readFile, access } from 'node:fs/promises';
import { getTargetDir, getClaudeMdPath } from './paths.js';
import { START_DELIMITER, END_DELIMITER } from './claude-md.js';

const EXPECTED_PERSONAS = [
  'persona-analyst-mary.md',
  'persona-architect-winston.md',
  'persona-brainstorm-coach-carson.md',
  'persona-chief-of-staff-susie.md',
  'persona-combinatorial-genius-jobs.md',
  'persona-creative-solver-dr-quinn.md',
  'persona-design-thinking-maya.md',
  'persona-dev-amelia.md',
  'persona-first-principles-musk.md',
  'persona-innovator-victor.md',
  'persona-lateral-thinker-debono.md',
  'persona-mythic-storyteller-campbell.md',
  'persona-pm-john.md',
  'persona-presentation-master-spike.md',
  'persona-qa-quinn.md',
  'persona-quick-flow-barry.md',
  'persona-renaissance-polymath-leonardo.md',
  'persona-scrum-master-bob.md',
  'persona-storyteller-sophia.md',
  'persona-surrealist-provocateur-dali.md',
  'persona-tech-writer-paige.md',
  'persona-type-system-auditor-boris.md',
  'persona-ux-designer-sally.md',
];

const REQUIRED_SECTIONS = [
  '## Identity',
  '## Communication Style',
  '## Principles',
  '## Domain Application',
  '## Signals',
];

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

function formatResult(result, isTTY) {
  const icon = result.ok
    ? (isTTY ? '\x1b[32m  \u2714  \x1b[0m' : '  PASS  ')
    : (isTTY ? '\x1b[31m  \u2718  \x1b[0m' : '  FAIL  ');
  return icon + result.name + (result.detail ? ` (${result.detail})` : '');
}

export async function runVerify(targetDir, options = {}) {
  const dir = getTargetDir(targetDir);
  const results = [];
  const isTTY = process.stdout.isTTY;
  const quiet = options.quiet || false;

  // 1. Persona files exist
  for (const file of EXPECTED_PERSONAS) {
    const filePath = join(dir, 'personas', file);
    const exists = await fileExists(filePath);
    results.push({ name: `Persona: ${file}`, ok: exists, detail: exists ? null : 'missing' });
  }

  // 2. Persona sections (skip manifest)
  for (const file of EXPECTED_PERSONAS) {
    if (file === 'persona-manifest.md') continue;
    const filePath = join(dir, 'personas', file);
    try {
      const content = await readFile(filePath, 'utf-8');
      for (const section of REQUIRED_SECTIONS) {
        const hasSection = new RegExp(`^${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm').test(content);
        results.push({
          name: `${file}: ${section}`,
          ok: hasSection,
          detail: hasSection ? null : 'section missing',
        });
      }
    } catch {
      // File missing — already caught above, skip section checks
    }
  }

  // 3. Routing engine
  const routingPath = join(dir, 'routing', 'routing-engine.md');
  const routingExists = await fileExists(routingPath);
  results.push({ name: 'Routing engine exists', ok: routingExists, detail: routingExists ? null : 'missing' });

  if (routingExists) {
    const routingContent = await readFile(routingPath, 'utf-8');
    const hasDefaults = /^##+ Mode Defaults/m.test(routingContent);
    const hasRegistry = /^##+ (Domain Registry|Intent Classification)/m.test(routingContent);
    const hasSusie = /^##+ (Session Start|Susie's Role)/m.test(routingContent);
    results.push({ name: 'Routing: Mode Defaults section', ok: hasDefaults });
    results.push({ name: 'Routing: Domain/Intent section', ok: hasRegistry });
    results.push({ name: 'Routing: Session orchestration section', ok: hasSusie });
  }

  // 4. Audit checklist
  const auditPath = join(dir, 'routing', 'audit-checklist.md');
  const auditExists = await fileExists(auditPath);
  results.push({ name: 'Audit checklist exists', ok: auditExists, detail: auditExists ? null : 'missing' });

  // 5. Skills
  const skillPath = join(dir, 'skills', 'create-persona', 'SKILL.md');
  const skillExists = await fileExists(skillPath);
  results.push({ name: 'Create-persona skill exists', ok: skillExists, detail: skillExists ? null : 'missing' });

  // 6. CLAUDE.md block
  const claudeMdPath = getClaudeMdPath();
  try {
    const claudeContent = await readFile(claudeMdPath, 'utf-8');
    const hasStart = claudeContent.includes(START_DELIMITER);
    const hasEnd = claudeContent.includes(END_DELIMITER);
    const hasRead = hasStart && hasEnd && /Read\s/.test(
      claudeContent.slice(claudeContent.indexOf(START_DELIMITER), claudeContent.indexOf(END_DELIMITER))
    );
    results.push({ name: 'CLAUDE.md has PRISM block', ok: hasStart && hasEnd, detail: hasStart && hasEnd ? null : 'delimiters missing' });
    results.push({ name: 'CLAUDE.md has Read directives', ok: hasRead, detail: hasRead ? null : 'no Read directives in block' });
  } catch {
    results.push({ name: 'CLAUDE.md has PRISM block', ok: false, detail: 'CLAUDE.md not found' });
    results.push({ name: 'CLAUDE.md has Read directives', ok: false, detail: 'CLAUDE.md not found' });
  }

  // Output
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;

  for (const r of results) {
    if (quiet && r.ok) continue;
    console.log(formatResult(r, isTTY));
  }

  console.log(`\n${passed}/${results.length} checks passed`);
  if (failed > 0) {
    console.log(`${failed} check(s) failed`);
  }

  return { passed, failed, total: results.length, results };
}
