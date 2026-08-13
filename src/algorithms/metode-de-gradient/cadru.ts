/**
 * Încadrarea scenei paginii 7: ce bucată din planul soluțiilor se vede.
 *
 * Stă aici, nu în componentă, din același motiv pentru care stă acolo și restul
 * matematicii: e o funcție pură de pașii metodei, deci se poate verifica numeric
 * separat de desen (`scripts/verificare-algoritmi/urmarire-vale.ts`). Componenta
 * `ValeaGradientului` doar animă între două cadre calculate aici.
 */

import type { Vec2 } from "@/lib/curbe-de-nivel";
import type { Domeniu } from "@/lib/plot-scara";
import { urmarestePatrat } from "@/lib/plot-urmarire";

/** Cât spațiu se lasă în jurul drumului, ca fața văii să nu fie tăiată la buză. */
export const MARJA_CUTIE = 0.55;

export type CadruVale = { x: Domeniu; y: Domeniu };

/**
 * Pătratul care cuprinde toate punctele date, cu marjă în jur.
 *
 * **Pătrat dinadins:** scara pe x₁ și x₂ e oricum izotropă (`normalizeaza` din
 * `proiectie-3d.ts`), dar o cutie alungită ar sugera din priviri că axele au
 * unități diferite. Cu latura egală, ce se vede drept pe ecran chiar e drept în
 * planul soluțiilor.
 */
export function bazaPatrata(puncte: readonly Vec2[]): CadruVale {
  if (puncte.length === 0) return { x: [-1, 1], y: [-1, 1] };

  const xs = puncte.map((p) => p[0]);
  const ys = puncte.map((p) => p[1]);
  const centruX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centruY = (Math.min(...ys) + Math.max(...ys)) / 2;

  const intindere = Math.max(
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys),
    1e-6,
  );
  const semi = (intindere / 2) * (1 + MARJA_CUTIE) + intindere * 0.15;

  return {
    x: [centruX - semi, centruX + semi],
    y: [centruY - semi, centruY + semi],
  };
}

/**
 * Cadrul în care se desenează la pasul curent.
 *
 * Zona de interes e chiar pasul acesta plus ținta lui — `x⁽ᵏ⁻¹⁾`, `x⁽ᵏ⁾` și
 * `x*` — iar apropierea se face pe trepte (`urmarestePatrat`). Fără ea,
 * ultimele iterații ale coborârii se îngrămădesc într-un bulgăre de puncte
 * lângă `x*`: pe valea alungită, din 36 de pași se disting vreo trei.
 */
export function cadrulPasului(
  baza: CadruVale,
  puncteDeInteres: readonly Vec2[],
): CadruVale & { nivel: number; apropiere: number } {
  if (puncteDeInteres.length === 0) return { ...baza, nivel: 0, apropiere: 1 };

  const xs = puncteDeInteres.map((p) => p[0]);
  const ys = puncteDeInteres.map((p) => p[1]);

  const cadru = urmarestePatrat(
    baza.x,
    baza.y,
    [Math.min(...xs), Math.max(...xs)],
    [Math.min(...ys), Math.max(...ys)],
  );

  return { x: cadru.x, y: cadru.y, nivel: cadru.nivel, apropiere: cadru.apropiere };
}
