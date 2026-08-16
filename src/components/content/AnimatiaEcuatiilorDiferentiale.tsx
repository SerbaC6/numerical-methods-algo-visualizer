import { createContext, useContext } from "react";

import {
  bucatiVizibile,
  campDirectii,
  curbaSolutie,
  unghiEcran,
  type Punct,
} from "@/algorithms/ecuatii-diferentiale/camp-directii";
import {
  ruleazaOde,
  traseu,
  type IdMetodaOde,
  type PasOde,
  type Sonda,
} from "@/algorithms/ecuatii-diferentiale/metode";
import { PROBLEMA } from "@/algorithms/ecuatii-diferentiale/probleme";
import { Clip } from "@/components/viz/Clip";
import { useClip } from "@/components/viz/clip-context";
import { NotatieSVG } from "@/components/viz/Notatie";
import { Subtitrari } from "@/components/viz/Subtitrari";
import { animeaza, clamp, EASING, repere, type Scena } from "@/lib/compozitie";
import { marimeCareIncape } from "@/lib/tipografie-clip";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";

/* ───────────────────────── timpul ───────────────────────── */

const SCENE = [
  {
    nume: "Albia",
    durata: 11,
    descriere:
      "Ecuația nu dă funcția, ci panta ei în fiecare punct al planului. Direcțiile desenate peste tot formează o albie, iar prin ea curg soluțiile.",
  },
  {
    nume: "Cauchy",
    durata: 9,
    descriere:
      "Condiția inițială alege una singură dintre curbe: punctul de pornire se mută, iar curba aprinsă îl urmează.",
  },
  {
    nume: "Euler",
    durata: 14,
    descriere:
      "Metoda lui Euler, cu patru pași: din punctul curent se merge pe tangentă până la capătul pasului, apoi se ia panta din nou. Abaterea față de curba adevărată crește pas cu pas.",
  },
  {
    nume: "PasMic",
    durata: 9,
    descriere:
      "Același drum cu pași din ce în ce mai mici: linia frântă se apropie de curbă, iar eroarea se înjumătățește odată cu pasul.",
  },
  {
    nume: "Ordin2",
    durata: 12,
    descriere:
      "Panta luată mai bine: punctul de mijloc face un pas de probă și folosește panta din mijloc, iar Euler modificat face media dintre panta de la început și cea din capăt.",
  },
  {
    nume: "Rk4",
    durata: 14,
    descriere:
      "Runge-Kutta de ordin 4: patru pante pe același pas — una la început, două la mijloc, una la capăt — topite într-o singură medie cântărită.",
  },
] as const satisfies readonly Scena[];

type NumeScena = (typeof SCENE)[number]["nume"];
const { cue: CUE, total: TOTAL } = repere(SCENE);

/** Cadrul de la mișcare redusă: scara lui Euler, gata construită lângă curbă. */
const CADRU_STATIC = CUE.Euler + 12;

/* ───────────────────────── cifrele ───────────────────────── */

/**
 * Toate cifrele desenate vin din `src/algorithms/ecuatii-diferentiale/`, nu din
 * text scris de mână, și se calculează **o dată**, la încărcarea modulului:
 * nimic din clip nu depinde de parametri.
 */
const FEREASTRA = { t: [0, 2], y: [-0.9, 6.15] } as const;

/** „Albia": direcțiile din rețea. */
const CAMP = campDirectii(PROBLEMA.f, FEREASTRA, 15, 10);

/**
 * Curbele de fundal: soluții adevărate ale aceleiași ecuații, prin puncte de
 * pornire diferite. Nu sunt desenate din ochi și nici integrate numeric — ies
 * din formula analitică, deci albia e chiar albia.
 */
const PORNIRI = [-0.5, 0, 0.3, 0.75, 1, 1.3];
const CURBE_ALBIE = PORNIRI.map((y0) =>
  bucatiVizibile(curbaSolutie(PROBLEMA, { t: 0, y: y0 }, FEREASTRA), FEREASTRA),
);

const CURBA_EXACTA: Punct[] = curbaSolutie(
  PROBLEMA,
  { t: PROBLEMA.interval[0], y: PROBLEMA.alfa },
  FEREASTRA,
);

/** Pornirea din care se aprinde curba aleasă, înainte să alunece la α. */
const PORNIRE_INALTA = 2.1;

/** Euler cu patru pași — scara pe care se vede abaterea. */
const EULER_4 = ruleazaOde({ metoda: "euler", problema: PROBLEMA, N: 4 });
const TRASEU_EULER_4 = traseu(EULER_4, PROBLEMA.alfa);

/** Aceeași metodă, cu pasul înjumătățit de trei ori. */
const TREPTE = [4, 8, 16, 32] as const;
const EULER_TREPTE = TREPTE.map((N) => ruleazaOde({ metoda: "euler", problema: PROBLEMA, N }));
const TRASEE_TREPTE = EULER_TREPTE.map((r) => traseu(r, PROBLEMA.alfa));

/**
 * Un singur pas, cu `h = 1`, pentru scenele de comparație: la pas mare
 * diferența dintre metode se vede cu ochiul liber.
 */
const PAS_MARE: Record<IdMetodaOde, PasOde> = {
  euler: ruleazaOde({ metoda: "euler", problema: PROBLEMA, N: 2 }).pasi[0]!,
  mijloc: ruleazaOde({ metoda: "mijloc", problema: PROBLEMA, N: 2 }).pasi[0]!,
  "euler-modificat": ruleazaOde({ metoda: "euler-modificat", problema: PROBLEMA, N: 2 }).pasi[0]!,
  rk4: ruleazaOde({ metoda: "rk4", problema: PROBLEMA, N: 2 }).pasi[0]!,
};

/** Traseele complete cu același pas, pentru comparația finală. */
const N_COMPARATIE = 20;
const TRASEU_RK4 = traseu(
  ruleazaOde({ metoda: "rk4", problema: PROBLEMA, N: N_COMPARATIE }),
  PROBLEMA.alfa,
);
const EROARE_RK4 = ruleazaOde({
  metoda: "rk4",
  problema: PROBLEMA,
  N: N_COMPARATIE,
}).eroareFinala;
const EROARE_EULER_COMP = ruleazaOde({
  metoda: "euler",
  problema: PROBLEMA,
  N: N_COMPARATIE,
}).eroareFinala;

/* ───────────────────────── roluri ───────────────────────── */

const ROL_CAMP = "grila" as const satisfies RolViz;
const ROL_ALBIE = "anterior" as const satisfies RolViz;
const ROL_EXACTA = "functie" as const satisfies RolViz;
const ROL_METODA = "curent" as const satisfies RolViz;
const ROL_ACCENT = "interval" as const satisfies RolViz;
const ROL_START = "solutie" as const satisfies RolViz;
/** Cât de lat se desenează segmentul unei sonde, în unități de `t`. */
const LATIME_SONDA = 0.42;

/** Pasul de probă se desenează cu rolul drumului deja parcurs: e drum aruncat. */
const ROL_PROBA = "anterior" as const satisfies RolViz;

/* ───────────────────────── cadrul de desen ───────────────────────── */

const W = 1920;
const H = 1080;

/**
 * Zona graficului; dreapta rămâne cartonașelor, josul subtitrării.
 *
 * Marginea din stânga e largă intenționat: punctul de pornire stă chiar pe axa
 * verticală, iar numele lui („y(a) = α") se scrie la stânga lui, ca să nu cadă
 * peste curbă. Fără loc acolo, eticheta ieșea din cadru.
 */
const ZONA = { stanga: 250, dreapta: 1190, sus: 200, jos: 850 } as const;

/**
 * Camera: ce bucată de plan se vede în zona graficului.
 *
 * Există fiindcă ultimele două momente arată **un singur pas**, iar la
 * fereastra largă el ocupă un colț: pantele lui k₁…k₄ ajungeau toate patru
 * aproape aceeași linie. Camera se apropie atunci pe pasul acela și se
 * depărtează la loc pentru traseul întreg. Nimic din matematică nu se schimbă —
 * punctele rămân aceleași, doar mărimea la care se văd.
 */
type Camera = { t: readonly [number, number]; y: readonly [number, number] };

const CAMERA_LARGA: Camera = FEREASTRA;
/** Primul pas, cu `h = 1`, umplând cadrul. */
const CAMERA_PAS: Camera = { t: [-0.3, 1.28], y: [0.02, 3.25] };

export type Proiectie = {
  catre: (p: Punct) => { x: number; y: number };
  unitatiPeT: number;
  unitatiPeY: number;
  camera: Camera;
};

function proiector(camera: Camera): Proiectie {
  const unitatiPeT = (ZONA.dreapta - ZONA.stanga) / (camera.t[1] - camera.t[0]);
  const unitatiPeY = (ZONA.jos - ZONA.sus) / (camera.y[1] - camera.y[0]);
  return {
    camera,
    unitatiPeT,
    unitatiPeY,
    catre: (p) => ({
      x: ZONA.stanga + (p.t - camera.t[0]) * unitatiPeT,
      y: ZONA.jos - (p.y - camera.y[0]) * unitatiPeY,
    }),
  };
}

/** Amestecul dintre două camere, pentru apropierea animată. */
const intreCamere = (a: Camera, b: Camera, k: number): Camera => ({
  t: [a.t[0] + (b.t[0] - a.t[0]) * k, a.t[1] + (b.t[1] - a.t[1]) * k],
  y: [a.y[0] + (b.y[0] - a.y[0]) * k, a.y[1] + (b.y[1] - a.y[1]) * k],
});

/**
 * Proiecția curentă, împărțită tuturor pieselor din desen. Un context, nu o
 * proprietate dusă din mână în mână: altfel fiecare linie desenată ar căra
 * camera după ea.
 */
const ContextProiectie = createContext<Proiectie>(proiector(CAMERA_LARGA));
/** Zona în care se taie tot ce e desenat în coordonate de lume. */
const ID_ZONA = "ode-zona-desen";
const useProiectie = () => useContext(ContextProiectie);

const traseuSvg = (puncte: readonly Punct[], catre: Proiectie["catre"]) =>
  puncte
    .map((p) => {
      const e = catre(p);
      return `${e.x.toFixed(1)},${e.y.toFixed(1)}`;
    })
    .join(" ");

/** Ca la restul clipurilor: literele se îngroașă pe un cadru îngust. */
const LATIME_CONFORT = 780;
const scaraText = (latime: number) =>
  latime ? Math.min(2.4, Math.max(1, LATIME_CONFORT / latime)) : 1;

/**
 * Cât se îngroașă liniile pe un cadru îngust.
 *
 * Pânza are 1920 de unități; pe telefon cadrul ajunge la ~330 px, deci o linie
 * de 5 unități se desenează sub un pixel și dispare — exact ce pățea câmpul de
 * direcții. Se scalează după aceeași lățime măsurată ca textul, dar mai
 * cuminte: peste ~1,8 liniile ar începe să se lipească una de alta.
 */
const useGrosime = () => Math.min(scaraText(useClip().latime), 1.8);

const felie = (T: number, a: number, b: number) => (T >= a && T < b ? 1 : 0);
const intra = (T: number, la: number, durata = 0.45) =>
  animeaza({ dela: 0, la: 1, start: la, sfarsit: la + durata, ease: EASING.iesireCubica })(T);

const zecimale = (v: number, cifre = 3) => v.toFixed(cifre).replace(".", ",");
/** Eroarea, scrisă ca „2,4·10⁻¹" — cum se scrie și în verificarea numerică. */
const stiintific = (v: number) => {
  const exponent = Math.floor(Math.log10(v));
  const mantisa = (v / 10 ** exponent).toFixed(1).replace(".", ",");
  const cifre = String(exponent)
    .replace("-", "⁻")
    .replace(/\d/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)]!);
  return `${mantisa}·10${cifre}`;
};

/* ───────────────────────── piese ───────────────────────── */

function Antet({ opacitate, titlu, st }: { opacitate: number; titlu: string; st: number }) {
  return (
    <text
      x={110}
      y={112}
      opacity={opacitate}
      fill="var(--text)"
      style={{ font: `800 ${52 * Math.min(st, 1.3)}px var(--font-sans)` }}
    >
      {titlu}
    </text>
  );
}

function Cartonas({
  x,
  y,
  latime,
  opacitate,
  rol,
  simbol,
  text,
  st,
}: {
  x: number;
  y: number;
  latime: number;
  opacitate: number;
  rol?: RolViz;
  simbol?: string;
  text: string;
  st: number;
}) {
  if (opacitate <= 0) return null;
  const inaltime = 132;
  return (
    <g opacity={opacitate} transform={`translate(${x}, ${y})`}>
      <rect
        width={latime}
        height={inaltime}
        rx={14}
        fill="var(--suprafata)"
        stroke="var(--bordura)"
        strokeWidth={2}
      />
      {rol && <rect width={6} height={inaltime} rx={3} fill={culoareRol(rol)} />}
      {simbol && (
        <text
          x={30}
          y={inaltime / 2 - 24}
          dominantBaseline="central"
          fill={rol ? culoareEticheta(rol) : "var(--text)"}
          style={{ font: `700 ${34 * Math.min(st, 1.3)}px var(--font-mono)` }}
        >
          <NotatieSVG text={simbol} marime={34 * Math.min(st, 1.3)} />
        </text>
      )}
      <text
        x={30}
        y={simbol ? inaltime / 2 + 30 : inaltime / 2}
        dominantBaseline="central"
        fill="var(--text)"
        style={{
          font: `600 ${marimeCareIncape(text, latime - 60) * Math.min(st, 1.35)}px var(--font-sans)`,
        }}
      >
        {text}
      </text>
    </g>
  );
}

/** Axele, cu numele lor. Decor: rezumatul clipului spune totul în cuvinte. */
function Axe({ st }: { st: number }) {
  const { catre, camera } = useProiectie();
  const gr = useGrosime();
  const origine = catre({ t: 0, y: 0 });
  // Reperele se rărește sau se îndesesc după cât se vede: la cameră apropiată,
  // patru repere din jumătate în jumătate ar lăsa axa aproape goală.
  const pas = camera.t[1] - camera.t[0] > 1.6 ? 0.5 : 0.25;
  const repere: number[] = [];
  for (let t = pas; t <= camera.t[1] + 1e-9; t += pas) repere.push(Number(t.toFixed(2)));
  return (
    <g aria-hidden="true">
      <line
        x1={ZONA.stanga}
        x2={ZONA.dreapta + 30}
        y1={origine.y}
        y2={origine.y}
        stroke={culoareRol("grila")}
        strokeWidth={3 * gr}
      />
      <line
        x1={origine.x}
        x2={origine.x}
        y1={ZONA.jos + 20}
        y2={ZONA.sus - 30}
        stroke={culoareRol("grila")}
        strokeWidth={3 * gr}
      />
      <text
        x={ZONA.dreapta + 46}
        y={origine.y + 12}
        fill="var(--text-slab)"
        style={{ font: `600 ${30 * Math.min(st, 1.35)}px var(--font-mono)` }}
      >
        t
      </text>
      <text
        x={origine.x - 46}
        y={ZONA.sus - 30}
        fill="var(--text-slab)"
        style={{ font: `600 ${30 * Math.min(st, 1.35)}px var(--font-mono)` }}
      >
        y
      </text>
      {repere.map((t) => {
        const p = catre({ t, y: 0 });
        return (
          <g key={t}>
            <line
              x1={p.x}
              x2={p.x}
              y1={origine.y - 9}
              y2={origine.y + 9}
              stroke={culoareRol("grila")}
              strokeWidth={3 * gr}
            />
            <text
              x={p.x}
              y={origine.y + 46}
              textAnchor="middle"
              fill="var(--text-slab)"
              style={{ font: `600 ${26 * Math.min(st, 1.35)}px var(--font-mono)` }}
            >
              {zecimale(t, t % 1 === 0 ? 0 : pas < 0.5 ? 2 : 1)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Câmpul de direcții: un segment scurt în fiecare punct al rețelei. */
function Camp({ opacitate }: { opacitate: number }) {
  const { catre, unitatiPeT, unitatiPeY } = useProiectie();
  const gr = useGrosime();
  if (opacitate <= 0) return null;
  const jumatate = 22 * Math.min(gr, 1.35);
  return (
    <g opacity={opacitate} aria-hidden="true" clipPath={`url(#${ID_ZONA})`}>
      {CAMP.map((d, i) => {
        const p = catre(d);
        return (
          <line
            key={i}
            x1={-jumatate}
            x2={jumatate}
            y1={0}
            y2={0}
            transform={`translate(${p.x.toFixed(1)}, ${p.y.toFixed(1)}) rotate(${unghiEcran(
              d.panta,
              unitatiPeT,
              unitatiPeY,
            ).toFixed(2)})`}
            stroke={culoareRol(ROL_CAMP)}
            strokeWidth={4 * gr}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

function Curba({
  puncte,
  rol,
  opacitate,
  grosime = 7,
  punctata = false,
}: {
  puncte: readonly Punct[];
  rol: RolViz;
  opacitate: number;
  grosime?: number;
  punctata?: boolean;
}) {
  const { catre } = useProiectie();
  const gr = useGrosime();
  if (opacitate <= 0 || puncte.length < 2) return null;
  return (
    <polyline
      clipPath={`url(#${ID_ZONA})`}
      points={traseuSvg(puncte, catre)}
      fill="none"
      stroke={culoareRol(rol)}
      strokeWidth={grosime * gr}
      strokeOpacity={opacitate}
      strokeDasharray={punctata ? `${18 * gr} ${14 * gr}` : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Marcaj({
  punct,
  rol,
  opacitate,
  raza = 15,
}: {
  punct: Punct;
  rol: RolViz;
  opacitate: number;
  raza?: number;
}) {
  const { catre } = useProiectie();
  const gr = useGrosime();
  if (opacitate <= 0) return null;
  const p = catre(punct);
  return (
    <circle
      clipPath={`url(#${ID_ZONA})`}
      cx={p.x}
      cy={p.y}
      r={raza * gr}
      fill={culoareRol(rol)}
      stroke="var(--fundal)"
      strokeWidth={4 * gr}
      opacity={opacitate}
    />
  );
}

/** Capătul din dreapta al segmentului unei sonde — acolo se scrie numele ei. */
const capatSonda = (sonda: Sonda, latime: number): Punct => ({
  t: sonda.t + latime / 2,
  y: sonda.y + (sonda.panta * latime) / 2,
});

/** Segmentul de pantă al unei sonde, centrat pe punctul ei. */
function SegmentPanta({
  sonda,
  latime,
  rol,
  opacitate,
  grosime = 6,
}: {
  sonda: Sonda;
  /** Cât de lat e segmentul, în unități de `t`. */
  latime: number;
  rol: RolViz;
  opacitate: number;
  grosime?: number;
}) {
  const { catre } = useProiectie();
  const gr = useGrosime();
  if (opacitate <= 0) return null;
  const stanga = { t: sonda.t - latime / 2, y: sonda.y - (sonda.panta * latime) / 2 };
  const dreapta = { t: sonda.t + latime / 2, y: sonda.y + (sonda.panta * latime) / 2 };
  const a = catre(stanga);
  const b = catre(dreapta);
  return (
    <g opacity={opacitate} clipPath={`url(#${ID_ZONA})`}>
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={culoareRol(rol)}
        strokeWidth={grosime * gr}
        strokeLinecap="round"
      />
      <Marcaj punct={sonda} rol={rol} opacitate={1} raza={10} />
    </g>
  );
}

/** Cât s-a depărtat metoda de curbă, ca segment vertical între cele două puncte. */
function Abatere({
  t,
  de_la,
  pana_la,
  opacitate,
}: {
  t: number;
  de_la: number;
  pana_la: number;
  opacitate: number;
}) {
  const { catre } = useProiectie();
  const gr = useGrosime();
  if (opacitate <= 0) return null;
  const a = catre({ t, y: de_la });
  const b = catre({ t, y: pana_la });
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={culoareRol(ROL_ACCENT)}
      strokeWidth={5 * gr}
      strokeDasharray={`${12 * gr} ${10 * gr}`}
      opacity={opacitate}
    />
  );
}

/** Numele scris lângă un punct — cu culoarea de etichetă, nu cu cea de desen. */
function Nume({
  punct,
  text,
  rol,
  opacitate,
  dx = 24,
  dy = -20,
  st,
  ancora = "start",
}: {
  punct: Punct;
  text: string;
  rol: RolViz;
  opacitate: number;
  dx?: number;
  dy?: number;
  st: number;
  ancora?: "start" | "middle" | "end";
}) {
  const { catre } = useProiectie();
  if (opacitate <= 0) return null;
  const p = catre(punct);
  const marime = 30 * Math.min(st, 1.35);
  return (
    <text
      x={p.x + dx}
      y={p.y + dy}
      textAnchor={ancora}
      opacity={opacitate}
      fill={culoareEticheta(rol)}
      style={{ font: `700 ${marime}px var(--font-mono)` }}
    >
      <NotatieSVG text={text} marime={marime} />
    </text>
  );
}

/* ───────────────────────── desenul ───────────────────────── */

function Desen() {
  const { T, cue, latime } = useClip<NumeScena>();
  const st = scaraText(latime);

  /* ── camera ── */
  // Se apropie pe pasul singular la începutul scenei cu metodele de ordin 2 și
  // se depărtează la loc înainte de traseul întreg al lui RK4.
  const apropiere =
    animeaza({ dela: 0, la: 1, start: cue.Ordin2, sfarsit: cue.Ordin2 + 1.1 })(T) -
    animeaza({ dela: 0, la: 1, start: cue.Rk4 + 8.2, sfarsit: cue.Rk4 + 9.4 })(T);
  const proiectie = proiector(intreCamere(CAMERA_LARGA, CAMERA_PAS, apropiere));

  /* ── albia ── */
  const A = cue.Albia;
  const oAlbia = felie(T, A, cue.Cauchy);
  const camp = intra(T, A + 0.6, 1.2);
  const albie = intra(T, A + 4.2, 1.6);

  /* ── condiția inițială ── */
  const C = cue.Cauchy;
  const oCauchy = felie(T, C, cue.Euler);
  /** Punctul de pornire alunecă de sus la α; curba aprinsă e mereu cea prin el. */
  const yStart = animeaza({
    dela: PORNIRE_INALTA,
    la: PROBLEMA.alfa,
    start: C + 3.4,
    sfarsit: C + 6.0,
  })(T);
  const curbaAleasa = bucatiVizibile(
    curbaSolutie(PROBLEMA, { t: 0, y: yStart }, FEREASTRA),
    FEREASTRA,
  );

  /* ── Euler ── */
  const E = cue.Euler;
  const oEuler = felie(T, E, cue.PasMic);
  /** Câți pași s-au făcut: unul la fiecare 2,4 secunde. */
  const pasiFacuti = clamp(Math.floor((T - E - 1.6) / 2.4) + 1, 0, EULER_4.pasi.length);
  const pasCurent = EULER_4.pasi[Math.max(0, pasiFacuti - 1)]!;
  /** Cât s-a parcurs din pasul curent — tangenta se trage, nu apare gata. */
  const inPas = clamp((T - E - 1.6 - (pasiFacuti - 1) * 2.4) / 1.4, 0, 1);
  const varf =
    pasiFacuti === 0
      ? { t: pasCurent.t, y: pasCurent.w }
      : {
          t: pasCurent.t + (pasCurent.tUrmator - pasCurent.t) * inPas,
          y: pasCurent.w + (pasCurent.wUrmator - pasCurent.w) * inPas,
        };
  const traseuEuler = [
    ...TRASEU_EULER_4.slice(0, Math.max(1, pasiFacuti)),
    ...(pasiFacuti > 0 ? [varf] : []),
  ];

  /* ── pas mai mic ── */
  const P = cue.PasMic;
  const oPasMic = felie(T, P, cue.Ordin2);
  const treapta = clamp(Math.floor((T - P - 0.8) / 1.9), 0, TREPTE.length - 1);

  /* ── ordin 2 ── */
  const O = cue.Ordin2;
  const oOrdin2 = felie(T, O, cue.Rk4);
  const pasMijloc = PAS_MARE.mijloc;
  const pasModificat = PAS_MARE["euler-modificat"];
  const oProba =
    intra(T, O + 1.2, 0.6) * animeaza({ dela: 1, la: 0, start: O + 6.4, sfarsit: O + 7.0 })(T);
  const oMijloc =
    intra(T, O + 3.2, 0.6) * animeaza({ dela: 1, la: 0.18, start: O + 6.4, sfarsit: O + 7.0 })(T);
  /** Cartonașul rămâne întreg după ce linia s-a stins: cele două se compară. */
  const oMijlocCartonas = intra(T, O + 3.2, 0.6);
  const oModificat = intra(T, O + 7.4, 0.6);

  /* ── RK4 ── */
  const R = cue.Rk4;
  const oRk4 = felie(T, R, TOTAL + 1);
  const pasRk = PAS_MARE.rk4;
  /** Sondele apar una câte una, la 1,1 secunde. */
  const sondeVizibile = clamp(Math.floor((T - R - 0.8) / 1.1) + 1, 0, pasRk.sonde.length);
  /** Apoi se sting, iar pasul rămâne singur. */
  const oSonde = animeaza({ dela: 1, la: 0, start: R + 6.0, sfarsit: R + 7.6 })(T);
  const oPasRk = intra(T, R + 6.2, 0.8);
  const oTraseuRk = intra(T, R + 9.6, 1.2);

  return (
    <ContextProiectie.Provider value={proiectie}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
        {/* Camera se apropie și se depărtează, deci curbele ies din zona
            graficului la orice moment; tot ce e desenat în lume se taie aici,
            ca să nu ajungă peste titlu sau peste cartonașe. */}
        <defs>
          <clipPath id={ID_ZONA}>
            <rect
              x={ZONA.stanga - 12}
              y={ZONA.sus - 62}
              width={ZONA.dreapta - ZONA.stanga + 34}
              height={ZONA.jos - ZONA.sus + 96}
            />
          </clipPath>
        </defs>
        <Axe st={st} />

        {/* ═══ albia ═══ */}
        <Antet opacitate={oAlbia} titlu="Ecuația dă panta, nu funcția" st={st} />
        <g opacity={oAlbia}>
          <Camp opacitate={camp} />
          {CURBE_ALBIE.map((bucati, i) =>
            bucati.map((bucata, j) => (
              <Curba
                key={`${i}-${j}`}
                puncte={bucata}
                rol={ROL_ALBIE}
                opacitate={albie * 0.75}
                grosime={5}
              />
            )),
          )}
          <Cartonas
            x={1250}
            y={300}
            latime={560}
            opacitate={intra(T, A + 1.6, 0.5)}
            rol={ROL_CAMP}
            simbol="y′ = f(t, y)"
            text="panta cerută în fiecare punct"
            st={st}
          />
          <Cartonas
            x={1250}
            y={470}
            latime={560}
            opacitate={intra(T, A + 5.6, 0.5)}
            rol={ROL_ALBIE}
            simbol="o familie"
            text="fiecare curbă urmează aceleași direcții"
            st={st}
          />
        </g>

        {/* ═══ condiția inițială ═══ */}
        <Antet opacitate={oCauchy} titlu="Punctul de pornire alege curba" st={st} />
        <g opacity={oCauchy}>
          <Camp opacitate={0.45} />
          {CURBE_ALBIE.map((bucati, i) =>
            bucati.map((bucata, j) => (
              <Curba
                key={`${i}-${j}`}
                puncte={bucata}
                rol={ROL_ALBIE}
                opacitate={0.3}
                grosime={5}
              />
            )),
          )}
          {curbaAleasa.map((bucata, j) => (
            <Curba
              key={j}
              puncte={bucata}
              rol={ROL_EXACTA}
              opacitate={intra(T, C + 1.0, 0.8)}
              grosime={8}
            />
          ))}
          <Marcaj
            punct={{ t: 0, y: yStart }}
            rol={ROL_START}
            opacitate={intra(T, C + 0.6, 0.5)}
            raza={17}
          />
          <Nume
            punct={{ t: 0, y: yStart }}
            text="y(a) = α"
            rol={ROL_START}
            opacitate={intra(T, C + 0.6, 0.5)}
            dx={-30}
            dy={10}
            ancora="end"
            st={st}
          />
          <Cartonas
            x={1250}
            y={300}
            latime={560}
            opacitate={intra(T, C + 6.4, 0.5)}
            rol={ROL_EXACTA}
            simbol="o singură curbă"
            text="ecuația plus punctul o determină"
            st={st}
          />
        </g>

        {/* ═══ Euler ═══ */}
        <Antet opacitate={oEuler} titlu="Euler: mergi pe tangentă, un pas" st={st} />
        <g opacity={oEuler}>
          <Camp opacitate={0.3} />
          <Curba puncte={CURBA_EXACTA} rol={ROL_EXACTA} opacitate={0.9} grosime={7} punctata />
          {/* Tangenta pasului curent, ca segment de pantă: ea e ce se urmează. */}
          {pasiFacuti > 0 && (
            <SegmentPanta
              sonda={pasCurent.sonde[0]!}
              latime={0.34}
              rol={ROL_ACCENT}
              opacitate={inPas < 1 ? 1 : 0.35}
            />
          )}
          <Curba puncte={traseuEuler} rol={ROL_METODA} opacitate={1} grosime={8} />
          {TRASEU_EULER_4.slice(0, pasiFacuti + 1).map((p, i) => (
            <Marcaj
              key={i}
              punct={p}
              rol={i === 0 ? ROL_START : ROL_METODA}
              opacitate={1}
              raza={13}
            />
          ))}
          {/* Abaterea de la ultimul punct calculat, ca segment vertical. */}
          {pasiFacuti > 0 && inPas >= 1 && (
            <Abatere
              t={pasCurent.tUrmator}
              de_la={pasCurent.wUrmator}
              pana_la={pasCurent.exact}
              opacitate={0.9}
            />
          )}
          <Cartonas
            x={1250}
            y={300}
            latime={560}
            opacitate={intra(T, E + 0.8, 0.5)}
            rol={ROL_METODA}
            simbol="h = 0,5"
            text="patru pași de la 0 la 2"
            st={st}
          />
          <Cartonas
            x={1250}
            y={470}
            latime={560}
            opacitate={pasiFacuti > 0 ? 1 : 0}
            rol={ROL_ACCENT}
            simbol={`panta ${zecimale(pasCurent.pantaPas, 2)}`}
            text="cerută de ecuație în punctul curent"
            st={st}
          />
          <Cartonas
            x={1250}
            y={640}
            latime={560}
            opacitate={pasiFacuti > 0 && inPas >= 1 ? 1 : 0}
            rol={ROL_EXACTA}
            simbol={`abatere ${zecimale(pasCurent.eroare, 3)}`}
            text="cât s-a depărtat de curba adevărată"
            st={st}
          />
        </g>

        {/* ═══ pas mai mic ═══ */}
        <Antet opacitate={oPasMic} titlu="Pas mai mic, drum mai aproape" st={st} />
        <g opacity={oPasMic}>
          <Curba puncte={CURBA_EXACTA} rol={ROL_EXACTA} opacitate={0.9} grosime={7} punctata />
          {TRASEE_TREPTE.slice(0, treapta + 1).map((tr, i) => (
            <Curba
              key={i}
              puncte={tr}
              rol={ROL_METODA}
              opacitate={i === treapta ? 1 : 0.25}
              grosime={i === treapta ? 8 : 5}
            />
          ))}
          <Marcaj punct={{ t: 0, y: PROBLEMA.alfa }} rol={ROL_START} opacitate={1} raza={13} />
          <Cartonas
            x={1250}
            y={300}
            latime={560}
            opacitate={1}
            rol={ROL_METODA}
            simbol={`h = ${zecimale(EULER_TREPTE[treapta]!.h, 4)}`}
            text={`${TREPTE[treapta]} pași`}
            st={st}
          />
          <Cartonas
            x={1250}
            y={470}
            latime={560}
            opacitate={1}
            rol={ROL_ACCENT}
            simbol={`eroare ${zecimale(EULER_TREPTE[treapta]!.eroareFinala, 3)}`}
            text="se înjumătățește odată cu pasul"
            st={st}
          />
        </g>

        {/* ═══ ordin 2 ═══ */}
        <Antet opacitate={oOrdin2} titlu="Aceeași idee, panta luată mai bine" st={st} />
        <g opacity={oOrdin2}>
          <Curba puncte={CURBA_EXACTA} rol={ROL_EXACTA} opacitate={0.9} grosime={7} punctata />
          <Marcaj
            punct={{ t: pasMijloc.t, y: pasMijloc.w }}
            rol={ROL_START}
            opacitate={1}
            raza={15}
          />

          {/* Pasul de probă până la mijloc, apoi panta găsită acolo. */}
          <Curba
            puncte={[
              { t: pasMijloc.t, y: pasMijloc.w },
              { t: pasMijloc.sonde[1]!.t, y: pasMijloc.sonde[1]!.y },
            ]}
            rol={ROL_PROBA}
            opacitate={oProba * 0.75}
            grosime={6}
            punctata
          />
          <SegmentPanta
            sonda={pasMijloc.sonde[1]!}
            latime={0.5}
            rol={ROL_ACCENT}
            opacitate={oMijloc}
          />
          <Curba
            puncte={[
              { t: pasMijloc.t, y: pasMijloc.w },
              { t: pasMijloc.tUrmator, y: pasMijloc.wUrmator },
            ]}
            rol={ROL_METODA}
            opacitate={oMijloc}
            grosime={8}
          />
          <Marcaj
            punct={{ t: pasMijloc.tUrmator, y: pasMijloc.wUrmator }}
            rol={ROL_METODA}
            opacitate={oMijloc}
            raza={13}
          />

          {/* Euler modificat: media pantelor de la capete. */}
          <SegmentPanta
            sonda={pasModificat.sonde[0]!}
            latime={0.4}
            rol={ROL_ACCENT}
            opacitate={oModificat * 0.8}
          />
          <SegmentPanta
            sonda={pasModificat.sonde[1]!}
            latime={0.4}
            rol={ROL_ACCENT}
            opacitate={oModificat * 0.8}
          />
          <Curba
            puncte={[
              { t: pasModificat.t, y: pasModificat.w },
              { t: pasModificat.tUrmator, y: pasModificat.wUrmator },
            ]}
            rol={ROL_START}
            opacitate={oModificat}
            grosime={8}
          />
          <Marcaj
            punct={{ t: pasModificat.tUrmator, y: pasModificat.wUrmator }}
            rol={ROL_START}
            opacitate={oModificat}
            raza={13}
          />

          <Cartonas
            x={1250}
            y={300}
            latime={560}
            opacitate={oMijlocCartonas}
            rol={ROL_METODA}
            simbol="punctul de mijloc"
            text="pas de probă până la mijloc, apoi panta de acolo"
            st={st}
          />
          <Cartonas
            x={1250}
            y={470}
            latime={560}
            opacitate={oModificat}
            rol={ROL_START}
            simbol="Euler modificat"
            text="media dintre panta de la început și cea din capăt"
            st={st}
          />
          <Cartonas
            x={1250}
            y={640}
            latime={560}
            opacitate={intra(T, O + 9.6, 0.5)}
            rol={ROL_ACCENT}
            simbol="a doua evaluare"
            text="atât costă trecerea de la ordinul 1 la 2"
            st={st}
          />
        </g>

        {/* ═══ RK4 ═══ */}
        <Antet opacitate={oRk4} titlu="Patru pante, o singură medie" st={st} />
        <g opacity={oRk4}>
          <Curba puncte={CURBA_EXACTA} rol={ROL_EXACTA} opacitate={0.9} grosime={7} punctata />
          <Marcaj punct={{ t: pasRk.t, y: pasRk.w }} rol={ROL_START} opacitate={1} raza={15} />
          {pasRk.sonde.slice(0, sondeVizibile).map((sonda, i) => (
            <g key={i}>
              <SegmentPanta
                sonda={sonda}
                latime={LATIME_SONDA}
                rol={ROL_ACCENT}
                opacitate={oSonde}
              />
              {/* Numele stă la capătul segmentului, nu deasupra punctului:
                  acolo cădea peste curbă, iar k₂ și k₃ unul peste altul. */}
              <Nume
                punct={capatSonda(sonda, LATIME_SONDA)}
                text={sonda.eticheta}
                rol={ROL_ACCENT}
                opacitate={oSonde}
                dx={16}
                dy={-8}
                st={st}
              />
            </g>
          ))}
          <Curba
            puncte={[
              { t: pasRk.t, y: pasRk.w },
              { t: pasRk.tUrmator, y: pasRk.wUrmator },
            ]}
            rol={ROL_METODA}
            opacitate={oPasRk}
            grosime={9}
          />
          <Marcaj
            punct={{ t: pasRk.tUrmator, y: pasRk.wUrmator }}
            rol={ROL_METODA}
            opacitate={oPasRk}
            raza={14}
          />
          {/* Mai subțire decât curba punctată de dedesubt, ca ea să se vadă pe sub:
            altfel „drumul se lipește de curbă" n-ar avea de ce să se lipească. */}
          <Curba puncte={TRASEU_RK4} rol={ROL_METODA} opacitate={oTraseuRk} grosime={5} />
          <Cartonas
            x={1250}
            y={300}
            latime={560}
            opacitate={intra(T, R + 0.8, 0.5)}
            rol={ROL_ACCENT}
            simbol="k₁ k₂ k₃ k₄"
            text="una la început, două la mijloc, una la capăt"
            st={st}
          />
          <Cartonas
            x={1250}
            y={470}
            latime={560}
            opacitate={oPasRk}
            rol={ROL_METODA}
            simbol="1 : 2 : 2 : 1"
            text="mijlocul cântărește dublu față de capete"
            st={st}
          />
          <Cartonas
            x={1250}
            y={640}
            latime={560}
            opacitate={intra(T, R + 10.4, 0.5)}
            rol={ROL_EXACTA}
            simbol={`${stiintific(EROARE_RK4)} față de ${stiintific(EROARE_EULER_COMP)}`}
            text="același pas, patru evaluări în loc de una"
            st={st}
          />
        </g>
      </svg>
    </ContextProiectie.Provider>
  );
}

/* ───────────────────────── piesa întreagă ───────────────────────── */

const SUBTITRARI = [
  { la: CUE.Albia + 0.6, text: "O ecuație diferențială nu spune cine e funcția." },
  { la: CUE.Albia + 3.0, text: "Spune doar ce pantă are ea în fiecare punct al planului." },
  {
    la: CUE.Albia + 5.6,
    text: "Direcțiile astea formează o albie, iar soluțiile sunt apa care curge prin ea.",
  },
  {
    la: CUE.Albia + 8.6,
    text: "Toate curbele respectă aceleași direcții — sunt o familie întreagă.",
  },
  { la: CUE.Cauchy + 0.6, text: "Ca să rămână una singură, se dă un punct de pornire." },
  {
    la: CUE.Cauchy + 3.4,
    text: "Mutând punctul, se aprinde altă curbă: ecuația plus condiția inițială o aleg împreună.",
  },
  {
    la: CUE.Cauchy + 6.6,
    text: "Asta e problema Cauchy — și de aici încolo, ce se poate calcula.",
  },
  {
    la: CUE.Euler + 0.6,
    text: "Curba adevărată e rareori de scris. Se calculează în câteva momente.",
  },
  {
    la: CUE.Euler + 2.6,
    text: "Euler face cel mai simplu lucru: merge pe tangenta din punctul în care se află.",
  },
  { la: CUE.Euler + 6.0, text: "Din capătul pasului ia panta din nou și pleacă mai departe." },
  {
    la: CUE.Euler + 9.4,
    text: "Panta e luată doar la începutul pasului, deci pe o curbă abaterea se adună.",
  },
  { la: CUE.PasMic + 0.6, text: "Prima reparație e evidentă: pași mai mici." },
  { la: CUE.PasMic + 3.4, text: "La pas înjumătățit, eroarea se înjumătățește și ea." },
  {
    la: CUE.PasMic + 6.2,
    text: "Câștigul e lent, iar fiecare pas costă tot o evaluare a funcției.",
  },
  {
    la: CUE.Ordin2 + 0.6,
    text: "A doua reparație: să nu credem panta de la început pe tot pasul.",
  },
  {
    la: CUE.Ordin2 + 3.2,
    text: "Un pas de probă până la mijloc, iar pasul adevărat se face cu panta de acolo.",
  },
  {
    la: CUE.Ordin2 + 7.4,
    text: "Sau se ia media dintre panta de la început și cea din capăt.",
  },
  {
    la: CUE.Ordin2 + 10.0,
    text: "Cu o singură evaluare în plus, ambele urmează curbura, nu doar direcția.",
  },
  { la: CUE.Rk4 + 0.6, text: "Runge-Kutta de ordin 4 duce ideea până la capăt." },
  {
    la: CUE.Rk4 + 3.4,
    text: "Patru pante pe același pas: una la început, două la mijloc, una la capăt.",
  },
  { la: CUE.Rk4 + 6.4, text: "Pasul se face cu media lor, în care mijlocul cântărește dublu." },
  {
    la: CUE.Rk4 + 9.4,
    text: "Cu același pas, drumul se lipește de curbă: patru evaluări cumpără patru ordine de precizie.",
  },
] as const;

/**
 * Clipul paginii 18: de la „ecuația dă panta" la Runge-Kutta de ordin 4.
 *
 * Scris în cod, ca toate clipurile site-ului. Nicio cifră nu e transcrisă:
 * câmpul de direcții, curbele din albie, pașii lui Euler, sondele lui RK4 și
 * erorile scrise pe cartonașe se calculează la încărcarea modulului, cu
 * funcțiile din `src/algorithms/ecuatii-diferentiale/`. Desenul și numerele de
 * pe el nu se pot contrazice, fiindcă vin din același loc.
 *
 * Exemplul e fix — `y′ = y − t² + 1`, `y(0) = 0,5`, pe `[0, 2]` — iar soluția
 * lui exactă se scrie analitic, deci abaterea fiecărei metode se măsoară față
 * de un număr adevărat, nu față de altă aproximare.
 */
export function AnimatiaEcuatiilorDiferentiale() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație despre ecuații diferențiale cu condiție inițială. Întâi se desenează câmpul de " +
        "direcții: în fiecare punct al planului, ecuația cere o pantă, iar segmentele astea " +
        "formează o albie prin care curg soluțiile — o familie întreagă de curbe. Se pune apoi " +
        "un punct de pornire, care alege una singură dintre ele: asta e problema Cauchy. " +
        "Urmează metoda lui Euler, cu patru pași: din punctul curent se merge pe tangentă până " +
        "la capătul pasului, iar abaterea față de curba adevărată crește pas cu pas. Cu pași " +
        "din ce în ce mai mici, linia frântă se apropie de curbă, dar câștigul e lent: la pas " +
        "înjumătățit, eroarea se înjumătățește. Se arată apoi metodele de ordin 2 — punctul de " +
        "mijloc, care face un pas de probă și folosește panta din mijloc, și Euler modificat, " +
        "care face media pantelor de la capetele pasului. La final, Runge-Kutta de ordin 4 cere " +
        "patru pante pe același pas și pășește cu media lor cântărită, iar drumul ajunge lipit " +
        "de curba exactă."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
