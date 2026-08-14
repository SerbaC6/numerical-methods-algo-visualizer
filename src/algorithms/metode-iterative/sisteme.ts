/**
 * Sistemele gata alese ale paginii 5.
 *
 * **Amândouă sunt din curs** —
 * `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §10, problemele 3
 * și 4 —, fiindcă regula proiectului cere ca exemplele să vină de acolo, nu din
 * cap. Sunt și cele două cazuri de care are nevoie pagina, exact în ordinea în
 * care trebuie citite:
 *
 * 1. **Sistemul pe care merg amândouă**, cu `ρ(Jacobi) = 0,6072` și
 *    `ρ(Gauss-Seidel) = 0,4082`: măsurat de la `x⁰ = 0`, la toleranța `10⁻⁸`,
 *    ies **33** de iterații Jacobi și **23** Gauss-Seidel.
 *
 *    Atenție la etichetă: diagonala domină **strict** doar pe liniile 1 și 3, pe
 *    a doua fiind egalitate (`|4| = |1| + |3|`). Deci sistemul **nu** îndeplinește
 *    condiția suficientă de convergență — și converge oricum. E chiar dovada că
 *    dominanța diagonală e suficientă, nu necesară, motiv pentru care butonul lui
 *    nu se numește „dominant diagonal".
 * 2. **Sistemul care blochează Jacobi.** Aici `ρ(Jacobi) = 1` exact — vectorul
 *    oscilează la nesfârșit între `(0, 0, 0)` și `(2, 2, 2)` —, în timp ce
 *    Gauss-Seidel ajunge la soluția `(1, 1, 1)` în **20** de iterații, cu
 *    `ρ = 0,3536`. E chiar problema 4 din curs, care cere să se stabilească
 *    convergența și razele spectrale.
 *
 * Toate cifrele de mai sus sunt verificate în
 * `scripts/verificare-algoritmi/metode-iterative.ts`, pe modulele reale.
 */

export type ValoriSistem = {
  a11: number;
  a12: number;
  a13: number;
  a21: number;
  a22: number;
  a23: number;
  a31: number;
  a32: number;
  a33: number;
  b1: number;
  b2: number;
  b3: number;
  x01: number;
  x02: number;
  x03: number;
  omega: number;
  tol: number;
  maxIteratii: number;
};

/** Problema 3 din §10: `10x₁ − 5x₂ + x₃ = 1`, `x₁ + 4x₂ + 3x₃ = 4`, `4x₁ − 3x₂ − 9x₃ = 6`. */
const DOMINANT: ValoriSistem = {
  a11: 10,
  a12: -5,
  a13: 1,
  a21: 1,
  a22: 4,
  a23: 3,
  a31: 4,
  a32: -3,
  a33: -9,
  b1: 1,
  b2: 4,
  b3: 6,
  x01: 0,
  x02: 0,
  x03: 0,
  omega: 1,
  tol: 1e-8,
  maxIteratii: 60,
};

/** Problema 4 din §10: `2x + y + z = 4`, `x + 2y + z = 4`, `x + y + 2z = 4`. */
const JACOBI_BLOCAT: ValoriSistem = {
  a11: 2,
  a12: 1,
  a13: 1,
  a21: 1,
  a22: 2,
  a23: 1,
  a31: 1,
  a32: 1,
  a33: 2,
  b1: 4,
  b2: 4,
  b3: 4,
  x01: 0,
  x02: 0,
  x03: 0,
  omega: 1,
  tol: 1e-8,
  maxIteratii: 60,
};

/**
 * Primul sistem, cu liniile 1 și 2 schimbate între ele.
 *
 * **Nu e un exemplu nou**: sunt exact aceleași trei ecuații, scrise în altă
 * ordine, deci soluția e neschimbată — `(0,845178; 1,342640; −0,738579)`. Doar
 * că acum diagonala are `1`, `−5`, `−9` în loc de `10`, `4`, `−9`, dominanța
 * diagonală se pierde, iar amândouă metodele **diverg**: `ρ(Jacobi) = 3,0709`
 * și `ρ(Gauss-Seidel) = 7,3516`.
 *
 * E cel mai scurt drum către ideea că metodele iterative nu depind doar de
 * sistem, ci de **felul în care e scris**.
 */
const ALTA_ORDINE: ValoriSistem = {
  a11: 1,
  a12: 4,
  a13: 3,
  a21: 10,
  a22: -5,
  a23: 1,
  a31: 4,
  a32: -3,
  a33: -9,
  b1: 4,
  b2: 1,
  b3: 6,
  x01: 0,
  x02: 0,
  x03: 0,
  omega: 1,
  tol: 1e-8,
  maxIteratii: 60,
};

/**
 * Sistemul cu care pornește pagina.
 *
 * E cel dominant diagonal, nu cel care blochează Jacobi: prima privire trebuie
 * să arate metoda **funcționând**. Cazul în care se blochează e la un buton
 * distanță și rămâne cu atât mai izbitor.
 */
export const SISTEM_IMPLICIT: ValoriSistem = DOMINANT;

export const SISTEME: readonly { id: string; eticheta: string; valori: ValoriSistem }[] = [
  { id: "dominant", eticheta: "Amândouă converg", valori: DOMINANT },
  { id: "blocat", eticheta: "Jacobi se blochează", valori: JACOBI_BLOCAT },
  { id: "alta-ordine", eticheta: "Aceleași ecuații, altă ordine", valori: ALTA_ORDINE },
] as const;
