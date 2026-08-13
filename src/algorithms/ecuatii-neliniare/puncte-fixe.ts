import { getFunctie } from "@/algorithms/functii";
import type { MetaMetoda, PasRadacina, RezultatRulare } from "@/algorithms/tipuri";
import { latexNumar, zecimale } from "@/lib/numere";

export const meta: MetaMetoda = {
  id: "puncte-fixe",
  titlu: "Puncte fixe",
  rezumat: "Rescrie ecuația ca x = g(x) și aplică g la nesfârșit.",
  sursa: "ecuatii_neliniare_MN_curs6.md",
};

export type ParamsPuncteFixe = {
  functie: string;
  /** Aproximarea inițială, `p₀`. */
  x0: number;
  tol: number;
  maxIteratii: number;
};

/** Peste atât considerăm că șirul a plecat spre infinit, nu că mai converge. */
const PRAG_DIVERGENTA = 1e12;

/**
 * Iterația de punct fix, `pₙ = g(pₙ₋₁)`.
 *
 * **Merge doar pe funcțiile pentru care cursul dă explicit forma `x = g(x)`.**
 * Transformarea `f(x) = 0 → x = g(x)` nu e unică, iar alegerea greșită diverge:
 * pentru `x² − x − 1 = 0`, forma `g(x) = x² − 1` pleacă la infinit, în timp ce
 * `g(x) = √(x+1)` — cea din curs — converge la numărul de aur. A inventa noi o
 * transformare ar însemna să punem pe site matematică din altă sursă.
 *
 * `fx` din pas ține `g(x) − x`, adică exact cât mai e până la punctul fix: e
 * zero fix acolo unde `g(x) = x`, deci desenul poate arăta același lucru ca la
 * celelalte metode.
 */
export function run(params: ParamsPuncteFixe): RezultatRulare {
  const functie = getFunctie(params.functie);
  const { g, domeniuValid } = functie;

  if (!g) {
    return {
      pasi: [],
      stare: "esuat",
      motiv: `Pentru ${functie.eticheta} cursul nu dă o formă „x = g(x)", iar noi nu inventăm una: transformarea nu e unică, iar o alegere greșită diverge.`,
    };
  }

  const pasi: PasRadacina[] = [];
  let x = params.x0;

  if (!Number.isFinite(g(x))) {
    return { pasi: [], stare: "esuat", motiv: "g nu e definită în punctul de pornire." };
  }

  for (let i = 1; i <= params.maxIteratii; i++) {
    const urmator = g(x);

    if (!Number.isFinite(urmator) || Math.abs(urmator) > PRAG_DIVERGENTA) {
      return {
        pasi,
        stare: "esuat",
        motiv:
          "Șirul a plecat spre infinit. Iterația converge doar dacă g strânge distanțele, adică dacă |g′(x)| < 1 pe intervalul folosit.",
      };
    }
    if (domeniuValid && (urmator < domeniuValid[0] || urmator > domeniuValid[1])) {
      return {
        pasi,
        stare: "esuat",
        motiv: "Iterația a ieșit din domeniul pe care g e definită.",
      };
    }

    const eroare = Math.abs(urmator - x);

    pasi.push({
      iteratie: i,
      indice: i,
      x: urmator,
      // Distanța până la punctul fix, ca desenul să aibă un „zero" de arătat.
      fx: g(urmator) - urmator,
      xAnterior: x,
      eroare,
      explicatie: `g aplicată lui ${zecimale(x, 6)} dă ${zecimale(urmator, 6)}. Distanța față de pasul anterior e ${zecimale(eroare, 6)} — cu cât e mai mică, cu atât suntem mai aproape de punctul fix.`,
      latexPas: `x_{${i}} = \\htmlId{pf-g}{g\\!\\left(x_{${i - 1}}\\right)} = g\\!\\left(${latexNumar(x)}\\right) = ${latexNumar(urmator)}`,
      // Aplicarea lui g e chiar saltul desenat: de la punctul dinainte la cel
      // de acum, pe curba g(x) − x.
      evidentiaza: ["pf-g"],
    });

    x = urmator;

    if (eroare < params.tol) return { pasi, stare: "convergent" };
  }

  return {
    pasi,
    stare: "neterminat",
    motiv: `S-au consumat cele ${params.maxIteratii} iterații fără ca distanța dintre doi pași să scadă sub toleranță.`,
  };
}
