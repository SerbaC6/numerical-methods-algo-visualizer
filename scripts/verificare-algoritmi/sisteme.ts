/**
 * Verificarea sistemelor gata alese ale paginii 7
 * (`src/algorithms/metode-de-gradient/sisteme.ts`).
 *
 * Butoanele de sistem spun trei lucruri fiecare — cum arată valea, câți pași
 * face coborârea și câți face gradientul conjugat — iar toate trei sunt
 * afirmații matematice pe care le citește studentul. Aici se măsoară, rulând
 * **modulele reale**, nu o reimplementare.
 *
 * Se rulează cu `bash scripts/verificare-algoritmi/ruleaza.sh`.
 */
import * as conjugat from "../../src/algorithms/metode-de-gradient/conjugat.ts";
import * as descendent from "../../src/algorithms/metode-de-gradient/descendent.ts";
import {
  SISTEME,
  SISTEM_IMPLICIT,
  type ValoriSistem,
} from "../../src/algorithms/metode-de-gradient/sisteme.ts";
import {
  conditionare,
  eigenSimetrica2,
  type Mat2,
  type Vec2,
} from "../../src/lib/curbe-de-nivel.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

const parametri = (v: ValoriSistem) => ({
  A: [v.a11, v.a12, v.a22] as Mat2,
  b: [v.b1, v.b2] as Vec2,
  x0: [v.x01, v.x02] as Vec2,
  tol: v.tol,
  maxIteratii: v.maxIteratii,
});

/**
 * Ce afirmă fiecare buton. Scrise **aici**, nu citite din modul: o verificare
 * care își ia așteptarea din codul verificat n-ar putea să pice niciodată.
 */
const ASTEPTAT: Record<string, { kappa: number; descendent: number; conjugat: number }> = {
  rotunda: { kappa: 1, descendent: 1, conjugat: 1 },
  curs: { kappa: 1.9387, descendent: 16, conjugat: 2 },
  alungita: { kappa: 10, descendent: 36, conjugat: 2 },
};

console.log("=== 1. Toate cele trei sisteme sunt SPD ===");
for (const sistem of SISTEME) {
  const { A } = parametri(sistem.valori);
  const { valori } = eigenSimetrica2(A);
  verifica(
    sistem.eticheta,
    valori[0] > 0 && valori[1] > 0,
    `λ = ${valori[0].toFixed(4)}, ${valori[1].toFixed(4)}`,
  );
}

console.log("\n=== 2. κ e cel pe care se sprijină eticheta ===");
for (const sistem of SISTEME) {
  const asteptat = ASTEPTAT[sistem.id];
  const kappa = conditionare(parametri(sistem.valori).A);
  verifica(
    sistem.eticheta,
    asteptat !== undefined && Math.abs(kappa - asteptat.kappa) < 5e-4,
    `κ = ${kappa.toFixed(4)}, semiaxele în raport ${Math.sqrt(kappa).toFixed(2)}`,
  );
}

console.log("\n=== 3. Numărul de pași al fiecărei metode, pe modulele reale ===");
for (const sistem of SISTEME) {
  const asteptat = ASTEPTAT[sistem.id];
  const p = parametri(sistem.valori);
  const d = descendent.run(p);
  const g = conjugat.run(p);

  verifica(
    `${sistem.eticheta} — coborârea`,
    asteptat !== undefined && d.stare === "convergent" && d.pasi.length === asteptat.descendent,
    `${d.pasi.length} pași, ${d.stare}`,
  );
  verifica(
    `${sistem.eticheta} — conjugatul`,
    asteptat !== undefined && g.stare === "convergent" && g.pasi.length === asteptat.conjugat,
    `${g.pasi.length} pași, ${g.stare}`,
  );
}

console.log("\n=== 4. Fiecare rulare se termină înainte de limita ei de iterații ===");
{
  // „Neterminat” ar fi cea mai proastă introducere posibilă: butonul ar promite
  // o comparație, iar desenul ar arăta o metodă oprită la jumătate.
  for (const sistem of SISTEME) {
    const p = parametri(sistem.valori);
    const d = descendent.run(p);
    const g = conjugat.run(p);
    verifica(
      sistem.eticheta,
      d.pasi.length < sistem.valori.maxIteratii && g.pasi.length < sistem.valori.maxIteratii,
      `${d.pasi.length} și ${g.pasi.length} din ${sistem.valori.maxIteratii}`,
    );
  }
}

console.log("\n=== 5. Numai forma văii diferă: b și x⁽⁰⁾ sunt aceleași peste tot ===");
{
  const prim = SISTEME[0];
  verifica(
    "b și x⁽⁰⁾ identice la toate trei",
    prim !== undefined &&
      SISTEME.every(
        (s) =>
          s.valori.b1 === prim.valori.b1 &&
          s.valori.b2 === prim.valori.b2 &&
          s.valori.x01 === prim.valori.x01 &&
          s.valori.x02 === prim.valori.x02,
      ),
    prim ? `b = (${prim.valori.b1}, ${prim.valori.b2})` : "",
  );
}

console.log("\n=== 6. Implicitul e chiar sistemul din curs ===");
{
  const curs = SISTEME.find((s) => s.id === "curs");
  verifica(
    "Butonul „Resetează” duce la sistemul din teoria paginii",
    curs !== undefined && curs.valori === SISTEM_IMPLICIT,
  );
  verifica(
    "cifrele lui sunt cele verificate în teorie",
    SISTEM_IMPLICIT.a11 === 4 &&
      SISTEM_IMPLICIT.a12 === 1 &&
      SISTEM_IMPLICIT.a22 === 3 &&
      SISTEM_IMPLICIT.b1 === 1 &&
      SISTEM_IMPLICIT.b2 === 2,
    "A = [[4, 1], [1, 3]], b = (1, 2)",
  );

  // x* = (1/11, 7/11), cifrele din `src/content/metode-de-gradient.tsx`.
  const solutie = descendent.run(parametri(SISTEM_IMPLICIT)).solutie;
  verifica(
    "soluția exactă e x* = (1/11, 7/11)",
    solutie !== null &&
      Math.abs(solutie[0] - 1 / 11) < 1e-12 &&
      Math.abs(solutie[1] - 7 / 11) < 1e-12,
    solutie ? `(${solutie[0].toFixed(9)}; ${solutie[1].toFixed(9)})` : "lipsește",
  );
}

console.log(
  picate === 0 ? "\n✓ sistemele gata alese sunt verificate" : `\n✗ ${picate} verificări au picat`,
);
process.exit(picate === 0 ? 0 : 1);
