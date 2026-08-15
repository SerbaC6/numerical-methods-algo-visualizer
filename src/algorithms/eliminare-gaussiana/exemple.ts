/**
 * Sistemele pe care se pornește interfața de pivotare a paginii 3.
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_directe_MN_curs4.md`** — §5.1
 * (sistemul cu `0,001`), §5.3 (sistemul cu `10 000`), §4.3 (sistemul rezolvat),
 * §5.2 + §5.4 (matricea de aranjare). Toate patru sunt exemplele cursului, cu
 * cifrele lui; niciunul nu e inventat aici.
 *
 * **De ce astea patru și nu altele.** Fiecare arată exact un lucru pe care
 * celelalte nu-l pot arăta: primul, ce strică un pivot mic; al doilea, de ce nu
 * ajunge comparația între elemente brute; al treilea, cum arată metoda când
 * merge; al patrulea, singurul care cere o **permutare de coloane**, deci
 * singurul pe care pivotarea totală se desparte de celelalte două.
 *
 * Matricea rămâne editabilă în interfață: presetările sunt punctul de plecare,
 * nu tot ce se poate încerca.
 */

import type { Matrice } from "@/algorithms/eliminare-gaussiana/eliminare";

export type ExempluPivotare = {
  id: string;
  /** Numele din lista de presetări. Descrie ce se vede, nu de unde vine. */
  titlu: string;
  /** Matricea de lucru: coeficienții, plus coloana `b` dacă `areTermenLiber`. */
  matrice: Matrice;
  /** Câte coloane de la stânga sunt coeficienți. */
  coeficienti: number;
  /** Ce se învață din el — o propoziție, sub lista de presetări. */
  observatie: string;
};

export const EXEMPLE_PIVOTARE: ExempluPivotare[] = [
  {
    id: "pivot-mic",
    titlu: "Pivotul foarte mic",
    // §5.1: `[0,001 1; 1 1]·x = [1; 2]`, sistemul pe care µ = 1000 îl strică.
    matrice: [
      [0.001, 1, 1],
      [1, 1, 2],
    ],
    coeficienti: 2,
    observatie:
      "Fără permutare, µ iese 1000 și amplifică orice rotunjire; cu liniile schimbate, aceeași aritmetică dă un rezultat bun.",
  },
  {
    id: "ordine-diferite",
    titlu: "Coeficienți de ordine diferite",
    // §5.3: `[1 10000; 1 0,0001]·x = [10000; 1]`.
    matrice: [
      [1, 10000, 10000],
      [1, 0.0001, 1],
    ],
    coeficienti: 2,
    observatie:
      "Cele două candidate la pivot sunt amândouă 1, deci comparația brută n-are ce alege — abia raportul la linia proprie le desparte.",
  },
  {
    id: "sistem-rezolvat",
    titlu: "Sistemul rezolvat",
    // §4.3: sistemul din care iese soluția (−3, 4, 0).
    matrice: [
      [1, 3, 1, 9],
      [1, 1, -1, 1],
      [3, 11, 8, 35],
    ],
    coeficienti: 3,
    observatie:
      "Aici toate trei strategiile ajung la aceeași soluție; se vede doar prin ce drum diferit trec.",
  },
  {
    id: "aranjare",
    titlu: "Aranjarea, fără termen liber",
    // §5.2 și §5.4: matricea pe care cursul arată chiar permutările,
    // `[1 1 1; 1 1 2; 2 2 3]` → `[2 2 3; 1 1 2; 1 1 1]` → `[3 2 2; 2 1 1; 1 1 1]`.
    matrice: [
      [1, 1, 1],
      [1, 1, 2],
      [2, 2, 3],
    ],
    coeficienti: 3,
    observatie:
      "Singura pe care pivotarea totală schimbă și coloane. Matricea e singulară, deci eliminarea se oprește înainte de ultimul pivot.",
  },
];

export const EXEMPLU_IMPLICIT = EXEMPLE_PIVOTARE[2]!;
