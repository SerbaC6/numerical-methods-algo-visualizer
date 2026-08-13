import { useEffect, useRef, useState } from "react";

export type Dimensiune = { latime: number; inaltime: number };

/**
 * Dimensiunea reală, în pixeli, a unui element — urmărită cu `ResizeObserver`.
 *
 * `Plot` are nevoie de ea fiindcă desenează la dimensiunea containerului, nu
 * printr-un `viewBox` care se scalează. Diferența se vede la text: cu `viewBox`
 * scalat, etichetele axelor s-ar micșora pe telefon și s-ar umfla pe ecran lat,
 * iar densitatea reperelor n-ar mai putea fi calculată în pixeli.
 *
 * Cât timp elementul n-a fost încă măsurat, întoarce zero pe ambele. Cine
 * desenează trebuie să trateze cazul — la prima randare încă nu există layout.
 */
export function useDimensiune<T extends Element>() {
  const referinta = useRef<T>(null);
  const [dimensiune, setDimensiune] = useState<Dimensiune>({ latime: 0, inaltime: 0 });

  useEffect(() => {
    const element = referinta.current;
    if (!element) return;

    const observator = new ResizeObserver((intrari) => {
      const intrare = intrari[0];
      if (!intrare) return;

      // `contentRect` e deja fără padding și bordură, adică exact zona de desen.
      const { width, height } = intrare.contentRect;

      // Rotunjim la pixel întreg: fără asta, o lățime de 613,328 px ar produce o
      // valoare nouă la fiecare fracțiune de redimensionare și ar re-randa
      // graficul degeaba.
      const latime = Math.round(width);
      const inaltime = Math.round(height);

      setDimensiune((anterioara) =>
        anterioara.latime === latime && anterioara.inaltime === inaltime
          ? anterioara
          : { latime, inaltime },
      );
    });

    observator.observe(element);
    return () => observator.disconnect();
  }, []);

  return { referinta, ...dimensiune };
}
