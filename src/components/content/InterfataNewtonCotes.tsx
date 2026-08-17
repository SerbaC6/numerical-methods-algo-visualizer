import { useMemo, useState } from "react";

import {
  conturAproximarii,
  conturPanou,
  latexCompusa,
  normalizeazaN,
  ruleazaCuadratura,
  type IdCuadratura,
  type RezultatCuadratura,
} from "@/algorithms/newton-cotes/cuadraturi";
import {
  FUNCTII_INTEGRARE,
  getFunctieIntegrare,
  integralaExacta,
} from "@/algorithms/newton-cotes/functii-integrare";
import { Callout } from "@/components/content/Callout";
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
import { IterationTable } from "@/components/viz/IterationTable";
import { Legend, type ElementLegenda } from "@/components/viz/Legend";
import { Notatie } from "@/components/viz/Notatie";
import { NumberInput } from "@/components/viz/NumberInput";
import { PlaybackBar } from "@/components/viz/PlaybackBar";
import { Plot } from "@/components/viz/Plot";
import { PlotArie } from "@/components/viz/PlotArie";
import { PlotCurba } from "@/components/viz/PlotCurba";
import { PlotPunct } from "@/components/viz/PlotPunct";
import { PlotVerticala } from "@/components/viz/PlotVerticala";
import { useDerulare } from "@/hooks/use-derulare";
import { stiintific, zecimale } from "@/lib/numere";
import { esantioneaza, sparge } from "@/lib/plot-esantionare";

/**
 * Cele două formule închise cu filă proprie.
 *
 * Punctul de mijloc — singura formulă **deschisă** din curs care ajunge pe
 * pagină — rămâne doar în teorie, prin decizie: acolo `h` e jumătate din
 * lățimea panoului, iar o a treia filă în care aceeași literă ar însemna
 * altceva ar strica exact lucrul pe care cursorul de mai jos îl explică bine.
 */
const FILE: { id: IdCuadratura; eticheta: string }[] = [
  { id: "trapez", eticheta: "Trapeze" },
  { id: "simpson", eticheta: "Simpson" },
];

/** Câte subintervale se pot cere. Peste atât, panourile devin fire de păr. */
const N_MAXIM = 40;

/**
 * Peste atâtea subintervale, **bulinele** nodurilor se strâng și ascund curba.
 *
 * Marginile dintre panouri se desenează în continuare, oricât de multe ar fi:
 * ele sunt chiar lucrul pe care îl schimbă cursorul, iar la 32 de subintervale
 * ascunse odată cu bulinele desenul rămânea o pată fără nicio tăietură — adică
 * exact opusul a ce trebuia arătat.
 */
const PRAG_DESEN_INCARCAT = 24;
/** Sub atâtea subintervale, nodurile își poartă și numele („x₀", „x₁"…). */
const PRAG_NUME_NODURI = 7;

const CIFRE_JOS = "₀₁₂₃₄₅₆₇₈₉";
function indice(n: number): string {
  return [...String(n)].map((c) => CIFRE_JOS[Number(c)] ?? c).join("");
}

/**
 * Interfața interactivă a paginii 16: aria de sub curbă, tăiată în panouri.
 *
 * **Ce se vede.** Figura desenată **este** aproximarea, nu o ilustrație a ei:
 * la trapeze e poligonul de sub coarde, la Simpson e aria de sub arcele de
 * parabolă. Aria ei, integrată exact, dă chiar suma din formulă — verificat
 * numeric în `scripts/verificare-algoritmi/newton-cotes.ts`.
 *
 * **De ce un singur cursor pentru simplu și compus.** Formula simplă a cursului
 * e cea compusă cu un singur panou: `N = 1` la trapeze și `N = 2` la Simpson
 * dau exact `h/2·[f(a) + f(b)]` și `h/3·[f(a) + 4f((a+b)/2) + f(b)]`. Așa
 * trecerea de la una la alta nu e o altă filă, ci un pas pe același cursor —
 * ceea ce e și ideea: compusa nu e altă metodă, e aceeași aplicată pe bucăți.
 *
 * **Funcția rămâne aceeași la schimbarea filei**, spre deosebire de pagina
 * ecuațiilor neliniare. Acolo fiecare metodă avea nevoie de alt exemplu; aici
 * comparația **e** lecția: aceeași funcție, același `N`, două rânduri de cifre.
 *
 * Matematica nu stă aici: formulele vin din `src/algorithms/newton-cotes/`.
 */
export function InterfataNewtonCotes() {
  const [idMetoda, setIdMetoda] = useState<IdCuadratura>("trapez");
  const [idFunctie, setIdFunctie] = useState("sinus");
  const [capete, setCapete] = useState<{ a: number | ""; b: number | "" }>(() => {
    const [a, b] = getFunctieIntegrare("sinus").interval;
    return { a: rotunjit(a), b: rotunjit(b) };
  });
  const [nCerut, setNCerut] = useState(4);

  const functie = getFunctieIntegrare(idFunctie);
  const n = normalizeazaN(idMetoda, nCerut);
  const a = numar(capete.a, functie.interval[0]);
  const b = numar(capete.b, functie.interval[1]);

  const [domMin, domMax] = functie.domeniuValid;
  const motiv =
    a >= b
      ? "Capătul din stânga trebuie să fie mai mic decât cel din dreapta."
      : a < domMin || b > domMax
        ? `Funcția ${functie.eticheta} se poate integra doar între ${zecimale(domMin, 2)} și ${zecimale(domMax, 2)}.`
        : undefined;

  const schimbaFunctia = (id: string) => {
    setIdFunctie(id);
    // Capetele vechi n-au nicio legătură cu funcția nouă: sinusul se integrează
    // pe [0, π], inversul pe [1, 2]. Păstrate, a doua ar porni în afara
    // domeniului ei, adică refuzată din start.
    const [nouA, nouB] = getFunctieIntegrare(id).interval;
    setCapete({ a: rotunjit(nouA), b: rotunjit(nouB) });
  };

  const schimbaMetoda = (id: IdCuadratura) => {
    setIdMetoda(id);
    // Simpson lucrează pe perechi de subintervale, deci un `N` impar rămas de la
    // trapeze urcă la următorul par. Se face aici, nu doar la calcul, ca
    // cifra de sub cursor să fie chiar cea folosită.
    setNCerut((valoare) => normalizeazaN(id, valoare));
  };

  const rezultat = useMemo(
    () =>
      motiv
        ? undefined
        : ruleazaCuadratura({
            id: idMetoda,
            f: functie.f,
            a,
            b,
            n,
            exact: integralaExacta(functie, a, b),
            derivate: functie,
            primitiva: functie.primitiva,
          }),
    [motiv, idMetoda, functie, a, b, n],
  );

  const panouri = rezultat?.panouri ?? [];
  const derulare = useDerulare(panouri.length);
  const panouCurent = panouri[derulare.pas];

  // ── Încadrarea desenului ───────────────────────────────────────────────────
  // Cadrul iese puțin în afara lui `[a, b]`, cât să nu stea nodurile de capăt
  // lipite de marginea graficului.
  const domeniuX = useMemo<readonly [number, number]>(() => {
    const margine = (b - a) * 0.04;
    return [a - margine, b + margine];
  }, [a, b]);

  const puncteCurba = useMemo(
    () => (motiv ? [] : esantioneaza(functie.f, domeniuX, 400)),
    [motiv, functie, domeniuX],
  );

  const contur = useMemo(() => (rezultat ? conturAproximarii(rezultat) : []), [rezultat]);

  /*
   * Cadrul pe verticală se ia din ce se desenează **înăuntrul** intervalului,
   * plus zero.
   *
   * Zero fiindcă aria se închide la axă: fără el, o funcție care nu se apropie
   * de zero pe `[a, b]` — `1/x` pe `[1, 2]`, de pildă — ar avea figura tăiată
   * pe la jumătate, deși figura aceea **e** rezultatul.
   *
   * Numai dinăuntru fiindcă marginea de 4% poate cădea în afara domeniului
   * funcției: la `√x` pe `[0, 1]` acolo nu există nimic, iar la `1/x` lângă
   * zero valorile explodează și ar strivi tot desenul într-o linie.
   */
  const domeniuY = useMemo<readonly [number, number]>(() => {
    const valori = [
      ...puncteCurba.filter((p) => p.x >= a && p.x <= b).map((p) => p.y),
      ...contur.map((p) => p.y),
      0,
    ].filter(Number.isFinite);
    if (valori.length === 0) return [-1, 1];
    const min = Math.min(...valori);
    const max = Math.max(...valori);
    const margine = (max - min) * 0.1 + 0.05;
    return [min - margine, max + margine];
  }, [puncteCurba, contur, a, b]);

  const segmente = useMemo(
    () => sparge(puncteCurba, { inaltimeVizibila: domeniuY[1] - domeniuY[0] }),
    [puncteCurba, domeniuY],
  );

  const conturCurent = useMemo(
    () => (rezultat ? conturPanou(rezultat, derulare.pas) : []),
    [rezultat, derulare.pas],
  );

  /**
   * Fâșia dintre curbă și figura desenată — chiar ce **nu** prinde formula.
   *
   * Se ia pe același șir de abscise pentru amândouă, ca marginile să se
   * închidă exact: sus valorile lui `f`, jos figura. Unde figura trece peste
   * curbă, fâșia e de partea cealaltă — și tot se vede, fiindcă acolo
   * aproximarea a numărat în plus.
   */
  const nepotrivit = useMemo(() => {
    if (!rezultat) return undefined;
    const jos = conturDes(rezultat);
    if (jos.length < 2) return undefined;
    const sus = jos.map((p) => ({ x: p.x, y: functie.f(p.x) }));
    return { sus, jos };
  }, [rezultat, functie]);

  const desenIncarcat = n > PRAG_DESEN_INCARCAT;
  const cuNume = n < PRAG_NUME_NODURI;
  const cifre = 6;

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={idMetoda} onValueChange={(v) => schimbaMetoda(v as IdCuadratura)}>
        <TabsList className="w-full">
          {FILE.map((f) => (
            <TabsTrigger key={f.id} value={f.id} className="flex-1">
              {f.eticheta}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Legenda stă înaintea desenului: spune ce înseamnă fiecare lucru de pe
          grafic, iar pusă dedesubt ar fi citită abia după ce cititorul s-a uitat
          la un desen pe care nu-l înțelege. Cele două variante au același număr
          de rânduri, dar textele diferă în lungime — se egalizează doar spațiul. */}
      <AceeasiInaltime
        activa={FILE.findIndex((f) => f.id === idMetoda)}
        variante={FILE.map((f) => (
          <Legend key={f.id} elemente={legendaMetodei(f.id)} />
        ))}
      />

      <div className="bg-suprafata border-bordura shadow-jos overflow-hidden rounded-xl border">
        {/* Graficul ia toată lățimea ramei, iar parametrii trec dedesubt: pe
            o coloană laterală rămânea prea mic tocmai acolo unde se compară
            aria desenată cu cea de sub curbă. */}
        <div className="flex flex-col">
          <div className="flex min-w-0 flex-col gap-6 p-4 sm:p-5">
            {rezultat ? (
              <Plot
                domeniuX={domeniuX}
                domeniuY={domeniuY}
                rezumat={`${idMetoda === "trapez" ? "Formula trapezelor" : "Formula Simpson"} pe f(x) = ${functie.eticheta}`}
                descriere={descrieDesenul(idMetoda, functie.eticheta, a, b, rezultat.n, rezultat)}
                raport={1.8}
                inaltimeMaxima={560}
              >
                {/* Toată figura, ca o singură arie: metoda înlocuiește curba pe
                    tot intervalul, nu desenează N figuri alăturate. */}
                {/* Hașura se stinge pe desenele dese: la 32 de panouri, dungile
                    ei diagonale acoperă exact liniile verticale care despart
                    panourile, adică singurul lucru care mai arată tăietura. */}
                <PlotArie
                  puncte={contur}
                  baza={0}
                  rol="anterior"
                  contur={false}
                  hasura={!desenIncarcat}
                />

                {/* Ce rămâne pe dinafară. Se desenează peste figură, fiindcă
                    tocmai diferența dintre ele e subiectul. */}
                {nepotrivit && (
                  <PlotArie
                    puncte={nepotrivit.sus}
                    baza={nepotrivit.jos}
                    rol="interval"
                    contur={false}
                    opacitate={0.8}
                  />
                )}

                {/* Marginile dintre panouri. Fără ele, N trapeze lipite se
                    citesc ca o singură pată, iar tocmai numărul lor e ce se
                    schimbă de la cursor. Rămân desenate și pe desenele dese,
                    doar mai subțiri: la 32 de subintervale ele sunt tot ce mai
                    arată în câte bucăți s-a tăiat intervalul. */}
                {rezultat.noduri.map((nod) => (
                  <PlotVerticala
                    key={`v-${nod.x}`}
                    x={nod.x}
                    y={nod.y}
                    punctata={!desenIncarcat}
                    grosime={desenIncarcat ? 1 : 1.5}
                    opacitate={desenIncarcat ? 0.9 : 0.7}
                  />
                ))}

                {/* Panoul de acum, peste restul: conturul lui închide și
                    marginile, deci se vede exact bucata la care se referă
                    formula de dedesubt. */}
                {panouCurent && conturCurent.length >= 2 && (
                  <PlotArie puncte={conturCurent} baza={0} rol="curent" hasura={false} />
                )}

                <PlotCurba segmente={segmente} rol="functie" halou />

                {/* Nodurile care nu sunt ale panoului curent: pe desenele dese
                    dispar, fiindcă patruzeci de buline pe curbă ascund chiar
                    curba. */}
                {!desenIncarcat &&
                  rezultat.noduri.map((nod, i) => {
                    const alPanoului = panouCurent?.noduri.some((x) => x.x === nod.x) ?? false;
                    if (alPanoului) return null;
                    return (
                      <PlotPunct
                        key={`n-${nod.x}`}
                        x={nod.x}
                        y={nod.y}
                        rol="anterior"
                        raza={4}
                        eticheta={cuNume ? `x${indice(i)}` : undefined}
                      />
                    );
                  })}

                {panouCurent?.noduri.map((nod) => (
                  <PlotPunct
                    key={`c-${nod.x}`}
                    x={nod.x}
                    y={nod.y}
                    rol="curent"
                    raza={6}
                    eticheta={
                      cuNume
                        ? `x${indice(rezultat.noduri.findIndex((alt) => alt.x === nod.x))}`
                        : undefined
                    }
                  />
                ))}
              </Plot>
            ) : (
              <div className="text-text-slab flex min-h-[360px] items-center justify-center px-6 text-center text-lg text-pretty">
                <Notatie>{motiv ?? ""}</Notatie>
              </div>
            )}

            {/* Cursorul lui N stă sub desen, nu în panoul din dreapta: e
                controlul principal al paginii, iar de el se trage privind
                figura, nu citind o etichetă. */}
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-text-slab text-base">
                  Subintervale
                  <span className="ml-2 font-mono">N</span>
                </span>
                <span className="text-text font-mono text-lg tabular-nums">
                  {n}
                  {rezultat && (
                    <span className="text-text-slab ml-3 text-base">
                      h = {zecimale(rezultat.h, 4)}
                    </span>
                  )}
                </span>
              </div>
              <Slider
                aria-label="Numărul de subintervale"
                min={idMetoda === "simpson" ? 2 : 1}
                max={N_MAXIM}
                step={idMetoda === "simpson" ? 2 : 1}
                value={[n]}
                onValueChange={([v]) => setNCerut(v ?? 1)}
              />
              {/* Scurtăturile se normalizează **și se strâng**: la Simpson,
                  `N = 1` urcă la 2, deci lista scrisă de mână dădea două butoane
                  cu „2" unul lângă altul, iar al doilea nu mai avea ce alege. */}
              <div className="flex flex-wrap gap-2">
                {scurtaturi(idMetoda).map((tinta) => {
                  return (
                    <Button
                      key={tinta}
                      size="sm"
                      variant={n === tinta ? "default" : "outline"}
                      className="tinta-atingere font-mono"
                      aria-pressed={n === tinta}
                      onClick={() => setNCerut(tinta)}
                    >
                      {tinta}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <ControlPanel
            onReset={() => {
              const [nouA, nouB] = functie.interval;
              setCapete({ a: rotunjit(nouA), b: rotunjit(nouB) });
              setNCerut(normalizeazaN(idMetoda, 4));
            }}
            incorporat
            className="border-bordura min-w-0 border-t"
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-2">
                <label className="text-base font-medium" htmlFor="alegere-functie-integrare">
                  Funcția
                </label>
                <Select value={idFunctie} onValueChange={schimbaFunctia}>
                  <SelectTrigger
                    id="alegere-functie-integrare"
                    className="tinta-atingere w-full font-mono text-base"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUNCTII_INTEGRARE.map((f) => (
                      <SelectItem key={f.id} value={f.id} className="font-mono">
                        f(x) = {f.eticheta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <NumberInput
                eticheta="a"
                valoare={capete.a}
                onChange={(v) => setCapete((c) => ({ ...c, a: v }))}
                pas={0.1}
              />
              <NumberInput
                eticheta="b"
                valoare={capete.b}
                onChange={(v) => setCapete((c) => ({ ...c, b: v }))}
                pas={0.1}
              />
            </div>

            {/* Fiecare cifră în chenarul ei: într-o listă simplă, aproximarea și
                valoarea exactă — două numere cu șase zecimale — se citeau ca un
                singur bloc, tocmai unde diferența dintre ele e subiectul. */}
            <dl className="grid gap-2 sm:grid-cols-3">
              {[
                ["aproximare", rezultat ? zecimale(rezultat.aproximare, cifre) : "—"],
                ["valoarea exactă", rezultat ? zecimale(rezultat.exact, cifre) : "—"],
                [
                  "eroare",
                  rezultat
                    ? rezultat.eroare < 1e-12
                      ? "0 — exact"
                      : stiintific(rezultat.eroare, 2)
                    : "—",
                ],
              ].map(([cheie, valoare]) => (
                <div
                  key={cheie}
                  className="border-bordura bg-fundal/40 flex items-baseline justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <dt className="text-text-slab text-base">
                    <Notatie>{cheie ?? ""}</Notatie>
                  </dt>
                  <dd className="text-text m-0 font-mono text-base font-semibold tabular-nums">
                    {valoare}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="text-text-slab max-w-prose text-base leading-relaxed">
              {functie.ceArata}
            </p>
          </ControlPanel>
        </div>
      </div>

      {rezultat && panouri.length > 0 && (
        <>
          <PlaybackBar
            pas={derulare.pas}
            totalPasi={panouri.length}
            ruleaza={derulare.ruleaza}
            viteza={derulare.viteza}
            onPas={derulare.setPas}
            onRuleazaChange={derulare.setRuleaza}
            onVitezaChange={derulare.setViteza}
          />

          {/* Paralela formulă ↔ desen: partea aprinsă din formula compusă e
              chiar bucata la care contribuie panoul evidențiat pe grafic. */}
          <FormulaBlock
            latex={latexCompusa(idMetoda)}
            eticheta="Formula compusă"
            evidentiaza={panouCurent?.evidentiaza}
          />

          {/* Cifrele erorii stau în panoul de parametri, nu într-o casetă sub
              desen: acolo se citesc lângă aproximare și lângă valoarea exactă,
              adică lângă lucrurile din care ies. Rămâne o singură casetă, cea
              care spune ceva ce cifrele nu spun — de ce eroarea e chiar zero. */}
          {rezultat.eroare < 1e-12 && (
            <Callout tip="retine" titlu="Formula a nimerit exact">
              {incheiereExacta(idMetoda, functie.eticheta)}
            </Callout>
          )}

          <IterationTable
            titlu="Panouri"
            primaIteratie={1}
            coloane={[
              {
                cheie: "interval",
                titlu: "panoul",
                descriere: "Bucata din [a, b] pe care se aplică o dată formula simplă",
              },
              {
                cheie: "contributie",
                titlu: "contribuție",
                descriere: "Cât adaugă panoul la sumă",
              },
              {
                cheie: "cumulat",
                titlu: "suma până aici",
                descriere: "Suma parțială după panoul acesta",
              },
              {
                cheie: "eroarePanou",
                titlu: "eroarea panoului",
                descriere: "Cât se abate contribuția de la integrala adevărată pe panoul acela",
              },
            ]}
            randuri={panouri.map((panou) => ({
              interval: `[${zecimale(panou.a, 3)} ; ${zecimale(panou.b, 3)}]`,
              contributie: zecimale(panou.contributie, 6),
              cumulat: zecimale(panou.cumulat, 6),
              eroarePanou:
                panou.eroarePanou === undefined
                  ? "—"
                  : panou.eroarePanou < 1e-14
                    ? "0"
                    : stiintific(panou.eroarePanou, 2),
            }))}
            randCurent={derulare.pas}
            onAlegeRand={derulare.setPas}
            // Trapezele au de două ori mai multe panouri decât Simpson la
            // același N: fără înălțime fixă, tabelul se strânge la schimbarea
            // filei și trage toată pagina în sus.
            className="h-96"
          />
        </>
      )}
    </div>
  );
}

// ── Ajutoare ─────────────────────────────────────────────────────────────────

/** Sărituri rapide pe `N`, fără valori repetate după normalizare. */
function scurtaturi(id: IdCuadratura): number[] {
  return [...new Set([1, 2, 4, 8, 16, 32].map((v) => normalizeazaN(id, v)))];
}

/** Câmpul gol înseamnă „încă tastez", nu zero: se folosește valoarea implicită. */
function numar(valoare: number | "", implicit: number): number {
  return typeof valoare === "number" && Number.isFinite(valoare) ? valoare : implicit;
}

/**
 * Capătul, rotunjit cât să încapă într-un câmp.
 *
 * `π` scris cu șaptesprezece zecimale în căsuța lui `b` nu spune nimic mai mult
 * decât `3,1416`, dar umple câmpul și face imposibil de văzut ce s-a tastat.
 * Rotunjirea schimbă puțin intervalul, deci și integrala — dar valoarea exactă
 * se recalculează pe intervalul afișat, nu pe cel din spatele lui, deci eroarea
 * arătată rămâne eroarea formulei.
 */
function rotunjit(valoare: number): number {
  return Number(valoare.toFixed(4));
}

/**
 * Figura desenată, eșantionată des pe fiecare panou.
 *
 * `conturAproximarii` dă exact vârfurile figurii — două puncte pe trapez —,
 * ceea ce ajunge ca s-o desenezi, dar nu ca s-o compari punct cu punct cu
 * curba: fâșia dintre ele are nevoie de aceleași abscise de amândouă părțile.
 */
function conturDes(rezultat: RezultatCuadratura, puncteDePanou = 16): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < rezultat.panouri.length; i++) {
    const brut = conturPanou(rezultat, i, puncteDePanou);
    const primul = brut[0];
    const ultimul = brut[brut.length - 1];
    if (!primul || !ultimul) continue;

    // Coarda vine cu două capete; arcul, deja eșantionat, vine cu tot ce trebuie.
    const bucata =
      brut.length > 2
        ? brut
        : Array.from({ length: puncteDePanou + 1 }, (_, k) => {
            const t = k / puncteDePanou;
            return {
              x: primul.x + (ultimul.x - primul.x) * t,
              y: primul.y + (ultimul.y - primul.y) * t,
            };
          });

    for (const p of bucata) {
      if (out[out.length - 1]?.x === p.x) continue;
      out.push(p);
    }
  }
  return out;
}

function legendaMetodei(id: IdCuadratura): ElementLegenda[] {
  return [
    { rol: "functie", eticheta: "curba f(x)", explicatie: "ce ar trebui integrat" },
    {
      rol: "anterior",
      forma: "zona",
      eticheta: id === "trapez" ? "aria de sub coarde" : "aria de sub arcele de parabolă",
      explicatie:
        id === "trapez"
          ? "figura desenată este chiar aproximarea: suma ariilor trapezelor"
          : "figura desenată este chiar aproximarea: suma ariilor de sub arce",
    },
    {
      rol: "interval",
      forma: "zona",
      eticheta: "aria rămasă pe dinafară",
      explicatie: "cât se depărtează figura de curbă — de acolo vine eroarea",
    },
    {
      rol: "curent",
      forma: "zona",
      eticheta: "panoul de acum",
      explicatie: "bucata la care se referă formula și rândul din tabel",
    },
    {
      rol: "curent",
      eticheta: "nodurile panoului",
      explicatie:
        id === "trapez"
          ? "cele două capete între care se duce coarda"
          : "cele trei puncte prin care trece arcul de parabolă",
    },
    { rol: "anterior", eticheta: "celelalte noduri", explicatie: "capetele celorlalte panouri" },
    {
      rol: "grila",
      forma: "linie-punctata",
      eticheta: "marginea dintre panouri",
      explicatie: "aici se termină un panou și începe următorul",
    },
  ];
}

function descrieDesenul(
  id: IdCuadratura,
  eticheta: string,
  a: number,
  b: number,
  n: number,
  rezultat: { aproximare: number; exact: number },
): string {
  const nume = id === "trapez" ? "coarde" : "arce de parabolă";
  return (
    `Graficul lui ${eticheta} pe intervalul de la ${zecimale(a, 3)} la ${zecimale(b, 3)}, ` +
    `cu aria de sub curbă aproximată prin ${n} subintervale și ${nume}. ` +
    `Suma dă ${zecimale(rezultat.aproximare, 6)}, iar valoarea exactă e ${zecimale(rezultat.exact, 6)}.`
  );
}

function incheiereExacta(id: IdCuadratura, eticheta: string): string {
  return id === "simpson"
    ? `Pe ${eticheta} nu rămâne nicio eroare: Simpson e exact pe orice polinom de grad cel mult 3, fiindcă termenul lui de eroare conține derivata a patra, iar aceea e identic nulă.`
    : `Pe ${eticheta} nu rămâne nicio eroare: formula trapezelor e exactă pe orice polinom de grad cel mult 1, fiindcă termenul ei de eroare conține derivata a doua, iar aceea e identic nulă.`;
}
