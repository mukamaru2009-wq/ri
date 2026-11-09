/* ==========================================================================
   イヤホン診断 - 質問データ & スコアリングロジック
   各質問は scoreFn(product, answerValue) を持ち、回答が製品にどれだけ
   マッチするかを点数化する。product は data/products.json の1レコード。
   ========================================================================== */

const TIER_ORDER = ["low", "mid", "high", "premium"];

const FIT_COMPAT = {
  canal: { canal: 4, open: -4, "bone-conduction": -4 },
  open: { canal: -4, open: 4, "bone-conduction": 2 },
  "bone-conduction": { canal: -4, open: 2, "bone-conduction": 4 }
};

const QUESTIONS = [
  {
    id: "usecase",
    text: "主にどんなシーンでイヤホンを使いたいですか?",
    choices: [
      { value: "commute", label: "通勤・通学中の音楽や通話" },
      { value: "sports", label: "運動・スポーツをしながら" },
      { value: "work", label: "仕事のWeb会議・通話が中心" },
      { value: "media", label: "映画・ゲームなどの没入体験" },
      { value: "audiophile", label: "とにかく音質を追求したい" }
    ],
    scoreFn(product, value) {
      let score = product.use_case_tags.includes(value) ? 3 : 0;
      if (value === "sports" && product.features.water_resistant) score += 2;
      if (value === "audiophile" && product.features.hi_res_audio) score += 2;
      return score;
    }
  },
  {
    id: "budget",
    text: "予算はどれくらいですか?",
    choices: [
      { value: "low", label: "〜8,000円" },
      { value: "mid", label: "8,000〜15,000円" },
      { value: "high", label: "15,000〜25,000円" },
      { value: "premium", label: "25,000円以上" }
    ],
    scoreFn(product, value) {
      const diff = Math.abs(
        TIER_ORDER.indexOf(product.price_tier) - TIER_ORDER.indexOf(value)
      );
      const table = [4, 0, -3, -6];
      return table[diff];
    }
  },
  {
    id: "anc",
    text: "ノイズキャンセリング(周囲の騒音を消す機能)はどれくらい重視しますか?",
    choices: [
      { value: "must", label: "必須。とにかく静かな環境が欲しい" },
      { value: "nice", label: "あれば嬉しいが必須ではない" },
      { value: "no", label: "不要。周囲の音を聞きながら使いたい" }
    ],
    scoreFn(product, value) {
      const table = {
        must: { none: -4, basic: 0, strong: 3, top: 4 },
        nice: { none: 0, basic: 2, strong: 2, top: 1 },
        no: { none: 4, basic: 1, strong: -1, top: -2 }
      };
      return table[value][product.features.anc_level];
    }
  },
  {
    id: "fit",
    text: "装着スタイルはどちらが好みですか?",
    choices: [
      { value: "canal", label: "耳栓のようにしっかり密閉するカナル型" },
      { value: "open", label: "耳を塞がないイヤホン型(オープンイヤー)" },
      { value: "bone-conduction", label: "耳を塞がない骨伝導タイプ" }
    ],
    scoreFn(product, value) {
      return FIT_COMPAT[value][product.fit_type];
    }
  },
  {
    id: "comfort",
    text: "装着感で一番重視したいことは?",
    choices: [
      { value: "longwear", label: "長時間つけていても疲れにくいこと" },
      { value: "sports", label: "運動しても外れない安定感" },
      { value: "compact", label: "とにかく軽くて小さいこと" }
    ],
    scoreFn(product, value) {
      return product.comfort_tags.includes(value) ? 3 : 0;
    }
  },
  {
    id: "os",
    text: "主に使うデバイスは?",
    choices: [
      { value: "ios", label: "iPhone / Mac が中心" },
      { value: "android", label: "Android / Windows が中心" },
      { value: "both", label: "どちらもよく使う" }
    ],
    scoreFn(product, value) {
      const table = {
        "ios-only": { ios: 2, android: -3, both: -2 },
        universal: { ios: 2, android: 2, both: 3 }
      };
      let score = table[product.os_compatibility][value];
      if (value === "both" && product.features.multipoint) score += 2;
      return score;
    }
  },
  {
    id: "call",
    text: "通話・オンライン会議での利用頻度は?",
    choices: [
      { value: "important", label: "よく使う。通話品質を重視したい" },
      { value: "notmuch", label: "あまり使わない" }
    ],
    scoreFn(product, value) {
      if (value === "important") {
        return product.call_quality === "good" ? 2 : -1;
      }
      return 0;
    }
  }
];
