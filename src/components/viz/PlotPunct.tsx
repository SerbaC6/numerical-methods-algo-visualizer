import { motion } from "motion/react";

import { usePlot } from "@/components/viz/plot-context";
import { tranzitie } from "@/lib/miscare";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";

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

/** Lățimea aproximativă a unui caracter mono de 17px, pentru a nu scoate eticheta din cadru. */
const LATIME_CARACTER = 10.2;

/**
 * Un punct de iterație pe grafic.
 *
 * Are inel în culoarea fundalului, ca să rămână vizibil când cade exact peste
 * curbă — altfel punctul curent dispare taman în momentul în care metoda a
 * ajuns la rădăcină, adică fix când contează.
 *
 * **Se mișcă, nu sare.** Între doi pași ai unei metode punctul alunecă spre
 * poziția nouă: drumul e informația (vezi cum se apropie `xₖ` de rădăcină), iar
 * un salt l-ar ascunde. `prefers-reduced-motion` e tratat global, din
 * `MotionConfig` în `src/main.tsx`.
 */
export function PlotPunct({
  x,
  y,
  rol = "curent",
  eticheta,
  raza = 8,
  proiectie = false,
  opacitate = 1,
}: PlotPunctProps) {
  const plot = usePlot();
  const culoare = culoareRol(rol);
  // Numele punctului se scrie cu varianta de text a rolului: culoarea de desen
  // e calibrată pentru 3:1 (element grafic), nu pentru 4,5:1 (text).
  const culoareText = culoareEticheta(rol);

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
  const spreStanga = px + 14 + latimeEticheta > plot.zona.dreapta;
  const spreJos = py - 14 < plot.zona.sus;

  const miscare = tranzitie("lent");

  return (
    <g aria-hidden="true">
      <g clipPath={`url(#${plot.idTaiere})`}>
        {proiectie && (
          // `x1`/`y1` sunt atribute obișnuite, deci `motion` le animează ca
          // atare. Aici chiar trebuie: linia își schimbă și poziția, și
          // lungimea, iar o transformare n-ar putea-o întinde fără s-o și
          // deformeze — liniuțele punctate s-ar lăți odată cu ea.
          <motion.line
            x1={px}
            x2={px}
            y1={py}
            y2={capatProiectie}
            animate={{ x1: px, x2: px, y1: py, y2: capatProiectie }}
            transition={miscare}
            stroke={culoare}
            strokeWidth={3}
            strokeDasharray="6 5"
            strokeOpacity={0.75 * opacitate}
          />
        )}
        {/* Punctul se mută prin transformare, nu prin `cx`/`cy`: e mai ieftin
            de desenat și nu atinge geometria cercului. */}
        <motion.g
          // Fără asta, la prima randare punctul ar porni din colțul din
          // stânga-sus și ar aluneca spre locul lui — un drum care nu înseamnă
          // nimic matematic.
          initial={false}
          animate={{ x: px, y: py }}
          transition={miscare}
        >
          <circle
            r={raza}
            fill={culoare}
            fillOpacity={opacitate}
            stroke="var(--suprafata)"
            strokeWidth={2.5}
          />
        </motion.g>
      </g>

      {eticheta && inCadru && (
        <motion.g
          initial={false}
          animate={{ x: px + (spreStanga ? -14 : 14), y: py + (spreJos ? 24 : -14) }}
          transition={miscare}
        >
          <text
            textAnchor={spreStanga ? "end" : "start"}
            className="font-mono text-[17px] tabular-nums"
            fill={culoareText}
            fillOpacity={opacitate}
            // Contur în culoarea suprafeței, desenat sub literă: eticheta rămâne
            // lizibilă și când trece peste grilă sau peste curbă.
            stroke="var(--suprafata)"
            strokeWidth={5}
            paintOrder="stroke"
          >
            {eticheta}
          </text>
        </motion.g>
      )}
    </g>
  );
}
