import { useMemo, useState } from "react";

import { baleiazaH } from "@/algorithms/derivare-numerica/eroare";
import { FORMULE, getFormula, noduriConcrete } from "@/algorithms/derivare-numerica/formule";
import { FUNCTII, getFunctie } from "@/algorithms/functii";
import { Callout } from "@/components/content/Callout";
import { GraficEroareH } from "@/components/content/GraficEroareH";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ControlPanel } from "@/components/viz/ControlPanel";
import { FormulaBlock } from "@/components/viz/FormulaBlock";
import { Legend, type ElementLegenda } from "@/components/viz/Legend";
import { Notatie } from "@/components/viz/Notatie";
import { NumberInput } from "@/components/viz/NumberInput";
import { Plot } from "@/components/viz/Plot";
import { PlotCurba } from "@/components/viz/PlotCurba";
import { PlotDreapta } from "@/components/viz/PlotDreapta";
import { PlotPunct } from "@/components/viz/PlotPunct";
import { esantioneaza, sparge } from "@/lib/plot-esantionare";
import { stiintific, zecimale } from "@/lib/numere";

/** Doar formulele pentru derivata întâi: pe grafic, panta e pantă. */
const FORMULE_PANTA = FORMULE.filter((f) => f.ordin === 1);

/** `h` se alege pe scară logaritmică: exponentul, nu valoarea. */
const EXPONENT_MIN = -12;
const EXPONENT_MAX = 0;

/**
 * Interfața interactivă a paginii 16.
 *
 * **Două desene, aceeași poveste.** Sus, geometria: secanta care se apropie de
 * tangentă când `h` scade. Jos, consecința numerică: eroarea în funcție de `h`,
 * pe log-log, cu forma ei de V. Primul desen explică de ce metoda funcționează,
 * al doilea de ce nu funcționează oricât de bine — iar cursorul lui `h` le
 * mișcă pe amândouă deodată, ceea ce e chiar legătura dintre ele.
 *
 * **De ce cursorul merge pe exponent.** `h` interesant e între `10⁰` și `10⁻¹²`;
 * pe o scară liniară, tot ce contează s-ar înghesui în ultimul pixel de lângă
 * zero. Cursorul mută **exponentul**, deci fiecare milimetru înseamnă același
 * lucru: o fracțiune de ordin de mărime.
 *
 * Matematica nu stă aici: formulele și baleierea după `h` vin din
 * `src/algorithms/derivare-numerica/`, funcțiile din `functii.ts`.
 */
export function InterfataDerivareNumerica() {
  const [idFunctie, setIdFunctie] = useState("cosinus");
  const [idFormula, setIdFormula] = useState("inainte");
  const [x0, setX0] = useState<number | "">(0.6);
  const [exponent, setExponent] = useState(-0.4);

  const functie = getFunctie(idFunctie);
  const formula = getFormula(idFormula);
  const h = 10 ** exponent;
  const punct = typeof x0 === "number" && Number.isFinite(x0) ? x0 : 0.6;

  const exact = functie.fDerivat(punct);
  const aproximare = formula.aproximeaza(functie.f, punct, h);
  const eroare = Math.abs(aproximare - exact);

  const noduri = noduriConcrete(formula, functie.f, punct, h);

  /* Domeniul desenului: în jurul lui x₀, destul cât să se vadă și nodurile. */
  const raza = Math.max(1.2, Math.abs(2 * h) * 1.4);
  const domeniuX = useMemo<readonly [number, number]>(
    () => [punct - raza, punct + raza],
    [punct, raza],
  );

  const segmente = useMemo(() => {
    const puncte = esantioneaza(functie.f, domeniuX, 320);
    const valori = puncte.map((p) => p.y).filter(Number.isFinite);
    const inaltime = valori.length ? Math.max(...valori) - Math.min(...valori) : 1;
    return sparge(puncte, { inaltimeVizibila: inaltime });
  }, [functie, domeniuX]);

  const domeniuY = useMemo<readonly [number, number]>(() => {
    const valori = segmente.flat().map((p) => p.y);
    if (valori.length === 0) return [-1, 1];
    const min = Math.min(...valori);
    const max = Math.max(...valori);
    const margine = Math.max(0.25, (max - min) * 0.12);
    return [min - margine, max + margine];
  }, [segmente]);

  /** Curbele de eroare: toate formulele de pantă, pe același sistem. */
  const curbe = useMemo(
    () =>
      FORMULE_PANTA.map((f) => ({
        id: f.id,
        curba: baleiazaH(f, functie.f, punct, functie.fDerivat(punct), {
          hMax: 1,
          hMin: 1e-13,
          puncteDeDecada: 10,
        }),
        eticheta: f.eticheta,
      })),
    [functie, punct],
  );

  return (
    <div className="flex flex-col gap-10">
      <Legend elemente={LEGENDA} />

      <Tabs value={idFormula} onValueChange={setIdFormula}>
        <TabsList className="w-full">
          {FORMULE_PANTA.map((f) => (
            <TabsTrigger key={f.id} value={f.id} className="flex-1">
              {f.eticheta}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="bg-suprafata border-bordura shadow-jos overflow-hidden rounded-xl border">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_clamp(300px,28%,400px)]">
          <div className="flex min-w-0 flex-col gap-8 p-6 sm:p-8">
            <Plot
              domeniuX={domeniuX}
              domeniuY={domeniuY}
              rezumat={`${formula.eticheta} pe ${functie.eticheta}`}
              descriere={descrieDesenul(functie.eticheta, punct, h, aproximare, exact)}
              inaltimeMaxima={380}
            >
              <PlotCurba segmente={segmente} rol="functie" />

              {/* Tangenta adevărată: ținta. Punctată, fiindcă nu e ce calculează
                  metoda, ci ce ar vrea să obțină. */}
              <PlotDreapta
                prin={{ x: punct, y: functie.f(punct) }}
                panta={exact}
                rol="solutie"
                punctata
              />

              {/* Dreapta metodei: are **panta aproximată**, dusă prin punctul de
                  lucru. Diferența de înclinare față de cea punctată e chiar
                  eroarea, făcută vizibilă. */}
              <PlotDreapta
                prin={{ x: punct, y: functie.f(punct) }}
                panta={aproximare}
                rol="curent"
              />

              {noduri.map((nod) => (
                <PlotPunct
                  key={nod.x}
                  x={nod.x}
                  y={nod.y}
                  rol={Math.abs(nod.x - punct) < 1e-15 ? "curent" : "anterior"}
                  proiectie
                  raza={5}
                />
              ))}
            </Plot>

            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-text-slab text-base">Pasul h</span>
                <span className="text-text font-mono text-lg tabular-nums">{stiintific(h, 2)}</span>
              </div>
              <Slider
                aria-label="Pasul h, ca ordin de mărime"
                min={EXPONENT_MIN}
                max={EXPONENT_MAX}
                step={0.1}
                value={[exponent]}
                onValueChange={([v]) => setExponent(v ?? 0)}
              />
              <div className="flex flex-wrap gap-2">
                {[-0.4, -1, -2, -4, -8, -12].map((e) => (
                  <Button
                    key={e}
                    size="sm"
                    variant={Math.abs(exponent - e) < 0.05 ? "default" : "outline"}
                    className="tinta-atingere font-mono"
                    aria-pressed={Math.abs(exponent - e) < 0.05}
                    onClick={() => setExponent(e)}
                  >
                    10{exponentText(e)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <ControlPanel
            onReset={() => {
              setX0(0.6);
              setExponent(-0.4);
            }}
            incorporat
            className="border-bordura min-w-0 border-t lg:border-t-0 lg:border-l"
          >
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {FUNCTII.map((f) => (
                <Button
                  key={f.id}
                  size="sm"
                  variant={f.id === idFunctie ? "default" : "outline"}
                  className="tinta-atingere font-mono"
                  aria-pressed={f.id === idFunctie}
                  onClick={() => setIdFunctie(f.id)}
                >
                  {f.eticheta}
                </Button>
              ))}
            </div>

            <NumberInput
              className="sm:col-span-2"
              eticheta="x₀"
              valoare={x0}
              onChange={setX0}
              pas={0.1}
            />

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 sm:col-span-2">
              {[
                ["f′(x₀) exact", zecimale(exact, 8)],
                ["aproximare", zecimale(aproximare, 8)],
                ["eroare", stiintific(eroare, 2)],
              ].map(([cheie, valoare]) => (
                <div key={cheie} className="contents">
                  <dt className="text-text-slab font-mono text-base">
                    <Notatie>{cheie ?? ""}</Notatie>
                  </dt>
                  <dd className="text-text font-mono text-base tabular-nums">{valoare}</dd>
                </div>
              ))}
            </dl>
          </ControlPanel>
        </div>
      </div>

      <FormulaBlock
        latex={`${formula.latex} = ${zecimale(aproximare, 6)}`}
        eticheta="Formula, cu pasul de acum"
        evidentiaza={["der-h"]}
        className="text-[1.15rem] sm:text-[1.3rem]"
      />

      <GraficEroareH curbe={curbe} idSelectat={idFormula} hCurent={h} />

      <Callout tip="retine" titlu="Ce se vede trăgând de cursor">
        <Notatie>
          {concluzie(formula.ordinEroare, curbe.find((c) => c.id === idFormula)?.curba.hOptim)}
        </Notatie>
      </Callout>
    </div>
  );
}

const LEGENDA: ElementLegenda[] = [
  { rol: "functie", eticheta: "funcția", forma: "linie" },
  {
    rol: "solutie",
    eticheta: "tangenta adevărată, cu panta f′(x₀)",
    forma: "linie-punctata",
    explicatie: "Ținta: ce ar trebui să dea formula.",
  },
  {
    rol: "curent",
    eticheta: "dreapta cu panta calculată de formulă",
    forma: "linie",
    explicatie: "Diferența de înclinare dintre cele două e chiar eroarea.",
  },
  { rol: "anterior", eticheta: "nodurile folosite de formulă", forma: "punct" },
];

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
  ",": "",
  ".": "",
};

function exponentText(e: number): string {
  return [...String(Math.round(e))].map((c) => CIFRE_SUS[c] ?? c).join("");
}

function descrieDesenul(
  eticheta: string,
  x0: number,
  h: number,
  aproximare: number,
  exact: number,
): string {
  return (
    `Graficul lui ${eticheta} în jurul lui x₀ = ${zecimale(x0, 3)}, cu pasul h = ${stiintific(h, 2)}. ` +
    `Dreapta metodei are panta ${zecimale(aproximare, 6)}, tangenta adevărată ${zecimale(exact, 6)}; ` +
    `diferența dintre ele e ${stiintific(Math.abs(aproximare - exact), 2)}.`
  );
}

function concluzie(ordinEroare: number, hOptim: number | undefined): string {
  const salt = ordinEroare === 1 ? "se înjumătățește" : "se împarte la patru";
  const unde = hOptim
    ? ` Cel mai bun pas pentru formula asta e pe la ${hOptim.toExponential(0)}; sub el, eroarea urcă la loc.`
    : "";
  return (
    `Trăgând cursorul spre stânga, cele două drepte se despart: pasul e prea mare, iar panta ` +
    `calculată n-are cum să fie cea din punct. Spre dreapta se suprapun, iar eroarea ${salt} ` +
    `la fiecare înjumătățire a pasului — până la un punct.${unde} De acolo încolo, scăderea ` +
    `f(x₀+h) − f(x₀) se face între numere aproape egale, iar cifrele care rămân sunt zgomot.`
  );
}
