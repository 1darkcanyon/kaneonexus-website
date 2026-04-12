/**
 * NEXUS SMS Function
 * Handles: outbound SMS, receive polling, number search/provision, safe contact.
 *
 * Environment variables:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER   — primary sending number (E.164, e.g. +15550001234)
 *   TWILIO_FROM_NUMBER    — legacy fallback alias for TWILIO_PHONE_NUMBER
 *   NEXUS_NOTIFY_NUMBER   — personal number for safe-contact alerts
 */

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const accountSid  = process.env.TWILIO_ACCOUNT_SID;
  const authToken   = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber  = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER || '';

  const twilioBase  = accountSid ? `https://api.twilio.com/2010-04-01/Accounts/${accountSid}` : '';
  const twilioAuth  = () => 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const devMode     = !accountSid || !authToken;

  // ── GET REQUESTS ──────────────────────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    const qs     = event.queryStringParameters || {};
    const action = qs.action;

    // status — return the configured sending number (safe to expose)
    if (action === 'status') {
      return {
        statusCode: 200, headers,
        body: JSON.stringify({ from_number: fromNumber || null, dev: devMode }),
      };
    }

    if (devMode) {
      // Return useful dev stubs so the UI works without creds
      if (action === 'receive')        return { statusCode: 200, headers, body: JSON.stringify({ messages: [] }) };
      if (action === 'list_numbers')   return { statusCode: 200, headers, body: JSON.stringify({ numbers: [] }) };
      if (action === 'search_numbers') return { statusCode: 200, headers, body: JSON.stringify({ numbers: [] }) };
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };
    }

    // receive — list recent messages (inbound + outbound) for a conversation
    if (action === 'receive') {
      const limit = Math.min(parseInt(qs.limit || '50', 10), 200);
      try {
        const r    = await fetch(`${twilioBase}/Messages.json?PageSize=${limit}`, {
          headers: { Authorization: twilioAuth() },
        });
        const data = await r.json();
        const msgs = (data.messages || []).map(m => ({
          sid:       m.sid,
          from:      m.from,
          to:        m.to,
          body:      m.body,
          direction: m.direction,   // 'inbound' | 'outbound-api' | 'outbound-reply'
          status:    m.status,
          date:      m.date_sent || m.date_created,
          date_ms:   new Date(m.date_sent || m.date_created).getTime(),
        }));
        return { statusCode: 200, headers, body: JSON.stringify({ messages: msgs }) };
      } catch (err) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
      }
    }

    // list_numbers — owned Twilio numbers on this account
    if (action === 'list_numbers') {
      try {
        const r    = await fetch(`${twilioBase}/IncomingPhoneNumbers.json?PageSize=20`, {
          headers: { Authorization: twilioAuth() },
        });
        const data = await r.json();
        const nums = (data.incoming_phone_numbers || []).map(n => ({
          sid:          n.sid,
          phone_number: n.phone_number,
          friendly_name: n.friendly_name,
          sms_url:      n.sms_url,
          capabilities: n.capabilities,
        }));
        return { statusCode: 200, headers, body: JSON.stringify({ numbers: nums }) };
      } catch (err) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
      }
    }

    // search_numbers — available phone numbers to provision
    if (action === 'search_numbers') {
      const country   = qs.country   || 'US';
      const areaCode  = qs.area_code || '';
      const contains  = qs.contains  || '';
      const params    = new URLSearchParams({ PageSize: '10', SmsEnabled: 'true', VoiceEnabled: 'true' });
      if (areaCode) params.set('AreaCode', areaCode);
      if (contains) params.set('Contains', contains);
      try {
        const r    = await fetch(`${twilioBase}/AvailablePhoneNumbers/${country}/Local.json?${params}`, {
          headers: { Authorization: twilioAuth() },
        });
        const data = await r.json();
        const nums = (data.available_phone_numbers || []).map(n => ({
          phone_number:  n.phone_number,
          friendly_name: n.friendly_name,
          region:        n.region,
          locality:      n.locality,
          postal_code:   n.postal_code,
          iso_country:   n.iso_country,
        }));
        return { statusCode: 200, headers, body: JSON.stringify({ numbers: nums }) };
      } catch (err) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
      }
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };
  }

  // ── POST REQUESTS ─────────────────────────────────────────────────────────
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { type, to, message, from, urgency, location, anonymous, name, contact, ref, phone_number } = body;

  // ── PROVISION A NUMBER ────────────────────────────────────────────────────
  if (type === 'provision') {
    if (!phone_number) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing phone_number' }) };
    }
    if (devMode) {
      return { statusCode: 200, headers, body: JSON.stringify({ phone_number, sid: 'PN_DEV_' + Date.now(), dev: true }) };
    }
    try {
      const params = new URLSearchParams({
        PhoneNumber: phone_number,
        SmsUrl:      'https://kaneonexus.net/.netlify/functions/nexus-sms-inbound',
        VoiceUrl:    'https://kaneonexus.net/.netlify/functions/nexus-sms-inbound',
      });
      const r    = await fetch(`${twilioBase}/IncomingPhoneNumbers.json`, {
        method:  'POST',
        headers: { Authorization: twilioAuth(), 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    params.toString(),
      });
      const data = await r.json();
      if (!r.ok) {
        return { statusCode: r.status, headers, body: JSON.stringify({ error: data.message || 'Twilio error', code: data.code }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({
        sid:          data.sid,
        phone_number: data.phone_number,
        friendly_name: data.friendly_name,
      })};
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
  }

  // ── SAFE CONTACT FORM ─────────────────────────────────────────────────────
  if (type !== 'sms') {
    return handleSafeContact({ type, urgency, message, location, anonymous, name, contact, ref, headers });
  }

  // ── OUTBOUND SMS ──────────────────────────────────────────────────────────
  if (!to || !message) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing to or message' }) };
  }

  // Respect optional `from` override (user's chosen active number)
  const sendFrom = (from && from.replace(/[^+\d]/g, '')) || fromNumber;

  if (!accountSid || !authToken || !sendFrom) {
    return {
      statusCode: 200, headers,
      body: JSON.stringify({ sid: 'SM_DEV_' + Date.now(), status: 'queued', to, body: message, dev: true }),
    };
  }

  const toClean = to.replace(/[^+\d]/g, '');
  const smsParams = new URLSearchParams({ To: toClean, From: sendFrom, Body: message });

  try {
    const r    = await fetch(`${twilioBase}/Messages.json`, {
      method:  'POST',
      headers: { Authorization: twilioAuth(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    smsParams.toString(),
    });
    const data = await r.json();
    if (!r.ok) {
      return { statusCode: r.status, headers, body: JSON.stringify({ error: data.message || 'Twilio error', code: data.code }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ sid: data.sid, status: data.status, to: data.to }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'SMS delivery failed', detail: err.message }) };
  }
};

// ── SAFE CONTACT HANDLER ──────────────────────────────────────────────────────
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
    console.log('[NEXUS SAFE CONTACT]', alertBody);
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ref, dev: true }) };
  }

  const params = new URLSearchParams({ To: notifyNumber, From: fromNumber, Body: alertBody });

  try {
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method:  'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: params.toString(),
      }
    );
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ref }) };
  } catch (err) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ref, warn: 'Notification delivery issue' }) };
  }
}
