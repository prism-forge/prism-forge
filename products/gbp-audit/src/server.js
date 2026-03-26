/**
 * GBP Audit Web Server
 * Simple Express server that serves a landing page and audit API.
 */

import express from 'express';
import { config } from 'dotenv';
import { searchPlaces, getPlaceDetails, findCompetitors } from './google-places.js';
import { auditProfile } from './audit-engine.js';
import { generatePdfReport, generateTextSummary } from './report-generator.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(resolve(__dirname, '..', 'public')));

// Landing page
app.get('/', (_req, res) => {
  const html = readFileSync(resolve(__dirname, '..', 'public', 'index.html'), 'utf-8');
  res.type('html').send(html);
});

// Search for businesses
app.get('/api/search', async (req, res) => {
  try {
    const { q, location } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });
    if (!API_KEY) return res.status(500).json({ error: 'Server not configured — missing API key' });

    const query = location ? `${q} ${location}` : q;
    const results = await searchPlaces(query, API_KEY, { maxResults: 5 });

    res.json({
      results: results.map(r => ({
        placeId: r.id,
        name: r.displayName?.text,
        address: r.formattedAddress,
        rating: r.rating,
        reviewCount: r.userRatingCount,
        type: r.primaryTypeDisplayName?.text,
      })),
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Run audit on a specific place
app.get('/api/audit/:placeId', async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: 'Server not configured — missing API key' });

    const placeData = await getPlaceDetails(req.params.placeId, API_KEY);
    const auditResult = auditProfile(placeData);

    // Optionally fetch competitors
    let competitors = [];
    if (req.query.competitors === 'true' && placeData.location && placeData.primaryType) {
      const allCompetitors = await findCompetitors(
        placeData.primaryTypeDisplayName?.text || placeData.primaryType,
        { lat: placeData.location.latitude, lng: placeData.location.longitude },
        API_KEY,
        parseInt(req.query.radius, 10) || 5000
      );
      competitors = allCompetitors.filter(c => c.id !== placeData.id);
    }

    res.json({ audit: auditResult, competitors });
  } catch (error) {
    console.error('Audit error:', error.message);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Generate PDF report
app.get('/api/audit/:placeId/pdf', async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: 'Server not configured — missing API key' });

    const placeData = await getPlaceDetails(req.params.placeId, API_KEY);
    const auditResult = auditProfile(placeData);

    let competitors = [];
    if (req.query.competitors === 'true' && placeData.location && placeData.primaryType) {
      const allCompetitors = await findCompetitors(
        placeData.primaryTypeDisplayName?.text || placeData.primaryType,
        { lat: placeData.location.latitude, lng: placeData.location.longitude },
        API_KEY,
        parseInt(req.query.radius, 10) || 5000
      );
      competitors = allCompetitors.filter(c => c.id !== placeData.id);
    }

    const safeName = auditResult.businessName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="gbp-audit-${safeName}.pdf"`);

    const doc = generatePdfReport(auditResult, competitors);
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('PDF error:', error.message);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Text summary endpoint (for email/SMS)
app.get('/api/audit/:placeId/text', async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: 'Server not configured — missing API key' });

    const placeData = await getPlaceDetails(req.params.placeId, API_KEY);
    const auditResult = auditProfile(placeData);
    const text = generateTextSummary(auditResult);

    res.type('text/plain').send(text);
  } catch (error) {
    console.error('Text error:', error.message);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    apiConfigured: !!API_KEY,
    version: '1.0.0',
  });
});

app.listen(PORT, () => {
  console.log(`GBP Audit Tool running at http://localhost:${PORT}`);
  if (!API_KEY) {
    console.warn('WARNING: GOOGLE_PLACES_API_KEY not set. Copy .env.example to .env and add your key.');
  }
});
