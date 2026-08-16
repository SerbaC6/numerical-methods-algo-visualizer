/**
 * Funcțiile pe care se compară cuadraturile adaptive și cele Gaussiene.
 *
 * Patru dintre ele sunt **chiar cele de la pagina 16** (`newton-cotes`), și asta
 * nu e economie de scris: cele două pagini spun lucruri diferite despre același
 * material, iar dacă funcțiile ar diferi n-ar mai fi nimic de comparat. Ce se
 * schimbă e metoda, nu integrala.
 *
 * Una singură e nouă, `e⁻³ˣ·sin 4x`, și e chiar funcția desenată în curs la
 * capitolul de cuadraturi adaptive. Ea e cazul care justifică metoda: oscilează
 * puternic lângă zero și e practic plată după `x = 2`, deci un pas uniform ori e
 * prea mare la stânga, ori se irosește la dreapta.
 *
 * Primitivele și derivatele sunt scrise analitic — sunt referința față de care
 * se măsoară eroarea, deci nu pot fi ele însele aproximate. Pentru funcția nouă
 * ies dintr-un singur calcul: `f = Im(e^((−3+4i)x))`, deci derivata de ordin `n`
 * e `Im((−3+4i)ⁿ·e^((−3+4i)x))`, iar `(−3+4i)² = −7 − 24i` și
 * `(−3+4i)⁴ = −527 + 336i`. Toate sunt verificate numeric în
 * `scripts/verificare-algoritmi/cuadraturi.ts`.
 */
import {
  getFunctieIntegrare,
  type FunctieIntegrare,
} from "@/algorithms/newton-cotes/functii-integrare";

/** `e⁻³ˣ·sin 4x` pe `[0, 4]` — funcția din curs, de la cuadraturi adaptive. */
const OSCILANTA: FunctieIntegrare = {
  id: "oscilanta",
  eticheta: "e⁻³ˣ·sin(4x)",
  f: (x) => Math.exp(-3 * x) * Math.sin(4 * x),
  primitiva: (x) => (Math.exp(-3 * x) * (-3 * Math.sin(4 * x) - 4 * Math.cos(4 * x))) / 25,
  derivataDoi: (x) => Math.exp(-3 * x) * (-7 * Math.sin(4 * x) - 24 * Math.cos(4 * x)),
  derivataPatru: (x) => Math.exp(-3 * x) * (-527 * Math.sin(4 * x) + 336 * Math.cos(4 * x)),
  interval: [0, 4],
  domeniuValid: [-2, 12],
  ceArata:
    "Un vârf ascuțit lângă zero și o coadă plată după el. Un pas uniform destul de mic pentru vârf " +
    "se irosește pe restul intervalului, iar unul potrivit pentru coadă ratează vârful.",
};

/**
 * Ordinea din listă e ordinea în care se citește pagina: întâi cazul care cere
 * adaptivul, apoi cel pe care Gauss e exact, apoi cazurile obișnuite și, la
 * final, capcana.
 */
export const FUNCTII_CUADRATURA: FunctieIntegrare[] = [
  OSCILANTA,
  getFunctieIntegrare("cubica"),
  getFunctieIntegrare("sinus"),
  getFunctieIntegrare("invers"),
  getFunctieIntegrare("radical"),
];

export function getFunctieCuadratura(id: string): FunctieIntegrare {
  return FUNCTII_CUADRATURA.find((f) => f.id === id) ?? FUNCTII_CUADRATURA[0]!;
}
