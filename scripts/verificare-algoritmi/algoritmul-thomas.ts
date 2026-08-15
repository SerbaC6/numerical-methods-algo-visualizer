/**
 * Verificarea algoritmului Thomas — rulează modulul real din `src/`.
 *
 * Referință: `cursuri_MN/sisteme_liniare_metode_directe_MN_curs4.md`, §9
 * (recurențele din §9.1, Algorithm 5, dominanța diagonală din §9.2).
 *
 * Soluția nu se compară cu ea însăși: se recalculează pe **altă cale** —
 * eliminare gaussiană deasă pe matricea extinsă a aceluiași sistem, adică
 * modulul paginii 3 — și separat prin reziduul `A·x − d` pe sistemul original.
 */
import {
  algoritmulThomas,
  esteDiagonalDominant,
} from "../../src/algorithms/algoritmul-thomas/thomas.ts";
import {
  B_DUPA_ELIMINARE,
  D_DUPA_ELIMINARE,
  PASI_ELIMINARE,
  PASI_SUBSTITUTIE,
  SISTEM_DIN_CLIP,
  SOLUTIA,
} from "../../src/algorithms/algoritmul-thomas/exemplu.ts";
import {
  eliminareGaussiana,
  substitutieInapoi,
  type Matrice,
} from "../../src/algorithms/eliminare-gaussiana/eliminare.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

const egale = (a: readonly number[], b: readonly number[]) =>
  a.length === b.length && a.every((v, i) => Math.abs(v - b[i]!) < 1e-12);

const { a, b, c, d } = SISTEM_DIN_CLIP;
const n = b.length;

console.log("=== 1. Sistemul desenat în clip ===");
{
  verifica("patru ecuații", n === 4 && a.length === 4 && c.length === 4 && d.length === 4);
  verifica(
    "diagonal dominant, |bᵢ| ≥ |aᵢ| + |cᵢ|",
    esteDiagonalDominant(SISTEM_DIN_CLIP),
    b.map((bi, i) => `${Math.abs(bi)}≥${Math.abs(a[i]!) + Math.abs(c[i]!)}`).join(", "),
  );
}

console.log("=== 2. Eliminarea înainte, față de recurențele din §9.1 ===");
{
  verifica("trei pași, câte unul pe fiecare linie de sub prima", PASI_ELIMINARE.length === n - 1);

  // Recurențele scrise încă o dată, direct din curs, pe vectori proprii.
  const bRef = [...b];
  const dRef = [...d];
  for (let i = 1; i < n; i++) {
    const mu = a[i]! / bRef[i - 1]!;
    bRef[i] = bRef[i]! - mu * c[i - 1]!;
    dRef[i] = dRef[i]! - mu * dRef[i - 1]!;
  }
  verifica("b după eliminare", egale(B_DUPA_ELIMINARE, bRef), `${B_DUPA_ELIMINARE}`);
  verifica("d după eliminare", egale(D_DUPA_ELIMINARE, dRef), `${D_DUPA_ELIMINARE}`);

  verifica(
    "toți µ ies −0,25, deci nicio cifră de pe ecran nu e rotunjită",
    PASI_ELIMINARE.every((p) => p.mu === -0.25),
    PASI_ELIMINARE.map((p) => p.mu).join(", "),
  );
  verifica(
    "b și d rămân întregi după fiecare pas",
    PASI_ELIMINARE.every((p) => Number.isInteger(p.bDupa) && Number.isInteger(p.dDupa)),
    PASI_ELIMINARE.map((p) => `b=${p.bDupa}, d=${p.dDupa}`).join(" | "),
  );
  verifica(
    "c nu se atinge niciodată",
    egale(c, SISTEM_DIN_CLIP.c),
    "vectorul c e neatins de algoritm",
  );
}

console.log("=== 3. Substituția înapoi ===");
{
  verifica("patru necunoscute aflate", PASI_SUBSTITUTIE.length === n);
  verifica(
    "prima aflată este xₙ, ultima este x₁",
    PASI_SUBSTITUTIE[0]?.i === n - 1 && PASI_SUBSTITUTIE[n - 1]?.i === 0,
  );
  verifica(
    "xₙ = dₙ / bₙ",
    PASI_SUBSTITUTIE[0]?.x === D_DUPA_ELIMINARE[n - 1]! / B_DUPA_ELIMINARE[n - 1]!,
    `${PASI_SUBSTITUTIE[0]?.x}`,
  );
  verifica(
    "fiecare xᵢ respectă (dᵢ − cᵢ·xᵢ₊₁) / bᵢ",
    PASI_SUBSTITUTIE.slice(1).every(
      (p) => Math.abs(p.x - (p.d - (p.c ?? 0) * (p.xUrmator ?? 0)) / p.b) < 1e-12,
    ),
  );
}

console.log("=== 4. Soluția, verificată pe alte două căi ===");
{
  // (a) reziduul pe sistemul ORIGINAL, cu a, b, c, d neatinse.
  const rezidual = d.map((di, i) => {
    const stanga =
      (i > 0 ? a[i]! * SOLUTIA[i - 1]! : 0) +
      b[i]! * SOLUTIA[i]! +
      (i < n - 1 ? c[i]! * SOLUTIA[i + 1]! : 0);
    return Math.abs(stanga - di);
  });
  verifica("A·x − d = 0", Math.max(...rezidual) < 1e-12, `max ${Math.max(...rezidual)}`);

  // (b) eliminare gaussiană deasă pe matricea extinsă a aceluiași sistem.
  const extinsa: Matrice = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) =>
      j === n ? d[i]! : j === i - 1 ? a[i]! : j === i ? b[i]! : j === i + 1 ? c[i]! : 0,
    ),
  );
  const { U } = eliminareGaussiana(extinsa);
  const { x: xDens } = substitutieInapoi(U);
  verifica("aceeași soluție ca eliminarea gaussiană deasă", egale(SOLUTIA, xDens), `${xDens}`);

  verifica("soluția este (2, 3, 4, 5)", egale(SOLUTIA, [2, 3, 4, 5]), `${SOLUTIA}`);
}

console.log("=== 5. Cazul-limită: bᵢ₋₁ nul ===");
{
  let aruncat = false;
  try {
    algoritmulThomas({ a: [0, 1], b: [0, 1], c: [1, 0], d: [1, 1] });
  } catch {
    aruncat = true;
  }
  verifica("un b nul oprește metoda, în loc să dea Infinity", aruncat);
}

console.log("");
console.log(picate === 0 ? "✓ toate verificările au trecut" : `✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);
