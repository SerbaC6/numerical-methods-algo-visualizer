/**
 * Metoda Jacobi.
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §4** —
 * formula pe componente, forma incrementală cu restul `R_i`, forma matriceală
 * `x⁽ᵏ⁺¹⁾ = D⁻¹[(L + U)·x⁽ᵏ⁾ + b]` și Algorithm 1.
 *
 * **O generalizare declarată față de pseudocod.** Algorithm 1 pornește hardcodat
 * din `x ← zeros`; aici pornirea `x⁽⁰⁾` vine de la utilizator. Nu e o schimbare
 * de metodă — formula din §4 pleacă oricum de la un `x⁰` oarecare —, iar pentru
 * `x⁽⁰⁾ = 0` cele două coincid literal.
 */

import { ruleazaIterativ } from "@/algorithms/metode-iterative/cadru";
import {
  PARAMETRI_SISTEM,
  type ParametriIterativi,
  type RezultatIterativ,
} from "@/algorithms/metode-iterative/tipuri";
import type { MetaMetoda, Parametru } from "@/algorithms/tipuri";

export const meta: MetaMetoda = {
  id: "jacobi",
  titlu: "Metoda Jacobi",
  rezumat:
    "Rescrie fiecare linie ca pe o formulă pentru necunoscuta ei și citește tot din vectorul iterației trecute.",
  sursa: "sisteme_liniare_metode_iterative_MN_curs5.md",
};

export const params: Parametru[] = PARAMETRI_SISTEM;

export function run(p: ParametriIterativi): RezultatIterativ {
  return ruleazaIterativ("jacobi", p);
}
