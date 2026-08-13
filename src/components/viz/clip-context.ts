import { createContext, useContext } from "react";

/**
 * Starea ceasului unui clip: ce se vede acum și de unde se măsoară.
 *
 * Stă în fișier separat de `Clip.tsx` din același motiv ca `plot-context.ts`:
 * un fișier care exportă și componente, și hook-uri, rupe fast refresh.
 */
export type StareClip<Nume extends string = string> = {
  /** Timpul curent al clipului, în secunde. **Tot ce se desenează vine de aici.** */
  T: number;
  /** Momentul de start al fiecărei scene, după nume. */
  cue: Record<Nume, number>;
  /** Durata întregului clip, în secunde. */
  total: number;
  ruleaza: boolean;
  /**
   * Lățimea cadrului pe ecran, în pixeli CSS.
   *
   * Desenul are un sistem de coordonate propriu, care se scalează cu cadrul —
   * deci un text de 26 de unități e citeț pe monitor și de 5 px pe telefon.
   * Cine desenează își mărește literele după lățimea asta.
   */
  latime: number;
};

export const ContextClip = createContext<StareClip | null>(null);

/**
 * Timpul clipului și tabelul de repere, pentru piesele dinăuntru.
 *
 * Parametrul de tip e uniunea numelor de scene ale clipului
 * (`useClip<NumeScena>()`): așa `cue.Coborare` e `number`, iar un nume greșit e
 * eroare de compilare, nu un `NaN` descoperit pe ecran. Contextul nu-l poate
 * purta singur — un `createContext` are un singur tip pentru toate clipurile.
 *
 * Aruncă dacă e chemat în afara unui `<Clip>`: o piesă de animație fără ceas
 * n-are ce desena, iar un `T = 0` tăcut ar arăta un cadru gol pe care nimeni
 * nu l-ar înțelege ca defect.
 */
export function useClip<Nume extends string = string>(): StareClip<Nume> {
  const stare = useContext(ContextClip);
  if (!stare) throw new Error("useClip() se poate folosi doar în interiorul unui <Clip>.");
  return stare as StareClip<Nume>;
}
