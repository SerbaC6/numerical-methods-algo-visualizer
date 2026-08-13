import { usePlot } from "@/components/viz/plot-context";
import { culoareRol, type RolViz } from "@/lib/viz-roles";

export type PlotIntervalProps = {
  de: number;
  la: number;
  rol?: RolViz;
  /** Textul din capul benzii: „[aₖ, bₖ]". */
  eticheta?: string;
  opacitate?: number;
};

/**
 * Banda verticală care marchează intervalul de căutare.
 *
 * La bisecție, tocmai strângerea ei e metoda: la fiecare pas banda se
 * înjumătățește. De aceea marginile ei se mută cu tranziție, nu sar — regula 7
 * din `docs/referinte.md`: obiectul se transformă, nu se taie și reapare.
 *
 * Tranziția se pune pe atribute, care merg în orice browser; acolo unde
 * proprietățile geometrice SVG sunt animabile, banda alunecă, iar unde nu, se
 * mută instant. În ambele cazuri desenul e corect. Tăierea globală a duratelor
 * pentru `prefers-reduced-motion` din `index.css` o oprește oricum.
 */
export function PlotInterval({
  de,
  la,
  rol = "interval",
  eticheta,
  opacitate = 1,
}: PlotIntervalProps) {
  const plot = usePlot();
  const culoare = culoareRol(rol);

  // Capetele pot veni în orice ordine; o lățime negativă nu s-ar desena deloc.
  const stanga = plot.x.la(Math.min(de, la));
  const dreapta = plot.x.la(Math.max(de, la));
  const latime = Math.max(0, dreapta - stanga);

  const tranzitie =
    "x var(--duration-mediu) var(--ease-standard), width var(--duration-mediu) var(--ease-standard)";

  return (
    <g clipPath={`url(#${plot.idTaiere})`} aria-hidden="true">
      <rect
        x={stanga}
        y={plot.zona.sus}
        width={latime}
        height={Math.max(0, plot.zona.jos - plot.zona.sus)}
        fill={culoare}
        fillOpacity={0.55 * opacitate}
        style={{ transition: tranzitie }}
      />

      {/* Marginile benzii, ca să se citească exact unde sunt capetele. */}
      <g stroke={culoare} strokeWidth={1.5} strokeOpacity={opacitate}>
        <line
          x1={stanga}
          x2={stanga}
          y1={plot.zona.sus}
          y2={plot.zona.jos}
          style={{ transition: `x1 var(--duration-mediu), x2 var(--duration-mediu)` }}
        />
        <line x1={dreapta} x2={dreapta} y1={plot.zona.sus} y2={plot.zona.jos} />
      </g>

      {eticheta && (
        <text
          x={(stanga + dreapta) / 2}
          y={plot.zona.sus + 13}
          textAnchor="middle"
          className="font-mono text-[11px] font-semibold tabular-nums"
          fill="var(--text)"
          stroke="var(--suprafata)"
          strokeWidth={3}
          paintOrder="stroke"
        >
          {eticheta}
        </text>
      )}
    </g>
  );
}
