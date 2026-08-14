import { useId, useMemo } from "react";

import { ContextGraf, type ValoareContextGraf } from "@/components/viz/graf-context";
import { useDimensiune } from "@/hooks/use-dimensiune";
import { pozitiiNoduri } from "@/lib/graf-orientat";
import { cn } from "@/lib/utils";

const INALTIME_MINIMA = 240;
const INALTIME_MAXIMA = 420;

/** Raza cercului pe care stau nodurile, ca fracție din jumătatea laturii mici. */
const RAZA_CERC_RELATIVA = 0.62;
/** Raza nodului, ca fracție din aceeași jumătate de latură. */
const RAZA_NOD_RELATIVA = 0.16;
/** Cât de mult se poate umfla sau slăbi un nod față de raza lui de bază. */
const UMFLARE = { minim: 0.72, maxim: 1.32 } as const;

export type GrafProps = {
  /** Câte noduri are graful. Pozițiile le calculează `Graf`, pe cerc. */
  nrNoduri: number;
  /**
   * Cât de „greu" e fiecare nod, ca număr între 0 și 1 — de obicei ponderea lui
   * din distribuția curentă. Nodurile se umflă proporțional, deci mărimea e al
   * doilea semnal, pe lângă cifra scrisă sub ele. Lipsa ei înseamnă noduri egale.
   */
  marimi?: number[];
  /** Numele grafului, citit de cititorul de ecran. Obligatoriu, ca la `Plot`. */
  rezumat: string;
  /** Ce se vede acum: ponderile, muchia pe care se lucrează. */
  descriere?: string;
  inaltimeMaxima?: number;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Graful orientat al rețelei de pagini: nodurile pe cerc, muchiile între ele.
 *
 * **A patra familie de piese vizuale**, după `Plot` (o stare), `Clip` (un film)
 * și `Scena3D` (o stare văzută dintr-un unghi). Ca toate celelalte, nu conține
 * matematică: geometria stă în [`src/lib/graf-orientat.ts`](../../lib/graf-orientat.ts),
 * unde e verificată separat, iar conținutul vine ca straturi copil (`GrafMuchii`,
 * `GrafNoduri`), fiecare cu scara luată din context.
 *
 * Desenul se anunță ca **o singură imagine**: cine nu-l vede primește rezumatul
 * și descrierea, nu treizeci de cercuri și săgeți fără înțeles.
 */
export function Graf({
  nrNoduri,
  marimi,
  rezumat,
  descriere,
  inaltimeMaxima = INALTIME_MAXIMA,
  children,
  className,
}: GrafProps) {
  const { referinta, latime } = useDimensiune<HTMLDivElement>();
  const idBaza = useId();
  const idTitlu = `${idBaza}-titlu`;
  const idDescriere = `${idBaza}-descriere`;

  const inaltime = Math.round(
    Math.min(
      inaltimeMaxima,
      Math.max(INALTIME_MINIMA, latime > 0 ? latime * 0.82 : INALTIME_MINIMA),
    ),
  );

  const context = useMemo<ValoareContextGraf | null>(() => {
    if (latime <= 0) return null;

    const centru = { x: latime / 2, y: inaltime / 2 };
    const semi = Math.min(latime, inaltime) / 2;
    const razaCerc = semi * RAZA_CERC_RELATIVA;

    // Nodul se măsoară **și** față de distanța dintre doi vecini de pe cerc, nu
    // doar față de mărimea desenului: cu patru pagini vecinii stau la 1,41·R, iar
    // un cerc dimensionat doar din lățime ajunge să-i atingă — muchiile n-ar mai
    // avea pe unde ieși. Ce rămâne până la margine e loc pentru nodul umflat la
    // maximum și pentru cifra scrisă sub el.
    const laturaVecini = 2 * razaCerc * Math.sin(Math.PI / Math.max(nrNoduri, 2));
    const razaNod = Math.min(semi * RAZA_NOD_RELATIVA, laturaVecini * 0.32);

    const maxim = Math.max(...(marimi ?? [0]), 0);
    const raze = Array.from({ length: nrNoduri }, (_, i) => {
      if (!marimi || maxim <= 0) return razaNod;
      const relativ = Math.min(1, Math.max(0, (marimi[i] ?? 0) / maxim));
      return razaNod * (UMFLARE.minim + (UMFLARE.maxim - UMFLARE.minim) * relativ);
    });

    return {
      noduri: pozitiiNoduri(nrNoduri, centru, razaCerc),
      raze,
      latime,
      inaltime,
    };
  }, [latime, inaltime, nrNoduri, marimi]);

  return (
    // `min-w-0` — fără el, graful pus într-un grid refuză să se micșoreze sub
    // lățimea conținutului și împinge pagina.
    <figure className={cn("m-0 min-w-0", className)}>
      <div ref={referinta} className="w-full" style={{ minHeight: INALTIME_MINIMA }}>
        {context && (
          <svg
            width={latime}
            height={inaltime}
            role="img"
            aria-labelledby={idTitlu}
            aria-describedby={descriere ? idDescriere : undefined}
            className="block overflow-visible"
          >
            <title id={idTitlu}>{rezumat}</title>
            {descriere && <desc id={idDescriere}>{descriere}</desc>}

            <ContextGraf.Provider value={context}>{children}</ContextGraf.Provider>
          </svg>
        )}
      </div>
    </figure>
  );
}
