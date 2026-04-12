/**
 * NEXUS SMS Inbound Webhook
 * Twilio calls this URL when a message is received on your number.
 *
 * Configure in Twilio Console → Phone Numbers → Manage → Active Numbers
 *   SMS Webhook (POST): https://kaneonexus.net/.netlify/functions/nexus-sms-inbound
 *
 * This handler simply returns an empty TwiML response (no auto-reply).
 * Messages are retrieved by the frontend polling /.netlify/functions/nexus-sms?action=receive
 */
exports.handler = async function(event) {
  if (event.httpMethod === 'GET') {
    return { statusCode: 200, headers: { 'Content-Type': 'text/plain' }, body: 'NEXUS SMS Inbound Webhook Active' };
  }

  // Twilio sends POST with application/x-www-form-urlencoded
  // Return empty TwiML so Twilio knows we received it and won't retry
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml' },
    body: '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
  };
};
