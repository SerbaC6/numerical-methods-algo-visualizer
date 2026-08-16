import {
  adiacenta,
  google,
  gradeIesire,
  normalizeazaLinii,
  reteaDinCurs,
  transpune,
} from "@/algorithms/pagerank/retea";
import * as pagerank from "@/algorithms/pagerank/putere";
import { Clip } from "@/components/viz/Clip";
import { useClip } from "@/components/viz/clip-context";
import { Subtitrari } from "@/components/viz/Subtitrari";
import { animeaza, clamp, EASING, type Scena } from "@/lib/compozitie";
import { construiesteMuchii, pozitiiNoduri } from "@/lib/graf-orientat";
import { culoareEticheta, culoareRol } from "@/lib/viz-roles";

/* ───────────────────────── timpul ───────────────────────── */

/**
 * Scenele clipului, în ordine. Lista e schița piesei: numele, ordinea și
 * duratele stau aici, iar coregrafia se scrie exclusiv față de `cue.NumeScena`,
 * niciodată față de secunde scrise de mână.
 */
const SCENE = [
  {
    nume: "Graful",
    durata: 4,
    descriere: "Patru pagini apar, iar link-urile dintre ele se trasează unul câte unul.",
  },
  {
    nume: "Matricea",
    durata: 10.5,
    descriere:
      "Linie cu linie, link-urile devin 1 în matrice, fiecare linie se împarte la câte link-uri are, apoi matricea se transpune.",
  },
  {
    nume: "Google",
    durata: 6,
    descriere: "Peste M se adaugă saltul aleatoriu și valorile devin matricea Google.",
  },
  {
    nume: "Puterea",
    durata: 7.5,
    descriere: "Metoda puterii: iterații v ← G·v, cu barele ponderilor care se așază.",
  },
  {
    nume: "Rezultat",
    durata: 4,
    descriere: "Clasamentul final: nodurile cresc după rang și apar locurile, cu egalitatea lor.",
  },
] as const satisfies readonly Scena[];

type NumeScena = (typeof SCENE)[number]["nume"];
type Cue = Record<NumeScena, number>;

/** Cadrul arătat la `prefers-reduced-motion`: clasamentul așezat, cu tot desenul pe ecran. */
const CADRU_STATIC = 30;

/* ───────────────────────── matematica ───────────────────────── */

/**
 * Toate cifrele din clip vin din `src/algorithms/pagerank/` — aceleași module
 * pe care le folosește interfața de sub el. Altfel clipul ar putea ajunge să
 * arate un clasament, iar interfața altul.
 *
 * `d` e **fixat**: un clip nu primește parametrii utilizatorului (regula din
 * `src/components/viz/README.md`); sliderul e al interfeței interactive.
 */
const D = 0.85;
const RETEA = reteaDinCurs();
const A = adiacenta(RETEA);
const GRADE = gradeIesire(RETEA);
const S = normalizeazaLinii(A);
const M = transpune(S);
const G = google(M, D);

const RULARE = pagerank.run({ retea: RETEA, d: D, tol: 1e-6, maxIteratii: 200 });
/** Ponderile primelor iterații — cât încape într-o scenă de șapte secunde. */
const DISTRIBUTII = RULARE.pasi
  .filter((p) => p.faza === "iteratie")
  .map((p) => p.distributie ?? [])
  .slice(0, 6);
const FINAL = RULARE.pagerank ?? [];
const CLASAMENT = RULARE.clasament;
/** Locul fiecărei pagini, cu egalitățile păstrate: `P1` și `P4` împart locul 3. */
const LOC = RETEA.nume.map((_, i) => CLASAMENT.find((l) => l.pagina === i)?.loc ?? 0);
const N = RETEA.nume.length;

/** Ponderea de pornire, `v⁽⁰⁾` adus la sumă 1: toate paginile la fel. */
const PORNIRE = RETEA.nume.map(() => 1 / N);

const fractie = (v: number) => (v === 0 ? "0" : v === 1 ? "1" : `1/${Math.round(1 / v)}`);
const trei = (v: number) => v.toFixed(3).replace("0.", ",");

/* ───────────────────────── cadrul de desen ───────────────────────── */

const W = 1920;
const H = 1080;

/** Graful, în stânga. Geometria vine din același modul ca interfața de sub clip. */
const CENTRU = { x: 480, y: 620 };
const RAZA_CERC = 235;
const RAZA_NOD = 62;
const NODURI = pozitiiNoduri(N, CENTRU, RAZA_CERC);
const MUCHII = construiesteMuchii(NODURI, RETEA.linkuri, RAZA_NOD);

/** Umplerea unei celule nenule: safirul la 16 % peste suprafață. */
const UMPLERE_CELULA = `color-mix(in oklab, ${culoareRol("curent")} 16%, var(--suprafata))`;

/** Matricea, în dreapta. */
const CELULA = 104;
const SPATIU = 10;
const MX = 1000;
const MY = 330;
const colX = (c: number) => MX + c * (CELULA + SPATIU);
const linY = (r: number) => MY + r * (CELULA + SPATIU);
const LATIME_MATRICE = N * CELULA + (N - 1) * SPATIU;

/** Barele ponderilor, la marginea din dreapta. */
const BARA_X = 1530;
const BARA_LAT = 58;
const BARA_SPATIU = 26;
const BARA_BAZA = 830;
const BARA_INALTIME = 300;

/**
 * Cu cât se îngroașă literele desenului pe un cadru îngust — același truc ca la
 * clipul paginii 7: desenul are 1920 de unități oricât de mic ar fi pe ecran.
 */
const LATIME_CONFORT = 780;
const SCARA_MAXIMA = 2.4;
const scaraText = (latime: number) =>
  latime ? Math.min(SCARA_MAXIMA, Math.max(1, LATIME_CONFORT / latime)) : 1;

/* ───────────────────────── coregrafia ───────────────────────── */

/** Când apare linia `r` a adiacenței. */
const linieApare = (cue: Cue, r: number) => cue.Matricea + 0.5 + r * 0.65;
/** Când se împarte linia `r` la numărul ei de link-uri. */
const linieImparte = (cue: Cue, r: number) => cue.Matricea + 3.6 + r * 0.6;
/** Transpunerea: celula (i, j) alunecă în (j, i). */
const transpunereStart = (cue: Cue) => cue.Matricea + 7.1;
const transpunereFinal = (cue: Cue) => cue.Matricea + 8.9;
/** Valul care preface M în G, celulă cu celulă. */
const valGoogle = (cue: Cue, r: number, c: number) => cue.Google + 0.9 + (r + c) * 0.16;

/** Cât ține pe ecran o iterație a metodei puterii. */
const RITM_ITERATIE = 1.05;

/** Ponderile desenate la momentul `T`, interpolate între iterații. */
function ponderiLa(T: number, cue: Cue): { valori: number[]; iteratie: number } {
  const sir = [PORNIRE, ...DISTRIBUTII];
  const start = cue.Puterea + 0.7;
  const brut = clamp((T - start) / RITM_ITERATIE, 0, sir.length - 1);
  const k = Math.floor(brut);
  const frac = EASING.intrareIesireCubica(brut - k);

  const dela = sir[k] ?? PORNIRE;
  const la = sir[Math.min(k + 1, sir.length - 1)] ?? dela;
  const asezare = animeaza({
    dela: 0,
    la: 1,
    start: cue.Rezultat + 0.1,
    sfarsit: cue.Rezultat + 1.4,
  })(T);

  const valori = dela.map((v, i) => {
    const pas = v + ((la[i] ?? v) - v) * frac;
    return pas + ((FINAL[i] ?? pas) - pas) * asezare;
  });

  return { valori, iteratie: Math.min(Math.ceil(brut), DISTRIBUTII.length) };
}

/* ───────────────────────── piesele desenului ───────────────────────── */

/** Graful: nodurile apar pe rând, apoi se trasează muchiile. */
function Graf({ T, cue, st }: { T: number; cue: Cue; st: number }) {
  const { valori } = ponderiLa(T, cue);
  const creste = animeaza({ dela: 0, la: 1, start: cue.Rezultat, sfarsit: cue.Rezultat + 1.4 })(T);

  return (
    <g>
      <defs>
        <marker
          id="pagerank-varf"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="26"
          markerHeight="26"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill={culoareRol("functie")} />
        </marker>
      </defs>

      {MUCHII.map((muchie, k) => {
        const trasat = animeaza({
          dela: 0,
          la: 1,
          start: 1.3 + k * 0.35,
          sfarsit: 1.9 + k * 0.35,
        })(T);
        // Linia se trasează cu `stroke-dasharray`, ca la curba din clipul
        // paginii 7: lungimea e supraestimată dinadins, ca o muchie mai lungă
        // să nu apară deja desenată.
        return (
          <path
            key={`${muchie.dela}-${muchie.la}`}
            d={muchie.cale}
            fill="none"
            stroke={culoareRol("functie")}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={900}
            strokeDashoffset={900 * (1 - trasat)}
            markerEnd={trasat > 0.98 ? "url(#pagerank-varf)" : undefined}
            opacity={0.9}
          />
        );
      })}

      {NODURI.map((nod, i) => {
        const aparut = animeaza({
          dela: 0,
          la: 1,
          start: 0.25 + i * 0.22,
          sfarsit: 0.85 + i * 0.22,
          ease: EASING.iesireCuDepasire,
        })(T);
        // La final nodul se umflă după rang: al doilea semnal, pe lângă cifră.
        const marime = aparut * (1 + creste * ((valori[i] ?? 0) - 1 / N) * 2.2);
        const raza = RAZA_NOD * Math.max(marime, 0.001);
        const castigator = creste > 0.6 && LOC[i] === 1;

        return (
          <g key={i} opacity={aparut > 0 ? 1 : 0}>
            <circle
              cx={nod.x}
              cy={nod.y}
              r={raza}
              fill="var(--suprafata)"
              stroke={culoareRol(castigator ? "solutie" : "functie")}
              strokeWidth={castigator ? 6 : 4}
            />
            {castigator && (
              <circle
                cx={nod.x}
                cy={nod.y}
                r={raza + 16}
                fill="none"
                stroke={culoareRol("solutie")}
                strokeWidth={3}
                opacity={0.45}
              />
            )}
            <text
              x={nod.x}
              y={nod.y}
              dy="0.34em"
              textAnchor="middle"
              fill={culoareEticheta(castigator ? "solutie" : "functie")}
              style={{ font: `700 ${34 * Math.min(st, 1.2)}px var(--font-mono)` }}
            >
              {RETEA.nume[i]}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/**
 * Matricea, de la adiacență la G.
 *
 * O singură familie de celule pentru toată povestea: celula pornește pe poziția
 * `(r, c)` din adiacență și **alunecă** în `(c, r)` la transpunere — nu dispare
 * și nu se redesenează. Diagonala rămâne pe loc, ceea ce face vizibil de ce
 * transpunerea nu strică nimic din ce s-a împărțit deja.
 */
function Matrice({ T, cue, st }: { T: number; cue: Cue; st: number }) {
  const aparuta = animeaza({
    dela: 0,
    la: 1,
    start: cue.Matricea + 0.1,
    sfarsit: cue.Matricea + 0.6,
  })(T);
  const pTranspunere = animeaza({
    dela: 0,
    la: 1,
    start: transpunereStart(cue),
    sfarsit: transpunereFinal(cue),
  })(T);

  return (
    <g opacity={aparuta}>
      {/* Parantezele matricei: decor, ca la `MatrixGrid`. */}
      {[0, 1].map((parte) => {
        const x = parte === 0 ? MX - 34 : MX + LATIME_MATRICE + 14;
        const semn = parte === 0 ? 1 : -1;
        const sus = MY - 24;
        const jos = MY + LATIME_MATRICE + 24;
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

      {A.map((linie, r) =>
        linie.map((_, c) => {
          const nenul = A[r]![c]! > 0;
          const aparut = animeaza({
            dela: 0,
            la: 1,
            start: linieApare(cue, r),
            sfarsit: linieApare(cue, r) + 0.45,
            ease: EASING.iesireCuDepasire,
          })(T);
          const impartit = animeaza({
            dela: 0,
            la: 1,
            start: linieImparte(cue, r),
            sfarsit: linieImparte(cue, r) + 0.4,
          })(T);
          const spreGoogle = animeaza({
            dela: 0,
            la: 1,
            start: valGoogle(cue, c, r),
            sfarsit: valGoogle(cue, c, r) + 0.5,
          })(T);

          // Poziția: pleacă din (r, c) și ajunge în (c, r). Pe diagonală cele
          // două coincid, deci celula stă pe loc — asta se și vede.
          const x = colX(c) + (colX(r) - colX(c)) * pTranspunere;
          const y = linY(r) + (linY(c) - linY(r)) * pTranspunere;

          return (
            <g key={`${r}-${c}`} opacity={aparut} transform={`translate(${x} ${y})`}>
              <rect
                width={CELULA}
                height={CELULA}
                rx={12}
                // Umplerea celulei nenule e o **derivată** a safirului, nu o
                // culoare nouă: 16 % peste suprafață, cât să se vadă tiparul
                // matricei fără să înghită cifra de deasupra. Perechea
                // cifră/umplere e măsurată în `scripts/verifica-contrast.py`.
                fill={nenul ? UMPLERE_CELULA : "var(--suprafata)"}
                fillOpacity={nenul ? Math.max(aparut, spreGoogle) : 1}
                stroke={culoareRol("anterior")}
                strokeWidth={2}
                strokeOpacity={0.35}
              />
              <text
                x={CELULA / 2}
                y={CELULA / 2}
                dy="0.34em"
                textAnchor="middle"
                fill="var(--text)"
                style={{ font: `700 ${32 * Math.min(st, 1.2)}px var(--font-mono)` }}
              >
                {spreGoogle > 0.5
                  ? trei(G[c]![r]!)
                  : impartit > 0.5
                    ? fractie(S[r]![c]!)
                    : nenul
                      ? "1"
                      : "0"}
              </text>
            </g>
          );
        }),
      )}

      {/* Numele liniilor și coloanelor. Înainte de transpunere, linia i e „de
          unde pleacă"; după, coloana j spune același lucru — de aceea numele
          călătoresc odată cu matricea. */}
      {RETEA.nume.map((nume, i) => (
        <g key={nume}>
          <text
            x={colX(i) + CELULA / 2}
            y={MY - 34}
            textAnchor="middle"
            fill="var(--text-slab)"
            style={{ font: `700 ${28 * Math.min(st, 1.2)}px var(--font-mono)` }}
          >
            {nume}
          </text>
          <text
            x={MX - 56}
            y={linY(i) + CELULA / 2}
            dy="0.34em"
            textAnchor="end"
            fill="var(--text-slab)"
            style={{ font: `700 ${28 * Math.min(st, 1.2)}px var(--font-mono)` }}
          >
            {nume}
          </text>
        </g>
      ))}

      {/* „÷ 2" la capătul liniei care tocmai se împarte: împărțirea se face pe
          LINII, fiindcă link-urile de ieșire ale unei pagini stau pe linia ei. */}
      {GRADE.map((grad, r) => {
        const aparut =
          animeaza({
            dela: 0,
            la: 1,
            start: linieImparte(cue, r) - 0.3,
            sfarsit: linieImparte(cue, r) + 0.2,
            ease: EASING.iesireCuDepasire,
          })(T) *
          (1 -
            animeaza({
              dela: 0,
              la: 1,
              start: transpunereStart(cue) - 0.5,
              sfarsit: transpunereStart(cue) - 0.1,
            })(T));

        return (
          <text
            key={r}
            x={MX + LATIME_MATRICE + 60}
            y={linY(r) + CELULA / 2}
            dy="0.34em"
            fill={culoareEticheta("interval")}
            opacity={aparut}
            style={{ font: `700 ${28 * Math.min(st, 1.2)}px var(--font-mono)` }}
          >
            ÷ {grad}
          </text>
        );
      })}
    </g>
  );
}

/** Barele ponderilor și locurile din clasament. */
function Bare({ T, cue, st }: { T: number; cue: Cue; st: number }) {
  const vizibile = animeaza({
    dela: 0,
    la: 1,
    start: cue.Puterea + 0.1,
    sfarsit: cue.Puterea + 0.7,
  })(T);
  const { valori } = ponderiLa(T, cue);

  return (
    <g opacity={vizibile}>
      <line
        x1={BARA_X - 10}
        x2={BARA_X + N * BARA_LAT + (N - 1) * BARA_SPATIU + 10}
        y1={BARA_BAZA}
        y2={BARA_BAZA}
        stroke={culoareRol("anterior")}
        strokeWidth={3}
        opacity={0.6}
      />
      {valori.map((v, i) => {
        const inaltime = clamp(v / 0.42, 0, 1) * BARA_INALTIME;
        const x = BARA_X + i * (BARA_LAT + BARA_SPATIU);
        const locVizibil = animeaza({
          dela: 0,
          la: 1,
          start: cue.Rezultat + 0.4 + (LOC[i] ?? 1) * 0.2,
          sfarsit: cue.Rezultat + 1.0 + (LOC[i] ?? 1) * 0.2,
        })(T);

        return (
          <g key={i}>
            <rect
              x={x}
              y={BARA_BAZA - inaltime}
              width={BARA_LAT}
              height={inaltime}
              rx={8}
              fill={culoareRol("curent")}
            />
            <text
              x={x + BARA_LAT / 2}
              y={BARA_BAZA - inaltime - 18}
              textAnchor="middle"
              fill={culoareEticheta("curent")}
              style={{ font: `700 ${26 * Math.min(st, 1.2)}px var(--font-mono)` }}
            >
              {Math.round(v * 100)}%
            </text>
            <text
              x={x + BARA_LAT / 2}
              y={BARA_BAZA + 38}
              textAnchor="middle"
              fill="var(--text-slab)"
              style={{ font: `700 ${26 * Math.min(st, 1.2)}px var(--font-mono)` }}
            >
              {RETEA.nume[i]}
            </text>
            <text
              x={x + BARA_LAT / 2}
              y={BARA_BAZA + 80}
              textAnchor="middle"
              fill={culoareEticheta("solutie")}
              opacity={locVizibil}
              style={{ font: `700 ${26 * Math.min(st, 1.2)}px var(--font-mono)` }}
            >
              #{LOC[i]}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Formula scenei curente, scrisă mare deasupra matricei. */
function Formula({ T, cue, st }: { T: number; cue: Cue; st: number }) {
  const randuri: { text: string; de: number; pana: number }[] = [
    { text: "A — link-urile, pe linii", de: cue.Matricea + 0.4, pana: linieImparte(cue, 0) },
    {
      text: "S: fiecare linie ÷ câte link-uri are",
      de: linieImparte(cue, 0),
      pana: transpunereStart(cue),
    },
    { text: "M = Sᵀ — coloanele însumează 1", de: transpunereStart(cue), pana: cue.Google + 0.6 },
    { text: "G = d·M + ((1−d)/N)·ONES(N)", de: cue.Google + 0.6, pana: cue.Puterea + 0.4 },
    { text: "v ← G·v, până nu se mai schimbă", de: cue.Puterea + 0.4, pana: cue.Rezultat + 0.3 },
    { text: "R = v / ‖v‖₁ — clasamentul", de: cue.Rezultat + 0.3, pana: Number.POSITIVE_INFINITY },
  ];

  return (
    <g>
      {randuri.map((rand) => {
        const opacitate =
          clamp((T - rand.de) / 0.35, 0, 1) * clamp((rand.pana + 0.35 - T) / 0.35, 0, 1);
        if (opacitate <= 0) return null;
        return (
          <text
            key={rand.text}
            x={MX + LATIME_MATRICE / 2}
            y={MY - 100}
            textAnchor="middle"
            fill="var(--text)"
            opacity={opacitate}
            style={{ font: `700 ${34 * Math.min(st, 1.25)}px var(--font-mono)` }}
          >
            {rand.text}
          </text>
        );
      })}
    </g>
  );
}

function Desen() {
  const { T, cue, latime } = useClip<NumeScena>();
  const st = scaraText(latime);
  const titlu = clamp(T / 0.6, 0, 1) * clamp((cue.Matricea + 0.4 - T) / 0.5, 0, 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      <Graf T={T} cue={cue} st={st} />
      <Matrice T={T} cue={cue} st={st} />
      <Bare T={T} cue={cue} st={st} />
      <Formula T={T} cue={cue} st={st} />

      <g opacity={titlu} transform={`translate(0, ${(1 - titlu) * 16})`}>
        <text
          x={120}
          y={110}
          fill={culoareEticheta("curent")}
          style={{
            font: `700 ${24 * Math.min(st, 1.35)}px var(--font-mono)`,
            letterSpacing: "0.18em",
          }}
        >
          METODA PUTERII
        </text>
        <text
          x={120}
          y={186}
          fill="var(--text)"
          style={{ font: `800 ${64 * Math.min(st, 1.35)}px var(--font-sans)` }}
        >
          Matricea PageRank
        </text>
      </g>
    </svg>
  );
}

/* ───────────────────────── piesa întreagă ───────────────────────── */

const SUBTITRARI = [
  { la: 0.7, text: "Patru pagini, șase link-uri — un web în miniatură." },
  { la: 4.3, text: "Pe linia fiecărei pagini se notează link-urile care pleacă din ea." },
  {
    la: 7.8,
    text: "Cine pleacă își împarte atenția egal, deci fiecare linie se împarte la câte link-uri are.",
  },
  {
    la: 11.3,
    text: "Se transpune: acum coloanele însumează 1, iar coloana j spune unde ajunge cine e pe pagina j.",
  },
  {
    la: 15.0,
    text: "Peste M se adaugă saltul aleatoriu — cu probabilitatea 1 − d, navigatorul sare oriunde.",
  },
  {
    la: 21.0,
    text: "Metoda puterii: se înmulțește iar și iar cu G, până când ponderile nu se mai schimbă.",
  },
  {
    la: 28.3,
    text: "Vectorul care nu se mai schimbă e chiar clasamentul: P3 iese prima, iar P1 și P4 sunt la egalitate.",
  },
] as const;

/**
 * Clipul paginii 9: de la graful de link-uri la clasamentul PageRank.
 *
 * **Portat dintr-o animație web gata făcută** (`animatii-sursa/Matricea PageRank.html`),
 * rescris ca scenă pe ceasul `Clip`. Ca orice clip, **nu** primește parametrii
 * utilizatorului: `d` e fixat la 0,85.
 *
 * **Toate cifrele vin din `src/algorithms/pagerank/`**, aceleași module pe care
 * le folosește interfața — altfel clipul ar putea arăta un clasament, iar
 * interfața altul. Față de originalul de pe fundal alb, culorile vin din
 * `viz-roles.ts`, deci clipul se vede corect în ambele teme, iar scena matricei
 * a fost rescrisă pe **linii plus transpunere**, ca să spună aceeași poveste ca
 * interfața (și ca regula scrisă a cursului — vezi `docs/erata-cursuri.md`).
 */
export function AnimatiaMatriceiPageRank() {
  return (
    <Clip
      scene={SCENE}
      timpStatic={CADRU_STATIC}
      descriere={
        "Animație: patru pagini web și link-urile dintre ele devin o matrice. " +
        "Fiecare linie se împarte la numărul de link-uri care pleacă din pagina ei, matricea se transpune, " +
        "apoi i se adaugă saltul aleatoriu. Înmulțind repetat un vector cu matricea rezultată, ponderile paginilor " +
        "se așază: P3 iese prima, P2 a doua, iar P1 și P4 rămân la egalitate."
      }
    >
      <Desen />
      <Subtitrari items={SUBTITRARI} />
    </Clip>
  );
}
