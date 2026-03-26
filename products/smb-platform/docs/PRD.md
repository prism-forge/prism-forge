# Product Requirements Document: Local Boost Platform

## Product Overview

**Local Boost** is a unified local business optimization platform that helps 1-5 employee businesses become discoverable, reachable, and reputable on Google. It combines GBP optimization, review management, AI-powered responses, and SMS communication into one simple dashboard designed for non-technical business owners.

**Target Customer:** Local service businesses (plumbers, dentists, salons, auto shops, restaurants) with 1-5 employees in the $100K-$500K revenue range who spend $0-200/month on marketing.

**Tagline:** "Never miss another customer."

## Problem Statement

Local businesses are invisible and unreachable:
- 56% of Google Business Profiles are incomplete
- 62% of calls to small businesses go unanswered
- 27% of small businesses have no website
- Businesses with 50+ reviews generate 266% more revenue

Existing solutions either cost too much ($249+ /mo for Podium/Birdeye), serve the wrong audience (BrightLocal/Whitespark built for SEO agencies), or only solve one piece (NiceJob for reviews only, Yext for listings only).

**The gap:** At $99-149/month, no single tool offers GBP optimization + review generation + AI responses + simple reporting for business owners (not SEO pros).

## Target Market

### Primary: North Georgia Corridor (Launch Market)
- Cherokee County: 10,000+ employers, $110K median HHI
- Forsyth County: Fastest-growing in GA
- Mountain tourism: Blue Ridge, Ellijay, Dahlonega
- Total addressable: ~5,000 local service businesses

### Secondary: National SMB Market
- 33M small businesses in the US
- 5.6M with incomplete Google profiles (extrapolated)
- Serviceable: 500K-1M businesses in the $99-149/mo sweet spot

## Core Features (MVP — Phase 1)

### M1: Business Profile Setup
- One-time onboarding: business name, type, services, hours
- Google OAuth to connect GBP
- Auto-populate from Google Places API
- 5-question setup flow (< 5 minutes)

### M2: GBP Audit & Optimization
- Automated 8-dimension audit (from GBP Audit Tool)
- Profile completeness scoring
- Actionable recommendations with priority ranking
- One-click fixes for missing fields (via GBP Management API)
- Monthly re-audit with trend tracking

### M3: Review Request Engine
- SMS/email campaigns after service completion
- Template library with proven conversion copy
- Automatic follow-up drip (3 days, customizable)
- Direct Google review link generation
- Campaign analytics: sent, delivered, clicked, reviewed

### M4: AI Review Response
- Monitor new Google reviews (polling or webhook)
- AI-generate professional responses using Claude Haiku
- Business owner approves or edits before posting
- Positive/neutral/negative response strategies
- Response posted via GBP API

### M5: Dashboard & Reporting
- Simple dashboard: score, reviews this month, calls, profile views
- Monthly email report (PDF attachment)
- Competitor comparison widget
- "Health score" that improves over time

## Phase 2 Features (Month 4-6)

### M6: Google Post Scheduling
- Create and schedule Google Business Posts
- AI-generated post suggestions based on business type
- Weekly posting cadence with templates

### M7: SMS Communication Hub
- Two-way SMS with customers
- Appointment reminders
- Missed call text-back ("Sorry we missed your call! How can we help?")

### M8: Multi-Location Support
- Manage multiple business locations from one account
- Per-location scoring and reporting
- Bulk operations

## Phase 3 Features (Month 7-12)

### M9: Voice Agent Integration
- AI phone answering via Synthflow/Retell white-label
- After-hours call handling
- Appointment booking from phone calls
- Call transcription and summary

### M10: Agency White-Label
- Custom branding for marketing agencies
- Sub-account management
- Agency-level reporting
- API access for integrations

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | $99/mo | GBP audit, review requests (50/mo), AI responses (10/mo), monthly report |
| **Growth** | $149/mo | Everything in Starter + unlimited requests, unlimited AI responses, Google posts, competitor tracking |
| **Premium** | $249/mo | Everything in Growth + SMS hub, appointment reminders, missed call text-back |
| **Voice** | $349/mo | Everything in Premium + AI phone answering (200 min/mo included) |

Annual pricing: 20% discount ($79/mo Starter, $119/mo Growth).

## Technical Requirements

### Performance
- Dashboard loads in < 2 seconds
- SMS sent within 30 seconds of trigger
- AI responses generated in < 5 seconds
- 99.9% uptime SLA

### Security
- OAuth 2.0 for Google account connection
- All data encrypted at rest and in transit
- SOC 2 compliance roadmap (Phase 2)
- No storage of credit card data (Stripe handles)
- User data deletion on account cancellation

### Integration Requirements
- Google Places API (New) — search and detail fetch
- Google Business Profile API — CRUD on listings, reviews, posts
- Twilio — SMS sending and receiving
- Stripe — subscription billing and payment
- Anthropic Claude API — AI content generation
- SendGrid or SES — email notifications and reports

### Browser Support
- Chrome, Safari, Firefox, Edge (latest 2 versions)
- Mobile-responsive (owners check on phone)

## Success Metrics

| Metric | Target (Month 3) | Target (Month 6) |
|--------|------------------|------------------|
| Paying customers | 25-50 | 100-200 |
| MRR | $2,500-$7,500 | $10,000-$25,000 |
| Churn rate | < 8% monthly | < 5% monthly |
| NPS | > 40 | > 50 |
| Review request conversion | > 15% | > 20% |
| Customer GBP score improvement | +20 pts avg | +30 pts avg |
| Time to setup | < 5 min | < 3 min |

## Competitive Differentiation

1. **Price:** $99-149/mo vs $249-599/mo for Podium/Birdeye
2. **Simplicity:** 5-question setup vs hours of configuration
3. **Unified:** GBP + reviews + AI responses in one tool vs 3 separate products
4. **SMB-first:** Built for business owners, not SEO agencies
5. **AI-native:** Claude-powered responses and recommendations, not templates
6. **Local-first:** Deep North Georgia presence creates trust and referrals
7. **Invisible UX:** SMS-based interaction; owner doesn't need to log into dashboard

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Google GBP API access denied | Critical | Apply early (14-day review). Fallback: Places API read-only + manual optimization guidance |
| Low SMB conversion rate | High | Free audit as lead gen (validate before building). GBP Audit Tool already built. |
| High SMS costs | Medium | Start with Twilio. Migrate to cheaper provider (Vonage/MessageBird) at scale. |
| Competitor undercuts on price | Medium | Focus on simplicity and local relationships, not features. Community moat. |
| Anthony hates selling to plumbers | High | Validate with 10 manual sales in Week 1 before building. If no, pivot to consulting-only. |

## Open Questions

1. Should the free GBP audit require email capture (lead gen) or be completely open?
2. Which business categories convert best? (A/B test: contractors vs restaurants vs medical)
3. Is voice agent viable in Phase 3 or should it be a separate product?
4. Should we pursue agency white-label or stay D2C?
