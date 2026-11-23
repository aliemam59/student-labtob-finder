const DATA_URL = "data/laptops.json";

const SIMULATED_DELAY_MS = 600;

const REQUIRED_FIELDS = [
  "id", "name", "brand", "price", "category", "cpu", "ramGB",
  "storageGB", "batteryHours", "weightKg", "screenInches", "image", "description",
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchLaptops() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load laptop data (HTTP ${response.status}).`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Laptop data format is invalid.");
    }

    const broken = data.find((laptop) =>
      REQUIRED_FIELDS.some((field) => laptop[field] === undefined)
    );
    if (broken) {
      throw new Error(`A laptop (id ${broken.id}) is missing a required field.`);
    }

    await wait(SIMULATED_DELAY_MS);
    return data;
  } catch (error) {
    throw new Error(
      `Could not load laptops. Make sure the site is running on a local server. (${error.message})`
    );
  }
}

export const findLaptopById = (laptops, id) =>
  laptops.find((laptop) => laptop.id === Number(id));

export const getLaptopsByIds = (laptops, ids) =>
  ids.map((id) => findLaptopById(laptops, id)).filter(Boolean);