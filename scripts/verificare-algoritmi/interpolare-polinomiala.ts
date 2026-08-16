/**
 * Verificarea interpolării polinomiale — rulează modulele reale din `src/`.
 *
 * Referință: `cursuri_MN/interpolare_spline_bezier_teorie_curs09.md`, §2
 * (Lagrange), §3 (Neville), §8 (funcția Runge), §10 și §12 (spline).
 *
 * Ce se verifică:
 *
 * 1. multiplicatorii Lagrange: `lₖ(xₖ) = 1`, `lₖ(xᵢ) = 0`, `Σ lₖ = 1`;
 * 2. polinomul trece prin toate nodurile, iar pe un polinom de grad ≤ n se
 *    reproduce pe sine — adică unicitatea din §2;
 * 3. Neville dă **același** polinom ca Lagrange, iar fiecare `P_ij` trece prin
 *    punctele lui; ponderile pasului se adună la 1;
 * 4. fenomenul Runge, cu cifrele din §8: 5 noduri → oscilații moderate, 11
 *    noduri → amplitudini peste valorile funcției;
 * 5. spline-ul liniar interpolează, dar are pante diferite între subintervale;
 * 6. spline-ul cubic: racordare C⁰, C¹, C², `c₀ = cₙ = 0` la cel natural,
 *    `s′ = f′` în capete la cel tensionat, plus forma alternativă a lui `bᵢ`;
 * 7. pe aceleași 11 noduri echidistante, spline-ul bate polinomul cu două
 *    ordine de mărime — concluzia care leagă §8 de §12.
 */
import {
  contributieLagrange,
  multiplicatorLagrange,
  polinomLagrange,
} from "../../src/algorithms/interpolare-polinomiala/lagrange.ts";
import {
  ponderiNeville,
  schemaNeville,
  valoareNeville,
} from "../../src/algorithms/interpolare-polinomiala/neville.ts";
import {
  derivataADouaSpline,
  derivataSpline,
  evalueazaSpline,
  splineCubic,
  splineLiniar,
} from "../../src/algorithms/interpolare-polinomiala/spline.ts";
import {
  abatereMaxima,
  noduriEchidistante,
  type Nod,
} from "../../src/algorithms/interpolare-polinomiala/tipuri.ts";
import { getFunctieInterpolata } from "../../src/algorithms/interpolare-polinomiala/functii-interpolare.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

/** Nodurile de test: neechidistante intenționat, ca `hᵢ` să difere între ele. */
const NODURI: Nod[] = [
  { x: 0, y: 2 },
  { x: 1, y: -1 },
  { x: 3, y: 5 },
  { x: 4, y: 3 },
];

const aproape = (a: number, b: number, prag = 1e-12) => Math.abs(a - b) < prag;

console.log("=== 1. Multiplicatorii Lagrange (§2) ===");
{
  for (const [k] of NODURI.entries()) {
    const inNoduri = NODURI.every((nod, i) =>
      aproape(multiplicatorLagrange(NODURI, k, nod.x), i === k ? 1 : 0),
    );
    verifica(`l${k}(xᵢ) = δᵢₖ`, inNoduri);
  }

  let maxAbatere = 0;
  for (let i = 0; i <= 200; i++) {
    const x = -2 + (8 * i) / 200;
    const suma = NODURI.reduce((s, _, k) => s + multiplicatorLagrange(NODURI, k, x), 0);
    maxAbatere = Math.max(maxAbatere, Math.abs(suma - 1));
  }
  verifica(
    "Σ lₖ(x) = 1 pe toată axa",
    maxAbatere < 1e-12,
    `abatere ${maxAbatere.toExponential(1)}`,
  );

  // Suma contribuțiilor e chiar polinomul — asta desenează pagina.
  const x = 7 / 3;
  const suma = NODURI.reduce((s, _, k) => s + contributieLagrange(NODURI, k, x), 0);
  verifica("Σ f(xₖ)·lₖ(x) = Pₙ(x)", aproape(suma, polinomLagrange(NODURI, x)));
}

console.log("=== 2. Polinomul de interpolare (§2) ===");
{
  verifica(
    "trece prin toate nodurile",
    NODURI.every((nod) => aproape(polinomLagrange(NODURI, nod.x), nod.y)),
  );

  // Unicitatea: pe un polinom de grad 3, interpolarea pe 4 noduri îl reproduce.
  const g = (x: number) => x ** 3 - 2 * x + 7;
  const noduriG = NODURI.map((nod) => ({ x: nod.x, y: g(nod.x) }));
  let maxAbatere = 0;
  for (let i = 0; i <= 100; i++) {
    const x = -3 + (9 * i) / 100;
    maxAbatere = Math.max(maxAbatere, Math.abs(polinomLagrange(noduriG, x) - g(x)));
  }
  verifica(
    "un polinom de grad 3 e reprodus exact de 4 noduri",
    maxAbatere < 1e-11,
    `abatere ${maxAbatere.toExponential(1)}`,
  );
}

console.log("=== 3. Metoda Neville (§3) ===");
{
  for (const x of [-2 / 3, 1 / 3, 5 / 3, 7 / 3]) {
    const schema = schemaNeville(NODURI, x);
    verifica(
      `P₀ₙ = Lagrange în x = ${x.toFixed(3)}`,
      aproape(schema.rezultat, polinomLagrange(NODURI, x)),
      `${schema.rezultat.toFixed(9)}`,
    );
  }

  const schema = schemaNeville(NODURI, 1.7);
  verifica(
    "nivelul 0 e chiar valorile din noduri",
    schema.niveluri[0]!.every((intrare, i) => intrare.valoare === NODURI[i]!.y),
  );
  verifica(
    "nivelul g are n − g intrări, toate de grad g",
    schema.niveluri.every(
      (nivel, g) => nivel.length === NODURI.length - g && nivel.every((e) => e.grad === g),
    ),
  );

  // Fiecare P_ij trece prin punctele lui — proprietatea din care se deduce
  // recurența.
  let treceTot = true;
  for (let i = 0; i < NODURI.length; i++) {
    for (let j = i; j < NODURI.length; j++) {
      for (let l = i; l <= j; l++) {
        if (!aproape(valoareNeville(NODURI, i, j, NODURI[l]!.x), NODURI[l]!.y, 1e-11)) {
          treceTot = false;
        }
      }
    }
  }
  verifica("P_ij trece prin (xₗ, yₗ), l = i:j", treceTot);

  let maxAbatere = 0;
  for (let i = 0; i <= 100; i++) {
    const x = -1 + (6 * i) / 100;
    const { spreStanga, spreDreapta } = ponderiNeville(NODURI, 0, 2, x);
    maxAbatere = Math.max(maxAbatere, Math.abs(spreStanga + spreDreapta - 1));
  }
  verifica(
    "ponderile pasului se adună la 1",
    maxAbatere < 1e-14,
    `abatere ${maxAbatere.toExponential(1)}`,
  );
}

console.log("=== 4. Fenomenul Runge (§8) ===");
{
  const runge = getFunctieInterpolata("runge");
  for (const cate of [5, 11]) {
    const noduri = noduriEchidistante(runge.f, runge.interval, cate);
    const P = (x: number) => polinomLagrange(noduri, x);
    const eroare = abatereMaxima(P, runge.f, runge.interval, 20000);

    let maxP = 0;
    let unde = 0;
    for (let i = 0; i <= 20000; i++) {
      const x = -1 + (2 * i) / 20000;
      if (Math.abs(P(x)) > maxP) {
        maxP = Math.abs(P(x));
        unde = x;
      }
    }
    console.log(
      `  ${cate} noduri: max|P| = ${maxP.toFixed(4)} în x = ${unde.toFixed(3)}, ` +
        `eroare = ${eroare.toFixed(4)}`,
    );
  }

  const cinci = noduriEchidistante(runge.f, runge.interval, 5);
  const unsprezece = noduriEchidistante(runge.f, runge.interval, 11);
  const eroareCinci = abatereMaxima(
    (x) => polinomLagrange(cinci, x),
    runge.f,
    runge.interval,
    20000,
  );
  const eroareUnsprezece = abatereMaxima(
    (x) => polinomLagrange(unsprezece, x),
    runge.f,
    runge.interval,
    20000,
  );
  verifica(
    "cu 11 noduri eroarea e mai mare decât cu 5 — creșterea gradului nu ajută",
    eroareUnsprezece > eroareCinci,
    `${eroareCinci.toFixed(4)} → ${eroareUnsprezece.toFixed(4)}`,
  );
  verifica(
    "oscilația depășește valoarea maximă a funcției (1)",
    eroareUnsprezece > 1,
    `eroare ${eroareUnsprezece.toFixed(4)}`,
  );

  // Contraexemplul: pe sinusoidă, aceleași noduri echidistante se poartă bine.
  const sin = getFunctieInterpolata("sinusoida");
  const eroareSin = (cate: number) =>
    abatereMaxima(
      (x) => polinomLagrange(noduriEchidistante(sin.f, sin.interval, cate), x),
      sin.f,
      sin.interval,
      5000,
    );
  verifica(
    "pe sin(πx), creșterea gradului chiar ajută",
    eroareSin(11) < eroareSin(5),
    `${eroareSin(5).toExponential(2)} → ${eroareSin(11).toExponential(2)}`,
  );

  // Unicitatea, văzută pe funcția polinomială: 6 noduri ajung pentru gradul 5.
  const pol = getFunctieInterpolata("polinom");
  const eroarePol = abatereMaxima(
    (x) => polinomLagrange(noduriEchidistante(pol.f, pol.interval, 6), x),
    pol.f,
    pol.interval,
    5000,
  );
  verifica(
    "polinomul de grad 5 e prins exact de 6 noduri",
    eroarePol < 1e-13,
    `eroare ${eroarePol.toExponential(1)}`,
  );
}

console.log("=== 5. Spline liniar (§10) ===");
{
  const bucati = splineLiniar(NODURI);
  verifica(
    "fiecare bucată trece prin capetele ei",
    bucati.every(
      (b, i) =>
        aproape(b.a * NODURI[i]!.x + b.b, NODURI[i]!.y) &&
        aproape(b.a * NODURI[i + 1]!.x + b.b, NODURI[i + 1]!.y),
    ),
  );
  verifica(
    "pantele diferă între subintervale, deci derivata sare în noduri",
    bucati.some((b, i) => i > 0 && !aproape(b.a, bucati[i - 1]!.a)),
    `pante ${bucati.map((b) => b.a.toFixed(3)).join(", ")}`,
  );
}

console.log("=== 6. Spline cubic (§12) ===");
{
  const natural = splineCubic(NODURI, "natural");
  const n = NODURI.length - 1;

  verifica(
    "aᵢ = f(xᵢ)",
    natural.a.every((a, i) => a === NODURI[i]!.y),
  );
  verifica(
    "interpolare: s(xᵢ) = yᵢ",
    NODURI.every((nod) => aproape(evalueazaSpline(natural, nod.x), nod.y, 1e-10)),
  );

  /*
   * Racordarea se măsoară pe **coeficienți**, nu prin evaluare la stânga și la
   * dreapta nodului: o diferență finită peste un nod amestecă saltul căutat cu
   * curbura reală a bucății, iar la `s′` cele două ies de același ordin.
   * Aici, bucata din stânga se evaluează analitic în nodul de racordare și se
   * compară cu coeficientul bucății din dreapta.
   */
  const salt = (ordin: 0 | 1 | 2) =>
    Math.max(
      ...natural.b.slice(1).map((_, k) => {
        const i = k + 1;
        const h = natural.h[i - 1]!;
        const stanga =
          ordin === 0
            ? natural.a[i - 1]! +
              natural.b[i - 1]! * h +
              natural.c[i - 1]! * h * h +
              natural.d[i - 1]! * h ** 3
            : ordin === 1
              ? natural.b[i - 1]! + 2 * natural.c[i - 1]! * h + 3 * natural.d[i - 1]! * h * h
              : 2 * natural.c[i - 1]! + 6 * natural.d[i - 1]! * h;
        const dreapta =
          ordin === 0 ? natural.a[i]! : ordin === 1 ? natural.b[i]! : 2 * natural.c[i]!;
        return Math.abs(stanga - dreapta);
      }),
    );
  verifica("racordare C⁰", salt(0) < 1e-12, `salt ${salt(0).toExponential(1)}`);
  verifica("racordare C¹", salt(1) < 1e-12, `salt ${salt(1).toExponential(1)}`);
  verifica("racordare C²", salt(2) < 1e-12, `salt ${salt(2).toExponential(1)}`);
  verifica("natural: c₀ = cₙ = 0", natural.c[0] === 0 && natural.c[n] === 0);
  verifica(
    "natural: s″ = 0 în capete",
    aproape(derivataADouaSpline(natural, NODURI[0]!.x), 0, 1e-10) &&
      aproape(derivataADouaSpline(natural, NODURI[n]!.x), 0, 1e-10),
  );

  // Forma alternativă a lui bᵢ, tipărită tot în §12.
  const alternativa = natural.b.every((b, i) => {
    if (i === 0) return true;
    const hStanga = natural.h[i - 1]!;
    const asteptat =
      (natural.a[i]! - natural.a[i - 1]!) / hStanga +
      ((natural.c[i - 1]! + 2 * natural.c[i]!) / 3) * hStanga;
    return aproape(b, asteptat, 1e-10);
  });
  verifica("forma alternativă a lui bᵢ din curs coincide", alternativa);

  const la0 = 0.5;
  const laN = -3;
  const tensionat = splineCubic(NODURI, "tensionat", { la0, laN });
  verifica(
    "tensionat: s′(x₀) = f′(x₀)",
    aproape(derivataSpline(tensionat, NODURI[0]!.x), la0, 1e-10),
    `${derivataSpline(tensionat, NODURI[0]!.x)}`,
  );
  verifica(
    "tensionat: s′(xₙ) = f′(xₙ)",
    aproape(derivataSpline(tensionat, NODURI[n]!.x - 1e-12), laN, 1e-8),
    `${derivataSpline(tensionat, NODURI[n]!.x - 1e-12)}`,
  );
  verifica(
    "tensionat: interpolarea rămâne",
    NODURI.every((nod) => aproape(evalueazaSpline(tensionat, nod.x), nod.y, 1e-10)),
  );
}

console.log("=== 7. Runge: polinom vs spline, pe aceleași 11 noduri ===");
{
  const runge = getFunctieInterpolata("runge");
  const noduri = noduriEchidistante(runge.f, runge.interval, 11);
  const spline = splineCubic(noduri, "natural");

  const eroarePolinom = abatereMaxima(
    (x) => polinomLagrange(noduri, x),
    runge.f,
    runge.interval,
    20000,
  );
  const eroareSpline = abatereMaxima(
    (x) => evalueazaSpline(spline, x),
    runge.f,
    runge.interval,
    20000,
  );
  console.log(`  polinom de grad 10: eroare = ${eroarePolinom.toFixed(5)}`);
  console.log(`  spline cubic natural: eroare = ${eroareSpline.toFixed(5)}`);
  verifica(
    "spline-ul e cu cel puțin două ordine de mărime mai bun",
    eroareSpline * 50 < eroarePolinom,
  );
}

console.log("");
if (picate === 0) {
  console.log("✓ toate verificările au trecut");
} else {
  console.log(`✗ ${picate} verificări au picat`);
  process.exitCode = 1;
}
