
import { fetchLaptops } from "./api.js";
import {
  hideError,
  initLayout,
  renderEmptyState,
  renderLaptopCard,
  renderSkeletonCards,
  setupFavoriteButtons,
  showError,
} from "./ui.js";

initLayout("laptops");

const grid = document.getElementById("laptop-grid");
const resultCount = document.getElementById("result-count");
const errorBox = document.getElementById("catalogue-error");
const searchInput = document.getElementById("search-input");
const categorySelect = document.getElementById("category-filter");
const maxPriceInput = document.getElementById("max-price");
const minRamSelect = document.getElementById("min-ram");
const sortSelect = document.getElementById("sort-select");
const resetButton = document.getElementById("reset-filters");

let allLaptops = [];


const getFilters = () => ({
  search: searchInput.value.trim().toLowerCase(),
  category: categorySelect.value,
  maxPrice: maxPriceInput.value === "" ? Infinity : Number(maxPriceInput.value),
  minRam: Number(minRamSelect.value),
  sort: sortSelect.value,
});

const SORTS = {
  "price-asc": { field: "price", direction: 1 },
  "price-desc": { field: "price", direction: -1 },
  "battery-asc": { field: "batteryHours", direction: 1 },
  "battery-desc": { field: "batteryHours", direction: -1 },
  "weight-asc": { field: "weightKg", direction: 1 },
  "weight-desc": { field: "weightKg", direction: -1 },
};

const applyFilters = (laptops, filters) => {
  const filtered = laptops.filter((laptop) => {
    const matchesSearch =
      laptop.name.toLowerCase().includes(filters.search) ||
      laptop.brand.toLowerCase().includes(filters.search);
    const matchesCategory =
      filters.category === "all" || laptop.category === filters.category;
    return (
      matchesSearch &&
      matchesCategory &&
      laptop.price <= filters.maxPrice &&
      laptop.ramGB >= filters.minRam
    );
  });

  const rule = SORTS[filters.sort];
  if (!rule) return filtered;
  return [...filtered].sort((a, b) => (a[rule.field] - b[rule.field]) * rule.direction);
};

function render() {
  const results = applyFilters(allLaptops, getFilters());

  resultCount.textContent = `${results.length} of ${allLaptops.length} laptops`;

  if (results.length === 0) {
    renderEmptyState(
      grid,
      "No laptops match your filters",
      "Try a different search, a higher maximum price, or reset the filters."
    );
    return;
  }

  grid.innerHTML = results.map((laptop) => renderLaptopCard(laptop)).join("");
}

function resetFilters() {
  searchInput.value = "";
  categorySelect.value = "all";
  maxPriceInput.value = "";
  minRamSelect.value = "0";
  sortSelect.value = "default";
  render();
}


[searchInput, categorySelect, maxPriceInput, minRamSelect, sortSelect].forEach((control) =>
  control.addEventListener("input", render)
);
resetButton.addEventListener("click", resetFilters);


setupFavoriteButtons(grid, render);

async function initCatalogue() {
  renderSkeletonCards(grid, 6);

  try {
    allLaptops = await fetchLaptops();
    hideError(errorBox);
    render();
  } catch (error) {
    grid.innerHTML = "";
    resultCount.textContent = "Laptops could not be loaded.";
    showError(errorBox, error.message);
  }
}

initCatalogue();