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

// ── Resume download placeholder ───────────────────────────
const resumeBtn = document.getElementById('resume-download-btn');
if (resumeBtn) {
  resumeBtn.addEventListener('click', (e) => {
    // Replace href with your actual resume PDF path when ready, e.g.:
    // resumeBtn.href = 'joseph-tascona-resume.pdf';
    // For now, prevent default until a real file is linked.
    if (resumeBtn.getAttribute('href') === '#') {
      e.preventDefault();
      alert('Resume PDF coming soon. Check back or send an email.');
    }
  });
}
