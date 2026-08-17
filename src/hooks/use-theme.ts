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

/**
 * Culoarea barelor de sistem ale browserului (bara de adresă de pe telefon).
 *
 * Sunt **exact** `--fundal` de pe fiecare temă, nu culorile brute din paletă:
 * pe cea întunecată fundalul e o derivată a nopții spre negru (#101320), iar
 * noaptea curată (#262B40) făcea bara vizibil mai deschisă decât pagina, adică
 * exact treapta care se vedea ca o dungă pe telefon.
 */
const CULOARE_BARA: Record<Theme, string> = { light: "#f7f9fd", dark: "#101320" };

function aplica(valoare: Theme) {
  const html = document.documentElement;
  html.classList.toggle("light", valoare === "light");
  html.classList.toggle("dark", valoare === "dark");
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.setAttribute("content", CULOARE_BARA[valoare]);
  }
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
