/**
 * Cuadratura adaptivă bazată pe Simpson.
 *
 * **Sursa: `cursuri_MN/romberg-cuadraturi-gaussiene_curs12.md`, §„Cuadraturi
 * adaptive".** Nimic scris din memorie.
 *
 * Ideea, în forma din curs: pe un interval se calculează Simpson o dată cu un
 * panou și o dată cu două. Diferența dintre cele două nu e aruncată — ea
 * **estimează eroarea**, fiindcă varianta cu două panouri aproximează de 15 ori
 * mai bine:
 *
 *     |I − S(a,c) − S(c,b)| ≈ (1/15)·|S(a,b) − S(a,c) − S(c,b)|.
 *
 * De aici testul: dacă `|S(a,b) − S(a,c) − S(c,b)| < 15ε`, bucata e acceptată;
 * altfel se taie la mijloc, iar fiecare jumătate primește toleranța `ε/2`.
 *
 * Valoarea acceptată e chiar `S(a,c) + S(c,b)`, ca în curs — fără corecția
 * Richardson care s-ar putea adăuga din aceeași estimare. Cursul nu o adaugă,
 * deci nici pagina.
 *
 * **Valorile lui `f` se țin minte.** Nu e o optimizare de dragul vitezei, ci
 * chiar lucrul pe care pagina îl compară: metoda se plătește în evaluări ale
 * funcției, iar cele cinci puncte ale unui interval sunt aceleași cu ale
 * jumătăților lui. Fără reținere, un panou ar fi numărat de patru ori și
 * adaptivul ar ieși mai scump decât pasul uniform — ceea ce ar fi o comparație
 * falsă, nu o concluzie. Punctele se potrivesc **bit cu bit**: capătul unei
 * jumătăți e chiar mijlocul calculat de părinte, din aceeași expresie.
 */

import { parabolaPrin } from "@/algorithms/newton-cotes/cuadraturi";
import { stiintific, zecimale } from "@/lib/numere";

/** Un interval vizitat de recursie și ce s-a decis pe el. */
export type NodAdaptiv = {
  a: number;
  b: number;
  /** Mijlocul, unde s-ar tăia. */
  c: number;
  /** Al câtelea nivel de tăiere: `0` e intervalul întreg. */
  nivel: number;
  /** Simpson cu un singur panou pe `[a, b]`. */
  simpluS: number;
  /** Simpson pe `[a, c]` și pe `[c, b]`. */
  stangaS: number;
  dreaptaS: number;
  /** `|S(a,b) − S(a,c) − S(c,b)|` — de aici iese estimarea erorii. */
  diferenta: number;
  /** Toleranța cerută pe bucata asta și pragul cu care se compară, `15ε`. */
  toleranta: number;
  prag: number;
  /** Testul a trecut? Atunci bucata nu se mai taie. */
  acceptat: boolean;
  /** Valoarea reținută, dacă a fost acceptată: `S(a,c) + S(c,b)`. */
  valoare: number;
};

export type PasAdaptiv = {
  /** Numărul pasului, de la 1: câte intervale au fost cercetate până aici. */
  index: number;
  nod: NodAdaptiv;
  /** Panourile acceptate până la pasul acesta, în ordine de la stânga la dreapta. */
  acceptatePanaAici: NodAdaptiv[];
  /** Ce s-a întâmplat, într-o propoziție. */
  explicatie: string;
};

export type RezultatAdaptiv = {
  /** Bucățile pe care s-a oprit recursia, de la stânga la dreapta. */
  panouri: NodAdaptiv[];
  pasi: PasAdaptiv[];
  /** Suma valorilor acceptate. */
  valoare: number;
  /**
   * Câte **puncte diferite** a cerut tot calculul. Aceeași valoare cerută de
   * două ori se plătește o singură dată — vezi nota din capul fișierului.
   */
  evaluari: number;
  /** Cel mai adânc nivel atins. */
  adancime: number;
  /** `true` dacă s-a atins limita de adâncime — atunci rezultatul nu e garantat. */
  oprit: boolean;
};

/** Adâncimea peste care recursia se oprește, oricât ar cere testul. */
const ADANCIME_MAXIMA = 24;

/** Simpson cu un singur panou pe `[a, b]`: `(h/3)·[f(a) + 4f(a+h) + f(b)]`, `h = (b−a)/2`. */
export function simpsonSimplu(f: (x: number) => number, a: number, b: number): number {
  const h = (b - a) / 2;
  return (h / 3) * (f(a) + 4 * f(a + h) + f(b));
}

export type ParametriAdaptiv = {
  f: (x: number) => number;
  a: number;
  b: number;
  /** Toleranța cerută pe tot intervalul. */
  epsilon: number;
};

/**
 * Rulează cuadratura adaptivă și întoarce fiecare interval cercetat, în ordinea
 * în care recursia îl vizitează (adânc, de la stânga la dreapta).
 */
export function ruleazaAdaptiv({ f, a, b, epsilon }: ParametriAdaptiv): RezultatAdaptiv {
  const stiute = new Map<number, number>();
  const cuNumaratoare = (x: number) => {
    const stiut = stiute.get(x);
    if (stiut !== undefined) return stiut;
    const valoare = f(x);
    stiute.set(x, valoare);
    return valoare;
  };

  const pasi: PasAdaptiv[] = [];
  const panouri: NodAdaptiv[] = [];
  let adancime = 0;
  let oprit = false;

  const cerceteaza = (stanga: number, dreapta: number, toleranta: number, nivel: number) => {
    const c = (stanga + dreapta) / 2;
    const simpluS = simpsonSimplu(cuNumaratoare, stanga, dreapta);
    const stangaS = simpsonSimplu(cuNumaratoare, stanga, c);
    const dreaptaS = simpsonSimplu(cuNumaratoare, c, dreapta);
    const diferenta = Math.abs(simpluS - stangaS - dreaptaS);
    const prag = 15 * toleranta;
    const laLimita = nivel >= ADANCIME_MAXIMA;
    const acceptat = diferenta < prag || laLimita;

    const nod: NodAdaptiv = {
      a: stanga,
      b: dreapta,
      c,
      nivel,
      simpluS,
      stangaS,
      dreaptaS,
      diferenta,
      toleranta,
      prag,
      acceptat,
      valoare: stangaS + dreaptaS,
    };

    adancime = Math.max(adancime, nivel);
    if (acceptat) panouri.push(nod);
    if (laLimita && diferenta >= prag) oprit = true;

    pasi.push({
      index: pasi.length + 1,
      nod,
      acceptatePanaAici: [...panouri],
      explicatie: explicatie(nod),
    });

    if (acceptat) return;
    cerceteaza(stanga, c, toleranta / 2, nivel + 1);
    cerceteaza(c, dreapta, toleranta / 2, nivel + 1);
  };

  cerceteaza(a, b, epsilon, 0);

  return {
    panouri,
    pasi,
    valoare: panouri.reduce((s, p) => s + p.valoare, 0),
    evaluari: stiute.size,
    adancime,
    oprit,
  };
}

/** Propoziția pasului. Stă lângă cifre, nu în componentă. */
function explicatie(nod: NodAdaptiv): string {
  const interval = `[${zecimale(nod.a, 3)}; ${zecimale(nod.b, 3)}]`;
  const diferenta = stiintific(nod.diferenta, 2);
  const prag = stiintific(nod.prag, 2);
  return nod.acceptat
    ? `Pe ${interval}, cele două estimări diferă cu ${diferenta}, sub pragul ${prag}: bucata se ` +
        `acceptă așa cum e.`
    : `Pe ${interval}, cele două estimări diferă cu ${diferenta}, peste pragul ${prag}: ` +
        `intervalul se taie la mijloc, iar fiecare jumătate primește jumătate din toleranță.`;
}

/**
 * Formula compusă Simpson cu pas uniform, pe `n` panouri — termenul de
 * comparație pentru adaptiv.
 *
 * `n` e numărul de panouri, deci se folosesc `2n + 1` puncte.
 */
export function simpsonUniform(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number,
): { valoare: number; evaluari: number } {
  const h = (b - a) / (2 * n);
  let suma = f(a) + f(b);
  for (let i = 1; i < 2 * n; i++) suma += (i % 2 === 1 ? 4 : 2) * f(a + i * h);
  return { valoare: (suma * h) / 3, evaluari: 2 * n + 1 };
}

/**
 * Cel mai mic număr de panouri uniforme cu care Simpson ajunge sub eroarea dată.
 *
 * Se caută prin dublare, ca la înjumătățirea pasului, și se oprește la o limită:
 * pe funcții pe care pasul uniform se descurcă prost, căutarea altfel n-ar mai
 * termina.
 */
export function panouriUniformePentru(
  f: (x: number) => number,
  a: number,
  b: number,
  exact: number,
  eroareTinta: number,
  panouriMaxime = 1 << 16,
): { panouri: number; evaluari: number; eroare: number; gasit: boolean } {
  let n = 1;
  for (;;) {
    const { valoare, evaluari } = simpsonUniform(f, a, b, n);
    const eroare = Math.abs(valoare - exact);
    if (eroare <= eroareTinta) return { panouri: n, evaluari, eroare, gasit: true };
    if (n >= panouriMaxime) return { panouri: n, evaluari, eroare, gasit: false };
    n *= 2;
  }
}

/**
 * Conturul figurii pe care metoda o desenează de fapt: arcele de parabolă ale
 * lui Simpson, două pe fiecare panou acceptat.
 *
 * E aceeași idee ca la pagina 16 — figura de pe ecran **este** aproximarea, nu o
 * ilustrație a ei —, iar aria de sub conturul ăsta dă chiar valoarea calculată.
 * Verificat numeric în `scripts/verificare-algoritmi/cuadraturi.ts`.
 */
export function conturAdaptiv(
  rezultat: RezultatAdaptiv,
  f: (x: number) => number,
  puncteDeArc = 14,
): { x: number; y: number }[] {
  const contur: { x: number; y: number }[] = [];
  for (const panou of rezultat.panouri) {
    for (const [stanga, dreapta] of [
      [panou.a, panou.c],
      [panou.c, panou.b],
    ] as const) {
      const mijloc = (stanga + dreapta) / 2;
      // Coeficienții sunt cei ai formulei Simpson; aici nu intră în desen, dar
      // `parabolaPrin` cere nodul întreg.
      const noduri = [
        { x: stanga, y: f(stanga), coeficient: 1 },
        { x: mijloc, y: f(mijloc), coeficient: 4 },
        { x: dreapta, y: f(dreapta), coeficient: 1 },
      ];
      for (let i = 0; i <= puncteDeArc; i++) {
        const x = stanga + ((dreapta - stanga) * i) / puncteDeArc;
        // Primul punct al unui arc e ultimul celui dinainte: nu se repetă.
        if (contur.length > 0 && i === 0) continue;
        contur.push({ x, y: parabolaPrin(noduri, x) });
      }
    }
  }
  return contur;
}
