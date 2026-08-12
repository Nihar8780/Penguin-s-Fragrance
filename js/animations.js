/* ==========================================================================
   PENGUIN'S FRAGRANCE — ANIMATIONS.JS
   Powers the scroll-reveal system defined in animations.css.

   Usage in any page's HTML:
     <section data-reveal>...</section>                    -> fades up once
     <div data-reveal-group>                                -> staggers children
       <div data-reveal>Card 1</div>
       <div data-reveal>Card 2</div>
     </div>

   No configuration needed elsewhere — this file finds every [data-reveal]
   element on the page automatically. Elements reveal once and stay
   visible (no re-hiding on scroll-away), which reads as more premium
   and less distracting than repeated flicker.
   ========================================================================== */

(function () {
  "use strict";

  function initScrollReveal() {
    // Mark the document as reveal-ready FIRST — this is what makes
    // animations.css start hiding [data-reveal] elements. If this
    // script never runs (blocked, errors, etc.), content simply stays
    // visible by default rather than getting stuck invisible.
    document.documentElement.classList.add("js-reveal-ready");

    const revealEls = document.querySelectorAll("[data-reveal]");
    if (revealEls.length === 0) return;

    // Assign stagger index to children within any [data-reveal-group]
    document.querySelectorAll("[data-reveal-group]").forEach((group) => {
      const children = group.querySelectorAll(":scope > [data-reveal]");
      children.forEach((child, index) => {
        child.style.setProperty("--pf-stagger-index", index);
      });
    });

    // Respect reduced-motion: reveal everything immediately, skip the
    // observer entirely.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // reveal once, not repeatedly
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  document.addEventListener("DOMContentLoaded", initScrollReveal);
})();
