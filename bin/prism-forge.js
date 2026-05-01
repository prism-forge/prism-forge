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
    npx prism-forge install [--path <dir>]       Install PRISM to your Claude Code environment
    npx prism-forge uninstall [--force]           Remove PRISM installation
    npx prism-forge verify [--drift]              Check installation integrity
    npx prism-forge drift [options]               Check for configuration drift

  Options:
    --path <dir>   Override default install directory (~/.claude/rules/prism/)
    --force        Force uninstall (delete entire directory, skip manifest)
    --drift        Run drift check with verify (equivalent to: drift subcommand)
    --help         Show this help message

  Examples:
    npx prism-forge install                      Install to default location
    npx prism-forge install --path ./prism       Install to custom directory
    npx prism-forge uninstall                    Remove installed files via manifest
    npx prism-forge uninstall --force            Remove entire install directory
    npx prism-forge verify                       Verify installation integrity
    npx prism-forge verify --drift               Run drift detection during verify
    npx prism-forge drift                        Check for configuration drift
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
      const driftFlag = hasFlag('drift');
      if (driftFlag) {
        // Delegate to drift script
        const { spawnSync } = await import('child_process');
        const path = await import('node:path');
        const driftScript = path.join(process.cwd(), 'bin', 'prism-drift.js');
        const result = spawnSync('node', [driftScript, ...args.slice(1)], { stdio: 'inherit' });
        process.exit(result.status ?? 0);
      } else {
        const result = await runVerify(pathOpt || undefined);
        process.exit(result.failed > 0 ? 1 : 0);
      }
      break;
    }

    case 'drift': {
      const { spawnSync } = await import('child_process');
      const path = await import('node:path');
      const driftScript = path.join(process.cwd(), 'bin', 'prism-drift.js');
      const result = spawnSync('node', [driftScript, ...args.slice(1)], { stdio: 'inherit' });
      process.exit(result.status ?? 0);
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
