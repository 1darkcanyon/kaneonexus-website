#!/usr/bin/env python3
"""Swaps the old directory list in your page for tiles. Usage: python3 apply-tiles.py index.html"""
import sys, re, shutil

path = sys.argv[1] if len(sys.argv) > 1 else "index.html"
html = open(path, encoding="utf-8").read()
if "nx-dir" in html:
    sys.exit("Tiles already applied. Nothing changed.")

CORE = [
 ("/probate/","📜","Probate Guide","Step-by-step estate & probate assistance"),
 ("/eiai/","🧠","EIAI Portal","Environmental & Intelligence AI workspace"),
 ("/family/","🏡","Family Portal","Family resources and index"),
 ("/luna-tic/","🌙","Luna-Tic","Emotional forecasting & lunar system"),
]
INFRA = [
 ("/nexus-console.html","⌨️","Console"),("/nexus-sovereign-core.html","👑","Sovereign Core"),
 ("/nexus-hero.html","⚡","Hero"),("/nexus-memoria.html","🗂️","Memoria"),
 ("/nexus-safeguard.html","🛡️","Safeguard"),("/nexus-safe-contact.html","🔐","Safe Contact"),
 ("/nexus-people-search.html","🔎","People Search"),("/nexus-property-tax.html","🏠","Property Tax"),
 ("/nexus-metals-ping.html","⛏️","Metals Ping"),("/nexus-ping.html","📡","Ping"),
 ("/nexus-phone.html","📞","Phone"),("/nexus-invoice.html","🧾","Invoice"),
]
DEMOS = [
 ("/guardian-shield.html","🔰","Guardian Shield"),("/narrative-animator.html","🎬","Narrative Animator"),
 ("/opensesame.html","🗝️","OpenSesame"),("/frequent-see.html","〰️","Frequent-See"),
]

def tile(h, i, n, d=None):
    desc = f'<span class="nx-desc">{d}</span>' if d else ""
    return f'<a class="nx-tile" href="{h}"><span class="nx-ico">{i}</span><span class="nx-txt"><span class="nx-name">{n}</span>{desc}</span></a>'

def group(title, cls, tiles):
    return f'<div class="nx-group"><h3>{title}</h3><div class="nx-grid {cls}">' + "".join(tiles) + "</div></div>"

section = ('<section class="nx-dir" id="directory">\n  <div class="section-header"><div class="eyebrow">// SYSTEM DIRECTORY</div>'
  '<h2 class="sec-title">NEXUS APPLICATIONS</h2></div>\n  '
  + group("Core Portals & Modules", "core", [tile(*c) for c in CORE]) + "\n  "
  + group("Infrastructure & Utilities", "infra", [tile(*c) for c in INFRA]) + "\n  "
  + group("Demos & Interactive Tools", "demos", [tile(*c) for c in DEMOS]) + "\n</section>")

CSS = """
<style>
/* NEXUS DIRECTORY TILES */
.nx-dir{max-width:1180px;margin:0 auto;padding:70px 32px}
.nx-group{margin-bottom:2.4rem}
.nx-group h3{font-family:'Orbitron',monospace;font-size:.6rem;letter-spacing:4px;text-transform:uppercase;color:var(--teal);display:flex;align-items:center;gap:14px;margin-bottom:1rem}
.nx-group h3::after{content:'';flex:1;height:1px;background:linear-gradient(to right,var(--border),transparent)}
.nx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
.nx-grid.core{grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.nx-tile{position:relative;display:flex;flex-direction:column;justify-content:space-between;gap:14px;min-height:110px;padding:16px;text-decoration:none;color:var(--text);background:linear-gradient(145deg,var(--card),var(--card2));border:1px solid var(--border-soft);border-radius:12px;overflow:hidden;transition:transform .25s,border-color .25s,box-shadow .25s;-webkit-tap-highlight-color:transparent}
.nx-tile::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--teal);opacity:.7}
.nx-tile:hover,.nx-tile:active{transform:translateY(-4px);border-color:var(--teal);box-shadow:0 10px 30px rgba(13,148,136,.18)}
.nx-ico{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;font-size:1.15rem;background:var(--teal-dim);border:1px solid var(--border);box-shadow:0 0 14px var(--teal-glow)}
.nx-name{display:block;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1rem;letter-spacing:1px;color:#fff;line-height:1.2}
.nx-desc{display:block;font-size:.82rem;line-height:1.4;color:rgba(200,216,232,.55);margin-top:4px}
.nx-grid.core .nx-tile{flex-direction:row;align-items:center;justify-content:flex-start;gap:14px;min-height:96px}
.nx-grid.core .nx-ico{width:48px;height:48px;font-size:1.4rem;flex:none}
.nx-grid.core .nx-name{font-size:1.1rem}
.nx-grid.demos .nx-tile::before{background:var(--gold)}
.nx-grid.demos .nx-ico{background:rgba(245,158,11,.08);border-color:rgba(245,158,11,.3);box-shadow:0 0 14px var(--gold-glow)}
.nx-grid.demos .nx-tile:hover{border-color:var(--gold);box-shadow:0 10px 30px var(--gold-glow)}
@media(max-width:600px){.nx-dir{padding:50px 16px}.nx-grid{grid-template-columns:repeat(2,1fr)}.nx-grid.core{grid-template-columns:1fr}}
</style>
"""

m = re.search(r'<section class="site-index">.*?</section>', html, re.S)
if not m:
    sys.exit('Could not find <section class="site-index">. Nothing changed.')
shutil.copy(path, path + ".bak")
html = html[:m.start()] + section + html[m.end():]
html = html.replace("</head>", CSS + "</head>", 1)
open(path, "w", encoding="utf-8").write(html)
print("Done. Backup saved as", path + ".bak")
