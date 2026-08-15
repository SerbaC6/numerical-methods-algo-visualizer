import { baleiazaH } from "@/algorithms/derivare-numerica/eroare";
import { getFormula } from "@/algorithms/derivare-numerica/formule";
import { getFunctie } from "@/algorithms/functii";
import { Clip } from "@/components/viz/Clip";
import { useClip } from "@/components/viz/clip-context";
import { Subtitrari } from "@/components/viz/Subtitrari";
import { animeaza, clamp, EASING, repere, type Scena } from "@/lib/compozitie";
import { stiintific, zecimale } from "@/lib/numere";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";
import { marimeCareIncape } from "@/lib/tipografie-clip";

/* ───────────────────────── timpul ───────────────────────── */

const SCENE = [
  {
    nume: "Secanta",
    durata: 10,
    descriere:
      "Tangenta în punct și secanta prin două puncte depărtate: derivata numerică înlocuiește panta uneia cu panta celeilalte.",
  },
  {
    nume: "Micsorare",
    durata: 12,
    descriere:
      "Pasul scade, iar secanta se rotește peste tangentă. Eroarea scade proporțional cu pasul.",
  },
  {
    nume: "Simetric",
    durata: 11,
    descriere:
      "Formula cu punct de mijloc ia doi vecini simetrici și nu folosește deloc valoarea din punct; eroarea trece de la h la h².",
  },
  {
    nume: "Podeaua",
    durata: 13,
    descriere:
      "Sub un anumit pas, eroarea crește la loc: scăderea a două valori aproape egale nu mai lasă cifre bune.",
  },
] as const satisfies readonly Scena[];

type NumeScena = (typeof SCENE)[number]["nume"];
const { cue: CUE, total: TOTAL } = repere(SCENE);
const CADRU_STATIC = CUE.Podeaua + 9;

/* ───────────────────────── cifrele ───────────────────────── */

/**
 * **Sursa: `cursuri_MN/derivare-integrare-numerica_curs11.md`**, partea de
 * derivare. Nimic scris din memorie; cifrele se calculează la încărcare, cu
 * modulele reale, ca desenul și textul să nu se poată contrazice.
 *
 * Funcția e `x³ − 2x − 5` din catalogul paginii 6 (curs 6). Alegerea nu e
 * estetică, ci **matematică**: formulele cu trei puncte sunt exacte pe
 * polinoamele de grad cel mult 2, fiindcă termenul lor de eroare conține
 * derivata a treia. Pe o parabolă, scena a treia ar arăta o eroare de ordinul
 * lui 10⁻¹⁶, iar curba erorii n-ar mai avea nicio pantă de arătat — adică exact
 * ce trebuie să se vadă ar dispărea. Pe cubică, derivata a treia e 6, deci
 * ordinul doi se vede ca ordin doi.
 */
const FUNCTIE = getFunctie("cub");
const X0 = 1.3;
const EXACT = FUNCTIE.fDerivat(X0);

const INAINTE = getFormula("inainte");
const MIJLOC = getFormula("mijloc");

const CURBA_INAINTE = baleiazaH(INAINTE, FUNCTIE.f, X0, EXACT, { hMax: 1, hMin: 1e-13 });
const CURBA_MIJLOC = baleiazaH(MIJLOC, FUNCTIE.f, X0, EXACT, { hMax: 1, hMin: 1e-13 });

/* ───────────────────────── roluri ───────────────────────── */

const ROL_CURBA = "functie" as const;
const ROL_TANGENTA = "solutie" as const;
const ROL_SECANTA = "curent" as const;
const ROL_NOD = "anterior" as const;

/* ───────────────────────── cadrul ───────────────────────── */

const W = 1920;
const H = 1080;
const scaraText = (latime: number) => (latime ? Math.min(2.4, Math.max(1, 780 / latime)) : 1);
const felie = (T: number, a: number, b: number) => (T >= a && T < b ? 1 : 0);
const intra = (T: number, la: number, durata = 0.45) =>
  animeaza({ dela: 0, la: 1, start: la, sfarsit: la + durata, ease: EASING.iesireCubica })(T);

/* Zona de desen a graficului cu funcția. */
const GRAFIC = { x: 150, y: 240, latime: 900, inaltime: 570 };
const DOMENIU_X: readonly [number, number] = [0.3, 2.3];
const DOMENIU_Y: readonly [number, number] = [-7, 3];

const laX = (x: number) =>
  GRAFIC.x + ((x - DOMENIU_X[0]) / (DOMENIU_X[1] - DOMENIU_X[0])) * GRAFIC.latime;
const laY = (y: number) =>
  GRAFIC.y +
  GRAFIC.inaltime -
  ((y - DOMENIU_Y[0]) / (DOMENIU_Y[1] - DOMENIU_Y[0])) * GRAFIC.inaltime;

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
        {simbol}
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
    <text
      x={W / 2}
      y={912}
      textAnchor="middle"
      opacity={opacitate}
      fill="var(--text)"
      style={{ font: `700 ${38 * Math.min(st, 1.25)}px var(--font-sans)` }}
    >
      {copii}
    </text>
  );
}

/** Graficul funcției, cu axele lui. */
function Grafic({ opacitate }: { opacitate: number }) {
  const puncte: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const x = DOMENIU_X[0] + ((DOMENIU_X[1] - DOMENIU_X[0]) * i) / 200;
    puncte.push(`${laX(x).toFixed(1)},${laY(FUNCTIE.f(x)).toFixed(1)}`);
  }

  return (
    <g opacity={opacitate}>
      <line
        x1={GRAFIC.x}
        x2={GRAFIC.x + GRAFIC.latime}
        y1={laY(0)}
        y2={laY(0)}
        stroke="var(--text-slab)"
        strokeWidth={3}
      />
      <line
        x1={laX(0)}
        x2={laX(0)}
        y1={GRAFIC.y}
        y2={GRAFIC.y + GRAFIC.inaltime}
        stroke="var(--text-slab)"
        strokeWidth={3}
      />
      <polyline
        points={puncte.join(" ")}
        fill="none"
        stroke={culoareRol(ROL_CURBA)}
        strokeWidth={6}
        strokeLinejoin="round"
      />
    </g>
  );
}

/** O dreaptă prin `(x₀, f(x₀))` cu panta dată, tăiată la marginile graficului. */
function Dreapta({
  panta,
  rol,
  punctata = false,
  opacitate = 1,
  grosime = 5,
}: {
  panta: number;
  rol: RolViz;
  punctata?: boolean;
  opacitate?: number;
  grosime?: number;
}) {
  const y0 = FUNCTIE.f(X0);
  const stanga = DOMENIU_X[0];
  const dreapta = DOMENIU_X[1];
  return (
    <line
      x1={laX(stanga)}
      y1={laY(y0 + panta * (stanga - X0))}
      x2={laX(dreapta)}
      y2={laY(y0 + panta * (dreapta - X0))}
      stroke={culoareRol(rol)}
      strokeWidth={grosime}
      strokeDasharray={punctata ? "16 12" : undefined}
      opacity={opacitate}
      strokeLinecap="round"
    />
  );
}

function Nod({
  x,
  rol,
  eticheta,
  opacitate = 1,
  st,
}: {
  x: number;
  rol: RolViz;
  eticheta?: string;
  opacitate?: number;
  st: number;
}) {
  return (
    <g opacity={opacitate}>
      <circle
        cx={laX(x)}
        cy={laY(FUNCTIE.f(x))}
        r={13}
        fill={culoareRol(rol)}
        stroke="var(--fundal)"
        strokeWidth={4}
      />
      {eticheta && (
        <text
          x={laX(x)}
          y={laY(FUNCTIE.f(x)) + 48}
          textAnchor="middle"
          fill={culoareEticheta(rol)}
          style={{ font: `700 ${30 * Math.min(st, 1.4)}px var(--font-mono)` }}
        >
          {eticheta}
        </text>
      )}
    </g>
  );
}

/* Graficul log-log din ultima scenă. */
const V = { x: 260, y: 210, latime: 1400, inaltime: 470 };
const LOG_H = { max: 0, min: -13 };
const LOG_E = { max: 1, min: -12 };
const vX = (h: number) => V.x + ((LOG_H.max - Math.log10(h)) / (LOG_H.max - LOG_H.min)) * V.latime;
const vY = (e: number) =>
  V.y + ((LOG_E.max - Math.log10(e)) / (LOG_E.max - LOG_E.min)) * V.inaltime;

function CurbaV({
  curba,
  rol,
  pana,
  grosime = 6,
}: {
  curba: typeof CURBA_INAINTE;
  rol: RolViz;
  /** Cât din curbă e desenată, de la stânga la dreapta. */
  pana: number;
  grosime?: number;
}) {
  const puncte = curba.puncte.filter((p) => p.eroare > 0);
  const câte = Math.max(2, Math.floor(puncte.length * clamp(pana, 0, 1)));
  return (
    <polyline
      points={puncte
        .slice(0, câte)
        .map((p) => `${vX(p.h).toFixed(1)},${vY(p.eroare).toFixed(1)}`)
        .join(" ")}
      fill="none"
      stroke={culoareRol(rol)}
      strokeWidth={grosime}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}

/* ───────────────────────── desenul ───────────────────────── */

function Desen() {
  const { T, cue, latime } = useClip<NumeScena>();
  const st = scaraText(latime);

  /* 1 · secanta */
  const S = cue.Secanta;
  const oSec = felie(T, S, cue.Micsorare);
  const H_MARE = 0.8;
  const pantaMare = INAINTE.aproximeaza(FUNCTIE.f, X0, H_MARE);
  const oTangenta = intra(T, S + 1.4, 0.7);
  const oSecanta = intra(T, S + 3.4, 0.7);

  /* 2 · micșorarea */
  const M = cue.Micsorare;
  const oMic = felie(T, M, cue.Simetric);
  const hMic = animeaza({ dela: H_MARE, la: 0.05, start: M + 1.2, sfarsit: M + 7.2 })(T);
  const pantaMic = INAINTE.aproximeaza(FUNCTIE.f, X0, hMic);
  const eroareMic = Math.abs(pantaMic - EXACT);

  /* 3 · simetric */
  const I = cue.Simetric;
  const oSim = felie(T, I, cue.Podeaua);
  const H_SIM = 0.55;
  const pantaSim = MIJLOC.aproximeaza(FUNCTIE.f, X0, H_SIM);
  const oVecini = intra(T, I + 1.2, 0.7);
  const oPanta = intra(T, I + 3.4, 0.7);

  /* 4 · podeaua */
  const P = cue.Podeaua;
  const oPod = felie(T, P, TOTAL + 1);
  const trasare = animeaza({ dela: 0, la: 1, start: P + 1.0, sfarsit: P + 6.0 })(T);
  const oMinim = intra(T, P + 6.4, 0.6);
  const oMijloc = intra(T, P + 8.2, 0.7);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      {/* ═══ 1 · secanta ═══ */}
      <Antet opacitate={oSec} titlu="Tangentă și secantă" st={st} />
      <g opacity={oSec}>
        <Grafic opacitate={1} />
        <Dreapta panta={EXACT} rol={ROL_TANGENTA} punctata opacitate={oTangenta} />
        <g opacity={oSecanta}>
          <Dreapta panta={pantaMare} rol={ROL_SECANTA} />
          <Nod x={X0 + H_MARE} rol={ROL_NOD} eticheta="x₀+h" st={st} />
        </g>
        <Nod x={X0} rol={ROL_SECANTA} eticheta="x₀" st={st} />

        <Cartonas
          x={1180}
          y={300}
          latime={620}
          opacitate={oTangenta}
          rol={ROL_TANGENTA}
          simbol={`f′(x₀) = ${zecimale(EXACT, 2)}`}
          text="Panta căutată"
          st={st}
        />
        <Cartonas
          x={1180}
          y={470}
          latime={620}
          opacitate={oSecanta}
          rol={ROL_SECANTA}
          simbol={`panta = ${zecimale(pantaMare, 2)}`}
          text="Ce dă formula cu h = 0,8"
          st={st}
        />
      </g>
      <Concluzie
        opacitate={oSec * intra(T, S + 6.4, 0.5)}
        st={st}
        copii="Derivata numerică schimbă panta tangentei cu panta unei secante."
      />

      {/* ═══ 2 · micșorarea ═══ */}
      <Antet opacitate={oMic} titlu="Pasul scade" st={st} />
      <g opacity={oMic}>
        <Grafic opacitate={1} />
        <Dreapta panta={EXACT} rol={ROL_TANGENTA} punctata />
        <Dreapta panta={pantaMic} rol={ROL_SECANTA} />
        <Nod x={X0 + hMic} rol={ROL_NOD} st={st} />
        <Nod x={X0} rol={ROL_SECANTA} eticheta="x₀" st={st} />

        <Cartonas
          x={1180}
          y={300}
          latime={620}
          opacitate={1}
          rol={ROL_SECANTA}
          simbol={`h = ${zecimale(hMic, 3)}`}
          text="Al doilea punct se apropie"
          st={st}
        />
        <Cartonas
          x={1180}
          y={470}
          latime={620}
          opacitate={1}
          rol={ROL_TANGENTA}
          simbol={`eroare = ${zecimale(eroareMic, 3)}`}
          text="Scade odată cu pasul, proporțional"
          st={st}
        />
      </g>
      <Concluzie
        opacitate={oMic * intra(T, M + 8.4, 0.5)}
        st={st}
        copii="Jumătate din pas înseamnă jumătate din eroare — asta e ordinul întâi."
      />

      {/* ═══ 3 · simetric ═══ */}
      <Antet opacitate={oSim} titlu="Doi vecini, simetric" st={st} />
      <g opacity={oSim}>
        <Grafic opacitate={1} />
        <Dreapta panta={EXACT} rol={ROL_TANGENTA} punctata />
        <g opacity={oPanta}>
          <Dreapta panta={pantaSim} rol={ROL_SECANTA} />
        </g>
        <g opacity={oVecini}>
          <Nod x={X0 - H_SIM} rol={ROL_NOD} eticheta="x₀−h" st={st} />
          <Nod x={X0 + H_SIM} rol={ROL_NOD} eticheta="x₀+h" st={st} />
        </g>
        <Nod x={X0} rol={ROL_NOD} eticheta="x₀" opacitate={0.35} st={st} />

        <Cartonas
          x={1180}
          y={300}
          latime={620}
          opacitate={oVecini}
          rol={ROL_NOD}
          simbol="x₀ nu apare"
          text="Formula folosește doar vecinii"
          st={st}
        />
        <Cartonas
          x={1180}
          y={470}
          latime={620}
          opacitate={oPanta}
          rol={ROL_TANGENTA}
          simbol={`eroare = ${stiintific(Math.abs(pantaSim - EXACT), 2)}`}
          text={`La același h = ${zecimale(H_SIM, 2)}`}
          st={st}
        />
      </g>
      <Concluzie
        opacitate={oSim * intra(T, I + 6.4, 0.5)}
        st={st}
        copii="Simetria anulează termenul de ordinul h: eroarea scade acum pătratic."
      />

      {/* ═══ 4 · podeaua ═══ */}
      <Antet opacitate={oPod} titlu="Unde se strică" st={st} />
      <g opacity={oPod}>
        {/* Grila log-log, doar cât să se citească ordinele de mărime. */}
        <g stroke={culoareRol("grila")} strokeWidth={2} opacity={0.4}>
          {[0, -3, -6, -9, -12].map((e) => (
            <line key={`h${e}`} x1={vX(10 ** e)} x2={vX(10 ** e)} y1={V.y} y2={V.y + V.inaltime} />
          ))}
          {[0, -3, -6, -9, -12].map((e) => (
            <line key={`e${e}`} x1={V.x} x2={V.x + V.latime} y1={vY(10 ** e)} y2={vY(10 ** e)} />
          ))}
        </g>
        {[0, -3, -6, -9, -12].map((e) => (
          <text
            key={`et${e}`}
            x={vX(10 ** e)}
            y={V.y + V.inaltime + 46}
            textAnchor="middle"
            fill="var(--text-slab)"
            style={{ font: `600 ${28 * Math.min(st, 1.4)}px var(--font-mono)` }}
          >
            10{indiceSus(e)}
          </text>
        ))}
        <text
          x={V.x + V.latime / 2}
          y={V.y + V.inaltime + 106}
          textAnchor="middle"
          fill="var(--text-slab)"
          style={{ font: `600 ${30 * Math.min(st, 1.4)}px var(--font-sans)` }}
        >
          pasul h, tot mai mic →
        </text>

        <CurbaV curba={CURBA_INAINTE} rol={ROL_SECANTA} pana={trasare} />
        <g opacity={oMijloc}>
          <CurbaV curba={CURBA_MIJLOC} rol={ROL_TANGENTA} pana={1} grosime={5} />
        </g>

        <g opacity={oMinim}>
          <circle
            cx={vX(CURBA_INAINTE.hOptim)}
            cy={vY(CURBA_INAINTE.eroareMinima)}
            r={14}
            fill={culoareRol(ROL_SECANTA)}
            stroke="var(--fundal)"
            strokeWidth={4}
          />
          <text
            x={vX(CURBA_INAINTE.hOptim)}
            y={vY(CURBA_INAINTE.eroareMinima) + 62}
            textAnchor="middle"
            fill={culoareEticheta(ROL_SECANTA)}
            style={{ font: `700 ${30 * Math.min(st, 1.35)}px var(--font-mono)` }}
          >
            {`h ≈ ${stiintific(CURBA_INAINTE.hOptim, 0)}`}
          </text>
        </g>
      </g>
      <Concluzie
        opacitate={oPod * intra(T, P + 9.8, 0.5)}
        st={st}
        copii="Sub pasul cel mai bun, scăderea a două valori aproape egale nu mai lasă cifre bune."
      />
    </svg>
  );
}

const CIFRE_SUS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "-": "⁻",
};
const indiceSus = (e: number) => [...String(e)].map((c) => CIFRE_SUS[c] ?? c).join("");

/* ───────────────────────── piesa întreagă ───────────────────────── */

const SUBTITRARI = [
  {
    la: CUE.Secanta + 0.4,
    text: "Derivata în x₀ e panta tangentei — dar tangenta nu se poate calcula direct.",
  },
  {
    la: CUE.Secanta + 3.6,
    text: "Se ia încă un punct, la distanța h, și se măsoară panta secantei.",
  },
  {
    la: CUE.Micsorare + 0.4,
    text: "Cu cât al doilea punct e mai aproape, cu atât secanta seamănă mai bine cu tangenta.",
  },
  {
    la: CUE.Micsorare + 6.0,
    text: "Eroarea scade proporțional cu h: jumătate de pas, jumătate de eroare.",
  },
  {
    la: CUE.Simetric + 0.4,
    text: "Cu doi vecini, câte unul de fiecare parte, formula devine simetrică.",
  },
  {
    la: CUE.Simetric + 3.6,
    text: "Valoarea din x₀ nici nu intră în formulă — și totuși eroarea e mult mai mică.",
  },
  {
    la: CUE.Podeaua + 0.4,
    text: "Pe scări logaritmice, eroarea coboară pe o dreaptă: panta ei e ordinul formulei.",
  },
  { la: CUE.Podeaua + 6.2, text: "Dar sub un anumit pas, eroarea urcă la loc." },
  {
    la: CUE.Podeaua + 8.4,
    text: "Formula simetrică ajunge mai jos, însă se lovește de aceeași podea.",
  },
  { la: TOTAL - 3.0, text: "Nu există „h cât mai mic”: există un h cel mai bun." },
] as const;

/**
 * Clipul paginii 16: de ce derivata numerică merge, și de unde încolo nu mai merge.
 *
 * Scris în cod, ca toate clipurile site-ului, cu cifrele calculate din modulele
 * reale — inclusiv curba erorii, care e chiar rezultatul unei baleieri după `h`,
 * nu un desen aproximativ.
 *
 * Ca orice clip, **nu** primește parametrii utilizatorului: funcția și punctul
 * sunt fixe. Alegerea funcției, a lui `x₀` și tragerea de `h` sunt treaba
 * interfeței de mai jos.
 */
export function AnimatiaDerivarii() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație: derivarea numerică. Derivata în x₀ e panta tangentei, dar tangenta nu se poate " +
        "calcula direct, așa că se ia încă un punct la distanța h și se măsoară panta secantei. Când " +
        "pasul scade, secanta se rotește peste tangentă, iar eroarea scade proporțional cu h. Cu doi " +
        "vecini simetrici, câte unul de fiecare parte, formula nu mai folosește deloc valoarea din " +
        "x₀, iar eroarea scade pătratic. La final, eroarea desenată pe scări logaritmice coboară pe " +
        "o dreaptă a cărei pantă e chiar ordinul formulei — până la un pas optim, sub care urcă la " +
        "loc, fiindcă scăderea a două valori aproape egale nu mai lasă cifre semnificative."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
