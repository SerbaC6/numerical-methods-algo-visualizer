import { getFunctie } from "@/algorithms/functii";
import type { MetaMetoda, PasRadacina, RezultatRulare } from "@/algorithms/tipuri";
import { zecimale } from "@/lib/numere";

export const meta: MetaMetoda = {
  id: "secanta",
  titlu: "Secanta",
  rezumat: "Ca Newton, dar panta se estimează din ultimele două puncte, fără derivată.",
  sursa: "ecuatii_neliniare_MN_curs6.md",
};

export type ParamsSecanta = {
  functie: string;
  /** Cele două valori de pornire, `p₀` și `p₁`. */
  x0: number;
  x1: number;
  tol: number;
  maxIteratii: number;
};

/**
 * Metoda secantei, ca Algorithm 3 din curs:
 *
 * ```
 * x ← x1 − f(x1)·(x1 − x0)/( f(x1) − f(x0) )
 * ```
 *
 * Spre deosebire de tangentă, nu cere derivata — dar cere **două** valori de
 * pornire. Eșuează când cele două puncte ajung la aceeași valoare a funcției:
 * secanta devine orizontală, iar împărțirea de mai sus e la zero.
 */
export function run(params: ParamsSecanta): RezultatRulare {
  const { f } = getFunctie(params.functie);
  const pasi: PasRadacina[] = [];
  let x0 = params.x0;
  let x1 = params.x1;

  if (x0 === x1) {
    return {
      pasi: [],
      stare: "esuat",
      motiv: "Cele două valori de pornire coincid: prin acelaşi punct nu trece o singură secantă.",
    };
  }
  if (!Number.isFinite(f(x0)) || !Number.isFinite(f(x1))) {
    return {
      pasi: [],
      stare: "esuat",
      motiv: "Funcția nu e definită în una dintre valorile de pornire.",
    };
  }

  for (let i = 1; i <= params.maxIteratii; i++) {
    const f0 = f(x0);
    const f1 = f(x1);
    const numitor = f1 - f0;

    if (numitor === 0 || !Number.isFinite(numitor)) {
      return {
        pasi,
        stare: "esuat",
        motiv: `Funcția ia aceeași valoare în ${zecimale(x0, 6)} și ${zecimale(x1, 6)}, deci secanta prin ele e orizontală și nu taie axa. Metoda se oprește aici.`,
      };
    }

    const panta = numitor / (x1 - x0);
    const urmator = x1 - (f1 * (x1 - x0)) / numitor;

    if (!Number.isFinite(urmator)) {
      return { pasi, stare: "esuat", motiv: "Pasul următor iese din domeniul numerelor: metoda a divergit." };
    }

    const eroare = Math.abs(urmator - x1);

    pasi.push({
      iteratie: i,
      x: urmator,
      fx: f(urmator),
      xAnterior: x1,
      xPenultim: x0,
      panta,
      eroare,
      explicatie: `Secanta prin ${zecimale(x0, 6)} și ${zecimale(x1, 6)} are panta ${zecimale(panta, 4)} și taie axa în ${zecimale(urmator, 6)}. Saltul făcut e ${zecimale(eroare, 6)}.`,
    });

    x0 = x1;
    x1 = urmator;

    if (eroare < params.tol) return { pasi, stare: "convergent" };
  }

  return {
    pasi,
    stare: "neterminat",
    motiv: `S-au consumat cele ${params.maxIteratii} iterații fără ca saltul să scadă sub toleranță.`,
  };
}
