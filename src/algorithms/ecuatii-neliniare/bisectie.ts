import { getFunctie } from "@/algorithms/functii";
import type { MetaMetoda, PasRadacina, RezultatRulare } from "@/algorithms/tipuri";
import { zecimale } from "@/lib/numere";

export const meta: MetaMetoda = {
  id: "bisectie",
  titlu: "Bisecția",
  rezumat: "Înjumătățește intervalul și păstrează jumătatea în care funcția își schimbă semnul.",
  sursa: "ecuatii_neliniare_MN_curs6.md",
};

export type ParamsBisectie = {
  functie: string;
  a: number;
  b: number;
  tol: number;
  maxIteratii: number;
};

/**
 * Metoda bisecției, exact ca Algorithm 1 din curs.
 *
 * ```
 * c ← (a + b)/2
 * dacă f(a)·f(c) < 0  atunci  b ← c   altfel  a ← c
 * ```
 *
 * Criteriul de oprire folosit e **lungimea intervalului**, `b − a < tol`, primul
 * dintre cele enumerate în curs. E și singurul care se poate garanta dinainte,
 * prin `|pₙ − p| < (b − a)/2ⁿ` — de-aia îl preferăm celui pe `|f(c)|`, care
 * depinde de cât de abruptă e funcția.
 */
export function run(params: ParamsBisectie): RezultatRulare {
  const { f } = getFunctie(params.functie);
  let a = params.a;
  let b = params.b;

  if (a === b) {
    return {
      pasi: [],
      stare: "esuat",
      motiv: "Capetele intervalului coincid, deci n-are ce fi înăuntru.",
    };
  }
  if (a > b) [a, b] = [b, a];

  const fa0 = f(a);
  const fb0 = f(b);

  if (!Number.isFinite(fa0) || !Number.isFinite(fb0)) {
    return {
      pasi: [],
      stare: "esuat",
      motiv: "Funcția nu e definită la unul dintre capete, deci semnul ei nu se poate compara.",
    };
  }

  // Condiția de pornire din curs: f(a)·f(b) < 0. Fără ea, metoda n-are ce
  // garanta — pe intervalul dat poate să nu existe nicio rădăcină, sau să fie
  // două, iar înjumătățirea ar alege la întâmplare.
  if (fa0 * fb0 > 0) {
    return {
      pasi: [],
      stare: "esuat",
      motiv:
        "Funcția are același semn la ambele capete, deci nu putem ști că există o rădăcină între ele. Alege un interval în care semnul se schimbă.",
    };
  }

  // Capătul e chiar rădăcina: nu mai e nimic de înjumătățit.
  if (fa0 === 0 || fb0 === 0) {
    const x = fa0 === 0 ? a : b;
    return {
      pasi: [
        {
          iteratie: 1,
          interval: { a, b },
          x,
          fx: 0,
          eroare: 0,
          explicatie: `Funcția e chiar zero în capătul ${zecimale(x, 4)}, deci acela e rădăcina — nu mai e nimic de căutat.`,
        },
      ],
      stare: "convergent",
    };
  }

  const pasi: PasRadacina[] = [];
  let stare: RezultatRulare["stare"] = "neterminat";

  for (let i = 1; i <= params.maxIteratii; i++) {
    const c = (a + b) / 2;
    const fc = f(c);
    const lungime = b - a;

    // Latura păstrată e cea în care semnul se schimbă — literal testul din curs.
    const stangaPastrata = f(a) * fc < 0;

    let explicatie: string;
    if (fc === 0) {
      explicatie = `Mijlocul ${zecimale(c, 6)} anulează exact funcția, deci e chiar rădăcina.`;
    } else if (stangaPastrata) {
      explicatie = `f(a) și f(c) au semne diferite, deci rădăcina e în stânga lui ${zecimale(c, 6)}. Capătul din dreapta coboară la el, iar intervalul se înjumătățește la ${zecimale(lungime / 2, 6)}.`;
    } else {
      explicatie = `f(a) și f(c) au același semn, deci rădăcina e în dreapta lui ${zecimale(c, 6)}. Capătul din stânga urcă la el, iar intervalul se înjumătățește la ${zecimale(lungime / 2, 6)}.`;
    }

    pasi.push({
      iteratie: i,
      interval: { a, b },
      x: c,
      fx: fc,
      eroare: lungime,
      explicatie,
    });

    if (fc === 0) {
      stare = "convergent";
      break;
    }

    if (stangaPastrata) b = c;
    else a = c;

    if (b - a < params.tol) {
      stare = "convergent";
      break;
    }
  }

  if (stare === "neterminat" && pasi.length >= params.maxIteratii) {
    return {
      pasi,
      stare: "neterminat",
      motiv: `S-au consumat cele ${params.maxIteratii} iterații fără ca intervalul să scadă sub toleranță. Bisecția tot converge — doar că îi trebuie mai mulți pași.`,
    };
  }

  return { pasi, stare };
}
