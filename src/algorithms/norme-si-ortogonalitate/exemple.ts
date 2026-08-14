/**
 * Matricele cu care lucrează pagina 2.
 *
 * **Amândouă sunt din curs** — `cursuri_MN/curs3_ortogonalitate.md`, §6.5 pentru
 * Householder și §7.4 pentru Givens —, fiindcă regula proiectului cere ca
 * exemplele să vină de acolo. Sunt și alese bine pentru desen: fiecare arată
 * exact ce deosebește metoda ei.
 *
 * - Pe matricea Householder, **primul pas anulează două elemente deodată**:
 *   `‖v‖ = 3` fix, `d = (5, 1, 2)`, iar `A₂` are prima coloană `(−3, 0, 0)`.
 * - Pe matricea Givens, primul element de anulat e chiar `a₁₁ = 0`, deci prima
 *   rotație e o **schimbare de linii curată** (`c = 0`, `s = −1`) — cel mai
 *   scurt drum către ideea că rotația nu „calculează", ci așază.
 *
 * Toate cifrele sunt verificate în `scripts/verificare-algoritmi/ortogonalitate.ts`.
 */

/** §6.5: `A = [[2,4,5],[1,−1,1],[2,1,−1]]`. */
export const MATRICE_HOUSEHOLDER: number[][] = [
  [2, 4, 5],
  [1, -1, 1],
  [2, 1, -1],
];

/** §7.4: `A = [[0,1,2],[3,2,0],[4,1,5]]`. */
export const MATRICE_GIVENS: number[][] = [
  [0, 1, 2],
  [3, 2, 0],
  [4, 1, 5],
];

/**
 * Vectorul cu care pornește interfața, în plan.
 *
 * E prima coloană a matricei Householder, tăiată la două dimensiuni: așa,
 * numărul de pe ecran (`‖v‖`, `d`) se regăsește în exemplul din teorie.
 */
export const VECTOR_IMPLICIT: readonly [number, number] = [2, 1];
