import { getFunctie } from "@/algorithms/functii";
import type { MetaMetoda, PasRadacina, RezultatRulare } from "@/algorithms/tipuri";
import { latexNumar, zecimale } from "@/lib/numere";

export const meta: MetaMetoda = {
  id: "newton",
  titlu: "Tangenta (Newton-Raphson)",
  rezumat: "Duce tangenta în punctul curent și sare unde ea taie axa orizontală.",
  sursa: "ecuatii_neliniare_MN_curs6.md",
};

export type ParamsNewton = {
  functie: string;
  /** Punctul de pornire, `p₀`. */
  x0: number;
  tol: number;
  maxIteratii: number;
};

/**
 * Metoda tangentei, ca Algorithm 2 din curs:
 *
 * ```
 * x ← x − f(x)/f'(x)      până când |x − xprev| < tol
 * ```
 *
 * Cele două moduri de eșec sunt chiar cele enumerate în curs: derivata se
 * anulează (tangenta devine orizontală și nu mai taie axa), sau punctul de
 * pornire e prea departe, iar șirul pleacă spre infinit.
 */
export function run(params: ParamsNewton): RezultatRulare {
  const { f, fDerivat, domeniuValid } = getFunctie(params.functie);
  const pasi: PasRadacina[] = [];
  let x = params.x0;

  if (!Number.isFinite(f(x))) {
    return {
      pasi: [],
      stare: "esuat",
      motiv: "Funcția nu e definită în punctul de pornire, deci nu se poate calcula nici tangenta.",
    };
  }

  for (let i = 1; i <= params.maxIteratii; i++) {
    const fx = f(x);
    const panta = fDerivat(x);

    // Prima condiție de eșec din curs: f'(pₙ) = 0.
    if (panta === 0 || !Number.isFinite(panta)) {
      return {
        pasi,
        stare: "esuat",
        motiv: `La ${zecimale(x, 6)} derivata e zero, deci tangenta e orizontală și nu taie axa nicăieri. Metoda nu poate face pasul următor — alege alt punct de pornire.`,
      };
    }

    const urmator = x - fx / panta;

    if (!Number.isFinite(urmator)) {
      return {
        pasi,
        stare: "esuat",
        motiv: "Pasul următor iese din domeniul numerelor: metoda a divergit.",
      };
    }

    // A doua condiție din curs: pornire prea departe, deci șirul pleacă.
    if (domeniuValid && (urmator < domeniuValid[0] || urmator > domeniuValid[1])) {
      pasi.push({
        iteratie: i,
        indice: i,
        x: urmator,
        fx: Number.NaN,
        xAnterior: x,
        panta,
        eroare: Math.abs(urmator - x),
        explicatie: `Tangenta în ${zecimale(x, 6)} taie axa în ${zecimale(urmator, 6)}, în afara domeniului pe care funcția există.`,
      });
      return {
        pasi,
        stare: "esuat",
        motiv:
          "Tangenta a aruncat punctul în afara domeniului funcției. Asta e a doua condiție de eșec din curs: punctul de pornire nu era destul de aproape de rădăcină.",
      };
    }

    const eroare = Math.abs(urmator - x);

    pasi.push({
      iteratie: i,
      indice: i,
      x: urmator,
      fx: f(urmator),
      xAnterior: x,
      panta,
      eroare,
      explicatie: `Tangenta dusă în ${zecimale(x, 6)} are panta ${zecimale(panta, 4)} și taie axa în ${zecimale(urmator, 6)}. Saltul făcut e ${zecimale(eroare, 6)}.`,
      latexPas:
        `x_{${i}} = \\htmlId{new-x}{x_{${i - 1}}} - \\frac{f(x_{${i - 1}})}{\\htmlId{new-panta}{f'(x_{${i - 1}})}}` +
        ` = ${latexNumar(x)} - \\frac{${latexNumar(fx)}}{${latexNumar(panta, 4)}} = ${latexNumar(urmator)}`,
      // Panta e chiar dreapta punctată de pe desen: ea decide unde se sare.
      evidentiaza: ["new-panta"],
    });

    x = urmator;

    if (eroare < params.tol) return { pasi, stare: "convergent" };
  }

  return {
    pasi,
    stare: "neterminat",
    motiv: `S-au consumat cele ${params.maxIteratii} iterații fără ca saltul să scadă sub toleranță.`,
  };
}
