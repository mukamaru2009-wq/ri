/* ==========================================================================
   イヤホン診断 - 購入先リンク(共通部品)
   製品の公式サイト(メーカー公式の製品ページ、見つからない場合はブランド公式トップ)
   と、楽天市場の検索結果ページへのリンクを生成する。
   アフィリエイトタグは付与しない(情報提供のみ、外部サイトへの案内に限定する方針)。
   ========================================================================== */

function getShopLinks(product) {
  const query = encodeURIComponent(`${product.brand} ${product.name}`);
  return {
    official: product.official_url || null,
    rakuten: `https://search.rakuten.co.jp/search/mall/${query}/`
  };
}

function buildShopLinksHtml(product, extraClass) {
  const links = getShopLinks(product);
  const cls = extraClass ? ` ${extraClass}` : "";
  const officialLink = links.official
    ? `<a class="shop-link shop-link-official" href="${links.official}" target="_blank" rel="noopener noreferrer" title="メーカー公式サイトを開きます(外部サイト)">公式サイトで見る</a>`
    : "";
  return `
    <div class="shop-links${cls}">
      ${officialLink}
      <a class="shop-link shop-link-rakuten" href="${links.rakuten}" target="_blank" rel="noopener noreferrer" title="楽天市場の検索結果ページを開きます(外部サイト)">楽天で探す</a>
    </div>`;
}
