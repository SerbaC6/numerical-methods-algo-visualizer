/**
 * Curbe Bézier: baza Bernstein și algoritmul de Casteljau.
 *
 * **Sursă: `cursuri_MN/interpolare_spline_bezier_teorie_curs09.md`, §14
 * (polinoame Bernstein), §15 (curbe Bézier) și §16 (algoritmul De Casteljau).**
 * Nimic scris din memorie.
 *
 * Fără JSX și fără nimic din interfață: aici stă doar matematica, ca să poată fi
 * rulată și verificată în afara aplicației.
 */

import type { MetaMetoda } from "@/algorithms/tipuri";

export const meta: MetaMetoda = {
  id: "curbe-bezier",
  titlu: "Curbe Bézier și algoritmul de Casteljau",
  rezumat:
    "O curbă condusă de un poligon de puncte: valoarea într-un punct se obține interpolând liniar, nivel după nivel, până rămâne un singur punct.",
  sursa: "interpolare_spline_bezier_teorie_curs09.md",
};

/** Un punct din plan. Curba lucrează pe componente, deci și pe 3D ar merge la fel. */
export type Punct = { x: number; y: number };

/* ───────────────────────── baza Bernstein (§14) ───────────────────────── */

/**
 * `C(n, i)`, calculat multiplicativ.
 *
 * Nu prin factoriale: `20!` depășește deja precizia întreagă a lui `double`, iar
 * forma de mai jos rămâne exactă cât timp rezultatul însuși încape — la fiecare
 * pas, produsul parțial e chiar un coeficient binomial, deci întreg.
 */
export function binomial(n: number, i: number): number {
  if (i < 0 || i > n) return 0;
  const k = Math.min(i, n - i);
  let rezultat = 1;
  for (let j = 0; j < k; j++) rezultat = (rezultat * (n - j)) / (j + 1);
  return Math.round(rezultat);
}

/** Polinomul Bernstein `Bⁿᵢ(t) = C(n,i)·tⁱ·(1−t)ⁿ⁻ⁱ`, din §14. */
export function bernstein(n: number, i: number, t: number): number {
  if (i < 0 || i > n) return 0;
  return binomial(n, i) * t ** i * (1 - t) ** (n - i);
}

/* ───────────────────────── de Casteljau (§16) ───────────────────────── */

/**
 * Schema triunghiulară a algoritmului, **cu toate nivelurile păstrate**.
 *
 * `niveluri[0]` sunt punctele de control, iar `niveluri[j][i]` e `P⁽ʲ⁾ᵢ` din
 * recurența §16:
 *
 * ```
 * P⁽ʲ⁾ᵢ = (1 − t)·P⁽ʲ⁻¹⁾ᵢ + t·P⁽ʲ⁻¹⁾ᵢ₊₁
 * ```
 *
 * Ultimul nivel are un singur punct, care e chiar `B(t)`. Nivelurile
 * intermediare nu sunt un detaliu de implementare pe care l-am putea arunca:
 * ele **sunt** desenul, iar cursul le cere explicit ca interpretare geometrică
 * — fiecare punct nou împarte segmentul dintre două puncte vechi în raportul
 * `t/(1−t)`.
 */
export function casteljau(puncte: readonly Punct[], t: number): Punct[][] {
  if (puncte.length === 0) return [];

  const niveluri: Punct[][] = [puncte.map((p) => ({ ...p }))];
  for (let j = 1; j < puncte.length; j++) {
    const anterior = niveluri[j - 1]!;
    const nivel: Punct[] = [];
    for (let i = 0; i + 1 < anterior.length; i++) {
      const a = anterior[i]!;
      const b = anterior[i + 1]!;
      nivel.push({ x: (1 - t) * a.x + t * b.x, y: (1 - t) * a.y + t * b.y });
    }
    niveluri.push(nivel);
  }
  return niveluri;
}

/** Punctul de pe curbă la parametrul `t`, prin de Casteljau. */
export function punctPeCurba(puncte: readonly Punct[], t: number): Punct {
  const niveluri = casteljau(puncte, t);
  return niveluri[niveluri.length - 1]?.[0] ?? { x: 0, y: 0 };
}

/**
 * Aceeași valoare, dar prin suma din definiție: `B(t) = Σ Pᵢ·Bⁿᵢ(t)` (§15).
 *
 * Există ca **martor**, nu ca implementare de folosit: cursul spune că abordarea
 * directă e instabilă, fiindcă ridică numere mici la puteri mari. E calea prin
 * care se verifică, în afara aplicației, că de Casteljau dă chiar curba Bézier.
 */
export function punctPrinBernstein(puncte: readonly Punct[], t: number): Punct {
  const n = puncte.length - 1;
  let x = 0;
  let y = 0;
  for (let i = 0; i <= n; i++) {
    const b = bernstein(n, i, t);
    x += puncte[i]!.x * b;
    y += puncte[i]!.y * b;
  }
  return { x, y };
}

/** Curba eșantionată, pentru desen. `pana` oprește trasarea la un `t` dat. */
export function esantioneazaCurba(puncte: readonly Punct[], esantioane = 120, pana = 1): Punct[] {
  const capat = Math.min(Math.max(pana, 0), 1);
  const out: Punct[] = [];
  for (let k = 0; k <= esantioane; k++) {
    const t = (capat * k) / esantioane;
    out.push(punctPeCurba(puncte, t));
  }
  return out;
}

/* ───────────────────────── trecerea Hermite → Bézier (§15) ───────────────────────── */

/**
 * Derivatele pe care le înlocuiesc cele două puncte de control interioare:
 * `P′₁ = 3(P₁ − P₀)` și `P′₂ = 3(P₃ − P₂)`.
 *
 * Asta e tot ce deosebește cele două scrieri ale aceleiași cubice: Hermite cere
 * două derivate, Bézier cere două puncte în plus — iar un punct se poate trage
 * cu mâna, o derivată nu.
 */
export function derivateHermite(puncte: readonly Punct[]): { p1: Punct; p2: Punct } | undefined {
  if (puncte.length !== 4) return undefined;
  const [P0, P1, P2, P3] = puncte as readonly [Punct, Punct, Punct, Punct];
  return {
    p1: { x: 3 * (P1.x - P0.x), y: 3 * (P1.y - P0.y) },
    p2: { x: 3 * (P3.x - P2.x), y: 3 * (P3.y - P2.y) },
  };
}
