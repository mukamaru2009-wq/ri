/* ==========================================================================
   イヤホン診断 - 比較トレイ(共通部品)
   選択中の製品IDを localStorage(キー: compareIds、最大4件)で管理し、
   products.html / product.html / compare.html すべてに同じトレイUIを表示する。
   他のスクリプトからは window.CompareTray の各関数を呼び出して連携する。
   ========================================================================== */

(function (global) {
  const STORAGE_KEY = "compareIds";
  const MAX_COMPARE = 4;

  function getIds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function setIds(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    renderTray();
    document.dispatchEvent(new CustomEvent("comparetray:change", { detail: { ids } }));
  }

  function isSelected(id) {
    return getIds().includes(id);
  }

  function add(id) {
    const ids = getIds();
    if (ids.includes(id)) return true;
    if (ids.length >= MAX_COMPARE) return false;
    ids.push(id);
    setIds(ids);
    return true;
  }

  function remove(id) {
    setIds(getIds().filter((x) => x !== id));
  }

  function clear() {
    setIds([]);
  }

  let trayEl = null;

  async function renderTray() {
    if (!trayEl) return;
    const ids = getIds();

    if (ids.length === 0) {
      trayEl.classList.remove("is-visible");
      trayEl.innerHTML = "";
      document.body.classList.remove("has-compare-tray");
      return;
    }

    trayEl.classList.add("is-visible");
    document.body.classList.add("has-compare-tray");

    let products = [];
    try {
      products = await loadProducts();
    } catch (e) {
      products = [];
    }

    const chips = ids
      .map((id) => {
        const p = products.find((pp) => pp.id === id);
        const label = p ? p.name : id;
        return `
          <span class="compare-chip">
            ${label}
            <button type="button" class="compare-chip-remove" data-id="${id}" aria-label="比較から外す">×</button>
          </span>`;
      })
      .join("");

    const canCompare = ids.length >= 2;

    trayEl.innerHTML = `
      <div class="compare-tray-inner">
        <div class="compare-tray-chips">${chips}</div>
        <div class="compare-tray-actions">
          <span class="compare-tray-count">${ids.length} / ${MAX_COMPARE}</span>
          <button type="button" class="btn btn-ghost compare-tray-clear-btn" id="compareTrayClear">クリア</button>
          <a class="btn btn-primary compare-tray-go-btn${canCompare ? "" : " is-disabled"}" id="compareTrayGo" href="compare.html?ids=${ids.join(",")}">比較する</a>
        </div>
      </div>`;

    trayEl.querySelectorAll(".compare-chip-remove").forEach((btn) => {
      btn.addEventListener("click", () => remove(btn.dataset.id));
    });

    document.getElementById("compareTrayClear").addEventListener("click", clear);

    if (!canCompare) {
      document.getElementById("compareTrayGo").addEventListener("click", (e) => e.preventDefault());
    }
  }

  function init() {
    trayEl = document.createElement("div");
    trayEl.className = "compare-tray";
    trayEl.id = "compareTray";
    document.body.appendChild(trayEl);
    renderTray();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.CompareTray = { add, remove, toggle: (id) => (isSelected(id) ? (remove(id), false) : add(id)), isSelected, getIds, setIds, clear, MAX: MAX_COMPARE };
})(window);
