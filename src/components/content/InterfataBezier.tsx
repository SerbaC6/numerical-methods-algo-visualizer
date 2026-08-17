import { useCallback, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  casteljau,
  esantioneazaCurba,
  punctPeCurba,
  type Punct,
} from "@/algorithms/curbe-bezier/bezier";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ControlPanel } from "@/components/viz/ControlPanel";
import { Legend, type ElementLegenda } from "@/components/viz/Legend";
import { Notatie } from "@/components/viz/Notatie";
import { zecimale } from "@/lib/numere";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";

/* ───────────────────────── cadrul ───────────────────────── */

const LATURA = 640;
const MARGINE = 46;

/**
 * Câte puncte de control se pot alege.
 *
 * Plafonul de 5 **nu** e o limită a matematicii — de Casteljau merge la orice
 * grad — ci a paletei: construcția se citește doar dacă fiecare nivel are altă
 * culoare, iar paleta are exact trei roluri de vizualizare care nu sunt albastru
 * pe albastru și nu sunt deja luate de curbă și de punctul final. Cu 5 puncte
 * ies patru niveluri, ultimul fiind chiar punctul de pe curbă: exact trei de
 * colorat.
 */
const PUNCTE_MIN = 3;
const PUNCTE_MAX = 5;

/**
 * Culoarea fiecărui nivel al construcției. Indicele 0 e poligonul de control.
 *
 * Ordinea nu e întâmplătoare, dar nici cea de la început. Nivelurile **vecine**
 * trebuie să se despartă cel mai bine, fiindcă ele se ating pe desen: de aceea
 * se alternează cald și rece — portocaliu, safir, coral. Înainte, poligonul de
 * control era albastru estompat și primul nivel safir, adică două albastruri
 * lipite unul de altul, iar linia trasă cu mouse-ul nu se mai deosebea de prima
 * linie calculată.
 */
const CULORI_NIVEL: RolViz[] = ["anterior", "interval", "curent", "pivot"];

/** Poligoanele de pornire, câte unul pentru fiecare număr de puncte. */
const PORNIRE: Record<number, Punct[]> = {
  3: [
    { x: -4, y: -3.2 },
    { x: 0, y: 3.2 },
    { x: 4, y: -3.2 },
  ],
  4: [
    { x: -4.2, y: -3.2 },
    { x: -2.4, y: 2.8 },
    { x: 2.4, y: 2.8 },
    { x: 4.2, y: -3.2 },
  ],
  5: [
    { x: -4.4, y: -2.6 },
    { x: -3, y: 3.2 },
    { x: 0, y: -3.4 },
    { x: 3, y: 3.2 },
    { x: 4.4, y: -2.6 },
  ],
};

/** Câte unități matematice se văd de o parte și de alta a originii. */
const RAZA = 5;
const scara = (LATURA / 2 - MARGINE) / RAZA;
const catreEcran = (p: Punct) => ({
  x: LATURA / 2 + p.x * scara,
  y: LATURA / 2 - p.y * scara,
});

/**
 * Interfața interactivă a paginii 13.
 *
 * **Construcția, nu rezultatul.** Cursorul lui `t` alege unde se calculează, iar
 * cursorul de nivel alege **cât** din construcție se vede: la nivelul 1 doar
 * primul rând de segmente, la ultimul tot triunghiul plus punctul de pe curbă.
 * Abia după ce se ajunge la capăt apare și curba întreagă — până atunci, ce se
 * vede pe ecran e exact ce a calculat algoritmul, nici un pas mai mult.
 *
 * Matematica nu stă aici: recurența și eșantionarea vin din
 * `src/algorithms/curbe-bezier/bezier.ts`.
 */
export function InterfataBezier() {
  const [cate, setCate] = useState(4);
  const [puncte, setPuncte] = useState<Punct[]>(() => PORNIRE[4]!.map((p) => ({ ...p })));
  const [t, setT] = useState(0.4);
  const [nivel, setNivel] = useState(1);
  const [tras, setTras] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  const niveluri = useMemo(() => casteljau(puncte, t), [puncte, t]);
  const ultimulNivel = niveluri.length - 1;
  const nivelVazut = Math.min(nivel, ultimulNivel);
  const gata = nivelVazut >= ultimulNivel;
  const punctCurba = punctPeCurba(puncte, t);

  /** Curba se trasează abia după ce construcția a ajuns la capăt. */
  const curba = useMemo(() => (gata ? esantioneazaCurba(puncte, 160) : []), [gata, puncte]);

  const schimbaNumarul = (n: number) => {
    setCate(n);
    setPuncte(PORNIRE[n]!.map((p) => ({ ...p })));
    setNivel(1);
  };

  const dinEveniment = useCallback((e: React.PointerEvent<SVGSVGElement>): Punct => {
    const el = svg.current;
    if (!el) return { x: 0, y: 0 };
    const cutie = el.getBoundingClientRect();
    const x = ((e.clientX - cutie.left) / cutie.width) * LATURA;
    const y = ((e.clientY - cutie.top) / cutie.height) * LATURA;
    const rotunjeste = (u: number) => Math.round(u * 10) / 10;
    const limita = (u: number) => Math.min(Math.max(u, -RAZA), RAZA);
    return {
      x: limita(rotunjeste((x - LATURA / 2) / scara)),
      y: limita(rotunjeste((LATURA / 2 - y) / scara)),
    };
  }, []);

  const mutaPunctul = (e: React.PointerEvent<SVGSVGElement>) => {
    if (tras === null) return;
    const nou = dinEveniment(e);
    setPuncte((v) => v.map((p, i) => (i === tras ? nou : p)));
  };

  return (
    <div className="flex flex-col gap-10">
      <Legend elemente={legenda(ultimulNivel)} />

      <div className="bg-suprafata border-bordura shadow-jos overflow-hidden rounded-xl border">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_clamp(300px,28%,400px)]">
          <div className="flex min-w-0 flex-col items-center gap-8 p-6 sm:p-8">
            {/* `touch-none`: fără el, degetul ar derula pagina în loc să tragă
                punctul de control. */}
            <svg
              ref={svg}
              viewBox={`0 0 ${LATURA} ${LATURA}`}
              className="border-bordura bg-fundal w-full max-w-[560px] touch-none rounded-xl border select-none"
              role="img"
              aria-label={descrie(puncte, t, nivelVazut, ultimulNivel, punctCurba)}
              onPointerMove={mutaPunctul}
              onPointerUp={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId);
                setTras(null);
              }}
              onPointerCancel={() => setTras(null)}
            >
              {/* Grila. Discretă, ca la restul desenelor: punctele se citesc pe
                  ea fără s-o vadă. */}
              <g stroke={culoareRol("grila")} strokeWidth={2} opacity={0.4}>
                {Array.from({ length: 2 * RAZA + 1 }, (_, i) => i - RAZA).map((u) => (
                  <g key={u}>
                    <line
                      x1={catreEcran({ x: u, y: -RAZA }).x}
                      y1={catreEcran({ x: u, y: -RAZA }).y}
                      x2={catreEcran({ x: u, y: RAZA }).x}
                      y2={catreEcran({ x: u, y: RAZA }).y}
                    />
                    <line
                      x1={catreEcran({ x: -RAZA, y: u }).x}
                      y1={catreEcran({ x: -RAZA, y: u }).y}
                      x2={catreEcran({ x: RAZA, y: u }).x}
                      y2={catreEcran({ x: RAZA, y: u }).y}
                    />
                  </g>
                ))}
              </g>

              {/* Curba, desenată prima: e fundalul pe care stă construcția. */}
              {curba.length > 0 && (
                <polyline
                  points={curba.map((p) => `${catreEcran(p).x},${catreEcran(p).y}`).join(" ")}
                  fill="none"
                  stroke={culoareRol("functie")}
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Nivelurile construcției, de la poligonul de control în sus. */}
              {niveluri.slice(0, nivelVazut + 1).map((rand, j) => {
                const rol = CULORI_NIVEL[Math.min(j, CULORI_NIVEL.length - 1)]!;
                const ultimul = j === ultimulNivel;
                return (
                  <g key={j}>
                    {rand.length > 1 && (
                      <polyline
                        points={rand.map((p) => `${catreEcran(p).x},${catreEcran(p).y}`).join(" ")}
                        fill="none"
                        stroke={culoareRol(rol)}
                        // Subțiere pe nivel: portocaliul intervalului și coralul
                        // pivotului sunt amândouă calde și, la un segment scurt,
                        // greu de deosebit doar după nuanță. Grosimea le mai dă
                        // o cale de separat — aceeași idee ca la marcajul
                        // soluției din CLAUDE.md, care se distinge prin formă.
                        strokeWidth={j === 0 ? 3 : Math.max(2.5, 5 - j * 0.7)}
                        strokeDasharray={j === 0 ? "10 8" : undefined}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={j === 0 ? 0.9 : 1}
                      />
                    )}
                    {rand.map((p, i) => {
                      const e = catreEcran(p);
                      return (
                        <circle
                          key={i}
                          cx={e.x}
                          cy={e.y}
                          r={ultimul ? 11 : j === 0 ? 10 : Math.max(4.5, 8 - j)}
                          fill={ultimul ? culoareRol("solutie") : culoareRol(rol)}
                          stroke="var(--fundal)"
                          strokeWidth={j === 0 || ultimul ? 3 : 2}
                          // Doar punctele de control se trag; restul sunt calculate.
                          className={j === 0 ? "cursor-grab" : undefined}
                          onPointerDown={
                            j === 0
                              ? (ev) => {
                                  ev.currentTarget.ownerSVGElement?.setPointerCapture(ev.pointerId);
                                  setTras(i);
                                }
                              : undefined
                          }
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* Numele punctelor de control. Se așază **în afara** poligonului,
                  pe direcția dinspre centrul lui — altfel „P₀" cădea peste curbă
                  exact în capătul prin care ea trece. */}
              {niveluri[0]?.map((p, i) => {
                const e = catreEcran(p);
                const centru = catreEcran(centrul(puncte));
                const dx = e.x - centru.x;
                const dy = e.y - centru.y;
                const lung = Math.hypot(dx, dy) || 1;
                return (
                  <text
                    key={i}
                    x={e.x + (dx / lung) * 30}
                    y={e.y + (dy / lung) * 30 + 7}
                    textAnchor="middle"
                    fill={culoareEticheta("anterior")}
                    style={{ font: "700 21px var(--font-mono)" }}
                  >
                    P{["₀", "₁", "₂", "₃", "₄"][i] ?? ""}
                  </text>
                );
              })}
            </svg>

            {/* Nivelurile se iau la rând, cu săgețile: sunt trei sau patru, iar
                un cursor pe patru trepte cere ochit exact acolo unde o apăsare
                face același lucru. */}
            <div className="flex w-full max-w-[560px] items-center justify-between gap-3">
              <Button
                variant="outline"
                size="icon"
                className="tinta-atingere shrink-0"
                aria-label="Un nivel înapoi"
                disabled={nivelVazut <= 0}
                onClick={() => setNivel(Math.max(0, nivelVazut - 1))}
              >
                <ChevronLeft className="size-5" />
              </Button>

              <div className="flex min-w-0 flex-col items-center text-center">
                <span className="text-text-slab text-base">
                  Construcția, nivel {nivelVazut} din {ultimulNivel}
                </span>
                <span className="text-text font-mono text-lg tabular-nums">
                  {nivelVazut === ultimulNivel
                    ? "Punctul de pe curbă"
                    : `${niveluri[nivelVazut]?.length ?? 0} puncte`}
                </span>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="tinta-atingere shrink-0"
                aria-label="Un nivel înainte"
                disabled={nivelVazut >= ultimulNivel}
                onClick={() => setNivel(Math.min(ultimulNivel, nivelVazut + 1))}
              >
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>

          <ControlPanel
            onReset={() => {
              setPuncte(PORNIRE[cate]!.map((p) => ({ ...p })));
              setT(0.4);
              setNivel(1);
            }}
            incorporat
            className="border-bordura min-w-0 border-t lg:border-t-0 lg:border-l"
          >
            <div className="grid gap-2 sm:col-span-2">
              <span className="text-base font-medium">Puncte de control</span>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: PUNCTE_MAX - PUNCTE_MIN + 1 }, (_, k) => PUNCTE_MIN + k).map(
                  (n) => (
                    <Button
                      key={n}
                      size="sm"
                      variant={n === cate ? "default" : "outline"}
                      className="tinta-atingere font-mono"
                      aria-pressed={n === cate}
                      onClick={() => schimbaNumarul(n)}
                    >
                      {n}
                    </Button>
                  ),
                )}
              </div>
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-base font-medium">
                  <Notatie>t</Notatie>
                </span>
                <span className="text-text font-mono text-lg tabular-nums">{zecimale(t, 2)}</span>
              </div>
              <Slider
                aria-label="Parametrul t, între 0 și 1"
                min={0}
                max={1}
                step={0.01}
                value={[t]}
                onValueChange={([v]) => setT(v ?? 0)}
              />
            </div>

            <dl className="grid gap-2 sm:col-span-2">
              {[
                ["grad", String(puncte.length - 1)],
                ["B(t)", `(${zecimale(punctCurba.x, 2)}; ${zecimale(punctCurba.y, 2)})`],
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

/** Centrul poligonului de control — doar ca să știm încotro să scoatem numele. */
function centrul(puncte: readonly Punct[]): Punct {
  const n = puncte.length || 1;
  return {
    x: puncte.reduce((s, p) => s + p.x, 0) / n,
    y: puncte.reduce((s, p) => s + p.y, 0) / n,
  };
}

/**
 * Legenda se scrie după numărul de niveluri: cu 3 puncte există un singur nivel
 * intermediar, iar o legendă care ar promite trei ar minți despre desen.
 */
function legenda(niveluri: number): ElementLegenda[] {
  const nivele: ElementLegenda[] = [];
  for (let j = 1; j < niveluri; j++) {
    nivele.push({
      rol: CULORI_NIVEL[Math.min(j, CULORI_NIVEL.length - 1)]!,
      eticheta: `nivelul ${j} — P⁽${["", "¹", "²", "³", "⁴"][j] ?? ""}⁾`,
      forma: "linie",
    });
  }
  return [
    {
      rol: "anterior",
      eticheta: "poligonul de control, tras cu mouse-ul",
      forma: "linie-punctata",
      explicatie: "Singurele puncte care se mută. Restul sunt calculate.",
    },
    ...nivele,
    {
      rol: "solutie",
      eticheta: "punctul de pe curbă, B(t)",
      forma: "punct",
      explicatie: "Ce rămâne după ce s-au epuizat nivelurile.",
    },
    { rol: "functie", eticheta: "curba, odată ce construcția e terminată", forma: "linie" },
  ];
}

/** Ce se vede pe desen, în cuvinte — pentru cine nu-l vede. */
function descrie(
  puncte: readonly Punct[],
  t: number,
  nivel: number,
  ultimul: number,
  punctCurba: Punct,
): string {
  const lista = puncte
    .map((p, i) => `P${i} = (${zecimale(p.x, 1)}; ${zecimale(p.y, 1)})`)
    .join(", ");
  const stadiu =
    nivel >= ultimul
      ? `Construcția e completă: punctul de pe curbă e (${zecimale(punctCurba.x, 2)}; ${zecimale(punctCurba.y, 2)}), iar curba e trasată întreagă.`
      : `Se văd primele ${nivel} niveluri din ${ultimul} ale construcției.`;
  return `Poligon de control cu ${puncte.length} puncte: ${lista}. Parametrul t = ${zecimale(t, 2)}. ${stadiu}`;
}
