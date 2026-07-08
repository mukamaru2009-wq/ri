/* ==========================================================================
   イヤホン診断 - articles.html(特集記事一覧)の表示ロジック
   カードの描画は js/articles.js の buildArticleCardHtml を共通利用する
   (トップページの記事抜粋表示と共有)。
   ========================================================================== */

(function () {
  async function init() {
    let articles;
    try {
      articles = await loadArticles();
    } catch (e) {
      document.getElementById("articleGrid").innerHTML = "";
      document.getElementById("articlesError").hidden = false;
      return;
    }

    const sorted = sortArticlesByDateDesc(articles);
    document.getElementById("articleGrid").innerHTML = sorted.map(buildArticleCardHtml).join("");
  }

  init();
})();
