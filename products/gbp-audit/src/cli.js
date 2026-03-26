#!/usr/bin/env node

/**
 * GBP Audit CLI
 * Usage: gbp-audit "Business Name" "City, State"
 *        gbp-audit --place-id ChIJ...
 */

import { config } from 'dotenv';
import { searchPlaces, getPlaceDetails, findCompetitors } from './google-places.js';
import { auditProfile } from './audit-engine.js';
import { generatePdfReport, generateTextSummary } from './report-generator.js';
import { createWriteStream } from 'fs';
import { resolve } from 'path';

config();

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(`
GBP Audit Tool — Google Business Profile Audit Report Generator

Usage:
  gbp-audit "Business Name" "City, State"     Search and audit a business
  gbp-audit --place-id <place_id>             Audit by Google Place ID
  gbp-audit --batch <file.txt>                Audit multiple businesses from file

Options:
  --format pdf|text|json   Output format (default: pdf)
  --output <path>          Output file path (default: ./report-<name>.pdf)
  --competitors            Include competitor comparison
  --radius <meters>        Competitor search radius (default: 5000)
  --help, -h               Show this help

Environment:
  GOOGLE_PLACES_API_KEY    Required. Get from Google Cloud Console.
  ANTHROPIC_API_KEY        Optional. Enables AI-powered recommendations.

Examples:
  gbp-audit "Joe's Plumbing" "Canton, GA"
  gbp-audit "Joe's Plumbing" "Canton, GA" --competitors --format pdf
  gbp-audit --place-id ChIJN1t_tDeuEmsRUsoyG83frY4 --format json
  `);
  process.exit(0);
}

const apiKey = process.env.GOOGLE_PLACES_API_KEY;
if (!apiKey) {
  console.error('Error: GOOGLE_PLACES_API_KEY environment variable is required.');
  console.error('Get yours at: https://console.cloud.google.com/apis/credentials');
  process.exit(1);
}

// Parse arguments
const placeIdFlag = args.indexOf('--place-id');
const formatFlag = args.indexOf('--format');
const outputFlag = args.indexOf('--output');
const includeCompetitors = args.includes('--competitors');
const radiusFlag = args.indexOf('--radius');

const format = formatFlag >= 0 ? args[formatFlag + 1] : 'pdf';
const outputPath = outputFlag >= 0 ? args[outputFlag + 1] : null;
const radius = radiusFlag >= 0 ? parseInt(args[radiusFlag + 1], 10) : 5000;

async function main() {
  try {
    let placeData;
    let businessQuery;

    if (placeIdFlag >= 0) {
      const placeId = args[placeIdFlag + 1];
      console.log(`Fetching details for place ID: ${placeId}...`);
      placeData = await getPlaceDetails(placeId, apiKey);
    } else {
      // First two non-flag args are business name and location
      const nonFlagArgs = args.filter((a, i) => {
        if (a.startsWith('--')) return false;
        const prevArg = args[i - 1];
        if (prevArg && ['--format', '--output', '--place-id', '--radius'].includes(prevArg)) return false;
        return true;
      });

      if (nonFlagArgs.length < 1) {
        console.error('Error: Provide a business name (and optionally a location).');
        process.exit(1);
      }

      businessQuery = nonFlagArgs.join(' ');
      console.log(`Searching for: "${businessQuery}"...`);

      const results = await searchPlaces(businessQuery, apiKey, { maxResults: 3 });

      if (results.length === 0) {
        console.error('No businesses found. Try a more specific search.');
        process.exit(1);
      }

      // Use the first result
      const selected = results[0];
      console.log(`Found: ${selected.displayName?.text} — ${selected.formattedAddress}`);
      console.log(`Fetching full details...`);

      placeData = await getPlaceDetails(selected.id, apiKey);
    }

    // Run audit
    console.log('Running audit...');
    const auditResult = auditProfile(placeData);

    // Fetch competitors if requested
    let competitors = [];
    if (includeCompetitors && placeData.location && placeData.primaryType) {
      console.log('Searching for competitors...');
      const allCompetitors = await findCompetitors(
        placeData.primaryTypeDisplayName?.text || placeData.primaryType,
        { lat: placeData.location.latitude, lng: placeData.location.longitude },
        apiKey,
        radius
      );
      // Exclude the audited business itself
      competitors = allCompetitors.filter(c => c.id !== placeData.id);
      console.log(`Found ${competitors.length} competitors.`);
    }

    // Generate output
    const safeName = auditResult.businessName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const defaultOutput = `report-${safeName}-${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
      const output = JSON.stringify({ audit: auditResult, competitors }, null, 2);
      if (outputPath) {
        const { writeFileSync } = await import('fs');
        writeFileSync(outputPath, output);
        console.log(`JSON report saved to: ${outputPath}`);
      } else {
        console.log(output);
      }
    } else if (format === 'text') {
      const text = generateTextSummary(auditResult);
      if (outputPath) {
        const { writeFileSync } = await import('fs');
        writeFileSync(outputPath, text);
        console.log(`Text report saved to: ${outputPath}`);
      } else {
        console.log(text);
      }
    } else {
      // PDF
      const pdfPath = outputPath || resolve(process.cwd(), `${defaultOutput}.pdf`);
      const doc = generatePdfReport(auditResult, competitors);
      const stream = createWriteStream(pdfPath);

      doc.pipe(stream);
      doc.end();

      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      console.log(`\nPDF report saved to: ${pdfPath}`);
    }

    // Print quick summary to terminal
    console.log(`\n${'='.repeat(50)}`);
    console.log(`  ${auditResult.businessName}`);
    console.log(`  Overall Score: ${auditResult.overallScore}/100 (${auditResult.grade})`);
    console.log(`${'='.repeat(50)}`);

    const criticals = auditResult.findings.filter(f => f.severity === 'critical');
    if (criticals.length > 0) {
      console.log(`\n  Critical Issues (${criticals.length}):`);
      criticals.forEach(f => console.log(`    [!] ${f.dimension}: ${f.score}/100`));
    }

    console.log(`\n  Top 3 Recommendations:`);
    auditResult.recommendations.slice(0, 3).forEach((r, i) => {
      console.log(`    ${i + 1}. ${r.dimension} (${r.effort})`);
    });

  } catch (error) {
    if (error.name === 'PlacesApiError') {
      console.error(`Google Places API error: ${error.message}`);
      if (error.statusCode === 403) {
        console.error('Check that your API key is valid and the Places API is enabled.');
      }
    } else {
      console.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}

main();
