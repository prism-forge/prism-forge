/**
 * Review request message templates.
 * Variables: {businessName}, {customerName}, {reviewUrl}, {serviceName}
 */

export const TEMPLATES = {
  // Initial review request — sent same day or day after service
  initial_friendly: {
    id: 'initial_friendly',
    name: 'Friendly Initial Request',
    channel: 'sms',
    subject: null,
    body: `Hi {customerName}! Thanks for choosing {businessName}. We'd love your feedback — it really helps us out. Could you take 30 seconds to leave us a Google review?\n\n{reviewUrl}\n\nThank you! 🙏`,
    timing: 'same_day',
  },

  initial_professional: {
    id: 'initial_professional',
    name: 'Professional Initial Request',
    channel: 'sms',
    subject: null,
    body: `Hi {customerName}, thank you for your recent visit to {businessName}. Your feedback helps us serve you better. If you have a moment, we'd appreciate a Google review:\n\n{reviewUrl}\n\nThank you for your business.`,
    timing: 'same_day',
  },

  initial_service: {
    id: 'initial_service',
    name: 'Service-Specific Request',
    channel: 'sms',
    subject: null,
    body: `Hi {customerName}! We hope your {serviceName} with {businessName} went great. A quick Google review would mean the world to us:\n\n{reviewUrl}\n\nThanks!`,
    timing: 'same_day',
  },

  // Follow-up — sent 3 days after initial if no review detected
  followup_gentle: {
    id: 'followup_gentle',
    name: 'Gentle Follow-Up',
    channel: 'sms',
    subject: null,
    body: `Hi {customerName}, just a quick reminder from {businessName} — if you have a moment, we'd really appreciate your Google review. Every review helps local businesses like ours!\n\n{reviewUrl}`,
    timing: 'followup',
  },

  followup_impact: {
    id: 'followup_impact',
    name: 'Impact-Focused Follow-Up',
    channel: 'sms',
    subject: null,
    body: `Hi {customerName}! Did you know that reviews help local businesses get found by new customers? If you had a good experience with {businessName}, a quick Google review would really help:\n\n{reviewUrl}\n\nThank you!`,
    timing: 'followup',
  },

  // Email templates
  email_initial: {
    id: 'email_initial',
    name: 'Email Initial Request',
    channel: 'email',
    subject: 'How was your experience with {businessName}?',
    body: `Hi {customerName},

Thank you for choosing {businessName}! We hope everything went well.

We'd love to hear about your experience. A Google review takes just 30 seconds and helps other customers find us:

{reviewUrl}

Your feedback — whether it's a quick star rating or a detailed review — genuinely helps our small business grow.

Thank you!
The {businessName} Team`,
    timing: 'same_day',
  },

  email_followup: {
    id: 'email_followup',
    name: 'Email Follow-Up',
    channel: 'email',
    subject: 'Quick reminder: Share your experience with {businessName}',
    body: `Hi {customerName},

We sent a note a few days ago asking about your experience with {businessName}. If you haven't had a chance yet, we'd still love your feedback:

{reviewUrl}

Every review helps local businesses like ours get found by new customers. It only takes 30 seconds!

Thanks again for your business.
The {businessName} Team`,
    timing: 'followup',
  },
};

/**
 * Render a template with variables.
 * @param {string} templateId - Template ID from TEMPLATES
 * @param {object} vars - Variables to substitute
 * @returns {object} Rendered template { subject, body, channel }
 */
export function renderTemplate(templateId, vars) {
  const template = TEMPLATES[templateId];
  if (!template) throw new Error(`Template not found: ${templateId}`);

  const render = (text) => {
    if (!text) return null;
    return Object.entries(vars).reduce(
      (result, [key, value]) => result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || ''),
      text
    );
  };

  return {
    id: template.id,
    channel: template.channel,
    subject: render(template.subject),
    body: render(template.body),
    timing: template.timing,
  };
}

/**
 * Generate Google review URL from Place ID.
 * @param {string} placeId - Google Place ID
 * @returns {string} Direct Google review URL
 */
export function generateReviewUrl(placeId) {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}

/**
 * List available templates.
 * @param {string} [channel] - Filter by channel ('sms' or 'email')
 * @param {string} [timing] - Filter by timing ('same_day' or 'followup')
 * @returns {object[]} Matching templates
 */
export function listTemplates(channel, timing) {
  return Object.values(TEMPLATES).filter(t => {
    if (channel && t.channel !== channel) return false;
    if (timing && t.timing !== timing) return false;
    return true;
  });
}
