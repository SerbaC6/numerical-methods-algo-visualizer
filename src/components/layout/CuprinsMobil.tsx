import { ChevronRight } from "lucide-react";
import { NavLink } from "react-router";

import { getSectiuni } from "@/algorithms/registry";

const SECTIUNI_CUPRINS = getSectiuni();

/**
 * Cuprinsul secțiunilor, arătat **doar pe telefon**, în capul paginii
 * principale.
 *
 * Pe ecran lat cardurile stau pe două-trei coloane, deci toate cele patru
 * secțiuni se văd dintr-o privire și un cuprins ar repeta ce e deja pe ecran.
 * Pe telefon coloana e una singură: până la ultima secțiune sunt optsprezece
 * carduri de derulat, iar cine caută integrarea numerică nu are de unde ști cât
 * mai are de mers. De aceea `sm:hidden` — se stinge exact acolo unde grila se
 * rupe în două coloane.
 *
 * Lista vine din `getSectiuni()`, aceeași sursă cu cea din subsol: cuprinsul de
 * aici și cel de jos sunt aceleași secțiuni, în aceeași ordine, către aceleași
 * ancore.
 */
export function CuprinsMobil() {
  return (
    <nav aria-labelledby="cuprins-mobil" className="sm:hidden">
      <h2
        id="cuprins-mobil"
        className="text-text-slab text-sm font-semibold tracking-wide uppercase"
      >
        Cuprins
      </h2>

      {/* `divide-y` în loc de rame pe fiecare rând: patru casete lipite una de
          alta ar desena linii duble între ele. */}
      <ul className="bg-suprafata border-bordura divide-bordura shadow-jos mt-3 divide-y overflow-hidden rounded-xl border">
        {SECTIUNI_CUPRINS.map(({ id, titlu, numarMetode }) => (
          <li key={id}>
            <NavLink
              to={`/#sectiune-${id}`}
              className="hover:bg-fundal/60 focus-visible:ring-ring/50 tinta-atingere flex items-center justify-between gap-3 px-4 py-3 focus-visible:ring-[3px] focus-visible:outline-none"
            >
              <span className="min-w-0">
                <span className="text-text block font-semibold">{titlu}</span>
                {/* Singularul nu e ipotetic: secțiunile se mai sparg, iar „1
                    metode" ar rămâne acolo până îl vede cineva. Peste 19 s-ar
                    cere și „de" („20 de metode"), dar site-ul are 18 pagini cu
                    totul, deci pragul acela nu se poate atinge. */}
                <span className="text-text-slab block text-sm tabular-nums">
                  {numarMetode} {numarMetode === 1 ? "metodă" : "metode"}
                </span>
              </span>
              <ChevronRight className="text-text-slab size-4 shrink-0" aria-hidden="true" />
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
