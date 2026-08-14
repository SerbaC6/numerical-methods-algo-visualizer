import { useMemo, useState } from "react";

import { clasamentText, descrieScena, procent } from "@/algorithms/pagerank/descriere";
import * as pagerank from "@/algorithms/pagerank/putere";
import { comutaLink, reteaDinCurs } from "@/algorithms/pagerank/retea";
import type { FazaPageRank, Retea } from "@/algorithms/pagerank/tipuri";
import { Callout } from "@/components/content/Callout";
import { RetauaDePagini } from "@/components/content/RetauaDePagini";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ControlPanel } from "@/components/viz/ControlPanel";
import { FormulaBlock } from "@/components/viz/FormulaBlock";
import { IterationTable } from "@/components/viz/IterationTable";
import { Legend, type ElementLegenda } from "@/components/viz/Legend";
import { MatrixGrid } from "@/components/viz/MatrixGrid";
import { NumberInput } from "@/components/viz/NumberInput";
import { PlaybackBar } from "@/components/viz/PlaybackBar";
import { StepExplanation } from "@/components/viz/StepExplanation";
import { useDerulare } from "@/hooks/use-derulare";
import { stiintific, zecimale } from "@/lib/numere";

const TOL_IMPLICIT = 1e-6;
const MAX_ITERATII_IMPLICIT = 100;
const MAX_ITERATII_PERMISE = 300;

/** Numele matricei arătate la fiecare fază, exact cum o cheamă în formulă. */
const TITLU_MATRICE: Partial<Record<FazaPageRank, string>> = {
  adiacenta: "A — link-urile, pe linii",
  normalizare: "S — fiecare linie împărțită la link-urile ei",
  transpunere: "M = Sᵀ — coloanele însumează 1",
  google: "G = d·M + ((1−d)/N)·ONES(N)",
};

/**
 * Interfața interactivă a paginii 9: rețeaua de pagini și PageRank-ul ei.
 *
 * Matematica **nu** stă aici. Matricile, pașii, formulele cu numerele puse în
 * ele și propozițiile care le descriu vin din `src/algorithms/pagerank/`;
 * desenul, din `RetauaDePagini`. Componenta leagă controalele de rulare și alege
 * ce pas se arată.
 *
 * Link-urile se comută **direct în matricea A**: un clic pe celula `(i, j)` face
 * să apară sau să dispară săgeata `Pi → Pj`, iar tot ce urmează — S, M, G,
 * iterațiile, clasamentul — se recalculează pe loc, fără buton de „calculează".
 * Diagonala rămâne dezactivată: o pagină nu are link către ea însăși.
 */
export function InterfataPageRank() {
  const [retea, setRetea] = useState<Retea>(() => reteaDinCurs());
  const [d, setD] = useState(0.85);
  const [tol, setTol] = useState<number | "">(TOL_IMPLICIT);
  const [maxIteratii, setMaxIteratii] = useState<number | "">(MAX_ITERATII_IMPLICIT);

  const tolFolosit = typeof tol === "number" && tol > 0 ? tol : TOL_IMPLICIT;
  const maxFolosit = Math.min(
    MAX_ITERATII_PERMISE,
    Math.max(1, Math.round(typeof maxIteratii === "number" ? maxIteratii : MAX_ITERATII_IMPLICIT)),
  );

  const rezultat = useMemo(
    () => pagerank.run({ retea, d, tol: tolFolosit, maxIteratii: maxFolosit }),
    [retea, d, tolFolosit, maxFolosit],
  );

  const derulare = useDerulare(rezultat.pasi.length);
  const pas = rezultat.pasi[derulare.pas];
  const ultimulPas = derulare.pas === rezultat.pasi.length - 1;
  const laFinal = ultimulPas && pas?.faza === "normalizare-finala";

  const reseteaza = () => {
    setRetea(reteaDinCurs());
    setD(0.85);
    setTol(TOL_IMPLICIT);
    setMaxIteratii(MAX_ITERATII_IMPLICIT);
  };

  const nrIteratii = rezultat.pasi.filter((p) => p.faza === "iteratie").length;
  const iteratii = rezultat.pasi.filter((p) => p.faza === "iteratie");

  // Matricea arătată sub graf: cea a pasului, cât timp pasul are una; la
  // iterații rămâne G, fiindcă ea e cea cu care se înmulțește la fiecare pas.
  const matriceaPasului = pas?.matrice ?? rezultat.matrici?.G;
  const titluMatrice =
    (pas && TITLU_MATRICE[pas.faza]) ?? "G — matricea cu care se înmulțește la fiecare iterație";

  return (
    <div className="flex flex-col gap-6">
      <Legend elemente={LEGENDA} />

      <div className="bg-suprafata border-bordura shadow-jos overflow-hidden rounded-xl border">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_clamp(300px,26%,380px)]">
          <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-5">
            {rezultat.pasi.length > 0 ? (
              <>
                <RetauaDePagini
                  retea={retea}
                  pas={pas}
                  laFinal={laFinal}
                  descriere={descrieScena(pas, rezultat.pasi.length, retea.nume)}
                  className="w-full"
                />
                {matriceaPasului && (
                  <MatrixGrid
                    valori={matriceaPasului}
                    titlu={titluMatrice}
                    etichetaLinii={retea.nume}
                    etichetaColoane={retea.nume}
                    formateaza={(x) => (Number.isInteger(x) ? String(x) : x.toFixed(3))}
                    className="self-center"
                  />
                )}
              </>
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
            {/* Rețeaua se schimbă chiar din matricea de adiacență: e singurul loc
                în care „link de la Pi la Pj" și celula (i, j) sunt același lucru,
                deci comutatorul stă exact peste ce înseamnă. */}
            <div className="sm:col-span-2">
              <MatrixGrid
                valori={retea.linkuri.map((linie) => linie.map((are) => (are ? 1 : 0)))}
                titlu="Link-urile rețelei — apasă o celulă"
                etichetaLinii={retea.nume}
                etichetaColoane={retea.nume}
                stari={retea.linkuri.map((linie) =>
                  linie.map((are) => (are ? "curent" : "normala")),
                )}
                onCelula={(i, j) => setRetea((r) => comutaLink(r, i, j))}
                celulaDezactivata={(i, j) => i === j}
                numeCelula={(i, j) =>
                  `link de la ${retea.nume[i] ?? `P${i + 1}`} la ${retea.nume[j] ?? `P${j + 1}`}`
                }
                descriere={`Matricea de adiacență, ${retea.nume.length} pe ${retea.nume.length}. Fiecare celulă din afara diagonalei e un comutator: apăsat înseamnă că există link.`}
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="pagerank-d">
                d — șansa de a urma un link: <span className="font-mono">{zecimale(d, 2)}</span>
              </Label>
              <Slider
                id="pagerank-d"
                min={0.5}
                max={0.99}
                step={0.01}
                value={[d]}
                onValueChange={([nou]) => setD(nou ?? 0.85)}
                aria-label="d — șansa de a urma un link"
              />
            </div>

            <NumberInput
              eticheta="Toleranța pentru ‖v − vprev‖"
              valoare={tol}
              onChange={setTol}
              min={1e-14}
              pas={1e-7}
              unitate="ε"
              eroare={
                typeof tol === "number" && tol <= 0
                  ? "Toleranța trebuie să fie pozitivă."
                  : undefined
              }
            />
            <NumberInput
              eticheta="Iterații maxime"
              valoare={maxIteratii}
              onChange={setMaxIteratii}
              min={1}
              max={MAX_ITERATII_PERMISE}
              pas={1}
              eroare={
                typeof maxIteratii === "number" && maxIteratii > MAX_ITERATII_PERMISE
                  ? `Cel mult ${MAX_ITERATII_PERMISE} de iterații.`
                  : undefined
              }
            />

            <Button
              variant="outline"
              size="sm"
              className="tinta-atingere w-full sm:col-span-2"
              onClick={() => setRetea(reteaDinCurs())}
            >
              Rețeaua din curs
            </Button>
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

          <StepExplanation
            explicatie={pas?.explicatie}
            pas={derulare.pas}
            totalPasi={rezultat.pasi.length}
            ruleaza={derulare.ruleaza}
          />

          {/* Paralela formulă ↔ desen: partea aprinsă din formulă e chiar ce se
              vede — matricea de sub graf sau ponderile de sub noduri. */}
          {pas?.latexPas && (
            <FormulaBlock
              latex={pas.latexPas}
              eticheta="Pasul acesta, cu numerele în formulă"
              evidentiaza={pas.evidentiaza}
            />
          )}
        </>
      )}

      {/* Erorile se scriu, nu se colorează pe desen — regula din CLAUDE.md. */}
      {rezultat.stare === "esuat" && (
        <Callout tip="atentie" titlu="Metoda s-a oprit">
          {rezultat.motiv}
        </Callout>
      )}
      {laFinal && rezultat.stare === "convergent" && (
        <Callout tip="retine" titlu="Clasamentul paginilor">
          {`${clasamentText(rezultat.clasament)}. Au trebuit ${nrIteratii} ${nrIteratii === 1 ? "iterație" : "iterații"} ` +
            `până când vectorul s-a mișcat mai puțin de ${zecimale(tolFolosit, 8)} de la un pas la altul. ` +
            "Cu d mai mic, saltul la o pagină aleatorie e mai des, ponderile se apropie mai repede de valoarea uniformă și iterația se termină în mai puțini pași."}
        </Callout>
      )}
      {ultimulPas && rezultat.stare === "neterminat" && (
        <Callout tip="atentie" titlu="S-au terminat iterațiile">
          {rezultat.motiv}
        </Callout>
      )}

      {iteratii.length > 0 && (
        <IterationTable
          coloane={[
            ...retea.nume.map((nume, i) => ({
              cheie: `p${i}`,
              titlu: nume,
              descriere: `Ponderea paginii ${nume} la iterația aceea, ca procent din total`,
            })),
            {
              cheie: "eroare",
              titlu: "‖v⁽ᵏ⁾ − v⁽ᵏ⁻¹⁾‖",
              descriere: "Criteriul de oprire. Nu scade la fiecare pas: apropierea oscilează",
            },
          ]}
          randuri={iteratii.map((p) => ({
            ...Object.fromEntries((p.distributie ?? []).map((x, i) => [`p${i}`, procent(x, 2)])),
            eroare: stiintific(p.eroare ?? 0, 2),
          }))}
          // Tabelul are doar iterațiile, iar derularea numără și cei patru pași
          // de construcție dinaintea lor — de aici decalajul dintre indici.
          randCurent={
            pas?.iteratie !== undefined && pas.faza === "iteratie" ? pas.iteratie - 1 : -1
          }
          onAlegeRand={(rand) => derulare.setPas(rand + PASI_DE_CONSTRUCTIE)}
        />
      )}
    </div>
  );
}

/** Câți pași arată construcția matricelor înaintea primei iterații: A, S, M, G. */
const PASI_DE_CONSTRUCTIE = 4;

/**
 * Legenda desenului.
 *
 * Rândul ponderilor nu e decor: algoritmul din curs ține vectorul la norma 2, iar
 * cifrele de sub noduri sunt raportul v/‖v‖₁. Fără propoziția asta, desenul ar
 * afirma tăcut că iterația lucrează cu procente, ceea ce nu e adevărat decât
 * după ultima linie a algoritmului.
 */
const LEGENDA: ElementLegenda[] = [
  {
    rol: "functie",
    eticheta: "paginile și link-urile dintre ele",
    forma: "linie",
    explicatie: "Săgeata pleacă din pagina care pune link-ul și intră în pagina indicată.",
  },
  {
    rol: "interval",
    eticheta: "pagina care se schimbă cel mai mult la pasul acesta, cu săgețile care intră în ea",
    forma: "linie",
    explicatie:
      "O iterație folosește deodată toate link-urile; evidențiată e pagina care câștigă sau pierde cel mai mult.",
  },
  {
    rol: "anterior",
    eticheta: "ponderea scrisă sub fiecare pagină",
    forma: "punct",
    explicatie:
      "E v/‖v‖₁, adică vectorul adus la suma 100 %. Iterația însăși lucrează cu vectorul de lungime 1; împărțirea la sumă e ultima linie a algoritmului.",
  },
  {
    rol: "solutie",
    eticheta: "pagina cu rangul cel mai mare, la final",
    forma: "punct",
    explicatie: "Apare abia după ce iterația s-a oprit, cu inel în jurul nodului.",
  },
];
