/**
 * Contractul paginii 8 — metodele puterii, câtul Rayleigh, deflația.
 *
 * **Sursă: `cursuri_MN/valori_vectori_proprii_teorie_curs7.md`** — §5 (câtul
 * Rayleigh), §6 (metoda puterii directe, cu algoritmul de la finalul secțiunii),
 * §7 (puterea inversă, cu și fără deplasare), §8 (iterarea câtului Rayleigh) și
 * §9 (deflația Wielandt și reducerea dimensiunii).
 *
 * Toate cele patru metode produc **același fel de pas**: un vector normalizat, o
 * estimare a valorii proprii și criteriul de oprire `‖v − vprev‖`. De aceea au
 * un singur tip de pas — diferă doar ce se întâmplă între `vprev` și `v`.
 */

import type { StareRulare } from "@/algorithms/tipuri";

/** O matrice deasă, pe linii: `m[i][j]`. */
export type Matrice = number[][];

/** Care dintre cele trei iterații a produs pasul. */
export type FelIteratie =
  /** §6: `z = A·y`, apoi `y ← z/‖z‖`. */
  | "directa"
  /** §7: se rezolvă `(A − qI)·y = vprev`, cu `q` fix. */
  | "inversa"
  /** §8: aceeași rezolvare, dar cu `q = ρ⁽ᵏ⁾` recalculat la fiecare pas. */
  | "rayleigh";

/** Un pas dintr-una din cele trei iterații. */
export type PasPutere = {
  /** Numărul iterației, **de la 1** — cum se numără în curs. */
  iteratie: number;
  fel: FelIteratie;
  /** Vectorul de la începutul pasului, `v⁽ᵏ⁻¹⁾`. */
  vAnterior: number[];
  /** Vectorul obținut, normalizat: `v⁽ᵏ⁾`. */
  v: number[];
  /**
   * Deplasarea folosită la pasul acesta. Lipsește la metoda directă; la
   * iterarea Rayleigh e chiar `ρ⁽ᵏ⁾`, recalculat din `v⁽ᵏ⁻¹⁾`.
   */
  deplasare?: number;
  /** Câtul Rayleigh al vectorului obținut: `λ⁽ᵏ⁾ = v⁽ᵏ⁾ᵀ·A·v⁽ᵏ⁾ / v⁽ᵏ⁾ᵀ·v⁽ᵏ⁾`. */
  lambda: number;
  /** Criteriul de oprire din curs: `‖v − vprev‖₂`. */
  eroare: number;
  /** Ce s-a întâmplat la pasul acesta, într-o propoziție. */
  explicatie: string;
  /** Formula pasului cu numerele lui puse în ea, cu `\htmlId` pe părțile legate de desen. */
  latexPas: string;
  /** Ce id-uri din `latexPas` se aprind la pasul acesta. */
  evidentiaza: string[];
};

export type ParametriPutere = {
  A: Matrice;
  /** Vectorul de pornire, `y⁽⁰⁾`. Se normalizează înainte de prima iterație. */
  pornire: number[];
  tol: number;
  maxIteratii: number;
  /**
   * Deplasarea `q` din §7. Doar la puterea inversă; `0` înseamnă chiar
   * `A⁻¹`, adică varianta fără deplasare.
   */
  deplasare?: number;
};

export type RezultatPutere = {
  pasi: PasPutere[];
  stare: StareRulare;
  /** De ce s-a oprit. Ajunge ca **text** într-un `Callout`, nu colorează nimic. */
  motiv?: string;
  /** Vectorul propriu aproximat, normalizat. Lipsește dacă metoda a eșuat. */
  v: number[] | null;
  /** Valoarea proprie aproximată — câtul Rayleigh al vectorului final. */
  lambda: number | null;
};

/**
 * Rezultatul unui pas de deflație Wielandt (§9): `B = A − λ₁·v⁽¹⁾·xᵀ`, apoi
 * matricea redusă, obținută ștergând linia și coloana `i`.
 */
export type RezultatDeflatie = {
  /** Poziția componentei nenule din `v⁽¹⁾` folosită la construcția lui `x`. */
  indice: number;
  /** `x = (1/(λ₁·v⁽¹⁾ᵢ))·(aᵢ₁, …, aᵢₙ)ᵀ`, adică linia `i` din `A`, scalată. */
  x: number[];
  /** `B = A − λ₁·v⁽¹⁾·xᵀ`, cu linia `i` nulă și `0` în locul lui `λ₁`. */
  B: Matrice;
  /** `B` fără linia și coloana `i`: `(n−1)×(n−1)`, cu valorile proprii `λ₂…λₙ`. */
  redusa: Matrice;
};
