/* ==========================================================================
   PENGUIN'S FRAGRANCE — SEARCH.JS
   Powers search.html. Reads the initial query from ?q=, then re-searches
   live as the user types (debounced), keeping the URL query string in
   sync via history.replaceState so the page is shareable/bookmarkable
   without a full reload on every keystroke.
   ========================================================================== */

(function () {
  "use strict";

  const DEBOUNCE_MS = 250;
  let debounceTimer = null;

  function getQueryFromUrl() {
    return new URLSearchParams(window.location.search).get("q") || "";
  }

  function updateUrlQuery(query) {
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set("q", query);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", url);
  }

  function runSearch(query) {
    const suggestedSearches = document.getElementById("suggestedSearches");
    const resultsCount = document.getElementById("searchResultsCount");
    const emptyState = document.getElementById("searchEmptyState");
    const grid = document.getElementById("searchResultsGrid");

    if (!query.trim()) {
      suggestedSearches.hidden = false;
      resultsCount.textContent = "";
      emptyState.hidden = true;
      grid.hidden = true;
      grid.innerHTML = "";
      return;
    }

    suggestedSearches.hidden = true;

    const results = pfSearchProducts(query);

    if (results.length === 0) {
      resultsCount.textContent = "";
      grid.hidden = true;
      grid.innerHTML = "";
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    grid.hidden = false;
    resultsCount.textContent = `${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`;
    pfRenderProductGrid("searchResultsGrid", results);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("searchPageInput");
    const initialQuery = getQueryFromUrl();

    input.value = initialQuery;
    runSearch(initialQuery);

    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = input.value.trim();
        updateUrlQuery(query);
        runSearch(query);
      }, DEBOUNCE_MS);
    });

    input.focus();
  });
})();
