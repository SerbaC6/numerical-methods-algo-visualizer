/**
 * Verificarea lupei care urmărește metoda (`src/lib/plot-urmarire.ts`).
 *
 * Nu e matematică din curs, dar e matematică pe care o vede utilizatorul: dacă
 * lupa greșește, banda iese din cadru sau se face invizibilă, adică exact bugul
 * de la care s-a pornit. Se verifică pe pașii **reali** ai bisecției, nu pe
 * numere inventate.
 */
import { run } from "../../src/algorithms/ecuatii-neliniare/bisectie.ts";
import * as newton from "../../src/algorithms/ecuatii-neliniare/newton.ts";
import { getFunctie } from "../../src/algorithms/functii.ts";
import { NIVEL_MAXIM, PRAG_STRAMT, nivelUrmarire, urmareste } from "../../src/lib/plot-urmarire.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

const fn = getFunctie("cub");
const [a0, b0] = fn.interval;
const marja = (b0 - a0) * 0.08;
const baza: readonly [number, number] = [a0 - marja, b0 + marja];

const rezultat = run({ functie: fn.id, a: a0, b: b0, tol: 1e-10, maxIteratii: 60 });

console.log(`=== Bisecția pe ${fn.eticheta}: ${rezultat.pasi.length} pași ===`);

console.log("\n=== 1. Cadrul stă pe loc cât timp banda e destul de lată ===");
{
  const primul = urmareste(baza, [rezultat.pasi[0]!.interval!.a, rezultat.pasi[0]!.interval!.b]);
  verifica("la primul pas nu se apropie", primul.nivel === 0, `nivel ${primul.nivel}`);
}

console.log("\n=== 2. Banda rămâne vizibilă la fiecare pas ===");
{
  let minim = Number.POSITIVE_INFINITY;
  let pasulMinim = 0;
  for (const pas of rezultat.pasi) {
    const zona: readonly [number, number] = [pas.interval!.a, pas.interval!.b];
    const { domeniu } = urmareste(baza, zona);
    const fractiune = (zona[1] - zona[0]) / (domeniu[1] - domeniu[0]);
    if (fractiune < minim) {
      minim = fractiune;
      pasulMinim = pas.iteratie;
    }
  }
  verifica(
    "nicăieri sub pragul de vizibilitate",
    minim >= PRAG_STRAMT - 1e-12,
    `minimul e ${(minim * 100).toFixed(1)}% din cadru, la pasul ${pasulMinim}; pragul e ${(PRAG_STRAMT * 100).toFixed(0)}%`,
  );
  // Fără lupă, la ultimul pas banda ar fi fost cât o fracțiune de pixel.
  const ultim = rezultat.pasi.at(-1)!;
  const faraLupa = (ultim.interval!.b - ultim.interval!.a) / (baza[1] - baza[0]);
  verifica(
    "fără lupă, ultimul pas ar fi fost invizibil",
    faraLupa * 700 < 1,
    `${(faraLupa * 700).toFixed(4)} px pe un grafic lat de 700`,
  );
}

console.log("\n=== 3. Banda e întotdeauna înăuntrul cadrului ===");
{
  const toate = rezultat.pasi.every((pas) => {
    const zona: readonly [number, number] = [pas.interval!.a, pas.interval!.b];
    const { domeniu } = urmareste(baza, zona);
    return domeniu[0] <= zona[0] + 1e-12 && zona[1] <= domeniu[1] + 1e-12;
  });
  verifica("niciun capăt nu iese din cadru", toate);
}

console.log("\n=== 4. Cadrul nu se depărtează niciodată ===");
{
  let latimeAnterioara = Number.POSITIVE_INFINITY;
  let monoton = true;
  for (const pas of rezultat.pasi) {
    const { domeniu } = urmareste(baza, [pas.interval!.a, pas.interval!.b]);
    const latime = domeniu[1] - domeniu[0];
    if (latime > latimeAnterioara + 1e-12) monoton = false;
    latimeAnterioara = latime;
  }
  verifica("lățimea cadrului scade monoton", monoton);
}

console.log("\n=== 5. Apropierea vine pe trepte, nu la fiecare pas ===");
{
  const niveluri = rezultat.pasi.map(
    (pas) => urmareste(baza, [pas.interval!.a, pas.interval!.b]).nivel,
  );
  const salturi = niveluri.filter((n, i) => i > 0 && n !== niveluri[i - 1]).length;
  verifica(
    "mai puține salturi decât pași",
    salturi < niveluri.length / 2,
    `${salturi} salturi în ${niveluri.length} pași; niveluri: ${niveluri.join("")}`,
  );
}

console.log("\n=== 6. Cadrul nu iese din domeniul pe care funcția există ===");
{
  const ln = getFunctie("logaritm");
  const limita = ln.domeniuValid!;
  const { domeniu } = urmareste([0.05, 12], [0.05, 0.06], limita);
  verifica(
    "logaritmul nu se desenează sub domeniul lui",
    domeniu[0] >= limita[0] - 1e-12,
    `stânga ${domeniu[0]}`,
  );
}

console.log("\n=== 7. Merge și pe o metodă cu salturi neregulate (Newton) ===");
{
  const r = newton.run({ functie: fn.id, x0: 3, tol: 1e-12, maxIteratii: 40 });
  const bun = r.pasi.every((pas) => {
    const puncte = [pas.x, pas.xAnterior!].sort((p, q) => p - q) as [number, number];
    if (puncte[0] === puncte[1]) return true;
    const { domeniu } = urmareste(baza, puncte);
    return domeniu[0] <= puncte[0] + 1e-12 && puncte[1] <= domeniu[1] + 1e-12;
  });
  verifica("saltul fiecărui pas încape în cadru", bun, `${r.pasi.length} pași`);
}

console.log("\n=== 8. Cazurile-limită nu blochează bucla ===");
{
  verifica(
    "zonă de lungime zero → nivelul maxim, nu buclă infinită",
    nivelUrmarire(1, 0) === NIVEL_MAXIM,
  );
  verifica("cadru de lungime zero → nu se apropie", nivelUrmarire(0, 1) === 0);
  verifica("zonă mai lată decât cadrul → nu se apropie", nivelUrmarire(1, 5) === 0);
}

console.log(picate === 0 ? "\n✓ toate verificările trec" : `\n✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);
