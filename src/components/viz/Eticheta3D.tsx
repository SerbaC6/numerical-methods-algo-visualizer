import { deplasareRadiala, useScena3D } from "@/components/viz/scena-3d-context";
import { inCutieXY, type Punct3 } from "@/lib/proiectie-3d";
import { culoareEticheta, type RolViz } from "@/lib/viz-roles";

export type Eticheta3DProps = {
  /** Punctul din lume de care e legat numele. */
  punct: Punct3;
  text: string;
  rol?: RolViz;
  /** Cât de departe de punct stă numele, în pixeli de ecran. */
  distanta?: number;
  marime?: number;
  opacitate?: number;
};

/**
 * Numele unui element al scenei, ancorat într-un punct din lume.
 *
 * Două lucruri, amândouă obligatorii:
 *
 * - **Culoarea vine din `culoareEticheta`, niciodată din `culoareRol`.** WCAG
 *   cere 4,5:1 pentru text și doar 3:1 pentru un element grafic, iar rolurile
 *   sunt calibrate pentru desen — safirul iterației curente ajunge la 2,11:1 ca
 *   literă pe tema întunecată.
 * - **Deplasarea e radială, dinspre centrul proiectat al scenei.** Un
 *   „sus-dreapta" fix, ca la `PlotPunct`, funcționează pe un grafic care nu se
 *   rotește; aici ar cădea peste vale la jumătate din azimuturi. Vezi
 *   `deplasareRadiala`.
 */
export function Eticheta3D({
  punct,
  text,
  rol = "curent",
  distanta = 18,
  marime = 15,
  opacitate = 1,
}: Eticheta3DProps) {
  const { proiectie, cutie, idTaiere } = useScena3D();

  // Un nume ancorat în afara ferestrei scenei nu se scrie deloc: punctul lui nu
  // se vede, deci eticheta ar pluti singură, iar după o apropiere a lupei ar fi
  // ancorată la milioane de pixeli de cadru.
  if (!inCutieXY(punct, cutie)) return null;

  const p = proiectie.laEcran(punct);
  if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return null;

  const deplasare = deplasareRadiala(proiectie, p, distanta);

  return (
    <g aria-hidden="true" clipPath={`url(#${idTaiere})`}>
      <text
        x={p.x + deplasare.dx}
        y={p.y + deplasare.dy}
        dy="0.32em"
        textAnchor={deplasare.ancora}
        className="font-mono tabular-nums"
        style={{ fontSize: marime }}
        fill={culoareEticheta(rol)}
        fillOpacity={opacitate}
        // Contur în culoarea suprafeței, desenat sub literă: numele rămâne
        // lizibil și peste mesh, și peste curbele de nivel.
        stroke="var(--suprafata)"
        strokeWidth={5}
        paintOrder="stroke"
      >
        {text}
      </text>
    </g>
  );
}
