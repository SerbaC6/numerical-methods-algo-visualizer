/**
 * Contractul comun al celor trei metode iterative de pe pagina 5.
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §1–§7.**
 * Nimic scris din memorie.
 *
 * **De ce un singur tip de pas pentru trei metode.** Jacobi, Gauss-Seidel și SOR
 * fac exact același lucru — trec o dată prin linii și rescriu fiecare `x_i` —, și
 * se despart într-un singur loc: **ce valori citesc** când calculează restul
 * `R_i`, plus factorul `ω` cu care înmulțesc corecția. Diferența aia trăiește în
 * `ComponentaPas.citite`, nu în trei tipuri paralele care ar trebui ținute
 * sincronizate.
 *
 * **Pasul e o iterație întreagă**, nu o singură componentă: tabelul, criteriul
 * de oprire și graficul erorii sunt toate per iterație, cum le scrie cursul.
 * Detaliul pe linii stă înăuntru, în `componente`, fiindcă de el are nevoie
 * desenul ca să arate de unde s-a citit fiecare număr.
 */

import type { Parametru, StareRulare } from "@/algorithms/tipuri";

/** De unde a venit valoarea lui `x_j` folosită la calculul unei componente. */
export type ProvenientaValoare =
  /** Din iterația precedentă, `x_j⁽ᵏ⁾` — singurul fel la Jacobi. */
  | "veche"
  /** Calculată chiar în baleiajul acesta, `x_j⁽ᵏ⁺¹⁾` — semnătura Gauss-Seidel. */
  | "proaspata"
  /** Chiar componenta care se calculează acum; nu se citește, se scrie. */
  | "curenta";

/** Ce s-a întâmplat pe o linie a matricei, într-un baleiaj. */
export type ComponentaPas = {
  /** Indicele liniei, **0-based în cod**; în text se scrie `i + 1`. */
  linie: number;
  /** Valorile lui `x` citite ca să se calculeze restul, în ordinea coloanelor. */
  valoriCitite: number[];
  /** Provenienta fiecăreia, paralel cu `valoriCitite`. */
  citite: ProvenientaValoare[];
  /** Restul ecuației `i`: `R_i = b_i − Σ_j a_ij·x_j`, cu valorile de mai sus. */
  rest: number;
  /** Valoarea dinaintea scrierii, `x_i⁽ᵏ⁾`. */
  valoareVeche: number;
  /** Valoarea scrisă, `x_i⁽ᵏ⁺¹⁾ = x_i⁽ᵏ⁾ + ω·R_i/a_ii` (cu `ω = 1` la primele două). */
  valoareNoua: number;
  /** Formula liniei cu numerele puse în ea, cu `\htmlId` pe părțile legate de desen. */
  latex: string;
};

/** Un pas: o iterație completă, adică un baleiaj peste toate liniile. */
export type PasIterativ = {
  /** Numărul iterației, **de la 1** — cum se numără în curs. */
  iteratie: number;
  /** `x⁽ᵏ⁻¹⁾`, vectorul cu care a început baleiajul. */
  xAnterior: number[];
  /** `x⁽ᵏ⁾`, vectorul de la sfârșitul baleiajului. */
  x: number[];
  /** Ce s-a întâmplat pe fiecare linie, în ordinea în care s-a întâmplat. */
  componente: ComponentaPas[];
  /**
   * Criteriul de oprire de la §1.1 și §7: `‖x⁽ᵏ⁾ − x⁽ᵏ⁻¹⁾‖∞`, eroarea absolută
   * în norma infinit. E prima din lista cursului și singura care nu împarte la
   * componentele soluției, deci nu explodează când vreuna e aproape de zero.
   */
  eroare: number;
  /**
   * `‖x⁽ᵏ⁾ − x*‖∞` — abaterea reală față de soluția calculată separat, prin
   * eliminare. Nu e criteriu de oprire (nu se cunoaște `x*` când rulezi
   * metoda), ci **verificarea** faptului că eroarea de oprire chiar înseamnă
   * ceva: cursul §7 spune limpede că se măsoară diferența dintre pași tocmai
   * fiindcă `x*` nu se știe.
   */
  abatere: number;
  /** Ce s-a întâmplat la pasul acesta, într-o propoziție. */
  explicatie: string;
  /** Formula pasului cu numerele lui în ea; `\htmlId` pe părțile legate de desen. */
  latexPas: string;
  /** Ce id-uri din `latexPas` se aprind. */
  evidentiaza: string[];
};

/** Ce primește `run`. `omega` e citit doar de SOR. */
export type ParametriIterativi = {
  /** Matricea sistemului, pe linii. */
  A: number[][];
  b: number[];
  x0: number[];
  tol: number;
  maxIteratii: number;
  /** Factorul de relaxare din §6. La Jacobi și Gauss-Seidel e ignorat. */
  omega?: number;
};

export type RezultatIterativ = {
  pasi: PasIterativ[];
  stare: StareRulare;
  /** De ce s-a oprit. Ajunge ca **text** într-un `Callout`, nu colorează nimic. */
  motiv?: string;
  /** Soluția exactă, calculată separat prin eliminare cu pivotare. */
  solutie: number[] | null;
  /**
   * Raza spectrală a matricei de iterație `G`. Sub 1 metoda converge, peste 1
   * diverge, iar cu cât e mai mică cu atât mai repede (§3.1). `null` dacă nu se
   * poate calcula — vezi `spectru.ts`.
   */
  razaSpectrala: number | null;
  /** Matricea de iterație `G` din §3, ca s-o poată arăta interfața. */
  G: number[][] | null;
  /** Vectorul de iterație `c` din §3. */
  c: number[] | null;
  /** Matricea e dominant diagonală? Condiția suficientă de convergență din §1. */
  dominantDiagonala: boolean;
};

/**
 * Parametrii sistemului, identici la toate trei metodele.
 *
 * Matricea are toate cele nouă elemente: spre deosebire de pagina 7, aici
 * simetria **nu** e ipoteză — Jacobi și Gauss-Seidel merg pe orice matrice cu
 * diagonala nenulă, iar exemplul din curs (§10, problema 3) chiar e nesimetric.
 */
export const PARAMETRI_SISTEM: Parametru[] = [
  { nume: "a11", eticheta: "a₁₁", tip: "numar", implicit: 10, pas: 1 },
  { nume: "a12", eticheta: "a₁₂", tip: "numar", implicit: -5, pas: 1 },
  { nume: "a13", eticheta: "a₁₃", tip: "numar", implicit: 1, pas: 1 },
  { nume: "a21", eticheta: "a₂₁", tip: "numar", implicit: 1, pas: 1 },
  { nume: "a22", eticheta: "a₂₂", tip: "numar", implicit: 4, pas: 1 },
  { nume: "a23", eticheta: "a₂₃", tip: "numar", implicit: 3, pas: 1 },
  { nume: "a31", eticheta: "a₃₁", tip: "numar", implicit: 4, pas: 1 },
  { nume: "a32", eticheta: "a₃₂", tip: "numar", implicit: -3, pas: 1 },
  { nume: "a33", eticheta: "a₃₃", tip: "numar", implicit: -9, pas: 1 },
  { nume: "b1", eticheta: "b₁", tip: "numar", implicit: 1, pas: 1 },
  { nume: "b2", eticheta: "b₂", tip: "numar", implicit: 4, pas: 1 },
  { nume: "b3", eticheta: "b₃", tip: "numar", implicit: 6, pas: 1 },
  { nume: "omega", eticheta: "ω", tip: "numar", implicit: 1, min: 0.05, max: 1.95, pas: 0.05 },
  { nume: "tol", eticheta: "toleranța", tip: "numar", implicit: 1e-8 },
  { nume: "maxIteratii", eticheta: "iterații maxime", tip: "numar", implicit: 60, min: 1, pas: 1 },
];
