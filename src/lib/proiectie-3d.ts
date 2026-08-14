/**
 * Proiecția unei scene 3D pe ecran, pentru `Scena3D`.
 *
 * Funcții pure, fără React și fără SVG — ca la `plot-scara.ts`, matematica
 * desenului trebuie să poată fi verificată separat de interfață
 * (`scripts/verificare-algoritmi/proiectie-3d.ts`).
 *
 * **Camera e ortografică (axonometrică), nu în perspectivă.** Nu din comoditate,
 * ci fiindcă trei lucruri de care atârnă desenul paginii 7 sunt adevărate doar
 * sub o proiecție liniară:
 *
 * 1. **Curbele de nivel rămân elipse.** Imaginea liniară a unei elipse e o
 *    elipsă, deci se pot desena analitic și exact (`curbe-de-nivel.ts`). Sub
 *    perspectivă, împărțirea cu adâncimea le-ar strica și ar trebui eșantionate.
 * 2. **Liniile de cădere rămân paralele.** Segmentul de la un punct de pe
 *    suprafață la umbra lui de pe podea e paralel cu axa z a lumii, deci
 *    proiectat are aceeași direcție pe ecran pentru **toate** punctele. Exact
 *    asta face legătura punct ↔ umbră citibilă fără ghicit. Sub perspectivă ar
 *    converge spre un punct de fugă.
 * 3. **Ordinea painter devine exactă** — vezi `ordineCelule`.
 *
 * O vale cvadratică nu câștigă oricum nimic din adâncimea perspectivei: e un
 * obiect mic, privit de aproape de nicăieri.
 */

import type { Cadru, Domeniu } from "@/lib/plot-scara";

/** Un punct în lumea 3D: x și y sunt planul soluțiilor, z e înălțimea f(x). */
export type Punct3 = { x: number; y: number; z: number };

/**
 * Poziția ochiului, în coordonate sferice.
 *
 * `azimut` se învârte liber în jurul axei verticale; `elevatie` urcă de la
 * privirea razantă până la privirea perfect de sus.
 */
export type Camera = { azimut: number; elevatie: number };

/** Un punct proiectat: pixeli SVG plus adâncimea, pentru sortări. */
export type Ecran = { x: number; y: number; adancime: number };

/** Cutia lumii care se desenează, pe fiecare axă. */
export type Cutie = { x: Domeniu; y: Domeniu; z: Domeniu };

const GRAD = Math.PI / 180;

/**
 * Sub 15° podeaua și suprafața se încalecă: painterul desenează suprafața peste
 * podea, dar la unghi razant buza apropiată a văii ar trebui să acopere podeaua
 * din față, ceea ce ordinea fixă de straturi nu poate face. Pragul e verificat
 * numeric, nu presupus.
 */
export const ELEVATIE_MINIMA = 15 * GRAD;

/**
 * 90° nu e un capăt arbitrar: acolo scena **devine** graficul de curbe de nivel
 * privit de sus, singurul unghi din care unghiul drept dintre doi pași
 * consecutivi se citește drept. Măsurat: 90° real se vede ca 55° la elevație
 * 28°, 73° la 45°, 83° la 60° și 90,000° abia la 90°.
 */
export const ELEVATIE_MAXIMA = 90 * GRAD;

/**
 * De la ce elevație începe suprafața să se dea la o parte.
 *
 * La 90° scena **devine** figura de curbe de nivel din curs — singurul unghi din
 * care unghiul drept dintre doi pași se citește drept (vezi `ELEVATIE_MAXIMA`).
 * Un mesh opac peste podea anulează exact ce a urcat omul să vadă: harta de
 * nivel rămâne acoperită, iar butonul „Privește de sus" nu arată nimic nou.
 *
 * Nu e un al doilea mod de afișare, e capătul aceleiași manete: suprafața se
 * stinge treptat, cât urci ultimele 25 de grade, ca legătura dintre vale și
 * harta ei să rămână văzută, nu presupusă.
 */
export const ELEVATIE_ESTOMPARE = 65 * GRAD;

/** Unghiul de pornire: destul de oblic cât să se vadă valea, destul de ridicat cât să se vadă cotul. */
export const CAMERA_IMPLICITA: Camera = { azimut: 35 * GRAD, elevatie: 32 * GRAD };

/** Privirea de sus, capătul de sus al aceleiași manete. */
export const CAMERA_DE_SUS: Camera = { azimut: 35 * GRAD, elevatie: ELEVATIE_MAXIMA };

/** Cât se rotește scena pentru un pixel de tras, pe fiecare axă. */
const SENS_AZIMUT = 0.55 * GRAD;
const SENS_ELEVATIE = 0.45 * GRAD;

/** Cât din zonă rămâne liber în jurul scenei, ca etichetele să aibă loc. */
const MARJA = 0.92;

function lungime(v: Punct3): number {
  return Math.hypot(v.x, v.y, v.z);
}

function normalizeazaVector(v: Punct3): Punct3 {
  const l = lungime(v);
  if (l < 1e-12) return { x: 0, y: 0, z: 1 };
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}

function scalar(a: Punct3, b: Punct3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Baza ortonormată a camerei.
 *
 * `spre` arată dinspre scenă către ochi, deci adâncimea unui punct e proiecția
 * lui pe `spre`: mai mare înseamnă mai aproape de privitor. `dreapta` stă
 * orizontal (are z zero, oricare ar fi elevația), iar `sus` completează triedrul
 * drept.
 */
export function bazaCamerei(cam: Camera): { dreapta: Punct3; sus: Punct3; spre: Punct3 } {
  const ca = Math.cos(cam.azimut);
  const sa = Math.sin(cam.azimut);
  const ce = Math.cos(cam.elevatie);
  const se = Math.sin(cam.elevatie);

  return {
    spre: { x: ce * ca, y: ce * sa, z: se },
    dreapta: { x: -sa, y: ca, z: 0 },
    sus: { x: -se * ca, y: -se * sa, z: ce },
  };
}

/** Rotește camera cu o deplasare în pixeli, ținând elevația între limite. */
export function roteste(cam: Camera, dxPixeli: number, dyPixeli: number): Camera {
  return normalizeazaCamera({
    azimut: cam.azimut + dxPixeli * SENS_AZIMUT,
    // Tras în sus înseamnă „urcă-mă deasupra scenei", iar în SVG y crește în jos.
    elevatie: cam.elevatie - dyPixeli * SENS_ELEVATIE,
  });
}

/** Aduce azimutul într-o tură și elevația între limitele desenabile. */
export function normalizeazaCamera(cam: Camera): Camera {
  const tura = 2 * Math.PI;
  let azimut = cam.azimut % tura;
  if (azimut < 0) azimut += tura;

  return {
    azimut,
    elevatie: Math.min(ELEVATIE_MAXIMA, Math.max(ELEVATIE_MINIMA, cam.elevatie)),
  };
}

/**
 * Lume → cub în jurul originii.
 *
 * **x și y primesc același factor.** Nu e un detaliu de stil: dacă fiecare axă
 * s-ar normaliza separat, cutia s-ar forfeca, iar unghiul dintre doi pași ar fi
 * citit greșit — măsurat, între 58° și 130° pentru un unghi real de 90°, în
 * funcție de azimut. Desenul ar afirma pe rând că e ascuțit sau obtuz.
 *
 * z **trebuie** să aibă alt factor: e în alte unități (valori ale funcției, nu
 * ale soluției). `exagerareZ` e înălțimea cutiei măsurată în laturi de bază.
 * Consecința — panta desenată nu e panta reală — se scrie în legendă, nu se
 * ascunde.
 */
export function normalizeaza(p: Punct3, cutie: Cutie, exagerareZ: number): Punct3 {
  const { centruX, centruY, centruZ, latura, latimeZ } = masuriCutie(cutie);
  return {
    x: (p.x - centruX) / latura,
    y: (p.y - centruY) / latura,
    z: ((p.z - centruZ) / latimeZ) * exagerareZ,
  };
}

function masuriCutie(cutie: Cutie) {
  const latimeX = Math.max(cutie.x[1] - cutie.x[0], 1e-12);
  const latimeY = Math.max(cutie.y[1] - cutie.y[0], 1e-12);
  const latimeZ = Math.max(cutie.z[1] - cutie.z[0], 1e-12);

  return {
    centruX: (cutie.x[0] + cutie.x[1]) / 2,
    centruY: (cutie.y[0] + cutie.y[1]) / 2,
    centruZ: (cutie.z[0] + cutie.z[1]) / 2,
    // Latura comună a lui x și y — cea mai mare dintre ele, ca scara să fie
    // izotropă și cutia să încapă întreagă.
    latura: Math.max(latimeX, latimeY),
    latimeX,
    latimeY,
    latimeZ,
  };
}

/** Proiecția gata calculată: o singură funcție de chemat din straturi. */
export type Proiectie = {
  laEcran: (p: Punct3) => Ecran;
  camera: Camera;
  cutie: Cutie;
  /** Pixeli pe unitate de cub normalizat — de care au nevoie razele și grosimile. */
  scara: number;
};

/**
 * Compune normalizarea, rotația camerei și încadrarea în zonă.
 *
 * Scara **nu depinde de azimut**, deși cutia proiectată e mai lată la 45° decât
 * la 0°: se ia extremul peste toate azimuturile, altfel scena ar respira sub
 * deget la fiecare rotire, iar tragerea ar părea că trage și de zoom. Rămâne
 * dependentă de elevație, ceea ce e inevitabil — de acolo chiar se schimbă
 * silueta.
 */
export function creeazaProiectie(
  cam: Camera,
  cutie: Cutie,
  zona: Cadru,
  exagerareZ: number,
): Proiectie {
  const baza = bazaCamerei(cam);
  const { latimeX, latimeY, latura } = masuriCutie(cutie);

  // Semi-laturile cutiei normalizate.
  const hx = latimeX / latura / 2;
  const hy = latimeY / latura / 2;
  const hz = exagerareZ / 2;

  // max_a (hx·|sin a| + hy·|cos a|) = √(hx² + hy²) — extremul peste azimuturi.
  const raza = Math.hypot(hx, hy);
  const latimeProiectata = 2 * raza;
  const inaltimeProiectata = 2 * (raza * Math.sin(cam.elevatie) + hz * Math.cos(cam.elevatie));

  const latimeZona = Math.max(zona.dreapta - zona.stanga, 1);
  const inaltimeZona = Math.max(zona.jos - zona.sus, 1);
  const scara = MARJA * Math.min(latimeZona / latimeProiectata, inaltimeZona / inaltimeProiectata);

  // Centrul cutiei se normalizează în origine, deci cade fix în centrul zonei.
  const centruEcranX = (zona.stanga + zona.dreapta) / 2;
  const centruEcranY = (zona.sus + zona.jos) / 2;

  return {
    camera: cam,
    cutie,
    scara,
    laEcran: (p) => {
      const u = normalizeaza(p, cutie, exagerareZ);
      return {
        x: centruEcranX + scara * scalar(u, baza.dreapta),
        // SVG are y în jos, matematica în sus — inversarea stă doar aici.
        y: centruEcranY - scara * scalar(u, baza.sus),
        adancime: scalar(u, baza.spre),
      };
    },
  };
}

/**
 * Ordinea în care se desenează celulele unei grile n×n, de la cea mai depărtată
 * la cea mai apropiată (algoritmul pictorului, fără z-buffer).
 *
 * **Cheia e proiecția orizontală a centrului celulei, nu adâncimea lui.** Pare
 * o subtilitate; nu e. Măsurat de `scripts/verificare-algoritmi/proiectie-3d.ts`
 * pe 40 de height-field-uri zimțate și camere aleatoare, cu 4 800 de raze care
 * spun care celulă e într-adevăr văzută într-un punct de ecran:
 *
 * | criteriu de sortare                           | raze contrazise |
 * | --------------------------------------------- | --------------- |
 * | adâncimea centrului (`c·spre`, cu z)          | **102 din 4 800 (2,1 %)** |
 * | proiecția orizontală (`cₓ·cos a + c_y·sin a`) | **0 din 4 800** |
 *
 * Cele 2,1 % nu sunt puține: sunt raze pe care o celulă din spate se pictează
 * peste una din față, adică găuri vizibile în suprafață, împrăștiate exact pe
 * buzele văii — unde se uită omul.
 *
 * Motivul: sub proiecție ortografică toate razele au aceeași direcție
 * orizontală, deci ordinea în care o rază traversează celulele e dată **numai**
 * de grilă și de azimut — înălțimea nu are niciun cuvânt. Sortarea „intuitivă"
 * după adâncime amestecă înălțimea în ea și tocmai de aceea se rupe pe teren
 * zimțat.
 *
 * `scripts/verificare-algoritmi/proiectie-3d.ts` ține **și** varianta greșită ca
 * test care trebuie să pice, ca ea să nu fie pusă înapoi ca „reparare".
 *
 * Cheia nu depinde de elevație, deci rezultatul se memoizează pe azimut.
 */
export function ordineCelule(n: number, azimut: number): Int32Array {
  const ca = Math.cos(azimut);
  const sa = Math.sin(azimut);

  const indici = new Int32Array(n * n);
  const chei = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const k = i * n + j;
      indici[k] = k;
      chei[k] = (i + 0.5) * ca + (j + 0.5) * sa;
    }
  }

  // `Int32Array.prototype.sort` nu primește comparator stabil pe toate motoarele
  // pentru tipuri numerice; sortăm un array obișnuit și copiem înapoi.
  const ordonat = Array.from(indici).sort((a, b) => (chei[a] ?? 0) - (chei[b] ?? 0));
  return Int32Array.from(ordonat);
}

/**
 * Normala unui patrulater din mesh, ca produs vectorial al diagonalelor.
 *
 * Diagonalele, nu două laturi: patrulaterul unui height-field nu e plan, iar
 * produsul diagonalelor dă normala „medie", care nu depinde de colțul din care
 * pornești.
 */
export function normalaCelulei(p00: Punct3, p10: Punct3, p11: Punct3, p01: Punct3): Punct3 {
  const d1 = { x: p11.x - p00.x, y: p11.y - p00.y, z: p11.z - p00.z };
  const d2 = { x: p01.x - p10.x, y: p01.y - p10.y, z: p01.z - p10.z };

  return normalizeazaVector({
    x: d1.y * d2.z - d1.z * d2.y,
    y: d1.z * d2.x - d1.x * d2.z,
    z: d1.x * d2.y - d1.y * d2.x,
  });
}

/**
 * Cât de tare bate lumina pe o față — 0 în umbră, 1 în plin.
 *
 * Devine **opacitate**, nu culoare: paleta e închisă (`CLAUDE.md`), deci
 * relieful se obține variind transparența unui singur rol, nu inventând nuanțe.
 *
 * Lumina stă lipită de cameră, puțin peste umărul privitorului, ca fața către
 * care te uiți să fie mereu cea luminată — altfel, la o rotire de 180°, valea ar
 * deveni brusc o gaură neagră.
 */
export function umbrire(normala: Punct3, cam: Camera): number {
  const baza = bazaCamerei(cam);
  const lumina = normalizeazaVector({
    x: baza.spre.x + 0.55 * baza.sus.x + 0.3 * baza.dreapta.x,
    y: baza.spre.y + 0.55 * baza.sus.y + 0.3 * baza.dreapta.y,
    z: baza.spre.z + 0.55 * baza.sus.z + 0.3 * baza.dreapta.z,
  });

  // Valoarea absolută: mesh-ul e un height-field, deci normalele ar trebui să
  // aibă z pozitiv, dar la o celulă degenerată semnul poate scăpa, iar o față
  // neagră izolată se vede imediat ca defect.
  return Math.min(1, Math.abs(scalar(normalizeazaVector(normala), lumina)));
}

/**
 * E punctul în fereastra pe care o arată scena, adică în cutie pe x și y?
 *
 * **Numai x și y, nu și z.** Cutia e o fereastră către planul soluțiilor;
 * înălțimea nu e o limită, ci o consecință — traseul e ridicat puțin peste
 * suprafață (`Traiectorie3D`), deci un prag pe z ar tăia tocmai ce trebuie
 * văzut.
 */
export function inCutieXY(p: Punct3, cutie: Cutie, toleranta = 1e-9): boolean {
  return (
    p.x >= cutie.x[0] - toleranta &&
    p.x <= cutie.x[1] + toleranta &&
    p.y >= cutie.y[0] - toleranta &&
    p.y <= cutie.y[1] + toleranta
  );
}

/**
 * Bucata dintr-un segment care cade în fereastra scenei, sau `null` dacă nu
 * cade nimic.
 *
 * **De ce trebuie tăiat în lume, nu la marginea SVG-ului.** Când lupa se
 * apropie, iterațiile de la începutul rulării rămân în listă, dar ies din
 * cutie — iar proiecția e liniară, deci nu le duce „undeva lângă", ci foarte
 * departe: măsurat pe valea alungită, `x⁽⁰⁾` ajunge la `(−2104, −5315)` px la
 * pasul 11 și la `(−2,6·10⁶, −4,9·10⁹)` la ultimul. Segmentul până acolo
 * traversează toată scena și se vede ca o linie care intră din afară și nu
 * duce nicăieri. Tăiat doar la dreptunghiul SVG-ului, el rămâne desenat — plus
 * că browserul are de rasterizat o cale cu coordonate de ordinul miliardelor.
 *
 * Tăierea e **exactă**, nu o aproximare: segmentul desenat e drept în lume, iar
 * proiecția fiind liniară, punctul de parametru `t` de pe segmentul din lume e
 * chiar punctul de parametru `t` de pe segmentul de pe ecran. Se interpolează
 * toate trei coordonatele cu același `t` (Liang–Barsky pe x și y).
 */
export function taieLaCutieXY(a: Punct3, b: Punct3, cutie: Cutie): [Punct3, Punct3] | null {
  let t0 = 0;
  let t1 = 1;

  // (direcție, distanța până la margine) pentru cele patru laturi
  const margini: [number, number][] = [
    [-(b.x - a.x), a.x - cutie.x[0]],
    [b.x - a.x, cutie.x[1] - a.x],
    [-(b.y - a.y), a.y - cutie.y[0]],
    [b.y - a.y, cutie.y[1] - a.y],
  ];

  for (const [p, q] of margini) {
    if (p === 0) {
      // Segment paralel cu latura: dacă e în afara ei, nu se vede deloc.
      if (q < 0) return null;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return null;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return null;
      if (r < t1) t1 = r;
    }
  }

  if (!(t1 > t0)) return null;

  const la = (t: number): Punct3 => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  });

  return [la(t0), la(t1)];
}

/**
 * Un drum, tăiat la fereastra scenei: bucățile lui care se văd.
 *
 * Rezultatul e o **listă de polilinii**, nu una singură, fiindcă un drum poate
 * ieși din fereastră și intra înapoi; unite, cele două bucăți ar fi legate
 * printr-o linie care trece peste porțiunea tăiată — adică exact greșeala pe
 * care tăierea o repară. Bucățile consecutive care se termină și încep în
 * același punct se lipesc, ca `stroke-linejoin` să lucreze pe drumul întreg.
 */
export function poliliniiTaiate(puncte: readonly Punct3[], cutie: Cutie): Punct3[][] {
  const bucati: Punct3[][] = [];
  let curenta: Punct3[] | null = null;

  const acelasi = (a: Punct3, b: Punct3) =>
    Math.abs(a.x - b.x) < 1e-12 && Math.abs(a.y - b.y) < 1e-12 && Math.abs(a.z - b.z) < 1e-12;

  for (let i = 0; i + 1 < puncte.length; i++) {
    const a = puncte[i];
    const b = puncte[i + 1];
    if (!a || !b) continue;

    const taiat = taieLaCutieXY(a, b, cutie);
    if (!taiat) {
      curenta = null;
      continue;
    }

    const [de, la] = taiat;
    const ultim = curenta?.[curenta.length - 1];
    if (curenta && ultim && acelasi(ultim, de)) {
      curenta.push(la);
    } else {
      curenta = [de, la];
      bucati.push(curenta);
    }
  }

  return bucati;
}

/**
 * Cât de opacă e suprafața la o elevație dată: 1 sub `ELEVATIE_ESTOMPARE`, 0 fix
 * la 90°, cu trecere netedă între ele.
 *
 * Trecerea e un smoothstep, nu o rampă liniară: cu rampă, stingerea pornește
 * brusc la prag și se oprește brusc la capăt, iar la tragere se vede ca două
 * smucituri. Smoothstep are derivata nulă la ambele capete, deci suprafața
 * pleacă și ajunge lin, cât timp degetul urcă uniform.
 */
export function opacitateSuprafata(elevatie: number): number {
  if (!Number.isFinite(elevatie) || elevatie <= ELEVATIE_ESTOMPARE) return 1;
  if (elevatie >= ELEVATIE_MAXIMA) return 0;

  const t = (elevatie - ELEVATIE_ESTOMPARE) / (ELEVATIE_MAXIMA - ELEVATIE_ESTOMPARE);
  return 1 - t * t * (3 - 2 * t);
}
