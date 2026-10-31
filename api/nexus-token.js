const { twilio, authed } = require('./_lib');
const { AccessToken } = twilio.jwt;
module.exports = async (req, res) => {
  if (!authed(req)) return res.status(401).json({});
  const t = new AccessToken(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET, { identity: 'nexus-user' });
  t.addGrant(new AccessToken.VoiceGrant({
    outgoingApplicationSid: process.env.TWIML_APP_SID, incomingAllow: true }));
  res.json({ token: t.toJwt() });
};
