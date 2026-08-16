import { useMemo, useRef, useState } from "react";

import { matriceaPlana, run, runInversa, runRayleigh } from "@/algorithms/metodele-puterii/putere";
import { inmultesteVector, norma2 } from "@/algorithms/metodele-puterii/matrice";
import {
  normaSpectrala2x2,
  spectru2x2,
  type Spectru2x2,
} from "@/algorithms/metodele-puterii/spectru";
import type { Matrice, PasPutere } from "@/algorithms/metodele-puterii/tipuri";
import { Callout } from "@/components/content/Callout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ControlPanel } from "@/components/viz/ControlPanel";
import { FormulaBlock } from "@/components/viz/FormulaBlock";
import { IterationTable } from "@/components/viz/IterationTable";
import { AceeasiInaltime } from "@/components/viz/AceeasiInaltime";
import { Legend, type ElementLegenda } from "@/components/viz/Legend";
import { Notatie } from "@/components/viz/Notatie";
import { NumberInput } from "@/components/viz/NumberInput";
import { PlaybackBar } from "@/components/viz/PlaybackBar";
import { StepExplanation } from "@/components/viz/StepExplanation";
import { useDerulare } from "@/hooks/use-derulare";
import { zecimale } from "@/lib/numere";
import { culoareEticheta, culoareRol } from "@/lib/viz-roles";

const METODE = [
  { id: "directa", titlu: "Metoda puterii" },
  { id: "inversa", titlu: "Puterea inversă" },
  { id: "rayleigh", titlu: "Iterarea Rayleigh" },
] as const;

type Metoda = (typeof METODE)[number]["id"];

const CIFRE_JOS = "₀₁₂₃₄₅₆₇₈₉";
const indice = (n: number): string =>
  String(n)
    .split("")
    .map((c) => CIFRE_JOS[Number(c)] ?? c)
    .join("");

const vector = (v: number[]) => `(${v.map((x) => zecimale(x, 6)).join("; ")})`;

/* ───────────────────────── cadrul desenului ───────────────────────── */

const W = 560;
const H = 440;
const O = { x: W / 2, y: H / 2 };
/** Cât spațiu are desenul de la origine până la marginea cadrului. */
const RAZA = 175;

/**
 * Câți pași arată fiecare tab, oricât ar scrie în „Iterații maxime".
 *
 * Plafoanele sunt ale metodelor, nu ale câmpului, și au același motiv: după ele
 * nu se mai schimbă nimic **pe desen**. Direcția e deja așezată, iar iterațiile
 * care urmează nu mai fac decât să scadă zecimale — treabă de tabel, nu de
 * săgeată. Iterarea Rayleigh n-are plafon fiindcă n-are nevoie: se oprește
 * singură din trei-patru pași.
 */
const MAXIM_DIRECTA = 11;
const MAXIM_INVERSA = 12;

/**
 * Interfața interactivă a paginii 8: iterația desenată **în plan**, pe o matrice
 * `2×2` editabilă.
 *
 * **De ce în plan și de ce 2×2.** Metodele puterii rotesc o direcție până se
 * așază pe una proprie, iar asta e o afirmație geometrică: se vede sau nu se
 * vede. Pe o matrice `3×3` nu se vede — vectorul are trei componente și n-ar
 * putea fi desenat fără o proiecție scrisă de mână, care ar adăuga un al doilea
 * lucru de înțeles pe lângă metodă. La ordinul 2, direcțiile proprii se și
 * calculează exact (`spectru2x2`), deci desenul poate arăta **ținta** din primul
 * cadru, înainte ca metoda să facă vreun pas: de acolo se citește dintr-o
 * privire dacă iterația merge unde trebuie și cât de repede.
 *
 * **Vectorul de pornire se trage cu mâna, pe desen.** E singurul parametru al
 * cărui efect nu se poate ghici din cifre: aceeași matrice, pornită din altă
 * direcție, cere alt număr de iterații.
 *
 * Matematica nu stă aici: iterațiile, câtul Rayleigh și propoziția fiecărui pas
 * vin din `src/algorithms/metodele-puterii/`. Componenta traduce pasul în
 * desen — atât.
 */
export function InterfataMetodelorPuterii() {
  const [metoda, setMetoda] = useState<Metoda>("directa");
  const [matrice, setMatrice] = useState<Matrice>(() => matriceaPlana());
  const [pornire, setPornire] = useState<number[]>([1, 0.15]);
  const [q, setQ] = useState(0);
  const [tol, setTol] = useState(1e-8);
  const [maxIteratii, setMaxIteratii] = useState(60);

  const spectru = useMemo(() => spectru2x2(matrice), [matrice]);

  const rezultat = useMemo(() => {
    if (metoda === "inversa")
      return runInversa({
        A: matrice,
        pornire,
        tol,
        maxIteratii: Math.min(maxIteratii, MAXIM_INVERSA),
        deplasare: q,
      });
    if (metoda === "rayleigh") return runRayleigh({ A: matrice, pornire, tol, maxIteratii });
    // Rata metodei directe e |λ₂|/|λ₁|, deci pe multe matrice ar cere zeci de
    // iterații ca să atingă toleranța, iar desenul s-ar umple de direcții care
    // nu se mai deosebesc între ele. Ce e de văzut — cum se apleacă săgeata spre
    // direcția dominantă și cât de încet o face — se vede în primii pași.
    return run({ A: matrice, pornire, tol, maxIteratii: Math.min(maxIteratii, MAXIM_DIRECTA) });
  }, [matrice, pornire, tol, maxIteratii, metoda, q]);

  const totalPasi = rezultat.pasi.length;
  const derulare = useDerulare(totalPasi);
  const pas = rezultat.pasi[derulare.pas];
  // Cu zero pași nu există „ultimul", dar motivul opririi trebuie arătat oricum:
  // altfel o metodă care nu poate face nici primul pas lasă pagina goală.
  const ultimulPas = totalPasi === 0 || derulare.pas === totalPasi - 1;

  const schimbaCelula = (i: number, j: number, valoare: number | "") => {
    setMatrice((veche) =>
      veche.map((linie, li) =>
        li === i ? linie.map((v, lj) => (lj === j ? (valoare === "" ? 0 : valoare) : v)) : linie,
      ),
    );
    derulare.setPas(0);
  };

  const schimbaPornire = (i: number, valoare: number | "") => {
    setPornire((v) => v.map((x, k) => (k === i ? (valoare === "" ? 0 : valoare) : x)));
    derulare.setPas(0);
  };

  const reseteaza = () => {
    setMatrice(matriceaPlana());
    setPornire([1, 0.15]);
    setQ(0);
    derulare.setPas(0);
  };

  return (
    <div className="flex flex-col gap-8">
      <Legend elemente={legenda(metoda)} />

      {/* La schimbarea tabului derularea se ia de la capăt: pasul 4 al metodei
          directe și pasul 4 al iterării Rayleigh nu sunt același moment. */}
      <Tabs
        value={metoda}
        onValueChange={(x) => {
          setMetoda(x as Metoda);
          derulare.setPas(0);
        }}
      >
        <TabsList className="w-full">
          {METODE.map((m) => (
            <TabsTrigger key={m.id} value={m.id} className="flex-1">
              {m.titlu}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="bg-suprafata border-bordura shadow-jos overflow-hidden rounded-xl border">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_clamp(300px,30%,400px)]">
          <div className="flex min-w-0 flex-col items-center justify-center gap-4 p-5 sm:p-7">
            <PlanulIteratiei
              matrice={matrice}
              spectru={spectru}
              pas={pas}
              pasiAnteriori={rezultat.pasi.slice(0, derulare.pas)}
              pornire={pornire}
              aratamProdusul={metoda === "directa"}
              onTrage={(v) => {
                setPornire(v);
                derulare.setPas(0);
              }}
            />
            <ValoareaCurenta pas={pas} spectru={spectru} />
          </div>

          <ControlPanel
            onReset={reseteaza}
            incorporat
            className="border-bordura min-w-0 border-t lg:border-t-0 lg:border-l"
          >
            {matrice.map((linie, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                {linie.map((valoare, j) => (
                  <NumberInput
                    key={j}
                    eticheta={`a${indice(i + 1)}${indice(j + 1)}`}
                    valoare={valoare}
                    onChange={(x) => schimbaCelula(i, j, x)}
                    pas={0.1}
                  />
                ))}
              </div>
            ))}

            <div className="grid grid-cols-2 gap-2">
              {pornire.map((valoare, i) => (
                <NumberInput
                  key={i}
                  eticheta={`v⁽⁰⁾${indice(i + 1)}`}
                  valoare={valoare}
                  onChange={(x) => schimbaPornire(i, x)}
                  pas={0.1}
                />
              ))}
            </div>

            {/* Deplasarea e numai a puterii inverse, dar locul ei rămâne
                ocupat pe celelalte două taburi: altfel panoul — și cu el tot
                blocul — s-ar scurta cu un câmp la fiecare schimbare de tab. */}
            <AceeasiInaltime
              activa={metoda === "inversa" ? 0 : 1}
              variante={[
                <NumberInput
                  key="q"
                  eticheta="q"
                  valoare={q}
                  onChange={(x) => {
                    setQ(x === "" ? 0 : x);
                    derulare.setPas(0);
                  }}
                  pas={0.1}
                />,
                <div key="gol" />,
              ]}
            />

            <NumberInput
              eticheta="Toleranța"
              valoare={tol}
              onChange={(x) => setTol(x === "" ? 1e-8 : x)}
              pas={1e-9}
            />
            <NumberInput
              eticheta="Iterații maxime"
              valoare={maxIteratii}
              onChange={(x) => setMaxIteratii(x === "" ? 1 : Math.max(1, Math.round(x)))}
              pas={1}
            />
          </ControlPanel>
        </div>
      </div>

      <PlaybackBar
        pas={derulare.pas}
        totalPasi={totalPasi}
        ruleaza={derulare.ruleaza}
        viteza={derulare.viteza}
        onPas={derulare.setPas}
        onRuleazaChange={derulare.setRuleaza}
        onVitezaChange={derulare.setViteza}
      />

      <StepExplanation
        explicatie={pas ? <Notatie>{pas.explicatie}</Notatie> : undefined}
        pas={derulare.pas}
        totalPasi={totalPasi}
        ruleaza={derulare.ruleaza}
      />

      {pas && (
        <FormulaBlock
          latex={pas.latexPas}
          eticheta="Pasul acesta, cu numerele în formulă"
          evidentiaza={pas.evidentiaza}
          className="text-[1.05rem] sm:text-[1.2rem]"
        />
      )}

      {rezultat.pasi.length > 0 && (
        <IterationTable
          coloane={[
            {
              cheie: "lambda",
              titlu: <Notatie>λ⁽ᵏ⁾</Notatie>,
              descriere: "Câtul Rayleigh al vectorului obținut la pasul k.",
            },
            ...(metoda === "directa"
              ? []
              : [
                  {
                    cheie: "deplasare",
                    titlu: <Notatie>deplasarea</Notatie>,
                    descriere:
                      "q, fix la puterea inversă; la iterarea Rayleigh, câtul vectorului dinainte.",
                  },
                ]),
            {
              cheie: "eroare",
              titlu: <Notatie>‖v⁽ᵏ⁾ − v⁽ᵏ⁻¹⁾‖</Notatie>,
              descriere: "Criteriul de oprire din curs.",
            },
          ]}
          randuri={rezultat.pasi.map((p) => ({
            lambda: zecimale(p.lambda, 8),
            deplasare: p.deplasare === undefined ? "—" : zecimale(p.deplasare, 8),
            eroare: zecimale(p.eroare, 10),
          }))}
          randCurent={derulare.pas}
          primaIteratie={1}
          onAlegeRand={derulare.setPas}
          // Înălțime fixă: metoda directă are unsprezece rânduri, iterarea
          // Rayleigh trei-patru, iar un tabel care se strânge ar trage toată
          // pagina în sus la schimbarea tabului.
          className="h-96"
        />
      )}

      {/* Valorile complex conjugate nu sunt o eroare a metodei, ci o ipoteză
          căzută: se scrie, nu se colorează nimic pe desen. */}
      {!spectru.reale && (
        <Callout tip="atentie" titlu="Matricea n-are direcții proprii reale">
          <Notatie>
            {`Valorile proprii sunt ${zecimale(spectru.parteReala, 4)} ± ${zecimale(spectru.parteImaginara, 4)}·i, deci au același modul și niciun vector real nu-și păstrează direcția — matricea îi rotește pe toți. Ipoteza |λ₁| > |λ₂| a metodei puterii cade, iar iterația se învârte fără să se apropie de ceva.`}
          </Notatie>
        </Callout>
      )}

      {rezultat.stare !== "convergent" && ultimulPas && rezultat.motiv && (
        <Callout tip="atentie" titlu="Iterația s-a oprit">
          <Notatie>{rezultat.motiv}</Notatie>
        </Callout>
      )}

      {rezultat.stare === "convergent" && ultimulPas && rezultat.lambda !== null && (
        <Callout tip="retine" titlu="Rezultatul">
          <Notatie>
            {`λ = ${zecimale(rezultat.lambda, 10)}, cu vectorul propriu ${vector(rezultat.v ?? [])}. Direcția e ce se determină: și −v e vector propriu pentru aceeași valoare.`}
          </Notatie>
        </Callout>
      )}
    </div>
  );
}

/* ───────────────────────── desenul ───────────────────────── */

type PlanProps = {
  matrice: Matrice;
  spectru: Spectru2x2;
  pas: PasPutere | undefined;
  /** Pașii deja parcurși — urma lăsată de iterație pe drum. */
  pasiAnteriori: PasPutere[];
  pornire: number[];
  /** Doar metoda directă are ce arăta între doi pași: `A·v`, înainte de normalizare. */
  aratamProdusul: boolean;
  onTrage: (v: number[]) => void;
};

/**
 * Planul iterației: cercul de rază 1, direcțiile proprii adevărate și săgeata
 * care se rotește către una dintre ele.
 *
 * Scara e calculată din **cel mai lung lucru desenat la pasul curent**, adică
 * `A·v` la metoda directă; restul stă oricum pe cercul de rază 1. Fără asta,
 * `A·v` ar ieși din cadru exact pe matricele cu valori proprii mari, adică
 * tocmai acolo unde e mai mult de văzut.
 */
function PlanulIteratiei({
  matrice,
  spectru,
  pas,
  pasiAnteriori,
  pornire,
  aratamProdusul,
  onTrage,
}: PlanProps) {
  const svg = useRef<SVGSVGElement>(null);
  const [trage, setTrage] = useState(false);

  const produs = pas && aratamProdusul ? inmultesteVector(matrice, pas.vAnterior) : null;
  // Scara vine din matrice, nu din pasul curent și nici din tabul ales: `‖A‖₂` e
  // cel mai lung `A·v` posibil pentru un `v` de pe cerc, deci încape orice pas
  // al oricărei metode. Așa, cercul unitate are aceeași rază tot timpul și în
  // toate cele trei taburi — se schimbă doar când editezi chiar matricea.
  const unitate = RAZA / Math.max(1.15, normaSpectrala2x2(matrice));
  const px = (v: number[]) => ({
    x: O.x + (v[0] ?? 0) * unitate,
    y: O.y - (v[1] ?? 0) * unitate,
  });

  /** Punctul de sub deget, în coordonatele planului. */
  const dinEcran = (e: { clientX: number; clientY: number }): number[] | null => {
    const cadru = svg.current?.getBoundingClientRect();
    if (!cadru || cadru.width === 0) return null;
    const x = ((e.clientX - cadru.left) / cadru.width) * W;
    const y = ((e.clientY - cadru.top) / cadru.height) * H;
    const v = [(x - O.x) / unitate, -(y - O.y) / unitate];
    // Sub o miime nu mai există direcție, iar vectorul nul nu s-ar putea
    // normaliza: degetul ajuns fix în origine nu trebuie să strice rularea.
    return norma2(v) < 1e-3 ? null : v;
  };

  const mutaPornirea = (e: React.PointerEvent) => {
    const v = dinEcran(e);
    if (v) onTrage(v);
  };

  const pornirea = px(pornire.map((x) => x / Math.max(norma2(pornire), 1e-9)));
  const curent = pas ? px(pas.v) : pornirea;

  return (
    <figure className="m-0 w-full max-w-[560px]">
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="touch-none select-none"
        style={{ cursor: trage ? "grabbing" : "grab" }}
        role="img"
        aria-label={descriere(spectru, pas, pornire)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setTrage(true);
          mutaPornirea(e);
        }}
        onPointerMove={(e) => {
          if (trage) mutaPornirea(e);
        }}
        onPointerUp={() => setTrage(false)}
        onPointerCancel={() => setTrage(false)}
      >
        <defs>
          {(["curent", "anterior"] as const).map((rol) => (
            <marker
              key={rol}
              id={`mp-i-${rol}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="9"
              markerHeight="9"
              markerUnits="userSpaceOnUse"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill={culoareRol(rol)} />
            </marker>
          ))}
        </defs>

        {/* Axele și cercul de rază 1 — reperul față de care se citește tot. */}
        <line
          x1={O.x - RAZA}
          x2={O.x + RAZA}
          y1={O.y}
          y2={O.y}
          stroke={culoareRol("grila")}
          strokeWidth={1.5}
          opacity={0.7}
        />
        <line
          x1={O.x}
          x2={O.x}
          y1={O.y - RAZA}
          y2={O.y + RAZA}
          stroke={culoareRol("grila")}
          strokeWidth={1.5}
          opacity={0.7}
        />
        <circle
          cx={O.x}
          cy={O.y}
          r={unitate}
          fill="none"
          stroke={culoareRol("grila")}
          strokeWidth={1.5}
          strokeDasharray="5 6"
          opacity={0.9}
        />

        {/* Direcțiile proprii adevărate: ținta, trasată înainte de primul pas. */}
        {spectru.reale &&
          spectru.directii.map((d, i) => {
            const rol = i === 0 ? "solutie" : "interval";
            const lungime = RAZA / unitate;
            const a = px(d.map((x) => -x * lungime));
            const b = px(d.map((x) => x * lungime));
            const et = px(d.map((x) => x * lungime * 0.8));
            return (
              <g key={i}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={culoareRol(rol)}
                  strokeWidth={2}
                  strokeDasharray="8 7"
                  opacity={0.85}
                />
                <text
                  x={et.x}
                  y={et.y - 8}
                  textAnchor="middle"
                  fill={culoareEticheta(rol)}
                  className="font-mono text-[13px] font-bold"
                >
                  {`λ${indice(i + 1)} = ${zecimale(spectru.valori[i] ?? 0, 3)}`}
                </text>
              </g>
            );
          })}

        {/* Urma: direcțiile prin care a trecut iterația până aici. */}
        {pasiAnteriori.map((p) => {
          const capat = px(p.v);
          return (
            <line
              key={p.iteratie}
              x1={O.x}
              y1={O.y}
              x2={capat.x}
              y2={capat.y}
              stroke={culoareRol("anterior")}
              strokeWidth={2}
              opacity={0.45}
            />
          );
        })}

        {/* `A·v`, înainte de împărțirea la normă: se vede și cât lungește
            matricea, nu doar încotro rotește. */}
        {produs && (
          <>
            <line
              x1={O.x}
              y1={O.y}
              x2={px(produs).x}
              y2={px(produs).y}
              stroke={culoareRol("anterior")}
              strokeWidth={2.5}
              strokeDasharray="7 5"
              markerEnd="url(#mp-i-anterior)"
            />
            <text
              x={px(produs).x + 10}
              y={px(produs).y - 10}
              fill={culoareEticheta("anterior")}
              className="font-mono text-[13px] font-bold"
            >
              A·v
            </text>
          </>
        )}

        {/* Vectorul de pornire: mânerul care se trage. */}
        <circle
          cx={pornirea.x}
          cy={pornirea.y}
          r={7}
          fill="var(--suprafata)"
          stroke={culoareRol("anterior")}
          strokeWidth={2.5}
        />
        <text
          x={pornirea.x + 12}
          y={pornirea.y + 16}
          fill={culoareEticheta("anterior")}
          className="font-mono text-[13px] font-bold"
        >
          v⁽⁰⁾
        </text>

        {/* Iterația curentă. */}
        <line
          x1={O.x}
          y1={O.y}
          x2={curent.x}
          y2={curent.y}
          stroke={culoareRol("curent")}
          strokeWidth={4}
          strokeLinecap="round"
          markerEnd="url(#mp-i-curent)"
        />
        {pas && (
          <text
            x={curent.x + 12}
            y={curent.y - 10}
            fill={culoareEticheta("curent")}
            className="font-mono text-[13px] font-bold"
          >
            {`v⁽${pas.iteratie}⁾`}
          </text>
        )}
      </svg>
    </figure>
  );
}

/**
 * Valoarea proprie estimată la pasul curent, plus rata care spune cât o să dureze.
 *
 * Sloturile sunt **întotdeauna trei**, chiar dacă unul e gol: deplasarea există
 * doar la două dintre metode, iar apărând și dispărând ar muta desenul de
 * deasupra cu un rând de fiecare dată când schimbi tabul.
 */
function ValoareaCurenta({ pas, spectru }: { pas: PasPutere | undefined; spectru: Spectru2x2 }) {
  return (
    <div className="flex min-h-7 flex-wrap items-baseline justify-center gap-x-6 gap-y-1 text-center">
      <p className="m-0 font-mono text-sm">
        <span className="text-text-slab">
          <Notatie>λ⁽ᵏ⁾ = v⁽ᵏ⁾ᵀ·A·v⁽ᵏ⁾ = </Notatie>
        </span>
        <span
          className="text-xl font-bold tabular-nums"
          style={{ color: culoareEticheta("curent") }}
        >
          {pas ? zecimale(pas.lambda, 6) : "—"}
        </span>
      </p>
      <p
        className="text-text-slab m-0 font-mono text-sm"
        aria-hidden={pas?.deplasare === undefined}
      >
        {pas?.deplasare === undefined ? (
          <span className="invisible">deplasarea: 0,000000</span>
        ) : (
          <Notatie>{`deplasarea: ${zecimale(pas.deplasare, 6)}`}</Notatie>
        )}
      </p>
      <p className="text-text-slab m-0 font-mono text-sm" aria-hidden={!spectru.reale}>
        {spectru.reale ? (
          <Notatie>{`|λ₂|/|λ₁| = ${zecimale(spectru.rata, 4)}`}</Notatie>
        ) : (
          <span className="invisible">|λ₂|/|λ₁| = 0,0000</span>
        )}
      </p>
    </div>
  );
}

/** Ce se vede pe desen, în cuvinte — pentru cine nu-l vede. */
function descriere(spectru: Spectru2x2, pas: PasPutere | undefined, pornire: number[]): string {
  const tinta = spectru.reale
    ? `Direcțiile proprii adevărate sunt trasate punctat: ${vector(spectru.directii[0])} pentru λ₁ = ${zecimale(spectru.valori[0], 4)} și ${vector(spectru.directii[1])} pentru λ₂ = ${zecimale(spectru.valori[1], 4)}.`
    : "Matricea n-are direcții proprii reale, deci desenul nu are nicio direcție-țintă de arătat.";
  const acum = pas
    ? `La iterația ${pas.iteratie}, vectorul e ${vector(pas.v)}, iar câtul Rayleigh dă ${zecimale(pas.lambda, 6)}.`
    : "Iterația n-a făcut încă niciun pas.";
  return `Planul iterației, cu cercul de rază 1 și vectorul de pornire ${vector(pornire)}. ${tinta} ${acum}`;
}

/* ───────────────────────── legenda ───────────────────────── */

/**
 * Legenda are **șase intrări la fiecare tab**, ca înălțimea ei să nu se schimbe
 * la schimbarea metodei. Nu e o umplutură: a șasea e mereu ceva chiar desenat —
 * `A·v` la metoda directă, care e singura ce iese din cerc, și mânerul de
 * pornire la celelalte două, unde nu există un al doilea vector de arătat.
 */
function legenda(metoda: Metoda): ElementLegenda[] {
  const comune: ElementLegenda[] = [
    { rol: "curent", eticheta: "v⁽ᵏ⁾ — direcția obținută acum", forma: "linie" },
    { rol: "anterior", eticheta: "direcțiile prin care a trecut iterația", forma: "linie" },
    {
      rol: "solutie",
      eticheta: "direcția proprie a lui λ₁, cea mai mare în modul",
      forma: "linie-punctata",
    },
    { rol: "interval", eticheta: "direcția proprie a lui λ₂", forma: "linie-punctata" },
    {
      rol: "grila",
      eticheta: "cercul de rază 1, unde ajunge orice vector normalizat",
      forma: "linie-punctata",
    },
  ];

  if (metoda === "directa") {
    return [
      ...comune,
      {
        rol: "anterior",
        eticheta: "A·v, înainte de împărțirea la normă",
        forma: "linie-punctata",
      },
    ];
  }
  return [
    ...comune,
    {
      rol: "anterior",
      eticheta: "v⁽⁰⁾ — vectorul de pornire, care se trage cu mâna",
      forma: "punct",
    },
  ];
}
