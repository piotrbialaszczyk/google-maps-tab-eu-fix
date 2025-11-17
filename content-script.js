(function insertMapsButtonFinal() {
  'use strict';

  const styleEl = document.createElement('style');
  styleEl.id = 'gmaps-insert-style';
  styleEl.textContent = `
    .hdtb-mitem .gmaps-button { 
      display: inline-flex !important;
      align-items: center !important;
      white-space: nowrap !important;
      text-decoration: none !important;
      box-sizing: border-box !important;
      padding: 0 12px !important;
      min-height: 48px !important;
      font-family: 'Google Sans', Arial, sans-serif !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      line-height: 20px !important;
      vertical-align: middle !important;
    }
    .hdtb-mitem.gmaps-wrapper { 
      display: inline-flex !important; 
      align-items: center !important; 
      vertical-align: middle !important;
    }
  `;
  (document.head ?? document.documentElement).appendChild(styleEl);

  let buttonInserted = false;
  let mapsButton = null;

  function mapsLabel() {
    const lang = (document.documentElement.lang || navigator.language || 'en').toLowerCase().split('-')[0];
    const labels = {
      en: 'Maps', fr: 'Plans', de: 'Maps', es: 'Maps', it: 'Maps',
      pl: 'Mapy', pt: 'Maps', nl: 'Maps', sv: 'Kartor', da: 'Maps',
      fi: 'Maps', cs: 'Mapy', sk: 'Mapy', el: 'Χάρτες', hu: 'Térkép',
      ro: 'Maps', bg: 'Карти', hr: 'Karte', lt: 'Žemėlapiai',
      lv: 'Kartes', et: 'Kaardid', ga: 'Mapanna', sl: 'Zemljevidi'
    };
    return labels[lang] || 'Maps';
  }

  function getCurrentQuery() {
    return new URLSearchParams(location.search).get('q') ?? '';
  }

  function createMapsURL(query) {
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  }

  function findNav() {
    return document.querySelector('div[role="navigation"]') ||
           document.querySelector('#top_nav') ||
           document.querySelector('#search');
  }

  function visibleWrappers(nav) {
    if (!nav) return [];
    const nodes = Array.from(nav.querySelectorAll('.hdtb-mitem, a'))
      .map(el => el.closest('.hdtb-mitem') || el.parentElement)
      .filter(Boolean);

    const result = [];
    const seen = new Set();

    for (const n of nodes) {
      if (!seen.has(n) && n.offsetParent !== null) {
        seen.add(n);
        result.push(n);
      }
    }
    return result;
  }

  function findTopRowWrappers(nav) {
    const wraps = visibleWrappers(nav);
    if (!wraps.length) return [];

    const tops = wraps.map(w => Math.round(w.getBoundingClientRect().top));
    const freq = {};
    tops.forEach(t => freq[t] = (freq[t] || 0) + 1);

    const mainTop = Number(Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b));
    return wraps.filter(w => Math.round(w.getBoundingClientRect().top) === mainTop);
  }

  function buildMapsWrapper() {
    document.querySelectorAll('.hdtb-mitem.gmaps-wrapper').forEach((el, idx) => {
      if (idx > 0) el.remove();
    });

    let wrapper = document.querySelector('.hdtb-mitem.gmaps-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'hdtb-mitem gmaps-wrapper';

      const a = document.createElement('a');
      a.className = 'gmaps-button';
      a.href = createMapsURL(getCurrentQuery());
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = a.ariaLabel = mapsLabel();
      a.textContent = mapsLabel();

      wrapper.appendChild(a);
    } else {
      const a = wrapper.querySelector('a.gmaps-button');
      if (a) {
        a.href = createMapsURL(getCurrentQuery());
        a.title = a.ariaLabel = mapsLabel();
      }
    }

    mapsButton = wrapper.querySelector('a.gmaps-button');
    return wrapper;
  }

  function cloneInnerStructure(nav, wrapper) {
    try {
      const mapsA = wrapper.querySelector('a.gmaps-button');
      if (!mapsA) return;

      const ref = Array.from(nav.querySelectorAll('a'))
        .find(a => a.querySelector('div.mXwfNd, span.R1QWuf, div[class^="mXwf"]'))
        || nav.querySelector('a');

      if (!ref) return;

      let inner = ref.querySelector('div.mXwfNd, div[class^="mXwf"], div > div > span, span');
      if (!inner) inner = ref.querySelector('span') || ref;

      const clone = inner.cloneNode(true);
      let span = clone.querySelector('span');
      if (!span) {
        span = document.createElement('span');
        clone.appendChild(span);
      }
      span.textContent = mapsLabel();

      mapsA.innerHTML = '';
      mapsA.appendChild(clone);

      mapsA.href = createMapsURL(getCurrentQuery());
      mapsA.title = mapsLabel();
      mapsA.ariaLabel = mapsLabel();
      mapsA.target = '_blank';
      mapsA.rel = 'noopener noreferrer';
    } catch {}
  }

  const PREFERRED = ['ai mode', 'all', 'news', 'images', 'videos', 'web'];

  function insertMapsButton(navBar) {
    if (buttonInserted || navBar.querySelector('.gmaps-button')) {
      buttonInserted = true;
      return true;
    }

    const wrapper = buildMapsWrapper();
    const topWrappers = findTopRowWrappers(navBar);

    if (!topWrappers.length) {
      navBar.appendChild(wrapper);
      cloneInnerStructure(navBar, wrapper);
      buttonInserted = true;
      return true;
    }

    let preferred = null;
    for (const want of PREFERRED) {
      for (const w of topWrappers) {
        const a = w.querySelector('a');
        if (!a) continue;
        const txt = (a.textContent || '').toLowerCase().trim();
        if (txt === want || txt.startsWith(want) || txt.includes(want)) {
          preferred = w;
          break;
        }
      }
      if (preferred) break;
    }

    try {
      if (preferred) {
        const idx = topWrappers.indexOf(preferred);
        if (idx >= 0 && idx < topWrappers.length - 1) {
          const next = topWrappers[idx + 1];
          next.parentElement.insertBefore(wrapper, next);
        } else {
          preferred.after(wrapper);
        }
      } else {
        topWrappers[0].parentElement.insertBefore(wrapper, topWrappers[0]);
      }
    } catch {
      try { navBar.appendChild(wrapper); } catch {}
    }

    cloneInnerStructure(navBar, wrapper);
    buttonInserted = true;
    return true;
  }

  function attempt() {
    const nav = document.querySelector('div[role="navigation"]');
    return nav ? insertMapsButton(nav) : false;
  }

  if (!attempt()) {
    let retries = 160;
    const loop = () => {
      if (!buttonInserted && retries-- > 0) {
        if (!attempt()) requestAnimationFrame(loop);
      }
    };
    requestAnimationFrame(loop);
  }

  const mo = new MutationObserver(() => {
    if (!buttonInserted && document.querySelector('div[role="navigation"]')) {
      if (attempt()) mo.disconnect();
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  addEventListener('pageshow', e => {
    if (e.persisted) {
      buttonInserted = false;
      setTimeout(attempt, 120);
    }
  });

  addEventListener('popstate', () => {
    const a = document.querySelector('.hdtb-mitem.gmaps-wrapper a.gmaps-button');
    if (a) a.href = createMapsURL(getCurrentQuery());
  });

  addEventListener('beforeunload', () => mo.disconnect());

  const themeMo = new MutationObserver(() => {
    const nav = findNav();
    const wrapper = document.querySelector('.hdtb-mitem.gmaps-wrapper');
    if (nav && wrapper) cloneInnerStructure(nav, wrapper);
  });
  themeMo.observe(document.documentElement, { attributes: true, attributeFilter: ['class','data-theme'] });
  themeMo.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

})();
