import { useId } from "react";

import { usePlot } from "@/components/viz/plot-context";
import type { Punct } from "@/lib/plot-esantionare";
import { culoareRol, type RolViz } from "@/lib/viz-roles";

export type PlotArieProps = {
  /**
   * Conturul de sus al ariei, de la stânga la dreapta. Pentru un trapez sunt
   * două puncte; pentru Simpson, arcul de parabolă eșantionat; pentru aria de
   * sub curbă, chiar punctele curbei.
   */
  puncte: readonly Punct[];
  /** Linia de bază la care se închide aria. Implicit axa, adică `y = 0`. */
  baza?: number;
  rol?: RolViz;
  opacitate?: number;
  /** Conturul ariei — util ca să se vadă unde se lipesc două trapeze vecine. */
  contur?: boolean;
  /**
   * Hașura diagonală peste umplere.
   *
   * Paleta e monocromă pe albastru, deci aria și curba de deasupra ei ar fi
   * două nuanțe apropiate ale aceleiași culori. Hașura le desparte prin
   * **textură**, nu prin culoare nouă: aria se citește ca suprafață, curba
   * rămâne o linie continuă peste ea. Merge și pentru daltonism, unde diferența
   * de nuanță singură n-ar ajunge.
   */
  hasura?: boolean;
};

/**
 * Aria dintre un contur și o linie de bază.
 *
 * De aici se vede ce înseamnă integrarea numerică: figura desenată **este**
 * aproximarea integralei. Un trapez are două puncte în contur, o parabolă
 * Simpson are un arc eșantionat, iar aria exactă de sub curbă are toate
 * punctele curbei — aceeași componentă, alt contur.
 */
export function PlotArie({
  puncte,
  baza = 0,
  rol = "interval",
  opacitate = 1,
  contur = true,
  hasura = true,
}: PlotArieProps) {
  const plot = usePlot();
  const culoare = culoareRol(rol);
  const idHasura = `${useId()}-hasura`;

  const valide = puncte.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  const primul = valide[0];
  const ultimul = valide[valide.length - 1];
  if (!primul || !ultimul || valide.length < 2) return null;

  const yBaza = plot.y.la(baza);
  const sus = valide
    .map(
      (p, i) => `${i === 0 ? "M" : "L"}${plot.x.la(p.x).toFixed(2)},${plot.y.la(p.y).toFixed(2)}`,
    )
    .join("");

  // Închiderea: coboară la bază în dreapta, revine în stânga, se închide.
  const d = `${sus}L${plot.x.la(ultimul.x).toFixed(2)},${yBaza.toFixed(2)}L${plot.x
    .la(primul.x)
    .toFixed(2)},${yBaza.toFixed(2)}Z`;

  return (
    <g clipPath={`url(#${plot.idTaiere})`} aria-hidden="true">
      {hasura && (
        <defs>
          <pattern
            id={idHasura}
            width={8}
            height={8}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1={0} y1={0} x2={0} y2={8} stroke={culoare} strokeWidth={2.5} />
          </pattern>
        </defs>
      )}

      {/* Umplerea plină stă dedesubt și e slabă: dă corp figurii fără să înece
          curba desenată peste ea. Hașura de deasupra e cea care se vede. */}
      <path d={d} fill={culoare} fillOpacity={0.2 * opacitate} />
      {hasura && <path d={d} fill={`url(#${idHasura})`} fillOpacity={opacitate} />}
      {contur && (
        <path
          d={d}
          fill="none"
          stroke={culoare}
          strokeWidth={2}
          strokeOpacity={opacitate}
          strokeLinejoin="round"
        />
      )}
    </g>
  );
}
