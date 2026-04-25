/* ============================================================
   TalentBuddy – Blog Lead Capture System
   File: assets/js/blog-lead-capture.js
   Include AFTER main.js on all blog article pages.

   Renders 2 lead capture surfaces:
   1. Fixed sidebar (desktop: always visible with good margin;
                     mobile: shows after 40% scroll with close button)
   2. Exit-intent popup (mouse leaves viewport upward on desktop;
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
  function formFieldsHTML(prefix, includeSituation) {
    var html = '<div class="lcf-row">' +
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
    
    // Include "My Current Situation" only if explicitly requested (for exit popup)
    if (includeSituation) {
      html += '<div class="lcf-fg">' +
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
    
    return html;
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
      .lcf-row { 
        display: grid; 
        grid-template-columns: 1fr 1fr; 
        gap: 12px;
      }
      .lcf-fg { 
        display: flex; 
        flex-direction: column; 
        gap: 6px; 
        margin-bottom: 12px;
      }
      .lcf-fg label { 
        font-size: .72rem; 
        font-weight: 600; 
        color: rgba(255,255,255,.6); 
        letter-spacing: .3px; 
      }
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

      /* ── 1. FIXED SIDEBAR (TOP-RIGHT, STATIC ON DESKTOP) ── */
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
        transition: opacity .3s ease-in-out;
        opacity: 1;
        pointer-events: all;
        display: block !important;
      }
      #lc-sidebar.lc-visible {
        opacity: 1;
        pointer-events: all;
        display: block !important;
      }
      #lc-sidebar.lc-hidden { 
        opacity: 0;
        pointer-events: none;
        display: block !important;
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
        background: linear-gradient(135deg, #1f0f00 0%, #2d1500 100%);
        border: 1px solid rgba(255, 140, 60, .35);
        border-radius: 20px;
        padding: 32px 28px;
        max-width: 580px;
        width: 100%;
        position: relative;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(.95);
        transition: transform .3s;
        box-shadow: 0 24px 80px rgba(255, 120, 40, .4);
      }
      #lc-overlay.lc-show #lc-popup { transform: scale(1); }
      .lc-popup-head { margin-bottom: 20px; }
      .lc-popup-head .lc-eyebrow {
        font-size: .68rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: .6px;
        color: #FFB366; margin-bottom: 8px;
      }
      .lc-popup-head h3 {
        font-family: 'Sora', sans-serif;
        font-size: 1.15rem; font-weight: 800;
        color: white; line-height: 1.25; margin-bottom: 6px;
      }
      .lc-popup-head p { font-size: .82rem; color: rgba(255,255,255,.6); line-height: 1.55; }

      /* ── EXIT POPUP FORM FIELDS (Orange Accent) ── */
      #lc-popup .lcf-fg label {
        color: rgba(255, 200, 150, .8);
      }
      #lc-popup .lcf-fg input, 
      #lc-popup .lcf-fg select {
        border-color: rgba(255, 140, 60, .25);
        background: rgba(255, 140, 60, .05);
      }
      #lc-popup .lcf-fg input::placeholder {
        color: rgba(255, 140, 60, .4);
      }
      #lc-popup .lcf-fg input:focus,
      #lc-popup .lcf-fg select:focus {
        border-color: #FF8C3C;
        background: rgba(255, 140, 60, .15);
      }
      #lc-popup .lcf-btn {
        background: linear-gradient(135deg, #FF8C3C, #FF6B20);
        box-shadow: 0 8px 24px rgba(255, 107, 32, .4);
      }
      #lc-popup .lcf-btn:hover {
        opacity: .95;
      }

      /* ── SUCCESS STORIES CAROUSEL ── */
      .lc-success-stories {
        margin-bottom: 24px;
      }
      .lc-stories-carousel {
        position: relative;
        width: 100%;
        height: 300px;
        border-radius: 16px;
        overflow: hidden;
        background: rgba(0,0,0,.2);
        margin-bottom: 16px;
      }
      .lc-story-img {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        transition: opacity .4s ease-in-out;
      }
      .lc-story-img.lc-story-active {
        opacity: 1;
      }
      .lc-stories-nav {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 14px;
      }
      .lc-stories-btn {
        background: rgba(255, 140, 60, .2);
        color: #FFB366;
        border: 1px solid rgba(255, 140, 60, .3);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.1rem;
        transition: all .2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .lc-stories-btn:hover {
        background: rgba(255, 140, 60, .4);
        border-color: rgba(255, 140, 60, .6);
      }
      .lc-stories-dots {
        display: flex;
        gap: 8px;
        flex: 1;
        justify-content: center;
      }
      .lc-stories-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 140, 60, .3);
        cursor: pointer;
        transition: all .2s;
      }
      .lc-stories-dot.lc-dot-active {
        background: #FFB366;
        width: 24px;
        border-radius: 4px;
      }
      .lc-stories-text {
        text-align: center;
        font-size: .82rem;
        color: rgba(255, 200, 150, .7);
        line-height: 1.5;
      }

      /* ── RESPONSIVE ── */
      @media (min-width: 900px) {
        #lc-sidebar { 
          display: block !important;
          right: 40px;
          width: 320px;
        }
        #lc-sidebar .lc-close { display: none !important; }
      }
      @media (max-width: 899px) {
        #lc-sidebar { 
          position: fixed;
          bottom: auto;
          top: auto;
          right: 20px;
          width: 90vw;
          max-width: 340px;
        }
        #lc-sidebar .lc-close { display: block !important; }
        .lcf-row { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ══════════════════════════════════════════
     1. FIXED SIDEBAR (TOP-RIGHT, ONLY ON BLOG CONTENT)
  ══════════════════════════════════════════ */
  function buildSidebar() {
    console.log('[LC] Building sidebar...');
    
    var sidebar = document.createElement('div');
    sidebar.id  = 'lc-sidebar';
    sidebar.innerHTML =
      '<button class="lc-close" id="lc-sidebar-close" aria-label="Close" style="display:none;">×</button>' +
      '<div class="lc-sidebar-head">' +
        '<h4>🎯 Get Interview Calls Faster</h4>' +
        '<p>Free 30-min call. We\'ll diagnose your job search and tell you exactly what to fix.</p>' +
      '</div>' +
      formFieldsHTML('sb', false) +
      '<button class="lcf-btn" onclick="lcSubmit(\'sb\', this)">Get My Free Call →</button>';

    document.body.appendChild(sidebar);
    console.log('[LC] Sidebar created and appended to body', sidebar);

    var closeBtn = document.getElementById('lc-sidebar-close');

    // Desktop: always visible, no close button
    // Mobile: show after 40% scroll, with close button
    function updateSidebarVisibility() {
      if (alreadySubmitted()) {
        sidebar.classList.remove('lc-visible');
        return;
      }

      var isDesktop = window.innerWidth >= 900;
      var scrollY = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      if (isDesktop) {
        // Desktop: always show sidebar, no close button
        sidebar.classList.add('lc-visible');
        closeBtn.style.display = 'none';
      } else {
        // Mobile: show after 40% scroll, with close button
        if (scrollPercent >= 40 && !sidebar.classList.contains('lc-hidden')) {
          sidebar.classList.add('lc-visible');
          closeBtn.style.display = 'block';
        } else if (scrollPercent < 40 || sidebar.classList.contains('lc-hidden')) {
          sidebar.classList.remove('lc-visible');
        }
      }
    }

    // Close button (mobile only)
    closeBtn.addEventListener('click', function () {
      sidebar.classList.add('lc-hidden');
    });

    // Initial check
    setTimeout(updateSidebarVisibility, 200);

    // Monitor scroll and resize
    window.addEventListener('scroll', updateSidebarVisibility, { passive: true });
    window.addEventListener('resize', updateSidebarVisibility, { passive: true });
  }

  /* ══════════════════════════════════════════
     2. EXIT-INTENT POPUP
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
      '<div class="lc-success-stories">' +
        '<div class="lc-stories-carousel" id="lc-stories-carousel">' +
          '<img src="/assets/images/success-stories/story-1.jpg" alt="Success Story 1" class="lc-story-img lc-story-active">' +
          '<img src="/assets/images/success-stories/story-2.jpg" alt="Success Story 2" class="lc-story-img">' +
          '<img src="/assets/images/success-stories/story-3.jpg" alt="Success Story 3" class="lc-story-img">' +
          '<img src="/assets/images/success-stories/story-4.jpg" alt="Success Story 4" class="lc-story-img">' +
          '<img src="/assets/images/success-stories/story-5.jpg" alt="Success Story 5" class="lc-story-img">' +
          '<img src="/assets/images/success-stories/story-6.jpg" alt="Success Story 6" class="lc-story-img">' +
        '</div>' +
        '<div class="lc-stories-nav">' +
          '<button class="lc-stories-btn lc-stories-prev" id="lc-stories-prev">❮</button>' +
          '<div class="lc-stories-dots" id="lc-stories-dots"></div>' +
          '<button class="lc-stories-btn lc-stories-next" id="lc-stories-next">❯</button>' +
        '</div>' +
        '<p class="lc-stories-text">Join 1000+ candidates who landed their dream jobs. Your story could be next!</p>' +
      '</div>' +
      formFieldsHTML('ep', true) +
      '<button class="lcf-btn" onclick="lcSubmit(\'ep\', this)">Get My Free Discovery Call →</button>';

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Success Stories Carousel Logic
    var storyImages = document.querySelectorAll('.lc-story-img');
    var currentStoryIndex = 0;
    var totalStories = storyImages.length;

    // Create dots
    var dotsContainer = document.getElementById('lc-stories-dots');
    for (var i = 0; i < totalStories; i++) {
      var dot = document.createElement('span');
      dot.className = 'lc-stories-dot' + (i === 0 ? ' lc-dot-active' : '');
      dot.addEventListener('click', function(idx) {
        return function() { goToStory(idx); };
      }(i));
      dotsContainer.appendChild(dot);
    }

    function showStory(index) {
      storyImages.forEach(function(img) { img.classList.remove('lc-story-active'); });
      document.querySelectorAll('.lc-stories-dot').forEach(function(dot) { dot.classList.remove('lc-dot-active'); });
      
      storyImages[index].classList.add('lc-story-active');
      document.querySelectorAll('.lc-stories-dot')[index].classList.add('lc-dot-active');
    }

    function goToStory(index) {
      currentStoryIndex = index;
      showStory(currentStoryIndex);
    }

    function nextStory() {
      currentStoryIndex = (currentStoryIndex + 1) % totalStories;
      showStory(currentStoryIndex);
    }

    function prevStory() {
      currentStoryIndex = (currentStoryIndex - 1 + totalStories) % totalStories;
      showStory(currentStoryIndex);
    }

    document.getElementById('lc-stories-next').addEventListener('click', nextStory);
    document.getElementById('lc-stories-prev').addEventListener('click', prevStory);

    function showPopup() {
      if (alreadySubmitted()) return;
      overlay.classList.add('lc-show');
    }

    function hidePopup() {
      overlay.classList.remove('lc-show');
    }

    // Desktop: mouse exits viewport upward
    document.addEventListener('mouseleave', function (e) {
      if (e.clientY < 20) {
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
    console.log('[LC] Initializing lead capture system...');
    
    if (alreadySubmitted()) {
      console.log('[LC] User already submitted, skipping');
      return;
    }

    injectStyles();
    console.log('[LC] Styles injected');
    
    buildSidebar();
    console.log('[LC] Sidebar built');
    
    buildExitPopup();
    console.log('[LC] Exit popup built');
    
    console.log('[LC] Lead capture system ready!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
