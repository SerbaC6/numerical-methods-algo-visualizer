/**
 * Interpolarea spline: polinoame locale, pe fiecare subinterval câte unul.
 *
 * **Sursă: `cursuri_MN/interpolare_spline_bezier_teorie_curs09.md`, §9** (ce e
 * un spline), **§10** (treapta liniară) și **§12** (cubicul cu racordare de
 * ordinul doi, natural și tensionat). Nimic scris din memorie.
 *
 * Sistemul în `cᵢ` se rezolvă cu **algoritmul Thomas**, adică chiar cu modulul
 * paginii 4: cursul spune că `A` e tridiagonală, iar o eliminare gaussiană
 * generală ar fi rezolvat aceeași matrice ignorând tocmai proprietatea despre
 * care e vorba.
 *
 * Fără JSX și fără nimic din interfață; verificat în
 * `scripts/verificare-algoritmi/interpolare-polinomiala.ts`.
 */

import { algoritmulThomas } from "@/algorithms/algoritmul-thomas/thomas";
import type { Nod } from "@/algorithms/interpolare-polinomiala/tipuri";

/* ───────────────────────── spline liniar (§10) ───────────────────────── */

/** O bucată de spline liniar: `pᵢ(x) = aᵢ·x + bᵢ`. */
export type BucataLiniara = { a: number; b: number; de: number; la: number };

/**
 * Spline-ul liniar din §10: pe fiecare subinterval, dreapta prin cele două
 * capete.
 *
 * ```
 * aᵢ = [f(xᵢ₊₁) − f(xᵢ)] / (xᵢ₊₁ − xᵢ)
 * bᵢ = [xᵢ₊₁·f(xᵢ) − xᵢ·f(xᵢ₊₁)] / (xᵢ₊₁ − xᵢ)
 * ```
 *
 * Condițiile care îl determină sunt interpolarea plus racordarea în nodurile
 * interioare — adică **doar** continuitatea. Pantele `aᵢ` diferă de la un
 * subinterval la altul, deci în noduri curba are colțuri; vezi
 * `docs/erata-cursuri.md` pentru eticheta din curs.
 */
export function splineLiniar(noduri: readonly Nod[]): BucataLiniara[] {
  const out: BucataLiniara[] = [];
  for (let i = 0; i + 1 < noduri.length; i++) {
    const st = noduri[i]!;
    const dr = noduri[i + 1]!;
    const h = dr.x - st.x;
    out.push({
      a: (dr.y - st.y) / h,
      b: (dr.x * st.y - st.x * dr.y) / h,
      de: st.x,
      la: dr.x,
    });
  }
  return out;
}

/* ───────────────────────── spline cubic C² (§12) ───────────────────────── */

/** Cele două condiții suplimentare care închid sistemul, din §12. */
export type TipSpline = "natural" | "tensionat";

/**
 * Coeficienții spline-ului cubic, în forma din §12:
 * `sᵢ(x) = aᵢ + bᵢ(x − xᵢ) + cᵢ(x − xᵢ)² + dᵢ(x − xᵢ)³`.
 *
 * `a` și `c` au `n+1` valori (ultima e cea din nodul final, introdusă în curs
 * doar ca să ajute la calcul), `b` și `d` au `n` — câte una pe subinterval.
 */
export type SplineCubic = {
  noduri: Nod[];
  tip: TipSpline;
  a: number[];
  b: number[];
  c: number[];
  d: number[];
  /** `hᵢ = xᵢ₊₁ − xᵢ`. */
  h: number[];
  /** Sistemul tridiagonal rezolvat pentru `cᵢ`, ca să poată fi arătat. */
  sistem: { sub: number[]; diagonala: number[]; peste: number[]; liber: number[] };
};

/**
 * Spline-ul cubic cu racordare de ordinul doi.
 *
 * Condițiile din curs: `n+1` de interpolare (de unde `aᵢ = f(xᵢ)`) și `3n−3` de
 * racordare — continuitate, derivată și curbură în nodurile interioare. Sunt
 * `4n−2` pentru `4n` necunoscute, deci mai trebuie două:
 *
 * - **natural** — `s″` se anulează la capete, adică `c₀ = cₙ = 0`;
 * - **tensionat** — `s′` la capete e chiar derivata funcției, `f′(x₀)` și `f′(xₙ)`.
 *
 * Restul coeficienților ies din `cᵢ`, cu formulele din §12.
 */
export function splineCubic(
  noduri: readonly Nod[],
  tip: TipSpline = "natural",
  derivateCapete?: { la0: number; laN: number },
): SplineCubic {
  const puncte = noduri.map((nod) => ({ ...nod }));
  const n = puncte.length - 1;

  const a = puncte.map((nod) => nod.y);
  const h: number[] = [];
  for (let i = 0; i < n; i++) h.push(puncte[i + 1]!.x - puncte[i]!.x);

  // Sistemul tridiagonal în `cᵢ`, pe patru vectori — forma cerută de Thomas.
  const sub = new Array<number>(n + 1).fill(0);
  const diagonala = new Array<number>(n + 1).fill(0);
  const peste = new Array<number>(n + 1).fill(0);
  const liber = new Array<number>(n + 1).fill(0);

  // Liniile interioare: recurența centrală din §12.
  for (let i = 1; i < n; i++) {
    const hStanga = h[i - 1]!;
    const hDreapta = h[i]!;
    sub[i] = hStanga;
    diagonala[i] = 2 * (hStanga + hDreapta);
    peste[i] = hDreapta;
    liber[i] = (3 * (a[i + 1]! - a[i]!)) / hDreapta - (3 * (a[i]! - a[i - 1]!)) / hStanga;
  }

  if (tip === "natural" || derivateCapete === undefined) {
    // `s″₀(x₀) = 0 ⇒ c₀ = 0` și `s″ₙ₋₁(xₙ) ≡ 2cₙ = 0 ⇒ cₙ = 0`.
    diagonala[0] = 1;
    peste[0] = 0;
    liber[0] = 0;
    sub[n] = 0;
    diagonala[n] = 1;
    liber[n] = 0;
  } else {
    diagonala[0] = 2 * h[0]!;
    peste[0] = h[0]!;
    liber[0] = (3 * (a[1]! - a[0]!)) / h[0]! - 3 * derivateCapete.la0;
    sub[n] = h[n - 1]!;
    diagonala[n] = 2 * h[n - 1]!;
    liber[n] = 3 * derivateCapete.laN - (3 * (a[n]! - a[n - 1]!)) / h[n - 1]!;
  }

  const c = algoritmulThomas({ a: sub, b: diagonala, c: peste, d: liber }).x;

  const b: number[] = [];
  const d: number[] = [];
  for (let i = 0; i < n; i++) {
    d.push((c[i + 1]! - c[i]!) / (3 * h[i]!));
    b.push((a[i + 1]! - a[i]!) / h[i]! - (h[i]! / 3) * (2 * c[i]! + c[i + 1]!));
  }

  return { noduri: puncte, tip, a, b, c, d, h, sistem: { sub, diagonala, peste, liber } };
}

/** Pe ce subinterval cade `x`. În afara suportului se folosește bucata cea mai apropiată. */
export function bucataDin(spline: SplineCubic, x: number): number {
  const ultima = spline.b.length - 1;
  if (ultima < 0) return 0;
  for (let i = ultima; i >= 0; i--) {
    if (x >= spline.noduri[i]!.x) return i;
  }
  return 0;
}

/** `s(x)`, cu bucata aleasă după `x`. */
export function evalueazaSpline(spline: SplineCubic, x: number): number {
  const i = bucataDin(spline, x);
  const t = x - (spline.noduri[i]?.x ?? 0);
  return spline.a[i]! + spline.b[i]! * t + spline.c[i]! * t * t + spline.d[i]! * t ** 3;
}

/** `s′(x)` — cerută de condiția tensionată și de verificarea racordării. */
export function derivataSpline(spline: SplineCubic, x: number): number {
  const i = bucataDin(spline, x);
  const t = x - (spline.noduri[i]?.x ?? 0);
  return spline.b[i]! + 2 * spline.c[i]! * t + 3 * spline.d[i]! * t * t;
}

/** `s″(x)` — cea care se anulează la capete la spline-ul natural. */
export function derivataADouaSpline(spline: SplineCubic, x: number): number {
  const i = bucataDin(spline, x);
  const t = x - (spline.noduri[i]?.x ?? 0);
  return 2 * spline.c[i]! + 6 * spline.d[i]! * t;
}
