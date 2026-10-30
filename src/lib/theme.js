/** Persisted theme preference. `system` follows `prefers-color-scheme`. */
export const THEME_STORAGE_KEY = "query-theme";

/** Browser chrome color. Keep in sync with the blocking script in `src/app.html`. */
export const THEME_META_COLOR = {
  light: "#fcfaf6",
  dark: "#14120f",
};

/**
 * @param {string | null | undefined} value
 * @returns {value is "system" | "light" | "dark"}
 */
export function isThemePreference(value) {
  return value === "system" || value === "light" || value === "dark";
}

/**
 * @param {"system" | "light" | "dark"} preference
 * @param {boolean} systemDark
 */
export function resolveDark(preference, systemDark) {
  if (preference === "dark") return true;
  if (preference === "light") return false;
  return Boolean(systemDark);
}

/** @returns {"system" | "light" | "dark"} */
export function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Apply a preference to the document. Safe to call repeatedly.
 * @param {"system" | "light" | "dark"} preference
 * @param {boolean} systemDark
 */
export function applyTheme(preference, systemDark) {
  const dark = resolveDark(preference, systemDark);
  const root = document.documentElement;
  root.dataset.theme = preference;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", dark ? THEME_META_COLOR.dark : THEME_META_COLOR.light);
  }
  window.dispatchEvent(
    new CustomEvent("themechange", { detail: { preference, dark } })
  );
  return dark;
}
