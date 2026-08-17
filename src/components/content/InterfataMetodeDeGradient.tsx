import { useMemo, useState } from "react";

import * as conjugat from "@/algorithms/metode-de-gradient/conjugat";
import * as descendent from "@/algorithms/metode-de-gradient/descendent";
import { descrieScena } from "@/algorithms/metode-de-gradient/descriere";
import {
  SISTEME,
  SISTEM_IMPLICIT,
  type ValoriSistem,
} from "@/algorithms/metode-de-gradient/sisteme";
import type { RezultatGradient } from "@/algorithms/metode-de-gradient/tipuri";
import { Callout } from "@/components/content/Callout";
import { ValeaGradientului } from "@/components/content/ValeaGradientului";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ControlPanel } from "@/components/viz/ControlPanel";
import { FormulaBlock } from "@/components/viz/FormulaBlock";
import { IterationTable } from "@/components/viz/IterationTable";
import { Legend, type ElementLegenda } from "@/components/viz/Legend";
import { Notatie } from "@/components/viz/Notatie";
import { NumberInput } from "@/components/viz/NumberInput";
import { PlaybackBar } from "@/components/viz/PlaybackBar";
import { StepExplanation } from "@/components/viz/StepExplanation";
import { useDerulare } from "@/hooks/use-derulare";
import { conditionare, type Mat2, type Vec2 } from "@/lib/curbe-de-nivel";
import { stiintific, zecimale } from "@/lib/numere";

const METODE = [
  { id: "descendent", titlu: "Gradientul Descendent" },
  { id: "conjugat", titlu: "Gradientul Conjugat" },
] as const;

type IdMetoda = (typeof METODE)[number]["id"];

const IMPLICIT = SISTEM_IMPLICIT;

const MAX_ITERATII_PERMISE = 200;

type Camp = keyof ValoriSistem;
type Valori = Record<Camp, number | "">;

/** Câmpurile pe care le încarcă un buton de sistem — toate, deodată. */
const CAMPURI: readonly Camp[] = [
  "a11",
  "a12",
  "a22",
  "b1",
  "b2",
  "x01",
  "x02",
  "tol",
  "maxIteratii",
];

/**
 * Interfața interactivă a paginii 7: coborârea în vale, în 3D.
 *
 * Matematica **nu** stă aici. Sistemul, pașii, formulele cu numerele puse în
 * ele și propozițiile care le descriu vin din
 * `src/algorithms/metode-de-gradient/`; desenul, din `ValeaGradientului`.
 * Componenta asta doar leagă controalele de rulare și alege ce pas se arată.
 *
 * Metoda se alege din taburi și se vede **una singură** odată: două trasee peste
 * aceeași vale s-ar suprapune tocmai în porțiunea care contează, ultimele
 * iterații de lângă fundul văii. A existat un comutator care aprindea drumul
 * celeilalte metode, punctat pe podea; a fost scos la cerere. Paralela cerută de
 * `Plan.md` rămâne în text — în teoria paginii și în propoziția de încheiere,
 * care spune câți pași a luat fiecare metodă și de ce.
 */
export function InterfataMetodeDeGradient() {
  const [idMetoda, setIdMetoda] = useState<IdMetoda>("descendent");
  const [valori, setValori] = useState<Valori>({ ...IMPLICIT });

  const seteaza = (camp: Camp) => (v: number | "") =>
    setValori((stare) => ({ ...stare, [camp]: v }));

  const reseteaza = () => setValori({ ...IMPLICIT });

  const incarcaSistem = (v: ValoriSistem) => setValori({ ...v });
  /** Sistemul ales e cel ale cărui cifre stau, toate, în câmpuri chiar acum. */
  const esteAles = (v: ValoriSistem) => CAMPURI.every((camp) => valori[camp] === v[camp]);

  const a11 = numar(valori.a11, IMPLICIT.a11);
  const a12 = numar(valori.a12, IMPLICIT.a12);
  const a22 = numar(valori.a22, IMPLICIT.a22);
  const b1 = numar(valori.b1, IMPLICIT.b1);
  const b2 = numar(valori.b2, IMPLICIT.b2);
  const x01 = numar(valori.x01, IMPLICIT.x01);
  const x02 = numar(valori.x02, IMPLICIT.x02);

  const tolBruta = numar(valori.tol, IMPLICIT.tol);
  const tol = tolBruta > 0 ? tolBruta : IMPLICIT.tol;
  const maxIteratii = Math.min(
    MAX_ITERATII_PERMISE,
    Math.max(1, Math.round(numar(valori.maxIteratii, IMPLICIT.maxIteratii))),
  );

  // Matricea și vectorii se memorează pe **cifre**, nu pe identitate: recreați la
  // fiecare randare, ar invalida rularea și, mai departe, toate calculele pe
  // care `ValeaGradientului` le face o singură dată (cutia, curbele de nivel).
  const A = useMemo<Mat2>(() => [a11, a12, a22], [a11, a12, a22]);
  const b = useMemo<Vec2>(() => [b1, b2], [b1, b2]);
  const x0 = useMemo<Vec2>(() => [x01, x02], [x01, x02]);

  const rezultat = useMemo<RezultatGradient>(() => {
    const parametri = { A, b, x0, tol, maxIteratii };
    return idMetoda === "descendent" ? descendent.run(parametri) : conjugat.run(parametri);
  }, [idMetoda, A, b, x0, tol, maxIteratii]);

  const derulare = useDerulare(rezultat.pasi.length);
  const pas = rezultat.pasi[derulare.pas];
  const ultimulPas = derulare.pas === rezultat.pasi.length - 1;

  const kappa = rezultat.conditionare ?? conditionare(A);
  const numeMetoda = idMetoda === "descendent" ? descendent.meta.titlu : conjugat.meta.titlu;

  return (
    <div className="flex flex-col gap-6">
      {/* Legenda stă înaintea **alegerii metodei**, nu doar înaintea desenului:
          ce înseamnă fiecare culoare e același lucru la amândouă metodele, deci
          se citește o dată, înainte de orice. Rândul comparației apare doar cât
          timp e pornită — legenda descrie ce e pe ecran, nu ce ar putea fi. */}
      <Legend elemente={LEGENDA} />

      <Tabs value={idMetoda} onValueChange={(v) => setIdMetoda(v as IdMetoda)}>
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
          {/* Înălțime minimă doar de la `lg` în sus: acolo scena stă lângă
              panoul de parametri, iar celula de grilă își lua înălțimea de la
              el — ~360 px într-o casetă lată de 730, deși din lățime ar fi
              ieșit ~500. Sub `lg` panoul trece dedesubt și containerul dictează
              singur, deci nu se forțează nimic. */}
          <div className="flex min-w-0 items-center p-4 sm:p-5 lg:min-h-[480px]">
            {rezultat.pasi.length > 0 ? (
              <ValeaGradientului
                A={A}
                b={b}
                pasi={rezultat.pasi}
                pasCurent={derulare.pas}
                solutie={rezultat.solutie}
                descriere={descrieScena(pas, rezultat.pasi.length, rezultat.solutie)}
                numeMetoda={numeMetoda}
                className="w-full"
              />
            ) : (
              <div className="text-text-slab flex min-h-[420px] items-center justify-center px-6 text-center text-lg text-pretty">
                {rezultat.motiv}
              </div>
            )}
          </div>

          <ControlPanel
            onReset={reseteaza}
            incorporat
            className="border-bordura min-w-0 border-t lg:border-t-0 lg:border-l"
          >
            {/* Sistemele gata alese, în capul panoului: ele schimbă **forma
                văii**, adică singurul lucru de care depinde numărul de pași al
                coborârii. Cifrele fiecăruia sunt măsurate, nu alese din ochi —
                vezi `src/algorithms/metode-de-gradient/sisteme.ts`. */}
            {/* `sm:col-span-2` ca la rândul matricei de mai jos: panoul e o
                grilă cu două coloane implicite, deci fără el butoanele s-ar
                înghesui pe jumătate de lățime. */}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {SISTEME.map((sistem) => {
                const ales = esteAles(sistem.valori);
                return (
                  <Button
                    key={sistem.id}
                    // Ca la vitezele din `PlaybackBar`: sistemul ales se vede
                    // umplut, nu doar anunțat prin `aria-pressed`.
                    variant={ales ? "default" : "outline"}
                    size="sm"
                    className="tinta-atingere"
                    aria-pressed={ales}
                    onClick={() => incarcaSistem(sistem.valori)}
                  >
                    {sistem.eticheta}
                  </Button>
                );
              })}
            </div>

            {/* Matricea are **trei** câmpuri, nu patru: simetria e ipoteza
                metodei (curs 5, §8.1), nu o opțiune, deci `a₂₁` nu se poate
                scrie separat. */}
            {/* Coloana din mijloc e mai lată: eticheta ei, „a₁₂ = a₂₁", e de trei
                ori mai lungă decât celelalte două și, la corpul de 18 px, se
                rupea pe două rânduri într-o treime egală. */}
            <div className="grid grid-cols-[1fr_1.45fr_1fr] gap-3 sm:col-span-2">
              <NumberInput
                eticheta="a₁₁"
                valoare={valori.a11}
                onChange={seteaza("a11")}
                pas={0.1}
              />
              <NumberInput
                eticheta="a₁₂ = a₂₁"
                valoare={valori.a12}
                onChange={seteaza("a12")}
                pas={0.1}
              />
              <NumberInput
                eticheta="a₂₂"
                valoare={valori.a22}
                onChange={seteaza("a22")}
                pas={0.1}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberInput eticheta="b₁" valoare={valori.b1} onChange={seteaza("b1")} pas={0.1} />
              <NumberInput eticheta="b₂" valoare={valori.b2} onChange={seteaza("b2")} pas={0.1} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                eticheta="x₁⁽⁰⁾"
                valoare={valori.x01}
                onChange={seteaza("x01")}
                pas={0.1}
              />
              <NumberInput
                eticheta="x₂⁽⁰⁾"
                valoare={valori.x02}
                onChange={seteaza("x02")}
                pas={0.1}
              />
            </div>

            {/* Pe toată lățimea: în jumătate de coloană, „1e-8" plus unitatea
                și săgețile câmpului numeric nu mai încap la corpul de 18 px. */}
            <NumberInput
              className="sm:col-span-2"
              eticheta="Toleranța"
              valoare={valori.tol}
              onChange={seteaza("tol")}
              min={1e-14}
              stiintific
              faraSageti
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

          {/* Propoziția pasului nu se mai arată: formula de mai jos, cu
              numerele puse în ea, spune același lucru mai scurt. Rămâne totuși
              montată, **doar pentru cititorul de ecran** — ea e regiunea
              `aria-live` care anunță fiecare pas; fără ea, cine nu vede desenul
              n-ar mai afla că s-a schimbat ceva. */}
          {/* `sr-only` pe un **înveliș**, nu pe componentă: pusă direct pe ea,
              utilitara se bate cu `p-5` din interiorul componentei (ordinea din
              CSS decide, nu cea din atribut) și secțiunea rămânea de 50 px. */}
          <div className="sr-only">
            <StepExplanation
              explicatie={pas?.explicatie}
              pas={derulare.pas}
              totalPasi={rezultat.pasi.length}
              ruleaza={derulare.ruleaza}
            />
          </div>

          {/* Paralela formulă ↔ desen: partea aprinsă din formulă e chiar
              elementul desenat — direcția săgeții, lungimea ei, vârful. */}
          {pas?.latexPas && (
            <FormulaBlock
              latex={pas.latexPas}
              eticheta="Pasul acesta, cu numerele în formulă"
              evidentiaza={pas.evidentiaza}
              // De când propoziția pasului nu se mai arată, formula asta duce
              // singură explicația — deci se citește de la distanța de la care
              // te uiți la desen, nu de la cea a unui text de corp.
              className="text-[1.25rem] sm:text-[1.4rem]"
            />
          )}
        </>
      )}

      {/* Erorile se scriu, nu se colorează pe desen — regula din CLAUDE.md. */}
      {rezultat.stare === "esuat" && (
        <Callout tip="atentie" titlu="Metoda s-a oprit">
          <Notatie>{rezultat.motiv ?? ""}</Notatie>
        </Callout>
      )}
      {ultimulPas && rezultat.stare === "convergent" && (
        <Callout tip="retine" titlu="Metoda a ajuns la soluție">
          <Notatie>{incheiere(idMetoda, rezultat, kappa)}</Notatie>
        </Callout>
      )}
      {ultimulPas && rezultat.stare === "neterminat" && (
        <Callout tip="atentie" titlu="S-au terminat iterațiile">
          <Notatie>{rezultat.motiv ?? ""}</Notatie>
        </Callout>
      )}

      {rezultat.pasi.length > 0 && (
        <IterationTable
          coloane={[
            { cheie: "x", titlu: "x⁽ᵏ⁾", descriere: "Punctul la care s-a ajuns" },
            { cheie: "f", titlu: "f(x⁽ᵏ⁾)", descriere: "Cât de jos în vale a coborât" },
            {
              cheie: "pas",
              titlu: idMetoda === "descendent" ? "α" : "tₖ",
              descriere: "Lungimea pasului pe direcția de căutare",
            },
            { cheie: "eroare", titlu: "‖r⁽ᵏ⁾‖", descriere: "Criteriul de oprire" },
            {
              cheie: "special",
              titlu: idMetoda === "descendent" ? "cos(r⁽ᵏ⁻¹⁾, r⁽ᵏ⁾)" : "⟨v⁽ᵏ⁻¹⁾, A·v⁽ᵏ⁾⟩",
              descriere:
                idMetoda === "descendent"
                  ? "Zero la fiecare pas: fiecare direcție e perpendiculară pe cea dinainte — de aici zigzagul"
                  : "Zero la fiecare pas: direcțiile sunt A-conjugate — de aici numărul mic de pași",
            },
            {
              cheie: "abatere",
              titlu: "‖x⁽ᵏ⁾ − x*‖",
              descriere: "Distanța până la soluția exactă, calculată separat",
            },
          ]}
          randuri={rezultat.pasi.map((p) => ({
            x: `(${zecimale(p.x[0], 6)}; ${zecimale(p.x[1], 6)})`,
            f: zecimale(p.f, 6),
            pas: zecimale(p.pas, 6),
            eroare: stiintific(p.eroare, 2),
            special:
              idMetoda === "descendent"
                ? p.cosDirectii === undefined
                  ? "—"
                  : stiintific(p.cosDirectii, 2)
                : p.aOrtogonalitate === undefined
                  ? "—"
                  : stiintific(p.aOrtogonalitate, 2),
            abatere: stiintific(p.abatere, 2),
          }))}
          randCurent={derulare.pas}
          onAlegeRand={derulare.setPas}
          // Gradientul conjugat se oprește în doi-trei pași, cel descendent după
          // zeci: fără înălțime fixă, tabelul se strânge și trage pagina în sus
          // la schimbarea tabului.
          className="h-96"
        />
      )}
    </div>
  );
}

/**
 * Legenda scenei.
 *
 * Două dintre explicații nu sunt descriere, ci **corecții**: fără ele desenul ar
 * afirma tăcut câte ceva fals.
 *
 * - Înălțimea e scalată altfel decât planul — n-are cum altfel, sunt unități
 *   diferite — deci panta văzută nu e panta reală.
 * - Unghiul drept dintre doi pași consecutivi se citește drept **numai** din
 *   privirea de sus: la unghiul implicit, un unghi real de 90° se vede ca 122°.
 *
 * Restul rândurilor n-au explicație, și e în regulă: numesc ce se vede. Când se
 * scurtează legenda, astea două se scurtează, nu se scot.
 */
const LEGENDA: ElementLegenda[] = [
  {
    rol: "functie",
    eticheta: "valea funcției",
    forma: "zona",
    explicatie: "Înălțimea are altă scară decât planul, deci panta desenată nu e cea reală.",
  },
  {
    rol: "grila",
    eticheta: "curbele de nivel",
    forma: "linie",
    explicatie: "Unde f ia aceeași valoare.",
  },
  {
    rol: "interval",
    eticheta: "curba pe care a aterizat iterația, și pasul făcut",
    forma: "linie",
    explicatie:
      "Pasul următor pleacă perpendicular pe curba asta. Unghiul dintre doi pași se citește corect abia din privirea de sus.",
  },
  { rol: "anterior", eticheta: "iterațiile de până acum", forma: "punct" },
  { rol: "curent", eticheta: "iterația curentă", forma: "punct" },
  { rol: "solutie", eticheta: "x*(fundul văii) — soluția sistemului", forma: "punct" },
];

/** Câmpul gol înseamnă „încă tastez", nu zero. */
function numar(valoare: number | "", implicit: number): number {
  return typeof valoare === "number" && Number.isFinite(valoare) ? valoare : implicit;
}

/**
 * Propoziția de la final: câți pași au trebuit și de ce atâția.
 *
 * Numărul de condiționare nu e un ornament — el e răspunsul la „de ce coborârea
 * are nevoie de zeci de pași, iar gradientul Conjugat de doi": valea alungită
 * face zigzagul lung, iar `n = 2` din curs 5, §8.4 nu depinde deloc de formă.
 */
function incheiere(idMetoda: IdMetoda, rezultat: RezultatGradient, kappa: number): string {
  const pasi = rezultat.pasi.length;
  const forma = Number.isFinite(kappa)
    ? `Valea are numărul de condiționare κ = ${zecimale(kappa, 4)}`
    : "Valea e practic degenerată";

  if (idMetoda === "conjugat") {
    return (
      `${pasi} ${pasi === 1 ? "pas" : "pași"} — și n-ar fi putut fi mai mulți: pentru un sistem de dimensiune n, ` +
      `direcțiile A-conjugate ating soluția exactă în cel mult n pași, aici n = 2. ` +
      `${forma}, dar numărul de pași nu depinde de el.`
    );
  }

  return (
    `${pasi} ${pasi === 1 ? "pas" : "pași"}. Fiecare direcție e perpendiculară pe cea dinainte, ` +
    `de unde zigzagul: coborârea taie mereu de-a curmezișul văii în loc s-o urmeze. ` +
    `${forma}; cu cât e mai mare, cu atât valea e mai alungită și cu atât zigzagul e mai lung.`
  );
}
