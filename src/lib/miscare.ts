/**
 * Duratele și curbele de mișcare, în forma cerută de `motion`.
 *
 * Aceleași trei trepte și aceleași patru curbe ca în `src/index.css`, doar
 * scrise altfel: CSS le vrea `250ms` și `cubic-bezier(…)`, `motion` le vrea
 * `0.25` (secunde) și un vector cu patru numere.
 *
 * **De ce sunt scrise de două ori.** Tokenii din `index.css` nu pot fi citiți
 * la momentul construirii: Tailwind generează din ei utilitare (`duration-mediu`)
 * la build, deci valorile trebuie să existe literal acolo. Iar a le citi din
 * DOM la fiecare animație ar însemna un `getComputedStyle` pe drumul cald.
 *
 * Dublarea e deci intenționată, dar **nu e lăsată nesupravegheată**:
 * `verificaMiscare()` compară cele două surse la pornire, în dezvoltare, și
 * strigă în consolă dacă se depărtează. Fără el, peste câteva luni ai `250ms`
 * în CSS și `0.3` aici, și nimeni n-ar observa că jumătate din site se mișcă
 * altfel decât cealaltă jumătate.
 */

/** Cele trei trepte de durată, în **secunde** — unitatea cerută de `motion`. */
export const DURATE = {
  /** hover, focus, apăsare */
  rapid: 0.15,
  /** apariții, schimbări de stare, pasul următor al unui algoritm */
  mediu: 0.25,
  /** tranziții de layout, panouri */
  lent: 0.4,
} as const;

/** Curbele, ca puncte de control Bézier — forma pe care o acceptă `motion`. */
export const CURBE = {
  standard: [0.4, 0, 0.2, 1],
  iesire: [0, 0, 0.2, 1],
  intrare: [0.4, 0, 1, 1],
  elastic: [0.34, 1.36, 0.64, 1],
} as const;

export type Treapta = keyof typeof DURATE;
export type Curba = keyof typeof CURBE;

/**
 * Tranziția gata făcută, de pus în `transition={…}` pe un element `motion`.
 *
 * Se folosește asta, nu numere scrise de mână: o durată inventată pe loc scapă
 * de sub cele trei trepte și de sub verificarea de mai jos.
 */
export function tranzitie(treapta: Treapta = "mediu", curba: Curba = "standard") {
  return { duration: DURATE[treapta], ease: CURBE[curba] };
}

/** `--duration-rapid` → `0.15`. Întoarce `null` dacă tokenul lipsește sau e scris altfel. */
function secundeDinCss(valoare: string): number | null {
  const text = valoare.trim();
  if (text.endsWith("ms")) {
    const n = Number.parseFloat(text.slice(0, -2));
    return Number.isFinite(n) ? n / 1000 : null;
  }
  if (text.endsWith("s")) {
    const n = Number.parseFloat(text.slice(0, -1));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** `cubic-bezier(0.4, 0, 0.2, 1)` → `[0.4, 0, 0.2, 1]`. */
function bezierDinCss(valoare: string): number[] | null {
  const potrivire = valoare.trim().match(/^cubic-bezier\(([^)]+)\)$/);
  if (!potrivire?.[1]) return null;
  const numere = potrivire[1].split(",").map((p) => Number.parseFloat(p));
  return numere.length === 4 && numere.every(Number.isFinite) ? numere : null;
}

/**
 * Compară valorile de mai sus cu tokenii din `index.css` și strigă dacă diferă.
 *
 * Se apelează o dată, din `main.tsx`, și **numai în dezvoltare** — în producție
 * n-are ce corecta, iar `getComputedStyle` pe rădăcină e muncă degeaba.
 */
export function verificaMiscare(): void {
  const stil = getComputedStyle(document.documentElement);
  const abateri: string[] = [];

  for (const [nume, secunde] of Object.entries(DURATE)) {
    const dinCss = secundeDinCss(stil.getPropertyValue(`--duration-${nume}`));
    if (dinCss === null) {
      abateri.push(`--duration-${nume} lipsește din CSS sau are o unitate neașteptată`);
    } else if (Math.abs(dinCss - secunde) > 1e-6) {
      abateri.push(`--duration-${nume}: CSS are ${dinCss}s, DURATE.${nume} are ${secunde}s`);
    }
  }

  for (const [nume, puncte] of Object.entries(CURBE)) {
    const dinCss = bezierDinCss(stil.getPropertyValue(`--ease-${nume}`));
    if (dinCss === null) {
      abateri.push(`--ease-${nume} lipsește din CSS sau nu e un cubic-bezier`);
    } else if (puncte.some((p, i) => Math.abs(p - (dinCss[i] ?? Number.NaN)) > 1e-6)) {
      abateri.push(
        `--ease-${nume}: CSS are [${dinCss.join(", ")}], CURBE.${nume} are [${puncte.join(", ")}]`,
      );
    }
  }

  if (abateri.length > 0) {
    console.error(
      "[mișcare] CSS-ul și `src/lib/miscare.ts` s-au desincronizat. Animațiile scrise " +
        "în CSS și cele scrise cu `motion` se vor mișca diferit:\n" +
        abateri.map((a) => `  • ${a}`).join("\n"),
    );
  }
}
