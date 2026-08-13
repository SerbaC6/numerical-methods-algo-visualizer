import { useEffect } from "react";
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
 * La schimbarea rutei pagina pornește de sus. Fără `behavior: "smooth"` —
 * `html { scroll-behavior: smooth }` din `index.css` ar face un derulaj lung
 * și inutil între pagini.
 *
 * Excepția e linkul cu ancoră (breadcrumb-ul de secțiune duce la
 * `/#sectiune-liniare`): acolo se derulează la element, nu în capul paginii.
 * Saltul nativ al browserului nu se produce, fiindcă pe `HashRouter` fragmentul
 * din URL e consumat de router — deci trebuie făcut aici, cu mâna. Decalajul
 * față de header îl dă `scroll-mt-*` de pe titlul secțiunii.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
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
