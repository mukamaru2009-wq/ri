/* ==========================================================================
   イヤホン診断 - result.html の集計・表示ロジック
   ========================================================================== */

(function () {
  const resultList = document.getElementById("resultList");
  const retryBtn = document.getElementById("retryBtn");

  function getAnswers() {
    const raw = sessionStorage.getItem("quizAnswers");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.some((a) => !a)) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function renderState(message) {
    resultList.innerHTML = `<p class="state-message">${message}</p>`;
  }

  function buildCard(product, index) {
    const card = document.createElement("article");
    card.className = "result-card" + (index === 0 ? " is-top" : "");

    const badge = document.createElement("span");
    badge.className = "result-badge";
    badge.textContent = index === 0 ? "一番のおすすめ" : "こちらもおすすめ";

    const icon = document.createElement("div");
    icon.className = "result-icon";
    icon.innerHTML = getFitIcon(product.fit_type);

    const body = document.createElement("div");
    body.className = "result-body";

    const brand = document.createElement("p");
    brand.className = "result-brand";
    brand.textContent = product.brand;

    const name = document.createElement("h2");
    const nameLink = document.createElement("a");
    nameLink.href = `product.html?id=${encodeURIComponent(product.id)}`;
    nameLink.className = "result-name-link";
    nameLink.textContent = product.name;
    name.appendChild(nameLink);

    const tagline = document.createElement("p");
    tagline.className = "result-tagline";
    tagline.textContent = product.tagline;

    const price = document.createElement("span");
    price.className = "result-price";
    price.textContent = `参考価格: ${product.price_label}`;

    const features = document.createElement("ul");
    features.className = "result-features";
    product.pros.slice(0, 3).forEach((f) => {
      const li = document.createElement("li");
      li.textContent = f;
      features.appendChild(li);
    });

    const recommend = document.createElement("p");
    recommend.className = "result-recommend";
    recommend.innerHTML = `<strong>こんな人におすすめ:</strong> ${product.recommended_for}`;

    const detailLink = document.createElement("a");
    detailLink.className = "result-detail-link";
    detailLink.href = `product.html?id=${encodeURIComponent(product.id)}`;
    detailLink.textContent = "詳しく見る →";

    body.appendChild(brand);
    body.appendChild(name);
    body.appendChild(tagline);
    body.appendChild(price);
    body.appendChild(features);
    body.appendChild(recommend);
    body.appendChild(detailLink);

    card.appendChild(badge);
    card.appendChild(icon);
    card.appendChild(body);
    return card;
  }

  async function renderResults(answers) {
    renderState("診断結果を計算しています…");

    let matches;
    try {
      matches = await getTopMatches(answers, QUESTIONS, 3);
    } catch (e) {
      renderState(
        "製品データの読み込みに失敗しました。file:// で直接開いていませんか?" +
          "<br>このサイトは <code>npx serve</code> や <code>python -m http.server</code> などの" +
          "ローカルサーバー経由でアクセスしてください。"
      );
      return;
    }

    resultList.innerHTML = "";
    matches.forEach((match, index) => {
      resultList.appendChild(buildCard(match.product, index));
    });
  }

  const answers = getAnswers();
  if (!answers) {
    window.location.href = "quiz.html";
    return;
  }

  renderResults(answers);

  retryBtn.addEventListener("click", () => {
    sessionStorage.removeItem("quizAnswers");
    window.location.href = "quiz.html";
  });
})();
