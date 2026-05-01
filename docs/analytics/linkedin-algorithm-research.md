# LinkedIn Algorithm Research -- PRISM Forge (April 2026)

Research conducted 2026-04-02 using live web sources. All findings sourced from 2025-2026 publications.

---

## 1. How LinkedIn Distributes Content from New Creators

LinkedIn uses a three-phase distribution system for all posts, regardless of creator tenure:

**Phase 1 -- Quality Gate (0-15 minutes):**
Every post passes through an AI Quality Classifier before any human sees it. The classifier scans text, images, and account history, then categorizes the post as Spam, Low Quality, or High Quality. Low Quality posts are effectively buried. ([Linkmate](https://blog.linkmate.io/linkedin-algorithm-2026-guide/))

**Phase 2 -- Test Audience (15-60 minutes):**
Content that passes the quality gate reaches 2-5% of first-degree connections. If engagement falls below 2% during this window, distribution halts entirely. This is the "golden hour" -- the most critical window for any post. Getting 20 comments in the first 60 minutes is vastly more powerful than 50 comments spread over 24 hours. ([Linkmate](https://blog.linkmate.io/linkedin-algorithm-2026-guide/))

**Phase 3 -- Interest Graph Expansion (1-6 hours):**
Posts that achieve 5-10% meaningful interaction from the test audience expand to 10-20% of the creator's network plus second/third-degree connections via the Interest Graph. The algorithm maps your content to professionals across the entire platform who consume content related to your specific topic, regardless of mutual connections. ([Linkmate](https://blog.linkmate.io/linkedin-algorithm-2026-guide/))

**New creator reality:** There is no confirmed "honeymoon period" for new LinkedIn accounts in 2026. The algorithm evaluates every post on its own merits through the same three-phase system. However, new creators face a structural disadvantage: with fewer first-degree connections, the Phase 2 test audience is smaller, meaning fewer people to generate the early engagement needed to trigger Phase 3 expansion. ([AuthoredUp](https://authoredup.com/blog/linkedin-algorithm), [Hootsuite](https://blog.hootsuite.com/linkedin-algorithm/))

---

## 2. The "Initial Boost" Phenomenon -- Why First Posts Get More Reach, Then Fade

### What PRISM Forge likely experienced

The steep climb in impressions (Mar 22-25) followed by plateau is consistent with a well-documented pattern, but it is NOT a LinkedIn "new account boost." More likely explanations:

**Network activation effect:** First posts on a new account trigger notifications to existing connections. LinkedIn notifies your network when you start posting, generating curiosity-driven clicks. This is a one-time effect that does not repeat. ([LinkedFusion](https://www.linkedfusion.io/blogs/linkedin-engagement-strategies/))

**Novelty exhaustion:** Your first-degree connections saw your initial posts, engaged once, and then returned to normal scroll behavior. The test audience (Phase 2) is drawn from the same pool each time -- once that pool stops responding, distribution stalls.

**Topic authority gap:** LinkedIn's 360Brew algorithm performs a "360-degree" profile check before distributing content. It validates whether your headline, experience, and posting history match your content topics. New accounts have zero posting history, so the algorithm has no basis to establish topic authority. It takes 60-90 days of consistent posting on 2-3 related topics before 360Brew recognizes you as a credible voice. ([YepAds](https://yepads.com/linkedin-algorithm-changes-2026-why-linkedin-reach-is-dropping/))

### The broader reach decline

This is not unique to PRISM Forge. Platform-wide data shows:
- Overall organic reach dropped ~50% year-over-year ([Carouselli](https://carouselli.com/blog/linkedin-reach-down-2026))
- Company page reach dropped 60-66% ([TryOrdinal](https://www.tryordinal.com/blog/the-declining-reach-of-linkedin-company-pages))
- Views down 50%, engagement down 25%, follower growth down 59% across 1M+ accounts analyzed ([ContentIn](https://contentin.io/blog/linkedin-algorithm-2025-why-your-reach-dropped-how-to-win-in-2026/))

---

## 3. Engagement Benchmarks -- What Good Looks Like for Technical Content

### Universal benchmarks (2026, all industries)

Based on analysis of 2.3 million LinkedIn posts:

| Tier | Engagement Rate |
|------|----------------|
| Excellent | 6%+ |
| Above Average | 3-6% |
| Average (median) | 2.1% |
| Below Average | 0.5-1.5% |
| Poor | Under 0.5% |

Source: [GrowWithGhost](https://www.growwithghost.io/blog/linkedin-engagement-rate-benchmarks-by-industry-2026-data-insights)

### Technology / SaaS specific

| Metric | Rate |
|--------|------|
| Average engagement rate | 3.2% |
| Top performers | 8.1% |
| Platform-wide average (personal profiles) | 3.85% |
| Platform-wide average (company pages) | 2.1% |

Source: [GrowWithGhost](https://www.growwithghost.io/blog/linkedin-engagement-rate-benchmarks-by-industry-2026-data-insights), [Social Insider](https://www.socialinsider.io/social-media-benchmarks/linkedin)

### Format-specific engagement rates

| Format | Avg Engagement Rate | Notes |
|--------|-------------------|-------|
| Carousels/Documents | 24.42% (one source) / 7.00% (another) | Highest performer; 3.7x more than text. 55 sec avg dwell vs 15 sec for text. |
| Native video | 5.60% | Under 60 seconds, with subtitles |
| Multi-image | 6.60% | Better dwell than single image |
| Polls | 4.40% | Doubled since 2023, underutilized |
| Text-only | ~4% | Best for generating comments |

Sources: [Social Insider](https://www.socialinsider.io/social-media-benchmarks/linkedin), [ContentIn](https://contentin.io/blog/linkedin-engagement-benchmarks/)

### PRISM Forge's 0.91% engagement rate

This places PRISM Forge in the "below average" tier. For SaaS/tech content, 3.2% is the average target. However, context matters: new accounts with small networks and zero topic authority typically start low and build.

---

## 4. Triggers for Expanded Reach -- What Makes LinkedIn Push to Wider Audience

### Primary triggers (ranked by algorithmic weight)

1. **Dwell time** -- The top hidden metric in 2026. LinkedIn measures exact seconds spent on your post. Posts holding attention for 60+ seconds see significantly higher distribution. Documents/carousels generate 2-3x more dwell time than text/image posts. Posts under 3 seconds are classified as "click bounce" and penalized. ([SocialBee](https://socialbee.com/blog/linkedin-algorithm/), [Gromming](https://gromming.com/blog/recent-changes-linkedin-algorithm))

2. **Saves** -- The highest-value engagement signal. A save indicates the user found content worth returning to. 200 saves dramatically outperform 1,000 likes. ([Vertebrae Social](https://www.vertebraesocial.co.uk/blog/linkedin-engagement-metrics-2026-why-your-reach-is-dead-and-saves-are-king), [YepAds](https://yepads.com/linkedin-algorithm-changes-2026-why-linkedin-reach-is-dropping/))

3. **Substantive comments** -- 15x more algorithmic weight than a standard like. Must be 10+ words to register as meaningful. Comments under 5 words receive near-zero weight. Comments that spark reply threads are worth ~3x standalone comments. ([Linkmate](https://blog.linkmate.io/linkedin-algorithm-2026-guide/), [Gromming](https://gromming.com/blog/recent-changes-linkedin-algorithm))

4. **First-hour engagement velocity** -- Early engagement still matters, but quality over quantity. A post getting less than 500 impressions in the first hour probably will not go much further. ([LinkedFusion](https://www.linkedfusion.io/blogs/linkedin-engagement-strategies/))

5. **Profile-topic authority alignment** -- 360Brew checks whether your profile headline and experience match what you post about. Mismatch = suppressed distribution. ([YepAds](https://yepads.com/linkedin-algorithm-changes-2026-why-linkedin-reach-is-dropping/))

### What kills distribution

- External links in post body: 45-55% reach reduction ([Gromming](https://gromming.com/blog/recent-changes-linkedin-algorithm))
- AI-generated/template content: actively suppressed ([YepAds](https://yepads.com/linkedin-algorithm-changes-2026-why-linkedin-reach-is-dropping/))
- "Post and ghost" (publishing without engaging afterward) ([YepAds](https://yepads.com/linkedin-algorithm-changes-2026-why-linkedin-reach-is-dropping/))
- Engagement pods / reciprocal engagement patterns: detected and penalized ([YepAds](https://yepads.com/linkedin-algorithm-changes-2026-why-linkedin-reach-is-dropping/))
- Hashtags: no longer meaningful for distribution ([YepAds](https://yepads.com/linkedin-algorithm-changes-2026-why-linkedin-reach-is-dropping/))
- Generic comments ("Love this!", "Great post!"): near-zero algorithmic weight ([Gromming](https://gromming.com/blog/recent-changes-linkedin-algorithm))

---

## 5. The Zero Reposts Problem -- Why 0 Shares Is the Critical Bottleneck

### Why shares are rare on LinkedIn (structurally)

1. **Algorithm deprioritizes shares:** Reshared content receives 10-15% fewer views than original posts. LinkedIn's algorithm weights shares far below comments and saves. ([Espirian](https://espirian.co.uk/linkedin-shares/))

2. **No visible share count:** Unlike likes and comments, LinkedIn does not prominently display share counts on posts. Without social proof, users are less likely to share. ([Espirian](https://espirian.co.uk/linkedin-shares/))

3. **Reshares split engagement:** When someone reposts, the engagement splits between the original and the repost, diluting both. This makes resharing actively worse for the original post than a comment. ([Espirian](https://espirian.co.uk/linkedin-shares/))

4. **Professional identity risk:** LinkedIn is a professional network. Sharing content puts it on the sharer's professional profile. Users are selective because their network will see it alongside their career brand. Content must be so valuable that someone is willing to associate their professional identity with it.

5. **Comments are just better:** Research across multiple sources confirms that commenting on a post generates more visibility for both the commenter and the original poster than sharing does. Power users know this. ([Espirian](https://espirian.co.uk/linkedin-shares/))

### What actually drives shares

Based on the research, shared content on LinkedIn tends to be:
- **Frameworks and templates** people can use in their own work
- **Contrarian takes** that help the sharer signal their own expertise
- **Data/research** that validates positions the sharer already holds
- **Career/hiring insights** with broad professional relevance

### Zero shares is normal for new accounts

For a new account with ~1,300 members reached and 27 total engagements, zero shares is not alarming -- it is expected. Shares are the last engagement type to develop, requiring both high content quality AND audience trust built over time.

---

## 6. Relevance to PRISM Forge -- Direct Application to Our Data

### What our data tells us

| Metric | PRISM Forge | Benchmark |
|--------|------------|-----------|
| Impressions (14 days) | 2,953 | N/A (network-size dependent) |
| Members reached | 1,291 | N/A |
| Total engagements | 27 | N/A |
| Reactions | 13 | N/A |
| Comments | 6 | Need 10+ word comments |
| Reposts | 0 | Expected for new account |
| Engagement rate | 0.91% | 3.2% (SaaS avg) |

### Diagnosis

1. **Engagement rate (0.91%) is below average** but explainable. New accounts with small networks lack the first-degree connection density to generate Phase 2 momentum. This is a cold start problem, not a content quality problem.

2. **The plateau after Mar 25** is the novelty exhaustion effect. First-degree connections engaged with early posts, then attention normalized. Without strong Phase 2 performance, posts are not reaching Phase 3 (Interest Graph expansion).

3. **Zero reposts is structural, not a failure.** LinkedIn's algorithm does not reward shares. Comments and saves are what matter. Redirecting effort from "make shareable content" to "make saveable/commentable content" is the correct move.

4. **Topic authority is building.** The 60-90 day window for 360Brew recognition means PRISM Forge is in the investment phase. Consistent posting on AI agents, persona routing, and developer tooling topics will compound over time.

5. **Format matters.** If PRISM Forge is posting primarily text-only content, switching to carousels/documents could 3-7x dwell time and significantly improve Phase 2 test performance.

6. **Profile alignment check needed.** 360Brew validates profile-content match. The LinkedIn profile headline, about section, and experience must explicitly reflect the topics being posted about (AI agents, persona routing, developer tooling).

7. **Post-publish engagement is critical.** If the account is "posting and ghosting" -- publishing content without actively commenting on others' posts in the first hour -- Phase 2 performance will suffer.

---

## 7. Key Takeaways

1. **There is no new-account boost.** The initial impression spike was likely network notification + novelty, not algorithmic favoritism. The plateau is the natural state -- growth from here requires earning Phase 3 distribution.

2. **0.91% engagement rate needs to reach 3.2%+.** The gap is addressable through format changes (carousels), hook optimization (dwell time), and audience-building (more first-degree connections in the developer community).

3. **Zero reposts is a non-issue.** Stop optimizing for shares. LinkedIn structurally deprioritizes them. Optimize for saves and substantive comments (10+ words, thread-generating).

4. **The 60-minute window decides everything.** If a post does not generate meaningful engagement in the first hour, it will not expand. Posting timing, pre-engagement (commenting on others' posts before publishing), and format choice all influence this window.

5. **Carousels/documents are the highest-leverage format change.** They generate 55 seconds average dwell time vs 15 seconds for text, and achieve 3-7x higher engagement rates. For technical/developer content (frameworks, architectures, how-tos), this format is ideal.

6. **Profile-content alignment is a hard gate.** 360Brew checks profile authority before distributing content. If the LinkedIn profile does not explicitly reflect AI/developer tooling expertise, distribution gets suppressed regardless of content quality.

7. **The 60-90 day consistency window is the real timeline.** Topic authority is not built in 14 days. PRISM Forge is in the investment phase. Consistent 2-3x/week posting on the same 2-3 topics for another 6-10 weeks is what triggers algorithmic recognition.

---

## Sources

- [SocialBee -- LinkedIn Algorithm 2026 Guide](https://socialbee.com/blog/linkedin-algorithm/)
- [Linkmate -- LinkedIn Algorithm 2026: How It Works](https://blog.linkmate.io/linkedin-algorithm-2026-guide/)
- [YepAds -- LinkedIn Algorithm Changes 2026: Why Reach Dropped](https://yepads.com/linkedin-algorithm-changes-2026-why-linkedin-reach-is-dropping/)
- [Gromming -- Recent Changes to the LinkedIn Algorithm (Early 2026)](https://gromming.com/blog/recent-changes-linkedin-algorithm)
- [Carouselli -- LinkedIn Reach Down 50% in 2026](https://carouselli.com/blog/linkedin-reach-down-2026)
- [ContentIn -- LinkedIn Algorithm 2025: Why Reach Dropped](https://contentin.io/blog/linkedin-algorithm-2025-why-your-reach-dropped-how-to-win-in-2026/)
- [TryOrdinal -- Declining Reach of LinkedIn Company Pages](https://www.tryordinal.com/blog/the-declining-reach-of-linkedin-company-pages)
- [GrowWithGhost -- Engagement Rate Benchmarks by Industry 2026](https://www.growwithghost.io/blog/linkedin-engagement-rate-benchmarks-by-industry-2026-data-insights)
- [Social Insider -- LinkedIn Benchmarks 2026](https://www.socialinsider.io/social-media-benchmarks/linkedin)
- [ContentIn -- LinkedIn Engagement Benchmarks](https://contentin.io/blog/linkedin-engagement-benchmarks/)
- [Vertebrae Social -- LinkedIn Engagement Metrics 2026](https://www.vertebraesocial.co.uk/blog/linkedin-engagement-metrics-2026-why-your-reach-is-dead-and-saves-are-king)
- [Espirian -- Comments and Reactions Beat Shares](https://espirian.co.uk/linkedin-shares/)
- [AuthoredUp -- How the LinkedIn Algorithm Works](https://authoredup.com/blog/linkedin-algorithm)
- [Hootsuite -- How the LinkedIn Algorithm Works](https://blog.hootsuite.com/linkedin-algorithm/)
- [LinkedFusion -- LinkedIn Engagement Strategies 2026](https://www.linkedfusion.io/blogs/linkedin-engagement-strategies/)
- [Buffer -- How LinkedIn's Algorithm Works](https://buffer.com/resources/linkedin-algorithm/)
- [Rosica -- LinkedIn Thought Leadership Tips 2026](https://www.rosica.com/2026/02/23/linkedin-thought-leadership-tips-for-2026)
