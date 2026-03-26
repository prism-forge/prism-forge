/**
 * Local Boost Platform — Entry Point
 *
 * Unified local business optimization platform.
 * Modules: GBP Audit, Review Engine, AI Responses, Dashboard.
 */

import express from 'express';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
if (process.env.NODE_ENV !== 'production') {
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
  });
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    modules: {
      business: true,
      gbpAudit: true,
      reviews: true,
      aiResponses: true,
      dashboard: true,
    },
    services: {
      google: !!process.env.GOOGLE_PLACES_API_KEY,
      twilio: !!process.env.TWILIO_ACCOUNT_SID,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      supabase: !!process.env.SUPABASE_URL,
    },
  });
});

// Mount module routes (to be implemented)
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/businesses', authMiddleware, businessRoutes);
// app.use('/api/v1/audit', authMiddleware, auditRoutes);
// app.use('/api/v1/reviews', authMiddleware, reviewRoutes);
// app.use('/api/v1/responses', authMiddleware, responseRoutes);
// app.use('/api/v1/dashboard', authMiddleware, dashboardRoutes);
// app.use('/api/v1/billing', billingRoutes);
// app.use('/api/webhooks', webhookRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Local Boost Platform running at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
