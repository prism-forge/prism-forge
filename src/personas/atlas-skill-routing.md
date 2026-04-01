# Atlas Skill-Routing Tables

> Atlas-Skill Integration Signal Reference
> Last updated: 2026-03-31
> Status: Final

---

## Overview

This document defines the two-layer signal system for routing user messages through Atlas (Growth Strategist) to the correct marketing skill. Atlas is backed by 9 marketing skills at `~/.claude/skills/marketing/`. When Atlas is active (or marketing signals fire), Susie hands the floor to Atlas, who then determines which skill best serves the request.

**Signal Types:**
- **Type A (Direct):** Explicit skill invocation -- user names the skill or its core action
- **Type B (Pattern+Input):** Natural language patterns that map to skills based on phrasing and context
- **Type C (Context Fallback):** When Atlas is active but no Type A/B signal fires, message context determines skill

**Routing Order:** Type A checked first (exact match), then Type B (pattern match), then Type C (context inference). First match wins unless a conflict resolution rule overrides.

---

## 1. Per-Skill Signal Tables

---

### 1.1 content-strategy

**Purpose:** Planning what content to create, topic clusters, editorial calendars, content pillars. Strategy-level -- not writing the content itself.

#### Type A -- Direct Invocation

| Signal Phrase | Notes |
|---------------|-------|
| "content strategy" | Primary trigger |
| "plan my content" | |
| "content planning" | |
| "editorial calendar" | |
| "content roadmap" | |
| "topic clusters" | |
| "content pillars" | |
| "blog strategy" | |

#### Type B -- Natural Language Patterns

| Pattern | Example | Notes |
|---------|---------|-------|
| "what should I write about" | "I don't know what to write about for our blog" | Ideation at the strategy level |
| "what content should I create" | "What content should I create for launch?" | |
| "content ideas" | "Give me content ideas for developer tools" | Strategy-level ideation, not writing |
| "blog topics" | "What blog topics should we cover?" | |
| "I don't know what to write" | "I don't know what to write next" | Stuck on direction, not on copy |
| "what topics should we cover" | "What topics should we cover this quarter?" | |
| "content marketing plan" | "Help me build a content marketing plan" | |
| "what should our blog focus on" | "What should our blog focus on?" | |
| "content calendar" | "Build me a content calendar for Q2" | Calendar = strategy |
| "keyword research for content" | "Do keyword research for our content" | Research feeding strategy |
| "hub and spoke" | "Set up a hub and spoke for project management" | Specific content-strategy framework |
| "buyer stage content" | "What content do we need at each buyer stage?" | |
| "content prioritization" | "Help me prioritize these content ideas" | |
| "competitor content analysis" | "What content are our competitors producing?" | |
| "searchable vs shareable" | "Should this be searchable or shareable content?" | Content-strategy framework term |
| "content gap" | "Where are the content gaps in our market?" | |
| "what's working in our content" | "What's working in our blog right now?" | Audit of content effectiveness |

#### Type C -- Context Indicators

- Atlas is active AND user asks about planning multiple pieces of content (not writing one piece)
- User provides keyword data, call transcripts, or survey data for content planning
- Discussion involves content formats, publishing frequency, or audience targeting at the portfolio level
- User references a quarter, month, or time period in relation to content

#### Negative Signals (do NOT route here)

- "Write a blog post about X" -- this is copywriting, not strategy
- "Write a LinkedIn post" -- this is social-content
- "SEO audit" -- this is seo-audit
- Single-piece writing requests -- copywriting or social-content

---

### 1.2 copy-editing

**Purpose:** Reviewing, editing, and improving existing marketing copy. The copy already exists; the user wants it better.

#### Type A -- Direct Invocation

| Signal Phrase | Notes |
|---------------|-------|
| "edit this copy" | Primary trigger |
| "copy editing" / "copy-editing" | |
| "copy sweep" | Seven Sweeps framework |
| "proofread this" | |
| "review my copy" | |
| "copy feedback" | |
| "run the seven sweeps" | Specific framework invocation |
| "edit my marketing copy" | |

#### Type B -- Natural Language Patterns

| Pattern | Example | Notes |
|---------|---------|-------|
| "make this better" | "Can you make this landing page copy better?" | Existing copy + improvement request |
| "tighten this up" | "Tighten up this homepage copy" | |
| "this reads awkwardly" | "This paragraph reads awkwardly" | Identifying a problem in existing copy |
| "clean up this text" | "Clean up the text on our pricing page" | |
| "too wordy" | "This is too wordy, cut it down" | |
| "sharpen the messaging" | "Sharpen the messaging on this page" | |
| "polish this" | "Polish this draft before we publish" | |
| "make it punchier" | "Make this headline punchier" | |
| "make it shorter" | "Make this section shorter" | Reduction = editing |
| "make it clearer" | "Make this description clearer" | Clarity = editing |
| "this doesn't flow" | "The copy on this page doesn't flow well" | |
| "too much jargon" | "There's too much jargon in this copy" | |
| "sounds corporate" | "This sounds too corporate, humanize it" | |
| "cut the filler" | "Cut the filler from this page" | |
| "the tone is off" | "The tone is off on this email" | Voice/tone sweep |
| "needs more proof" | "This landing page needs more proof points" | Prove It sweep |
| "where's the benefit" | "This just lists features -- where's the benefit?" | So What sweep |
| "feels flat" | "This copy feels flat and informational" | Heightened Emotion sweep |
| "weak CTA" | "The CTA is weak, fix it" | Zero Risk sweep |
| "check this for clarity" | "Check this draft for clarity" | Clarity sweep |

#### Type C -- Context Indicators

- User pastes existing copy and asks for feedback or improvement
- User references a specific page or section that already has copy
- Discussion involves improving, not creating from scratch
- User has a draft and wants a review pass

#### Negative Signals (do NOT route here)

- "Write copy for our homepage" -- this is copywriting (new, not editing)
- "Write a new tagline" -- this is copywriting
- No existing copy provided -- if starting from scratch, route to copywriting

---

### 1.3 copywriting

**Purpose:** Writing new marketing copy from scratch -- headlines, landing pages, CTAs, value propositions, page sections.

#### Type A -- Direct Invocation

| Signal Phrase | Notes |
|---------------|-------|
| "write copy for" | Primary trigger |
| "copywriting" | |
| "marketing copy" | |
| "write a headline" | |
| "write a tagline" | |
| "write a value proposition" | |
| "hero section copy" | |
| "write landing page copy" | |

#### Type B -- Natural Language Patterns

| Pattern | Example | Notes |
|---------|---------|-------|
| "headline help" | "I need headline help for our product page" | |
| "CTA copy" | "Write CTA copy for the free trial button" | |
| "above the fold" | "What should go above the fold?" | |
| "this copy is weak" | "The homepage copy is weak, rewrite it" | Rewrite = new copy |
| "make this more compelling" | "Make this product description more compelling" | When it's a rewrite, not an edit |
| "help me describe my product" | "Help me describe what we do on the homepage" | Only when page/audience context present; without page context -> product-marketing-context (Rule 5) |
| "subheadline" | "Write a subheadline for this section" | |
| "rewrite this page" | "Rewrite the pricing page from scratch" | From-scratch = copywriting |
| "write the homepage" | "Write the homepage for our SaaS" | |
| "what should this page say" | "What should the feature page say?" | |
| "how do I explain what we do" | "How do I explain what we do to developers?" | Messaging/positioning at copy level; without page/audience context -> product-marketing-context (Rule 5) |
| "pricing page copy" | "Write copy for our pricing page" | |
| "feature page copy" | "Write the feature page for our API" | |
| "about page copy" | "Write our about page" | |
| "product description" | "Write a product description for the marketplace" | |
| "write a CTA" | "Write a CTA for the bottom of this page" | |
| "how should we position this" | "How should we position this feature?" | Positioning expressed as copy |
| "sell this feature" | "Help me sell this feature on the landing page" | |

#### Type C -- Context Indicators

- User describes a page type (homepage, landing page, pricing, feature, about) and needs text
- User provides product/audience context and wants persuasive text output
- Discussion involves conversion-oriented writing for web pages
- User needs copy for a specific section of a website

#### Negative Signals (do NOT route here)

- "Edit this copy" -- this is copy-editing
- "Write a LinkedIn post" -- this is social-content
- "Write a blog post" -- this starts as content-strategy for planning, then copywriting for the actual writing
- "What should I write about" -- this is content-strategy

---

### 1.4 launch-strategy

**Purpose:** Planning product launches, feature announcements, release strategies, go-to-market execution for a specific launch moment.

#### Type A -- Direct Invocation

| Signal Phrase | Notes |
|---------------|-------|
| "launch strategy" | Primary trigger |
| "launch plan" | |
| "launch checklist" | |
| "Product Hunt launch" | |
| "go-to-market" / "GTM plan" | |
| "product launch" | |
| "feature launch" | |
| "beta launch" | |

#### Type B -- Natural Language Patterns

| Pattern | Example | Notes |
|---------|---------|-------|
| "how do I launch this" | "How do I launch this new feature?" | |
| "we're about to ship" | "We're about to ship v2, what's the plan?" | |
| "feature release" | "Plan the feature release for next month" | |
| "announcement strategy" | "What's our announcement strategy?" | |
| "early access" | "Set up an early access program" | |
| "waitlist" | "Should we do a waitlist before launch?" | |
| "product update announcement" | "How should we announce this product update?" | |
| "launch day plan" | "What should we do on launch day?" | |
| "pre-launch" | "What do we need to do pre-launch?" | |
| "post-launch" | "What comes after launch?" | |
| "alpha launch" | "Plan our alpha launch" | |
| "general availability" | "We're going GA next week" | |
| "when should we launch" | "When's the right time to launch?" | |
| "launch on Product Hunt" | "Should we launch on Product Hunt?" | |
| "build hype" | "How do we build hype before the release?" | |
| "owned vs rented channels" | "Should we focus on owned or rented channels?" | ORB framework term |
| "borrowed channels" | "What borrowed channels can we use?" | ORB framework term |
| "stagger the release" | "Should we stagger the release?" | |
| "how much fanfare" | "How much marketing does this update deserve?" | Announcement prioritization |

#### Type C -- Context Indicators

- User mentions a ship date, release date, or upcoming milestone
- Discussion involves coordinating multiple channels around a single event
- User references phases (alpha, beta, early access, GA)
- User is preparing assets, listings, or announcements for a public release

#### Negative Signals (do NOT route here)

- "Marketing ideas" without a specific launch -- this is marketing-ideas
- "Content calendar" -- this is content-strategy or social-content
- "Write the announcement post" -- this is copywriting or social-content (launch-strategy plans the strategy; other skills write the actual content)
- Ongoing marketing with no launch anchor -- marketing-ideas

---

### 1.5 marketing-ideas

**Purpose:** Brainstorming marketing tactics, discovering new growth strategies, getting unstuck on how to promote. The "what else can I try" skill.

#### Type A -- Direct Invocation

| Signal Phrase | Notes |
|---------------|-------|
| "marketing ideas" | Primary trigger |
| "growth ideas" | |
| "marketing strategies" | |
| "marketing tactics" | |
| "ways to promote" | |
| "brainstorm marketing" | |
| "how to market this" | |

#### Type B -- Natural Language Patterns

| Pattern | Example | Notes |
|---------|---------|-------|
| "what marketing should I do" | "What marketing should I do this quarter?" | |
| "ideas to grow" | "Give me ideas to grow our user base" | |
| "I don't know how to market this" | "I built a great product but don't know how to market it" | |
| "what else can I try" | "SEO is working but what else can I try?" | |
| "how do I get users" | "How do I get my first 100 users?" | |
| "nobody knows about this" | "We built something great but nobody knows about it" | |
| "marketing on a budget" | "What can I do with zero marketing budget?" | |
| "growth hacks" | "Any growth hacks for a dev tool?" | |
| "what's working for SaaS" | "What marketing is working for SaaS right now?" | |
| "product-led growth ideas" | "Give me product-led growth ideas" | |
| "viral marketing" | "How can we make this go viral?" | |
| "low-budget marketing" | "What marketing works with $500/month?" | |
| "marketing for early stage" | "What marketing should an early-stage startup do?" | |
| "enterprise marketing" | "How do we market to enterprise?" | |
| "developer marketing" | "How do we market to developers?" | |
| "how do competitors market" | "How do our competitors market themselves?" | |
| "marketing playbook" | "Give me a marketing playbook for our stage" | |
| "unconventional marketing" | "Any unconventional marketing ideas?" | |
| "free tool marketing" | "Should we build a free tool for lead gen?" | Engineering as marketing |
| "engineering as marketing" | "Can we use engineering as marketing?" | Free tools, calculators, generators |

#### Type C -- Context Indicators

- User is exploring options without committing to a specific channel or tactic
- Discussion is high-level "what should we do" rather than "how do we execute this specific thing"
- User describes their stage, budget, or constraints and wants recommendations
- User is stuck and looking for inspiration or new directions

#### Negative Signals (do NOT route here)

- "Write a LinkedIn post" -- this is social-content (execution, not ideation)
- "Run an SEO audit" -- this is seo-audit (specific execution)
- "Plan the launch" -- this is launch-strategy (specific event)
- Requests for executing a specific known tactic -- route to the tactic's skill

---

### 1.6 product-marketing-context

**Purpose:** Creating or updating the foundational context document that all other marketing skills reference. Positioning, audience, voice, competitors, proof points.

#### Type A -- Direct Invocation

| Signal Phrase | Notes |
|---------------|-------|
| "product marketing context" | Primary trigger |
| "set up context" | |
| "marketing context" | |
| "product context" | |
| "create the context doc" | |
| "update our positioning" | |
| "ICP" / "ideal customer profile" | |

#### Type B -- Natural Language Patterns

| Pattern | Example | Notes |
|---------|---------|-------|
| "who is my target audience" | "Who is our target audience, really?" | |
| "describe my product" | "Help me describe what we sell" | Foundational, not page-level copy |
| "positioning" | "What's our positioning vs competitors?" | |
| "who are we selling to" | "Who are we really selling to?" | |
| "what's our value proposition" | "What's our core value proposition?" | When strategic, not copy-level |
| "define our brand voice" | "Help me define our brand voice" | |
| "customer language" | "What language do our customers use?" | |
| "competitive landscape" | "Map out our competitive landscape" | |
| "switching dynamics" | "What drives people to switch to us?" | JTBD Four Forces |
| "anti-persona" | "Who is NOT our target customer?" | |
| "objection handling" | "What are the main objections and how do we handle them?" | When documenting, not writing copy |
| "jobs to be done" | "What jobs are customers hiring us for?" | |
| "proof points" | "What proof points do we have?" | When cataloging, not deploying in copy |
| "brand personality" | "Define our brand personality" | |

#### Type C -- Context Indicators

- First marketing task in a project with no existing product-marketing-context.md
- User wants to document foundational positioning before writing anything
- Discussion is about who they are, who they serve, and how they differ -- at the strategic level
- Multiple marketing skills will benefit from having this context captured first

#### Negative Signals (do NOT route here)

- "Write copy for our homepage" -- this is copywriting (uses context, doesn't create it)
- "Write a positioning statement" -- borderline; if for a page, copywriting; if for internal documentation, product-marketing-context
- "SEO audit" -- seo-audit uses context but doesn't create it

---

### 1.7 referral-program

**Purpose:** Designing, launching, or optimizing referral programs, affiliate programs, and word-of-mouth growth loops.

#### Type A -- Direct Invocation

| Signal Phrase | Notes |
|---------------|-------|
| "referral program" | Primary trigger |
| "affiliate program" | |
| "refer a friend" | |
| "partner program" | |
| "ambassador program" | |
| "referral incentive" | |
| "viral loop" | When specifically about referral mechanics |

#### Type B -- Natural Language Patterns

| Pattern | Example | Notes |
|---------|---------|-------|
| "how to get referrals" | "How do we get more customer referrals?" | |
| "customers referring customers" | "I want our customers to refer others" | |
| "affiliate payout" | "What should our affiliate payout be?" | |
| "word of mouth" | "How do we drive more word of mouth?" | |
| "referral reward" | "What's the right referral reward?" | |
| "double-sided reward" | "Should we do a double-sided referral reward?" | |
| "referral conversion" | "Our referral conversion rate is low" | |
| "referral loop" | "How do we close the referral loop?" | |
| "commission structure" | "Design a commission structure for affiliates" | |
| "referral fraud" | "How do we prevent referral fraud?" | |
| "incentivize sharing" | "How do we incentivize users to share?" | |
| "customers as growth engine" | "How do we turn customers into a growth engine?" | |
| "referral email" | "Write the referral program launch email" | |
| "track referrals" | "How do we track referral attribution?" | |
| "Rewardful" / "Tolt" | Tool-specific mentions | |

#### Type C -- Context Indicators

- User discusses customer acquisition cost and wants a lower-cost channel
- Discussion involves turning existing users into distribution
- User mentions LTV, CAC, or unit economics in the context of growth
- User wants users to invite other users

#### Negative Signals (do NOT route here)

- "Viral content" -- this is social-content (content virality, not referral mechanics)
- "Growth ideas" broadly -- this is marketing-ideas; referral-program is for the specific referral mechanic
- "Partnership marketing" without referral/affiliate context -- could be launch-strategy (borrowed channels)

---

### 1.8 seo-audit

**Purpose:** Auditing, diagnosing, and fixing SEO issues. Technical SEO, on-page SEO, content quality assessment, ranking diagnostics.

#### Type A -- Direct Invocation

| Signal Phrase | Notes |
|---------------|-------|
| "SEO audit" | Primary trigger |
| "technical SEO" | |
| "SEO health check" | |
| "on-page SEO" | |
| "meta tags review" | |
| "SEO issues" | |
| "core web vitals" | |
| "crawl errors" | |

#### Type B -- Natural Language Patterns

| Pattern | Example | Notes |
|---------|---------|-------|
| "why am I not ranking" | "Why isn't our blog ranking on Google?" | |
| "my traffic dropped" | "Our organic traffic dropped 30% this month" | |
| "lost rankings" | "We lost rankings after the update" | |
| "not showing up in Google" | "Our product page isn't showing up in Google" | |
| "site isn't ranking" | "The site just isn't ranking for anything" | |
| "Google update hit me" | "I think the latest Google update hit us" | |
| "page speed" | "Our page speed is terrible" | |
| "indexing issues" | "Google isn't indexing our new pages" | |
| "my SEO is bad" | "I think our SEO is bad, help" | |
| "help with SEO" | "Can you help with our SEO?" | Start with audit |
| "make this SEO-friendly" | "Make this page SEO-friendly" | On-page optimization |
| "keyword targeting" | "Are we targeting the right keywords?" | |
| "duplicate content" | "We might have duplicate content issues" | |
| "canonical issues" | "I think we have canonical issues" | |
| "robots.txt" | "Check our robots.txt" | |
| "sitemap" | "Is our sitemap set up correctly?" | |
| "internal linking" | "Review our internal linking structure" | |
| "E-E-A-T" | "How's our E-E-A-T?" | |
| "keyword cannibalization" | "I think we have keyword cannibalization" | |
| "schema markup" | "Do we have the right schema markup?" | |

#### Type C -- Context Indicators

- User mentions Google, search rankings, or organic traffic
- Discussion involves why pages aren't performing in search
- User provides URLs for review with SEO context
- User mentions Search Console, Ahrefs, Semrush, or Screaming Frog

#### Negative Signals (do NOT route here)

- "Write SEO content" -- this is content-strategy (for planning) or copywriting (for writing)
- "Content strategy for SEO" -- this is content-strategy
- "Make it SEO-friendly" when referring to copy text only -- borderline; if about meta tags and technical elements, seo-audit; if about keyword usage in body copy, copywriting
- "SEO ideas" broadly -- could be marketing-ideas if exploring whether to invest in SEO at all

---

### 1.9 social-content

**Purpose:** Creating, scheduling, and optimizing social media content for specific platforms. The execution arm for social media.

#### Type A -- Direct Invocation

| Signal Phrase | Notes |
|---------------|-------|
| "social media content" | Primary trigger |
| "LinkedIn post" | |
| "Twitter thread" / "X thread" | |
| "social content" | |
| "social media strategy" | |
| "content calendar" (social context) | Overlaps with content-strategy; social-specific wins |
| "social scheduling" | |
| "Instagram post" / "Reel" | |

#### Type B -- Natural Language Patterns

| Pattern | Example | Notes |
|---------|---------|-------|
| "write a post for LinkedIn" | "Write a LinkedIn post about our new feature" | |
| "write a tweet" | "Write a tweet announcing the release" | |
| "what should I post" | "What should I post on LinkedIn this week?" | |
| "grow my following" | "How do I grow my LinkedIn following?" | |
| "engagement" (social context) | "How do I increase engagement on my posts?" | |
| "viral content" | "How do I create viral content on X?" | |
| "repurpose this content" | "Repurpose this blog post for social" | |
| "tweet ideas" | "Give me tweet ideas for this week" | |
| "LinkedIn carousel" | "Create a LinkedIn carousel about AI agents" | |
| "hook for this post" | "Write a better hook for this post" | |
| "posting schedule" | "What's the best posting schedule for LinkedIn?" | |
| "social media calendar" | "Build a social media calendar for the month" | |
| "content pillars for social" | "What should my content pillars be on social?" | Social-specific pillars |
| "thread" | "Turn this into a Twitter thread" | |
| "engagement strategy" | "What's a good daily engagement strategy?" | |
| "TikTok content" | "What TikTok content should I create?" | |
| "Facebook post" | "Write a Facebook group post" | |
| "Bluesky post" | "Write a Bluesky post about this" | |
| "Dev.to article" | "Adapt this for Dev.to" | |
| "Reddit post" | "Write a Reddit post for r/SaaS" | |
| "batch content" | "Help me batch a week of social content" | |

#### Type C -- Context Indicators

- User mentions a specific social platform by name
- Discussion involves posting frequency, timing, or engagement metrics
- User wants to adapt existing content for social distribution
- User references followers, impressions, or social analytics

#### Negative Signals (do NOT route here)

- "Content strategy" without social platform context -- this is content-strategy
- "Write a blog post" -- this is copywriting
- "Marketing ideas" without social specificity -- this is marketing-ideas
- "Social media ads" -- not covered by this skill (paid ads are a separate concern)

---

## 2. Disambiguation Tables

These tables resolve common verb+object patterns that could match multiple skills.

---

### 2.1 "Make it X" Table

| Phrase | Routes To | Rationale |
|--------|-----------|-----------|
| "make it punchier" | copy-editing | Improving existing copy's impact |
| "make it shorter" | copy-editing | Reducing existing copy |
| "make it longer" | copywriting | Expanding requires new writing |
| "make it clearer" | copy-editing | Clarity sweep on existing copy |
| "make it more compelling" | copy-editing (if editing) / copywriting (if rewriting) | Context-dependent: "make this section more compelling" = editing; "rewrite the page to be more compelling" = copywriting |
| "make it SEO-friendly" | seo-audit (technical) / copy-editing (copy-level) | If about meta tags, headings, schema = seo-audit; if about keyword usage in body text = copy-editing |
| "make it more emotional" | copy-editing | Heightened Emotion sweep |
| "make it sound less corporate" | copy-editing | Voice and Tone sweep |
| "make it share-worthy" | social-content (if for social) / copy-editing (if for web) | Platform context determines routing |
| "make it viral" | social-content | Social virality context |
| "make it convert better" | copy-editing | Zero Risk + So What sweeps |
| "make it more specific" | copy-editing | Specificity sweep |
| "make it more human" | copy-editing | Voice and Tone sweep |
| "make it sound like our brand" | copy-editing (if copy exists) / product-marketing-context (if defining brand voice) | Existing copy = editing; no copy yet = context setup |

---

### 2.2 "Write X" Table

| Phrase | Routes To | Rationale |
|--------|-----------|-----------|
| "write a post" | social-content | Social post creation |
| "write a LinkedIn post" | social-content | Platform-specific |
| "write a tweet" / "write a thread" | social-content | Platform-specific |
| "write copy" | copywriting | New marketing copy |
| "write copy for the homepage" | copywriting | Page-specific new copy |
| "write a headline" | copywriting | New headline creation |
| "write a tagline" | copywriting | New tagline creation |
| "write a blog post" | copywriting | Long-form content writing |
| "write a strategy" | content-strategy (if content) / launch-strategy (if launch) / marketing-ideas (if general) | Depends on the noun after "strategy" |
| "write a content strategy" | content-strategy | |
| "write a launch plan" | launch-strategy | |
| "write a marketing plan" | marketing-ideas | |
| "write a CTA" | copywriting | |
| "write a product description" | copywriting | |
| "write an announcement" | social-content (if for social) / copywriting (if for blog/email) | Platform context determines |
| "write a referral email" | referral-program | Referral-specific content |
| "write an about page" | copywriting | Page copy |
| "write a value proposition" | copywriting (if for a page) / product-marketing-context (if foundational) | Page-level = copywriting; strategic definition = context |
| "write a Dev.to article" | social-content | Platform distribution |
| "write a comparison page" | copywriting | Web page copy |

---

### 2.3 "Review X" Table

| Phrase | Routes To | Rationale |
|--------|-----------|-----------|
| "review this copy" | copy-editing | Copy improvement |
| "review my copy" | copy-editing | Copy improvement |
| "review the strategy" | content-strategy (if content) / launch-strategy (if launch) | Depends on which strategy |
| "review our SEO" | seo-audit | SEO assessment |
| "review this page" | copy-editing (if copy focus) / seo-audit (if SEO focus) | Context: "review the copy on this page" = editing; "review this page for SEO" = audit |
| "review our positioning" | product-marketing-context | Foundational positioning |
| "review our social content" | social-content | Social content assessment |
| "review our referral program" | referral-program | Program optimization |
| "review our content calendar" | content-strategy (if editorial) / social-content (if social-specific) | Calendar type determines |
| "review this headline" | copy-editing | Headline improvement |
| "review this landing page" | copy-editing (default) / seo-audit (if SEO mentioned) | Default to copy review; explicit SEO = audit |
| "review our marketing" | marketing-ideas | High-level assessment |

---

### 2.4 "Create X" Table

| Phrase | Routes To | Rationale |
|--------|-----------|-----------|
| "create a campaign" | launch-strategy (if launch-tied) / marketing-ideas (if general) | Campaign with a launch = launch-strategy; "what campaign should we run" = marketing-ideas |
| "create content" | content-strategy (if planning what) / copywriting (if writing it) | "Create a content plan" = strategy; "create the blog post" = copywriting |
| "create a content calendar" | content-strategy (if editorial) / social-content (if social) | Type of calendar determines |
| "create a referral program" | referral-program | |
| "create a landing page" | copywriting | Page copy creation |
| "create social content" | social-content | |
| "create a launch plan" | launch-strategy | |
| "create a positioning doc" | product-marketing-context | |
| "create an SEO strategy" | content-strategy + seo-audit | Strategy = content-strategy; technical execution = seo-audit |
| "create a viral loop" | referral-program | Mechanical virality |
| "create an affiliate program" | referral-program | |
| "create a content pillar" | content-strategy | |
| "create a hook" | social-content (if for social post) / copywriting (if for web page) | Platform determines |

---

### 2.5 "Help with X" Table

| Phrase | Routes To | Rationale |
|--------|-----------|-----------|
| "help with SEO" | seo-audit | Start with diagnosis |
| "help with marketing" | marketing-ideas | Start with ideation |
| "help with copy" | copywriting (if new) / copy-editing (if existing) | Context: "help me write copy" = copywriting; "help me fix this copy" = editing |
| "help with social media" | social-content | |
| "help with our launch" | launch-strategy | |
| "help with content" | content-strategy | Planning first |
| "help with positioning" | product-marketing-context | |
| "help with referrals" | referral-program | |

---

## 3. Conflict Resolution Rules

When multiple skills could match a signal, these rules determine the winner.

### Rule 1: Explicit Beats Implicit

Type A signals always win over Type B. Type B always wins over Type C. If a user says "run an SEO audit," that's seo-audit regardless of other context.

### Rule 2: Specific Beats General

A platform-specific request routes to the platform skill, not the general skill.
- "Write a LinkedIn post about our content strategy" -> social-content (not content-strategy)
- "Write copy for the launch landing page" -> copywriting (not launch-strategy)
- "SEO for our content calendar" -> seo-audit (not content-strategy)

### Rule 3: Strategy Beats Execution When Ambiguous

When the user's intent is unclear between planning and doing:
- "Content calendar" with no platform context -> content-strategy
- "Content calendar" with platform context -> social-content
- "Marketing plan" -> marketing-ideas
- "Launch plan" -> launch-strategy

### Rule 4: Existing Copy Routes to Editing, New Copy to Writing

- User pastes text and asks for improvement -> copy-editing
- User asks for new text to be created -> copywriting
- "Rewrite from scratch" -> copywriting (it's new copy, even if replacing old)
- "Improve this" -> copy-editing

### Rule 5: Context Document Routes to product-marketing-context

When the user is defining WHO they are and WHO they serve at the foundational level (not writing copy for a page), route to product-marketing-context. Key differentiator: product-marketing-context produces an internal reference document; copywriting produces external-facing copy.

### Rule 6: Referral Mechanics Stay in referral-program

Any discussion about referral incentives, affiliate commissions, referral loops, or user-invites-user mechanics routes to referral-program -- even if the broader topic is "growth" or "marketing." The mechanic is specific enough to warrant its own skill.

### Rule 7: "SEO" Modifier Activates seo-audit

When "SEO" appears as a modifier on another request, seo-audit activates as a supporting skill:
- "Make this page SEO-friendly" -> seo-audit (primary) + copy-editing (supporting)
- "Write SEO content" -> copywriting (primary) + seo-audit (supporting for keyword guidance)
- "Content strategy for SEO" -> content-strategy (primary) + seo-audit (supporting for keyword data)

### Rule 8: Multi-Skill Requests

Some requests naturally span multiple skills. Route to the primary skill and note the supporting skill:
- "Plan and write our launch content" -> launch-strategy (plan) then copywriting + social-content (write)
- "Audit and fix our SEO copy" -> seo-audit (audit) then copy-editing (fix)
- "Set up context then write the homepage" -> product-marketing-context (context) then copywriting (homepage)

Sequential skill invocation is valid. The first skill completes before the second begins.

### Rule 9: When in Doubt, Ask

If the signal genuinely matches two skills equally and context does not disambiguate, Atlas asks: "Are you looking to [Skill A description] or [Skill B description]?" This is the only case where Atlas pauses for clarification.

---

## 4. Signal Phrase Design Principles

### 4.1 Reflect How People Actually Talk

Signals are designed around real user language, not skill names:
- People say "make it punchier" not "run copy-editing sweep 6"
- People say "nobody knows about this" not "invoke marketing-ideas"
- People say "my traffic dropped" not "execute seo-audit"

### 4.2 Cover Synonyms and Informal Variations

Each signal table includes:
- Formal version: "content strategy"
- Informal version: "what should I write about"
- Frustrated version: "I don't know what to write"
- Action version: "plan my content"
- Question version: "what topics should we cover"

### 4.3 Verb Diversity

The same intent expressed with different verbs:
- Write / create / draft / produce / craft (creation intent)
- Edit / review / fix / improve / polish / tighten / sharpen (editing intent)
- Plan / map / strategize / figure out / decide (strategy intent)
- Audit / check / diagnose / analyze / review (assessment intent)
- Launch / ship / release / announce / go live (launch intent)

### 4.4 Negative Signals Prevent Misrouting

Every skill table includes explicit negative signals -- phrases that sound like they could match but should route elsewhere. This prevents the most common misrouting errors:
- "Write a blog post" sounds like content-strategy but is copywriting
- "Content calendar" sounds like content-strategy but may be social-content
- "Viral" sounds like social-content but may be referral-program

### 4.5 Context Window Awareness

Signal matching considers the full message, not just keywords:
- "Our SEO traffic dropped after we changed the homepage copy" -> seo-audit (traffic drop is primary concern)
- "The homepage copy isn't ranking well" -> seo-audit (ranking concern) + copy-editing (copy concern)
- "Write homepage copy that ranks" -> copywriting (primary task) + seo-audit (SEO guidance)

### 4.6 Progressive Specificity

Signals get more specific as they move from Type C to Type A:
- Type C: Atlas is active + user mentions content -> content-strategy (context inference)
- Type B: "What should I write about?" -> content-strategy (pattern match)
- Type A: "Content strategy" -> content-strategy (direct invocation)

Higher specificity = higher confidence. Lower specificity = more likely to need disambiguation.

---

## 5. Routing Flow Summary

```
User message arrives
  |
  ├─ Is Atlas already active?
  |    ├─ YES: Check message against skill signal tables
  |    └─ NO: Check message against Atlas persona signals (routing-engine.md)
  |           ├─ Atlas signal fires -> Activate Atlas -> Check skill signal tables
  |           └─ No Atlas signal -> Route via normal persona engine (not Atlas)
  |
  ├─ Skill Signal Check:
  |    ├─ Type A match? -> Route to matched skill (highest confidence)
  |    ├─ Type B match? -> Route to matched skill (high confidence)
  |    |    └─ Multiple Type B matches? -> Apply Conflict Resolution Rules
  |    ├─ Type C match? -> Route to matched skill (moderate confidence)
  |    |    └─ Ambiguous? -> Atlas asks for clarification (Rule 9)
  |    └─ No match? -> Atlas responds generically, suggests relevant skill
  |
  └─ Execute skill with product-marketing-context.md loaded (if it exists)
```

---

## 6. Cross-Reference: Atlas Persona Signals to Skill Routing

Atlas activates via the routing engine with these persona-level signals. Once Atlas is active, the skill-level signals in this document take over.

| Atlas Persona Signal | Default Skill Route | Notes |
|---------------------|--------------------|----- |
| "marketing" | marketing-ideas | General marketing = ideas first |
| "growth" | marketing-ideas | |
| "distribution" | marketing-ideas | |
| "launch plan" | launch-strategy | |
| "content calendar" | content-strategy / social-content | Disambiguate by platform context |
| "social media strategy" | social-content | |
| "SEO" | seo-audit | |
| "go-to-market" / "GTM" | launch-strategy | |
| "brand" | product-marketing-context | |
| "audience" | product-marketing-context | |
| "followers" | social-content | |
| "engagement" | social-content | |
| "viral" | social-content / referral-program | Disambiguate: content virality vs referral mechanics |
| "Product Hunt" | launch-strategy | |
| "how do I get users" | marketing-ideas | |
| "nobody knows about this" | marketing-ideas | |

---

## 7. Implementation Notes

1. **This document is a routing reference, not code.** Susie and Atlas use these tables as decision inputs, not as a mechanical lookup pipeline.

2. **product-marketing-context is a prerequisite, not a skill to route to mid-conversation.** If no context doc exists when another skill is invoked, that skill should suggest creating one first -- but the signal still routes to the requested skill.

3. **Skill boundaries are firm at Type A, soft at Type B, fuzzy at Type C.** This is by design. Type C routing is intentionally loose to allow Atlas judgment.

4. **New signals can be added without restructuring.** Each skill's table is self-contained. Adding a new pattern to copy-editing does not affect seo-audit.

5. **The disambiguation tables are the most operationally important section.** Common verb+object patterns are where misrouting actually happens in practice. These tables resolve the ambiguity before it reaches conflict resolution rules.
