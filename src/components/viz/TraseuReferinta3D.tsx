import { useScena3D } from "@/components/viz/scena-3d-context";
import { poliliniiTaiate } from "@/lib/proiectie-3d";
import { culoareRol, type RolViz } from "@/lib/viz-roles";

export type TraseuReferinta3DProps = {
  /** Drumul, ca listă de perechi `[x₁, x₂]` din planul soluțiilor. */
  puncte: readonly (readonly [number, number])[];
  rol?: RolViz;
  opacitate?: number;
  grosime?: number;
};

/**
 * Drumul **celeilalte** metode, desenat plat pe podea, cu linie punctată.
 *
 * Există pentru paralela cerută de `Plan.md`: până acum cele două metode se
 * puteau compara doar schimbând tabul, adică din memorie. Puse pe aceeași vale,
 * se vede dintr-o privire că una taie de-a curmezișul de zeci de ori, iar
 * cealaltă ajunge din doi pași.
 *
 * **Nu e culoare nouă**: e rolul traseului (`anterior`), deosebit prin **formă**
 * — punctat și plat pe podea — de umbra metodei curente, care e plină și
 * însoțită de punctele iterațiilor și de liniile de cădere. Stă pe `z` de podea,
 * deci se desenează sub tot restul.
 */
export function TraseuReferinta3D({
  puncte,
  rol = "anterior",
  opacitate = 0.55,
  grosime = 1.5,
}: TraseuReferinta3DProps) {
  const { proiectie, cutie, idTaierePodea } = useScena3D();
  const z = cutie.z[0];

  // Tăiat la cutie ca traiectoria, nu doar la rama podelei: masca ar ascunde
  // bucata din afară, dar coordonatele ei ar rămâne în `d` — după câteva trepte
  // de lupă, de ordinul miliardelor de pixeli.
  const cale = poliliniiTaiate(
    puncte.map((p) => ({ x: p[0], y: p[1], z })),
    cutie,
  )
    .map((bucata) =>
      bucata
        .map((p) => proiectie.laEcran(p))
        .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" "),
    )
    .join(" ");

  if (cale === "") return null;

  return (
    <g aria-hidden="true" clipPath={`url(#${idTaierePodea})`}>
      <path
        d={cale}
        fill="none"
        stroke={culoareRol(rol)}
        strokeOpacity={opacitate}
        strokeWidth={grosime}
        strokeDasharray="5 4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </g>
  );
}
