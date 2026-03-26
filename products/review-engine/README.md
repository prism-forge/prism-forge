# Review Engine

Automated review request and response management for local businesses. Send SMS/email campaigns asking customers for Google reviews, with AI-powered review response generation.

## What It Does

1. **Review Request Campaigns**: Send automated SMS/email to customers after service, asking for Google reviews
2. **Follow-Up Drip**: Automatic follow-up 3 days later if no review detected
3. **AI Review Responses**: Generate professional responses to Google reviews using Claude AI
4. **Campaign Analytics**: Track sent, delivered, clicked, and reviewed rates
5. **Customer Management**: Import customers from CSV or add individually
6. **Template Library**: Pre-built SMS and email templates optimized for conversions

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env
# Edit .env with Twilio credentials and (optionally) Anthropic API key

# Start the dashboard
npm start
# Open http://localhost:3001
```

## Setup Requirements

### Twilio (for SMS)
1. Create a [Twilio account](https://www.twilio.com/try-twilio)
2. Get your Account SID and Auth Token from the console
3. Buy a phone number ($1/month) with SMS capability
4. Add credentials to `.env`

### Google Place ID
1. Search for your business on Google Maps
2. Use the [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id) or the GBP Audit tool
3. The review link is automatically generated: `https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID`

### Anthropic API (optional, for AI responses)
1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Add to `.env` as `ANTHROPIC_API_KEY`
3. Uses Claude Haiku for cost efficiency (~$0.001 per response)

## API Endpoints

### Businesses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/businesses` | Create a business |
| GET | `/api/businesses` | List all businesses |
| GET | `/api/businesses/:id` | Get business details |
| GET | `/api/businesses/:id/stats` | Campaign statistics |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/businesses/:id/customers` | Add a customer |
| POST | `/api/businesses/:id/customers/import` | Batch import customers |
| GET | `/api/businesses/:id/customers` | List customers |

### Review Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/customers/:id/send-review-request` | Send to one customer |
| POST | `/api/businesses/:id/send-batch` | Send to all unsent customers |
| POST | `/api/process-followups` | Process pending follow-ups |
| GET | `/api/businesses/:id/requests` | Request history |

### AI Responses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate-response` | Generate AI review response |

### Utility
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List message templates |
| GET | `/api/review-url/:placeId` | Generate review URL |
| GET | `/api/health` | Health check |

## Message Templates

| Template | Channel | When |
|----------|---------|------|
| `initial_friendly` | SMS | Same day — casual, warm tone |
| `initial_professional` | SMS | Same day — formal tone |
| `initial_service` | SMS | Same day — mentions specific service |
| `followup_gentle` | SMS | 3 days later — gentle reminder |
| `followup_impact` | SMS | 3 days later — explains review impact |
| `email_initial` | Email | Same day — full email format |
| `email_followup` | Email | 3 days later — email reminder |

## Business Model

- **$29/month**: Up to 50 review requests/month (SMS)
- **$49/month**: Unlimited requests + AI responses
- **$99/month**: + competitor monitoring + multi-platform (coming soon)

## Cost Structure

| Component | Cost |
|-----------|------|
| Twilio SMS | ~$0.0079/message |
| Twilio phone number | $1/month |
| Claude Haiku (AI responses) | ~$0.001/response |
| **Total per customer** | **~$0.02** |

At $29/month with 50 requests, COGS is ~$1.40 = **95% gross margin**.

## License

MIT
