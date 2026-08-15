import type { ReactNode } from "react";

/**
 * Un bloc din secțiunea „Teorie pe scurt".
 *
 * Textele stau aici, separate de componente, ca să se poată corecta fără să
 * atingi logica de randare — și ca o greșeală de matematică să se repare
 * într-un singur loc, nu prin trei fișiere de UI.
 */
/** Un simbol din formulă și ce înseamnă. */
export type IntrareLegenda = {
  /** Simbolul, exact cum apare în formulă: „pₙ", „f′", „b − a". */
  simbol: string;
  sens: ReactNode;
};

export type BlocTeorie =
  | { tip: "text"; continut: ReactNode }
  /**
   * O propoziție scoasă din rând: regula practică pe care o reții dacă nu reții
   * altceva. Se folosește **rar** — un text în care fiecare al treilea paragraf
   * e încadrat n-are niciun paragraf încadrat.
   */
  | { tip: "callout"; titlu: string; continut: ReactNode }
  | {
      tip: "formula";
      latex: string;
      /**
       * De unde vine formula: „curs 6". **Nu se afișează** — pe pagină ar fi
       * doar zgomot repetat sub fiecare formulă, iar cititorul nu deschide
       * cursul din mijlocul unei lecții.
       *
       * Rămâne totuși obligatorie, fiindcă e pentru **cine editează**: regula
       * proiectului e că formulele vin exclusiv din `cursuri_MN/`, iar câmpul
       * ăsta e urma care face verificarea posibilă mai târziu, fără să
       * recitești tot cursul ca să afli de unde a apărut un semn.
       */
      sursa: string;
      /**
       * Numele variantei, deasupra formulei — „Punct de mijloc", „Punct final".
       *
       * E un **titlu**, nu o literă: delimitează două formule înrudite care
       * altfel curg una după alta. Înainte stătea în `legenda`, adică între
       * simboluri, unde n-avea ce căuta — nu e nimic de citit în formulă.
       */
      subtitlu?: string;
      /**
       * Ce înseamnă fiecare literă. **Se completează pentru orice formulă care
       * introduce un simbol nou.** O formulă în care cititorul nu știe ce e `p`
       * și ce e `pₙ` nu comunică nimic, oricât de corectă ar fi.
       */
      legenda?: IntrareLegenda[];
      /** Ce spune formula, într-o propoziție, pentru cine o citește prima oară. */
      explicatie?: ReactNode;
    };

/** O metodă din pagină, cu bucata ei de teorie. */
export type MetodaTeorie = {
  /** Ancora din pagină și cheia de listă: „bisectie", „newton". */
  id: string;
  titlu: string;
  /** Propoziția care spune, înainte de orice formulă, ce face metoda. */
  esenta: ReactNode;
  blocuri: BlocTeorie[];
};

export type TeorieScurtaContinut = {
  /** Paragraful de deschidere al secțiunii — problema comună tuturor metodelor. */
  intro: ReactNode;
  metode: MetodaTeorie[];
};

export type ContinutPagina = {
  teorie: TeorieScurtaContinut;
};
