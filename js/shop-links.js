/* ==========================================================================
   イヤホン診断 - 購入先検索リンク(共通部品)
   Amazon.co.jp / 楽天市場の検索結果ページへのリンクを生成する。
   アフィリエイトタグは付与しない(情報提供のみ、外部検索への案内に限定する方針)。
   ========================================================================== */

function getShopLinks(product) {
  const query = encodeURIComponent(`${product.brand} ${product.name}`);
  return {
    amazon: `https://www.amazon.co.jp/s?k=${query}`,
    rakuten: `https://search.rakuten.co.jp/search/mall/${query}/`
  };
}

function buildShopLinksHtml(product, extraClass) {
  const links = getShopLinks(product);
  const cls = extraClass ? ` ${extraClass}` : "";
  return `
    <div class="shop-links${cls}">
      <a class="shop-link shop-link-amazon" href="${links.amazon}" target="_blank" rel="noopener noreferrer" title="Amazon.co.jpの検索結果ページを開きます(外部サイト)">Amazonで探す</a>
      <a class="shop-link shop-link-rakuten" href="${links.rakuten}" target="_blank" rel="noopener noreferrer" title="楽天市場の検索結果ページを開きます(外部サイト)">楽天で探す</a>
    </div>`;
}
