/**
 * Verificarea cuadraturilor adaptive și Gaussiene — rulează modulele reale din `src/`.
 *
 * Referință: `cursuri_MN/romberg-cuadraturi-gaussiene_curs12.md`.
 *
 * Ce se verifică:
 *
 * 1. **primitiva funcției noi** (`e⁻³ˣ·sin 4x`) e chiar primitiva ei, iar
 *    derivatele de ordin 2 și 4 sunt chiar derivatele — ele sunt referința față
 *    de care se măsoară totul;
 * 2. estimarea de eroare a adaptivului **chiar mărginește** eroarea reală, la
 *    toleranțe între `10⁻³` și `10⁻⁹` — dar numai acolo unde `f⁗` e mărginită;
 *    pe `√x` nu, și tocmai asta se măsoară;
 * 3. panourile acceptate acoperă intervalul, fără goluri și fără suprapuneri;
 * 4. adaptivul **se îndeasă unde funcția se mișcă**: pe funcția din curs, mai
 *    multe panouri în prima jumătate de unitate decât în ultimele două;
 * 5. **nodurile Gaussiene** sunt rădăcinile polinoamelor Legendre monice din
 *    curs, comparate cu formele închise (`±1/√3`, `0`, `±√(3/5)`);
 * 6. **gradul de exactitate, măsurat** pe monoame: `2n − 1` la Gauss, iar
 *    formula greșește pe primul monom de peste;
 * 7. ponderile ies din integrala Lagrange a cursului, iar cu noduri
 *    echidistante aceeași construcție dă trapezele și Simpson;
 * 8. schimbarea de interval nu strică exactitatea: aceleași teste pe `[a, b]`
 *    oarecare;
 * 9. figura desenată **e** aproximarea: aria de sub arcele adaptivului dă chiar
 *    valoarea lui, iar aria de sub polinomul de interpolare dă chiar `Σcᵢf(xᵢ)`;
 * 10. cifrele scrise pe pagină: Gauss cu 2 noduri bate Simpson cu 3 puncte, iar
 *    adaptivul cere mai puține evaluări decât pasul uniform pentru aceeași
 *    eroare.
 */
import {
  FUNCTII_CUADRATURA,
  getFunctieCuadratura,
} from "../../src/algorithms/cuadraturi/functii-cuadraturi.ts";
import {
  conturAdaptiv,
  panouriUniformePentru,
  ruleazaAdaptiv,
  simpsonSimplu,
  simpsonUniform,
} from "../../src/algorithms/cuadraturi/adaptiv.ts";
import {
  aplicaFormula,
  catreInterval,
  conturInterpolantului,
  formulaEchidistanta,
  formulaGauss,
  gradDeExactitate,
  NODURI_MAXIME,
  ponderiPentruNoduri,
} from "../../src/algorithms/cuadraturi/gaussiene.ts";
import { integralaExacta } from "../../src/algorithms/newton-cotes/functii-integrare.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

const OSCILANTA = getFunctieCuadratura("oscilanta");

console.log("=== 1. Primitiva și derivatele funcției noi ===");
{
  const h = 1e-5;
  let abaterePrimitiva = 0;
  let abatereDoi = 0;
  let abaterePatru = 0;
  for (let i = 0; i <= 100; i++) {
    const x = 0.1 + (i * 3.8) / 100;
    // F′ = f
    abaterePrimitiva = Math.max(
      abaterePrimitiva,
      Math.abs(
        (OSCILANTA.primitiva(x + h) - OSCILANTA.primitiva(x - h)) / (2 * h) - OSCILANTA.f(x),
      ),
    );
    // f″ prin diferență centrată de ordin 2
    abatereDoi = Math.max(
      abatereDoi,
      Math.abs(
        (OSCILANTA.f(x + h) - 2 * OSCILANTA.f(x) + OSCILANTA.f(x - h)) / h ** 2 -
          OSCILANTA.derivataDoi(x),
      ),
    );
    // f⁗ ca derivata a doua a lui f″
    abaterePatru = Math.max(
      abaterePatru,
      Math.abs(
        (OSCILANTA.derivataDoi(x + h) -
          2 * OSCILANTA.derivataDoi(x) +
          OSCILANTA.derivataDoi(x - h)) /
          h ** 2 -
          OSCILANTA.derivataPatru(x),
      ),
    );
  }
  verifica("F′ = f", abaterePrimitiva < 1e-6, `abatere ${abaterePrimitiva.toExponential(2)}`);
  verifica(
    "f″ e chiar derivata a doua",
    abatereDoi < 1e-3,
    `abatere ${abatereDoi.toExponential(2)}`,
  );
  verifica(
    "f⁗ e chiar derivata a patra",
    abaterePatru < 1e-1,
    `abatere ${abaterePatru.toExponential(2)}`,
  );
  verifica(
    "∫₀⁴ e⁻³ˣ·sin(4x) dx = 0,1600011537…",
    Math.abs(integralaExacta(OSCILANTA, 0, 4) - 0.16000115372280727) < 1e-15,
    integralaExacta(OSCILANTA, 0, 4).toFixed(10),
  );
}

console.log("\n=== 2. Adaptivul chiar respectă toleranța cerută ===");
{
  // Estimarea de eroare presupune că `f⁗` nu se schimbă mult pe interval. Acolo
  // unde chiar așa e, toleranța se respectă; pe `√x`, unde `f⁗` e nemărginită în
  // zero, **nu** — și asta se măsoară, nu se ascunde.
  for (const functie of FUNCTII_CUADRATURA) {
    const [a, b] = functie.interval;
    const exact = integralaExacta(functie, a, b);
    let celMaiProstRaport = 0;
    for (const epsilon of [1e-3, 1e-5, 1e-7, 1e-9]) {
      const rezultat = ruleazaAdaptiv({ f: functie.f, a, b, epsilon });
      celMaiProstRaport = Math.max(celMaiProstRaport, Math.abs(rezultat.valoare - exact) / epsilon);
    }
    if (functie.id === "radical") {
      verifica(
        "√x: toleranța **nu** e respectată — derivata a patra e nemărginită în zero",
        celMaiProstRaport > 1,
        `eroarea urcă la ${celMaiProstRaport.toFixed(2)}·ε`,
      );
      verifica(
        "√x: chiar și așa, eroarea rămâne în același ordin de mărime cu ε",
        celMaiProstRaport < 20,
        `${celMaiProstRaport.toFixed(2)}·ε`,
      );
      continue;
    }
    verifica(
      `${functie.eticheta}: eroarea rămâne sub ε la toate cele patru toleranțe`,
      celMaiProstRaport <= 1,
      `cel mai mare raport eroare/ε: ${celMaiProstRaport.toExponential(2)}`,
    );
  }
}

console.log("\n=== 3. Panourile acoperă intervalul, fără goluri ===");
{
  for (const functie of FUNCTII_CUADRATURA) {
    const [a, b] = functie.interval;
    const { panouri } = ruleazaAdaptiv({ f: functie.f, a, b, epsilon: 1e-6 });
    const lipite = panouri.every((p, i) => i === 0 || Math.abs(p.a - panouri[i - 1]!.b) < 1e-12);
    const lungime = panouri.reduce((s, p) => s + (p.b - p.a), 0);
    verifica(
      `${functie.eticheta}: ${panouri.length} panouri, cap la cap, de la a la b`,
      lipite &&
        Math.abs(panouri[0]!.a - a) < 1e-12 &&
        Math.abs(panouri[panouri.length - 1]!.b - b) < 1e-12 &&
        Math.abs(lungime - (b - a)) < 1e-12,
    );
  }

  // Ordinea pașilor e cea a recursiei: fiecare tăiere e urmată imediat de
  // jumătatea din stânga, deci pasul următor începe de unde începea și părintele.
  const pasi = ruleazaAdaptiv({ f: OSCILANTA.f, a: 0, b: 4, epsilon: 1e-4 }).pasi;
  const primaTaiere = pasi.find((p) => !p.nod.acceptat);
  const urmatorul = primaTaiere ? pasi[primaTaiere.index] : undefined;
  verifica(
    "după o tăiere se cercetează jumătatea din stânga",
    !!primaTaiere &&
      !!urmatorul &&
      Math.abs(urmatorul.nod.a - primaTaiere.nod.a) < 1e-12 &&
      Math.abs(urmatorul.nod.b - primaTaiere.nod.c) < 1e-12,
  );
}

console.log("\n=== 4. Adaptivul se îndeasă unde funcția se mișcă ===");
{
  const { panouri, evaluari } = ruleazaAdaptiv({ f: OSCILANTA.f, a: 0, b: 4, epsilon: 1e-6 });
  const laStanga = panouri.filter((p) => p.b <= 0.5).length;
  const laDreapta = panouri.filter((p) => p.a >= 2).length;
  verifica(
    "mai multe panouri pe [0; 0,5] decât pe [2; 4], deși e de opt ori mai scurt",
    laStanga > laDreapta,
    `${laStanga} față de ${laDreapta}, din ${panouri.length} panouri și ${evaluari} evaluări`,
  );
  verifica(
    "cel mai îngust panou e lângă zero",
    panouri.reduce((min, p) => (p.b - p.a < min.b - min.a ? p : min)).a < 0.5,
  );
}

console.log("\n=== 5. Nodurile Gaussiene sunt rădăcinile polinoamelor din curs ===");
{
  const asteptate: Record<number, number[]> = {
    1: [0],
    2: [-1 / Math.sqrt(3), 1 / Math.sqrt(3)],
    3: [-Math.sqrt(3 / 5), 0, Math.sqrt(3 / 5)],
  };
  for (const n of [1, 2, 3]) {
    const { noduri } = formulaGauss(n);
    const potrivite =
      noduri.length === n && noduri.every((x, i) => Math.abs(x - asteptate[n]![i]!) < 1e-12);
    verifica(
      `n = ${n}: ${asteptate[n]!.map((v) => v.toFixed(6)).join("; ")}`,
      potrivite,
      noduri.map((v) => v.toFixed(6)).join("; "),
    );
  }
  // P₄ = x⁴ − (6/7)x² + 3/35 are rădăcinile ±√((3 ± 2√(6/5))/7).
  const r = (semn: number) => Math.sqrt((3 + semn * 2 * Math.sqrt(6 / 5)) / 7);
  const asteptat4 = [-r(1), -r(-1), r(-1), r(1)];
  const noduri4 = formulaGauss(4).noduri;
  verifica(
    "n = 4: rădăcinile lui x⁴ − (6/7)x² + 3/35",
    noduri4.every((x, i) => Math.abs(x - asteptat4[i]!) < 1e-12),
    noduri4.map((v) => v.toFixed(6)).join("; "),
  );
  // Simetria e o proprietate a familiei, nu o întâmplare a căutării.
  for (let n = 1; n <= NODURI_MAXIME; n++) {
    const { noduri, ponderi } = formulaGauss(n);
    const simetrice = noduri.every((x, i) => Math.abs(x + noduri[n - 1 - i]!) < 1e-12);
    const ponderiSimetrice = ponderi.every((c, i) => Math.abs(c - ponderi[n - 1 - i]!) < 1e-12);
    const suma = ponderi.reduce((s, c) => s + c, 0);
    verifica(
      `n = ${n}: noduri și ponderi simetrice, Σcᵢ = 2`,
      simetrice && ponderiSimetrice && Math.abs(suma - 2) < 1e-12,
      `Σcᵢ = ${suma.toFixed(12)}`,
    );
  }
}

console.log("\n=== 6. Gradul de exactitate, măsurat pe monoame ===");
{
  for (let n = 1; n <= NODURI_MAXIME; n++) {
    const formula = formulaGauss(n);
    const grad = gradDeExactitate(formula);
    verifica(`n = ${n}: gradul măsurat e 2n − 1 = ${2 * n - 1}`, grad === 2 * n - 1, `${grad}`);

    // Și primul monom de peste chiar greșește — altfel „exact până la" n-ar
    // însemna nimic.
    const gradRau = 2 * n;
    const aproximat = formula.noduri.reduce(
      (s, t, i) => s + (formula.ponderi[i] ?? 0) * t ** gradRau,
      0,
    );
    const exact = 2 / (gradRau + 1);
    verifica(
      `n = ${n}: greșește pe x^${gradRau}`,
      Math.abs(aproximat - exact) > 1e-6,
      `${aproximat.toFixed(8)} față de ${exact.toFixed(8)}`,
    );
  }
}

console.log("\n=== 7. Aceeași construcție, cu noduri echidistante, dă Newton-Cotes ===");
{
  // Trapezele pe [−1, 1]: ponderi 1 și 1. Simpson: 1/3, 4/3, 1/3.
  const trapez = formulaEchidistanta(2);
  verifica(
    "n = 2 → trapeze: ponderi 1 și 1",
    trapez.ponderi.every((c) => Math.abs(c - 1) < 1e-12),
    trapez.ponderi.map((c) => c.toFixed(6)).join("; "),
  );
  const simpson = formulaEchidistanta(3);
  verifica(
    "n = 3 → Simpson: ponderi 1/3, 4/3, 1/3",
    [1 / 3, 4 / 3, 1 / 3].every((c, i) => Math.abs(simpson.ponderi[i]! - c) < 1e-12),
    simpson.ponderi.map((c) => c.toFixed(6)).join("; "),
  );
  verifica("trapezele sunt exacte până la gradul 1", gradDeExactitate(trapez) === 1);
  verifica("Simpson e exact până la gradul 3", gradDeExactitate(simpson) === 3);

  // Ponderile Gauss ies la fel dacă se cer direct din integrala Lagrange a
  // cursului — adică formula generală și cazul particular nu se contrazic.
  for (let n = 1; n <= NODURI_MAXIME; n++) {
    const { noduri, ponderi } = formulaGauss(n);
    const directe = ponderiPentruNoduri(noduri);
    verifica(
      `n = ${n}: ponderile ies din ∫lᵢ, oricum ar fi cerute`,
      ponderi.every((c, i) => Math.abs(c - directe[i]!) < 1e-12),
    );
  }
}

console.log("\n=== 8. Schimbarea de interval ===");
{
  verifica("t = −1 → a, t = 1 → b", catreInterval(-1, 2, 5) === 2 && catreInterval(1, 2, 5) === 5);
  verifica("t = 0 → mijlocul", Math.abs(catreInterval(0, 2, 5) - 3.5) < 1e-15);

  // Pe [a, b] oarecare, Gauss cu n noduri rămâne exact pe polinoame de grad 2n−1.
  for (let n = 1; n <= NODURI_MAXIME; n++) {
    const formula = formulaGauss(n);
    let maxim = 0;
    for (const [a, b] of [
      [0, 1],
      [1, 2],
      [-2, 3],
      [0.5, 0.75],
    ] as const) {
      for (let grad = 0; grad <= 2 * n - 1; grad++) {
        const f = (x: number) => x ** grad;
        const exact = (b ** (grad + 1) - a ** (grad + 1)) / (grad + 1);
        const obtinut = aplicaFormula(formula, f, a, b).valoare;
        maxim = Math.max(maxim, Math.abs(obtinut - exact) / Math.max(1, Math.abs(exact)));
      }
    }
    verifica(
      `n = ${n}: exact pe [a, b] până la gradul ${2 * n - 1}`,
      maxim < 1e-12,
      `${maxim.toExponential(2)}`,
    );
  }
}

console.log("\n=== 9. Cifrele care ajung pe pagină ===");
{
  // Gauss cu 2 noduri față de Simpson cu 3 puncte, pe aceleași funcții.
  for (const id of ["sinus", "invers"]) {
    const functie = getFunctieCuadratura(id);
    const [a, b] = functie.interval;
    const exact = integralaExacta(functie, a, b);
    const gauss2 = Math.abs(aplicaFormula(formulaGauss(2), functie.f, a, b).valoare - exact);
    const simpson3 = Math.abs(simpsonSimplu(functie.f, a, b) - exact);
    verifica(
      `${functie.eticheta}: Gauss cu 2 noduri bate Simpson cu 3 puncte`,
      gauss2 < simpson3,
      `${gauss2.toExponential(2)} față de ${simpson3.toExponential(2)}`,
    );
  }

  // Cubica: Gauss cu 2 noduri e exact, trapezele cu 3 puncte nu.
  {
    const cubica = getFunctieCuadratura("cubica");
    const [a, b] = cubica.interval;
    const exact = integralaExacta(cubica, a, b);
    const gauss2 = Math.abs(aplicaFormula(formulaGauss(2), cubica.f, a, b).valoare - exact);
    const trapez3 = Math.abs(
      ((b - a) / 4) * (cubica.f(a) + 2 * cubica.f((a + b) / 2) + cubica.f(b)) - exact,
    );
    verifica(
      "x³: Gauss cu 2 noduri e exact, trapezele cu 3 puncte greșesc cu 1",
      gauss2 < 1e-14 && Math.abs(trapez3 - 1) < 1e-12,
      `Gauss ${gauss2.toExponential(2)}, trapeze ${trapez3.toFixed(6)}`,
    );
  }

  // Adaptivul față de pasul uniform, la aceeași eroare.
  {
    const [a, b] = OSCILANTA.interval;
    const exact = integralaExacta(OSCILANTA, a, b);
    const adaptiv = ruleazaAdaptiv({ f: OSCILANTA.f, a, b, epsilon: 1e-6 });
    const eroareAdaptiv = Math.abs(adaptiv.valoare - exact);
    const uniform = panouriUniformePentru(OSCILANTA.f, a, b, exact, eroareAdaptiv);
    verifica(
      "aceeași eroare, mai puține evaluări la adaptiv",
      uniform.gasit && uniform.evaluari > adaptiv.evaluari,
      `adaptiv ${adaptiv.evaluari} evaluări (eroare ${eroareAdaptiv.toExponential(2)}), ` +
        `uniform ${uniform.evaluari} pe ${uniform.panouri} panouri`,
    );

    // Și invers: cu bugetul adaptivului, pasul uniform greșește mai mult.
    const panouriEchivalente = Math.max(1, Math.floor((adaptiv.evaluari - 1) / 2));
    const laFelDeScump = simpsonUniform(OSCILANTA.f, a, b, panouriEchivalente);
    verifica(
      "cu același buget de evaluări, pasul uniform greșește mai mult",
      Math.abs(laFelDeScump.valoare - exact) > eroareAdaptiv,
      `uniform ${Math.abs(laFelDeScump.valoare - exact).toExponential(2)} față de ` +
        `${eroareAdaptiv.toExponential(2)}`,
    );
  }
}

console.log("\n=== 10. Figura desenată e chiar aproximarea ===");
{
  /** Aria de sub un contur, prin trapeze foarte dese — doar ca măsurătoare. */
  const arie = (contur: { x: number; y: number }[]) => {
    let suma = 0;
    for (let i = 1; i < contur.length; i++) {
      const p = contur[i - 1]!;
      const q = contur[i]!;
      suma += ((q.x - p.x) * (p.y + q.y)) / 2;
    }
    return suma;
  };

  // Aria conturului se măsoară prin trapeze, deci măsurătoarea are ea însăși o
  // eroare, de ordinul `h²`. Ca să nu se confunde cu o nepotrivire adevărată, se
  // măsoară de două ori, la rezoluție dublă, și se cere ca abaterea **să scadă**
  // — semnul că ce rămâne e eroarea măsurătorii, nu a figurii.
  for (const functie of FUNCTII_CUADRATURA) {
    const [a, b] = functie.interval;
    const rezultat = ruleazaAdaptiv({ f: functie.f, a, b, epsilon: 1e-6 });
    const abatereLa = (puncte: number) =>
      Math.abs(arie(conturAdaptiv(rezultat, functie.f, puncte)) - rezultat.valoare);
    const rara = abatereLa(500);
    const deasa = abatereLa(2000);
    verifica(
      `${functie.eticheta}: aria arcelor desenate = valoarea calculată de adaptiv`,
      deasa < 1e-6 * Math.max(1, Math.abs(rezultat.valoare)) && deasa < rara / 4,
      `abatere ${deasa.toExponential(2)} la rezoluție dublă, față de ${rara.toExponential(2)}`,
    );
  }

  for (const n of [2, 3, 4]) {
    const functie = getFunctieCuadratura("sinus");
    const [a, b] = functie.interval;
    for (const formula of [formulaGauss(n), formulaEchidistanta(n)]) {
      const aplicata = aplicaFormula(formula, functie.f, a, b);
      const masurata = arie(conturInterpolantului(aplicata.noduri, a, b, 20000));
      verifica(
        `n = ${n}: aria de sub polinomul de interpolare = Σcᵢf(xᵢ)`,
        Math.abs(masurata - aplicata.valoare) < 1e-7,
        `${masurata.toFixed(9)} față de ${aplicata.valoare.toFixed(9)}`,
      );
    }
  }
}

console.log("");
console.log(picate === 0 ? "✓ toate verificările au trecut" : `✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);
