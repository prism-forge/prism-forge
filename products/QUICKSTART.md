# Quick Start: Your First $500 This Week

This guide walks you through generating your first revenue using the GBP Audit Tool and Review Engine. No cloud deployment needed — run everything locally.

## Prerequisites

- Node.js 18+ installed
- A Google Cloud account with Places API enabled ($200 free credit)
- A Twilio account (free trial includes $15.50 credit)
- Optional: Anthropic API key for AI-powered features

## Step 1: Set Up the GBP Audit Tool (30 minutes)

```bash
cd products/gbp-audit
npm install
cp .env.example .env
```

Edit `.env`:
```
GOOGLE_PLACES_API_KEY=your_key_here
```

### Generate Your First Audit

```bash
# Search and audit a business
node src/cli.js "Joe's Plumbing" "Canton, GA" --competitors --format pdf

# Or run the web interface
npm start
# Open http://localhost:3000
```

### Generate 10 Free Audits for Local Businesses

```bash
# Run these one at a time, review each report
node src/cli.js "Canton Plumbing" "Canton, GA" --competitors
node src/cli.js "Woodstock Dental" "Woodstock, GA" --competitors
node src/cli.js "Cherokee HVAC" "Canton, GA" --competitors
# ... and so on for 10 businesses in your target area
```

Each audit generates a PDF you can hand-deliver or email.

## Step 2: Sell the Audit ($49-99 each)

### In-Person Approach
1. Walk into the business with a printed PDF report
2. Say: "I noticed your Google profile has some issues. I put together a free report showing what's wrong and how your competitors compare."
3. Hand them the report
4. If interested: "I can fix all of this and manage your Google presence for $99/month."

### Email Approach
1. Generate the audit
2. Email with subject: "Your Google Business Profile vs [Competitor Name]"
3. Attach the PDF
4. Include: "I found some issues with your Google profile that might be costing you customers. Here's a free report with details."

### Target: 10 audits delivered this week → 2-3 conversions → $100-300 in reports + leads for monthly service

## Step 3: Set Up the Review Engine (30 minutes)

For businesses that become monthly clients:

```bash
cd products/review-engine
npm install
cp .env.example .env
```

Edit `.env`:
```
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
ANTHROPIC_API_KEY=your_key  # optional
```

### Configure a Client Business

```bash
# Set up the business
node src/cli.js setup "Joe's Plumbing" --place-id ChIJxxxxxxxx

# Add their recent customers
node src/cli.js add "Sarah Martinez" "770-555-1234" --service "Water heater install"
node src/cli.js add "Bob Thompson" "770-555-5678" --service "Kitchen faucet repair"

# Or import from CSV
node src/cli.js import customers.csv
```

### Send Review Requests

```bash
# Send to all unsent customers
node src/cli.js send

# Check stats
node src/cli.js stats
```

### Generate AI Review Responses

```bash
node src/cli.js respond "Sarah M." 5 "Great service! Joe was on time and fixed our water heater quickly."
```

## Step 4: Monthly Workflow

For each client ($99-149/month):

### Week 1
- Run GBP audit, apply quick fixes (profile completeness, categories)
- Set up review request campaign
- Send first batch of review requests

### Week 2
- Follow-up messages sent automatically
- Generate AI responses for any new reviews
- Client approves and you post

### Week 3-4
- Add new customers from the month
- Send review requests
- Generate monthly report

### Month-End
- Run new audit, show score improvement
- Email client: "Your Google score improved from 42 to 67. You got 12 new reviews this month."

## Revenue Math

| Clients | Price | Monthly Revenue |
|---------|-------|----------------|
| 5 | $99/mo | $495/mo |
| 10 | $119/mo (avg) | $1,190/mo |
| 25 | $129/mo (avg) | $3,225/mo |
| 50 | $129/mo (avg) | $6,450/mo |

## Cost Math

| Item | Monthly |
|------|---------|
| Google Places API | ~$10-20 (1,000 lookups) |
| Twilio SMS | ~$0.01/msg × 500 msgs = $5 |
| Anthropic API | ~$0.001/response × 200 = $0.20 |
| **Total** | **~$15-25/month** |

**Gross margin at 10 clients: 98%**

## FAQ

**Q: Do I need to deploy these to a server?**
A: Not yet. Run locally for the first 10-20 clients. Deploy when you need automation (scheduled follow-ups, automated audits).

**Q: What if a business doesn't have a Google Place ID?**
A: Search for them using the audit tool — it will find them. Or use the [Google Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id).

**Q: Can I white-label the PDF report?**
A: Yes — edit `products/gbp-audit/src/report-generator.js` to change branding, colors, and contact info.

**Q: How do I get a Twilio phone number?**
A: Sign up at twilio.com, go to Phone Numbers → Buy a Number. Pick a local area code ($1/month). SMS-capable.
