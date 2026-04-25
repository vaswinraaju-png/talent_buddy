/* ============================================================
   TalentBuddy – Blog Lead Capture System
   File: assets/js/blog-lead-capture.js
   Include AFTER main.js on all blog article pages.

   Renders 1 lead capture surface:
   Fixed sidebar (desktop: always visible; mobile: shows after 40% scroll with close button)
   Submits to the same Google Forms endpoint as homepage.
   ============================================================ */

(function () {
  'use strict';

  /* ── CONFIG ── */
  var FORM_ID  = '1FAIpQLSeJyIisoTBEP-u1PPW5fAqgkXxGzgat1VsECyfKs9aBWbll8Q';
  var FORM_URL = 'https://docs.google.com/forms/d/e/' + FORM_ID + '/formResponse';

  var ENTRY = {
    fname    : 'entry.57553000',
    lname    : 'entry.201510226',
    phone    : 'entry.723918717',
    email    : 'entry.920695701',
    profile  : 'entry.65541856',
    situation: 'entry.1628514649',
  };

  /* ── SHARED FORM FIELDS HTML ── */
  function formFieldsHTML(prefix) {
    return '<div class="lcf-row">' +
      '<div class="lcf-fg"><label>First Name</label><input id="' + prefix + '_fname" type="text" placeholder="Rahul" autocomplete="given-name"></div>' +
      '<div class="lcf-fg"><label>Last Name</label><input id="' + prefix + '_lname" type="text" placeholder="Kumar" autocomplete="family-name"></div>' +
    '</div>' +
    '<div class="lcf-fg">' +
      '<label>Phone / WhatsApp <span class="lcf-req">*</span></label>' +
      '<input id="' + prefix + '_phone" type="tel" placeholder="+91 XXXXX XXXXX" required autocomplete="tel">' +
    '</div>' +
    '<div class="lcf-fg">' +
      '<label>Email Address</label>' +
      '<input id="' + prefix + '_email" type="email" placeholder="rahul@email.com" autocomplete="email">' +
    '</div>' +
    '<div class="lcf-fg">' +
      '<label>I Am A</label>' +
      '<select id="' + prefix + '_profile">' +
        '<option value="">Select your profile</option>' +
        '<option>Fresh Graduate</option>' +
        '<option>Working Professional (Looking to Switch)</option>' +
        '<option>Career Switcher (Changing Domain)</option>' +
        '<option>IT Professional</option>' +
        '<option>Sales / Marketing Professional</option>' +
        '<option>Other</option>' +
      '</select>' +
    '</div>';
  }

  /* ── SUBMIT HANDLER ── */
  function handleLCSubmit(prefix, btn) {
    var phoneEl = document.getElementById(prefix + '_phone');
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

    var params = new URLSearchParams();
    params.set(ENTRY.fname,     (document.getElementById(prefix + '_fname')     || {}).value || '');
    params.set(ENTRY.lname,     (document.getElementById(prefix + '_lname')     || {}).value || '');
    params.set(ENTRY.phone,     phone);
    params.set(ENTRY.email,     (document.getElementById(prefix + '_email')     || {}).value || '');
    params.set(ENTRY.profile,   (document.getElementById(prefix + '_profile')   || {}).value || '');
    params.set(ENTRY.situation, '');

    fetch(FORM_URL, {
      method : 'POST',
      mode   : 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body   : params.toString()
    }).finally(function () {
      btn.textContent      = '✓ Submitted! We\'ll call you within a few hours.';
      btn.style.background = '#0DBD6E';
      btn.disabled         = false;
      try { sessionStorage.setItem('lc_submitted', '1'); } catch(e) {}
    });
  }

  /* ── ALREADY SUBMITTED? SKIP ── */
  function alreadySubmitted() {
    try { return sessionStorage.getItem('lc_submitted') === '1'; } catch(e) { return false; }
  }

  /* ── INJECT STYLES ── */
  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = `
      .lcf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .lcf-fg { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
      .lcf-fg label { font-size: .72rem; font-weight: 600; color: rgba(255,255,255,.6); letter-spacing: .3px; }
      .lcf-fg input, .lcf-fg select {
        padding: 12px 14px;
        border: 1.5px solid rgba(255,255,255,.15);
        border-radius: 10px;
        font-size: .85rem;
        font-family: 'DM Sans', sans-serif;
        color: white;
        background: rgba(255,255,255,.08);
        outline: none;
        transition: border-color .2s, background .2s;
        width: 100%;
        box-sizing: border-box;
      }
      .lcf-fg input::placeholder { color: rgba(255,255,255,.3); }
      .lcf-fg select option { background: #0A1628; color: white; }
      .lcf-fg input:focus, .lcf-fg select:focus {
        border-color: #2164F3;
        background: rgba(33,100,243,.12);
      }
      .lcf-req { color: #FF6B2B; }
      .lcf-btn {
        width: 100%;
        background: linear-gradient(135deg, #2164F3, #7C3AED);
        color: white;
        padding: 13px;
        border-radius: 10px;
        border: none;
        cursor: pointer;
        font-family: 'Sora', sans-serif;
        font-weight: 700;
        font-size: .9rem;
        margin-top: 4px;
        transition: opacity .2s, transform .2s;
        letter-spacing: .2px;
      }
      .lcf-btn:hover { opacity: .9; transform: translateY(-1px); }

      /* ── FIXED SIDEBAR ── */
      #lc-sidebar {
        position: fixed;
        top: 100px;
        right: 40px;
        width: 320px;
        background: #0A1628;
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 16px;
        padding: 24px;
        z-index: 90;
        box-shadow: 0 8px 40px rgba(0,0,0,.3);
        max-height: calc(100vh - 140px);
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,.15) transparent;
        opacity: 0;
        pointer-events: none;
        transition: opacity .3s ease-in-out;
      }
      #lc-sidebar.lc-visible {
        opacity: 1;
        pointer-events: all;
      }
      .lc-sidebar-head { margin-bottom: 14px; }
      .lc-sidebar-head h4 {
        font-family: 'Sora', sans-serif;
        font-size: .88rem;
        font-weight: 800;
        color: white;
        margin-bottom: 4px;
        line-height: 1.3;
      }
      .lc-sidebar-head p { font-size: .74rem; color: rgba(255,255,255,.48); line-height: 1.55; }
      .lc-close {
        position: absolute;
        top: 12px; right: 14px;
        background: none; border: none;
        color: rgba(255,255,255,.4);
        font-size: 1.2rem;
        cursor: pointer;
        line-height: 1;
        padding: 2px 6px;
        border-radius: 4px;
        transition: color .2s;
        display: none;
      }
      .lc-close:hover { color: white; }

      /* Desktop: always visible, no close */
      @media (min-width: 900px) {
        #lc-sidebar { right: 40px; width: 320px; }
        #lc-sidebar .lc-close { display: none !important; }
      }
      /* Mobile: close button shown */
      @media (max-width: 899px) {
        #lc-sidebar { right: 20px; width: 90vw; max-width: 340px; }
        #lc-sidebar .lc-close { display: block !important; }
        .lcf-row { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── BUILD SIDEBAR ── */
  function buildSidebar() {
    var sidebar = document.createElement('div');
    sidebar.id  = 'lc-sidebar';
    sidebar.innerHTML =
      '<button class="lc-close" id="lc-sidebar-close" aria-label="Close sidebar">×</button>' +
      '<div class="lc-sidebar-head">' +
        '<h4>🎯 Get Interview Calls Faster</h4>' +
        '<p>Free 30-min call. We\'ll diagnose your job search and tell you exactly what to fix.</p>' +
      '</div>' +
      formFieldsHTML('sb') +
      '<button class="lcf-btn" onclick="lcSubmit(\'sb\', this)">Get My Free Call →</button>';

    document.body.appendChild(sidebar);

    var closeBtn = document.getElementById('lc-sidebar-close');

    function updateVisibility() {
      if (alreadySubmitted()) {
        sidebar.classList.remove('lc-visible');
        return;
      }

      var isDesktop     = window.innerWidth >= 900;
      var scrollPercent = (window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100;

      if (isDesktop) {
        sidebar.classList.add('lc-visible');
      } else {
        if (scrollPercent >= 40 && !sidebar.dataset.closed) {
          sidebar.classList.add('lc-visible');
        }
      }
    }

    closeBtn.addEventListener('click', function () {
      sidebar.classList.remove('lc-visible');
      sidebar.dataset.closed = '1';
    });

    setTimeout(updateVisibility, 200);
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility, { passive: true });
  }

  /* ── GLOBAL SUBMIT HANDLER ── */
  window.lcSubmit = function (prefix, btn) {
    handleLCSubmit(prefix, btn);
  };

  /* ── INIT ── */
  function init() {
    if (alreadySubmitted()) return;
    injectStyles();
    buildSidebar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
