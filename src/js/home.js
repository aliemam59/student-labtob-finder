import { fetchLaptops, getLaptopsByIds } from "./api.js";
import { getFavorites } from "./storage.js";
import { formatPrice, hideError, initLayout, renderStatCard, showError } from "./ui.js";

initLayout("home");

const statsGrid = document.getElementById("stats-grid");
const errorBox = document.getElementById("home-error");

async function initHome() {
  try {
    const laptops = await fetchLaptops();
    hideError(errorBox);

    const lowestPrice = laptops.reduce(
      (lowest, laptop) => Math.min(lowest, laptop.price),
      Infinity
    );


    const totalPrice = laptops.reduce((sum, laptop) => sum + laptop.price, 0);
    const averagePrice = laptops.length ? Math.round(totalPrice / laptops.length) : 0;


    const savedCount = getLaptopsByIds(laptops, getFavorites()).length;

    statsGrid.innerHTML = [
      renderStatCard("Laptops", laptops.length),
      renderStatCard("Lowest price", laptops.length ? formatPrice(lowestPrice) : "—"),
      renderStatCard("Average price", laptops.length ? formatPrice(averagePrice) : "—"),
      renderStatCard("Saved favorites", savedCount),
    ].join("");
  } catch (error) {
    statsGrid.innerHTML = "";
    showError(errorBox, error.message);
  }
}

initHome();