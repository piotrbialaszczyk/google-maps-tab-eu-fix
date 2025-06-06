/* Maps-tab injector (EU-focused, language-agnostic, BFCache-safe) */
(function insertMapsButtonFast() {
  'use strict';

  /* ────────── 1.  CSS (injected ASAP) ────────── */
  const STYLE_TEXT = `
    div[role="navigation"] .gmaps-button {
      text-decoration: none !important;
      color: #70757a !important;
      padding: 0 12px;
      font-size: 14px !important;
      line-height: 16px !important;
      font-family: 'Google Sans', Roboto, Arial, sans-serif !important;
      font-weight: 500 !important;
      letter-spacing: 0.25px !important;
    }
    div[role="navigation"] .gmaps-button:visited {
      color: #70757a !important;
    }
    div[role="navigation"] .gmaps-button:hover {
      color: #202124 !important;
      text-decoration: none !important;
    }`;

  const styleEl = document.createElement('style');
  styleEl.textContent = STYLE_TEXT;
  (document.head ?? document.documentElement).appendChild(styleEl);

  /* ────────── 2.  Helpers ────────── */
  const NAV_SELECTOR = 'div[role="navigation"]';
  let buttonInserted = false;

  /* EU-centric label map */
  function mapsLabel() {
    const lang = (document.documentElement.lang || navigator.language || 'en')
                   .toLowerCase().split('-')[0];
    const labels = {
      en: 'Maps',  fr: 'Plans',  de: 'Maps',  es: 'Maps',  it: 'Maps',
      pl: 'Mapy',  pt: 'Maps',  nl: 'Maps',   sv: 'Kartor', da: 'Maps',
      fi: 'Maps',  cs: 'Mapy',  sk: 'Mapy',   el: 'Χάρτες', hu: 'Térkép',
      ro: 'Maps',  bg: 'Карти', hr: 'Karte',  lt: 'Žemėlapiai', 
      lv: 'Kartes', et: 'Kaardid', ga: 'Mapanna', sl: 'Zemljevidi'
    };
    return labels[lang] || 'Maps';
  }

  function buildMapsTab() {
    const a = document.createElement('a');
    a.className   = 'gmaps-button';
    a.textContent = mapsLabel();

    const q = new URLSearchParams(location.search).get('q') ?? '';
    a.href        = `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
    a.target      = '_blank';
    a.ariaLabel   = a.title = mapsLabel();
    return a;
  }

  function insertButton(navBar) {
    if (buttonInserted || !navBar || navBar.querySelector('.gmaps-button')) {
      buttonInserted = true;
      return;
    }
    const tabs = navBar.querySelectorAll('a');
    if (!tabs.length) return;

    const mapsTab = buildMapsTab();

    /* Language-neutral “News” tab = href containing tbm=nws */
    const newsTab = Array.from(tabs).find(t => /[?&]tbm=nws(&|$)/.test(t.href));

    (newsTab?.parentElement ?? tabs[tabs.length - 1].parentElement)
      .insertBefore(mapsTab, newsTab ? newsTab.nextSibling : null);

    buttonInserted = true;
  }

  function tryNow() {
    const nav = document.querySelector(NAV_SELECTOR);
    if (nav) insertButton(nav);
  }

  /* ────────── 3.  Execution strategies ────────── */
  tryNow();                                   // immediate
  let retries = 120;                          // ≈2 s rAF loop
  (function loop() {
    if (!buttonInserted && retries--) {
      tryNow();
      requestAnimationFrame(loop);
    }
  })();
  new MutationObserver((_, o) => {            // until nav appears
    if (document.querySelector(NAV_SELECTOR)) {
      o.disconnect(); tryNow();
    }
  }).observe(document.body, {childList: true, subtree: true});
  addEventListener('pageshow', e => {         // BFCache restore
    if (e.persisted) { buttonInserted = false; tryNow(); }
  });

})();