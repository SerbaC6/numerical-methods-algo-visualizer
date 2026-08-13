import { useEffect, useMemo, useState } from "react";

import { AlgorithmCard } from "@/components/content/AlgorithmCard";
import { Callout } from "@/components/content/Callout";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ControlPanel } from "@/components/viz/ControlPanel";
import { ExpressionInput } from "@/components/viz/ExpressionInput";
import { FormulaBlock } from "@/components/viz/FormulaBlock";
import { IterationTable } from "@/components/viz/IterationTable";
import { Legend } from "@/components/viz/Legend";
import { MatrixGrid, type StareCelula } from "@/components/viz/MatrixGrid";
import { NumberInput } from "@/components/viz/NumberInput";
import { PlaybackBar } from "@/components/viz/PlaybackBar";
import { Plot } from "@/components/viz/Plot";
import { PlotArie } from "@/components/viz/PlotArie";
import { PlotCurba } from "@/components/viz/PlotCurba";
import { PlotDreapta } from "@/components/viz/PlotDreapta";
import { PlotInterval } from "@/components/viz/PlotInterval";
import { PlotPunct } from "@/components/viz/PlotPunct";
import { StepExplanation } from "@/components/viz/StepExplanation";
import { esantioneaza, sparge } from "@/lib/plot-esantionare";
import { incadreaza } from "@/lib/plot-scara";
import { type Viteza } from "@/lib/playback";

const PALETA = [
  { hex: "#0474C4", nume: "Safir", rol: "accent principal, iterația curentă" },
  { hex: "#5379AE", nume: "Albastru estompat", rol: "accent secundar, iterații anterioare" },
  { hex: "#2C444C", nume: "Gri-verzui închis", rol: "suprafețe" },
  { hex: "#A8C4EC", nume: "Albastru deschis", rol: "text secundar, grilă și adnotări" },
  { hex: "#06457F", nume: "Albastru adânc", rol: "accent apăsat, interval evidențiat" },
  { hex: "#262B40", nume: "Bleumarin închis", rol: "fundalul temei întunecate" },
];

const MISCARE = [
  { token: "duration-rapid", valoare: "150 ms", cand: "hover, focus, apăsare" },
  { token: "duration-mediu", valoare: "250 ms", cand: "apariții, schimbări de stare" },
  { token: "duration-lent", valoare: "400 ms", cand: "layout, panouri, tranziții de pagină" },
];

/** Funcția pe care merg toate demonstrațiile de mai jos. Una singură, ca cifrele să se lege între ele. */
const f = (x: number) => x ** 3 - 2 * x - 5;

const CIFRE_INDICE = "₀₁₂₃₄₅₆₇₈₉";
/** 12 → „₁₂". Indicele scris ca indice, nu ca „x_12". */
const indice = (n: number) =>
  String(n)
    .split("")
    .map((c) => CIFRE_INDICE[Number(c)] ?? c)
    .join("");

/** Număr scris ca în română: virgulă zecimală, minus tipografic. */
const zecimale = (x: number, n: number) => x.toFixed(n).replace("-", "−").replace(".", ",");

/** Bisecție pe f(x) = x³ − 2x − 5, interval [2, 3] — doar ca date de probă. */
function bisectie(pasi: number) {
  let a = 2;
  let b = 3;
  const randuri = [];
  for (let k = 0; k < pasi; k++) {
    const c = (a + b) / 2;
    randuri.push({ a, b, c, fc: f(c), lung: b - a });
    if (f(a) * f(c) < 0) b = c;
    else a = c;
  }
  return randuri;
}

type PasGauss = {
  valori: number[][];
  stari: StareCelula[][];
  linieActiva?: number;
  explicatie: React.ReactNode;
};

/**
 * Eliminarea Gaussiană pe **exemplul din curs** (`curs4`, §4.3), pe matricea
 * extinsă [A|b]. Calculul e cel din algoritmul de la §4.4 — pivotul `a_pp` și
 * multiplicatorii `µ_ip = a_ip / a_pp`.
 *
 * **Etichetele afișate sunt însă intenționat mai simple decât cele din curs:**
 * `L₁…L₃` pentru linii și `C₁…C₃` pentru coloane, în loc de `E_i` și `x_j`.
 * Cifrele și operațiile rămân cele din curs; se schimbă doar cum le numim, ca
 * grila să se înțeleagă fără să știi convenția dinainte.
 *
 * Rezultatul trebuie să fie exact cele două săgeți din curs:
 * `[1 3 1 9; 0 −2 −2 −8; 0 2 5 8]`, apoi `[1 3 1 9; 0 −2 −2 −8; 0 0 3 0]`.
 */
function eliminareGauss(): PasGauss[] {
  const A: number[][] = [
    [1, 3, 1, 9],
    [1, 1, -1, 1],
    [3, 11, 8, 35],
  ];
  const pasi: PasGauss[] = [];
  const zerouri: [number, number][] = [];
  const liniiGata = new Set<number>();

  const pune = (s: StareCelula[][], i: number, j: number, stare: StareCelula) => {
    const linie = s[i];
    if (linie) linie[j] = stare;
  };

  const adauga = (
    explicatie: React.ReactNode,
    opt: { pivot?: [number, number]; curent?: [number, number][]; linieActiva?: number } = {},
  ) => {
    const stari: StareCelula[][] = A.map((linie) => linie.map(() => "normala" as StareCelula));
    for (const i of liniiGata) {
      A[i]?.forEach((_, j) => pune(stari, i, j, "calculat"));
    }
    for (const [i, j] of zerouri) pune(stari, i, j, "zero");
    for (const [i, j] of opt.curent ?? []) pune(stari, i, j, "curent");
    if (opt.pivot) pune(stari, opt.pivot[0], opt.pivot[1], "pivot");

    pasi.push({
      valori: A.map((linie) => [...linie]),
      stari,
      linieActiva: opt.linieActiva,
      explicatie,
    });
  };

  const mono = (t: string) => <span className="font-mono font-semibold">{t}</span>;
  /** Minus tipografic (−), nu cratimă (-), ca semnul să arate a matematică. */
  const nr = (x: number) => String(x).replace("-", "−");

  for (let p = 0; p < 2; p++) {
    const pivot = A[p]?.[p] ?? 0;
    adauga(
      <>
        Pasul {p + 1}: pivotul e {mono(nr(pivot))}, aflat pe linia {mono(`L${p + 1}`)} și coloana{" "}
        {mono(`C${p + 1}`)}. Cu el se fac zero toate numerele de sub el, din coloana{" "}
        {mono(`C${p + 1}`)}.
      </>,
      { pivot: [p, p], linieActiva: p },
    );

    for (let i = p + 1; i < A.length; i++) {
      const linieI = A[i];
      const linieP = A[p];
      if (!linieI || !linieP) continue;

      // Valoarea dinainte de transformare — din ea se vede împărțirea din formulă.
      const aip = linieI[p] ?? 0;
      const mu = aip / pivot;
      for (let j = 0; j < linieI.length; j++) {
        linieI[j] = (linieI[j] ?? 0) - mu * (linieP[j] ?? 0);
      }

      zerouri.push([i, p]);
      // Când câtul e negativ, „scădem de −1 ori" ar contrazice semnul „+" scris
      // imediat după. Verbul urmează semnul, ca propoziția și formula să spună
      // același lucru.
      const cat = Math.abs(mu);
      const verb = mu < 0 ? "adunăm la" : "scădem din";
      const semn = mu < 0 ? "+" : "−";
      adauga(
        <>
          Ca să facem zero primul număr din {mono(`L${i + 1}`)}, îl împărțim la pivot:{" "}
          {mono(`${nr(aip)} ÷ ${nr(pivot)} = ${nr(mu)}`)}. Apoi {verb} {mono(`L${i + 1}`)} linia
          pivotului înmulțită cu {mono(nr(cat))}: {mono(`L${i + 1} ${semn} ${nr(cat)}·L${p + 1}`)}.
        </>,
        {
          pivot: [p, p],
          linieActiva: i,
          curent: linieI.map((_, j) => [i, j] as [number, number]).slice(p + 1),
        },
      );
    }
    liniiGata.add(p);
  }

  adauga(
    <>
      Gata: sub diagonală sunt numai zerouri. Acum ultima linie are o singură necunoscută, deci se
      află direct — apoi se urcă înapoi, linie cu linie.
    </>,
    { linieActiva: undefined },
  );

  return pasi;
}

function Sectiune({
  titlu,
  descriere,
  children,
}: {
  titlu: string;
  descriere?: string;
  children: React.ReactNode;
}) {
  // ancoră stabilă: fără diacritice (NFD desparte litera de semn, `\p{M}` îl scoate)
  const id = titlu
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-");

  return (
    <section id={id} className="scroll-mt-8 py-10">
      <h2 className="text-sectiune font-extrabold">{titlu}</h2>
      {descriere && <p className="text-text-slab mt-1 max-w-2xl">{descriere}</p>}
      <div className="mt-6">{children}</div>
      <Separator className="mt-10" />
    </section>
  );
}

export default function DesignSystem() {
  const [toleranta, setToleranta] = useState([6]);
  const [iteratiiMax, setIteratiiMax] = useState<number | "">(20);
  const [expresie, setExpresie] = useState("x^3 - 2*x - 5");
  const [metoda, setMetoda] = useState("bisectie");
  const [pas, setPas] = useState(0);
  const [ruleaza, setRuleaza] = useState(false);
  const [viteza, setViteza] = useState<Viteza>(1);

  const randuri = useMemo(() => bisectie(8), []);

  // Demonstrația de matrice are derulare proprie: e alt algoritm, cu alt număr
  // de pași, deci nu are ce împărți cu bisecția de mai sus.
  const pasiGauss = useMemo(() => eliminareGauss(), []);
  const [pasM, setPasM] = useState(0);
  const [ruleazaM, setRuleazaM] = useState(false);
  const [vitezaM, setVitezaM] = useState<Viteza>(1);

  useEffect(() => {
    if (!ruleazaM) return;
    const id = setInterval(() => {
      setPasM((p) => {
        if (p >= pasiGauss.length - 1) {
          setRuleazaM(false);
          return p;
        }
        return p + 1;
      });
    }, 1400 / vitezaM);
    return () => clearInterval(id);
  }, [ruleazaM, vitezaM, pasiGauss.length]);

  // Derularea automată a demonstrației — se oprește la ultimul pas.
  useEffect(() => {
    if (!ruleaza) return;
    const id = setInterval(() => {
      setPas((p) => {
        if (p >= randuri.length - 1) {
          setRuleaza(false);
          return p;
        }
        return p + 1;
      });
    }, 900 / viteza);
    return () => clearInterval(id);
  }, [ruleaza, viteza, randuri.length]);

  // Curba lui f, eșantionată o singură dată. Domeniul pe verticală iese din
  // valorile chiar calculate, nu dintr-un număr scris de mână — dacă se schimbă
  // funcția, încadrarea se schimbă odată cu ea.
  const grafic = useMemo(() => {
    const puncte = esantioneaza(f, [2, 3], 240);
    const domeniuY = incadreaza(
      puncte.map((p) => p.y),
      0.08,
    );
    return {
      domeniuY,
      segmente: sparge(puncte, { inaltimeVizibila: domeniuY[1] - domeniuY[0] }),
    };
  }, []);

  // Formula trapezelor din `curs11`: T = h/2·[f(a) + f(b)], h = b − a.
  // Intervalul e [2,2; 3], unde f e pozitivă pe tot parcursul, deci figura
  // desenată chiar e o arie, nu o arie cu semn.
  const trapez = useMemo(() => {
    const a = 2.2;
    const b = 3;
    const puncte = esantioneaza(f, [a, b], 160);
    // Zeroul intră în domeniu, altfel nu s-ar vedea până unde coboară aria.
    const domeniuY = incadreaza([0, ...puncte.map((p) => p.y)], 0.08);
    const capete = [
      { x: a, y: f(a) },
      { x: b, y: f(b) },
    ] as const;
    return {
      a,
      b,
      capete,
      domeniuY,
      segmente: sparge(puncte, { inaltimeVizibila: domeniuY[1] - domeniuY[0] }),
      aproximare: ((b - a) / 2) * (f(a) + f(b)),
    };
  }, []);

  // Propoziția pasului curent. Pe o pagină reală vine din `steps[]`, calculată
  // în `src/algorithms`; aici o compunem din aceleași rânduri ca tabelul, ca
  // demonstrația să nu poată ajunge să spună altceva decât arată cifrele.
  const explicatiePas = useMemo(() => {
    const rand = randuri[pas];
    if (!rand) return undefined;

    const nr = (x: number) => x.toFixed(4);
    // Direcția o citim din rândul următor: dacă s-a mutat capătul din stânga,
    // rădăcina era în dreapta. Așa nu putem greși semnul.
    const urmator = randuri[pas + 1];
    const partea = urmator ? (urmator.a !== rand.a ? "dreapta" : "stânga") : undefined;

    return (
      <>
        Mijlocul intervalului [{nr(rand.a)}, {nr(rand.b)}] este{" "}
        <span className="font-mono font-semibold">xₖ = {nr(rand.c)}</span>, unde f(xₖ) ={" "}
        <span className="font-mono">{nr(rand.fc)}</span>.{" "}
        {partea
          ? `Semnul lui f se schimbă în jumătatea din ${partea}, deci acolo se strânge intervalul.`
          : "E ultimul pas al demonstrației."}
      </>
    );
  }, [randuri, pas]);

  const eroareIteratii =
    iteratiiMax === "" ? "Pune un număr." : iteratiiMax < 1 ? "Cel puțin o iterație." : undefined;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-text-slab text-sm font-semibold tracking-widest uppercase">Faza 2</p>
          <h1 className="text-titlu mt-1 font-extrabold">Design system</h1>
          <p className="text-text-slab mt-2 max-w-2xl">
            Toate componentele proiectului, la un loc. Verifică-le în ambele teme și pe ecran mic
            înainte să le folosești într-o pagină de algoritm.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Separator className="mt-8" />

      <Sectiune
        titlu="Paleta"
        descriere={
          "„Sapphire nightfall whisper”. Pe fundal închis, textul-accent e albastrul deschis " +
          "(#A8C4EC); safirul e culoare de umplere, niciodată de text."
        }
      >
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PALETA.map((culoare) => (
            <li key={culoare.hex}>
              <Card className="gap-0 overflow-hidden py-0">
                <div className="h-16 w-full" style={{ backgroundColor: culoare.hex }} />
                <CardContent className="p-3">
                  <p className="font-semibold">{culoare.nume}</p>
                  <p className="text-text-slab font-mono text-sm">{culoare.hex}</p>
                  <p className="text-text-slab mt-1 text-sm">{culoare.rol}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="border-succes/40 bg-succes-fundal text-succes rounded-lg border p-3 text-sm font-semibold">
            succes — a ajuns la soluție
          </div>
          <div className="border-atentie/40 bg-atentie-fundal text-atentie rounded-lg border p-3 text-sm font-semibold">
            atenție — limită atinsă
          </div>
          <div className="border-eroare/40 bg-eroare-fundal text-eroare rounded-lg border p-3 text-sm font-semibold">
            eroare — s-a îndepărtat de soluție
          </div>
        </div>
      </Sectiune>

      <Sectiune
        titlu="Tipografie"
        descriere="Nunito Sans pentru text, JetBrains Mono pentru formule și tabele numerice. Ambele self-hosted, cu subset latin-ext pentru diacritice."
      >
        <div className="space-y-4">
          <p className="text-afis font-extrabold">Metode numerice</p>
          <p className="text-titlu font-bold">Factorizarea LU</p>
          <p className="text-sectiune font-bold">Eliminare Gaussiană</p>
          <p className="text-subsectiune font-semibold">Pivotare parțială scalată</p>
          <p className="max-w-2xl">
            Text curent. Diacritice de verificat, cu virgulă, nu cu sedilă: Șerban, țeavă, în față,
            aproximație, Împărțire, Ștefan.
          </p>
          <p className="text-text-slab max-w-2xl text-sm">
            Text secundar, pentru explicații și note de subsol.
          </p>
          <div className="border-bordura rounded-lg border p-4 font-mono">
            <p>0123456789 — cifre tabulare, se aliniază pe verticală</p>
            <p>1.4142136</p>
            <p>2.7182818</p>
            <p>3.1415927</p>
          </div>
        </div>
      </Sectiune>

      <Sectiune
        titlu="Mișcare"
        descriere="Trei durate, atât. Decorul se animează doar pe pagina de cuprins; pe paginile de algoritm se animează graficul, nu ambalajul. Tot ce se mișcă respectă prefers-reduced-motion."
      >
        <div className="scroll-tabel border-bordura rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-slab border-bordura border-b text-left">
                <th className="px-4 py-2 font-semibold">Token</th>
                <th className="px-4 py-2 font-semibold">Valoare</th>
                <th className="px-4 py-2 font-semibold">Când</th>
              </tr>
            </thead>
            <tbody>
              {MISCARE.map((m) => (
                <tr key={m.token} className="border-bordura/60 border-b last:border-0">
                  <td className="px-4 py-2 font-mono">{m.token}</td>
                  <td className="px-4 py-2 font-mono">{m.valoare}</td>
                  <td className="text-text-slab px-4 py-2">{m.cand}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sectiune>

      <Sectiune titlu="Componente de bază" descriere="shadcn/ui, re-colorat pe paleta proiectului.">
        <div className="space-y-8">
          <div>
            <h3 className="text-subsectiune mb-3 font-semibold">Butoane</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primar</Button>
              <Button variant="secondary">Secundar</Button>
              <Button variant="outline">Contur</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button disabled>Dezactivat</Button>
              <Button size="sm">Mic</Button>
              <Button size="lg">Mare</Button>
            </div>
          </div>

          <div>
            <h3 className="text-subsectiune mb-3 font-semibold">Etichete</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>ușor</Badge>
              <Badge variant="secondary">capitol</Badge>
              <Badge variant="outline">contur</Badge>
              <Badge variant="succes">convergent</Badge>
              <Badge variant="atentie">limită atinsă</Badge>
              <Badge variant="eroare">divergent</Badge>
            </div>
          </div>

          <div>
            <h3 className="text-subsectiune mb-3 font-semibold">Explicații în context</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>Explicație scurtă, o propoziție.</TooltipContent>
              </Tooltip>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Popover</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <p className="text-sm font-semibold">Numărul de condiționare</p>
                  <p className="text-text-slab mt-1 text-sm">
                    Spune cât de mult amplifică matricea erorile din date. Cu cât e mai mare, cu
                    atât rezultatul e mai puțin de încredere.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <h3 className="text-subsectiune mb-3 font-semibold">Tabs</h3>
            <Tabs defaultValue="bisectie">
              <TabsList>
                <TabsTrigger value="bisectie">Bisecție</TabsTrigger>
                <TabsTrigger value="newton">Newton</TabsTrigger>
                <TabsTrigger value="secanta">Secantă</TabsTrigger>
              </TabsList>
              <TabsContent value="bisectie" className="text-text-slab text-sm">
                Metodă bazată pe interval: sigură, dar înceată.
              </TabsContent>
              <TabsContent value="newton" className="text-text-slab text-sm">
                Convergență rapidă, dar are nevoie de derivată și de un punct de start bun.
              </TabsContent>
              <TabsContent value="secanta" className="text-text-slab text-sm">
                Ca Newton, dar aproximează derivata cu două puncte.
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <h3 className="text-subsectiune mb-3 font-semibold">Accordion</h3>
            <Accordion type="single" collapsible className="border-bordura rounded-xl border px-4">
              <AccordionItem value="1">
                <AccordionTrigger>Ce e un pivot?</AccordionTrigger>
                <AccordionContent>
                  Elementul cu care împărțim ca să eliminăm restul coloanei.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="2">
                <AccordionTrigger>De ce pivotăm?</AccordionTrigger>
                <AccordionContent>
                  Ca să nu împărțim la un număr foarte mic și să nu umflăm erorile de rotunjire.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div>
            <h3 className="text-subsectiune mb-3 font-semibold">Stare de încărcare</h3>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </Sectiune>

      <Sectiune
        titlu="Blocuri de conținut"
        descriere="Ce apare în textul unei metode și în cuprins."
      >
        <div className="space-y-4">
          <Callout tip="nota">
            Regula lui Cramer are complexitate factorială — corectă matematic, inutilizabilă
            practic.
          </Callout>
          <Callout tip="retine">
            Crout are U cu 1 pe diagonală; Doolittle are L cu 1 pe diagonală.
          </Callout>
          <Callout tip="atentie">
            Bisecția cere ca f(a) și f(b) să aibă semne opuse. Altfel nu garantează nimic.
          </Callout>
          <Callout tip="capcana">
            Newton diverge dacă pornești dintr-un punct în care derivata e aproape zero.
          </Callout>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AlgorithmCard
            titlu="Factorizări LU"
            descriere="Vezi cum se sparge o matrice în L și U, element cu element."
            to="/algoritm/factorizari-lu"
          />
          <AlgorithmCard
            titlu="Puncte fixe și rădăcini"
            descriere="Alege intervalul și vezi cum îl strânge fiecare metodă."
            to="/algoritm/ecuatii-neliniare"
          />
          {/* Fără `to`: cardul rămâne estompat și neclicabil. */}
          <AlgorithmCard titlu="Metodele puterii" descriere="De la puterea directă la PageRank." />
        </div>
      </Sectiune>

      <Sectiune
        titlu="Aparatul interactiv"
        descriere="Panoul de parametri, bara de derulare, tabelul de iterații și formula — legate între ele. Formula se aprinde acolo unde e animația: apasă play și urmărește a, b și mijlocul."
      >
        <div className="space-y-4">
          <Legend
            elemente={[
              { rol: "functie", explicatie: "curba pe care căutăm rădăcina" },
              {
                rol: "interval",
                eticheta: "intervalul [aₖ, bₖ]",
                explicatie: "unde știm că e rădăcina",
              },
              {
                rol: "curent",
                eticheta: "mijlocul xₖ",
                explicatie: "punctul calculat la pasul curent",
              },
              { rol: "anterior", explicatie: "capetele de la pașii dinainte" },
              { rol: "solutie", explicatie: "unde ajunge metoda" },
              { rol: "grila", explicatie: "reperele de pe axe" },
            ]}
            pasi={[
              "Scrie funcția sau alege un exemplu.",
              "Apasă play sau mergi pas cu pas.",
              "Urmărește în formulă ce parte se aprinde la fiecare pas.",
              "Dă clic pe un rând din tabel ca să sari direct la acea iterație.",
            ]}
          />

          <FormulaBlock
            eticheta="Metoda bisecției — pasul k"
            latex={String.raw`x_k = \frac{\htmlId{f-a}{a_k} + \htmlId{f-b}{b_k}}{2}, \qquad \htmlId{f-cond}{f(a_k)\cdot f(x_k) < 0}`}
            evidentiaza={pas % 3 === 0 ? ["f-a"] : pas % 3 === 1 ? ["f-b"] : ["f-cond"]}
          />

          <StepExplanation
            explicatie={explicatiePas}
            pas={pas}
            totalPasi={randuri.length}
            ruleaza={ruleaza}
          />

          {/* Aceeași componentă fără pași: ce se vede înainte să ruleze ceva. */}
          <StepExplanation pas={0} totalPasi={0} />

          <PlaybackBar
            pas={pas}
            totalPasi={randuri.length}
            ruleaza={ruleaza}
            viteza={viteza}
            onPas={setPas}
            onRuleazaChange={setRuleaza}
            onVitezaChange={setViteza}
          />

          <IterationTable
            titlu="Bisecție pe f(x) = x³ − 2x − 5, interval [2, 3]"
            randCurent={pas}
            onAlegeRand={(i) => {
              setRuleaza(false);
              setPas(i);
            }}
            coloane={[
              { cheie: "a", titlu: "aₖ" },
              { cheie: "b", titlu: "bₖ" },
              { cheie: "c", titlu: "xₖ", descriere: "mijlocul intervalului" },
              { cheie: "fc", titlu: "f(xₖ)" },
              { cheie: "lung", titlu: "bₖ − aₖ", descriere: "lungimea intervalului" },
            ]}
            randuri={randuri.map((r) => ({
              a: r.a.toFixed(6),
              b: r.b.toFixed(6),
              c: r.c.toFixed(6),
              fc: r.fc.toFixed(6),
              lung: r.lung.toExponential(2),
            }))}
          />

          <ControlPanel
            descriere="Pe mobil panoul stă sub grafic; pe desktop, lângă el."
            onReset={() => {
              setToleranta([6]);
              setIteratiiMax(20);
              setExpresie("x^3 - 2*x - 5");
              setMetoda("bisectie");
            }}
          >
            <ExpressionInput
              className="sm:col-span-2"
              eticheta="Funcția f(x)"
              valoare={expresie}
              onChange={setExpresie}
              exemple={["x^3 - 2*x - 5", "cos(x) - x", "x^2 - 2"]}
            />

            <div className="grid gap-1.5">
              <label className="text-sm font-semibold" htmlFor="ds-toleranta">
                Toleranță: 10<sup>−{toleranta[0]}</sup>
              </label>
              <Slider
                id="ds-toleranta"
                className="mt-2"
                min={1}
                max={12}
                step={1}
                value={toleranta}
                onValueChange={setToleranta}
              />
              <p className="text-text-slab text-xs">Când se oprește căutarea.</p>
            </div>

            <NumberInput
              eticheta="Iterații maxime"
              valoare={iteratiiMax}
              onChange={setIteratiiMax}
              min={1}
              max={200}
              unitate="pași"
              ajutor="Plasa de siguranță, dacă metoda nu converge."
              eroare={eroareIteratii}
            />

            <div className="grid gap-1.5">
              <label className="text-sm font-semibold" htmlFor="ds-metoda">
                Metoda
              </label>
              <Select value={metoda} onValueChange={setMetoda}>
                <SelectTrigger id="ds-metoda" className="tinta-atingere">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bisectie">Bisecție</SelectItem>
                  <SelectItem value="newton">Newton (tangentei)</SelectItem>
                  <SelectItem value="secanta">Secantă</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ControlPanel>
        </div>
      </Sectiune>

      <Sectiune
        titlu="Matricea"
        descriere="Eliminare Gaussiană pe exemplul din curs (curs4, §4.3). Scopul e să facem zerouri sub diagonală, ca sistemul să se rezolve de jos în sus. Liniile sunt L₁–L₃, coloanele C₁–C₃, iar ultima coloană, b, e partea din dreapta a egalului."
      >
        <div className="space-y-4">
          <Legend
            titlu="Legenda matricei"
            elemente={[
              {
                rol: "pivot",
                explicatie: "numărul cu care împărțim ca să facem zerouri sub el",
              },
              {
                rol: "curent",
                eticheta: "se schimbă acum",
                forma: "celula",
                explicatie: "numerele recalculate la pasul curent",
              },
              {
                rol: "interval",
                eticheta: "linia la care lucrăm",
                explicatie: "linia care se modifică acum",
              },
              {
                rol: "anterior",
                eticheta: "gata, nu se mai schimbă",
                forma: "celula",
                explicatie: "linii terminate la pașii dinainte",
              },
              {
                culoare: "var(--text-slab)",
                eticheta: "zero pe care l-am făcut noi",
                forma: "celula",
                explicatie: "nu era acolo de la început",
              },
            ]}
            pasi={[
              "Apasă play, sau mergi pas cu pas cu săgețile.",
              "Caută pivotul: e singurul număr pe fundal plin.",
              "Sub matrice scrie, în cuvinte, ce se întâmplă la pasul acela.",
              "La final, sub diagonală rămân numai zerouri.",
            ]}
          />

          <div className="bg-suprafata border-bordura shadow-jos rounded-xl border p-4">
            <MatrixGrid
              titlu="matricea extinsă [A|b]"
              valori={pasiGauss[pasM]?.valori ?? []}
              stari={pasiGauss[pasM]?.stari}
              linieActiva={pasiGauss[pasM]?.linieActiva}
              separatorColoana={2}
              etichetaLinii={["L₁", "L₂", "L₃"]}
              etichetaColoane={["C₁", "C₂", "C₃", "b"]}
            />
          </div>

          <StepExplanation
            explicatie={pasiGauss[pasM]?.explicatie}
            pas={pasM}
            totalPasi={pasiGauss.length}
            ruleaza={ruleazaM}
          />

          <PlaybackBar
            pas={pasM}
            totalPasi={pasiGauss.length}
            ruleaza={ruleazaM}
            viteza={vitezaM}
            onPas={setPasM}
            onRuleazaChange={setRuleazaM}
            onVitezaChange={setVitezaM}
          />
        </div>
      </Sectiune>

      <Sectiune
        titlu="Graficul"
        descriere="Sistemul de axe și straturile care se așază peste el. Reperele se aleg singure din 1 / 2 / 5 / 10, iar densitatea lor scade pe ecran îngust. Graficul de sus se poate explora: trage de el, apasă butoanele, sau folosește săgețile după ce îl selectezi cu Tab."
      >
        <div className="space-y-4">
          <Legend
            titlu="Legenda graficului"
            elemente={[
              { rol: "functie", explicatie: "funcția în care căutăm rădăcina" },
              {
                rol: "interval",
                eticheta: "intervalul în care e rădăcina",
                explicatie: "paranteza cu capetele aₖ și bₖ; se înjumătățește la fiecare pas",
              },
              {
                rol: "curent",
                eticheta: "mijlocul de acum",
                explicatie: "punctul calculat la pasul curent",
              },
              { rol: "anterior", explicatie: "mijloacele de la pașii dinainte" },
              { rol: "grila", explicatie: "reperele de pe axe" },
            ]}
            pasi={[
              "Apasă play sau mergi pas cu pas.",
              "Urmărește cum cele două capete, aₖ și bₖ, se apropie unul de altul.",
              "Linia punctată arată în dreptul cărei valori de pe axă a ajuns mijlocul.",
              "Trage de grafic sau apasă lupa ca să te apropii; butonul din dreapta revine.",
            ]}
          />

          <div className="bg-suprafata border-bordura shadow-jos rounded-xl border p-4">
            <Plot
              interactiv
              domeniuX={[2, 3]}
              domeniuY={grafic.domeniuY}
              rezumat="Bisecție pe f(x) = x³ − 2x − 5, pe intervalul [2, 3]"
              descriere={
                randuri[pas]
                  ? `Pasul ${pas + 1} din ${randuri.length}. Intervalul e de la ${randuri[pas].a.toFixed(4)} la ${randuri[pas].b.toFixed(4)}, iar mijlocul lui e ${randuri[pas].c.toFixed(4)}, unde funcția ia valoarea ${randuri[pas].fc.toFixed(4)}.`
                  : undefined
              }
            >
              {randuri[pas] && (
                <PlotInterval
                  de={randuri[pas].a}
                  la={randuri[pas].b}
                  etichetaDe={`a${indice(pas)}`}
                  etichetaLa={`b${indice(pas)}`}
                  eticheta={`[${zecimale(randuri[pas].a, 3)} ; ${zecimale(randuri[pas].b, 3)}]`}
                />
              )}

              <PlotCurba segmente={grafic.segmente} />

              {/* Mijloacele de la pașii dinainte, tot mai șterse pe măsură ce
                  se depărtează — se vede drumul, nu doar poziția de acum. */}
              {randuri.slice(0, pas).map((rand, i) => (
                <PlotPunct
                  key={i}
                  x={rand.c}
                  y={rand.fc}
                  rol="anterior"
                  raza={6}
                  opacitate={0.35 + (0.5 * (i + 1)) / Math.max(1, pas)}
                />
              ))}

              {randuri[pas] && (
                <PlotPunct
                  x={randuri[pas].c}
                  y={randuri[pas].fc}
                  rol="curent"
                  proiectie
                  eticheta={`x${indice(pas)}`}
                />
              )}
            </Plot>
          </div>

          <Callout tip="nota" titlu="Aceleași straturi, alt desen">
            Graficul de mai jos folosește exact aceleași piese, dar pentru altceva: aria de sub
            curbă, aproximată cu un trapez. Formula e cea din curs (<code>curs11</code>, „Formula
            trapezelor"): <code>T = h/2·[f(a) + f(b)]</code>, cu <code>h = b − a</code>. Pe{" "}
            <code>[2,2 ; 3]</code> funcția e pozitivă peste tot, deci figura desenată chiar e o
            arie. Iese <code>T = {trapez.aproximare.toFixed(4)}</code>, față de valoarea exactă{" "}
            <code>6,2336</code> — trapezul supraevaluează, fiindcă funcția e convexă aici și curba
            stă sub coardă.
          </Callout>

          <div className="bg-suprafata border-bordura shadow-jos rounded-xl border p-4">
            <Plot
              domeniuX={[trapez.a, trapez.b]}
              domeniuY={trapez.domeniuY}
              inaltime={220}
              rezumat="Formula trapezelor pentru f(x) = x³ − 2x − 5 pe intervalul de la 2,2 la 3"
              descriere={`Aria de sub curbă e aproximată cu un trapez cu vârfurile la ${trapez.a} și 3. Aproximarea dă ${trapez.aproximare.toFixed(4)}, iar valoarea exactă e 6,2336.`}
            >
              {/* Fără contur: latura de sus a trapezului **este** coarda de mai
                  jos, iar desenată de două ori, în două culori, ar arăta ca
                  două linii diferite. */}
              <PlotArie puncte={trapez.capete} baza={0} contur={false} />
              <PlotCurba segmente={trapez.segmente} />
              {/* Coarda: dreapta prin cele două capete, adică chiar polinomul
                  Lagrange de ordinul întâi din care iese formula. */}
              <PlotDreapta intre={trapez.capete} rol="anterior" punctata grosime={3.5} />
              {trapez.capete.map((capat, i) => (
                <PlotPunct
                  key={i}
                  x={capat.x}
                  y={capat.y}
                  rol="curent"
                  raza={7}
                  eticheta={i === 0 ? "a" : "b"}
                />
              ))}
            </Plot>
          </div>
        </div>
      </Sectiune>

      <footer className="text-text-slab py-8 text-sm">
        Pagină internă de verificare. Nu ajunge în meniul site-ului.
      </footer>
    </div>
  );
}
