import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { auditProfile } from './audit-engine.js';

// Mock Google Places API response — complete profile
const completeProfile = {
  id: 'ChIJtest123',
  displayName: { text: "Joe's Plumbing" },
  formattedAddress: '123 Main St, Canton, GA 30114',
  nationalPhoneNumber: '(770) 555-1234',
  websiteUri: 'https://joesplumbing.com',
  regularOpeningHours: {
    periods: [{ open: { day: 1, hour: 8 }, close: { day: 1, hour: 17 } }],
  },
  editorialSummary: { text: 'Professional plumbing services in Canton.' },
  rating: 4.7,
  userRatingCount: 85,
  reviews: [
    {
      authorAttribution: { displayName: 'Sarah M.' },
      rating: 5,
      text: { text: 'Great service!' },
      publishTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      authorAttribution: { displayName: 'Bob T.' },
      rating: 4,
      text: { text: 'Good work' },
      publishTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  photos: Array(15).fill({ name: 'photo' }),
  types: ['plumber', 'general_contractor', 'home_repair'],
  primaryType: 'plumber',
  primaryTypeDisplayName: { text: 'Plumber' },
  accessibilityOptions: { wheelchairAccessibleEntrance: true },
  paymentOptions: { acceptsCreditCards: true },
  location: { latitude: 34.2368, longitude: -84.4908 },
};

// Mock — minimal profile
const minimalProfile = {
  id: 'ChIJtest456',
  displayName: { text: 'Some Business' },
  formattedAddress: '456 Oak St',
  rating: 3.2,
  userRatingCount: 3,
  types: ['establishment'],
};

describe('auditProfile', () => {
  it('returns correct structure for a complete profile', () => {
    const result = auditProfile(completeProfile);

    assert.ok(result.businessName);
    assert.ok(result.address);
    assert.ok(result.placeId);
    assert.ok(result.overallScore >= 0 && result.overallScore <= 100);
    assert.ok(['A', 'B', 'C', 'D', 'F'].includes(result.grade));
    assert.ok(result.scores);
    assert.ok(result.findings);
    assert.ok(result.recommendations);
    assert.ok(result.auditDate);
  });

  it('scores a complete profile highly', () => {
    const result = auditProfile(completeProfile);

    assert.ok(result.overallScore >= 65, `Expected >= 65, got ${result.overallScore}`);
    assert.ok(result.scores.profileCompleteness.score >= 80);
    assert.ok(result.scores.reviewHealth.score >= 60);
    assert.ok(result.scores.photoPresence.score >= 80);
    assert.ok(result.scores.websitePresence.score >= 70);
  });

  it('scores a minimal profile low', () => {
    const result = auditProfile(minimalProfile);

    assert.ok(result.overallScore <= 50, `Expected <= 50, got ${result.overallScore}`);
    assert.ok(result.scores.profileCompleteness.score <= 50);
    assert.ok(result.scores.photoPresence.score === 0);
    assert.ok(result.scores.websitePresence.score === 0);
  });

  it('generates critical findings for minimal profiles', () => {
    const result = auditProfile(minimalProfile);
    const criticals = result.findings.filter(f => f.severity === 'critical');

    assert.ok(criticals.length > 0, 'Should have critical findings');
  });

  it('generates recommendations sorted by priority', () => {
    const result = auditProfile(minimalProfile);

    assert.ok(result.recommendations.length > 0);
    assert.ok(result.recommendations.length <= 5, 'Max 5 recommendations');

    // Check priorities are sequential
    result.recommendations.forEach((rec, i) => {
      assert.equal(rec.priority, i + 1);
    });
  });

  it('assigns correct grades', () => {
    // A complete profile should get at least a C
    const goodResult = auditProfile(completeProfile);
    assert.ok(['A', 'B', 'C'].includes(goodResult.grade));

    // A minimal profile should get D or F
    const badResult = auditProfile(minimalProfile);
    assert.ok(['D', 'F'].includes(badResult.grade));
  });

  it('handles missing fields gracefully', () => {
    const emptyProfile = { id: 'test' };
    const result = auditProfile(emptyProfile);

    assert.equal(result.businessName, 'Unknown');
    assert.ok(result.overallScore >= 0);
    assert.ok(result.findings.length > 0);
  });

  it('correctly identifies profile completeness fields', () => {
    const result = auditProfile(completeProfile);
    const fields = result.scores.profileCompleteness.details;

    assert.ok(fields.length === 8, 'Should check 8 fields');
    const present = fields.filter(f => f.present);
    assert.ok(present.length >= 7, 'Complete profile should have 7+ fields present');
  });
});
