import { formatPrice } from "./ui.js";

export const COMPARE_ROWS = [
  { label: "Brand", key: "brand", format: (v) => v },
  { label: "Category", key: "category", format: (v) => v },
  { label: "Price", key: "price", format: formatPrice, better: "lowest" },
  { label: "CPU", key: "cpu", format: (v) => v },
  { label: "RAM", key: "ramGB", format: (v) => `${v} GB`, better: "highest" },
  { label: "Storage", key: "storageGB", format: (v) => `${v} GB`, better: "highest" },
  { label: "Battery Life", key: "batteryHours", format: (v) => `${v} hrs`, better: "highest" },
  { label: "Weight", key: "weightKg", format: (v) => `${v} kg`, better: "lowest" },
  { label: "Screen", key: "screenInches", format: (v) => `${v}"` },
];

export const getBestValues = (laptops) =>
  COMPARE_ROWS.reduce((best, row) => {
    if (!row.better) return best;

    const values = laptops.map((laptop) => laptop[row.key]);
    if (new Set(values).size < 2) return best;

    best[row.key] = values.reduce((winner, value) =>
      row.better === "lowest" ? Math.min(winner, value) : Math.max(winner, value)
    );
    return best;
  }, {});

export const isBestValue = (bestValues, key, value) => bestValues[key] === value;