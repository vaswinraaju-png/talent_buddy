/* ============================================================
   TalentBuddy – Main JavaScript
   File: assets/js/main.js
   ============================================================ */

/* ── NAV TOGGLE ── */
function toggleNav() { document.getElementById('mnav').classList.toggle('open'); }
function closeNav()  { document.getElementById('mnav').classList.remove('open'); }

/* ── SCROLL REVEAL ── */
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) setTimeout(() => e.target.classList.add('vis'), i * 65);
  });
}, { threshold: 0.08 });
document.querySelectorAll('.fi').forEach(el => obs.observe(el));

/* ── SUCCESS STORY SLIDER ── */
(function () {
  const track    = document.getElementById('sliderTrack');
  const dotsWrap = document.getElementById('sliderDots');
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll('.ss-card'));
  const total = cards.length;
  const GAP   = 20;
  let current = 0, autoTimer, dragging = false, startX = 0, startOff = 0;

  /* Build dots */
  const dots = cards.map((_, i) => {
    const d = document.createElement('button');
    d.className = 'sdot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Story ' + (i + 1));
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
    return d;
  });

  function cardW()   { return cards[0].offsetWidth + GAP; }
  function visible() { return Math.max(1, Math.floor(document.getElementById('sliderOuter').clientWidth * 0.9 / cardW())); }
  function maxIdx()  { return Math.max(0, total - visible()); }

  function goTo(idx, resetAuto = true) {
    current = Math.max(0, Math.min(idx, maxIdx()));
    track.style.transform = 'translateX(-' + (current * cardW()) + 'px)';
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    document.getElementById('sarr-prev').disabled = current === 0;
    document.getElementById('sarr-next').disabled = current >= maxIdx();
    if (resetAuto) { clearInterval(autoTimer); startAuto(); }
  }

  window.slideMove = dir => goTo(current + dir);

  function startAuto() {
    autoTimer = setInterval(() => goTo(current < maxIdx() ? current + 1 : 0, false), 4500);
  }

  /* Pause on hover */
  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', startAuto);

  /* Touch swipe */
  let ts = 0, tx = 0;
  track.addEventListener('touchstart', e => { ts = Date.now(); tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = tx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40 && Date.now() - ts < 350) dx > 0 ? goTo(current + 1) : goTo(current - 1);
  }, { passive: true });

  /* Mouse drag */
  track.addEventListener('mousedown', e => {
    dragging = true; startX = e.clientX; startOff = current * cardW();
    track.style.transition = 'none'; clearInterval(autoTimer);
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    track.style.transform = 'translateX(-' + (startOff + startX - e.clientX) + 'px)';
  });
  window.addEventListener('mouseup', e => {
    if (!dragging) return; dragging = false; track.style.transition = '';
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 60) diff > 0 ? goTo(current + 1) : goTo(current - 1);
    else goTo(current);
  });

  /* Recalc on resize */
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => goTo(current, false), 150); });

  goTo(0);
  startAuto();
})();

/* ── CONTACT FORM → GOOGLE FORMS ── */
function handleSubmit(btn) {
  const phone = document.getElementById('f_phone').value.trim();
  if (!phone) {
    document.getElementById('f_phone').style.borderColor = '#E65100';
    document.getElementById('f_phone').focus();
    return;
  }

  btn.textContent = 'Submitting…';
  btn.disabled    = true;

  const FORM_ID  = '1FAIpQLSeJyIisoTBEP-u1PPW5fAqgkXxGzgat1VsECyfKs9aBWbll8Q';
  const FORM_URL = 'https://docs.google.com/forms/d/e/' + FORM_ID + '/formResponse';

  const params = new URLSearchParams({
    'entry.57553000'  : document.getElementById('f_fname').value.trim(),
    'entry.201510226' : document.getElementById('f_lname').value.trim(),
    'entry.723918717' : phone,
    'entry.920695701' : document.getElementById('f_email').value.trim(),
    'entry.65541856'  : document.getElementById('f_profile').value,
    'entry.1628514649': document.getElementById('f_situation').value,
  });

  fetch(FORM_URL, {
    method : 'POST',
    mode   : 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body   : params.toString()
  }).finally(() => {
    btn.textContent       = "Submitted! We'll call you within a few hours.";
    btn.style.background  = '#0DBD6E';
  });
}
