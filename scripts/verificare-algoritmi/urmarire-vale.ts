/**
 * Verificarea lupei scenei 3D — `urmarestePatrat` din `src/lib/plot-urmarire.ts`
 * și `src/algorithms/metode-de-gradient/cadru.ts`.
 *
 * De ce se măsoară: cadrul care se apropie e singurul lucru care ține ultimele
 * iterații ale coborârii separate una de alta, dar **o cutie forfecată ar strica
 * exact afirmația desenului**. Sub scară neizotropă, un unghi real de 90° se
 * citește între 58° și 130° după azimut — măsurat în `proiectie-3d.ts`. Deci
 * „latura egală" nu e o preferință de aspect, e condiția ca desenul să nu mintă.
 *
 * Se rulează cu `bash scripts/verificare-algoritmi/ruleaza.sh`.
 */
import { bazaPatrata, cadrulPasului } from "../../src/algorithms/metode-de-gradient/cadru.ts";
import * as conjugat from "../../src/algorithms/metode-de-gradient/conjugat.ts";
import * as descendent from "../../src/algorithms/metode-de-gradient/descendent.ts";
import { SISTEME } from "../../src/algorithms/metode-de-gradient/sisteme.ts";
import type { Vec2 } from "../../src/lib/curbe-de-nivel.ts";
import { PRAG_STRAMT, urmarestePatrat } from "../../src/lib/plot-urmarire.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

/** Generator determinist: o verificare care dă alt rezultat la fiecare rulare nu e o verificare. */
function aleator(samanta: number): () => number {
  let s = samanta >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Cât din latura cadrului trebuie să ocupe măcar săgeata pasului.
 *
 * 2 % dintr-o scenă de ~500 px înseamnă ~10 px: destul cât vârful și coada să
 * fie două puncte distincte, nu unul. Sub atât, iterațiile se suprapun — chiar
 * bugul de la care a pornit lupa.
 */
const PRAG_PAS = 0.02;

const BAZA_X: [number, number] = [-3, 5];
const BAZA_Y: [number, number] = [1, 9];

console.log("=== 1. Cutia rămâne pătrată, la orice zonă de interes ===");
{
  const rnd = aleator(17);
  let abatereMaxima = 0;
  for (let i = 0; i < 20000; i++) {
    // Zone de toate mărimile, de la cât cutia întreagă până la 10⁻¹⁰.
    const marime = 8 * 10 ** (-10 * rnd());
    const cx = BAZA_X[0] + rnd() * (BAZA_X[1] - BAZA_X[0]);
    const cy = BAZA_Y[0] + rnd() * (BAZA_Y[1] - BAZA_Y[0]);
    // Zonă alungită dinadins: pe ea s-ar rupe o lupă care tratează axele separat.
    const zonaX: [number, number] = [cx - marime / 2, cx + marime / 2];
    const zonaY: [number, number] = [cy - marime / 20, cy + marime / 20];

    const c = urmarestePatrat(BAZA_X, BAZA_Y, zonaX, zonaY);
    const latimeX = c.x[1] - c.x[0];
    const latimeY = c.y[1] - c.y[0];
    abatereMaxima = Math.max(abatereMaxima, Math.abs(latimeX - latimeY) / latimeX);
  }
  verifica(
    "aceeași latură pe x și pe y",
    abatereMaxima < 1e-12,
    `abatere relativă maximă ${abatereMaxima.toExponential(2)}`,
  );
}

console.log("\n=== 2. Cadrul cuprinde zona de interes și nu iese din bază ===");
{
  const rnd = aleator(53);
  let cuprinde = true;
  let inauntru = true;
  for (let i = 0; i < 20000; i++) {
    const marime = 8 * 10 ** (-6 * rnd());
    const cx = BAZA_X[0] + rnd() * (BAZA_X[1] - BAZA_X[0]);
    const cy = BAZA_Y[0] + rnd() * (BAZA_Y[1] - BAZA_Y[0]);
    // Zona se ține în bază — așa e și în realitate: e făcută din puncte ale rulării.
    const zonaX: [number, number] = [
      Math.max(BAZA_X[0], cx - marime / 2),
      Math.min(BAZA_X[1], cx + marime / 2),
    ];
    const zonaY: [number, number] = [
      Math.max(BAZA_Y[0], cy - marime / 4),
      Math.min(BAZA_Y[1], cy + marime / 4),
    ];

    const c = urmarestePatrat(BAZA_X, BAZA_Y, zonaX, zonaY);
    const eps = 1e-9;
    if (c.x[0] > zonaX[0] + eps || c.x[1] < zonaX[1] - eps) cuprinde = false;
    if (c.y[0] > zonaY[0] + eps || c.y[1] < zonaY[1] - eps) cuprinde = false;
    if (c.x[0] < BAZA_X[0] - eps || c.x[1] > BAZA_X[1] + eps) inauntru = false;
    if (c.y[0] < BAZA_Y[0] - eps || c.y[1] > BAZA_Y[1] + eps) inauntru = false;
  }
  verifica("zona de interes încape întreagă în cadru", cuprinde);
  verifica("cadrul nu iese din cutia de bază", inauntru);
}

console.log("\n=== 3. Treapta nu scade când zona se strânge ===");
{
  // Altfel cadrul ar oscila: s-ar apropia la un pas și s-ar depărta la
  // următorul, deși metoda merge într-o singură direcție.
  let monotona = true;
  let anterior = 0;
  for (let i = 0; i <= 4000; i++) {
    const marime = 8 * 10 ** (-3 * (i / 4000));
    const c = urmarestePatrat(BAZA_X, BAZA_Y, [0, marime], [4, 4 + marime]);
    if (c.nivel < anterior) monotona = false;
    anterior = c.nivel;
  }
  verifica("treapta crește monoton cât zona se strânge", monotona, `ajunge la nivelul ${anterior}`);
}

console.log("\n=== 4. Pe rulările reale, pasul rămâne vizibil la fiecare iterație ===");
{
  // Chiar bugul din care s-a născut lupa: pe valea alungită, la ultimele
  // iterații, pasul are sub un procent din cadru și punctele se suprapun.
  for (const sistem of SISTEME) {
    const v = sistem.valori;
    const p = {
      A: [v.a11, v.a12, v.a22] as [number, number, number],
      b: [v.b1, v.b2] as Vec2,
      x0: [v.x01, v.x02] as Vec2,
      tol: v.tol,
      maxIteratii: v.maxIteratii,
    };

    for (const [nume, metoda] of [
      ["coborârea", descendent],
      ["conjugatul", conjugat],
    ] as const) {
      const rezultat = metoda.run(p);
      const solutie = rezultat.solutie;
      if (!solutie || rezultat.pasi.length === 0) continue;

      const toate: Vec2[] = [
        rezultat.pasi[0]!.xAnterior,
        ...rezultat.pasi.map((s) => s.x),
        solutie,
      ];
      const baza = bazaPatrata(toate);

      let minimZona = Number.POSITIVE_INFINITY;
      let minimPas = Number.POSITIVE_INFINITY;
      let fara = 0;
      for (const s of rezultat.pasi) {
        const deInteres: Vec2[] = [s.xAnterior, s.x, solutie];
        const cadru = cadrulPasului(baza, deInteres);
        const latura = cadru.x[1] - cadru.x[0];

        // Zona de interes, măsurată exact cum o măsoară lupa: latura mai mare a
        // dreptunghiului care cuprinde `x⁽ᵏ⁻¹⁾`, `x⁽ᵏ⁾` și `x*`.
        const xs = deInteres.map((q) => q[0]);
        const ys = deInteres.map((q) => q[1]);
        const zona = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
        const fractiune = zona / latura;
        minimZona = Math.min(minimZona, fractiune);
        if (fractiune < PRAG_STRAMT) fara++;

        // Și săgeata pasului: dacă ea ajunge de câțiva pixeli, iterațiile se
        // suprapun chiar dacă zona de interes e mare (ținută largă de `x*`).
        minimPas = Math.min(
          minimPas,
          Math.hypot(s.x[0] - s.xAnterior[0], s.x[1] - s.xAnterior[1]) / latura,
        );
      }

      verifica(
        `${sistem.eticheta} — ${nume}`,
        fara === 0 && minimPas >= PRAG_PAS,
        `zona de interes cel puțin ${(minimZona * 100).toFixed(1)} % din cadru, ` +
          `săgeata cel puțin ${(minimPas * 100).toFixed(1)} %` +
          (fara > 0 ? `, ${fara} pași sub prag` : ""),
      );
    }
  }
}

console.log("\n=== 5. Fără apropiere cât timp pasul se vede ===");
{
  // Încadrarea fixă nu e o greșeală de care să scăpăm: ea e cea care arată **că**
  // pașii se scurtează. Primul pas al fiecărei rulări trebuie să stea în cadrul
  // de bază, nemișcat.
  for (const sistem of SISTEME) {
    const v = sistem.valori;
    const p = {
      A: [v.a11, v.a12, v.a22] as [number, number, number],
      b: [v.b1, v.b2] as Vec2,
      x0: [v.x01, v.x02] as Vec2,
      tol: v.tol,
      maxIteratii: v.maxIteratii,
    };
    const rezultat = descendent.run(p);
    const solutie = rezultat.solutie;
    const prim = rezultat.pasi[0];
    if (!solutie || !prim) continue;

    const baza = bazaPatrata([prim.xAnterior, ...rezultat.pasi.map((s) => s.x), solutie]);
    const cadru = cadrulPasului(baza, [prim.xAnterior, prim.x, solutie]);
    verifica(`${sistem.eticheta} — primul pas se vede fără lupă`, cadru.nivel === 0);
  }
}

console.log(picate === 0 ? "\n✓ lupa scenei e verificată" : `\n✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);
