import {
  matriceaPlana,
  run,
  runInversa,
  runRayleigh,
  VALORI_PLANE,
} from "@/algorithms/metodele-puterii/putere";
import { inmultesteVector, norma2 } from "@/algorithms/metodele-puterii/matrice";
import { Clip } from "@/components/viz/Clip";
import { useClip } from "@/components/viz/clip-context";
import { Subtitrari } from "@/components/viz/Subtitrari";
import { animeaza, clamp, EASING, type Scena } from "@/lib/compozitie";
import { culoareEticheta, culoareRol } from "@/lib/viz-roles";

/* ───────────────────────── timpul ───────────────────────── */

/**
 * Scenele clipului, în ordine. Lista e schița piesei: numele, ordinea și
 * duratele stau aici, iar coregrafia se scrie exclusiv față de `cue.NumeScena`,
 * niciodată față de secunde scrise de mână.
 *
 * **Deflația nu are scenă**, prin decizie: e a teoriei, nu a clipului. Ce se
 * arată aici e cum se rotește o direcție, iar deflația nu rotește nimic — scade
 * o matrice.
 *
 * **Sub plan nu se scrie nimic.** Formula scenei stătea acolo, pe un rând
 * propriu, și se bătea cu subtitrarea de dedesubt: două texte care spuneau
 * același lucru în același loc, iar ochiul trebuia să aleagă între ele în timp
 * ce se uita la desen. Ce e de spus în cuvinte spune subtitrarea.
 */
const SCENE = [
  {
    nume: "Ideea",
    durata: 13,
    descriere:
      "Planul, cercul de rază 1 și cele două direcții proprii ale matricei; o săgeată de pornire care nu e pe niciuna dintre ele.",
  },
  {
    nume: "Directa",
    durata: 22,
    descriere:
      "Metoda puterii: săgeata se înmulțește cu A, se lungește și se rotește, apoi se readuce pe cerc — de cinci ori.",
  },
  {
    nume: "Rayleigh",
    durata: 18,
    descriere:
      "Câtul Rayleigh ca deplasare: aceeași direcție, dar valoarea se fixează pe 4 în patru pași.",
  },
  {
    nume: "Inversa",
    durata: 18,
    descriere:
      "Puterea inversă: se rezolvă un sistem în loc să se înmulțească, iar săgeata pleacă spre cealaltă diagonală, cu λ = 2.",
  },
  {
    nume: "Bilant",
    durata: 8,
    descriere: "Cele două valori proprii, una lângă alta, cu metoda care a găsit-o pe fiecare.",
  },
] as const satisfies readonly Scena[];

type NumeScena = (typeof SCENE)[number]["nume"];
type Cue = Record<NumeScena, number>;

/** Cadrul arătat la `prefers-reduced-motion`: bilanțul, cu tot desenul pe ecran. */
const CADRU_STATIC = 74;

/* ───────────────────────── matematica ───────────────────────── */

/**
 * Toate cifrele vin din `src/algorithms/metodele-puterii/` — aceleași module pe
 * care le folosește interfața de sub clip.
 *
 * Matricea e **fixă**: un clip nu primește parametrii utilizatorului (regula din
 * `src/components/viz/README.md`). E cea plană, cu valorile proprii exacte 4 și
 * 2 pe cele două diagonale ale planului, fiindcă ideea metodei se vede numai
 * geometric: o săgeată care se rotește către o direcție.
 */
const P = matriceaPlana();
const TOL = 1e-12;

/** Cele două direcții proprii, adică diagonalele planului. */
const DIR_DOMINANTA = [Math.SQRT1_2, Math.SQRT1_2];
const DIR_MICA = [Math.SQRT1_2, -Math.SQRT1_2];

const PORNIRE = [1, 0];
const DIRECTA = run({ A: P, pornire: PORNIRE, tol: TOL, maxIteratii: 200 }).pasi.slice(0, 5);
/**
 * Pornirea ușor înclinată e cerută de metodă, nu aleasă din estetică: din
 * `(1, 0)`, câtul Rayleigh e exact 3, la mijloc între 4 și 2, iar iterația sare
 * între două direcții la nesfârșit. Cazul e ținut ca test în
 * `scripts/verificare-algoritmi/metodele-puterii.ts`.
 */
const PORNIRE_RAYLEIGH = [1, 0.15];
const RAYLEIGH = runRayleigh({
  A: P,
  pornire: PORNIRE_RAYLEIGH,
  tol: TOL,
  maxIteratii: 50,
}).pasi;
const INVERSA = runInversa({ A: P, pornire: PORNIRE, tol: TOL, maxIteratii: 200 }).pasi.slice(0, 4);

/* ───────────────────────── cadrul de desen ───────────────────────── */

const W = 1920;
const H = 1080;

/**
 * Planul, în stânga.
 *
 * Unitatea e mică dinadins: cu 128 de unități pe pas, axa verticală ajungea
 * peste rândul de subtitrare, iar `A·v` — care are, în vârf, patru unități —
 * ieșea din cadru. Aici, tot desenul stă între antet și subtitrare fără să
 * atingă niciunul.
 */
const O = { x: 600, y: 540 };
const UNITATE = 100;
const px = (v: number[]) => ({ x: O.x + (v[0] ?? 0) * UNITATE, y: O.y - (v[1] ?? 0) * UNITATE });

/** Panoul din dreapta: matricea și cifrele. */
const PX = 1240;
const PY = 250;
const CELULA = 112;
const SPATIU = 10;
const colX = (c: number) => PX + c * (CELULA + SPATIU);
const linY = (r: number) => PY + r * (CELULA + SPATIU);
const LATIME_MATRICE = 2 * CELULA + SPATIU;

/** Umplerea unei celule: safirul la 16 % peste suprafață — derivată, nu culoare nouă. */
const UMPLERE_CELULA = `color-mix(in oklab, ${culoareRol("curent")} 16%, var(--suprafata))`;

/**
 * Cu cât se îngroașă literele desenului pe un cadru îngust — același truc ca la
 * clipurile paginilor 7 și 9: desenul are 1920 de unități oricât de mic ar fi pe
 * ecran.
 */
const LATIME_CONFORT = 780;
const SCARA_MAXIMA = 2.4;
const scaraText = (latime: number) =>
  latime ? Math.min(SCARA_MAXIMA, Math.max(1, LATIME_CONFORT / latime)) : 1;

const virgula = (x: number, cifre: number) => x.toFixed(cifre).replace(".", ",");

/* ───────────────────────── coregrafia ───────────────────────── */

/**
 * Cât ține pe ecran un pas al fiecărei iterații.
 *
 * Ritmul e dat de cât durează **citirea subtitrării** de sub desen, nu de cât
 * durează gestul: un pas care se vede în două secunde tot patru stă pe ecran,
 * fiindcă atât îi trebuie propoziției care îl explică.
 */
const RITM_DIRECT = 4;
const RITM_RAYLEIGH = 4;
const RITM_INVERS = 4;

/** Unghiul unui vector, în radiani. */
const unghi = (v: number[]) => Math.atan2(v[1] ?? 0, v[0] ?? 0);

/**
 * Săgeata desenată la momentul `T`: direcție și lungime.
 *
 * Toate cele trei iterații rotesc aceeași săgeată; diferă doar de la ce listă de
 * pași citește și dacă între două direcții mai apare, ca la metoda directă, un
 * moment în care vectorul e lung — adică `A·v`, înainte de împărțirea la normă.
 */
function sageataLa(T: number, cue: Cue): { unghi: number; lungime: number; scenaInversa: boolean } {
  // Bilanțul păstrează ultima direcție a puterii inverse.
  if (T >= cue.Inversa) {
    const brut = clamp((T - (cue.Inversa + 0.6)) / RITM_INVERS, 0, INVERSA.length);
    const k = Math.floor(brut);
    const frac = EASING.intrareIesireCubica(brut - k);
    const de = k === 0 ? PORNIRE : (INVERSA[k - 1]?.v ?? PORNIRE);
    const la = INVERSA[Math.min(k, INVERSA.length - 1)]?.v ?? DIR_MICA;
    const u0 = unghi(de);
    const u1 = unghi(la);
    return { unghi: u0 + (u1 - u0) * frac, lungime: 1, scenaInversa: true };
  }

  if (T >= cue.Rayleigh) {
    const brut = clamp((T - (cue.Rayleigh + 0.6)) / RITM_RAYLEIGH, 0, RAYLEIGH.length);
    const k = Math.floor(brut);
    const frac = EASING.intrareIesireCubica(brut - k);
    const de = k === 0 ? PORNIRE_RAYLEIGH : (RAYLEIGH[k - 1]?.v ?? PORNIRE_RAYLEIGH);
    const la = RAYLEIGH[Math.min(k, RAYLEIGH.length - 1)]?.v ?? DIR_DOMINANTA;
    const u0 = unghi(de);
    const u1 = unghi(la);
    return { unghi: u0 + (u1 - u0) * frac, lungime: 1, scenaInversa: false };
  }

  const start = cue.Directa + 0.6;
  const brut = clamp((T - start) / RITM_DIRECT, 0, DIRECTA.length);
  const k = Math.floor(brut);
  const rest = brut - k;
  const de = k === 0 ? PORNIRE : (DIRECTA[k - 1]?.v ?? PORNIRE);
  const la = DIRECTA[Math.min(k, DIRECTA.length - 1)]?.v ?? DIR_DOMINANTA;
  const u0 = unghi(de);
  const u1 = unghi(la);
  // `A·v` are aceeași direcție ca `v` de la pasul următor — de aceea rotirea și
  // lungirea sunt un singur gest, iar readucerea pe cerc e al doilea.
  const lungimeMaxima = norma2(inmultesteVector(P, de));

  if (rest < 0.55) {
    const f = EASING.intrareIesireCubica(rest / 0.55);
    return { unghi: u0 + (u1 - u0) * f, lungime: 1 + (lungimeMaxima - 1) * f, scenaInversa: false };
  }
  const f = EASING.intrareIesireCubica((rest - 0.55) / 0.45);
  return { unghi: u1, lungime: lungimeMaxima + (1 - lungimeMaxima) * f, scenaInversa: false };
}

/**
 * Ce valoare proprie scrie panoul la momentul `T`.
 *
 * Eticheta e **formula**, nu numele metodei: numele stă deja în antet, iar scris
 * de două ori pe același ecran ar arăta ca două lucruri diferite.
 */
function valoareaLa(T: number, cue: Cue): { eticheta: string; valoare: number } | null {
  if (T >= cue.Bilant) return null;
  if (T >= cue.Inversa) {
    const k = Math.min(
      Math.floor(clamp((T - (cue.Inversa + 0.6)) / RITM_INVERS, 0, INVERSA.length - 1)),
      INVERSA.length - 1,
    );
    return { eticheta: "λ = vᵀAv", valoare: INVERSA[k]?.lambda ?? 0 };
  }
  if (T >= cue.Rayleigh) {
    const k = Math.min(
      Math.floor(clamp((T - (cue.Rayleigh + 0.6)) / RITM_RAYLEIGH, 0, RAYLEIGH.length - 1)),
      RAYLEIGH.length - 1,
    );
    return { eticheta: "ρ = vᵀAv / vᵀv", valoare: RAYLEIGH[k]?.lambda ?? 0 };
  }
  if (T >= cue.Directa + 0.6) {
    const k = Math.min(
      Math.floor(clamp((T - (cue.Directa + 0.6)) / RITM_DIRECT, 0, DIRECTA.length - 1)),
      DIRECTA.length - 1,
    );
    return { eticheta: "λ = vᵀAv", valoare: DIRECTA[k]?.lambda ?? 0 };
  }
  return null;
}

/* ───────────────────────── piesele desenului ───────────────────────── */

/** Axele, cercul de rază 1 și cele două direcții proprii. */
function Plan({ T, st }: { T: number; st: number }) {
  const aparut = animeaza({ dela: 0, la: 1, start: 0.2, sfarsit: 1.2 })(T);
  const proprii = animeaza({ dela: 0, la: 1, start: 2.6, sfarsit: 3.8 })(T);

  const raza = 3 * UNITATE;
  const capat = (d: number[], semn: number) => px(d.map((x) => x * semn * 2.8));

  return (
    <g opacity={aparut}>
      <line
        x1={O.x - raza}
        x2={O.x + raza}
        y1={O.y}
        y2={O.y}
        stroke={culoareRol("grila")}
        strokeWidth={3}
        opacity={0.6}
      />
      <line
        x1={O.x}
        x2={O.x}
        y1={O.y - raza}
        y2={O.y + raza}
        stroke={culoareRol("grila")}
        strokeWidth={3}
        opacity={0.6}
      />
      <circle
        cx={O.x}
        cy={O.y}
        r={UNITATE}
        fill="none"
        stroke={culoareRol("grila")}
        strokeWidth={3}
        strokeDasharray="10 12"
        opacity={0.8}
      />

      {/* Cele două direcții proprii: axele pe care matricea doar lungește. */}
      {[
        { dir: DIR_DOMINANTA, rol: "solutie" as const, text: "λ = 4", lat: 1 },
        { dir: DIR_MICA, rol: "interval" as const, text: "λ = 2", lat: 1 },
      ].map((d) => {
        const a = capat(d.dir, -1);
        const b = capat(d.dir, 1);
        const eticheta = px(d.dir.map((x) => x * 2.35));
        return (
          <g key={d.text} opacity={proprii}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={culoareRol(d.rol)}
              strokeWidth={4}
              strokeDasharray="16 14"
              opacity={0.85}
            />
            <text
              x={eticheta.x + 30 * d.lat}
              y={eticheta.y}
              dy="0.34em"
              fill={culoareEticheta(d.rol)}
              style={{ font: `700 ${30 * Math.min(st, 1.2)}px var(--font-mono)` }}
            >
              {d.text}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Săgeata care se rotește: vectorul curent, plus urma pașilor dinainte. */
function Sageata({ T, cue, st }: { T: number; cue: Cue; st: number }) {
  const aparuta = animeaza({ dela: 0, la: 1, start: 4.4, sfarsit: 5.2 })(T);
  const { unghi: u, lungime, scenaInversa } = sageataLa(T, cue);
  const varf = px([Math.cos(u) * lungime, Math.sin(u) * lungime]);
  const rol = scenaInversa ? "interval" : "curent";

  // Urma: unde a fost săgeata la pașii deja consumați din scena curentă.
  const scena =
    T >= cue.Inversa
      ? { pasi: INVERSA, start: cue.Inversa, ritm: RITM_INVERS }
      : T >= cue.Rayleigh
        ? { pasi: RAYLEIGH, start: cue.Rayleigh, ritm: RITM_RAYLEIGH }
        : { pasi: DIRECTA, start: cue.Directa, ritm: RITM_DIRECT };
  const urme = scena.pasi.filter((pas) => T > scena.start + 0.6 + pas.iteratie * scena.ritm);

  return (
    <g opacity={aparuta}>
      <defs>
        <marker
          id="mp-varf"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="18"
          markerHeight="18"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill={culoareRol(rol)} />
        </marker>
      </defs>

      {urme.map((pas) => {
        const capat = px(pas.v);
        return (
          <line
            key={pas.iteratie}
            x1={O.x}
            y1={O.y}
            x2={capat.x}
            y2={capat.y}
            stroke={culoareRol("anterior")}
            strokeWidth={4}
            opacity={0.5}
          />
        );
      })}

      <line
        x1={O.x}
        y1={O.y}
        x2={varf.x}
        y2={varf.y}
        stroke={culoareRol(rol)}
        strokeWidth={8}
        strokeLinecap="round"
        markerEnd="url(#mp-varf)"
      />
      <text
        x={varf.x + 26}
        y={varf.y - 20}
        fill={culoareEticheta(rol)}
        style={{ font: `700 ${30 * Math.min(st, 1.2)}px var(--font-mono)` }}
      >
        {lungime > 1.05 ? "A·v" : "v"}
      </text>
    </g>
  );
}

/** Panoul din dreapta: matricea, valoarea proprie curentă și, la final, bilanțul. */
function Panou({ T, cue, st }: { T: number; cue: Cue; st: number }) {
  const aparuta = animeaza({ dela: 0, la: 1, start: 1.8, sfarsit: 2.6 })(T);
  const valoare = valoareaLa(T, cue);
  const bilant = animeaza({ dela: 0, la: 1, start: cue.Bilant + 0.2, sfarsit: cue.Bilant + 1.2 })(
    T,
  );

  return (
    <g opacity={aparuta}>
      {[0, 1].map((parte) => {
        const x = parte === 0 ? PX - 34 : PX + LATIME_MATRICE + 14;
        const semn = parte === 0 ? 1 : -1;
        const sus = PY - 24;
        const jos = PY + LATIME_MATRICE + 24;
        return (
          <path
            key={parte}
            d={`M ${x + semn * 20} ${sus} L ${x} ${sus} L ${x} ${jos} L ${x + semn * 20} ${jos}`}
            fill="none"
            stroke={culoareRol("anterior")}
            strokeWidth={5}
            opacity={0.8}
          />
        );
      })}

      {P.map((linie, r) =>
        linie.map((valoareCelula, c) => (
          <g key={`${r}-${c}`}>
            <rect
              x={colX(c)}
              y={linY(r)}
              width={CELULA}
              height={CELULA}
              rx={12}
              fill={UMPLERE_CELULA}
              stroke={culoareRol("anterior")}
              strokeWidth={2}
              strokeOpacity={0.35}
            />
            <text
              x={colX(c) + CELULA / 2}
              y={linY(r) + CELULA / 2}
              dy="0.34em"
              textAnchor="middle"
              fill="var(--text)"
              style={{ font: `700 ${34 * Math.min(st, 1.2)}px var(--font-mono)` }}
            >
              {valoareCelula}
            </text>
          </g>
        )),
      )}

      <text
        x={PX + LATIME_MATRICE / 2}
        y={PY - 60}
        textAnchor="middle"
        fill="var(--text-slab)"
        style={{ font: `700 ${30 * Math.min(st, 1.2)}px var(--font-mono)` }}
      >
        A
      </text>

      {valoare && (
        <g>
          <text
            x={PX + LATIME_MATRICE / 2}
            y={PY + LATIME_MATRICE + 110}
            textAnchor="middle"
            fill="var(--text-slab)"
            style={{ font: `600 ${28 * Math.min(st, 1.2)}px var(--font-mono)` }}
          >
            {valoare.eticheta}
          </text>
          <text
            x={PX + LATIME_MATRICE / 2}
            y={PY + LATIME_MATRICE + 190}
            textAnchor="middle"
            fill={culoareEticheta(T >= cue.Inversa ? "interval" : "curent")}
            style={{ font: `800 ${64 * Math.min(st, 1.2)}px var(--font-mono)` }}
          >
            {virgula(valoare.valoare, 6)}
          </text>
        </g>
      )}

      {bilant > 0 && (
        <g opacity={bilant}>
          {[
            {
              text: `λ₁ = ${VALORI_PLANE[0]}`,
              sub: "metoda puterii, iterarea Rayleigh",
              rol: "solutie" as const,
              y: PY + LATIME_MATRICE + 120,
            },
            {
              text: `λ₂ = ${VALORI_PLANE[1]}`,
              sub: "puterea inversă",
              rol: "interval" as const,
              y: PY + LATIME_MATRICE + 250,
            },
          ].map((rand) => (
            <g key={rand.text}>
              <text
                x={PX + LATIME_MATRICE / 2}
                y={rand.y}
                textAnchor="middle"
                fill={culoareEticheta(rand.rol)}
                style={{ font: `800 ${56 * Math.min(st, 1.2)}px var(--font-mono)` }}
              >
                {rand.text}
              </text>
              <text
                x={PX + LATIME_MATRICE / 2}
                y={rand.y + 46}
                textAnchor="middle"
                fill="var(--text-slab)"
                style={{ font: `600 ${26 * Math.min(st, 1.2)}px var(--font-mono)` }}
              >
                {rand.sub}
              </text>
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

/**
 * Antetul: ce metodă se vede **acum**.
 *
 * Există fiindcă altfel cele trei iterații arată la fel — aceeași săgeată, în
 * același plan, pe aceeași matrice — și numai subtitrarea le deosebea, adică un
 * text care trece. Antetul stă tot timpul scenei, iar linia de sub titlu spune
 * ce caută metoda, nu cum funcționează: asta e diferența dintre ele.
 *
 * Culoarea îl leagă de desen: la puterea inversă, titlul are culoarea săgeții
 * din scena ei, care e alta decât la celelalte două — aceeași culoare care
 * marchează și direcția lui λ = 2.
 */
const ANTETE = [
  {
    scena: "Ideea",
    supratitlu: "VALORI ȘI VECTORI PROPRII",
    titlu: "Metodele puterii",
    rol: "curent",
  },
  {
    scena: "Directa",
    supratitlu: "CAUTĂ λ CEA MAI MARE ÎN MODUL",
    titlu: "Metoda puterii directe",
    rol: "curent",
  },
  {
    scena: "Rayleigh",
    supratitlu: "ACELAȘI λ, ÎN CÂȚIVA PAȘI",
    titlu: "Iterarea câtului Rayleigh",
    rol: "curent",
  },
  {
    scena: "Inversa",
    supratitlu: "CAUTĂ λ CEA MAI MICĂ ÎN MODUL",
    titlu: "Metoda puterii inverse",
    rol: "interval",
  },
  {
    scena: "Bilant",
    supratitlu: "CE A GĂSIT FIECARE",
    titlu: "Două valori proprii",
    rol: "solutie",
  },
] as const satisfies readonly {
  scena: NumeScena;
  supratitlu: string;
  titlu: string;
  rol: "curent" | "interval" | "solutie";
}[];

function Antet({ T, cue, st }: { T: number; cue: Cue; st: number }) {
  return (
    <g>
      {ANTETE.map((antet, i) => {
        const de = cue[antet.scena];
        const pana = ANTETE[i + 1] ? cue[ANTETE[i + 1]!.scena] : Number.POSITIVE_INFINITY;
        // Intrarea și ieșirea se suprapun cât o clipire: două antete deodată ar
        // fi două titluri, iar unul care sare ar rupe continuitatea desenului.
        const opacitate =
          clamp((T - (de + 0.15)) / 0.45, 0, 1) * clamp((pana - 0.15 - T) / 0.45, 0, 1);
        if (opacitate <= 0) return null;

        return (
          <g
            key={antet.scena}
            opacity={opacitate}
            transform={`translate(0, ${(1 - opacitate) * 14})`}
          >
            <text
              x={120}
              y={110}
              fill={culoareEticheta(antet.rol)}
              style={{
                font: `700 ${24 * Math.min(st, 1.35)}px var(--font-mono)`,
                letterSpacing: "0.18em",
              }}
            >
              {antet.supratitlu}
            </text>
            <text
              x={120}
              y={186}
              fill="var(--text)"
              style={{ font: `800 ${64 * Math.min(st, 1.35)}px var(--font-sans)` }}
            >
              {antet.titlu}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Desen() {
  const { T, cue, latime } = useClip<NumeScena>();
  const st = scaraText(latime);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      <Plan T={T} st={st} />
      <Sageata T={T} cue={cue} st={st} />
      <Panou T={T} cue={cue} st={st} />
      <Antet T={T} cue={cue} st={st} />
    </svg>
  );
}

/* ───────────────────────── piesa întreagă ───────────────────────── */

/**
 * Subtitrările, cheiate pe începuturile de scenă: 0 (Ideea), 13 (Directa),
 * 35 (Rayleigh), 53 (Inversa), 71 (Bilanț). Fiecare propoziție stă pe ecran
 * minimum patru secunde — cât se citește, nu cât durează gestul pe care îl
 * descrie.
 */
const SUBTITRARI = [
  { la: 0.8, text: "O valoare proprie e factorul cu care matricea doar lungește o direcție." },
  {
    la: 5.2,
    text: "Matricea asta are două astfel de direcții: pe una lungește de 4 ori, pe cealaltă de 2.",
  },
  { la: 9.6, text: "Săgeata de pornire nu e pe niciuna dintre ele — de aici pleacă metoda." },
  {
    la: 13.6,
    text: "Se înmulțește cu A: săgeata se lungește și se apleacă spre direcția dominantă.",
  },
  {
    la: 19.0,
    text: "Împărțirea la normă e normalizarea: fără ea, Aᵏv ar exploda sau s-ar stinge, după cum e λ₁ față de 1.",
  },
  {
    la: 25.0,
    text: "Câtul vᵀAv urcă spre 4, dar încet: rata e |λ₂|/|λ₁|, adică o jumătate la fiecare pas.",
  },
  {
    la: 35.6,
    text: "Iterarea Rayleigh folosește chiar estimarea curentă ca deplasare și rezolvă un sistem cu ea.",
  },
  { la: 43.0, text: "Cu fiecare pas deplasarea e mai bună, deci pasul următor sare mai mult." },
  {
    la: 53.6,
    text: "Puterea inversă rezolvă sisteme cu A: acolo, cea mai mică valoare proprie devine dominantă.",
  },
  { la: 61.0, text: "Săgeata se duce pe cealaltă diagonală, iar câtul se oprește pe 2." },
  { la: 71.5, text: "Două direcții, două metode, aceleași două numere." },
] as const;

/**
 * Clipul paginii 8: de la „ce e o valoare proprie" la puterea inversă, în
 * optzeci de secunde.
 *
 * **Clip scris în cod** (regula din `CLAUDE.md`), pe ceasul lui, fără parametrii
 * utilizatorului: matricea desenată e fixă, `A = [[3,1],[1,3]]`, cu valorile
 * proprii **exacte** 4 și 2 pe cele două diagonale ale planului. Alegerea e ce
 * face clipul posibil: în plan, iterația se vede ca o săgeată care se rotește,
 * ceea ce o matrice 3×3 n-ar putea arăta fără o proiecție scrisă de mână.
 *
 * **Deflația lipsește dinadins**: rămâne în teorie. Ce duce clipul e rotirea
 * unei direcții, iar deflația nu rotește nimic — scade o matrice, adică exact
 * genul de pas care se citește mai bine scris decât desenat.
 *
 * **Toate cifrele vin din `src/algorithms/metodele-puterii/`**, aceleași module
 * pe care le folosește interfața de sub el — inclusiv pornirea înclinată a
 * iterării Rayleigh, care nu e o alegere estetică: din `(1, 0)`, câtul Rayleigh
 * e exact 3, la mijloc între cele două valori proprii, iar iterația se blochează.
 */
export function AnimatiaMetodelorPuterii() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație: în plan se desenează cercul de rază 1 și cele două direcții pe care matricea " +
        "A = [[3,1],[1,3]] doar lungește vectorii — de 4 ori pe prima diagonală, de 2 ori pe a doua. " +
        "O săgeată de pornire e înmulțită repetat cu A și readusă pe cerc: se rotește către prima diagonală, " +
        "iar câtul vᵀAv urcă spre 4. Iterarea câtului Rayleigh ajunge la aceeași valoare în patru pași, " +
        "iar puterea inversă duce săgeata pe cealaltă diagonală, unde câtul se oprește pe 2."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
