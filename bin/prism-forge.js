#!/usr/bin/env node

const args = process.argv.slice(2);
const command = args[0];

function getFlag(name) {
  const prefix = `--${name}=`;
  const eqArg = args.find(a => a.startsWith(prefix));
  if (eqArg) return eqArg.slice(prefix.length);
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && idx + 1 < args.length && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  if (idx !== -1) return true;
  return undefined;
}

function hasFlag(name) {
  return args.includes(`--${name}`);
}

const USAGE = `
  prism-forge -- PRISM Persona Routing Installer

  Usage:
    npx prism-forge install [--path <dir>]    Install PRISM to your Claude Code environment
    npx prism-forge uninstall [--force]        Remove PRISM installation
    npx prism-forge verify                     Check installation integrity

  Options:
    --path <dir>   Override default install directory (~/.claude/rules/prism/)
    --force        Force uninstall (delete entire directory, skip manifest)
    --help         Show this help message

  Examples:
    npx prism-forge install                    Install to default location
    npx prism-forge install --path ./prism     Install to custom directory
    npx prism-forge uninstall                  Remove installed files via manifest
    npx prism-forge uninstall --force          Remove entire install directory
    npx prism-forge verify                     Verify installation integrity
`.trim();

async function main() {
  if (!command || command === '--help' || command === '-h') {
    console.log(USAGE);
    process.exit(0);
  }

  switch (command) {
    case 'install': {
      const { runInstall } = await import('../lib/install.js');
      const pathOpt = getFlag('path');
      await runInstall({ path: pathOpt || undefined });
      break;
    }

    case 'uninstall': {
      const { runUninstall } = await import('../lib/uninstall.js');
      const pathOpt = getFlag('path');
      const force = hasFlag('force');
      await runUninstall({ path: pathOpt || undefined, force });
      break;
    }

    case 'verify': {
      const { runVerify } = await import('../lib/verify.js');
      const pathOpt = getFlag('path');
      const result = await runVerify(pathOpt || undefined);
      process.exit(result.failed > 0 ? 1 : 0);
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      console.log(USAGE);
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
