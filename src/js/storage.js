
const FAVORITES_KEY = "slf_favorites";
const COMPARE_KEY = "slf_compare";

const THEME_KEY = "laptopFinderTheme";

export const MAX_COMPARE = 4;


const readIds = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
};


const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the app keeps working without saving */
  }
};



export const getFavorites = () => readIds(FAVORITES_KEY);

export const saveFavorites = (ids) => writeJSON(FAVORITES_KEY, ids);

export const isFavorite = (id) => getFavorites().includes(Number(id));


export function toggleFavorite(id) {
  const numericId = Number(id);
  const current = getFavorites();
  const exists = current.includes(numericId);

  saveFavorites(
    exists
      ? current.filter((item) => item !== numericId)
      : [...current, numericId]
  );

 
  if (exists) {
    saveCompareIds(readIds(COMPARE_KEY).filter((item) => item !== numericId));
  }
  return !exists;
}

export function clearFavorites() {
  saveFavorites([]);
  saveCompareIds([]);
}



export const getCompareIds = () => {
  const favorites = getFavorites();
  return readIds(COMPARE_KEY).filter((id) => favorites.includes(id));
};

export const saveCompareIds = (ids) => writeJSON(COMPARE_KEY, ids);

export const isInCompare = (id) => getCompareIds().includes(Number(id));

export function toggleCompare(id) {
  const numericId = Number(id);
  const current = getCompareIds();

  if (current.includes(numericId)) {
    saveCompareIds(current.filter((item) => item !== numericId));
    return { selected: false, blocked: false };
  }

  if (current.length >= MAX_COMPARE) {
    return { selected: false, blocked: true };
  }


  if (!isFavorite(numericId)) {
    saveFavorites([...getFavorites(), numericId]);
  }
  saveCompareIds([...current, numericId]);
  return { selected: true, blocked: false };
}



export function getTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    const parsed = raw ? JSON.parse(raw) : "battery";
    return parsed === "performance" ? "performance" : "battery";
  } catch {
    return "battery";
  }
}

export function saveTheme(theme) {
  writeJSON(THEME_KEY, theme);
}