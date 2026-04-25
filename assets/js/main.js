/* ============================================================
   TalentBuddy – Main JavaScript
   File: assets/js/main.js
   ============================================================ */

/* ── NAV TOGGLE ── */
(function () {
  // Wait until DOM is ready before querying elements, so the
  // hamburger never silently fails on slow/deferred loads.
  function initNav() {
    const mnav   = document.getElementById('mnav');
    const hbgBtn = document.querySelector('.hbg');

    if (!mnav || !hbgBtn) return; // guard: elements not present on this page

    function toggleNav() {
      const isOpen = mnav.classList.toggle('open');
      hbgBtn.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeNav() {
      mnav.classList.remove('open');
      hbgBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    // Expose to inline onclick attributes
    window.toggleNav = toggleNav;
    window.closeNav  = closeNav;

    // Close mobile nav when clicking outside
    document.addEventListener('click', function (e) {
      if (mnav.classList.contains('open') && !mnav.contains(e.target) && !hbgBtn.contains(e.target)) {
        closeNav();
      }
    });

    // Close mobile nav on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mnav.classList.contains('open')) closeNav();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();


/* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */
document.addEventListener('click', function (e) {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const id = anchor.getAttribute('href');
  if (id === '#') return;
  const target = document.querySelector(id);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});


/* ── SCROLL REVEAL ── */
(function () {
  const items = document.querySelectorAll('.fi');
  if (!items.length) return;

  // Group items by their closest section/parent so stagger resets per section.
  // This prevents item #40 on the page waiting 40*40ms = 1.6s before appearing.
  const sectionMap = new Map();
  items.forEach(function (el) {
    const section = el.closest('section, header, .slider-outer, footer') || document.body;
    if (!sectionMap.has(section)) sectionMap.set(section, []);
    sectionMap.get(section).push(el);
  });

  // Build a per-element index that resets at each section boundary, capped at 5
  const indexMap = new Map();
  sectionMap.forEach(function (els) {
    els.forEach(function (el, i) {
      indexMap.set(el, Math.min(i, 5)); // cap stagger so nothing waits >200ms
    });
  });

  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const i = indexMap.get(entry.target) || 0;
        setTimeout(function () {
          entry.target.classList.add('vis');
        }, i * 40); // 40ms per step (was 65ms) — snappier
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,           // trigger earlier (was 0.08)
    rootMargin: '0px 0px -40px 0px'  // reveal before fully in viewport
  });

  items.forEach(function (el) { obs.observe(el); });
})();


/* ── SUCCESS STORY SLIDER ── */
(function () {
  const track     = document.getElementById('sliderTrack');
  const dotsWrap  = document.getElementById('sliderDots');
  const sliderOuter = document.getElementById('sliderOuter');
  const prevBtn   = document.getElementById('sarr-prev');
  const nextBtn   = document.getElementById('sarr-next');

  if (!track || !dotsWrap || !sliderOuter) return;

  const cards   = Array.from(track.querySelectorAll('.ss-card'));
  const total   = cards.length;
  const GAP     = 20;
  let current   = 0;
  let autoTimer = null;
  let dragging  = false;
  let startX    = 0;
  let startOff  = 0;

  // Build dots
  const dots = cards.map(function (_, i) {
    const d = document.createElement('button');
    d.className = 'sdot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Story ' + (i + 1));
    d.setAttribute('role', 'tab');
    d.addEventListener('click', function () { goTo(i); });
    dotsWrap.appendChild(d);
    return d;
  });

  function cardW() {
    // Guard: if first card hasn't rendered yet (offsetWidth === 0),
    // fall back to a reasonable default so slider math never breaks.
    const w = cards[0] ? cards[0].offsetWidth : 0;
    return (w > 0 ? w : 380) + GAP;
  }
  function visible() { return Math.max(1, Math.floor(sliderOuter.clientWidth * 0.9 / cardW())); }
  function maxIdx()  { return Math.max(0, total - visible()); }

  function goTo(idx, resetAuto) {
    if (resetAuto === undefined) resetAuto = true;
    current = Math.max(0, Math.min(idx, maxIdx()));
    track.style.transform = 'translateX(-' + (current * cardW()) + 'px)';
    dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current >= maxIdx();
    if (resetAuto) { clearInterval(autoTimer); startAuto(); }
  }

  window.slideMove = function (dir) { goTo(current + dir); };

  function startAuto() {
    autoTimer = setInterval(function () {
      goTo(current < maxIdx() ? current + 1 : 0, false);
    }, 4500);
  }

  // Pause on hover
  track.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
  track.addEventListener('mouseleave', startAuto);

  // Touch swipe
  var touchStartX = 0;
  var touchStartTime = 0;
  track.addEventListener('touchstart', function (e) {
    touchStartTime = Date.now();
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', function (e) {
    var dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40 && Date.now() - touchStartTime < 350) {
      dx > 0 ? goTo(current + 1) : goTo(current - 1);
    }
  }, { passive: true });

  // Mouse drag
  track.addEventListener('mousedown', function (e) {
    dragging = true;
    startX = e.clientX;
    startOff = current * cardW();
    track.style.transition = 'none';
    clearInterval(autoTimer);
  });

  window.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    track.style.transform = 'translateX(-' + (startOff + startX - e.clientX) + 'px)';
  });

  window.addEventListener('mouseup', function (e) {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    var diff = startX - e.clientX;
    if (Math.abs(diff) > 60) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
    } else {
      goTo(current);
    }
  });

  // Recalculate on resize (debounced)
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { goTo(current, false); }, 150);
  });

  goTo(0);
  startAuto();
})();


/* ── CONTACT FORM → GOOGLE FORMS ── */
function handleSubmit(btn) {
  var phoneEl = document.getElementById('f_phone');
  var phone   = phoneEl ? phoneEl.value.trim() : '';

  if (!phone) {
    if (phoneEl) {
      phoneEl.style.borderColor = '#E65100';
      phoneEl.focus();
    }
    return;
  }

  btn.textContent = 'Submitting…';
  btn.disabled    = true;

  var FORM_ID  = '1FAIpQLSeJyIisoTBEP-u1PPW5fAqgkXxGzgat1VsECyfKs9aBWbll8Q';
  var FORM_URL = 'https://docs.google.com/forms/d/e/' + FORM_ID + '/formResponse';

  var params = new URLSearchParams({
    'entry.57553000'  : (document.getElementById('f_fname') || {}).value || '',
    'entry.201510226' : (document.getElementById('f_lname') || {}).value || '',
    'entry.723918717' : phone,
    'entry.920695701' : (document.getElementById('f_email') || {}).value || '',
    'entry.65541856'  : (document.getElementById('f_profile') || {}).value || '',
    'entry.1628514649': (document.getElementById('f_situation') || {}).value || '',
  });

  fetch(FORM_URL, {
    method : 'POST',
    mode   : 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body   : params.toString()
  }).finally(function () {
    btn.textContent      = "✓ Submitted! We'll call you within a few hours.";
    btn.style.background = '#0DBD6E';
    btn.disabled         = false;
  });
}
