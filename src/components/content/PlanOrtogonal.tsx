import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";

/**
 * Planul cu axe, vectori și dreapta de oglindire — desenul comun al paginii 2.
 *
 * **De ce un `<g>`, nu un `<svg>`.** Aceleași cifre trebuie desenate în două
 * locuri cu ceasuri diferite: în clipuri, unde totul e funcție pură de timp, și
 * în interfața interactivă, unde vectorul se trage cu mouse-ul. Un `<g>`
 * parametrizat intră în amândouă fără să-și aducă propriul viewBox, deci
 * reflexia arată la fel în clip și sub deget — altfel ar fi două desene care
 * trebuie ținute sincronizate cu mâna.
 *
 * Nu conține matematică: primește vectorii deja calculați din
 * `src/algorithms/norme-si-ortogonalitate/`.
 */

export type Vector2 = readonly [number, number];

export type SageataPlan = {
  /** Vârful săgeții, în unități matematice. Coada e mereu în origine. */
  la: Vector2;
  rol: RolViz;
  eticheta?: string;
  /** 0 = invizibilă, 1 = deplină. Coada rămâne pe loc, doar vârful crește. */
  aparitie?: number;
  /** Linie punctată — pentru direcții care nu sunt vectori propriu-ziși. */
  punctata?: boolean;
};

export type PlanOrtogonalProps = {
  /** Centrul planului în coordonatele desenului care îl găzduiește. */
  centru: Vector2;
  /** Câte unități de desen are o unitate matematică. */
  scara: number;
  /** Câte unități matematice se văd de o parte și de alta a originii. */
  raza: number;
  sageti: readonly SageataPlan[];
  /**
   * Direcția dreptei de oglindire, dacă se desenează. E o **dreaptă**, nu un
   * vector: se trage în ambele sensuri, prin origine.
   */
  oglinda?: { directie: Vector2; aparitie?: number; eticheta?: string };
  /** Arcul dintre două direcții — rotația, la Givens. */
  arc?: { dela: Vector2; la: Vector2; aparitie?: number; eticheta?: string };
  /** Cercul de rază `‖v‖`: locul unde poate ajunge un vector fără să-și schimbe lungimea. */
  cerc?: { raza: number; aparitie?: number };
  /** Scara textului, ca la restul clipurilor. */
  st: number;
  opacitate?: number;
};

/** Vârful de săgeată, desenat ca triunghi plin. */
function VarfSageata({ la, unghi, culoare }: { la: Vector2; unghi: number; culoare: string }) {
  const L = 26;
  const l = 11;
  const puncte = [
    [la[0], la[1]],
    [
      la[0] - L * Math.cos(unghi) + l * Math.sin(unghi),
      la[1] - L * Math.sin(unghi) - l * Math.cos(unghi),
    ],
    [
      la[0] - L * Math.cos(unghi) - l * Math.sin(unghi),
      la[1] - L * Math.sin(unghi) + l * Math.cos(unghi),
    ],
  ];
  return <polygon points={puncte.map(([x, y]) => `${x},${y}`).join(" ")} fill={culoare} />;
}

export function PlanOrtogonal({
  centru,
  scara,
  raza,
  sageti,
  oglinda,
  arc,
  cerc,
  st,
  opacitate = 1,
}: PlanOrtogonalProps) {
  const [cx, cy] = centru;
  /** Din unități matematice în unități de desen. `y` se răstoarnă: pe ecran crește în jos. */
  const px = (v: Vector2): Vector2 => [cx + v[0] * scara, cy - v[1] * scara];
  const intindere = raza * scara;

  return (
    <g opacity={opacitate}>
      {/* Axele. Grilă discretă, ca vectorii să se citească pe ea fără s-o vadă. */}
      <g stroke={culoareRol("grila")} strokeWidth={2} opacity={0.5}>
        {Array.from({ length: 2 * raza + 1 }, (_, i) => i - raza).map((u) => (
          <g key={u}>
            <line x1={cx + u * scara} x2={cx + u * scara} y1={cy - intindere} y2={cy + intindere} />
            <line x1={cx - intindere} x2={cx + intindere} y1={cy + u * scara} y2={cy + u * scara} />
          </g>
        ))}
      </g>
      <g stroke="var(--text-slab)" strokeWidth={3}>
        <line x1={cx - intindere} x2={cx + intindere} y1={cy} y2={cy} />
        <line x1={cx} x2={cx} y1={cy - intindere} y2={cy + intindere} />
      </g>

      {cerc && cerc.aparitie !== 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={cerc.raza * scara}
          fill="none"
          stroke={culoareRol("grila")}
          strokeWidth={3}
          strokeDasharray="10 8"
          opacity={(cerc.aparitie ?? 1) * 0.9}
        />
      )}

      {/* Dreapta de oglindire: prin origine, în ambele sensuri. */}
      {oglinda && (oglinda.aparitie ?? 1) > 0 && (
        <g opacity={oglinda.aparitie ?? 1}>
          {(() => {
            const n = Math.hypot(oglinda.directie[0], oglinda.directie[1]) || 1;
            const u: Vector2 = [oglinda.directie[0] / n, oglinda.directie[1] / n];
            const capat = raza * 1.02;
            const [x1, y1] = px([u[0] * capat, u[1] * capat]);
            const [x2, y2] = px([-u[0] * capat, -u[1] * capat]);
            return (
              <>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={culoareRol("interval")}
                  strokeWidth={5}
                  strokeDasharray="14 10"
                />
                {oglinda.eticheta && (
                  <text
                    x={x1}
                    y={y1 - 18}
                    textAnchor="middle"
                    fill={culoareEticheta("interval")}
                    style={{ font: `700 ${30 * Math.min(st, 1.4)}px var(--font-mono)` }}
                  >
                    {oglinda.eticheta}
                  </text>
                )}
              </>
            );
          })()}
        </g>
      )}

      {/* Arcul rotației. */}
      {arc && (arc.aparitie ?? 1) > 0 && (
        <g opacity={arc.aparitie ?? 1}>
          {(() => {
            const r = scara * 0.9;
            const a0 = Math.atan2(arc.dela[1], arc.dela[0]);
            const a1 = Math.atan2(arc.la[1], arc.la[0]);
            const p0: Vector2 = [Math.cos(a0) * (r / scara), Math.sin(a0) * (r / scara)];
            const p1: Vector2 = [Math.cos(a1) * (r / scara), Math.sin(a1) * (r / scara)];
            const [x0, y0] = px(p0);
            const [x1, y1] = px(p1);
            let delta = a1 - a0;
            while (delta > Math.PI) delta -= 2 * Math.PI;
            while (delta < -Math.PI) delta += 2 * Math.PI;
            // În SVG y crește în jos, deci sensul trigonometric se inversează.
            const sweep = delta > 0 ? 0 : 1;
            return (
              <>
                <path
                  d={`M ${x0} ${y0} A ${r} ${r} 0 0 ${sweep} ${x1} ${y1}`}
                  fill="none"
                  stroke={culoareRol("interval")}
                  strokeWidth={5}
                />
                {arc.eticheta && (
                  <text
                    x={cx + Math.cos((a0 + a1) / 2) * r * 1.35}
                    y={cy - Math.sin((a0 + a1) / 2) * r * 1.35}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={culoareEticheta("interval")}
                    style={{ font: `700 ${30 * Math.min(st, 1.4)}px var(--font-mono)` }}
                  >
                    {arc.eticheta}
                  </text>
                )}
              </>
            );
          })()}
        </g>
      )}

      {sageti.map((s, i) => {
        const aparitie = s.aparitie ?? 1;
        if (aparitie <= 0) return null;
        const varf: Vector2 = [s.la[0] * aparitie, s.la[1] * aparitie];
        const [x, y] = px(varf);
        const unghi = Math.atan2(y - cy, x - cx);
        const culoare = culoareRol(s.rol);
        const lungime = Math.hypot(x - cx, y - cy);
        const corpEticheta = 32 * Math.min(st, 1.4);

        return (
          <g key={i}>
            <line
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={culoare}
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={s.punctata ? "12 9" : undefined}
            />
            {lungime > 30 && <VarfSageata la={[x, y]} unghi={unghi} culoare={culoare} />}
            {/* Eticheta stă dincolo de vârf, pe direcția săgeții — dar un vector
                culcat pe axă și-ar scrie numele **peste** linia axei, unde nu se
                mai citește („±‖v‖", „P·v", „G·v"). Când săgeata e aproape
                orizontală, numele se ridică deasupra ei, cu un rând întreg:
                ridicarea se ia din corpul literei, nu dintr-o constantă, ca să
                nu sară prea sus pe un desen mic și să atingă eticheta vecină. */}
            {s.eticheta && (
              <text
                x={x + Math.cos(unghi) * 42}
                y={
                  y +
                  Math.sin(unghi) * 42 -
                  (Math.abs(Math.sin(unghi)) < 0.3 ? corpEticheta * 1.05 : 0)
                }
                textAnchor="middle"
                dominantBaseline="central"
                fill={culoareEticheta(s.rol)}
                style={{ font: `700 ${corpEticheta}px var(--font-mono)` }}
              >
                {s.eticheta}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
