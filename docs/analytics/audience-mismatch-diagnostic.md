# Audience Mismatch Diagnostic: @DrakkoTarkin X/Twitter Analytics

**Date:** 2026-04-02
**Account:** @DrakkoTarkin (X/Twitter)
**Issue:** Audience analytics show Spain 60%, Ireland 20%, Pakistan 20% -- completely inconsistent with English-language Claude Code / AI devtools content targeting US tech developers.

---

## 1. Possible Causes Ranked by Likelihood

### 1A. Bot/Fake Followers Dominating a Tiny Sample (HIGH -- Most Likely)

New accounts with very low follower counts are prime targets for bot networks. Bots follow new accounts because new users "are often eager to gain followers and may not scrutinize new follows carefully" ([SocialRails](https://socialrails.com/blog/why-do-bots-follow-me-on-twitter)). With only a handful of real followers, even 3-5 bot followers from specific regions completely dominate the geographic distribution.

Bot farms are documented to operate from Pakistan, Bangladesh, India, Nigeria, and Southeast Asia ([TechCrunch](https://techcrunch.com/2018/04/20/twitter-doesnt-care-that-someone-is-building-a-bot-army-in-southeast-asia/), [Lever.io](https://news.lever.io/x-new-location-feature-hiring-kols/)). The Pakistan 20% signal directly aligns with known bot farm geography. X's November 2025 location transparency feature exposed that many fake accounts -- particularly in crypto and political spaces -- originate from Pakistan, Bangladesh, India, and Nigeria while posing as Western users ([Euronews](https://www.euronews.com/next/2025/11/25/xs-new-location-feature-exposes-far-right-european-accounts-based-in-asia-australia)).

Spain and Ireland are less common bot origins but could reflect VPN exit nodes used by bot operators, or bot accounts with spoofed profile locations.

### 1B. Small Sample Size Distortion (HIGH)

X analytics displays "Not enough data yet" for Age, Gender, Device, and Following -- confirming the account lacks the minimum data threshold for reliable demographic reporting. Country distribution likely has a similarly low threshold but still renders with whatever data exists.

With a very small follower count (say 10-20 followers), each individual follower represents 5-10% of the audience. A single bot follower from Spain shifts the entire distribution. X's analytics does not distinguish between "statistically significant" and "meaningless noise" -- it shows raw percentages regardless of sample size. This makes the geographic chart essentially random noise at low follower counts.

### 1C. Impression-Based Geography from Random Viral Exposure (MEDIUM)

X determines audience location using "IP address and GPS signal" fed into "machine-learned models that predict a user's location" based on "recent location, which is a combination of current location and recent location history" ([X Business Help](https://business.twitter.com/en/help/campaign-setup/campaign-targeting/geo-gender-and-language-targeting.html)).

If the analytics include viewers/impressions (not just followers), a few posts that happened to get picked up in Spain or Ireland -- perhaps through algorithmic distribution to non-target audiences -- could skew the numbers. The Saturday 4-8 PM peak active time is consistent with evening browsing in European time zones (Spain is UTC+1/+2), reinforcing that engagers may be European rather than US-based.

### 1D. Buffer Scheduling Side Effects (LOW)

Buffer publishes through X's API. There is no evidence that Buffer's posting infrastructure affects how X attributes geographic data to the account's audience. Buffer pulls analytics from X's own data sources (Gnip / X API v2) ([Buffer Help Center](https://support.buffer.com/article/522-twitter-metric-descriptions)). The scheduling tool is not the cause.

### 1E. VPN/IP Attribution Artifacts (LOW)

If the account owner uses a VPN, X could attribute the account holder's own location differently. However, audience analytics reflect followers' and engagers' locations, not the poster's location. VPN usage by the poster would not cause audience geography to show Spain/Ireland/Pakistan. VPN usage by bot operators, however, could cause their bots to appear as located in VPN exit-node countries (Spain and Ireland both host popular VPN endpoints).

---

## 2. Bot Follower Analysis

### Detection Methods

| Tool | What It Does | Cost |
|------|-------------|------|
| [FollowerAudit](https://www.followeraudit.com/) | Scans up to 5,000 followers, identifies bots/fake/inactive | Free tier: 1 audit/day |
| [TwitterAudit](https://twitteraudit.com) | Scores followers by tweet frequency, engagement, recency | First analysis free |
| [Circleboom](https://circleboom.com/twitter-management-tool/twitter-circle-tool/remove-twitter-x-followers) | Official X partner, bot detection + bulk removal | Free + paid tiers |
| [X Bot Remover](https://chromewebstore.google.com/detail/x-bot-remover/aohkhfmnpbofebaljcienghochiiohno) | Chrome extension, automated removal with adjustable rules | Free |
| [Fedica Bot Detection](https://fedica.com/blog/bot-detection-tool/) | Advanced AI-driven analysis including cross-platform consistency | Free + paid |
| [X-Jumper Fake Follower Auditor](https://www.x-jumper.com/tools/x-fake-follower-auditor) | Quick authenticity check | Free |

### Bot Follower Red Flags

- **Username patterns:** Random letter-number combos like "sarah29472" ([Tweet Archivist](https://www.tweetarchivist.com/real-followers-vs-bots-detection-2025))
- **Profile signals:** Missing/AI-generated photos, empty or templated bios ("Living my best life"), minimal tweet history
- **Ratio anomalies:** Following thousands, followed by very few
- **Geographic mismatch:** Followers from countries that don't match content language or target audience ([Miqwal](https://miqwal.com/en/blog/x-twitter-fake-followers-detection-guide))
- **Timing patterns:** Posting at exactly the same times or regular intervals
- **Engagement void:** Never like, reply, or retweet your content

### Known Bot Farm Geography

| Region | Role | Source |
|--------|------|--------|
| Pakistan, Bangladesh | Commercial bot farms, crypto impersonation | [Lever.io](https://news.lever.io/x-new-location-feature-hiring-kols/) |
| India, Nigeria | Fake persona operations, "crypto girl" accounts | [Euronews](https://www.euronews.com/next/2025/11/25/xs-new-location-feature-exposes-far-right-european-accounts-based-in-asia-australia) |
| Russia | Political disinformation, AI-generated profiles | [CSIS](https://www.csis.org/analysis/russian-bot-farm-used-ai-lie-americans-what-now) |
| Southeast Asia (Vietnam, Philippines) | Click farms, commercial follows | [TechCrunch](https://techcrunch.com/2018/04/20/twitter-doesnt-care-that-someone-is-building-a-bot-army-in-southeast-asia/) |

---

## 3. Small Sample Size Effects

### How X Analytics Works with Sparse Data

- X analytics reports percentages regardless of sample size. With 15 followers, each follower = ~7% of the audience. Three bot followers from Spain instantly create a "60% Spain" reading.
- X removed detailed audience demographic analytics in January 2020. Current native analytics show only follower count trends and basic country distribution -- no confidence intervals, no minimum threshold warnings for geographic data.
- The "Not enough data yet" message for Age/Gender/Device confirms the account is below X's internal threshold for those dimensions. Country data appears to have a lower (or no) threshold, meaning it renders even when statistically meaningless.
- A 2025 Nature study found that approximately 20% of all X accounts are fake ([Nature, cited via Tweet Archivist](https://www.tweetarchivist.com/real-followers-vs-bots-detection-2025)). For a small account, the fake percentage could be much higher since bots disproportionately target new accounts.

### When to Trust the Data

The geographic distribution becomes directionally useful once the account reaches approximately 500+ genuine followers. Below that threshold, treat country percentages as noise. The "Active times" heatmap showing Saturday 4-8 PM is similarly unreliable -- it reflects the behavior of whoever happens to be engaging, which at low volumes is dominated by bots or random encounters.

---

## 4. Geographic Targeting Strategies

### How to Attract US Tech Developer Audience

**Content strategy:**
- Post 3-5 times daily with at least one thread per week ([SocialRails](https://socialrails.com/blog/how-to-grow-on-twitter-x-complete-guide))
- Video gets 10x engagement on X -- short screen recordings of Claude Code workflows would perform well ([Fedica](https://fedica.com/blog/how-to-find-use-x-twitter-analytics-guide/))
- Threads get 3x more engagement than single tweets ([SocialRails](https://socialrails.com/blog/how-to-grow-on-twitter-x-complete-guide))

**Hashtag discipline:**
- Use 1-2 hashtags maximum per post -- X's algorithm penalizes heavy hashtag use ([Owlead](https://owlead.com/x-twitter-hashtags/))
- Target niche tags: #ClaudeCode, #AIDevTools, #BuildInPublic, #DevTools, #AIEngineering
- Avoid broad tags (#AI, #tech, #entrepreneur) that attract bots monitoring those keywords
- Mix one niche tag with one moderately popular tag per post

**Community engagement:**
- Build a micro-community of 10-15 peers in the AI devtools space and actively engage with each other's posts ([SocialRails](https://socialrails.com/blog/how-to-grow-on-twitter-x-complete-guide))
- Reply substantively to accounts like @AnthropicAI, @alexalbert__, @aikimai, and other Claude Code community accounts
- Post during US tech hours: 9-11 AM ET and 1-3 PM ET weekdays -- this naturally filters for US-based engagers

**Platform considerations:**
- X Premium provides algorithmic boost that is "virtually a requirement for serious creators" ([PostNext](https://postnext.io/blog/x-twitter-algorithm-explained/))
- X's 2026 algorithm deliberately surfaces smaller accounts -- a genuine advantage for new entrants ([Tweet Archivist](https://www.tweetarchivist.com/how-twitter-algorithm-works-2025))
- The largest user demographic (36.6%) is ages 25-34, matching the target dev audience ([InfluencerDB](https://influencerdb.net/analytics/twitter-demographics-2026/))

---

## 5. Recommended Corrective Actions

### Immediate (This Week)

1. **Audit followers now.** Run [FollowerAudit](https://www.followeraudit.com/) or [TwitterAudit](https://twitteraudit.com) on @DrakkoTarkin. With a small follower count, you can also manually review every single follower in 10 minutes.

2. **Block and remove bot followers.** Use X's native "Remove this follower" feature. At low follower counts, manual removal is fast. Remove 20-50 per day maximum to avoid triggering X's abuse detection ([Unfollr](https://www.unfollr.com/blog/how-to-remove-fake-followers-twitter)). Alternative: [X Bot Remover Chrome extension](https://chromewebstore.google.com/detail/x-bot-remover/aohkhfmnpbofebaljcienghochiiohno).

3. **Stop using broad hashtags.** Drop #AI, #tech, #business, #entrepreneur from posts. These are honeypots that bots monitor to find targets ([SocialRails](https://socialrails.com/blog/why-do-bots-follow-me-on-twitter)).

4. **Ignore the analytics for now.** The geographic data is meaningless at current follower counts. Check again at 200+ followers.

### Short-Term (Next 2-4 Weeks)

5. **Shift posting times to US business hours.** Schedule Buffer posts for 9-11 AM ET and 1-3 PM ET to attract US-based engagers. Avoid weekend-heavy scheduling that favors non-US time zones.

6. **Engage directly with target accounts.** Reply to Claude Code community members, AI devtools builders, and Anthropic-adjacent accounts. Quote-tweet with genuine takes. This builds real followers from the right geography.

7. **Re-audit weekly.** Run a follower audit each Monday until the bot-to-real ratio stabilizes below 10%.

### Longer-Term (1-3 Months)

8. **Use SparkToro or similar** to research where the target audience hangs out on X -- which accounts they follow, which hashtags they use ([FillApp](https://fillapp.ai/blog/twitter-ai-agents-audience-growth)).

9. **Get X Premium** if not already subscribed. The algorithmic boost is significant for small accounts trying to reach the right audience ([PostNext](https://postnext.io/blog/x-twitter-algorithm-explained/)).

10. **Track real metrics.** Use engagement rate (engagements / impressions) and reply quality as success metrics rather than follower count or geographic distribution. Meaningful geographic data will follow once the audience is real.

---

## 6. Key Takeaways

- **The geographic data is almost certainly wrong because of bot followers dominating a tiny sample.** With very few followers, 3-5 bots from Spain/Pakistan shift percentages dramatically. This is not a platform bug -- it is small-sample-size math.

- **Pakistan aligns with known bot farm geography.** Bot operations from Pakistan and Bangladesh are well-documented and specifically target new accounts in tech/crypto niches.

- **Spain and Ireland likely reflect VPN exit nodes** used by bot operators, or random algorithmic distribution of posts to European users. Neither country is a major bot farm origin.

- **Buffer is not the cause.** Scheduling tools post through X's API and do not affect how X calculates audience geography.

- **X shows "Not enough data" for most demographics but still renders country data** -- creating a false sense of reliability. Country percentages at low follower counts are statistical noise.

- **The fix is organic audience building, not analytics debugging.** Remove bots, engage with the right community, post during US hours, use niche hashtags, and the geographic distribution will correct itself as real followers accumulate.

- **Audit tools exist and are free.** FollowerAudit, TwitterAudit, and X Bot Remover can identify and remove fake followers immediately. At the current account size, manual review of every follower takes minutes.

---

## Sources

- [SocialRails: Why Do Bots Follow Me on Twitter](https://socialrails.com/blog/why-do-bots-follow-me-on-twitter)
- [SocialRails: How to Grow on Twitter/X Complete Guide](https://socialrails.com/blog/how-to-grow-on-twitter-x-complete-guide)
- [Lever.io: X Location Feature, Bot Farms, Web3](https://news.lever.io/x-new-location-feature-hiring-kols/)
- [Euronews: X Location Feature Exposes Far-Right Accounts](https://www.euronews.com/next/2025/11/25/xs-new-location-feature-exposes-far-right-european-accounts-based-in-asia-australia)
- [CSIS: Russian Bot Farm Used AI](https://www.csis.org/analysis/russian-bot-farm-used-ai-lie-americans-what-now)
- [TechCrunch: Bot Army in Southeast Asia](https://techcrunch.com/2018/04/20/twitter-doesnt-care-that-someone-is-building-a-bot-army-in-southeast-asia/)
- [Tweet Archivist: Real Followers vs Bots 2026](https://www.tweetarchivist.com/real-followers-vs-bots-detection-2025)
- [Miqwal: X/Twitter Fake Followers Detection Guide](https://miqwal.com/en/blog/x-twitter-fake-followers-detection-guide)
- [X Business: Geo Targeting](https://business.twitter.com/en/help/campaign-setup/campaign-targeting/geo-gender-and-language-targeting.html)
- [Buffer Help: Twitter Metric Descriptions](https://support.buffer.com/article/522-twitter-metric-descriptions)
- [Fedica: X Analytics Guide](https://fedica.com/blog/how-to-find-use-x-twitter-analytics-guide/)
- [FollowerAudit](https://www.followeraudit.com/)
- [TwitterAudit](https://twitteraudit.com)
- [Circleboom: Remove Twitter Bot Followers](https://circleboom.com/twitter-management-tool/twitter-circle-tool/remove-twitter-x-followers)
- [X Bot Remover Chrome Extension](https://chromewebstore.google.com/detail/x-bot-remover/aohkhfmnpbofebaljcienghochiiohno)
- [Unfollr: Remove Fake Followers 2026](https://www.unfollr.com/blog/how-to-remove-fake-followers-twitter)
- [PostNext: X Algorithm Explained](https://postnext.io/blog/x-twitter-algorithm-explained/)
- [InfluencerDB: Twitter Demographics 2026](https://influencerdb.net/analytics/twitter-demographics-2026/)
- [FillApp: Twitter AI Agents Audience Growth](https://fillapp.ai/blog/twitter-ai-agents-audience-growth)
- [Owlead: X/Twitter Hashtags Guide](https://owlead.com/x-twitter-hashtags/)
- [Hootsuite: Twitter Analytics Guide 2026](https://blog.hootsuite.com/twitter-analytics-guide/)
- [Dev.to: Get Rid of Fake Followers on X](https://dev.to/sleeyax/how-to-get-rid-of-fake-followers-on-x-twitter-4o1g)
