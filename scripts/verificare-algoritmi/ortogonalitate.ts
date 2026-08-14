/**
 * Verificarea transformărilor ortogonale — rulează modulele reale din `src/`.
 *
 * Referință: `cursuri_MN/curs3_ortogonalitate.md`, §6 (Householder) și §7
 * (Givens), cu exemplele numerice din §6.5 și §7.4.
 *
 * Ce se verifică:
 *
 * 1. proprietățile reflectorului: simetric, ortogonal, `det = −1`, `Pv` pe axă;
 * 2. exemplul din §6.5, element cu element (`d`, `H₁`, `A₂`, `H₂`, `A₃`);
 * 3. proprietățile rotației și exemplul din §7.4 — inclusiv **greșeala de
 *    calcul din curs**, ținută ca test care trebuie să pice;
 * 4. `Q·R = A` și `QᵀQ = I` pe amândouă, plus pe matrice generate aleator;
 * 5. de ce contează semnul lui `d` (anularea catastrofală din §6.3);
 * 6. cazul plan, cel din interfață.
 */
import * as householder from "../../src/algorithms/norme-si-ortogonalitate/householder.ts";
import * as givens from "../../src/algorithms/norme-si-ortogonalitate/givens.ts";
import {
  abatere,
  identitate,
  inmulteste,
  normaEuclidiana,
  transpusa,
} from "../../src/algorithms/norme-si-ortogonalitate/matrice.ts";
import {
  MATRICE_GIVENS,
  MATRICE_HOUSEHOLDER,
} from "../../src/algorithms/norme-si-ortogonalitate/exemple.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

const aproape = (A: number[][], B: number[][], eps = 1e-12) => abatere(A, B) < eps;
const aproapeV = (u: readonly number[], v: readonly number[], eps = 1e-12) =>
  u.length === v.length && u.every((x, i) => Math.abs(x - (v[i] ?? 0)) < eps);

const determinant3 = (M: number[][]) =>
  (M[0]?.[0] ?? 0) * ((M[1]?.[1] ?? 0) * (M[2]?.[2] ?? 0) - (M[1]?.[2] ?? 0) * (M[2]?.[1] ?? 0)) -
  (M[0]?.[1] ?? 0) * ((M[1]?.[0] ?? 0) * (M[2]?.[2] ?? 0) - (M[1]?.[2] ?? 0) * (M[2]?.[0] ?? 0)) +
  (M[0]?.[2] ?? 0) * ((M[1]?.[0] ?? 0) * (M[2]?.[1] ?? 0) - (M[1]?.[1] ?? 0) * (M[2]?.[0] ?? 0));

console.log("=== 1. Proprietățile reflectorului (§6) ===");
{
  const v = [2, 1, 2];
  const { d, norma, H } = householder.reflector(v, 0);
  verifica("‖v‖₂ = 3", Math.abs(norma - 3) < 1e-15);
  verifica("d = (5, 1, 2), ca în curs", aproapeV(d, [5, 1, 2]));
  verifica("H e simetrică", aproape(H, transpusa(H)));
  verifica("H e ortogonală: HᵀH = I", aproape(inmulteste(transpusa(H), H), identitate(3)));
  verifica("det(H) = −1", Math.abs(determinant3(H) + 1) < 1e-12);
  const Hv = inmulteste(
    H,
    v.map((x) => [x]),
  ).map((linie) => linie[0] ?? 0);
  verifica(
    "H·v cade pe axă: (−3, 0, 0)",
    aproapeV(Hv, [-3, 0, 0], 1e-12),
    `${Hv.map((x) => x.toFixed(6)).join("; ")}`,
  );
  verifica("norma se păstrează", Math.abs(normaEuclidiana(Hv) - normaEuclidiana(v)) < 1e-12);
}

console.log("\n=== 2. Exemplul din §6.5, element cu element ===");
{
  const rulare = householder.run(MATRICE_HOUSEHOLDER);
  verifica("două reflexii pentru o matrice 3×3", rulare.pasi.length === 2, `${rulare.pasi.length}`);

  const p1 = rulare.pasi[0]!;
  verifica("pasul 1: d = (5, 1, 2)", aproapeV(p1.d ?? [], [5, 1, 2]));
  verifica(
    "pasul 1: H₁ = (1/15)·[[−10,−5,−10],[−5,14,−2],[−10,−2,11]]",
    aproape(
      p1.T.map((linie) => linie.map((x) => x * 15)),
      [
        [-10, -5, -10],
        [-5, 14, -2],
        [-10, -2, 11],
      ],
      1e-10,
    ),
  );
  verifica(
    "pasul 1: A₂ = [[−3,−3,−3],[0,−12/5,−3/5],[0,−9/5,−21/5]]",
    aproape(
      p1.dupa,
      [
        [-3, -3, -3],
        [0, -12 / 5, -3 / 5],
        [0, -9 / 5, -21 / 5],
      ],
      1e-12,
    ),
  );

  const p2 = rulare.pasi[1]!;
  verifica("pasul 2: d = (0, −27/5, −9/5)", aproapeV(p2.d ?? [], [0, -27 / 5, -9 / 5], 1e-12));
  verifica(
    "pasul 2: A₃ = R = [[−3,−3,−3],[0,3,3],[0,0,−3]]",
    aproape(
      p2.dupa,
      [
        [-3, -3, -3],
        [0, 3, 3],
        [0, 0, -3],
      ],
      1e-12,
    ),
  );
  verifica("Q·R = A", rulare.reziduu < 1e-12, rulare.reziduu.toExponential(2));
  verifica("QᵀQ = I", rulare.abatereOrtogonala < 1e-12, rulare.abatereOrtogonala.toExponential(2));
  verifica(
    "R e superior triunghiulară",
    rulare.R.every((linie, i) => linie.every((x, j) => j >= i || Math.abs(x) < 1e-12)),
  );
}

console.log("\n=== 3. Rotația Givens (§7) și exemplul din §7.4 ===");
{
  const { c, s, r } = givens.rotatie(4, 3);
  verifica(
    "c = x/r și s = −y/r",
    Math.abs(c - 0.8) < 1e-15 && Math.abs(s + 0.6) < 1e-15 && r === 5,
  );
  const G = givens.matriceaGivens(3, 0, 1, c, s);
  verifica("G e ortogonală", aproape(inmulteste(transpusa(G), G), identitate(3)));
  verifica(
    "G diferă de identitate în cel mult patru elemente",
    G.flatMap((linie, i) =>
      linie.map((x, j) => (Math.abs(x - (i === j ? 1 : 0)) > 1e-15 ? 1 : 0)),
    ).reduce((a: number, b: number) => a + b, 0) <= 4,
  );

  const rulare = givens.run(MATRICE_GIVENS);
  verifica(
    "trei rotații pentru matricea din curs",
    rulare.pasi.length === 3,
    `${rulare.pasi.length}`,
  );

  const g1 = rulare.pasi[0]!;
  verifica(
    "rotația 1 anulează (3,1) cu c = 0, s = −1",
    g1.linie === 2 &&
      g1.coloana === 0 &&
      Math.abs(g1.c ?? 1) < 1e-15 &&
      Math.abs((g1.s ?? 0) + 1) < 1e-15,
  );
  verifica(
    "rotația 1: A₂ = [[4,1,5],[3,2,0],[0,−1,−2]], ca în curs",
    aproape(
      g1.dupa,
      [
        [4, 1, 5],
        [3, 2, 0],
        [0, -1, -2],
      ],
      1e-12,
    ),
  );

  const g2 = rulare.pasi[1]!;
  verifica(
    "rotația 2: c = 4/5, s = −3/5, ca în curs",
    Math.abs((g2.c ?? 0) - 0.8) < 1e-12 && Math.abs((g2.s ?? 0) + 0.6) < 1e-12,
  );
  verifica("Q·R = A", rulare.reziduu < 1e-12, rulare.reziduu.toExponential(2));
  verifica("QᵀQ = I", rulare.abatereOrtogonala < 1e-12, rulare.abatereOrtogonala.toExponential(2));
  verifica(
    "R = [[5,2,4],[0,√2,−√2/2],[0,0,−5√2/2]]",
    aproape(
      rulare.R,
      [
        [5, 2, 4],
        [0, Math.SQRT2, -Math.SQRT2 / 2],
        [0, 0, (-5 * Math.SQRT2) / 2],
      ],
      1e-12,
    ),
    rulare.R.map((linie) => linie.map((x) => x.toFixed(4)).join(" ")).join(" | "),
  );
}

console.log("\n=== 4. Greșeala din §7.4 (test care trebuie să PICE dacă cineva o „repară”) ===");
{
  const rulare = givens.run(MATRICE_GIVENS);
  const dupaRotatia2 = rulare.pasi[1]!.dupa;
  verifica(
    "A₃(2,3) = −3, nu 0 cum e tipărit în curs",
    Math.abs((dupaRotatia2[1]?.[2] ?? 0) + 3) < 1e-12,
    `${(dupaRotatia2[1]?.[2] ?? 0).toFixed(6)}`,
  );
  verifica(
    "matricea tipărită în curs, [[5,2,4],[0,1,0],[0,−1,−2]], nu e ce iese din calcul",
    !aproape(
      dupaRotatia2,
      [
        [5, 2, 4],
        [0, 1, 0],
        [0, -1, -2],
      ],
      1e-9,
    ),
  );
  verifica(
    "nici R final nu e [[5,2,4],[0,√2,0],[0,0,−√2]], cum scrie cursul",
    !aproape(
      rulare.R,
      [
        [5, 2, 4],
        [0, Math.SQRT2, 0],
        [0, 0, -Math.SQRT2],
      ],
      1e-9,
    ),
  );
  // …dar concluzia cursului rămâne: R e triunghiulară și QR = A.
  verifica(
    "concluzia cursului rămâne valabilă: R triunghiulară și Q·R = A",
    rulare.reziduu < 1e-12 &&
      rulare.R.every((linie, i) => linie.every((x, j) => j >= i || Math.abs(x) < 1e-12)),
  );
}

console.log("\n=== 5. De ce semnul lui d contează (§6.2, §6.3) ===");
{
  // Vector aproape lipit de axă: cu semnul greșit, d iese aproape nul.
  const v = [1, 1e-10, 0];
  const bun = householder.reflector(v, 0);
  const dGresit = [v[0]! - normaEuclidiana(v), v[1]!, v[2]!];
  const normaBun = normaEuclidiana(bun.d);
  const normaGresit = normaEuclidiana(dGresit);
  verifica(
    "cu semnul din curs, ‖d‖ rămâne de ordinul lui ‖v‖",
    normaBun > 1,
    `‖d‖ = ${normaBun.toExponential(2)}`,
  );
  verifica(
    "cu semnul opus, ‖d‖ se prăbușește — de aici anularea catastrofală",
    normaGresit < 1e-9,
    `‖d‖ = ${normaGresit.toExponential(2)}`,
  );
}

console.log("\n=== 6. Pe matrice generate aleator ===");
{
  let sămânță = 12345;
  const aleator = () => {
    sămânță = (sămânță * 1103515245 + 12345) % 2147483648;
    return (sămânță / 2147483648) * 4 - 2;
  };

  let maxHh = 0;
  let maxGv = 0;
  let maxOrtHh = 0;
  let maxOrtGv = 0;
  for (let t = 0; t < 200; t++) {
    const n = 3 + (t % 3);
    const A = Array.from({ length: n }, () => Array.from({ length: n }, aleator));
    const hh = householder.run(A);
    const gv = givens.run(A);
    maxHh = Math.max(maxHh, hh.reziduu);
    maxGv = Math.max(maxGv, gv.reziduu);
    maxOrtHh = Math.max(maxOrtHh, hh.abatereOrtogonala);
    maxOrtGv = Math.max(maxOrtGv, gv.abatereOrtogonala);
  }
  verifica("Householder: Q·R = A pe 200 de matrice", maxHh < 1e-11, maxHh.toExponential(2));
  verifica("Givens: Q·R = A pe 200 de matrice", maxGv < 1e-11, maxGv.toExponential(2));
  verifica("Householder: QᵀQ = I", maxOrtHh < 1e-11, maxOrtHh.toExponential(2));
  verifica("Givens: QᵀQ = I", maxOrtGv < 1e-11, maxOrtGv.toExponential(2));
}

console.log("\n=== 7. Cazul plan, cel din interfață ===");
{
  for (const v of [
    [2, 1],
    [-3, 4],
    [0, 5],
    [1, 0],
    [-1, -1],
  ] as const) {
    const refl = householder.reflectaInPlan(v);
    const rot = givens.rotesteInPlan(v);

    const Pv = inmulteste(
      refl.P,
      v.map((x) => [x]),
    ).map((linie) => linie[0] ?? 0);
    const Gv = inmulteste(
      rot.G,
      v.map((x) => [x]),
    ).map((linie) => linie[0] ?? 0);

    verifica(
      `v = (${v[0]}; ${v[1]}) — P·v cade pe axă și e chiar imaginea raportată`,
      Math.abs(Pv[1] ?? 0) < 1e-12 && aproapeV(Pv, refl.imagine, 1e-12),
      `P·v = (${(Pv[0] ?? 0).toFixed(4)}; ${(Pv[1] ?? 0).toFixed(4)})`,
    );
    verifica(
      `v = (${v[0]}; ${v[1]}) — G·v cade pe axă, la r = ‖v‖`,
      Math.abs(Gv[1] ?? 0) < 1e-12 &&
        Math.abs((Gv[0] ?? 0) - normaEuclidiana(v)) < 1e-12 &&
        aproapeV(Gv, rot.imagine, 1e-12),
    );
    verifica(
      `v = (${v[0]}; ${v[1]}) — oglinda e perpendiculară pe d`,
      Math.abs(refl.d[0] * refl.oglinda[0] + refl.d[1] * refl.oglinda[1]) < 1e-12,
    );
    verifica(
      `v = (${v[0]}; ${v[1]}) — amândouă păstrează norma`,
      Math.abs(normaEuclidiana(Pv) - normaEuclidiana(v)) < 1e-12 &&
        Math.abs(normaEuclidiana(Gv) - normaEuclidiana(v)) < 1e-12,
    );
  }
}

console.log("");
if (picate === 0) console.log("✓ toate verificările de ortogonalitate au trecut");
else console.log(`✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);
