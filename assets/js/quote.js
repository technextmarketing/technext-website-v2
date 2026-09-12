/* Quotation builder: keeps the summary panel in sync with the choices and folds a plain-text
   scope summary into the submission so sales@technext.asia gets one readable block. */
(function () {
  'use strict';
  var form = document.getElementById('quote-form');
  if (!form) return;
  var $ = function (s, r) { return (r || form).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || form).querySelectorAll(s)); };

  var out = {
    apps: $('[data-sum=apps]'), users: $('[data-sum=users]'), hosting: $('[data-sum=hosting]'),
    services: $('[data-sum=services]'), timeline: $('[data-sum=timeline]'), count: $('[data-sum=count]')
  };
  var usersRange = $('#q-users'), usersOut = $('#q-users-out');

  function checked(name) {
    return $$('input[name="' + name + '"]:checked').map(function (i) { return i.value; });
  }
  function fill(el, list, emptyText) {
    if (!el) return;
    el.innerHTML = list.length ? list.join(', ') : '<span class="empty">' + emptyText + '</span>';
  }
  function update() {
    var apps = checked('apps'), services = checked('services');
    var hosting = checked('hosting')[0], timeline = checked('timeline')[0];
    fill(out.apps, apps, 'No apps picked yet');
    fill(out.services, services, 'None yet');
    fill(out.hosting, hosting ? [hosting] : [], 'Not chosen');
    fill(out.timeline, timeline ? [timeline] : [], 'Not chosen');
    if (out.users) out.users.textContent = usersRange.value + (usersRange.value === usersRange.max ? '+' : '') + ' users';
    if (usersOut) usersOut.value = usersRange.value + (usersRange.value === usersRange.max ? '+' : '');
    if (out.count) out.count.textContent = apps.length + ' app' + (apps.length === 1 ? '' : 's');
  }
  form.addEventListener('change', update);
  usersRange.addEventListener('input', update);
  update();

  // Called by site.js right before the request is sent.
  window.tnQuoteBeforeSend = function (f) {
    var lines = [
      'Odoo apps: ' + (checked('apps').join(', ') || '—'),
      'Users: ' + usersRange.value + (usersRange.value === usersRange.max ? '+' : ''),
      'Hosting: ' + (checked('hosting')[0] || '—'),
      'Services: ' + (checked('services').join(', ') || '—'),
      'Timeline: ' + (checked('timeline')[0] || '—')
    ];
    $('#q-summary').value = lines.join('\n');
  };
})();
