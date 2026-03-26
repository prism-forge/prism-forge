# Architecture Document: Local Boost Platform

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Dashboard │  │ Landing  │  │ SMS/Email│             │
│  │  (React)  │  │  Page    │  │ Notifs   │             │
│  └─────┬─────┘  └─────┬────┘  └────┬─────┘             │
└────────┼──────────────┼─────────────┼───────────────────┘
         │              │             │
┌────────┼──────────────┼─────────────┼───────────────────┐
│        │         API Gateway (Express)                   │
│  ┌─────┴─────────────┴──────────────┴─────────────┐     │
│  │  Auth Middleware (JWT + API Key)                │     │
│  └─────┬─────────────┬──────────────┬─────────────┘     │
│        │             │              │                    │
│  ┌─────┴────┐  ┌─────┴────┐  ┌─────┴─────┐            │
│  │ Business │  │ Review   │  │ GBP       │            │
│  │ Module   │  │ Module   │  │ Module    │            │
│  └─────┬────┘  └─────┬────┘  └─────┬─────┘            │
│        │             │              │                    │
│  ┌─────┴─────────────┴──────────────┴─────────────┐     │
│  │            Shared Services                      │     │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌─────────┐ │     │
│  │  │  AI    │ │ Comms  │ │Billing │ │ Scheduler│ │     │
│  │  │Engine  │ │(Twilio)│ │(Stripe)│ │ (Cron)  │ │     │
│  │  └────────┘ └────────┘ └────────┘ └─────────┘ │     │
│  └────────────────────┬───────────────────────────┘     │
│                       │                                  │
│  ┌────────────────────┴───────────────────────────┐     │
│  │          Data Layer (PostgreSQL + Redis)         │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │     │
│  │  │Businesses│  │ Reviews  │  │ Campaigns│     │     │
│  │  │Customers │  │ Requests │  │ Analytics│     │     │
│  │  └──────────┘  └──────────┘  └──────────┘     │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘

External Services:
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Google   │  │ Twilio   │  │ Stripe   │  │ Anthropic│
  │ Places + │  │ SMS/Voice│  │ Billing  │  │ Claude   │
  │ GBP API  │  │          │  │          │  │ API      │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React + Tailwind CSS | Fast development, good mobile support. Could start with plain HTML/Vanilla JS for MVP. |
| **API** | Express.js (Node.js) | Matches existing codebase, good Twilio/Stripe SDK support |
| **Database** | PostgreSQL (Supabase) | Managed, built-in auth, real-time subscriptions, row-level security |
| **Cache** | Redis (Upstash) | Rate limiting, session cache, job queue |
| **AI** | Anthropic Claude API | Haiku for cost-efficient review responses ($0.001/response) |
| **SMS** | Twilio | Industry standard, reliable, good webhooks |
| **Billing** | Stripe | Subscription management, invoicing, payment processing |
| **Email** | SendGrid | Transactional emails and reports |
| **Hosting** | Vercel (frontend) + Railway/Render (API) | Low-ops, auto-scaling, reasonable pricing |
| **CDN/Storage** | Cloudflare R2 | PDF reports, uploaded photos |

## Module Architecture

### Core Module: Business Profile

Shared business context that all other modules consume.

```
businesses/
├── routes.js          # CRUD endpoints
├── business.model.js  # Schema and validation
├── onboarding.js      # 5-question setup flow
└── google-sync.js     # Sync with Google Places API
```

**Schema:**
```sql
CREATE TABLE businesses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID REFERENCES auth.users(id),
  name          TEXT NOT NULL,
  place_id      TEXT UNIQUE,
  address       TEXT,
  phone         TEXT,
  category      TEXT,
  website       TEXT,
  hours         JSONB,
  description   TEXT,
  google_data   JSONB,      -- Cached Google Places data
  audit_score   INTEGER,    -- Latest overall audit score
  plan          TEXT DEFAULT 'starter',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

### Module M2: GBP Audit

Reuses the GBP Audit Tool engine (products/gbp-audit).

```
gbp-audit/
├── routes.js           # Audit endpoints
├── audit-engine.js     # Scoring logic (imported from gbp-audit product)
├── audit-scheduler.js  # Monthly re-audit cron
└── audit-history.js    # Track score changes over time
```

**Schema:**
```sql
CREATE TABLE audit_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID REFERENCES businesses(id),
  overall_score INTEGER NOT NULL,
  grade         TEXT NOT NULL,
  scores        JSONB NOT NULL,     -- Per-dimension scores
  findings      JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  competitor_data JSONB,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_business ON audit_results(business_id, created_at DESC);
```

### Module M3: Review Engine

Reuses the Review Engine (products/review-engine).

```
reviews/
├── routes.js           # Campaign and request endpoints
├── campaign.js         # Campaign management
├── request-sender.js   # SMS/email dispatch
├── templates.js        # Message templates
├── followup-worker.js  # Cron job for follow-ups
└── analytics.js        # Conversion tracking
```

**Schema:**
```sql
CREATE TABLE customers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID REFERENCES businesses(id),
  name             TEXT NOT NULL,
  phone            TEXT,
  email            TEXT,
  service_date     DATE,
  service_desc     TEXT,
  tags             TEXT[],
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE review_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      UUID REFERENCES customers(id),
  business_id      UUID REFERENCES businesses(id),
  campaign_id      UUID REFERENCES campaigns(id),
  channel          TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  template_id      TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending',
  attempt_number   INTEGER DEFAULT 1,
  message_sid      TEXT,             -- Twilio message SID
  sent_at          TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  clicked_at       TIMESTAMPTZ,
  reviewed_at      TIMESTAMPTZ,
  error_message    TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE campaigns (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID REFERENCES businesses(id),
  name             TEXT NOT NULL,
  template_id      TEXT NOT NULL,
  follow_up_days   INTEGER DEFAULT 3,
  max_attempts     INTEGER DEFAULT 2,
  status           TEXT DEFAULT 'active',
  created_at       TIMESTAMPTZ DEFAULT now()
);
```

### Module M4: AI Response Engine

```
ai-responses/
├── routes.js           # Response generation endpoints
├── review-monitor.js   # Poll Google for new reviews
├── response-gen.js     # Claude API integration
├── response-poster.js  # Post responses via GBP API
└── tone-config.js      # Business-specific tone settings
```

**Schema:**
```sql
CREATE TABLE review_responses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID REFERENCES businesses(id),
  google_review_id TEXT,
  reviewer_name    TEXT,
  rating           INTEGER,
  review_text      TEXT,
  response_text    TEXT,
  response_status  TEXT DEFAULT 'draft',  -- draft, approved, posted, rejected
  posted_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now()
);
```

### Module M5: Dashboard & Reporting

```
dashboard/
├── routes.js           # Dashboard data endpoints
├── metrics.js          # KPI calculations
├── report-generator.js # Monthly PDF reports
└── competitor.js       # Competitor tracking
```

**Schema:**
```sql
CREATE TABLE daily_metrics (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID REFERENCES businesses(id),
  date             DATE NOT NULL,
  audit_score      INTEGER,
  review_count     INTEGER,
  avg_rating       NUMERIC(2,1),
  reviews_requested INTEGER,
  reviews_received INTEGER,
  profile_views    INTEGER,
  search_appearances INTEGER,
  calls            INTEGER,
  direction_requests INTEGER,
  UNIQUE(business_id, date)
);
```

### Shared Services

#### AI Engine
```javascript
// Shared Claude API client
export async function generate(prompt, options = {}) {
  const model = options.model || 'claude-haiku-4-5-20251001';
  const maxTokens = options.maxTokens || 256;
  // ... Anthropic API call
}
```

#### Communication Service (Twilio)
```javascript
// Unified SMS/Voice client
export async function sendSms(to, body, options = {}) { /* ... */ }
export async function makeCall(to, twimlUrl, options = {}) { /* ... */ }
```

#### Billing Service (Stripe)
```javascript
// Subscription management
export async function createSubscription(customerId, priceId) { /* ... */ }
export async function cancelSubscription(subscriptionId) { /* ... */ }
export function handleWebhook(event) { /* ... */ }
```

#### Scheduler
```javascript
// Cron jobs
// - Monthly re-audit (1st of month)
// - Follow-up processing (every 6 hours)
// - Review polling (every 30 minutes)
// - Monthly report generation (last day of month)
// - Daily metrics aggregation (midnight)
```

## Authentication & Authorization

### User Auth (Supabase Auth)
- Email/password signup
- Google OAuth (reuses consent for GBP API access)
- Magic link for mobile
- JWT tokens, auto-refresh

### API Keys (for integrations)
- Business-scoped API keys for webhook and API access
- Rate limited per plan tier

### Row-Level Security
```sql
-- Business owners can only see their own data
CREATE POLICY business_owner ON businesses
  USING (owner_id = auth.uid());

CREATE POLICY customer_access ON customers
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
```

## API Design

### Base URL: `https://api.localboost.app/v1`

### Authentication
```
Authorization: Bearer <jwt_token>
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Create account |
| POST | `/auth/login` | Login |
| GET | `/businesses` | List user's businesses |
| POST | `/businesses` | Create business (onboarding) |
| GET | `/businesses/:id` | Get business details |
| PATCH | `/businesses/:id` | Update business |
| GET | `/businesses/:id/audit` | Get latest audit |
| POST | `/businesses/:id/audit` | Run new audit |
| GET | `/businesses/:id/audit/history` | Audit score history |
| GET | `/businesses/:id/customers` | List customers |
| POST | `/businesses/:id/customers` | Add customer |
| POST | `/businesses/:id/customers/import` | Bulk import |
| GET | `/businesses/:id/campaigns` | List campaigns |
| POST | `/businesses/:id/campaigns` | Create campaign |
| POST | `/businesses/:id/campaigns/:cid/send` | Send batch |
| GET | `/businesses/:id/reviews` | List reviews (from Google) |
| POST | `/businesses/:id/reviews/:rid/respond` | Generate + post response |
| GET | `/businesses/:id/dashboard` | Dashboard metrics |
| GET | `/businesses/:id/report` | Download monthly report |
| POST | `/billing/subscribe` | Create subscription |
| POST | `/billing/portal` | Open Stripe portal |
| POST | `/webhooks/stripe` | Stripe webhook |
| POST | `/webhooks/twilio` | Twilio status webhook |

## Deployment Architecture

### MVP (Phase 1)
```
Vercel (Frontend) ──→ Railway (API + Workers) ──→ Supabase (DB)
                                                 ──→ Upstash (Redis)
```

### Scale (Phase 2+)
```
Cloudflare (CDN) ──→ Vercel (Frontend)
                 ──→ Railway (API)
                 ──→ Railway (Worker - cron jobs)
                 ──→ Supabase (DB + Auth + Realtime)
                 ──→ Upstash (Redis + Queue)
                 ──→ Cloudflare R2 (PDF storage)
```

### Cost Estimate (MVP)

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Supabase | Free → Pro ($25) | $0-25 |
| Railway | Hobby ($5) | $5 |
| Vercel | Hobby (free) | $0 |
| Upstash | Free tier | $0 |
| Twilio | Pay-as-go | $1 + usage |
| Stripe | 2.9% + $0.30/txn | ~$3-15 |
| Anthropic | Pay-as-go | ~$5-20 |
| Domain | .app TLD | $14/yr |
| **Total** | | **$15-70/mo** |

At 25 customers ($99/mo each = $2,475 MRR), infrastructure cost is ~3% of revenue. Excellent unit economics.

## Data Flow: Review Request Campaign

```
1. Business owner adds customer (name + phone)
   → POST /businesses/:id/customers
   → Insert into customers table

2. Campaign sends review request
   → Worker picks up pending customers
   → Renders template with business context
   → Sends SMS via Twilio
   → Records in review_requests table (status: sent)

3. Twilio delivers SMS
   → Webhook fires: POST /webhooks/twilio
   → Update review_requests (status: delivered)

4. Customer clicks review link
   → Redirect through tracking URL
   → Update review_requests (status: clicked)

5. Customer leaves review on Google
   → Review monitor polls Google (every 30 min)
   → Detects new review matching customer
   → Update review_requests (status: reviewed)
   → Trigger AI response generation

6. AI generates response
   → Claude Haiku generates draft
   → Insert into review_responses (status: draft)
   → Notify business owner via SMS

7. Business owner approves response
   → Dashboard or SMS reply
   → Response posted via GBP API
   → Update review_responses (status: posted)
```

## Security Considerations

1. **Google OAuth tokens**: Encrypted at rest, auto-refresh, revoke on account deletion
2. **Twilio webhooks**: Validate signature on every webhook
3. **Stripe webhooks**: Validate signature, idempotency keys
4. **API rate limiting**: Per-plan limits via Redis
5. **Input validation**: Zod schemas on all API endpoints
6. **SQL injection**: Parameterized queries only (Supabase client handles this)
7. **XSS**: React handles escaping; CSP headers on all responses
8. **CSRF**: SameSite cookies + CSRF tokens
9. **Secrets**: All in environment variables, never in code or logs
