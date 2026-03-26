/**
 * SMS Sender using Twilio API.
 * Sends review request messages and tracks delivery status.
 *
 * Uses Twilio REST API directly (no SDK) to minimize dependencies.
 */

/**
 * Send an SMS via Twilio.
 * @param {object} options
 * @param {string} options.to - Recipient phone number (E.164 format)
 * @param {string} options.body - Message text
 * @param {string} options.from - Twilio phone number
 * @param {string} options.accountSid - Twilio Account SID
 * @param {string} options.authToken - Twilio Auth Token
 * @param {string} [options.statusCallback] - Webhook URL for delivery status
 * @returns {Promise<object>} Twilio message response
 */
export async function sendSms({ to, body, from, accountSid, authToken, statusCallback }) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const params = new URLSearchParams({
    To: to,
    From: from,
    Body: body,
  });

  if (statusCallback) {
    params.append('StatusCallback', statusCallback);
  }

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new TwilioError(
      data.message || `Twilio API error: ${response.status}`,
      data.code,
      response.status
    );
  }

  return {
    messageSid: data.sid,
    status: data.status,
    to: data.to,
    from: data.from,
    dateCreated: data.date_created,
  };
}

/**
 * Format a phone number to E.164 (US numbers).
 * @param {string} phone - Phone number in any common format
 * @returns {string} E.164 formatted number
 */
export function formatPhoneNumber(phone) {
  // Strip all non-digits
  const digits = phone.replace(/\D/g, '');

  // Handle US numbers
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.startsWith('+')) return phone;

  // Return as-is if not clearly US
  return `+${digits}`;
}

/**
 * Validate a phone number is likely valid for SMS.
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const formatted = formatPhoneNumber(phone);
  // Must start with + and have 10+ digits
  return /^\+\d{10,15}$/.test(formatted);
}

class TwilioError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.name = 'TwilioError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export { TwilioError };
