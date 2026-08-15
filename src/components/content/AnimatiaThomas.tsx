import { NotatieSVG } from "@/components/viz/Notatie";
import { Clip } from "@/components/viz/Clip";
import { useClip } from "@/components/viz/clip-context";
import { Subtitrari } from "@/components/viz/Subtitrari";
import {
  B_DUPA_ELIMINARE,
  D_DUPA_ELIMINARE,
  PASI_ELIMINARE,
  PASI_SUBSTITUTIE,
  SISTEM_DIN_CLIP,
  SOLUTIA,
} from "@/algorithms/algoritmul-thomas/exemplu";
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
    durata: 6,
    descriere: "Matricea tridiagonală se construiește celulă cu celulă, lângă vectorii x și d.",
  },
  {
    nume: "Eliminare",
    durata: 18,
    descriere:
      "Eliminarea înainte, linie cu linie: µ, apoi bᵢ și dᵢ recalculate, apoi aᵢ devine 0.",
  },
  {
    nume: "Substitutie",
    durata: 10,
    descriere: "Substituția înapoi: x₄ din d₄/b₄, apoi fiecare xᵢ urcând rând cu rând.",
  },
  {
    nume: "Final",
    durata: 6.5,
    descriere: "Soluția completă, costul O(n) și condiția de dominanță diagonală.",
  },
] as const satisfies readonly Scena[];

type NumeScena = (typeof SCENE)[number]["nume"];

const { cue: CUE } = repere(SCENE);

/** Cât ține un pas de eliminare. Trei pași umplu scena „Eliminare". */
const PAS_ELIMINARE = 6;

/** Momentele din interiorul unui pas de eliminare, față de începutul lui. */
const LA_MU = 1;
const LA_B = 2.4;
const LA_D = 3.8;
const LA_A = 5;

/** Cât ține aflarea unei necunoscute la substituția înapoi. */
const PAS_SUBSTITUTIE = 2.3;

/**
 * Cadrul arătat la `prefers-reduced-motion`: substituția înapoi terminată, cu
 * toată soluția pe ecran. E capătul poveștii, deci se ține singur.
 */
const CADRU_STATIC = CUE.Substitutie + 0.4 + 3 * PAS_SUBSTITUTIE + 1.4;

/* ───────────────────────── cifrele ───────────────────────── */

/**
 * Tot ce se vede scris în clip vine din `src/algorithms/algoritmul-thomas/`:
 * rapoartele `µ`, valorile lui `bᵢ` și `dᵢ` după fiecare pas, necunoscutele.
 * Așa desenul și teoria de sub el nu pot ajunge să spună lucruri diferite.
 */
const { a: A, b: B, c: C, d: D } = SISTEM_DIN_CLIP;
const N = B.length;

/** Minus tipografic și virgulă zecimală — la fel ca peste tot în desen. */
const num = (v: number) =>
  (Number.isInteger(v) ? String(v) : String(Math.round(v * 1e6) / 1e6).replace(".", ",")).replace(
    "-",
    "−",
  );

/** `−2` scris ca `(−2)` acolo unde intră într-o înmulțire sau împărțire. */
const parantezat = (v: number) => (v < 0 ? `(${num(v)})` : num(v));

/** Indicii scriși ca cifre mici: `2` → `₂`. */
const JOS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"] as const;
const indice = (n: number) =>
  String(n)
    .split("")
    .map((c) => JOS[Number(c)] ?? c)
    .join("");

/* ───────────────────────── rolurile de culoare ───────────────────────── */

/**
 * Nicio culoare nouă. Rolurile refolosite, fiecare cu un singur înțeles:
 *
 * - `pivot` — celula `bᵢ₋₁`, împărțitorul din `µ`. E chiar pivotul pasului, iar
 *   pe grilă roșul înseamnă exclusiv „pivot";
 * - `interval` — linia pe care se lucrează acum, ca fundal la 20 %, exact cum o
 *   folosește și `MatrixGrid`;
 * - `anterior` — linia de deasupra, cea din care se scade, și cifrele terminate;
 * - `curent` — ce participă la operația de acum: conturul celulelor și rândul
 *   aprins din panoul de formule;
 * - `solutie` — ce **iese** din operație: zeroul produs, valorile recalculate,
 *   necunoscuta aflată.
 */
const ROL_PIVOT = "pivot" as const;
const ROL_LINIE = "interval" as const;
const ROL_SURSA = "anterior" as const;
const ROL_ACTIUNE = "curent" as const;
const ROL_REZULTAT = "solutie" as const;

/* ───────────────────────── cadrul de desen ───────────────────────── */

const W = 1920;
const H = 1080;

/** Celula matricei. */
const CW = 104;
const CH = 92;

/** Colțul din stânga-sus al matricei. */
const GX = 150;
const GY = 340;

const LATIME_MATRICE = N * CW;
/** Coloana necunoscutelor și coloana termenilor liberi, cu semnul „=" între ele. */
const XCOL = GX + LATIME_MATRICE + 92;
const DCOL = XCOL + CW + 124;

/** Panoul de formule din dreapta. */
const PX = 1060;
const PY = 262;

/**
 * Cu cât se îngroașă literele desenului pe un cadru îngust — același truc ca la
 * celelalte clipuri: desenul are 1920 de unități oricât de mic ar fi pe ecran,
 * deci pe telefon literele ar ajunge de câțiva pixeli.
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

/** Trecerea netedă de la valoarea veche la cea nouă, în jurul momentului `la`. */
const schimba = (T: number, la: number) => clamp((T - la) / 0.45, 0, 1);

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

/** Parantezele unui bloc de celule, desenate cu linii. */
function Paranteze({
  x,
  y,
  latime,
  inaltime,
  opacitate,
}: {
  x: number;
  y: number;
  latime: number;
  inaltime: number;
  opacitate: number;
}) {
  const brat = 22;
  return (
    <g
      stroke="var(--text-slab)"
      strokeWidth={5}
      fill="none"
      strokeLinecap="square"
      opacity={opacitate}
    >
      <path d={`M ${x + brat} ${y} H ${x} V ${y + inaltime} H ${x + brat}`} />
      <path
        d={`M ${x + latime - brat} ${y} H ${x + latime} V ${y + inaltime} H ${x + latime - brat}`}
      />
    </g>
  );
}

/**
 * O celulă din desen: rama, eticheta din colț („b₂") și valoarea din mijloc.
 *
 * Valoarea se poate schimba în timpul clipului, deci primește două texte și
 * greutatea trecerii: cel vechi urcă și se stinge, cel nou intră de jos. E
 * singura piesă din clip care ține minte că o cifră „tocmai s-a schimbat".
 */
function Celula({
  coloana,
  linie,
  eticheta,
  vechi,
  nou,
  trecere,
  activ,
  pivot,
  opacitate,
  st,
  T,
  laSchimbare,
}: {
  coloana: number;
  linie: number;
  eticheta?: string;
  vechi: string;
  nou?: string;
  /** 0 = valoarea veche, 1 = cea nouă. */
  trecere?: number;
  /** Cât de tare participă celula la operația de acum. */
  activ: number;
  /** Celula e împărțitorul pasului — singura umplută plin. */
  pivot?: boolean;
  opacitate: number;
  st: number;
  T: number;
  /** Secunda la care valoarea s-a schimbat, pentru pulsație. */
  laSchimbare?: number;
}) {
  const x = coloana + 5;
  const y = linie + 5;
  const w = CW - 10;
  const h = CH - 10;
  const cx = coloana + CW / 2;
  const cy = linie + CH / 2;
  const m = trecere ?? 0;
  const gata = m >= 0.999;
  const corp = 34 * Math.min(st, 1.35);

  const culoare = pivot
    ? "var(--viz-pivot-text)"
    : gata && nou !== undefined
      ? culoareEticheta(ROL_REZULTAT)
      : "var(--text)";
  const scala = laSchimbare !== undefined && gata ? pulsatie(T, laSchimbare) : 1;

  return (
    <g opacity={opacitate}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        fill={
          pivot
            ? culoareRol(ROL_PIVOT)
            : `color-mix(in oklab, ${culoareRol(ROL_ACTIUNE)} ${Math.round(14 * activ)}%, transparent)`
        }
        stroke={activ > 0.02 ? culoareRol(ROL_ACTIUNE) : "var(--bordura)"}
        strokeWidth={activ > 0.02 ? 2 + 2 * activ : 2}
      />
      {eticheta && (
        <Mono
          x={x + 12}
          y={y + 18}
          text={eticheta}
          marime={19 * Math.min(st, 1.3)}
          culoare={pivot ? "var(--viz-pivot-text)" : "var(--text-slab)"}
          greutate={700}
          opacitate={pivot ? 0.9 : 0.75}
        />
      )}
      <g transform={`translate(${cx}, ${cy}) scale(${scala})`}>
        {m < 0.999 && (
          <g opacity={1 - m} transform={`translate(0, ${-14 * m})`}>
            <Mono x={0} y={0} text={vechi} marime={corp} culoare={culoare} ancora="middle" />
          </g>
        )}
        {nou !== undefined && m > 0.001 && (
          <g opacity={m} transform={`translate(0, ${14 * (1 - m)})`}>
            <Mono x={0} y={0} text={nou} marime={corp} culoare={culoare} ancora="middle" />
          </g>
        )}
      </g>
    </g>
  );
}

/** Eticheta unei linii din stânga matricei: „i − 1" (sursa) sau „i" (ținta). */
function EtichetaLinie({
  y,
  text,
  rol,
  opacitate,
  st,
}: {
  y: number;
  text: string;
  rol: RolViz;
  opacitate: number;
  st: number;
}) {
  return (
    <g opacity={opacitate}>
      <rect
        x={GX - 128}
        y={y + CH / 2 - 24}
        width={96}
        height={48}
        rx={10}
        fill={`color-mix(in oklab, ${culoareRol(rol)} 16%, transparent)`}
        stroke={`color-mix(in oklab, ${culoareRol(rol)} 55%, transparent)`}
        strokeWidth={2}
      />
      <Mono
        x={GX - 80}
        y={y + CH / 2}
        text={text}
        marime={26 * Math.min(st, 1.3)}
        culoare={culoareEticheta(rol)}
        ancora="middle"
      />
    </g>
  );
}

/**
 * Un rând din panoul de formule: forma cu litere sus, aceeași formulă cu cifrele
 * pasului curent dedesubt. Se aprinde exact cât timp e la rând.
 */
function RandFormula({
  y,
  simbolic,
  numeric,
  aprins,
  opacitate,
  st,
}: {
  y: number;
  simbolic: string;
  numeric?: string;
  aprins: number;
  opacitate: number;
  st: number;
}) {
  return (
    <g opacity={opacitate}>
      <rect
        x={PX - 22}
        y={y - 40}
        width={716}
        height={numeric ? 116 : 74}
        rx={12}
        fill={`color-mix(in oklab, ${culoareRol(ROL_ACTIUNE)} ${Math.round(14 * aprins)}%, transparent)`}
      />
      <Mono
        x={PX}
        y={y}
        text={simbolic}
        marime={34 * Math.min(st, 1.25)}
        culoare={aprins > 0.5 ? culoareEticheta(ROL_ACTIUNE) : "var(--text)"}
        opacitate={0.55 + 0.45 * aprins}
      />
      {numeric && (
        <Mono
          x={PX + 14}
          y={y + 48}
          text={numeric}
          marime={30 * Math.min(st, 1.2)}
          culoare={aprins > 0.5 ? culoareEticheta(ROL_REZULTAT) : "var(--text-slab)"}
          greutate={600}
          opacitate={0.45 + 0.55 * aprins}
        />
      )}
    </g>
  );
}

/* ───────────────────────── desenul întreg ───────────────────────── */

function Desen() {
  const { T, cue, latime } = useClip<NumeScena>();
  const st = scaraText(latime);

  /* ── în ce pas de eliminare suntem ── */
  const laPas = (k: number) => cue.Eliminare + (k - 1) * PAS_ELIMINARE;
  const pasCurent =
    T >= cue.Eliminare && T < cue.Substitutie
      ? clamp(Math.floor((T - cue.Eliminare) / PAS_ELIMINARE) + 1, 1, N - 1)
      : 0;
  const pas = pasCurent > 0 ? PASI_ELIMINARE[pasCurent - 1] : undefined;
  const t0 = laPas(Math.max(pasCurent, 1));
  const lucreaza = pasCurent > 0 ? banda(T, t0, t0 + PAS_ELIMINARE - 0.4, 0.4) : 0;

  /* ── substituția înapoi: a câta necunoscută s-a aflat ── */
  const laSubstitutie = (k: number) => cue.Substitutie + 0.4 + k * PAS_SUBSTITUTIE;

  /* ── cât de tare participă o celulă la operația de acum ── */
  const activareMatrice = (linie: number, coloana: number) => {
    if (!pas) return 0;
    const i = pas.i;
    if (linie === i && coloana === i - 1) return banda(T, t0 + 0.1, t0 + LA_A + 0.5); // aᵢ
    if (linie === i - 1 && coloana === i - 1) return banda(T, t0 + 0.1, t0 + LA_B + 0.3); // bᵢ₋₁
    if (linie === i && coloana === i) return banda(T, t0 + LA_MU, t0 + LA_B + 0.7); // bᵢ
    if (linie === i - 1 && coloana === i) return banda(T, t0 + LA_MU, t0 + LA_D - 0.1); // cᵢ₋₁
    return 0;
  };
  const activareD = (linie: number) => {
    if (!pas) return 0;
    if (linie === pas.i - 1) return banda(T, t0 + LA_B - 0.2, t0 + LA_D + 0.2);
    if (linie === pas.i) return banda(T, t0 + LA_B + 0.2, t0 + LA_D + 0.7);
    return 0;
  };

  /* ── panourile, câte unul pe scenă ── */
  const oSistem = felie(T, 0, cue.Eliminare);
  const oEliminare = felie(T, cue.Eliminare, cue.Substitutie);
  const oSubstitutie = felie(T, cue.Substitutie, cue.Final);
  const oFinal = felie(T, cue.Final, Number.POSITIVE_INFINITY);

  /* ── ce necunoscută se află acum ── */
  const kSubstitutie =
    T >= cue.Substitutie && T < cue.Final
      ? clamp(Math.floor((T - cue.Substitutie - 0.4) / PAS_SUBSTITUTIE), 0, N - 1)
      : T >= cue.Final
        ? N - 1
        : -1;
  const pasX = kSubstitutie >= 0 ? PASI_SUBSTITUTIE[kSubstitutie] : undefined;

  const eticheta =
    T < cue.Eliminare
      ? "Sistem tridiagonal"
      : T < cue.Substitutie
        ? `Eliminare înainte · linia ${pasCurent + 1}`
        : T < cue.Final
          ? "Substituție înapoi"
          : "Recapitulare";

  const PASI_FINALI = [
    "O trecere înainte: µ, apoi bᵢ și dᵢ.",
    "O trecere înapoi: fiecare xᵢ din xᵢ₊₁.",
    "Doi vectori atinși, O(n) operații.",
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      {/* eticheta momentului */}
      <Proza
        x={W - 160}
        y={96}
        text={eticheta}
        marime={26 * Math.min(st, 1.4)}
        culoare={culoareEticheta(ROL_ACTIUNE)}
        ancora="end"
        greutate={700}
        litere="0.04em"
      />

      {/* ═══ liniile evidențiate ═══ */}
      {pas && (
        <g opacity={lucreaza}>
          <rect
            x={GX - 14}
            y={GY + (pas.i - 1) * CH}
            width={LATIME_MATRICE + 28}
            height={CH}
            rx={12}
            fill={`color-mix(in oklab, ${culoareRol(ROL_SURSA)} 14%, transparent)`}
          />
          <rect
            x={GX - 14}
            y={GY + pas.i * CH}
            width={LATIME_MATRICE + 28}
            height={CH}
            rx={12}
            fill={`color-mix(in oklab, ${culoareRol(ROL_LINIE)} 20%, transparent)`}
          />
          <EtichetaLinie
            y={GY + (pas.i - 1) * CH}
            text="i − 1"
            rol={ROL_SURSA}
            opacitate={intra(T, t0 + 0.1, 0.4)}
            st={st}
          />
          <EtichetaLinie
            y={GY + pas.i * CH}
            text="i"
            rol={ROL_LINIE}
            opacitate={intra(T, t0 + 0.25, 0.4)}
            st={st}
          />
        </g>
      )}

      {/* ═══ parantezele ═══ */}
      <Paranteze
        x={GX - 30}
        y={GY - 16}
        latime={LATIME_MATRICE + 60}
        inaltime={N * CH + 32}
        opacitate={intra(T, 0.6, 0.7)}
      />
      <Paranteze
        x={XCOL - 30}
        y={GY - 16}
        latime={CW + 60}
        inaltime={N * CH + 32}
        opacitate={intra(T, 1.5, 0.7)}
      />
      <Paranteze
        x={DCOL - 30}
        y={GY - 16}
        latime={CW + 60}
        inaltime={N * CH + 32}
        opacitate={intra(T, 1.7, 0.7)}
      />
      <Mono
        x={DCOL - 62}
        y={GY + (N * CH) / 2}
        text="="
        marime={46 * Math.min(st, 1.3)}
        culoare="var(--text-slab)"
        ancora="middle"
        opacitate={intra(T, 1.7, 0.7)}
      />

      {/* ═══ matricea ═══ */}
      {Array.from({ length: N }, (_, linie) =>
        Array.from({ length: N }, (_, coloana) => {
          const apare = intra(T, 0.7 + (linie * N + coloana) * 0.035, 0.55);
          const esteA = coloana === linie - 1;
          const esteB = coloana === linie;
          const esteC = coloana === linie + 1;

          if (!esteA && !esteB && !esteC) {
            return (
              <Mono
                key={`m${linie}-${coloana}`}
                x={GX + coloana * CW + CW / 2}
                y={GY + linie * CH + CH / 2}
                text="0"
                marime={30 * Math.min(st, 1.3)}
                culoare="var(--text-slab)"
                ancora="middle"
                greutate={400}
                opacitate={apare * 0.4}
              />
            );
          }

          // `aᵢ` devine 0 la pasul lui; `bᵢ` se recalculează.
          const pasulCelulei = esteA
            ? PASI_ELIMINARE[linie - 1]
            : esteB && linie > 0
              ? PASI_ELIMINARE[linie - 1]
              : undefined;
          const laA = pasulCelulei ? laPas(pasulCelulei.i) + LA_A : 0;
          const laB = pasulCelulei ? laPas(pasulCelulei.i) + LA_B : 0;
          const cand = esteA ? laA : laB;

          const valoare = esteA ? A[linie]! : esteB ? B[linie]! : C[linie]!;
          const dupa = esteA ? 0 : esteB && linie > 0 ? B_DUPA_ELIMINARE[linie]! : undefined;

          const activ = activareMatrice(linie, coloana);
          const estePivot =
            !!pas && esteB && linie === pas.i - 1 && banda(T, t0 + 0.1, t0 + LA_B + 0.3) > 0.5;

          return (
            <Celula
              key={`m${linie}-${coloana}`}
              coloana={GX + coloana * CW}
              linie={GY + linie * CH}
              eticheta={`${esteA ? "a" : esteB ? "b" : "c"}${indice(linie + 1)}`}
              vechi={num(valoare)}
              nou={dupa === undefined ? undefined : num(dupa)}
              trecere={dupa === undefined ? 0 : schimba(T, cand)}
              laSchimbare={cand}
              activ={activ}
              pivot={estePivot}
              opacitate={apare}
              st={st}
              T={T}
            />
          );
        }),
      )}

      {/* ═══ coloana necunoscutelor ═══ */}
      {Array.from({ length: N }, (_, linie) => {
        const apare = intra(T, 1.5 + linie * 0.06, 0.55);
        const k = N - 1 - linie;
        const cand = laSubstitutie(k);
        const trecere = T >= cue.Substitutie ? schimba(T, cand) : 0;
        const activ =
          T >= cue.Substitutie && T < cue.Final ? banda(T, cand - 0.2, cand + PAS_SUBSTITUTIE) : 0;

        return (
          <Celula
            key={`x${linie}`}
            coloana={XCOL}
            linie={GY + linie * CH}
            vechi={`x${indice(linie + 1)}`}
            nou={num(SOLUTIA[linie]!)}
            trecere={trecere}
            laSchimbare={cand}
            activ={activ}
            opacitate={apare}
            st={st}
            T={T}
          />
        );
      })}

      {/* ═══ coloana termenilor liberi ═══ */}
      {Array.from({ length: N }, (_, linie) => {
        const apare = intra(T, 1.7 + linie * 0.06, 0.55);
        const cand = linie > 0 ? laPas(linie) + LA_D : 0;
        return (
          <Celula
            key={`d${linie}`}
            coloana={DCOL}
            linie={GY + linie * CH}
            eticheta={`d${indice(linie + 1)}`}
            vechi={num(D[linie]!)}
            nou={linie > 0 ? num(D_DUPA_ELIMINARE[linie]!) : undefined}
            trecere={linie > 0 ? schimba(T, cand) : 0}
            laSchimbare={cand}
            activ={activareD(linie)}
            opacitate={apare}
            st={st}
            T={T}
          />
        );
      })}

      {/* ═══ panoul 1 · sistemul ═══ */}
      <g opacity={oSistem}>
        <Proza
          x={PX}
          y={PY}
          text="TREI DIAGONALE"
          marime={26 * Math.min(st, 1.4)}
          culoare={culoareEticheta(ROL_ACTIUNE)}
          greutate={700}
          litere="0.04em"
          opacitate={intra(T, 1.9, 0.6)}
        />
        <Mono
          x={PX}
          y={PY + 76}
          text="aᵢ·xᵢ₋₁ + bᵢ·xᵢ + cᵢ·xᵢ₊₁ = dᵢ"
          marime={36 * Math.min(st, 1.25)}
          culoare="var(--text)"
          opacitate={intra(T, 2.3, 0.6)}
        />
        {/* Proza se scrie pe rânduri scrise de mână: `<text>` din SVG nu se
            rupe singur, iar o propoziție lungă ar ieși din cadru pe dreapta. */}
        {[
          "Restul coeficienților sunt 0, deci sistemul",
          "încape în patru vectori: a, b, c și d.",
        ].map((rand, i) => (
          <Proza
            key={i}
            x={PX}
            y={PY + 156 + i * 44}
            text={rand}
            marime={30 * Math.min(st, 1.25)}
            culoare="var(--text-slab)"
            greutate={500}
            opacitate={intra(T, 3.4 + i * 0.2, 0.6)}
          />
        ))}
      </g>

      {/* ═══ panoul 2 · eliminarea înainte ═══ */}
      {pas && (
        <g opacity={oEliminare}>
          <Proza
            x={PX}
            y={PY}
            text="PASUL 1 · ELIMINARE ÎNAINTE"
            marime={26 * Math.min(st, 1.4)}
            culoare={culoareEticheta(ROL_ACTIUNE)}
            greutate={700}
            litere="0.04em"
            opacitate={intra(T, cue.Eliminare + 0.1, 0.6)}
          />
          <RandFormula
            y={PY + 92}
            simbolic="µ = aᵢ / bᵢ₋₁"
            numeric={`= ${parantezat(pas.a)} / ${num(pas.bAnterior)} = ${num(pas.mu)}`}
            aprins={banda(T, t0 + LA_MU - 0.3, t0 + LA_B - 0.1)}
            opacitate={intra(T, cue.Eliminare + 0.4, 0.6)}
            st={st}
          />
          <RandFormula
            y={PY + 236}
            simbolic="bᵢ ← bᵢ − µ·cᵢ₋₁"
            numeric={`= ${num(pas.bInainte)} − ${parantezat(pas.mu)}·${parantezat(
              pas.cAnterior,
            )} = ${num(pas.bDupa)}`}
            aprins={banda(T, t0 + LA_B - 0.3, t0 + LA_D - 0.2)}
            opacitate={intra(T, cue.Eliminare + 0.6, 0.6)}
            st={st}
          />
          <RandFormula
            y={PY + 380}
            simbolic="dᵢ ← dᵢ − µ·dᵢ₋₁"
            numeric={`= ${num(pas.dInainte)} − ${parantezat(pas.mu)}·${num(pas.dAnterior)} = ${num(
              pas.dDupa,
            )}`}
            aprins={banda(T, t0 + LA_D - 0.3, t0 + LA_A + 0.2)}
            opacitate={intra(T, cue.Eliminare + 0.8, 0.6)}
            st={st}
          />
          <Proza
            x={PX}
            y={PY + 500}
            text="cᵢ nu se atinge, iar aᵢ devine 0."
            marime={30 * Math.min(st, 1.25)}
            culoare={culoareEticheta(ROL_REZULTAT)}
            greutate={600}
            opacitate={banda(T, t0 + LA_A, t0 + PAS_ELIMINARE, 0.4)}
          />
        </g>
      )}

      {/* ═══ panoul 3 · substituția înapoi ═══ */}
      <g opacity={oSubstitutie}>
        <Proza
          x={PX}
          y={PY}
          text="PASUL 2 · SUBSTITUȚIE ÎNAPOI"
          marime={26 * Math.min(st, 1.4)}
          culoare={culoareEticheta(ROL_ACTIUNE)}
          greutate={700}
          litere="0.04em"
          opacitate={intra(T, cue.Substitutie + 0.1, 0.6)}
        />
        <RandFormula
          y={PY + 92}
          simbolic="xₙ = dₙ / bₙ"
          numeric={
            pasX && pasX.c === undefined
              ? `= ${num(pasX.d)} / ${num(pasX.b)} = ${num(pasX.x)}`
              : undefined
          }
          aprins={kSubstitutie === 0 ? 1 : 0.12}
          opacitate={intra(T, cue.Substitutie + 0.3, 0.6)}
          st={st}
        />
        <RandFormula
          y={PY + 236}
          simbolic="xᵢ = (dᵢ − cᵢ·xᵢ₊₁) / bᵢ"
          numeric={
            pasX && pasX.c !== undefined
              ? `= (${num(pasX.d)} − ${parantezat(pasX.c)}·${num(pasX.xUrmator ?? 0)}) / ${num(
                  pasX.b,
                )} = ${num(pasX.x)}`
              : undefined
          }
          aprins={kSubstitutie >= 1 ? 1 : 0.12}
          opacitate={intra(T, cue.Substitutie + 0.5, 0.6)}
          st={st}
        />
        {["A rămas un sistem bidiagonal: fiecare linie", "aduce o singură necunoscută nouă."].map(
          (rand, i) => (
            <Proza
              key={i}
              x={PX}
              y={PY + 380 + i * 44}
              text={rand}
              marime={30 * Math.min(st, 1.25)}
              culoare="var(--text-slab)"
              greutate={500}
              opacitate={intra(T, cue.Substitutie + 1.2 + i * 0.2, 0.6)}
            />
          ),
        )}
      </g>

      {/* ═══ panoul 4 · recapitularea ═══ */}
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
        <g
          opacity={intra(T, cue.Final + 2.4, 0.6)}
          transform={`translate(0, ${urca(T, cue.Final + 2.4, 20, 0.6)})`}
        >
          <rect
            x={PX - 18}
            y={PY + 370}
            width={700}
            height={92}
            rx={14}
            fill={`color-mix(in oklab, ${culoareRol(ROL_REZULTAT)} 12%, transparent)`}
            stroke={`color-mix(in oklab, ${culoareRol(ROL_REZULTAT)} 40%, transparent)`}
            strokeWidth={2}
          />
          <Mono
            x={PX + 8}
            y={PY + 416}
            text={`x = ( ${SOLUTIA.map(num).join(" , ")} )`}
            marime={38 * Math.min(st, 1.2)}
            culoare={culoareEticheta(ROL_REZULTAT)}
          />
        </g>
        <Mono
          x={PX}
          y={PY + 520}
          text="|bᵢ| ≥ |aᵢ| + |cᵢ|"
          marime={34 * Math.min(st, 1.2)}
          culoare="var(--text)"
          opacitate={intra(T, cue.Final + 3.6, 0.6)}
        />
      </g>
    </svg>
  );
}

/* ───────────────────────── piesa întreagă ───────────────────────── */

const SUBTITRARI = [
  { la: 0.4, text: "Un sistem tridiagonal: nenule doar pe trei diagonale." },
  { la: 3.2, text: "Nu ținem toată matricea, ci patru vectori: a, b, c și d." },
  { la: CUE.Eliminare + 0.3, text: "Curățăm linia i cu ajutorul liniei de deasupra." },
  { la: CUE.Eliminare + 2.2, text: "µ spune exact cât trebuie scăzut ca aᵢ să devină 0." },
  { la: CUE.Eliminare + PAS_ELIMINARE, text: "Se schimbă doar bᵢ și dᵢ — cᵢ rămâne neatins." },
  {
    la: CUE.Eliminare + 2 * PAS_ELIMINARE,
    text: "Același pas, mai jos: împărțitorul e bᵢ₋₁ deja recalculat.",
  },
  { la: CUE.Substitutie + 0.3, text: "A rămas un sistem bidiagonal: pornim de la xₙ = dₙ / bₙ." },
  { la: CUE.Substitutie + 2.6, text: "Urcăm rând cu rând, fiecare xᵢ din xᵢ₊₁." },
  { la: CUE.Final + 0.3, text: "Două treceri prin vectori, și sistemul e rezolvat." },
  { la: CUE.Final + 3.4, text: "O(n) în loc de O(n³) — sigur dacă matricea e diagonal dominantă." },
] as const;

/**
 * Clipul paginii 4: cum se rezolvă un sistem tridiagonal în două treceri prin
 * patru vectori.
 *
 * **Clip scris în cod** — ca la paginile 1, 3, 5, 7, 9, 10 și 11, și din același
 * motiv: animația a venit gata făcută ca animație web (`Algoritmul Thomas.html`)
 * și s-a portat ca atare. Ca orice clip, **nu** primește parametrii
 * utilizatorului: sistemul desenat e fix.
 *
 * Față de originalul pe fundal alb, culorile vin din `viz-roles.ts` (deci clipul
 * se vede corect în ambele teme), iar cifrele din
 * `src/algorithms/algoritmul-thomas/`.
 *
 * **Sistemul desenat s-a schimbat față de original**, ca panoul să poată arăta
 * operațiile cu cifre: pe exemplul de dinainte `µ` ieșea `−0,2679`, iar
 * `dᵢ − µ·dᵢ₋₁` scris cu operanzi rotunjiți nu mai dădea rezultatul rotunjit.
 * Aici toți `µ` ies `−0,25` și toate valorile rămân întregi (vezi
 * `src/algorithms/algoritmul-thomas/exemplu.ts`).
 */
export function AnimatiaThomas() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație: algoritmul Thomas pe un sistem tridiagonal cu patru ecuații. Matricea are " +
        "elemente nenule doar pe trei diagonale, deci sistemul se ține în patru vectori: a, b, c " +
        "și d. La eliminarea înainte, fiecare linie i se curăță cu ajutorul liniei de deasupra: " +
        "µ = aᵢ / bᵢ₋₁ iese −0,25 la toți pașii, bᵢ devine bᵢ − µ·cᵢ₋₁, dᵢ devine dᵢ − µ·dᵢ₋₁, " +
        "iar aᵢ ajunge 0; cᵢ rămâne neatins. După cele trei operații, diagonala principală este " +
        "(8, 8, 8, 8), iar termenii liberi (4, 8, 12, 40). Substituția înapoi pornește de la " +
        "x₄ = 40 / 8 = 5 și urcă rând cu rând, dând x₃ = 4, x₂ = 3 și x₁ = 2. La final: două " +
        "treceri prin vectori, O(n) operații, și condiția de dominanță diagonală |bᵢ| ≥ |aᵢ| + |cᵢ|."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
