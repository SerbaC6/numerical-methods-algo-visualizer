import { Clip } from "@/components/viz/Clip";
import { useClip } from "@/components/viz/clip-context";
import { Subtitrari } from "@/components/viz/Subtitrari";
import { animeaza, EASING, repere, type Scena } from "@/lib/compozitie";
import { culoareEticheta, culoareRol } from "@/lib/viz-roles";

/* ───────────────────────── timpul ───────────────────────── */

/**
 * Scenele clipului, în ordine. Lista e schița piesei: numele, ordinea și
 * duratele stau aici, iar coregrafia se scrie exclusiv față de `cue.NumeScena`,
 * niciodată față de secunde scrise de mână.
 */
const SCENE = [
  {
    nume: "Titlu",
    durata: 4,
    descriere: "Titlul apare, iar lanțul A = U · S · Vᵀ stă mare în mijlocul cadrului.",
  },
  {
    nume: "Rol",
    durata: 4.5,
    descriere: "Lanțul urcă și se micșorează, apar rolurile fiecărei matrice și panoul geometric.",
  },
  {
    nume: "VT",
    durata: 6,
    descriere: "Vᵀ rotește cercul unitate cu −67,5°, aducând v₁ și v₂ pe axe.",
  },
  {
    nume: "S",
    durata: 6,
    descriere: "S întinde cercul în elipsă, cu valorile singulare pe cele două axe.",
  },
  {
    nume: "U",
    durata: 5,
    descriere: "U rotește elipsa cu +22,5° în spațiul de ieșire.",
  },
  {
    nume: "Final",
    durata: 4.5,
    descriere: "Toate cele trei matrice aprinse deodată, cu recapitularea celor trei mișcări.",
  },
] as const satisfies readonly Scena[];

type NumeScena = (typeof SCENE)[number]["nume"];

/** Reperele, calculate o dată: subtitrările se cheie pe ele, nu pe secunde scrise de mână. */
const { cue: CUE } = repere(SCENE);

/** Cadrul arătat la `prefers-reduced-motion`: elipsa rotită, cu tot lanțul aprins. */
const CADRU_STATIC = 27.5;

/* ───────────────────────── matematica ───────────────────────── */

/**
 * Transformarea desenată e cea a matricei `A = [[1, 2], [0, 1]]`, pentru care
 * DVS se scrie **exact**, fără aproximări:
 *
 * - `AᵀA = [[1, 2], [2, 5]]`, cu valorile proprii `3 ± 2√2 = (1 ± √2)²`;
 * - valorile singulare `s₁ = 1 + √2 ≈ 2,414` și `s₂ = √2 − 1 ≈ 0,414`;
 * - vectorul propriu al lui `AᵀA` pentru `s₁²` are panta `1 + √2`, adică
 *   `arctan(1 + √2) = 67,5°` — de aceea `V` e rotația cu 67,5°, iar `Vᵀ` cea
 *   cu −67,5°;
 * - `U` iese rotația cu 22,5°.
 *
 * **Matricea asta arată și de ce valorile singulare nu sunt valorile proprii**:
 * `A` are ambele valori proprii egale cu 1 (e triunghiulară, cu 1 pe
 * diagonală), în timp ce valorile ei singulare sunt 2,414 și 0,414. Cifrele
 * nu se scriu pe ecran — clipul arată geometria, nu un exemplu numeric — dar
 * ele sunt cele care fixează unghiurile și lungimile de mai jos.
 *
 * Verificat cu descompunerea calculată independent: `U = rot(22,5°)`,
 * `V = rot(67,5°)`, `s = (1+√2, √2−1)`, iar `‖A − U S Vᵀ‖` e la nivelul erorii
 * de virgulă mobilă.
 */
const RAD = Math.PI / 180;
const UNGHI_V = -67.5;
const UNGHI_U = 22.5;
const S1 = 1 + Math.SQRT2;
const S2 = Math.SQRT2 - 1;

type Matrice2 = [[number, number], [number, number]];

const rotatie = (grade: number): Matrice2 => {
  const c = Math.cos(grade * RAD);
  const s = Math.sin(grade * RAD);
  return [
    [c, -s],
    [s, c],
  ];
};

const inmulteste = (A: Matrice2, B: Matrice2): Matrice2 => [
  [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
  [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
];

/** Coloanele lui `V`: direcțiile pe care `A` le întinde exact cu `s₁` și `s₂`. */
const V1: [number, number] = [Math.cos(67.5 * RAD), Math.sin(67.5 * RAD)];
const V2: [number, number] = [-Math.sin(67.5 * RAD), Math.cos(67.5 * RAD)];

/* ───────────────────────── cadrul de desen ───────────────────────── */

const W = 1920;
const H = 1080;

/** Panoul geometric, în partea de jos a cadrului. */
const PW = 880;
const PH = 460;
const PX = (W - PW) / 2;
const PY = 450;
/** Câți pixeli de desen are o unitate din planul matematic. */
const UNITATE = 96;
const CX = PX + PW / 2;
const CY = PY + PH / 2;

/** Lanțul de matrice, sus: patru cartonașe și trei operatori. */
const LAT_CARD = 210;
const INALT_CARD = 150;
const PAS_CARD = 276;
const RAND_Y = 250;

/**
 * Cu cât se îngroașă literele desenului pe un cadru îngust — același truc ca la
 * clipurile paginilor 7 și 9: desenul are 1920 de unități oricât de mic ar fi
 * pe ecran, deci pe telefon literele ar ajunge de câțiva pixeli.
 */
const LATIME_CONFORT = 780;
const SCARA_MAXIMA = 2.4;
const scaraText = (latime: number) =>
  latime ? Math.min(SCARA_MAXIMA, Math.max(1, LATIME_CONFORT / latime)) : 1;

/**
 * Rolurile de culoare, alese o singură dată și folosite peste tot în clip.
 *
 * Paleta n-are culori proprii pentru „U", „S" și „Vᵀ" — și nici n-o să aibă,
 * fiindcă e monocromă pe albastru. Se refolosesc trei roluri existente, cu
 * grijă ca cele trei matrice să rămână distincte în ambele teme:
 *
 * - `curent` (safir) — Vᵀ și cercul care se transformă;
 * - `interval` (chihlimbar/portocaliu) — S și direcția a doua, `v₂ → s₂·u₂`;
 * - `functie` (adânc/cer) — U și direcția întâi, `v₁ → s₁·u₁`.
 */
const ROL_V = "curent" as const;
const ROL_S = "interval" as const;
const ROL_U = "functie" as const;

/* ───────────────────────── panoul geometric ───────────────────────── */

/** Matricea curentă, ca transformare SVG: axa y a ecranului merge în jos. */
const transformarea = (M: Matrice2) =>
  `matrix(${UNITATE * M[0][0]},${-UNITATE * M[1][0]},${UNITATE * M[0][1]},${-UNITATE * M[1][1]},${CX},${CY})`;

const peEcran = (M: Matrice2, x: number, y: number): [number, number] => [
  CX + UNITATE * (M[0][0] * x + M[0][1] * y),
  CY - UNITATE * (M[1][0] * x + M[1][1] * y),
];

/** Eticheta unei direcții: puțin dincolo de vârf și puțin lateral, ca să nu stea pe linie. */
function pozitiaEtichetei(M: Matrice2, v: [number, number]): [number, number] {
  const x = M[0][0] * v[0] + M[0][1] * v[1];
  const y = M[1][0] * v[0] + M[1][1] * v[1];
  const n = Math.max(0.2, Math.hypot(x, y));
  const dx = x / n;
  const dy = y / n;
  return [CX + UNITATE * (x + dx * 0.7 - dy * 0.5), CY - UNITATE * (y + dy * 0.7 + dx * 0.5)];
}

function Panou({
  M,
  etichete,
  eticheta,
  culoareTag,
  st,
}: {
  M: Matrice2;
  /** 0 = „v₁, v₂" (înainte de scalare), 1 = „s₁·u₁, s₂·u₂" (după). */
  etichete: number;
  eticheta: string;
  culoareTag: string;
  st: number;
}) {
  const puncte = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    puncte.push(
      <circle
        key={i}
        cx={Math.cos(a)}
        cy={Math.sin(a)}
        r={0.055}
        fill={culoareRol("anterior")}
        vectorEffect="non-scaling-size"
      />,
    );
  }

  const caroiaj = [];
  for (let i = -4; i <= 4; i++) {
    caroiaj.push(
      <line key={`v${i}`} x1={i} y1={-4} x2={i} y2={4} vectorEffect="non-scaling-stroke" />,
      <line key={`o${i}`} x1={-4} y1={i} x2={4} y2={i} vectorEffect="non-scaling-stroke" />,
    );
  }

  const capat1 = peEcran(M, V1[0], V1[1]);
  const capat2 = peEcran(M, V2[0], V2[1]);
  const et1 = pozitiaEtichetei(M, V1);
  const et2 = pozitiaEtichetei(M, V2);

  return (
    <g>
      <defs>
        <clipPath id="dvs-panou">
          <rect x={PX} y={PY} width={PW} height={PH} rx={20} />
        </clipPath>
      </defs>

      <g clipPath="url(#dvs-panou)">
        <rect x={PX} y={PY} width={PW} height={PH} rx={20} fill="var(--suprafata)" />

        {/* Caroiajul fix al ecranului — reperul față de care se vede mișcarea. */}
        <g stroke={culoareRol("grila")} strokeWidth={1.5}>
          {[-4, -3, -2, -1, 1, 2, 3, 4].map((i) => (
            <line key={`f${i}`} x1={CX + i * UNITATE} y1={PY} x2={CX + i * UNITATE} y2={PY + PH} />
          ))}
          {[-2, -1, 1, 2].map((i) => (
            <line key={`g${i}`} x1={PX} y1={CY + i * UNITATE} x2={PX + PW} y2={CY + i * UNITATE} />
          ))}
        </g>
        <g stroke={culoareRol("grila")} strokeWidth={3}>
          <line x1={PX} y1={CY} x2={PX + PW} y2={CY} />
          <line x1={CX} y1={PY} x2={CX} y2={PY + PH} />
        </g>

        {/* Caroiajul care se transformă odată cu planul. */}
        <g
          transform={transformarea(M)}
          stroke={culoareRol("anterior")}
          strokeWidth={1.5}
          strokeOpacity={0.55}
          fill="none"
        >
          {caroiaj}
        </g>

        <g transform={transformarea(M)}>
          <circle
            cx={0}
            cy={0}
            r={1}
            fill={`color-mix(in oklab, ${culoareRol(ROL_V)} 12%, transparent)`}
            stroke={culoareRol(ROL_V)}
            strokeWidth={3}
            vectorEffect="non-scaling-stroke"
          />
          {puncte}
        </g>

        <g strokeWidth={7} strokeLinecap="round">
          <line x1={CX} y1={CY} x2={capat1[0]} y2={capat1[1]} stroke={culoareRol(ROL_U)} />
          <line x1={CX} y1={CY} x2={capat2[0]} y2={capat2[1]} stroke={culoareRol(ROL_S)} />
        </g>
        <circle cx={capat1[0]} cy={capat1[1]} r={9} fill={culoareRol(ROL_U)} />
        <circle cx={capat2[0]} cy={capat2[1]} r={9} fill={culoareRol(ROL_S)} />

        <g
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ font: `700 ${28 * Math.min(st, 1.9)}px var(--font-mono)` }}
        >
          <g opacity={1 - etichete}>
            <text x={et1[0]} y={et1[1]} fill={culoareEticheta(ROL_U)}>
              v₁
            </text>
            <text x={et2[0]} y={et2[1]} fill={culoareEticheta(ROL_S)}>
              v₂
            </text>
          </g>
          <g opacity={etichete}>
            <text x={et1[0]} y={et1[1]} fill={culoareEticheta(ROL_U)}>
              s₁·u₁
            </text>
            <text x={et2[0]} y={et2[1]} fill={culoareEticheta(ROL_S)}>
              s₂·u₂
            </text>
          </g>
        </g>
      </g>

      <rect
        x={PX}
        y={PY}
        width={PW}
        height={PH}
        rx={20}
        fill="none"
        stroke="var(--bordura)"
        strokeWidth={2}
      />
      <text
        x={PX + 28}
        y={PY + 48}
        fill={culoareTag}
        style={{ font: `800 ${30 * Math.min(st, 1.7)}px var(--font-sans)` }}
      >
        {eticheta}
      </text>
    </g>
  );
}

/* ───────────────────────── lanțul de matrice ───────────────────────── */

/** Un cartonaș din lanț: simbolul, dimensiunea și, sub el, ce face matricea. */
function Cartonas({
  x,
  simbol,
  dimensiune,
  rol,
  culoare,
  culoareText,
  aprins,
  detaliu,
  st,
}: {
  x: number;
  simbol: string;
  dimensiune: string;
  rol: string;
  /** Culoarea de desen a rolului — doar pentru rama cartonașului. */
  culoare: string;
  /**
   * Culoarea de **scris** a aceluiași rol. Nu e o preferință: safirul lui `Vᵀ`
   * ajunge la 2,86:1 ca literă pe suprafața temei întunecate, sub pragul de
   * 4,5:1 al textului de corp, deși ca element grafic e în regulă.
   */
  culoareText: string;
  aprins: boolean;
  detaliu: number;
  st: number;
}) {
  const scara = aprins ? 1.05 : 1;
  return (
    <g transform={`translate(${x}, 0) scale(${scara})`}>
      <rect
        x={-LAT_CARD / 2}
        y={-INALT_CARD / 2}
        width={LAT_CARD}
        height={INALT_CARD}
        rx={18}
        fill="var(--suprafata)"
        stroke={aprins ? culoare : "var(--bordura)"}
        strokeWidth={aprins ? 4 : 2}
      />
      <text
        x={0}
        y={-14}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={culoareText}
        style={{ font: `700 ${54 * Math.min(st, 1.6)}px var(--font-mono)` }}
      >
        {simbol}
      </text>
      <text
        x={0}
        y={38}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--text-slab)"
        style={{ font: `600 ${28 * Math.min(st, 1.8)}px var(--font-sans)` }}
      >
        {dimensiune}
      </text>
      <text
        x={0}
        y={INALT_CARD / 2 + 46}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={aprins ? culoareText : "var(--text-slab)"}
        opacity={detaliu}
        // Singurul text din lanț care **nu** crește la fel de mult pe cadru
        // îngust: „matricea dată" e mai lat decât cartonașul lui, iar mărit ca
        // restul se ciocnește de rolul vecin. Verificat în portret, la 390 px.
        style={{ font: `800 ${30 * Math.min(st, 1.3)}px var(--font-sans)` }}
      >
        {rol}
      </text>
    </g>
  );
}

function Operator({ x, semn, st }: { x: number; semn: string; st: number }) {
  return (
    <text
      x={x}
      y={0}
      textAnchor="middle"
      dominantBaseline="middle"
      fill="var(--text)"
      style={{ font: `700 ${44 * Math.min(st, 1.6)}px var(--font-mono)` }}
    >
      {semn}
    </text>
  );
}

/* ───────────────────────── desenul întreg ───────────────────────── */

function Desen() {
  const { T, cue, latime } = useClip<NumeScena>();
  const st = scaraText(latime);

  // Cele trei mișcări, fiecare cu ceasul ei. Sunt înmulțite în ordinea din
  // formulă: mai întâi rotește Vᵀ, apoi întinde S, apoi rotește U — adică
  // produsul se citește de la dreapta la stânga, exact ca `A = U·S·Vᵀ`.
  const rotV = animeaza({ dela: 0, la: 1, start: cue.VT + 0.9, sfarsit: cue.VT + 3.6 })(T);
  const intinde = animeaza({ dela: 0, la: 1, start: cue.S + 0.7, sfarsit: cue.S + 3.6 })(T);
  const rotU = animeaza({ dela: 0, la: 1, start: cue.U + 0.6, sfarsit: cue.U + 3.2 })(T);

  const scalare: Matrice2 = [
    [1 + (S1 - 1) * intinde, 0],
    [0, 1 + (S2 - 1) * intinde],
  ];
  const M = inmulteste(inmulteste(rotatie(UNGHI_U * rotU), scalare), rotatie(UNGHI_V * rotV));

  const titluIese = animeaza({
    dela: 1,
    la: 0,
    start: cue.Rol - 0.7,
    sfarsit: cue.Rol + 0.1,
    ease: EASING.iesireCubica,
  })(T);
  const randUrca = animeaza({
    dela: 1,
    la: 0,
    start: cue.Rol - 0.7,
    sfarsit: cue.Rol + 0.5,
    ease: EASING.iesireCubica,
  })(T);
  const detaliu = animeaza({
    dela: 0,
    la: 1,
    start: cue.Rol + 0.3,
    sfarsit: cue.Rol + 1.1,
    ease: EASING.iesireCubica,
  })(T);
  const panouIntra = animeaza({
    dela: 0,
    la: 1,
    start: cue.Rol + 1.4,
    sfarsit: cue.Rol + 2.3,
    ease: EASING.iesireCubica,
  })(T);
  const etichete = animeaza({
    dela: 0,
    la: 1,
    start: cue.S + 2.6,
    sfarsit: cue.S + 3.4,
    ease: EASING.iesireCubica,
  })(T);

  const acum: "" | "V" | "S" | "U" | "tot" =
    T >= cue.Final ? "tot" : T >= cue.U ? "U" : T >= cue.S ? "S" : T >= cue.VT ? "V" : "";
  const aprins = (k: "V" | "S" | "U") => acum === "tot" || acum === k;

  const eticheta =
    acum === "V"
      ? "Vᵀ · rotește"
      : acum === "S"
        ? "S · întinde"
        : acum === "U"
          ? "U · rotește"
          : acum === "tot"
            ? "A = U · S · Vᵀ"
            : "cercul unitate · v₁, v₂";
  const culoareTag =
    acum === "V"
      ? culoareEticheta(ROL_V)
      : acum === "S"
        ? culoareEticheta(ROL_S)
        : acum === "U"
          ? culoareEticheta(ROL_U)
          : "var(--text-slab)";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      {/* Titlul mare, cât ține prima scenă. */}
      <g opacity={titluIese}>
        <text
          x={W / 2}
          y={150}
          textAnchor="middle"
          fill="var(--text)"
          style={{ font: `800 ${72 * Math.min(st, 1.35)}px var(--font-sans)` }}
        >
          Descompunerea valorilor singulare
        </text>
        <text
          x={W / 2}
          y={222}
          textAnchor="middle"
          fill={culoareEticheta("curent")}
          style={{ font: `600 ${36 * Math.min(st, 1.35)}px var(--font-sans)` }}
        >
          Ce face, de fapt, fiecare matrice?
        </text>
      </g>

      {/* Același titlu, mic, după ce lanțul urcă. */}
      <text
        x={W / 2}
        y={104}
        textAnchor="middle"
        fill="var(--text)"
        opacity={1 - titluIese}
        style={{ font: `800 ${40 * Math.min(st, 1.45)}px var(--font-sans)` }}
      >
        DVS · Descompunerea valorilor singulare
      </text>

      {/* Lanțul de matrice. În prima scenă stă jos și mare, ca formulă-erou;
          apoi urcă și se micșorează, făcând loc panoului. */}
      <g
        transform={`translate(${W / 2}, ${RAND_Y + 250 * randUrca}) scale(${1 + 0.22 * randUrca})`}
      >
        <Cartonas
          x={-1.5 * PAS_CARD}
          simbol="A"
          dimensiune="m×n"
          rol="matricea dată"
          culoare="var(--text)"
          culoareText="var(--text)"
          aprins={acum === "tot"}
          detaliu={detaliu}
          st={st}
        />
        <Operator x={-PAS_CARD / 2 - LAT_CARD / 2 - 33} semn="=" st={st} />
        <Cartonas
          x={-0.5 * PAS_CARD}
          simbol="U"
          dimensiune="m×m"
          rol="rotește"
          culoare={culoareRol(ROL_U)}
          culoareText={culoareEticheta(ROL_U)}
          aprins={aprins("U")}
          detaliu={detaliu}
          st={st}
        />
        <Operator x={0} semn="·" st={st} />
        <Cartonas
          x={0.5 * PAS_CARD}
          simbol="S"
          dimensiune="m×n"
          rol="întinde"
          culoare={culoareRol(ROL_S)}
          culoareText={culoareEticheta(ROL_S)}
          aprins={aprins("S")}
          detaliu={detaliu}
          st={st}
        />
        <Operator x={PAS_CARD} semn="·" st={st} />
        <Cartonas
          x={1.5 * PAS_CARD}
          simbol="Vᵀ"
          dimensiune="n×n"
          rol="rotește"
          culoare={culoareRol(ROL_V)}
          culoareText={culoareEticheta(ROL_V)}
          aprins={aprins("V")}
          detaliu={detaliu}
          st={st}
        />
      </g>

      <g opacity={panouIntra} transform={`translate(0, ${26 * (1 - panouIntra)})`}>
        <Panou M={M} etichete={etichete} eticheta={eticheta} culoareTag={culoareTag} st={st} />
      </g>
    </svg>
  );
}

/* ───────────────────────── piesa întreagă ───────────────────────── */

const SUBTITRARI = [
  {
    la: CUE.Rol + 0.4,
    text: "Orice matrice A face trei lucruri: rotește, întinde, apoi rotește din nou.",
  },
  {
    la: CUE.VT + 0.5,
    text: "Vᵀ rotește spațiul de intrare: aduce pe axe direcțiile v₁ și v₂, vectorii proprii ai lui AᵀA.",
  },
  {
    la: CUE.S + 0.5,
    text: "S întinde fiecare axă cu valoarea ei singulară, s₁ ≥ s₂: cercul devine elipsă.",
  },
  {
    la: CUE.U + 0.5,
    text: "U rotește elipsa în spațiul de ieșire — abia acum se vede ce face A cu planul.",
  },
  {
    la: CUE.Final + 0.5,
    text: "Rotație → întindere → rotație, citite de la dreapta la stânga, exact ca în A = U·S·Vᵀ.",
  },
] as const;

/**
 * Clipul paginii 11: ce face, geometric, fiecare dintre cele trei matrice ale DVS.
 *
 * **Clip scris în cod, nu randat cu Manim** — a patra excepție de la regula din
 * `CLAUDE.md`, după paginile 6, 7 și 9, și din același motiv: animația a venit
 * gata făcută ca animație web (`Animatie DVS.html`) și s-a portat ca atare. Ca
 * orice clip, **nu** primește parametrii utilizatorului: transformarea desenată
 * e fixă.
 *
 * Față de originalul de pe fundal alb, culorile vin din `viz-roles.ts`, deci
 * clipul se vede corect în ambele teme, iar textele desenului folosesc
 * `culoareEticheta`, nu culoarea de desen.
 *
 * Unghiurile și lungimile nu sunt alese din ochi: sunt DVS-ul exact al matricei
 * `A = [[1, 2], [0, 1]]` — vezi comentariul de la §matematica.
 */
export function AnimatiaDvs() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație: descompunerea A = U·S·Vᵀ, arătată ca trei mișcări ale planului. " +
        "Un cerc unitate, cu două direcții marcate pe el, e mai întâi rotit de Vᵀ până când cele două " +
        "direcții cad pe axe; S întinde apoi fiecare axă cu valoarea ei singulară, iar cercul devine " +
        "elipsă; la final U rotește elipsa în poziția ei din spațiul de ieșire. Cele trei mișcări se " +
        "citesc de la dreapta la stânga, în ordinea din formulă."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
