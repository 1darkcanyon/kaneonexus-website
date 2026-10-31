const { client, authed } = require('./_lib');
module.exports = async (req, res) => {
  if (!authed(req)) return res.status(401).json({});
  const { to, message, from } = req.body || {};
  try {
    const m = await client.messages.create({
      to, body: message, from: from || process.env.TWILIO_DEFAULT_NUMBER });
    res.json({ sid: m.sid });
  } catch (e) { res.status(400).json({ error: e.message }); }
};
