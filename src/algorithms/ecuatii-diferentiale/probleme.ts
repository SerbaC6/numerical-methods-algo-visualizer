/**
 * Problema Cauchy pe care se desenează pagina 18.
 *
 * **Sursa formulelor: `cursuri_MN/ode-runge-kutta_curs13.md`.** Cursul definește
 * problema (`y′ = f(t, y)`, `y(a) = α`), condiția Lipschitz și metodele, dar
 * **nu dă niciun exemplu rezolvat numeric**. Exemplul de aici e deci o decizie
 * de afișare, ca la paginile 15 și 16: se alege pe ce se aplică metoda,
 * niciodată cum arată metoda.
 *
 * De ce exemplul ăsta și nu altul. Clipul trebuie să arate trei lucruri, iar
 * `y′ = y − t² + 1` le arată pe toate trei deodată:
 *
 * 1. **soluția se curbează vizibil** — altfel pasul lui Euler ar cădea peste
 *    curbă și n-ar exista nimic de văzut;
 * 2. **familia de soluții e ordonată** — soluțiile prin puncte de pornire
 *    diferite se strâng la stânga și se depărtează la dreapta, deci „albia" are
 *    o formă, nu e un mănunchi de paralele;
 * 3. **soluția exactă se scrie analitic**, deci eroarea fiecărei metode se
 *    măsoară față de un număr adevărat, nu față de altă aproximare.
 */

export type ProblemaCauchy = {
  id: string;
  /** Cum se scrie `f(t, y)` în interfață și în legendă. */
  eticheta: string;
  /** Membrul drept al ecuației: panta cerută în punctul `(t, y)`. */
  f: (t: number, y: number) => number;
  /** Capetele intervalului pe care se rezolvă: `[a, b]`. */
  interval: readonly [number, number];
  /** Condiția inițială `y(a) = α`. */
  alfa: number;
  /**
   * Soluția exactă care trece prin `(t₀, y₀)` — **oricare** punct, nu doar
   * condiția inițială a problemei.
   *
   * Cu ea se desenează „albia": curbele vecine din fundal sunt soluții adevărate
   * ale aceleiași ecuații, nu curbe integrate numeric și nici desenate din ochi.
   */
  solutiePrin: (t0: number, y0: number) => (t: number) => number;
};

/**
 * `y′ = y − t² + 1`, `y(0) = 0,5`, pe `[0, 2]`.
 *
 * Soluția generală se obține imediat: ecuația e liniară, iar `(t + 1)²` e o
 * soluție particulară, fiindcă `d/dt (t+1)² = 2t + 2 = (t+1)² − t² + 1`. Partea
 * omogenă a lui `y′ = y` e `C·eᵗ`, deci
 *
 *     y(t) = (t + 1)² + C·eᵗ,   C = (y₀ − (t₀ + 1)²)·e^(−t₀).
 *
 * Pentru `y(0) = 0,5` iese `C = −0,5`, adică `y(t) = (t + 1)² − ½eᵗ`.
 * Verificat numeric în `scripts/verificare-algoritmi/ecuatii-diferentiale.ts`.
 */
export const PROBLEMA: ProblemaCauchy = {
  id: "crestere",
  eticheta: "y − t² + 1",
  f: (t, y) => y - t * t + 1,
  interval: [0, 2],
  alfa: 0.5,
  solutiePrin: (t0, y0) => {
    const C = (y0 - (t0 + 1) ** 2) * Math.exp(-t0);
    return (t) => (t + 1) ** 2 + C * Math.exp(t);
  },
};

/** Soluția problemei — cea prin `(a, α)`. */
export const SOLUTIA_EXACTA = PROBLEMA.solutiePrin(PROBLEMA.interval[0], PROBLEMA.alfa);
