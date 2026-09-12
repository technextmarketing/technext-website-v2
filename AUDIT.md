# TechNext Website v2 — audit

Audit of the production site at https://technextmarketing.github.io/technext-website-v2/
after the round-2 build (official Odoo icons, interactive hero, chatbot, intro, mobile refinement).
Date: 12 September 2026. Re-run the static half any time with `python _src/audit.py`.

## Scope

| Area | Method | Result |
|---|---|---|
| Links & assets | `_src/audit.py` — every `href`/`src` in 23 pages resolved on disk (2,054 refs, 1,002 of them Odoo icons) | 0 broken |
| Template tokens | scan for unresolved `{{…}}` | 0 leftover |
| SEO | title 30–75 chars, description 50–170 chars, canonical, og:* ×5, JSON-LD ProfessionalService, sitemap, robots | all 23 pages pass |
| Headings | exactly one `<h1>`, no level skips | all 23 pages pass (fixed: 3× h1 on home, h1→h3 skips on 5 pages) |
| Accessibility (static) | `alt` on every image, every input labelled, every button named, `lang`, skip link, `noopener` on `_blank` | pass |
| Brand claims | no "Certified Odoo Partner", no ISO 27001 "certified/compliant", only approved figures | pass |
| Runtime | Browser pane at 1400×900 and 390×844: console errors, network 4xx, interactions | 0 errors, all 200 |
| Visual | headless Chrome full-page capture of all 23 pages, reviewed as contact sheets | consistent; no clipping/overlap |
| Deploy | GitHub Actions → Pages; live smoke on `/`, CSS, JS, Odoo SVG, intro PNGs | 200 |

## Sections & showcase (home)

1. **Intro** — first visit only, 5 s: ~90 particles converge (0–1.5 s); the plane flies one cubic-Bézier motion
   path (`offset-path`, nose on the tangent, lands level) while a trail draws along the same curve (0.15–2.15 s);
   the wordmark rises letter by letter from slices of the logo PNG (1.05–2.3 s); landing ripples (2.15/2.4 s);
   glow bloom (2.2 s); tagline types on (3.4 s); shine (4.15 s); progress line; fade into the hero camera
   entrance at 5.0 s. Click/Esc/Enter skips. Stored in `localStorage.tn_intro_seen`; `?intro=1` replays it;
   skipped entirely under `prefers-reduced-motion`.
2. **Hero carousel** (desktop, 10 s per slide, pauses on hover/focus/hidden tab, ← → keys, swipe). Every
   switch is a ~3 s camera move: the leaving slide exits with its own style (spin-away · fly-past · tilt-fall)
   while the arriving slide comes in with a 360° orbit-zoom, spiral or tumble (blur clears as it lands); the
   background breathes in step and the inner reveals wait for the camera. The first slide also arrives this
   way once the intro has finished. Not used below 960 px or under `prefers-reduced-motion`.
   - Slide 1 — word-by-word headline rise, rotating word (*accounts · sales · stock · purchasing · invoicing*),
     liquid-glass Odoo dashboard with count-up KPIs, spring-grown chart, cycling toasts, four parallax
     Odoo app icons (click → pop-up), clickable Accounting/Sales/Inventory strip.
   - Slide 2 — order-to-cash flow chart: 6 nodes with official icons, connectors drawn by JS, a pulse that
     travels the main path and lights each node, labelled edges, dashed reorder branch. Click any node →
     pop-up zooms out of that node (WAAPI), prev/next through the steps, cross-links to app pop-ups.
   - Slide 3 — two counter-rotating rings of Odoo apps around the Ready Partner badge; hover pauses and
     shows labels; click → app pop-up.
   - **3D tilt stage** — the whole active slide (copy, cards, nodes, labels, rings) rotates toward the cursor
     in any direction (±8° X, ±12° Y, eased) on a 1300 px perspective; layers sit at their own depth
     (copy 40 · dashboard 60 · floaters 60–140 · toasts 150 · flow nodes 28–133 · edge labels 100 ·
     orbit rings 20/80 · partner badge 150) so the tilt shows the layering. Fine pointers only.
   - Shared background: three drifting aurora blobs, dot grid with radial mask, cursor spotlight, particle
     field with proximity links (canvas, paused when the tab is hidden).
   - Marquee strip of 20 Odoo apps along the bottom edge; pauses on hover.
3. **Trust strip** — Ready Partner badge + the three approved figures.
4. **Focus trio** — Accounting / Sales / Inventory cards; icon click opens the app pop-up.
5. **Walkthrough** — four outlined step numbers (fill on hover), connector line on desktop.
6. **Solutions · Industries · Apps preview · Case studies (placeholders) · CTA band.**

Below 960 px the carousel is replaced by one static hero (headline, copy, CTAs, three tappable app cards);
canvas and spotlight are not created; the marquee stays. Pop-ups open as a bottom sheet.

## Interactions verified

- Mega menus (Solution / Industries / Odoo) open on click, close on outside click / Esc.
- Mobile drawer: accordions with Odoo icons, CTA pair, email/WhatsApp/location; closes on any link.
- **Let's Talk** side tab → slide-in panel, focus-trapped form → FormSubmit → success state.
- **Chat with us** side tab (under Let's Talk) → guided assistant: 15 intents with keyword matching, quick-reply
  chips, typing indicator, action buttons (quotation, inquiry form, WhatsApp), in-chat lead capture that posts
  the transcript to sales@technext.asia, session persistence. Side tabs hide while the chat is open.
- Quotation builder: live summary, range output, scope folded into the submission.
- Buttons: shine sweep on hover, 2 px lift, ripple on press, arrow nudge, ghost fill; magnetic pull on large
  buttons (fine pointers only). All disabled under `prefers-reduced-motion`.

## Fixed during the audit

- 17 page titles lengthened to be descriptive; 4 descriptions trimmed to ≤170 chars.
- Home had three `<h1>` (one per slide) → slides 2–3 use `<h2 class="as-h1">`.
- Heading skips on company, odoo-erp (aside), quotation (steps), marketing and case-studies (hidden `<h2>`).
- Range input and hidden scope textarea on the quotation page labelled / hidden from AT.
- Chat action buttons inherited link colour (blue on blue) → explicit colours.
- Chat window overlapped the side tabs → tabs slide away while chat is open.
- Marquee overlapped the mobile hero cards → extra bottom padding below 960 px.

## Open items (not defects)

- **FormSubmit activation** — the first real submission to sales@technext.asia triggers a one-time
  "Activate form" email; nothing is delivered until it is clicked.
- **Case studies** are labelled placeholders until each client approves publication.
- **Analytics** are not installed (privacy policy says so); add GA4/GTM + consent when wanted.
- **Chatbot** is a scripted knowledge base. Upgrading to live AI answers needs a small backend holding an API
  key (e.g. Cloudflare Worker) — not possible on GitHub Pages alone.
- **Odoo icons** are Odoo S.A.'s official app icons, served from this repo (downloaded from
  download.odoocdn.com). Fine for partner use; keep them unmodified.

## Weights

| Asset | Size |
|---|---|
| site.css | 58 KB |
| site.js + hero.js + chat.js + quote.js | 9 + 32 + 17 + 2 KB |
| index.html | 75 KB |
| 52 Odoo SVG icons | 43 KB total |
| 8 brand PNGs (logo, plane, wordmark, badge, favicons, OG) | 256 KB total — 5 unreferenced logo variants (344 KB) removed |
| External | Google Fonts only (Plus Jakarta Sans, Inter, Caveat) |
