/**
 * Metodele cu pas separat pentru problema Cauchy: Euler, punctul de mijloc,
 * Euler modificat și Runge-Kutta de ordin 4.
 *
 * **Sursa: `cursuri_MN/ode-runge-kutta_curs13.md`** — §„Metoda lui Euler",
 * §„Metode particulare de ordin 2" și §„RK de ordin 4". Nimic scris din memorie.
 *
 * Toate patru se scriu la fel aici, ca **sonde**: fiecare metodă cere panta în
 * câteva puncte și pășește cu media lor ponderată,
 *
 *     wᵢ₊₁ = wᵢ + h·Σ pondereⱼ · f(tⱼ, yⱼ).
 *
 * Nu e o rescriere „mai generală" de dragul eleganței: e chiar ce trebuie
 * desenat în clip — săgețile sondelor, apoi una singură, media lor. Că forma
 * asta dă înapoi exact formulele tipărite în curs **nu se presupune**, se
 * verifică: `scripts/verificare-algoritmi/ecuatii-diferentiale.ts` compară pas
 * cu pas cu formulele scrise independent, la `0` diferență.
 */
import type { ProblemaCauchy } from "@/algorithms/ecuatii-diferentiale/probleme";

export type IdMetodaOde = "euler" | "mijloc" | "euler-modificat" | "rk4";

/** O evaluare a lui `f` cerută de metodă, cu ponderea ei în pasul final. */
export type Sonda = {
  /** Numele din curs: „k₁", „k₂"… La Euler, panta e una singură. */
  eticheta: string;
  /** Unde s-a cerut panta. */
  t: number;
  y: number;
  /** Cât a ieșit: `f(t, y)`. */
  panta: number;
  /**
   * Cu ce pondere intră în pasul final. Suma ponderilor e `1` la toate metodele
   * — altfel pasul n-ar fi consistent, adică n-ar reproduce ecuația când `h → 0`.
   *
   * Poate fi `0`: la punctul de mijloc, prima sondă e folosită **doar** ca să
   * se ajungă la mijlocul pasului, iar în pas nu intră deloc.
   */
  pondere: number;
};

export type PasOde = {
  /** Numărul pasului, de la 1. */
  index: number;
  /** Capătul din stânga al pasului și aproximarea de acolo. */
  t: number;
  w: number;
  /** Capătul din dreapta și aproximarea nouă. */
  tUrmator: number;
  wUrmator: number;
  h: number;
  /** Sondele cerute de metodă, în ordinea în care se calculează. */
  sonde: Sonda[];
  /** Panta cu care s-a pășit de fapt: media ponderată a sondelor. */
  pantaPas: number;
  /** Soluția exactă în capătul din dreapta, pentru eroare. */
  exact: number;
  /** `|wᵢ₊₁ − y(tᵢ₊₁)|`. */
  eroare: number;
  /** Ce s-a întâmplat la pasul acesta, într-o propoziție. */
  explicatie: string;
};

export type RezultatOde = {
  metoda: IdMetodaOde;
  h: number;
  pasi: PasOde[];
  /** Eroarea în capătul din dreapta al intervalului. */
  eroareFinala: number;
};

export type MetaMetodaOde = {
  id: IdMetodaOde;
  titlu: string;
  /** Ordinul metodei, așa cum îl dă cursul. */
  ordin: number;
  /** Câte evaluări ale lui `f` costă un pas. */
  evaluari: number;
  /** O propoziție: ce face metoda. */
  rezumat: string;
  sursa: string;
};

export const METODE_ODE: Record<IdMetodaOde, MetaMetodaOde> = {
  euler: {
    id: "euler",
    titlu: "Euler",
    ordin: 1,
    evaluari: 1,
    rezumat: "Merge pe tangenta din capătul din stânga, cât ține pasul.",
    sursa: "curs 13, §„Metoda lui Euler”",
  },
  mijloc: {
    id: "mijloc",
    titlu: "Punctul de mijloc",
    ordin: 2,
    evaluari: 2,
    rezumat: "Face un pas de probă până la mijloc și pășește cu panta de acolo.",
    sursa: "curs 13, §„Metode particulare de ordin 2”",
  },
  "euler-modificat": {
    id: "euler-modificat",
    titlu: "Euler modificat",
    ordin: 2,
    evaluari: 2,
    rezumat: "Face media dintre panta de la începutul pasului și cea din capăt.",
    sursa: "curs 13, §„Metode particulare de ordin 2”",
  },
  rk4: {
    id: "rk4",
    titlu: "Runge-Kutta de ordin 4",
    ordin: 4,
    evaluari: 4,
    rezumat: "Patru pante — una la început, două la mijloc, una la capăt — și media lor ponderată.",
    sursa: "curs 13, §„RK de ordin 4”",
  },
};

/** Sondele unei metode, într-un punct dat. Ordinea e cea din curs. */
function sonde(
  metoda: IdMetodaOde,
  f: ProblemaCauchy["f"],
  t: number,
  w: number,
  h: number,
): Sonda[] {
  const k1 = f(t, w);

  if (metoda === "euler") {
    return [{ eticheta: "f(tᵢ, wᵢ)", t, y: w, panta: k1, pondere: 1 }];
  }

  if (metoda === "mijloc") {
    const tm = t + h / 2;
    const ym = w + (h / 2) * k1;
    return [
      { eticheta: "panta de start", t, y: w, panta: k1, pondere: 0 },
      { eticheta: "panta din mijloc", t: tm, y: ym, panta: f(tm, ym), pondere: 1 },
    ];
  }

  if (metoda === "euler-modificat") {
    const tf = t + h;
    const yf = w + h * k1;
    return [
      { eticheta: "panta de start", t, y: w, panta: k1, pondere: 1 / 2 },
      { eticheta: "panta din capăt", t: tf, y: yf, panta: f(tf, yf), pondere: 1 / 2 },
    ];
  }

  // RK4: `kᵢ` din curs sunt `h·f(…)`; aici se ține panta, adică `kᵢ/h`, ca toate
  // metodele să aibă aceeași formă. Ponderile rămân cele din curs: 1, 2, 2, 1
  // împărțite la 6.
  const tm = t + h / 2;
  const p1 = k1;
  const y2 = w + (h / 2) * p1;
  const p2 = f(tm, y2);
  const y3 = w + (h / 2) * p2;
  const p3 = f(tm, y3);
  const y4 = w + h * p3;
  const p4 = f(t + h, y4);
  return [
    { eticheta: "k₁", t, y: w, panta: p1, pondere: 1 / 6 },
    { eticheta: "k₂", t: tm, y: y2, panta: p2, pondere: 2 / 6 },
    { eticheta: "k₃", t: tm, y: y3, panta: p3, pondere: 2 / 6 },
    { eticheta: "k₄", t: t + h, y: y4, panta: p4, pondere: 1 / 6 },
  ];
}

const zecimale4 = (v: number) => v.toFixed(4).replace(".", ",");

/** Propoziția pasului. Se scrie aici, lângă cifre, nu în componentă. */
function explicatie(metoda: IdMetodaOde, pas: Omit<PasOde, "explicatie">): string {
  const t = zecimale4(pas.t);
  const w = zecimale4(pas.w);
  const wNou = zecimale4(pas.wUrmator);

  if (metoda === "euler") {
    return (
      `În (${t}; ${w}) panta cerută de ecuație e ${zecimale4(pas.pantaPas)}; ` +
      `mergând pe ea un pas întreg se ajunge la ${wNou}.`
    );
  }
  if (metoda === "mijloc") {
    return (
      `Un pas de probă până la mijloc dă panta ${zecimale4(pas.sonde[1]!.panta)}, ` +
      `iar cu ea se face pasul întreg, de la ${w} la ${wNou}.`
    );
  }
  if (metoda === "euler-modificat") {
    return (
      `Panta de la început e ${zecimale4(pas.sonde[0]!.panta)}, cea din capăt ` +
      `${zecimale4(pas.sonde[1]!.panta)}; media lor duce de la ${w} la ${wNou}.`
    );
  }
  return (
    `Patru pante între ${t} și ${zecimale4(pas.tUrmator)}, cântărite 1, 2, 2, 1, ` +
    `dau media ${zecimale4(pas.pantaPas)} și pasul de la ${w} la ${wNou}.`
  );
}

export type ParametriOde = {
  metoda: IdMetodaOde;
  problema: ProblemaCauchy;
  /** Câți pași se fac pe `[a, b]`. Pasul iese `h = (b − a)/N`. */
  N: number;
};

/**
 * Rulează metoda și întoarce toți pașii.
 *
 * Nu există criteriu de oprire și nici stare de eșec: metodele cu pas separat
 * fac exact `N` pași și se opresc în `b`. Ce se poate strica — pasul prea mare
 * pe o ecuație rigidă — se vede ca eroare mare, nu ca oprire.
 */
export function ruleazaOde({ metoda, problema, N }: ParametriOde): RezultatOde {
  const [a, b] = problema.interval;
  const h = (b - a) / N;
  const exacta = problema.solutiePrin(a, problema.alfa);

  const pasi: PasOde[] = [];
  let t = a;
  let w = problema.alfa;

  for (let i = 0; i < N; i++) {
    const s = sonde(metoda, problema.f, t, w, h);
    const pantaPas = s.reduce((suma, sonda) => suma + sonda.pondere * sonda.panta, 0);
    const tUrmator = a + (i + 1) * h;
    const wUrmator = w + h * pantaPas;
    const exact = exacta(tUrmator);

    const fara = {
      index: i + 1,
      t,
      w,
      tUrmator,
      wUrmator,
      h,
      sonde: s,
      pantaPas,
      exact,
      eroare: Math.abs(wUrmator - exact),
    };
    pasi.push({ ...fara, explicatie: explicatie(metoda, fara) });

    t = tUrmator;
    w = wUrmator;
  }

  return { metoda, h, pasi, eroareFinala: pasi[pasi.length - 1]?.eroare ?? 0 };
}

/** Eroarea în capătul din dreapta, direct — fără să se rețină toți pașii. */
export function eroareFinala(metoda: IdMetodaOde, problema: ProblemaCauchy, N: number): number {
  return ruleazaOde({ metoda, problema, N }).eroareFinala;
}

/**
 * Ordinul metodei, **măsurat**, nu enunțat: de câte ori scade eroarea când pasul
 * se înjumătățește, citit ca exponent.
 *
 * `log₂(e(h) / e(h/2))` — pentru o metodă de ordin `p` iese ≈ `p`, fiindcă
 * eroarea globală merge ca `h^p`.
 */
export function ordinMasurat(metoda: IdMetodaOde, problema: ProblemaCauchy, N: number): number {
  const e1 = eroareFinala(metoda, problema, N);
  const e2 = eroareFinala(metoda, problema, 2 * N);
  return Math.log2(e1 / e2);
}

/** Traseul poligonal al metodei: punctele `(tᵢ, wᵢ)`, inclusiv cel de pornire. */
export function traseu(rezultat: RezultatOde, alfa: number): { t: number; y: number }[] {
  const primul = rezultat.pasi[0];
  if (!primul) return [];
  return [
    { t: primul.t, y: alfa },
    ...rezultat.pasi.map((p) => ({ t: p.tUrmator, y: p.wUrmator })),
  ];
}
