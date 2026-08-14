import * as gaussSeidel from "@/algorithms/metode-iterative/gauss-seidel";
import * as jacobi from "@/algorithms/metode-iterative/jacobi";
import { Clip } from "@/components/viz/Clip";
import { useClip } from "@/components/viz/clip-context";
import { Subtitrari } from "@/components/viz/Subtitrari";
import { animeaza, clamp, EASING, repere, type Scena } from "@/lib/compozitie";
import { zecimale } from "@/lib/numere";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";

/* ───────────────────────── timpul ───────────────────────── */

const SCENE = [
  {
    nume: "Sistem",
    durata: 8,
    descriere:
      "Sistemul 3×3 și ideea metodelor iterative: nu se rezolvă, se ghicește un vector și se corectează la nesfârșit.",
  },
  {
    nume: "Linia",
    durata: 9,
    descriere:
      "O singură linie: ecuația i se rezolvă pentru necunoscuta ei, iar celelalte două valori se iau din vectorul curent.",
  },
  {
    nume: "Jacobi",
    durata: 13,
    descriere:
      "Un baleiaj Jacobi: toate cele trei linii citesc din același vector înghețat, care nu se schimbă până la capăt.",
  },
  {
    nume: "GaussSeidel",
    durata: 13,
    descriere:
      "Același baleiaj, cu o singură coloană: valoarea scrisă pe o linie e citită imediat de linia următoare.",
  },
  {
    nume: "Comparatie",
    durata: 9,
    descriere: "Ce se câștigă: raza spectrală și numărul de iterații ale celor două metode.",
  },
  {
    nume: "Omega",
    durata: 10,
    descriere:
      "SOR: aceeași corecție, înmulțită cu un factor ω. Sub 1 temperează, peste 1 amplifică, iar la 1 e chiar Gauss-Seidel.",
  },
] as const satisfies readonly Scena[];

type NumeScena = (typeof SCENE)[number]["nume"];

const { cue: CUE, total: TOTAL } = repere(SCENE);

/** Cadrul de la mișcare redusă: baleiajul Gauss-Seidel, cu valoarea proaspătă aprinsă. */
const CADRU_STATIC = CUE.GaussSeidel + 8;

/* ───────────────────────── cifrele ───────────────────────── */

/**
 * **Sursa: `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §4, §5,
 * §6 și §10 (problema 3).** Nimic scris din memorie.
 *
 * Cifrele desenate **nu sunt transcrise**: se calculează la încărcare, cu
 * modulele reale din `src/algorithms/metode-iterative/`, exact ca la clipul
 * paginii 9. Așa desenul și textul nu se pot contrazice, iar dacă se schimbă
 * vreodată metoda, clipul se schimbă odată cu ea.
 */
const A = [
  [10, -5, 1],
  [1, 4, 3],
  [4, -3, -9],
];
const B = [1, 4, 6];
const SISTEM = { A, b: B, x0: [0, 0, 0], tol: 1e-8, maxIteratii: 60 };

const RULARE_JACOBI = jacobi.run(SISTEM);
const RULARE_GS = gaussSeidel.run(SISTEM);

/** Primul baleiaj al fiecărei metode — cel desenat linie cu linie. */
const PAS_JACOBI = RULARE_JACOBI.pasi[0];
const PAS_GS = RULARE_GS.pasi[0];

const N = A.length;

/* ───────────────────────── rolurile de culoare ───────────────────────── */

/**
 * Paleta n-are culori pentru „valoare veche" și „valoare proaspătă", și nici
 * n-o să aibă — e monocromă pe albastru. Se refolosesc roluri existente, alese
 * ca cele două familii de cifre să rămână distincte în ambele teme:
 *
 * - `functie` — coeficienții sistemului, fundalul poveștii;
 * - `anterior` — valorile din iterația trecută, estompate;
 * - `curent` (safir) — valoarea **proaspătă**, cea care face diferența;
 * - `solutie` — valoarea tocmai scrisă pe linia curentă;
 * - `interval` — linia pe care se lucrează acum.
 *
 * `pivot` nu apare: în clipul ăsta nu se pivotează nimic.
 */
const ROL_SISTEM = "functie" as const;
const ROL_VECHI = "anterior" as const;
const ROL_PROASPAT = "curent" as const;
const ROL_SCRIS = "solutie" as const;
const ROL_LINIE = "interval" as const;

/* ───────────────────────── cadrul de desen ───────────────────────── */

const W = 1920;
const H = 1080;

/** Ca la clipurile paginilor 1, 7, 9, 10 și 11: literele se îngroașă pe cadru îngust. */
const LATIME_CONFORT = 780;
const SCARA_MAXIMA = 2.4;
const scaraText = (latime: number) =>
  latime ? Math.min(SCARA_MAXIMA, Math.max(1, LATIME_CONFORT / latime)) : 1;

/* ───────────────────────── ajutoare de timp ───────────────────────── */

/** 1 cât timp `T` e în felia `[a, b)`, 0 în rest. */
const felie = (T: number, a: number, b: number) => (T >= a && T < b ? 1 : 0);

const intra = (T: number, la: number, durata = 0.45) =>
  animeaza({ dela: 0, la: 1, start: la, sfarsit: la + durata, ease: EASING.iesireCubica })(T);

/** Un accent scurt care crește și se stinge. */
function accent(T: number, la: number, durata = 0.9) {
  const u = clamp((T - la) / durata, 0, 1);
  return u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI);
}

/** A câta linie se calculează la momentul `T`, într-un baleiaj care începe la `start`. */
function linieActiva(T: number, start: number, pasPeLinie: number): number {
  return Math.floor(clamp((T - start) / pasPeLinie, 0, N - 0.001));
}

/* ───────────────────────── piese de desen ───────────────────────── */

type StareCelula = { rol?: RolViz; aprins?: number; inel?: RolViz; opacitate?: number };

const SPATIU = 6;

type ProprietatiMatrice = {
  x: number;
  y: number;
  randuri: string[][];
  stari?: Record<string, StareCelula>;
  opacitate: number;
  latura?: number;
  laturaColoana?: number;
  corp?: number;
  nume?: string;
  eticheta?: string;
  /** Indexul coloanei după care se trage linia de separare, pentru `[A|b]`. */
  separator?: number;
  st: number;
};

/**
 * Matricea desenată: parantezele, grila de celule, numele deasupra și eticheta
 * dedesubt. Nu e `MatrixGrid` din `viz/` — aceea primește `steps[]` și stări
 * legate de un algoritm care rulează; aici totul e funcție pură de timp.
 */
function Matrice({
  x,
  y,
  randuri,
  stari = {},
  opacitate,
  latura = 104,
  laturaColoana,
  corp = 40,
  nume,
  eticheta,
  separator,
  st,
}: ProprietatiMatrice) {
  const coloane = randuri[0]?.length ?? 0;
  const latimeCelula = laturaColoana ?? latura;
  const latime = coloane * latimeCelula + (coloane - 1) * SPATIU;
  const inaltime = randuri.length * latura + (randuri.length - 1) * SPATIU;
  const stanga = -latime / 2;
  const sus = -inaltime / 2;
  const bratul = 22;

  const celule = randuri.flatMap((rand, r) =>
    rand.map((text, c) => {
      const stare = stari[`${r},${c}`] ?? {};
      const rol = stare.rol ?? ROL_SISTEM;
      const aprins = stare.aprins ?? 0;
      const cx = stanga + c * (latimeCelula + SPATIU) + latimeCelula / 2;
      const cy = sus + r * (latura + SPATIU) + latura / 2;

      return (
        <g key={`${r},${c}`} opacity={stare.opacitate ?? 1}>
          {aprins > 0 && (
            <rect
              x={cx - latimeCelula / 2}
              y={cy - latura / 2}
              width={latimeCelula}
              height={latura}
              rx={10}
              fill={`color-mix(in oklab, ${culoareRol(stare.inel ?? rol)} ${(22 * aprins).toFixed(1)}%, transparent)`}
              stroke={culoareRol(stare.inel ?? rol)}
              strokeWidth={4 * aprins}
            />
          )}
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill={culoareEticheta(rol)}
            style={{ font: `600 ${corp * Math.min(st, 1.4)}px var(--font-mono)` }}
          >
            {text}
          </text>
        </g>
      );
    }),
  );

  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacitate}>
      {/* Parantezele, desenate cu linii: la 1920 de unități, o paranteză
          tipografică s-ar subția până la dispariție. */}
      <g stroke="var(--text)" strokeWidth={6} fill="none" strokeLinecap="square">
        <path
          d={`M ${stanga - 16 + bratul} ${sus - 9} H ${stanga - 16} V ${sus + inaltime + 9} H ${stanga - 16 + bratul}`}
        />
        <path
          d={`M ${stanga + latime + 16 - bratul} ${sus - 9} H ${stanga + latime + 16} V ${sus + inaltime + 9} H ${stanga + latime + 16 - bratul}`}
        />
      </g>

      {separator !== undefined && (
        <line
          x1={stanga + (separator + 1) * (latimeCelula + SPATIU) - SPATIU / 2}
          x2={stanga + (separator + 1) * (latimeCelula + SPATIU) - SPATIU / 2}
          y1={sus - 4}
          y2={sus + inaltime + 4}
          stroke="var(--bordura)"
          strokeWidth={3}
        />
      )}

      {celule}

      {nume && (
        <text
          x={0}
          y={sus - 56}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text)"
          style={{ font: `800 ${40 * Math.min(st, 1.4)}px var(--font-sans)` }}
        >
          {nume}
        </text>
      )}
      {eticheta && (
        <text
          x={0}
          y={sus + inaltime + 62}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-slab)"
          style={{ font: `600 ${28 * Math.min(st, 1.5)}px var(--font-sans)` }}
        >
          {eticheta}
        </text>
      )}
    </g>
  );
}

/** Antetul din colțul de sus-stânga: numărul momentului și titlul lui. */
function Antet({
  opacitate,
  numar,
  titlu,
  st,
}: {
  opacitate: number;
  numar: string;
  titlu: string;
  st: number;
}) {
  return (
    <g opacity={opacitate}>
      <text
        x={120}
        y={84}
        fill={culoareEticheta("curent")}
        style={{
          font: `700 ${26 * Math.min(st, 1.4)}px var(--font-mono)`,
          letterSpacing: "0.16em",
        }}
      >
        {numar}
      </text>
      <text
        x={120}
        y={148}
        fill="var(--text)"
        style={{ font: `800 ${54 * Math.min(st, 1.3)}px var(--font-sans)` }}
      >
        {titlu}
      </text>
    </g>
  );
}

/** Un cartonaș: dungă colorată, simbol, explicație. */
function Card({
  x,
  y,
  latime,
  inaltime,
  opacitate,
  rol,
  simbol,
  text,
  st,
}: {
  x: number;
  y: number;
  latime: number;
  inaltime: number;
  opacitate: number;
  rol?: RolViz;
  simbol: string;
  text: string;
  st: number;
}) {
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
        x={32}
        y={inaltime / 2 - 26}
        dominantBaseline="central"
        fill={rol ? culoareEticheta(rol) : "var(--text)"}
        style={{
          font: `700 ${38 * Math.min(st, 1.3)}px var(--font-mono)`,
          letterSpacing: "0.05em",
        }}
      >
        {simbol}
      </text>
      <text
        x={32}
        y={inaltime / 2 + 32}
        dominantBaseline="central"
        fill="var(--text)"
        style={{ font: `600 ${28 * Math.min(st, 1.4)}px var(--font-sans)` }}
      >
        {text}
      </text>
    </g>
  );
}

/** Propoziția lată de sub desen — concluzia momentului. */
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
    <text
      x={W / 2}
      y={905}
      textAnchor="middle"
      opacity={opacitate}
      fill="var(--text)"
      style={{ font: `700 ${40 * Math.min(st, 1.25)}px var(--font-sans)` }}
    >
      {copii}
    </text>
  );
}

/**
 * Săgeata care arată de unde se citește o valoare.
 *
 * Are două forme, fiindcă are două povești de spus. **Traversarea** merge din
 * coloana veche în cea nouă și intră prin stânga. **Bucla** rămâne în coloana
 * nouă — e cazul Gauss-Seidel, unde valoarea citită tocmai a fost scrisă acolo —
 * și iese prin dreapta ca să se întoarcă tot prin dreapta, cu vârful spre
 * stânga. Fără distincția asta, săgeata proaspătă ar arăta ca și cum valoarea
 * ar veni de undeva din afara desenului.
 */
function Sageata({
  dela,
  la,
  opacitate,
  rol,
  bucla = false,
}: {
  dela: [number, number];
  la: [number, number];
  opacitate: number;
  rol: RolViz;
  bucla?: boolean;
}) {
  const [x1, y1] = dela;
  const [x2, y2] = la;
  const mijloc = (y1 + y2) / 2;
  const culoare = culoareRol(rol);

  const traseu = bucla
    ? `M ${x1} ${y1} C ${x1 + 150} ${y1}, ${x2 + 150} ${y2}, ${x2 + 24} ${y2}`
    : `M ${x1} ${y1} C ${x1 + 70} ${y1}, ${x2 - 90} ${mijloc}, ${x2 - 24} ${y2}`;
  const varf = bucla
    ? `M ${x2 + 24} ${y2} l 18 -11 M ${x2 + 24} ${y2} l 18 11`
    : `M ${x2 - 24} ${y2} l -18 -11 M ${x2 - 24} ${y2} l -18 11`;

  return (
    <g opacity={opacitate} fill="none" stroke={culoare} strokeWidth={5} strokeLinecap="round">
      <path d={traseu} />
      <path d={varf} />
    </g>
  );
}

/* ───────────────────────── formatarea cifrelor ───────────────────────── */

const cifra = (v: number) => zecimale(v, 3);
const coeficient = (v: number) => (Number.isInteger(v) ? String(v) : zecimale(v, 2));

/** Sistemul ca matrice extinsă `[A|b]`, cu textele gata formatate. */
const RANDURI_SISTEM = A.map((linie, i) => [...linie.map(coeficient), coeficient(B[i] ?? 0)]);

/* ───────────────────────── desenul întreg ───────────────────────── */

function Desen() {
  const { T, cue, latime } = useClip<NumeScena>();
  const st = scaraText(latime);

  /* ── 1 · sistemul ── */
  const S = cue.Sistem;
  const oSistem = felie(T, S, cue.Linia);
  const oGhicire = felie(T, S, cue.Linia) * intra(T, S + 3.4, 0.6);
  const aExtins = accent(T, S + 1.4, 1.8);
  const stariSistem: Record<string, StareCelula> = {};
  for (let i = 0; i < N; i++) {
    stariSistem[`${i},${N}`] = { aprins: aExtins, inel: ROL_SISTEM };
  }

  /* ── 2 · o singură linie ── */
  const L = cue.Linia;
  const oLinie = felie(T, L, cue.Jacobi);
  const aLinie = intra(T, L + 0.6, 0.6);
  const oFormula = oLinie * intra(T, L + 2.2, 0.6);
  const oRezultat = oLinie * intra(T, L + 4.6, 0.6);
  const stariLinie: Record<string, StareCelula> = {};
  for (let c = 0; c <= N; c++) stariLinie[`0,${c}`] = { aprins: aLinie, inel: ROL_LINIE };

  /* ── 3 și 4 · cele două baleiaje ── */
  const PAS_PE_LINIE = 3.2;
  const J = cue.Jacobi;
  const oJacobi = felie(T, J, cue.GaussSeidel);
  const linieJ = linieActiva(T, J + 1.2, PAS_PE_LINIE);

  const G = cue.GaussSeidel;
  const oGs = felie(T, G, cue.Comparatie);
  const linieG = linieActiva(T, G + 1.2, PAS_PE_LINIE);

  /* ── 5 · comparația ── */
  const C = cue.Comparatie;
  const oComparatie = felie(T, C, cue.Omega);

  /* ── 6 · ω ── */
  const O = cue.Omega;
  const oOmega = felie(T, O, TOTAL + 1);
  // Cursorul se plimbă: 1 → 1,5 → 0,6 → 1, ca să se vadă amândouă capetele.
  const omega = animeaza({ dela: 1, la: 1.5, start: O + 1.6, sfarsit: O + 3.4 })(T);
  const omega2 = animeaza({ dela: 1.5, la: 0.6, start: O + 4.2, sfarsit: O + 6.4 })(T);
  const omegaCurent = T < O + 4.2 ? omega : omega2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      {/* ═══ 1 · sistemul ═══ */}
      <Antet opacitate={oSistem} numar="1" titlu="Sistemul" st={st} />
      <Matrice
        x={620}
        y={480}
        randuri={RANDURI_SISTEM}
        stari={stariSistem}
        opacitate={oSistem}
        latura={104}
        laturaColoana={116}
        corp={40}
        separator={N - 1}
        eticheta="coeficienții și termenii liberi"
        st={st}
      />
      <g opacity={oGhicire}>
        <Card
          x={1180}
          y={352}
          latime={640}
          inaltime={140}
          opacitate={intra(T, S + 3.4, 0.5)}
          rol={ROL_VECHI}
          simbol="x⁽⁰⁾ = 0"
          text="Se pornește de la o ghicire"
          st={st}
        />
        <Card
          x={1180}
          y={520}
          latime={640}
          inaltime={140}
          opacitate={intra(T, S + 5.0, 0.5)}
          rol={ROL_SCRIS}
          simbol="x⁽ᵏ⁾ → x⁽ᵏ⁺¹⁾"
          text="…și se corectează, la nesfârșit"
          st={st}
        />
      </g>
      <Concluzie
        opacitate={oSistem * intra(T, S + 6.2, 0.5)}
        st={st}
        copii="Nu rezolvăm sistemul dintr-o dată — îl îmbunătățim de fiecare dată."
      />

      {/* ═══ 2 · o singură linie ═══ */}
      <Antet opacitate={oLinie} numar="2" titlu="Ce face o linie" st={st} />
      <Matrice
        x={560}
        y={420}
        randuri={RANDURI_SISTEM}
        stari={stariLinie}
        opacitate={oLinie}
        latura={104}
        laturaColoana={116}
        corp={40}
        separator={N - 1}
        st={st}
      />
      <text
        x={W / 2}
        y={720}
        textAnchor="middle"
        dominantBaseline="central"
        opacity={oFormula}
        fill="var(--text)"
        style={{ font: `700 ${44 * Math.min(st, 1.2)}px var(--font-mono)` }}
      >
        x₁ = ( {coeficient(B[0] ?? 0)} + {coeficient(-(A[0]?.[1] ?? 0))}·x₂ −{" "}
        {coeficient(A[0]?.[2] ?? 0)}·x₃ ) / {coeficient(A[0]?.[0] ?? 0)}
      </text>
      <g opacity={oRezultat}>
        <text
          x={W / 2}
          y={800}
          textAnchor="middle"
          dominantBaseline="central"
          fill={culoareEticheta(ROL_SCRIS)}
          style={{ font: `700 ${44 * Math.min(st, 1.2)}px var(--font-mono)` }}
        >
          x₁ = {cifra(PAS_JACOBI?.componente[0]?.valoareNoua ?? 0)}
        </text>
      </g>
      <Concluzie
        opacitate={oLinie * intra(T, L + 6.4, 0.5)}
        st={st}
        copii="Linia i răspunde pentru necunoscuta i. Întrebarea e de unde ia celelalte două."
      />

      {/* ═══ 3 · Jacobi ═══ */}
      <Antet opacitate={oJacobi} numar="3" titlu="Jacobi" st={st} />
      <Baleiaj
        opacitate={oJacobi}
        pas={PAS_JACOBI}
        linie={linieJ}
        proaspete={false}
        T={T}
        start={J + 1.2}
        pasPeLinie={PAS_PE_LINIE}
        st={st}
      />
      <Concluzie
        opacitate={oJacobi * intra(T, J + 10.4, 0.5)}
        st={st}
        copii={
          <>
            Coloana din stânga <tspan fill={culoareEticheta(ROL_VECHI)}>nu se schimbă</tspan> tot
            baleiajul: cele trei linii se pot calcula chiar în același timp.
          </>
        }
      />

      {/* ═══ 4 · Gauss-Seidel ═══ */}
      <Antet opacitate={oGs} numar="4" titlu="Gauss-Seidel" st={st} />
      <Baleiaj
        opacitate={oGs}
        pas={PAS_GS}
        linie={linieG}
        proaspete
        T={T}
        start={G + 1.2}
        pasPeLinie={PAS_PE_LINIE}
        st={st}
      />
      <Concluzie
        opacitate={oGs * intra(T, G + 10.4, 0.5)}
        st={st}
        copii={
          <>
            Valoarea scrisă e citită <tspan fill={culoareEticheta(ROL_PROASPAT)}>imediat</tspan> de
            linia următoare. Aceeași formulă, alt vector sub ea.
          </>
        }
      />

      {/* ═══ 5 · comparația ═══ */}
      <Antet opacitate={oComparatie} numar="5" titlu="Cât se câștigă" st={st} />
      <g opacity={oComparatie}>
        <Card
          x={200}
          y={360}
          latime={700}
          inaltime={150}
          opacitate={intra(T, C + 0.6, 0.5)}
          rol={ROL_VECHI}
          simbol={`ρ = ${zecimale(RULARE_JACOBI.razaSpectrala ?? 0, 4)}`}
          text={`Jacobi — ${RULARE_JACOBI.pasi.length} de iterații`}
          st={st}
        />
        <Card
          x={200}
          y={540}
          latime={700}
          inaltime={150}
          opacitate={intra(T, C + 2.0, 0.5)}
          rol={ROL_PROASPAT}
          simbol={`ρ = ${zecimale(RULARE_GS.razaSpectrala ?? 0, 4)}`}
          text={`Gauss-Seidel — ${RULARE_GS.pasi.length} de iterații`}
          st={st}
        />
        <text
          x={1400}
          y={420}
          textAnchor="middle"
          dominantBaseline="central"
          opacity={intra(T, C + 3.4, 0.5)}
          fill="var(--text-slab)"
          style={{ font: `600 ${30 * Math.min(st, 1.4)}px var(--font-sans)` }}
        >
          Eroarea se înmulțește cu ρ
        </text>
        <text
          x={1400}
          y={490}
          textAnchor="middle"
          dominantBaseline="central"
          opacity={intra(T, C + 3.4, 0.5)}
          fill="var(--text-slab)"
          style={{ font: `600 ${30 * Math.min(st, 1.4)}px var(--font-sans)` }}
        >
          la fiecare pas
        </text>
      </g>
      <Concluzie
        opacitate={oComparatie * intra(T, C + 5.2, 0.5)}
        st={st}
        copii="Nu e o regulă generală — dar când amândouă merg, Gauss-Seidel ajunge primul."
      />

      {/* ═══ 6 · ω ═══ */}
      <Antet opacitate={oOmega} numar="6" titlu="Suprarelaxare" st={st} />
      <g opacity={oOmega * intra(T, O + 0.4, 0.5)}>
        <text
          x={W / 2}
          y={400}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text)"
          style={{ font: `700 ${52 * Math.min(st, 1.2)}px var(--font-mono)` }}
        >
          x nou = x vechi + ω · corecție
        </text>
      </g>
      <CursorOmega opacitate={oOmega * intra(T, O + 1.4, 0.5)} omega={omegaCurent} st={st} />
      <Concluzie
        opacitate={oOmega * intra(T, O + 7.0, 0.5)}
        st={st}
        copii="ω = 1 e chiar Gauss-Seidel. Cel mai bun ω nu se calculează — se caută."
      />
    </svg>
  );
}

/* ───────────────────────── baleiajul, piesa centrală ───────────────────────── */

type ProprietatiBaleiaj = {
  opacitate: number;
  pas: (typeof RULARE_JACOBI.pasi)[number] | undefined;
  linie: number;
  /** Gauss-Seidel citește valorile proaspete; Jacobi, nu. */
  proaspete: boolean;
  T: number;
  start: number;
  pasPeLinie: number;
  st: number;
};

/**
 * Cele două coloane de valori și săgețile dintre ele — singura scenă care chiar
 * arată diferența dintre metode.
 *
 * La Jacobi sunt **două** coloane: cea veche, care rămâne neatinsă, și cea nouă,
 * care se umple. La Gauss-Seidel, coloana nouă se citește pe ea însăși, deci
 * săgețile pornesc din valorile deja scrise, nu din coloana din stânga.
 */
function Baleiaj({
  opacitate,
  pas,
  linie,
  proaspete,
  T,
  start,
  pasPeLinie,
  st,
}: ProprietatiBaleiaj) {
  if (!pas) return null;

  const X_VECHI = 540;
  const X_NOU = 1160;
  const Y_PRIM = 330;
  const PAS_Y = 150;
  const yLinie = (i: number) => Y_PRIM + i * PAS_Y;

  const componenta = pas.componente[linie];
  // Săgețile stau cât ține **citirea**, nu doar o clipă: ele sunt subiectul
  // scenei, iar un accent scurt le-ar face să pară un artificiu de tranziție.
  const inceputLinie = start + linie * pasPeLinie;
  const aparitie = Math.min(
    intra(T, inceputLinie + 0.15, 0.35),
    1 - intra(T, inceputLinie + 2.4, 0.4),
  );

  const celule = (x: number, valori: (string | null)[], rol: (i: number) => RolViz) =>
    valori.map((text, i) =>
      text === null ? null : (
        <g key={`${x}-${i}`}>
          <rect
            x={x - 130}
            y={yLinie(i) - 52}
            width={260}
            height={104}
            rx={12}
            fill={
              i === linie
                ? `color-mix(in oklab, ${culoareRol(ROL_LINIE)} 18%, transparent)`
                : "transparent"
            }
            stroke={i === linie ? culoareRol(ROL_LINIE) : "transparent"}
            strokeWidth={3}
          />
          <text
            x={x}
            y={yLinie(i)}
            textAnchor="middle"
            dominantBaseline="central"
            fill={culoareEticheta(rol(i))}
            style={{ font: `600 ${40 * Math.min(st, 1.4)}px var(--font-mono)` }}
          >
            {text}
          </text>
        </g>
      ),
    );

  const valoriVechi = pas.xAnterior.map((v) => cifra(v));
  // Valoarea apare la mijlocul liniei, după ce săgețile au arătat de unde vin
  // termenii ei: întâi se citește, apoi se scrie.
  const progres = (T - start) / pasPeLinie;
  const scrisa = (i: number) => progres >= i + 0.55;
  const valoriNoi = pas.componente.map((c, i) =>
    scrisa(i) ? cifra(c.valoareNoua) : i === linie ? "?" : null,
  );

  return (
    <g opacity={opacitate}>
      {/* Coloana veche. La Gauss-Seidel rămâne desenată, dar estompată: e de
          unde se pornește, nu de unde se citește. */}
      <g opacity={proaspete ? 0.45 : 1}>
        <CapDeColoana x={X_VECHI} y={Y_PRIM - 110} exponent="(k)" rol={ROL_VECHI} st={st} />
        {celule(X_VECHI, valoriVechi, () => ROL_VECHI)}
      </g>

      <CapDeColoana x={X_NOU} y={Y_PRIM - 110} exponent="(k+1)" rol={ROL_SCRIS} st={st} />
      {celule(X_NOU, valoriNoi, (i) => (scrisa(i) ? ROL_SCRIS : ROL_VECHI))}

      {/* Săgețile: de unde citește linia curentă cele două valori de care are
          nevoie. Aici se vede toată diferența dintre cele două metode. */}
      {componenta?.citite.map((provenienta, j) => {
        if (provenienta === "curenta") return null;
        const proaspata = provenienta === "proaspata";
        return (
          <Sageata
            key={j}
            dela={[proaspata ? X_NOU + 140 : X_VECHI + 140, yLinie(j)]}
            la={[proaspata ? X_NOU + 140 : X_NOU - 140, yLinie(linie)]}
            opacitate={aparitie}
            rol={proaspata ? ROL_PROASPAT : ROL_VECHI}
            bucla={proaspata}
          />
        );
      })}

      {/* Formula liniei curente, cu numerele în ea. */}
      <text
        x={W / 2}
        y={840}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text)"
        style={{ font: `700 ${34 * Math.min(st, 1.25)}px var(--font-mono)` }}
      >
        {`x${["₁", "₂", "₃"][linie] ?? ""} = ${cifra(componenta?.valoareNoua ?? 0)}`}
      </text>
    </g>
  );
}

/**
 * Numele unei coloane de valori: `x` cu exponentul lui, ridicat.
 *
 * Exponentul se desenează ca `tspan` ridicat, nu cu caracterele `⁽ᵏ⁺¹⁾`:
 * fonturile proiectului n-au glifele acelea, iar browserul le-ar lua din fontul
 * de sistem — adică altă literă, altă grosime, altă înălțime, chiar în capul
 * desenului.
 */
function CapDeColoana({
  x,
  y,
  exponent,
  rol,
  st,
}: {
  x: number;
  y: number;
  exponent: string;
  rol: RolViz;
  st: number;
}) {
  const corp = 44 * Math.min(st, 1.4);
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill={culoareEticheta(rol)}
      style={{ font: `700 ${corp}px var(--font-mono)` }}
    >
      x
      <tspan dy={-corp * 0.34} style={{ fontSize: `${corp * 0.62}px` }}>
        {exponent}
      </tspan>
    </text>
  );
}

/* ───────────────────────── cursorul lui ω ───────────────────────── */

function CursorOmega({ opacitate, omega, st }: { opacitate: number; omega: number; st: number }) {
  const X0 = 460;
  const X1 = 1460;
  const Y = 600;
  const pozitie = X0 + ((X1 - X0) * clamp(omega, 0, 2)) / 2;
  const marcaj = (v: number) => X0 + ((X1 - X0) * v) / 2;

  return (
    <g opacity={opacitate}>
      <line x1={X0} x2={X1} y1={Y} y2={Y} stroke="var(--bordura)" strokeWidth={8} />
      {[0, 1, 2].map((v) => (
        <g key={v}>
          <line
            x1={marcaj(v)}
            x2={marcaj(v)}
            y1={Y - 22}
            y2={Y + 22}
            stroke="var(--text-slab)"
            strokeWidth={4}
          />
          <text
            x={marcaj(v)}
            y={Y + 72}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text-slab)"
            style={{ font: `600 ${30 * Math.min(st, 1.4)}px var(--font-mono)` }}
          >
            {v}
          </text>
        </g>
      ))}

      <text
        x={marcaj(0.5)}
        y={Y - 80}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text-slab)"
        style={{ font: `600 ${28 * Math.min(st, 1.4)}px var(--font-sans)` }}
      >
        temperează corecția
      </text>
      <text
        x={marcaj(1.5)}
        y={Y - 80}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text-slab)"
        style={{ font: `600 ${28 * Math.min(st, 1.4)}px var(--font-sans)` }}
      >
        o amplifică
      </text>

      <circle cx={pozitie} cy={Y} r={26} fill={culoareRol(ROL_PROASPAT)} />
      <text
        x={pozitie}
        y={Y - 130}
        textAnchor="middle"
        dominantBaseline="central"
        fill={culoareEticheta(ROL_PROASPAT)}
        style={{ font: `700 ${42 * Math.min(st, 1.3)}px var(--font-mono)` }}
      >
        ω = {zecimale(omega, 2)}
      </text>
    </g>
  );
}

/* ───────────────────────── piesa întreagă ───────────────────────── */

const SUBTITRARI = [
  { la: CUE.Sistem + 0.4, text: "Un sistem 3×3, cu coeficienții și termenii liberi alături." },
  {
    la: CUE.Sistem + 3.6,
    text: "Metodele iterative nu îl rezolvă: pornesc de la o ghicire și o corectează.",
  },
  {
    la: CUE.Linia + 0.4,
    text: "Fiecare linie e rezolvată pentru necunoscuta care îi stă pe diagonală.",
  },
  {
    la: CUE.Linia + 4.6,
    text: "Cu x⁽⁰⁾ = 0, prima linie dă x₁ = 0,100. Celelalte două valori vin din vectorul curent.",
  },
  { la: CUE.Jacobi + 0.4, text: "Jacobi ține vectorul vechi înghețat și scrie într-unul nou." },
  {
    la: CUE.Jacobi + 6.0,
    text: "Toate cele trei linii citesc din aceeași coloană, cea din iterația trecută.",
  },
  { la: CUE.GaussSeidel + 0.4, text: "Gauss-Seidel scrie peste vectorul din care citește." },
  {
    la: CUE.GaussSeidel + 4.8,
    text: "Linia a doua folosește deja valoarea proaspătă a lui x₁ — asta e toată diferența.",
  },
  {
    la: CUE.Comparatie + 0.4,
    text: "Raza spectrală spune cu cât se micșorează eroarea la fiecare pas.",
  },
  { la: CUE.Omega + 0.4, text: "SOR înmulțește corecția cu ω înainte s-o adauge." },
  { la: TOTAL - 3.2, text: "Sub 1 temperează, peste 1 amplifică, iar la 1 e chiar Gauss-Seidel." },
] as const;

/**
 * Clipul paginii 5: de ce Gauss-Seidel nu e Jacobi, deși au aceeași formulă.
 *
 * **Clip scris în cod, nu randat cu Manim** — aceeași excepție ca la paginile 1,
 * 7, 9, 10 și 11, dar din alt motiv: aici diferența dintre metode e **ce valori
 * se citesc**, iar asta se arată cu săgeți care apar și dispar peste aceleași
 * cifre. Cifrele nu sunt transcrise, ci calculate la încărcare cu modulele reale
 * din `src/algorithms/metode-iterative/`, ca desenul și textul să nu se poată
 * contrazice.
 *
 * Ca orice clip, **nu** primește parametrii utilizatorului: sistemul e fix, cel
 * din curs. Reglajul lui ω și schimbarea matricei sunt treaba interfeței.
 */
export function AnimatiaMetodelorIterative() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație: de ce Gauss-Seidel nu e Jacobi. Se pornește de la un sistem 3×3 scris ca matrice " +
        "extinsă și de la ideea metodelor iterative — o ghicire care se corectează. Fiecare linie e " +
        "rezolvată pentru necunoscuta de pe diagonala ei. La Jacobi, toate cele trei linii citesc din " +
        "același vector, înghețat până la capătul baleiajului, și scriu într-unul nou. La " +
        "Gauss-Seidel, vectorul se rescrie pe loc: linia a doua folosește deja valoarea proaspătă a " +
        "lui x₁, iar săgețile pornesc din coloana nouă, nu din cea veche. Diferența se vede în " +
        "cifre: raza spectrală scade de la 0,6072 la 0,4082, iar numărul de iterații de la 33 la 23. " +
        "La final, SOR înmulțește corecția cu un factor ω: sub 1 o temperează, peste 1 o amplifică, " +
        "iar pentru ω = 1 e chiar Gauss-Seidel."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
