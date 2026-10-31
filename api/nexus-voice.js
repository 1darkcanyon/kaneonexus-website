const { twilio, client } = require('./_lib');
module.exports = async (req, res) => {
  const { To, CallerId } = req.body || {};
  const owned = await client.incomingPhoneNumbers.list({ phoneNumber: CallerId, limit: 1 });
  const r = new twilio.twiml.VoiceResponse();
  if (!owned.length) r.say('That caller I D is not on this account.');
  else r.dial({ callerId: CallerId }, To);
  res.setHeader('Content-Type', 'text/xml').send(r.toString());
};
