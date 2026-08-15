import { useClip } from "@/components/viz/clip-context";
import { cn } from "@/lib/utils";

export type Subtitrare = {
  /** Secunda de la care se vede. */
  la: number;
  /** Secunda la care dispare; implicit, `la`-ul subtitrării următoare. */
  pana?: number;
  text: string;
};

export type SubtitrariProps = {
  items: readonly Subtitrare[];
  className?: string;
};

/**
 * Propoziția de sub desen, cheiată pe ceasul clipului.
 *
 * E ruda de film a lui `StepExplanation`: aceeași treabă — spune ce se întâmplă
 * acum — dar pe timp continuu, nu pe pași. **Cel mult una se vede odată**, ca
 * ochiul să nu aleagă între două texte în timp ce se uită la desen.
 *
 * Elementul rămâne montat tot timpul, chiar și gol, ca să nu salte desenul de
 * deasupra când apare sau dispare o propoziție.
 */
export function Subtitrari({ items, className }: SubtitrariProps) {
  const { T } = useClip();

  const ordonate = [...items].sort((a, b) => a.la - b.la);
  const indice = ordonate.findIndex((item, i) => {
    const pana = item.pana ?? ordonate[i + 1]?.la ?? Number.POSITIVE_INFINITY;
    return T >= item.la && T < pana;
  });
  const curenta = indice === -1 ? undefined : ordonate[indice];

  return (
    <div
      className={cn(
        // Fără degrade în josul cadrului: banda de estompare spăla desenul de
        // deasupra ei, iar clipurile își țin oricum ultimul rând deasupra
        // subtitrării, deci nu era nimic de ridicat de pe desen.
        "pointer-events-none absolute inset-x-0 bottom-0 px-[6%] pt-16 pb-[3%]",
        className,
      )}
    >
      <p
        aria-hidden="true"
        // Trei rânduri rezervate, nu două: cu doar două, propoziția lungă
        // creștea în sus și împingea desenul, adică textul se citea de jos în
        // sus. Acum locul e rezervat de la început și rândurile se adaugă în
        // jos, ca la orice text.
        className="text-text min-h-[3lh] text-center text-[clamp(0.8rem,1.9cqw,1.5rem)] leading-tight font-bold text-balance"
      >
        {/* `key` pe span, nu pe `p`: așa propoziția reapare la fiecare
            schimbare, iar înălțimea rezervată rămâne aceeași. Intrarea vine
            de sus în jos, în sensul citirii. */}
        <span
          key={indice}
          className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2 inline-block"
        >
          {curenta?.text ?? ""}
        </span>
      </p>
    </div>
  );
}
