/* ============================================================
   INDEX.JS — Homepage logic with 35+ features
   ============================================================ */

// ── DOM refs ────────────────────────────────────────────────
const articleList     = document.getElementById('article-list');
const emptyState      = document.getElementById('empty-state');
const categoryFilter  = document.getElementById('category-filter');
const tagFilter       = document.getElementById('tag-filter');
const authorFilter    = document.getElementById('author-filter');
const searchInput     = document.getElementById('search-input');
const searchCount     = document.getElementById('search-count');
const clearFiltersBtn = document.getElementById('clear-filters');
const emptyClearBtn   = document.getElementById('empty-clear');
const paginationEl    = document.getElementById('pagination-controls');
const articleStats    = document.getElementById('article-stats');
const featuredCard    = document.getElementById('featured');
const subscribeForm   = document.getElementById('subscribe-form');
const subscribeEmail  = document.getElementById('subscribe-email');
const subscribeName   = document.getElementById('subscribe-name');
const subscribeMsg    = document.getElementById('subscribe-message');
const darkToggle      = document.getElementById('dark-mode-toggle');
const contrastToggle  = document.getElementById('contrast-toggle');
const hamburger       = document.getElementById('hamburger');
const mobileNav       = document.getElementById('mobile-nav');
const mobileOverlay   = document.getElementById('mobile-overlay');
const scrollTopBtn    = document.getElementById('scroll-top');
const toastContainer  = document.getElementById('toast-container');
const footerYear      = document.getElementById('footer-year');
const mostReadList    = document.getElementById('most-read-list');
const tagCloud        = document.getElementById('tag-cloud');
const listViewBtn     = document.getElementById('list-view-btn');
const gridViewBtn     = document.getElementById('grid-view-btn');

// ── State ────────────────────────────────────────────────────
const PAGE_SIZE = 6;
let currentPage = 1;
let filteredArticles = [];
let currentSort = 'newest';
let currentView = 'list';
let searchDebounceTimer = null;

// ── Feature 1: Dark Mode ────────────────────────────────────
function getTheme() { return localStorage.getItem('theme') || 'light'; }
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const moonIcon = document.getElementById('icon-moon');
  const sunIcon  = document.getElementById('icon-sun');
  if (moonIcon && sunIcon) {
    moonIcon.classList.toggle('hidden', theme === 'dark');
    sunIcon.classList.toggle('hidden', theme === 'light');
  }
}
function toggleTheme() { applyTheme(getTheme() === 'dark' ? 'light' : 'dark'); }

// ── Feature 2: High Contrast Mode ───────────────────────────
function getContrast() { return localStorage.getItem('contrast') || 'normal'; }
function applyContrast(mode) {
  document.documentElement.setAttribute('data-contrast', mode);
  localStorage.setItem('contrast', mode);
}
function toggleContrast() { applyContrast(getContrast() === 'high' ? 'normal' : 'high'); }

// ── Feature 3: Toast Notification System ────────────────────
function showToast(message, type = 'info', duration = 3200) {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Feature 4: Hamburger Mobile Menu ────────────────────────
function openMenu() {
  hamburger.classList.add('open');
  mobileNav.classList.add('open');
  mobileOverlay.style.display = 'block';
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
  mobileOverlay.style.display = 'none';
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// ── Feature 5: Scroll-to-Top Button ─────────────────────────
function handleScroll() {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  updateActiveNav();
}

// ── Feature 6: Active Nav Highlighting on Scroll ─────────────
function updateActiveNav() {
  const sections = ['latest', 'most-read', 'about', 'newsletter', 'contact'];
  const navLinks = document.querySelectorAll('.nav-links a');
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) current = id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active-nav', link.getAttribute('href') === `#${current}`);
  });
}

// ── Feature 7: Animated Stat Counters ───────────────────────
function animateCounter(el, target, duration = 1200) {
  if (!el) return;
  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function renderStats() {
  const uniqueAuthors    = new Set(articles.map(a => a.author)).size;
  const uniqueCategories = new Set(articles.map(a => a.category)).size;
  const uniqueTags       = new Set(articles.flatMap(a => a.tags || [])).size;

  // Hero stats
  animateCounter(document.getElementById('stat-articles'), articles.length);
  animateCounter(document.getElementById('stat-authors'), uniqueAuthors);
  animateCounter(document.getElementById('stat-categories'), uniqueCategories);

  // Stats bar
  animateCounter(document.getElementById('stats-total'), articles.length, 1000);
  animateCounter(document.getElementById('stats-authors'), uniqueAuthors, 1000);
  animateCounter(document.getElementById('stats-categories'), uniqueCategories, 1000);
  animateCounter(document.getElementById('stats-tags'), uniqueTags, 1000);

  // Footer categories
  const footerCats = document.getElementById('footer-categories');
  if (footerCats) {
    const cats = [...new Set(articles.map(a => a.category))].slice(0, 6);
    footerCats.innerHTML = cats.map(c =>
      `<li><a href="#" onclick="setCategoryFilter('${c}');return false;">${c}</a></li>`
    ).join('');
  }
}

// ── Feature 8: View Count Tracking ──────────────────────────
function getViews(slug) {
  try { return parseInt(localStorage.getItem(`views-${slug}`) || '0', 10); } catch { return 0; }
}
function incrementViews(slug) {
  try { localStorage.setItem(`views-${slug}`, String(getViews(slug) + 1)); } catch {}
}

// ── Feature 9: Most Read Section ────────────────────────────
function renderMostRead() {
  if (!mostReadList) return;
  const sorted = [...articles]
    .map(a => ({ ...a, views: getViews(a.slug) }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  if (sorted.every(a => a.views === 0)) {
    sorted.splice(0, sorted.length, ...articles.slice(0, 5).map((a, i) => ({ ...a, views: 10 - i })));
  }

  mostReadList.innerHTML = '';
  sorted.forEach((article, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <a class="most-read-item" href="article.html?slug=${encodeURIComponent(article.slug)}">
        <span class="most-read-rank">${i + 1}</span>
        <span>
          <div class="most-read-title">${article.title}</div>
          <div class="most-read-meta">${article.author} · ${article.category} · ${article.readingTime}</div>
        </span>
      </a>
    `;
    mostReadList.appendChild(li);
  });
}

// ── Feature 10: Tag Cloud ────────────────────────────────────
function renderTagCloud() {
  if (!tagCloud) return;
  const counts = {};
  articles.forEach(a => (a.tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
  const max = Math.max(...Object.values(counts));

  tagCloud.innerHTML = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([tag, count]) => {
      const size = count / max > 0.7 ? 'size-lg' : count / max > 0.4 ? 'size-md' : '';
      return `<button class="tag-pill ${size}" onclick="setTagFilter('${tag}')" type="button" role="listitem" title="${count} article${count !== 1 ? 's' : ''}">${tag} <span class="tag-count">${count}</span></button>`;
    }).join('');
}

// ── Feature 11: Bookmarks ─────────────────────────────────────
function getBookmarks() {
  try { return JSON.parse(localStorage.getItem('bookmarks') || '[]'); } catch { return []; }
}
function toggleBookmark(slug) {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(slug);
  if (idx === -1) {
    bookmarks.push(slug);
    showToast('Article bookmarked', 'success');
  } else {
    bookmarks.splice(idx, 1);
    showToast('Bookmark removed', 'info');
  }
  try { localStorage.setItem('bookmarks', JSON.stringify(bookmarks)); } catch {}
  document.querySelectorAll(`.bookmark-btn[data-slug="${slug}"]`).forEach(btn => {
    btn.classList.toggle('bookmarked', bookmarks.includes(slug));
    btn.title = bookmarks.includes(slug) ? 'Remove bookmark' : 'Bookmark this article';
  });
}
function isBookmarked(slug) { return getBookmarks().includes(slug); }

// ── Feature 12: "New" Badge (< 7 days) ───────────────────────
function isNew(dateStr) {
  if (!dateStr) return false;
  const published = new Date(dateStr);
  return (Date.now() - published.getTime()) < 7 * 24 * 60 * 60 * 1000;
}

// ── Feature 13: Filter Rendering ─────────────────────────────
function populateFilters() {
  const categories = [...new Set(articles.map(a => a.category))].sort();
  const tags = [...new Set(articles.flatMap(a => a.tags || []))].sort();
  const authors = [...new Set(articles.map(a => a.author))].sort();

  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    categoryFilter.appendChild(opt);
  });
  tags.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    tagFilter.appendChild(opt);
  });
  authors.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a; opt.textContent = a;
    authorFilter.appendChild(opt);
  });
}

// ── Feature 14: Featured Article ─────────────────────────────
function renderFeatured() {
  const featured = articles.find(a => a.featured) || articles[0];
  if (!featured || !featuredCard) return;
  featuredCard.classList.remove('hidden');
  featuredCard.innerHTML = `
    <div class="featured-image" style="background-image:url('${featured.image || ''}')" role="img" aria-label="${featured.title}"></div>
    <div class="featured-content">
      <span class="featured-label">★ Featured</span>
      <div class="featured-meta">${featured.category} · ${featured.author} · ${featured.readingTime}</div>
      <h2 class="featured-title">${featured.title}</h2>
      <p class="featured-excerpt">${featured.excerpt || ''}</p>
      <div class="featured-actions">
        <a class="btn btn-primary" href="article.html?slug=${encodeURIComponent(featured.slug)}">Read story →</a>
        <button class="btn btn-secondary bookmark-btn ${isBookmarked(featured.slug) ? 'bookmarked' : ''}" data-slug="${featured.slug}" onclick="toggleBookmark('${featured.slug}')" type="button">
          ${isBookmarked(featured.slug) ? '🔖 Saved' : '🔖 Save'}
        </button>
      </div>
    </div>
  `;
}

// ── Feature 15: Apply Filters + Search ───────────────────────
function applyFilters() {
  const search   = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const tag      = tagFilter.value;
  const author   = authorFilter.value;

  filteredArticles = articles.filter(a => {
    const haystack = [a.title, a.excerpt, a.author, a.category, ...(a.tags || []), a.series]
      .filter(Boolean).join(' ').toLowerCase();
    return (
      (!search || haystack.includes(search)) &&
      (!category || a.category === category) &&
      (!tag || (a.tags || []).includes(tag)) &&
      (!author || a.author === author)
    );
  });

  applySort();
  currentPage = 1;
  renderArticleCards();

  // Search count badge
  if (search) {
    searchCount.textContent = `${filteredArticles.length}`;
    searchCount.classList.remove('hidden');
  } else {
    searchCount.classList.add('hidden');
  }

  // ARIA live region update
  articleStats.textContent = filteredArticles.length === 0
    ? 'No articles found.'
    : `Showing ${Math.min(filteredArticles.length, PAGE_SIZE)} of ${filteredArticles.length} article${filteredArticles.length !== 1 ? 's' : ''}`;
}

// ── Feature 16: Sort ─────────────────────────────────────────
function applySort() {
  const parseDate = d => new Date(d || 0).getTime();
  const parseMinutes = rt => parseInt(rt || '0', 10);
  switch (currentSort) {
    case 'newest':  filteredArticles.sort((a, b) => parseDate(b.date) - parseDate(a.date)); break;
    case 'oldest':  filteredArticles.sort((a, b) => parseDate(a.date) - parseDate(b.date)); break;
    case 'title':   filteredArticles.sort((a, b) => a.title.localeCompare(b.title)); break;
    case 'readtime': filteredArticles.sort((a, b) => parseMinutes(a.readingTime) - parseMinutes(b.readingTime)); break;
    case 'views':   filteredArticles.sort((a, b) => getViews(b.slug) - getViews(a.slug)); break;
  }
}

// ── Feature 17: Render Article Cards ─────────────────────────
function renderArticleCards() {
  articleList.innerHTML = '';

  if (filteredArticles.length === 0) {
    emptyState.classList.add('show');
    paginationEl.innerHTML = '';
    return;
  }
  emptyState.classList.remove('show');

  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filteredArticles.slice(start, start + PAGE_SIZE);

  page.forEach((article, idx) => {
    const bookmarked  = isBookmarked(article.slug);
    const newBadge    = isNew(article.date) ? '<span class="badge-new">New</span>' : '';
    const seriesBadge = article.series ? `<span class="tag-pill" style="background:var(--accent-light);color:var(--accent);">📚 ${article.series}</span>` : '';

    const li = document.createElement('li');
    li.className = `article-item reveal reveal-delay-${(idx % 4) + 1}`;
    li.innerHTML = `
      <div class="article-item-copy">
        <div class="article-metadata">
          <a class="category-badge" href="#" onclick="setCategoryFilter('${article.category}');return false;">${article.category}</a>
          ${newBadge}
          <span class="meta-dot">·</span>
          <span>${article.author}</span>
          <span class="meta-dot">·</span>
          <span>${article.date}</span>
          <span class="meta-dot">·</span>
          <span>${article.readingTime}</span>
          ${article.wordCount ? `<span class="meta-dot">·</span><span>${article.wordCount.toLocaleString()} words</span>` : ''}
        </div>
        <a class="article-link" href="article.html?slug=${encodeURIComponent(article.slug)}">${article.title}</a>
        <p class="article-excerpt">${article.excerpt || ''}</p>
        <div class="tag-list">
          ${(article.tags || []).map(t => `<button class="tag-pill" onclick="setTagFilter('${t}');return false;" type="button">${t}</button>`).join('')}
          ${seriesBadge}
        </div>
      </div>
      <div class="article-right">
        <a class="btn btn-sm btn-secondary" href="article.html?slug=${encodeURIComponent(article.slug)}">Read →</a>
        <button class="bookmark-btn ${bookmarked ? 'bookmarked' : ''}" data-slug="${article.slug}" type="button" title="${bookmarked ? 'Remove bookmark' : 'Bookmark this article'}" aria-label="${bookmarked ? 'Remove bookmark' : 'Bookmark'}">
          ${bookmarked ? '🔖' : '🔖'}
        </button>
      </div>
    `;

    // Bookmark click
    li.querySelector('.bookmark-btn:not(.btn)').addEventListener('click', () => toggleBookmark(article.slug));

    articleList.appendChild(li);
  });

  // Re-observe newly added elements
  document.querySelectorAll('.reveal:not(.revealed)').forEach(el => revealObserver.observe(el));
  renderPagination();
}

// ── Feature 18: Pagination ────────────────────────────────────
function renderPagination() {
  const pageCount = Math.ceil(filteredArticles.length / PAGE_SIZE);
  paginationEl.innerHTML = '';
  if (pageCount <= 1) return;

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'pagination-btn';
  prev.textContent = '←';
  prev.disabled = currentPage === 1;
  prev.addEventListener('click', () => { currentPage--; renderArticleCards(); window.scrollTo({ top: document.getElementById('latest').offsetTop - 80, behavior: 'smooth' }); });
  paginationEl.appendChild(prev);

  for (let p = 1; p <= pageCount; p++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `pagination-btn${p === currentPage ? ' active' : ''}`;
    btn.textContent = String(p);
    btn.setAttribute('aria-current', p === currentPage ? 'page' : 'false');
    btn.addEventListener('click', () => { currentPage = p; renderArticleCards(); window.scrollTo({ top: document.getElementById('latest').offsetTop - 80, behavior: 'smooth' }); });
    paginationEl.appendChild(btn);
  }

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'pagination-btn';
  next.textContent = '→';
  next.disabled = currentPage === pageCount;
  next.addEventListener('click', () => { currentPage++; renderArticleCards(); window.scrollTo({ top: document.getElementById('latest').offsetTop - 80, behavior: 'smooth' }); });
  paginationEl.appendChild(next);
}

// ── Feature 19: Grid / List View Toggle ──────────────────────
function setView(view) {
  currentView = view;
  articleList.classList.toggle('grid-view', view === 'grid');
  listViewBtn.classList.toggle('active', view === 'list');
  gridViewBtn.classList.toggle('active', view === 'grid');
  listViewBtn.setAttribute('aria-pressed', String(view === 'list'));
  gridViewBtn.setAttribute('aria-pressed', String(view === 'grid'));
  localStorage.setItem('articleView', view);
}

// ── Feature 20: Tag Cloud Filter Helper ──────────────────────
function setTagFilter(tag) {
  tagFilter.value = tag;
  applyFilters();
  document.getElementById('latest').scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelectorAll('.tag-pill').forEach(el => {
    el.classList.toggle('active', el.textContent.trim().startsWith(tag));
  });
}
window.setTagFilter = setTagFilter;

function setCategoryFilter(cat) {
  categoryFilter.value = cat;
  applyFilters();
  document.getElementById('latest').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.setCategoryFilter = setCategoryFilter;

// ── Feature 21: Newsletter with Confetti ─────────────────────
function launchConfetti() {
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 });
  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * canvas.height * 0.3,
    w: Math.random() * 12 + 4,
    h: Math.random() * 6 + 3,
    color: `hsl(${Math.random() * 360},70%,60%)`,
    rot: Math.random() * 360,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 4 + 2,
    vr: (Math.random() - 0.5) * 12,
  }));
  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (++frame < 150) requestAnimationFrame(animate);
    else document.body.removeChild(canvas);
  }
  animate();
}

function handleSubscribe(e) {
  e.preventDefault();
  const email = subscribeEmail.value.trim();
  const name  = subscribeName ? subscribeName.value.trim() : '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    subscribeMsg.textContent = 'Please enter a valid email address.';
    subscribeMsg.className = 'form-message error';
    return;
  }
  const prefs = [...document.querySelectorAll('.preferences input:checked')].map(i => i.value);
  const data  = { email, name, prefs, date: new Date().toISOString() };
  try { localStorage.setItem('newsletter', JSON.stringify(data)); } catch {}
  subscribeMsg.textContent = `🎉 Subscribed${name ? `, ${name}` : ''}! You'll receive updates for: ${prefs.length ? prefs.join(', ') : 'all topics'}.`;
  subscribeMsg.className = 'form-message';
  subscribeForm.reset();
  launchConfetti();
  showToast(`Subscribed as ${email}`, 'success');
}

function populateSubscribe() {
  try {
    const saved = JSON.parse(localStorage.getItem('newsletter') || 'null');
    if (saved) {
      subscribeEmail.value = saved.email || '';
      if (subscribeName) subscribeName.value = saved.name || '';
      subscribeMsg.textContent = `Already subscribed as ${saved.email}.`;
      subscribeMsg.className = 'form-message';
      if (saved.prefs) {
        document.querySelectorAll('.preferences input').forEach(i => {
          i.checked = saved.prefs.includes(i.value);
        });
      }
    }
  } catch {}
}

// ── Feature 22: Keyboard Shortcuts ───────────────────────────
function handleKeyboard(e) {
  if (e.key === '/' && document.activeElement !== searchInput && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
    showToast('Search activated — type to filter articles', 'info', 2000);
  }
  if (e.key === 'Escape') {
    if (document.activeElement === searchInput && searchInput.value) {
      searchInput.value = '';
      applyFilters();
    }
    closeMenu();
  }
}

// ── Feature 23: Intersection Observer Reveal ─────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

function observeRevealElements() {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// ── Feature 24: Reading Streak ────────────────────────────────
function updateReadingStreak() {
  try {
    const today  = new Date().toDateString();
    const last   = localStorage.getItem('lastVisit');
    let streak   = parseInt(localStorage.getItem('streak') || '0', 10);
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (last === today) return;
    streak = (last === yesterday) ? streak + 1 : 1;
    localStorage.setItem('streak', String(streak));
    localStorage.setItem('lastVisit', today);
    if (streak > 1) {
      setTimeout(() => showToast(`🔥 ${streak}-day reading streak!`, 'success'), 1500);
    }
  } catch {}
}

// ── Feature 25: Footer Year ────────────────────────────────────
if (footerYear) footerYear.textContent = new Date().getFullYear();

// ── Feature 26: Skeleton Loading Placeholders ─────────────────
function showSkeleton() {
  articleList.innerHTML = Array(PAGE_SIZE).fill(`
    <li class="skeleton-item">
      <div class="skeleton skeleton-line skeleton-short" style="margin-bottom:12px;"></div>
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-line" style="margin-bottom:6px;"></div>
      <div class="skeleton skeleton-line skeleton-short"></div>
    </li>
  `).join('');
}

// ── Feature 27: Search Debounce ────────────────────────────────
function debouncedSearch() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(applyFilters, 250);
}

// ── Feature 28: Clear Filters ──────────────────────────────────
function clearFilters() {
  searchInput.value = '';
  categoryFilter.value = '';
  tagFilter.value = '';
  authorFilter.value = '';
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-sort="newest"]').classList.add('active');
  currentSort = 'newest';
  document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
  searchCount.classList.add('hidden');
  applyFilters();
  showToast('Filters cleared', 'info', 1800);
}

// ── Feature 29: Pref Chips (visual toggle without :has) ────────
function initPrefChips() {
  document.querySelectorAll('.pref-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const input = chip.querySelector('input');
      chip.classList.toggle('selected', input.checked);
    });
  });
}

// ── INIT ─────────────────────────────────────────────────────
function init() {
  // Apply saved theme/contrast
  applyTheme(getTheme());
  applyContrast(getContrast());

  // Show skeleton briefly for effect
  showSkeleton();

  // Restore view preference
  const savedView = localStorage.getItem('articleView') || 'list';
  setView(savedView);

  // Populate UI
  setTimeout(() => {
    populateFilters();
    renderStats();
    renderFeatured();
    renderMostRead();
    renderTagCloud();
    applyFilters();
    populateSubscribe();
    observeRevealElements();
    updateReadingStreak();
    if (footerYear) footerYear.textContent = new Date().getFullYear();
  }, 150);

  // Event listeners
  searchInput.addEventListener('input', debouncedSearch);
  categoryFilter.addEventListener('change', applyFilters);
  tagFilter.addEventListener('change', applyFilters);
  if (authorFilter) authorFilter.addEventListener('change', applyFilters);
  clearFiltersBtn.addEventListener('click', clearFilters);
  if (emptyClearBtn) emptyClearBtn.addEventListener('click', clearFilters);
  subscribeForm.addEventListener('submit', handleSubscribe);
  darkToggle.addEventListener('click', toggleTheme);
  if (contrastToggle) contrastToggle.addEventListener('click', toggleContrast);
  hamburger.addEventListener('click', openMenu);
  mobileOverlay.addEventListener('click', closeMenu);
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('keydown', handleKeyboard);
  listViewBtn.addEventListener('click', () => setView('list'));
  gridViewBtn.addEventListener('click', () => setView('grid'));

  // Sort buttons
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSort = btn.dataset.sort;
      applySort();
      renderArticleCards();
    });
  });

  // Pref chips
  initPrefChips();
}

init();
