import { deplasareRadiala, useScena3D } from "@/components/viz/scena-3d-context";
import type { Punct3 } from "@/lib/proiectie-3d";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";

export type Sageata3DProps = {
  de: Punct3;
  la: Punct3;
  rol?: RolViz;
  /** Numele săgeții: „α·r⁽ᵏ⁾", „−∇f(x⁽ᵏ⁾)". */
  eticheta?: string;
  grosime?: number;
  /** Lungimea vârfului, în pixeli de ecran. */
  varf?: number;
  opacitate?: number;
};

/**
 * Un segment orientat între două puncte din lume — pasul, gradientul, direcția.
 *
 * **Vârful se construiește în coordonate de ecran**, din direcția deja
 * proiectată, nu în lume. Un vârf modelat în 3D ar trebui orientat față de
 * cameră ca să nu se vadă din muchie, iar la unele azimuturi ar dispărea de tot;
 * în plus, sub proiecție ortografică ar avea lungimi diferite după cum cade
 * segmentul, deși săgeata înseamnă același lucru peste tot. Desenat pe ecran,
 * vârful are mereu aceeași mărime aparentă — ca la o săgeată dintr-un desen
 * tehnic.
 */
export function Sageata3D({
  de,
  la,
  rol = "interval",
  eticheta,
  grosime = 2.5,
  varf = 11,
  opacitate = 1,
}: Sageata3DProps) {
  const { proiectie, idTaiere } = useScena3D();

  const a = proiectie.laEcran(de);
  const b = proiectie.laEcran(la);
  if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) return null;

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lungime = Math.hypot(dx, dy);
  // Un segment care se vede din muchie (proiectat aproape într-un punct) n-are
  // direcție pe ecran: nu se poate desena vârful și nu spune nimic oricum.
  if (lungime < 1e-3) return null;

  const ux = dx / lungime;
  const uy = dy / lungime;
  // Vârful nu poate fi mai lung decât săgeata.
  const lungimeVarf = Math.min(varf, lungime * 0.6);
  // Corpul se oprește puțin înaintea bazei vârfului, ca să nu iasă prin el.
  const capat = { x: b.x - ux * lungimeVarf * 0.85, y: b.y - uy * lungimeVarf * 0.85 };

  const latime = lungimeVarf * 0.5;
  const baza = { x: b.x - ux * lungimeVarf, y: b.y - uy * lungimeVarf };
  // Normala pe direcția de ecran, pentru cele două colțuri ale vârfului.
  const nx = -uy;
  const ny = ux;
  const varfulD =
    `M ${b.x} ${b.y} ` +
    `L ${baza.x + nx * latime} ${baza.y + ny * latime} ` +
    `L ${baza.x - nx * latime} ${baza.y - ny * latime} Z`;

  const culoare = culoareRol(rol);
  const deplasare = eticheta ? deplasareRadiala(proiectie, b, 18) : null;

  return (
    <g aria-hidden="true" clipPath={`url(#${idTaiere})`}>
      <line
        x1={a.x}
        y1={a.y}
        x2={capat.x}
        y2={capat.y}
        stroke={culoare}
        strokeOpacity={opacitate}
        strokeWidth={grosime}
        strokeLinecap="round"
      />
      <path d={varfulD} fill={culoare} fillOpacity={opacitate} />

      {eticheta && deplasare && (
        <text
          x={(a.x + b.x) / 2 + deplasare.dx}
          y={(a.y + b.y) / 2 + deplasare.dy}
          dy="0.32em"
          textAnchor={deplasare.ancora}
          className="font-mono text-[15px] tabular-nums"
          // Numele se scrie cu varianta de text a rolului: culoarea de desen e
          // calibrată pentru 3:1, nu pentru 4,5:1.
          fill={culoareEticheta(rol)}
          fillOpacity={opacitate}
          stroke="var(--suprafata)"
          strokeWidth={5}
          paintOrder="stroke"
        >
          {eticheta}
        </text>
      )}
    </g>
  );
}
