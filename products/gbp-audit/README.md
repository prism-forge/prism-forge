# GBP Audit Tool

AI-powered Google Business Profile audit tool. Generates comprehensive audit reports with scoring, competitor comparison, and actionable recommendations.

## What It Does

1. Searches for a business on Google Places
2. Pulls their full GBP data (profile, reviews, photos, categories, attributes)
3. Scores across 8 dimensions (0-100 each, weighted overall)
4. Generates findings (critical/warning/good)
5. Produces prioritized recommendations
6. Optionally compares against local competitors
7. Outputs as PDF report, JSON, or plain text

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file and add your Google Places API key
cp .env.example .env
# Edit .env with your API key

# Run the web interface
npm start
# Open http://localhost:3000

# Or use the CLI
npm run audit -- "Joe's Plumbing" "Canton, GA"
npm run audit -- "Joe's Plumbing" "Canton, GA" --competitors --format pdf
```

## API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Places API (New)**
4. Create an API key under Credentials
5. Add to `.env` as `GOOGLE_PLACES_API_KEY`

## Scoring Dimensions

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Review Health | 25% | Rating, review count, recency |
| Profile Completeness | 20% | Name, address, phone, hours, description, categories |
| Response Rate | 15% | Review response activity |
| Photo Presence | 10% | Number and variety of photos |
| Category Accuracy | 10% | Primary and secondary categories |
| Posting Activity | 10% | Estimated from profile activity signals |
| Attributes Coverage | 5% | Accessibility, payment options, service options |
| Website Presence | 5% | Website linked, HTTPS, not just social |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search?q=name&location=city` | GET | Search for businesses |
| `/api/audit/:placeId` | GET | Run audit, returns JSON |
| `/api/audit/:placeId/pdf` | GET | Download PDF report |
| `/api/audit/:placeId/text` | GET | Plain text summary |
| `/api/health` | GET | Health check |

## CLI Usage

```bash
# Basic audit
gbp-audit "Business Name" "City, State"

# With competitor comparison
gbp-audit "Business Name" "City, State" --competitors

# Output formats
gbp-audit "Business Name" "City, State" --format json
gbp-audit "Business Name" "City, State" --format text
gbp-audit "Business Name" "City, State" --format pdf --output report.pdf

# By Place ID
gbp-audit --place-id ChIJN1t_tDeuEmsRUsoyG83frY4
```

## Business Model

- **Free audit**: Web form generates a basic report (lead generation)
- **$49-99 per report**: Detailed PDF with competitor comparison (one-time)
- **$99-149/month**: Ongoing management (upsell from audit)

## License

MIT
