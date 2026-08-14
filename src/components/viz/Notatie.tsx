import { Fragment } from "react";

import {
  areNotatie,
  bucatiNotatie,
  COBORARE_JOS,
  PROPORTIE_MICA,
  RIDICARE_SUS,
  type BucataNotatie,
} from "@/lib/notatie";

/**
 * Notația matematică dintr-un text obișnuit, desenată cu fonturile proiectului.
 *
 * Motivul complet — fonturile nu conțin caracterele Unicode de exponent și
 * indice — e scris în [`src/lib/notatie.ts`](../../lib/notatie.ts). Aici stă
 * doar punerea pe ecran, în două forme, fiindcă HTML și SVG n-au aceleași
 * unelte: HTML are `<sup>`/`<sub>`, SVG are `<tspan>` cu deplasare explicită.
 *
 * **Nu înlocuiește `FormulaBlock`.** Acolo unde e o formulă adevărată se
 * folosește tot KaTeX; asta e pentru numele scurte de pe desen, din tabel și de
 * pe etichete, unde KaTeX ar fi 78 KB pentru două litere.
 */
export function Notatie({ children }: { children: string }) {
  if (!areNotatie(children)) return <>{children}</>;

  return (
    <>
      {bucatiNotatie(children).map((bucata, i) => (
        <Fragment key={i}>{elementHtml(bucata)}</Fragment>
      ))}
    </>
  );
}

function elementHtml({ text, nivel }: BucataNotatie) {
  if (nivel === "sus") return <sup>{text}</sup>;
  if (nivel === "jos") return <sub>{text}</sub>;
  return text;
}

/**
 * Aceeași notație, ca `<tspan>`-uri pentru un `<text>` din SVG.
 *
 * **Deplasarea se dă în pixeli, nu în `em`.** `dy` cu unități relative e prost
 * suportat în SVG, iar aici mărimea de bază e oricum cunoscută: o primim ca
 * parametru. Fiecare bucată primește deplasarea **față de cea dinainte**, nu
 * față de linia de bază — `dy` din SVG se cumulează —, deci după un exponent
 * urmează întotdeauna o coborâre egală înapoi.
 *
 * Se pune direct în `<text>`: cine desenează păstrează controlul pe `x`, `y`,
 * ancoră și contur.
 */
export function NotatieSVG({ text, marime }: { text: string; marime: number }) {
  const bucati = bucatiNotatie(text);
  let deplasareCurenta = 0;

  const tspanuri = bucati.map((bucata, i) => {
    const tinta =
      bucata.nivel === "sus"
        ? -RIDICARE_SUS * marime
        : bucata.nivel === "jos"
          ? COBORARE_JOS * marime
          : 0;
    const dy = tinta - deplasareCurenta;
    deplasareCurenta = tinta;

    return (
      <tspan
        key={i}
        dy={dy}
        fontSize={bucata.nivel === "normal" ? undefined : marime * PROPORTIE_MICA}
      >
        {bucata.text}
      </tspan>
    );
  });

  return <>{tspanuri}</>;
}
