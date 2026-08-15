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
  substitutieInapoi,
  type Matrice,
} from "../../src/algorithms/eliminare-gaussiana/eliminare.ts";
import {
  alegePartial,
  alegeScalat,
  alegeTotal,
  ruleazaPivotare,
  type Strategie,
} from "../../src/algorithms/eliminare-gaussiana/pivotare.ts";
import { EXEMPLE_PIVOTARE } from "../../src/algorithms/eliminare-gaussiana/exemple.ts";
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
    alegePartial(cuPivotNul, 0, 0).linie === 1,
  );

  // §5.1: sistemul care motivează pivotarea. Cursul spune că pivotarea parțială
  // **nu** permută aici; se verifică faptul că permută. Vezi `docs/erata-cursuri.md`.
  const motivul = EXEMPLE_PIVOTARE[0]!.matrice;
  verifica(
    "§5.1: pivotarea parțială PERMUTĂ (|1| > |0,001|) — cursul afirmă contrariul",
    alegePartial(motivul, 0, 0).linie === 1,
  );

  // §5.3: exemplul pentru pivotul scalat. Parțiala nu permută (ambele sunt 1),
  // scalata permută, fiindcă 1 e mic **relativ la** 10000.
  const scalat = EXEMPLE_PIVOTARE[1]!.matrice;
  verifica("§5.3: pivotarea parțială nu permută", alegePartial(scalat, 0, 0).linie === 0);
  verifica("§5.3: pivotarea cu pivot scalat permută", alegeScalat(scalat, 0, 2, 0).linie === 1);
  verifica(
    "§5.3: rapoartele comparate sunt 1/10 000 și 1/1",
    egale(alegeScalat(scalat, 0, 2, 0).scoruri as number[], [1 / 10000, 1]),
    `${alegeScalat(scalat, 0, 2, 0).scoruri}`,
  );
}

console.log("");
console.log("=== 6. Pivotarea totală — lanțul de aranjare tipărit în curs (§5.2 și §5.4) ===");
{
  // `[1 1 1; 1 1 2; 2 2 3]` → linia 3 sus → `[2 2 3; 1 1 2; 1 1 1]`
  //                        → coloana 3 în față → `[3 2 2; 2 1 1; 1 1 1]`
  const aranjare = EXEMPLE_PIVOTARE[3]!.matrice;

  const partiala = ruleazaPivotare({ matrice: aranjare, coeficienti: 3, strategie: "partiala" });
  const dupaLinii = partiala.pasi.find((pas) => pas.tip === "permutare")?.matrice;
  verifica(
    "GPP: [1 1 1; 1 1 2; 2 2 3] → [2 2 3; 1 1 2; 1 1 1]",
    !!dupaLinii &&
      egaleM(dupaLinii, [
        [2, 2, 3],
        [1, 1, 2],
        [1, 1, 1],
      ]),
    JSON.stringify(dupaLinii),
  );

  const alegereTotala = alegeTotal(aranjare, 0, 3, 0);
  verifica(
    "GPT: maximul submatricei e 3, la (3, 3)",
    alegereTotala.linie === 2 && alegereTotala.coloana === 2,
    `(${alegereTotala.linie + 1}, ${alegereTotala.coloana + 1})`,
  );

  const totala = ruleazaPivotare({ matrice: aranjare, coeficienti: 3, strategie: "totala" });
  const dupaLiniiSiColoane = totala.pasi.find((pas) => pas.tip === "permutare")?.matrice;
  verifica(
    "GPT: → [3 2 2; 2 1 1; 1 1 1]",
    !!dupaLiniiSiColoane &&
      egaleM(dupaLiniiSiColoane, [
        [3, 2, 2],
        [2, 1, 1],
        [1, 1, 1],
      ]),
    JSON.stringify(dupaLiniiSiColoane),
  );
  verifica(
    "GPT: permutarea de coloane e ținută minte (x₃ ajunge prima necunoscută)",
    egale(totala.ordineNecunoscute, [2, 1, 0]),
    `${totala.ordineNecunoscute}`,
  );
  // Liniile matricei sunt dependente (L₃ = L₁ + L₂), deci metoda trebuie să se
  // oprească spunând corect de ce, nu să scoată un pivot din rotunjiri.
  verifica("matricea e singulară → stare „esuat”", totala.stare === "esuat", totala.motiv ?? "");
  verifica(
    "oprirea vine de la ultimul pivot, nu de la primul",
    (totala.pasi.at(-1) as { p: number }).p === 2,
    `pasul ${(totala.pasi.at(-1) as { p: number }).p + 1}`,
  );
}

console.log("");
console.log(
  "=== 7. Cele trei strategii pe sistemul rezolvat: aceeași soluție, drumuri diferite ===",
);
{
  const { matrice, coeficienti } = EXEMPLE_PIVOTARE[2]!;
  const strategii: Strategie[] = ["partiala", "scalata", "totala"];

  for (const strategie of strategii) {
    const r = ruleazaPivotare({ matrice, coeficienti, strategie });
    verifica(`${strategie}: se termină cu bine`, r.stare === "convergent", r.motiv ?? "");
    verifica(`${strategie}: x = (−3, 4, 0)`, egale(r.x ?? [], [-3, 4, 0]), `${r.x}`);
    // Reziduul se ia pe sistemul ORIGINAL, nu pe cel permutat: e singurul fel în
    // care se vede că `ordineNecunoscute` a pus soluția la loc corect.
    const reziduu = matrice.map(
      (linie) => linie.slice(0, 3).reduce((s, a, j) => s + a * (r.x?.[j] ?? 0), 0) - linie[3]!,
    );
    verifica(
      `${strategie}: reziduu nul pe sistemul original`,
      reziduu.every((v) => Math.abs(v) < 1e-12),
      `${reziduu}`,
    );
    verifica(
      `${strategie}: sub diagonală numai zerouri`,
      r.U.every((linie, i) => linie.slice(0, i).every((v) => v === 0)),
      JSON.stringify(r.U),
    );
    verifica(
      `${strategie}: matricea de pornire rămâne neatinsă`,
      egaleM(matrice, [
        [1, 3, 1, 9],
        [1, 1, -1, 1],
        [3, 11, 8, 35],
      ]),
    );
  }
}

console.log("");
console.log("=== 8. Sistemul cu pivot mic: permutarea chiar repară rezultatul ===");
{
  const { matrice, coeficienti } = EXEMPLE_PIVOTARE[0]!;
  // Soluția exactă a sistemului din §5.1, calculată pe altă cale (Cramer 2×2):
  // det = 0,001·1 − 1·1 = −0,999; x₁ = (1·1 − 1·2)/det; x₂ = (0,001·2 − 1·1)/det.
  const det = 0.001 * 1 - 1 * 1;
  const exact = [(1 * 1 - 1 * 2) / det, (0.001 * 2 - 1 * 1) / det];

  for (const strategie of ["partiala", "scalata", "totala"] as Strategie[]) {
    const r = ruleazaPivotare({ matrice, coeficienti, strategie });
    verifica(
      `${strategie}: soluția coincide cu cea exactă`,
      egale(r.x ?? [], exact),
      `${r.x} față de ${exact}`,
    );
  }

  // Parțiala și scalata mută linia a doua sus: |1| > |0,001|, iar 1/1 > 0,001/1.
  for (const strategie of ["partiala", "scalata"] as Strategie[]) {
    const r = ruleazaPivotare({ matrice, coeficienti, strategie });
    const alegere = (r.pasi[0] as { alegere: { linie: number; coloana: number } }).alegere;
    verifica(
      `${strategie}: pivotul vine din L₂, pe loc`,
      alegere.linie === 1 && alegere.coloana === 0,
    );
  }

  // Totala scoate același pivot, dar pe alt drum, și e corect așa: maximul
  // submatricei e 1, iar de 1 e plină toată matricea în afară de colț. La
  // egalitate se păstrează primul găsit — L₁ —, deci în loc să mute o linie mută
  // **coloana**. Rezultatul e la fel de bun; ce se schimbă e ordinea
  // necunoscutelor, iar `ordineNecunoscute` o pune la loc.
  {
    const r = ruleazaPivotare({ matrice, coeficienti, strategie: "totala" });
    const alegere = (r.pasi[0] as { alegere: { linie: number; coloana: number } }).alegere;
    verifica(
      "totala: pivotul vine din L₁, dar de pe coloana a doua",
      alegere.linie === 0 && alegere.coloana === 1,
      `(${alegere.linie + 1}, ${alegere.coloana + 1})`,
    );
    verifica("totala: necunoscutele s-au schimbat între ele", egale(r.ordineNecunoscute, [1, 0]));
  }
}

console.log("");
console.log("=== 9. Cazurile-limită ies ca rezultat, nu ca excepție ===");
{
  // Linie nulă: `sᵢ = 0` — cursul spune explicit că matricea e singulară.
  const linieNula: Matrice = [
    [0, 0, 0],
    [1, 2, 3],
  ];
  const scalata = ruleazaPivotare({ matrice: linieNula, coeficienti: 2, strategie: "scalata" });
  verifica("sᵢ = 0 → „esuat”, nu excepție", scalata.stare === "esuat", scalata.motiv ?? "");
  verifica(
    "motivul spune că linia e nulă, nu doar că «ceva n-a mers»",
    (scalata.motiv ?? "").includes("nulă"),
    scalata.motiv ?? "",
  );

  // Coloană nulă sub pivot: pivotarea parțială n-are ce alege.
  const coloanaNula: Matrice = [
    [0, 1, 1],
    [0, 2, 2],
  ];
  const partiala = ruleazaPivotare({ matrice: coloanaNula, coeficienti: 2, strategie: "partiala" });
  verifica("coloană nulă → „esuat”, nu Infinity", partiala.stare === "esuat", partiala.motiv ?? "");
  verifica(
    "nicio cifră nefinită printre pași",
    partiala.pasi.every((pas) => pas.matrice.every((l) => l.every((v) => Number.isFinite(v)))),
  );
}

console.log("");
console.log("=== 10. Substituția înapoi, pe un sistem independent ===");
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
