const KEY = () => { let k = localStorage.getItem('nexusKey');
  if (!k) { k = prompt('NEXUS key'); if (k) localStorage.setItem('nexusKey', k); } return k; };
const api = (fn, opt = {}) => fetch('/api/' + fn, { ...opt,
  headers: { 'Content-Type': 'application/json', 'x-nexus-key': KEY() } }).then(r => r.json());

let numbers = [], device = null, activeCall = null;

async function loadNumbers() {
  const r = await api('nexus-numbers', { method: 'POST', body: JSON.stringify({ action: 'list' }) });
  numbers = Array.isArray(r) ? r : [];
  const s = document.getElementById('fromSel'), cur = s.value;
  s.innerHTML = '<option value="">Calling from: phone default</option>' +
    numbers.map(n => `<option value="${n.number}">${n.number}</option>`).join('');
  s.value = cur;
}
async function buyNumber() {
  const areaCode = prompt('Area code (e.g. 541)'); if (!areaCode) return;
  const r = await api('nexus-numbers', { method: 'POST', body: JSON.stringify({ action: 'buy', areaCode }) });
  addSystemBubble(r.number ? 'New number ' + r.number : (r.error || 'Could not buy'));
  loadNumbers();
}
async function releaseNumber() {
  const n = numbers.find(x => x.number === document.getElementById('fromSel').value);
  if (!n || !confirm('Release ' + n.number + '? This cannot be undone.')) return;
  await api('nexus-numbers', { method: 'POST', body: JSON.stringify({ action: 'release', sid: n.sid }) });
  loadNumbers();
}
async function getDevice() {
  if (device) return device;
  const { token } = await api('nexus-token');
  device = new Twilio.Device(token, { codecPreferences: ['opus', 'pcmu'] });
  device.on('incoming', call => {
    if (confirm('Incoming call from ' + call.parameters.From)) { activeCall = call; call.accept(); }
    else call.reject();
  });
  await device.register();
  return device;
}
async function voiceCall(to, from) {
  const st = document.getElementById('dialStatus'), btn = document.getElementById('callBtn');
  if (activeCall) { activeCall.disconnect(); return; }
  st.textContent = 'CALLING ' + to + '...';
  const d = await getDevice();
  activeCall = await d.connect({ params: { To: to, CallerId: from } });
  btn.textContent = '📵 END CALL'; btn.classList.add('active-call');
  activeCall.on('accept', () => st.textContent = 'CONNECTED · ' + to);
  activeCall.on('disconnect', () => { activeCall = null; st.textContent = 'CALL ENDED';
    btn.textContent = '📞 CALL'; btn.classList.remove('active-call'); });
}

// Overrides the page's original functions (this file loads last)
async function initiateCall() {
  if (!dialStr) return;
  const clean = dialStr.replace(/[^+\d]/g, '');
  const from = document.getElementById('fromSel').value;
  if (!from || clean.length <= 3) return legacyCall();   // 911/988/211 use the real dialer
  const e164 = clean.startsWith('+') ? clean : (clean.length === 10 ? '+1' + clean : '+' + clean);
  try { await voiceCall(e164, from); } catch (e) { addSystemBubble('Call failed: ' + e.message); }
}
function sendSMS() {
  const to = document.getElementById('smsTo').value.trim();
  const msg = document.getElementById('composeInput').value.trim();
  if (!msg) return;
  addBubble(msg.replace(/</g, '&lt;'), 'out');
  document.getElementById('composeInput').value = '';
  api('nexus-sms', { method: 'POST', body: JSON.stringify({
    to, message: msg, from: document.getElementById('fromSel').value }) })
    .then(d => addSystemBubble(d.sid ? 'Delivered · SID: ' + d.sid.substring(0, 12) + '...' : (d.error || 'Queued for delivery.')))
    .catch(() => addSystemBubble('Message queued (offline mode).'));
}

// Inbox + code copy
const seen = new Set();
async function pollInbox() {
  const n = document.getElementById('fromSel').value; if (!n) return;
  const msgs = await api('nexus-inbox?number=' + encodeURIComponent(n));
  (Array.isArray(msgs) ? msgs : []).reverse().forEach(m => {
    if (seen.has(m.sid)) return; seen.add(m.sid);
    const code = (m.body.match(/\b\d{4,8}\b/) || [])[0];
    addBubble('<b>' + m.from + '</b><br>' + m.body.replace(/</g, '&lt;') +
      (code ? '<br><button class="ca-btn" style="opacity:1" onclick="navigator.clipboard.writeText(\'' + code + '\')">📋 Copy ' + code + '</button>' : ''), 'in');
  });
}
loadNumbers().catch(() => {}); setInterval(() => pollInbox().catch(() => {}), 10000);
