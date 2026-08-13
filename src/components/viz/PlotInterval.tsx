import { usePlot } from "@/components/viz/plot-context";
import { culoareRol, type RolViz } from "@/lib/viz-roles";

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
const CARLIG = 10;
/** Sub atâția pixeli lățime, numele capetelor se mută în afara benzii, ca să nu se calce. */
const BANDA_INGUSTA = 72;
/** Lățimea aproximativă a unui caracter mono de 13px — pentru încadrarea etichetelor. */
const LATIME_CARACTER = 7.8;

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

  /** Un capăt întreg: linie verticală, cârlige, punct pe bază, nume. */
  const capat = (px: number, semn: 1 | -1, nume?: string) => (
    <g
      transform={`translate(${px.toFixed(2)} 0)`}
      style={{ transition: tranzitieCapat }}
      stroke={culoare}
      strokeOpacity={opacitate}
    >
      <line x1={0} x2={0} y1={plot.zona.sus} y2={plot.zona.jos} strokeWidth={2.5} />
      {/* Cârligele arată încotro se închide paranteza: `[` la stânga, `]` la dreapta. */}
      <line
        x1={0}
        x2={semn * CARLIG}
        y1={plot.zona.sus + 1}
        y2={plot.zona.sus + 1}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <line
        x1={0}
        x2={semn * CARLIG}
        y1={plot.zona.jos - 1}
        y2={plot.zona.jos - 1}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Punctul de pe linia de bază: exact valoarea de pe axă la care se rupe
          intervalul. Inelul în culoarea suprafeței îl ține vizibil și când cade
          peste curbă. */}
      <circle
        cx={0}
        cy={yBaza}
        r={4}
        fill={culoare}
        fillOpacity={opacitate}
        stroke="var(--suprafata)"
        strokeWidth={2}
      />
      {nume && (
        <text
          x={(inafara ? -semn : semn) * 8}
          y={plot.zona.jos - 8}
          textAnchor={(inafara ? -semn : semn) === 1 ? "start" : "end"}
          className="font-mono text-[13px] font-semibold tabular-nums"
          fill={culoare}
          fillOpacity={opacitate}
          stroke="var(--suprafata)"
          strokeWidth={3.5}
          paintOrder="stroke"
        >
          {nume}
        </text>
      )}
    </g>
  );

  // Textul din capul benzii se scrie doar dacă încape între capete; altfel ar
  // ieși peste ele și ar deveni ilizibil tocmai când intervalul e mic.
  const incapeEticheta = eticheta ? latime > eticheta.length * LATIME_CARACTER + 12 : false;

  return (
    <g clipPath={`url(#${plot.idTaiere})`} aria-hidden="true">
      {/* Umbrirea benzii — doar cât să se vadă care zonă e „înăuntru". */}
      <rect
        x={stanga}
        y={plot.zona.sus}
        width={latime}
        height={Math.max(0, plot.zona.jos - plot.zona.sus)}
        fill={culoare}
        fillOpacity={0.18 * opacitate}
        style={{ transition: tranzitie }}
      />

      {capat(stanga, 1, etichetaDe)}
      {capat(dreapta, -1, etichetaLa)}

      {eticheta && incapeEticheta && (
        <text
          x={(stanga + dreapta) / 2}
          y={plot.zona.sus + 15}
          textAnchor="middle"
          className="font-mono text-[13px] font-semibold tabular-nums"
          fill="var(--text)"
          stroke="var(--suprafata)"
          strokeWidth={3.5}
          paintOrder="stroke"
        >
          {eticheta}
        </text>
      )}
    </g>
  );
}
