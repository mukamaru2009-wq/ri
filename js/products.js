/* ==========================================================================
   イヤホン診断 - 製品データ読み込み & スコアリング
   実データは data/products.json に分離されている(HTMLに直書きしない)。
   file:// で直接開くとブラウザのセキュリティ制限でfetchが失敗するため、
   ローカルサーバー経由(例: npx serve, python -m http.server)でのアクセスが必要。
   ========================================================================== */

const PRODUCTS_DATA_URL = "data/products.json";

let _productsPromise = null;

function loadProducts() {
  if (!_productsPromise) {
    _productsPromise = fetch(PRODUCTS_DATA_URL).then((res) => {
      if (!res.ok) {
        throw new Error(`製品データの読み込みに失敗しました(status: ${res.status})`);
      }
      return res.json();
    });
  }
  return _productsPromise;
}

function scoreProduct(product, answers, questions) {
  let score = 0;
  questions.forEach((q, i) => {
    const answer = answers[i];
    if (!answer) return;
    score += q.scoreFn(product, answer);
  });
  return score;
}

/**
 * 全製品のスコアを計算し、上位1〜3件を返す。
 * トップスコアとの差が僅差(4点以内)の製品も一緒に提示する。
 */
async function getTopMatches(answers, questions, max = 3) {
  const products = await loadProducts();

  const scored = products.map((product) => ({
    product,
    score: scoreProduct(product, answers, questions)
  }));

  scored.sort((a, b) => b.score - a.score);

  const topScore = scored[0].score;
  let results = scored.filter((s) => s.score >= topScore - 4).slice(0, max);
  if (results.length === 0) results = [scored[0]];
  return results;
}

async function getProductById(id) {
  const products = await loadProducts();
  return products.find((p) => p.id === id) || null;
}
