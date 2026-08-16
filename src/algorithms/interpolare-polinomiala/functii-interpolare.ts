/**
 * Funcțiile din care se iau nodurile interpolării.
 *
 * **Prima e din curs**: `f(x) = 1/(1 + 25x²)` pe `[−1, 1]` e chiar funcția lui
 * Runge din `cursuri_MN/interpolare_spline_bezier_teorie_curs09.md`, §8, cu
 * exemplul ei cu 5 și cu 11 puncte echidistante.
 *
 * Celelalte două **nu** sunt din curs, și nici nu pretind să fie: cursul dă un
 * singur exemplu numeric la capitolul ăsta. Sunt o alegere de afișare, ca
 * `pornireTangenta` din `functii.ts` — se schimbă **pe ce** se aplică metoda,
 * niciodată formula metodei. Fiecare e acolo pentru un motiv:
 *
 * 1. **Runge** — cazul care sparge așteptarea: cu noduri echidistante, mai
 *    multe puncte înseamnă oscilații mai mari, nu o aproximare mai bună;
 * 2. **sinusoida** — contraexemplul: pe ea creșterea gradului chiar ajută, deci
 *    fenomenul Runge nu e o lege a interpolării, ci al unei funcții anume;
 * 3. **polinomul de grad 5** — unicitatea din §2, făcută vizibilă: de la 6
 *    noduri în sus, polinomul de interpolare **e** funcția, iar eroarea cade la
 *    zero mașină și rămâne acolo.
 *
 * Derivatele sunt analitice fiindcă spline-ul tensionat din §12 le cere exact
 * în capete; o aproximare acolo ar strica tocmai condiția care îl deosebește de
 * cel natural.
 */

import type { Interval } from "@/algorithms/interpolare-polinomiala/tipuri";

export type FunctieInterpolata = {
  id: string;
  /** Cum se scrie în interfață. */
  eticheta: string;
  /** Aceeași funcție în LaTeX. */
  latex: string;
  f: (x: number) => number;
  /** Derivata analitică — o cere spline-ul tensionat, în cele două capete. */
  fPrim: (x: number) => number;
  /** Intervalul pe care se așază nodurile. */
  interval: Interval;
  /** Ce se vede pe funcția asta, într-o propoziție. */
  ceArata: string;
};

export const FUNCTII_INTERPOLATE: FunctieInterpolata[] = [
  {
    id: "runge",
    eticheta: "1 / (1 + 25x²)",
    latex: "f(x) = \\dfrac{1}{1 + 25x^2}",
    f: (x) => 1 / (1 + 25 * x * x),
    fPrim: (x) => (-50 * x) / (1 + 25 * x * x) ** 2,
    interval: [-1, 1],
    ceArata:
      "Cu noduri echidistante, polinomul oscilează tot mai tare spre capete pe măsură ce " +
      "crește gradul: la 11 noduri depășește valorile funcției, care nu trece de 1.",
  },
  {
    id: "sinusoida",
    eticheta: "sin(πx)",
    latex: "f(x) = \\sin(\\pi x)",
    f: (x) => Math.sin(Math.PI * x),
    fPrim: (x) => Math.PI * Math.cos(Math.PI * x),
    interval: [-1, 1],
    ceArata:
      "Aici creșterea gradului chiar ajută: oscilațiile de la capete nu apar, oricâte noduri " +
      "echidistante ai pune.",
  },
  {
    id: "polinom",
    eticheta: "x⁵ − 2x³",
    latex: "f(x) = x^5 - 2x^3",
    f: (x) => x ** 5 - 2 * x ** 3,
    fPrim: (x) => 5 * x ** 4 - 6 * x * x,
    interval: [-1, 1],
    ceArata:
      "De la 6 noduri în sus, polinomul de interpolare e chiar funcția: pe puncte distincte, " +
      "polinomul de grad cel mult n care trece prin ele e unic.",
  },
];

export function getFunctieInterpolata(id: string): FunctieInterpolata {
  return FUNCTII_INTERPOLATE.find((f) => f.id === id) ?? FUNCTII_INTERPOLATE[0]!;
}
