import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ControlPanelProps = {
  titlu?: string;
  /** O propoziție despre ce fac controalele de mai jos. */
  descriere?: string;
  /** Se afișează un buton „Resetează" dacă primește ceva de făcut. */
  onReset?: () => void;
  children: React.ReactNode;
  className?: string;
};

/**
 * Grupul de parametri al unei vizualizări.
 *
 * Regula de layout din design system: pe mobil panoul stă SUB grafic
 * (graficul e ce vrei să vezi când tragi de un slider), pe desktop
 * lângă el. Aranjarea o face pagina; panoul doar se întinde pe lățime.
 */
export function ControlPanel({
  titlu = "Parametri",
  descriere,
  onReset,
  children,
  className,
}: ControlPanelProps) {
  return (
    <section
      aria-label={titlu}
      className={cn(
        "bg-suprafata border-bordura shadow-jos rounded-xl border p-4 sm:p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-wide uppercase">{titlu}</h3>
          {descriere && <p className="text-text-slab mt-1 text-sm">{descriere}</p>}
        </div>
        {onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="tinta-atingere shrink-0">
            <RotateCcw aria-hidden="true" />
            Resetează
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
