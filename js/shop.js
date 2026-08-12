/* ==========================================================================
   PENGUIN'S FRAGRANCE — SHOP.JS
   Powers shop.html: filter state (gender/category/size), sorting,
   pagination, active-filter chips, and rendering the shop grid via the
   shared pfFilterProducts() / pfRenderProductGrid() helpers from
   products.js / main.js. Also reads an initial ?category= URL param so
   links from categories.html land pre-filtered.
   ========================================================================== */

(function () {
  "use strict";

  const PAGE_SIZE = 6;

  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get("category");

  const state = {
    category:
      initialCategory && ["woody", "floral", "fresh", "amber"].includes(initialCategory)
        ? initialCategory
        : "all",
    gender: "all",
    sizes: [],
    sort: "newest",
    page: 1,
  };

  const FILTER_FIELDS_HTML = `
    <div class="filter-group">
      <h3 class="filter-group__title">Category</h3>
      <div class="filter-group__list">
        <label class="filter-group__item">
          <input type="checkbox" class="form-check-input" data-filter-gender value="men" /> Men's
        </label>
        <label class="filter-group__item">
          <input type="checkbox" class="form-check-input" data-filter-gender value="women" /> Women's
        </label>
        <label class="filter-group__item">
          <input type="checkbox" class="form-check-input" data-filter-gender value="unisex" checked /> Unisex
        </label>
      </div>
    </div>
    <div class="filter-group">
      <h3 class="filter-group__title">Fragrance Family</h3>
      <div class="filter-group__list">
        <label class="filter-group__item"><input type="radio" name="category" class="form-check-input" data-filter-category value="all" checked /> All Families</label>
        <label class="filter-group__item"><input type="radio" name="category" class="form-check-input" data-filter-category value="woody" /> Woody</label>
        <label class="filter-group__item"><input type="radio" name="category" class="form-check-input" data-filter-category value="floral" /> Floral</label>
        <label class="filter-group__item"><input type="radio" name="category" class="form-check-input" data-filter-category value="fresh" /> Fresh</label>
        <label class="filter-group__item"><input type="radio" name="category" class="form-check-input" data-filter-category value="amber" /> Amber</label>
      </div>
    </div>
    <div class="filter-group">
      <h3 class="filter-group__title">Size</h3>
      <div class="filter-group__list">
        <label class="filter-group__item"><input type="checkbox" class="form-check-input" data-filter-size value="30ml" /> 30ml</label>
        <label class="filter-group__item"><input type="checkbox" class="form-check-input" data-filter-size value="50ml" /> 50ml</label>
        <label class="filter-group__item"><input type="checkbox" class="form-check-input" data-filter-size value="100ml" /> 100ml</label>
      </div>
    </div>
  `;

  function renderFilterForms() {
    document.getElementById("filterFormDesktop").innerHTML = FILTER_FIELDS_HTML;
    document.getElementById("filterFormMobile").innerHTML = FILTER_FIELDS_HTML;
    bindFilterInputs();
  }

  function bindFilterInputs() {
    document.querySelectorAll("[data-filter-gender]").forEach((el) => {
      el.checked = state.gender === "all" ? el.value === "unisex" : state.gender === el.value;
      el.addEventListener("change", () => {
        const checked = Array.from(document.querySelectorAll("[data-filter-gender]:checked")).map((c) => c.value);
        state.gender = checked.length === 1 ? checked[0] : "all";
        state.page = 1;
        update();
      });
    });

    document.querySelectorAll("[data-filter-category]").forEach((el) => {
      el.checked = el.value === state.category;
      el.addEventListener("change", () => {
        state.category = el.value;
        state.page = 1;
        update();
      });
    });

    document.querySelectorAll("[data-filter-size]").forEach((el) => {
      el.checked = state.sizes.includes(el.value);
      el.addEventListener("change", () => {
        if (el.checked) state.sizes.push(el.value);
        else state.sizes = state.sizes.filter((s) => s !== el.value);
        state.page = 1;
        update();
      });
    });
  }

  function getFilteredSortedProducts() {
    let results = pfFilterProducts({
      category: state.category,
      gender: state.gender,
    });

    if (state.sizes.length > 0) {
      results = results.filter((p) => state.sizes.some((s) => p.sizes.includes(s)));
    }

    switch (state.sort) {
      case "price-asc":
        results = [...results].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        results = [...results].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        results = [...results].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break; // "newest" — keep catalog order
    }

    return results;
  }

  function renderActiveFilterChips() {
    const container = document.getElementById("activeFilters");
    const chips = [];

    if (state.category !== "all") {
      chips.push({ label: state.category, clear: () => (state.category = "all") });
    }
    state.sizes.forEach((size) => {
      chips.push({ label: size, clear: () => (state.sizes = state.sizes.filter((s) => s !== size)) });
    });

    if (chips.length === 0) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = chips
      .map(
        (chip, i) => `
        <span class="active-filter-chip">
          ${chip.label}
          <button type="button" data-chip-index="${i}" aria-label="Remove filter">
            <span class="material-symbols-outlined" style="font-size:14px;">close</span>
          </button>
        </span>`
      )
      .join("");

    container.querySelectorAll("[data-chip-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        chips[Number(btn.dataset.chipIndex)].clear();
        state.page = 1;
        renderFilterForms();
        update();
      });
    });
  }

  function renderPagination(totalItems) {
    const container = document.getElementById("shopPagination");
    const totalPages = Math.max(Math.ceil(totalItems / PAGE_SIZE), 1);

    if (totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    let pagesHtml = "";
    for (let i = 1; i <= totalPages; i++) {
      pagesHtml += `<button type="button" class="pagination-brand__page ${i === state.page ? "active" : ""}" data-page="${i}">${i}</button>`;
    }

    container.innerHTML = `
      <button type="button" class="btn-icon" data-page-prev ${state.page === 1 ? "disabled" : ""} aria-label="Previous page">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <div class="pagination-brand__pages">${pagesHtml}</div>
      <button type="button" class="btn-icon" data-page-next ${state.page === totalPages ? "disabled" : ""} aria-label="Next page">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    `;

    container.querySelectorAll("[data-page]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.page = Number(btn.dataset.page);
        update();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    const prevBtn = container.querySelector("[data-page-prev]");
    const nextBtn = container.querySelector("[data-page-next]");
    if (prevBtn) prevBtn.addEventListener("click", () => { if (state.page > 1) { state.page--; update(); } });
    if (nextBtn) nextBtn.addEventListener("click", () => { if (state.page < totalPages) { state.page++; update(); } });
  }

  function update() {
    const filtered = getFilteredSortedProducts();
    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    document.getElementById("resultsCount").textContent =
      filtered.length > 0
        ? `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length} fragrances`
        : "No fragrances match your filters";

    pfRenderProductGrid("shopGrid", pageItems);
    renderActiveFilterChips();
    renderPagination(filtered.length);
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderFilterForms();

    document.getElementById("sortSelect").addEventListener("change", (e) => {
      state.sort = e.target.value;
      state.page = 1;
      update();
    });

    document.getElementById("clearFiltersMobile").addEventListener("click", () => {
      state.category = "all";
      state.gender = "all";
      state.sizes = [];
      state.page = 1;
      renderFilterForms();
      update();
    });

    update();
  });
})();
