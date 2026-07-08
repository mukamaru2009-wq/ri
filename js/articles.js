/* ==========================================================================
   イヤホン診断 - 記事データ読み込み(共通)
   実データは data/articles.json に分離されている(HTMLに直書きしない)。
   ========================================================================== */

const ARTICLES_DATA_URL = "data/articles.json";

let _articlesPromise = null;

function loadArticles() {
  if (!_articlesPromise) {
    _articlesPromise = fetch(ARTICLES_DATA_URL).then((res) => {
      if (!res.ok) {
        throw new Error(`記事データの読み込みに失敗しました(status: ${res.status})`);
      }
      return res.json();
    });
  }
  return _articlesPromise;
}

async function getArticleById(id) {
  const articles = await loadArticles();
  return articles.find((a) => a.id === id) || null;
}

function sortArticlesByDateDesc(articles) {
  return articles.slice().sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
}

function formatArticleDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function buildArticleCardHtml(a) {
  return `
    <a class="article-card" href="article.html?id=${encodeURIComponent(a.id)}">
      <div class="article-card-icon article-theme-${a.themeColor}">${a.icon}</div>
      <p class="article-card-category">${a.category}</p>
      <h3 class="article-card-title">${a.title}</h3>
      <p class="article-card-excerpt">${a.excerpt}</p>
      <p class="article-card-date">${formatArticleDate(a.publishedDate)}</p>
    </a>`;
}
