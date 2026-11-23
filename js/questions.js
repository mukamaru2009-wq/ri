/* ==========================================================================
   イヤホン診断 - 質問データ & スコアリングロジック
   各質問は scoreFn(product, answerValue) を持ち、回答が製品にどれだけ
   マッチするかを点数化する。product は data/products.json の1レコード。
   想定外の回答値(古いセッションに残った回答など)は 0 点として扱う。
   ========================================================================== */

const ANC_POINTS = { none: 0, basic: 1, strong: 2, top: 3 };

const BUDGET_RANGES = {
  under10k: [0, 10000],
  under20k: [10000, 20000],
  under30k: [20000, 30000],
  over30k: [30000, Infinity]
};
const BUDGET_ORDER = ["under10k", "under20k", "under30k", "over30k"];

function budgetBracket(priceYen) {
  return BUDGET_ORDER.findIndex((key) => {
    const [min, max] = BUDGET_RANGES[key];
    return priceYen >= min && priceYen < max;
  });
}

const QUESTIONS = [
  {
    id: "scene",
    text: "いちばん使うのはどんなとき?",
    choices: [
      { value: "commute", label: "通勤・通学" },
      { value: "sports", label: "運動・ランニング" },
      { value: "work", label: "仕事・Web会議" },
      { value: "game", label: "ゲーム・動画" }
    ],
    scoreFn(product, value) {
      const f = product.features;
      if (value === "commute") {
        return (product.use_case_tags.includes("commute") ? 3 : 0) + (ANC_POINTS[f.anc_level] >= 2 ? 1 : 0);
      }
      if (value === "sports") {
        return (product.use_case_tags.includes("sports") ? 3 : 0) + (f.water_resistant ? 2 : -2);
      }
      if (value === "work") {
        return (product.use_case_tags.includes("work") ? 3 : 0) + (f.multipoint ? 1 : 0);
      }
      if (value === "game") {
        return (product.low_latency_mode ? 3 : 0) + (product.persona_tags.includes("gaming") ? 2 : 0) + (product.use_case_tags.includes("media") ? 1 : 0);
      }
      return 0;
    }
  },
  {
    id: "budget",
    text: "予算はいくらくらい?",
    choices: [
      { value: "under10k", label: "1万円まで" },
      { value: "under20k", label: "1〜2万円" },
      { value: "under30k", label: "2〜3万円" },
      { value: "over30k", label: "3万円以上でもOK" }
    ],
    scoreFn(product, value) {
      const wanted = BUDGET_ORDER.indexOf(value);
      if (wanted === -1) return 0;
      const diff = budgetBracket(product.price_yen) - wanted;
      if (diff === 0) return 4;
      if (diff === -1) return 1;
      if (diff === 1) return -3;
      return diff < 0 ? -1 : -6;
    }
  },
  {
    id: "noise",
    text: "まわりの音はどうしたい?",
    choices: [
      { value: "cut", label: "しっかり消したい" },
      { value: "either", label: "どちらでもいい" },
      { value: "hear", label: "聞こえていてほしい" }
    ],
    scoreFn(product, value) {
      const anc = ANC_POINTS[product.features.anc_level];
      if (value === "cut") return [-4, 0, 3, 4][anc];
      if (value === "hear") return product.fit_type === "canal" ? -1 : 3;
      return 0;
    }
  },
  {
    id: "fit",
    text: "イヤホンの形はどれがいい?",
    choices: [
      { value: "canal", label: "カナル型(耳の穴に入れる)" },
      { value: "open", label: "オープン型(耳の穴をふさがない)" },
      { value: "bone-conduction", label: "骨伝導(耳の外から骨で聞く)" },
      { value: "any", label: "こだわらない" }
    ],
    scoreFn(product, value) {
      if (!["canal", "open", "bone-conduction"].includes(value)) return 0;
      // 形の希望ははっきりしているので、他の質問より強く効かせる
      if (product.fit_type === value) return 8;
      // オープン型と骨伝導はどちらも耳をふさがないので近い扱い
      const earFree = (t) => t === "open" || t === "bone-conduction";
      if (earFree(product.fit_type) && earFree(value)) return 3;
      return -8;
    }
  },
  {
    id: "call",
    text: "電話やWeb会議でも使う?",
    choices: [
      { value: "often", label: "よく使う" },
      { value: "rarely", label: "あまり使わない" }
    ],
    scoreFn(product, value) {
      if (value !== "often") return 0;
      let score = product.call_quality === "good" ? 2 : -1;
      if (product.mic_quality === "excellent") score += 2;
      return score;
    }
  },
  {
    id: "battery",
    text: "充電はどれくらい持ってほしい?",
    choices: [
      { value: "long", label: "1日中つけていたい" },
      { value: "normal", label: "ふつうでいい" }
    ],
    scoreFn(product, value) {
      if (value !== "long") return 0;
      const hours = product.features.battery_hours;
      if (hours >= 8) return 3;
      if (hours >= 7) return 1;
      return -2;
    }
  }
];
