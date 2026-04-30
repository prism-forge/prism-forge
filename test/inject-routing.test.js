import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOOK = path.resolve(__dirname, '..', 'src', 'hooks', 'prism_inject_routing.py');

function invoke(prompt, transcript_path = '') {
  const input = JSON.stringify({ prompt, cwd: '.', transcript_path });
  const r = spawnSync('python', [HOOK], { input, encoding: 'utf-8' });
  if (r.status !== 0) {
    throw new Error(`hook exited ${r.status}: ${r.stderr}`);
  }
  try {
    return JSON.parse(r.stdout);
  } catch (e) {
    throw new Error(`failed to parse hook output: ${r.stdout}`);
  }
}

describe('prism_inject_routing.py', () => {
  describe('hard overrides', () => {
    it('war room loads all 27 personas', () => {
      const out = invoke('war room');
      assert.match(out.additionalContext, /27 personas/);
    });

    it('explicit persona name activates named persona', () => {
      const out = invoke('Mary look at this');
      assert.match(out.additionalContext, /Mary/);
    });
  });

  describe('signal scan', () => {
    it('audit signal activates Mary, Quinn, and Boris', () => {
      const out = invoke('audit everything');
      const ctx = out.additionalContext;
      assert.match(ctx, /Mary/);
      assert.match(ctx, /Quinn/);
      assert.match(ctx, /Boris/);
    });

    it('design the pipeline activates Winston', () => {
      const out = invoke('design the pipeline');
      assert.match(out.additionalContext, /Winston/);
    });
  });

  describe('intent classification', () => {
    it('build intent activates Amelia', () => {
      const out = invoke('lets do this');
      assert.match(out.additionalContext, /Amelia/);
    });

    it('validate intent activates Quinn', () => {
      const out = invoke('is the data right');
      assert.match(out.additionalContext, /Quinn/);
    });

    it('refactor intent activates Jobs or Musk', () => {
      const out = invoke('clean this up');
      const ctx = out.additionalContext;
      assert.ok(/Jobs|Musk/.test(ctx), 'refactor should activate Jobs or Musk');
    });

    it('investigate intent activates Mary', () => {
      const out = invoke('what is happening');
      assert.match(out.additionalContext, /Mary/);
    });

    it('challenge intent activates Victor or Jobs', () => {
      const out = invoke('rework this');
      const ctx = out.additionalContext;
      assert.ok(/Victor|Jobs/.test(ctx), 'challenge should activate Victor or Jobs');
    });

    it('create intent activates Carson', () => {
      const out = invoke('think out loud');
      assert.match(out.additionalContext, /Carson/);
    });

    it('plan intent activates Bob or John', () => {
      const out = invoke('should we ship');
      const ctx = out.additionalContext;
      assert.ok(/Bob|John/.test(ctx), 'plan should activate Bob or John');
    });

    it('document intent activates Paige', () => {
      const out = invoke('document this');
      assert.match(out.additionalContext, /Paige/);
    });

    it('narrate intent activates Sophia', () => {
      const out = invoke('tell the story');
      assert.match(out.additionalContext, /Sophia/);
    });

    it('orient intent activates Susie', () => {
      const out = invoke('where are we');
      assert.match(out.additionalContext, /Susie/);
    });
  });

  describe('no-signal fallback', () => {
    it('random gibberish activates Susie (no-signal fallback)', () => {
      const out = invoke('random gibberish nothing here');
      assert.match(out.additionalContext, /Susie/);
      // No transcript_path provided, so is_turn_one returns false (cannot determine turn)
      // Cascade falls through to no-signal fallback
      assert.match(out.additionalContext, /no-signal fallback/);
    });
  });

  describe('empty prompt', () => {
    it('empty prompt emits silent JSON', () => {
      const out = invoke('');
      assert.deepEqual(out, {});
    });
  });

  describe('additional intent and signal cases', () => {
    it('trace signal activates Mary', () => {
      const out = invoke('trace this');
      assert.match(out.additionalContext, /Mary/);
    });

    it('what if signal activates Carson or Dali', () => {
      const out = invoke('what if');
      const ctx = out.additionalContext;
      assert.ok(/Carson|Dali/.test(ctx), 'what if should activate Carson or Dali');
    });

    it('verify signal activates Quinn', () => {
      const out = invoke('verify');
      assert.match(out.additionalContext, /Quinn/);
    });

    it('frame this intent activates Sophia', () => {
      const out = invoke('frame this');
      assert.match(out.additionalContext, /Sophia/);
    });

    it('looks broken intent activates Mary (investigate)', () => {
      const out = invoke('looks broken');
      assert.match(out.additionalContext, /Mary/);
    });

    it('is not working signal activates Dr. Quinn (specialist signal)', () => {
      const out = invoke('is not working');
      assert.match(out.additionalContext, /Dr. Quinn/);
    });

    it('next step intent activates Bob or John (plan)', () => {
      const out = invoke('next step');
      const ctx = out.additionalContext;
      assert.ok(/Bob|John/.test(ctx), 'plan should activate Bob or John');
    });

    it('let\'s build intent activates Amelia (build)', () => {
      const out = invoke("let's build");
      assert.match(out.additionalContext, /Amelia/);
    });

    it('catch me up intent activates Susie (orient)', () => {
      const out = invoke('catch me up');
      assert.match(out.additionalContext, /Susie/);
    });

    it('write up intent activates Paige (document)', () => {
      const out = invoke('write up');
      assert.match(out.additionalContext, /Paige/);
    });
  });

  describe('Barry signals (git/GitHub/release ops)', () => {
    it('audit everything should have Boris before Mary in team order', () => {
      const out = invoke('audit everything');
      const ac = out.additionalContext;
      const borisIdx = ac.indexOf('Boris');
      const maryIdx = ac.indexOf('Mary');
      assert(borisIdx > -1 && (maryIdx === -1 || borisIdx < maryIdx), 'Boris must precede Mary in audit team');
    });

    it('audit signal contains Boris', () => {
      const out = invoke('audit this');
      assert.match(out.additionalContext, /Boris/);
    });

    it('fix up github activates Barry', () => {
      const out = invoke('fix up github');
      assert.match(out.additionalContext, /Barry/);
    });

    it('open a PR activates Barry', () => {
      const out = invoke('open a PR');
      assert.match(out.additionalContext, /Barry/);
    });

    it('push the branch activates Barry', () => {
      const out = invoke('push the branch');
      assert.match(out.additionalContext, /Barry/);
    });

    it('npm publish activates Barry', () => {
      const out = invoke('npm publish');
      assert.match(out.additionalContext, /Barry/);
    });

    it('git push origin activates Barry', () => {
      const out = invoke('git push origin');
      assert.match(out.additionalContext, /Barry/);
    });

    it('version bump activates Barry', () => {
      const out = invoke('version bump');
      assert.match(out.additionalContext, /Barry/);
    });
  });
});
