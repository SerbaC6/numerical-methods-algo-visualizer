/**
 * Verificarea metodelor iterative — rulează modulele reale din `src/`.
 *
 * Referință: `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §3–§7 și
 * problemele 3 și 4 din §10.
 *
 * Ce se verifică, în ordine:
 *
 * 1. partiționarea `A = D − L − U` și tabelul de sinteză din §3.2;
 * 2. raza spectrală calculată în formă închisă, față de o valoare obținută altfel
 *    (iterația `‖Gᵏ‖^(1/k)`, care nu folosește deloc polinomul caracteristic);
 * 3. iterația pe componente = forma matriceală `x = G·x + c`, la toate trei;
 * 4. cifrele scrise în `sisteme.ts` și în teorie (numere de iterații, raze);
 * 5. cazurile-limită: diagonală nulă, ω în afara intervalului, divergență;
 * 6. cele două abateri de la curs, ținute ca **teste care trebuie să pice**.
 */
import * as jacobi from "../../src/algorithms/metode-iterative/jacobi.ts";
import * as gaussSeidel from "../../src/algorithms/metode-iterative/gauss-seidel.ts";
import * as sor from "../../src/algorithms/metode-iterative/sor.ts";
import {
  descompune,
  matriceaDeIteratie,
  partitioneaza,
  pasulGeneral,
} from "../../src/algorithms/metode-iterative/partitionare.ts";
import { razaSpectrala } from "../../src/algorithms/metode-iterative/spectru.ts";
import {
  normaInfinit,
  rezolvaSistem,
  scade,
} from "../../src/algorithms/metode-iterative/liniar.ts";
import { SISTEME } from "../../src/algorithms/metode-iterative/sisteme.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

const egale = (u: readonly number[], v: readonly number[], eps = 1e-12) =>
  u.length === v.length && u.every((x, i) => Math.abs(x - (v[i] ?? 0)) < eps);

const egaleMat = (A: number[][], B: number[][], eps = 1e-12) =>
  A.length === B.length && A.every((linie, i) => egale(linie, B[i] ?? [], eps));

/** Problema 3 din §10 — dominant diagonală. */
const A3 = [
  [10, -5, 1],
  [1, 4, 3],
  [4, -3, -9],
];
const B3 = [1, 4, 6];

/** Problema 4 din §10 — toate liniile la egalitate. */
const A4 = [
  [2, 1, 1],
  [1, 2, 1],
  [1, 1, 2],
];
const B4 = [4, 4, 4];

console.log("=== 1. Partiționarea A = D − L − U (§3.2) ===");
{
  const { D, L, U } = partitioneaza(A4);
  verifica(
    "L are semnul schimbat față de A",
    egaleMat(L, [
      [0, 0, 0],
      [-1, 0, 0],
      [-1, -1, 0],
    ]),
  );
  verifica(
    "U are semnul schimbat față de A",
    egaleMat(U, [
      [0, -1, -1],
      [0, 0, -1],
      [0, 0, 0],
    ]),
  );
  const refacut = D.map((linie, i) => linie.map((d, j) => d - (L[i]?.[j] ?? 0) - (U[i]?.[j] ?? 0)));
  verifica("D − L − U = A", egaleMat(refacut, A4));
}

console.log("\n=== 2. Tabelul de sinteză M, N (§3.2) ===");
{
  const { D, L, U } = partitioneaza(A3);
  const suma = (X: number[][], Y: number[][]) =>
    X.map((linie, i) => linie.map((x, j) => x + (Y[i]?.[j] ?? 0)));

  verifica(
    "Jacobi: M = D, N = L + U",
    (() => {
      const { M, N } = descompune(A3, "jacobi");
      return egaleMat(M, D) && egaleMat(N, suma(L, U));
    })(),
  );

  verifica(
    "Gauss-Seidel: M = D − L, N = U",
    (() => {
      const { M, N } = descompune(A3, "gauss-seidel");
      const asteptat = D.map((linie, i) => linie.map((d, j) => d - (L[i]?.[j] ?? 0)));
      return egaleMat(M, asteptat) && egaleMat(N, U);
    })(),
  );

  const omega = 1.25;
  verifica(
    `SOR (ω = ${omega}): M = D − ωL, N = (1−ω)D + ωU`,
    (() => {
      const { M, N } = descompune(A3, "sor", omega);
      const mAsteptat = D.map((linie, i) => linie.map((d, j) => d - omega * (L[i]?.[j] ?? 0)));
      const nAsteptat = D.map((linie, i) =>
        linie.map((d, j) => (1 - omega) * d + omega * (U[i]?.[j] ?? 0)),
      );
      return egaleMat(M, mAsteptat) && egaleMat(N, nAsteptat);
    })(),
  );

  verifica(
    "A = M − N la toate trei",
    (() => {
      return (["jacobi", "gauss-seidel"] as const).every((metoda) => {
        const { M, N } = descompune(A3, metoda);
        return egaleMat(
          M.map((linie, i) => linie.map((m, j) => m - (N[i]?.[j] ?? 0))),
          A3,
        );
      });
    })(),
  );

  // La SOR, descompunerea din curs e a lui ω·A, nu a lui A: A = ω(D − L − U).
  verifica(
    "SOR: M − N = ω·A",
    (() => {
      const { M, N } = descompune(A3, "sor", omega);
      const diferenta = M.map((linie, i) => linie.map((m, j) => m - (N[i]?.[j] ?? 0)));
      return egaleMat(
        diferenta,
        A3.map((linie) => linie.map((a) => omega * a)),
      );
    })(),
  );
}

console.log("\n=== 3. Raza spectrală, verificată pe altă cale ===");
{
  /** `‖Gᵏ‖∞^(1/k)` tinde la ρ(G); nu folosește deloc polinomul caracteristic. */
  const razaPrinPuteri = (G: number[][], k = 400) => {
    // Înmulțire matriceală explicită, cu rescalare la fiecare pas ca norma să
    // nu explodeze; scara se ține în logaritm și se pune la loc la final.
    let P = G.map((linie) => [...linie]);
    let logScara = 0;
    for (let pas = 1; pas < k; pas++) {
      const Q = P.map((linie, i) =>
        linie.map((_, j) => G[i]?.reduce((s, g, l) => s + g * (P[l]?.[j] ?? 0), 0) ?? 0),
      );
      const norma = Math.max(...Q.map((linie) => linie.reduce((s, x) => s + Math.abs(x), 0)));
      if (norma === 0) return 0;
      logScara += Math.log(norma);
      P = Q.map((linie) => linie.map((x) => x / norma));
      if (!Number.isFinite(logScara)) break;
    }
    const normaFinala = Math.max(...P.map((linie) => linie.reduce((s, x) => s + Math.abs(x), 0)));
    return Math.exp((logScara + Math.log(normaFinala)) / k);
  };

  for (const [nume, A, b] of [
    ["problema 3", A3, B3],
    ["problema 4", A4, B4],
  ] as const) {
    for (const metoda of ["jacobi", "gauss-seidel"] as const) {
      const it = matriceaDeIteratie(A, b, metoda);
      if (!it) {
        verifica(`${nume} / ${metoda}: G există`, false);
        continue;
      }
      const inchisa = razaSpectrala(it.G);
      const prinPuteri = razaPrinPuteri(it.G);
      verifica(
        `${nume} / ${metoda}: ρ în formă închisă = ρ prin puteri`,
        inchisa !== null && Math.abs(inchisa - prinPuteri) < 5e-3,
        `închisă ${inchisa?.toFixed(6)}, prin puteri ${prinPuteri.toFixed(6)}`,
      );
    }
  }
}

console.log("\n=== 4. Iterația pe componente = forma matriceală x = G·x + c (§3) ===");
{
  for (const [nume, A, b] of [
    ["problema 3", A3, B3],
    ["problema 4", A4, B4],
  ] as const) {
    for (const [eticheta, metoda, modul, omega] of [
      ["Jacobi", "jacobi", jacobi, 1],
      ["Gauss-Seidel", "gauss-seidel", gaussSeidel, 1],
      ["SOR ω=0,8", "sor", sor, 0.8],
      ["SOR ω=1,25", "sor", sor, 1.25],
    ] as const) {
      const x0 = [0.3, -0.7, 1.1];
      const rulare = modul.run({ A, b, x0, tol: 0, maxIteratii: 3, omega });
      const it = matriceaDeIteratie(A, b, metoda, omega);
      if (!it) {
        verifica(`${nume} / ${eticheta}: G există`, false);
        continue;
      }
      let asteptat = x0;
      let potrivit = true;
      for (const pas of rulare.pasi) {
        asteptat = pasulGeneral(it.G, it.c, asteptat);
        potrivit = potrivit && egale(pas.x, asteptat, 1e-10);
      }
      verifica(`${nume} / ${eticheta}: 3 pași identici cu G·x + c`, potrivit);
    }
  }
}

console.log("\n=== 5. Cifrele scrise pe pagină (§10, problemele 3 și 4) ===");
{
  const x0 = [0, 0, 0];
  const dominant = SISTEME[0]!.valori;
  const blocat = SISTEME[1]!.valori;
  verifica(
    "sistemele din interfață sunt chiar problemele 3 și 4",
    dominant.a11 === 10 && dominant.a33 === -9 && blocat.a11 === 2 && blocat.b1 === 4,
  );

  const j3 = jacobi.run({ A: A3, b: B3, x0, tol: 1e-8, maxIteratii: 200 });
  const g3 = gaussSeidel.run({ A: A3, b: B3, x0, tol: 1e-8, maxIteratii: 200 });
  verifica(
    "problema 3 / Jacobi: 33 de iterații",
    j3.stare === "convergent" && j3.pasi.length === 33,
    `${j3.pasi.length}`,
  );
  verifica(
    "problema 3 / Gauss-Seidel: 23 de iterații",
    g3.stare === "convergent" && g3.pasi.length === 23,
    `${g3.pasi.length}`,
  );
  verifica(
    "problema 3 / ρ(J) = 0,6072 și ρ(GS) = 0,4082",
    Math.abs((j3.razaSpectrala ?? 0) - 0.607243) < 1e-5 &&
      Math.abs((g3.razaSpectrala ?? 0) - 0.408248) < 1e-5,
    `${j3.razaSpectrala?.toFixed(6)} / ${g3.razaSpectrala?.toFixed(6)}`,
  );
  verifica(
    "problema 3 / soluția iterativă = soluția exactă",
    egale(j3.pasi.at(-1)!.x, rezolvaSistem(A3, B3)!, 1e-7),
  );

  const j4 = jacobi.run({ A: A4, b: B4, x0, tol: 1e-8, maxIteratii: 200 });
  const g4 = gaussSeidel.run({ A: A4, b: B4, x0, tol: 1e-8, maxIteratii: 200 });
  verifica("problema 4 / ρ(Jacobi) = 1 exact", Math.abs((j4.razaSpectrala ?? 0) - 1) < 1e-12);
  verifica("problema 4 / Jacobi nu converge", j4.stare === "neterminat");
  verifica(
    "problema 4 / Jacobi oscilează între (0,0,0) și (2,2,2)",
    j4.pasi.slice(0, 6).every((pas, k) => egale(pas.x, k % 2 === 0 ? [2, 2, 2] : [0, 0, 0], 1e-12)),
  );
  verifica(
    "problema 4 / Gauss-Seidel: 20 de iterații",
    g4.stare === "convergent" && g4.pasi.length === 20,
    `${g4.pasi.length}`,
  );
  verifica(
    "problema 4 / Gauss-Seidel ajunge la (1,1,1)",
    egale(g4.pasi.at(-1)!.x, [1, 1, 1], 1e-7),
  );
  verifica(
    "problema 4 / ρ(GS) = 0,3536",
    Math.abs((g4.razaSpectrala ?? 0) - 0.353553) < 1e-5,
    `${g4.razaSpectrala?.toFixed(6)}`,
  );

  // ω optim, măsurat prin scanare — cifra din teorie.
  const scaneaza = (A: number[][], b: number[]) => {
    let cel = { omega: 1, raza: Number.POSITIVE_INFINITY };
    for (let omega = 0.05; omega < 2; omega += 0.005) {
      const it = matriceaDeIteratie(A, b, "sor", omega);
      const raza = it ? razaSpectrala(it.G) : null;
      if (raza !== null && raza < cel.raza) cel = { omega, raza };
    }
    return cel;
  };
  const optim3 = scaneaza(A3, B3);
  const optim4 = scaneaza(A4, B4);
  verifica(
    "problema 3 / ω optim ≈ 0,935 (subunitar, deci subrelaxare)",
    Math.abs(optim3.omega - 0.935) < 0.01 && optim3.omega < 1,
    `ω = ${optim3.omega.toFixed(3)}, ρ = ${optim3.raza.toFixed(6)}`,
  );
  verifica(
    "problema 4 / ω optim ≈ 1,08 (supraunitar, deci suprarelaxare)",
    Math.abs(optim4.omega - 1.08) < 0.01 && optim4.omega > 1,
    `ω = ${optim4.omega.toFixed(3)}, ρ = ${optim4.raza.toFixed(6)}`,
  );
  verifica(
    "problema 3 / SOR la ω optim: 22 de iterații, cu una mai puțin decât Gauss-Seidel",
    sor.run({ A: A3, b: B3, x0, tol: 1e-8, maxIteratii: 200, omega: optim3.omega }).pasi.length ===
      22,
  );
  verifica(
    "problema 4 / SOR la ω optim: 19 iterații, cu una mai puțin decât Gauss-Seidel",
    sor.run({ A: A4, b: B4, x0, tol: 1e-8, maxIteratii: 200, omega: optim4.omega }).pasi.length ===
      19,
  );
}

console.log("\n=== 6. Cazuri-limită ===");
{
  const x0 = [0, 0, 0];
  const cuZeroPeDiagonala = [
    [0, 1, 1],
    [1, 2, 1],
    [1, 1, 2],
  ];
  const zero = jacobi.run({ A: cuZeroPeDiagonala, b: B4, x0, tol: 1e-8, maxIteratii: 10 });
  verifica("diagonală nulă: eșec, cu motiv scris", zero.stare === "esuat" && !!zero.motiv);
  verifica("diagonală nulă: niciun pas produs", zero.pasi.length === 0);

  for (const omega of [0, 2, 2.5, -0.5]) {
    const r = sor.run({ A: A3, b: B3, x0, tol: 1e-8, maxIteratii: 10, omega });
    verifica(`SOR cu ω = ${omega}: refuzat înainte de primul pas`, r.stare === "esuat");
  }

  // Sistem nedominant, ales ca să divergă: ρ(Jacobi) = 4.
  const divergent = [
    [1, 2, 0],
    [2, 1, 0],
    [0, 0, 1],
  ];
  const d = jacobi.run({ A: divergent, b: [1, 1, 1], x0, tol: 1e-8, maxIteratii: 200 });
  verifica(
    "sistem divergent: se oprește cu motiv, nu se învârte",
    d.stare === "esuat" && (d.razaSpectrala ?? 0) > 1,
    `ρ = ${d.razaSpectrala?.toFixed(4)}`,
  );

  const dinSolutie = gaussSeidel.run({
    A: A3,
    b: B3,
    x0: rezolvaSistem(A3, B3)!,
    tol: 1e-8,
    maxIteratii: 10,
  });
  verifica(
    "pornire chiar din x*: se oprește la prima iterație",
    dinSolutie.stare === "convergent" && dinSolutie.pasi.length === 1,
  );
}

console.log("\n=== 7. Abaterile de la curs (trebuie să PICE dacă cineva le „repară”) ===");
{
  const x0 = [0.3, -0.7, 1.1];
  const omega = 1.25;

  /** Algorithm 3 din curs: baleiaj Gauss-Seidel întreg, apoi o relaxare pe tot vectorul. */
  const pseudocodulDinCurs = (A: number[][], b: number[], x: number[], w: number) => {
    const y = [...x];
    for (let i = 0; i < A.length; i++) {
      const linie = A[i] ?? [];
      const suma = linie.reduce((s, a, j) => (j === i ? s : s + a * (y[j] ?? 0)), 0);
      y[i] = ((b[i] ?? 0) - suma) / (linie[i] ?? 1);
    }
    return y.map((v, i) => w * v + (1 - w) * (x[i] ?? 0));
  };

  const dinPagina = sor.run({ A: A3, b: B3, x0, tol: 0, maxIteratii: 1, omega }).pasi[0]!.x;
  const dinPseudocod = pseudocodulDinCurs(A3, B3, x0, omega);
  verifica(
    "Algorithm 3 diferă de formula din §6 (deci pagina nu-l implementează)",
    !egale(dinPagina, dinPseudocod, 1e-9),
    `pagina ${dinPagina.map((v) => v.toFixed(6)).join("; ")} vs pseudocod ${dinPseudocod.map((v) => v.toFixed(6)).join("; ")}`,
  );
  verifica(
    "…dar pentru ω = 1 cele două coincid",
    egale(
      sor.run({ A: A3, b: B3, x0, tol: 0, maxIteratii: 1, omega: 1 }).pasi[0]!.x,
      pseudocodulDinCurs(A3, B3, x0, 1),
      1e-12,
    ),
  );

  const j4 = jacobi.run({ A: A4, b: B4, x0: [0, 0, 0], tol: 1e-8, maxIteratii: 200 });
  const g4 = gaussSeidel.run({ A: A4, b: B4, x0: [0, 0, 0], tol: 1e-8, maxIteratii: 200 });
  verifica(
    "„ori ambele converg, ori niciuna” e fals pe problema 4 din curs",
    j4.stare !== "convergent" && g4.stare === "convergent",
  );
  verifica(
    "„ρ(GS) < ρ(J) < 1” e fals pe problema 4: ρ(J) = 1",
    (j4.razaSpectrala ?? 0) >= 1 && (g4.razaSpectrala ?? 1) < 1,
  );
}

console.log("\n=== 8. Coerența pasului cu ce se afișează ===");
{
  const rulare = gaussSeidel.run({ A: A3, b: B3, x0: [0, 0, 0], tol: 1e-8, maxIteratii: 30 });
  const pasi = rulare.pasi;
  verifica(
    "eroarea fiecărui pas e chiar ‖x⁽ᵏ⁾ − x⁽ᵏ⁻¹⁾‖∞",
    pasi.every((pas) => Math.abs(pas.eroare - normaInfinit(scade(pas.x, pas.xAnterior))) < 1e-15),
  );
  verifica(
    "ultima componentă scrisă e chiar x-ul pasului",
    pasi.every((pas) =>
      pas.componente.every((c, i) => Math.abs((pas.x[i] ?? 0) - c.valoareNoua) < 1e-15),
    ),
  );
  verifica(
    "Gauss-Seidel citește proaspăt tot ce e la stânga diagonalei",
    pasi.every((pas) =>
      pas.componente.every((c) =>
        c.citite.every((provenienta, j) =>
          j < c.linie
            ? provenienta === "proaspata"
            : j === c.linie
              ? provenienta === "curenta"
              : provenienta === "veche",
        ),
      ),
    ),
  );
  const jac = jacobi.run({ A: A3, b: B3, x0: [0, 0, 0], tol: 1e-8, maxIteratii: 5 });
  verifica(
    "Jacobi nu citește niciodată proaspăt",
    jac.pasi.every((pas) => pas.componente.every((c) => !c.citite.includes("proaspata"))),
  );
  verifica(
    "Jacobi citește la fiecare linie exact vectorul de la începutul baleiajului",
    jac.pasi.every((pas) => pas.componente.every((c) => egale(c.valoriCitite, pas.xAnterior))),
  );
  verifica(
    "abaterea scade monoton pe problema 3 la Gauss-Seidel",
    pasi.every((pas, i) => i === 0 || pas.abatere <= (pasi[i - 1]?.abatere ?? Infinity) + 1e-12),
  );
}

console.log("");
if (picate === 0) console.log("✓ toate verificările metodelor iterative au trecut");
else console.log(`✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);
