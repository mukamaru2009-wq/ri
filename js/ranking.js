/* ==========================================================================
   イヤホン診断 - ranking.html の集計ロジック
   スコアリング関数(overallScore/valueScore)と行の描画は
   js/ranking-scores.js に共通化されている(トップページの抜粋表示と共有)。
   ========================================================================== */

(function () {
  const TABS = ["overall", "price", "usecase", "anc", "battery", "value"];

  function reasonForOverall(p) {
    return p.tagline;
  }

  function reasonForUseCase(p) {
    return p.recommended_for;
  }

  function reasonForAnc(p) {
    return `ANC: ${getAncLabel(p.features.anc_level)} / ${p.tagline}`;
  }

  function reasonForBattery(p) {
    return `バッテリー合計 ${batteryTotal(p)}時間 / ${p.tagline}`;
  }

  function reasonForValue(p) {
    return `${p.price_label}でこの実力 / ${p.tagline}`;
  }

  function renderOverall(products) {
    const ranked = products
      .slice()
      .sort((a, b) => overallScore(b) - overallScore(a))
      .slice(0, 10);
    document.getElementById("overallList").innerHTML = buildRankingListHtml(ranked, reasonForOverall);
  }

  function renderPrice(products) {
    const buckets = [
      { label: "1万円以下", filter: (p) => p.price_yen <= 10000 },
      { label: "1〜2万円", filter: (p) => p.price_yen > 10000 && p.price_yen <= 20000 },
      { label: "2万円以上", filter: (p) => p.price_yen > 20000 }
    ];

    document.getElementById("priceGroups").innerHTML = buckets
      .map((b) => {
        const ranked = products
          .filter(b.filter)
          .sort((a, c) => overallScore(c) - overallScore(a))
          .slice(0, 5);
        return `<div class="ranking-subgroup"><h3>${b.label}</h3>${buildRankingListHtml(ranked, reasonForOverall)}</div>`;
      })
      .join("");
  }

  const MIC_QUALITY_ORDER = { basic: 0, good: 1, excellent: 2 };

  function renderUseCase(products) {
    const groups = [
      { label: "通勤・通学", filter: (p) => p.use_case_tags.includes("commute"), sort: (a, b) => overallScore(b) - overallScore(a) },
      { label: "スポーツ", filter: (p) => p.use_case_tags.includes("sports"), sort: (a, b) => overallScore(b) - overallScore(a) },
      { label: "仕事・Web会議", filter: (p) => p.use_case_tags.includes("work"), sort: (a, b) => overallScore(b) - overallScore(a) },
      { label: "ハイレゾ音源鑑賞", filter: (p) => p.features.hi_res_audio, sort: (a, b) => overallScore(b) - overallScore(a) },
      { label: "ゲーム・映画などの没入体験", filter: (p) => p.use_case_tags.includes("media"), sort: (a, b) => overallScore(b) - overallScore(a) },
      {
        label: "ゲーミング",
        filter: (p) => p.persona_tags.includes("gaming"),
        sort: (a, b) => Number(b.low_latency_mode) - Number(a.low_latency_mode) || overallScore(b) - overallScore(a)
      },
      {
        label: "マイク・通話品質",
        filter: (p) => p.persona_tags.includes("mic_quality"),
        sort: (a, b) => MIC_QUALITY_ORDER[b.mic_quality] - MIC_QUALITY_ORDER[a.mic_quality] || overallScore(b) - overallScore(a)
      }
    ];

    document.getElementById("usecaseGroups").innerHTML = groups
      .map((g) => {
        const ranked = products.filter(g.filter).sort(g.sort).slice(0, 5);
        return `<div class="ranking-subgroup"><h3>${g.label}</h3>${buildRankingListHtml(ranked, reasonForUseCase)}</div>`;
      })
      .join("");
  }

  function renderAnc(products) {
    const ranked = products
      .filter((p) => p.features.anc_level !== "none")
      .sort((a, b) => {
        const diff = getAncLevelValue(b.features.anc_level) - getAncLevelValue(a.features.anc_level);
        return diff !== 0 ? diff : overallScore(b) - overallScore(a);
      })
      .slice(0, 10);
    document.getElementById("ancList").innerHTML = buildRankingListHtml(ranked, reasonForAnc);
  }

  function renderBattery(products) {
    const ranked = products
      .slice()
      .sort((a, b) => batteryTotal(b) - batteryTotal(a))
      .slice(0, 10);
    document.getElementById("batteryList").innerHTML = buildRankingListHtml(ranked, reasonForBattery);
  }

  function renderValue(products) {
    const ranked = products
      .slice()
      .sort((a, b) => valueScore(b) - valueScore(a))
      .slice(0, 10);
    document.getElementById("valueList").innerHTML = buildRankingListHtml(ranked, reasonForValue);
  }

  function setupTabs() {
    const tabLinks = document.querySelectorAll(".ranking-tab");
    const sections = document.querySelectorAll(".ranking-section");

    function activate(tabId) {
      tabLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.tab === tabId));
      sections.forEach((section) => section.classList.toggle("is-active", section.id === tabId));
    }

    tabLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const tabId = link.dataset.tab;
        history.replaceState(null, "", `#${tabId}`);
        activate(tabId);
      });
    });

    const initial = window.location.hash.replace("#", "");
    activate(TABS.includes(initial) ? initial : "overall");
  }

  async function init() {
    setupTabs();

    let products;
    try {
      products = await loadProducts();
    } catch (e) {
      document.getElementById("rankingTabs").hidden = true;
      document.getElementById("rankingError").hidden = false;
      return;
    }

    renderOverall(products);
    renderPrice(products);
    renderUseCase(products);
    renderAnc(products);
    renderBattery(products);
    renderValue(products);
  }

  init();
})();
