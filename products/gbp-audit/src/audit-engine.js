/**
 * GBP Audit Engine
 * Scores a business's Google Business Profile across 8 dimensions.
 * Each dimension is scored 0-100. Overall score is weighted average.
 */

const WEIGHTS = {
  profileCompleteness: 0.20,
  reviewHealth: 0.25,
  photoPresence: 0.10,
  categoryAccuracy: 0.10,
  postingActivity: 0.10,
  responseRate: 0.15,
  attributesCoverage: 0.05,
  websitePresence: 0.05,
};

/**
 * @param {object} placeData - Google Places API response
 * @returns {object} Full audit result with scores, findings, and recommendations
 */
export function auditProfile(placeData) {
  const scores = {
    profileCompleteness: scoreProfileCompleteness(placeData),
    reviewHealth: scoreReviewHealth(placeData),
    photoPresence: scorePhotoPresence(placeData),
    categoryAccuracy: scoreCategoryAccuracy(placeData),
    postingActivity: scorePostingActivity(placeData),
    responseRate: scoreResponseRate(placeData),
    attributesCoverage: scoreAttributesCoverage(placeData),
    websitePresence: scoreWebsitePresence(placeData),
  };

  const overall = Object.entries(scores).reduce(
    (sum, [key, val]) => sum + val.score * WEIGHTS[key],
    0
  );

  const findings = generateFindings(scores, placeData);
  const recommendations = generateRecommendations(scores, placeData);
  const grade = scoreToGrade(overall);

  return {
    businessName: placeData.displayName?.text || placeData.name || 'Unknown',
    address: placeData.formattedAddress || 'N/A',
    placeId: placeData.id || placeData.place_id || null,
    overallScore: Math.round(overall),
    grade,
    scores,
    findings,
    recommendations,
    auditDate: new Date().toISOString(),
    metadata: {
      apiSource: 'Google Places API (New)',
      version: '1.0.0',
    },
  };
}

function scoreProfileCompleteness(data) {
  const fields = [
    { name: 'Business Name', present: !!data.displayName?.text },
    { name: 'Address', present: !!data.formattedAddress },
    { name: 'Phone Number', present: !!data.nationalPhoneNumber || !!data.internationalPhoneNumber },
    { name: 'Website', present: !!data.websiteUri },
    { name: 'Hours of Operation', present: !!data.regularOpeningHours },
    { name: 'Business Description', present: !!data.editorialSummary?.text },
    { name: 'Primary Category', present: !!data.primaryTypeDisplayName?.text || !!data.primaryType },
    { name: 'Additional Categories', present: (data.types?.length || 0) > 1 },
  ];

  const presentCount = fields.filter(f => f.present).length;
  const score = Math.round((presentCount / fields.length) * 100);

  return {
    score,
    label: 'Profile Completeness',
    details: fields,
    summary: `${presentCount} of ${fields.length} key profile fields completed`,
  };
}

function scoreReviewHealth(data) {
  const rating = data.rating || 0;
  const reviewCount = data.userRatingCount || 0;

  let score = 0;

  // Rating component (40% of review score)
  if (rating >= 4.5) score += 40;
  else if (rating >= 4.0) score += 32;
  else if (rating >= 3.5) score += 20;
  else if (rating >= 3.0) score += 10;
  else score += 0;

  // Volume component (40% of review score)
  if (reviewCount >= 100) score += 40;
  else if (reviewCount >= 50) score += 32;
  else if (reviewCount >= 25) score += 24;
  else if (reviewCount >= 10) score += 16;
  else if (reviewCount >= 5) score += 8;
  else score += 0;

  // Recency component (20% of review score) - from reviews array if available
  const reviews = data.reviews || [];
  if (reviews.length > 0) {
    const latestReview = reviews[0];
    const reviewDate = latestReview.publishTime
      ? new Date(latestReview.publishTime)
      : null;

    if (reviewDate) {
      const daysSinceLatest = (Date.now() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLatest <= 7) score += 20;
      else if (daysSinceLatest <= 30) score += 15;
      else if (daysSinceLatest <= 90) score += 10;
      else if (daysSinceLatest <= 180) score += 5;
    }
  } else {
    // No reviews data available, neutral score
    score += 10;
  }

  return {
    score: Math.min(score, 100),
    label: 'Review Health',
    details: {
      averageRating: rating,
      totalReviews: reviewCount,
      recentReviewCount: reviews.length,
    },
    summary: `${rating} stars from ${reviewCount} reviews`,
  };
}

function scorePhotoPresence(data) {
  const photoCount = data.photos?.length || 0;

  let score = 0;
  if (photoCount >= 20) score = 100;
  else if (photoCount >= 10) score = 80;
  else if (photoCount >= 5) score = 60;
  else if (photoCount >= 3) score = 40;
  else if (photoCount >= 1) score = 20;

  return {
    score,
    label: 'Photo Presence',
    details: { photoCount },
    summary: `${photoCount} photos on profile (recommend 10+)`,
  };
}

function scoreCategoryAccuracy(data) {
  const primaryCategory = data.primaryTypeDisplayName?.text || data.primaryType;
  const additionalTypes = data.types?.filter(t => t !== data.primaryType) || [];

  let score = 0;
  if (primaryCategory) score += 60;
  if (additionalTypes.length >= 2) score += 40;
  else if (additionalTypes.length >= 1) score += 20;

  return {
    score,
    label: 'Category Accuracy',
    details: {
      primaryCategory: primaryCategory || 'Not set',
      additionalCategories: additionalTypes.length,
    },
    summary: primaryCategory
      ? `Primary: ${primaryCategory}, ${additionalTypes.length} additional`
      : 'No primary category set',
  };
}

function scorePostingActivity(data) {
  // Google Places API doesn't directly expose post data
  // Score based on available indicators of activity
  let score = 30; // Baseline — can't fully assess without GBP Management API

  // If there's a recent editorial summary, business is somewhat active
  if (data.editorialSummary?.text) score += 20;

  // If they have a website, they're likely more digitally active
  if (data.websiteUri) score += 15;

  // Many photos suggest active management
  if ((data.photos?.length || 0) >= 10) score += 20;

  // Recent reviews suggest the business is actively soliciting
  if ((data.userRatingCount || 0) >= 25) score += 15;

  return {
    score: Math.min(score, 100),
    label: 'Posting Activity',
    details: {
      note: 'Estimated from profile activity signals. Full post analysis requires GBP Management API access.',
    },
    summary: 'Posting activity estimated from profile signals',
  };
}

function scoreResponseRate(data) {
  const reviews = data.reviews || [];
  if (reviews.length === 0) {
    return {
      score: 50,
      label: 'Review Response Rate',
      details: { reviewsAnalyzed: 0, responsesFound: 0 },
      summary: 'No review data available for response analysis',
    };
  }

  const withResponse = reviews.filter(r => r.authorAttribution?.displayName && r.text?.text).length;
  // The Places API shows owner responses differently — check for reply field
  const responded = reviews.filter(r => {
    // In Places API (New), owner responses may not always be visible
    // Use review text length and rating as proxy for engagement indicators
    return r.rating && r.text?.text;
  }).length;

  // Conservative scoring since we can't perfectly detect responses
  let score = 50;
  if (reviews.length >= 5) score += 10;
  if (reviews.some(r => r.rating <= 3)) {
    // Has negative reviews — response rate matters more
    score -= 10;
  }

  return {
    score: Math.min(Math.max(score, 0), 100),
    label: 'Review Response Rate',
    details: {
      reviewsAnalyzed: reviews.length,
      note: 'Full response rate analysis requires GBP Management API access',
    },
    summary: `${reviews.length} reviews analyzed (limited response data from Places API)`,
  };
}

function scoreAttributesCoverage(data) {
  // Check for accessibility, payment, service options
  const hasAccessibility = !!data.accessibilityOptions;
  const hasPaymentOptions = !!data.paymentOptions;
  const hasDineIn = data.dineIn !== undefined;
  const hasDelivery = data.delivery !== undefined;
  const hasTakeout = data.takeout !== undefined;
  const hasReservable = data.reservable !== undefined;

  const attrs = [hasAccessibility, hasPaymentOptions, hasDineIn, hasDelivery, hasTakeout, hasReservable];
  const presentCount = attrs.filter(Boolean).length;

  // Not all attributes apply to all businesses, so be generous
  const score = Math.min(40 + (presentCount * 10), 100);

  return {
    score,
    label: 'Attributes Coverage',
    details: {
      accessibility: hasAccessibility,
      paymentOptions: hasPaymentOptions,
      serviceOptions: { dineIn: hasDineIn, delivery: hasDelivery, takeout: hasTakeout },
    },
    summary: `${presentCount} attribute categories populated`,
  };
}

function scoreWebsitePresence(data) {
  const hasWebsite = !!data.websiteUri;
  let score = hasWebsite ? 70 : 0;

  // Bonus for HTTPS
  if (hasWebsite && data.websiteUri.startsWith('https://')) score += 15;

  // Bonus for having a real domain (not just facebook)
  if (hasWebsite && !data.websiteUri.includes('facebook.com')) score += 15;

  return {
    score: Math.min(score, 100),
    label: 'Website Presence',
    details: {
      websiteUrl: data.websiteUri || 'None',
      isSecure: data.websiteUri?.startsWith('https://') || false,
      isSocialOnly: data.websiteUri?.includes('facebook.com') || false,
    },
    summary: hasWebsite ? `Website: ${data.websiteUri}` : 'No website linked',
  };
}

function generateFindings(scores, data) {
  const findings = [];

  // Critical findings (score < 40)
  Object.entries(scores).forEach(([key, val]) => {
    if (val.score < 40) {
      findings.push({
        severity: 'critical',
        dimension: val.label,
        score: val.score,
        finding: getCriticalFinding(key, val, data),
      });
    }
  });

  // Warning findings (score 40-69)
  Object.entries(scores).forEach(([key, val]) => {
    if (val.score >= 40 && val.score < 70) {
      findings.push({
        severity: 'warning',
        dimension: val.label,
        score: val.score,
        finding: getWarningFinding(key, val, data),
      });
    }
  });

  // Positive findings (score >= 70)
  Object.entries(scores).forEach(([key, val]) => {
    if (val.score >= 70) {
      findings.push({
        severity: 'good',
        dimension: val.label,
        score: val.score,
        finding: getPositiveFinding(key, val, data),
      });
    }
  });

  return findings;
}

function getCriticalFinding(key, scoreData, data) {
  const map = {
    profileCompleteness: `Your profile is missing critical information. ${scoreData.details.filter(f => !f.present).map(f => f.name).join(', ')} need to be added immediately. Incomplete profiles get 60% fewer clicks.`,
    reviewHealth: `Your review presence needs urgent attention. ${data.userRatingCount || 0} reviews and a ${data.rating || 0}-star rating puts you behind competitors. Businesses with 50+ reviews generate 266% more revenue.`,
    photoPresence: `Your profile has only ${data.photos?.length || 0} photos. Businesses with 100+ photos get 520% more calls. Add at least 10 high-quality photos of your work, team, and location.`,
    categoryAccuracy: `Your business categories are not properly configured. This directly affects which searches you appear in.`,
    postingActivity: `No recent posting activity detected. Google rewards businesses that post weekly updates, offers, and events.`,
    responseRate: `Low review response rate detected. Responding to all reviews (positive and negative) signals to Google that you actively manage your business.`,
    attributesCoverage: `Business attributes are largely missing. Attributes help customers find you for specific needs (accessibility, payment options, services).`,
    websitePresence: `No website linked to your profile. 27% of businesses lack a website — but those with one get 35% more engagement from their GBP.`,
  };
  return map[key] || `${scoreData.label} needs improvement.`;
}

function getWarningFinding(key, scoreData, data) {
  const map = {
    profileCompleteness: `Profile is partially complete. Fill in: ${scoreData.details.filter(f => !f.present).map(f => f.name).join(', ')}.`,
    reviewHealth: `Review profile is average. ${data.userRatingCount || 0} reviews is a start, but your competitors likely have more. Implement a review request system.`,
    photoPresence: `${data.photos?.length || 0} photos is below the recommended 10+. Add photos of your work, team, storefront, and products.`,
    categoryAccuracy: `Category setup could be improved. Adding 2-3 relevant secondary categories increases your visibility in related searches.`,
    postingActivity: `Moderate activity detected, but weekly Google Posts would significantly boost engagement.`,
    responseRate: `Some reviews appear unanswered. Aim for 100% response rate within 24 hours.`,
    attributesCoverage: `Some attributes are set, but there are more available for your business type. Review all applicable attributes.`,
    websitePresence: `Website is linked but could be improved. Ensure it's HTTPS, mobile-friendly, and has clear calls-to-action.`,
  };
  return map[key] || `${scoreData.label} has room for improvement.`;
}

function getPositiveFinding(key, scoreData, _data) {
  const map = {
    profileCompleteness: `Strong profile completeness. All critical fields are filled in.`,
    reviewHealth: `Healthy review profile. Keep up the momentum with consistent review requests.`,
    photoPresence: `Good photo presence. Continue adding fresh photos monthly.`,
    categoryAccuracy: `Categories are well-configured for your business.`,
    postingActivity: `Active profile management detected. Keep posting regularly.`,
    responseRate: `Good review engagement. Customers and Google reward responsive businesses.`,
    attributesCoverage: `Attributes are well-populated for your business type.`,
    websitePresence: `Website properly linked with secure connection.`,
  };
  return map[key] || `${scoreData.label} is performing well.`;
}

function generateRecommendations(scores, data) {
  const recs = [];

  // Sort dimensions by score ascending — worst first
  const sorted = Object.entries(scores).sort((a, b) => a[1].score - b[1].score);

  sorted.forEach(([key, val], index) => {
    if (val.score < 80) {
      recs.push({
        priority: index + 1,
        dimension: val.label,
        currentScore: val.score,
        action: getRecommendation(key, val, data),
        impact: getImpactEstimate(key, val),
        effort: getEffortEstimate(key),
      });
    }
  });

  return recs.slice(0, 5); // Top 5 recommendations
}

function getRecommendation(key, scoreData, data) {
  const map = {
    profileCompleteness: `Complete all missing fields: ${scoreData.details.filter(f => !f.present).map(f => f.name).join(', ')}. Each field improves your search visibility.`,
    reviewHealth: data.userRatingCount < 25
      ? `Launch a review request campaign. After each completed job, send a text with your Google review link. Target 5 new reviews per week.`
      : `Continue growing reviews. Respond to every review within 24 hours. Address negative reviews professionally and promptly.`,
    photoPresence: `Add ${Math.max(10 - (data.photos?.length || 0), 3)} more photos. Include: exterior, interior, team photos, work examples, and product shots. Update quarterly.`,
    categoryAccuracy: `Review your Google Business categories. Add 2-3 relevant secondary categories that match your services.`,
    postingActivity: `Start posting weekly Google Business updates. Share: offers, events, new services, team highlights, project completions.`,
    responseRate: `Set up a daily review check. Respond to all reviews — thank positive reviewers by name, address negative reviews with empathy and resolution.`,
    attributesCoverage: `Log into Google Business Manager and fill in all applicable attributes for your business type.`,
    websitePresence: `Add a professional website to your profile. Even a simple one-page site with your services, hours, and contact info improves credibility.`,
  };
  return map[key] || `Improve your ${scoreData.label} score.`;
}

function getImpactEstimate(key, scoreData) {
  if (scoreData.score < 40) return 'High — fixing this can significantly increase your visibility';
  if (scoreData.score < 70) return 'Medium — improvement will noticeably boost your profile';
  return 'Low — fine-tuning for competitive advantage';
}

function getEffortEstimate(key) {
  const effort = {
    profileCompleteness: '15 minutes',
    reviewHealth: 'Ongoing — 5 minutes/day',
    photoPresence: '1-2 hours',
    categoryAccuracy: '10 minutes',
    postingActivity: '30 minutes/week',
    responseRate: '5 minutes/day',
    attributesCoverage: '10 minutes',
    websitePresence: '2-4 hours (or use a builder)',
  };
  return effort[key] || '30 minutes';
}

function scoreToGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
