/* ==========================================================================
   PENGUIN'S FRAGRANCE — CART.JS
   Cart persistence (localStorage) + cart.html page rendering.

   Storage shape: array of line items, each { productId, size, quantity }
   Key: "pf_cart"
   Coupon key: "pf_coupon" (a single applied coupon code string, or null)

   Public functions used elsewhere:
     addToCart(productId, size, quantity)   -> void   (main.js quick-add,
                                                          product-details.js,
                                                          wishlist.js)
     removeFromCart(productId, size)        -> void
     updateCartItemQuantity(productId, size, newQuantity) -> void
     pfCalculateCartTotals()                -> { subtotal, discount,
                                                   shipping, total, itemCount }
   ========================================================================== */

const PF_CART_KEY = "pf_cart";
const PF_COUPON_KEY = "pf_coupon";

/* Demo coupon codes — frontend-only simulation, no real backend validation */
const PF_COUPONS = {
  PENGUIN10: { type: "percent", value: 10, label: "10% off" },
  FREESHIP: { type: "free_shipping", value: 0, label: "Free shipping" },
};

const PF_SHIPPING_FLAT_FEE = 150;
const PF_FREE_SHIPPING_THRESHOLD = 5000;

/* ------------------------------------------------------------------
   STORAGE HELPERS
   ------------------------------------------------------------------ */

function pfGetCart() {
  try {
    return JSON.parse(localStorage.getItem(PF_CART_KEY) || "[]");
  } catch (err) {
    console.warn("Penguin's Fragrance: corrupted cart data, resetting.", err);
    return [];
  }
}

function pfSaveCart(cart) {
  localStorage.setItem(PF_CART_KEY, JSON.stringify(cart));
}

function pfGetAppliedCoupon() {
  return localStorage.getItem(PF_COUPON_KEY) || null;
}

function pfSaveAppliedCoupon(code) {
  if (code) {
    localStorage.setItem(PF_COUPON_KEY, code);
  } else {
    localStorage.removeItem(PF_COUPON_KEY);
  }
}

/* ------------------------------------------------------------------
   MUTATIONS
   ------------------------------------------------------------------ */

/** Adds a product/size combination to the cart. If that exact
 * product+size line already exists, increments its quantity instead
 * of creating a duplicate row. */
function addToCart(productId, size, quantity = 1) {
  const product = pfGetProductById(productId);
  if (!product) {
    console.warn(`Penguin's Fragrance: unknown product id "${productId}"`);
    return;
  }

  const resolvedSize = size || product.defaultSize;
  const cart = pfGetCart();
  const existing = cart.find(
    (item) => item.productId === productId && item.size === resolvedSize
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, size: resolvedSize, quantity });
  }

  pfSaveCart(cart);
  pfRenderCartPageIfPresent();
}

function removeFromCart(productId, size) {
  const cart = pfGetCart().filter(
    (item) => !(item.productId === productId && item.size === size)
  );
  pfSaveCart(cart);
  pfRenderCartPageIfPresent();
}

/** Sets an exact quantity for a line item. Quantities below 1 remove
 * the line item entirely (matches typical cart UX). */
function updateCartItemQuantity(productId, size, newQuantity) {
  const cart = pfGetCart();
  const item = cart.find(
    (i) => i.productId === productId && i.size === size
  );
  if (!item) return;

  if (newQuantity < 1) {
    removeFromCart(productId, size);
    return;
  }

  item.quantity = newQuantity;
  pfSaveCart(cart);
  pfRenderCartPageIfPresent();
}

function clearCart() {
  pfSaveCart([]);
  pfSaveAppliedCoupon(null);
  pfRenderCartPageIfPresent();
}

/* ------------------------------------------------------------------
   COUPONS
   ------------------------------------------------------------------ */

/** Attempts to apply a coupon code. Returns { success, message }. */
function pfApplyCoupon(code) {
  const normalized = (code || "").trim().toUpperCase();
  const coupon = PF_COUPONS[normalized];

  if (!coupon) {
    return { success: false, message: "Invalid or expired coupon code." };
  }

  pfSaveAppliedCoupon(normalized);
  pfRenderCartPageIfPresent();
  return { success: true, message: `Coupon applied: ${coupon.label}` };
}

function pfRemoveCoupon() {
  pfSaveAppliedCoupon(null);
  pfRenderCartPageIfPresent();
}

/* ------------------------------------------------------------------
   TOTALS CALCULATION
   ------------------------------------------------------------------ */

/** Calculates subtotal, discount, shipping, and total for the current
 * cart + applied coupon. Used by cart.html and checkout.html. */
function pfCalculateCartTotals() {
  const cart = pfGetCart();

  let subtotal = 0;
  let itemCount = 0;

  cart.forEach((item) => {
    const product = pfGetProductById(item.productId);
    if (!product) return;
    subtotal += product.price * item.quantity;
    itemCount += item.quantity;
  });

  let discount = 0;
  let freeShippingFromCoupon = false;

  const couponCode = pfGetAppliedCoupon();
  const coupon = couponCode ? PF_COUPONS[couponCode] : null;

  if (coupon) {
    if (coupon.type === "percent") {
      discount = Math.round((subtotal * coupon.value) / 100);
    } else if (coupon.type === "free_shipping") {
      freeShippingFromCoupon = true;
    }
  }

  let shipping = 0;
  if (itemCount > 0 && subtotal < PF_FREE_SHIPPING_THRESHOLD && !freeShippingFromCoupon) {
    shipping = PF_SHIPPING_FLAT_FEE;
  }

  const total = Math.max(subtotal - discount + shipping, 0);

  return {
    subtotal,
    discount,
    shipping,
    total,
    itemCount,
    couponCode,
  };
}

/* ------------------------------------------------------------------
   CART PAGE RENDERING (cart.html only — no-ops elsewhere)
   ------------------------------------------------------------------ */

function pfRenderCartPageIfPresent() {
  const itemsContainer = document.getElementById("cartItemsList");
  if (!itemsContainer) return; // not on cart.html

  const cart = pfGetCart();
  const emptyState = document.getElementById("cartEmptyState");
  const summarySection = document.getElementById("cartSummarySection");

  if (cart.length === 0) {
    itemsContainer.hidden = true;
    if (summarySection) summarySection.hidden = true;
    if (emptyState) emptyState.hidden = false;
    return;
  }

  itemsContainer.hidden = false;
  if (summarySection) summarySection.hidden = false;
  if (emptyState) emptyState.hidden = true;

  itemsContainer.innerHTML = cart
    .map((item) => {
      const product = pfGetProductById(item.productId);
      if (!product) return "";

      return `
        <div class="cart-item" data-product-id="${item.productId}" data-size="${item.size}">
          <div class="cart-item__media">
            <img src="${product.thumbnail}" alt="${product.name}" loading="lazy" />
          </div>
          <div class="cart-item__body">
            <div class="cart-item__header">
              <h3 class="cart-item__title">${product.name}</h3>
              <button
                type="button"
                class="btn-icon"
                data-remove-cart-item
                aria-label="Remove ${product.name} from cart"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <p class="cart-item__meta">Eau de Parfum &bull; ${item.size}</p>
            <div class="cart-item__footer">
              <div class="qty-stepper">
                <button type="button" data-qty-decrease aria-label="Decrease quantity">−</button>
                <span>${item.quantity}</span>
                <button type="button" data-qty-increase aria-label="Increase quantity">+</button>
              </div>
              <span class="cart-item__price">${pfFormatPrice(product.price * item.quantity)}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  pfRenderCartTotals();
}

function pfRenderCartTotals() {
  const totals = pfCalculateCartTotals();

  const subtotalEl = document.getElementById("cartSubtotal");
  const discountRow = document.getElementById("cartDiscountRow");
  const discountEl = document.getElementById("cartDiscount");
  const shippingEl = document.getElementById("cartShipping");
  const totalEl = document.getElementById("cartTotal");
  const couponAppliedLabel = document.getElementById("cartCouponApplied");

  if (subtotalEl) subtotalEl.textContent = pfFormatPrice(totals.subtotal);
  if (shippingEl) {
    shippingEl.textContent =
      totals.shipping === 0 ? "Free" : pfFormatPrice(totals.shipping);
  }
  if (totalEl) totalEl.textContent = pfFormatPrice(totals.total);

  if (discountRow && discountEl) {
    if (totals.discount > 0) {
      discountRow.hidden = false;
      discountEl.textContent = "−" + pfFormatPrice(totals.discount);
    } else {
      discountRow.hidden = true;
    }
  }

  if (couponAppliedLabel) {
    couponAppliedLabel.textContent = totals.couponCode
      ? `Applied: ${totals.couponCode}`
      : "";
  }
}

/* ------------------------------------------------------------------
   EVENT DELEGATION for cart page controls
   ------------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  pfRenderCartPageIfPresent();

  document.body.addEventListener("click", (e) => {
    const cartItemEl = e.target.closest(".cart-item");

    if (e.target.closest("[data-remove-cart-item]") && cartItemEl) {
      removeFromCart(cartItemEl.dataset.productId, cartItemEl.dataset.size);
      if (typeof window.PenguinNav !== "undefined") window.PenguinNav.refreshCounters();
      if (typeof showToast === "function") showToast("Item removed", "default");
      return;
    }

    if (e.target.closest("[data-qty-increase]") && cartItemEl) {
      const cart = pfGetCart();
      const item = cart.find(
        (i) =>
          i.productId === cartItemEl.dataset.productId &&
          i.size === cartItemEl.dataset.size
      );
      if (item) {
        updateCartItemQuantity(item.productId, item.size, item.quantity + 1);
        if (typeof window.PenguinNav !== "undefined") window.PenguinNav.refreshCounters();
      }
      return;
    }

    if (e.target.closest("[data-qty-decrease]") && cartItemEl) {
      const cart = pfGetCart();
      const item = cart.find(
        (i) =>
          i.productId === cartItemEl.dataset.productId &&
          i.size === cartItemEl.dataset.size
      );
      if (item) {
        updateCartItemQuantity(item.productId, item.size, item.quantity - 1);
        if (typeof window.PenguinNav !== "undefined") window.PenguinNav.refreshCounters();
      }
      return;
    }
  });

  const couponForm = document.getElementById("couponForm");
  if (couponForm) {
    couponForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("couponInput");
      if (!input) return;

      const result = pfApplyCoupon(input.value);
      if (typeof showToast === "function") {
        showToast(result.message, result.success ? "success" : "error");
      }
      if (result.success) input.value = "";
    });
  }
});
