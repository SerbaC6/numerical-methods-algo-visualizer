import { Clip } from "@/components/viz/Clip";
import { useClip } from "@/components/viz/clip-context";
import { Subtitrari } from "@/components/viz/Subtitrari";
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
    durata: 5,
    descriere: "Sistemul Ax = b apare celulă cu celulă: matricea A, necunoscutele x, termenii b.",
  },
  {
    nume: "Cramer",
    durata: 7,
    descriere: "Sistemul se retrage în stânga sus și apar cei n + 1 determinanți ceruți de Cramer.",
  },
  {
    nume: "Laplace",
    durata: 7,
    descriere:
      "Dezvoltarea Laplace se ramifică pe patru niveluri, până la 4! determinanți de ordin 1.",
  },
  {
    nume: "Explozie",
    durata: 6,
    descriere: "Contoare și bare pentru n = 3, n = 10 și n = 20 operații.",
  },
  {
    nume: "Pivot",
    durata: 5,
    descriere: "Bara O(n!) iese din cadru, bara O(n³) rămâne minusculă.",
  },
  {
    nume: "Factorizare",
    durata: 10,
    descriere:
      "Formula A = L · U devine matricea A, care se desface în L la stânga și U la dreapta.",
  },
  {
    nume: "Substitutii",
    durata: 11,
    descriere: "Ly = b se rezolvă de sus în jos, Ux = y de jos în sus, fiecare în O(n²).",
  },
  {
    nume: "Doolittle",
    durata: 8,
    descriere:
      "Cele trei nume apar, apoi cadrul se mută pe Doolittle și pe diagonala de 1 a lui L.",
  },
  {
    nume: "AlteMetode",
    durata: 9,
    descriere: "Trei cartonașe: Doolittle, Crout și Cholesky, cu regula fiecăruia.",
  },
] as const satisfies readonly Scena[];

type NumeScena = (typeof SCENE)[number]["nume"];

/** Reperele, calculate o dată: subtitrările se cheie pe ele, nu pe secunde scrise de mână. */
const { cue: CUE, total: TOTAL } = repere(SCENE);

/**
 * Cadrul arătat la `prefers-reduced-motion`: A deja despărțită în L și U, cu
 * ambele triunghiuri pe ecran. E imaginea care ține singură tot clipul.
 */
const CADRU_STATIC = CUE.Factorizare + 7;

/* ───────────────────────── matematica ───────────────────────── */

/**
 * **Sursa: `cursuri_MN/MN_curs2_lab2_matrici.md` §3–§5 și
 * `cursuri_MN/sisteme_liniare_metode_directe_MN_curs4.md` §2, §6, §8.** Nimic
 * scris din memorie.
 *
 * Exemplul desenat e o factorizare **Doolittle** exactă, cu numere întregi —
 * verificată independent de aplicație:
 *
 * - `L·U = A` element cu element, fără rest;
 * - `L` are 1 pe diagonală, adică exact convenția Doolittle din curs;
 * - `Ly = b` dă `y = (6, 9, 13)`, iar `Ux = y` dă `x = (1, 1, 1)`.
 *
 * Cifrele de cost sunt tot ale cursului: un determinant de ordin `n` prin
 * dezvoltare Laplace cere `n!` operații (curs2 §4), deci `3! = 6`,
 * `10! = 3.628.800` și `20! ≈ 2,4·10¹⁸`, față de `n³ = 8.000` la `n = 20` —
 * raportul desenat, `3·10¹⁴`, e `20!/20³`.
 */
const A = [
  [1, 2, 3],
  [2, 8, 11],
  [3, 22, 42],
];
const B = [6, 21, 67];
const L = [
  [1, 0, 0],
  [2, 1, 0],
  [3, 4, 1],
];
const U = [
  [1, 2, 3],
  [0, 4, 5],
  [0, 0, 13],
];
const Y = [6, 9, 13];
const X = [1, 1, 1];

/** Matricea `A^j` din regula lui Cramer: coloana `j` din `A`, înlocuită cu `b`. */
const coloanaInlocuita = (j: number) =>
  A.map((rand, i) => rand.map((v, c) => (c === j ? (B[i] ?? v) : v)));

/** Cifrele mari, cu punctul de mie românesc: „3.628.800". */
const cuMii = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/* ───────────────────────── cadrul de desen ───────────────────────── */

const W = 1920;
const H = 1080;

/**
 * Cu cât se îngroașă literele desenului pe un cadru îngust — același truc ca la
 * clipurile paginilor 7, 9, 10 și 11: desenul are 1920 de unități oricât de mic
 * ar fi pe ecran, deci pe telefon literele ar ajunge de câțiva pixeli.
 */
const LATIME_CONFORT = 780;
const SCARA_MAXIMA = 2.4;
const scaraText = (latime: number) =>
  latime ? Math.min(SCARA_MAXIMA, Math.max(1, LATIME_CONFORT / latime)) : 1;

/**
 * Rolurile de culoare, alese o singură dată și folosite peste tot în clip.
 *
 * Paleta n-are culori proprii pentru „L", „U" sau „cost care explodează" — și
 * nici n-o să aibă, fiindcă e monocromă pe albastru. Ca la clipurile paginilor
 * 10 și 11, se refolosesc roluri existente, cu grijă ca ce apare în același
 * cadru să rămână distinct în ambele teme:
 *
 * - `curent` (safir) — `L` și, în general, ce se urmărește acum: coloana
 *   înlocuită din determinanții lui Cramer, celula aprinsă, bara `O(n³)`;
 * - `functie` — `U`, a doua familie de cifre din factorizare;
 * - `interval` (chihlimbar/portocaliu) — **costul care explodează**: `n!`, bara
 *   `O(n!)` și contorul de la `n = 20`. E singura culoare caldă care rămâne
 *   lizibilă lângă albastruri, iar rolul ei e „ce se arată acum peste desen";
 * - `solutie` — valorile aflate prin substituție, `y` și apoi `x`;
 * - `anterior` — zerourile din triunghiuri și cifrele inactive.
 *
 * `pivot` **nu apare**: în clipul ăsta nu se pivotează nimic, iar vermillionul
 * are rolul lui fixat.
 */
const ROL_L = "curent" as const;
const ROL_U = "functie" as const;
const ROL_COST = "interval" as const;
const ROL_GASIT = "solutie" as const;
const ROL_STINS = "anterior" as const;

/* ───────────────────────── helperi de mișcare ───────────────────────── */

/** Intrare (și, opțional, ieșire) lină — echivalentul unui fade in/out. */
function intra(T: number, la: number, pana?: number, durata = 0.5): number {
  const a = EASING.iesireCubica(clamp((T - la) / durata, 0, 1));
  const b = pana == null ? 1 : EASING.iesireCubica(clamp((pana - T) / 0.4, 0, 1));
  return Math.min(a, b);
}

/** De la 0 la 1 între două momente — pentru ce se desenează sau se deplasează. */
const deseneaza = (T: number, start: number, sfarsit: number, ease = EASING.intrareIesireCubica) =>
  animeaza({ dela: 0, la: 1, start, sfarsit, ease })(T);

/** Un accent scurt care depășește ținta și revine — pentru ce „pocnește" în cadru. */
const salt = (T: number, la: number) =>
  animeaza({ dela: 0.82, la: 1, start: la, sfarsit: la + 0.5, ease: EASING.iesireCuDepasire })(T);

/* ───────────────────────── piese de desen ───────────────────────── */

/** Antetul unei scene: titlul mare, sus-stânga, și nota de sub el. */
function Antet({
  opacitate,
  titlu,
  nota,
  st,
}: {
  opacitate: number;
  titlu: readonly string[];
  nota?: readonly string[];
  st: number;
}) {
  const notaSus = 150 + (titlu.length - 1) * 66 + 54;
  return (
    <g opacity={opacitate} transform={`translate(0, ${(1 - opacitate) * 18})`}>
      {titlu.map((linie, i) => (
        <text
          key={linie}
          x={120}
          y={150 + i * 66}
          fill="var(--text)"
          style={{ font: `800 ${60 * Math.min(st, 1.35)}px var(--font-sans)` }}
        >
          {linie}
        </text>
      ))}
      {nota?.map((linie, i) => (
        <text
          key={linie}
          x={120}
          y={notaSus + i * 40}
          fill="var(--text-slab)"
          style={{ font: `400 ${29 * Math.min(st, 1.5)}px var(--font-sans)` }}
        >
          {linie}
        </text>
      ))}
    </g>
  );
}

/** Cum se desenează o celulă dintr-o matrice. */
type StareCelula = {
  /** Culoarea cifrei; implicit, culoarea textului obișnuit. */
  rol?: RolViz;
  /** Umplerea celulei, la 16% — evidențierea „aici se uită acum". */
  fundal?: RolViz;
  /** Rama subțire din jurul celulei, pentru accentul care pulsează. */
  inel?: RolViz;
  opacitate?: number;
  scara?: number;
  /** Ce scrie în celulă, dacă nu chiar valoarea din matrice. */
  text?: string;
  gros?: boolean;
};

const SPATIU = 6;

/**
 * Matricea desenată: parantezele și grila de celule.
 *
 * Nu e `MatrixGrid` din `viz/`: aceea primește `steps[]` și are stări de celulă
 * legate de un algoritm care rulează. Aici nu rulează nimic — clipul e o funcție
 * pură de timp.
 */
function Matrice({
  x,
  y,
  randuri,
  celula,
  latura = 96,
  corp,
  opacitate = 1,
  scara = 1,
  st,
}: {
  x: number;
  y: number;
  randuri: readonly (readonly (number | string)[])[];
  celula?: (i: number, j: number) => StareCelula;
  latura?: number;
  corp?: number;
  opacitate?: number;
  scara?: number;
  st: number;
}) {
  const coloane = randuri[0]?.length ?? 0;
  const latime = coloane * latura + (coloane - 1) * SPATIU;
  const inaltime = randuri.length * latura + (randuri.length - 1) * SPATIU;
  const stanga = -latime / 2;
  const sus = -inaltime / 2;
  const bratul = Math.max(10, latura * 0.18);
  const marime = corp ?? latura * 0.38;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scara})`} opacity={opacitate}>
      {/* Parantezele. Desenate cu linii, nu cu un font: la 1920 de unități, o
          paranteză tipografică s-ar subția până la dispariție. */}
      <g stroke="var(--text)" strokeWidth={5} fill="none" strokeLinecap="square">
        <path
          d={`M ${stanga - 24 + bratul} ${sus - 14} H ${stanga - 24} V ${sus + inaltime + 14} H ${stanga - 24 + bratul}`}
        />
        <path
          d={`M ${stanga + latime + 24 - bratul} ${sus - 14} H ${stanga + latime + 24} V ${sus + inaltime + 14} H ${stanga + latime + 24 - bratul}`}
        />
      </g>

      {randuri.map((rand, i) =>
        rand.map((valoare, j) => {
          const stare = celula?.(i, j) ?? {};
          const cx = stanga + j * (latura + SPATIU) + latura / 2;
          const cy = sus + i * (latura + SPATIU) + latura / 2;
          const scaraCelula = stare.scara ?? 1;

          return (
            <g key={`${i},${j}`} opacity={stare.opacitate ?? 1}>
              {(stare.fundal || stare.inel) && (
                <rect
                  x={cx - latura / 2}
                  y={cy - latura / 2}
                  width={latura}
                  height={latura}
                  rx={latura * 0.1}
                  fill={
                    stare.fundal
                      ? `color-mix(in oklab, ${culoareRol(stare.fundal)} 16%, transparent)`
                      : "none"
                  }
                  stroke={stare.inel ? culoareRol(stare.inel) : "none"}
                  strokeWidth={2.5}
                />
              )}
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill={stare.rol ? culoareEticheta(stare.rol) : "var(--text)"}
                transform={
                  scaraCelula === 1
                    ? undefined
                    : `translate(${cx}, ${cy}) scale(${scaraCelula}) translate(${-cx}, ${-cy})`
                }
                style={{
                  font: `${stare.gros ? 700 : 500} ${marime * Math.min(st, 1.5)}px var(--font-mono)`,
                }}
              >
                {stare.text ?? valoare}
              </text>
            </g>
          );
        }),
      )}
    </g>
  );
}

/** Eticheta-pastilă: o afirmație scurtă, încadrată. */
function Pastila({
  x,
  y,
  text,
  rol,
  opacitate,
  st,
  corp = 26,
  plafon = 1.4,
}: {
  x: number;
  y: number;
  text: string;
  rol?: RolViz;
  opacitate: number;
  st: number;
  /** Mărimea literei pe cadru lat; se micșorează pentru pastilele lungi. */
  corp?: number;
  /** Cât are voie să crească pe cadru îngust, ca pastila să nu iasă din cartonaș. */
  plafon?: number;
}) {
  const marime = corp * Math.min(st, plafon);
  const latime = text.length * marime * 0.62 + 60;
  const culoare = rol ? culoareEticheta(rol) : "var(--text-slab)";
  return (
    <g opacity={opacitate}>
      <rect
        x={x - latime / 2}
        y={y - marime}
        width={latime}
        height={marime * 2}
        rx={marime}
        fill="none"
        stroke={culoare}
        strokeWidth={2}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={culoare}
        style={{ font: `700 ${marime}px var(--font-mono)`, letterSpacing: "0.04em" }}
      >
        {text}
      </text>
    </g>
  );
}

/** Cartonașul de fundal al unui panou: suprafață, ramă, colțuri rotunde. */
function Cartonas({
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
  return (
    <rect
      x={x}
      y={y}
      width={latime}
      height={inaltime}
      rx={18}
      fill="var(--suprafata)"
      stroke="var(--bordura)"
      strokeWidth={2}
      opacity={opacitate}
    />
  );
}

/** O bară orizontală de cost, cu colțuri rotunde. */
function Bara({
  x,
  y,
  latime,
  inaltime,
  rol,
  fundal,
}: {
  x: number;
  y: number;
  latime: number;
  inaltime: number;
  rol: RolViz;
  fundal?: boolean;
}) {
  return (
    <>
      {fundal && (
        <rect
          x={x}
          y={y}
          width={latime}
          height={inaltime}
          rx={inaltime / 2}
          fill={`color-mix(in oklab, ${culoareRol("grila")} 45%, transparent)`}
        />
      )}
      <rect
        x={x}
        y={y}
        width={Math.max(0, latime)}
        height={inaltime}
        rx={inaltime / 2}
        fill={culoareRol(rol)}
      />
    </>
  );
}

/* ───────────────────────── scenele ───────────────────────── */

/** 01 + 02 · sistemul și regula lui Cramer. */
function ActCramer({ st }: { st: number }) {
  const { T, cue } = useClip<NumeScena>();
  const t0 = cue.Sistem;
  const tc = cue.Cramer;
  const tl = cue.Laplace;
  if (T < t0 || T >= tl) return null;

  const g = deseneaza(T, tc - 0.5, tc + 0.9);
  const iese = intra(T, t0, tl - 0.1, 0.6);

  // Sistemul: A · x = b, așezat pe un rând centrat. Lățimile sunt fixe, deci
  // pozițiile se pot calcula o dată, aici.
  const stanga = 571;
  const xA = stanga + 180;
  const xNec = stanga + 461;
  const xEgal = stanga + 582;
  const xB = stanga + 703;

  return (
    <g>
      <Antet
        opacitate={intra(T, t0 + 0.1, tc - 0.2, 0.55)}
        titlu={["A·x = b, trei ecuații, trei necunoscute"]}
        nota={["Matricea coeficienților, necunoscutele, termenii liberi. Cum ajungem la x?"]}
        st={st}
      />
      <Antet
        opacitate={intra(T, tc + 0.1, undefined, 0.55)}
        titlu={["Cramer cere n + 1 determinanți"]}
        nota={["Fiecare necunoscută are determinantul ei: coloana j din A se înlocuiește cu b."]}
        st={st}
      />

      <g
        opacity={iese}
        transform={`translate(960, 620) translate(${g * -645}, ${g * -228}) scale(${1 - 0.58 * g}) translate(-960, -620)`}
      >
        <Matrice
          x={xA}
          y={620}
          randuri={A}
          st={st}
          celula={(i, j) => ({
            opacitate: intra(T, t0 + 0.35 + (i * 3 + j) * 0.07, undefined, 0.45),
          })}
        />
        <Matrice
          x={xNec}
          y={620}
          randuri={[["x₁"], ["x₂"], ["x₃"]]}
          corp={34}
          st={st}
          celula={() => ({
            rol: ROL_L,
            gros: true,
            opacitate: intra(T, t0 + 0.9, undefined, 0.5),
          })}
        />
        <text
          x={xEgal}
          y={620}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text)"
          opacity={intra(T, t0 + 1.1, undefined, 0.5)}
          style={{ font: `500 ${52 * Math.min(st, 1.4)}px var(--font-mono)` }}
        >
          =
        </text>
        <Matrice
          x={xB}
          y={620}
          randuri={B.map((v) => [v])}
          st={st}
          celula={() => ({ opacitate: intra(T, t0 + 1.25, undefined, 0.5) })}
        />
      </g>

      {/* Cei patru determinanți: det A și, pentru fiecare necunoscută, det Aʲ. */}
      {[A, coloanaInlocuita(0), coloanaInlocuita(1), coloanaInlocuita(2)].map((m, k) => {
        const la = tc + 1.3 + k * 0.45;
        const o = intra(T, la, tl - 0.1, 0.5);
        const cx = 549 + k * 274;
        return (
          <g key={k} opacity={o}>
            <text
              x={cx}
              y={600}
              textAnchor="middle"
              fill="var(--text-slab)"
              style={{ font: `500 ${24 * Math.min(st, 1.6)}px var(--font-mono)` }}
            >
              {k === 0 ? "det A" : `det A${k}`}
            </text>
            <Matrice
              x={cx}
              y={712}
              randuri={m}
              latura={58}
              scara={salt(T, la)}
              st={st}
              celula={(_i, j) =>
                k > 0 && j === k - 1
                  ? { rol: ROL_L, gros: true, fundal: ROL_L }
                  : { opacitate: 0.75 }
              }
            />
          </g>
        );
      })}

      <Pastila
        x={960}
        y={830}
        text="n + 1 = 4 determinanți, doar pentru n = 3"
        rol={ROL_COST}
        opacitate={intra(T, tc + 3.4, tl - 0.1)}
        st={st}
      />
    </g>
  );
}

/** 03 · Laplace: un determinant naște n determinanți. */
function ActLaplace({ st }: { st: number }) {
  const { T, cue } = useClip<NumeScena>();
  const t0 = cue.Laplace;
  const tE = cue.Explozie;
  if (T < t0 || T >= tE) return null;

  const niveluri = [
    { cate: 1, latura: 74, eticheta: "ordin 4", contor: "1 determinant" },
    { cate: 4, latura: 56, eticheta: "ordin 3", contor: "× 4 = 4" },
    { cate: 12, latura: 38, eticheta: "ordin 2", contor: "× 3 = 12" },
    { cate: 24, latura: 22, eticheta: "ordin 1", contor: "× 2 = 24 = 4!" },
  ];

  let y = 420;

  return (
    <g>
      <Antet
        opacitate={intra(T, t0 + 0.1, undefined, 0.55)}
        titlu={["Un determinant de ordin n cere", "n determinanți de ordin n − 1"]}
        nota={["Și fiecare minor se sparge la fel, până la determinanți de ordin 1."]}
        st={st}
      />

      {niveluri.map((nivel, li) => {
        const inceput = t0 + 0.9 + li * 0.85;
        const centruY = y + nivel.latura / 2;
        y += nivel.latura + 40;

        const bloc = nivel.cate * nivel.latura + (nivel.cate - 1) * 14;
        const total = 190 + 14 + bloc + 18 + 190;
        const stanga = 960 - total / 2;
        const ultimul = li === 3;

        return (
          <g key={nivel.eticheta}>
            <text
              x={stanga + 190}
              y={centruY}
              textAnchor="end"
              dominantBaseline="central"
              fill="var(--text-slab)"
              opacity={intra(T, inceput)}
              style={{ font: `500 ${22 * Math.min(st, 1.7)}px var(--font-mono)` }}
            >
              {nivel.eticheta}
            </text>
            {Array.from({ length: nivel.cate }, (_, i) => {
              const la = inceput + i * 0.035;
              const cx = stanga + 204 + i * (nivel.latura + 14);
              const s = salt(T, la);
              return (
                <rect
                  key={i}
                  x={cx + (nivel.latura * (1 - s)) / 2}
                  y={centruY - (nivel.latura * s) / 2}
                  width={nivel.latura * s}
                  height={nivel.latura * s}
                  rx={7}
                  opacity={intra(T, la, undefined, 0.4)}
                  fill={`color-mix(in oklab, ${culoareRol(li === 0 ? ROL_L : ROL_STINS)} ${li === 0 ? 100 : 22}%, transparent)`}
                  stroke={culoareRol(li === 0 ? ROL_L : ROL_STINS)}
                  strokeWidth={2}
                />
              );
            })}
            <text
              x={stanga + 204 + bloc + 18}
              y={centruY}
              dominantBaseline="central"
              fill={ultimul ? culoareEticheta(ROL_COST) : "var(--text-slab)"}
              opacity={intra(T, inceput + 0.5)}
              style={{ font: `700 ${24 * Math.min(st, 1.6)}px var(--font-mono)` }}
            >
              {nivel.contor}
            </text>
          </g>
        );
      })}

      <text
        x={960}
        y={840}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text)"
        opacity={intra(T, t0 + 4.6)}
        style={{ font: `800 ${52 * Math.min(st, 1.4)}px var(--font-mono)` }}
      >
        n · (n−1) · … · 1 = <tspan fill={culoareEticheta(ROL_COST)}>n!</tspan>
      </text>
    </g>
  );
}

/** 04 · explozia lui n!. */
function ActExplozie({ st }: { st: number }) {
  const { T, cue } = useClip<NumeScena>();
  const t0 = cue.Explozie;
  const tP = cue.Pivot;
  if (T < t0 || T >= tP) return null;

  const randuri = [
    { eticheta: "n = 3", valoare: 6, fractiune: 0.22 },
    { eticheta: "n = 10", valoare: 3628800, fractiune: 0.62 },
    { eticheta: "n = 20", valoare: null, fractiune: 1 },
  ];

  return (
    <g>
      <Antet
        opacitate={intra(T, t0 + 0.1, undefined, 0.55)}
        titlu={["Un determinant costă n! operații"]}
        nota={[
          "Numărul de operații nu crește, sare. Iar n = 20 e un sistem mic —",
          "și Cramer cere n + 1 astfel de determinanți.",
        ]}
        st={st}
      />

      {randuri.map((rand, i) => {
        const la = t0 + 1 + i * 0.9;
        const o = intra(T, la);
        const p = deseneaza(T, la + 0.2, la + 1.7, EASING.iesireCubica);
        const ultimul = i === 2;
        const y = 470 + i * 132;

        return (
          <g key={rand.eticheta} opacity={o} transform={`translate(${(1 - o) * -30}, 0)`}>
            <text
              x={200}
              y={y}
              dominantBaseline="alphabetic"
              fill="var(--text-slab)"
              style={{ font: `700 ${34 * Math.min(st, 1.5)}px var(--font-mono)` }}
            >
              {rand.eticheta}
            </text>
            <text
              x={1720}
              y={y}
              textAnchor="end"
              dominantBaseline="alphabetic"
              fill="var(--text-slab)"
              style={{ font: `500 ${26 * Math.min(st, 1.5)}px var(--font-mono)` }}
            >
              operații
            </text>
            <text
              x={1580}
              y={y}
              textAnchor="end"
              dominantBaseline="alphabetic"
              fill={ultimul ? culoareEticheta(ROL_COST) : "var(--text)"}
              style={{ font: `800 ${58 * Math.min(st, 1.4)}px var(--font-mono)` }}
            >
              {rand.valoare == null ? (
                <>
                  2,4 · 10
                  <tspan style={{ fontSize: "0.6em" }} dy="-0.45em">
                    18
                  </tspan>
                </>
              ) : (
                cuMii(Math.round(p * rand.valoare))
              )}
            </text>
            <Bara
              x={200}
              y={y + 18}
              latime={p * rand.fractiune * 1520}
              inaltime={18}
              rol={ultimul ? ROL_COST : ROL_L}
              fundal
            />
          </g>
        );
      })}
    </g>
  );
}

/** 05 · O(n!) față de O(n³). */
function ActPivot({ st }: { st: number }) {
  const { T, cue } = useClip<NumeScena>();
  const t0 = cue.Pivot;
  const tF = cue.Factorizare;
  if (T < t0 || T >= tF) return null;

  const creste = deseneaza(T, t0 + 0.8, t0 + 2.6, EASING.iesireCubica);
  const mic = deseneaza(T, t0 + 1.4, t0 + 2.4);

  return (
    <g>
      <Antet
        opacitate={intra(T, t0 + 0.1, undefined, 0.55)}
        titlu={["Metodele de mai departe sunt de ordinul O(n³)"]}
        nota={["Aceeași problemă, n = 20: diferența nu e de viteză, e de posibil și imposibil."]}
        st={st}
      />

      <g opacity={intra(T, t0 + 0.6)}>
        <text
          x={200}
          y={520}
          fill={culoareEticheta(ROL_COST)}
          style={{ font: `800 ${46 * Math.min(st, 1.35)}px var(--font-mono)` }}
        >
          Cramer · O(n!) · 2,4 · 10
          <tspan style={{ fontSize: "0.6em" }} dy="-0.45em">
            18
          </tspan>
        </text>
        {/* Bara iese din cadru — exact asta e afirmația. */}
        <Bara x={200} y={550} latime={creste * 2080} inaltime={40} rol={ROL_COST} />
      </g>

      <g opacity={intra(T, t0 + 1.2)}>
        <text
          x={200}
          y={716}
          fill={culoareEticheta(ROL_L)}
          style={{ font: `800 ${46 * Math.min(st, 1.35)}px var(--font-mono)` }}
        >
          LU · O(n³) · 8.000
        </text>
        <Bara x={200} y={746} latime={Math.max(6, mic * 80)} inaltime={40} rol={ROL_L} />
        <text
          x={320}
          y={766}
          dominantBaseline="central"
          fill="var(--text-slab)"
          opacity={intra(T, t0 + 2.2)}
          style={{ font: `500 ${26 * Math.min(st, 1.6)}px var(--font-mono)` }}
        >
          de 3 · 10
          <tspan style={{ fontSize: "0.6em" }} dy="-0.45em">
            14
          </tspan>
          <tspan dy="0.45em"> ori mai puține operații</tspan>
        </text>
      </g>
    </g>
  );
}

/** 06 · factorizarea: A se sparge în L și U. */
function ActFactorizare({ st }: { st: number }) {
  const { T, cue } = useClip<NumeScena>();
  const t0 = cue.Factorizare;
  const tS = cue.Substitutii;
  if (T < t0 || T >= tS) return null;

  const desparte = deseneaza(T, t0 + 3.6, t0 + 5.2);
  const morf = deseneaza(T, t0 + 1.5, t0 + 2.6);
  const formula = intra(T, t0 + 0.2, t0 + 2.2, 0.6);
  const aparA = intra(T, t0 + 1.9, t0 + 4.4, 0.7);

  return (
    <g>
      <Antet
        opacitate={intra(T, t0 + 0.1, undefined, 0.55)}
        titlu={["Aceeași matrice, două triunghiuri"]}
        nota={[
          "L inferior triunghiulară, U superior triunghiulară. Diagonala lui L se fixează",
          "pe 1, ca descompunerea să fie unică.",
        ]}
        st={st}
      />

      <text
        x={960}
        y={560}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text)"
        opacity={formula}
        transform={`translate(960, 560) scale(${salt(T, t0 + 0.2) * (1 - 0.22 * morf)}) translate(-960, ${morf * -40 - 560})`}
        style={{ font: `800 ${96 * Math.min(st, 1.3)}px var(--font-mono)` }}
      >
        A = L · U
      </text>

      <Matrice
        x={960}
        y={580}
        randuri={A}
        opacitate={aparA}
        scara={0.9 + 0.1 * morf}
        st={st}
        celula={(i, j) => ({ opacitate: intra(T, t0 + 2.0 + (i * 3 + j) * 0.05, undefined, 0.4) })}
      />

      {(
        [
          { nume: "L", m: L, directie: -1, rol: ROL_L, descriere: "inferior triunghiulară" },
          { nume: "U", m: U, directie: 1, rol: ROL_U, descriere: "superior triunghiulară" },
        ] as const
      ).map(({ nume, m, directie, rol, descriere }) => (
        <g key={nume} opacity={desparte} transform={`translate(${directie * desparte * 470}, 0)`}>
          <Matrice
            x={960}
            y={580}
            randuri={m}
            st={st}
            celula={(i, j) => {
              const pastrat = nume === "L" ? i >= j : i <= j;
              return pastrat
                ? { rol, gros: true, fundal: rol }
                : { rol: ROL_STINS, opacitate: 0.4 };
            }}
          />
          <text
            x={960}
            y={796}
            textAnchor="middle"
            fill="var(--text)"
            style={{ font: `800 ${44 * Math.min(st, 1.4)}px var(--font-sans)` }}
          >
            {nume}
          </text>
          <text
            x={960}
            y={842}
            textAnchor="middle"
            fill="var(--text-slab)"
            style={{ font: `400 ${26 * Math.min(st, 1.6)}px var(--font-sans)` }}
          >
            {descriere}
          </text>
        </g>
      ))}
    </g>
  );
}

/** 07 · două sisteme triunghiulare. */
function ActSubstitutii({ st }: { st: number }) {
  const { T, cue } = useClip<NumeScena>();
  const t0 = cue.Substitutii;
  const tD = cue.Doolittle;
  if (T < t0 || T >= tD) return null;

  const panouri = [
    {
      titlu: "Pas 1 · Ly = b",
      sub: "substituție înainte, de sus în jos",
      m: L,
      rolM: ROL_L,
      inferior: true,
      vec: Y,
      numeVec: "y",
      drept: B,
      ordine: [0, 1, 2],
      la: t0 + 1.1,
      centru: 503,
    },
    {
      titlu: "Pas 2 · Ux = y",
      sub: "substituție înapoi, de jos în sus",
      m: U,
      rolM: ROL_U,
      inferior: false,
      vec: X,
      numeVec: "x",
      drept: Y,
      ordine: [2, 1, 0],
      la: t0 + 4.2,
      centru: 1417,
    },
  ] as const;

  return (
    <g>
      <Antet
        opacitate={intra(T, t0 + 0.1, undefined, 0.55)}
        titlu={["Un sistem greu devine două sisteme ușoare"]}
        nota={["Notăm y = U·x. Fiecare sistem triunghiular se rezolvă prin substituție, în O(n²)."]}
        st={st}
      />

      {panouri.map((p) => {
        const o = intra(T, p.la - 1.4, undefined, 0.9);
        const ordine: readonly number[] = p.ordine;
        const laPasul = (k: number) => p.la + 0.6 + ordine.indexOf(k) * 0.75;
        const stangaRand = p.centru - 325;

        return (
          <g
            key={p.titlu}
            opacity={o}
            transform={`translate(0, ${(1 - o) * 30}) translate(${p.centru}, 350) scale(${0.97 + 0.03 * o}) translate(${-p.centru}, -350)`}
          >
            <Cartonas x={p.centru - 433} y={350} latime={866} inaltime={545} opacitate={1} />
            <text
              x={p.centru - 397}
              y={418}
              fill={culoareEticheta(p.rolM)}
              style={{ font: `700 ${38 * Math.min(st, 1.4)}px var(--font-mono)` }}
            >
              {p.titlu}
            </text>
            <text
              x={p.centru - 397}
              y={462}
              fill="var(--text-slab)"
              style={{ font: `400 ${28 * Math.min(st, 1.5)}px var(--font-sans)` }}
            >
              {p.sub}
            </text>

            <Matrice
              x={stangaRand + 150}
              y={620}
              randuri={p.m}
              latura={80}
              st={st}
              celula={(i, j) => {
                const activ = intra(T, laPasul(i), undefined, 0.35);
                const inTriunghi = p.inferior ? i >= j : i <= j;
                if (!inTriunghi) return { rol: ROL_STINS, opacitate: 0.35 };
                return { rol: p.rolM, fundal: activ > 0.5 ? p.rolM : undefined };
              }}
            />
            <Matrice
              x={stangaRand + 382}
              y={620}
              randuri={p.vec.map((v) => [v])}
              latura={80}
              st={st}
              celula={(i) => {
                const activ = intra(T, laPasul(i), undefined, 0.35);
                return {
                  text: activ > 0.05 ? String(p.vec[i]) : "?",
                  rol: activ > 0.5 ? ROL_GASIT : ROL_STINS,
                  gros: true,
                  scara: activ > 0.05 ? salt(T, laPasul(i)) : 1,
                };
              }}
            />
            <text
              x={stangaRand + 484}
              y={620}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--text)"
              style={{ font: `500 ${48 * Math.min(st, 1.4)}px var(--font-mono)` }}
            >
              =
            </text>
            <Matrice
              x={stangaRand + 586}
              y={620}
              randuri={p.drept.map((v) => [v])}
              latura={80}
              st={st}
              celula={() => ({ opacitate: 0.8 })}
            />

            <text
              x={p.centru - 397}
              y={828}
              dominantBaseline="central"
              fill="var(--text-slab)"
              style={{ font: `500 ${32 * Math.min(st, 1.4)}px var(--font-mono)` }}
            >
              {p.numeVec} = [
              {p.vec
                .map((v, i) => (intra(T, laPasul(i), undefined, 0.35) > 0.5 ? String(v) : "·"))
                .join(", ")}
              ]
            </text>
            <Pastila x={p.centru + 320} y={828} text="O(n²)" rol={p.rolM} opacitate={1} st={st} />
          </g>
        );
      })}
    </g>
  );
}

/** 08 · LU se sparge în trei metode, apoi cadrul se mută pe Doolittle. */
function ActDoolittle({ st }: { st: number }) {
  const { T, cue } = useClip<NumeScena>();
  const t0 = cue.Doolittle;
  const tA = cue.AlteMetode;
  if (T < t0 || T >= tA) return null;

  const mutare = deseneaza(T, t0 + 2.4, t0 + 3.7);
  const puls = 0.5 + 0.5 * Math.sin((T - t0) * 3.2);
  const nume = ["Crout", "Doolittle", "Cholesky"];
  const detaliu = intra(T, t0 + 3.6, undefined, 0.7);

  return (
    <g>
      <Antet
        opacitate={intra(T, t0 + 0.1, t0 + 2.6, 0.55)}
        titlu={["Factorizarea LU se sparge în trei metode"]}
        nota={["Toate trei dau același A = L · U; diferă doar prin ce se fixează dinainte."]}
        st={st}
      />
      <Antet
        opacitate={intra(T, t0 + 3.0, undefined, 0.55)}
        titlu={["Noi am folosit Doolittle"]}
        nota={["Diagonala lui L a fost pusă pe 1 — de acolo ies toate celelalte elemente."]}
        st={st}
      />

      <g transform={`translate(${mutare * -420}, ${mutare * -85}) scale(${1 - 0.1 * mutare})`}>
        {nume.map((n, k) => {
          const alNostru = n === "Doolittle";
          const o = intra(T, t0 + 0.5 + k * 0.4, undefined, 0.6);
          const x = 960 + (k - 1) * 420;
          const dx = alNostru ? 0 : mutare * (k === 0 ? -70 : 70);
          const dy = (1 - o) * 22 + (alNostru ? 0 : mutare * -40);
          const scara = alNostru ? 1 + 0.12 * mutare : 0.9;
          return (
            <text
              key={n}
              x={x}
              y={520}
              textAnchor="middle"
              dominantBaseline="central"
              fill={alNostru ? culoareEticheta(ROL_L) : "var(--text)"}
              opacity={o * (alNostru ? 1 : Math.max(0, 1 - 1.6 * mutare))}
              transform={`translate(${x + dx}, ${520 + dy}) scale(${scara}) translate(${-x}, ${-520})`}
              style={{
                font: `800 ${(alNostru ? 74 : 62) * Math.min(st, 1.3)}px var(--font-sans)`,
              }}
            >
              {n}
            </text>
          );
        })}
      </g>

      <g opacity={detaliu} transform={`translate(0, ${(1 - detaliu) * 26})`}>
        <Matrice
          x={620}
          y={655}
          randuri={L}
          st={st}
          celula={(i, j) => {
            if (i === j)
              return {
                rol: ROL_L,
                gros: true,
                fundal: ROL_L,
                inel: ROL_L,
                scara: 1 + 0.04 * puls,
              };
            return i > j ? {} : { rol: ROL_STINS, opacitate: 0.4 };
          }}
        />
        <text
          x={900}
          y={615}
          fill="var(--text-slab)"
          style={{ font: `400 ${34 * Math.min(st, 1.4)}px var(--font-sans)` }}
        >
          1 pe toată diagonala lui L
        </text>
        <Pastila
          x={1180}
          y={705}
          text="Doolittle are L în nume → 1 pe L"
          rol={ROL_L}
          opacitate={1}
          st={st}
        />
      </g>
    </g>
  );
}

/** 09 · celelalte două metode. */
function ActAlteMetode({ st }: { st: number }) {
  const { T, cue, total } = useClip<NumeScena>();
  const t0 = cue.AlteMetode;
  if (T < t0 || T > total) return null;

  const carduri = [
    { nume: "Doolittle", mnemonic: "L din nume → 1 pe L", fel: "L" },
    { nume: "Crout", mnemonic: "U din nume → 1 pe U", fel: "U" },
    { nume: "Cholesky", mnemonic: "A simetrică, pozitiv definită", fel: "C" },
  ] as const;

  const goala = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  return (
    <g>
      <Antet
        opacitate={intra(T, t0 + 0.1, undefined, 0.55)}
        titlu={["Trei feluri de a fixa diagonala"]}
        nota={[
          "Descompunerea directă are mai multe necunoscute decât ecuații: fixăm o diagonală —",
          "sau cerem ca U să fie transpusa lui L.",
        ]}
        st={st}
      />

      {carduri.map((card, k) => {
        const la = t0 + 0.8 + k * 1.1;
        const o = intra(T, la, undefined, 0.7);
        const centru = 373 + k * 587;
        const alNostru = card.fel !== "C";

        return (
          <g
            key={card.nume}
            opacity={o}
            transform={`translate(0, ${(1 - o) * 34}) translate(${centru}, 420) scale(${0.96 + 0.04 * o}) translate(${-centru}, -420)`}
          >
            <Cartonas x={centru - 273} y={420} latime={546} inaltime={480} opacitate={1} />
            <text
              x={centru - 239}
              y={490}
              fill="var(--text)"
              style={{ font: `800 ${48 * Math.min(st, 1.3)}px var(--font-sans)` }}
            >
              {card.nume}
            </text>
            <Matrice
              x={centru}
              y={655}
              randuri={goala}
              latura={64}
              st={st}
              celula={(i, j) => {
                const jos = i > j;
                if (i === j)
                  return alNostru
                    ? { text: "1", rol: ROL_L, gros: true, fundal: ROL_L, inel: ROL_L }
                    : { text: "l", rol: ROL_L, gros: true, fundal: ROL_L };
                if (card.fel === "C")
                  return jos ? { text: "l" } : { text: "l", rol: ROL_STINS, opacitate: 0.45 };
                return { text: jos ? "l" : "u", opacitate: 0.85 };
              }}
            />
            <Pastila
              x={centru}
              y={812}
              text={card.mnemonic}
              rol={alNostru ? ROL_L : undefined}
              opacitate={intra(T, la + 0.6)}
              st={st}
              corp={22}
              plafon={1.1}
            />
          </g>
        );
      })}
    </g>
  );
}

/* ───────────────────────── desenul întreg ───────────────────────── */

function Desen() {
  const { T, latime, total } = useClip<NumeScena>();
  const st = scaraText(latime);
  const deschidere = intra(T, 0.05, total, 0.5);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      <g opacity={deschidere}>
        <ActCramer st={st} />
        <ActLaplace st={st} />
        <ActExplozie st={st} />
        <ActPivot st={st} />
        <ActFactorizare st={st} />
        <ActSubstitutii st={st} />
        <ActDoolittle st={st} />
        <ActAlteMetode st={st} />
      </g>
    </svg>
  );
}

/* ───────────────────────── piesa întreagă ───────────────────────── */

const SUBTITRARI = [
  {
    la: CUE.Sistem + 2.6,
    pana: CUE.Cramer - 0.2,
    text: "Determinantul pare soluția naturală. Nu este.",
  },
  {
    la: CUE.Cramer + 4.6,
    pana: CUE.Laplace - 0.2,
    text: "Pentru n = 100 ar fi 101 determinanți — și fiecare e o problemă în sine.",
  },
  {
    la: CUE.Explozie + 4.9,
    pana: CUE.Pivot - 0.2,
    text: "De aceea regula lui Cramer nu se folosește niciodată numeric.",
  },
  {
    la: CUE.Factorizare + 5.6,
    pana: CUE.Substitutii - 0.2,
    text: "Nimic nu s-a pierdut: produsul L · U reface exact matricea A.",
  },
  {
    la: CUE.Substitutii + 8.1,
    pana: CUE.Doolittle - 0.3,
    text: "Doi pași mari: descompunerea, apoi cele două sisteme triunghiulare.",
  },
  {
    la: TOTAL - 3.4,
    text: "Aceeași factorizare; diferă doar diagonala pe care o fixăm dinainte.",
  },
] as const;

/**
 * Clipul paginii 1: de ce nu se folosește regula lui Cramer și ce aduce, în
 * locul ei, factorizarea `A = L · U`.
 *
 * **Clip scris în cod, nu randat cu Manim** — a cincea excepție de la regula din
 * `CLAUDE.md`, după paginile 6, 7, 9 și 11, și din același motiv: animația a
 * venit gata făcută ca animație web (`Animatie_LU.html`) și s-a portat ca atare.
 * Ca orice clip, **nu** primește parametrii utilizatorului: exemplul desenat e
 * fix.
 *
 * Față de originalul cu paletă proprie, culorile vin din `viz-roles.ts`, deci
 * clipul se vede corect în ambele teme, iar textele desenului folosesc
 * `culoareEticheta`, nu culoarea de desen.
 *
 * Cifrele nu sunt alese din ochi — vezi comentariul de la §matematica.
 */
export function AnimatiaFactorizariiLu() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație: de ce regula lui Cramer nu se folosește și ce face în locul ei factorizarea LU. " +
        "Întâi apare sistemul A·x = b, apoi cei patru determinanți ceruți de Cramer pentru trei " +
        "necunoscute. Dezvoltarea Laplace se ramifică până la 4! determinanți de ordin 1, iar " +
        "contoarele arată cum sar operațiile: 6 la n = 3, 3.628.800 la n = 10 și 2,4·10¹⁸ la n = 20, " +
        "față de 8.000 pentru o metodă de ordinul n³. Apoi matricea A se desface în două triunghiuri, " +
        "L și U, iar sistemul se rezolvă în doi pași: L·y = b de sus în jos și U·x = y de jos în sus. " +
        "La final, cele trei feluri de a fixa diagonala: Doolittle, Crout și Cholesky."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
