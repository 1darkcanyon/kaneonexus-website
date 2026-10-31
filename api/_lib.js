const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const authed = (req) => req.headers['x-nexus-key'] === process.env.NEXUS_KEY;
module.exports = { twilio, client, authed };
