/* TravelWise — tiny PT/EN switch for the standalone pages (invite, reset, auth, callback, 404).
   Default language: ?lang=, then the saved choice, then the browser language. Pages are written in
   English; elements with data-pt carry the Portuguese text. Dynamic strings use TW.t(en, pt). */
(function () {
  var q = new URLSearchParams(location.search).get('lang'), saved = null;
  try { saved = localStorage.getItem('tw-lang'); } catch (e) {}
  var nav = ((navigator.language || 'en') + '').slice(0, 2).toLowerCase();
  var lang = (q || saved || (nav === 'pt' ? 'pt' : 'en')) === 'pt' ? 'pt' : 'en';
  var TW = window.TW = { lang: lang };
  TW.t = function (en, pt) { return lang === 'pt' ? pt : en; };
  TW.apply = function (root) {
    if (lang !== 'pt') return;
    (root || document).querySelectorAll('[data-pt]').forEach(function (el) { el.innerHTML = el.getAttribute('data-pt'); });
  };
  TW.set = function (l) {
    try { localStorage.setItem('tw-lang', l); } catch (e) {}
    var u = new URL(location.href); u.searchParams.delete('lang'); location.href = u.toString();
  };
  document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en';
  function ready() {
    TW.apply(document);
    document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
      b.textContent = lang === 'pt' ? 'EN' : 'PT';
      b.setAttribute('aria-label', lang === 'pt' ? 'English version' : 'Versão em português');
      b.addEventListener('click', function () { TW.set(lang === 'pt' ? 'en' : 'pt'); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
