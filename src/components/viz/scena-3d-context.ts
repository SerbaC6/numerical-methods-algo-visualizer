import { createContext, useContext } from "react";

import type { Cadru } from "@/lib/plot-scara";
import type { Camera, Cutie, Ecran, Proiectie, Punct3 } from "@/lib/proiectie-3d";

export type ValoareContextScena3D = {
  /** Lume → pixeli. Singura cale prin care un strat află unde să deseneze. */
  proiectie: Proiectie;
  camera: Camera;
  cutie: Cutie;
  /** Colțurile zonei de desen, în pixeli SVG. */
  zona: Cadru;
  /** Id-ul măștii care taie desenul la marginea zonei. */
  idTaiere: string;
  /**
   * Id-ul măștii care taie desenul la **rama podelei**, nu la marginea zonei.
   *
   * Pentru straturile care trăiesc pe podea (curbele de nivel): o elipsă de
   * nivel e nemărginită față de cutie, deci fără masca asta ar curge peste toată
   * scena, dincolo de rama pe care `Podea3D` tocmai a desenat-o. Patrulaterul
   * măștii e exact cel proiectat — proiecția e liniară, deci colțurile podelei
   * rămân colțuri.
   */
  idTaierePodea: string;
  /**
   * Scena e trasă chiar acum. Straturile care se animează trec pe salt cât timp
   * e adevărat — vezi comentariul din `Traiectorie3D`.
   */
  inMiscare: boolean;
  /** Câte patrulatere pe latură desenează `Suprafata3D`. Scade cât timp se trage. */
  rezolutieMesh: number;
};

export const ContextScena3D = createContext<ValoareContextScena3D | null>(null);

/**
 * Proiecția și zona de desen ale scenei în care se află stratul.
 *
 * Ca la `usePlot`: straturile nu primesc pixeli prin proprietăți, ci și-i
 * calculează singure de aici, deci o pagină poate scrie un strat propriu fără
 * să modifice `Scena3D`.
 */
export function useScena3D(): ValoareContextScena3D {
  const valoare = useContext(ContextScena3D);
  if (!valoare) {
    throw new Error(
      "Straturile de scenă (Suprafata3D, Traiectorie3D…) se folosesc doar în <Scena3D>.",
    );
  }
  return valoare;
}

/** Centrul cutiei, proiectat pe ecran. Punctul față de care se împing etichetele. */
export function centruProiectat(proiectie: Proiectie): Ecran {
  const { x, y, z } = proiectie.cutie;
  return proiectie.laEcran({
    x: (x[0] + x[1]) / 2,
    y: (y[0] + y[1]) / 2,
    z: (z[0] + z[1]) / 2,
  });
}

export type DeplasareEticheta = {
  dx: number;
  dy: number;
  ancora: "start" | "middle" | "end";
};

/**
 * Cât se împinge o etichetă, ca să nu intre peste desen.
 *
 * Direcția e **radială dinspre centrul proiectat al scenei**: eticheta pleacă
 * mereu spre afară, oricare ar fi azimutul. E generalizarea trucului din
 * `PlotPunct`, care răstoarnă eticheta doar lângă marginile cadrului — acolo
 * ajunge, fiindcă graficul nu se rotește. Aici, un „sus-dreapta" fix ar cădea
 * peste suprafață la jumătate din unghiuri.
 *
 * Pentru un punct chiar în centru direcția e nedefinită; se ia „în sus", care e
 * mereu liberă la un height-field privit de deasupra.
 */
export function deplasareRadiala(
  proiectie: Proiectie,
  punct: Punct3 | Ecran,
  distanta: number,
): DeplasareEticheta {
  const p = "adancime" in punct ? punct : proiectie.laEcran(punct);
  const centru = centruProiectat(proiectie);

  const vx = p.x - centru.x;
  const vy = p.y - centru.y;
  const lungime = Math.hypot(vx, vy);

  const ux = lungime < 1e-6 ? 0 : vx / lungime;
  const uy = lungime < 1e-6 ? -1 : vy / lungime;

  return {
    dx: ux * distanta,
    dy: uy * distanta,
    ancora: ux > 0.25 ? "start" : ux < -0.25 ? "end" : "middle",
  };
}
