/**
 * AI Service — Claude API integration.
 * Shared by all modules that need LLM capabilities.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Generate text using Claude.
 * @param {object} options
 * @param {string} options.system - System prompt
 * @param {string} options.prompt - User prompt
 * @param {string} [options.model] - Model ID (default: claude-haiku-4-5-20251001)
 * @param {number} [options.maxTokens] - Max output tokens (default: 256)
 * @returns {Promise<string>} Generated text
 */
export async function generate({ system, prompt, model, maxTokens }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens || 256,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new AiServiceError(`Claude API error: ${response.status}`, err);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

/**
 * Generate a review response.
 * @param {object} params
 * @param {string} params.businessName
 * @param {string} params.businessCategory
 * @param {string} params.reviewAuthor
 * @param {number} params.rating
 * @param {string} params.reviewText
 * @returns {Promise<string>}
 */
export async function generateReviewResponse(params) {
  const { businessName, businessCategory, reviewAuthor, rating, reviewText } = params;

  const isPositive = rating >= 4;
  const isNegative = rating <= 2;

  return generate({
    system: `You are a review response writer for "${businessName}" (${businessCategory || 'local business'}). Write warm, genuine, brief (2-4 sentences) responses. Mention reviewer by first name. ${isPositive ? 'Express gratitude, invite them back.' : ''} ${isNegative ? 'Apologize sincerely, offer to resolve offline.' : ''} Never be defensive. Never offer discounts.`,
    prompt: `Respond to this ${rating}-star review:\nReviewer: ${reviewAuthor}\nReview: "${reviewText}"`,
    maxTokens: 200,
  });
}

/**
 * Generate a Google Business Post.
 * @param {object} params
 * @param {string} params.businessName
 * @param {string} params.businessCategory
 * @param {string} params.postType - 'update', 'offer', 'event'
 * @param {string} [params.context] - Additional context
 * @returns {Promise<string>}
 */
export async function generateGooglePost(params) {
  const { businessName, businessCategory, postType, context } = params;

  return generate({
    system: `You write Google Business Posts for "${businessName}" (${businessCategory}). Posts must be under 1500 characters, engaging, and end with a call to action. Write in first person as the business.`,
    prompt: `Write a Google Business ${postType} post.${context ? ` Context: ${context}` : ''}\n\nMake it natural and engaging, not salesy.`,
    maxTokens: 400,
  });
}

/**
 * Generate audit recommendations in natural language.
 * @param {object} auditResult - From the audit engine
 * @returns {Promise<string>}
 */
export async function generateAuditSummary(auditResult) {
  return generate({
    system: 'You explain Google Business Profile audit results to non-technical business owners. Be direct, actionable, and encouraging. Use simple language.',
    prompt: `Summarize this audit for a business owner:\n\nBusiness: ${auditResult.businessName}\nOverall Score: ${auditResult.overallScore}/100 (${auditResult.grade})\n\nTop issues:\n${auditResult.recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r.dimension}: ${r.action}`).join('\n')}\n\nWrite a 3-4 sentence summary that explains what's wrong and what to do first.`,
    maxTokens: 200,
  });
}

class AiServiceError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'AiServiceError';
    this.details = details;
  }
}

export { AiServiceError };
