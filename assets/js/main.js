/* ==========================================================================
   BlueStar Appliance Repair — interactions
   Progressive enhancement only: the page and the form work without JS.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     Current year is intentionally not injected — the footer carries
     the business's own copyright line from the source site.
     --------------------------------------------------------------- */

  /* ---------- Mobile navigation ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  var scrim = null;

  var closeTimer = null;

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('nav-open');

    // Keep the panel rendered until the slide-out finishes, then drop it from
    // layout entirely so it cannot widen the document.
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(function () {
      if (!nav.classList.contains('is-open')) nav.classList.remove('is-animating');
    }, 340);

    if (scrim) {
      scrim.classList.remove('is-open');
      var node = scrim;
      scrim = null;
      window.setTimeout(function () {
        if (node && node.parentNode) node.parentNode.removeChild(node);
      }, 300);
    }
  }

  function openNav() {
    if (!nav || !burger) return;
    window.clearTimeout(closeTimer);
    // Render the panel first (still translated off-screen), force a reflow,
    // then flip to the open position so the transition actually animates.
    nav.classList.add('is-animating');
    void nav.offsetWidth;
    nav.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('nav-open');
    scrim = document.createElement('div');
    scrim.className = 'nav-scrim';
    scrim.addEventListener('click', closeNav);
    document.body.appendChild(scrim);
    // force reflow so the opacity transition runs
    void scrim.offsetWidth;
    scrim.classList.add('is-open');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) closeNav();
      else openNav();
    });

    nav.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (link) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add('is-stuck');
    else header.classList.remove('is-stuck');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var revealables = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealables.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- Active nav link while scrolling ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Highlight today's opening hours ---------- */
  (function highlightToday() {
    var table = document.querySelector('.hours__table table');
    if (!table) return;
    var rows = table.querySelectorAll('tbody tr');
    var index = new Date().getDay(); // 0 = Sunday
    var rowIndex = index === 0 ? 6 : index - 1; // table starts on Monday
    if (rows[rowIndex]) rows[rowIndex].classList.add('is-today');
  })();

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contactForm');
  var alertBox = document.getElementById('formAlert');
  var pageField = document.getElementById('pageField');
  var submitBtn = document.getElementById('submitBtn');

  // Always stamp the current page so visitors return to the right place.
  if (pageField) pageField.value = window.location.href;

  var SUCCESS_HTML =
    "Thanks, your message was sent. We'll be in touch shortly — need help right away? " +
    'Call or text <a href="tel:2146283713">214-628-3713</a>.';

  function showAlert(html, isError) {
    if (!alertBox) return;
    alertBox.classList.toggle('alert--error', !!isError);
    var span = alertBox.querySelector('span');
    if (span) span.innerHTML = html;
    alertBox.hidden = false;
  }

  /* Plain (no-JS) submissions come back with ?submitted=1 */
  (function handleReturn() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('submitted') !== '1') return;
    showAlert(SUCCESS_HTML, false);
    if (alertBox) {
      alertBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }
    // Tidy the URL so a refresh doesn't re-show the banner.
    if (window.history && window.history.replaceState) {
      params.delete('submitted');
      var qs = params.toString();
      window.history.replaceState(
        {},
        '',
        window.location.pathname + (qs ? '?' + qs : '') + '#contact'
      );
    }
  })();

  function setFieldError(input, message) {
    var field = input.closest('.field');
    if (!field) return;
    var existing = field.querySelector('.error');
    if (message) {
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
      if (!existing) {
        existing = document.createElement('span');
        existing.className = 'error';
        field.appendChild(existing);
      }
      existing.textContent = message;
    } else {
      input.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
      if (existing) existing.remove();
    }
  }

  function validate() {
    var ok = true;
    var name = form.querySelector('#name');
    var email = form.querySelector('#email');

    if (name) {
      if (!name.value.trim()) { setFieldError(name, 'Please tell us your name.'); ok = false; }
      else setFieldError(name, null);
    }
    if (email) {
      var value = email.value.trim();
      if (!value) { setFieldError(email, 'An email address is required.'); ok = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        setFieldError(email, 'That email address does not look right.'); ok = false;
      } else setFieldError(email, null);
    }
    return ok;
  }

  if (form) {
    form.addEventListener('input', function (e) {
      if (e.target.classList && e.target.classList.contains('is-invalid')) validate();
    });

    form.addEventListener('submit', function (e) {
      // Keep _page fresh at submit time (covers in-page hash navigation).
      if (pageField) pageField.value = window.location.href;

      if (!validate()) {
        e.preventDefault();
        var firstBad = form.querySelector('.is-invalid');
        if (firstBad) firstBad.focus();
        return;
      }

      // No fetch available? Let the plain HTML POST proceed untouched.
      if (typeof window.fetch !== 'function') return;

      e.preventDefault();

      var payload = {};
      new FormData(form).forEach(function (value, key) {
        payload[key] = typeof value === 'string' ? value : String(value);
      });
      payload._page = window.location.href;

      var originalLabel = submitBtn ? submitBtn.textContent : 'Send';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      if (alertBox) alertBox.hidden = true;

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return { ok: res.ok }; });
        })
        .then(function (data) {
          if (data && data.ok) {
            form.reset();
            if (pageField) pageField.value = window.location.href;
            showAlert(SUCCESS_HTML, false);
            if (alertBox) {
              alertBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
            }
          } else {
            throw new Error('Submission rejected');
          }
        })
        .catch(function () {
          showAlert(
            'Sorry — that didn\'t go through. Please try again, or call or text us at ' +
            '<a href="tel:2146283713">214-628-3713</a>.',
            true
          );
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
    });
  }
})();
