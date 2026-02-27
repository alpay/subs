(function () {
  const STORAGE_LANG = "subs-lang";
  const STORAGE_THEME = "subs-theme";

  function getPreferredLang() {
    const stored = localStorage.getItem(STORAGE_LANG);
    if (stored && T[stored]) return stored;
    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return T[nav] ? nav : "en";
  }

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_THEME);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  let currentLang = getPreferredLang();
  let currentTheme = getPreferredTheme();
  let dropdownOpen = false;

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_THEME, theme);
  }

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_LANG, lang);
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = (T[lang] && T[lang][key]) || (T.en && T.en[key]) || "";
      if (el.hasAttribute("data-i18n-html")) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });

    var btn = document.getElementById("lang-btn");
    if (btn) {
      var entry = LANGUAGES.find(function (l) { return l.code === lang; });
      btn.querySelector(".lang-flag").textContent = entry ? entry.flag : "";
      btn.querySelector(".lang-code").textContent = lang;
    }

    document.querySelectorAll(".lang-option").forEach(function (opt) {
      opt.classList.toggle("selected", opt.dataset.lang === lang);
    });
  }

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
    var dd = document.getElementById("lang-dropdown");
    if (dd) dd.classList.toggle("open", dropdownOpen);
  }

  function closeDropdown() {
    dropdownOpen = false;
    var dd = document.getElementById("lang-dropdown");
    if (dd) dd.classList.remove("open");
  }

  // Build nav controls (theme toggle + language switcher)
  function buildControls() {
    var controls = document.querySelector(".controls");
    if (!controls) return;

    // Theme toggle
    var themeBtn = document.createElement("button");
    themeBtn.className = "theme-toggle";
    themeBtn.setAttribute("aria-label", "Toggle theme");
    themeBtn.innerHTML =
      '<span class="icon-sun">\u2600\uFE0F</span><span class="icon-moon">\u{1F319}</span>';
    themeBtn.addEventListener("click", function () {
      applyTheme(currentTheme === "dark" ? "light" : "dark");
    });
    controls.appendChild(themeBtn);

    // Language switcher
    var langWrap = document.createElement("div");
    langWrap.className = "lang-switcher";

    var langBtn = document.createElement("button");
    langBtn.id = "lang-btn";
    langBtn.className = "lang-btn";
    langBtn.setAttribute("aria-label", "Change language");
    langBtn.innerHTML = '<span class="lang-flag"></span><span class="lang-code"></span>';
    langBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleDropdown();
    });

    var dropdown = document.createElement("div");
    dropdown.id = "lang-dropdown";
    dropdown.className = "lang-dropdown";

    LANGUAGES.forEach(function (l) {
      var opt = document.createElement("button");
      opt.className = "lang-option";
      opt.dataset.lang = l.code;
      opt.innerHTML =
        '<span class="opt-flag">' + l.flag + "</span>" + l.name;
      opt.addEventListener("click", function () {
        applyLang(l.code);
        closeDropdown();
      });
      dropdown.appendChild(opt);
    });

    langWrap.appendChild(langBtn);
    langWrap.appendChild(dropdown);
    controls.appendChild(langWrap);
  }

  // FAQ accordion
  window.toggleFaq = function (btn) {
    var item = btn.parentElement;
    var answer = item.querySelector(".faq-answer");
    var isOpen = item.classList.contains("open");

    document.querySelectorAll(".faq-item.open").forEach(function (el) {
      el.classList.remove("open");
      el.querySelector(".faq-answer").style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add("open");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  };

  // Close dropdown on outside click
  document.addEventListener("click", function () {
    closeDropdown();
  });

  // Init
  applyTheme(currentTheme);
  buildControls();
  applyLang(currentLang);
})();
