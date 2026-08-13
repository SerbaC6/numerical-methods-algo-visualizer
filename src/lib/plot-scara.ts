/**
 * Trecerea între coordonate matematice și pixeli, pentru `Plot`.
 *
 * Funcții pure, fără React și fără SVG: sunt singura parte cu adevărat
 * matematică din grafic, iar `CLAUDE.md` cere ca matematica să poată fi
 * verificată separat de interfață.
 */

/** Un capăt și celălalt, în coordonate matematice. */
export type Domeniu = readonly [min: number, max: number];

export type Scara = {
  /** Coordonată matematică → pixel. */
  la: (valoare: number) => number;
  /** Pixel → coordonată matematică. Necesar la tras cu mouse-ul și la zoom. */
  de: (pixel: number) => number;
  domeniu: Domeniu;
  interval: readonly [number, number];
};

/**
 * Scară liniară între `domeniu` (matematic) și `interval` (pixeli).
 *
 * Pentru axa verticală se trimite intervalul inversat — `[inaltime, 0]` — fiindcă
 * în SVG y crește în jos, iar în matematică în sus. Așa inversarea stă într-un
 * singur loc, nu împrăștiată prin fiecare strat.
 *
 * Un domeniu de lățime zero (toate valorile egale, de exemplu funcția constantă)
 * ar duce la împărțire la zero, deci se lărgește simetric cu o unitate.
 */
export function creeazaScara(domeniu: Domeniu, interval: readonly [number, number]): Scara {
  let [min, max] = domeniu;
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    min = 0;
    max = 1;
  }
  if (min === max) {
    min -= 0.5;
    max += 0.5;
  }

  const [p0, p1] = interval;
  const factor = (p1 - p0) / (max - min);

  return {
    la: (valoare) => p0 + (valoare - min) * factor,
    de: (pixel) => min + (pixel - p0) / factor,
    domeniu: [min, max],
    interval,
  };
}

/**
 * Domeniul care cuprinde toate valorile date, cu o marjă proporțională.
 *
 * Încadrarea o face apelantul, nu `Plot`: dacă graficul și-ar deduce singur
 * domeniul din ce desenează, straturile ar trebui să se înregistreze într-un
 * efect, ceea ce înseamnă o a doua randare la fiecare pas de animație.
 *
 * `marja` e fracție din lățimea totală (0.05 = 5% de fiecare parte).
 */
export function incadreaza(valori: readonly number[], marja = 0.05): Domeniu {
  const finite = valori.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return [0, 1];

  let min = Math.min(...finite);
  let max = Math.max(...finite);

  if (min === max) {
    // O singură valoare: dăm graficului o înălțime rezonabilă în jurul ei, în
    // loc de o bandă de grosime zero.
    const pas = Math.abs(min) > 0 ? Math.abs(min) * 0.1 : 0.5;
    min -= pas;
    max += pas;
  } else {
    const spatiu = (max - min) * marja;
    min -= spatiu;
    max += spatiu;
  }

  return [min, max];
}

/** Domeniul care cuprinde ambele domenii date. */
export function reuneste(a: Domeniu, b: Domeniu): Domeniu {
  return [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
}

/**
 * Cât de mult sau de puțin se poate strânge un domeniu prin zoom.
 *
 * Fără limita de jos, câteva rotiri de roată ajung la un domeniu de lățime zero
 * și tot ce urmează devine împărțire la zero. Fără cea de sus, zoom-ul înapoi
 * duce la numere la care virgula mobilă nu mai distinge reperele vecine.
 */
const LATIME_MINIMA = 1e-9;
const LATIME_MAXIMA = 1e12;

/** Mută domeniul cu `delta`, păstrându-i lățimea. */
export function mutaDomeniu(domeniu: Domeniu, delta: number): Domeniu {
  if (!Number.isFinite(delta)) return domeniu;
  return [domeniu[0] + delta, domeniu[1] + delta];
}

/**
 * Strânge sau lărgește domeniul în jurul unei valori care rămâne pe loc.
 *
 * `ancora` e valoarea de sub cursor: la zoom cu roata, punctul de sub mouse
 * trebuie să rămână exact sub mouse, altfel graficul „fuge" de sub degete.
 * `factor` sub 1 apropie, peste 1 depărtează.
 */
export function zoomDomeniu(domeniu: Domeniu, factor: number, ancora: number): Domeniu {
  const [min, max] = domeniu;
  if (!Number.isFinite(factor) || factor <= 0 || !Number.isFinite(ancora)) return domeniu;

  const latimeNoua = (max - min) * factor;
  if (latimeNoua < LATIME_MINIMA || latimeNoua > LATIME_MAXIMA) return domeniu;

  return [ancora + (min - ancora) * factor, ancora + (max - ancora) * factor];
}

/** Un dreptunghi în pixeli SVG. */
export type Cadru = { stanga: number; dreapta: number; sus: number; jos: number };

/**
 * Taie o dreaptă infinită la marginile unui dreptunghi.
 *
 * Metoda „slab": dreapta se scrie parametric, `P = P₀ + t·direcție`, iar pentru
 * fiecare pereche de margini se află intervalul de `t` în care dreapta e între
 * ele. Intersecția celor două intervale dă porțiunea vizibilă.
 *
 * Alternativa naivă — se calculează `y` la capetele domeniului — se rupe la
 * pante mari: tangenta lui Newton lângă o rădăcină poate avea panta de ordinul
 * miilor, iar capetele ies la coordonate uriașe. Metoda asta tratează la fel și
 * dreptele verticale, unde panta nici nu există.
 *
 * Întoarce `null` când dreapta nu trece deloc prin dreptunghi.
 */
export function taieLaDreptunghi(
  p0: { x: number; y: number },
  directie: { x: number; y: number },
  cadru: Cadru,
): [{ x: number; y: number }, { x: number; y: number }] | null {
  let tMin = Number.NEGATIVE_INFINITY;
  let tMax = Number.POSITIVE_INFINITY;

  const axe: [number, number, number, number][] = [
    [p0.x, directie.x, cadru.stanga, cadru.dreapta],
    [p0.y, directie.y, cadru.sus, cadru.jos],
  ];

  for (const [start, pas, minim, maxim] of axe) {
    if (Math.abs(pas) < 1e-12) {
      // Dreapta e paralelă cu perechea asta de margini: ori e între ele pe toată
      // lungimea, ori nu le atinge niciodată.
      if (start < minim || start > maxim) return null;
      continue;
    }
    const t1 = (minim - start) / pas;
    const t2 = (maxim - start) / pas;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }

  if (tMin > tMax) return null;
  return [
    { x: p0.x + tMin * directie.x, y: p0.y + tMin * directie.y },
    { x: p0.x + tMax * directie.x, y: p0.y + tMax * directie.y },
  ];
}

/** Un reper de pe axă: unde cade și ce scrie sub el. */
export type Reper = { valoare: number; eticheta: string };

/**
 * Pasul „frumos" imediat mai mare decât `brut`: 1, 2 sau 5 înmulțit cu o putere
 * a lui 10.
 *
 * Specificația e luată de la Desmos (vezi `docs/referinte.md`): oamenii citesc
 * ușor grile din 0,5 / 1 / 2 / 5 / 10 / 20 și greu grile din 3 sau 7.
 */
function pasFrumos(brut: number): number {
  const exponent = Math.floor(Math.log10(brut));
  const magnitudine = 10 ** exponent;
  const normalizat = brut / magnitudine;

  const frumos = normalizat <= 1 ? 1 : normalizat <= 2 ? 2 : normalizat <= 5 ? 5 : 10;
  return frumos * magnitudine;
}

/** Câte zecimale cere un pas ca să se scrie exact: 0,2 → 1; 0,05 → 2; 2 → 0. */
function zecimalePentru(pas: number): number {
  return Math.min(20, Math.max(0, -Math.floor(Math.log10(pas))));
}

/**
 * Eticheta unui reper.
 *
 * `stiintific` se decide o dată pentru toată axa, nu pentru fiecare număr în
 * parte: altfel o axă până la cinci milioane ar începe cu „0" și ar continua cu
 * „1,0e+6", adică două notații pe același rând de repere.
 *
 * Zeroul rămâne „0" chiar și în notație științifică — „0,0e+0" nu ajută pe
 * nimeni, iar zeroul e neambiguu oricum.
 */
function eticheteazaReper(valoare: number, zecimale: number, stiintific: boolean): string {
  // `-0` apare din înmulțire și s-ar scrie „−0", ceea ce arată a greșeală.
  const v = Object.is(valoare, -0) ? 0 : valoare;

  let text: string;
  if (v === 0) {
    text = "0";
  } else if (stiintific) {
    text = v.toExponential(1);
  } else {
    // Zerourile finale se taie, dar **numai după virgulă**: pe o axă cu pasul
    // 0,0005 eticheta zero s-ar scrie „0,0000", iar „1,0" ar fi doar „1".
    // Tăierea oarbă ar transforma „10" în „1" și axa ar minti cu un ordin de
    // mărime — greșeală prinsă de verificarea numerică.
    text = v.toFixed(zecimale);
    if (text.includes(".")) text = text.replace(/0+$/, "").replace(/\.$/, "");
  }

  // Minus tipografic, ca peste tot pe site; virgulă zecimală, ca în română.
  return text.replace("-", "−").replace(".", ",");
}

/**
 * Reperele unei axe, pentru domeniul dat, pe `pixeli` pixeli disponibili.
 *
 * Densitatea se adaptează la spațiu: pe un grafic îngust ies mai puține repere,
 * nu aceleași scrise mai mic. `pixeliPerReper` e distanța minimă dorită între
 * două etichete vecine — sub ea, textele s-ar atinge.
 *
 * Valorile se calculează ca `indice × pas`, nu prin adunări repetate: adunarea
 * acumulează eroarea de virgulă mobilă și, după zece pași, reperul „3" ajunge
 * `2.9999999999999996`. În plus, rezultatul se rotunjește la numărul de zecimale
 * pe care îl cere pasul, ca valoarea desenată și eticheta scrisă să fie același
 * număr.
 */
export function repere(domeniu: Domeniu, pixeli: number, pixeliPerReper = 70): Reper[] {
  const [min, max] = domeniu;
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || pixeli <= 0) return [];

  const tinta = Math.max(2, Math.floor(pixeli / pixeliPerReper));
  const pas = pasFrumos((max - min) / tinta);
  const zecimale = zecimalePentru(pas);

  const primul = Math.ceil(min / pas);
  const ultimul = Math.floor(max / pas);

  const valori: number[] = [];
  for (let i = primul; i <= ultimul; i++) {
    valori.push(Number((i * pas).toFixed(zecimale)));
  }

  // Notația se alege o dată, din cel mai mare reper, ca toată axa să fie scrisă
  // la fel. Zeroul nu contează la decizie: e „0" în ambele notații.
  const celMaiMare = Math.max(0, ...valori.map((v) => Math.abs(v)));
  const stiintific = celMaiMare >= 1e5 || (celMaiMare > 0 && celMaiMare < 1e-4);

  return valori.map((valoare) => ({
    valoare,
    eticheta: eticheteazaReper(valoare, zecimale, stiintific),
  }));
}
