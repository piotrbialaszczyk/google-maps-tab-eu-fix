(function insertMapsButtonFinal() {
  'use strict';

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .hdtb-mitem .gmaps-button {
      display: inline-block !important;
      white-space: nowrap !important;
      font-family: 'Google Sans', Arial, sans-serif !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      letter-spacing: 0.25px !important;
      padding: 0 12px !important;
      padding-top: 2px !important;
      line-height: 20px !important;
      text-decoration: none !important;
      box-sizing: border-box !important;
      vertical-align: baseline !important;
      margin: 0 !important;
      height: auto !important;
      position: relative !important;
      top: 0 !important;
      min-height: 48px !important;
      display: flex !important;
      align-items: center !important;
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

  function detectTheme() {
    const html = document.documentElement;
    const body = document.body;
    return (
      html.classList.contains('dark') ||
      html.getAttribute('data-theme') === 'dark' ||
      body.getAttribute('data-theme') === 'dark'
    ) ? 'dark' : 'light';
  }

  function getDefaultColor(theme) {
    return theme === 'dark' ? '#80868b' : '#70757a';
  }

  function getHoverColor(theme) {
    return theme === 'dark' ? '#dedede' : '#1f1f1f';
  }

  function applyButtonColors() {
    if (!mapsButton) return;
    mapsButton.style.color = getDefaultColor(detectTheme());
  }

  function buildMapsTab() {
    const wrapper = document.createElement('div');
    wrapper.className = 'hdtb-mitem';

    const link = document.createElement('a');
    link.className = 'gmaps-button';
    link.href = createMapsURL(getCurrentQuery());
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.ariaLabel = link.title = mapsLabel();
    link.textContent = mapsLabel();

    link.addEventListener('mouseenter', () => {
      link.style.color = getHoverColor(detectTheme());
    });

    link.addEventListener('mouseleave', () => {
      link.style.color = getDefaultColor(detectTheme());
    });

    wrapper.appendChild(link);
    mapsButton = link;
    applyButtonColors();

    return wrapper;
  }

  function insertMapsButton(navBar) {
    if (buttonInserted || navBar.querySelector('.gmaps-button')) {
      buttonInserted = true;
      return true;
    }

    const mapsTab = buildMapsTab();

    const allTabWrapper = Array.from(navBar.querySelectorAll('a')).find(a =>
      (a.href.includes('/search?') && !a.href.includes('tbm=')) ||
      a.textContent.toLowerCase().includes('all')
    )?.parentElement;

    if (allTabWrapper) {
      allTabWrapper.after(mapsTab);
    } else {
      navBar.appendChild(mapsTab);
    }

    buttonInserted = true;
    return true;
  }

  function attemptInsertion() {
    const navBar = document.querySelector('div[role="navigation"]');
    if (navBar) {
      return insertMapsButton(navBar);
    }
    return false;
  }

  if (!attemptInsertion()) {
    let retries = 120;
    const retryLoop = () => {
      if (!buttonInserted && retries-- > 0) {
        if (!attemptInsertion()) {
          requestAnimationFrame(retryLoop);
        }
      }
    };
    requestAnimationFrame(retryLoop);
  }

  const observer = new MutationObserver(() => {
    if (!buttonInserted && document.querySelector('div[role="navigation"]')) {
      if (attemptInsertion()) {
        observer.disconnect();
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  addEventListener('pageshow', e => {
    if (e.persisted) {
      buttonInserted = false;
      setTimeout(() => {
        attemptInsertion();
        applyButtonColors();
      }, 100);
    }
  });

  addEventListener('popstate', () => {
    if (mapsButton) {
      mapsButton.href = createMapsURL(getCurrentQuery());
    }
  });

  addEventListener('beforeunload', () => {
    observer.disconnect();
  });

  const themeObserver = new MutationObserver(() => {
    applyButtonColors();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

})();