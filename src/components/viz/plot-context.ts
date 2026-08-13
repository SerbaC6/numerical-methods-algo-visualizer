import { createContext, useContext } from "react";

import type { Reper, Scara } from "@/lib/plot-scara";

export type ValoareContext = {
  x: Scara;
  y: Scara;
  /** Colțurile zonei de desen, în pixeli SVG. */
  zona: { stanga: number; dreapta: number; sus: number; jos: number };
  /** Lățimea întregului SVG — de care are nevoie axa ca să nu scoată etichetele din cadru. */
  latimeTotala: number;
  /**
   * Reperele axei verticale, calculate o dată în `Plot`.
   *
   * Stau în context fiindcă din ele iese marginea din stânga: dacă axa le-ar
   * recalcula, marginea rezervată și etichetele desenate ar putea ajunge să nu
   * mai fie aceleași.
   */
  reperiY: Reper[];
  /** Id-ul măștii care taie desenul la marginea zonei. */
  idTaiere: string;
};

export const ContextPlot = createContext<ValoareContext | null>(null);

/**
 * Scara și zona de desen ale graficului în care se află stratul.
 *
 * Straturile nu primesc coordonate în pixeli prin proprietăți: și le calculează
 * singure de aici. Așa se pot scrie straturi noi, pe o pagină, fără să modifici
 * `Plot` — cerința regulii 10 din `docs/referinte.md`.
 */
export function usePlot(): ValoareContext {
  const valoare = useContext(ContextPlot);
  if (!valoare) {
    throw new Error("Straturile de grafic (PlotCurba, PlotPunct…) se folosesc doar în <Plot>.");
  }
  return valoare;
}
