-- Local Boost Platform Database Schema
-- Target: PostgreSQL (Supabase)
-- Run via Supabase Dashboard SQL Editor or migration tool

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- BUSINESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS businesses (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id            UUID NOT NULL,  -- References auth.users(id)
  name                TEXT NOT NULL,
  place_id            TEXT UNIQUE,
  google_review_url   TEXT,
  address             TEXT,
  phone               TEXT,
  email               TEXT,
  category            TEXT,
  website             TEXT,
  hours               JSONB,
  description         TEXT,
  google_data         JSONB,         -- Cached Google Places data
  audit_score         INTEGER,       -- Latest overall audit score
  plan                TEXT NOT NULL DEFAULT 'starter',
  stripe_customer_id  TEXT,
  stripe_subscription_id TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_place ON businesses(place_id);

-- ============================================================
-- CUSTOMERS (service recipients, not platform users)
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  phone               TEXT,
  email               TEXT,
  service_date        DATE,
  service_description TEXT,
  tags                TEXT[],
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_business ON customers(business_id);

-- ============================================================
-- CAMPAIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  template_id         TEXT NOT NULL,
  follow_up_days      INTEGER NOT NULL DEFAULT 3,
  max_attempts        INTEGER NOT NULL DEFAULT 2,
  status              TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'paused', 'completed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaigns_business ON campaigns(business_id);

-- ============================================================
-- REVIEW REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS review_requests (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id         UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  campaign_id         UUID REFERENCES campaigns(id),
  channel             TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  template_id         TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'sent', 'delivered', 'clicked', 'reviewed', 'failed')),
  attempt_number      INTEGER NOT NULL DEFAULT 1,
  message_sid         TEXT,          -- Twilio message SID
  sent_at             TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  clicked_at          TIMESTAMPTZ,
  reviewed_at         TIMESTAMPTZ,
  error_message       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_requests_business ON review_requests(business_id);
CREATE INDEX idx_requests_customer ON review_requests(customer_id);
CREATE INDEX idx_requests_status ON review_requests(status);
CREATE INDEX idx_requests_sent ON review_requests(sent_at);

-- ============================================================
-- AUDIT RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_results (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  overall_score       INTEGER NOT NULL,
  grade               TEXT NOT NULL,
  scores              JSONB NOT NULL,
  findings            JSONB NOT NULL,
  recommendations     JSONB NOT NULL,
  competitor_data     JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_business ON audit_results(business_id, created_at DESC);

-- ============================================================
-- REVIEW RESPONSES (AI-generated)
-- ============================================================
CREATE TABLE IF NOT EXISTS review_responses (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  google_review_id    TEXT,
  reviewer_name       TEXT,
  rating              INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text         TEXT,
  response_text       TEXT,
  response_status     TEXT NOT NULL DEFAULT 'draft'
                        CHECK (response_status IN ('draft', 'approved', 'posted', 'rejected')),
  posted_at           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_responses_business ON review_responses(business_id);

-- ============================================================
-- DAILY METRICS
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_metrics (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  date                DATE NOT NULL,
  audit_score         INTEGER,
  review_count        INTEGER,
  avg_rating          NUMERIC(2,1),
  reviews_requested   INTEGER DEFAULT 0,
  reviews_received    INTEGER DEFAULT 0,
  profile_views       INTEGER,
  search_appearances  INTEGER,
  calls               INTEGER,
  direction_requests  INTEGER,
  UNIQUE(business_id, date)
);

CREATE INDEX idx_metrics_business_date ON daily_metrics(business_id, date DESC);

-- ============================================================
-- ROW-LEVEL SECURITY (Supabase)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own business data
CREATE POLICY business_owner ON businesses
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY customer_access ON customers
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY campaign_access ON campaigns
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY request_access ON review_requests
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY audit_access ON audit_results
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY response_access ON review_responses
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY metrics_access ON daily_metrics
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
