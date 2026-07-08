/* ==========================================================================
   イヤホン診断 - compare.html(製品比較ページ)の表示ロジック
   URLパラメータ ?ids=id1,id2,id3 (最大4件)で比較対象を指定する。
   ========================================================================== */

(function () {
  // 比較表の行定義。numeric/best を持つ行は、比較対象の中で最も優れた
  // セルに "is-best" クラスを付けてハイライトする。
  const ROWS = [
    { label: "メーカー", get: (p) => p.brand },
    { label: "価格", get: (p) => p.price_label, numeric: (p) => p.price_yen, best: "min" },
    { label: "カテゴリ", get: (p) => p.category },
    { label: "装着タイプ", get: (p) => getFitLabel(p.fit_type) },
    {
      label: "ノイズキャンセリング",
      get: (p) => (p.features.noise_canceling ? `対応(${getAncLabel(p.features.anc_level)})` : "非対応"),
      numeric: (p) => getAncLevelValue(p.features.anc_level),
      best: "max"
    },
    { label: "防水性能", get: (p) => p.features.water_resistant || "非対応" },
    { label: "バッテリー(単体)", get: (p) => `${p.features.battery_hours}時間`, numeric: (p) => p.features.battery_hours, best: "max" },
    {
      label: "バッテリー(ケース込み)",
      get: (p) => (p.features.battery_hours_with_case ? `${p.features.battery_hours_with_case}時間` : "ケース充電なし"),
      numeric: (p) => p.features.battery_hours_with_case || 0,
      best: "max"
    },
    { label: "ワイヤレス充電", get: (p) => (p.features.wireless_charging ? "対応" : "非対応"), numeric: (p) => (p.features.wireless_charging ? 1 : 0), best: "max" },
    { label: "マルチポイント接続", get: (p) => (p.features.multipoint ? "対応" : "非対応"), numeric: (p) => (p.features.multipoint ? 1 : 0), best: "max" },
    { label: "ハイレゾ相当の音質", get: (p) => (p.features.hi_res_audio ? "対応" : "非対応"), numeric: (p) => (p.features.hi_res_audio ? 1 : 0), best: "max" },
    { label: "対応コーデック", get: (p) => p.features.codec.join(" / ") },
    { label: "発売年", get: (p) => `${p.release_year}年` }
  ];

  function getIdsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("ids");
    return raw ? raw.split(",").filter(Boolean).slice(0, window.CompareTray.MAX) : [];
  }

  function showEmpty(message) {
    document.getElementById("compareContent").hidden = true;
    const emptyState = document.getElementById("compareEmptyState");
    emptyState.hidden = false;
    if (message) {
      emptyState.querySelector(".state-message").innerHTML = message;
    }
  }

  function buildTable(products) {
    const theadHtml = `
      <thead>
        <tr>
          <th class="compare-row-label">&nbsp;</th>
          ${products
            .map(
              (p) => `
            <th>
              <div class="compare-head-icon">${getFitIcon(p.fit_type)}</div>
              <p class="compare-head-brand">${p.brand}</p>
              <p class="compare-head-name"><a href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a></p>
            </th>`
            )
            .join("")}
        </tr>
      </thead>`;

    const bodyRows = ROWS.map((row) => {
      let bestValue = null;
      if (row.best) {
        const values = products.map((p) => row.numeric(p));
        bestValue = row.best === "max" ? Math.max(...values) : Math.min(...values);
      }
      const cells = products
        .map((p) => {
          const isBest = row.best && row.numeric(p) === bestValue;
          return `<td class="${isBest ? "is-best" : ""}">${row.get(p)}</td>`;
        })
        .join("");
      return `<tr><th class="compare-row-label">${row.label}</th>${cells}</tr>`;
    }).join("");

    const footRow = `
      <tr>
        <th class="compare-row-label">&nbsp;</th>
        ${products
          .map(
            (p) => `<td><a class="btn btn-ghost compare-detail-link" href="product.html?id=${encodeURIComponent(p.id)}">詳しく見る →</a></td>`
          )
          .join("")}
      </tr>`;

    document.getElementById("compareTable").innerHTML = `${theadHtml}<tbody>${bodyRows}${footRow}</tbody>`;
  }

  async function init() {
    const ids = getIdsFromUrl();
    if (ids.length < 2) {
      showEmpty();
      return;
    }

    let allProducts;
    try {
      allProducts = await loadProducts();
    } catch (e) {
      showEmpty(
        "製品データの読み込みに失敗しました。file:// で直接開いていませんか?" +
          "<br>このサイトは <code>npx serve</code> や <code>python -m http.server</code> などの" +
          "ローカルサーバー経由でアクセスしてください。"
      );
      return;
    }

    const products = ids.map((id) => allProducts.find((p) => p.id === id)).filter(Boolean);

    if (products.length < 2) {
      showEmpty();
      return;
    }

    document.title = `比較: ${products.map((p) => p.name).join(" / ")} | イヤホン診断`;
    buildTable(products);

    // 比較ページで表示している内容とトレイの状態を一致させる
    window.CompareTray.setIds(products.map((p) => p.id));
  }

  init();
})();
