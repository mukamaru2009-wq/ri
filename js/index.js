/* ==========================================================================
   イヤホン診断 - index.html(トップページ)の抜粋表示ロジック
   ランキングTOP3・特集記事最新3本を、それぞれのページと同じ描画ロジックを
   再利用して表示する。
   ========================================================================== */

(function () {
  async function renderRankingPreview() {
    const container = document.getElementById("homeRankingList");
    if (!container) return;

    let products;
    try {
      products = await loadProducts();
    } catch (e) {
      document.getElementById("rankingPreviewSection").hidden = true;
      return;
    }

    const top3 = products
      .slice()
      .sort((a, b) => overallScore(b) - overallScore(a))
      .slice(0, 3);

    container.innerHTML = buildRankingListHtml(top3, (p) => p.tagline);
  }

  async function renderArticlesPreview() {
    const container = document.getElementById("homeArticleList");
    if (!container) return;

    let articles;
    try {
      articles = await loadArticles();
    } catch (e) {
      document.getElementById("articlesPreviewSection").hidden = true;
      return;
    }

    const latest3 = sortArticlesByDateDesc(articles).slice(0, 3);
    container.innerHTML = latest3.map(buildArticleCardHtml).join("");
  }

  renderRankingPreview();
  renderArticlesPreview();
})();
