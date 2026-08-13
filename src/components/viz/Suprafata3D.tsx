import { useMemo } from "react";

import { useScena3D } from "@/components/viz/scena-3d-context";
import { normalaCelulei, ordineCelule, umbrire, type Ecran, type Punct3 } from "@/lib/proiectie-3d";
import { culoareRol, type RolViz } from "@/lib/viz-roles";

export type Suprafata3DProps = {
  /** Valoarea funcției într-un punct din planul soluțiilor. */
  inaltime: (x: number, y: number) => number;
  rol?: RolViz;
};

/** Cât de opac e patrulaterul cel mai umbrit și cât adaugă lumina peste el. */
const OPACITATE_BAZA = 0.45;
const OPACITATE_LUMINA = 0.55;

/**
 * Valea, ca height-field: un mesh de patrulatere peste cutia scenei.
 *
 * **Relieful vine din opacitate, nu din culoare.** Paleta e închisă
 * (`CLAUDE.md`), deci nu există „nuanțe de lumină" de inventat: toate fețele
 * sunt `--viz-functie`, iar cât de tare bate lumina pe fiecare devine
 * `fill-opacity`. `umbrire()` ține lumina lipită de cameră, ca fața spre care
 * privești să fie mereu cea luminată.
 *
 * Fețele se desenează de la cea mai depărtată la cea mai apropiată
 * (`ordineCelule`), fiindcă SVG-ul nu are z-buffer. Criteriul de sortare **nu**
 * e adâncimea centrului, ci proiecția lui orizontală — motivul, cu măsurătoarea
 * care îl susține, e scris în `src/lib/proiectie-3d.ts`.
 *
 * **Fără `motion` aici, deliberat.** Mesh-ul nu trece dintr-o stare în alta: el
 * urmărește degetul. Un element animat ar interpola între poziția de acum și
 * cea de acum o clipă, adică suprafața ar rămâne în urma degetului, cu o
 * întârziere care crește cu durata tranziției.
 */
export function Suprafata3D({ inaltime, rol = "functie" }: Suprafata3DProps) {
  const { proiectie, camera, cutie, idTaiere, rezolutieMesh } = useScena3D();
  const n = Math.max(2, Math.round(rezolutieMesh));

  const [x0, x1] = cutie.x;
  const [y0, y1] = cutie.y;

  // Punctele din lume nu depind de cameră: se recalculează doar când se schimbă
  // funcția, cutia sau rezoluția — nu la fiecare cadru de rotire.
  const puncte = useMemo(() => {
    const lista: Punct3[] = [];
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      for (let j = 0; j <= n; j++) {
        const y = y0 + ((y1 - y0) * j) / n;
        lista.push({ x, y, z: inaltime(x, y) });
      }
    }
    return lista;
  }, [n, x0, x1, y0, y1, inaltime]);

  const ordine = useMemo(() => ordineCelule(n, camera.azimut), [n, camera.azimut]);

  const ecran: Ecran[] = puncte.map((p) => proiectie.laEcran(p));
  const culoare = culoareRol(rol);

  const fete: { d: string; opacitate: number }[] = [];
  for (const k of ordine) {
    const i = Math.floor(k / n);
    const j = k % n;

    const i00 = i * (n + 1) + j;
    const i10 = (i + 1) * (n + 1) + j;
    const i11 = (i + 1) * (n + 1) + j + 1;
    const i01 = i * (n + 1) + j + 1;

    const l00 = puncte[i00];
    const l10 = puncte[i10];
    const l11 = puncte[i11];
    const l01 = puncte[i01];
    const e00 = ecran[i00];
    const e10 = ecran[i10];
    const e11 = ecran[i11];
    const e01 = ecran[i01];
    if (!l00 || !l10 || !l11 || !l01 || !e00 || !e10 || !e11 || !e01) continue;

    // O celulă cu valori nefinite (funcție cu pol în cutie) se sare: un `NaN`
    // într-un `d` face browserul să arunce toată calea, nu doar fața aceea.
    if (![e00, e10, e11, e01].every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))) continue;

    fete.push({
      d: `M ${e00.x} ${e00.y} L ${e10.x} ${e10.y} L ${e11.x} ${e11.y} L ${e01.x} ${e01.y} Z`,
      opacitate:
        OPACITATE_BAZA + OPACITATE_LUMINA * umbrire(normalaCelulei(l00, l10, l11, l01), camera),
    });
  }

  return (
    <g aria-hidden="true" clipPath={`url(#${idTaiere})`}>
      {fete.map((fata, index) => (
        // ⚠️ Cheia e **indexul din listă**, nu o cheie stabilă derivată din
        // (i, j) — și asta e intenționat, împotriva regulii obișnuite.
        //
        // Ordinea listei se schimbă la fiecare rotire: aceeași celulă a văii
        // ajunge când pe poziția 3, când pe 900. Cu chei stabile, React ar
        // vedea o listă permutată și ar **muta** ~1 000 de noduri DOM la fiecare
        // cadru, ca să le păstreze ordinea — exact munca cea mai scumpă. Cu chei
        // de index, nodul de pe poziția 3 rămâne unde e și primește doar un `d`
        // și un `fill-opacity` noi.
        //
        // E sigur fiindcă fețele n-au nicio stare proprie: sunt pixeli, nu
        // componente. Dacă vreodată o față capătă stare (hover, selecție),
        // decizia asta trebuie recitită.
        <path
          key={index}
          d={fata.d}
          fill={culoare}
          fillOpacity={fata.opacitate}
          stroke={culoare}
          strokeOpacity={0.35}
          strokeWidth={0.5}
        />
      ))}
    </g>
  );
}
