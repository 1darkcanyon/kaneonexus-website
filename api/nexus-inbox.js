const { client, authed } = require('./_lib');
module.exports = async (req, res) => {
  if (!authed(req)) return res.status(401).json({});
  const m = await client.messages.list({ to: req.query.number, limit: 20 });
  res.json(m.map(x => ({ sid: x.sid, from: x.from, body: x.body, date: x.dateSent })));
};
