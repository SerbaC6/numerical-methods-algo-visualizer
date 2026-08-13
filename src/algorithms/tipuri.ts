/**
 * Contractul comun al metodelor numerice.
 *
 * Fiecare metodă exportă `meta`, `params` și `run(params)`, iar `run` produce un
 * șir de pași. **Fără JSX și fără nimic din interfață**: aici stă doar
 * matematica, ca să poată fi verificată rulând-o în afara aplicației.
 *
 * Explicația fiecărui pas se scrie **tot aici**, nu în componentă. Motivul e că
 * propoziția descrie ce s-a întâmplat matematic la pasul acela — dacă ar sta în
 * UI, s-ar putea desincroniza de cifrele pe care le însoțește.
 */

/** Cum s-a terminat metoda. */
export type StareRulare =
  /** Încă nu s-a atins criteriul de oprire la ultimul pas calculat. */
  | "neterminat"
  /** Criteriul de oprire a fost atins. */
  | "convergent"
  /** Metoda nu poate continua — pivot nul, derivată nulă, interval greșit. */
  | "esuat";

/** Un pas dintr-o metodă de căutare a rădăcinii. */
export type PasRadacina = {
  /** Numărul iterației, **de la 1** — cum se numără în curs, nu 0-indexat. */
  iteratie: number;
  /**
   * Intervalul curent, doar la metodele care lucrează pe interval (bisecția).
   * Restul metodelor nu au așa ceva, iar desenul nu trebuie să inventeze unul.
   */
  interval?: { a: number; b: number };
  /** Aproximarea calculată la pasul acesta. */
  x: number;
  /** Valoarea funcției în ea. La puncte fixe e `g(x) − x`, vezi metoda. */
  fx: number;
  /** Punctul de la pasul anterior — tangenta și secanta se desenează prin el. */
  xAnterior?: number;
  /** Penultimul punct; doar secanta are nevoie de el. */
  xPenultim?: number;
  /**
   * Panta dreptei de construcție: tangenta la Newton, secanta la metoda
   * secantei. Lipsește la metodele care nu desenează o dreaptă.
   */
  panta?: number;
  /** Valoarea criteriului de oprire la pasul acesta, ca să se poată afișa. */
  eroare: number;
  /** Ce s-a întâmplat, într-o propoziție. Se afișează sub desen. */
  explicatie: string;
};

export type RezultatRulare = {
  pasi: PasRadacina[];
  stare: StareRulare;
  /**
   * De ce s-a oprit, când starea e `esuat`. Textul ajunge într-un `Callout`,
   * nu colorează desenul (vezi regula despre roșu din `CLAUDE.md`).
   */
  motiv?: string;
};

/** Descrierea unui parametru, pentru construirea automată a panoului. */
export type Parametru = {
  nume: string;
  eticheta: string;
  tip: "numar" | "alegere";
  implicit: number | string;
  min?: number;
  max?: number;
  pas?: number;
  ajutor?: string;
};

export type MetaMetoda = {
  id: string;
  titlu: string;
  /** O propoziție: ce face metoda. */
  rezumat: string;
  /** Fișierul din `cursuri_MN/` din care vine — urma pentru verificare. */
  sursa: string;
};
