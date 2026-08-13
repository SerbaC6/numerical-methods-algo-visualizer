/**
 * Matematica unui clip animat: curbe de easing, interpolare pe timp și tabelul
 * de repere („cue-uri") derivat din lista de scene.
 *
 * **De ce există, lângă `miscare.ts`.** Cele două nu fac același lucru.
 * `miscare.ts` ține tranzițiile de interfață — un element apare, o bandă
 * alunecă, `motion` primește durata și curba. Aici e vorba de un **clip**: un
 * singur ceas care merge de la 0 la durata totală, iar tot ce se vede pe ecran
 * e o **funcție pură de timpul acela**. Nimic nu se montează și nu se
 * demontează la granița dintre scene, deci un element poate traversa granița
 * prin simplă interpolare.
 *
 * Modelul e împrumutat din motorul cu care a fost scrisă animația paginii 7;
 * aici a rămas doar felia folosită, scrisă în TypeScript și verificabilă.
 *
 * Fișierul e pur — fără React, fără DOM — exact ca `plot-scara.ts`.
 */

/** Ține valoarea între `min` și `max`. */
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Curbele folosite de clipuri. Sunt patru fiindcă atât cere disciplina de
 * scriere a unei animații: o curbă de intrare, una de desenare, una cu
 * depășire pentru accente, și liniarul pentru ce nu trebuie „interpretat".
 *
 * **Nu sunt aceleași cu `CURBE` din `miscare.ts`.** Acolo curbele sunt vectori
 * Bézier, în forma cerută de `motion`; aici sunt funcții `[0,1] → [0,1]`,
 * fiindcă valoarea se calculează în cod, la fiecare cadru, nu o animează
 * browserul.
 */
export const EASING = {
  liniar: (t: number) => t,
  /** Pornește repede și se așază lin — pentru ce intră în cadru. */
  iesireCubica: (t: number) => 1 + (t - 1) ** 3,
  /** Lin la ambele capete — pentru ce se desenează sau se deplasează. */
  intrareIesireCubica: (t: number) =>
    t < 0.5 ? 4 * t ** 3 : 1 + (t - 1) * (2 * t - 2) * (2 * t - 2),
  /** Depășește ținta și revine — pentru accente scurte (un steag care se ridică). */
  iesireCuDepasire: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  },
} as const;

export type Easing = (t: number) => number;

export type Tranzitie = {
  /** Valoarea înainte de `start` (inclusiv). */
  dela: number;
  /** Valoarea după `sfarsit` (inclusiv). */
  la: number;
  /** Momentul de pornire, în secunde de timp autorat. */
  start: number;
  /** Momentul de oprire, în secunde de timp autorat. */
  sfarsit: number;
  ease?: Easing;
};

/**
 * O singură tranziție, ca funcție de timp: `animeaza({...})(T)`.
 *
 * În afara intervalului `[start, sfarsit]` întoarce capetele — de aceea se pot
 * suprapune zeci de tranziții pe același element fără condiții `if`: fiecare e
 * inertă până îi vine rândul și rămâne așezată după ce s-a terminat.
 */
export function animeaza({
  dela,
  la,
  start,
  sfarsit,
  ease = EASING.intrareIesireCubica,
}: Tranzitie): (T: number) => number {
  return (T: number) => {
    if (T <= start) return dela;
    if (T >= sfarsit) return la;
    // Un interval de lungime zero ar da 0/0; capetele de mai sus îl prind deja
    // pentru orice T, deci aici lungimea e strict pozitivă.
    return dela + (la - dela) * ease((T - start) / (sfarsit - start));
  };
}

/** O scenă din clip: o felie cu nume din axa timpului. */
export type Scena = {
  /** Numele care ajunge cheie în tabelul de repere. */
  nume: string;
  /** Cât ține scena, în secunde. */
  durata: number;
  /** Ce se întâmplă în ea, într-o propoziție — pentru cine editează clipul. */
  descriere: string;
};

export type Repere<Nume extends string = string> = {
  /** Momentul de start al fiecărei scene, în secunde: `cue.Coborare`. */
  cue: Record<Nume, number>;
  /** Durata întregului clip, în secunde. */
  total: number;
};

/**
 * Tabelul de repere, derivat din lista de scene prin sumă cumulată.
 *
 * Sursa unică e lista de scene: numele, ordinea și duratele stau într-un
 * singur loc, iar coregrafia se scrie față de `cue.NumeScena`, niciodată față
 * de secunde scrise de mână. Așa, mutarea unei scene cu o secundă retimează
 * tot ce e cheiat pe ea, fără să se atingă nimic altceva.
 *
 * Un nume repetat se leagă de **prima** apariție.
 *
 * Tipul întors păstrează numele scenelor, dacă lista e scrisă
 * `[...] as const satisfies readonly Scena[]` — așa, `cue.Coborâre` e `number`,
 * iar un nume greșit e eroare de compilare, nu un `NaN` descoperit pe ecran.
 */
export function repere<const S extends readonly Scena[]>(scene: S): Repere<S[number]["nume"]> {
  const cue = {} as Record<S[number]["nume"], number>;
  let total = 0;
  for (const scena of scene) {
    const nume = scena.nume as S[number]["nume"];
    if (!(nume in cue)) cue[nume] = total;
    total += scena.durata;
  }
  return { cue, total };
}
