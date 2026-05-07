const darkModeButton = document.getElementById('dark-mode-toggle');
const shareButton = document.getElementById('share-button');
const shareMessage = document.getElementById('share-message');
const commentForm = document.getElementById('comment-form');
const commentName = document.getElementById('comment-name');
const commentMessageInput = document.getElementById('comment-message');
const commentList = document.getElementById('comment-list');
const commentCount = document.getElementById('comment-count');
const relatedList = document.getElementById('related-list');
const articleImage = document.getElementById('article-image');

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function updateDarkModeButton() {
  const enabled = localStorage.getItem('darkMode') === 'true';
  document.body.classList.toggle('dark-mode', enabled);
  if (darkModeButton) {
    darkModeButton.textContent = enabled ? 'Light mode' : 'Dark mode';
  }
}

function toggleDarkMode() {
  const enabled = !document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', String(enabled));
  updateDarkModeButton();
}

function estimateReadingTime(html) {
  const text = html.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function renderTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return '';
  }
  return tags.map((tag) => `<span class="tag-pill">${tag}</span>`).join('');
}

function formatMeta(article) {
  const values = [article.author, article.date, article.readingTime || estimateReadingTime(article.content)];
  return values.filter(Boolean).join(' • ');
}

function renderRelated(article) {
  if (!relatedList) return;
  relatedList.innerHTML = '';

  const related = articles.filter((item) => {
    return item.slug !== article.slug && (article.relatedSlugs || []).includes(item.slug);
  });

  const fallback = articles.filter((item) => {
    return item.slug !== article.slug && item.category === article.category;
  }).slice(0, 3);

  const list = related.length > 0 ? related : fallback;

  if (list.length === 0) {
    relatedList.innerHTML = '<li>No related articles available.</li>';
    return;
  }

  list.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'related-item';
    li.innerHTML = `<a href="article.html?slug=${encodeURIComponent(item.slug)}">${item.title}</a>`;
    relatedList.appendChild(li);
  });
}

function getComments(slug) {
  try {
    const saved = localStorage.getItem(`comments-${slug}`);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveComments(slug, comments) {
  localStorage.setItem(`comments-${slug}`, JSON.stringify(comments));
}

function renderComments(slug) {
  if (!commentList || !commentCount) return;
  const comments = getComments(slug);
  commentList.innerHTML = '';
  commentCount.textContent = `${comments.length} comment${comments.length !== 1 ? 's' : ''}`;

  if (comments.length === 0) {
    commentList.innerHTML = '<li class="comment-empty">No comments yet. Be the first to share your thoughts.</li>';
    return;
  }

  comments.forEach((comment) => {
    const li = document.createElement('li');
    li.className = 'comment-item';
    li.innerHTML = `
      <div class="comment-meta">
        <strong>${comment.name}</strong>
        <span>${comment.date}</span>
      </div>
      <p>${comment.message}</p>
    `;
    commentList.appendChild(li);
  });
}

function handleCommentSubmit(event, slug) {
  event.preventDefault();
  const name = commentName.value.trim();
  const message = commentMessageInput.value.trim();
  if (!name || !message) {
    return;
  }

  const comments = getComments(slug);
  comments.unshift({
    name,
    message,
    date: new Date().toLocaleString(),
  });
  saveComments(slug, comments);
  commentForm.reset();
  renderComments(slug);
}

function copyLink() {
  const link = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link).then(() => {
      shareMessage.textContent = 'Link copied to clipboard.';
      setTimeout(() => {
        shareMessage.textContent = '';
      }, 2000);
    });
  } else {
    shareMessage.textContent = 'Copy this URL manually: ' + link;
  }
}

function renderArticle(article) {
  const titleEl = document.getElementById('article-title');
  const articleDate = document.getElementById('article-date');
  const articleCategory = document.getElementById('article-category');
  const articleTags = document.getElementById('article-tags');
  const contentEl = document.getElementById('article-content');

  titleEl.textContent = article.title;
  articleCategory.textContent = article.category || 'Feature';
  articleDate.textContent = formatMeta(article);
  articleTags.innerHTML = renderTags(article.tags);
  contentEl.innerHTML = article.content || '<p>No content available.</p>';

  if (article.image && articleImage) {
    articleImage.classList.remove('hidden');
    articleImage.style.backgroundImage = `url('${article.image}')`;
  }
}

function showNotFound() {
  const titleEl = document.getElementById('article-title');
  const contentEl = document.getElementById('article-content');
  titleEl.textContent = 'Article not found';
  contentEl.innerHTML = '<p>Check the URL slug or add the article to <code>articles.js</code>.</p>';
  if (articleImage) {
    articleImage.classList.add('hidden');
  }
}

const slug = getQueryParam('slug');
const article = Array.isArray(articles) ? articles.find((item) => item.slug === slug) : null;

if (article) {
  renderArticle(article);
  renderRelated(article);
  renderComments(article.slug);
  if (commentForm) {
    commentForm.addEventListener('submit', (event) => handleCommentSubmit(event, article.slug));
  }
  if (shareButton) {
    shareButton.addEventListener('click', copyLink);
  }
} else {
  showNotFound();
}

updateDarkModeButton();
if (darkModeButton) {
  darkModeButton.addEventListener('click', toggleDarkMode);
}
