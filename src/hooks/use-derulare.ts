import { useCallback, useEffect, useRef, useState } from "react";

import type { Viteza } from "@/lib/playback";

/** Cât stă pe un pas la viteza 1×, în milisecunde. */
const DURATA_PAS = 1100;

export type Derulare = {
  pas: number;
  ruleaza: boolean;
  viteza: Viteza;
  setPas: (pas: number) => void;
  setRuleaza: (ruleaza: boolean) => void;
  setViteza: (viteza: Viteza) => void;
};

/**
 * Starea derulării pas cu pas: ce pas se vede, dacă merge singură și cât de
 * repede.
 *
 * Stă într-un hook, nu în componentă, din două motive. Întâi, cronometrul are
 * nevoie de curățenie la demontare, iar uitată acolo ar ține pagina trează după
 * ce utilizatorul a plecat de pe ea. Al doilea, aceeași derulare o vor folosi
 * toate cele paisprezece pagini de metodă.
 *
 * **Pauza la ultimul pas e intenționată.** Bucla la infinit ar fi arătat bine,
 * dar aici finalul chiar înseamnă ceva — metoda a convers, sau a rămas fără
 * iterații. Reluat automat, momentul ăla s-ar pierde.
 */
export function useDerulare(totalPasi: number, vitezaInitiala: Viteza = 1): Derulare {
  const [pas, setPasBrut] = useState(0);
  const [ruleaza, setRuleaza] = useState(false);
  const [viteza, setViteza] = useState<Viteza>(vitezaInitiala);

  const ultimul = Math.max(totalPasi - 1, 0);

  // Ținem pasul în interval fără să declanșăm o randare în plus: dacă lista de
  // pași se scurtează (alt parametru, altă funcție), pasul curent poate rămâne
  // în afara ei.
  const pasSigur = Math.min(pas, ultimul);

  const setPas = useCallback(
    (nou: number) => {
      setPasBrut(Math.max(0, Math.min(nou, Math.max(totalPasi - 1, 0))));
    },
    [totalPasi],
  );

  // Lista de pași s-a schimbat din temelii: o luăm de la capăt și oprim
  // derularea, ca utilizatorul să vadă noul pas 1, nu mijlocul altui calcul.
  const totalAnterior = useRef(totalPasi);
  useEffect(() => {
    if (totalAnterior.current !== totalPasi) {
      totalAnterior.current = totalPasi;
      setPasBrut(0);
      setRuleaza(false);
    }
  }, [totalPasi]);

  useEffect(() => {
    if (!ruleaza || totalPasi === 0) return;

    if (pasSigur >= ultimul) {
      setRuleaza(false);
      return;
    }

    const id = window.setTimeout(() => setPasBrut((p) => p + 1), DURATA_PAS / viteza);
    return () => window.clearTimeout(id);
  }, [ruleaza, pasSigur, ultimul, viteza, totalPasi]);

  return { pas: pasSigur, ruleaza, viteza, setPas, setRuleaza, setViteza };
}
