"""Build the static site: wraps every partial in _src/pages/ with the shared layout.

    python _src/build.py

Partials start with a one-line JSON meta comment:
    <!--meta {"title": "...", "desc": "...", "out": "solutions/odoo-erp.html", "nav": "solution"} -->
Tokens available inside partials and the layout:
    {{ROOT}}            relative prefix back to the site root ("" or "../")
    {{icon:name}}       inline stroke SVG from sitedata.ICONS
    {{odoo:module}}     official Odoo app icon <img>, default 44px; {{odoo:module:28}} for 28px
    {{YEAR}}            current year
"""
import json
import os
import re
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))
import sitedata as S  # noqa: E402

SRC = Path(__file__).resolve().parent
ROOT = SRC.parent
PAGES = SRC / "pages"
YEAR = str(date.today().year)

ICON_RE = re.compile(r"\{\{icon:([a-z0-9_-]+)\}\}")
ODOO_RE = re.compile(r"\{\{odoo:([a-z0-9_]+)(?::(\d+))?\}\}")
META_RE = re.compile(r"^\s*<!--meta\s*(\{.*?\})\s*-->", re.S)
ODOO_DIR = ROOT / "assets" / "img" / "odoo"


def icons(html: str) -> str:
    def rep(m):
        name = m.group(1)
        if name not in S.ICONS:
            raise KeyError(f"unknown icon {name!r}")
        return S.ICONS[name]
    return ICON_RE.sub(rep, html)


def odoo_icons(html: str) -> str:
    """{{odoo:mod}} -> <img> pointing at the official Odoo app icon. Emits {{ROOT}} (resolved later)."""
    def rep(m):
        mod, size = m.group(1), m.group(2) or "44"
        if not (ODOO_DIR / f"{mod}.svg").exists():
            raise KeyError(f"missing Odoo icon assets/img/odoo/{mod}.svg")
        return (f'<img class="oi" src="{{{{ROOT}}}}assets/img/odoo/{mod}.svg" alt="" '
                f'width="{size}" height="{size}" loading="lazy" decoding="async">')
    return ODOO_RE.sub(rep, html)


def link_icon(l: dict, size: int = 28) -> str:
    if l.get("odoo"):
        return f'{{{{odoo:{l["odoo"]}:{size}}}}}'
    return f'{{{{icon:{l["icon"]}}}}}'


# ---------------------------------------------------------------- header
def nav_html(active: str) -> str:
    items = []
    for it in S.NAV:
        cls = "nav-item" + (" is-active" if it["id"] == active else "")
        if "columns" not in it:
            items.append(f'<li class="{cls}"><a class="nav-link" href="{{{{ROOT}}}}{it["href"]}">{it["label"]}</a></li>')
            continue
        cols = []
        for col in it["columns"]:
            head = col["title"]
            if col.get("href"):
                head = f'<a href="{{{{ROOT}}}}{col["href"]}">{col["title"]} {{{{icon:arrow}}}}</a>'
            links = "".join(
                f'<a class="mega-link" href="{{{{ROOT}}}}{l["href"]}">'
                f'<span class="mega-ic">{link_icon(l)}</span>'
                f'<span><b>{l["label"]}</b><small>{l["desc"]}</small></span></a>'
                for l in col["links"])
            wide = " mega-col--wide" if col.get("wide") else ""
            cols.append(f'<div class="mega-col{wide}"><div class="mega-head">{head}</div>{links}</div>')
        panel_id = f"mega-{it['id']}"
        items.append(
            f'<li class="{cls} has-mega">'
            f'<button class="nav-link" type="button" aria-expanded="false" aria-controls="{panel_id}">'
            f'{it["label"]} <span class="nav-chev">{{{{icon:chevron}}}}</span></button>'
            f'<div class="mega" id="{panel_id}" role="region" aria-label="{it["label"]} menu">'
            f'<div class="container mega-grid">{"".join(cols)}</div></div></li>')
    return "\n".join(items)


def mobile_nav_html() -> str:
    c = S.COMPANY
    out = []
    for it in S.NAV:
        if "columns" not in it:
            out.append(f'<a class="mnav-top" href="{{{{ROOT}}}}{it["href"]}">{it["label"]} {{{{icon:arrow}}}}</a>')
            continue
        groups = []
        for col in it["columns"]:
            links = "".join(
                f'<a href="{{{{ROOT}}}}{l["href"]}"><span class="mnav-ic">{link_icon(l, 24)}</span>{l["label"]}</a>'
                for l in col["links"])
            groups.append(f'<div class="mnav-group"><div class="mnav-head">{col["title"]}</div>{links}</div>')
        out.append(f'<details class="mnav-sec"><summary>{it["label"]} {{{{icon:chevron}}}}</summary>{"".join(groups)}</details>')
    out.append(f'''
<div class="mnav-cta">
  <a class="btn btn-primary btn-lg" href="{{{{ROOT}}}}quotation.html">Get a quotation {{{{icon:arrow}}}}</a>
  <a class="btn btn-ghost btn-lg" href="#talk">{{{{icon:send}}}} Let's talk</a>
  <button class="btn btn-ghost btn-lg" type="button" data-chat-open>{{{{icon:chat}}}} Chat with us</button>
</div>
<div class="mnav-contact">
  <a href="mailto:{c["sales_email"]}">{{{{icon:mail}}}} {c["sales_email"]}</a>
  <a href="{c["whatsapp_link"]}" target="_blank" rel="noopener">{{{{icon:whatsapp}}}} {c["whatsapp"]}</a>
  <span>{{{{icon:pin}}}} {c["hubs"]}</span>
</div>''')
    return "\n".join(out)


def talk_panel_html() -> str:
    c = S.COMPANY
    return f'''
<div class="side-tabs">
  <button class="side-tab talk-tab" type="button" data-talk-open aria-haspopup="dialog" aria-controls="talk-panel">
    {{{{icon:send}}}}<span>Let's Talk</span>
  </button>
  <button class="side-tab chat-tab" type="button" data-chat-open aria-haspopup="dialog" aria-controls="chat-win">
    {{{{icon:chat}}}}<span>Chat with us</span>
  </button>
</div>
<div class="talk-overlay" data-talk-close hidden></div>
<aside class="talk-panel" id="talk-panel" role="dialog" aria-modal="true" aria-labelledby="talk-title" hidden>
  <div class="talk-head">
    <img src="{{{{ROOT}}}}assets/img/logo-horizontal.png" alt="TechNext" width="140" height="28">
    <button class="icon-btn" type="button" data-talk-close aria-label="Close">{{{{icon:x}}}}</button>
  </div>
  <div class="talk-body">
    <p class="hand">let's talk</p>
    <h2 id="talk-title">Tell us what slows you down.</h2>
    <p class="talk-lead">We reply from <a href="mailto:{c["sales_email"]}">{c["sales_email"]}</a>. Prefer to chat?
      <a href="{c["whatsapp_link"]}" target="_blank" rel="noopener">WhatsApp {c["whatsapp"]}</a>.</p>

    <form class="form" id="talk-form" novalidate data-endpoint="{S.FORM_ENDPOINT}">
      <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <input type="hidden" name="_subject" value="New inquiry — technext.asia">
      <input type="hidden" name="_template" value="table">
      <input type="hidden" name="_captcha" value="false">
      <input type="hidden" name="source" value="Let's Talk panel">
      <div class="form-row">
        <div class="field"><label for="tf-name">Name</label><input id="tf-name" name="name" type="text" required autocomplete="name"></div>
        <div class="field"><label for="tf-company">Company</label><input id="tf-company" name="company" type="text" autocomplete="organization"></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="tf-email">Work email</label><input id="tf-email" name="email" type="email" required autocomplete="email"></div>
        <div class="field"><label for="tf-phone">Phone <span class="opt">optional</span></label><input id="tf-phone" name="phone" type="tel" autocomplete="tel"></div>
      </div>
      <div class="field">
        <label for="tf-topic">I'm interested in</label>
        <select id="tf-topic" name="topic" required>
          <option value="">Choose one</option>
          <option>Odoo Accounting</option>
          <option>Odoo Sales &amp; CRM</option>
          <option>Odoo Inventory</option>
          <option>Full Odoo ERP implementation</option>
          <option>Odoo training or support</option>
          <option>Website</option>
          <option>Social media management</option>
          <option>Something else</option>
        </select>
      </div>
      <div class="field"><label for="tf-msg">Message</label><textarea id="tf-msg" name="message" rows="4" required></textarea></div>
      <div class="form-foot">
        <button class="btn btn-primary" type="submit"><span class="btn-label">Send inquiry</span><span class="btn-busy" aria-hidden="true"></span></button>
        <a class="btn-link" href="{{{{ROOT}}}}quotation.html">Need a written quotation? {{{{icon:arrow}}}}</a>
      </div>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
  </div>
  <div class="talk-foot">
    <span>{{{{icon:pin}}}} {c["hubs"]}</span>
  </div>
</aside>

<section class="chat" id="chat-win" role="dialog" aria-modal="false" aria-labelledby="chat-title" hidden>
  <header class="chat-head">
    <span class="chat-avatar">{{{{icon:bot}}}}</span>
    <div><b id="chat-title">TechNext assistant</b><small>Answers instantly · hands off to sales@technext.asia</small></div>
    <button class="icon-btn icon-btn--sm" type="button" data-chat-close aria-label="Close chat">{{{{icon:x}}}}</button>
  </header>
  <div class="chat-log" data-chat-log aria-live="polite" aria-relevant="additions"></div>
  <div class="chat-chips" data-chat-chips></div>
  <form class="chat-input" data-chat-form>
    <label class="skip" for="chat-text">Type your question</label>
    <input id="chat-text" type="text" autocomplete="off" placeholder="Ask about Accounting, Sales, Inventory…" maxlength="300">
    <button class="btn btn-primary chat-send" type="submit" aria-label="Send">{{{{icon:send}}}}</button>
  </form>
</section>'''


LAYOUT = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{TITLE}</title>
<meta name="description" content="{DESC}">
<link rel="canonical" href="{CANONICAL}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="TechNext">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{DESC}">
<meta property="og:url" content="{CANONICAL}">
<meta property="og:image" content="{SITE_URL}assets/img/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#3167CA">
<link rel="icon" type="image/png" sizes="32x32" href="{ROOT}assets/img/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="{ROOT}assets/img/favicon-192.png">
<link rel="apple-touch-icon" href="{ROOT}assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Caveat:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{ROOT}assets/css/site.css">
<style>#intro{display:none}html.intro #intro{display:grid}</style>
<script>(function(){try{var force=/[?&]intro=1(&|$)/.test(location.search);var seen=false;try{seen=!!localStorage.getItem('tn_intro_seen');}catch(e){}if(!seen)seen=/(^|; )tn_intro_seen=1/.test(document.cookie);if((force||!seen)&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('intro');}}catch(e){}})();</script>
{HEAD_EXTRA}
<script type="application/ld+json">{JSONLD}</script>
</head>
<body class="{BODY_CLASS}">
<div class="intro" id="intro" aria-hidden="true" data-tagline="Odoo Ready Partner · Singapore">
  <div class="intro-bg"></div>
  <div class="intro-bloom"></div>
  <canvas class="intro-particles"></canvas>
  <svg class="intro-trail-svg" aria-hidden="true"><defs><linearGradient id="introGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6FA0F5" stop-opacity="0"/><stop offset=".6" stop-color="#6FA0F5"/><stop offset="1" stop-color="#3167CA"/></linearGradient></defs><path d=""/></svg>
  <div class="intro-stage">
    <div class="intro-plane-wrap">
      <span class="intro-ripple"></span><span class="intro-ripple"></span>
      <img class="intro-plane" src="{ROOT}assets/img/logo-plane.png" alt="" width="160" height="136" decoding="sync">
    </div>
    <span class="intro-word" style="aspect-ratio:{LETTERS_W}/{LETTERS_H}">{LETTERS}</span>
  </div>
  <span class="intro-sub" aria-hidden="true"></span>
  <span class="intro-pills" aria-hidden="true">
    <span class="intro-pill" style="--i:0">{{odoo:accountant:18}}Accounting</span>
    <span class="intro-pill" style="--i:1">{{odoo:sale:18}}Sales</span>
    <span class="intro-pill" style="--i:2">{{odoo:stock:18}}Inventory</span>
  </span>
  <span class="intro-shine" aria-hidden="true"></span>
  <span class="intro-shine intro-shine--2" aria-hidden="true"></span>
  <span class="intro-progress" aria-hidden="true"></span>
  <button class="intro-skip" type="button">Skip</button>
</div>
<a class="skip" href="#main">Skip to content</a>

<header class="header" data-header>
  <div class="container header-inner">
    <a class="brand" href="{ROOT}index.html" aria-label="TechNext — home">
      <img src="{ROOT}assets/img/logo-horizontal.png" alt="TechNext" width="170" height="34">
    </a>
    <nav class="nav" aria-label="Primary">
      <ul class="nav-list">
{NAV}
      </ul>
    </nav>
    <button class="icon-btn menu-btn" type="button" data-mnav-open aria-label="Open menu" aria-expanded="false" aria-controls="mnav">{{icon:menu}}</button>
  </div>
</header>

<div class="mnav-overlay" data-mnav-close hidden></div>
<nav class="mnav" id="mnav" aria-label="Mobile" hidden>
  <div class="mnav-top-bar">
    <img src="{ROOT}assets/img/logo-horizontal.png" alt="TechNext" width="140" height="28">
    <button class="icon-btn" type="button" data-mnav-close aria-label="Close menu">{{icon:x}}</button>
  </div>
{MNAV}
</nav>

<main id="main">
{CONTENT}
</main>

<footer class="footer">
  <div class="container footer-inner">
    <span>© {YEAR} {LEGAL}</span>
    <nav aria-label="Legal"><a href="{ROOT}privacy.html">Privacy Policy</a><a href="{ROOT}terms.html">Terms of Service</a></nav>
  </div>
</footer>

{TALK}

<script src="{ROOT}assets/js/site.js" defer></script>
<script src="{ROOT}assets/js/chat.js" defer></script>
{SCRIPTS}
</body>
</html>
'''


def jsonld(canonical: str) -> str:
    c = S.COMPANY
    data = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": c["legal"],
        "alternateName": "TechNext",
        "url": S.SITE_URL,
        "email": c["sales_email"],
        "telephone": c["whatsapp"],
        "address": {"@type": "PostalAddress", "streetAddress": c["address"][0],
                    "addressLocality": "Singapore", "postalCode": "180261", "addressCountry": "SG"},
        "sameAs": [c["linkedin"]],
        "knowsAbout": ["Odoo ERP", "Odoo Accounting", "Odoo Sales", "Odoo Inventory", "Website design", "Social media management"],
    }
    return json.dumps(data, ensure_ascii=False)


# ---------------------------------------------------------------- generated blocks
def apps_nav_html() -> str:
    out = []
    for c in S.APP_CATEGORIES:
        cls = ' class="is-focus"' if c.get("focus") else ""
        out.append(f'<a href="#{c["id"]}"{cls}>{{{{icon:{c["icon"]}}}}} {c["title"]} <span class="muted">{len(c["apps"])}</span></a>')
    return "\n".join(out)


def apps_cats_html() -> str:
    out = []
    for c in S.APP_CATEGORIES:
        cards = []
        for app in c["apps"]:
            tag = ' <span class="tag">Focus</span>' if app["focus"] else ""
            cards.append(f'<div class="app{" is-focus" if app["focus"] else ""}" data-app="{app["mod"]}">'
                         f'{{{{odoo:{app["mod"]}:40}}}}<div><b>{app["name"]}{tag}</b><small>{app["desc"]}</small></div></div>')
        focus_note = (' <span class="tag tag--ok">{{icon:check}} Our focus area</span>' if c.get("focus") else "")
        out.append(f'''<section class="apps-cat" id="{c["id"]}">
  <div class="container">
    <div class="apps-cat-head">
      <h2><span class="card-ic">{{{{icon:{c["icon"]}}}}}</span>{c["title"]}{focus_note}</h2>
      <p>{len(c["apps"])} apps</p>
    </div>
    <div class="apps-grid">{"".join(cards)}</div>
  </div>
</section>''')
    return "\n".join(out)


def marquee_html() -> str:
    names = {a["mod"]: a["name"] for c in S.APP_CATEGORIES for a in c["apps"]}
    items = "".join(f'<span class="mq-item">{{{{odoo:{m}:26}}}}{names.get(m, m)}</span>' for m in S.MARQUEE)
    return f'<div class="mq-track">{items}</div><div class="mq-track" aria-hidden="true">{items}</div>'


def letters_html() -> tuple:
    """Wordmark slices for the intro (see make_assets.split_letters)."""
    meta_path = SRC / "letters.json"
    if not meta_path.exists():
        return ('<img class="intro-letter" style="left:0;width:100%;--i:0" src="{ROOT}assets/img/logo-text.png" alt="" decoding="sync">', 763, 132)
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    imgs = "".join(
        f'<img class="intro-letter" style="left:{l["x"]*100:.2f}%;width:{l["w"]*100:.2f}%;--i:{i}" '
        f'src="{{ROOT}}assets/img/letters/l{i}.png" alt="" decoding="sync">'
        for i, l in enumerate(meta["letters"]))
    return imgs, meta["w"], meta["h"]


def build_page(path: Path, nav_cache: dict) -> str:
    raw = path.read_text(encoding="utf-8")
    m = META_RE.match(raw)
    if not m:
        raise ValueError(f"{path}: missing <!--meta {{...}} --> header")
    meta = json.loads(m.group(1))
    content = raw[m.end():].strip("\n")
    if "{{APPS_NAV}}" in content:
        content = content.replace("{{APPS_NAV}}", apps_nav_html()).replace("{{APPS_CATS}}", apps_cats_html())
    if "{{MARQUEE}}" in content:
        content = content.replace("{{MARQUEE}}", marquee_html())

    out_rel = meta["out"]
    depth = out_rel.count("/")
    root = "../" * depth
    active = meta.get("nav", "")
    if active not in nav_cache:
        nav_cache[active] = nav_html(active)

    canonical = S.SITE_URL + ("" if out_rel == "index.html" else out_rel)
    title = meta["title"] if meta["title"].endswith("TechNext") else f'{meta["title"]} · TechNext'
    scripts = "".join(f'<script src="{{ROOT}}{s}" defer></script>' for s in meta.get("scripts", []))

    letters, lw, lh = letters_html()
    html = (LAYOUT.replace("{NAV}", nav_cache[active]).replace("{MNAV}", mobile_nav_html()).replace("{TALK}", talk_panel_html())
                  .replace("{LETTERS}", letters).replace("{LETTERS_W}", str(lw)).replace("{LETTERS_H}", str(lh)))
    html = (html.replace("{TITLE}", title)
                .replace("{DESC}", meta.get("desc", S.DEFAULT_DESC).replace('"', "&quot;"))
                .replace("{CANONICAL}", canonical)
                .replace("{SITE_URL}", S.SITE_URL)
                .replace("{BODY_CLASS}", meta.get("body", ""))
                .replace("{HEAD_EXTRA}", meta.get("head", ""))
                .replace("{JSONLD}", jsonld(canonical))
                .replace("{CONTENT}", content)
                .replace("{LEGAL}", S.COMPANY["legal"])
                .replace("{SCRIPTS}", scripts)
                .replace("{{YEAR}}", YEAR).replace("{YEAR}", YEAR))
    html = odoo_icons(html)            # emits {{ROOT}}-prefixed <img> tags
    html = html.replace("{{ROOT}}", root).replace("{ROOT}", root)
    html = icons(html)

    target = ROOT / out_rel
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html, encoding="utf-8", newline="\n")
    return out_rel


def write_sitemap(pages):
    urls = []
    for p in sorted(pages):
        if p in ("404.html",):
            continue
        loc = S.SITE_URL + ("" if p == "index.html" else p)
        urls.append(f"  <url><loc>{loc}</loc><lastmod>{date.today().isoformat()}</lastmod></url>")
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls) + "\n</urlset>\n", encoding="utf-8")


def main():
    nav_cache = {}
    built = []
    for path in sorted(PAGES.rglob("*.html")):
        built.append(build_page(path, nav_cache))
    write_sitemap(built)
    print(f"built {len(built)} pages -> {ROOT}")
    for b in built:
        print("  ", b)


if __name__ == "__main__":
    main()
