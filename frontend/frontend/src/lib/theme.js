const THEME_KEY = "theme";

export function getTheme() {
  const t = localStorage.getItem(THEME_KEY);
  return t === "dark" ? "dark" : "light";
}

export function setTheme(theme) {
  const t = theme === "dark" ? "dark" : "light";
  localStorage.setItem(THEME_KEY, t);
  const root = document.documentElement;
  if (t === "dark") {
    root.classList.add("dark");
    document.body?.classList?.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    document.body?.classList?.remove("dark");
    root.style.colorScheme = "light";
  }
}

export function initTheme() {
  setTheme(getTheme());
}

