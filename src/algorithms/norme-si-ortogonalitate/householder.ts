/**
 * Reflexia Householder și triangularizarea cu ea.
 *
 * **Sursă: `cursuri_MN/curs3_ortogonalitate.md`, §6** — definiția
 * `H = I − 2wwᵀ` cu `wᵀw = 1`, forma generală `P = I − 2ddᵀ/(dᵀd)`, alegerea
 * `d = v + sign(v₁)·‖v‖₂·e₁` din §6.2, umplerea cu zerouri din §6.4, exemplul
 * din §6.5 și Algorithm 1.
 *
 * **De ce semnul acela.** Nu e o convenție: e ales ca `v` și reflexia lui să fie
 * cât mai **depărtate**. Cursul îl obține maximizând `‖v − α‖v‖e₁‖`, de unde
 * `α = −sign(v₁)`, deci `d = v + sign(v₁)‖v‖e₁`. Cu semnul celălalt, când `v` e
 * deja aproape de axă, `d` iese aproape nul și se pierde precizia prin anulare
 * catastrofală (§6.3).
 *
 * Verificat pe exemplul din §6.5 (`A = [[2,4,5],[1,−1,1],[2,1,−1]]`), element cu
 * element, în `scripts/verificare-algoritmi/ortogonalitate.ts`.
 */

import {
  abatere,
  curata,
  identitate,
  inmulteste,
  normaEuclidiana,
  semn,
  transpusa,
} from "@/algorithms/norme-si-ortogonalitate/matrice";
import type {
  PasOrtogonal,
  Reflexie2D,
  RezultatQr,
  Vec2,
} from "@/algorithms/norme-si-ortogonalitate/tipuri";
import type { MetaMetoda } from "@/algorithms/tipuri";
import { latexNumar, zecimale } from "@/lib/numere";

export const meta: MetaMetoda = {
  id: "householder",
  titlu: "Reflexia Householder",
  rezumat:
    "O oglindă aleasă anume: reflectă coloana matricei fix pe axă, deci îi anulează dintr-o dată tot ce e sub diagonală.",
  sursa: "curs3_ortogonalitate.md",
};

/**
 * Reflectorul care duce bucata de coloană `v[p..]` pe axa `e_p`.
 *
 * `d` are zerouri deasupra poziției `p` (§6.4): așa liniile de deasupra rămân
 * neatinse, iar zerourile produse la pașii dinainte nu se strică.
 */
export function reflector(
  v: readonly number[],
  p: number,
): { d: number[]; norma: number; H: number[][] } {
  const n = v.length;
  const bucata = v.slice(p);
  const norma = normaEuclidiana(bucata);

  const d = Array<number>(n).fill(0);
  for (let i = p; i < n; i++) d[i] = v[i] ?? 0;
  d[p] = (v[p] ?? 0) + semn(v[p] ?? 0) * norma;

  const dd = d.reduce((suma, x) => suma + x * x, 0);
  const H = identitate(n).map((linie, i) =>
    linie.map((e, j) => (dd === 0 ? e : e - (2 * (d[i] ?? 0) * (d[j] ?? 0)) / dd)),
  );

  return { d, norma, H };
}

/** Triangularizarea `A = Q·R` prin reflexii, o coloană la fiecare pas. */
export function run(A: number[][]): RezultatQr {
  const m = A.length;
  const n = A[0]?.length ?? 0;
  const pasi: PasOrtogonal[] = [];

  let R = A.map((linie) => [...linie]);
  let Q = identitate(m);

  for (let p = 0; p < Math.min(m - 1, n); p++) {
    const coloanaP = R.map((linie) => linie[p] ?? 0);
    const { d, norma, H } = reflector(coloanaP, p);

    // Coloana e deja curată sub diagonală: nu se pierde un pas pe o reflexie
    // care n-ar face nimic (și care, cu d nul, nici n-ar fi definită).
    const deAnulat = coloanaP.slice(p + 1).some((x) => Math.abs(x) > 1e-14);
    if (!deAnulat) continue;

    const inainte = R.map((linie) => [...linie]);
    R = curata(inmulteste(H, R));
    Q = inmulteste(Q, H);

    pasi.push({
      iteratie: pasi.length + 1,
      tip: "householder",
      coloana: p,
      inainte,
      dupa: R.map((linie) => [...linie]),
      T: H,
      d,
      norma,
      explicatie: explica(p, coloanaP, d, norma, m),
      latexPas:
        `\\htmlId{hh-d}{d} = v + \\operatorname{sign}(v_{${p + 1}})\\,\\lVert v \\rVert_2\\,e_{${p + 1}}` +
        ` = ${vectorLatex(d)}, \\qquad \\htmlId{hh-p}{P} = I - \\frac{2\\,d\\,d^{T}}{d^{T}d}`,
      evidentiaza: ["hh-d", "hh-p"],
    });
  }

  const QR = inmulteste(Q, R);
  const QtQ = inmulteste(transpusa(Q), Q);

  return {
    pasi,
    stare: "convergent",
    Q,
    R,
    reziduu: abatere(QR, A),
    abatereOrtogonala: abatere(QtQ, identitate(m)),
  };
}

/* ───────────────────────── cazul plan ───────────────────────── */

/**
 * Reflexia unui vector din plan — ce arată interfața interactivă.
 *
 * Aceeași formulă ca la triangularizare, cu `n = 2` și `p = 0`. Se calculează
 * aici, nu în componentă, ca desenul și cifrele să nu se poată contrazice.
 */
export function reflectaInPlan(v: Vec2): Reflexie2D {
  const { d, norma, H } = reflector(v, 0);
  const dv: Vec2 = [d[0] ?? 0, d[1] ?? 0];

  return {
    v,
    d: dv,
    // Dreapta de oglindire e perpendiculara pe `d`, prin origine.
    oglinda: [-dv[1], dv[0]],
    imagine: [-semn(v[0]) * norma, 0],
    P: H,
    norma,
  };
}

/* ───────────────────────── proza ───────────────────────── */

function vectorLatex(v: readonly number[]): string {
  return `\\begin{pmatrix}${v.map((x) => latexNumar(x, 4)).join(" \\\\ ")}\\end{pmatrix}`;
}

function explica(
  p: number,
  coloanaP: readonly number[],
  d: readonly number[],
  norma: number,
  m: number,
): string {
  const cateZerouri = m - p - 1;
  return (
    `Coloana ${p + 1} are, de la linia ${p + 1} în jos, norma ${zecimale(norma, 6)}. ` +
    `Oglinda se alege cu normala d = ${vectorText(d)}, adică vectorul coloanei plus norma lui pus pe poziția ${p + 1}, cu semnul lui ${zecimale(coloanaP[p] ?? 0, 4)}. ` +
    `Reflexia îl duce exact pe axă, deci ${cateZerouri === 1 ? "elementul de sub diagonală devine zero" : `cele ${cateZerouri} elemente de sub diagonală devin zero`} dintr-o singură înmulțire.`
  );
}

function vectorText(v: readonly number[]): string {
  return `(${v.map((x) => zecimale(x, 4)).join("; ")})`;
}
