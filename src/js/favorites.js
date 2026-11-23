
import { fetchLaptops, getLaptopsByIds } from "./api.js";
import { clearFavorites, getFavorites } from "./storage.js";
import {
  formatPrice,
  hideError,
  initLayout,
  renderEmptyState,
  renderLaptopCard,
  renderSkeletonCards,
  renderStatCard,
  setupFavoriteButtons,
  showError,
} from "./ui.js";

initLayout("favorites");

const grid = document.getElementById("favorites-grid");
const summary = document.getElementById("favorites-summary");
const errorBox = document.getElementById("favorites-error");
const clearButton = document.getElementById("clear-favorites");

let allLaptops = [];


function render() {
  const favorites = getLaptopsByIds(allLaptops, getFavorites());

  const total = favorites.reduce((sum, laptop) => sum + laptop.price, 0);
  const average = favorites.length ? Math.round(total / favorites.length) : 0;

  summary.innerHTML = [
    renderStatCard("Saved laptops", favorites.length),
    renderStatCard("Total price", formatPrice(total)),
    renderStatCard("Average price", favorites.length ? formatPrice(average) : "—"),
  ].join("");

  clearButton.disabled = favorites.length === 0;
  clearButton.classList.toggle("opacity-50", favorites.length === 0);

  if (favorites.length === 0) {
    renderEmptyState(
      grid,
      "No favorites yet",
      "Open the catalogue and press Save on any laptop to build your shortlist."
    );
    return;
  }

  grid.innerHTML = favorites
    .map((laptop) => renderLaptopCard(laptop, { removeMode: true }))
    .join("");
}

clearButton.addEventListener("click", () => {
  if (window.confirm("Remove all saved laptops?")) {
    clearFavorites();
    render();
  }
});

setupFavoriteButtons(grid, render);

async function initFavorites() {
  renderSkeletonCards(grid, 3);

  try {
    allLaptops = await fetchLaptops();
    hideError(errorBox);
    render();
  } catch (error) {
    grid.innerHTML = "";
    showError(errorBox, error.message);
  }
}

initFavorites();