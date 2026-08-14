/**
 * Cum se scriu vectorii și propozițiile paginii 5.
 *
 * Stă lângă matematică, nu în componente: propozițiile descriu **cifrele
 * calculate acolo**, iar dacă ar sta în interfață s-ar putea desincroniza de
 * ele. Aceeași regulă ca la paginile 7 și 9.
 */

import type { ComponentaPas, PasIterativ } from "@/algorithms/metode-iterative/tipuri";
import { latexNumar, zecimale } from "@/lib/numere";

/** `(0,845; 1,343; −0,739)` — pentru propoziții și pentru cititorul de ecran. */
export function vectorText(v: readonly number[], cifre = 6): string {
  return `(${v.map((x) => zecimale(x, cifre)).join("; ")})`;
}

/** Același vector, ca vector-coloană LaTeX. */
export function vectorLatex(v: readonly number[], cifre = 6): string {
  return `\\begin{pmatrix}${v.map((x) => latexNumar(x, cifre)).join(" \\\\ ")}\\end{pmatrix}`;
}

/** Indicele scris cum îl scrie cursul: `x_2^{(3)}`, 1-based. */
export function numeComponenta(linie: number, iteratie: number): string {
  return `x_{${linie + 1}}^{(${iteratie})}`;
}

/**
 * Propoziția unui baleiaj.
 *
 * Spune trei lucruri, în ordinea în care se uită omul la ele: cât s-a mișcat
 * vectorul, unde s-a mișcat cel mai mult și cât a mai rămas până la soluție.
 */
export function descriePasul(pas: PasIterativ, foloseVecineProaspete: boolean): string {
  const celMaiMiscat = pas.componente.reduce((cea, c) =>
    Math.abs(c.valoareNoua - c.valoareVeche) > Math.abs(cea.valoareNoua - cea.valoareVeche)
      ? c
      : cea,
  );

  const sursa = foloseVecineProaspete
    ? "Fiecare linie a folosit valorile deja rescrise în baleiajul acesta, la stânga diagonalei, și pe cele din iterația trecută, la dreapta ei."
    : "Toate liniile au citit din vectorul iterației trecute, care rămâne neatins până la sfârșitul baleiajului.";

  return (
    `Iterația ${pas.iteratie}: vectorul a trecut din ${vectorText(pas.xAnterior, 4)} în ${vectorText(pas.x, 4)}. ` +
    sursa +
    ` Cea mai mare schimbare e pe linia ${celMaiMiscat.linie + 1}, de ${zecimale(Math.abs(celMaiMiscat.valoareNoua - celMaiMiscat.valoareVeche), 6)}, ` +
    `deci criteriul de oprire e ‖Δx‖∞ = ${zecimale(pas.eroare, 6)}.`
  );
}

/** Propoziția unei linii — ce s-a citit, ce a ieșit. */
export function descrieComponenta(
  c: ComponentaPas,
  iteratie: number,
  omega: number | undefined,
): string {
  const proaspete = c.citite.filter((p) => p === "proaspata").length;
  const deUnde =
    proaspete === 0
      ? "toate valorile citite sunt din iterația trecută"
      : `${proaspete === 1 ? "o valoare citită e" : `${proaspete} valori citite sunt`} din baleiajul acesta`;

  const relaxare =
    omega === undefined || omega === 1
      ? ""
      : ` Corecția se înmulțește cu ω = ${zecimale(omega, 2)} înainte de a fi adăugată.`;

  return (
    `Linia ${c.linie + 1}, iterația ${iteratie}: ${deUnde}. ` +
    `Restul ecuației e R = ${zecimale(c.rest, 6)}, deci x_${c.linie + 1} trece din ${zecimale(c.valoareVeche, 6)} în ${zecimale(c.valoareNoua, 6)}.` +
    relaxare
  );
}
