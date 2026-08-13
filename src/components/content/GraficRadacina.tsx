import { useMemo } from "react";

import type { FunctieTest } from "@/algorithms/functii";
import type { PasRadacina } from "@/algorithms/tipuri";
import { Plot } from "@/components/viz/Plot";
import { PlotCurba } from "@/components/viz/PlotCurba";
import { PlotInterval } from "@/components/viz/PlotInterval";
import { PlotPunct } from "@/components/viz/PlotPunct";
import { zecimale } from "@/lib/numere";
import { esantioneaza, sparge } from "@/lib/plot-esantionare";
import { incadreaza, type Domeniu } from "@/lib/plot-scara";

export type GraficRadacinaProps = {
  functie: FunctieTest;
  pasi: PasRadacina[];
  /** Pasul afișat acum, 0-indexat. */
  pasCurent: number;
  /** Intervalul de pornire — dă încadrarea, ca desenul să nu sară între pași. */
  intervalInitial: readonly [number, number];
};

/** Câte iterații anterioare rămân pe desen, tot mai șterse. */
const URME = 6;

/**
 * Desenul unei metode de căutare a rădăcinii: curba, intervalul curent și
 * punctul calculat la pasul acesta.
 *
 * **Nu conține matematică.** Primește `pasi[]` gata calculați din
 * `src/algorithms/` și doar îi așază pe axe — regula de separare din
 * `CLAUDE.md`.
 *
 * Încadrarea se calculează **o singură dată**, din intervalul de pornire, nu din
 * pasul curent. Dacă domeniul s-ar strânge odată cu intervalul, curba ar părea
 * că se mișcă la fiecare pas, iar impresia de „intervalul se înjumătățește" —
 * adică toată ideea bisecției — s-ar pierde: banda ar rămâne mereu la fel de
 * lată pe ecran.
 */
export function GraficRadacina({ functie, pasi, pasCurent, intervalInitial }: GraficRadacinaProps) {
  const pas = pasi[pasCurent];

  const { domeniuX, domeniuY, segmente } = useMemo(() => {
    const [a, b] = intervalInitial;
    const latime = Math.abs(b - a) || 1;
    // Puțin peste capete, ca paranteza intervalului să nu stea lipită de rama
    // graficului chiar la primul pas.
    const brut: Domeniu = [Math.min(a, b) - latime * 0.08, Math.max(a, b) + latime * 0.08];

    // Funcțiile cu domeniu mărginit (ln, √) nu se evaluează în afara lui.
    const limita = functie.domeniuValid;
    const dx: Domeniu = limita
      ? [Math.max(brut[0], limita[0]), Math.min(brut[1], limita[1])]
      : brut;

    const puncte = esantioneaza(functie.f, dx, 260);
    const dy = incadreaza(
      puncte.map((p) => p.y).filter((y) => Number.isFinite(y)),
      0.12,
    );

    return {
      domeniuX: dx,
      domeniuY: dy,
      segmente: sparge(puncte, { inaltimeVizibila: dy[1] - dy[0] }),
    };
  }, [functie, intervalInitial]);

  const anterioare = pasi.slice(Math.max(0, pasCurent - URME), pasCurent);

  return (
    <Plot
      domeniuX={domeniuX}
      domeniuY={domeniuY}
      inaltime={380}
      rezumat={`Căutarea rădăcinii pentru ${functie.eticheta}`}
      descriere={
        pas
          ? `Pasul ${pas.iteratie} din ${pasi.length}.` +
            (pas.interval
              ? ` Intervalul e de la ${zecimale(pas.interval.a, 4)} la ${zecimale(pas.interval.b, 4)}.`
              : "") +
            ` Aproximarea curentă e ${zecimale(pas.x, 6)}, unde funcția ia valoarea ${zecimale(pas.fx, 6)}.`
          : "Nu s-a calculat încă niciun pas."
      }
    >
      {/* Ordinea straturilor e ordinea de desenare: intervalul dedesubt, ca
          umbrire, apoi curba, apoi punctele peste ea. */}
      {pas?.interval && (
        <PlotInterval
          de={pas.interval.a}
          la={pas.interval.b}
          etichetaDe="a"
          etichetaLa="b"
          eticheta={`[${zecimale(pas.interval.a, 3)} ; ${zecimale(pas.interval.b, 3)}]`}
        />
      )}

      <PlotCurba segmente={segmente} halou />

      {/* Iterațiile dinainte, tot mai șterse pe măsură ce se depărtează: se
          vede drumul, nu doar poziția de acum. */}
      {anterioare.map((p, i) => (
        <PlotPunct
          key={p.iteratie}
          x={p.x}
          y={p.fx}
          rol="anterior"
          raza={5}
          opacitate={0.25 + (0.45 * (i + 1)) / anterioare.length}
        />
      ))}

      {pas && (
        <PlotPunct
          x={pas.x}
          y={pas.fx}
          rol="curent"
          proiectie
          eticheta={`x${indice(pas.iteratie)}`}
        />
      )}
    </Plot>
  );
}

/** `12` → `„₁₂"`. Indicii se scriu ca în curs, jos, nu ca „x_12". */
function indice(n: number): string {
  const CIFRE = "₀₁₂₃₄₅₆₇₈₉";
  return [...String(n)].map((c) => CIFRE[Number(c)] ?? c).join("");
}
