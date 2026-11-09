/* ==========================================================================
   イヤホン診断 - 共通SVGアイコン
   装着タイプアイコンと、スペック用の小さな機能アイコンをまとめる。
   result.html / product.html / products.html から共通で利用する。
   ========================================================================== */

const FIT_ICONS = {
  canal: `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="27" cy="30" rx="15" ry="17" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2.5"/>
      <rect x="35" y="33" width="9" height="25" rx="4.5" fill="currentColor"/>
    </svg>`,
  open: `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="27" r="13" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2.5"/>
      <path d="M35 19 C50 19 52 41 41 50 C36 54 29 52 27 47" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    </svg>`,
  "bone-conduction": `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 48 C8 48 6 32 14 24 C20 18 28 20 28 27" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="23" r="6" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2.5"/>
      <path d="M43 15 L46 18 M46 15 L43 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M46 23 L52 23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M45 30 L50 32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`
};

function getFitIcon(fitType) {
  return FIT_ICONS[fitType] || FIT_ICONS.canal;
}

const FIT_LABELS = {
  canal: "カナル型",
  open: "オープン型",
  "bone-conduction": "骨伝導型"
};

function getFitLabel(fitType) {
  return FIT_LABELS[fitType] || fitType;
}

const FEATURE_ICONS = {
  anc: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 10v4h4l5 4V6L7 10H3z" fill="currentColor"/>
      <path d="M16 9a5 5 0 010 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M18.5 7a8.5 8.5 0 010 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.5"/>
    </svg>`,
  water: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C12 3 5 11 5 15.5A7 7 0 0019 15.5C19 11 12 3 12 3Z" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.15"/>
    </svg>`,
  battery: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="7" width="17" height="10" rx="2" stroke="currentColor" stroke-width="1.8"/>
      <rect x="20" y="10" width="2.5" height="4" rx="1" fill="currentColor"/>
      <rect x="4.5" y="9.5" width="10" height="5" rx="1" fill="currentColor" fill-opacity="0.6"/>
    </svg>`,
  charging: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor"/>
    </svg>`,
  multipoint: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="12" r="5" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.12"/>
      <circle cx="16" cy="12" r="5" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.12"/>
    </svg>`,
  hires: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 17V5l10-2v11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="7" cy="17" r="2.5" fill="currentColor"/>
      <circle cx="17" cy="15" r="2.5" fill="currentColor"/>
    </svg>`,
  codec: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.12"/>
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
};

function getFeatureIcon(name) {
  return FEATURE_ICONS[name] || "";
}

const ANC_LEVEL_LABELS = { none: "非搭載", basic: "ベーシック", strong: "しっかり搭載", top: "トップクラス" };
const ANC_LEVEL_ORDER = { none: 0, basic: 1, strong: 2, top: 3 };

function getAncLabel(level) {
  return ANC_LEVEL_LABELS[level] || level;
}

function getAncLevelValue(level) {
  return ANC_LEVEL_ORDER[level] !== undefined ? ANC_LEVEL_ORDER[level] : 0;
}
