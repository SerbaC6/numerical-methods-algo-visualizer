import { useMemo } from "react";

import { useScena3D } from "@/components/viz/scena-3d-context";
import {
  normalaCelulei,
  opacitateSuprafata,
  ordineCelule,
  umbrire,
  type Ecran,
  type Punct3,
} from "@/lib/proiectie-3d";
import { culoareRol, type RolViz } from "@/lib/viz-roles";

export type Suprafata3DProps = {
  /** Valoarea funcției într-un punct din planul soluțiilor. */
  inaltime: (x: number, y: number) => number;
  rol?: RolViz;
};

/**
 * Cât de opac e patrulaterul cel mai umbrit și cât adaugă lumina peste el.
 *
 * **Aceleași valori pe amândouă temele, și e o decizie, nu o scăpare.** Valea e
 * fundal, nu subiect: peste ea se desenează traseul, săgeata și punctele, iar
 * sub ea stau podeaua și curbele de nivel — adică tocmai harta din care se
 * citește unghiul dintre doi pași.
 *
 * Măsurat, cu suprafața opacă nu se vedea nici ce e peste, nici ce e sub ea:
 *
 * | ce se compară                                     | la 60–100 %   | la 16–38 % |
 * | ------------------------------------------------- | ------------- | ---------- |
 * | săgeata pasului / vale (luminoasă)                | 1,08:1        | 1,79:1     |
 * | curba de nivel văzută prin vale (întunecată)      | 1,45:1 → 1,00 | 2,80–3,35  |
 *
 * Ultima linie e cea care a decis: pe tema întunecată, cercul portocaliu al
 * curbei curente dispărea complet sub mesh.
 *
 * Costul, declarat: conturul văii scade sub 3:1 față de card. Silueta se citește
 * atunci din grila podelei și din curbele de nivel, care au acum 3,82:1 și
 * 3,39:1 — nu din umplere.
 */
const OPACITATE = { baza: 0.16, lumina: 0.22 } as const;

/**
 * Sub atâta opacitate mesh-ul nu se mai randează deloc.
 *
 * Nu e o optimizare oarecare: la privirea de sus dispar ~1 000 de `<path>`
 * exact în momentul în care utilizatorul începe să se uite la harta de nivel de
 * dedesubt. Pragul e mic dinadins — peste el fețele chiar se văd.
 */
const OPACITATE_MINIMA = 0.02;

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
 * **Se stinge când privirea urcă.** Peste `ELEVATIE_ESTOMPARE` opacitatea
 * întregului mesh scade, iar la 90° suprafața dispare cu totul: acolo scena e
 * chiar harta de curbe de nivel, pe care un mesh opac ar acoperi-o. Opacitatea
 * vine din `opacitateSuprafata()`, ca și pragul — aici nu se decide nimic.
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

  // Cât urcă privirea, valea se dă la o parte de pe harta ei de nivel — motivul
  // stă la `opacitateSuprafata`. Aproape de zero nu se mai desenează nimic:
  // fețele n-ar mai fi vizibile, dar ar rămâne ~1 000 de `<path>` de mutat la
  // fiecare cadru de rotire.
  const opacitateScena = opacitateSuprafata(camera.elevatie);
  if (opacitateScena < OPACITATE_MINIMA) return null;

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
        OPACITATE.baza + OPACITATE.lumina * umbrire(normalaCelulei(l00, l10, l11, l01), camera),
    });
  }

  return (
    <g aria-hidden="true" clipPath={`url(#${idTaiere})`} opacity={opacitateScena}>
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
