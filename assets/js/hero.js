/* Home hero engine: carousel (3 formats, 10 s, desktop only), animated background (aurora CSS +
   particles canvas + cursor spotlight), parallax floaters, rotating word, KPI counters, toast cycle,
   flow chart with live pulse + zooming pop-ups, orbit tiles. Pauses on hover / hidden tab; honours
   reduced motion; below 960px the carousel is replaced by one clean static hero. */
(function () {
  'use strict';
  var hero = document.querySelector('[data-hero]');
  if (!hero) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 960px)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var ROOT = hero.dataset.root || '';
  var DUR = 10000;

  /* ================================================================ content data */
  var APPS = {
    accountant: { name: 'Accounting', cat: 'finance', eyebrow: 'Odoo app · Finance', lead: 'The general ledger, bank feeds, tax and reporting — configured for how you actually close the month.',
      points: ['Bank synchronisation and one-click reconciliation', 'GST / VAT returns and tax reports', 'Multi-currency and multi-company consolidation', 'Aged receivables, P&L, balance sheet, cash forecast'], related: ['account', 'sale', 'purchase'] },
    account: { name: 'Invoicing', cat: 'finance', eyebrow: 'Odoo app · Finance', lead: 'Customer invoices, credit notes and online payment — created from orders or on their own.',
      points: ['Invoice on order, on delivery or by milestone', 'Online payment links and automatic reminders', 'Customer portal with history', 'Posts straight into Accounting'], related: ['accountant', 'sale'] },
    sale: { name: 'Sales', cat: 'sales', eyebrow: 'Odoo app · Sales', lead: 'Quotations, order confirmation and invoicing that follow your pricing and approval rules.',
      points: ['Quotation templates with optional products and e-signature', 'Pricelists, discounts and margin control', 'Confirmation reserves stock and schedules delivery', 'Upsell and recurring order support'], related: ['crm', 'stock', 'account'] },
    stock: { name: 'Inventory', cat: 'supply-chain', eyebrow: 'Odoo app · Supply Chain', lead: 'Real stock levels across warehouses, with replenishment rules that raise purchase orders before you run out.',
      points: ['Multi-warehouse, locations, routes', 'Barcode receipts, picking, packing, delivery', 'Reordering rules that create Purchase orders', 'Lots, serial numbers and expiry dates'], related: ['purchase', 'sale', 'mrp'] },
    purchase: { name: 'Purchase', cat: 'supply-chain', eyebrow: 'Odoo app · Supply Chain', lead: 'Requests for quotation, vendor pricelists and bills matched to what was actually received.',
      points: ['RFQs to several vendors, compare and confirm', 'Vendor pricelists and lead times', 'Three-way match: order, receipt, bill', 'Triggered automatically by reordering rules'], related: ['stock', 'accountant'] },
    crm: { name: 'CRM', cat: 'sales', eyebrow: 'Odoo app · Sales', lead: 'Leads, pipeline stages and activities — and a won deal becomes a quotation without re-entry.',
      points: ['Pipeline by team or product line', 'Lead capture from web forms, email, WhatsApp', 'Scheduled activities so nothing goes quiet', 'Forecast and conversion reporting'], related: ['sale', 'mass_mailing'] },
    point_of_sale: { name: 'Point of Sale', cat: 'sales', eyebrow: 'Odoo app · Sales', lead: 'Offline-capable checkout for shops and restaurants that posts sales and stock moves automatically.',
      points: ['Works offline, syncs when back', 'Barcode, promotions, loyalty', 'Sessions closed straight to Accounting', 'Shared stock with online and other stores'], related: ['stock', 'accountant'] },
    website_sale: { name: 'eCommerce', cat: 'websites', eyebrow: 'Odoo app · Websites', lead: 'An online store that reads live stock and writes orders straight into Sales and Inventory.',
      points: ['Products, variants and live availability', 'Payment gateways and shipping connectors', 'Orders reserve stock on payment', 'Same customer record as CRM and Accounting'], related: ['stock', 'sale'] },
    hr: { name: 'Employees', cat: 'hr', eyebrow: 'Odoo app · Human Resources', lead: 'Directory, contracts and org chart — the base for Time Off, Payroll and Appraisals.', points: ['Employee records and documents', 'Departments and managers', 'Contracts and working schedules', 'Links to Time Off, Payroll, Expenses'], related: ['hr_holidays', 'hr_expense'] },
    project: { name: 'Project', cat: 'services', eyebrow: 'Odoo app · Services', lead: 'Tasks, stages and milestones, with timesheets that bill to the customer.', points: ['Kanban and Gantt views', 'Milestone invoicing', 'Timesheets to Sales orders', 'Customer portal for tasks'], related: ['hr_timesheet', 'sale'] },
    helpdesk: { name: 'Helpdesk', cat: 'services', eyebrow: 'Odoo app · Services', lead: 'Tickets, SLAs and a knowledge base — with refunds and returns tied to Sales and Inventory.', points: ['Email, form and chat tickets', 'SLA policies and escalation', 'Refund or return from the ticket', 'Knowledge base articles'], related: ['crm', 'stock'] },
    mass_mailing: { name: 'Email Marketing', cat: 'marketing', eyebrow: 'Odoo app · Marketing', lead: 'Campaigns to CRM lists with A/B tests and results tied back to opportunities.', points: ['Drag-and-drop templates', 'Lists from CRM and Sales data', 'A/B subject tests', 'Revenue attribution'], related: ['crm', 'social'] },
    mrp: { name: 'Manufacturing', cat: 'supply-chain', eyebrow: 'Odoo app · Supply Chain', lead: 'Bills of materials and work orders that consume components from Inventory.', points: ['Multi-level BoMs', 'Work centres and routings', 'Quality points on work orders', 'Cost roll-up to Accounting'], related: ['stock', 'purchase'] },
    documents: { name: 'Documents', cat: 'finance', eyebrow: 'Odoo app · Finance', lead: 'File storage with workflows and OCR — vendor bills become draft entries.', points: ['Split, tag and route PDFs', 'OCR to vendor bills', 'Approval workflows', 'Linked to any record'], related: ['accountant', 'sign'] },
    sign: { name: 'Sign', cat: 'finance', eyebrow: 'Odoo app · Finance', lead: 'Legally binding e-signatures on quotations, contracts and HR documents.', points: ['Templates with roles', 'Audit trail and certificates', 'Signed quotations confirm orders', 'Works from the customer portal'], related: ['sale', 'documents'] },
    hr_expense: { name: 'Expenses', cat: 'finance', eyebrow: 'Odoo app · Finance', lead: 'Receipts captured by photo, approved by managers, posted to Accounting.', points: ['Snap a receipt, OCR fills the claim', 'Approval flows', 'Reimburse or pay by company card', 'Re-invoice to customers'], related: ['accountant', 'hr'] },
    social: { name: 'Social Marketing', cat: 'marketing', eyebrow: 'Odoo app · Marketing', lead: 'Schedule posts, track engagement and turn social leads into CRM opportunities.', points: ['LinkedIn, Facebook, Instagram, X', 'Post calendar', 'Engagement statistics', 'Leads to CRM'], related: ['crm', 'mass_mailing'] },
    web_studio: { name: 'Studio', cat: 'productivity', eyebrow: 'Odoo app · Customization', lead: 'Add fields, views, reports and automations without breaking the next upgrade.', points: ['Fields and views', 'Report templates', 'Automated actions', 'Exportable customisations'], related: ['accountant', 'sale'] },
    ai_app: { name: 'AI', cat: 'productivity', eyebrow: 'Odoo app · Productivity', lead: 'Assistants and agents inside Odoo — drafting, summarising and looking things up on your own data.', points: ['Draft replies from the record', 'Summarise threads and documents', 'Lookups across Odoo data', 'Human approval where money moves'], related: ['helpdesk', 'crm'] },
    hr_holidays: { name: 'Time Off', cat: 'hr', eyebrow: 'Odoo app · Human Resources', lead: 'Leave requests, allocations and approvals synced with Payroll.', points: ['Leave types and accruals', 'Manager approvals', 'Team calendar', 'Payroll integration'], related: ['hr'] },
    hr_timesheet: { name: 'Timesheets', cat: 'services', eyebrow: 'Odoo app · Services', lead: 'Time tracked against tasks and billed through Sales.', points: ['Timer or grid entry', 'Billable rates', 'Invoice from timesheets', 'Project profitability'], related: ['project', 'sale'] },
    planning: { name: 'Planning', cat: 'services', eyebrow: 'Odoo app · Services', lead: 'Shift and resource scheduling with open-shift publishing.', points: ['Gantt by employee or role', 'Templates and recurrence', 'Publish to employees', 'Links to Project and Field Service'], related: ['project', 'hr'] },
    appointment: { name: 'Appointments', cat: 'services', eyebrow: 'Odoo app · Services', lead: 'Online booking calendars for consultations, demos and service slots.', points: ['Public booking pages', 'Staff availability', 'Reminders and video links', 'Creates CRM leads'], related: ['crm'] },
    knowledge: { name: 'Knowledge', cat: 'productivity', eyebrow: 'Odoo app · Productivity', lead: 'Wiki pages linked to records — procedures next to the work.', points: ['Nested articles', 'Templates and embeds', 'Shared with customers', 'Linked from any record'], related: ['helpdesk'] },
    mail: { name: 'Discuss', cat: 'productivity', eyebrow: 'Odoo app · Productivity', lead: 'Chat, channels and notifications on every record.', points: ['Channels and direct messages', 'Chatter on every record', 'Email integration', 'Mentions and follow-ups'], related: ['crm'] }
  };

  var FLOW = [
    { id: 'quote', app: 'sale', title: 'Quotation', sub: 'Sales', eyebrow: 'Step 1 of 5 · Sales', lead: 'A quotation goes out from a template with your pricelist applied. The customer accepts online — e-signature or a click.',
      points: ['Quotation templates and optional lines', 'Pricelists, discounts and margins visible', 'Online acceptance with e-signature', 'Acceptance confirms the order automatically'], trigger: 'Customer accepts → order confirmed' },
    { id: 'order', app: 'sale', title: 'Sales order', sub: 'Sales', eyebrow: 'Step 2 of 5 · Sales', lead: 'Confirming the order reserves stock and schedules the delivery. If stock falls below minimum, Inventory raises a purchase order on its own.',
      points: ['Stock reserved per line', 'Delivery order created with expected date', 'Reordering rule → Purchase (dashed branch)', 'Invoicing policy: on order or on delivery'], trigger: 'Confirm → reserves stock' },
    { id: 'delivery', app: 'stock', title: 'Delivery', sub: 'Inventory', eyebrow: 'Step 3 of 5 · Inventory', lead: 'The warehouse picks by barcode, packs and ships. Validating the delivery moves stock out and makes the order invoiceable.',
      points: ['Pick, pack, ship in one or three steps', 'Barcode scanning and carrier labels', 'Lots and serials tracked to the customer', 'Backorders handled automatically'], trigger: 'Validate → ready to invoice' },
    { id: 'invoice', app: 'account', title: 'Invoice', sub: 'Accounting', eyebrow: 'Step 4 of 5 · Accounting', lead: 'The invoice is generated from what was delivered — quantities, prices and taxes already correct — and sent with a payment link.',
      points: ['Created from delivered quantities', 'Taxes and fiscal positions applied', 'Payment link and automatic reminders', 'Posted to receivables immediately'], trigger: 'Send → payment link' },
    { id: 'payment', app: 'accountant', title: 'Payment reconciled', sub: 'Accounting', eyebrow: 'Step 5 of 5 · Accounting', lead: 'The bank feed brings in the payment; Odoo matches it to the invoice. Receivables, cash and the P&L are current the same day.',
      points: ['Bank synchronisation daily', 'Automatic matching rules', 'Aged receivables always current', 'Cash forecast updates itself'], trigger: 'Bank match → books closed' },
    { id: 'purchase', app: 'purchase', title: 'Purchase order', sub: 'Purchase · reorder rule', eyebrow: 'Branch · Supply Chain', lead: 'When a confirmed order takes stock below its minimum, Inventory creates an RFQ for the preferred vendor — no one has to notice first.',
      points: ['Min/max rules per product and warehouse', 'Vendor pricelist and lead time used', 'Receipt updates stock; bill matched to receipt', 'Posts to payables in Accounting'], trigger: 'Below minimum → RFQ created' }
  ];
  var CAT_LABEL = { finance: 'Finance', sales: 'Sales', 'supply-chain': 'Supply Chain', websites: 'Websites', hr: 'Human Resources', marketing: 'Marketing', services: 'Services', productivity: 'Productivity' };

  /* ================================================================ pop-up */
  var pop = $('.pop'), backdrop = $('.pop-backdrop');
  var popFrom = null, popIndex = -1;
  function oi(mod, size) { return '<img class="oi" src="' + ROOT + 'assets/img/odoo/' + mod + '.svg" alt="" width="' + size + '" height="' + size + '">'; }
  function icon(name) {
    var d = { x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', check: '<path d="M20 6 9 17l-5-5"/>' }[name];
    return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }
  function renderApp(mod) {
    var a = APPS[mod]; if (!a) return '';
    var rel = (a.related || []).map(function (m) { return APPS[m] ? '<button class="tag" type="button" data-pop-app="' + m + '">' + oi(m, 16) + APPS[m].name + '</button>' : ''; }).join('');
    return '<div class="pop-head">' + oi(mod, 56) + '<div><div class="pop-eyebrow">' + a.eyebrow + '</div><h3>' + a.name + '</h3></div>' +
      '<button class="icon-btn icon-btn--sm" type="button" data-pop-close aria-label="Close">' + icon('x') + '</button></div>' +
      '<div class="pop-body"><p class="lead">' + a.lead + '</p><ul class="checks">' + a.points.map(function (p, i) { return '<li style="--i:' + i + '">' + icon('check') + p + '</li>'; }).join('') + '</ul>' +
      (rel ? '<div class="pop-meta"><span class="small muted" style="align-self:center">Works with</span>' + rel + '</div>' : '') + '</div>' +
      '<div class="pop-foot"><a class="btn btn-ghost" href="' + ROOT + 'odoo/apps/' + mod + '.html">About Odoo ' + a.name + ' ' + icon('arrow') + '</a>' +
      '<a class="btn btn-primary" href="' + ROOT + 'quotation.html">Get a quotation ' + icon('arrow') + '</a></div>';
  }
  function renderFlow(i) {
    var s = FLOW[i];
    var nav = '<div class="pop-nav">' +
      '<button class="icon-btn icon-btn--sm icon-btn--prev" type="button" data-pop-step="' + (i - 1) + '" aria-label="Previous step"' + (i === 0 ? ' disabled' : '') + '>' + icon('arrow') + '</button>' +
      '<button class="icon-btn icon-btn--sm icon-btn--next" type="button" data-pop-step="' + (i + 1) + '" aria-label="Next step"' + (i >= FLOW.length - 1 ? ' disabled' : '') + '>' + icon('arrow') + '</button></div>';
    return '<div class="pop-head">' + oi(s.app, 56) + '<div><div class="pop-eyebrow">' + s.eyebrow + '</div><h3>' + s.title + '</h3></div>' +
      '<button class="icon-btn icon-btn--sm" type="button" data-pop-close aria-label="Close">' + icon('x') + '</button></div>' +
      '<div class="pop-body"><p class="lead">' + s.lead + '</p><ul class="checks">' + s.points.map(function (p, k) { return '<li style="--i:' + k + '">' + icon('check') + p + '</li>'; }).join('') + '</ul>' +
      '<div class="pop-meta"><span class="tag tag--ok">' + icon('check') + s.trigger + '</span><button class="tag" type="button" data-pop-app="' + s.app + '">' + oi(s.app, 16) + 'About ' + APPS[s.app].name + '</button></div></div>' +
      '<div class="pop-foot">' + nav + '<a class="btn btn-primary" href="' + ROOT + 'quotation.html">Get a quotation ' + icon('arrow') + '</a></div>';
  }
  function openPop(fromEl, html) {
    if (!pop) return;
    popFrom = fromEl || popFrom;
    var wasOpen = !pop.hidden;
    pop.innerHTML = html;
    pop.hidden = false; backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    pause();
    if (!wasOpen && popFrom && !reduce) {
      var r = popFrom.getBoundingClientRect(), p = pop.getBoundingClientRect();
      var dx = (r.left + r.width / 2) - (p.left + p.width / 2), dy = (r.top + r.height / 2) - (p.top + p.height / 2);
      var s = Math.max(.12, Math.min(r.width / p.width, .45));
      pop.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 460, easing: 'cubic-bezier(.2,.8,.2,1)' });
      backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320 });
      popFrom.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
    } else if (wasOpen && !reduce) {
      pop.animate([{ transform: 'scale(.97)', opacity: .6 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'ease-out' });
    }
    var c = $('[data-pop-close]', pop); if (c) c.focus({ preventScroll: true });
  }
  function closePop() {
    if (!pop || pop.hidden) return;
    var from = popFrom;
    var finish = function () { pop.hidden = true; backdrop.hidden = true; document.body.style.overflow = ''; resume(); if (from && from.focus) from.focus({ preventScroll: true }); };
    if (reduce || !from) { finish(); return; }
    var r = from.getBoundingClientRect(), p = pop.getBoundingClientRect();
    var dx = (r.left + r.width / 2) - (p.left + p.width / 2), dy = (r.top + r.height / 2) - (p.top + p.height / 2);
    var a = pop.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.2)', opacity: 0 }], { duration: 300, easing: 'cubic-bezier(.4,0,.6,1)' });
    backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260 });
    a.onfinish = finish;
  }
  function openFlow(i, fromEl) { popIndex = i; openPop(fromEl, renderFlow(i)); }
  function openApp(mod, fromEl) { popIndex = -1; openPop(fromEl, renderApp(mod)); }
  window.tnOpenApp = openApp;
  if (pop) {
    pop.addEventListener('click', function (e) {
      var t = e.target.closest('[data-pop-close],[data-pop-step],[data-pop-app]');
      if (!t) return;
      if (t.hasAttribute('data-pop-close')) return closePop();
      if (t.hasAttribute('data-pop-app')) return openApp(t.getAttribute('data-pop-app'), null);
      var n = +t.getAttribute('data-pop-step');
      if (n >= 0 && n < FLOW.length) { popIndex = n; openPop(null, renderFlow(n)); litNode(n); }
    });
    backdrop.addEventListener('click', closePop);
    document.addEventListener('keydown', function (e) {
      if (pop.hidden) return;
      if (e.key === 'Escape') closePop();
      if (popIndex >= 0 && e.key === 'ArrowRight' && popIndex < FLOW.length - 1) { popIndex++; openPop(null, renderFlow(popIndex)); }
      if (popIndex >= 0 && e.key === 'ArrowLeft' && popIndex > 0) { popIndex--; openPop(null, renderFlow(popIndex)); }
    });
  }
  // Any element with data-app / data-flow opens its pop-up.
  hero.addEventListener('click', function (e) {
    var a = e.target.closest('[data-app]'); if (a) { openApp(a.getAttribute('data-app'), a); return; }
    var f = e.target.closest('[data-flow]'); if (f) { openFlow(+f.getAttribute('data-flow'), f); }
  });
  // Same for Odoo icons elsewhere on the page that opt in.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-app-pop]'); if (a && !hero.contains(a)) openApp(a.getAttribute('data-app-pop'), a);
  });

  /* ================================================================ carousel */
  var slides = $$('.slide', hero), dots = $$('.dot', hero), live = $('[data-hero-live]', hero);
  var idx = Math.max(0, slides.findIndex(function (s) { return s.classList.contains('is-active'); }));
  var timer = null, startedAt = 0, remaining = DUR, paused = false, autoplay = !reduce && !mobile.matches;
  // Random play: a random slide opens the page, and autoplay jumps to a random *different* slide each time.
  // Arrows, dots and keys still step in order. Mobile keeps slide 1 (the others are hidden by CSS).
  if (autoplay && slides.length > 1) {
    var r0 = Math.floor(Math.random() * slides.length);
    if (r0 !== idx) { slides[idx].classList.remove('is-active'); slides[r0].classList.add('is-active'); idx = r0; }
  }
  function nextIdx() {
    if (slides.length < 2) return idx;
    var n; do { n = Math.floor(Math.random() * slides.length); } while (n === idx);
    return n;
  }

  function announce() { if (live) live.textContent = 'Slide ' + (idx + 1) + ' of ' + slides.length + ': ' + (slides[idx].dataset.title || ''); }

  /* ---- camera transitions: a different enter + exit style per slide, ~3 s in total ---- */
  var CAM_IN = ['cam-in-orbit', 'cam-in-spiral', 'cam-in-tumble'];
  var CAM_OUT = ['cam-out-spin', 'cam-out-fly', 'cam-out-tilt'];
  var CAM_CLASSES = CAM_IN.concat(CAM_OUT, ['is-leaving', 'is-entering', 'cam-first']);
  var camTimers = [], camOn = !reduce && !mobile.matches;
  function camClear() {
    camTimers.forEach(clearTimeout); camTimers = [];
    slides.forEach(function (s) { CAM_CLASSES.forEach(function (c) { s.classList.remove(c); }); });
    hero.classList.remove('is-cam'); hero.style.removeProperty('--cam');
  }
  function camEnter(slide, n, first) {
    slide.classList.add('is-entering', CAM_IN[n % CAM_IN.length]);
    if (first) slide.classList.add('cam-first');
    hero.classList.add('is-cam');
    hero.style.setProperty('--cam', first ? '700ms' : '900ms');
    tiltReset();
    camTimers.push(setTimeout(function () {
      slide.classList.remove('is-entering', 'cam-first'); CAM_IN.forEach(function (c) { slide.classList.remove(c); });
      hero.classList.remove('is-cam'); hero.style.removeProperty('--cam');
      // ease from flat into the current cursor tilt instead of snapping
      tilt.cx = tilt.cy = 0; if (!tilt.raf) tilt.raf = requestAnimationFrame(tiltStep);
    }, first ? 2000 : 3000));
  }
  function camLeave(slide, o) {
    slide.classList.add('is-leaving', CAM_OUT[o % CAM_OUT.length]);
    camTimers.push(setTimeout(function () { slide.classList.remove('is-leaving'); CAM_OUT.forEach(function (c) { slide.classList.remove(c); }); }, 1200));
  }

  function show(n, viaUser) {
    n = (n + slides.length) % slides.length;
    if (n === idx) return;
    var old = idx;
    if (camOn) camClear();
    slides[old].classList.remove('is-active');
    if (dots[old]) { dots[old].classList.remove('is-active'); dots[old].setAttribute('aria-selected', 'false'); }
    idx = n;
    slides[idx].classList.add('is-active');
    if (camOn) { camLeave(slides[old], old); camEnter(slides[idx], idx, false); }
    if (dots[idx]) { dots[idx].classList.add('is-active'); dots[idx].setAttribute('aria-selected', 'true'); if (!autoplay) dots[idx].classList.add('is-static'); }
    announce(); onSlide(idx); restart();
    if (viaUser && dots[idx]) dots[idx].focus({ preventScroll: true });
  }
  function clear() { if (timer) { clearTimeout(timer); timer = null; } }
  function restart() { clear(); remaining = DUR; if (!autoplay) return; if (!paused) { startedAt = performance.now(); timer = setTimeout(function () { show(nextIdx()); }, remaining); } }
  function pause() { if (paused || !autoplay) return; paused = true; hero.classList.add('is-paused'); if (timer) { remaining = Math.max(200, remaining - (performance.now() - startedAt)); clear(); } }
  function resume() { if (!paused || !autoplay) return; if (pop && !pop.hidden) return; paused = false; hero.classList.remove('is-paused'); startedAt = performance.now(); timer = setTimeout(function () { show(nextIdx()); }, remaining); }

  dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i, true); }); });
  var prev = $('[data-hero-prev]', hero), next = $('[data-hero-next]', hero);
  if (prev) prev.addEventListener('click', function () { show(idx - 1, true); });
  if (next) next.addEventListener('click', function () { show(idx + 1, true); });
  hero.addEventListener('mouseenter', pause);
  hero.addEventListener('mouseleave', resume);
  hero.addEventListener('focusin', pause);
  hero.addEventListener('focusout', function (e) { if (!hero.contains(e.relatedTarget)) resume(); });
  document.addEventListener('visibilitychange', function () { document.hidden ? pause() : resume(); });
  hero.addEventListener('keydown', function (e) {
    if (e.target.closest('input,textarea')) return;
    if (e.key === 'ArrowRight' && (!pop || pop.hidden)) show(idx + 1, true);
    if (e.key === 'ArrowLeft' && (!pop || pop.hidden)) show(idx - 1, true);
  });
  var tx = null;
  hero.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (tx === null || mobile.matches) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 48) show(idx + (dx < 0 ? 1 : -1), true);
  }, { passive: true });

  /* ================================================================ background: particles + spotlight */
  var bg = (function () {
    var canvas = $('canvas.particles', hero);
    if (!canvas || reduce || mobile.matches) return { on: function () {}, off: function () {} };
    var ctx = canvas.getContext('2d'), W = 0, H = 0, dpr = 1, raf = null, pts = [], mx = .5, my = .4, on = false;
    function size() {
      var r = hero.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      pts = [];
      var n = Math.round(W / 26);
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, r: 1.2 + Math.random() * 2.4, v: .12 + Math.random() * .3, ph: Math.random() * 6.28, d: .3 + Math.random() * .7 });
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var px = (mx - .5) * 30, py = (my - .5) * 20;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.y -= p.v; p.ph += .01;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        var x = p.x + Math.sin(p.ph) * 14 + px * p.d, y = p.y + py * p.d;
        ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.283);
        ctx.fillStyle = 'rgba(49,103,202,' + (0.10 + p.d * 0.16).toFixed(3) + ')'; ctx.fill();
        // faint links between close particles
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], ddx = q.x - p.x, ddy = q.y - p.y, dist = ddx * ddx + ddy * ddy;
          if (dist < 8100) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(q.x + Math.sin(q.ph) * 14 + px * q.d, q.y + py * q.d); ctx.strokeStyle = 'rgba(111,160,245,' + (0.10 * (1 - dist / 8100)).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.stroke(); }
        }
      }
      raf = (on && !document.hidden) ? requestAnimationFrame(draw) : null;
    }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width; my = (e.clientY - r.top) / r.height;
      hero.style.setProperty('--mx', (mx * 100).toFixed(1) + '%'); hero.style.setProperty('--my', (my * 100).toFixed(1) + '%');
      parallax(mx - .5, my - .5);
    });
    hero.addEventListener('pointerleave', function () { hoverLock = false; parallax(0, 0); });
    window.addEventListener('resize', function () { if (on) { size(); seed(); } });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && on && !raf) raf = requestAnimationFrame(draw); });
    return { on: function () { on = true; if (!raf) { size(); if (!pts.length) seed(); raf = requestAnimationFrame(draw); } }, off: function () { on = false; } };
  })();
  bg.on();

  /* ================================================================ 3D tilt stage + parallax layers
     The active slide's .slide-inner rotates toward the cursor (max ±6° X, ±9° Y) with eased follow-through;
     [data-depth] floaters also drift laterally and sit at their own Z (data-z). Everything else gets its
     depth from CSS translateZ, so the tilt reveals the layering. */
  var layers = $$('[data-depth]', hero);
  var tilt = { tx: 0, ty: 0, cx: 0, cy: 0, raf: null };
  function tiltStep() {
    tilt.cx += (tilt.tx - tilt.cx) * 0.11; tilt.cy += (tilt.ty - tilt.cy) * 0.11;
    var inner = $('.slide-inner', slides[idx]);
    if (inner) inner.style.transform = 'rotateX(' + (-tilt.cy * 16).toFixed(2) + 'deg) rotateY(' + (tilt.cx * 24).toFixed(2) + 'deg)';
    layers.forEach(function (el) {
      // floaters drift laterally by depth factor but stay on the slide plane (Z 0) so they hit-test in 2D
      var d = parseFloat(el.dataset.depth) || 0;
      el.style.transform = 'translate(' + (tilt.cx * d * 48).toFixed(1) + 'px,' + (tilt.cy * d * 36).toFixed(1) + 'px)';
    });
    tilt.raf = (Math.abs(tilt.tx - tilt.cx) > 0.0005 || Math.abs(tilt.ty - tilt.cy) > 0.0005) ? requestAnimationFrame(tiltStep) : null;
  }
  // While the pointer is over an interactive icon the stage stops moving, so the hit box stays put.
  // Whole interactive zones lock the stage, not just the icons: the visual column, the spec strip, the CTAs.
  var HOT = '.dash-wrap,.flow,.orbit,.spec-strip,.actions,.pill-row,.mono-list,[data-app],[data-flow],.hero-arrow,.dot';
  var hoverLock = false, unlockTimer = null;
  function lock() {
    clearTimeout(unlockTimer); unlockTimer = null;
    if (!hoverLock) { hoverLock = true; hero.classList.add('is-hot'); }
    tilt.tx = tilt.cx; tilt.ty = tilt.cy;                       // stop the stage exactly where it is
  }
  function unlockSoon() {
    // release with hysteresis so the stage never starts moving the instant the cursor grazes an edge
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(function () { hoverLock = false; hero.classList.remove('is-hot'); unlockTimer = null; }, 350);
  }
  hero.addEventListener('pointerover', function (e) { if (e.target.closest(HOT)) lock(); });
  hero.addEventListener('pointerout', function (e) {
    var t = e.target.closest(HOT);
    if (t && !(e.relatedTarget && t.contains(e.relatedTarget))) unlockSoon();
  });
  hero.addEventListener('pointerleave', function () { clearTimeout(unlockTimer); hoverLock = false; hero.classList.remove('is-hot'); });
  function parallax(x, y) {
    if (!fine || reduce || mobile.matches || hoverLock) return;
    tilt.tx = x; tilt.ty = y;
    if (!tilt.raf) tilt.raf = requestAnimationFrame(tiltStep);
  }
  function tiltReset() { tilt.cx = tilt.cy = 0; slides.forEach(function (s) { var i = $('.slide-inner', s); if (i) i.style.transform = ''; }); }

  /* ================================================================ rotating word */
  var rot = $('.rot', hero), rotTimer = null;
  function startRot() {
    if (!rot || reduce) { if (rot) $$('b', rot)[0].classList.add('is-on'); return; }
    var words = $$('b', rot), k = 0;
    words.forEach(function (w, i) { w.classList.toggle('is-on', i === 0); w.classList.remove('is-out'); });
    clearInterval(rotTimer);
    rotTimer = setInterval(function () {
      var cur = words[k]; k = (k + 1) % words.length; var nxt = words[k];
      cur.classList.remove('is-on'); cur.classList.add('is-out');
      nxt.classList.remove('is-out'); nxt.classList.add('is-on');
      setTimeout(function () { cur.classList.remove('is-out'); }, 600);
    }, 2600);
  }

  /* ================================================================ counters + toasts (slide 1) */
  function counters(slide) {
    $$('[data-count]', slide).forEach(function (el) {
      var end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = null, dur = 1100;
      if (reduce) { el.textContent = end.toLocaleString() + suf; return; }
      function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur); p = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * p).toLocaleString() + suf; if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  }
  var toastTimer = null;
  function toasts(slide, on) {
    var list = $$('.toast', slide); clearInterval(toastTimer);
    list.forEach(function (t) { t.classList.remove('is-on'); });
    if (!on || !list.length || reduce) { if (list[0] && reduce) list[0].classList.add('is-on'); return; }
    var k = 0;
    var tick = function () { list.forEach(function (t, i) { t.classList.toggle('is-on', i === k); }); k = (k + 1) % list.length; };
    setTimeout(tick, 900);
    toastTimer = setInterval(tick, 3200);
  }

  /* ================================================================ flow chart (slide 2) */
  var flow = $('.flow', hero), flowSvg = flow && $('.flow-svg', flow), flowRaf = null, flowOn = false, flowPath = null, flowLen = 0, flowT = 0, lastLit = -1;
  var EDGES = [['quote', 'order', 'confirm'], ['order', 'delivery', 'reserves stock'], ['delivery', 'invoice', 'on delivery'], ['invoice', 'payment', 'bank match'], ['order', 'purchase', 'reorder rule', true]];
  var MAIN = ['quote', 'order', 'delivery', 'invoice', 'payment'];
  // Layout (offset) geometry, not getBoundingClientRect: the camera transitions transform the slide,
  // and the connectors must be drawn for the resting layout. `part` measures a child (the icon tile)
  // so the rail runs through the tiles, not through the captions and labels.
  function nodeRect(id, part) {
    var n = $('[data-node="' + id + '"]', flow), t = (part && $(part, n)) || n, x = 0, y = 0, el = t;
    while (el && el !== flow) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    return { x: x, y: y, w: t.offsetWidth, h: t.offsetHeight, cx: x + t.offsetWidth / 2, cy: y + t.offsetHeight / 2, el: n };
  }
  function edgePath(a, b) {
    var A = nodeRect(a, '.fn-ic'), B = nodeRect(b, '.fn-ic');
    if (Math.abs(A.cy - B.cy) < 4) return { d: 'M' + (A.x + A.w + 3) + ' ' + A.cy + ' L' + (B.x - 3) + ' ' + B.cy };
    // branch: drop from under the source node's label to the top of the target's caption
    var An = nodeRect(a), Bn = nodeRect(b);
    return { d: 'M' + An.cx + ' ' + (An.y + An.h + 2) + ' L' + Bn.cx + ' ' + (Bn.y - 2) };
  }
  function drawFlow() {
    if (!flow) return;
    var f = { width: flow.offsetWidth, height: flow.offsetHeight };
    flowSvg.setAttribute('viewBox', '0 0 ' + f.width + ' ' + f.height);
    var html = '<defs><marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="flow-arrow" d="M1 1 9 5 1 9z"/></marker></defs>';
    EDGES.forEach(function (e) {
      var p = edgePath(e[0], e[1]);
      html += '<path class="edge' + (e[3] ? ' edge--dash' : '') + '" d="' + p.d + '"/>';
    });
    // the lit rail and its pulse run through the icon tile centres
    var pts = MAIN.map(function (id) { var r = nodeRect(id, '.fn-ic'); return r.cx + ' ' + r.cy; });
    html += '<path class="edge-lit" d="M' + pts.join(' L') + '" stroke-dasharray="0 9999" data-lit/>';
    html += '<circle class="pulse-halo" r="12" data-halo/><circle class="pulse" r="5" data-dot/>';
    flowSvg.innerHTML = html;
    flowPath = $('[data-lit]', flowSvg); flowLen = flowPath.getTotalLength(); flowT = 0;
  }
  function litNode(i) {
    $$('.fnode', flow).forEach(function (n) { n.classList.remove('is-lit'); });
    var id = MAIN[i] || (i === 5 ? 'purchase' : null);
    if (id) { var n = $('[data-node="' + id + '"]', flow); if (n) n.classList.add('is-lit'); }
  }
  function stepFlow(t) {
    if (!flowOn || !flowPath) { flowRaf = null; return; }
    flowT = (flowT + 0.0022) % 1.08; // ~7.5 s per lap with a short pause
    var tt = Math.min(1, flowT), L = tt * flowLen, pt = flowPath.getPointAtLength(L);
    $('[data-dot]', flowSvg).setAttribute('cx', pt.x); $('[data-dot]', flowSvg).setAttribute('cy', pt.y);
    $('[data-halo]', flowSvg).setAttribute('cx', pt.x); $('[data-halo]', flowSvg).setAttribute('cy', pt.y);
    flowPath.setAttribute('stroke-dasharray', L + ' 9999');
    var seg = Math.min(MAIN.length - 1, Math.floor(tt * (MAIN.length - 1) + 0.15));
    if (seg !== lastLit && (pop.hidden || popIndex < 0)) { lastLit = seg; $$('.fnode', flow).forEach(function (n) { n.classList.remove('is-lit'); }); var n = $('[data-node="' + MAIN[seg] + '"]', flow); if (n) n.classList.add('is-lit'); if (seg === 1) { var pn = $('[data-node="purchase"]', flow); if (pn) pn.classList.add('is-lit'); } }
    flowRaf = requestAnimationFrame(stepFlow);
  }
  function flowStart() { if (!flow) return; drawFlow(); flowOn = true; if (!reduce && !flowRaf) flowRaf = requestAnimationFrame(stepFlow); if (reduce) { flowPath.setAttribute('stroke-dasharray', flowLen + ' 9999'); } }
  function flowStop() { flowOn = false; }
  window.addEventListener('resize', function () { if (flowOn) drawFlow(); });

  /* ================================================================ per-slide hooks */
  function onSlide(i) {
    var s = slides[i];
    if (s.hasAttribute('data-slide-dash')) { counters(s); toasts(s, true); startRot(); } else { toasts(slides[0], false); clearInterval(rotTimer); }
    if (s.hasAttribute('data-slide-flow')) flowStart(); else flowStop();
  }

  // init — the first slide also arrives with a camera move, once the one-time intro (if any) has finished
  if (dots[idx]) { dots[idx].classList.add('is-active'); dots[idx].setAttribute('aria-selected', 'true'); if (!autoplay) dots[idx].classList.add('is-static'); }
  announce(); onSlide(idx); restart();
  if (mobile.matches) { counters(slides[0]); clearInterval(rotTimer); var rw = $$('.rot b', hero); rw.forEach(function (w, i) { w.classList.toggle('is-on', i === 0); w.classList.remove('is-out'); }); }
  if (camOn) {
    var firstEnter = function () { camClear(); camEnter(slides[idx], idx, true); };
    if (document.documentElement.classList.contains('intro')) document.addEventListener('tn:intro-done', firstEnter, { once: true });
    else firstEnter();
  }
})();
