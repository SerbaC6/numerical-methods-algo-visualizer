import { cn } from "@/lib/utils";

export type ColoanaIteratii = {
  cheie: string;
  /** Antetul coloanei; poate fi și o formulă scrisă simplu (ex. „|xₖ − xₖ₋₁|"). */
  titlu: React.ReactNode;
  /** Explicație scurtă, arătată ca `title` pe antet. */
  descriere?: string;
};

export type IterationTableProps = {
  coloane: ColoanaIteratii[];
  /** Un obiect per iterație; valorile deja formatate ca text. */
  randuri: Record<string, React.ReactNode>[];
  /** Iterația evidențiată — de obicei pasul curent din `PlaybackBar`. */
  randCurent?: number;
  /** Dacă e dat, se poate sări la o iterație dând clic pe rând. */
  onAlegeRand?: (index: number) => void;
  titlu?: string;
  className?: string;
};

/**
 * Tabelul de iterații. Trei lucruri contează:
 * — cifrele sunt tabulare, deci coloanele se compară pe verticală;
 * — pe mobil tabelul face scroll în containerul lui, nu împinge pagina;
 * — rândul curent e evidențiat și sincronizat cu animația.
 */
export function IterationTable({
  coloane,
  randuri,
  randCurent,
  onAlegeRand,
  titlu = "Iterații",
  className,
}: IterationTableProps) {
  return (
    <div className={cn("border-bordura overflow-hidden rounded-xl border", className)}>
      <div className="scroll-tabel max-h-96">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{titlu}</caption>
          <thead className="bg-suprafata sticky top-0 z-10">
            <tr>
              <th
                scope="col"
                className="text-text-slab border-bordura border-b px-3 py-2 text-right font-mono text-xs font-semibold"
              >
                k
              </th>
              {coloane.map((c) => (
                <th
                  key={c.cheie}
                  scope="col"
                  title={c.descriere}
                  className="text-text-slab border-bordura border-b px-3 py-2 text-right text-xs font-semibold whitespace-nowrap"
                >
                  {c.titlu}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {randuri.length === 0 && (
              <tr>
                <td
                  colSpan={coloane.length + 1}
                  className="text-text-slab px-3 py-6 text-center text-sm"
                >
                  Încă nu s-a calculat nicio iterație.
                </td>
              </tr>
            )}
            {randuri.map((rand, i) => {
              const curent = i === randCurent;
              return (
                <tr
                  key={i}
                  aria-current={curent ? "true" : undefined}
                  onClick={onAlegeRand ? () => onAlegeRand(i) : undefined}
                  className={cn(
                    "duration-rapid ease-standard transition-colors",
                    curent ? "bg-accent/20" : "hover:bg-muted/60",
                    onAlegeRand && "cursor-pointer",
                  )}
                >
                  <th
                    scope="row"
                    className={cn(
                      "border-bordura/60 border-b px-3 py-1.5 text-right font-mono text-xs",
                      curent ? "text-text font-bold" : "text-text-slab font-normal",
                    )}
                  >
                    {i}
                  </th>
                  {coloane.map((c) => (
                    <td
                      key={c.cheie}
                      className="border-bordura/60 border-b px-3 py-1.5 text-right font-mono whitespace-nowrap"
                    >
                      {rand[c.cheie] ?? "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
