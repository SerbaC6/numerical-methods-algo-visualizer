/**
 * Successive Over-Relaxation (SOR).
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §6** —
 * `x_i⁽ᵏ⁺¹⁾ = x_i⁽ᵏ⁾ + ω·R_i⁽ᵏ⁾/a_ii` cu restul care folosește valorile deja
 * rescrise, forma echivalentă `x_i = (1 − ω)·x_i + ω·GS`, descompunerea
 * `A = (D − ωL) − [(1−ω)D + ωU]` și regulile pentru ω din §6.1.
 *
 * **Se implementează formula, nu pseudocodul.** Algorithm 3 din curs face
 * altceva decât formula de deasupra lui: aplică relaxarea **o singură dată, pe
 * tot vectorul**, după ce baleiajul Gauss-Seidel s-a terminat. Formula (și forma
 * matriceală din §3.2, și §6) relaxează **fiecare componentă pe rând**, iar
 * valoarea relaxată intră imediat în linia următoare. Cele două coincid doar
 * pentru `ω = 1`; cazul e scris în `docs/erata-cursuri.md`, cu verificarea
 * numerică. Pagina implementează forma care se potrivește cu matricea de
 * iterație — altfel raza spectrală afișată n-ar descrie iterația desenată.
 */

import { ruleazaIterativ } from "@/algorithms/metode-iterative/cadru";
import {
  PARAMETRI_SISTEM,
  type ParametriIterativi,
  type RezultatIterativ,
} from "@/algorithms/metode-iterative/tipuri";
import type { MetaMetoda, Parametru } from "@/algorithms/tipuri";

export const meta: MetaMetoda = {
  id: "sor",
  titlu: "Suprarelaxare (SOR)",
  rezumat:
    "Gauss-Seidel cu o corecție amplificată sau temperată de factorul ω; pentru ω = 1 sunt aceeași metodă.",
  sursa: "sisteme_liniare_metode_iterative_MN_curs5.md",
};

export const params: Parametru[] = PARAMETRI_SISTEM;

export function run(p: ParametriIterativi): RezultatIterativ {
  return ruleazaIterativ("sor", p);
}
