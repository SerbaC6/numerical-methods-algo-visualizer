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

  // Un singur `<span>` în jurul tuturor bucăților, nu un fragment. Motivul e
  // măsurat: etichetele din `NumberInput` sunt `flex ... gap-2`, iar un fragment
  // le dădea patru copii, deci flexbox punea 8 px între literă și indicele ei —
  // „a₁₂ = a₂₁" ieșea „a 12 = 21", rupt pe două rânduri.
  return (
    <span>
      {bucatiNotatie(children).map((bucata, i) => (
        <Fragment key={i}>{elementHtml(bucata)}</Fragment>
      ))}
    </span>
  );
}

/**
 * `<sup>` și `<sub>` se stilizează explicit, nu se lasă pe seama browserului.
 *
 * Implicit ele au `vertical-align: super/sub`, care **mărește înălțimea
 * rândului**: o etichetă ca „a₁₂ = a₂₁" ajungea să se rupă în două rânduri, cu
 * semnul egal deasupra literei. Rețeta e cea din normalize.css — deplasare din
 * `position: relative` și `line-height: 0`, ca rândul să rămână de înălțimea
 * lui normală.
 */
const CLASA_SUS = "relative -top-[0.42em] align-baseline text-[0.72em] leading-[0]";
const CLASA_JOS = "relative top-[0.2em] align-baseline text-[0.72em] leading-[0]";

function elementHtml({ text, nivel }: BucataNotatie) {
  if (nivel === "sus") return <sup className={CLASA_SUS}>{text}</sup>;
  if (nivel === "jos") return <sub className={CLASA_JOS}>{text}</sub>;
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
