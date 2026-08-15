import { useEffect, useMemo, useRef, useState } from "react";

import {
  FUNCTII_DERIVARE,
  getFunctieDerivare,
} from "@/algorithms/derivare-numerica/functii-derivare";
import { getFormula, noduriConcrete } from "@/algorithms/derivare-numerica/formule";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ControlPanel } from "@/components/viz/ControlPanel";
import { Legend, type ElementLegenda } from "@/components/viz/Legend";
import { Notatie } from "@/components/viz/Notatie";
import { NumberInput } from "@/components/viz/NumberInput";
import { Plot } from "@/components/viz/Plot";
import { PlotCurba } from "@/components/viz/PlotCurba";
import { PlotDreapta } from "@/components/viz/PlotDreapta";
import { PlotPunct } from "@/components/viz/PlotPunct";
import { esantioneaza, sparge } from "@/lib/plot-esantionare";
import { stiintific, zecimale } from "@/lib/numere";

/**
 * Cele trei formule de pantă care se pot alege.
 *
 * „Înainte" și „înapoi" sunt **aceeași formulă cu `h` schimbat de semn**, cum
 * spune și cursul, deci pe ecran nu stau ca două alegeri diferite: fila se
 * numește „Două puncte", iar desenul folosește varianta înainte. Cine schimbă
 * semnul lui `h` obține cealaltă.
 */
const FILE_FORMULE = [
  { id: "inainte", eticheta: "Două puncte" },
  { id: "mijloc", eticheta: "Trei puncte, mijloc" },
  { id: "capat", eticheta: "Trei puncte, capăt" },
] as const;

/** `h` se alege pe scară logaritmică: exponentul, nu valoarea. */
const EXPONENT_MIN = -12;
const EXPONENT_MAX = 0;

/**
 * Cât de repede ajunge desenul din urmă pasul cerut, în secunde.
 *
 * Urmărirea e exponențială, nu liniară: pornește repede și frânează la sosire,
 * deci un salt de opt ordine de mărime (butoanele) arată ca o mișcare, nu ca o
 * tăietură, iar tragerea de cursor rămâne lipită de deget.
 */
const TIMP_URMARIRE = 0.16;

/**
 * O valoare care aleargă după `tinta` în loc s-o atingă dintr-un cadru.
 *
 * Fără ea, schimbarea pasului **teleporta** nodurile: la fiecare apăsare de
 * buton desenul apărea deja refăcut, iar drumul dintre cele două stări — chiar
 * ce trebuie văzut pe pagina asta — nu exista. `prefers-reduced-motion` sare
 * peste tot drumul, fiindcă un `requestAnimationFrame` propriu nu e acoperit
 * nici de `MotionConfig`, nici de regula din `index.css`.
 */
function useUrmarire(tinta: number): number {
  const [valoare, setValoare] = useState(tinta);
  const curent = useRef(tinta);

  useEffect(() => {
    const sari = () => {
      curent.current = tinta;
      setValoare(tinta);
    };

    // Pe filă ascunsă `requestAnimationFrame` nu rulează deloc, deci urmărirea
    // ar îngheța la jumătatea drumului. Nu e nimic de văzut acolo: se sare
    // direct la țintă.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.hidden) {
      sari();
      return;
    }

    document.addEventListener("visibilitychange", sari);

    let cadru = 0;
    let anterior: number | null = null;
    const pas = (acum: number) => {
      // Pasul se ia din timpul scurs, nu din numărul de cadre: pe un ecran la
      // 120 Hz urmărirea ar fi de două ori mai rapidă.
      const dt = anterior === null ? 0 : (acum - anterior) / 1000;
      anterior = acum;

      const diferenta = tinta - curent.current;
      if (Math.abs(diferenta) < 1e-3) {
        sari();
        return;
      }
      curent.current += diferenta * (1 - Math.exp(-dt / TIMP_URMARIRE));
      setValoare(curent.current);
      cadru = window.requestAnimationFrame(pas);
    };

    cadru = window.requestAnimationFrame(pas);
    return () => {
      window.cancelAnimationFrame(cadru);
      document.removeEventListener("visibilitychange", sari);
    };
  }, [tinta]);

  return valoare;
}

/**
 * Interfața interactivă a paginii 16.
 *
 * **Ce se vede.** Secanta formulei, dusă prin punctul de lucru, alături de
 * tangenta adevărată. Diferența de înclinare dintre ele **e** eroarea, iar
 * cursorul lui `h` o strânge sau o lărgește sub ochi.
 *
 * **De ce funcțiile astea.** Sunt alese ca să separe formulele, nu la
 * întâmplare: pe o dreaptă toate sunt exacte, pe o parabolă mijlocul e exact
 * iar cele două puncte greșesc cu exact `h`, pe cubică greșesc amândouă dar cu
 * ordine diferite. Vezi
 * [`functii-derivare.ts`](../../algorithms/derivare-numerica/functii-derivare.ts).
 *
 * **De ce cursorul merge pe exponent.** `h` interesant e între `10⁰` și
 * `10⁻¹²`; pe o scară liniară, tot ce contează s-ar înghesui în ultimul pixel
 * de lângă zero. Cursorul mută **exponentul**, deci fiecare milimetru înseamnă
 * același lucru: o fracțiune de ordin de mărime.
 *
 * Matematica nu stă aici: formulele vin din `src/algorithms/derivare-numerica/`.
 */
export function InterfataDerivareNumerica() {
  const [idFunctie, setIdFunctie] = useState("parabola");
  const [idFormula, setIdFormula] = useState<string>("inainte");
  const [x0, setX0] = useState<number | "">(1);
  const [exponent, setExponent] = useState(-1);

  const functie = getFunctieDerivare(idFunctie);
  const formula = getFormula(idFormula);
  // Cursorul dă ținta; desenul o urmărește, deci nodurile **călătoresc** spre
  // ea în loc să apară direct acolo.
  const h = 10 ** useUrmarire(exponent);
  const punct = typeof x0 === "number" && Number.isFinite(x0) ? x0 : functie.x0;

  const exact = functie.fPrim(punct);
  const aproximare = formula.aproximeaza(functie.f, punct, h);
  const eroare = Math.abs(aproximare - exact);

  const noduri = noduriConcrete(formula, functie.f, punct, h);

  /*
   * Domeniul desenului: în jurul lui x₀, destul cât să se vadă și nodurile.
   *
   * `hypot`, nu `max`: cu `Math.max(1.2, 2,8·h)` cadrul stătea încremenit sub
   * `h ≈ 0,43` și pornea brusc peste el — o cotitură exact în mijlocul
   * cursorului. Așa, trecerea de la „încape tot" la „urmează nodurile" e lină,
   * fără niciun prag.
   */
  const raza = Math.hypot(1.1, 2.4 * h);
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
    // Marginea crește odată cu desenul, fără prag: un `Math.max` aici făcea
    // cadrul pe verticală să se oprească din mișcare pe curbele aproape plate.
    const margine = (max - min) * 0.12 + 0.12;
    return [min - margine, max + margine];
  }, [segmente]);

  const schimbaFunctia = (id: string) => {
    setIdFunctie(id);
    setX0(getFunctieDerivare(id).x0);
  };

  return (
    <div className="flex flex-col gap-10">
      <Legend elemente={LEGENDA} />

      <Tabs value={idFormula} onValueChange={setIdFormula}>
        <TabsList className="w-full">
          {FILE_FORMULE.map((f) => (
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
                // Pas mărunt: la 0,1 se simțeau treptele sub deget, iar nodurile
                // săreau din poziție în poziție în loc să alunece.
                step={0.01}
                value={[exponent]}
                onValueChange={([v]) => setExponent(v ?? 0)}
              />
              <div className="flex flex-wrap gap-2">
                {/* Exponenți întregi: cu -0,6 în listă, primul buton scria tot „10⁻¹",
                    fiindcă eticheta rotunjește. */}
                {[-1, -2, -3, -4, -8, -12].map((e) => (
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
              setX0(functie.x0);
              setExponent(-1);
            }}
            incorporat
            className="border-bordura min-w-0 border-t lg:border-t-0 lg:border-l"
          >
            {/* Dintr-o listă, nu dintr-un șir de butoane: butoanele se rupeau pe
                trei rânduri și cereau citite toate ca să alegi unul. */}
            <div className="grid gap-2 sm:col-span-2">
              <label className="text-base font-medium" htmlFor="alegere-functie-derivare">
                Funcția
              </label>
              <Select value={idFunctie} onValueChange={schimbaFunctia}>
                <SelectTrigger
                  id="alegere-functie-derivare"
                  className="tinta-atingere w-full font-mono text-base"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUNCTII_DERIVARE.map((f) => (
                    <SelectItem key={f.id} value={f.id} className="font-mono">
                      f(x) = {f.eticheta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <NumberInput
              className="sm:col-span-2"
              eticheta="x₀"
              valoare={x0}
              onChange={setX0}
              pas={0.1}
            />

            {/* Fiecare cifră în chenarul ei: într-o listă simplă, „exact" și
                „aproximare" — două numere cu opt zecimale — se citeau ca un
                singur bloc, tocmai unde diferența dintre ele e subiectul. */}
            <dl className="grid gap-2 sm:col-span-2">
              {[
                ["f′(x₀) exact", zecimale(exact, 8)],
                ["aproximare", zecimale(aproximare, 8)],
                ["eroare", eroare === 0 ? "0 — exact" : stiintific(eroare, 2)],
              ].map(([cheie, valoare]) => (
                <div
                  key={cheie}
                  className="border-bordura bg-fundal/40 flex items-baseline justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <dt className="text-text-slab font-mono text-base">
                    <Notatie>{cheie ?? ""}</Notatie>
                  </dt>
                  <dd className="text-text m-0 font-mono text-base font-semibold tabular-nums">
                    {valoare}
                  </dd>
                </div>
              ))}
            </dl>
          </ControlPanel>
        </div>
      </div>
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
