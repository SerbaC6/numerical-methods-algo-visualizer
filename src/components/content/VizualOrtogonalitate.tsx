import { AnimatiaGivens } from "@/components/content/AnimatiaGivens";
import { AnimatiaHouseholder } from "@/components/content/AnimatiaHouseholder";

/**
 * Secțiunea „Vizual" a paginii 2: **două** clipuri, unul sub altul.
 *
 * E singura pagină cu două clipuri, și cu motiv: Householder și Givens sunt două
 * geometrii diferite pentru aceeași problemă, iar un singur clip care le-ar lua
 * pe amândouă ar trebui să comute între o oglindă și o rotație la mijloc — adică
 * exact locul unde cine se uită pierde firul. Separate, fiecare își spune
 * povestea până la capăt, iar comparația se face la finalul celui de-al doilea.
 *
 * Ordinea nu e întâmplătoare: reflexia întâi, fiindcă ea introduce ideea comună
 * (norma se păstrează, deci ținta e pe cerc), iar rotația se sprijină pe ea.
 */
export function VizualOrtogonalitate() {
  return (
    <div className="flex flex-col gap-12">
      <AnimatiaHouseholder />
      <AnimatiaGivens />
    </div>
  );
}
