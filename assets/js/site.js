/* TechNext Website v2 — shared behaviour: one-time intro, header menus, mobile nav, Let's Talk
   panel, FormSubmit forms, scroll reveals, button ripple + magnetic hover. No dependencies. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------- one-time intro (html.intro is set by the inline head script) ---------------- */
  (function intro() {
    var el = $('#intro');
    if (!el) return;
    if (!document.documentElement.classList.contains('intro')) { el.remove(); return; }
    document.body.style.overflow = 'hidden';
    // Plays on every fresh load and every refresh (the head script skips it only for in-site link
    // navigation and back/forward). Old "seen" flags from earlier builds are cleared so they never block it.
    try { localStorage.removeItem('tn_intro_seen'); sessionStorage.removeItem('tn_intro_seen'); } catch (_) {}
    try { document.cookie = 'tn_intro_seen=; max-age=0; path=/'; document.cookie = 'tn_intro_s=; max-age=0; path=/'; } catch (_) {}
    if (/[?&]intro=1(&|$)/.test(location.search) && history.replaceState) {
      var clean = location.search.replace(/([?&])intro=1(&|$)/, function (m, a, b) { return b === '&' ? a : ''; });
      history.replaceState(null, '', location.pathname + clean + location.hash);
    }
    var done = false, timers = [], raf = null;
    function finish() {
      if (done) return; done = true;
      timers.forEach(clearTimeout); if (raf) cancelAnimationFrame(raf);
      el.classList.add('is-out');
      document.documentElement.classList.remove('intro');
      document.body.style.overflow = '';
      document.dispatchEvent(new CustomEvent('tn:intro-done'));
      setTimeout(function () { el.remove(); }, 750);
    }

    /* flight path: one smooth cubic Bézier sweep from off-screen bottom-left, up and over the lock-up,
       around its right, back underneath and into the plane's slot on a gentle climb. The loop is built
       around the stage's box with a clearance (`pad`), so on a phone or a tablet it still encircles the
       wordmark instead of cutting through the letters, and it stays below the tagline that types on later.
       Built in viewport pixels, then expressed relative to the plane's box for offset-path and drawn as
       the SVG trail. */
    var wrap = $('.intro-plane-wrap', el), stage = $('.intro-stage', el), trail = $('.intro-trail-svg path', el);
    var lockup = $('.intro-lockup', el), sub = $('.intro-sub', el);
    // Centre the lock-up once, in pixels: a later viewport-height change (mobile URL bar) then leaves it
    // exactly where the flight path expects it.
    function place() {
      if (!lockup) return;
      lockup.style.top = '50%'; lockup.style.transform = 'translate(-50%,-50%)';
      var lh = lockup.offsetHeight, H = window.innerHeight;
      lockup.style.top = Math.max(8, Math.round((H - lh) / 2)) + 'px'; lockup.style.transform = 'translateX(-50%)';
    }
    function buildPath() {
      var r = wrap.getBoundingClientRect(), s = stage.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var sx = s.left, sy = s.top, sw = s.width, sh = s.height, scx = sx + sw / 2;
      var pad = Math.max(44, Math.min(120, Math.min(W, H) * 0.12));           // clearance around the lock-up
      // The loop's right extreme must clear the last letter. A cubic with both middle controls at X only
      // reaches about 0.75*X + (ends)/8, so solve X for the extreme we want, kept inside the viewport.
      var reachX = Math.min(sx + sw + pad * 0.9, W - 8);
      var rightX = (reachX - (scx + (scx + sw * 0.12)) / 8) / 0.75;
      var subBottom = sub ? sub.getBoundingClientRect().bottom : sy + sh;     // the tagline's real box
      var bottomY = Math.max(sy + sh + pad * 0.95, subBottom + 18);          // pass under the tagline's line
      var P = function (x, y) { return x.toFixed(1) + ',' + y.toFixed(1); };
      var ex = cx - pad * 1.3, ey = cy + pad * 0.9;                           // last control point: a wide approach from the lower-left
      // Junctions are C1-continuous: each segment's first control point mirrors the previous segment's
      // last one, so the sweep has no kinks at the top or under the lock-up.
      var topY = sy - pad * 1.15, kx = scx + sw * 0.12;
      var d = 'M' + P(-0.12 * W, 1.06 * H) +
        ' C' + P(sx - pad * 1.6, sy + sh + pad * 1.4) + ' ' + P(2 * scx - rightX, 2 * topY - (sy - pad * 0.7)) + ' ' + P(scx, topY) +
        ' C' + P(rightX, sy - pad * 0.7) + ' ' + P(rightX, bottomY - pad * 0.25) + ' ' + P(kx, bottomY) +
        ' C' + P(2 * kx - rightX, bottomY + pad * 0.25) + ' ' + P(ex, ey) + ' ' + P(cx, cy);
      var theta = Math.atan2(cy - ey, cx - ex) * 180 / Math.PI;                // end tangent (negative = climbing)
      trail.setAttribute('d', d);
      var L = trail.getTotalLength();
      trail.style.strokeDasharray = L + ' ' + L; trail.style.strokeDashoffset = L;
      var local = d.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, function (m, x, y) { return (x - r.left).toFixed(1) + ',' + (y - r.top).toFixed(1); });
      wrap.style.offsetPath = 'path("' + local + '")';
      wrap.style.offsetRotate = 'auto ' + (-theta).toFixed(1) + 'deg';        // lands level, nose up-right like the logo
      return L;
    }

    /* particles converge on the stage while the plane is inbound */
    function particles() {
      var c = $('.intro-particles', el); if (!c) return;
      var ctx = c.getContext('2d'), W = c.width = window.innerWidth, H = c.height = window.innerHeight;
      var cx = W / 2, cy = H / 2, t0 = null, pts = [];
      for (var i = 0; i < 90; i++) { var a = Math.random() * 6.283, rr = Math.max(W, H) * (0.35 + Math.random() * 0.45); pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, r: 1.5 + Math.random() * 2.5, k: 0.6 + Math.random() * 0.4, ph: Math.random() * 6.283 }); }
      function step(t) {
        if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 2200), e = 1 - Math.pow(1 - p, 3);
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < pts.length; i++) {
          var q = pts[i], tx = cx + Math.cos(q.ph) * 150 * (1 - e) , ty = cy + Math.sin(q.ph) * 90 * (1 - e);
          var x = q.x + (tx - q.x) * e * q.k, y = q.y + (ty - q.y) * e * q.k;
          ctx.beginPath(); ctx.arc(x, y, q.r * (1 - p * 0.6), 0, 6.283);
          ctx.fillStyle = 'rgba(49,103,202,' + (0.35 * (1 - p) + 0.05).toFixed(3) + ')'; ctx.fill();
        }
        if (p < 1 && !done) raf = requestAnimationFrame(step); else { ctx.clearRect(0, 0, W, H); raf = null; }
      }
      raf = requestAnimationFrame(step);
    }

    /* tagline types on */
    function typewriter() {
      var sub = $('.intro-sub', el), text = el.dataset.tagline || '', i = 0;
      sub.textContent = ''; sub.classList.add('is-typing');
      (function tick() { if (done) return; sub.textContent = text.slice(0, ++i); if (i < text.length) timers.push(setTimeout(tick, 52)); else timers.push(setTimeout(function () { sub.classList.remove('is-typing'); }, 900)); })();
    }

    // 10 s: flight 0.3–3.6 s (same curve as the CSS `fly` keyframes), tagline at 4.6 s, fade at 10.0 s.
    // Every beat is clocked from the real start, which fires on the next frame or after 120 ms at the latest
    // (requestAnimationFrame can stall in a throttled tab).
    place();
    var L = buildPath(), started = false, lastW = window.innerWidth, trailAnim = null;
    function start() {
      if (started || done) return; started = true;
      el.classList.add('is-go');
      trailAnim = trail.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 3300, delay: 300, easing: 'cubic-bezier(.3,.55,.15,1)', fill: 'forwards' });
      particles();
      timers.push(setTimeout(typewriter, 4600));
      timers.push(setTimeout(finish, 10000));
    }
    requestAnimationFrame(start);
    timers.push(setTimeout(start, 120));
    function restart() {
      timers.forEach(clearTimeout); timers = []; if (raf) { cancelAnimationFrame(raf); raf = null; }
      if (trailAnim) { trailAnim.cancel(); trailAnim = null; }
      el.classList.remove('is-go'); started = false;
      if (sub) { sub.textContent = ''; sub.classList.remove('is-typing'); }
      void el.offsetWidth;                       // reflow so every CSS animation restarts from frame 0
      place(); L = buildPath(); start();
    }
    window.addEventListener('resize', function () {
      var W = window.innerWidth;
      if (!started) { place(); L = buildPath(); lastW = W; return; }
      // Rotation or a real resize re-runs the sequence on the new layout. Height-only changes (mobile URL
      // bar) are ignored: the lock-up is pinned in pixels, so nothing moves under the plane.
      if (Math.abs(W - lastW) > 100 && !done) { lastW = W; restart(); }
    });
    el.addEventListener('click', finish); // let impatient visitors skip
    document.addEventListener('keydown', function onKey(e) { if (e.key === 'Escape' || e.key === 'Enter') { finish(); document.removeEventListener('keydown', onKey); } });
  })();

  /* ---------------- header: scrolled state + click-to-open mega menus ---------------- */
  var header = $('[data-header]');
  var megas = $$('.has-mega');

  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 4); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function closeMegas(except) {
    megas.forEach(function (li) {
      if (li === except) return;
      li.classList.remove('is-open');
      $('.nav-link', li).setAttribute('aria-expanded', 'false');
    });
    header.classList.toggle('is-open', !!except);
  }
  megas.forEach(function (li) {
    var btn = $('.nav-link', li);
    btn.addEventListener('click', function () {
      var open = li.classList.contains('is-open');
      closeMegas(open ? null : li);
      li.classList.toggle('is-open', !open);
      btn.setAttribute('aria-expanded', String(!open));
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-mega')) closeMegas(null);
  });

  /* ---------------- mobile nav ---------------- */
  var mnav = $('#mnav'), mOverlay = $('.mnav-overlay'), mBtn = $('[data-mnav-open]');
  function openMnav() {
    mnav.hidden = false; mOverlay.hidden = false;
    mBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var first = $('[data-mnav-close]', mnav); if (first) first.focus();
  }
  function closeMnav() {
    if (mnav.hidden) return;
    mnav.hidden = true; mOverlay.hidden = true;
    mBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  mBtn.addEventListener('click', openMnav);
  $$('[data-mnav-close]').forEach(function (el) { el.addEventListener('click', closeMnav); });
  // Tapping a link or an action button inside the drawer closes it (in-page anchors included).
  mnav.addEventListener('click', function (e) { if (e.target.closest('a,[data-chat-open]')) closeMnav(); });
  window.tnCloseMnav = closeMnav;

  /* ---------------- Let's Talk panel ---------------- */
  var panel = $('#talk-panel'), tOverlay = $('.talk-overlay');
  var lastFocus = null;
  function openTalk() {
    lastFocus = document.activeElement;
    closeMnav();
    if (window.tnChat) window.tnChat.close();
    // exit animation on the tab: the plane flies off, then both tabs slide out behind the panel
    var tab = $('.talk-tab');
    if (tab) { tab.classList.add('is-exiting'); setTimeout(function () { tab.classList.remove('is-exiting'); }, 700); }
    document.body.classList.add('talk-open');
    panel.hidden = false; tOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      panel.classList.add('is-open'); tOverlay.classList.add('is-open');
      var f = $('#tf-name'); if (f && fine) f.focus({ preventScroll: true });
    });
  }
  function closeTalk() {
    if (panel.hidden) return;
    panel.classList.remove('is-open'); tOverlay.classList.remove('is-open');
    document.body.classList.remove('talk-open');
    document.body.style.overflow = '';
    var done = function () { panel.hidden = true; tOverlay.hidden = true; panel.removeEventListener('transitionend', done); };
    if (reduce) done(); else { panel.addEventListener('transitionend', done); setTimeout(done, 400); }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  window.tnOpenTalk = openTalk;
  $$('[data-talk-open]').forEach(function (el) { el.addEventListener('click', function (e) { e.preventDefault(); openTalk(); }); });
  $$('[data-talk-close]').forEach(function (el) { el.addEventListener('click', closeTalk); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href$="#talk"]');
    if (a) { e.preventDefault(); openTalk(); }
  });
  if (location.hash === '#talk') setTimeout(openTalk, 300);

  panel.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = $$('button, [href], input, select, textarea', panel).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMegas(null); closeTalk(); closeMnav(); }
  });

  /* ---------------- forms → FormSubmit (AJAX) ---------------- */
  function serialize(form) {
    var data = {};
    new FormData(form).forEach(function (v, k) {
      if (k === '_honey') return;
      data[k] = data[k] ? data[k] + ', ' + v : v;
    });
    return data;
  }
  window.tnPostForm = function (endpoint, payload) {
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        var ok = res.ok && (res.j.success === 'true' || res.j.success === true);
        if (!ok) throw new Error((res.j && res.j.message) || 'The form service did not accept the message.');
        return res.j;
      });
  };
  $$('form[data-endpoint]').forEach(function (form) {
    var status = $('.form-status', form);
    var btn = $('button[type=submit]', form);
    if (!$('.form-sent', form)) {
      var sent = document.createElement('div');
      sent.className = 'form-sent';
      sent.innerHTML = '<h3>Thanks — we have it.</h3><p>Your message is on its way to sales@technext.asia. We reply from that address.</p>';
      form.appendChild(sent);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if ($('input[name=_honey]', form) && $('input[name=_honey]', form).value) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.dataset.beforeSend) { try { window[form.dataset.beforeSend](form); } catch (_) {} }
      var payload = serialize(form);
      btn.classList.add('is-busy'); btn.disabled = true;
      status.className = 'form-status'; status.textContent = 'Sending…';
      window.tnPostForm(form.dataset.endpoint, payload)
        .then(function () {
          form.classList.add('is-sent');
          status.className = 'form-status is-ok'; status.textContent = '';
        })
        .catch(function (err) {
          status.className = 'form-status is-err';
          status.innerHTML = (err && err.message ? err.message + ' ' : '') +
            'You can also email us directly at <a href="mailto:sales@technext.asia">sales@technext.asia</a>.';
        })
        .finally(function () { btn.classList.remove('is-busy'); btn.disabled = false; });
    });
  });

  /* ---------------- YouTube facades: load the player only on click ---------------- */
  document.addEventListener('click', function (e) {
    var f = e.target.closest('[data-yt]');
    if (!f || f.classList.contains('is-playing')) return;
    var id = f.getAttribute('data-yt'), title = f.getAttribute('aria-label') || 'Video';
    f.classList.add('is-playing');
    f.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1" title="' + title.replace(/"/g, '') + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
  });

  /* ---------------- scroll reveals ---------------- */
  var reveals = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- buttons: ripple on press, magnetic pull on hover ---------------- */
  document.addEventListener('pointerdown', function (e) {
    var btn = e.target.closest('.btn');
    if (!btn || reduce) return;
    var r = btn.getBoundingClientRect();
    var d = Math.max(r.width, r.height) * 1.6;
    var s = document.createElement('span');
    s.className = 'ripple';
    s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
    btn.appendChild(s);
    setTimeout(function () { s.remove(); }, 650);
  });
  if (fine && !reduce) {
    // magnetic pull on large buttons only (never on the fixed side tabs — a moving fixed target flickers)
    $$('.btn-lg').forEach(function (btn) {
      var raf = null;
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width, y = (e.clientY - r.top - r.height / 2) / r.height;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          btn.style.transform = 'translate(' + (x * 6).toFixed(1) + 'px,' + (y * 4 - 2).toFixed(1) + 'px)';
        });
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }
})();
