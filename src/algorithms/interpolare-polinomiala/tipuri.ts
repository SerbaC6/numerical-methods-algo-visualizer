/**
 * Tipurile comune ale paginii 12 — suportul interpolării și rezultatele care
 * ies din el.
 *
 * **Sursă: `cursuri_MN/interpolare_spline_bezier_teorie_curs09.md`, §1.**
 * Nimic scris din memorie.
 */

/** Un punct din suportul interpolării: `(xₖ, f(xₖ))`. */
export type Nod = { x: number; y: number };

/** Un punct oarecare, pentru desen. */
export type Punct = { x: number; y: number };

/** Capetele intervalului pe care se lucrează. */
export type Interval = readonly [number, number];

/**
 * Nodurile echidistante `xᵢ = x₀ + i·h` cerute de §5 (diferențe finite) și de
 * exemplul Runge din §8.
 *
 * `x` se calculează ca `a + (b − a)·i/n`, nu prin adunări repetate: adunarea
 * acumulează eroare, iar ultimul nod n-ar mai cădea exact pe `b` — la
 * interpolare asta înseamnă un nod în plus lângă capăt, adică exact zona în
 * care polinomul oscilează cel mai tare.
 */
export function noduriEchidistante(
  f: (x: number) => number,
  [a, b]: Interval,
  cate: number,
): Nod[] {
  const n = Math.max(2, Math.floor(cate));
  const out: Nod[] = [];
  for (let i = 0; i < n; i++) {
    const x = a + ((b - a) * i) / (n - 1);
    out.push({ x, y: f(x) });
  }
  return out;
}

/**
 * Cea mai mare abatere dintre două funcții pe un interval, măsurată pe o grilă
 * deasă.
 *
 * E o **măsurătoare pe eșantion**, nu supremumul adevărat: cu 2001 de puncte pe
 * `[−1, 1]` pasul e `10⁻³`, destul cât vârfurile oscilației Runge (late de
 * ordinul zecimilor) să nu poată fi sărite. Cifrele care ajung în text vin din
 * verificarea separată, nu de aici.
 */
export function abatereMaxima(
  f: (x: number) => number,
  g: (x: number) => number,
  [a, b]: Interval,
  esantioane = 2000,
): number {
  let max = 0;
  for (let i = 0; i <= esantioane; i++) {
    const x = a + ((b - a) * i) / esantioane;
    const d = Math.abs(f(x) - g(x));
    if (Number.isFinite(d) && d > max) max = d;
  }
  return max;
}
