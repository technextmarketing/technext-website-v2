/* TechNext Website v2 — shared behaviour: header menus, mobile nav, Let's Talk panel,
   FormSubmit forms, scroll reveals. No dependencies. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    mBtn.focus();
  }
  mBtn.addEventListener('click', openMnav);
  $$('[data-mnav-close]').forEach(function (el) { el.addEventListener('click', closeMnav); });

  /* ---------------- Let's Talk panel ---------------- */
  var panel = $('#talk-panel'), tOverlay = $('.talk-overlay');
  var lastFocus = null;
  function openTalk() {
    lastFocus = document.activeElement;
    closeMnav();
    panel.hidden = false; tOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      panel.classList.add('is-open'); tOverlay.classList.add('is-open');
      var f = $('#tf-name'); if (f) f.focus({ preventScroll: true });
    });
  }
  function closeTalk() {
    if (panel.hidden) return;
    panel.classList.remove('is-open'); tOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    var done = function () { panel.hidden = true; tOverlay.hidden = true; panel.removeEventListener('transitionend', done); };
    if (reduce) done(); else { panel.addEventListener('transitionend', done); setTimeout(done, 400); }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('[data-talk-open]').forEach(function (el) { el.addEventListener('click', function (e) { e.preventDefault(); openTalk(); }); });
  $$('[data-talk-close]').forEach(function (el) { el.addEventListener('click', closeTalk); });
  // Any link to #talk opens the panel (used by CTAs across pages).
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href$="#talk"]');
    if (a) { e.preventDefault(); openTalk(); }
  });
  if (location.hash === '#talk') setTimeout(openTalk, 300);

  // Focus trap inside the panel.
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
  $$('form[data-endpoint]').forEach(function (form) {
    var status = $('.form-status', form);
    var btn = $('button[type=submit]', form);
    // Ensure a success block exists.
    if (!$('.form-sent', form)) {
      var sent = document.createElement('div');
      sent.className = 'form-sent';
      sent.innerHTML = '<h3>Thanks — we have it.</h3><p>Your message is on its way to sales@technext.asia. We reply from that address.</p>';
      form.appendChild(sent);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if ($('input[name=_honey]', form) && $('input[name=_honey]', form).value) return; // bot
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.dataset.beforeSend) { try { window[form.dataset.beforeSend](form); } catch (_) {} }
      var payload = serialize(form);
      btn.classList.add('is-busy'); btn.disabled = true;
      status.className = 'form-status'; status.textContent = 'Sending…';
      fetch(form.dataset.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          var ok = res.ok && (res.j.success === 'true' || res.j.success === true);
          if (!ok) throw new Error((res.j && res.j.message) || 'The form service did not accept the message.');
          form.classList.add('is-sent');
          status.className = 'form-status is-ok'; status.textContent = '';
          form.dispatchEvent(new CustomEvent('tn:sent'));
        })
        .catch(function (err) {
          status.className = 'form-status is-err';
          status.innerHTML = (err && err.message ? err.message + ' ' : '') +
            'You can also email us directly at <a href="mailto:sales@technext.asia">sales@technext.asia</a>.';
        })
        .finally(function () { btn.classList.remove('is-busy'); btn.disabled = false; });
    });
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
})();
