/**
 * Verificarea eliminării gaussiene — rulează modulele reale din `src/`.
 *
 * Referință: `cursuri_MN/sisteme_liniare_metode_directe_MN_curs4.md`, §4.3
 * (exemplul rezolvat), §8.1 (substituția înapoi), §3.4 (determinantul), §5
 * (pivotarea).
 *
 * Cifrele-țintă nu vin din rularea noastră: etapele intermediare sunt chiar cele
 * **tipărite în curs**, iar soluția și determinantul se recalculează aici pe altă
 * cale (reziduul pe sistemul original, respectiv dezvoltarea determinantului
 * după prima linie).
 */
import {
  determinantDinU,
  eliminareGaussiana,
  liniaPivotuluiPartial,
  liniaPivotuluiScalat,
  substitutieInapoi,
  type Matrice,
} from "../../src/algorithms/eliminare-gaussiana/eliminare.ts";
import {
  DETERMINANT_DIN_CURS,
  EXTINSA_DIN_CURS,
  PASI_ELIMINARE,
  SOLUTIA_DIN_CURS,
  U_DIN_CURS,
} from "../../src/algorithms/eliminare-gaussiana/exemplu.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

const egale = (a: readonly number[], b: readonly number[]) =>
  a.length === b.length && a.every((v, i) => Math.abs(v - b[i]!) < 1e-12);
const egaleM = (a: Matrice, b: Matrice) =>
  a.length === b.length && a.every((linie, i) => egale(linie, b[i]!));

console.log("=== 1. Cele trei operații, cu rapoartele din curs ===");
{
  verifica("trei pași de eliminare", PASI_ELIMINARE.length === 3, `${PASI_ELIMINARE.length}`);
  const [p1, p2, p3] = PASI_ELIMINARE;
  verifica("µ₂₁ = 1", p1?.mu === 1, `${p1?.mu}`);
  verifica("µ₃₁ = 3", p2?.mu === 3, `${p2?.mu}`);
  verifica("µ₃₂ = −1", p3?.mu === -1, `${p3?.mu}`);
  verifica("linia 2 devine (0, −2, −2, −8)", egale(p1?.dupa ?? [], [0, -2, -2, -8]), `${p1?.dupa}`);
  verifica("linia 3 devine (0, 2, 5, 8)", egale(p2?.dupa ?? [], [0, 2, 5, 8]), `${p2?.dupa}`);
  verifica("linia 3 devine (0, 0, 3, 0)", egale(p3?.dupa ?? [], [0, 0, 3, 0]), `${p3?.dupa}`);
  verifica(
    "pivotul pasului 3 este −2, de pe diagonală",
    p3?.pivot === -2 && p3.coloana === 1,
    `pivot ${p3?.pivot}, coloana ${(p3?.coloana ?? 0) + 1}`,
  );
}

console.log("");
console.log("=== 2. Forma triunghiulară, exact cea tipărită în curs ===");
{
  const tinta: Matrice = [
    [1, 3, 1, 9],
    [0, -2, -2, -8],
    [0, 0, 3, 0],
  ];
  verifica(
    "U = [1 3 1 9; 0 −2 −2 −8; 0 0 3 0]",
    egaleM(U_DIN_CURS, tinta),
    JSON.stringify(U_DIN_CURS),
  );
  verifica(
    "sub diagonală numai zerouri",
    U_DIN_CURS.every((linie, i) => linie.slice(0, i).every((v) => v === 0)),
  );
  verifica(
    "matricea de pornire nu a fost modificată",
    egaleM(EXTINSA_DIN_CURS, [
      [1, 3, 1, 9],
      [1, 1, -1, 1],
      [3, 11, 8, 35],
    ]),
  );
}

console.log("");
console.log("=== 3. Soluția — verificată pe sistemul ORIGINAL, nu pe cel triunghiular ===");
{
  verifica("x = (−3, 4, 0)", egale(SOLUTIA_DIN_CURS, [-3, 4, 0]), `${SOLUTIA_DIN_CURS}`);
  const reziduu = EXTINSA_DIN_CURS.map(
    (linie) => linie.slice(0, 3).reduce((s, a, j) => s + a * SOLUTIA_DIN_CURS[j]!, 0) - linie[3]!,
  );
  verifica(
    "reziduu nul pe A·x = b",
    reziduu.every((r) => Math.abs(r) < 1e-12),
    `${reziduu}`,
  );
}

console.log("");
console.log("=== 4. Determinantul ===");
{
  const [a, b, c] = EXTINSA_DIN_CURS.map((linie) => linie.slice(0, 3));
  const det =
    a![0]! * (b![1]! * c![2]! - b![2]! * c![1]!) -
    a![1]! * (b![0]! * c![2]! - b![2]! * c![0]!) +
    a![2]! * (b![0]! * c![1]! - b![1]! * c![0]!);
  verifica("det U = −6", DETERMINANT_DIN_CURS === -6, `${DETERMINANT_DIN_CURS}`);
  verifica(
    "det A = det U (nicio permutare, det T = 1)",
    det === DETERMINANT_DIN_CURS,
    `det A = ${det}`,
  );
}

console.log("");
console.log("=== 5. Pivotarea: pivot nul, parțială, scalată ===");
{
  // Pivot nul: eliminarea simplă trebuie să se oprească, nu să dea Infinity.
  const cuPivotNul: Matrice = [
    [0, 2, 1],
    [1, 3, 2],
  ];
  let aAruncat = false;
  try {
    eliminareGaussiana(cuPivotNul);
  } catch {
    aAruncat = true;
  }
  verifica("pivot nul → eroare, nu împărțire tăcută la zero", aAruncat);
  verifica(
    "pivotarea parțială alege linia cu 1, nu cea cu 0",
    liniaPivotuluiPartial(cuPivotNul, 0) === 1,
  );

  // §5.1: sistemul care motivează pivotarea. Cursul spune că pivotarea parțială
  // **nu** permută aici; se verifică faptul că permută. Vezi `docs/erata-cursuri.md`.
  const motivul: Matrice = [
    [0.001, 1, 1],
    [1, 1, 2],
  ];
  verifica(
    "§5.1: pivotarea parțială PERMUTĂ (|1| > |0,001|) — cursul afirmă contrariul",
    liniaPivotuluiPartial(motivul, 0) === 1,
  );

  // §5.3: exemplul pentru pivotul scalat. Parțiala nu permută (ambele sunt 1),
  // scalata permută, fiindcă 1 e mic **relativ la** 10000.
  const scalat: Matrice = [
    [1, 10000, 10000],
    [1, 0.0001, 1],
  ];
  verifica("§5.3: pivotarea parțială nu permută", liniaPivotuluiPartial(scalat, 0) === 0);
  verifica("§5.3: pivotarea cu pivot scalat permută", liniaPivotuluiScalat(scalat, 0, 2) === 1);
}

console.log("");
console.log("=== 6. Substituția înapoi, pe un sistem independent ===");
{
  const U: Matrice = [
    [2, 1, -1, 8],
    [0, 0.5, 0.5, 1],
    [0, 0, -1, 1],
  ];
  const { x } = substitutieInapoi(U);
  verifica("x = (2, 3, −1)", egale(x, [2, 3, -1]), `${x}`);
  const reziduu = U.map(
    (linie) => linie.slice(0, 3).reduce((s, a, j) => s + a * x[j]!, 0) - linie[3]!,
  );
  verifica(
    "reziduu nul",
    reziduu.every((r) => Math.abs(r) < 1e-12),
    `${reziduu}`,
  );
  verifica("det = 2 · 0,5 · (−1) = −1", determinantDinU(U) === -1, `${determinantDinU(U)}`);
}

console.log("");
console.log(picate === 0 ? "TOATE TREC" : `PICATE: ${picate}`);
if (picate > 0) process.exitCode = 1;
