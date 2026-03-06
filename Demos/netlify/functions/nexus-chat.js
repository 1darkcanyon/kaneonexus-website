<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEXUS LAUNCH — Build Your Business</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&family=Share+Tech+Mono&family=Crimson+Pro:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
  <style>
    :root {
      --void: #04050e;
      --deep: #070918;
      --card: #0a0c1e;
      --card2: #0d1028;
      --gold: #f59e0b;
      --gold-glow: rgba(245,158,11,0.3);
      --gold-dim: rgba(245,158,11,0.08);
      --emerald: #10b981;
      --emerald-glow: rgba(16,185,129,0.25);
      --blue: #3b82f6;
      --blue-glow: rgba(59,130,246,0.25);
      --violet: #8b5cf6;
      --violet-glow: rgba(139,92,246,0.25);
      --rose: #f43f5e;
      --cyan: #06b6d4;
      --text: #cbd5e8;
      --muted: #2d4060;
      --border: rgba(245,158,11,0.15);
      --border-soft: rgba(255,255,255,0.05);
    }

    * { margin:0; padding:0; box-sizing:border-box; }

    body {
      background: var(--void);
      color: var(--text);
      font-family: 'Rajdhani', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }

    body::before {
      content:'';
      position:fixed; inset:0;
      background-image:
        linear-gradient(rgba(245,158,11,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(245,158,11,0.025) 1px, transparent 1px);
      background-size: 52px 52px;
      pointer-events:none; z-index:0;
    }

    .orb { position:fixed; border-radius:50%; filter:blur(120px); pointer-events:none; z-index:0; }
    .orb1 { width:500px; height:500px; background:radial-gradient(circle, rgba(245,158,11,0.07), transparent 70%); top:-150px; right:-100px; }
    .orb2 { width:400px; height:400px; background:radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%); bottom:0; left:-100px; }
    .orb3 { width:300px; height:300px; background:radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%); top:40%; left:35%; }

    /* ── NAV ── */
    nav {
      position:sticky; top:0; z-index:100;
      display:flex; align-items:center; justify-content:space-between;
      padding:16px 32px;
      background:rgba(4,5,14,0.94);
      backdrop-filter:blur(20px);
      border-bottom:1px solid var(--border);
    }

    .nav-brand { display:flex; align-items:center; gap:14px; }

    .rocket-logo {
      width:40px; height:40px;
      background:linear-gradient(135deg, var(--gold), #d97706);
      border-radius:10px;
      display:flex; align-items:center; justify-content:center;
      font-size:1.3rem;
      box-shadow:0 0 20px var(--gold-glow);
      animation:rocketPulse 3s ease infinite;
    }

    @keyframes rocketPulse {
      0%,100%{box-shadow:0 0 20px var(--gold-glow)}
      50%{box-shadow:0 0 40px var(--gold-glow), 0 0 80px rgba(245,158,11,0.1)}
    }

    .brand-name {
      font-family:'Orbitron', monospace;
      font-size:1rem; font-weight:900;
      letter-spacing:3px; color:#fff;
    }

    .brand-name span { color:var(--gold); }
    .brand-tag { font-family:'Share Tech Mono', monospace; font-size:0.6rem; color:var(--muted); letter-spacing:2px; margin-top:2px; }

    .nav-back {
      font-family:'Orbitron', monospace; font-size:0.55rem;
      letter-spacing:2px; color:var(--muted);
      text-decoration:none; padding:7px 14px;
      border:1px solid var(--border); border-radius:6px;
      transition:all 0.3s;
    }
    .nav-back:hover { color:var(--gold); border-color:var(--gold); }

    /* ── HERO ── */
    .hero {
      position:relative; z-index:1;
      text-align:center;
      padding:70px 24px 50px;
    }

    .hero-eyebrow {
      font-family:'Share Tech Mono', monospace;
      font-size:0.65rem; letter-spacing:6px;
      color:var(--gold); margin-bottom:16px;
      opacity:0; animation:fadeUp 0.7s ease forwards 0.2s;
    }

    .hero-title {
      font-family:'Orbitron', monospace;
      font-size:clamp(2rem,6vw,4.5rem);
      font-weight:900; color:#fff;
      text-shadow:0 0 50px var(--gold-glow);
      margin-bottom:16px; line-height:1.1;
      opacity:0; animation:fadeUp 0.7s ease forwards 0.4s;
    }

    .hero-title span { color:var(--gold); }

    .hero-sub {
      font-family:'Crimson Pro', serif;
      font-style:italic; font-size:1.2rem;
      color:var(--muted); max-width:600px;
      margin:0 auto 40px; line-height:1.7;
      opacity:0; animation:fadeUp 0.7s ease forwards 0.6s;
    }

    .hero-sub em { color:var(--text); font-style:normal; }

    /* Business type selector */
    .biz-selector {
      display:flex; flex-wrap:wrap;
      justify-content:center; gap:12px;
      max-width:800px; margin:0 auto;
      opacity:0; animation:fadeUp 0.7s ease forwards 0.8s;
    }

    .biz-pill {
      padding:12px 20px;
      border-radius:50px;
      border:2px solid var(--border-soft);
      background:rgba(255,255,255,0.03);
      color:var(--muted);
      font-family:'Orbitron', monospace;
      font-size:0.6rem; letter-spacing:2px;
      cursor:pointer;
      transition:all 0.3s;
      display:flex; align-items:center; gap:8px;
    }

    .biz-pill:hover { border-color:var(--gold); color:var(--gold); background:var(--gold-dim); transform:translateY(-2px); }
    .biz-pill.active { border-color:var(--gold); color:var(--gold); background:var(--gold-dim); box-shadow:0 4px 20px var(--gold-glow); }

    @keyframes fadeUp {
      from{opacity:0;transform:translateY(20px)}
      to{opacity:1;transform:translateY(0)}
    }

    /* ── SECTION NAV ── */
    .sec-nav {
      position:relative; z-index:1;
      display:flex; overflow-x:auto; gap:0;
      border-top:1px solid var(--border);
      border-bottom:1px solid var(--border);
      background:rgba(4,5,14,0.8);
      backdrop-filter:blur(10px);
      padding:0 16px;
    }
    .sec-nav::-webkit-scrollbar { height:0; }

    .sec-tab {
      padding:14px 18px;
      font-family:'Orbitron', monospace;
      font-size:0.5rem; letter-spacing:2px;
      color:var(--muted); cursor:pointer;
      white-space:nowrap;
      border-bottom:2px solid transparent;
      transition:all 0.3s;
      display:flex; align-items:center; gap:6px;
    }

    .sec-tab:hover { color:var(--text); }
    .sec-tab.active { color:var(--gold); border-bottom-color:var(--gold); }

    /* ── MAIN ── */
    .main {
      position:relative; z-index:1;
      max-width:1100px; margin:0 auto;
      padding:32px 24px 80px;
    }

    .section { display:none; }
    .section.active { display:block; animation:fadeUp 0.5s ease; }

    /* ── CARDS ── */
    .card {
      background:var(--card);
      border:1px solid var(--border-soft);
      border-radius:16px; overflow:hidden;
      margin-bottom:20px;
    }

    .card-header {
      padding:18px 24px;
      border-bottom:1px solid var(--border-soft);
      display:flex; align-items:center; gap:12px;
    }

    .card-title {
      font-family:'Orbitron', monospace;
      font-size:0.7rem; letter-spacing:3px;
    }

    .card-body { padding:24px; }

    /* ── BIZ TYPE CARDS ── */
    .biz-grid {
      display:grid;
      grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));
      gap:16px; margin-bottom:24px;
    }

    .biz-card {
      background:var(--card2);
      border-radius:14px; padding:24px;
      border:1px solid; cursor:pointer;
      transition:transform 0.2s, box-shadow 0.2s;
      position:relative; overflow:hidden;
    }

    .biz-card::before {
      content:''; position:absolute;
      top:0; left:0; right:0; height:3px;
    }

    .biz-card:hover { transform:translateY(-4px); }

    .biz-card.llc { border-color:rgba(59,130,246,0.25); }
    .biz-card.llc::before { background:var(--blue); }
    .biz-card.llc:hover { box-shadow:0 8px 30px rgba(59,130,246,0.15); }

    .biz-card.sole { border-color:rgba(245,158,11,0.25); }
    .biz-card.sole::before { background:var(--gold); }
    .biz-card.sole:hover { box-shadow:0 8px 30px var(--gold-glow); }

    .biz-card.nonprofit { border-color:rgba(16,185,129,0.25); }
    .biz-card.nonprofit::before { background:var(--emerald); }
    .biz-card.nonprofit:hover { box-shadow:0 8px 30px var(--emerald-glow); }

    .biz-card.ai { border-color:rgba(139,92,246,0.25); }
    .biz-card.ai::before { background:var(--violet); }
    .biz-card.ai:hover { box-shadow:0 8px 30px var(--violet-glow); }

    .biz-card.drop { border-color:rgba(6,182,212,0.25); }
    .biz-card.drop::before { background:var(--cyan); }
    .biz-card.drop:hover { box-shadow:0 8px 30px rgba(6,182,212,0.15); }

    .biz-card.freelance { border-color:rgba(244,63,94,0.25); }
    .biz-card.freelance::before { background:var(--rose); }
    .biz-card.freelance:hover { box-shadow:0 8px 30px rgba(244,63,94,0.15); }

    .biz-icon { font-size:2.2rem; margin-bottom:14px; display:block; }

    .biz-name {
      font-family:'Orbitron', monospace;
      font-size:0.75rem; letter-spacing:2px;
      margin-bottom:8px;
    }

    .biz-card.llc .biz-name { color:var(--blue); }
    .biz-card.sole .biz-name { color:var(--gold); }
    .biz-card.nonprofit .biz-name { color:var(--emerald); }
    .biz-card.ai .biz-name { color:#a78bfa; }
    .biz-card.drop .biz-name { color:var(--cyan); }
    .biz-card.freelance .biz-name { color:var(--rose); }

    .biz-desc { font-size:0.88rem; color:var(--muted); line-height:1.6; margin-bottom:16px; }

    .biz-tags { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:16px; }

    .biz-tag {
      font-family:'Share Tech Mono', monospace;
      font-size:0.6rem; padding:3px 8px;
      border-radius:4px; letter-spacing:1px;
    }

    .tag-easy { background:rgba(16,185,129,0.1); color:var(--emerald); border:1px solid rgba(16,185,129,0.2); }
    .tag-medium { background:rgba(245,158,11,0.1); color:var(--gold); border:1px solid rgba(245,158,11,0.2); }
    .tag-advanced { background:rgba(244,63,94,0.1); color:var(--rose); border:1px solid rgba(244,63,94,0.2); }
    .tag-free { background:rgba(16,185,129,0.1); color:var(--emerald); border:1px solid rgba(16,185,129,0.2); }
    .tag-cost { background:rgba(245,158,11,0.1); color:var(--gold); border:1px solid rgba(245,158,11,0.2); }

    .launch-btn {
      width:100%; padding:11px;
      background:transparent; border-radius:8px;
      font-family:'Orbitron', monospace;
      font-size:0.6rem; letter-spacing:2px;
      cursor:pointer; transition:all 0.3s;
    }

    .biz-card.llc .launch-btn { border:1px solid rgba(59,130,246,0.4); color:var(--blue); }
    .biz-card.llc .launch-btn:hover { background:rgba(59,130,246,0.1); }
    .biz-card.sole .launch-btn { border:1px solid rgba(245,158,11,0.4); color:var(--gold); }
    .biz-card.sole .launch-btn:hover { background:var(--gold-dim); }
    .biz-card.nonprofit .launch-btn { border:1px solid rgba(16,185,129,0.4); color:var(--emerald); }
    .biz-card.nonprofit .launch-btn:hover { background:rgba(16,185,129,0.08); }
    .biz-card.ai .launch-btn { border:1px solid rgba(139,92,246,0.4); color:#a78bfa; }
    .biz-card.ai .launch-btn:hover { background:rgba(139,92,246,0.08); }
    .biz-card.drop .launch-btn { border:1px solid rgba(6,182,212,0.4); color:var(--cyan); }
    .biz-card.drop .launch-btn:hover { background:rgba(6,182,212,0.08); }
    .biz-card.freelance .launch-btn { border:1px solid rgba(244,63,94,0.4); color:var(--rose); }
    .biz-card.freelance .launch-btn:hover { background:rgba(244,63,94,0.08); }

    /* ── STEP BY STEP ── */
    .steps-header {
      display:flex; align-items:center; gap:16px;
      margin-bottom:28px;
    }

    .steps-back {
      padding:7px 14px;
      background:transparent;
      border:1px solid var(--border);
      border-radius:6px;
      color:var(--muted);
      font-family:'Orbitron', monospace;
      font-size:0.55rem; letter-spacing:2px;
      cursor:pointer; transition:all 0.3s;
    }
    .steps-back:hover { color:var(--gold); border-color:var(--gold); }

    .steps-title {
      font-family:'Orbitron', monospace;
      font-size:0.85rem; letter-spacing:3px;
    }

    .step-list { display:flex; flex-direction:column; gap:0; }

    .step-item {
      display:flex; gap:0;
      position:relative;
    }

    .step-item:not(:last-child) .step-line {
      position:absolute;
      left:23px; top:48px;
      width:2px; height:calc(100% - 24px);
      background:linear-gradient(180deg, var(--gold), transparent);
      z-index:0;
    }

    .step-left {
      display:flex; flex-direction:column;
      align-items:center; padding-top:16px;
      margin-right:20px; flex-shrink:0;
      position:relative; z-index:1;
    }

    .step-num {
      width:46px; height:46px;
      border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-family:'Orbitron', monospace;
      font-size:0.8rem; font-weight:900;
      border:2px solid;
      transition:all 0.3s;
      cursor:pointer;
      background:var(--card2);
    }

    .step-num.done {
      background:var(--gold) !important;
      border-color:var(--gold) !important;
      color:var(--void) !important;
    }

    .step-right {
      flex:1; padding:16px 0 32px;
    }

    .step-label {
      font-family:'Orbitron', monospace;
      font-size:0.65rem; letter-spacing:2px;
      margin-bottom:8px;
    }

    .step-body {
      font-size:0.9rem; color:var(--muted);
      line-height:1.7; margin-bottom:12px;
    }

    .step-body strong { color:var(--text); }

    .step-tip {
      padding:10px 14px;
      border-radius:8px;
      font-size:0.82rem; line-height:1.5;
      margin-bottom:8px;
      display:flex; align-items:flex-start; gap:8px;
    }

    .tip-gold { background:var(--gold-dim); border:1px solid rgba(245,158,11,0.2); color:#fcd34d; }
    .tip-green { background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); color:var(--emerald); }
    .tip-blue { background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); color:var(--blue); }

    .step-link {
      display:inline-block;
      font-family:'Share Tech Mono', monospace;
      font-size:0.7rem; color:var(--gold);
      text-decoration:none;
      border-bottom:1px solid rgba(245,158,11,0.3);
      transition:border-color 0.2s;
    }
    .step-link:hover { border-color:var(--gold); }

    .step-check-btn {
      margin-top:10px;
      padding:8px 18px;
      background:transparent;
      border:1px solid var(--border);
      border-radius:6px;
      color:var(--muted);
      font-family:'Orbitron', monospace;
      font-size:0.55rem; letter-spacing:2px;
      cursor:pointer; transition:all 0.3s;
    }

    .step-check-btn:hover { border-color:var(--gold); color:var(--gold); }
    .step-check-btn.checked { background:rgba(16,185,129,0.1); border-color:var(--emerald); color:var(--emerald); }

    /* Progress bar */
    .progress-card {
      background:var(--card2);
      border:1px solid var(--border-soft);
      border-radius:12px; padding:20px;
      margin-bottom:24px;
      display:flex; align-items:center; gap:16px;
    }

    .progress-info { flex:1; }
    .progress-label {
      font-family:'Orbitron', monospace;
      font-size:0.6rem; letter-spacing:2px;
      color:var(--gold); margin-bottom:8px;
    }

    .progress-bar-bg {
      background:rgba(255,255,255,0.06);
      border-radius:4px; height:6px; overflow:hidden;
    }

    .progress-bar-fill {
      height:100%; border-radius:4px;
      background:linear-gradient(90deg, var(--gold), var(--emerald));
      transition:width 0.5s ease;
    }

    .progress-pct {
      font-family:'Orbitron', monospace;
      font-size:1.5rem; font-weight:900;
      color:var(--gold); min-width:50px;
      text-align:right;
    }

    /* ── KNOWLEDGE HUB ── */
    .knowledge-grid {
      display:grid;
      grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));
      gap:16px; margin-bottom:24px;
    }

    .know-card {
      background:var(--card2);
      border:1px solid var(--border-soft);
      border-radius:12px; padding:20px;
      cursor:pointer; transition:border-color 0.3s, transform 0.2s;
    }

    .know-card:hover { border-color:var(--gold); transform:translateY(-3px); }

    .know-icon { font-size:1.8rem; margin-bottom:10px; display:block; }
    .know-title {
      font-family:'Orbitron', monospace;
      font-size:0.65rem; letter-spacing:2px;
      color:var(--gold); margin-bottom:6px;
    }
    .know-desc { font-size:0.85rem; color:var(--muted); line-height:1.5; }

    .know-card.open .know-body { display:block; }
    .know-body {
      display:none; margin-top:14px;
      padding-top:14px;
      border-top:1px solid var(--border-soft);
    }

    .know-body p { font-size:0.85rem; color:var(--text); line-height:1.7; margin-bottom:10px; }

    .know-tip {
      padding:8px 12px;
      border-radius:6px; font-size:0.8rem;
      margin-bottom:6px;
    }

    /* ── RESOURCES ── */
    .resource-grid {
      display:grid;
      grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));
      gap:14px;
    }

    .res-card {
      background:var(--card2);
      border:1px solid var(--border-soft);
      border-radius:12px; padding:18px;
      transition:border-color 0.3s;
      text-decoration:none;
      display:block;
    }

    .res-card:hover { border-color:var(--gold); }

    .res-icon { font-size:1.5rem; margin-bottom:8px; display:block; }
    .res-name {
      font-family:'Orbitron', monospace;
      font-size:0.6rem; letter-spacing:2px;
      color:var(--gold); margin-bottom:6px;
    }
    .res-desc { font-size:0.82rem; color:var(--muted); line-height:1.4; margin-bottom:8px; }
    .res-url {
      font-family:'Share Tech Mono', monospace;
      font-size:0.65rem; color:var(--emerald);
    }

    /* ── COMMUNITY ── */
    .community-post {
      background:var(--card2);
      border:1px solid var(--border-soft);
      border-radius:12px; padding:20px;
      margin-bottom:14px;
      transition:border-color 0.3s;
    }

    .community-post:hover { border-color:rgba(245,158,11,0.2); }

    .post-header {
      display:flex; align-items:center;
      justify-content:space-between; margin-bottom:10px;
    }

    .post-author {
      font-family:'Orbitron', monospace;
      font-size:0.6rem; letter-spacing:2px; color:var(--gold);
      display:flex; align-items:center; gap:8px;
    }

    .post-badge {
      font-size:0.6rem; padding:2px 7px;
      border-radius:3px; background:var(--gold-dim);
      border:1px solid rgba(245,158,11,0.2);
      color:var(--gold);
    }

    .post-time { font-family:'Share Tech Mono', monospace; font-size:0.6rem; color:var(--muted); }
    .post-body { font-size:0.9rem; color:var(--text); line-height:1.6; margin-bottom:12px; }

    .post-footer { display:flex; align-items:center; gap:10px; }

    .post-like {
      padding:4px 12px;
      background:transparent;
      border:1px solid var(--border-soft);
      border-radius:20px; color:var(--muted);
      font-size:0.75rem; cursor:pointer;
      transition:all 0.2s; font-family:'Rajdhani', sans-serif;
    }

    .post-like:hover { border-color:var(--gold); color:var(--gold); }

    .post-tag {
      font-family:'Share Tech Mono', monospace;
      font-size:0.6rem; padding:2px 7px;
      border-radius:3px; color:var(--muted);
      border:1px solid var(--border-soft);
    }

    /* Share input */
    .share-box {
      background:var(--card2);
      border:1px solid var(--border-soft);
      border-radius:12px; padding:20px;
      margin-bottom:24px;
    }

    .share-title {
      font-family:'Orbitron', monospace;
      font-size:0.6rem; letter-spacing:3px;
      color:var(--gold); margin-bottom:12px;
    }

    .share-input {
      width:100%;
      background:rgba(255,255,255,0.03);
      border:1px solid var(--border-soft);
      border-radius:8px; padding:12px 14px;
      color:var(--text);
      font-family:'Rajdhani', sans-serif;
      font-size:0.95rem; outline:none;
      resize:none; min-height:80px;
      transition:border-color 0.3s; margin-bottom:10px;
    }

    .share-input:focus { border-color:var(--gold); }
    .share-input::placeholder { color:var(--muted); }

    .share-btn {
      padding:10px 24px;
      background:linear-gradient(135deg, var(--gold), #d97706);
      border:none; border-radius:8px;
      color:var(--void);
      font-family:'Orbitron', monospace;
      font-size:0.6rem; letter-spacing:2px;
      cursor:pointer; transition:all 0.3s;
    }

    .share-btn:hover { transform:translateY(-2px); box-shadow:0 4px 20px var(--gold-glow); }

    /* ── MODAL ── */
    .modal-overlay {
      position:fixed; inset:0;
      background:rgba(0,0,0,0.75);
      backdrop-filter:blur(10px);
      z-index:200; display:none;
      align-items:center; justify-content:center;
      padding:20px;
    }

    .modal-overlay.show { display:flex; }

    .modal {
      background:var(--card2);
      border:1px solid var(--border);
      border-radius:16px; width:100%;
      max-width:540px; max-height:85vh;
      overflow-y:auto;
      animation:modalIn 0.3s ease;
    }

    @keyframes modalIn {
      from{opacity:0;transform:scale(0.9) translateY(20px)}
      to{opacity:1;transform:scale(1) translateY(0)}
    }

    .modal-header {
      padding:20px 24px;
      border-bottom:1px solid var(--border-soft);
      display:flex; align-items:center; justify-content:space-between;
      position:sticky; top:0; background:var(--card2); z-index:1;
    }

    .modal-title { font-family:'Orbitron', monospace; font-size:0.75rem; letter-spacing:3px; color:var(--gold); }

    .modal-close {
      width:28px; height:28px; border-radius:50%;
      background:rgba(255,255,255,0.05);
      border:1px solid var(--border-soft);
      color:var(--muted); cursor:pointer;
      font-size:1rem; display:flex;
      align-items:center; justify-content:center;
      transition:all 0.2s;
    }

    .modal-close:hover { background:var(--rose); color:#fff; }
    .modal-body { padding:24px; }

    /* Responsive */
    @media(max-width:600px) {
      nav { padding:12px 16px; }
      .hero { padding:40px 16px 32px; }
      .main { padding:20px 16px 60px; }
      .step-left { margin-right:14px; }
    }
  </style>
</head>
<body>

<div class="orb orb1"></div>
<div class="orb orb2"></div>
<div class="orb orb3"></div>

<!-- NAV -->
<nav>
  <div class="nav-brand">
    <div class="rocket-logo">🚀</div>
    <div>
      <div class="brand-name">NEXUS <span>LAUNCH</span></div>
      <div class="brand-tag">BUILD YOUR BUSINESS</div>
    </div>
  </div>
  <a href="/demos/" class="nav-back">← DEMOS</a>
</nav>

<!-- HERO -->
<div class="hero">
  <div class="hero-eyebrow">NEXUS Business Builder</div>
  <h1 class="hero-title">YOUR <span>EMPIRE</span><br>STARTS HERE</h1>
  <p class="hero-sub"><em>You don't need permission to start.</em><br>You need information. Here it is — step by step, no gatekeeping.</p>

  <div class="biz-selector">
    <div class="biz-pill active" onclick="filterBiz('all')">🌐 ALL PATHS</div>
    <div class="biz-pill" onclick="filterBiz('llc')">🏛️ LLC</div>
    <div class="biz-pill" onclick="filterBiz('sole')">👤 SOLE PROP</div>
    <div class="biz-pill" onclick="filterBiz('nonprofit')">💚 NONPROFIT</div>
    <div class="biz-pill" onclick="filterBiz('ai')">🤖 .AI DOMAIN</div>
    <div class="biz-pill" onclick="filterBiz('drop')">📦 DROPSHIP</div>
    <div class="biz-pill" onclick="filterBiz('freelance')">💻 FREELANCE</div>
  </div>
</div>

<!-- SECTION TABS -->
<div class="sec-nav">
  <div class="sec-tab active" onclick="switchSec('explore')">🚀 EXPLORE PATHS</div>
  <div class="sec-tab" onclick="switchSec('steps')">📋 STEP BY STEP</div>
  <div class="sec-tab" onclick="switchSec('knowledge')">🧠 KNOWLEDGE HUB</div>
  <div class="sec-tab" onclick="switchSec('resources')">🔗 RESOURCES</div>
  <div class="sec-tab" onclick="switchSec('community')">🤝 COMMUNITY</div>
</div>

<!-- MAIN -->
<div class="main">

  <!-- ── EXPLORE ── -->
  <div class="section active" id="sec-explore">

    <div class="biz-grid" id="bizGrid">

      <div class="biz-card llc" data-type="llc">
        <span class="biz-icon">🏛️</span>
        <div class="biz-name">LLC</div>
        <div class="biz-desc">Limited Liability Company. Protects your personal assets from business debts. The most popular structure for serious entrepreneurs. Your business is legally separate from you.</div>
        <div class="biz-tags">
          <span class="biz-tag tag-medium">MODERATE SETUP</span>
          <span class="biz-tag tag-cost">$50-500 STATE FEE</span>
          <span class="biz-tag">BEST PROTECTION</span>
        </div>
        <button class="launch-btn" onclick="launchGuide('llc')">START LLC GUIDE →</button>
      </div>

      <div class="biz-card sole" data-type="sole">
        <span class="biz-icon">👤</span>
        <div class="biz-name">SOLE PROPRIETORSHIP</div>
        <div class="biz-desc">The simplest business structure. You ARE the business. No paperwork to start, no fees, just begin. Perfect for freelancers, side hustles, and testing your idea before going bigger.</div>
        <div class="biz-tags">
          <span class="biz-tag tag-easy">EASIEST START</span>
          <span class="biz-tag tag-free">FREE TO START</span>
          <span class="biz-tag">INSTANT LAUNCH</span>
        </div>
        <button class="launch-btn" onclick="launchGuide('sole')">START SOLE PROP GUIDE →</button>
      </div>

      <div class="biz-card nonprofit" data-type="nonprofit">
        <span class="biz-icon">💚</span>
        <div class="biz-name">NONPROFIT / .ORG</div>
        <div class="biz-desc">Mission-driven organizations that serve the public good. Tax-exempt status through 501(c)(3). Perfect for community programs, advocacy work, and causes like the ones NEXUS supports.</div>
        <div class="biz-tags">
          <span class="biz-tag tag-advanced">COMPLEX SETUP</span>
          <span class="biz-tag tag-cost">$275-600 IRS FEE</span>
          <span class="biz-tag">TAX EXEMPT</span>
        </div>
        <button class="launch-btn" onclick="launchGuide('nonprofit')">START NONPROFIT GUIDE →</button>
      </div>

      <div class="biz-card ai" data-type="ai">
        <span class="biz-icon">🤖</span>
        <div class="biz-name">.AI DOMAIN BUSINESS</div>
        <div class="biz-desc">Position your brand at the cutting edge of technology. A .ai domain signals innovation, intelligence, and future-forward thinking. Perfect for tech products, AI tools, and NEXUS-style platforms.</div>
        <div class="biz-tags">
          <span class="biz-tag tag-medium">MODERATE SETUP</span>
          <span class="biz-tag tag-cost">~$70-100/YR DOMAIN</span>
          <span class="biz-tag">HIGH AUTHORITY</span>
        </div>
        <button class="launch-btn" onclick="launchGuide('ai')">START .AI GUIDE →</button>
      </div>

      <div class="biz-card drop" data-type="drop">
        <span class="biz-icon">📦</span>
        <div class="biz-name">DROPSHIPPING</div>
        <div class="biz-desc">Sell products online without holding inventory. When someone buys from your store, the supplier ships directly to them. You keep the margin. Start with almost no upfront cost.</div>
        <div class="biz-tags">
          <span class="biz-tag tag-easy">LOW BARRIER</span>
          <span class="biz-tag tag-free">NO INVENTORY</span>
          <span class="biz-tag">PASSIVE POTENTIAL</span>
        </div>
        <button class="launch-btn" onclick="launchGuide('drop')">START DROPSHIP GUIDE →</button>
      </div>

      <div class="biz-card freelance" data-type="freelance">
        <span class="biz-icon">💻</span>
        <div class="biz-name">FREELANCE</div>
        <div class="biz-desc">Sell your skills directly to clients. Writing, design, coding, consulting, marketing — if you have a skill someone needs, you have a business. Start earning today with zero investment.</div>
        <div class="biz-tags">
          <span class="biz-tag tag-easy">START TODAY</span>
          <span class="biz-tag tag-free">ZERO COST</span>
          <span class="biz-tag">SKILL BASED</span>
        </div>
        <button class="launch-btn" onclick="launchGuide('freelance')">START FREELANCE GUIDE →</button>
      </div>

    </div>

  </div>

  <!-- ── STEP BY STEP ── -->
  <div class="section" id="sec-steps">

    <!-- Guide selector shown when no guide active -->
    <div id="guideSelector">
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:2.5rem;margin-bottom:16px">📋</div>
        <div style="font-family:'Orbitron',monospace;font-size:0.8rem;letter-spacing:3px;color:var(--gold);margin-bottom:12px">SELECT YOUR PATH</div>
        <div style="font-size:0.95rem;color:var(--muted);margin-bottom:24px">Choose a business type from Explore Paths to see your step by step launch guide</div>
        <button class="share-btn" onclick="switchSec('explore')">← BACK TO EXPLORE</button>
      </div>
    </div>

    <!-- Active guide container -->
    <div id="activeGuide" style="display:none">

      <div class="steps-header">
        <button class="steps-back" onclick="backToSelector()">← CHANGE PATH</button>
        <div class="steps-title" id="guideTitle" style="color:var(--gold)"></div>
      </div>

      <div class="progress-card">
        <div class="progress-info">
          <div class="progress-label">YOUR PROGRESS</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" id="progressFill" style="width:0%"></div>
          </div>
        </div>
        <div class="progress-pct" id="progressPct">0%</div>
      </div>

      <div class="step-list" id="stepList"></div>

    </div>

  </div>

  <!-- ── KNOWLEDGE HUB ── -->
  <div class="section" id="sec-knowledge">

    <div style="font-family:'Orbitron',monospace;font-size:0.65rem;letter-spacing:3px;color:var(--gold);margin-bottom:20px">// BUSINESS FUNDAMENTALS — PLAIN LANGUAGE</div>

    <div class="knowledge-grid">

      <div class="know-card" onclick="toggleKnow(this)">
        <span class="know-icon">💰</span>
        <div class="know-title">TAXES & SELF EMPLOYMENT</div>
        <div class="know-desc">What you owe, when you owe it, and how to keep more of what you earn.</div>
        <div class="know-body">
          <p>When you work for yourself the IRS expects you to pay taxes quarterly — not just once a year. This is called <strong>estimated taxes</strong>. Miss them and you get penalized.</p>
          <p><strong>Self-employment tax is 15.3%</strong> on top of income tax. But here's what most people don't tell you — half of that is deductible.</p>
          <div class="know-tip tip-gold">💡 Set aside 25-30% of every payment you receive into a separate savings account. Tax day will never hurt again.</div>
          <div class="know-tip tip-green">✓ Track EVERY business expense — phone, internet, supplies, software. It all reduces what you owe.</div>
          <div class="know-tip tip-blue">📋 Use IRS Form 1040-ES for quarterly estimated payments. Due: April, June, September, January.</div>
        </div>
      </div>

      <div class="know-card" onclick="toggleKnow(this)">
        <span class="know-icon">🏦</span>
        <div class="know-title">BUSINESS BANKING</div>
        <div class="know-desc">Separate your money from day one. This protects you legally and makes taxes simple.</div>
        <div class="know-body">
          <p>The number one mistake new business owners make — mixing personal and business money. Open a <strong>separate business checking account</strong> the day you start.</p>
          <p>This protects your LLC liability shield, makes bookkeeping simple, and looks professional when clients send payments.</p>
          <div class="know-tip tip-gold">💡 Relay, Mercury, and Novo offer free business checking with no minimum balance. Perfect for starting out.</div>
          <div class="know-tip tip-green">✓ Pay yourself a set "salary" from the business account to personal. Build the habit of separation early.</div>
        </div>
      </div>

      <div class="know-card" onclick="toggleKnow(this)">
        <span class="know-icon">📄</span>
        <div class="know-title">CONTRACTS & INVOICES</div>
        <div class="know-desc">Protect yourself legally. Never work without a contract. Never wait to invoice.</div>
        <div class="know-body">
          <p>A contract doesn't need to be fancy — it needs to state <strong>what you'll do, what they'll pay, and when.</strong> That's it. Free tools like HelloSign or DocuSign handle electronic signatures.</p>
          <p>Invoice immediately upon project completion. Net 30 terms mean they have 30 days to pay. Chase at day 31.</p>
          <div class="know-tip tip-gold">💡 Wave and Invoice Ninja offer free professional invoicing. PayPal and Stripe handle payments and send receipts automatically.</div>
          <div class="know-tip tip-green">✓ Always get a 25-50% deposit upfront from new clients. Protects you if they disappear.</div>
        </div>
      </div>

      <div class="know-card" onclick="toggleKnow(this)">
        <span class="know-icon">📈</span>
        <div class="know-title">PRICING YOUR WORK</div>
        <div class="know-desc">Most people undercharge. Here's how to price with confidence.</div>
        <div class="know-body">
          <p>Your price should cover: your time + your expenses + your profit margin + self-employment tax. Most beginners forget the last two.</p>
          <p><strong>Formula:</strong> (Hours × Hourly Rate) + 30% for taxes + 10-20% profit margin = Your Price</p>
          <div class="know-tip tip-gold">💡 Research what others charge on Upwork, Fiverr, and industry forums. Then charge at least the median — your work has value.</div>
          <div class="know-tip tip-green">✓ Raise your rates every 6 months as you build experience. Existing clients get grandfather pricing for 1 year.</div>
          <div class="know-tip tip-blue">📋 Value pricing beats hourly pricing. Charge for the outcome, not the clock.</div>
        </div>
      </div>

      <div class="know-card" onclick="toggleKnow(this)">
        <span class="know-icon">🌐</span>
        <div class="know-title">ONLINE PRESENCE</div>
        <div class="know-desc">You need to be findable. Here's the minimum viable online presence.</div>
        <div class="know-body">
          <p>You don't need a perfect website to start. You need: a domain, a simple one-page site, and one social platform where your customers live.</p>
          <p>For most businesses: <strong>Google Business Profile</strong> is free and puts you on Google Maps instantly. Set it up today.</p>
          <div class="know-tip tip-gold">💡 Carrd.co builds beautiful one-page sites for $19/year. Enough to look professional while you build bigger.</div>
          <div class="know-tip tip-green">✓ Claim your business name on all major platforms even if you don't use them yet. Protect your brand.</div>
        </div>
      </div>

      <div class="know-card" onclick="toggleKnow(this)">
        <span class="know-icon">🤝</span>
        <div class="know-title">FINDING FIRST CLIENTS</div>
        <div class="know-desc">Your network is your net worth. Start closer than you think.</div>
        <div class="know-body">
          <p>Your first client is probably someone you already know. Tell everyone what you do. Post about it. The people who know you are your first marketing team.</p>
          <p>After that: Upwork, Fiverr, LinkedIn, local Facebook groups, cold email, and referrals from satisfied clients.</p>
          <div class="know-tip tip-gold">💡 Offer your first 2-3 clients a discount in exchange for a testimonial. Social proof is worth more than the discount.</div>
          <div class="know-tip tip-green">✓ Ask every satisfied client for a referral. One happy customer can become ten.</div>
          <div class="know-tip tip-blue">📋 Follow up. Most business is lost because nobody followed up. Send that second email.</div>
        </div>
      </div>

    </div>

  </div>

  <!-- ── RESOURCES ── -->
  <div class="section" id="sec-resources">

    <div style="font-family:'Orbitron',monospace;font-size:0.65rem;letter-spacing:3px;color:var(--gold);margin-bottom:20px">// FREE & LOW COST TOOLS TO BUILD YOUR EMPIRE</div>

    <div style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;color:var(--muted);letter-spacing:2px;margin-bottom:12px">// LEGAL & FORMATION</div>
    <div class="resource-grid" style="margin-bottom:24px">
      <a class="res-card" href="https://www.sos.state.gov" target="_blank">
        <span class="res-icon">🏛️</span>
        <div class="res-name">STATE SOS WEBSITE</div>
        <div class="res-desc">File your LLC directly with your state Secretary of State. Skip the expensive formation services.</div>
        <div class="res-url">sos.[yourstate].gov</div>
      </a>
      <a class="res-card" href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" target="_blank">
        <span class="res-icon">📋</span>
        <div class="res-name">FREE EIN — IRS.GOV</div>
        <div class="res-desc">Get your Employer Identification Number free directly from the IRS. Takes 10 minutes online.</div>
        <div class="res-url">irs.gov — EIN Application</div>
      </a>
      <a class="res-card" href="https://www.score.org" target="_blank">
        <span class="res-icon">🤝</span>
        <div class="res-name">SCORE MENTORS</div>
        <div class="res-desc">Free business mentorship from retired executives. One on one guidance at no cost. Incredible resource.</div>
        <div class="res-url">score.org</div>
      </a>
    </div>

    <div style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;color:var(--muted);letter-spacing:2px;margin-bottom:12px">// MONEY & BANKING</div>
    <div class="resource-grid" style="margin-bottom:24px">
      <a class="res-card" href="https://mercury.com" target="_blank">
        <span class="res-icon">🏦</span>
        <div class="res-name">MERCURY BANK</div>
        <div class="res-desc">Free business banking built for startups. No fees, no minimums, great API.</div>
        <div class="res-url">mercury.com</div>
      </a>
      <a class="res-card" href="https://wave.com" target="_blank">
        <span class="res-icon">💰</span>
        <div class="res-name">WAVE — FREE ACCOUNTING</div>
        <div class="res-desc">Free invoicing, accounting, and receipt scanning. Handles taxes too. Zero cost forever.</div>
        <div class="res-url">waveapps.com</div>
      </a>
      <a class="res-card" href="https://stripe.com" target="_blank">
        <span class="res-icon">💳</span>
        <div class="res-name">STRIPE PAYMENTS</div>
        <div class="res-desc">Accept cards, bank transfers, and international payments. Only pay when you get paid.</div>
        <div class="res-url">stripe.com</div>
      </a>
    </div>

    <div style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;color:var(--muted);letter-spacing:2px;margin-bottom:12px">// BUILD & SELL</div>
    <div class="resource-grid" style="margin-bottom:24px">
      <a class="res-card" href="https://shopify.com" target="_blank">
        <span class="res-icon">🛍️</span>
        <div class="res-name">SHOPIFY</div>
        <div class="res-desc">Best platform for dropshipping and ecommerce. Integrates with suppliers like DSers and Oberlo.</div>
        <div class="res-url">shopify.com</div>
      </a>
      <a class="res-card" href="https://upwork.com" target="_blank">
        <span class="res-icon">💻</span>
        <div class="res-name">UPWORK</div>
        <div class="res-desc">Find freelance clients globally. Best platform for professional services and tech work.</div>
        <div class="res-url">upwork.com</div>
      </a>
      <a class="res-card" href="https://fiverr.com" target="_blank">
        <span class="res-icon">⚡</span>
        <div class="res-name">FIVERR</div>
        <div class="res-desc">Sell your services as packages. Great for creatives, writers, designers, and digital services.</div>
        <div class="res-url">fiverr.com</div>
      </a>
    </div>

    <div style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;color:var(--muted);letter-spacing:2px;margin-bottom:12px">// FUNDING</div>
    <div class="resource-grid">
      <a class="res-card" href="https://grants.gov" target="_blank">
        <span class="res-icon">💵</span>
        <div class="res-name">GRANTS.GOV</div>
        <div class="res-desc">Federal grants database. Many available for small businesses, minorities, veterans, and nonprofits.</div>
        <div class="res-url">grants.gov</div>
      </a>
      <a class="res-card" href="https://sba.gov/loans" target="_blank">
        <span class="res-icon">🏗️</span>
        <div class="res-name">SBA LOANS</div>
        <div class="res-desc">Small Business Administration loans with low interest rates. Microloans start at $500.</div>
        <div class="res-url">sba.gov/loans</div>
      </a>
      <a class="res-card" href="https://kiva.org" target="_blank">
        <span class="res-icon">🌍</span>
        <div class="res-name">KIVA MICROLOANS</div>
        <div class="res-desc">0% interest microloans up to $15,000 for underserved entrepreneurs. Community funded.</div>
        <div class="res-url">kiva.org</div>
      </a>
    </div>

  </div>

  <!-- ── COMMUNITY ── -->
  <div class="section" id="sec-community">

    <div class="share-box">
      <div class="share-title">// SHARE WHAT WORKED FOR YOU</div>
      <textarea class="share-input" id="shareInput" placeholder="Share a tip, a win, a lesson learned, a resource that helped you — help the next person starting their journey..."></textarea>
      <button class="share-btn" onclick="sharePost()">SHARE WITH COMMUNITY →</button>
    </div>

    <div id="postFeed">

      <div class="community-post">
        <div class="post-header">
          <div class="post-author">DREAMWALKER <span class="post-badge">FOUNDER</span></div>
          <div class="post-time">Today</div>
        </div>
        <div class="post-body">Started my LLC with $50 and a laptop. The state filing fee was the only real cost. Everything else I found free. SCORE mentor walked me through it in one session. Don't let anyone tell you it costs thousands to start a real business.</div>
        <div class="post-footer">
          <button class="post-like" onclick="likePost(this)">♥ 47</button>
          <span class="post-tag">LLC</span>
          <span class="post-tag">STARTING OUT</span>
        </div>
      </div>

      <div class="community-post">
        <div class="post-header">
          <div class="post-author">MARIA V.</div>
          <div class="post-time">2 days ago</div>
        </div>
        <div class="post-body">Dropshipping tip — don't pick a niche based on what you think will sell. Pick something you actually know about and care about. My pet supply store outperforms my old electronics store 10x because I can write real product descriptions and answer customer questions without research.</div>
        <div class="post-footer">
          <button class="post-like" onclick="likePost(this)">♥ 31</button>
          <span class="post-tag">DROPSHIPPING</span>
          <span class="post-tag">NICHE</span>
        </div>
      </div>

      <div class="community-post">
        <div class="post-header">
          <div class="post-author">MARCUS T.</div>
          <div class="post-time">4 days ago</div>
        </div>
        <div class="post-body">Freelance lesson — I raised my rates 40% and got MORE clients. Seriously. Lower prices signal lower quality to buyers. Price yourself at what you want to earn, not what you're afraid to charge.</div>
        <div class="post-footer">
          <button class="post-like" onclick="likePost(this)">♥ 89</button>
          <span class="post-tag">FREELANCE</span>
          <span class="post-tag">PRICING</span>
        </div>
      </div>

    </div>

  </div>

</div>

<!-- MODAL for detail guides -->
<div class="modal-overlay" id="detailModal" onclick="closeOut(event,'detailModal')">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title" id="modalTitle"></div>
      <button class="modal-close" onclick="closeModal('detailModal')">×</button>
    </div>
    <div class="modal-body" id="modalBody"></div>
  </div>
</div>

<script>
  // ── DATA ──────────────────────────────────────────────────────────────────
  const guides = {
    llc: {
      title: '🏛️ LLC FORMATION GUIDE',
      color: '#3b82f6',
      steps: [
        { label: 'CHOOSE YOUR STATE', body: 'Most people form their LLC in the state they live and do business in. If you plan to operate nationally, Delaware and Wyoming are popular for favorable laws and privacy. <strong>For most small businesses — your home state is perfect.</strong>', tips: ['tip-blue:Most states charge $50-200 to file. Wyoming is $102 and has no state income tax.', 'tip-gold:Avoid expensive formation services like LegalZoom — file directly with your state SOS website for a fraction of the cost.'], link: null },
        { label: 'NAME YOUR LLC', body: 'Your LLC name must be unique in your state and end with "LLC" or "Limited Liability Company." Check availability on your state\'s Secretary of State website. <strong>Also check if the domain name is available</strong> — you want both.', tips: ['tip-green:Search your state SOS website for name availability — it\'s free.', 'tip-gold:Secure matching social media handles and domain name the same day you confirm availability.'], link: null },
        { label: 'FILE ARTICLES OF ORGANIZATION', body: 'This is the official document that creates your LLC. Filed with your state Secretary of State. Usually a simple one or two page form with your name, address, registered agent, and business purpose. <strong>Takes 1-4 weeks to process.</strong>', tips: ['tip-blue:Some states offer expedited processing for an extra fee if you need it fast.', 'tip-gold:Keep your certified copy — you\'ll need it to open a bank account.'], link: null },
        { label: 'GET A REGISTERED AGENT', body: 'A registered agent receives legal documents on behalf of your LLC. You can be your own registered agent (using your address) or use a service. <strong>If you work from home and want privacy, use a service.</strong>', tips: ['tip-green:Northwest Registered Agent offers $125/year and includes a free year with LLC formation.', 'tip-gold:Your registered agent address becomes public record — privacy matters here.'], link: null },
        { label: 'GET YOUR EIN FREE', body: 'Your EIN (Employer Identification Number) is like a Social Security Number for your business. <strong>Get it FREE directly from the IRS website</strong> — takes 10 minutes online. You\'ll need it for banking, taxes, and paying employees.', tips: ['tip-blue:Go to irs.gov and search "EIN Online Application" — it\'s completely free.', 'tip-gold:Never pay a service to get your EIN. It is always free directly from the IRS.'], link: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online' },
        { label: 'CREATE AN OPERATING AGREEMENT', body: 'Not always legally required but always recommended. This document defines how your LLC is run — ownership percentages, decision making, profit distribution, what happens if a member leaves. <strong>Protects you in court if there\'s ever a dispute.</strong>', tips: ['tip-gold:Free templates available at Rocket Lawyer, LegalTemplates.net, and SCORE.', 'tip-green:Single member LLC? Still make one — banks often require it.'], link: null },
        { label: 'OPEN A BUSINESS BANK ACCOUNT', body: 'Take your LLC documents, EIN, and ID to a bank. Open a dedicated business checking account. <strong>Never mix personal and business money</strong> — this is the most important step after formation.', tips: ['tip-blue:Mercury Bank and Relay offer free online business accounts. No branch needed.', 'tip-gold:Most traditional banks require an in-person visit with your Articles of Organization and EIN.'], link: null },
        { label: 'YOU\'RE IN BUSINESS!', body: 'Your LLC is active. Now get your first client, make your first dollar, and keep records of everything. Remember — maintain separation between personal and business finances at all times to keep your liability protection intact.', tips: ['tip-green:File an annual report with your state each year to keep your LLC in good standing. Fees vary by state.', 'tip-gold:Celebrate. You built a real business. Now go make it profitable.'], link: null }
      ]
    },
    sole: {
      title: '👤 SOLE PROPRIETORSHIP GUIDE',
      color: '#f59e0b',
      steps: [
        { label: 'DECIDE YOUR BUSINESS NAME', body: 'As a sole proprietor you can operate under your own legal name for free. To use a different business name you\'ll file a <strong>DBA (Doing Business As)</strong> — also called a fictitious business name — with your county for $10-50.', tips: ['tip-gold:Check your county clerk website for DBA filing. Most can be done online.', 'tip-green:A DBA lets you open a business bank account under your business name.'], link: null },
        { label: 'GET YOUR EIN (OPTIONAL BUT SMART)', body: 'Sole proprietors can use their Social Security Number for taxes — but getting a free EIN from the IRS protects your SSN and looks more professional on invoices and contracts.', tips: ['tip-blue:Takes 10 minutes at irs.gov — completely free.', 'tip-gold:Many clients and banks prefer an EIN over an SSN for obvious security reasons.'], link: 'https://www.irs.gov' },
        { label: 'SET UP YOUR FINANCES', body: 'Open a separate bank account for your business income and expenses even if it\'s just a personal account used only for business. <strong>Separation makes taxes simple</strong> and keeps your finances clear.', tips: ['tip-gold:Wave app is free and handles all your bookkeeping and invoicing.', 'tip-green:Track every business expense from day one — it all reduces your tax bill.'], link: null },
        { label: 'GET YOUR FIRST CLIENT', body: 'Tell everyone what you do. Post on social media. Email people you know. List yourself on Upwork, Fiverr, or LinkedIn. <strong>Your first client is closer than you think</strong> — start with your existing network.', tips: ['tip-gold:Offer a discounted rate for your first 2-3 clients in exchange for testimonials.', 'tip-green:One referral from a happy client beats 100 cold calls.'], link: null },
        { label: 'HANDLE YOUR TAXES', body: 'As a sole proprietor you\'ll file a <strong>Schedule C</strong> with your personal tax return. Set aside 25-30% of every payment for taxes. Pay quarterly estimated taxes to avoid penalties.', tips: ['tip-blue:IRS Form 1040-ES for quarterly payments — due April, June, September, January.', 'tip-gold:Every legitimate business expense reduces your taxable income. Keep all receipts.'], link: null },
        { label: 'CONSIDER UPGRADING TO LLC', body: 'A sole proprietorship has no liability protection — your personal assets are exposed if your business is sued. <strong>When your income becomes significant, form an LLC</strong> to protect yourself.', tips: ['tip-green:Most entrepreneurs start as sole proprietors and upgrade to LLC when they hit $30-50k annual revenue.', 'tip-gold:The cost of forming an LLC is almost always worth the protection it provides.'], link: null }
      ]
    },
    nonprofit: {
      title: '💚 NONPROFIT / .ORG GUIDE',
      color: '#10b981',
      steps: [
        { label: 'DEFINE YOUR MISSION', body: 'Your nonprofit\'s mission statement is everything. It must describe <strong>who you serve, what you do, and why.</strong> The IRS will evaluate whether your mission qualifies for tax-exempt status. Be specific and compelling.', tips: ['tip-green:Strong mission example: "To provide free legal resources and community support to unhoused individuals in [City]."', 'tip-gold:Vague missions get rejected. Specific missions get approved.'], link: null },
        { label: 'FORM YOUR BOARD OF DIRECTORS', body: 'A nonprofit requires a board of at least 3 directors who are NOT related to each other. They govern the organization and are legally responsible for its operations. <strong>Choose people who believe in your mission and bring skills you need.</strong>', tips: ['tip-blue:Board members serve as volunteers — they typically don\'t get paid.', 'tip-green:Look for members with legal, financial, marketing, and community expertise.'], link: null },
        { label: 'INCORPORATE AS A NONPROFIT', body: 'File nonprofit Articles of Incorporation with your state Secretary of State. This creates your legal entity before you apply for federal tax exemption. <strong>Filing fees range from $25-100 depending on your state.</strong>', tips: ['tip-gold:Include specific language required by the IRS in your articles — search "IRS nonprofit articles of incorporation language."', 'tip-green:Your state filing must come BEFORE your IRS application.'], link: null },
        { label: 'APPLY FOR 501(C)(3) STATUS', body: 'File IRS Form 1023 (full) or Form 1023-EZ (simplified for small orgs) to get federal tax-exempt status. <strong>This is what allows donors to deduct their contributions.</strong> Filing fee is $275 for 1023-EZ or $600 for full 1023.', tips: ['tip-blue:If your projected annual revenue is under $50,000 for 3 years you likely qualify for the simpler 1023-EZ.', 'tip-gold:Processing typically takes 3-6 months. Plan accordingly.'], link: 'https://www.irs.gov/charities-non-profits/applying-for-tax-exempt-status' },
        { label: 'GET YOUR EIN', body: 'Your nonprofit needs an EIN from the IRS before filing the 1023. Get it free at irs.gov. You\'ll also need it to open a bank account.', tips: ['tip-green:Free at irs.gov — takes 10 minutes.'], link: 'https://www.irs.gov' },
        { label: 'OPEN A NONPROFIT BANK ACCOUNT', body: 'Open a dedicated checking account in the organization\'s name. Many banks offer free nonprofit accounts. <strong>All organizational funds must be kept separate from personal finances — always.</strong>', tips: ['tip-gold:Bring your EIN, Articles of Incorporation, and board resolution to the bank.', 'tip-blue:Some credit unions offer excellent free nonprofit accounts.'], link: null },
        { label: 'REGISTER YOUR .ORG DOMAIN', body: 'Secure your .org domain — it signals legitimacy and trust to donors and partners. Register through Namecheap, Google Domains, or GoDaddy. <strong>.org domains cost around $10-15 per year.</strong>', tips: ['tip-green:Also grab your .com if it\'s available — redirect it to your .org.', 'tip-gold:Your domain name should match or closely match your organization name.'], link: null },
        { label: 'BUILD YOUR FUNDING STRATEGY', body: 'Nonprofits fund themselves through grants, individual donations, events, and earned income. <strong>Diversify from day one</strong> — never depend on a single funding source.', tips: ['tip-gold:Grants.gov lists federal grants. Foundation Directory Online lists private foundation grants.', 'tip-green:Small individual donors are more stable long-term than large single grants.', 'tip-blue:Candid.org has a free nonprofit starter kit with grant research tools.'], link: null }
      ]
    },
    ai: {
      title: '🤖 .AI DOMAIN BUSINESS GUIDE',
      color: '#8b5cf6',
      steps: [
        { label: 'DEFINE YOUR AI POSITIONING', body: 'A .ai domain works best when your business genuinely connects to intelligence, technology, or innovation. <strong>It signals cutting edge.</strong> Define what makes your product or service "intelligent" — automation, smart recommendations, AI-powered features, or simply forward-thinking branding.', tips: ['tip-blue:.ai domains are country code domains for Anguilla — but they\'re universally recognized as AI/tech branding.', 'tip-gold:Even non-AI businesses use .ai to signal innovation. Think Runway.ai, Copy.ai, Jasper.ai.'], link: null },
        { label: 'SECURE YOUR .AI DOMAIN', body: 'Register your .ai domain at Namecheap, Porkbun, or GoDaddy. <strong>.ai domains cost $60-100/year</strong> — more expensive than .com but worth it for the brand positioning. Check availability immediately — good .ai names go fast.', tips: ['tip-gold:Porkbun.com typically has the best .ai pricing — around $60-70/year.', 'tip-green:Short, memorable, one or two word .ai domains are most valuable. Keep it simple.'], link: 'https://porkbun.com' },
        { label: 'FORM YOUR BUSINESS ENTITY', body: 'For a .ai tech business an LLC is typically the right structure. It gives you liability protection and looks credible to investors and clients. <strong>Form it in your home state or Delaware/Wyoming</strong> for tech-friendly corporate law.', tips: ['tip-blue:Delaware is preferred by investors if you plan to raise funding eventually.', 'tip-gold:Wyoming LLC has strong privacy laws and low fees — popular for tech startups.'], link: null },
        { label: 'BUILD YOUR MINIMUM VIABLE PRODUCT', body: 'Start with the simplest version of your product that delivers real value. <strong>Don\'t build for months before launching</strong> — get something in front of real users as fast as possible and iterate based on feedback.', tips: ['tip-green:Netlify + GitHub = free hosting to launch your MVP like Canyon did with NEXUS.', 'tip-gold:Your first version doesn\'t have to be perfect. It has to be real.'], link: null },
        { label: 'SET UP PAYMENTS & PRICING', body: 'For a .ai SaaS business, consider subscription pricing (monthly/annual), usage-based pricing, or freemium with paid upgrades. <strong>Stripe handles all of this</strong> and integrates with almost any web platform.', tips: ['tip-blue:Stripe Atlas can also help you incorporate and set up banking if you want a US entity from abroad.', 'tip-gold:Start with simple pricing — one free tier and one paid tier. Complexity comes later.'], link: null },
        { label: 'MARKET YOUR .AI BRAND', body: 'Tech buyers live on Twitter/X, LinkedIn, Product Hunt, and Hacker News. Launch on Product Hunt for free exposure to thousands of tech early adopters. <strong>Your .ai domain is already a marketing asset</strong> — use it.', tips: ['tip-green:A successful Product Hunt launch can bring thousands of users overnight.', 'tip-gold:Build in public — share your journey on Twitter/X. Tech communities love authentic builder stories.'], link: null }
      ]
    },
    drop: {
      title: '📦 DROPSHIPPING GUIDE',
      color: '#06b6d4',
      steps: [
        { label: 'CHOOSE YOUR NICHE', body: 'Pick a product category you genuinely know and care about. <strong>Passion creates better product descriptions, better customer service, and better marketing.</strong> Avoid overly saturated niches like phone cases and generic t-shirts unless you have a very specific angle.', tips: ['tip-gold:Best niches: pet products, hobby gear, home improvement, niche fitness, specialty foods.', 'tip-green:Test niche viability with Google Trends before committing.'], link: null },
        { label: 'FIND YOUR SUPPLIERS', body: 'Use <strong>DSers, Spocket, or AliExpress</strong> for product sourcing. Spocket specializes in US and EU suppliers with faster shipping — a major competitive advantage. Always order samples before listing products in your store.', tips: ['tip-blue:Spocket suppliers ship in 3-5 days vs. 2-4 weeks from AliExpress — customers notice.', 'tip-gold:Always test shipping times and product quality before you start selling.'], link: 'https://spocket.co' },
        { label: 'BUILD YOUR STORE', body: 'Shopify is the industry standard for dropshipping. Plans start at $25/month. Connect your supplier via DSers or Spocket apps. <strong>Your store design matters</strong> — professional, fast, and mobile-optimized stores convert dramatically better.', tips: ['tip-gold:Use a free Shopify theme designed for conversions — Dawn and Refresh are excellent.', 'tip-green:Add trust badges, real photos, clear return policy, and fast shipping info prominently.'], link: 'https://shopify.com' },
        { label: 'SET YOUR PRICING', body: 'Typical dropshipping markup is 2-3x the supplier cost. Factor in: product cost + shipping + platform fees + marketing + your profit. <strong>If you can\'t make at least $15-20 profit per sale after all costs, reconsider the product.</strong>', tips: ['tip-blue:Use a pricing calculator: Supplier cost × 2.5 = starting price. Adjust based on competition.', 'tip-gold:Premium niches support higher margins. Cheap commodity products are a race to the bottom.'], link: null },
        { label: 'DRIVE TRAFFIC', body: 'Organic: TikTok, Instagram Reels, Pinterest. Paid: Facebook/Instagram ads, Google Shopping ads, TikTok ads. <strong>Start organic to test what resonates before spending on ads.</strong> One viral TikTok can generate thousands in sales.', tips: ['tip-green:TikTok organic reach is still enormous — a $0 video can outperform $1000 in ads.', 'tip-gold:When you do run paid ads, start with $5-10/day to test before scaling.'], link: null },
        { label: 'HANDLE CUSTOMER SERVICE', body: 'Fast, friendly responses are your competitive advantage against big retailers. <strong>Respond within 24 hours always.</strong> Set up a professional business email and use Tidio or Gorgias for customer chat.', tips: ['tip-blue:A clear, generous return policy reduces anxiety and increases conversions.', 'tip-green:Happy customers leave reviews. Reviews drive more sales. Encourage them.'], link: null },
        { label: 'SCALE WHAT WORKS', body: 'When you find a product and audience that converts — <strong>scale the marketing spend, add complementary products, and negotiate better pricing with your supplier.</strong> Most successful dropshippers focus on 3-5 winning products rather than hundreds.', tips: ['tip-gold:$1000/month profit with 5 products beats $100/month with 100 products every time.', 'tip-green:Consider moving winning products to private label once you have volume — higher margins, better brand.'], link: null }
      ]
    },
    freelance: {
      title: '💻 FREELANCE BUSINESS GUIDE',
      color: '#f43f5e',
      steps: [
        { label: 'IDENTIFY YOUR MARKETABLE SKILLS', body: 'What can you do that others will pay for? Writing, design, coding, video editing, social media, consulting, bookkeeping, translation, voice over — <strong>if you can do it, someone needs it done.</strong> List your top 3 skills.', tips: ['tip-gold:Don\'t underestimate "common" skills — solid writing, reliable communication, and meeting deadlines are rarer than you think.', 'tip-green:Pick the skill that intersects your ability with market demand and your enjoyment.'], link: null },
        { label: 'DEFINE YOUR SERVICES & RATES', body: 'Package your skills into clear service offerings with defined prices. <strong>Clients want to know exactly what they\'re buying.</strong> Research rates on Upwork and Fiverr for your skill level, then charge at or slightly above the median.', tips: ['tip-blue:Hourly rates for beginners: Writing $25-50/hr, Design $35-75/hr, Web Dev $50-100/hr, Consulting varies widely.', 'tip-gold:Raise your rates after every 5 completed projects until you start getting pushback. Then you\'ve found your market rate.'], link: null },
        { label: 'BUILD YOUR PORTFOLIO', body: 'If you have no paid work yet, create 3-5 sample projects that showcase your skills at their best. <strong>Quality over quantity always.</strong> A portfolio of 3 excellent pieces outperforms 20 mediocre ones.', tips: ['tip-green:Carrd.co builds clean portfolio sites for $19/year. GitHub Pages is free for developers.', 'tip-gold:Volunteer work, personal projects, and spec work all count. Use everything you have.'], link: null },
        { label: 'CREATE YOUR PROFILES', body: 'Set up profiles on Upwork, Fiverr, LinkedIn, and one platform where your ideal clients live. <strong>Complete profiles with professional photos get 10x more views.</strong> Write your bio to address client problems, not just list your skills.', tips: ['tip-blue:Upwork: best for long-term clients and high-value projects. Fiverr: best for defined packages and volume.', 'tip-gold:LinkedIn headline should describe the outcome you create, not your job title.'], link: null },
        { label: 'LAND YOUR FIRST CLIENT', body: 'Start with your existing network. Tell everyone what you do. Then apply to 10 Upwork jobs per day for 2 weeks. <strong>Your first client will be harder to get than your tenth</strong> — persistence here determines everything.', tips: ['tip-green:Personalize every proposal. Reference something specific about their project. Generic proposals get ignored.', 'tip-gold:Offer a small discovery call or sample task to reduce their risk. Make it easy to say yes.'], link: null },
        { label: 'DELIVER & OVER-DELIVER', body: '<strong>Your reputation is your business.</strong> Meet every deadline. Communicate proactively. Deliver slightly more than promised. Every satisfied client is a potential source of referrals and repeat business.', tips: ['tip-blue:Send project updates without being asked. Clients love transparency.', 'tip-gold:Ask for a testimonial immediately after delivery while their satisfaction is highest.'], link: null },
        { label: 'SYSTEMATIZE & SCALE', body: 'Create templates for proposals, contracts, onboarding, and delivery. <strong>Systems let you work on more clients without working more hours.</strong> When at capacity, raise rates instead of turning work down.', tips: ['tip-green:Dubsado and HoneyBook automate client management — proposals, contracts, invoicing in one place.', 'tip-gold:The goal is charging more per hour, not working more hours.'], link: null }
      ]
    }
  };

  let currentGuide = null;
  let stepProgress = {};

  // ── SECTION SWITCHING ─────────────────────────────────────────────────────
  function switchSec(name) {
    document.querySelectorAll('.sec-tab').forEach((t,i) => {
      const names = ['explore','steps','knowledge','resources','community'];
      t.classList.toggle('active', names[i] === name);
    });
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('sec-' + name).classList.add('active');
    window.scrollTo({top:document.querySelector('.sec-nav').offsetTop - 70, behavior:'smooth'});
  }

  // ── FILTER BIZ CARDS ─────────────────────────────────────────────────────
  function filterBiz(type) {
    document.querySelectorAll('.biz-pill').forEach(p => p.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.querySelectorAll('.biz-card').forEach(c => {
      c.style.display = (type === 'all' || c.dataset.type === type) ? 'block' : 'none';
    });
  }

  // ── LAUNCH GUIDE ─────────────────────────────────────────────────────────
  function launchGuide(type) {
    currentGuide = type;
    if (!stepProgress[type]) stepProgress[type] = {};
    const guide = guides[type];
    document.getElementById('guideTitle').textContent = guide.title;
    document.getElementById('guideTitle').style.color = guide.color;
    renderSteps(type);
    document.getElementById('guideSelector').style.display = 'none';
    document.getElementById('activeGuide').style.display = 'block';
    switchSec('steps');
  }

  function renderSteps(type) {
    const guide = guides[type];
    const list = document.getElementById('stepList');
    list.innerHTML = '';
    guide.steps.forEach((step, i) => {
      const done = stepProgress[type][i];
      const div = document.createElement('div');
      div.className = 'step-item';
      div.innerHTML = `
        ${i < guide.steps.length - 1 ? '<div class="step-line"></div>' : ''}
        <div class="step-left">
          <div class="step-num ${done ? 'done' : ''}" style="${!done ? 'border-color:' + guide.color + ';color:' + guide.color : ''}" onclick="markStep(${i})">${done ? '✓' : (i+1)}</div>
        </div>
        <div class="step-right">
          <div class="step-label" style="color:${guide.color}">${step.label}</div>
          <div class="step-body">${step.body}</div>
          ${step.tips.map(t => {
            const [cls, text] = t.split(':');
            return `<div class="step-tip ${cls}">💡 ${text}</div>`;
          }).join('')}
          ${step.link ? `<a href="${step.link}" target="_blank" class="step-link">→ OPEN RESOURCE</a>` : ''}
          <button class="step-check-btn ${done ? 'checked' : ''}" onclick="markStep(${i})">${done ? '✓ COMPLETED' : 'MARK COMPLETE'}</button>
        </div>
      `;
      list.appendChild(div);
    });
    updateProgress(type);
  }

  function markStep(i) {
    if (!stepProgress[currentGuide]) stepProgress[currentGuide] = {};
    stepProgress[currentGuide][i] = !stepProgress[currentGuide][i];
    renderSteps(currentGuide);
  }

  function updateProgress(type) {
    const total = guides[type].steps.length;
    const done = Object.values(stepProgress[type] || {}).filter(Boolean).length;
    const pct = Math.round((done / total) * 100);
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressPct').textContent = pct + '%';
  }

  function backToSelector() {
    document.getElementById('guideSelector').style.display = 'block';
    document.getElementById('activeGuide').style.display = 'none';
    currentGuide = null;
  }

  // ── KNOWLEDGE TOGGLE ──────────────────────────────────────────────────────
  function toggleKnow(el) {
    const was = el.classList.contains('open');
    document.querySelectorAll('.know-card').forEach(k => k.classList.remove('open'));
    if (!was) el.classList.add('open');
  }

  // ── MODAL ────────────────────────────────────────────────────────────────
  function openModal(id) { document.getElementById(id).classList.add('show'); }
  function closeModal(id) { document.getElementById(id).classList.remove('show'); }
  function closeOut(e, id) { if(e.target === document.getElementById(id)) closeModal(id); }

  // ── COMMUNITY ─────────────────────────────────────────────────────────────
  function sharePost() {
    const input = document.getElementById('shareInput');
    if (!input.value.trim()) return;
    const post = document.createElement('div');
    post.className = 'community-post';
    post.style.borderColor = 'rgba(245,158,11,0.3)';
    post.innerHTML = `
      <div class="post-header">
        <div class="post-author">YOU <span class="post-badge">NEW</span></div>
        <div class="post-time">Just now</div>
      </div>
      <div class="post-body">${input.value}</div>
      <div class="post-footer">
        <button class="post-like" onclick="likePost(this)">♥ 0</button>
        <span class="post-tag">COMMUNITY</span>
      </div>
    `;
    document.getElementById('postFeed').insertBefore(post, document.getElementById('postFeed').firstChild);
    input.value = '';
  }

  function likePost(btn) {
    const n = parseInt(btn.textContent.replace('♥ ',''));
    btn.textContent = '♥ ' + (n+1);
    btn.style.borderColor = 'var(--gold)';
    btn.style.color = 'var(--gold)';
    btn.disabled = true;
  }
</script>

</body>
</html>
