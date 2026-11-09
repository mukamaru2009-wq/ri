/* ==========================================================================
   イヤホン診断 - products.html(製品一覧・検索・絞り込み)のロジック
   フィルタ状態はURLクエリパラメータと同期し、共有・ブックマークを可能にする。
   ========================================================================== */

(function () {
  const PRICE_BUCKETS = [
    { key: "0-5000", label: "5,000円未満", min: 0, max: 5000 },
    { key: "5000-15000", label: "5,000〜15,000円", min: 5000, max: 15000 },
    { key: "15000-30000", label: "15,000〜30,000円", min: 15000, max: 30000 },
    { key: "30000-", label: "30,000円以上", min: 30000, max: Infinity }
  ];

  const BATTERY_THRESHOLDS = [
    { key: "6", label: "6時間以上" },
    { key: "10", label: "10時間以上" }
  ];

  const CATEGORY_ORDER = ["エントリー", "ミドル", "ハイエンド"];
  const FIT_ORDER = ["canal", "open", "bone-conduction"];
  const PERSONA_ORDER = ["luxury", "gaming", "mic_quality", "sports", "commuter", "office", "audiophile"];
  const PERSONA_LABELS = {
    luxury: "高級帯",
    gaming: "ゲーミング",
    mic_quality: "マイク重視",
    sports: "スポーツ",
    commuter: "通勤・通学",
    office: "オフィス・Web会議",
    audiophile: "音質マニア"
  };

  function getPersonaLabel(tag) {
    return PERSONA_LABELS[tag] || tag;
  }

  let ALL_PRODUCTS = [];
  const state = {
    q: "",
    brand: [],
    price: [],
    category: [],
    fit: [],
    persona: [],
    anc: false,
    water: false,
    battery: [],
    charging: false,
    lowLatency: false,
    sort: "recommended"
  };

  function splitParam(v) {
    return v ? v.split(",").filter(Boolean) : [];
  }

  function parseStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    state.q = params.get("q") || "";
    state.brand = splitParam(params.get("brand"));
    state.price = splitParam(params.get("price"));
    state.category = splitParam(params.get("category"));
    state.fit = splitParam(params.get("fit"));
    state.persona = splitParam(params.get("persona"));
    state.anc = params.get("anc") === "1";
    state.water = params.get("water") === "1";
    state.battery = splitParam(params.get("battery"));
    state.charging = params.get("charging") === "1";
    state.lowLatency = params.get("low_latency") === "1";
    state.sort = params.get("sort") || "recommended";
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.brand.length) params.set("brand", state.brand.join(","));
    if (state.price.length) params.set("price", state.price.join(","));
    if (state.category.length) params.set("category", state.category.join(","));
    if (state.fit.length) params.set("fit", state.fit.join(","));
    if (state.persona.length) params.set("persona", state.persona.join(","));
    if (state.anc) params.set("anc", "1");
    if (state.water) params.set("water", "1");
    if (state.battery.length) params.set("battery", state.battery.join(","));
    if (state.charging) params.set("charging", "1");
    if (state.lowLatency) params.set("low_latency", "1");
    if (state.sort !== "recommended") params.set("sort", state.sort);

    const qs = params.toString();
    const newUrl = qs ? `${location.pathname}?${qs}` : location.pathname;
    history.replaceState(null, "", newUrl);
    sessionStorage.setItem("productsListQuery", qs ? `?${qs}` : "");
  }

  function removeFromArray(arr, value) {
    const idx = arr.indexOf(value);
    if (idx > -1) arr.splice(idx, 1);
  }

  function escapeAttr(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function matchesFilters(p) {
    if (state.q) {
      const q = state.q.toLowerCase();
      const haystack = `${p.name} ${p.brand}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (state.brand.length && !state.brand.includes(p.brand)) return false;
    if (state.category.length && !state.category.includes(p.category)) return false;
    if (state.fit.length && !state.fit.includes(p.fit_type)) return false;
    if (state.persona.length && !state.persona.some((tag) => p.persona_tags.includes(tag))) return false;
    if (state.price.length) {
      const inBucket = state.price.some((key) => {
        const bucket = PRICE_BUCKETS.find((b) => b.key === key);
        return bucket && p.price_yen >= bucket.min && p.price_yen < bucket.max;
      });
      if (!inBucket) return false;
    }
    if (state.anc && !p.features.noise_canceling) return false;
    if (state.water && !p.features.water_resistant) return false;
    if (state.charging && !p.features.wireless_charging) return false;
    if (state.lowLatency && !p.low_latency_mode) return false;
    if (state.battery.length) {
      const minRequired = Math.min(...state.battery.map(Number));
      if (p.features.battery_hours < minRequired) return false;
    }
    return true;
  }

  function sortProducts(list) {
    const sorted = list.slice();
    if (state.sort === "price-asc") sorted.sort((a, b) => a.price_yen - b.price_yen);
    else if (state.sort === "price-desc") sorted.sort((a, b) => b.price_yen - a.price_yen);
    else if (state.sort === "battery-desc") sorted.sort((a, b) => b.features.battery_hours - a.features.battery_hours);
    else if (state.sort === "year-desc") sorted.sort((a, b) => b.release_year - a.release_year);
    return sorted;
  }

  function featureBadge(icon, label) {
    return `<span class="mini-badge" title="${label}">${getFeatureIcon(icon)}</span>`;
  }

  function buildCardHtml(p) {
    const f = p.features;
    const iconRow = [
      f.noise_canceling ? featureBadge("anc", "ノイズキャンセリング対応") : "",
      f.water_resistant ? featureBadge("water", `防水: ${f.water_resistant}`) : "",
      f.wireless_charging ? featureBadge("charging", "ワイヤレス充電対応") : "",
      f.multipoint ? featureBadge("multipoint", "マルチポイント対応") : "",
      f.hi_res_audio ? featureBadge("hires", "ハイレゾ相当の音質") : ""
    ]
      .filter(Boolean)
      .join("");

    return `
      <div class="product-card">
        <a class="product-card-link" href="product.html?id=${encodeURIComponent(p.id)}">
          <div class="product-card-icon">${getFitIcon(p.fit_type)}</div>
          <p class="product-card-brand">${p.brand}</p>
          <h3 class="product-card-name">${p.name}</h3>
          <p class="product-card-price">${p.price_label}<span class="product-card-category">${p.category}</span></p>
          <div class="product-card-icons">${iconRow}</div>
          <p class="product-card-tagline">${p.tagline}</p>
        </a>
        <button type="button" class="compare-add-btn" data-id="${p.id}">+ 比較に追加</button>
        ${buildShopLinksHtml(p)}
      </div>
    `;
  }

  function updateCompareButtonState(btn) {
    const id = btn.dataset.id;
    const selected = window.CompareTray.isSelected(id);
    const ids = window.CompareTray.getIds();
    btn.textContent = selected ? "✓ 比較に追加済み" : "+ 比較に追加";
    btn.classList.toggle("is-selected", selected);
    btn.disabled = !selected && ids.length >= window.CompareTray.MAX;
  }

  function wireCompareButtons() {
    document.querySelectorAll(".compare-add-btn").forEach((btn) => {
      updateCompareButtonState(btn);
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.id;
        if (window.CompareTray.isSelected(id)) {
          window.CompareTray.remove(id);
        } else {
          const ok = window.CompareTray.add(id);
          if (!ok) {
            alert(`比較は最大${window.CompareTray.MAX}個までです。`);
          }
        }
      });
    });
  }

  document.addEventListener("comparetray:change", () => {
    document.querySelectorAll(".compare-add-btn").forEach(updateCompareButtonState);
  });

  function renderGrid(list) {
    const grid = document.getElementById("productGrid");
    const emptyState = document.getElementById("emptyState");
    if (list.length === 0) {
      grid.innerHTML = "";
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;
    grid.innerHTML = list.map(buildCardHtml).join("");
    wireCompareButtons();
  }

  function renderResultCount(count, total) {
    document.getElementById("resultCount").textContent = `${total}件中${count}件を表示`;
  }

  function renderActiveFilterChips() {
    const container = document.getElementById("activeFilters");
    const chips = [];

    state.brand.forEach((b) => chips.push({ label: b, remove: () => removeFromArray(state.brand, b) }));
    state.price.forEach((key) => {
      const bucket = PRICE_BUCKETS.find((b) => b.key === key);
      chips.push({ label: bucket ? bucket.label : key, remove: () => removeFromArray(state.price, key) });
    });
    state.category.forEach((c) => chips.push({ label: c, remove: () => removeFromArray(state.category, c) }));
    state.fit.forEach((f) => chips.push({ label: getFitLabel(f), remove: () => removeFromArray(state.fit, f) }));
    state.persona.forEach((tag) => chips.push({ label: getPersonaLabel(tag), remove: () => removeFromArray(state.persona, tag) }));
    if (state.anc) chips.push({ label: "ノイズキャンセリングあり", remove: () => (state.anc = false) });
    if (state.water) chips.push({ label: "防水対応", remove: () => (state.water = false) });
    if (state.charging) chips.push({ label: "ワイヤレス充電対応", remove: () => (state.charging = false) });
    if (state.lowLatency) chips.push({ label: "低遅延モード対応", remove: () => (state.lowLatency = false) });
    state.battery.forEach((v) => {
      const t = BATTERY_THRESHOLDS.find((b) => b.key === v);
      chips.push({ label: t ? t.label : `${v}時間以上`, remove: () => removeFromArray(state.battery, v) });
    });

    if (chips.length === 0) {
      container.innerHTML = "";
      container.hidden = true;
      return;
    }

    container.hidden = false;
    container.innerHTML =
      chips
        .map((c, i) => `<button type="button" class="filter-chip" data-chip-index="${i}">${c.label} <span aria-hidden="true">×</span></button>`)
        .join("") + `<button type="button" class="filter-clear-inline-btn" id="clearAllChipsBtn">フィルタをすべてクリア</button>`;

    container.querySelectorAll(".filter-chip").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        chips[i].remove();
        renderFilterOptions();
        render();
      });
    });

    const clearBtn = document.getElementById("clearAllChipsBtn");
    if (clearBtn) clearBtn.addEventListener("click", clearAllFilters);
  }

  function render() {
    const filtered = ALL_PRODUCTS.filter(matchesFilters);
    const sorted = sortProducts(filtered);

    renderActiveFilterChips();
    renderResultCount(filtered.length, ALL_PRODUCTS.length);
    renderGrid(sorted);
    syncUrl();
  }

  function renderCheckboxGroup(containerId, options, selectedArr) {
    const container = document.getElementById(containerId);
    container.innerHTML = options
      .map(
        (opt) => `
        <label class="filter-checkbox">
          <input type="checkbox" value="${escapeAttr(opt.value)}" ${selectedArr.includes(opt.value) ? "checked" : ""} />
          <span>${opt.label}</span>
        </label>`
      )
      .join("");

    container.querySelectorAll("input[type=checkbox]").forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          if (!selectedArr.includes(input.value)) selectedArr.push(input.value);
        } else {
          removeFromArray(selectedArr, input.value);
        }
        render();
      });
    });
  }

  function renderFilterOptions() {
    const brands = Array.from(new Set(ALL_PRODUCTS.map((p) => p.brand))).sort((a, b) => a.localeCompare(b, "ja"));
    renderCheckboxGroup("brandFilterList", brands.map((b) => ({ value: b, label: b })), state.brand);
    renderCheckboxGroup("priceFilterList", PRICE_BUCKETS.map((b) => ({ value: b.key, label: b.label })), state.price);
    renderCheckboxGroup("categoryFilterList", CATEGORY_ORDER.map((c) => ({ value: c, label: c })), state.category);
    renderCheckboxGroup(
      "fitFilterList",
      FIT_ORDER.map((f) => ({ value: f, label: getFitLabel(f) })),
      state.fit
    );
    renderCheckboxGroup(
      "personaFilterList",
      PERSONA_ORDER.map((tag) => ({ value: tag, label: getPersonaLabel(tag) })),
      state.persona
    );
    renderCheckboxGroup("batteryFilterList", BATTERY_THRESHOLDS.map((b) => ({ value: b.key, label: b.label })), state.battery);

    document.getElementById("ancFilter").checked = state.anc;
    document.getElementById("waterFilter").checked = state.water;
    document.getElementById("chargingFilter").checked = state.charging;
    document.getElementById("lowLatencyFilter").checked = state.lowLatency;
  }

  function clearAllFilters() {
    state.brand = [];
    state.price = [];
    state.category = [];
    state.fit = [];
    state.persona = [];
    state.anc = false;
    state.water = false;
    state.battery = [];
    state.charging = false;
    state.lowLatency = false;
    renderFilterOptions();
    render();
  }

  function setupStaticControls() {
    document.getElementById("searchInput").addEventListener(
      "input",
      debounce((e) => {
        state.q = e.target.value.trim();
        render();
      }, 150)
    );

    document.getElementById("sortSelect").addEventListener("change", (e) => {
      state.sort = e.target.value;
      render();
    });

    document.getElementById("ancFilter").addEventListener("change", (e) => {
      state.anc = e.target.checked;
      render();
    });
    document.getElementById("waterFilter").addEventListener("change", (e) => {
      state.water = e.target.checked;
      render();
    });
    document.getElementById("chargingFilter").addEventListener("change", (e) => {
      state.charging = e.target.checked;
      render();
    });
    document.getElementById("lowLatencyFilter").addEventListener("change", (e) => {
      state.lowLatency = e.target.checked;
      render();
    });

    document.getElementById("filterClearBtn").addEventListener("click", clearAllFilters);

    const filterPanel = document.getElementById("filterPanel");
    const filterOverlay = document.getElementById("filterOverlay");

    function openFilterPanel() {
      filterPanel.classList.add("is-open");
      filterOverlay.hidden = false;
    }
    function closeFilterPanel() {
      filterPanel.classList.remove("is-open");
      filterOverlay.hidden = true;
    }

    document.getElementById("filterToggleBtn").addEventListener("click", openFilterPanel);
    document.getElementById("filterCloseBtn").addEventListener("click", closeFilterPanel);
    filterOverlay.addEventListener("click", closeFilterPanel);
  }

  async function init() {
    parseStateFromUrl();
    document.getElementById("searchInput").value = state.q;
    document.getElementById("sortSelect").value = state.sort;
    setupStaticControls();

    try {
      ALL_PRODUCTS = await loadProducts();
    } catch (e) {
      document.getElementById("resultCount").innerHTML =
        "製品データの読み込みに失敗しました。file:// で直接開いていませんか?<br>" +
        "このサイトは <code>npx serve</code> や <code>python -m http.server</code> などのローカルサーバー経由でアクセスしてください。";
      return;
    }

    renderFilterOptions();
    render();
  }

  init();
})();
