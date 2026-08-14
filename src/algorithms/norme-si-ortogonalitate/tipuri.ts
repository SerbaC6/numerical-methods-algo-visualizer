/**
 * Contractul comun al celor două transformări ortogonale de pe pagina 2.
 *
 * **Sursă: `cursuri_MN/curs3_ortogonalitate.md`, §6 (Householder) și §7
 * (Givens).** Nimic scris din memorie.
 *
 * **De ce un singur tip de pas pentru două metode.** Amândouă fac același lucru
 * — înmulțesc matricea cu o transformare ortogonală ca să producă zerouri sub
 * diagonală — și se despart în două locuri:
 *
 * - **cât anulează un pas**: Householder ia o coloană întreagă dintr-o
 *   reflexie, Givens ia **un singur element** printr-o rotație;
 * - **cum se construiește transformarea**: un vector `d` (direcția oglinzii) la
 *   Householder, o pereche `c`, `s` la Givens.
 *
 * De aceea câmpurile specifice sunt opționale, iar `tip` spune care e care.
 * Scrise ca două tipuri paralele, ar fi trebuit ținute sincronizate cu mâna.
 */

import type { StareRulare } from "@/algorithms/tipuri";

export type TipTransformare = "householder" | "givens";

/** Un pas de triangularizare: o transformare ortogonală aplicată matricei. */
export type PasOrtogonal = {
  /** Numărul pasului, **de la 1**. */
  iteratie: number;
  tip: TipTransformare;
  /** Coloana pe care se lucrează, 0-based în cod; în text se scrie `+1`. */
  coloana: number;
  /**
   * Linia elementului anulat. **Numai la Givens**, care ia câte un element;
   * Householder anulează tot ce e sub diagonală în coloana lui, deodată.
   */
  linie?: number;
  /** Matricea la intrarea în pas. */
  inainte: number[][];
  /** Matricea după înmulțirea cu transformarea. */
  dupa: number[][];
  /** Transformarea aplicată la pasul ăsta: `H` sau `G`. */
  T: number[][];
  /** Vectorul din care se construiește reflectorul. **Numai la Householder.** */
  d?: number[];
  /** `‖v‖₂` a bucății de coloană reflectate. **Numai la Householder.** */
  norma?: number;
  /** `cos θ`. **Numai la Givens.** */
  c?: number;
  /** `sin θ`, cu semnul din curs: `s = −y/r`. **Numai la Givens.** */
  s?: number;
  /** `r = √(x² + y²)` — ce rămâne pe diagonală. **Numai la Givens.** */
  r?: number;
  /** Ce s-a întâmplat, într-o propoziție. */
  explicatie: string;
  /** Formula pasului cu numerele lui în ea, cu `\htmlId` pe părțile legate de desen. */
  latexPas: string;
  /** Ce id-uri din `latexPas` se aprind. */
  evidentiaza: string[];
};

export type RezultatQr = {
  pasi: PasOrtogonal[];
  stare: StareRulare;
  motiv?: string;
  /** `Q` ortogonală. */
  Q: number[][];
  /** `R` superior triunghiulară. */
  R: number[][];
  /**
   * `max |Q·R − A|` — dovada că descompunerea chiar reface matricea.
   *
   * Nu e decor: e singurul lucru care spune dacă pașii desenați mai înseamnă
   * ceva. Se afișează în interfață, nu se ascunde într-un test.
   */
  reziduu: number;
  /** `max |QᵀQ − I|` — cât de ortogonală a rămas `Q`. */
  abatereOrtogonala: number;
};

/* ───────────────── cazul plan, pentru interfața interactivă ───────────────── */

export type Vec2 = readonly [number, number];

/** Reflexia unui vector din plan, cu tot ce trebuie desenat. */
export type Reflexie2D = {
  /** Vectorul de reflectat. */
  v: Vec2;
  /** `d = v + sign(v₁)·‖v‖·e₁` — normala oglinzii, adică direcția de reflexie. */
  d: Vec2;
  /**
   * Direcția **dreptei de oglindire**, perpendiculară pe `d`.
   *
   * E ce se desenează, și e ușor de confundat cu `d`: `d` e normala, nu oglinda.
   */
  oglinda: Vec2;
  /** `P·v`, care cade pe axa orizontală. */
  imagine: Vec2;
  /** Matricea `P = I − 2ddᵀ/(dᵀd)`, pe linii. */
  P: number[][];
  /** `‖v‖₂`, păstrată de transformare. */
  norma: number;
};

/** Rotația unui vector din plan, cu tot ce trebuie desenat. */
export type Rotatie2D = {
  v: Vec2;
  c: number;
  s: number;
  /** `r = √(x² + y²)`, adică `‖v‖₂`: unde aterizează vectorul pe axă. */
  r: number;
  /** Unghiul rotației, în radiani — doar pentru desenul arcului. */
  unghi: number;
  imagine: Vec2;
  /** Matricea `G`, pe linii. */
  G: number[][];
};
