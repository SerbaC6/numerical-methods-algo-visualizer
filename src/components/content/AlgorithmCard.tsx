import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Dificultate = "ușor" | "mediu" | "greu";

/**
 * `gata` — pagina e scrisă; `in-lucru` — există doar scheletul, dar se poate
 * deschide; `in-curand` — nu există nimic, cardul nu e clicabil.
 */
export type StarePagina = "gata" | "in-lucru" | "in-curand";

export type AlgorithmCardProps = {
  /** Numărul paginii din cuprins, afișat discret în colț. */
  numar?: number;
  titlu: string;
  /** Capitolul din care face parte (ex. „Sisteme liniare — metode directe"). */
  capitol: string;
  /** O propoziție: ce vede studentul aici. */
  descriere: string;
  dificultate: Dificultate;
  /** Metodele acoperite de pagină, ca etichete. */
  metode?: string[];
  /** Ruta internă (`/algoritm/...`). Fără ea, cardul nu e clicabil. */
  to?: string;
  stare?: StarePagina;
  className?: string;
};

const VARIANTA_DIFICULTATE: Record<Dificultate, "succes" | "atentie" | "eroare"> = {
  ușor: "succes",
  mediu: "atentie",
  greu: "eroare",
};

/** Cardul din pagina de cuprins. Tot cardul e zona de clic, nu doar titlul. */
export function AlgorithmCard({
  numar,
  titlu,
  capitol,
  descriere,
  dificultate,
  metode,
  to,
  stare = "gata",
  className,
}: AlgorithmCardProps) {
  const inCurand = stare === "in-curand";
  const continut = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-text-slab text-xs font-semibold tracking-wide uppercase">{capitol}</p>
        <Badge variant={stare === "gata" ? VARIANTA_DIFICULTATE[dificultate] : "outline"}>
          {stare === "gata" ? dificultate : stare === "in-lucru" ? "în lucru" : "în curând"}
        </Badge>
      </div>

      <h3 className="mt-2 flex items-baseline gap-2 text-lg font-bold">
        {numar !== undefined && (
          <span className="text-text-slab shrink-0 font-mono text-sm font-normal opacity-70">
            {String(numar).padStart(2, "0")}
          </span>
        )}
        <span>{titlu}</span>
      </h3>
      <p className="text-text-slab mt-1 text-sm">{descriere}</p>

      {metode && metode.length > 0 && (
        <ul className="mt-3 mb-4 flex flex-wrap gap-1.5">
          {metode.map((m) => (
            <li
              key={m}
              className="border-bordura text-text-slab rounded-full border px-2 py-0.5 text-xs"
            >
              {m}
            </li>
          ))}
        </ul>
      )}

      {!inCurand && (
        <span className="text-accent-slab group-hover:text-text mt-auto inline-flex items-center gap-1 text-sm font-semibold">
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

  if (inCurand || !to) {
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
