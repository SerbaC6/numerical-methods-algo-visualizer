import { animate, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { CURBE, DURATE } from "@/lib/miscare";
import {
  CAMERA_DE_SUS,
  CAMERA_IMPLICITA,
  normalizeazaCamera,
  roteste,
  type Camera,
} from "@/lib/proiectie-3d";

/** Cât se rotește scena la o apăsare de săgeată, și cât cu Shift apăsat. */
const PAS_TASTA = 5 * (Math.PI / 180);
const PAS_TASTA_MARE = 15 * (Math.PI / 180);

export type StareCamera3D = {
  camera: Camera;
  /**
   * Scena e trasă chiar acum cu degetul sau cu mouse-ul.
   *
   * Cine desenează are nevoie de asta din două motive: să coboare rezoluția
   * mesh-ului cât timp se rotește și să treacă marcajele animate pe salt —
   * o tranziție între două poziții de ecran care se schimbă oricum din altă
   * cauză face marcajul să plutească pe lângă suprafață.
   */
  inMiscare: boolean;
  /** Începe o rotire trasă: oprește o eventuală revenire animată. */
  incepeRotirea: () => void;
  /** Deplasarea de la ultimul eveniment, în pixeli. Se comite pe cadrul următor. */
  rotesteCuPixeli: (dx: number, dy: number) => void;
  terminaRotirea: () => void;
  /** Rotire de la tastatură, în radiani, aplicată imediat. */
  rotesteCuUnghi: (dAzimut: number, dElevatie: number) => void;
  /** Duce camera la un unghi anume, lin (sau dintr-o bucată la mișcare redusă). */
  mergiLa: (tinta: Camera) => void;
  /** Camera e deja la privirea de sus? Butonul se dezactivează după asta. */
  estePrivireDeSus: boolean;
  /** Pașii de tastatură, expuși ca să nu fie rescriși în componentă. */
  pasTasta: { normal: number; mare: number };
  unghiuriGata: { implicit: Camera; deSus: Camera };
};

/** Diferența de azimut pe drumul cel mai scurt, în intervalul (−π, π]. */
function diferentaUnghi(de: number, la: number): number {
  const tura = 2 * Math.PI;
  return ((((la - de + Math.PI) % tura) + tura) % tura) - Math.PI;
}

/**
 * Starea camerei unei scene 3D: unde privește, cum se trage de ea, cum revine.
 *
 * **Camera se comite pe `requestAnimationFrame`, nu pe eveniment.** Un
 * `pointermove` de pe un ecran la 120 Hz ar cere 120 de randări pe secundă, iar
 * fiecare randare re-proiectează tot mesh-ul. Evenimentele scriu deci într-un
 * `ref` și un singur cadru pe frame aplică suma deplasărilor — cum se face și cu
 * derularea.
 *
 * **Nu există rotire automată în repaus.** O scenă care se învârte singură cere
 * atenție continuă, se bate cu explicația de lângă ea și e exact ce interzice
 * `prefers-reduced-motion`. Scena stă unde a lăsat-o utilizatorul.
 *
 * Revenirea la un unghi (butoanele „Unghi implicit" / „Privește de sus") e
 * animată, fiindcă acolo drumul chiar spune ceva: se vede din ce parte se
 * ridică privirea. La `prefers-reduced-motion` sare direct pe valoare — același
 * tipar ca `useDomeniuAnimat`.
 */
export function useCamera3D(initiala: Camera = CAMERA_IMPLICITA): StareCamera3D {
  const redusa = useReducedMotion();

  const [camera, setCamera] = useState<Camera>(() => normalizeazaCamera(initiala));
  // Valoarea vie a camerei, ținută și în afara stării: deplasările se adună
  // peste ea între două randări, iar o animație întreruptă pornește de unde a
  // ajuns, nu de la ultima randare.
  const curenta = useRef<Camera>(camera);
  const [inMiscare, setInMiscare] = useState(false);

  const asteapta = useRef<{ dx: number; dy: number } | null>(null);
  const cadru = useRef<number | null>(null);
  const revenire = useRef<{ stop: () => void } | null>(null);

  const aplica = useCallback((noua: Camera) => {
    curenta.current = noua;
    setCamera(noua);
  }, []);

  const opresteRevenirea = useCallback(() => {
    revenire.current?.stop();
    revenire.current = null;
  }, []);

  // Cadrul programat și animația în curs se anulează la demontare: altfel un
  // `setState` ar cădea pe o componentă care nu mai există.
  useEffect(() => {
    return () => {
      if (cadru.current !== null) cancelAnimationFrame(cadru.current);
      revenire.current?.stop();
    };
  }, []);

  const programeaza = useCallback(() => {
    if (cadru.current !== null) return;
    cadru.current = requestAnimationFrame(() => {
      cadru.current = null;
      const deplasare = asteapta.current;
      asteapta.current = null;
      if (!deplasare) return;
      aplica(roteste(curenta.current, deplasare.dx, deplasare.dy));
    });
  }, [aplica]);

  const incepeRotirea = useCallback(() => {
    opresteRevenirea();
    asteapta.current = null;
    setInMiscare(true);
  }, [opresteRevenirea]);

  const rotesteCuPixeli = useCallback(
    (dx: number, dy: number) => {
      const acum = asteapta.current;
      asteapta.current = acum ? { dx: acum.dx + dx, dy: acum.dy + dy } : { dx, dy };
      programeaza();
    },
    [programeaza],
  );

  const terminaRotirea = useCallback(() => {
    setInMiscare(false);
  }, []);

  const rotesteCuUnghi = useCallback(
    (dAzimut: number, dElevatie: number) => {
      opresteRevenirea();
      aplica(
        normalizeazaCamera({
          azimut: curenta.current.azimut + dAzimut,
          elevatie: curenta.current.elevatie + dElevatie,
        }),
      );
    },
    [aplica, opresteRevenirea],
  );

  const mergiLa = useCallback(
    (tinta: Camera) => {
      opresteRevenirea();
      const de = curenta.current;
      const la = normalizeazaCamera(tinta);

      if (redusa) {
        aplica(la);
        return;
      }

      // Azimutul se interpolează pe drumul cel mai scurt: de la 350° la 10°
      // scena trebuie să treacă prin 0°, nu să facă aproape o tură înapoi.
      const dAzimut = diferentaUnghi(de.azimut, la.azimut);
      const dElevatie = la.elevatie - de.elevatie;
      if (Math.abs(dAzimut) < 1e-6 && Math.abs(dElevatie) < 1e-6) return;

      revenire.current = animate(0, 1, {
        duration: DURATE.lent,
        ease: CURBE.standard,
        onUpdate: (t) => {
          aplica(
            normalizeazaCamera({
              azimut: de.azimut + dAzimut * t,
              elevatie: de.elevatie + dElevatie * t,
            }),
          );
        },
        onComplete: () => {
          revenire.current = null;
          aplica(la);
        },
      });
    },
    [aplica, opresteRevenirea, redusa],
  );

  return {
    camera,
    inMiscare,
    incepeRotirea,
    rotesteCuPixeli,
    terminaRotirea,
    rotesteCuUnghi,
    mergiLa,
    estePrivireDeSus: Math.abs(camera.elevatie - CAMERA_DE_SUS.elevatie) < 1e-6,
    pasTasta: { normal: PAS_TASTA, mare: PAS_TASTA_MARE },
    unghiuriGata: { implicit: CAMERA_IMPLICITA, deSus: CAMERA_DE_SUS },
  };
}
