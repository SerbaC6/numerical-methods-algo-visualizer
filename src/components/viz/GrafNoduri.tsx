import { motion } from "motion/react";

import { useGraf } from "@/components/viz/graf-context";
import { tranzitie } from "@/lib/miscare";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";

export type GrafNoduriProps = {
  /** Numele scrise în noduri: „P1", „P2"… */
  etichete: string[];
  /** Cifra scrisă sub fiecare nod — pe pagina 9, ponderea lui în procente. */
  valori?: string[];
  /** Care noduri se schimbă acum. Portocaliu, plus contur mai gros. */
  active?: boolean[];
  /**
   * Nodul câștigător, evidențiat abia la final. `solutie` e cel mai deschis rol
   * de pe tema întunecată, deci se sprijină și pe **formă**: nodul primește un
   * inel în jur, nu doar altă culoare de contur.
   */
  castigator?: number;
};

/**
 * Nodurile grafului: cercul fiecărei pagini, numele în el și ponderea sub el.
 *
 * Se desenează **peste** muchii (ordinea pictorului), deci vârfurile de săgeată
 * se opresc curat la contur. Raza vine din context, unde e deja calculată din
 * ponderi: aceeași rază o folosesc și muchiile la tăiere, altfel săgeata ar
 * intra sub cerc.
 */
export function GrafNoduri({ etichete, valori, active, castigator }: GrafNoduriProps) {
  const { noduri, raze, latime, inaltime } = useGraf();
  const miscare = tranzitie("mediu");
  const centru = { x: latime / 2, y: inaltime / 2 };

  return (
    <g aria-hidden="true">
      {noduri.map((nod, i) => {
        const raza = raze[i] ?? 0;
        // Cifra se împinge **radial, spre afară**: muchiile trec toate prin
        // interiorul cercului de noduri, deci „sub nod" ar fi exact locul pe
        // unde trec ele. Afară e liber la orice număr de pagini.
        const spreAfara = directieRadiala(nod, centru);
        const esteActiv = active?.[i] ?? false;
        const esteCastigator = castigator === i;
        const rol: RolViz = esteActiv ? "interval" : esteCastigator ? "solutie" : "functie";

        return (
          <g key={i}>
            {/* Inelul câștigătorului: al doilea semnal, pe lângă culoare.
                `solutie` e aproape de culoarea textului pe tema întunecată, deci
                trebuie să se distingă ca formă. */}
            {esteCastigator && (
              <motion.circle
                cx={nod.x}
                cy={nod.y}
                initial={false}
                animate={{ r: raza + 6 }}
                transition={miscare}
                fill="none"
                stroke={culoareRol("solutie")}
                strokeOpacity={0.45}
                strokeWidth={1.5}
              />
            )}

            <motion.circle
              cx={nod.x}
              cy={nod.y}
              initial={false}
              animate={{ r: raza }}
              transition={miscare}
              className="fill-suprafata duration-mediu ease-standard transition-[stroke]"
              stroke={culoareRol(rol)}
              strokeWidth={esteActiv || esteCastigator ? 2.6 : 1.6}
            />

            <text
              x={nod.x}
              y={nod.y}
              dy="0.34em"
              textAnchor="middle"
              className="font-mono text-sm font-bold tabular-nums"
              fill={culoareEticheta(rol)}
            >
              {etichete[i]}
            </text>

            {valori?.[i] !== undefined && (
              // Cifra stă **sub** nod, nu în el: nodul se umflă, iar un text
              // pus înăuntru ar trebui să se micșoreze odată cu paginile slabe,
              // exact cele care au nevoie să rămână citibile.
              <motion.text
                // Atributele rămân 0 fiindcă `x`/`y` din `animate` înseamnă
                // `translateX`/`translateY`, nu atributele: dacă ar fi scrise
                // amândouă, cele două s-ar aduna și cifra ar pleca din desen
                // (regula din README-ul folderului).
                x={0}
                y={0}
                initial={false}
                animate={{
                  x: nod.x + spreAfara.x * (raza + 13),
                  y: nod.y + spreAfara.y * (raza + 13) + 4,
                }}
                transition={miscare}
                textAnchor="middle"
                className="font-mono text-xs tabular-nums"
                fill={culoareEticheta(
                  esteActiv ? "interval" : esteCastigator ? "solutie" : "anterior",
                )}
              >
                {valori[i]}
              </motion.text>
            )}
          </g>
        );
      })}
    </g>
  );
}
