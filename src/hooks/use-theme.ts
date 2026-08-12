import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

/**
 * Tema site-ului. Implicit e cea luminoasă (fundal #F7F9FD); cea întunecată
 * (fundal #262B40) e la un clic distanță. Ambele folosesc paleta
 * „Sapphire nightfall whisper".
 *
 * Singurul lucru pe care îl scriem în `localStorage` este această preferință —
 * fără cookies, fără date personale, fără tracking (vezi Plan.md).
 */
const CHEIE = "mn-tema";

const listeners = new Set<() => void>();
let theme: Theme = "light";

function citesteDinStocare(): Theme {
  try {
    return localStorage.getItem(CHEIE) === "dark" ? "dark" : "light";
  } catch {
    // modul privat / stocare blocată — rămânem pe tema implicită
    return "light";
  }
}

function aplica(valoare: Theme) {
  const html = document.documentElement;
  html.classList.toggle("light", valoare === "light");
  html.classList.toggle("dark", valoare === "dark");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", valoare === "light" ? "#f7f9fd" : "#262b40");
}

/** Se apelează o dată, înainte de randare, ca să nu pâlpâie tema. */
export function initTheme() {
  theme = citesteDinStocare();
  aplica(theme);
}

export function setTheme(valoare: Theme) {
  theme = valoare;
  aplica(valoare);
  try {
    localStorage.setItem(CHEIE, valoare);
  } catch {
    // dacă nu putem scrie, tema rămâne activă doar pentru sesiunea curentă
  }
  for (const l of listeners) l();
}

export function toggleTheme() {
  setTheme(theme === "dark" ? "light" : "dark");
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    subscribe,
    () => theme,
    () => "light" as const,
  );
}
