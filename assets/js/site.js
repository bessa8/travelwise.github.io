/* TravelWise — site.js: menu móvel e tema. Sem dependências. */
(function () {
  var d = document, root = d.documentElement;

  var menuBtn = d.querySelector('.menu-btn'), links = d.getElementById('nav-links');
  if (menuBtn && links) {
    menuBtn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus();
      }
    });
  }

  var themeBtn = d.querySelector('.theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var cur = root.getAttribute('data-theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = cur === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('tw-theme', next); } catch (e) {}
    });
  }
})();
