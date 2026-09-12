"""Build the static site: wraps every partial in _src/pages/ with the shared layout.

    python _src/build.py

Partials start with a one-line JSON meta comment:
    <!--meta {"title": "...", "desc": "...", "out": "solutions/odoo-erp.html", "nav": "solution"} -->
Tokens available inside partials and the layout:
    {{ROOT}}          relative prefix back to the site root ("" or "../")
    {{icon:name}}     inline SVG from site.ICONS
    {{YEAR}}          current year
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
META_RE = re.compile(r"^\s*<!--meta\s*(\{.*?\})\s*-->", re.S)


def icons(html: str) -> str:
    def rep(m):
        name = m.group(1)
        if name not in S.ICONS:
            raise KeyError(f"unknown icon {name!r}")
        return S.ICONS[name]
    return ICON_RE.sub(rep, html)


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
                f'<span class="mega-ic">{{{{icon:{l["icon"]}}}}}</span>'
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
    out = []
    for it in S.NAV:
        if "columns" not in it:
            out.append(f'<a class="mnav-top" href="{{{{ROOT}}}}{it["href"]}">{it["label"]}</a>')
            continue
        groups = []
        for col in it["columns"]:
            links = "".join(f'<a href="{{{{ROOT}}}}{l["href"]}">{l["label"]}</a>' for l in col["links"])
            groups.append(f'<div class="mnav-group"><div class="mnav-head">{col["title"]}</div>{links}</div>')
        out.append(f'<details class="mnav-sec"><summary>{it["label"]} {{{{icon:chevron}}}}</summary>{"".join(groups)}</details>')
    out.append('<a class="mnav-top" href="{{ROOT}}quotation.html">Get a quotation</a>')
    return "\n".join(out)


def talk_panel_html() -> str:
    c = S.COMPANY
    return f'''
<button class="talk-tab" type="button" data-talk-open aria-haspopup="dialog" aria-controls="talk-panel">
  <span>Let's Talk</span>
</button>
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
      <div class="field"><label for="tf-msg">Message</label><textarea id="tf-msg" name="message" rows="4" required placeholder=""></textarea></div>
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
</aside>'''


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
{HEAD_EXTRA}
<script type="application/ld+json">{JSONLD}</script>
</head>
<body class="{BODY_CLASS}">
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


APP_COLORS = {"finance": "#3167CA", "sales": "#1E9E7A", "websites": "#6C5CE7", "supply-chain": "#E0842B",
              "hr": "#D9508A", "marketing": "#A96B00", "services": "#2A9DB5", "productivity": "#5B6B8C"}


def apps_nav_html() -> str:
    out = []
    for c in S.APP_CATEGORIES:
        cls = ' class="is-focus"' if c.get("focus") else ""
        out.append(f'<a href="#{c["id"]}"{cls}>{{{{icon:{c["icon"]}}}}} {c["title"]} <span class="muted">{len(c["apps"])}</span></a>')
    return "\n".join(out)


def apps_cats_html() -> str:
    out = []
    for c in S.APP_CATEGORIES:
        color = APP_COLORS[c["id"]]
        cards = []
        for app in c["apps"]:
            name, desc = app[0], app[1]
            focus = len(app) > 2 and app[2]
            initials = "".join(w[0] for w in name.replace("—", " ").split() if w[0].isalnum())[:2]
            tag = ' <span class="tag">Focus</span>' if focus else ""
            cards.append(f'<div class="app{" is-focus" if focus else ""}" style="--c:{color}">'
                         f'<span class="app-tile">{initials}</span><div><b>{name}{tag}</b><small>{desc}</small></div></div>')
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


def build_page(path: Path, nav_cache: dict) -> str:
    raw = path.read_text(encoding="utf-8")
    m = META_RE.match(raw)
    if not m:
        raise ValueError(f"{path}: missing <!--meta {{...}} --> header")
    meta = json.loads(m.group(1))
    content = raw[m.end():].strip("\n")
    if "{{APPS_NAV}}" in content:
        content = content.replace("{{APPS_NAV}}", apps_nav_html()).replace("{{APPS_CATS}}", apps_cats_html())

    out_rel = meta["out"]
    depth = out_rel.count("/")
    root = "../" * depth
    active = meta.get("nav", "")
    if active not in nav_cache:
        nav_cache[active] = nav_html(active)

    canonical = S.SITE_URL + ("" if out_rel == "index.html" else out_rel)
    title = meta["title"] if meta["title"].endswith("TechNext") else f'{meta["title"]} · TechNext'
    scripts = "".join(f'<script src="{{ROOT}}{s}" defer></script>' for s in meta.get("scripts", []))

    html = LAYOUT.replace("{NAV}", nav_cache[active]).replace("{MNAV}", mobile_nav_html()).replace("{TALK}", talk_panel_html())
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
                .replace("{YEAR}", YEAR))
    # both brace styles are used: layout uses {ROOT}, partials/nav use {{ROOT}}
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
