import { tildePathCustom, getDefaultTargetDir } from './paths.js';

const TOKEN_MAP = {
  '{PRISM_PERSONAS}': 'personas',
  '{PRISM_ROUTING}': 'routing',
  '{PRISM_SKILLS}': 'skills',
  '{PRISM_CLAUDE_MD}': '',
};

export function replaceTokens(content, targetDir) {
  const dir = targetDir || getDefaultTargetDir();
  let result = content;
  for (const [token, subpath] of Object.entries(TOKEN_MAP)) {
    const replacement = tildePathCustom(dir, subpath || undefined);
    result = result.replaceAll(token, replacement);
  }
  return result;
}
