import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { replaceTokens } from './tokens.js';
import { getSourceDir, getClaudeMdPath } from './paths.js';

const START_DELIMITER = '<!-- PRISM:START -->';
const END_DELIMITER = '<!-- PRISM:END -->';

async function getBlockContent(targetDir) {
  const sourceDir = getSourceDir();
  const blockPath = join(sourceDir, 'routing', 'claude-md-block.md');
  const raw = await readFile(blockPath, 'utf-8');
  return replaceTokens(raw, targetDir);
}

function wrapBlock(content) {
  return `${START_DELIMITER}\n${content.trim()}\n${END_DELIMITER}`;
}

export async function injectBlock(targetDir, claudeMdPath) {
  const mdPath = claudeMdPath || getClaudeMdPath();
  const blockContent = await getBlockContent(targetDir);
  const wrapped = wrapBlock(blockContent);

  let existing = '';
  try {
    existing = await readFile(mdPath, 'utf-8');
  } catch {
    await mkdir(dirname(mdPath), { recursive: true });
    await writeFile(mdPath, wrapped + '\n', 'utf-8');
    return 'created';
  }

  const startIdx = existing.indexOf(START_DELIMITER);
  const endIdx = existing.indexOf(END_DELIMITER);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const before = existing.slice(0, startIdx);
    const after = existing.slice(endIdx + END_DELIMITER.length);
    await writeFile(mdPath, before + wrapped + after, 'utf-8');
    return 'replaced';
  }

  const separator = existing.endsWith('\n') ? '\n' : '\n\n';
  await writeFile(mdPath, existing + separator + wrapped + '\n', 'utf-8');
  return 'appended';
}

export async function removeBlock(claudeMdPath) {
  const mdPath = claudeMdPath || getClaudeMdPath();

  let content;
  try {
    content = await readFile(mdPath, 'utf-8');
  } catch {
    return false;
  }

  const startIdx = content.indexOf(START_DELIMITER);
  const endIdx = content.indexOf(END_DELIMITER);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return false;
  }

  const before = content.slice(0, startIdx);
  const after = content.slice(endIdx + END_DELIMITER.length);
  const cleaned = (before + after).replace(/\n{3,}/g, '\n\n').trim();

  if (cleaned.length === 0) {
    await writeFile(mdPath, '', 'utf-8');
  } else {
    await writeFile(mdPath, cleaned + '\n', 'utf-8');
  }
  return true;
}

export { START_DELIMITER, END_DELIMITER };
