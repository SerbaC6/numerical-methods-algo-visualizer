import { useId, useMemo } from "react";

import { useGraf } from "@/components/viz/graf-context";
import { construiesteMuchii } from "@/lib/graf-orientat";
import { culoareRol } from "@/lib/viz-roles";

export type GrafMuchiiProps = {
  /** `linkuri[i][j] = true` — există săgeata de la nodul `i` la nodul `j`. */
  linkuri: boolean[][];
  /**
   * Care muchii se folosesc **acum**. Se desenează cu `interval` (portocaliu),
   * mai groase și cu halo — nu doar cu altă culoare: safirul iterației curente
   * ajunge la 2,07:1 pe suprafața temei întunecate, sub pragul de 3:1 pentru un
   * element grafic, deci evidențierea unei linii subțiri nu se poate sprijini pe
   * culoare singură.
   */
  active?: boolean[][];
};

/**
 * Muchiile grafului: săgeata de la fiecare pagină către paginile pe care le
 * indică.
 *
 * Stă **sub** noduri în ordinea pictorului, ca vârfurile de săgeată să nu treacă
 * peste cercuri. Nu conține matematică: curbele, tăierea la conturul nodului și
 * unghiul vârfului vin din `src/lib/graf-orientat.ts`.
 */
export function GrafMuchii({ linkuri, active }: GrafMuchiiProps) {
  const { noduri, raze } = useGraf();
  const idBaza = useId();
  const idVarf = `${idBaza}-varf`;
  const idVarfActiv = `${idBaza}-varf-activ`;

  const muchii = useMemo(() => construiesteMuchii(noduri, linkuri, raze), [noduri, linkuri, raze]);

  return (
    <g aria-hidden="true">
      <defs>
        <VarfDeSageata id={idVarf} culoare={culoareRol("functie")} />
        <VarfDeSageata id={idVarfActiv} culoare={culoareRol("interval")} />
      </defs>

      {muchii.map((muchie) => {
        const activa = active?.[muchie.dela]?.[muchie.la] ?? false;
        return (
          <g key={`${muchie.dela}-${muchie.la}`}>
            {/* Halo-ul e al doilea semnal, pe lângă culoare și grosime: pe tema
                întunecată, o linie caldă subțire peste fundal se citește greu. */}
            {activa && (
              <path
                d={muchie.cale}
                fill="none"
                stroke={culoareRol("interval")}
                strokeOpacity={0.22}
                strokeWidth={9}
                strokeLinecap="round"
              />
            )}
            <path
              d={muchie.cale}
              fill="none"
              stroke={culoareRol(activa ? "interval" : "functie")}
              strokeWidth={activa ? 2.6 : 1.6}
              strokeLinecap="round"
              markerEnd={`url(#${activa ? idVarfActiv : idVarf})`}
              className="duration-mediu ease-standard transition-[stroke,stroke-width]"
            />
          </g>
        );
      })}
    </g>
  );
}

/**
 * Vârful de săgeată, ca `<marker>`.
 *
 * `markerUnits="userSpaceOnUse"` — implicit, markerul se scalează cu grosimea
 * liniei, deci muchia activă ar căpăta un vârf vizibil mai mare doar fiindcă e
 * mai groasă, iar cele două sensuri ale unei perechi reciproce n-ar mai arăta la
 * fel. Aici mărimea vârfului e a desenului, nu a liniei.
 */
function VarfDeSageata({ id, culoare }: { id: string; culoare: string }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="11"
      markerHeight="11"
      markerUnits="userSpaceOnUse"
      orient="auto-start-reverse"
    >
      <path d="M 0 1 L 10 5 L 0 9 z" fill={culoare} />
    </marker>
  );
}
