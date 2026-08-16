/**
 * Interpolarea Lagrange: multiplicatorii și polinomul care trece prin noduri.
 *
 * **Sursă: `cursuri_MN/interpolare_spline_bezier_teorie_curs09.md`, §2.**
 * Nimic scris din memorie.
 *
 * Se folosește **forma închisă** a multiplicatorului,
 * `lₖ(x) = Π_{i≠k} (x − xᵢ)/(xₖ − xᵢ)`, nu forma desfășurată tipărită deasupra
 * ei în curs: acolo produsul pornește de la `x₁`, iar `cₖ` de la `x₀`, deci
 * cele două linii nu descriu același polinom. Vezi `docs/erata-cursuri.md`.
 *
 * Fără JSX și fără nimic din interfață: aici stă doar matematica, verificată în
 * `scripts/verificare-algoritmi/interpolare-polinomiala.ts`.
 */

import type { Interval, Nod, Punct } from "@/algorithms/interpolare-polinomiala/tipuri";

/**
 * Multiplicatorul Lagrange `lₖ(x) = Π_{i=0, i≠k}^{n} (x − xᵢ)/(xₖ − xᵢ)`.
 *
 * Prin construcție `lₖ(xₖ) = 1` și `lₖ(xᵢ) = 0` pentru `i ≠ k` — de aceea suma
 * `Σ f(xₖ)·lₖ(x)` trece prin toate punctele. Asta e și paralela cu desenul:
 * multiplicatorul e „cât trage nodul `k` de polinom", iar el trage cu 1 exact
 * în nodul lui și cu 0 în toate celelalte.
 */
export function multiplicatorLagrange(noduri: readonly Nod[], k: number, x: number): number {
  const xk = noduri[k]?.x;
  if (xk === undefined) return Number.NaN;

  let produs = 1;
  for (const [i, nod] of noduri.entries()) {
    if (i === k) continue;
    produs *= (x - nod.x) / (xk - nod.x);
  }
  return produs;
}

/**
 * Polinomul de interpolare `Pₙ(x) = Σ_{k=0}^{n} f(xₖ)·lₖ(x)`.
 *
 * Teorema din §2: pe `n+1` puncte distincte există un **singur** polinom de
 * grad cel mult `n` care trece prin ele. „Singur" e important pentru pagină:
 * Neville calculează altfel, dar ajunge la același polinom.
 */
export function polinomLagrange(noduri: readonly Nod[], x: number): number {
  let suma = 0;
  for (const [k, nod] of noduri.entries()) {
    suma += nod.y * multiplicatorLagrange(noduri, k, x);
  }
  return suma;
}

/**
 * Contribuția unui singur nod la valoarea polinomului: `f(xₖ)·lₖ(x)`.
 *
 * Se desenează separat fiindcă suma lor **e** polinomul: cine vede cele `n+1`
 * curbe adunându-se vede de ce formula arată așa cum arată.
 */
export function contributieLagrange(noduri: readonly Nod[], k: number, x: number): number {
  return (noduri[k]?.y ?? 0) * multiplicatorLagrange(noduri, k, x);
}

/** Eșantionarea unei funcții pe un interval, pentru desen. */
export function esantioneaza(f: (x: number) => number, [a, b]: Interval, puncte = 400): Punct[] {
  const n = Math.max(2, Math.floor(puncte));
  const out: Punct[] = [];
  for (let i = 0; i < n; i++) {
    const x = a + ((b - a) * i) / (n - 1);
    out.push({ x, y: f(x) });
  }
  return out;
}
