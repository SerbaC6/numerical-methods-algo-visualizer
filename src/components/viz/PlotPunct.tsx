import { usePlot } from "@/components/viz/plot-context";
import { culoareRol, type RolViz } from "@/lib/viz-roles";

export type PlotPunctProps = {
  x: number;
  y: number;
  rol?: RolViz;
  /** Numele punctului: „x₀", „aₖ", „soluția". */
  eticheta?: string;
  raza?: number;
  /**
   * Linie punctată de la punct până la axa orizontală, ca să se vadă în dreptul
   * cărei valori de pe axă cade. La căutarea rădăcinii, asta e chiar informația
   * urmărită: unde a ajuns `xₖ`.
   */
  proiectie?: boolean;
  opacitate?: number;
};

/** Lățimea aproximativă a unui caracter mono de 11px, pentru a nu scoate eticheta din cadru. */
const LATIME_CARACTER = 6.6;

/**
 * Un punct de iterație pe grafic.
 *
 * Are inel în culoarea fundalului, ca să rămână vizibil când cade exact peste
 * curbă — altfel punctul curent dispare taman în momentul în care metoda a
 * ajuns la rădăcină, adică fix când contează.
 */
export function PlotPunct({
  x,
  y,
  rol = "curent",
  eticheta,
  raza = 5,
  proiectie = false,
  opacitate = 1,
}: PlotPunctProps) {
  const plot = usePlot();
  const culoare = culoareRol(rol);

  const px = plot.x.la(x);
  const py = plot.y.la(y);

  const inCadru =
    x >= plot.x.domeniu[0] &&
    x <= plot.x.domeniu[1] &&
    y >= plot.y.domeniu[0] &&
    y <= plot.y.domeniu[1];

  // Capătul de jos al proiecției: axa Ox dacă e vizibilă, altfel baza zonei.
  const zeroVizibil = plot.y.domeniu[0] <= 0 && 0 <= plot.y.domeniu[1];
  const capatProiectie = zeroVizibil ? plot.y.la(0) : plot.zona.jos;

  // Eticheta stă implicit sus-dreapta. Lângă marginile cadrului se mută pe
  // partea cealaltă, ca să nu iasă din grafic. E o estimare de lățime, nu o
  // măsurătoare: măsurarea reală a textului ar cere o randare în plus.
  const latimeEticheta = (eticheta?.length ?? 0) * LATIME_CARACTER;
  const spreStanga = px + 10 + latimeEticheta > plot.zona.dreapta;
  const spreJos = py - 10 < plot.zona.sus;

  return (
    <g aria-hidden="true">
      <g clipPath={`url(#${plot.idTaiere})`}>
        {proiectie && (
          <line
            x1={px}
            x2={px}
            y1={py}
            y2={capatProiectie}
            stroke={culoare}
            strokeWidth={1.5}
            strokeDasharray="3 3"
            strokeOpacity={0.6 * opacitate}
          />
        )}
        <circle
          cx={px}
          cy={py}
          r={raza}
          fill={culoare}
          fillOpacity={opacitate}
          stroke="var(--suprafata)"
          strokeWidth={2}
        />
      </g>

      {eticheta && inCadru && (
        <text
          x={px + (spreStanga ? -10 : 10)}
          y={py + (spreJos ? 18 : -10)}
          textAnchor={spreStanga ? "end" : "start"}
          className="font-mono text-[11px] font-semibold tabular-nums"
          fill={culoare}
          fillOpacity={opacitate}
          // Contur în culoarea suprafeței, desenat sub literă: eticheta rămâne
          // lizibilă și când trece peste grilă sau peste curbă.
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
