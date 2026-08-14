import { useCallback, useMemo, useRef, useState } from "react";

import * as givens from "@/algorithms/norme-si-ortogonalitate/givens";
import * as householder from "@/algorithms/norme-si-ortogonalitate/householder";
import { VECTOR_IMPLICIT } from "@/algorithms/norme-si-ortogonalitate/exemple";
import { PlanOrtogonal, type SageataPlan, type Vector2 } from "@/components/content/PlanOrtogonal";
import { Callout } from "@/components/content/Callout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ControlPanel } from "@/components/viz/ControlPanel";
import { FormulaBlock } from "@/components/viz/FormulaBlock";
import { Legend, type ElementLegenda } from "@/components/viz/Legend";
import { MatrixGrid } from "@/components/viz/MatrixGrid";
import { Notatie } from "@/components/viz/Notatie";
import { NumberInput } from "@/components/viz/NumberInput";
import { latexNumar, zecimale } from "@/lib/numere";

const METODE = [
  { id: "householder", titlu: "Householder" },
  { id: "givens", titlu: "Givens" },
] as const;

type IdMetoda = (typeof METODE)[number]["id"];

/*
 * Cadrul desenului. Pătrat, fiindcă un plan turtit ar minți despre unghiuri.
 *
 * `RAZA` e dublul lungimii maxime a vectorului, și nu întâmplător: `d` poate
 * ajunge până la `2‖v‖` (când `v` e chiar pe axă), iar el se desenează **la
 * scara lui adevărată**. Cu un plan mai strâns, săgeata lui ar ieși din desen
 * exact în cazurile în care contează cel mai mult.
 */
const LATURA = 640;
const RAZA_VECTOR = 2.3;
const RAZA = 2 * RAZA_VECTOR;
const SCARA = LATURA / 2 / RAZA;
const CENTRU: Vector2 = [LATURA / 2, LATURA / 2];

/**
 * Interfața interactivă a paginii 2: aceeași țintă, două geometrii.
 *
 * **De ce un singur plan pentru amândouă.** Householder și Givens rezolvă exact
 * aceeași problemă — du vectorul pe axă fără să-i schimbi lungimea — și diferă
 * doar prin **cum**: una îl oglindește, cealaltă îl rotește. Puse în două
 * interfețe, comparația s-ar pierde; puse pe același plan, cu același vector
 * tras cu mouse-ul, ea se vede la fiecare mișcare a degetului.
 *
 * Matematica **nu** stă aici: reflexia, rotația, matricele și numerele vin din
 * `src/algorithms/norme-si-ortogonalitate/`, iar desenul din `PlanOrtogonal` —
 * același `<g>` folosit de cele două clipuri, ca transformarea să arate la fel
 * peste tot.
 */
export function InterfataOrtogonalitate() {
  const [idMetoda, setIdMetoda] = useState<IdMetoda>("householder");
  const [v, setV] = useState<Vector2>(VECTOR_IMPLICIT);
  const [trage, setTrage] = useState(false);
  const svg = useRef<SVGSVGElement>(null);

  const reflexie = useMemo(() => householder.reflectaInPlan(v), [v]);
  const rotatie = useMemo(() => givens.rotesteInPlan(v), [v]);
  const esteHh = idMetoda === "householder";

  /** Din coordonatele evenimentului în unități matematice, rotunjite la 0,1. */
  const dinEveniment = useCallback((e: React.PointerEvent<SVGSVGElement>): Vector2 => {
    const el = svg.current;
    if (!el) return [0, 0];
    const cutie = el.getBoundingClientRect();
    const x = ((e.clientX - cutie.left) / cutie.width) * LATURA;
    const y = ((e.clientY - cutie.top) / cutie.height) * LATURA;
    const rotunjeste = (u: number) => Math.round(u * 10) / 10;
    const brut: Vector2 = [
      rotunjeste((x - CENTRU[0]) / SCARA),
      rotunjeste((CENTRU[1] - y) / SCARA),
    ];
    // Se limitează **lungimea**, nu componentele: altfel colțurile pătratului ar
    // permite un vector mai lung decât marginile lui, iar `d` ar ieși din desen.
    const lungime = Math.hypot(brut[0], brut[1]);
    if (lungime <= RAZA_VECTOR) return brut;
    const k = RAZA_VECTOR / lungime;
    return [rotunjeste(brut[0] * k), rotunjeste(brut[1] * k)];
  }, []);

  const muta = (e: React.PointerEvent<SVGSVGElement>) => {
    const nou = dinEveniment(e);
    // Vectorul nul n-are direcție, deci nici oglindă și nici unghi: se refuză.
    if (Math.hypot(nou[0], nou[1]) < 0.15) return;
    setV(nou);
  };

  const sageti: SageataPlan[] = esteHh
    ? [
        { la: v, rol: "curent", eticheta: "v" },
        { la: reflexie.d, rol: "functie", eticheta: "d" },
        { la: reflexie.imagine, rol: "solutie", eticheta: "P·v" },
      ]
    : [
        { la: v, rol: "curent", eticheta: "v" },
        { la: rotatie.imagine, rol: "solutie", eticheta: "G·v" },
      ];

  const matrice = esteHh ? reflexie.P : rotatie.G;

  return (
    <div className="flex flex-col gap-10">
      <Legend elemente={esteHh ? LEGENDA_HH : LEGENDA_GV} />

      <Tabs value={idMetoda} onValueChange={(x) => setIdMetoda(x as IdMetoda)}>
        <TabsList className="w-full">
          {METODE.map((m) => (
            <TabsTrigger key={m.id} value={m.id} className="flex-1">
              {m.titlu}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="bg-suprafata border-bordura shadow-jos overflow-hidden rounded-xl border">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_clamp(300px,28%,400px)]">
          <div className="flex min-w-0 flex-col items-center gap-8 p-6 sm:p-8">
            {/* `touch-none`: fără el, degetul ar derula pagina în loc să tragă
                vectorul, iar pe telefon interfața n-ar fi de nicio folosință. */}
            <svg
              ref={svg}
              viewBox={`0 0 ${LATURA} ${LATURA}`}
              className="border-bordura bg-fundal w-full max-w-[560px] touch-none rounded-xl border"
              role="img"
              aria-label={descriere(idMetoda, v, reflexie, rotatie)}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setTrage(true);
                muta(e);
              }}
              onPointerMove={(e) => trage && muta(e)}
              onPointerUp={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId);
                setTrage(false);
              }}
              onPointerCancel={() => setTrage(false)}
            >
              <PlanOrtogonal
                centru={CENTRU}
                scara={SCARA}
                raza={4}
                sageti={sageti}
                oglinda={esteHh ? { directie: reflexie.oglinda } : undefined}
                arc={
                  esteHh
                    ? undefined
                    : {
                        dela: v,
                        la: [1, 0],
                        eticheta: `${zecimale(unghiGrade(rotatie.unghi), 0)}°`,
                      }
                }
                cerc={{ raza: reflexie.norma }}
                st={1.15}
              />
              {/* Mânerul: singurul lucru de pe desen care se atinge. */}
              <circle
                cx={CENTRU[0] + v[0] * SCARA}
                cy={CENTRU[1] - v[1] * SCARA}
                r={trage ? 17 : 13}
                fill="var(--viz-curent)"
                stroke="var(--fundal)"
                strokeWidth={4}
              />
            </svg>

            <p className="text-text-slab text-center text-base">
              Vectorul se trage cu degetul sau cu mouse-ul.
            </p>
          </div>

          <ControlPanel
            onReset={() => setV(VECTOR_IMPLICIT)}
            incorporat
            className="border-bordura min-w-0 border-t lg:border-t-0 lg:border-l"
          >
            <div className="grid grid-cols-2 gap-3 sm:col-span-2">
              <NumberInput
                eticheta="v₁"
                valoare={v[0]}
                onChange={(x) => typeof x === "number" && setV([x, v[1]])}
                pas={0.1}
              />
              <NumberInput
                eticheta="v₂"
                valoare={v[1]}
                onChange={(x) => typeof x === "number" && setV([v[0], x])}
                pas={0.1}
              />
            </div>

            <div className="sm:col-span-2">
              <MatrixGrid
                valori={matrice}
                titlu={esteHh ? "P" : "G"}
                corp="mare"
                formateaza={(x) => zecimale(x, 3)}
                descriere={`Matricea transformării, ${esteHh ? "reflexia" : "rotația"} pentru vectorul curent.`}
              />
            </div>

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 sm:col-span-2">
              {perechi(idMetoda, reflexie, rotatie).map(([cheie, valoare]) => (
                <div key={cheie} className="contents">
                  <dt className="text-text-slab font-mono text-base">
                    <Notatie>{cheie}</Notatie>
                  </dt>
                  <dd className="text-text font-mono text-base tabular-nums">{valoare}</dd>
                </div>
              ))}
            </dl>
          </ControlPanel>
        </div>
      </div>

      <FormulaBlock
        latex={
          esteHh
            ? `d = v + \\operatorname{sign}(v_1)\\lVert v\\rVert e_1 = \\htmlId{ort-d}{\\begin{pmatrix}${latexNumar(reflexie.d[0], 3)} \\\\ ${latexNumar(reflexie.d[1], 3)}\\end{pmatrix}}, \\qquad P\\,v = \\htmlId{ort-imagine}{\\begin{pmatrix}${latexNumar(reflexie.imagine[0], 3)} \\\\ 0\\end{pmatrix}}`
            : `\\cos\\theta = \\frac{x}{r} = \\htmlId{ort-c}{${latexNumar(rotatie.c, 3)}}, \\qquad \\sin\\theta = -\\frac{y}{r} = \\htmlId{ort-s}{${latexNumar(rotatie.s, 3)}}, \\qquad G\\,v = \\htmlId{ort-imagine}{\\begin{pmatrix}${latexNumar(rotatie.r, 3)} \\\\ 0\\end{pmatrix}}`
        }
        eticheta="Transformarea pentru vectorul de acum"
        evidentiaza={esteHh ? ["ort-d", "ort-imagine"] : ["ort-c", "ort-s", "ort-imagine"]}
        className="text-[1.15rem] sm:text-[1.3rem]"
      />

      <Callout tip="retine" titlu={esteHh ? "Ce se vede trăgând" : "Ce se vede trăgând"}>
        <Notatie>
          {esteHh
            ? "Oricât ai muta vectorul, imaginea lui rămâne pe axă, la aceeași distanță de origine ca el — asta înseamnă că transformarea păstrează norma. Când v traversează axa verticală, semnul lui v₁ se schimbă și oglinda sare dintr-o parte în alta: e chiar alegerea de semn care ține d departe de zero."
            : "Oricât ai muta vectorul, imaginea lui cade pe semiaxa pozitivă, la r = ‖v‖. Cosinusul și sinusul se citesc direct din componente, fără să treacă vreodată printr-un unghi — cel afișat e doar pentru ochi."}
        </Notatie>
      </Callout>
    </div>
  );
}

/** Perechile de cifre din panou, altele la fiecare metodă. */
function perechi(
  idMetoda: IdMetoda,
  reflexie: ReturnType<typeof householder.reflectaInPlan>,
  rotatie: ReturnType<typeof givens.rotesteInPlan>,
): [string, string][] {
  if (idMetoda === "householder") {
    return [
      ["‖v‖", zecimale(reflexie.norma, 4)],
      ["d", `(${zecimale(reflexie.d[0], 3)}; ${zecimale(reflexie.d[1], 3)})`],
      ["P·v", `(${zecimale(reflexie.imagine[0], 3)}; 0)`],
      ["det(P)", "−1"],
    ];
  }
  return [
    ["r = ‖v‖", zecimale(rotatie.r, 4)],
    ["cos θ", zecimale(rotatie.c, 4)],
    ["sin θ", zecimale(rotatie.s, 4)],
    ["G·v", `(${zecimale(rotatie.r, 3)}; 0)`],
  ];
}

const unghiGrade = (radiani: number) => (radiani * 180) / Math.PI;

const LEGENDA_HH: ElementLegenda[] = [
  { rol: "curent", eticheta: "vectorul, tras cu mouse-ul", forma: "punct" },
  {
    rol: "functie",
    eticheta: "d — normala oglinzii",
    forma: "linie",
    explicatie: "Nu e oglinda: e direcția perpendiculară pe ea.",
  },
  { rol: "interval", eticheta: "dreapta de oglindire", forma: "linie-punctata" },
  { rol: "solutie", eticheta: "imaginea, căzută pe axă", forma: "linie" },
  {
    rol: "grila",
    eticheta: "cercul de rază ‖v‖",
    forma: "linie-punctata",
    explicatie: "Unde poate ajunge vectorul fără să-și schimbe lungimea.",
  },
];

const LEGENDA_GV: ElementLegenda[] = [
  { rol: "curent", eticheta: "vectorul, tras cu mouse-ul", forma: "punct" },
  { rol: "interval", eticheta: "unghiul rotației", forma: "linie" },
  { rol: "solutie", eticheta: "imaginea, căzută pe axă", forma: "linie" },
  {
    rol: "grila",
    eticheta: "cercul de rază ‖v‖",
    forma: "linie-punctata",
    explicatie: "Rotația nu-l părăsește niciodată.",
  },
];

/** Ce se vede pe plan, în cuvinte — pentru cine nu-l vede. */
function descriere(
  idMetoda: IdMetoda,
  v: Vector2,
  reflexie: ReturnType<typeof householder.reflectaInPlan>,
  rotatie: ReturnType<typeof givens.rotesteInPlan>,
): string {
  const vector = `Vectorul v = (${zecimale(v[0], 2)}; ${zecimale(v[1], 2)}), de lungime ${zecimale(reflexie.norma, 3)}.`;
  if (idMetoda === "householder") {
    return (
      `${vector} Oglinda are normala d = (${zecimale(reflexie.d[0], 2)}; ${zecimale(reflexie.d[1], 2)}), ` +
      `iar reflexia cade pe axă, în (${zecimale(reflexie.imagine[0], 3)}; 0).`
    );
  }
  return (
    `${vector} Rotația are cos θ = ${zecimale(rotatie.c, 3)} și sin θ = ${zecimale(rotatie.s, 3)}, ` +
    `iar imaginea cade pe axă, în (${zecimale(rotatie.r, 3)}; 0).`
  );
}
