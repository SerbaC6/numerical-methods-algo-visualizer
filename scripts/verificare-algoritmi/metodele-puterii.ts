/**
 * Verificarea paginii 8 — metodele puterii, iterarea Rayleigh, deflația.
 *
 * Referință: `cursuri_MN/valori_vectori_proprii_teorie_curs7.md`, §5–§9.
 *
 * Ținta nu vine din metodă. Matricea desenată,
 *
 * ```
 * A = [3 1 0; 1 3 1; 0 1 3]
 * ```
 *
 * are polinomul caracteristic `(3−λ)((3−λ)² − 2)`, deci valorile proprii
 * **exacte** `3 + √2`, `3`, `3 − √2`, cu vectorii proprii `(1, √2, 1)/2`,
 * `(1, 0, −1)/√2` și `(1, −√2, 1)/2`. Toate comparațiile de mai jos se fac față
 * de cifrele astea, scrise pe hârtie, nu față de rezultatul altei rulări.
 */
import {
  deflatieCompleta,
  deflatieWielandt,
  matriceaExemplu,
  run,
  runInversa,
  matriceaPlana,
  runRayleigh,
  VALORI_EXACTE,
  VALORI_PLANE,
} from "../../src/algorithms/metodele-puterii/putere.ts";
import {
  catRayleigh,
  inmultesteVector,
  norma2,
  produsScalar,
  scade,
} from "../../src/algorithms/metodele-puterii/matrice.ts";
import { normaSpectrala2x2, spectru2x2 } from "../../src/algorithms/metodele-puterii/spectru.ts";
import type { Matrice } from "../../src/algorithms/metodele-puterii/tipuri.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

const A = matriceaExemplu();
const [L1, L2, L3] = VALORI_EXACTE;
const V1 = [0.5, Math.SQRT2 / 2, 0.5];
const V3 = [0.5, -Math.SQRT2 / 2, 0.5];
const TOL = 1e-10;
const MAX = 400;

/** Cât de departe e `v` de direcția `w`, cu semnul ignorat (vectorii proprii au direcție unică). */
const abatereDirectie = (v: number[], w: number[]) =>
  Math.min(
    norma2(scade(v, w)),
    norma2(
      scade(
        v.map((x) => -x),
        w,
      ),
    ),
  );

console.log("=== 1. Matricea are chiar valorile proprii exacte ===");
{
  const rezidual = (lambda: number, v: number[]) =>
    norma2(
      scade(
        inmultesteVector(A, v),
        v.map((x) => lambda * x),
      ),
    );
  verifica(
    "A·v₁ = (3+√2)·v₁",
    rezidual(L1!, V1) < 1e-14,
    `‖r‖ = ${rezidual(L1!, V1).toExponential(2)}`,
  );
  verifica(
    "A·v₃ = (3−√2)·v₃",
    rezidual(L3!, V3) < 1e-14,
    `‖r‖ = ${rezidual(L3!, V3).toExponential(2)}`,
  );
  const urma = A.reduce((s, linie, i) => s + linie[i]!, 0);
  verifica("Σλᵢ = tr(A) = 9", Math.abs(L1! + L2! + L3! - urma) < 1e-13, `tr = ${urma}`);
}

console.log("=== 2. Metoda puterii directe (§6) → λ₁ = 3 + √2 ===");
{
  const r = run({ A, pornire: [1, 0, 0], tol: TOL, maxIteratii: MAX });
  verifica("convergentă", r.stare === "convergent", `${r.pasi.length} iterații`);
  verifica("λ → 3 + √2", Math.abs((r.lambda ?? 0) - L1!) < 1e-9, `λ = ${r.lambda}`);
  verifica("v → (1, √2, 1)/2", abatereDirectie(r.v ?? [], V1) < 1e-7);
  verifica(
    "λ⁽ᵏ⁾ din pas e chiar câtul Rayleigh al lui v⁽ᵏ⁾",
    r.pasi.every((p) => Math.abs(p.lambda - catRayleigh(A, p.v)) < 1e-14),
  );
  verifica(
    "‖v⁽ᵏ⁾‖ = 1 la fiecare pas",
    r.pasi.every((p) => Math.abs(norma2(p.v) - 1) < 1e-14),
  );
  // §6: rata de convergență e |λ₂|/|λ₁|. Se măsoară pe abaterea vectorului.
  const abateri = r.pasi.map((p) => abatereDirectie(p.v, V1));
  const rapoarte = abateri
    .slice(1, 20)
    .map((e, i) => e / abateri[i]!)
    .filter((x) => Number.isFinite(x) && x > 0);
  const mediu = rapoarte.reduce((s, x) => s + x, 0) / rapoarte.length;
  verifica(
    "rata măsurată ≈ |λ₂|/|λ₁| = 3/(3+√2)",
    Math.abs(mediu - L2! / L1!) < 0.05,
    `măsurat ${mediu.toFixed(4)}, teoretic ${(L2! / L1!).toFixed(4)}`,
  );
}

console.log("=== 3. Puterea inversă (§7) ===");
{
  const faraDeplasare = runInversa({ A, pornire: [1, 1, 1], tol: TOL, maxIteratii: MAX });
  verifica(
    "q = 0 → cea mai mică valoare proprie, 3 − √2",
    Math.abs((faraDeplasare.lambda ?? 0) - L3!) < 1e-9,
    `λ = ${faraDeplasare.lambda}`,
  );
  verifica("v → (1, −√2, 1)/2", abatereDirectie(faraDeplasare.v ?? [], V3) < 1e-7);

  const langaMijloc = runInversa({
    A,
    pornire: [1, 1, 1],
    tol: TOL,
    maxIteratii: MAX,
    deplasare: 2.9,
  });
  verifica(
    "q = 2,9 → valoarea proprie cea mai apropiată de q, adică 3",
    Math.abs((langaMijloc.lambda ?? 0) - L2!) < 1e-9,
    `λ = ${langaMijloc.lambda}`,
  );

  const peValoare = runInversa({ A, pornire: [1, 1, 1], tol: TOL, maxIteratii: MAX, deplasare: 3 });
  verifica(
    "q exact pe o valoare proprie → se oprește cu motiv, nu cu NaN",
    peValoare.stare === "esuat" && (peValoare.motiv ?? "").length > 0,
  );
}

console.log("=== 4. Iterarea Rayleigh (§8) — mai rapidă decât puterea directă ===");
{
  const r = runRayleigh({ A, pornire: [1, 1, 1], tol: TOL, maxIteratii: MAX });
  const directa = run({ A, pornire: [1, 1, 1], tol: TOL, maxIteratii: MAX });
  verifica("convergentă", r.stare === "convergent", `${r.pasi.length} iterații`);
  verifica("λ → 3 + √2", Math.abs((r.lambda ?? 0) - L1!) < 1e-12, `λ = ${r.lambda}`);
  verifica(
    "mult mai puține iterații decât metoda directă",
    r.pasi.length * 5 < directa.pasi.length,
    `${r.pasi.length} față de ${directa.pasi.length}`,
  );
  verifica(
    "deplasarea fiecărui pas e câtul Rayleigh al vectorului dinainte",
    r.pasi.every((p) => Math.abs((p.deplasare ?? 0) - catRayleigh(A, p.vAnterior)) < 1e-14),
  );
}

console.log("=== 4b. Rayleigh: sistemul singular, cele două înțelesuri opuse ===");
{
  // (1, 0, 0) are câtul Rayleigh exact 3 — o valoare proprie a lui A —, dar nu e
  // vectorul propriu al lui 3, care e (1, 0, −1)/√2. Iterația nu poate face nici
  // primul pas, iar pagina trebuie să spună asta, nu să anunțe un rezultat.
  const blocat = runRayleigh({ A, pornire: [1, 0, 0], tol: TOL, maxIteratii: MAX });
  verifica(
    "pornit din (1, 0, 0): se oprește cu motiv, fără să declare convergență",
    blocat.stare === "esuat" && blocat.pasi.length === 0 && (blocat.motiv ?? "").length > 0,
    `stare = ${blocat.stare}`,
  );

  // Pornit chiar din vectorul propriu, sistemul e tot singular — dar acolo
  // oprirea chiar e capătul metodei.
  const dejaPropriu = runRayleigh({ A, pornire: V1, tol: TOL, maxIteratii: MAX });
  verifica(
    "pornit chiar din v₁: oprirea e convergență, cu λ = 3 + √2",
    dejaPropriu.stare === "convergent" && Math.abs((dejaPropriu.lambda ?? 0) - L1!) < 1e-12,
    `stare = ${dejaPropriu.stare}, λ = ${dejaPropriu.lambda}`,
  );

  // Pornirea implicită a interfeței trebuie să funcționeze la toate trei taburile.
  const implicita = [1, 0.5, 0];
  for (const [nume, rulare] of [
    ["metoda directă", run({ A, pornire: implicita, tol: TOL, maxIteratii: MAX })],
    ["puterea inversă", runInversa({ A, pornire: implicita, tol: TOL, maxIteratii: MAX })],
    ["iterarea Rayleigh", runRayleigh({ A, pornire: implicita, tol: TOL, maxIteratii: MAX })],
  ] as const) {
    verifica(
      `pornirea implicită a interfeței merge la ${nume}`,
      rulare.stare === "convergent" && rulare.pasi.length > 0,
      `${rulare.pasi.length} iterații, λ = ${rulare.lambda}`,
    );
  }
}

console.log("=== 5. Deflația Wielandt (§9) ===");
{
  const d = deflatieWielandt(A, L1!, V1);
  if (d === null) {
    verifica("deflația se poate construi", false);
  } else {
    verifica("xᵀ·v⁽¹⁾ = 1", Math.abs(produsScalar(d.x, V1) - 1) < 1e-14);
    verifica(
      `linia ${d.indice + 1} din B e nulă`,
      (d.B[d.indice] ?? []).every((x) => Math.abs(x) < 1e-14),
    );
    verifica(
      "B are ordinul lui A, redusa are un ordin mai puțin",
      d.redusa.length === A.length - 1,
    );
    // σ(B') = {λ₂, λ₃}: se verifică prin urmă și determinant, calculate direct
    // pe matricea 2×2, fără să se cheme vreo metodă iterativă.
    const B2 = d.redusa as Matrice;
    const urma = B2[0]![0]! + B2[1]![1]!;
    const det = B2[0]![0]! * B2[1]![1]! - B2[0]![1]! * B2[1]![0]!;
    verifica("tr(B′) = λ₂ + λ₃", Math.abs(urma - (L2! + L3!)) < 1e-12, `tr = ${urma}`);
    verifica("det(B′) = λ₂·λ₃", Math.abs(det - L2! * L3!) < 1e-12, `det = ${det}`);
  }

  const { etape, motiv } = deflatieCompleta(A, 1e-12, 2000);
  verifica("algoritmul merge până la matricea 1×1", etape.length === 3 && motiv === undefined);
  const gasite = etape.map((e) => e.lambda).sort((a, b) => b - a);
  verifica(
    "cele trei valori proprii, în ordinea descrescătoare a modulului",
    gasite.every((x, i) => Math.abs(x - VALORI_EXACTE[i]!) < 1e-6),
    gasite.map((x) => x.toFixed(8)).join(", "),
  );
}

console.log("=== 6. Matricea plană din clip: λ = 4 și λ = 2, pe diagonale ===");
{
  const P = matriceaPlana();
  const d1 = [Math.SQRT1_2, Math.SQRT1_2];
  const d2 = [Math.SQRT1_2, -Math.SQRT1_2];
  const rezidual = (lambda: number, v: number[]) =>
    norma2(
      scade(
        inmultesteVector(P, v),
        v.map((x) => lambda * x),
      ),
    );
  verifica("P·(1,1)/√2 = 4·(1,1)/√2", rezidual(VALORI_PLANE[0], d1) < 1e-15);
  verifica("P·(1,−1)/√2 = 2·(1,−1)/√2", rezidual(VALORI_PLANE[1], d2) < 1e-15);

  const directa = run({ A: P, pornire: [1, 0], tol: 1e-12, maxIteratii: MAX });
  verifica(
    "metoda directă → λ = 4",
    Math.abs((directa.lambda ?? 0) - 4) < 1e-10,
    `λ = ${directa.lambda}`,
  );
  verifica("v → prima diagonală", abatereDirectie(directa.v ?? [], d1) < 1e-6);

  const inversa = runInversa({ A: P, pornire: [1, 0], tol: 1e-12, maxIteratii: MAX });
  verifica(
    "puterea inversă fără deplasare → λ = 2",
    Math.abs((inversa.lambda ?? 0) - 2) < 1e-10,
    `λ = ${inversa.lambda}`,
  );
  verifica("v → a doua diagonală", abatereDirectie(inversa.v ?? [], d2) < 1e-6);

  const rayleigh = runRayleigh({ A: P, pornire: [1, 0.15], tol: 1e-12, maxIteratii: MAX });
  verifica(
    "iterarea Rayleigh, pornită dintr-o direcție oarecare → λ = 4, în câțiva pași",
    Math.abs((rayleigh.lambda ?? 0) - 4) < 1e-10 && rayleigh.pasi.length <= 5,
    `λ = ${rayleigh.lambda}, în ${rayleigh.pasi.length} iterații`,
  );

  // Caz-limită, ținut ca test fiindcă e ușor de nimerit din greșeală: pornit din
  // (1, 0), câtul Rayleigh e 3 — exact la mijloc între 4 și 2 —, iar iterația
  // sare între (1, 0) și (0, 1) la nesfârșit, fără să se apropie de vreo valoare
  // proprie. Simetria vectorului de pornire e cea care blochează metoda.
  const blocat = runRayleigh({ A: P, pornire: [1, 0], tol: 1e-12, maxIteratii: 50 });
  verifica(
    "pornit din (1, 0), Rayleigh se blochează la ρ = 3 și rămâne „neterminat”",
    blocat.stare === "neterminat" && Math.abs((blocat.lambda ?? 0) - 3) < 1e-12,
    `λ = ${blocat.lambda}`,
  );
}

console.log("=== 7. Spectrul exact 2×2, ținta desenului din interfață ===");
{
  // Referința nu vine din spectru2x2: reziduul ‖A·v − λ·v‖ se calculează pe
  // matricea dată, iar tr și det se citesc direct din ea.
  const cazuri: { nume: string; A: Matrice }[] = [
    { nume: "[[3,1],[1,3]] — simetrică, λ = 4 și 2", A: matriceaPlana() },
    {
      nume: "[[2,0],[0,-5]] — diagonală, dominanta e negativă",
      A: [
        [2, 0],
        [0, -5],
      ],
    },
    {
      nume: "[[4,1],[0,4]] — bloc Jordan, o singură direcție",
      A: [
        [4, 1],
        [0, 4],
      ],
    },
    {
      nume: "[[1,2],[3,4]] — nesimetrică",
      A: [
        [1, 2],
        [3, 4],
      ],
    },
  ];

  for (const caz of cazuri) {
    const s = spectru2x2(caz.A);
    if (!s.reale) {
      verifica(`${caz.nume}: valori reale`, false);
      continue;
    }
    const urma = caz.A[0]![0]! + caz.A[1]![1]!;
    const det = caz.A[0]![0]! * caz.A[1]![1]! - caz.A[0]![1]! * caz.A[1]![0]!;
    const rezidual = s.valori.map((lambda, i) =>
      norma2(
        scade(
          inmultesteVector(caz.A, s.directii[i]!),
          s.directii[i]!.map((x) => lambda * x),
        ),
      ),
    );
    verifica(
      caz.nume,
      Math.abs(s.valori[0] + s.valori[1] - urma) < 1e-12 &&
        Math.abs(s.valori[0] * s.valori[1] - det) < 1e-12 &&
        Math.abs(s.valori[0]) >= Math.abs(s.valori[1]) &&
        rezidual.every((r) => r < 1e-12),
      `λ = ${s.valori.map((x) => x.toFixed(6)).join(", ")}`,
    );
  }

  // Rotația de 90°: valori proprii complex conjugate, deci nicio direcție reală.
  const rotatie = spectru2x2([
    [0, -1],
    [1, 0],
  ]);
  verifica(
    "[[0,−1],[1,0]] — rotație: se raportează complex, nu se inventează o direcție",
    !rotatie.reale &&
      Math.abs(rotatie.parteReala) < 1e-15 &&
      Math.abs(rotatie.parteImaginara - 1) < 1e-15,
  );

  // Direcția dominantă e chiar cea către care converge metoda puterii.
  const s = spectru2x2(matriceaPlana());
  const rulare = run({ A: matriceaPlana(), pornire: [1, 0.3], tol: 1e-12, maxIteratii: 200 });
  verifica(
    "direcția desenată ca țintă e chiar limita metodei puterii",
    s.reale && abatereDirectie(rulare.v ?? [], s.directii[0]) < 1e-6,
  );
}

console.log("=== 8. Norma spectrală 2×2, scara desenului ===");
{
  // Referința e forța brută: se mătură cercul unitate și se ia cel mai lung
  // `A·v` găsit. Norma trebuie să fie chiar acel maxim — nici mai mică (ar tăia
  // săgeata din cadru), nici mult mai mare (desenul ar rămâne pustiu).
  const cazuri: Matrice[] = [
    matriceaPlana(),
    [
      [1, 2],
      [3, 4],
    ],
    [
      [0, -1],
      [1, 0],
    ],
    [
      [5, 0],
      [0, 0.2],
    ],
    [
      [4, 1],
      [0, 4],
    ],
  ];

  for (const M of cazuri) {
    const sigma = normaSpectrala2x2(M);
    let maxim = 0;
    for (let k = 0; k < 20000; k++) {
      const t = (2 * Math.PI * k) / 20000;
      maxim = Math.max(maxim, norma2(inmultesteVector(M, [Math.cos(t), Math.sin(t)])));
    }
    verifica(
      `‖A‖₂ pentru [[${M[0]![0]},${M[0]![1]}],[${M[1]![0]},${M[1]![1]}]]`,
      Math.abs(sigma - maxim) < 1e-6 && maxim <= sigma + 1e-12,
      `σ = ${sigma.toFixed(8)}, măturat = ${maxim.toFixed(8)}`,
    );
  }
}

console.log(picate === 0 ? "\nTOATE VERIFICĂRILE TREC" : `\n${picate} VERIFICĂRI PICATE`);
if (picate > 0) process.exitCode = 1;
