import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";

export type AlgorithmCardProps = {
  titlu: string;
  /** O propoziție: ce vede studentul aici. */
  descriere: string;
  /** Ruta internă (`/algoritm/...`). Fără ea, cardul nu e clicabil. */
  to?: string;
  className?: string;
};

/**
 * Cardul din pagina de cuprins: titlu și o propoziție, atât. Tot cardul e zona
 * de clic, nu doar titlul.
 */
export function AlgorithmCard({ titlu, descriere, to, className }: AlgorithmCardProps) {
  const continut = (
    <>
      <h3 className="text-lg font-bold">{titlu}</h3>
      <p className="text-text-slab mt-2 mb-4 text-sm">{descriere}</p>

      {to && (
        <span className="text-accent-slab group-hover:text-text dark:text-text dark:group-hover:text-accent-slab mt-auto inline-flex items-center gap-1 text-sm font-semibold">
          Deschide
          <ArrowRight
            className="duration-rapid ease-standard size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      )}
    </>
  );

  const clase = cn(
    "bg-suprafata border-bordura flex h-full flex-col rounded-xl border p-5 text-left",
    className,
  );

  if (!to) {
    return (
      <div aria-disabled="true" className={cn(clase, "opacity-60")}>
        {continut}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={cn(
        clase,
        "group duration-mediu ease-standard hover:border-accent hover:shadow-mediu focus-visible:ring-ring/50 transition-all hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:outline-none motion-reduce:hover:translate-y-0",
      )}
    >
      {continut}
    </Link>
  );
}
