/* Home hero: three hero formats in a carousel (10 s each), light-beam canvas on slide 1,
   pointer tilt on the dashboard mock. Pauses on hover/focus/hidden tab; honours reduced motion. */
(function () {
  'use strict';
  var hero = document.querySelector('[data-hero]');
  if (!hero) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DUR = 10000;
  var slides = Array.prototype.slice.call(hero.querySelectorAll('.slide'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('.dot'));
  var live = hero.querySelector('[data-hero-live]');
  var idx = slides.findIndex(function (s) { return s.classList.contains('is-active'); });
  if (idx < 0) idx = 0;
  var timer = null, startedAt = 0, remaining = DUR, paused = false;

  function announce() {
    if (live) live.textContent = 'Slide ' + (idx + 1) + ' of ' + slides.length + ': ' + (slides[idx].dataset.title || '');
  }
  function show(n, viaUser) {
    n = (n + slides.length) % slides.length;
    slides[idx].classList.remove('is-active');
    dots[idx].classList.remove('is-active'); dots[idx].setAttribute('aria-selected', 'false');
    idx = n;
    slides[idx].classList.add('is-active');
    dots[idx].classList.add('is-active'); dots[idx].setAttribute('aria-selected', 'true');
    if (reduce) dots[idx].classList.add('is-static');
    announce();
    beams.setActive(slides[idx].hasAttribute('data-beams'));
    restart();
    if (viaUser) dots[idx].focus({ preventScroll: true });
  }
  function clear() { if (timer) { clearTimeout(timer); timer = null; } }
  function restart() {
    clear(); remaining = DUR;
    if (reduce) return;
    if (!paused) { startedAt = performance.now(); timer = setTimeout(function () { show(idx + 1); }, remaining); }
  }
  function pause() {
    if (paused || reduce) return;
    paused = true; hero.classList.add('is-paused');
    if (timer) { remaining = Math.max(200, remaining - (performance.now() - startedAt)); clear(); }
  }
  function resume() {
    if (!paused || reduce) return;
    paused = false; hero.classList.remove('is-paused');
    startedAt = performance.now();
    timer = setTimeout(function () { show(idx + 1); }, remaining);
  }

  dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i, true); }); });
  var prev = hero.querySelector('[data-hero-prev]'), next = hero.querySelector('[data-hero-next]');
  if (prev) prev.addEventListener('click', function () { show(idx - 1, true); });
  if (next) next.addEventListener('click', function () { show(idx + 1, true); });

  hero.addEventListener('mouseenter', pause);
  hero.addEventListener('mouseleave', resume);
  hero.addEventListener('focusin', pause);
  hero.addEventListener('focusout', function (e) { if (!hero.contains(e.relatedTarget)) resume(); });
  document.addEventListener('visibilitychange', function () { document.hidden ? pause() : resume(); });
  hero.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { show(idx + 1, true); }
    if (e.key === 'ArrowLeft') { show(idx - 1, true); }
  });
  var tx = null;
  hero.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 48) show(idx + (dx < 0 ? 1 : -1), true);
  }, { passive: true });

  /* ---------------- light beams (slide 1) ---------------- */
  var beams = (function () {
    var canvas = hero.querySelector('canvas.beams');
    if (!canvas || reduce) return { setActive: function () {} };
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1, raf = null, active = false;
    var list = [];
    function size() {
      var r = canvas.parentElement.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      list = [];
      var n = W < 700 ? 5 : 7;
      for (var i = 0; i < n; i++) {
        list.push({
          x: Math.random() * (W * 1.6) - W * 0.3,
          w: 90 + Math.random() * 190,
          v: 0.12 + Math.random() * 0.22,
          a: 0.05 + Math.random() * 0.07,
          core: Math.random() > 0.35
        });
      }
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      // soft glow top-right
      var g = ctx.createRadialGradient(W * 0.78, H * 0.12, 0, W * 0.78, H * 0.12, W * 0.55);
      g.addColorStop(0, 'rgba(111,160,245,0.16)'); g.addColorStop(1, 'rgba(111,160,245,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(-0.52);
      var L = Math.max(W, H) * 1.6;
      list.forEach(function (b) {
        b.x += b.v;
        if (b.x > W * 1.1) b.x = -W * 0.6 - b.w;
        var x = b.x - W / 2;
        var grad = ctx.createLinearGradient(x, 0, x + b.w, 0);
        grad.addColorStop(0, 'rgba(49,103,202,0)');
        grad.addColorStop(0.5, 'rgba(49,103,202,' + b.a + ')');
        grad.addColorStop(1, 'rgba(49,103,202,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, -L / 2, b.w, L);
        if (b.core) {
          ctx.fillStyle = 'rgba(111,160,245,' + (b.a * 2.6) + ')';
          ctx.fillRect(x + b.w / 2 - 1, -L / 2, 2, L);
        }
      });
      ctx.restore();
      if (active && !document.hidden) raf = requestAnimationFrame(draw);
      else raf = null;
    }
    function setActive(on) {
      active = on;
      if (on && !raf) { size(); if (!list.length) seed(); raf = requestAnimationFrame(draw); }
    }
    window.addEventListener('resize', function () { if (active) { size(); seed(); } });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && active && !raf) raf = requestAnimationFrame(draw); });
    return { setActive: setActive };
  })();

  /* ---------------- pointer tilt on the dashboard mock ---------------- */
  (function () {
    var wrap = hero.querySelector('.dash-wrap'), card = wrap && wrap.querySelector('.dash');
    if (!wrap || !card || reduce || window.matchMedia('(hover: none)').matches) return;
    var slide = wrap.closest('.slide');
    slide.addEventListener('mousemove', function (e) {
      var r = wrap.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'rotateY(' + (px * 8).toFixed(2) + 'deg) rotateX(' + (-py * 6).toFixed(2) + 'deg)';
    });
    slide.addEventListener('mouseleave', function () { card.style.transform = ''; });
  })();

  // init
  dots[idx].classList.add('is-active'); dots[idx].setAttribute('aria-selected', 'true');
  if (reduce) dots[idx].classList.add('is-static');
  announce();
  beams.setActive(slides[idx].hasAttribute('data-beams'));
  restart();
})();
