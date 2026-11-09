/* ==========================================================================
   イヤホン診断 - ランキングスコアリング共通ロジック
   ranking.html と index.html(トップページのランキング抜粋)の両方で使用する。
   すべてのランキングは手書きの順位ではなく、製品データの属性から
   スコアリング関数を通して自動的に算出する。

   [総合スコアの算出基準]
     総合スコア = ANCレベル(none=0 / basic=1 / strong=2 / top=3) × 3
                + 対応機能数(ワイヤレス充電・マルチポイント・ハイレゾ・防水)× 2
                + (バッテリー合計時間 ÷ 4)
                + (通話品質が良い場合 +2)

   [コスパスコアの算出基準]
     コスパスコア = 総合スコア ÷ (価格 ÷ 10,000円)
     → 「1万円あたりの総合スコア」。安くて機能が多いほど高スコアになる。
   ========================================================================== */

function batteryTotal(p) {
  return p.features.battery_hours_with_case || p.features.battery_hours;
}

function overallScore(p) {
  const f = p.features;
  const ancPart = getAncLevelValue(f.anc_level) * 3;
  const featureCount = [f.wireless_charging, f.multipoint, f.hi_res_audio, Boolean(f.water_resistant)].filter(
    Boolean
  ).length;
  const featurePart = featureCount * 2;
  const batteryPart = batteryTotal(p) / 4;
  const callPart = p.call_quality === "good" ? 2 : 0;
  return ancPart + featurePart + batteryPart + callPart;
}

function valueScore(p) {
  return overallScore(p) / (p.price_yen / 10000);
}

function buildRankingItemHtml(rank, p, reason) {
  const medalClass = rank <= 3 ? ` rank-${rank}` : "";
  return `
    <li class="ranking-item${medalClass}">
      <span class="rank-badge">${rank}</span>
      <div class="ranking-item-icon">${getFitIcon(p.fit_type)}</div>
      <div class="ranking-item-body">
        <p class="ranking-item-brand">${p.brand}</p>
        <p class="ranking-item-name"><a href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a></p>
        <p class="ranking-item-reason">${reason}</p>
        ${buildShopLinksHtml(p, "ranking-item-shop-links")}
      </div>
      <a class="btn btn-ghost ranking-item-link" href="product.html?id=${encodeURIComponent(p.id)}">詳しく見る</a>
    </li>`;
}

function buildRankingListHtml(products, reasonFn) {
  if (products.length === 0) {
    return `<p class="ranking-empty">該当する製品がありませんでした。</p>`;
  }
  return `<ol class="ranking-list">${products.map((p, i) => buildRankingItemHtml(i + 1, p, reasonFn(p))).join("")}</ol>`;
}
