/**
 * Metoda Neville: același polinom de interpolare, calculat prin recurență.
 *
 * **Sursă: `cursuri_MN/interpolare_spline_bezier_teorie_curs09.md`, §3** —
 * formularea din laborator, cea cu `P_ij`:
 *
 * ```
 * P_ii(x) = f(x_i)
 * P_ij(x) = [(x − x_j)/(x_i − x_j)]·P_{i,j−1}(x) + [(x_i − x)/(x_i − x_j)]·P_{i+1,j}(x)
 * ```
 *
 * S-a ales ea, dintre cele trei scrieri echivalente pe care le dă cursul
 * (`P_{σ+j+k}`, `Q_{i,j}` și asta), fiindcă e singura în care cele două ponderi
 * se adună la 1 — deci pasul **se vede** ca o interpolare liniară între două
 * rezultate parțiale, exact ce desenează pagina. Că sunt echivalente nu e o
 * presupunere: toate trei, plus codul OCTAVE din curs, sunt comparate în
 * `scripts/verificare-algoritmi/interpolare-polinomiala.ts`.
 *
 * Fără JSX și fără nimic din interfață.
 */

import type { Nod } from "@/algorithms/interpolare-polinomiala/tipuri";

/** O intrare din schema triunghiulară: polinomul `P_ij`, evaluat în `x`. */
export type IntrareNeville = {
  i: number;
  j: number;
  /** Gradul lui `P_ij`, adică `j − i`. E și nivelul din schemă. */
  grad: number;
  valoare: number;
};

export type SchemaNeville = {
  /** Punctul în care s-a evaluat toată schema. */
  x: number;
  /**
   * Triunghiul, pe niveluri: `niveluri[0]` sunt valorile din noduri (`P_ii`),
   * iar ultimul nivel are o singură intrare, `P_{0n}`.
   *
   * Pe niveluri, nu ca matrice `[i][j]` cu jumătate goală: nivelul e chiar
   * gradul polinoamelor din el, adică lucrul care se arată pe ecran.
   */
  niveluri: IntrareNeville[][];
  /** `P_{0n}(x)` — valoarea polinomului de interpolare prin toate nodurile. */
  rezultat: number;
};

/**
 * Cele două ponderi ale pasului: `(x − x_j)/(x_i − x_j)` și `(x_i − x)/(x_i − x_j)`.
 *
 * Se întorc separat fiindcă suma lor e 1 și asta e chiar afirmația care leagă
 * formula de desen: `P_ij(x)` stă **între** `P_{i,j−1}(x)` și `P_{i+1,j}(x)`.
 */
export function ponderiNeville(
  noduri: readonly Nod[],
  i: number,
  j: number,
  x: number,
): { spreStanga: number; spreDreapta: number } {
  const xi = noduri[i]?.x ?? Number.NaN;
  const xj = noduri[j]?.x ?? Number.NaN;
  const numitor = xi - xj;
  return { spreStanga: (x - xj) / numitor, spreDreapta: (xi - x) / numitor };
}

/**
 * Schema triunghiulară completă, evaluată într-un punct.
 *
 * Se păstrează **toate** nivelurile, nu doar rezultatul: ele sunt desenul.
 * Nivelul `g` conține toate polinoamele de grad `g` care se pot construi pe
 * noduri consecutive, iar trecerea de la un nivel la următorul e o singură
 * interpolare liniară — cum spune §3.
 */
export function schemaNeville(noduri: readonly Nod[], x: number): SchemaNeville {
  const n = noduri.length;
  if (n === 0) return { x, niveluri: [], rezultat: Number.NaN };

  const niveluri: IntrareNeville[][] = [
    noduri.map((nod, i) => ({ i, j: i, grad: 0, valoare: nod.y })),
  ];

  for (let grad = 1; grad < n; grad++) {
    const anterior = niveluri[grad - 1]!;
    const nivel: IntrareNeville[] = [];
    for (let i = 0; i + grad < n; i++) {
      const j = i + grad;
      const { spreStanga, spreDreapta } = ponderiNeville(noduri, i, j, x);
      // `P_{i,j−1}` e intrarea `i` de pe nivelul dinainte, `P_{i+1,j}` e `i+1`:
      // pe fiecare nivel intrările sunt indexate după `i`.
      const stanga = anterior[i]?.valoare ?? Number.NaN;
      const dreapta = anterior[i + 1]?.valoare ?? Number.NaN;
      nivel.push({ i, j, grad, valoare: spreStanga * stanga + spreDreapta * dreapta });
    }
    niveluri.push(nivel);
  }

  return { x, niveluri, rezultat: niveluri[n - 1]?.[0]?.valoare ?? Number.NaN };
}

/**
 * `P_ij(x)` singur, fără restul triunghiului — pentru trasarea unei curbe.
 *
 * Rulează aceeași recurență, dar numai pe blocul `i..j`. Ar fi ieșit și dintr-o
 * interpolare Lagrange pe aceleași noduri (e același polinom, prin unicitate),
 * numai că atunci desenul n-ar mai arăta ce calculează metoda de pe pagină.
 */
export function valoareNeville(noduri: readonly Nod[], i: number, j: number, x: number): number {
  const bloc = noduri.slice(i, j + 1);
  if (bloc.length === 0) return Number.NaN;
  return schemaNeville(bloc, x).rezultat;
}
