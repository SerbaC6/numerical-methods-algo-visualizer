/**
 * Funcțiile pe care se pot rula metodele din pagina 5.
 *
 * **Toate vin din `cursuri_MN/ecuatii_neliniare_MN_curs6.md`**: primele cinci
 * sunt exact cele din tabelul comparativ de la secțiunea 2.3, iar ultima e
 * exemplul rezolvat de la puncte fixe, cu numărul de aur.
 *
 * Utilizatorul **alege** dintre ele, nu scrie el o expresie. Nu e o
 * simplificare de moment, ci consecința a două reguli ale proiectului: nu
 * folosim niciodată `eval`, iar parserul adevărat de expresii vine abia în
 * Faza 4. Până atunci, o listă venită din curs e și mai fidelă sursei decât un
 * câmp liber.
 *
 * Derivata e scrisă analitic, nu aproximată numeric: metoda tangentei o cere
 * exactă, iar o aproximare ar strica tocmai convergența pătratică pe care
 * pagina o demonstrează.
 */

export type FunctieTest = {
  id: string;
  /** Cum se scrie în interfață și în titlul graficului. */
  eticheta: string;
  /** Aceeași funcție în LaTeX, pentru `FormulaBlock`. */
  latex: string;
  f: (x: number) => number;
  /** Derivata analitică — obligatorie pentru metoda tangentei. */
  fDerivat: (x: number) => number;
  /**
   * Forma de punct fix `x = g(x)`, **doar** unde cursul o dă explicit.
   * Nu se inventează: transformarea `f(x) = 0 → x = g(x)` nu e unică, iar o
   * alegere greșită diverge, ceea ce ar contrazice exemplul din curs.
   */
  g?: (x: number) => number;
  /** Cum arată `g` scrisă, pentru interfață. */
  gLatex?: string;
  /** Interval de pornire recomandat, cu schimbare de semn la capete. */
  interval: readonly [number, number];
  /** Domeniul pe care are sens desenul (evită log din negativ, etc.). */
  domeniuValid?: readonly [number, number];
  /**
   * De unde pornesc tangenta și secanta **ca să se vadă ce fac**.
   *
   * Nu vine din curs și nu e matematică: e o alegere de afișare, măsurată cu
   * `scripts/verificare-algoritmi/alegere-pornire.ts`. Motivul e că `interval`
   * de mai sus stă lipit de rădăcină — bun pentru bisecție, care are nevoie de
   * schimbare de semn, dar inutil pentru celelalte două: pornite de-acolo,
   * termină în patru pași, iar primul cade deja practic pe soluție. Nu se vede
   * nici tangenta, nici de ce ar fi metoda mai bună decât înjumătățirea.
   *
   * Alegerea ține de **două** măsuri deodată, nu doar de numărul de pași. Un
   * punct de pornire foarte îndepărtat dă mulți pași, dar duce funcția în
   * valori uriașe: pe `0,25·eˣ` pornit din 9, curba urcă la 2000, iar pe ecran
   * devine o cârjă lipită de axă, cu rădăcina pierdută în porțiunea plată. De
   * aceea se cere și ca `|f|` să rămână sub câteva zeci pe tot drumul.
   *
   * Sunt tot puncte de pornire valide — se schimbă **de unde pleacă** metoda,
   * niciodată ce calculează.
   */
  pornireTangenta: number;
  /** Aceeași alegere, pentru secantă, care cere două valori. */
  pornireSecanta: readonly [number, number];
  /**
   * Rădăcina din intervalul recomandat, pentru coloana de eroare din tabel.
   *
   * **Calculată, nu ghicită.** Valorile iraționale de mai jos vin din `mpmath`
   * cu 30 de cifre, rotunjite la `float64`; cele exprimabile exact (`√2`,
   * `ln 8`, `e²`, numărul de aur) se scriu ca expresie, nu ca literal.
   *
   * Nu e un detaliu: prima versiune a fișierului avea două valori scrise din
   * memorie, amândouă greșite — verificarea automată le-a prins fiindcă
   * bisecția converge la rădăcina adevărată, nu la cea declarată aici.
   */
  radacina: number;
};

export const FUNCTII: FunctieTest[] = [
  {
    id: "cub",
    eticheta: "x³ − 2x − 5",
    latex: "f(x) = x^3 - 2x - 5",
    f: (x) => x ** 3 - 2 * x - 5,
    fDerivat: (x) => 3 * x ** 2 - 2,
    interval: [2, 3],
    pornireTangenta: 4,
    pornireSecanta: [3, 4],
    radacina: 2.0945514815423265,
  },
  {
    id: "patrat-minus-doi",
    eticheta: "x² − 2",
    latex: "f(x) = x^2 - 2",
    f: (x) => x * x - 2,
    fDerivat: (x) => 2 * x,
    interval: [1, 2],
    pornireTangenta: 5,
    pornireSecanta: [4, 5],
    radacina: Math.SQRT2,
  },
  {
    id: "exponential",
    eticheta: "0,25·eˣ − 2",
    latex: "f(x) = 0{,}25\\,e^{x} - 2",
    f: (x) => 0.25 * Math.exp(x) - 2,
    fDerivat: (x) => 0.25 * Math.exp(x),
    interval: [1, 3],
    // ln(8)
    pornireTangenta: 5,
    pornireSecanta: [-1, 1],
    radacina: Math.log(8),
  },
  {
    id: "cosinus",
    eticheta: "3·cos(x) − 4x",
    latex: "f(x) = 3\\cos(x) - 4x",
    f: (x) => 3 * Math.cos(x) - 4 * x,
    fDerivat: (x) => -3 * Math.sin(x) - 4,
    interval: [0, 1],
    pornireTangenta: -1,
    pornireSecanta: [3, 4],
    radacina: 0.6133103527035523,
  },
  {
    id: "logaritm",
    eticheta: "ln(x) − 2",
    latex: "f(x) = \\ln(x) - 2",
    f: (x) => Math.log(x) - 2,
    fDerivat: (x) => 1 / x,
    interval: [6, 9],
    // Logaritmul nu există sub zero: desenul s-ar rupe fără marginea asta.
    domeniuValid: [0.05, Number.POSITIVE_INFINITY],
    pornireTangenta: 18,
    pornireSecanta: [15, 18],
    radacina: Math.E ** 2,
  },
  {
    id: "radical",
    eticheta: "x² + √x − 6",
    latex: "f(x) = x^2 + \\sqrt{x} - 6",
    f: (x) => x * x + Math.sqrt(x) - 6,
    fDerivat: (x) => 2 * x + 1 / (2 * Math.sqrt(x)),
    interval: [1, 3],
    domeniuValid: [0, Number.POSITIVE_INFINITY],
    pornireTangenta: 1,
    pornireSecanta: [1, 3],
    radacina: 2.1307924759421035,
  },
  {
    id: "aur",
    eticheta: "x² − x − 1",
    latex: "f(x) = x^2 - x - 1",
    f: (x) => x * x - x - 1,
    fDerivat: (x) => 2 * x - 1,
    // Forma de punct fix e chiar cea din curs: x² − x − 1 = 0 ⟹ x = √(x+1).
    g: (x) => Math.sqrt(x + 1),
    gLatex: "g(x) = \\sqrt{x + 1}",
    interval: [1, 2],
    domeniuValid: [-1, Number.POSITIVE_INFINITY],
    // Numărul de aur, (1 + √5)/2
    pornireTangenta: 8,
    pornireSecanta: [7, 8],
    radacina: (1 + Math.sqrt(5)) / 2,
  },
];

export function getFunctie(id: string): FunctieTest {
  const f = FUNCTII.find((fn) => fn.id === id);
  if (!f) throw new Error(`Funcția „${id}" nu există în lista din curs.`);
  return f;
}
