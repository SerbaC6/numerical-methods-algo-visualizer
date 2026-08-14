/**
 * Formulele de derivare numerică.
 *
 * **Sursă: `cursuri_MN/derivare-integrare-numerica_curs11.md`**, secțiunile
 * „Formula two-point", „Formulele cu 3 puncte" și „Observație: eroarea de
 * rotunjire". Nimic scris din memorie.
 *
 * **De ce o listă de formule, nu un `run(params)` cu pași.** Restul paginilor
 * din site rulează un algoritm iterativ și produc `steps[]`. Aici nu există
 * iterație: fiecare formulă e o singură evaluare, iar ce se schimbă e `h`.
 * Contractul comun al proiectului n-ar avea ce descrie — de aceea pagina lucrează
 * cu o listă de formule și cu o baleiere după `h`, în `eroare.ts`.
 *
 * **Semnul lui `h`.** Cursul spune limpede: formula two-point se numește
 * derivare **înainte** pentru `h > 0` și **înapoi** pentru `h < 0`. Deci nu sunt
 * două formule, ci una singură cu semn schimbat. Aici apar totuși ca două
 * intrări separate, fiindcă pe ecran sunt două desene diferite — dar amândouă
 * cheamă aceeași funcție, cu `h` sau cu `−h`.
 */

/** Ce puncte folosește o formulă, ca desenul să știe ce să marcheze. */
export type NodFormula = {
  /** Abscisa nodului, ca multiplu de `h` față de `x₀`. */
  multiplu: number;
  /** Coeficientul cu care intră `f(x)` în formulă, **fără** împărțirea la `h`. */
  coeficient: number;
};

export type FormulaDerivare = {
  id: string;
  eticheta: string;
  /** Formula în LaTeX, cu `\htmlId` pe părțile legate de desen. */
  latex: string;
  /** Ordinul derivatei aproximate: 1 sau 2. */
  ordin: 1 | 2;
  /**
   * Exponentul lui `h` din termenul de eroare: `O(h)` sau `O(h²)`.
   *
   * E numărul care decide totul pe graficul de convergență — panta dreptei.
   */
  ordinEroare: number;
  /** Termenul de eroare, scris cum îl scrie cursul. */
  latexEroare: string;
  /** Nodurile folosite, cu coeficienții lor. Suma coeficienților e mereu 0. */
  noduri: readonly NodFormula[];
  /** Împărțitorul: `h`, `2h` sau `h²`. */
  numitor: (h: number) => number;
  /** Cum se scrie numitorul. */
  numitorLatex: string;
  aproximeaza: (f: (x: number) => number, x0: number, h: number) => number;
};

/** Aplică o combinație de noduri: `Σ cₖ·f(x₀ + mₖ·h) / numitor(h)`. */
function aplica(
  noduri: readonly NodFormula[],
  numitor: (h: number) => number,
  f: (x: number) => number,
  x0: number,
  h: number,
): number {
  const suma = noduri.reduce((acc, nod) => acc + nod.coeficient * f(x0 + nod.multiplu * h), 0);
  return suma / numitor(h);
}

export const FORMULE: readonly FormulaDerivare[] = [
  {
    id: "inainte",
    eticheta: "Două puncte, înainte",
    ordin: 1,
    ordinEroare: 1,
    latex:
      "f'(x_0) \\approx \\frac{\\htmlId{der-plus}{f(x_0+h)} - \\htmlId{der-zero}{f(x_0)}}{\\htmlId{der-h}{h}}",
    latexEroare: "-\\frac{h}{2}f''(\\xi), \\quad \\xi \\in [x_0,\\; x_0+h]",
    noduri: [
      { multiplu: 1, coeficient: 1 },
      { multiplu: 0, coeficient: -1 },
    ],
    numitor: (h) => h,
    numitorLatex: "h",
    aproximeaza: (f, x0, h) => (f(x0 + h) - f(x0)) / h,
  },
  {
    id: "inapoi",
    eticheta: "Două puncte, înapoi",
    ordin: 1,
    ordinEroare: 1,
    latex:
      "f'(x_0) \\approx \\frac{\\htmlId{der-zero}{f(x_0)} - \\htmlId{der-plus}{f(x_0-h)}}{\\htmlId{der-h}{h}}",
    latexEroare: "\\frac{h}{2}f''(\\xi), \\quad \\xi \\in [x_0-h,\\; x_0]",
    noduri: [
      { multiplu: 0, coeficient: 1 },
      { multiplu: -1, coeficient: -1 },
    ],
    numitor: (h) => h,
    numitorLatex: "h",
    // Aceeași formulă ca înainte, cu `h` schimbat de semn — cum spune cursul.
    aproximeaza: (f, x0, h) => (f(x0) - f(x0 - h)) / h,
  },
  {
    id: "mijloc",
    eticheta: "Trei puncte, punct de mijloc",
    ordin: 1,
    ordinEroare: 2,
    latex:
      "f'(x_0) \\approx \\frac{1}{\\htmlId{der-h}{2h}}\\left[\\htmlId{der-plus}{f(x_0+h)} - \\htmlId{der-minus}{f(x_0-h)}\\right]",
    latexEroare: "-\\frac{h^2}{6}f'''(\\xi), \\quad \\xi \\in [x_0-h,\\; x_0+h]",
    noduri: [
      { multiplu: 1, coeficient: 1 },
      { multiplu: -1, coeficient: -1 },
    ],
    numitor: (h) => 2 * h,
    numitorLatex: "2h",
    aproximeaza: (f, x0, h) => (f(x0 + h) - f(x0 - h)) / (2 * h),
  },
  {
    id: "capat",
    eticheta: "Trei puncte, punct final",
    ordin: 1,
    ordinEroare: 2,
    latex:
      "f'(x_0) \\approx \\frac{1}{\\htmlId{der-h}{2h}}\\left[-3\\,\\htmlId{der-zero}{f(x_0)} + 4\\,\\htmlId{der-plus}{f(x_0+h)} - \\htmlId{der-doi}{f(x_0+2h)}\\right]",
    latexEroare: "\\frac{h^2}{3}f'''(\\xi), \\quad \\xi \\in [x_0,\\; x_0+2h]",
    noduri: [
      { multiplu: 0, coeficient: -3 },
      { multiplu: 1, coeficient: 4 },
      { multiplu: 2, coeficient: -1 },
    ],
    numitor: (h) => 2 * h,
    numitorLatex: "2h",
    aproximeaza: (f, x0, h) => (-3 * f(x0) + 4 * f(x0 + h) - f(x0 + 2 * h)) / (2 * h),
  },
  {
    id: "derivata-doua",
    eticheta: "Derivata a doua, punct de mijloc",
    ordin: 2,
    ordinEroare: 2,
    latex:
      "f''(x_0) \\approx \\frac{1}{\\htmlId{der-h}{h^2}}\\left[\\htmlId{der-minus}{f(x_0-h)} - 2\\,\\htmlId{der-zero}{f(x_0)} + \\htmlId{der-plus}{f(x_0+h)}\\right]",
    latexEroare: "-\\frac{h^2}{12}f^{(4)}(\\xi)",
    noduri: [
      { multiplu: -1, coeficient: 1 },
      { multiplu: 0, coeficient: -2 },
      { multiplu: 1, coeficient: 1 },
    ],
    numitor: (h) => h * h,
    numitorLatex: "h^2",
    aproximeaza: (f, x0, h) => (f(x0 - h) - 2 * f(x0) + f(x0 + h)) / (h * h),
  },
];

export function getFormula(id: string): FormulaDerivare {
  return FORMULE.find((formula) => formula.id === id) ?? FORMULE[0]!;
}

/** Nodurile unei formule, în coordonate adevărate — pentru desen. */
export function noduriConcrete(
  formula: FormulaDerivare,
  f: (x: number) => number,
  x0: number,
  h: number,
): { x: number; y: number; coeficient: number }[] {
  return formula.noduri.map((nod) => ({
    x: x0 + nod.multiplu * h,
    y: f(x0 + nod.multiplu * h),
    coeficient: nod.coeficient,
  }));
}

/** Verificarea că formula chiar e o combinație de diferențe: `Σcₖ = 0`. */
export function sumaCoeficientilor(formula: FormulaDerivare): number {
  return formula.noduri.reduce((acc, nod) => acc + nod.coeficient, 0);
}

export { aplica as aplicaFormula };
