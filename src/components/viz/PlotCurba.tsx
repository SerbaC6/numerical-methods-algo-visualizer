import { usePlot } from "@/components/viz/plot-context";
import type { Punct } from "@/lib/plot-esantionare";
import { culoareRol, type RolViz } from "@/lib/viz-roles";

export type PlotCurbaProps = {
  /**
   * Bucățile continue de curbă, așa cum le dă `sparge()` din
   * `plot-esantionare.ts`. Fiecare bucată se desenează separat, ca ramurile
   * despărțite de o asimptotă să nu fie unite printr-o linie care nu există.
   */
  segmente: readonly (readonly Punct[])[];
  rol?: RolViz;
  grosime?: number;
  /** Curbă punctată — pentru o funcție de comparație, nu cea principală. */
  punctata?: boolean;
  opacitate?: number;
  /**
   * Conturul în culoarea suprafeței, desenat sub linie.
   *
   * Fără el, curba trecută peste o arie hașurată sau peste banda unui interval
   * se pierde în ele — sunt toate nuanțe de albastru. Haloul o desprinde de
   * fundal fără să ceară o culoare nouă.
   */
  halou?: boolean;
};

/**
 * De câte ori înălțimea zonei se acceptă în afara cadrului înainte de a limita
 * coordonata.
 *
 * `1/x` lângă zero produce valori de ordinul `1e15`, care în pixeli devin
 * coordonate absurde: browserele fie desenează prost, fie încetinesc. Limitarea
 * se face destul de departe de cadru încât panta cu care curba intră și iese
 * din zona vizibilă să rămână neschimbată — iar ce e dincolo e oricum tăiat de
 * masca graficului.
 */
const LIMITA_IESIRE = 4;

/** Traseul SVG al unei bucăți de curbă, cu coordonatele ținute în limite. */
function traseu(
  segment: readonly Punct[],
  laX: (v: number) => number,
  laY: (v: number) => number,
  minY: number,
  maxY: number,
): string {
  const bucati: string[] = [];
  for (const [i, punct] of segment.entries()) {
    const px = laX(punct.x);
    const py = Math.max(minY, Math.min(maxY, laY(punct.y)));
    // Două zecimale sunt sub un sfert de pixel pe orice ecran, dar scurtează
    // mult atributul `d` — o curbă are sute de puncte, redesenate la fiecare pas.
    bucati.push(`${i === 0 ? "M" : "L"}${px.toFixed(2)},${py.toFixed(2)}`);
  }
  return bucati.join("");
}

/**
 * Curba unei funcții, desenată din bucățile ei continue.
 *
 * Nu calculează nimic: primește punctele gata eșantionate de
 * `plot-esantionare.ts`, unde eșantionarea și ruperea la discontinuități pot fi
 * verificate numeric, în afara interfeței.
 */
export function PlotCurba({
  segmente,
  rol = "functie",
  grosime = 2.5,
  punctata = false,
  opacitate = 1,
  halou = true,
}: PlotCurbaProps) {
  const { x, y, zona, idTaiere } = usePlot();

  const inaltimeZona = zona.jos - zona.sus;
  const minY = zona.sus - LIMITA_IESIRE * inaltimeZona;
  const maxY = zona.jos + LIMITA_IESIRE * inaltimeZona;

  return (
    <g clipPath={`url(#${idTaiere})`} aria-hidden="true">
      {segmente.map((segment, i) => {
        if (segment.length < 2) return null;
        const d = traseu(segment, x.la, y.la, minY, maxY);
        return (
          <g key={i}>
            {halou && (
              <path
                d={d}
                fill="none"
                stroke="var(--suprafata)"
                strokeWidth={grosime + 4}
                strokeOpacity={0.75 * opacitate}
                strokeLinecap="round"
                strokeLinejoin="round"
                // Curba punctată își păstrează golurile și în halou, altfel
                // haloul ar umple linia la loc și ar șterge punctarea.
                strokeDasharray={punctata ? "5 4" : undefined}
              />
            )}
            <path
              d={d}
              fill="none"
              stroke={culoareRol(rol)}
              strokeWidth={grosime}
              strokeOpacity={opacitate}
              // Capete și îmbinări rotunde: fără ele, o curbă cu pantă mare arată
              // zimțată exact acolo unde e mai interesantă.
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={punctata ? "5 4" : undefined}
            />
          </g>
        );
      })}
    </g>
  );
}
