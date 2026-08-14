/**
 * Sistemul rezolvat pe pagina 3, cu cifrele lui derivate o singură dată.
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_directe_MN_curs4.md`, §4.3** —
 * exemplul rezolvat din curs, transcris literal. Nu e ales de noi: fiind chiar
 * exemplul predat, cifrele intermediare de pe ecran se pot compara rând cu rând
 * cu cele din curs.
 *
 * Tot ce se vede în clip (rapoartele `µ`, liniile de după fiecare operație,
 * soluția, determinantul) se citește de aici, nu se scrie de mână în componentă.
 */

import {
  determinantDinU,
  eliminareGaussiana,
  substitutieInapoi,
  type Matrice,
} from "@/algorithms/eliminare-gaussiana/eliminare";

/**
 * Matricea extinsă `[A|b]` a sistemului din curs:
 *
 * ```
 *  x₁ +  3x₂ +  x₃ =  9
 *  x₁ +   x₂ −  x₃ =  1
 * 3x₁ + 11x₂ + 8x₃ = 35
 * ```
 */
export const EXTINSA_DIN_CURS: Matrice = [
  [1, 3, 1, 9],
  [1, 1, -1, 1],
  [3, 11, 8, 35],
];

const { pasi, U } = eliminareGaussiana(EXTINSA_DIN_CURS);
const { x, pasi: pasiSubstitutie } = substitutieInapoi(U);

export const PASI_ELIMINARE = pasi;
export const U_DIN_CURS = U;
export const PASI_SUBSTITUTIE = pasiSubstitutie;
export const SOLUTIA_DIN_CURS = x;
export const DETERMINANT_DIN_CURS = determinantDinU(U);
