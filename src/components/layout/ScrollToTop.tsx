import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router";

/**
 * Cât așteptăm să apară elementul-țintă înainte să renunțăm și să mergem în
 * capul paginii. Nu e o temporizare aleasă din ochi: paginile se încarcă
 * `lazy()`, deci la prima intrare pe o rută efectul rulează cât timp în DOM e
 * încă scheletul din `Suspense`, iar `getElementById` nu găsește nimic. Așteptăm
 * cadru cu cadru până se montează pagina adevărată.
 */
const ASTEPTARE_TINTA_MS = 2000;

/**
 * Unde rămăsese fiecare pagină, pe cale. Hartă în memorie, ca la pozițiile
 * clipurilor: ține cât ține fila deschisă, deci exact cât durează plimbarea
 * înainte-înapoi între pagini, și nu scrie nimic pe disc.
 */
const pozitii = new Map<string, number>();

/**
 * La schimbarea rutei pagina pornește de sus — **în afară de paginile pe care
 * le-ai mai deschis o dată**, unde se așază unde rămăsese. Pe paginile lungi de
 * aici capul paginii e la câteva ecrane distanță de locul din care ai plecat,
 * iar plimbarea „ies o clipă, mă întorc" e cea obișnuită: se pleacă din mijlocul
 * teoriei la cuprins sau la pagina vecină și se revine tot acolo. Nu contează
 * cum te-ai întors — cu butonul „înapoi" al browserului sau printr-un link —,
 * fiindcă poziția înseamnă același lucru în amândouă cazurile.
 *
 * Fără `behavior: "smooth"` — `html { scroll-behavior: smooth }` din
 * `index.css` ar face un derulaj lung și inutil între pagini.
 *
 * Excepția e linkul cu ancoră (breadcrumb-ul de secțiune duce la
 * `/#sectiune-liniare`): acolo se derulează la element, nu în capul paginii.
 * Saltul nativ al browserului nu se produce, fiindcă pe `HashRouter` fragmentul
 * din URL e consumat de router — deci trebuie făcut aici, cu mâna. Decalajul
 * față de header îl dă `scroll-mt-*` de pe titlul secțiunii.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  // Calea și poziția paginii pe care tocmai o părăsim. Amândouă în `ref`-uri,
  // fiindcă se citesc din curățarea efectului, când `pathname` de mai sus e deja
  // cel nou.
  const caleaCurenta = useRef(pathname);
  const ultimaPozitie = useRef(0);

  /*
   * Poziția se notează la plecare, dintr-un `ref`, și în efect **de așezare**.
   * Amândouă amănuntele sunt lecția bugului „mă trimite mereu sus":
   *
   * - **din `ref`, nu din `window.scrollY`.** Când ruta se schimbă, pagina veche
   *   iese din DOM, documentul devine scurt și browserul taie derularea la zero.
   *   O citire făcută după momentul acela dă zero, iar zeroul se scria în hartă
   *   peste poziția bună.
   * - **efect de așezare, nu efect obișnuit.** Efectele obișnuite rulează
   *   *după* desenare, deci după ce browserul a apucat să taie derularea și să
   *   trimită un `scroll` — pe care ascultătorul încă montat îl scria, tot ca
   *   zero, tot pe calea veche. Curățarea unui efect de așezare se face în
   *   timpul aceleiași commit, înainte de desenare, deci ascultătorul e demontat
   *   la timp.
   */
  useLayoutEffect(() => {
    caleaCurenta.current = pathname;
    ultimaPozitie.current = window.scrollY;
    const noteaza = () => {
      ultimaPozitie.current = window.scrollY;
    };
    window.addEventListener("scroll", noteaza, { passive: true });
    return () => {
      window.removeEventListener("scroll", noteaza);
      pozitii.set(caleaCurenta.current, ultimaPozitie.current);
    };
  }, [pathname]);

  useEffect(() => {
    if (!hash) {
      // Pagina se așază unde era, dacă am mai fost pe ea. Poziția se cere cadru
      // cu cadru, din același motiv ca la ancoră — pagina se montează `lazy()`,
      // deci în primul cadru documentul e prea scurt ca să se poată derula.
      const salvata = pozitii.get(pathname);
      if (salvata) {
        const limita = performance.now() + ASTEPTARE_TINTA_MS;
        let cadru = 0;
        const incearca = () => {
          window.scrollTo({ top: salvata, behavior: "instant" });
          if (window.scrollY < salvata && performance.now() < limita) {
            cadru = requestAnimationFrame(incearca);
          }
        };
        cadru = requestAnimationFrame(incearca);
        return () => cancelAnimationFrame(cadru);
      }

      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    const id = hash.slice(1);
    const limita = performance.now() + ASTEPTARE_TINTA_MS;
    let cadru = 0;

    // Cât timp ținta lipsește **nu** derulăm nicăieri: un salt în capul paginii
    // urmat de unul la secțiune s-ar vedea ca o smucitură. Capul paginii rămâne
    // doar plasa de siguranță pentru un fragment care nu există.
    const incearca = () => {
      const tinta = document.getElementById(id);
      if (tinta) {
        tinta.scrollIntoView({ behavior: "instant", block: "start" });
        return;
      }
      if (performance.now() < limita) {
        cadru = requestAnimationFrame(incearca);
        return;
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    };

    cadru = requestAnimationFrame(incearca);
    return () => cancelAnimationFrame(cadru);
  }, [pathname, hash]);

  return null;
}
