/**
 * Verificarea geometriei grafului orientat — rulează modulul real din `src/`.
 *
 * Nu e matematică din curs, dar e matematică: dacă vârful de săgeată cade sub
 * nod sau cele două sensuri ale unei perechi reciproce se suprapun, desenul
 * spune altceva decât matricea de alături.
 */
import {
  construiesteMuchie,
  construiesteMuchii,
  distanta,
  INDOIRE_IMPLICITA,
  punctPeCurba,
  pozitiiNoduri,
  tangentaLaCurba,
  type Punct,
} from "../../src/lib/graf-orientat.ts";
import { reteaDinCurs } from "../../src/algorithms/pagerank/retea.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

const CENTRU: Punct = { x: 200, y: 200 };
const RAZA_CERC = 140;
const RAZA_NOD = 28;
const noduri = pozitiiNoduri(4, CENTRU, RAZA_CERC);

console.log("=== 1. Nodurile stau pe cerc, primul sus, în sensul acelor de ceas ===");
{
  verifica(
    "toate la aceeași distanță de centru",
    noduri.every((p) => Math.abs(distanta(p, CENTRU) - RAZA_CERC) < 1e-9),
  );
  verifica(
    "primul nod e chiar deasupra centrului",
    Math.abs(noduri[0]!.x - CENTRU.x) < 1e-9 && noduri[0]!.y < CENTRU.y,
    `(${noduri[0]!.x.toFixed(1)}, ${noduri[0]!.y.toFixed(1)})`,
  );
  // În SVG y crește în jos, deci „acele de ceas" înseamnă x crescător la început.
  verifica("al doilea nod e la dreapta", noduri[1]!.x > CENTRU.x + 1);
  verifica("al treilea nod e sub centru", noduri[2]!.y > CENTRU.y + 1);
  const laturi = noduri.map((p, i) => distanta(p, noduri[(i + 1) % 4]!));
  verifica(
    "distanțele dintre noduri vecine sunt egale",
    Math.max(...laturi) - Math.min(...laturi) < 1e-9,
    `latura ${laturi[0]!.toFixed(2)}`,
  );
}

console.log("\n=== 2. Capetele muchiei stau pe conturul nodurilor, nu în centrul lor ===");
const muchii = construiesteMuchii(noduri, reteaDinCurs().linkuri, RAZA_NOD);
{
  verifica("rețeaua din curs are 6 muchii", muchii.length === 6, `${muchii.length}`);
  const abateri = muchii.flatMap((m) => [
    Math.abs(distanta(m.start, noduri[m.dela]!) - RAZA_NOD),
    Math.abs(distanta(m.sfarsit, noduri[m.la]!) - RAZA_NOD),
  ]);
  verifica(
    "fiecare capăt e la exact raza nodului de centrul lui",
    Math.max(...abateri) < 0.05,
    `abatere maximă ${Math.max(...abateri).toExponential(2)} px`,
  );
  const inNod = muchii.some((m) =>
    noduri.some(
      (nod, i) =>
        (i !== m.dela || distanta(m.start, nod) < RAZA_NOD - 0.05) &&
        (i !== m.la || distanta(m.sfarsit, nod) < RAZA_NOD - 0.05) &&
        (distanta(m.start, nod) < RAZA_NOD - 0.05 || distanta(m.sfarsit, nod) < RAZA_NOD - 0.05),
    ),
  );
  verifica("niciun capăt nu intră sub un nod", !inNod);
}

console.log("\n=== 3. Perechea reciprocă P1 ↔ P3 nu se suprapune ===");
{
  const dus = construiesteMuchie(noduri, 0, 2, RAZA_NOD)!;
  const intors = construiesteMuchie(noduri, 2, 0, RAZA_NOD)!;
  const departari: number[] = [];
  for (let k = 1; k < 10; k++) {
    const t = k / 10;
    const a = punctPeCurba(dus.start, dus.control, dus.sfarsit, t);
    const b = punctPeCurba(intors.start, intors.control, intors.sfarsit, t);
    departari.push(distanta(a, b));
  }
  verifica(
    "cele două sensuri se depărtează pe toată lungimea",
    Math.min(...departari) > RAZA_NOD,
    `distanță minimă ${Math.min(...departari).toFixed(1)} px`,
  );
  verifica(
    "și ies de o parte și de alta a coardei",
    Math.sign(semnFataDeCoarda(noduri[0]!, noduri[2]!, dus.mijloc)) !==
      Math.sign(semnFataDeCoarda(noduri[0]!, noduri[2]!, intors.mijloc)),
  );
}

console.log("\n=== 4. Îndoirea e consecventă: același sens pentru toate muchiile ===");
{
  const semne = muchii.map((m) =>
    Math.sign(semnFataDeCoarda(noduri[m.dela]!, noduri[m.la]!, m.mijloc)),
  );
  verifica(
    "toate muchiile se îndoaie la aceeași mână față de sensul lor",
    semne.every((s) => s === semne[0]),
    semne.join(", "),
  );
  // Săgeata se măsoară pe **coarda dintre centrele nodurilor**, nu pe bucata
  // rămasă după tăiere: tăierea scurtează muchia cu raza nodului, deci pe o
  // coardă scurtă rămâne o bucată proporțional mai mică, iar raportul măsurat pe
  // ea ar diferi de la o muchie la alta fără ca îndoirea să difere.
  const sageti = muchii.map((m) => {
    const a = noduri[m.dela]!;
    const b = noduri[m.la]!;
    const mijlocCurbei = punctPeCurba(a, controlIntreCentre(a, b), b, 0.5);
    return distanta(mijlocCurbei, mijlocSegment(a, b)) / distanta(a, b);
  });
  verifica(
    "toate se îndoaie la fel de mult, proporțional cu lungimea",
    Math.max(...sageti) - Math.min(...sageti) < 1e-9,
    `săgeată relativă ${sageti[0]!.toFixed(4)}`,
  );
  verifica(
    "și toate se îndoaie efectiv (nicio muchie nu rămâne dreaptă)",
    Math.min(...sageti) > 0.01,
  );
}

console.log("\n=== 5. Vârful de săgeată arată chiar încotro merge curba ===");
{
  const abateri = muchii.map((m) => {
    const inainte = punctPeCurba(m.start, m.control, m.sfarsit, 0.999);
    const unghiMasurat =
      (Math.atan2(m.sfarsit.y - inainte.y, m.sfarsit.x - inainte.x) * 180) / Math.PI;
    return Math.abs(((unghiMasurat - m.unghiVarf + 540) % 360) - 180);
  });
  verifica(
    "unghiul raportat coincide cu direcția curbei la sosire",
    Math.max(...abateri) < 0.5,
    `abatere maximă ${Math.max(...abateri).toFixed(3)}°`,
  );
  const spreNod = muchii.every((m) => {
    const tangenta = tangentaLaCurba(m.start, m.control, m.sfarsit, 1);
    const spre = { x: noduri[m.la]!.x - m.sfarsit.x, y: noduri[m.la]!.y - m.sfarsit.y };
    return tangenta.x * spre.x + tangenta.y * spre.y > 0;
  });
  verifica("săgeata arată spre nodul-țintă, nu dinspre el", spreNod);
}

console.log(
  "\n=== 6. Porțiunea desenată stă pe curba inițială (tăierea nu inventează o curbă nouă) ===",
);
{
  // Muchia tăiată trebuie să fie chiar bucata din Bézier-ul complet, deci
  // punctele ei se regăsesc pe curba nodul-la-nod.
  const dela = 0;
  const la = 1;
  const m = construiesteMuchie(noduri, dela, la, RAZA_NOD)!;
  const a = noduri[dela]!;
  const b = noduri[la]!;
  const control = controlIntreCentre(a, b);
  let maxim = 0;
  for (let k = 0; k <= 20; k++) {
    const p = punctPeCurba(m.start, m.control, m.sfarsit, k / 20);
    let cea_mai_mica = Infinity;
    for (let j = 0; j <= 2000; j++) {
      cea_mai_mica = Math.min(cea_mai_mica, distanta(p, punctPeCurba(a, control, b, j / 2000)));
    }
    maxim = Math.max(maxim, cea_mai_mica);
  }
  verifica(
    "fiecare punct al muchiei desenate cade pe curba completă",
    maxim < 0.05,
    `depărtare maximă ${maxim.toExponential(2)} px`,
  );
}

console.log("\n=== 7. Cazuri-limită ===");
{
  verifica(
    "bucla pe același nod nu se desenează",
    construiesteMuchie(noduri, 1, 1, RAZA_NOD) === null,
  );
  verifica(
    "indice inexistent nu se desenează",
    construiesteMuchie(noduri, 0, 9, RAZA_NOD) === null,
  );
  verifica(
    "două noduri suprapuse nu produc împărțire la zero",
    construiesteMuchie([CENTRU, CENTRU], 0, 1, RAZA_NOD) === null,
  );
  const drept = construiesteMuchie(noduri, 0, 1, RAZA_NOD, 0)!;
  verifica(
    "cu îndoire 0 muchia e chiar segmentul dintre noduri",
    distanta(drept.mijloc, mijlocSegment(drept.start, drept.sfarsit)) < 1e-9,
  );
  verifica(
    "calea începe cu M și are un singur Q",
    /^M [-\d.]+ [-\d.]+ Q [-\d.]+ [-\d.]+ [-\d.]+ [-\d.]+$/.test(drept.cale),
    drept.cale,
  );
}

/**
 * Punctul de control al muchiei nod-la-nod, recalculat **independent** de modul:
 * mijlocul coardei, deplasat perpendicular cu `INDOIRE_IMPLICITA` din lungimea ei.
 * Dacă modulul ar schimba convenția, verificările de mai sus ar pica — exact ce
 * trebuie să facă.
 */
function controlIntreCentre(a: Punct, b: Punct): Punct {
  const lungime = distanta(a, b);
  return {
    x: (a.x + b.x) / 2 - ((b.y - a.y) / lungime) * lungime * INDOIRE_IMPLICITA,
    y: (a.y + b.y) / 2 + ((b.x - a.x) / lungime) * lungime * INDOIRE_IMPLICITA,
  };
}

/** Semnul produsului vectorial: de care parte a coardei `a → b` cade punctul. */
function semnFataDeCoarda(a: Punct, b: Punct, p: Punct): number {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

function mijlocSegment(a: Punct, b: Punct): Punct {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

console.log("");
console.log(picate === 0 ? "✓ geometria grafului e verificată" : `✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);
