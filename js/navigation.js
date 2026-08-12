/* ==========================================================================
   PENGUIN'S FRAGRANCE — NAVIGATION.JS
   Handles: sticky header scroll state, active nav link detection,
   search overlay auto-focus, and keeping the header's cart/wishlist
   icon counters in sync with localStorage (updated by cart.js / wishlist.js
   whenever items change — this file only READS and renders the count).
   ========================================================================== */

(function () {
  "use strict";

  const HEADER_SCROLL_THRESHOLD = 40;

  /**
   * Toggles solid background on the sticky header once the user scrolls
   * past the hero. Pages without a hero should add "header-solid" directly
   * in the markup and this still works safely alongside it.
   */
  function initHeaderScrollState() {
    const header = document.getElementById("siteHeader");
    if (!header) return;

    const onScroll = () => {
      if (window.scrollY > HEADER_SCROLL_THRESHOLD) {
        header.classList.add("header-scrolled");
      } else {
        header.classList.remove("header-scrolled");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // set correct state on load (e.g. mid-scroll page refresh)
  }

  /**
   * Marks the nav link matching the current page as active, for both the
   * desktop nav and the mobile offcanvas menu. Matches by filename so this
   * works regardless of the deploy subpath.
   */
  function initActiveNavLink() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    const links = document.querySelectorAll(
      ".site-header__link, .offcanvas-brand__link"
    );

    links.forEach((link) => {
      const linkPage = link.getAttribute("href");
      if (!linkPage) return;

      link.classList.remove("active");
      if (linkPage === currentPage) {
        link.classList.add("active");
      }
    });
  }

  /**
   * Auto-focuses the search input when the search offcanvas opens, and
   * clears it when closed, so it's always fresh on next open.
   */
  function initSearchOverlay() {
    const searchOverlayEl = document.getElementById("searchOverlay");
    const searchInput = document.getElementById("globalSearchInput");
    if (!searchOverlayEl || !searchInput) return;

    searchOverlayEl.addEventListener("shown.bs.offcanvas", () => {
      searchInput.focus();
    });

    searchOverlayEl.addEventListener("hidden.bs.offcanvas", () => {
      searchInput.value = "";
      const suggestions = document.getElementById("searchSuggestions");
      if (suggestions) suggestions.innerHTML = "";
    });

    // Enter key -> go to search results page with query string
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && searchInput.value.trim()) {
        window.location.href =
          "search.html?q=" + encodeURIComponent(searchInput.value.trim());
      }
    });
  }

  /**
   * Reads cart/wishlist counts from localStorage (written by cart.js /
   * wishlist.js) and updates the header badge counters. Safe to call
   * repeatedly — cart.js and wishlist.js should call
   * window.PenguinNav.refreshCounters() after any change so the header
   * updates instantly without a page reload.
   */
  function refreshCounters() {
    const cartCountEl = document.getElementById("cartCount");
    const wishlistCountEl = document.getElementById("wishlistCount");

    try {
      const cart = JSON.parse(localStorage.getItem("pf_cart") || "[]");
      const cartTotalItems = cart.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0
      );

      if (cartCountEl) {
        if (cartTotalItems > 0) {
          cartCountEl.textContent = cartTotalItems;
          cartCountEl.hidden = false;
        } else {
          cartCountEl.hidden = true;
        }
      }
    } catch (err) {
      console.warn("Penguin's Fragrance: could not read cart from storage", err);
    }

    try {
      const wishlist = JSON.parse(localStorage.getItem("pf_wishlist") || "[]");

      if (wishlistCountEl) {
        if (wishlist.length > 0) {
          wishlistCountEl.textContent = wishlist.length;
          wishlistCountEl.hidden = false;
        } else {
          wishlistCountEl.hidden = true;
        }
      }
    } catch (err) {
      console.warn("Penguin's Fragrance: could not read wishlist from storage", err);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeaderScrollState();
    initActiveNavLink();
    initSearchOverlay();
    refreshCounters();
  });

  // Expose a small public API so cart.js / wishlist.js can trigger an
  // immediate header refresh after add/remove actions.
  window.PenguinNav = {
    refreshCounters,
  };
})();
