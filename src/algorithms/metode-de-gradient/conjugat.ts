/**
 * Metoda gradientului conjugat.
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §8.6 —
 * schema pe scurt**, luată literal:
 *
 * ```
 * r⁽⁰⁾ = b − A·x⁽⁰⁾;   v⁽¹⁾ = r⁽⁰⁾
 * pentru k = 1, 2, …, n:
 *     t_k     = ⟨r⁽ᵏ⁻¹⁾, r⁽ᵏ⁻¹⁾⟩ / ⟨v⁽ᵏ⁾, A·v⁽ᵏ⁾⟩
 *     x⁽ᵏ⁾    = x⁽ᵏ⁻¹⁾ + t_k·v⁽ᵏ⁾
 *     r⁽ᵏ⁾    = r⁽ᵏ⁻¹⁾ − t_k·A·v⁽ᵏ⁾
 *     s_k     = ⟨r⁽ᵏ⁾, r⁽ᵏ⁾⟩ / ⟨r⁽ᵏ⁻¹⁾, r⁽ᵏ⁻¹⁾⟩
 *     v⁽ᵏ⁺¹⁾  = r⁽ᵏ⁾ + s_k·v⁽ᵏ⁾
 * ```
 *
 * **Notația e cea din cursul 5** (`t_k`, `v⁽ᵏ⁾`, `s_k`), nu cea din cursul 6
 * (`α`, `p⁽ᵏ⁾`, `β⁽ᵏ⁾`) — sunt aceleași mărimi, iar corespondența e spusă în
 * textul paginii. Niciun indice nu s-a renumerotat: schema începe de la `k = 1`
 * cu `v⁽¹⁾ = r⁽⁰⁾`, exact ca în curs.
 *
 * Oprirea se face după ce s-a calculat `r⁽ᵏ⁾`, ca la Algorithm 5 din cursul 6
 * (linia 12). Pe un sistem 2×2 cu A pozitiv definită, curs 5, §8.4 garantează
 * soluția exactă după cel mult `n = 2` pași.
 */

import type { MetaMetoda, Parametru } from "@/algorithms/tipuri";
import {
  aduna,
  conditionare,
  inmulteste,
  norma,
  produsScalar,
  scade,
  scaleaza,
  type Vec2,
} from "@/lib/curbe-de-nivel";
import { latexNumar, zecimale } from "@/lib/numere";
import { vectorLatex, vectorText } from "@/algorithms/metode-de-gradient/descriere";
import {
  estePracticSingulara,
  f,
  reziduu,
  solutieExacta,
  verificaSPD,
} from "@/algorithms/metode-de-gradient/patratica";
import {
  PARAMETRI_SISTEM,
  type ParametriGradient,
  type PasGradient,
  type RezultatGradient,
} from "@/algorithms/metode-de-gradient/tipuri";

export const meta: MetaMetoda = {
  id: "gradient-conjugat",
  titlu: "Gradientul conjugat",
  rezumat: "Alege direcții A-ortogonale între ele și atinge soluția exactă în cel mult n pași.",
  sursa: "sisteme_liniare_metode_iterative_MN_curs5.md",
};

export const params: Parametru[] = PARAMETRI_SISTEM;

export function run(p: ParametriGradient): RezultatGradient {
  const { A, b, x0, tol, maxIteratii } = p;
  const kappa = conditionare(A);
  const gol = { pasi: [] as PasGradient[], solutie: null, conditionare: null };

  const spd = verificaSPD(A);
  if (!spd.ok) return { ...gol, stare: "esuat", motiv: spd.motiv };

  if (estePracticSingulara(A)) {
    return {
      ...gol,
      stare: "esuat",
      motiv:
        "Determinantul lui A e atât de mic față de mărimea elementelor ei încât matricea e practic singulară: " +
        "valea e un jgheab aproape plat, iar poziția fundului ei n-ar mai fi decât zgomot de rotunjire.",
    };
  }

  const solutie = solutieExacta(A, b);
  if (!solutie) {
    return { ...gol, stare: "esuat", motiv: "Sistemul A·x = b nu are soluție unică." };
  }

  const context = { solutie, conditionare: kappa };
  const pasi: PasGradient[] = [];

  let x: Vec2 = x0;
  let r: Vec2 = reziduu(A, b, x);
  let v: Vec2 = r; // v⁽¹⁾ = r⁽⁰⁾
  let vAnterior: Vec2 | null = null;

  if (norma(r) < tol) {
    return {
      pasi,
      stare: "convergent",
      motiv: `Punctul de pornire verifică deja sistemul: ‖r⁽⁰⁾‖ = ${zecimale(norma(r), 6)} e sub toleranță, deci nu mai e nicio direcție de urmat.`,
      ...context,
    };
  }

  for (let k = 1; k <= maxIteratii; k++) {
    const av = inmulteste(A, v);
    const vav = produsScalar(v, av);
    const rr = produsScalar(r, r);

    if (!(vav > 0) || !Number.isFinite(vav)) {
      return {
        pasi,
        stare: "esuat",
        motiv: `Numitorul pasului, ⟨v⁽${k}⁾, A·v⁽${k}⁾⟩, e ${zecimale(vav, 6)}, deci t_${k} nu se poate calcula. Pe o matrice pozitiv definită asta nu se poate întâmpla decât din pierdere de precizie: direcția de căutare a ajuns practic nulă.`,
        ...context,
      };
    }

    const t = rr / vav;
    const xUrmator = aduna(x, scaleaza(v, t));
    const rUrmator = scade(r, scaleaza(av, t));

    if (!Number.isFinite(xUrmator[0]) || !Number.isFinite(xUrmator[1])) {
      return {
        pasi,
        stare: "esuat",
        motiv: "Pasul următor iese din domeniul numerelor finite: iterația a divergit.",
        ...context,
      };
    }

    const rrUrmator = produsScalar(rUrmator, rUrmator);
    const s = rrUrmator / rr;
    const eroare = Math.sqrt(rrUrmator);
    const aOrt = vAnterior === null ? undefined : produsScalar(vAnterior, av);

    pasi.push({
      iteratie: k,
      indice: k,
      x: xUrmator,
      xAnterior: x,
      directie: v,
      pas: t,
      r: rUrmator,
      f: f(A, b, xUrmator),
      eroare,
      abatere: norma(scade(xUrmator, solutie)),
      s,
      ...(aOrt === undefined ? {} : { aOrtogonalitate: aOrt }),
      explicatie: explicaPasul(k, v, t, xUrmator, eroare, s, aOrt),
      latexPas:
        `x^{(${k})} = x^{(${k - 1})} + \\htmlId{cg-t}{t_{${k}}}\\,\\htmlId{cg-directie}{v^{(${k})}}` +
        ` = ${vectorLatex(x)} + ${latexNumar(t)}\\,${vectorLatex(v)}` +
        ` = \\htmlId{cg-punct}{${vectorLatex(xUrmator)}}`,
      // t_k e lungimea săgeții, v⁽ᵏ⁾ direcția ei, iar punctul nou e vârful.
      evidentiaza: ["cg-directie", "cg-t", "cg-punct"],
    });

    x = xUrmator;
    r = rUrmator;
    vAnterior = v;
    v = aduna(rUrmator, scaleaza(v, s)); // v⁽ᵏ⁺¹⁾ = r⁽ᵏ⁾ + s_k·v⁽ᵏ⁾

    if (eroare < tol) return { pasi, stare: "convergent", ...context };
  }

  return {
    pasi,
    stare: "neterminat",
    motiv:
      `S-au consumat cele ${maxIteratii} iterații fără ca ‖r‖ să scadă sub toleranță — ultima valoare e ${zecimale(norma(r), 6)}. ` +
      `Pe hârtie metoda termină în cel mult n = 2 pași; când nu o face, de vină e precizia finită, iar măsura ei e ` +
      `numărul de condiționare κ = ${zecimale(kappa, 3)}: cu cât e mai mare, cu atât A-ortogonalitatea direcțiilor se pierde mai repede la rotunjiri.`,
    ...context,
  };
}

function explicaPasul(
  k: number,
  directie: Vec2,
  t: number,
  x: Vec2,
  eroare: number,
  s: number,
  aOrt: number | undefined,
): string {
  const conjugare =
    aOrt === undefined
      ? ` Prima direcție e chiar reziduul de pornire, v⁽1⁾ = r⁽0⁾.`
      : ` Cu direcția dinainte face ⟨v⁽${k - 1}⁾, A·v⁽${k}⁾⟩ = ${zecimale(aOrt, 6)}, adică sunt A-ortogonale — de asta ce s-a câștigat pe direcția veche nu se strică acum.`;

  return (
    `Direcția pasului e v⁽${k}⁾ = ${vectorText(directie)}, iar pasul optim pe ea e t_${k} = ${zecimale(t, 6)},` +
    ` deci se ajunge în x⁽${k}⁾ = ${vectorText(x)}, unde reziduul are norma ${zecimale(eroare, 6)}.` +
    conjugare +
    ` Direcția următoare păstrează din cea de acum o parte s_${k} = ${zecimale(s, 6)}.`
  );
}
