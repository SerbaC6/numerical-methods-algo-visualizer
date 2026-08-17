import { esantioneaza, polinomLagrange } from "@/algorithms/interpolare-polinomiala/lagrange";
import { getFunctieInterpolata } from "@/algorithms/interpolare-polinomiala/functii-interpolare";
import { evalueazaSpline, splineCubic } from "@/algorithms/interpolare-polinomiala/spline";
import {
  abatereMaxima,
  noduriEchidistante,
  type Nod,
  type Punct,
} from "@/algorithms/interpolare-polinomiala/tipuri";
import { Clip } from "@/components/viz/Clip";
import { useClip } from "@/components/viz/clip-context";
import { NotatieSVG } from "@/components/viz/Notatie";
import { Subtitrari } from "@/components/viz/Subtitrari";
import { animeaza, clamp, EASING, repere, type Scena } from "@/lib/compozitie";
import { zecimale } from "@/lib/numere";
import { marimeCareIncape } from "@/lib/tipografie-clip";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";

/* ───────────────────────── timpul ───────────────────────── */

const SCENE = [
  {
    nume: "Puncte",
    durata: 8,
    descriere:
      "Cinci puncte, atât. Funcția din care vin nu se vede: asta e tot ce știe cine face interpolarea.",
  },
  {
    nume: "Polinom",
    durata: 11,
    descriere:
      "Polinomul de interpolare se trasează prin toate cinci. E singurul de grad cel mult 4 care trece prin ele, apoi apare și funcția adevărată, ca să se vadă cât s-a nimerit.",
  },
  {
    nume: "MaiMulte",
    durata: 13,
    descriere:
      "Se adaugă noduri echidistante: 7, 9, 11. Polinomul nu se apropie de funcție, ci începe să oscileze tot mai tare spre capete.",
  },
  {
    nume: "Spline",
    durata: 12,
    descriere:
      "Pe aceleași 11 noduri, câte o cubică pe fiecare subinterval. Curba rămâne lipită de funcție, iar eroarea scade de aproape o sută de ori.",
  },
] as const satisfies readonly Scena[];

type NumeScena = (typeof SCENE)[number]["nume"];
const { cue: CUE, total: TOTAL } = repere(SCENE);

/** Cadrul de la mișcare redusă: momentul în care oscilația e la maximum. */
const CADRU_STATIC = CUE.MaiMulte + 11.5;

/* ───────────────────────── cifrele ───────────────────────── */

/**
 * **Sursa: `cursuri_MN/interpolare_spline_bezier_teorie_curs09.md`, §8 și §12.**
 * Nimic scris din memorie.
 *
 * Exemplul e chiar cel din curs: funcția lui Runge pe `[−1, 1]`, cu noduri
 * echidistante, la 5 și la 11 puncte. Cifrele nu se transcriu — se calculează
 * o dată, la încărcarea modulului, chiar cu funcțiile din
 * `src/algorithms/interpolare-polinomiala/`, deci desenul și numerele scrise pe
 * el nu se pot contrazice.
 */
const RUNGE = getFunctieInterpolata("runge");
const DOMENIU: readonly [number, number] = [-1.06, 1.06];

/** Câte noduri se văd, pe rând, în scena a treia. */
const TREPTE = [5, 7, 9, 11] as const;

const SETURI: Nod[][] = TREPTE.map((cate) => noduriEchidistante(RUNGE.f, RUNGE.interval, cate));

const CURBE_POLINOM: Punct[][] = SETURI.map((noduri) =>
  esantioneaza((x) => polinomLagrange(noduri, x), DOMENIU, 320),
);

const EROARE_POLINOM: number[] = SETURI.map((noduri) =>
  abatereMaxima((x) => polinomLagrange(noduri, x), RUNGE.f, RUNGE.interval, 4000),
);

const AMPLITUDINE: number[] = CURBE_POLINOM.map((curba) =>
  curba.reduce((max, p) => Math.max(max, Math.abs(p.y)), 0),
);

const NODURI_FINALE = SETURI[TREPTE.length - 1]!;
const SPLINE = splineCubic(NODURI_FINALE, "natural");
const CURBA_SPLINE: Punct[] = esantioneaza((x) => evalueazaSpline(SPLINE, x), RUNGE.interval, 320);
const EROARE_SPLINE = abatereMaxima(
  (x) => evalueazaSpline(SPLINE, x),
  RUNGE.f,
  RUNGE.interval,
  4000,
);

const CURBA_FUNCTIEI: Punct[] = esantioneaza(RUNGE.f, DOMENIU, 320);

/* ───────────────────────── roluri ───────────────────────── */

/**
 * Funcția adevărată se desenează **portocaliu**, nu cu albastrul curbei.
 *
 * Pe tema întunecată, `functie` e aproape alb, iar linia punctată se citea ca o
 * urmă de grilă în loc de curba din care au fost luate valorile — adică tocmai
 * lucrul cu care se compară tot restul clipului. Portocaliul o desparte de
 * polinomul safir la prima privire, fără să mai aibă nevoie de punctare.
 */
const ROL_FUNCTIE = "interval" as const satisfies RolViz;
const ROL_POLINOM = "curent" as const satisfies RolViz;
const ROL_NODURI = "anterior" as const satisfies RolViz;
const ROL_SPLINE = "solutie" as const satisfies RolViz;
const ROL_ACCENT = "pivot" as const satisfies RolViz;

/* ───────────────────────── cadrul de desen ───────────────────────── */

const W = 1920;
const H = 1080;

/** Zona în care intră graficul; dreapta rămâne cartonașelor, josul subtitrării. */
const ZONA = { stanga: 130, dreapta: 1190, sus: 200, jos: 850 } as const;

/**
 * Cât se vede pe verticală.
 *
 * Sus se lasă loc până la 2,1: oscilația de la 11 noduri urcă la 1,96, iar dacă
 * ar ieși din cadru tocmai afirmația scenei a treia ar rămâne nedemonstrată.
 */
const LUMEA_Y: readonly [number, number] = [-0.62, 2.12];

const catreEcran = (p: Punct) => ({
  x: ZONA.stanga + ((p.x - DOMENIU[0]) / (DOMENIU[1] - DOMENIU[0])) * (ZONA.dreapta - ZONA.stanga),
  y: ZONA.jos - ((p.y - LUMEA_Y[0]) / (LUMEA_Y[1] - LUMEA_Y[0])) * (ZONA.jos - ZONA.sus),
});

const traseu = (puncte: readonly Punct[]) =>
  puncte.map((p) => `${catreEcran(p).x.toFixed(1)},${catreEcran(p).y.toFixed(1)}`).join(" ");

/** Ca la restul clipurilor: literele se îngroașă pe un cadru îngust. */
const LATIME_CONFORT = 780;
const scaraText = (latime: number) =>
  latime ? Math.min(2.4, Math.max(1, LATIME_CONFORT / latime)) : 1;

const felie = (T: number, a: number, b: number) => (T >= a && T < b ? 1 : 0);
const intra = (T: number, la: number, durata = 0.45) =>
  animeaza({ dela: 0, la: 1, start: la, sfarsit: la + durata, ease: EASING.iesireCubica })(T);

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

/** Axa orizontală, cu trei repere. Decor: rezumatul clipului spune totul în cuvinte. */
function Axe({ st }: { st: number }) {
  const zero = catreEcran({ x: 0, y: 0 }).y;
  return (
    <g aria-hidden="true">
      <line
        x1={ZONA.stanga}
        x2={ZONA.dreapta}
        y1={zero}
        y2={zero}
        stroke={culoareRol("grila")}
        strokeWidth={3}
      />
      {[-1, 0, 1].map((v) => {
        const p = catreEcran({ x: v, y: 0 });
        return (
          <g key={v}>
            <line
              x1={p.x}
              x2={p.x}
              y1={zero - 10}
              y2={zero + 10}
              stroke={culoareRol("grila")}
              strokeWidth={3}
            />
            <text
              x={p.x}
              y={zero + 46}
              textAnchor="middle"
              fill="var(--text-slab)"
              style={{ font: `600 ${26 * Math.min(st, 1.35)}px var(--font-mono)` }}
            >
              {v === -1 ? "−1" : String(v)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Noduri({
  noduri,
  opacitate,
  raza = 13,
}: {
  noduri: readonly Nod[];
  opacitate: number;
  raza?: number;
}) {
  if (opacitate <= 0) return null;
  return (
    <g opacity={opacitate}>
      {noduri.map((nod, i) => {
        const p = catreEcran(nod);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={raza}
            fill={culoareRol(ROL_NODURI)}
            stroke="var(--fundal)"
            strokeWidth={4}
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
  if (opacitate <= 0 || puncte.length < 2) return null;
  return (
    <polyline
      points={traseu(puncte)}
      fill="none"
      stroke={culoareRol(rol)}
      strokeWidth={grosime}
      strokeOpacity={opacitate}
      strokeDasharray={punctata ? "18 14" : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/* ───────────────────────── desenul ───────────────────────── */

function Desen() {
  const { T, cue, latime } = useClip<NumeScena>();
  const st = scaraText(latime);

  /* ── 1 · punctele ── */
  const P = cue.Puncte;
  const oPuncte = felie(T, P, cue.Polinom);

  /* ── 2 · polinomul ── */
  const N = cue.Polinom;
  const oPolinom = felie(T, N, cue.MaiMulte);
  /** Cât din curbă s-a trasat: polinomul se **desenează**, nu apare gata. */
  const trasat = animeaza({
    dela: 0,
    la: 1,
    start: N + 0.8,
    sfarsit: N + 4.4,
    ease: EASING.intrareIesireCubica,
  })(T);
  const curbaTrasata = CURBE_POLINOM[0]!.slice(
    0,
    Math.max(2, Math.round(trasat * CURBE_POLINOM[0]!.length)),
  );

  /* ── 3 · mai multe noduri ── */
  const M = cue.MaiMulte;
  const oMaiMulte = felie(T, M, cue.Spline);
  /** Treapta curentă: 5 → 7 → 9 → 11, la fiecare 2,8 secunde. */
  const treapta = clamp(Math.floor((T - M - 1.0) / 2.8) + 1, 0, TREPTE.length - 1);
  /** Cât de intrată e treapta de acum — ca schimbarea să fie o mișcare, nu o tăietură. */
  const intrareTreapta = intra(T, M + 1.0 + (treapta - 1) * 2.8, 0.5);
  const treaptaAnterioara = Math.max(0, treapta - 1);

  /* ── 4 · spline-ul ── */
  const S = cue.Spline;
  const oSpline = felie(T, S, TOTAL + 1);
  const trasatSpline = animeaza({
    dela: 0,
    la: 1,
    start: S + 1.2,
    sfarsit: S + 4.6,
    ease: EASING.intrareIesireCubica,
  })(T);
  const splineTrasat = CURBA_SPLINE.slice(
    0,
    Math.max(2, Math.round(trasatSpline * CURBA_SPLINE.length)),
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      <Axe st={st} />

      {/* ═══ 1 · punctele ═══ */}
      <Antet opacitate={oPuncte} titlu="Atât se știe: câteva puncte" st={st} />
      <g opacity={oPuncte}>
        <Noduri noduri={SETURI[0]!} opacitate={intra(T, P + 0.4, 0.7)} />
        <Cartonas
          x={1250}
          y={330}
          latime={560}
          opacitate={intra(T, P + 2.6, 0.5)}
          rol={ROL_NODURI}
          simbol="x₀ … x₄"
          text="Suportul interpolării"
          st={st}
        />
        <Cartonas
          x={1250}
          y={500}
          latime={560}
          opacitate={intra(T, P + 4.8, 0.5)}
          rol={ROL_FUNCTIE}
          simbol="f(xₖ)"
          text="Valorile cunoscute în ele"
          st={st}
        />
      </g>

      {/* ═══ 2 · polinomul ═══ */}
      <Antet opacitate={oPolinom} titlu="Un singur polinom trece prin toate" st={st} />
      <g opacity={oPolinom}>
        <Curba
          puncte={CURBA_FUNCTIEI}
          rol={ROL_FUNCTIE}
          opacitate={intra(T, N + 6.0, 0.6)}
          grosime={6}
        />
        <Curba puncte={curbaTrasata} rol={ROL_POLINOM} opacitate={1} />
        <Noduri noduri={SETURI[0]!} opacitate={1} />
        <Cartonas
          x={1250}
          y={330}
          latime={560}
          opacitate={intra(T, N + 4.6, 0.5)}
          rol={ROL_POLINOM}
          simbol="Grad ≤ 4"
          text="Pe 5 puncte distincte, el e unic"
          st={st}
        />
        <Cartonas
          x={1250}
          y={500}
          latime={560}
          opacitate={intra(T, N + 6.6, 0.5)}
          rol={ROL_FUNCTIE}
          simbol={`Abatere ${zecimale(EROARE_POLINOM[0]!, 2)}`}
          text="Cât ratează funcția adevărată"
          st={st}
        />
      </g>

      {/* ═══ 3 · mai multe noduri ═══ */}
      <Antet opacitate={oMaiMulte} titlu="Mai multe noduri, aproximare mai proastă" st={st} />
      <g opacity={oMaiMulte}>
        <Curba puncte={CURBA_FUNCTIEI} rol={ROL_FUNCTIE} opacitate={0.85} grosime={6} />
        {/* Curba dinainte se stinge în timp ce cea nouă intră: schimbarea de
            treaptă se vede ca o mișcare, nu ca o tăietură. */}
        <Curba
          puncte={CURBE_POLINOM[treaptaAnterioara]!}
          rol={ROL_POLINOM}
          opacitate={treapta === 0 ? 0 : 1 - intrareTreapta}
        />
        <Curba puncte={CURBE_POLINOM[treapta]!} rol={ROL_POLINOM} opacitate={intrareTreapta} />
        <Noduri noduri={SETURI[treapta]!} opacitate={intrareTreapta} raza={11} />
        <Cartonas
          x={1250}
          y={330}
          latime={560}
          opacitate={intra(T, M + 0.6, 0.5)}
          rol={ROL_NODURI}
          simbol={`${TREPTE[treapta]} noduri`}
          text="Oscilează, fiindcă eroarea se adună"
          st={st}
        />
        <Cartonas
          x={1250}
          y={500}
          latime={560}
          opacitate={intra(T, M + 0.6, 0.5)}
          rol={ROL_ACCENT}
          simbol={`Vârf ${zecimale(AMPLITUDINE[treapta]!, 2)}`}
          text="Funcția însăși nu trece de 1"
          st={st}
        />
        <Cartonas
          x={1250}
          y={670}
          latime={560}
          opacitate={intra(T, M + 6.0, 0.5)}
          rol={ROL_POLINOM}
          simbol={`Abatere ${zecimale(EROARE_POLINOM[treapta]!, 2)}`}
          text="Crește, nu scade"
          st={st}
        />
      </g>

      {/* ═══ 4 · spline-ul ═══ */}
      <Antet opacitate={oSpline} titlu="Bucată cu bucată, în loc de un polinom mare" st={st} />
      <g opacity={oSpline}>
        <Curba puncte={CURBA_FUNCTIEI} rol={ROL_FUNCTIE} opacitate={0.85} grosime={6} />
        <Curba
          puncte={CURBE_POLINOM[TREPTE.length - 1]!}
          rol={ROL_POLINOM}
          opacitate={animeaza({ dela: 1, la: 0.32, start: S + 1.0, sfarsit: S + 2.6 })(T)}
        />
        <Curba puncte={splineTrasat} rol={ROL_SPLINE} opacitate={1} />
        <Noduri noduri={NODURI_FINALE} opacitate={1} raza={11} />
        <Cartonas
          x={1250}
          y={330}
          latime={560}
          opacitate={intra(T, S + 4.8, 0.5)}
          rol={ROL_SPLINE}
          simbol={`Abatere ${zecimale(EROARE_SPLINE, 4)}`}
          text="Aceleași 11 noduri, altă construcție"
          st={st}
        />
        <Cartonas
          x={1250}
          y={500}
          latime={560}
          opacitate={intra(T, S + 6.6, 0.5)}
          rol={ROL_SPLINE}
          simbol="10 cubice"
          text="Câte una pe fiecare subinterval"
          st={st}
        />
      </g>
    </svg>
  );
}

/* ───────────────────────── piesa întreagă ───────────────────────── */

const SUBTITRARI = [
  { la: CUE.Puncte + 0.4, text: "O funcție cunoscută doar în câteva puncte." },
  { la: CUE.Puncte + 3.0, text: "Nodurile astea se numesc suportul interpolării." },
  {
    la: CUE.Puncte + 5.4,
    text: "Întrebarea e ce se pune între ele, acolo unde nu se știe nimic.",
  },
  { la: CUE.Polinom + 0.6, text: "Se caută un polinom care trece prin toate punctele." },
  {
    la: CUE.Polinom + 4.6,
    text: "Pe puncte distincte există unul singur de grad cel mult n — Lagrange și Neville îl regăsesc pe același.",
  },
  {
    la: CUE.Polinom + 7.0,
    text: "Cealaltă curbă e funcția adevărată, cea din care au fost luate valorile.",
  },
  { la: CUE.MaiMulte + 0.6, text: "Pare firesc ca mai multe noduri să dea o aproximare mai bună." },
  {
    la: CUE.MaiMulte + 4.0,
    text: "Cu noduri echidistante nu se întâmplă asta: polinomul începe să oscileze la capete.",
  },
  {
    la: CUE.MaiMulte + 8.0,
    text: "La 11 noduri vârful trece de 1,9, deși funcția nu urcă peste 1.",
  },
  {
    la: CUE.MaiMulte + 11.0,
    text: "Creșterea gradului nu îmbunătățește neapărat aproximarea.",
  },
  {
    la: CUE.Spline + 0.6,
    text: "Vinovat e faptul că un singur polinom trebuie să se potrivească pe tot intervalul.",
  },
  {
    la: CUE.Spline + 3.4,
    text: "Spline-ul renunță la asta: câte un polinom de grad 3 pe fiecare subinterval.",
  },
  {
    la: CUE.Spline + 6.4,
    text: "Bucățile se lipesc în noduri, cu aceeași pantă și aceeași curbură.",
  },
  {
    la: TOTAL - 3.0,
    text: "Pe aceleași noduri, eroarea scade de la aproape 2 la sub 0,03.",
  },
] as const;

/**
 * Clipul paginii 12: de ce interpolarea pe porțiuni a apărut în locul unui
 * polinom de grad mare.
 *
 * Scris în cod, ca toate clipurile site-ului. Cifrele scrise pe cartonașe —
 * vârful oscilației, abaterile — nu sunt transcrise din curs: se calculează la
 * încărcarea modulului cu funcțiile din `src/algorithms/interpolare-polinomiala/`
 * și ies chiar cele din exemplul cursului.
 *
 * Se calculează **o dată**, nu la fiecare cadru: nimic din ce se vede aici nu
 * depinde de parametri, iar o abatere maximă măsurată pe 4000 de puncte, de
 * șaizeci de ori pe secundă, ar arde bateria degeaba.
 */
export function AnimatiaInterpolarii() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație: de la polinomul de interpolare la spline. Se pleacă de la cinci puncte, " +
        "prin care trece un singur polinom de grad cel mult patru; alături apare funcția din " +
        "care au fost luate valorile, funcția lui Runge. Se adaugă apoi noduri echidistante — " +
        "7, 9, 11 — și polinomul nu se apropie de funcție, ci oscilează tot mai tare spre " +
        "capetele intervalului, până la un vârf de aproape 2, deși funcția nu trece de 1. " +
        "În final, pe aceleași 11 noduri se construiește un spline cubic: câte o cubică pe " +
        "fiecare subinterval, lipite în noduri, iar curba rămâne lipită de funcție."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
