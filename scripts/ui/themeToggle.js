const STORAGE_KEY = "jalanKeluar:theme";
const THEMES = new Set(["dark", "light"]);

let buttonRef = null;
let mediaQueryRef = null;
let currentTheme = "dark";
let hasStoredPreference = false;

function getStoredTheme() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value && THEMES.has(value)) {
      return value;
    }
  } catch (error) {
    console.warn("Gagal membaca preferensi tema dari penyimpanan.", error);
  }
  return null;
}

function persistTheme(theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.warn("Gagal menyimpan preferensi tema.", error);
  }
}

function getSystemTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function updateButton(theme) {
  if (!buttonRef) {
    return;
  }
  const isLight = theme === "light";
  buttonRef.setAttribute("aria-pressed", String(isLight));
  buttonRef.setAttribute("aria-label", isLight ? "Aktifkan mode gelap" : "Aktifkan mode terang");
  buttonRef.dataset.theme = theme;
  const icon = buttonRef.querySelector(".theme-toggle__icon");
  const label = buttonRef.querySelector(".theme-toggle__label");
  if (icon) {
    icon.textContent = isLight ? "☀️" : "🌙";
  }
  if (label) {
    label.textContent = isLight ? "Mode Terang" : "Mode Gelap";
  }
}

function applyTheme(theme, { persist = true } = {}) {
  if (!THEMES.has(theme)) {
    theme = "dark";
  }
  currentTheme = theme;
  document.documentElement.dataset.theme = theme;
  if (persist) {
    persistTheme(theme);
    hasStoredPreference = true;
  }
  updateButton(theme);
}

function handleButtonClick(event) {
  event?.preventDefault?.();
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme, { persist: true });
}

function handleSystemChange(event) {
  if (hasStoredPreference) {
    return;
  }
  const theme = event.matches ? "light" : "dark";
  applyTheme(theme, { persist: false });
}

export function initializeThemeToggle(button) {
  if (buttonRef) {
    buttonRef.removeEventListener("click", handleButtonClick);
  }
  buttonRef = button ?? null;

  const storedTheme = getStoredTheme();
  hasStoredPreference = storedTheme !== null;
  const initialTheme = storedTheme ?? getSystemTheme();
  applyTheme(initialTheme, { persist: false });

  if (buttonRef) {
    buttonRef.addEventListener("click", handleButtonClick);
    updateButton(initialTheme);
  }

  if (mediaQueryRef) {
    mediaQueryRef.removeEventListener("change", handleSystemChange);
  }
  if (window.matchMedia) {
    mediaQueryRef = window.matchMedia("(prefers-color-scheme: light)");
    mediaQueryRef.addEventListener("change", handleSystemChange);
  }
}

export function getCurrentTheme() {
  return currentTheme;
}
