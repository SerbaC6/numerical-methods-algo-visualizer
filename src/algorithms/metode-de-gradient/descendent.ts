/**
 * Metoda gradientului descendent (pașii descrescători).
 *
 * **Sursă: `cursuri_MN/ecuatii_neliniare_MN_curs6.md`, §4.1 — Algorithm 4**, cu
 * pasul optim `α = (r⁽ᵏ⁾ᵀr⁽ᵏ⁾)/(r⁽ᵏ⁾ᵀAr⁽ᵏ⁾)` din line search și recurența
 * reziduului `r⁽ᵏ⁺¹⁾ = r⁽ᵏ⁾ − α·A·r⁽ᵏ⁾`. Ipoteza A simetrică pozitiv definită
 * vine din curs 5, §8.1.
 *
 * **Generalizare declarată față de pseudocod.** Algorithm 4 pornește hardcodat
 * din `x ← 0`, `r ← b`; aici pornirea `x⁽⁰⁾` e dată de utilizator, deci
 * reziduul inițial e `r⁽⁰⁾ = b − A·x⁽⁰⁾`. Nu e o schimbare de metodă, ci chiar
 * forma din curs 5, §8.2–8.3 (`v⁽ᵏ⁺¹⁾ = r⁽ᵏ⁾ = b − A·x⁽ᵏ⁾`, pornind dintr-un
 * `x⁰` oarecare); pentru `x⁽⁰⁾ = 0` cele două coincid literal, fiindcă
 * `b − A·0 = b`. Iterația, formula lui α și recurența reziduului rămân
 * neatinse, iar indicii nu se renumerotează.
 *
 * **Notația e cea din cursul 6** (`α`, `r⁽ᵏ⁾`), fiindcă asta scrie și pagina
 * pentru coborâre. Corespondența cu `t_k`, `v⁽ᵏ⁾` din cursul 5 e spusă în
 * textul paginii, nu aici.
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
  id: "gradient-descendent",
  titlu: "Gradientul Descendent (pașii descrescători)",
  rezumat: "Merge de fiecare dată pe direcția în care valea coboară cel mai abrupt.",
  sursa: "ecuatii_neliniare_MN_curs6.md",
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

  // Generalizarea declarată în docblock: r⁽⁰⁾ = b − A·x⁽⁰⁾, nu r ← b.
  let x: Vec2 = x0;
  let r: Vec2 = reziduu(A, b, x);
  let directieAnterioara: Vec2 | null = null;

  // Pornire chiar din x*: nu se face niciun pas. Fără verificarea asta, α ar
  // ieși 0/0 din primul reziduu nul.
  if (norma(r) < tol) {
    return {
      pasi,
      stare: "convergent",
      motiv: `Punctul de pornire verifică deja sistemul: ‖r⁽⁰⁾‖ = ${zecimale(norma(r), 6)} e sub toleranță, deci nu e nimic de coborât.`,
      ...context,
    };
  }

  for (let i = 1; i <= maxIteratii; i++) {
    const ar = inmulteste(A, r);
    const rr = produsScalar(r, r);
    const rar = produsScalar(r, ar);

    if (!(rar > 0) || !Number.isFinite(rar)) {
      return {
        pasi,
        stare: "esuat",
        motiv: `Numitorul pasului, r⁽ᵏ⁾ᵀA·r⁽ᵏ⁾, e ${zecimale(rar, 6)}, deci α nu se poate calcula. Pe o matrice pozitiv definită asta nu se poate întâmpla decât din pierdere de precizie.`,
        ...context,
      };
    }

    const alfa = rr / rar;
    const xUrmator = aduna(x, scaleaza(r, alfa));
    // Recurența din curs: r⁽ᵏ⁺¹⁾ = r⁽ᵏ⁾ − α·A·r⁽ᵏ⁾, un singur produs pe iterație.
    const rUrmator = scade(r, scaleaza(ar, alfa));

    if (!Number.isFinite(xUrmator[0]) || !Number.isFinite(xUrmator[1])) {
      return {
        pasi,
        stare: "esuat",
        motiv: "Pasul următor iese din domeniul numerelor finite: iterația a divergit.",
        ...context,
      };
    }

    const eroare = norma(rUrmator);
    const cos = directieAnterioara === null ? undefined : cosinusUnghiului(directieAnterioara, r);

    pasi.push({
      iteratie: i,
      indice: i,
      x: xUrmator,
      xAnterior: x,
      directie: r,
      pas: alfa,
      r: rUrmator,
      f: f(A, b, xUrmator),
      eroare,
      abatere: norma(scade(xUrmator, solutie)),
      ...(cos === undefined ? {} : { cosDirectii: cos }),
      explicatie: explicaPasul(i, r, alfa, xUrmator, eroare, cos),
      latexPas:
        `x^{(${i})} = x^{(${i - 1})} + \\htmlId{grad-alfa}{\\alpha}\\,\\htmlId{grad-directie}{r^{(${i - 1})}}` +
        ` = ${vectorLatex(x)} + ${latexNumar(alfa)}\\,${vectorLatex(r)}` +
        ` = \\htmlId{grad-punct}{${vectorLatex(xUrmator)}}`,
      // α e lungimea săgeții, r⁽ᵏ⁻¹⁾ e direcția ei, iar punctul nou e vârful.
      evidentiaza: ["grad-directie", "grad-alfa", "grad-punct"],
    });

    directieAnterioara = r;
    x = xUrmator;
    r = rUrmator;

    if (eroare < tol) return { pasi, stare: "convergent", ...context };
  }

  return {
    pasi,
    stare: "neterminat",
    motiv:
      `S-au consumat cele ${maxIteratii} iterații fără ca ‖r‖ să scadă sub toleranță — ultima valoare e ${zecimale(norma(r), 6)}. ` +
      `Numărul de condiționare al matricei e κ = ${zecimale(kappa, 3)}: cu cât e mai mare, cu atât elipsele de nivel sunt mai alungite, ` +
      `unghiul drept dintre direcții taie mai puțin din drum și coborârea are nevoie de mai mulți pași până la fund.`,
    ...context,
  };
}

/** Cosinusul unghiului dintre două direcții; 0 pentru vectori degenerați. */
function cosinusUnghiului(u: Vec2, v: Vec2): number {
  const numitor = norma(u) * norma(v);
  if (!(numitor > 0)) return 0;
  return produsScalar(u, v) / numitor;
}

function explicaPasul(
  i: number,
  directie: Vec2,
  alfa: number,
  x: Vec2,
  eroare: number,
  cos: number | undefined,
): string {
  const zigzag =
    cos === undefined
      ? " E primul pas, deci n-are cu ce face unghi."
      : ` Față de direcția pasului dinainte, cosinusul unghiului e ${zecimale(cos, 6)}: cele două direcții sunt perpendiculare, de aici zigzag-ul.`;

  return (
    `Direcția pasului e reziduul r⁽${i - 1}⁾ = ${vectorText(directie)}, adică panta cea mai abruptă în jos.` +
    ` Pe ea, valoarea care minimizează f e α = ${zecimale(alfa, 6)}, deci se ajunge în x⁽${i}⁾ = ${vectorText(x)}.` +
    ` Acolo reziduul are norma ${zecimale(eroare, 6)}.` +
    zigzag
  );
}
