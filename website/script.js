(function () {
  const STORAGE_LANG = 'subs-lang';
  const STORAGE_THEME = 'subs-theme';

  function getPreferredLang() {
    const stored = localStorage.getItem(STORAGE_LANG);
    if (stored && T[stored])
      return stored;
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return T[nav] ? nav : 'en';
  }

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_THEME);
    if (stored === 'light' || stored === 'dark')
      return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }

  let currentLang = getPreferredLang();
  let currentTheme = getPreferredTheme();
  let dropdownOpen = false;

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_THEME, theme);

    let meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#09090b' : '#ffffff');
    }
  }

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_LANG, lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      let key = el.getAttribute('data-i18n');
      let val = (T[lang] && T[lang][key]) || (T.en && T.en[key]) || '';
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = val;
      }
      else {
        el.textContent = val;
      }
    });

    let btn = document.getElementById('lang-btn');
    if (btn) {
      let entry = LANGUAGES.find((l) => { return l.code === lang; });
      btn.querySelector('.lang-flag').textContent = entry ? entry.flag : '';
      btn.querySelector('.lang-code').textContent = lang;
    }

    document.querySelectorAll('.lang-option').forEach((opt) => {
      opt.classList.toggle('selected', opt.dataset.lang === lang);
    });
  }

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
    let dd = document.getElementById('lang-dropdown');
    if (dd)
      dd.classList.toggle('open', dropdownOpen);
  }

  function closeDropdown() {
    dropdownOpen = false;
    let dd = document.getElementById('lang-dropdown');
    if (dd)
      dd.classList.remove('open');
  }

  // Build nav controls (theme toggle + language switcher)
  function buildControls() {
    let controls = document.querySelector('.controls');
    if (!controls)
      return;

    // Theme toggle
    let themeBtn = document.createElement('button');
    themeBtn.className = 'theme-toggle';
    themeBtn.setAttribute('aria-label', 'Toggle theme');
    themeBtn.innerHTML
      = '<span class="icon-sun">\u2600\uFE0F</span><span class="icon-moon">\u{1F319}</span>';
    themeBtn.addEventListener('click', () => {
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
    controls.appendChild(themeBtn);

    // Language switcher
    let langWrap = document.createElement('div');
    langWrap.className = 'lang-switcher';

    let langBtn = document.createElement('button');
    langBtn.id = 'lang-btn';
    langBtn.className = 'lang-btn';
    langBtn.setAttribute('aria-label', 'Change language');
    langBtn.innerHTML = '<span class="lang-flag"></span><span class="lang-code"></span>';
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });

    let dropdown = document.createElement('div');
    dropdown.id = 'lang-dropdown';
    dropdown.className = 'lang-dropdown';

    LANGUAGES.forEach((l) => {
      let opt = document.createElement('button');
      opt.className = 'lang-option';
      opt.dataset.lang = l.code;
      opt.innerHTML
        = `<span class="opt-flag">${l.flag}</span>${l.name}`;
      opt.addEventListener('click', () => {
        applyLang(l.code);
        closeDropdown();
      });
      dropdown.appendChild(opt);
    });

    langWrap.appendChild(langBtn);
    langWrap.appendChild(dropdown);
    controls.appendChild(langWrap);
  }

  // Mobile nav (hamburger)
  function setupMobileNav() {
    let nav = document.querySelector('nav');
    if (!nav)
      return;

    let navInner = nav.querySelector('.nav-inner');
    let links = nav.querySelector('.links');
    if (!navInner || !links)
      return;

    let toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation');
    // SVG hamburger icon — guaranteed to render correctly everywhere
    toggle.innerHTML
      = '<svg class="icon-hamburger" width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<line x1="0" y1="1" x2="22" y2="1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
        + '<line x1="0" y1="8" x2="22" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
        + '<line x1="0" y1="15" x2="22" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
        + '</svg>'
        + '<svg class="icon-close" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<line x1="1" y1="1" x2="17" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
        + '<line x1="17" y1="1" x2="1" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
        + '</svg>';
    navInner.appendChild(toggle);

    let menu = document.createElement('div');
    menu.className = 'nav-menu';
    menu.innerHTML = '<div class="nav-menu-inner"></div>';
    let menuInner = menu.querySelector('.nav-menu-inner');

    // Clone each <a> individually — NOT the .links wrapper,
    // because cloning the wrapper inherits display:none from "nav .links" media query rule.
    links.querySelectorAll('a').forEach((a) => {
      menuInner.appendChild(a.cloneNode(true));
    });

    nav.appendChild(menu);

    let isOpen = false;
    function setOpen(open) {
      isOpen = open;
      menu.classList.toggle('open', open);
      toggle.classList.toggle('open', open);
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!isOpen);
    });

    menu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.addEventListener('click', () => {
      setOpen(false);
    });
  }

  // FAQ accordion
  window.toggleFaq = function (btn) {
    let item = btn.parentElement;
    let answer = item.querySelector('.faq-answer');
    let isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach((el) => {
      el.classList.remove('open');
      el.querySelector('.faq-answer').style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    }
  };

  // Close dropdown on outside click
  document.addEventListener('click', () => {
    closeDropdown();
  });

  // Init
  applyTheme(currentTheme);
  buildControls();
  setupMobileNav();
  applyLang(currentLang);
})();
