import { useMemo, useState } from "react";

import { conturAdaptiv, ruleazaAdaptiv } from "@/algorithms/cuadraturi/adaptiv";
import {
  FUNCTII_CUADRATURA,
  getFunctieCuadratura,
} from "@/algorithms/cuadraturi/functii-cuadraturi";
import {
  aplicaFormula,
  conturInterpolantului,
  formulaEchidistanta,
  formulaGauss,
  gradDeExactitate,
  NODURI_MAXIME,
} from "@/algorithms/cuadraturi/gaussiene";
import { integralaExacta } from "@/algorithms/newton-cotes/functii-integrare";
import { Callout } from "@/components/content/Callout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AceeasiInaltime } from "@/components/viz/AceeasiInaltime";
import { ControlPanel } from "@/components/viz/ControlPanel";
import { FormulaBlock } from "@/components/viz/FormulaBlock";
import { IterationTable } from "@/components/viz/IterationTable";
import { Legend, type ElementLegenda } from "@/components/viz/Legend";
import { Notatie } from "@/components/viz/Notatie";
import { NumberInput } from "@/components/viz/NumberInput";
import { PlaybackBar } from "@/components/viz/PlaybackBar";
import { Plot } from "@/components/viz/Plot";
import { PlotArie } from "@/components/viz/PlotArie";
import { PlotBandaRecursie } from "@/components/viz/PlotBandaRecursie";
import { PlotCurba } from "@/components/viz/PlotCurba";
import { PlotPunct } from "@/components/viz/PlotPunct";
import { PlotVerticala } from "@/components/viz/PlotVerticala";
import { useDerulare } from "@/hooks/use-derulare";
import { stiintific, zecimale } from "@/lib/numere";
import { esantioneaza, sparge } from "@/lib/plot-esantionare";

type Fila = "adaptiv" | "gauss";

const FILE: { id: Fila; eticheta: string }[] = [
  { id: "adaptiv", eticheta: "Cuadraturi adaptive" },
  { id: "gauss", eticheta: "Cuadraturi Gaussiene" },
];

/**
 * Toleranța implicită a adaptivului și marginile în care se poate cere.
 *
 * Marginea de jos nu e cosmetică: recursia își înjumătățește toleranța la
 * fiecare tăiere, deci o toleranță cu câteva ordine sub `TOLERANTA_MINIMA` ar
 * cere mii de panouri și ar îngheța pagina înainte să deseneze ceva.
 */
const TOLERANTA_IMPLICITA = 1e-5;
const TOLERANTA_MINIMA = 1e-8;
const TOLERANTA_MAXIMA = 1e-1;

/** Graficul e piesa centrală a paginii, deci are voie să fie mare. */
const INALTIME_GRAFIC = 560;

/** Cu ce funcție pornește fiecare filă. */
const FUNCTIE_IMPLICITA: Record<Fila, string> = {
  // Vârful ascuțit lângă zero și coada plată: exact cazul care cere panouri de
  // lățimi diferite.
  adaptiv: "oscilanta",
  // Sinusul pe [0, π]. Cu patru noduri alese, formula greșește cu 1,6e-5; cu
  // patru echidistante, cu 4,1e-2 — de două mii de ori mai mult, și se vede pe
  // desen, fiindcă polinomul prin nodurile echidistante taie vizibil vârful.
  // Pe funcția adaptivului, amândouă variantele greșesc grosolan și butoanele
  // nu mai arată nimic.
  gauss: "sinus",
};

/**
 * Interfața paginii 17: două feluri de a alege unde se evaluează funcția.
 *
 * **Fiecare filă își ține funcția ei.** Comparația care contează nu e între
 * file, ci înăuntrul fiecăreia: la adaptiv, între o bucată tăiată și una
 * acceptată; la Gauss, între noduri echidistante și noduri alese. Funcția care
 * face vizibilă prima comparație — vârf ascuțit și coadă plată — o ascunde pe a
 * doua, fiindcă acolo greșesc urât și nodurile alese, și cele echidistante.
 * Lista de funcții e aceeași la amândouă, deci cine vrea să pună aceeași funcție
 * pe ambele file o poate face dintr-un clic.
 *
 * **Figura desenată este aproximarea**, nu o ilustrație a ei: la adaptiv sunt
 * arcele de parabolă ale lui Simpson, panou cu panou; la Gauss e polinomul care
 * trece prin noduri, fiindcă ponderile sunt chiar integralele multiplicatorilor
 * Lagrange. Ambele afirmații sunt verificate numeric în
 * `scripts/verificare-algoritmi/cuadraturi.ts`.
 *
 * Matematica nu stă aici: vine din `src/algorithms/cuadraturi/`.
 */
export function InterfataCuadraturi() {
  const [fila, setFila] = useState<Fila>("adaptiv");
  // Alegerile se țin pe filă: schimbarea filei readuce funcția și intervalul cu
  // care lucra acolo, nu le calcă pe ale celeilalte.
  const [idFunctie, setIdFunctie] = useState<Record<Fila, string>>(FUNCTIE_IMPLICITA);
  const [capete, setCapete] = useState<Record<Fila, { a: number | ""; b: number | "" }>>(() => ({
    adaptiv: capeteleFunctiei(FUNCTIE_IMPLICITA.adaptiv),
    gauss: capeteleFunctiei(FUNCTIE_IMPLICITA.gauss),
  }));

  const functie = getFunctieCuadratura(idFunctie[fila]);
  const a = numar(capete[fila].a, functie.interval[0]);
  const b = numar(capete[fila].b, functie.interval[1]);

  const [domMin, domMax] = functie.domeniuValid;
  const motiv =
    a >= b
      ? "Capătul din stânga trebuie să fie mai mic decât cel din dreapta."
      : a < domMin || b > domMax
        ? `Funcția ${functie.eticheta} se poate integra doar între ${zecimale(domMin, 2)} și ${zecimale(domMax, 2)}.`
        : undefined;

  const schimbaFunctia = (id: string) => {
    setIdFunctie((v) => ({ ...v, [fila]: id }));
    setCapete((v) => ({ ...v, [fila]: capeteleFunctiei(id) }));
  };

  const exact = motiv ? 0 : integralaExacta(functie, a, b);

  const alege = {
    functie,
    a,
    b,
    exact,
    motiv,
    resetCapete: () => {
      setCapete((v) => ({ ...v, [fila]: capeteleFunctiei(idFunctie[fila]) }));
    },
    campuri: (
      <>
        <div className="grid gap-2 sm:col-span-2 lg:col-span-1">
          <label className="text-base font-medium" htmlFor="alegere-functie-cuadratura">
            Funcția
          </label>
          <Select value={idFunctie[fila]} onValueChange={schimbaFunctia}>
            <SelectTrigger
              id="alegere-functie-cuadratura"
              className="tinta-atingere w-full font-mono text-base"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FUNCTII_CUADRATURA.map((f) => (
                // Prin `Notatie`: `e⁻³ˣ` are trei caractere care nu există în
                // fonturile proiectului, deci scris ca text obișnuit își lua
                // exponenții din fontul de sistem — alt corp, altă grosime.
                <SelectItem key={f.id} value={f.id} className="font-mono">
                  <Notatie>{`f(x) = ${f.eticheta}`}</Notatie>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <NumberInput
          eticheta="a"
          valoare={capete[fila].a}
          onChange={(v) => setCapete((c) => ({ ...c, [fila]: { ...c[fila], a: v } }))}
          pas={0.1}
        />
        <NumberInput
          eticheta="b"
          valoare={capete[fila].b}
          onChange={(v) => setCapete((c) => ({ ...c, [fila]: { ...c[fila], b: v } }))}
          pas={0.1}
        />
      </>
    ),
  };

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={fila} onValueChange={(v) => setFila(v as Fila)}>
        <TabsList className="w-full">
          {FILE.map((f) => (
            <TabsTrigger key={f.id} value={f.id} className="flex-1">
              {f.eticheta}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <AceeasiInaltime
        activa={FILE.findIndex((f) => f.id === fila)}
        variante={FILE.map((f) => (
          <Legend key={f.id} elemente={f.id === "adaptiv" ? LEGENDA_ADAPTIV : LEGENDA_GAUSS} />
        ))}
      />

      {fila === "adaptiv" ? <PanouAdaptiv {...alege} /> : <PanouGauss {...alege} />}
    </div>
  );
}

type ProprietatiPanou = {
  functie: ReturnType<typeof getFunctieCuadratura>;
  a: number;
  b: number;
  exact: number;
  motiv: string | undefined;
  resetCapete: () => void;
  campuri: React.ReactNode;
};

/* ───────────────────────── fila adaptivă ───────────────────────── */

function PanouAdaptiv({ functie, a, b, exact, motiv, resetCapete, campuri }: ProprietatiPanou) {
  const [toleranta, setToleranta] = useState<number | "">(TOLERANTA_IMPLICITA);
  const epsilon =
    typeof toleranta === "number" && Number.isFinite(toleranta) && toleranta > 0
      ? Math.min(TOLERANTA_MAXIMA, Math.max(TOLERANTA_MINIMA, toleranta))
      : TOLERANTA_IMPLICITA;

  const rezultat = useMemo(
    () => (motiv ? undefined : ruleazaAdaptiv({ f: functie.f, a, b, epsilon })),
    [motiv, functie, a, b, epsilon],
  );

  // Memorat, nu citit direct: altfel lista goală implicită e alta la fiecare
  // randare și `useMemo`-urile care depind de ea s-ar recalcula degeaba.
  const pasi = useMemo(() => rezultat?.pasi ?? [], [rezultat]);
  const derulare = useDerulare(pasi.length);
  const pasCurent = pasi[derulare.pas];

  const domeniuX = useMemo<readonly [number, number]>(() => {
    const margine = (b - a) * 0.04;
    return [a - margine, b + margine];
  }, [a, b]);

  const puncteCurba = useMemo(
    () => (motiv ? [] : esantioneaza(functie.f, domeniuX, 500)),
    [motiv, functie, domeniuX],
  );

  /** Doar panourile acceptate până la pasul curent — figura crește odată cu recursia. */
  const conturPanaAici = useMemo(() => {
    if (!rezultat || !pasCurent) return [];
    return conturAdaptiv(
      { ...rezultat, panouri: pasCurent.acceptatePanaAici },
      functie.f,
      pasCurent.acceptatePanaAici.length > 40 ? 6 : 14,
    );
  }, [rezultat, pasCurent, functie]);

  const domeniuY = useMemo<readonly [number, number]>(() => {
    const valori = [...puncteCurba.filter((p) => p.x >= a && p.x <= b).map((p) => p.y), 0].filter(
      Number.isFinite,
    );
    if (valori.length === 0) return [-1, 1];
    const min = Math.min(...valori);
    const max = Math.max(...valori);
    const margine = (max - min) * 0.12 + 0.05;
    // Jos se lasă mai mult: acolo stă banda cu nivelurile de tăiere.
    return [min - margine * 2.2, max + margine];
  }, [puncteCurba, a, b]);

  const segmente = useMemo(
    () => sparge(puncteCurba, { inaltimeVizibila: domeniuY[1] - domeniuY[0] }),
    [puncteCurba, domeniuY],
  );

  const bucati = useMemo(
    () => pasi.map((pas) => ({ ...pas.nod, acceptat: pas.nod.acceptat })),
    [pasi],
  );

  const eroare = rezultat ? Math.abs(rezultat.valoare - exact) : 0;
  return (
    <>
      {/* Graficul e piesa centrală a paginii, deci ia toată lățimea ramei, iar
          parametrii trec dedesubt, pe un rând. Într-o coloană laterală ar fi
          rămas mic exact acolo unde se citește ce face metoda. */}
      <div className="bg-suprafata border-bordura shadow-jos overflow-hidden rounded-xl border">
        <div className="flex flex-col">
          <div className="flex min-w-0 flex-col gap-6 p-4 sm:p-5">
            {rezultat && pasCurent ? (
              <Plot
                domeniuX={domeniuX}
                domeniuY={domeniuY}
                rezumat={`Simpson adaptiv pe f(x) = ${functie.eticheta}`}
                descriere={descrieAdaptiv(functie.eticheta, a, b, epsilon, rezultat)}
                raport={2}
                inaltimeMaxima={INALTIME_GRAFIC}
              >
                <PlotArie
                  puncte={conturPanaAici}
                  baza={0}
                  rol="solutie"
                  contur={false}
                  hasura={false}
                />

                {/* Intervalul cercetat acum, cu mijlocul lui: acolo se decide
                    dacă se mai taie o dată. */}
                <PlotVerticala x={pasCurent.nod.a} y={functie.f(pasCurent.nod.a)} punctata />
                <PlotVerticala x={pasCurent.nod.b} y={functie.f(pasCurent.nod.b)} punctata />
                <PlotVerticala
                  x={pasCurent.nod.c}
                  y={functie.f(pasCurent.nod.c)}
                  rol="interval"
                  opacitate={0.9}
                />

                <PlotCurba segmente={segmente} rol="functie" halou />

                <PlotPunct
                  x={pasCurent.nod.c}
                  y={functie.f(pasCurent.nod.c)}
                  rol="interval"
                  raza={6}
                />

                <PlotBandaRecursie
                  bucati={bucati}
                  panaLa={derulare.pas + 1}
                  activa={derulare.pas}
                />
              </Plot>
            ) : (
              <div className="text-text-slab flex min-h-[360px] items-center justify-center px-6 text-center text-lg text-pretty">
                <Notatie>{motiv ?? ""}</Notatie>
              </div>
            )}
          </div>

          <ControlPanel
            onReset={() => {
              resetCapete();
              setToleranta(TOLERANTA_IMPLICITA);
            }}
            incorporat
            className="border-bordura min-w-0 border-t"
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {campuri}
              <NumberInput
                eticheta="Toleranța"
                valoare={toleranta}
                onChange={setToleranta}
                min={TOLERANTA_MINIMA}
                max={TOLERANTA_MAXIMA}
                stiintific
                faraSageti
                unitate="ε"
              />
            </div>

            <ListaCifre
              randuri={[
                ["aproximare", rezultat ? zecimale(rezultat.valoare, 8) : "—"],
                ["valoarea exactă", rezultat ? zecimale(exact, 8) : "—"],
                ["eroare", rezultat ? (eroare < 1e-14 ? "0 — exact" : stiintific(eroare, 2)) : "—"],
                ["panouri", rezultat ? String(rezultat.panouri.length) : "—"],
                ["evaluări", rezultat ? String(rezultat.evaluari) : "—"],
                ["adâncime", rezultat ? String(rezultat.adancime) : "—"],
              ]}
            />

            <p className="text-text-slab max-w-prose text-base leading-relaxed">
              {functie.ceArata}
            </p>
          </ControlPanel>
        </div>
      </div>

      {rezultat && pasCurent && (
        <>
          <PlaybackBar
            pas={derulare.pas}
            totalPasi={pasi.length}
            ruleaza={derulare.ruleaza}
            viteza={derulare.viteza}
            onPas={derulare.setPas}
            onRuleazaChange={derulare.setRuleaza}
            onVitezaChange={derulare.setViteza}
          />

          <FormulaBlock
            latex={LATEX_TEST}
            eticheta="Testul de la pasul acesta"
            evidentiaza={pasCurent.nod.acceptat ? ["stanga"] : ["dreapta"]}
          />

          <IterationTable
            titlu="Intervale cercetate"
            primaIteratie={1}
            coloane={[
              {
                cheie: "interval",
                titlu: "interval",
                descriere: "Bucata cercetată la pasul acesta",
              },
              {
                cheie: "nivel",
                titlu: "nivel",
                descriere: "De câte ori a fost tăiat intervalul până aici",
              },
              {
                cheie: "diferenta",
                titlu: "|S − S₁ − S₂|",
                descriere: "Cât diferă Simpson cu un panou de Simpson cu două",
              },
              { cheie: "prag", titlu: "15ε", descriere: "Pragul cerut pe bucata aceasta" },
              {
                cheie: "decizie",
                titlu: "decizie",
                descriere: "S-a acceptat bucata sau s-a mai tăiat o dată",
              },
            ]}
            randuri={pasi.map((pas) => ({
              interval: `[${zecimale(pas.nod.a, 3)} ; ${zecimale(pas.nod.b, 3)}]`,
              nivel: String(pas.nod.nivel),
              diferenta: stiintific(pas.nod.diferenta, 2),
              prag: stiintific(pas.nod.prag, 2),
              decizie: pas.nod.acceptat ? "acceptat" : "tăiat la mijloc",
            }))}
            randCurent={derulare.pas}
            onAlegeRand={derulare.setPas}
            className="h-96"
          />
        </>
      )}
    </>
  );
}

/* ───────────────────────── fila Gaussiană ───────────────────────── */

function PanouGauss({ functie, a, b, exact, motiv, resetCapete, campuri }: ProprietatiPanou) {
  const [noduriCerute, setNoduriCerute] = useState<number | "">(NODURI_MAXIME);
  const [alese, setAlese] = useState(true);

  // Cu noduri echidistante formula are nevoie de cel puțin două: cu unul singur
  // n-ar mai fi nimic „echidistant".
  const nMinim = alese ? 1 : 2;
  const n = Math.max(
    nMinim,
    Math.min(NODURI_MAXIME, typeof noduriCerute === "number" ? Math.round(noduriCerute) : nMinim),
  );

  // Derularea adaugă nodurile pe rând, de la formula cu un singur nod până la
  // cea cerută: acolo se vede ce cumpără fiecare evaluare în plus.
  const derulare = useDerulare(n - nMinim + 1);
  const nCurent = nMinim + derulare.pas;

  const formula = useMemo(
    () => (alese ? formulaGauss(nCurent) : formulaEchidistanta(nCurent)),
    [alese, nCurent],
  );

  const aplicata = useMemo(
    () => (motiv ? undefined : aplicaFormula(formula, functie.f, a, b)),
    [motiv, formula, functie, a, b],
  );
  const cealalta = useMemo(
    () =>
      motiv
        ? undefined
        : aplicaFormula(
            alese ? formulaEchidistanta(Math.max(2, nCurent)) : formulaGauss(nCurent),
            functie.f,
            a,
            b,
          ),
    [motiv, alese, nCurent, functie, a, b],
  );

  const domeniuX = useMemo<readonly [number, number]>(() => {
    const margine = (b - a) * 0.04;
    return [a - margine, b + margine];
  }, [a, b]);

  const puncteCurba = useMemo(
    () => (motiv ? [] : esantioneaza(functie.f, domeniuX, 500)),
    [motiv, functie, domeniuX],
  );

  const contur = useMemo(
    () => (aplicata ? conturInterpolantului(aplicata.noduri, a, b, 300) : []),
    [aplicata, a, b],
  );

  const domeniuY = useMemo<readonly [number, number]>(() => {
    const valori = [
      ...puncteCurba.filter((p) => p.x >= a && p.x <= b).map((p) => p.y),
      ...contur.map((p) => p.y),
      0,
    ].filter(Number.isFinite);
    if (valori.length === 0) return [-1, 1];
    const min = Math.min(...valori);
    const max = Math.max(...valori);
    const margine = (max - min) * 0.12 + 0.05;
    return [min - margine, max + margine];
  }, [puncteCurba, contur, a, b]);

  const segmente = useMemo(
    () => sparge(puncteCurba, { inaltimeVizibila: domeniuY[1] - domeniuY[0] }),
    [puncteCurba, domeniuY],
  );

  const eroare = aplicata ? Math.abs(aplicata.valoare - exact) : 0;
  const eroareCealalta = cealalta ? Math.abs(cealalta.valoare - exact) : 0;
  const grad = gradDeExactitate(formula);

  return (
    <>
      {/* Graficul e piesa centrală a paginii, deci ia toată lățimea ramei, iar
          parametrii trec dedesubt, pe un rând. Într-o coloană laterală ar fi
          rămas mic exact acolo unde se citește ce face metoda. */}
      <div className="bg-suprafata border-bordura shadow-jos overflow-hidden rounded-xl border">
        <div className="flex flex-col">
          <div className="flex min-w-0 flex-col gap-6 p-4 sm:p-5">
            {aplicata ? (
              <Plot
                domeniuX={domeniuX}
                domeniuY={domeniuY}
                rezumat={`${alese ? "Cuadratură Gaussiană" : "Noduri echidistante"} cu ${nCurent} noduri, pe f(x) = ${functie.eticheta}`}
                descriere={descrieGauss(
                  functie.eticheta,
                  a,
                  b,
                  nCurent,
                  alese,
                  aplicata.valoare,
                  exact,
                )}
                raport={2}
                inaltimeMaxima={INALTIME_GRAFIC}
              >
                <PlotArie puncte={contur} baza={0} rol="solutie" contur={false} hasura={false} />

                {aplicata.noduri.map((nod) => (
                  <PlotVerticala
                    key={`v-${nod.x}`}
                    x={nod.x}
                    y={nod.fx}
                    rol="interval"
                    opacitate={0.9}
                  />
                ))}

                <PlotCurba segmente={segmente} rol="functie" halou />

                {aplicata.noduri.map((nod, i) => (
                  <PlotPunct
                    key={`n-${nod.x}`}
                    x={nod.x}
                    y={nod.fx}
                    rol="curent"
                    raza={7}
                    eticheta={`x${indice(i + 1)}`}
                  />
                ))}
              </Plot>
            ) : (
              <div className="text-text-slab flex min-h-[360px] items-center justify-center px-6 text-center text-lg text-pretty">
                <Notatie>{motiv ?? ""}</Notatie>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={alese ? "outline" : "default"}
                  className="tinta-atingere"
                  aria-pressed={!alese}
                  onClick={() => setAlese(false)}
                >
                  Noduri echidistante
                </Button>
                <Button
                  size="sm"
                  variant={alese ? "default" : "outline"}
                  className="tinta-atingere"
                  aria-pressed={alese}
                  onClick={() => setAlese(true)}
                >
                  Noduri alese
                </Button>
              </div>
            </div>
          </div>

          <ControlPanel
            onReset={() => {
              resetCapete();
              setNoduriCerute(NODURI_MAXIME);
              setAlese(true);
            }}
            incorporat
            className="border-bordura min-w-0 border-t"
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {campuri}
              <NumberInput
                eticheta="Noduri"
                valoare={noduriCerute}
                onChange={setNoduriCerute}
                min={nMinim}
                max={NODURI_MAXIME}
                pas={1}
                unitate="n"
              />
            </div>

            <ListaCifre
              randuri={[
                ["noduri folosite", `${nCurent} din ${n}`],
                ["aproximare", aplicata ? zecimale(aplicata.valoare, 8) : "—"],
                ["valoarea exactă", aplicata ? zecimale(exact, 8) : "—"],
                ["eroare", aplicata ? (eroare < 1e-14 ? "0 — exact" : stiintific(eroare, 2)) : "—"],
                ["evaluări", aplicata ? String(aplicata.evaluari) : "—"],
                ["grad de exactitate", String(grad)],
              ]}
            />

            <p className="text-text-slab max-w-prose text-base leading-relaxed">
              {functie.ceArata}
            </p>
          </ControlPanel>
        </div>
      </div>

      {aplicata && cealalta && (
        <>
          <PlaybackBar
            pas={derulare.pas}
            totalPasi={n - nMinim + 1}
            ruleaza={derulare.ruleaza}
            viteza={derulare.viteza}
            onPas={derulare.setPas}
            onRuleazaChange={derulare.setRuleaza}
            onVitezaChange={derulare.setViteza}
          />

          <FormulaBlock
            latex={LATEX_GAUSS}
            eticheta="Ce se calculează"
            evidentiaza={alese ? ["noduri"] : ["ponderi"]}
          />

          <Callout tip="retine" titlu="Aceleași evaluări, altă precizie">
            {incheiereGauss(nCurent, alese, eroare, eroareCealalta, grad)}
          </Callout>

          <IterationTable
            titlu="Nodurile formulei"
            primaIteratie={1}
            coloane={[
              {
                cheie: "t",
                titlu: "tᵢ",
                descriere: "Poziția nodului pe intervalul standard [−1, 1]",
              },
              { cheie: "x", titlu: "xᵢ", descriere: "Unde cade nodul pe intervalul cerut" },
              {
                cheie: "pondere",
                titlu: "cᵢ",
                descriere: "Ponderea cu care intră valoarea funcției",
              },
              { cheie: "fx", titlu: "f(xᵢ)", descriere: "Valoarea funcției în nod" },
              {
                cheie: "contributie",
                titlu: "contribuție",
                descriere: "Cât adaugă nodul la sumă, cu factorul (b − a)/2 cu tot",
              },
            ]}
            randuri={aplicata.noduri.map((nod) => ({
              t: zecimale(nod.t, 6),
              x: zecimale(nod.x, 6),
              pondere: zecimale(nod.pondere, 6),
              fx: zecimale(nod.fx, 6),
              contributie: zecimale(nod.contributie, 6),
            }))}
          />
        </>
      )}
    </>
  );
}

/* ───────────────────────── ajutoare ───────────────────────── */

/** Cifrele rezultatului, pe un rând — panoul nu mai e o coloană îngustă. */
function ListaCifre({ randuri }: { randuri: [string, string][] }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {randuri.map(([cheie, valoare]) => (
        <div
          key={cheie}
          className="border-bordura bg-fundal/40 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border px-3 py-2"
        >
          <dt className="text-text-slab text-base">
            <Notatie>{cheie}</Notatie>
          </dt>
          <dd className="text-text m-0 font-mono text-base font-semibold tabular-nums">
            {valoare}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Câmpul gol înseamnă „încă tastez", nu zero. */
function numar(valoare: number | "", implicit: number): number {
  return typeof valoare === "number" && Number.isFinite(valoare) ? valoare : implicit;
}

function rotunjit(valoare: number): number {
  return Number(valoare.toFixed(4));
}

/** Intervalul implicit al unei funcții, rotunjit cât să încapă într-un câmp. */
function capeteleFunctiei(id: string): { a: number; b: number } {
  const [a, b] = getFunctieCuadratura(id).interval;
  return { a: rotunjit(a), b: rotunjit(b) };
}

const CIFRE_JOS = "₀₁₂₃₄₅₆₇₈₉";
function indice(n: number): string {
  return [...String(n)].map((c) => CIFRE_JOS[Number(c)] ?? c).join("");
}

const LATEX_TEST =
  "\\htmlId{stanga}{\\left|S(a,b) - S\\!\\left(a,\\tfrac{a+b}{2}\\right) - S\\!\\left(\\tfrac{a+b}{2},b\\right)\\right|} " +
  "\\htmlId{dreapta}{<\\ 15\\varepsilon}";

const LATEX_GAUSS =
  "\\int_a^b f(x)\\,dx \\approx \\frac{b-a}{2}\\sum_{i=1}^{n} \\htmlId{ponderi}{c_i}\\, f\\!\\left(\\htmlId{noduri}{x_i}\\right)";

const LEGENDA_ADAPTIV: ElementLegenda[] = [
  { rol: "functie", eticheta: "curba f(x)", explicatie: "ce ar trebui integrat" },
  {
    rol: "solutie",
    forma: "zona",
    eticheta: "aria arcelor acceptate",
    explicatie: "figura desenată este chiar aproximarea de până acum",
  },
  {
    rol: "interval",
    eticheta: "mijlocul intervalului cercetat",
    explicatie: "acolo se taie, dacă testul pică",
  },
  {
    rol: "curent",
    forma: "zona",
    eticheta: "bandă plină, în josul graficului",
    explicatie: "o bucată acceptată; rândul ei arată de câte ori a fost tăiat intervalul",
  },
  {
    rol: "anterior",
    forma: "zona",
    eticheta: "bandă transparentă",
    explicatie: "o bucată care s-a mai tăiat o dată, deci continuă pe rândul de sub ea",
  },
];

const LEGENDA_GAUSS: ElementLegenda[] = [
  { rol: "functie", eticheta: "curba f(x)", explicatie: "ce ar trebui integrat" },
  {
    rol: "solutie",
    forma: "zona",
    eticheta: "aria calculată de formulă",
    explicatie: "figura desenată este chiar suma formulei",
  },
  {
    rol: "curent",
    eticheta: "nodurile",
    explicatie: "singurele puncte în care se evaluează funcția",
  },
  {
    rol: "interval",
    forma: "linie-punctata",
    eticheta: "valoarea în nod",
    explicatie: "înălțimea care intră în sumă, înmulțită cu ponderea ei",
  },
];

function descrieAdaptiv(
  eticheta: string,
  a: number,
  b: number,
  epsilon: number,
  rezultat: { panouri: unknown[]; evaluari: number; valoare: number },
): string {
  return (
    `Graficul lui ${eticheta} de la ${zecimale(a, 3)} la ${zecimale(b, 3)}, cu aria aproximată prin ` +
    `arce de parabolă pe bucăți de lungimi diferite. La toleranța ${stiintific(epsilon, 0)}, metoda ` +
    `se oprește cu ${rezultat.panouri.length} bucăți și ${rezultat.evaluari} evaluări ale funcției, ` +
    `iar suma lor dă ${zecimale(rezultat.valoare, 8)}. Sub grafic, o bandă arată de câte ori a fost ` +
    `tăiat fiecare interval.`
  );
}

function descrieGauss(
  eticheta: string,
  a: number,
  b: number,
  n: number,
  alese: boolean,
  valoare: number,
  exact: number,
): string {
  return (
    `Graficul lui ${eticheta} de la ${zecimale(a, 3)} la ${zecimale(b, 3)}, cu ${n} noduri ` +
    `${alese ? "alese ca rădăcini ale polinomului Legendre" : "echidistante"} și cu aria de sub ` +
    `polinomul care trece prin ele. Suma dă ${zecimale(valoare, 8)}, iar valoarea exactă e ` +
    `${zecimale(exact, 8)}.`
  );
}

function incheiereGauss(
  n: number,
  alese: boolean,
  eroare: number,
  eroareCealalta: number,
  grad: number,
): string {
  const numele = alese ? "alese" : "echidistante";
  const celelalte = alese ? "echidistante" : "alese";
  const comparatie =
    eroare < eroareCealalta
      ? `mai puțin decât cu noduri ${celelalte}, care greșesc cu ${stiintific(eroareCealalta, 2)}`
      : `față de ${stiintific(eroareCealalta, 2)} cu noduri ${celelalte}`;
  const despreExact =
    eroare < 1e-14
      ? "Aici formula nimerește exact: funcția e un polinom de grad cel mult atât."
      : "";
  return (
    `Cu ${n} noduri ${numele}, adică ${n} evaluări ale funcției, formula e exactă pe polinoame până ` +
    `la gradul ${grad} și greșește cu ${stiintific(eroare, 2)} — ${comparatie}. ${despreExact}`
  );
}
