/**
 * Contractul comun al celor două metode de gradient de pe pagina 7.
 *
 * **Surse: `cursuri_MN/ecuatii_neliniare_MN_curs6.md`, §4 (Algorithm 4 și
 * Algorithm 5) și `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §8
 * (SPD, direcție de căutare și pas, A-ortogonalitate, schema din §8.6).**
 *
 * **De ce un singur tip de pas pentru două notații.** Cursul 6 scrie coborârea
 * cu `α` și `r^(k)`; cursul 5 scrie gradientul Conjugat cu `t_k`, `v^(k)` și
 * `s_k`. Sunt notații diferite pentru mărimi care joacă **același rol în
 * desen**: „încotro" și „cât de departe". De aceea câmpurile se numesc aici
 * `directie` și `pas`, iar notația fiecărui curs trăiește exclusiv în
 * `latexPas`, `evidentiaza` și `explicatie` — acolo unde o vede studentul.
 * Niciun indice nu e renumerotat față de curs: renumerotarea unei scheme e
 * exact locul unde apar greșelile pe care nu le mai vede nimeni.
 */

import type { Parametru, StareRulare } from "@/algorithms/tipuri";
import type { Mat2, Vec2 } from "@/lib/curbe-de-nivel";

/** Un pas dintr-o metodă de gradient, pe sistemul `A·x = b` cu A simetrică SPD. */
export type PasGradient = {
  /** Numărul iterației, **de la 1** — cum se numără în curs. */
  iteratie: number;
  /**
   * Indicele `k` din notația cursului, adică al câtelea `x^(k)` e punctul
   * produs de pasul acesta. Pornirea e `x^(0)`, deci prima iterație produce
   * `x^(1)` și cele două coincid; câmpul rămâne separat fiindcă desenul scrie
   * indicele, nu numărul de rând.
   */
  indice: number;
  /** `x^(k)` — punctul în care s-a ajuns. */
  x: Vec2;
  /** `x^(k−1)` — punctul din care s-a plecat; de aici pleacă săgeata pasului. */
  xAnterior: Vec2;
  /** Direcția pe care s-a mers: `r^(k−1)` la coborâre, `v^(k)` la conjugat. */
  directie: Vec2;
  /** Lungimea pasului pe direcția aceea: `α` la coborâre, `t_k` la conjugat. */
  pas: number;
  /** Reziduul **după** pas, `r^(k) = b − A·x^(k)`. */
  r: Vec2;
  /** `f(x^(k)) = ½·x^T A x − b^T x`. */
  f: number;
  /** Criteriul de oprire: `‖r^(k)‖`. */
  eroare: number;
  /** `‖x^(k) − x*‖` — cât a mai rămas până la fundul văii. */
  abatere: number;
  /**
   * **Numai la coborâre.** Cosinusul unghiului dintre direcția pasului acesta
   * și cea a pasului dinainte. E chiar zigzagul: la pașii descrescători iese 0.
   * Lipsește la prima iterație, care n-are direcție anterioară.
   */
  cosDirectii?: number;
  /**
   * **Numai la conjugat.** `⟨v^(k−1), A·v^(k)⟩` — A-ortogonalitatea cerută în
   * curs 5, §8.4. Lipsește la prima iterație.
   */
  aOrtogonalitate?: number;
  /** **Numai la conjugat.** `s_k` din curs 5, §8.6: cât din direcția veche se păstrează. */
  s?: number;
  /** Ce s-a întâmplat la pasul acesta, într-o propoziție. */
  explicatie: string;
  /** Formula pasului cu numerele lui puse în ea, cu `\htmlId` pe părțile legate de desen. */
  latexPas: string;
  /** Ce id-uri din `latexPas` se aprind la pasul acesta. */
  evidentiaza: string[];
};

/** Ce primește `run`: sistemul, pornirea și criteriile de oprire. */
export type ParametriGradient = {
  A: Mat2;
  b: Vec2;
  x0: Vec2;
  tol: number;
  maxIteratii: number;
};

export type RezultatGradient = {
  pasi: PasGradient[];
  stare: StareRulare;
  /**
   * De ce s-a oprit. Ajunge ca **text** într-un `Callout`; nu colorează nicio
   * celulă și niciun element din desen (regula despre roșu din `CLAUDE.md`).
   */
  motiv?: string;
  /** Fundul văii, `x* = A⁻¹b`, când există. */
  solutie: Vec2 | null;
  /** `λmax/λmin` — cât de alungită e valea, deci cât de încet coboară metoda. */
  conditionare: number | null;
};

/**
 * Parametrii sistemului, identici la amândouă metodele — de aceea sunt scriși
 * o singură dată, nu copiați în fiecare modul.
 *
 * Matricea se dă prin cele **trei** numere ale unei simetrice 2×2: `a₂₁` nu e un
 * câmp separat, fiindcă simetria nu e o opțiune, ci ipoteza metodei.
 */
export const PARAMETRI_SISTEM: Parametru[] = [
  { nume: "a11", eticheta: "a₁₁", tip: "numar", implicit: 4, pas: 0.1 },
  { nume: "a12", eticheta: "a₁₂ = a₂₁", tip: "numar", implicit: 1, pas: 0.1 },
  { nume: "a22", eticheta: "a₂₂", tip: "numar", implicit: 3, pas: 0.1 },
  { nume: "b1", eticheta: "b₁", tip: "numar", implicit: 1, pas: 0.1 },
  { nume: "b2", eticheta: "b₂", tip: "numar", implicit: 2, pas: 0.1 },
  { nume: "x01", eticheta: "x₁⁽⁰⁾", tip: "numar", implicit: 0, pas: 0.1 },
  { nume: "x02", eticheta: "x₂⁽⁰⁾", tip: "numar", implicit: 0, pas: 0.1 },
  { nume: "tol", eticheta: "toleranța pentru ‖r‖", tip: "numar", implicit: 1e-8 },
  { nume: "maxIteratii", eticheta: "iterații maxime", tip: "numar", implicit: 40, min: 1, pas: 1 },
];
