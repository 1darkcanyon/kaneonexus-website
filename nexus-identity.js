// nexus-identity.js — NEXUS Sovereign Identity System
// Shared across all NEXUS modules.
// Profile data is stored entirely on the user's own device (localStorage).
// Nothing is sent to or stored on any server.

(function (global) {
  'use strict';

  const SKEY = 'nexus_sv4';   // localStorage — full profile
  const AKEY = 'nexus_auth';  // sessionStorage — "already authenticated this session"

  const INTERESTS = [
    'Sacred Geometry', 'Gold Prospecting', 'Software Dev', 'Music Production',
    'Philosophy', 'Lunar / Astronomy', 'Boomerang Design', 'Mineral Science',
    'Writing / Research', 'Tesla / Free Energy', 'Sovereign Law', 'Dreamwork'
  ];

  const STYLES = [
    { id: 'poetic',   name: 'POETIC & MYSTICAL',  desc: 'Evocative, symbolic, lyrical' },
    { id: 'direct',   name: 'DIRECT & PRECISE',   desc: 'Clear, technical, no-fluff' },
    { id: 'balanced', name: 'BALANCED SOVEREIGN',  desc: 'Blend of depth and precision' }
  ];

  // ── STORAGE ──────────────────────────────────────────────────────────────────
  function loadId() {
    try { return JSON.parse(localStorage.getItem(SKEY)); } catch { return null; }
  }
  function saveId(d) { localStorage.setItem(SKEY, JSON.stringify(d)); }
  function isAuthed() { return sessionStorage.getItem(AKEY) === '1'; }
  function markAuthed() { sessionStorage.setItem(AKEY, '1'); }

  // ── CRYPTO (simple non-reversible hash — for local key verification only) ───
  function hash(s) {
    let h = 0x9e3779b9;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x85ebca77) ^ (h >>> 13);
    return (Math.abs(h) >>> 0).toString(16).padStart(8, '0');
  }

  // ── ZODIAC ───────────────────────────────────────────────────────────────────
  function getZodiac(ds) {
    if (!ds) return null;
    const d = new Date(ds), m = d.getMonth() + 1, day = d.getDate();
    if ((m===3&&day>=21)||(m===4&&day<=19)) return 'Aries ♈';
    if ((m===4&&day>=20)||(m===5&&day<=20)) return 'Taurus ♉';
    if ((m===5&&day>=21)||(m===6&&day<=20)) return 'Gemini ♊';
    if ((m===6&&day>=21)||(m===7&&day<=22)) return 'Cancer ♋';
    if ((m===7&&day>=23)||(m===8&&day<=22)) return 'Leo ♌';
    if ((m===8&&day>=23)||(m===9&&day<=22)) return 'Virgo ♍';
    if ((m===9&&day>=23)||(m===10&&day<=22)) return 'Libra ♎';
    if ((m===10&&day>=23)||(m===11&&day<=21)) return 'Scorpio ♏';
    if ((m===11&&day>=22)||(m===12&&day<=21)) return 'Sagittarius ♐';
    if ((m===12&&day>=22)||(m===1&&day<=19)) return 'Capricorn ♑';
    if ((m===1&&day>=20)||(m===2&&day<=18)) return 'Aquarius ♒';
    return 'Pisces ♓';
  }

  // ── IDENTITY OBJECT ──────────────────────────────────────────────────────────
  function mkId(d) {
    return {
      name: d.name, keyHash: d.keyHash,
      title: d.title || '', birthdate: d.birthdate || '',
      location: d.location || '', focus: d.focus || '',
      interests: d.interests || [], style: d.style || 'balanced',
      node: d.node || ('NODE-' + (Math.floor(Math.random() * 900) + 100)),
      created: d.created || Date.now(),
      lastVisit: d.lastVisit || null,
      sessions: d.sessions || 0
    };
  }

  // ── PROFILE CONTEXT (injected into every AI system prompt) ──────────────────
  function buildProfileContext(id) {
    if (!id) return '';
    const lines = ['[SOVEREIGN PROFILE]'];
    if (id.title) lines.push('Title: ' + id.title);
    const sign = getZodiac(id.birthdate);
    if (sign) lines.push('Astrological Sign: ' + sign);
    if (id.location) lines.push('Location: ' + id.location);
    if (id.focus) lines.push('Current Focus: ' + id.focus);
    if (id.interests && id.interests.length) lines.push('Interests: ' + id.interests.join(', '));
    const sm = { poetic: 'Poetic & mystical — evocative, symbolic language', direct: 'Direct & precise — clear, technical, concise', balanced: 'Balanced sovereign — depth blended with precision' };
    if (id.style) lines.push('Response Style: ' + (sm[id.style] || id.style));
    lines.push('[END PROFILE — personalize responses accordingly, use their title/name naturally]');
    return lines.join('\n');
  }

  // ── UI BUILDERS ──────────────────────────────────────────────────────────────
  function buildIG(cid, sel) {
    const g = document.getElementById(cid); if (!g) return; g.innerHTML = '';
    INTERESTS.forEach(function (l) {
      const d = document.createElement('div');
      d.className = 'nxi-int-item' + (sel.indexOf(l) > -1 ? ' sel' : '');
      d.innerHTML = '<div class="nxi-int-pip"></div>' + l;
      d.addEventListener('click', function () { d.classList.toggle('sel'); });
      g.appendChild(d);
    });
  }
  function buildSO(cid, sel) {
    const c = document.getElementById(cid); if (!c) return; c.innerHTML = '';
    STYLES.forEach(function (s) {
      const d = document.createElement('div');
      d.className = 'nxi-style-opt' + (s.id === sel ? ' sel' : '');
      d.dataset.id = s.id;
      d.innerHTML = '<div class="nxi-style-dot"></div><div><div class="nxi-style-name">' + s.name + '</div><div class="nxi-style-desc">' + s.desc + '</div></div>';
      d.addEventListener('click', function () {
        c.querySelectorAll('.nxi-style-opt').forEach(function (e) { e.classList.remove('sel'); });
        d.classList.add('sel');
      });
      c.appendChild(d);
    });
  }
  function getSelInt(cid) {
    return Array.from(document.querySelectorAll('#' + cid + ' .nxi-int-item.sel')).map(function (e) { return e.textContent.trim(); });
  }
  function getSelSO(cid) {
    const s = document.querySelector('#' + cid + ' .nxi-style-opt.sel');
    return s ? s.dataset.id : 'balanced';
  }

  // ── CSS ──────────────────────────────────────────────────────────────────────
  const CSS = [
    '#nxi-login{position:fixed;inset:0;z-index:9000;background:#05080b;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow-y:auto;padding:40px 20px;transition:opacity .5s;font-family:"Rajdhani",sans-serif;}',
    '#nxi-login *{box-sizing:border-box;margin:0;padding:0;}',
    '#nxi-login.fade-out{opacity:0;pointer-events:none;}',
    '#nxi-login.gone{display:none;}',

    '.nxi-orb{width:66px;height:66px;border-radius:50%;flex-shrink:0;margin-bottom:20px;background:radial-gradient(circle at 32% 28%,#ff7030,#b03000 45%,#200800 85%);box-shadow:0 0 40px rgba(200,70,0,.45),0 0 90px rgba(200,70,0,.15);animation:nxiFloat 5s ease-in-out infinite;}',
    '@keyframes nxiFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);box-shadow:0 0 55px rgba(200,70,0,.6),0 0 120px rgba(200,70,0,.22);}}',
    '.nxi-title{font-family:"Orbitron",monospace;font-size:30px;font-weight:900;color:#00c8b4;letter-spacing:10px;margin-bottom:5px;}',
    '.nxi-sub{font-family:"Share Tech Mono",monospace;font-size:10px;color:#2a3e4e;letter-spacing:3.5px;text-transform:uppercase;margin-bottom:28px;}',
    '.nxi-privacy{font-family:"Share Tech Mono",monospace;font-size:8px;color:#1a2e3e;letter-spacing:1.5px;text-align:center;margin-top:6px;margin-bottom:18px;max-width:320px;line-height:1.6;}',
    '.nxi-privacy span{color:#2a5e5a;}',

    '.nxi-step-ind{display:flex;align-items:center;gap:8px;margin-bottom:22px;}',
    '.nxi-step-pip{width:28px;height:3px;background:#0f2535;border-radius:2px;transition:background .3s;}',
    '.nxi-step-pip.active{background:#00c8b4;}',
    '.nxi-step-lbl{font-family:"Share Tech Mono",monospace;font-size:8px;color:#2a3e4e;letter-spacing:2px;}',

    '.nxi-panel{display:none;flex-direction:column;gap:13px;width:320px;}',
    '.nxi-panel.show{display:flex;}',
    '.nxi-panel.wide{width:390px;}',

    '.nxi-field{display:flex;flex-direction:column;gap:5px;}',
    '.nxi-label{font-family:"Share Tech Mono",monospace;font-size:8px;color:#006e64;letter-spacing:3px;text-transform:uppercase;}',
    '.nxi-label span{color:#2a3e4e;font-size:7px;margin-left:4px;letter-spacing:1px;text-transform:none;}',
    '.nxi-input,.nxi-textarea{background:rgba(0,200,180,.04);border:none;border-bottom:1px solid #006e64;color:#c8dce8;font-family:"Share Tech Mono",monospace;font-size:12px;padding:10px 2px;outline:none;width:100%;transition:border-color .25s,background .25s;}',
    '.nxi-input:focus,.nxi-textarea:focus{border-bottom-color:#00c8b4;background:rgba(0,200,180,.07);}',
    '.nxi-input::placeholder,.nxi-textarea::placeholder{color:#2a3e4e;}',
    '.nxi-textarea{resize:none;min-height:52px;line-height:1.4;}',

    '.nxi-2col{display:grid;grid-template-columns:1fr 1fr;gap:12px;}',
    '.nxi-sec-title{font-family:"Orbitron",monospace;font-size:8px;color:#9ab3c4;letter-spacing:3px;text-align:center;padding:4px 0 8px;border-bottom:1px solid #0d1e2c;margin-bottom:2px;}',

    '.nxi-int-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:2px;}',
    '.nxi-int-item{display:flex;align-items:center;gap:6px;padding:5px 8px;border:1px solid #0f2535;cursor:pointer;transition:all .15s;font-family:"Rajdhani",sans-serif;font-size:11px;font-weight:500;color:#607888;border-radius:1px;user-select:none;}',
    '.nxi-int-item:hover{border-color:#006e64;color:#9ab3c4;}',
    '.nxi-int-item.sel{background:rgba(0,200,180,.08);border-color:#006e64;color:#00c8b4;}',
    '.nxi-int-pip{width:6px;height:6px;border-radius:50%;border:1px solid #2a3e4e;flex-shrink:0;transition:all .15s;}',
    '.nxi-int-item.sel .nxi-int-pip{background:#00c8b4;border-color:#00c8b4;}',

    '.nxi-style-opts{display:flex;flex-direction:column;gap:4px;}',
    '.nxi-style-opt{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #0f2535;cursor:pointer;transition:all .15s;border-radius:1px;}',
    '.nxi-style-opt:hover{border-color:#006e64;}',
    '.nxi-style-opt.sel{background:rgba(0,200,180,.08);border-color:#006e64;}',
    '.nxi-style-dot{width:8px;height:8px;border-radius:50%;border:1px solid #2a3e4e;flex-shrink:0;transition:all .15s;}',
    '.nxi-style-opt.sel .nxi-style-dot{background:#00c8b4;border-color:#00c8b4;}',
    '.nxi-style-name{font-family:"Orbitron",monospace;font-size:8px;color:#9ab3c4;letter-spacing:1px;}',
    '.nxi-style-desc{font-family:"Rajdhani",sans-serif;font-size:10px;color:#2a3e4e;}',

    '.nxi-rname{font-family:"Orbitron",monospace;font-size:12px;color:#00c8b4;letter-spacing:2px;text-align:center;padding:8px 0;border-bottom:1px solid #0f2535;margin-bottom:2px;}',
    '.nxi-rtitle{font-family:"Share Tech Mono",monospace;font-size:9px;color:#c8a040;text-align:center;letter-spacing:1.5px;margin-bottom:10px;font-style:italic;}',

    '.nxi-btn{background:transparent;border:1px solid #006e64;color:#00c8b4;font-family:"Orbitron",monospace;font-size:10px;letter-spacing:4px;padding:13px;cursor:pointer;text-transform:uppercase;transition:all .25s;width:100%;}',
    '.nxi-btn:hover{background:rgba(0,200,180,.18);border-color:#00c8b4;box-shadow:0 0 18px rgba(0,200,180,.2);}',
    '.nxi-btn.sec{border-color:#0f2535;color:#2a3e4e;font-size:9px;padding:9px;letter-spacing:2px;}',
    '.nxi-btn.sec:hover{border-color:#2a3e4e;color:#607888;}',
    '.nxi-reset{background:none;border:none;font-family:"Share Tech Mono",monospace;font-size:9px;color:#2a3e4e;cursor:pointer;letter-spacing:2px;text-transform:uppercase;transition:color .2s;text-align:center;width:100%;}',
    '.nxi-reset:hover{color:#607888;}',
    '.nxi-err{font-family:"Share Tech Mono",monospace;font-size:9px;color:#e04040;text-align:center;letter-spacing:1.5px;min-height:13px;margin-top:4px;}',

    // Profile Modal
    '#nxi-modal{position:fixed;inset:0;z-index:9100;display:none;align-items:center;justify-content:center;}',
    '#nxi-modal *{box-sizing:border-box;}',
    '#nxi-modal.open{display:flex;}',
    '.nxi-mo{position:absolute;inset:0;background:rgba(0,0,0,.72);cursor:pointer;}',
    '.nxi-mp{position:relative;z-index:1;background:#070c10;border:1px solid #0f2535;width:500px;max-width:95vw;max-height:88vh;overflow-y:auto;animation:nxiPmIn .22s ease;display:flex;flex-direction:column;}',
    '@keyframes nxiPmIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}',
    '.nxi-mh{padding:15px 20px;border-bottom:1px solid #0d1e2c;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;background:#080e14;}',
    '.nxi-mt{font-family:"Orbitron",monospace;font-size:11px;color:#00c8b4;letter-spacing:3px;}',
    '.nxi-mx{background:none;border:none;color:#2a3e4e;font-size:18px;cursor:pointer;transition:color .2s;line-height:1;}',
    '.nxi-mx:hover{color:#c8dce8;}',
    '.nxi-mb{padding:18px 20px;display:flex;flex-direction:column;gap:13px;}',
    '.nxi-ms{font-family:"Orbitron",monospace;font-size:8px;color:#9ab3c4;letter-spacing:3px;padding:6px 0 5px;border-bottom:1px solid #0d1e2c;margin-bottom:2px;}',
    '.nxi-mf{padding:14px 20px;border-top:1px solid #0d1e2c;display:flex;gap:10px;flex-shrink:0;align-items:center;}',
    '.nxi-msave{flex:1;background:rgba(0,200,180,.08);border:1px solid #006e64;color:#00c8b4;font-family:"Orbitron",monospace;font-size:10px;letter-spacing:3px;padding:11px;cursor:pointer;transition:all .2s;}',
    '.nxi-msave:hover{background:rgba(0,200,180,.18);border-color:#00c8b4;}',
    '.nxi-mcancel{background:transparent;border:1px solid #0f2535;color:#2a3e4e;font-family:"Orbitron",monospace;font-size:10px;letter-spacing:2px;padding:11px 16px;cursor:pointer;transition:all .2s;}',
    '.nxi-mcancel:hover{border-color:#2a3e4e;color:#607888;}',
    '.nxi-mok{font-family:"Share Tech Mono",monospace;font-size:8px;color:#00c8b4;letter-spacing:1.5px;opacity:0;transition:opacity .4s;}',
    '.nxi-mok.show{opacity:1;}',
    '.nxi-mb .nxi-input,.nxi-mb .nxi-textarea{font-size:11px;padding:8px 2px;}',
    '.nxi-mprivacy{font-family:"Share Tech Mono",monospace;font-size:7.5px;color:#1a2e3e;letter-spacing:1px;line-height:1.6;padding:8px 0 2px;}',
    '.nxi-mprivacy span{color:#2a5e5a;}'
  ].join('\n');

  // ── LOGIN HTML ────────────────────────────────────────────────────────────────
  const LOGIN_HTML = '<div id="nxi-login">' +
    '<div class="nxi-orb"></div>' +
    '<div class="nxi-title">NEXUS</div>' +
    '<div class="nxi-sub">Sovereign Core · Identity Protocol</div>' +
    '<div class="nxi-privacy">⬡ <span>Your profile is stored only on this device.</span> Nothing is sent to or saved on any server. You own your data.</div>' +

    '<div class="nxi-step-ind" id="nxi-step-ind" style="display:none">' +
      '<div class="nxi-step-pip active" id="nxi-pip1"></div>' +
      '<div class="nxi-step-pip" id="nxi-pip2"></div>' +
      '<div class="nxi-step-lbl" id="nxi-step-lbl">STEP 1 OF 2 — IDENTITY</div>' +
    '</div>' +

    // Step 1 — new user
    '<div class="nxi-panel show" id="nxi-s1">' +
      '<div class="nxi-field"><div class="nxi-label">Sovereign Identity</div><input id="nxi-name" class="nxi-input" type="text" placeholder="Enter your name" autocomplete="off" spellcheck="false"></div>' +
      '<div class="nxi-field"><div class="nxi-label">Create Sovereign Key <span>(min 4 chars)</span></div><input id="nxi-key" class="nxi-input" type="password" placeholder="Choose a passphrase" autocomplete="off"></div>' +
      '<button class="nxi-btn" id="nxi-s1next">NEXT — BUILD YOUR PROFILE →</button>' +
      '<button class="nxi-btn sec" id="nxi-s1skip">SKIP PROFILE — ENTER CORE</button>' +
    '</div>' +

    // Step 2 — profile
    '<div class="nxi-panel wide" id="nxi-s2">' +
      '<div class="nxi-sec-title">SOVEREIGN PROFILE — ALL FIELDS OPTIONAL</div>' +
      '<div class="nxi-field"><div class="nxi-label">Sovereign Title <span>(e.g. The Obsidian Dreamwalker)</span></div><input id="nxi-sv-title" class="nxi-input" type="text" placeholder="Your title or honorific" autocomplete="off"></div>' +
      '<div class="nxi-2col">' +
        '<div class="nxi-field"><div class="nxi-label">Birth Date</div><input id="nxi-birth" class="nxi-input" type="date"></div>' +
        '<div class="nxi-field"><div class="nxi-label">Location</div><input id="nxi-loc" class="nxi-input" type="text" placeholder="City / Region" autocomplete="off"></div>' +
      '</div>' +
      '<div class="nxi-field"><div class="nxi-label">Current Focus / Intention <span>(what are you building?)</span></div><textarea id="nxi-focus" class="nxi-textarea" placeholder="Describe your current project, research, or intention..."></textarea></div>' +
      '<div class="nxi-field"><div class="nxi-label">Domains of Interest</div><div class="nxi-int-grid" id="nxi-ig-reg"></div></div>' +
      '<div class="nxi-field"><div class="nxi-label">Preferred Response Style</div><div class="nxi-style-opts" id="nxi-so-reg"></div></div>' +
      '<button class="nxi-btn" id="nxi-complete">COMPLETE PROFILE — ENTER THE COUNCIL</button>' +
      '<button class="nxi-btn sec" id="nxi-skipprof">SKIP — ENTER WITHOUT PROFILE</button>' +
    '</div>' +

    // Returning user
    '<div class="nxi-panel" id="nxi-ret">' +
      '<div class="nxi-rname" id="nxi-rname"></div>' +
      '<div class="nxi-rtitle" id="nxi-rtitle"></div>' +
      '<div class="nxi-field"><div class="nxi-label">Sovereign Key</div><input id="nxi-kret" class="nxi-input" type="password" placeholder="Enter your passphrase" autocomplete="off"></div>' +
      '<button class="nxi-btn" id="nxi-auth">ENTER THE COUNCIL</button>' +
      '<button class="nxi-reset" id="nxi-reset-id">Not you? Reset sovereign identity</button>' +
    '</div>' +

    '<div class="nxi-err" id="nxi-err"></div>' +
  '</div>';

  // ── MODAL HTML ────────────────────────────────────────────────────────────────
  const MODAL_HTML = '<div id="nxi-modal">' +
    '<div class="nxi-mo" id="nxi-mo-bg"></div>' +
    '<div class="nxi-mp">' +
      '<div class="nxi-mh"><div class="nxi-mt">SOVEREIGN PROFILE</div><button class="nxi-mx" id="nxi-mx">✕</button></div>' +
      '<div class="nxi-mb">' +
        '<div class="nxi-mprivacy">⬡ <span>All profile data is stored only on your device.</span> Nothing is sent to any server.</div>' +
        '<div class="nxi-ms">IDENTITY</div>' +
        '<div class="nxi-2col">' +
          '<div class="nxi-field"><div class="nxi-label">Name</div><input id="nxi-pm-name" class="nxi-input" type="text" placeholder="Your name" autocomplete="off"></div>' +
          '<div class="nxi-field"><div class="nxi-label">Sovereign Title</div><input id="nxi-pm-title" class="nxi-input" type="text" placeholder="Your honorific or title" autocomplete="off"></div>' +
        '</div>' +
        '<div class="nxi-ms">CONTEXT</div>' +
        '<div class="nxi-2col">' +
          '<div class="nxi-field"><div class="nxi-label">Birth Date</div><input id="nxi-pm-birth" class="nxi-input" type="date"></div>' +
          '<div class="nxi-field"><div class="nxi-label">Location</div><input id="nxi-pm-loc" class="nxi-input" type="text" placeholder="City / Region" autocomplete="off"></div>' +
        '</div>' +
        '<div class="nxi-field"><div class="nxi-label">Current Focus / Intention</div><textarea id="nxi-pm-focus" class="nxi-textarea" placeholder="What are you building, researching, or pursuing?"></textarea></div>' +
        '<div class="nxi-ms">DOMAINS OF INTEREST</div>' +
        '<div class="nxi-int-grid" id="nxi-ig-modal"></div>' +
        '<div class="nxi-ms">PREFERRED RESPONSE STYLE</div>' +
        '<div class="nxi-style-opts" id="nxi-so-modal"></div>' +
        '<div class="nxi-ms">SOVEREIGN KEY</div>' +
        '<div class="nxi-2col">' +
          '<div class="nxi-field"><div class="nxi-label">Current Key <span>(required to save)</span></div><input id="nxi-pm-kcur" class="nxi-input" type="password" placeholder="Current passphrase" autocomplete="off"></div>' +
          '<div class="nxi-field"><div class="nxi-label">New Key <span>(leave blank to keep)</span></div><input id="nxi-pm-knew" class="nxi-input" type="password" placeholder="New passphrase (optional)" autocomplete="off"></div>' +
        '</div>' +
      '</div>' +
      '<div class="nxi-mf">' +
        '<button class="nxi-mcancel" id="nxi-mcancel">CANCEL</button>' +
        '<div class="nxi-mok" id="nxi-mok">✓ PROFILE UPDATED</div>' +
        '<button class="nxi-msave" id="nxi-msave">SAVE CHANGES</button>' +
      '</div>' +
    '</div>' +
  '</div>';

  // ── INTERNALS ─────────────────────────────────────────────────────────────────
  var _regData = {};
  var _onReady = null;
  var _onProfileSaved = null;
  var _initialized = false;

  function showErr(m) {
    var e = document.getElementById('nxi-err'); if (!e) return;
    e.textContent = m; setTimeout(function () { e.textContent = ''; }, 3500);
  }

  function fadeLogin(cb) {
    var ls = document.getElementById('nxi-login');
    ls.classList.add('fade-out');
    setTimeout(function () { ls.classList.add('gone'); cb(); }, 500);
  }

  function s1Next() {
    var name = document.getElementById('nxi-name').value.trim();
    var key  = document.getElementById('nxi-key').value;
    if (!name) return showErr('IDENTITY REQUIRED');
    if (key.length < 4) return showErr('KEY TOO SHORT — MINIMUM 4 CHARACTERS');
    _regData = { name: name, keyHash: hash(key) };
    document.getElementById('nxi-s1').classList.remove('show');
    document.getElementById('nxi-s2').classList.add('show');
    document.getElementById('nxi-pip1').classList.remove('active');
    document.getElementById('nxi-pip2').classList.add('active');
    document.getElementById('nxi-step-lbl').textContent = 'STEP 2 OF 2 — PROFILE';
  }

  function s1Skip() {
    var name = document.getElementById('nxi-name').value.trim();
    var key  = document.getElementById('nxi-key').value;
    if (!name) return showErr('IDENTITY REQUIRED');
    if (key.length < 4) return showErr('KEY TOO SHORT — MINIMUM 4 CHARACTERS');
    var id = mkId({ name: name, keyHash: hash(key) });
    saveId(id); markAuthed();
    fadeLogin(function () { _onReady && _onReady(id, true); });
  }

  function completeReg(skip) {
    var prof = skip ? {} : {
      title:    document.getElementById('nxi-sv-title').value.trim(),
      birthdate:document.getElementById('nxi-birth').value,
      location: document.getElementById('nxi-loc').value.trim(),
      focus:    document.getElementById('nxi-focus').value.trim(),
      interests:getSelInt('nxi-ig-reg'),
      style:    getSelSO('nxi-so-reg')
    };
    var id = mkId(Object.assign({}, _regData, prof));
    saveId(id); markAuthed();
    fadeLogin(function () { _onReady && _onReady(id, true); });
  }

  function authReturn() {
    var id  = loadId();
    var key = document.getElementById('nxi-kret').value;
    if (hash(key) !== id.keyHash) return showErr('KEY MISMATCH — ACCESS DENIED');
    var prev = id.lastVisit;
    id.lastVisit = Date.now();
    id.sessions  = (id.sessions || 0) + 1;
    saveId(id); markAuthed();
    fadeLogin(function () { _onReady && _onReady(Object.assign({}, id, { _prev: prev }), false); });
  }

  function wireEvents() {
    function on(id, ev, fn) { var el = document.getElementById(id); if (el) el[ev] = fn; }
    on('nxi-s1next',   'onclick', s1Next);
    on('nxi-s1skip',   'onclick', s1Skip);
    on('nxi-complete', 'onclick', function () { completeReg(false); });
    on('nxi-skipprof', 'onclick', function () { completeReg(true); });
    on('nxi-auth',     'onclick', authReturn);
    on('nxi-reset-id', 'onclick', function () {
      if (confirm('Erase all sovereign identity and profile data from this device?')) {
        localStorage.removeItem(SKEY);
        sessionStorage.removeItem(AKEY);
        location.reload();
      }
    });
    on('nxi-mo-bg',    'onclick', closeModal);
    on('nxi-mx',       'onclick', closeModal);
    on('nxi-mcancel',  'onclick', closeModal);
    on('nxi-msave',    'onclick', saveModal);

    var nameI = document.getElementById('nxi-name');
    var keyI  = document.getElementById('nxi-key');
    var kret  = document.getElementById('nxi-kret');
    if (nameI) nameI.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var k = document.getElementById('nxi-key'); if (k) k.focus(); } });
    if (keyI)  keyI.addEventListener('keydown',  function (e) { if (e.key === 'Enter') s1Next(); });
    if (kret)  kret.addEventListener('keydown',  function (e) { if (e.key === 'Enter') authReturn(); });
  }

  function run() {
    var id = loadId();
    if (!id) {
      // New user — show full registration
      document.getElementById('nxi-step-ind').style.display = 'flex';
      buildIG('nxi-ig-reg', []);
      buildSO('nxi-so-reg', 'balanced');
    } else if (isAuthed()) {
      // Already authenticated this session — skip login entirely
      id.sessions  = (id.sessions || 0) + 1;
      id.lastVisit = Date.now();
      saveId(id);
      var login = document.getElementById('nxi-login');
      if (login) login.classList.add('gone');
      _onReady && _onReady(id, false);
    } else {
      // Returning user — show masked name + key entry
      document.getElementById('nxi-s1').classList.remove('show');
      document.getElementById('nxi-ret').classList.add('show');
      var n = id.name;
      var masked = n[0] + '*'.repeat(Math.max(n.length - 2, 1)) + n.slice(-1);
      document.getElementById('nxi-rname').textContent = 'IDENTITY RECOGNIZED — ' + masked.toUpperCase();
      if (id.title) document.getElementById('nxi-rtitle').textContent = id.title;
    }
  }

  // ── PUBLIC: init ─────────────────────────────────────────────────────────────
  function init(onReady, opts) {
    if (_initialized) return;
    _initialized = true;
    _onReady        = onReady;
    _onProfileSaved = (opts && opts.onProfileSaved) || null;

    // Inject CSS
    var style = document.createElement('style');
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);

    function setup() {
      document.body.insertAdjacentHTML('beforeend', LOGIN_HTML);
      document.body.insertAdjacentHTML('beforeend', MODAL_HTML);
      wireEvents();
      run();
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }

  // ── PUBLIC: profile modal ────────────────────────────────────────────────────
  function openModal() {
    var id = loadId(); if (!id) return;
    buildIG('nxi-ig-modal', id.interests || []);
    buildSO('nxi-so-modal', id.style || 'balanced');
    document.getElementById('nxi-pm-name').value  = id.name || '';
    document.getElementById('nxi-pm-title').value = id.title || '';
    document.getElementById('nxi-pm-birth').value = id.birthdate || '';
    document.getElementById('nxi-pm-loc').value   = id.location || '';
    document.getElementById('nxi-pm-focus').value = id.focus || '';
    document.getElementById('nxi-pm-kcur').value  = '';
    document.getElementById('nxi-pm-knew').value  = '';
    document.getElementById('nxi-mok').classList.remove('show');
    document.getElementById('nxi-modal').classList.add('open');
  }

  function closeModal() {
    var m = document.getElementById('nxi-modal'); if (m) m.classList.remove('open');
  }

  function saveModal() {
    var id  = loadId();
    var cur = document.getElementById('nxi-pm-kcur').value;
    var nw  = document.getElementById('nxi-pm-knew').value;
    if (!cur) return alert('Enter your current sovereign key to save changes.');
    if (hash(cur) !== id.keyHash) return alert('Current key is incorrect.');
    id.name      = document.getElementById('nxi-pm-name').value.trim() || id.name;
    id.title     = document.getElementById('nxi-pm-title').value.trim();
    id.birthdate = document.getElementById('nxi-pm-birth').value;
    id.location  = document.getElementById('nxi-pm-loc').value.trim();
    id.focus     = document.getElementById('nxi-pm-focus').value.trim();
    id.interests = getSelInt('nxi-ig-modal');
    id.style     = getSelSO('nxi-so-modal');
    if (nw.length >= 4) id.keyHash = hash(nw);
    else if (nw.length > 0 && nw.length < 4) return alert('New key must be at least 4 characters.');
    saveId(id);
    var ok = document.getElementById('nxi-mok');
    ok.classList.add('show');
    setTimeout(function () { ok.classList.remove('show'); }, 2500);
    _onProfileSaved && _onProfileSaved(id);
  }

  // ── PUBLIC: sign out ─────────────────────────────────────────────────────────
  function signOut() {
    var id = loadId();
    if (id) { id.lastVisit = Date.now(); saveId(id); }
    sessionStorage.removeItem(AKEY);
    location.reload();
  }

  // ── EXPORT ───────────────────────────────────────────────────────────────────
  global.NexusIdentity = {
    init: init,
    openModal: openModal,
    closeModal: closeModal,
    signOut: signOut,
    loadId: loadId,
    saveId: saveId,
    getZodiac: getZodiac,
    buildProfileContext: buildProfileContext
  };

})(window);
