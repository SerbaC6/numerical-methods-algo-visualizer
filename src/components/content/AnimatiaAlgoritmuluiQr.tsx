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
    nume: "Observatie",
    durata: 9.5,
    descriere:
      "Matricea simetrică tridiagonală: a-urile de pe diagonală, b-urile vecine, apoi observația că un b nul eliberează o valoare proprie.",
  },
  {
    nume: "Rotatii",
    durata: 17,
    descriere:
      "Trei momente: ce este P₂ (identitatea cu patru elemente schimbate), ce face înmulțirea P₂·A și de unde vine noul element (2,1), ce rămâne în matrice.",
  },
  {
    nume: "Factorizare",
    durata: 6.5,
    descriere: "A = Q·R: Q ortogonală, R superior triunghiulară, plus scopul descompunerii.",
  },
  {
    nume: "Asemanare",
    durata: 6,
    descriere: "Formula A⁽ⁱ⁺¹⁾ = R⁽ⁱ⁾Q⁽ⁱ⁾ = Q⁽ⁱ⁾ᵀA⁽ⁱ⁾Q⁽ⁱ⁾ și cele trei proprietăți păstrate.",
  },
  {
    nume: "Convergenta",
    durata: 7,
    descriere:
      "b-urile scad la 0, diagonala devine lista valorilor proprii și se enunță scopul algoritmului.",
  },
] as const satisfies readonly Scena[];

type NumeScena = (typeof SCENE)[number]["nume"];

const { cue: CUE, total: TOTAL } = repere(SCENE);

/**
 * Cadrul arătat la `prefers-reduced-motion`: matricea deja diagonală, cu toate
 * cele patru valori proprii aprinse. E capătul poveștii, deci se ține singur.
 */
const CADRU_STATIC = CUE.Convergenta + 5;

/* ───────────────────────── conținutul simbolic ───────────────────────── */

/**
 * **Sursa: `cursuri_MN/qr_dvs_teorie_curs8.md`, §1–§3.** Nimic scris din
 * memorie; notația (`a₁…aₙ` pe diagonală, `b₂…bₙ` vecine) e chiar a cursului.
 *
 * Tiparele de zerouri desenate mai jos nu sunt decorative, sunt afirmații
 * matematice, deci au fost verificate numeric pe 200 de matrici tridiagonale
 * generate la întâmplare, cu factorizarea construită exact ca în §3
 * (`R = Pₙ⋯P₂A`, `Q = P₂ᵀ⋯Pₙᵀ`):
 *
 * - `Q` iese **Hessenberg superioară** — zerouri fix la (3,1), (4,1) și (4,2);
 * - `R` iese superior triunghiulară **de lățime 3**, deci colțul (1,4) e zero;
 * - `P₂·A` are (2,1) = 0 și o singură umplere, la (1,3).
 */
const A_RANDURI = [
  ["a₁", "b₂", "0", "0"],
  ["b₂", "a₂", "b₃", "0"],
  ["0", "b₃", "a₃", "b₄"],
  ["0", "0", "b₄", "a₄"],
];

const IDENTITATE = [
  ["1", "0", "0", "0"],
  ["0", "1", "0", "0"],
  ["0", "0", "1", "0"],
  ["0", "0", "0", "1"],
];

/** `p₁₁ = p₂₂ = cosΘ`, `p₁₂ = −p₂₁ = sinΘ` — convenția de semn e cea din curs. */
const P2_RANDURI = [
  ["cosΘ", "sinΘ", "0", "0"],
  ["−sinΘ", "cosΘ", "0", "0"],
  ["0", "0", "1", "0"],
  ["0", "0", "0", "1"],
];

/** Ce rămâne după `P₂·A`: (2,1) stins, o singură umplere la (1,3). */
const P2A_RANDURI = [
  ["a₁", "b₂", "×", "0"],
  ["0", "a₂", "b₃", "0"],
  ["0", "b₃", "a₃", "b₄"],
  ["0", "0", "b₄", "a₄"],
];

const Q_RANDURI = [
  ["q₁₁", "q₁₂", "q₁₃", "q₁₄"],
  ["q₂₁", "q₂₂", "q₂₃", "q₂₄"],
  ["0", "q₃₂", "q₃₃", "q₃₄"],
  ["0", "0", "q₄₃", "q₄₄"],
];

const R_RANDURI = [
  ["r₁₁", "r₁₂", "r₁₃", "0"],
  ["0", "r₂₂", "r₂₃", "r₂₄"],
  ["0", "0", "r₃₃", "r₃₄"],
  ["0", "0", "0", "r₄₄"],
];

/* ───────────────────────── rolurile de culoare ───────────────────────── */

/**
 * Paleta n-are culori proprii pentru „element de pe diagonală" și „vecin al
 * diagonalei", și nici n-o să aibă — e monocromă pe albastru. Se refolosesc
 * roluri existente, alese ca cele două familii de cifre să rămână distincte în
 * ambele teme:
 *
 * - `functie` — `a₁…a₄`, cifrele de pe diagonală, cele care devin valori proprii;
 * - `curent` (safir) — `b₂…b₄`, vecinii diagonalei, cei care trebuie stinși;
 * - `anterior` — zerourile, estompate, fără culoare proprie;
 * - `solutie` — elementul **eliminat** și, la final, valorile proprii citite;
 * - `interval` — elementul **nou**, cel care apare deasupra diagonalei.
 *
 * Ultimele două sunt singurele care ies din albastru, exact ca la celelalte
 * clipuri, și nu apar pline una peste alta în niciun cadru.
 */
const ROL_A = "functie" as const;
const ROL_B = "curent" as const;
const ROL_ZERO = "anterior" as const;
const ROL_STINS = "solutie" as const;
const ROL_NOU = "interval" as const;

/* ───────────────────────── cadrul de desen ───────────────────────── */

const W = 1920;
const H = 1080;

/**
 * Cu cât se îngroașă literele desenului pe un cadru îngust — același truc ca la
 * clipurile paginilor 7, 9 și 11: desenul are 1920 de unități oricât de mic ar
 * fi pe ecran, deci pe telefon literele ar ajunge de câțiva pixeli.
 */
const LATIME_CONFORT = 780;
const SCARA_MAXIMA = 2.4;
const scaraText = (latime: number) =>
  latime ? Math.min(SCARA_MAXIMA, Math.max(1, LATIME_CONFORT / latime)) : 1;

/* ───────────────────────── ajutoare de timp ───────────────────────── */

/** 1 cât timp `T` e în felia `[a, b)`, 0 în rest — comutatorul dintre momente. */
const felie = (T: number, a: number, b: number) => (T >= a && T < b ? 1 : 0);

/** Intrare simplă: de la 0 la 1 în `durata` secunde, începând cu `la`. */
const intra = (T: number, la: number, durata = 0.45) =>
  animeaza({ dela: 0, la: 1, start: la, sfarsit: la + durata, ease: EASING.iesireCubica })(T);

/** Un accent scurt care crește și se stinge — pentru „uită-te aici acum". */
function accent(T: number, la: number, durata = 0.9) {
  const u = clamp((T - la) / durata, 0, 1);
  return u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI);
}

/* ───────────────────────── piese de desen ───────────────────────── */

/** Starea unei celule: ce culoare are cifra și dacă e aprinsă acum. */
type StareCelula = { rol?: RolViz; aprins?: number; inel?: RolViz; opacitate?: number };

type ProprietatiMatrice = {
  x: number;
  y: number;
  randuri: string[][];
  stari?: Record<string, StareCelula>;
  opacitate: number;
  latura?: number;
  corp?: number;
  nume?: string;
  eticheta?: string;
  scara?: number;
  st: number;
};

const SPATIU = 6;

/**
 * Matricea desenată: parantezele, grila de celule și, opțional, numele deasupra
 * plus o etichetă dedesubt.
 *
 * Nu e `MatrixGrid` din `viz/`: aceea primește `steps[]` și are stări de celulă
 * legate de un algoritm care rulează. Aici nu rulează nimic — clipul e o funcție
 * pură de timp, iar celulele poartă simboluri, nu numere.
 */
function Matrice({
  x,
  y,
  randuri,
  stari = {},
  opacitate,
  latura = 100,
  corp = 27,
  nume,
  eticheta,
  scara = 1,
  st,
}: ProprietatiMatrice) {
  const coloane = randuri[0]?.length ?? 0;
  const latime = coloane * latura + (coloane - 1) * SPATIU;
  const inaltime = randuri.length * latura + (randuri.length - 1) * SPATIU;
  const stanga = -latime / 2;
  const sus = -inaltime / 2;
  const bratul = 18;

  const celule = randuri.flatMap((rand, r) =>
    rand.map((text, c) => {
      const stare = stari[`${r},${c}`] ?? {};
      const rol = stare.rol ?? (text === "0" ? ROL_ZERO : r === c ? ROL_A : ROL_B);
      const aprins = stare.aprins ?? 0;
      const cx = stanga + c * (latura + SPATIU) + latura / 2;
      const cy = sus + r * (latura + SPATIU) + latura / 2;

      return (
        <g key={`${r},${c}`} opacity={stare.opacitate ?? 1}>
          {aprins > 0 && (
            <rect
              x={cx - latura / 2}
              y={cy - latura / 2}
              width={latura}
              height={latura}
              rx={10}
              fill={`color-mix(in oklab, ${culoareRol(stare.inel ?? rol)} ${(16 * aprins).toFixed(1)}%, transparent)`}
              stroke={culoareRol(stare.inel ?? rol)}
              strokeWidth={2.5 * aprins}
            />
          )}
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill={culoareEticheta(rol)}
            style={{ font: `600 ${corp * Math.min(st, 1.5)}px var(--font-mono)` }}
          >
            {text}
          </text>
        </g>
      );
    }),
  );

  return (
    <g transform={`translate(${x}, ${y}) scale(${scara})`} opacity={opacitate}>
      {/* Parantezele. Desenate cu linii, nu cu un font: la 1920 de unități, o
          paranteză tipografică s-ar subția până la dispariție. */}
      <g stroke="var(--text)" strokeWidth={5} fill="none" strokeLinecap="square">
        <path
          d={`M ${stanga - 26 + bratul} ${sus - 16} H ${stanga - 26} V ${sus + inaltime + 16} H ${stanga - 26 + bratul}`}
        />
        <path
          d={`M ${stanga + latime + 26 - bratul} ${sus - 16} H ${stanga + latime + 26} V ${sus + inaltime + 16} H ${stanga + latime + 26 - bratul}`}
        />
      </g>

      {celule}

      {nume && (
        <text
          x={0}
          y={sus - 56}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text)"
          style={{ font: `800 ${34 * Math.min(st, 1.5)}px var(--font-sans)` }}
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
          style={{ font: `600 ${23 * Math.min(st, 1.6)}px var(--font-sans)` }}
        >
          {eticheta}
        </text>
      )}
    </g>
  );
}

/** Antetul din colțul de sus-stânga: numărul momentului și titlul lui. */
function Antet({ opacitate, numar, titlu, st }: OpAntet) {
  return (
    <g opacity={opacitate}>
      <text
        x={120}
        y={84}
        fill={culoareEticheta("curent")}
        style={{
          font: `700 ${22 * Math.min(st, 1.5)}px var(--font-mono)`,
          letterSpacing: "0.16em",
        }}
      >
        {numar}
      </text>
      <text
        x={120}
        y={144}
        fill="var(--text)"
        style={{ font: `800 ${46 * Math.min(st, 1.4)}px var(--font-sans)` }}
      >
        {titlu}
      </text>
    </g>
  );
}

type OpAntet = { opacitate: number; numar: string; titlu: string; st: number };

/** Un cartonaș din coloana din dreapta: dungă colorată, simbol, explicație. */
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
        y={inaltime / 2 - 22}
        dominantBaseline="central"
        fill={rol ? culoareEticheta(rol) : "var(--text)"}
        style={{
          font: `700 ${32 * Math.min(st, 1.4)}px var(--font-mono)`,
          letterSpacing: "0.05em",
        }}
      >
        {simbol}
      </text>
      <text
        x={32}
        y={inaltime / 2 + 28}
        dominantBaseline="central"
        fill="var(--text)"
        style={{ font: `600 ${24 * Math.min(st, 1.5)}px var(--font-sans)` }}
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
      style={{ font: `700 ${34 * Math.min(st, 1.3)}px var(--font-sans)` }}
    >
      {copii}
    </text>
  );
}

/* ───────────────────────── desenul întreg ───────────────────────── */

function Desen() {
  const { T, cue, latime } = useClip<NumeScena>();
  const st = scaraText(latime);

  /* ── 1 · matricea de start ── */
  const O = cue.Observatie;
  const oObs = felie(T, O, cue.Rotatii);
  const aDiag = accent(T, O + 0.9, 2.2);
  const aVecini = accent(T, O + 3.6, 2.2);
  const aB2 = accent(T, O + 6.4, 1.4);
  const aB4 = accent(T, O + 7.6, 1.4);

  const stariObs: Record<string, StareCelula> = {};
  for (let d = 0; d < 4; d++) stariObs[`${d},${d}`] = { aprins: aDiag, inel: ROL_A };
  for (const [r, c] of [
    [0, 1],
    [1, 0],
    [1, 2],
    [2, 1],
    [2, 3],
    [3, 2],
  ]) {
    stariObs[`${r},${c}`] = { aprins: aVecini, inel: ROL_B };
  }
  stariObs["0,1"] = { aprins: Math.max(aVecini, aB2), inel: ROL_B };
  stariObs["1,0"] = { aprins: Math.max(aVecini, aB2), inel: ROL_B };
  stariObs["2,3"] = { aprins: Math.max(aVecini, aB4), inel: ROL_B };
  stariObs["3,2"] = { aprins: Math.max(aVecini, aB4), inel: ROL_B };

  const oDefinitii = felie(T, O, O + 6.1) * intra(T, O + 0.8, 0.5);
  const oImplicatii = felie(T, O + 6.1, cue.Rotatii) * intra(T, O + 6.1);
  const oTinta = felie(T, O, O + 6.0) * intra(T, O + 0.5, 0.6);

  /* ── 2 · rotațiile Givens, în trei momente ── */
  const R0 = cue.Rotatii;
  const R_INMULTIRE = R0 + 4.5;
  const R_REZULTAT = R0 + 12.0;
  const R_FINAL = cue.Factorizare;
  const oRot = felie(T, R0, R_FINAL);

  const oCeEste = felie(T, R0, R_INMULTIRE);
  const rotita = T >= R0 + 1.5;
  const aSchimb = accent(T, R0 + 1.5, 1.8);
  const stariP: Record<string, StareCelula> = {};
  for (const k of ["0,0", "0,1", "1,0", "1,1"]) stariP[k] = { aprins: aSchimb, inel: ROL_B };

  const oInmultire = felie(T, R_INMULTIRE, R_REZULTAT);
  const aAlege = intra(T, R_INMULTIRE + 0.4, 0.6);
  const stariLinie: Record<string, StareCelula> = {};
  const stariColoana: Record<string, StareCelula> = {};
  for (let j = 0; j < 4; j++) {
    stariLinie[`1,${j}`] = { aprins: aAlege, inel: ROL_B };
    stariColoana[`${j},0`] = { aprins: aAlege, inel: ROL_B };
  }
  const oProdus = oInmultire * intra(T, R_INMULTIRE + 2.2, 0.5);
  const oAlegereUnghi = oInmultire * intra(T, R_INMULTIRE + 4.0, 0.6);

  const oRezultat = felie(T, R_REZULTAT, R_FINAL);
  const aStins = accent(T, R_REZULTAT + 0.5, 1.6);
  const aNou = accent(T, R_REZULTAT + 2.0, 1.6);
  const stariRezultat: Record<string, StareCelula> = {
    "1,0": { rol: ROL_STINS, aprins: aStins, inel: ROL_STINS },
    "0,2": { rol: ROL_NOU, aprins: aNou, inel: ROL_NOU },
  };

  /* ── 3 · factorizarea ── */
  const F = cue.Factorizare;
  const oFact = felie(T, F, cue.Asemanare);
  const oQ = oFact * intra(T, F + 0.6, 0.4);
  const oR = oFact * intra(T, F + 1.3, 0.4);
  const oDeCe = oFact * intra(T, F + 2.9, 0.55);

  /* ── 4 · pasul iterației ── */
  const S = cue.Asemanare;
  const oPas = felie(T, S, cue.Convergenta);
  const proprietati = [
    { text: "rămâne simetrică", la: S + 1.5 },
    { text: "rămâne tridiagonală", la: S + 2.2 },
    { text: "aceleași valori proprii", la: S + 2.9 },
  ];

  /* ── 5 · convergența ── */
  const V = cue.Convergenta;
  const oConv = felie(T, V, TOTAL + 1);
  const stingere = clamp((T - V - 0.6) / 1.8, 0, 1);
  const citire = clamp((T - V - 2.0) / 1.8, 0, 1);
  const oScop = intra(T, V + 4.3, 0.5);
  const vecin = (indice: string) =>
    stingere > 0.66 ? "0" : (stingere > 0.33 ? "ε" : "b") + indice;
  const randuriConv = [
    [citire > 0.15 ? "λ₁" : "a₁", vecin("₂"), "0", "0"],
    [vecin("₂"), citire > 0.35 ? "λ₂" : "a₂", vecin("₃"), "0"],
    ["0", vecin("₃"), citire > 0.55 ? "λ₃" : "a₃", vecin("₄")],
    ["0", "0", vecin("₄"), citire > 0.75 ? "λ₄" : "a₄"],
  ];
  const palire = 1 - 0.75 * stingere;
  const stariConv: Record<string, StareCelula> = {
    "0,1": { opacitate: palire },
    "1,0": { opacitate: palire },
    "1,2": { opacitate: palire },
    "2,1": { opacitate: palire },
    "2,3": { opacitate: palire },
    "3,2": { opacitate: palire },
  };
  for (let d = 0; d < 4; d++) {
    const gata = citire > 0.15 + d * 0.2;
    stariConv[`${d},${d}`] = gata
      ? { rol: ROL_STINS, aprins: accent(T, V + 1.9 + d * 0.28, 0.8), inel: ROL_STINS }
      : { rol: ROL_A };
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      {/* ═══ 1 · matricea de start ═══ */}
      <Antet opacitate={oObs} numar="1" titlu="Matricea de start" st={st} />
      <Matrice
        x={animeaza({ dela: 760, la: 700, start: O, sfarsit: O + 1.6 })(T)}
        y={560}
        randuri={A_RANDURI}
        stari={stariObs}
        opacitate={oObs}
        latura={104}
        scara={0.92 + 0.08 * oObs}
        eticheta="simetrică tridiagonală"
        st={st}
      />
      <g opacity={oObs * oDefinitii}>
        <Card
          x={1180}
          y={360}
          latime={620}
          inaltime={124}
          opacitate={intra(T, O + 0.9, 0.5)}
          rol={ROL_A}
          simbol="a₁ a₂ a₃ a₄"
          text="elementele de pe diagonală"
          st={st}
        />
        <Card
          x={1180}
          y={512}
          latime={620}
          inaltime={124}
          opacitate={intra(T, O + 3.6, 0.5)}
          rol={ROL_B}
          simbol="b₂ b₃ b₄"
          text="vecinii diagonalei, la stânga și la dreapta"
          st={st}
        />
      </g>
      <g opacity={oObs * oImplicatii}>
        <Card
          x={1180}
          y={380}
          latime={620}
          inaltime={124}
          opacitate={intra(T, O + 6.3, 0.5)}
          rol={ROL_B}
          simbol="b₂ = 0"
          text="a₁ este valoare proprie"
          st={st}
        />
        <Card
          x={1180}
          y={532}
          latime={620}
          inaltime={124}
          opacitate={intra(T, O + 7.5, 0.5)}
          rol={ROL_B}
          simbol="b₄ = 0"
          text="a₄ este valoare proprie"
          st={st}
        />
      </g>
      <Concluzie
        opacitate={oObs * oTinta}
        st={st}
        copii={
          <>
            Unde vrem să ajungem:{" "}
            <tspan fill={culoareEticheta(ROL_STINS)}>matricea diagonală</tspan>, cu valorile proprii
            pe diagonală.
          </>
        }
      />

      {/* ═══ 2 · rotațiile Givens ═══ */}
      <Antet opacitate={oRot} numar="2" titlu="Rotațiile Givens" st={st} />

      {/* 2a — ce este P₂ */}
      <Matrice
        x={960}
        y={560}
        randuri={rotita ? P2_RANDURI : IDENTITATE}
        stari={stariP}
        opacitate={oCeEste}
        latura={112}
        corp={26}
        nume="P₂"
        eticheta={rotita ? "identitatea, cu patru elemente schimbate" : "matricea identitate"}
        st={st}
      />

      {/* 2b — ce face înmulțirea */}
      <Matrice
        x={420}
        y={560}
        randuri={P2_RANDURI}
        stari={stariLinie}
        opacitate={oInmultire}
        latura={94}
        corp={22}
        nume="P₂"
        eticheta="linia 2"
        st={st}
      />
      <text
        x={730}
        y={560}
        textAnchor="middle"
        dominantBaseline="central"
        opacity={oInmultire}
        fill="var(--text-slab)"
        style={{ font: `600 ${44 * Math.min(st, 1.4)}px var(--font-mono)` }}
      >
        ·
      </text>
      <Matrice
        x={1010}
        y={560}
        randuri={A_RANDURI}
        stari={stariColoana}
        opacitate={oInmultire}
        latura={94}
        corp={24}
        nume="A"
        eticheta="coloana 1"
        st={st}
      />
      <g opacity={oProdus}>
        <text
          x={1310}
          y={560}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-slab)"
          style={{ font: `600 ${44 * Math.min(st, 1.4)}px var(--font-mono)` }}
        >
          →
        </text>
        <rect
          x={1380}
          y={470}
          width={420}
          height={190}
          rx={14}
          fill="var(--suprafata)"
          stroke={culoareRol(ROL_B)}
          strokeWidth={3}
        />
        <text
          x={1590}
          y={512}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-slab)"
          style={{ font: `600 ${21 * Math.min(st, 1.5)}px var(--font-sans)` }}
        >
          noul element (2,1)
        </text>
        <text
          x={1590}
          y={566}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text)"
          style={{ font: `700 ${30 * Math.min(st, 1.4)}px var(--font-mono)` }}
        >
          −sinΘ · a₁ + cosΘ · b₂
        </text>
        <text
          x={1590}
          y={622}
          textAnchor="middle"
          dominantBaseline="central"
          opacity={oAlegereUnghi}
          fill="var(--text-slab)"
          style={{ font: `600 ${21 * Math.min(st, 1.5)}px var(--font-sans)` }}
        >
          Θ se alege ca suma să fie 0
        </text>
      </g>

      {/* 2c — ce rămâne */}
      <Matrice
        x={700}
        y={560}
        randuri={P2A_RANDURI}
        stari={stariRezultat}
        opacitate={oRezultat}
        latura={104}
        nume="P₂A"
        eticheta="aproape tridiagonală"
        st={st}
      />
      <g opacity={oRezultat}>
        <Card
          x={1180}
          y={420}
          latime={620}
          inaltime={124}
          opacitate={intra(T, R_REZULTAT + 0.5, 0.45)}
          rol={ROL_STINS}
          simbol="(2,1) = 0"
          text="b₂ de sub diagonală a fost eliminat"
          st={st}
        />
        <Card
          x={1180}
          y={572}
          latime={620}
          inaltime={124}
          opacitate={intra(T, R_REZULTAT + 2.0, 0.45)}
          rol={ROL_NOU}
          simbol="(1,3) ≠ 0"
          text="apare un element nou, deasupra diagonalei"
          st={st}
        />
      </g>

      {/* ═══ 3 · factorizarea ═══ */}
      <Antet opacitate={oFact} numar="3" titlu="Factorizarea A = QR" st={st} />
      <Matrice
        x={392}
        y={560}
        randuri={A_RANDURI}
        opacitate={oFact}
        nume="A"
        eticheta="tridiagonală"
        st={st}
      />
      <text
        x={690}
        y={560}
        textAnchor="middle"
        dominantBaseline="central"
        opacity={Math.min(oFact, oQ)}
        fill="var(--text-slab)"
        style={{ font: `600 ${44 * Math.min(st, 1.4)}px var(--font-mono)` }}
      >
        =
      </text>
      <Matrice
        x={960}
        y={560}
        randuri={Q_RANDURI}
        opacitate={oQ}
        corp={24}
        nume="Q"
        eticheta="ortogonală"
        st={st}
      />
      <text
        x={1244}
        y={560}
        textAnchor="middle"
        dominantBaseline="central"
        opacity={oR}
        fill="var(--text-slab)"
        style={{ font: `600 ${44 * Math.min(st, 1.4)}px var(--font-mono)` }}
      >
        ·
      </text>
      <Matrice
        x={1528}
        y={560}
        randuri={R_RANDURI}
        opacitate={oR}
        corp={24}
        nume="R"
        eticheta="superior triunghiulară"
        st={st}
      />
      <Concluzie
        opacitate={oDeCe}
        st={st}
        copii="Din Q și R construim pasul următor, fără să schimbăm valorile proprii."
      />

      {/* ═══ 4 · pasul iterației ═══ */}
      <Antet opacitate={oPas} numar="4" titlu="Pasul iterației" st={st} />
      <text
        x={W / 2}
        y={500}
        textAnchor="middle"
        dominantBaseline="central"
        opacity={oPas}
        fill="var(--text)"
        style={{
          font: `700 ${56 * Math.min(st, 1.25)}px var(--font-mono)`,
          letterSpacing: "-0.03em",
        }}
      >
        A⁽ⁱ⁺¹⁾ = R⁽ⁱ⁾Q⁽ⁱ⁾ = Q⁽ⁱ⁾ᵀ A⁽ⁱ⁾ Q⁽ⁱ⁾
      </text>
      <g opacity={oPas}>
        {proprietati.map((p, i) => {
          const o = intra(T, p.la, 0.45);
          const lat = 430;
          const x = W / 2 + (i - 1) * (lat + 28) - lat / 2;
          return (
            <g key={p.text} opacity={o} transform={`translate(0, ${(1 - o) * 14})`}>
              <rect
                x={x}
                y={640}
                width={lat}
                height={86}
                rx={43}
                fill="var(--suprafata)"
                stroke="var(--bordura)"
                strokeWidth={2}
              />
              <text
                x={x + lat / 2}
                y={684}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--text)"
                style={{ font: `600 ${26 * Math.min(st, 1.4)}px var(--font-sans)` }}
              >
                <tspan fill={culoareEticheta(ROL_STINS)}>✓ </tspan>
                {p.text}
              </text>
            </g>
          );
        })}
      </g>

      {/* ═══ 5 · convergența ═══ */}
      <Antet opacitate={oConv} numar="5" titlu="Convergența" st={st} />
      <Matrice
        x={780}
        y={560}
        randuri={randuriConv}
        stari={stariConv}
        opacitate={oConv}
        latura={104}
        eticheta="A⁽ⁱ⁾ a devenit diagonală"
        st={st}
      />
      <g opacity={oConv}>
        {["λ₁", "λ₂", "λ₃", "λ₄"].map((l, i) => (
          <Card
            key={l}
            x={1250}
            y={340 + i * 122}
            latime={540}
            inaltime={98}
            opacitate={intra(T, V + 1.9 + i * 0.28, 0.4)}
            rol={ROL_STINS}
            simbol={l}
            text={`valoare proprie ${i + 1}`}
            st={st}
          />
        ))}
      </g>
      <Concluzie
        opacitate={oConv * oScop}
        st={st}
        copii={
          <>
            Scopul: matricea diagonală cu{" "}
            <tspan fill={culoareEticheta(ROL_STINS)}>toate valorile proprii</tspan> ale lui A.
          </>
        }
      />
    </svg>
  );
}

/* ───────────────────────── piesa întreagă ───────────────────────── */

const SUBTITRARI = [
  { la: CUE.Observatie + 0.4, text: "a₁ … aₙ stau pe diagonala principală." },
  {
    la: CUE.Observatie + 3.6,
    text: "b₂ … bₙ sunt vecinii diagonalei, la stânga și la dreapta.",
  },
  {
    la: CUE.Observatie + 6.4,
    text: "Când un b devine 0, a-ul de lângă el este o valoare proprie.",
  },
  { la: CUE.Rotatii + 0.3, text: "Pornim de la matricea identitate." },
  {
    la: CUE.Rotatii + 1.8,
    text: "P₂ schimbă doar patru elemente, în liniile 1 și 2: cosΘ, sinΘ, −sinΘ, cosΘ.",
  },
  {
    la: CUE.Rotatii + 4.5,
    text: "Înmulțim P₂ cu A: fiecare element nou este o linie a lui P₂ ori o coloană a lui A.",
  },
  { la: CUE.Rotatii + 7.4, text: "Elementul (2,1) iese −sinΘ·a₁ + cosΘ·b₂." },
  {
    la: CUE.Rotatii + 9.8,
    text: "Unghiul Θ se alege exact astfel încât acest element să devină 0.",
  },
  {
    la: CUE.Rotatii + 12.0,
    text: "Un element de sub diagonală dispare, unul nou apare deasupra.",
  },
  {
    la: CUE.Rotatii + 14.8,
    text: "Repetăm cu P₃ … Pₙ — din aceste rotații se obțin Q și R.",
  },
  { la: CUE.Factorizare + 0.4, text: "Q este ortogonală, R este superior triunghiulară." },
  {
    la: CUE.Asemanare + 0.4,
    text: "Înmulțite în ordine inversă, R·Q păstrează valorile proprii și micșorează b-urile.",
  },
  { la: CUE.Convergenta + 0.4, text: "După câțiva pași, b₂ … bₙ sunt practic 0." },
  { la: CUE.Convergenta + 4.0, text: "Pe diagonală rămân valorile proprii λ₁ … λₙ." },
] as const;

/**
 * Clipul paginii 10: cum ajunge algoritmul QR la toate valorile proprii deodată.
 *
 * **Clip scris în cod, nu randat cu Manim** — aceeași excepție de la regula din
 * `CLAUDE.md` ca la paginile 7, 9 și 11, și din același motiv: animația a venit
 * gata făcută ca animație web (`Algoritmul QR.html`) și s-a portat ca atare. Ca
 * orice clip, **nu** primește parametrii utilizatorului: matricea desenată e
 * simbolică și fixă.
 *
 * Față de originalul de pe fundal alb, culorile vin din `viz-roles.ts`, deci
 * clipul se vede corect în ambele teme, iar cifrele din celule folosesc
 * `culoareEticheta`, nu culoarea de desen — sunt text, nu marcaje.
 *
 * Conținutul matematic e verificat, nu transcris pe încredere: vezi comentariul
 * de la §conținutul simbolic pentru tiparele lui `Q`, `R` și `P₂A`.
 */
export function AnimatiaAlgoritmuluiQr() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație: cum ajunge algoritmul QR la valorile proprii. Se pornește de la o matrice " +
        "simetrică tridiagonală, cu a₁…a₄ pe diagonală și b₂…b₄ vecine, și de la observația că un b " +
        "nul face din a-ul de lângă el o valoare proprie. Urmează rotația Givens P₂ — identitatea cu " +
        "patru elemente schimbate —, înmulțirea P₂·A din care iese noul element (2,1) egal cu " +
        "−sinΘ·a₁ + cosΘ·b₂, și unghiul ales exact cât să-l anuleze; în locul lui apare un element " +
        "nou deasupra diagonalei. Din toate rotațiile se obțin Q ortogonală și R superior " +
        "triunghiulară, iar înmulțite în ordine inversă dau pasul următor, care păstrează simetria, " +
        "banda tridiagonală și valorile proprii. La final b-urile se sting și pe diagonală rămân " +
        "λ₁ … λ₄."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
