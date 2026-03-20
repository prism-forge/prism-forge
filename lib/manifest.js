import { join, relative } from 'node:path';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { hashFile } from './hash.js';
import { getSourceDir } from './paths.js';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

export async function buildManifest(sourceDir) {
  const src = sourceDir || getSourceDir();
  const allFiles = await walk(src);
  const manifest = {
    version: '1.0',
    created: new Date().toISOString(),
    files: {},
  };
  for (const filePath of allFiles) {
    const rel = relative(src, filePath).replace(/\\/g, '/');
    const hash = await hashFile(filePath);
    manifest.files[rel] = { hash };
  }
  return manifest;
}

export async function readManifest(targetDir) {
  const manifestPath = join(targetDir, 'prism-manifest.json');
  try {
    const content = await readFile(manifestPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function writeManifest(targetDir, manifest) {
  const manifestPath = join(targetDir, 'prism-manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
}
