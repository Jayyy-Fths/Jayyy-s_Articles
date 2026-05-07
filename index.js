const articleList = document.getElementById('article-list');
const emptyState = document.getElementById('empty-state');
const categoryFilter = document.getElementById('category-filter');
const tagFilter = document.getElementById('tag-filter');
const searchInput = document.getElementById('search-input');
const clearFiltersButton = document.getElementById('clear-filters');
const paginationControls = document.getElementById('pagination-controls');
const articleStats = document.getElementById('article-stats');
const featuredCard = document.getElementById('featured');
const subscribeForm = document.getElementById('subscribe-form');
const subscribeEmail = document.getElementById('subscribe-email');
const subscribeMessage = document.getElementById('subscribe-message');
const darkModeButton = document.getElementById('dark-mode-toggle');

const pageSize = 4;
let currentPage = 1;
let filteredArticles = [];

function getUniqueValues(field) {
  const values = new Set();
  articles.forEach((article) => {
    if (Array.isArray(article[field])) {
      article[field].forEach((value) => values.add(value));
    } else if (article[field]) {
      values.add(article[field]);
    }
  });
  return Array.from(values).sort();
}

function formatMeta(article) {
  const parts = [];
  if (article.author) parts.push(article.author);
  if (article.date) parts.push(article.date);
  if (article.readingTime) parts.push(article.readingTime);
  return parts.join(' • ');
}

function updateDarkModeButton() {
  const enabled = localStorage.getItem('darkMode') === 'true';
  document.body.classList.toggle('dark-mode', enabled);
  darkModeButton.textContent = enabled ? 'Light mode' : 'Dark mode';
}

function toggleDarkMode() {
  const enabled = !document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', String(enabled));
  updateDarkModeButton();
}

function renderFilters() {
  const categories = getUniqueValues('category');
  const tags = getUniqueValues('tags');

  categoryFilter.innerHTML = '<option value="">All categories</option>';
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  tagFilter.innerHTML = '<option value="">All tags</option>';
  tags.forEach((tag) => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagFilter.appendChild(option);
  });
}

function getFeaturedArticle() {
  return articles.find((article) => article.featured) || articles[0] || null;
}

function renderFeatured() {
  const featured = getFeaturedArticle();
  if (!featured || !featuredCard) {
    return;
  }

  featuredCard.classList.remove('hidden');
  featuredCard.innerHTML = `
    <div class="featured-image" style="background-image: url('${featured.image || ''}')"></div>
    <div class="featured-content">
      <div class="featured-meta">${featured.category || 'Featured'} • ${formatMeta(featured)}</div>
      <h2>${featured.title}</h2>
      <p>${featured.excerpt || ''}</p>
      <div class="featured-actions">
        <a class="btn btn-primary" href="article.html?slug=${encodeURIComponent(featured.slug)}">Read story</a>
      </div>
    </div>
  `;
}

function applyFilters() {
  const search = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const tag = tagFilter.value;

  filteredArticles = articles.filter((article) => {
    const query = [article.title, article.excerpt, article.author, article.category, ...(article.tags || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = !search || query.includes(search);
    const matchesCategory = !category || article.category === category;
    const matchesTag = !tag || (Array.isArray(article.tags) && article.tags.includes(tag));

    return matchesSearch && matchesCategory && matchesTag;
  });

  currentPage = 1;
  renderArticles();
}

function renderArticleCards() {
  articleList.innerHTML = '';
  if (filteredArticles.length === 0) {
    emptyState.style.display = 'block';
    paginationControls.innerHTML = '';
    articleStats.textContent = 'No stories available.';
    return;
  }

  emptyState.style.display = 'none';
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageArticles = filteredArticles.slice(start, end);

  pageArticles.forEach((article) => {
    const item = document.createElement('li');
    item.className = 'article-item';

    const left = document.createElement('div');
    left.className = 'article-item-copy';

    const meta = document.createElement('div');
    meta.className = 'article-metadata';
    meta.textContent = `${article.category || 'Feature'} • ${article.author || 'Unknown'} • ${article.date || ''}`;

    const title = document.createElement('a');
    title.href = `article.html?slug=${encodeURIComponent(article.slug)}`;
    title.textContent = article.title;
    title.className = 'article-link';

    const excerpt = document.createElement('p');
    excerpt.textContent = article.excerpt || 'Click to read this article.';
    excerpt.className = 'article-excerpt';

    const tags = document.createElement('div');
    tags.className = 'tag-list';
    (article.tags || []).forEach((tagText) => {
      const tag = document.createElement('span');
      tag.className = 'tag-pill';
      tag.textContent = tagText;
      tags.appendChild(tag);
    });

    left.appendChild(meta);
    left.appendChild(title);
    left.appendChild(excerpt);
    left.appendChild(tags);

    const right = document.createElement('div');
    right.className = 'article-right';
    const viewLink = document.createElement('a');
    viewLink.href = `article.html?slug=${encodeURIComponent(article.slug)}`;
    viewLink.textContent = 'Read';
    viewLink.className = 'btn btn-secondary';
    right.appendChild(viewLink);

    item.appendChild(left);
    item.appendChild(right);
    articleList.appendChild(item);
  });

  renderPagination();
  articleStats.textContent = `Showing ${Math.min(filteredArticles.length, pageSize)} of ${filteredArticles.length} articles`;
}

function renderPagination() {
  const pageCount = Math.ceil(filteredArticles.length / pageSize);
  if (pageCount <= 1) {
    paginationControls.innerHTML = '';
    return;
  }

  paginationControls.innerHTML = '';

  for (let page = 1; page <= pageCount; page += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `pagination-button${page === currentPage ? ' active' : ''}`;
    button.textContent = String(page);
    button.addEventListener('click', () => {
      currentPage = page;
      renderArticleCards();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    paginationControls.appendChild(button);
  }
}

function renderArticles() {
  renderFeatured();
  renderArticleCards();
}

function handleSubscribe(event) {
  event.preventDefault();
  const email = subscribeEmail.value.trim();
  if (!email) {
    subscribeMessage.textContent = 'Enter a valid email address.';
    return;
  }
  localStorage.setItem('newsletterEmail', email);
  subscribeMessage.textContent = `Subscribed as ${email}.`;
  subscribeEmail.value = '';
}

function populateSubscribe() {
  const stored = localStorage.getItem('newsletterEmail');
  if (stored) {
    subscribeEmail.value = stored;
    subscribeMessage.textContent = `Already subscribed as ${stored}.`;
  }
}

function clearFilters() {
  searchInput.value = '';
  categoryFilter.value = '';
  tagFilter.value = '';
  applyFilters();
}

function init() {
  renderFilters();
  applyFilters();
  populateSubscribe();
  updateDarkModeButton();

  searchInput.addEventListener('input', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);
  tagFilter.addEventListener('change', applyFilters);
  if (clearFiltersButton) {
    clearFiltersButton.addEventListener('click', clearFilters);
  }
  subscribeForm.addEventListener('submit', handleSubscribe);
  darkModeButton.addEventListener('click', toggleDarkMode);
}

init();
