import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Dificultate = "ușor" | "mediu" | "greu";

export type AlgorithmCardProps = {
  titlu: string;
  /** Capitolul din care face parte (ex. „Sisteme liniare — metode directe"). */
  capitol: string;
  /** O propoziție: ce vede studentul aici. */
  descriere: string;
  dificultate: Dificultate;
  /** Metodele acoperite de pagină, ca etichete. */
  metode?: string[];
  href?: string;
  /** Pagină neimplementată încă: apare în cuprins, dar nu se poate deschide. */
  inCurand?: boolean;
  className?: string;
};

const VARIANTA_DIFICULTATE: Record<Dificultate, "succes" | "atentie" | "eroare"> = {
  ușor: "succes",
  mediu: "atentie",
  greu: "eroare",
};

/** Cardul din pagina de cuprins. Tot cardul e zona de clic, nu doar titlul. */
export function AlgorithmCard({
  titlu,
  capitol,
  descriere,
  dificultate,
  metode,
  href,
  inCurand = false,
  className,
}: AlgorithmCardProps) {
  const continut = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-text-slab text-xs font-semibold tracking-wide uppercase">{capitol}</p>
        <Badge variant={inCurand ? "outline" : VARIANTA_DIFICULTATE[dificultate]}>
          {inCurand ? "în curând" : dificultate}
        </Badge>
      </div>

      <h3 className="mt-2 text-lg font-bold">{titlu}</h3>
      <p className="text-text-slab mt-1 text-sm">{descriere}</p>

      {metode && metode.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
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
        <span className="text-accent-slab group-hover:text-text mt-4 inline-flex items-center gap-1 text-sm font-semibold">
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
    "bg-suprafata border-bordura block h-full rounded-xl border p-5 text-left",
    className,
  );

  if (inCurand || !href) {
    return (
      <div aria-disabled="true" className={cn(clase, "opacity-60")}>
        {continut}
      </div>
    );
  }

  return (
    <a
      href={href}
      className={cn(
        clase,
        "group duration-mediu ease-standard hover:border-accent hover:shadow-mediu focus-visible:ring-ring/50 transition-all hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:outline-none motion-reduce:hover:translate-y-0",
      )}
    >
      {continut}
    </a>
  );
}
