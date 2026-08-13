/**
 * Verificarea curbelor de nivel în formă închisă (`src/lib/curbe-de-nivel.ts`).
 *
 * Modulul înlocuiește marching squares cu o formulă exactă, iar întreaga
 * economie stă pe două afirmații care trebuie să fie adevărate, nu plauzibile:
 *
 * 1. **descompunerea `A = QΛQᵀ` e corectă**, inclusiv pe cazurile degenerate
 *    (`a₁₂ = 0`, valori proprii egale) — acolo formula generală ar da vectorul
 *    nul, deci ramura separată e chiar locul unde se poate strica ceva;
 * 2. **fiecare punct al elipsei stă pe curbă**, nu doar „aproximativ" — dacă
 *    n-ar sta, desenul ar afirma tăcut că iterația a aterizat pe alt nivel
 *    decât cel calculat, iar explicația zigzagului (reziduul normal pe curbă)
 *    ar rămâne fără suport.
 *
 * Se rulează cu `bash scripts/verificare-algoritmi/ruleaza.sh`.
 */
import {
  centrul,
  conditionare,
  eigenSimetrica2,
  elipsaNivel,
  esteSPD,
  inmulteste,
  niveleEchidistante,
  norma,
  produsScalar,
  razaA,
  scade,
  valoare,
} from "../../src/lib/curbe-de-nivel.ts";
import type { Mat2, Vec2 } from "../../src/lib/curbe-de-nivel.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

/** Generator determinist: o verificare care dă alt rezultat la fiecare rulare nu e o verificare. */
function aleator(samanta: number): () => number {
  let s = samanta >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Norma Frobenius a unei simetrice scrise ca `[a₁₁, a₁₂, a₂₂]`. */
function normaMat(A: Mat2): number {
  return Math.hypot(A[0], A[1], A[1], A[2]);
}

/** Reface `QΛQᵀ` din descompunere, ca să se poată compara cu matricea de plecare. */
function reconstruieste(valori: [number, number], vectori: [Vec2, Vec2]): Mat2 {
  const [l1, l2] = valori;
  const [q1, q2] = vectori;
  return [
    l1 * q1[0] * q1[0] + l2 * q2[0] * q2[0],
    l1 * q1[0] * q1[1] + l2 * q2[0] * q2[1],
    l1 * q1[1] * q1[1] + l2 * q2[1] * q2[1],
  ];
}

/** O simetrică oarecare, cu elemente în [−3, 3]. */
function simetricaAleatoare(rnd: () => number): Mat2 {
  return [rnd() * 6 - 3, rnd() * 6 - 3, rnd() * 6 - 3];
}

/**
 * O pozitiv definită construită din valori proprii și un unghi, ca să se poată
 * ține condiționarea sub control: pe o matrice aproape singulară pragul relativ
 * n-ar mai măsura corectitudinea formulei, ci amplificarea erorii de rotunjire.
 */
function spdAleatoare(rnd: () => number): Mat2 {
  const l1 = 0.2 + rnd() * 4.8;
  const l2 = 0.2 + rnd() * 4.8;
  const t = rnd() * Math.PI;
  const c = Math.cos(t);
  const s = Math.sin(t);
  return [l1 * c * c + l2 * s * s, (l1 - l2) * c * s, l1 * s * s + l2 * c * c];
}

console.log("=== 1. eigenSimetrica2 reface matricea: A = QΛQᵀ ===");
{
  const rnd = aleator(17);
  let maxRelativ = 0;
  for (let k = 0; k < 500; k++) {
    const A = simetricaAleatoare(rnd);
    const { valori, vectori } = eigenSimetrica2(A);
    const R = reconstruieste(valori, vectori);
    const abatere = normaMat([R[0] - A[0], R[1] - A[1], R[2] - A[2]]);
    maxRelativ = Math.max(maxRelativ, abatere / Math.max(normaMat(A), 1e-300));
  }
  verifica(
    "500 de simetrice aleatoare",
    maxRelativ < 1e-13,
    `abatere relativă maximă ${maxRelativ.toExponential(2)}`,
  );

  // Cazurile pe care ramura separată din modul le tratează explicit.
  const speciale: [string, Mat2][] = [
    ["a₁₂ = 0, a₁₁ > a₂₂", [5, 0, 1]],
    ["a₁₂ = 0, a₁₁ < a₂₂", [1, 0, 5]],
    ["A = kI (valori proprii egale)", [3, 0, 3]],
    ["A = −kI", [-2, 0, -2]],
    ["A = 0", [0, 0, 0]],
    ["a₁₁ = a₂₂, a₁₂ ≠ 0", [2, 1.5, 2]],
    ["a₁₂ foarte mic, dar nenul", [1, 1e-13, 4]],
  ];
  for (const [nume, A] of speciale) {
    const { valori, vectori } = eigenSimetrica2(A);
    const R = reconstruieste(valori, vectori);
    const abatere = normaMat([R[0] - A[0], R[1] - A[1], R[2] - A[2]]);
    const scara = Math.max(normaMat(A), 1);
    verifica(nume, abatere / scara < 1e-13, `abatere ${abatere.toExponential(2)}`);
  }

  // Ordinea promisă în documentația modulului.
  const rnd2 = aleator(29);
  let ordonate = true;
  for (let k = 0; k < 500; k++) {
    const { valori } = eigenSimetrica2(simetricaAleatoare(rnd2));
    if (!(valori[0] >= valori[1])) ordonate = false;
  }
  verifica("valori[0] ≥ valori[1] peste tot", ordonate);
}

console.log("\n=== 2. Vectorii proprii sunt ortonormați ===");
{
  const rnd = aleator(37);
  let maxAbatere = 0;
  const toate: Mat2[] = [
    [5, 0, 1],
    [1, 0, 5],
    [3, 0, 3],
    [0, 0, 0],
    [2, 1.5, 2],
  ];
  for (let k = 0; k < 500; k++) toate.push(simetricaAleatoare(rnd));

  for (const A of toate) {
    const { vectori } = eigenSimetrica2(A);
    const [q1, q2] = vectori;
    maxAbatere = Math.max(
      maxAbatere,
      Math.abs(norma(q1) - 1),
      Math.abs(norma(q2) - 1),
      Math.abs(produsScalar(q1, q2)),
    );
  }
  verifica(
    "normă 1 și produs scalar 0",
    maxAbatere < 1e-15,
    `abatere maximă ${maxAbatere.toExponential(2)}`,
  );
}

console.log("\n=== 3. Fiecare punct al elipsei stă exact pe nivelul cerut ===");
{
  const rnd = aleator(53);
  let maxRelativ = 0;
  let totalPuncte = 0;
  let celMaiRauSistem = "";
  for (let k = 0; k < 200; k++) {
    const A = spdAleatoare(rnd);
    const b: Vec2 = [rnd() * 4 - 2, rnd() * 4 - 2];
    const x = centrul(A, b)!;
    const fMin = valoare(A, b, x);

    for (const rho of [0.1, 0.5, 1, 2.5, 7]) {
      const nivel = fMin + 0.5 * rho * rho;
      const puncte = elipsaNivel(A, b, nivel);
      if (puncte.length === 0) {
        verifica("elipsa nu e goală pentru un nivel peste minim", false);
        continue;
      }
      for (const p of puncte) {
        totalPuncte++;
        // Scara relativă: diferența de nivel față de fund, adică chiar mărimea
        // pe care o poartă elipsa. Raportarea la |nivel| ar fi înșelătoare,
        // fiindcă f(x*) poate fi oricât de mare și ar ascunde eroarea.
        const relativ = Math.abs(valoare(A, b, p) - nivel) / (0.5 * rho * rho);
        if (relativ > maxRelativ) {
          maxRelativ = relativ;
          celMaiRauSistem = `A=[${A.map((v) => v.toFixed(3)).join(", ")}], ρ=${rho}`;
        }
      }
    }
  }
  verifica(
    `f(p) = nivel pe toate cele ${totalPuncte} de puncte`,
    maxRelativ < 1e-10,
    `abatere relativă maximă ${maxRelativ.toExponential(2)} (${celMaiRauSistem})`,
  );
}

console.log("\n=== 4. Curba e închisă la egalitate de biți ===");
{
  const rnd = aleator(71);
  let inchise = true;
  for (let k = 0; k < 200; k++) {
    const A = spdAleatoare(rnd);
    const b: Vec2 = [rnd() * 4 - 2, rnd() * 4 - 2];
    const nivel = valoare(A, b, centrul(A, b)!) + 1.5;
    for (const cate of [8, 17, 96, 240]) {
      const puncte = elipsaNivel(A, b, nivel, cate);
      const primul = puncte[0]!;
      const ultimul = puncte.at(-1)!;
      if (puncte.length !== cate + 1) inchise = false;
      if (!Object.is(primul[0], ultimul[0]) || !Object.is(primul[1], ultimul[1])) inchise = false;
    }
  }
  verifica("ultimul punct e chiar primul (Object.is)", inchise);
}

console.log("\n=== 5. Elipsa e goală când nu există curbă de desenat ===");
{
  const A: Mat2 = [4, 1, 3];
  const b: Vec2 = [1, 2];
  const fMin = valoare(A, b, centrul(A, b)!);

  verifica("nivel sub fundul văii", elipsaNivel(A, b, fMin - 1).length === 0);
  verifica("nivel chiar la fundul văii", elipsaNivel(A, b, fMin).length === 0);
  verifica("nivel cu foarte puțin sub fund", elipsaNivel(A, b, fMin - 1e-12).length === 0);

  const nepozitive: [string, Mat2][] = [
    ["[[1, 2], [2, 1]] — nedefinită (det < 0)", [1, 2, 1]],
    ["[[0, 1], [1, 0]] — nedefinită, cu a₁₁ = 0", [0, 1, 0]],
    ["[[−1, 0], [0, −1]] — negativ definită", [-1, 0, -1]],
  ];
  for (const [nume, M] of nepozitive) {
    verifica(`${nume}: esteSPD = false`, !esteSPD(M));
    // Niveluri de ambele semne: pentru o nedefinită mulțimile de nivel există,
    // dar sunt hiperbole — deci lista trebuie să fie goală indiferent de nivel.
    const goale = [-10, -1, 0, 1, 10].every((nivel) => elipsaNivel(M, [1, 2], nivel).length === 0);
    verifica(`${nume}: nicio elipsă, la niciun nivel`, goale);
  }
}

console.log("\n=== 6. centrul(A, b) chiar rezolvă A·x = b ===");
{
  const rnd = aleator(83);
  let maxRezidual = 0;
  for (let k = 0; k < 500; k++) {
    const A = spdAleatoare(rnd);
    const b: Vec2 = [rnd() * 4 - 2, rnd() * 4 - 2];
    const x = centrul(A, b)!;
    maxRezidual = Math.max(maxRezidual, norma(scade(inmulteste(A, x), b)));
  }
  verifica("rezidual ‖A·x − b‖", maxRezidual < 1e-12, `maximul e ${maxRezidual.toExponential(2)}`);

  verifica("A singulară → null", centrul([2, 2, 2], [1, 1]) === null);
}

console.log("\n=== 7. Sistemul din curs: A = [[4, 1], [1, 3]], b = (1, 2) ===");
{
  const A: Mat2 = [4, 1, 3];
  const b: Vec2 = [1, 2];
  const x = centrul(A, b)!;

  // det A = 4·3 − 1·1 = 11; x* = (1/11, 7/11) prin regula lui Cramer.
  verifica(
    "x* = (1/11, 7/11)",
    Math.abs(x[0] - 1 / 11) < 1e-15 && Math.abs(x[1] - 7 / 11) < 1e-15,
    `(${x[0]}, ${x[1]})`,
  );

  // λ = 7/2 ± √((1/2)² + 1) ⇒ κ = (3,5 + √1,25)/(3,5 − √1,25).
  const kappaExact = (3.5 + Math.sqrt(1.25)) / (3.5 - Math.sqrt(1.25));
  const kappa = conditionare(A);
  verifica(
    "κ(A) ≈ 1,94",
    Math.abs(kappa - kappaExact) < 1e-14 && Math.abs(kappa - 1.94) < 0.005,
    `κ = ${kappa.toFixed(6)}, formula închisă dă ${kappaExact.toFixed(6)}`,
  );

  const { valori } = eigenSimetrica2(A);
  verifica(
    "λ₁, λ₂ = 7/2 ± √5/2",
    Math.abs(valori[0] - (3.5 + Math.sqrt(1.25))) < 1e-14 &&
      Math.abs(valori[1] - (3.5 - Math.sqrt(1.25))) < 1e-14,
    `${valori[0].toFixed(6)} și ${valori[1].toFixed(6)}`,
  );
}

console.log("\n=== 8. niveleEchidistante dă raze A-metrice echidistante ===");
{
  const rnd = aleator(101);
  let maxAbatere = 0;
  let maxNeliniaritate = 0;
  for (let k = 0; k < 100; k++) {
    const A = spdAleatoare(rnd);
    const b: Vec2 = [rnd() * 4 - 2, rnd() * 4 - 2];
    const raza = 0.5 + rnd() * 4;
    const cate = 5;
    const niveluri = niveleEchidistante(A, b, raza, cate);
    if (niveluri.length !== cate) {
      verifica("niveleEchidistante dă exact `cate` niveluri", false);
      continue;
    }

    const razeMasurate: number[] = [];
    for (const [j, nivel] of niveluri.entries()) {
      const asteptata = ((j + 1) * raza) / cate;
      const puncte = elipsaNivel(A, b, nivel);
      let minRaza = Number.POSITIVE_INFINITY;
      let maxRaza = 0;
      for (const p of puncte) {
        const r = razaA(A, b, p);
        minRaza = Math.min(minRaza, r);
        maxRaza = Math.max(maxRaza, r);
        maxAbatere = Math.max(maxAbatere, Math.abs(r - asteptata) / asteptata);
      }
      // Inelul e chiar un cerc în metrica lui A: aceeași rază peste tot pe el.
      maxAbatere = Math.max(maxAbatere, (maxRaza - minRaza) / asteptata);
      razeMasurate.push((minRaza + maxRaza) / 2);
    }

    // Creștere liniară: diferențele consecutive trebuie să fie egale.
    const pas = raza / cate;
    for (let j = 1; j < razeMasurate.length; j++) {
      const diferenta = razeMasurate[j]! - razeMasurate[j - 1]!;
      maxNeliniaritate = Math.max(maxNeliniaritate, Math.abs(diferenta - pas) / pas);
    }
  }
  verifica(
    "raza A-metrică a inelului j e j·raza/cate",
    maxAbatere < 1e-10,
    `abatere relativă maximă ${maxAbatere.toExponential(2)}`,
  );
  verifica(
    "diferențele dintre inele sunt egale (creștere liniară)",
    maxNeliniaritate < 1e-10,
    `abatere relativă maximă ${maxNeliniaritate.toExponential(2)}`,
  );

  verifica(
    "rază nepozitivă → nicio listă",
    niveleEchidistante([4, 1, 3], [1, 2], 0, 5).length === 0,
  );
  verifica("cate = 0 → nicio listă", niveleEchidistante([4, 1, 3], [1, 2], 3, 0).length === 0);
  verifica("A singulară → nicio listă", niveleEchidistante([2, 2, 2], [1, 1], 3, 5).length === 0);
}

console.log(
  picate === 0 ? "\n✓ curbele de nivel sunt verificate" : `\n✗ ${picate} verificări au picat`,
);
process.exit(picate === 0 ? 0 : 1);
