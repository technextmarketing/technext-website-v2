# TechNext Website v2

Production website for TechNext Pte. Ltd. — Odoo Ready Partner, Singapore.
Static HTML/CSS/JS, no framework, deployed to GitHub Pages.

**Live:** https://technextmarketing.github.io/technext-website-v2/

## Editing

Pages are written as partials in `_src/pages/` and wrapped with the shared header, mega menus,
Let's Talk panel and footer by the build script. Edit a partial, then rebuild:

```bash
python _src/build.py
```

The generated `.html` files at the repo root (and in `solutions/`, `industries/`, `odoo/`) are
what GitHub Pages serves — commit both the partial and the generated file.

| What | Where |
|---|---|
| Navigation tree, company details, Odoo app catalogue, icons | `_src/site.py` |
| Layout, header, mobile nav, Let's Talk panel, footer | `_src/build.py` |
| Design tokens and all styles | `assets/css/site.css` |
| Menus, panel, forms, reveals | `assets/js/site.js` |
| Home hero carousel (3 formats, 10 s), flow chart, pop-ups, background | `assets/js/hero.js` |
| Chat assistant knowledge base (intents, answers, chips) | `assets/js/chat.js` → `KB` |
| Quotation builder summary | `assets/js/quote.js` |
| One-time 5 s intro (motion-path plane, letter rise, typewriter), buttons, forms, reveals | `assets/js/site.js` |
| Official Odoo app icons (from download.odoocdn.com) | `assets/img/odoo/<module>.svg`, used as `{{odoo:module}}` |
| Favicons / OG image / intro logo split | `python _src/make_assets.py` |
| Static audit (links, SEO, headings, labels, claims) | `python _src/audit.py` — see `AUDIT.md` |

To replay the intro, open any page with `?intro=1` (or clear `localStorage.tn_intro_seen`).
Wordmark letter slices come from `python _src/make_assets.py --intro-only` (writes `assets/img/letters/` and `_src/letters.json`).

## Forms → sales@technext.asia

Both forms (Let's Talk panel, quotation builder) post to FormSubmit's AJAX endpoint for
`sales@technext.asia`. **The first real submission triggers a one-time activation email to that
inbox** — someone must click "Activate" once. Every submission after that is delivered as an
email with the fields in a table.

## Deploy

Push to `main`. `.github/workflows/deploy-pages.yml` publishes the repo root to GitHub Pages.

## Brand rules applied

- Brand blue is `#3167CA` (typed, never sampled). Bright surfaces only.
- Partner wording is **Odoo Ready Partner** (the badge held) — not "Certified".
- Approved figures only: 10+ countries, 11+ enterprise clients, 4 core AI disciplines.
  No founding year, no project counts, no ISO claims.
- Case studies are labelled placeholders until each client approves publication.
