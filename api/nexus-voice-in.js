const { twilio } = require('./_lib');
module.exports = async (req, res) => {
  const r = new twilio.twiml.VoiceResponse();
  r.dial().client('nexus-user');
  res.setHeader('Content-Type', 'text/xml').send(r.toString());
};
