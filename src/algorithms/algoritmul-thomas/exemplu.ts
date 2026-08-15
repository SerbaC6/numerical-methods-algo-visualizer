/**
 * Sistemul tridiagonal desenat în clipul paginii 4, cu cifrele lui derivate o
 * singură dată.
 *
 * **Formulele vin din curs** (§9 din `sisteme_liniare_metode_directe_MN_curs4.md`);
 * exemplul numeric nu, fiindcă acolo nu există niciunul rezolvat — capitolul dă
 * doar recurențele și Algorithm 5. E ales aici, sub două condiții:
 *
 * - **toate cifrele care ajung pe ecran sunt exacte.** `µ` iese `−0,25` la toți
 *   cei trei pași, iar `bᵢ` și `dᵢ` rămân întregi, deci desenul nu arată
 *   niciodată un rezultat rotunjit lângă operanzii din care ar trebui să iasă;
 * - **matricea e diagonal dominantă**, `|bᵢ| ≥ |aᵢ| + |cᵢ|` strict pe fiecare
 *   linie, adică exact condiția pe care o cere §9.2 ca împărțirea la `bᵢ₋₁` să
 *   fie sigură.
 *
 * Soluția e `x = (2, 3, 4, 5)`; termenii liberi s-au obținut înmulțind matricea
 * cu ea, deci sistemul e consistent prin construcție. Verificat în
 * `scripts/verificare-algoritmi/algoritmul-thomas.ts`.
 */

import { algoritmulThomas, type SistemTridiagonal } from "@/algorithms/algoritmul-thomas/thomas";

/**
 * ```
 *  8x₁ − 4x₂             =  4
 * −2x₁ + 9x₂ − 4x₃       =  7
 *       −2x₂ + 9x₃ − 4x₄ = 10
 *             −2x₃ + 9x₄ = 37
 * ```
 */
export const SISTEM_DIN_CLIP: SistemTridiagonal = {
  a: [0, -2, -2, -2],
  b: [8, 9, 9, 9],
  c: [-4, -4, -4, 0],
  d: [4, 7, 10, 37],
};

const rezultat = algoritmulThomas(SISTEM_DIN_CLIP);

export const PASI_ELIMINARE = rezultat.pasiEliminare;
export const PASI_SUBSTITUTIE = rezultat.pasiSubstitutie;
/** Diagonala principală după eliminarea înainte. */
export const B_DUPA_ELIMINARE = rezultat.b;
/** Termenii liberi după eliminarea înainte. */
export const D_DUPA_ELIMINARE = rezultat.d;
export const SOLUTIA = rezultat.x;
