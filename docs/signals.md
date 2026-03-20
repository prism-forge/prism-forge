# PRISM Forge Signal Reference

## Overview

Signals are the words and phrases that trigger persona activation. PRISM Forge uses three signal types:

- **Shared signals** -- Activate multiple personas simultaneously
- **Specialist signals** -- Exclusive to one persona
- **Context-disambiguated signals** -- Resolve based on surrounding context

Susie evaluates signals holistically -- not first-match-wins. All matching signals in a single message inform her team assembly decision. Multiple shared signals can produce a multi-persona team.

## Shared Signals

Signal phrases that co-activate all listed personas. All matching is case-insensitive and position-independent.

| Signal | Relevant Personas |
|--------|-------------------|
| "requirements" | Mary + John + Bob |
| "scope" | John + Bob |
| "review" | Quinn + Paige |
| "story" | Sophia + Campbell |
| "approach" | Bob + Victor |
| "design" | Spike + Sally |
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
| "refactor" | Amelia + Jobs + Musk |
| "roadmap" | Bob + John |
| "MVP" | Barry + John |
| "wireframe" | Sally + Spike |
| "chart" | Spike + Sophia |
| "what if" | Carson + Dali |
| "alternative" | de Bono + Carson |

## Specialist Signals

Each specialist persona has exclusive trigger signals. When these signals appear, the named persona is activated.

| Persona | Signals |
|---------|---------|
| Winston (Architect) | architecture, system design, data flow, source-to-target, pipeline, schema |
| John (Product Manager) | business value, stakeholder, ROI, deliverable, monthly report, why are we doing this |
| Paige (Technical Writer) | document, Confluence, field descriptions, write up, guide, spec |
| Carson (Brainstorming Coach) | brainstorm, ideas, ideate, brain dump, possibilities |
| Dr. Quinn (Creative Problem Solver) | root cause, stuck, solve, diagnose, blocked, can't figure out |
| Maya (Design Thinking Coach) | user perspective, empathy, use case, accessibility, pain points |
| Victor (Innovation Strategist) | strategy, better approach, rethink, pivot, is there a better way |
| Spike (Presentation Master) | layout, visual hierarchy, chart type, dashboard design, deck, visual design |
| Sophia (Storyteller) | tell the story, narrative arc, data story, frame the metrics, convey meaning |
| Sally (UX Designer) | user experience, UX, navigation, intuitive, confusing, user flow |
| Leonardo (Renaissance Polymath) | connections, cross-system, ecosystem, end-to-end, map the system |
| Dali (Surrealist Provocateur) | provoke me, break my assumptions, devil's advocate, flip it, reverse |
| de Bono (Lateral Thinker) | different approaches, six hats, thinking hats, another way, multiple approaches |
| Campbell (Mythic Storyteller) | hero's journey, through-line, monomyth, transformation |
| Jobs (Combinatorial Genius) | simplify, intersection, too complex, eliminate, feature creep, strip it down, reimagine, vision, product thinking, synthesize, breakthrough, transform, next level, connect the dots, what could this become |
| Barry (Quick Flow Solo Dev) | quick, just do it, one-off, ship it, quick fix, get it done |
| Boris (Type System Auditor) | type check, does this conform, is this consistent, structural review, validate structure, template check, Boris |
| Musk (Radical Reductionist) | first principles, why does this exist, why does this take so long, why is this so complex, over-engineered, too many steps, too many files, too expensive, idiot index, compress the timeline, delete the process, from scratch, too many layers, too many abstractions, what do the physics allow |

**Note:** Some shared signals also activate specialists. For example, shared "audit" also activates Boris; shared "refactor" also activates Musk; shared "arc" also activates Campbell.

## Context-Disambiguated Signals

These signals resolve differently based on modifier phrases in the message. They fire only when domain routing cannot unambiguously resolve a single match.

| Signal | Default Persona | Context Modifier -- Override |
|--------|----------------|------------------------------|
| "design" | Spike (visual) | + "architecture/system/pipeline" -- Winston only |
| "creative" | Carson (ideation) | + "stuck/blocked/can't figure out" -- Dr. Quinn only |
| "challenge" | Victor (strategic) | + "assumptions/opposite/provoke" -- Dali only |
| "explain" | Paige (documentation) | + "investigate/analyze/figure out" -- Mary only |

## Domain Registry

Susie consults this registry when evaluating user intent. Each row maps a work type to its primary owner and supporting personas.

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

## Mode Defaults

When no signal or domain match fires, Susie falls back to mode defaults:

| Mode | Default Persona(s) |
|------|-------------------|
| Ask | Mary (Business Analyst) |
| Agent | Amelia (Developer Agent) |
| Plan | Bob (Scrum Master) + John (Product Manager) |
| Unknown / none | Susie (Chief of Staff) |

## How Signals Are Processed

Susie evaluates signals holistically on every turn. She does not stop at the first match. All signals, domain matches, and intent categories are inputs to one team assembly decision.

A message like "Plan how to refactor the auth module -- I think it's too complex" contains:

- Intent: Plan + Build + Challenge
- Shared signal: "refactor" (Amelia + Jobs + Musk)
- Domain: Structuring a plan (Bob + John)
- Specialist signal: "too complex" (Jobs)

Susie assembles: Bob (lead, planning structure) + Jobs (simplification) + Victor (approach challenge) + Amelia (implementation perspective). She evaluates the full picture, not individual signal matches in isolation.
