/**
 * Cum se comportă eroarea când scade `h` — inclusiv locul unde se strică.
 *
 * **Sursă: `cursuri_MN/derivare-integrare-numerica_curs11.md`**, „Observație:
 * eroarea de rotunjire": pentru formula cu punct de mijloc, eroarea totală e
 * mărginită de `ε/h + (h²/6)·M`. Primul termen vine din rotunjire și **crește**
 * când `h` scade; al doilea e eroarea de trunchiere a formulei și scade. De aici
 * iese și partea pe care cursul o enunță, dar n-o desenează: există un `h` optim,
 * iar sub el nu se mai câștigă nimic.
 *
 * **De ce eroarea măsurată, nu marginea.** Marginea `ε/h + h²M/6` cere `M`, o
 * margine a lui `f'''` pe care nu o avem pentru orice funcție. Ce avem, în
 * schimb, e derivata **analitică** a funcțiilor din `functii.ts`, deci se poate
 * calcula eroarea adevărată, `|aproximare − f'(x₀)|`, exact. Marginea teoretică
 * rămâne pentru text, unde e enunțată; graficul arată ce se întâmplă cu adevărat
 * în virgulă mobilă.
 */

import type { FormulaDerivare } from "@/algorithms/derivare-numerica/formule";

export type PunctEroare = {
  h: number;
  /** Ce dă formula la pasul `h`. */
  aproximare: number;
  /** `|aproximare − valoarea exactă|`. Zero curat devine cel mai mic număr desenabil. */
  eroare: number;
};

export type CurbaEroare = {
  formula: FormulaDerivare;
  puncte: PunctEroare[];
  /** `h`-ul la care eroarea măsurată e cea mai mică. */
  hOptim: number;
  eroareMinima: number;
};

/**
 * `h`-ul care minimizează marginea teoretică `ε/h + c·hᵖ·M`.
 *
 * Se obține derivând marginea în raport cu `h` și egalând cu zero:
 * `−ε/h² + c·p·h^(p−1)·M = 0`, adică `h = (ε / (c·p·M))^(1/(p+1))`.
 *
 * Pentru punctul de mijloc (`p = 2`, `c = 1/6`) iese `h = (3ε/M)^(1/3)`; pentru
 * două puncte (`p = 1`, `c = 1/2`) iese `h = √(2ε/M)`. Cifrele sunt verificate
 * în `scripts/verificare-algoritmi/derivare-numerica.ts`.
 */
export function hOptimTeoretic(
  ordinEroare: number,
  constanta: number,
  M = 1,
  epsilon = EPSILON,
): number {
  return (epsilon / (constanta * ordinEroare * M)) ** (1 / (ordinEroare + 1));
}

/** Precizia relativă a lui `float64` — `ε` din inegalitatea cursului. */
export const EPSILON = Number.EPSILON / 2;

/**
 * Baleiază `h` pe o scară logaritmică și măsoară eroarea la fiecare pas.
 *
 * Scara e logaritmică fiindcă întrebarea e „de câte ori", nu „cu cât": între
 * `10⁻¹` și `10⁻¹⁶` sunt cincisprezece ordine de mărime, iar pe scară liniară
 * s-ar vedea doar ultimul.
 */
export function baleiazaH(
  formula: FormulaDerivare,
  f: (x: number) => number,
  x0: number,
  exact: number,
  {
    hMax = 1,
    hMin = 1e-14,
    puncteDeDecada = 12,
  }: { hMax?: number; hMin?: number; puncteDeDecada?: number } = {},
): CurbaEroare {
  const decade = Math.log10(hMax / hMin);
  const total = Math.max(2, Math.round(decade * puncteDeDecada));
  const puncte: PunctEroare[] = [];

  for (let i = 0; i <= total; i++) {
    const h = hMax * 10 ** ((-decade * i) / total);
    const aproximare = formula.aproximeaza(f, x0, h);
    if (!Number.isFinite(aproximare)) continue;
    puncte.push({ h, aproximare, eroare: Math.abs(aproximare - exact) });
  }

  const cuEroare = puncte.filter((p) => p.eroare > 0);
  const indice = indiceMinimNetezit(cuEroare);
  const cel = cuEroare[indice] ?? { h: hMax, aproximare: exact, eroare: 0 };

  return { formula, puncte, hOptim: cel.h, eroareMinima: cel.eroare };
}

/**
 * Unde e cu adevărat minimul, pe o curbă care **are zgomot**.
 *
 * Sub `h` optim, eroarea nu scade lin: sare de la un pas la altul, fiindcă e
 * chiar zgomot de rotunjire. Minimul brut cade atunci pe un punct norocos, care
 * poate fi cu două decade mai la dreapta decât zona bună — iar marcajul de pe
 * grafic ar arăta „cel mai bun h" într-un loc unde curba deja urcă.
 *
 * De aceea minimul se caută pe media logaritmilor pe o fereastră de cinci
 * puncte: netezirea taie vârfurile izolate și lasă **regiunea** cea mai joasă.
 * Valoarea raportată rămâne cea măsurată acolo, nu media.
 */
function indiceMinimNetezit(puncte: readonly PunctEroare[], fereastra = 5): number {
  if (puncte.length === 0) return 0;
  const jumatate = Math.floor(fereastra / 2);
  let celMaiBun = 0;
  let minim = Number.POSITIVE_INFINITY;

  for (let i = 0; i < puncte.length; i++) {
    let suma = 0;
    let cate = 0;
    for (let k = Math.max(0, i - jumatate); k <= Math.min(puncte.length - 1, i + jumatate); k++) {
      suma += Math.log10(puncte[k]!.eroare);
      cate++;
    }
    const medie = suma / cate;
    if (medie < minim) {
      minim = medie;
      celMaiBun = i;
    }
  }
  return celMaiBun;
}

/**
 * Panta măsurată pe porțiunea în care domină trunchierea.
 *
 * E chiar exponentul lui `h` din termenul de eroare: se citește ca pantă pe
 * graficul log-log și e singurul mod de a **verifica** faptul că formula cu trei
 * puncte e de ordinul doi, nu doar de a-l enunța.
 */
export function pantaMasurata(curba: CurbaEroare, hDeLa = 1e-3, hPanaLa = 1e-1): number | null {
  const felie = curba.puncte.filter((p) => p.h >= hDeLa && p.h <= hPanaLa && p.eroare > 0);
  if (felie.length < 2) return null;

  // Regresie liniară pe `log h` și `log eroare`.
  const n = felie.length;
  const sx = felie.reduce((s, p) => s + Math.log10(p.h), 0);
  const sy = felie.reduce((s, p) => s + Math.log10(p.eroare), 0);
  const sxy = felie.reduce((s, p) => s + Math.log10(p.h) * Math.log10(p.eroare), 0);
  const sxx = felie.reduce((s, p) => s + Math.log10(p.h) ** 2, 0);
  const numitor = n * sxx - sx * sx;
  if (Math.abs(numitor) < 1e-15) return null;
  return (n * sxy - sx * sy) / numitor;
}
