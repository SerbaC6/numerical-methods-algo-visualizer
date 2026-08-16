/**
 * Funcțiile pe care se compară formulele de cuadratură.
 *
 * **Nu sunt cele din `functii.ts`.** Acelea vin din cursul de ecuații neliniare
 * și sunt alese ca să aibă o rădăcină convenabilă — o proprietate care aici nu
 * spune nimic. Pe pagina asta contează două lucruri: **primitiva să fie
 * cunoscută exact** (altfel n-ar exista față de ce se măsoară eroarea) și
 * **gradul**, fiindcă tocmai el separă trapezele de Simpson.
 *
 * Nu e o abatere de la regula „conținutul vine din `cursuri_MN/`": cursul
 * (`derivare-integrare-numerica_curs11.md`) dă formulele și termenii lor de
 * eroare, dar **niciun exemplu numeric integrat**. Alegerea funcțiilor e, ca la
 * pagina de derivare, o decizie de afișare — se schimbă pe ce se aplică
 * formula, niciodată formula.
 *
 * Ordinea de mai jos e o demonstrație în cinci pași:
 *
 * 1. **parabola** — Simpson e **exact**, fiindcă el chiar înlocuiește curba cu o
 *    parabolă, iar aici parabola aceea e chiar funcția. Trapezele greșesc.
 * 2. **cubica** — Simpson e exact **și aici**, deși arcul desenat nu mai
 *    coincide cu curba: ce iese peste într-o jumătate intră sub în cealaltă.
 *    Ăsta e gradul de exactitate 3 al formulei, văzut, nu enunțat.
 * 3. **sinusul** — cazul obișnuit, concav pe tot intervalul: coarda trece pe sub
 *    curbă, deci trapezele subevaluează.
 * 4. **inversul** — convex pe tot intervalul, deci exact pe dos: coarda trece pe
 *    deasupra, iar trapezele supraevaluează.
 * 5. **radicalul** — capcana. Integrala există și e finită, dar `f″` e
 *    nemărginită în `0`, deci marginea de eroare a cursului nu se poate calcula
 *    deloc, iar ordinul măsurat scade sub cel promis.
 *
 * Primitivele și derivatele sunt scrise analitic: ele sunt referința față de
 * care se măsoară eroarea, deci nu pot fi ele însele aproximate.
 */

export type FunctieIntegrare = {
  id: string;
  /** Cum se scrie în interfață. */
  eticheta: string;
  f: (x: number) => number;
  /** Primitiva, exactă — de aici iese valoarea de referință a integralei. */
  primitiva: (x: number) => number;
  /** Derivata a doua, exactă: intră în marginea de eroare a trapezelor. */
  derivataDoi: (x: number) => number;
  /** Derivata a patra, exactă: intră în marginea de eroare a lui Simpson. */
  derivataPatru: (x: number) => number;
  /** Intervalul implicit de integrare. */
  interval: readonly [number, number];
  /**
   * Unde e definită funcția. Capetele alese de utilizator nu pot ieși de aici —
   * `1/x` în zero și `√x` sub zero n-ar produce o eroare de calcul, ci un desen
   * fără sens.
   */
  domeniuValid: readonly [number, number];
  /** Ce se vede pe funcția asta, într-o propoziție. */
  ceArata: string;
};

export const FUNCTII_INTEGRARE: FunctieIntegrare[] = [
  {
    id: "parabola",
    eticheta: "x²",
    f: (x) => x * x,
    primitiva: (x) => (x * x * x) / 3,
    derivataDoi: () => 2,
    derivataPatru: () => 0,
    interval: [0, 2],
    domeniuValid: [-50, 50],
    ceArata:
      "Simpson nimerește exact valoarea, oricât de mare ar fi pasul: arcul pe care îl desenează " +
      "e chiar curba. Trapezele greșesc, fiindcă o coardă nu poate urma o parabolă.",
  },
  {
    id: "cubica",
    eticheta: "x³",
    f: (x) => x * x * x,
    primitiva: (x) => (x * x * x * x) / 4,
    derivataDoi: (x) => 6 * x,
    derivataPatru: () => 0,
    interval: [0, 2],
    domeniuValid: [-50, 50],
    ceArata:
      "Simpson e exact și aici, deși arcul desenat nu mai coincide cu curba: cât iese peste ea " +
      "într-o jumătate, atât intră sub ea în cealaltă.",
  },
  {
    id: "sinus",
    eticheta: "sin(x)",
    f: Math.sin,
    primitiva: (x) => -Math.cos(x),
    derivataDoi: (x) => -Math.sin(x),
    derivataPatru: Math.sin,
    interval: [0, Math.PI],
    domeniuValid: [-4 * Math.PI, 4 * Math.PI],
    ceArata:
      "Concavă pe tot intervalul, deci fiecare coardă trece pe sub curbă și trapezele " +
      "subevaluează integrala.",
  },
  {
    id: "invers",
    eticheta: "1/x",
    f: (x) => 1 / x,
    primitiva: Math.log,
    derivataDoi: (x) => 2 / x ** 3,
    derivataPatru: (x) => 24 / x ** 5,
    interval: [1, 2],
    domeniuValid: [0.05, 50],
    ceArata:
      "Convexă pe tot intervalul, adică exact pe dos față de sinus: coarda trece pe deasupra " +
      "curbei, deci trapezele supraevaluează.",
  },
  {
    id: "radical",
    eticheta: "√x",
    f: Math.sqrt,
    primitiva: (x) => (2 / 3) * x ** 1.5,
    derivataDoi: (x) => -0.25 * x ** -1.5,
    derivataPatru: (x) => -(15 / 16) * x ** -3.5,
    interval: [0, 1],
    domeniuValid: [0, 50],
    ceArata:
      "Integrala există și e finită, dar tangenta e verticală în zero: derivatele nu sunt " +
      "mărginite, deci marginea de eroare nu se poate calcula, iar câștigul la fiecare " +
      "înjumătățire a pasului scade sub cel promis.",
  },
];

export function getFunctieIntegrare(id: string): FunctieIntegrare {
  return FUNCTII_INTEGRARE.find((f) => f.id === id) ?? FUNCTII_INTEGRARE[0]!;
}

/**
 * Valoarea exactă a integralei, din primitivă: `F(b) − F(a)`.
 *
 * E referința pentru toate erorile de pe pagină, deci nu se calculează niciodată
 * cu o formulă de cuadratură — nici măcar cu una foarte fină. O aproximare
 * comparată cu altă aproximare n-ar măsura nimic.
 */
export function integralaExacta(functie: FunctieIntegrare, a: number, b: number): number {
  return functie.primitiva(b) - functie.primitiva(a);
}
