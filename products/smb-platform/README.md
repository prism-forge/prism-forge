# Local Boost Platform

Unified local business optimization platform. GBP audit + review management + AI responses + reporting in one dashboard for $99-149/month.

## Status: Scaffold + Full Documentation

This product is fully designed and documented. The scaffold includes:

- **[PRD](docs/PRD.md)** — Complete product requirements with features, pricing, metrics
- **[Architecture](docs/ARCHITECTURE.md)** — System design, schemas, API spec, data flows
- **[Go-To-Market](docs/GO-TO-MARKET.md)** — Launch playbook, sales scripts, channel strategy, projections
- **Database Schema** — Full PostgreSQL schema with RLS policies (src/db/schema.sql)
- **API Scaffold** — Express server, auth middleware, validation, rate limiting
- **Service Layer** — AI (Claude), billing (Stripe), communications (Twilio/SendGrid)

## What Gets Built

### Phase 1 (Weeks 1-6): MVP
- Onboarding flow (5 questions, Google OAuth)
- GBP Audit module (reuses `products/gbp-audit`)
- Review Request Engine (reuses `products/review-engine`)
- AI Review Responses (Claude Haiku)
- Simple dashboard + monthly report
- Stripe billing ($99/mo Starter, $149/mo Growth)

### Phase 2 (Weeks 7-12): Growth
- Google Post scheduling
- SMS communication hub
- Multi-location support
- Agency white-label exploration

### Phase 3 (Months 4-6): Scale
- Voice agent integration (Synthflow/Retell white-label)
- Advanced analytics
- API for third-party integrations

## Quick Start (Development)

```bash
npm install
cp .env.example .env
# Fill in API keys

npm run dev
# http://localhost:3000
```

## Architecture

```
src/
├── index.js                   # Express entry point
├── middleware/
│   ├── auth.js                # JWT authentication
│   ├── rate-limit.js          # Per-plan rate limiting
│   └── validate.js            # Zod request validation
├── services/
│   ├── ai.js                  # Claude API client
│   ├── billing.js             # Stripe subscriptions
│   └── comms.js               # Twilio SMS + SendGrid email
├── modules/
│   ├── business/              # Core business profile CRUD
│   ├── gbp-audit/             # Audit engine + scheduler
│   ├── reviews/               # Campaign + request management
│   ├── ai-responses/          # Review response generation
│   └── dashboard/             # Metrics + reporting
└── db/
    └── schema.sql             # Full PostgreSQL schema
```

## Integration with Other Products

| Product | Relationship |
|---------|-------------|
| `products/gbp-audit` | Audit engine imported as module M2 |
| `products/review-engine` | Review logic imported as module M3 |
| `products/smb-platform` | This — the unified platform that combines them |

## Tech Stack

- **API**: Express.js (Node.js)
- **Database**: PostgreSQL (Supabase) with Row-Level Security
- **Auth**: Supabase Auth (JWT)
- **AI**: Anthropic Claude (Haiku for cost efficiency)
- **SMS**: Twilio (REST API, no SDK)
- **Billing**: Stripe (subscriptions + billing portal)
- **Email**: SendGrid
- **Cache**: Redis (Upstash)
- **Hosting**: Vercel (frontend) + Railway (API)

## License

Proprietary — not open source. The individual tools (gbp-audit, review-engine) are MIT.
