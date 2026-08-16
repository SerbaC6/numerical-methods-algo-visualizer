import { usePlot } from "@/components/viz/plot-context";
import { culoareRol } from "@/lib/viz-roles";

export type BucataRecursie = {
  a: number;
  b: number;
  /** Al câtelea nivel de tăiere: `0` e intervalul întreg. */
  nivel: number;
  /** Bucata a trecut testul, deci nu se mai taie? */
  acceptat: boolean;
};

export type PlotBandaRecursieProps = {
  bucati: readonly BucataRecursie[];
  /** Câte bucăți s-au cercetat până acum — restul nu se desenează încă. */
  panaLa?: number;
  /** Bucata de la pasul curent, evidențiată. */
  activa?: number;
};

/** Cât de înalt e un rând al benzii, în pixeli SVG. */
const INALTIME_RAND = 7;
const SPATIU_RAND = 4;

/**
 * Arborele de tăieri al unei cuadraturi adaptive, desenat ca **benzi
 * suprapuse** în josul graficului: un rând pentru fiecare nivel de recursie, iar
 * pe rând, câte un segment pentru fiecare bucată cercetată la nivelul acela.
 *
 * De ce așa și nu ca linii verticale peste desen: la o toleranță mică se ajunge
 * la zeci de tăieri, iar o linie verticală pentru fiecare ar acoperi tocmai
 * curba despre care e vorba. Pe benzi se citește direct ce interesează — **unde**
 * s-a înghesuit metoda și **cât de adânc** a mers acolo — fără să atingă figura.
 *
 * Bucățile acceptate sunt pline, cele tăiate mai departe rămân transparente: așa
 * se vede că un rând continuă în cel de sub el.
 */
export function PlotBandaRecursie({ bucati, panaLa, activa }: PlotBandaRecursieProps) {
  const plot = usePlot();
  const vizibile = bucati.slice(0, panaLa ?? bucati.length);
  if (vizibile.length === 0) return null;

  const niveluri = Math.max(...vizibile.map((b) => b.nivel)) + 1;
  const inaltime = niveluri * (INALTIME_RAND + SPATIU_RAND);
  const bazaJos = plot.zona.jos - 2;

  return (
    <g aria-hidden="true">
      <rect
        x={plot.zona.stanga}
        y={bazaJos - inaltime}
        width={plot.zona.dreapta - plot.zona.stanga}
        height={inaltime}
        fill="var(--fundal)"
        opacity={0.55}
      />
      {vizibile.map((bucata, i) => {
        const stanga = plot.x.la(bucata.a);
        const dreapta = plot.x.la(bucata.b);
        const y = bazaJos - (bucata.nivel + 1) * (INALTIME_RAND + SPATIU_RAND) + SPATIU_RAND;
        const esteActiva = i === activa;
        return (
          <rect
            key={`${bucata.nivel}-${bucata.a}`}
            x={stanga + 0.5}
            y={y}
            width={Math.max(1.5, dreapta - stanga - 1)}
            height={INALTIME_RAND}
            rx={2}
            fill={culoareRol(esteActiva ? "interval" : bucata.acceptat ? "curent" : "anterior")}
            opacity={esteActiva ? 1 : bucata.acceptat ? 0.85 : 0.35}
          />
        );
      })}
    </g>
  );
}
