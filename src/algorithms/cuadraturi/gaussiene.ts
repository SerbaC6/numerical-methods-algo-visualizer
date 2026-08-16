/**
 * Cuadraturi Gaussiene, pe polinoamele Legendre monice.
 *
 * **Sursa: `cursuri_MN/romberg-cuadraturi-gaussiene_curs12.md`**, §„Cuadraturi
 * Gaussiene": motivația (nodurile nu mai sunt date, ci alese), gradul de
 * valabilitate `2n − 1`, polinoamele Legendre monice `P₀…P₄`, coeficienții
 * `cᵢ = ∫₋₁¹ ∏_{j≠i} (x − xⱼ)/(xᵢ − xⱼ) dx` și schimbarea de interval. Nimic
 * scris din memorie.
 *
 * **Nu există niciun tabel de noduri și ponderi copiat de undeva.** Nodurile
 * sunt rădăcinile polinoamelor scrise în curs, găsite numeric aici, iar
 * ponderile ies din integrala de mai sus, calculată **exact**: se desfac
 * multiplicatorii Lagrange în coeficienți și se integrează monom cu monom. Așa,
 * singurul lucru luat pe încredere e cursul.
 *
 * Aceleași unelte dau și ponderile Newton-Cotes, cu noduri echidistante — de
 * aceea comparația de pe pagină e cinstită: aceeași construcție, alte noduri.
 */

import { polinomLagrange } from "@/algorithms/interpolare-polinomiala/lagrange";

/** Un polinom, cu coeficienții în ordine crescătoare: `c[0] + c[1]x + …`. */
type Polinom = number[];

/** Polinoamele Legendre **monice** din curs, `P₁…P₄`, ca liste de coeficienți. */
const LEGENDRE_MONICE: Record<number, Polinom> = {
  1: [0, 1],
  2: [-1 / 3, 0, 1],
  3: [0, -3 / 5, 0, 1],
  4: [3 / 35, 0, -6 / 7, 0, 1],
};

/** Câte noduri se pot cere: exact atâtea polinoame dă cursul. */
export const NODURI_MAXIME = 4;

function evalueaza(p: Polinom, x: number): number {
  let v = 0;
  for (let i = p.length - 1; i >= 0; i--) v = v * x + (p[i] ?? 0);
  return v;
}

function inmulteste(a: Polinom, b: Polinom): Polinom {
  const rezultat = new Array<number>(a.length + b.length - 1).fill(0);
  for (const [i, ai] of a.entries()) {
    for (const [j, bj] of b.entries()) rezultat[i + j] = (rezultat[i + j] ?? 0) + ai * bj;
  }
  return rezultat;
}

/**
 * `∫₋₁¹ p(x) dx`, exact: monoamele impare dau zero, cele pare `2/(k+1)`.
 *
 * Se calculează exact, nu numeric: ponderile sunt chiar lucrul care face
 * formula să fie exactă pe polinoame, deci n-are sens să iasă dintr-o
 * aproximare.
 */
function integralaPeMinusUnuUnu(p: Polinom): number {
  let suma = 0;
  for (const [k, c] of p.entries()) if (k % 2 === 0) suma += (2 * c) / (k + 1);
  return suma;
}

/**
 * Rădăcinile unui polinom în `[−1, 1]`: se caută schimbările de semn pe o rețea
 * deasă, apoi fiecare rădăcină se strânge prin înjumătățire.
 *
 * Bisecție, nu Newton: aici nu contează viteza (patru rădăcini, o dată la
 * încărcarea modulului), iar bisecția nu poate sări dintr-un interval în altul.
 */
function radaciniIn(p: Polinom, esantioane = 2000): number[] {
  const radacini: number[] = [];
  let xStanga = -1;
  let fStanga = evalueaza(p, xStanga);
  for (let i = 1; i <= esantioane; i++) {
    const xDreapta = -1 + (2 * i) / esantioane;
    const fDreapta = evalueaza(p, xDreapta);
    if (fStanga === 0) radacini.push(xStanga);
    else if (fStanga * fDreapta < 0) {
      let s = xStanga;
      let d = xDreapta;
      for (let k = 0; k < 200; k++) {
        const m = (s + d) / 2;
        if (evalueaza(p, s) * evalueaza(p, m) <= 0) d = m;
        else s = m;
      }
      radacini.push((s + d) / 2);
    }
    xStanga = xDreapta;
    fStanga = fDreapta;
  }
  return radacini;
}

/**
 * Ponderile unei formule de cuadratură cu nodurile date, pe `[−1, 1]`:
 * `cᵢ = ∫₋₁¹ lᵢ(x) dx`, cu `lᵢ` multiplicatorii Lagrange.
 *
 * E formula din curs, luată literal. Funcționează pentru orice noduri, nu doar
 * pentru cele Gaussiene — de aceea din ea ies și ponderile Newton-Cotes.
 */
export function ponderiPentruNoduri(noduri: readonly number[]): number[] {
  return noduri.map((xi, i) => {
    let li: Polinom = [1];
    for (const [j, xj] of noduri.entries()) {
      if (j === i) continue;
      li = inmulteste(li, [-xj / (xi - xj), 1 / (xi - xj)]);
    }
    return integralaPeMinusUnuUnu(li);
  });
}

export type FormulaCuadratura = {
  /** Nodurile pe `[−1, 1]`. */
  noduri: number[];
  /** Ponderile care le însoțesc, tot pe `[−1, 1]`. */
  ponderi: number[];
};

const cacheGauss = new Map<number, FormulaCuadratura>();

/**
 * Nodurile și ponderile Gaussiene pentru `n` puncte: nodurile sunt rădăcinile
 * polinomului Legendre monic de grad `n`.
 */
export function formulaGauss(n: number): FormulaCuadratura {
  const cerut = Math.max(1, Math.min(NODURI_MAXIME, Math.round(n)));
  const dinCache = cacheGauss.get(cerut);
  if (dinCache) return dinCache;

  const polinom = LEGENDRE_MONICE[cerut]!;
  const noduri = radaciniIn(polinom);
  const formula = { noduri, ponderi: ponderiPentruNoduri(noduri) };
  cacheGauss.set(cerut, formula);
  return formula;
}

/**
 * Nodurile și ponderile Newton-Cotes închise pentru `n` puncte: noduri
 * echidistante, capetele incluse, ponderi din aceeași integrală Lagrange.
 *
 * Cu `n = 2` iese formula trapezelor, cu `n = 3` formula Simpson — verificat în
 * `scripts/verificare-algoritmi/cuadraturi.ts`.
 */
export function formulaEchidistanta(n: number): FormulaCuadratura {
  const cerut = Math.max(2, Math.round(n));
  const noduri = Array.from({ length: cerut }, (_, i) => -1 + (2 * i) / (cerut - 1));
  return { noduri, ponderi: ponderiPentruNoduri(noduri) };
}

/** Un nod, dus pe intervalul cerut, cu tot ce trebuie desenat lângă el. */
export type NodCuadratura = {
  /** Poziția pe `[−1, 1]`, cum apare în formulă. */
  t: number;
  /** Poziția pe `[a, b]`, unde se evaluează de fapt. */
  x: number;
  /** Ponderea de pe `[−1, 1]`. */
  pondere: number;
  fx: number;
  /** Cât aduce nodul în sumă: `((b − a)/2)·cᵢ·f(xᵢ)`. */
  contributie: number;
};

export type RezultatCuadraturaFixa = {
  noduri: NodCuadratura[];
  valoare: number;
  /** Câte evaluări ale lui `f` a cerut — chiar numărul de noduri. */
  evaluari: number;
};

/**
 * Schimbarea de interval din curs: `x = ½[(b − a)t + a + b]`, cu factorul
 * `(b − a)/2` în fața sumei.
 */
export function catreInterval(t: number, a: number, b: number): number {
  return ((b - a) * t + (a + b)) / 2;
}

/** Aplică o formulă (Gauss sau echidistantă) pe `[a, b]`. */
export function aplicaFormula(
  formula: FormulaCuadratura,
  f: (x: number) => number,
  a: number,
  b: number,
): RezultatCuadraturaFixa {
  const factor = (b - a) / 2;
  const noduri = formula.noduri.map((t, i) => {
    const pondere = formula.ponderi[i] ?? 0;
    const x = catreInterval(t, a, b);
    const fx = f(x);
    return { t, x, pondere, fx, contributie: factor * pondere * fx };
  });
  return {
    noduri,
    valoare: noduri.reduce((s, nod) => s + nod.contributie, 0),
    evaluari: noduri.length,
  };
}

/**
 * Gradul de exactitate **măsurat**, nu enunțat: cel mai mare `k` pentru care
 * formula integrează exact toate monoamele `1, x, …, x^k` pe `[−1, 1]`.
 *
 * Pentru `n` noduri Gaussiene trebuie să iasă `2n − 1`; pentru `n` noduri
 * echidistante, `n − 1` sau `n` (formulele cu număr impar de puncte câștigă un
 * grad din simetrie).
 */
export function gradDeExactitate(formula: FormulaCuadratura, toleranta = 1e-10): number {
  for (let grad = 0; grad < 40; grad++) {
    const exact = grad % 2 === 0 ? 2 / (grad + 1) : 0;
    const aproximat = formula.noduri.reduce(
      (s, t, i) => s + (formula.ponderi[i] ?? 0) * t ** grad,
      0,
    );
    if (Math.abs(aproximat - exact) > toleranta * Math.max(1, Math.abs(exact))) return grad - 1;
  }
  return 39;
}

/**
 * Conturul figurii pe care o formulă de cuadratură o desenează de fapt:
 * polinomul de interpolare prin nodurile ei.
 *
 * Nu e o ilustrație aleasă ca să arate bine. Ponderile sunt, prin definiție,
 * integralele multiplicatorilor Lagrange, deci suma `Σcᵢf(xᵢ)` **este** aria de
 * sub polinomul care trece prin noduri — la Gauss ca și la Newton-Cotes.
 * Verificat numeric în `scripts/verificare-algoritmi/cuadraturi.ts`.
 */
export function conturInterpolantului(
  noduri: readonly NodCuadratura[],
  a: number,
  b: number,
  puncte = 200,
): { x: number; y: number }[] {
  const suport = noduri.map((nod) => ({ x: nod.x, y: nod.fx }));
  const contur: { x: number; y: number }[] = [];
  for (let i = 0; i <= puncte; i++) {
    const x = a + ((b - a) * i) / puncte;
    contur.push({ x, y: polinomLagrange(suport, x) });
  }
  return contur;
}
