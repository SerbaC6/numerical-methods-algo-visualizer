import { coboara, df, f, varfuri } from "@/algorithms/metode-de-gradient/peisaj-1d";
import { Clip } from "@/components/viz/Clip";
import { useClip } from "@/components/viz/clip-context";
import { Subtitrari } from "@/components/viz/Subtitrari";
import { animeaza, clamp, EASING, type Scena } from "@/lib/compozitie";
import { culoareEticheta, culoareRol } from "@/lib/viz-roles";

/* ───────────────────────── timpul ───────────────────────── */

/**
 * Scenele clipului, în ordine. **Lista asta e schița piesei**: numele, ordinea
 * și duratele stau aici, iar coregrafia de mai jos se scrie exclusiv față de
 * `cue.NumeScena`, niciodată față de secunde scrise de mână.
 */
const SCENE = [
  {
    nume: "Peisaj",
    durata: 3.6,
    descriere: "Se trasează relieful f(x) cu trei dealuri, iar dealurile primesc etichete.",
  },
  {
    nume: "Panta",
    durata: 4.0,
    descriere: "Bila cade pe coasta dealului din dreapta; apar tangenta și pasul α·r^(k).",
  },
  {
    nume: "Coborare",
    durata: 7.5,
    descriere: "Iterația coboară coasta pas cu pas, iar camera se apropie și urmărește bila.",
  },
  {
    nume: "MinimLocal",
    durata: 3.4,
    descriere: "Pașii se micșorează până se opresc, iar un steag marchează minimul local.",
  },
  {
    nume: "Lectie",
    durata: 5.5,
    descriere: "Camera revine la cadrul larg și o a doua pornire ajunge în minimul global.",
  },
] as const satisfies readonly Scena[];

/** Cadrul arătat la `prefers-reduced-motion`: ambele stegulețe pe ecran, camera largă. */
const CADRU_STATIC = 23.5;

/* ───────────────────────── iterația ───────────────────────── */

/** Pasul fix din animație. Cursul îl alege prin line search — vezi teoria de sub clip. */
const ALFA = 0.35;

/** Pornirea care cade în valea din dreapta, cea mai puțin adâncă. */
const DRUM_CAPCANA = coboara(4.9, ALFA, 10);
/** Pornirea din stânga, care ajunge în minimul global. */
const DRUM_BUN = coboara(-4.9, ALFA, 12);

/** Cât ține un pas pe ecran, în secunde, la fiecare dintre cele două rulări. */
const RITM_CAPCANA = 0.75;
const RITM_BUN = 0.24;

/** Cât din durata unui pas ține alunecarea; restul e răgazul de citire. */
const PARTE_ALUNECARE = 0.72;

/**
 * Unde e bila la momentul `T` și câți pași s-au încheiat până acolo.
 *
 * `k` numără pașii **terminați**, nu pe cel în curs: din el se ia câte urme
 * rămân pe coastă, iar o urmă apare în momentul în care bila chiar a ajuns
 * acolo, nu când a plecat spre ea.
 */
function mers(drum: readonly number[], T: number, start: number, ritm: number) {
  const ultim = drum.length - 1;
  const asezat = (k: number) => ({ x: drum[k] ?? 0, k });

  if (T <= start) return asezat(0);
  if (T >= start + ultim * ritm) return asezat(ultim);

  const k = Math.min(ultim - 1, Math.floor((T - start) / ritm));
  const plecare = start + k * ritm;
  const sfarsit = plecare + ritm * PARTE_ALUNECARE;
  if (T >= sfarsit) return asezat(k + 1);

  const x = animeaza({
    dela: drum[k] ?? 0,
    la: drum[k + 1] ?? 0,
    start: plecare,
    sfarsit,
    ease: EASING.intrareIesireCubica,
  })(T);
  return { x, k };
}

type NumeScena = (typeof SCENE)[number]["nume"];
type Cue = Record<NumeScena, number>;

/** Starea celor două rulări la momentul `T`. */
function stareLa(T: number, cue: Cue) {
  return {
    capcana: mers(DRUM_CAPCANA, T, cue.Coborare + 0.15, RITM_CAPCANA),
    bun: mers(DRUM_BUN, T, cue.Lectie + 0.7, RITM_BUN),
  };
}

/* ───────────────────────── cadrul de desen ───────────────────────── */

/** Fereastra desenată din plan. Curba stă toată înăuntru — verificat numeric. */
const X0 = -8.5;
const X1 = 8.5;
const Y0 = -0.2;
const Y1 = 5.8;

/**
 * Dreptunghiul graficului în interiorul cadrului de 1920×1080.
 *
 * Pe orizontală ocupă tot cadrul, dinadins: relieful e pământ, iar pământul nu
 * se termină la 100 de pixeli de marginea ecranului. Etichetele axelor stau
 * retrase de la margine cu `MARGINE_TEXT`.
 */
const STANGA = 0;
const LATIME = 1920;
const SUS = 110;
const INALTIME = 760;
const MARGINE_TEXT = 40;

const px = (x: number) => STANGA + ((x - X0) * LATIME) / (X1 - X0);
const py = (y: number) => SUS + INALTIME - ((y - Y0) * INALTIME) / (Y1 - Y0);

/**
 * Cât se desenează din relief **în afara** ferestrei, în unități de pe axa x.
 *
 * Camera se apropie și urmărește bila, deci în timpul coborârii marginea
 * ferestrei ajunge în mijlocul ecranului. Fără rezerva asta, la zoom s-ar vedea
 * fundalul gol acolo unde ar trebui să fie pământ.
 */
const MARGINE_X = 2.2;
const XS = X0 - MARGINE_X;
const XD = X1 + MARGINE_X;

/** Curba, eșantionată o singură dată: relieful nu depinde de timp. */
const CURBA = (() => {
  const puncte: string[] = [];
  const n = 700;
  for (let i = 0; i <= n; i++) {
    const x = XS + ((XD - XS) * i) / n;
    puncte.push(`${i ? "L" : "M"}${px(x).toFixed(1)} ${py(f(x)).toFixed(1)}`);
  }
  return puncte.join(" ");
})();

/** Aceeași curbă, închisă mult sub cadru: umplerea care face relieful „pământ". */
const TEREN = `${CURBA} L${px(XD).toFixed(1)} 1700 L${px(XS).toFixed(1)} 1700 Z`;

const VARFURI = varfuri(X0, X1);

/** Lungimea folosită pentru trasarea curbei cu `stroke-dasharray`. */
const LUNGIME_CURBA = 6000;

/**
 * Cu cât se îngroașă literele desenului pe un cadru îngust.
 *
 * Desenul are 1920 de unități lățime, oricât de mare ar fi pe ecran: pe un
 * telefon, o literă de 26 de unități ajunge la 5 px. Sub `LATIME_CONFORT`,
 * literele cresc exact cât să rămână la mărimea pe care ar avea-o pe un cadru
 * de lățimea aceea — desenul se „apropie", textul nu se micșorează.
 */
const LATIME_CONFORT = 780;
const SCARA_MAXIMA = 2.4;

function scaraText(latime: number): number {
  if (!latime) return 1;
  return Math.min(SCARA_MAXIMA, Math.max(1, LATIME_CONFORT / latime));
}

/* ───────────────────────── piesele desenului ───────────────────────── */

function Peisaj({ T, cue, st }: { T: number; cue: Cue; st: number }) {
  const trasat = animeaza({
    dela: 0,
    la: 1,
    start: 0.15,
    sfarsit: cue.Panta - 1.0,
    ease: EASING.intrareIesireCubica,
  })(T);

  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={px(XS)}
          x2={px(XD)}
          y1={SUS + (INALTIME / 4) * i}
          y2={SUS + (INALTIME / 4) * i}
          stroke={culoareRol("grila")}
          strokeWidth={2}
        />
      ))}

      <path
        d={TEREN}
        fill={culoareRol("functie")}
        opacity={0.16 * clamp((trasat - 0.25) / 0.5, 0, 1)}
      />
      <path
        d={CURBA}
        fill="none"
        stroke={culoareRol("functie")}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={LUNGIME_CURBA}
        strokeDashoffset={LUNGIME_CURBA * (1 - trasat)}
      />

      <line
        x1={px(XS)}
        x2={px(XD)}
        y1={py(Y0)}
        y2={py(Y0)}
        stroke="var(--text-slab)"
        strokeWidth={2.5}
        opacity={0.5}
      />
      <text
        x={STANGA + LATIME - MARGINE_TEXT}
        y={py(Y0) - 16}
        textAnchor="end"
        fill="var(--text-slab)"
        style={{ font: `600 ${30 * st}px var(--font-mono)` }}
      >
        x
      </text>
      <text
        x={STANGA + MARGINE_TEXT}
        y={SUS + 38}
        fill="var(--text-slab)"
        style={{ font: `600 ${30 * st}px var(--font-mono)` }}
      >
        f(x)
      </text>

      {VARFURI.map((vx, i) => {
        const aparut = clamp((T - (cue.Panta - 2.7 + i * 0.32)) / 0.4, 0, 1);
        // Când începe coborârea, etichetele se retrag: de acolo încolo se
        // urmărește bila, nu peisajul.
        const stinse = T > cue.Coborare ? 0.45 : 1;
        return (
          <text
            key={i}
            x={px(vx)}
            y={py(f(vx)) - 34 * st}
            textAnchor="middle"
            fill="var(--text-slab)"
            opacity={aparut * stinse}
            style={{ font: `600 ${26 * st}px var(--font-mono)`, letterSpacing: "0.08em" }}
          >
            deal {i + 1}
          </text>
        );
      })}
    </g>
  );
}

function Bila({
  x,
  raza = 20,
  rol = "curent",
  dy = 0,
}: {
  x: number;
  raza?: number;
  rol?: "curent" | "solutie";
  dy?: number;
}) {
  return (
    <g transform={`translate(${px(x)}, ${py(f(x)) + dy})`}>
      <ellipse
        cx={0}
        cy={raza + 8}
        rx={raza * 0.9}
        ry={raza * 0.3}
        fill="var(--text)"
        opacity={0.16}
      />
      {/* Inelul în culoarea fundalului ține bila vizibilă acolo unde stă exact
          peste curbă — adică tot timpul. Aceeași soluție ca la `PlotPunct`. */}
      <circle r={raza} fill={culoareRol(rol)} stroke="var(--fundal)" strokeWidth={4} />
    </g>
  );
}

/**
 * Tangenta și săgeata pasului: părțile din formulă care se văd pe desen.
 *
 * Panta liniei punctate e `f′(x^(k))`, iar săgeata are lungimea `α·r^(k)` și
 * arată încotro duce pasul — adică exact `x^(k+1) − x^(k)`.
 */
function SagetaGradient({ x, T, cue, st }: { x: number; T: number; cue: Cue; st: number }) {
  const panta = df(x);
  const vizibil =
    clamp((T - (cue.Panta + 0.55)) / 0.4, 0, 1) * clamp((cue.MinimLocal + 0.5 - T) / 0.4, 0, 1);
  if (vizibil <= 0.01) return null;

  const cx = px(x);
  const cy = py(f(x));
  const pePx = LATIME / (X1 - X0);
  const pePy = INALTIME / (Y1 - Y0);

  // Panta în pixeli: y crește în jos pe ecran, de unde semnul minus.
  const pantaEcran = -panta * (pePy / pePx);
  const jumatate = 200;
  const nx = 1 / Math.sqrt(1 + pantaEcran * pantaEcran);
  const ny = pantaEcran * nx;

  const pas = ALFA * -panta;
  const capat = cx + pas * pePx;
  const culoare = culoareRol("interval");

  return (
    <g opacity={vizibil}>
      <line
        x1={cx - jumatate * nx}
        y1={cy - jumatate * ny}
        x2={cx + jumatate * nx}
        y2={cy + jumatate * ny}
        stroke={culoare}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray="14 10"
      />
      <line
        x1={cx}
        y1={cy - 46}
        x2={capat}
        y2={cy - 46}
        stroke={culoare}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path d={`M${capat} ${cy - 46} l${Math.sign(pas) * -18} -11 l0 22 Z`} fill={culoare} />
      <text
        x={(cx + capat) / 2}
        y={cy - 66}
        textAnchor="middle"
        fill={culoareEticheta("interval")}
        style={{ font: `700 ${26 * st}px var(--font-mono)` }}
      >
        α·r⁽ᵏ⁾
      </text>
    </g>
  );
}

/** Inelul care pulsează când pașii au ajuns aproape de zero. */
function Puls({ x, T, cue }: { x: number; T: number; cue: Cue }) {
  const vizibil =
    clamp((T - (cue.MinimLocal + 0.3)) / 0.4, 0, 1) * clamp((cue.Lectie - 0.4 - T) / 0.5, 0, 1);
  if (vizibil <= 0.01) return null;

  const faza = ((T - cue.MinimLocal) % 1.15) / 1.15;
  return (
    <circle
      cx={px(x)}
      cy={py(f(x))}
      r={20 + 52 * faza}
      fill="none"
      stroke={culoareRol("curent")}
      strokeWidth={3}
      opacity={vizibil * (1 - faza) * 0.7}
    />
  );
}

function Steag({
  x,
  rol,
  eticheta,
  T,
  la,
  st,
}: {
  x: number;
  rol: "pivot" | "solutie";
  eticheta: string;
  T: number;
  la: number;
  st: number;
}) {
  const aparut = clamp((T - la) / 0.45, 0, 1);
  const inaltime = animeaza({
    dela: 0,
    la: 128,
    start: la,
    sfarsit: la + 0.6,
    ease: EASING.iesireCuDepasire,
  })(T);

  const cx = px(x);
  const cy = py(f(x));

  return (
    <g opacity={aparut}>
      <line x1={cx} y1={cy} x2={cx} y2={cy - inaltime} stroke={culoareRol(rol)} strokeWidth={4} />
      <text
        x={cx}
        y={cy - inaltime - 22 * st}
        textAnchor="middle"
        fill={culoareEticheta(rol)}
        style={{ font: `800 ${32 * st}px var(--font-sans)`, letterSpacing: "-0.01em" }}
      >
        {eticheta}
      </text>
    </g>
  );
}

/* ───────────────────────── desenul întreg ───────────────────────── */

function Desen() {
  const { T, cue, latime } = useClip<NumeScena>();
  const { capcana, bun } = stareLa(T, cue);
  const st = scaraText(latime);

  // Bila cade în cadru înainte să înceapă coborârea.
  const cadere =
    T < cue.Panta
      ? animeaza({
          dela: -260,
          la: 0,
          start: cue.Panta - 0.55,
          sfarsit: cue.Panta + 0.05,
          ease: EASING.iesireCuDepasire,
        })(T)
      : 0;
  const bilaVizibila = clamp((T - (cue.Panta - 0.55)) / 0.25, 0, 1);
  const aDouaVizibila = clamp((T - (cue.Lectie + 0.25)) / 0.3, 0, 1);

  // Camera: se apropie și urmărește bila cât coboară, apoi revine la cadrul
  // larg pentru comparația finală. Zoomul se relaxează încet cât timp bila stă
  // în minimul local, ca ochiul să reia contactul cu peisajul.
  const inainteDeFinal = T < cue.Lectie - 0.2;
  const zoom = inainteDeFinal
    ? animeaza({
        dela: 1,
        la: 1.32,
        start: cue.Coborare - 0.2,
        sfarsit: cue.Coborare + 1.4,
        ease: EASING.iesireCubica,
      })(T) +
      animeaza({
        dela: 0,
        la: 0.14,
        start: cue.MinimLocal,
        sfarsit: cue.MinimLocal + 3.4,
        ease: EASING.intrareIesireCubica,
      })(T)
    : animeaza({
        dela: 1.44,
        la: 1,
        start: cue.Lectie - 0.2,
        sfarsit: cue.Lectie + 0.9,
        ease: EASING.iesireCubica,
      })(T);
  const urmarire = inainteDeFinal
    ? animeaza({
        dela: 0,
        la: 1,
        start: cue.Coborare - 0.2,
        sfarsit: cue.Coborare + 1.0,
        ease: EASING.iesireCubica,
      })(T)
    : animeaza({
        dela: 1,
        la: 0,
        start: cue.Lectie - 0.2,
        sfarsit: cue.Lectie + 0.9,
        ease: EASING.iesireCubica,
      })(T);

  const tintaX = 960 + (px(capcana.x) - 960) * urmarire;
  const tintaY = 620 + (py(f(capcana.x)) - 60 - 620) * urmarire;
  const camera = `translate(${960 - zoom * tintaX}, ${540 - zoom * tintaY}) scale(${zoom})`;

  const titlu = clamp(T / 0.6, 0, 1) * clamp((cue.Panta + 0.3 - T) / 0.5, 0, 1);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" aria-hidden="true">
      <g transform={camera}>
        <Peisaj T={T} cue={cue} st={st} />

        {/* Urma pașilor deja făcuți: „de unde a venit" e jumătate din poveste. */}
        {DRUM_CAPCANA.slice(0, capcana.k).map((x, i) => (
          <circle
            key={i}
            cx={px(x)}
            cy={py(f(x))}
            r={9}
            fill={culoareRol("anterior")}
            opacity={0.5}
          />
        ))}

        <g opacity={aDouaVizibila}>
          {DRUM_BUN.slice(0, bun.k).map((x, i) => (
            <circle
              key={i}
              cx={px(x)}
              cy={py(f(x))}
              r={8}
              fill={culoareRol("solutie")}
              opacity={0.4}
            />
          ))}
          <Bila x={bun.x} raza={18} rol="solutie" />
        </g>

        <Steag
          x={DRUM_CAPCANA[DRUM_CAPCANA.length - 1] ?? 0}
          rol="pivot"
          eticheta="minim local"
          T={T}
          la={cue.MinimLocal + 0.5}
          st={st}
        />
        <Steag
          x={DRUM_BUN[DRUM_BUN.length - 1] ?? 0}
          rol="solutie"
          eticheta="minim global"
          T={T}
          la={cue.Lectie + 3.4}
          st={st}
        />

        <g opacity={bilaVizibila}>
          <Puls x={capcana.x} T={T} cue={cue} />
          <SagetaGradient x={capcana.x} T={T} cue={cue} st={st} />
          <Bila x={capcana.x} dy={cadere} />
        </g>
      </g>

      {/* Titlul stă în afara camerei: nu se apropie și nu se depărtează odată cu peisajul. */}
      <g opacity={titlu} transform={`translate(0, ${(1 - titlu) * 16})`}>
        <text
          x={960}
          y={92}
          textAnchor="middle"
          fill="var(--text)"
          style={{
            font: `800 ${68 * Math.min(st, 1.35)}px var(--font-sans)`,
            letterSpacing: "-0.02em",
          }}
        >
          Coborâre pe gradient
        </text>
        <text
          x={960}
          y={146}
          textAnchor="middle"
          fill="var(--text-slab)"
          style={{ font: `600 ${34 * Math.min(st, 1.35)}px var(--font-sans)` }}
        >
          f(x) cu trei dealuri și două văi
        </text>
      </g>
    </svg>
  );
}

/* ───────────────────────── piesa întreagă ───────────────────────── */

const SUBTITRARI = [
  {
    la: 0.7,
    text: "Căutăm minimul lui f(x), pe un peisaj cu trei dealuri și două văi de adâncimi diferite.",
  },
  {
    la: 4.0,
    text: "Panta în punctul curent e f′(x⁽ᵏ⁾), iar direcția de scădere maximă e opusul ei: r⁽ᵏ⁾ = −f′(x⁽ᵏ⁾).",
  },
  { la: 8.0, text: "Fiecare pas aplică x⁽ᵏ⁺¹⁾ = x⁽ᵏ⁾ + α·r⁽ᵏ⁾, cu α ținut fix." },
  {
    la: 10.8,
    text: "Deplasarea e proporțională cu panta: pași mari pe coastă, pași tot mai mici lângă vale.",
  },
  {
    la: 15.5,
    text: "Când f′(x⁽ᵏ⁾) ajunge aproape de zero, iterația se oprește — dar în valea de lângă ea, nu în cea mai adâncă.",
  },
  { la: 19.2, text: "Cu alt x⁽⁰⁾, aceeași iterație ajunge în minimul global." },
] as const;

/**
 * Clipul paginii 7: coborârea pe gradient, ca intuiție, înaintea formulelor.
 *
 * **Ce arată și ce nu.** Peisajul e o funcție de o variabilă, nu forma
 * pătratică din curs — pe o cvadratică pozitiv definită există un singur minim,
 * deci nu s-ar putea arăta tocmai lucrul pentru care e făcut clipul: pasul cel
 * mai abrupt te duce în valea de lângă tine. Iterația desenată e chiar cea din
 * curs (`x^(k+1) = x^(k) + α·r^(k)`, cu `r^(k) = −∇f(x^(k))`, aici în 1D), doar
 * că `α` e ținut fix și clipul o spune. Alegerea lui `α` prin line search și
 * forma `f(x) = ½xᵀAx − bᵀx` stau în teoria de sub clip, cu sursa din curs.
 *
 * Matematica e în `@/algorithms/metode-de-gradient/peisaj-1d`, verificată
 * numeric în afara aplicației; aici e doar desenul.
 */
export function AnimatieCoborarePeGradient() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație: pe un relief cu trei dealuri și două văi, o bilă coboară pas cu pas în " +
        "direcția opusă pantei și se oprește în valea din dreapta, care e doar minimul local. " +
        "O a doua pornire, din stânga, ajunge în valea cea mai adâncă, minimul global."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
