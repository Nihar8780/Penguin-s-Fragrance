/* ==========================================================================
   PENGUIN'S FRAGRANCE — MAIN.JS
   Site-wide behavior loaded on every page (after products.js, before any
   page-specific script like product-details.js or checkout.js):
     - renders reusable product card grids anywhere in the DOM
     - wishlist heart toggle on cards (delegates to wishlist.js if present)
     - quick add-to-cart on cards (delegates to cart.js if present)
     - footer current year
     - newsletter demo submit
     - Bootstrap tooltip/popover init (if any exist on the page)
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     PRODUCT CARD RENDERING
     ------------------------------------------------------------------ */

  /**
   * Builds the HTML for a single product card.
   * @param {Object} product - a product object from PF_PRODUCTS
   * @param {Object} options
   * @param {boolean} options.centered - center-align text (homepage style)
   */
  function pfRenderProductCard(product, options = {}) {
    const { centered = false } = options;
    const stars = pfGetStarPattern(product.rating);
    const isWishlisted =
      typeof pfIsInWishlist === "function" ? pfIsInWishlist(product.id) : false;

    const starsHtml = stars
      .map((state) => {
        if (state === "full") {
          return '<span class="material-symbols-outlined">star</span>';
        }
        if (state === "half") {
          return '<span class="material-symbols-outlined">star_half</span>';
        }
        return '<span class="material-symbols-outlined is-empty">star</span>';
      })
      .join("");

    const priceHtml = product.originalPrice
      ? `<span class="product-card__price">${pfFormatPrice(product.price)}</span>
         <span class="product-card__price-original">${pfFormatPrice(product.originalPrice)}</span>`
      : `<span class="product-card__price">${pfFormatPrice(product.price)}</span>`;

    const badgeHtml = product.badge
      ? `<span class="badge-brand product-card__badge">${product.badge}</span>`
      : "";

    return `
      <div class="product-card ${centered ? "product-card--centered" : ""}" data-product-id="${product.id}">
        <a href="product.html?id=${product.id}" class="text-reset" style="text-decoration:none;">
          <div class="product-card__media">
            ${badgeHtml}
            <button
              type="button"
              class="product-card__wishlist-btn ${isWishlisted ? "is-active" : ""}"
              data-wishlist-toggle="${product.id}"
              aria-label="${isWishlisted ? "Remove from wishlist" : "Add to wishlist"}"
              aria-pressed="${isWishlisted}"
            >
              <span class="material-symbols-outlined">favorite</span>
            </button>
            <img
              src="${product.thumbnail}"
              alt="${product.name} — ${product.category} fragrance"
              loading="lazy"
            />
            <div class="product-card__hover-tint"></div>
            <div class="product-card__quick-add">
              <button
                type="button"
                class="btn-brand btn-brand-primary btn-brand-block"
                data-quick-add="${product.id}"
              >
                Quick Add
              </button>
            </div>
          </div>
        </a>
        <div class="px-1">
          <div class="product-card__tags">
            <span class="chip">${product.category}</span>
          </div>
          <a href="product.html?id=${product.id}" style="text-decoration:none;">
            <h3 class="product-card__title">${product.name}</h3>
          </a>
          <p class="product-card__meta">${product.topNotes.slice(0, 2).join(", ")}</p>
          <div class="product-card__price-row">${priceHtml}</div>
          <div class="product-card__rating">
            ${starsHtml}
            <span>(${product.reviewCount})</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renders a list of products into a container element by id.
   * @param {string} containerId
   * @param {Array} products
   * @param {Object} options - { centered, columns: 3|4 }
   */
  function pfRenderProductGrid(containerId, products, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!products || products.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <span class="material-symbols-outlined">inventory_2</span>
          <h2>No products found</h2>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = products
      .map((p) => pfRenderProductCard(p, options))
      .join("");
  }

  /* ------------------------------------------------------------------
     EVENT DELEGATION — wishlist toggle + quick add
     (works for cards rendered now or added later, since it's delegated
     on document.body rather than bound per-card)
     ------------------------------------------------------------------ */

  function initProductCardInteractions() {
    document.body.addEventListener("click", (e) => {
      const wishlistBtn = e.target.closest("[data-wishlist-toggle]");
      if (wishlistBtn) {
        e.preventDefault();
        const productId = wishlistBtn.getAttribute("data-wishlist-toggle");

        if (typeof pfToggleWishlist === "function") {
          const nowActive = pfToggleWishlist(productId);
          wishlistBtn.classList.toggle("is-active", nowActive);
          wishlistBtn.setAttribute("aria-pressed", String(nowActive));
          wishlistBtn.setAttribute(
            "aria-label",
            nowActive ? "Remove from wishlist" : "Add to wishlist"
          );
          if (typeof window.PenguinNav !== "undefined") {
            window.PenguinNav.refreshCounters();
          }
          if (typeof showToast === "function") {
            showToast(
              nowActive ? "Added to wishlist" : "Removed from wishlist",
              nowActive ? "success" : "default"
            );
          }
        } else {
          console.warn("wishlist.js not loaded — cannot toggle wishlist.");
        }
        return;
      }

      const quickAddBtn = e.target.closest("[data-quick-add]");
      if (quickAddBtn) {
        e.preventDefault();
        const productId = quickAddBtn.getAttribute("data-quick-add");
        const product = pfGetProductById(productId);
        if (!product) return;

        if (typeof addToCart === "function") {
          addToCart(productId, product.defaultSize, 1);
          if (typeof window.PenguinNav !== "undefined") {
            window.PenguinNav.refreshCounters();
          }
          if (typeof showToast === "function") {
            showToast(`${product.name} added to cart`, "success");
          }
        } else {
          console.warn("cart.js not loaded — cannot add to cart.");
        }
        return;
      }
    });
  }

  /* ------------------------------------------------------------------
     FOOTER YEAR
     ------------------------------------------------------------------ */

  function initFooterYear() {
    const yearEl = document.getElementById("footerYear");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ------------------------------------------------------------------
     NEWSLETTER (frontend demo — no real backend, per project rules)
     ------------------------------------------------------------------ */

  function initNewsletterForm() {
    const form = document.getElementById("newsletterForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("newsletterEmail");
      if (!input || !input.value.trim()) return;

      if (typeof showToast === "function") {
        showToast("Thanks for subscribing!", "success");
      }
      form.reset();
    });
  }

  /* ------------------------------------------------------------------
     BOOTSTRAP TOOLTIPS (used sparingly — e.g. size guide info icons)
     ------------------------------------------------------------------ */

  function initTooltips() {
    if (typeof bootstrap === "undefined") return;
    const tooltipTriggers = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggers.forEach((el) => new bootstrap.Tooltip(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initProductCardInteractions();
    initFooterYear();
    initNewsletterForm();
    initTooltips();
  });

  // Expose rendering functions globally so page-specific scripts
  // (shop listing, homepage, search results, related products on the
  // product page) can call them after applying their own filters.
  window.pfRenderProductCard = pfRenderProductCard;
  window.pfRenderProductGrid = pfRenderProductGrid;
})();
