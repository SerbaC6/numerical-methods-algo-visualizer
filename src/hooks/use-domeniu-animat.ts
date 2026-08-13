import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { CURBE, DURATE } from "@/lib/miscare";
import type { Domeniu } from "@/lib/plot-scara";

/**
 * Domeniul unui grafic, dus lin de la valoarea veche la cea nouă.
 *
 * Se folosește acolo unde încadrarea se schimbă singură între pași — la lupa
 * din `plot-urmarire.ts`. Fără el, apropierea ar fi o tăietură: într-un cadru
 * curba, banda și etichetele axelor sunt într-un fel, în cadrul următor în
 * altul, iar ochiul pierde legătura dintre ele.
 *
 * **Lățimea se interpolează geometric, nu liniar.** O apropiere de patru ori,
 * împărțită în pași egali ca diferență, pare că frânează brusc la final:
 * primele cadre înghit aproape tot drumul. Împărțită în pași egali ca *raport*,
 * viteza aparentă a apropierii rămâne constantă — cum se comportă și zoomul
 * unui aparat foto.
 *
 * `prefers-reduced-motion` sare peste tot drumul și pune direct valoarea nouă:
 * cine a cerut mai puțină mișcare primește tăietura, nu glisarea.
 */
export function useDomeniuAnimat(tinta: Domeniu, treapta: keyof typeof DURATE = "lent"): Domeniu {
  const redusa = useReducedMotion();
  const [domeniu, setDomeniu] = useState<Domeniu>(tinta);
  // Valoarea afișată acum, ținută și în afara stării: animația următoare
  // pornește de unde a ajuns cea întreruptă, nu de la ultima randare.
  const curent = useRef<Domeniu>(tinta);

  const [tintaMin, tintaMax] = tinta;

  useEffect(() => {
    const [deMin, deMax] = curent.current;
    if (deMin === tintaMin && deMax === tintaMax) return;

    const laFinal = () => {
      curent.current = [tintaMin, tintaMax];
      setDomeniu(curent.current);
    };

    const latimeDe = deMax - deMin;
    const latimeLa = tintaMax - tintaMin;

    if (redusa || latimeDe <= 0 || latimeLa <= 0) {
      laFinal();
      return;
    }

    const centruDe = (deMin + deMax) / 2;
    const centruLa = (tintaMin + tintaMax) / 2;
    const raport = latimeLa / latimeDe;

    const control = animate(0, 1, {
      duration: DURATE[treapta],
      ease: CURBE.standard,
      onUpdate: (t) => {
        const centru = centruDe + (centruLa - centruDe) * t;
        const latime = latimeDe * raport ** t;
        curent.current = [centru - latime / 2, centru + latime / 2];
        setDomeniu(curent.current);
      },
      onComplete: laFinal,
    });

    return () => control.stop();
  }, [tintaMin, tintaMax, redusa, treapta]);

  return domeniu;
}
