import { useEffect } from "react";
import { useLocation } from "react-router";

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
    if (hash) {
      const tinta = document.getElementById(hash.slice(1));
      if (tinta) {
        tinta.scrollIntoView({ behavior: "instant", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
