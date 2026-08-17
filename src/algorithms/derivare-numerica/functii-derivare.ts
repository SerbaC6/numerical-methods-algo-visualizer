/**
 * Funcțiile pe care se compară formulele de derivare.
 *
 * **Nu sunt cele din `functii.ts`.** Acelea vin din cursul de ecuații
 * neliniare și sunt alese ca să aibă o rădăcină convenabilă — o proprietate
 * care aici nu spune nimic. Pe pagina asta contează cu totul altceva:
 * **curbura**, fiindcă exact ea e ce lasă în urmă o formulă de derivare.
 *
 * Nu e o abatere de la regula „conținutul vine din `cursuri_MN/`": cursul de
 * derivare (`derivare-integrare-numerica_curs11.md`) dă formulele și termenii
 * lor de eroare, dar **niciun exemplu numeric**. Alegerea funcțiilor e, ca
 * `pornireTangenta` din `functii.ts`, o decizie de afișare — se schimbă pe ce
 * se aplică formula, niciodată formula.
 *
 * Ordinea de mai jos e o demonstrație în patru pași, și de aceea contează:
 *
 * 1. **dreapta** — orice formulă e exactă. Eroarea nu vine din metodă, ci din
 *    ce se abate funcția de la o dreaptă pe intervalul folosit;
 * 2. **parabola** — punctul de mijloc e **exact**, iar cele două puncte
 *    greșesc cu exact `h`. Cea mai curată separare dintre formule de pe pagină:
 *    aceeași funcție, o formulă fără nicio eroare și una cu eroare vizibilă;
 * 3. **cubica** — și mijlocul greșește acum, dar cu `h²/3`, nu cu ceva de
 *    ordinul lui `h`. Aici se vede ce înseamnă „un ordin mai bun";
 * 4. **sinusul** și **exponențiala** — cazul obișnuit, unde toate derivatele
 *    sunt nenule și nicio formulă nu nimerește exact.
 *
 * Derivatele sunt scrise analitic: ele sunt referința față de care se măsoară
 * eroarea, deci nu pot fi ele însele aproximate.
 */

export type FunctieDerivare = {
  id: string;
  /** Cum se scrie în interfață. */
  eticheta: string;
  f: (x: number) => number;
  /** Derivata întâi, exactă — referința pentru eroare. */
  fPrim: (x: number) => number;
  /** Derivata a doua, exactă — referința pentru formula de ordinul doi. */
  fSecund: (x: number) => number;
  /** Ce se vede pe funcția asta, într-o propoziție. */
  ceArata: string;
  /** Punctul de lucru implicit, ales cât să nu cadă pe un caz special. */
  x0: number;
};

export const FUNCTII_DERIVARE: FunctieDerivare[] = [
  {
    id: "dreapta",
    eticheta: "2x − 1",
    f: (x) => 2 * x - 1,
    fPrim: () => 2,
    fSecund: () => 0,
    ceArata:
      "Fără curbură, toate formulele dau chiar 2. Eroarea unei formule de derivare vine din " +
      "cât se abate funcția de la o dreaptă, nu din formulă.",
    x0: 1,
  },
  {
    id: "parabola",
    eticheta: "x²",
    f: (x) => x * x,
    fPrim: (x) => 2 * x,
    fSecund: () => 2,
    ceArata: "Curbura e aceeași peste tot, deci eroarea nu depinde de unde se calculează.",
    x0: 1,
  },
  {
    id: "cubica",
    eticheta: "x³/3",
    f: (x) => (x * x * x) / 3,
    fPrim: (x) => x * x,
    fSecund: (x) => 2 * x,
    ceArata:
      "Acum greșesc amândouă — mijlocul cu h²/3, iar cele două puncte cu x·h + h²/3, adică mult mai mult.",
    x0: 1,
  },
  {
    id: "sinus",
    eticheta: "sin(x)",
    f: Math.sin,
    fPrim: Math.cos,
    fSecund: (x) => -Math.sin(x),
    ceArata: "Cazul obișnuit: nicio formulă nu nimerește exact, oricât ai micșora pasul.",
    x0: 0.6,
  },
  {
    id: "exponentiala",
    eticheta: "eˣ",
    f: Math.exp,
    fPrim: Math.exp,
    fSecund: Math.exp,
    ceArata: "Toate derivatele sunt egale cu funcția, deci eroarea crește odată cu ea.",
    x0: 0.6,
  },
];

export function getFunctieDerivare(id: string): FunctieDerivare {
  return FUNCTII_DERIVARE.find((f) => f.id === id) ?? FUNCTII_DERIVARE[1]!;
}
