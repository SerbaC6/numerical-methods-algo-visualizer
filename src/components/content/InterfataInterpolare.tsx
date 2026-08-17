import { useMemo, useState } from "react";

import {
  FUNCTII_INTERPOLATE,
  getFunctieInterpolata,
} from "@/algorithms/interpolare-polinomiala/functii-interpolare";
import { esantioneaza, polinomLagrange } from "@/algorithms/interpolare-polinomiala/lagrange";
import { schemaNeville, valoareNeville } from "@/algorithms/interpolare-polinomiala/neville";
import {
  evalueazaSpline,
  splineCubic,
  type TipSpline,
} from "@/algorithms/interpolare-polinomiala/spline";
import {
  abatereMaxima,
  noduriEchidistante,
  type Nod,
  type Punct,
} from "@/algorithms/interpolare-polinomiala/tipuri";
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
import { AceeasiInaltime } from "@/components/viz/AceeasiInaltime";
import { ControlPanel } from "@/components/viz/ControlPanel";
import { FormulaBlock } from "@/components/viz/FormulaBlock";
import { Legend, type ElementLegenda } from "@/components/viz/Legend";
import { Notatie } from "@/components/viz/Notatie";
import { PlaybackBar } from "@/components/viz/PlaybackBar";
import { Plot } from "@/components/viz/Plot";
import { PlotCurba } from "@/components/viz/PlotCurba";
import { PlotPunct } from "@/components/viz/PlotPunct";
import { PlotPunctTras } from "@/components/viz/PlotPunctTras";
import { useDerulare } from "@/hooks/use-derulare";
import { zecimale } from "@/lib/numere";
import { cn } from "@/lib/utils";

/* ───────────────────────── alegerile paginii ───────────────────────── */

/**
 * Cele trei file. **Funcția Runge nu mai are filă**, la cerere: fenomenul e
 * povestit de clipul de sus, iar aici ar fi fost a patra variantă a aceluiași
 * desen. Funcția rămâne în listă, deci cine vrea oscilația o alege oricând.
 */
const FILE = [
  { id: "lagrange", eticheta: "Lagrange" },
  { id: "neville", eticheta: "Neville" },
  { id: "spline", eticheta: "Spline" },
] as const;

type Fila = (typeof FILE)[number]["id"];

/**
 * Câte noduri se pot cere.
 *
 * Maximul e 13, nu mai mult, și nu din lene: exemplul din curs are 11 noduri
 * echidistante, iar peste 13 polinomul urcă atât de sus încât cadrul ar trebui
 * ori să-l urmeze — și atunci funcția devine o linie plată jos —, ori să-l taie
 * oricum. Minimul e 3: cu două noduri orice metodă de aici dă aceeași dreaptă.
 */
const NODURI_MIN = 3;
const NODURI_MAX = 13;
const NODURI_IMPLICIT = 5;

/** Câte puncte se calculează pe fiecare curbă desenată. */
const ESANTIOANE = 400;

/**
 * Funcția cu care pornește interfața.
 *
 * Sinusoida: polinomul stă lipit de curbă, deci se vede lucrul pe care îl arată
 * fila, nu oscilația de la capete. E și funcția pe care cele două condiții de
 * capăt ale spline-ului se despart cel mai tare — panta ei la capete e `±π`,
 * iar spline-ul natural o ignoră din construcție.
 */
const FUNCTIE_IMPLICITA = "sinusoida";

/* ───────────────────────── cadrul de desen ───────────────────────── */

/** Marginea laterală, ca fracție din interval — cât să nu cadă nodul pe ramă. */
const MARGINE_X = 0.06;

function extremele(valori: readonly number[]): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const v of valori) {
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return Number.isFinite(min) ? [min, max] : [-1, 1];
}

/* ───────────────────────── interfața ───────────────────────── */

/**
 * Interfața interactivă a paginii 12.
 *
 * **Un singur desen, trei întrebări.** Nodurile, funcția și cadrul rămân
 * aceleași de la o filă la alta; se schimbă doar ce se desenează peste ele:
 * polinomul întreg, nivelurile schemei Neville sau bucățile spline-ului. Așa se
 * vede că Lagrange și Neville dau **același** polinom, iar spline-ul e altceva —
 * nu trei pagini care nu se ating.
 *
 * **Nodurile se trag cu mâna** (`PlotPunctTras`), în afara filei cu funcția
 * Runge: acolo fenomenul e chiar despre noduri echidistante, iar unul mutat cu
 * degetul ar desființa exemplul.
 *
 * Matematica nu stă aici: vine din `src/algorithms/interpolare-polinomiala/`.
 */
export function InterfataInterpolare() {
  const [idFunctie, setIdFunctie] = useState(FUNCTIE_IMPLICITA);
  const [cate, setCate] = useState(NODURI_IMPLICIT);
  const [fila, setFila] = useState<Fila>("lagrange");
  const [tipSpline, setTipSpline] = useState<TipSpline>("natural");

  const functie = getFunctieInterpolata(idFunctie);
  const [a, b] = functie.interval;

  const [noduri, setNoduri] = useState<Nod[]>(() =>
    noduriEchidistante(
      getFunctieInterpolata(FUNCTIE_IMPLICITA).f,
      getFunctieInterpolata(FUNCTIE_IMPLICITA).interval,
      NODURI_IMPLICIT,
    ),
  );
  const [xEval, setXEval] = useState(() => a + (b - a) * 0.62);

  const n = noduri.length - 1;

  // Nivelurile schemei Neville se derulează, nu se trag dintr-un cursor din
  // panoul de parametri: sunt pași ai unui algoritm, iar pașii se iau cu
  // săgețile, sub desen, ca peste tot pe site.
  const derulareNivel = useDerulare(n + 1);
  const nivelAles = Math.min(derulareNivel.pas, n);

  /** Nodurile se pot fi mutat de pe funcție; butonul de resetare le pune la loc. */
  const asazaPeFunctie = (cateNoduri = cate, f = functie) =>
    setNoduri(noduriEchidistante(f.f, f.interval, cateNoduri));

  const asazaPe = (noua: ReturnType<typeof getFunctieInterpolata>) => {
    asazaPeFunctie(cate, noua);
    setXEval(noua.interval[0] + (noua.interval[1] - noua.interval[0]) * 0.62);
  };

  const schimbaFunctia = (id: string) => {
    setIdFunctie(id);
    asazaPe(getFunctieInterpolata(id));
  };

  const schimbaNumarul = (cateNoduri: number) => {
    setCate(cateNoduri);
    asazaPeFunctie(cateNoduri);
  };

  /* ── ce se calculează ─────────────────────────────────────────────── */

  const domeniuX = useMemo<readonly [number, number]>(() => {
    const margine = (b - a) * MARGINE_X;
    return [a - margine, b + margine];
  }, [a, b]);

  const curbaFunctiei = useMemo(
    () => esantioneaza(functie.f, domeniuX, ESANTIOANE),
    [functie, domeniuX],
  );

  const curbaPolinomului = useMemo(
    () => esantioneaza((x) => polinomLagrange(noduri, x), domeniuX, ESANTIOANE),
    [noduri, domeniuX],
  );

  const spline = useMemo(
    () =>
      splineCubic(noduri, tipSpline, {
        la0: functie.fPrim(noduri[0]?.x ?? a),
        laN: functie.fPrim(noduri[n]?.x ?? b),
      }),
    [noduri, tipSpline, functie, n, a, b],
  );

  const curbaSplineului = useMemo(
    () => esantioneaza((x) => evalueazaSpline(spline, x), [noduri[0]!.x, noduri[n]!.x], ESANTIOANE),
    [spline, noduri, n],
  );

  /*
   * Spline-ul cu **cealaltă** condiție de capăt, desenat odată cu cel ales.
   *
   * Diferența dintre „natural" și „tensionat" stă numai în capete și se vede
   * doar comparând: cu o singură curbă pe ecran, apăsarea butonului muta câțiva
   * pixeli pe care nimeni n-avea cum să-i țină minte. Așa, cele două curbe stau
   * una lângă alta, iar butonul spune doar care dintre ele e subiectul.
   */
  const splineCealalta = useMemo(
    () =>
      splineCubic(noduri, tipSpline === "natural" ? "tensionat" : "natural", {
        la0: functie.fPrim(noduri[0]?.x ?? a),
        laN: functie.fPrim(noduri[n]?.x ?? b),
      }),
    [noduri, tipSpline, functie, n, a, b],
  );

  const curbaSplineuluiCelalalt = useMemo(
    () =>
      esantioneaza(
        (x) => evalueazaSpline(splineCealalta, x),
        [noduri[0]!.x, noduri[n]!.x],
        ESANTIOANE,
      ),
    [splineCealalta, noduri, n],
  );

  const schema = useMemo(() => schemaNeville(noduri, xEval), [noduri, xEval]);

  /** Câte un polinom `P_ij` pentru fiecare intrare de pe nivelul ales, pe intervalul lui. */
  const curbeNivel = useMemo(() => {
    if (nivelAles === 0) return [];
    return (schema.niveluri[nivelAles] ?? []).map((intrare) =>
      esantioneaza(
        (x) => valoareNeville(noduri, intrare.i, intrare.j, x),
        [noduri[intrare.i]!.x, noduri[intrare.j]!.x],
        Math.max(40, Math.round(ESANTIOANE / 3)),
      ),
    );
  }, [schema, nivelAles, noduri]);

  /* ── cadrul vertical ──────────────────────────────────────────────── */

  /*
   * Cadrul vertical se calculează **doar din funcție**, nu din ce e desenat
   * peste ea.
   *
   * Nu e o simplificare, e o condiție ca tragerea să funcționeze. Dacă axa s-ar
   * încadra după curbe și după noduri, atunci mutarea unui nod ar schimba scara
   * chiar în timpul mișcării: pixelii de sub deget ar însemna altceva de la un
   * cadru la altul, iar nodul ar fugi din mână. Așa, scara stă pe loc cât timp
   * funcția e aceeași, iar ce iese din cadru e scris alături, în cifre.
   */
  const domeniuY = useMemo<readonly [number, number]>(() => {
    const [minF, maxF] = extremele(curbaFunctiei.map((p) => p.y));
    const inaltime = Math.max(maxF - minF, 0.5);
    return [minF - 0.45 * inaltime, maxF + 0.55 * inaltime];
  }, [curbaFunctiei]);

  /* ── cifrele care se citesc ───────────────────────────────────────── */

  const eroarePolinom = useMemo(
    () => abatereMaxima((x) => polinomLagrange(noduri, x), functie.f, [a, b], 2000),
    [noduri, functie, a, b],
  );
  const eroareSpline = useMemo(
    () => abatereMaxima((x) => evalueazaSpline(spline, x), functie.f, [a, b], 2000),
    [spline, functie, a, b],
  );
  /* ── mutarea unui nod ─────────────────────────────────────────────── */

  const mutaNodul = (i: number, punct: Punct) => {
    setNoduri((vechi) => vechi.map((nod, j) => (j === i ? { x: punct.x, y: punct.y } : nod)));
  };

  /**
   * Cât de departe poate fi dus un nod pe orizontală: până la vecini, fără să-i
   * atingă. Ordinea nodurilor nu e o preferință — spline-ul și schema Neville
   * împart la `xᵢ − xⱼ`, deci două noduri suprapuse ar da o împărțire la zero.
   */
  const limiteleNodului = (i: number): readonly [number, number] => {
    const minim = i === 0 ? a : (noduri[i - 1]?.x ?? a) + (b - a) / 60;
    const maxim = i === n ? b : (noduri[i + 1]?.x ?? b) - (b - a) / 60;
    return [Math.min(minim, maxim), Math.max(minim, maxim)];
  };

  /* ── desenul ──────────────────────────────────────────────────────── */

  const intrariNivel = schema.niveluri[nivelAles] ?? [];

  /*
   * Care dintre polinoamele nivelului ajunge în formulă.
   *
   * Se alege cel **peste al cărui interval cade** punctul evaluat, nu primul
   * din listă. Cu primul, la un `x` din dreapta ieșeau ponderi ca `−2,1` și
   * `3,1`: corecte, fiindcă se aduna tot la 1, dar contraziceau propoziția de
   * alături — între două valori nu se interpolează cu ponderi negative, se
   * extrapolează. Așa, formula arată chiar pasul care se vede pe desen.
   */
  const indiceExplicat = (() => {
    const acoperitor = intrariNivel.findIndex(
      (intrare) => xEval >= noduri[intrare.i]!.x && xEval <= noduri[intrare.j]!.x,
    );
    if (acoperitor >= 0) return acoperitor;
    // În afara suportului nu există niciun interval care să-l acopere; se ia
    // cel mai apropiat capăt.
    return xEval < (noduri[0]?.x ?? 0) ? 0 : Math.max(0, intrariNivel.length - 1);
  })();
  const intrareExplicata = intrariNivel[indiceExplicat];

  return (
    <div className="flex flex-col gap-8">
      <AceeasiInaltime
        variante={FILE.map((f) => (
          <Legend key={f.id} elemente={legendaFilei(f.id, tipSpline)} />
        ))}
        activa={FILE.findIndex((f) => f.id === fila)}
      />

      <Tabs value={fila} onValueChange={(v) => schimbaFila(v as Fila)}>
        <TabsList className="w-full">
          {FILE.map((f) => (
            <TabsTrigger key={f.id} value={f.id} className="flex-1">
              {f.eticheta}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="bg-suprafata border-bordura shadow-jos overflow-hidden rounded-xl border">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_clamp(300px,30%,400px)]">
          <div className="flex min-w-0 flex-col gap-6 p-6 sm:p-8">
            {/* Cei 100 de pixeli în plus la înălțime sunt chiar locul lăsat
                liber de triunghiul lui Neville, mutat sub bara de derulare:
                până acum tabelul creștea cu fiecare nivel calculat și împingea
                desenul în sus, adică graficul era cel mai mic exact la pasul
                unde se vede tot. */}
            <Plot
              domeniuX={domeniuX}
              domeniuY={domeniuY}
              rezumat={`${etichetaFilei(fila)} pe f(x) = ${functie.eticheta}`}
              descriere={descrieDesenul({
                fila,
                eticheta: functie.eticheta,
                noduri,
                eroarePolinom,
                eroareSpline,
                amplitudine,
                nivel: nivelAles,
                xEval,
                rezultat: schema.rezultat,
                tipSpline,
              })}
              inaltimeMaxima={560}
            >
              {/* Funcția de la care s-au luat nodurile. Punctată: nu e ce
                  calculează metoda, ci ce ar vrea să nimerească. */}
              <PlotCurba segmente={[curbaFunctiei]} rol="functie" punctata grosime={2} />

              {/* Nivelurile schemei Neville, fiecare pe intervalul lui. */}
              {fila === "neville" &&
                curbeNivel.map((curba, i) => (
                  <PlotCurba
                    key={i}
                    segmente={[curba]}
                    rol="interval"
                    grosime={2.5}
                    halou={false}
                  />
                ))}

              {/* Polinomul de interpolare — **o singură linie**. Multiplicatorul
                  nu se mai desenează separat: polinomul e chiar suma
                  multiplicatorilor, iar cu amândouă pe ecran ochiul nu mai știa
                  care e rezultatul. Ce arată fila se vede trăgând de numărul de
                  noduri: linia trece prin toate, oricâte ar fi. */}
              {fila === "lagrange" && (
                <PlotCurba segmente={[curbaPolinomului]} rol="curent" grosime={3} />
              )}

              {fila === "spline" && (
                <>
                  {/* Cealaltă condiție de capăt, ca termen de comparație. */}
                  <PlotCurba
                    segmente={[curbaSplineuluiCelalalt]}
                    rol="interval"
                    grosime={2.5}
                    punctata
                  />
                  <PlotCurba segmente={[curbaSplineului]} rol="solutie" grosime={3} />
                </>
              )}

              {fila === "neville" &&
                intrariNivel.map((intrare) => (
                  <PlotPunct
                    key={`${intrare.i}-${intrare.j}`}
                    x={xEval}
                    y={intrare.valoare}
                    rol="interval"
                    raza={6}
                  />
                ))}

              {/* Nodurile, trase cu mâna pe toate filele. */}
              {noduri.map((nod, i) => (
                <PlotPunctTras
                  key={i}
                  x={nod.x}
                  y={nod.y}
                  rol="anterior"
                  eticheta={n <= 4 ? `x${indice(i)}` : undefined}
                  onMuta={(p) => mutaNodul(i, p)}
                  limiteX={limiteleNodului(i)}
                  limiteY={[domeniuY[0], domeniuY[1]]}
                  descriere={`Nodul x${indice(i)}, la ${zecimale(nod.x, 2)}; ${zecimale(nod.y, 2)}`}
                />
              ))}
            </Plot>

            <FormulaBlock
              latex={formulaFilei(fila, tipSpline)}
              eticheta="Regula filei"
              evidentiaza={evidentiereaFilei(fila, nivelAles)}
            />
          </div>

          <ControlPanel
            onReset={() => {
              schimbaNumarul(NODURI_IMPLICIT);
              setTipSpline("natural");
              setXEval(a + (b - a) * 0.62);
              derulareNivel.setPas(0);
            }}
            incorporat
            className="border-bordura min-w-0 border-t lg:border-t-0 lg:border-l"
          >
            <div className="grid gap-2">
              <label className="text-base font-medium" htmlFor="alegere-functie-interpolare">
                Funcția
              </label>
              <Select value={functie.id} onValueChange={schimbaFunctia}>
                <SelectTrigger
                  id="alegere-functie-interpolare"
                  className="tinta-atingere w-full font-mono text-base"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUNCTII_INTERPOLATE.map((f) => (
                    <SelectItem key={f.id} value={f.id} className="font-mono">
                      <Notatie>{`f(x) = ${f.eticheta}`}</Notatie>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-base font-medium">Noduri</span>
                <span className="text-text font-mono text-lg tabular-nums">
                  {noduri.length} · grad {n}
                </span>
              </div>
              <Slider
                aria-label="Câte noduri de interpolare"
                min={NODURI_MIN}
                max={NODURI_MAX}
                step={1}
                value={[noduri.length]}
                onValueChange={([v]) => schimbaNumarul(v ?? NODURI_IMPLICIT)}
              />
            </div>

            {/* Controalele proprii fiecărei file stau într-un loc de aceeași
                înălțime: altfel panoul s-ar scurta și s-ar lungi la fiecare
                apăsare de tab, iar graficul de lângă ar sălta odată cu el. */}
            <AceeasiInaltime
              variante={[
                <div key="lagrange" className="grid gap-2">
                  <p className="text-text-slab text-base">{functie.ceArata}</p>
                </div>,

                <div key="neville" className="grid gap-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-base font-medium">
                      <Notatie>x</Notatie>, punctul evaluat
                    </span>
                    <span className="text-text font-mono text-lg tabular-nums">
                      {zecimale(xEval, 2)}
                    </span>
                  </div>
                  <Slider
                    aria-label="Punctul în care se evaluează schema"
                    min={a}
                    max={b}
                    step={0.01}
                    value={[xEval]}
                    onValueChange={([v]) => setXEval(v ?? a)}
                  />
                </div>,

                <div key="spline" className="grid gap-2">
                  <span className="text-base font-medium">Condițiile de la capete</span>
                  <div className="flex flex-wrap gap-2">
                    {(["natural", "tensionat"] as const).map((tip) => (
                      <Button
                        key={tip}
                        size="sm"
                        variant={tip === tipSpline ? "default" : "outline"}
                        className="tinta-atingere"
                        aria-pressed={tip === tipSpline}
                        onClick={() => setTipSpline(tip)}
                      >
                        {tip === "natural" ? "Natural" : "Tensionat"}
                      </Button>
                    ))}
                  </div>
                </div>,
              ]}
              activa={FILE.findIndex((f) => f.id === fila)}
            />

            <dl className="grid gap-2">
              {cifrele({
                fila,
                n,
                eroarePolinom,
                eroareSpline,
                schema,
                nivel: nivelAles,
                spline,
                noduri,
              }).map(([cheie, valoare]) => (
                <div
                  key={cheie}
                  className="border-bordura bg-fundal/40 flex items-baseline justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <dt className="text-text-slab font-mono text-base">
                    <Notatie>{cheie}</Notatie>
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

      {/* Nivelurile schemei, ca pași: bara de derulare stă sub desen, iar
          triunghiul de valori sub ea. Așa graficul ia toată înălțimea ramei,
          iar tabelul nu-l mai împinge în sus cu fiecare nivel calculat. */}
      {fila === "neville" && (
        <>
          <PlaybackBar
            pas={derulareNivel.pas}
            totalPasi={n + 1}
            ruleaza={derulareNivel.ruleaza}
            viteza={derulareNivel.viteza}
            onPas={derulareNivel.setPas}
            onRuleazaChange={derulareNivel.setRuleaza}
            onVitezaChange={derulareNivel.setViteza}
          />

          <TabelNeville
            schema={schema}
            nivelAles={nivelAles}
            iExplicat={intrareExplicata?.i ?? 0}
          />
        </>
      )}
    </div>
  );
}

/* ───────────────────────── schema, ca tabel ───────────────────────── */

/**
 * Triunghiul lui Neville: pe coloane nivelurile, pe rânduri indicele de start.
 *
 * Se arată doar nivelurile calculate până acum, ca tabelul să crească odată cu
 * desenul. Cele trei celule care intră în pasul explicat de formulă sunt
 * marcate: două de pe nivelul dinainte și cea care iese din ele.
 */
function TabelNeville({
  schema,
  nivelAles,
  iExplicat,
}: {
  schema: ReturnType<typeof schemaNeville>;
  nivelAles: number;
  /** Rândul polinomului pe care îl scrie formula de deasupra tabelului. */
  iExplicat: number;
}) {
  const niveluri = schema.niveluri.slice(0, nivelAles + 1);
  const randuri = schema.niveluri[0]?.length ?? 0;

  return (
    <div className="border-bordura overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-left font-mono text-sm tabular-nums">
        <caption className="sr-only">
          Schema triunghiulară a metodei Neville, evaluată în {zecimale(schema.x, 3)}
        </caption>
        <thead>
          <tr className="text-text-slab">
            {niveluri.map((_, g) => (
              <th key={g} scope="col" className="border-bordura border-b px-3 py-2 font-semibold">
                <Notatie>{g === 0 ? "grad 0" : `grad ${g}`}</Notatie>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: randuri }, (_, i) => (
            <tr key={i}>
              {niveluri.map((nivel, g) => {
                const intrare = nivel.find((e) => e.i === i);
                // Pasul explicat de formulă: `P₀,g` iese din `P₀,g−1` și `P₁,g`.
                const iese = g === nivelAles && i === iExplicat && nivelAles > 0;
                const intra = g === nivelAles - 1 && (i === iExplicat || i === iExplicat + 1);
                return (
                  <td
                    key={g}
                    className={cn(
                      "border-bordura/60 border-t px-3 py-1.5",
                      iese && "text-text bg-accent/25 font-semibold",
                      intra && "bg-viz-interval/15",
                      !intrare && "text-text-slab/40",
                    )}
                  >
                    {intrare ? zecimale(faraZeroNegativ(intrare.valoare), 4) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────────────── texte și formule ───────────────────────── */

const INDICI = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];

/** `12` → `„₁₂"`. Fonturile proiectului n-au indicii, deci trec prin `Notatie`. */
function indice(numar: number): string {
  return String(numar)
    .split("")
    .map((c) => INDICI[Number(c)] ?? c)
    .join("");
}

/**
 * `sin(π·(−1))` nu dă zero, ci `−1,2·10⁻¹⁶`, iar rotunjit la patru zecimale se
 * scrie „−0,0000" — o valoare care în tabelul schemei arată ca o greșeală.
 */
function faraZeroNegativ(x: number): number {
  return Math.abs(x) < 1e-12 ? 0 : x;
}

function etichetaFilei(fila: Fila): string {
  return FILE.find((f) => f.id === fila)?.eticheta ?? "";
}

function formulaFilei(fila: Fila, tipSpline: TipSpline): string {
  if (fila === "lagrange") {
    // Evidențiat e **polinomul**, nu multiplicatorul: pe desen se trasează o
    // singură linie, iar aceea e suma din stânga. Un `l_k` aprins în formulă ar
    // fi trimis ochiul să caute pe grafic o curbă care nu mai există. Produsul
    // rămâne scris, fiindcă el spune din ce e făcută suma.
    return (
      "\\htmlId{polinom}{P_n(x)} = \\sum_{k=0}^{n} f(x_k)\\, l_k(x), \\qquad " +
      "l_k(x) = \\prod_{\\substack{i=0 \\\\ i \\neq k}}^{n} \\frac{x - x_i}{x_k - x_i}"
    );
  }

  if (fila === "neville") {
    return (
      "P_{ij}(x) = " +
      "\\htmlId{pondere-stanga}{\\frac{x - x_j}{x_i - x_j}}\\, P_{i,j-1}(x) + " +
      "\\htmlId{pondere-dreapta}{\\frac{x_i - x}{x_i - x_j}}\\, P_{i+1,j}(x)"
    );
  }

  return (
    "s_i(x) = a_i + b_i(x - x_i) + c_i(x - x_i)^2 + d_i(x - x_i)^3 \\qquad " +
    (tipSpline === "natural"
      ? "\\htmlId{capete}{c_0 = c_{n-1} = 0}"
      : "\\htmlId{capete}{s'(x_0) = f'(x_0)}")
  );
}

function evidentiereaFilei(fila: Fila, nivel: number): string[] {
  if (fila === "lagrange") return ["polinom"];
  if (fila === "neville") return nivel === 0 ? [] : ["pondere-stanga", "pondere-dreapta"];
  return ["capete"];
}

function cifrele({
  fila,
  n,
  eroarePolinom,
  schema,
  nivel,
  spline,
  noduri,
}: {
  fila: Fila;
  n: number;
  eroarePolinom: number;
  eroareSpline: number;
  schema: ReturnType<typeof schemaNeville>;
  nivel: number;
  spline: ReturnType<typeof splineCubic>;
  noduri: readonly Nod[];
}): [string, string][] {
  if (fila === "lagrange") {
    return [
      ["grad Pₙ", String(n)],
      ["max |Pₙ − f|", zecimale(eroarePolinom, 4)],
    ];
  }
  if (fila === "neville") {
    return [
      ["nivelul", `${nivel} din ${n}`],
      ["polinoame", String(schema.niveluri[nivel]?.length ?? 0)],
    ];
  }
  return [
    ["bucăți", String(Math.max(0, noduri.length - 1))],
    ["s″(x₀)", zecimale(2 * (spline.c[0] ?? 0), 3)],
  ];
}

/* ───────────────────────── legenda ───────────────────────── */

const LEGENDA_FUNCTIE: ElementLegenda = {
  rol: "functie",
  eticheta: "funcția f, din care s-au luat nodurile",
  forma: "linie-punctata",
};

const LEGENDA_NODURI_TRASE: ElementLegenda = {
  rol: "anterior",
  eticheta: "nodurile, trase cu mouse-ul",
  forma: "punct",
  explicatie: "Suportul interpolării: singurele puncte prin care trebuie să treacă totul.",
};

function legendaFilei(fila: Fila, tipSpline: TipSpline): ElementLegenda[] {
  if (fila === "lagrange") {
    return [
      LEGENDA_FUNCTIE,
      LEGENDA_NODURI_TRASE,
      {
        rol: "curent",
        eticheta: "polinomul de interpolare Pₙ",
        forma: "linie",
        explicatie: "Suma multiplicatorilor, fiecare ponderat cu valoarea din nodul lui.",
      },
    ];
  }

  if (fila === "neville") {
    return [
      LEGENDA_FUNCTIE,
      LEGENDA_NODURI_TRASE,
      {
        rol: "interval",
        eticheta: "polinoamele Pᵢⱼ de pe nivelul ales",
        forma: "linie",
        explicatie:
          "Fiecare e trasat doar peste nodurile din care iese, cu un punct acolo unde e evaluat.",
      },
    ];
  }

  if (fila === "runge") {
    return [
      LEGENDA_FUNCTIE,
      { rol: "anterior", eticheta: "nodurile echidistante", forma: "punct" },
      {
        rol: "curent",
        eticheta: "polinomul de interpolare Pₙ",
        forma: "linie",
        explicatie: "Un singur polinom, pe tot intervalul.",
      },
      {
        rol: "solutie",
        eticheta: "spline-ul cubic, pe aceleași noduri",
        forma: "linie",
        explicatie: "Câte o cubică pe fiecare subinterval, lipite în noduri.",
      },
    ];
  }

  return [
    LEGENDA_FUNCTIE,
    LEGENDA_NODURI_TRASE,
    {
      rol: "solutie",
      eticheta: tipSpline === "natural" ? "spline-ul natural" : "spline-ul tensionat",
      forma: "linie",
      explicatie:
        tipSpline === "natural"
          ? "Curbura se anulează la capete."
          : "Panta de la capete e chiar cea a funcției.",
    },
  ];
}

/* ───────────────────────── descrierea desenului ───────────────────────── */

function descrieDesenul({
  fila,
  eticheta,
  noduri,
  eroarePolinom,
  eroareSpline,
  amplitudine,
  nivel,
  xEval,
  rezultat,
  tipSpline,
}: {
  fila: Fila;
  eticheta: string;
  noduri: readonly Nod[];
  eroarePolinom: number;
  eroareSpline: number;
  amplitudine: number;
  nivel: number;
  xEval: number;
  rezultat: number;
  tipSpline: TipSpline;
}): string {
  const n = noduri.length - 1;
  const comun = `Funcția ${eticheta}, cu ${noduri.length} noduri, deci polinom de grad ${n}.`;

  if (fila === "lagrange") {
    return (
      `${comun} Se vede o singură linie, polinomul de interpolare: trece prin toate cele ` +
      `${noduri.length} noduri și se abate de funcție cu cel mult ${zecimale(eroarePolinom, 4)}.`
    );
  }
  if (fila === "neville") {
    return (
      `${comun} Se văd polinoamele de grad ${nivel} din schema Neville, evaluate în ` +
      `x = ${zecimale(xEval, 3)}. Rezultatul întregii scheme acolo e ${zecimale(rezultat, 5)}.`
    );
  }
  if (fila === "runge") {
    return (
      `${comun} Nodurile sunt echidistante. Polinomul urcă până la ${zecimale(amplitudine, 3)} ` +
      `și se abate de funcție cu ${zecimale(eroarePolinom, 4)}; spline-ul cubic pe aceleași ` +
      `noduri se abate doar cu ${zecimale(eroareSpline, 4)}.`
    );
  }
  return (
    `${comun} Spline-ul ${tipSpline === "natural" ? "natural" : "tensionat"} se abate de funcție ` +
    `cu cel mult ${zecimale(eroareSpline, 4)}.`
  );
}
