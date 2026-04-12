/**
 * NEXUS SMS Function
 * Handles outbound SMS via Twilio and safe contact form submissions.
 *
 * Environment variables required:
 *   TWILIO_ACCOUNT_SID   — Twilio account SID
 *   TWILIO_AUTH_TOKEN    — Twilio auth token
 *   TWILIO_FROM_NUMBER   — Your Twilio phone number (E.164 format, e.g. +15550001234)
 *   NEXUS_NOTIFY_NUMBER  — Your personal number to receive safe-contact alerts
 */

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { type, to, message, urgency, location, anonymous, name, contact, ref } = body;

  // ── SAFE CONTACT FORM SUBMISSION ──
  if (type !== 'sms') {
    return handleSafeContact({ type, urgency, message, location, anonymous, name, contact, ref, headers });
  }

  // ── OUTBOUND SMS ──
  if (!to || !message) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing to or message' }) };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    // Dev mode — return a mock successful response so the UI works
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sid: 'SM_DEV_' + Date.now(),
        status: 'queued',
        to,
        body: message,
        dev: true,
      }),
    };
  }

  const toNumber = to.replace(/[^+\d]/g, '');

  const params = new URLSearchParams({
    To:   toNumber,
    From: fromNumber,
    Body: message,
  });

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: params.toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.message || 'Twilio error', code: data.code }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sid: data.sid, status: data.status, to: data.to }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'SMS delivery failed', detail: err.message }),
    };
  }
};

// ── SAFE CONTACT HANDLER ──
async function handleSafeContact({ type, urgency, message, location, anonymous, name, contact, ref, headers }) {
  const accountSid   = process.env.TWILIO_ACCOUNT_SID;
  const authToken    = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber   = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER;
  const notifyNumber = process.env.NEXUS_NOTIFY_NUMBER;

  const alertBody = [
    `🛡️ NEXUS SAFE CONTACT · ${ref || 'NO-REF'}`,
    `TYPE: ${type?.toUpperCase()}`,
    `URGENCY: ${urgency?.toUpperCase()}`,
    `FROM: ${anonymous ? 'ANONYMOUS' : (name || 'Unknown')}`,
    location ? `LOCATION: ${location}` : null,
    contact  ? `CONTACT: ${contact}`   : null,
    `MSG: ${message}`,
  ].filter(Boolean).join('\n');

  if (!accountSid || !authToken || !fromNumber || !notifyNumber) {
    // Dev mode — log and acknowledge
    console.log('[NEXUS SAFE CONTACT]', alertBody);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, ref, dev: true }),
    };
  }

  const params = new URLSearchParams({
    To:   notifyNumber,
    From: fromNumber,
    Body: alertBody,
  });

  try {
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: params.toString(),
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, ref }),
    };
  } catch (err) {
    return {
      statusCode: 200, // still ack the user — don't surface server errors on safe contact form
      headers,
      body: JSON.stringify({ ok: true, ref, warn: 'Notification delivery issue' }),
    };
  }
}
