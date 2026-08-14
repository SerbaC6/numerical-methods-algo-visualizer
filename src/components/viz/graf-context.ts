import { createContext, useContext } from "react";

import type { Punct } from "@/lib/graf-orientat";

export type ValoareContextGraf = {
  /** Centrele nodurilor, în pixeli SVG, în ordinea din matrice. */
  noduri: Punct[];
  /**
   * Raza desenată a fiecărui nod, în pixeli. E per nod, nu una singură, fiindcă
   * nodurile se umflă după pondere — iar muchia trebuie tăiată la conturul
   * **real** al nodului în care intră, altfel vârful de săgeată intră sub cerc
   * exact la pagina care crește cel mai mult.
   */
  raze: number[];
  latime: number;
  inaltime: number;
};

export const ContextGraf = createContext<ValoareContextGraf | null>(null);

/**
 * Geometria grafului în care se află stratul.
 *
 * Ca la `usePlot` și `useScena3D`: straturile nu primesc pixeli prin
 * proprietăți, ci și-i iau de aici, deci o pagină poate scrie un strat propriu
 * fără să modifice `Graf`.
 */
export function useGraf(): ValoareContextGraf {
  const valoare = useContext(ContextGraf);
  if (!valoare) {
    throw new Error("Straturile de graf (GrafMuchii, GrafNoduri) se folosesc doar în <Graf>.");
  }
  return valoare;
}
