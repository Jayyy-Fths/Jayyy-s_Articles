/* ============================================================
   ARTICLE.JS — Article page logic with 25+ features
   ============================================================ */

// ── DOM refs ─────────────────────────────────────────────────
const progressBar      = document.getElementById('reading-progress');
const darkToggle       = document.getElementById('dark-mode-toggle');
const contrastToggle   = document.getElementById('contrast-toggle');
const hamburger        = document.getElementById('hamburger');
const mobileNav        = document.getElementById('mobile-nav');
const mobileOverlay    = document.getElementById('mobile-overlay');
const scrollTopBtn     = document.getElementById('scroll-top');
const toastContainer   = document.getElementById('toast-container');
const articleImage     = document.getElementById('article-image');
const articleContent   = document.getElementById('article-content');
const tocList          = document.getElementById('toc-list');
const tocCard          = document.getElementById('toc-card');
const commentList      = document.getElementById('comment-list');
const commentCount     = document.getElementById('comment-count');
const commentForm      = document.getElementById('comment-form');
const commentName      = document.getElementById('comment-name');
const commentMsg       = document.getElementById('comment-message');
const commentFormMsg   = document.getElementById('comment-form-msg');
const relatedList      = document.getElementById('related-list');
const articleNav       = document.getElementById('article-nav');
const authorBioCard    = document.getElementById('author-bio-card');
const footerYear       = document.getElementById('footer-year');
const focusModeBtn     = document.getElementById('focus-mode-btn');
const printBtn         = document.getElementById('print-btn');
const bookmarkBtn      = document.getElementById('bookmark-btn');

// ── Feature 1: Dark Mode ────────────────────────────────────
function getTheme() { return localStorage.getItem('theme') || 'light'; }
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const moon = document.getElementById('icon-moon');
  const sun  = document.getElementById('icon-sun');
  if (moon) moon.classList.toggle('hidden', theme === 'dark');
  if (sun)  sun.classList.toggle('hidden',  theme === 'light');
}
function toggleTheme() { applyTheme(getTheme() === 'dark' ? 'light' : 'dark'); }

// ── Feature 2: High Contrast ────────────────────────────────
function getContrast() { return localStorage.getItem('contrast') || 'normal'; }
function applyContrast(mode) {
  document.documentElement.setAttribute('data-contrast', mode);
  localStorage.setItem('contrast', mode);
}
function toggleContrast() { applyContrast(getContrast() === 'high' ? 'normal' : 'high'); }

// ── Feature 3: Toast System ─────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
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

// ── Feature 4: Mobile Menu ──────────────────────────────────
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

// ── Feature 5: Reading Progress Bar ─────────────────────────
function updateProgress() {
  if (!progressBar || !articleContent) return;
  const { top, height } = articleContent.getBoundingClientRect();
  const progress = Math.min(100, Math.max(0, (-top / (height - window.innerHeight)) * 100));
  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute('aria-valuenow', Math.round(progress));
  // Scroll-to-top visibility
  if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  // TOC active highlight
  updateTocActive();
}

// ── Feature 6: Table of Contents ─────────────────────────────
function buildTOC() {
  if (!articleContent || !tocList) return;
  const headings = articleContent.querySelectorAll('h2, h3');
  if (headings.length < 2) {
    if (tocCard) tocCard.style.display = 'none';
    // Collapse layout to single column
    const layout = document.getElementById('article-layout');
    if (layout) layout.style.gridTemplateColumns = '1fr';
    return;
  }

  tocList.innerHTML = '';
  headings.forEach((h, i) => {
    const id = `heading-${i}`;
    h.id = id;
    const li = document.createElement('li');
    li.className = `toc-item toc-${h.tagName.toLowerCase()}`;
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.className = 'toc-link';
    a.textContent = h.textContent;
    a.addEventListener('click', e => {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    li.appendChild(a);
    tocList.appendChild(li);
  });
}

function updateTocActive() {
  if (!tocList) return;
  const links = tocList.querySelectorAll('.toc-link');
  let activeId = null;
  document.querySelectorAll('[id^="heading-"]').forEach(h => {
    if (h.getBoundingClientRect().top < 140) activeId = h.id;
  });
  links.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
  });
}

// ── Feature 7: Text Size Controls ────────────────────────────
const SIZE_MAP = { sm: 'font-sm', md: 'font-md', lg: 'font-lg', xl: 'font-xl' };
function applyTextSize(size) {
  Object.values(SIZE_MAP).forEach(cls => document.body.classList.remove(cls));
  document.body.classList.add(SIZE_MAP[size] || 'font-md');
  localStorage.setItem('textSize', size);
  document.querySelectorAll('.text-size-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.size === size);
  });
}

// ── Feature 8: Focus / Reading Mode ──────────────────────────
let focusMode = false;
function toggleFocusMode() {
  focusMode = !focusMode;
  document.querySelectorAll('.site-nav, .related-card, .comments-card, .author-bio-card, #article-nav, .breadcrumbs, .site-footer, .article-controls, .toc-card')
    .forEach(el => el.classList.toggle('hidden', focusMode));
  if (focusModeBtn) {
    focusModeBtn.textContent = focusMode ? '✕ Exit Focus' : '🎯 Focus';
    focusModeBtn.classList.toggle('btn-primary', focusMode);
    focusModeBtn.classList.toggle('btn-ghost', !focusMode);
  }
  // Full-width layout in focus mode
  const layout = document.getElementById('article-layout');
  if (layout) layout.style.gridTemplateColumns = focusMode ? '1fr' : '';
  showToast(focusMode ? 'Focus mode on — distraction-free reading' : 'Focus mode off', 'info', 2000);
}

// ── Feature 9: Share — Twitter ───────────────────────────────
function shareTwitter(title) {
  const text = encodeURIComponent(`"${title}" — read on The Record`);
  const url  = encodeURIComponent(window.location.href);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer,width=600,height=400');
}

// ── Feature 10: Share — LinkedIn ─────────────────────────────
function shareLinkedIn() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer,width=700,height=500');
}

// ── Feature 11: Share — WhatsApp ─────────────────────────────
function shareWhatsApp(title) {
  const text = encodeURIComponent(`${title} — ${window.location.href}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
}

// ── Feature 12: Share — Email ────────────────────────────────
function shareEmail(title) {
  const subject = encodeURIComponent(`Interesting article: ${title}`);
  const body    = encodeURIComponent(`I thought you'd enjoy this article from The Record:\n\n"${title}"\n\n${window.location.href}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// ── Feature 13: Share — Copy Link ────────────────────────────
function copyLink() {
  const copyBtn = document.getElementById('share-copy');
  navigator.clipboard.writeText(window.location.href).then(() => {
    if (copyBtn) { copyBtn.textContent = '✓ Copied!'; copyBtn.classList.add('copied'); }
    showToast('Link copied to clipboard', 'success');
    setTimeout(() => {
      if (copyBtn) { copyBtn.textContent = '🔗 Copy link'; copyBtn.classList.remove('copied'); }
    }, 2200);
  }).catch(() => showToast('Copy failed — use Ctrl+C on the URL bar', 'error'));
}

// ── Feature 14: Bookmark ─────────────────────────────────────
function getBookmarks() {
  try { return JSON.parse(localStorage.getItem('bookmarks') || '[]'); } catch { return []; }
}
function toggleBookmark(slug) {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(slug);
  if (idx === -1) {
    bookmarks.push(slug);
    if (bookmarkBtn) { bookmarkBtn.textContent = '🔖 Saved'; bookmarkBtn.classList.add('btn-primary'); bookmarkBtn.classList.remove('btn-ghost'); }
    showToast('Article saved to bookmarks', 'success');
  } else {
    bookmarks.splice(idx, 1);
    if (bookmarkBtn) { bookmarkBtn.textContent = '🔖 Save article'; bookmarkBtn.classList.remove('btn-primary'); bookmarkBtn.classList.add('btn-ghost'); }
    showToast('Bookmark removed', 'info');
  }
  try { localStorage.setItem('bookmarks', JSON.stringify(bookmarks)); } catch {}
}
function isBookmarked(slug) { return getBookmarks().includes(slug); }

// ── Feature 15: View Count ───────────────────────────────────
function trackView(slug) {
  try {
    const key = `views-${slug}`;
    const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
    localStorage.setItem(key, String(count));
  } catch {}
}

// ── Feature 16: Estimated Reading Time ───────────────────────
function estimateReadTime(html) {
  const words = html.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

// ── Feature 17: Word Count ───────────────────────────────────
function countWords(html) {
  return html.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
}

// ── Feature 18: Render Article ───────────────────────────────
function renderArticle(article) {
  document.title = `${article.title} — The Record`;

  // Meta tags
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', article.excerpt || article.title);

  // Hero fields
  document.getElementById('article-category').textContent = article.category || 'Story';
  document.getElementById('article-title').textContent    = article.title;
  document.getElementById('breadcrumb-category').textContent = article.category || 'Story';
  document.getElementById('breadcrumb-title').textContent    = article.title;

  const authorEl = document.getElementById('article-author');
  if (authorEl) authorEl.textContent = article.author || 'Unknown';

  const avatarEl = document.getElementById('author-avatar');
  if (avatarEl) avatarEl.textContent = (article.authorAvatar || (article.author || 'A').slice(0, 2)).toUpperCase();

  const dateEl = document.getElementById('article-date');
  if (dateEl) dateEl.textContent = article.date || '';

  const words   = article.wordCount || countWords(article.content || '');
  const readTime = article.readingTime || estimateReadTime(article.content || '');

  const rtEl = document.getElementById('article-reading-time');
  if (rtEl) rtEl.textContent = readTime;

  const wcEl  = document.getElementById('article-word-count');
  const wcSep = document.getElementById('word-count-sep');
  if (wcEl && words) {
    wcEl.textContent = `${words.toLocaleString()} words`;
  } else {
    if (wcSep) wcSep.style.display = 'none';
    if (wcEl)  wcEl.style.display  = 'none';
  }

  // Series badge
  const seriesBadge = document.getElementById('article-series-badge');
  if (seriesBadge && article.series) {
    seriesBadge.innerHTML = `<span class="tag-pill" style="background:var(--accent-light);color:var(--accent);border:1px solid var(--accent);">📚 ${article.series}</span>`;
  }

  // Tags
  const tagsEl = document.getElementById('article-tags');
  if (tagsEl) {
    tagsEl.innerHTML = (article.tags || []).map(t =>
      `<a class="tag-pill" href="index.html?tag=${encodeURIComponent(t)}">${t}</a>`
    ).join('');
  }

  // Image
  if (article.image && articleImage) {
    articleImage.classList.remove('hidden');
    articleImage.style.backgroundImage = `url('${article.image}')`;
    articleImage.setAttribute('aria-label', article.title);
  }

  // Content
  if (articleContent) {
    articleContent.innerHTML = article.content || '<p>No content available.</p>';
    buildTOC();
  }

  // Author bio
  renderAuthorBio(article);

  // Bookmark state
  if (bookmarkBtn) {
    const saved = isBookmarked(article.slug);
    bookmarkBtn.textContent = saved ? '🔖 Saved' : '🔖 Save article';
    if (saved) { bookmarkBtn.classList.add('btn-primary'); bookmarkBtn.classList.remove('btn-ghost'); }
  }

  // Avatar color based on initials
  const colors = ['#2563eb','#7c3aed','#db2777','#059669','#d97706','#dc2626','#0891b2'];
  const colorIdx = (article.author || 'A').charCodeAt(0) % colors.length;
  document.querySelectorAll('.author-avatar, .author-bio-avatar').forEach(el => {
    el.style.background = colors[colorIdx];
  });
}

// ── Feature 19: Author Bio ────────────────────────────────────
function renderAuthorBio(article) {
  if (!authorBioCard) return;
  const bioName   = document.getElementById('bio-name');
  const bioAvatar = document.getElementById('bio-avatar');
  const bioText   = document.getElementById('bio-text');
  if (bioName)   bioName.textContent   = article.author || 'Contributor';
  if (bioAvatar) bioAvatar.textContent = (article.authorAvatar || (article.author || 'A').slice(0, 2)).toUpperCase();
  if (bioText)   bioText.textContent   = article.authorBio || 'A contributor to The Record.';
}

// ── Feature 20: Prev / Next Navigation ───────────────────────
function renderArticleNav(article) {
  if (!articleNav) return;
  const idx  = articles.findIndex(a => a.slug === article.slug);
  const prev = articles[idx - 1];
  const next = articles[idx + 1];

  if (!prev && !next) { articleNav.style.display = 'none'; return; }

  articleNav.innerHTML = `
    ${prev ? `<a class="article-nav-item" href="article.html?slug=${encodeURIComponent(prev.slug)}">
      <span class="article-nav-dir">← Previous</span>
      <span class="article-nav-title">${prev.title}</span>
    </a>` : '<div></div>'}
    ${next ? `<a class="article-nav-item next" href="article.html?slug=${encodeURIComponent(next.slug)}">
      <span class="article-nav-dir">Next →</span>
      <span class="article-nav-title">${next.title}</span>
    </a>` : '<div></div>'}
  `;
}

// ── Feature 21: Related Articles ─────────────────────────────
function renderRelated(article) {
  if (!relatedList) return;

  const explicit = articles.filter(a => a.slug !== article.slug && (article.relatedSlugs || []).includes(a.slug));
  const fallback = articles.filter(a => a.slug !== article.slug && a.category === article.category).slice(0, 3);
  const list = explicit.length ? explicit : fallback;

  if (!list.length) {
    relatedList.innerHTML = '<li style="color:var(--text-3);font-size:0.9rem;">No related articles available.</li>';
    return;
  }

  relatedList.innerHTML = list.map(item => `
    <li class="related-item">
      <a href="article.html?slug=${encodeURIComponent(item.slug)}">${item.title}</a>
      <div class="related-meta">${item.author} · ${item.category} · ${item.readingTime}</div>
    </li>
  `).join('');
}

// ── Feature 22: Comments with Reactions ──────────────────────
function getComments(slug) {
  try { return JSON.parse(localStorage.getItem(`comments-${slug}`) || '[]'); } catch { return []; }
}
function saveComments(slug, data) {
  try { localStorage.setItem(`comments-${slug}`, JSON.stringify(data)); } catch {}
}

const REACTIONS = [['👍', 'Like'], ['❤️', 'Love'], ['🎉', 'Celebrate']];
const AVATAR_COLORS = ['#2563eb','#7c3aed','#db2777','#059669','#d97706','#dc2626','#0891b2','#0284c7'];

function getReactions(slug, commentIdx) {
  try { return JSON.parse(localStorage.getItem(`reactions-${slug}-${commentIdx}`) || '{}'); } catch { return {}; }
}
function toggleReaction(slug, commentIdx, emoji) {
  const data = getReactions(slug, commentIdx);
  if (data[emoji]) delete data[emoji]; else data[emoji] = (data[emoji] || 0) + 1;
  try { localStorage.setItem(`reactions-${slug}-${commentIdx}`, JSON.stringify(data)); } catch {}
  renderComments(slug);
}

function renderComments(slug) {
  if (!commentList || !commentCount) return;
  const comments = getComments(slug);
  commentCount.textContent = `${comments.length} comment${comments.length !== 1 ? 's' : ''}`;

  if (!comments.length) {
    commentList.innerHTML = '<li class="comment-empty">No comments yet. Be the first to share your thoughts.</li>';
    return;
  }

  commentList.innerHTML = '';
  comments.forEach((comment, idx) => {
    const reactions = getReactions(slug, idx);
    const color  = AVATAR_COLORS[(comment.name || 'A').charCodeAt(0) % AVATAR_COLORS.length];
    const initials = (comment.name || 'A').slice(0, 2).toUpperCase();

    const li = document.createElement('li');
    li.className = 'comment-item';
    li.innerHTML = `
      <div class="comment-header">
        <div class="comment-avatar" style="background:${color};">${initials}</div>
        <div class="comment-info">
          <div class="comment-name">${escapeHtml(comment.name)}</div>
          <div class="comment-date">${comment.date}</div>
        </div>
      </div>
      <p class="comment-text">${escapeHtml(comment.message)}</p>
      <div class="comment-reactions">
        ${REACTIONS.map(([emoji, label]) => {
          const count = reactions[emoji] || 0;
          return `<button class="reaction-btn ${count ? 'reacted' : ''}" data-emoji="${emoji}" data-idx="${idx}" type="button" aria-label="${label} (${count})">
            ${emoji} <span class="reaction-count">${count || ''}</span>
          </button>`;
        }).join('')}
      </div>
    `;

    li.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', () => toggleReaction(slug, parseInt(btn.dataset.idx, 10), btn.dataset.emoji));
    });

    commentList.appendChild(li);
  });
}

function handleCommentSubmit(e, slug) {
  e.preventDefault();
  const name    = commentName.value.trim();
  const message = commentMsg.value.trim();
  if (!name || !message) {
    if (commentFormMsg) { commentFormMsg.textContent = 'Please fill in both fields.'; commentFormMsg.className = 'form-message error'; }
    return;
  }
  const comments = getComments(slug);
  comments.unshift({ name, message, date: new Date().toLocaleString() });
  saveComments(slug, comments);
  commentForm.reset();
  if (commentFormMsg) { commentFormMsg.textContent = 'Comment posted!'; commentFormMsg.className = 'form-message'; }
  setTimeout(() => { if (commentFormMsg) commentFormMsg.textContent = ''; }, 3000);
  renderComments(slug);
  showToast('Comment posted successfully', 'success');
}

// ── Feature 23: Escape HTML ──────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Feature 24: Not Found State ──────────────────────────────
function showNotFound() {
  document.title = 'Article not found — The Record';
  const titleEl = document.getElementById('article-title');
  if (titleEl) titleEl.textContent = 'Article not found';
  if (articleContent) articleContent.innerHTML = `
    <div style="text-align:center;padding:40px 20px;">
      <div style="font-size:3rem;margin-bottom:16px;">🔎</div>
      <h2>We couldn't find that article</h2>
      <p style="color:var(--text-2);margin:12px 0 24px;">The slug in the URL doesn't match any article in the database.</p>
      <a href="index.html" class="btn btn-primary">← Back to all articles</a>
    </div>
  `;
  if (articleImage) articleImage.classList.add('hidden');
  if (tocCard)      tocCard.style.display = 'none';
  const layout = document.getElementById('article-layout');
  if (layout) layout.style.gridTemplateColumns = '1fr';
}

// ── Feature 25: IntersectionObserver Reveals ─────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

// ── INIT ─────────────────────────────────────────────────────
function init() {
  applyTheme(getTheme());
  applyContrast(getContrast());

  // Footer year
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  // Restore text size
  const savedSize = localStorage.getItem('textSize') || 'md';
  applyTextSize(savedSize);

  // Text size buttons
  document.querySelectorAll('.text-size-btn').forEach(btn => {
    btn.addEventListener('click', () => applyTextSize(btn.dataset.size));
  });

  // Load article
  const params  = new URLSearchParams(window.location.search);
  const slug    = params.get('slug');
  const article = Array.isArray(articles) ? articles.find(a => a.slug === slug) : null;

  if (article) {
    renderArticle(article);
    renderRelated(article);
    renderArticleNav(article);
    renderComments(article.slug);
    trackView(article.slug);

    // Bookmark button
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', () => toggleBookmark(article.slug));
    }

    // Share buttons
    const el = id => document.getElementById(id);
    el('share-twitter')?.addEventListener('click',  () => shareTwitter(article.title));
    el('share-linkedin')?.addEventListener('click', () => shareLinkedIn());
    el('share-whatsapp')?.addEventListener('click', () => shareWhatsApp(article.title));
    el('share-email')?.addEventListener('click',    () => shareEmail(article.title));
    el('share-copy')?.addEventListener('click',     () => copyLink());

    // Comments
    if (commentForm) commentForm.addEventListener('submit', e => handleCommentSubmit(e, article.slug));
  } else {
    showNotFound();
  }

  // Nav & UI
  darkToggle?.addEventListener('click', toggleTheme);
  contrastToggle?.addEventListener('click', toggleContrast);
  hamburger?.addEventListener('click', openMenu);
  mobileOverlay?.addEventListener('click', closeMenu);
  scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  focusModeBtn?.addEventListener('click', toggleFocusMode);
  printBtn?.addEventListener('click', () => window.print());

  // Keyboard: Escape closes menu / focus mode
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeMenu(); if (focusMode) toggleFocusMode(); }
  });

  // Scroll events
  window.addEventListener('scroll', updateProgress, { passive: true });

  // Reveal animations
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

onArticlesReady(init);
