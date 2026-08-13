/**
 * Reproducerea tabelului de la §2.3 din curs6 — comparația experimentală.
 *
 * Cursul dă numere concrete de iterații, cu o convenție de pornire scrisă
 * explicit: pentru o rădăcină `c`, metodele cu două valori inițiale pornesc din
 * `[[c], [c]+1]`, cele cu una singură din `[c]+1`, iar toleranța e `10⁻¹⁵`.
 * Asta e cea mai tare verificare disponibilă pentru pagina 6: nu compară cu
 * intuiția, ci cu cifre tipărite.
 *
 * | Funcție         | Bisecție | Secantă | Tangentă |
 * |-----------------|----------|---------|----------|
 * | 0,25·eˣ − 2     | 48       | 7       | 7        |
 * | 3·cos(x) − 4x   | 50       | 7       | 5        |
 * | x² − 2          | 49       | 7       | 6        |
 * | ln(x) − 2       | 46       | 6       | 4        |
 * | x² + √x − 6     | 48       | 7       | 5        |
 */
import * as bisectie from "../../src/algorithms/ecuatii-neliniare/bisectie.ts";
import * as newton from "../../src/algorithms/ecuatii-neliniare/newton.ts";
import * as secanta from "../../src/algorithms/ecuatii-neliniare/secanta.ts";
import { getFunctie } from "../../src/algorithms/functii.ts";

const TOL = 1e-15;
const MAX = 200;

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

/** Rândurile tabelului, în ordinea din curs. */
const TABEL = [
  { id: "exponential", bisectie: 48, secanta: 7, newton: 7 },
  { id: "cosinus", bisectie: 50, secanta: 7, newton: 5 },
  { id: "patrat-minus-doi", bisectie: 49, secanta: 7, newton: 6 },
  { id: "logaritm", bisectie: 46, secanta: 6, newton: 4 },
  { id: "radical", bisectie: 48, secanta: 7, newton: 5 },
];

console.log("=== Secanta: numărul de iterații din tabelul cursului ===\n");
for (const rand of TABEL) {
  const fn = getFunctie(rand.id);
  const c = Math.floor(fn.radacina);
  const r = secanta.run({ functie: fn.id, x0: c, x1: c + 1, tol: TOL, maxIteratii: MAX });
  verifica(
    `${fn.eticheta.padEnd(14)} din [${c}, ${c + 1}]`,
    r.pasi.length === rand.secanta,
    `curs ${rand.secanta}, noi ${r.pasi.length} (${r.stare})`,
  );
}

/**
 * Tangenta: modulul nostru trebuie să dea exact ce dă Algorithm 2 transcris
 * literal.
 *
 * **Nu** comparăm cu tabelul, fiindcă tabelul se abate de la propriul algoritm
 * al cursului pe două rânduri (vezi `docs/erata-cursuri.md`). Referința
 * corectă e algoritmul, nu cifra tipărită lângă el.
 */
console.log("\n=== Tangenta: modulul == Algorithm 2 transcris literal ===\n");
for (const rand of TABEL) {
  const fn = getFunctie(rand.id);
  const c = Math.floor(fn.radacina);

  let x = c + 1;
  let literal = 0;
  for (let i = 1; i <= MAX; i++) {
    literal = i;
    const xprev = x;
    x = x - fn.f(x) / fn.fDerivat(x);
    if (Math.abs(x - xprev) < TOL) break;
  }

  const r = newton.run({ functie: fn.id, x0: c + 1, tol: TOL, maxIteratii: MAX });
  verifica(
    `${fn.eticheta.padEnd(14)} din ${c + 1}`,
    r.pasi.length === literal,
    `algoritm ${literal}, noi ${r.pasi.length}` +
      (literal === rand.newton ? "" : `; tabelul cursului spune ${rand.newton} — vezi erata`),
  );
}

/**
 * Bisecția: criteriul nostru e `b − a < tol`, primul din lista cursului, nu
 * `|f(c)| > tol` din Algorithm 1. Pe un interval de lungime 1 asta dă un număr
 * previzibil de pași — `⌈log₂(1/tol)⌉` — și tocmai previzibilitatea e motivul
 * pentru care l-am ales.
 */
console.log("\n=== Bisecția: criteriul ales dă numărul garantat de pași ===\n");
for (const rand of TABEL) {
  const fn = getFunctie(rand.id);
  const c = Math.floor(fn.radacina);
  const r = bisectie.run({ functie: fn.id, a: c, b: c + 1, tol: TOL, maxIteratii: MAX });
  const asteptat = Math.ceil(Math.log2(1 / TOL));
  verifica(
    `${fn.eticheta.padEnd(14)} din [${c}, ${c + 1}]`,
    // Un pas în minus e legitim: lângă rădăcini mari (e² ≈ 7,39) pasul dintre
    // două numere reprezentabile e ~8,9·10⁻¹⁶, deci intervalul ajunge la zero
    // înainte să mai poată fi înjumătățit o dată.
    r.pasi.length === asteptat || r.pasi.length === asteptat - 1,
    `formula dă ${asteptat}, noi ${r.pasi.length}; tabelul cursului, cu alt criteriu, ${rand.bisectie}`,
  );
}

console.log("\n=== Concluzia calitativă din curs: tangenta ≤ secanta ===\n");
for (const rand of TABEL) {
  const fn = getFunctie(rand.id);
  const c = Math.floor(fn.radacina);
  const t = newton.run({ functie: fn.id, x0: c + 1, tol: TOL, maxIteratii: MAX });
  const s = secanta.run({ functie: fn.id, x0: c, x1: c + 1, tol: TOL, maxIteratii: MAX });
  verifica(
    `${fn.eticheta.padEnd(14)} tangentă ≤ secantă`,
    t.pasi.length <= s.pasi.length,
    `tangentă ${t.pasi.length}, secantă ${s.pasi.length}`,
  );
}

console.log(picate === 0 ? "\n✓ toate verificările trec" : `\n✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);
