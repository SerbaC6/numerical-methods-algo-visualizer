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
 * 2. ordinul erorii, **măsurat ca pantă** la înjumătățirea pasului, nu enunțat;
 * 3. formula înapoi e chiar cea înainte cu `h` schimbat de semn, cum spune cursul;
 * 4. nodurile desenate sunt chiar cele din formulă.
 *
 * Ce **nu** se mai verifică aici: capcana „sub un anumit `h`, eroarea crește la
 * loc" și `h`-ul optim. Amândouă au ieșit de pe pagină odată cu graficul erorii,
 * iar modulul care le calcula (`derivare-numerica/eroare.ts`) nu mai există. Un
 * script care testează cod șters pică la fiecare rulare și ascunde greșelile
 * adevărate ale celorlalte fișiere.
 */
import {
  FORMULE,
  getFormula,
  noduriConcrete,
  sumaCoeficientilor,
} from "../../src/algorithms/derivare-numerica/formule.ts";
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
  // Panta se măsoară aici, din două erori la pași care se înjumătățesc: modulul
  // care făcea baleiajul a ieșit odată cu graficul erorii, iar ce se testează e
  // oricum `formule.ts`, nu baleiajul.
  const f = Math.sin;
  const x0 = 0.6;

  for (const formula of FORMULE) {
    const exact = formula.ordin === 1 ? Math.cos(x0) : -Math.sin(x0);
    const eroareLa = (h: number) => Math.abs(formula.aproximeaza(f, x0, h) - exact);
    // Pași destul de mari cât să nu conteze rotunjirea mașinii, destul de mici
    // cât termenul dominant să fie chiar el dominant.
    const panta = Math.log2(eroareLa(1e-2) / eroareLa(5e-3));
    verifica(
      `${formula.eticheta}: panta ≈ ${formula.ordinEroare}`,
      Math.abs(panta - formula.ordinEroare) < 0.06,
      `măsurat ${panta.toFixed(4)}`,
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

console.log("\n=== 4. Nodurile, cele desenate ===");
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
