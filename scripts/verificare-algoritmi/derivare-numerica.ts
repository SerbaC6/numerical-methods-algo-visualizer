/**
 * Verificarea formulelor de derivare — rulează modulele reale din `src/`.
 *
 * Referință: `cursuri_MN/derivare-integrare-numerica_curs11.md`, secțiunile de
 * derivare numerică.
 *
 * Ce se verifică:
 *
 * 1. fiecare formulă e o combinație de diferențe (`Σcₖ = 0`) și e **exactă** pe
 *    polinoamele de grad mic, exact cât promite ordinul ei;
 * 2. ordinul erorii, **măsurat ca pantă** pe graficul log-log, nu enunțat;
 * 3. formula înapoi e chiar cea înainte cu `h` schimbat de semn, cum spune cursul;
 * 4. capcana din finalul cursului: sub un anumit `h`, eroarea crește la loc;
 * 5. `h`-ul optim teoretic se potrivește cu cel măsurat, în limita unui ordin de
 *    mărime.
 */
import {
  FORMULE,
  getFormula,
  noduriConcrete,
  sumaCoeficientilor,
} from "../../src/algorithms/derivare-numerica/formule.ts";
import {
  baleiazaH,
  EPSILON,
  hOptimTeoretic,
  pantaMasurata,
} from "../../src/algorithms/derivare-numerica/eroare.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

console.log("=== 1. Structura formulelor ===");
{
  for (const formula of FORMULE) {
    verifica(
      `${formula.eticheta}: suma coeficienților e 0`,
      Math.abs(sumaCoeficientilor(formula)) < 1e-15,
      `${sumaCoeficientilor(formula)}`,
    );
  }

  // O formulă de ordinul p e exactă pe polinoamele de grad ≤ p (pentru derivata
  // întâi) — acolo termenul de eroare conține o derivată identic nulă.
  const polinoame: {
    nume: string;
    f: (x: number) => number;
    d1: (x: number) => number;
    d2: (x: number) => number;
  }[] = [
    { nume: "x", f: (x) => x, d1: () => 1, d2: () => 0 },
    { nume: "x²", f: (x) => x * x, d1: (x) => 2 * x, d2: () => 2 },
    { nume: "x³", f: (x) => x ** 3, d1: (x) => 3 * x * x, d2: (x) => 6 * x },
  ];

  const x0 = 0.7;
  const h = 0.25;
  for (const formula of FORMULE) {
    const gradExact = formula.ordin === 1 ? formula.ordinEroare : 2;
    for (const [i, p] of polinoame.entries()) {
      const grad = i + 1;
      const exact = formula.ordin === 1 ? p.d1(x0) : p.d2(x0);
      const obtinut = formula.aproximeaza(p.f, x0, h);
      const eroare = Math.abs(obtinut - exact);
      if (grad <= gradExact) {
        verifica(
          `${formula.eticheta}: exactă pe ${p.nume}`,
          eroare < 1e-12,
          `eroare ${eroare.toExponential(2)}`,
        );
      }
    }
  }
}

console.log("\n=== 2. Ordinul erorii, măsurat ca pantă ===");
{
  // `sin` are toate derivatele mărginite de 1, deci e cazul curat pentru pantă.
  const f = Math.sin;
  const x0 = 0.6;

  for (const formula of FORMULE) {
    const exact = formula.ordin === 1 ? Math.cos(x0) : -Math.sin(x0);
    const curba = baleiazaH(formula, f, x0, exact, { hMax: 1e-1, hMin: 1e-4 });
    const panta = pantaMasurata(curba, 1e-4, 1e-1);
    verifica(
      `${formula.eticheta}: panta ≈ ${formula.ordinEroare}`,
      panta !== null && Math.abs(panta - formula.ordinEroare) < 0.06,
      `măsurat ${panta?.toFixed(4)}`,
    );
  }
}

console.log("\n=== 3. Înainte și înapoi sunt aceeași formulă, cu semn schimbat ===");
{
  const f = (x: number) => Math.exp(x) / 4 - 2;
  const x0 = 1.3;
  const inainte = getFormula("inainte");
  const inapoi = getFormula("inapoi");

  let maxim = 0;
  for (const h of [0.5, 0.1, 0.01, 1e-3]) {
    maxim = Math.max(
      maxim,
      Math.abs(inainte.aproximeaza(f, x0, -h) - inapoi.aproximeaza(f, x0, h)),
    );
  }
  verifica(
    "înainte cu −h = înapoi cu +h",
    maxim < 1e-15,
    `abatere maximă ${maxim.toExponential(2)}`,
  );
}

console.log("\n=== 4. Capcana: sub un h, eroarea crește la loc ===");
{
  const f = Math.sin;
  const x0 = 0.6;
  const exact = Math.cos(x0);

  for (const id of ["inainte", "mijloc"]) {
    const formula = getFormula(id);
    const curba = baleiazaH(formula, f, x0, exact, { hMax: 1, hMin: 1e-14 });

    const laOptim = curba.eroareMinima;
    const laCelMaiMic = curba.puncte.at(-1)!.eroare;
    verifica(
      `${formula.eticheta}: cel mai mic h **nu** dă cea mai mică eroare`,
      laCelMaiMic > laOptim * 10,
      `h optim ${curba.hOptim.toExponential(1)} (eroare ${laOptim.toExponential(2)}), la h = 10⁻¹⁴ eroarea e ${laCelMaiMic.toExponential(2)}`,
    );
    verifica(
      `${formula.eticheta}: h optim e departe de capete`,
      curba.hOptim < 1e-3 && curba.hOptim > 1e-12,
      `${curba.hOptim.toExponential(2)}`,
    );
  }
}

console.log("\n=== 5. h optim: teoretic față de măsurat ===");
{
  const f = Math.sin;
  const x0 = 0.6;
  const exact = Math.cos(x0);

  // Constantele din termenii de eroare ai cursului: 1/2 la două puncte,
  // 1/6 la punctul de mijloc. `M = 1` fiindcă derivatele lui sin sunt ≤ 1.
  const cazuri = [
    { id: "inainte", constanta: 1 / 2 },
    { id: "mijloc", constanta: 1 / 6 },
  ];

  for (const caz of cazuri) {
    const formula = getFormula(caz.id);
    const teoretic = hOptimTeoretic(formula.ordinEroare, caz.constanta, 1, EPSILON);
    const curba = baleiazaH(formula, f, x0, exact, { hMax: 1, hMin: 1e-14, puncteDeDecada: 24 });
    const raport = curba.hOptim / teoretic;
    verifica(
      `${formula.eticheta}: h optim măsurat și teoretic, în același ordin de mărime`,
      raport > 0.1 && raport < 10,
      `teoretic ${teoretic.toExponential(2)}, măsurat ${curba.hOptim.toExponential(2)}`,
    );
  }

  // Cifrele scrise în teorie.
  verifica(
    "două puncte: h optim ≈ 2·10⁻⁸",
    Math.abs(Math.log10(hOptimTeoretic(1, 1 / 2)) + 8) < 0.7,
    hOptimTeoretic(1, 1 / 2).toExponential(2),
  );
  verifica(
    "punct de mijloc: h optim ≈ 9·10⁻⁶",
    Math.abs(Math.log10(hOptimTeoretic(2, 1 / 6)) + 5) < 0.7,
    hOptimTeoretic(2, 1 / 6).toExponential(2),
  );
}

console.log("\n=== 6. Nodurile, cele desenate ===");
{
  const f = (x: number) => x * x;
  const noduri = noduriConcrete(getFormula("capat"), f, 2, 0.5);
  verifica(
    "trei puncte, punct final: nodurile sunt x₀, x₀+h, x₀+2h",
    noduri.length === 3 &&
      Math.abs(noduri[0]!.x - 2) < 1e-15 &&
      Math.abs(noduri[1]!.x - 2.5) < 1e-15 &&
      Math.abs(noduri[2]!.x - 3) < 1e-15,
  );
  verifica(
    "nodurile poartă chiar valorile funcției",
    noduri.every((nod) => Math.abs(nod.y - f(nod.x)) < 1e-15),
  );
  const mijloc = noduriConcrete(getFormula("mijloc"), f, 2, 0.5);
  verifica(
    "punctul de mijloc nu folosește deloc x₀",
    mijloc.every((nod) => Math.abs(nod.x - 2) > 1e-12),
  );
}

console.log("");
if (picate === 0) console.log("✓ toate verificările de derivare numerică au trecut");
else console.log(`✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);
