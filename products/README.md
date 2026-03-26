# PRISM Forge — SMB Products

Three products targeting the $99-149/month gap in the local SMB market. Built on the hybrid strategy: short-term tools generate revenue while the long-term platform compounds.

## Products

### 1. GBP Audit Tool (`gbp-audit/`) — SHIP-READY

**What:** AI-powered Google Business Profile audit report generator.
**Revenue:** $49-99/report (one-time) + lead gen for monthly service.
**Status:** Complete. CLI + web server + PDF reports + landing page.

```bash
cd gbp-audit && npm install && npm start
```

### 2. Review Engine (`review-engine/`) — SHIP-READY

**What:** Automated review request SMS campaigns with AI response generation.
**Revenue:** $29-49/month per business (recurring).
**Status:** Complete. Dashboard + REST API + campaign management + AI responder.

```bash
cd review-engine && npm install && npm start
```

### 3. Local Boost Platform (`smb-platform/`) — DESIGNED

**What:** Unified platform combining audit + reviews + AI + reporting.
**Revenue:** $99-149/month per business (recurring SaaS).
**Status:** Fully designed. PRD + architecture + GTM playbook + database schema + service scaffold.

Start building when Products 1 & 2 validate demand.

## Strategy

```
Week 1-2: Deploy GBP Audit Tool → Free audits as lead gen
           Deploy Review Engine → First paying customers
Week 3-4: Sell audits door-to-door in Canton/Woodstock
           Launch Facebook group campaign
Month 2:  First 10-25 paying customers
           Start building Local Boost platform
Month 3:  Migrate customers to unified platform
           Launch at $99/mo
Month 4-6: Scale to 100 customers = $10K+ MRR
```

## Tech Stack

All products: Node.js (ESM), Express, no native dependencies.

| Product | Database | SMS | AI | Billing |
|---------|----------|-----|----| --------|
| GBP Audit | None (stateless) | N/A | Optional (Anthropic) | N/A |
| Review Engine | JSON file store | Twilio REST | Anthropic Haiku | N/A |
| Local Boost | PostgreSQL (Supabase) | Twilio | Anthropic Haiku | Stripe |

## Required API Keys

| Key | Products | Get it at |
|-----|----------|----------|
| Google Places API | Audit, Platform | console.cloud.google.com |
| Twilio | Review Engine, Platform | twilio.com |
| Anthropic | All (optional for Audit) | console.anthropic.com |
| Stripe | Platform only | dashboard.stripe.com |
