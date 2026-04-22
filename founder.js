/* ============================================================
   founder.js — Founder page scripting
   ============================================================ */

// ── Nav scroll behaviour (same as main.js) ─────────────────
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Mobile menu ────────────────────────────────────────────
const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileClose = document.querySelector('.mobile-menu-close');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
  mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

// ── Founder CV download placeholder ───────────────────────
const founderCvBtn = document.getElementById('founder-cv-download-btn');
if (founderCvBtn) {
  founderCvBtn.addEventListener('click', (e) => {
    // Replace href with your actual founder CV PDF path when ready, e.g.:
    // founderCvBtn.href = 'joseph-tascona-founder-cv.pdf';
    // For now, prevent default until a real file is linked.
    if (founderCvBtn.getAttribute('href') === '#') {
      e.preventDefault();
      alert('Founder CV PDF coming soon. Check back or send an email.');
    }
  });
}
