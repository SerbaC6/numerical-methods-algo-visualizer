import { usePlot } from "@/components/viz/plot-context";
import { culoareRol, type RolViz } from "@/lib/viz-roles";

export type PlotVerticalaProps = {
  x: number;
  /** Capătul de sus al segmentului, în coordonate matematice. */
  y: number;
  /** Capătul de jos. Implicit axa, adică `y = 0`. */
  baza?: number;
  rol?: RolViz;
  grosime?: number;
  punctata?: boolean;
  opacitate?: number;
};

/**
 * Segmentul vertical dintre linia de bază și un punct.
 *
 * E linia care desparte două bucăți alăturate ale unei figuri: la o cuadratură,
 * marginea dintre două panouri vecine. Fără ea, `N` trapeze lipite unul de
 * altul se citesc ca o singură pată — se vede că sub curbă e ceva colorat, dar
 * nu se mai vede **în câte bucăți** a fost tăiat intervalul, adică exact
 * parametrul cu care se joacă pagina.
 *
 * Nu se mișcă între stări, spre deosebire de `PlotPunct` sau `PlotDreapta`:
 * marginile nu călătoresc de la o valoare a lui `N` la alta, ci sunt de fiecare
 * dată alte margini, în alt număr. O tranziție ar sugera că marginea a treia
 * „a devenit" marginea a cincea.
 */
export function PlotVerticala({
  x,
  y,
  baza = 0,
  rol = "grila",
  grosime = 1.5,
  punctata = false,
  opacitate = 1,
}: PlotVerticalaProps) {
  const plot = usePlot();

  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (x < plot.x.domeniu[0] || x > plot.x.domeniu[1]) return null;

  const px = plot.x.la(x);

  return (
    <line
      clipPath={`url(#${plot.idTaiere})`}
      aria-hidden="true"
      x1={px}
      x2={px}
      y1={plot.y.la(baza)}
      y2={plot.y.la(y)}
      stroke={culoareRol(rol)}
      strokeWidth={grosime}
      strokeOpacity={opacitate}
      strokeDasharray={punctata ? "4 4" : undefined}
      strokeLinecap="round"
    />
  );
}
