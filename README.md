# TalentBuddy Website

## Folder Structure

```
talentbuddy/
├── index.html                          ← Main website (open this in browser)
├── README.md                           ← This file
│
└── assets/
    ├── css/
    │   └── style.css                   ← All styles
    │
    ├── js/
    │   └── main.js                     ← Slider, form, nav logic
    │
    └── images/
        ├── logo.png                    ← ✏️ Your logo here (any size, auto-scales to 36px height)
        ├── favicon.png                 ← ✏️ Browser tab icon (32×32 or 64×64 px)
        │
        └── success-stories/            ← ✏️ Drop your 6 images here
            ├── story-1.jpg
            ├── story-2.jpg
            ├── story-3.jpg
            ├── story-4.jpg
            ├── story-5.jpg
            └── story-6.jpg
```

---

## How to Add Success Story Images

1. Export your 6 designs as **400×400 px** JPG or PNG files
2. Name them exactly: `story-1.jpg`, `story-2.jpg` ... `story-6.jpg`
3. Place them in: `assets/images/success-stories/`
4. Open `index.html`, find the **Success Story Slider** section
5. For each card, **uncomment** the `<img>` line and **delete** the placeholder spans:

**Before:**
```html
<div class="ss-card">
  <!-- <img src="assets/images/success-stories/story-1.jpg" alt="Success Story 1"> -->
  <span class="ss-ph-icon">🖼️</span>
  <span class="ss-ph-label">Success Story 1...</span>
  <span class="ss-ph-num">1 / 6</span>
</div>
```

**After:**
```html
<div class="ss-card">
  <img src="assets/images/success-stories/story-1.jpg" alt="Candidate Name – Placed at Company">
</div>
```

---

## How to Add Your Logo

1. Save your logo as `assets/images/logo.png`
2. That's it — the `<img>` tag in the nav will pick it up automatically
3. If the file is missing, the text "TalentBuddy" fallback shows instead

---

## How to Deploy

Just upload the entire `talentbuddy/` folder to your hosting (Hostinger, Netlify, Vercel, etc.)
Make sure to upload **all subfolders** — the HTML file won't work without `assets/`.
