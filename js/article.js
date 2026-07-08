/* ==========================================================================
   イヤホン診断 - article.html(記事詳細)の表示ロジック
   URLパラメータ ?id=<article-id> で対象記事を切り替える単一テンプレート。
   ========================================================================== */

(function () {
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function renderContentBlock(block) {
    if (block.type === "heading") return `<h2>${block.text}</h2>`;
    if (block.type === "paragraph") return `<p>${block.html}</p>`;
    if (block.type === "list") return `<ul>${block.items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
    return "";
  }

  async function renderRelatedProducts(article) {
    const wrap = document.getElementById("articleRelatedWrap");
    if (!article.relatedProducts || article.relatedProducts.length === 0) {
      wrap.hidden = true;
      return;
    }

    let allProducts;
    try {
      allProducts = await loadProducts();
    } catch (e) {
      wrap.hidden = true;
      return;
    }

    const products = article.relatedProducts.map((id) => allProducts.find((p) => p.id === id)).filter(Boolean);
    if (products.length === 0) {
      wrap.hidden = true;
      return;
    }

    document.getElementById("articleRelatedProducts").innerHTML = products
      .map(
        (p) => `
        <a class="similar-card" href="product.html?id=${encodeURIComponent(p.id)}">
          <div class="similar-card-icon">${getFitIcon(p.fit_type)}</div>
          <div class="similar-card-body">
            <p class="similar-card-brand">${p.brand}</p>
            <p class="similar-card-name">${p.name}</p>
            <p class="similar-card-price">${p.price_label}</p>
          </div>
        </a>`
      )
      .join("");
  }

  function showError(message) {
    document.getElementById("articleContent").hidden = true;
    const errorState = document.getElementById("articleErrorState");
    errorState.hidden = false;
    if (message) {
      errorState.querySelector(".state-message").innerHTML = message;
    }
  }

  async function init() {
    const id = getParam("id");
    if (!id) {
      showError();
      return;
    }

    let article;
    try {
      article = await getArticleById(id);
    } catch (e) {
      showError(
        "記事データの読み込みに失敗しました。file:// で直接開いていませんか?" +
          "<br>このサイトは <code>npx serve</code> や <code>python -m http.server</code> などの" +
          "ローカルサーバー経由でアクセスしてください。"
      );
      return;
    }

    if (!article) {
      showError();
      return;
    }

    document.title = `${article.title} | イヤホン診断`;

    const iconEl = document.getElementById("articleIcon");
    iconEl.textContent = article.icon;
    iconEl.className = `article-detail-icon article-theme-${article.themeColor}`;

    document.getElementById("articleCategory").textContent = article.category;
    document.getElementById("articleTitle").textContent = article.title;
    document.getElementById("articleDate").textContent = formatArticleDate(article.publishedDate);
    document.getElementById("articleBody").innerHTML = article.content.map(renderContentBlock).join("");

    renderRelatedProducts(article);
  }

  init();
})();
