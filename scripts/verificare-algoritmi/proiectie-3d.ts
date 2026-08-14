/**
 * Verificarea proiecției 3D (`src/lib/proiectie-3d.ts`).
 *
 * Nu e matematică din curs, dar e matematică pe care o vede utilizatorul, și
 * două dintre afirmațiile de aici sunt purtătoare de sarcină pentru pagina 7:
 *
 * 1. **ordinea painter e exactă** — dacă nu e, suprafața se desenează pe dos și
 *    valea arată ca un ghem de fețe;
 * 2. **unghiul drept se citește drept doar din privirea de sus** — de asta
 *    există butonul respectiv, iar dacă cineva „optimizează" scara ca să
 *    normalizeze fiecare axă separat, afirmația didactică a paginii se rupe
 *    tăcut.
 *
 * Se rulează cu `bash scripts/verificare-algoritmi/ruleaza.sh`.
 */
import {
  CAMERA_IMPLICITA,
  ELEVATIE_ESTOMPARE,
  ELEVATIE_MAXIMA,
  ELEVATIE_MINIMA,
  bazaCamerei,
  creeazaProiectie,
  inCutieXY,
  normalizeazaCamera,
  opacitateSuprafata,
  poliliniiTaiate,
  taieLaCutie,
  ordineCelule,
  roteste,
} from "../../src/lib/proiectie-3d.ts";
import type { Camera, Cutie, Punct3 } from "../../src/lib/proiectie-3d.ts";
import type { Cadru } from "../../src/lib/plot-scara.ts";

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

const ZONA: Cadru = { stanga: 0, dreapta: 800, sus: 0, jos: 520 };
const CUTIE: Cutie = { x: [-2, 3], y: [-1, 4], z: [-1.5, 6] };
const EXAGERARE = 0.55;

const scalar = (a: Punct3, b: Punct3) => a.x * b.x + a.y * b.y + a.z * b.z;

function camereAleatoare(cate: number, samanta: number): Camera[] {
  const rnd = aleator(samanta);
  return Array.from({ length: cate }, () =>
    normalizeazaCamera({
      azimut: rnd() * 2 * Math.PI,
      elevatie: ELEVATIE_MINIMA + rnd() * (ELEVATIE_MAXIMA - ELEVATIE_MINIMA),
    }),
  );
}

console.log("=== 1. Proiecția e liniară (adică e ortografică, nu în perspectivă) ===");
{
  // Certificatul că nu s-a strecurat o împărțire cu adâncimea: dacă s-ar fi
  // strecurat, elipsele de nivel n-ar mai fi elipse și tot `curbe-de-nivel.ts`
  // ar deveni o aproximare nedeclarată.
  const rnd = aleator(11);
  let maxAbatere = 0;
  for (const cam of camereAleatoare(300, 7)) {
    const proi = creeazaProiectie(cam, CUTIE, ZONA, EXAGERARE);
    const o: Punct3 = { x: 0, y: 0, z: 0 };
    const a: Punct3 = { x: rnd() * 4 - 2, y: rnd() * 4 - 2, z: rnd() * 4 - 2 };
    const b: Punct3 = { x: rnd() * 4 - 2, y: rnd() * 4 - 2, z: rnd() * 4 - 2 };

    const pO = proi.laEcran(o);
    const pA = proi.laEcran(a);
    const pB = proi.laEcran(b);
    const pAB = proi.laEcran({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });

    maxAbatere = Math.max(
      maxAbatere,
      Math.abs(pAB.x - pO.x - (pA.x - pO.x) - (pB.x - pO.x)),
      Math.abs(pAB.y - pO.y - (pA.y - pO.y) - (pB.y - pO.y)),
    );
  }
  verifica(
    "aditivitate pe 300 de camere",
    maxAbatere < 1e-9,
    `abatere maximă ${maxAbatere.toExponential(2)} px`,
  );
}

console.log("\n=== 2. Baza camerei e ortonormată și dreaptă ===");
{
  let maxAbatere = 0;
  let determinantMinim = Number.POSITIVE_INFINITY;
  for (const cam of camereAleatoare(300, 23)) {
    const { dreapta, sus, spre } = bazaCamerei(cam);
    for (const v of [dreapta, sus, spre]) {
      maxAbatere = Math.max(maxAbatere, Math.abs(Math.hypot(v.x, v.y, v.z) - 1));
    }
    maxAbatere = Math.max(
      maxAbatere,
      Math.abs(scalar(dreapta, sus)),
      Math.abs(scalar(dreapta, spre)),
      Math.abs(scalar(sus, spre)),
    );
    // det[dreapta, sus, spre] = dreapta · (sus × spre)
    const cross = {
      x: sus.y * spre.z - sus.z * spre.y,
      y: sus.z * spre.x - sus.x * spre.z,
      z: sus.x * spre.y - sus.y * spre.x,
    };
    determinantMinim = Math.min(determinantMinim, scalar(dreapta, cross));
  }
  verifica("ortonormată", maxAbatere < 1e-14, `abatere maximă ${maxAbatere.toExponential(2)}`);
  verifica("triedru drept (det = +1)", Math.abs(determinantMinim - 1) < 1e-14);
}

console.log("\n=== 3. Adâncimea crește cu z, la orice elevație permisă ===");
{
  // Garanția „un punct de pe suprafață e mereu în fața umbrei lui de pe podea".
  let ok = true;
  for (const cam of camereAleatoare(200, 41)) {
    const proi = creeazaProiectie(cam, CUTIE, ZONA, EXAGERARE);
    const jos = proi.laEcran({ x: 0.5, y: 1.2, z: CUTIE.z[0] });
    const sus = proi.laEcran({ x: 0.5, y: 1.2, z: CUTIE.z[1] });
    if (!(sus.adancime > jos.adancime)) ok = false;
  }
  verifica("suprafața e mereu în fața umbrei", ok);
}

console.log("\n=== 4. Liniile de cădere sunt paralele pe ecran ===");
{
  // Motivul 2 pentru care camera nu e în perspectivă: legătura punct ↔ umbră se
  // citește fiindcă toate căderile au aceeași direcție pe ecran.
  const rnd = aleator(59);
  let maxUnghi = 0;
  for (const cam of camereAleatoare(200, 67)) {
    const proi = creeazaProiectie(cam, CUTIE, ZONA, EXAGERARE);
    const directii: { x: number; y: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const x = -2 + rnd() * 5;
      const y = -1 + rnd() * 5;
      const a = proi.laEcran({ x, y, z: CUTIE.z[0] });
      const b = proi.laEcran({ x, y, z: 1 + rnd() * 4 });
      directii.push({ x: b.x - a.x, y: b.y - a.y });
    }
    const d0 = directii[0]!;
    for (const d of directii.slice(1)) {
      const cos = (d0.x * d.x + d0.y * d.y) / (Math.hypot(d0.x, d0.y) * Math.hypot(d.x, d.y));
      maxUnghi = Math.max(maxUnghi, Math.acos(Math.min(1, Math.max(-1, cos))));
    }
  }
  verifica(
    "aceeași direcție pentru toate căderile",
    maxUnghi < 1e-9,
    `abatere ${(maxUnghi / Math.PI) * 180} °`,
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Ordinea painter, testată cu raze
// ────────────────────────────────────────────────────────────────────────────

const N = 8;

/** Un teren zimțat pe grila (N+1)×(N+1), peste pătratul unitate. */
function teren(samanta: number): number[][] {
  const rnd = aleator(samanta);
  return Array.from({ length: N + 1 }, () => Array.from({ length: N + 1 }, () => rnd() * 1.4));
}

function varf(h: number[][], i: number, j: number): Punct3 {
  return { x: i / N, y: j / N, z: h[i]![j]! };
}

/**
 * Intersecția razei cu un triunghi, în coordonate de cameră.
 *
 * Raza e mulțimea `u·dreapta + v·sus + t·spre`, deci în baza camerei ea are
 * coordonatele (u, v) fixe și t liber. Un punct al triunghiului e pe rază când
 * proiecțiile lui pe `dreapta` și `sus` cad în (u, v) — adică e o problemă 2D de
 * „punctul e în triunghi", rezolvată cu coordonate baricentrice. `t` iese apoi
 * din interpolare. Nu e nevoie de Möller–Trumbore: sub proiecție ortografică
 * problema chiar e plană.
 */
function loveste(
  tri: [Punct3, Punct3, Punct3],
  u: number,
  v: number,
  baza: ReturnType<typeof bazaCamerei>,
): number | null {
  const p = tri.map((w) => ({
    u: scalar(w, baza.dreapta),
    v: scalar(w, baza.sus),
    t: scalar(w, baza.spre),
  }));
  const [a, b, c] = p as [(typeof p)[0], (typeof p)[0], (typeof p)[0]];

  const det = (b.u - a.u) * (c.v - a.v) - (c.u - a.u) * (b.v - a.v);
  if (Math.abs(det) < 1e-15) return null;

  const l1 = ((u - a.u) * (c.v - a.v) - (c.u - a.u) * (v - a.v)) / det;
  const l2 = ((b.u - a.u) * (v - a.v) - (u - a.u) * (b.v - a.v)) / det;
  const l0 = 1 - l1 - l2;
  const eps = 1e-9;
  if (l0 < eps || l1 < eps || l2 < eps) return null;

  return l0 * a.t + l1 * b.t + l2 * c.t;
}

/**
 * Câte raze contrazic o ordine de desenare.
 *
 * Pentru fiecare rază, celula cu adâncimea cea mai mare (cea mai apropiată de
 * ochi) trebuie să fie **ultima desenată** dintre celulele lovite — altfel o
 * celulă din spate ar fi pictată peste ea.
 */
function razeGresite(h: number[][], cam: Camera, ordine: Int32Array, cateRaze: number): number {
  const baza = bazaCamerei(cam);
  const pozitie = new Int32Array(N * N);
  ordine.forEach((celula, indice) => {
    pozitie[celula] = indice;
  });

  // Extinderea pătratului unitate în coordonate de ecran.
  let uMin = Infinity;
  let uMax = -Infinity;
  let vMin = Infinity;
  let vMax = -Infinity;
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const w = varf(h, i, j);
      const u = scalar(w, baza.dreapta);
      const v = scalar(w, baza.sus);
      uMin = Math.min(uMin, u);
      uMax = Math.max(uMax, u);
      vMin = Math.min(vMin, v);
      vMax = Math.max(vMax, v);
    }
  }

  const rnd = aleator(1237);
  let gresite = 0;
  for (let r = 0; r < cateRaze; r++) {
    const u = uMin + rnd() * (uMax - uMin);
    const v = vMin + rnd() * (vMax - vMin);

    let celulaCeaMaiAproape = -1;
    let adancimeMaxima = -Infinity;
    let ultimaDesenata = -1;
    let celulaUltimaDesenata = -1;

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const p00 = varf(h, i, j);
        const p10 = varf(h, i + 1, j);
        const p11 = varf(h, i + 1, j + 1);
        const p01 = varf(h, i, j + 1);
        const t = loveste([p00, p10, p11], u, v, baza) ?? loveste([p00, p11, p01], u, v, baza);
        if (t === null) continue;

        const celula = i * N + j;
        if (t > adancimeMaxima) {
          adancimeMaxima = t;
          celulaCeaMaiAproape = celula;
        }
        const poz = pozitie[celula]!;
        if (poz > ultimaDesenata) {
          ultimaDesenata = poz;
          celulaUltimaDesenata = celula;
        }
      }
    }

    if (celulaCeaMaiAproape >= 0 && celulaCeaMaiAproape !== celulaUltimaDesenata) gresite++;
  }
  return gresite;
}

/** Varianta greșită, ținută dinadins: sortare după adâncimea centrului celulei. */
function ordineDupaAdancime(h: number[][], cam: Camera): Int32Array {
  const baza = bazaCamerei(cam);
  const chei = new Float64Array(N * N);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const z = (h[i]![j]! + h[i + 1]![j]! + h[i + 1]![j + 1]! + h[i]![j + 1]!) / 4;
      chei[i * N + j] = scalar({ x: (i + 0.5) / N, y: (j + 0.5) / N, z }, baza.spre);
    }
  }
  return Int32Array.from(
    Array.from({ length: N * N }, (_, k) => k).sort((a, b) => (chei[a] ?? 0) - (chei[b] ?? 0)),
  );
}

console.log("\n=== 5. Ordinea painter (proiecția orizontală) e exactă ===");
{
  let total = 0;
  let gresite = 0;
  for (const [indice, cam] of camereAleatoare(40, 97).entries()) {
    const h = teren(500 + indice);
    const ordine = ordineCelule(N, cam.azimut);
    gresite += razeGresite(h, cam, ordine, 120);
    total += 120;
  }
  verifica("zero raze contrazise", gresite === 0, `${gresite} din ${total} de raze`);
}

console.log("\n=== 6. Test de non-regresie: sortarea după adâncime TREBUIE să pice ===");
{
  // Dacă rândul de mai jos ajunge vreodată „OK", înseamnă că cineva a schimbat
  // criteriul din `ordineCelule` înapoi la cel intuitiv și greșit.
  let total = 0;
  let gresite = 0;
  for (const [indice, cam] of camereAleatoare(40, 97).entries()) {
    const h = teren(500 + indice);
    gresite += razeGresite(h, cam, ordineDupaAdancime(h, cam), 120);
    total += 120;
  }
  const procent = (gresite / total) * 100;
  verifica(
    "criteriul intuitiv chiar greșește",
    gresite > 0,
    `${gresite} din ${total} de raze (${procent.toFixed(1)} %) — de asta nu se folosește`,
  );
}

console.log("\n=== 7. Unghiul drept se citește drept numai din privirea de sus ===");
{
  // Două direcții perpendiculare în planul soluțiilor, exact ca doi pași
  // consecutivi de coborâre (`⟨r⁽ᵏ⁾, r⁽ᵏ⁺¹⁾⟩ = 0`).
  const centru: Punct3 = { x: 0.5, y: 1.5, z: 2 };
  const masoara = (cam: Camera) => {
    const proi = creeazaProiectie(cam, CUTIE, ZONA, EXAGERARE);
    const o = proi.laEcran(centru);
    const a = proi.laEcran({ x: centru.x + 1, y: centru.y, z: centru.z });
    const b = proi.laEcran({ x: centru.x, y: centru.y + 1, z: centru.z });
    const u = { x: a.x - o.x, y: a.y - o.y };
    const v = { x: b.x - o.x, y: b.y - o.y };
    const cos = (u.x * v.x + u.y * v.y) / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y));
    return (Math.acos(Math.min(1, Math.max(-1, cos))) / Math.PI) * 180;
  };

  let maxAbatere = 0;
  for (let g = 0; g < 24; g++) {
    const unghi = masoara({ azimut: (g * 15 * Math.PI) / 180, elevatie: ELEVATIE_MAXIMA });
    maxAbatere = Math.max(maxAbatere, Math.abs(unghi - 90));
  }
  verifica(
    "la elevație 90° unghiul e 90°, la orice azimut",
    maxAbatere < 1e-9,
    `abatere maximă ${maxAbatere.toExponential(2)}°`,
  );

  const oblic = masoara(CAMERA_IMPLICITA);
  verifica(
    "la unghiul implicit NU e 90° — de asta există privirea de sus",
    Math.abs(oblic - 90) > 5,
    `se citește ${oblic.toFixed(1)}° pentru un unghi real de 90°`,
  );
}

console.log("\n=== 8. Scara nu depinde de azimut (scena nu respiră la rotire) ===");
{
  let minim = Number.POSITIVE_INFINITY;
  let maxim = 0;
  for (let g = 0; g < 36; g++) {
    const proi = creeazaProiectie(
      { azimut: (g * 10 * Math.PI) / 180, elevatie: CAMERA_IMPLICITA.elevatie },
      CUTIE,
      ZONA,
      EXAGERARE,
    );
    minim = Math.min(minim, proi.scara);
    maxim = Math.max(maxim, proi.scara);
  }
  verifica(
    "aceeași scară pe toată tura",
    maxim - minim < 1e-9,
    `între ${minim.toFixed(4)} și ${maxim.toFixed(4)}`,
  );
}

console.log("\n=== 9. Rotirea respectă limitele ===");
{
  let cam = CAMERA_IMPLICITA;
  for (let i = 0; i < 400; i++) cam = roteste(cam, 7, -9);
  verifica(
    "elevația nu trece de 90°",
    cam.elevatie <= ELEVATIE_MAXIMA + 1e-12,
    `${((cam.elevatie / Math.PI) * 180).toFixed(2)}°`,
  );
  verifica("azimutul rămâne într-o tură", cam.azimut >= 0 && cam.azimut < 2 * Math.PI);

  let jos = CAMERA_IMPLICITA;
  for (let i = 0; i < 400; i++) jos = roteste(jos, -7, 9);
  verifica(
    "elevația nu coboară sub prag",
    jos.elevatie >= ELEVATIE_MINIMA - 1e-12,
    `${((jos.elevatie / Math.PI) * 180).toFixed(2)}°`,
  );
}

console.log("\n=== 10. Suprafața se dă la o parte exact la privirea de sus ===");
{
  // Afirmația pe care o susține: la 90° harta de nivel se vede **întreagă**,
  // fiindcă mesh-ul nu mai e acolo deloc. Dacă valoarea de la capăt ar fi doar
  // „mică", elipsele s-ar citi prin ceață, iar unghiul drept — cu ezitare.
  verifica("1 la elevația minimă", opacitateSuprafata(ELEVATIE_MINIMA) === 1);
  verifica("1 la unghiul implicit", opacitateSuprafata(CAMERA_IMPLICITA.elevatie) === 1);
  verifica("1 fix la prag", opacitateSuprafata(ELEVATIE_ESTOMPARE) === 1);
  verifica("0 fix la 90°", opacitateSuprafata(ELEVATIE_MAXIMA) === 0);

  // Monotonie și continuitate pe toată maneta: suprafața nu are voie să
  // reapară pe drum, nici să sară dintr-un cadru în altul sub deget.
  const pasi = 20000;
  let monotona = true;
  let saltMaxim = 0;
  let anterior = opacitateSuprafata(0);
  for (let i = 1; i <= pasi; i++) {
    const e = (ELEVATIE_MAXIMA * i) / pasi;
    const acum = opacitateSuprafata(e);
    if (acum > anterior + 1e-15) monotona = false;
    saltMaxim = Math.max(saltMaxim, Math.abs(acum - anterior));
    anterior = acum;
  }
  verifica("nu crește niciodată", monotona);
  verifica("fără salt", saltMaxim < 1e-3, `salt maxim ${saltMaxim.toExponential(2)}`);

  // Chiar scade: o funcție constantă ar trece testele de mai sus.
  const mijloc = (ELEVATIE_ESTOMPARE + ELEVATIE_MAXIMA) / 2;
  verifica(
    "la jumătatea trecerii e pe la jumătate",
    Math.abs(opacitateSuprafata(mijloc) - 0.5) < 1e-12,
    opacitateSuprafata(mijloc).toFixed(6),
  );
}

console.log("\n=== 11. Tăierea drumului la fereastra scenei ===");
{
  // De ce contează: când lupa se apropie, iterațiile de la începutul rulării ies
  // din cutie, iar proiecția fiind liniară ele nu ajung „undeva lângă", ci la
  // milioane de pixeli. Segmentul până acolo traversează scena și se vede ca o
  // linie venită din afară — bugul raportat. Tăierea trebuie să fie **exactă**:
  // capetele tăiate trebuie să stea chiar pe segmentul original.
  const rnd = aleator(131);
  let peSegment = 0;
  let inafara = 0;
  let taiate = 0;

  for (let i = 0; i < 50000; i++) {
    const a: Punct3 = { x: rnd() * 12 - 6, y: rnd() * 12 - 6, z: rnd() * 8 - 4 };
    const b: Punct3 = { x: rnd() * 12 - 6, y: rnd() * 12 - 6, z: rnd() * 8 - 4 };
    const rezultat = taieLaCutie(a, b, CUTIE);
    if (!rezultat) continue;
    taiate++;

    for (const p of rezultat) {
      // Coliniaritate: (p − a) × (b − a) = 0 pe x și pe y, plus z interpolat cu
      // același parametru.
      const abatere = Math.abs((p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x));
      const scara = Math.max(1, Math.abs(b.x - a.x) + Math.abs(b.y - a.y));
      if (abatere / scara > 1e-9) peSegment++;
      if (!inCutieXY(p, CUTIE, 1e-9)) inafara++;
    }
  }
  verifica("capetele tăiate stau pe segmentul original", peSegment === 0, `${taiate} segmente`);
  verifica("capetele tăiate sunt în cutie", inafara === 0);

  // Un segment întreg înăuntru nu se atinge, unul întreg în afară dispare.
  const inauntru = taieLaCutie({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }, CUTIE);
  verifica(
    "segmentul dinăuntru rămâne neatins",
    inauntru !== null &&
      inauntru[0].x === 0 &&
      inauntru[0].y === 0 &&
      inauntru[1].x === 1 &&
      inauntru[1].y === 1,
  );
  verifica(
    "segmentul din afară dispare de tot",
    taieLaCutie({ x: 20, y: 20, z: 0 }, { x: 30, y: 25, z: 1 }, CUTIE) === null,
  );

  // Tăierea pe **z**, adăugată după ce s-a văzut pe ecran: un `x⁽⁰⁾` rămas în
  // afara cadrului după o apropiere a lupei are `f` uriaș, iar segmentul până la
  // el urca vertical prin aer, pe lângă o suprafață care nu ajunge acolo.
  {
    const inalt = taieLaCutie({ x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 400 }, CUTIE);
    verifica(
      "segmentul care iese prin tavan se taie la tavan",
      inalt !== null && Math.abs(inalt[1].z - CUTIE.z[1]) < 1e-9,
      inalt ? `z tăiat la ${inalt[1].z}` : "tăiat de tot",
    );
    const cuMarja = taieLaCutie({ x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 400 }, CUTIE, 0.5);
    verifica(
      "marja ridică tavanul exact cu cât i se cere",
      cuMarja !== null && Math.abs(cuMarja[1].z - (CUTIE.z[1] + 0.5)) < 1e-9,
    );
    verifica(
      "segmentul de deasupra cutiei dispare de tot",
      taieLaCutie({ x: 0, y: 1, z: 100 }, { x: 1, y: 2, z: 200 }, CUTIE) === null,
    );
  }

  // Un drum care iese și intră înapoi trebuie să dea DOUĂ bucăți, nu una: unite,
  // ele ar fi legate printr-o linie exact peste porțiunea tăiată.
  const dus: Punct3[] = [
    { x: 0, y: 0, z: 0 },
    { x: 50, y: 0, z: 0 },
    { x: 50, y: 2, z: 0 },
    { x: 0, y: 2, z: 0 },
  ];
  const bucati = poliliniiTaiate(dus, CUTIE);
  verifica(
    "ieșirea și întoarcerea dau două bucăți",
    bucati.length === 2,
    `${bucati.length} bucăți`,
  );
  verifica(
    "toate punctele bucăților sunt în cutie",
    bucati.every((b) => b.every((p) => inCutieXY(p, CUTIE, 1e-9))),
  );

  // Un drum care stă tot înăuntru rămâne o singură bucată, cu toate punctele.
  const scurt: Punct3[] = [
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 1, z: 1 },
    { x: 2, y: 2, z: 2 },
  ];
  const intreg = poliliniiTaiate(scurt, CUTIE);
  verifica(
    "drumul dinăuntru rămâne o bucată cu toate punctele",
    intreg.length === 1 && intreg[0]!.length === scurt.length,
  );
}

console.log("\n=== 12. O cutie legitim subțire își păstrează relieful ===");
{
  // Bugul pe care îl prinde: cu un prag absolut (`Math.max(latura, 1e-12)`), o
  // cutie mai subțire decât pragul era înlocuită tăcut cu una de 10⁻¹². La
  // ultimii pași ai coborârii, valea are ~10⁻¹⁶ înălțime pe cadrul vizibil, deci
  // se desena ca un plan gol — deși forma ei e aceeași la orice scară.
  //
  // Proprietatea cerută: scena e **invariantă la scară**. Aceeași cutie,
  // micșorată de 10¹⁰ ori pe toate axele, trebuie să dea exact aceleași pixeli.
  const mare: Cutie = { x: [-1, 1], y: [-1, 1], z: [0, 2] };
  const proiMare = creeazaProiectie(CAMERA_IMPLICITA, mare, ZONA, EXAGERARE);

  let abatereMaxima = 0;
  for (const factor of [1e-4, 1e-8, 1e-12, 1e-16]) {
    const mica: Cutie = {
      x: [-factor, factor],
      y: [-factor, factor],
      z: [0, 2 * factor],
    };
    const proiMica = creeazaProiectie(CAMERA_IMPLICITA, mica, ZONA, EXAGERARE);

    for (const [u, v, w] of [
      [0.5, -0.25, 1.5],
      [-1, 1, 0],
      [1, 1, 2],
    ] as const) {
      const a = proiMare.laEcran({ x: u, y: v, z: w });
      const b = proiMica.laEcran({ x: u * factor, y: v * factor, z: w * factor });
      abatereMaxima = Math.max(abatereMaxima, Math.abs(a.x - b.x), Math.abs(a.y - b.y));
    }
  }
  verifica(
    "aceeași imagine la orice scară a cutiei",
    abatereMaxima < 1e-9,
    `abatere maximă ${abatereMaxima.toExponential(2)} px`,
  );

  // Iar cutia chiar degenerată nu produce NaN.
  const plata: Cutie = { x: [0, 1], y: [0, 1], z: [3, 3] };
  const p = creeazaProiectie(CAMERA_IMPLICITA, plata, ZONA, EXAGERARE).laEcran({
    x: 0.5,
    y: 0.5,
    z: 3,
  });
  verifica("cutia cu înălțime zero nu dă NaN", Number.isFinite(p.x) && Number.isFinite(p.y));
}

console.log(picate === 0 ? "\n✓ proiecția 3D e verificată" : `\n✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);
