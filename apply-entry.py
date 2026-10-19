#!/usr/bin/env python3
"""Adds the NEXUS hero entry screen on top of your index. Usage: python3 apply-entry.py index.html"""
import sys, re, shutil

path = sys.argv[1] if len(sys.argv) > 1 else "index.html"
html = open(path, encoding="utf-8").read()
if "ent-overlay" in html:
    sys.exit("Entry screen already added. Nothing changed.")

VIDEO = "nexus-hero/Nexusstart.mp4"

FONT = '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap" rel="stylesheet">\n'

CSS = """<style>
/* NEXUS HERO ENTRY */
body.ent-lock{overflow:hidden}
.ent-overlay{position:fixed;inset:0;z-index:9000;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:none;transition:transform 1.3s cubic-bezier(.77,0,.18,1),opacity 1.3s ease}
.ent-overlay.leave{transform:translateY(-100%);opacity:0;pointer-events:none}
.ent-overlay video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 2s ease}
.ent-overlay video.loaded{opacity:1}
.ent-vig{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 30%,rgba(0,0,0,.55) 80%,rgba(0,0,0,.85) 100%);pointer-events:none}
.ent-scan{position:absolute;inset:0;background:repeating-linear-gradient(to bottom,transparent,transparent 2px,rgba(0,0,0,.03) 2px,rgba(0,0,0,.03) 4px);pointer-events:none}
.ent-content{position:relative;z-index:10;text-align:center;display:flex;flex-direction:column;align-items:center}
.ent-eyebrow{font-family:'Rajdhani',sans-serif;font-weight:300;font-size:clamp(.65rem,1.5vw,.85rem);letter-spacing:.45em;color:#00e5ff;text-transform:uppercase;margin-bottom:1.2rem;opacity:0;transform:translateY(12px);animation:entUp 1.2s ease .8s forwards}
.ent-wordmark{font-family:'Cinzel',serif;font-weight:900;font-size:clamp(4rem,14vw,11rem);line-height:.9;letter-spacing:.12em;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.15);background:linear-gradient(135deg,#fff 0%,#00e5ff 30%,#cc00ff 60%,#fff 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;position:relative;opacity:0;transform:translateY(20px) scale(.96);animation:entUp 1.4s cubic-bezier(.16,1,.3,1) .3s forwards}
.ent-wordmark::after{content:attr(data-text);position:absolute;inset:0;font:inherit;letter-spacing:inherit;line-height:inherit;color:transparent;-webkit-text-stroke:0;filter:blur(28px);background:linear-gradient(135deg,#00e5ff,#cc00ff);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;opacity:.5;pointer-events:none}
.ent-sub{font-family:'Rajdhani',sans-serif;font-weight:300;font-size:clamp(.7rem,1.8vw,1rem);letter-spacing:.35em;color:rgba(255,255,255,.45);text-transform:uppercase;margin:1rem 0 3.5rem;opacity:0;transform:translateY(10px);animation:entUp 1.2s ease 1.2s forwards}
.ent-btn{position:relative;font-family:'Rajdhani',sans-serif;font-weight:600;font-size:clamp(.75rem,1.6vw,.9rem);letter-spacing:.4em;text-transform:uppercase;color:#00e5ff;padding:1rem 3rem;border:1px solid rgba(0,229,255,.35);background:rgba(0,229,255,.04);cursor:none;overflow:hidden;opacity:0;transform:translateY(10px);animation:entUp 1.2s ease 1.6s forwards;transition:color .4s,border-color .4s,background .4s}
.ent-btn::before,.ent-btn::after{content:'';position:absolute;width:8px;height:8px;border:0 solid #cc00ff;transition:width .4s,height .4s,opacity .4s;opacity:.7}
.ent-btn::before{top:-1px;left:-1px;border-width:1px 0 0 1px}
.ent-btn::after{bottom:-1px;right:-1px;border-width:0 1px 1px 0}
.ent-btn i{position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,229,255,.08),rgba(204,0,255,.08));transform:translateX(-101%);transition:transform .5s cubic-bezier(.16,1,.3,1)}
.ent-btn:hover,.ent-btn:active{color:#fff;border-color:rgba(204,0,255,.6);background:transparent}
.ent-btn:hover i,.ent-btn:active i{transform:translateX(0)}
.ent-btn:hover::before,.ent-btn:hover::after{width:14px;height:14px;opacity:1}
.ent-btn span{position:relative;z-index:1}
.ent-sigil{position:absolute;bottom:2.5rem;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:1.2rem;opacity:0;animation:entUp 1s ease 2.2s forwards;z-index:10}
.ent-sigil::before,.ent-sigil::after{content:'';width:60px;height:1px;background:linear-gradient(to right,transparent,rgba(0,229,255,.4))}
.ent-sigil::after{background:linear-gradient(to left,transparent,rgba(0,229,255,.4))}
.ent-sigil span{font-family:'Rajdhani',sans-serif;font-size:.6rem;letter-spacing:.4em;color:rgba(0,229,255,.35);text-transform:uppercase;white-space:nowrap}
.ent-ring{position:absolute;width:320px;height:320px;border-radius:50%;border:1px solid rgba(204,0,255,.12);animation:entPulse 4s ease-in-out infinite;pointer-events:none}
.ent-ring:nth-of-type(2){animation-delay:1.3s;width:480px;height:480px;border-color:rgba(0,229,255,.07)}
.ent-ring:nth-of-type(3){animation-delay:2.6s;width:640px;height:640px;border-color:rgba(204,0,255,.05)}
.ent-cur,.ent-curring{position:fixed;border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%)}
.ent-cur{width:10px;height:10px;background:#00e5ff;box-shadow:0 0 12px #00e5ff,0 0 24px #00e5ff}
.ent-curring{width:36px;height:36px;border:1px solid rgba(0,229,255,.4);transition:width .3s,height .3s,border-color .3s}
@media(hover:none){.ent-cur,.ent-curring{display:none}.ent-overlay,.ent-btn{cursor:auto}}
@media(max-width:600px){.ent-ring{display:none}.ent-sub{letter-spacing:.2em}.ent-btn{padding:.9rem 2.2rem}}
@keyframes entUp{to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes entPulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.06);opacity:.2}}
</style>
"""

MARKUP = """
<div class="ent-overlay" id="entOverlay">
  <video id="entVid" src="%s" autoplay muted loop playsinline preload="auto"></video>
  <div class="ent-vig"></div><div class="ent-scan"></div>
  <div class="ent-ring"></div><div class="ent-ring"></div><div class="ent-ring"></div>
  <div class="ent-content">
    <p class="ent-eyebrow">Integrated Intelligence Solutions</p>
    <h1 class="ent-wordmark" data-text="NEXUS">NEXUS</h1>
    <p class="ent-sub">Perception &nbsp;·&nbsp; Protection &nbsp;·&nbsp; Presence</p>
    <button class="ent-btn" id="entBtn" type="button"><i></i><span>Enter</span></button>
  </div>
  <div class="ent-sigil"><span>kaneonexus.net</span></div>
</div>
<div class="ent-cur" id="entCur"></div><div class="ent-curring" id="entRing"></div>
<script>
(function(){
  var ov=document.getElementById('entOverlay');
  var seen=false; try{seen=sessionStorage.getItem('nexusEntered')==='1'&&location.search.indexOf('intro')<0;}catch(e){}
  var cur=document.getElementById('entCur'),ring=document.getElementById('entRing');
  if(seen){ov.remove();cur.remove();ring.remove();return;}
  document.body.classList.add('ent-lock');
  var v=document.getElementById('entVid');
  v.addEventListener('canplay',function(){v.classList.add('loaded');});
  if(v.readyState>=3)v.classList.add('loaded');
  var mx=0,my=0,rx=0,ry=0,run=true;
  document.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
  (function loop(){if(!run)return;rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop);})();
  var b=document.getElementById('entBtn');
  b.addEventListener('mouseenter',function(){ring.style.width=ring.style.height='56px';ring.style.borderColor='rgba(204,0,255,.6)';cur.style.background='#cc00ff';});
  b.addEventListener('mouseleave',function(){ring.style.width=ring.style.height='36px';ring.style.borderColor='rgba(0,229,255,.4)';cur.style.background='#00e5ff';});
  b.addEventListener('click',function(){
    try{sessionStorage.setItem('nexusEntered','1');}catch(e){}
    ov.classList.add('leave');
    document.body.classList.remove('ent-lock');
    setTimeout(function(){run=false;ov.remove();cur.remove();ring.remove();},1400);
  });
})();
</script>
""" % VIDEO

m = re.search(r"<body[^>]*>", html)
if not m or "</head>" not in html:
    sys.exit("Could not find <body> or </head>. Nothing changed.")
shutil.copy(path, path + ".bak")
html = html.replace("</head>", FONT + CSS + "</head>", 1)
m = re.search(r"<body[^>]*>", html)
html = html[:m.end()] + MARKUP + html[m.end():]
open(path, "w", encoding="utf-8").write(html)
print("Done. Backup saved as", path + ".bak")
