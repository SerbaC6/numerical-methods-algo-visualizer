/**
 * Construcția matricelor PageRank, în ordinea în care o arată pagina:
 * `A` (adiacența, pe linii) → `S` (fiecare linie împărțită la numărul ei de
 * link-uri) → `M = Sᵀ` (coloanele însumează 1) → `G` (matricea Google).
 *
 * **Sursă: `cursuri_MN/valori_vectori_proprii_teorie_curs7.md`, §10.**
 *
 * **De ce trece pe la `S` și abia apoi transpune.** Cursul cere ca `M` să fie
 * stocastică pe **coloane** și, în același timp, normalizată după numărul de
 * link-uri de **ieșire**. Link-urile de ieșire ale unei pagini stau pe **linia**
 * ei în `A`, deci împărțirea se face pe linii, iar transpunerea e chiar pasul
 * care mută cerința de pe linii pe coloane. Matricea `M` tipărită în exemplul
 * cursului nu iese așa (vezi `docs/erata-cursuri.md`); aici se respectă regula
 * scrisă, nu cifrele tipărite.
 */

import type { Matrice, Retea } from "@/algorithms/pagerank/tipuri";

/** Exemplul din curs7 §10: `P1→{P2,P3}`, `P2→{P3}`, `P3→{P1,P4}`, `P4→{P2}`. */
export const RETEA_DIN_CURS: Retea = {
  nume: ["P1", "P2", "P3", "P4"],
  linkuri: [
    [false, true, true, false],
    [false, false, true, false],
    [true, false, false, true],
    [false, true, false, false],
  ],
};

/** Copie independentă a rețelei din curs, ca apelantul să nu strice originalul. */
export function reteaDinCurs(): Retea {
  return {
    nume: [...RETEA_DIN_CURS.nume],
    linkuri: RETEA_DIN_CURS.linkuri.map((linie) => [...linie]),
  };
}

/** `A`: `a[i][j] = 1` dacă `Pi` are link către `Pj` — citirea pe linii din curs. */
export function adiacenta(retea: Retea): Matrice {
  return retea.linkuri.map((linie) => linie.map((are) => (are ? 1 : 0)));
}

/** Câte link-uri pleacă din fiecare pagină, adică suma liniei ei din `A`. */
export function gradeIesire(retea: Retea): number[] {
  return retea.linkuri.map((linie) => linie.filter(Boolean).length);
}

/** Indicii paginilor din care nu pleacă niciun link („pagini agățătoare"). */
export function paginiFaraLinkuri(retea: Retea): number[] {
  return gradeIesire(retea)
    .map((grad, i) => (grad === 0 ? i : -1))
    .filter((i) => i >= 0);
}

/**
 * `S`: fiecare linie a lui `A` împărțită la numărul ei de link-uri de ieșire.
 * O linie fără link-uri rămâne nulă — cazul e oprit înainte, în `run`, fiindcă
 * atunci `M` nu mai e stocastică; funcția nu inventează nimic în locul ei.
 */
export function normalizeazaLinii(A: Matrice): Matrice {
  return A.map((linie) => {
    const suma = linie.reduce((s, x) => s + x, 0);
    return suma === 0 ? linie.map(() => 0) : linie.map((x) => x / suma);
  });
}

/** Transpusa: `t[i][j] = m[j][i]`. */
export function transpune(m: Matrice): Matrice {
  const n = m.length;
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => m[j]![i]!));
}

/** `G = d·M + ((1−d)/N)·ONES(N)` — curs7 §10. */
export function google(M: Matrice, d: number): Matrice {
  const n = M.length;
  const uniform = (1 - d) / n;
  return M.map((linie) => linie.map((x) => d * x + uniform));
}

/** `A·v`. */
export function inmultesteVector(m: Matrice, v: number[]): number[] {
  return m.map((linie) => linie.reduce((s, x, j) => s + x * v[j]!, 0));
}

/** `‖v‖₂`. */
export function norma2(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

/** `‖v‖₁`. */
export function norma1(v: number[]): number {
  return v.reduce((s, x) => s + Math.abs(x), 0);
}

/** `v/‖v‖₁` — vectorul adus la sumă 1, adică o distribuție de probabilitate. */
export function distributie(v: number[]): number[] {
  const s = norma1(v);
  return s === 0 ? v.map(() => 0) : v.map((x) => x / s);
}
