/**
 * Cele trei sisteme gata alese ale paginii 7.
 *
 * **De ce există.** Numărul de condiționare al văii, `κ(A) = λmax/λmin`, e
 * singurul lucru care decide cum arată coborârea: el e raportul semiaxelor
 * elipselor de nivel, deci cât de tare taie zigzagul de-a curmezișul văii.
 * Sistemul din curs are `κ = 1,94`, adică elipse cu semiaxele în raport 1,39 —
 * aproape cercuri. Ortogonalitatea dintre doi pași e exactă și acolo, dar cotul
 * arată blând, iar pașii de la coadă se îngrămădesc lângă `x*`. Cele două
 * capete — valea rotundă și valea alungită — arată tocmai ce nu se vede pe
 * sistemul din curs: că numărul de pași al coborârii **depinde** de formă, iar
 * al gradientului Conjugat **nu**.
 *
 * **Cifrele nu sunt alese din ochi.** `scripts/verificare-algoritmi/sisteme.ts`
 * rulează modulele reale și verifică pe fiecare sistem că A e SPD, că `κ` e cel
 * afirmat aici și că fiecare metodă face chiar numărul de pași pe care se
 * sprijină eticheta. Dacă schimbi un număr de mai jos și verificarea pică,
 * greșit e numărul, nu verificarea.
 *
 * **Sistemul din curs nu se atinge.** Cifrele lui sunt cele din teoria paginii
 * (`src/content/metode-de-gradient.tsx`), verificate acolo; el rămâne cel
 * implicit.
 *
 * `b` și `x⁽⁰⁾` sunt **aceleași** la toate trei, dinadins: singurul lucru care
 * diferă e A, adică forma văii. Altfel n-ar fi clar dacă numărul de pași s-a
 * schimbat de la formă sau de la unde s-a pornit.
 */

/** Valorile pe care un sistem gata ales le pune în toate câmpurile interfeței. */
export type ValoriSistem = {
  a11: number;
  a12: number;
  a22: number;
  b1: number;
  b2: number;
  x01: number;
  x02: number;
  tol: number;
  maxIteratii: number;
};

export type SistemGata = {
  id: string;
  /** Ce scrie pe buton. Descrie **valea**, nu matricea: forma e ce se vede. */
  eticheta: string;
  valori: ValoriSistem;
};

/** Sistemul de pornire al interfeței și cel la care duce „Resetează". */
export const SISTEM_IMPLICIT: ValoriSistem = {
  a11: 4,
  a12: 1,
  a22: 3,
  b1: 1,
  b2: 2,
  x01: 0,
  x02: 0,
  tol: 1e-8,
  maxIteratii: 40,
};

export const SISTEME: readonly SistemGata[] = [
  {
    id: "rotunda",
    eticheta: "Vale rotundă",
    // κ = 1: curbele de nivel sunt cercuri, deci direcția cea mai abruptă arată
    // chiar spre fundul văii. Coborârea termină într-un pas — exact ca
    // gradientul Conjugat, care aici n-are ce îmbunătăți.
    valori: { a11: 2, a12: 0, a22: 2, b1: 1, b2: 2, x01: 0, x02: 0, tol: 1e-8, maxIteratii: 40 },
  },
  {
    id: "curs",
    eticheta: "Valea din curs",
    // A = [[4, 1], [1, 3]], b = (1, 2), soluția exactă x* = (1/11, 7/11).
    // Sistemul verificat în teoria paginii; 16 pași la coborâre, 2 la conjugat.
    valori: SISTEM_IMPLICIT,
  },
  {
    id: "alungita",
    eticheta: "Vale alungită",
    // κ = 10: semiaxele elipselor stau în raport √10 ≈ 3,16, deci zigzagul se
    // vede de la primul cot. Toleranța e 10⁻⁴, nu 10⁻⁸, ca rularea să se **și
    // termine**: la 10⁻⁸ coborârea ar cere 68 de pași, adică o derulare din care
    // nu se mai uită nimeni la ultimii. Cu 10⁻⁴ face 36, iar Conjugatul tot 2.
    valori: { a11: 10, a12: 0, a22: 1, b1: 1, b2: 2, x01: 0, x02: 0, tol: 1e-4, maxIteratii: 60 },
  },
] as const;
