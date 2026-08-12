/* ==========================================================================
   PENGUIN'S FRAGRANCE — NOTIFICATIONS.JS
   Lightweight, dependency-free toast notifications (does not require
   Bootstrap's JS toast component — this is a simpler custom version
   that matches the Stitch visual language exactly).

   Usage from any script, on any page:
     showToast("Added to cart", "success");
     showToast("Invalid coupon code", "error");
     showToast("Item removed"); // defaults to "default" variant

   No markup required in HTML — the toast stack container is created
   automatically on first use and reused after that.
   ========================================================================== */

const PF_TOAST_DURATION_MS = 3200;

function pfEnsureToastStack() {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    stack.setAttribute("aria-live", "polite");
    stack.setAttribute("aria-atomic", "true");
    document.body.appendChild(stack);
  }
  return stack;
}

/**
 * Shows a toast notification.
 * @param {string} message
 * @param {"default"|"success"|"error"} variant
 */
function showToast(message, variant = "default") {
  if (!message) return;

  const stack = pfEnsureToastStack();

  const toast = document.createElement("div");
  toast.className = `toast-brand toast-brand--${variant}`;
  toast.setAttribute("role", variant === "error" ? "alert" : "status");

  const iconName =
    variant === "success" ? "check_circle" : variant === "error" ? "error" : "info";

  toast.innerHTML = `
    <span class="toast-brand__icon">
      <span class="material-symbols-outlined">${iconName}</span>
    </span>
    <span class="toast-brand__message"></span>
    <button type="button" class="toast-brand__close" aria-label="Dismiss notification">
      <span class="material-symbols-outlined" style="font-size:18px;">close</span>
    </button>
  `;

  // Set message via textContent (not innerHTML) so any product name or
  // user-entered text can never inject markup.
  toast.querySelector(".toast-brand__message").textContent = message;

  stack.appendChild(toast);

  // Trigger enter transition on next frame
  requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  const dismiss = () => {
    toast.classList.remove("is-visible");
    toast.addEventListener(
      "transitionend",
      () => {
        toast.remove();
      },
      { once: true }
    );
  };

  const timeoutId = setTimeout(dismiss, PF_TOAST_DURATION_MS);

  toast.querySelector(".toast-brand__close").addEventListener("click", () => {
    clearTimeout(timeoutId);
    dismiss();
  });
}

// Expose globally (this file loads as a plain script, not a module)
window.showToast = showToast;
