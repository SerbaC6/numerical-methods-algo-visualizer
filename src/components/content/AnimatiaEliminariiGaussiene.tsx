import { NotatieSVG } from "@/components/viz/Notatie";
import { Clip } from "@/components/viz/Clip";
import { useClip } from "@/components/viz/clip-context";
import { Subtitrari } from "@/components/viz/Subtitrari";
import {
  DETERMINANT_DIN_CURS,
  EXTINSA_DIN_CURS,
  PASI_ELIMINARE,
  SOLUTIA_DIN_CURS,
  U_DIN_CURS,
} from "@/algorithms/eliminare-gaussiana/exemplu";
import { animeaza, clamp, EASING, repere, type Scena } from "@/lib/compozitie";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";

/* ───────────────────────── timpul ───────────────────────── */

/**
 * Scenele clipului, în ordine. Ca la celelalte clipuri scrise în cod, lista e
 * schița piesei: numele, ordinea și duratele stau aici, iar coregrafia se scrie
 * exclusiv față de `cue.NumeScena`, niciodată față de secunde scrise de mână.
 */
const SCENE = [
  {
    nume: "Sistem",
    durata: 5.5,
    descriere: "Cele trei ecuații apar și se strâng în matricea extinsă.",
  },
  {
    nume: "Obiectiv",
    durata: 4.5,
    descriere: "Forma-țintă: numai zerouri sub diagonală.",
  },
  {
    nume: "Pas1a",
    durata: 8.5,
    descriere: "Pivotul a₁₁, raportul µ₂₁ = 1, iar linia 2 devine (0, −2, −2, −8).",
  },
  {
    nume: "Pas1b",
    durata: 6.5,
    descriere: "Aceeași coloană, µ₃₁ = 3, iar linia 3 devine (0, 2, 5, 8).",
  },
  {
    nume: "Pas2",
    durata: 8.5,
    descriere: "Pivotul trece pe a₂₂, µ₃₂ = −1, iar linia 3 devine (0, 0, 3, 0).",
  },
  {
    nume: "Triunghi",
    durata: 4,
    descriere: "Forma superior triunghiulară și determinantul citit de pe diagonală.",
  },
  {
    nume: "Substitutie",
    durata: 9.5,
    descriere: "Substituția înapoi: x₃, apoi x₂, apoi x₁, și vectorul soluție.",
  },
  {
    nume: "Pivotare",
    durata: 6,
    descriere: "Pivot nul: liniile se schimbă între ele.",
  },
  {
    nume: "Final",
    durata: 6.5,
    descriere: "Recapitularea celor trei pași.",
  },
] as const satisfies readonly Scena[];

type NumeScena = (typeof SCENE)[number]["nume"];

const { cue: CUE } = repere(SCENE);

/**
 * Cadrul arătat la `prefers-reduced-motion`: matricea triunghiulară, cu
 * substituția înapoi terminată și vectorul soluție pe ecran. E capătul poveștii,
 * deci se ține singur.
 */
const CADRU_STATIC = CUE.Substitutie + 8.2;

/* ───────────────────────── cifrele ───────────────────────── */

/**
 * Tot ce se vede scris în clip vine din `src/algorithms/eliminare-gaussiana/`,
 * nu din numere scrise aici: rapoartele `µ`, liniile de după fiecare operație,
 * soluția și determinantul. Așa desenul și teoria de sub el nu pot ajunge să
 * spună lucruri diferite.
 *
 * Sursa exemplului e cursul; verificarea, în
 * `scripts/verificare-algoritmi/eliminare-gaussiana.ts`.
 */
const PAS = PASI_ELIMINARE;

/** Un pas de eliminare, în ordinea în care îl arată clipul. */
const MOMENTE = [
  { pas: PAS[0], cue: CUE.Pas1a, urmator: CUE.Pas1b, titlu: "Pasul 1 · coloana 1" },
  { pas: PAS[1], cue: CUE.Pas1b, urmator: CUE.Pas2, titlu: "Pasul 1 · coloana 1" },
  { pas: PAS[2], cue: CUE.Pas2, urmator: CUE.Triunghi, titlu: "Pasul 2 · coloana 2" },
] as const;

/** Minus tipografic, nu cratimă — la fel ca peste tot în desen. */
const num = (v: number) => (v < 0 ? `−${Math.abs(v)}` : `${v}`);

/** `−2` scris ca `(−2)` acolo unde intră într-o împărțire, ca să se citească. */
const numParantezat = (v: number) => (v < 0 ? `(${num(v)})` : num(v));

/**
 * Determinantul, scris ca produsul chiar al cifrelor de pe diagonala lui U —
 * nu al unora repetate aici. Ține doar fiindcă eliminarea nu permută linii:
 * matricea de adunare are `det = 1`, deci lasă determinantul neatins.
 */
const DET_TEXT = `det A = ${U_DIN_CURS.map((linie, i) => numParantezat(linie[i] ?? 0)).join(
  " · ",
)} = ${num(DETERMINANT_DIN_CURS)}`;

/** Indicii scriși ca cifre mici: `21` → `₂₁`. */
const JOS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"] as const;
const indice = (n: number) =>
  String(n)
    .split("")
    .map((c) => JOS[Number(c)] ?? c)
    .join("");

/* ───────────────────────── rolurile de culoare ───────────────────────── */

/**
 * Nicio culoare nouă. Rolurile refolosite, alese ca fiecare să spună un singur
 * lucru în desen:
 *
 * - `pivot` — celula pivotului, singura umplută plin. Pe grilă, roșul înseamnă
 *   exclusiv „pivot", niciodată „eroare";
 * - `interval` — linia pe care se lucrează acum, ca fundal la 20 %, exact cum o
 *   folosește și `MatrixGrid`. Nu se suprapune niciodată peste celula
 *   pivotului: pivotul stă în linia lui, linia lucrată e alta;
 * - `solutie` — ce **iese** din operație: zeroul produs, rezultatul, necunoscuta
 *   aflată;
 * - `curent` — săgeata operației și evidențierea din substituția înapoi;
 * - `anterior` — cifrele deja terminate, estompate.
 */
const ROL_PIVOT = "pivot" as const;
const ROL_LINIE = "interval" as const;
const ROL_REZULTAT = "solutie" as const;
const ROL_ACTIUNE = "curent" as const;

/* ───────────────────────── cadrul de desen ───────────────────────── */

const W = 1920;
const H = 1080;

/** Celula matricei extinse. */
const CW = 126;
const CH = 94;

/**
 * Cu cât se îngroașă literele desenului pe un cadru îngust — același truc ca la
 * clipurile paginilor 7, 9, 10 și 11: desenul are 1920 de unități oricât de mic
 * ar fi pe ecran, deci pe telefon literele ar ajunge de câțiva pixeli.
 */
const LATIME_CONFORT = 780;
const SCARA_MAXIMA = 2.4;
const scaraText = (latime: number) =>
  latime ? Math.min(SCARA_MAXIMA, Math.max(1, LATIME_CONFORT / latime)) : 1;

/* ───────────────────────── ajutoare de timp ───────────────────────── */

/** 1 cât timp `T` e în felia `[a, b)`, 0 în rest — comutatorul dintre momente. */
const felie = (T: number, a: number, b: number) => (T >= a && T < b ? 1 : 0);

/** Intrare simplă: de la 0 la 1 în `durata` secunde, începând cu `la`. */
const intra = (T: number, la: number, durata = 0.5) =>
  animeaza({ dela: 0, la: 1, start: la, sfarsit: la + durata, ease: EASING.iesireCubica })(T);

/** Cât alunecă în sus un element la intrare, în unități de desen. */
const urca = (T: number, la: number, distanta = 18, durata = 0.5) =>
  (1 - intra(T, la, durata)) * distanta;

/** O umflare scurtă, pentru „cifra asta tocmai s-a schimbat". */
const pulsatie = (T: number, la: number) =>
  1 + 0.26 * Math.sin(Math.PI * clamp((T - la) / 0.5, 0, 1));

/** Se aprinde și se stinge la capetele feliei — pentru ce trebuie să apară lin. */
const banda = (T: number, a: number, b: number, pana = 0.4) =>
  Math.max(0, Math.min(clamp((T - a) / pana, 0, 1), clamp((b - T) / pana, 0, 1)));

/* ───────────────────────── piese de desen ───────────────────────── */

/** Text mono, cu indicii și exponenții puși pe nivelul lor. */
function Mono({
  x,
  y,
  text,
  marime,
  culoare,
  ancora = "start",
  greutate = 700,
  opacitate = 1,
}: {
  x: number;
  y: number;
  text: string;
  marime: number;
  culoare: string;
  ancora?: "start" | "middle" | "end";
  greutate?: number;
  opacitate?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={ancora}
      dominantBaseline="central"
      fill={culoare}
      opacity={opacitate}
      // Fără asta, SVG-ul strânge spațiile multiple, iar ecuațiile aliniate în
      // coloană (` x₁ +  3x₂ …`) s-ar înghesui una peste alta.
      xmlSpace="preserve"
      style={{ font: `${greutate} ${marime}px var(--font-mono)` }}
    >
      <NotatieSVG text={text} marime={marime} />
    </text>
  );
}

/** Text de proză, cu fontul paginii. */
function Proza({
  x,
  y,
  text,
  marime,
  culoare = "var(--text)",
  ancora = "start",
  greutate = 600,
  opacitate = 1,
  litere,
}: {
  x: number;
  y: number;
  text: string;
  marime: number;
  culoare?: string;
  ancora?: "start" | "middle" | "end";
  greutate?: number;
  opacitate?: number;
  litere?: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={ancora}
      dominantBaseline="central"
      fill={culoare}
      opacity={opacitate}
      style={{ font: `${greutate} ${marime}px var(--font-sans)`, letterSpacing: litere }}
    >
      <NotatieSVG text={text} marime={marime} />
    </text>
  );
}

type StareCelula = {
  /** Culoarea cifrei; implicit, cea de text. */
  culoare?: string;
  /** Umplerea celulei — folosită doar de pivot. */
  umplere?: RolViz;
  /** Momentul de la care cifra pulsează, fiindcă tocmai s-a schimbat. */
  pulsDe?: number;
  /** Un halou în jurul cifrei, pentru substituția înapoi. */
  aprins?: number;
};

/**
 * Matricea extinsă desenată: parantezele, linia punctată dinaintea termenilor
 * liberi, linia evidențiată, celula pivotului și cifrele.
 *
 * Nu e `MatrixGrid` din `viz/`: aceea primește `steps[]` și stări legate de un
 * algoritm care rulează. Aici nu rulează nimic — clipul e o funcție pură de timp.
 */
function Matrice({
  x,
  y,
  randuri,
  stari,
  opacitate,
  scara,
  liniaEvidentiata,
  evidentiere,
  diagonala,
  st,
  T,
}: {
  x: number;
  y: number;
  randuri: number[][];
  stari: Record<string, StareCelula>;
  opacitate: number;
  scara: number;
  liniaEvidentiata: number;
  evidentiere: number;
  diagonala: number;
  st: number;
  T: number;
}) {
  const coloane = randuri[0]?.length ?? 0;
  const latime = coloane * CW;
  const inaltime = randuri.length * CH;
  const brat = 26;
  const corp = 48 * Math.min(st, 1.35);

  return (
    <g transform={`translate(${x}, ${y}) scale(${scara})`} opacity={opacitate}>
      {/* Linia pe care se lucrează. Fundal la 20 %, ca în `MatrixGrid`: plin ar
          înghiți cifra, iar rolul are voie să stea sub ea doar estompat. */}
      <rect
        x={-14}
        y={liniaEvidentiata * CH}
        width={latime + 28}
        height={CH}
        rx={10}
        fill={`color-mix(in oklab, ${culoareRol(ROL_LINIE)} 20%, transparent)`}
        opacity={evidentiere}
      />

      {/* Diagonala, la final: forma triunghiulară se vede din ce rămâne pe ea. */}
      {randuri.map((_, i) => (
        <rect
          key={`d${i}`}
          x={i * CW + 6}
          y={i * CH + 6}
          width={CW - 12}
          height={CH - 12}
          rx={10}
          fill="none"
          stroke={culoareRol(ROL_REZULTAT)}
          strokeWidth={3}
          opacity={diagonala}
        />
      ))}

      {/* Parantezele, desenate cu linii: la 1920 de unități, o paranteză
          tipografică s-ar subția până la dispariție. */}
      <g stroke="var(--text)" strokeWidth={5} fill="none" strokeLinecap="square">
        <path d={`M ${-26 + brat} ${-18} H ${-26} V ${inaltime + 18} H ${-26 + brat}`} />
        <path
          d={`M ${latime + 26 - brat} ${-18} H ${latime + 26} V ${inaltime + 18} H ${latime + 26 - brat}`}
        />
      </g>

      {/* Despărțitura dinaintea termenilor liberi: matricea e extinsă, iar
          coloana din dreapta e b, nu încă un coeficient. */}
      <line
        x1={(coloane - 1) * CW}
        y1={-14}
        x2={(coloane - 1) * CW}
        y2={inaltime + 14}
        stroke="var(--bordura)"
        strokeWidth={3}
        strokeDasharray="10 10"
      />

      {randuri.map((rand, i) =>
        rand.map((v, j) => {
          const stare = stari[`${i},${j}`] ?? {};
          const cx = j * CW + CW / 2;
          const cy = i * CH + CH / 2;
          const scalaCifra = stare.pulsDe === undefined ? 1 : pulsatie(T, stare.pulsDe);
          const culoare =
            stare.culoare ??
            (stare.umplere
              ? "var(--viz-pivot-text)"
              : j === coloane - 1
                ? "var(--text-slab)"
                : "var(--text)");

          return (
            <g key={`${i},${j}`}>
              {stare.umplere && (
                <rect
                  x={j * CW + 4}
                  y={i * CH + 4}
                  width={CW - 8}
                  height={CH - 8}
                  rx={10}
                  fill={culoareRol(stare.umplere)}
                />
              )}
              {stare.aprins !== undefined && stare.aprins > 0 && (
                <rect
                  x={j * CW + 6}
                  y={i * CH + 6}
                  width={CW - 12}
                  height={CH - 12}
                  rx={10}
                  fill="none"
                  stroke={culoareRol(ROL_ACTIUNE)}
                  strokeWidth={3 * stare.aprins}
                  opacity={stare.aprins}
                />
              )}
              <g transform={`translate(${cx}, ${cy}) scale(${scalaCifra})`}>
                <Mono x={0} y={0} text={num(v)} marime={corp} culoare={culoare} ancora="middle" />
              </g>
            </g>
          );
        }),
      )}
    </g>
  );
}

/**
 * Săgeata care arată ce linie se scade din ce linie: pornește din dreptul liniei
 * pivotului și coboară până în dreptul liniei care se schimbă.
 */
function SageataOperatiei({
  x,
  y,
  deLaLinie,
  panaLaLinie,
  desenare,
  opacitate,
}: {
  x: number;
  y: number;
  deLaLinie: number;
  panaLaLinie: number;
  desenare: number;
  opacitate: number;
}) {
  const sus = deLaLinie * CH + CH / 2;
  const lungime = (panaLaLinie - deLaLinie) * CH * desenare;
  const jos = sus + lungime;

  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacitate * desenare}>
      <path
        d={`M -44 ${sus} H -96 V ${jos} H -52`}
        fill="none"
        stroke={culoareRol(ROL_ACTIUNE)}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d={`M -52 ${jos - 10} L -38 ${jos} L -52 ${jos + 10} Z`}
        fill={culoareRol(ROL_ACTIUNE)}
      />
    </g>
  );
}

/** Un vector coloană din panoul de lucru, cu parantezele lui. */
function VectorColoana({
  x,
  y,
  valori,
  opacitate,
  culoare = "var(--text-slab)",
  rama = "var(--bordura)",
  st,
}: {
  x: number;
  y: number;
  valori: readonly number[];
  opacitate: number;
  culoare?: string;
  rama?: string;
  st: number;
}) {
  const inaltimeRand = 52;
  const latime = 104;
  const inaltime = valori.length * inaltimeRand;
  const brat = 12;

  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacitate}>
      <g stroke={rama} strokeWidth={3} fill="none" strokeLinecap="square">
        <path d={`M ${brat} 0 H 0 V ${inaltime} H ${brat}`} />
        <path d={`M ${latime - brat} 0 H ${latime} V ${inaltime} H ${latime - brat}`} />
      </g>
      {valori.map((v, i) => (
        <Mono
          key={i}
          x={latime / 2}
          y={i * inaltimeRand + inaltimeRand / 2}
          text={num(v)}
          marime={32 * Math.min(st, 1.3)}
          culoare={culoare}
          ancora="middle"
        />
      ))}
    </g>
  );
}

/* ───────────────────────── desenul întreg ───────────────────────── */

/** Colțul din stânga-sus al matricei, în cele două poziții pe care le ia. */
const MATRICE_DREAPTA = 1010;
const MATRICE_STANGA = 168;
const MATRICE_SUS = 336;

/** Panoul de lucru din dreapta. */
const PX = 900;
const PY = 300;

function Desen() {
  const { T, cue, latime } = useClip<NumeScena>();
  const st = scaraText(latime);

  /* ── în ce moment suntem ── */
  const momentul = T < cue.Pas1b ? 0 : T < cue.Pas2 ? 1 : 2;
  const activ = MOMENTE[momentul]!;
  const lucreaza = Math.max(
    banda(T, cue.Pas1a, cue.Pas1b),
    banda(T, cue.Pas1b, cue.Pas2),
    banda(T, cue.Pas2, cue.Triunghi),
  );

  /* ── matricea, așa cum arată la momentul T ── */
  const randuri = EXTINSA_DIN_CURS.map((linie) => [...linie]);
  const stari: Record<string, StareCelula> = {};

  MOMENTE.forEach(({ pas, cue: laInceput }) => {
    if (!pas) return;
    const cand = laInceput + 4.6;
    if (T < cand) return;
    randuri[pas.linie] = [...pas.dupa];
    pas.dupa.forEach((_, j) => {
      stari[`${pas.linie},${j}`] = { pulsDe: cand };
    });
    // Zeroul produs e chiar rezultatul pasului, deci se scrie cu culoarea lui.
    stari[`${pas.linie},${pas.coloana}`] = { pulsDe: cand, culoare: culoareEticheta(ROL_REZULTAT) };
  });

  // Celula pivotului, cât timp se lucrează.
  if (lucreaza > 0.01 && activ.pas) {
    stari[`${activ.pas.coloana},${activ.pas.coloana}`] = { umplere: ROL_PIVOT };
  }

  // Substituția înapoi: se aprinde linia din care iese necunoscuta.
  const S = cue.Substitutie;
  const aprinderiSubstitutie = [S + 6.2, S + 3.4, S + 0.8];
  if (T >= S && T < cue.Pivotare) {
    aprinderiSubstitutie.forEach((la, i) => {
      const aprins = clamp((T - la) / 0.5, 0, 1);
      if (aprins <= 0) return;
      randuri[i]?.forEach((_, j) => {
        stari[`${i},${j}`] = { ...(stari[`${i},${j}`] ?? {}), aprins };
      });
    });
  }

  const mx = animeaza({
    dela: MATRICE_DREAPTA,
    la: MATRICE_STANGA,
    start: cue.Obiectiv - 0.5,
    sfarsit: cue.Obiectiv + 0.7,
  })(T);
  const mApare = intra(T, 3.1, 0.9);
  const mScara = 0.94 + 0.06 * mApare;
  const diagonala = banda(T, cue.Triunghi, cue.Substitutie + 0.6, 0.5);

  /* ── scena 1: sistemul scris pe ecuații ── */
  const oSistem = 1 - intra(T, cue.Obiectiv - 0.7, 0.8);
  const ECUATII = [" x₁ +  3x₂ +  x₃ =  9", " x₁ +   x₂ −  x₃ =  1", "3x₁ + 11x₂ + 8x₃ = 35"];

  /* ── panoul din dreapta ── */
  const oObiectiv = felie(T, cue.Obiectiv - 0.2, cue.Pas1a);
  const oLucru = felie(T, cue.Pas1a, cue.Triunghi);
  const oTriunghi = felie(T, cue.Triunghi, cue.Substitutie);
  const oSubstitutie = felie(T, cue.Substitutie, cue.Pivotare);
  const oPivotare = felie(T, cue.Pivotare, cue.Final);
  const oFinal = felie(T, cue.Final, Number.POSITIVE_INFINITY);

  const t0 = activ.cue;
  const pas = activ.pas;

  /* ── pivotarea: matricea mică la care se schimbă liniile ── */
  const P = cue.Pivotare;
  const PIVOTARE = [
    [0, 2, 1],
    [1, 3, 2],
    [4, 1, 5],
  ];
  const schimba = animeaza({
    dela: 0,
    la: 1,
    start: P + 3.9,
    sfarsit: P + 4.9,
  })(T);

  /* ── recapitularea ── */
  const PASI_FINALI = [
    "Alege pivotul de pe diagonală.",
    "Scade din fiecare linie de dedesubt linia pivotului, scalată cu µ.",
    "Rezolvă sistemul triunghiular prin substituție înapoi.",
  ];

  const eticheta =
    T < cue.Pas1a
      ? "Sistemul"
      : T < cue.Pas2
        ? "Eliminare · pasul 1"
        : T < cue.Triunghi
          ? "Eliminare · pasul 2"
          : T < cue.Substitutie
            ? "Forma triunghiulară"
            : T < cue.Pivotare
              ? "Substituție înapoi"
              : T < cue.Final
                ? "Pivotare"
                : "Recapitulare";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      {/* eticheta momentului */}
      <Proza
        x={W - 168}
        y={96}
        text={eticheta}
        marime={26 * Math.min(st, 1.4)}
        culoare={culoareEticheta(ROL_ACTIUNE)}
        ancora="end"
        greutate={700}
        litere="0.04em"
      />

      {/* ═══ 1 · sistemul scris pe ecuații ═══ */}
      <g opacity={oSistem}>
        {ECUATII.map((linie, i) => (
          <g key={i} transform={`translate(0, ${urca(T, 0.5 + i * 0.4, 22, 0.6)})`}>
            <Mono
              x={MATRICE_STANGA}
              y={400 + i * 96}
              text={linie}
              marime={46 * Math.min(st, 1.3)}
              culoare="var(--text)"
              greutate={500}
              opacitate={intra(T, 0.5 + i * 0.4, 0.6)}
            />
          </g>
        ))}
      </g>

      {/* ═══ matricea ═══ */}
      <g>
        <Matrice
          x={mx}
          y={MATRICE_SUS}
          randuri={randuri}
          stari={stari}
          opacitate={mApare}
          scara={mScara}
          liniaEvidentiata={pas?.linie ?? 0}
          evidentiere={lucreaza}
          diagonala={diagonala}
          st={st}
          T={T}
        />
        {pas && (
          <SageataOperatiei
            x={mx}
            y={MATRICE_SUS}
            deLaLinie={pas.coloana}
            panaLaLinie={pas.linie}
            desenare={animeaza({ dela: 0, la: 1, start: t0 + 2.2, sfarsit: t0 + 3.1 })(T)}
            opacitate={lucreaza * mApare}
          />
        )}
      </g>

      {/* ═══ 2 · obiectivul ═══ */}
      <g opacity={oObiectiv}>
        <Proza
          x={PX}
          y={PY}
          text="OBIECTIVUL"
          marime={26 * Math.min(st, 1.4)}
          culoare={culoareEticheta(ROL_ACTIUNE)}
          greutate={700}
          litere="0.04em"
          opacitate={intra(T, cue.Obiectiv + 0.2)}
        />
        <g transform={`translate(${PX}, ${PY + 60})`} opacity={intra(T, cue.Obiectiv + 0.8, 0.7)}>
          {/* Coeficienții rămân pătrate desenate, nu caracterul „■": din
              fonturile proiectului lipsește, iar browserul l-ar lua din altă
              familie. Zerourile sunt cifre adevărate — alea există. */}
          {[
            [1, 1, 1, 1],
            [0, 1, 1, 1],
            [0, 0, 1, 1],
          ].map((rand, i) =>
            rand.map((plin, j) => {
              const cx = j * CW * 0.62 + CW * 0.31;
              const cy = i * CH * 0.62 + CH * 0.31;
              return plin ? (
                <rect
                  key={`${i},${j}`}
                  x={cx - 14}
                  y={cy - 14}
                  width={28}
                  height={28}
                  rx={5}
                  fill={culoareRol("anterior")}
                />
              ) : (
                <Mono
                  key={`${i},${j}`}
                  x={cx}
                  y={cy}
                  text="0"
                  marime={34 * Math.min(st, 1.3)}
                  culoare={culoareEticheta(ROL_REZULTAT)}
                  ancora="middle"
                  opacitate={intra(T, cue.Obiectiv + 1.4 + (i === 1 ? 0 : 0.5))}
                />
              );
            }),
          )}
        </g>
        <Proza
          x={PX}
          y={PY + 300}
          text="Odată triunghiular, sistemul se rezolvă de jos în sus."
          marime={30 * Math.min(st, 1.3)}
          culoare="var(--text-slab)"
          greutate={500}
          opacitate={intra(T, cue.Obiectiv + 2.4, 0.6)}
        />
      </g>

      {/* ═══ 3 · pasul de eliminare ═══ */}
      {pas && (
        <g opacity={oLucru}>
          <Proza
            x={PX}
            y={PY}
            text={activ.titlu.toUpperCase()}
            marime={26 * Math.min(st, 1.4)}
            culoare={culoareEticheta(ROL_ACTIUNE)}
            greutate={700}
            litere="0.04em"
            opacitate={intra(T, t0 + 0.1)}
          />
          {/* Raportul, scris cu numerele puse în el. */}
          <Mono
            x={PX}
            y={PY + 68}
            text={`µ${indice(pas.linie + 1)}${indice(pas.coloana + 1)} = ${num(
              pas.inainte[pas.coloana] ?? 0,
            )} / ${numParantezat(pas.pivot)} = ${num(pas.mu)}`}
            marime={38 * Math.min(st, 1.25)}
            culoare="var(--text)"
            opacitate={intra(T, t0 + 1.4, 0.6)}
          />
          {/* Operația pe linii. */}
          <g opacity={intra(T, t0 + 2.6, 0.6)}>
            <rect
              x={PX - 18}
              y={PY + 118}
              width={520}
              height={72}
              rx={12}
              fill={`color-mix(in oklab, ${culoareRol(ROL_ACTIUNE)} 12%, transparent)`}
            />
            <Mono
              x={PX + 4}
              y={PY + 154}
              text={`L${indice(pas.linie + 1)} ← L${indice(pas.linie + 1)} ${
                pas.mu < 0 ? "+" : "−"
              } ${Math.abs(pas.mu)} · L${indice(pas.coloana + 1)}`}
              marime={32 * Math.min(st, 1.25)}
              culoare={culoareEticheta(ROL_ACTIUNE)}
            />
          </g>
          {/* Aceeași operație, pe cifre. */}
          <VectorColoana
            x={PX}
            y={PY + 230}
            valori={pas.inainte}
            opacitate={intra(T, t0 + 3.4, 0.5)}
            st={st}
          />
          <Mono
            x={PX + 128}
            y={PY + 230 + pas.inainte.length * 26}
            text={`${pas.mu < 0 ? "+" : "−"} ${Math.abs(pas.mu)} ·`}
            marime={34 * Math.min(st, 1.25)}
            culoare="var(--text-slab)"
            ancora="middle"
            opacitate={intra(T, t0 + 3.7, 0.5)}
          />
          <VectorColoana
            x={PX + 186}
            y={PY + 230}
            valori={pas.liniaPivot}
            opacitate={intra(T, t0 + 3.7, 0.5)}
            st={st}
          />
          <Mono
            x={PX + 322}
            y={PY + 230 + pas.inainte.length * 26}
            text="="
            marime={34 * Math.min(st, 1.25)}
            culoare="var(--text-slab)"
            ancora="middle"
            opacitate={intra(T, t0 + 4.3, 0.5)}
          />
          <VectorColoana
            x={PX + 362}
            y={PY + 230}
            valori={pas.dupa}
            opacitate={intra(T, t0 + 4.3, 0.5)}
            culoare={culoareEticheta(ROL_REZULTAT)}
            rama={`color-mix(in oklab, ${culoareRol(ROL_REZULTAT)} 45%, transparent)`}
            st={st}
          />
        </g>
      )}

      {/* ═══ 4 · forma triunghiulară ═══ */}
      <g opacity={oTriunghi}>
        <Proza
          x={PX}
          y={PY}
          text="FORMA TRIUNGHIULARĂ · U"
          marime={26 * Math.min(st, 1.4)}
          culoare={culoareEticheta(ROL_REZULTAT)}
          greutate={700}
          litere="0.04em"
          opacitate={intra(T, cue.Triunghi + 0.2)}
        />
        <Proza
          x={PX}
          y={PY + 70}
          text="Sub diagonală nu mai există nimic de eliminat."
          marime={34 * Math.min(st, 1.3)}
          greutate={500}
          opacitate={intra(T, cue.Triunghi + 0.9, 0.6)}
        />
        <Mono
          x={PX}
          y={PY + 160}
          text={DET_TEXT}
          marime={34 * Math.min(st, 1.25)}
          culoare={culoareEticheta(ROL_ACTIUNE)}
          opacitate={intra(T, cue.Triunghi + 2.2, 0.6)}
        />
      </g>

      {/* ═══ 5 · substituția înapoi ═══ */}
      <g opacity={oSubstitutie}>
        <Proza
          x={PX}
          y={PY}
          text="SUBSTITUȚIE ÎNAPOI"
          marime={26 * Math.min(st, 1.4)}
          culoare={culoareEticheta(ROL_ACTIUNE)}
          greutate={700}
          litere="0.04em"
          opacitate={intra(T, S + 0.1)}
        />
        {[
          { la: S + 0.6, ecuatie: "3x₃ = 0", solutie: "x₃ = 0" },
          { la: S + 3.2, ecuatie: "−2x₂ − 2·0 = −8", solutie: "x₂ = 4" },
          { la: S + 6.0, ecuatie: "x₁ + 3·4 + 0 = 9", solutie: "x₁ = −3" },
        ].map((linie, i) => (
          <g key={i} transform={`translate(0, ${urca(T, linie.la, 20, 0.55)})`}>
            <Mono
              x={PX}
              y={PY + 80 + i * 84}
              text={linie.ecuatie}
              marime={36 * Math.min(st, 1.2)}
              culoare="var(--text-slab)"
              greutate={600}
              opacitate={intra(T, linie.la, 0.55)}
            />
            <Mono
              x={PX + 470}
              y={PY + 80 + i * 84}
              text={linie.solutie}
              marime={36 * Math.min(st, 1.2)}
              culoare={culoareEticheta(ROL_REZULTAT)}
              opacitate={intra(T, linie.la + 0.4, 0.5)}
            />
          </g>
        ))}
        <g
          opacity={intra(T, S + 7.4, 0.6)}
          transform={`translate(0, ${urca(T, S + 7.4, 22, 0.6)})`}
        >
          <rect
            x={PX - 18}
            y={PY + 320}
            width={560}
            height={92}
            rx={14}
            fill={`color-mix(in oklab, ${culoareRol(ROL_REZULTAT)} 12%, transparent)`}
            stroke={`color-mix(in oklab, ${culoareRol(ROL_REZULTAT)} 40%, transparent)`}
            strokeWidth={2}
          />
          <Mono
            x={PX + 8}
            y={PY + 366}
            text={`x = ( ${SOLUTIA_DIN_CURS.map(num).join(" , ")} )`}
            marime={40 * Math.min(st, 1.2)}
            culoare={culoareEticheta(ROL_REZULTAT)}
          />
        </g>
      </g>

      {/* ═══ 6 · pivotarea ═══ */}
      <g opacity={oPivotare}>
        <Proza
          x={PX}
          y={PY}
          text="CÂND PIVOTUL ESTE 0"
          marime={26 * Math.min(st, 1.4)}
          culoare={culoareEticheta(ROL_PIVOT)}
          greutate={700}
          litere="0.04em"
          opacitate={intra(T, P + 0.1)}
        />
        <Mono
          x={PX}
          y={PY + 70}
          text="µᵢ₁ = aᵢ₁ / 0"
          marime={34 * Math.min(st, 1.25)}
          culoare="var(--text)"
          opacitate={intra(T, P + 0.7, 0.6)}
        />
        <g transform={`translate(${PX}, ${PY + 130})`} opacity={intra(T, P + 1.6, 0.6)}>
          {PIVOTARE.map((rand, i) => {
            const dy = i === 0 ? schimba * 2 * 64 : i === 2 ? -schimba * 2 * 64 : 0;
            return (
              <g key={i} transform={`translate(0, ${i * 64 + dy})`}>
                {rand.map((v, j) => {
                  const estePivot = i === 0 && j === 0;
                  return (
                    <g key={j}>
                      {estePivot && (
                        <rect
                          x={j * 80}
                          y={0}
                          width={72}
                          height={60}
                          rx={8}
                          fill={culoareRol(ROL_PIVOT)}
                        />
                      )}
                      <Mono
                        x={j * 80 + 36}
                        y={30}
                        text={num(v)}
                        marime={32 * Math.min(st, 1.25)}
                        culoare={estePivot ? "var(--viz-pivot-text)" : "var(--text)"}
                        ancora="middle"
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
        <Proza
          x={PX}
          y={PY + 380}
          text="Permutarea liniilor nu schimbă soluțiile — doar ordinea ecuațiilor."
          marime={30 * Math.min(st, 1.25)}
          culoare="var(--text-slab)"
          greutate={500}
          opacitate={intra(T, P + 4.4, 0.6)}
        />
      </g>

      {/* ═══ 7 · recapitularea ═══ */}
      <g opacity={oFinal}>
        {PASI_FINALI.map((text, i) => (
          <g
            key={i}
            opacity={intra(T, cue.Final + 0.4 + i * 0.5, 0.6)}
            transform={`translate(0, ${urca(T, cue.Final + 0.4 + i * 0.5, 18, 0.6)})`}
          >
            <circle
              cx={PX + 26}
              cy={PY + 30 + i * 110}
              r={26}
              fill={`color-mix(in oklab, ${culoareRol(ROL_ACTIUNE)} 18%, transparent)`}
            />
            <Mono
              x={PX + 26}
              y={PY + 30 + i * 110}
              text={`${i + 1}`}
              marime={26 * Math.min(st, 1.3)}
              culoare={culoareEticheta(ROL_ACTIUNE)}
              ancora="middle"
            />
            <Proza
              x={PX + 76}
              y={PY + 30 + i * 110}
              text={text}
              marime={30 * Math.min(st, 1.25)}
              greutate={600}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ───────────────────────── piesa întreagă ───────────────────────── */

const SUBTITRARI = [
  { la: 0.5, text: "Un sistem liniar cu trei necunoscute." },
  { la: 3.4, text: "Îl scriem compact: matricea extinsă a sistemului." },
  { la: CUE.Obiectiv + 0.9, text: "Scopul eliminării: numai zerouri sub diagonală." },
  { la: CUE.Pas1a + 0.4, text: "Pasul 1. Pivotul este primul element al liniei 1." },
  {
    la: CUE.Pas1a + 3.6,
    text: "Cât din linia 1 scădem din linia 2? Raportul µ spune exact atât: o dată.",
  },
  { la: CUE.Pas1b + 0.3, text: "Aceeași operație pe linia 3, unde µ = 3." },
  { la: CUE.Pas2 + 0.3, text: "Pasul 2. Pivotul se mută pe diagonală: −2, în coloana 2." },
  { la: CUE.Pas2 + 3.8, text: "µ este negativ, deci de data asta adunăm linia 2." },
  {
    la: CUE.Triunghi + 0.3,
    text: "Matricea este superior triunghiulară, iar sistemul are aceleași soluții.",
  },
  { la: CUE.Substitutie + 0.3, text: "Ultima ecuație are o singură necunoscută." },
  {
    la: CUE.Substitutie + 3.4,
    text: "Urcăm linie cu linie, înlocuind ce am aflat: substituție înapoi.",
  },
  { la: CUE.Substitutie + 7.2, text: "Sistemul este rezolvat." },
  { la: CUE.Pivotare + 0.4, text: "Un singur pericol: pivotul iese 0, iar împărțirea cade." },
  { la: CUE.Pivotare + 3.8, text: "Atunci schimbăm liniile între ele — asta este pivotarea." },
  { la: CUE.Final + 0.4, text: "Trei pași, mereu aceiași." },
  { la: CUE.Final + 2.8, text: "Pivotul poate fi ales în mai multe moduri." },
] as const;

/**
 * Clipul paginii 3: cum ajunge un sistem liniar la formă triunghiulară și de
 * acolo la soluție.
 *
 * **Clip scris în cod** — ca la paginile 7, 9, 10 și 11, și din același motiv:
 * animația a venit gata făcută ca animație web (`Eliminare Gaussiana.html`) și
 * s-a portat ca atare. Ca orice clip, **nu** primește parametrii utilizatorului:
 * sistemul desenat e fix.
 *
 * Față de originalul pe fundal alb, culorile vin din `viz-roles.ts`, deci clipul
 * se vede corect în ambele teme; cifrele scrise pe desen folosesc
 * `culoareEticheta`, nu culoarea de desen — sunt text, nu marcaje.
 *
 * **Cifrele nu sunt scrise aici.** Rapoartele `µ`, liniile de după fiecare
 * operație, soluția și determinantul vin din
 * `src/algorithms/eliminare-gaussiana/`, verificate în
 * `scripts/verificare-algoritmi/eliminare-gaussiana.ts` pe exemplul rezolvat din
 * curs.
 */
export function AnimatiaEliminariiGaussiene() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație: eliminarea gaussiană pe un sistem cu trei necunoscute. Sistemul se strânge în " +
        "matricea extinsă, iar scopul se arată dinainte: numai zerouri sub diagonală. La pasul 1, " +
        "pivotul este primul element al liniei 1; raportul µ₂₁ = 1 spune cât din linia 1 se scade " +
        "din linia 2, care devine (0, −2, −2, −8), iar cu µ₃₁ = 3 linia 3 devine (0, 2, 5, 8). La " +
        "pasul 2 pivotul se mută pe diagonală, pe −2; µ₃₂ = −1 este negativ, deci linia 2 se adună, " +
        "iar linia 3 devine (0, 0, 3, 0). Matricea este acum superior triunghiulară, cu " +
        "determinantul −6 citit de pe diagonală. Substituția înapoi dă pe rând x₃ = 0, x₂ = 4 și " +
        "x₁ = −3. La final se arată ce se întâmplă când pivotul iese 0: liniile se schimbă între " +
        "ele, adică pivotare."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
