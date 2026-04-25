/* ============================================================
   TalentBuddy – Blog Lead Capture System
   File: assets/js/blog-lead-capture.js
   Include AFTER main.js on ALL pages site-wide.

   Renders 2 surfaces:
   1. Fixed sidebar  — desktop always-on; mobile after 40% scroll
   2. Exit-intent popup — mini Interview Chances Calculator
      (desktop: mouse-leave upward; mobile: 30s timer)
      SKIPPED entirely on /tools/calculator.html

   All leads → same Google Forms endpoint as homepage.
   ============================================================ */

(function () {
  'use strict';

  /* ── SKIP ON STANDALONE CALCULATOR PAGE ── */
  if (window.location.pathname.indexOf('/tools/calculator') !== -1) return;

  /* ── CONFIG ── */
  var FORM_ID  = '1FAIpQLSeJyIisoTBEP-u1PPW5fAqgkXxGzgat1VsECyfKs9aBWbll8Q';
  var FORM_URL = 'https://docs.google.com/forms/d/e/' + FORM_ID + '/formResponse';
  var ENTRY = {
    fname:'entry.57553000', lname:'entry.201510226',
    phone:'entry.723918717', email:'entry.920695701',
    profile:'entry.65541856', situation:'entry.1628514649'
  };

  function alreadySubmitted() { try { return sessionStorage.getItem('lc_submitted') === '1'; } catch(e) { return false; } }
  function markSubmitted()    { try { sessionStorage.setItem('lc_submitted', '1'); } catch(e) {} }

  function submitForms(data, btn, successText) {
    var p = new URLSearchParams();
    p.set(ENTRY.fname,     data.fname     || '');
    p.set(ENTRY.lname,     data.lname     || '');
    p.set(ENTRY.phone,     data.phone     || '');
    p.set(ENTRY.email,     data.email     || '');
    p.set(ENTRY.profile,   data.profile   || '');
    p.set(ENTRY.situation, data.situation || '');
    fetch(FORM_URL, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:p.toString() })
      .finally(function() {
        if (btn) { btn.textContent = successText || '✓ Submitted!'; btn.style.background = '#0DBD6E'; btn.disabled = false; }
        markSubmitted();
      });
  }

  /* ── STYLES ── */
  function injectStyles() {
    if (document.getElementById('lc-styles')) return;
    var s = document.createElement('style');
    s.id = 'lc-styles';
    s.textContent = '\
      #lc-sidebar{position:fixed;top:100px;right:40px;width:300px;background:#0A1628;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:22px;z-index:90;box-shadow:0 8px 40px rgba(0,0,0,.3);max-height:calc(100vh - 140px);overflow-y:auto;opacity:0;pointer-events:none;transition:opacity .3s;}\
      #lc-sidebar.lc-on{opacity:1;pointer-events:all;}\
      .lcsb-head{margin-bottom:13px;}\
      .lcsb-head h4{font-family:Sora,sans-serif;font-size:.83rem;font-weight:800;color:white;margin-bottom:3px;line-height:1.3;}\
      .lcsb-head p{font-size:.71rem;color:rgba(255,255,255,.45);line-height:1.5;}\
      .lc-x{position:absolute;top:10px;right:12px;background:none;border:none;color:rgba(255,255,255,.35);font-size:1.1rem;cursor:pointer;padding:2px 6px;border-radius:4px;transition:color .2s;display:none;}\
      .lc-x:hover{color:white;}\
      .lcf{display:flex;flex-direction:column;gap:5px;margin-bottom:10px;}\
      .lcf label{font-size:.67rem;font-weight:600;color:rgba(255,255,255,.48);letter-spacing:.3px;}\
      .lcf input,.lcf select{padding:10px 12px;border:1.5px solid rgba(255,255,255,.12);border-radius:8px;font-size:.82rem;font-family:"DM Sans",sans-serif;color:white;background:rgba(255,255,255,.07);outline:none;transition:border-color .2s;width:100%;box-sizing:border-box;}\
      .lcf input::placeholder{color:rgba(255,255,255,.22);}\
      .lcf select option{background:#0A1628;color:white;}\
      .lcf input:focus,.lcf select:focus{border-color:#2164F3;}\
      .lc-req{color:#FF6B2B;}\
      .lc-btn{width:100%;background:linear-gradient(135deg,#2164F3,#7C3AED);color:white;padding:12px;border-radius:9px;border:none;cursor:pointer;font-family:Sora,sans-serif;font-weight:700;font-size:.83rem;margin-top:3px;transition:opacity .2s,transform .2s;}\
      .lc-btn:hover{opacity:.9;transform:translateY(-1px);}\
      .lc-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;}\
      #lc-ov{position:fixed;inset:0;background:rgba(0,0,0,.68);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity .3s;backdrop-filter:blur(4px);}\
      #lc-ov.lc-on{opacity:1;pointer-events:all;}\
      #lc-pop{background:#0A1628;border:1px solid rgba(255,255,255,.12);border-radius:20px;width:100%;max-width:480px;position:relative;max-height:92vh;overflow-y:auto;transform:scale(.95);transition:transform .3s;box-shadow:0 24px 80px rgba(0,0,0,.5);}\
      #lc-ov.lc-on #lc-pop{transform:scale(1);}\
      .lc-tabs{display:flex;border-bottom:1px solid rgba(255,255,255,.08);}\
      .lc-tab{flex:1;padding:15px;text-align:center;cursor:pointer;font-family:Sora,sans-serif;font-size:.76rem;font-weight:700;color:rgba(255,255,255,.38);transition:all .2s;border-bottom:2px solid transparent;margin-bottom:-1px;}\
      .lc-tab.on{color:white;border-bottom-color:#2164F3;}\
      .lc-pane{display:none;padding:22px;}\
      .lc-pane.on{display:block;}\
      .cpbar{height:3px;background:rgba(255,255,255,.08);border-radius:100px;overflow:hidden;margin-bottom:18px;}\
      .cpfill{height:100%;background:linear-gradient(90deg,#2164F3,#7C3AED);border-radius:100px;transition:width .4s;}\
      .cq-lbl{font-family:Sora,sans-serif;font-size:.67rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:rgba(255,255,255,.38);margin-bottom:5px;}\
      .cq-title{font-family:Sora,sans-serif;font-size:.88rem;font-weight:700;color:white;margin-bottom:12px;line-height:1.3;}\
      .copts{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:14px;}\
      .copt{border:1.5px solid rgba(255,255,255,.1);border-radius:9px;padding:11px 13px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.04);}\
      .copt:hover{border-color:rgba(33,100,243,.5);background:rgba(33,100,243,.1);}\
      .copt.on{border-color:#2164F3;background:rgba(33,100,243,.15);}\
      .copt-t{font-family:Sora,sans-serif;font-size:.78rem;font-weight:700;color:white;}\
      .copt-s{font-size:.66rem;color:rgba(255,255,255,.38);margin-top:2px;}\
      .cnav{display:flex;gap:9px;}\
      .cnav .cb{padding:10px 16px;border-radius:8px;border:1.5px solid rgba(255,255,255,.12);background:none;color:rgba(255,255,255,.45);font-family:Sora,sans-serif;font-weight:600;font-size:.78rem;cursor:pointer;transition:all .2s;flex-shrink:0;}\
      .cnav .cb:hover{border-color:rgba(255,255,255,.3);color:white;}\
      .cnav .cf{flex:1;padding:10px;border-radius:8px;background:#2164F3;color:white;border:none;font-family:Sora,sans-serif;font-weight:700;font-size:.8rem;cursor:pointer;transition:background .2s;}\
      .cnav .cf:hover{background:#1449C8;}\
      .cnav .cf:disabled{opacity:.35;cursor:not-allowed;}\
      .gate-wrap{text-align:center;margin-bottom:18px;}\
      .gate-wrap .gi{font-size:2rem;margin-bottom:7px;}\
      .gate-wrap h3{font-family:Sora,sans-serif;font-size:.9rem;font-weight:800;color:white;margin-bottom:4px;}\
      .gate-wrap p{font-size:.73rem;color:rgba(255,255,255,.42);line-height:1.5;}\
      .score-wrap{text-align:center;padding:6px 0 16px;}\
      .score-num{font-family:Sora,sans-serif;font-size:3.2rem;font-weight:800;line-height:1;margin-bottom:4px;}\
      .score-num.low{color:#EF4444;}.score-num.mid{color:#F59E0B;}.score-num.hi{color:#10B981;}\
      .score-pill{display:inline-block;padding:4px 13px;border-radius:100px;font-family:Sora,sans-serif;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;}\
      .score-pill.low{background:#FEE2E2;color:#DC2626;}.score-pill.mid{background:#FEF3C7;color:#D97706;}.score-pill.hi{background:#D1FAE5;color:#059669;}\
      .score-hl{font-family:Sora,sans-serif;font-size:.88rem;font-weight:800;color:white;margin-bottom:10px;line-height:1.3;}\
      .s-ins{background:rgba(255,255,255,.05);border-radius:9px;padding:11px 13px;margin:7px 0;text-align:left;font-size:.76rem;color:rgba(255,255,255,.65);line-height:1.55;border-left:3px solid #2164F3;}\
      .s-ins.d{border-left-color:#EF4444;}.s-ins.w{border-left-color:#F59E0B;}\
      .btn-full{display:block;width:100%;padding:13px;background:linear-gradient(135deg,#2164F3,#7C3AED);color:white;border:none;border-radius:10px;font-family:Sora,sans-serif;font-weight:700;font-size:.86rem;cursor:pointer;text-decoration:none;text-align:center;margin-top:14px;transition:opacity .2s;}\
      .btn-full:hover{opacity:.9;}\
      .btn-dis{display:block;width:100%;margin-top:9px;background:none;border:none;color:rgba(255,255,255,.28);font-size:.7rem;cursor:pointer;padding:7px;transition:color .2s;}\
      .btn-dis:hover{color:rgba(255,255,255,.55);}\
      .ct-head{margin-bottom:16px;}\
      .ct-head .ey{font-size:.63rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#7EB3FF;margin-bottom:5px;}\
      .ct-head h3{font-family:Sora,sans-serif;font-size:.92rem;font-weight:800;color:white;margin-bottom:4px;line-height:1.3;}\
      .ct-head p{font-size:.74rem;color:rgba(255,255,255,.45);line-height:1.5;}\
      @media(min-width:900px){#lc-sidebar .lc-x{display:none!important;}}\
      @media(max-width:899px){#lc-sidebar{right:16px;width:88vw;max-width:320px;top:auto;bottom:80px;}.lc-x{display:block!important;}.copts{grid-template-columns:1fr;}}\
    ';
    document.head.appendChild(s);
  }

  /* ══════════════
     SIDEBAR
  ══════════════ */
  function buildSidebar() {
    var sb = document.createElement('div'); sb.id = 'lc-sidebar';
    sb.innerHTML =
      '<button class="lc-x" id="lc-sbx" aria-label="Close">×</button>'+
      '<div class="lcsb-head"><h4>🎯 Get Interview Calls Faster</h4><p>Free 30-min call. We\'ll diagnose your blockers and give you a clear fix.</p></div>'+
      '<div class="lcf"><label>Phone / WhatsApp <span class="lc-req">*</span></label><input id="sb_p" type="tel" placeholder="+91 XXXXX XXXXX" autocomplete="tel"></div>'+
      '<div class="lcf"><label>Name</label><input id="sb_n" type="text" placeholder="Rahul Kumar" autocomplete="name"></div>'+
      '<div class="lcf"><label>Email</label><input id="sb_e" type="email" placeholder="rahul@email.com" autocomplete="email"></div>'+
      '<button class="lc-btn" id="sb_b" onclick="lcSbGo()">Book Free Call →</button>';
    document.body.appendChild(sb);

    document.getElementById('lc-sbx').addEventListener('click', function(){ sb.classList.remove('lc-on'); sb.dataset.c='1'; });

    function chk() {
      if (alreadySubmitted()) { sb.classList.remove('lc-on'); return; }
      var desk = window.innerWidth >= 900;
      var pct  = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight) * 100;
      if (desk) sb.classList.add('lc-on');
      else if (pct >= 40 && !sb.dataset.c) sb.classList.add('lc-on');
    }
    setTimeout(chk, 300);
    window.addEventListener('scroll', chk, {passive:true});
    window.addEventListener('resize', chk, {passive:true});
  }

  window.lcSbGo = function() {
    var p = (document.getElementById('sb_p')||{}).value && document.getElementById('sb_p').value.trim();
    if (!p) { document.getElementById('sb_p').style.borderColor='#EF4444'; document.getElementById('sb_p').focus(); return; }
    var btn=document.getElementById('sb_b'); btn.textContent='Submitting…'; btn.disabled=true;
    var nm=(document.getElementById('sb_n').value||'').trim().split(' ');
    submitForms({fname:nm[0]||'',lname:nm.slice(1).join(' ')||'',phone:p,email:document.getElementById('sb_e').value.trim(),profile:'Sidebar CTA',situation:''},btn,'✓ We\'ll call you soon!');
  };

  /* ══════════════
     EXIT CALCULATOR POPUP
  ══════════════ */
  var CA={}, CS=1; // answers, current step

  var QS=[
    {id:1,title:'What\'s your experience level?',opts:[{v:10,t:'Fresher',s:'0–1 years'},{v:20,t:'1–3 Years',s:'Early career'},{v:25,t:'3–5 Years',s:'Mid-level'},{v:30,t:'5+ Years',s:'Senior'}]},
    {id:2,title:'Where are you applying?',opts:[{v:10,t:'🇮🇳 India Only',s:'Domestic roles'},{v:5,t:'🌍 Abroad Only',s:'International'},{v:8,t:'🌐 Both',s:'India + International'}]},
    {id:3,title:'How would you rate your resume?',opts:[{v:5,t:'Not Sure',s:'Haven\'t checked ATS'},{v:10,t:'Basic',s:'Just responsibilities'},{v:20,t:'Good',s:'Projects + skills'},{v:30,t:'Strong',s:'Metrics + keywords'}]},
    {id:4,title:'Applications sent per week?',opts:[{v:5,t:'0–10',s:'Very low'},{v:15,t:'10–25',s:'Moderate'},{v:20,t:'25–50',s:'High volume'},{v:25,t:'50+',s:'Mass applying'}]},
    {id:5,title:'How many job platforms?',opts:[{v:5,t:'Just 1',s:'Naukri or LinkedIn'},{v:10,t:'2–3',s:'A few platforms'},{v:15,t:'4+',s:'Multi-platform'}]},
    {id:6,title:'How often do you contact recruiters?',opts:[{v:0,t:'Never',s:'Only apply on portals'},{v:10,t:'Occasionally',s:'Sometimes message'},{v:20,t:'Regularly',s:'Weekly outreach'},{v:25,t:'Active',s:'Networking + referrals'}]}
  ];

  function buildPopup() {
    var ov=document.createElement('div'); ov.id='lc-ov';
    ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true');
    ov.innerHTML=
      '<div id="lc-pop">'+
        '<button class="lc-x" id="lc-px" style="display:block" aria-label="Close">×</button>'+
        '<div class="lc-tabs">'+
          '<div class="lc-tab on" data-p="calc" onclick="lcTab(\'calc\')">🎯 Check My Chances</div>'+
          '<div class="lc-tab" data-p="ct" onclick="lcTab(\'ct\')">📞 Book Free Call</div>'+
        '</div>'+
        '<div class="lc-pane on" id="lc-pc">'+
          '<div class="cpbar"><div class="cpfill" id="lcpf" style="width:0%"></div></div>'+
          '<div id="lc-cb"></div>'+
        '</div>'+
        '<div class="lc-pane" id="lc-pct">'+
          '<div class="ct-head"><div class="ey">Wait — Before You Go</div><h3>Still Struggling to Get<br>Interview Calls?</h3><p>Book a free 30-min call. Honest advice. No pressure.</p></div>'+
          '<div class="lcf"><label>Phone / WhatsApp <span class="lc-req">*</span></label><input id="ct_p" type="tel" placeholder="+91 XXXXX XXXXX" autocomplete="tel"></div>'+
          '<div class="lcf"><label>Name</label><input id="ct_n" type="text" placeholder="Rahul Kumar" autocomplete="name"></div>'+
          '<div class="lcf"><label>Email</label><input id="ct_e" type="email" placeholder="rahul@email.com" autocomplete="email"></div>'+
          '<div class="lcf"><label>I Am A</label><select id="ct_pr"><option value="">Select your profile</option><option>Fresh Graduate</option><option>Working Professional (Looking to Switch)</option><option>Career Switcher (Changing Domain)</option><option>IT Professional</option><option>Sales / Marketing Professional</option><option>Other</option></select></div>'+
          '<button class="lc-btn" id="ct_b" onclick="lcCtGo()">Get My Free Discovery Call →</button>'+
        '</div>'+
      '</div>';
    document.body.appendChild(ov);

    document.getElementById('lc-px').addEventListener('click', lcHide);
    ov.addEventListener('click', function(e){ if(e.target===ov) lcHide(); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') lcHide(); });

    renderStep();
  }

  window.lcTab = function(p) {
    document.querySelectorAll('.lc-tab').forEach(function(t){ t.classList.toggle('on', t.dataset.p===p); });
    document.querySelectorAll('.lc-pane').forEach(function(x){ x.classList.remove('on'); });
    document.getElementById('lc-p'+p).classList.add('on');
  };

  function renderStep() {
    var cb=document.getElementById('lc-cb'); if(!cb) return;
    var pf=document.getElementById('lcpf'); if(pf) pf.style.width=((CS-1)/6*100)+'%';

    if(CS===7) { // Lead gate
      cb.innerHTML=
        '<div class="gate-wrap"><div class="gi">🔒</div><h3>Your score is ready!</h3><p>Enter your details to unlock your personalised interview chances score.</p></div>'+
        '<div class="lcf"><label>Name <span class="lc-req">*</span></label><input id="ep_n" type="text" placeholder="Rahul Kumar" autocomplete="name"></div>'+
        '<div class="lcf"><label>Phone / WhatsApp <span class="lc-req">*</span></label><input id="ep_p" type="tel" placeholder="+91 XXXXX XXXXX" autocomplete="tel"></div>'+
        '<div class="lcf"><label>Email</label><input id="ep_e" type="email" placeholder="rahul@email.com" autocomplete="email"></div>'+
        '<div class="cnav">'+
          '<button class="cb" onclick="lcBack()">← Back</button>'+
          '<button class="cf" id="ep_b" onclick="lcReveal()">🎯 Reveal My Score</button>'+
        '</div>';
      return;
    }

    if(CS===8) { // Result
      var raw=0; for(var k in CA) raw+=CA[k].v;
      var sc=Math.round((raw/135)*100);
      var band=sc<=40?'low':sc<=70?'mid':'hi';
      var btext={low:'🔴 Low Chances',mid:'🟡 Medium Chances',hi:'🟢 High Chances'};
      var htext={low:'Your interview chances are LOW',mid:'You\'re close — but missing key opportunities',hi:'You\'re doing well — but leaving calls on the table'};
      var ins='';
      if(CA[3]&&CA[3].t==='Not Sure') ins+='<div class="s-ins d">⚠️ <strong>Resume likely failing ATS filters.</strong> 75%+ of CVs never reach a recruiter.</div>';
      if(CA[6]&&CA[6].t==='Never') ins+='<div class="s-ins d">🔍 <strong>Missing 70% of opportunities.</strong> The hidden market = recruiter outreach + referrals.</div>';
      if(CA[2]&&(CA[2].t.indexOf('Abroad')!==-1||CA[2].t.indexOf('Both')!==-1)) ins+='<div class="s-ins w">✈️ <strong>Global roles need a different CV + outreach strategy.</strong></div>';
      if(!ins) ins='<div class="s-ins">💡 <strong>Even strong profiles leave calls on the table.</strong> A strategy review unlocks 2–3x more callbacks.</div>';
      cb.innerHTML=
        '<div class="score-wrap">'+
          '<div class="score-num '+band+'">'+sc+'<span style="font-size:1.4rem;opacity:.45">/100</span></div>'+
          '<div class="score-pill '+band+'">'+btext[band]+'</div>'+
          '<div class="score-hl">'+htext[band]+'</div>'+
          ins+
        '</div>'+
        '<a href="/tools/calculator.html" class="btn-full" onclick="lcHide()">See Full Analysis + Book Free Call →</a>'+
        '<button class="btn-dis" onclick="lcHide()">Dismiss</button>';
      return;
    }

    var q=QS[CS-1];
    var optsH=q.opts.map(function(o){
      var on=CA[CS]&&CA[CS].v===o.v?' on':'';
      return '<div class="copt'+on+'" data-v="'+o.v+'" data-t="'+o.t+'" onclick="lcSel(this,'+CS+')"><div class="copt-t">'+o.t+'</div><div class="copt-s">'+o.s+'</div></div>';
    }).join('');
    var hasAns=!!CA[CS], isLast=CS===6;
    cb.innerHTML=
      '<div class="cq-lbl">Question '+CS+' of 6</div>'+
      '<div class="cq-title">'+q.title+'</div>'+
      '<div class="copts">'+optsH+'</div>'+
      '<div class="cnav">'+
        (CS>1?'<button class="cb" onclick="lcBack()">← Back</button>':'')+
        '<button class="cf" id="lc-fwd" onclick="lcNext()" '+(hasAns?'':'disabled')+'>'+
          (isLast?'Calculate 🎯':'Next →')+
        '</button>'+
      '</div>';
  }

  window.lcSel=function(el,q){
    el.parentNode.querySelectorAll('.copt').forEach(function(o){o.classList.remove('on');});
    el.classList.add('on');
    CA[q]={v:parseInt(el.dataset.v),t:el.dataset.t};
    var f=document.getElementById('lc-fwd'); if(f) f.disabled=false;
  };
  window.lcNext=function(){ if(!CA[CS]) return; CS++; renderStep(); };
  window.lcBack=function(){ if(CS>1){CS--; renderStep();} };

  window.lcReveal=function(){
    var n=(document.getElementById('ep_n')||{}).value, p=(document.getElementById('ep_p')||{}).value;
    if(!n||!n.trim()){document.getElementById('ep_n').style.borderColor='#EF4444';document.getElementById('ep_n').focus();return;}
    if(!p||!p.trim()){document.getElementById('ep_p').style.borderColor='#EF4444';document.getElementById('ep_p').focus();return;}
    var btn=document.getElementById('ep_b'); btn.textContent='Calculating…'; btn.disabled=true;
    var nm=n.trim().split(' ');
    var summary=Object.keys(CA).map(function(k){return CA[k].t;}).join(' | ');
    submitForms({fname:nm[0]||'',lname:nm.slice(1).join(' ')||'',phone:p.trim(),email:(document.getElementById('ep_e')||{}).value||'',profile:'Calculator: '+summary,situation:''},null,'');
    CS=8; renderStep();
  };

  window.lcCtGo=function(){
    var p=(document.getElementById('ct_p')||{}).value&&document.getElementById('ct_p').value.trim();
    if(!p){document.getElementById('ct_p').style.borderColor='#EF4444';document.getElementById('ct_p').focus();return;}
    var btn=document.getElementById('ct_b'); btn.textContent='Submitting…'; btn.disabled=true;
    var nm=(document.getElementById('ct_n').value||'').trim().split(' ');
    submitForms({fname:nm[0]||'',lname:nm.slice(1).join(' ')||'',phone:p,email:document.getElementById('ct_e').value.trim(),profile:document.getElementById('ct_pr').value,situation:''},btn,'✓ We\'ll call you within a few hours!');
  };

  function lcShow(){ if(alreadySubmitted()) return; var o=document.getElementById('lc-ov'); if(o) o.classList.add('lc-on'); }
  function lcHide(){ var o=document.getElementById('lc-ov'); if(o) o.classList.remove('lc-on'); }
  window.lcHide=lcHide;

  /* ── INIT ── */
  function init(){
    if(alreadySubmitted()) return;
    injectStyles();
    buildSidebar();
    buildPopup();
    // Exit intent: mouse leaves top on desktop
    document.addEventListener('mouseleave',function(e){ if(e.clientY<20) lcShow(); });
    // Mobile: 30s fallback
    setTimeout(function(){ if(window.innerWidth<900) lcShow(); },30000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();

})();
