/**
 * Textele care însoțesc cifrele unui pas de PageRank: matricile și vectorii
 * scriși în LaTeX și propoziția pentru `<desc>`-ul scenei.
 *
 * Stau lângă matematică, nu în componentă, din același motiv ca `explicatie`
 * (vezi `src/algorithms/tipuri.ts`): descriu cifre calculate, iar compuse în UI
 * s-ar putea desincroniza de ele.
 */

import { zecimale } from "@/lib/numere";
import type { LocClasament, Matrice } from "@/algorithms/pagerank/tipuri";

/** `0.5` → `\tfrac{1}{2}` când numărul e o fracție simplă, altfel zecimale scurte. */
export function celulaLatex(x: number): string {
  if (x === 0) return "0";
  if (x === 1) return "1";
  for (let numitor = 2; numitor <= 12; numitor++) {
    const numarator = x * numitor;
    if (Math.abs(numarator - Math.round(numarator)) < 1e-12) {
      return `\\tfrac{${Math.round(numarator)}}{${numitor}}`;
    }
  }
  return zecimale(x, 4).replace(",", "{,}");
}

/** Matricea în `pmatrix`, cu fracții simple acolo unde există. */
export function matriceLatex(m: Matrice): string {
  const linii = m.map((linie) => linie.map(celulaLatex).join(" & ")).join("\\\\");
  return `\\begin{pmatrix}${linii}\\end{pmatrix}`;
}

/** Vectorul coloană, cu `cifre` zecimale. */
export function vectorLatex(v: number[], cifre = 4): string {
  return `\\begin{pmatrix}${v.map((x) => zecimale(x, cifre).replace(",", "{,}")).join("\\\\")}\\end{pmatrix}`;
}

/** `0.3510` → `„35,1 %"` — forma în care se scriu procentele de sub noduri. */
export function procent(x: number, cifre = 1): string {
  return `${zecimale(100 * x, cifre)} %`;
}

/** `„P3 (35,1 %) > P2 (27,6 %) > P1 = P4 (18,7 %)"`. */
export function clasamentText(clasament: LocClasament[]): string {
  const grupe: LocClasament[][] = [];
  for (const loc of clasament) {
    const ultima = grupe.at(-1);
    if (ultima && ultima[0]!.loc === loc.loc) ultima.push(loc);
    else grupe.push([loc]);
  }
  return grupe
    .map((grupa) => `${grupa.map((l) => l.nume).join(" = ")} (${procent(grupa[0]!.scor)})`)
    .join(" > ");
}
