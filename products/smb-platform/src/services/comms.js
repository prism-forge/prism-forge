/**
 * Communications Service — Twilio SMS + future email.
 * Unified interface for sending messages across channels.
 */

const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01/Accounts';

/**
 * Send an SMS via Twilio REST API.
 * @param {string} to - Recipient (E.164 format)
 * @param {string} body - Message text
 * @param {object} [options] - { statusCallback }
 * @returns {Promise<object>} { messageSid, status }
 */
export async function sendSms(to, body, options = {}) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    throw new CommsError('Twilio not configured');
  }

  const params = new URLSearchParams({ To: to, From: from, Body: body });
  if (options.statusCallback) params.append('StatusCallback', options.statusCallback);

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const response = await fetch(`${TWILIO_API_BASE}/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new CommsError(`Twilio error: ${data.message || response.status}`, data.code);
  }

  return { messageSid: data.sid, status: data.status };
}

/**
 * Send an email via SendGrid.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 * @param {object} [options] - { from, replyTo }
 * @returns {Promise<object>}
 */
export async function sendEmail(to, subject, html, options = {}) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = options.from || process.env.FROM_EMAIL || 'hello@localboost.app';

  if (!apiKey) {
    throw new CommsError('SendGrid not configured');
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new CommsError(`SendGrid error: ${response.status} ${err}`);
  }

  return { status: 'sent', to };
}

/**
 * Format phone number to E.164 (US).
 */
export function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

/**
 * Validate phone number.
 */
export function isValidPhone(phone) {
  return /^\+\d{10,15}$/.test(formatPhone(phone));
}

class CommsError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'CommsError';
    this.code = code;
  }
}

export { CommsError };
