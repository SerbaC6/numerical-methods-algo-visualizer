import { usePlot } from "@/components/viz/plot-context";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";

export type PlotIntervalProps = {
  de: number;
  la: number;
  rol?: RolViz;
  /** Textul din capul benzii: „[aₖ, bₖ]". */
  eticheta?: string;
  /** Numele capătului din stânga: „a", „aₖ". Se scrie chiar lângă marcaj. */
  etichetaDe?: string;
  /** Numele capătului din dreapta: „b", „bₖ". */
  etichetaLa?: string;
  opacitate?: number;
};

/** Cât iese în lateral cârligul de sus și de jos al parantezei, în pixeli. */
const CARLIG = 13;
/** Sub atâția pixeli lățime, numele capetelor se mută în afara benzii, ca să nu se calce. */
const BANDA_INGUSTA = 92;
/** Lățimea aproximativă a unui caracter mono de 17px — pentru încadrarea numelor de capete. */
const LATIME_CARACTER = 10.2;
/** Aceeași măsură pentru textul din capul benzii, care e scris cu un corp mai mic (15px). */
const LATIME_CARACTER_BANDA = 9;

/**
 * Intervalul de căutare, marcat ca o **paranteză** cu capete vizibile.
 *
 * Banda propriu-zisă e doar o umbrire subțire: dacă ar fi plină, ar înghiți
 * curba și punctele de iterație exact în zona care contează. Informația
 * adevărată — unde începe și unde se termină intervalul — o poartă capetele:
 * o linie verticală groasă, cârligele de sus și de jos (ca la `[` și `]`), un
 * punct pe linia de bază și numele capătului scris lângă el.
 *
 * La bisecție, tocmai strângerea ei e metoda: la fiecare pas banda se
 * înjumătățește. De aceea marginile ei se mută cu tranziție, nu sar — regula 7
 * din `docs/referinte.md`: obiectul se transformă, nu se taie și reapare.
 *
 * Tranziția se pune pe atribute, care merg în orice browser; acolo unde
 * proprietățile geometrice SVG sunt animabile, banda alunecă, iar unde nu, se
 * mută instant. În ambele cazuri desenul e corect. Tăierea globală a duratelor
 * pentru `prefers-reduced-motion` din `index.css` o oprește oricum.
 */
export function PlotInterval({
  de,
  la,
  rol = "interval",
  eticheta,
  etichetaDe,
  etichetaLa,
  opacitate = 1,
}: PlotIntervalProps) {
  const plot = usePlot();
  const culoare = culoareRol(rol);
  // Numele capetelor se scriu cu varianta de text a rolului — vezi PlotPunct.
  const culoareText = culoareEticheta(rol);

  // Capetele pot veni în orice ordine; o lățime negativă nu s-ar desena deloc.
  const stanga = plot.x.la(Math.min(de, la));
  const dreapta = plot.x.la(Math.max(de, la));
  const latime = Math.max(0, dreapta - stanga);

  // Linia de bază pe care stau punctele capetelor: axa Ox dacă e în cadru,
  // altfel marginea de jos a zonei. Aceeași alegere ca la proiecția din
  // `PlotPunct`, ca cele două desene să nu spună lucruri diferite.
  const zeroVizibil = plot.y.domeniu[0] <= 0 && 0 <= plot.y.domeniu[1];
  const yBaza = zeroVizibil ? plot.y.la(0) : plot.zona.jos;

  const tranzitie =
    "x var(--duration-mediu) var(--ease-standard), width var(--duration-mediu) var(--ease-standard)";
  const tranzitieCapat = "transform var(--duration-mediu) var(--ease-standard)";

  // Pe bandă îngustă numele capetelor n-au loc înăuntru și s-ar suprapune, deci
  // ies în afara parantezei — fiecare pe partea lui.
  const inafara = latime < BANDA_INGUSTA;

  /**
   * Pe ce parte a liniei se scrie numele capătului: `1` la dreapta ei, `-1` la
   * stânga. Înăuntrul parantezei când încape, în afară când banda e prea
   * îngustă — dar niciodată în afara graficului, unde textul ar fi retezat de
   * marginea SVG-ului.
   */
  const parteaNumelui = (px: number, semn: 1 | -1): 1 | -1 => {
    if (!inafara) return semn;
    const inafaraCade = (-semn * LATIME_CARACTER * 3 + px) as number;
    const incape = inafaraCade > 4 && inafaraCade < plot.latimeTotala - 4;
    return incape ? (-semn as 1 | -1) : semn;
  };

  /** Un capăt întreg: linie verticală, cârlige, punct pe bază, nume. */
  const capat = (px: number, semn: 1 | -1, nume?: string) => (
    <g
      transform={`translate(${px.toFixed(2)} 0)`}
      style={{ transition: tranzitieCapat }}
      stroke={culoare}
      strokeOpacity={opacitate}
    >
      <line x1={0} x2={0} y1={plot.zona.sus} y2={plot.zona.jos} strokeWidth={3} />
      {/* Cârligele arată încotro se închide paranteza: `[` la stânga, `]` la dreapta. */}
      <line
        x1={0}
        x2={semn * CARLIG}
        y1={plot.zona.sus + 1}
        y2={plot.zona.sus + 1}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <line
        x1={0}
        x2={semn * CARLIG}
        y1={plot.zona.jos - 1}
        y2={plot.zona.jos - 1}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Punctul de pe linia de bază: exact valoarea de pe axă la care se rupe
          intervalul. Inelul în culoarea suprafeței îl ține vizibil și când cade
          peste curbă. */}
      <circle
        cx={0}
        cy={yBaza}
        r={6}
        fill={culoare}
        fillOpacity={opacitate}
        stroke="var(--suprafata)"
        strokeWidth={2.5}
      />
      {nume && (
        <text
          x={parteaNumelui(px, semn) * 11}
          y={plot.zona.jos - 8}
          textAnchor={parteaNumelui(px, semn) === 1 ? "start" : "end"}
          className="font-mono text-[17px] tabular-nums"
          fill={culoareText}
          fillOpacity={opacitate}
          stroke="var(--suprafata)"
          strokeWidth={5}
          paintOrder="stroke"
        >
          {nume}
        </text>
      )}
    </g>
  );

  // Textul din capul benzii se scrie doar dacă încape între capete; altfel ar
  // ieși peste ele și ar deveni ilizibil tocmai când intervalul e mic.
  const incapeEticheta = eticheta ? latime > eticheta.length * LATIME_CARACTER_BANDA + 12 : false;

  // Un capăt se desenează doar dacă valoarea lui chiar e în cadru. Tăiat la
  // margine ar arăta ca un capăt care stă exact acolo, ceea ce ar fi fals: după
  // o tragere a graficului, intervalul poate începe mult în afara ecranului.
  const inCadru = (px: number) => px >= plot.zona.stanga - 0.5 && px <= plot.zona.dreapta + 0.5;

  return (
    <g aria-hidden="true">
      {/* Umbrirea benzii — doar cât să se vadă care zonă e „înăuntru". Ea se
          taie la marginile zonei, altfel s-ar întinde peste etichetele axelor. */}
      <g clipPath={`url(#${plot.idTaiere})`}>
        <rect
          x={stanga}
          y={plot.zona.sus}
          width={latime}
          height={Math.max(0, plot.zona.jos - plot.zona.sus)}
          fill={culoare}
          fillOpacity={0.14 * opacitate}
          style={{ transition: tranzitie }}
        />

        {eticheta && incapeEticheta && (
          <text
            x={(stanga + dreapta) / 2}
            y={plot.zona.sus + 18}
            textAnchor="middle"
            className="font-mono text-[15px] tabular-nums"
            fill="var(--text)"
            stroke="var(--suprafata)"
            strokeWidth={5}
            paintOrder="stroke"
          >
            {eticheta}
          </text>
        )}
      </g>

      {/* Capetele stau **în afara** tăierii, fiindcă ele sunt informația care
          contează. Un capăt care cade fix pe marginea zonei — cazul obișnuit la
          primul pas al bisecției, unde intervalul e tot domeniul — ar rămâne cu
          jumătate de linie tăiată și cu numele lui șters cu totul. */}
      {inCadru(stanga) && capat(stanga, 1, etichetaDe)}
      {inCadru(dreapta) && capat(dreapta, -1, etichetaLa)}
    </g>
  );
}
