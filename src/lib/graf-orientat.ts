/**
 * Geometria grafului orientat — nodurile pe cerc și muchiile dintre ele.
 *
 * Funcții pure, fără React și fără SVG: e singura parte cu adevărat calculată
 * din desenul paginii 9, iar `CLAUDE.md` cere ca ea să se poată verifica separat
 * de interfață (`scripts/verificare-algoritmi/graf-orientat.ts`).
 *
 * **De ce muchia e o Bézier pătratică, nu un segment.** Într-o rețea de pagini,
 * perechile reciproce (`P1 → P3` și `P3 → P1`) sunt normale. Două segmente între
 * aceleași două noduri s-ar suprapune perfect, iar cele două sensuri ar deveni
 * o singură linie cu două vârfuri de săgeată. Îndoirea se face **perpendicular**
 * pe coardă, `p⊥ = (−dy, dx)`, mereu în același sens față de sensul muchiei —
 * așa cele două sensuri ale unei perechi ies de o parte și de alta, fără niciun
 * caz special în cod.
 *
 * **De ce vârful de săgeată nu se pune în centrul nodului.** Săgeata trebuie să
 * atingă *conturul* cercului-țintă, altfel intră sub el și dispare. Punctul de
 * atingere se caută pe curbă, nu pe coardă: pe o muchie îndoită, cele două nu
 * coincid, iar diferența se vede ca vârf mutat lateral.
 */

export type Punct = { x: number; y: number };

/** O muchie gata de desenat: curba, punctul de contact și vârful de săgeată. */
export type MuchieDesenata = {
  /** Indicele nodului din care pleacă. */
  dela: number;
  /** Indicele nodului în care intră. */
  la: number;
  /** Capătul de plecare, deja pe conturul nodului-sursă. */
  start: Punct;
  /** Capătul de sosire, pe conturul nodului-țintă. */
  sfarsit: Punct;
  /** Punctul de control al Bézier-ului pătratic. */
  control: Punct;
  /** `d`-ul pentru `<path>`: `M … Q … …`. */
  cale: string;
  /** Mijlocul curbei — acolo stă eticheta și acolo se prinde clicul. */
  mijloc: Punct;
  /** Unghiul, în grade, al tangentei la sosire — rotația vârfului de săgeată. */
  unghiVarf: number;
};

/** Cât de mult se îndoaie o muchie, ca fracție din lungimea coardei. */
export const INDOIRE_IMPLICITA = 0.18;

/**
 * Nodurile așezate pe un cerc, primul **sus**, apoi în sensul acelor de ceas.
 *
 * Pornirea din vârf nu e estetică: cu patru pagini, `P1` sus și `P3` jos, graful
 * arată la fel ca schema din curs, iar utilizatorul care compară cele două nu
 * trebuie să le rotească în minte.
 */
export function pozitiiNoduri(n: number, centru: Punct, raza: number): Punct[] {
  return Array.from({ length: n }, (_, i) => {
    const unghi = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return { x: centru.x + raza * Math.cos(unghi), y: centru.y + raza * Math.sin(unghi) };
  });
}

/** Punctul de pe Bézier-ul pătratic la parametrul `t ∈ [0, 1]`. */
export function punctPeCurba(p0: Punct, control: Punct, p1: Punct, t: number): Punct {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * control.x + t * t * p1.x,
    y: u * u * p0.y + 2 * u * t * control.y + t * t * p1.y,
  };
}

/** Tangenta (nenormalizată) la Bézier-ul pătratic în `t`. */
export function tangentaLaCurba(p0: Punct, control: Punct, p1: Punct, t: number): Punct {
  const u = 1 - t;
  return {
    x: 2 * u * (control.x - p0.x) + 2 * t * (p1.x - control.x),
    y: 2 * u * (control.y - p0.y) + 2 * t * (p1.y - control.y),
  };
}

/** Distanța euclidiană. */
export function distanta(a: Punct, b: Punct): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Parametrul `t` la care curba iese din cercul de rază `raza` din jurul lui
 * `centru`, căutat dinspre capătul `dinspreStart`.
 *
 * Căutarea e prin bisecție pe `t`, nu prin rezolvarea ecuației de gradul patru:
 * distanța până la un capăt al muchiei crește monoton pe porțiunea care ne
 * interesează, iar 40 de înjumătățiri dau o precizie mult sub un pixel. Ecuația
 * exactă ar avea rădăcini multiple și cazuri degenerate de tratat, pentru
 * exact același rezultat pe ecran.
 */
export function taieLaContur(
  p0: Punct,
  control: Punct,
  p1: Punct,
  centru: Punct,
  raza: number,
  dinspreStart: boolean,
): number {
  const inauntru = (t: number) => distanta(punctPeCurba(p0, control, p1, t), centru) < raza;

  // Capătul dinspre care căutăm e în interiorul cercului; celălalt, în afara lui.
  let interior = dinspreStart ? 0 : 1;
  let exterior = dinspreStart ? 1 : 0;
  if (!inauntru(interior)) return interior;

  for (let i = 0; i < 40; i++) {
    const mijloc = (interior + exterior) / 2;
    if (inauntru(mijloc)) interior = mijloc;
    else exterior = mijloc;
  }
  return (interior + exterior) / 2;
}

/**
 * Muchia `dela → la`, cu capetele așezate pe conturul celor două noduri.
 *
 * `raza` e raza nodului desenat. Poate fi și **un raze per nod**: pe pagina 9
 * nodurile se umflă după pondere, iar o rază unică ar lăsa vârful de săgeată sub
 * cerc exact la pagina care crește cel mai mult. `indoire` e fracția din
 * lungimea coardei cu care curba se depărtează de ea; sensul îndoirii e mereu
 * același față de sensul de mers, deci muchia inversă iese de partea cealaltă.
 */
export function construiesteMuchie(
  noduri: Punct[],
  dela: number,
  la: number,
  raza: number | number[],
  indoire: number = INDOIRE_IMPLICITA,
): MuchieDesenata | null {
  const razaNodului = (i: number) => (Array.isArray(raza) ? (raza[i] ?? 0) : raza);
  const a = noduri[dela];
  const b = noduri[la];
  if (!a || !b || dela === la) return null;

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lungime = Math.hypot(dx, dy);
  if (!(lungime > 0)) return null;

  // p⊥ = (−dy, dx), normalizat: perpendiculara pe coardă, aceeași convenție ca
  // în clipul paginii — de aceea sensul invers iese de partea opusă.
  const control: Punct = {
    x: (a.x + b.x) / 2 - (dy / lungime) * lungime * indoire,
    y: (a.y + b.y) / 2 + (dx / lungime) * lungime * indoire,
  };

  const tStart = taieLaContur(a, control, b, a, razaNodului(dela), true);
  const tSfarsit = taieLaContur(a, control, b, b, razaNodului(la), false);
  const start = punctPeCurba(a, control, b, tStart);
  const sfarsit = punctPeCurba(a, control, b, tSfarsit);

  // Punctul de control al bucății rămase, ca `<path>`-ul desenat să fie chiar
  // porțiunea de curbă dintre cele două tăieturi, nu o curbă nouă între ele.
  const controlTaiat = punctDeControlAlPortiunii(a, control, b, tStart, tSfarsit);
  const tangenta = tangentaLaCurba(a, control, b, tSfarsit);

  return {
    dela,
    la,
    start,
    sfarsit,
    control: controlTaiat,
    cale: `M ${rotunjeste(start.x)} ${rotunjeste(start.y)} Q ${rotunjeste(controlTaiat.x)} ${rotunjeste(controlTaiat.y)} ${rotunjeste(sfarsit.x)} ${rotunjeste(sfarsit.y)}`,
    mijloc: punctPeCurba(start, controlTaiat, sfarsit, 0.5),
    unghiVarf: (Math.atan2(tangenta.y, tangenta.x) * 180) / Math.PI,
  };
}

/** Toate muchiile rețelei, în ordinea liniilor matricei de adiacență. */
export function construiesteMuchii(
  noduri: Punct[],
  linkuri: boolean[][],
  raza: number | number[],
  indoire: number = INDOIRE_IMPLICITA,
): MuchieDesenata[] {
  const muchii: MuchieDesenata[] = [];
  for (const [i, linie] of linkuri.entries()) {
    for (const [j, are] of linie.entries()) {
      if (!are) continue;
      const muchie = construiesteMuchie(noduri, i, j, raza, indoire);
      if (muchie) muchii.push(muchie);
    }
  }
  return muchii;
}

/**
 * Punctul de control al porțiunii `[t0, t1]` dintr-un Bézier pătratic.
 *
 * O porțiune de Bézier pătratic e tot un Bézier pătratic — de aceea muchia
 * tăiată la contur rămâne exact pe curba inițială, în loc să fie o curbă nouă
 * care doar îi atinge capetele.
 */
function punctDeControlAlPortiunii(
  p0: Punct,
  control: Punct,
  p1: Punct,
  t0: number,
  t1: number,
): Punct {
  const start = punctPeCurba(p0, control, p1, t0);
  const tangenta = tangentaLaCurba(p0, control, p1, t0);
  return { x: start.x + ((t1 - t0) / 2) * tangenta.x, y: start.y + ((t1 - t0) / 2) * tangenta.y };
}

/** Trei zecimale în `d`-ul unui `<path>`: sub un pixel, dar fără cozi lungi. */
function rotunjeste(x: number): number {
  return Math.round(x * 1000) / 1000;
}
