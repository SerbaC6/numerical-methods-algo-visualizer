/**
 * Verificarea formulelor de cuadratură — rulează modulele reale din `src/`.
 *
 * Referință: `cursuri_MN/derivare-integrare-numerica_curs11.md`, partea de
 * integrare numerică.
 *
 * Ce se verifică:
 *
 * 1. **primitivele** scrise analitic sunt chiar primitivele funcțiilor — altfel
 *    toată pagina ar măsura eroarea față de un număr greșit;
 * 2. formulele **simple** ale cursului ies din cele compuse cu un singur panou;
 * 3. sumele compuse coincid cu formulele închise tipărite în curs, rescrise
 *    independent aici;
 * 4. **gradul de exactitate**: trapezele sunt exacte pe polinoame de grad ≤ 1,
 *    Simpson pe grad ≤ 3 (dar **nu** pe grad 4), punctul de mijloc pe grad ≤ 1;
 * 5. **ordinul erorii, măsurat** ca pantă la înjumătățirea pasului: 2, 4 și 2;
 * 6. marginile de eroare ale cursului chiar mărginesc eroarea măsurată;
 * 7. semnul erorii, dat de convexitate: coarda pe deasupra, mijlocul pe dedesubt;
 * 8. capcana `√x`: derivata a doua nemărginită, deci marginea nu există, iar
 *    ordinul măsurat scade sub 2.
 */
import {
  FUNCTII_INTEGRARE,
  getFunctieIntegrare,
  integralaExacta,
} from "../../src/algorithms/newton-cotes/functii-integrare.ts";
import {
  conturAproximarii,
  margineEroare,
  normalizeazaN,
  parabolaPrin,
  ruleazaCuadratura,
  type IdCuadratura,
} from "../../src/algorithms/newton-cotes/cuadraturi.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

/** Aproximarea dată de modul, pentru o funcție din listă. */
function aproximeaza(idFunctie: string, id: IdCuadratura, n: number, capete?: [number, number]) {
  const functie = getFunctieIntegrare(idFunctie);
  const [a, b] = capete ?? functie.interval;
  return ruleazaCuadratura({
    id,
    f: functie.f,
    a,
    b,
    n,
    exact: integralaExacta(functie, a, b),
    derivate: functie,
  });
}

console.log("=== 1. Primitivele sunt chiar primitivele ===");
{
  // Referința e o cuadratură Simpson foarte fină — dar **numai aici**, ca test
  // al primitivei. Pe pagină valoarea exactă vine din primitivă, niciodată
  // dintr-o altă aproximare.
  for (const functie of FUNCTII_INTEGRARE) {
    const [a, b] = functie.interval;
    const exact = integralaExacta(functie, a, b);
    const fin = ruleazaCuadratura({ id: "simpson", f: functie.f, a, b, n: 2000, exact });
    const abatere = Math.abs(fin.aproximare - exact);
    // `√x` are derivatele nemărginite în 0, deci nici Simpson foarte fin nu
    // ajunge la precizia mașinii acolo; pragul îi urmează ordinul real.
    const prag = functie.id === "radical" ? 1e-6 : 1e-9;
    verifica(
      `${functie.eticheta}: F(b) − F(a) = ${exact.toFixed(10)}`,
      abatere < prag,
      `abatere față de Simpson cu N = 2000: ${abatere.toExponential(2)}`,
    );
  }
}

console.log("\n=== 2. Formulele simple ale cursului ===");
{
  const f = (x: number) => Math.exp(x) / (1 + x * x);
  const a = 0.4;
  const b = 1.9;
  const exact = 0; // nu contează aici: se compară aproximări între ele

  // Trapeze, N = 1: h/2·[f(a) + f(b)], cu h = b − a.
  {
    const h = b - a;
    const dinCurs = (h / 2) * (f(a) + f(b));
    const dinModul = ruleazaCuadratura({ id: "trapez", f, a, b, n: 1, exact }).aproximare;
    verifica(
      "trapeze cu N = 1 e chiar h/2·[f(a) + f(b)]",
      Math.abs(dinCurs - dinModul) < 1e-14,
      `curs ${dinCurs.toFixed(12)}, modul ${dinModul.toFixed(12)}`,
    );
  }

  // Simpson, N = 2: h/3·[f(a) + 4f((a+b)/2) + f(b)], cu h = (b − a)/2.
  {
    const h = (b - a) / 2;
    const dinCurs = (h / 3) * (f(a) + 4 * f((a + b) / 2) + f(b));
    const dinModul = ruleazaCuadratura({ id: "simpson", f, a, b, n: 2, exact }).aproximare;
    verifica(
      "Simpson cu N = 2 e chiar h/3·[f(a) + 4f((a+b)/2) + f(b)]",
      Math.abs(dinCurs - dinModul) < 1e-14,
      `curs ${dinCurs.toFixed(12)}, modul ${dinModul.toFixed(12)}`,
    );
  }

  // Punct de mijloc, formula deschisă cu n = 0: 2h·f(x₀), cu h = (b − a)/2 în
  // notația cursului, adică un singur panou de lățime b − a la noi.
  {
    const hCurs = (b - a) / 2;
    const dinCurs = 2 * hCurs * f(a + hCurs);
    const dinModul = ruleazaCuadratura({ id: "mijloc", f, a, b, n: 1, exact }).aproximare;
    verifica(
      "punct de mijloc cu un panou e chiar 2h·f(x₀)",
      Math.abs(dinCurs - dinModul) < 1e-14,
      `curs ${dinCurs.toFixed(12)}, modul ${dinModul.toFixed(12)}`,
    );
  }
}

console.log("\n=== 3. Sumele compuse, față de formulele închise din curs ===");
{
  const f = Math.sin;
  const a = 0.3;
  const b = 2.6;
  const exact = 0;

  for (const n of [2, 4, 8, 16, 50]) {
    const h = (b - a) / n;
    const x = (i: number) => a + i * h;

    // §„Formula compusă a trapezelor": h/2·[f(a) + f(b) + 2·Σ_{i=1}^{N−1} f(xᵢ)]
    let interior = 0;
    for (let i = 1; i <= n - 1; i++) interior += f(x(i));
    const trapezCurs = (h / 2) * (f(a) + f(b) + 2 * interior);
    const trapezModul = ruleazaCuadratura({ id: "trapez", f, a, b, n, exact }).aproximare;
    verifica(
      `trapeze compuse, N = ${n}`,
      Math.abs(trapezCurs - trapezModul) < 1e-13,
      `curs ${trapezCurs.toFixed(12)}, modul ${trapezModul.toFixed(12)}`,
    );

    if (n % 2 !== 0) continue;

    // §„Formula compusă Simpson": h/3·[f(a) + f(b) + 4·Σ f(x_{2i−1}) + 2·Σ f(x_{2i})]
    let impare = 0;
    for (let i = 1; i <= n / 2; i++) impare += f(x(2 * i - 1));
    let pare = 0;
    for (let i = 1; i <= n / 2 - 1; i++) pare += f(x(2 * i));
    const simpsonCurs = (h / 3) * (f(a) + f(b) + 4 * impare + 2 * pare);
    const simpsonModul = ruleazaCuadratura({ id: "simpson", f, a, b, n, exact }).aproximare;
    verifica(
      `Simpson compus, N = ${n}`,
      Math.abs(simpsonCurs - simpsonModul) < 1e-13,
      `curs ${simpsonCurs.toFixed(12)}, modul ${simpsonModul.toFixed(12)}`,
    );

    // §„Formula compusă a trapezelor cu punct de mijloc": 2h·Σ_{j=0}^{n/2} f(x_{2j}),
    // cu h = (b − a)/(n + 2) și x_j = a + (j + 1)h. Panourile ies n/2 + 1, fiecare
    // de lățime 2h — adică N = n/2 + 1 în notația modulului.
    const hCurs = (b - a) / (n + 2);
    let sumaMijloc = 0;
    for (let j = 0; j <= n / 2; j++) sumaMijloc += f(a + (2 * j + 1) * hCurs);
    const mijlocCurs = 2 * hCurs * sumaMijloc;
    const mijlocModul = ruleazaCuadratura({
      id: "mijloc",
      f,
      a,
      b,
      n: n / 2 + 1,
      exact,
    }).aproximare;
    verifica(
      `punct de mijloc compus, n = ${n} din curs (${n / 2 + 1} panouri)`,
      Math.abs(mijlocCurs - mijlocModul) < 1e-13,
      `curs ${mijlocCurs.toFixed(12)}, modul ${mijlocModul.toFixed(12)}`,
    );
  }
}

console.log("\n=== 4. Gradul de exactitate ===");
{
  const a = -0.7;
  const b = 1.6;
  const monoame = [0, 1, 2, 3, 4].map((grad) => ({
    grad,
    f: (x: number) => x ** grad,
    exact: (b ** (grad + 1) - a ** (grad + 1)) / (grad + 1),
  }));

  const gradMaxim: Record<IdCuadratura, number> = { trapez: 1, simpson: 3, mijloc: 1 };

  for (const id of ["trapez", "simpson", "mijloc"] as IdCuadratura[]) {
    for (const m of monoame) {
      const n = normalizeazaN(id, 2);
      const obtinut = ruleazaCuadratura({ id, f: m.f, a, b, n, exact: m.exact });
      const eroare = Math.abs(obtinut.aproximare - m.exact);
      if (m.grad <= gradMaxim[id]) {
        verifica(
          `${id}: exact pe x^${m.grad}`,
          eroare < 1e-13,
          `eroare ${eroare.toExponential(2)}`,
        );
      } else if (m.grad === gradMaxim[id] + 1) {
        verifica(
          `${id}: **nu** e exact pe x^${m.grad}`,
          eroare > 1e-6,
          `eroare ${eroare.toExponential(2)}`,
        );
      }
    }
  }
}

console.log("\n=== 5. Ordinul erorii, măsurat la înjumătățirea pasului ===");
{
  const ordinAsteptat: Record<IdCuadratura, number> = { trapez: 2, simpson: 4, mijloc: 2 };

  for (const idFunctie of ["sinus", "invers"]) {
    for (const id of ["trapez", "simpson", "mijloc"] as IdCuadratura[]) {
      const e1 = aproximeaza(idFunctie, id, 32).eroare;
      const e2 = aproximeaza(idFunctie, id, 64).eroare;
      const panta = Math.log2(e1 / e2);
      verifica(
        `${idFunctie}, ${id}: panta ≈ ${ordinAsteptat[id]}`,
        Math.abs(panta - ordinAsteptat[id]) < 0.05,
        `măsurat ${panta.toFixed(4)}`,
      );
    }
  }
}

console.log("\n=== 6. Marginile de eroare din curs chiar mărginesc eroarea ===");
{
  for (const idFunctie of ["parabola", "cubica", "sinus", "invers"]) {
    const functie = getFunctieIntegrare(idFunctie);
    const [a, b] = functie.interval;
    for (const id of ["trapez", "simpson", "mijloc"] as IdCuadratura[]) {
      let toate = true;
      let celMaiStrans = Number.POSITIVE_INFINITY;
      for (const n of [2, 4, 8, 16, 32, 64]) {
        const N = normalizeazaN(id, n);
        const rezultat = aproximeaza(idFunctie, id, N);
        const margine = margineEroare(id, functie, a, b, N);
        if (margine === undefined) {
          toate = false;
          break;
        }
        // Toleranța de 10⁻¹² ține cazul în care eroarea e zero prin exactitate
        // (Simpson pe cubică), unde marginea e tot zero.
        if (rezultat.eroare > margine + 1e-12) toate = false;
        if (margine > 0) celMaiStrans = Math.min(celMaiStrans, rezultat.eroare / margine);
      }
      verifica(
        `${functie.eticheta}, ${id}: eroarea ≤ marginea, la toate valorile lui N`,
        toate,
        Number.isFinite(celMaiStrans) ? `raport minim ${celMaiStrans.toExponential(2)}` : "",
      );
    }
  }
}

console.log("\n=== 7. Semnul erorii, dat de convexitate ===");
{
  // `1/x` e convexă pe [1, 2] (f″ = 2/x³ > 0): coarda trece pe deasupra curbei,
  // deci trapezele supraevaluează, iar mijlocul subevaluează.
  const convexa = aproximeaza("invers", "trapez", 8);
  verifica(
    "1/x convexă: trapezele supraevaluează",
    convexa.aproximare > convexa.exact,
    `${convexa.aproximare.toFixed(10)} > ${convexa.exact.toFixed(10)}`,
  );
  const mijlocConvexa = aproximeaza("invers", "mijloc", 8);
  verifica(
    "1/x convexă: punctul de mijloc subevaluează",
    mijlocConvexa.aproximare < mijlocConvexa.exact,
    `${mijlocConvexa.aproximare.toFixed(10)} < ${mijlocConvexa.exact.toFixed(10)}`,
  );

  // `sin` e concavă pe [0, π] (f″ = −sin ≤ 0): exact pe dos.
  const concava = aproximeaza("sinus", "trapez", 8);
  verifica(
    "sin(x) concavă pe [0, π]: trapezele subevaluează",
    concava.aproximare < concava.exact,
    `${concava.aproximare.toFixed(10)} < ${concava.exact.toFixed(10)}`,
  );
}

console.log("\n=== 8. Capcana √x: derivate nemărginite ===");
{
  const functie = getFunctieIntegrare("radical");
  const [a, b] = functie.interval;
  verifica(
    "√x pe [0, 1]: marginea la trapeze nu se poate calcula",
    margineEroare("trapez", functie, a, b, 8) === undefined,
  );
  verifica(
    "√x pe [0, 1]: marginea la Simpson nu se poate calcula",
    margineEroare("simpson", functie, a, b, 8) === undefined,
  );
  // Departe de zero derivatele sunt mărginite, deci marginea reapare.
  verifica(
    "√x pe [0,25 ; 1]: marginea se poate calcula",
    margineEroare("trapez", functie, 0.25, 1, 8) !== undefined,
  );

  const e1 = aproximeaza("radical", "trapez", 64).eroare;
  const e2 = aproximeaza("radical", "trapez", 128).eroare;
  const panta = Math.log2(e1 / e2);
  verifica(
    "√x: ordinul măsurat scade sub 2",
    panta > 1.2 && panta < 1.8,
    `măsurat ${panta.toFixed(4)} (în loc de 2)`,
  );
}

console.log("\n=== 9. Panourile, nodurile și conturul desenat ===");
{
  const rezultat = aproximeaza("sinus", "simpson", 6);
  const suma = rezultat.panouri.reduce((s, panou) => s + panou.contributie, 0);
  verifica(
    "suma contribuțiilor e chiar aproximarea",
    Math.abs(suma - rezultat.aproximare) < 1e-14,
    `${suma.toFixed(12)} față de ${rezultat.aproximare.toFixed(12)}`,
  );
  verifica(
    "ultimul cumulat e chiar aproximarea",
    Math.abs((rezultat.panouri.at(-1)?.cumulat ?? Number.NaN) - rezultat.aproximare) < 1e-14,
  );
  verifica("Simpson cu N = 6 are 3 panouri", rezultat.panouri.length === 3);

  // Coeficienții din formula compusă Simpson: 1, 4, 2, 4, 2, 4, 1.
  const coeficienti = rezultat.noduri.map((nod) => nod.coeficient);
  verifica(
    "coeficienții nodurilor la Simpson: 1, 4, 2, 4, 2, 4, 1",
    JSON.stringify(coeficienti) === JSON.stringify([1, 4, 2, 4, 2, 4, 1]),
    coeficienti.join(", "),
  );

  const trapez = aproximeaza("sinus", "trapez", 5);
  const coefTrapez = trapez.noduri.map((nod) => nod.coeficient);
  verifica(
    "coeficienții nodurilor la trapeze: 1, 2, 2, 2, 2, 1",
    JSON.stringify(coefTrapez) === JSON.stringify([1, 2, 2, 2, 2, 1]),
    coefTrapez.join(", "),
  );

  // Arcul desenat trece **prin** noduri: e chiar polinomul din care iese formula.
  let abatereMaxima = 0;
  for (const panou of rezultat.panouri) {
    for (const nod of panou.noduri) {
      abatereMaxima = Math.max(abatereMaxima, Math.abs(parabolaPrin(panou.noduri, nod.x) - nod.y));
    }
  }
  verifica(
    "parabola desenată trece exact prin cele trei noduri ale panoului",
    abatereMaxima < 1e-13,
    `abatere maximă ${abatereMaxima.toExponential(2)}`,
  );

  const contur = conturAproximarii(rezultat);
  verifica(
    "conturul pornește din a și se termină în b",
    Math.abs(contur[0]!.x - 0) < 1e-13 && Math.abs(contur.at(-1)!.x - Math.PI) < 1e-13,
  );

  // Aria de sub contur, integrată exact pe fiecare arc, e chiar suma formulei —
  // adică figura desenată **este** aproximarea, nu doar o ilustrație a ei.
  const conturTrapez = conturAproximarii(trapez);
  let arie = 0;
  for (let i = 1; i < conturTrapez.length; i++) {
    const s = conturTrapez[i - 1]!;
    const d = conturTrapez[i]!;
    arie += ((d.x - s.x) * (s.y + d.y)) / 2;
  }
  verifica(
    "aria figurii desenate la trapeze e chiar aproximarea",
    Math.abs(arie - trapez.aproximare) < 1e-13,
    `${arie.toFixed(12)} față de ${trapez.aproximare.toFixed(12)}`,
  );
}

console.log("\n=== 10. Erată: formula deschisă cu n = 2 are h³ în loc de h⁵ ===");
{
  /*
   * Cursul tipărește, la „Formulele Newton-Cotes deschise particularizate":
   *
   *   ∫ = (4h/3)[2f(x₀) − f(x₁) + 2f(x₂)] + (14h³/45)·f⁽⁴⁾(ξ)
   *
   * Partea din stânga e corectă; termenul de eroare **nu**. Testul de aici ține
   * erata pe loc: dacă cineva „repară" exponentul înapoi la 3, verificarea pică.
   * Vezi `docs/erata-cursuri.md`.
   *
   * Formula nu apare nicăieri pe site — pagina folosește doar cazul `n = 0`,
   * care e corect —, dar ea rămâne verificată aici ca decizia să fie urmăribilă.
   */
  const a = 0;
  const b = 1;
  const h = (b - a) / 4;
  const x = (i: number) => a + (i + 1) * h;
  const cuadratura = (f: (t: number) => number) =>
    ((4 * h) / 3) * (2 * f(x(0)) - f(x(1)) + 2 * f(x(2)));

  // Partea principală e exactă pe polinoame de grad ≤ 3 — deci ea e bună.
  let exactaPanaLaTrei = true;
  for (let grad = 0; grad <= 3; grad++) {
    const exact = 1 / (grad + 1);
    if (Math.abs(cuadratura((t) => t ** grad) - exact) > 1e-14) exactaPanaLaTrei = false;
  }
  verifica("partea principală e exactă pe polinoame de grad ≤ 3", exactaPanaLaTrei);

  // Pe `x⁴`, `f⁽⁴⁾ = 24` e constantă, deci `ξ` nu mai contează și termenul de
  // eroare se poate compara cifră cu cifră.
  const eroare = 1 / 5 - cuadratura((t) => t ** 4);
  const cuH5 = ((14 * h ** 5) / 45) * 24;
  const cuH3 = ((14 * h ** 3) / 45) * 24;
  verifica(
    "pe x⁴, eroarea e chiar 14h⁵/45·f⁗",
    Math.abs(eroare - cuH5) < 1e-15,
    `eroare ${eroare.toExponential(6)}, formula cu h⁵ ${cuH5.toExponential(6)}`,
  );
  verifica(
    "pe x⁴, forma tipărită în curs (h³) **nu** se potrivește",
    Math.abs(eroare - cuH3) > 1e-3,
    `tipărit ${cuH3.toExponential(6)}, adică de ${(cuH3 / cuH5).toFixed(0)} ori mai mult`,
  );
}

console.log("\n=== 11. N impar la Simpson se rotunjește la par ===");
{
  verifica("N = 3 devine 4", normalizeazaN("simpson", 3) === 4);
  verifica("N = 1 devine 2", normalizeazaN("simpson", 1) === 2);
  verifica("N = 8 rămâne 8", normalizeazaN("simpson", 8) === 8);
  verifica("la trapeze N = 3 rămâne 3", normalizeazaN("trapez", 3) === 3);
}

console.log("");
if (picate === 0) console.log("✓ toate verificările de cuadratură au trecut");
else console.log(`✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);
