import { motion } from "motion/react";

import { useScena3D } from "@/components/viz/scena-3d-context";
import { tranzitie } from "@/lib/miscare";
import { inCutieXY, poliliniiTaiate, type Ecran, type Punct3 } from "@/lib/proiectie-3d";
import { culoareRol } from "@/lib/viz-roles";

export type Traiectorie3DProps = {
  /** Iterațiile, cu `z` deja evaluat: `z = f(x₁, x₂)`. */
  puncte: readonly Punct3[];
  /** Indicele iterației arătate acum. Ce vine după ea nu se desenează. */
  pasCurent: number;
  /** Umbra drumului pe podea și liniile de cădere se pot stinge. */
  cuUmbra?: boolean;
  /**
   * Ce parte se desenează acum — la fel ca `strat` din `PlotInterval`, și din
   * același motiv: cele două bucăți ale traiectoriei stau de o parte și de alta
   * a suprafeței. Umbra e pe podea, deci trebuie desenată **sub** mesh; traseul
   * și punctele trebuie să rămână **peste** el, altfel dispar în vale. Cu un
   * singur element n-ai unde pune mesh-ul.
   */
  strat?: "tot" | "umbra" | "traseu";
  raza?: number;
};

/**
 * Cât se ridică drumul deasupra suprafeței, în fracțiune din înălțimea cutiei.
 *
 * Fără ridicare, segmentele dintre două iterații intră în mesh și dispar pe
 * porțiuni: la un height-field desenat cu algoritmul pictorului, o linie care
 * atinge exact suprafața e când deasupra, când dedesubt, după cum cade fața.
 */
const RIDICARE = 0.015;

const finit = (p: Ecran) => Number.isFinite(p.x) && Number.isFinite(p.y);

/**
 * Drumul coborârii: umbra pe podea, liniile de cădere, traseul pe suprafață și
 * punctele iterațiilor.
 *
 * Umbra există fiindcă altfel nu se poate citi **unde** în planul soluțiilor a
 * ajuns iterația: un punct suspendat pe o suprafață oblică nu spune nimic despre
 * `x₁` și `x₂`. Liniile de cădere sunt paralele pe ecran, oricare ar fi
 * punctul — proprietate a proiecției ortografice, scrisă în `proiectie-3d.ts` —
 * deci legătura punct ↔ umbră se vede fără să fie ghicită.
 */
export function Traiectorie3D({
  puncte,
  pasCurent,
  cuUmbra = true,
  strat = "tot",
  raza = 7,
}: Traiectorie3DProps) {
  const { proiectie, cutie, idTaiere, inMiscare } = useScena3D();

  const zPodea = cutie.z[0];
  const ridicare = RIDICARE * (cutie.z[1] - cutie.z[0]);

  const pana = Math.max(0, Math.min(pasCurent, puncte.length - 1));
  const vizibile = puncte.slice(0, pana + 1);
  if (vizibile.length === 0) return null;

  /**
   * Drumul se taie la **cutia scenei**, nu la marginea SVG-ului.
   *
   * Când lupa se apropie, iterațiile de la începutul rulării ies din cutie, iar
   * proiecția fiind liniară nu le duce „undeva lângă", ci foarte departe — până
   * la ordinul miliardelor de pixeli. Fără tăierea asta, segmentul până la ele
   * rămâne desenat și se vede ca o linie care intră din afara cadrului și nu
   * duce nicăieri. Motivul complet, cu cifrele măsurate, stă la
   * `taieLaCutieXY`.
   */
  const caleTaiata = (inaltimea: (p: Punct3) => number) =>
    poliliniiTaiate(
      vizibile.map((p) => ({ x: p.x, y: p.y, z: inaltimea(p) })),
      cutie,
    )
      .map((bucata) =>
        bucata
          .map((p) => proiectie.laEcran(p))
          .filter(finit)
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" "),
      )
      .join(" ");

  const inauntru = vizibile.map((p) => inCutieXY(p, cutie));

  const peSuprafata: Ecran[] = vizibile.map((p) =>
    proiectie.laEcran({ x: p.x, y: p.y, z: p.z + ridicare }),
  );
  const peUmbra: Ecran[] = vizibile.map((p) => proiectie.laEcran({ x: p.x, y: p.y, z: zPodea }));

  const curent = peSuprafata[peSuprafata.length - 1];

  /**
   * Punctul curent e singurul care se animează — și numai când scena stă.
   *
   * Cât timp utilizatorul rotește, poziția lui pe ecran se schimbă din **altă**
   * cauză decât un pas nou. O tranziție ar interpola atunci între două poziții
   * care se mișcă amândouă, iar punctul ar rămâne în urma suprafeței pe care ar
   * trebui să stea: s-ar vedea plutind pe lângă vale. Pe salt, el rămâne lipit
   * de mesh, care oricum urmărește degetul fără animație.
   */
  const miscare = inMiscare ? { duration: 0 } : tranzitie("lent");

  return (
    <g aria-hidden="true" clipPath={`url(#${idTaiere})`}>
      {cuUmbra && strat !== "traseu" && (
        <>
          {/* Umbra drumului pe podea */}
          <path
            d={caleTaiata(() => zPodea)}
            fill="none"
            stroke={culoareRol("anterior")}
            strokeOpacity={0.7}
            strokeWidth={1.75}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Liniile de cădere: de la fiecare iterație la umbra ei. Doar pentru
              punctele din fereastra scenei — o cădere pornită din afara cutiei
              n-ar avea capătul de sus nicăieri pe ecran. */}
          <g stroke={culoareRol("grila")} strokeWidth={1} strokeDasharray="3 4" opacity={0.7}>
            {peSuprafata.map((p, i) => {
              const umbra = peUmbra[i];
              if (!umbra || !inauntru[i]) return null;
              return <line key={i} x1={p.x} y1={p.y} x2={umbra.x} y2={umbra.y} />;
            })}
          </g>
        </>
      )}

      {strat === "umbra" ? null : (
        <>
          {/* Drumul pe suprafață, cu halou.
              Haloul nu e ornament: traseul trece peste vale, iar valea e din
              aceeași familie de albastruri. Măsurat, pe tema luminoasă traseul
              ieșea la 1,31:1 față de suprafața de sub el, iar pe cea întunecată
              săgeata pasului la 1,13:1 — adică linia se pierdea în vale. Un
              contur în culoarea cardului o desprinde de orice fundal, exact
              trucul folosit deja la etichete și la punctele iterațiilor. */}
          <path
            d={caleTaiata((p) => p.z + ridicare)}
            fill="none"
            stroke="var(--suprafata)"
            strokeWidth={6}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={caleTaiata((p) => p.z + ridicare)}
            fill="none"
            stroke={culoareRol("anterior")}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Iterațiile trecute, tot doar cele din fereastră */}
          <g fill={culoareRol("anterior")} stroke="var(--suprafata)" strokeWidth={2}>
            {peSuprafata
              .slice(0, -1)
              .map((p, i) =>
                inauntru[i] ? <circle key={i} cx={p.x} cy={p.y} r={raza * 0.7} /> : null,
              )}
          </g>

          {/* Iterația curentă */}
          {curent && (
            <motion.g
              // Fără `initial={false}` punctul ar veni alunecând din colțul din
              // stânga-sus la prima randare — un drum fără sens matematic.
              initial={false}
              animate={{ x: curent.x, y: curent.y }}
              transition={miscare}
            >
              <circle
                r={raza}
                fill={culoareRol("curent")}
                stroke="var(--suprafata)"
                strokeWidth={2.5}
              />
            </motion.g>
          )}
        </>
      )}
    </g>
  );
}
