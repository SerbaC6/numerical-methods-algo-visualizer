import {
  casteljau,
  esantioneazaCurba,
  punctPeCurba,
  type Punct,
} from "@/algorithms/curbe-bezier/bezier";
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
    nume: "Poligon",
    durata: 8,
    descriere:
      "Patru puncte și poligonul care le unește. Curba nu trece prin toate: doar prin primul și prin ultimul.",
  },
  {
    nume: "Nivel1",
    durata: 10,
    descriere:
      "Primul nivel al algoritmului: pe fiecare segment se ia punctul care îl împarte în raportul t, iar cele trei puncte noi formează un poligon mai scurt.",
  },
  {
    nume: "Restul",
    durata: 10,
    descriere:
      "Nivelurile următoare, până rămâne un singur punct — cel de pe curbă, la parametrul t.",
  },
  {
    nume: "Curba",
    durata: 11,
    descriere:
      "Parametrul t parcurge intervalul de la 0 la 1, iar punctul construit trasează curba întreagă.",
  },
  {
    nume: "Joaca",
    durata: 9,
    descriere:
      "Un punct de control se mută, iar curba îl urmează: gradul rămâne același, forma se schimbă toată.",
  },
] as const satisfies readonly Scena[];

type NumeScena = (typeof SCENE)[number]["nume"];
const { cue: CUE, total: TOTAL } = repere(SCENE);

/** Cadrul de la mișcare redusă: construcția completă, la un t din mijloc. */
const CADRU_STATIC = CUE.Restul + 7;

/* ───────────────────────── cifrele ───────────────────────── */

/**
 * **Sursa: `cursuri_MN/interpolare_spline_bezier_teorie_curs09.md`, §15–§16.**
 * Nimic scris din memorie.
 *
 * Exemplul e o cubică — cazul pe care cursul îl scrie desfășurat și cel folosit
 * de PostScript pentru litere. Punctele sunt alese pentru desen, nu luate din
 * curs: cursul nu dă un poligon numeric. Cifrele desenate se calculează la
 * fiecare cadru cu modulul real, deci desenul nu poate contrazice algoritmul.
 */
const PUNCTE: Punct[] = [
  { x: -4.2, y: -2.2 },
  { x: -2.6, y: 3.1 },
  { x: 2.6, y: 3.1 },
  { x: 4.2, y: -2.2 },
];

/** Unde ajunge punctul de control mutat, în ultima scenă. */
const P1_MUTAT: Punct = { x: -4.6, y: 2.4 };

/** `t`-ul la care se construiește, cât timp construcția e subiectul. */
const T_CONSTRUCTIE = 0.4;

/* ───────────────────────── roluri ───────────────────────── */

/**
 * Un rol pentru fiecare nivel. Paleta e monocromă pe albastru, deci nivelurile
 * s-ar amesteca între ele dacă n-ar folosi exact rolurile care ies din albastru:
 * `interval` (portocaliu) și `pivot` (vermillion). Cele două nu apar niciodată
 * pline una peste alta — sunt niveluri diferite ale aceleiași construcții, la
 * distanță pe ecran.
 */
const CULORI_NIVEL: RolViz[] = ["anterior", "curent", "interval", "pivot"];
const ROL_CURBA = "functie" as const;
const ROL_PUNCT = "solutie" as const;

/* ───────────────────────── cadrul de desen ───────────────────────── */

const W = 1920;
const H = 1080;

/** Ca la restul clipurilor: literele se îngroașă pe un cadru îngust. */
const LATIME_CONFORT = 780;
const scaraText = (latime: number) =>
  latime ? Math.min(2.4, Math.max(1, LATIME_CONFORT / latime)) : 1;

const felie = (T: number, a: number, b: number) => (T >= a && T < b ? 1 : 0);
const intra = (T: number, la: number, durata = 0.45) =>
  animeaza({ dela: 0, la: 1, start: la, sfarsit: la + durata, ease: EASING.iesireCubica })(T);

/* ───────────────────────── planul ───────────────────────── */

const CENTRU = { x: 760, y: 560 };
const SCARA = 108;
const catreEcran = (p: Punct) => ({
  x: CENTRU.x + p.x * SCARA,
  y: CENTRU.y - p.y * SCARA,
});
const traseu = (puncte: readonly Punct[]) =>
  puncte.map((p) => `${catreEcran(p).x},${catreEcran(p).y}`).join(" ");

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

/** Un nivel al construcției: segmentele lui și punctele de pe ele. */
function Nivel({
  puncte,
  rol,
  opacitate,
  razaPunct = 12,
  grosime = 6,
  punctata = false,
  etichete,
  st,
}: {
  puncte: readonly Punct[];
  rol: RolViz;
  opacitate: number;
  razaPunct?: number;
  grosime?: number;
  punctata?: boolean;
  etichete?: readonly string[];
  st: number;
}) {
  if (opacitate <= 0 || puncte.length === 0) return null;
  return (
    <g opacity={opacitate}>
      {puncte.length > 1 && (
        <polyline
          points={traseu(puncte)}
          fill="none"
          stroke={culoareRol(rol)}
          strokeWidth={grosime}
          strokeDasharray={punctata ? "16 12" : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {puncte.map((p, i) => {
        const e = catreEcran(p);
        return (
          <g key={i}>
            <circle
              cx={e.x}
              cy={e.y}
              r={razaPunct}
              fill={culoareRol(rol)}
              stroke="var(--fundal)"
              strokeWidth={4}
            />
            {etichete?.[i] && (
              <text
                x={e.x}
                y={e.y - razaPunct - 26}
                textAnchor="middle"
                fill={culoareEticheta(rol)}
                style={{ font: `700 ${30 * Math.min(st, 1.35)}px var(--font-mono)` }}
              >
                <NotatieSVG text={etichete[i]!} marime={30 * Math.min(st, 1.35)} />
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/* ───────────────────────── desenul ───────────────────────── */

function Desen() {
  const { T, cue, latime } = useClip<NumeScena>();
  const st = scaraText(latime);

  /* ── 1 · poligonul de control ── */
  const P = cue.Poligon;
  const oPoligon = felie(T, P, cue.Nivel1);

  /* ── 2 · primul nivel ── */
  const N = cue.Nivel1;
  const oNivel1 = felie(T, N, cue.Restul);
  /** `t` crește de la 0 la valoarea de lucru, ca punctele să **alunece** pe segmente. */
  const tAlunecare = animeaza({
    dela: 0,
    la: T_CONSTRUCTIE,
    start: N + 1.6,
    sfarsit: N + 4.2,
    ease: EASING.iesireCubica,
  })(T);

  /* ── 3 · restul nivelurilor ── */
  const R = cue.Restul;
  const oRestul = felie(T, R, cue.Curba);
  /** Câte niveluri s-au desenat până acum, în scena a treia. */
  const nivelDesenat = clamp(Math.floor((T - R - 0.8) / 2.6) + 2, 1, PUNCTE.length - 1);

  /* ── 4 · curba ── */
  const C = cue.Curba;
  const oCurba = felie(T, C, cue.Joaca);
  const tCurba = animeaza({
    dela: 0,
    la: 1,
    start: C + 1.2,
    sfarsit: C + 8.2,
    ease: EASING.intrareIesireCubica,
  })(T);

  /* ── 5 · joaca ── */
  const J = cue.Joaca;
  const oJoaca = felie(T, J, TOTAL + 1);
  const mutare = animeaza({
    dela: 0,
    la: 1,
    start: J + 1.2,
    sfarsit: J + 4.4,
    ease: EASING.intrareIesireCubica,
  })(T);
  const revenire = animeaza({
    dela: 0,
    la: 1,
    start: J + 5.4,
    sfarsit: J + 7.8,
    ease: EASING.intrareIesireCubica,
  })(T);
  const deplasare = mutare - revenire;
  const puncteMutate: Punct[] = PUNCTE.map((p, i) =>
    i === 1
      ? {
          x: p.x + (P1_MUTAT.x - p.x) * deplasare,
          y: p.y + (P1_MUTAT.y - p.y) * deplasare,
        }
      : p,
  );

  /* Ce se desenează în fiecare scenă. */
  const nivelurileConstructiei = casteljau(PUNCTE, oNivel1 ? tAlunecare : T_CONSTRUCTIE);
  const curbaPartiala = esantioneazaCurba(PUNCTE, 160, tCurba);
  const punctulCurent = punctPeCurba(PUNCTE, tCurba);
  const curbaJoaca = esantioneazaCurba(puncteMutate, 160);

  const etichetePuncte = ["P₀", "P₁", "P₂", "P₃"];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      {/* ═══ 1 · poligonul ═══ */}
      <Antet opacitate={oPoligon} titlu="Poligonul de control" st={st} />
      <g opacity={oPoligon}>
        <Nivel
          puncte={PUNCTE}
          rol={CULORI_NIVEL[0]!}
          opacitate={intra(T, P + 0.4, 0.6)}
          punctata
          etichete={etichetePuncte}
          st={st}
        />
        <Cartonas
          x={1290}
          y={330}
          latime={540}
          opacitate={intra(T, P + 3.0, 0.5)}
          rol={ROL_PUNCT}
          simbol="P₀ și P₃"
          text="curba trece chiar prin ele"
          st={st}
        />
        <Cartonas
          x={1290}
          y={500}
          latime={540}
          opacitate={intra(T, P + 5.0, 0.5)}
          rol={CULORI_NIVEL[0]!}
          simbol="P₁ și P₂"
          text="doar o trag după ele"
          st={st}
        />
      </g>

      {/* ═══ 2 · primul nivel ═══ */}
      <Antet opacitate={oNivel1} titlu="Un nivel: câte un punct pe fiecare segment" st={st} />
      <g opacity={oNivel1}>
        <Nivel
          puncte={PUNCTE}
          rol={CULORI_NIVEL[0]!}
          opacitate={1}
          punctata
          etichete={etichetePuncte}
          st={st}
        />
        <Nivel
          puncte={nivelurileConstructiei[1] ?? []}
          rol={CULORI_NIVEL[1]!}
          opacitate={intra(T, N + 1.6, 0.5)}
          etichete={["P⁽¹⁾₀", "P⁽¹⁾₁", "P⁽¹⁾₂"]}
          st={st}
        />
        <Cartonas
          x={1290}
          y={330}
          latime={540}
          opacitate={intra(T, N + 4.6, 0.5)}
          rol={CULORI_NIVEL[1]!}
          simbol={`t = ${T_CONSTRUCTIE.toFixed(2).replace(".", ",")}`}
          text="cât din fiecare segment se parcurge"
          st={st}
        />
        <Cartonas
          x={1290}
          y={500}
          latime={540}
          opacitate={intra(T, N + 6.4, 0.5)}
          rol={CULORI_NIVEL[1]!}
          simbol="4 → 3"
          text="un punct mai puțin decât înainte"
          st={st}
        />
      </g>

      {/* ═══ 3 · restul nivelurilor ═══ */}
      <Antet opacitate={oRestul} titlu="Se repetă până rămâne un punct" st={st} />
      <g opacity={oRestul}>
        <Nivel puncte={PUNCTE} rol={CULORI_NIVEL[0]!} opacitate={0.55} punctata st={st} />
        {nivelurileConstructiei.slice(1).map((rand, k) => {
          const nivel = k + 1;
          if (nivel > nivelDesenat) return null;
          const ultimul = nivel === PUNCTE.length - 1;
          return (
            <Nivel
              key={nivel}
              puncte={rand}
              rol={ultimul ? ROL_PUNCT : CULORI_NIVEL[Math.min(nivel, CULORI_NIVEL.length - 1)]!}
              opacitate={intra(T, R + 0.8 + (nivel - 1) * 2.6, 0.5)}
              razaPunct={ultimul ? 16 : 12}
              etichete={ultimul ? ["B(t)"] : undefined}
              st={st}
            />
          );
        })}
        <Cartonas
          x={1290}
          y={330}
          latime={540}
          opacitate={intra(T, R + 6.0, 0.5)}
          rol={ROL_PUNCT}
          simbol="P⁽³⁾₀ = B(t)"
          text="singurul punct rămas e pe curbă"
          st={st}
        />
      </g>

      {/* ═══ 4 · curba ═══ */}
      <Antet opacitate={oCurba} titlu="Același lucru, pentru fiecare t" st={st} />
      <g opacity={oCurba}>
        <Nivel puncte={PUNCTE} rol={CULORI_NIVEL[0]!} opacitate={0.45} punctata st={st} />
        {curbaPartiala.length > 1 && (
          <polyline
            points={traseu(curbaPartiala)}
            fill="none"
            stroke={culoareRol(ROL_CURBA)}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {casteljau(PUNCTE, tCurba)
          .slice(1, -1)
          .map((rand, k) => (
            <Nivel
              key={k}
              puncte={rand}
              rol={CULORI_NIVEL[Math.min(k + 1, CULORI_NIVEL.length - 1)]!}
              opacitate={0.75}
              razaPunct={9}
              grosime={4}
              st={st}
            />
          ))}
        <circle
          cx={catreEcran(punctulCurent).x}
          cy={catreEcran(punctulCurent).y}
          r={17}
          fill={culoareRol(ROL_PUNCT)}
          stroke="var(--fundal)"
          strokeWidth={5}
        />
        <Cartonas
          x={1290}
          y={330}
          latime={540}
          opacitate={intra(T, C + 1.2, 0.5)}
          rol={ROL_PUNCT}
          simbol={`t = ${tCurba.toFixed(2).replace(".", ",")}`}
          text="de la 0 la 1, punctul desenează curba"
          st={st}
        />
      </g>

      {/* ═══ 5 · joaca ═══ */}
      <Antet opacitate={oJoaca} titlu="Muți un punct, se schimbă toată curba" st={st} />
      <g opacity={oJoaca}>
        <polyline
          points={traseu(curbaJoaca)}
          fill="none"
          stroke={culoareRol(ROL_CURBA)}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Nivel
          puncte={puncteMutate}
          rol={CULORI_NIVEL[0]!}
          opacitate={1}
          punctata
          etichete={etichetePuncte}
          st={st}
        />
        <Cartonas
          x={1290}
          y={330}
          latime={540}
          opacitate={intra(T, J + 4.6, 0.5)}
          rol={CULORI_NIVEL[0]!}
          simbol="P₀ și P₃"
          text="capetele stau pe loc"
          st={st}
        />
        <Cartonas
          x={1290}
          y={500}
          latime={540}
          opacitate={intra(T, J + 6.0, 0.5)}
          rol={ROL_CURBA}
          simbol="grad 3"
          text="gradul nu se schimbă, forma da"
          st={st}
        />
      </g>
    </svg>
  );
}

/* ───────────────────────── piesa întreagă ───────────────────────── */

const SUBTITRARI = [
  { la: CUE.Poligon + 0.4, text: "Patru puncte, unite în ordine: poligonul de control." },
  {
    la: CUE.Poligon + 3.0,
    text: "Curba pleacă din P₀ și ajunge în P₃, dar nu trece prin celelalte două.",
  },
  {
    la: CUE.Poligon + 5.6,
    text: "Ea rămâne mereu în interiorul poligonului, oricum ar fi așezate punctele.",
  },
  {
    la: CUE.Nivel1 + 0.4,
    text: "Se alege un t între 0 și 1 — cât din fiecare segment se parcurge.",
  },
  {
    la: CUE.Nivel1 + 1.6,
    text: "Pe fiecare dintre cele trei segmente se ia punctul aflat la fracțiunea t.",
  },
  {
    la: CUE.Nivel1 + 5.2,
    text: "Cele trei puncte noi formează un poligon cu un punct mai puțin.",
  },
  { la: CUE.Restul + 0.4, text: "Aceeași regulă se aplică poligonului nou, apoi celui de după." },
  { la: CUE.Restul + 5.4, text: "După trei niveluri rămâne un singur punct — el e pe curbă." },
  {
    la: CUE.Restul + 8.0,
    text: "Nicio putere mare, doar interpolări liniare: de aceea metoda e stabilă numeric.",
  },
  { la: CUE.Curba + 0.4, text: "Se repetă construcția pentru fiecare t de la 0 la 1." },
  { la: CUE.Curba + 5.0, text: "Punctul construit desenează, pas cu pas, curba Bézier." },
  { la: CUE.Joaca + 0.4, text: "Un singur punct de control se mută…" },
  { la: CUE.Joaca + 3.0, text: "…iar curba se schimbă pe toată lungimea, nu doar lângă el." },
  {
    la: TOTAL - 3.2,
    text: "Capetele rămân pe loc, și rămân tangente la primul și ultimul segment.",
  },
] as const;

/**
 * Clipul paginii 13: cum se construiește un punct de pe o curbă Bézier.
 *
 * Scris în cod, ca toate clipurile site-ului. Cifrele nu sunt transcrise: fiecare
 * cadru cheamă `casteljau()` din `src/algorithms/curbe-bezier/bezier.ts`, deci
 * desenul nu poate ajunge să arate altceva decât calculează algoritmul.
 *
 * Culorile nivelurilor sunt roluri de vizualizare, nu nuanțe alese pe loc: de
 * asta există limita de patru niveluri — paleta n-are mai multe roluri care să se
 * despartă între ele fără să intre peste curbă și peste punctul final.
 */
export function AnimatiaBezier() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație: construcția de Casteljau pe o curbă Bézier cubică. Patru puncte formează " +
        "poligonul de control; curba pleacă din primul și ajunge în ultimul, fără să treacă prin " +
        "cele două din mijloc. Pentru un t ales, pe fiecare segment se ia punctul aflat la " +
        "fracțiunea t, iar cele trei puncte noi formează un poligon mai scurt; regula se repetă " +
        "până rămâne un singur punct, care e chiar punctul de pe curbă. Plimbând t de la 0 la 1, " +
        "punctul acela trasează curba întreagă. La final, un punct de control se mută și curba se " +
        "schimbă pe toată lungimea, în timp ce capetele rămân pe loc."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
