import { useMemo } from "react";

import { procent } from "@/algorithms/pagerank/descriere";
import type { PasPageRank, Retea } from "@/algorithms/pagerank/tipuri";
import { Graf } from "@/components/viz/Graf";
import { GrafMuchii } from "@/components/viz/GrafMuchii";
import { GrafNoduri } from "@/components/viz/GrafNoduri";

export type RetauaDePaginiProps = {
  retea: Retea;
  /** Pasul curent al metodei; lipsește cât timp n-a fost calculat niciunul. */
  pas: PasPageRank | undefined;
  /** Adevărat la ultimul pas al unei rulări convergente. */
  laFinal: boolean;
  /** Propoziția pentru cititorul de ecran, compusă în `src/algorithms/`. */
  descriere: string;
  className?: string;
};

/**
 * Rețeaua de pagini, desenată: nodurile umflate după ponderea lor curentă,
 * săgețile link-urilor între ele.
 *
 * Compune straturile din `viz/` pentru pagina 9. Nu conține matematică:
 * ponderile și distribuțiile vin gata calculate din
 * `src/algorithms/pagerank/`, iar aici se decide doar ce se evidențiază.
 *
 * **Ce înseamnă evidențierea.** La un pas de iterație, `v ← G·v` folosește
 * deodată **toate** muchiile, deci „muchia curentă" n-ar fi adevărată. Se
 * evidențiază în schimb pagina care s-a mișcat cel mai mult la pasul acesta și
 * săgețile care intră în ea — adică exact de unde i-a venit ponderea. La final,
 * pagina cu rangul cel mai mare primește rolul `solutie`.
 */
export function RetauaDePagini({ retea, pas, laFinal, descriere, className }: RetauaDePaginiProps) {
  const n = retea.nume.length;
  const distributie = pas?.distributie;

  const marimi = useMemo(() => distributie ?? Array.from({ length: n }, () => 1), [distributie, n]);

  /** Pagina care s-a mișcat cel mai mult față de iterația dinainte. */
  const paginaCareSeMisca = useMemo(() => {
    const anterioara = pas?.distributieAnterioara;
    if (!distributie || !anterioara || laFinal) return null;

    let indice = 0;
    let maxim = -1;
    for (const [i, x] of distributie.entries()) {
      const salt = Math.abs(x - (anterioara[i] ?? 0));
      if (salt > maxim) {
        maxim = salt;
        indice = i;
      }
    }
    // Sub o zecime de procent, „s-a mișcat cel mai mult" nu mai înseamnă nimic:
    // la finalul convergenței toate ponderile stau pe loc.
    return maxim > 0.001 ? indice : null;
  }, [distributie, pas, laFinal]);

  /** Câștigătorul se arată abia la final, și doar dacă e unul singur. */
  const castigator = useMemo(() => {
    if (!laFinal || !distributie) return undefined;
    const maxim = Math.max(...distributie);
    const capete = distributie.filter((x) => Math.abs(x - maxim) < 1e-9).length;
    return capete === 1 ? distributie.indexOf(maxim) : undefined;
  }, [laFinal, distributie]);

  /** Săgețile care intră în pagina evidențiată: `Pj → Pi` există dacă `linkuri[j][i]`. */
  const muchiiActive = useMemo(() => {
    if (paginaCareSeMisca === null) return undefined;
    return retea.linkuri.map((linie, j) =>
      linie.map((are, i) => are && i === paginaCareSeMisca && j !== paginaCareSeMisca),
    );
  }, [paginaCareSeMisca, retea.linkuri]);

  const noduriActive = useMemo(() => {
    if (paginaCareSeMisca === null) return undefined;
    return Array.from({ length: n }, (_, i) => i === paginaCareSeMisca);
  }, [paginaCareSeMisca, n]);

  return (
    <Graf
      nrNoduri={n}
      marimi={marimi}
      rezumat={`Rețeaua de ${n} pagini, cu link-urile dintre ele`}
      descriere={descriere}
      className={className}
    >
      <GrafMuchii linkuri={retea.linkuri} active={muchiiActive} />
      <GrafNoduri
        etichete={retea.nume}
        valori={distributie?.map((x) => procent(x))}
        active={noduriActive}
        castigator={castigator}
      />
    </Graf>
  );
}
