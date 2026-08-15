import * as givens from "@/algorithms/norme-si-ortogonalitate/givens";
import * as householder from "@/algorithms/norme-si-ortogonalitate/householder";
import { MATRICE_GIVENS, MATRICE_HOUSEHOLDER } from "@/algorithms/norme-si-ortogonalitate/exemple";
import { PlanOrtogonal } from "@/components/content/PlanOrtogonal";
import { Clip } from "@/components/viz/Clip";
import { useClip } from "@/components/viz/clip-context";
import { NotatieSVG } from "@/components/viz/Notatie";
import { Subtitrari } from "@/components/viz/Subtitrari";
import { animeaza, EASING, repere, type Scena } from "@/lib/compozitie";
import { zecimale } from "@/lib/numere";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";
import { marimeCareIncape } from "@/lib/tipografie-clip";

/* ───────────────────────── timpul ───────────────────────── */

const SCENE = [
  {
    nume: "Rotatia",
    durata: 11,
    descriere:
      "Vectorul se rotește până cade pe axă. Unghiul nu se calculează niciodată: din condiția ca a doua componentă să fie zero ies direct cosinusul și sinusul.",
  },
  {
    nume: "Matricea",
    durata: 11,
    descriere:
      "Matricea de rotație e identitatea cu patru elemente schimbate, deci atinge doar două linii ale matricei pe care o înmulțește.",
  },
  {
    nume: "Exemplu",
    durata: 14,
    descriere:
      "Trei rotații pe o matrice 3×3, element cu element, de sus în jos. Prima are cosinusul zero: e o schimbare de linii curată.",
  },
  {
    nume: "Fata",
    durata: 10,
    descriere:
      "Față de Householder: mai multe transformări, dar fiecare atinge doar două linii — de unde paralelizarea și blândețea cu matricele rare.",
  },
] as const satisfies readonly Scena[];

type NumeScena = (typeof SCENE)[number]["nume"];
const { cue: CUE, total: TOTAL } = repere(SCENE);
const CADRU_STATIC = CUE.Rotatia + 7;

/* ───────────────────────── cifrele ───────────────────────── */

/**
 * **Sursa: `cursuri_MN/curs3_ortogonalitate.md`, §7.** Nimic scris din memorie.
 *
 * Cifrele vin din modulele reale, calculate la încărcare. Exemplul 3×3 e cel din
 * §7.4 — cu cifrele **corecte**: cursul greșește acolo aritmetica de la a doua
 * rotație încolo, iar cazul e scris în `docs/erata-cursuri.md`.
 */
const V: readonly [number, number] = [2.4, 1.6];
const ROTATIE = givens.rotesteInPlan(V);
/**
 * Ordinea de pe desen e de sus în jos: primul element de sub diagonală, apoi
 * următorul. Dă aceeași factorizare ca ordinea cursului (verificat: `R` iese
 * identic pe exemplul din §7.4) și se urmărește mai ușor cu ochiul.
 */
const RULARE = givens.run(MATRICE_GIVENS, "sus-jos");
const RULARE_HH = householder.run(MATRICE_HOUSEHOLDER);

/** Forma matricei, înainte să apară cifrele calculate mai sus. */
const SIMBOLURI_G = [
  ["cos θ", "−sin θ", "0"],
  ["sin θ", "cos θ", "0"],
  ["0", "0", "1"],
] as const;

/* ───────────────────────── roluri ───────────────────────── */

const ROL_V = "curent" as const;
const ROL_IMAGINE = "solutie" as const;
const ROL_ALT = "anterior" as const;

/* ───────────────────────── cadrul ───────────────────────── */

const W = 1920;
const H = 1080;
const scaraText = (latime: number) => (latime ? Math.min(2.4, Math.max(1, 780 / latime)) : 1);
const felie = (T: number, a: number, b: number) => (T >= a && T < b ? 1 : 0);
const intra = (T: number, la: number, durata = 0.45) =>
  animeaza({ dela: 0, la: 1, start: la, sfarsit: la + durata, ease: EASING.iesireCubica })(T);

/* ───────────────────────── piese ───────────────────────── */

function Antet({ opacitate, titlu, st }: { opacitate: number; titlu: string; st: number }) {
  return (
    <g opacity={opacitate}>
      <text
        x={110}
        y={112}
        fill="var(--text)"
        style={{ font: `800 ${52 * Math.min(st, 1.3)}px var(--font-sans)` }}
      >
        {titlu}
      </text>
    </g>
  );
}

function Cartonas({
  x,
  y,
  latime,
  opacitate,
  rol,
  simbol,
  titlu,
  text,
  st,
}: {
  x: number;
  y: number;
  latime: number;
  opacitate: number;
  rol?: RolViz;
  /** Formula de deasupra, în mono. Se exclude cu `titlu`. */
  simbol?: string;
  /**
   * Rândul de deasupra când el e **cuvinte**, nu formulă: același loc și
   * aceeași greutate ca `simbol`, dar în Nunito Sans. Un cuvânt scris mono
   * arată ca o scăpare (vezi regula din CLAUDE.md), iar un cartonaș cu o
   * singură propoziție lungă, plutind la mijloc, ieșea din rândul celorlalte.
   */
  titlu?: string;
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
      {titlu && (
        <text
          x={30}
          y={inaltime / 2 - 24}
          dominantBaseline="central"
          fill={rol ? culoareEticheta(rol) : "var(--text)"}
          style={{
            font: `700 ${marimeCareIncape(titlu, latime - 30 * 2, 36) * Math.min(st, 1.3)}px var(--font-sans)`,
          }}
        >
          {titlu}
        </text>
      )}
      <text
        x={30}
        y={simbol || titlu ? inaltime / 2 + 30 : inaltime / 2}
        dominantBaseline="central"
        fill="var(--text)"
        style={{
          font: `600 ${marimeCareIncape(text, latime - 30 * 2) * Math.min(st, 1.35)}px var(--font-sans)`,
        }}
      >
        {text}
      </text>
    </g>
  );
}

function Concluzie({
  opacitate,
  copii,
  st,
}: {
  opacitate: number;
  copii: React.ReactNode;
  st: number;
}) {
  return (
    // 866, nu 912: sub ea începe banda subtitrărilor, iar cele două propoziții
    // ajungeau lipite, ca un singur paragraf citit din două locuri.
    <text
      x={W / 2}
      y={866}
      textAnchor="middle"
      opacity={opacitate}
      fill="var(--text)"
      style={{ font: `700 ${38 * Math.min(st, 1.25)}px var(--font-sans)` }}
    >
      {copii}
    </text>
  );
}

/**
 * Matricea desenată, cu evidențierea pe **linii**: aici asta e ideea, nu
 * celulele — o rotație atinge exact două linii și lasă restul neatins.
 */
function Matrice({
  x,
  y,
  valori,
  opacitate,
  simboluri,
  amestec = 1,
  liniiAtinse,
  coloanaAtinsa,
  aprindere = 0,
  tinta,
  nume,
  latura = 104,
  st,
}: {
  x: number;
  y: number;
  valori: number[][];
  opacitate: number;
  /**
   * Ce scrie în celule înainte să apară cifrele — forma simbolică a matricei.
   * `amestec` face trecerea: 0 = simboluri, 1 = cifre.
   */
  simboluri?: readonly (readonly string[])[];
  amestec?: number;
  liniiAtinse?: readonly number[];
  /** Coloana elementului de anulat, evidențiată odată cu linia lui. */
  coloanaAtinsa?: number;
  aprindere?: number;
  /** Elementul care tocmai a devenit zero. */
  tinta?: { linie: number; coloana: number };
  nume?: string;
  latura?: number;
  st: number;
}) {
  const spatiu = 6;
  const coloane = valori[0]?.length ?? 0;
  const latime = coloane * latura + (coloane - 1) * spatiu;
  const inaltime = valori.length * latura + (valori.length - 1) * spatiu;
  const stanga = -latime / 2;
  const sus = -inaltime / 2;

  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacitate}>
      {(liniiAtinse ?? []).map((i) => (
        <rect
          key={`linie-${i}`}
          x={stanga - 14}
          y={sus + i * (latura + spatiu) - 3}
          width={latime + 28}
          height={latura + 6}
          rx={12}
          fill={`color-mix(in oklab, ${culoareRol("interval")} ${(20 * aprindere).toFixed(1)}%, transparent)`}
        />
      ))}
      {coloanaAtinsa !== undefined && (
        <rect
          x={stanga + coloanaAtinsa * (latura + spatiu) - 3}
          y={sus - 14}
          width={latura + 6}
          height={inaltime + 28}
          rx={12}
          fill={`color-mix(in oklab, ${culoareRol("interval")} ${(20 * aprindere).toFixed(1)}%, transparent)`}
        />
      )}

      <g stroke="var(--text)" strokeWidth={6} fill="none" strokeLinecap="square">
        <path
          d={`M ${stanga + 4} ${sus - 9} H ${stanga - 16} V ${sus + inaltime + 9} H ${stanga + 4}`}
        />
        <path
          d={`M ${stanga + latime - 4} ${sus - 9} H ${stanga + latime + 16} V ${sus + inaltime + 9} H ${stanga + latime - 4}`}
        />
      </g>

      {valori.map((linie, i) =>
        linie.map((valoare, j) => {
          const cx = stanga + j * (latura + spatiu) + latura / 2;
          const cy = sus + i * (latura + spatiu) + latura / 2;
          const esteTinta = tinta?.linie === i && tinta?.coloana === j;
          const rol: RolViz = esteTinta ? ROL_IMAGINE : "functie";
          return (
            <g key={`${i},${j}`}>
              {esteTinta && aprindere > 0 && (
                <rect
                  x={cx - latura / 2}
                  y={cy - latura / 2}
                  width={latura}
                  height={latura}
                  rx={10}
                  fill={`color-mix(in oklab, ${culoareRol(rol)} ${(22 * aprindere).toFixed(1)}%, transparent)`}
                  stroke={culoareRol(rol)}
                  strokeWidth={4 * aprindere}
                />
              )}
              {simboluri && amestec < 1 && (
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  opacity={1 - amestec}
                  fill={culoareEticheta(rol)}
                  style={{ font: `600 ${34 * Math.min(st, 1.4)}px var(--font-mono)` }}
                >
                  {simboluri[i]?.[j] ?? ""}
                </text>
              )}
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                opacity={simboluri ? amestec : 1}
                fill={culoareEticheta(rol)}
                style={{ font: `600 ${36 * Math.min(st, 1.4)}px var(--font-mono)` }}
              >
                {formateaza(valoare)}
              </text>
            </g>
          );
        }),
      )}

      {nume && (
        <text
          x={0}
          y={sus - 52}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text)"
          style={{ font: `800 ${36 * Math.min(st, 1.4)}px var(--font-sans)` }}
        >
          {nume}
        </text>
      )}
    </g>
  );
}

/** Ca la clipul Householder: rotunjire cu prag, altfel „3" și „3,00" se amestecă. */
function formateaza(x: number): string {
  if (Math.abs(x) < 1e-9) return "0";
  if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
  return zecimale(x, 2);
}

/* ───────────────────────── desenul ───────────────────────── */

function Desen() {
  const { T, cue, latime } = useClip<NumeScena>();
  const st = scaraText(latime);

  /* 1 · rotația */
  const R = cue.Rotatia;
  const oRot = felie(T, R, cue.Matricea);
  const rotire = animeaza({ dela: 0, la: 1, start: R + 2.2, sfarsit: R + 4.6 })(T);
  const unghiCurent = Math.atan2(V[1], V[0]) * (1 - rotire);
  const vRotit: readonly [number, number] = [
    ROTATIE.r * Math.cos(unghiCurent),
    ROTATIE.r * Math.sin(unghiCurent),
  ];
  const oCs = intra(T, R + 5.4, 0.6);
  const oFaraUnghi = intra(T, R + 7.4, 0.6);

  /* 2 · matricea de rotație */
  const M = cue.Matricea;
  const oMat = felie(T, M, cue.Exemplu);
  const oPatru = intra(T, M + 1.6, 0.6);
  /** Trecerea de la `cos θ` la cifra lui: întâi forma, apoi valorile de mai sus. */
  const amestecCifre = intra(T, M + 4.4, 1.2);

  /* 3 · exemplul */
  const E = cue.Exemplu;
  const oEx = felie(T, E, cue.Fata);
  const PE_PAS = 3.6;
  const indice = Math.min(RULARE.pasi.length - 1, Math.max(0, Math.floor((T - E - 1.0) / PE_PAS)));
  const pas = RULARE.pasi[indice];
  const inPas = (T - E - 1.0) / PE_PAS - indice;
  const aratatDupa = inPas > 0.45;
  const aprindere = Math.max(0, Math.min(1, (inPas - 0.45) * 3));

  /* 4 · față în față */
  const F = cue.Fata;
  const oFata = felie(T, F, TOTAL + 1);
  const oGivens = intra(T, F + 0.6, 0.6);
  const oHh = intra(T, F + 2.2, 0.6);
  const oRegula = intra(T, F + 5.0, 0.6);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      {/* ═══ 1 · rotația ═══ */}
      <Antet opacitate={oRot} titlu="Rotația" st={st} />
      <g opacity={oRot}>
        <PlanOrtogonal
          centru={[660, 480]}
          scara={106}
          raza={3}
          sageti={[
            {
              la: vRotit,
              rol: rotire > 0.6 ? ROL_IMAGINE : ROL_V,
              eticheta: rotire > 0.6 ? "G·v" : "v",
            },
            ...(rotire > 0.02 && rotire < 0.98
              ? [{ la: V, rol: ROL_ALT, eticheta: "", punctata: true } as const]
              : []),
          ]}
          arc={
            // Aceeași fereastră ca urma punctată a lui `v`: unghiul se măsoară
            // **între** cele două direcții, deci n-are ce căuta pe ecran după
            // ce una dintre ele a dispărut.
            rotire > 0.05 && rotire < 0.98
              ? {
                  dela: [Math.cos(Math.atan2(V[1], V[0])), Math.sin(Math.atan2(V[1], V[0]))],
                  la: [1, 0],
                  eticheta: "θ",
                }
              : undefined
          }
          cerc={{ raza: ROTATIE.r, aparitie: 0.7 }}
          st={st}
        />
        <Cartonas
          x={1230}
          y={310}
          latime={590}
          opacitate={oCs}
          rol={ROL_V}
          simbol={`cos θ = ${zecimale(ROTATIE.c, 4)}`}
          text="x / r"
          st={st}
        />
        <Cartonas
          x={1230}
          y={480}
          latime={590}
          opacitate={oCs}
          rol={ROL_V}
          simbol={`sin θ = ${zecimale(ROTATIE.s, 4)}`}
          text="−y / r"
          st={st}
        />
        <Cartonas
          x={1230}
          y={650}
          latime={590}
          opacitate={oFaraUnghi}
          rol={ROL_IMAGINE}
          simbol={`r = ${zecimale(ROTATIE.r, 4)}`}
          text="Unde aterizează, adică ‖v‖"
          st={st}
        />
      </g>
      <Concluzie
        opacitate={oRot * oFaraUnghi}
        st={st}
        copii="Unghiul nu se calculează niciodată — cosinusul și sinusul ies direct din x și y."
      />

      {/* ═══ 2 · matricea ═══ */}
      <Antet opacitate={oMat} titlu="Matricea de rotație" st={st} />
      <g opacity={oMat}>
        <Matrice
          x={620}
          y={480}
          valori={[
            [ROTATIE.c, -ROTATIE.s, 0],
            [ROTATIE.s, ROTATIE.c, 0],
            [0, 0, 1],
          ]}
          simboluri={SIMBOLURI_G}
          amestec={amestecCifre}
          opacitate={1}
          // Celulele au nevoie de loc: „−0,55" e cu un semn mai lung decât restul.
          latura={132}
          nume="G"
          tinta={undefined}
          st={st}
        />
        {/* Mai îngust decât cartonașele cu formulă: aici textul e scurt, iar la
            640 rămânea o jumătate de cartonaș goală lângă el. */}
        <Cartonas
          x={1230}
          y={414}
          latime={470}
          opacitate={oPatru}
          rol={ROL_V}
          titlu="Matricea identitate"
          text="cu 4 elemente schimbate"
          st={st}
        />
      </g>

      {/* ═══ 3 · exemplul ═══ */}
      <Antet opacitate={oEx} titlu="Trei rotații, una pe element" st={st} />
      <g opacity={oEx}>
        <Matrice
          x={W / 2}
          y={470}
          valori={(aratatDupa ? pas?.dupa : pas?.inainte) ?? MATRICE_GIVENS}
          opacitate={1}
          liniiAtinse={pas ? [pas.linie ?? 0] : []}
          coloanaAtinsa={pas?.coloana}
          aprindere={aratatDupa ? aprindere : 0.55}
          tinta={aratatDupa && pas ? { linie: pas.linie ?? 0, coloana: pas.coloana } : undefined}
          nume={aratatDupa ? `G${indice + 1}·A` : "A"}
          st={st}
        />
        <text
          x={W / 2}
          y={760}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text)"
          style={{ font: `700 ${34 * Math.min(st, 1.3)}px var(--font-mono)` }}
        >
          {pas
            ? `cos θ = ${zecimale(pas.c ?? 0, 3)}   sin θ = ${zecimale(pas.s ?? 0, 3)}   r = ${zecimale(pas.r ?? 0, 3)}`
            : ""}
        </text>
      </g>
      <Concluzie
        opacitate={oEx * intra(T, E + 11.4, 0.5)}
        st={st}
        copii={
          <>
            Prima rotație are <tspan fill={culoareEticheta(ROL_IMAGINE)}>cos θ = 0</tspan>: schimbă
            liniile între ele, atât.
          </>
        }
      />

      {/* ═══ 4 · față în față ═══ */}
      <Antet opacitate={oFata} titlu="Față de oglindă" st={st} />
      <g opacity={oFata}>
        <Cartonas
          x={180}
          y={340}
          latime={700}
          opacitate={oHh}
          rol={ROL_ALT}
          simbol={`Householder: ${RULARE_HH.pasi.length}`}
          text="O reflexie pentru fiecare coloană"
          st={st}
        />
        <Cartonas
          x={180}
          y={510}
          latime={700}
          opacitate={oGivens}
          rol={ROL_V}
          simbol={`Givens: ${RULARE.pasi.length}`}
          text="O rotație pentru fiecare element"
          st={st}
        />
        <Cartonas
          x={1020}
          y={340}
          latime={720}
          opacitate={oRegula}
          rol="interval"
          titlu="Două linii per rotație"
          text="Se pot face mai multe deodată"
          st={st}
        />
        <Cartonas
          x={1020}
          y={510}
          latime={720}
          opacitate={oRegula}
          rol={ROL_IMAGINE}
          titlu="Zerourile rămân"
          text="Nu amestecă toată coloana"
          st={st}
        />
      </g>
      <Concluzie
        opacitate={oFata * intra(T, F + 7.0, 0.5)}
        st={st}
        copii="Householder pentru matrice pline, Givens pentru matrice rare."
      />
    </svg>
  );
}

/* ───────────────────────── piesa întreagă ───────────────────────── */

const SUBTITRARI = [
  { la: CUE.Rotatia + 0.4, text: "Aceeași țintă ca la oglindă: vectorul, dus pe axă." },
  {
    la: CUE.Rotatia + 2.4,
    text: "De data asta prin rotație — lungimea se păstrează la fel de bine.",
  },
  {
    la: CUE.Rotatia + 5.6,
    text: "Din condiția ca a doua componentă să fie zero ies direct cos θ și sin θ.",
  },
  {
    la: CUE.Matricea + 0.4,
    text: "În matrice, rotația e identitatea cu patru elemente schimbate.",
  },
  {
    la: CUE.Matricea + 4.6,
    text: "De aceea înmulțirea atinge exact două linii, și nimic altceva.",
  },
  { la: CUE.Exemplu + 0.4, text: "Pe o matrice 3×3, se ia element cu element, de sus în jos." },
  {
    la: CUE.Exemplu + 1.4,
    text: "Primul element de anulat stă sub un zero de pe diagonală: rotația schimbă cele două linii.",
  },
  { la: CUE.Exemplu + 8.2, text: "După trei rotații, sub diagonală nu mai e nimic." },
  { la: CUE.Fata + 0.4, text: "Oglinda a avut nevoie de două transformări, rotația de trei." },
  {
    la: CUE.Fata + 4.8,
    text: "În schimb, o rotație atinge doar două linii: mai multe se pot face în paralel.",
  },
  { la: TOTAL - 3.0, text: "De aici regula: Householder pe matrice pline, Givens pe cele rare." },
] as const;

/**
 * Clipul paginii 2, partea de Givens: rotația care face un zero.
 *
 * Scris în cod, ca toate clipurile site-ului, cu cifrele calculate din modulele
 * reale. Împarte desenul planului (`PlanOrtogonal`) cu clipul Householder și cu
 * interfața, ca aceeași transformare să arate la fel oriunde apare.
 *
 * Exemplul 3×3 folosește cifrele **corecte**, nu pe cele tipărite în curs: acolo
 * aritmetica e greșită de la a doua rotație încolo (vezi `docs/erata-cursuri.md`).
 */
export function AnimatiaGivens() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație: rotația Givens. Un vector din plan e rotit până cade pe axă; fiindcă rotația " +
        "păstrează lungimea, el aterizează la r = ‖v‖. Unghiul nu se calculează niciodată: din " +
        "condiția ca a doua componentă să devină zero ies direct cos θ = x/r și sin θ = −y/r. În " +
        "matrice, rotația e identitatea cu patru elemente schimbate, deci înmulțirea atinge exact " +
        "două linii și lasă restul neatins. Pe matricea 3×3 din curs trebuie trei rotații, luate " +
        "element cu element; prima are cosinusul zero, adică e o schimbare de linii. Față de Householder, " +
        "care termină în două reflexii, rotațiile sunt mai multe, dar fiecare atinge doar două " +
        "linii — se pot face în paralel și nu strică zerourile existente."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
