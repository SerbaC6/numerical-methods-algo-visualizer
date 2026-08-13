/**
 * Verificarea metodelor de gradient — rulează modulele reale din `src/`.
 *
 * Referințe: `cursuri_MN/ecuatii_neliniare_MN_curs6.md`, §4 (Algorithm 4 și 5) și
 * `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §8.6.
 */
import * as descendent from "../../src/algorithms/metode-de-gradient/descendent.ts";
import * as conjugat from "../../src/algorithms/metode-de-gradient/conjugat.ts";
import { f, reziduu } from "../../src/algorithms/metode-de-gradient/patratica.ts";
import type { PasGradient } from "../../src/algorithms/metode-de-gradient/tipuri.ts";
import {
  aduna,
  inmulteste,
  norma,
  produsScalar,
  scade,
  scaleaza,
  type Mat2,
  type Vec2,
} from "../../src/lib/curbe-de-nivel.ts";
import { latexNumar } from "../../src/lib/numere.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

/** Sistemul de referință al paginii: A simetrică pozitiv definită, x* = (1/11, 7/11). */
const A: Mat2 = [4, 1, 3];
const b: Vec2 = [1, 2];
const X_STEA: Vec2 = [1 / 11, 7 / 11];
const PORNIRE: Vec2 = [0, 0];

const cos = (u: Vec2, v: Vec2) => produsScalar(u, v) / (norma(u) * norma(v));

console.log("=== 1. Coborârea converge la x* = (1/11, 7/11) ===");
const cob = descendent.run({ A, b, x0: PORNIRE, tol: 1e-8, maxIteratii: 100 });
{
  const ultim = cob.pasi.at(-1)!;
  const abatere = norma(scade(ultim.x, X_STEA));
  verifica(
    `stare ${cob.stare}, ${cob.pasi.length} pași`,
    cob.stare === "convergent" && abatere < 1e-8,
    `abatere față de x* ${abatere.toExponential(2)}, ‖r‖ ${ultim.eroare.toExponential(2)}`,
  );
  verifica(
    "soluția raportată e chiar x*",
    cob.solutie !== null && norma(scade(cob.solutie, X_STEA)) < 1e-15,
  );
}

console.log("\n=== 2. Reziduurile consecutive sunt ortogonale (zigzagul) ===");
{
  let maxim = 0;
  for (let i = 0; i + 1 < cob.pasi.length; i++) {
    maxim = Math.max(maxim, Math.abs(cos(cob.pasi[i]!.r, cob.pasi[i + 1]!.r)));
  }
  verifica(
    "|cos(r⁽ᵏ⁾, r⁽ᵏ⁺¹⁾)| < 1e-10 la fiecare k",
    maxim < 1e-10,
    `maxim ${maxim.toExponential(2)}`,
  );

  const cosuri = cob.pasi.map((p) => p.cosDirectii).filter((c) => c !== undefined);
  const maximRaportat = Math.max(...cosuri.map(Math.abs));
  verifica(
    "și `cosDirectii` raportat de metodă spune același lucru",
    cosuri.length === cob.pasi.length - 1 && maximRaportat < 1e-10,
    `${cosuri.length} valori, maxim ${maximRaportat.toExponential(2)}`,
  );
  verifica(
    "prima iterație nu raportează cos (n-are direcție anterioară)",
    cob.pasi[0]!.cosDirectii === undefined,
  );
}

console.log("\n=== 3. Reziduul recurent coincide cu b − A·x⁽ᵏ⁾ (prinde greșeala de semn) ===");
{
  let maxim = 0;
  for (const pas of cob.pasi) {
    maxim = Math.max(maxim, norma(scade(pas.r, reziduu(A, b, pas.x))));
  }
  verifica("abatere sub 1e-12", maxim < 1e-12, `maxim ${maxim.toExponential(2)}`);
}

console.log("\n=== 4. f scade strict la fiecare pas ===");
{
  let precedent = f(A, b, PORNIRE);
  let strict = true;
  for (const pas of cob.pasi) {
    if (!(pas.f < precedent)) strict = false;
    precedent = pas.f;
  }
  verifica(
    "f(x⁽ᵏ⁾) < f(x⁽ᵏ⁻¹⁾) peste tot",
    strict,
    `de la ${f(A, b, PORNIRE).toFixed(6)} la ${cob.pasi.at(-1)!.f.toFixed(6)}`,
  );
}

console.log("\n=== 5. α e chiar minimul pe direcție: g′(α) = 0, derivata numerică ===");
{
  let maxim = 0;
  for (const pas of cob.pasi) {
    const g = (a: number) => f(A, b, aduna(pas.xAnterior, scaleaza(pas.directie, a)));
    const h = 1e-6 * Math.max(1, Math.abs(pas.pas));
    maxim = Math.max(maxim, Math.abs((g(pas.pas + h) - g(pas.pas - h)) / (2 * h)));
  }
  verifica("|g′(α)| < 1e-8 la fiecare pas", maxim < 1e-8, `maxim ${maxim.toExponential(2)}`);
}

console.log("\n=== 6. Gradientul conjugat: n = 2 pași pe sistemul din curs ===");
const cg = conjugat.run({ A, b, x0: PORNIRE, tol: 1e-8, maxIteratii: 50 });
{
  const ultim = cg.pasi.at(-1)!;
  verifica(
    `stare ${cg.stare}, exact 2 pași`,
    cg.stare === "convergent" && cg.pasi.length === 2,
    `${cg.pasi.length} pași`,
  );
  verifica(
    "reziduu final sub 1e-14",
    ultim.eroare < 1e-14,
    `‖r⁽²⁾‖ ${ultim.eroare.toExponential(2)}, abatere ${norma(scade(ultim.x, X_STEA)).toExponential(2)}`,
  );
  verifica(
    "⟨v⁽¹⁾, A·v⁽²⟩ sub 1e-12 — A-ortogonalitatea",
    Math.abs(ultim.aOrtogonalitate ?? Number.NaN) < 1e-12,
    `${ultim.aOrtogonalitate?.toExponential(2)}`,
  );
  verifica("primul pas nu raportează A-ortogonalitate", cg.pasi[0]!.aOrtogonalitate === undefined);
}

console.log("\n=== 7. Conjugatul nu depășește 2 pași pe 200 de sisteme SPD aleatoare ===");
{
  // Generator determinist (mulberry32): aceleași 200 de sisteme la fiecare rulare.
  let stare = 20240607 >>> 0;
  const aleator = () => {
    stare = (stare + 0x6d2b79f5) >>> 0;
    let t = stare;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const intre = (jos: number, sus: number) => jos + (sus - jos) * aleator();

  let maximPasi = 0;
  let toateConverg = true;
  for (let i = 0; i < 200; i++) {
    // A = QΛQᵀ cu λ > 0 — pozitiv definită prin construcție, bine condiționată.
    const teta = intre(0, Math.PI);
    const l1 = intre(0.5, 5);
    const l2 = intre(0.5, 5);
    const c = Math.cos(teta);
    const s = Math.sin(teta);
    const M: Mat2 = [l1 * c * c + l2 * s * s, (l1 - l2) * c * s, l1 * s * s + l2 * c * c];
    const t: Vec2 = [intre(-5, 5), intre(-5, 5)];
    const start: Vec2 = [intre(-5, 5), intre(-5, 5)];
    const r = conjugat.run({ A: M, b: t, x0: start, tol: 1e-9, maxIteratii: 20 });
    if (r.stare !== "convergent") toateConverg = false;
    maximPasi = Math.max(maximPasi, r.pasi.length);
  }
  verifica(
    "cel mult 2 pași, mereu convergent",
    toateConverg && maximPasi <= 2,
    `maxim ${maximPasi} pași`,
  );
}

console.log("\n=== 8. Refuzul matricelor care nu sunt pozitiv definite ===");
for (const M of [
  [1, 2, 1],
  [0, 1, 0],
  [-1, 0, -1],
] as Mat2[]) {
  for (const [nume, metoda] of [
    ["coborâre", descendent],
    ["conjugat", conjugat],
  ] as const) {
    const r = metoda.run({ A: M, b, x0: PORNIRE, tol: 1e-8, maxIteratii: 20 });
    verifica(
      `[${M.join(", ")}] ${nume} → eșec explicat`,
      r.stare === "esuat" && (r.motiv ?? "").includes("pozitiv definit") && r.pasi.length === 0,
      r.motiv?.slice(0, 60),
    );
  }
}

console.log("\n=== 9. Pornire chiar din x*: convergent, zero pași, niciun NaN ===");
for (const [nume, metoda] of [
  ["coborâre", descendent],
  ["conjugat", conjugat],
] as const) {
  const r = metoda.run({ A, b, x0: X_STEA, tol: 1e-8, maxIteratii: 20 });
  const curat =
    r.pasi.length === 0 &&
    r.solutie !== null &&
    Number.isFinite(r.solutie[0]) &&
    Number.isFinite(r.solutie[1]) &&
    Number.isFinite(r.conditionare ?? Number.NaN) &&
    !/NaN|nedefinit/.test(r.motiv ?? "");
  verifica(
    `${nume}: convergent fără pași`,
    r.stare === "convergent" && curat,
    r.motiv?.slice(0, 60),
  );
}

console.log("\n=== 10. Fiecare id din `evidentiaza` apare ca \\htmlId în latexPas ===");
{
  const toti: PasGradient[] = [...cob.pasi, ...cg.pasi];
  const lipsa = toti.flatMap((p) =>
    p.evidentiaza.filter((id) => !p.latexPas.includes(`\\htmlId{${id}}`)),
  );
  verifica(
    `${toti.length} pași verificați`,
    lipsa.length === 0 && toti.every((p) => p.evidentiaza.length > 0),
    lipsa.length ? `lipsesc: ${[...new Set(lipsa)].join(", ")}` : "",
  );
}

console.log("\n=== 11. Lungimea pasului apare, formatată, chiar în latexPas ===");
{
  const toti: PasGradient[] = [...cob.pasi, ...cg.pasi];
  const rele = toti.filter((p) => !p.latexPas.includes(latexNumar(p.pas)));
  verifica(
    `${toti.length} pași verificați`,
    rele.length === 0,
    rele.length ? `primul rău: ${latexNumar(rele[0]!.pas)}` : "",
  );
}

console.log("\n=== Verificări suplimentare de coerență ===");
{
  // x⁽ᵏ⁾ = x⁽ᵏ⁻¹⁾ + pas·direcție, la amândouă metodele — legătura dintre cifre și săgeata din desen.
  let maxim = 0;
  for (const p of [...cob.pasi, ...cg.pasi]) {
    maxim = Math.max(maxim, norma(scade(p.x, aduna(p.xAnterior, scaleaza(p.directie, p.pas)))));
  }
  verifica("x = xAnterior + pas·direcție", maxim < 1e-14, `maxim ${maxim.toExponential(2)}`);

  // Conjugatul: reziduul recurent coincide și el cu b − A·x⁽ᵏ⁾.
  let maximCg = 0;
  for (const p of cg.pasi) maximCg = Math.max(maximCg, norma(scade(p.r, reziduu(A, b, p.x))));
  verifica(
    "conjugat: reziduu recurent = b − A·x",
    maximCg < 1e-14,
    `maxim ${maximCg.toExponential(2)}`,
  );

  // κ pentru A = [[4,1],[1,3]]: λ = (7 ± √5)/2, deci κ = (7+√5)/(7−√5).
  const kappaAsteptat = (7 + Math.sqrt(5)) / (7 - Math.sqrt(5));
  verifica(
    "numărul de condiționare raportat",
    Math.abs((cob.conditionare ?? Number.NaN) - kappaAsteptat) < 1e-12,
    `κ = ${cob.conditionare?.toFixed(6)}`,
  );

  // ⟨v⁽ᵏ⁾, A·v⁽ᵏ⁾⟩ > 0 și t_k finit peste tot.
  verifica(
    "toate cifrele pașilor sunt finite",
    [...cob.pasi, ...cg.pasi].every(
      (p) =>
        Number.isFinite(p.pas) &&
        Number.isFinite(p.f) &&
        Number.isFinite(p.eroare) &&
        Number.isFinite(p.abatere) &&
        Number.isFinite(p.x[0]) &&
        Number.isFinite(p.x[1]),
    ),
  );

  // Conjugatul ajunge mai repede decât coborârea — concluzia din curs 5, §8.3.
  verifica(
    "conjugatul termină mai repede decât coborârea",
    cg.pasi.length < cob.pasi.length,
    `${cg.pasi.length} față de ${cob.pasi.length} pași`,
  );

  // A·v⁽ᵏ⁾ nu se recalculează greșit: verificăm t_k = ⟨r⁽ᵏ⁻¹⁾, r⁽ᵏ⁻¹⁾⟩/⟨v⁽ᵏ⁾, A·v⁽ᵏ⁾⟩.
  let maximT = 0;
  let rPrec = reziduu(A, b, PORNIRE);
  for (const p of cg.pasi) {
    const asteptat =
      produsScalar(rPrec, rPrec) / produsScalar(p.directie, inmulteste(A, p.directie));
    maximT = Math.max(maximT, Math.abs(p.pas - asteptat));
    rPrec = p.r;
  }
  verifica(
    "t_k respectă formula din curs 5, §8.6",
    maximT < 1e-14,
    `maxim ${maximT.toExponential(2)}`,
  );
}

console.log(
  picate === 0 ? "\n✓ toate verificările au trecut" : `\n✗ ${picate} verificări au picat`,
);
process.exit(picate === 0 ? 0 : 1);
