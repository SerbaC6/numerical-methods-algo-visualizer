import { useScena3D } from "@/components/viz/scena-3d-context";
import { culoareRol, type RolViz } from "@/lib/viz-roles";

export type CurbeDeNivel3DProps = {
  /**
   * Poliliniile gata calculate, fiecare ca listă de perechi `[x₁, x₂]`.
   *
   * Matematica lor stă în [`src/lib/curbe-de-nivel.ts`](../../lib/curbe-de-nivel.ts),
   * unde e verificată numeric. Stratul ăsta nu evaluează nicio funcție: primește
   * puncte și le desenează, exact cum `PlotCurba` primește segmente.
   */
  curbe: readonly (readonly (readonly [number, number])[])[];
  rol?: RolViz;
  opacitate?: number;
  grosime?: number;
};

/**
 * Curbele de nivel, desenate pe podeaua scenei (`z = cutie.z[0]`).
 *
 * Stau pe podea, nu pe suprafață: acolo sunt chiar harta văii privită de sus,
 * adică imaginea din care se citește unghiul dintre doi pași consecutivi. Puse
 * pe suprafață ar fi doar niște dungi.
 *
 * Se taie la **rama podelei** (`idTaierePodea`), nu la marginea zonei de desen:
 * o elipsă de nivel nu știe nimic despre cutie și, tăiată doar la marginea
 * SVG-ului, ar curge peste toată scena, mult în afara podelei pe care ar trebui
 * să stea.
 */
export function CurbeDeNivel3D({
  curbe,
  rol = "grila",
  opacitate = 0.7,
  grosime = 1.25,
}: CurbeDeNivel3DProps) {
  const { proiectie, cutie, idTaierePodea } = useScena3D();
  const z = cutie.z[0];

  const cai = curbe
    .map((curba) => {
      const bucati: string[] = [];
      for (const punct of curba) {
        const p = proiectie.laEcran({ x: punct[0], y: punct[1], z });
        if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
        bucati.push(`${bucati.length === 0 ? "M" : "L"} ${p.x} ${p.y}`);
      }
      return bucati.length >= 2 ? bucati.join(" ") : null;
    })
    .filter((d): d is string => d !== null);

  return (
    <g aria-hidden="true" clipPath={`url(#${idTaierePodea})`}>
      {cai.map((d, index) => (
        // Cheie de index: curbele n-au identitate proprie și se recalculează
        // împreună, ca listă, la fiecare schimbare de parametri.
        <path
          key={index}
          d={d}
          fill="none"
          stroke={culoareRol(rol)}
          strokeOpacity={opacitate}
          strokeWidth={grosime}
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
}
