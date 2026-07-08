/* ==========================================================================
   イヤホン診断 - product.html(個別詳細ページ)の表示ロジック
   URLパラメータ ?id=<product-id> で対象製品を切り替える単一テンプレート。
   ========================================================================== */

(function () {
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function ancLevelLabel(level) {
    return getAncLabel(level);
  }

  function renderBackLink() {
    const backLink = document.getElementById("backLink");
    const savedListQuery = sessionStorage.getItem("productsListQuery");
    if (sessionStorage.getItem("quizAnswers")) {
      backLink.textContent = "← 診断結果に戻る";
      backLink.href = "result.html";
    } else if (savedListQuery) {
      backLink.textContent = "← 製品一覧に戻る";
      backLink.href = `products.html${savedListQuery}`;
    } else {
      backLink.textContent = "← 製品一覧に戻る";
      backLink.href = "products.html";
    }
  }

  function buildQuickSpecHtml(product) {
    const f = product.features;
    const items = [
      { icon: "anc", label: f.noise_canceling ? `ANC: ${ancLevelLabel(f.anc_level)}` : "ANC非搭載" },
      { icon: "water", label: f.water_resistant ? `防水: ${f.water_resistant}` : "防水非対応" },
      {
        icon: "battery",
        label: `バッテリー: ${f.battery_hours}時間${
          f.battery_hours_with_case ? `(ケース込み${f.battery_hours_with_case}時間)` : ""
        }`
      }
    ];
    return items
      .map((i) => `<span class="quick-spec">${getFeatureIcon(i.icon)}<span>${i.label}</span></span>`)
      .join("");
  }

  function updateCompareButtonState(btn) {
    if (!btn) return;
    const id = btn.dataset.id;
    const selected = window.CompareTray.isSelected(id);
    const ids = window.CompareTray.getIds();
    btn.textContent = selected ? "✓ 比較に追加済み" : "+ 比較に追加";
    btn.classList.toggle("is-selected", selected);
    btn.disabled = !selected && ids.length >= window.CompareTray.MAX;
  }

  document.addEventListener("comparetray:change", () => {
    updateCompareButtonState(document.getElementById("compareAddBtn"));
  });

  function renderHero(product) {
    const hero = document.getElementById("productHero");
    hero.innerHTML = `
      <div class="product-hero-icon">${getFitIcon(product.fit_type)}</div>
      <div class="product-hero-meta">
        <p class="product-hero-brand">${product.brand} / ${product.release_year}年発売</p>
        <h1>${product.name}</h1>
        <p class="product-hero-tagline">${product.tagline}</p>
        <div class="product-hero-badges">
          <span class="badge badge-price">${product.price_label}</span>
          <span class="badge badge-category">${product.category}</span>
          <span class="badge badge-fit">${getFitLabel(product.fit_type)}</span>
        </div>
        <div class="product-quick-specs">${buildQuickSpecHtml(product)}</div>
        <button type="button" class="btn btn-ghost compare-add-btn" id="compareAddBtn" data-id="${product.id}">+ 比較に追加</button>
      </div>
    `;

    const compareBtn = document.getElementById("compareAddBtn");
    updateCompareButtonState(compareBtn);
    compareBtn.addEventListener("click", () => {
      if (window.CompareTray.isSelected(product.id)) {
        window.CompareTray.remove(product.id);
      } else {
        const ok = window.CompareTray.add(product.id);
        if (!ok) alert(`比較は最大${window.CompareTray.MAX}個までです。`);
      }
    });
  }

  function computeSimilarity(a, b) {
    const sharedUseCases = a.use_case_tags.filter((t) => b.use_case_tags.includes(t)).length;
    let score = sharedUseCases * 2;
    if (a.price_tier === b.price_tier) score += 2;
    if (a.fit_type === b.fit_type) score += 1;
    if (a.brand === b.brand) score += 1;
    return score;
  }

  async function renderSimilarProducts(product) {
    const container = document.getElementById("similarProducts");
    const section = document.getElementById("similar-section");
    if (!container) return;

    let allProducts;
    try {
      allProducts = await loadProducts();
    } catch (e) {
      if (section) section.hidden = true;
      return;
    }

    const candidates = allProducts
      .filter((p) => p.id !== product.id)
      .map((p) => ({ product: p, score: computeSimilarity(product, p) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (candidates.length === 0) {
      if (section) section.hidden = true;
      return;
    }

    container.innerHTML = candidates
      .map(
        ({ product: p }) => `
        <div class="similar-card">
          <div class="similar-card-icon">${getFitIcon(p.fit_type)}</div>
          <div class="similar-card-body">
            <p class="similar-card-brand">${p.brand}</p>
            <p class="similar-card-name"><a href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a></p>
            <p class="similar-card-price">${p.price_label}</p>
            <a class="similar-card-compare" href="compare.html?ids=${encodeURIComponent(product.id)},${encodeURIComponent(p.id)}">この2台を比較する →</a>
          </div>
        </div>`
      )
      .join("");
  }

  function renderSpecGrid(product) {
    const f = product.features;
    const rows = [
      { icon: "anc", label: "ノイズキャンセリング", value: f.noise_canceling ? `対応(${ancLevelLabel(f.anc_level)})` : "非対応" },
      { icon: "water", label: "防水性能", value: f.water_resistant || "非対応" },
      { icon: "battery", label: "バッテリー(単体)", value: `${f.battery_hours}時間` },
      {
        icon: "battery",
        label: "バッテリー(ケース込み)",
        value: f.battery_hours_with_case ? `${f.battery_hours_with_case}時間` : "ケース充電なし"
      },
      { icon: "charging", label: "ワイヤレス充電", value: f.wireless_charging ? "対応" : "非対応" },
      { icon: "multipoint", label: "マルチポイント接続", value: f.multipoint ? "対応" : "非対応" },
      { icon: "hires", label: "ハイレゾ相当の音質", value: f.hi_res_audio ? "対応" : "非対応" },
      { icon: "codec", label: "対応コーデック", value: f.codec.join(" / ") }
    ];

    document.getElementById("specGrid").innerHTML = rows
      .map(
        (r) => `
        <div class="spec-card">
          <div class="spec-icon">${getFeatureIcon(r.icon)}</div>
          <div class="spec-text">
            <p class="spec-label">${r.label}</p>
            <p class="spec-value">${r.value}</p>
          </div>
        </div>`
      )
      .join("");
  }

  function renderReview(product) {
    document.getElementById("reviewText").innerHTML = product.description.map((p) => `<p>${p}</p>`).join("");
  }

  function renderProsCons(product) {
    document.getElementById("prosList").innerHTML = product.pros.map((p) => `<li>${p}</li>`).join("");
    document.getElementById("consList").innerHTML = product.cons.map((c) => `<li>${c}</li>`).join("");
  }

  function renderRecommend(product) {
    document.getElementById("targetTags").innerHTML = product.target_users
      .map((t) => `<span class="tag-chip">${t}</span>`)
      .join("");
    document.getElementById("recommendText").textContent = product.recommended_for;
  }

  async function renderRelatedArticles(product) {
    const section = document.getElementById("related-articles-section");
    if (!section) return;

    let articles;
    try {
      articles = await loadArticles();
    } catch (e) {
      section.hidden = true;
      return;
    }

    const related = articles.filter((a) => a.relatedProducts && a.relatedProducts.includes(product.id)).slice(0, 3);

    if (related.length === 0) {
      section.hidden = true;
      return;
    }

    document.getElementById("relatedArticles").innerHTML = related
      .map(
        (a) => `
        <a class="article-card article-card-compact" href="article.html?id=${encodeURIComponent(a.id)}">
          <div class="article-card-icon article-theme-${a.themeColor}">${a.icon}</div>
          <p class="article-card-category">${a.category}</p>
          <h3 class="article-card-title">${a.title}</h3>
          <p class="article-card-excerpt">${a.excerpt}</p>
        </a>`
      )
      .join("");

    section.hidden = false;
  }

  function showError(message) {
    document.getElementById("productContent").hidden = true;
    const errorState = document.getElementById("errorState");
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

    let product;
    try {
      product = await getProductById(id);
    } catch (e) {
      showError(
        "製品データの読み込みに失敗しました。file:// で直接開いていませんか?" +
          "<br>このサイトは <code>npx serve</code> や <code>python -m http.server</code> などの" +
          "ローカルサーバー経由でアクセスしてください。"
      );
      return;
    }

    if (!product) {
      showError();
      return;
    }

    document.title = `${product.name} | イヤホン診断`;
    renderBackLink();
    renderHero(product);
    renderSpecGrid(product);
    renderReview(product);
    renderProsCons(product);
    renderRecommend(product);
    renderSimilarProducts(product);
    renderRelatedArticles(product);
  }

  init();
})();
