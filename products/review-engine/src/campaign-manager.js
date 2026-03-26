/**
 * Campaign Manager
 * Handles creating campaigns, scheduling sends, and processing follow-ups.
 */

import { getDb } from './database.js';
import { sendSms, formatPhoneNumber, isValidPhone } from './sms-sender.js';
import { renderTemplate, generateReviewUrl } from './templates.js';

function db() {
  return getDb(process.env.DB_PATH);
}

/**
 * Create a new business in the system.
 */
export function createBusiness(business) {
  const reviewUrl = business.placeId ? generateReviewUrl(business.placeId) : null;
  return db().insert('businesses', {
    name: business.name,
    place_id: business.placeId || null,
    google_review_url: reviewUrl,
    phone: business.phone || null,
    email: business.email || null,
    category: business.category || null,
  });
}

/**
 * Add a customer to a business for review requesting.
 */
export function addCustomer(customer) {
  return db().insert('customers', {
    business_id: customer.businessId,
    name: customer.name,
    phone: customer.phone ? formatPhoneNumber(customer.phone) : null,
    email: customer.email || null,
    service_date: customer.serviceDate || new Date().toISOString().split('T')[0],
    service_description: customer.serviceDescription || null,
  });
}

/**
 * Import multiple customers from an array.
 */
export function importCustomers(businessId, customers) {
  let imported = 0;
  let skipped = 0;
  const errors = [];

  for (const c of customers) {
    if (!c.name || (!c.phone && !c.email)) {
      skipped++;
      continue;
    }

    try {
      db().insert('customers', {
        business_id: businessId,
        name: c.name,
        phone: c.phone ? formatPhoneNumber(c.phone) : null,
        email: c.email || null,
        service_date: c.serviceDate || new Date().toISOString().split('T')[0],
        service_description: c.serviceDescription || null,
      });
      imported++;
    } catch (err) {
      errors.push({ customer: c.name, error: err.message });
    }
  }

  return { imported, skipped, errors };
}

/**
 * Create a review request campaign.
 */
export function createCampaign(campaign) {
  return db().insert('campaigns', {
    business_id: campaign.businessId,
    name: campaign.name,
    template_id: campaign.templateId || 'initial_friendly',
    follow_up_days: campaign.followUpDays || 3,
    max_attempts: campaign.maxAttempts || 2,
    status: 'active',
  });
}

/**
 * Send a review request to a specific customer.
 */
export async function sendReviewRequest(customerId, templateId, twilioConfig) {
  const d = db();

  const customer = d.findById('customers', customerId);
  if (!customer) throw new Error(`Customer ${customerId} not found`);

  const business = d.findById('businesses', customer.business_id);
  if (!business) throw new Error(`Business ${customer.business_id} not found`);

  if (!business.google_review_url) {
    throw new Error(`Business ${business.name} has no Google review URL. Set a Place ID first.`);
  }

  // Check existing requests
  const existing = d.query('review_requests', r =>
    r.customer_id === customerId && ['pending', 'sent', 'delivered'].includes(r.status)
  );
  const attemptNumber = existing.length > 0
    ? Math.max(...existing.map(r => r.attempt_number)) + 1
    : 1;

  // Render the template
  const rendered = renderTemplate(templateId, {
    businessName: business.name,
    customerName: customer.name,
    reviewUrl: business.google_review_url,
    serviceName: customer.service_description || 'service',
  });

  // Create the request record
  const request = d.insert('review_requests', {
    customer_id: customerId,
    business_id: business.id,
    channel: rendered.channel,
    status: 'pending',
    attempt_number: attemptNumber,
  });

  // Send SMS
  if (rendered.channel === 'sms') {
    if (!customer.phone) {
      d.update('review_requests', request.id, { status: 'failed', error_message: 'No phone number' });
      return { requestId: request.id, status: 'failed', reason: 'No phone number' };
    }

    if (!isValidPhone(customer.phone)) {
      d.update('review_requests', request.id, { status: 'failed', error_message: `Invalid phone: ${customer.phone}` });
      return { requestId: request.id, status: 'failed', reason: 'Invalid phone number' };
    }

    try {
      const smsResult = await sendSms({
        to: formatPhoneNumber(customer.phone),
        body: rendered.body,
        from: twilioConfig.fromNumber,
        accountSid: twilioConfig.accountSid,
        authToken: twilioConfig.authToken,
      });

      d.update('review_requests', request.id, { status: 'sent', sent_at: new Date().toISOString() });
      return { requestId: request.id, status: 'sent', messageSid: smsResult.messageSid };
    } catch (err) {
      d.update('review_requests', request.id, { status: 'failed', error_message: err.message });
      return { requestId: request.id, status: 'failed', reason: err.message };
    }
  }

  return { requestId: request.id, status: 'pending', channel: 'email', note: 'Email sending not yet automated' };
}

/**
 * Process pending follow-ups for all active campaigns.
 */
export async function processFollowUps(twilioConfig) {
  const d = db();
  const campaigns = d.query('campaigns', c => c.status === 'active');

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const campaign of campaigns) {
    const followUpMs = (campaign.follow_up_days || 3) * 24 * 60 * 60 * 1000;

    // Find customers who got initial request N days ago and haven't reviewed or been followed up
    const candidates = d.query('review_requests', r =>
      r.business_id === campaign.business_id
      && r.attempt_number === 1
      && ['sent', 'delivered'].includes(r.status)
      && r.sent_at
      && (Date.now() - new Date(r.sent_at).getTime()) >= followUpMs
    );

    for (const req of candidates) {
      // Check if already followed up or reviewed
      const hasFollowup = d.query('review_requests', r =>
        r.customer_id === req.customer_id && r.attempt_number >= (campaign.max_attempts || 2)
      ).length > 0;

      const hasReview = d.query('review_requests', r =>
        r.customer_id === req.customer_id && r.status === 'reviewed'
      ).length > 0;

      if (hasFollowup || hasReview) { skipped++; continue; }

      try {
        const result = await sendReviewRequest(req.customer_id, 'followup_gentle', twilioConfig);
        if (result.status === 'sent') sent++;
        else if (result.status === 'failed') failed++;
        else skipped++;
      } catch {
        failed++;
      }
    }
  }

  return { sent, skipped, failed };
}

/**
 * Get campaign statistics.
 */
export function getCampaignStats(businessId) {
  const d = db();

  const requests = d.findAll('review_requests', { business_id: businessId });
  const customers = d.findAll('customers', { business_id: businessId });

  const statusCounts = {};
  for (const r of requests) {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentRequests = requests.filter(r => r.created_at >= sevenDaysAgo);

  return {
    totalRequests: requests.length,
    totalCustomers: customers.length,
    requestsLast7Days: recentRequests.length,
    byStatus: statusCounts,
    conversionRate: requests.length > 0
      ? ((statusCounts.reviewed || 0) / requests.length * 100).toFixed(1) + '%'
      : '0%',
  };
}
