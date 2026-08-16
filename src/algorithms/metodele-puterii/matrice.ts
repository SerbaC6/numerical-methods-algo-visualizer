/**
 * Aritmetica de vectori și matrice folosită de pagina 8.
 *
 * Nimic din ce e aici nu ține de o metodă anume: înmulțire, normă, cât Rayleigh
 * și rezolvarea unui sistem liniar. Sistemul se rezolvă prin **eliminare cu
 * pivotare parțială**, fiindcă §7 din curs cere explicit ca `(A − qI)y = x` să
 * se rezolve, nu ca matricea să se inverseze.
 */

import type { Matrice } from "@/algorithms/metodele-puterii/tipuri";

/** `A·v`. */
export function inmultesteVector(A: Matrice, v: number[]): number[] {
  return A.map((linie) => linie.reduce((s, a, j) => s + a * (v[j] ?? 0), 0));
}

/** Produsul scalar `uᵀ·v`. */
export function produsScalar(u: number[], v: number[]): number {
  return u.reduce((s, x, i) => s + x * (v[i] ?? 0), 0);
}

/** Norma euclidiană `‖v‖₂`. */
export function norma2(v: number[]): number {
  return Math.sqrt(produsScalar(v, v));
}

/** `u − v`, componentă cu componentă. */
export function scade(u: number[], v: number[]): number[] {
  return u.map((x, i) => x - (v[i] ?? 0));
}

/** `v/‖v‖₂`; `null` dacă vectorul e nul sau a scăpat la infinit. */
export function normalizeaza(v: number[]): number[] | null {
  const lungime = norma2(v);
  if (!(lungime > 0) || !Number.isFinite(lungime)) return null;
  return v.map((x) => x / lungime);
}

/**
 * Câtul Rayleigh din §5: `μ = (xᵀ·A·x)/(xᵀ·x)`.
 *
 * Împărțirea la `xᵀ·x` se face chiar dacă vectorul e deja normalizat: formula
 * din curs o conține, iar aici nu se presupune nimic despre ce primește.
 */
export function catRayleigh(A: Matrice, x: number[]): number {
  const jos = produsScalar(x, x);
  if (!(jos > 0)) return Number.NaN;
  return produsScalar(x, inmultesteVector(A, x)) / jos;
}

/** `A − q·I`, fără să atingă `A`. */
export function scadeDeplasare(A: Matrice, q: number): Matrice {
  return A.map((linie, i) => linie.map((a, j) => (i === j ? a - q : a)));
}

/** `A − λ·u·vᵀ` — actualizarea de rang 1 din deflația Wielandt (§9). */
export function scadeRang1(A: Matrice, lambda: number, u: number[], v: number[]): Matrice {
  return A.map((linie, i) => linie.map((a, j) => a - lambda * (u[i] ?? 0) * (v[j] ?? 0)));
}

/** `B` fără linia și coloana `i` — reducerea dimensiunii din §9. */
export function stergeLinieSiColoana(B: Matrice, i: number): Matrice {
  return B.filter((_, r) => r !== i).map((linie) => linie.filter((_, c) => c !== i));
}

/**
 * Rezolvă `M·y = b` prin eliminare gaussiană cu pivotare parțială.
 *
 * Întoarce `null` când pivotul cel mai mare de pe coloană e practic zero —
 * adică exact cazul în care deplasarea `q` a nimerit o valoare proprie și
 * `A − qI` a devenit singulară. Cine cheamă funcția trebuie să spună în cuvinte
 * de ce s-a oprit; aici nu se inventează un rezultat.
 */
export function rezolvaSistem(M: Matrice, b: number[]): number[] | null {
  const n = M.length;
  const a = M.map((linie, i) => [...linie, b[i] ?? 0]);

  for (let k = 0; k < n; k++) {
    let pivot = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(a[i]![k]!) > Math.abs(a[pivot]![k]!)) pivot = i;
    }
    if (Math.abs(a[pivot]![k]!) < 1e-14) return null;
    if (pivot !== k) {
      const t = a[k]!;
      a[k] = a[pivot]!;
      a[pivot] = t;
    }
    for (let i = k + 1; i < n; i++) {
      const factor = a[i]![k]! / a[k]![k]!;
      for (let j = k; j <= n; j++) a[i]![j] = a[i]![j]! - factor * a[k]![j]!;
    }
  }

  const y = Array.from({ length: n }, () => 0);
  for (let i = n - 1; i >= 0; i--) {
    let suma = a[i]![n]!;
    for (let j = i + 1; j < n; j++) suma -= a[i]![j]! * y[j]!;
    y[i] = suma / a[i]![i]!;
  }
  return y.every((x) => Number.isFinite(x)) ? y : null;
}
