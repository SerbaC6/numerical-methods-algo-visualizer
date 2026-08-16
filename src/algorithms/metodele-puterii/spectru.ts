/**
 * Spectrul exact al unei matrice `2×2`, calculat direct din polinomul
 * caracteristic.
 *
 * **De ce există, lângă metodele iterative din `putere.ts`.** Nu e o metodă
 * numerică și nu concurează cu ele: e **ținta** desenului. Interfața trebuie să
 * poată arăta unde ar trebui să ajungă iterația — direcțiile proprii adevărate,
 * trasate din primul cadru, înainte ca metoda să facă vreun pas. Calculate tot
 * prin iterație, ele n-ar mai fi o țintă, ci același răspuns desenat de două
 * ori.
 *
 * Se oprește la ordinul 2 dinadins: acolo formula e exactă și se scrie într-o
 * linie. Pentru ordin mai mare nu există așa ceva, iar tocmai de aceea se
 * folosesc metodele puterii.
 *
 * **Sursă: `cursuri_MN/valori_vectori_proprii_teorie_curs7.md`, §1** —
 * `p(λ) = det(λI − A)`, plus proprietățile `Σλᵢ = tr(A)` și `Πλᵢ = det(A)`, din
 * care se scrie direct `λ² − tr(A)·λ + det(A) = 0`.
 */

import type { Matrice } from "@/algorithms/metodele-puterii/tipuri";

export type Spectru2x2 =
  | {
      /** Cele două valori proprii sunt reale — cazul în care desenul are direcții de arătat. */
      reale: true;
      /** Valorile proprii, ordonate descrescător **după modul**: `valori[0]` e cea dominantă. */
      valori: [number, number];
      /** Direcțiile proprii, normalizate, în aceeași ordine ca valorile. */
      directii: [number[], number[]];
      /** `|λ₂|/|λ₁|` — rata de convergență a metodei directe (§6). `Infinity` dacă `λ₁ = 0`. */
      rata: number;
    }
  | {
      /**
       * Valorile proprii sunt complex conjugate. Nu există nicio direcție reală
       * pe care matricea doar să lungească, deci nu e nimic de desenat — iar
       * ipoteza `|λ₁| > |λ₂|` din §6 cade, fiindcă cele două au același modul.
       */
      reale: false;
      parteReala: number;
      parteImaginara: number;
    };

/** Normalizează, cu semnul ales astfel încât prima componentă nenulă să fie pozitivă. */
function directie(v: number[]): number[] {
  const lungime = Math.hypot(v[0] ?? 0, v[1] ?? 0);
  if (!(lungime > 0)) return [1, 0];
  const semn = (v[0] ?? 0) < 0 || ((v[0] ?? 0) === 0 && (v[1] ?? 0) < 0) ? -1 : 1;
  return [((v[0] ?? 0) / lungime) * semn, ((v[1] ?? 0) / lungime) * semn];
}

export function spectru2x2(A: Matrice): Spectru2x2 {
  const a = A[0]?.[0] ?? 0;
  const b = A[0]?.[1] ?? 0;
  const c = A[1]?.[0] ?? 0;
  const d = A[1]?.[1] ?? 0;

  const urma = a + d;
  const det = a * d - b * c;
  const discriminant = urma * urma - 4 * det;

  if (discriminant < 0) {
    return {
      reale: false,
      parteReala: urma / 2,
      parteImaginara: Math.sqrt(-discriminant) / 2,
    };
  }

  const radical = Math.sqrt(discriminant);
  const brute: [number, number] = [(urma + radical) / 2, (urma - radical) / 2];
  const [lambda1, lambda2] =
    Math.abs(brute[0]) >= Math.abs(brute[1]) ? brute : ([brute[1], brute[0]] as [number, number]);

  // Vectorul propriu al lui λ, din `(A − λI)v = 0`: liniile matricei sunt
  // proporționale, deci e de ajuns una — se ia cea care nu e nulă. Când ambele
  // sunt nule, matricea e `λI`, iar orice direcție e proprie: se aleg axele.
  const vector = (lambda: number): number[] => {
    if (Math.abs(b) > 1e-12) return directie([b, lambda - a]);
    if (Math.abs(c) > 1e-12) return directie([lambda - d, c]);
    return Math.abs(lambda - a) <= Math.abs(lambda - d) ? [1, 0] : [0, 1];
  };

  return {
    reale: true,
    valori: [lambda1, lambda2],
    directii: [vector(lambda1), vector(lambda2)],
    rata: lambda1 === 0 ? Number.POSITIVE_INFINITY : Math.abs(lambda2) / Math.abs(lambda1),
  };
}

/**
 * Norma spectrală a unei matrice `2×2`: `‖A‖₂ = σ_max`, cea mai mare valoare
 * singulară.
 *
 * E cel mai mult cu care `A` poate lungi un vector de lungime 1, deci
 * `‖A·v‖ ≤ ‖A‖₂` pentru orice `v` de pe cercul unitate — de asta are nevoie
 * desenul din interfață: o scară care depinde numai de matrice, nu de pasul
 * curent. Cu scara potrivită pe fiecare pas, cercul unitate ar pulsa de la o
 * iterație la alta, iar drumul dintre doi pași ar părea altul decât e.
 *
 * Se calculează ca `√(λ_max(AᵀA))`, adică prin aceeași formulă exactă de mai
 * sus, aplicată matricei simetrice `AᵀA` — care are valorile proprii reale și
 * nenegative, deci radicalul se poate lua întotdeauna.
 */
export function normaSpectrala2x2(A: Matrice): number {
  const a = A[0]?.[0] ?? 0;
  const b = A[0]?.[1] ?? 0;
  const c = A[1]?.[0] ?? 0;
  const d = A[1]?.[1] ?? 0;

  const AtA: Matrice = [
    [a * a + c * c, a * b + c * d],
    [a * b + c * d, b * b + d * d],
  ];
  const s = spectru2x2(AtA);
  // `AᵀA` e simetrică, deci ramura complexă nu poate fi atinsă; dacă totuși
  // rotunjirile o ating, se întoarce 0, nu un radical din negativ.
  if (!s.reale) return 0;
  return Math.sqrt(Math.max(0, s.valori[0]));
}
