const { client, authed } = require('./_lib');
module.exports = async (req, res) => {
  if (!authed(req)) return res.status(401).json({});
  const { action, areaCode, sid } = req.body || {};
  const base = `https://${req.headers.host}/api/`;
  if (action === 'list') {
    const l = await client.incomingPhoneNumbers.list({ limit: 50 });
    return res.json(l.map(n => ({ number: n.phoneNumber, sid: n.sid })));
  }
  if (action === 'buy') {
    const [n] = await client.availablePhoneNumbers('US').local
      .list({ areaCode, smsEnabled: true, voiceEnabled: true, limit: 1 });
    if (!n) return res.json({ error: 'No numbers in that area code' });
    const b = await client.incomingPhoneNumbers.create({
      phoneNumber: n.phoneNumber, voiceUrl: base + 'nexus-voice-in' });
    return res.json({ number: b.phoneNumber, sid: b.sid });
  }
  if (action === 'release') {
    await client.incomingPhoneNumbers(sid).remove();
    return res.json({ released: true });
  }
  res.json({ error: 'bad action' });
};
