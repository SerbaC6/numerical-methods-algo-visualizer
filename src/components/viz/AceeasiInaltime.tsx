import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type AceeasiInaltimeProps = {
  /**
   * Toate variantele care se pot vedea în locul acesta, în ordine. Se randează
   * **toate**, dar numai una se vede.
   */
  variante: ReactNode[];
  /** Indicele variantei vizibile. */
  activa: number;
  className?: string;
};

/**
 * Ține un loc din interfață la înălțimea celei mai înalte variante ale lui.
 *
 * **Problema.** O pagină de metodă are mai multe taburi, iar ce se schimbă între
 * ele nu e doar desenul: legenda are patru intrări la o metodă și șase la alta,
 * panoul de parametri are un câmp în plus la una singură, tabelul are douăzeci
 * de rânduri la bisecție și patru la Newton. Blocul se scurtează și se
 * lungește la fiecare apăsare, iar pagina de sub el saltă — exact în momentul
 * în care omul vrea să compare două metode.
 *
 * **De ce așa și nu cu o înălțime scrisă de mână.** Un `min-h-[520px]` pare mai
 * simplu, dar e o cifră care nu se poate menține: se schimbă la altă lățime de
 * ecran, la alt text, la alt font, iar când se strică o face tăcut — fie taie
 * conținutul, fie lasă un gol. Aici înălțimea nu se ghicește: toate variantele
 * stau **una peste alta** în aceeași celulă de grilă, deci celula are firesc
 * înălțimea celei mai mari, oricare ar fi ea și oricât s-ar înfășura textul.
 *
 * Variantele ascunse rămân în pagină, deci trebuie scoase din calea tuturor:
 * `invisible` le ia din desen, `pointer-events-none` din calea mouse-ului,
 * `aria-hidden` din calea cititorului de ecran, iar `inert` oprește tabularea
 * prin controalele lor.
 *
 * **Ce nu e treaba ei.** Nu ține locul unui lucru care lipsește cu totul (un
 * grafic care n-are ce desena) și nu ascunde diferențe de conținut: variantele
 * rămân ce sunt: legenda unei metode spune în continuare exact ce e pe desenul
 * ei. Aici se egalizează doar **spațiul**, nu textul.
 */
export function AceeasiInaltime({ variante, activa, className }: AceeasiInaltimeProps) {
  return (
    <div className={cn("grid", className)}>
      {variante.map((varianta, i) => (
        <div
          key={i}
          // Toate pe aceeași celulă: `grid-area: 1 / 1`. Suprapuse, nu stivuite.
          className={cn(
            "col-start-1 row-start-1 min-w-0",
            i === activa ? "" : "pointer-events-none invisible",
          )}
          {...(i === activa ? {} : { "aria-hidden": true, inert: true })}
        >
          {varianta}
        </div>
      ))}
    </div>
  );
}
