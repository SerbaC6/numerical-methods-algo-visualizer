import type { PasIterativ } from "@/algorithms/metode-iterative/tipuri";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";
import { cn } from "@/lib/utils";

export type RulareGrafic = {
  id: string;
  eticheta: string;
  rol: RolViz;
  pasi: readonly PasIterativ[];
};

export type GraficConvergentaProps = {
  rulari: readonly RulareGrafic[];
  /** Toleranța, desenată ca prag: sub linia asta metoda se oprește. */
  toleranta: number;
  /** Iterația la care e derularea acum, marcată vertical. */
  iteratiaCurenta: number;
  className?: string;
};

const W = 900;
const H = 380;
const MARGINE = { sus: 24, dreapta: 24, jos: 74, stanga: 92 };

/** Câte decade se arată pe verticală, în jos de la 10⁰. */
const DECADE_MINIME = 10;

/**
 * Eroarea pe iterații, pentru toate trei metodele deodată.
 *
 * **De ce scară logaritmică.** Eroarea scade cu un factor constant la fiecare
 * pas — chiar `ρ(G)` —, deci pe scară liniară toate curbele s-ar lipi de axă
 * după trei-patru iterații și n-ai mai vedea nimic. În logaritm, „se înmulțește
 * cu ρ" devine „coboară cu o pantă constantă", iar comparația dintre metode se
 * citește ca diferență de pantă. O metodă care diverge urcă, una blocată merge
 * orizontal.
 *
 * **De ce toate trei deodată.** Fiecare metodă separat n-ar spune nimic: cifra
 * are sens doar față de celelalte. Asta e chiar comparația cerută pentru pagină.
 *
 * Nu conține matematică: primește pașii deja calculați, ca restul pieselor de
 * desen.
 */
export function GraficConvergenta({
  rulari,
  toleranta,
  iteratiaCurenta,
  className,
}: GraficConvergentaProps) {
  const maxIteratii = Math.max(1, ...rulari.map((r) => r.pasi.length));

  // Domeniul pe verticală: de la cea mai mare eroare până la toleranță, cu cel
  // puțin zece decade, ca graficul să nu-și schimbe forma la fiecare tastă.
  const erori = rulari.flatMap((r) => r.pasi.map((p) => p.eroare)).filter((e) => e > 0);
  const maximLog = Math.ceil(Math.log10(Math.max(1, ...erori)));
  const minimLog = Math.min(
    Math.floor(Math.log10(Math.max(toleranta, 1e-16))) - 1,
    maximLog - DECADE_MINIME,
  );

  const latimeUtila = W - MARGINE.stanga - MARGINE.dreapta;
  const inaltimeUtila = H - MARGINE.sus - MARGINE.jos;

  const x = (iteratie: number) =>
    MARGINE.stanga + (latimeUtila * (iteratie - 1)) / Math.max(1, maxIteratii - 1);
  const y = (eroare: number) => {
    const log = Math.log10(Math.max(eroare, 10 ** minimLog));
    return MARGINE.sus + (inaltimeUtila * (maximLog - log)) / (maximLog - minimLog);
  };

  const decade: number[] = [];
  for (let e = maximLog; e >= minimLog; e -= Math.max(1, Math.round((maximLog - minimLog) / 6))) {
    decade.push(e);
  }

  const pasiX = Math.max(1, Math.ceil(maxIteratii / 8));
  const marcajeX = Array.from({ length: maxIteratii }, (_, i) => i + 1).filter(
    (i) => i === 1 || i % pasiX === 0,
  );

  return (
    <figure
      className={cn(
        "bg-suprafata border-bordura shadow-jos m-0 rounded-xl border p-4 sm:p-5",
        className,
      )}
    >
      <figcaption className="text-text-slab mb-3 text-base">
        Eroarea de oprire după fiecare iterație, pe scară logaritmică. Cu cât panta e mai abruptă,
        cu atât metoda se apropie mai repede.
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={descriere(rulari, toleranta)}
        className="block h-auto w-full"
      >
        {/* Decadele. Linia de grilă e discretă; eticheta ei e text, deci se
            scrie cu culoarea de text, nu cu cea de desen. */}
        {decade.map((e) => (
          <g key={e}>
            <line
              x1={MARGINE.stanga}
              x2={W - MARGINE.dreapta}
              y1={y(10 ** e)}
              y2={y(10 ** e)}
              stroke={culoareRol("grila")}
              strokeWidth={1}
              opacity={0.45}
            />
            <text
              x={MARGINE.stanga - 14}
              y={y(10 ** e)}
              textAnchor="end"
              dominantBaseline="central"
              fill="var(--text-slab)"
              style={{ font: "600 17px var(--font-mono)" }}
            >
              10{exponentText(e)}
            </text>
          </g>
        ))}

        {/* Pragul de oprire. */}
        <line
          x1={MARGINE.stanga}
          x2={W - MARGINE.dreapta}
          y1={y(toleranta)}
          y2={y(toleranta)}
          stroke="var(--text-slab)"
          strokeWidth={2}
          strokeDasharray="8 6"
        />
        <text
          x={W - MARGINE.dreapta}
          y={y(toleranta) - 12}
          textAnchor="end"
          fill="var(--text-slab)"
          style={{ font: "600 16px var(--font-sans)" }}
        >
          toleranța
        </text>

        {/* Axa iterațiilor. */}
        <line
          x1={MARGINE.stanga}
          x2={W - MARGINE.dreapta}
          y1={H - MARGINE.jos}
          y2={H - MARGINE.jos}
          stroke={culoareRol("grila")}
          strokeWidth={2}
        />
        {marcajeX.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - MARGINE.jos + 28}
            textAnchor="middle"
            fill="var(--text-slab)"
            style={{ font: "600 17px var(--font-mono)" }}
          >
            {i}
          </text>
        ))}
        <text
          x={MARGINE.stanga + latimeUtila / 2}
          y={H - 16}
          textAnchor="middle"
          fill="var(--text-slab)"
          style={{ font: "600 17px var(--font-sans)" }}
        >
          iterația
        </text>

        {/* Iterația la care e derularea acum. */}
        {iteratiaCurenta + 1 <= maxIteratii && (
          <line
            x1={x(iteratiaCurenta + 1)}
            x2={x(iteratiaCurenta + 1)}
            y1={MARGINE.sus}
            y2={H - MARGINE.jos}
            stroke={culoareRol("interval")}
            strokeWidth={3}
            opacity={0.7}
          />
        )}

        {rulari.map((r) => {
          if (r.pasi.length === 0) return null;
          const puncte = r.pasi
            .map((p, i) => `${x(i + 1).toFixed(2)},${y(p.eroare).toFixed(2)}`)
            .join(" ");
          return (
            <g key={r.id}>
              <polyline
                points={puncte}
                fill="none"
                stroke={culoareRol(r.rol)}
                strokeWidth={4}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {r.pasi.length === 1 && (
                <circle cx={x(1)} cy={y(r.pasi[0]!.eroare)} r={6} fill={culoareRol(r.rol)} />
              )}
            </g>
          );
        })}
      </svg>

      {/* Legenda graficului: numele metodei, în culoarea curbei ei. Culoarea de
          text, nu cea de desen — o literă are alt prag de contrast. */}
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {rulari.map((r) => (
          <li key={r.id} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-1 w-8 rounded-full"
              style={{ background: culoareRol(r.rol) }}
            />
            <span className="text-base" style={{ color: culoareEticheta(r.rol) }}>
              {r.eticheta}
            </span>
            <span className="text-text-slab font-mono text-base">
              {r.pasi.length === 0 ? "—" : `${r.pasi.length} it.`}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

const CIFRE_SUS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "-": "⁻",
};

function exponentText(e: number): string {
  return [...String(e)].map((c) => CIFRE_SUS[c] ?? c).join("");
}

/** Ce spune graficul, în cuvinte — pentru cine nu-l vede. */
function descriere(rulari: readonly RulareGrafic[], toleranta: number): string {
  const parti = rulari.map((r) => {
    if (r.pasi.length === 0) return `${r.eticheta} nu a produs nicio iterație`;
    const ultima = r.pasi.at(-1)!;
    const ajuns = ultima.eroare < toleranta;
    return `${r.eticheta}: ${r.pasi.length} ${r.pasi.length === 1 ? "iterație" : "de iterații"}, ${
      ajuns ? "sub toleranță" : `eroarea rămâne ${ultima.eroare.toExponential(2)}`
    }`;
  });
  return `Eroarea pe iterații, scară logaritmică. ${parti.join("; ")}.`;
}
