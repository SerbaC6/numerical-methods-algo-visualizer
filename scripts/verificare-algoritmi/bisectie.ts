/** Verificarea metodei bisecției — rulează chiar modulul care ajunge pe site. */
import { run } from "../../src/algorithms/ecuatii-neliniare/bisectie.ts";
import { FUNCTII, getFunctie } from "../../src/algorithms/functii.ts";

const ok = (c: boolean) => (c ? "OK  " : "PICĂ");
let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${ok(conditie)} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

console.log("=== 1. Converge la rădăcina corectă, pe toate funcțiile din curs ===");
for (const fn of FUNCTII) {
  const r = run({
    functie: fn.id,
    a: fn.interval[0],
    b: fn.interval[1],
    tol: 1e-10,
    maxIteratii: 200,
  });
  const ultim = r.pasi.at(-1);
  const abatere = ultim ? Math.abs(ultim.x - fn.radacina) : Number.NaN;
  verifica(
    `${fn.eticheta.padEnd(14)} stare=${r.stare}`,
    r.stare === "convergent" && abatere < 1e-9,
    `x=${ultim?.x.toFixed(12)} vs rădăcina ${fn.radacina.toFixed(12)} (abatere ${abatere.toExponential(2)}), ${r.pasi.length} pași`,
  );
}

console.log("\n=== 2. Marginea din curs: |pₙ − p| < (b − a)/2ⁿ ===");
{
  const fn = getFunctie("patrat-minus-doi");
  const r = run({ functie: fn.id, a: 1, b: 2, tol: 1e-12, maxIteratii: 12 });
  const lungime = 2 - 1;
  let toate = true;
  for (const pas of r.pasi) {
    const margine = lungime / 2 ** pas.iteratie;
    const abatere = Math.abs(pas.x - fn.radacina);
    if (!(abatere < margine)) toate = false;
  }
  verifica("fiecare pas respectă marginea teoretică", toate, `${r.pasi.length} pași verificați`);

  // Intervalul chiar se înjumătățește: eroarea raportată scade exact cu 2.
  const rapoarte = r.pasi.slice(1).map((p, i) => p.eroare / (r.pasi[i]?.eroare ?? Number.NaN));
  verifica(
    "intervalul se înjumătățește exact",
    rapoarte.every((q) => Math.abs(q - 0.5) < 1e-12),
    `rapoarte: ${rapoarte
      .slice(0, 3)
      .map((q) => q.toFixed(3))
      .join(", ")}…`,
  );
}

console.log("\n=== 3. Rădăcina rămâne prinsă în interval la fiecare pas ===");
{
  const fn = getFunctie("cub");
  const r = run({ functie: fn.id, a: 2, b: 3, tol: 1e-12, maxIteratii: 40 });
  const toate = r.pasi.every(
    (p) => p.interval && p.interval.a <= fn.radacina && fn.radacina <= p.interval.b,
  );
  verifica("rădăcina e mereu între capete", toate, `${r.pasi.length} pași`);
  const semne = r.pasi.every((p) => {
    if (!p.interval) return false;
    return fn.f(p.interval.a) * fn.f(p.interval.b) <= 0;
  });
  verifica("semnele rămân opuse la capete", semne);
}

console.log("\n=== 4. Cazuri-limită ===");
{
  // interval fără schimbare de semn
  const r1 = run({ functie: "patrat-minus-doi", a: 2, b: 3, tol: 1e-8, maxIteratii: 50 });
  verifica(
    "interval fără schimbare de semn → eșec explicat",
    r1.stare === "esuat" && !!r1.motiv,
    r1.motiv?.slice(0, 60),
  );

  // capete inversate: trebuie să meargă la fel
  const drept = run({ functie: "cub", a: 2, b: 3, tol: 1e-10, maxIteratii: 80 });
  const invers = run({ functie: "cub", a: 3, b: 2, tol: 1e-10, maxIteratii: 80 });
  verifica(
    "capete date invers dau același rezultat",
    drept.pasi.length === invers.pasi.length && drept.pasi.at(-1)?.x === invers.pasi.at(-1)?.x,
  );

  // capete egale
  const r3 = run({ functie: "cub", a: 2, b: 2, tol: 1e-8, maxIteratii: 10 });
  verifica("capete egale → eșec, nu buclă", r3.stare === "esuat" && r3.pasi.length === 0);

  // Capăt așezat pe rădăcină. Niciuna dintre funcțiile din curs n-are rădăcină
  // reprezentabilă exact în `float64` (√2, ln 8, e², numărul de aur sunt toate
  // iraționale), deci ramura `f(capăt) === 0` e defensivă și nu se poate atinge
  // cu lista noastră. Ce se poate verifica e că un capăt la distanță de ordinul
  // 1e-16 de rădăcină nu rupe metoda.
  // `f(√2)` iese `+4,44e-16`, adică pozitiv — la fel ca `f(2)`. Un interval
  // `[√2, 2]` e deci corect refuzat: ambele capete au același semn. Capătul
  // trebuie pus de partea cealaltă, unde `f(1) = −1`.
  const r4 = run({ functie: "patrat-minus-doi", a: 1, b: Math.SQRT2, tol: 1e-8, maxIteratii: 60 });
  verifica(
    "capăt așezat pe rădăcină → converge, nu se blochează",
    r4.stare === "convergent" && Math.abs((r4.pasi.at(-1)?.x ?? Number.NaN) - Math.SQRT2) < 1e-7,
    `f(√2) = ${(Math.SQRT2 ** 2 - 2).toExponential(2)}, deci nu e exact zero`,
  );
  const r4b = run({ functie: "patrat-minus-doi", a: Math.SQRT2, b: 2, tol: 1e-8, maxIteratii: 60 });
  verifica("iar [√2, 2] e refuzat, fiindcă ambele capete sunt pozitive", r4b.stare === "esuat");

  // buget de iterații epuizat
  const r5 = run({ functie: "cub", a: 2, b: 3, tol: 1e-15, maxIteratii: 3 });
  verifica(
    "buget epuizat → neterminat, cu motiv",
    r5.stare === "neterminat" && !!r5.motiv && r5.pasi.length === 3,
  );

  // funcție nedefinită la capăt (ln din negativ)
  const r6 = run({ functie: "logaritm", a: -1, b: 9, tol: 1e-8, maxIteratii: 10 });
  verifica(
    "funcție nedefinită la capăt → eșec explicat",
    r6.stare === "esuat",
    r6.motiv?.slice(0, 60),
  );
}

console.log("\n=== 5. Numărul de pași față de formula din curs: n ≥ log₂((b−a)/tol) ===");
for (const tol of [1e-3, 1e-6, 1e-10]) {
  const r = run({ functie: "cub", a: 2, b: 3, tol, maxIteratii: 200 });
  const teoretic = Math.ceil(Math.log2(1 / tol));
  verifica(
    `tol=${tol.toExponential(0)}: ${r.pasi.length} pași, formula dă ${teoretic}`,
    Math.abs(r.pasi.length - teoretic) <= 1,
  );
}

console.log("\n=== 6. Explicațiile sunt scrise și coerente cu cifrele ===");
{
  const r = run({ functie: "cub", a: 2, b: 3, tol: 1e-6, maxIteratii: 40 });
  verifica(
    "fiecare pas are explicație nevidă",
    r.pasi.every((p) => p.explicatie.trim().length > 0),
  );
  verifica(
    "virgulă zecimală, nu punct",
    r.pasi.every((p) => !/\d\.\d/.test(p.explicatie)),
  );
  console.log("     primul pas: " + r.pasi[0]?.explicatie);
  console.log("     ultimul pas: " + r.pasi.at(-1)?.explicatie);
}

console.log(picate === 0 ? "\n✓ toate verificările trec" : `\n✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);
