import * as householder from "@/algorithms/norme-si-ortogonalitate/householder";
import { MATRICE_HOUSEHOLDER } from "@/algorithms/norme-si-ortogonalitate/exemple";
import { PlanOrtogonal, type SageataPlan } from "@/components/content/PlanOrtogonal";
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
    nume: "Tinta",
    durata: 9,
    descriere:
      "Un vector din plan și ținta: să ajungă pe axă fără să-și schimbe lungimea. Cercul arată unde poate ajunge.",
  },
  {
    nume: "Oglinda",
    durata: 12,
    descriere:
      "Oglinda apare, iar vectorul se reflectă exact pe axă. Normala ei, d, se construiește din vector plus norma lui pusă pe prima poziție.",
  },
  {
    nume: "Semnul",
    durata: 11,
    descriere:
      "Cele două oglinzi posibile. Când vectorul e lipit de axă, cea greșită se prăbușește: d iese aproape nul, iar precizia se pierde.",
  },
  {
    nume: "Coloana",
    durata: 11,
    descriere:
      "Aceeași reflexie, pe o matrice 3×3: o singură înmulțire duce toată prima coloană pe axă, deci face două zerouri deodată.",
  },
  {
    nume: "Final",
    durata: 8,
    descriere: "A doua reflexie termină triangularizarea; produsul lor, luat invers, e Q.",
  },
] as const satisfies readonly Scena[];

type NumeScena = (typeof SCENE)[number]["nume"];
const { cue: CUE, total: TOTAL } = repere(SCENE);
const CADRU_STATIC = CUE.Oglinda + 8;

/* ───────────────────────── cifrele ───────────────────────── */

/**
 * **Sursa: `cursuri_MN/curs3_ortogonalitate.md`, §6.** Nimic scris din memorie.
 *
 * Cifrele nu sunt transcrise: se calculează la încărcare cu modulele reale din
 * `src/algorithms/norme-si-ortogonalitate/`, ca desenul și textul să nu se poată
 * contrazice. Vectorul plan e chiar prima coloană a matricei din §6.5, tăiată la
 * două dimensiuni, deci `‖v‖` de pe ecran se regăsește în exemplu.
 */
const V: readonly [number, number] = [2, 1];
const REFLEXIE = householder.reflectaInPlan(V);
const RULARE = householder.run(MATRICE_HOUSEHOLDER);
const PAS_1 = RULARE.pasi[0];
const PAS_2 = RULARE.pasi[1];

/** Vectorul aproape lipit de axă, pe care se vede prăbușirea semnului greșit. */
const V_LIPIT: readonly [number, number] = [3, 0.22];
const REFLEXIE_LIPIT = householder.reflectaInPlan(V_LIPIT);
/** Cu semnul opus: `d = v − ‖v‖·e₁`, adică exact ce nu se face. */
const D_GRESIT: readonly [number, number] = [
  V_LIPIT[0] - Math.hypot(V_LIPIT[0], V_LIPIT[1]),
  V_LIPIT[1],
];

/* ───────────────────────── rolurile de culoare ───────────────────────── */

const ROL_V = "curent" as const;
const ROL_IMAGINE = "solutie" as const;
const ROL_D = "functie" as const;
const ROL_ALT = "anterior" as const;

/* ───────────────────────── cadrul ───────────────────────── */

const W = 1920;
const H = 1080;
const LATIME_CONFORT = 780;
const scaraText = (latime: number) =>
  latime ? Math.min(2.4, Math.max(1, LATIME_CONFORT / latime)) : 1;

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
  text,
  st,
}: {
  x: number;
  y: number;
  latime: number;
  opacitate: number;
  rol?: RolViz;
  simbol: string;
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
      <text
        x={30}
        y={inaltime / 2 - 24}
        dominantBaseline="central"
        fill={rol ? culoareEticheta(rol) : "var(--text)"}
        style={{ font: `700 ${34 * Math.min(st, 1.3)}px var(--font-mono)` }}
      >
        <NotatieSVG text={simbol} marime={34 * Math.min(st, 1.3)} />
      </text>
      <text
        x={30}
        y={inaltime / 2 + 30}
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

/** Matricea desenată, pentru scenele cu exemplul 3×3. */
function Matrice({
  x,
  y,
  valori,
  opacitate,
  zerouriAprinse,
  nume,
  st,
}: {
  x: number;
  y: number;
  valori: number[][];
  opacitate: number;
  zerouriAprinse?: number;
  nume?: string;
  st: number;
}) {
  const latura = 108;
  const spatiu = 6;
  const coloane = valori[0]?.length ?? 0;
  const latime = coloane * latura + (coloane - 1) * spatiu;
  const inaltime = valori.length * latura + (valori.length - 1) * spatiu;
  const stanga = -latime / 2;
  const sus = -inaltime / 2;

  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacitate}>
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
          // Zerou **produs** de o reflexie: sub diagonală. Cele de deasupra,
          // dacă ar exista, ar fi fost acolo de la început.
          const zeroProdus = j < i && Math.abs(valoare) < 1e-9;
          const aprins = zeroProdus ? (zerouriAprinse ?? 0) : 0;
          const rol: RolViz = zeroProdus ? ROL_IMAGINE : "functie";
          return (
            <g key={`${i},${j}`}>
              {aprins > 0 && (
                <rect
                  x={cx - latura / 2}
                  y={cy - latura / 2}
                  width={latura}
                  height={latura}
                  rx={10}
                  fill={`color-mix(in oklab, ${culoareRol(rol)} ${(22 * aprins).toFixed(1)}%, transparent)`}
                  stroke={culoareRol(rol)}
                  strokeWidth={4 * aprins}
                />
              )}
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill={culoareEticheta(rol)}
                style={{ font: `600 ${38 * Math.min(st, 1.4)}px var(--font-mono)` }}
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

/**
 * Cifra din celulă.
 *
 * Rotunjirea la întreg se face cu **prag**, nu cu `Number.isInteger`: după două
 * înmulțiri de matrice, `3` ajunge `2,9999999999999996`, iar celula ar scrie
 * „3,0" lângă un „−3" — două lățimi diferite pentru același fel de număr.
 */
function formateaza(x: number): string {
  if (Math.abs(x) < 1e-9) return "0";
  if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
  return zecimale(x, 1);
}

/* ───────────────────────── desenul ───────────────────────── */

function Desen() {
  const { T, cue, latime } = useClip<NumeScena>();
  const st = scaraText(latime);

  /* 1 · ținta */
  const A = cue.Tinta;
  const oTinta = felie(T, A, cue.Oglinda);
  const aparitieV = intra(T, A + 0.5, 0.8);
  const oCerc = intra(T, A + 2.2, 0.8);
  const oTinte = intra(T, A + 4.2, 0.6);

  /* 2 · oglinda */
  const O = cue.Oglinda;
  const oOglinda = felie(T, O, cue.Semnul);
  const oD = intra(T, O + 1.4, 0.7);
  const oLinie = intra(T, O + 3.4, 0.8);
  // Reflexia se face „pe viu": vectorul alunecă de la v la Pv.
  const drum = animeaza({ dela: 0, la: 1, start: O + 5.4, sfarsit: O + 7.4 })(T);
  const vCurent: readonly [number, number] = [
    V[0] + (REFLEXIE.imagine[0] - V[0]) * drum,
    V[1] + (REFLEXIE.imagine[1] - V[1]) * drum,
  ];
  const oFormula = intra(T, O + 8.2, 0.6);

  /* 3 · semnul */
  const S = cue.Semnul;
  const oSemn = felie(T, S, cue.Coloana);
  const oGresit = intra(T, S + 3.6, 0.8);
  const oPrabusire = intra(T, S + 6.4, 0.8);

  /* 4 · coloana */
  const C = cue.Coloana;
  const oColoana = felie(T, C, cue.Final);
  const oDupa = intra(T, C + 3.2, 0.8);
  const aZerouri = intra(T, C + 4.6, 0.9);

  /* 5 · final */
  const F = cue.Final;
  const oFinal = felie(T, F, TOTAL + 1);
  const oR = intra(T, F + 1.2, 0.8);

  const sagetiTinta: SageataPlan[] = [
    { la: V, rol: ROL_V, eticheta: "v", aparitie: aparitieV },
    ...(oTinte > 0
      ? ([
          {
            la: [REFLEXIE.norma, 0],
            rol: ROL_ALT,
            eticheta: "+‖v‖",
            aparitie: oTinte,
            punctata: true,
          },
          {
            la: [-REFLEXIE.norma, 0],
            rol: ROL_ALT,
            eticheta: "−‖v‖",
            aparitie: oTinte,
            punctata: true,
          },
        ] as SageataPlan[])
      : []),
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      {/* ═══ 1 · ținta ═══ */}
      <Antet opacitate={oTinta} titlu="Unde poate ajunge" st={st} />
      <g opacity={oTinta}>
        <PlanOrtogonal
          centru={[620, 495]}
          scara={62}
          raza={5}
          sageti={sagetiTinta}
          cerc={{ raza: REFLEXIE.norma, aparitie: oCerc }}
          st={st}
        />
        <Cartonas
          x={1240}
          y={330}
          latime={560}
          opacitate={intra(T, A + 2.4, 0.5)}
          rol={ROL_V}
          simbol={`‖v‖ = ${zecimale(REFLEXIE.norma, 4)}`}
          text="Lungimea nu se schimbă"
          st={st}
        />
        <Cartonas
          x={1240}
          y={500}
          latime={560}
          opacitate={intra(T, A + 4.4, 0.5)}
          rol={ROL_ALT}
          simbol="±‖v‖·e₁"
          text="Două ținte pe axă, deci două oglinzi"
          st={st}
        />
      </g>
      <Concluzie
        opacitate={oTinta * intra(T, A + 6.4, 0.5)}
        st={st}
        copii="O transformare care păstrează lungimea nu poate duce vectorul oriunde."
      />

      {/* ═══ 2 · oglinda ═══ */}
      <Antet opacitate={oOglinda} titlu="Oglinda" st={st} />
      <g opacity={oOglinda}>
        <PlanOrtogonal
          centru={[620, 495]}
          scara={62}
          raza={5}
          sageti={[
            {
              la: vCurent,
              rol: drum > 0.5 ? ROL_IMAGINE : ROL_V,
              eticheta: drum > 0.5 ? "P·v" : "v",
            },
            { la: REFLEXIE.d, rol: ROL_D, eticheta: "d", aparitie: oD },
          ]}
          oglinda={{ directie: REFLEXIE.oglinda, aparitie: oLinie }}
          cerc={{ raza: REFLEXIE.norma, aparitie: 0.5 }}
          st={st}
        />
        <Cartonas
          x={1240}
          y={300}
          latime={580}
          opacitate={oD}
          rol={ROL_D}
          simbol={`d = (${zecimale(REFLEXIE.d[0], 3)}; ${zecimale(REFLEXIE.d[1], 3)})`}
          text="Normala oglinzii, nu oglinda"
          st={st}
        />
        <Cartonas
          x={1240}
          y={470}
          latime={580}
          opacitate={oLinie}
          rol="interval"
          simbol="d ⊥ oglindă"
          text="Dreapta de oglindire trece prin origine"
          st={st}
        />
        <Cartonas
          x={1240}
          y={640}
          latime={580}
          opacitate={oFormula}
          rol={ROL_IMAGINE}
          simbol={`P·v = (${zecimale(REFLEXIE.imagine[0], 3)}; 0)`}
          text="Componenta a doua a devenit zero"
          st={st}
        />
      </g>
      <Concluzie
        opacitate={oOglinda * oFormula}
        st={st}
        copii={
          <>
            <tspan fill={culoareEticheta(ROL_D)}>d = v + sign(v₁)·‖v‖·e₁</tspan> — vectorul, plus
            norma lui pusă pe prima poziție.
          </>
        }
      />

      {/* ═══ 3 · semnul ═══ */}
      <Antet opacitate={oSemn} titlu="De ce semnul acela" st={st} />
      <g opacity={oSemn}>
        <PlanOrtogonal
          centru={[620, 495]}
          scara={62}
          raza={5}
          sageti={[
            { la: V_LIPIT, rol: ROL_V, eticheta: "v" },
            { la: REFLEXIE_LIPIT.d, rol: ROL_D, eticheta: "d bun" },
            ...(oGresit > 0
              ? ([
                  { la: D_GRESIT, rol: ROL_ALT, eticheta: "d greșit", aparitie: oGresit },
                ] as SageataPlan[])
              : []),
          ]}
          st={st}
        />
        <Cartonas
          x={1220}
          y={300}
          latime={600}
          opacitate={intra(T, S + 1.6, 0.5)}
          rol={ROL_D}
          simbol={`‖d‖ = ${zecimale(Math.hypot(REFLEXIE_LIPIT.d[0], REFLEXIE_LIPIT.d[1]), 3)}`}
          text="Cu semnul din formulă"
          st={st}
        />
        <Cartonas
          x={1220}
          y={470}
          latime={600}
          opacitate={oGresit}
          rol={ROL_ALT}
          simbol={`‖d‖ = ${zecimale(Math.hypot(D_GRESIT[0], D_GRESIT[1]), 3)}`}
          text="Cu semnul opus, pe un vector lipit de axă"
          st={st}
        />
        <Cartonas
          x={1220}
          y={640}
          latime={600}
          opacitate={oPrabusire}
          rol="pivot"
          simbol="v − ‖v‖·e₁"
          text="Scădere între numere aproape egale"
          st={st}
        />
      </g>
      <Concluzie
        opacitate={oSemn * oPrabusire}
        st={st}
        copii="Semnul se alege ca v și reflexia lui să fie depărtate."
      />

      {/* ═══ 4 · coloana ═══ */}
      <Antet opacitate={oColoana} titlu="O reflexie, o coloană" st={st} />
      <g opacity={oColoana}>
        <Matrice
          x={520}
          y={480}
          valori={PAS_1?.inainte ?? MATRICE_HOUSEHOLDER}
          opacitate={1}
          nume="A"
          st={st}
        />
        <text
          x={960}
          y={480}
          textAnchor="middle"
          dominantBaseline="central"
          opacity={oDupa}
          fill="var(--text-slab)"
          style={{ font: `600 ${52 * Math.min(st, 1.3)}px var(--font-mono)` }}
        >
          →
        </text>
        <Matrice
          x={1400}
          y={480}
          valori={PAS_1?.dupa ?? MATRICE_HOUSEHOLDER}
          opacitate={oDupa}
          zerouriAprinse={aZerouri}
          nume="P₁·A"
          st={st}
        />
      </g>
      <Concluzie
        opacitate={oColoana * intra(T, C + 6.4, 0.5)}
        st={st}
        copii={
          <>
            Prima coloană are norma {zecimale(PAS_1?.norma ?? 0, 0)}, deci ajunge în{" "}
            <tspan fill={culoareEticheta(ROL_IMAGINE)}>(−3; 0; 0)</tspan> — două zerouri dintr-o
            înmulțire.
          </>
        }
      />

      {/* ═══ 5 · final ═══ */}
      <Antet opacitate={oFinal} titlu="Încă una, și gata" st={st} />
      <g opacity={oFinal}>
        <Matrice x={520} y={470} valori={PAS_2?.inainte ?? []} opacitate={1} nume="P₁·A" st={st} />
        <text
          x={960}
          y={470}
          textAnchor="middle"
          dominantBaseline="central"
          opacity={oR}
          fill="var(--text-slab)"
          style={{ font: `600 ${52 * Math.min(st, 1.3)}px var(--font-mono)` }}
        >
          →
        </text>
        <Matrice
          x={1400}
          y={470}
          valori={RULARE.R}
          opacitate={oR}
          zerouriAprinse={oR}
          nume="R"
          st={st}
        />
      </g>
      <Concluzie
        opacitate={oFinal * intra(T, F + 3.4, 0.5)}
        st={st}
        copii="Două reflexii pentru o matrice 3×3 — una pentru fiecare coloană de sub diagonală."
      />
    </svg>
  );
}

/* ───────────────────────── piesa întreagă ───────────────────────── */

const SUBTITRARI = [
  { la: CUE.Tinta + 0.4, text: "Vrem să ducem vectorul pe axă, fără să-i schimbăm lungimea." },
  {
    la: CUE.Tinta + 2.6,
    text: `Lungimea rămâne ${zecimale(REFLEXIE.norma, 4)}, deci vârful nu poate părăsi cercul.`,
  },
  { la: CUE.Tinta + 4.6, text: "Pe axă sunt doar două puncte la distanța asta: +‖v‖ și −‖v‖." },
  { la: CUE.Oglinda + 0.4, text: "Reflexia față de o dreaptă prin origine face exact asta." },
  {
    la: CUE.Oglinda + 1.6,
    text: "Direcția de reflexie e d — normala oglinzii, nu oglinda însăși.",
  },
  { la: CUE.Oglinda + 5.6, text: "Vectorul trece dincolo de oglindă și aterizează pe axă." },
  { la: CUE.Semnul + 0.4, text: "Din cele două oglinzi, una e mult mai bună decât cealaltă." },
  {
    la: CUE.Semnul + 3.8,
    text: "Când v e lipit de axă, semnul opus dă un d aproape nul — oglinda ajunge definită de zgomot.",
  },
  {
    la: CUE.Coloana + 0.4,
    text: "Aceeași reflexie, dar în trei dimensiuni, pe o coloană de matrice.",
  },
  { la: CUE.Coloana + 4.4, text: "O singură înmulțire, și toată coloana de sub diagonală e zero." },
  { la: CUE.Final + 0.4, text: "A doua reflexie curăță coloana a doua, iar matricea devine R." },
  { la: TOTAL - 3.0, text: "Produsul reflexiilor, luat invers, e chiar Q." },
] as const;

/**
 * Clipul paginii 2, partea de Householder: de ce o oglindă face zerouri.
 *
 * Scris în cod, ca toate clipurile site-ului. Cifrele nu sunt transcrise: vin
 * din `src/algorithms/norme-si-ortogonalitate/`, deci desenul, cartonașele și
 * subtitrările nu se pot contrazice.
 *
 * Ca orice clip, **nu** primește parametrii utilizatorului — vectorul tras cu
 * mouse-ul e treaba interfeței de mai jos. Aici se spune ce nu se poate
 * descoperi trăgând: de ce ținta e pe axă, de ce semnul contează și ce se
 * întâmplă când treci de la un vector la o coloană de matrice.
 */
export function AnimatiaHouseholder() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație: reflexia Householder. Un vector din plan trebuie dus pe axă fără să-și schimbe " +
        "lungimea; fiindcă lungimea se păstrează, vârful lui rămâne pe cerc, iar pe axă sunt doar " +
        "două ținte, +‖v‖ și −‖v‖. Reflexia față de o dreaptă prin origine face exact asta: normala " +
        "oglinzii e d = v + sign(v₁)·‖v‖·e₁, iar vectorul trece dincolo de oglindă și aterizează pe " +
        "axă, cu a doua componentă zero. Semnul din formulă alege oglinda care duce vectorul în " +
        "partea opusă: cu semnul celălalt, un vector lipit de axă dă un d aproape nul, adică o " +
        "oglindă definită de zgomot. La final, aceeași reflexie pe o matrice 3×3 duce toată prima " +
        "coloană pe axă și face două zerouri dintr-o singură înmulțire; a doua reflexie termină " +
        "triangularizarea."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
