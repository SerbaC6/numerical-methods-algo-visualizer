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
 * Corpul literei din subtitrare, măsurat pe lățimea cadrului (`cqw`), nu pe cea
 * a ferestrei.
 *
 * Podeaua de `0.8rem` nu e un capriciu: sub ea propoziția nu se mai citește pe
 * telefon. Dar tocmai ea rupe proporția — de la 674px de cadru în jos, corpul
 * încetează să scadă odată cu desenul, iar banda de subtitrare crește de la 14 %
 * din înălțimea cadrului la peste 23 %. De aici vine `BANDA_SUBTITRARE`.
 */
export const CORP_SUBTITRARE = "clamp(0.8rem, 1.9cqw, 1.5rem)";

/**
 * Cât trebuie să cedeze desenul, ca propoziția să nu ajungă peste el.
 *
 * Clipurile sunt desenate cu ultima linie pe la `y = 930` din cele 1080 de
 * unități ale pânzei — adică fix banda pe care o cere subtitrarea când corpul
 * literei încă scade proporțional (`1.9cqw`). Socoteala, cu `H = 0.5625·W`
 * (cadrul e 16:9), `2.5f` cele două rânduri rezervate și `0.03·W` spațiul de
 * sub ele:
 *
 *     (H − p)·0,8622 ≤ H − 0,03·W − 2,5·f   ⟹   p ≥ 2,9·f − 0,055·W
 *
 * Peste 674px de cadru iese zero, deci pe desktop nu se schimbă absolut nimic.
 * Sub prag, cadrul își ia din înălțime cât cere podeaua corpului, iar SVG-ul —
 * care are `preserveAspectRatio` implicit — se micșorează și se centrează.
 * Alternativa ar fi fost să scriem cu 6px pe telefon.
 */
export const BANDA_SUBTITRARE = `max(0px, calc(2.9 * ${CORP_SUBTITRARE} - 5.5cqw))`;

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
        // Două rânduri rezervate de la început, iar propoziția se așază de sus
        // în jos în locul rezervat. Mai multe n-ar ajuta, ci ar strica: banda
        // crește în sus, peste ultimul rând al desenului.
        className="text-text min-h-[2lh] text-center leading-tight font-bold text-balance"
        style={{ fontSize: CORP_SUBTITRARE }}
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
