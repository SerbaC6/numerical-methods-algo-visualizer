import { useCallback, useState } from "react";

import { mutaDomeniu, zoomDomeniu, type Domeniu } from "@/lib/plot-scara";

export type Vedere = { x: Domeniu; y: Domeniu };

/**
 * Vederea curentă a unui grafic: ce bucată din plan se vede acum.
 *
 * Cât timp utilizatorul n-a mișcat nimic, starea e `null`, iar graficul arată
 * exact domeniul dat de pagină. Asta contează: dacă vederea ar fi copiată în
 * stare de la început, o schimbare de parametru din pagină n-ar mai ajunge pe
 * ecran — graficul ar rămâne înțepenit în încadrarea veche.
 *
 * Din același motiv „încadrează tot" nu calculează nimic: șterge vederea și
 * lasă din nou pagina să decidă.
 */
export function useVederePlot(domeniuX: Domeniu, domeniuY: Domeniu) {
  const [vedere, setVedere] = useState<Vedere | null>(null);

  const x = vedere?.x ?? domeniuX;
  const y = vedere?.y ?? domeniuY;

  const reseteaza = useCallback(() => setVedere(null), []);

  /** Apropie (`factor < 1`) sau depărtează, ținând pe loc valorile-ancoră. */
  const zoom = useCallback(
    (factor: number, ancoraX: number, ancoraY: number) => {
      setVedere((precedenta) => {
        const curenta = precedenta ?? { x: domeniuX, y: domeniuY };
        return {
          x: zoomDomeniu(curenta.x, factor, ancoraX),
          y: zoomDomeniu(curenta.y, factor, ancoraY),
        };
      });
    },
    [domeniuX, domeniuY],
  );

  const muta = useCallback(
    (deltaX: number, deltaY: number) => {
      setVedere((precedenta) => {
        const curenta = precedenta ?? { x: domeniuX, y: domeniuY };
        return { x: mutaDomeniu(curenta.x, deltaX), y: mutaDomeniu(curenta.y, deltaY) };
      });
    },
    [domeniuX, domeniuY],
  );

  return { x, y, modificata: vedere !== null, reseteaza, zoom, muta };
}
