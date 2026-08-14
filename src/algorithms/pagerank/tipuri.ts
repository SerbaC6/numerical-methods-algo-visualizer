/**
 * Contractul paginii 9 — PageRank.
 *
 * **Sursă: `cursuri_MN/valori_vectori_proprii_teorie_curs7.md`, §10** (construcția
 * matricei, matricea Google, algoritmul cu metoda puterii) și §6 (metoda puterii
 * însăși).
 *
 * **Atenție la o diferență față de exemplul tipărit în curs.** Cursul cere
 * explicit normalizarea „după numărul de link-uri de ieșire", dar matricea `M`
 * tipărită în exemplu e normalizată după link-urile care **intră**. Aici se
 * aplică regula scrisă a cursului, nu cifrele lui; cazul e documentat în
 * `docs/erata-cursuri.md`, cu verificarea numerică din
 * `scripts/verificare-algoritmi/pagerank.ts`.
 */

import type { StareRulare } from "@/algorithms/tipuri";

/** O matrice deasă, pe linii: `m[i][j]`. */
export type Matrice = number[][];

/**
 * Rețeaua de pagini: `linkuri[i][j] = true` înseamnă „`P(i+1)` are link către
 * `P(j+1)`", adică exact citirea pe **linii** a matricei de adiacență din curs.
 * Diagonala e mereu `false`: o pagină nu are link către ea însăși, iar graful
 * n-ar avea cum să deseneze bucla.
 */
export type Retea = {
  /** Numele afișate ale paginilor, în ordine: `["P1", …]`. */
  nume: string[];
  linkuri: boolean[][];
};

/** În ce moment al poveștii se află pasul curent. */
export type FazaPageRank =
  /** Matricea de adiacență `A`, citită pe linii. */
  | "adiacenta"
  /** Fiecare linie împărțită la numărul ei de link-uri → `S`. */
  | "normalizare"
  /** Transpunerea `M = Sᵀ`, de unde coloanele însumează 1. */
  | "transpunere"
  /** Matricea Google `G = d·M + ((1−d)/N)·ONES(N)`. */
  | "google"
  /** O iterație a metodei puterii: `v ← G·v`, apoi `v ← v/‖v‖₂`. */
  | "iteratie"
  /** Linia 10 din algoritm: `v ← v/‖v‖₁`, unde valorile devin probabilități. */
  | "normalizare-finala";

/** Un pas din povestea paginii — construcție sau iterație. */
export type PasPageRank = {
  /** Numărul pasului în șir, **de la 1**. */
  index: number;
  faza: FazaPageRank;
  /**
   * Numărul iterației metodei puterii, **de la 1**, doar la fazele care iterează.
   * Pașii de construcție nu au așa ceva, iar desenul nu trebuie să inventeze unul.
   */
  iteratie?: number;
  /**
   * Vectorul din care s-a plecat la pasul acesta, deja adus la sumă 1 —
   * `v⁽ᵏ⁻¹⁾/‖v⁽ᵏ⁻¹⁾‖₁`. Lipsește la pașii de construcție.
   */
  distributieAnterioara?: number[];
  /**
   * **Ce arată desenul**: `v⁽ᵏ⁾/‖v⁽ᵏ⁾‖₁`, adică procentele de sub noduri, care
   * însumează 1. Algoritmul din curs normalizează cu norma 2 (linia 7); norma 1
   * vine abia la linia 10. Dacă desenul ar arăta `v⁽ᵏ⁾` cu norma 2, procentele
   * de sub noduri n-ar însuma nimic — de aceea se afișează raportul, iar
   * diferența se spune în legendă și în explicația pasului final.
   */
  distributie?: number[];
  /** `v⁽ᵏ⁾` brut, exact cum îl ține algoritmul (normă 2 la fazele de iterație). */
  v?: number[];
  /** Criteriul de oprire de la linia 8: `‖v − vprev‖₂`. Lipsește la construcție. */
  eroare?: number;
  /** Matricea pe care o arată pasul: `A`, `S`, `M` sau `G`. */
  matrice?: Matrice;
  /** Ce s-a întâmplat la pasul acesta, într-o propoziție. */
  explicatie: string;
  /** Formula pasului cu numerele lui puse în ea, cu `\htmlId` pe părțile legate de desen. */
  latexPas: string;
  /** Ce id-uri din `latexPas` se aprind la pasul acesta. */
  evidentiaza: string[];
};

/** Un loc în clasament, cu egalitățile păstrate. */
export type LocClasament = {
  /** Indicele paginii în rețea, 0-based. */
  pagina: number;
  /** Numele afișat, `"P3"`. */
  nume: string;
  /** Scorul PageRank, adică o probabilitate: toate însumează 1. */
  scor: number;
  /**
   * Locul, **de la 1**, cu egalități tratate corect: două pagini cu același scor
   * primesc același loc, iar locul următor sare peste (1, 2, 3, 3 — nu 3 și 4).
   */
  loc: number;
};

export type ParametriPageRank = {
  retea: Retea;
  /** `d` din curs: probabilitatea de a continua navigarea. */
  d: number;
  tol: number;
  maxIteratii: number;
};

export type RezultatPageRank = {
  pasi: PasPageRank[];
  stare: StareRulare;
  /**
   * De ce s-a oprit. Ajunge ca **text** într-un `Callout`; nu colorează nicio
   * celulă (regula despre roșu din `CLAUDE.md`).
   */
  motiv?: string;
  /** Matricile construcției; nu depind de iterație, deci se dau o singură dată. */
  matrici: { A: Matrice; S: Matrice; M: Matrice; G: Matrice } | null;
  /** PageRank-ul final, cu suma 1. Lipsește dacă metoda a eșuat. */
  pagerank: number[] | null;
  clasament: LocClasament[];
};
