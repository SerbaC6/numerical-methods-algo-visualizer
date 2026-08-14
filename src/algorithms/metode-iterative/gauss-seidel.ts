/**
 * Metoda Gauss-Seidel.
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §5** —
 * formula pe componente cu `x_j⁽ᵏ⁺¹⁾` pentru `j < i`, forma cu resturi, forma
 * matriceală `x⁽ᵏ⁺¹⁾ = (D − L)⁻¹·(U·x⁽ᵏ⁾ + b)` și Algorithm 2.
 *
 * Singura diferență față de Jacobi e că vectorul se rescrie **pe loc**: cursul
 * o spune el însuși, sub pseudocod. De aceea metoda nu are buclă proprie, ci
 * doar alege altă sursă de citire în `cadru.ts`.
 */

import { ruleazaIterativ } from "@/algorithms/metode-iterative/cadru";
import {
  PARAMETRI_SISTEM,
  type ParametriIterativi,
  type RezultatIterativ,
} from "@/algorithms/metode-iterative/tipuri";
import type { MetaMetoda, Parametru } from "@/algorithms/tipuri";

export const meta: MetaMetoda = {
  id: "gauss-seidel",
  titlu: "Metoda Gauss-Seidel",
  rezumat:
    "Aceeași formulă ca la Jacobi, dar folosește imediat valorile calculate în baleiajul curent.",
  sursa: "sisteme_liniare_metode_iterative_MN_curs5.md",
};

export const params: Parametru[] = PARAMETRI_SISTEM;

export function run(p: ParametriIterativi): RezultatIterativ {
  return ruleazaIterativ("gauss-seidel", p);
}
