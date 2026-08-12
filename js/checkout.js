/* ==========================================================================
   PENGUIN'S FRAGRANCE — CHECKOUT.JS
   Powers checkout.html: renders the mini order summary from the cart,
   handles shipping method selection, validates the customer/shipping
   form, and — on success — saves everything needed by payment.html to
   localStorage ("pf_checkout_data") before navigating forward.

   This does NOT process any payment. It only collects and validates
   shipping/contact details, per project rules (no real backend).
   ========================================================================== */

const PF_CHECKOUT_KEY = "pf_checkout_data";

const PF_SHIPPING_METHODS = {
  standard: { label: "Standard Shipping", sub: "5–7 business days", price: 0 },
  express: { label: "Express Shipping", sub: "2–3 business days", price: 250 },
};

let checkoutState = {
  shippingMethod: "standard",
};

/* ------------------------------------------------------------------
   ORDER SUMMARY RENDERING
   ------------------------------------------------------------------ */

function renderCheckoutSummary() {
  const cart = pfGetCart();
  const itemsContainer = document.getElementById("checkoutSummaryItems");

  if (!itemsContainer) return;

  itemsContainer.innerHTML = cart
    .map((item) => {
      const product = pfGetProductById(item.productId);
      if (!product) return "";
      return `
        <div class="checkout-summary-item">
          <div class="checkout-summary-item__media">
            <img src="${product.thumbnail}" alt="${product.name}" />
          </div>
          <div class="checkout-summary-item__info">
            <p class="checkout-summary-item__name">${product.name}</p>
            <p class="checkout-summary-item__meta">${item.size} &times; ${item.quantity}</p>
          </div>
          <span class="checkout-summary-item__price">${pfFormatPrice(product.price * item.quantity)}</span>
        </div>
      `;
    })
    .join("");

  renderCheckoutTotals();
}

function renderCheckoutTotals() {
  const totals = pfCalculateCartTotals();
  const shippingMethod = PF_SHIPPING_METHODS[checkoutState.shippingMethod];

  // Combine cart's own free/flat shipping logic with the chosen method's
  // surcharge (express adds a flat fee on top regardless of coupon).
  const shippingCost = totals.shipping > 0 || checkoutState.shippingMethod === "express"
    ? Math.max(totals.shipping, 0) + shippingMethod.price
    : shippingMethod.price;

  const total = totals.subtotal - totals.discount + shippingCost;

  document.getElementById("checkoutSubtotal").textContent = pfFormatPrice(totals.subtotal);

  const discountRow = document.getElementById("checkoutDiscountRow");
  if (totals.discount > 0) {
    discountRow.hidden = false;
    document.getElementById("checkoutDiscount").textContent = "−" + pfFormatPrice(totals.discount);
  } else {
    discountRow.hidden = true;
  }

  document.getElementById("checkoutShipping").textContent =
    shippingCost === 0 ? "Free" : pfFormatPrice(shippingCost);
  document.getElementById("checkoutTotal").textContent = pfFormatPrice(total);
}

/* ------------------------------------------------------------------
   SHIPPING METHOD SELECTION
   ------------------------------------------------------------------ */

function initShippingMethodSelector() {
  const options = document.querySelectorAll("[data-shipping-method]");

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const method = option.dataset.shippingMethod;
      checkoutState.shippingMethod = method;

      options.forEach((o) => o.classList.remove("selected"));
      option.classList.add("selected");

      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      renderCheckoutTotals();
    });
  });
}

/* ------------------------------------------------------------------
   FORM VALIDATION
   ------------------------------------------------------------------ */

function showFieldError(field, message) {
  const wrapper = field.closest(".form-field");
  if (!wrapper) return;
  wrapper.classList.add("has-error");

  let errorEl = wrapper.querySelector(".form-error-text");
  if (!errorEl) {
    errorEl = document.createElement("span");
    errorEl.className = "form-error-text";
    wrapper.appendChild(errorEl);
  }
  errorEl.textContent = message;
}

function clearFieldError(field) {
  const wrapper = field.closest(".form-field");
  if (!wrapper) return;
  wrapper.classList.remove("has-error");
  const errorEl = wrapper.querySelector(".form-error-text");
  if (errorEl) errorEl.remove();
}

/** Validates the checkout form. Returns true if valid, false otherwise
 * (and paints inline error messages on invalid fields). */
function validateCheckout(form) {
  let isValid = true;

  const requiredFields = form.querySelectorAll("[required]");
  requiredFields.forEach((field) => {
    clearFieldError(field);

    if (!field.value.trim()) {
      showFieldError(field, "This field is required.");
      isValid = false;
      return;
    }

    if (field.type === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(field.value.trim())) {
        showFieldError(field, "Enter a valid email address.");
        isValid = false;
      }
    }

    if (field.type === "tel") {
      const phonePattern = /^[0-9]{10}$/;
      if (!phonePattern.test(field.value.trim())) {
        showFieldError(field, "Enter a valid 10-digit phone number.");
        isValid = false;
      }
    }

    if (field.id === "checkoutPincode") {
      const pincodePattern = /^[0-9]{6}$/;
      if (!pincodePattern.test(field.value.trim())) {
        showFieldError(field, "Enter a valid 6-digit PIN code.");
        isValid = false;
      }
    }
  });

  return isValid;
}

/* ------------------------------------------------------------------
   FORM SUBMIT -> SAVE -> GO TO PAYMENT
   ------------------------------------------------------------------ */

function initCheckoutForm() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  // Clear a field's error as soon as the user starts fixing it
  form.querySelectorAll(".form-control-brand").forEach((field) => {
    field.addEventListener("input", () => clearFieldError(field));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (pfGetCart().length === 0) {
      showToast("Your cart is empty.", "error");
      window.location.href = "cart.html";
      return;
    }

    if (!validateCheckout(form)) {
      showToast("Please fix the highlighted fields.", "error");
      const firstError = form.querySelector(".has-error .form-control-brand");
      if (firstError) firstError.focus();
      return;
    }

    const checkoutData = {
      customer: {
        fullName: document.getElementById("checkoutFullName").value.trim(),
        email: document.getElementById("checkoutEmail").value.trim(),
        phone: document.getElementById("checkoutPhone").value.trim(),
      },
      shipping: {
        address: document.getElementById("checkoutAddress").value.trim(),
        city: document.getElementById("checkoutCity").value.trim(),
        state: document.getElementById("checkoutState").value.trim(),
        pincode: document.getElementById("checkoutPincode").value.trim(),
        country: "India",
      },
      shippingMethod: checkoutState.shippingMethod,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(PF_CHECKOUT_KEY, JSON.stringify(checkoutData));
    window.location.href = "payment.html";
  });
}

/* ------------------------------------------------------------------
   INIT
   ------------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  if (pfGetCart().length === 0) {
    const emptyNotice = document.getElementById("checkoutEmptyNotice");
    const formSection = document.getElementById("checkoutFormSection");
    if (emptyNotice) emptyNotice.hidden = false;
    if (formSection) formSection.hidden = true;
    return;
  }

  renderCheckoutSummary();
  initShippingMethodSelector();
  initCheckoutForm();
});
