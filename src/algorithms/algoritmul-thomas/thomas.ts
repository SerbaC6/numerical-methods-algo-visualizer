/**
 * Algoritmul Thomas: sistemul tridiagonal rezolvat pe patru vectori.
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_directe_MN_curs4.md`, §9** —
 * derivarea din §9.1 (recurențele `µ`, `bᵢ`, `dᵢ`), Algorithm 5 pentru ordinea
 * operațiilor și §9.2 pentru dominanța diagonală. Nimic scris din memorie.
 *
 * **Ce e și ce nu e aici.** Modulul dă cifrele, nu desenul: fiecare pas conține
 * raportul `µ`, valorile dinainte și de după, ca animația să nu-și calculeze
 * propriile numere. Fără JSX, fără React.
 *
 * **Convenția de indici.** Cursul numerotează de la 1 (`a₁ = 0`, `cₙ = 0`); aici
 * vectorii sunt 0-based și au toți lungimea `n`, cu `a[0]` și `c[n−1]` ignorate.
 * Se schimbă doar scrierea, nu operațiile.
 *
 * Verificat în `scripts/verificare-algoritmi/algoritmul-thomas.ts`.
 */

/** Cele patru diagonale ale sistemului: sub, principală, peste, termeni liberi. */
export type SistemTridiagonal = {
  /** Subdiagonala. `a[0]` nu există în sistem și se ignoră. */
  a: readonly number[];
  /** Diagonala principală. */
  b: readonly number[];
  /** Supradiagonala. `c[n−1]` nu există în sistem și se ignoră. */
  c: readonly number[];
  /** Termenii liberi. */
  d: readonly number[];
};

/** Un pas de eliminare înainte: o singură linie, curățată o singură dată. */
export type PasEliminare = {
  /** Linia care se schimbă, 0-based. Se sprijină pe linia `i − 1`. */
  i: number;
  /** `µ = aᵢ / bᵢ₋₁` — cât din linia de deasupra se scade. */
  mu: number;
  /** `aᵢ`, elementul care devine 0. */
  a: number;
  /** `bᵢ₋₁`, împărțitorul — deja modificat de pașii dinainte. */
  bAnterior: number;
  /** `cᵢ₋₁`, singurul element al liniei de deasupra care intră în `bᵢ`. */
  cAnterior: number;
  /** `dᵢ₋₁`, deja modificat de pașii dinainte. */
  dAnterior: number;
  bInainte: number;
  bDupa: number;
  dInainte: number;
  dDupa: number;
};

/** Un pas de substituție înapoi: o necunoscută aflată. */
export type PasSubstitutie = {
  /** Necunoscuta aflată acum, 0-based. */
  i: number;
  /** `bᵢ` după eliminare — împărțitorul. */
  b: number;
  /** `dᵢ` după eliminare. */
  d: number;
  /** `cᵢ`, sau `undefined` pe ultima linie, unde nu mai există. */
  c?: number;
  /** `xᵢ₊₁`, sau `undefined` pe ultima linie. */
  xUrmator?: number;
  /** Valoarea aflată. */
  x: number;
};

export type RezultatThomas = {
  pasiEliminare: PasEliminare[];
  pasiSubstitutie: PasSubstitutie[];
  /** Diagonala principală după eliminarea înainte. */
  b: number[];
  /** Termenii liberi după eliminarea înainte. */
  d: number[];
  /** Soluția, în ordinea `x₁ … xₙ`. */
  x: number[];
};

/**
 * Cele două treceri prin vectori: eliminarea înainte, apoi substituția înapoi.
 *
 * `a`, `c` și `d` rămân neatinse ca vectori de intrare; se copiază `b` și `d`,
 * fiindcă numai ele se schimbă (cursul insistă: `cᵢ` nu se atinge deloc).
 *
 * Un `bᵢ₋₁` nul oprește metoda cu o excepție, în loc să producă `Infinity` în
 * tăcere: împărțirea la el e chiar locul în care algoritmul cade, iar §9.2 pe
 * asta se sprijină când cere dominanță diagonală.
 */
export function algoritmulThomas(sistem: SistemTridiagonal): RezultatThomas {
  const { a, c } = sistem;
  const n = sistem.b.length;
  const b = [...sistem.b];
  const d = [...sistem.d];

  const pasiEliminare: PasEliminare[] = [];
  for (let i = 1; i < n; i++) {
    const bAnterior = b[i - 1] ?? 0;
    if (bAnterior === 0) {
      throw new Error(`b${i} este 0: împărțirea din µ nu se poate face.`);
    }
    const ai = a[i] ?? 0;
    const cAnterior = c[i - 1] ?? 0;
    const dAnterior = d[i - 1] ?? 0;
    const bInainte = b[i] ?? 0;
    const dInainte = d[i] ?? 0;

    const mu = ai / bAnterior;
    const bDupa = bInainte - mu * cAnterior;
    const dDupa = dInainte - mu * dAnterior;
    b[i] = bDupa;
    d[i] = dDupa;

    pasiEliminare.push({
      i,
      mu,
      a: ai,
      bAnterior,
      cAnterior,
      dAnterior,
      bInainte,
      bDupa,
      dInainte,
      dDupa,
    });
  }

  const x = new Array<number>(n).fill(0);
  const pasiSubstitutie: PasSubstitutie[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const bi = b[i] ?? 0;
    if (bi === 0) throw new Error(`b${i + 1} este 0: substituția înapoi nu se poate face.`);
    const di = d[i] ?? 0;
    if (i === n - 1) {
      x[i] = di / bi;
      pasiSubstitutie.push({ i, b: bi, d: di, x: x[i]! });
    } else {
      const ci = c[i] ?? 0;
      const xUrmator = x[i + 1] ?? 0;
      x[i] = (di - ci * xUrmator) / bi;
      pasiSubstitutie.push({ i, b: bi, d: di, c: ci, xUrmator, x: x[i]! });
    }
  }

  return { pasiEliminare, pasiSubstitutie, b, d, x };
}

/**
 * Dominanța diagonală cerută de §9.2: `|bᵢ| ≥ |aᵢ| + |cᵢ|` pe fiecare linie.
 *
 * E condiția sub care împărțirea la `bᵢ₋₁` nu amplifică erorile, deci e și
 * singurul lucru care se verifică despre sistemul desenat în clip.
 */
export function esteDiagonalDominant({ a, b, c }: SistemTridiagonal): boolean {
  return b.every(
    (bi, i) =>
      Math.abs(bi) >=
      Math.abs(i === 0 ? 0 : (a[i] ?? 0)) + Math.abs(i === b.length - 1 ? 0 : (c[i] ?? 0)),
  );
}
