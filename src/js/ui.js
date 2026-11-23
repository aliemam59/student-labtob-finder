
import { getFavorites, getTheme, saveTheme, toggleFavorite } from "./storage.js";

export const formatPrice = (amount) => `$${Number(amount).toLocaleString("en-US")}`;


export const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");


export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.textContent = theme === "performance" ? "Battery Saver Mode" : "Performance Mode";
    btn.setAttribute("aria-pressed", String(theme === "performance"));
  }
}

export function initLayout(activePage) {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");

  const links = [
    { href: "index.html", label: "Home", key: "home" },
    { href: "laptops.html", label: "Catalogue", key: "laptops" },
    { href: "favorites.html", label: "Favorites", key: "favorites" },
    { href: "compare.html", label: "Compare", key: "compare" },
  ];

  const navLinksHtml = links
    .map((link) => {
      const isActive = link.key === activePage;
      const activeClass = isActive
        ? "text-accent font-bold"
        : "text-text hover:text-accent";
      return `<a href="${link.href}" ${isActive ? 'aria-current="page"' : ""} class="block rounded-md px-3 py-2 text-sm transition ${activeClass}">${link.label}</a>`;
    })
    .join("");

  if (header) {
    header.innerHTML = `
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between gap-4">
          <a href="index.html" class="text-lg font-bold tracking-tight text-accent">Laptop</a>
          <nav class="hidden md:flex md:items-center md:gap-2" aria-label="Main navigation">
            ${navLinksHtml}
          </nav>
          <div class="flex items-center gap-2">
            <button id="theme-toggle" type="button" class="btn-secondary text-xs sm:text-sm"></button>
            <button id="mobile-menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu" class="btn-secondary md:hidden px-3 py-2">
              Menu
            </button>
          </div>
        </div>
        <nav id="mobile-menu" class="hidden border-t border-border py-3 md:hidden" aria-label="Mobile navigation">
          ${navLinksHtml}
        </nav>
      </div>
    `;
  }

  if (footer) {
    footer.innerHTML = `
      <div class="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted sm:px-6 lg:px-8">
        find your laptop
      </div>
    `;
  }

  applyTheme(getTheme());

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = getTheme() === "performance" ? "battery" : "performance";
      saveTheme(next);
      applyTheme(next);
    });
  }

  const mobileBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () => {
      const isHidden = mobileMenu.classList.toggle("hidden");
      mobileBtn.setAttribute("aria-expanded", String(!isHidden));
    });

    // Reset the menu when the window grows to desktop width.
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) {
        mobileMenu.classList.add("hidden");
        mobileBtn.setAttribute("aria-expanded", "false");
      }
    });
  }
}

/* ---------- Loading, error, and empty states ---------- */

export function renderSkeletonCards(container, count = 6) {
  container.innerHTML = Array.from({ length: count })
    .map(
      () => `
      <div class="laptop-card animate-pulse">
        <div class="h-44 w-full bg-border"></div>
        <div class="p-4 space-y-3">
          <div class="h-4 w-1/3 rounded bg-border"></div>
          <div class="h-5 w-2/3 rounded bg-border"></div>
          <div class="h-4 w-1/2 rounded bg-border"></div>
          <div class="mt-4 flex gap-2">
            <div class="h-9 flex-1 rounded-lg bg-border"></div>
            <div class="h-9 flex-1 rounded-lg bg-border"></div>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

export const showError = (box, message) => {
  if (!box) return;
  box.textContent = message;
  box.classList.remove("hidden");
};

export const hideError = (box) => {
  if (!box) return;
  box.textContent = "";
  box.classList.add("hidden");
};

// Message shown inside a grid when there is nothing to display.
export const renderEmptyState = (container, title, text) => {
  container.innerHTML = `
    <div class="col-span-full rounded-xl border border-dashed border-border bg-surface p-8 text-center">
      <p class="text-lg font-bold">${escapeHtml(title)}</p>
      <p class="mt-1 text-sm text-muted">${escapeHtml(text)}</p>
    </div>
  `;
};


// Small statistic box (label + big value), used on the home and favorites pages.
export const renderStatCard = (label, value) => `
  <div class="rounded-xl border border-border bg-surface p-5 shadow-sm">
    <p class="text-xs font-semibold uppercase text-muted">${escapeHtml(label)}</p>
    <p class="mt-2 text-3xl font-extrabold text-accent">${escapeHtml(value)}</p>
  </div>
`;




// options.removeMode: the favorite button says "Remove" instead of Save/Saved.
export function renderLaptopCard(laptop, options = {}) {
  const isSaved = getFavorites().includes(laptop.id);
  const favLabel = options.removeMode
    ? "Remove"
    : isSaved
      ? "Saved ★"
      : "Save ☆";
  // Saved gets an accent border so it never looks identical to the Details button.
  const favClass = isSaved && !options.removeMode
    ? "btn-secondary border-accent text-accent"
    : "btn-secondary";

  return `
    <article class="laptop-card">
      <img src="${escapeHtml(laptop.image)}" alt="${escapeHtml(laptop.brand)} ${escapeHtml(laptop.name)}" loading="lazy" class="h-44 w-full object-cover bg-bg">
      <div class="flex flex-1 flex-col p-4">
        <div class="flex items-center justify-between gap-2 text-xs font-semibold uppercase text-muted">
          <span>${escapeHtml(laptop.brand)}</span>
          <span class="rounded-full bg-highlight px-2 py-0.5 text-accent">${escapeHtml(laptop.category)}</span>
        </div>
        <h2 class="mt-1 text-lg font-bold">${escapeHtml(laptop.name)}</h2>
        <p class="mt-1 text-xl font-extrabold text-accent">${formatPrice(laptop.price)}</p>
        <ul class="mt-3 grid grid-cols-2 gap-1 text-xs text-muted">
          <li>RAM: <strong class="text-text">${laptop.ramGB} GB</strong></li>
          <li>Storage: <strong class="text-text">${laptop.storageGB} GB</strong></li>
          <li>Battery: <strong class="text-text">${laptop.batteryHours} hrs</strong></li>
          <li>Weight: <strong class="text-text">${laptop.weightKg} kg</strong></li>
        </ul>
        <div class="mt-auto flex gap-2 pt-4">
          <a href="details.html?id=${laptop.id}" class="btn-action flex-1 text-center">Details</a>
          <button type="button" data-fav-id="${laptop.id}" aria-pressed="${isSaved}" class="${favClass} flex-1">
            ${favLabel}
          </button>
        </div>
      </div>
    </article>
  `;
}

// One delegated click listener for every favorite button inside a container.
// Call it once per page; onChange(id, nowSaved) lets the page react (re-render, update totals).
export function setupFavoriteButtons(container, onChange) {
  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-fav-id]");
    if (!button) return;
    const id = Number(button.dataset.favId);
    const nowSaved = toggleFavorite(id);
    if (onChange) onChange(id, nowSaved);
  });
}
