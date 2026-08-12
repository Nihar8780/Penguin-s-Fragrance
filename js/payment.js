/* ==========================================================================
   PENGUIN'S FRAGRANCE — PAYMENT.JS
   Powers payment.html.

   Cash on Delivery uses a simple simulated processing delay (no
   gateway needed for COD in real life either).

   Every other payment method opens the REAL Razorpay Checkout widget
   in TEST MODE (see RAZORPAY_KEY_ID below) — a genuine gateway
   transaction using Razorpay's fake test-mode money, not simulated
   client-side. No real money moves, and no Key Secret exists anywhere
   in this file (only the public Key ID, which is safe for frontend
   code). If the Key ID hasn't been configured yet, it safely falls
   back to the same simulated flow as COD so the page never breaks.

   To go fully live later: switch RAZORPAY_KEY_ID to a Live Mode key,
   and — importantly — add a backend to create orders server-side and
   verify payment signatures. Client-side-only verification (what this
   file does) is fine for a demo but should not be trusted in
   production.
   ========================================================================== */

const PF_ORDERS_KEY = "pf_orders";
const PF_LAST_ORDER_KEY = "pf_last_order";

/* ------------------------------------------------------------------
   RAZORPAY TEST MODE CONFIGURATION
   ------------------------------------------------------------------
   Paste your Razorpay TEST Key ID below (starts with "rzp_test_").
   Get one free at razorpay.com -> Dashboard -> Account & Settings ->
   API Keys -> Generate Key (in Test Mode). Only paste the Key ID —
   NEVER the Key Secret, which does not belong in frontend code at all.

   Until you replace the placeholder, "Place Order" for any method
   other than Cash on Delivery falls back to the safe demo simulation
   instead of trying (and failing) to open a real widget with a fake key.
   ------------------------------------------------------------------ */
const RAZORPAY_KEY_ID = "rzp_test_TO09rHXwdugAvi";

let paymentState = {
  method: "upi", // upi | card | netbanking | wallet | cod
};

/* ------------------------------------------------------------------
   GUARD: require checkout data + non-empty cart
   ------------------------------------------------------------------ */

function getCheckoutData() {
  try {
    return JSON.parse(localStorage.getItem(PF_CHECKOUT_KEY) || "null");
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------
   ORDER SUMMARY (mirrors checkout.js rendering, kept independent so
   this page works standalone if opened directly)
   ------------------------------------------------------------------ */

function renderPaymentSummary() {
  const cart = pfGetCart();
  const container = document.getElementById("paymentSummaryItems");
  if (!container) return;

  container.innerHTML = cart
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

  const totals = pfCalculateCartTotals();
  document.getElementById("paymentSubtotal").textContent = pfFormatPrice(totals.subtotal);

  const discountRow = document.getElementById("paymentDiscountRow");
  if (totals.discount > 0) {
    discountRow.hidden = false;
    document.getElementById("paymentDiscount").textContent = "−" + pfFormatPrice(totals.discount);
  } else {
    discountRow.hidden = true;
  }

  document.getElementById("paymentShipping").textContent =
    totals.shipping === 0 ? "Free" : pfFormatPrice(totals.shipping);
  document.getElementById("paymentTotal").textContent = pfFormatPrice(totals.total);
}

/* ------------------------------------------------------------------
   PAYMENT METHOD SELECTION
   ------------------------------------------------------------------ */

function initPaymentMethodSelector() {
  const options = document.querySelectorAll("[data-payment-method]");
  const subforms = document.querySelectorAll("[data-payment-subform]");

  function setMethod(method) {
    paymentState.method = method;

    options.forEach((o) => o.classList.toggle("selected", o.dataset.paymentMethod === method));
    subforms.forEach((f) => f.classList.toggle("active", f.dataset.paymentSubform === method));
  }

  options.forEach((option) => {
    option.addEventListener("click", () => setMethod(option.dataset.paymentMethod));
  });

  setMethod(paymentState.method);
}

/* ------------------------------------------------------------------
   LIGHTWEIGHT INPUT FORMATTING (card number / expiry) — cosmetic only,
   no validation logic beyond basic pattern/length checks below.
   ------------------------------------------------------------------ */

function initCardInputFormatting() {
  const cardNumberInput = document.getElementById("cardNumber");
  const cardExpiryInput = document.getElementById("cardExpiry");

  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", () => {
      let digits = cardNumberInput.value.replace(/\D/g, "").slice(0, 16);
      cardNumberInput.value = digits.replace(/(.{4})/g, "$1 ").trim();
    });
  }

  if (cardExpiryInput) {
    cardExpiryInput.addEventListener("input", () => {
      let digits = cardExpiryInput.value.replace(/\D/g, "").slice(0, 4);
      if (digits.length > 2) {
        cardExpiryInput.value = digits.slice(0, 2) + "/" + digits.slice(2);
      } else {
        cardExpiryInput.value = digits;
      }
    });
  }
}

/* ------------------------------------------------------------------
   VALIDATION per selected method
   ------------------------------------------------------------------ */

function validatePaymentMethod() {
  if (paymentState.method === "upi") {
    const upiInput = document.getElementById("upiId");
    const upiPattern = /^[\w.\-]+@[\w]+$/;
    if (!upiPattern.test(upiInput.value.trim())) {
      showToast("Enter a valid UPI ID (e.g. yourname@bank).", "error");
      upiInput.focus();
      return false;
    }
    return true;
  }

  if (paymentState.method === "card") {
    const number = document.getElementById("cardNumber").value.replace(/\s/g, "");
    const name = document.getElementById("cardName").value.trim();
    const expiry = document.getElementById("cardExpiry").value.trim();
    const cvv = document.getElementById("cardCvv").value.trim();

    if (number.length !== 16) {
      showToast("Enter a valid 16-digit card number.", "error");
      return false;
    }
    if (!name) {
      showToast("Enter the name on the card.", "error");
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      showToast("Enter expiry as MM/YY.", "error");
      return false;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      showToast("Enter a valid CVV.", "error");
      return false;
    }
    return true;
  }

  if (paymentState.method === "netbanking") {
    const bank = document.getElementById("netbankingSelect").value;
    if (!bank) {
      showToast("Select your bank.", "error");
      return false;
    }
    return true;
  }

  if (paymentState.method === "wallet") {
    const wallet = document.getElementById("walletSelect").value;
    if (!wallet) {
      showToast("Select a wallet provider.", "error");
      return false;
    }
    return true;
  }

  // COD requires no additional fields
  return true;
}

/**
 * Finalizes an order: builds the order record, saves it, clears the
 * cart, and redirects to the confirmation page. Called either after
 * the COD simulated delay, or from Razorpay's success handler once a
 * real (test-mode) payment has actually gone through.
 *
 * @param {string} paymentMethod - "upi" | "card" | "netbanking" | "wallet" | "cod"
 * @param {string|null} gatewayPaymentId - Razorpay's payment id, if this
 *   came through the real checkout widget. Null for COD/demo orders.
 */
function completeOrder(paymentMethod, gatewayPaymentId = null) {
  const checkoutData = getCheckoutData();
  const cart = pfGetCart();
  const totals = pfCalculateCartTotals();

  const order = {
    orderNumber: generateOrderNumber(),
    date: new Date().toISOString(),
    customer: checkoutData.customer,
    shipping: checkoutData.shipping,
    shippingMethod: checkoutData.shippingMethod,
    paymentMethod: paymentMethod,
    gatewayPaymentId: gatewayPaymentId, // present only for real Razorpay payments
    items: cart.map((item) => {
      const product = pfGetProductById(item.productId);
      return {
        productId: item.productId,
        name: product ? product.name : "Unknown product",
        size: item.size,
        quantity: item.quantity,
        price: product ? product.price : 0,
      };
    }),
    totals,
    estimatedDelivery: estimateDeliveryDate(checkoutData.shippingMethod),
    status: "confirmed",
  };

  const existingOrders = JSON.parse(localStorage.getItem(PF_ORDERS_KEY) || "[]");
  existingOrders.unshift(order);
  localStorage.setItem(PF_ORDERS_KEY, JSON.stringify(existingOrders));
  localStorage.setItem(PF_LAST_ORDER_KEY, JSON.stringify(order));

  clearCart();
  localStorage.removeItem(PF_CHECKOUT_KEY);

  window.location.href = "order-success.html";
}

/**
 * Opens the REAL Razorpay Checkout widget in TEST MODE. If the payment
 * succeeds (with Razorpay's test cards/UPI IDs), this is a genuine
 * gateway transaction — just settling fake test-mode money instead of
 * real money. The `handler` callback only fires on real success.
 */
function openRazorpayCheckout(buttons) {
  if (typeof Razorpay === "undefined") {
    showToast("Payment gateway failed to load. Check your connection.", "error");
    resetButtons(buttons);
    return;
  }

  const checkoutData = getCheckoutData();
  const totals = pfCalculateCartTotals();
  const amountInPaise = Math.round(totals.total * 100);

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amountInPaise,
    currency: "INR",
    name: "Penguin's Fragrance",
    description: `Order payment — ${pfGetCart().length} item(s)`,
    prefill: {
      name: checkoutData.customer.fullName,
      email: checkoutData.customer.email,
      contact: checkoutData.customer.phone,
    },
    theme: { color: "#000000" },
    handler: function (response) {
      // Real success callback from Razorpay — only reached if the
      // test-mode payment actually completed.
      completeOrder(paymentState.method, response.razorpay_payment_id);
    },
    modal: {
      ondismiss: function () {
        showToast("Payment cancelled.", "error");
        resetButtons(buttons);
      },
    },
  };

  const rzp = new Razorpay(options);

  rzp.on("payment.failed", function (response) {
    showToast("Payment failed: " + response.error.description, "error");
    resetButtons(buttons);
  });

  rzp.open();
}

function resetButtons(buttons) {
  buttons.forEach((btn) => {
    btn.classList.remove("is-loading");
    btn.disabled = false;
  });
}

/* ------------------------------------------------------------------
   ORDER NUMBER / DELIVERY ESTIMATE HELPERS
   ------------------------------------------------------------------ */

function generateOrderNumber() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PF-${random}`;
}

function estimateDeliveryDate(shippingMethod) {
  const daysToAdd = shippingMethod === "express" ? 3 : 7;
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Handles the "Place Order" click. Cash on Delivery has no gateway to
 * contact, so it keeps the simple simulated-delay flow. Every other
 * method opens the REAL Razorpay Checkout widget (test mode) — unless
 * the Key ID at the top of this file is still the placeholder, in
 * which case it safely falls back to the same simulation so the demo
 * never breaks before you've configured a key.
 */
function processDemoPayment() {
  const buttons = [
    document.getElementById("placeOrderBtn"),
    document.getElementById("placeOrderBtnMobile"),
  ].filter(Boolean);
  const checkoutData = getCheckoutData();
  const cart = pfGetCart();

  if (!checkoutData || cart.length === 0) {
    showToast("Something went wrong. Please restart checkout.", "error");
    window.location.href = "cart.html";
    return;
  }

  if (!validatePaymentMethod()) return;

  buttons.forEach((btn) => {
    btn.classList.add("is-loading");
    btn.disabled = true;
  });

  const keyIsConfigured = RAZORPAY_KEY_ID && !RAZORPAY_KEY_ID.includes("REPLACE_WITH");

  if (paymentState.method === "cod") {
    // No gateway involved for Cash on Delivery — simulate brief
    // processing, then finalize the order.
    setTimeout(() => completeOrder("cod"), 1400);
    return;
  }

  if (!keyIsConfigured) {
    showToast(
      "Razorpay key not configured yet — showing demo simulation instead. See js/payment.js.",
      "error"
    );
    setTimeout(() => completeOrder(paymentState.method), 1400);
    return;
  }

  // Real Razorpay TEST-mode checkout opens here.
  openRazorpayCheckout(buttons);
}

/* ------------------------------------------------------------------
   INIT
   ------------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  const checkoutData = getCheckoutData();

  if (!checkoutData || pfGetCart().length === 0) {
    const notice = document.getElementById("paymentEmptyNotice");
    const formSection = document.getElementById("paymentFormSection");
    if (notice) notice.hidden = false;
    if (formSection) formSection.hidden = true;
    return;
  }

  renderPaymentSummary();
  initPaymentMethodSelector();
  initCardInputFormatting();

  const desktopBtn = document.getElementById("placeOrderBtn");
  if (desktopBtn) desktopBtn.addEventListener("click", processDemoPayment);
});
