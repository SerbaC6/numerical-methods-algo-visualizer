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
import { COSTURI } from "@/algorithms/algoritmul-thomas/cost";
import { animeaza, clamp, EASING, repere, type Scena } from "@/lib/compozitie";
import { marimeCareIncape } from "@/lib/tipografie-clip";
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
      "Eliminarea înainte, o linie pe pas: linia i se transformă dintr-o dată, cu aᵢ, bᵢ și dᵢ deodată.",
  },
  {
    nume: "Substitutie",
    durata: 10,
    descriere: "Substituția înapoi: x₄ din d₄/b₄, apoi fiecare xᵢ urcând rând cu rând.",
  },
  {
    nume: "Cost",
    durata: 9,
    descriere:
      "Bare de cost pentru n = 20, 100 și 1000: eliminarea gaussiană față de Thomas, în operații.",
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

/**
 * Momentele din interiorul unui pas de eliminare, față de începutul lui.
 *
 * Un pas are **două** momente, nu patru: întâi se arată blocul pe care se
 * lucrează (linia i, linia de deasupra, pivotul), apoi linia se transformă
 * dintr-o dată. Defilarea de dinainte — µ, apoi bᵢ, apoi dᵢ, apoi aᵢ — punea
 * ochiul să urmărească fiecare celulă în parte, iar forma algoritmului („o
 * linie, o trecere") se pierdea între patru pulsații. Timpul câștigat rămâne
 * în pas, ca respirație între linii.
 */
const LA_PREGATIRE = 0.9;
const LA_TRANSFORMARE = 2.6;

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

/** `334333000` → `334.333.000` — același separator de mii ca la clipul paginii 1. */
const cuMii = (v: number) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

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

/**
 * În scena de cost, `interval` poartă **costul care explodează** — bara `O(n³)`.
 * E aceeași rescriere locală de etichetă pe care o face și clipul paginii 1, și
 * e sigură aici din motivul cerut de paletă: cele două înțelesuri nu se ating
 * niciodată în timp. Linia de lucru trăiește doar în scena „Eliminare", iar
 * scena „Cost" începe cu matricea stinsă, deci nicio pânză nu are portocaliu cu
 * două sensuri deodată.
 */
const ROL_SCUMP = "interval" as const;

/* ───────────────────────── cadrul de desen ───────────────────────── */

const W = 1920;
const H = 1080;

/** Celula matricei. */
const CW = 104;
const CH = 92;

/**
 * Colțul din stânga-sus al matricei. `GY` lasă deasupra loc antetului scenei —
 * titlul mare plus nota — și rândului de nume („A", „x", „d"), la fel ca la
 * clipurile paginilor 1 și 2.
 */
const GX = 150;
const GY = 372;

const LATIME_MATRICE = N * CW;
/** Coloana necunoscutelor și coloana termenilor liberi, cu semnul „=" între ele. */
const XCOL = GX + LATIME_MATRICE + 92;
const DCOL = XCOL + CW + 124;

/** Panoul din dreapta: formulele scenei, aliniate sub antet. */
const PX = 1060;
const PY = 322;
/** Lățimea coloanei din dreapta — aceeași pentru formule și pentru cartonașe. */
const PW = 716;

/**
 * Scena de cost folosește pânza întreagă, nu coloana din dreapta: trei rânduri
 * de bare, fiecare cu jgheabul lui. `COST_JGHEAB` e lățimea barei scumpe, adică
 * unitatea față de care se măsoară cea ieftină.
 */
const COST_LEGENDA = 290;
const COST_PRIM_RAND = 380;
const COST_PAS_RAND = 200;
const COST_BARE = 430;
const COST_JGHEAB = 780;

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
 * Antetul scenei: titlul mare sus-stânga și nota de sub el.
 *
 * Aceeași piesă ca la clipurile paginilor 1 și 2, și din același motiv: numele
 * momentului e primul lucru care se citește, deci stă unde începe citirea, nu
 * într-un colț. Titlul **nu se numerotează** — clipul curge într-o direcție.
 */
function Antet({
  titlu,
  nota,
  opacitate,
  st,
}: {
  titlu: string;
  nota?: string;
  opacitate: number;
  st: number;
}) {
  return (
    <g opacity={opacitate} transform={`translate(0, ${(1 - opacitate) * 18})`}>
      <Proza
        x={120}
        y={140}
        text={titlu}
        marime={60 * Math.min(st, 1.35)}
        greutate={800}
        culoare="var(--text)"
      />
      {nota && (
        <Proza
          x={120}
          y={206}
          text={nota}
          marime={29 * Math.min(st, 1.5)}
          greutate={400}
          culoare="var(--text-slab)"
        />
      )}
    </g>
  );
}

/**
 * Cartonașul cu spină colorată: simbolul sus, în mono, afirmația dedesubt.
 *
 * Înlocuiește proza spartă pe rânduri scrise de mână: acolo lățimea se ghicea,
 * aici corpul literei coboară singur cât să încapă (`marimeCareIncape`), fără
 * număr scris de mână.
 */
function Cartonas({
  x,
  y,
  latime = PW,
  inaltime = 124,
  rol,
  simbol,
  text,
  opacitate,
  st,
}: {
  x: number;
  y: number;
  latime?: number;
  inaltime?: number;
  rol?: RolViz;
  simbol: string;
  text: string;
  opacitate: number;
  st: number;
}) {
  const margine = 30;
  const corp = marimeCareIncape(text, latime - 2 * margine) * Math.min(st, 1.35);
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
      <Mono
        x={margine}
        y={inaltime / 2 - 24}
        text={simbol}
        marime={34 * Math.min(st, 1.3)}
        culoare={rol ? culoareEticheta(rol) : "var(--text)"}
      />
      <Proza x={margine} y={inaltime / 2 + 30} text={text} marime={corp} greutate={600} />
    </g>
  );
}

/**
 * O bară de cost, cu urma ei în spate.
 *
 * Urma — dreptunghiul palid pe toată lățimea — e ce face bara lui Thomas
 * lizibilă: la `n = 1000` ea ajunge sub un pixel, iar fără un jgheab în care să
 * stea n-ar exista nimic de comparat. Bara plină nu coboară totuși sub
 * `LATIME_MINIMA`: o bară de zero pixeli s-ar citi ca „lipsește", nu ca „e
 * neglijabilă".
 */
const LATIME_MINIMA = 6;

function BaraCost({
  x,
  y,
  latime,
  jgheab,
  inaltime,
  rol,
}: {
  x: number;
  y: number;
  latime: number;
  jgheab: number;
  inaltime: number;
  rol: RolViz;
}) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width={jgheab}
        height={inaltime}
        rx={inaltime / 2}
        fill={`color-mix(in oklab, ${culoareRol(rol)} 16%, transparent)`}
      />
      <rect
        x={x}
        y={y}
        width={Math.max(LATIME_MINIMA, latime)}
        height={inaltime}
        rx={inaltime / 2}
        fill={culoareRol(rol)}
      />
    </>
  );
}

/** Numele unui bloc de coloane, deasupra parantezelor: „A", „x", „d". */
function NumeBloc({
  x,
  text,
  opacitate,
  st,
}: {
  x: number;
  text: string;
  opacitate: number;
  st: number;
}) {
  return (
    <Proza
      x={x}
      y={GY - 74}
      text={text}
      marime={36 * Math.min(st, 1.4)}
      ancora="middle"
      greutate={800}
      opacitate={opacitate}
    />
  );
}

/**
 * O celulă din desen: rama și valoarea din mijloc.
 *
 * **Fără eticheta din colț.** „a₂", „b₂", „c₂", „d₂" scrise în fiecare celulă
 * dublau o informație care se citește deja din desen — diagonala pe care stă
 * celula și numele blocului de deasupra —, iar pe un ecran de telefon cele două
 * texte suprapuse în aceeași celulă se citeau ca un ghem. Numele literelor
 * rămân acolo unde chiar spun ceva: în formulele din panoul din dreapta.
 *
 * Valoarea se poate schimba în timpul clipului, deci primește două texte și
 * greutatea trecerii: cel vechi urcă și se stinge, cel nou intră de jos. E
 * singura piesă din clip care ține minte că o cifră „tocmai s-a schimbat".
 */
function Celula({
  coloana,
  linie,
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
  // Cifra a crescut de la 34 odată cu scoaterea etichetei din colț: acum are
  // celula pentru ea singură, iar cel mai lung text din desen („x₁", „40") are
  // trei semne, deci încape lejer în cei 94 de unități de lățime interioară.
  const corp = 38 * Math.min(st, 1.35);

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
      {/* Cartonaș, ca peste tot în clip: suprafață și ramă. Spina din stânga se
          aprinde doar cât timp rândul e la rând, deci ochiul are unde să cadă
          fără ca celelalte rânduri să dispară. */}
      <rect
        x={PX - 22}
        y={y - 40}
        width={PW}
        height={numeric ? 116 : 74}
        rx={14}
        fill="var(--suprafata)"
        stroke="var(--bordura)"
        strokeWidth={2}
      />
      <rect
        x={PX - 22}
        y={y - 40}
        width={PW}
        height={numeric ? 116 : 74}
        rx={14}
        fill={`color-mix(in oklab, ${culoareRol(ROL_ACTIUNE)} ${Math.round(14 * aprins)}%, transparent)`}
      />
      <rect
        x={PX - 22}
        y={y - 40}
        width={6}
        height={numeric ? 116 : 74}
        rx={3}
        fill={culoareRol(ROL_ACTIUNE)}
        opacity={0.25 + 0.75 * aprins}
      />
      <Mono
        x={PX + 8}
        y={y}
        text={simbolic}
        marime={34 * Math.min(st, 1.25)}
        culoare={aprins > 0.5 ? culoareEticheta(ROL_ACTIUNE) : "var(--text)"}
        opacitate={0.55 + 0.45 * aprins}
      />
      {numeric && (
        <Mono
          x={PX + 22}
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

  /**
   * Cât de tare participă o celulă la pasul de acum.
   *
   * Nu se mai aprinde câte o celulă pe rând, ci **blocul întreg** care intră în
   * operație: pătratul 2×2 din colțurile `(i−1, i−1)` … `(i, i)`, plus cele două
   * celule de `d`. `cᵢ` nu intră niciodată — rămâne neatins, iar dacă s-ar
   * aprinde ar contrazice exact ce spune subtitrarea.
   */
  const activBloc =
    pasCurent > 0 ? banda(T, t0 + LA_PREGATIRE - 0.4, t0 + LA_TRANSFORMARE + 1.4) : 0;

  /** Cât e aprins panoul de formule: de la transformare până la capătul pasului. */
  const aprinsBloc =
    pasCurent > 0 ? banda(T, t0 + LA_TRANSFORMARE - 0.5, t0 + PAS_ELIMINARE - 0.3, 0.35) : 0;

  const activareMatrice = (linie: number, coloana: number) => {
    if (!pas) return 0;
    const i = pas.i;
    const inBloc = (linie === i || linie === i - 1) && (coloana === i - 1 || coloana === i);
    return inBloc ? activBloc : 0;
  };
  const activareD = (linie: number) => {
    if (!pas) return 0;
    return linie === pas.i - 1 || linie === pas.i ? activBloc : 0;
  };

  /* ── panourile, câte unul pe scenă ── */
  const oSistem = felie(T, 0, cue.Eliminare);
  const oEliminare = felie(T, cue.Eliminare, cue.Substitutie);
  const oSubstitutie = felie(T, cue.Substitutie, cue.Cost);
  const oCost = felie(T, cue.Cost, cue.Final);
  const oFinal = felie(T, cue.Final, Number.POSITIVE_INFINITY);

  /**
   * Scena de cost cere pânza întreagă — barele trebuie să aibă unde să se
   * întindă —, deci matricea și cele două coloane se sting pe durata ei și
   * revin la recapitulare, cu soluția deja în ele.
   */
  const opMatrice = 1 - banda(T, cue.Cost - 0.3, cue.Final, 0.5);

  /* ── ce necunoscută se află acum ── */
  const kSubstitutie =
    T >= cue.Substitutie && T < cue.Cost
      ? clamp(Math.floor((T - cue.Substitutie - 0.4) / PAS_SUBSTITUTIE), 0, N - 1)
      : T >= cue.Cost
        ? N - 1
        : -1;
  const pasX = kSubstitutie >= 0 ? PASI_SUBSTITUTIE[kSubstitutie] : undefined;

  /**
   * Recapitularea finală, ca trei cartonașe. Numerele de dinainte („1", „2",
   * „3") au căzut: pașii se citesc oricum în ordine, iar cifra din cerc nu
   * spunea nimic despre ce urmează.
   */
  const PASI_FINALI = [
    { simbol: "µ, bᵢ, dᵢ", text: "O singură trecere înainte" },
    { simbol: "xᵢ ← xᵢ₊₁", text: "O singură trecere înapoi" },
    { simbol: "O(n)", text: "Doi vectori atinși, nu o matrice" },
  ] as const;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      {/* ═══ antetul scenei ═══ */}
      {/* Primul antet **nu** are intrare: clipul stă oprit pe cadrul zero până
          când cineva apasă redarea, iar o pânză goală n-ar spune nimic. */}
      <Antet
        titlu="Trei diagonale"
        nota="Restul coeficienților sunt 0."
        opacitate={oSistem}
        st={st}
      />
      <Antet
        titlu="Eliminare înainte"
        nota="Linia i se curăță cu linia de deasupra."
        opacitate={oEliminare * intra(T, cue.Eliminare + 0.1, 0.6)}
        st={st}
      />
      <Antet
        titlu="Substituție înapoi"
        nota="A rămas un sistem bidiagonal."
        opacitate={oSubstitutie * intra(T, cue.Substitutie + 0.1, 0.6)}
        st={st}
      />
      <Antet
        titlu="De la O(n³) la O(n)"
        nota="Câte înmulțiri și împărțiri cere rezolvarea aceluiași sistem."
        opacitate={oCost * intra(T, cue.Cost + 0.1, 0.6)}
        st={st}
      />
      <Antet
        titlu="Două treceri, atât"
        opacitate={oFinal * intra(T, cue.Final + 0.1, 0.6)}
        st={st}
      />

      <g opacity={opMatrice}>
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

        {/* ═══ numele blocurilor ═══ */}
        <NumeBloc x={GX + LATIME_MATRICE / 2} text="A" opacitate={intra(T, 0.6, 0.7)} st={st} />
        <NumeBloc x={XCOL + CW / 2} text="x" opacitate={intra(T, 1.5, 0.7)} st={st} />
        <NumeBloc x={DCOL + CW / 2} text="d" opacitate={intra(T, 1.7, 0.7)} st={st} />

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

            // `aᵢ` devine 0 și `bᵢ` se recalculează în **același** moment: linia se
            // transformă dintr-o dată, nu celulă după celulă.
            const pasulCelulei =
              esteA || (esteB && linie > 0) ? PASI_ELIMINARE[linie - 1] : undefined;
            const cand = pasulCelulei ? laPas(pasulCelulei.i) + LA_TRANSFORMARE : 0;

            const valoare = esteA ? A[linie]! : esteB ? B[linie]! : C[linie]!;
            const dupa = esteA ? 0 : esteB && linie > 0 ? B_DUPA_ELIMINARE[linie]! : undefined;

            const activ = activareMatrice(linie, coloana);
            const estePivot =
              !!pas &&
              esteB &&
              linie === pas.i - 1 &&
              banda(T, t0 + LA_PREGATIRE - 0.4, t0 + LA_TRANSFORMARE + 1.4) > 0.5;

            return (
              <Celula
                key={`m${linie}-${coloana}`}
                coloana={GX + coloana * CW}
                linie={GY + linie * CH}
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
            T >= cue.Substitutie && T < cue.Cost ? banda(T, cand - 0.2, cand + PAS_SUBSTITUTIE) : 0;

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
          const cand = linie > 0 ? laPas(linie) + LA_TRANSFORMARE : 0;
          return (
            <Celula
              key={`d${linie}`}
              coloana={DCOL}
              linie={GY + linie * CH}
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
      </g>

      {/* ═══ panoul 1 · sistemul ═══ */}
      <g opacity={oSistem}>
        <Cartonas
          x={PX - 22}
          y={PY - 40}
          rol={ROL_ACTIUNE}
          simbol="aᵢ·xᵢ₋₁ + bᵢ·xᵢ + cᵢ·xᵢ₊₁ = dᵢ"
          text="O linie atinge doar trei necunoscute"
          opacitate={intra(T, 2.1, 0.6)}
          st={st}
        />
        <Cartonas
          x={PX - 22}
          y={PY + 116}
          rol={ROL_REZULTAT}
          simbol="a, b, c, d"
          text="Sistemul încape în patru vectori"
          opacitate={intra(T, 3.4, 0.6)}
          st={st}
        />
      </g>

      {/* ═══ panoul 2 · eliminarea înainte ═══ */}
      {pas && (
        <g opacity={oEliminare}>
          {/* Cele trei formule se aprind **deodată**, la momentul transformării:
              ele sunt o singură operație pe linie, nu trei pași separați. Cifrele
              pasului stau sub fiecare formă simbolică, deci blocul se poate citi
              și în ordine, de sus în jos, de cine vrea detaliul. */}
          <RandFormula
            y={PY - 40}
            simbolic="µ = aᵢ / bᵢ₋₁"
            numeric={`= ${parantezat(pas.a)} / ${num(pas.bAnterior)} = ${num(pas.mu)}`}
            aprins={aprinsBloc}
            opacitate={intra(T, cue.Eliminare + 0.4, 0.6)}
            st={st}
          />
          <RandFormula
            y={PY + 100}
            simbolic="bᵢ ← bᵢ − µ·cᵢ₋₁"
            numeric={`= ${num(pas.bInainte)} − ${parantezat(pas.mu)}·${parantezat(
              pas.cAnterior,
            )} = ${num(pas.bDupa)}`}
            aprins={aprinsBloc}
            opacitate={intra(T, cue.Eliminare + 0.6, 0.6)}
            st={st}
          />
          <RandFormula
            y={PY + 240}
            simbolic="dᵢ ← dᵢ − µ·dᵢ₋₁"
            numeric={`= ${num(pas.dInainte)} − ${parantezat(pas.mu)}·${num(pas.dAnterior)} = ${num(
              pas.dDupa,
            )}`}
            aprins={aprinsBloc}
            opacitate={intra(T, cue.Eliminare + 0.8, 0.6)}
            st={st}
          />
          <Cartonas
            x={PX - 22}
            y={PY + 380}
            rol={ROL_REZULTAT}
            simbol="aᵢ = 0"
            text="Linia e gata, trecem mai jos"
            opacitate={banda(T, t0 + LA_TRANSFORMARE + 0.5, t0 + PAS_ELIMINARE, 0.4)}
            st={st}
          />
        </g>
      )}

      {/* ═══ panoul 3 · substituția înapoi ═══ */}
      <g opacity={oSubstitutie}>
        <RandFormula
          y={PY - 40}
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
          y={PY + 100}
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
        <Cartonas
          x={PX - 22}
          y={PY + 240}
          rol={ROL_REZULTAT}
          simbol="xᵢ ← xᵢ₊₁"
          text="Fiecare linie aduce o necunoscută nouă"
          opacitate={intra(T, cue.Substitutie + 1.2, 0.6)}
          st={st}
        />
      </g>

      {/* ═══ panoul 4 · cât costă ═══ */}
      <g opacity={oCost}>
        {/* Legenda, o singură dată sus, ca rândurile de dedesubt să nu repete de
            trei ori cine e cine. Numără **înmulțirile și împărțirile** — aceeași
            măsură la amândouă metode, altfel comparația n-ar spune nimic. */}
        {(
          [
            { rol: ROL_SCUMP, text: "Eliminare gaussiană · O(n³)", x: 150 },
            { rol: ROL_REZULTAT, text: "Thomas · O(n)", x: 780 },
          ] as const
        ).map((cheie) => (
          <g key={cheie.text} opacity={intra(T, cue.Cost + 0.3, 0.6)}>
            <rect
              x={cheie.x}
              y={COST_LEGENDA - 11}
              width={40}
              height={22}
              rx={11}
              fill={culoareRol(cheie.rol)}
            />
            <Proza
              x={cheie.x + 58}
              y={COST_LEGENDA}
              text={cheie.text}
              marime={30 * Math.min(st, 1.35)}
              culoare={culoareEticheta(cheie.rol)}
              greutate={700}
            />
          </g>
        ))}
        <Proza
          x={1770}
          y={COST_LEGENDA}
          text="Înmulțiri și împărțiri"
          marime={26 * Math.min(st, 1.4)}
          culoare="var(--text-slab)"
          ancora="end"
          greutate={400}
          opacitate={intra(T, cue.Cost + 0.3, 0.6)}
        />

        {COSTURI.map((cost, i) => {
          const la = cue.Cost + 1 + i * 1.5;
          const o = intra(T, la, 0.5);
          /** Barele cresc; raportul apare abia după ce s-au oprit. */
          const creste = intra(T, la + 0.2, 1.1);
          const y = COST_PRIM_RAND + i * COST_PAS_RAND;
          /**
           * Bara scumpă umple jgheabul, iar cea ieftină îl umple în proporția
           * reală — `1 / raport`. La `n = 1000` iese sub un pixel, deci se vede
           * doar capătul rotunjit: exact ce înseamnă „de 66.920 de ori".
           */
          const latimeThomas = (COST_JGHEAB * cost.thomas) / cost.gauss;

          return (
            <g key={cost.n} opacity={o} transform={`translate(${(1 - o) * -30}, 0)`}>
              <Mono
                x={150}
                y={y + 34}
                text={`n = ${cost.n}`}
                marime={40 * Math.min(st, 1.3)}
                culoare="var(--text)"
              />
              <BaraCost
                x={COST_BARE}
                y={y}
                latime={creste * COST_JGHEAB}
                jgheab={COST_JGHEAB}
                inaltime={30}
                rol={ROL_SCUMP}
              />
              <Mono
                x={COST_BARE + COST_JGHEAB + 22}
                y={y + 15}
                text={cuMii(creste * cost.gauss)}
                marime={30 * Math.min(st, 1.25)}
                culoare={culoareEticheta(ROL_SCUMP)}
              />
              <BaraCost
                x={COST_BARE}
                y={y + 44}
                latime={creste * latimeThomas}
                jgheab={COST_JGHEAB}
                inaltime={30}
                rol={ROL_REZULTAT}
              />
              <Mono
                x={COST_BARE + COST_JGHEAB + 22}
                y={y + 59}
                text={cuMii(creste * cost.thomas)}
                marime={30 * Math.min(st, 1.25)}
                culoare={culoareEticheta(ROL_REZULTAT)}
              />
              <Proza
                x={COST_BARE}
                y={y + 104}
                text={`De ${cuMii(cost.raport)} de ori mai puține`}
                marime={26 * Math.min(st, 1.35)}
                culoare="var(--text-slab)"
                greutate={600}
                opacitate={intra(T, la + 1.1, 0.5)}
              />
            </g>
          );
        })}
      </g>

      {/* ═══ panoul 5 · recapitularea ═══ */}
      <g opacity={oFinal}>
        {PASI_FINALI.map((pasFinal, i) => (
          <g
            key={pasFinal.simbol}
            transform={`translate(0, ${urca(T, cue.Final + 0.4 + i * 0.5, 18, 0.6)})`}
          >
            <Cartonas
              x={PX - 22}
              y={PY - 60 + i * 122}
              inaltime={108}
              rol={ROL_ACTIUNE}
              simbol={pasFinal.simbol}
              text={pasFinal.text}
              opacitate={intra(T, cue.Final + 0.4 + i * 0.5, 0.6)}
              st={st}
            />
          </g>
        ))}
        <g
          opacity={intra(T, cue.Final + 2.4, 0.6)}
          transform={`translate(0, ${urca(T, cue.Final + 2.4, 20, 0.6)})`}
        >
          <rect
            x={PX - 22}
            y={PY + 320}
            width={PW}
            height={92}
            rx={14}
            fill={`color-mix(in oklab, ${culoareRol(ROL_REZULTAT)} 12%, transparent)`}
            stroke={`color-mix(in oklab, ${culoareRol(ROL_REZULTAT)} 40%, transparent)`}
            strokeWidth={2}
          />
          <Mono
            x={PX + 8}
            y={PY + 366}
            text={`x = ( ${SOLUTIA.map(num).join(" , ")} )`}
            marime={38 * Math.min(st, 1.2)}
            culoare={culoareEticheta(ROL_REZULTAT)}
          />
        </g>
        <Cartonas
          x={PX - 22}
          y={PY + 440}
          inaltime={108}
          simbol="|bᵢ| ≥ |aᵢ| + |cᵢ|"
          text="Condiția care ține metoda stabilă"
          opacitate={intra(T, cue.Final + 3.6, 0.6)}
          st={st}
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
  {
    la: CUE.Eliminare + LA_TRANSFORMARE,
    text: "µ, bᵢ și dᵢ sunt o singură operație: linia se schimbă dintr-o dată.",
  },
  {
    la: CUE.Eliminare + PAS_ELIMINARE,
    text: "O linie pe pas, și doar bᵢ și dᵢ se mișcă — cᵢ rămâne neatins.",
  },
  {
    la: CUE.Eliminare + 2 * PAS_ELIMINARE,
    text: "Aceeași operație, mai jos: împărțitorul e bᵢ₋₁ deja recalculat.",
  },
  { la: CUE.Substitutie + 0.3, text: "A rămas un sistem bidiagonal: pornim de la xₙ = dₙ / bₙ." },
  { la: CUE.Substitutie + 2.6, text: "Urcăm rând cu rând, fiecare xᵢ din xᵢ₊₁." },
  {
    la: CUE.Cost + 0.3,
    text: "Aceeași măsură la amândouă: câte înmulțiri și împărțiri cer.",
  },
  { la: CUE.Cost + 2.6, text: "La n = 100, bara lui Thomas abia se mai vede în jgheab." },
  { la: CUE.Cost + 5.6, text: "La n = 1000 — mărimea unui spline cubic — nu mai are ce desena." },
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
        "x₄ = 40 / 8 = 5 și urcă rând cu rând, dând x₃ = 4, x₂ = 3 și x₁ = 2. Urmează trei " +
        "perechi de bare care compară numărul de înmulțiri și împărțiri cerute de rezolvarea " +
        "aceluiași sistem prin eliminare gaussiană, respectiv prin Thomas: la n = 20, " +
        `${cuMii(COSTURI[0]!.gauss)} față de ${cuMii(COSTURI[0]!.thomas)}; la n = 100, ` +
        `${cuMii(COSTURI[1]!.gauss)} față de ${cuMii(COSTURI[1]!.thomas)}; la n = 1000, ` +
        `${cuMii(COSTURI[2]!.gauss)} față de ${cuMii(COSTURI[2]!.thomas)}, adică de ` +
        `${cuMii(COSTURI[2]!.raport)} de ori mai puține. La final: două ` +
        "treceri prin vectori, O(n) operații, și condiția de dominanță diagonală |bᵢ| ≥ |aᵢ| + |cᵢ|."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
