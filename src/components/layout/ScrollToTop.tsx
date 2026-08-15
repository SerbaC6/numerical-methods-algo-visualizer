import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router";

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
 * La schimbarea rutei pagina pornește de sus — **în afară de întoarcerea
 * înapoi**, unde se așază unde rămăsese. Butonul „înapoi" al browserului nu
 * înseamnă „încă o pagină nouă", ci „unde eram", iar pe paginile lungi de aici
 * capul paginii e la câteva ecrane distanță de locul din care ai plecat.
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
  const tipNavigare = useNavigationType();

  // Poziția paginii pe care tocmai o părăsim. Se ține într-un `ref` fiindcă
  // efectul de curățare rulează **după** ce ruta s-a schimbat, deci `pathname`
  // de acolo e deja cel nou.
  const caleaCurenta = useRef(pathname);
  useEffect(() => {
    caleaCurenta.current = pathname;
    const noteaza = () => pozitii.set(caleaCurenta.current, window.scrollY);
    window.addEventListener("scroll", noteaza, { passive: true });
    return () => {
      noteaza();
      window.removeEventListener("scroll", noteaza);
    };
  }, [pathname]);

  useEffect(() => {
    if (!hash) {
      // Întoarcerea înapoi: pagina se așază unde era. Poziția se cere cadru cu
      // cadru, din același motiv ca la ancoră — pagina se montează `lazy()`,
      // deci în primul cadru documentul e prea scurt ca să se poată derula.
      const salvata = tipNavigare === "POP" ? pozitii.get(pathname) : undefined;
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
  }, [pathname, hash, tipNavigare]);

  return null;
}
