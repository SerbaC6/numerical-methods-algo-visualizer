/**
 * Iterația comună celor trei metode de pe pagina 5.
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §4, §5,
 * §6** (formulele pe componente), §3 (forma matriceală) și §1.1 + §7 (criteriul
 * de oprire). Nimic scris din memorie.
 *
 * **De ce o singură buclă pentru trei metode.** Cursul le scrie cu aceeași
 * formulă, iar diferența e într-un singur loc:
 *
 * - **Jacobi** (§4) citește tot din `x⁽ᵏ⁾`, care rămâne neatins până la capătul
 *   baleiajului;
 * - **Gauss-Seidel** (§5) citește `x_j⁽ᵏ⁺¹⁾` pentru `j < i` — chiar valorile
 *   scrise adineauri —, restul din `x⁽ᵏ⁾`. Cursul o spune explicit: actualizarea
 *   „in-place" e ce face metoda să fie Gauss-Seidel și nu Jacobi;
 * - **SOR** (§6) citește ca Gauss-Seidel și înmulțește corecția cu `ω`.
 *
 * Scrise separat, cele trei bucle ar fi trebuit ținute sincronizate cu mâna, iar
 * o corectură într-una s-ar fi pierdut în celelalte.
 *
 * **Forma folosită e cea incrementală**, `x_i ← x_i + ω·R_i/a_ii` cu
 * `R_i = b_i − Σ_j a_ij·x_j`, fiindcă e singura în care cele trei metode chiar
 * coincid, și fiindcă restul `R_i` e mărimea pe care o arată desenul. Pentru
 * `ω = 1` e identică algebric cu forma `x_i = (b_i − Σ_{j≠i} a_ij·x_j)/a_ii`
 * scrisă în §4 și §5 — se verifică adunând și scăzând `a_ii·x_i`, exact cum face
 * cursul când introduce restul.
 */

import { descriePasul, vectorLatex } from "@/algorithms/metode-iterative/descriere";
import {
  esteDominantDiagonala,
  normaInfinit,
  rezolvaSistem,
  scade,
} from "@/algorithms/metode-iterative/liniar";
import {
  matriceaDeIteratie,
  type IdMetodaIterativa,
} from "@/algorithms/metode-iterative/partitionare";
import { razaSpectrala } from "@/algorithms/metode-iterative/spectru";
import type {
  ComponentaPas,
  ParametriIterativi,
  PasIterativ,
  ProvenientaValoare,
  RezultatIterativ,
} from "@/algorithms/metode-iterative/tipuri";
import { latexNumar, zecimale } from "@/lib/numere";

/** Peste atâtea, iterația e declarată divergentă și se oprește. */
const PRAG_DIVERGENTA = 1e12;

export function ruleazaIterativ(
  metoda: IdMetodaIterativa,
  p: ParametriIterativi,
): RezultatIterativ {
  const { A, b, x0, tol, maxIteratii } = p;
  const omega = metoda === "sor" ? (p.omega ?? 1) : 1;
  const n = A.length;

  const iteratie = matriceaDeIteratie(A, b, metoda, omega);
  const context = {
    solutie: rezolvaSistem(A, b),
    razaSpectrala: iteratie ? razaSpectrala(iteratie.G) : null,
    G: iteratie?.G ?? null,
    c: iteratie?.c ?? null,
    dominantDiagonala: esteDominantDiagonala(A),
  };
  const gol = { pasi: [] as PasIterativ[], ...context };

  const diagonalaNula = A.findIndex((linie, i) => !Number.isFinite(linie[i]) || linie[i] === 0);
  if (diagonalaNula !== -1) {
    return {
      ...gol,
      stare: "esuat",
      motiv:
        `Elementul de pe diagonală a₍${diagonalaNula + 1}${diagonalaNula + 1}₎ e zero, iar toate trei metodele împart la el. ` +
        "Sistemul nu e greșit — doar liniile lui trebuie rearanjate până când diagonala nu mai are zerouri.",
    };
  }

  if (metoda === "sor" && !(omega > 0 && omega < 2)) {
    return {
      ...gol,
      stare: "esuat",
      motiv:
        `Cu ω = ${zecimale(omega, 2)} metoda nu poate converge: în afara intervalului (0, 2) raza spectrală a matricei de iterație e cel puțin |ω − 1| ≥ 1, ` +
        "deci eroarea nu se mai micșorează de la un pas la altul.",
    };
  }

  const pasi: PasIterativ[] = [];
  // `x` se scrie **pe loc**, în același obiect, tot baleiajul. Nu e un detaliu
  // de stil: dacă i s-ar da la fiecare linie un tablou nou, sursa de citire a
  // lui Gauss-Seidel ar rămâne agățată de cel vechi, iar metoda ar deveni
  // Jacobi fără să se vadă. Verificarea numerică prinde exact asta.
  const x = [...x0];

  for (let k = 1; k <= maxIteratii; k++) {
    const xAnterior = [...x];
    const componente: ComponentaPas[] = [];

    for (let i = 0; i < n; i++) {
      const linie = A[i] ?? [];
      // Jacobi citește din vectorul înghețat la începutul baleiajului;
      // Gauss-Seidel și SOR, din cel care se rescrie sub mână.
      const sursa = metoda === "jacobi" ? xAnterior : x;
      const valoriCitite = [...sursa];
      const citite: ProvenientaValoare[] = sursa.map((_, j) =>
        j === i ? "curenta" : metoda !== "jacobi" && j < i ? "proaspata" : "veche",
      );

      const rest = linie.reduce((suma, a, j) => suma - a * (valoriCitite[j] ?? 0), b[i] ?? 0);
      const valoareVeche = x[i] ?? 0;
      const valoareNoua = valoareVeche + (omega * rest) / (linie[i] ?? 1);

      componente.push({
        linie: i,
        valoriCitite,
        citite,
        rest,
        valoareVeche,
        valoareNoua,
        latex: latexComponenta(i, k, linie, b[i] ?? 0, valoriCitite, citite, omega, valoareNoua),
      });

      x[i] = valoareNoua;
    }

    if (!x.every(Number.isFinite) || normaInfinit(x) > PRAG_DIVERGENTA) {
      return {
        ...context,
        pasi,
        stare: "esuat",
        motiv: motivDivergenta(context.razaSpectrala, context.dominantDiagonala, k),
      };
    }

    const eroare = normaInfinit(scade(x, xAnterior));
    const pas: PasIterativ = {
      iteratie: k,
      xAnterior,
      x: [...x],
      componente,
      eroare,
      abatere: context.solutie ? normaInfinit(scade(x, context.solutie)) : Number.NaN,
      explicatie: "",
      latexPas:
        `x^{(${k})} = \\htmlId{iter-G}{G}\\,\\htmlId{iter-vechi}{x^{(${k - 1})}} + \\htmlId{iter-c}{c}` +
        ` = \\htmlId{iter-nou}{${vectorLatex(x, 4)}}`,
      evidentiaza: ["iter-vechi", "iter-nou"],
    };
    pas.explicatie = descriePasul(pas, metoda !== "jacobi");
    pasi.push(pas);

    if (eroare < tol) {
      return { ...context, pasi, stare: "convergent" };
    }
  }

  return {
    ...context,
    pasi,
    stare: "neterminat",
    motiv: motivNeterminat(context.razaSpectrala, context.dominantDiagonala, maxIteratii, pasi),
  };
}

/** Formula unei linii, cu numerele în ea și cu părțile legate de desen marcate. */
function latexComponenta(
  i: number,
  k: number,
  linie: number[],
  bi: number,
  valori: number[],
  citite: ProvenientaValoare[],
  omega: number,
  valoareNoua: number,
): string {
  const termeni = valori
    .map((_, j) => {
      if (j === i) return null;
      const semn = (linie[j] ?? 0) >= 0 ? "-" : "+";
      const coeficient = latexNumar(Math.abs(linie[j] ?? 0), 4);
      const indice = citite[j] === "proaspata" ? k : k - 1;
      const marcaj = citite[j] === "proaspata" ? "iter-proaspat" : "iter-vechi-termen";
      return `${semn} ${coeficient}\\cdot\\htmlId{${marcaj}}{x_{${j + 1}}^{(${indice})}}`;
    })
    .filter((t): t is string => t !== null)
    .join(" ");

  const rest = `\\htmlId{iter-rest}{${latexNumar(bi, 4)} ${termeni}}`;
  const factor = omega === 1 ? "" : `\\htmlId{iter-omega}{\\omega}\\,`;

  return (
    `x_{${i + 1}}^{(${k})} = x_{${i + 1}}^{(${k - 1})} + ${factor}\\frac{${rest}}{${latexNumar(linie[i] ?? 0, 4)}}` +
    ` = \\htmlId{iter-nou-componenta}{${latexNumar(valoareNoua, 6)}}`
  );
}

function motivDivergenta(raza: number | null, dominanta: boolean, iteratie: number): string {
  const explicatie =
    raza === null
      ? ""
      : ` Raza spectrală a matricei de iterație e ${zecimale(raza, 4)}: fiecare pas înmulțește eroarea cu atât, deci ea crește în loc să scadă.`;
  const conditie = dominanta
    ? ""
    : " Matricea nu e dominant diagonală, adică nu îndeplinește condiția suficientă de convergență.";

  return (
    `Iterația ${iteratie} a scos numere prea mari ca să mai însemne ceva: metoda diverge.` +
    explicatie +
    conditie
  );
}

function motivNeterminat(
  raza: number | null,
  dominanta: boolean,
  maxIteratii: number,
  pasi: PasIterativ[],
): string {
  const ultima = pasi.at(-1);
  const blocata = raza !== null && Math.abs(raza - 1) < 1e-9;

  if (blocata) {
    return (
      `Raza spectrală a matricei de iterație e exact 1, deci eroarea nu se micșorează niciodată: ` +
      `oricâte iterații ar urma, vectorul nu se apropie de soluție. ` +
      `După ${maxIteratii} de iterații, ‖Δx‖∞ e încă ${zecimale(ultima?.eroare ?? Number.NaN, 6)}.`
    );
  }

  const viteza =
    raza === null
      ? ""
      : ` Raza spectrală e ${zecimale(raza, 4)}; cu cât e mai aproape de 1, cu atât fiecare pas taie mai puțin din eroare.`;
  const conditie = dominanta
    ? ""
    : " Matricea nu e dominant diagonală, deci nimic nu garantează că metoda ar converge oricâte iterații i-ai da.";

  return (
    `S-au consumat cele ${maxIteratii} de iterații fără ca ‖Δx‖∞ să scadă sub toleranță — ultima valoare e ${zecimale(ultima?.eroare ?? Number.NaN, 6)}.` +
    viteza +
    conditie
  );
}
