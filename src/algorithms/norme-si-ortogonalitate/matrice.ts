/**
 * Aritmetica de matrice de care au nevoie Householder și Givens.
 *
 * Funcții pure, fără nimic din interfață. Nu e o bibliotecă generală: are exact
 * ce cere pagina 2, ca fiecare rând să poată fi verificat pe exemplele din
 * `cursuri_MN/curs3_ortogonalitate.md`.
 */

export function identitate(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
}

export function inmulteste(A: number[][], B: number[][]): number[][] {
  const interior = B.length;
  return A.map((linie) =>
    Array.from({ length: B[0]?.length ?? 0 }, (_, j) => {
      let suma = 0;
      for (let k = 0; k < interior; k++) suma += (linie[k] ?? 0) * (B[k]?.[j] ?? 0);
      return suma;
    }),
  );
}

export function transpusa(A: number[][]): number[][] {
  return Array.from({ length: A[0]?.length ?? 0 }, (_, i) => A.map((linie) => linie[i] ?? 0));
}

export function coloana(A: number[][], j: number): number[] {
  return A.map((linie) => linie[j] ?? 0);
}

/** `‖v‖₂` — norma euclidiană, cea folosită peste tot în capitolul de ortogonalitate. */
export function normaEuclidiana(v: readonly number[]): number {
  return Math.hypot(...v);
}

/** Cea mai mare diferență, element cu element, dintre două matrice. */
export function abatere(A: number[][], B: number[][]): number {
  let maxim = 0;
  for (const [i, linie] of A.entries()) {
    for (const [j, x] of linie.entries()) maxim = Math.max(maxim, Math.abs(x - (B[i]?.[j] ?? 0)));
  }
  return maxim;
}

/**
 * `sign` din curs, cu o singură deosebire care contează: **zero numără ca plus**.
 *
 * Cursul scrie `d = v + sign(v₁)·‖v‖·e₁` fără să spună ce se întâmplă la
 * `v₁ = 0`. Dacă `sign(0)` ar da 0, `d` ar ieși chiar `v`, iar reflexia n-ar mai
 * duce vectorul pe axă. Cu `+1` alegerea rămâne valabilă, fiindcă la `v₁ = 0`
 * cele două semne sunt la fel de bune — depărtarea dintre `v` și `Pv` e aceeași.
 */
export function semn(x: number): number {
  return x < 0 ? -1 : 1;
}

/** Curăță `-0` și zgomotul de sub prag, ca zerourile produse să se vadă zerouri. */
export function curata(A: number[][], prag = 1e-12): number[][] {
  return A.map((linie) => linie.map((x) => (Math.abs(x) < prag ? 0 : x)));
}
