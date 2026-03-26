/**
 * Review Engine Web Server
 * REST API and dashboard for managing review request campaigns.
 */

import express from 'express';
import { config } from 'dotenv';
import { getDb } from './database.js';
import {
  createBusiness,
  addCustomer,
  importCustomers,
  createCampaign,
  sendReviewRequest,
  processFollowUps,
  getCampaignStats,
} from './campaign-manager.js';
import { generateReviewResponse } from './review-responder.js';
import { listTemplates, generateReviewUrl } from './templates.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.TWILIO_PHONE_NUMBER,
};

// --- Dashboard ---
app.get('/', (_req, res) => {
  const html = readFileSync(resolve(__dirname, '..', 'public', 'index.html'), 'utf-8');
  res.type('html').send(html);
});

// --- Business endpoints ---
app.post('/api/businesses', (req, res) => {
  try {
    const business = createBusiness(req.body);
    res.status(201).json(business);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/businesses', (_req, res) => {
  const db = getDb(process.env.DB_PATH);
  const businesses = db.findAll('businesses');
  res.json(businesses.reverse());
});

app.get('/api/businesses/:id', (req, res) => {
  const db = getDb(process.env.DB_PATH);
  const business = db.findById('businesses', parseInt(req.params.id, 10));
  if (!business) return res.status(404).json({ error: 'Business not found' });
  res.json(business);
});

// --- Customer endpoints ---
app.post('/api/businesses/:id/customers', (req, res) => {
  try {
    const customer = addCustomer({
      businessId: parseInt(req.params.id, 10),
      ...req.body,
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/businesses/:id/customers/import', (req, res) => {
  try {
    const result = importCustomers(parseInt(req.params.id, 10), req.body.customers);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/businesses/:id/customers', (req, res) => {
  const db = getDb(process.env.DB_PATH);
  const customers = db.findAll('customers', { business_id: parseInt(req.params.id, 10) });
  res.json(customers.reverse());
});

// --- Campaign endpoints ---
app.post('/api/businesses/:id/campaigns', (req, res) => {
  try {
    const campaign = createCampaign({
      businessId: parseInt(req.params.id, 10),
      ...req.body,
    });
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/businesses/:id/campaigns', (req, res) => {
  const db = getDb(process.env.DB_PATH);
  const campaigns = db.findAll('campaigns', { business_id: parseInt(req.params.id, 10) });
  res.json(campaigns.reverse());
});

// --- Review request endpoints ---
app.post('/api/customers/:id/send-review-request', async (req, res) => {
  try {
    if (!twilioConfig.accountSid) {
      return res.status(500).json({ error: 'Twilio not configured. Set TWILIO_* env vars.' });
    }

    const templateId = req.body.templateId || 'initial_friendly';
    const result = await sendReviewRequest(
      parseInt(req.params.id, 10),
      templateId,
      twilioConfig
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/businesses/:id/send-batch', async (req, res) => {
  try {
    if (!twilioConfig.accountSid) {
      return res.status(500).json({ error: 'Twilio not configured' });
    }

    const db = getDb(process.env.DB_PATH);
    const bizId = parseInt(req.params.id, 10);
    const templateId = req.body.templateId || 'initial_friendly';

    // Get customers who haven't been sent a request yet
    const sentCustomerIds = new Set(
      db.findAll('review_requests', { business_id: bizId }).map(r => r.customer_id)
    );
    const customers = db.findAll('customers', { business_id: bizId })
      .filter(c => !sentCustomerIds.has(c.id))
      .slice(0, req.body.limit || 50);

    const results = { sent: 0, failed: 0, errors: [] };

    for (const customer of customers) {
      try {
        const result = await sendReviewRequest(customer.id, templateId, twilioConfig);
        if (result.status === 'sent') results.sent++;
        else {
          results.failed++;
          results.errors.push({ customer: customer.name, reason: result.reason });
        }
      } catch (err) {
        results.failed++;
        results.errors.push({ customer: customer.name, reason: err.message });
      }

      // Rate limit: 1 SMS per second
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    res.json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Follow-up processing ---
app.post('/api/process-followups', async (_req, res) => {
  try {
    if (!twilioConfig.accountSid) {
      return res.status(500).json({ error: 'Twilio not configured' });
    }
    const result = await processFollowUps(twilioConfig);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Stats ---
app.get('/api/businesses/:id/stats', (req, res) => {
  try {
    const stats = getCampaignStats(parseInt(req.params.id, 10));
    res.json(stats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Review requests history ---
app.get('/api/businesses/:id/requests', (req, res) => {
  const db = getDb(process.env.DB_PATH);
  const bizId = parseInt(req.params.id, 10);
  const requests = db.findAll('review_requests', { business_id: bizId });
  const limit = parseInt(req.query.limit, 10) || 100;

  // Join customer data
  const enriched = requests.reverse().slice(0, limit).map(r => {
    const customer = db.findById('customers', r.customer_id);
    return {
      ...r,
      customer_name: customer?.name || 'Unknown',
      customer_phone: customer?.phone || null,
    };
  });
  res.json(enriched);
});

// --- AI Review Response ---
app.post('/api/generate-response', async (req, res) => {
  try {
    const response = await generateReviewResponse({
      businessName: req.body.businessName,
      reviewAuthor: req.body.reviewAuthor,
      rating: req.body.rating,
      reviewText: req.body.reviewText,
      businessCategory: req.body.businessCategory,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Templates ---
app.get('/api/templates', (req, res) => {
  const templates = listTemplates(req.query.channel, req.query.timing);
  res.json(templates);
});

// --- Utility ---
app.get('/api/review-url/:placeId', (req, res) => {
  res.json({ url: generateReviewUrl(req.params.placeId) });
});

// --- Twilio webhook for delivery status ---
app.post('/api/webhooks/twilio-status', (req, res) => {
  // Twilio sends status updates here
  const { MessageSid, MessageStatus } = req.body;
  console.log(`Twilio status update: ${MessageSid} -> ${MessageStatus}`);
  // TODO: Update review_requests status based on MessageSid
  res.sendStatus(200);
});

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    twilioConfigured: !!twilioConfig.accountSid,
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    version: '1.0.0',
  });
});

app.listen(PORT, () => {
  console.log(`Review Engine running at http://localhost:${PORT}`);
  if (!twilioConfig.accountSid) {
    console.warn('WARNING: Twilio not configured. SMS sending disabled.');
  }
  // Initialize database
  getDb(process.env.DB_PATH);
  console.log('Database initialized.');
});
