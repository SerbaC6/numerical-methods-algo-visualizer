/**
 * Funcția pătratică pe care coboară amândouă metodele și verificările pe care
 * le cere înainte de primul pas.
 *
 * **Surse: `cursuri_MN/ecuatii_neliniare_MN_curs6.md`, §4** (`f(x) = ½·xᵀAx −
 * bᵀx`, `∇f(x) = Ax − b`, `r^(k) = b − A·x^(k) = −∇f(x^(k))`) și
 * `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §8.1 (SPD, minimul
 * lui φ e chiar soluția sistemului).
 *
 * Operațiile de vectori și matrice nu se rescriu aici: vin din
 * `src/lib/curbe-de-nivel.ts`, care e deja verificat numeric separat. Fișierul
 * ăsta pune doar numele din curs peste ele.
 */

import {
  centrul,
  determinant,
  inmulteste,
  scade,
  valoare,
  type Mat2,
  type Vec2,
} from "@/lib/curbe-de-nivel";

/** `f(x) = ½·xᵀAx − bᵀx`, curs 6, §4. */
export function f(A: Mat2, b: Vec2, x: Vec2): number {
  return valoare(A, b, x);
}

/** `∇f(x) = A·x − b`, curs 6, §4 — direcția de **creștere** maximă. */
export function gradient(A: Mat2, b: Vec2, x: Vec2): Vec2 {
  return scade(inmulteste(A, x), b);
}

/**
 * Reziduul `r = b − A·x`, curs 6, §4.1.
 *
 * E chiar `−∇f(x)`, adică direcția de scădere maximă — de aceea coborârea merge
 * pe el, iar cursul îi spune și „direcție de căutare" (curs 5, §8.3).
 */
export function reziduu(A: Mat2, b: Vec2, x: Vec2): Vec2 {
  return scade(b, inmulteste(A, x));
}

/**
 * `x* = A⁻¹b`: soluția sistemului și, în același timp, punctul de minim al lui
 * f (echivalența din curs 5, §8.1). `null` când A e singulară.
 */
export function solutieExacta(A: Mat2, b: Vec2): Vec2 | null {
  return centrul(A, b);
}

/**
 * Verificarea pe care o cer amândouă metodele înainte de primul pas: A să fie
 * **simetrică și pozitiv definită**.
 *
 * Simetria e structurală (`Mat2` are trei numere, nu patru), deci rămâne de
 * verificat pozitivitatea. Se face cu criteriul lui Sylvester — minorii
 * principali strict pozitivi: `a₁₁ > 0` și `det A = a₁₁a₂₂ − a₁₂² > 0` — care e
 * echivalent cu definiția `xᵀAx > 0` din curs 5, §8.1, dar se poate spune în
 * cifre pe ecran.
 *
 * Motivul e scris ca **text**, cu minorul vinovat numit: fără pozitiv
 * definire, f nu mai are fund de vale, ci o șa sau un jgheab, deci „a coborî
 * până la minim" nu mai înseamnă nimic.
 */
export function verificaSPD(A: Mat2): { ok: true } | { ok: false; motiv: string } {
  const [a11, a12, a22] = A;
  const det = determinant(A);

  if (!Number.isFinite(a11) || !Number.isFinite(a12) || !Number.isFinite(a22)) {
    return { ok: false, motiv: "Matricea are valori care nu sunt numere finite." };
  }

  if (!(a11 > 0)) {
    return {
      ok: false,
      motiv:
        `Primul minor principal e a₁₁ = ${numar(a11)}, deci nu e strict pozitiv: A nu e pozitiv definită. ` +
        `Fără asta f nu mai are fund de vale — suprafața e o șa sau un jgheab, iar coborârea n-are unde să se oprească.`,
    };
  }

  if (!(det > 0)) {
    return {
      ok: false,
      motiv:
        `Al doilea minor principal e det A = a₁₁a₂₂ − a₁₂² = ${numar(det)}, deci nu e strict pozitiv: A nu e pozitiv definită. ` +
        `Fără asta f nu mai are fund de vale — suprafața e o șa sau un jgheab, iar coborârea n-are unde să se oprească.`,
    };
  }

  return { ok: true };
}

/**
 * Cât de aproape de singulară e A, relativ la mărimea ei.
 *
 * O matrice poate trece de Sylvester cu un determinant pozitiv, dar atât de mic
 * încât `x* = A⁻¹b` să fie numai zgomot de rotunjire. Se compară cu pătratul
 * celui mai mare element, ca pragul să nu depindă de unitățile în care e scris
 * sistemul.
 */
export function estePracticSingulara(A: Mat2): boolean {
  const scara = Math.max(Math.abs(A[0]), Math.abs(A[1]), Math.abs(A[2]), Number.MIN_VALUE);
  return Math.abs(determinant(A)) < 1e-12 * scara * scara;
}

/** Numerele din motivele de eșec, în convenția românească (virgulă zecimală). */
function numar(v: number): string {
  return String(Number(v.toPrecision(6)))
    .replace(".", ",")
    .replace("-", "−");
}
