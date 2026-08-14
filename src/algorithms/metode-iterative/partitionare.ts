/**
 * Partiționarea `A = D − L − U` și matricea de iterație a fiecărei metode.
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §3.2** —
 * tabelul de sinteză cu `M`, `N`, `G = M⁻¹N` și `c = M⁻¹b`.
 *
 * **Atenție la semne**, fiindcă aici se greșește cel mai ușor: `L` și `U` sunt
 * definite cu **minus** în fața elementelor lui `A` (`L = −tril(A, −1)`,
 * `U = −triu(A, 1)` din pseudocodul cursului), tocmai ca `A = D − L − U` să fie
 * o egalitate, nu o descompunere aproximativă. Deci pentru
 * `A = [[2,1],[1,2]]`, `L = [[0,0],[−1,0]]`, nu `[[0,0],[1,0]]`.
 */

import { inmulteste, rezolvaSistem } from "@/algorithms/metode-iterative/liniar";

export type Partitionare = {
  /** Diagonala lui `A`, ca matrice. */
  D: number[][];
  /** Strict inferior triunghiulară, **cu semnul schimbat**. */
  L: number[][];
  /** Strict superior triunghiulară, **cu semnul schimbat**. */
  U: number[][];
};

export function partitioneaza(A: number[][]): Partitionare {
  const n = A.length;
  const gol = () => Array.from({ length: n }, () => Array<number>(n).fill(0));
  const D = gol();
  const L = gol();
  const U = gol();

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const a = A[i]?.[j] ?? 0;
      if (i === j) D[i]![j] = a;
      else if (i > j) L[i]![j] = -a;
      else U[i]![j] = -a;
    }
  }

  return { D, L, U };
}

/** Cele trei metode, exact cum le desparte tabelul din §3.2. */
export type IdMetodaIterativa = "jacobi" | "gauss-seidel" | "sor";

/**
 * `M` și `N` din `A = M − N`, pentru fiecare metodă.
 *
 * | Metodă       | M       | N                  |
 * | ------------ | ------- | ------------------ |
 * | Jacobi       | D       | L + U              |
 * | Gauss-Seidel | D − L   | U                  |
 * | SOR          | D − ωL  | (1−ω)D + ωU        |
 */
export function descompune(
  A: number[][],
  metoda: IdMetodaIterativa,
  omega = 1,
): { M: number[][]; N: number[][] } {
  const { D, L, U } = partitioneaza(A);
  const n = A.length;
  const combina = (f: (i: number, j: number) => number) =>
    Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => f(i, j)));

  if (metoda === "jacobi") {
    return { M: D, N: combina((i, j) => (L[i]?.[j] ?? 0) + (U[i]?.[j] ?? 0)) };
  }
  if (metoda === "gauss-seidel") {
    return { M: combina((i, j) => (D[i]?.[j] ?? 0) - (L[i]?.[j] ?? 0)), N: U };
  }
  return {
    M: combina((i, j) => (D[i]?.[j] ?? 0) - omega * (L[i]?.[j] ?? 0)),
    N: combina((i, j) => (1 - omega) * (D[i]?.[j] ?? 0) + omega * (U[i]?.[j] ?? 0)),
  };
}

/**
 * Matricea de iterație `G = M⁻¹N` și vectorul `c = M⁻¹b` (la SOR, `c = ωM⁻¹b`).
 *
 * `M⁻¹` nu se calculează niciodată ca atare: fiecare coloană a lui `G` iese
 * rezolvând `M·g = n_coloană`, exact cum spune §3 că sistemul `Mz = r` e mai
 * ușor de rezolvat decât `Ax = b`. `null` dacă `M` e singulară — adică dacă un
 * element de pe diagonala lui `A` e nul, caz în care metodele nici nu pot porni.
 */
export function matriceaDeIteratie(
  A: number[][],
  b: number[],
  metoda: IdMetodaIterativa,
  omega = 1,
): { G: number[][]; c: number[] } | null {
  const { M, N } = descompune(A, metoda, omega);
  const n = A.length;

  const coloane: number[][] = [];
  for (let j = 0; j < n; j++) {
    const coloanaN = N.map((linie) => linie[j] ?? 0);
    const solutie = rezolvaSistem(M, coloanaN);
    if (!solutie) return null;
    coloane.push(solutie);
  }

  const G = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => coloane[j]?.[i] ?? 0),
  );

  const cBrut = rezolvaSistem(M, b);
  if (!cBrut) return null;
  const c = metoda === "sor" ? cBrut.map((v) => omega * v) : cBrut;

  return { G, c };
}

/** `G·x + c` — pasul din §3, scris o singură dată. */
export function pasulGeneral(G: number[][], c: number[], x: number[]): number[] {
  return inmulteste(G, x).map((v, i) => v + (c[i] ?? 0));
}
