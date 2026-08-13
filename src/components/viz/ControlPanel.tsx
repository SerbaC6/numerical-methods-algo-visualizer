import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ControlPanelProps = {
  titlu?: string;
  /** O propoziție despre ce fac controalele de mai jos. */
  descriere?: string;
  /** Se afișează un buton „Resetează" dacă primește ceva de făcut. */
  onReset?: () => void;
  /**
   * Panoul stă **înăuntrul** altei rame, lipit de grafic, deci renunță la a
   * lui: fundal, bordură și colțuri rotunjite.
   *
   * E o legătură, nu o economie de pixeli. Două cartonașe alăturate spun că
   * sunt două lucruri; parametrii nu sunt un lucru separat de grafic, ci
   * butoanele lui. Cu o singură ramă și o linie de despărțire, se citește ce
   * și este: un instrument.
   *
   * Câmpurile trec pe o singură coloană — încorporat, panoul stă pe o fâșie
   * îngustă, unde două coloane ar sparge fiecare etichetă pe trei rânduri.
   */
  incorporat?: boolean;
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
  incorporat = false,
  children,
  className,
}: ControlPanelProps) {
  return (
    <section
      aria-label={titlu}
      className={cn(
        "p-5 sm:p-6",
        !incorporat && "bg-suprafata border-bordura shadow-jos rounded-xl border",
        className,
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-wide uppercase">{titlu}</h3>
          {descriere && <p className="text-text-slab mt-1.5 text-base">{descriere}</p>}
        </div>
        {onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="tinta-atingere shrink-0">
            <RotateCcw aria-hidden="true" />
            Resetează
          </Button>
        )}
      </div>

      <div className={cn("grid gap-5", !incorporat && "sm:grid-cols-2")}>{children}</div>
    </section>
  );
}
