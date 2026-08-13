import { motion } from "motion/react";

import { usePlot } from "@/components/viz/plot-context";
import { tranzitie } from "@/lib/miscare";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";

export type PlotTaieturaProps = {
  /** Valoarea în care dreapta de construcție taie axa orizontală. */
  x: number;
  rol?: RolViz;
  /** Numele valorii găsite: „x₃". */
  eticheta?: string;
  opacitate?: number;
};

/** Cât urcă și cât coboară mustața de o parte și de alta a axei. */
const INALTIME_MUSTATA = 15;

/**
 * Locul în care dreapta de construcție taie axa orizontală.
 *
 * **E chiar răspunsul dat de tangentă și de secantă.** Amândouă fac același
 * lucru: înlocuiesc curba cu o dreaptă și iau rădăcina dreptei în locul
 * rădăcinii curbei. Tăietura aceea e tot rezultatul pasului — restul desenului
 * doar explică de unde vine.
 *
 * Până acum nu se vedea deloc: dreapta traversa cadrul, punctul următor apărea
 * pe curbă, dar momentul în care unul îl produce pe celălalt lipsea. De-aia
 * marcajul e o mustață pe axă, nu încă un punct — un al treilea cerc pe desen
 * s-ar fi citit ca „încă o iterație", când de fapt e o construcție.
 *
 * Inelul din culoarea suprafeței îl ține vizibil când axa trece exact prin el.
 */
export function PlotTaietura({ x, rol = "curent", eticheta, opacitate = 1 }: PlotTaieturaProps) {
  const plot = usePlot();

  if (!Number.isFinite(x)) return null;

  // Fără zero în cadru n-are ce tăia: axa orizontală nu se vede, iar un marcaj
  // pus la baza desenului ar susține că acolo e zero, ceea ce e fals.
  const zeroVizibil = plot.y.domeniu[0] <= 0 && 0 <= plot.y.domeniu[1];
  if (!zeroVizibil) return null;
  if (x < plot.x.domeniu[0] || x > plot.x.domeniu[1]) return null;

  const px = plot.x.la(x);
  const py = plot.y.la(0);
  const culoare = culoareRol(rol);
  const miscare = tranzitie("lent");

  return (
    <g aria-hidden="true">
      <motion.g initial={false} animate={{ x: px, y: py }} transition={miscare}>
        <line
          x1={0}
          x2={0}
          y1={-INALTIME_MUSTATA}
          y2={INALTIME_MUSTATA}
          stroke={culoare}
          strokeWidth={4}
          strokeOpacity={opacitate}
          strokeLinecap="round"
        />
        <circle
          r={5}
          fill="var(--suprafata)"
          stroke={culoare}
          strokeWidth={3.5}
          strokeOpacity={opacitate}
        />
        {eticheta && (
          <text
            y={INALTIME_MUSTATA + 20}
            textAnchor="middle"
            className="font-mono text-[16px] font-semibold tabular-nums"
            fill={culoareEticheta(rol)}
            fillOpacity={opacitate}
            stroke="var(--suprafata)"
            strokeWidth={5}
            paintOrder="stroke"
          >
            {eticheta}
          </text>
        )}
      </motion.g>
    </g>
  );
}
