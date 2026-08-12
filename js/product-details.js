/* ==========================================================================
   PENGUIN'S FRAGRANCE — PRODUCT-DETAILS.JS
   Powers product.html. Reads ?id= from the URL, looks the product up in
   PF_PRODUCTS via pfGetProductById(), and renders every dynamic section:
   gallery, price/rating, size selector, accordions, and related products.
   Falls back to a friendly "not found" state for an invalid/missing id.
   ========================================================================== */

(function () {
  "use strict";

  const state = {
    product: null,
    selectedSize: null,
    quantity: 1,
    activeImageIndex: 0,
  };

  function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  /* ------------------------------------------------------------------
     RENDER: header info (breadcrumb, title, price, rating, badge)
     ------------------------------------------------------------------ */

  function renderHeaderInfo(product) {
    document.title = `${product.name} | Penguin's Fragrance`;

    document.getElementById("breadcrumbProductName").textContent = product.name;
    document.getElementById("pdpTitle").textContent = product.name;
    document.getElementById("pdpBrandLabel").textContent = product.brand;

    const starsContainer = document.getElementById("pdpStars");
    const stars = pfGetStarPattern(product.rating);
    starsContainer.innerHTML = stars
      .map((s) =>
        s === "empty"
          ? '<span class="material-symbols-outlined is-empty">star</span>'
          : `<span class="material-symbols-outlined">${s === "half" ? "star_half" : "star"}</span>`
      )
      .join("");
    document.getElementById("pdpReviewCount").textContent = `(${product.reviewCount} Reviews)`;

    const priceEl = document.getElementById("pdpPrice");
    if (product.originalPrice) {
      priceEl.innerHTML = `
        ${pfFormatPrice(product.price)}
        <span class="pdp-price__original">${pfFormatPrice(product.originalPrice)}</span>
      `;
    } else {
      priceEl.textContent = pfFormatPrice(product.price);
    }

    const stockNote = document.getElementById("pdpStockNote");
    if (product.stock <= 0) {
      stockNote.textContent = "Out of stock";
      stockNote.classList.add("low-stock");
    } else if (product.stock <= 10) {
      stockNote.textContent = `Only ${product.stock} left in stock`;
      stockNote.classList.add("low-stock");
    } else {
      stockNote.textContent = "In stock";
      stockNote.classList.remove("low-stock");
    }

    const badgeContainer = document.getElementById("pdpBadge");
    badgeContainer.innerHTML = product.badge
      ? `<span class="badge-brand">${product.badge}</span>`
      : "";
  }

  /* ------------------------------------------------------------------
     RENDER: gallery + thumbnails
     ------------------------------------------------------------------ */

  function renderGallery(product) {
    const mainImg = document.getElementById("pdpMainImage");
    const thumbsContainer = document.getElementById("pdpThumbs");

    mainImg.src = product.images[0];
    mainImg.alt = `${product.name} — main product image`;

    thumbsContainer.innerHTML = product.images
      .map(
        (src, i) => `
        <button
          type="button"
          class="pdp-gallery__thumb ${i === 0 ? "active" : ""}"
          data-image-index="${i}"
          aria-label="View image ${i + 1} of ${product.name}"
        >
          <img src="${src}" alt="" loading="lazy" />
        </button>`
      )
      .join("");

    thumbsContainer.querySelectorAll("[data-image-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.imageIndex);
        state.activeImageIndex = index;

        thumbsContainer
          .querySelectorAll(".pdp-gallery__thumb")
          .forEach((t) => t.classList.remove("active"));
        btn.classList.add("active");

        mainImg.style.opacity = "0";
        setTimeout(() => {
          mainImg.src = product.images[index];
          mainImg.style.opacity = "1";
        }, 150);
      });
    });
  }

  /* ------------------------------------------------------------------
     RENDER: size selector
     ------------------------------------------------------------------ */

  function renderSizeSelector(product) {
    state.selectedSize = product.defaultSize;
    const container = document.getElementById("pdpSizeGrid");

    container.innerHTML = product.sizes
      .map(
        (size) => `
        <button
          type="button"
          class="size-option ${size === state.selectedSize ? "active" : ""}"
          data-size="${size}"
        >${size}</button>`
      )
      .join("");

    container.querySelectorAll("[data-size]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedSize = btn.dataset.size;
        container
          .querySelectorAll(".size-option")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
  }

  /* ------------------------------------------------------------------
     RENDER: quantity stepper
     ------------------------------------------------------------------ */

  function renderQuantityStepper() {
    const qtyDisplay = document.getElementById("pdpQtyDisplay");
    const decreaseBtn = document.getElementById("pdpQtyDecrease");
    const increaseBtn = document.getElementById("pdpQtyIncrease");

    const update = () => {
      qtyDisplay.textContent = state.quantity;
      decreaseBtn.disabled = state.quantity <= 1;
    };

    decreaseBtn.addEventListener("click", () => {
      if (state.quantity > 1) {
        state.quantity--;
        update();
      }
    });

    increaseBtn.addEventListener("click", () => {
      state.quantity++;
      update();
    });

    update();
  }

  /* ------------------------------------------------------------------
     RENDER: wishlist toggle button
     ------------------------------------------------------------------ */

  function renderWishlistToggle(product) {
    const btn = document.getElementById("pdpWishlistToggle");
    const syncState = () => {
      const active = pfIsInWishlist(product.id);
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
      btn.setAttribute("aria-label", active ? "Remove from wishlist" : "Add to wishlist");
    };

    syncState();

    btn.addEventListener("click", () => {
      const nowActive = pfToggleWishlist(product.id);
      syncState();
      window.PenguinNav && window.PenguinNav.refreshCounters();
      showToast(nowActive ? "Added to wishlist" : "Removed from wishlist", nowActive ? "success" : "default");
    });
  }

  /* ------------------------------------------------------------------
     ACTIONS: Add to Cart / Buy Now
     ------------------------------------------------------------------ */

  function initActionButtons(product) {
    document.getElementById("pdpAddToCart").addEventListener("click", () => {
      if (product.stock <= 0) return;
      addToCart(product.id, state.selectedSize, state.quantity);
      window.PenguinNav && window.PenguinNav.refreshCounters();
      showToast(`${product.name} (${state.selectedSize}) added to cart`, "success");
    });

    document.getElementById("pdpBuyNow").addEventListener("click", () => {
      if (product.stock <= 0) return;
      addToCart(product.id, state.selectedSize, state.quantity);
      window.location.href = "checkout.html";
    });
  }

  /* ------------------------------------------------------------------
     RENDER: accordion content (notes, ingredients, description)
     ------------------------------------------------------------------ */

  function renderAccordionContent(product) {
    document.getElementById("accDescriptionText").textContent = product.description;

    document.getElementById("accNotesTop").textContent = product.topNotes.join(", ");
    document.getElementById("accNotesHeart").textContent = product.heartNotes.join(", ");
    document.getElementById("accNotesBase").textContent = product.baseNotes.join(", ");

    document.getElementById("accIngredientsText").textContent = product.ingredients;
  }

  function initAccordions() {
    const triggers = document.querySelectorAll(".accordion-brand-trigger");
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const targetId = trigger.getAttribute("aria-controls");
        const content = document.getElementById(targetId);
        const isOpen = content.classList.contains("open");

        content.classList.toggle("open", !isOpen);
        trigger.setAttribute("aria-expanded", String(!isOpen));
      });
    });

    // First accordion open by default
    if (triggers[0]) triggers[0].click();
  }

  /* ------------------------------------------------------------------
     RENDER: related products
     ------------------------------------------------------------------ */

  function renderRelatedProducts(product) {
    const related = pfGetRelatedProducts(product.id, 3);
    pfRenderProductGrid("relatedProductsGrid", related);
  }

  /* ------------------------------------------------------------------
     NOT FOUND STATE
     ------------------------------------------------------------------ */

  function renderNotFound() {
    document.title = "Product Not Found | Penguin's Fragrance";
    const main = document.getElementById("pdpMain");
    main.innerHTML = `
      <div class="pdp-not-found">
        <span class="material-symbols-outlined" style="font-size:48px;color:var(--outline);">search_off</span>
        <h1 class="text-headline-md mt-4 mb-3">Product Not Found</h1>
        <p class="text-secondary mb-4">The fragrance you're looking for doesn't exist or may have been removed.</p>
        <a href="shop.html" class="btn-brand btn-brand-primary">Browse All Fragrances</a>
      </div>
    `;
  }

  /* ------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", () => {
    const productId = getProductIdFromUrl();
    const product = productId ? pfGetProductById(productId) : null;

    if (!product) {
      renderNotFound();
      return;
    }

    state.product = product;

    renderHeaderInfo(product);
    renderGallery(product);
    renderSizeSelector(product);
    renderQuantityStepper();
    renderWishlistToggle(product);
    initActionButtons(product);
    renderAccordionContent(product);
    initAccordions();
    renderRelatedProducts(product);
  });
})();
