import { usePlot } from "@/components/viz/plot-context";
import type { Punct } from "@/lib/plot-esantionare";
import { taieLaDreptunghi } from "@/lib/plot-scara";
import { culoareRol, type RolViz } from "@/lib/viz-roles";

type Comun = {
  rol?: RolViz;
  grosime?: number;
  punctata?: boolean;
  opacitate?: number;
};

/**
 * Ori un punct și o pantă (tangenta lui Newton), ori două puncte prin care trece
 * (secanta). Tipul le ține separate, ca să nu se poată trimite jumătate din
 * fiecare.
 */
export type PlotDreaptaProps = Comun &
  (
    | { prin: Punct; panta: number; intre?: never }
    | { intre: readonly [Punct, Punct]; prin?: never; panta?: never }
  );

/**
 * Dreapta de construcție a unei metode: tangenta la Newton, secanta la metoda
 * secantei.
 *
 * Se desenează pe toată lățimea cadrului, nu doar între punctele date, fiindcă
 * ce contează didactic e **unde taie axa** — acolo cade iterația următoare.
 *
 * Direcția se calculează în pixeli, nu în coordonate matematice: așa o pantă
 * uriașă rămâne o direcție obișnuită, iar dreptele verticale (secantă prin două
 * puncte cu același `x`) nu cer niciun caz special.
 */
export function PlotDreapta(props: PlotDreaptaProps) {
  const { rol = "curent", grosime = 1.5, punctata = false, opacitate = 1 } = props;
  const plot = usePlot();

  let p0: { x: number; y: number };
  let directie: { x: number; y: number };

  if (props.intre) {
    const [a, b] = props.intre;
    if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) return null;
    p0 = { x: plot.x.la(a.x), y: plot.y.la(a.y) };
    directie = { x: plot.x.la(b.x) - p0.x, y: plot.y.la(b.y) - p0.y };
    // Două puncte identice nu definesc o dreaptă.
    if (Math.abs(directie.x) < 1e-12 && Math.abs(directie.y) < 1e-12) return null;
  } else {
    const { prin, panta } = props;
    if (!Number.isFinite(prin.x) || !Number.isFinite(prin.y)) return null;
    p0 = { x: plot.x.la(prin.x), y: plot.y.la(prin.y) };

    if (Number.isNaN(panta)) return null;
    if (!Number.isFinite(panta)) {
      // Pantă infinită — tangentă verticală. E o direcție validă, nu o eroare.
      directie = { x: 0, y: 1 };
    } else {
      // O unitate pe orizontală, `panta` unități pe verticală, măsurate în
      // pixeli prin aceeași scară cu care se desenează tot restul.
      directie = {
        x: plot.x.la(prin.x + 1) - p0.x,
        y: plot.y.la(prin.y + panta) - p0.y,
      };
    }
  }

  const capete = taieLaDreptunghi(p0, directie, plot.zona);
  if (!capete) return null;

  const [inceput, sfarsit] = capete;

  return (
    <g aria-hidden="true">
      <line
        x1={inceput.x}
        y1={inceput.y}
        x2={sfarsit.x}
        y2={sfarsit.y}
        stroke={culoareRol(rol)}
        strokeWidth={grosime}
        strokeOpacity={opacitate}
        strokeDasharray={punctata ? "6 4" : undefined}
        strokeLinecap="round"
      />
    </g>
  );
}
