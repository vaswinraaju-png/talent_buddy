/* ============================================================
   TalentBuddy – Blog Lead Capture System
   File: assets/js/blog-lead-capture.js
   Include AFTER main.js on all blog article pages.

   Renders 4 lead capture surfaces:
   1. Fixed sidebar (top-right, NOT sticky/floating) (desktop ≥900px)
   2. Mobile bottom bar (< 900px) — collapses to a tab, expands on tap
   3. Mid-article inline banner (injected after 3rd <h2> or 40% scroll)
   4. Exit-intent popup (mouse leaves viewport upward on desktop;
                         30s timer fallback on mobile)

   All surfaces submit to the same Google Forms endpoint as homepage.
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
    '</div>' +
    '<div class="lcf-fg">' +
      '<label>My Current Situation</label>' +
      '<select id="' + prefix + '_situation">' +
        '<option value="">Select the scenario that fits you best</option>' +
        '<option>I am a fresher with no work experience and struggling to get my first job interview</option>' +
        '<option>I have been applying to 50+ jobs for months but getting zero interview calls</option>' +
        '<option>I am currently employed but want to switch to a better role or higher pay</option>' +
        '<option>I want to change my career domain completely and do not know how to reposition myself</option>' +
        '<option>I have an overseas job opportunity and need help with the process and visa filing</option>' +
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

    var origText     = btn.textContent;
    btn.textContent  = 'Submitting…';
    btn.disabled     = true;

    var params = new URLSearchParams();
    params.set(ENTRY.fname,     (document.getElementById(prefix + '_fname')     || {}).value || '');
    params.set(ENTRY.lname,     (document.getElementById(prefix + '_lname')     || {}).value || '');
    params.set(ENTRY.phone,     phone);
    params.set(ENTRY.email,     (document.getElementById(prefix + '_email')     || {}).value || '');
    params.set(ENTRY.profile,   (document.getElementById(prefix + '_profile')   || {}).value || '');
    params.set(ENTRY.situation, (document.getElementById(prefix + '_situation') || {}).value || '');

    fetch(FORM_URL, {
      method : 'POST',
      mode   : 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body   : params.toString()
    }).finally(function () {
      btn.textContent      = '✓ Submitted! We\'ll call you within a few hours.';
      btn.style.background = '#0DBD6E';
      btn.disabled         = false;
      // Mark as submitted so other surfaces know
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
      /* ── SHARED FORM STYLES ── */
      .lcf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .lcf-fg { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
      .lcf-fg label { font-size: .72rem; font-weight: 600; color: rgba(255,255,255,.6); letter-spacing: .3px; }
      .lcf-fg input, .lcf-fg select {
        padding: 10px 12px;
        border: 1.5px solid rgba(255,255,255,.15);
        border-radius: 8px;
        font-size: .83rem;
        font-family: 'DM Sans', sans-serif;
        color: white;
        background: rgba(255,255,255,.08);
        outline: none;
        transition: border-color .2s, background .2s;
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

      /* ── 1. FIXED SIDEBAR (TOP-RIGHT, ONLY ON BLOG CONTENT) ── */
      #lc-sidebar {
        position: fixed;
        top: 80px;
        right: 20px;
        width: 300px;
        background: #0A1628;
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 16px;
        padding: 22px 20px;
        z-index: 90;
        box-shadow: 0 8px 40px rgba(0,0,0,.3);
        max-height: calc(100vh - 120px);
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,.15) transparent;
        transition: opacity .3s ease-in-out;
        opacity: 1;
        display: none;
      }
      #lc-sidebar.lc-hidden { 
        display: none !important;
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
      }
      .lc-close:hover { color: white; }

      /* ── 2. MOBILE BOTTOM BAR ── */
      #lc-mobile-bar {
        position: fixed;
        bottom: 0; left: 0; right: 0;
        background: #0A1628;
        border-top: 1px solid rgba(255,255,255,.12);
        z-index: 90;
        transform: translateY(calc(100% - 56px));
        transition: transform .4s cubic-bezier(.25,.46,.45,.94);
        box-shadow: 0 -8px 40px rgba(0,0,0,.4);
        max-height: 92vh;
        overflow-y: auto;
        display: none;
      }
      #lc-mobile-bar.lc-expanded { transform: translateY(0); }
      #lc-mobile-bar.lc-hidden { transform: translateY(100%); }
      .lc-bar-handle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        height: 56px;
        cursor: pointer;
        flex-shrink: 0;
      }
      .lc-bar-handle-left { display: flex; align-items: center; gap: 10px; }
      .lc-bar-pill {
        background: linear-gradient(135deg, #2164F3, #7C3AED);
        color: white;
        font-family: 'Sora', sans-serif;
        font-size: .7rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 100px;
        text-transform: uppercase;
        letter-spacing: .4px;
      }
      .lc-bar-handle span { color: white; font-size: .85rem; font-weight: 600; }
      .lc-bar-arrow { color: rgba(255,255,255,.5); font-size: 1.1rem; transition: transform .3s; }
      #lc-mobile-bar.lc-expanded .lc-bar-arrow { transform: rotate(180deg); }
      .lc-bar-body { padding: 0 20px 24px; }
      .lc-bar-body .lc-sidebar-head { display: none; }

      /* ── 3. MID-ARTICLE BANNER ── */
      .lc-mid-banner {
        background: linear-gradient(135deg, #0A1628 0%, #1a2a4a 100%);
        border: 1px solid rgba(33,100,243,.3);
        border-radius: 16px;
        padding: 28px 28px 24px;
        margin: 40px 0;
        position: relative;
        overflow: hidden;
      }
      .lc-mid-banner::before {
        content: '';
        position: absolute;
        top: -60px; right: -60px;
        width: 200px; height: 200px;
        background: radial-gradient(circle, rgba(124,58,237,.25) 0%, transparent 70%);
        pointer-events: none;
      }
      .lc-mid-banner-head { margin-bottom: 18px; position: relative; z-index: 1; }
      .lc-mid-banner-head .lc-eyebrow {
        font-size: .68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .6px;
        color: #C4B5FD;
        margin-bottom: 6px;
      }
      .lc-mid-banner-head h3 {
        font-family: 'Sora', sans-serif;
        font-size: 1.05rem;
        font-weight: 800;
        color: white;
        line-height: 1.3;
        margin-bottom: 5px;
      }
      .lc-mid-banner-head p { font-size: .82rem; color: rgba(255,255,255,.5); line-height: 1.55; }
      .lc-mid-banner form { position: relative; z-index: 1; }

      /* ── 4. EXIT-INTENT POPUP ── */
      #lc-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.6);
        z-index: 200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        pointer-events: none;
        transition: opacity .3s;
        backdrop-filter: blur(4px);
      }
      #lc-overlay.lc-show {
        opacity: 1;
        pointer-events: all;
      }
      #lc-popup {
        background: #0A1628;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 20px;
        padding: 32px 28px;
        max-width: 480px;
        width: 100%;
        position: relative;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(.95);
        transition: transform .3s;
        box-shadow: 0 24px 80px rgba(0,0,0,.6);
      }
      #lc-overlay.lc-show #lc-popup { transform: scale(1); }
      .lc-popup-head { margin-bottom: 20px; }
      .lc-popup-head .lc-eyebrow {
        font-size: .68rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: .6px;
        color: #C4B5FD; margin-bottom: 8px;
      }
      .lc-popup-head h3 {
        font-family: 'Sora', sans-serif;
        font-size: 1.15rem; font-weight: 800;
        color: white; line-height: 1.25; margin-bottom: 6px;
      }
      .lc-popup-head p { font-size: .82rem; color: rgba(255,255,255,.5); line-height: 1.55; }

      /* ── RESPONSIVE ── */
      @media (min-width: 900px) {
        #lc-sidebar { display: block; }
        #lc-mobile-bar { display: none !important; }
      }
      @media (max-width: 899px) {
        #lc-sidebar { display: none !important; }
        #lc-mobile-bar { display: block; }
        .lcf-row { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ══════════════════════════════════════════
     1. FIXED SIDEBAR (TOP-RIGHT, ONLY ON BLOG CONTENT)
  ══════════════════════════════════════════ */
  function buildSidebar() {
    var sidebar = document.createElement('div');
    sidebar.id  = 'lc-sidebar';
    sidebar.innerHTML =
      '<button class="lc-close" id="lc-sidebar-close" aria-label="Close">×</button>' +
      '<div class="lc-sidebar-head">' +
        '<h4>🎯 Get Interview Calls Faster</h4>' +
        '<p>Free 30-min call. We\'ll diagnose your job search and tell you exactly what to fix.</p>' +
      '</div>' +
      formFieldsHTML('sb') +
      '<button class="lcf-btn" onclick="lcSubmit(\'sb\', this)">Get My Free Call →</button>';

    document.body.appendChild(sidebar);

    // Close button hides the sidebar (user can still see other forms)
    document.getElementById('lc-sidebar-close').addEventListener('click', function () {
      sidebar.classList.add('lc-hidden');
    });

    // Show/hide sidebar based on blog content visibility
    var article = document.querySelector('article, .blog-body, main');
    var footer = document.querySelector('footer');

    function updateSidebarVisibility() {
      if (alreadySubmitted() || sidebar.classList.contains('lc-hidden')) {
        sidebar.style.display = 'none';
        return;
      }

      var articleTop = article ? article.getBoundingClientRect().top : Infinity;
      var footerTop = footer ? footer.getBoundingClientRect().top : Infinity;

      // Show sidebar only when article is visible and footer hasn't entered viewport
      if (articleTop < window.innerHeight && footerTop > window.innerHeight) {
        sidebar.style.display = 'block';
      } else {
        sidebar.style.display = 'none';
      }
    }

    // Initial check
    setTimeout(updateSidebarVisibility, 100);

    // Monitor scroll and resize
    window.addEventListener('scroll', updateSidebarVisibility, { passive: true });
    window.addEventListener('resize', updateSidebarVisibility, { passive: true });
  }

  /* ══════════════════════════════════════════
     2. MOBILE BOTTOM BAR
  ══════════════════════════════════════════ */
  function buildMobileBar() {
    var bar = document.createElement('div');
    bar.id  = 'lc-mobile-bar';
    bar.innerHTML =
      '<div class="lc-bar-handle" id="lc-bar-handle">' +
        '<div class="lc-bar-handle-left">' +
          '<div class="lc-bar-pill">Free Call</div>' +
          '<span>Get Interview Calls Faster</span>' +
        '</div>' +
        '<span class="lc-bar-arrow">▲</span>' +
      '</div>' +
      '<div class="lc-bar-body">' +
        '<div class="lc-sidebar-head">' +
          '<h4>🎯 Free 30-Min Discovery Call</h4>' +
          '<p>Tell us about yourself — we\'ll diagnose your job search blockers for free.</p>' +
        '</div>' +
        formFieldsHTML('mb') +
        '<button class="lcf-btn" onclick="lcSubmit(\'mb\', this)">Get My Free Call →</button>' +
      '</div>';

    document.body.appendChild(bar);

    // Show bar after 20% scroll
    var barShown = false;
    window.addEventListener('scroll', function () {
      var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (pct > 0.20 && !barShown && !alreadySubmitted()) {
        barShown = true;
        bar.style.display = 'block';
        // Small delay so CSS transition plays
        setTimeout(function () { bar.style.transform = 'translateY(calc(100% - 56px))'; }, 50);
      }
    }, { passive: true });

    document.getElementById('lc-bar-handle').addEventListener('click', function () {
      bar.classList.toggle('lc-expanded');
    });
  }

  /* ══════════════════════════════════════════
     3. MID-ARTICLE INLINE BANNER
  ══════════════════════════════════════════ */
  function buildMidBanner() {
    var banner = document.createElement('div');
    banner.className = 'lc-mid-banner';
    banner.innerHTML =
      '<div class="lc-mid-banner-head">' +
        '<div class="lc-eyebrow">Free 30-Min Discovery Call</div>' +
        '<h3>Still Not Getting Interview Calls?<br>Let\'s Fix That — For Free.</h3>' +
        '<p>Book a free call. We\'ll diagnose exactly what\'s blocking you and tell you how to fix it. No sales pressure.</p>' +
      '</div>' +
      '<form onsubmit="return false;">' +
        formFieldsHTML('mb2') +
        '<button class="lcf-btn" onclick="lcSubmit(\'mb2\', this)">Get My Free Discovery Call →</button>' +
      '</form>';

    // Inject after the 3rd <h2> in the article, or after 40% of article content
    var article = document.querySelector('article, .blog-body, main');
    if (!article) return;

    var h2s = article.querySelectorAll('h2');
    var target = h2s[2] ? h2s[2].parentNode : null; // after 3rd h2's parent

    if (target && h2s[2]) {
      h2s[2].after(banner);
    } else {
      // Fallback: inject at ~40% of article children
      var children = Array.from(article.children);
      var insertAt  = Math.floor(children.length * 0.4);
      var refNode   = children[insertAt];
      if (refNode) {
        article.insertBefore(banner, refNode);
      } else {
        article.appendChild(banner);
      }
    }
  }

  /* ══════════════════════════════════════════
     4. EXIT-INTENT POPUP
  ══════════════════════════════════════════ */
  function buildExitPopup() {
    var overlay = document.createElement('div');
    overlay.id  = 'lc-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Get a free discovery call');

    var popup = document.createElement('div');
    popup.id   = 'lc-popup';
    popup.innerHTML =
      '<button class="lc-close" id="lc-popup-close" aria-label="Close">×</button>' +
      '<div class="lc-popup-head">' +
        '<div class="lc-eyebrow">Wait — Before You Go</div>' +
        '<h3>Still Struggling to Get<br>Interview Calls?</h3>' +
        '<p>Book a free 30-min call. We\'ll diagnose your specific blockers and tell you exactly what to fix. Honest. No pressure.</p>' +
      '</div>' +
      formFieldsHTML('ep') +
      '<button class="lcf-btn" onclick="lcSubmit(\'ep\', this)">Get My Free Discovery Call →</button>';

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    function showPopup() {
      if (alreadySubmitted()) return;
      try {
        if (sessionStorage.getItem('lc_popup_seen')) return;
        sessionStorage.setItem('lc_popup_seen', '1');
      } catch(e) {}
      overlay.classList.add('lc-show');
    }

    function hidePopup() {
      overlay.classList.remove('lc-show');
    }

    // Desktop: mouse exits viewport upward
    var triggered = false;
    document.addEventListener('mouseleave', function (e) {
      if (e.clientY < 20 && !triggered) {
        triggered = true;
        showPopup();
      }
    });

    // Mobile fallback: show after 30 seconds of reading
    var mobileTimer = setTimeout(function () {
      if (window.innerWidth < 900 && !alreadySubmitted()) {
        showPopup();
      }
    }, 30000);

    // Close: button, overlay click, Escape key
    document.getElementById('lc-popup-close').addEventListener('click', hidePopup);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) hidePopup();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hidePopup();
    });
  }

  /* ── GLOBAL SUBMIT HANDLER (called from inline onclick) ── */
  window.lcSubmit = function (prefix, btn) {
    handleLCSubmit(prefix, btn);
  };

  /* ── INIT ── */
  function init() {
    if (alreadySubmitted()) return; // don't show forms if already submitted this session

    injectStyles();
    buildSidebar();
    buildMobileBar();
    buildMidBanner();
    buildExitPopup();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
