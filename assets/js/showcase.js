/* App showcase: a list of Odoo apps (tabs) with a detail panel that swaps content with a small
   spring animation. Auto-advances every 6 s until the visitor interacts. Used on industry pages and
   the Odoo ERP page. Each tab carries its content in data attributes. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ROOT = (function () { var s = document.querySelector('script[src$="assets/js/showcase.js"]'); return s ? s.getAttribute('src').replace('assets/js/showcase.js', '') : ''; })();
  function icon(name) {
    var d = { arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', check: '<path d="M20 6 9 17l-5-5"/>' }[name];
    return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }
  document.querySelectorAll('[data-showcase]').forEach(function (sc) {
    var tabs = Array.prototype.slice.call(sc.querySelectorAll('.sc-tab'));
    var panel = sc.querySelector('.sc-panel');
    if (!tabs.length || !panel) return;
    var idx = 0, timer = null, userTouched = false, dur = parseInt(sc.dataset.interval || '6000', 10);

    function render(i, animate) {
      var t = tabs[i], mod = t.dataset.app;
      var points = (t.dataset.points || '').split('|').filter(Boolean);
      var html = '<div class="sc-head">' +
        '<img class="oi" src="' + ROOT + 'assets/img/odoo/' + mod + '.svg" alt="" width="64" height="64">' +
        '<div><div class="sc-kicker">' + (t.dataset.kicker || 'Odoo app') + '</div><h3>' + t.dataset.title + '</h3></div></div>' +
        '<p class="sc-lead">' + (t.dataset.desc || '') + '</p>' +
        (points.length ? '<ul class="checks">' + points.map(function (p, k) { return '<li style="--i:' + k + '">' + icon('check') + p + '</li>'; }).join('') + '</ul>' : '') +
        '<div class="sc-actions">' +
        (t.dataset.href ? '<a class="btn btn-ghost" href="' + t.dataset.href + '">About Odoo ' + t.dataset.title + ' ' + icon('arrow') + '</a>' : '') +
        '<a class="btn btn-primary" href="' + ROOT + 'quotation.html">Get a quotation ' + icon('arrow') + '</a></div>';
      var inner = document.createElement('div');
      inner.className = 'sc-panel-inner' + (animate && !reduce ? ' is-in' : '');
      inner.innerHTML = html;
      var old = panel.querySelector('.sc-panel-inner');
      if (old && animate && !reduce) {
        old.classList.add('is-out');
        setTimeout(function () { old.remove(); }, 260);
      } else if (old) { old.remove(); }
      panel.appendChild(inner);
      tabs.forEach(function (b, k) { b.classList.toggle('is-active', k === i); b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
      sc.style.setProperty('--sc-progress-dur', dur + 'ms');
      sc.classList.remove('is-ticking'); void sc.offsetWidth; if (!userTouched && !reduce) sc.classList.add('is-ticking');
      idx = i;
    }
    function go(i, byUser) {
      if (byUser) { userTouched = true; clearInterval(timer); timer = null; }
      render((i + tabs.length) % tabs.length, true);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { go(i, true); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); go(i + 1, true); tabs[idx].focus(); }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1, true); tabs[idx].focus(); }
      });
    });
    sc.addEventListener('mouseenter', function () { clearInterval(timer); timer = null; sc.classList.remove('is-ticking'); });
    sc.addEventListener('mouseleave', function () { if (!userTouched && !timer && !reduce) { timer = setInterval(function () { render(idx + 1 >= tabs.length ? 0 : idx + 1, true); }, dur); sc.classList.add('is-ticking'); } });
    render(0, false);
    if (!reduce) {
      // start auto-advance once visible
      var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !timer && !userTouched) { timer = setInterval(function () { render(idx + 1 >= tabs.length ? 0 : idx + 1, true); }, dur); sc.classList.add('is-ticking'); }
        if (!en[0].isIntersecting && timer) { clearInterval(timer); timer = null; sc.classList.remove('is-ticking'); }
      }, { threshold: 0.35 }) : null;
      if (io) io.observe(sc); else { timer = setInterval(function () { render(idx + 1 >= tabs.length ? 0 : idx + 1, true); }, dur); }
    }
  });
})();

/* ---------- app constellation (home "Every Odoo app, one database") ----------
   Nodes are placed on three rings by --a/--r; this draws the spokes to the core, lights a node
   and its spoke in turn, and shows the app name on hover/focus. */
(function () {
  'use strict';
  var wrap = document.querySelector('[data-const]');
  if (!wrap) return;
  var svg = wrap.querySelector('.const-lines'), nodes = Array.prototype.slice.call(wrap.querySelectorAll('.const-node'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paths = [];
  function draw() {
    var W = wrap.offsetWidth, H = wrap.offsetHeight, cx = W / 2, cy = H / 2;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = nodes.map(function (n, i) {
      if (!n.offsetParent) return '<line class="const-spoke" data-i="' + i + '" style="display:none"/>';
      var x = n.offsetLeft + n.offsetWidth / 2, y = n.offsetTop + n.offsetHeight / 2;
      return '<line class="const-spoke' + (n.classList.contains('is-focus') ? ' is-focus' : '') + '" data-i="' + i + '" x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '"/>';
    }).join('');
    paths = Array.prototype.slice.call(svg.querySelectorAll('.const-spoke'));
  }
  draw();
  window.addEventListener('resize', draw);
  // hover/focus lights the spoke
  nodes.forEach(function (n, i) {
    var on = function () { wrap.classList.add('is-hot'); n.classList.add('is-lit'); if (paths[i]) paths[i].classList.add('is-lit'); };
    var off = function () { wrap.classList.remove('is-hot'); n.classList.remove('is-lit'); if (paths[i]) paths[i].classList.remove('is-lit'); };
    n.addEventListener('pointerenter', on); n.addEventListener('pointerleave', off);
    n.addEventListener('focus', on); n.addEventListener('blur', off);
  });
  // idle: a pulse travels core -> node, node by node, while in view and not hovered
  if (reduce) return;
  var k = 0, timer = null;
  function tick() {
    if (wrap.classList.contains('is-hot')) return;
    nodes.forEach(function (n) { n.classList.remove('is-auto'); }); paths.forEach(function (p) { p.classList.remove('is-auto'); });
    var n = nodes[k], p = paths[k]; k = (k + 1) % nodes.length;
    if (n) n.classList.add('is-auto'); if (p) p.classList.add('is-auto');
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
    if (en[0].isIntersecting && !timer) { draw(); tick(); timer = setInterval(tick, 1400); }
    if (!en[0].isIntersecting && timer) { clearInterval(timer); timer = null; }
  }, { threshold: 0.3 }) : null;
  if (io) io.observe(wrap); else timer = setInterval(tick, 1400);
})();
