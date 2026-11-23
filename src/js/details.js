
import { fetchLaptops, findLaptopById } from "./api.js";
import {
  MAX_COMPARE,
  isFavorite,
  isInCompare,
  toggleCompare,
  toggleFavorite,
} from "./storage.js";
import { escapeHtml, formatPrice, hideError, initLayout, showError } from "./ui.js";
import { COMPARE_ROWS } from "./compare.js";

initLayout("laptops");

const container = document.getElementById("details-container");
const errorBox = document.getElementById("details-error");

let laptop = null;

function renderDetails(notice = "") {
  const saved = isFavorite(laptop.id);
  const inCompare = isInCompare(laptop.id);

  const specRows = COMPARE_ROWS.map(
    (row) => `
      <tr>
        <th scope="row" class="w-40 border-b border-border bg-bg px-4 py-3 text-left text-sm font-semibold text-muted">${row.label}</th>
        <td class="border-b border-border px-4 py-3 text-sm">${escapeHtml(row.format(laptop[row.key]))}</td>
      </tr>
    `
  ).join("");

  container.innerHTML = `
    <article class="grid grid-cols-1 gap-8 md:grid-cols-2">
      <img src="${escapeHtml(laptop.image)}" alt="${escapeHtml(laptop.brand)} ${escapeHtml(laptop.name)}" class="h-64 w-full rounded-xl border border-border bg-bg object-cover sm:h-80">

      <div class="flex flex-col">
        <div class="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
          <span>${escapeHtml(laptop.brand)}</span>
          <span class="rounded-full bg-highlight px-2 py-0.5 text-accent">${escapeHtml(laptop.category)}</span>
        </div>
        <h1 class="mt-2 text-2xl font-bold sm:text-3xl">${escapeHtml(laptop.name)}</h1>
        <p class="mt-2 text-3xl font-extrabold text-accent">${formatPrice(laptop.price)}</p>
        <p class="mt-4 text-sm leading-relaxed text-muted">${escapeHtml(laptop.description)}</p>

        <div class="mt-6 flex flex-wrap gap-3">
          <button type="button" id="fav-button" aria-pressed="${saved}" class="${saved ? "btn-secondary border-accent text-accent" : "btn-action"}">
            ${saved ? "Saved ★ (Remove)" : "Add to Favorites ☆"}
          </button>
          <button type="button" id="compare-button" aria-pressed="${inCompare}" class="btn-secondary ${inCompare ? "border-accent text-accent" : ""}">
            ${inCompare ? "Remove from Comparison" : "Add to Comparison"}
          </button>
        </div>
        <p id="details-notice" class="mt-3 text-sm font-medium text-accent ${notice ? "" : "hidden"}">${escapeHtml(notice)}</p>
      </div>
    </article>

    <section class="mt-8 overflow-x-auto rounded-xl border border-border bg-surface">
      <h2 class="border-b border-border px-4 py-3 text-lg font-bold">Full Specifications</h2>
      <table class="w-full border-collapse">
        <tbody>${specRows}</tbody>
      </table>
    </section>
  `;
}

container.addEventListener("click", (event) => {
  if (!laptop) return;

  if (event.target.closest("#fav-button")) {
    toggleFavorite(laptop.id);
    renderDetails();
    document.getElementById("fav-button")?.focus();
  }

  if (event.target.closest("#compare-button")) {
    const result = toggleCompare(laptop.id);
    renderDetails(
      result.blocked
        ? `You can compare up to ${MAX_COMPARE} laptops. Remove one on the Compare page first.`
        : result.selected
          ? "Added to comparison (and saved to favorites)."
          : ""
    );
    document.getElementById("compare-button")?.focus();
  }
});

async function initDetails() {
  const idParam = new URLSearchParams(window.location.search).get("id");
  const id = Number(idParam);

  if (!idParam || !Number.isInteger(id) || id <= 0) {
    showError(errorBox, "No laptop was selected. Please choose one from the catalogue.");
    return;
  }

  container.innerHTML = `<p class="text-sm text-muted">Loading laptop...</p>`;

  try {
    const laptops = await fetchLaptops();
    laptop = findLaptopById(laptops, id);

    if (!laptop) {
      container.innerHTML = "";
      showError(errorBox, `Sorry, there is no laptop with id ${id}. Please choose one from the catalogue.`);
      return;
    }

    hideError(errorBox);
    document.title = `${laptop.name} — Student Laptop Finder`;
    renderDetails();
  } catch (error) {
    container.innerHTML = "";
    showError(errorBox, error.message);
  }
}

initDetails();