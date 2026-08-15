/**
 * Rotația Givens și triangularizarea cu ea.
 *
 * **Sursă: `cursuri_MN/curs3_ortogonalitate.md`, §7** — definiția matricei de
 * rotație (identitatea cu patru elemente schimbate), `c = x/r`, `s = −y/r` din
 * §7.2, structura pentru dimensiuni mari din §7.3, exemplul din §7.4 și
 * Algorithm 2.
 *
 * **O abatere declarată de la curs.** Exemplul numeric din §7.4 conține o
 * greșeală de calcul: după a doua rotație, elementul `(2,3)` iese `−3`, nu `0`
 * cum e tipărit, iar matricea finală se strică odată cu el. Pagina folosește
 * cifrele corecte; cazul e scris în `docs/erata-cursuri.md`, cu verificarea pe
 * fracții. Formulele lui `c` și `s`, structura lui `G` și concluzia
 * (`R` superior triunghiulară, `Q = G₁ᵀG₂ᵀG₃ᵀ`) rămân **neatinse** — greșeala e
 * doar în aritmetica exemplului.
 *
 * **Două convenții de litere în același curs.** §7.4 pune `s` pe poziția
 * `(i, j)` cu `i` = linia care se anulează; Algorithm 2 pune `−A(j,i)/r` pe
 * `(j, i)` cu `j` = linia care se anulează. Sunt aceeași matrice cu literele
 * schimbate între ele. Aici se folosește o singură convenție, scrisă o dată:
 * `linie` e mereu linia care se anulează.
 */

import {
  abatere,
  curata,
  identitate,
  inmulteste,
  transpusa,
} from "@/algorithms/norme-si-ortogonalitate/matrice";
import type {
  PasOrtogonal,
  RezultatQr,
  Rotatie2D,
  Vec2,
} from "@/algorithms/norme-si-ortogonalitate/tipuri";
import type { MetaMetoda } from "@/algorithms/tipuri";
import { latexNumar, zecimale } from "@/lib/numere";

export const meta: MetaMetoda = {
  id: "givens",
  titlu: "Rotația Givens",
  rezumat:
    "O rotație în planul a două linii, aleasă cât să ducă un singur element la zero — și care lasă restul matricei neatins.",
  sursa: "curs3_ortogonalitate.md",
};

/**
 * `c` și `s` care duc perechea `(x, y)` în `(r, 0)`.
 *
 * `x` e elementul de pe diagonală, `y` cel care trebuie anulat.
 */
export function rotatie(x: number, y: number): { c: number; s: number; r: number } {
  const r = Math.hypot(x, y);
  if (r === 0) return { c: 1, s: 0, r: 0 };
  return { c: x / r, s: -y / r, r };
}

/**
 * Matricea `G` de dimensiune `m`, care rotește în planul liniilor `pivot` și
 * `linie`. E identitatea cu patru elemente schimbate, exact ca în §7.3.
 */
export function matriceaGivens(
  m: number,
  pivot: number,
  linie: number,
  c: number,
  s: number,
): number[][] {
  const G = identitate(m);
  G[pivot]![pivot] = c;
  G[linie]![linie] = c;
  G[linie]![pivot] = s;
  G[pivot]![linie] = -s;
  return G;
}

/**
 * În ce ordine se ia coloana.
 *
 * `"jos-sus"` e ordinea cursului, și cea implicită. `"sus-jos"` dă **aceeași**
 * factorizare — o rotație atinge doar liniile `p` și `i`, deci un zero deja
 * făcut pe linia `i` nu se strică nici dacă `p` se schimbă după aceea; verificat
 * pe exemplul din §7.4, unde cele două ordini dau `R` identic. Există fiindcă
 * pe desen se citește mai firesc de sus în jos, de la primul element de sub
 * diagonală.
 */
export type OrdineColoana = "jos-sus" | "sus-jos";

/** Triangularizarea `A = Q·R` prin rotații, un element la fiecare pas. */
export function run(A: number[][], ordine: OrdineColoana = "jos-sus"): RezultatQr {
  const m = A.length;
  const n = A[0]?.length ?? 0;
  const pasi: PasOrtogonal[] = [];

  let R = A.map((linie) => [...linie]);
  let Q = identitate(m);

  for (let p = 0; p < n; p++) {
    const linii =
      ordine === "jos-sus"
        ? Array.from({ length: m - p - 1 }, (_, k) => m - 1 - k)
        : Array.from({ length: m - p - 1 }, (_, k) => p + 1 + k);

    for (const i of linii) {
      const y = R[i]?.[p] ?? 0;
      if (Math.abs(y) < 1e-14) continue;

      const x = R[p]?.[p] ?? 0;
      const { c, s, r } = rotatie(x, y);
      const G = matriceaGivens(m, p, i, c, s);

      const inainte = R.map((linie) => [...linie]);
      R = curata(inmulteste(G, R));
      Q = inmulteste(Q, transpusa(G));

      pasi.push({
        iteratie: pasi.length + 1,
        tip: "givens",
        coloana: p,
        linie: i,
        inainte,
        dupa: R.map((linie) => [...linie]),
        T: G,
        c,
        s,
        r,
        explicatie: explica(p, i, x, y, c, s, r),
        latexPas:
          `\\htmlId{gv-c}{\\cos\\theta} = \\frac{x}{r} = ${latexNumar(c, 4)}, \\qquad ` +
          `\\htmlId{gv-s}{\\sin\\theta} = -\\frac{y}{r} = ${latexNumar(s, 4)}, \\qquad ` +
          `\\htmlId{gv-r}{r} = \\sqrt{x^2 + y^2} = ${latexNumar(r, 4)}`,
        evidentiaza: ["gv-c", "gv-s", "gv-r"],
      });
    }
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

/** Rotația unui vector din plan — ce arată interfața interactivă. */
export function rotesteInPlan(v: Vec2): Rotatie2D {
  const { c, s, r } = rotatie(v[0], v[1]);
  const G = [
    [c, -s],
    [s, c],
  ];

  return {
    v,
    c,
    s,
    r,
    // Unghiul cu care se rotește vectorul: chiar `−atan2(y, x)`, fiindcă `v`
    // ajunge pe semiaxa pozitivă.
    unghi: -Math.atan2(v[1], v[0]),
    imagine: [r, 0],
    G,
  };
}

/* ───────────────────────── proza ───────────────────────── */

function explica(
  p: number,
  linie: number,
  x: number,
  y: number,
  c: number,
  s: number,
  r: number,
): string {
  return (
    `Se anulează elementul de pe linia ${linie + 1}, coloana ${p + 1}, care e ${zecimale(y, 4)}. ` +
    `Rotația lucrează în planul liniilor ${p + 1} și ${linie + 1}, cu x = ${zecimale(x, 4)} de pe diagonală: ` +
    `r = ${zecimale(r, 6)}, cos θ = ${zecimale(c, 6)}, sin θ = ${zecimale(s, 6)}. ` +
    "Pe diagonală rămâne r, iar sub ea zero; toate celelalte linii ale matricei rămân neatinse."
  );
}
