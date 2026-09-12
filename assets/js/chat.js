/* TechNext assistant — guided chat with a built-in knowledge base. No backend: answers are matched
   locally, and leads are emailed to sales@technext.asia through FormSubmit with the transcript.
   Hands off to the Let's Talk panel, WhatsApp or the quotation page. */
(function () {
  'use strict';
  var win = document.getElementById('chat-win');
  if (!win) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var log = $('[data-chat-log]', win), chips = $('[data-chat-chips]', win), form = $('[data-chat-form]', win), input = $('#chat-text', win);
  var ROOT = (function () { var s = document.querySelector('script[src$="assets/js/chat.js"]'); return s ? s.getAttribute('src').replace('assets/js/chat.js', '') : ''; })();
  var ENDPOINT = 'https://formsubmit.co/ajax/sales@technext.asia';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var history = [];
  var open = false, lastFocus = null, leadPending = null;

  function oi(mod) { return '<img class="oi" src="' + ROOT + 'assets/img/odoo/' + mod + '.svg" alt="" width="18" height="18">'; }
  function link(href, label) { return '<a href="' + ROOT + href + '">' + label + '</a>'; }

  /* ---------------- knowledge base ---------------- */
  var KB = [
    { id: 'odoo', kw: ['what is odoo', 'odoo?', 'about odoo', 'erp', 'what do you do', 'services', 'offer'],
      a: '<b>Odoo</b> is a suite of business apps on one database — Accounting, Sales, Inventory, CRM, Purchase, POS, HR and more. TechNext is an <b>Odoo Ready Partner</b>: we scope, configure, migrate, train and support it. Our first focus is Accounting, Sales and Inventory.',
      actions: [['link', 'solutions/odoo-erp.html', 'Odoo ERP'], ['link', 'odoo/apps.html', 'All apps']], next: ['accounting', 'sales', 'inventory', 'how'] },
    { id: 'accounting', kw: ['account', 'bookkeep', 'gst', 'vat', 'tax', 'bank', 'reconcil', 'invoice', 'ledger', 'month-end', 'month end', 'finance'],
      a: '<b>Odoo Accounting</b> covers the ledger, bank feeds and reconciliation, GST/VAT returns, multi-currency and full financial reports.<ul><li>' + oi('accountant') + 'Bank sync and one-click reconciliation</li><li>' + oi('account') + 'Invoicing with online payment links</li><li>' + oi('hr_expense') + 'Expenses posted straight to the books</li></ul>We usually implement it together with Sales and Inventory so nothing is typed twice.',
      actions: [['link', 'odoo/apps.html#finance', 'Finance apps'], ['quote'], ['human']], next: ['sales', 'inventory', 'price'] },
    { id: 'sales', kw: ['sales', 'quotation app', 'crm', 'pipeline', 'lead', 'quote to', 'pricelist', 'sales order'],
      a: '<b>Odoo Sales + CRM</b>: leads and pipeline in CRM, quotations from templates with e-signature, and confirmed orders that reserve stock and raise the invoice.<ul><li>' + oi('crm') + 'CRM pipeline and activities</li><li>' + oi('sale') + 'Quotations → orders → invoices</li><li>' + oi('point_of_sale') + 'Point of Sale for shops and restaurants</li></ul>',
      actions: [['link', 'odoo/apps.html#sales', 'Sales apps'], ['link', 'odoo/crm-development.html', 'CRM development'], ['quote']], next: ['accounting', 'inventory', 'price'] },
    { id: 'inventory', kw: ['inventory', 'stock', 'warehouse', 'barcode', 'purchase', 'reorder', 'replenish', 'supply', 'manufactur'],
      a: '<b>Odoo Inventory</b> gives real stock across warehouses with barcode operations, and reordering rules that create purchase orders before you run out.<ul><li>' + oi('stock') + 'Multi-warehouse, lots, serials, expiry</li><li>' + oi('purchase') + 'RFQs and bills matched to receipts</li><li>' + oi('mrp') + 'Manufacturing when you build to order</li></ul>',
      actions: [['link', 'odoo/apps.html#supply-chain', 'Supply chain apps'], ['quote']], next: ['accounting', 'sales', 'price'] },
    { id: 'price', kw: ['price', 'pricing', 'cost', 'how much', 'fee', 'budget', 'quotation', 'quote', 'rate', 'expensive', 'cheap'],
      a: 'Pricing follows the scope — which apps, how many users, hosting, data migration and training. Two ways to get a number:<br>1. Build a quick scope in the <b>quotation builder</b> (2 minutes) and we reply with a written quotation.<br>2. Leave your email here and a consultant follows up from <b>sales@technext.asia</b>.',
      actions: [['quote'], ['lead', 'Email me a quotation']], next: ['how', 'hosting'] },
    { id: 'how', kw: ['how do you work', 'process', 'implementation', 'how long', 'timeline', 'steps', 'discovery', 'training', 'support', 'go live', 'go-live', 'methodology'],
      a: 'Four steps, one team:<br><b>1. Discovery</b> — we map how orders, stock and money move, then match each step to an Odoo app and write a scope.<br><b>2. Training</b> — role-based sessions on your own data.<br><b>3. Integration</b> — banks, payments, stores and tools connected.<br><b>4. Support</b> — fixes, month-end help, upgrades and small changes after go-live.',
      actions: [['link', 'odoo/discovery.html', 'Discovery'], ['link', 'odoo/support.html', 'Support plans']], next: ['price', 'hosting', 'human'] },
    { id: 'hosting', kw: ['hosting', 'cloud', 'on-premise', 'on premise', 'odoo.sh', 'online', 'server', 'saas', 'enterprise', 'community', 'edition', 'version', 'licence', 'license'],
      a: 'Odoo can run on <b>Odoo Online</b> (Odoo\'s cloud, standard apps), <b>Odoo.sh</b> (cloud with custom modules and staging) or <b>on-premise / your own cloud</b>. Odoo licences are per user per month and billed by Odoo; we advise on the edition during discovery.',
      actions: [['link', 'solutions/odoo-erp.html', 'Editions & hosting'], ['quote']], next: ['price', 'how'] },
    { id: 'industries', kw: ['industry', 'industries', 'medical', 'clinic', 'health', 'travel', 'tour', 'retail', 'shop', 'store', 'ecommerce', 'e-commerce', 'online store', 'marketplace', 'restaurant', 'hotel'],
      a: 'We configure Odoo for <b>Medical</b> (clinics: consumables, purchasing, books per branch), <b>Travel</b> (margin per booking, multi-currency), <b>Retail</b> (POS + shared stock + accounting) and <b>Ecommerce</b> (orders, fulfilment, payout reconciliation).',
      actions: [['link', 'industries/medical.html', 'Medical'], ['link', 'industries/travel.html', 'Travel'], ['link', 'industries/retail.html', 'Retail'], ['link', 'industries/ecommerce.html', 'Ecommerce']], next: ['price', 'human'] },
    { id: 'partner', kw: ['partner', 'certified', 'ready partner', 'official', 'why technext', 'who are you', 'about technext', 'company', 'experience', 'clients'],
      a: 'TechNext Pte. Ltd. is a Singapore-based <b>Odoo Ready Partner</b> with development hubs in Vietnam and the Philippines. Clients in 10+ countries; 11+ enterprise clients transformed. Same team from discovery through support.',
      actions: [['link', 'company.html', 'About TechNext'], ['link', 'case-studies.html', 'Case studies']], next: ['how', 'human'] },
    { id: 'marketing', kw: ['website', 'web design', 'social media', 'marketing', 'facebook', 'linkedin', 'instagram', 'seo', 'landing page'],
      a: 'Besides Odoo we build <b>websites</b> (company sites, landing pages, Odoo Website/eCommerce) and run <b>social media</b> on a monthly plan — with inquiries landing in Odoo CRM when you run it.',
      actions: [['link', 'solutions/website.html', 'Website'], ['link', 'solutions/social-media.html', 'Social media'], ['talk']], next: ['price', 'human'] },
    { id: 'ai', kw: ['ai', 'artificial', 'chatgpt', 'automation', 'agent', 'llm', 'claude', 'ocr', 'rag'],
      a: 'We build <b>AI inside Odoo</b>: vendor bills read and matched, replies drafted from the record, lookups across your data, and agents that run multi-step tasks with approval where money moves.',
      actions: [['link', 'odoo/ai-integration.html', 'AI Integration'], ['talk']], next: ['how', 'human'] },
    { id: 'contact', kw: ['contact', 'email', 'phone', 'whatsapp', 'address', 'location', 'where', 'singapore', 'call', 'reach'],
      a: 'Email <a href="mailto:sales@technext.asia">sales@technext.asia</a> · WhatsApp <a href="https://wa.me/6588396998" target="_blank" rel="noopener">+65 8839 6998</a> · 261 Waterloo Street #03-36, Singapore 180261. Teams in Singapore, Vietnam and the Philippines.',
      actions: [['talk'], ['wa']], next: ['price', 'how'] },
    { id: 'human', kw: ['human', 'person', 'someone', 'talk to', 'speak', 'consultant', 'sales team', 'demo', 'meeting', 'book', 'schedule', 'appointment'],
      a: 'Happy to connect you. Leave your name and work email and a consultant replies from <b>sales@technext.asia</b> — or open the inquiry form / WhatsApp.',
      actions: [['lead', 'Leave my email'], ['talk'], ['wa']], next: [] },
    { id: 'thanks', kw: ['thank', 'thx', 'great', 'ok', 'okay', 'cool', 'bye'], a: 'You\'re welcome. Anything else — Accounting, Sales, Inventory, pricing or how we work?', actions: [], next: ['accounting', 'price', 'human'] },
    { id: 'hello', kw: ['hi', 'hello', 'hey', 'good morning', 'good afternoon'], a: 'Hello! Ask me about Odoo Accounting, Sales, Inventory, pricing, or how an implementation runs.', actions: [], next: ['odoo', 'price', 'how'] }
  ];
  var LABEL = { odoo: 'What is Odoo?', accounting: 'Accounting', sales: 'Sales & CRM', inventory: 'Inventory', price: 'How much does it cost?', how: 'How do you work?', hosting: 'Hosting & editions', industries: 'Industries', partner: 'Why TechNext?', marketing: 'Website & social', ai: 'AI in Odoo', contact: 'Contact', human: 'Talk to a person' };
  var ICON = { accounting: 'accountant', sales: 'sale', inventory: 'stock', ai: 'ai_app', marketing: 'website' };

  function match(text) {
    var t = text.toLowerCase().trim();
    var best = null, score = 0;
    KB.forEach(function (k) {
      var s = 0;
      k.kw.forEach(function (w) { if (t.indexOf(w) > -1) s += w.length > 4 ? 2 : 1; });
      if (s > score) { score = s; best = k; }
    });
    return best;
  }

  /* ---------------- rendering ---------------- */
  // programmatic scrolls are instant (the log has scroll-behavior: smooth for the user's own scrolling)
  function scroll() { log.style.scrollBehavior = 'auto'; log.scrollTop = log.scrollHeight; log.style.scrollBehavior = ''; }
  function add(role, html) {
    var m = document.createElement('div'); m.className = 'msg msg--' + role; m.innerHTML = html; log.appendChild(m); scroll();
    history.push((role === 'user' ? 'Visitor: ' : 'Assistant: ') + m.textContent.replace(/\s+/g, ' ').trim().slice(0, 400));
    return m;
  }
  function actionsHtml(list) {
    if (!list || !list.length) return '';
    return '<div class="msg-actions">' + list.map(function (a) {
      if (a[0] === 'link') return '<a class="btn btn-ghost" href="' + ROOT + a[1] + '">' + a[2] + '</a>';
      if (a[0] === 'quote') return '<a class="btn btn-primary" href="' + ROOT + 'quotation.html">Get a quotation</a>';
      if (a[0] === 'talk') return '<button class="btn btn-ghost" type="button" data-act="talk">Open inquiry form</button>';
      if (a[0] === 'wa') return '<a class="btn btn-ghost" href="https://wa.me/6588396998" target="_blank" rel="noopener">WhatsApp</a>';
      if (a[0] === 'lead') return '<button class="btn btn-primary" type="button" data-act="lead">' + (a[1] || 'Leave my email') + '</button>';
      return '';
    }).join('') + '</div>';
  }
  function setChips(ids) {
    chips.innerHTML = ids.map(function (id) { return '<button class="chip" type="button" data-chip="' + id + '">' + (ICON[id] ? oi(ICON[id]) : '') + LABEL[id] + '</button>'; }).join('');
    // the chips bar takes height from the log — keep the last message fully in view
    requestAnimationFrame(scroll); setTimeout(scroll, 120);
  }
  function typing() { var m = document.createElement('div'); m.className = 'msg msg--bot'; m.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>'; log.appendChild(m); scroll(); return m; }
  function reply(k) {
    var t = typing();
    setTimeout(function () {
      t.remove();
      add('bot', k.a + actionsHtml(k.actions));
      setChips(k.next && k.next.length ? k.next : ['accounting', 'sales', 'inventory', 'price', 'human']);
      save();
    }, reduce ? 60 : 550 + Math.min(700, k.a.length * 2));
  }
  function ask(text, id) {
    add('user', text.replace(/</g, '&lt;'));
    var k = id ? KB.filter(function (x) { return x.id === id; })[0] : match(text);
    if (!k) k = { a: 'I don\'t have a scripted answer for that yet. A consultant can — leave your email or open the inquiry form and we reply from <b>sales@technext.asia</b>.', actions: [['lead', 'Leave my email'], ['talk']], next: ['accounting', 'sales', 'inventory', 'price'] };
    reply(k);
  }

  /* ---------------- lead capture inside the chat ---------------- */
  function leadForm() {
    if (leadPending) { leadPending.querySelector('input').focus(); return; }
    var m = add('bot', 'Leave your details and we\'ll follow up from <b>sales@technext.asia</b> with this conversation attached.' +
      '<form class="chat-lead" data-lead novalidate><input type="text" name="name" placeholder="Your name" required autocomplete="name">' +
      '<input type="email" name="email" placeholder="Work email" required autocomplete="email">' +
      '<input type="text" name="company" placeholder="Company (optional)" autocomplete="organization">' +
      '<button class="btn btn-primary btn-sm" type="submit"><span class="btn-label">Send to sales@technext.asia</span><span class="btn-busy" aria-hidden="true"></span></button>' +
      '<small class="muted" data-lead-status></small></form>');
    leadPending = m;
    var f = $('[data-lead]', m);
    f.querySelector('input').focus();
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var btn = $('button', f), st = $('[data-lead-status]', f);
      btn.classList.add('is-busy'); btn.disabled = true; st.textContent = 'Sending…';
      var payload = { _subject: 'Chat lead — technext.asia', _template: 'table', _captcha: 'false', source: 'Website chat assistant',
        name: f.name.value, email: f.email.value, company: f.company.value, transcript: history.join('\n') };
      window.tnPostForm(ENDPOINT, payload).then(function () {
        f.innerHTML = '<b style="color:var(--ok)">Sent.</b> <span class="muted">We\'ll reply to ' + f_escape(payload.email) + '.</span>';
        leadPending = null;
        setTimeout(function () { add('bot', 'Thanks, ' + f_escape(payload.name.split(' ')[0]) + '. Anything else while you\'re here?'); setChips(['accounting', 'sales', 'inventory', 'how']); save(); }, 500);
      }).catch(function (err) {
        btn.classList.remove('is-busy'); btn.disabled = false;
        st.innerHTML = (err.message || 'Could not send.') + ' Email us at <a href="mailto:sales@technext.asia">sales@technext.asia</a>.';
      });
    });
  }
  function f_escape(s) { return String(s).replace(/[<>&"]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; }); }

  /* ---------------- persistence ---------------- */
  function save() { try { sessionStorage.setItem('tn_chat', JSON.stringify({ html: log.innerHTML, chips: chips.innerHTML, h: history.slice(-40) })); } catch (_) {} }
  function restore() {
    try {
      var s = JSON.parse(sessionStorage.getItem('tn_chat') || 'null');
      if (s && s.html) { log.innerHTML = s.html; chips.innerHTML = s.chips; history = s.h || []; $$('[data-lead]', log).forEach(function (f) { f.remove(); }); return true; }
    } catch (_) {}
    return false;
  }
  function greet() {
    add('bot', 'Hi — I\'m TechNext\'s assistant. Ask about <b>Odoo Accounting, Sales, Inventory</b>, pricing, or how an implementation runs. I hand off to a person whenever you want.');
    setChips(['odoo', 'accounting', 'sales', 'inventory', 'price', 'how', 'human']);
  }

  /* ---------------- open / close ---------------- */
  function openChat() {
    if (open) return;
    open = true; lastFocus = document.activeElement;
    win.hidden = false; win.classList.remove('is-closing');
    document.body.classList.add('chat-open');
    if (!log.children.length && !restore()) greet();
    if (window.matchMedia('(max-width:960px)').matches) document.body.style.overflow = 'hidden';
    setTimeout(function () { scroll(); if (window.matchMedia('(hover:hover)').matches) input.focus({ preventScroll: true }); }, 60);
  }
  function closeChat() {
    if (!open) return;
    open = false; save();
    document.body.style.overflow = '';
    document.body.classList.remove('chat-open');
    if (reduce) { win.hidden = true; return; }
    win.classList.add('is-closing');
    setTimeout(function () { win.hidden = true; win.classList.remove('is-closing'); }, 240);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  window.tnChat = { open: openChat, close: closeChat };
  $$('[data-chat-open]').forEach(function (b) { b.addEventListener('click', function () { if (open) closeChat(); else openChat(); }); });
  $$('[data-chat-close]', win).forEach(function (b) { b.addEventListener('click', closeChat); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) closeChat(); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href$="#chat"]'); if (a) { e.preventDefault(); openChat(); }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim(); if (!v) return;
    input.value = ''; ask(v);
  });
  chips.addEventListener('click', function (e) {
    var c = e.target.closest('[data-chip]'); if (!c) return;
    var id = c.getAttribute('data-chip'); ask(LABEL[id], id);
  });
  log.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    if (b.getAttribute('data-act') === 'talk') { closeChat(); if (window.tnOpenTalk) window.tnOpenTalk(); }
    if (b.getAttribute('data-act') === 'lead') leadForm();
  });
})();
