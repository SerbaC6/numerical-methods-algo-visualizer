import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * La schimbarea rutei pagina pornește de sus. Fără `behavior: "smooth"` —
 * `html { scroll-behavior: smooth }` din `index.css` ar face un derulaj lung
 * și inutil între pagini.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
