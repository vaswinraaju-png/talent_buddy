/* ============================================================
   TalentBuddy – Main JavaScript
   File: assets/js/main.js
   ============================================================ */

/* ── NAV TOGGLE ── */
(function () {
  const mnav   = document.getElementById('mnav');
  const hbgBtn = document.querySelector('.hbg');

  function toggleNav() {
    const isOpen = mnav.classList.toggle('open');
    if (hbgBtn) hbgBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeNav() {
    mnav.classList.remove('open');
    if (hbgBtn) hbgBtn.setAttribute('aria-expanded', 'false');
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

  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        setTimeout(function () {
          entry.target.classList.add('vis');
        }, i * 65);
        obs.unobserve(entry.target); // stop observing once visible
      }
    });
  }, { threshold: 0.08 });

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

  function cardW()   { return cards[0].offsetWidth + GAP; }
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
