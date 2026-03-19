# Persona Manifest

> Human reference document. Not loaded by Claude at runtime.
> Last updated: 2026-03-19
> Total: 23 personas (4 always-on + 18 specialists + 1 dynamic orchestrator)

---

## How to Use This Manifest

Always-on personas (Mary, Amelia, Bob, Quinn) are preloaded in every Claude Code session via the global CLAUDE.md reference -- they respond without any explicit invocation. Specialist personas are loaded on-demand when routing-engine.md detects their trigger signals and executes a Read directive pointing to the persona file. Susie (Chief of Staff) is the dynamic orchestrator -- she activates unconditionally on Turn 1, then evaluates every subsequent message to assemble the right persona team. She classifies user intent, selects primary and supporting personas, and manages multi-persona conversations. The routing engine is Susie's orchestration manual.

---

## Always-On Personas

These 4 personas are preloaded in every Claude Code session via the global CLAUDE.md reference.

| Name | Role | File | Mode Default | Key Signals |
|------|------|------|--------------|-------------|
| Mary | Business Analyst | persona-analyst-mary.md | Ask mode | requirements, explore, assess, audit, deep dive, what's the context, figure out, narrative, arc, story |
| Amelia | Developer Agent | persona-dev-amelia.md | Agent mode | refactor (with Jobs); suppressed in Plan mode |
| Bob | Scrum Master | persona-scrum-master-bob.md | Plan mode (with John) | requirements, scope, validate, assess, approach, roadmap, MVP |
| Quinn | QA Engineer | persona-qa-quinn.md | Any mode when validation/testing/debugging present | review, validate, troubleshoot, audit, assess, figure out |

---

## Dynamic Orchestrator

| Name | Role | File | Activation | Key Behavior |
|------|------|------|------------|--------------|
| Susie | Chief of Staff / Dynamic Orchestrator | persona-chief-of-staff-susie.md | Turn 1 unconditional + per-turn orchestration + no-signal fallback | Turn 1: sitrep (Active/Blocked/Stale/Recommended). Every turn: classifies intent, assembles persona team (primary + supporting), manages multi-persona responses. War room: active moderator. Fallback: holds floor when no signal fires. |

---

## Specialist Personas (On-Demand)

These 17 personas are loaded on-demand when Susie determines they are needed based on intent classification, domain matching, and signal detection. The routing engine executes a Read directive to load the persona file.

| Name | Role | File | Trigger Signals |
|------|------|------|-----------------|
| Winston | Architect | persona-architect-winston.md | architecture, system design, data flow, source-to-target, pipeline, schema |
| John | Product Manager | persona-pm-john.md | business value, stakeholder, ROI, deliverable, monthly report, why are we doing this |
| Paige | Technical Writer | persona-tech-writer-paige.md | document, Confluence, field descriptions, write up, guide, spec |
| Carson | Brainstorming Coach | persona-brainstorm-coach-carson.md | brainstorm, ideas, what if, ideate, brain dump, possibilities |
| Dr. Quinn | Creative Problem Solver | persona-creative-solver-dr-quinn.md | root cause, stuck, solve, diagnose, blocked, can't figure out |
| Maya | Design Thinking Coach | persona-design-thinking-maya.md | user perspective, empathy, use case, accessibility, pain points |
| Victor | Innovation Strategist | persona-innovator-victor.md | strategy, better approach, rethink, pivot, is there a better way |
| Spike | Presentation Master | persona-presentation-master-spike.md | layout, visual hierarchy, chart type, dashboard design, deck, visual design |
| Sophia | Storyteller | persona-storyteller-sophia.md | tell the story, narrative arc, data story, frame the metrics, convey meaning |
| Sally | UX Designer | persona-ux-designer-sally.md | user experience, UX, navigation, intuitive, confusing, user flow |
| Leonardo | Renaissance Polymath | persona-renaissance-polymath-leonardo.md | connections, cross-system, ecosystem, end-to-end, map the system |
| Dali | Surrealist Provocateur | persona-surrealist-provocateur-dali.md | provoke me, break my assumptions, devil's advocate, flip it, reverse |
| de Bono | Lateral Thinker | persona-lateral-thinker-debono.md | different approaches, six hats, thinking hats, another way, multiple approaches |
| Campbell | Mythic Storyteller | persona-mythic-storyteller-campbell.md | hero's journey, through-line, arc, monomyth, transformation |
| Jobs | Combinatorial Genius | persona-combinatorial-genius-jobs.md | simplify, intersection, too complex, eliminate, feature creep, strip it down, reimagine, vision, product thinking, synthesize, breakthrough, transform, next level, connect the dots, what could this become |
| Barry | Quick Flow Solo Dev | persona-quick-flow-barry.md | quick, just do it, one-off, ship it, quick fix, get it done |
| Boris | Type System Auditor | persona-type-system-auditor-boris.md | audit, type check, does this conform, is this consistent, structural review, validate structure, template check, Boris |
| Elon | First-Principles Engineer | persona-first-principles-elon.md | first principles, why does this take so long, why is this so complex, over-engineered, too many steps, too many files, too expensive, idiot index, compress the timeline, delete the process, from scratch |

---

## Signal Coverage Map

### By Domain

Susie consults this registry when evaluating user intent. It is a reference guide for team assembly, not a rigid lookup pipeline.

| Domain | Primary Owner | Supporting | Notes |
|--------|--------------|------------|-------|
| Analyzing/investigating existing state | Mary | Winston (if architecture) | Exploration, discovery, fact-gathering |
| Structuring a plan, task list, or checklist | Bob | John (if scope decisions) | Sequencing, breakdown, dependencies |
| Executing/building/editing files or code | Amelia | Barry (if one-off) | Implementation, file operations |
| Validating/testing/QA correctness | Quinn | Dr. Quinn (if root cause), Bob (if plans or AC) | Truth-verification, acceptance criteria |
| Reviewing/critiquing a deliverable for quality | Quinn | Jobs (if simplification relevant), Paige (if documentation), Sally (if readability/UX) | Quality judgment, fitness assessment |
| Challenging value, scoping, or prioritizing | John | Bob (if task impact) | Scope validation, ROI assessment |
| Designing visual layout or presentation | Spike | Sally (UX flow) | Visual hierarchy, dashboard, deck |
| Designing user experience or interaction flow | Sally | Maya (empathy) | Navigation, user flow, intuitiveness |
| Designing system or data architecture | Winston | -- | Infrastructure, data model, schema |
| Writing documentation or descriptions | Paige | -- | Confluence, specs, guides |
| Brainstorming/ideation/divergent thinking | Carson | Dali (if provoking) | Idea generation, exploration |
| Creative problem-solving on stuck issues | Dr. Quinn | -- | Root cause, unblock, alternative approaches |
| Simplifying/cutting/reducing complexity | Jobs | -- | Feature creep, intersection thinking, reduction |
| Framing a narrative or data story | Sophia | Campbell (if journey) | Story arc, metrics narrative, meaning |
| Challenging assumptions or inverting defaults | Dali | de Bono (if structured) | Provocation, reversal, assumption inversion |
| Strategic rethinking or process improvement | Victor | -- | Approach rethinking, process redesign |
| Quick one-off execution, minimal ceremony | Barry | -- | Fast builds, MVP-quick execution |
| Cross-system connections or holistic mapping | Leonardo | -- | End-to-end view, ecosystem connections |
| User empathy or persona-based thinking | Maya | Sally | User perspective, accessibility, pain points |
| Lateral thinking or structured alternatives | de Bono | -- | Six thinking hats, alternative generation |
| Mythic/journey/arc framing | Campbell | Sophia | Hero's journey, monomyth, arc narrative |
| Structural validation, template conformance, drift prevention | Boris | Quinn (if correctness), Mary (if audit) | Type checking, conformance, template alignment |
| Orientation, triage, session startup, state awareness | Susie | Mary (if analysis needed), Bob (if planning needed) | Sitrep, context synthesis, where we are |

### Shared Signals

Signal phrases that inform Susie's team assembly. When a signal appears, listed personas are RELEVANT -- Susie decides which to activate based on full message context.

| Signal | Relevant Personas |
|--------|-------------------|
| "requirements" | Mary + John + Bob |
| "scope" | John + Bob |
| "review" | Quinn + Paige |
| "story" | Sophia + Campbell |
| "approach" | Bob + Victor |
| "design" (no modifier) | Spike + Sally |
| "narrative" | Sophia + John |
| "explore" | Mary + Carson |
| "arc" | Sophia + Campbell |
| "break the pattern" | Dali + de Bono |
| "validate" | Quinn + Bob |
| "troubleshoot" | Quinn + Dr. Quinn |
| "audit" | Mary + Quinn + Boris |
| "assess" | Mary + Bob |
| "deep dive" | Mary + Winston |
| "what's the context" | Mary + John |
| "figure out" | Mary + Dr. Quinn |
| "refactor" | Amelia + Jobs |
| "roadmap" | Bob + John |
| "MVP" | Barry + John |
| "wireframe" | Sally + Spike |
| "chart" | Spike + Sophia |
| "what if" | Carson + Dali |
| "alternative" | de Bono + Carson |

---

## Routing Quick Reference

Susie evaluates each message and assembles the right team. Common patterns:

| User Intent | Activates |
|-------------|-----------|
| "I'm stuck" / "can't figure this out" | Dr. Quinn (Creative Problem Solver) |
| "Let's plan this out" | Bob (Scrum Master) + John (Product Manager) |
| "How should this be architected?" | Winston (Architect) |
| "Simplify this" / "too complex" | Jobs (Combinatorial Genius) |
| "What are my options?" | de Bono (Lateral Thinker) |
| "Tell me a story about this data" | Sophia (Storyteller) |
| "Just do it" / "quick fix" | Barry (Quick Flow Solo Dev) |
| "Does this conform to the template?" | Boris (Type System Auditor) |
| "What's the user experience here?" | Sally (UX Designer) + Maya (Design Thinking Coach) |
| "What's the business case?" | John (Product Manager) |
| Start of a new session | Susie (Chief of Staff) -- unconditional on Turn 1 |
| "Plan how to refactor the auth module" | Bob (lead) + Jobs + Victor + Amelia (Susie assembles multi-persona team) |

---

## Installation

Install target for all persona files:
`{PRISM_PERSONAS}/`

Always-on personas (Mary, Amelia, Bob, Quinn) are referenced in `{PRISM_CLAUDE_MD}`.
Specialist personas are referenced in `{PRISM_ROUTING}/routing-engine.md` via Read directives.
Susie (Chief of Staff / Dynamic Orchestrator) is referenced in `{PRISM_ROUTING}/routing-engine.md` as the orchestration subject.

To install all persona files:
```bash
npx prism-forge install
```
