#!/usr/bin/env node

/**
 * Review Engine CLI
 * Quick commands for managing review request campaigns.
 *
 * Usage:
 *   review-engine setup "Business Name" --place-id ChIJ...
 *   review-engine add "John Smith" "770-555-1234" --service "Water heater repair"
 *   review-engine import customers.csv
 *   review-engine send [--template initial_friendly]
 *   review-engine stats
 *   review-engine respond "Sarah M." 5 "Great service!"
 */

import { config } from 'dotenv';
import { getDb } from './database.js';
import {
  createBusiness,
  addCustomer,
  sendReviewRequest,
  getCampaignStats,
  createCampaign,
} from './campaign-manager.js';
import { generateReviewResponse } from './review-responder.js';
import { generateReviewUrl, listTemplates } from './templates.js';
import { readFileSync } from 'fs';

config();

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
  console.log(`
Review Engine CLI

Commands:
  setup <name> --place-id <id>                 Set up a business
  add <name> <phone> [--service <desc>]        Add a customer
  import <file.csv>                            Import customers from CSV
  send [--template <id>] [--limit <n>]         Send review requests
  followup                                     Process follow-up messages
  stats                                        Show campaign statistics
  respond <author> <rating> <text>             Generate AI review response
  templates                                    List available templates
  review-url <place_id>                        Generate Google review URL

Options:
  --help, -h       Show this help

Environment:
  TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER  (for SMS)
  ANTHROPIC_API_KEY                                            (for AI responses)
  DB_PATH                                                      (default: ./data/review-engine.json)
`);
  process.exit(0);
}

async function main() {
  const db = getDb(process.env.DB_PATH);

  switch (command) {
    case 'setup': {
      const name = args[1];
      const placeIdIdx = args.indexOf('--place-id');
      const placeId = placeIdIdx >= 0 ? args[placeIdIdx + 1] : null;

      if (!name) { console.error('Usage: review-engine setup "Business Name" --place-id <id>'); process.exit(1); }

      const biz = createBusiness({ name, placeId });
      console.log(`Business created: ${biz.name} (ID: ${biz.id})`);
      if (biz.googleReviewUrl) console.log(`Review URL: ${biz.googleReviewUrl}`);

      // Auto-create default campaign
      createCampaign({ businessId: biz.id, name: 'Default Campaign', templateId: 'initial_friendly' });
      console.log('Default campaign created.');
      break;
    }

    case 'add': {
      const businesses = db.findAll('businesses');
      if (businesses.length === 0) { console.error('No business set up. Run: review-engine setup "Name" --place-id <id>'); process.exit(1); }
      const biz = businesses[0];

      const custName = args[1];
      const phone = args[2];
      const serviceIdx = args.indexOf('--service');
      const serviceDesc = serviceIdx >= 0 ? args[serviceIdx + 1] : null;

      if (!custName) { console.error('Usage: review-engine add "Name" "Phone" [--service "desc"]'); process.exit(1); }

      const customer = addCustomer({
        businessId: biz.id,
        name: custName,
        phone: phone || null,
        serviceDescription: serviceDesc,
      });
      console.log(`Customer added: ${customer.name} (ID: ${customer.id})`);
      break;
    }

    case 'import': {
      const file = args[1];
      if (!file) { console.error('Usage: review-engine import customers.csv'); process.exit(1); }

      const businesses = db.findAll('businesses');
      if (businesses.length === 0) { console.error('No business set up.'); process.exit(1); }

      const csv = readFileSync(file, 'utf-8');
      const lines = csv.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const nameIdx = headers.indexOf('name');
      const phoneIdx = headers.indexOf('phone');
      const emailIdx = headers.indexOf('email');
      const serviceIdx = headers.indexOf('service');

      if (nameIdx === -1) { console.error('CSV must have a "name" column'); process.exit(1); }

      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const name = cols[nameIdx];
        if (!name) continue;

        addCustomer({
          businessId: businesses[0].id,
          name,
          phone: phoneIdx >= 0 ? cols[phoneIdx] : null,
          email: emailIdx >= 0 ? cols[emailIdx] : null,
          serviceDescription: serviceIdx >= 0 ? cols[serviceIdx] : null,
        });
        imported++;
      }
      console.log(`Imported ${imported} customers.`);
      break;
    }

    case 'send': {
      const templateIdx = args.indexOf('--template');
      const templateId = templateIdx >= 0 ? args[templateIdx + 1] : 'initial_friendly';
      const limitIdx = args.indexOf('--limit');
      const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 50;

      const twilioConfig = {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_PHONE_NUMBER,
      };

      if (!twilioConfig.accountSid) { console.error('Twilio not configured. Set TWILIO_* env vars.'); process.exit(1); }

      const businesses = db.findAll('businesses');
      if (businesses.length === 0) { console.error('No business set up.'); process.exit(1); }

      const biz = businesses[0];
      const sentIds = new Set(db.findAll('review_requests', { business_id: biz.id }).map(r => r.customer_id));
      const unsent = db.findAll('customers', { business_id: biz.id }).filter(c => !sentIds.has(c.id)).slice(0, limit);

      console.log(`Sending review requests to ${unsent.length} customers using template: ${templateId}`);

      let sent = 0, failed = 0;
      for (const customer of unsent) {
        try {
          const result = await sendReviewRequest(customer.id, templateId, twilioConfig);
          if (result.status === 'sent') {
            sent++;
            console.log(`  ✓ ${customer.name}`);
          } else {
            failed++;
            console.log(`  ✗ ${customer.name}: ${result.reason}`);
          }
        } catch (err) {
          failed++;
          console.log(`  ✗ ${customer.name}: ${err.message}`);
        }
        // Rate limit
        await new Promise(r => setTimeout(r, 1000));
      }
      console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`);
      break;
    }

    case 'stats': {
      const businesses = db.findAll('businesses');
      if (businesses.length === 0) { console.error('No business set up.'); process.exit(1); }

      const stats = getCampaignStats(businesses[0].id);
      console.log(`\n  Campaign Statistics — ${businesses[0].name}`);
      console.log(`  ${'='.repeat(40)}`);
      console.log(`  Total Customers:     ${stats.totalCustomers}`);
      console.log(`  Total Requests:      ${stats.totalRequests}`);
      console.log(`  Last 7 Days:         ${stats.requestsLast7Days}`);
      console.log(`  Conversion Rate:     ${stats.conversionRate}`);
      if (Object.keys(stats.byStatus).length > 0) {
        console.log(`  By Status:`);
        Object.entries(stats.byStatus).forEach(([s, c]) => console.log(`    ${s}: ${c}`));
      }
      break;
    }

    case 'respond': {
      const author = args[1];
      const rating = parseInt(args[2], 10);
      const text = args[3];

      if (!author || !rating || !text) {
        console.error('Usage: review-engine respond "Author" <rating> "Review text"');
        process.exit(1);
      }

      const businesses = db.findAll('businesses');
      const bizName = businesses[0]?.name || 'Your Business';
      const bizCategory = businesses[0]?.category || 'business';

      console.log('Generating response...');
      const response = await generateReviewResponse({
        businessName: bizName,
        businessCategory: bizCategory,
        reviewAuthor: author,
        rating,
        reviewText: text,
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      console.log(`\n  Response to ${author} (${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}):`);
      console.log(`  ${'-'.repeat(40)}`);
      console.log(`  ${response}`);
      break;
    }

    case 'templates': {
      const templates = listTemplates();
      console.log('\n  Available Templates:');
      templates.forEach(t => {
        console.log(`  [${t.id}] ${t.name} (${t.channel}, ${t.timing})`);
      });
      break;
    }

    case 'review-url': {
      const placeId = args[1];
      if (!placeId) { console.error('Usage: review-engine review-url <place_id>'); process.exit(1); }
      console.log(generateReviewUrl(placeId));
      break;
    }

    default:
      console.error(`Unknown command: ${command}. Run: review-engine --help`);
      process.exit(1);
  }
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
