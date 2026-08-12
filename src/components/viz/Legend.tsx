import { cn } from "@/lib/utils";
import { ROLURI_VIZ, type FormaLegenda, type RolViz } from "@/lib/viz-roles";

/**
 * Un element de legendă. Ori trimiți un rol cunoscut (și îți ia culoarea,
 * eticheta și forma din `viz-roles.ts`), ori dai explicit culoare + etichetă
 * pentru ceva ce n-are încă rol definit.
 */
export type ElementLegenda = { forma?: FormaLegenda; explicatie?: string } & (
  | { rol: RolViz; eticheta?: string; culoare?: never }
  | { culoare: string; eticheta: string; rol?: never }
);

export type LegendProps = {
  elemente: ElementLegenda[];
  /**
   * Modul de folosire, în 3–5 pași. `Plan.md` cere ca fiecare interfață
   * interactivă să aibă și legendă, **și** explicația modului de funcționare —
   * de-aia stau în aceeași componentă: ca să nu se uite una din ele.
   */
  pasi?: React.ReactNode[];
  titlu?: string;
  className?: string;
};

/** Simbolul din dreptul etichetei — desenat ca în figură, nu doar un pătrat colorat. */
function Simbol({ forma, culoare }: { forma: FormaLegenda; culoare: string }) {
  const comun = "shrink-0";

  switch (forma) {
    case "linie":
      return (
        <span
          aria-hidden="true"
          className={cn(comun, "h-1 w-5 rounded-full")}
          style={{ backgroundColor: culoare }}
        />
      );
    case "linie-punctata":
      return (
        <span
          aria-hidden="true"
          className={cn(comun, "h-0 w-5 border-t-2 border-dashed")}
          style={{ borderColor: culoare }}
        />
      );
    case "punct":
      return (
        <span
          aria-hidden="true"
          className={cn(comun, "size-2.5 rounded-full")}
          style={{ backgroundColor: culoare }}
        />
      );
    case "zona":
      return (
        <span
          aria-hidden="true"
          className={cn(comun, "h-3.5 w-5 rounded-sm border")}
          style={{
            backgroundColor: culoare,
            borderColor: `color-mix(in oklab, ${culoare} 70%, var(--text))`,
          }}
        />
      );
    case "celula":
      return (
        <span
          aria-hidden="true"
          className={cn(comun, "size-3.5 rounded-[3px] border-2")}
          style={{ borderColor: culoare }}
        />
      );
  }
}

/**
 * Legenda unei figuri sau interfețe interactive.
 *
 * Culorile vin din `viz-roles.ts`, adică din aceleași variabile CSS pe care le
 * folosește desenul — dacă schimbi tokenul, se schimbă și legenda, automat.
 *
 * Culoarea nu e niciodată singurul semnal: fiecare element are formă și text,
 * ca să funcționeze și pentru cine nu distinge culorile.
 */
export function Legend({ elemente, pasi, titlu = "Legendă", className }: LegendProps) {
  return (
    <aside
      aria-label={titlu}
      className={cn("bg-suprafata border-bordura rounded-xl border p-4 text-sm", className)}
    >
      <h3 className="text-text-slab text-xs font-bold tracking-wide uppercase">{titlu}</h3>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {elemente.map((el, i) => {
          const implicit = el.rol ? ROLURI_VIZ[el.rol] : undefined;
          const culoare = el.culoare ?? `var(${implicit?.varCss ?? "--text-slab"})`;
          const eticheta = el.eticheta ?? implicit?.eticheta ?? "";
          const forma = el.forma ?? implicit?.forma ?? "punct";

          return (
            <li key={el.rol ?? `${eticheta}-${i}`} className="flex items-start gap-2.5">
              <span className="flex h-5 items-center">
                <Simbol forma={forma} culoare={culoare} />
              </span>
              <span className="min-w-0">
                <span className="font-semibold">{eticheta}</span>
                {el.explicatie && <span className="text-text-slab"> — {el.explicatie}</span>}
              </span>
            </li>
          );
        })}
      </ul>

      {pasi && pasi.length > 0 && (
        <>
          <h4 className="text-text-slab mt-4 text-xs font-bold tracking-wide uppercase">
            Cum se folosește
          </h4>
          <ol className="text-text-slab mt-2 grid list-inside list-decimal gap-1">
            {pasi.map((pas, i) => (
              <li key={i} className="marker:font-mono marker:font-semibold">
                {pas}
              </li>
            ))}
          </ol>
        </>
      )}
    </aside>
  );
}
