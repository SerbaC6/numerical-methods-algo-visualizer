import { useMemo, useState } from "react";

import * as gaussSeidel from "@/algorithms/metode-iterative/gauss-seidel";
import * as jacobi from "@/algorithms/metode-iterative/jacobi";
import * as sor from "@/algorithms/metode-iterative/sor";
import { descrieComponenta } from "@/algorithms/metode-iterative/descriere";
import { SISTEME, SISTEM_IMPLICIT, type ValoriSistem } from "@/algorithms/metode-iterative/sisteme";
import type { RezultatIterativ } from "@/algorithms/metode-iterative/tipuri";
import { Callout } from "@/components/content/Callout";
import { GraficConvergenta, type RulareGrafic } from "@/components/content/GraficConvergenta";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ControlPanel } from "@/components/viz/ControlPanel";
import { FormulaBlock } from "@/components/viz/FormulaBlock";
import { Legend, type ElementLegenda } from "@/components/viz/Legend";
import { MatrixGrid, type StareCelula } from "@/components/viz/MatrixGrid";
import { Notatie } from "@/components/viz/Notatie";
import { NumberInput } from "@/components/viz/NumberInput";
import { PlaybackBar } from "@/components/viz/PlaybackBar";
import { StepExplanation } from "@/components/viz/StepExplanation";
import { useDerulare } from "@/hooks/use-derulare";
import { zecimale } from "@/lib/numere";

const METODE = [
  { id: "jacobi", titlu: "Jacobi", modul: jacobi },
  { id: "gauss-seidel", titlu: "Gauss-Seidel", modul: gaussSeidel },
  { id: "sor", titlu: "SOR", modul: sor },
] as const;

type IdMetoda = (typeof METODE)[number]["id"];

const MAX_ITERATII_PERMISE = 300;

type Camp = keyof ValoriSistem;
type Valori = Record<Camp, number | "">;

const CAMPURI_MATRICE: readonly Camp[] = [
  "a11",
  "a12",
  "a13",
  "a21",
  "a22",
  "a23",
  "a31",
  "a32",
  "a33",
  "b1",
  "b2",
  "b3",
];

/**
 * Interfața interactivă a paginii 5.
 *
 * Matematica **nu** stă aici: sistemul, pașii, formulele cu numerele puse în ele
 * și propozițiile care le descriu vin din `src/algorithms/metode-iterative/`.
 * Componenta leagă controalele de rulare și alege ce se arată.
 *
 * **Ce se poate atinge și ce nu.** Matricea se schimbă doar prin cele trei
 * sisteme gata alese — toate din curs, iar al treilea e chiar primul cu două
 * linii schimbate între ele. N-are câmpuri pentru cei nouă coeficienți dinadins:
 * ce **învață** aici nu e tastarea unei matrice, ci raza spectrală, `ω` și
 * ordinea liniilor. Se reglează, în schimb, exact lucrurile care schimbă
 * povestea: pornirea, `ω`, toleranța și numărul de iterații.
 *
 * **Două derulări, nu una.** Bara de jos merge pe iterații, fiindcă asta e
 * unitatea de măsură a metodei; butoanele de linie merg **înăuntrul** unei
 * iterații, fiindcă acolo se vede diferența dintre Jacobi și Gauss-Seidel.
 */
export function InterfataMetodeIterative() {
  const [idMetoda, setIdMetoda] = useState<IdMetoda>("gauss-seidel");
  const [valori, setValori] = useState<Valori>({ ...SISTEM_IMPLICIT });
  const [linie, setLinie] = useState(0);

  const seteaza = (camp: Camp) => (v: number | "") =>
    setValori((stare) => ({ ...stare, [camp]: v }));

  const incarcaSistem = (v: ValoriSistem) => setValori({ ...v });
  const esteAles = (v: ValoriSistem) => CAMPURI_MATRICE.every((camp) => valori[camp] === v[camp]);

  const numar = (valoare: number | "", implicit: number) =>
    typeof valoare === "number" && Number.isFinite(valoare) ? valoare : implicit;

  const A = useMemo(
    () => [
      [numar(valori.a11, 0), numar(valori.a12, 0), numar(valori.a13, 0)],
      [numar(valori.a21, 0), numar(valori.a22, 0), numar(valori.a23, 0)],
      [numar(valori.a31, 0), numar(valori.a32, 0), numar(valori.a33, 0)],
    ],
    [
      valori.a11,
      valori.a12,
      valori.a13,
      valori.a21,
      valori.a22,
      valori.a23,
      valori.a31,
      valori.a32,
      valori.a33,
    ],
  );
  const b = useMemo(
    () => [numar(valori.b1, 0), numar(valori.b2, 0), numar(valori.b3, 0)],
    [valori.b1, valori.b2, valori.b3],
  );
  const x0 = useMemo(
    () => [numar(valori.x01, 0), numar(valori.x02, 0), numar(valori.x03, 0)],
    [valori.x01, valori.x02, valori.x03],
  );

  const tolBruta = numar(valori.tol, SISTEM_IMPLICIT.tol);
  const tol = tolBruta > 0 ? tolBruta : SISTEM_IMPLICIT.tol;
  const maxIteratii = Math.min(
    MAX_ITERATII_PERMISE,
    Math.max(1, Math.round(numar(valori.maxIteratii, SISTEM_IMPLICIT.maxIteratii))),
  );
  const omega = numar(valori.omega, 1);

  const parametri = useMemo(
    () => ({ A, b, x0, tol, maxIteratii, omega }),
    [A, b, x0, tol, maxIteratii, omega],
  );

  const rezultat = useMemo<RezultatIterativ>(() => {
    const metoda = METODE.find((m) => m.id === idMetoda) ?? METODE[1];
    return metoda.modul.run(parametri);
  }, [idMetoda, parametri]);

  /** Toate trei, pe același sistem — de aici iese graficul de comparație. */
  const toate = useMemo(
    () => ({
      jacobi: jacobi.run(parametri),
      "gauss-seidel": gaussSeidel.run(parametri),
      sor: sor.run(parametri),
    }),
    [parametri],
  );

  const derulare = useDerulare(rezultat.pasi.length);
  const pas = rezultat.pasi[derulare.pas];
  const linieCurenta = Math.min(linie, (pas?.componente.length ?? 1) - 1);
  const componenta = pas?.componente[linieCurenta];
  const ultimulPas = derulare.pas === rezultat.pasi.length - 1;

  /** Matricea extinsă `[A|b]`, cu linia pe care se lucrează evidențiată. */
  const valoriMatrice = A.map((rand, i) => [...rand, b[i] ?? 0]);

  /**
   * Cele două coloane de valori. Starea fiecărei celule spune de unde vine
   * cifra: `calculat` pentru vectorul vechi (prezent, dar retras în plan
   * secund), `curent` pentru valoarea proaspătă pe care linia asta o citește
   * sau tocmai a scris-o.
   */
  const valoriVectori = pas
    ? pas.componente.map((c, i) => [pas.xAnterior[i] ?? 0, c.valoareNoua])
    : [];
  const stariVectori: StareCelula[][] = pas
    ? pas.componente.map((_, i) => {
        const provenienta = componenta?.citite[i];
        const vechiFolosit = provenienta === "veche";
        const nouFolosit = provenienta === "proaspata" || i === linieCurenta;
        return [vechiFolosit ? "curent" : "calculat", nouFolosit ? "curent" : "calculat"];
      })
    : [];

  return (
    <div className="flex flex-col gap-10">
      <Legend elemente={LEGENDA} />

      <Tabs
        value={idMetoda}
        onValueChange={(v) => {
          setIdMetoda(v as IdMetoda);
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
        <div className="grid lg:grid-cols-[minmax(0,1fr)_clamp(300px,26%,380px)]">
          <div className="flex min-w-0 flex-col gap-10 p-6 sm:p-8">
            {pas ? (
              <>
                <div className="flex flex-wrap items-start gap-10 sm:gap-14">
                  <MatrixGrid
                    valori={valoriMatrice}
                    titlu="A | b"
                    corp="mare"
                    separatorColoana={2}
                    linieActiva={linieCurenta}
                    descriere={`Sistemul, cu linia ${linieCurenta + 1} în lucru.`}
                  />
                  <MatrixGrid
                    valori={valoriVectori}
                    stari={stariVectori}
                    titlu="Vectorul x"
                    corp="mare"
                    etichetaColoane={["vechi", "nou"]}
                    etichetaLinii={["x₁", "x₂", "x₃"]}
                    linieActiva={linieCurenta}
                    formateaza={(v) => zecimale(v, 4)}
                    descriere={descrieComponenta(
                      componenta ?? pas.componente[0]!,
                      pas.iteratie,
                      idMetoda === "sor" ? omega : undefined,
                    )}
                  />
                </div>

                {/* Care linie din baleiaj se arată. E derularea **dinăuntrul**
                    unei iterații, acolo unde Jacobi și Gauss-Seidel chiar
                    diferă — bara de jos merge pe iterații întregi. */}
                <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Linia">
                  <span className="text-text-slab mr-1 text-base">Linia</span>
                  {pas.componente.map((c, i) => (
                    <Button
                      key={c.linie}
                      size="sm"
                      variant={i === linieCurenta ? "default" : "outline"}
                      className="tinta-atingere font-mono"
                      aria-pressed={i === linieCurenta}
                      onClick={() => setLinie(i)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                {componenta && (
                  <FormulaBlock
                    latex={componenta.latex}
                    eticheta="Linia asta, cu numerele în formulă"
                    evidentiaza={["iter-proaspat", "iter-nou-componenta"]}
                    className="text-[1.15rem] sm:text-[1.3rem]"
                  />
                )}
              </>
            ) : (
              <div className="text-text-slab flex min-h-[280px] items-center justify-center px-6 text-center text-lg text-pretty">
                <Notatie>{rezultat.motiv ?? ""}</Notatie>
              </div>
            )}
          </div>

          <ControlPanel
            onReset={() => setValori({ ...SISTEM_IMPLICIT })}
            incorporat
            className="border-bordura min-w-0 border-t lg:border-t-0 lg:border-l"
          >
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {SISTEME.map((sistem) => {
                const ales = esteAles(sistem.valori);
                return (
                  <Button
                    key={sistem.id}
                    variant={ales ? "default" : "outline"}
                    size="sm"
                    className="tinta-atingere"
                    aria-pressed={ales}
                    onClick={() => {
                      incarcaSistem(sistem.valori);
                      derulare.setPas(0);
                    }}
                  >
                    {sistem.eticheta}
                  </Button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              <NumberInput
                eticheta="x₁⁽⁰⁾"
                valoare={valori.x01}
                onChange={seteaza("x01")}
                pas={0.5}
              />
              <NumberInput
                eticheta="x₂⁽⁰⁾"
                valoare={valori.x02}
                onChange={seteaza("x02")}
                pas={0.5}
              />
              <NumberInput
                eticheta="x₃⁽⁰⁾"
                valoare={valori.x03}
                onChange={seteaza("x03")}
                pas={0.5}
              />
            </div>

            {/* ω apare **doar** la SOR: la celelalte două n-ar face nimic, iar un
                câmp care nu face nimic e mai rău decât unul care lipsește. */}
            {idMetoda === "sor" && (
              <NumberInput
                className="sm:col-span-2"
                eticheta="ω"
                valoare={valori.omega}
                onChange={seteaza("omega")}
                min={0.05}
                max={1.95}
                pas={0.05}
                ajutor="Sub 1 temperează corecția, peste 1 o amplifică."
                eroare={
                  typeof valori.omega === "number" && !(valori.omega > 0 && valori.omega < 2)
                    ? "ω trebuie să fie între 0 și 2."
                    : undefined
                }
              />
            )}

            <NumberInput
              className="sm:col-span-2"
              eticheta="Toleranța"
              valoare={valori.tol}
              onChange={seteaza("tol")}
              min={1e-14}
              pas={1e-8}
              unitate="ε"
              eroare={
                typeof valori.tol === "number" && valori.tol <= 0
                  ? "Toleranța trebuie să fie pozitivă."
                  : undefined
              }
            />
            <NumberInput
              className="sm:col-span-2"
              eticheta="Iterații maxime"
              valoare={valori.maxIteratii}
              onChange={seteaza("maxIteratii")}
              min={1}
              max={MAX_ITERATII_PERMISE}
              pas={1}
              eroare={
                typeof valori.maxIteratii === "number" && valori.maxIteratii > MAX_ITERATII_PERMISE
                  ? `Cel mult ${MAX_ITERATII_PERMISE} de iterații.`
                  : undefined
              }
            />
          </ControlPanel>
        </div>
      </div>

      {rezultat.pasi.length > 0 && (
        <>
          <PlaybackBar
            pas={derulare.pas}
            totalPasi={rezultat.pasi.length}
            ruleaza={derulare.ruleaza}
            viteza={derulare.viteza}
            onPas={derulare.setPas}
            onRuleazaChange={derulare.setRuleaza}
            onVitezaChange={derulare.setViteza}
          />

          {/* Propoziția pasului rămâne montată doar pentru cititorul de ecran:
              ea e regiunea `aria-live` care anunță fiecare iterație. */}
          <div className="sr-only">
            <StepExplanation
              explicatie={pas?.explicatie}
              pas={derulare.pas}
              totalPasi={rezultat.pasi.length}
              ruleaza={derulare.ruleaza}
            />
          </div>
        </>
      )}

      <Callout tip="retine" titlu="Ce spune raza spectrală">
        <Notatie>{descriereRaza(rezultat, idMetoda, omega)}</Notatie>
      </Callout>

      {rezultat.stare === "esuat" && (
        <Callout tip="atentie" titlu="Metoda s-a oprit">
          <Notatie>{rezultat.motiv ?? ""}</Notatie>
        </Callout>
      )}
      {ultimulPas && rezultat.stare === "neterminat" && (
        <Callout tip="atentie" titlu="S-au terminat iterațiile">
          <Notatie>{rezultat.motiv ?? ""}</Notatie>
        </Callout>
      )}

      <GraficConvergenta
        rulari={ordoneazaCurbe(idMetoda, [
          { id: "jacobi", eticheta: "Jacobi", rol: "anterior", pasi: toate.jacobi.pasi },
          {
            id: "gauss-seidel",
            eticheta: "Gauss-Seidel",
            rol: "curent",
            pasi: toate["gauss-seidel"].pasi,
          },
          {
            id: "sor",
            eticheta: `SOR (ω = ${zecimale(omega, 2)})`,
            rol: "solutie",
            pasi: toate.sor.pasi,
          },
        ])}
        toleranta={tol}
        iteratiaCurenta={derulare.pas}
      />
    </div>
  );
}

/**
 * Legenda.
 *
 * Primul rând nu descrie, ci **corectează**: „valoare veche" și „valoare
 * proaspătă" arată la fel dacă nu spui că diferența e de unde a fost citită, nu
 * ce cifră e scrisă acolo.
 */
const LEGENDA: ElementLegenda[] = [
  {
    rol: "curent",
    eticheta: "valorile citite de linia curentă",
    forma: "celula",
    explicatie: "La Gauss-Seidel, cele de deasupra diagonalei sunt deja rescrise.",
  },
  { rol: "anterior", eticheta: "valori neatinse de linia curentă", forma: "celula" },
  { rol: "interval", eticheta: "linia pe care se lucrează", forma: "zona" },
  { rol: "solutie", eticheta: "SOR, pe graficul de convergență", forma: "linie" },
];

/**
 * Curba metodei alese se desenează **ultima**, deci deasupra celorlalte.
 *
 * Nu e cosmetică: pentru `ω = 1` curbele SOR și Gauss-Seidel se suprapun exact,
 * fiind aceeași metodă. Fără regula asta, cea desenată a doua ar acoperi-o pe
 * cealaltă și ai crede că una dintre metode lipsește din grafic.
 */
function ordoneazaCurbe(idMetoda: IdMetoda, curbe: RulareGrafic[]): RulareGrafic[] {
  return [...curbe].sort((a, b) => Number(a.id === idMetoda) - Number(b.id === idMetoda));
}

/** Propoziția care traduce `ρ(G)` în „merge / nu merge / cât de repede". */
function descriereRaza(rezultat: RezultatIterativ, idMetoda: IdMetoda, omega: number): string {
  const nume =
    idMetoda === "jacobi" ? "Jacobi" : idMetoda === "gauss-seidel" ? "Gauss-Seidel" : "SOR";
  const raza = rezultat.razaSpectrala;
  const dominanta = rezultat.dominantDiagonala
    ? "Matricea e dominant diagonală, deci convergența e garantată pentru orice pornire."
    : "Matricea nu e dominant diagonală: condiția suficientă de convergență nu e îndeplinită, iar metoda poate să meargă sau nu.";

  if (raza === null) {
    return `Raza spectrală nu s-a putut calcula pentru matricea de iterație a metodei. ${dominanta}`;
  }

  const cuOmega = idMetoda === "sor" ? ` la ω = ${zecimale(omega, 2)}` : "";
  const verdict =
    Math.abs(raza - 1) < 1e-9
      ? "e exact 1, deci eroarea nu se micșorează niciodată: metoda se blochează, oricâte iterații i-ai da"
      : raza < 1
        ? `e ${zecimale(raza, 4)}, deci sub 1: eroarea se înmulțește cu atât la fiecare pas`
        : `e ${zecimale(raza, 4)}, deci peste 1: eroarea crește la fiecare pas și metoda diverge`;

  return `Pentru ${nume}${cuOmega}, raza spectrală a matricei de iterație ${verdict}. ${dominanta}`;
}
