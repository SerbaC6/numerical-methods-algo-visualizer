import { motion } from "motion/react";
import { useState } from "react";

import { usePlot } from "@/components/viz/plot-context";
import { tranzitie } from "@/lib/miscare";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";

export type PlotPunctTrasProps = {
  x: number;
  y: number;
  rol?: RolViz;
  /** Numele punctului, scris lângă el: „x₀", „x₃". */
  eticheta?: string;
  raza?: number;
  /** Se cheamă la fiecare mișcare, cu poziția nouă **în coordonate matematice**. */
  onMuta: (punct: { x: number; y: number }) => void;
  /** Limitele în care punctul poate fi dus, pe fiecare axă. */
  limiteX?: readonly [number, number];
  limiteY?: readonly [number, number];
  /** Blochează orizontala: punctul se mută doar în sus și în jos. */
  doarY?: boolean;
  /** Cât se mută la o apăsare de săgeată, în unități de pe axă. */
  pasTastatura?: number;
  /** Ce citește cititorul de ecran când punctul primește focalizarea. */
  descriere?: string;
};

/** Cât de departe de centru mai prinde degetul punctul, peste raza desenată. */
const MARGINE_ATINGERE = 12;

/**
 * Un punct de pe grafic care se **trage cu mâna**.
 *
 * `PlotPunct` desenează o stare calculată de metodă: se mută fiindcă s-a mutat
 * iterația. Ăsta e invers — el e **intrarea**: nodul de interpolare pe care îl
 * duce utilizatorul, iar restul desenului îl urmează. De aceea are și lucruri
 * pe care celălalt nu le are: prindere cu degetul, focalizare de la tastatură și
 * săgeți.
 *
 * **De ce merge fără ajutor de la `Plot`.** Captura de pointer se cere chiar pe
 * cerc (`setPointerCapture`), deci mișcarea vine tot la el, oriunde ar ajunge
 * degetul — inclusiv în afara graficului. Așa stratul rămâne de sine stătător,
 * cum cere regula straturilor: `Plot` nu știe că există.
 *
 * **Mișcare.** Cât timp e tras, punctul stă **lipit de deget**: orice tranziție
 * l-ar face să rămână în urmă. Când se mută din altă cauză (s-au schimbat
 * nodurile, s-a apăsat o săgeată), alunecă, ca la restul straturilor.
 */
export function PlotPunctTras({
  x,
  y,
  rol = "anterior",
  eticheta,
  raza = 9,
  onMuta,
  limiteX,
  limiteY,
  doarY = false,
  pasTastatura,
  descriere,
}: PlotPunctTrasProps) {
  const plot = usePlot();
  const [tras, setTras] = useState(false);
  /**
   * Focalizarea se ține în stare, nu în CSS: inelul de prindere e un **frate**
   * al cercului care primește focalizarea, iar `focus-visible:` nu poate colora
   * un frate. Fără el, cine navighează cu Tab n-ar vedea unde a ajuns.
   */
  const [focalizat, setFocalizat] = useState(false);

  const px = plot.x.la(x);
  const py = plot.y.la(y);

  const limiteaza = (valoare: number, limite?: readonly [number, number]) =>
    limite ? Math.min(Math.max(valoare, limite[0]), limite[1]) : valoare;

  const dinEveniment = (e: React.PointerEvent<SVGCircleElement>) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    // `Plot` desenează la mărime naturală (fără `viewBox` scalat), deci
    // pixelii ecranului sunt chiar pixelii graficului.
    const cadru = svg.getBoundingClientRect();
    const nou = {
      x: doarY ? x : limiteaza(plot.x.de(e.clientX - cadru.left), limiteX),
      y: limiteaza(plot.y.de(e.clientY - cadru.top), limiteY),
    };
    onMuta(nou);
  };

  const laTasta = (e: React.KeyboardEvent<SVGCircleElement>) => {
    const pasX = pasTastatura ?? (plot.x.domeniu[1] - plot.x.domeniu[0]) / 50;
    const pasY = pasTastatura ?? (plot.y.domeniu[1] - plot.y.domeniu[0]) / 50;
    const mutari: Record<string, { dx: number; dy: number }> = {
      ArrowLeft: { dx: -pasX, dy: 0 },
      ArrowRight: { dx: pasX, dy: 0 },
      ArrowUp: { dx: 0, dy: pasY },
      ArrowDown: { dx: 0, dy: -pasY },
    };
    const mutare = mutari[e.key];
    if (!mutare) return;
    e.preventDefault();
    // Săgeata nu derulează pagina și nici nu ajunge la clipul din capul ei:
    // cât timp punctul are focalizarea, tastele sunt ale lui.
    e.stopPropagation();
    onMuta({
      x: doarY ? x : limiteaza(x + mutare.dx, limiteX),
      y: limiteaza(y + mutare.dy, limiteY),
    });
  };

  return (
    <g>
      <motion.g
        initial={false}
        animate={{ x: px, y: py }}
        // Lipit de deget cât e tras; altfel alunecă, ca `PlotPunct`.
        transition={tras ? { duration: 0 } : tranzitie("rapid")}
      >
        <circle
          r={raza + MARGINE_ATINGERE}
          fill="transparent"
          className="cursor-grab focus-visible:outline-none active:cursor-grabbing"
          tabIndex={0}
          role="button"
          aria-label={descriere ?? `Nodul ${eticheta ?? ""}`}
          // `touch-none`: fără el, degetul derulează pagina în loc să tragă nodul.
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            // Fără asta, un `Plot` interactiv ar începe și el să se miște.
            e.stopPropagation();
            setTras(true);
          }}
          onPointerMove={(e) => {
            if (!tras) return;
            e.stopPropagation();
            dinEveniment(e);
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture(e.pointerId);
            setTras(false);
          }}
          onPointerCancel={() => setTras(false)}
          onFocus={() => setFocalizat(true)}
          onBlur={() => setFocalizat(false)}
          onKeyDown={laTasta}
        />
        {/* Inelul de prindere: se vede doar cât timp nodul e atins sau
            focalizat, ca desenul să nu fie plin de cercuri goale. */}
        <circle
          r={raza + 6}
          fill="none"
          stroke={culoareRol(rol)}
          strokeWidth={2}
          strokeOpacity={tras || focalizat ? 0.75 : 0}
          className="duration-rapid ease-standard transition-[stroke-opacity]"
          pointerEvents="none"
        />
        <circle
          r={raza}
          fill={culoareRol(rol)}
          stroke="var(--suprafata)"
          strokeWidth={2.5}
          pointerEvents="none"
        />
      </motion.g>

      {eticheta && (
        <motion.g
          initial={false}
          animate={{ x: px, y: py }}
          transition={tras ? { duration: 0 } : tranzitie("rapid")}
          aria-hidden="true"
        >
          <text
            x={0}
            y={raza + 22}
            textAnchor="middle"
            className="font-mono text-[15px] tabular-nums"
            fill={culoareEticheta(rol)}
            stroke="var(--suprafata)"
            strokeWidth={4}
            paintOrder="stroke"
            pointerEvents="none"
          >
            {eticheta}
          </text>
        </motion.g>
      )}
    </g>
  );
}
