/**
 * Textele care însoțesc cifrele unui pas: vectorii scriși în LaTeX și
 * propoziția pentru `<desc>`-ul scenei.
 *
 * Stau în `src/algorithms/`, lângă matematică, din același motiv pentru care
 * stă și `explicatie` acolo (vezi docblock-ul din `src/algorithms/tipuri.ts`):
 * descriu cifre calculate, iar dacă ar fi compuse în componentă s-ar putea
 * desincroniza de ele.
 */

import { latexNumar, zecimale } from "@/lib/numere";
import type { Vec2 } from "@/lib/curbe-de-nivel";
import type { PasGradient } from "@/algorithms/metode-de-gradient/tipuri";

/** `(1, 2)` → `\begin{pmatrix}1{,}000000\\2{,}000000\end{pmatrix}`. */
export function vectorLatex(v: Vec2, cifre = 6): string {
  return `\\begin{pmatrix}${latexNumar(v[0], cifre)}\\\\${latexNumar(v[1], cifre)}\\end{pmatrix}`;
}

/** `(1, 2)` → `„(1,000000; 2,000000)"`, pentru propoziții. */
export function vectorText(v: Vec2, cifre = 6): string {
  return `(${zecimale(v[0], cifre)}; ${zecimale(v[1], cifre)})`;
}

/**
 * Propoziția citită de cititorul de ecran pentru scena 3D — ce arată desenul la
 * pasul curent, cu cifrele lui.
 *
 * Model: `descrie()` din `src/components/content/GraficRadacina.tsx`.
 */
export function descrieScena(
  pas: PasGradient | undefined,
  total: number,
  solutie: Vec2 | null,
): string {
  if (!pas) return "Nu s-a calculat încă niciun pas.";

  const tinta = solutie
    ? ` Fundul văii e la ${vectorText(solutie)}, adică la distanța ${zecimale(pas.abatere, 6)} de punctul curent.`
    : "";

  return (
    `Pasul ${pas.iteratie} din ${total}.` +
    ` S-a plecat din ${vectorText(pas.xAnterior)} pe direcția ${vectorText(pas.directie)},` +
    ` cu un pas de lungime ${zecimale(pas.pas, 6)}, și s-a ajuns în ${vectorText(pas.x)}.` +
    ` Acolo funcția ia valoarea ${zecimale(pas.f, 6)}, iar reziduul are norma ${zecimale(pas.eroare, 6)}.` +
    tinta
  );
}
