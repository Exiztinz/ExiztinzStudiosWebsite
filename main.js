/* ============================================================
   EXIZTINZ STUDIOS — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  const defaultSiteConfig = {
    sanity: {
      projectId: '',
      dataset: 'production',
      apiVersion: '2024-10-01',
      useCdn: true,
      postsLimit: 3,
      moreNewsUrl: '#'
    }
  };
  const siteConfig = window.SITE_CONFIG || defaultSiteConfig;
  const loadedPostsByKey = new Map();

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function formatNewsDate(dateStr) {
    if (!dateStr) return 'Date TBD';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return 'Date TBD';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function setNewsStatus(message, isError) {
    const statusEl = document.getElementById('news-status');
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle('news-status--error', Boolean(isError));
    statusEl.style.display = message ? 'block' : 'none';
  }

  function getPostKey(post) {
    return post.slug || post._id || post.title || `post-${Math.random().toString(36).slice(2)}`;
  }

  function portableTextToPlainText(body) {
    if (!Array.isArray(body)) return '';

    const lines = body.map((block) => {
      if (!block || block._type !== 'block' || !Array.isArray(block.children)) return '';
      return block.children
        .map((child) => (child && typeof child.text === 'string' ? child.text : ''))
        .join('')
        .trim();
    }).filter(Boolean);

    return lines.join('\n\n').trim();
  }

  function buildSummary(post) {
    const plainBody = portableTextToPlainText(post.body);
    const source = post.excerpt || post.summary || plainBody;
    if (!source) {
      return 'Read the full studio update for details on this announcement, current progress, and what is coming next.';
    }

    if (source.length <= 220) return source;
    return `${source.slice(0, 217).trim()}...`;
  }

  function renderPostBodyHtml(post) {
    const bodyBlocks = Array.isArray(post.body) ? post.body : [];

    if (!bodyBlocks.length) {
      const fallback = buildSummary(post);
      return `<p>${escapeHtml(fallback)}</p>`;
    }

    const htmlParts = bodyBlocks.map((block) => {
      if (!block || block._type !== 'block' || !Array.isArray(block.children)) return '';
      const text = block.children
        .map((child) => (child && typeof child.text === 'string' ? child.text : ''))
        .join('')
        .trim();

      if (!text) return '';
      if (block.style === 'h2' || block.style === 'h3') {
        return `<h4>${escapeHtml(text)}</h4>`;
      }
      return `<p>${escapeHtml(text)}</p>`;
    }).filter(Boolean);

    if (!htmlParts.length) {
      return `<p>${escapeHtml(buildSummary(post))}</p>`;
    }

    return htmlParts.join('');
  }

  function openPostModal(postKey) {
    const post = loadedPostsByKey.get(postKey);
    if (!post) return;

    const modal = document.getElementById('post-modal');
    const titleEl = document.getElementById('post-modal-title');
    const dateEl = document.getElementById('post-modal-date');
    const bodyEl = document.getElementById('post-modal-body');

    if (!modal || !titleEl || !dateEl || !bodyEl) return;

    titleEl.textContent = post.title || 'Untitled Post';
    dateEl.textContent = formatNewsDate(post.publishedAt);
    bodyEl.innerHTML = renderPostBodyHtml(post);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePostModal() {
    const modal = document.getElementById('post-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function setupPostModalEvents() {
    const modal = document.getElementById('post-modal');
    const closeBtn = document.getElementById('post-modal-close');

    if (!modal || !closeBtn) return;

    closeBtn.addEventListener('click', closePostModal);
    modal.addEventListener('click', (event) => {
      const target = event.target;
      if (target && target instanceof HTMLElement && target.dataset.closePostModal === 'true') {
        closePostModal();
      }
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closePostModal();
      }
    });
  }

  function setupNewsReadMoreEvents() {
    const newsGridEl = document.getElementById('news-grid');
    if (!newsGridEl) return;

    newsGridEl.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const trigger = target.closest('[data-read-more-post]');
      if (!trigger) return;

      event.preventDefault();
      const postKey = trigger.getAttribute('data-read-more-post');
      if (postKey) {
        openPostModal(postKey);
      }
    });
  }

  function renderNewsCards(posts) {
    const newsGridEl = document.getElementById('news-grid');
    if (!newsGridEl) return;

    loadedPostsByKey.clear();

    const fallbackImages = [
      'carl-raw-m3hn2Kn5Bns-unsplash.jpg',
      'compagnons-By-tZImt0Ms-unsplash.jpg',
      'ivan-rudoy-H1CzGhDhSAY-unsplash.jpg'
    ];

    const cardMarkup = posts.map((post, idx) => {
      const postKey = getPostKey(post);
      loadedPostsByKey.set(postKey, post);
      const title = escapeHtml(post.title || 'Untitled Post');
      const excerpt = escapeHtml(buildSummary(post));
      const coverUrl = post.coverImageUrl || fallbackImages[idx % fallbackImages.length];
      const readUrl = post.externalUrl || '#';
      const dateLabel = escapeHtml(formatNewsDate(post.publishedAt));
      const readMoreAttrs = readUrl !== '#'
        ? `href="${escapeHtml(readUrl)}" target="_blank" rel="noopener noreferrer"`
        : `href="#" data-read-more-post="${escapeHtml(postKey)}"`;

      return `
        <article class="news-card">
          <div class="news-card-img" style="background-image: url('${escapeHtml(coverUrl)}');"></div>
          <div class="news-card-body">
            <h3>${title}</h3>
            <p class="news-card-meta">${dateLabel}</p>
            <p>${excerpt}</p>
            <a ${readMoreAttrs} class="btn-text">READ MORE</a>
          </div>
        </article>
      `;
    }).join('');

    newsGridEl.innerHTML = cardMarkup;
    setNewsStatus('');
    prepareRevealElements(newsGridEl.querySelectorAll('.news-card'));
  }

  async function loadNewsFromSanity() {
    const sanityCfg = siteConfig.sanity || defaultSiteConfig.sanity;
    const projectId = sanityCfg.projectId;
    const dataset = sanityCfg.dataset || 'production';
    const apiVersion = sanityCfg.apiVersion || '2024-10-01';
    const postsLimit = Math.max(1, Math.min(12, Number(sanityCfg.postsLimit) || 3));
    const moreNewsLink = document.getElementById('more-news-link');

    if (moreNewsLink && sanityCfg.moreNewsUrl) {
      moreNewsLink.href = sanityCfg.moreNewsUrl;
    }

    if (!projectId) {
      setNewsStatus('Sanity is not configured yet. Add your project ID in site-config.js.');
      return;
    }

    const groqQuery = `*[_type in ["newsPost","post"] && defined(publishedAt)] | order(publishedAt desc)[0...${postsLimit}]{_id,"slug":slug.current,title,publishedAt,externalUrl,excerpt,body,"summary":coalesce(excerpt, pt::text(body)) ,"coverImageUrl":coalesce(coverImage.asset->url, mainImage.asset->url)}`;
    const encodedQuery = encodeURIComponent(groqQuery);
    const perspective = sanityCfg.useCdn === false ? 'published' : 'published';
    const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodedQuery}&perspective=${perspective}`;

    try {
      setNewsStatus('Loading latest posts...');
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      const posts = Array.isArray(payload.result) ? payload.result : [];
      if (!posts.length) {
        setNewsStatus('No published news yet. Add your first Post in Sanity Studio and publish it.');
        return;
      }

      renderNewsCards(posts);
    } catch (err) {
      console.error('Failed to load Sanity news:', err);
      const origin = window.location.origin || 'file://';
      const message = String(err && err.message ? err.message : err);
      if (message.includes('HTTP 403')) {
        setNewsStatus(`Sanity blocked this origin (${origin}). Add it to Sanity API CORS origins.`, true);
        return;
      }
      setNewsStatus('Could not load news right now. Check Sanity project ID, dataset, and CORS settings.', true);
    }
  }

  /* ── Sticky header ──────────────────────────────────────── */
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ── Mobile menu ────────────────────────────────────────── */
  const hamburger  = document.querySelector('.nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn   = document.querySelector('.mobile-menu-close');

  function openMenu()  { mobileMenu.classList.add('open');    document.body.style.overflow = 'hidden'; }
  function closeMenu() { mobileMenu.classList.remove('open'); document.body.style.overflow = ''; }

  hamburger.addEventListener('click', openMenu);
  closeBtn .addEventListener('click', closeMenu);

  // Close when a nav link is clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on backdrop click
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMenu();
  });

  /* ── Games carousel ─────────────────────────────────────── */
  const carousel = document.getElementById('games-carousel');
  const thumbs   = document.querySelectorAll('.thumb');
  const slides   = document.querySelectorAll('.game-slide');
  const prevBtn  = document.querySelector('.carousel-btn--prev');
  const nextBtn  = document.querySelector('.carousel-btn--next');

  let currentIndex = 0;
  let autoPlayInterval;

  function goTo(index) {
    currentIndex = (index + slides.length) % slides.length;
    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));
  }

  function startAutoPlay() {
    autoPlayInterval = setInterval(() => goTo(currentIndex + 1), 6000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  prevBtn.addEventListener('click', () => { goTo(currentIndex - 1); resetAutoPlay(); });
  nextBtn.addEventListener('click', () => { goTo(currentIndex + 1); resetAutoPlay(); });

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => { goTo(i); resetAutoPlay(); });
  });

  // Touch / swipe support
  let touchStartX = 0;
  carousel.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goTo(currentIndex + (diff > 0 ? 1 : -1)); resetAutoPlay(); }
  }, { passive: true });

  startAutoPlay();

  /* ── Smooth active nav link on scroll ───────────────────── */
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active-link', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(sec => sectionObserver.observe(sec));

  /* ── Reveal on scroll (fade-in) ─────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  function prepareRevealElements(elements) {
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
      revealObserver.observe(el);
    });
  }

  prepareRevealElements(document.querySelectorAll('.contact-block, .location-col'));

  // CSS class toggled by observer
  const style = document.createElement('style');
  style.textContent = `
    .revealed { opacity: 1 !important; transform: translateY(0) !important; }
    .nav-links a.active-link { color: #fff; }
  `;
  document.head.appendChild(style);

  setupPostModalEvents();
  setupNewsReadMoreEvents();
  loadNewsFromSanity();

})();
