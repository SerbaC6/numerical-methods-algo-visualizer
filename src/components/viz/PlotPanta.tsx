import { usePlot } from "@/components/viz/plot-context";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";

export type PlotPantaProps = {
  /** Colțul din care pleacă triunghiul — punctul de sprijin al dreptei. */
  de: { x: number; y: number };
  /**
   * Celălalt colț. La secantă e chiar al doilea punct de sprijin, deci
   * triunghiul e literal `x₁ − x₀` pe orizontală și `f(x₁) − f(x₀)` pe
   * verticală — cele două diferențe din formulă.
   */
  la: { x: number; y: number };
  /** Valoarea pantei, scrisă lângă cateta verticală. */
  eticheta?: string;
  rol?: RolViz;
  opacitate?: number;
};

/** Lățimea aproximativă a unui caracter mono de 15px. */
const LATIME_CARACTER = 9;
/** Cât stă eticheta de cateta verticală. */
const DISTANTA_ETICHETA = 9;

/**
 * Triunghiul care arată **unde e panta** pe desen.
 *
 * Fără el, panta e doar un număr din propoziția de sub grafic: „secanta are
 * panta 0,1148" — adevărat, dar nu se vede nicăieri de unde vine. Triunghiul o
 * face vizibilă ca ce este: cât urcă dreapta (cateta verticală) raportat la cât
 * se deplasează pe orizontală (cateta orizontală).
 *
 * La secantă cele două catete sunt **exact** numărătorul și numitorul din
 * formulă, deci evidențierea din `FormulaBlock` și desenul arată același lucru.
 * La tangentă nu există un al doilea punct dat de metodă, așa că deplasarea pe
 * orizontală e aleasă cât să se vadă — panta rămâne însă cea calculată de
 * algoritm, nu una măsurată de aici.
 *
 * Catetele sunt subțiri și punctate: sunt o construcție ajutătoare, nu o
 * mărime a problemei. Dacă ar fi la fel de groase ca dreapta, ar concura cu ea.
 *
 * **Culoarea e a iterației curente, nu a celor trecute.** Dreapta de
 * construcție și punctele ei de sprijin vin din pașii dinainte, deci poartă
 * `anterior`; panta însă e o mărime calculată *acum*, ca și tăietura cu axa și
 * punctul nou. Desenat tot în `anterior`, triunghiul se topea în dreapta
 * punctată peste care stă — aceeași nuanță, aceeași grosime, același model de
 * liniuțe. Așa, desenul se împarte curat în două: de unde venim și ce am aflat
 * la pasul acesta.
 */
export function PlotPanta({ de, la, eticheta, rol = "curent", opacitate = 1 }: PlotPantaProps) {
  const plot = usePlot();

  if (![de.x, de.y, la.x, la.y].every(Number.isFinite)) return null;

  const x0 = plot.x.la(de.x);
  const y0 = plot.y.la(de.y);
  const x1 = plot.x.la(la.x);
  const y1 = plot.y.la(la.y);

  // Sub câțiva pixeli triunghiul devine un ghem de linii care ascunde punctul
  // în loc să explice ceva. Se întâmplă la ultimele iterații, unde pașii sunt
  // minusculi — și acolo panta oricum nu mai e informația interesantă.
  if (Math.abs(x1 - x0) < 26 || Math.abs(y1 - y0) < 6) return null;

  const culoare = culoareRol(rol);
  // Colțul drept al triunghiului: mergem pe orizontală, apoi pe verticală.
  const colt = { x: x1, y: y0 };

  // Eticheta stă centrată pe cateta orizontală, **în afara** triunghiului:
  // dacă verticala urcă, eticheta coboară, și invers. Lângă cateta verticală
  // ar fi fost locul firesc, dar acolo cade chiar numele punctului de sprijin
  // („x₀"), iar cele două se suprapuneau.
  const verticalaUrca = y1 < y0;
  const yEticheta = y0 + (verticalaUrca ? DISTANTA_ETICHETA + 12 : -(DISTANTA_ETICHETA + 6));

  // Estimare de lățime, nu măsurătoare: măsurarea ar cere o randare în plus.
  const jumatateEticheta = ((eticheta?.length ?? 0) * LATIME_CARACTER) / 2;
  const xEticheta = Math.max(
    plot.zona.stanga + jumatateEticheta,
    Math.min(plot.zona.dreapta - jumatateEticheta, (x0 + colt.x) / 2),
  );

  // Dacă triunghiul a ieșit din cadru cu totul, eticheta lui n-are ce însoți.
  const inCadru =
    yEticheta > plot.zona.sus &&
    yEticheta < plot.zona.jos &&
    Math.max(x0, colt.x) > plot.zona.stanga &&
    Math.min(x0, colt.x) < plot.zona.dreapta;

  return (
    <g aria-hidden="true">
      {/* Catetele se taie la marginile zonei, ca orice desen. */}
      <g
        clipPath={`url(#${plot.idTaiere})`}
        stroke={culoare}
        strokeWidth={2}
        strokeOpacity={0.85 * opacitate}
        strokeDasharray="5 4"
        strokeLinecap="round"
        fill="none"
      >
        <line x1={x0} y1={y0} x2={colt.x} y2={colt.y} />
        <line x1={colt.x} y1={colt.y} x2={x1} y2={y1} />
      </g>

      {/* Eticheta **nu** se taie: la fel ca numele capetelor de interval, ea
          e text despre desen, iar jumătate de cuvânt („pant…") nu spune
          nimic. Se mută înăuntru și, dacă tot nu încape, nu se scrie deloc. */}
      {eticheta && inCadru && (
        <text
          x={xEticheta}
          y={yEticheta}
          dy="0.32em"
          textAnchor="middle"
          className="font-mono text-[15px] tabular-nums"
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
