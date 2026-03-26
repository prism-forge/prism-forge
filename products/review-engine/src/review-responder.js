/**
 * AI-Powered Review Response Generator
 * Uses Anthropic Claude API to generate professional review responses.
 */

/**
 * Generate an AI response to a customer review.
 * @param {object} options
 * @param {string} options.businessName - Name of the business
 * @param {string} options.reviewAuthor - Reviewer's name
 * @param {number} options.rating - Star rating (1-5)
 * @param {string} options.reviewText - The review text
 * @param {string} options.businessCategory - Type of business
 * @param {string} options.apiKey - Anthropic API key
 * @returns {Promise<string>} Generated response text
 */
export async function generateReviewResponse({
  businessName,
  reviewAuthor,
  rating,
  reviewText,
  businessCategory,
  apiKey,
}) {
  if (!apiKey) {
    return generateFallbackResponse({ businessName, reviewAuthor, rating, reviewText });
  }

  const isPositive = rating >= 4;
  const isNeutral = rating === 3;
  const isNegative = rating <= 2;

  const systemPrompt = `You are a professional review response writer for a local ${businessCategory || 'business'} called "${businessName}". Write responses that are:
- Warm and genuine (not corporate or templated)
- Brief (2-4 sentences max)
- Mention the reviewer by first name
- Thank them for their feedback
${isPositive ? '- Express genuine gratitude and invite them back' : ''}
${isNeutral ? '- Acknowledge their feedback and ask how to improve' : ''}
${isNegative ? '- Apologize sincerely, take responsibility, offer to make it right offline (ask them to call or email)' : ''}
- NEVER be defensive or dismissive
- NEVER offer discounts or freebies in the response (that incentivizes negative reviews)
- Use a conversational tone appropriate for a local small business`;

  const userPrompt = `Write a response to this ${rating}-star review:

Reviewer: ${reviewAuthor}
Rating: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
Review: "${reviewText}"

Respond as the business owner.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    console.error('Anthropic API error, falling back to templates');
    return generateFallbackResponse({ businessName, reviewAuthor, rating, reviewText });
  }

  const data = await response.json();
  return data.content?.[0]?.text || generateFallbackResponse({ businessName, reviewAuthor, rating, reviewText });
}

/**
 * Fallback response generator when AI is not available.
 * Uses simple templates based on rating.
 */
function generateFallbackResponse({ businessName, reviewAuthor, rating }) {
  const firstName = reviewAuthor?.split(' ')[0] || 'there';

  if (rating >= 4) {
    const positiveResponses = [
      `Thank you so much, ${firstName}! We're thrilled to hear about your great experience. It means a lot to our team at ${businessName}. We look forward to seeing you again!`,
      `${firstName}, thank you for the wonderful review! Our team works hard to deliver the best experience, and your kind words make it all worthwhile. See you next time!`,
      `We really appreciate your feedback, ${firstName}! Happy to hear everything went well. Thanks for choosing ${businessName} — we're here whenever you need us.`,
    ];
    return positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
  }

  if (rating === 3) {
    return `Thank you for your honest feedback, ${firstName}. We appreciate you taking the time to share your experience with ${businessName}. We'd love to know how we can do better — please don't hesitate to reach out to us directly.`;
  }

  // Negative (1-2 stars)
  return `${firstName}, we're sorry your experience with ${businessName} didn't meet expectations. We take all feedback seriously and would like the opportunity to make this right. Please contact us directly so we can address your concerns.`;
}

/**
 * Batch-generate responses for multiple reviews.
 * @param {object[]} reviews - Array of review objects
 * @param {object} config - { businessName, businessCategory, apiKey }
 * @returns {Promise<object[]>} Reviews with generated responses
 */
export async function batchGenerateResponses(reviews, config) {
  const results = [];

  for (const review of reviews) {
    const response = await generateReviewResponse({
      businessName: config.businessName,
      reviewAuthor: review.author,
      rating: review.rating,
      reviewText: review.text,
      businessCategory: config.businessCategory,
      apiKey: config.apiKey,
    });

    results.push({
      ...review,
      generatedResponse: response,
      status: 'draft',
    });

    // Rate limit: 1 request per 500ms to be safe with Haiku
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}
