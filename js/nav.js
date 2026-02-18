/* Mobile hamburger menu toggle */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  if (!toggle) return;

  const navbar = document.querySelector('.navbar');

  toggle.addEventListener('click', function () {
    const open = navbar.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open);
  });

  /* Close when a nav link is tapped */
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      navbar.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navbar.classList.contains('nav-open')) {
      navbar.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();
