/* ==========================================================================
   PENGUIN'S FRAGRANCE — WISHLIST.JS
   Wishlist persistence (localStorage) + wishlist.html page rendering.
   Storage shape: an array of product id strings, e.g. ["noir-elan", ...]
   Key: "pf_wishlist"

   Public functions used by other files:
     pfIsInWishlist(id)      -> boolean          (main.js, product-details.js)
     pfToggleWishlist(id)    -> boolean (new state) (main.js card hearts)
     addToWishlist(id)       -> void
     removeFromWishlist(id)  -> void
   ========================================================================== */

const PF_WISHLIST_KEY = "pf_wishlist";

/* ------------------------------------------------------------------
   STORAGE HELPERS
   ------------------------------------------------------------------ */

function pfGetWishlist() {
  try {
    return JSON.parse(localStorage.getItem(PF_WISHLIST_KEY) || "[]");
  } catch (err) {
    console.warn("Penguin's Fragrance: corrupted wishlist data, resetting.", err);
    return [];
  }
}

function pfSaveWishlist(wishlist) {
  localStorage.setItem(PF_WISHLIST_KEY, JSON.stringify(wishlist));
}

function pfIsInWishlist(productId) {
  return pfGetWishlist().includes(productId);
}

/* ------------------------------------------------------------------
   MUTATIONS
   ------------------------------------------------------------------ */

function addToWishlist(productId) {
  const wishlist = pfGetWishlist();
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    pfSaveWishlist(wishlist);
  }
  pfRenderWishlistPageIfPresent();
}

function removeFromWishlist(productId) {
  const wishlist = pfGetWishlist().filter((id) => id !== productId);
  pfSaveWishlist(wishlist);
  pfRenderWishlistPageIfPresent();
}

/** Adds if absent, removes if present. Returns the new state (true = now
 * in wishlist). Used by the heart button on every product card. */
function pfToggleWishlist(productId) {
  const wishlist = pfGetWishlist();
  const index = wishlist.indexOf(productId);

  if (index === -1) {
    wishlist.push(productId);
    pfSaveWishlist(wishlist);
    pfRenderWishlistPageIfPresent();
    return true;
  }

  wishlist.splice(index, 1);
  pfSaveWishlist(wishlist);
  pfRenderWishlistPageIfPresent();
  return false;
}

/** Moves a product from wishlist into the cart (default size), then
 * removes it from the wishlist. Used on wishlist.html. */
function moveWishlistItemToCart(productId) {
  const product = pfGetProductById(productId);
  if (!product) return;

  if (typeof addToCart === "function") {
    addToCart(productId, product.defaultSize, 1);
  }
  removeFromWishlist(productId);

  if (typeof window.PenguinNav !== "undefined") {
    window.PenguinNav.refreshCounters();
  }
  if (typeof showToast === "function") {
    showToast(`${product.name} moved to cart`, "success");
  }
}

/* ------------------------------------------------------------------
   WISHLIST PAGE RENDERING (wishlist.html only — no-ops elsewhere)
   ------------------------------------------------------------------ */

function pfRenderWishlistPageIfPresent() {
  const container = document.getElementById("wishlistGrid");
  if (!container) return; // not on wishlist.html, nothing to do

  const wishlist = pfGetWishlist();
  const products = wishlist
    .map((id) => pfGetProductById(id))
    .filter(Boolean);

  const emptyState = document.getElementById("wishlistEmptyState");
  const countLabel = document.getElementById("wishlistCountLabel");

  if (countLabel) {
    countLabel.textContent = `${products.length} item${products.length === 1 ? "" : "s"}`;
  }

  if (products.length === 0) {
    container.hidden = true;
    if (emptyState) emptyState.hidden = false;
    return;
  }

  container.hidden = false;
  if (emptyState) emptyState.hidden = true;

  container.innerHTML = products
    .map(
      (product) => `
      <div class="product-card" data-product-id="${product.id}">
        <a href="product.html?id=${product.id}" style="text-decoration:none;">
          <div class="product-card__media">
            <img src="${product.thumbnail}" alt="${product.name}" loading="lazy" />
          </div>
        </a>
        <div class="px-1">
          <a href="product.html?id=${product.id}" style="text-decoration:none;">
            <h3 class="product-card__title">${product.name}</h3>
          </a>
          <p class="product-card__meta">${product.category}</p>
          <p class="product-card__price">${pfFormatPrice(product.price)}</p>
          <div class="d-flex gap-2 mt-3">
            <button
              type="button"
              class="btn-brand btn-brand-primary btn-brand-block"
              data-move-to-cart="${product.id}"
            >
              Move to Cart
            </button>
            <button
              type="button"
              class="btn-icon"
              data-remove-wishlist="${product.id}"
              aria-label="Remove from wishlist"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

/* ------------------------------------------------------------------
   EVENT DELEGATION for the wishlist page's own buttons
   (card hearts elsewhere are handled by main.js's delegated listener)
   ------------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  pfRenderWishlistPageIfPresent();

  document.body.addEventListener("click", (e) => {
    const moveBtn = e.target.closest("[data-move-to-cart]");
    if (moveBtn) {
      e.preventDefault();
      moveWishlistItemToCart(moveBtn.getAttribute("data-move-to-cart"));
      return;
    }

    const removeBtn = e.target.closest("[data-remove-wishlist]");
    if (removeBtn) {
      e.preventDefault();
      removeFromWishlist(removeBtn.getAttribute("data-remove-wishlist"));
      if (typeof window.PenguinNav !== "undefined") {
        window.PenguinNav.refreshCounters();
      }
      if (typeof showToast === "function") {
        showToast("Removed from wishlist", "default");
      }
    }
  });
});
