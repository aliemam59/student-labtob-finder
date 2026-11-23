import { fetchLaptops, getLaptopsByIds } from "./api.js";
import {
  MAX_COMPARE,
  getCompareIds,
  getFavorites,
  saveCompareIds,
  toggleCompare,
} from "./storage.js";
import { escapeHtml, hideError, initLayout, showError } from "./ui.js";
import { COMPARE_ROWS, getBestValues, isBestValue } from "./compare.js";

initLayout("compare");

const selectorBox = document.getElementById("compare-selector");
const tableWrapper = document.getElementById("compare-table-wrapper");
const errorBox = document.getElementById("compare-error");
const noticeBox = document.getElementById("compare-notice");

let favoriteLaptops = [];
let selectedIds = [];

function showNotice(message) {
  if (!message) {
    noticeBox.classList.add("hidden");
    noticeBox.textContent = "";
    return;
  }
  noticeBox.textContent = message;
  noticeBox.classList.remove("hidden");
}

function renderSelector() {
  if (favoriteLaptops.length === 0) {
    selectorBox.innerHTML = `
      <p class="text-sm font-semibold">No favorites available to compare.</p>
      <p class="mt-1 text-sm text-muted">Save at least two laptops to your favorites first.</p>
      <a href="laptops.html" class="btn-action mt-4">Browse Catalogue</a>
    `;
    return;
  }

  selectorBox.innerHTML = `
    <p class="text-sm font-semibold">Choose 2 to ${MAX_COMPARE} favorites (${selectedIds.length}/${MAX_COMPARE} selected):</p>
    <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      ${favoriteLaptops
        .map((laptop) => {
          const checked = selectedIds.includes(laptop.id);
          return `
            <label class="flex items-center gap-3 rounded-lg border ${checked ? "border-accent bg-highlight" : "border-border bg-bg"} p-3 cursor-pointer transition duration-200 hover:border-accent">
              <input type="checkbox" value="${laptop.id}" ${checked ? "checked" : ""} class="rounded border-border text-accent focus:ring-accent">
              <span class="text-sm font-medium">${escapeHtml(laptop.brand)} ${escapeHtml(laptop.name)}</span>
            </label>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderComparisonTable() {
  const chosen = getLaptopsByIds(favoriteLaptops, selectedIds);

  if (chosen.length < 2) {
    tableWrapper.innerHTML = `
      <div class="p-8 text-center text-sm text-muted">
        Select at least 2 favorite laptops above to view the side-by-side comparison.
      </div>
    `;
    return;
  }

  const bestValues = getBestValues(chosen);

  const headerCols = chosen
    .map(
      (laptop) => `
      <th scope="col" class="min-w-44 border-b border-border px-4 py-4 text-left align-top">
        <img src="${escapeHtml(laptop.image)}" alt="${escapeHtml(laptop.name)}" loading="lazy" class="h-24 w-full rounded-lg object-cover bg-bg">
        <p class="mt-2 text-sm font-bold">${escapeHtml(laptop.name)}</p>
        <a href="details.html?id=${laptop.id}" class="text-xs font-semibold text-accent hover:underline">View Details</a>
      </th>
    `
    )
    .join("");

  const bodyRows = COMPARE_ROWS.map((row) => {
    const cells = chosen
      .map((laptop) => {
        const value = laptop[row.key];
        const isBest = isBestValue(bestValues, row.key, value);
        return `
          <td class="border-b border-border px-4 py-3 text-sm ${isBest ? "bg-highlight font-bold text-accent" : "text-text"}">
            ${escapeHtml(row.format(value))}${isBest ? " ★" : ""}
          </td>
        `;
      })
      .join("");

    return `
      <tr>
        <th scope="row" class="border-b border-border bg-bg px-4 py-3 text-left text-sm font-semibold text-muted">${row.label}</th>
        ${cells}
      </tr>
    `;
  }).join("");

  tableWrapper.innerHTML = `
    <table class="w-full min-w-[600px] border-collapse">
      <thead>
        <tr>
          <th scope="col" class="w-36 border-b border-border bg-bg px-4 py-4 text-left text-xs font-semibold uppercase text-muted">Specification</th>
          ${headerCols}
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;
}

selectorBox.addEventListener("change", (event) => {
  const checkbox = event.target;
  if (checkbox.type !== "checkbox") return;

  const id = Number(checkbox.value);
  showNotice("");

  const result = toggleCompare(id);
  if (result.blocked) {
    checkbox.checked = false;
    showNotice(`You can compare a maximum of ${MAX_COMPARE} laptops at once. Uncheck one to select another.`);
    return;
  }

  selectedIds = getCompareIds();
  renderSelector();
  renderComparisonTable();

  selectorBox.querySelector(`input[value="${id}"]`)?.focus();
});

async function initCompare() {
  tableWrapper.innerHTML = `<div class="p-8 text-center text-sm text-muted">Loading laptops...</div>`;

  try {
    const allLaptops = await fetchLaptops();
    favoriteLaptops = getLaptopsByIds(allLaptops, getFavorites());
    hideError(errorBox);

    selectedIds = getCompareIds();

    if (selectedIds.length === 0 && favoriteLaptops.length > 0) {
      selectedIds = favoriteLaptops.slice(0, MAX_COMPARE).map((laptop) => laptop.id);
      saveCompareIds(selectedIds);
    }

    renderSelector();
    renderComparisonTable();
  } catch (error) {
    tableWrapper.innerHTML = "";
    showError(errorBox, error.message);
  }
}

initCompare();