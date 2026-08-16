/**
 * Câmpul de direcții — „albia" prin care curge soluția.
 *
 * Ideea, care e chiar deschiderea paginii 18: ecuația `y′ = f(t, y)` nu spune
 * cine e soluția, ci **ce pantă are ea în fiecare punct al planului**. Desenând
 * panta aceea într-o rețea de puncte se obține un relief; condiția inițială
 * alege apoi de unde pornește apa.
 *
 * Aici stă doar eșantionarea, fără nimic din desen: cât de lung se trage
 * segmentul și cum se scalează pe ecran e treaba componentei care desenează.
 */
import type { ProblemaCauchy } from "@/algorithms/ecuatii-diferentiale/probleme";

export type Punct = { t: number; y: number };

/** O direcție măsurată într-un punct al rețelei. */
export type Directie = Punct & {
  /** `f(t, y)` — panta cerută de ecuație acolo. */
  panta: number;
};

export type Fereastra = {
  t: readonly [number, number];
  y: readonly [number, number];
};

/**
 * Rețeaua de direcții dintr-o fereastră.
 *
 * Punctele se așază **între** marginile ferestrei, nu pe ele: un segment desenat
 * exact pe chenar iese pe jumătate din cadru și pare tăiat.
 */
export function campDirectii(
  f: ProblemaCauchy["f"],
  fereastra: Fereastra,
  coloane: number,
  linii: number,
): Directie[] {
  const [t0, t1] = fereastra.t;
  const [y0, y1] = fereastra.y;
  const pasT = (t1 - t0) / coloane;
  const pasY = (y1 - y0) / linii;

  const puncte: Directie[] = [];
  for (let i = 0; i < coloane; i++) {
    for (let j = 0; j < linii; j++) {
      const t = t0 + (i + 0.5) * pasT;
      const y = y0 + (j + 0.5) * pasY;
      puncte.push({ t, y, panta: f(t, y) });
    }
  }
  return puncte;
}

/**
 * Unghiul cu care se desenează un segment de pantă, în grade, gata de pus
 * într-un `rotate(...)`.
 *
 * **Nu e arctangenta pantei.** Pe ecran, o unitate de `t` și una de `y` nu au
 * aceeași lungime, deci panta trebuie întâi trecută prin raportul scărilor;
 * altfel câmpul desenat ar arăta alte direcții decât cele cerute de ecuație, iar
 * curba care îl urmează ar părea că îl taie. Semnul e negativ fiindcă pe ecran
 * `y` crește în jos.
 */
export function unghiEcran(panta: number, unitatiPeT: number, unitatiPeY: number): number {
  return (-Math.atan((panta * unitatiPeY) / unitatiPeT) * 180) / Math.PI;
}

/**
 * O soluție exactă a ecuației, eșantionată — curbele de fundal din „albie".
 *
 * Se ia din `solutiePrin`, adică din formula analitică, **nu** integrând
 * numeric: altfel fundalul clipului ar fi el însuși o aproximare, iar abaterea
 * lui Euler s-ar măsura față de altă aproximare.
 */
export function curbaSolutie(
  problema: ProblemaCauchy,
  prin: Punct,
  fereastra: Fereastra,
  puncte = 240,
): Punct[] {
  const y = problema.solutiePrin(prin.t, prin.y);
  const [t0, t1] = fereastra.t;
  const iesite: Punct[] = [];
  for (let i = 0; i <= puncte; i++) {
    const t = t0 + ((t1 - t0) * i) / puncte;
    iesite.push({ t, y: y(t) });
  }
  return iesite;
}

/**
 * Bucata de curbă care se vede în fereastră, ruptă în segmente.
 *
 * Fără asta, o soluție care iese pe sus și revine ar fi unită printr-o linie
 * dreaptă peste tot cadrul. Se taie deci în bucăți continue, fiecare desenată
 * separat.
 */
export function bucatiVizibile(curba: readonly Punct[], fereastra: Fereastra): Punct[][] {
  const [ymin, ymax] = fereastra.y;
  const bucati: Punct[][] = [];
  let curenta: Punct[] = [];

  for (const p of curba) {
    if (p.y >= ymin && p.y <= ymax) {
      curenta.push(p);
    } else if (curenta.length > 0) {
      // Punctul de ieșire rămâne în bucată, ca linia să atingă marginea în loc
      // să se oprească cu un pas înainte.
      curenta.push(p);
      bucati.push(curenta);
      curenta = [];
    }
  }
  if (curenta.length > 0) bucati.push(curenta);
  return bucati.filter((b) => b.length >= 2);
}
